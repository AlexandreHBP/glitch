import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.usecase';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';

jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: { findOne: jest.Mock };
  let mockJwtService: { sign: jest.Mock };

  const activeUser: User = {
    id: 'user-1',
    name: 'Cliente Teste',
    email: 'cliente@example.com',
    passwordHash: 'hash-armazenado',
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserRepository = { findOne: jest.fn() };
    mockJwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve normalizar o e-mail (lowercase/trim) antes de consultar o banco', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      useCase.login('  Cliente@Example.com  ', 'qualquer'),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'cliente@example.com' },
    });
  });

  it('deve lançar UnauthorizedException com mensagem genérica quando o usuário não existe (não revela se o e-mail existe)', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      useCase.login('inexistente@example.com', 'senha'),
    ).rejects.toThrow('E-mail ou senha inválidos');
  });

  it('deve lançar UnauthorizedException quando o usuário está inativo, mesmo com senha correta', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      ...activeUser,
      active: false,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      useCase.login(activeUser.email, 'senha-correta'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException quando a senha não confere', async () => {
    mockUserRepository.findOne.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.login(activeUser.email, 'senha-errada'),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  it('deve retornar accessToken e dados do usuário (sem passwordHash) quando as credenciais são válidas', async () => {
    mockUserRepository.findOne.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.login(activeUser.email, 'senha-correta');

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      id: activeUser.id,
      name: activeUser.name,
      email: activeUser.email,
      role: activeUser.role,
    });
    expect(
      (result.user as Record<string, unknown>).passwordHash,
    ).toBeUndefined();
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: activeUser.id,
      email: activeUser.email,
      role: activeUser.role,
    });
  });
});
