# ADR-001: Слоистая архитектура на NestJS

| Поле       | Значение                                                                                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Статус** | Принято                                                                                                                                                                                                                                                   |
| **Дата**   | 2026-03-08                                                                                                                                                                                                                                                |
| **PR**     | [Maria2721/dev-craft-backend#13](https://github.com/Maria2721/dev-craft-backend/pull/13) (merged 2026-03-08; слои Clean Architecture в коде). NestJS вместо Express - [PR #3](https://github.com/Maria2721/dev-craft-backend/pull/3) (merged 2026-02-28). |

## Контекст

Нужен бэкенд для REST API с тестируемой логикой и возможностью менять инфраструктуру (БД, внешние API) без переписывания сценариев.

## Решение

**NestJS** и четыре слоя: **`presentation`** (HTTP, DTO, guards) - **`application`** (use case на сценарий) - **`domain`** (порты - в основном `abstract class`, без Prisma/HTTP в реализации сценариев) - **`infrastructure`** (Prisma, JWT, OAuth, LLM/Dify, DI-модули).

Связка порт - реализация через Nest DI, например `{ provide: UserRepository, useClass: PrismaUserRepository }`. Типы `interface` / `type` в домене - в основном DTO сценариев.

## Схема

Слои и зависимости: **диаграмма 2** в [`../MERMAID_FOR_MERMAIDEDITOR.md`](../MERMAID_FOR_MERMAIDEDITOR.md), экспорт SVG — [`../diagrams/diagram-02-clean-architecture-layers.svg`](../diagrams/diagram-02-clean-architecture-layers.svg).

## Последствия

Плюсы: сценарии и репозитории тестируются с моками; смена ORM локализована во `infrastructure`. Минусы: больше файлов; нельзя тянуть Prisma в `application`.

## Связанные ADR

- [ADR-002](./ADR-002-jwt-access-refresh.md) — JWT и `TokenService`.
- [ADR-003](./ADR-003-oauth-google-github.md) — OAuth.
- [ADR-004](./ADR-004-data-and-dify-boundary.md) — данные и Dify.
