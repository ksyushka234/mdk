// src/components/Dashboard/index.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TaskBoard from './TaskBoard';
import TaskList from './TaskList';
import TimelineView from './TimelineView';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  // Стейты для редактирования отделов
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const [activeView, setActiveView] = useState('board');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '', description: '', startDateAt: '', deadlineAt: '',
    priority: 'MEDIUM', assigneeUserId: ''
  });
  const [newDeptName, setNewDeptName] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const navigate = useNavigate();

  // Загрузка данных
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadTasks();
    if (role === 'MANAGER') {
      loadEmployees();
      loadDepartments();
    }
  }, [role]);

  useEffect(() => {
    if (activeView === 'reports') loadStats();
  }, [activeView]);

const loadTasks = async () => {
  try {
    const userId = localStorage.getItem('userId');

    // Проверяем, есть ли userId (иногда там лежит email вместо ID)
    if (!userId || userId.includes('@')) {
      console.warn("Некорректный userId в localStorage:", userId);
      // Если userId - это email, пробуем взять из токена или используем заглушку
      // В идеале нужно чинить Login.jsx, чтобы он сохранял именно ID
    }

    // ДОБАВЛЯЕМ /api/ В НАЧАЛО ПУТИ!
    const url = role === 'MANAGER'
      ? '/tasks'
      : `/tasks/my-tasks?userId=${userId}`;

    const res = await apiClient.get(url);
    setTasks(res.data);
  } catch (err) {
    console.error("Ошибка загрузки задач:", err);
  }
};

  const loadEmployees = async () => {
    try {
      const res = await apiClient.get('/users/employees');
      setEmployees(res.data);
    } catch (err) { console.error(err); }
  };

  const loadDepartments = async () => {
    try {
      const res = await apiClient.get('/departments');
      setDepartments(res.data);
    } catch (err) { console.error(err); }
  };

  const loadStats = async () => {
    try {
      const res = await apiClient.get('/tasks/stats');
      setStats(res.data);
    } catch (err) { console.error("Статистика недоступна:", err); }
  };

  // Фильтрация
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    let matchesDepartment = true;
    if (departmentFilter !== 'ALL') {
      const employee = employees.find(emp => emp.userId === task.assigneeUserId);
      if (employee && employee.departmentId) {
         matchesDepartment = String(employee.departmentId) === String(departmentFilter);
      } else { matchesDepartment = false; }
    }
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  // Подсчет просроченных
  const overdueCount = tasks.filter(t =>
    t.deadlineAt && new Date(t.deadlineAt) < new Date() && t.status !== 'DONE'
  ).length;

    // Логика уведомлений
    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const urgentTasks = tasks.filter(t => {
      if (!t.deadlineAt || t.status === 'DONE') return false;
      const deadline = new Date(t.deadlineAt);
      // Задачи, у которых дедлайн сегодня ИЛИ завтра
      return (deadline >= today && deadline < new Date(tomorrow.getTime() + 86400000));
    }).sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));

  // Вычисляемые значения для KPI
  const totalTasks = stats ? stats.total : tasks.length;
  const doneTasks = stats ? stats.done : tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = stats ? stats.inProgress : tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueTasksLocal = overdueCount;

// Данные для круговой диаграммы (Статусы) - ТЕПЕРЬ ИЗ СЕРВЕРА
const statusData = stats ? [
  { name: 'Новые', value: stats.todo || 0, color: '#6554C0' },
  { name: 'В работе', value: stats.inProgress || 0, color: '#0052CC' },
  { name: 'Готово', value: stats.done || 0, color: '#00875A' },
] : [];

