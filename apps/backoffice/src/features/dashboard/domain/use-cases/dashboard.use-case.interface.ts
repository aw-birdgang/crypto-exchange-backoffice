/**
 * 대시보드 Use Case 인터페이스
 */
export interface DashboardUseCase {
  // 대시보드 데이터 조회 Use Cases
  getDashboardOverview(): Promise<DashboardOverview>;
  getMarketStatus(): Promise<MarketStatus>;
  getRecentActivities(): Promise<RecentActivity[]>;
  getSystemStats(): Promise<SystemStats>;
  
  // 차트 데이터 Use Cases
  getTradingVolumeChart(period: ChartPeriod): Promise<ChartData>;
  getUserGrowthChart(period: ChartPeriod): Promise<ChartData>;
  getRevenueChart(period: ChartPeriod): Promise<ChartData>;
  
  // 알림 및 알림 Use Cases
  getNotifications(): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  
  // 실시간 데이터 Use Cases
  subscribeToRealTimeUpdates(): Promise<void>;
  unsubscribeFromRealTimeUpdates(): Promise<void>;
}

/**
 * 대시보드 분석 Use Case 인터페이스
 */
export interface DashboardAnalyticsUseCase {
  // KPI 계산 Use Cases
  calculateKPIs(): Promise<KPIs>;
  calculateUserGrowthRate(period: ChartPeriod): Promise<number>;
  calculateRevenueGrowthRate(period: ChartPeriod): Promise<number>;
  calculateTradingVolumeGrowthRate(period: ChartPeriod): Promise<number>;
  
  // 트렌드 분석 Use Cases
  analyzeUserTrends(period: ChartPeriod): Promise<TrendAnalysis>;
  analyzeTradingTrends(period: ChartPeriod): Promise<TrendAnalysis>;
  analyzeRevenueTrends(period: ChartPeriod): Promise<TrendAnalysis>;
  
  // 예측 Use Cases
  predictUserGrowth(months: number): Promise<PredictionData>;
  predictRevenue(months: number): Promise<PredictionData>;
  predictTradingVolume(months: number): Promise<PredictionData>;
}

/**
 * 대시보드 설정 Use Case 인터페이스
 */
export interface DashboardSettingsUseCase {
  // 위젯 관리 Use Cases
  getWidgets(): Promise<Widget[]>;
  addWidget(widget: CreateWidgetRequest): Promise<Widget>;
  updateWidget(widgetId: string, widget: UpdateWidgetRequest): Promise<Widget>;
  removeWidget(widgetId: string): Promise<void>;
  reorderWidgets(widgetIds: string[]): Promise<void>;
  
  // 레이아웃 관리 Use Cases
  getLayout(): Promise<Layout>;
  saveLayout(layout: Layout): Promise<void>;
  resetLayout(): Promise<void>;
  
  // 필터 관리 Use Cases
  getFilters(): Promise<Filter[]>;
  saveFilters(filters: Filter[]): Promise<void>;
  applyFilter(filterId: string): Promise<void>;
  clearFilters(): Promise<void>;
}

// 타입 정의
export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTrades: number;
  dailyTrades: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  lastUpdated: Date;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: Date;
  nextCloseTime?: Date;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
  marketCap: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'trade' | 'withdrawal' | 'deposit' | 'system_alert';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  amount?: number;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  errorRate: number;
  uptime: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface KPIs {
  userGrowth: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  revenue: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  tradingVolume: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  userRetention: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  confidence: number; // 0-1
  dataPoints: number;
  period: ChartPeriod;
}

export interface PredictionData {
  predictions: {
    date: Date;
    value: number;
    confidence: number;
  }[];
  accuracy: number;
  method: string;
  lastUpdated: Date;
}

export interface Widget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'alert';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
  refreshInterval: number; // seconds
  lastUpdated: Date;
}

export interface CreateWidgetRequest {
  type: Widget['type'];
  title: string;
  position: Widget['position'];
  config: Record<string, any>;
  refreshInterval?: number;
}

export interface UpdateWidgetRequest {
  title?: string;
  position?: Widget['position'];
  config?: Record<string, any>;
  isVisible?: boolean;
  refreshInterval?: number;
}

export interface Layout {
  id: string;
  name: string;
  widgets: Widget[];
  columns: number;
  rows: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Filter {
  id: string;
  name: string;
  type: 'date' | 'status' | 'category' | 'user' | 'amount';
  value: any;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  isActive: boolean;
}

export enum ChartPeriod {
  HOUR = '1h',
  DAY = '1d',
  WEEK = '1w',
  MONTH = '1m',
  QUARTER = '3m',
  YEAR = '1y',
}
