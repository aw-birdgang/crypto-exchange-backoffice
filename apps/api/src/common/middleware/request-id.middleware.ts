import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 기존 요청 ID가 있으면 사용, 없으면 새로 생성
    const requestId = req.headers['x-request-id'] as string || randomUUID();
    
    // 요청과 응답에 요청 ID 추가
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    
    // 요청 객체에 요청 ID 추가 (데코레이터에서 사용)
    (req as any).requestId = requestId;
    
    next();
  }
}
