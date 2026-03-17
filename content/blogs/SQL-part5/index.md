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
  image: "/images/blog-images/SQL-5.png"
  alt: "introduction to SQL"
  caption: "introduction to SQL"
  relative: true
  hidden: false
---

# Lesson 5 - Subqueries & CTEs
### Theory + Practice | StreamDB — Indian Streaming Platform

---

## Before You Start

This lesson introduces **StreamDB** — a Hotstar-style streaming platform.

1. Run `setup.sql` to create and populate StreamDB
2. Verify you see 6 tables with the correct row counts
3. Connect to `streamdb` in pgAdmin before running any query

**The StreamDB schema:**

```
users               shows               genres
┌────┬───────┬──────┐  ┌────┬────────┬──────────┐  ┌────┬──────────┐
│ id │ name  │ plan │  │ id │ title  │is_premium│  │ id │ name     │
└────┴───────┴──────┘  └────┴────────┴──────────┘  └────┴──────────┘
       │                       │  │                        │
       │              show_genres  │                        │
       │           ┌──────────────┘           ┌────────────┘
       │           │ show_id | genre_id        │
       │           └──────────────────────────┘ (many-to-many)
       │
subscriptions                watch_history
┌────┬─────────┬──────────────┐  ┌────┬─────────┬─────────┬─────────┐
│ id │ user_id │ plan         │  │ id │ user_id │ show_id │ minutes │
│    │         │ started_on   │  │    │         │ watched │ watched │
│    │         │ expires_on   │  └────┴─────────┴─────────┴─────────┘
└────┴─────────┴──────────────┘
```

**What you will learn:**

| Concept | What it does |
|---|---|
| Subquery in `WHERE` with `IN` | Filter rows based on another query's result |
| Subquery in `WHERE` with `NOT IN` | Exclude rows based on another query |
| `EXISTS` / `NOT EXISTS` | Check if any matching row exists |
| Subquery in `FROM` | Use a query result as a table |
| Scalar subquery in `SELECT` | One value computed per row |
| Correlated subquery | Subquery that references the outer query |
| `WITH` — CTE | Named, reusable query blocks |
| Chained CTEs | Multiple CTEs in sequence |
| CTE vs subquery vs JOIN | When to use which |

---

## Part 1 — What Is a Subquery?

A subquery is a **query inside another query**. The inner query runs first and its result is used by the outer query.

```sql
-- Question: which shows have been watched by Premium users?

-- Step 1: find all Premium user ids
SELECT id FROM users WHERE plan = 'Premium';
-- Returns: 1, 5, 12, 17

-- Step 2: find watch history for those users
SELECT DISTINCT show_id
FROM watch_history
WHERE user_id IN (1, 5, 12, 17);

-- Combined as a subquery (the inner query replaces the hardcoded list)
SELECT DISTINCT show_id
FROM watch_history
WHERE user_id IN (
    SELECT id
    FROM users
    WHERE plan = 'Premium'
);
```

The inner query — `SELECT id FROM users WHERE plan = 'Premium'` — runs first.
Its result (a list of ids) is handed to the outer query's `IN` clause.

You never have to know the actual ids. The query figures it out dynamically.

---

## Part 2 — Subquery in WHERE with IN

`IN (subquery)` — include rows where the column matches any value in the subquery result.

```sql
-- Shows that have at least one watch history entry
-- (i.e. shows that have actually been watched)
SELECT title, language, rating
FROM shows
WHERE id IN (
    SELECT DISTINCT show_id
    FROM watch_history
)
ORDER BY rating DESC;
```

```sql
-- Users who have watched a Premium show
-- (is_premium = TRUE in the shows table)
SELECT name, city, plan
FROM users
WHERE id IN (
    SELECT DISTINCT user_id
    FROM watch_history
    WHERE show_id IN (
        SELECT id FROM shows WHERE is_premium = TRUE
    )
)
ORDER BY name;
```

This is a **nested subquery** — a subquery inside a subquery.
Read from the innermost outward:
1. `SELECT id FROM shows WHERE is_premium = TRUE` → premium show ids
2. `SELECT DISTINCT user_id FROM watch_history WHERE show_id IN (...)` → users who watched them
3. Outer query filters users by those ids

> Nested subqueries work but can get hard to read quickly.
> CTEs (Part 6) solve the readability problem.

```sql
-- Users from Maharashtra or Kerala who have an active subscription
SELECT name, city, plan
FROM users
WHERE state IN ('Maharashtra', 'Kerala')
  AND id IN (
      SELECT user_id
      FROM subscriptions
      WHERE expires_on > CURRENT_DATE
  )
ORDER BY name;
```

---

## Part 3 — Subquery in WHERE with NOT IN

`NOT IN (subquery)` — include rows where the column matches **none** of the subquery values.

```sql
-- Shows that have NEVER been watched
SELECT title, language, is_premium
FROM shows
WHERE id NOT IN (
    SELECT DISTINCT show_id
    FROM watch_history
)
ORDER BY title;
```

```sql
-- Users who have NEVER watched anything
SELECT name, city, plan
FROM users
WHERE id NOT IN (
    SELECT DISTINCT user_id
    FROM watch_history
)
ORDER BY name;
```

```sql
-- Free users who have never had a subscription of any kind
SELECT name, city, joined_on
FROM users
WHERE plan = 'Free'
  AND id NOT IN (
      SELECT DISTINCT user_id
      FROM subscriptions
  )
ORDER BY joined_on;
```

---

### ⚠️ The NOT IN + NULL Trap

This is one of the most dangerous mistakes in SQL. Memorise it.

```sql
-- Suppose watch_history had a NULL in the show_id column
-- This query would return ZERO rows — not the shows that were never watched

SELECT title FROM shows
WHERE id NOT IN (
    SELECT show_id FROM watch_history   -- if any show_id is NULL here...
);                                      -- the entire NOT IN returns nothing
```

**Why?**
`NOT IN` uses `!=` comparisons internally. Comparing anything to `NULL` gives `NULL` (unknown), not `FALSE`. So the entire `NOT IN` condition becomes unknown → no rows pass.

**The fix: always use `IS NOT NULL` inside a `NOT IN` subquery:**

```sql
-- Safe version
SELECT title FROM shows
WHERE id NOT IN (
    SELECT show_id
    FROM watch_history
    WHERE show_id IS NOT NULL   -- ✅ guard against NULLs
);
```

**Better fix: use `NOT EXISTS` instead (Part 4) — it handles NULLs correctly by design.**

---

### ✏️ Practice Set 1 — IN and NOT IN

**Q1.** Find all shows (title and rating) that have been watched
by users from **Tamil Nadu or Kerala**.

**Q2.** Find all users who have **never watched** any show rated
above 9.0. Show name, city, and plan.

**Q3.** Find shows that are premium (`is_premium = TRUE`)
but have **never appeared** in any watch history entry.
These are premium shows nobody has watched yet.

**Q4.** Find all users who joined in 2023 AND have at least one
subscription record (in the subscriptions table).
Show name, joined_on, and plan.

---

## Part 4 — EXISTS and NOT EXISTS

`EXISTS (subquery)` returns TRUE if the subquery produces **any rows at all**.
It does not care about the values — just whether a row exists.

`EXISTS` is generally **faster than IN** for large datasets because it stops
as soon as it finds the first match, rather than building the whole list.
It also handles NULLs correctly — making it the preferred choice over `NOT IN`.

```sql
-- Users who have watched at least one show
-- EXISTS version (compare with IN version from Part 2)
SELECT name, city, plan
FROM users AS u
WHERE EXISTS (
    SELECT 1
    FROM watch_history AS wh
    WHERE wh.user_id = u.id    -- ← references outer query: this is a correlated subquery
)
ORDER BY name;
```

`SELECT 1` — we don't care what the subquery returns, just whether a row exists.
The `WHERE wh.user_id = u.id` links the inner query to each row of the outer query.
This makes it a **correlated subquery** — explained in detail in Part 5.

