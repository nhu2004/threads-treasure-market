import React from 'react';
import { FaCheck, FaTimes, FaBox, FaTruck, FaFileInvoice, FaClock } from 'react-icons/fa';
import steps from './enum';

const OrderProgress = ({ currentStatusText, compact = false }) => {
  // Lấy code của trạng thái hiện tại dựa trên Text từ DB
  const currentStep = steps.find(s => s.text === currentStatusText)?.code || 0;
  const isCancelled = currentStatusText === "Đã hủy";

  // Danh sách icon tương ứng
  const icons = [
    <FaClock />,       // Chờ xác nhận
    <FaFileInvoice />, // Đang xử lý
    <FaTruck />,       // Đang giao
    <FaCheck />,       // Đã giao

  ];

  return (
    <div className={`order-stepper ${compact ? 'compact' : ''}`}>
      <style>
        {`
          .order-stepper {
            display: flex;
            align-items: flex-start; /* Cho các icon dóng lên trên */
            justify-content: space-between;
            width: 100%;
            position: relative;
          }
          /* Đường kẻ ngang */
          .order-stepper::before {
            content: "";
            position: absolute;
            top: 14px; /* Căn giữa icon */
            left: 10%;
            right: 10%;
            height: 2px;
            background: #e5e7eb;
            z-index: 0;
          }
          .step-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1; /* Chia đều không gian cho 4 bước */
            z-index: 1;
            position: relative;
          }
          .step-circle {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            color: #9ca3af;
            transition: all 0.3s ease;
            margin-bottom: 6px; /* Tạo khoảng cách với chữ */
          }
          .step-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
            text-align: center;
            line-height: 1.2;
            word-wrap: break-word; /* Nếu dài quá tự xuống dòng */
            max-width: 60px; /* Giới hạn độ rộng của chữ để không đè qua bước bên cạnh */
          }
          
          /* --- Trạng thái Active --- */
          .step-item.active .step-circle {
            border-color: #10b981; /* Xanh lá */
            background-color: #10b981;
            color: white;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .step-item.active .step-label {
            color: #10b981;
            font-weight: 700;
          }

          /* --- Trạng thái Hoàn thành (Past) --- */
          .step-item.completed .step-circle {
            border-color: #10b981;
            color: #10b981;
            background: #fff;
          }
          .step-item.completed .step-label {
            color: #10b981;
          }
          
          /* Bản thu nhỏ trong bảng (Compact) */
          .compact .step-circle { width: 26px; height: 26px; font-size: 11px; margin-bottom: 4px; }
          .compact::before { top: 12px; }
          .compact .step-label { font-size: 10px; max-width: 55px; }
        `}
      </style>

      {isCancelled ? (
        <div className="cancelled-container">
          <FaTimes /> <span>Đơn hàng đã hủy</span>
        </div>
      ) : (
        steps.slice(0, 4).map((step, index) => {
          const isCompleted = currentStep > step.code;
          const isActive = currentStep === step.code;
          
          return (
            <div key={step.code} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <div className="step-circle">
                {isCompleted ? <FaCheck /> : icons[index]}
              </div>
              <div className="step-label">{step.text}</div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrderProgress;