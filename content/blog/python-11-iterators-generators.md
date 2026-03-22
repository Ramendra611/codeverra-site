---
title: "Iterators and Generators in Python - Complete Guide"
description: "Learn about iterables and iterators and generators in python"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
 - python

cover:
 image: "/images//iterators and generators in python.png"
 alt: "iterators and generators in python"
 caption: "Data Analysis using Python"
 relative: true
 hidden: false
---


# Python Iterables, Iterators & Generators
### A Complete Lesson Plan & Reference Guide

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Iterables](#iterables)
3. [Iterators](#iterators)
4. [The Iterator Protocol](#the-iterator-protocol)
5. [Building Custom Iterators](#building-custom-iterators)
6. [Generators](#generators)
7. [Generator Expressions](#generator-expressions)
8. [Advanced Generator Features](#advanced-generator-features)
9. [Common Pitfalls & Things to Keep in Mind](#common-pitfalls - things-to-keep-in-mind)
10. [Real-Life Applications](#real-life-applications)
11. [Practice Questions & Answers](#practice-questions - answers)
12. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## The Big Picture

Before diving in, here's the conceptual map you need to hold in your head:

```
┌──────────────────────────────────────────────────┐
│ ITERABLE │
│ Any object you can loop over with a for loop │
│ Examples: list, tuple, str, dict, set, file │
│ │
│ Has __iter__() → returns an Iterator │
└──────────────────────┬───────────────────────────┘
 │ __iter__() called
 ▼
┌──────────────────────────────────────────────────┐
│ ITERATOR │
│ An object that knows where it is in a sequence │
│ and can produce the next value on demand │
│ │
│ Has __iter__() → returns self │
│ Has __next__() → returns next value or raises │
│ StopIteration │
└──────────────────────┬───────────────────────────┘
 │ special case of
 ▼
┌──────────────────────────────────────────────────┐
│ GENERATOR │
│ A convenient way to create iterators using │
│ the `yield` keyword - Python auto-builds the │
│ iterator protocol for you │
└──────────────────────────────────────────────────┘
```

> **Key Insight:** Every iterator is an iterable, but not every iterable is an iterator.
> A list is an iterable but NOT an iterator. `iter(list)` gives you an iterator.

---

## Iterables

### What is an Iterable?

An **iterable** is any Python object that can return an **iterator** when `iter()` is called on it. In practical terms: if you can use it in a `for` loop, it's an iterable.

```python
# All of these are iterables
my_list = [1, 2, 3]
my_tuple = (4, 5, 6)
my_string = "hello"
my_dict = {"a": 1, "b": 2}
my_set = {10, 20, 30}
my_range = range(5)

for item in my_list: print(item) # works
for char in my_string: print(char) # works
for key in my_dict: print(key) # works
```

### How Does Python Know Something is Iterable?

Python looks for the `__iter__` dunder method. If an object has it, Python calls it to get an iterator.

```python
# Checking for iterability
print(hasattr([1, 2, 3], '__iter__')) # True
print(hasattr(42, '__iter__')) # False
print(hasattr("hello", '__iter__')) # True

# Using isinstance with collections.abc
from collections.abc import Iterable

print(isinstance([1, 2, 3], Iterable)) # True
print(isinstance(42, Iterable)) # False
```

### What Happens Under the Hood of a `for` Loop?

```python
numbers = [10, 20, 30]

for num in numbers:
 print(num)

# Python internally does EXACTLY this:
_iterator = iter(numbers) # calls numbers.__iter__()
while True:
 try:
 num = next(_iterator) # calls _iterator.__next__()
 print(num)
 except StopIteration: # iterator is exhausted
 break
```

This is the magic behind every `for` loop in Python.

---

## Iterators

### What is an Iterator?

An **iterator** is an object that:
1. Has a `__iter__()` method that returns `self`
2. Has a `__next__()` method that returns the next value, or raises `StopIteration` when done

```python
my_list = [1, 2, 3]

# Get an iterator from the list
it = iter(my_list)
print(type(it)) # <class 'list_iterator'>

# Call next() manually
print(next(it)) # 1
print(next(it)) # 2
print(next(it)) # 3

# One more call raises StopIteration
next(it) # StopIteration ← the iterator is exhausted
```

### Iterators are Stateful and One-Way

Unlike a list, an iterator **remembers its position**. It can only move forward, never backward.

```python
my_list = [1, 2, 3]
it = iter(my_list)

print(next(it)) # 1
print(next(it)) # 2

# You cannot go back to 1
# You cannot reset (unless you call iter() again on the original list)

# The iterator and the list are SEPARATE objects:
print(id(my_list) == id(it)) # False - different objects
```

### Key Difference: Iterable vs Iterator

```python
my_list = [1, 2, 3]
it = iter(my_list)

# A list is NOT an iterator - it has no __next__
print(hasattr(my_list, '__next__')) # False
print(hasattr(it, '__next__')) # True

# An iterator IS an iterable - iter(it) returns itself
print(iter(it) is it) # True
print(iter(my_list) is my_list) # False - a new iterator is created
```

---

## The Iterator Protocol

The **iterator protocol** is the contract every iterator must follow:

| Method | Purpose | Must Do |
|--------|---------|---------|
| `__iter__()` | Make the object usable in a `for` loop | Return `self` |
| `__next__()` | Get the next value | Return next item OR raise `StopIteration` |

```python
# Verifying any object follows the protocol
from collections.abc import Iterator

print(isinstance(iter([1, 2, 3]), Iterator)) # True
print(isinstance([1, 2, 3], Iterator)) # False
print(isinstance(iter("hello"), Iterator)) # True
```

---

## Building Custom Iterators

### Example 1 - A Simple Counter

```python
class Counter:
 """An iterator that counts from `start` up to (but not including) `stop`."""

 def __init__(self, start, stop):
 self.current = start
 self.stop = stop

 def __iter__(self):
 """Return self - this object IS the iterator."""
 return self

 def __next__(self):
 """Return the next value, or raise StopIteration."""
 if self.current >= self.stop:
 raise StopIteration
 value = self.current
 self.current += 1
 return value


counter = Counter(1, 5)

for num in counter:
 print(num)
# Output: 1 2 3 4

# Because Counter is an iterator, it's also an iterable:
print(list(Counter(10, 14))) # [10, 11, 12, 13]
```

### Example 2 - Infinite Iterator (Fibonacci)

Iterators don't have to end! This is one of their most powerful features.

```python
class FibonacciIterator:
 """Generates Fibonacci numbers indefinitely."""

 def __init__(self):
 self.a = 0
 self.b = 1

 def __iter__(self):
 return self

 def __next__(self):
 value = self.a
 self.a, self.b = self.b, self.a + self.b
 return value


fib = FibonacciIterator()

# Take the first 10 Fibonacci numbers safely
import itertools
first_10 = list(itertools.islice(fib, 10))
print(first_10)
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Example 3 - Separating Iterable from Iterator

The best practice for containers (like lists) is to keep the **iterable** (the data holder) separate from the **iterator** (the traversal state):

```python
class NumberRange:
 """An iterable that creates a fresh iterator each time."""

 def __init__(self, start, stop):
 self.start = start
 self.stop = stop

 def __iter__(self):
 # Return a NEW iterator object each time
 return NumberRangeIterator(self.start, self.stop)


class NumberRangeIterator:
 """The actual iterator - holds traversal state."""

 def __init__(self, start, stop):
 self.current = start
 self.stop = stop

 def __iter__(self):
 return self

 def __next__(self):
 if self.current >= self.stop:
 raise StopIteration
 value = self.current
 self.current += 1
 return value


r = NumberRange(1, 4)

# Because __iter__ returns a NEW iterator, you can loop multiple times!
print(list(r)) # [1, 2, 3]
print(list(r)) # [1, 2, 3] ← still works!

# Compare with an iterator (single-use):
it = iter(r)
print(list(it)) # [1, 2, 3]
print(list(it)) # [] ← exhausted!
```

---

## Generators

### What is a Generator?

A **generator** is a special kind of function that uses the `yield` keyword to produce values one at a time, **pausing execution** between each yield. Python automatically creates an iterator object for you - you get all the benefits of writing an iterator without the boilerplate.

```python
def simple_generator():
 print("Step 1")
 yield 10
 print("Step 2")
 yield 20
 print("Step 3")
 yield 30
 print("Done!")

gen = simple_generator()
print(type(gen)) # <class 'generator'>

print(next(gen)) # prints "Step 1", then returns 10
print(next(gen)) # prints "Step 2", then returns 20
print(next(gen)) # prints "Step 3", then returns 30
next(gen) # prints "Done!", then raises StopIteration
```

> **The magic of `yield`:** When `yield` is hit, the function's entire state (local variables, position in code) is **frozen**. On the next `next()` call, execution resumes from exactly where it left off.

### Generator vs Regular Function

```python
# Regular function - computes everything, returns all at once
def get_squares_list(n):
 result = []
 for i in range(n):
 result.append(i * i)
 return result # Returns a list of ALL values

# Generator function - produces one value at a time, on demand
def get_squares_gen(n):
 for i in range(n):
 yield i * i # Yields one value, then pauses

# Both can be iterated:
for val in get_squares_list(5): print(val) # works
for val in get_squares_gen(5): print(val) # works

# But memory usage is very different:
import sys

big_list = get_squares_list(1_000_000)
big_gen = get_squares_gen(1_000_000)

print(sys.getsizeof(big_list)) # ~8,000,056 bytes (~8 MB)
print(sys.getsizeof(big_gen)) # ~104 bytes ← negligible!
```

### Rewriting the Custom Iterator as a Generator

Compare the verbosity:

```python
# ----- Iterator approach: ~15 lines -----
class CounterIterator:
 def __init__(self, start, stop):
 self.current = start
 self.stop = stop

 def __iter__(self):
 return self

 def __next__(self):
 if self.current >= self.stop:
 raise StopIteration
 value = self.current
 self.current += 1
 return value

# ----- Generator approach: 3 lines -----
def counter_gen(start, stop):
 while start < stop:
 yield start
 start += 1

# Both do the same thing:
print(list(CounterIterator(1, 5))) # [1, 2, 3, 4]
print(list(counter_gen(1, 5))) # [1, 2, 3, 4]
```

### `yield from` - Delegating to Sub-Generators

`yield from` lets a generator delegate to another iterable or generator:

```python
def inner():
 yield 1
 yield 2
 yield 3

def outer():
 yield 0
 yield from inner() # delegates to inner()
 yield 4

print(list(outer())) # [0, 1, 2, 3, 4]

# Useful for flattening nested structures
def flatten(nested):
 for item in nested:
 if isinstance(item, list):
 yield from flatten(item) # recursive delegation
 else:
 yield item

data = [1, [2, [3, 4], 5], [6, 7]]
print(list(flatten(data))) # [1, 2, 3, 4, 5, 6, 7]
```

---

## Generator Expressions

Just like list comprehensions, Python has **generator expressions** - a compact syntax for simple generators.

```python
# List comprehension - creates the full list in memory
squares_list = [x**2 for x in range(10)]

# Generator expression - lazy, no memory allocated upfront
squares_gen = (x**2 for x in range(10))

print(type(squares_list)) # <class 'list'>
print(type(squares_gen)) # <class 'generator'>

# They produce the same values:
print(list(squares_gen)) # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Generator expressions are great inside function calls:
total = sum(x**2 for x in range(1000)) # No extra list created
first_even = next(x for x in range(100) if x % 2 == 0) # 0

# Chaining with conditions
big_even_squares = (x**2 for x in range(100) if x % 2 == 0 if x**2 > 100)
print(list(big_even_squares)) # [144, 196, 256, ..., 9604]
```

---

## Advanced Generator Features

### `send()` - Two-Way Communication

Generators can **receive values** back from the caller using `send()`. This transforms them from simple producers into coroutines.

```python
def accumulator():
 """Receives numbers and yields the running total."""
 total = 0
 while True:
 value = yield total # yield sends total OUT, receives value IN
 if value is None:
 break
 total += value

gen = accumulator()
next(gen) # Must call next() once to start the generator (advances to first yield)

print(gen.send(10)) # 10
print(gen.send(20)) # 30
print(gen.send(5)) # 35
```

### `throw()` - Injecting Exceptions

```python
def safe_generator():
 try:
 while True:
 yield "running"
 except ValueError as e:
 yield f"caught error: {e}"
 yield "recovered"

gen = safe_generator()
print(next(gen)) # 'running'
print(gen.throw(ValueError, "oops!")) # 'caught error: oops!'
print(next(gen)) # 'recovered'
```

### `close()` - Shutting Down a Generator

```python
def countdown():
 n = 10
 while n > 0:
 try:
 yield n
 n -= 1
 except GeneratorExit:
 print("Generator shutting down cleanly.")
 return # MUST return or re-raise GeneratorExit

gen = countdown()
print(next(gen)) # 10
print(next(gen)) # 9
gen.close() # "Generator shutting down cleanly."
```

### Generator `return` Value

A generator can `return` a value. It's captured via `StopIteration`:

```python
def gen_with_return():
 yield 1
 yield 2
 return "finished" # This becomes StopIteration.value

gen = gen_with_return()
print(next(gen)) # 1
print(next(gen)) # 2
try:
 next(gen)
except StopIteration as e:
 print(e.value) # "finished"

# Or, using yield from:
def wrapper():
 result = yield from gen_with_return()
 print(f"Sub-generator returned: {result}")
```

---

## Common Pitfalls & Things to Keep in Mind

### ⚠️ 1. Iterators are Single-Use

```python
nums = [1, 2, 3]
it = iter(nums)

print(list(it)) # [1, 2, 3]
print(list(it)) # [] ← exhausted! No error, just empty.

# Fix: Call iter() again, or use the original iterable
print(list(iter(nums))) # [1, 2, 3] ✓
```

### ⚠️ 2. Generators are Single-Use Too

```python
def gen():
 yield 1
 yield 2

g = gen()
print(list(g)) # [1, 2]
print(list(g)) # [] ← exhausted!

# Fix: Call the generator function again to get a fresh generator
g = gen()
print(list(g)) # [1, 2] ✓
```

### ⚠️ 3. Don't Mix `next()` and `for` on the Same Iterator

```python
it = iter([1, 2, 3, 4, 5])

print(next(it)) # 1 ← consumed manually
print(next(it)) # 2 ← consumed manually

for val in it: # continues from 3, not 1!
 print(val) # 3, 4, 5
```

### ⚠️ 4. The Generator Must Be Started with `next()` Before `send()`

```python
def my_gen():
 val = yield

gen = my_gen()
# gen.send(10) ← TypeError! Can't send non-None to just-started generator
next(gen) # Advance to first yield first
gen.send(10) # Now this works
```

### ⚠️ 5. `return` Inside a Generator Raises `StopIteration`, Not Returns a Value

```python
def gen():
 yield 1
 return # This raises StopIteration, NOT a normal return!
 yield 2 # Unreachable

g = gen()
print(next(g)) # 1
next(g) # StopIteration - the return triggered it
```

### ⚠️ 6. Lazy Evaluation Can Surprise You

Generator expressions capture variables by reference, not by value:

```python
# BUG: All generators share the same variable `i`
funcs = [lambda: i for i in range(3)] # list comprehension
gens = [(lambda: i)() for i in range(3)] # captured correctly in list comp

# With generators, be careful with closures:
multipliers = [lambda x, n=n: x * n for n in range(5)]
print(multipliers[3](10)) # 30 - n=3 captured correctly with default arg
```

### ⚠️ 7. Infinite Generators Need a Break Condition

```python
def infinite_counter():
 n = 0
 while True:
 yield n
 n += 1

# NEVER do this - it will run forever:
# for x in infinite_counter(): print(x)

# Always pair infinite generators with a limit:
import itertools

for x in itertools.islice(infinite_counter(), 10):
 print(x) # 0 through 9, then stops
```

### ⚠️ 8. Exception Handling Inside Generators

```python
def safe_divide_gen(numbers, divisor):
 for n in numbers:
 try:
 yield n / divisor
 except ZeroDivisionError:
 yield float('inf') # yield a sentinel instead of crashing

results = list(safe_divide_gen([10, 20, 0, 30], 0))
print(results) # [inf, inf, inf, inf]
```

---

## Real-Life Applications

### Application 1 - Reading Large Files Line by Line

When processing log files or CSVs that are gigabytes large, loading the entire file into memory is not feasible.

```python
def read_large_file(filepath):
 """Memory-efficient file reader using a generator."""
 with open(filepath, 'r', encoding='utf-8') as f:
 for line in f:
 yield line.rstrip('\n')


def count_error_lines(filepath):
 """Count lines containing 'ERROR' without loading the whole file."""
 return sum(1 for line in read_large_file(filepath) if 'ERROR' in line)


# Pipeline: read → filter → process
def parse_csv_generator(filepath):
 reader = read_large_file(filepath)
 headers = next(reader).split(',')
 for line in reader:
 values = line.split(',')
 yield dict(zip(headers, values))


# Usage
# for row in parse_csv_generator('huge_data.csv'):
# process(row) # only ONE row in memory at a time
```

### Application 2 - Database Query Streaming

```python
import sqlite3

def stream_query_results(db_path, query, params=()):
 """
 Execute a SQL query and yield rows one at a time.
 Great for large result sets that don't fit in RAM.
 """
 conn = sqlite3.connect(db_path)
 cursor = conn.cursor()
 cursor.execute(query, params)
 try:
 for row in cursor:
 yield row
 finally:
 cursor.close()
 conn.close()


# Usage - stream 1 million rows without loading them all into memory
# for player_row in stream_query_results('cricket.db', 'SELECT * FROM matches'):
# analyze(player_row)
```

### Application 3 - Infinite Data Pipelines

```python
import time

def sensor_data_stream():
 """Simulates an IoT sensor producing readings indefinitely."""
 import random
 while True:
 yield {
 "timestamp": time.time(),
 "temperature": 20 + random.uniform(-2, 2),
 "humidity": 60 + random.uniform(-5, 5),
 }

def filter_anomalies(stream, threshold=22.0):
 """Filter only anomalous readings from a stream."""
 for reading in stream:
 if reading["temperature"] > threshold:
 yield reading

def enrich_readings(stream):
 """Add a human-readable timestamp to each reading."""
 for reading in stream:
 reading["time_str"] = time.strftime('%H:%M:%S',
 time.localtime(reading["timestamp"]))
 yield reading

# Build a pipeline by chaining generators
raw_stream = sensor_data_stream()
anomaly_stream = filter_anomalies(raw_stream, threshold=21.5)
enriched = enrich_readings(anomaly_stream)

# Read from the pipeline - processing is LAZY, only happens when pulled
import itertools
for reading in itertools.islice(enriched, 3):
 print(reading)
```

### Application 4 - Pagination / API Scrolling

```python
import time

def paginate_api(fetch_page_func, start_page=1):
 """
 Generic generator for paginated APIs.
 `fetch_page_func(page_num)` should return (data_list, has_more_bool).
 """
 page = start_page
 while True:
 data, has_more = fetch_page_func(page)
 yield from data # yield each item in the page
 if not has_more:
 break
 page += 1
 time.sleep(0.1) # polite rate limiting


# Simulated API
def fake_api(page):
 all_data = list(range(1, 26)) # 25 items total
 page_size = 5
 start = (page - 1) * page_size
 end = start + page_size
 chunk = all_data[start:end]
 has_more = end < len(all_data)
 return chunk, has_more


# Usage
for item in paginate_api(fake_api):
 print(item, end=" ")
# 1 2 3 4 5 6 7 8 9 10 ... 25
```

### Application 5 - Tree/Graph Traversal

```python
class TreeNode:
 def __init__(self, val, left=None, right=None):
 self.val = val
 self.left = left
 self.right = right

def inorder_traversal(node):
 """In-order traversal of a BST as a generator."""
 if node is None:
 return
 yield from inorder_traversal(node.left)
 yield node.val
 yield from inorder_traversal(node.right)

def bfs_traversal(root):
 """Breadth-first traversal using a generator."""
 from collections import deque
 queue = deque([root])
 while queue:
 node = queue.popleft()
 if node:
 yield node.val
 queue.append(node.left)
 queue.append(node.right)

# Build a small tree:
# 4
# / \
# 2 6
# / \ / \
# 1 3 5 7

root = TreeNode(4,
 TreeNode(2, TreeNode(1), TreeNode(3)),
 TreeNode(6, TreeNode(5), TreeNode(7))
)

print(list(inorder_traversal(root))) # [1, 2, 3, 4, 5, 6, 7]
print(list(bfs_traversal(root))) # [4, 2, 6, 1, 3, 5, 7]
```

### Application 6 - Data Transformation Pipelines (ETL)

```python
def extract(raw_records):
 """Yield raw records from a source."""
 for record in raw_records:
 yield record

def transform(records):
 """Clean and transform each record."""
 for record in records:
 if record.get('salary') and record.get('name'):
 yield {
 'name': record['name'].strip().title(),
 'salary': float(record['salary']),
 'department': record.get('dept', 'Unknown').upper(),
 }

def filter_high_earners(records, threshold=50000):
 """Keep only high earners."""
 for record in records:
 if record['salary'] >= threshold:
 yield record

def load(records, output_file):
 """Write records to output."""
 import json
 with open(output_file, 'w') as f:
 for record in records:
 f.write(json.dumps(record) + '\n')

# ETL pipeline - each stage is a generator, completely lazy
raw_data = [
 {'name': ' ravi kumar ', 'salary': '75000', 'dept': 'engineering'},
 {'name': 'Priya Sharma', 'salary': '45000', 'dept': 'marketing'},
 {'name': 'Arjun Patel ', 'salary': '92000', 'dept': 'data science'},
]

pipeline = filter_high_earners(transform(extract(raw_data)), threshold=60000)

for result in pipeline:
 print(result)
# {'name': 'Ravi Kumar', 'salary': 75000.0, 'department': 'ENGINEERING'}
# {'name': 'Arjun Patel', 'salary': 92000.0, 'department': 'DATA SCIENCE'}
```

---

## Practice Questions & Answers

---

### ✅ Question 1 - Basics

**Q:** What is the difference between an iterable and an iterator? Give two examples of each.

**A:**

An **iterable** is any object you can loop over - it has a `__iter__()` method that returns an iterator when called. Examples: `list`, `str`, `dict`, `tuple`, `set`, `range`.

An **iterator** is an object that maintains traversal state - it has both `__iter__()` (returns `self`) and `__next__()` (returns the next value or raises `StopIteration`). Examples: the object returned by `iter([1, 2, 3])`, or a generator object.

```python
lst = [1, 2, 3] # iterable, NOT an iterator
it = iter(lst) # iterator

print(hasattr(lst, '__next__')) # False
print(hasattr(it, '__next__')) # True
print(iter(it) is it) # True - iterator is its own iterable
```

---

### ✅ Question 2 - Custom Iterator

**Q:** Implement a class `Squares` that works as an iterator, yielding the squares of integers from 1 up to `n`.

```python
# Expected:
sq = Squares(5)
print(list(sq)) # [1, 4, 9, 16, 25]
```

**A:**

```python
class Squares:
 def __init__(self, n):
 self.n = n
 self.current = 1

 def __iter__(self):
 return self

 def __next__(self):
 if self.current > self.n:
 raise StopIteration
 value = self.current ** 2
 self.current += 1
 return value


sq = Squares(5)
print(list(sq)) # [1, 4, 9, 16, 25]

# Also works in a for loop:
for val in Squares(4):
 print(val) # 1, 4, 9, 16
```

---

### ✅ Question 3 - Generator Function

**Q:** Write a generator function `even_numbers(limit)` that yields all even numbers from 0 up to `limit` (inclusive).

**A:**

```python
def even_numbers(limit):
 for i in range(0, limit + 1, 2):
 yield i


print(list(even_numbers(10))) # [0, 2, 4, 6, 8, 10]
print(list(even_numbers(7))) # [0, 2, 4, 6]

# Can also be written as a generator expression:
gen = (x for x in range(0, 11, 2))
print(list(gen)) # [0, 2, 4, 6, 8, 10]
```

---

### ✅ Question 4 - Infinite Generator + `itertools.islice`

**Q:** Write a generator `powers_of_two()` that yields `1, 2, 4, 8, 16, ...` indefinitely. Then use `itertools.islice` to print the first 8 values.

**A:**

```python
import itertools

def powers_of_two():
 value = 1
 while True:
 yield value
 value *= 2


result = list(itertools.islice(powers_of_two(), 8))
print(result) # [1, 2, 4, 8, 16, 32, 64, 128]
```

---

### ✅ Question 5 - `yield from`

**Q:** Write a generator `chain_iterables(*iterables)` that yields all items from multiple iterables one after another (similar to `itertools.chain`).

**A:**

```python
def chain_iterables(*iterables):
 for it in iterables:
 yield from it


result = list(chain_iterables([1, 2], (3, 4), "56"))
print(result) # [1, 2, 3, 4, '5', '6']
```

---

### ✅ Question 6 - Memory Efficiency

**Q:** You have a list of 10 million numbers. Using a generator, compute the sum of squares of all even numbers. Explain why this is more memory efficient.

**A:**

```python
import sys

n = 10_000_000

# List approach - creates 3 large lists in memory
even_list = [x for x in range(n) if x % 2 == 0]
squares_list = [x**2 for x in even_list]
result_list = sum(squares_list)

# Generator approach - processes one number at a time
result_gen = sum(x**2 for x in range(n) if x % 2 == 0)

# Both give the same result:
print(result_list == result_gen) # True

# Memory comparison:
print(sys.getsizeof(even_list)) # ~40 MB
print(sys.getsizeof(
 (x**2 for x in range(n) if x % 2 == 0)
)) # ~104 bytes (generator object only)
```

The generator is more memory efficient because it **never stores the intermediate lists**. It computes each value on demand and immediately passes it to `sum()`. The generator object itself is a tiny state machine (~104 bytes), regardless of how large `n` is.

---

### ✅ Question 7 - Tricky Exhaustion

**Q:** What is the output of the following code? Explain why.

```python
gen = (x for x in range(5))
a = list(gen)
b = list(gen)
print(a, b)
```

**A:**

```
[0, 1, 2, 3, 4] []
```

`list(gen)` the first time exhausts the generator completely. Calling `list(gen)` a second time returns an empty list because the generator is already at `StopIteration` and there is no way to reset it. To get two copies, you need to call the generator function twice or convert to a list once and reuse it.

---

### ✅ Question 8 - Pipeline Design

**Q:** Write a generator pipeline to:
1. Take a list of strings
2. Strip whitespace
3. Convert to uppercase
4. Keep only strings longer than 3 characters
5. Collect results

**A:**

```python
def strip_strings(strings):
 for s in strings:
 yield s.strip()

def to_uppercase(strings):
 for s in strings:
 yield s.upper()

def filter_by_length(strings, min_len):
 for s in strings:
 if len(s) > min_len:
 yield s


raw = [" hello ", " hi ", " python ", " ok ", " world ", " go "]

pipeline = filter_by_length(
 to_uppercase(
 strip_strings(raw)
 ),
 min_len=3
 )

result = list(pipeline)
print(result) # ['HELLO', 'PYTHON', 'WORLD']
```

---

### ✅ Question 9 - `send()` Coroutine

**Q:** Write a generator function `running_average()` that receives numbers via `send()` and yields the current running average after each number.

**A:**

```python
def running_average():
 total = 0
 count = 0
 avg = None
 while True:
 value = yield avg
 if value is None:
 return
 total += value
 count += 1
 avg = total / count


gen = running_average()
next(gen) # prime the generator

print(gen.send(10)) # 10.0
print(gen.send(20)) # 15.0
print(gen.send(30)) # 20.0
print(gen.send(40)) # 25.0
```

---

### ✅ Question 10 - Real World: Chunked File Processing

**Q:** Write a generator that reads a file and yields it in chunks of `n` lines (useful for batch-processing large files).

**A:**

```python
def read_in_chunks(filepath, chunk_size=100):
 """Yield lists of `chunk_size` lines from a large file."""
 chunk = []
 with open(filepath, 'r', encoding='utf-8') as f:
 for line in f:
 chunk.append(line.rstrip('\n'))
 if len(chunk) == chunk_size:
 yield chunk
 chunk = [] # reset for next chunk
 if chunk: # yield remaining lines
 yield chunk


# Usage:
# for batch in read_in_chunks('server_logs.txt', chunk_size=500):
# process_batch(batch) # handle 500 lines at a time
```

---

## Quick Reference Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────────┐
│ QUICK REFERENCE │
├──────────────────────┬──────────────────────────────────────────────┤
│ CONCEPT │ SUMMARY │
├──────────────────────┼──────────────────────────────────────────────┤
│ Iterable │ Has __iter__() → returns iterator │
│ │ Examples: list, str, dict, set, range │
├──────────────────────┼──────────────────────────────────────────────┤
│ Iterator │ Has __iter__() + __next__() │
│ │ Stateful, single-pass, raises StopIteration │
├──────────────────────┼──────────────────────────────────────────────┤
│ Generator Function │ def f(): yield x → returns generator object │
├──────────────────────┼──────────────────────────────────────────────┤
│ Generator Expression │ (x for x in iterable if condition) │
├──────────────────────┼──────────────────────────────────────────────┤
│ yield │ Pauses function, returns value, resumes next │
├──────────────────────┼──────────────────────────────────────────────┤
│ yield from │ Delegates to a sub-iterator/generator │
├──────────────────────┼──────────────────────────────────────────────┤
│ send(val) │ Sends value INTO a generator (coroutine) │
├──────────────────────┼──────────────────────────────────────────────┤
│ close() │ Throws GeneratorExit into generator │
├──────────────────────┼──────────────────────────────────────────────┤
│ throw(exc) │ Injects an exception into the generator │
├──────────────────────┼──────────────────────────────────────────────┤
│ iter(obj) │ Calls obj.__iter__() │
├──────────────────────┼──────────────────────────────────────────────┤
│ next(it) │ Calls it.__next__(), returns next value │
└──────────────────────┴──────────────────────────────────────────────┘

WHEN TO USE WHAT
─────────────────
Use a LIST when:
 • You need to access elements by index
 • You need to iterate multiple times
 • The dataset fits comfortably in memory

Use an ITERATOR when:
 • You need custom traversal logic
 • You want to model a stateful sequence as a class

Use a GENERATOR when:
 • Processing large/infinite data streams
 • Building lazy pipelines
 • Memory efficiency matters
 • Implementing coroutines with send()

Use a GENERATOR EXPRESSION when:
 • Feeding data into sum(), max(), min(), list(), etc.
 • Simple filtering/mapping inline
```

---

*End of Lesson - Iterables, Iterators & Generators*
*Codeverra - codeverra.com*
