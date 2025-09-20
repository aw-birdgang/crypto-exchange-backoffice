import React, { useState } from 'react';
import { SupportHeader } from '../components/SupportHeader';
import { SupportStatsCards } from '../components/SupportStatsCards';
import { SupportFilters } from '../components/SupportFilters';
import { SupportTable } from '../components/SupportTable';

export const CustomerSupportPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });

  // 임시 데이터
  const supportTickets = [
    {
      id: '1',
      ticketId: 'TKT001',
      customerName: '김철수',
      customerEmail: 'kim@example.com',
      subject: '로그인 문제',
      status: 'open',
      priority: 'high',
      category: '기술 지원',
      assignedTo: '지원팀 A',
      createdAt: '2024-01-15 10:30:00',
      lastUpdated: '2024-01-15 14:20:00',
    },
    {
      id: '2',
      ticketId: 'TKT002',
      customerName: '이영희',
      customerEmail: 'lee@example.com',
      subject: '결제 오류',
      status: 'in_progress',
      priority: 'medium',
      category: '결제',
      assignedTo: '지원팀 B',
      createdAt: '2024-01-15 09:15:00',
      lastUpdated: '2024-01-15 11:45:00',
    },
    {
      id: '3',
      ticketId: 'TKT003',
      customerName: '박민수',
      customerEmail: 'park@example.com',
      subject: '계정 복구',
      status: 'resolved',
      priority: 'low',
      category: '계정',
      assignedTo: '지원팀 A',
      createdAt: '2024-01-14 16:20:00',
      lastUpdated: '2024-01-15 08:30:00',
    },
  ];

  const stats = {
    waiting: 5,
    inProgress: 12,
    resolved: 8,
    closed: 3,
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SupportHeader
          onCreateTicket={() => console.log('Create ticket')}
          onRefresh={() => window.location.reload()}
        />

        <SupportStatsCards stats={stats} />

        <SupportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <SupportTable tickets={supportTickets} />
      </div>
    </div>
  );
};