```sql
-- Users who have NEVER watched anything (NOT EXISTS)
SELECT name, city, plan
FROM users AS u
WHERE NOT EXISTS (
    SELECT 1
    FROM watch_history AS wh
    WHERE wh.user_id = u.id
)
ORDER BY name;
```

```sql
-- Shows that have at least one Crime genre tag
SELECT title, language, rating
FROM shows AS s
WHERE EXISTS (
    SELECT 1
    FROM show_genres AS sg
    JOIN genres      AS g  ON sg.genre_id = g.id
    WHERE sg.show_id = s.id
      AND g.name = 'Crime'
)
ORDER BY rating DESC;
```

```sql
-- Users who have an active subscription (expires_on in the future)
SELECT name, plan, city
FROM users AS u
WHERE EXISTS (
    SELECT 1
    FROM subscriptions AS sub
    WHERE sub.user_id    = u.id
      AND sub.expires_on > CURRENT_DATE
)
ORDER BY name;
```

> **IN vs EXISTS:**
> - Use `IN` when the subquery returns a **small, static list** of values
> - Use `EXISTS` when checking for the **existence** of a related row
> - Always use `NOT EXISTS` instead of `NOT IN` when NULLs might be present
> - Both often produce the same result — EXISTS is usually safer and sometimes faster

---

### ✏️ Practice Set 2 — EXISTS and NOT EXISTS

**Q5.** Using `EXISTS`, find all shows that have at least one
Drama genre tag. Show title, language, and rating.

**Q6.** Using `NOT EXISTS`, find all users who do **not** have
any subscription record at all (past or present).
Show name, city, and plan.

**Q7.** Find all users who have watched **every show** with a rating
above 9.0 that appears in the watch_history table.
Hint: use a combination of IN and a subquery.

**Q8.** Find shows that have been watched by at least one user
on a Free plan. Use EXISTS. Show title and rating.

---

## Part 5 — Correlated Subqueries

A **correlated subquery** references a column from the outer query.
This means the inner query runs once **per row** of the outer query — making it powerful but potentially slow on large tables.

```sql
-- For each user, show how many shows they have watched
-- The inner query runs separately for each user row
SELECT
    name,
    plan,
    (
        SELECT COUNT(*)
        FROM watch_history AS wh
        WHERE wh.user_id = u.id    -- references outer query's u.id
    ) AS shows_watched
FROM users AS u
ORDER BY shows_watched DESC;
```

```sql
-- For each show, show the total minutes watched across all users
SELECT
    title,
    language,
    (
        SELECT COALESCE(SUM(wh.minutes_watched), 0)
        FROM watch_history AS wh
        WHERE wh.show_id = s.id
    ) AS total_minutes_watched
FROM shows AS s
ORDER BY total_minutes_watched DESC;
```

```sql
-- Users who watched more than the average number of minutes
-- across all watch history entries
SELECT
    u.name,
    u.plan,
    SUM(wh.minutes_watched) AS total_minutes
FROM users         AS u
JOIN watch_history AS wh ON wh.user_id = u.id
GROUP BY u.id, u.name, u.plan
HAVING SUM(wh.minutes_watched) > (
    SELECT AVG(minutes_watched)
    FROM watch_history
)
ORDER BY total_minutes DESC;
```

The subquery in `HAVING` — `SELECT AVG(minutes_watched) FROM watch_history` — computes
one value (the overall average) and the `HAVING` clause compares each user's total against it.

```sql
-- Each show's rating compared to the average rating of its language group
SELECT
    title,
    language,
    rating,
    ROUND(
        (SELECT AVG(s2.rating)
         FROM shows AS s2
         WHERE s2.language = s1.language),   -- correlated: same language as outer row
        2
    ) AS lang_avg_rating,
    CASE
        WHEN rating > (SELECT AVG(s2.rating) FROM shows AS s2 WHERE s2.language = s1.language)
        THEN 'Above average'
        ELSE 'Below average'
    END AS vs_language_avg
FROM shows AS s1
WHERE rating IS NOT NULL
ORDER BY language, rating DESC;
```

