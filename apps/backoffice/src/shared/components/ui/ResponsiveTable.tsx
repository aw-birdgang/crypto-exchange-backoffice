import React, { useState } from 'react';
import { Table, Card, Button, Space, Tooltip, Drawer } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  TableOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useResponsive } from '../../hooks';
import type { TableProps, ColumnType } from 'antd/es/table';

interface ResponsiveTableProps<T = any> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnType<T>[];
  data: T[];
  cardView?: boolean;
  onCardAction?: (record: T, action: string) => void;
  cardActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
  }>;
  cardTitleKey?: string;
  cardSubtitleKey?: string;
  cardDescriptionKey?: string;
  cardImageKey?: string;
  showViewToggle?: boolean;
  emptyText?: string;
  loading?: boolean;
}

// 카드 뷰 컴포넌트
interface CardViewProps<T> {
  data: T[];
  columns: ColumnType<T>[];
  onAction?: (record: T, action: string) => void;
  actions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
  }>;
  titleKey?: string;
  subtitleKey?: string;
  descriptionKey?: string;
  imageKey?: string;
  loading?: boolean;
}

const CardView = <T,>({
  data,
  columns,
  onAction,
  actions = [],
  titleKey,
  subtitleKey,
  descriptionKey,
  imageKey,
  loading = false,
}: CardViewProps<T>) => {
  const [selectedCard, setSelectedCard] = useState<T | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const getCardTitle = (record: T) => {
    if (titleKey) {
      return (record as any)[titleKey];
    }
    // 첫 번째 컬럼을 제목으로 사용
    const firstColumn = columns.find(col => col.title && col.dataIndex);
    return firstColumn ? (record as any)[firstColumn.dataIndex as string] : '항목';
  };

  const getCardSubtitle = (record: T) => {
    if (subtitleKey) {
      return (record as any)[subtitleKey];
    }
    // 두 번째 컬럼을 부제목으로 사용
    const secondColumn = columns.find((col, index) => index === 1 && col.title && col.dataIndex);
    return secondColumn ? (record as any)[secondColumn.dataIndex as string] : '';
  };

  const getCardDescription = (record: T) => {
    if (descriptionKey) {
      return (record as any)[descriptionKey];
    }
    // 세 번째 컬럼을 설명으로 사용
    const thirdColumn = columns.find((col, index) => index === 2 && col.title && col.dataIndex);
    return thirdColumn ? (record as any)[thirdColumn.dataIndex as string] : '';
  };

  const getCardImage = (record: T) => {
    if (imageKey) {
      return (record as any)[imageKey];
    }
    return null;
  };

  const handleCardAction = (record: T, action: string) => {
    if (action === 'view') {
      setSelectedCard(record);
      setIsDetailDrawerOpen(true);
    } else {
      onAction?.(record, action);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '16px',
        padding: '16px 0'
      }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} loading style={{ height: '200px' }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '16px',
        padding: '16px 0'
      }}>
        {data.map((record, index) => (
          <Card
            key={(record as any).key || index}
            hoverable
            style={{ height: 'auto' }}
            cover={getCardImage(record) ? (
              <img 
                alt={getCardTitle(record)} 
                src={getCardImage(record)} 
                style={{ height: '120px', objectFit: 'cover' }}
              />
            ) : null}
            actions={actions.length > 0 ? [
              ...actions.map(action => (
                <Tooltip key={action.key} title={action.label}>
                  <Button
                    type="text"
                    icon={action.icon}
                    danger={action.danger}
                    onClick={() => handleCardAction(record, action.key)}
                    style={{ 
                      color: action.danger ? '#ff4d4f' : '#1890ff',
                      border: 'none'
                    }}
                  />
                </Tooltip>
              )),
              <Tooltip key="view" title="상세보기">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleCardAction(record, 'view')}
                  style={{ color: '#1890ff', border: 'none' }}
                />
              </Tooltip>
            ] : [
              <Tooltip key="view" title="상세보기">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleCardAction(record, 'view')}
                  style={{ color: '#1890ff', border: 'none' }}
                />
              </Tooltip>
            ]}
          >
            <Card.Meta
              title={getCardTitle(record)}
              description={
                <div>
                  {getCardSubtitle(record) && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#8c8c8c', 
                      marginBottom: '4px' 
                    }}>
                      {getCardSubtitle(record)}
                    </div>
                  )}
                  {getCardDescription(record) && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#bfbfbf',
                      marginTop: '8px'
                    }}>
                      {getCardDescription(record)}
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        ))}
      </div>

      {/* 상세보기 드로어 */}
      <Drawer
        title="상세 정보"
        placement="right"
        width={400}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        destroyOnClose
      >
        {selectedCard && (
          <div style={{ padding: '16px 0' }}>
            {columns.map((column, index) => {
              if (!column.dataIndex || !column.title) return null;
              
              const value = (selectedCard as any)[column.dataIndex as string];
              const renderValue = column.render ? column.render(value, selectedCard, index) : value;
              
              return (
                <div key={column.dataIndex as string} style={{ 
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: index < columns.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#8c8c8c', 
                    marginBottom: '4px',
                    fontWeight: 500
                  }}>
                    {typeof column.title === 'string' ? column.title : '항목'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#262626' }}>
                    {renderValue}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </>
  );
};

// 반응형 테이블 메인 컴포넌트
export const ResponsiveTable = <T,>({
  columns,
  data,
  cardView = false,
  onCardAction,
  cardActions = [
    { key: 'edit', label: '수정', icon: <EditOutlined /> },
    { key: 'delete', label: '삭제', icon: <DeleteOutlined />, danger: true },
  ],
  cardTitleKey,
  cardSubtitleKey,
  cardDescriptionKey,
  cardImageKey,
  showViewToggle = true,
  emptyText = '데이터가 없습니다',
  loading = false,
  ...tableProps
}: ResponsiveTableProps<T>) => {
  const { isMobile, isTablet, getTableScrollMode } = useResponsive();
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // 모바일에서는 기본적으로 카드 뷰 사용
  const shouldUseCardView = cardView || isMobile || (isTablet && viewMode === 'card');

  // 테이블 스크롤 설정
  const scrollConfig = {
    x: getTableScrollMode() === 'horizontal' ? 'max-content' : undefined,
    y: tableProps.scroll?.y,
  };

  // 빈 상태 처리
  if (!loading && (!data || data.length === 0)) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 16px',
        color: '#8c8c8c'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <div style={{ fontSize: '16px' }}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div>
      {/* 뷰 토글 버튼 (태블릿 이상에서만 표시) */}
      {showViewToggle && !isMobile && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '16px' 
        }}>
          <Space>
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<TableOutlined />}
              onClick={() => setViewMode('table')}
              size="small"
            >
              테이블
            </Button>
            <Button
              type={viewMode === 'card' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('card')}
              size="small"
            >
              카드
            </Button>
          </Space>
        </div>
      )}

      {/* 테이블 또는 카드 뷰 렌더링 */}
      {shouldUseCardView ? (
        <CardView
          data={data}
          columns={columns}
          onAction={onCardAction}
          actions={cardActions}
          titleKey={cardTitleKey}
          subtitleKey={cardSubtitleKey}
          descriptionKey={cardDescriptionKey}
          imageKey={cardImageKey}
          loading={loading}
        />
      ) : (
        <Table
          {...tableProps}
          columns={columns}
          dataSource={data}
          scroll={scrollConfig}
          loading={loading}
          pagination={{
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            showTotal: !isMobile ? (total, range) => 
              `${range[0]}-${range[1]} / ${total}개` : undefined,
            ...tableProps.pagination,
          }}
        />
      )}
    </div>
  );
};
