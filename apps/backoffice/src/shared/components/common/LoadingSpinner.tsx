import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  tip = '로딩 중...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '16px',
      }}
    >
      <Spin size={size} />
      {tip && (
        <div style={{ color: '#666', fontSize: '14px' }}>
          {tip}
        </div>
      )}
    </div>
  );
};