> **Performance note:** Correlated subqueries can be slow because they run
> once per outer row. For large tables, a JOIN or CTE is usually faster.
> Use correlated subqueries when they make the query clearest — then optimise if needed.

---

## Part 6 — Subquery in FROM (Derived Tables)

You can use a subquery as if it were a table in the `FROM` clause.
This is called a **derived table** or **inline view**.

```sql
-- Average minutes watched per plan type
-- Step 1: get total minutes per user
-- Step 2: average those totals by plan

SELECT
    plan,
    ROUND(AVG(total_minutes), 1)  AS avg_minutes_per_user
FROM (
    SELECT
        u.plan,
        u.id,
        SUM(wh.minutes_watched)  AS total_minutes
    FROM users         AS u
    JOIN watch_history AS wh  ON wh.user_id = u.id
    GROUP BY u.plan, u.id
) AS user_totals                  -- ← the derived table needs an alias
GROUP BY plan
ORDER BY avg_minutes_per_user DESC;
```

```sql
-- Top 3 most-watched shows (by total minutes) per language
SELECT language, title, total_minutes
FROM (
    SELECT
        s.language,
        s.title,
        SUM(wh.minutes_watched)  AS total_minutes,
        RANK() OVER (
            PARTITION BY s.language
            ORDER BY SUM(wh.minutes_watched) DESC
        ) AS rnk
    FROM shows         AS s
    JOIN watch_history AS wh ON wh.show_id = s.id
    GROUP BY s.id, s.language, s.title
) AS ranked
WHERE rnk <= 3
ORDER BY language, total_minutes DESC;
```

Derived tables work — but when a subquery is complex or reused in multiple places,
a **CTE** is much cleaner. That is what Part 7 is for.

---

## Part 7 — WITH: Common Table Expressions (CTEs)

A CTE names a subquery so you can:
- Reference it by name instead of nesting it
- Use it multiple times in the same query
- Chain multiple CTEs together in sequence

**Syntax:**
```sql
WITH cte_name AS (
    SELECT ...   -- the subquery
)
SELECT ...
FROM cte_name;   -- used like a regular table
```

```sql
-- Rewrite the derived table example using a CTE
-- Much more readable

WITH user_totals AS (
    SELECT
        u.id,
        u.plan,
        SUM(wh.minutes_watched)  AS total_minutes
    FROM users         AS u
    JOIN watch_history AS wh  ON wh.user_id = u.id
    GROUP BY u.id, u.plan
)
SELECT
    plan,
    ROUND(AVG(total_minutes), 1)  AS avg_minutes_per_user,
    COUNT(*)                       AS user_count
FROM user_totals
GROUP BY plan
ORDER BY avg_minutes_per_user DESC;
```

```sql
-- Which genres are most popular? (by total watch minutes)
WITH genre_watch AS (
    SELECT
        g.name          AS genre,
        SUM(wh.minutes_watched)  AS total_minutes,
        COUNT(DISTINCT wh.user_id) AS unique_watchers
    FROM genres        AS g
    JOIN show_genres   AS sg  ON sg.genre_id = g.id
    JOIN watch_history AS wh  ON wh.show_id  = sg.show_id
    GROUP BY g.id, g.name
)
SELECT
    genre,
    total_minutes,
    unique_watchers,
    ROUND(total_minutes::NUMERIC / unique_watchers, 1)  AS avg_minutes_per_watcher
FROM genre_watch
ORDER BY total_minutes DESC;
```

---

## Part 8 — Chained CTEs

You can define multiple CTEs in one `WITH` block, each building on the previous.

```sql
-- Multi-step analysis: plan upgrade candidates
-- Users on Free or Mobile who watch a lot but don't have Premium

WITH
-- Step 1: total watch minutes per user
user_activity AS (
    SELECT
        user_id,
        SUM(minutes_watched)    AS total_minutes,
        COUNT(DISTINCT show_id) AS shows_watched,
        COUNT(*) FILTER (WHERE completed = TRUE) AS completed_shows
    FROM watch_history
    GROUP BY user_id
),

-- Step 2: users with active subscriptions
active_subs AS (
    SELECT DISTINCT user_id
    FROM subscriptions
    WHERE expires_on > CURRENT_DATE
),

-- Step 3: join everything and flag upgrade candidates
user_summary AS (
    SELECT
        u.name,
        u.plan,
        u.city,
        COALESCE(ua.total_minutes, 0)    AS total_minutes,
        COALESCE(ua.shows_watched, 0)    AS shows_watched,
        CASE WHEN a.user_id IS NOT NULL
             THEN 'Active sub'
             ELSE 'No active sub'
        END AS subscription_status
    FROM users         AS u
    LEFT JOIN user_activity AS ua  ON ua.user_id = u.id
    LEFT JOIN active_subs   AS a   ON a.user_id  = u.id
)

-- Final query: Free/Mobile users who watch a lot — candidates to upsell
SELECT
    name,
    plan,
    city,
    total_minutes,
    shows_watched,
    subscription_status
FROM user_summary
WHERE plan IN ('Free', 'Mobile')
  AND total_minutes > 100
ORDER BY total_minutes DESC;
```

Read the CTEs from top to bottom — each one is a named, reusable step.
The final `SELECT` reads cleanly because all the complexity is named above.

```sql
-- Which shows should be recommended to Free users?
-- (Popular shows that Free users haven't watched yet)

WITH
free_users AS (
    SELECT id FROM users WHERE plan = 'Free'
),

popular_shows AS (
    SELECT
        show_id,
        COUNT(DISTINCT user_id) AS watcher_count
    FROM watch_history
    GROUP BY show_id
    HAVING COUNT(DISTINCT user_id) >= 3    -- watched by 3+ people
),

free_user_watches AS (
    SELECT DISTINCT show_id
    FROM watch_history
    WHERE user_id IN (SELECT id FROM free_users)
)

SELECT
    s.title,
    s.language,
    s.rating,
    s.is_premium,
    ps.watcher_count
FROM popular_shows    AS ps
JOIN shows            AS s   ON s.id = ps.show_id
WHERE ps.show_id NOT IN (SELECT show_id FROM free_user_watches)
  AND s.is_premium = FALSE     -- only recommend free shows to free users
ORDER BY ps.watcher_count DESC, s.rating DESC;
```

---

### ✏️ Practice Set 3 — Correlated Subqueries, Derived Tables, CTEs

**Q9.** Write a correlated subquery that shows each user's name,
plan, and the title of the **last show they watched** (most recent `watched_on`).

**Q10.** Using a CTE, find the top 3 most-watched shows overall
(by total minutes). Show title, language, and total_minutes.

**Q11.** Write a chained CTE query that:
- Step 1: counts total watch minutes per user
- Step 2: labels users as 'High' (>200 min), 'Medium' (100–200), or 'Low' (<100)
- Final: counts how many users fall into each engagement_level

**Q12.** Using `NOT EXISTS`, find all Hindi or Tamil shows
that no user has ever completed (i.e. no watch_history row
where `show_id` matches AND `completed = TRUE`).
Show title, language, and rating.

**Q13.** Using a CTE and window function together, rank all shows
by total minutes watched within each language group.
Show language, title, total_minutes, and rank_in_language.
Only include shows that appear in watch_history.

---

## Part 9 — CTE vs Subquery vs JOIN: Decision Guide

