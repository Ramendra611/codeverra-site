---
title: "Group by and Aggregations"
description: "Learn about grouping and aggregating on tables"

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
 image: "/images//SQL-3.png"
 alt: "introduction to SQL"
 caption: "introduction to SQL"
 relative: true
 hidden: false
---

# Lesson 3 - Aggregations & Grouping
### Theory + Practice | CricketDB + ShopDB

---

## Before You Start

This lesson uses both databases you have already built:
- **CricketDB** - players, matches, performances (Lesson 2.1)
- **ShopDB** - customers, products, orders, order_items (Lesson 2.2)

Run the `setup_check.sql` from this lesson folder to confirm both are ready.
Each section tells you which database to connect to in pgAdmin.

**What you will learn in this lesson:**

| Concept | What it does |
|---|---|
| Multi-column `GROUP BY` | Group by two or more columns simultaneously |
| `GROUP BY` with `JOIN` | Aggregate across related tables |
| `HAVING` with multiple conditions | Filter groups on complex criteria |
| `FILTER` clause | Conditional aggregation without CASE WHEN |
| `ROLLUP` | Automatically add subtotals and grand total |
| Window functions - `ROW_NUMBER` | Assign a rank within a group |
| Window functions - `RANK` / `DENSE_RANK` | Rank with tie-handling |
| Window functions - `SUM OVER` | Running totals without collapsing rows |

---

## Part 1 - Recap: Single-Column GROUP BY

*(CricketDB - connect to cricketdb in pgAdmin)*

You already know the basics. Let's start with a quick recap and build from there.

```sql
 - Total runs per player (you wrote this in 2.1)
SELECT
 player_id,
 SUM(runs) AS total_runs,
 SUM(wickets) AS total_wickets,
 COUNT(*) AS innings_played
FROM performances
GROUP BY player_id
ORDER BY total_runs DESC;
```

The problem: `player_id = 1` means nothing to a reader.
The fix: JOIN before grouping.

```sql
 - Same query - but with actual player names
SELECT
 pl.name,
 SUM(p.runs) AS total_runs,
 SUM(p.wickets) AS total_wickets,
 COUNT(*) AS innings_played
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
GROUP BY pl.id, pl.name
ORDER BY total_runs DESC;
```

> **Rule:** When you JOIN and then GROUP BY, include the JOIN key (`pl.id`)
> in GROUP BY along with any display column (`pl.name`).
> This prevents grouping errors when two players share the same name.

---

## Part 2 - Multi-Column GROUP BY

Group by more than one column to get finer breakdowns.

*(CricketDB)*

```sql
 - Runs per player per match format (Test / ODI / T20)
SELECT
 pl.name,
 m.format,
 SUM(p.runs) AS total_runs,
 COUNT(*) AS innings
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name, m.format
ORDER BY pl.name, m.format;
```

Each row now represents one player in one format - a finer grain than before.

```sql
 - Which format does each player perform best in?
 - (highest average runs)
SELECT
 pl.name,
 m.format,
 ROUND(AVG(p.runs), 1) AS avg_runs,
 MAX(p.runs) AS best_score
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name, m.format
ORDER BY pl.name, avg_runs DESC;
```

*(Switch to ShopDB)*

```sql
 - Number of orders per month per payment method
SELECT
 EXTRACT(MONTH FROM order_date) AS month,
 payment_method,
 COUNT(*) AS order_count
FROM orders
GROUP BY month, payment_method
ORDER BY month, order_count DESC;
```

```sql
 - Total revenue per category per month
 - Revenue = SUM of (quantity × unit_price) per order item
SELECT
 EXTRACT(MONTH FROM o.order_date) AS month,
 c.name AS category,
 SUM(oi.quantity * oi.unit_price) AS revenue_inr
FROM order_items AS oi
JOIN orders AS o ON oi.order_id = o.id
JOIN products AS p ON oi.product_id = p.id
JOIN categories AS c ON p.category_id = c.id
WHERE o.status != 'Cancelled'
GROUP BY month, c.id, c.name
ORDER BY month, revenue_inr DESC;
```

---

### ✏️ Practice Set 1 - Multi-column GROUP BY

**Q1.** *(CricketDB)* For each match result (Won / Lost / Draw), show:
- Total runs scored by Indian players
- Total wickets taken
- Number of innings played

**Q2.** *(CricketDB)* For each player, show their performance
broken down by match result (Won / Lost / Draw).
Show player name, result, total_runs, and total_wickets.

**Q3.** *(ShopDB)* How many customers joined per state per month?
Show state, month number, and customer_count.
Only show combinations with at least 1 customer.

**Q4.** *(ShopDB)* Show total quantity sold per category.
(Hint: JOIN order_items → products → categories.
Exclude cancelled orders.)

---

## Part 3 - HAVING With Multiple Conditions

`HAVING` filters groups after aggregation.
You can combine conditions in `HAVING` just like in `WHERE`.

*(CricketDB)*

```sql
 - Players who have batted in at least 3 innings
 - AND averaged more than 40 runs per innings
SELECT
 pl.name,
 COUNT(*) AS innings,
 ROUND(AVG(p.runs), 1) AS batting_average
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
GROUP BY pl.id, pl.name
HAVING COUNT(*) >= 3
 AND AVG(p.runs) > 40
ORDER BY batting_average DESC;
```

```sql
 - Formats where India's average score exceeds 50 runs per innings
SELECT
 m.format,
 ROUND(AVG(p.runs), 1) AS avg_runs,
 COUNT(*) AS innings_count
FROM performances AS p
JOIN matches AS m ON p.match_id = m.id
GROUP BY m.format
HAVING AVG(p.runs) > 50
ORDER BY avg_runs DESC;
```

*(Switch to ShopDB)*

```sql
 - Customers who have placed more than 1 order
SELECT
 c.name,
 c.city,
 COUNT(o.id) AS order_count
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id, c.name, c.city
HAVING COUNT(o.id) > 1
ORDER BY order_count DESC;
```

```sql
 - Categories where total revenue (non-cancelled) exceeds ₹10,000
SELECT
 cat.name AS category,
 SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM order_items AS oi
JOIN orders AS o ON oi.order_id = o.id
JOIN products AS p ON oi.product_id = p.id
JOIN categories AS cat ON p.category_id = cat.id
WHERE o.status != 'Cancelled'
GROUP BY cat.id, cat.name
HAVING SUM(oi.quantity * oi.unit_price) > 10000
ORDER BY total_revenue DESC;
```

---

### ✏️ Practice Set 2 - HAVING with multiple conditions

**Q5.** *(CricketDB)* Find players who have taken wickets in at least 2 innings
AND have a total wicket count of 4 or more.
Show player name, innings with wickets, and total wickets.

**Q6.** *(CricketDB)* Which players scored a total of more than 100 runs
AND played in both 'Won' and 'Lost' matches?
(Hint: use COUNT(DISTINCT m.result) >= 2 in HAVING.)

**Q7.** *(ShopDB)* Find states where the total number of orders placed
by customers from that state is 3 or more.
Show state and order_count.

**Q8.** *(ShopDB)* Which products have been ordered more than once across
all orders? Show product name, times ordered, and total quantity sold.

---

## Part 4 - The FILTER Clause

`FILTER (WHERE ...)` is a cleaner alternative to `CASE WHEN` inside aggregates.
It is PostgreSQL-specific but very readable.

*(CricketDB)*

```sql
 - Runs scored in Won matches vs Lost/Draw matches
 - Using CASE WHEN (you already know this)
SELECT
 pl.name,
 SUM(CASE WHEN m.result = 'Won' THEN p.runs ELSE 0 END) AS runs_in_wins,
 SUM(CASE WHEN m.result != 'Won' THEN p.runs ELSE 0 END) AS runs_in_losses
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name
ORDER BY runs_in_wins DESC;
```

