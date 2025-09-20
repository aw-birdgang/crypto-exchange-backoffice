import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim();
    }
    
    if (typeof value === 'object' && value !== null) {
      // 객체의 모든 문자열 속성을 trim
      const trimmed = { ...value };
      for (const key in trimmed) {
        if (typeof trimmed[key] === 'string') {
          trimmed[key] = trimmed[key].trim();
        }
      }
      return trimmed;
    }
    
    return value;
  }
}
