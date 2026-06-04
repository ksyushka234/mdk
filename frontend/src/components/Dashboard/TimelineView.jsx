// src/components/Dashboard/TimelineView.jsx
import React, { useState, useRef, useEffect } from 'react';

function TimelineView({ tasks, getPriorityColor }) {
  const days = 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 5);
  startDate.setHours(0, 0, 0, 0); // Сброс времени для точности

  const dayWidth = 60; // Чуть шире для удобства
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  // Синхронизация скролла: когда скроллим тело, двигаем шапку
  const handleScroll = () => {
    if (headerRef.current && bodyRef.current) {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    }
  };

  // Форматирование даты на русский
  const formatDateRu = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Генерация дней
  const timelineDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)',
      background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'
    }}>

      {/* ШАПКА ТАБЛИЦЫ ( Sticky Left Column + Scrollable Dates ) */}
      <div ref={headerRef} style={{
        display: 'flex', borderBottom: '1px solid #EBECF0', background: '#FAFBFC',
        overflow: 'hidden', flexShrink: 0
      }}>
        {/* Левая колонка "ЗАДАЧА" (фиксированная) */}
        <div style={{
          width: '300px', minWidth: '300px', padding: '12px 16px', fontWeight: '700',
          fontSize: '12px', color: '#5E6C84', borderRight: '1px solid #EBECF0',
          background: '#FAFBFC', zIndex: 20, position: 'sticky', left: 0
        }}>
          ЗАДАЧА
        </div>

        {/* Даты (скроллятся) */}
        <div style={{ display: 'flex', flex: 1 }}>
          {timelineDays.map((d, i) => (
            <div key={i} style={{
              width: `${dayWidth}px`, textAlign: 'center', fontSize: '11px',
              padding: '12px 0', borderRight: '1px solid #f0f0f0', color: '#5E6C84', flexShrink: 0
            }}>
              <div style={{ fontWeight: '600' }}>{d.getDate()}</div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                {d.toLocaleString('ru', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ТЕЛО ТАБЛИЦЫ */}
      <div ref={bodyRef} onScroll={handleScroll} style={{ overflow: 'auto', flex: 1 }}>
        {tasks.map(t => {
          // Расчет позиции задачи
          const taskDate = new Date(t.deadlineAt || t.createdAt);
          taskDate.setHours(0, 0, 0, 0);

          const diffTime = taskDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Длительность (если есть start_date, считаем разницу, иначе берем дефолт)
          const durationDays = 3;

          let leftPos = diffDays * dayWidth;
          let width = durationDays * dayWidth;

          // Обрезка слева
          if (leftPos < 0) { width += leftPos; leftPos = 0; }
          // Пропуск если справа за экраном
          if (leftPos > days * dayWidth) return null;

          const pCol = getPriorityColor(t.priority);
          const [hovered, setHovered] = useState(false);

          return (
            <div key={t.id} style={{
              display: 'flex', borderBottom: '1px solid #f9f9f9', height: '50px',
              alignItems: 'center', position: 'relative'
            }}>

              {/* Название задачи (Sticky Left) */}
              <div style={{
                width: '300px', minWidth: '300px', padding: '0 16px', fontSize: '13px',
                fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                borderRight: '1px solid #EBECF0', boxSizing: 'border-box', flexShrink: 0,
                position: 'sticky', left: 0, background: 'white', zIndex: 10
              }}>
                {t.title}
              </div>

              {/* Область сетки и полосок */}
              <div style={{ position: 'relative', height: '100%', width: `${days * dayWidth}px`, flexShrink: 0 }}>

                {/* Фоновая сетка */}
                <div style={{ display: 'flex', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
                  {timelineDays.map((_, i) => (
                    <div key={i} style={{ width: `${dayWidth}px`, borderRight: '1px solid #f9f9f9', height: '100%' }} />
                  ))}
                </div>

                {/* Полоска задачи */}
                {width > 0 && (
                  <div
                    style={{
                      position: 'absolute', height: '28px', borderRadius: '4px', top: '11px',
                      left: `${leftPos}px`, width: `${Math.max(width - 4, 4)}px`,
                      background: pCol.bar || '#0052CC', display: 'flex', alignItems: 'center',
                      paddingLeft: '8px', fontSize: '11px', color: 'white', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      zIndex: 5, cursor: 'pointer', transition: 'transform 0.1s'
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scaleY(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                  >
                    {t.status === 'TODO' ? 'НОВАЯ' : t.status === 'IN_PROGRESS' ? 'В РАБОТЕ' : 'ГОТОВО'}

                    {/* 🔥 JIRA-STYLE TOOLTIP 🔥 */}
                    {hovered && (
                      <div style={{
                        position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                        background: '#172b4d', color: 'white', padding: '8px 12px', borderRadius: '4px',
                        fontSize: '12px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 100,
                        marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'left'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>{t.title}</div>
                        <div style={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
                           📅 {formatDateRu(t.createdAt)} — {formatDateRu(t.deadlineAt)}
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.7 }}>
                          Исполнитель: {t.assignee?.fullName || 'Не назначен'}
                        </div>

                        {/* Стрелочка вниз */}
                        <div style={{
                          position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px',
                          borderWidth: '6px', borderStyle: 'solid', borderColor: '#172b4d transparent transparent transparent'
                        }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelineView;