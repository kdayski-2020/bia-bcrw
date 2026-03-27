# BIA BC Read/Write Service

Сервис для деплоя и вызова методов смарт-контрактов через HTTP API.

## Что делает проект

- Поднимает `Express` API для работы со смарт-контрактом.
- Подключается к MongoDB и хранит связку `bcId -> contractAddress`.
- Использует `web3` для:
  - деплоя контракта (`/deploy`);
  - чтения данных (`/call`);
  - отправки транзакций (`/send`).
- Подключает Swagger через `lib/swagger-bia.js`.

## Стек

- Node.js
- Express
- Web3
- MongoDB + Mongoose

## Структура проекта

- `index.js` — точка входа и HTTP-эндпоинты.
- `conf.js` — конфигурация RPC, MongoDB, порта и аккаунта.
- `helper/db.js` — подключение к MongoDB.
- `contracts/storage.sol` — исходник контракта.
- `contracts/storage.abi`, `contracts/storage.bin` — артефакты для деплоя.
- `api-docs/` — Swagger YAML.

## Конфигурация

Основные параметры лежат в `conf.js`:

- `service_port` — порт API (по умолчанию `8866`);
- `mongo_url` — строка подключения к MongoDB;
- `contract_name` — имя файлов контракта в `contracts/`;
- `app_address`, `app_privateKey` — адрес и ключ сервисного аккаунта.

Перед запуском проверьте:

1. Доступность MongoDB.
2. Доступность RPC-ноды по адресу формата `.../bcm/bc/{bcId}/rpc`.
3. Что в `contracts/` есть соответствующие `.abi` и `.bin` файлы.

## Установка и запуск

```bash
npm install
node index.js
```

После старта сервис слушает порт из `conf.js`.

## Веб-интерфейс

После запуска откройте:

- `http://localhost:8866/`

На странице доступны формы для:

- `POST /deploy`
- `POST /call`
- `POST /send`

Результат каждого запроса выводится внизу страницы.

## API

### `POST /deploy`

Деплой смарт-контракта в заданный блокчейн.

Пример тела запроса:

```json
{
  "bcId": "your-blockchain-id"
}
```

Ответ содержит сохраненный документ с `bcId` и `contractAddress` (включая `_id`), который используется в следующих запросах.

### `POST /call`

Вызов `call`-метода контракта (чтение без транзакции).

Пример:

```json
{
  "id": "contract-document-id",
  "method": "retrieve"
}
```

С параметрами:

```json
{
  "id": "contract-document-id",
  "method": "someMethod",
  "params": ["arg1", "arg2"]
}
```

### `POST /send`

Вызов `send`-метода контракта (транзакция с записью).

Пример:

```json
{
  "id": "contract-document-id",
  "method": "store",
  "params": [42]
}
```

## Примечания

## Деплой в Vercel

В проект добавлен `vercel.json`, который разворачивает `Express` приложение как Node Serverless Function.

Шаги:

1. Убедитесь, что MongoDB доступна из Vercel.
2. Задайте переменные окружения в Vercel (рекомендуется переопределить значения из `conf.js`).
3. Выполните деплой:

```bash
npm i -g vercel
vercel
```

После деплоя:

- `/` — веб-интерфейс;
- `/api-docs` — Swagger UI;
- `/health` — проверка доступности.
