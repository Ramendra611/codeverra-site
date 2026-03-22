---
title: "Modifying data & Schema Changes"
description: "Learn about making changes to the existing tables"

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
 image: "/images//SQL-6.png"
 alt: "introduction to SQL"
 caption: "introduction to SQL"
 relative: true
 hidden: false
---


# Lesson 6 - Modifying Data & Schema Changes
### Theory + Practice | ShopDB

---

## Before You Start

This lesson uses **ShopDB**.
Connect to `shopdb` in pgAdmin before running any query.

**Important:** This lesson modifies real data. Some queries will permanently
change your database. The section on transactions shows you how to do this
safely - read Part 7 before running anything you are unsure about.

Quick data check:
```sql
SELECT 'customers' AS t, COUNT(*) FROM customers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
 - Expected: 20, 25, 15, 30
```

**What you will learn:**

| Concept | What it does |
|---|---|
| `INSERT` variations | Single row, multi-row, INSERT from SELECT |
| `UPDATE` | Change values in existing rows |
| `UPDATE` with subquery | Update based on data from another table |
| `DELETE` | Remove rows safely |
| `TRUNCATE` | Fast full-table wipe |
| `ALTER TABLE` | Add/drop columns, change types, rename |
| `DROP TABLE` | Remove a table entirely |
| `BEGIN / COMMIT / ROLLBACK` | Wrap changes in a transaction |
| `SAVEPOINT` | Partial rollback within a transaction |

---

## Part 1 - INSERT: Adding New Rows

You have already used basic INSERT. Here are the variations that matter.

### Single row INSERT

```sql
 - Add one new customer
INSERT INTO customers (name, email, city, state, joined_on)
VALUES ('Siddharth Rao', 'siddharth.rao@gmail.com', 'Bengaluru', 'Karnataka', '2024-06-01');
```

```sql
 - Using DEFAULT for joined_on (will use CURRENT_DATE)
INSERT INTO customers (name, email, city, state)
VALUES ('Fatima Khan', 'fatima.khan@gmail.com', 'Hyderabad', 'Telangana');
```

### Multi-row INSERT

```sql
 - Insert multiple rows in one statement - much faster than separate INSERTs
INSERT INTO products (name, category_id, price_inr, stock_quantity) VALUES
('Sony WH-1000XM5', 1, 29999.00, 20),
('JBL Flip 6', 1, 9999.00, 40),
('Woodland Sneakers', 2, 3499.00, 60);
```

### INSERT and get the new id back

```sql
 - RETURNING: get the auto-assigned id after INSERT
 - Useful when you immediately need the new row's id

INSERT INTO customers (name, email, city, state)
VALUES ('Preethi Menon', 'preethi.menon@gmail.com', 'Chennai', 'Tamil Nadu')
RETURNING id, name;
```

`RETURNING` is PostgreSQL-specific. It returns the inserted row (or any columns
you specify) - handy when you need the new `id` to insert into a child table next.

### INSERT from SELECT

```sql
 - Create an archive table first
CREATE TABLE customers_archive (
 LIKE customers INCLUDING ALL - copy the structure of customers exactly
);

 - Copy all inactive-looking customers (joined before 2023) to the archive
INSERT INTO customers_archive
SELECT *
FROM customers
WHERE joined_on < '2023-03-01';
```

`INSERT INTO ... SELECT ...` - the SELECT result becomes the data to insert.
No VALUES keyword. The column count and types must match.

---

### ✏️ Practice Set 1 - INSERT

**Q1.** Insert a new category called `'Grocery'` with the description
`'Daily essentials, packaged foods, beverages'`.
Use `RETURNING id, name` to see the new category's id.

**Q2.** Insert two new products in the Grocery category
(use the id returned from Q1):
- `'Tata Salt 1kg'` - ₹25.00 - 500 units in stock
- `'Aashirvaad Atta 5kg'` - ₹265.00 - 200 units in stock

