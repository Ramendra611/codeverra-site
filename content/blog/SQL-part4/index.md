---
title: "Joins and Relationships"
description: "Learn about different types of joins"

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
  image: "/images//SQL-4.png"
  alt: "introduction to SQL"
  caption: "introduction to SQL"
  relative: true
  hidden: false
---

# Lesson 4 - JOINs & Relationships
### Theory + Practice | ShopDB

---

## Before You Start

This lesson uses **ShopDB** exclusively.
Connect to `shopdb` in pgAdmin before running any query.

Run this to confirm your data is ready:
```sql
SELECT 'customers'  AS t, COUNT(*) FROM customers
UNION ALL SELECT 'products',   COUNT(*) FROM products
UNION ALL SELECT 'orders',     COUNT(*) FROM orders
UNION ALL SELECT 'order_items',COUNT(*) FROM order_items;
-- Expected: 20, 25, 15, 30
```

**What you will learn:**

| Concept | What it does |
|---|---|
| `INNER JOIN` | Only rows that match in both tables |
| `LEFT JOIN` | All left rows + matches from right (NULL if no match) |
| `RIGHT JOIN` | All right rows + matches from left (NULL if no match) |
| `FULL OUTER JOIN` | All rows from both tables |
| Self-join | A table joined to itself |
| 4-table JOIN | The full ShopDB chain |
| Common mistakes | Duplicate rows, wrong COUNT, missing ON clause |
| JOIN vs subquery | When to use which |

---

## Part 1 — The Four JOIN Types, Side by Side

The best way to understand JOINs is to see them compared on the same data.

Let us use two small subsets to make the differences crystal clear.

```sql
-- Our test: customers who have placed orders vs customers who haven't

-- All 20 customers
-- Orders exist for customer ids: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 17, 20
-- No orders for: 11 (Ravi), 13 (Kavya), 14 (Aditya), 16 (Nikhil), 18 (Rahul), 19 (Tanvi)
```

### INNER JOIN — the intersection

Returns only rows that have a matching record in **both** tables.
Customers with no orders are excluded. Orders with no customer are excluded (impossible here due to FK, but worth knowing).

```sql
SELECT
    c.id,
    c.name,
    c.city,
    o.id          AS order_id,
    o.order_date,
    o.status
FROM customers  AS c
INNER JOIN orders AS o  ON o.customer_id = c.id
ORDER BY c.name;
```

Result: 15 rows — one per order. The 6 customers who never ordered are absent.

> `JOIN` and `INNER JOIN` are identical. `INNER` is optional — most developers write just `JOIN`.

---

### LEFT JOIN — keep all from the left

Returns **all rows from the left table** (customers), plus matching rows from the right (orders).
Customers with no orders appear once, with NULL in all order columns.

```sql
SELECT
    c.id,
    c.name,
    c.city,
    o.id          AS order_id,
    o.order_date,
    o.status
FROM customers    AS c
LEFT JOIN orders  AS o  ON o.customer_id = c.id
ORDER BY c.name;
```

Result: 20 rows — all customers. The 6 who never ordered show NULL for order columns.

```sql
-- Find customers who have NEVER placed an order
-- Pattern: LEFT JOIN + WHERE right_side IS NULL
SELECT
    c.id,
    c.name,
    c.city,
    c.state
FROM customers   AS c
LEFT JOIN orders AS o  ON o.customer_id = c.id
WHERE o.id IS NULL
ORDER BY c.name;
```

This is called the **anti-join pattern** — one of the most useful LEFT JOIN techniques.
The WHERE clause filters to only the rows where no match was found on the right side.

---

### RIGHT JOIN — keep all from the right

Returns **all rows from the right table** (orders), plus matching rows from the left (customers).
In practice, `RIGHT JOIN` is rare — you can always rewrite it as a `LEFT JOIN` by swapping table order.

```sql
-- RIGHT JOIN: keep all orders even if customer data is missing
-- (In our dataset this won't happen due to FK constraints,
--  but in a messy real-world DB it might)
SELECT
    c.name,
    c.city,
    o.id          AS order_id,
    o.status
FROM customers   AS c
RIGHT JOIN orders AS o  ON o.customer_id = c.id
ORDER BY o.id;
```

> **Tip:** Most developers avoid `RIGHT JOIN` entirely.
> `A RIGHT JOIN B` = `B LEFT JOIN A`  — just swap the tables.
> Sticking to LEFT JOIN makes queries easier to read and reason about.

---

### FULL OUTER JOIN — keep everything

