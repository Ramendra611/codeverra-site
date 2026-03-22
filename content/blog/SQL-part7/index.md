---
title: "Indexes and Schema Design"
description: "Learn about using and creating indexes on tabels to improve query performance"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

showToc: true
TocOpen: false
toc: false
tocopen: false
draft: false
tags:
  - sql
  - data-analysis

cover:
  image: "/images//SQL-7.png"
  alt: "introduction to SQL"
  caption: "introduction to SQL"
  relative: true
  hidden: false
---

# Lesson 2.7  -  Indexes, Constraints & Schema Design
### Theory + Practice | All Three Databases

---

## Before You Start

This lesson uses all three databases.
Each section tells you which one to connect to.

Quick check  -  run this in each database before starting:

```sql
-- In cricketdb:
SELECT COUNT(*) FROM performances;   -- expect 30

-- In shopdb:
SELECT COUNT(*) FROM order_items;    -- expect 30+

-- In streamdb:
SELECT COUNT(*) FROM watch_history;  -- expect 50
```

**What you will learn:**

| Concept | What it does |
|---|---|
| Sequential scan vs index scan | How PostgreSQL finds rows |
| `CREATE INDEX` | Speed up queries on large tables |
| Composite index | Index on two or more columns |
| Partial index | Index only a subset of rows |
| Unique index | Enforce uniqueness via an index |
| `EXPLAIN` / `EXPLAIN ANALYZE` | Read a query execution plan |
| FK behaviours | CASCADE, SET NULL, RESTRICT, SET DEFAULT |
| Normalization | 1NF, 2NF, 3NF  -  design rules with examples |
| Common schema mistakes | Real anti-patterns and how to fix them |

---

## Part 1  -  How PostgreSQL Finds Rows

Before learning about indexes, you need to understand what problem they solve.

### Sequential Scan

Without an index, PostgreSQL reads **every row** in a table from start to finish
to find the ones that match your WHERE clause. This is called a **sequential scan**.

```
Table: products (25 rows)
Query: WHERE name = 'Samsung Galaxy S23'

PostgreSQL reads:
  Row 1 → 'Samsung Galaxy S23' ← Lenovo IdeaPad? No.
  Row 2 → 'Samsung Galaxy S23' ← Apple iPhone? No.
  Row 3 → 'Samsung Galaxy S23' ← OnePlus Nord? No.
  ...
  Row 1 → 'Samsung Galaxy S23' ← Samsung Galaxy S23? YES. ✓
  ... continues to end of table (must check all rows)
```

For 25 rows  -  no problem. For 25 million rows  -  very slow.

### Index Scan

An index is a separate data structure (a B-tree by default) that stores
column values in sorted order, each pointing to the row's physical location.

```
Index on products.name (sorted):
  'Allen Solly Formal Shirt'  → row 10
  'Apple iPhone 15'           → row 2
  'Bajaj Mixer Grinder 500W'  → row 16
  'Biba Anarkali Dress'       → row 9
  ...
  'Samsung Galaxy S23'        → row 1   ← found in O(log n) steps
  ...
```

PostgreSQL jumps directly to the matching location  -  like looking up a word
in a dictionary rather than reading every page.

**Cost comparison:**
- Sequential scan: O(n)  -  reads every row
- Index scan: O(log n)  -  follows the tree to the answer

For 1 million rows: sequential = 1,000,000 reads. Index = ~20 reads.

---

## Part 2  -  CREATE INDEX

*(Connect to shopdb)*

### Basic index

```sql
-- Check if an index already exists on a column
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products';
```

```sql
-- Create an index on a frequently filtered column
CREATE INDEX idx_products_category_id
ON products (category_id);

-- Now queries like this use the index instead of a full scan:
SELECT * FROM products WHERE category_id = 1;
```

```sql
-- Index on order status  -  very common filter
CREATE INDEX idx_orders_status
ON orders (status);

-- Speeds up:
SELECT * FROM orders WHERE status = 'Pending';
SELECT * FROM orders WHERE status IN ('Pending', 'Shipped');
```

```sql
-- Index on a date column  -  speeds up range queries
CREATE INDEX idx_orders_order_date
ON orders (order_date);

-- Speeds up:
SELECT * FROM orders WHERE order_date >= '2024-03-01';
SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31';
```

### When to create an index

