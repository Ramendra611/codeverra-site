---
title: "Itertools Module in Python - Complete Guide"
description: "Learn about the very useful itertools library in python"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python

cover:
  image: "/images//itertools.png"
  alt: "itertools module in python"
  caption: "Data Analysis using Python"
  relative: true
  hidden: false
---


# Python's `itertools` - The Missing Manual
### A deep dive into one of Python's most underused standard library modules

---

## Wait, Why Should I Care About Another Module?

You've written Python for a while. You know how to use `for` loops, list comprehensions, `zip`, and `enumerate`. Things work. So when someone says "hey, you should learn `itertools`", it's easy to nod politely and move on.

Here's what changes your mind. Imagine you're asked to generate all possible batting orders for 4 players chosen from a squad of 11. Or you need to group a massive log file by date without loading it all into memory. Or you want to pair up every possible combination of feature columns for a machine learning experiment.

Without `itertools`, you end up writing nested loops, managing index variables, building intermediate lists, and generally fighting Python to do what should be simple. With `itertools`, each of those problems is one function call.

This guide is a complete reference for `itertools` — written not as a dry API listing, but as a walkthrough that builds your intuition for *when to reach for it* and *why it works the way it does*.

---

## What Exactly Is `itertools`?

`itertools` is a module in Python's standard library - no installation needed, just `import itertools`. It provides a collection of **fast, memory-efficient tools for working with iterators**.

The name is a compound of two words: *iter* (as in iterators) and *tools* (as in building blocks). That framing is intentional. The module's author, Raymond Hettinger, designed it specifically to give you composable primitives — small, focused functions that you can chain together into powerful pipelines.

Every function in `itertools` returns an **iterator**, not a list. This is the fundamental design choice that makes the whole module useful:

```python
import itertools

# This does NOT build a list of 1 trillion numbers in memory
counter = itertools.count(start=1)

# It creates a lazy iterator — values computed one at a time, on demand
print(next(counter))   # 1
print(next(counter))   # 2
print(next(counter))   # 3
# The other 999,999,999,997 values haven't been computed yet
```

If it returned a list, `itertools.count()` would be impossible to use. Because it returns an iterator, it's perfectly fine — you pull values out one at a time.

---

## The Problem It Solves

Let's be concrete. Here are three real situations where `itertools` replaces messy code.

### Problem 1: Combinations and Permutations

You want to test every possible pair of columns in a dataset with 10 columns. How many pairs is that? `10 * 9 / 2 = 45`. Writing nested loops is clunky and error-prone.

```python
# Without itertools — manual nested loop
columns = ['age', 'salary', 'score', 'tenure']
pairs = []
for i in range(len(columns)):
    for j in range(i + 1, len(columns)):
        pairs.append((columns[i], columns[j]))
print(pairs)

# With itertools — one line
import itertools
pairs = list(itertools.combinations(columns, 2))
print(pairs)
# [('age', 'salary'), ('age', 'score'), ('age', 'tenure'),
#  ('salary', 'score'), ('salary', 'tenure'), ('score', 'tenure')]
```

### Problem 2: Grouping Data

You have a list of transactions sorted by category and want to total each category. Without `itertools`, you write a dict-accumulation loop. With it, you use `groupby` and the intent is obvious.

```python
transactions = [
    ("food", 150), ("food", 200), ("travel", 800),
    ("travel", 1200), ("food", 75), ("utilities", 900),
]

# Without itertools
totals = {}
for category, amount in transactions:
    totals[category] = totals.get(category, 0) + amount

# With itertools.groupby (after sorting)
from itertools import groupby
from operator import itemgetter

sorted_txns = sorted(transactions, key=itemgetter(0))
for category, group in groupby(sorted_txns, key=itemgetter(0)):
    total = sum(amt for _, amt in group)
    print(f"{category}: Rs.{total}")
```

### Problem 3: Infinite Sequences

You need to cycle through a list of colours to assign alternating row colours in a report. You don't know the number of rows ahead of time.

```python
# Without itertools — manual index tracking
colours = ['white', 'lightgrey']
rows = get_report_rows()   # could be any length
for i, row in enumerate(rows):
    colour = colours[i % len(colours)]
    render_row(row, background=colour)

# With itertools — the intent is crystal clear
from itertools import cycle
colours = cycle(['white', 'lightgrey'])
for row, colour in zip(get_report_rows(), colours):
    render_row(row, background=colour)
```

In every case, `itertools` doesn't just shorten the code — it makes the *intent* clearer. The function name tells you exactly what's happening.

---

## How to Think About `itertools`

Before looking at individual functions, there's a mental model that unifies the whole module. The functions fall into three categories:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ITERTOOLS FUNCTION FAMILIES                      │
├──────────────────────────────┬──────────────────────────────────────┤
│  INFINITE ITERATORS          │  Generate values without end         │
│  count, cycle, repeat        │  Always pair with islice or zip      │
├──────────────────────────────┼──────────────────────────────────────┤
│  FINITE ITERATORS            │  Operate on finite input sequences   │
│  chain, islice, zip_longest, │  Transform, filter, or combine       │
│  starmap, takewhile,         │  existing iterables                  │
│  dropwhile, groupby,         │                                      │
│  compress, filterfalse,      │                                      │
│  accumulate, pairwise,       │                                      │
│  batched, product            │                                      │
├──────────────────────────────┼──────────────────────────────────────┤
│  COMBINATORIC ITERATORS      │  Generate structured combinations    │
│  combinations,               │  Essential for search, testing,      │
│  combinations_with_repl,     │  and mathematical problems           │
│  permutations, product       │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

One more thing to internalize: **itertools functions are lazy**. None of them do any work until you ask for the next value. This means you can chain ten `itertools` calls together and the total memory used is still proportional to one element at a time, not the full dataset.

---

## Things to Keep in Mind Before You Start

