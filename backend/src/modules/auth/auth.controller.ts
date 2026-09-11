/**
 * Endpoints de autenticação: cadastro de cliente, login e dados da conta
 * logada. Login e registro são públicos e protegidos por rate limit
 * (5 tentativas/minuto por IP) contra força bruta.
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { LoginDto, RegisterDto } from './dto';
import {
  LoginUseCase,
  RegisterCustomerUseCase,
  GetCurrentUserUseCase,
} from './use-cases';

const LOGIN_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerCustomerUseCase: RegisterCustomerUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Public()
  @Throttle(LOGIN_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login de cliente ou administrador' })
  @ApiResponse({
    status: 200,
    description: 'Login efetuado, retorna accessToken',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas — aguarde e tente novamente',
  })
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.login(dto.email, dto.password);
  }

  @Public()
  @Throttle(LOGIN_THROTTLE)
  @Post('register')
  @ApiOperation({ summary: 'Cadastro de nova conta de cliente' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas — aguarde e tente novamente',
  })
  register(@Body() dto: RegisterDto) {
    return this.registerCustomerUseCase.registerCustomer(
      dto.name,
      dto.email,
      dto.password,
    );
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Dados da conta autenticada' })
  @ApiResponse({ status: 200, description: 'Dados do usuário autenticado' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.getCurrentUserUseCase.getCurrentUser(user.userId);
  }
}