Create an index when a column is:
- Frequently used in `WHERE` clauses
- Used in `JOIN` conditions (`ON table.col = other.col`)
- Used in `ORDER BY` on large result sets
- A foreign key column (PostgreSQL does NOT auto-index FKs)

### When NOT to create an index

Do not index:
- Columns you never filter or sort by
- Very small tables (sequential scan is faster for <1000 rows)
- Columns that change very frequently (index must be updated on every write)
- Boolean columns with low selectivity  -  an index on `is_active` where
  95% of rows are TRUE is nearly useless (PostgreSQL will ignore it)

> **The trade-off:** Indexes speed up reads but slow down writes.
> Every `INSERT`, `UPDATE`, and `DELETE` must also update all relevant indexes.
> Do not index everything  -  index the columns your slow queries filter on.

---

## Part 3  -  Composite Index

A composite index covers two or more columns together.
It is useful when you commonly filter by multiple columns at the same time.

```sql
-- Frequently run: orders by a specific customer with a specific status
SELECT * FROM orders
WHERE customer_id = 1
  AND status = 'Delivered';

-- A composite index on both columns together
CREATE INDEX idx_orders_customer_status
ON orders (customer_id, status);
```

**Column order matters in a composite index.**
The index is sorted by the first column, then the second within that.

```
idx_orders_customer_status:
  customer_id=1, status='Cancelled'  → row 9
  customer_id=1, status='Delivered'  → row 1
  customer_id=1, status='Delivered'  → row 14
  customer_id=3, status='Delivered'  → row 2
  customer_id=4, status='Delivered'  → row 6
  ...
```

This index helps:
- `WHERE customer_id = 1 AND status = 'Delivered'` ✅ (both columns)
- `WHERE customer_id = 1` ✅ (leading column only)
- `WHERE status = 'Delivered'` ❌ (non-leading column  -  index NOT used)

**Rule:** A composite index can be used if your query filters on the
**leading column(s)** of the index. Filtering on a non-leading column alone
does not benefit from the composite index.

```sql
-- Composite index on watch_history for common access pattern
-- Connect to streamdb for this one

CREATE INDEX idx_watch_history_user_show
ON watch_history (user_id, show_id);

-- Helps:
SELECT * FROM watch_history WHERE user_id = 1;
SELECT * FROM watch_history WHERE user_id = 1 AND show_id = 3;
-- Does not help:
SELECT * FROM watch_history WHERE show_id = 3;  -- non-leading
```

---

## Part 4  -  Partial Index

A partial index only indexes rows that match a condition.
It is smaller and faster than a full index when you mostly query a subset of rows.

*(Connect to shopdb)*

```sql
-- Most queries about orders care about Pending and Shipped orders
-- Delivered and Cancelled orders are rarely queried
-- Index only the "active" orders

CREATE INDEX idx_orders_active
ON orders (customer_id, order_date)
WHERE status IN ('Pending', 'Shipped');

-- This index is used when:
SELECT * FROM orders
WHERE status IN ('Pending', 'Shipped')
  AND customer_id = 5;   -- ✅ matches the partial index condition
```

```sql
-- Index only premium shows for StreamDB
-- Connect to streamdb

CREATE INDEX idx_shows_premium
ON shows (rating, language)
WHERE is_premium = TRUE;

-- Helps queries like:
SELECT title, rating FROM shows
WHERE is_premium = TRUE
  AND language = 'Hindi'
ORDER BY rating DESC;
```

**Benefits of partial indexes:**
- Smaller than full index  -  less memory, faster to scan
- Faster to update  -  only rebuilt when indexed rows change
- Very effective when a small fraction of rows are "hot" (frequently queried)

---

## Part 5  -  Unique Index

A `UNIQUE` constraint automatically creates a unique index.
You can also create one explicitly for fine-grained control.

```sql
-- Ensure no two products in the same category have the same name
-- (Composite unique constraint)
ALTER TABLE products
ADD CONSTRAINT uq_product_name_per_category
UNIQUE (name, category_id);
```

```sql
-- Partial unique index: email must be unique among active customers only
-- (hypothetical  -  useful when soft-deleting records)
CREATE UNIQUE INDEX uq_active_customer_email
ON customers (email)
WHERE is_active = TRUE;   -- if customers had an is_active column
```

---

## Part 6  -  EXPLAIN: Reading a Query Plan

`EXPLAIN` shows you *how* PostgreSQL plans to execute a query  - 
without actually running it.
`EXPLAIN ANALYZE` runs the query and shows actual timing.

*(Connect to shopdb)*

```sql
-- See the plan for a simple query
EXPLAIN
SELECT * FROM products WHERE category_id = 1;
```

Output will look something like:
```
Seq Scan on products  (cost=0.00..1.31 rows=6 width=...)
  Filter: (category_id = 1)
```

`Seq Scan` = sequential scan (no index used).
After creating the index, you will see `Index Scan` instead.

```sql
-- Create the index
CREATE INDEX idx_products_category_id ON products (category_id);

-- Now check the plan again
EXPLAIN
SELECT * FROM products WHERE category_id = 1;
```

```
Index Scan using idx_products_category_id on products
  (cost=0.14..8.16 rows=6 width=...)
  Index Cond: (category_id = 1)
```

```sql
-- EXPLAIN ANALYZE: run the query and show real timing
EXPLAIN ANALYZE
SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue
FROM products    AS p
JOIN order_items AS oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY revenue DESC;
```

**Key terms in EXPLAIN output:**

| Term | Meaning |
|---|---|
| `Seq Scan` | Read every row in the table |
| `Index Scan` | Use an index to find rows |
| `Bitmap Heap Scan` | Use index to find row locations, then read from table |
| `Hash Join` | Join method using a hash table  -  good for larger joins |
| `Nested Loop` | Join method  -  one table iterated per row of the other |
| `cost=X..Y` | X = startup cost, Y = total cost (arbitrary units) |
| `rows=N` | Estimated number of rows returned |
| `actual time=X..Y` | Real time in ms (EXPLAIN ANALYZE only) |

> You do not need to be an expert at reading EXPLAIN output yet.
> The key skill: recognise `Seq Scan` on large tables as a signal
> that an index might help, and verify with `EXPLAIN ANALYZE`.

---

### ✏️ Practice Set 1  -  Indexes and EXPLAIN

**Q1.** *(shopdb)* Create an index that would speed up this query:
```sql
SELECT * FROM order_items WHERE product_id = 5;
```
Name it `idx_order_items_product_id`.
Then run `EXPLAIN` before and after to see the difference.

**Q2.** *(shopdb)* Create a composite index on `watch_history (user_id, watched_on)`
in streamdb that would help the following query:
```sql
SELECT * FROM watch_history
WHERE user_id = 3
  AND watched_on >= '2024-02-01';
```
Which column should be first in the index, and why?

**Q3.** *(shopdb)* Create a partial index on `orders (customer_id)`
only for orders where `status = 'Pending'`.
What is the advantage of this over a full index on `customer_id`?

**Q4.** *(shopdb)* List all indexes currently on the `orders` table
using the `pg_indexes` system view. What indexes exist?

---

## Part 7  -  Foreign Key Behaviours

You have used `REFERENCES table(col)` as a foreign key.
But you can control what happens when the **parent row is deleted**.

```sql
-- The four ON DELETE behaviours:

-- 1. RESTRICT (default): prevent deletion if child rows exist
--    Error: "update or delete on table violates foreign key constraint"
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT

-- 2. CASCADE: delete child rows automatically when parent is deleted
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE

-- 3. SET NULL: set the FK column to NULL when parent is deleted
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL

-- 4. SET DEFAULT: set the FK column to its DEFAULT value
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET DEFAULT
```

### When to use each

| Behaviour | Use when |
|---|---|
| `RESTRICT` | Child rows should never be orphaned  -  deletion must be manual |
| `CASCADE` | Child rows are meaningless without the parent (order items without an order) |
| `SET NULL` | Child rows remain valid without the parent (a product can be uncategorised) |
| `SET DEFAULT` | Child rows fall back to a "general" parent (e.g. default category) |

### Demonstrating CASCADE

```sql
-- In shopdb, order_items reference orders
-- Let's see what happens with CASCADE

-- First, check current FK definition
SELECT conname, confdeltype
FROM pg_constraint
WHERE conrelid = 'order_items'::regclass
  AND contype = 'f';

-- confdeltype: 'a' = NO ACTION (default), 'c' = CASCADE,
--              'n' = SET NULL, 'd' = SET DEFAULT, 'r' = RESTRICT
```

```sql
-- Demonstration: add a test order and items, then delete the order
BEGIN;

INSERT INTO orders (customer_id, order_date, status, payment_method)
VALUES (1, CURRENT_DATE, 'Pending', 'UPI')
RETURNING id;
-- Suppose id = 17

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (17, 1, 1, 74999.00);

-- Without CASCADE on order_items, this would FAIL:
-- DELETE FROM orders WHERE id = 17;
-- ERROR: violates foreign key constraint

-- With CASCADE it would work and auto-delete the item too
-- Our current FK has no CASCADE, so we delete items first:
DELETE FROM order_items WHERE order_id = 17;
DELETE FROM orders WHERE id = 17;

ROLLBACK;  -- undo the demo
```

---

## Part 8  -  Normalization: Designing Good Schemas

Normalization is a set of rules for organizing data in a relational database
to reduce redundancy and prevent update anomalies.

Think of it as: **store each fact in exactly one place**.

### The Problem: Unnormalized Data

Imagine storing order data in a single table:

```
orders_flat (BAD DESIGN)
┌──────────┬───────────────┬──────────────────┬───────────────┬────────┬───────────┬──────────┐
│ order_id │ customer_name │ customer_email   │ customer_city │ product│ category  │ price    │
├──────────┼───────────────┼──────────────────┼───────────────┼────────┼───────────┼──────────┤
│ 1        │ Aarav Mehta   │ aarav@gmail.com  │ Mumbai        │ iPhone │Electronics│ 79999.00 │
│ 1        │ Aarav Mehta   │ aarav@gmail.com  │ Mumbai        │ Headph.│Electronics│  1499.00 │
│ 2        │ Rohan Iyer    │ rohan@gmail.com  │ Bengaluru     │ WhiteT.│ Books     │   299.00 │
└──────────┴───────────────┴──────────────────┴───────────────┴────────┴───────────┴──────────┘
```

**Problems:**
- Aarav's email appears twice  -  update one, miss the other → inconsistency
- Delete the iPhone row → lose the fact that Aarav is from Mumbai
- Can't add a product without an associated order

These are called **update anomalies**, **delete anomalies**, and **insert anomalies**.

---

### First Normal Form (1NF)

**Rule:** Each cell contains one atomic (indivisible) value. No repeating groups.

**Violation example:**
```
products
┌────┬─────────────┬──────────────────────────────────┐
│ id │ name        │ genres                           │
├────┼─────────────┼──────────────────────────────────┤
│  1 │ Panchayat   │ Drama, Comedy                    │  ← NOT 1NF
│  2 │ Mirzapur    │ Crime, Action, Drama             │  ← NOT 1NF
└────┴─────────────┴──────────────────────────────────┘
```

**Fix:** Split into two tables with a junction table  -  exactly what `show_genres` is in StreamDB.

```
shows                    show_genres           genres
┌────┬───────────┐       ┌─────────┬──────────┐   ┌────┬────────┐
│ id │ title     │       │ show_id │ genre_id │   │ id │ name   │
├────┼───────────┤  ───► ├─────────┼──────────┤   ├────┼────────┤
│  1 │ Panchayat │       │    1    │    1     │   │  1 │ Drama  │
│  2 │ Mirzapur  │       │    1    │    3     │   │  3 │ Comedy │
└────┴───────────┘       │    2    │    6     │   │  6 │ Crime  │
                         └─────────┴──────────┘   └────┴────────┘
```

**1NF checklist:**
- [ ] Every column has exactly one value per row
- [ ] No comma-separated lists in a single column
- [ ] No repeating column groups (phone1, phone2, phone3...)
- [ ] Each row is uniquely identifiable (has a primary key)

---

### Second Normal Form (2NF)

**Rule:** Must be in 1NF, AND every non-key column must depend on the **whole** primary key (not just part of it).

This only applies to tables with **composite primary keys**.

**Violation example:**

```
order_items_bad (composite PK: order_id + product_id)
┌──────────┬────────────┬──────────┬───────────────┬──────────────────┐
│ order_id │ product_id │ quantity │ product_name  │ product_category │
├──────────┼────────────┼──────────┼───────────────┼──────────────────┤
│    1     │     1      │    1     │ Samsung Gal.. │ Electronics      │  ← NOT 2NF
│    1     │     4      │    2     │ boAt Rocker.. │ Electronics      │
└──────────┴────────────┴──────────┴───────────────┴──────────────────┘
```

`product_name` and `product_category` depend only on `product_id`  - 
not the full composite key `(order_id, product_id)`.

**Fix:** Move product details to their own table.

```
order_items                    products
┌──────────┬────────────┬──────┐  ┌────┬───────────────┬──────────────┐
│ order_id │ product_id │ qty  │  │ id │ name          │ category     │
├──────────┼────────────┼──────┤  ├────┼───────────────┼──────────────┤
│    1     │     1      │  1   │  │  1 │ Samsung Gal.. │ Electronics  │
│    1     │     4      │  2   │  │  4 │ boAt Rocker.. │ Electronics  │
└──────────┴────────────┴──────┘  └────┴───────────────┴──────────────┘
```

`quantity` depends on the full key (how many of THIS product in THIS order).
`name` and `category` depend only on `product_id` → they belong in `products`.

**2NF checklist:**
- [ ] Table is in 1NF
- [ ] Every non-key column depends on the **entire** primary key
- [ ] No partial dependencies  -  each fact is stored in the right table

---

### Third Normal Form (3NF)

**Rule:** Must be in 2NF, AND every non-key column must depend **directly** on the primary key, not on another non-key column.

In other words: no **transitive dependencies**  -  A → B → C (where B is not the key).

**Violation example:**

```
orders_bad
┌────┬─────────────┬──────────────────┬───────────┬─────────┐
│ id │ customer_id │ customer_city    │ state     │ status  │
├────┼─────────────┼──────────────────┼───────────┼─────────┤
│  1 │      1      │ Mumbai           │Maharashtra│Delivered│  ← NOT 3NF
│  2 │      3      │ Bengaluru        │Karnataka  │Delivered│
└────┴─────────────┴──────────────────┴───────────┴─────────┘
```