These are the rules that trip people up most often. Read them once before diving into examples.

**1. All itertools functions return iterators, not lists.**
To see the values, wrap in `list()` or `tuple()`, or iterate in a loop. Don't be surprised when `print(itertools.chain([1,2],[3,4]))` shows `<itertools.chain object at 0x...>`.

**2. Iterators are single-pass.**
Once exhausted, you can't rewind. If you need to iterate twice, either call the function again or convert to a list.

```python
from itertools import chain
it = chain([1, 2], [3, 4])
print(list(it))   # [1, 2, 3, 4]
print(list(it))   # []  ← already exhausted!
```

**3. `groupby` only groups consecutive elements.**
If your data isn't sorted, `groupby` will produce multiple groups for the same key. Always sort first if you want all items of the same key together.

```python
from itertools import groupby
data = [1, 1, 2, 1, 1]   # 1s are NOT consecutive everywhere
for key, group in groupby(data):
    print(key, list(group))
# 1 [1, 1]
# 2 [2]
# 1 [1, 1]   ← a SECOND group of 1s, not merged with the first!
```

**4. Always call `islice` to guard infinite iterators.**
`itertools.count()`, `itertools.cycle()`, and `itertools.repeat()` run forever. Passing them to `list()` will hang your program. Use `islice` to take only what you need.

**5. Combinatoric functions can produce astronomically large outputs.**
`permutations(range(20))` produces 2,432,902,008,176,640,000 tuples. Use `islice` or consume lazily.

**6. `chain` takes multiple iterables as arguments; `chain.from_iterable` takes one iterable of iterables.**

```python
from itertools import chain
# chain(*args) — pass iterables directly
list(chain([1,2], [3,4], [5,6]))         # [1, 2, 3, 4, 5, 6]

# chain.from_iterable — pass one iterable that contains iterables
nested = [[1,2], [3,4], [5,6]]
list(chain.from_iterable(nested))         # [1, 2, 3, 4, 5, 6]
```

---

## Part 1: Infinite Iterators

These three functions generate values indefinitely. They're the simplest functions in the module but among the most useful.

### `count(start=0, step=1)` — An Infinite Counter

`count` produces an infinite sequence of evenly-spaced numbers. Think of it as a programmable counter that never stops.

```python
from itertools import count, islice

# Basic counting
for n in islice(count(), 5):
    print(n, end=" ")   # 0 1 2 3 4

# Start and step
for n in islice(count(10, 5), 5):
    print(n, end=" ")   # 10 15 20 25 30

# Counting backwards
for n in islice(count(100, -10), 6):
    print(n, end=" ")   # 100 90 80 70 60 50

# Floating point steps
for n in islice(count(0.0, 0.5), 6):
    print(round(n, 1), end=" ")   # 0.0 0.5 1.0 1.5 2.0 2.5
```

**Real-world use case:** Assigning auto-incrementing IDs to records coming in from a stream, without knowing how many records there will be.

```python
from itertools import count

def assign_ids(records):
    """Attach a unique ID to each record in a stream."""
    id_counter = count(start=1001)
    for record in records:
        record["id"] = next(id_counter)
        yield record

players = [
    {"name": "Rohit Sharma"},
    {"name": "Virat Kohli"},
    {"name": "Jasprit Bumrah"},
]

for player in assign_ids(players):
    print(player)
# {'name': 'Rohit Sharma', 'id': 1001}
# {'name': 'Virat Kohli', 'id': 1002}
# {'name': 'Jasprit Bumrah', 'id': 1003}
```

---

### `cycle(iterable)` — Loop an Iterable Forever

`cycle` takes any iterable and loops through it indefinitely: A, B, C, A, B, C, A, B, ...

```python
from itertools import cycle, islice

colours = cycle(['red', 'green', 'blue'])
print(list(islice(colours, 8)))
# ['red', 'green', 'blue', 'red', 'green', 'blue', 'red', 'green']

# Assign round-robin teams
from itertools import cycle
teams = cycle(['Team A', 'Team B', 'Team C'])
players = ['Ravi', 'Priya', 'Arjun', 'Meera', 'Suresh', 'Kavya', 'Dev']

assignments = list(zip(players, teams))
for player, team in assignments:
    print(f"{player} → {team}")
# Ravi   → Team A
# Priya  → Team B
# Arjun  → Team C
# Meera  → Team A
# Suresh → Team B
# Kavya  → Team C
# Dev    → Team A
```

**Real-world use case:** Load balancing requests across multiple servers.

```python
from itertools import cycle

servers = cycle(['server-1', 'server-2', 'server-3'])

def route_request(request):
    server = next(servers)
    print(f"Routing {request!r} → {server}")

route_request("/api/users")    # → server-1
route_request("/api/orders")   # → server-2
route_request("/api/products") # → server-3
route_request("/api/users")    # → server-1 (cycles back)
```

---

### `repeat(object, times=None)` — Repeat a Value

`repeat` produces the same value over and over, either a fixed number of times or infinitely.

```python
from itertools import repeat

# Fixed repetition
print(list(repeat("hello", 4)))   # ['hello', 'hello', 'hello', 'hello']

# Often used with map to supply a constant second argument
doubles = list(map(pow, range(1, 6), repeat(2)))
print(doubles)   # [1, 4, 9, 16, 25]  — same as [x**2 for x in range(1,6)]

# Filling a default grid
grid = [list(repeat(0, 4)) for _ in repeat(None, 3)]
print(grid)
# [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
```

---

## Part 2: Finite Iterators

These are the workhorses of the module. They transform, filter, slice, and combine iterables.

### `chain(*iterables)` — Flatten Multiple Iterables Into One

`chain` takes multiple iterables and yields from each in sequence, as if they were one long iterable. It's the lazy version of concatenation.

