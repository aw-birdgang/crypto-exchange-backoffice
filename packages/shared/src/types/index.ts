export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TRADER = 'trader',
}

export enum OrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  PARTIALLY_FILLED = 'partially_filled',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP_LOSS = 'stop_loss',
  TAKE_PROFIT = 'take_profit',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Market {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  volume24h: number;
  change24h: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  asset: string;
  balance: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt: string;
}