Returns **all rows from both tables**. Where there is no match, NULLs fill the gaps.

```sql
-- All customers and all orders — matched where possible
SELECT
    c.name        AS customer,
    c.city,
    o.id          AS order_id,
    o.status
FROM customers      AS c
FULL OUTER JOIN orders AS o  ON o.customer_id = c.id
ORDER BY c.name NULLS LAST;
```

Result: 20+ rows. Customers without orders show NULL on the right. If there were orphan orders (no customer), they'd show NULL on the left.

> `FULL OUTER JOIN` is rare in day-to-day work. The most useful application is
> **data reconciliation** — comparing two lists to find what's in A but not B,
> what's in B but not A, and what's in both.

---

### Visual Summary

```
Tables: Customers (C) and Orders (O)

INNER JOIN          LEFT JOIN           RIGHT JOIN          FULL OUTER JOIN
                                                            
    C ∩ O               C + (C ∩ O)         O + (C ∩ O)         C ∪ O
                                                            
  ┌──┬──┐             ┌──┬──┐             ┌──┬──┐             ┌──┬──┐
  │  │██│             │██│██│             │  │██│             │██│██│
  │  │██│             │██│██│             │  │██│             │██│██│
  └──┴──┘             └──┴──┘             └──┴──┘             └──┴──┘
  C     O             C     O             C     O             C     O

Rows returned:       Rows returned:      Rows returned:      Rows returned:
  Only matches         All C rows          All O rows          All rows
                       + matches           + matches           from both
```

---

### ✏️ Practice Set 1 — JOIN types

**Q1.** Write a query using LEFT JOIN to find all products that have
**never appeared in any order**. Show product name, category_id, and price.

**Q2.** Write an INNER JOIN query that shows every order alongside
the customer's name and city. Include order_id, order_date, status,
customer name, and city. Order by order_date.

**Q3.** Using LEFT JOIN, show all categories along with the count
of products in each. Include categories that have zero products.
Show category name and product_count.

**Q4.** The anti-join pattern: find all customers who have placed
at least one order that was **Cancelled**. Show customer name, city,
and the number of cancelled orders.

---

## Part 2 — JOINs Across Multiple Tables

ShopDB has 5 tables. A full order summary requires linking all of them:

```
customers → orders → order_items → products → categories
```

Each arrow is a foreign key relationship. Let's build the full chain.

```sql
-- Step 1: customers + orders (2 tables)
SELECT
    c.name        AS customer,
    o.id          AS order_id,
    o.order_date,
    o.status
FROM customers  AS c
JOIN orders     AS o  ON o.customer_id = c.id
ORDER BY o.order_date;
```

```sql
-- Step 2: add order_items (3 tables)
SELECT
    c.name        AS customer,
    o.id          AS order_id,
    o.order_date,
    oi.product_id,
    oi.quantity,
    oi.unit_price
FROM customers   AS c
JOIN orders      AS o   ON o.customer_id  = c.id
JOIN order_items AS oi  ON oi.order_id    = o.id
ORDER BY o.order_date, oi.product_id;
```

```sql
-- Step 3: add products (4 tables)
SELECT
    c.name            AS customer,
    o.id              AS order_id,
    o.order_date,
    o.status,
    p.name            AS product,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price  AS line_total
FROM customers   AS c
JOIN orders      AS o   ON o.customer_id  = c.id
JOIN order_items AS oi  ON oi.order_id    = o.id
JOIN products    AS p   ON oi.product_id  = p.id
ORDER BY o.order_date, p.name;
```

```sql
-- Step 4: add categories (all 5 tables — the full chain)
SELECT
    c.name            AS customer,
    c.city,
    o.id              AS order_id,
    o.order_date,
    o.status,
    o.payment_method,
    cat.name          AS category,
    p.name            AS product,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price  AS line_total
FROM customers   AS c
JOIN orders      AS o    ON o.customer_id  = c.id
JOIN order_items AS oi   ON oi.order_id    = o.id
JOIN products    AS p    ON oi.product_id  = p.id
JOIN categories  AS cat  ON p.category_id  = cat.id
ORDER BY o.order_date, cat.name, p.name;
```

Study the JOIN chain: each table connects to the next via a foreign key.
This 5-table query is the backbone of most e-commerce reports.

---

## Part 3 — JOIN + GROUP BY: Aggregating Across Relationships

The most common real-world pattern: join to get context, then group to summarise.

