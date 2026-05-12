import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = (exception as any)?.message || 'Internal server error';

    // Handle Mongoose VersionError (Optimistic Concurrency Control)
    if ((exception as any)?.name === 'VersionError') {
      httpStatus = HttpStatus.CONFLICT;
      message = 'Data has been modified by another user. Please refresh and try again.';
    }
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: message,
    };

    this.logger.error(
      `Exception: ${message} - Status: ${httpStatus} - Path: ${httpAdapter.getRequestUrl(ctx.getRequest())}`,
      (exception as any)?.stack,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