**Q3.** A new customer signs up today. Insert them using DEFAULT for `joined_on`:
- Name: `Kiran Bhat`, Email: `kiran.bhat@gmail.com`
- City: `Mysore`, State: `Karnataka`

**Q4.** Create a table called `products_premium` with the same structure
as `products`, then insert all products priced above ₹20000 into it
using INSERT from SELECT.

---

## Part 2 - UPDATE: Changing Existing Data

`UPDATE` modifies values in existing rows. Always use `WHERE` unless you
deliberately want to update every row.

### Basic UPDATE

```sql
 - A product's price has changed
UPDATE products
SET price_inr = 27999.00
WHERE name = 'Samsung Galaxy S23';
```

```sql
 - Update multiple columns at once
UPDATE products
SET price_inr = 72999.00,
 stock_quantity = 35
WHERE name = 'Samsung Galaxy S23';
```

```sql
 - Check how many rows were affected
 - pgAdmin shows "UPDATE N" in the Messages panel
 - N = number of rows changed
```

### UPDATE with expressions

```sql
 - Apply a 10% discount to all Electronics products
UPDATE products
SET price_inr = ROUND(price_inr * 0.90, 2)
WHERE category_id = (
 SELECT id FROM categories WHERE name = 'Electronics'
);
```

```sql
 - Increase stock by 50 for all Sports products
 - Using the current value in the expression
UPDATE products
SET stock_quantity = stock_quantity + 50
WHERE category_id = (
 SELECT id FROM categories WHERE name = 'Sports'
);
```

### UPDATE with a subquery in WHERE

```sql
 - Mark all orders from customers in Delhi as high priority
 - (We don't have a priority column yet - we'll add one in Part 5)
 - For now: update status to 'Shipped' for all Pending Delhi orders
UPDATE orders
SET status = 'Shipped'
WHERE status = 'Pending'
 AND customer_id IN (
 SELECT id
 FROM customers
 WHERE state = 'Delhi'
 );
```

### UPDATE with FROM (PostgreSQL-specific join-style update)

```sql
 - Update order status using a JOIN-style UPDATE
 - Set all orders from Karnataka customers to 'Shipped' if still Pending

UPDATE orders AS o
SET status = 'Shipped'
FROM customers AS c
WHERE o.customer_id = c.id
 AND c.state = 'Karnataka'
 AND o.status = 'Pending';
```

`UPDATE ... FROM` is PostgreSQL's way of updating based on data from another table.
It is cleaner than a subquery when the condition involves multiple columns.

### Safe UPDATE pattern - always preview first

```sql
 - STEP 1: Run as SELECT first to see which rows would be affected
SELECT id, name, price_inr
FROM products
WHERE category_id = 1; - Electronics

 - STEP 2: Only after confirming, run the UPDATE
UPDATE products
SET price_inr = ROUND(price_inr * 0.90, 2)
WHERE category_id = 1;
```

> **Golden rule:** Before any `UPDATE` or `DELETE`, write the equivalent
> `SELECT` first. Confirm the rows, then change `SELECT ...` to `UPDATE SET`.
> This habit prevents accidental mass-updates.

---

### ✏️ Practice Set 2 - UPDATE

**Q5.** The iPhone 15's price has dropped to ₹74,999.
Update it in the products table.

**Q6.** All products in the `Beauty` category are going out of stock.
Set `stock_quantity = 0` and `is_available = FALSE`
for every product in the Beauty category.
(Use a subquery to find the category id.)

**Q7.** A customer changed their email address.
Update Meera Gupta's email to `meera.gupta.new@gmail.com`.

**Q8.** Apply a 5% price increase to all products priced under ₹500.
Round the result to 2 decimal places.
Preview with a SELECT first, then run the UPDATE.

---

## Part 3 - DELETE: Removing Rows

`DELETE` removes rows permanently. Like `UPDATE`, always use `WHERE`
unless you mean to delete everything.

### Basic DELETE

