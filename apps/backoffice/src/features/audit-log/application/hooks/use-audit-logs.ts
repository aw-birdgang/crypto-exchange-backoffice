import { useEffect, useCallback } from 'react';
import { useAuditLogStore } from '../stores/audit-log.store';
import { AuditLogFilters } from '../../domain/entities/audit-log.entity';

export const useAuditLogs = () => {
  const {
    logs,
    statistics,
    filters,
    loading,
    statisticsLoading,
    exportLoading,
    error,
    pagination,
    fetchLogs,
    fetchStatistics,
    fetchUserRecentActivity,
    detectSuspiciousActivity,
    updateFilters,
    clearFilters,
    resetPagination,
    exportLogs,
    downloadLogs,
    cleanupOldLogs,
    setLoading,
    setError,
    clearError,
  } = useAuditLogStore();

  // 초기 데이터 로드
  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilters: Partial<AuditLogFilters>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = useCallback((limit: number) => {
    updateFilters({ limit, page: 1 });
  }, [updateFilters]);

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // 검색 핸들러
  const handleSearch = useCallback((search: string) => {
    updateFilters({ search, page: 1 });
  }, [updateFilters]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate?: string, endDate?: string) => {
    updateFilters({ startDate, endDate, page: 1 });
  }, [updateFilters]);

  // 필터 초기화
  const handleClearFilters = useCallback(() => {
    clearFilters();
    resetPagination();
  }, [clearFilters, resetPagination]);

  // 내보내기 핸들러
  const handleExport = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      await exportLogs(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportLogs]);

  // 다운로드 핸들러
  const handleDownload = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      await downloadLogs(format);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [downloadLogs]);

  // 정리 핸들러
  const handleCleanup = useCallback(async (retentionDays: number = 365) => {
    try {
      await cleanupOldLogs(retentionDays);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }, [cleanupOldLogs]);

  // 사용자별 최근 활동 조회
  const getUserRecentActivity = useCallback(async (userId: string, limit?: number) => {
    try {
      return await fetchUserRecentActivity(userId, limit);
    } catch (error) {
      console.error('Failed to fetch user recent activity:', error);
      return [];
    }
  }, [fetchUserRecentActivity]);

  // 의심스러운 활동 탐지
  const handleDetectSuspiciousActivity = useCallback(async (userId: string, timeWindow?: number) => {
    try {
      return await detectSuspiciousActivity(userId, timeWindow);
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      return [];
    }
  }, [detectSuspiciousActivity]);

  return {
    // Data
    logs,
    statistics,
    filters,
    pagination,
    
    // Loading states
    loading,
    statisticsLoading,
    exportLoading,
    
    // Error state
    error,
    
    // Actions
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearch,
    handleDateRangeChange,
    handleClearFilters,
    handleExport,
    handleDownload,
    handleCleanup,
    getUserRecentActivity,
    handleDetectSuspiciousActivity,
    
    // State management
    setLoading,
    setError,
    clearError,
    
    // Direct actions
    fetchLogs,
    fetchStatistics,
  };
};