```sql
 - Exact same result - using FILTER (much more readable)
SELECT
 pl.name,
 SUM(p.runs) FILTER (WHERE m.result = 'Won') AS runs_in_wins,
 SUM(p.runs) FILTER (WHERE m.result != 'Won') AS runs_in_losses,
 COUNT(*) FILTER (WHERE m.result = 'Won') AS innings_in_wins
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name
ORDER BY runs_in_wins DESC;
```

*(Switch to ShopDB)*

```sql
 - Order count and revenue, split by delivered vs other statuses
SELECT
 COUNT(*) AS total_orders,
 COUNT(*) FILTER (WHERE status = 'Delivered') AS delivered_count,
 COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled_count,
 COUNT(*) FILTER (WHERE status = 'Pending') AS pending_count
FROM orders;
```

```sql
 - Per customer: how many delivered orders and how many cancelled?
SELECT
 c.name,
 COUNT(o.id) FILTER (WHERE o.status = 'Delivered') AS delivered,
 COUNT(o.id) FILTER (WHERE o.status = 'Cancelled') AS cancelled,
 COUNT(o.id) FILTER (WHERE o.status = 'Pending') AS pending
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY delivered DESC;
```

> **CASE WHEN vs FILTER:**
> Both produce the same result. `FILTER` is cleaner and more expressive
> when you are conditionally aggregating the same column multiple times.
> `CASE WHEN` is standard SQL and works in all databases.
> `FILTER` is PostgreSQL (and SQLite 3.30+) only.

---

## Part 5 - ROLLUP: Subtotals and Grand Totals

`ROLLUP` automatically adds subtotal and grand total rows to a GROUP BY.

*(ShopDB)*

```sql
 - Orders per status - with a grand total row added automatically
SELECT
 COALESCE(status, 'GRAND TOTAL') AS status,
 COUNT(*) AS order_count
FROM orders
GROUP BY ROLLUP(status)
ORDER BY status NULLS LAST;
```

The `ROLLUP(status)` adds one extra row where `status` is NULL - 
that is the grand total row. `COALESCE` replaces the NULL with a readable label.

```sql
 - Revenue by category - with category subtotals
SELECT
 COALESCE(cat.name, '── TOTAL') AS category,
 SUM(oi.quantity * oi.unit_price) AS revenue_inr
FROM order_items AS oi
JOIN orders AS o ON oi.order_id = o.id
JOIN products AS p ON oi.product_id = p.id
JOIN categories AS cat ON p.category_id = cat.id
WHERE o.status != 'Cancelled'
GROUP BY ROLLUP(cat.name)
ORDER BY revenue_inr DESC NULLS LAST;
```

```sql
 - Multi-level ROLLUP: month → payment method → grand total
SELECT
 COALESCE(CAST(EXTRACT(MONTH FROM order_date) AS TEXT), 'All Months') AS month,
 COALESCE(payment_method, 'All Methods') AS payment_method,
 COUNT(*) AS orders
FROM orders
GROUP BY ROLLUP(EXTRACT(MONTH FROM order_date), payment_method)
ORDER BY month, payment_method NULLS LAST;
```

> `ROLLUP(a, b)` produces groups for:
> - (a, b) - each unique combination
> - (a) - subtotal per a across all b
> - () - grand total

---

## Part 6 - Window Functions

This is the most powerful concept in this lesson.

**The key difference:**
- `GROUP BY` collapses many rows into one row per group
- Window functions compute values **across rows** but **keep every row**

Think of it like: GROUP BY destroys rows. Window functions don't.

### 6.1 - ROW_NUMBER: Number Rows Within a Group

*(CricketDB)*

```sql
 - Rank each player's innings by runs scored, within each match
SELECT
 pl.name,
 m.opponent,
 m.format,
 p.runs,
 ROW_NUMBER() OVER (
 PARTITION BY p.match_id - restart numbering per match
 ORDER BY p.runs DESC - highest runs gets number 1
 ) AS rank_in_match
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
ORDER BY m.id, rank_in_match;
```

`OVER (PARTITION BY ... ORDER BY ...)` is the window specification:
- `PARTITION BY match_id` - restart the counter for each match
- `ORDER BY runs DESC` - assign 1 to the highest scorer in that match