```sql
 - Delete a specific order item
DELETE FROM order_items
WHERE id = 1;
```

```sql
 - Delete all cancelled orders' items first (FK constraint requires this)
DELETE FROM order_items
WHERE order_id IN (
 SELECT id FROM orders WHERE status = 'Cancelled'
);

 - Then delete the cancelled orders themselves
DELETE FROM orders
WHERE status = 'Cancelled';
```

> **Foreign key order matters:**
> You cannot delete a parent row if child rows still reference it.
> Delete children first, then parents.
> (Unless the FK is set up with `ON DELETE CASCADE` - then the DB handles it.)

### DELETE with a subquery

```sql
 - Remove all products that have never been ordered
DELETE FROM products
WHERE id NOT IN (
 SELECT DISTINCT product_id
 FROM order_items
 WHERE product_id IS NOT NULL
);
```

### Preview before DELETE

```sql
 - STEP 1: SELECT to preview what would be deleted
SELECT id, name, price_inr
FROM products
WHERE stock_quantity = 0
 AND is_available = FALSE;

 - STEP 2: If the result looks right, delete
DELETE FROM products
WHERE stock_quantity = 0
 AND is_available = FALSE;
```

### RETURNING with DELETE

```sql
 - Delete and see exactly what was removed
DELETE FROM customers
WHERE email = 'preethi.menon@gmail.com'
RETURNING id, name, email;
```

`RETURNING` works with DELETE too - useful for logging or confirming
exactly which rows were removed.

---

## Part 4 - TRUNCATE: Fast Full-Table Wipe

`TRUNCATE` removes **all rows** from a table instantly.
It is much faster than `DELETE FROM table` (no WHERE) for large tables
because it does not scan rows - it just drops and recreates the data pages.

```sql
 - Remove all rows from the archive table we created
TRUNCATE TABLE customers_archive;
```

```sql
 - Truncate and reset the auto-increment counter
TRUNCATE TABLE customers_archive RESTART IDENTITY;
```

`RESTART IDENTITY` resets the `SERIAL` counter back to 1.
Without it, the next inserted row picks up from where the old counter left off.

> **TRUNCATE vs DELETE:**
>
> | | DELETE | TRUNCATE |
> |---|---|---|
> | Removes all rows | ✅ | ✅ |
> | Can use WHERE | ✅ | ❌ |
> | Can ROLLBACK | ✅ | ✅ (in PostgreSQL) |
> | Fires triggers | ✅ | ❌ |
> | Resets SERIAL | ❌ | ✅ (with RESTART IDENTITY) |
> | Speed on large tables | Slow | Fast |
>
> Use `DELETE` when you need WHERE. Use `TRUNCATE` when wiping a whole table.

---

### ✏️ Practice Set 3 - DELETE and TRUNCATE

**Q9.** Delete the two Grocery products you inserted in Practice Set 1
(Tata Salt and Aashirvaad Atta). Use a subquery to find the Grocery
category id rather than hardcoding it.

**Q10.** Preview then delete all products where `is_available = FALSE`
AND `stock_quantity = 0`. How many rows are affected?

**Q11.** Delete the `customers_archive` table's data using TRUNCATE.
Then confirm it is empty with a SELECT COUNT(*).

**Q12.** A customer (Fatima Khan, inserted in Q3 of Practice Set 1)
wants to delete their account. Delete her from the customers table
using RETURNING to confirm which row was removed.

---

## Part 5 - ALTER TABLE: Changing the Schema

`ALTER TABLE` changes the *structure* of a table - adding or removing columns,
changing types, renaming things. It does not touch the data (unless the type
change requires conversion).

### Add a column

```sql
 - Add a 'phone' column to customers
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
 - New column is NULL for all existing rows (since no DEFAULT specified)
```

```sql
 - Add a column with a default value
ALTER TABLE orders
ADD COLUMN is_priority BOOLEAN NOT NULL DEFAULT FALSE;
 - All existing rows get FALSE automatically
```