```
                    ┌─────────────────────────────────────┐
                    │ Do you need columns from both sides? │
                    └──────────────┬──────────────────────┘
                                   │
                    YES ────────── JOIN ──────────────────►
                                   │
                                  NO
                                   │
                    ┌──────────────▼──────────────────────┐
                    │ Are you checking existence only?     │
                    └──────────────┬──────────────────────┘
                                   │
                    YES ────────── EXISTS / NOT EXISTS ───►
                                   │
                                  NO
                                   │
                    ┌──────────────▼──────────────────────┐
                    │ Is the subquery reused or complex?   │
                    └──────────────┬──────────────────────┘
                                   │
                    YES ────────── CTE (WITH) ────────────►
                                   │
                                  NO
                                   │
                                  IN / subquery in WHERE
```

| Tool | Best when |
|---|---|
| `JOIN` | You need columns from both tables, or aggregating across a relationship |
| `IN (subquery)` | Filtering against a small list from another table |
| `EXISTS` | Checking if any related row exists (especially with possible NULLs) |
| `NOT EXISTS` | Excluding rows where a related row exists — always prefer over `NOT IN` |
| Subquery in `FROM` | You need to pre-aggregate before the main query |
| Scalar subquery in `SELECT` | One computed value per row, infrequently |
| `CTE` | Subquery is reused, the query has multiple steps, or readability matters |

---

## Part 10 — Practice Set Answers

### Answers: Practice Set 1

**Q1.** Shows watched by Tamil Nadu or Kerala users:
```sql
SELECT DISTINCT s.title, s.rating
FROM shows AS s
WHERE s.id IN (
    SELECT DISTINCT wh.show_id
    FROM watch_history AS wh
    WHERE wh.user_id IN (
        SELECT id FROM users
        WHERE state IN ('Tamil Nadu', 'Kerala')
    )
)
ORDER BY s.rating DESC;
```

**Q2.** Users who never watched a show rated above 9.0:
```sql
SELECT name, city, plan
FROM users
WHERE id NOT IN (
    SELECT DISTINCT user_id
    FROM watch_history
    WHERE show_id IN (
        SELECT id FROM shows
        WHERE rating > 9.0
    )
    AND user_id IS NOT NULL
)
ORDER BY name;
```

**Q3.** Premium shows never watched:
```sql
SELECT title, language, rating
FROM shows
WHERE is_premium = TRUE
  AND id NOT IN (
      SELECT DISTINCT show_id
      FROM watch_history
      WHERE show_id IS NOT NULL
  )
ORDER BY title;
```

**Q4.** Users who joined in 2023 and have a subscription:
```sql
SELECT name, joined_on, plan
FROM users
WHERE EXTRACT(YEAR FROM joined_on) = 2023
  AND id IN (
      SELECT DISTINCT user_id FROM subscriptions
  )
ORDER BY joined_on;
```

---

### Answers: Practice Set 2

**Q5.** Shows with Drama genre (EXISTS):
```sql
SELECT title, language, rating
FROM shows AS s
WHERE EXISTS (
    SELECT 1
    FROM show_genres AS sg
    JOIN genres      AS g  ON sg.genre_id = g.id
    WHERE sg.show_id = s.id
      AND g.name = 'Drama'
)
ORDER BY rating DESC;
```

**Q6.** Users with no subscription ever (NOT EXISTS):
```sql
SELECT name, city, plan
FROM users AS u
WHERE NOT EXISTS (
    SELECT 1
    FROM subscriptions AS sub
    WHERE sub.user_id = u.id
)
ORDER BY name;
```

**Q7.** Users who watched every show rated above 9.0:
```sql
SELECT name, city, plan
FROM users
WHERE id IN (
    SELECT user_id
    FROM watch_history
    WHERE show_id IN (
        SELECT id FROM shows WHERE rating > 9.0
    )
    GROUP BY user_id
    HAVING COUNT(DISTINCT show_id) = (
        SELECT COUNT(*) FROM shows WHERE rating > 9.0
    )
)
ORDER BY name;
```

**Q8.** Shows watched by at least one Free user (EXISTS):
```sql
SELECT s.title, s.rating
FROM shows AS s
WHERE EXISTS (
    SELECT 1
    FROM watch_history AS wh
    JOIN users         AS u  ON wh.user_id = u.id
    WHERE wh.show_id = s.id
      AND u.plan = 'Free'
)
ORDER BY s.rating DESC;
```

