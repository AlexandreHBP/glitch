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

// glTF binário (.glb) começa com um header fixo de 12 bytes:
// magic (4 bytes ASCII "glTF"), version (uint32 LE) e length (uint32 LE,
// tamanho total do arquivo). A spec só define a versão 2 até hoje.
const GLB_MAGIC = 0x46546c67; // "glTF" lido como uint32 little-endian
const GLB_SUPPORTED_VERSION = 2;
const GLB_HEADER_SIZE = 12;

@Injectable()
export class UploadsService {
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = this.configService.get<string>('UPLOADS_DIR', 'uploads');
    this.ensureDir(path.join(this.uploadsDir, 'images'));
    this.ensureDir(path.join(this.uploadsDir, 'audio'));
    this.ensureDir(path.join(this.uploadsDir, 'models3d'));
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

  async saveModel3d(buffer: Buffer): Promise<string> {
    // Modelo 3D é gravado como veio (não há "reencode" possível como na
    // imagem), então a validação real precisa acontecer aqui, nos bytes
    // do arquivo — nunca confiando no Content-Type ou na extensão que o
    // cliente declarou. Um .glb genuíno tem magic bytes "glTF" seguidos de
    // versão e tamanho total (ver validateGlb).
    this.validateGlb(buffer);

    const filename = `${randomUUID()}.glb`;
    const filePath = path.join(this.uploadsDir, 'models3d', filename);

    await fs.promises.writeFile(filePath, buffer);

    return `/uploads/models3d/${filename}`;
  }

  /**
   * Valida o header binário do glTF 2.0 (.glb): 12 bytes fixos com magic
   * "glTF", versão e tamanho total do arquivo. O campo de tamanho precisa
   * bater exatamente com o tamanho real do buffer — um arquivo forjado
   * (ex: HTML/JS com 4 bytes "glTF" colados na frente) tem magic bytes
   * corretos mas falha nessa checagem.
   */
  private validateGlb(buffer: Buffer): void {
    if (!buffer || buffer.length < GLB_HEADER_SIZE) {
      throw new BadRequestException(
        'Arquivo não é um modelo .glb válido (menor que o header mínimo do glTF binário)',
      );
    }

    const magic = buffer.readUInt32LE(0);
    if (magic !== GLB_MAGIC) {
      throw new BadRequestException(
        'Arquivo não é um modelo .glb válido (magic bytes não correspondem ao glTF binário)',
      );
    }

    const version = buffer.readUInt32LE(4);
    if (version !== GLB_SUPPORTED_VERSION) {
      throw new BadRequestException(
        `Versão do glTF binário não suportada (esperado ${GLB_SUPPORTED_VERSION}, recebido ${version})`,
      );
    }

    const declaredLength = buffer.readUInt32LE(8);
    if (declaredLength !== buffer.length) {
      throw new BadRequestException(
        'Arquivo .glb corrompido ou adulterado: o tamanho declarado no header não bate com o tamanho real do arquivo',
      );
    }
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
