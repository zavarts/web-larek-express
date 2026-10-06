# Бэкенд WebLarek

API для сервиса «Web-ларёк»: товары, заказы, JWT-авторизация, загрузка изображений.

## Стек

- TypeScript, Express
- MongoDB + Mongoose
- Celebrate / Joi
- JWT (access + refresh)
- Multer, Winston, node-cron

## Запуск

```bash
cp .env.example .env
npm install
npm run dev    # hot-reload
npm run start  # ts-node
npm run build  # сборка в dist
```

MongoDB: `mongodb://127.0.0.1:27017/weblarek` (переменная `DB_ADDRESS`).

## Основные роуты

- `GET/POST /product`, `PATCH/DELETE /product/:productId`
- `POST /order`
- `POST /auth/login|register`, `GET /auth/token|logout|user`
- `POST /upload`