```python
from itertools import chain

# Basic usage
combined = list(chain([1, 2, 3], [4, 5], [6, 7, 8, 9]))
print(combined)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Works with any iterables — lists, tuples, strings, generators
result = list(chain("IPL", [2024], ("T20", "Cricket")))
print(result)   # ['I', 'P', 'L', 2024, 'T20', 'Cricket']
```

**`chain.from_iterable`** — when you have a list of lists (dynamic nesting):

```python
from itertools import chain

# Flatten one level deep
nested = [[1, 2, 3], [4, 5], [6, 7, 8]]
flat = list(chain.from_iterable(nested))
print(flat)   # [1, 2, 3, 4, 5, 6, 7, 8]

# Real use: merging query results from multiple DB shards
def get_orders_from_shards(shards):
    return chain.from_iterable(shard.get_orders() for shard in shards)

# Real use: word tokenization across multiple sentences
sentences = ["The quick brown fox", "jumps over", "the lazy dog"]
words = list(chain.from_iterable(s.split() for s in sentences))
print(words)
# ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog']
```

---

### `islice(iterable, stop)` / `islice(iterable, start, stop, step)` — Lazy Slicing

`islice` is like Python's slice notation `[start:stop:step]` but for any iterator — including infinite ones. It does not support negative indices.

```python
from itertools import islice, count

# Take first N elements
first_five = list(islice(count(), 5))
print(first_five)   # [0, 1, 2, 3, 4]

# Skip first N, take next M
result = list(islice(count(0), 5, 10))
print(result)       # [5, 6, 7, 8, 9]

# With a step
result = list(islice(range(100), 0, 30, 5))
print(result)       # [0, 5, 10, 15, 20, 25]

# Paginate a large dataset — page 3, 10 items per page
def get_page(iterable, page_number, page_size=10):
    start = (page_number - 1) * page_size
    return list(islice(iterable, start, start + page_size))

data = range(1, 101)
print(get_page(data, page=3, page_size=10))   # [21, 22, ..., 30]
```

---

### `zip_longest(*iterables, fillvalue=None)` — Zip Without Truncating

Python's built-in `zip` stops at the shortest iterable. `zip_longest` continues until all iterables are exhausted, filling missing values with a default.

```python
from itertools import zip_longest

names  = ['Rohit', 'Virat', 'Dhoni']
scores = [89, 112]
overs  = [18.4, 20.0, 15.2, 19.1]

result = list(zip_longest(names, scores, overs, fillvalue='N/A'))
for row in result:
    print(row)
# ('Rohit', 89, 18.4)
# ('Virat', 112, 20.0)
# ('Dhoni', 'N/A', 15.2)
# ('N/A', 'N/A', 19.1)

# Merging two ordered streams — useful in merge sort logic
stream_a = [1, 3, 5, 7]
stream_b = [2, 4, 6]
pairs = list(zip_longest(stream_a, stream_b, fillvalue=0))
print(pairs)   # [(1, 2), (3, 4), (5, 6), (7, 0)]
```

---

### `accumulate(iterable, func=operator.add, *, initial=None)` — Running Totals

`accumulate` applies a function cumulatively — each output value is the result of applying the function to all elements seen so far. The default function is addition, giving running totals.

```python
from itertools import accumulate
import operator

# Running sum (default)
sales = [120, 340, 210, 450, 180, 300]
running_total = list(accumulate(sales))
print(running_total)   # [120, 460, 670, 1120, 1300, 1600]

# Running maximum — track best score seen so far
match_scores = [67, 82, 45, 95, 71, 88, 100, 55]
running_max  = list(accumulate(match_scores, func=max))
print(running_max)
# [67, 82, 82, 95, 95, 95, 100, 100]

# Running product
values = [1, 2, 3, 4, 5]
running_product = list(accumulate(values, func=operator.mul))
print(running_product)   # [1, 2, 6, 24, 120]

# With initial value (Python 3.8+)
running_with_start = list(accumulate([10, 20, 30], initial=100))
print(running_with_start)   # [100, 110, 130, 160]

# Real-world: cumulative rainfall over months
rainfall_mm = [45, 62, 28, 90, 115, 70, 33, 80, 55, 40, 20, 10]
months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
cumulative = list(accumulate(rainfall_mm))
for month, rain, total in zip(months, rainfall_mm, cumulative):
    print(f"{month}: {rain}mm  (cumulative: {total}mm)")
```

---

### `takewhile(predicate, iterable)` — Take While Condition Holds

`takewhile` yields elements as long as the predicate returns True. **It stops permanently at the first False** — it does not resume.

```python
from itertools import takewhile

numbers = [2, 4, 6, 8, 3, 10, 12]
evens_until_odd = list(takewhile(lambda x: x % 2 == 0, numbers))
print(evens_until_odd)   # [2, 4, 6, 8]  ← stops at 3, does NOT include 10 or 12

# Reading a log file until a certain timestamp is reached
log_lines = [
    "2024-01-01 INFO Server started",
    "2024-01-01 INFO Request received",
    "2024-01-02 WARNING Disk space low",
    "2024-01-03 ERROR Database timeout",
    "2024-01-03 INFO Retry succeeded",
]
jan_first_logs = list(takewhile(lambda line: line.startswith("2024-01-01"), log_lines))
print(jan_first_logs)
# ['2024-01-01 INFO Server started', '2024-01-01 INFO Request received']

# Streaming sensor data: read until temperature exceeds threshold
def safe_readings(sensor_stream, max_temp=80):
    return takewhile(lambda reading: reading['temp'] <= max_temp, sensor_stream)
```

---

### `dropwhile(predicate, iterable)` — Skip While Condition Holds

`dropwhile` is the mirror of `takewhile`. It skips elements while the predicate is True, then yields everything from the first False onward.

