# Чат / отладка: падение страницы Secret Santa (2026-05-03)

## Симптом

На проде (`/groups/<groupId>/secret-santa`) пустая страница и сообщение об ошибке клиента. В консоли:

`Uncaught TypeError: Cannot read properties of undefined (reading 'filter')`

## Причина

`GET /api/groups/[id]/secret-santa` при отсутствии события на выбранный год возвращал только `{ event: null, isAdmin, year }` без массивов `participants` и `exclusions`.

В `secret-santa-panel.tsx` выражения вроде `data?.participants.filter(...)` некорректны: `data?.` защищает только `data`, а не `participants`; если `data` есть, а `participants` нет, вызывается `.filter` у `undefined`.

Аналогично `data?.participants.forEach` при наличии `data` без `participants` давало бы падение на `forEach`.

## Исправление

1. **API** (`src/app/api/groups/[id]/secret-santa/route.ts`): при `!event` возвращать стабильную форму ответа с `participants: []`, `exclusions: []`, `myReceiver: null`.
2. **Клиент** (`src/app/groups/[id]/secret-santa/secret-santa-panel.tsx`): везде использовать `(data?.participants ?? [])` и `(data?.exclusions ?? [])` перед `.filter`, `.map`, `.find`, `.forEach`.

## Деплой

После пуша в `main` Render подтянет сборку; при необходимости убедиться, что миграции/схема БД актуальны (в проекте уже есть шаг с Prisma при билде).

## Коммит

См. сообщение коммита в истории git за 2026-05-03 (fix: Secret Santa empty GET payload + client array guards).
