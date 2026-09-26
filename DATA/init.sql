  CREATE DATABASE expense_splitter;

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Groups
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Group membership (many-to-many)
CREATE TABLE group_members (
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Expenses
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    paid_by INT REFERENCES users(id),
    split_type VARCHAR(20) CHECK (split_type IN ('equal', 'exact', 'percentage')) DEFAULT 'equal',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Who owes what for each expense
CREATE TABLE expense_splits (
    id SERIAL PRIMARY KEY,
    expense_id INT REFERENCES expenses(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL
);

-- Settlements (debt clearing)
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    paid_by INT REFERENCES users(id),
    paid_to INT REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    settled_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_group ON expenses(group_id);
CREATE INDEX idx_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_splits_user ON expense_splits(user_id);
CREATE INDEX idx_settlements_group ON settlements(group_id);