```python
from itertools import dropwhile

numbers = [2, 4, 6, 8, 3, 10, 12]
after_first_odd = list(dropwhile(lambda x: x % 2 == 0, numbers))
print(after_first_odd)   # [3, 10, 12]  ← skipped 2,4,6,8; yields from 3 onward

# Skip file header lines that start with '#'
config_lines = [
    "# Configuration file",
    "# Generated automatically",
    "host=localhost",
    "port=5432",
    "# This comment appears mid-file",
    "db=mydb",
]
non_comment_lines = list(dropwhile(lambda l: l.startswith('#'), config_lines))
print(non_comment_lines)
# ['host=localhost', 'port=5432', '# This comment appears mid-file', 'db=mydb']
# Note: the mid-file comment IS included because dropwhile only skips the leading ones
```

---

### `filterfalse(predicate, iterable)` — Keep What a Filter Would Reject

While `filter(func, iterable)` keeps elements where `func` returns True, `filterfalse` keeps elements where it returns False.

```python
from itertools import filterfalse

numbers = range(10)

# filter keeps evens, filterfalse keeps odds
evens = list(filter(lambda x: x % 2 == 0, numbers))
odds  = list(filterfalse(lambda x: x % 2 == 0, numbers))

print(evens)   # [0, 2, 4, 6, 8]
print(odds)    # [1, 3, 5, 7, 9]

# Partition a list into two groups simultaneously
def partition(predicate, iterable):
    """Split an iterable into (items where pred is True, items where False)."""
    from itertools import filterfalse, tee
    t1, t2 = tee(iterable)
    return filter(predicate, t1), filterfalse(predicate, t2)

students = [
    {"name": "Ravi",  "score": 78},
    {"name": "Priya", "score": 55},
    {"name": "Arjun", "score": 92},
    {"name": "Meera", "score": 43},
]

passing, failing = partition(lambda s: s["score"] >= 60, students)
print("Passed:", [s["name"] for s in passing])   # ['Ravi', 'Arjun']
print("Failed:", [s["name"] for s in failing])   # ['Priya', 'Meera']
```

---

### `compress(data, selectors)` — Boolean Masking

`compress` takes two iterables: data and boolean selectors. It yields only the data items where the corresponding selector is True (or truthy). Think of it as numpy boolean indexing, but for any iterator.

```python
from itertools import compress

data      = ['A', 'B', 'C', 'D', 'E', 'F']
selectors = [True, False, True, False, True, True]

selected = list(compress(data, selectors))
print(selected)   # ['A', 'C', 'E', 'F']

# Real use: select columns from a CSV row based on a flag list
columns   = ['name', 'age', 'salary', 'city', 'phone', 'email']
include   = [True,   True,  False,    True,   False,   True  ]

selected_cols = list(compress(columns, include))
print(selected_cols)   # ['name', 'age', 'city', 'email']

# Combine with a search result to mask items
products = ['Laptop', 'Phone', 'Tablet', 'Watch', 'Earbuds']
in_stock = [True,     False,   True,     True,    False    ]
available = list(compress(products, in_stock))
print(available)   # ['Laptop', 'Tablet', 'Watch']
```

---

### `groupby(iterable, key=None)` — Group Consecutive Elements

`groupby` scans through an iterable and groups consecutive elements that share the same key. It yields `(key, group_iterator)` pairs.

**Critical reminder:** Only consecutive equal keys are grouped. Always sort first if you want all matching items together.

```python
from itertools import groupby
from operator import itemgetter

# Simple grouping
data = [1, 1, 2, 2, 2, 3, 1, 1]
for key, group in groupby(data):
    print(key, list(group))
# 1 [1, 1]
# 2 [2, 2, 2]
# 3 [3]
# 1 [1, 1]   ← separate group because not consecutive with the first

# Real use: group sorted transactions by category
transactions = [
    ("food",      120),
    ("food",      340),
    ("travel",    800),
    ("travel",   1200),
    ("utilities", 450),
    ("food",       95),  # ← would be a separate group if not pre-sorted
]
sorted_txns = sorted(transactions, key=itemgetter(0))

print("\nCategory Summary:")
for category, group in groupby(sorted_txns, key=itemgetter(0)):
    amounts = [amt for _, amt in group]
    print(f"  {category}: {len(amounts)} transactions, total Rs.{sum(amounts)}")
# food:      3 transactions, total Rs.555
# travel:    2 transactions, total Rs.2000
# utilities: 1 transactions, total Rs.450
```

**Advanced groupby — group by computed property:**

```python
from itertools import groupby

ipl_players = [
    {"name": "Rohit Sharma",    "team": "MI"},
    {"name": "Hardik Pandya",   "team": "MI"},
    {"name": "Virat Kohli",     "team": "RCB"},
    {"name": "Glenn Maxwell",   "team": "RCB"},
    {"name": "MS Dhoni",        "team": "CSK"},
    {"name": "Ruturaj Gaikwad", "team": "CSK"},
]

sorted_players = sorted(ipl_players, key=lambda p: p["team"])
for team, members in groupby(sorted_players, key=lambda p: p["team"]):
    names = [p["name"] for p in members]
    print(f"{team}: {', '.join(names)}")
# CSK: MS Dhoni, Ruturaj Gaikwad
# MI:  Rohit Sharma, Hardik Pandya
# RCB: Virat Kohli, Glenn Maxwell
```

---

### `starmap(func, iterable)` — Map with Argument Unpacking

`starmap` is like `map`, but it unpacks each element of the iterable as arguments to the function. Useful when your iterable contains tuples of arguments.

