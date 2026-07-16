# max-notifier — сервис уведомлений в мессенджер MAX

HTTP-сервис на Express, который принимает уведомления по REST API и отправляет их
ботом в группу мессенджера **MAX** ([@maxhub/max-bot-api](https://www.npmjs.com/package/@maxhub/max-bot-api)).
Основное применение — уведомления о статусе задач **Apache Airflow** (DAG success/failed/…),
но можно отправлять и произвольный текст.

## Состав проекта

| Файл | Назначение |
|---|---|
| `src/app.js` | Точка входа: Express + helmet + pino-http, запуск сервера |
| `src/routes.js` | Маршруты `/health` и `/notify`, проверка API-ключа, валидация тела (zod) |
| `src/formatter.js` | Форматирование сообщения: шаблон Airflow-уведомления с иконками статусов |
| `src/bot.js` | Отправка сообщения в чат MAX через Bot API |
| `src/config.js` | Загрузка и валидация переменных окружения (dotenv + zod) |
| `src/logger.js` | Логгер pino (в development — pino-pretty) |

## Требования

- **Node.js** 22+
- Токен бота MAX и id группы, в которую бот добавлен

## Установка и запуск

```bash
npm install
npm start          # production
npm run dev        # разработка (nodemon)
```

Настройки задаются в файле `.env` в корне проекта (в git не попадает, см. `.gitignore`).

## Переменные окружения

Конфигурация валидируется при старте (`src/config.js`); при ошибке сервис
печатает список проблем и завершается.

| Переменная | По умолчанию | Описание |
|---|---|---|
| `MAX_BOT_TOKEN` | — (обязательна) | Токен бота MAX |
| `MAX_CHAT_ID` | — (обязательна) | Id группы MAX, в которую пишет бот |
| `API_KEY` | — (обязательна, ≥ 8 символов) | Ключ для доступа к `POST /notify` |
| `PORT` | `3000` | Порт HTTP-сервера |
| `NODE_ENV` | `development` | `development` / `production` (влияет на формат логов) |

## API

### `GET /health`

Проверка работоспособности, без авторизации:

```json
{ "status": "ok", "service": "max-notifier", "uptime": 123.45 }
```

### `POST /notify`

Отправка уведомления. Требуется заголовок `X-API-Key` со значением `API_KEY`.

Тело запроса (JSON, все поля опциональны):

| Поле | Описание |
|---|---|
| `text` | Произвольный текст — если задан, отправляется как есть, остальные поля игнорируются |
| `status` | `success` \| `failed` \| `running` \| `warning` \| `info` (по умолчанию `info`) |
| `dag` | Имя DAG |
| `task` | Имя задачи |
| `owner` | Владелец |
| `environment` | Окружение (prod/dev/…) |
| `duration` | Длительность выполнения |
| `error` | Текст ошибки (добавляется отдельным блоком) |
| `time` | Метка времени; если не задана — текущее время (`ru-RU`) |

Ответы: `200 {"success": true}`, `400` — ошибка валидации, `401` — неверный API-ключ,
`500` — не удалось отправить сообщение в MAX.

#### Примеры

Уведомление Airflow:

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY>" \
  -d '{
    "status": "failed",
    "dag": "etl_daily",
    "task": "load_reports",
    "owner": "airflow",
    "environment": "prod",
    "duration": "4m 12s",
    "error": "Connection timeout"
  }'
```

В чат придёт сообщение вида:

```
❌ AIRFLOW FAILED

━━━━━━━━━━━━━━━━━━━━━━

📦 DAG: etl_daily
⚙️ Task: load_reports
👤 Owner: airflow
🌍 Environment: prod
⏱ Duration: 4m 12s

💥 Error:
Connection timeout

━━━━━━━━━━━━━━━━━━━━━━
🕒 16.07.2026, 12:34:56
```

Произвольный текст:

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY>" \
  -d '{"text": "Привет из скрипта!"}'
```