```sql
 - Top scorer in each match (using ROW_NUMBER in a subquery)
SELECT name, opponent, format, runs
FROM (
 SELECT
 pl.name,
 m.opponent,
 m.format,
 p.runs,
 ROW_NUMBER() OVER (
 PARTITION BY p.match_id
 ORDER BY p.runs DESC
 ) AS rn
 FROM performances AS p
 JOIN players AS pl ON p.player_id = pl.id
 JOIN matches AS m ON p.match_id = m.id
) AS ranked
WHERE rn = 1
ORDER BY runs DESC;
```

This pattern - compute a window function in a subquery, then filter on it in the outer query - is one of the most useful SQL patterns you will use in real work.

---

### 6.2 - RANK and DENSE_RANK: Handle Ties

`ROW_NUMBER` gives unique numbers even to tied rows (arbitrary tiebreak).
`RANK` gives tied rows the same number, then skips (1, 1, 3, 4).
`DENSE_RANK` gives tied rows the same number, no skipping (1, 1, 2, 3).

*(CricketDB)*

```sql
 - Overall ranking of players by total runs
 - Shows the difference between RANK and DENSE_RANK
SELECT
 pl.name,
 SUM(p.runs) AS total_runs,
 RANK() OVER (ORDER BY SUM(p.runs) DESC) AS rank,
 DENSE_RANK() OVER (ORDER BY SUM(p.runs) DESC) AS dense_rank
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
GROUP BY pl.id, pl.name
ORDER BY total_runs DESC;
```

*(Switch to ShopDB)*

```sql
 - Rank products by price within each category
SELECT
 cat.name AS category,
 p.name AS product,
 p.price_inr,
 RANK() OVER (
 PARTITION BY p.category_id
 ORDER BY p.price_inr DESC
 ) AS price_rank
FROM products AS p
JOIN categories AS cat ON p.category_id = cat.id
ORDER BY cat.name, price_rank;
```

---

### 6.3 - SUM OVER: Running Totals

A running total accumulates as you move down the rows.

*(ShopDB)*

```sql
 - Running total of orders by date
SELECT
 order_date,
 COUNT(*) AS orders_that_day,
 SUM(COUNT(*)) OVER (ORDER BY order_date) AS running_total_orders
FROM orders
GROUP BY order_date
ORDER BY order_date;
```

`SUM(COUNT(*)) OVER (ORDER BY order_date)` - the inner `COUNT(*)` runs per group (per day), then `SUM OVER` accumulates those counts in date order.

```sql
 - Running revenue total across months (non-cancelled orders)
SELECT
 EXTRACT(MONTH FROM o.order_date) AS month,
 SUM(oi.quantity * oi.unit_price) AS monthly_revenue,
 SUM(SUM(oi.quantity * oi.unit_price))
 OVER (ORDER BY EXTRACT(MONTH FROM o.order_date))
 AS running_revenue
FROM order_items AS oi
JOIN orders AS o ON oi.order_id = o.id
WHERE o.status != 'Cancelled'
GROUP BY month
ORDER BY month;
```

```sql
 - Each product ranked by price within its category,
 - plus the most expensive product's price in that category
SELECT
 cat.name AS category,
 p.name AS product,
 p.price_inr,
 MAX(p.price_inr) OVER (PARTITION BY p.category_id) AS category_max_price,
 ROUND(
 p.price_inr * 100.0
 / MAX(p.price_inr) OVER (PARTITION BY p.category_id),
 1
 ) AS pct_of_max
FROM products AS p
JOIN categories AS cat ON p.category_id = cat.id
ORDER BY cat.name, p.price_inr DESC;
```

---

### ✏️ Practice Set 3 - Window Functions

**Q9.** *(CricketDB)* Assign a rank to each player's performance (innings)
within each match format (Test / ODI / T20), based on runs scored.
Show player name, format, runs, and their rank within that format.

**Q10.** *(CricketDB)* Find the top wicket-taker in each match.
Show player name, opponent, and wickets.
(Hint: Use ROW_NUMBER OVER PARTITION BY match_id ORDER BY wickets DESC,
then filter on rn = 1 in a subquery.)

