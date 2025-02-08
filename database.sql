-- Create the database
CREATE DATABASE budget_tracker_db;

-- Use the database
USE budget_tracker_db;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert a test user
INSERT INTO users (username, password, email)
VALUES ('john_doe', '123', 'john@example.com');

-- Insert some transactions for the test user
INSERT INTO transactions (user_id, category, amount, type)
VALUES (1, 'Food', 50.00, 'expense');

INSERT INTO transactions (user_id, category, amount, type)
VALUES (1, 'Salary', 1000.00, 'income');
