import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
  List,
  Avatar,
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAuditLogs } from '../../application/hooks/use-audit-logs';

const { Title } = Typography;

export const AuditLogStatistics: React.FC = () => {
  const {
    statistics,
    statisticsLoading,
  } = useAuditLogs();

  if (!statistics) {
    return null;
  }

  const {
    totalLogs,
    successLogs,
    failureLogs,
    warningLogs,
    categoryStats,
    severityStats,
    userStats,
    hourlyStats,
  } = statistics;

  const successRate = totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0;
  const failureRate = totalLogs > 0 ? (failureLogs / totalLogs) * 100 : 0;

  const topUsers = Object.entries(userStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div>
      <Title level={4}>
        <BarChartOutlined /> 로그 통계
      </Title>
      
      <Row gutter={[16, 16]}>
        {/* 기본 통계 */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="총 로그 수"
              value={totalLogs}
              prefix={<BarChartOutlined />}
              loading={statisticsLoading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="성공 로그"
              value={successLogs}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              loading={statisticsLoading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="실패 로그"
              value={failureLogs}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              loading={statisticsLoading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="경고 로그"
              value={warningLogs}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              loading={statisticsLoading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 성공률 */}
        <Col xs={24} sm={12} md={8}>
          <Card title="성공률">
            <Progress
              type="circle"
              percent={Math.round(successRate)}
              format={(percent) => `${percent}%`}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        
        {/* 실패률 */}
        <Col xs={24} sm={12} md={8}>
          <Card title="실패률">
            <Progress
              type="circle"
              percent={Math.round(failureRate)}
              format={(percent) => `${percent}%`}
              strokeColor="#ff4d4f"
            />
          </Card>
        </Col>
        
        {/* 심각도 분포 */}
        <Col xs={24} sm={12} md={8}>
          <Card title="심각도 분포">
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(severityStats).map(([severity, count]) => (
                <div key={severity} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Tag color={
                    severity === 'critical' ? 'red' :
                    severity === 'high' ? 'orange' :
                    severity === 'medium' ? 'yellow' : 'green'
                  }>
                    {severity}
                  </Tag>
                  <span>{count}</span>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 상위 사용자 */}
        <Col xs={24} md={12}>
          <Card title="상위 사용자 (활동량)">
            <List
              dataSource={topUsers}
              renderItem={([email, count]) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={email}
                    description={`${count}개 활동`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        {/* 상위 카테고리 */}
        <Col xs={24} md={12}>
          <Card title="상위 카테고리">
            <List
              dataSource={topCategories}
              renderItem={([category, count]) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<BarChartOutlined />} />}
                    title={category}
                    description={`${count}개 로그`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 시간대별 활동 */}
        <Col xs={24}>
          <Card title="시간대별 활동">
            <Row gutter={[8, 8]}>
              {Object.entries(hourlyStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([hour, count]) => (
                  <Col key={hour} xs={6} sm={4} md={3} lg={2}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {hour}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {count}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