---

### Answers: Practice Set 3

**Q9.** Each user's last watched show:
```sql
SELECT
    u.name,
    u.plan,
    (
        SELECT s.title
        FROM watch_history AS wh
        JOIN shows         AS s  ON s.id = wh.show_id
        WHERE wh.user_id = u.id
        ORDER BY wh.watched_on DESC
        LIMIT 1
    ) AS last_show_watched
FROM users AS u
ORDER BY u.name;
```

**Q10.** Top 3 shows by total minutes (CTE):
```sql
WITH show_totals AS (
    SELECT
        s.title,
        s.language,
        SUM(wh.minutes_watched) AS total_minutes
    FROM shows         AS s
    JOIN watch_history AS wh ON wh.show_id = s.id
    GROUP BY s.id, s.title, s.language
)
SELECT title, language, total_minutes
FROM show_totals
ORDER BY total_minutes DESC
LIMIT 3;
```

**Q11.** User engagement level breakdown (chained CTEs):
```sql
WITH
user_minutes AS (
    SELECT user_id, SUM(minutes_watched) AS total_minutes
    FROM watch_history
    GROUP BY user_id
),
user_levels AS (
    SELECT
        u.id,
        CASE
            WHEN COALESCE(um.total_minutes, 0) > 200  THEN 'High'
            WHEN COALESCE(um.total_minutes, 0) >= 100 THEN 'Medium'
            ELSE                                           'Low'
        END AS engagement_level
    FROM users          AS u
    LEFT JOIN user_minutes AS um  ON um.user_id = u.id
)
SELECT engagement_level, COUNT(*) AS user_count
FROM user_levels
GROUP BY engagement_level
ORDER BY user_count DESC;
```

**Q12.** Hindi or Tamil shows no one completed (NOT EXISTS):
```sql
SELECT title, language, rating
FROM shows AS s
WHERE language IN ('Hindi', 'Tamil')
  AND NOT EXISTS (
      SELECT 1
      FROM watch_history AS wh
      WHERE wh.show_id  = s.id
        AND wh.completed = TRUE
  )
ORDER BY language, rating DESC;
```

**Q13.** Shows ranked by watch minutes within language (CTE + window):
```sql
WITH show_minutes AS (
    SELECT
        s.id,
        s.title,
        s.language,
        SUM(wh.minutes_watched) AS total_minutes
    FROM shows         AS s
    JOIN watch_history AS wh ON wh.show_id = s.id
    GROUP BY s.id, s.title, s.language
)
SELECT
    language,
    title,
    total_minutes,
    RANK() OVER (
        PARTITION BY language
        ORDER BY total_minutes DESC
    ) AS rank_in_language
FROM show_minutes
ORDER BY language, rank_in_language;
```

---

## What's Next

You have covered:
- ✅ Subquery in `WHERE` with `IN` and `NOT IN`
- ✅ The NULL trap with `NOT IN` and how to avoid it
- ✅ `EXISTS` and `NOT EXISTS` — safer and often faster
- ✅ Correlated subqueries — inner query references outer query
- ✅ Subquery in `FROM` — derived tables
- ✅ Scalar subquery in `SELECT` — one value per row
- ✅ `WITH` — CTE syntax and single-CTE usage
- ✅ Chained CTEs — multi-step analysis with named blocks
- ✅ CTE vs subquery vs JOIN decision guide

**In Lesson 2.6** we cover **Modifying Data & Schema Changes** back on ShopDB:
- `INSERT` variations — single row, multi-row, INSERT from SELECT
- `UPDATE` — single column, multiple columns, UPDATE with a subquery
- `DELETE` — safe deletion with WHERE, cascade effects
- `TRUNCATE` — fast full-table wipe
- `ALTER TABLE` — add/drop columns, change types, rename
- Transactions — `BEGIN`, `COMMIT`, `ROLLBACK`
- Savepoints — partial rollback within a transaction