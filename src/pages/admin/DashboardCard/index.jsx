// src/pages/Admin/DashboardCard/index.jsx
import React from 'react';
import styles from "./DashboardCard.module.css";

const DashboardCard = ({ name, quantity, Icon, bgColor }) => {
  return (
    <div className={styles.dashboardCard}>
      <div className={styles.info}>
        {/* Định dạng số nếu là doanh thu */}
        <p className={styles.title}>
          {typeof quantity === 'number' && name.includes('Doanh thu') 
            ? `${quantity.toLocaleString()}đ` 
            : quantity}
        </p>
        <span className={styles.label}>{name}</span>
      </div>
      {/*bgColor chỉ áp dụng cho ô chứa Icon */}
      <div className={`${styles.iconWrapper} ${bgColor}`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default DashboardCard;