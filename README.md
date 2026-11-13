# Library Management System

A NestJS application connected to a hosted PostgreSQL database (Supabase) via Prisma, implementing a full library book catalog with users, genres, books, and reviews.

---

## Assignment Deliverables

The required files for this assignment are all inside the `api/` directory:

| Required File | Purpose |
|---|---|
| [`api/prisma/schema.prisma`](api/prisma/schema.prisma) | Defines `Role` enum, `User`, `Genre`, `Book`, and `Review` models |
| [`api/prisma/seed.ts`](api/prisma/seed.ts) | Seeds 5 genres and 16 books across all genres |
| [`api/src/prisma/prisma.service.ts`](api/src/prisma/prisma.service.ts) | Extends `PrismaClient`, implements `OnModuleInit`, calls `$connect()` |
| [`api/.env.example`](api/.env.example) | `DATABASE_URL` placeholder — no real credentials committed |
| [`api/prisma/migrations/`](api/prisma/migrations/) | Migration `20261113124218_init` applied to Supabase PostgreSQL |

---

## Schema Decisions

### Why does `Book` reference `Genre` via a foreign key instead of embedding genre data?

The schema uses a **normalized relational model**: `Book` stores only a `genreId` foreign key, and genre details live in a separate `Genre` table. Here is why:

1. **No data duplication.** In a document database (e.g., MongoDB), you might embed `{ genre: { name: "Fiction" } }` inside every book document. That means if you rename a genre, you must update every book record. With a foreign key, you update exactly one `Genre` row and all books instantly reflect the change.

2. **Referential integrity.** PostgreSQL enforces the `@relation` constraint — you cannot insert a book pointing to a `genreId` that does not exist, and you cannot delete a genre that still has books attached. Document databases have no equivalent enforcement.

3. **Efficient cross-genre queries.** Finding all books in a genre is a simple indexed join (`WHERE genreId = ?`), not a full-collection scan of embedded objects.

4. **Genres are a shared resource.** A genre is not "owned" by a single book — it is a first-class entity that many books share. That ownership model maps naturally to a separate table, not an embedded sub-document.

### What felt different about modeling in Prisma vs. a document database

In MongoDB you think in terms of *documents* and decide upfront whether to embed or reference — and the schema is optional, enforced only by the application. In Prisma, the schema is **the single source of truth**: it drives the SQL migration (DDL) and generates a fully-typed TypeScript client at the same time. Relations are declared explicitly with `@relation`, and the type system gives you compile-time confidence that you are using the right field names and joining on the right keys. The biggest shift is that normalization becomes the default rather than a deliberate choice.

---

## Models

```
enum Role { PATRON, LIBRARIAN }

User    — id, email, name, role (Role), createdAt, updatedAt
Genre   — id, name (unique), createdAt
Book    — id, title, author, isbn (unique), publishedYear, description,
          availableCopies, genreId → Genre, createdAt, updatedAt
Review  — id, rating (1–5), comment, bookId → Book, userId → User, createdAt
          [unique: bookId + userId — one review per user per book]
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/FranNMK/library-management-system.git
cd library-management-system/api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and replace [YOUR-PASSWORD] with your Supabase password
```

### 3. Run migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed the database

```bash
npx prisma db seed
```

### 5. Start the app

```bash
npm run start:dev
```

### 6. Browse data (optional GUI)

```bash
npx prisma studio
```

---

## Seed Data Summary

| Genre | Books |
|---|---|
| Fiction | To Kill a Mockingbird, The Great Gatsby, 1984, Pride and Prejudice |
| Non-Fiction | Sapiens, Educated, Atomic Habits |
| Science Fiction | Dune, The Martian, Ender's Game, The Left Hand of Darkness |
| Mystery | Gone Girl, The Girl with the Dragon Tattoo |
| Fantasy | The Name of the Wind, The Way of Kings, A Wizard of Earthsea |

**Total: 5 genres · 16 books · 2 users (1 LIBRARIAN, 1 PATRON) · 1 sample review**