// Данные для столбчатой диаграммы (Приоритеты)
// Пока считаем локально, так как сервер не отдает разбивку по приоритетам.
// Если задач > 1000, лучше добавить поле priorityStats в TaskStatsDto на бэкенде.
const priorityData = tasks.length > 0 ? [
  { name: 'Высокий', value: tasks.filter(t => t.priority === 'HIGH').length, color: '#DE350B' },
  { name: 'Средний', value: tasks.filter(t => t.priority === 'MEDIUM').length, color: '#FF8B00' },
  { name: 'Низкий', value: tasks.filter(t => t.priority === 'LOW').length, color: '#006644' },
] : [];

  const handleCreateTask = async () => {
    try {
      await apiClient.post('/tasks', newTask);
      toast.success('Задача создана!');
      loadTasks();
      setNewTask({ title: '', description: '', startDateAt: '', deadlineAt: '', priority: 'MEDIUM', assigneeUserId: '' });
      setShowCreateModal(false);
    } catch (err) { toast.error('Ошибка создания'); }
  };

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      await apiClient.post('/departments', { name: newDeptName });
      toast.success('Отдел создан');
      setNewDeptName('');
      loadDepartments();
    } catch (err) { toast.error('Ошибка создания отдела'); }
  };

  const handleUpdateDepartment = async () => {
    if (!editDeptName.trim() || !editingDept) return;
    try {
      await apiClient.put(`/departments/${editingDept.id}`, { name: editDeptName });
      toast.success('Отдел обновлен');
      setEditingDept(null);
      loadDepartments();
    } catch (err) {
      toast.error('Ошибка обновления отдела');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Удалить отдел?')) return;
    try {
      await apiClient.delete(`/departments/${id}`);
      toast.success('Отдел удален');
      loadDepartments();
    } catch (err) { toast.error('Ошибка удаления'); }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      const userId = localStorage.getItem('userId');
      await apiClient.put(`/tasks/${taskId}/status`, null, { params: { status, userId } });
      toast.success(`Статус изменён на ${status}`);
      loadTasks();
    } catch (err) { toast.error('Ошибка обновления'); }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirmId) return;
    try {
      await apiClient.delete(`/tasks/${deleteConfirmId}`);
      toast.success("Задача удалена");
      loadTasks();
    } catch (err) { toast.error("Ошибка удаления"); }
    finally { setDeleteConfirmId(null); }
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.put(`/tasks/${editingTask.id}`, editingTask);
      toast.success("Задача обновлена");
      setEditingTask(null);
      loadTasks();
    } catch (err) { toast.error("Ошибка сохранения"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

    const handleExportCSV = () => {
      // 1. Создаем заголовки CSV
      const headers = ['ID', 'Название', 'Статус', 'Приоритет', 'Исполнитель', 'Дедлайн'];

      // 2. Преобразуем задачи в строки CSV
      const rows = filteredTasks.map(task => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`, // Экранируем кавычки
        task.status,
        task.priority,
        task.assignee?.fullName || 'Не назначен',
        task.deadlineAt ? new Date(task.deadlineAt).toLocaleDateString('ru-RU') : '-'
      ]);

      // 3. Собираем всё в одну строку
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 4. Создаем файл и скачиваем его
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `tasks_report_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Отчет успешно скачан!');
    };

  // СТИЛИ TASKFLOW
  const styles = {
    container: { padding: '0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#F4F5F7', minHeight: '100vh', color: '#172B4D' },

    // Хедер
    headerNew: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 24px', background: 'white', borderBottom: '1px solid #EBECF0',
      position: 'sticky', top: 0, zIndex: 100
    },
    logo: { fontSize: '20px', fontWeight: '700', color: '#172B4D', display: 'flex', alignItems: 'center', gap: '8px' },

    // Навигация
    navContainer: { display: 'flex', gap: '4px', marginLeft: '40px' },
    navBtn: {
      padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
      fontWeight: '500', fontSize: '14px', background: 'transparent', color: '#5E6C84',
      transition: 'all 0.2s ease'
    },
    activeNavBtn: { background: '#172B4D', color: 'white' },

    // Элементы управления
    createBtn: { padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' },
    profileCircle: { width: '32px', height: '32px', borderRadius: '50%', background: '#0052CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },

    // KPI Карточки
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '24px 24px 0 24px' },
    kpiCard: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' },
    kpiValue: { fontSize: '32px', fontWeight: '700', lineHeight: '1' },
    kpiLabel: { fontSize: '13px', color: '#5E6C84', fontWeight: '500' },

    // Основной контент
    contentPadding: { padding: '24px' },
    input: { padding: '8px 12px', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', outline: 'none' },
    btnPrimary: { background: '#0052CC', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
    card: { background: 'white', padding: '24px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(9,30,66,0.25)', marginBottom: '20px' },

    // ИИ Аналитика
    aiSection: { background: 'white', borderRadius: '8px', padding: '24px', marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    aiHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '16px', fontWeight: '600' },
    aiBadge: { background: '#E3FCEF', color: '#006644', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' },
    aiRow: { display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' },
    aiLabel: { width: '200px', fontSize: '14px', color: '#172B4D' },
    aiBarContainer: { flex: 1, height: '8px', background: '#EBECF0', borderRadius: '4px', position: 'relative' },
    aiBarFill: { height: '100%', background: '#6554C0', borderRadius: '4px', position: 'absolute', left: 0, top: 0 },
    aiMarker: { position: 'absolute', top: '-4px', width: '2px', height: '16px', background: '#FF5630', zIndex: 2 },
    aiDiff: { width: '60px', textAlign: 'right', fontSize: '13px', fontWeight: '600' },
    aiLegend: { display: 'flex', gap: '24px', marginTop: '16px', fontSize: '12px', color: '#5E6C84' },
    aiLegendItem: { display: 'flex', alignItems: 'center', gap: '6px' }
  };

  const getPriorityColor = (p) => {
    if (p === 'HIGH') return { bg: '#FFEBE6', color: '#DE350B', border: '#DE350B', bar: '#DE350B' };
    if (p === 'LOW') return { bg: '#E3FCEF', color: '#006644', border: '#006644', bar: '#006644' };
    return { bg: '#FFF0B3', color: '#FF8B00', border: '#FF8B00', bar: '#FF8B00' };
  };

  const getStatusColor = (s) => {
    if (s === 'DONE') return { bg: '#E3FCEF', color: '#006644' };
    if (s === 'IN_PROGRESS') return { bg: '#DEEBFF', color: '#0052CC' };
    return { bg: '#F4F5F7', color: '#5E6C84' };
  };

  const commonProps = {
    tasks: filteredTasks, role, employees, departments,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter, departmentFilter, setDepartmentFilter,
    newTask, setNewTask, editingTask, setEditingTask, deleteConfirmId, setDeleteConfirmId,
    handleCreateTask, handleUpdateStatus, handleSaveEdit, handleDeleteTask, styles,
    getPriorityColor, getStatusColor,
  };

  return (
    <div style={styles.container}>
      {/* 1. ХЕДЕР */}
      <div style={styles.headerNew}>
        <div style={styles.logo}>
          <span style={{color: '#0052CC'}}>◆</span> TaskFlow
        </div>

        <div style={styles.navContainer}>
          <button onClick={() => setActiveView('board')} style={activeView==='board'?{...styles.navBtn, ...styles.activeNavBtn}:styles.navBtn}>Доска</button>
          <button onClick={() => setActiveView('list')} style={activeView==='list'?{...styles.navBtn, ...styles.activeNavBtn}:styles.navBtn}>Список</button>
          <button onClick={() => setActiveView('timeline')} style={activeView==='timeline'?{...styles.navBtn, ...styles.activeNavBtn}:styles.navBtn}>Хронология</button>
          <button onClick={() => setActiveView('reports')} style={activeView==='reports'?{...styles.navBtn, ...styles.activeNavBtn}:styles.navBtn}>Отчёты</button>
          {role === 'MANAGER' && (
            <button onClick={() => setActiveView('departments')} style={activeView==='departments'?{...styles.navBtn, ...styles.activeNavBtn}:styles.navBtn}>Отделы</button>
          )}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          {role === 'MANAGER' && (
            <button onClick={() => setShowCreateModal(true)} style={styles.createBtn}>
              + Создать
            </button>
          )}

          {/* УВЕДОМЛЕНИЯ С ВЫПАДАЮЩИМ СПИСКОМ */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: 'pointer', padding: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={urgentTasks.length > 0 ? '#FF5630' : '#5E6C84'} strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>

              {/* Бейдж с количеством срочных задач */}
              {urgentTasks.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  background: '#FF5630', color: 'white', borderRadius: '50%',
                  minWidth: '16px', height: '16px', fontSize: '10px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {urgentTasks.length}
                </span>
              )}
            </div>

            {/* Выпадающее меню уведомлений */}
            {showNotifications && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                width: '320px', background: 'white', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 200,
                border: '1px solid #EBECF0', overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #EBECF0', fontWeight: '600', fontSize: '14px', color: '#172B4D' }}>
                  Срочные дедлайны
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {urgentTasks.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#5E6C84', fontSize: '13px' }}>
                      Нет срочных задач
                    </div>
                  ) : (
                    urgentTasks.map(task => {
                      const isToday = new Date(task.deadlineAt).toDateString() === today.toDateString();
                      return (
                        <div key={task.id} style={{
                          padding: '12px 16px', borderBottom: '1px solid #F4F5F7',
                          cursor: 'pointer', transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F4F5F7'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        onClick={() => {
                          setEditingTask(task); // Открываем модалку редактирования
                          setShowNotifications(false);
                        }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#172B4D', marginBottom: '4px' }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '11px', color: isToday ? '#FF5630' : '#FF8B00', fontWeight: '600' }}>
                            {isToday ? '🔴 Истекает СЕГОДНЯ' : ' Истекает ЗАВТРА'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          {/* КОНЕЦ БЛОКА УВЕДОМЛЕНИЙ */}

          <div
            onClick={() => navigate('/profile')}
            style={{...styles.profileCircle, cursor: 'pointer', transition: 'transform 0.2s'}}
            title="Перейти в профиль"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            КК
          </div>
        </div>
      </div>

      {/* 2. KPI КАРТОЧКИ */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{...styles.kpiValue, color: '#172B4D'}}>{totalTasks}</div>
          <div style={styles.kpiLabel}>всего задач</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{...styles.kpiValue, color: '#006644'}}>{doneTasks}</div>
          <div style={styles.kpiLabel}>выполнено</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{...styles.kpiValue, color: '#0052CC'}}>{inProgressTasks}</div>
          <div style={styles.kpiLabel}>в работе</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{...styles.kpiValue, color: '#FF5630'}}>{overdueTasksLocal}</div>
          <div style={styles.kpiLabel}>просрочено</div>
        </div>
      </div>
            {/* ПАНЕЛЬ ПОИСКА И ФИЛЬТРОВ */}
            {['board', 'list', 'timeline'].includes(activeView) && (
              <div style={{
                padding: '0 24px', marginTop: '24px', marginBottom: '0'
              }}>
                <div style={{
                  background: 'white', borderRadius: '8px', padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: '12px', alignItems: 'center'
                }}>
                  {/* Поле поиска */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E6C84" strokeWidth="2"
                         style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск задач по названию или описанию..."
                      style={{
                        ...styles.input, width: '100%', paddingLeft: '36px', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Фильтр по статусу */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{...styles.input, minWidth: '140px'}}
                  >
                    <option value="ALL">Все статусы</option>
                    <option value="TODO">Новые</option>
                    <option value="IN_PROGRESS">В работе</option>
                    <option value="DONE">Готово</option>
                  </select>

                  {/* Фильтр по приоритету */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{...styles.input, minWidth: '140px'}}
                  >
                    <option value="ALL">Все приоритеты</option>
                    <option value="HIGH">Высокий</option>
                    <option value="MEDIUM">Средний</option>
                    <option value="LOW">Низкий</option>
                  </select>

                  {/* Кнопка сброса */}
                  {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('ALL');
                        setPriorityFilter('ALL');
                      }}
                      style={{
                        background: 'transparent', border: 'none', color: '#5E6C84',
                        cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap'
                      }}
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>
            )}
      {/* 3. ИИ-АНАЛИТИКА */}
      {activeView === 'board' && (
        <div style={{ padding: '0 24px', marginTop: '24px' }}>
          <div style={styles.aiSection}>
            <div style={styles.aiHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6554C0" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              ИИ-аналитика сроков
              <span style={styles.aiBadge}>Ollama</span>
            </div>

            <div style={styles.aiRow}>
              <div style={styles.aiLabel}>Настройка CI/CD</div>
              <div style={styles.aiBarContainer}>
                <div style={{...styles.aiBarFill, width: '70%'}}></div>
                <div style={{...styles.aiMarker, left: '80%'}}></div>
              </div>
              <div style={{...styles.aiDiff, color: '#FF5630'}}>+2 ч</div>
            </div>

            <div style={styles.aiRow}>
              <div style={styles.aiLabel}>Авторизация</div>
              <div style={styles.aiBarContainer}>
                <div style={{...styles.aiBarFill, width: '60%'}}></div>
                <div style={{...styles.aiMarker, left: '55%'}}></div>
              </div>
              <div style={{...styles.aiDiff, color: '#006644'}}>-1 ч</div>
            </div>

            <div style={styles.aiLegend}>
              <div style={styles.aiLegendItem}>
                <div style={{width: '12px', height: '4px', background: '#6554C0', borderRadius: '2px'}}></div>
                Оценка ИИ
              </div>
              <div style={styles.aiLegendItem}>
                <div style={{width: '2px', height: '12px', background: '#FF5630'}}></div>
                Фактическое время
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ОСНОВНОЙ КОНТЕНТ */}
      <div style={styles.contentPadding}>
        {activeView === 'board' && <TaskBoard {...commonProps} />}
        {activeView === 'list' && <TaskList {...commonProps} />}
        {activeView === 'timeline' && <TimelineView {...commonProps} />}

        {/* РАЗДЕЛ ОТЧЁТЫ С КНОПКОЙ ЭКСПОРТА */}
        {activeView === 'reports' && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#172B4D' }}>Статистика выполнения задач</h3>
              <button onClick={handleExportCSV} style={{...styles.btnPrimary, background: '#006644', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Скачать CSV
              </button>
            </div>

            {/* Графики */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Круговая диаграмма: Статусы */}
              <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#5E6C84', textTransform: 'uppercase' }}>Распределение по статусам</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', fontSize: '12px' }}>
                  {statusData.map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Столбчатая диаграмма: Приоритеты */}
              <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#5E6C84', textTransform: 'uppercase' }}>Задачи по приоритетам</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Старые карточки статистики (оставляем как дополнение) */}
            {stats ? (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <div style={{background: '#F4F5F7', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>
                  <div style={{fontSize: '12px', color: '#5E6C84', textTransform: 'uppercase', fontWeight: '600'}}>Всего</div>
                  <div style={{fontSize: '32px', fontWeight: '700', margin: '8px 0', color: '#172B4D'}}>{stats.total}</div>
                </div>
                <div style={{background: '#E3FCEF', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>
                  <div style={{fontSize: '12px', color: '#006644', textTransform: 'uppercase', fontWeight: '600'}}>Выполнено</div>
                  <div style={{fontSize: '32px', fontWeight: '700', margin: '8px 0', color: '#006644'}}>{stats.done}</div>
                </div>
                <div style={{background: '#DEEBFF', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>
                  <div style={{fontSize: '12px', color: '#0052CC', textTransform: 'uppercase', fontWeight: '600'}}>В работе</div>
                  <div style={{fontSize: '32px', fontWeight: '700', margin: '8px 0', color: '#0052CC'}}>{stats.inProgress}</div>
                </div>
                <div style={{background: '#FFEBE6', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>
                  <div style={{fontSize: '12px', color: '#DE350B', textTransform: 'uppercase', fontWeight: '600'}}>Просрочено</div>
                  <div style={{fontSize: '32px', fontWeight: '700', margin: '8px 0', color: '#DE350B'}}>{stats.overdue || 0}</div>
                </div>
              </div>
            ) : <p style={{color: '#5E6C84', textAlign: 'center', padding: '20px'}}>Загрузка статистики...</p>}
          </div>
        )}

        {/* УПРАВЛЕНИЕ ОТДЕЛАМИ */}
        {activeView === 'departments' && role === 'MANAGER' && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#172B4D' }}>Управление отделами</h2>

              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  placeholder="Название нового отдела"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  style={{...styles.input, width: '300px'}}
                />
                <button onClick={handleCreateDepartment} style={styles.createBtn}>
                  + Создать отдел
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {departments.map(dept => (
                <div key={dept.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #EBECF0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                }}
                >
                  <div>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '8px',
                      background: '#E3FCEF', color: '#006644',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '12px', fontSize: '20px'
                    }}>

                    </div>

                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#172B4D' }}>
                      {dept.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#5E6C84' }}>
                      ID: {dept.id} • {employees.filter(e => e.departmentId === dept.id).length} сотрудников
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={() => { setEditingDept(dept); setEditDeptName(dept.name); }}
                      style={{
                        padding: '8px 16px', border: 'none', borderRadius: '6px',
                        background: '#DEEBFF', color: '#0052CC', fontWeight: '600', cursor: 'pointer',
                        fontSize: '13px', flex: 1, transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#B3D4FF'}
                      onMouseLeave={(e) => e.target.style.background = '#DEEBFF'}
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      style={{
                        padding: '8px 16px', border: 'none', borderRadius: '6px',
                        background: '#FFEBE6', color: '#DE350B', fontWeight: '600', cursor: 'pointer',
                        fontSize: '13px', flex: 1, transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#FFBDAD'}
                      onMouseLeave={(e) => e.target.style.background = '#FFEBE6'}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}

              {departments.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#A5ADBA',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DFE1E6" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <div style={{fontSize: '14px', fontWeight: '500'}}>Отделы еще не созданы</div>
                  <div style={{fontSize: '12px'}}>Добавьте первый отдел через форму выше</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* МОДАЛКИ ЗАДАЧ */}
      {showCreateModal && <CreateTaskModal {...commonProps} onClose={() => setShowCreateModal(false)} />}
      {editingTask && <EditTaskModal task={editingTask} onSave={handleSaveEdit} onCancel={() => setEditingTask(null)} styles={styles} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />}

      {deleteConfirmId && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'white', padding:'24px', borderRadius:'8px', maxWidth:'400px', width:'100%'}}>
            <h3 style={{marginTop:0}}>Подтвердите удаление</h3>
            <p>Вы уверены, что хотите удалить эту задачу?</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'20px'}}>
              <button onClick={()=>setDeleteConfirmId(null)} style={{...styles.btnPrimary, background:'#DFE1E6', color:'#172B4D'}}>Отмена</button>
              <button onClick={handleDeleteTask} style={{...styles.btnPrimary, background:'#FF5630'}}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ ОТДЕЛА */}
      {editingDept && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9,30,66,0.54)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '12px',
            width: '400px', maxWidth: '90vw', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#172B4D' }}>
              Редактирование отдела
            </h3>

            <input
              value={editDeptName}
              onChange={e => setEditDeptName(e.target.value)}
              style={{...styles.input, width: '100%', boxSizing: 'border-box', marginBottom: '20px'}}
              placeholder="Название отдела"
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setEditingDept(null)}
                style={{
                  ...styles.btnPrimary, background: '#F4F5F7', color: '#172B4D',
                  border: '1px solid #DFE1E6'
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleUpdateDepartment}
                style={{...styles.btnPrimary}}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;