import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [
    {
      provide: 'LOGGER_CONTEXT',
      useValue: 'Application',
    },
    LoggerService,
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
