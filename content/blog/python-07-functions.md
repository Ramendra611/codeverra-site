---
title: "Functions in Python - Complete Guide"
description: "Learn everything about writing fcuntions in Python"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python

cover:
  image: "/images/functions.png"
  alt: "file handling in python"
  caption: "file handling in python"
  relative: true
  hidden: false
---


# Python Functions Masterclass
### A Complete Guide from Basics to Advanced Concepts

---

> Who is this for?
> You know Python basics and have some experience with loops and collections.
> This guide covers every important concept around functions in Python -- from defining your first function
> all the way through decorators and closures. Every concept is explained with a simple example first.

---

## Table of Contents

1. [What is a Function and Why Use One?](#1-what-is-a-function-and-why-use-one)
2. [Defining and Calling Functions](#2-defining-and-calling-functions)
3. [Parameters and Arguments](#3-parameters-and-arguments)
4. [Default Parameters](#4-default-parameters)
5. [*args -- Variable Positional Arguments](#5-args----variable-positional-arguments)
6. [**kwargs -- Variable Keyword Arguments](#6-kwargs----variable-keyword-arguments)
7. [Combining All Argument Types](#7-combining-all-argument-types)
8. [Return Values](#8-return-values)
9. [Scope and the LEGB Rule](#9-scope-and-the-legb-rule)
10. [global and nonlocal Keywords](#10-global-and-nonlocal-keywords)
11. [Docstrings and Function Annotations](#11-docstrings-and-function-annotations)
12. [Lambda Functions](#12-lambda-functions)
13. [Higher Order Functions](#13-higher-order-functions)
14. [map(), filter(), and reduce()](#14-map-filter-and-reduce)
15. [Closures](#15-closures)
16. [Decorators](#16-decorators)
17. [Decorators with Arguments](#17-decorators-with-arguments)
18. [Chaining Multiple Decorators](#18-chaining-multiple-decorators)
19. [Recursion](#19-recursion)
20. [Generator Functions and yield](#20-generator-functions-and-yield)
21. [Practice Questions](#21-practice-questions)
22. [Solutions](#22-solutions)
23. [What We Covered and What is Next](#23-what-we-covered-and-what-is-next)

---

## 1. What is a Function and Why Use One?

Imagine you need to calculate GST on product prices in three different parts of your program. Without a function, you write the same calculation three times. If the GST rate changes, you update it in three places -- and likely miss one.

A function lets you write that logic once, name it, and call it wherever you need it.

```python
# Without a function -- repeated logic
price1_with_gst = 299 * 1.18
price2_with_gst = 499 * 1.18
price3_with_gst = 999 * 1.18

# With a function -- write once, use anywhere
def add_gst(price):
    return round(price * 1.18, 2)

price1_with_gst = add_gst(299)
price2_with_gst = add_gst(499)
price3_with_gst = add_gst(999)
```

Functions give you:

- Reusability -- write once, call many times
- Readability -- give a name to a block of logic
- Testability -- test one piece of behavior in isolation
- Maintainability -- change the logic in one place only

---

## 2. Defining and Calling Functions

### Basic Syntax

```python
def function_name(parameters):
    """Optional docstring describing what the function does."""
    # function body
    return value   # optional
```

The `def` keyword starts the definition. The body is indented. The function does nothing until you call it.

```python
def greet(name):
    message = f"Namaste, {name}!"
    print(message)

# Calling the function
greet("Aarav")     # Namaste, Aarav!
greet("Priya")     # Namaste, Priya!
greet("Rohan")     # Namaste, Rohan!
```

### Functions are Objects

In Python, functions are first-class objects. You can assign them to variables, store them in lists, and pass them to other functions.

```python
def say_hello():
    print("Hello!")

# Assign to a variable -- no parentheses, we are not calling it
greeting = say_hello

greeting()   # Hello!  -- now calling it through the variable
```

---

## 3. Parameters and Arguments

A **parameter** is the variable name in the function definition.
An **argument** is the actual value you pass when calling the function.

```python
#          parameter
def square(number):
    return number ** 2

#        argument
result = square(7)   # 49
```

### Positional Arguments

By default, arguments are matched to parameters by their position.

```python
def describe_player(name, team, runs):
    print(f"{name} plays for {team} and has scored {runs} runs.")

describe_player("Kohli", "RCB", 639)
# Kohli plays for RCB and has scored 639 runs.

# Order matters -- swap and you get wrong results
describe_player("RCB", 639, "Kohli")
# RCB plays for 639 and has scored Kohli runs.  <-- wrong
```

### Keyword Arguments

You can name arguments explicitly when calling -- order no longer matters.

```python
describe_player(runs=639, name="Kohli", team="RCB")
# Kohli plays for RCB and has scored 639 runs.  <-- correct
```

You can mix positional and keyword arguments, but positional arguments must come first.

```python
describe_player("Kohli", runs=639, team="RCB")   # valid
describe_player(name="Kohli", "RCB", 639)          # SyntaxError -- keyword before positional
```

---

## 4. Default Parameters

A default parameter has a pre-set value that is used when the caller does not provide that argument.

```python
def create_profile(name, city="Bangalore", role="Student"):
    print(f"{name} | {city} | {role}")

create_profile("Aarav")                         # Aarav | Bangalore | Student
create_profile("Priya", "Mumbai")               # Priya | Mumbai    | Student
create_profile("Rohan", "Delhi", "Engineer")    # Rohan | Delhi     | Engineer
create_profile("Sneha", role="Manager")         # Sneha | Bangalore | Manager
```

### The Mutable Default Argument Trap

Never use a mutable object (list, dict) as a default argument. It is created once when the function is defined, not each time the function is called.

```python
# WRONG -- the list is shared across all calls
def add_score(player, scores=[]):
    scores.append(player)
    return scores

print(add_score("Rohit"))    # ['Rohit']
print(add_score("Kohli"))    # ['Rohit', 'Kohli']  <-- unexpected!
print(add_score("Dhoni"))    # ['Rohit', 'Kohli', 'Dhoni']  <-- still growing!

# CORRECT -- use None and create a fresh list inside
def add_score(player, scores=None):
    if scores is None:
        scores = []
    scores.append(player)
    return scores

print(add_score("Rohit"))    # ['Rohit']
print(add_score("Kohli"))    # ['Kohli']   <-- fresh list each time
```

---

## 5. *args -- Variable Positional Arguments

`*args` lets a function accept any number of positional arguments. Inside the function, `args` is a tuple.

```python
def total_runs(*scores):
    print(type(scores))   # <class 'tuple'>
    return sum(scores)

print(total_runs(45, 82, 67))          # 194
print(total_runs(10, 20, 30, 40, 50))  # 150
print(total_runs(100))                 # 100
```

```python
# Mix of fixed and variable arguments
def match_summary(team, *scores):
    total = sum(scores)
    print(f"{team} scored: {scores}")
    print(f"Total: {total}")

match_summary("India", 45, 0, 6, 82, 37, 54)
# India scored: (45, 0, 6, 82, 37, 54)
# Total: 224
```

> The name `args` is a convention. The star `*` is what matters. You could write `*numbers` or `*values` -- it works the same way.

### Unpacking with * when calling

The `*` operator can also unpack a list/tuple into positional arguments.

```python
def add(a, b, c):
    return a + b + c

numbers = [10, 20, 30]
print(add(*numbers))   # 60  -- unpacks list into three arguments
```

---

## 6. **kwargs -- Variable Keyword Arguments

`**kwargs` lets a function accept any number of keyword arguments. Inside the function, `kwargs` is a dictionary.

```python
def print_profile(**details):
    print(type(details))   # <class 'dict'>
    for key, value in details.items():
        print(f"  {key}: {value}")

print_profile(name="Aarav", city="Delhi", score=88)
# name: Aarav
# city: Delhi
# score: 88

print_profile(name="Priya", team="RCB", matches=16, runs=639)
# name: Priya
# team: RCB
# matches: 16
# runs: 639
```

```python
# Practical use -- build a configuration dict
def create_order(product, **options):
    order = {"product": product}
    order.update(options)
    return order

order = create_order("Laptop", color="Silver", warranty="2yr", delivery="express")
print(order)
# {'product': 'Laptop', 'color': 'Silver', 'warranty': '2yr', 'delivery': 'express'}
```

### Unpacking with ** when calling

```python
def greet(name, city, role):
    print(f"{name} from {city} is a {role}")

user = {"name": "Rohan", "city": "Mumbai", "role": "Engineer"}
greet(**user)   # Rohan from Mumbai is a Engineer
```

---

## 7. Combining All Argument Types

Python allows all four argument types in one function. The order must be:

```
def func(positional, default, *args, keyword_only, **kwargs)
```

```python
def register(name, city="Unknown", *scores, role, **extras):
    print(f"Name     : {name}")
    print(f"City     : {city}")
    print(f"Scores   : {scores}")
    print(f"Role     : {role}")
    print(f"Extras   : {extras}")

register("Aarav", "Delhi", 88, 92, 85, role="Student", batch="2024", section="A")
# Name     : Aarav
# City     : Delhi
# Scores   : (88, 92, 85)
# Role     : Student
# Extras   : {'batch': '2024', 'section': 'A'}
```

### Keyword-Only Arguments

Any parameter after `*args` (or a bare `*`) can only be passed as a keyword argument.

```python
def send_email(to, subject, *, cc=None, bcc=None):
    print(f"To: {to}, Subject: {subject}, CC: {cc}, BCC: {bcc}")

send_email("aarav@example.com", "Hello", cc="priya@example.com")
# send_email("a@b.com", "Hi", "c@d.com")  --> TypeError: too many positional args
```

### Positional-Only Arguments (Python 3.8+)

Parameters before `/` can only be passed positionally, not by keyword.

```python
def add(a, b, /):
    return a + b

add(3, 5)          # 8  -- fine
add(a=3, b=5)      # TypeError -- cannot use keyword for positional-only params
```

---

## 8. Return Values

The `return` statement sends a value back to the caller and exits the function immediately.

### Returning Nothing

A function with no `return` statement (or bare `return`) returns `None`.

```python
def say_hi():
    print("Hi!")

result = say_hi()
print(result)   # None
```

### Returning Multiple Values

Python returns multiple values as a tuple.

```python
def score_stats(scores):
    return min(scores), max(scores), sum(scores) / len(scores)

low, high, avg = score_stats([45, 88, 72, 91, 60])
print(f"Low: {low}, High: {high}, Avg: {avg}")
# Low: 45, High: 91, Avg: 71.2
```

### Early Return

`return` exits the function immediately. Useful to handle edge cases first.

```python
def safe_divide(a, b):
    if b == 0:
        return None   # exit early
    return a / b

print(safe_divide(10, 2))    # 5.0
print(safe_divide(10, 0))    # None
```

### Returning Different Types Based on Condition

```python
def find_player(name, players):
    for i, player in enumerate(players):
        if player["name"] == name:
            return player   # return dict if found
    return None             # return None if not found

squad = [
    {"name": "Rohit",  "role": "Batsman"},
    {"name": "Bumrah", "role": "Bowler"},
]

result = find_player("Bumrah", squad)
if result:
    print(result["role"])   # Bowler
```

---

## 9. Scope and the LEGB Rule

**Scope** defines where a variable is accessible. Python looks up variables in this order:

```
L -- Local       : inside the current function
E -- Enclosing   : inside any enclosing function (for nested functions)
G -- Global      : at the module (file) level
B -- Built-in    : Python's built-in names (len, print, range, etc.)
```

This is called the **LEGB rule**.

```python
x = "global"        # Global scope

def outer():
    x = "enclosing"  # Enclosing scope

    def inner():
        x = "local"  # Local scope
        print(x)     # "local" -- finds it in Local first

    inner()
    print(x)         # "enclosing" -- Local is gone after inner() ends

outer()
print(x)             # "global" -- Enclosing is gone after outer() ends
```

### Local vs Global

A variable created inside a function is local -- it cannot be seen outside.

```python
def calculate():
    result = 100    # local variable
    print(result)

calculate()         # 100
print(result)       # NameError: name 'result' is not defined
```

A function can READ a global variable without any special syntax.

```python
tax_rate = 0.18     # global

def calculate_tax(price):
    return price * tax_rate   # reads global -- this is fine

print(calculate_tax(1000))   # 180.0
```

---

## 10. global and nonlocal Keywords

### global

To MODIFY a global variable inside a function, declare it with `global`.

```python
counter = 0

def increment():
    global counter      # tell Python: use the global variable
    counter += 1

increment()
increment()
increment()
print(counter)   # 3
```

Without `global`, Python creates a new local variable instead of modifying the global one.

```python
counter = 0

def increment():
    counter += 1    # UnboundLocalError -- Python sees assignment and treats counter as local
                    # but it hasn't been assigned locally yet

increment()
```

> Use `global` sparingly. Modifying global state from inside functions makes code hard to reason about. Prefer returning a new value and reassigning it at the call site.

### nonlocal

`nonlocal` is used in nested functions to modify a variable from the enclosing (but not global) scope.

```python
def make_counter():
    count = 0                # enclosing scope variable

    def increment():
        nonlocal count       # refer to enclosing scope's count
        count += 1
        return count

    return increment

counter = make_counter()
print(counter())   # 1
print(counter())   # 2
print(counter())   # 3
```

---

## 11. Docstrings and Function Annotations

### Docstrings

A docstring is a string literal placed immediately after the `def` line. It documents what the function does.

```python
def add_gst(price, rate=0.18):
    """
    Calculate price after adding GST.

    Parameters
    ----------
    price : float
        The base price of the product.
    rate : float, optional
        GST rate as a decimal. Default is 0.18 (18%).

    Returns
    -------
    float
        The price including GST, rounded to 2 decimal places.

    Example
    -------
    >>> add_gst(1000)
    1180.0
    >>> add_gst(1000, rate=0.05)
    1050.0
    """
    return round(price * (1 + rate), 2)

# Access the docstring
print(add_gst.__doc__)
help(add_gst)
```

### Function Annotations (Type Hints)

Annotations document the expected types of parameters and return values. Python does not enforce them at runtime -- they are hints for developers and tools.

```python
def calculate_emi(principal: float, rate: float, months: int) -> float:
    """Calculate monthly EMI for a loan."""
    monthly_rate = rate / 12 / 100
    emi = principal * monthly_rate / (1 - (1 + monthly_rate) ** -months)
    return round(emi, 2)

print(calculate_emi(500000, 8.5, 60))   # Monthly EMI for 5 lakh at 8.5% for 5 years

# Access annotations
print(calculate_emi.__annotations__)
# {'principal': <class 'float'>, 'rate': <class 'float'>, 'months': <class 'int'>, 'return': <class 'float'>}
```

---

## 12. Lambda Functions

A lambda is a small, anonymous function defined in a single expression. It is not a replacement for `def` -- it is useful for short throwaway functions, especially when passing a function as an argument.

### Syntax

```python
lambda parameters: expression
```

```python
# Regular function
def square(x):
    return x ** 2

# Equivalent lambda
square = lambda x: x ** 2

print(square(5))   # 25
```

```python
# Lambda with multiple parameters
add = lambda a, b: a + b
print(add(10, 20))   # 30

# Lambda with condition
classify = lambda score: "Pass" if score >= 60 else "Fail"
print(classify(75))   # Pass
print(classify(45))   # Fail
```

### Where Lambdas Shine -- as Arguments

```python
players = [
    {"name": "Rohit",    "runs": 440},
    {"name": "Kohli",    "runs": 639},
    {"name": "Shubman",  "runs": 520},
    {"name": "Jadeja",   "runs": 180},
]

# Sort by runs using a lambda as the key
sorted_players = sorted(players, key=lambda p: p["runs"], reverse=True)
for p in sorted_players:
    print(f"{p['name']}: {p['runs']}")
# Kohli: 639
# Shubman: 520
# Rohit: 440
# Jadeja: 180
```

```python
# Sort a list of tuples by second element
scores = [("Aarav", 85), ("Priya", 92), ("Rohan", 78)]
scores.sort(key=lambda x: x[1])
print(scores)   # [('Rohan', 78), ('Aarav', 85), ('Priya', 92)]
```

### Lambda Limitations

- Only one expression (no statements, no `if` blocks, no loops)
- No docstring
- Harder to debug (shows up as `<lambda>` in tracebacks)

When the logic is more than one expression, use a regular `def` function.

---

## 13. Higher Order Functions

A **higher order function** is a function that either:
1. Takes another function as an argument, or
2. Returns a function as its result

This is possible because Python treats functions as first-class objects.

### Functions that Take Functions as Arguments

```python
def apply_twice(func, value):
    """Apply a function to a value, then apply it again to the result."""
    return func(func(value))

def double(x):
    return x * 2

print(apply_twice(double, 3))    # double(double(3)) = double(6) = 12
print(apply_twice(double, 10))   # double(double(10)) = double(20) = 40
```

```python
# A flexible discount applier
def apply_discount(prices, discount_fn):
    return [discount_fn(p) for p in prices]

def festival_discount(price):
    return price * 0.80   # 20% off

def loyalty_discount(price):
    return price * 0.90   # 10% off

prices = [1000, 2500, 4800, 750]

print(apply_discount(prices, festival_discount))
# [800.0, 2000.0, 3840.0, 600.0]

print(apply_discount(prices, loyalty_discount))
# [900.0, 2250.0, 4320.0, 675.0]

# Pass a lambda directly -- no need to define a named function
print(apply_discount(prices, lambda p: p * 0.85))
```

### Functions that Return Functions

```python
def make_multiplier(n):
    """Returns a function that multiplies its input by n."""
    def multiplier(x):
        return x * n
    return multiplier   # returning the function, not calling it

double   = make_multiplier(2)
triple   = make_multiplier(3)
tenfold  = make_multiplier(10)

print(double(5))    # 10
print(triple(5))    # 15
print(tenfold(5))   # 50
```

```python
# A function factory for greetings in different languages
def make_greeter(language):
    greetings = {
        "hindi":   "Namaste",
        "tamil":   "Vanakkam",
        "bengali": "Namaskar",
        "english": "Hello",
    }
    greeting = greetings.get(language, "Hello")

    def greet(name):
        return f"{greeting}, {name}!"

    return greet

hindi_greet   = make_greeter("hindi")
tamil_greet   = make_greeter("tamil")

print(hindi_greet("Aarav"))     # Namaste, Aarav!
print(tamil_greet("Priya"))     # Vanakkam, Priya!
```

---

## 14. map(), filter(), and reduce()

These are Python's built-in higher order functions for working with iterables.

### map() -- Apply a Function to Every Item

`map(function, iterable)` returns a map object (lazy iterator). Convert with `list()` to see results.

```python
prices = [299, 499, 999, 1499, 2999]

# Add 18% GST to every price
with_gst = list(map(lambda p: round(p * 1.18, 2), prices))
print(with_gst)
# [352.82, 588.82, 1178.82, 1768.82, 3538.82]

# Equivalent list comprehension
with_gst = [round(p * 1.18, 2) for p in prices]
```

```python
# map() with a named function
def to_title(name):
    return name.strip().title()

raw_names = ["  aarav sharma", "PRIYA patel ", "rohan VERMA"]
clean_names = list(map(to_title, raw_names))
print(clean_names)
# ['Aarav Sharma', 'Priya Patel', 'Rohan Verma']
```

### filter() -- Keep Only Items That Pass a Test

`filter(function, iterable)` keeps items where the function returns `True`.

```python
scores = [45, 82, 58, 91, 38, 74, 66, 49, 88]

# Keep only passing scores
passed = list(filter(lambda s: s >= 60, scores))
print(passed)
# [82, 91, 74, 66, 88]

# Keep only cities with more than 5 characters
cities = ["Delhi", "Mumbai", "Pune", "Bangalore", "Surat", "Hyderabad"]
long_cities = list(filter(lambda c: len(c) > 5, cities))
print(long_cities)
# ['Mumbai', 'Bangalore', 'Hyderabad']
```

### reduce() -- Reduce a Sequence to a Single Value

`reduce` is in the `functools` module. It applies a function cumulatively to all items.

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# Sum: ((((1+2)+3)+4)+5) = 15
total = reduce(lambda a, b: a + b, numbers)
print(total)   # 15

# Product: 1*2*3*4*5 = 120
product = reduce(lambda a, b: a * b, numbers)
print(product)   # 120

# Find maximum
scores = [45, 88, 72, 91, 60]
maximum = reduce(lambda a, b: a if a > b else b, scores)
print(maximum)   # 91
```

### map + filter + reduce Together

```python
# IPL scenario: from a list of player scores,
# keep scores above 50, double them (bonus runs), then find the total

raw_scores = [25, 80, 45, 120, 15, 95, 60, 30]

result = reduce(
    lambda a, b: a + b,
    map(
        lambda s: s * 2,
        filter(lambda s: s > 50, raw_scores)
    )
)

print(result)   # (80+120+95+60)*2 = 710
```

---

## 15. Closures

A closure is a function that **remembers the variables from its enclosing scope** even after that scope has finished executing.

Three conditions for a closure:
1. There is a nested function (function inside a function)
2. The nested function refers to a variable in the enclosing scope
3. The enclosing function returns the nested function

```python
def make_counter(start=0):
    count = start   # enclosing scope variable

    def increment():
        nonlocal count
        count += 1
        return count

    return increment   # return the inner function

counter1 = make_counter()
counter2 = make_counter(10)   # starts from 10

print(counter1())   # 1
print(counter1())   # 2
print(counter1())   # 3

print(counter2())   # 11
print(counter2())   # 12
# counter1 and counter2 each have their own independent 'count' variable
```

### Practical Closure -- Rate Limiter / Multiplier Factory

```python
def make_gst_calculator(rate):
    """Returns a function that adds a specific GST rate."""
    def calculate(price):
        return round(price * (1 + rate), 2)
    return calculate

gst_5  = make_gst_calculator(0.05)
gst_12 = make_gst_calculator(0.12)
gst_18 = make_gst_calculator(0.18)

print(gst_5(1000))    # 1050.0
print(gst_12(1000))   # 1120.0
print(gst_18(1000))   # 1180.0
```

### Inspecting a Closure

```python
def outer(x):
    def inner(y):
        return x + y
    return inner

add_10 = outer(10)

print(add_10(5))      # 15
print(add_10.__closure__)              # closure cells exist
print(add_10.__closure__[0].cell_contents)   # 10 -- the remembered value of x
```

---

## 16. Decorators

A decorator is a function that **wraps another function** to extend or modify its behavior -- without changing the original function's code.

This is one of Python's most powerful patterns. It relies on higher order functions and closures.

### The Problem Decorators Solve

Suppose you want to log every time a function is called. Without decorators:

```python
def add(a, b):
    print(f"Calling add with {a}, {b}")
    result = a + b
    print(f"add returned {result}")
    return result
```

Now imagine doing this for 20 functions. You would copy the logging lines 20 times. If the logging format changes, you update 20 places.

With a decorator, you write the logging once:

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

def add(a, b):
    return a + b

# Apply the decorator manually
add = logger(add)

add(3, 5)
# Calling add with args=(3, 5), kwargs={}
# add returned 8
```

### The @ Syntax (Syntactic Sugar)

The `@decorator` syntax does exactly the same thing as `func = decorator(func)`, but more cleanly.

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} done")
        return result
    return wrapper

@logger
def greet(name):
    return f"Hello, {name}!"

@logger
def add(a, b):
    return a + b

greet("Aarav")
# Calling greet
# greet done

add(10, 20)
# Calling add
# add done
```

### Preserving the Original Function's Identity with functools.wraps

Without `functools.wraps`, the wrapped function loses its name and docstring.

```python
from functools import wraps

def logger(func):
    @wraps(func)        # copies name, docstring, etc. from func to wrapper
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@logger
def add(a, b):
    """Add two numbers."""
    return a + b

print(add.__name__)   # add   (not 'wrapper')
print(add.__doc__)    # Add two numbers.
```

### A Practical Decorator -- Timer

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start  = time.time()
        result = func(*args, **kwargs)
        end    = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def compute_sum(n):
    return sum(range(n))

compute_sum(10_000_000)
# compute_sum took 0.3821 seconds
```

### A Practical Decorator -- Input Validator

```python
from functools import wraps

def validate_positive(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        for arg in args:
            if isinstance(arg, (int, float)) and arg < 0:
                raise ValueError(f"All arguments must be positive. Got: {arg}")
        return func(*args, **kwargs)
    return wrapper

@validate_positive
def calculate_emi(principal, rate, months):
    monthly_rate = rate / 12 / 100
    return round(principal * monthly_rate / (1 - (1 + monthly_rate) ** -months), 2)

print(calculate_emi(500000, 8.5, 60))   # works fine
calculate_emi(-500000, 8.5, 60)          # ValueError: All arguments must be positive
```

---

## 17. Decorators with Arguments

Sometimes you want to pass arguments to the decorator itself -- for example, specifying how many times to retry or what role is required.

To do this, you add another layer of wrapping: a function that takes the decorator arguments and returns the actual decorator.

```python
from functools import wraps

def repeat(n):
    """Decorator that runs the function n times."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def announce(message):
    print(message)

announce("Doors open for boarding!")
# Doors open for boarding!
# Doors open for boarding!
# Doors open for boarding!
```

```python
# Role-based access control decorator
def require_role(role):
    def decorator(func):
        @wraps(func)
        def wrapper(user, *args, **kwargs):
            if user.get("role") != role:
                raise PermissionError(f"Access denied. Required role: {role}")
            return func(user, *args, **kwargs)
        return wrapper
    return decorator

@require_role("admin")
def delete_record(user, record_id):
    print(f"Record {record_id} deleted by {user['name']}")

admin = {"name": "Aarav", "role": "admin"}
guest = {"name": "Priya", "role": "viewer"}

delete_record(admin, 42)   # Record 42 deleted by Aarav
delete_record(guest, 42)   # PermissionError: Access denied. Required role: admin
```

---

## 18. Chaining Multiple Decorators

You can stack multiple decorators on a single function. They are applied bottom-up (closest to the function first).

```python
from functools import wraps

def bold(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return "**" + func(*args, **kwargs) + "**"
    return wrapper

def uppercase(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

@bold
@uppercase
def greet(name):
    return f"hello, {name}"

print(greet("Aarav"))
# uppercase is applied first: "HELLO, AARAV"
# bold is applied second:     "**HELLO, AARAV**"
```

The execution order is:

```
@bold        --> applied second (outermost wrapper)
@uppercase   --> applied first  (innermost wrapper)
def greet    --> the original function
```

```python
# Practical stacking: timer + logger
@timer
@logger
def fetch_data(city):
    # simulate some work
    time.sleep(0.1)
    return f"Data for {city}"

fetch_data("Mumbai")
# logger runs first (inner), timer wraps that (outer)
```

---

## 19. Recursion

A recursive function is one that calls itself. Every recursive function needs:
1. A **base case** -- a condition under which it stops and returns directly
2. A **recursive case** -- where it calls itself with a smaller input

```python
def factorial(n):
    if n == 0 or n == 1:   # base case
        return 1
    return n * factorial(n - 1)   # recursive case

print(factorial(5))   # 5 * 4 * 3 * 2 * 1 = 120
print(factorial(0))   # 1
```

How it unwinds:
```
factorial(5)
= 5 * factorial(4)
= 5 * 4 * factorial(3)
= 5 * 4 * 3 * factorial(2)
= 5 * 4 * 3 * 2 * factorial(1)
= 5 * 4 * 3 * 2 * 1
= 120
```

### Fibonacci with Recursion

```python
def fibonacci(n):
    if n <= 1:          # base cases
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(8):
    print(fibonacci(i), end=" ")
# 0 1 1 2 3 5 8 13
```

### Recursive Sum of a List

```python
def recursive_sum(lst):
    if not lst:             # base case: empty list
        return 0
    return lst[0] + recursive_sum(lst[1:])   # first element + sum of rest

print(recursive_sum([10, 20, 30, 40]))   # 100
```

### Recursion Limit

Python has a default recursion limit of 1000. For deeply recursive problems, use iteration or increase the limit carefully.

```python
import sys
print(sys.getrecursionlimit())   # 1000

# You can increase it, but this is a sign you should rethink your approach
sys.setrecursionlimit(5000)
```

---

## 20. Generator Functions and yield

A generator function uses `yield` instead of `return`. It produces values one at a time, on demand, rather than computing and storing all values at once. This saves memory for large sequences.

```python
# Regular function -- builds entire list in memory
def squares_list(n):
    result = []
    for i in range(1, n + 1):
        result.append(i ** 2)
    return result

# Generator function -- produces one value at a time
def squares_gen(n):
    for i in range(1, n + 1):
        yield i ** 2   # pauses here, returns value, resumes on next call
```

```python
gen = squares_gen(5)

print(next(gen))   # 1
print(next(gen))   # 4
print(next(gen))   # 9

# Or iterate with a for loop
for square in squares_gen(5):
    print(square)
# 1 4 9 16 25
```

### yield pauses execution

Each time `yield` is hit, the function pauses and saves its state. The next call to `next()` resumes from where it left off.

```python
def countdown(n):
    print("Starting countdown")
    while n > 0:
        yield n          # pause here and return n
        n -= 1           # resume here on next call
    print("Done!")

gen = countdown(3)
print(next(gen))   # Starting countdown \n 3
print(next(gen))   # 2
print(next(gen))   # 1
print(next(gen))   # Done! \n StopIteration
```

### Generator Expression (like list comprehension, but lazy)

```python
# List comprehension -- all 1 million values in memory
squares = [x**2 for x in range(1_000_000)]

# Generator expression -- only one value in memory at a time
squares = (x**2 for x in range(1_000_000))

# Sum a billion numbers without storing them all
total = sum(x**2 for x in range(1_000_000))
print(total)
```

### Practical Generator -- Reading Large Files

```python
def read_large_file(filepath):
    """Yields one line at a time -- never loads entire file."""
    with open(filepath) as f:
        for line in f:
            yield line.strip()

# Usage -- memory-efficient regardless of file size
for line in read_large_file("huge_dataset.csv"):
    process(line)
```

---

## 21. Practice Questions

Try each question on your own before looking at the solutions in Section 22.
The questions are ordered: Easy (1-6), Medium (7-13), Hard (14-20).

---

### Easy

**Q1 -- Basic Function**
Write a function `celsius_to_fahrenheit(c)` that converts a Celsius temperature to Fahrenheit using the formula `F = (C * 9/5) + 32`. Test it with the temperatures below.

```python
temps_c = [0, 100, 37, -40, 25]
```

Expected output:
```
0 C    = 32.0 F
100 C  = 212.0 F
37 C   = 98.6 F
-40 C  = -40.0 F
25 C   = 77.0 F
```

---

**Q2 -- Default Parameters**
Write a function `book_ticket(passenger, train="Rajdhani", class_type="Sleeper", meals=False)` that prints a booking summary. Call it four times:
- Only the passenger name
- Passenger name and train
- All arguments
- Using keyword arguments in a different order

Expected output:
```
Passenger : Aarav
Train     : Rajdhani
Class     : Sleeper
Meals     : No
----------
Passenger : Priya
Train     : Shatabdi
Class     : Sleeper
Meals     : No
... (and so on)
```

---

**Q3 -- Return Multiple Values**
Write a function `string_stats(text)` that returns the number of words, number of characters (excluding spaces), and the longest word -- all in one return statement. Unpack the result when calling.

```python
text = "The quick brown fox jumps over the lazy dog"
```

Expected output:
```
Words     : 9
Characters: 35
Longest   : jumps
```

---

**Q4 -- *args**
Write a function `total_bill(*items)` where each item is a tuple of `(name, price)`. The function should print each item and its price, then print the total.

```python
total_bill(("Masala Dosa", 80), ("Filter Coffee", 30), ("Idli Sambar", 60), ("Gulab Jamun", 40))
```

Expected output:
```
Masala Dosa      : Rs.80
Filter Coffee    : Rs.30
Idli Sambar      : Rs.60
Gulab Jamun      : Rs.40
---------------------
Total            : Rs.210
```

---

**Q5 -- **kwargs**
Write a function `create_employee(**details)` that accepts any number of keyword arguments and prints them in a formatted table. Then call it twice with different sets of fields.

Expected output:
```
---- Employee Profile ----
name           : Vikram Nair
department     : Engineering
salary         : 85000
city           : Bangalore
experience_yrs : 4
```

---

**Q6 -- Lambda and sorted()**
You have a list of student tuples `(name, marks)`. Sort them:
- By marks ascending
- By marks descending
- Alphabetically by name

Use lambda functions as the sort key.

```python
students = [("Rohan", 78), ("Aarav", 85), ("Sneha", 92), ("Priya", 78), ("Karan", 65)]
```

---

### Medium

**Q7 -- Scope**
What will the following code print? Write your prediction before running it. Then explain why.

```python
x = 10

def outer():
    x = 20
    def inner():
        x = 30
        print("inner:", x)
    inner()
    print("outer:", x)

outer()
print("global:", x)
```

Then modify the code so that:
- `inner()` modifies outer's `x` using `nonlocal`
- `outer()` modifies the global `x` using `global`

---

**Q8 -- Higher Order Functions**
Write a function `apply_all(value, *functions)` that takes a starting value and any number of functions, applies them one after another (the output of each becomes the input of the next), and returns the final result.

```python
def double(x):   return x * 2
def add_10(x):   return x + 10
def square(x):   return x ** 2

print(apply_all(3, double, add_10, square))
# double(3) = 6, add_10(6) = 16, square(16) = 256
```

---

**Q9 -- Closures**
Write a function `make_validator(min_val, max_val)` that returns a function. The returned function should take a number and return `True` if it falls within the range, and `False` otherwise.

```python
is_valid_age    = make_validator(18, 60)
is_valid_score  = make_validator(0, 100)
is_valid_pin    = make_validator(1000, 9999)

print(is_valid_age(25))     # True
print(is_valid_age(15))     # False
print(is_valid_score(105))  # False
print(is_valid_pin(4521))   # True
```

---

**Q10 -- map() and filter()**
Given the list of orders below:
- Use `map()` to apply a 10% discount to all amounts
- Use `filter()` to keep only orders above Rs.500 (after discount)
- Use `map()` again to round all final amounts to 2 decimal places

Do all three steps using map and filter only (no list comprehensions).

```python
order_amounts = [250, 1200, 480, 3500, 150, 800, 2200, 95, 600]
```

---

**Q11 -- Decorator**
Write a decorator `validate_non_negative` that raises a `ValueError` if any positional numeric argument passed to a function is negative. Apply it to a function `calculate_rectangle_area(length, width)`.

```python
calculate_rectangle_area(5, 3)     # 15
calculate_rectangle_area(-2, 4)    # ValueError
calculate_rectangle_area(0, 7)     # 0
```

---

**Q12 -- Recursion**
Write a recursive function `power(base, exp)` that computes `base` raised to the power `exp` without using the `**` operator or `pow()`. Handle the case where `exp` is 0.

```python
print(power(2, 10))   # 1024
print(power(3, 4))    # 81
print(power(5, 0))    # 1
```

---

**Q13 -- Generator**
Write a generator function `fibonacci_gen(n)` that yields the first `n` Fibonacci numbers. Then use it to:
- Print the first 10 Fibonacci numbers
- Find the first Fibonacci number greater than 100

---

### Hard

**Q14 -- Decorator with Arguments**
Write a decorator `retry(max_attempts, delay=0)` that retries a function up to `max_attempts` times if it raises an exception. After all attempts are exhausted, re-raise the last exception. Use `time.sleep(delay)` between attempts.

Test it with a function that randomly fails.

```python
import random
import time

@retry(max_attempts=4, delay=0.1)
def unstable_api_call(city):
    if random.random() < 0.6:   # 60% chance of failure
        raise ConnectionError(f"API call to {city} failed")
    return f"Data received for {city}"
```

---

**Q15 -- Closure with State**
Write a function `make_account(owner, initial_balance=0)` that returns three functions as a tuple: `deposit`, `withdraw`, and `get_balance`. All three functions should share access to the same internal balance variable using closures.

```python
deposit, withdraw, get_balance = make_account("Aarav", 1000)

deposit(500)
print(get_balance())   # 1500

withdraw(200)
print(get_balance())   # 1300

withdraw(2000)         # Should print: "Insufficient funds"
```

---

**Q16 -- Higher Order + map/filter/reduce Pipeline**
You have a list of employee dictionaries. Using only `map()`, `filter()`, and `reduce()` (no for loops, no list comprehensions), write a pipeline that:
1. Filters out employees with less than 3 years of experience
2. Applies a 15% salary hike to the remaining employees
3. Computes the total salary payout after hike

```python
from functools import reduce

employees = [
    {"name": "Aarav",  "salary": 60000, "experience": 4},
    {"name": "Priya",  "salary": 45000, "experience": 2},
    {"name": "Rohan",  "salary": 75000, "experience": 6},
    {"name": "Sneha",  "salary": 52000, "experience": 1},
    {"name": "Karan",  "salary": 80000, "experience": 8},
    {"name": "Meera",  "salary": 55000, "experience": 3},
]
```

---

**Q17 -- Recursive Flatten**
Write a recursive function `flatten(lst)` that takes a deeply nested list and returns a flat list of all values. Do not use any built-in flatten utilities.

```python
nested = [1, [2, 3], [4, [5, 6]], [[7], [8, [9, 10]]]]
print(flatten(nested))
# [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

---

**Q18 -- Memoization Decorator**
Write a decorator `memoize` that caches the results of a function so that repeated calls with the same arguments return instantly from the cache instead of recomputing.

Apply it to the recursive Fibonacci function and compare speed with and without caching.

```python
@memoize
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(35))   # Should be fast with memoization
```

---

**Q19 -- Function Composition**
Write a function `compose(*functions)` that takes any number of functions and returns a new function that applies them from right to left (standard mathematical composition).

```python
def add_5(x):    return x + 5
def triple(x):   return x * 3
def negate(x):   return -x

# compose(negate, triple, add_5) means: negate(triple(add_5(x)))
transform = compose(negate, triple, add_5)
print(transform(2))   # negate(triple(add_5(2))) = negate(triple(7)) = negate(21) = -21
print(transform(10))  # negate(triple(15)) = negate(45) = -45
```

---

**Q20 -- Full Pipeline**
Build a data processing pipeline using functions. You are given raw employee data as a list of strings (CSV format). Write the following functions and chain them together:

1. `parse_employees(raw)` -- parse each string into a dict
2. `clean_employees(employees)` -- strip whitespace from all string fields, convert salary and experience to correct types
3. `filter_eligible(employees)` -- keep only employees with experience >= 3 and salary >= 50000
4. `apply_raise(employees, pct)` -- apply a salary raise by `pct` percent to all remaining employees
5. `generate_report(employees)` -- print a formatted report with rank, name, department, old salary, new salary

Chain them into a single `run_pipeline(raw, raise_pct)` function.

```python
raw_data = [
    "Aarav Sharma,  Engineering,  75000,  5",
    "Priya Patel,   HR,           45000,  2",
    "Rohan Verma,   Sales,        52000,  4",
    "Sneha Iyer,    Engineering,  88000,  7",
    "Karan Singh,   Marketing,    48000,  1",
    "Meera Nair,    Engineering,  91000,  9",
    "Arjun Kumar,   Sales,        55000,  3",
]

run_pipeline(raw_data, raise_pct=12)
```

Expected output:
```
===== SALARY REVISION REPORT (12% Raise) =====
Rank  Name           Department    Old Salary   New Salary
1     Aarav Sharma   Engineering   Rs.75,000    Rs.84,000
2     Rohan Verma    Sales         Rs.52,000    Rs.58,240
3     Sneha Iyer     Engineering   Rs.88,000    Rs.98,560
4     Meera Nair     Engineering   Rs.91,000    Rs.1,01,920
5     Arjun Kumar    Sales         Rs.55,000    Rs.61,600
```

---

## 22. Solutions

---

### Q1 -- Basic Function

```python
def celsius_to_fahrenheit(c):
    return (c * 9/5) + 32

temps_c = [0, 100, 37, -40, 25]

for c in temps_c:
    f = celsius_to_fahrenheit(c)
    print(f"{c} C\t= {f} F")
```

---

### Q2 -- Default Parameters

```python
def book_ticket(passenger, train="Rajdhani", class_type="Sleeper", meals=False):
    print(f"Passenger : {passenger}")
    print(f"Train     : {train}")
    print(f"Class     : {class_type}")
    print(f"Meals     : {'Yes' if meals else 'No'}")
    print("-" * 10)

book_ticket("Aarav")
book_ticket("Priya", "Shatabdi")
book_ticket("Rohan", "Vande Bharat", "AC 2-Tier", True)
book_ticket("Sneha", meals=True, class_type="AC 1-Tier", train="Duronto")
```

---

### Q3 -- Return Multiple Values

```python
def string_stats(text):
    words   = text.split()
    chars   = len(text.replace(" ", ""))
    longest = max(words, key=len)
    return len(words), chars, longest

word_count, char_count, longest_word = string_stats(
    "The quick brown fox jumps over the lazy dog"
)

print(f"Words     : {word_count}")
print(f"Characters: {char_count}")
print(f"Longest   : {longest_word}")
```

---

### Q4 -- *args

```python
def total_bill(*items):
    total = 0
    for name, price in items:
        print(f"{name:<18}: Rs.{price}")
        total += price
    print("-" * 25)
    print(f"{'Total':<18}: Rs.{total}")

total_bill(
    ("Masala Dosa", 80),
    ("Filter Coffee", 30),
    ("Idli Sambar", 60),
    ("Gulab Jamun", 40)
)
```

---

### Q5 -- **kwargs

```python
def create_employee(**details):
    print("---- Employee Profile ----")
    for key, value in details.items():
        print(f"{key:<15}: {value}")

create_employee(
    name="Vikram Nair",
    department="Engineering",
    salary=85000,
    city="Bangalore",
    experience_yrs=4
)

print()

create_employee(
    name="Priya Shah",
    role="HR Manager",
    email="priya@company.com"
)
```

---

### Q6 -- Lambda and sorted()

```python
students = [("Rohan", 78), ("Aarav", 85), ("Sneha", 92), ("Priya", 78), ("Karan", 65)]

by_marks_asc  = sorted(students, key=lambda s: s[1])
by_marks_desc = sorted(students, key=lambda s: s[1], reverse=True)
by_name       = sorted(students, key=lambda s: s[0])

print("By marks ascending :", by_marks_asc)
print("By marks descending:", by_marks_desc)
print("Alphabetically     :", by_name)
```

---

### Q7 -- Scope

Prediction and explanation:

```python
x = 10

def outer():
    x = 20
    def inner():
        x = 30
        print("inner:", x)   # 30 -- local to inner
    inner()
    print("outer:", x)       # 20 -- local to outer, unaffected by inner's x

outer()
print("global:", x)          # 10 -- global, unaffected by either function
```

Output:
```
inner: 30
outer: 20
global: 10
```

Each `x = ...` inside a function creates a new local variable. They do not affect each other unless you use `nonlocal` or `global`.

Modified version:

```python
x = 10

def outer():
    global x
    x = 20        # now modifies the global x

    def inner():
        nonlocal x    # ERROR: x is global here, not enclosing
        # nonlocal only works for enclosing function scope, not global
        # To demonstrate nonlocal properly, we need a variable that is truly enclosing:
        pass

# Correct nonlocal demonstration:
def outer2():
    y = 20
    def inner2():
        nonlocal y
        y = 30
        print("inner2:", y)   # 30
    inner2()
    print("outer2:", y)       # 30 -- changed by nonlocal

outer2()
```

---

### Q8 -- Higher Order Functions

```python
def apply_all(value, *functions):
    result = value
    for func in functions:
        result = func(result)
    return result

def double(x):  return x * 2
def add_10(x):  return x + 10
def square(x):  return x ** 2

print(apply_all(3, double, add_10, square))   # 256
print(apply_all(5, double, double, double))   # 40
```

---

### Q9 -- Closures

```python
def make_validator(min_val, max_val):
    def validate(number):
        return min_val <= number <= max_val
    return validate

is_valid_age   = make_validator(18, 60)
is_valid_score = make_validator(0, 100)
is_valid_pin   = make_validator(1000, 9999)

print(is_valid_age(25))      # True
print(is_valid_age(15))      # False
print(is_valid_score(105))   # False
print(is_valid_pin(4521))    # True
```

---

### Q10 -- map() and filter()

```python
order_amounts = [250, 1200, 480, 3500, 150, 800, 2200, 95, 600]

# Step 1: apply 10% discount
after_discount = map(lambda x: x * 0.90, order_amounts)

# Step 2: keep only amounts above 500
above_500 = filter(lambda x: x > 500, after_discount)

# Step 3: round to 2 decimal places
final = list(map(lambda x: round(x, 2), above_500))

print(final)
# [1080.0, 3150.0, 720.0, 1980.0, 540.0]
```

---

### Q11 -- Decorator

```python
from functools import wraps

def validate_non_negative(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        for arg in args:
            if isinstance(arg, (int, float)) and arg < 0:
                raise ValueError(f"Negative value not allowed: {arg}")
        return func(*args, **kwargs)
    return wrapper

@validate_non_negative
def calculate_rectangle_area(length, width):
    return length * width

print(calculate_rectangle_area(5, 3))     # 15
print(calculate_rectangle_area(0, 7))     # 0
calculate_rectangle_area(-2, 4)           # ValueError: Negative value not allowed: -2
```

---

### Q12 -- Recursion

```python
def power(base, exp):
    if exp == 0:               # base case: anything to power 0 is 1
        return 1
    return base * power(base, exp - 1)   # recursive case

print(power(2, 10))    # 1024
print(power(3, 4))     # 81
print(power(5, 0))     # 1
```

---

### Q13 -- Generator

```python
def fibonacci_gen(n):
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

# First 10 Fibonacci numbers
print("First 10:", list(fibonacci_gen(10)))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# First Fibonacci number greater than 100
gen = fibonacci_gen(1000)
for num in gen:
    if num > 100:
        print("First Fibonacci > 100:", num)   # 144
        break
```

---

### Q14 -- Decorator with Arguments

```python
import random
import time
from functools import wraps

def retry(max_attempts, delay=0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, max_attempts + 1):
                try:
                    result = func(*args, **kwargs)
                    print(f"  Succeeded on attempt {attempt}")
                    return result
                except Exception as e:
                    last_error = e
                    print(f"  Attempt {attempt} failed: {e}")
                    if delay > 0:
                        time.sleep(delay)
            raise last_error
        return wrapper
    return decorator

random.seed(42)

@retry(max_attempts=4, delay=0)
def unstable_api_call(city):
    if random.random() < 0.6:
        raise ConnectionError(f"API call to {city} failed")
    return f"Data received for {city}"

try:
    result = unstable_api_call("Mumbai")
    print(result)
except ConnectionError as e:
    print(f"All attempts failed: {e}")
```

---

### Q15 -- Closure with State

```python
def make_account(owner, initial_balance=0):
    balance = initial_balance

    def deposit(amount):
        nonlocal balance
        balance += amount
        print(f"Deposited Rs.{amount}. Balance: Rs.{balance}")

    def withdraw(amount):
        nonlocal balance
        if amount > balance:
            print("Insufficient funds")
        else:
            balance -= amount
            print(f"Withdrew Rs.{amount}. Balance: Rs.{balance}")

    def get_balance():
        return balance

    return deposit, withdraw, get_balance

deposit, withdraw, get_balance = make_account("Aarav", 1000)

deposit(500)
print(get_balance())   # 1500
withdraw(200)
print(get_balance())   # 1300
withdraw(2000)         # Insufficient funds
```

---

### Q16 -- Higher Order + map/filter/reduce Pipeline

```python
from functools import reduce

employees = [
    {"name": "Aarav",  "salary": 60000, "experience": 4},
    {"name": "Priya",  "salary": 45000, "experience": 2},
    {"name": "Rohan",  "salary": 75000, "experience": 6},
    {"name": "Sneha",  "salary": 52000, "experience": 1},
    {"name": "Karan",  "salary": 80000, "experience": 8},
    {"name": "Meera",  "salary": 55000, "experience": 3},
]

# Step 1: filter -- keep experience >= 3
eligible = filter(lambda e: e["experience"] >= 3, employees)

# Step 2: map -- apply 15% hike
with_hike = map(
    lambda e: {**e, "salary": round(e["salary"] * 1.15)},
    eligible
)

# Step 3: reduce -- sum all salaries
total_payout = reduce(
    lambda acc, e: acc + e["salary"],
    with_hike,
    0
)

print(f"Total salary payout after hike: Rs.{total_payout:,}")
# Eligible: Aarav, Rohan, Karan, Meera
# After 15% hike: 69000 + 86250 + 92000 + 63250 = Rs.3,10,500
```

---

### Q17 -- Recursive Flatten

```python
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))   # recurse into sublists
        else:
            result.append(item)
    return result

nested = [1, [2, 3], [4, [5, 6]], [[7], [8, [9, 10]]]]
print(flatten(nested))
# [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

---

### Q18 -- Memoization Decorator

```python
import time
from functools import wraps

def memoize(func):
    cache = {}
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

# Without memoization -- exponentially slow for large n
def fib_slow(n):
    if n <= 1:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

@memoize
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

start = time.time()
print(fib(35))
print(f"With memoize   : {time.time() - start:.6f}s")

start = time.time()
print(fib_slow(35))
print(f"Without memoize: {time.time() - start:.6f}s")
```

---

### Q19 -- Function Composition

```python
from functools import reduce

def compose(*functions):
    def composed(x):
        # apply functions right to left
        return reduce(lambda v, f: f(v), reversed(functions), x)
    return composed

def add_5(x):   return x + 5
def triple(x):  return x * 3
def negate(x):  return -x

transform = compose(negate, triple, add_5)

print(transform(2))    # negate(triple(add_5(2))) = negate(triple(7)) = negate(21) = -21
print(transform(10))   # negate(triple(15)) = negate(45) = -45
```

---

### Q20 -- Full Pipeline

```python
def parse_employees(raw):
    employees = []
    for line in raw:
        parts  = [p.strip() for p in line.split(",")]
        employees.append({
            "name":       parts[0],
            "department": parts[1],
            "salary":     int(parts[2]),
            "experience": int(parts[3]),
        })
    return employees

def clean_employees(employees):
    for emp in employees:
        emp["name"]       = emp["name"].strip().title()
        emp["department"] = emp["department"].strip().title()
    return employees

def filter_eligible(employees):
    return [e for e in employees if e["experience"] >= 3 and e["salary"] >= 50000]

def apply_raise(employees, pct):
    factor = 1 + pct / 100
    for emp in employees:
        emp["old_salary"] = emp["salary"]
        emp["salary"]     = round(emp["salary"] * factor)
    return employees

def generate_report(employees, raise_pct):
    print(f"\n===== SALARY REVISION REPORT ({raise_pct}% Raise) =====")
    print(f"{'Rank':<5} {'Name':<16} {'Department':<14} {'Old Salary':>12} {'New Salary':>12}")
    print("-" * 60)
    for rank, emp in enumerate(employees, start=1):
        print(
            f"{rank:<5} {emp['name']:<16} {emp['department']:<14}"
            f" Rs.{emp['old_salary']:>9,}  Rs.{emp['salary']:>9,}"
        )

def run_pipeline(raw, raise_pct):
    employees = parse_employees(raw)
    employees = clean_employees(employees)
    employees = filter_eligible(employees)
    employees = apply_raise(employees, raise_pct)
    generate_report(employees, raise_pct)

raw_data = [
    "Aarav Sharma,  Engineering,  75000,  5",
    "Priya Patel,   HR,           45000,  2",
    "Rohan Verma,   Sales,        52000,  4",
    "Sneha Iyer,    Engineering,  88000,  7",
    "Karan Singh,   Marketing,    48000,  1",
    "Meera Nair,    Engineering,  91000,  9",
    "Arjun Kumar,   Sales,        55000,  3",
]

run_pipeline(raw_data, raise_pct=12)
```

---

## 23. What We Covered and What is Next

### What This Masterclass Covered

| Section | Topics |
|---|---|
| Basics | def, calling, parameters vs arguments |
| Argument types | Positional, keyword, default, *args, **kwargs |
| Advanced params | Keyword-only, positional-only (3.8+), combining all types |
| Return values | Single, multiple, early return, returning None |
| Scope | LEGB rule, local vs global, reading globals |
| global / nonlocal | Modifying outer scope variables |
| Docstrings | Writing and accessing documentation |
| Annotations | Type hints for parameters and return values |
| Lambda | Syntax, use cases, sort keys, limitations |
| Higher order functions | Functions as arguments, functions returning functions |
| map / filter / reduce | Built-in functional tools |
| Closures | Remembered enclosing state, function factories |
| Decorators | Wrapping functions, @ syntax, functools.wraps |
| Decorators with args | Three-layer decorator pattern |
| Chaining decorators | Stacking and execution order |
| Recursion | Base case, recursive case, call stack, recursion limit |
| Generators | yield, lazy evaluation, generator expressions |

### What to Explore Next

**1. functools module**
Beyond `wraps` and `reduce`, functools has `partial` (pre-fill function arguments), `lru_cache` (built-in memoization), `cache`, and `total_ordering`. These are production-grade tools built around the same concepts covered here.

**2. itertools module**
Pairs naturally with generators. Gives you `chain`, `product`, `combinations`, `permutations`, `groupby`, `islice`, and more. Essential for advanced iteration.

**3. Object-Oriented Programming**
Functions become methods. Closures become classes. The concepts you have learned here are the functional programming side of Python -- OOP is the other side, and understanding both makes you a much more complete Python developer.

**4. Async Functions (asyncio)**
Python has `async def` and `await` for writing asynchronous code. Generators are the foundation that async/await is built on.

**5. Type Annotations at Scale**
Using `typing` module: `List[int]`, `Dict[str, float]`, `Optional[str]`, `Callable`, `TypeVar`, `Generic`. Tools like `mypy` and `pyright` use these to catch bugs before runtime.

---

> Final thought:
> Decorators, closures, and higher order functions are the concepts that separate someone who writes Python from someone who thinks in Python.
> The practice questions -- especially Q14 through Q20 -- are the ones worth spending real time on.
> Every one of them mirrors a pattern you will encounter in real codebases.

---

*Made with care for Codeverra learners | codeverra.com*