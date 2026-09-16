/**
 * Upload de imagem (catálogo) e áudio (playlist). Whitelist de mime-type,
 * limite de tamanho e nome de arquivo gerado pelo servidor — nunca o do
 * usuário (ver "Proteções mínimas" da arquitetura).
 */
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { UploadsService } from './uploads.service';

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const AUDIO_MAX_BYTES = 15 * 1024 * 1024;
const MODEL3D_MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg'];

interface UploadedFileLike {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@ApiTags('Admin - Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiOperation({ summary: 'Envia uma foto de produto (convertida para webp)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: IMAGE_MAX_BYTES },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedFileLike) {
    this.validateFile(file, ALLOWED_IMAGE_TYPES, 'imagem');
    const url = await this.uploadsService.saveImage(file.buffer);
    return { url };
  }

  @Post('audio')
  @ApiOperation({ summary: 'Envia uma faixa de áudio para a playlist' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AUDIO_MAX_BYTES },
    }),
  )
  async uploadAudio(@UploadedFile() file: UploadedFileLike) {
    this.validateFile(file, ALLOWED_AUDIO_TYPES, 'áudio');
    const url = await this.uploadsService.saveAudio(file.buffer);
    return { url };
  }

  @Post('model3d')
  @ApiOperation({
    summary:
      'Envia o modelo 3D (.glb) de um produto, para o visualizador giratório no site',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MODEL3D_MAX_BYTES },
    }),
  )
  async uploadModel3d(@UploadedFile() file: UploadedFileLike) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de modelo 3D enviado');
    }
    // Diferente de imagem/áudio, o Content-Type de .glb enviado por
    // navegador é inconsistente (varia entre "model/gltf-binary",
    // "application/octet-stream" ou vazio) — não vale a pena checar aqui.
    // A validação de verdade (magic bytes + tamanho declarado no header)
    // acontece em UploadsService.saveModel3d, nos bytes reais do arquivo.
    const url = await this.uploadsService.saveModel3d(file.buffer);
    return { url };
  }

  private validateFile(
    file: UploadedFileLike,
    allowedTypes: string[],
    kind: string,
  ): void {
    if (!file) {
      throw new BadRequestException(`Nenhum arquivo de ${kind} enviado`);
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido para ${kind}. Aceitos: ${allowedTypes.join(', ')}`,
      );
    }
  }
}
