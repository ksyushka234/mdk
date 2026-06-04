// src/components/Toast.jsx
import React, { useEffect } from 'react';

function Toast({ message, type, onClose }) {
  // Автоматическое закрытие через 3 секунды
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Стили для разных типов уведомлений
  const bgColors = {
    success: '#4caf50', // Зеленый
    error: '#ff4d4f',   // Красный
    info: '#2196f3',    // Синий
  };

  const styles = {
    container: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColors[type] || '#333',
      color: 'white',
      padding: '15px 25px',
      borderRadius: '8px', // Закругленные края
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out forwards',
      display: 'flex',
      alignItems: 'center',
      minWidth: '250px',
    },
    closeBtn: {
      marginLeft: '15px',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '18px',
      cursor: 'pointer',
      opacity: 0.8,
    },
  };

  // Добавляем анимацию появления в стили документа
  if (!document.getElementById('toast-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.id = "toast-styles";
    styleSheet.innerText = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  return (
    <div style={styles.container}>
      <span>{message}</span>
      <button style={styles.closeBtn} onClick={onClose}>×</button>
    </div>
  );
}

export default Toast;