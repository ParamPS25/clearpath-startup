import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

type RequestWithUser = Request & { user?: { sub?: string } };

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const user = request.user?.sub ? ` user=${request.user.sub}` : '';
        this.logger.log(
          `${method} ${originalUrl}${user} ${Date.now() - start}ms`,
        );
      }),
      catchError((err: { status?: number; message?: string }) => {
        const user = request.user?.sub ? ` user=${request.user.sub}` : '';
        const status = err?.status ?? 500;
        this.logger.error(
          `${method} ${originalUrl}${user} ${status} ${Date.now() - start}ms - ${err?.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}
