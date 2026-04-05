# ADR-002: JWT (access / refresh) и Passport

| Поле             | Значение                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Статус**       | Принято                                                                                                                                                                                                                                                                                     |
| **Дата**         | 2026-03-28                                                                                                                                                                                                                                                                                  |
| **PR (цепочка)** | [#13](https://github.com/Maria2721/dev-craft-backend/pull/13) (register + JWT, merged 2026-03-08), [#14](https://github.com/Maria2721/dev-craft-backend/pull/14) (login, merged 2026-03-08), [#41](https://github.com/Maria2721/dev-craft-backend/pull/41) (refresh, merged **2026-03-28**) |

## Контекст

Защита API без серверного session store: короткий **access** и долгий **refresh**, разные секреты, единый ответ `AuthResponse` после регистрации и логина.

## Решение

1. Оба токена - **JWT (HMAC)**, в payload: `sub` (id пользователя), `type`: `'access'` | `'refresh'`.
2. **Access:** `Authorization: Bearer …`, проверка через **Passport JWT** (`JwtStrategy`), секрет `JWT_ACCESS_SECRET`, guard `JwtAuthGuard` на защищённых маршрутах.
3. **Refresh:** только в `POST /auth/refresh`, верификация с `JWT_REFRESH_SECRET`, обязательно `type === 'refresh'`, затем выдача новой пары (ротация на стороне клиента).
4. Порт домена **`TokenService`** - реализация **`JwtTokenService`** в `infrastructure`. Пароли — **bcrypt**.

Переменные: `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_TTL` (см. `.env.example`).

## Связанные ADR

- [ADR-001](./ADR-001-nestjs-layered-architecture.md) — слои.
- [ADR-003](./ADR-003-oauth-google-github.md) — выдача тех же JWT после OAuth.