```sql
-- Total revenue per customer (non-cancelled orders)
SELECT
    c.name                            AS customer,
    c.city,
    COUNT(DISTINCT o.id)              AS orders_placed,
    SUM(oi.quantity * oi.unit_price)  AS total_spent_inr
FROM customers   AS c
JOIN orders      AS o   ON o.customer_id  = c.id
JOIN order_items AS oi  ON oi.order_id    = o.id
WHERE o.status != 'Cancelled'
GROUP BY c.id, c.name, c.city
ORDER BY total_spent_inr DESC;
```

```sql
-- Revenue per category, with item count and average item price
SELECT
    cat.name                          AS category,
    COUNT(oi.id)                      AS items_sold,
    SUM(oi.quantity)                  AS units_sold,
    SUM(oi.quantity * oi.unit_price)  AS gross_revenue,
    ROUND(AVG(oi.unit_price), 2)      AS avg_unit_price
FROM categories   AS cat
JOIN products     AS p    ON p.category_id  = cat.id
JOIN order_items  AS oi   ON oi.product_id  = p.id
JOIN orders       AS o    ON oi.order_id    = o.id
WHERE o.status != 'Cancelled'
GROUP BY cat.id, cat.name
ORDER BY gross_revenue DESC;
```

```sql
-- Best-selling product per category
-- (most units sold — uses the window function pattern from Lesson 2.3)
SELECT category, product, units_sold
FROM (
    SELECT
        cat.name          AS category,
        p.name            AS product,
        SUM(oi.quantity)  AS units_sold,
        RANK() OVER (
            PARTITION BY cat.id
            ORDER BY SUM(oi.quantity) DESC
        ) AS rnk
    FROM categories   AS cat
    JOIN products     AS p   ON p.category_id = cat.id
    JOIN order_items  AS oi  ON oi.product_id  = p.id
    JOIN orders       AS o   ON oi.order_id    = o.id
    WHERE o.status != 'Cancelled'
    GROUP BY cat.id, cat.name, p.id, p.name
) AS ranked
WHERE rnk = 1
ORDER BY category;
```

---

### ✏️ Practice Set 2 — Multi-table JOINs

**Q5.** Write a 4-table JOIN query showing each order's total value
(sum of all its line items). Show order_id, customer name, order_date,
status, and order_total. Order by order_total descending.

**Q6.** Which city has the highest total spending?
JOIN all necessary tables and GROUP BY city.
Show city, number of orders, and total_spent.
Exclude cancelled orders.

**Q7.** Show each customer's most recent order date and the status
of that most recent order.
Hint: Use MAX(order_date) grouped by customer,
then join back to get the status.

**Q8.** For each category, show:
- Category name
- Number of distinct products that have been ordered at least once
- Total revenue from that category
Order by revenue descending.

---

## Part 4 — Self-Join: A Table Joined to Itself

A self-join is when a table references its own rows.
It looks unusual at first but it is just a regular JOIN — both sides happen to be the same table.

**Use case:** Find customers in the same city as another customer.

```sql
-- Customers who share a city with at least one other customer
SELECT
    a.name   AS customer_1,
    b.name   AS customer_2,
    a.city
FROM customers AS a
JOIN customers AS b  ON a.city = b.city
                    AND a.id  <> b.id       -- exclude self-match
ORDER BY a.city, a.name, b.name;
```

The key details:
- Two aliases for the same table: `a` and `b`
- `ON a.city = b.city` — the join condition
- `AND a.id <> b.id` — prevents a row matching itself

```sql
-- One row per city pair (avoid showing both A-B and B-A)
SELECT
    a.name   AS customer_1,
    b.name   AS customer_2,
    a.city
FROM customers AS a
JOIN customers AS b  ON a.city = b.city
                    AND a.id < b.id     -- < instead of <> avoids duplicates
ORDER BY a.city;
```

```sql
-- Products in the same category that are similarly priced (within ₹500 of each other)
SELECT
    a.name        AS product_1,
    b.name        AS product_2,
    cat.name      AS category,
    a.price_inr   AS price_1,
    b.price_inr   AS price_2,
    ABS(a.price_inr - b.price_inr)  AS price_difference
FROM products    AS a
JOIN products    AS b    ON a.category_id = b.category_id
                        AND a.id < b.id
                        AND ABS(a.price_inr - b.price_inr) <= 500
JOIN categories  AS cat  ON a.category_id = cat.id
ORDER BY cat.name, price_difference;
```

---

## Part 5 — Common JOIN Mistakes

These are the mistakes every SQL developer makes at least once.
Reading about them now will save you significant debugging time.