```python
from itertools import starmap

# map requires separate iterables; starmap takes one iterable of tuples
coordinates = [(2, 3), (4, 5), (1, 8), (3, 3)]
distances = list(starmap(pow, [(2, 3), (3, 2), (10, 0.5)]))
print(distances)   # [8, 9, 3.1622...]   (2^3, 3^2, 10^0.5)

# Real use: apply functions to argument tuples
import operator
operations = [
    (operator.add, 10, 5),
    (operator.mul, 4,  7),
    (operator.sub, 20, 3),
]
results = [func(a, b) for func, a, b in operations]
print(results)   # [15, 28, 17]

# starmap with a named function
def compute_tax(price, rate_pct):
    return round(price * rate_pct / 100, 2)

products = [
    ("Laptop", 75000, 18),
    ("Book",    500,   5),
    ("Phone",  25000, 12),
]
taxes = list(starmap(compute_tax, [(p[1], p[2]) for p in products]))
for (name, price, rate), tax in zip(products, taxes):
    print(f"{name}: Rs.{price} + {rate}% tax = Rs.{price + tax}")
```

---

### `pairwise(iterable)` — Sliding Window of Size 2 (Python 3.10+)

`pairwise` yields consecutive overlapping pairs from an iterable. This is the most common sliding window pattern.

```python
from itertools import pairwise

data = [1, 2, 3, 4, 5]
print(list(pairwise(data)))   # [(1, 2), (2, 3), (3, 4), (4, 5)]

# Compute differences between consecutive values
prices = [100, 105, 98, 112, 107, 115]
changes = [curr - prev for prev, curr in pairwise(prices)]
print(changes)   # [5, -7, 14, -5, 8]

# Detect if sequence is sorted
def is_sorted(iterable):
    return all(a <= b for a, b in pairwise(iterable))

print(is_sorted([1, 2, 3, 4, 5]))   # True
print(is_sorted([1, 3, 2, 4, 5]))   # False

# Count direction changes in a stock price series
prices = [100, 105, 103, 108, 107, 112, 110, 115]
directions = ['up' if b > a else 'down' for a, b in pairwise(prices)]
print(directions)   # ['up', 'down', 'up', 'down', 'up', 'down', 'up']
```

**For Python < 3.10**, here is the equivalent:

```python
from itertools import tee

def pairwise(iterable):
    a, b = tee(iterable)
    next(b, None)   # advance b by one
    return zip(a, b)
```

---

### `batched(iterable, n)` — Split Into Fixed-Size Chunks (Python 3.12+)

`batched` yields tuples of exactly `n` elements, with the last batch being smaller if the iterable doesn't divide evenly.

```python
from itertools import batched

data = range(1, 12)
for batch in batched(data, 3):
    print(batch)
# (1, 2, 3)
# (4, 5, 6)
# (7, 8, 9)
# (10, 11)   ← last batch is smaller

# Real use: batch API calls to avoid rate limits
player_ids = list(range(1, 26))   # 25 player IDs
for batch in batched(player_ids, n=5):
    print(f"Fetching players: {batch}")
    # fetch_players(batch)   ← 5 at a time instead of 25 at once
```

**For Python < 3.12**, the manual equivalent:

```python
from itertools import islice

def batched(iterable, n):
    it = iter(iterable)
    while chunk := tuple(islice(it, n)):
        yield chunk
```

---

### `tee(iterable, n=2)` — Clone an Iterator

`tee` creates `n` independent copies of a single iterator. This lets you iterate over the same sequence multiple times from different starting points.

```python
from itertools import tee

it = iter([1, 2, 3, 4, 5])
a, b = tee(it)

print(list(a))   # [1, 2, 3, 4, 5]
print(list(b))   # [1, 2, 3, 4, 5]  ← independent copy

# IMPORTANT: After tee, don't use the original iterator
# Using `it` after tee() produces undefined behaviour

# Use case: compute multiple statistics in one pass
from itertools import tee

def describe(iterable):
    a, b, c = tee(iterable, 3)
    values = list(a)
    n      = len(values)
    total  = sum(b)
    mx     = max(c)
    return {"count": n, "sum": total, "max": mx, "mean": total / n}

print(describe([67, 82, 45, 95, 71, 88]))
# {'count': 6, 'sum': 448, 'max': 95, 'mean': 74.67}
```

> **Memory warning:** `tee` stores values internally so that both copies can access them independently. If one copy advances far ahead of the other, the stored values accumulate in memory. For large datasets, prefer materializing to a list.

---

## Part 3: Combinatoric Iterators

These are the functions that generate structured combinations of items. They're invaluable for testing, optimization, search, and mathematical work.

### `product(*iterables, repeat=1)` — Cartesian Product

`product` generates the Cartesian product of iterables — every possible combination of one element from each iterable. It's the equivalent of nested `for` loops.

```python
from itertools import product

# All combinations of colours and sizes
colours = ['red', 'blue', 'green']
sizes   = ['S', 'M', 'L']

for colour, size in product(colours, sizes):
    print(f"{colour}-{size}", end="  ")
# red-S  red-M  red-L  blue-S  blue-M  blue-L  green-S  green-M  green-L

# The `repeat` argument — same iterable crossed with itself
# All 2-digit combinations of 0 and 1 (binary numbers)
binary_pairs = list(product([0, 1], repeat=2))
print(binary_pairs)   # [(0, 0), (0, 1), (1, 0), (1, 1)]

# Generate all possible test inputs
def test_matrix(input_lists):
    return product(*input_lists)

params = [
    ['GET', 'POST'],       # HTTP method
    ['/api/v1', '/api/v2'],# endpoint version
    [True, False],         # authenticated
]
for method, version, auth in test_matrix(params):
    print(f"{method} {version} auth={auth}")
# GET /api/v1 auth=True
# GET /api/v1 auth=False
# GET /api/v2 auth=True
# ... (8 total combinations)
```

---

### `permutations(iterable, r=None)` — Ordered Arrangements

`permutations` yields all possible ordered arrangements of `r` items from the iterable. Order matters: (A, B) and (B, A) are different permutations.

