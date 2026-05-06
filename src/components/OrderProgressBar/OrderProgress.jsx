import React from 'react';
import steps from './enum';

const OrderProgress = ({ currentStep, current }) => {
  // Hỗ trợ cả 2 prop names do trong code của bạn dùng cả currentStep và current
  const activeCode = currentStep !== undefined ? currentStep : current;

  return (
    <div style={{ padding: '10px 0' }}>
      {steps.map((step, index) => {
        // Logic kiểm tra xem step hiện tại có đang active không
        const isActive = activeCode === step.code;
        const isPast = activeCode > step.code && activeCode !== 3; // Không tô màu past nếu đã hủy
        const isCancelled = step.code === 3 && activeCode === 3;

        // Xác định màu sắc của thanh bar
        let barColor = '#E0E0E0'; // Màu xám mặc định
        if (isActive && !isCancelled) barColor = step.color;
        if (isPast) barColor = step.color; // Tô màu các bước đã qua
        if (isCancelled) barColor = '#D0021B'; // Màu đỏ cho trạng thái hủy

        return (
          <div key={step.code} style={{ marginBottom: '15px' }}>
            <div style={{ 
              fontWeight: isActive ? 'bold' : 'normal',
              marginBottom: '5px',
              fontSize: '15px'
            }}>
              {step.text}
            </div>
            <div style={{
              height: '8px',
              width: '100%',
              backgroundColor: '#E0E0E0', // Nền thanh bar
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: isActive || isPast || isCancelled ? '50%' : '0%', // Độ dài thanh màu (có thể chỉnh 50% hoặc 100% tùy ý UI)
                backgroundColor: barColor,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderProgress;