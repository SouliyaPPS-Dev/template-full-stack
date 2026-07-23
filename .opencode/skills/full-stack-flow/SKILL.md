---
name: full-stack-flow
description: Complete full-stack business flow orchestrator. Creates connected Frontend, Backend, Mobile App, and Database systems with unified data flow. Use when building complete full-stack applications with business logic spanning all layers. Triggers on: full-stack, business flow, complete app, end-to-end, connected systems.
---

# Full Stack Flow - Business Flow Orchestrator

Master skill for creating complete full-stack systems with unified business flow.

## Purpose

Act as your **Personal CTO** - orchestrating complete full-stack development where:
- Frontend ↔ Backend ↔ Mobile ↔ Database are all connected
- Business logic flows seamlessly across all layers
- Data structures are unified and consistent
- API contracts are shared between all clients

## When to Use

- Creating a new full-stack application from scratch
- Adding new features that span multiple layers
- Refactoring to connect disconnected systems
- Building MVP with complete business flow

## Execution Flow

### Phase 1: Business Analysis
```
1. Understand the business requirement
2. Identify all entities and relationships
3. Map data flow: User → Frontend → API → Backend → Database → Response
4. Define API contracts (OpenAPI/TypeSpec)
```

### Phase 2: Database Design
```
1. Design schema with migrations
2. Create ERD (Entity Relationship Diagram)
3. Define relationships (1:1, 1:N, N:M)
4. Add indexes for performance
5. Create seed data for development
```

### Phase 3: Backend API
```
1. Create API endpoints following REST/GraphQL conventions
2. Implement business logic layer
3. Add validation (Zod schemas)
4. Create middleware (auth, rate limiting, CORS)
5. Add error handling
6. Write API tests
```

### Phase 4: Frontend (Web Admin)
```
1. Create TypeScript types from API schema
2. Build TanStack Query hooks for data fetching
3. Create TanStack Router routes
4. Build UI components with shadcn/ui
5. Add form handling with validation
6. Implement real-time updates if needed
```

### Phase 5: Mobile App
```
1. Share types with frontend
2. Create API service layer
3. Build screens matching web functionality
4. Implement offline support if needed
5. Add push notifications if needed
```

### Phase 6: Integration & Testing
```
1. Connect all layers end-to-end
2. Write integration tests
3. Add E2E tests for critical flows
4. Performance testing
5. Security audit
```

## Output Structure

When executed, create this structure:

```
project/
├── apps/
│   ├── web-admin/          # React Frontend
│   │   ├── src/
│   │   │   ├── routes/     # Pages
│   │   │   ├── components/ # UI Components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── queries/    # API queries
│   │   │   └── types/      # Shared types
│   │   └── tests/
│   │
│   ├── web-user/           # User-facing frontend (optional)
│   │
│   └── mobile/             # Flutter or React Native
│       ├── lib/
│       │   ├── features/   # Feature modules
│       │   ├── shared/     # Shared widgets
│       │   └── core/       # Core services
│       └── test/
│
├── services/
│   ├── api/                # Main API server
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Middleware
│   │   └── utils/          # Utilities
│   │
│   └── workers/            # Background jobs (optional)
│
├── packages/
│   ├── shared/             # Shared types & utils
│   │   ├── types/          # TypeScript types
│   │   ├── validators/     # Zod schemas
│   │   └── constants/      # Shared constants
│   │
│   └── ui/                 # Shared UI components (optional)
│
├── database/
│   ├── migrations/         # SQL migrations
│   ├── seeds/              # Seed data
│   └── schema.prisma       # Or drizzle schema
│
├── docs/
│   ├── api.yaml            # OpenAPI spec
│   ├── architecture.md     # Architecture docs
│   └── flow.md             # Business flow diagram
│
└── infra/
    ├── docker/             # Docker configs
    └── deploy/             # Deployment configs
```

## Business Flow Example

For an **E-commerce System**:

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User (Mobile/Web)                                          │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐               │
│  │ Frontend │────▶│  API    │────▶│Backend  │               │
│  │ (React)  │     │ Gateway │     │ (Go/Py) │               │
│  └─────────┘     └─────────┘     └─────────┘               │
│       │                               │                     │
│       │         ┌─────────┐           │                     │
│       └────────▶│ Mobile  │◀──────────┘                     │
│                 │ (Flutter│                                 │
│                 │   /RN)  │                                 │
│                 └─────────┘                                 │
│                       │                                     │
│                       ▼                                     │
│                 ┌─────────┐                                 │
│                 │Database │                                 │
│                 │(Postgres│                                 │
│                 │/Mongo)  │                                 │
│                 └─────────┘                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Pattern