```sql
 - Add a column with a constraint
ALTER TABLE products
ADD COLUMN discount_pct NUMERIC(5,2) DEFAULT 0.00
 CHECK (discount_pct BETWEEN 0 AND 100);
```

### Drop a column

```sql
 - Remove a column entirely (data is gone permanently)
ALTER TABLE customers
DROP COLUMN phone;
```

### Rename a column

```sql
ALTER TABLE customers
RENAME COLUMN joined_on TO registration_date;
```

### Rename a table

```sql
ALTER TABLE customers_archive
RENAME TO customers_backup;
```

### Change a column's data type

```sql
 - Change stock_quantity from INT to BIGINT (safe - no data loss)
ALTER TABLE products
ALTER COLUMN stock_quantity TYPE BIGINT;
```

```sql
 - Change a VARCHAR to TEXT (also safe - TEXT is just unlimited VARCHAR)
ALTER TABLE categories
ALTER COLUMN description TYPE TEXT;
```

> Changing to a *narrower* type (e.g. TEXT to VARCHAR(10)) may fail
> if existing data is longer than the new limit.
> Always check with a SELECT first.

### Add a constraint to an existing column

```sql
 - Add a NOT NULL constraint to an existing column
 - (only works if no existing rows have NULL in that column)
UPDATE customers SET phone = 'Unknown' WHERE phone IS NULL;
ALTER TABLE customers
ALTER COLUMN phone SET NOT NULL;
```

```sql
 - Add a UNIQUE constraint
ALTER TABLE customers
ADD CONSTRAINT customers_phone_unique UNIQUE (phone);
```

### Drop a constraint

```sql
ALTER TABLE customers
DROP CONSTRAINT customers_phone_unique;
```

---

### ✏️ Practice Set 4 - ALTER TABLE

**Q13.** Add a `loyalty_points` column to the `customers` table.
It should be an integer, NOT NULL, with a default of 0.

**Q14.** Add a `return_policy` column to `products` of type TEXT,
allowing NULL (some products may not have a return policy stated).

**Q15.** Rename the `is_priority` column in `orders`
(that you added in Part 5) to `priority_order`.

**Q16.** Update all orders with total value above ₹50,000
to set `priority_order = TRUE`.
(Hint: use UPDATE ... FROM with a subquery that sums order_items.)

---

## Part 6 - DROP TABLE: Removing a Table

`DROP TABLE` removes the table and all its data permanently.
Drop in reverse dependency order - children before parents.

```sql
 - Drop the archive/backup table (no foreign key dependencies)
DROP TABLE IF EXISTS customers_backup;
DROP TABLE IF EXISTS products_premium;
```

```sql
 - IF EXISTS prevents an error if the table does not exist
 - Safe to run even if the table was already dropped
DROP TABLE IF EXISTS some_table_that_might_not_exist;
```

```sql
 - CASCADE: also drops any objects that depend on this table
 - (e.g. views, foreign keys referencing it)
 - Use with caution
DROP TABLE categories CASCADE;
 - This would also drop the FK constraint in products
 - Do NOT run this on your live ShopDB
```

> **Never drop a table you are not 100% sure about.**
> Always use `IF EXISTS`. Always check dependencies first with:
> ```sql
> SELECT conname, conrelid::regclass
> FROM pg_constraint
> WHERE confrelid = 'your_table'::regclass;
> ```

---

## Part 7 - Transactions: BEGIN, COMMIT, ROLLBACK

A **transaction** groups multiple SQL statements into one atomic unit.
Either all succeed together, or all fail together - there is no partial state.

```
BEGIN ← start the transaction
 statement 1
 statement 2
 statement 3
COMMIT ← make all changes permanent
 - or - 
ROLLBACK ← undo everything back to BEGIN
```

### Why transactions matter

