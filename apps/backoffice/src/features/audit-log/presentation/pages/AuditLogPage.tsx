import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Space,
  Button,
  Modal,
  message,
  Row,
  Col,
} from 'antd';
import {
  BarChartOutlined,
  TableOutlined,
  SettingOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAuditLogs } from '../../application/hooks/use-audit-logs';
import { AuditLogFilters } from '../../domain/entities/audit-log.entity';
import { AuditLogFilters as AuditLogFiltersComponent } from '../components/AuditLogFilters';
import { AuditLogTable } from '../components/AuditLogTable';
import { AuditLogStatistics } from '../components/AuditLogStatistics';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const AuditLogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [retentionDays, setRetentionDays] = useState(365);
  
  const {
    logs,
    statistics,
    loading,
    exportLoading,
    error,
    handleExport,
    handleCleanup,
    fetchLogs,
    fetchStatistics,
  } = useAuditLogs();

  const handleRefresh = () => {
    fetchLogs();
    fetchStatistics();
    message.success('데이터가 새로고침되었습니다.');
  };

  const handleExportCSV = () => {
    handleExport('csv');
    message.success('CSV 파일이 다운로드되었습니다.');
  };

  const handleExportJSON = () => {
    handleExport('json');
    message.success('JSON 파일이 다운로드되었습니다.');
  };

  const handleCleanupConfirm = async () => {
    try {
      await handleCleanup(retentionDays);
      message.success('오래된 로그가 정리되었습니다.');
      setCleanupModalVisible(false);
    } catch (error) {
      message.error('로그 정리 중 오류가 발생했습니다.');
    }
  };

  const tabItems = [
    {
      key: 'logs',
      label: (
        <span>
          <TableOutlined />
          로그 목록
        </span>
      ),
      children: (
        <div>
          <AuditLogFiltersComponent />
          <div style={{ marginTop: 16 }}>
            <AuditLogTable />
          </div>
        </div>
      ),
    },
    {
      key: 'statistics',
      label: (
        <span>
          <BarChartOutlined />
          통계
        </span>
      ),
      children: <AuditLogStatistics />,
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          설정
        </span>
      ),
      children: (
        <div>
          <Card title="로그 관리">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Title level={5}>데이터 내보내기</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportCSV}
                      loading={exportLoading}
                      block
                    >
                      CSV 내보내기
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportJSON}
                      loading={exportLoading}
                      block
                    >
                      JSON 내보내기
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Title level={5}>데이터 새로고침</Title>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                    block
                  >
                    새로고침
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Title level={5}>로그 정리</Title>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setCleanupModalVisible(true)}
                    block
                  >
                    오래된 로그 정리
                  </Button>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>감사 로그</Title>
        <Text type="secondary">
          시스템의 모든 사용자 활동을 추적하고 모니터링합니다.
        </Text>
      </div>

      {error && (
        <Card style={{ marginBottom: 16, border: '1px solid #ff4d4f' }}>
          <Text type="danger">오류: {error}</Text>
        </Card>
      )}

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Modal
        title="로그 정리"
        open={cleanupModalVisible}
        onOk={handleCleanupConfirm}
        onCancel={() => setCleanupModalVisible(false)}
        okText="정리"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        <div>
          <Text>
            보존 기간을 초과한 오래된 로그를 정리합니다.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Text strong>보존 기간: </Text>
            <Text>{retentionDays}일</Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};
