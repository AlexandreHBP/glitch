/**
 * Grava arquivos de upload em disco com nome gerado pelo servidor (nunca
 * o nome do arquivo do usuário). Imagens são convertidas para webp,
 * redimensionadas para no máximo 1600px no maior lado (RF07 + notas de
 * performance da arquitetura).
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { fromBuffer as fileTypeFromBuffer } from 'file-type';

const MAX_IMAGE_DIMENSION = 1600;
const ALLOWED_AUDIO_MIME_TYPES = ['audio/mpeg'];

@Injectable()
export class UploadsService {
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = this.configService.get<string>('UPLOADS_DIR', 'uploads');
    this.ensureDir(path.join(this.uploadsDir, 'images'));
    this.ensureDir(path.join(this.uploadsDir, 'audio'));
  }

  async saveImage(buffer: Buffer): Promise<string> {
    const filename = `${randomUUID()}.webp`;
    const filePath = path.join(this.uploadsDir, 'images', filename);

    try {
      // O re-encode via sharp já é, por si só, uma validação de conteúdo:
      // bytes que não decodificam como imagem real derrubam aqui, não
      // chegam a virar arquivo. Isso descarta qualquer payload embutido
      // (polyglots, EXIF malicioso) mesmo que o Content-Type declarado
      // minta sobre o tipo do arquivo.
      await sharp(buffer)
        .resize({
          width: MAX_IMAGE_DIMENSION,
          height: MAX_IMAGE_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toFile(filePath);
    } catch {
      // Erro do sharp é sempre causado por entrada inválida do cliente
      // (arquivo corrompido ou que não é realmente uma imagem) — nunca
      // deveria surfacear como 500.
      throw new BadRequestException('Arquivo de imagem inválido ou corrompido');
    }

    return `/uploads/images/${filename}`;
  }

  async saveAudio(buffer: Buffer): Promise<string> {
    // Diferente da imagem (que é sempre re-codificada pelo sharp), o
    // áudio é gravado como veio — então o Content-Type declarado pelo
    // cliente não é suficiente: valida os magic bytes reais do buffer
    // antes de gravar, para impedir que HTML/qualquer coisa seja
    // hospedado sob a origem do backend disfarçado de .mp3.
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_AUDIO_MIME_TYPES.includes(detected.mime)) {
      throw new BadRequestException(
        'Arquivo não é um MP3 válido (conteúdo não corresponde ao tipo declarado)',
      );
    }

    const filename = `${randomUUID()}.mp3`;
    const filePath = path.join(this.uploadsDir, 'audio', filename);

    await fs.promises.writeFile(filePath, buffer);

    return `/uploads/audio/${filename}`;
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