```python
from itertools import permutations

players = ['Rohit', 'Virat', 'Dhoni']

# All arrangements of all 3 players
for perm in permutations(players):
    print(perm)
# ('Rohit', 'Virat', 'Dhoni')
# ('Rohit', 'Dhoni', 'Virat')
# ('Virat', 'Rohit', 'Dhoni')
# ('Virat', 'Dhoni', 'Rohit')
# ('Dhoni', 'Rohit', 'Virat')
# ('Dhoni', 'Virat', 'Rohit')

# r=2 — all possible batting pairs (order matters: opening vs #3)
batting_pairs = list(permutations(players, r=2))
print(batting_pairs)
# [('Rohit','Virat'), ('Rohit','Dhoni'), ('Virat','Rohit'),
#  ('Virat','Dhoni'), ('Dhoni','Rohit'), ('Dhoni','Virat')]

# Count: n! / (n-r)!
# permutations(10 players, r=3): 10 * 9 * 8 = 720 arrangements

print(f"Total arrangements: {len(list(permutations('ABCD', 2)))}")   # 12
```

**Real use case: checking all possible evaluation orders:**

```python
from itertools import permutations

steps = ['load_data', 'validate', 'transform', 'save']

# Find which ordering doesn't cause dependency errors
for order in permutations(steps):
    if is_valid_order(order):   # your dependency check
        print(f"Valid order: {order}")
        break
```

---

### `combinations(iterable, r)` — Unordered Selections (No Repeats)

`combinations` yields all possible selections of `r` items where order does NOT matter and each item can only be used once. (A, B) and (B, A) are the same combination — only `(A, B)` is produced.

```python
from itertools import combinations

squad = ['Rohit', 'Virat', 'Dhoni', 'Jadeja', 'Bumrah']

# Choose 3 from 5 — order doesn't matter
playing_11_selections = list(combinations(squad, 3))
for combo in playing_11_selections:
    print(combo)
# ('Rohit', 'Virat', 'Dhoni')
# ('Rohit', 'Virat', 'Jadeja')
# ('Rohit', 'Virat', 'Bumrah')
# ... (10 total)

print(f"Ways to choose 3 from 5: {len(playing_11_selections)}")   # 10

# Feature selection in ML — test every pair of features
features = ['age', 'salary', 'experience', 'score']
for f1, f2 in combinations(features, 2):
    print(f"Testing pair: ({f1}, {f2})")
# Testing pair: (age, salary)
# Testing pair: (age, experience)
# ... (6 pairs total)

# Find all triangle sides from a list of lengths
lengths = [3, 4, 5, 6, 7]
triangles = [
    combo for combo in combinations(lengths, 3)
    if combo[0] + combo[1] > combo[2]   # triangle inequality
]
print(f"Valid triangles: {triangles}")
```

---

### `combinations_with_replacement(iterable, r)` — Unordered Selections (With Repeats)

Like `combinations`, but each item can appear more than once in a selection.

```python
from itertools import combinations_with_replacement

# Toss a coin 3 times — how many distinct outcomes by count?
outcomes = list(combinations_with_replacement(['H', 'T'], 3))
print(outcomes)
# [('H', 'H', 'H'), ('H', 'H', 'T'), ('H', 'T', 'T'), ('T', 'T', 'T')]
# Only 4 distinct "types" of 3-toss outcome by composition (not sequence)

# Compare with combinations (no repeat) — shows the difference
from itertools import combinations
print(list(combinations(['H', 'T'], 3)))
# [('H', 'T')]  ← only one selection of 3 from 2 without repetition? Actually 0 exist for r > n

# Better example: choosing 2 from 3 with and without replacement
items = ['A', 'B', 'C']
print("Without replacement:", list(combinations(items, 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'C')]

print("With replacement:   ", list(combinations_with_replacement(items, 2)))
# [('A', 'A'), ('A', 'B'), ('A', 'C'), ('B', 'B'), ('B', 'C'), ('C', 'C')]

# Count: C(n+r-1, r) for with_replacement vs C(n, r) without
```

---

## Building Pipelines — Putting It All Together

The real power of `itertools` shows up when you chain multiple functions together into a data pipeline. Because every function returns an iterator, you can compose them with essentially zero memory overhead.

### Pipeline 1: Log File Analysis

Parse a large log file, filter for errors, extract fields, group by hour.

```python
from itertools import groupby, islice
import re

def parse_log_line(line):
    """Parse a log line into a dict."""
    pattern = r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)'
    match = re.match(pattern, line.strip())
    if match:
        return {"timestamp": match[1], "level": match[2], "message": match[3]}
    return None

def stream_logs(filepath):
    """Lazy generator over log lines."""
    with open(filepath) as f:
        for line in f:
            record = parse_log_line(line)
            if record:
                yield record

def only_errors(records):
    return filter(lambda r: r["level"] == "ERROR", records)

def get_hour(record):
    return record["timestamp"][:13]   # "2024-01-15 14"

def analyze_errors(filepath):
    records = stream_logs(filepath)
    errors  = only_errors(records)
    sorted_errors = sorted(errors, key=get_hour)   # groupby needs sorted input
    for hour, group in groupby(sorted_errors, key=get_hour):
        error_list = list(group)
        print(f"{hour}:xx — {len(error_list)} errors")
        for e in islice(error_list, 3):   # show first 3 per hour
            print(f"   {e['message']}")
```

### Pipeline 2: Cricket Stats Rolling Average

Compute a 5-match rolling batting average using `pairwise`-style windowing:

```python
from itertools import islice, accumulate
from collections import deque

def rolling_average(scores, window=5):
    """Yield the rolling average over the last `window` scores."""
    buf = deque(maxlen=window)
    for score in scores:
        buf.append(score)
        if len(buf) == window:
            yield round(sum(buf) / window, 2)

rohit_scores = [45, 67, 12, 89, 34, 76, 55, 43, 98, 21, 67, 82]
averages = list(rolling_average(rohit_scores, window=3))
print("3-match rolling avg:", averages)
# [41.33, 56.0, 45.0, 66.33, 55.0, 58.0, 65.33, 54.0, 62.0, 56.67]
```

