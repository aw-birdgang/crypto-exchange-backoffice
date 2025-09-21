import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Request 타입 확장
interface RequestWithApiVersion extends Request {
  apiVersion?: string;
}

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: RequestWithApiVersion, res: Response, next: NextFunction) {
    // API 버전 헤더에서 버전 정보 추출
    const apiVersion = req.headers['api-version'] as string;
    const acceptVersion = req.headers['accept-version'] as string;
    
    // URL에서 버전 정보 추출 (예: /api/v1/auth/login)
    const urlVersion = this.extractVersionFromUrl(req.url);
    
    // 버전 정보를 request 객체에 추가
    req.apiVersion = apiVersion || acceptVersion || urlVersion || 'v1';
    
    // 응답 헤더에 현재 API 버전 추가
    res.setHeader('X-API-Version', req.apiVersion);
    
    next();
  }

  private extractVersionFromUrl(url: string): string | null {
    const versionMatch = url.match(/\/api\/(v\d+)\//);
    return versionMatch ? versionMatch[1] : null;
  }
}