**Q11.** *(ShopDB)* Show each order with:
- The order date
- The revenue for that order (SUM of quantity × unit_price for its items)
- A running total of revenue ordered by order_date

**Q12.** *(ShopDB)* For each product, show its price and the average price
of all products in the same category.
Use `AVG(price_inr) OVER (PARTITION BY category_id)` as a window function.
Label this column `category_avg_price`.

---

## Part 7 - Putting It All Together

Two realistic "analyst-level" queries that combine everything from this lesson.

*(CricketDB)*

```sql
 - Player report card:
 - Total runs, batting average, best score, wickets,
 - their rank by total runs, and runs in Won vs other matches
SELECT
 pl.name,
 COUNT(*) AS innings,
 SUM(p.runs) AS total_runs,
 ROUND(AVG(p.runs), 1) AS batting_avg,
 MAX(p.runs) AS best_score,
 SUM(p.wickets) AS total_wickets,
 RANK() OVER (ORDER BY SUM(p.runs) DESC) AS run_rank,
 SUM(p.runs) FILTER (WHERE m.result = 'Won') AS runs_in_wins,
 SUM(p.runs) FILTER (WHERE m.result != 'Won') AS runs_in_losses
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name
ORDER BY total_runs DESC;
```

*(ShopDB)*

```sql
 - Monthly business dashboard:
 - Orders, revenue, average order value, and running revenue total
SELECT
 EXTRACT(MONTH FROM o.order_date) AS month,
 COUNT(DISTINCT o.id) AS total_orders,
 COUNT(DISTINCT o.id)
 FILTER (WHERE o.status = 'Delivered') AS delivered_orders,
 SUM(oi.quantity * oi.unit_price) AS gross_revenue,
 ROUND(
 SUM(oi.quantity * oi.unit_price)
 / COUNT(DISTINCT o.id), 2
 ) AS avg_order_value,
 SUM(SUM(oi.quantity * oi.unit_price))
 OVER (ORDER BY EXTRACT(MONTH FROM o.order_date))
 AS running_revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id
WHERE o.status != 'Cancelled'
GROUP BY month
ORDER BY month;
```

Study both queries carefully. Every clause in them was introduced in this lesson or earlier ones. This is the kind of query you will write regularly when working with real data.

---

## Part 8 - Practice Set Answers

### Answers: Practice Set 1

**Q1.** Performance by match result:
```sql
SELECT
 m.result,
 SUM(p.runs) AS total_runs,
 SUM(p.wickets) AS total_wickets,
 COUNT(*) AS innings
FROM performances AS p
JOIN matches AS m ON p.match_id = m.id
GROUP BY m.result
ORDER BY total_runs DESC;
```

**Q2.** Per player per result:
```sql
SELECT
 pl.name,
 m.result,
 SUM(p.runs) AS total_runs,
 SUM(p.wickets) AS total_wickets
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name, m.result
ORDER BY pl.name, m.result;
```

**Q3.** Customers per state per month:
```sql
SELECT
 state,
 EXTRACT(MONTH FROM joined_on) AS month,
 COUNT(*) AS customer_count
FROM customers
GROUP BY state, month
ORDER BY state, month;
```

**Q4.** Total quantity sold per category:
```sql
SELECT
 cat.name AS category,
 SUM(oi.quantity) AS total_units_sold
FROM order_items AS oi
JOIN orders AS o ON oi.order_id = o.id
JOIN products AS p ON oi.product_id = p.id
JOIN categories AS cat ON p.category_id = cat.id
WHERE o.status != 'Cancelled'
GROUP BY cat.id, cat.name
ORDER BY total_units_sold DESC;
```

---

### Answers: Practice Set 2

**Q5.** Wicket-takers in 2+ innings with 4+ total wickets:
```sql
SELECT
 pl.name,
 COUNT(*) FILTER (WHERE p.wickets > 0) AS innings_with_wickets,
 SUM(p.wickets) AS total_wickets
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
GROUP BY pl.id, pl.name
HAVING COUNT(*) FILTER (WHERE p.wickets > 0) >= 2
 AND SUM(p.wickets) >= 4
ORDER BY total_wickets DESC;
```

