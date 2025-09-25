import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuditLog, AuditLogFilters, PaginatedAuditLogs, LogStatistics } from '../../domain/entities/audit-log.entity';
import { AuditLogService } from '../services/audit-log.service';

interface AuditLogState {
  // Data
  logs: AuditLog[];
  statistics: LogStatistics | null;
  filters: AuditLogFilters;
  
  // Loading states
  loading: boolean;
  statisticsLoading: boolean;
  exportLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface AuditLogActions {
  // Data fetching
  fetchLogs: (filters?: Partial<AuditLogFilters>) => Promise<void>;
  fetchStatistics: (period?: string) => Promise<void>;
  fetchUserRecentActivity: (userId: string, limit?: number) => Promise<AuditLog[]>;
  detectSuspiciousActivity: (userId: string, timeWindow?: number) => Promise<AuditLog[]>;
  
  // Filters
  updateFilters: (filters: Partial<AuditLogFilters>) => void;
  clearFilters: () => void;
  resetPagination: () => void;
  
  // Export
  exportLogs: (format?: 'csv' | 'json') => Promise<void>;
  downloadLogs: (format?: 'csv' | 'json') => Promise<void>;
  
  // Cleanup
  cleanupOldLogs: (retentionDays?: number) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuditLogStore = AuditLogState & AuditLogActions;

const auditLogService = new AuditLogService();

const defaultFilters: AuditLogFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export const useAuditLogStore = create<AuditLogStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      logs: [],
      statistics: null,
      filters: defaultFilters,
      loading: false,
      statisticsLoading: false,
      exportLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },

      // Actions
      fetchLogs: async (newFilters?: Partial<AuditLogFilters>) => {
        set({ loading: true, error: null });
        
        try {
          const currentFilters = get().filters;
          const filters = { ...currentFilters, ...newFilters };
          
          const result = await auditLogService.getLogs(filters);
          
          set({
            logs: result.data,
            pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: result.totalPages,
              hasNext: result.hasNext,
              hasPrev: result.hasPrev,
            },
            filters,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch logs',
            loading: false,
          });
        }
      },

      fetchStatistics: async (period = 'week') => {
        set({ statisticsLoading: true, error: null });
        
        try {
          const statistics = await auditLogService.getStatistics(period);
          
          set({
            statistics,
            statisticsLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch statistics',
            statisticsLoading: false,
          });
        }
      },

      fetchUserRecentActivity: async (userId: string, limit = 10) => {
        try {
          return await auditLogService.getUserRecentActivity(userId, limit);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch user recent activity',
          });
          return [];
        }
      },

      detectSuspiciousActivity: async (userId: string, timeWindow = 60) => {
        try {
          return await auditLogService.detectSuspiciousActivity(userId, timeWindow);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to detect suspicious activity',
          });
          return [];
        }
      },

      updateFilters: (newFilters: Partial<AuditLogFilters>) => {
        const currentFilters = get().filters;
        const filters = { ...currentFilters, ...newFilters };
        
        set({ filters });
        
        // 자동으로 로그 다시 조회
        get().fetchLogs(filters);
      },

      clearFilters: () => {
        const filters = defaultFilters;
        set({ filters });
        get().fetchLogs(filters);
      },

      resetPagination: () => {
        set({
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      },

      exportLogs: async (format: 'csv' | 'json' = 'csv') => {
        set({ exportLoading: true, error: null });
        
        try {
          const filters = get().filters;
          await auditLogService.downloadLogs(filters, format);
          
          set({ exportLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to export logs',
            exportLoading: false,
          });
        }
      },

      downloadLogs: async (format: 'csv' | 'json' = 'csv') => {
        set({ exportLoading: true, error: null });
        
        try {
          const filters = get().filters;
          await auditLogService.downloadLogs(filters, format);
          
          set({ exportLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to download logs',
            exportLoading: false,
          });
        }
      },

      cleanupOldLogs: async (retentionDays = 365) => {
        set({ loading: true, error: null });
        
        try {
          await auditLogService.cleanupOldLogs(retentionDays);
          
          set({ loading: false });
          
          // 정리 후 로그 다시 조회
          get().fetchLogs();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to cleanup old logs',
            loading: false,
          });
          throw error;
        }
      },

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'audit-log-store',
    }
  )
);