```sql
 - Scenario: customer places an order
 - We need to:
 - 1. Create the order record
 - 2. Insert order items
 - 3. Decrease stock quantity
 - If step 3 fails, steps 1 and 2 should also be undone.
 - Without a transaction, you get a half-complete order.
```

### Basic transaction

```sql
BEGIN;

 - Step 1: create the order
INSERT INTO orders (customer_id, order_date, status, payment_method)
VALUES (1, CURRENT_DATE, 'Pending', 'UPI')
RETURNING id;
 - Suppose it returns id = 16

 - Step 2: add items (using the new order id)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (16, 3, 1, 24999.00), - OnePlus Nord
 (16, 4, 2, 1499.00); - boAt Headphones x2

 - Step 3: reduce stock
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = 3;
UPDATE products SET stock_quantity = stock_quantity - 2 WHERE id = 4;

COMMIT;
 - All 4 statements are now permanently saved together
```

### ROLLBACK: undoing a transaction

```sql
BEGIN;

 - Accidentally update ALL products (forgot the WHERE clause)
UPDATE products SET price_inr = 0;

 - Oh no. Let's check the damage
SELECT id, name, price_inr FROM products LIMIT 5;
 - All prices are 0!

 - Undo everything since BEGIN
ROLLBACK;

 - Prices are restored
SELECT id, name, price_inr FROM products LIMIT 5;
 - ✅ Back to original values
```

> **In pgAdmin:** If you accidentally run a destructive query, immediately type
> `ROLLBACK;` and run it. As long as you have not yet COMMIT-ted, your changes
> can be undone. This is why wrapping risky operations in `BEGIN` first is
> a good habit.

### SAVEPOINT: partial rollback

A savepoint lets you roll back to a specific point *within* a transaction,
without undoing everything from `BEGIN`.

```sql
BEGIN;

 - Safe operation - add a new product
INSERT INTO products (name, category_id, price_inr, stock_quantity)
VALUES ('Test Product A', 1, 999.00, 10);

SAVEPOINT after_insert; - mark this point

 - Risky operation - update with a mistake
UPDATE products SET price_inr = 0 WHERE category_id = 1;

 - Check the damage
SELECT name, price_inr FROM products WHERE category_id = 1;
 - All Electronics are ₹0 - not what we wanted

 - Roll back only to the savepoint (INSERT is preserved)
ROLLBACK TO SAVEPOINT after_insert;

 - The INSERT is still there, the bad UPDATE is undone
SELECT name, price_inr FROM products WHERE category_id = 1;
 - ✅ Original Electronics prices restored

 - Now do the right update
UPDATE products
SET price_inr = ROUND(price_inr * 0.95, 2)
WHERE category_id = 1;

COMMIT; - commit the INSERT + correct UPDATE
```

### Transaction best practices

```sql
 - Always wrap multi-step operations in a transaction
BEGIN;
 - all related changes
COMMIT;

 - For any risky single statement, use BEGIN first
BEGIN;
DELETE FROM orders WHERE status = 'Cancelled';
 - review Messages panel: DELETE N
 - If N looks right:
COMMIT;
 - If N looks wrong:
ROLLBACK;
```

---

### ✏️ Practice Set 5 - Transactions

**Q17.** Using a transaction, do the following as one atomic unit:
- Insert a new order for customer id 5 (Kabir Singh), dated today, status Pending, payment UPI
- Insert one order item for that order: product id 19 (SG Cricket Bat), quantity 1, unit_price 3499.00
- Reduce the stock of product id 19 by 1
- COMMIT if all three succeed

**Q18.** Open a transaction, update ALL products to set `is_available = FALSE`
(simulate a store shutdown), then ROLLBACK before it becomes permanent.
Confirm the data is unchanged with a SELECT after the ROLLBACK.

**Q19.** Using SAVEPOINT, do the following:
- BEGIN a transaction
- Insert a new customer (any name/email/city/state)
- Set a SAVEPOINT called `after_customer`
- Try to insert a product with `price_inr = -100` (this should fail the CHECK constraint)
- ROLLBACK TO SAVEPOINT after_customer
- COMMIT (the customer insert should be saved, the failed product insert rolled back)

