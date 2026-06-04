// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api'; // Убедись, что путь правильный
import { toast } from 'react-toastify';

function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Проверь, какой эндпоинт у тебя на бэкенде: /auth/login или просто /login
      const res = await apiClient.post('/auth/login', { login, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('login', res.data.login);

       try {
            const payload = JSON.parse(atob(res.data.token.split('.')[1]));
            // Обычно ID лежит в поле 'sub' или 'id'. Проверь свой токен!
            const userId = payload.sub || payload.id || payload.userId;
            if (userId) {
              localStorage.setItem('userId', String(userId));
            } else {
              console.warn("Не удалось найти userId в токене. Payload:", payload);
              // Временный фолбэк, чтобы не ломалось прямо сейчас
              localStorage.setItem('userId', '1');
            }
          } catch (decodeErr) {
            console.error("Ошибка декодирования токена:", decodeErr);
            localStorage.setItem('userId', '1');
          }

      toast.success('Добро пожаловать!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Неверный логин или пароль');
    }
  };

  // СТИЛИ В СТИЛЕ APPLE
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF', // Чистый белый фон
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '20px'
    },
    formWrapper: {
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#1D1D1F',
      marginBottom: '40px',
      letterSpacing: '-0.5px'
    },
    inputGroup: {
      marginBottom: '16px',
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '16px',
      fontSize: '17px',
      border: '1px solid #D2D2D7',
      borderRadius: '12px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
      background: '#FFFFFF'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '17px',
      fontWeight: '500',
      color: '#FFFFFF',
      background: '#0071E3', // Синий Apple
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background 0.2s'
    },
    link: {
      marginTop: '24px',
      fontSize: '14px',
      color: '#0071E3',
      textDecoration: 'none',
      display: 'inline-block'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Task Manager</h1>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Email или логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Войти
          </button>
        </form>

        <Link to="/register" style={styles.link}>
          Нет аккаунта? Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}

export default Login;