CREATE DATABASE chatbot_db;
USE chatbot_db;

 CREATE TABLE users (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     first_name VARCHAR(100),
    ->     last_name VARCHAR(100),
    ->     email VARCHAR(100)
    -> );

  CREATE TABLE conversations (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     user_id INT,
    ->     title VARCHAR(255),
    ->     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -> );


mysql> CREATE TABLE chat_history (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     conversation_id INT,   
    ->     message TEXT,
    ->     role VARCHAR(20),     
    ->     message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ->     FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    -> );   
    