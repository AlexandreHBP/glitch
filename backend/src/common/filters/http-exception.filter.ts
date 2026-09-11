/**
 * Filtro global de exceções HTTP. Padroniza o formato de erro da API
 * (statusCode, message, error, path, timestamp) e garante que erros
 * inesperados não vazem stack trace nem detalhes internos ao cliente.
 *
 * Preserva campos extras do corpo da exceção (ex.: `items` no 409 de
 * estoque insuficiente do CreateOrderUseCase) — o frontend depende deles
 * para marcar item a item o que falhou no carrinho.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface KnownExceptionFields {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

const INTERNAL_SERVER_ERROR_STATUS: number = HttpStatus.INTERNAL_SERVER_ERROR;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.buildResponseBody(exception, request.url);

    if (body.statusCode >= INTERNAL_SERVER_ERROR_STATUS) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private buildResponseBody(
    exception: unknown,
    path: string,
  ): Record<string, unknown> & { statusCode: number } {
    const base = {
      path,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const rawResponse = exception.getResponse();

      if (typeof rawResponse === 'string') {
        return {
          ...base,
          statusCode: status,
          message: rawResponse,
          error: exception.name,
        };
      }

      const { message, error, ...extraFields } =
        rawResponse as KnownExceptionFields & Record<string, unknown>;

      return {
        ...base,
        ...extraFields,
        statusCode: status,
        message: message ?? exception.message,
        error: error ?? exception.name,
      };
    }

    return {
      ...base,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      error: 'InternalServerError',
    };
  }
}