---

### Mistake 1: Forgetting the ON clause (Cartesian product)

```sql
-- WRONG: no ON clause → every customer × every order = 20 × 15 = 300 rows!
SELECT c.name, o.id
FROM customers AS c
JOIN orders    AS o;   -- ❌ Missing ON clause

-- CORRECT
SELECT c.name, o.id
FROM customers AS c
JOIN orders    AS o  ON o.customer_id = c.id;  -- ✅
```

A missing `ON` clause creates a **Cartesian product** — every row in the left table
matched with every row in the right table. With large tables this can produce
billions of rows and crash your database session.

---

### Mistake 2: Duplicate rows from one-to-many JOINs

```sql
-- This looks like it counts customers — but it doesn't
-- Each customer with 2 orders is counted twice!
SELECT COUNT(*) AS customer_count
FROM customers  AS c
JOIN orders     AS o  ON o.customer_id = c.id;
-- Returns 15 (number of orders) not 14 (customers who ordered)

-- Fix: count distinct customer ids
SELECT COUNT(DISTINCT c.id) AS customers_who_ordered
FROM customers  AS c
JOIN orders     AS o  ON o.customer_id = c.id;
-- Returns 14 ✅
```

When you JOIN a one-to-many relationship, the "one" side gets duplicated.
Always think: *which table am I really counting?*
If the answer is the "one" side, use `COUNT(DISTINCT one_side.id)`.

---

### Mistake 3: COUNT(*) vs COUNT(column) with LEFT JOIN

```sql
-- WRONG: COUNT(*) counts the NULL row too
SELECT
    cat.name,
    COUNT(*)  AS product_count   -- ❌ Will show 1 even for empty categories
FROM categories  AS cat
LEFT JOIN products AS p  ON p.category_id = cat.id
GROUP BY cat.id, cat.name;

-- CORRECT: COUNT(p.id) only counts non-NULL values
SELECT
    cat.name,
    COUNT(p.id)  AS product_count  -- ✅ Shows 0 for categories with no products
FROM categories  AS cat
LEFT JOIN products AS p  ON p.category_id = cat.id
GROUP BY cat.id, cat.name;
```

With `LEFT JOIN`, unmatched rows have `NULL` for all right-side columns.
`COUNT(*)` counts the row anyway (it counts rows, not values).
`COUNT(p.id)` skips NULLs — which is what you almost always want.

---

### Mistake 4: Filtering on a LEFT JOIN column in WHERE (converts to INNER JOIN)

```sql
-- INTENDED: all customers, flag those who ordered in January
-- ACTUAL: only customers who have January orders (LEFT JOIN becomes INNER JOIN!)
SELECT c.name, o.order_date
FROM customers   AS c
LEFT JOIN orders AS o  ON o.customer_id = c.id
WHERE o.order_date >= '2024-01-01'   -- ❌ This kills the LEFT JOIN effect
  AND o.order_date <  '2024-02-01';

-- FIX: move the date filter into the ON clause
SELECT c.name, o.order_date
FROM customers   AS c
LEFT JOIN orders AS o  ON o.customer_id = c.id
                      AND o.order_date >= '2024-01-01'   -- ✅ Part of the JOIN
                      AND o.order_date <  '2024-02-01';
```

When you filter on a RIGHT-side column in `WHERE`, rows that had `NULL` (no match)
are eliminated — turning your `LEFT JOIN` into an `INNER JOIN` silently.
Move those filters into the `ON` clause instead.

---

### ✏️ Practice Set 3 — JOIN mistakes and self-joins

**Q9.** The following query has a bug — it returns the wrong count.
Identify the bug and fix it:
```sql
SELECT COUNT(*) AS customers_who_ordered
FROM customers AS c
JOIN orders    AS o ON o.customer_id = c.id;
```

**Q10.** Write a query that shows all categories with their product count,
**including categories that have no products** (count should show 0, not be missing).
Use the correct form of COUNT.

**Q11.** Find pairs of customers from the same state.
Show customer_1 name, customer_2 name, and state.
Avoid showing the same pair twice (use `a.id < b.id`).

**Q12.** Write a query to find all products that have **never been ordered**.
Use the LEFT JOIN anti-join pattern (`WHERE right_side IS NULL`).
Show product name, category name, and price.

**Q13.** Fix this query so it correctly shows all customers,
including those who have never ordered, with a 0 for their order count:
```sql
-- Broken version
SELECT c.name, COUNT(o.id) AS order_count
FROM customers  AS c
JOIN orders     AS o  ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY order_count DESC;
```

