import React, { useState, useMemo } from 'react';
import { Table, TableProps, Button, Space, Input, Select, DatePicker, Tag, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from '../../theme';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Search } = Input;
const { RangePicker } = DatePicker;

interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'dateRange' | 'date';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}

interface DataTableProps<T = any> extends Omit<TableProps<T>, 'dataSource'> {
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: FilterConfig[];
  onFilterChange?: (filters: Record<string, any>) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  showHeader?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  actions?: React.ReactNode;
  pagination?: TableProps<T>['pagination'] | false;
}

export function DataTable<T = any>({
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = '검색...',
  onSearch,
  filters = [],
  onFilterChange,
  onExport,
  onRefresh,
  showHeader = true,
  headerTitle,
  headerDescription,
  actions,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}개`,
  },
  ...tableProps
}: DataTableProps<T>) {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleResetFilters = () => {
    setSearchValue('');
    setFilterValues({});
    onSearch?.('');
    onFilterChange?.({});
  };

  const filteredData = useMemo(() => {
    let result = data;

    // 검색 필터링
    if (searchValue && onSearch) {
      // 검색 로직은 부모 컴포넌트에서 처리
      return result;
    }

    // 기타 필터링
    filters.forEach(filter => {
      const value = filterValues[filter.key];
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter((item: any) => {
          const itemValue = item[filter.key];
          if (filter.type === 'dateRange' && Array.isArray(value)) {
            const [start, end] = value;
            return dayjs(itemValue).isBetween(start, end, 'day', '[]');
          }
          if (filter.type === 'date' && value) {
            return dayjs(itemValue).isSame(value, 'day');
          }
          return itemValue === value || (typeof itemValue === 'string' && itemValue.includes(value));
        });
      }
    });

    return result;
  }, [data, searchValue, filterValues, filters, onSearch]);

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'search':
        return (
          <Search
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filterValues[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            onSearch={(value) => handleFilterChange(filter.key, value)}
            style={{ width: 200 }}
            allowClear
          />
        );
      case 'select':
        return (
          <Select
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filterValues[filter.key]}
            onChange={(value) => handleFilterChange(filter.key, value)}
            style={{ width: 150 }}
            allowClear
            options={filter.options}
          />
        );
      case 'dateRange':
        return (
          <RangePicker
            key={filter.key}
            placeholder={[filter.placeholder || '시작일', '종료일']}
            value={filterValues[filter.key]}
            onChange={(dates) => handleFilterChange(filter.key, dates)}
            style={{ width: 240 }}
          />
        );
      case 'date':
        return (
          <DatePicker
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={filterValues[filter.key]}
            onChange={(date) => handleFilterChange(filter.key, date)}
            style={{ width: 150 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: theme.colors.semantic.background.primary, borderRadius: 12, overflow: 'hidden' }}>
      {/* 헤더 */}
      {showHeader && (
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.colors.semantic.border.primary}`,
            background: theme.colors.semantic.background.primary,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              {headerTitle && (
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: theme.colors.semantic.text.primary }}>
                  {headerTitle}
                </h3>
              )}
              {headerDescription && (
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.colors.semantic.text.secondary }}>
                  {headerDescription}
                </p>
              )}
            </div>
            <Space>
              {onRefresh && (
                <Tooltip title="새로고침">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                  />
                </Tooltip>
              )}
              {onExport && (
                <Tooltip title="내보내기">
                  <Button
                    type="text"
                    icon={<ExportOutlined />}
                    onClick={onExport}
                  />
                </Tooltip>
              )}
              {actions}
            </Space>
          </div>

          {/* 검색 및 필터 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {searchable && (
              <Search
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 300 }}
                allowClear
              />
            )}
            
            {filters.map(renderFilter)}
            
            {(searchValue || Object.values(filterValues).some(v => v !== undefined && v !== null && v !== '')) && (
              <Button
                type="text"
                icon={<FilterOutlined />}
                onClick={handleResetFilters}
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 테이블 */}
      <Table
        {...tableProps}
        dataSource={filteredData}
        loading={loading}
        pagination={pagination}
        style={{
          background: theme.colors.semantic.background.primary,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