---

## Part 8 - Putting It All Together

A realistic sequence of DML operations for a "new product launch" scenario:

```sql
 - ============================================================
 - New product launch: add products, update stock, create promo
 - ============================================================

BEGIN;

 - 1. Add a new sub-category (if it doesn't exist)
INSERT INTO categories (name, description)
VALUES ('Wearables', 'Smartwatches, fitness bands, earbuds')
ON CONFLICT (name) DO NOTHING; - skip if category already exists
 - ON CONFLICT is PostgreSQL's UPSERT - covered more in advanced SQL

 - 2. Add new products in that category
INSERT INTO products (name, category_id, price_inr, stock_quantity)
SELECT
 p.name,
 c.id,
 p.price,
 p.qty
FROM (
 VALUES
 ('boAt Wave Horizon Smartwatch', 5999.00, 80),
 ('Noise ColorFit Pro 5', 3499.00, 120),
 ('Realme TechLife Watch R100', 1999.00, 200)
) AS p(name, price, qty)
CROSS JOIN (
 SELECT id FROM categories WHERE name = 'Wearables'
) AS c;

 - 3. Apply a launch discount to all Electronics (10% off)
UPDATE products
SET price_inr = ROUND(price_inr * 0.90, 2)
WHERE category_id = (SELECT id FROM categories WHERE name = 'Electronics');

 - 4. Verify before committing
SELECT name, price_inr, stock_quantity
FROM products
WHERE category_id IN (
 SELECT id FROM categories WHERE name IN ('Electronics', 'Wearables')
)
ORDER BY category_id, price_inr DESC;

COMMIT;
```

---

## Part 9 - Practice Set Answers

### Answers: Practice Set 1

**Q1.** Insert Grocery category:
```sql
INSERT INTO categories (name, description)
VALUES ('Grocery', 'Daily essentials, packaged foods, beverages')
RETURNING id, name;
```

**Q2.** Insert grocery products (assuming Grocery got id=7):
```sql
INSERT INTO products (name, category_id, price_inr, stock_quantity) VALUES
('Tata Salt 1kg', 7, 25.00, 500),
('Aashirvaad Atta 5kg', 7, 265.00, 200);
```

**Q3.** New customer with DEFAULT joined_on:
```sql
INSERT INTO customers (name, email, city, state)
VALUES ('Kiran Bhat', 'kiran.bhat@gmail.com', 'Mysore', 'Karnataka');
```

**Q4.** Premium products table:
```sql
CREATE TABLE products_premium (LIKE products INCLUDING ALL);

INSERT INTO products_premium
SELECT * FROM products WHERE price_inr > 20000;
```

---

### Answers: Practice Set 2

**Q5.** Update iPhone price:
```sql
UPDATE products
SET price_inr = 74999.00
WHERE name = 'Apple iPhone 15';
```

**Q6.** Beauty products out of stock:
```sql
UPDATE products
SET stock_quantity = 0,
 is_available = FALSE
WHERE category_id = (
 SELECT id FROM categories WHERE name = 'Beauty'
);
```

**Q7.** Update Meera's email:
```sql
UPDATE customers
SET email = 'meera.gupta.new@gmail.com'
WHERE name = 'Meera Gupta';
```

**Q8.** 5% price increase for sub-₹500 products:
```sql
 - Preview first
SELECT name, price_inr, ROUND(price_inr * 1.05, 2) AS new_price
FROM products
WHERE price_inr < 500;

 - Then update
UPDATE products
SET price_inr = ROUND(price_inr * 1.05, 2)
WHERE price_inr < 500;
```

---

### Answers: Practice Set 3

**Q9.** Delete grocery products:
```sql
DELETE FROM products
WHERE category_id = (
 SELECT id FROM categories WHERE name = 'Grocery'
);
```

