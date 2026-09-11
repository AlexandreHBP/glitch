/**
 * Cria (ou garante) a conta de administrador, lendo ADMIN_EMAIL e
 * ADMIN_PASSWORD do ambiente. Falha se ADMIN_PASSWORD não estiver
 * definida — nunca existe senha padrão no código (ver "Criação do admin"
 * da arquitetura).
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/enums/user-role.enum';

const BCRYPT_SALT_ROUNDS = 10;

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error(
      'ADMIN_EMAIL não está definido. Defina a variável de ambiente antes de rodar o seed.',
    );
  }
  if (!adminPassword) {
    throw new Error(
      'ADMIN_PASSWORD não está definida. Defina a variável de ambiente antes de rodar o seed.',
    );
  }

  const userRepository = dataSource.getRepository(User);
  const existing = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`[seed-admin] Admin "${adminEmail}" já existe, nada a fazer.`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS);
  const admin = userRepository.create({
    name: 'Administrador Glitch',
    email: adminEmail,
    passwordHash,
    role: UserRole.ADMIN,
    active: true,
  });
  await userRepository.save(admin);

  console.log(`[seed-admin] Admin "${adminEmail}" criado com sucesso.`);
}
