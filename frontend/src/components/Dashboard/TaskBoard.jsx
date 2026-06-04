// src/components/Dashboard/TaskBoard.jsx
import React from 'react';

// Компонент отдельной карточки задачи
const TaskCard = ({ task, role, onEdit, getPriorityColor, getStatusColor, setDeleteConfirmId }) => {
  const pCol = getPriorityColor(task.priority);
  const sCol = getStatusColor(task.status);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        boxShadow: '0 1px 2px rgba(9,30,66,0.15)',
        cursor: role === 'MANAGER' ? 'pointer' : 'default',
        borderLeft: `4px solid ${pCol.bar}`, // Цветная полоска приоритета
        transition: 'box-shadow 0.2s ease'
      }}
      onClick={() => role === 'MANAGER' && onEdit(task)}
      onMouseEnter={(e) => {
        if (role === 'MANAGER') e.currentTarget.style.boxShadow = '0 4px 8px rgba(9,30,66,0.2)';
      }}
      onMouseLeave={(e) => {
        if (role === 'MANAGER') e.currentTarget.style.boxShadow = '0 1px 2px rgba(9,30,66,0.15)';
      }}
    >
      {/* Заголовок задачи */}
      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', lineHeight: '1.4', color: '#172B4D' }}>
        {task.title}
      </div>

      {/* 👇 ПРОГРЕСС-БАР (Появляется только в статусе IN_PROGRESS) 👇 */}
      {task.status === 'IN_PROGRESS' && task.progressPercent != null && (
        <div style={{ marginTop: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5E6C84', marginBottom: '4px' }}>
            <span>Прогресс</span>
            <span style={{ fontWeight: '600', color: '#172B4D' }}>{task.progressPercent}%</span>
          </div>
          <div style={{ height: '4px', background: '#EBECF0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${task.progressPercent}%`,
              background: '#0052CC',
              borderRadius: '2px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      )}
      {/*  КОНЕЦ ПРОГРЕСС-БАРА  */}

      {/* Нижняя панель: теги + исполнитель + удаление */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6B778C' }}>

        {/* Левая часть: Приоритет и Статус */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            padding: '2px 6px', borderRadius: '3px', fontWeight: '700', fontSize: '10px',
            background: pCol.bg, color: pCol.color, textTransform: 'uppercase'
          }}>
            {task.priority === 'HIGH' ? 'Высокий' : task.priority === 'LOW' ? 'Низкий' : 'Средний'}
          </span>
          <span style={{
            padding: '2px 6px', borderRadius: '3px', fontWeight: '700', fontSize: '10px',
            background: sCol.bg, color: sCol.color, textTransform: 'uppercase'
          }}>
            {task.status === 'TODO' ? 'Новая' : task.status === 'IN_PROGRESS' ? 'В работе' : 'Готово'}
          </span>
        </div>

        {/* Правая часть: Аватар, Дата и Кнопка Удаления */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           {/* Аватар исполнителя */}
           {task.assignee?.fullName && (
             <div title={task.assignee.fullName} style={{
               width: '20px', height: '20px', borderRadius: '50%',
               background: '#0052CC', color: 'white',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: '10px', fontWeight: '600'
             }}>
               {task.assignee.fullName.charAt(0).toUpperCase()}
             </div>
           )}

           {/* Дедлайн */}
           {task.deadlineAt && (
             <span style={{ fontWeight: '500' }}>
               {new Date(task.deadlineAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
             </span>
           )}

           {/* КНОПКА УДАЛЕНИЯ (Только для менеджеров) */}
           {role === 'MANAGER' && setDeleteConfirmId && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setDeleteConfirmId(task.id);
               }}
               style={{
                 marginLeft: '4px', border: 'none', background: 'transparent',
                 cursor: 'pointer', color: '#FF5630', padding: '4px',
                 display: 'flex', alignItems: 'center', borderRadius: '4px',
                 opacity: 0.7, transition: 'opacity 0.2s'
               }}
               onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
               onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
               title="Удалить задачу"
             >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <polyline points="3 6 5 6 21 6"></polyline>
                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
               </svg>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

// Основной компонент доски
function TaskBoard({ tasks, role, setEditingTask, styles, getPriorityColor, getStatusColor, setDeleteConfirmId }) {
  const columns = [
    { id: 'TODO', title: 'НОВЫЕ / BACKLOG' },
    { id: 'IN_PROGRESS', title: 'В РАБОТЕ' },
    { id: 'DONE', title: 'ГОТОВО' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      height: 'calc(100vh - 200px)', // Адаптируем высоту под новый хедер
      overflowX: 'auto',
      paddingBottom: '20px',
      alignItems: 'flex-start'
    }}>
      {columns.map(status => (
        <div key={status.id} style={{
          flex: '1 1 300px',
          minWidth: '300px',
          background: '#EBECF0', // Светло-серый фон колонки как в Jira/TaskFlow
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%'
        }}>
          {/* Заголовок колонки */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            padding: '0 4px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#5E6C84', textTransform: 'uppercase' }}>
              {status.title}
            </span>
            <span style={{
              background: '#DFE1E6', color: '#5E6C84',
              borderRadius: '10px', padding: '2px 8px',
              fontSize: '12px', fontWeight: '600'
            }}>
              {tasks.filter(t => t.status === status.id).length}
            </span>
          </div>

          {/* Список задач в колонке */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', minHeight: '50px' }}>
            {tasks.filter(t => t.status === status.id).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                role={role}
                onEdit={setEditingTask}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                setDeleteConfirmId={setDeleteConfirmId}
              />
            ))}

            {tasks.filter(t => t.status === status.id).length === 0 && (
              <div style={{
                textAlign: 'center', padding: '40px 20px', color: '#A5ADBA',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
              }}>
                {/* Иконка пустой папки */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DFE1E6" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>

                <div>
                  <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '4px'}}>Задач пока нет</div>
                  {role === 'MANAGER' ? (
                    <div style={{fontSize: '12px'}}>Нажмите «+ Создать», чтобы добавить первую задачу</div>
                  ) : (
                    <div style={{fontSize: '12px'}}>Менеджер еще не назначил вам задачи</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;