### Pipeline 3: E-Commerce Product Report

```python
from itertools import chain, groupby, accumulate, islice
from operator import itemgetter

products = list(chain(
    [{"cat": "Electronics", "name": "Laptop",  "price": 75000, "sold": 12}],
    [{"cat": "Electronics", "name": "Phone",   "price": 25000, "sold": 45}],
    [{"cat": "Clothing",    "name": "T-Shirt", "price":  599,  "sold": 200}],
    [{"cat": "Clothing",    "name": "Jeans",   "price": 1299,  "sold": 89}],
    [{"cat": "Books",       "name": "Python",  "price":  499,  "sold": 150}],
))

# Sort by category, then by revenue within category
sorted_products = sorted(products, key=lambda p: (p["cat"], -p["price"] * p["sold"]))

# Group by category and summarize
for category, group in groupby(sorted_products, key=itemgetter("cat")):
    items = list(group)
    revenues = [p["price"] * p["sold"] for p in items]
    total = sum(revenues)
    print(f"\n{category}:")
    for item, rev in zip(items, revenues):
        print(f"  {item['name']:<12} Rs.{rev:>10,}")
    print(f"  {'TOTAL':<12} Rs.{total:>10,}")
```

---

## Practice Problems

Work through these problems before looking at the solutions. Each one targets a specific part of the module.

---

### Problem 1 — Running Maximum

**Task:** Given a list of daily temperatures, use `accumulate` to compute the running maximum temperature seen so far for each day.

```
Input:  [22, 28, 25, 31, 29, 35, 30, 33]
Output: [22, 28, 28, 31, 31, 35, 35, 35]
```

**Solution:**

```python
from itertools import accumulate

temps = [22, 28, 25, 31, 29, 35, 30, 33]
running_max = list(accumulate(temps, func=max))
print(running_max)
# [22, 28, 28, 31, 31, 35, 35, 35]
```

---

### Problem 2 — Round-Robin Tournament Fixtures

**Task:** Given a list of 4 cricket teams, generate all possible match fixtures using `combinations`. Each pair plays exactly once.

```
Teams: ['MI', 'CSK', 'RCB', 'KKR']
Output: ('MI', 'CSK'), ('MI', 'RCB'), ('MI', 'KKR'), ('CSK', 'RCB'), ...
```

**Solution:**

```python
from itertools import combinations

teams = ['MI', 'CSK', 'RCB', 'KKR']
fixtures = list(combinations(teams, 2))

print(f"Total fixtures: {len(fixtures)}")   # 6

for match_num, (team_a, team_b) in enumerate(fixtures, start=1):
    print(f"Match {match_num}: {team_a} vs {team_b}")
# Match 1: MI vs CSK
# Match 2: MI vs RCB
# Match 3: MI vs KKR
# Match 4: CSK vs RCB
# Match 5: CSK vs KKR
# Match 6: RCB vs KKR
```

---

### Problem 3 — Flatten a Nested List

**Task:** Flatten a list of lists (one level deep) using `chain.from_iterable`.

```
Input:  [[1, 2, 3], [4, 5], [], [6, 7, 8, 9]]
Output: [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

**Solution:**

```python
from itertools import chain

nested = [[1, 2, 3], [4, 5], [], [6, 7, 8, 9]]
flat   = list(chain.from_iterable(nested))
print(flat)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Bonus: verify empty sublists are handled gracefully (they are)
```

---

### Problem 4 — Paginate a Large Dataset

**Task:** Write a function `paginate(data, page_size)` using `islice` that returns a generator. Each call to `next()` on the generator should yield one page of data as a list.

**Solution:**

```python
from itertools import islice

def paginate(data, page_size):
    it = iter(data)
    while True:
        page = list(islice(it, page_size))
        if not page:
            break
        yield page

data = list(range(1, 23))   # 22 items
pages = list(paginate(data, page_size=5))
for i, page in enumerate(pages, 1):
    print(f"Page {i}: {page}")
# Page 1: [1, 2, 3, 4, 5]
# Page 2: [6, 7, 8, 9, 10]
# Page 3: [11, 12, 13, 14, 15]
# Page 4: [16, 17, 18, 19, 20]
# Page 5: [21, 22]
```

---

### Problem 5 — Find First Duplicate in a Stream

**Task:** Using `pairwise` (or `tee`), find the first value that appears consecutively in a list.

```
Input:  [1, 2, 3, 3, 4, 5, 5, 6]
Output: 3  (first value that equals the next value)
```

**Solution:**

```python
from itertools import pairwise   # Python 3.10+

def first_consecutive_duplicate(seq):
    for a, b in pairwise(seq):
        if a == b:
            return a
    return None

data = [1, 2, 3, 3, 4, 5, 5, 6]
print(first_consecutive_duplicate(data))   # 3

# Python < 3.10 version using tee:
from itertools import tee

def first_consecutive_duplicate_v2(seq):
    a, b = tee(seq)
    next(b, None)
    for x, y in zip(a, b):
        if x == y:
            return x
    return None
```

---

### Problem 6 — Group and Summarize Orders

**Task:** Given a list of order records (already sorted by status), use `groupby` to count and total the orders in each status group.

```python
orders = [
    {"id": 1, "status": "delivered", "amount": 1200},
    {"id": 2, "status": "delivered", "amount":  850},
    {"id": 3, "status": "delivered", "amount": 2100},
    {"id": 4, "status": "pending",   "amount":  500},
    {"id": 5, "status": "pending",   "amount":  750},
    {"id": 6, "status": "returned",  "amount": 1500},
]
```

**Solution:**

```python
from itertools import groupby
from operator import itemgetter