---

## Part 6 — JOIN vs Subquery: When to Use Which

Both JOINs and subqueries can answer the same questions in different ways.
Knowing which to reach for makes you a better SQL writer.

```sql
-- Question: which customers have placed at least one order?

-- Option A: JOIN
SELECT DISTINCT c.name, c.city
FROM customers AS c
JOIN orders    AS o  ON o.customer_id = c.id
ORDER BY c.name;

-- Option B: Subquery with IN
SELECT name, city
FROM customers
WHERE id IN (
    SELECT DISTINCT customer_id FROM orders
)
ORDER BY name;

-- Option C: EXISTS (most semantically clear)
SELECT name, city
FROM customers AS c
WHERE EXISTS (
    SELECT 1 FROM orders AS o
    WHERE o.customer_id = c.id
)
ORDER BY name;
```

All three return the same result. Which should you use?

| Situation | Prefer |
|---|---|
| You need columns from both tables | `JOIN` |
| You need to aggregate across the relationship | `JOIN + GROUP BY` |
| You only need to check *existence* | `EXISTS` |
| You are matching against a list of values | `IN` (subquery) |
| You want to exclude rows based on another table | `NOT EXISTS` or `LEFT JOIN + IS NULL` |
| The subquery returns many rows and is reused | `CTE (WITH ...)` — covered in Lesson 2.5 |

---

## Part 7 — Full Realistic Query: Customer Order Report

This query combines everything from this lesson into a single, production-ready report.

```sql
-- Complete customer order report
-- Shows every customer, their order history, and spending summary
-- Customers who never ordered appear with 0s

SELECT
    c.name                                              AS customer,
    c.city,
    c.state,
    COUNT(DISTINCT o.id)                                AS total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'Delivered')
                                                        AS delivered,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'Cancelled')
                                                        AS cancelled,
    COALESCE(SUM(oi.quantity * oi.unit_price)
        FILTER (WHERE o.status != 'Cancelled'), 0)      AS total_spent_inr,
    MAX(o.order_date)                                   AS last_order_date
FROM customers    AS c
LEFT JOIN orders      AS o   ON o.customer_id  = c.id
LEFT JOIN order_items AS oi  ON oi.order_id    = o.id
GROUP BY c.id, c.name, c.city, c.state
ORDER BY total_spent_inr DESC;
```

Read this query carefully. Every clause has a reason:
- `LEFT JOIN` so customers with no orders appear (with 0s)
- `LEFT JOIN order_items` because we need item-level data for the sum
- `COUNT(DISTINCT o.id)` because each order has multiple items — without DISTINCT we'd count items, not orders
- `FILTER` for the delivered/cancelled breakdown
- `COALESCE(..., 0)` so customers with no orders show 0, not NULL
- `GROUP BY c.id, c.name, c.city, c.state` — all non-aggregate SELECT columns

---

## Part 8 — Practice Set Answers

### Answers: Practice Set 1

**Q1.** Products never ordered:
```sql
SELECT p.name, p.category_id, p.price_inr
FROM products    AS p
LEFT JOIN order_items AS oi  ON oi.product_id = p.id
WHERE oi.id IS NULL
ORDER BY p.name;
```

**Q2.** Orders with customer details:
```sql
SELECT
    o.id AS order_id, o.order_date, o.status,
    c.name AS customer, c.city
FROM orders     AS o
JOIN customers  AS c  ON o.customer_id = c.id
ORDER BY o.order_date;
```

**Q3.** Categories with product count (including 0):
```sql
SELECT
    cat.name,
    COUNT(p.id) AS product_count
FROM categories  AS cat
LEFT JOIN products AS p  ON p.category_id = cat.id
GROUP BY cat.id, cat.name
ORDER BY product_count DESC;
```

**Q4.** Customers with cancelled orders:
```sql
SELECT
    c.name, c.city,
    COUNT(o.id) AS cancelled_orders
FROM customers  AS c
JOIN orders     AS o  ON o.customer_id = c.id
WHERE o.status = 'Cancelled'
GROUP BY c.id, c.name, c.city
ORDER BY cancelled_orders DESC;
```

---

### Answers: Practice Set 2

**Q5.** Order total per order:
```sql
SELECT
    o.id AS order_id,
    c.name AS customer,
    o.order_date, o.status,
    SUM(oi.quantity * oi.unit_price) AS order_total
FROM orders      AS o
JOIN customers   AS c   ON o.customer_id  = c.id
JOIN order_items AS oi  ON oi.order_id    = o.id
GROUP BY o.id, c.name, o.order_date, o.status
ORDER BY order_total DESC;
```

