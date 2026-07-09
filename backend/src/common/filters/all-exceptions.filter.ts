import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { captureException } from '../observability/error-tracking'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message ||
          (exception instanceof Error ? exception.message : 'Internal server error')

    const requestId = response.getHeader?.('x-request-id') || request.headers['x-request-id']

    if (status >= 500) {
      captureException(exception, {
        requestId,
        method: request.method,
        path: request.originalUrl || request.url,
        statusCode: status,
      })
    }

    response.status(status).json({
      statusCode: status,
      message,
      requestId: requestId || null,
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
    })
  }
}