```
1. User Action (Click/Input)
   ↓
2. Frontend Component handles event
   ↓
3. TanStack Query/mutation called
   ↓
4. API request sent (with auth token)
   ↓
5. Backend middleware (auth, validation)
   ↓
6. Controller receives request
   ↓
7. Service executes business logic
   ↓
8. Repository/Model queries database
   ↓
9. Response flows back up
   ↓
10. Frontend updates UI
   ↓
11. (Optional) Mobile receives push notification
```

## Shared Contract

All layers share:
- **Types**: TypeScript interfaces / Dart classes
- **Validators**: Zod schemas for validation
- **API Spec**: OpenAPI/TypeSpec for API contracts
- **Constants**: Shared enums and constants

## Commands

Use these commands to work with this skill:

```
/full-stack-flow init <project-name>    # Initialize new full-stack project
/full-stack-flow feature <feature-name> # Add new feature across all layers
/full-stack-flow api <endpoint>         # Create new API endpoint
/full-stack-flow screen <screen-name>   # Create new screen (web + mobile)
/full-stack-flow schema <entity>        # Create database schema
/full-stack-flow test                   # Run all tests
/full-stack-flow deploy                 # Deploy all services
```

## Integration with Other Skills

- **function-memory**: Store API calls and responses for caching
- **hermes-agent**: Use Hermes for complex business logic reasoning
- **trae-agent**: Use Doubao for code generation

## Tech Stack (Configurable)

Default stack (can be customized per project):

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + TanStack Router/Query |
| Mobile | Flutter 3.x OR React Native 0.76+ |
| Backend | **PHP 8+ Custom MVC** (your pattern) OR Go (Chi/Fiber) OR Python (FastAPI) OR Rust (Axum) |
| Database | **MySQL** (your standard) + Redis |
| ORM | PDO (your pattern) OR Prisma OR Drizzle |
| Auth | JWT + Session-based (your pattern) |
| Hosting | Docker + XAMPP (local) |

## PHP Backend Integration

This skill uses your custom MVC patterns from `/Applications/XAMPP/xamppfiles/htdocs/`:

### Your Patterns (Learned)

| Pattern | Source | Confidence |
|---------|--------|------------|
| PDO Singleton | All projects | 95% |
| Method-chain Router | land-houses-dev | 90% |
| Custom MVC | All projects | 98% |
| Tailwind + Alpine.js | All projects | 95% |
| Session Auth | BaseController | 90% |
| JSON API | All projects | 95% |

### PHP Project Structure

```
project/
├── index.php                 # Entry point
├── .env                      # Environment config
├── routes/
│   └── web.php              # Route definitions
├── app/
│   ├── Core/
│   │   ├── Router.php       # URL dispatcher
│   │   ├── Database.php     # PDO singleton
│   │   └── Env.php          # Environment loader
│   ├── Controllers/
│   │   ├── BaseController.php
│   │   └── *Controller.php
│   ├── Models/
│   │   └── *Model.php
│   └── Helpers/
│       └── view.php         # view(), url(), asset()
├── views/
│   ├── layouts/
│   │   └── main.php
│   ├── pages/
│   └── components/
└── public/
    └── index.php            # Front controller
```

### Database (MySQL)

```sql
-- Your pattern: VARCHAR(36) for IDs, JSON for flexible data
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Example Usage

```
User: /full-stack-flow init ecommerce

Agent: I'll create a complete e-commerce system with full business flow.

Phase 1: Business Analysis
- Entities: User, Product, Order, Payment, Shipping
- Relationships: User has many Orders, Order has many Products
- Flow: Browse → Add to Cart → Checkout → Payment → Shipping

Phase 2: Database Design
Creating schema with Prisma...

[Creates complete project structure]

Done! Your e-commerce system is ready:
- Frontend: apps/web-admin (React)
- Mobile: apps/mobile (Flutter)
- API: services/api (Go)
- Database: PostgreSQL with Prisma

Run: cd project && docker-compose up
```

## Notes

- Always start with database design (single source of truth)
- Share types between all layers
- Use environment variables for configuration
- Write tests at each layer
- Document API endpoints
- Consider mobile-first if mobile is primary client
