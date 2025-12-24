# Backend NestJS - Order Management System

REST API to manage orders with a state machine, built with NestJS and the Repository pattern.

## Contents

- [Backend NestJS - Order Management System](#backend-nestjs---order-management-system)
  - [Contents](#contents)
  - [What this project does](#what-this-project-does)
  - [Technologies](#technologies)
  - [State machine](#state-machine)
    - [Diagram](#diagram)
    - [States](#states)
    - [Actions](#actions)
    - [Business rules](#business-rules)
  - [Installation](#installation)
  - [Endpoints](#endpoints)
    - [Create order](#create-order)
    - [Execute transition](#execute-transition)
  - [Examples](#examples)
  - [Project structure](#project-structure)
  - [Implementation notes](#implementation-notes)

## What this project does

A REST API that handles the order lifecycle using a state machine. It allows creating orders, transitioning between states, and keeps a history of all changes.

What it includes:
- State machine for order flow
- Repository pattern to abstract persistence
- Data validation with DTOs
- Automatic support ticket creation for high-value order failures
- Transition logs
- CORS enabled to connect with the frontend

## Technologies

- Node.js v18+
- NestJS
- TypeScript
- class-validator and class-transformer
- In-memory storage (Map)

## State machine

### Diagram

```
Pending ──────────────────────────────────────────────────────> Cancelled
   │                                                                 ^
   │                                                                 │
   ├── (if amount > $1000) ──> In Review ──> In Preparation ────────┤
   │                                              │                  │
   └── (if amount <= $1000) ──> In Preparation ───┼──────────────────┘
                                                  │
                                                  v
                                              Shipped ──> Delivered
```

### States

| State | Description |
|-------|-------------|
| Pending | Initial state when order is created |
| In Review | Mandatory review for orders over $1000 |
| In Preparation | Order is being prepared |
| Shipped | Order sent |
| Delivered | Order delivered |
| Cancelled | Order cancelled |

### Actions

| Action | From | To | Condition |
|--------|------|-----|-----------|
| Start Preparation | Pending | In Preparation | amount <= $1000 |
| Review Order | Pending | In Review | amount > $1000 |
| Approve Review | In Review | In Preparation | - |
| Send Order | In Preparation | Shipped | - |
| Confirm Delivery | Shipped | Delivered | - |
| Cancel Order | Pending, In Review, In Preparation | Cancelled | Not available after Shipped |

### Business rules

1. Orders over $1000 USD must go through "In Review" before "In Preparation"
2. Cannot cancel an order after "Shipped" state
3. If an order is cancelled with reason "paymentFailed" and amount exceeds $1000, a support ticket is created automatically

## Installation

Requirements:
- Node.js 18 or higher
- npm or yarn

```bash
cd backend-nestjs
npm install

# Development mode
npm run start:dev

# Production
npm run build
npm run start
```

Server runs at `http://localhost:3000` with prefix `/api`.

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders | Get all orders |
| GET | /api/orders/:id | Get order by ID |
| GET | /api/orders/:id/actions | Get available actions |
| PATCH | /api/orders/:id/transition | Execute transition |
| GET | /api/orders/transitions/all | Get all transition logs |
| GET | /api/orders/:id/transitions | Get transitions for an order |

### Create order

```json
POST /api/orders

{
  "customer": {
    "name": "string",
    "email": "string"
  },
  "productDetails": [
    {
      "name": "string",
      "quantity": 1,
      "unitPrice": 50.00
    }
  ],
  "notes": "optional"
}
```

### Execute transition

```json
PATCH /api/orders/:id/transition

{
  "action": "Start Preparation",
  "metadata": {}
}
```

## Examples

Create an order:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"name": "John", "email": "john@mail.com"},
    "productDetails": [{"name": "Laptop", "quantity": 1, "unitPrice": 999.99}]
  }'
```

Execute a transition:

```bash
curl -X PATCH http://localhost:3000/api/orders/{orderId}/transition \
  -H "Content-Type: application/json" \
  -d '{"action": "Start Preparation"}'
```

Cancel with metadata:

```bash
curl -X PATCH http://localhost:3000/api/orders/{orderId}/transition \
  -H "Content-Type: application/json" \
  -d '{"action": "Cancel Order", "metadata": {"reason": "paymentFailed"}}'
```

## Project structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
└── orders/
    ├── orders.module.ts         # Orders module
    ├── orders.controller.ts     # Controller (receives HTTP)
    ├── orders.service.ts        # Service (business logic)
    ├── orders.repository.ts     # Repository (persistence)
    ├── dto/
    │   ├── create-order.dto.ts
    │   └── transition-order.dto.ts
    └── entities/
        └── order.entity.ts
```

The project uses path aliases for cleaner imports:

```typescript
import { OrdersService } from '@orders/orders.service';
```

## Implementation notes

- Data is stored in memory with Map. In production this would be swapped for a real database without touching the service layer thanks to the Repository pattern.
- The state machine is in the service because that's where business rules go.
- The system supports multiple concurrent orders, each with its unique ID.
- To add new states or actions, modify the enums in `order.entity.ts` and the `STATE_TRANSITIONS` config in the service.