`customer_city` and `state` depend on `customer_id`, not on `id` (the order's PK).

The dependency chain is: `order.id` → `customer_id` → `city` → `state`

`state` depends on `city` (a non-key column)  -  transitive dependency.

**Fix:** Move customer details to the customers table where they belong.

```
orders                          customers
┌────┬─────────────┬──────────┐  ┌────┬──────────────┬─────────┬────────────┐
│ id │ customer_id │ status   │  │ id │ name         │ city    │ state      │
├────┼─────────────┼──────────┤  ├────┼──────────────┼─────────┼────────────┤
│  1 │      1      │Delivered │  │  1 │ Aarav Mehta  │ Mumbai  │Maharashtra │
│  2 │      3      │Delivered │  │  3 │ Rohan Iyer   │Bengaluru│Karnataka   │
└────┴─────────────┴──────────┘  └────┴──────────────┴─────────┴────────────┘
```

ShopDB already follows 3NF  -  this is exactly how it is designed.

**3NF checklist:**
- [ ] Table is in 2NF
- [ ] No non-key column determines another non-key column
- [ ] Each fact lives in exactly one table
- [ ] When a fact changes, you update exactly one row in exactly one table

---

### Normalization Summary

```
1NF → Each cell has one value. Table has a primary key.
  ↓
2NF → Every non-key column depends on the WHOLE primary key.
      (Relevant for composite PKs)
  ↓
3NF → Every non-key column depends DIRECTLY on the primary key.
      No A → B → C chains where B is not the key.
```

**In practice:** Most well-designed databases are in 3NF by default
if you follow the "one table per thing" principle from the start.
The normalization forms are a diagnostic tool  -  use them to evaluate
and fix existing schemas, not as a step-by-step process for new ones.

---

### ✏️ Practice Set 2  -  Normalization

For each scenario below, identify the normalization violation and write
the corrected table structure (you do not need to write SQL  -  table diagrams are fine).

**Q5.** This table violates 1NF. Identify why and propose a fix:
```
students
┌────┬──────────────┬────────────────────────────────┐
│ id │ name         │ courses_enrolled                │
├────┼──────────────┼────────────────────────────────┤
│  1 │ Rohit Sharma │ Maths, Physics, Chemistry       │
│  2 │ Priya Patel  │ Biology, Chemistry              │
└────┴──────────────┴────────────────────────────────┘
```

**Q6.** This table violates 2NF. The composite PK is (match_id, player_id).
Identify the partial dependency and fix it:
```
match_performances
┌──────────┬───────────┬──────┬─────────┬──────────────┬────────────┐
│ match_id │ player_id │ runs │ wickets │ player_name  │ player_role│
├──────────┼───────────┼──────┼─────────┼──────────────┼────────────┤
│    1     │     1     │  121 │    0    │ Virat Kohli  │ Batsman    │
│    1     │     3     │    8 │    4    │ J. Bumrah    │ Bowler     │
└──────────┴───────────┴──────┴─────────┴──────────────┴────────────┘
```

**Q7.** This table violates 3NF. Identify the transitive dependency and fix it:
```
employees
┌────┬──────────────┬────────────┬──────────────────┬─────────────┐
│ id │ name         │ dept_id    │ dept_name        │ dept_budget │
├────┼──────────────┼────────────┼──────────────────┼─────────────┤
│  1 │ Aarav Mehta  │     3      │ Engineering      │  5000000    │
│  2 │ Diya Sharma  │     3      │ Engineering      │  5000000    │
│  3 │ Kabir Singh  │     1      │ Sales            │  2000000    │
└────┴──────────────┴────────────┴──────────────────┴─────────────┘
```

**Q8.** Design a normalized schema (table names + columns) for this scenario:
> A cricket coaching academy tracks coaches, students, and sessions.
> Each coach can coach many students. Each student can have sessions
> with multiple coaches on different dates. A session has a duration
> and a topic (e.g. "Batting techniques", "Fielding drills").

---

## Part 9  -  Common Schema Mistakes

These are real patterns that cause problems in production databases.

### Mistake 1: Using VARCHAR for everything

```sql
-- BAD: price stored as text
CREATE TABLE products_bad (
    price VARCHAR(20)   -- '₹1,499.00' stored as text
);
-- Cannot do: SUM(price), AVG(price), price > 1000
-- Sorting gives: '1000' < '200' (alphabetical, not numeric!)

-- GOOD: use the right type
CREATE TABLE products_good (
    price_inr NUMERIC(10,2)
);
```

### Mistake 2: Storing calculated values

```sql
-- BAD: storing total when it can be calculated
CREATE TABLE orders_bad (
    subtotal    NUMERIC(10,2),
    tax         NUMERIC(10,2),
    total       NUMERIC(10,2)   -- subtotal + tax  -  can go stale!
);

-- GOOD: calculate at query time
SELECT subtotal + tax AS total FROM orders;
-- Or use a generated column if you really need to store it
```

### Mistake 3: Using NULL to mean something specific

```sql
-- BAD: NULL used to mean "not yet shipped"
UPDATE orders SET shipped_at = NULL WHERE status = 'Pending';
-- But NULL also means "we don't know when it shipped"
-- These are different concepts  -  you can't tell them apart

-- GOOD: use a proper status column + nullable timestamp
CREATE TABLE orders (
    status      VARCHAR(20) NOT NULL DEFAULT 'Pending',
    shipped_at  TIMESTAMP               -- NULL = not shipped yet (clear meaning)
);
```

### Mistake 4: No indexes on foreign key columns

```sql
-- PostgreSQL automatically indexes PRIMARY KEY columns
-- but NOT foreign key columns

-- If you run this query frequently:
SELECT * FROM order_items WHERE order_id = 5;
-- And order_items has no index on order_id, every query is a full table scan

-- Fix: index every FK column
CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
CREATE INDEX idx_performances_player_id ON performances (player_id);
CREATE INDEX idx_performances_match_id  ON performances (match_id);
```

### Mistake 5: Storing lists in a single column

```sql
-- BAD: comma-separated values
CREATE TABLE users_bad (
    favourite_genres VARCHAR(200)   -- 'Drama,Action,Comedy'
);
-- Cannot query: WHERE 'Drama' IN (favourite_genres)  -  doesn't work
-- Cannot JOIN to genres table
-- Searching requires LIKE '%Drama%'  -  slow and fragile

-- GOOD: junction table
CREATE TABLE user_genres (
    user_id   INT REFERENCES users(id),
    genre_id  INT REFERENCES genres(id),
    PRIMARY KEY (user_id, genre_id)
);
```

### Mistake 6: Not enforcing constraints in the database

```sql
-- BAD: relying only on application code to validate
CREATE TABLE products_bad (
    price_inr NUMERIC   -- no constraint
);
-- A bug in your Python code can insert price = -500

-- GOOD: enforce at the database level too
CREATE TABLE products_good (
    price_inr NUMERIC(10,2) NOT NULL CHECK (price_inr > 0)
);
-- Even if Python has a bug, the database rejects invalid data
```

---

### ✏️ Practice Set 3  -  Schema Mistakes and Indexes

**Q9.** The following table is poorly designed. List every problem you can find
and write the corrected `CREATE TABLE` statement:

```sql
CREATE TABLE orders_bad (
    id          VARCHAR(50),
    customer    VARCHAR(200),    -- stores "Aarav Mehta, Mumbai, Maharashtra"
    items       TEXT,            -- stores "Samsung Galaxy S23 x1, boAt x2"
    total       VARCHAR(20),     -- stores "₹77,997"
    date        VARCHAR(20),     -- stores "15 Jan 2024"
    paid        VARCHAR(5)       -- stores "yes" or "no"
);
```

**Q10.** *(shopdb)* Run `EXPLAIN` on this query before and after creating
an appropriate index. Write the index creation statement and describe
what changed in the EXPLAIN output:
```sql
SELECT * FROM order_items
WHERE order_id = 3;
```

**Q11.** *(shopdb)* Write the SQL to add indexes on ALL foreign key columns
across the entire ShopDB schema. List every FK column that needs indexing.

**Q12.** *(streamdb)* The following query is slow on a large version of StreamDB.
Propose one or two indexes that would help it, and explain why:
```sql
SELECT u.name, s.title, wh.minutes_watched
FROM watch_history AS wh
JOIN users         AS u  ON wh.user_id = u.id
JOIN shows         AS s  ON wh.show_id = s.id
WHERE wh.completed = TRUE
  AND u.plan = 'Premium'
ORDER BY wh.minutes_watched DESC;
```

---

## Part 10  -  Practice Set Answers

### Answers: Practice Set 1

**Q1.** Index for order_items.product_id:
```sql
-- Before (run EXPLAIN to see Seq Scan)
EXPLAIN SELECT * FROM order_items WHERE product_id = 5;

-- Create the index
CREATE INDEX idx_order_items_product_id
ON order_items (product_id);

-- After (run EXPLAIN again to see Index Scan)
EXPLAIN SELECT * FROM order_items WHERE product_id = 5;
```
With only 30 rows PostgreSQL may still choose a sequential scan  - 
it is faster for tiny tables. The index becomes meaningful at 1000+ rows.

**Q2.** Composite index for watch_history:
```sql
-- Connect to streamdb first
CREATE INDEX idx_watch_history_user_date
ON watch_history (user_id, watched_on);
```
`user_id` should be first because it is the equality filter (`user_id = 3`).
Date is a range filter  -  ranges work best as the trailing column in a composite index.
Equality conditions first, range conditions last.

**Q3.** Partial index on pending orders:
```sql
CREATE INDEX idx_orders_pending_customer
ON orders (customer_id)
WHERE status = 'Pending';
```
Advantage: the index is much smaller  -  it only contains Pending orders,
not all 15 orders. On a real system with millions of orders, most are Delivered.
A partial index covers only the fraction you actually query frequently,
using less memory and updating faster.

**Q4.** List indexes on orders:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders'
ORDER BY indexname;
```

---

### Answers: Practice Set 2

**Q5.** 1NF violation  -  courses_enrolled contains a comma-separated list.
Fix: split into two tables with a junction:
```
students:          student_courses:       courses:
id | name          student_id | course_id  id | name
1  | Rohit Sharma  1          | 1          1  | Maths
2  | Priya Patel   1          | 2          2  | Physics
                  1          | 3          3  | Chemistry
                  2          | 3          4  | Biology
                  2          | 4
```

**Q6.** 2NF violation  -  `player_name` and `player_role` depend only on
`player_id`, not the full composite key `(match_id, player_id)`.
Fix: move player details to a separate `players` table.
```
match_performances:          players:
match_id | player_id | runs | wickets   id | name         | role
1        | 1         | 121  | 0         1  | Virat Kohli  | Batsman
1        | 3         | 8    | 4         3  | J. Bumrah    | Bowler
```
This is exactly how CricketDB is designed.

**Q7.** 3NF violation  -  `dept_name` and `dept_budget` depend on `dept_id`,
not directly on `employee.id`. Transitive chain: `id → dept_id → dept_name → dept_budget`.
Fix: create a departments table.
```
employees:                    departments:
id | name         | dept_id   id | name        | budget
1  | Aarav Mehta  | 3         1  | Sales       | 2000000
2  | Diya Sharma  | 3         3  | Engineering | 5000000
3  | Kabir Singh  | 1
```

**Q8.** Coaching academy normalized schema:
```
coaches:          students:         sessions:
id | name         id | name         id | coach_id | student_id | date | duration_mins | topic
                                    PK   FK→coaches  FK→students
```
Three tables. Many-to-many between coaches and students expressed through
the sessions table (which is both a junction and an entity with its own attributes).

---

### Answers: Practice Set 3

**Q9.** Problems with orders_bad:
- `id VARCHAR`  -  should be `SERIAL PRIMARY KEY` (integer, auto-increment)
- `customer VARCHAR(200)`  -  stores multiple facts (name, city, state)  -  violates 1NF and 3NF. Should be `customer_id INT REFERENCES customers(id)`
- `items TEXT`  -  stores a list in one column  -  violates 1NF. Should be a separate `order_items` table
- `total VARCHAR(20)`  -  stores a calculated value as text with currency symbol. Should be computed or `NUMERIC(10,2)`
- `date VARCHAR(20)`  -  should be `DATE` type
- `paid VARCHAR(5)`  -  should be `BOOLEAN` or a `status` enum

```sql
-- Corrected version:
CREATE TABLE orders_good (
    id              SERIAL          PRIMARY KEY,
    customer_id     INT             NOT NULL REFERENCES customers(id),
    order_date      DATE            NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Pending'
                                    CHECK (status IN ('Pending','Shipped','Delivered','Cancelled')),
    payment_method  VARCHAR(20)     NOT NULL
);
-- order items go in a separate order_items table
-- total is computed: SUM(quantity * unit_price)
```

**Q10.** Index for order_items.order_id:
```sql
EXPLAIN SELECT * FROM order_items WHERE order_id = 3;
-- Shows: Seq Scan on order_items

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

EXPLAIN SELECT * FROM order_items WHERE order_id = 3;
-- Shows: Index Scan using idx_order_items_order_id
```

**Q11.** All FK columns in ShopDB needing indexes:
```sql
-- products → categories
CREATE INDEX idx_products_category_id    ON products    (category_id);
-- orders → customers
CREATE INDEX idx_orders_customer_id      ON orders      (customer_id);
-- order_items → orders
CREATE INDEX idx_order_items_order_id    ON order_items (order_id);
-- order_items → products
CREATE INDEX idx_order_items_product_id  ON order_items (product_id);
```

**Q12.** Indexes for the slow StreamDB query:
```sql
-- Index 1: filter on watch_history.completed (partial index)
CREATE INDEX idx_watch_history_completed
ON watch_history (user_id, show_id, minutes_watched)
WHERE completed = TRUE;

-- Index 2: filter on users.plan (if not already indexed)
CREATE INDEX idx_users_plan ON users (plan);
```
Explanation: The WHERE clause filters `wh.completed = TRUE` and `u.plan = 'Premium'`.
A partial index on watch_history covering only completed=TRUE rows is smaller and faster.
An index on users.plan speeds up the join filter. The ORDER BY on minutes_watched
can also benefit from including it in the composite index.

---

## What's Next

You have covered:
- ✅ Sequential scan vs index scan  -  the fundamental read performance difference
- ✅ `CREATE INDEX`  -  when, why, and what to index
- ✅ Composite indexes  -  column order and the leading-column rule
- ✅ Partial indexes  -  indexing a subset of rows
- ✅ Unique indexes  -  enforcing uniqueness
- ✅ `EXPLAIN` / `EXPLAIN ANALYZE`  -  reading query plans
- ✅ Foreign key behaviours  -  CASCADE, SET NULL, RESTRICT, SET DEFAULT
- ✅ 1NF, 2NF, 3NF  -  normalization rules with real examples
- ✅ Six common schema mistakes and their fixes