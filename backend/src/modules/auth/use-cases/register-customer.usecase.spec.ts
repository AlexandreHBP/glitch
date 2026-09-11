import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterCustomerUseCase } from './register-customer.usecase';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';

jest.mock('bcrypt');

describe('RegisterCustomerUseCase', () => {
  let useCase: RegisterCustomerUseCase;
  let mockUserRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockJwtService: { sign: jest.Mock };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: Partial<User>) => data as User),
      // TypeORM's save() mutates the passed entity in place (assigns
      // generated columns like `id` onto the same reference) and the
      // use-case relies on that — it reads `user.id` from the original
      // object after awaiting save(), not from save()'s return value.
      save: jest.fn((data: User) => {
        data.id = 'new-user-id';
        return Promise.resolve(data);
      }),
    };
    mockJwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hash-gerado');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterCustomerUseCase,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    useCase = module.get<RegisterCustomerUseCase>(RegisterCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve lançar ConflictException quando já existe uma conta com o e-mail (normalizado)', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 'existing' } as User);

    await expect(
      useCase.registerCustomer(
        'Nome',
        '  Existing@Example.com  ',
        'SenhaForte123',
      ),
    ).rejects.toThrow(ConflictException);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'existing@example.com' },
    });
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('deve normalizar e-mail para lowercase/trim antes de gravar', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await useCase.registerCustomer(
      'Nome',
      '  Nova@Example.COM ',
      'SenhaForte123',
    );

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'nova@example.com' }),
    );
  });

  it('nunca deve permitir criar a conta com outro role além de CUSTOMER, mesmo que o chamador tente', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await useCase.registerCustomer(
      'Nome',
      'cliente@example.com',
      'SenhaForte123',
    );

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.CUSTOMER, active: true }),
    );
  });

  it('deve fazer hash da senha com bcrypt antes de persistir (nunca em texto puro)', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await useCase.registerCustomer(
      'Nome',
      'cliente@example.com',
      'SenhaForte123',
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('SenhaForte123', 10);
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hash-gerado' }),
    );
  });

  it('deve retornar accessToken e os dados públicos do novo usuário', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    const result = await useCase.registerCustomer(
      'Cliente Novo',
      'cliente@example.com',
      'SenhaForte123',
    );

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      id: 'new-user-id',
      name: 'Cliente Novo',
      email: 'cliente@example.com',
      role: UserRole.CUSTOMER,
    });
  });
});
