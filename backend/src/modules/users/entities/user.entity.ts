/**
 * Cliente e administrador na mesma tabela, separados por `role`.
 * Senha guardada como hash bcrypt, nunca sai do backend (@Exclude aqui +
 * ClassSerializerInterceptor global em main.ts).
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
