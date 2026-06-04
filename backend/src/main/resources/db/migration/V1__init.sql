-- Если таблицы уже есть — удалим их (безопасно!)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS managers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Таблица ролей (EMPLOYEE, MANAGER, ADMIN)
CREATE TABLE roles (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Таблица пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(20) NOT NULL REFERENCES roles(code),
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMP
);

-- Таблица сотрудников
CREATE TABLE employees (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    department_id BIGINT
);

-- Таблица руководителей
CREATE TABLE managers (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL
);

-- Таблица отделов
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    manager_id BIGINT REFERENCES managers(user_id)
);

-- Таблица задач
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    deadline_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(10),
    department_id BIGINT REFERENCES departments(id),
    assignee_id BIGINT REFERENCES employees(user_id),
    author_id BIGINT REFERENCES managers(user_id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP,
    progress_percent INT CHECK (progress_percent >= 0 AND progress_percent <= 100)
);

-- Журнал активности
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    event_type VARCHAR(30) NOT NULL,
    event_time TIMESTAMP DEFAULT NOW() NOT NULL,
    details JSONB
);

-- Таблица команд
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    manager_id BIGINT REFERENCES managers(user_id)
);

-- Добавляем роли
INSERT INTO roles (code, name) VALUES
('EMPLOYEE', 'Сотрудник'),
('MANAGER', 'Руководитель'),
('ADMIN', 'Администратор');