**Q6.** City with highest spending:
```sql
SELECT
    c.city,
    COUNT(DISTINCT o.id)              AS total_orders,
    SUM(oi.quantity * oi.unit_price)  AS total_spent
FROM customers   AS c
JOIN orders      AS o   ON o.customer_id  = c.id
JOIN order_items AS oi  ON oi.order_id    = o.id
WHERE o.status != 'Cancelled'
GROUP BY c.city
ORDER BY total_spent DESC;
```

**Q7.** Each customer's most recent order and its status:
```sql
SELECT
    c.name,
    o.order_date AS latest_order_date,
    o.status
FROM customers AS c
JOIN orders    AS o  ON o.customer_id = c.id
WHERE o.order_date = (
    SELECT MAX(o2.order_date)
    FROM orders AS o2
    WHERE o2.customer_id = c.id
)
ORDER BY o.order_date DESC;
```

**Q8.** Category revenue with distinct products ordered:
```sql
SELECT
    cat.name                            AS category,
    COUNT(DISTINCT p.id)                AS distinct_products_ordered,
    SUM(oi.quantity * oi.unit_price)    AS total_revenue
FROM categories   AS cat
JOIN products     AS p    ON p.category_id  = cat.id
JOIN order_items  AS oi   ON oi.product_id  = p.id
JOIN orders       AS o    ON oi.order_id    = o.id
WHERE o.status != 'Cancelled'
GROUP BY cat.id, cat.name
ORDER BY total_revenue DESC;
```

---

### Answers: Practice Set 3

**Q9.** Fix the count bug:
```sql
-- Bug: COUNT(*) counts order rows, not customers
-- Fix: COUNT(DISTINCT c.id)
SELECT COUNT(DISTINCT c.id) AS customers_who_ordered
FROM customers AS c
JOIN orders    AS o ON o.customer_id = c.id;
```

**Q10.** Categories with product count including 0:
```sql
SELECT
    cat.name,
    COUNT(p.id) AS product_count   -- NOT COUNT(*)
FROM categories  AS cat
LEFT JOIN products AS p  ON p.category_id = cat.id
GROUP BY cat.id, cat.name
ORDER BY product_count DESC;
```

**Q11.** Customer pairs in same state:
```sql
SELECT
    a.name  AS customer_1,
    b.name  AS customer_2,
    a.state
FROM customers AS a
JOIN customers AS b  ON a.state = b.state
                    AND a.id < b.id
ORDER BY a.state, a.name;
```

**Q12.** Products never ordered:
```sql
SELECT
    p.name, cat.name AS category, p.price_inr
FROM products    AS p
JOIN categories  AS cat ON p.category_id = cat.id
LEFT JOIN order_items AS oi ON oi.product_id = p.id
WHERE oi.id IS NULL
ORDER BY p.name;
```

**Q13.** Fix the query — all customers including those with 0 orders:
```sql
SELECT
    c.name,
    COUNT(o.id) AS order_count   -- COUNT(o.id) not COUNT(*) — handles NULLs correctly
FROM customers  AS c
LEFT JOIN orders AS o  ON o.customer_id = c.id   -- LEFT JOIN not JOIN
GROUP BY c.id, c.name
ORDER BY order_count DESC;
```

---

## What's Next

You have covered:
- ✅ `INNER JOIN` — only matching rows
- ✅ `LEFT JOIN` — all left rows + matches
- ✅ `RIGHT JOIN` — all right rows + matches (and why to avoid it)
- ✅ `FULL OUTER JOIN` — all rows from both
- ✅ The anti-join pattern — `LEFT JOIN + WHERE IS NULL`
- ✅ 4-table JOIN — the full ShopDB chain
- ✅ JOIN + GROUP BY — aggregating across relationships
- ✅ Self-joins — a table joined to itself
- ✅ The 4 most common JOIN mistakes and how to fix them
- ✅ JOIN vs subquery vs EXISTS — when to use which

**In Lesson 2.5** we build **StreamDB** — a Hotstar-style streaming platform —
and go deep on **Subqueries & CTEs**:
- Subqueries in `WHERE`, `FROM`, and `SELECT`
- `IN`, `NOT IN`, `EXISTS`, `NOT EXISTS`
- Correlated subqueries
- `WITH` (CTEs) — named, chainable subqueries
- When a CTE is cleaner than a nested subquery