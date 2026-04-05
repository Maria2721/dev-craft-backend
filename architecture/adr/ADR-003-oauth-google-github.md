# ADR-003: OAuth 2.0 (Google и GitHub)

| Поле       | Значение                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| **Статус** | Принято                                                                                                      |
| **Дата**   | 2026-04-05                                                                                                   |
| **PR**     | [Maria2721/dev-craft-backend#50](https://github.com/Maria2721/dev-craft-backend/pull/50) (merged 2026-04-05) |

## Контекст

Вход через провайдеров без хранения пароля в приложении провайдера; после успеха фронт должен получить те же **JWT**, что и при email/пароле ([ADR-002](./ADR-002-jwt-access-refresh.md)).

## Решение

1. Старт: **GET** `/auth/google`, `/auth/github` — редирект на провайдера, `state` в БД.
2. **Callback** провайдера: обмен `code`, профиль, find-or-create пользователя и `OAuthAccount`, одноразовый **exchange code** в БД (короткий TTL), редирект на фронт: `?code=…` (не JWT в URL).
3. Фронт: **POST** `/auth/oauth/exchange` с `code` - ответ **`AuthResponse`** (`user`, `accessToken`, `refreshToken`, `expiresIn`), как у register/login.
4. Пользователь только из OAuth без `passwordHash` не логинится по **POST** `/auth/login` с паролем (до отдельного сценария установки пароля).

Реализация: use case-ы OAuth, `GoogleOAuthClient` / `GithubOAuthClient`, `PrismaOAuthRepository`, провайдеры в `AuthDiModule`.

## Связанные ADR

- [ADR-002](./ADR-002-jwt-access-refresh.md) — формат токенов.
- [ADR-001](./ADR-001-nestjs-layered-architecture.md) — слои.
