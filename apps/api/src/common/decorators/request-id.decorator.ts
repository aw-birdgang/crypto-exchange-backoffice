import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * 요청 ID를 가져오거나 생성하는 데코레이터
 * @param ctx - 실행 컨텍스트
 * @returns 요청 ID
 * 
 * @example
 * @Get('test')
 * testEndpoint(@RequestId() requestId: string) {
 *   console.log('Request ID:', requestId);
 *   return { requestId };
 * }
 */
export const RequestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // 기존 요청 ID가 있으면 사용, 없으면 새로 생성
    if (request.headers['x-request-id']) {
      return request.headers['x-request-id'];
    }
    
    const requestId = randomUUID();
    request.headers['x-request-id'] = requestId;
    
    return requestId;
  },
);
