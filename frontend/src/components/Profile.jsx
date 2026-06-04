// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  // Берем имя из localStorage, чтобы не зависеть от API
  const [userName, setUserName] = useState(localStorage.getItem('fullName') || 'Пользователь');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    // Загружаем ТОЛЬКО списки для аналитики (без запроса текущего юзера)
    Promise.all([
      apiClient.get('/tasks').catch(() => ({data: []})), // Если ошибка - пустой массив
      apiClient.get('/users/employees').catch(() => ({data: []}))
    ])
    .then(([tasksRes, empRes]) => {
      setTasks(tasksRes.data || []);
      setEmployees(empRes.data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Ошибка загрузки:", err);
      setLoading(false); // Не блокируем экран, показываем что есть
    });
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Загрузка профиля...</div>;

  // --- АНАЛИТИКА ---
  const teamWorkload = employees.map(emp => {
    const activeCount = tasks.filter(t =>
      t.assignee?.id === emp.id &&
      (t.status === 'IN_PROGRESS' || t.status === 'TODO')
    ).length;
    return { ...emp, activeCount };
  }).sort((a, b) => b.activeCount - a.activeCount);

  const criticalTasks = tasks.filter(t => {
    const isHighPriority = t.priority === 'HIGH' && t.status !== 'DONE';
    const isOverdue = t.deadlineAt && new Date(t.deadlineAt) < new Date() && t.status !== 'DONE';
    return isHighPriority || isOverdue;
  }).slice(0, 5);

  const totalActive = tasks.filter(t => t.status !== 'DONE').length;
  const overdueCount = tasks.filter(t => t.deadlineAt && new Date(t.deadlineAt) < new Date() && t.status !== 'DONE').length;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', fontFamily: '-apple-system, sans-serif' }}>
        <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: '#5E6C84', fontSize: '14px', fontWeight: '500',
                  marginBottom: '24px', padding: '0',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#172B4D'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#5E6C84'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Вернуться на доску
              </button>
      {/* ШАПКА ПРОФИЛЯ (Безопасная, без API) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700' }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#172B4D' }}>{userName}</h2>
          <p style={{ margin: 0, color: '#5E6C84', fontSize: '14px' }}>
            {role === 'MANAGER' ? 'Руководитель проекта' : 'Сотрудник'}
          </p>
        </div>
      </div>

      {/* БЛОК МЕНЕДЖЕРА */}
      {role === 'MANAGER' && (
        <>
          {/* KPI ПАНЕЛЬ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={styles.card}>
              <div style={styles.label}>Активных задач</div>
              <div style={{...styles.value, color: '#0052CC'}}>{totalActive}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.label}>Просрочено</div>
              <div style={{...styles.value, color: overdueCount > 0 ? '#FF5630' : '#006644'}}>{overdueCount}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.label}>Сотрудников</div>
              <div style={{...styles.value, color: '#172B4D'}}>{employees.length}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* 1. ОБЗОР КОМАНДЫ */}
            <div style={styles.card}>
              <h3 style={{marginTop: 0, fontSize: '16px', color: '#172B4D', marginBottom: '16px'}}> Загрузка команды</h3>
              {teamWorkload.length === 0 ? <p style={{color:'#A5ADBA'}}>Нет данных о сотрудниках</p> : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {teamWorkload.map(emp => (
                    <div key={emp.id} style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#EBECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600'}}>
                        {(emp.fullName || '?').charAt(0)}
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: '14px', fontWeight: '500', marginBottom: '4px'}}>{emp.fullName}</div>
                        <div style={{height: '6px', background: '#EBECF0', borderRadius: '3px', overflow: 'hidden'}}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((emp.activeCount / 5) * 100, 100)}%`,
                            background: emp.activeCount > 4 ? '#FF5630' : emp.activeCount > 2 ? '#FF8B00' : '#006644',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      <div style={{fontSize: '12px', fontWeight: '600', color: '#5E6C84', width: '60px', textAlign: 'right'}}>
                        {emp.activeCount} зад.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. КРИТИЧЕСКИЕ ЗАДАЧИ */}
            <div style={styles.card}>
              <h3 style={{marginTop: 0, fontSize: '16px', color: '#172B4D', marginBottom: '16px'}}>️ Требуют внимания</h3>
              {criticalTasks.length === 0 ? <p style={{color:'#A5ADBA'}}>Все задачи в порядке!</p> : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {criticalTasks.map(task => (
                    <div key={task.id} style={{padding: '12px', background: '#FFEBE6', borderRadius: '8px', borderLeft: '4px solid #FF5630'}}>
                      <div style={{fontSize: '14px', fontWeight: '600', color: '#DE350B', marginBottom: '4px'}}>{task.title}</div>
                      <div style={{fontSize: '12px', color: '#BF2600'}}>
                        {task.priority === 'HIGH' ? 'Высокий приоритет' : 'Просрочен дедлайн'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* БЛОК СОТРУДНИКА */}
      {role !== 'MANAGER' && (
        <div style={styles.card}>
          <h3 style={{marginTop: 0}}>Ваша личная статистика</h3>
          <p>Раздел в разработке...</p>
        </div>
      )}

      {/* КНОПКА ВЫХОДА */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', marginTop: '32px', padding: '14px', border: 'none', borderRadius: '8px',
          background: '#FFEBE6', color: '#DE350B', fontWeight: '600', cursor: 'pointer',
          fontSize: '16px', transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = '#FFBDAD'}
        onMouseLeave={(e) => e.target.style.background = '#FFEBE6'}
      >
        Выйти из аккаунта
      </button>

    </div>
  );
}

const styles = {
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  label: { fontSize: '12px', color: '#5E6C84', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' },
  value: { fontSize: '32px', fontWeight: '700', lineHeight: '1' }
};

export default Profile;