**Q6.** 100+ runs AND played in both Won and Lost matches:
```sql
SELECT
 pl.name,
 SUM(p.runs) AS total_runs,
 COUNT(DISTINCT m.result) AS distinct_results
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
GROUP BY pl.id, pl.name
HAVING SUM(p.runs) > 100
 AND COUNT(DISTINCT m.result) >= 2
ORDER BY total_runs DESC;
```

**Q7.** States with 3+ orders:
```sql
SELECT
 c.state,
 COUNT(o.id) AS order_count
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.state
HAVING COUNT(o.id) >= 3
ORDER BY order_count DESC;
```

**Q8.** Products ordered more than once:
```sql
SELECT
 p.name,
 COUNT(oi.id) AS times_ordered,
 SUM(oi.quantity) AS total_quantity_sold
FROM order_items AS oi
JOIN products AS p ON oi.product_id = p.id
GROUP BY p.id, p.name
HAVING COUNT(oi.id) > 1
ORDER BY times_ordered DESC;
```

---

### Answers: Practice Set 3

**Q9.** Player rank within each format:
```sql
SELECT
 pl.name,
 m.format,
 p.runs,
 RANK() OVER (
 PARTITION BY m.format
 ORDER BY p.runs DESC
 ) AS rank_in_format
FROM performances AS p
JOIN players AS pl ON p.player_id = pl.id
JOIN matches AS m ON p.match_id = m.id
ORDER BY m.format, rank_in_format;
```

**Q10.** Top wicket-taker per match:
```sql
SELECT name, opponent, wickets
FROM (
 SELECT
 pl.name,
 m.opponent,
 p.wickets,
 ROW_NUMBER() OVER (
 PARTITION BY p.match_id
 ORDER BY p.wickets DESC
 ) AS rn
 FROM performances AS p
 JOIN players AS pl ON p.player_id = pl.id
 JOIN matches AS m ON p.match_id = m.id
) AS ranked
WHERE rn = 1
ORDER BY wickets DESC;
```

**Q11.** Order revenue with running total:
```sql
SELECT
 o.id AS order_id,
 o.order_date,
 SUM(oi.quantity * oi.unit_price) AS order_revenue,
 SUM(SUM(oi.quantity * oi.unit_price))
 OVER (ORDER BY o.order_date) AS running_revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id
GROUP BY o.id, o.order_date
ORDER BY o.order_date;
```

**Q12.** Product price vs category average:
```sql
SELECT
 cat.name AS category,
 p.name AS product,
 p.price_inr,
 ROUND(
 AVG(p.price_inr) OVER (PARTITION BY p.category_id),
 2
 ) AS category_avg_price
FROM products AS p
JOIN categories AS cat ON p.category_id = cat.id
ORDER BY cat.name, p.price_inr DESC;
```

---

## What's Next

You have covered:
- ✅ Multi-column `GROUP BY` - group by two or more columns
- ✅ `GROUP BY` with `JOIN` - aggregate across related tables
- ✅ `HAVING` with multiple conditions - filter groups on complex criteria
- ✅ `FILTER` clause - clean conditional aggregation
- ✅ `ROLLUP` - automatic subtotals and grand totals
- ✅ `ROW_NUMBER` - unique row numbering within partitions
- ✅ `RANK` / `DENSE_RANK` - ranking with tie-handling
- ✅ `SUM OVER` - running totals without collapsing rows
- ✅ The subquery + window function pattern - filter on a computed rank

**In Lesson 2.4** we go deep on **JOINs & Relationships**:
- INNER, LEFT, RIGHT, and FULL OUTER JOIN compared side by side
- Self-joins - a table joined to itself
- JOINs across 4 tables
- Common JOIN mistakes and how to spot them
- When to use a JOIN vs a subquery
- All on ShopDB with a full 4-table query at the end