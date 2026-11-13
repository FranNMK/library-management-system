# Library Management System

A NestJS application connected to PostgreSQL via Prisma, implementing a library book catalog with users, genres, books, and reviews.

---

## Setup

### Prerequisites
- Node.js LTS (`node -v`)
- A hosted PostgreSQL database (Supabase or Neon)

### Installation

```bash
cd api
npm install
```

### Environment Variables

Copy the example file and fill in your database password:

```bash
cp .env.example .env
# Edit .env and replace [YOUR-PASSWORD] with your Supabase password
```

### Database Migration

```bash
npx prisma migrate dev --name init
```

### Seed the Database

```bash
npx prisma db seed
# or: npm run seed
```

### Run the App

```bash
npm run start:dev
```

### Browse Data (GUI)

```bash
npx prisma studio
```

---

## Project Structure

```
api/
├── prisma/
│   ├── schema.prisma   # Prisma data models
│   └── seed.ts         # Seed script (4 genres, 16 books, reviews)
├── src/
│   ├── prisma/
│   │   ├── prisma.service.ts   # PrismaClient wrapper (NestJS injectable)
│   │   └── prisma.module.ts    # Prisma module (exported for other modules)
│   ├── app.module.ts
│   └── main.ts
└── .env.example        # Environment variable template (safe to commit)
```

---

## Schema Decisions

### Why does `Book` reference `Genre` via a foreign key instead of embedding genre data?

The schema uses a **normalized relational model**: `Book` stores only a `genreId` foreign key, and genre details live in a separate `Genre` table. Here is why:

1. **No data duplication.** In a document database (e.g., MongoDB), you might embed `{ genre: { name: "Fiction" } }` inside every book document. That means if you rename a genre, you must update every book record. With a foreign key, you update exactly one `Genre` row and all books instantly reflect the change.

2. **Referential integrity.** PostgreSQL enforces the `@relation` constraint — you cannot insert a book pointing to a `genreId` that doesn't exist, and you cannot delete a genre that still has books attached. Document databases have no equivalent enforcement.

3. **Efficient cross-genre queries.** Finding all books in a genre is a simple indexed join (`WHERE genreId = ?`), not a full-collection scan of embedded objects.

4. **Genres are a shared resource.** A genre is not "owned" by a single book; it is a first-class entity that many books share. That ownership model maps naturally to a separate table, not an embedded sub-document.

### What felt different about modeling in Prisma vs. a document database

In MongoDB you think in terms of *documents* and decide upfront whether to embed or reference. The schema is optional and enforced by the application. In Prisma, the schema is **the source of truth** — it drives both the database migration (DDL) and the generated TypeScript client. Relations are declared explicitly with `@relation`, and the type system gives you compile-time confidence that you're using the right field names and joining on the right keys. The biggest shift is that normalization becomes the default rather than something you have to consciously choose.

---

## Models

| Model   | Key Fields                                      | Notes                                    |
|---------|-------------------------------------------------|------------------------------------------|
| `User`  | id, email, name, `role` (enum)                  | `Role`: PATRON or LIBRARIAN              |
| `Genre` | id, name                                        | Unique name; has many books              |
| `Book`  | id, title, author, isbn, publishedYear, genreId | References Genre via foreign key         |
| `Review`| id, rating (1–5), comment, bookId, userId       | Stretch: one review per user per book    |

---

## Seed Data

The seed script (`prisma/seed.ts`) inserts:

- **5 genres**: Fiction, Non-Fiction, Science Fiction, Mystery, Fantasy  
- **16 books** distributed across all genres  
- **2 users**: one LIBRARIAN, one PATRON  
- **1 sample review**
