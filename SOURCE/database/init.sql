CREATE DATABASE IF NOT EXISTS shop_db;
USE shop_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin TINYINT DEFAULT 0
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Bảng nhạy cảm giả định, dùng để minh họa hậu quả khi bị trích xuất
CREATE TABLE credit_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number VARCHAR(20),  -- số giả, không dùng số thật
  expiry VARCHAR(10),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Dữ liệu mẫu (mật khẩu thật sẽ băm bằng bcrypt khi viết route /register hoặc seed script)
INSERT INTO users (username, password_hash, is_admin) VALUES
('admin', '$2b$10$511S4FPi5JfnnWuDbj7XnejfwLARjhh8p3LqvrNEPm0NEsVRrQ/oO', 1),
('alice', '$2b$10$511S4FPi5JfnnWuDbj7XnejfwLARjhh8p3LqvrNEPm0NEsVRrQ/oO', 0),
('bob', '$2b$10$511S4FPi5JfnnWuDbj7XnejfwLARjhh8p3LqvrNEPm0NEsVRrQ/oO', 0);

INSERT INTO products (name, description, price) VALUES
('Ao thun', 'Ao cotton basic', 150000),
('Giay sneaker', 'Giay the thao', 850000),
('Balo laptop', 'Balo chong nuoc', 450000);

INSERT INTO credit_cards (user_id, card_number, expiry) VALUES
(2, '4111111111111111', '12/27'),
(3, '5500000000000004', '09/26');

INSERT INTO products (name, description, price) VALUES
('Mu luoi trai', 'Mu chong nang basic', 120000),
('Kinh ram', 'Kinh chong UV', 250000),
('Đong ho the thao', 'Dong ho chong nuoc', 650000),
('Ao khoac gio', 'Ao khoac nhe chong gio', 380000),
('Quan jean', 'Quan jean nam form slimfit', 420000);

INSERT INTO orders (user_id, total) VALUES
(2, 300000),
(3, 850000);

INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 2),
(2, 2, 1);
-- User riêng cho ứng dụng ở bản secure, quyền hạn chế (không có quyền DROP, GRANT...)
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'AppPass123!';
GRANT SELECT, INSERT, UPDATE ON shop_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;