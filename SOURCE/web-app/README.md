# Backend — Shop giả lập

## Chạy thử
docker compose up --build -d
API chạy ở http://localhost:3000

## Tài khoản mẫu
username: alice / bob / admin
password: 123456

## Endpoint
POST /api/auth/login        { username, password }
GET  /api/products/search?q=...
GET  /api/products/:id

## Chế độ
Đổi MODE=vulnerable | secure trong docker-compose.yml rồi `docker compose up --build -d`
- vulnerable: dùng cho demo SQLi
- secure: bản đã vá, dùng chung user DB app_user (quyền hạn chế)