# Modules

Esta pasta contém todos os módulos da aplicação. Cada módulo segue o padrão de **Use Cases** com **interfaces magras**.

## Estrutura de um módulo

```
modules/
└── {nome-do-modulo}/
    ├── dto/
    │   ├── create-{nome}.dto.ts
    │   ├── update-{nome}.dto.ts
    │   ├── {nome}-response.dto.ts
    │   └── index.ts
    ├── entities/
    │   └── {nome}.entity.ts
    ├── use-cases/
    │   ├── interfaces.ts                    # Interfaces magras
    │   ├── create-{nome}.use-case.ts
    │   ├── create-{nome}.use-case.spec.ts
    │   ├── update-{nome}.use-case.ts
    │   ├── update-{nome}.use-case.spec.ts
    │   ├── delete-{nome}.use-case.ts
    │   ├── delete-{nome}.use-case.spec.ts
    │   ├── find-all-{nome}.use-case.ts
    │   ├── find-all-{nome}.use-case.spec.ts
    │   ├── find-one-{nome}.use-case.ts
    │   ├── find-one-{nome}.use-case.spec.ts
    │   └── index.ts
    ├── {nome}.controller.ts
    ├── {nome}.controller.spec.ts
    └── {nome}.module.ts
```

## ⚠️ Regras importantes

1. **NÃO** criar arquivo `*.service.ts` na raiz do módulo
2. **SEMPRE** usar use-cases na pasta `use-cases/`
3. **CADA** operação deve ter sua própria interface e implementação
4. **CADA** use-case deve ter seu próprio teste unitário

---

## Interfaces magras (Thin Interfaces)

O arquivo `interfaces.ts` define contratos simples com um único método `execute`:

```typescript
// use-cases/interfaces.ts
import { CreateUserDto, UpdateUserDto } from '../dto';
import { UserEntity } from '../entities/user.entity';

export interface CreateUserUseCase {
  execute(data: CreateUserDto): Promise<UserEntity>;
}

export interface UpdateUserUseCase {
  execute(id: number, data: UpdateUserDto): Promise<UserEntity>;
}

export interface DeleteUserUseCase {
  execute(id: number): Promise<void>;
}

export interface FindAllUsersUseCase {
  execute(): Promise<UserEntity[]>;
}

export interface FindOneUserUseCase {
  execute(id: number): Promise<UserEntity>;
}
```

---

## Implementação do Use Case

Cada use-case implementa sua interface correspondente:

```typescript
// use-cases/create-user.use-case.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto';
import { CreateUserUseCase } from './interfaces';

@Injectable()
export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(data: CreateUserDto): Promise<UserEntity> {
    const entity = this.userRepository.create(data);
    return this.userRepository.save(entity);
  }
}
```

---

## Teste unitário do Use Case

Cada use-case deve ter seu arquivo de teste:

```typescript
// use-cases/create-user.use-case.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserUseCaseImpl } from './create-user.use-case';
import { UserEntity } from '../entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCaseImpl;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCaseImpl,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCaseImpl>(CreateUserUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a user', async () => {
    const createDto = { name: 'John', email: 'john@example.com' };
    const mockUser = { id: 1, ...createDto };

    mockRepository.create.mockReturnValue(mockUser);
    mockRepository.save.mockResolvedValue(mockUser);

    const result = await useCase.execute(createDto);

    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });
});
```

---

## Controller usando Use Cases

O controller injeta os use-cases no construtor:

```typescript
// user.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import {
  CreateUserUseCaseImpl,
  UpdateUserUseCaseImpl,
  DeleteUserUseCaseImpl,
  FindAllUsersUseCaseImpl,
  FindOneUserUseCaseImpl,
} from './use-cases';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCaseImpl,
    private readonly updateUserUseCase: UpdateUserUseCaseImpl,
    private readonly deleteUserUseCase: DeleteUserUseCaseImpl,
    private readonly findAllUsersUseCase: FindAllUsersUseCaseImpl,
    private readonly findOneUserUseCase: FindOneUserUseCaseImpl,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  findAll() {
    return this.findAllUsersUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.findOneUserUseCase.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.deleteUserUseCase.execute(id);
  }
}
```

---

## Module registrando Use Cases

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import {
  CreateUserUseCaseImpl,
  UpdateUserUseCaseImpl,
  DeleteUserUseCaseImpl,
  FindAllUsersUseCaseImpl,
  FindOneUserUseCaseImpl,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    CreateUserUseCaseImpl,
    UpdateUserUseCaseImpl,
    DeleteUserUseCaseImpl,
    FindAllUsersUseCaseImpl,
    FindOneUserUseCaseImpl,
  ],
  exports: [
    CreateUserUseCaseImpl,
    UpdateUserUseCaseImpl,
    DeleteUserUseCaseImpl,
    FindAllUsersUseCaseImpl,
    FindOneUserUseCaseImpl,
  ],
})
export class UserModule {}
```

---

## Vantagens do padrão

1. **Single Responsibility**: Cada use-case tem uma única responsabilidade
2. **Testabilidade**: Fácil de testar cada operação isoladamente
3. **Manutenibilidade**: Alterações em uma operação não afetam outras
4. **Reutilização**: Use-cases podem ser usados em outros contextos (CLI, jobs, etc)
5. **Clean Architecture**: Separa regras de negócio da infraestrutura

---

## ❌ O que NÃO fazer

```typescript
// ❌ ERRADO: Arquivo service.ts na raiz do módulo
// user.service.ts
@Injectable()
export class UserService {
  create() { }
  findAll() { }
  findOne() { }
  update() { }
  remove() { }
}
```

```typescript
// ✅ CORRETO: Use-cases separados na pasta use-cases/
// use-cases/create-user.use-case.ts
// use-cases/find-all-users.use-case.ts
// use-cases/find-one-user.use-case.ts
// use-cases/update-user.use-case.ts
// use-cases/delete-user.use-case.ts
```
