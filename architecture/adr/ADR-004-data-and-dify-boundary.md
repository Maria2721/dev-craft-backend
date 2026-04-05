# ADR-004: Данные в PostgreSQL и граница с Dify

| Поле       | Значение                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| **Статус** | Принято                                                                                                      |
| **Дата**   | 2026-03-26                                                                                                   |
| **PR**     | [Maria2721/dev-craft-backend#35](https://github.com/Maria2721/dev-craft-backend/pull/35) (merged 2026-03-26) |

## Контекст

Ответы AI собирает **Dify** (Chatflow). Нужно хранить историю и метаданные у себя и продолжать диалог в Dify по `conversation_id`.

## Решение

1. **PostgreSQL + Prisma** - пользователи, контент, **Conversation** / **Message**; в `Conversation` опционально **`difyConversationId`** для следующих вызовов Chatflow.
2. Граф и промпты в Dify; бэкенд шлет `query`, пользователя и `inputs` через `DifyChatflowClient`.
3. Вызов из Chatflow к бэкенду (нода tools): **MCP** к Nest; ответ уходит обратно в Dify, затем клиенту (см. [диаграмму 1](../MERMAID_FOR_MERMAIDEDITOR.md)).
4. Провайдер AI без Dify: `AI_LLM_PROVIDER`, фабрика `ChatReplyClient` в `AiDiModule`.

## Последствия

Плюсы: история у себя; смена LLM без смены схемы пользователя. Минусы: не выявлено.
