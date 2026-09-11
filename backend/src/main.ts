/**
 * Bootstrap da aplicação: prefixo /api/v1, ValidationPipe global, Swagger,
 * Helmet, CORS restrito às origens do painel admin e da loja pública,
 * arquivos estáticos de upload, e uma verificação de sanidade que recusa
 * subir a aplicação se JWT_SECRET não estiver configurado corretamente
 * (ver "Operação" nas notas de arquitetura).
 */
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'node:path';
import type { Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const EXAMPLE_JWT_SECRETS = [
  'your-super-secret-key-minimum-32-characters-long',
  'changeme',
  'secret',
];

function assertJwtSecretIsSafe(): void {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET não está definido. Configure uma chave forte antes de subir a aplicação.',
    );
  }

  if (EXAMPLE_JWT_SECRETS.includes(secret) || secret.length < 32) {
    throw new Error(
      'JWT_SECRET está com um valor de exemplo ou é curto demais (mínimo 32 caracteres). ' +
        'Gere uma chave aleatória forte para este ambiente.',
    );
  }
}

async function bootstrap() {
  assertJwtSecretIsSafe();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Helmet PRIMEIRO: `useStaticAssets` registra `express.static`
  // imediatamente no adapter Express, então qualquer resposta de
  // /uploads/* que saísse antes do helmet rodar nunca ganhava seus
  // headers de segurança (sem nosniff, sem CSP) — justamente o único
  // caminho que serve conteúdo enviado por usuário.
  app.use(helmet());
  app.disable('x-powered-by');

  const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads',
    setHeaders: (res: Response) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    },
  });

  const allowedOrigins = (
    process.env.CORS_ALLOWED_ORIGINS ??
    'http://localhost:5173,http://localhost:3001'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: allowedOrigins, credentials: true });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Glitch Loja Online - API')
    .setDescription(
      'Catálogo, pedidos, estoque, playlist e painel administrativo da loja Glitch',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger documentation: ${await app.getUrl()}/api/docs`);
}
void bootstrap();
