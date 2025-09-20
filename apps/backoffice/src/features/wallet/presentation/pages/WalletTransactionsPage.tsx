import React, {useState} from 'react';
import {TransactionHeader} from '../components/TransactionHeader';
import {TransactionFilters} from '../components/TransactionFilters';
import {TransactionTable} from '../components/TransactionTable';

export const WalletTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateRange: null,
  });

  // 임시 데이터
  const transactions = [
    {
      id: '1',
      transactionId: 'TXN001',
      walletId: 'W001',
      type: 'deposit',
      amount: 1000,
      currency: 'USDT',
      status: 'completed',
      fee: 5,
      timestamp: '2024-01-15 10:30:00',
      from: '0x1234...5678',
      to: '0xabcd...efgh',
    },
    {
      id: '2',
      transactionId: 'TXN002',
      walletId: 'W002',
      type: 'withdrawal',
      amount: 0.5,
      currency: 'BTC',
      status: 'pending',
      fee: 0.001,
      timestamp: '2024-01-15 09:15:00',
      from: '0xabcd...efgh',
      to: '0x5678...1234',
    },
    {
      id: '3',
      transactionId: 'TXN003',
      walletId: 'W003',
      type: 'transfer',
      amount: 250,
      currency: 'ETH',
      status: 'completed',
      fee: 0.01,
      timestamp: '2024-01-15 08:45:00',
      from: '0x5678...1234',
      to: '0xefgh...abcd',
    },
  ];


  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      dateRange: null,
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <TransactionHeader
          onExport={() => console.log('Export transactions')}
          onRefresh={() => window.location.reload()}
        />

        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
};