**Q10.** Delete unavailable, out-of-stock products:
```sql
 - Preview
SELECT id, name FROM products
WHERE is_available = FALSE AND stock_quantity = 0;

 - Delete
DELETE FROM products
WHERE is_available = FALSE AND stock_quantity = 0;
```

**Q11.** Truncate archive:
```sql
TRUNCATE TABLE customers_archive RESTART IDENTITY;
SELECT COUNT(*) FROM customers_archive; - should be 0
```

**Q12.** Delete Fatima Khan:
```sql
DELETE FROM customers
WHERE email = 'fatima.khan@gmail.com'
RETURNING id, name, email;
```

---

### Answers: Practice Set 4

**Q13.** Add loyalty_points:
```sql
ALTER TABLE customers
ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0;
```

**Q14.** Add return_policy:
```sql
ALTER TABLE products
ADD COLUMN return_policy TEXT;
```

**Q15.** Rename is_priority:
```sql
ALTER TABLE orders
RENAME COLUMN is_priority TO priority_order;
```

**Q16.** Set priority for high-value orders:
```sql
UPDATE orders AS o
SET priority_order = TRUE
FROM (
 SELECT order_id, SUM(quantity * unit_price) AS total
 FROM order_items
 GROUP BY order_id
 HAVING SUM(quantity * unit_price) > 50000
) AS big_orders
WHERE o.id = big_orders.order_id;
```

---

### Answers: Practice Set 5

**Q17.** Atomic order placement:
```sql
BEGIN;

INSERT INTO orders (customer_id, order_date, status, payment_method)
VALUES (5, CURRENT_DATE, 'Pending', 'UPI');
 - Note the id returned - assume it is 16

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (16, 19, 1, 3499.00);

UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE id = 19;

COMMIT;
```

**Q18.** Store shutdown + ROLLBACK:
```sql
BEGIN;

UPDATE products SET is_available = FALSE;

SELECT name, is_available FROM products LIMIT 5;
 - All FALSE

ROLLBACK;

SELECT name, is_available FROM products LIMIT 5;
 - Back to original values ✅
```

**Q19.** SAVEPOINT with constraint failure:
```sql
BEGIN;

INSERT INTO customers (name, email, city, state)
VALUES ('Test User', 'test.user@gmail.com', 'Mumbai', 'Maharashtra');

SAVEPOINT after_customer;

 - This will fail: CHECK (price_inr > 0) rejects -100
INSERT INTO products (name, category_id, price_inr, stock_quantity)
VALUES ('Bad Product', 1, -100, 10);
 - ERROR: new row violates check constraint

ROLLBACK TO SAVEPOINT after_customer;

COMMIT;
 - Customer is saved, failed product insert is not
```

---

## What's Next

You have covered:
- ✅ `INSERT` - single row, multi-row, RETURNING, INSERT from SELECT
- ✅ `UPDATE` - basic, expressions, subquery, UPDATE FROM
- ✅ Safe preview pattern - SELECT before UPDATE/DELETE
- ✅ `DELETE` - with WHERE, with subquery, RETURNING
- ✅ `TRUNCATE` - fast wipe, RESTART IDENTITY
- ✅ `ALTER TABLE` - add/drop/rename columns, change types, add constraints
- ✅ `DROP TABLE` - IF EXISTS, CASCADE
- ✅ `BEGIN / COMMIT / ROLLBACK` - atomic transactions
- ✅ `SAVEPOINT` - partial rollback within a transaction

**In Lesson 2.7** we cover **Indexes, Constraints & Schema Design**:
- How PostgreSQL finds rows (sequential scan vs index scan)
- `CREATE INDEX` - when and what to index
- Partial and composite indexes
- Foreign key behaviour - CASCADE, SET NULL, RESTRICT
- Normalization - 1NF, 2NF, 3NF with real examples
- Common schema mistakes and how to fix them
- `EXPLAIN` - reading a query execution plan