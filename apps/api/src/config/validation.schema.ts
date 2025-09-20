import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),

  // Database Configuration
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Security Configuration
  BCRYPT_ROUNDS: Joi.number().min(10).max(15).default(12),
  API_RATE_LIMIT: Joi.number().min(10).max(1000).default(100),
  API_RATE_WINDOW: Joi.number().min(60000).max(3600000).default(900000), // 15 minutes

  // CORS Configuration
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  // Pagination Configuration
  DEFAULT_PAGE_SIZE: Joi.number().min(1).max(100).default(20),
  MAX_PAGE_SIZE: Joi.number().min(10).max(1000).default(100),

  // Redis Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().min(0).max(15).default(0),
});
