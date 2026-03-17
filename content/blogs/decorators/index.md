---
title: "Higher Order Functions and Decorators in Python"
description: "Learn about higher order functions like map, filter, reduce and decorators "

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python

cover:
  image: "/images/blog-images/binary-search.jpg"
  alt: "Binary search algorithm"
  caption: "Data Analysis using Python"
  relative: true
  hidden: false
---

# Python Higher-Order Functions & Decorators
### A Complete Lesson Plan & Reference Guide

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Functions as First-Class Objects](#functions-as-first-class-objects)
3. [Higher-Order Functions](#higher-order-functions)
4. [Closures — The Foundation of Decorators](#closures--the-foundation-of-decorators)
5. [Decorators — Core Concept](#decorators--core-concept)
6. [The `@` Syntax](#the--syntax)
7. [Preserving Metadata with `functools.wraps`](#preserving-metadata-with-functoolswraps)
8. [Decorators with Arguments](#decorators-with-arguments)
9. [Class-Based Decorators](#class-based-decorators)
10. [Stacking Multiple Decorators](#stacking-multiple-decorators)
11. [Built-in Decorators](#built-in-decorators)
12. [Practical Decorator Patterns](#practical-decorator-patterns)
13. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
14. [Practice Questions & Answers](#practice-questions--answers)
15. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│              THE DECORATOR MENTAL MODEL                             │
│                                                                     │
│  A decorator is a function that WRAPS another function             │
│  to add behaviour before, after, or around it.                     │
│                                                                     │
│    Original Function                                                │
│   ┌────────────────┐                                                │
│   │   do_thing()   │                                                │
│   └────────────────┘                                                │
│           │  decorator applied                                      │
│           ▼                                                         │
│   ┌────────────────────────────────────┐                            │
│   │           wrapper()                │                            │
│   │  ┌──────────────────────────────┐  │                            │
│   │  │  before logic (logging etc)  │  │                            │
│   │  ├──────────────────────────────┤  │                            │
│   │  │      do_thing() ← called     │  │                            │
│   │  ├──────────────────────────────┤  │                            │
│   │  │  after logic (timing etc)    │  │                            │
│   │  └──────────────────────────────┘  │                            │
│   └────────────────────────────────────┘                            │
│                                                                     │
│  @decorator        is sugar for:   func = decorator(func)          │
└─────────────────────────────────────────────────────────────────────┘
```

> **Core Idea:** A decorator is just a callable that takes a function and returns a new callable. Everything else — the `@` syntax, `functools.wraps`, parameterised decorators — builds on top of this single idea.

---

## Functions as First-Class Objects

In Python, functions are **first-class objects**. This means a function can be:

- Assigned to a variable
- Passed as an argument to another function
- Returned from a function
- Stored in data structures

This is the foundational property that makes higher-order functions and decorators possible.

```python
# 1. Assigned to a variable
def greet(name):
    return f"Hello, {name}!"

say_hello = greet             # no parentheses — we assign the function itself
print(say_hello("Priya"))     # Hello, Priya!
print(greet is say_hello)     # True — same object

# 2. Passed as an argument
def apply(func, value):
    return func(value)

print(apply(str.upper, "hello"))    # HELLO
print(apply(len, [1, 2, 3, 4]))     # 4

# 3. Returned from a function
def make_multiplier(n):
    def multiplier(x):
        return x * n
    return multiplier           # returning the inner function itself

triple = make_multiplier(3)
print(triple(10))               # 30
print(triple(7))                # 21

# 4. Stored in a data structure
operations = {
    "double": lambda x: x * 2,
    "square": lambda x: x ** 2,
    "negate": lambda x: -x,
}

print(operations["square"](5))   # 25
```

---

## Higher-Order Functions

A **Higher-Order Function (HOF)** is a function that either:
- **Takes** one or more functions as arguments, OR
- **Returns** a function as its result (or both)

### Python's Built-in HOFs

#### `map(func, iterable)` — Apply a function to every element

```python
numbers = [1, 2, 3, 4, 5]

# map returns a lazy iterator
squares = list(map(lambda x: x**2, numbers))
print(squares)   # [1, 4, 9, 16, 25]

# With a named function
def to_rupees(usd):
    return round(usd * 83.5, 2)

prices_usd = [10.0, 25.5, 4.99, 100.0]
prices_inr = list(map(to_rupees, prices_usd))
print(prices_inr)   # [835.0, 2129.25, 416.67, 8350.0]

# map with multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
print(sums)   # [11, 22, 33]
```

#### `filter(func, iterable)` — Keep elements where func returns True

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)   # [2, 4, 6, 8, 10]

# Filter with None — removes falsy values
mixed = [0, 1, "", "hello", None, [1, 2], [], False, True]
truthy_only = list(filter(None, mixed))
print(truthy_only)   # [1, 'hello', [1, 2], True]

# Real example: filter active users
users = [
    {"name": "Ravi",  "active": True},
    {"name": "Priya", "active": False},
    {"name": "Arjun", "active": True},
]
active_users = list(filter(lambda u: u["active"], users))
print([u["name"] for u in active_users])   # ['Ravi', 'Arjun']
```

#### `reduce(func, iterable)` — Fold a sequence into a single value

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

total = reduce(lambda acc, x: acc + x, numbers)
print(total)   # 15

product = reduce(lambda acc, x: acc * x, numbers)
print(product)  # 120

# With an initial value
total_with_offset = reduce(lambda acc, x: acc + x, numbers, 100)
print(total_with_offset)   # 115

# Step by step — seeing how reduce works:
# Step 1: acc=1,  x=2  → 3
# Step 2: acc=3,  x=3  → 6
# Step 3: acc=6,  x=4  → 10
# Step 4: acc=10, x=5  → 15

# Real example: building a dict from a list
pairs = [("name", "Ravi"), ("age", 28), ("city", "Hyderabad")]
record = reduce(lambda d, kv: {**d, kv[0]: kv[1]}, pairs, {})
print(record)   # {'name': 'Ravi', 'age': 28, 'city': 'Hyderabad'}
```

#### `sorted()` with a key function

```python
players = [
    {"name": "Rohit",   "runs": 320},
    {"name": "Virat",   "runs": 450},
    {"name": "Dhoni",   "runs": 280},
    {"name": "Hardik",  "runs": 190},
]

# Sort by runs descending
by_runs = sorted(players, key=lambda p: p["runs"], reverse=True)
for p in by_runs:
    print(f"{p['name']}: {p['runs']}")
# Virat: 450 → Rohit: 320 → Dhoni: 280 → Hardik: 190

# Sort by string length
words = ["banana", "fig", "kiwi", "apple", "mango"]
by_length = sorted(words, key=len)
print(by_length)   # ['fig', 'kiwi', 'apple', 'mango', 'banana']

# Multi-key sort using operator.attrgetter / itemgetter
from operator import itemgetter
data = [("Alice", 30), ("Bob", 25), ("Charlie", 30), ("Dave", 25)]
sorted_data = sorted(data, key=itemgetter(1, 0))   # sort by age, then name
print(sorted_data)  # [('Bob', 25), ('Dave', 25), ('Alice', 30), ('Charlie', 30)]
```

### Writing Your Own HOFs

```python
# HOF that returns a function — a "factory"
def make_validator(min_val, max_val):
    """Returns a function that checks if a value is in range."""
    def validator(value):
        return min_val <= value <= max_val
    return validator

is_valid_age    = make_validator(0, 120)
is_valid_score  = make_validator(0, 100)
is_valid_pin    = make_validator(1000, 9999)

print(is_valid_age(25))      # True
print(is_valid_age(200))     # False
print(is_valid_score(95.5))  # True
print(is_valid_pin(9999))    # True


# HOF that takes a function — a "pipeline" builder
def pipeline(*funcs):
    """Returns a function that passes data through all funcs in sequence."""
    def execute(data):
        result = data
        for func in funcs:
            result = func(result)
        return result
    return execute

process = pipeline(
    str.strip,
    str.lower,
    lambda s: s.replace(" ", "_"),
)

print(process("  Hello World  "))   # hello_world
print(process("  PYTHON Rocks  "))  # python_rocks
```

---

## Closures — The Foundation of Decorators

A **closure** is a function that **remembers the variables from its enclosing scope** even after that scope has finished executing. Decorators are closures.

```python
def outer(x):
    # x is a "free variable" — it lives in outer's scope
    def inner(y):
        return x + y    # inner "closes over" x
    return inner

add_five = outer(5)
add_ten  = outer(10)

print(add_five(3))    # 8   — x=5 is remembered
print(add_ten(3))     # 13  — x=10 is remembered
print(add_five(3))    # 8   — still 8, x=5 is not gone
```

### Inspecting a Closure

```python
def make_counter(start=0):
    count = start
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c = make_counter()
print(c())   # 1
print(c())   # 2
print(c())   # 3

# Inspect the closure's free variables
print(c.__code__.co_freevars)   # ('count',)
print(c.__closure__[0].cell_contents)  # 3  ← current value of count
```

### `nonlocal` — Modifying an Enclosing Variable

```python
def make_accumulator():
    total = 0
    def add(value):
        nonlocal total     # tells Python: total is NOT local to add()
        total += value
        return total
    return add

acc = make_accumulator()
print(acc(10))   # 10
print(acc(20))   # 30
print(acc(5))    # 35
```

---

## Decorators — Core Concept

A **decorator** is a function that wraps another function, adding behaviour without modifying the original function's source code. It follows this exact pattern:

```python
def my_decorator(func):           # 1. Takes a function
    def wrapper(*args, **kwargs): # 2. Defines a wrapper
        # before logic
        result = func(*args, **kwargs)   # 3. Calls the original
        # after logic
        return result
    return wrapper                # 4. Returns the wrapper
```

### Manual Application (Without `@`)

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

def greet(name):
    return f"hello, {name}!"

# Manually decorating
greet = shout(greet)
print(greet("ravi"))    # HELLO, RAVI!
```

---

## The `@` Syntax

The `@decorator` syntax is **syntactic sugar** for `func = decorator(func)`. Both are exactly equivalent.

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

# Using @ — clean, readable
@shout
def greet(name):
    return f"hello, {name}!"

print(greet("priya"))   # HELLO, PRIYA!

# This is EXACTLY the same as:
# greet = shout(greet)
```

### A Timing Decorator — Classic Example

```python
import time

def timer(func):
    """Prints how long a function took to execute."""
    def wrapper(*args, **kwargs):
        start  = time.perf_counter()
        result = func(*args, **kwargs)
        end    = time.perf_counter()
        print(f"{func.__name__} took {end - start:.6f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

result = slow_sum(10_000_000)
# slow_sum took 0.341203s
```

### A Logging Decorator

```python
import functools

def log_calls(func):
    """Logs every call to the decorated function."""
    @functools.wraps(func)   # more on this next section
    def wrapper(*args, **kwargs):
        args_repr   = [repr(a) for a in args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        signature   = ", ".join(args_repr + kwargs_repr)
        print(f"Calling {func.__name__}({signature})")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b

add(3, 5)
# Calling add(3, 5)
# add returned 8

add(a=10, b=20)
# Calling add(a=10, b=20)
# add returned 30
```

---

## Preserving Metadata with `functools.wraps`

Without `functools.wraps`, decorating a function **replaces its identity** — its name, docstring, and other metadata are overwritten by the wrapper.

```python
import functools

# WITHOUT functools.wraps — identity is lost
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def important_function():
    """This function does something important."""
    pass

print(important_function.__name__)   # 'wrapper'     ← WRONG
print(important_function.__doc__)    # None          ← WRONG


# WITH functools.wraps — identity is preserved
def good_decorator(func):
    @functools.wraps(func)    # copies __name__, __doc__, __module__, __qualname__, __annotations__
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@good_decorator
def important_function():
    """This function does something important."""
    pass

print(important_function.__name__)   # 'important_function'  ← correct
print(important_function.__doc__)    # 'This function does something important.'
print(important_function.__wrapped__)  # <function important_function ...>  ← original
```

> **Rule:** Always use `@functools.wraps(func)` inside your decorator's wrapper. No exceptions.

---

## Decorators with Arguments

Sometimes you want to parameterize a decorator: `@retry(times=3)`. This requires **one more layer of nesting** — a factory function that returns the actual decorator.

```python
# Structure: factory → decorator → wrapper
def repeat(times):               # ← factory: takes the argument
    def decorator(func):         # ← actual decorator: takes the function
        @functools.wraps(func)
        def wrapper(*args, **kwargs):   # ← wrapper: called each time
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator


@repeat(times=3)
def say_hi(name):
    print(f"Hi, {name}!")

say_hi("Arjun")
# Hi, Arjun!
# Hi, Arjun!
# Hi, Arjun!
```

### Parameterized Timer

```python
import time
import functools

def timer(unit="s"):
    """Decorator factory: measures time in 's' or 'ms'."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start  = time.perf_counter()
            result = func(*args, **kwargs)
            elapsed = time.perf_counter() - start
            if unit == "ms":
                print(f"{func.__name__}: {elapsed * 1000:.2f}ms")
            else:
                print(f"{func.__name__}: {elapsed:.6f}s")
            return result
        return wrapper
    return decorator

@timer(unit="ms")
def fast_function():
    return sum(range(100_000))

@timer(unit="s")
def slow_function():
    return sum(range(10_000_000))

fast_function()   # fast_function: 4.21ms
slow_function()   # slow_function: 0.341203s
```

### Retry Decorator with Parameters

```python
import functools
import time

def retry(max_attempts=3, delay=1.0, exceptions=(Exception,)):
    """
    Retry a function on failure.
    max_attempts: total tries before giving up
    delay:        seconds to wait between attempts
    exceptions:   tuple of exception types to retry on
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_err = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_err = e
                    print(f"[retry] {func.__name__}: attempt {attempt} failed: {e}")
                    if attempt < max_attempts:
                        time.sleep(delay)
            raise last_err
        return wrapper
    return decorator

count = 0

@retry(max_attempts=3, delay=0, exceptions=(ValueError,))
def flaky():
    global count
    count += 1
    if count < 3:
        raise ValueError("not ready")
    return "done"

print(flaky())
# [retry] flaky: attempt 1 failed: not ready
# [retry] flaky: attempt 2 failed: not ready
# done
```

---

## Class-Based Decorators

You can implement a decorator as a **class** by implementing `__call__`. This is useful when the decorator needs to maintain state across calls.

```python
import functools

class CountCalls:
    """Counts how many times the decorated function has been called."""

    def __init__(self, func):
        functools.update_wrapper(self, func)   # preserves metadata
        self.func  = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} has been called {self.count} time(s)")
        return self.func(*args, **kwargs)


@CountCalls
def process(x):
    return x * 2

process(5)    # process has been called 1 time(s)
process(10)   # process has been called 2 time(s)
process(15)   # process has been called 3 time(s)

print(process.count)   # 3
```

### Class-Based Decorator with Arguments

```python
class RateLimit:
    """Limits a function to `calls_per_second` calls per second."""

    def __init__(self, calls_per_second):
        self.min_interval = 1.0 / calls_per_second
        self.last_called  = 0.0

    def __call__(self, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now     = time.time()
            elapsed = now - self.last_called
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)
            self.last_called = time.time()
            return func(*args, **kwargs)
        return wrapper


@RateLimit(calls_per_second=2)
def api_call(endpoint):
    print(f"Calling {endpoint}")

api_call("/users")
api_call("/orders")   # automatically waits 0.5s before calling
```

---

## Stacking Multiple Decorators

Decorators **stack from bottom to top** (innermost first). The bottom decorator wraps the function first, then the one above wraps that result.

```python
import functools

def bold(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return f"<b>{func(*args, **kwargs)}</b>"
    return wrapper

def italic(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return f"<i>{func(*args, **kwargs)}</i>"
    return wrapper

def underline(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return f"<u>{func(*args, **kwargs)}</u>"
    return wrapper


@bold
@italic
@underline
def text(content):
    return content

print(text("Hello"))
# <b><i><u>Hello</u></i></b>

# Execution order explained:
# @bold      →  bold(italic(underline(text)))
# @italic    →  italic(underline(text))
# @underline →  underline(text)          ← applied first (innermost)
#
# When called: bold wrapper runs → italic wrapper runs → underline wrapper runs → text()
```

### Practical Stack: Auth + Logging + Timing

```python
import functools, time

def require_auth(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        user = kwargs.get("user")
        if not user or not user.get("authenticated"):
            raise PermissionError(f"Authentication required to call {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

def log_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[LOG] {func.__name__} called")
        result = func(*args, **kwargs)
        print(f"[LOG] {func.__name__} completed")
        return result
    return wrapper

def measure_time(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start  = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"[TIME] {func.__name__}: {time.perf_counter() - start:.4f}s")
        return result
    return wrapper


@measure_time
@log_call
@require_auth
def get_dashboard(user=None):
    return {"data": "dashboard content"}

# Test it
get_dashboard(user={"name": "Ravi", "authenticated": True})
# [LOG] get_dashboard called
# [LOG] get_dashboard completed
# [TIME] get_dashboard: 0.0001s
```

---

## Built-in Decorators

Python ships with several powerful built-in decorators.

### `@staticmethod` — No implicit first argument

```python
class MathHelper:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def is_even(n):
        return n % 2 == 0

# Can be called on the class OR an instance
print(MathHelper.add(3, 5))         # 8
print(MathHelper().is_even(4))      # True
# No `self` or `cls` passed
```

### `@classmethod` — Receives the class as first argument

```python
class Employee:
    company = "Codeverra"

    def __init__(self, name, salary):
        self.name   = name
        self.salary = salary

    @classmethod
    def from_dict(cls, data):
        """Alternative constructor — creates instance from a dict."""
        return cls(data["name"], data["salary"])

    @classmethod
    def change_company(cls, new_name):
        cls.company = new_name

    def __repr__(self):
        return f"Employee({self.name}, {self.salary}, {self.company})"

emp = Employee.from_dict({"name": "Priya", "salary": 75000})
print(emp)   # Employee(Priya, 75000, Codeverra)

Employee.change_company("Codeverra Pro")
print(emp)   # Employee(Priya, 75000, Codeverra Pro)
```

### `@property` — Computed attributes

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @radius.deleter
    def radius(self):
        del self._radius

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

    @property
    def circumference(self):
        import math
        return 2 * math.pi * self._radius

c = Circle(5)
print(c.radius)          # 5
print(f"{c.area:.2f}")   # 78.54
c.radius = 10            # calls the setter
print(c.area)            # 314.159...
c.radius = -1            # ValueError: Radius cannot be negative
```

### `@functools.lru_cache` — Memoization

```python
import functools

# Without cache — exponential time
def fib_slow(n):
    if n < 2:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

# With lru_cache — linear time (results cached in memory)
@functools.lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(50))     # 12586269025 — instant
print(fib.cache_info())   # CacheInfo(hits=48, misses=51, maxsize=None, currsize=51)
fib.cache_clear()          # clear the cache

# Python 3.9+: @functools.cache (unbounded, simpler)
@functools.cache
def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)
```

### `@functools.cached_property` — Property computed once per instance

```python
import functools

class DataSet:
    def __init__(self, data):
        self.data = data

    @functools.cached_property
    def stats(self):
        print("Computing stats...")   # only runs once!
        import statistics
        return {
            "mean":   statistics.mean(self.data),
            "stdev":  statistics.stdev(self.data),
            "median": statistics.median(self.data),
        }

ds = DataSet([10, 20, 30, 40, 50])
print(ds.stats)   # Computing stats... → {'mean': 30, ...}
print(ds.stats)   # Cached — does NOT print "Computing stats..." again
```

---

## Practical Decorator Patterns

### Pattern 1 — Access Control / Authorization

```python
import functools

def requires_role(*allowed_roles):
    """Decorator factory that restricts access by user role."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            current_user = kwargs.get("user") or (args[0] if args else None)
            if not current_user:
                raise PermissionError("No user provided")
            if current_user.get("role") not in allowed_roles:
                raise PermissionError(
                    f"User role '{current_user.get('role')}' not in {allowed_roles}"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator

@requires_role("admin", "superuser")
def delete_record(user=None, record_id=None):
    return f"Record {record_id} deleted"

@requires_role("admin", "editor", "viewer")
def view_report(user=None):
    return "Here is the report"

# Test
admin  = {"name": "Ravi",  "role": "admin"}
viewer = {"name": "Priya", "role": "viewer"}

print(delete_record(user=admin, record_id=42))      # Record 42 deleted
print(view_report(user=viewer))                       # Here is the report

try:
    delete_record(user=viewer, record_id=99)          # PermissionError
except PermissionError as e:
    print(e)   # User role 'viewer' not in ('admin', 'superuser')
```

### Pattern 2 — Caching / Memoization (Custom)

```python
import functools
import time

def timed_cache(seconds):
    """Cache results for a given number of seconds."""
    def decorator(func):
        cache    = {}
        expiry   = {}

        @functools.wraps(func)
        def wrapper(*args):
            now = time.time()
            if args in cache and now < expiry[args]:
                print(f"[cache hit] {func.__name__}{args}")
                return cache[args]
            result     = func(*args)
            cache[args]  = result
            expiry[args] = now + seconds
            return result
        return wrapper
    return decorator

@timed_cache(seconds=5)
def get_exchange_rate(currency):
    print(f"[API call] fetching rate for {currency}")
    return {"USD": 83.5, "EUR": 90.2}.get(currency, 1.0)

print(get_exchange_rate("USD"))   # [API call] → 83.5
print(get_exchange_rate("USD"))   # [cache hit] → 83.5
time.sleep(0.1)
print(get_exchange_rate("USD"))   # [cache hit] → 83.5
```

### Pattern 3 — Input Validation

```python
import functools

def validate_types(**type_map):
    """
    Validates argument types at call time.
    Usage: @validate_types(name=str, age=int, score=float)
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Bind arguments to parameter names
            import inspect
            bound = inspect.signature(func).bind(*args, **kwargs)
            bound.apply_defaults()
            for param, expected_type in type_map.items():
                if param in bound.arguments:
                    value = bound.arguments[param]
                    if not isinstance(value, expected_type):
                        raise TypeError(
                            f"Argument '{param}' must be {expected_type.__name__}, "
                            f"got {type(value).__name__}"
                        )
            return func(*args, **kwargs)
        return wrapper
    return decorator


@validate_types(name=str, age=int, score=float)
def register_student(name, age, score):
    return f"Registered: {name}, age={age}, score={score}"

print(register_student("Arjun", 22, 95.5))    # OK
register_student(123, 22, 95.5)                # TypeError: 'name' must be str
```

### Pattern 4 — Deprecation Warning

```python
import functools
import warnings

def deprecated(reason=""):
    """Marks a function as deprecated and warns when it is called."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            msg = f"{func.__name__} is deprecated."
            if reason:
                msg += f" {reason}"
            warnings.warn(msg, DeprecationWarning, stacklevel=2)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@deprecated(reason="Use calculate_v2() instead.")
def calculate(x, y):
    return x + y

result = calculate(3, 4)
# DeprecationWarning: calculate is deprecated. Use calculate_v2() instead.
```

### Pattern 5 — Singleton Pattern

```python
import functools

def singleton(cls):
    """Ensures only one instance of a class is ever created."""
    instances = {}

    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

@singleton
class DatabaseConnection:
    def __init__(self, host="localhost"):
        self.host = host
        print(f"Connecting to {host}...")

db1 = DatabaseConnection("prod-server")   # Connecting to prod-server...
db2 = DatabaseConnection("other-server")  # NOT printed — returns existing instance

print(db1 is db2)        # True — same object
print(db2.host)          # prod-server
```

---

## Common Mistakes to Avoid

### Mistake 1 — Forgetting `functools.wraps`

```python
# BAD
def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper   # wrapper's name and docstring replace func's

# GOOD
import functools
def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### Mistake 2 — Calling the Function When Applying the Decorator

```python
def greet():
    return "Hello!"

def my_decorator(func):
    @functools.wraps(func)
    def wrapper():
        return func().upper()
    return wrapper

# BAD — calling greet() at decoration time, not at call time
@my_decorator
def greet():      # This is fine, but...
    return "Hello!"

greet_result = my_decorator(greet())   # WRONG — passing the result "Hello!", not the function

# GOOD
@my_decorator    # pass the function object, without ()
def greet():
    return "Hello!"
```

### Mistake 3 — Forgetting `*args, **kwargs` in the Wrapper

```python
# BAD — wrapper only works for functions with no arguments
def timer(func):
    def wrapper():           # only works for zero-argument functions
        start  = time.time()
        result = func()
        print(f"took {time.time() - start:.3f}s")
        return result
    return wrapper

@timer
def greet(name):    # This will break — wrapper() takes 0 args
    return f"Hi {name}"

# GOOD — wrapper accepts any arguments and passes them through
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):   # accepts any signature
        start  = time.time()
        result = func(*args, **kwargs)
        print(f"took {time.time() - start:.3f}s")
        return result
    return wrapper
```

### Mistake 4 — Decorator Applied at Import Time Has Side Effects

```python
# BAD — executes code at class/module definition time
import time

def timer(func):
    start = time.time()     # runs when @timer is applied, NOT when func is called!
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# GOOD — timing must be INSIDE wrapper
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start  = time.time()    # runs each time the function is called
        result = func(*args, **kwargs)
        print(f"{time.time() - start:.3f}s")
        return result
    return wrapper
```

### Mistake 5 — Not Returning the Function's Result

```python
# BAD — silently drops the return value
def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        func(*args, **kwargs)    # result is discarded!
    return wrapper

@my_decorator
def add(a, b):
    return a + b

print(add(3, 4))   # None — not 7!

# GOOD
def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)   # always return the result
    return wrapper
```

### Mistake 6 — Stacking Order Confusion

```python
@decorator_A
@decorator_B
def func():
    pass

# This is: func = decorator_A(decorator_B(func))
# decorator_B wraps func FIRST, then decorator_A wraps THAT.
# When called: A's logic → B's logic → original func → B's after → A's after

# If A checks authentication and B logs timing,
# and you want auth checked BEFORE logging starts:
@auth_check    # outer — runs first
@log_timing    # inner — runs second
def endpoint():
    pass
```

---

## Practice Questions & Answers

---

### Question 1 — HOF Basics

**Q:** Using `map` and `filter`, transform a list of temperatures from Celsius to Fahrenheit and keep only temperatures above 100°F.

**A:**

```python
celsius = [0, 20, 37, 45, 60, 100]

# Convert: F = C * 9/5 + 32
fahrenheit = list(map(lambda c: c * 9/5 + 32, celsius))
print(fahrenheit)   # [32.0, 68.0, 98.6, 113.0, 140.0, 212.0]

hot_temps = list(filter(lambda f: f > 100, fahrenheit))
print(hot_temps)   # [113.0, 140.0, 212.0]

# One-liner using a generator expression
hot = [c * 9/5 + 32 for c in celsius if c * 9/5 + 32 > 100]
print(hot)         # [113.0, 140.0, 212.0]
```

---

### Question 2 — Write a Closure

**Q:** Write a closure `make_power(n)` that returns a function which raises its argument to the power `n`.

**A:**

```python
def make_power(n):
    def power(x):
        return x ** n
    return power

square = make_power(2)
cube   = make_power(3)

print(square(4))   # 16
print(cube(3))     # 27
print(make_power(10)(2))   # 1024

# The free variable `n` is captured in the closure:
print(square.__code__.co_freevars)   # ('n',)
```

---

### Question 3 — Basic Decorator

**Q:** Write a decorator `@uppercase` that converts a function's string return value to uppercase.

**A:**

```python
import functools

def uppercase(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        if isinstance(result, str):
            return result.upper()
        return result
    return wrapper

@uppercase
def greet(name):
    return f"hello, {name}!"

@uppercase
def get_city():
    return "hyderabad"

print(greet("ravi"))    # HELLO, RAVI!
print(get_city())       # HYDERABAD
```

---

### Question 4 — Decorator with Arguments

**Q:** Write a decorator `@truncate(max_len)` that truncates a function's string return value to `max_len` characters, appending `"..."` if truncated.

**A:**

```python
import functools

def truncate(max_len):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            if isinstance(result, str) and len(result) > max_len:
                return result[:max_len] + "..."
            return result
        return wrapper
    return decorator

@truncate(max_len=10)
def get_description():
    return "This is a very long description that should be cut off"

@truncate(max_len=20)
def get_title():
    return "Introduction to Python Decorators"

print(get_description())   # This is a...
print(get_title())         # Introduction to Pyt...
```

---

### Question 5 — Class-Based Decorator

**Q:** Write a class-based decorator `Memoize` that caches the return value of a function based on its arguments.

**A:**

```python
import functools

class Memoize:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func  = func
        self.cache = {}

    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]

    def cache_info(self):
        return f"Cached {len(self.cache)} result(s): {list(self.cache.keys())}"


@Memoize
def expensive(n):
    print(f"Computing for {n}...")
    return n ** 3

print(expensive(5))    # Computing for 5... → 125
print(expensive(5))    # (no print) → 125  (cached)
print(expensive(10))   # Computing for 10... → 1000
print(expensive.cache_info())
# Cached 2 result(s): [(5,), (10,)]
```

---

### Question 6 — Stacking Decorators

**Q:** Write two decorators: `@add_html_tag(tag)` that wraps output in an HTML tag. Then apply them to produce `<p><em>Hello</em></p>`.

**A:**

```python
import functools

def add_html_tag(tag):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return f"<{tag}>{func(*args, **kwargs)}</{tag}>"
        return wrapper
    return decorator

@add_html_tag("p")
@add_html_tag("em")
def hello():
    return "Hello"

print(hello())   # <p><em>Hello</em></p>

# Stacking order:
# @add_html_tag("em") applied first → wraps hello() in <em>
# @add_html_tag("p")  applied second → wraps that result in <p>
```

---

### Question 7 — Real World: Rate Limiter

**Q:** Write a decorator `@rate_limit(calls, period)` that raises a `RuntimeError` if a function is called more than `calls` times within `period` seconds.

**A:**

```python
import functools
import time
from collections import deque

def rate_limit(calls, period):
    """Allow at most `calls` calls in any `period`-second window."""
    def decorator(func):
        timestamps = deque()

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # Remove timestamps outside the current window
            while timestamps and now - timestamps[0] > period:
                timestamps.popleft()
            if len(timestamps) >= calls:
                raise RuntimeError(
                    f"{func.__name__} rate limit exceeded: "
                    f"max {calls} calls per {period}s"
                )
            timestamps.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(calls=3, period=1.0)
def send_message(text):
    print(f"Sending: {text}")

send_message("msg 1")   # OK
send_message("msg 2")   # OK
send_message("msg 3")   # OK
try:
    send_message("msg 4")   # RuntimeError: rate limit exceeded
except RuntimeError as e:
    print(e)
```

---

### Question 8 — Predict the Output

**Q:** What is printed?

```python
import functools

def deco(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Before {func.__name__}")
        result = func(*args, **kwargs)
        print(f"After {func.__name__}")
        return result
    return wrapper

@deco
def A():
    print("In A")
    B()

@deco
def B():
    print("In B")

A()
```

**A:**

```
Before A
In A
Before B
In B
After B
After A
```

`A()` is called → `wrapper(A)` runs → prints "Before A" → calls original `A` → prints "In A" → calls `B()` which is decorated → `wrapper(B)` runs → prints "Before B" → calls original `B` → prints "In B" → returns → prints "After B" → B's wrapper returns → A's original finishes → prints "After A".

---

## Quick Reference Cheat Sheet

```
┌──────────────────────────────────────────────────────────────────────┐
│              DECORATORS QUICK REFERENCE                             │
├──────────────────────────────────────────────────────────────────────┤
│  ANATOMY OF A DECORATOR                                             │
│                                                                     │
│  import functools                                                   │
│                                                                     │
│  def my_decorator(func):          # takes the function             │
│      @functools.wraps(func)       # preserves metadata             │
│      def wrapper(*args, **kwargs): # accepts any signature         │
│          # before logic                                             │
│          result = func(*args, **kwargs)  # call original           │
│          # after logic                                              │
│          return result            # return the result!             │
│      return wrapper               # return wrapper, NOT wrapper()  │
│                                                                     │
│  PARAMETERIZED DECORATOR (extra nesting layer)                     │
│                                                                     │
│  def my_decorator(param):         # factory: takes the param       │
│      def decorator(func):         # real decorator                 │
│          @functools.wraps(func)                                     │
│          def wrapper(*args, **kwargs):                              │
│              ...                                                    │
│          return wrapper                                             │
│      return decorator                                               │
│                                                                     │
├──────────────────────┬───────────────────────────────────────────── │
│ @ SYNTAX             │ EQUIVALENT TO                               │
├──────────────────────┼───────────────────────────────────────────── │
│ @deco                │ func = deco(func)                           │
│ @deco(arg)           │ func = deco(arg)(func)                      │
│ @A                   │ func = A(B(func))  ← B applied first        │
│ @B                   │                                             │
├──────────────────────┼───────────────────────────────────────────── │
│ BUILT-IN DECORATORS  │ PURPOSE                                     │
├──────────────────────┼───────────────────────────────────────────── │
│ @staticmethod        │ No implicit argument                        │
│ @classmethod         │ cls as first argument                       │
│ @property            │ Attribute-style access with getter/setter   │
│ @functools.wraps     │ Copy metadata from wrapped function         │
│ @functools.lru_cache │ Memoize with LRU eviction                   │
│ @functools.cache     │ Unbounded memoize (Python 3.9+)             │
│ @cached_property     │ Computed once per instance                  │
├──────────────────────┼───────────────────────────────────────────── │
│ CHECKLIST            │                                             │
├──────────────────────┼───────────────────────────────────────────── │
│ ALWAYS               │ Use @functools.wraps(func)                  │
│ ALWAYS               │ Use *args, **kwargs in wrapper              │
│ ALWAYS               │ return func(*args, **kwargs)                │
│ NEVER                │ Call func() when applying @decorator        │
│ NEVER                │ Put side-effectful code outside wrapper     │
└──────────────────────┴───────────────────────────────────────────── │

HOF vs DECORATOR
  Higher-Order Function: takes/returns functions (general concept)
  Decorator: a HOF specifically designed to wrap another function
             and add behaviour via the @ syntax
```

---

*End of Lesson — Higher-Order Functions & Decorators in Python*
*Codeverra — learn.codeverra.com*
