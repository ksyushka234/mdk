// frontend/src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    fullName: '',
    position: '',
    role: 'EMPLOYEE',
    departmentId: '' // Поле для ID отдела
  });

  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  // Загружаем список отделов при открытии формы регистрации
  useEffect(() => {
    apiClient.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error("Не удалось загрузить отделы:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Отправляем departmentId как число или null, если не выбран
      const payload = {
        ...formData,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null
      };

      await apiClient.post('/auth/register', payload);
      toast.success('Регистрация успешна! Теперь войдите.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Регистрация</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input name="login" placeholder="Логин (Email)" value={formData.login} onChange={handleChange} required style={{ padding: '10px', border: '1px solid #DFE1E6', borderRadius: '4px' }} />

        <input name="password" type="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required style={{ padding: '10px', border: '1px solid #DFE1E6', borderRadius: '4px' }} />

        <input name="fullName" placeholder="ФИО" value={formData.fullName} onChange={handleChange} required style={{ padding: '10px', border: '1px solid #DFE1E6', borderRadius: '4px' }} />

        <input name="position" placeholder="Должность" value={formData.position} onChange={handleChange} style={{ padding: '10px', border: '1px solid #DFE1E6', borderRadius: '4px' }} />

        {/* ВЫПАДАЮЩИЙ СПИСОК ОТДЕЛОВ */}
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white' }}
        >
          <option value="">-- Выберите отдел --</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        <select name="role" value={formData.role} onChange={handleChange} style={{ padding: '10px', border: '1px solid #DFE1E6', borderRadius: '4px', background: 'white' }}>
          <option value="EMPLOYEE">Сотрудник</option>
          <option value="MANAGER">Руководитель</option>
        </select>

        <button type="submit" style={{ padding: '12px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Зарегистрироваться
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: '#0052CC' }}>Войти</Link>
      </p>
    </div>
  );
}

export default Register;