// src/components/Dashboard/CreateTaskModal.jsx
import React from 'react';

function CreateTaskModal({ newTask, setNewTask, employees, handleCreateTask, styles, onClose }) {

  //  Функция преобразования даты в формат для input type="datetime-local"
  const toInputFormat = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Корректируем часовой пояс, чтобы дата не "прыгала" при отображении
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(9,30,66,0.54)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)' // Красивое размытие фона
    }}>
      <div style={{
        background: 'white', padding: '32px', borderRadius: '12px',
        width: '500px', maxWidth: '90vw', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', color: '#172B4D' }}>
          Создание задачи
          <span style={{ display: 'block', fontSize: '12px', color: '#6B778C', fontWeight: '400', marginTop: '4px' }}>
            ИИ-анализ приоритета включен
          </span>
        </h3>

        {/* Название */}
        <input
          placeholder="Название задачи"
          value={newTask.title || ''}
          onChange={e => setNewTask({...newTask, title: e.target.value})}
          style={{...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '16px'}}
        />

        {/* Описание */}
        <textarea
          placeholder="Описание (ИИ оценит срочность по тексту)"
          value={newTask.description || ''}
          onChange={e => setNewTask({...newTask, description: e.target.value})}
          style={{...styles.input, width: '100%', height: '80px', boxSizing: 'border-box', marginBottom: '16px', resize: 'vertical'}}
        />

        {/* Даты в одну строку */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
           <div style={{ flex: 1 }}>
             <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6C84', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Начало</label>
             <input
                type="datetime-local"
                // 👇 Используем нашу функцию преобразования
                value={toInputFormat(newTask.startDateAt)}
                onChange={e => setNewTask({...newTask, startDateAt: e.target.value})}
                style={{...styles.input, width: '100%', boxSizing: 'border-box'}}
             />
           </div>
           <div style={{ flex: 1 }}>
             <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6C84', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Дедлайн</label>
             <input
                type="datetime-local"
                //  Используем нашу функцию преобразования
                value={toInputFormat(newTask.deadlineAt)}
                onChange={e => setNewTask({...newTask, deadlineAt: e.target.value})}
                style={{...styles.input, width: '100%', boxSizing: 'border-box'}}
             />
           </div>
        </div>

        {/* Приоритет */}
        <select
          value={newTask.priority || 'MEDIUM'}
          onChange={e => setNewTask({...newTask, priority: e.target.value})}
          style={{...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '16px'}}
        >
          <option value="LOW">🟢 Низкий</option>
          <option value="MEDIUM">🟡 Средний</option>
          <option value="HIGH">🔴 Высокий</option>
        </select>

        {/* Исполнитель */}
        <select
          value={newTask.assigneeUserId || ''}
          onChange={e => setNewTask({...newTask, assigneeUserId: Number(e.target.value)})}
          style={{...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '24px'}}
        >
          <option value="">Выберите исполнителя...</option>
          {employees.map(emp => (
            <option key={emp.userId} value={emp.userId}>
              {emp.fullName}
            </option>
          ))}
        </select>

        {/* Кнопки */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              ...styles.btnPrimary, background: '#F4F5F7', color: '#172B4D',
              border: '1px solid #DFE1E6', fontWeight: '500'
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleCreateTask}
            style={{...styles.btnPrimary, fontWeight: '600'}}
          >
            Создать задачу
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;