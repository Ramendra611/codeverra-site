# Python Exception Handling
### A Complete Lesson Plan & Reference Guide

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [What Are Exceptions?](#what-are-exceptions)
3. [The Exception Hierarchy](#the-exception-hierarchy)
4. [try / except — The Foundation](#try--except--the-foundation)
5. [else and finally Clauses](#else-and-finally-clauses)
6. [Raising Exceptions](#raising-exceptions)
7. [Custom Exceptions](#custom-exceptions)
8. [Exception Chaining](#exception-chaining)
9. [Context Managers and Exceptions](#context-managers-and-exceptions)
10. [Logging Exceptions](#logging-exceptions)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Real-Life Patterns](#real-life-patterns)
13. [Practice Questions & Answers](#practice-questions--answers)
14. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXCEPTION HANDLING FLOW                      │
│                                                                 │
│   try:                                                          │
│     ── risky code runs here ──────────────────────────────┐    │
│                                                           │    │
│   except SomeError:          ◄── exception caught here   │    │
│     ── handle it ──                                       │    │
│                                                           ▼    │
│   except (TypeError, ValueError):  ◄── multiple types        │
│     ── handle them ──                                          │
│                                                                 │
│   except Exception as e:    ◄── catch with reference          │
│     ── inspect e ──                                            │
│                                                                 │
│   else:                     ◄── runs ONLY if NO exception      │
│     ── success path ──                                         │
│                                                                 │
│   finally:                  ◄── ALWAYS runs, no matter what   │
│     ── cleanup ──                                              │
└─────────────────────────────────────────────────────────────────┘
```

> **Core Philosophy:** Exceptions are not bugs — they are Python's way of saying "something unexpected happened here, and I'm passing control to whoever knows how to handle it."

---

## What Are Exceptions?

An **exception** is a signal that something went wrong during program execution. When Python encounters an error it can't resolve, it **raises** (throws) an exception object and starts looking for a handler.

```python
# Without exception handling — program crashes
result = 10 / 0
print("This never prints")
# ZeroDivisionError: division by zero

# With exception handling — program recovers
try:
    result = 10 / 0
except ZeroDivisionError:
    result = float('inf')
    print("Caught division by zero, using infinity instead")

print(f"Result: {result}")   # Result: inf
```

### Errors vs Exceptions

In Python, **everything is an exception** — even errors. There's one key distinction:

| Type | Description | Example |
|------|-------------|---------|
| `SyntaxError` | Caught at parse time, before code runs | `if x ==` |
| `Exception` | Raised at runtime, can be caught | `1 / 0`, `int("abc")` |

```python
# SyntaxError — Python won't even run the file
# if x ==:   ← this fails before execution, cannot be caught by try/except

# RuntimeError — happens during execution, CAN be caught
try:
    x = int("not a number")
except ValueError as e:
    print(f"Caught: {e}")   # Caught: invalid literal for int() with base 10: 'not a number'
```

---

## The Exception Hierarchy

Python's built-in exceptions form a tree. Understanding this hierarchy is critical because **catching a parent catches all its children**.

```
BaseException
├── SystemExit            ← raised by sys.exit()
├── KeyboardInterrupt     ← raised by Ctrl+C
├── GeneratorExit         ← raised when generator is closed
└── Exception             ← base for all "normal" exceptions
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   ├── OverflowError
    │   └── FloatingPointError
    ├── AttributeError
    ├── ImportError
    │   └── ModuleNotFoundError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── NameError
    │   └── UnboundLocalError
    ├── OSError (IOError)
    │   ├── FileNotFoundError
    │   ├── PermissionError
    │   └── TimeoutError
    ├── TypeError
    ├── ValueError
    │   └── UnicodeError
    ├── RuntimeError
    │   └── RecursionError
    └── StopIteration
```

```python
# Catching a parent catches all children
try:
    my_list = [1, 2, 3]
    print(my_list[99])
except LookupError as e:
    print(f"LookupError caught: {type(e).__name__}: {e}")
    # LookupError caught: IndexError: list index out of range

# The same handler also catches KeyError (another LookupError child)
try:
    d = {"a": 1}
    print(d["z"])
except LookupError as e:
    print(f"LookupError caught: {type(e).__name__}: {e}")
    # LookupError caught: KeyError: 'z'
```

---

## try / except — The Foundation

### Basic Syntax

```python
try:
    # Code that might raise an exception
    risky_operation()
except ExceptionType:
    # Code that runs if ExceptionType is raised
    handle_the_problem()
```

### Catching Specific Exceptions

Always prefer catching specific exceptions over broad ones.

```python
def divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("Cannot divide by zero!")
        return None

print(divide(10, 2))    # 5.0
print(divide(10, 0))    # Cannot divide by zero! → None
```

### Catching Multiple Exception Types

```python
def parse_and_index(data, index):
    try:
        number = int(data[index])
        return number * 2
    except IndexError:
        print(f"Index {index} doesn't exist in the list.")
    except ValueError:
        print(f"'{data[index]}' cannot be converted to int.")
    except TypeError:
        print("Data must be a sequence.")

parse_and_index(["1", "two", "3"], 1)    # ValueError
parse_and_index(["1", "2", "3"],   5)    # IndexError
parse_and_index(None, 0)                  # TypeError
```

### Catching Multiple Exceptions in One Handler

```python
def safe_convert(value):
    try:
        return int(value)
    except (ValueError, TypeError) as e:
        print(f"Conversion failed: {e}")
        return 0

print(safe_convert("42"))     # 42
print(safe_convert("abc"))    # Conversion failed: ... → 0
print(safe_convert(None))     # Conversion failed: ... → 0
```

### Using `as e` — Inspecting the Exception

```python
# Every exception object has useful attributes
try:
    int("bad")
except ValueError as e:
    print(e.args)      # ("invalid literal for int() with base 10: 'bad'",)
    print(str(e))      # invalid literal for int() with base 10: 'bad'
    print(repr(e))     # ValueError("invalid literal for int() with base 10: 'bad'")
    print(type(e).__name__)  # ValueError
```

### The `except Exception` Catch-All (Use Carefully)

```python
# Acceptable when you log the error and re-raise or handle gracefully
def run_job(job_func):
    try:
        job_func()
    except Exception as e:
        print(f"Job failed: {type(e).__name__}: {e}")
        raise   # re-raise so the caller knows something went wrong
```

---

## else and finally Clauses

### The `else` Clause — Runs Only on Success

```python
def read_config(filepath):
    try:
        f = open(filepath, 'r')
    except FileNotFoundError:
        print(f"Config file not found: {filepath}")
        return {}
    else:
        # Only runs if open() succeeded — no exception was raised
        config = f.read()
        f.close()
        print("Config loaded successfully.")
        return config

# Why use else instead of putting code in try?
# Code in else is NOT protected by the except clause.
# If parsing raises an error, it won't be silently swallowed by the except above.
```

### The `finally` Clause — Always Runs

```python
def connect_to_db(host):
    connection = None
    try:
        connection = create_connection(host)    # might fail
        result = connection.query("SELECT 1")   # might fail
        return result
    except ConnectionError as e:
        print(f"Connection failed: {e}")
        return None
    finally:
        # Runs whether connection succeeded, failed, or even if we `return`
        if connection:
            connection.close()
            print("Connection closed.")
```

### All Four Clauses Together

```python
def process_file(filepath):
    file_handle = None
    try:
        file_handle = open(filepath, 'r')
        content = file_handle.read()
        data = parse(content)               # might raise ValueError
    except FileNotFoundError:
        print("File not found.")
        return None
    except ValueError as e:
        print(f"Parse error: {e}")
        return None
    else:
        print("File processed successfully.")
        return data
    finally:
        if file_handle:
            file_handle.close()             # ALWAYS close the file

# Execution flow:
# ✓ No exception  → try → else → finally
# ✗ FileNotFound  → try (partial) → except FileNotFoundError → finally
# ✗ ValueError    → try (partial) → except ValueError → finally
```

### `finally` Even Beats `return`

```python
def tricky():
    try:
        return "from try"
    finally:
        return "from finally"   # This OVERRIDES the try's return!

print(tricky())   # "from finally"
# Warning: avoid putting return in finally — it suppresses exceptions too
```

---

## Raising Exceptions

### `raise` — Raising a New Exception

```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f"Age must be an int, got {type(age).__name__}")
    if age < 0 or age > 150:
        raise ValueError(f"Age must be between 0 and 150, got {age}")
    return age

set_age(25)       # fine
set_age(-5)       # ValueError: Age must be between 0 and 150, got -5
set_age("old")    # TypeError: Age must be an int, got str
```

### `raise` Without Arguments — Re-raising

Inside an except block, bare `raise` re-raises the current exception unchanged, preserving the original traceback.

```python
def step_three():
    raise RuntimeError("Something broke in step 3")

def step_two():
    try:
        step_three()
    except RuntimeError as e:
        print(f"Logging error: {e}")
        raise   # re-raise the SAME exception with SAME traceback

def step_one():
    try:
        step_two()
    except RuntimeError as e:
        print(f"Step one caught: {e}")

step_one()
# Logging error: Something broke in step 3
# Step one caught: Something broke in step 3
```

### `raise ... from ...` — Exception Chaining

```python
def load_config(path):
    try:
        with open(path) as f:
            import json
            return json.load(f)
    except FileNotFoundError as e:
        raise RuntimeError(f"Cannot start app: config file missing") from e

try:
    load_config("missing.json")
except RuntimeError as e:
    print(e)               # Cannot start app: config file missing
    print(e.__cause__)     # [Errno 2] No such file or directory: 'missing.json'
```

---

## Custom Exceptions

### Why Create Custom Exceptions?

1. Give callers precise control over what they catch
2. Carry domain-specific context
3. Document your error taxonomy explicitly

### Basic Custom Exception

```python
class InsufficientFundsError(Exception):
    """Raised when a bank account has insufficient balance."""
    pass

class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner   = owner
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(
                f"{self.owner} only has Rs.{self.balance}, tried to withdraw Rs.{amount}"
            )
        self.balance -= amount
        return amount

account = BankAccount("Ravi", balance=500)
try:
    account.withdraw(1000)
except InsufficientFundsError as e:
    print(f"Transaction failed: {e}")
```

### Custom Exception with Extra Attributes

```python
class APIError(Exception):
    """Raised when an external API returns an unexpected response."""

    def __init__(self, message, status_code=None, endpoint=None):
        super().__init__(message)
        self.status_code = status_code
        self.endpoint    = endpoint

    def __str__(self):
        return (
            f"APIError [{self.status_code}] on {self.endpoint}: "
            f"{super().__str__()}"
        )

try:
    raise APIError("Rate limit exceeded", status_code=429, endpoint="/api/data")
except APIError as e:
    print(e)                    # APIError [429] on /api/data: Rate limit exceeded
    print(e.status_code)        # 429
    print(e.endpoint)           # /api/data
    if e.status_code == 429:
        print("Back off and retry later.")
```

### Exception Hierarchy for a Domain

Design a mini exception hierarchy for your application:

```python
# Base exception for the entire application
class AppError(Exception):
    """Base class for all application errors."""
    pass

# Category-level exceptions
class DatabaseError(AppError):
    """Any error related to database operations."""
    pass

class ValidationError(AppError):
    """Raised when user-provided data fails validation."""
    def __init__(self, field, message):
        self.field = field
        super().__init__(f"Validation failed on '{field}': {message}")

class AuthenticationError(AppError):
    """Raised when login or token verification fails."""
    pass

# Specific exceptions
class RecordNotFoundError(DatabaseError):
    def __init__(self, model, pk):
        super().__init__(f"{model} with id={pk} not found")

class DuplicateEntryError(DatabaseError):
    pass

class WeakPasswordError(ValidationError):
    def __init__(self):
        super().__init__("password", "Must be at least 8 characters with a digit")


# Usage
def get_user(user_id):
    if user_id != 1:
        raise RecordNotFoundError("User", user_id)
    return {"id": 1, "name": "Priya"}

try:
    user = get_user(99)
except RecordNotFoundError as e:
    print(e)    # User with id=99 not found
except DatabaseError as e:
    print(f"DB issue: {e}")   # catches any DatabaseError, including RecordNotFoundError
except AppError as e:
    print(f"App issue: {e}")  # catches everything in the app
```

---

## Exception Chaining

Python tracks the chain of exceptions so debugging is easier.

### Implicit Chaining (`__context__`)

When an exception is raised inside an `except` block, Python automatically links them:

```python
try:
    int("bad")
except ValueError:
    raise RuntimeError("processing failed")
# During handling of ValueError, RuntimeError was raised.
# The ValueError is stored as RuntimeError.__context__
```

### Explicit Chaining (`__cause__`) — `raise ... from`

```python
class ConfigError(Exception):
    pass

def load_settings(path):
    try:
        with open(path) as f:
            import json
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ConfigError(f"Invalid JSON in {path}") from e
    except FileNotFoundError as e:
        raise ConfigError(f"Settings file not found: {path}") from e

try:
    load_settings("settings.json")
except ConfigError as e:
    print(f"Config Error: {e}")
    if e.__cause__:
        print(f"Caused by: {type(e.__cause__).__name__}: {e.__cause__}")
```

### Suppressing the Chain — `raise ... from None`

```python
def get_value(d, key):
    try:
        return d[key]
    except KeyError:
        raise ValueError(f"Key '{key}' is not valid") from None
        # Hides the KeyError from the traceback — cleaner user-facing error

try:
    get_value({"a": 1}, "z")
except ValueError as e:
    print(e)   # Key 'z' is not valid  (no KeyError traceback shown)
```

---

## Context Managers and Exceptions

### `with` Statement — The Right Way to Handle Resources

```python
# Without context manager
f = None
try:
    f = open("data.txt", "r")
    content = f.read()
finally:
    if f:
        f.close()

# With context manager — identical behavior, much cleaner
with open("data.txt", "r") as f:
    content = f.read()
# f.close() is called automatically, even on exception
```

### Writing a Custom Context Manager with `__enter__` / `__exit__`

```python
class ManagedTransaction:
    """A database transaction that commits on success and rolls back on error."""

    def __init__(self, connection):
        self.connection = connection

    def __enter__(self):
        print("BEGIN TRANSACTION")
        return self   # value bound to the `as` variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            print("COMMIT")
        else:
            print(f"ROLLBACK — caused by {exc_type.__name__}: {exc_val}")
        return False   # False = do NOT suppress the exception
        # Return True to suppress it silently

class FakeConnection:
    pass

conn = FakeConnection()

# Successful transaction
with ManagedTransaction(conn) as txn:
    print("Doing work...")
# Output: BEGIN TRANSACTION → Doing work... → COMMIT

# Failed transaction
try:
    with ManagedTransaction(conn) as txn:
        print("Doing work...")
        raise ValueError("Something went wrong!")
except ValueError:
    pass
# Output: BEGIN TRANSACTION → Doing work... → ROLLBACK — caused by ValueError
```

### Context Manager with `contextlib`

```python
from contextlib import contextmanager, suppress

# Generator-based context manager
@contextmanager
def timer(label):
    import time
    start = time.perf_counter()
    try:
        yield   # code inside `with` block runs here
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("Data processing"):
    total = sum(range(10_000_000))


# contextlib.suppress — silently ignore specific exceptions
with suppress(FileNotFoundError):
    import os
    os.remove("maybe_exists.txt")   # No error if file doesn't exist
# Equivalent to:
# try:
#     os.remove(...)
# except FileNotFoundError:
#     pass
```

---

## Logging Exceptions

In production, you should **log exceptions**, not just print them.

```python
import logging
import traceback

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)


def process_order(order_id):
    try:
        # ... order logic ...
        pass
    except ValueError as e:
        logger.warning(f"Invalid order {order_id}: {e}")
        return {"status": "rejected", "reason": str(e)}
    except Exception as e:
        # exc_info=True attaches the full traceback to the log record
        logger.error(f"Unexpected error processing order {order_id}", exc_info=True)
        raise   # re-raise so the caller knows something went wrong


# Capturing full traceback as a string
try:
    int("bad")
except ValueError:
    tb = traceback.format_exc()
    print(tb)   # Full formatted traceback as a string
    # Useful for sending to a monitoring system like Sentry
```

---

## Common Mistakes to Avoid

### Mistake 1 — Bare `except` (Catches Everything Including KeyboardInterrupt)

```python
# BAD — catches Ctrl+C, SystemExit, and all runtime errors silently
try:
    do_something()
except:
    pass   # BUG: you have silenced KeyboardInterrupt and SystemExit!

# GOOD — catch only what you expect
try:
    do_something()
except ValueError:
    pass
```

### Mistake 2 — Swallowing Exceptions Silently

```python
# BAD — errors disappear, debugging becomes a nightmare
try:
    result = complex_calculation()
except Exception:
    pass   # What went wrong? Nobody will ever know.

# GOOD — at minimum, log it
try:
    result = complex_calculation()
except Exception as e:
    logger.error(f"Calculation failed: {e}", exc_info=True)
    result = default_value
```

### Mistake 3 — Using Exceptions for Normal Flow Control

```python
# UNNECESSARY — using exceptions as a substitute for if/else
def get_discount(user):
    try:
        return user["discount"]
    except KeyError:
        return 0

# BETTER — use dict.get() when the key might legitimately be absent
def get_discount(user):
    return user.get("discount", 0)

# NOTE: Python EAFP style (try/except) IS preferred for cases where
# you expect the key to usually exist. Use judgment based on frequency.
```

### Mistake 4 — Catching a Broad Exception Instead of the Specific One

```python
# BAD — catching Exception when you only expect ValueError
def parse_age(text):
    try:
        return int(text)
    except Exception:   # hides MemoryError, AttributeError, etc.
        return -1

# GOOD
def parse_age(text):
    try:
        return int(text)
    except ValueError:
        return -1
```

### Mistake 5 — Too Much Code in a Single try Block

```python
# BAD — which line raised the ValueError?
try:
    age   = int(data["age"])
    score = float(data["score"])
    result = compute(age, score)
    save_to_db(result)
except ValueError:
    print("Something failed...")    # impossible to tell where

# GOOD — narrow try blocks, specific messages
def safe_parse(data):
    try:
        age = int(data["age"])
    except ValueError:
        raise ValueError(f"'age' must be a number, got: {data['age']!r}")

    try:
        score = float(data["score"])
    except ValueError:
        raise ValueError(f"'score' must be a decimal, got: {data['score']!r}")

    return age, score
```

### Mistake 6 — Wrong Exception Order (General Before Specific)

```python
# BAD — ValueError is never reached
try:
    int("abc")
except Exception as e:
    print("General handler")   # always runs
except ValueError as e:        # DEAD CODE — never reached
    print("ValueError handler")

# GOOD — most specific first, most general last
try:
    int("abc")
except ValueError as e:
    print(f"ValueError: {e}")
except TypeError as e:
    print(f"TypeError: {e}")
except Exception as e:
    print(f"Unexpected: {e}")
```

### Mistake 7 — Raising an Exception Inside `finally`

```python
# TRICKY: An exception in finally silently replaces the original exception
def buggy():
    try:
        raise ValueError("original error")
    finally:
        raise RuntimeError("cleanup error")   # Replaces the ValueError!

try:
    buggy()
except RuntimeError as e:
    print(e)   # "cleanup error" — the ValueError is completely lost!

# GOOD — keep finally clean; wrap risky cleanup in its own try
def safe():
    try:
        raise ValueError("original error")
    finally:
        try:
            risky_cleanup()
        except Exception as cleanup_err:
            logger.warning(f"Cleanup failed: {cleanup_err}")
        # Original ValueError still propagates normally
```

### Mistake 8 — Raising the Base `Exception` Class

```python
# BAD — generic, unhelpful, hard to catch specifically
def set_username(name):
    if not name:
        raise Exception("Bad input")   # How should callers catch this?

# GOOD — use the most specific built-in or a custom exception
def set_username(name):
    if not isinstance(name, str):
        raise TypeError(f"Username must be str, not {type(name).__name__}")
    if not name.strip():
        raise ValueError("Username cannot be empty or whitespace")
```

---

## Real-Life Patterns

### Pattern 1 — Retry Logic with Exponential Backoff

```python
import time
import random

def with_retry(func, max_attempts=3, base_delay=1.0, exceptions=(Exception,)):
    """
    Calls `func` up to `max_attempts` times.
    Waits exponentially longer between retries.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except exceptions as e:
            if attempt == max_attempts:
                raise   # give up, re-raise the last exception
            delay = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
            print(f"Attempt {attempt} failed: {e}. Retrying in {delay:.2f}s...")
            time.sleep(delay)


# Usage
call_count = 0
def flaky_api_call():
    global call_count
    call_count += 1
    if call_count < 3:
        raise ConnectionError("Server not responding")
    return {"data": "success"}

result = with_retry(flaky_api_call, max_attempts=5, exceptions=(ConnectionError,))
print(result)   # {'data': 'success'} on the 3rd attempt
```

### Pattern 2 — Result Object (No Exception Propagation Across Layers)

```python
from dataclasses import dataclass
from typing import Any, Optional

@dataclass
class Result:
    """Encapsulates success/failure without raising exceptions across layers."""
    success: bool
    value:   Any = None
    error:   Optional[str] = None

    @classmethod
    def ok(cls, value):
        return cls(success=True, value=value)

    @classmethod
    def fail(cls, error):
        return cls(success=False, error=error)


def divide(a, b) -> Result:
    try:
        return Result.ok(a / b)
    except ZeroDivisionError as e:
        return Result.fail(str(e))

r = divide(10, 2)
if r.success:
    print(f"Result: {r.value}")   # Result: 5.0

r = divide(10, 0)
if not r.success:
    print(f"Failed: {r.error}")   # Failed: division by zero
```

### Pattern 3 — Validation with Accumulated Errors

```python
class MultiValidationError(Exception):
    def __init__(self, errors):
        self.errors = errors
        super().__init__(f"{len(errors)} validation error(s): {'; '.join(errors)}")

def validate_user(data):
    errors = []

    if not data.get("name"):
        errors.append("Name is required")
    elif len(data["name"]) < 2:
        errors.append("Name must be at least 2 characters")

    if not data.get("email") or "@" not in data.get("email", ""):
        errors.append("A valid email is required")

    age = data.get("age")
    if age is None:
        errors.append("Age is required")
    elif not isinstance(age, int) or age < 0 or age > 120:
        errors.append("Age must be an integer between 0 and 120")

    if errors:
        raise MultiValidationError(errors)

    return True


try:
    validate_user({"name": "A", "email": "notanemail", "age": -5})
except MultiValidationError as e:
    for err in e.errors:
        print(f"  - {err}")
# - Name must be at least 2 characters
# - A valid email is required
# - Age must be an integer between 0 and 120
```

### Pattern 4 — Safe Resource Cleanup with contextlib

```python
from contextlib import contextmanager

@contextmanager
def managed_resource(name):
    """Generic resource manager with exception-safe cleanup."""
    resource = None
    try:
        print(f"Acquiring {name}...")
        resource = acquire(name)    # your resource acquisition logic
        yield resource
    except Exception as e:
        print(f"Error while using {name}: {e}")
        raise
    finally:
        if resource:
            print(f"Releasing {name}...")
            release(resource)

with managed_resource("database_connection") as db:
    db.query("SELECT * FROM users")
```

---

## Practice Questions & Answers

---

### Question 1 — Predict the Output

**Q:** What is the output of the following code?

```python
try:
    print("A")
    x = 1 / 0
    print("B")
except ZeroDivisionError:
    print("C")
else:
    print("D")
finally:
    print("E")
```

**A:**

```
A
C
E
```

`"A"` prints, then `ZeroDivisionError` is raised so `"B"` is skipped. The `except` block prints `"C"`. The `else` block is **skipped** because an exception occurred. The `finally` block always runs, printing `"E"`.

---

### Question 2 — Fix the Bug

**Q:** What is wrong with this code? Fix it.

```python
try:
    result = int(input("Enter a number: "))
except Exception:
    print("Error!")
except ValueError:
    print("Not a number!")
```

**A:**

The `except Exception` appears before `except ValueError`. Since `ValueError` is a subclass of `Exception`, it will always be caught by the first handler — the `ValueError` branch is dead code and will never execute.

```python
# Fixed: most specific first
try:
    result = int(input("Enter a number: "))
except ValueError:
    print("Not a number!")
except Exception as e:
    print(f"Unexpected error: {e}")
```

---

### Question 3 — Custom Exception

**Q:** Create a `TemperatureError` exception. Write `set_temperature(temp)` that raises it if `temp` is below -273.15 (absolute zero). The exception should include the invalid value in its message.

**A:**

```python
class TemperatureError(ValueError):
    """Raised when a physically impossible temperature is provided."""
    ABSOLUTE_ZERO = -273.15

    def __init__(self, temp):
        self.temp = temp
        super().__init__(
            f"{temp}C is below absolute zero ({self.ABSOLUTE_ZERO}C)"
        )

def set_temperature(temp):
    if temp < TemperatureError.ABSOLUTE_ZERO:
        raise TemperatureError(temp)
    return temp

try:
    set_temperature(-300)
except TemperatureError as e:
    print(e)          # -300C is below absolute zero (-273.15C)
    print(e.temp)     # -300
```

---

### Question 4 — `finally` Guarantee

**Q:** Write `safe_open(filepath)` that opens a file, reads its content, and **always** closes the handle regardless of what goes wrong.

**A:**

```python
def safe_open(filepath):
    f = None
    try:
        f = open(filepath, 'r', encoding='utf-8')
        return f.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return None
    except PermissionError:
        print(f"No permission to read: {filepath}")
        return None
    finally:
        if f is not None:
            f.close()
            print(f"File '{filepath}' closed.")

# Even better: use a context manager which handles this automatically
def safe_open_v2(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return None
```

---

### Question 5 — Exception Chaining

**Q:** Write `load_user_age(data, key)` that looks up a key in a dict and converts it to int. Raise a clear `ValueError` if it fails, and chain the original exception.

**A:**

```python
def load_user_age(data, key):
    try:
        raw = data[key]
    except KeyError as e:
        raise ValueError(f"Missing required field: '{key}'") from e

    try:
        return int(raw)
    except (ValueError, TypeError) as e:
        raise ValueError(
            f"Field '{key}' must be a valid integer, got: {raw!r}"
        ) from e

try:
    load_user_age({"age": "not_a_number"}, "age")
except ValueError as e:
    print(e)           # Field 'age' must be a valid integer, got: 'not_a_number'
    print(e.__cause__) # invalid literal for int() with base 10: 'not_a_number'
```

---

### Question 6 — Context Manager

**Q:** Write a context manager class `SuppressAndLog` that suppresses given exception types and prints a log line instead of crashing.

**A:**

```python
class SuppressAndLog:
    def __init__(self, *exception_types, message="Exception suppressed"):
        self.exception_types = exception_types
        self.message         = message

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type and issubclass(exc_type, self.exception_types):
            print(f"[LOG] {self.message}: {exc_type.__name__}: {exc_val}")
            return True    # suppress the exception
        return False        # re-raise anything else

with SuppressAndLog(ZeroDivisionError, message="Math error caught"):
    result = 1 / 0     # [LOG] Math error caught: ZeroDivisionError: division by zero

print("Program continues normally.")
```

---

### Question 7 — Accumulate Multiple Errors

**Q:** Write `extract_fields(record, *fields)` that extracts multiple keys from a dict. Collect all missing fields into a single `KeyError` instead of failing on the first one.

**A:**

```python
def extract_fields(record, *fields):
    result  = {}
    missing = []
    for field in fields:
        if field in record:
            result[field] = record[field]
        else:
            missing.append(field)
    if missing:
        raise KeyError(f"Missing required fields: {missing}")
    return result

data = {"name": "Arjun", "email": "arjun@example.com"}

try:
    info = extract_fields(data, "name", "email", "age", "phone")
except KeyError as e:
    print(e)   # "Missing required fields: ['age', 'phone']"
```

---

### Question 8 — Tricky: Predict the Output

**Q:** What does this print?

```python
def foo():
    try:
        return 1
    finally:
        return 2

def bar():
    try:
        raise ValueError("oops")
    except ValueError:
        return 3
    finally:
        print("finally in bar")

print(foo())
print(bar())
```

**A:**

```
2
finally in bar
3
```

In `foo()`: the `try` block queues return value `1`, but `finally` runs before delivery and its `return 2` overrides it. `foo()` returns `2`.

In `bar()`: `ValueError` is caught, `return 3` is queued. `finally` runs first and prints `"finally in bar"`. Then `bar()` returns `3`.

---

### Question 9 — Retry Decorator

**Q:** Write a `@retry(times=3)` decorator that retries a function up to `times` attempts before letting the exception propagate.

**A:**

```python
import functools

def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"Attempt {attempt}/{times} failed: {e}")
            raise last_exception   # all attempts exhausted
        return wrapper
    return decorator


attempt_count = 0

@retry(times=3)
def unstable_function():
    global attempt_count
    attempt_count += 1
    if attempt_count < 3:
        raise ConnectionError("Not ready yet")
    return "Success!"

print(unstable_function())
# Attempt 1/3 failed: Not ready yet
# Attempt 2/3 failed: Not ready yet
# Success!
```

---

## Quick Reference Cheat Sheet

```
┌──────────────────────────────────────────────────────────────────────┐
│               EXCEPTION HANDLING QUICK REFERENCE                    │
├───────────────────────┬──────────────────────────────────────────────┤
│ CLAUSE                │ WHEN IT RUNS                                 │
├───────────────────────┼──────────────────────────────────────────────┤
│ try                   │ Always (starts here)                         │
│ except ExcType        │ Only if ExcType (or subclass) was raised     │
│ except (A, B) as e    │ If A or B was raised; e = exception object   │
│ else                  │ Only if NO exception was raised in try       │
│ finally               │ ALWAYS — even after return or exception      │
├───────────────────────┼──────────────────────────────────────────────┤
│ KEYWORD               │ PURPOSE                                      │
├───────────────────────┼──────────────────────────────────────────────┤
│ raise ExcType(msg)    │ Raise a new exception                        │
│ raise                 │ Re-raise current exception (same traceback)  │
│ raise B from A        │ Chain: B caused by A (A stored as __cause__) │
│ raise B from None     │ Suppress original exception from traceback   │
├───────────────────────┼──────────────────────────────────────────────┤
│ BEST PRACTICES                                                       │
├───────────────────────┬──────────────────────────────────────────────┤
│ DO                    │ Catch specific exceptions                    │
│ DO                    │ Keep try blocks narrow                       │
│ DO                    │ Use finally for cleanup                      │
│ DO                    │ Log before swallowing                        │
│ DO                    │ Create custom exceptions for your domain     │
│ DO                    │ Use raise...from to chain exceptions         │
│ AVOID                 │ Bare except:                                 │
│ AVOID                 │ Silently passing on Exception                │
│ AVOID                 │ return inside finally                        │
│ AVOID                 │ Ordering general handlers before specific    │
└───────────────────────┴──────────────────────────────────────────────┘

EXCEPTION OBJECT ATTRIBUTES
  e.args           → tuple of arguments passed to the exception
  e.__cause__      → explicitly chained exception (raise B from A)
  e.__context__    → implicitly chained exception
  e.__traceback__  → traceback object

USEFUL STDLIB TOOLS
  traceback.format_exc()       → current traceback as string
  traceback.print_exc()        → print current traceback to stderr
  contextlib.suppress(ExcType) → silently ignore an exception
  logging.exception(msg)       → log message + full traceback
```

---

*End of Lesson — Exception Handling in Python*
*Codeverra — codeverra.com*
