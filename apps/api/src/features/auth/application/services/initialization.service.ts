import { Injectable, OnModuleInit } from '@nestjs/common';
import { SeedService } from './seed.service';

@Injectable()
export class InitializationService implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    try {
      await this.seedService.seedDatabase();
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      // 프로덕션에서는 에러를 던지지 않고 로그만 남김
      if (process.env.NODE_ENV === 'production') {
        console.error('Database seeding failed in production, continuing...');
      } else {
        throw error;
      }
    }
  }
}
