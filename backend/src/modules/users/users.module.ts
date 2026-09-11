/**
 * Módulo mínimo que expõe a entidade User para outros módulos
 * (auth, orders). Sem controller próprio — /me e o cadastro vivem em
 * AuthModule.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule],
})
export class UsersModule {}
