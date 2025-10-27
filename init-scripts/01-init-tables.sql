-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with authentication fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'user')) NOT NULL DEFAULT 'user',
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(255),
    position VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Authentication fields
    password_hash VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(512),
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    lock_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('planned', 'active', 'completed', 'on-hold')) NOT NULL DEFAULT 'planned',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    manager_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Phases table
CREATE TABLE IF NOT EXISTS phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('not-started', 'in-progress', 'completed')) NOT NULL DEFAULT 'not-started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('todo', 'in-progress', 'review', 'completed')) NOT NULL DEFAULT 'todo',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'medium',
    assignee_id UUID NOT NULL REFERENCES users(id),
    reporter_id UUID NOT NULL REFERENCES users(id),
    due_date DATE NOT NULL,
    estimated_hours DECIMAL(10,2) NOT NULL,
    actual_hours DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Authentication support tables
CREATE TABLE IF NOT EXISTS revoked_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS login_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token_id ON revoked_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_login_audit_user_time ON login_audit_log(user_id, login_time);
CREATE INDEX IF NOT EXISTS idx_login_audit_time ON login_audit_log(login_time);

-- Insert sample users with temporary passwords (users will need to reset on first login)
INSERT INTO users (id, email, name, role, is_active, department, position, password_hash) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@company.com', 'System Admin', 'admin', true, 'IT', 'System Administrator', '$2b$10$exampletemporarypasswordhashforreset'),
    ('22222222-2222-2222-2222-222222222222', 'manager@company.com', 'Project Manager', 'manager', true, 'Operations', 'Project Manager', '$2b$10$exampletemporarypasswordhashforreset'),
    ('33333333-3333-3333-3333-333333333333', 'user@company.com', 'Regular User', 'user', true, 'Development', 'Developer', '$2b$10$exampletemporarypasswordhashforreset')
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash;