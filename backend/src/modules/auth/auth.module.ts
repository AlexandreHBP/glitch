import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  LoginUseCase,
  RegisterCustomerUseCase,
  GetCurrentUserUseCase,
} from './use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRATION',
            '7d',
          ) as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RegisterCustomerUseCase,
    GetCurrentUserUseCase,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