for status, group in groupby(orders, key=itemgetter("status")):
    order_list = list(group)
    count      = len(order_list)
    total      = sum(o["amount"] for o in order_list)
    print(f"{status:12}: {count} orders, Rs.{total:,} total")
# delivered   : 3 orders, Rs.4,150 total
# pending     : 2 orders, Rs.1,250 total
# returned    : 1 orders, Rs.1,500 total
```

---

### Problem 7 — Generate a Test Matrix

**Task:** You are testing a login function. Using `product`, generate all combinations of these test parameters and count them.

```python
usernames   = ["valid_user", ""]              # 2 values
passwords   = ["correct_pw", "wrong_pw", ""]  # 3 values
remember_me = [True, False]                    # 2 values
# Expected: 2 * 3 * 2 = 12 test cases
```

**Solution:**

```python
from itertools import product

usernames   = ["valid_user", ""]
passwords   = ["correct_pw", "wrong_pw", ""]
remember_me = [True, False]

test_cases = list(product(usernames, passwords, remember_me))
print(f"Total test cases: {len(test_cases)}")   # 12

for i, (user, pw, rem) in enumerate(test_cases, 1):
    user_repr = repr(user) if not user else user
    pw_repr   = repr(pw)   if not pw   else "***"
    print(f"  TC{i:02d}: user={user_repr:<15} pw={pw_repr:<12} remember={rem}")
```

---

### Problem 8 — Consecutive Price Changes

**Task:** Given a list of daily stock closing prices, use `pairwise` to compute the percentage change between each consecutive pair. Then use `takewhile` to find how many consecutive days a stock was rising from the start.

```python
prices = [100, 105, 108, 107, 112, 115, 110, 118]
```

**Solution:**

```python
from itertools import pairwise, takewhile

prices = [100, 105, 108, 107, 112, 115, 110, 118]

# Percentage changes
changes = [round((b - a) / a * 100, 2) for a, b in pairwise(prices)]
print("Daily % changes:", changes)
# [5.0, 2.86, -0.93, 4.67, 2.68, -4.35, 7.27]

# Days rising from start (takewhile positive change)
rising_days = list(takewhile(lambda x: x > 0, changes))
print(f"Consecutive rising days from start: {len(rising_days)}")  # 2
print(f"Changes during rise: {rising_days}")                       # [5.0, 2.86]
```

---

### Problem 9 — Interleave Two Lists

**Task:** Without `zip`, use `chain` and `zip_longest` together to interleave two lists element by element, even if they have different lengths.

```
Input:  [1, 2, 3, 4], ['a', 'b', 'c']
Output: [1, 'a', 2, 'b', 3, 'c', 4]
```

**Solution:**

```python
from itertools import chain, zip_longest

def interleave(a, b, fillvalue=None):
    """
    Interleave two iterables.
    Extra elements from the longer one appear at the end.
    """
    zipped = zip_longest(a, b, fillvalue=fillvalue)
    return [x for pair in zipped for x in pair if x is not fillvalue]

print(interleave([1, 2, 3, 4], ['a', 'b', 'c']))
# [1, 'a', 2, 'b', 3, 'c', 4]

# Alternative: chain after zip
def interleave_v2(a, b):
    pairs = zip_longest(a, b)
    return list(chain.from_iterable(
        (x for x in pair if x is not None) for pair in pairs
    ))

print(interleave_v2([1, 2, 3, 4], ['a', 'b', 'c']))
# [1, 'a', 2, 'b', 3, 'c', 4]
```

---

## Summary — When to Use What

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        ITERTOOLS DECISION GUIDE                         │
├────────────────────────────┬─────────────────────────────────────────────┤
│ I want to...               │ Use...                                      │
├────────────────────────────┼─────────────────────────────────────────────┤
│ Count from N forever       │ count(start, step)                          │
│ Loop a list forever        │ cycle(iterable)                             │
│ Repeat a value N times     │ repeat(value, times)                        │
├────────────────────────────┼─────────────────────────────────────────────┤
│ Flatten nested iterables   │ chain.from_iterable(nested)                 │
│ Concatenate iterables      │ chain(a, b, c)                              │
│ Slice an iterator lazily   │ islice(it, start, stop, step)               │
│ Zip unequal iterables      │ zip_longest(a, b, fillvalue=x)              │
├────────────────────────────┼─────────────────────────────────────────────┤
│ Running totals/max/etc     │ accumulate(data, func=max)                  │
│ Take while condition holds │ takewhile(pred, it)                         │
│ Skip while condition holds │ dropwhile(pred, it)                         │
│ Keep falsy items           │ filterfalse(pred, it)                       │
│ Boolean masking            │ compress(data, selectors)                   │
│ Group by key               │ groupby(sorted_data, key=fn)                │
│ Apply func to arg tuples   │ starmap(func, arg_tuples)                   │
│ Sliding pairs              │ pairwise(iterable)                          │
│ Split into chunks          │ batched(it, n)                              │
│ Clone an iterator          │ tee(it, n)                                  │
├────────────────────────────┼─────────────────────────────────────────────┤
│ All ordered arrangements   │ permutations(it, r)                         │
│ All unordered selections   │ combinations(it, r)                         │
│ Selections with repeats    │ combinations_with_replacement(it, r)        │
│ Cartesian product          │ product(a, b, repeat=n)                     │
└────────────────────────────┴─────────────────────────────────────────────┘

GOLDEN RULES
────────────
  1. Always sort before groupby
  2. Always guard infinite iterators with islice
  3. Never reuse an exhausted iterator
  4. Don't use the original iterator after tee()
  5. Wrap in list() only when you need random access or multiple passes
  6. Prefer generator pipelines for large/streaming data
```

---

*End of Guide — Python's `itertools`*
*Codeverra — codeverra.com*
