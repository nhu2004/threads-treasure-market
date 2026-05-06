import React from 'react'; 
import { FaClipboardList, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const STEPS = [
  { code: 0, text: 'Chờ xác nhận', icon: <FaClipboardList /> },
  { code: 1, text: 'Đang giao', icon: <FaTruck /> },
  { code: 2, text: 'Đã giao', icon: <FaCheckCircle /> }
];

// Thêm props: cancellationReason và compact (để thu nhỏ trong bảng)
const OrderProgress = ({ currentStatusText, orderStatusCode, cancellationReason, compact = false }) => {
  let currentStepIndex = 0;
  let isCancelled = currentStatusText === 'Đã hủy';

  if (isCancelled) {
    currentStepIndex = -1; 
  } else if (orderStatusCode !== undefined && orderStatusCode !== null) {
    currentStepIndex = orderStatusCode;
  } else {
    const foundStep = STEPS.findIndex(step => step.text === currentStatusText);
    currentStepIndex = foundStep !== -1 ? foundStep : 0;
  }

  // Nếu là chế độ thu nhỏ (trong bảng), scale nhỏ lại
  const scaleStyle = compact ? { transform: 'scale(0.75)', transformOrigin: 'center left', margin: '-10px 0' } : {};

  return (
    <> 
    <style>
      {`  
        .order-progress-wrapper { max-width: 600px; margin: 0 auto; width: 100%; }
        .progress-container { position: relative; width: 100%; }
        .progress-bar-bg { position: absolute; top: 20px; left: 0; width: 100%; height: 4px; background-color: #e9ecef; z-index: 1; }
        .progress-bar-fill { position: absolute; top: 20px; left: 0; height: 4px; background-color: #28a745; transition: width 0.4s ease; z-index: 2; }
        .steps-wrapper { z-index: 3; }
        .step-item { width: 33.33%; position: relative; z-index: 3; }
        .step-icon { width: 44px; height: 44px; background-color: #e9ecef; color: #adb5bd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 20px; border: 4px solid #fff; }
        .step-text { font-size: 9px; color: #6c757d; white-space: nowrap; }
        .step-item.completed .step-icon { background-color: #28a745; color: #fff; }
        .step-item.completed .step-text { color: #28a745; }
        .step-item.active .step-icon { box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.25); transform: scale(1.1); }
        .step-item.active .step-text { font-weight: 700; }
        .cancelled-state { padding: ${compact ? '10px' : '20px'}; background-color: #fff5f5; border-radius: 8px; border: 1px dashed #dc3545; }
      `}
    </style>

    <div className={`order-progress-wrapper ${compact ? '' : 'my-4'}`} style={scaleStyle}>
      {isCancelled ? (
        <div className="cancelled-state text-center text-danger">
          <FaTimesCircle size={compact ? 24 : 40} className="mb-1" />
          <h6 className="fw-bold mb-1">Đơn hàng đã bị hủy</h6>
          {/* HIỂN THỊ LÝ DO HỦY Ở ĐÂY */}
          {cancellationReason && (
            <p className="mb-0 text-dark" style={{fontSize: '13px', fontWeight: '500'}}>
              Lý do: {cancellationReason}
            </p>
          )}
        </div>
      ) : (
        <div className="progress-container">
          <div className="progress-bar-bg"></div>
          <div className="progress-bar-fill" style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}></div>
          <div className="steps-wrapper d-flex justify-content-between position-relative">
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isActive = index === currentStepIndex;
              return (
                <div key={step.code} className={`step-item text-center ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-text mt-2 fw-semibold">{step.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default OrderProgress;