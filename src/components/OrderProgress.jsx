import React from 'react'; 
import { FaClipboardList, FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Quy chuẩn các bước (steps) trong hệ thống
const STEPS = [
  { code: 0, text: 'Chờ xác nhận', icon: <FaClipboardList /> },
  { code: 1, text: 'Đang giao', icon: <FaTruck /> },
  { code: 2, text: 'Đã giao', icon: <FaCheckCircle /> }
];

const OrderProgress = ({ currentStatusText, orderStatusCode }) => {
  // Tính toán bước hiện tại
  let currentStepIndex = 0;
  let isCancelled = currentStatusText === 'Đã hủy';

  if (isCancelled) {
    currentStepIndex = -1; // Trạng thái đặc biệt
  } else if (orderStatusCode !== undefined && orderStatusCode !== null) {
    currentStepIndex = orderStatusCode;
  } else {
    // Nếu không có code, map theo text
    const foundStep = STEPS.findIndex(step => step.text === currentStatusText);
    currentStepIndex = foundStep !== -1 ? foundStep : 0;
  }

  return (
    <> 
    <style>
      {`  .order-progress-wrapper {
          padding: 20px 10px;
          max-width: 600px;
          margin: 0 auto;
        }

        .progress-container {
          position: relative;
          width: 100%;
        }

        .progress-bar-bg {
          position: absolute;
          top: 20px; /* Căn giữa theo height của icon */
          left: 0;
          width: 100%;
          height: 4px;
          background-color: #e9ecef;
          z-index: 1;
        }

        .progress-bar-fill {
          position: absolute;
          top: 20px;
          left: 0;
          height: 4px;
          background-color: #28a745; /* Màu xanh success */
          transition: width 0.4s ease;
          z-index: 2;
        }

        .steps-wrapper {
          z-index: 3;
        }

        .step-item {
          width: 33.33%;
          position: relative;
          z-index: 3;
        }

        .step-icon {
          width: 44px;
          height: 44px;
          background-color: #e9ecef;
          color: #adb5bd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          font-size: 20px;
          transition: all 0.3s ease;
          border: 4px solid #fff; /* Tạo khoảng trống giả với thanh line */
        }

        .step-text {
          font-size: 14px;
          color: #6c757d;
        }

        /* Trạng thái đã hoàn thành */
        .step-item.completed .step-icon {
          background-color: #28a745;
          color: #fff;
        }

        .step-item.completed .step-text {
          color: #28a745;
        }

        /* Trạng thái đang diễn ra (Active) */
        .step-item.active .step-icon {
          box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.25);
          transform: scale(1.1);
        }

        .step-item.active .step-text {
          font-weight: 700;
        }

        /* Trạng thái hủy */
        .cancelled-state {
          padding: 20px;
          background-color: #fff5f5;
          border-radius: 8px;
          border: 1px dashed #dc3545;
        }
      `}</style>

      {/* GIAO DIỆN COMPONENT */}
    <div className="order-progress-wrapper my-4">
      {isCancelled ? (
        <div className="cancelled-state text-center text-danger">
          <FaTimesCircle size={40} className="mb-2" />
          <h5 className="fw-bold">Đơn hàng đã bị hủy</h5>
        </div>
      ) : (
        <div className="progress-container">
          <div className="progress-bar-bg"></div>
          
          {/* Thanh tiến trình chạy theo màu */}
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
          ></div>

          <div className="steps-wrapper d-flex justify-content-between position-relative">
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isActive = index === currentStepIndex;

              return (
                <div key={step.code} className={`step-item text-center ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-icon">
                    {step.icon}
                  </div>
                  <div className="step-text mt-2 fw-semibold">
                    {step.text}
                  </div>
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