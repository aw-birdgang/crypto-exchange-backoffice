import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value === 'true' || value === '1') {
      return true;
    }
    
    if (value === 'false' || value === '0') {
      return false;
    }
    
    throw new BadRequestException(
      `Validation failed. "${value}" is not a valid boolean value. Expected "true", "false", "1", or "0".`
    );
  }
}
