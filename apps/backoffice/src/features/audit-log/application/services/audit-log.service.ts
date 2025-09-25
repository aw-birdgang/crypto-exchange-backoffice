import { AuditLog, AuditLogFilters, PaginatedAuditLogs, LogStatistics } from '../../domain/entities/audit-log.entity';

export class AuditLogService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  /**
   * 감사 로그 목록 조회
   */
  async getLogs(filters: AuditLogFilters): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/api/v1/audit-logs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 로그 통계 조회
   */
  async getStatistics(period: string = 'week'): Promise<LogStatistics> {
    const response = await fetch(`${this.baseUrl}/api/v1/audit-logs/statistics?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch log statistics: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 사용자별 최근 활동 조회
   */
  async getUserRecentActivity(userId: string, limit: number = 10): Promise<AuditLog[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/audit-logs/user/${userId}/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user recent activity: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 의심스러운 활동 탐지
   */
  async detectSuspiciousActivity(userId: string, timeWindow: number = 60): Promise<AuditLog[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/audit-logs/user/${userId}/suspicious?timeWindow=${timeWindow}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to detect suspicious activity: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 로그 내보내기
   */
  async exportLogs(filters: AuditLogFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    params.append('format', format);

    const response = await fetch(`${this.baseUrl}/api/v1/audit-logs/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export logs: ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * 오래된 로그 정리
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<{ message: string; deletedCount: number }> {
    const response = await fetch(`${this.baseUrl}/api/v1/audit-logs/cleanup?retentionDays=${retentionDays}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cleanup old logs: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 로그 다운로드
   */
  async downloadLogs(filters: AuditLogFilters, format: 'csv' | 'json' = 'csv'): Promise<void> {
    try {
      const blob = await this.exportLogs(filters, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download logs:', error);
      throw error;
    }
  }

  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }
}
