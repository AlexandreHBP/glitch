/**
 * Cadastra uma nova conta de cliente (RF02). Admins nunca são criados por
 * este fluxo público — só via seed (ADMIN_EMAIL/ADMIN_PASSWORD).
 */
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { AuthResult, RegisterCustomer } from './interfaces';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class RegisterCustomerUseCase implements RegisterCustomer {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerCustomer(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('Já existe uma conta com este e-mail');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = this.userRepository.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.CUSTOMER,
      active: true,
    });
    await this.userRepository.save(user);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
