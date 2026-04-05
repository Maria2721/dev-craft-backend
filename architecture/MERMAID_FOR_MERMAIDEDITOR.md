# Схемы Mermaid для [mermaideditor.com](https://mermaideditor.com/ru)

В репозитории версионируются **две** диаграммы (исходники ниже; готовый SVG - в [`diagrams/`](./diagrams/)).

---

## Диаграмма 1 — обзор: кто с кем говорит

Участники: **две точки входа** (веб и Discord-бот), бэкенд, база, Dify.

Авторизация (JWT) — [ADR-002](./adr/ADR-002-jwt-access-refresh.md); OAuth — [ADR-003](./adr/ADR-003-oauth-google-github.md). Граница данных и Dify — [ADR-004](./adr/ADR-004-data-and-dify-boundary.md).

**Экспорт SVG:** [`diagrams/diagram-01-system-interactions-overview.svg`](./diagrams/diagram-01-system-interactions-overview.svg).

```mermaid
flowchart TB
  FE["Web frontend"]

  BE["Backend<br/>(NestJS)"]

  DB[("PostgreSQL")]

  DIFY[("Dify<br/>Chatflow")]

  BOT["Discord bot"]

  FE <-->|"HTTPS: REST API<br/>браузер ↔ бэкенд"| BE

  BE <-->|"данные приложения<br/>через Prisma"| DB

  BE <-->|"HTTPS: запрос в Chatflow и ответ<br/>(веб-чат с AI и сценарии с AI)"| DIFY

  BOT -->|"сообщение пользователя<br/>в Chatflow"| DIFY

  DIFY -->|"MCP: запрос к бэкенду<br/>(напр. статистика)"| BE

  BE -->|"MCP: ответ в Chatflow"| DIFY

  DIFY -->|"готовый ответ AI<br/>в канал Discord"| BOT

  BOT -->|"HTTPS: internal API<br/>сохранение чата в БД"| BE

  classDef entry fill:#e0f2f1,stroke:#00897b,stroke-width:3px,color:#00695c
  classDef be fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
  classDef db fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
  classDef dify fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c

  class FE entry
  class BOT entry
  class BE be
  class DB db
  class DIFY dify
```

| Участники            | Смысл                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Frontend ↔ Backend   | Публичный **HTTPS** REST.                                                                                                           |
| Backend ↔ PostgreSQL | Prisma.                                                                                                                             |
| Backend ↔ Dify       | Веб-чат с AI и сценарии с AI через Chatflow.                                                                                        |
| Discord → Dify → …   | Текст в Chatflow; при MCP — запрос к бэкенду и ответ обратно в Dify; затем ответ в канал; отдельно бот может писать историю в Nest. |

---

## Диаграмма 2 — слои Clean Architecture

Правило зависимостей: код зависит **внутрь**. **Порты** в `domain/` — в основном **`abstract class`**; **`interface` / `type`** — формы данных сценариев. **`infrastructure`** — конкретные классы и техника (БД, HTTP, DI).

**Экспорт SVG:** [`diagrams/diagram-02-clean-architecture-layers.svg`](./diagrams/diagram-02-clean-architecture-layers.svg).

Подробнее о слоях — [ADR-001](./adr/ADR-001-nestjs-layered-architecture.md).

```mermaid
%%{init: {'themeVariables': {'primaryBorderRadius': '18px'}}}%%
flowchart TB
  subgraph FW["4. Frameworks & Drivers"]
    subgraph AD["3. Interface Adapters"]
      subgraph UC["2. Application Business Use Cases"]
        subgraph EN["1. domain"]
          DOM("Entities & Ports<br/>domain/<br/><br/>abstract class — порты<br/>репозитории, сервисы, клиенты<br/><br/>+ type/interface — DTO, превью<br/>(без Nest / без прямого HTTP в сценариях)")
        end
        APP("application/<br/>сценарии по областям: auth, knowledge, AI, …")
      end
      PRES("presentation/<br/>REST по областям, guards, DTO, throttling")
    end
    INFRA("infrastructure/<br/>БД, JWT, OAuth, LLM/Dify, конкретные классы, DI-модули")
  end

  PRES -->|зависит от| APP
  APP -->|зависит от| DOM
  INFRA -.->|реализует порты| DOM

  style FW fill:#bbdefb,stroke:#1565c0,stroke-width:2px
  style AD fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
  style UC fill:#ffcdd2,stroke:#c62828,stroke-width:2px
  style EN fill:#fff9c4,stroke:#f9a825,stroke-width:2px
```
