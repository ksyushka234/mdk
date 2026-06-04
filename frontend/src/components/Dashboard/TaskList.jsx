// src/components/Dashboard/TaskList.jsx
import React from 'react';

function TaskList({
  tasks,
  role,
  setEditingTask,
  styles,
  getPriorityColor,
  getStatusColor
}) {

  // Функция форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Заголовок таблицы */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 2fr 120px 120px 1fr 120px',
        padding: '12px 24px',
        background: '#F4F5F7',
        borderBottom: '1px solid #EBECF0',
        fontSize: '12px',
        fontWeight: '600',
        color: '#5E6C84',
        textTransform: 'uppercase'
      }}>
        <div>Ключ</div>
        <div>Тема</div>
        <div>Статус</div>
        <div>Приоритет</div>
        <div>Исполнитель</div>
        <div>Дедлайн</div>
      </div>

      {/* Строки задач */}
      {tasks.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#A5ADBA' }}>
          Нет задач для отображения
        </div>
      ) : (
        tasks.map((task, index) => {
          const pCol = getPriorityColor(task.priority);
          const sCol = getStatusColor(task.status);

          return (
            <div
              key={task.id}
              onClick={() => role === 'MANAGER' && setEditingTask(task)}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 2fr 120px 120px 1fr 120px',
                padding: '16px 24px',
                borderBottom: index !== tasks.length - 1 ? '1px solid #EBECF0' : 'none',
                alignItems: 'center',
                cursor: role === 'MANAGER' ? 'pointer' : 'default',
                transition: 'background 0.2s ease',
                background: 'white'
              }}
              onMouseEnter={(e) => {
                if (role === 'MANAGER') e.currentTarget.style.background = '#F4F5F7';
              }}
              onMouseLeave={(e) => {
                if (role === 'MANAGER') e.currentTarget.style.background = 'white';
              }}
            >
              {/* Ключ задачи */}
              <div style={{ fontSize: '13px', color: '#0052CC', fontWeight: '500' }}>
                TASK-{task.id}
              </div>

              {/* Тема */}
              <div style={{ fontSize: '14px', color: '#172B4D', fontWeight: '500' }}>
                {task.title}
              </div>

              {/* Статус */}
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: sCol.bg,
                  color: sCol.color,
                  textTransform: 'uppercase'
                }}>
                  {task.status === 'TODO' ? 'Новая' :
                   task.status === 'IN_PROGRESS' ? 'В работе' : 'Готово'}
                </span>
              </div>

              {/* Приоритет */}
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: pCol.bg,
                  color: pCol.color,
                  textTransform: 'uppercase'
                }}>
                  {task.priority === 'HIGH' ? 'Высокий' :
                   task.priority === 'LOW' ? 'Низкий' : 'Средний'}
                </span>
              </div>

              {/* Исполнитель */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {task.assignee?.fullName ? (
                  <>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: '#0052CC', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '600'
                    }}>
                      {task.assignee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '13px', color: '#172B4D' }}>
                      {task.assignee.fullName}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '13px', color: '#A5ADBA', fontStyle: 'italic' }}>
                    Не назначен
                  </span>
                )}
              </div>

              {/* Дедлайн */}
              <div style={{ fontSize: '13px', color: '#172B4D' }}>
                {formatDate(task.deadlineAt)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default TaskList;