// src/components/Dashboard/EditTaskModal.jsx
import React, { useState, useEffect } from 'react';

function EditTaskModal({ task, onSave, onCancel, styles }) {
  // Локальный стейт для формы, чтобы не мутировать пропсы напрямую
  const [formData, setFormData] = useState(task);

  // Синхронизируем локальный стейт, если task изменился
  useEffect(() => {
    setFormData(task);
  }, [task]);

  // Надежная функция преобразования даты для input type="datetime-local"
  const toInputFormat = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Если дата битая, возвращаем пусто
    // Корректировка часового пояса для корректного отображения
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0, 16);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
    // Внутри EditTaskModal, перед return:
    console.log("DEBUG TASK DATA:", task);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(9,30,66,0.54)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'white', padding: '32px', borderRadius: '12px',
        width: '500px', maxWidth: '90vw', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', color: '#172B4D' }}>
          Редактирование задачи
        </h3>

        {/* Название */}
        <input
          value={formData.title || ''}
          onChange={e => handleChange('title', e.target.value)}
          style={{...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '16px'}}
          placeholder="Название задачи"
        />

        {/* Описание */}
        <textarea
          value={formData.description || ''}
          onChange={e => handleChange('description', e.target.value)}
          style={{...styles.input, width: '100%', height: '80px', boxSizing: 'border-box', marginBottom: '16px', resize: 'vertical'}}
          placeholder="Описание"
        />

        {/* Даты */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6C84', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Начало</label>
            <input
              type="datetime-local"
              value={toInputFormat(formData.startDate)}
              onChange={e => handleChange('startDateAt', e.target.value)}
              style={{...styles.input, width: '100%', boxSizing: 'border-box'}}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#5E6C84', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Дедлайн</label>
            <input
              type="datetime-local"
              value={toInputFormat(formData.deadlineAt)}
              onChange={e => handleChange('deadlineAt', e.target.value)}
              style={{...styles.input, width: '100%', boxSizing: 'border-box'}}
            />
          </div>
        </div>

        {/* Приоритет и Статус */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <select
            value={formData.priority || 'MEDIUM'}
            onChange={e => handleChange('priority', e.target.value)}
            style={{...styles.input, flex: 1}}
          >
            <option value="LOW"> Низкий</option>
            <option value="MEDIUM">🟡 Средний</option>
            <option value="HIGH">🔴 Высокий</option>
          </select>

          <select
            value={formData.status || 'TODO'}
            onChange={e => handleChange('status', e.target.value)}
            style={{...styles.input, flex: 1}}
          >
            <option value="TODO">Новая</option>
            <option value="IN_PROGRESS">В работе</option>
            <option value="DONE">Готово</option>
          </select>
        </div>
        <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: '600', color: '#5E6C84',
                    display: 'block', marginBottom: '8px', textTransform: 'uppercase'
                  }}>
                    Прогресс выполнения: {formData.progressPercent || 0}%
                  </label>
                  <input
                    type="range"
                    min="0" max="100" step="5"
                    value={formData.progressPercent || 0}
                    onChange={e => handleChange('progressPercent', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0052CC', cursor: 'pointer' }}
                  />
                 </div>
        {/* Кнопки */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              ...styles.btnPrimary, background: '#F4F5F7', color: '#172B4D',
              border: '1px solid #DFE1E6', fontWeight: '500'
            }}
          >
            Отмена
          </button>
          <button
            onClick={() => onSave(formData)}
            style={{...styles.btnPrimary, fontWeight: '600'}}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;