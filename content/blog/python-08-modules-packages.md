---
title: "Modules, Packages, and the Python Ecosystem"
description: "Understand how Python modules and packages work, how to create your own, and how to navigate the Python ecosystem."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Modules, Packages, and the Python Ecosystem
### Understanding Imports, the Standard Library, pip, and Virtual Environments

---

## Before We Begin -- Why This Topic Is More Important Than It Looks

Here is something that happens to almost every beginner.

You are working through a tutorial. It says `import pandas as pd` and moves on.
You copy it. It works. You move on too.

Six months later you are working on two projects at the same time. One needs
pandas 1.5. The other needs pandas 2.1. You install one and the other breaks.
You have no idea why. You cannot share your project with a teammate because
it works on your machine and crashes on theirs.

Or you write a 500-line script and realise you have copy-pasted the same
helper function into three different files. When you fix a bug in one,
you forget to fix the other two.

Both problems have the same root cause -- you never learned how Python's
import system actually works, or how to structure code across files.

This guide fixes that. By the end you will understand:

- What actually happens when you write `import something`
- How to split your own code across multiple files so it stays maintainable
- What the standard library is and which parts of it you will use every day
- How pip works and what `requirements.txt` is for
- Why virtual environments are not optional and how to use them properly

This is not exciting material on the surface. But it is the infrastructure
that every Python project you will ever build depends on.

---

## Table of Contents

1. [What is a Module?](#1-what-is-a-module)
2. [Importing Modules -- All the Ways](#2-importing-modules----all-the-ways)
3. [How Python Finds What You Import](#3-how-python-finds-what-you-import)
4. [The `__name__` Variable and `if __name__ == "__main__"`](#4-the-__name__-variable-and-if-__name__--__main__)
5. [Writing Your Own Modules](#5-writing-your-own-modules)
6. [What is a Package?](#6-what-is-a-package)
7. [Building Your Own Package](#7-building-your-own-package)
8. [Relative and Absolute Imports](#8-relative-and-absolute-imports)
9. [The Standard Library -- A Practical Tour](#9-the-standard-library----a-practical-tour)
10. [pip -- Installing Third-Party Packages](#10-pip----installing-third-party-packages)
11. [requirements.txt -- Sharing Dependencies](#11-requirementstxt----sharing-dependencies)
12. [Virtual Environments -- Why They Are Non-Negotiable](#12-virtual-environments----why-they-are-non-negotiable)
13. [venv -- The Built-In Solution](#13-venv----the-built-in-solution)
14. [conda -- The Data Science Standard](#14-conda----the-data-science-standard)
15. [Other Tools -- virtualenv, uv](#15-other-tools----virtualenv-uv)
16. [Which Tool Should You Use?](#16-which-tool-should-you-use)
17. [Practice Questions](#17-practice-questions)
18. [Solutions](#18-solutions)
19. [What Comes Next](#19-what-comes-next)

---

## 1. What is a Module?

A module is the simplest possible concept in Python packaging.

**A module is just a `.py` file.**

That is it. If you create a file called `maths_utils.py`, that file is a module.
Any other Python file can import it and use everything defined inside it.

This matters because as your programs grow, keeping everything in one file
becomes unmanageable. A 2000-line script where functions for database access,
business logic, and user interface are all mixed together is hard to read,
hard to test, and hard to maintain.

Modules let you break that 2000-line script into focused, reusable pieces:

```
my_project/
    database.py      -- everything related to database access
    analytics.py     -- calculation and analysis functions
    reports.py       -- report generation
    main.py          -- ties everything together
```

Each file is a module. Each module has a clear responsibility.
When a bug appears in the database layer, you know exactly which file to open.

### What can a module contain?

Anything you can write in a Python file:

```python
# maths_utils.py -- a simple module

# Variables
PI    = 3.14159265358979
E     = 2.71828182845905
GOLDEN_RATIO = 1.61803398874989

# Functions
def circle_area(radius):
    """Calculate the area of a circle."""
    return PI * radius ** 2

def is_prime(n):
    """Return True if n is a prime number."""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def factorial(n):
    """Return n! using recursion."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# Classes
class Vector2D:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def magnitude(self):
        return (self.x**2 + self.y**2) ** 0.5

    def __repr__(self):
        return f"Vector2D({self.x}, {self.y})"
```

---

## 2. Importing Modules -- All the Ways

### import module_name

The most basic form. Imports the entire module and gives you access to
everything in it via dot notation.

```python
import maths_utils

# Access everything with the module name as a prefix
print(maths_utils.PI)                          # 3.14159...
print(maths_utils.circle_area(7))              # 153.938...
print(maths_utils.is_prime(17))                # True
v = maths_utils.Vector2D(3, 4)
print(v.magnitude())                           # 5.0
```

The module name acts as a namespace -- it prevents name collisions.
If you have your own variable called `PI`, it does not conflict with
`maths_utils.PI` because they live in different namespaces.

### from module import name

Import specific names from a module directly into your current namespace.
No prefix needed when using them.

```python
from maths_utils import PI, circle_area, is_prime

# Use directly -- no prefix
print(PI)                   # 3.14159...
print(circle_area(7))       # 153.938...
print(is_prime(17))         # True

# But Vector2D is NOT imported -- you only got what you asked for
v = Vector2D(3, 4)          # NameError: name 'Vector2D' is not defined
```

### from module import *

Imports everything from the module into the current namespace.
**Avoid this in production code.** It pollutes your namespace and makes
it impossible to tell where a name came from.

```python
from maths_utils import *    # imports PI, E, GOLDEN_RATIO, circle_area, etc.

# Now everything is available, but this is dangerous:
PI = 3.14    # which PI are you using now? yours or maths_utils.PI?
```

The only acceptable use of `import *` is in a package's `__init__.py`
to selectively expose its public API, and even then it requires a
carefully defined `__all__` list.

### import module as alias

Give the module a shorter name. This is the standard pattern for
well-known libraries that have conventional aliases.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# These aliases are universal conventions -- use them
arr = np.array([1, 2, 3])
df  = pd.DataFrame({"a": [1, 2, 3]})
```

You can alias your own modules too:

```python
import maths_utils as mu

print(mu.circle_area(5))
```

### from module import name as alias

Combine both -- import a specific name and give it an alias.

```python
from maths_utils import circle_area as area
from maths_utils import is_prime    as prime_check

print(area(7))            # 153.938...
print(prime_check(17))    # True
```

### Importing from the standard library vs your own files

```python
# Standard library -- Python finds these automatically
import os
import sys
import math
import json
import datetime

# Your own modules -- Python looks in the current directory first
import maths_utils        # looks for maths_utils.py in the same folder

# Third-party libraries (installed via pip)
import numpy              # Python looks in site-packages
import pandas
```

---

## 3. How Python Finds What You Import

When you write `import something`, Python searches for it in a specific order.
Understanding this order explains why some imports work and others fail.

```python
import sys

# sys.path is the list of directories Python searches, in order
print(sys.path)
```

**The search order is:**

```
1. sys.modules cache
   -- Already-imported modules are cached here.
   -- Python checks here first to avoid re-importing.

2. Built-in modules
   -- Modules compiled into the Python interpreter itself.
   -- Examples: sys, builtins, _io
   -- Check with: import sys; print(sys.builtin_module_names)

3. The current directory (or the script's directory)
   -- If you run python main.py from /home/aarav/project/,
      Python looks in /home/aarav/project/ first.

4. PYTHONPATH environment variable directories
   -- A colon-separated list of directories you can set.
   -- Rarely needed in everyday work.

5. Standard library directories
   -- Where Python's built-in modules live on your system.

6. Site-packages
   -- Where pip installs third-party libraries.
   -- Typically: .../lib/python3.x/site-packages/
```

```python
import sys

# See exactly where Python is looking
for path in sys.path:
    print(path)

# Find where a specific module is located
import numpy
print(numpy.__file__)     # /path/to/site-packages/numpy/__init__.py

import os
print(os.__file__)        # /path/to/lib/python3.x/os.py
```

### The most common import error explained

```python
# You are in /home/aarav/projects/analytics/
# Your file structure is:
#
# analytics/
#     main.py
#     utils/
#         helper.py

# In main.py:
import helper    # ModuleNotFoundError -- helper.py is in utils/, not here

# Correct:
from utils import helper
# or:
import utils.helper
```

This error almost always means either:
- The file does not exist where Python is looking
- You are running the script from the wrong directory
- The package structure is not set up correctly (missing `__init__.py`)

---

## 4. The `__name__` Variable and `if __name__ == "__main__"`

Every Python module has a special variable called `__name__`.

- When a file is **run directly** (`python my_file.py`), `__name__` is set to `"__main__"`
- When a file is **imported** by another file, `__name__` is set to the **module's name** (e.g., `"my_file"`)

This distinction is critical. Here is why:

```python
# greetings.py

def greet(name):
    return f"Namaste, {name}!"

def farewell(name):
    return f"Alvida, {name}!"

# This block runs ONLY when you execute: python greetings.py
# It does NOT run when another file does: import greetings
if __name__ == "__main__":
    print(greet("Aarav"))
    print(farewell("Priya"))
```

Without the `if __name__ == "__main__":` guard:

```python
# greetings_bad.py

def greet(name):
    return f"Namaste, {name}!"

# This runs every time the module is imported -- WRONG
print(greet("Aarav"))     # executes when imported -- pollutes any importer
```

```python
# main.py
import greetings_bad      # this triggers the print() -- not what you want
```

### Why this pattern matters in practice

```python
# calculator.py

def add(a, b):      return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# Tests and demos -- only run when executed directly
if __name__ == "__main__":
    print("Running calculator tests...")
    print(f"add(3, 4)       = {add(3, 4)}")
    print(f"subtract(10, 3) = {subtract(10, 3)}")
    print(f"multiply(5, 6)  = {multiply(5, 6)}")
    print(f"divide(15, 3)   = {divide(15, 3)}")
    print("All tests passed.")
```

Now `calculator.py` works as both a standalone script (run directly to test)
and as a reusable module (imported by other files without side effects).

---

## 5. Writing Your Own Modules

Let us build a real, practical example. Suppose you are building a simple
data processing project for cricket match statistics.

```python
# cricket_utils.py
# A reusable module for cricket statistics calculations

"""
cricket_utils -- Utility functions for cricket statistics.

Functions:
    batting_average(runs, dismissals)
    strike_rate(runs, balls)
    economy_rate(runs, overs)
    bowling_average(runs, wickets)
    classify_performance(average)
"""


def batting_average(runs, dismissals):
    """
    Calculate batting average.

    Args:
        runs (int):        Total runs scored
        dismissals (int):  Number of times dismissed

    Returns:
        float: Batting average, or None if never dismissed
    """
    if dismissals == 0:
        return None   # Not out -- average is undefined, not zero
    return round(runs / dismissals, 2)


def strike_rate(runs, balls):
    """Calculate batting strike rate (runs per 100 balls)."""
    if balls == 0:
        return 0.0
    return round((runs / balls) * 100, 2)


def economy_rate(runs_conceded, overs_bowled):
    """Calculate bowling economy rate (runs per over)."""
    if overs_bowled == 0:
        return 0.0
    return round(runs_conceded / overs_bowled, 2)


def bowling_average(runs_conceded, wickets):
    """Calculate bowling average (runs per wicket)."""
    if wickets == 0:
        return None   # No wickets taken -- average undefined
    return round(runs_conceded / wickets, 2)


def classify_performance(batting_avg):
    """
    Classify a batsman's performance based on average.

    Returns:
        str: "World Class", "Excellent", "Good", "Average", or "Developing"
    """
    if batting_avg is None:
        return "Insufficient data"
    if batting_avg >= 50:   return "World Class"
    if batting_avg >= 40:   return "Excellent"
    if batting_avg >= 30:   return "Good"
    if batting_avg >= 20:   return "Average"
    return "Developing"


# Only runs when this file is executed directly
if __name__ == "__main__":
    # Quick demo
    print("=== Cricket Stats Demo ===")

    players = [
        ("Virat Kohli",  12898, 241,  8944, 6432),
        ("Rohit Sharma",  9825, 243,  8714, 7145),
        ("MS Dhoni",     10773, 350, 10000, 9350),
    ]

    for name, runs, dismissals, balls_faced, _ in players:
        avg = batting_average(runs, dismissals)
        sr  = strike_rate(runs, balls_faced)
        cls = classify_performance(avg)
        print(f"{name:<20} Avg: {str(avg):<7} SR: {sr:<8} [{cls}]")
```

Now use it from another file:

```python
# main.py
import cricket_utils

# Using the module
kohli_avg = cricket_utils.batting_average(12898, 241)
kohli_sr  = cricket_utils.strike_rate(12898, 6432)

print(f"Kohli Average: {kohli_avg}")
print(f"Kohli SR:      {kohli_sr}")
print(f"Performance:   {cricket_utils.classify_performance(kohli_avg)}")

# Or import specific functions
from cricket_utils import batting_average, strike_rate, classify_performance

avg = batting_average(9825, 243)
print(classify_performance(avg))
```

---

## 6. What is a Package?

A package is a **directory that contains Python modules**, with a special
file called `__init__.py` that tells Python "this directory is a package,
not just a folder."

```
Without __init__.py:              With __init__.py:
  analytics/                        analytics/           <-- package
      data_loader.py                    __init__.py
      calculator.py                     data_loader.py   <-- module
      visualiser.py                     calculator.py    <-- module
                                        visualiser.py    <-- module
  # Python treats this as            # Python can import from this
  # just a directory -- you            # as: import analytics
  # cannot import from it              # or: from analytics import calculator
```

### Why packages?

As a project grows, you end up with many modules. Packages let you organise
related modules into a hierarchy:

```
codeverra_app/
    __init__.py
    students/
        __init__.py
        profile.py
        grades.py
        enrollment.py
    courses/
        __init__.py
        curriculum.py
        schedule.py
    payments/
        __init__.py
        billing.py
        invoice.py
    utils/
        __init__.py
        validators.py
        formatters.py
```

Now you can import very specifically:

```python
from codeverra_app.students import grades
from codeverra_app.payments.billing import calculate_fee
import codeverra_app.utils.validators as validators
```

---

## 7. Building Your Own Package

Let us build a small but real package step by step.

### Step 1 -- Create the directory structure

```
cricket_stats/
    __init__.py
    batting.py
    bowling.py
    fielding.py
    utils.py
```

### Step 2 -- Write the modules

```python
# cricket_stats/batting.py

def average(runs, dismissals):
    """Calculate batting average."""
    if dismissals == 0:
        return None
    return round(runs / dismissals, 2)

def strike_rate(runs, balls):
    """Calculate batting strike rate."""
    if balls == 0:
        return 0.0
    return round((runs / balls) * 100, 2)

def centuries_count(scores):
    """Count number of centuries (100+) in a list of scores."""
    return sum(1 for s in scores if s >= 100)

def highest_score(scores):
    """Return the highest score from a list."""
    return max(scores) if scores else 0
```

```python
# cricket_stats/bowling.py

def economy_rate(runs, overs):
    """Calculate bowling economy rate."""
    if overs == 0:
        return 0.0
    return round(runs / overs, 2)

def bowling_average(runs, wickets):
    """Calculate bowling average."""
    if wickets == 0:
        return None
    return round(runs / wickets, 2)

def bowling_strike_rate(balls, wickets):
    """Calculate bowling strike rate (balls per wicket)."""
    if wickets == 0:
        return None
    return round(balls / wickets, 2)
```

```python
# cricket_stats/utils.py

def classify_batsman(average):
    """Classify a batsman based on batting average."""
    if average is None:        return "Insufficient data"
    if average >= 50:          return "World Class"
    if average >= 40:          return "Excellent"
    if average >= 30:          return "Good"
    if average >= 20:          return "Average"
    return "Developing"

def format_player_report(name, stats_dict):
    """Format a player report as a readable string."""
    lines = [f"\n=== {name} ==="]
    for key, value in stats_dict.items():
        lines.append(f"  {key:<20}: {value}")
    return "\n".join(lines)
```

### Step 3 -- Write `__init__.py`

The `__init__.py` file controls what gets exposed when someone does
`import cricket_stats`. You can leave it empty, or use it to:

- Import commonly used items so they are accessible directly from the package
- Define `__all__` to control what `from package import *` exports
- Run package-level initialisation code

```python
# cricket_stats/__init__.py

"""
cricket_stats -- A Python package for cricket statistics.

Usage:
    import cricket_stats
    cricket_stats.batting.average(runs, dismissals)

    # Or import directly from the package (because of this __init__.py):
    from cricket_stats import batting_average
"""

# Package metadata
__version__ = "1.0.0"
__author__  = "Codeverra"

# Import commonly used functions directly into the package namespace
# This lets users do: from cricket_stats import batting_average
# instead of:         from cricket_stats.batting import average
from cricket_stats.batting import average   as batting_average
from cricket_stats.batting import strike_rate as batting_sr
from cricket_stats.bowling import economy_rate
from cricket_stats.bowling import bowling_average
from cricket_stats.utils   import classify_batsman, format_player_report

# Control what 'from cricket_stats import *' exports
__all__ = [
    "batting_average",
    "batting_sr",
    "economy_rate",
    "bowling_average",
    "classify_batsman",
    "format_player_report",
]
```

### Step 4 -- Use your package

```python
# main.py (in the same directory as the cricket_stats/ folder)

# Option 1: import the package and use submodules
import cricket_stats.batting as batting
import cricket_stats.bowling as bowling
from cricket_stats.utils import classify_batsman

avg = batting.average(12898, 241)
sr  = batting.strike_rate(12898, 6432)
eco = bowling.economy_rate(850, 120)

print(f"Batting Average : {avg}")
print(f"Strike Rate     : {sr}")
print(f"Economy Rate    : {eco}")
print(f"Classification  : {classify_batsman(avg)}")

# Option 2: use the shortcuts defined in __init__.py
from cricket_stats import batting_average, batting_sr, classify_batsman

avg = batting_average(9825, 243)
print(f"Rohit Average: {avg} [{classify_batsman(avg)}]")

# Option 3: check package metadata
import cricket_stats
print(cricket_stats.__version__)   # 1.0.0
```

---

## 8. Relative and Absolute Imports

When code inside a package needs to import from another module in the
same package, you have two choices.

### Absolute imports -- always use the full path from the project root

```python
# cricket_stats/bowling.py

# Absolute import -- works from anywhere
from cricket_stats.utils import classify_batsman
from cricket_stats.batting import average
```

### Relative imports -- use dots to mean "relative to this file"

```python
# cricket_stats/bowling.py

# Relative import -- . means "same package"
from .utils import classify_batsman     # . = cricket_stats/
from .batting import average            # . = cricket_stats/

# .. means "parent package"
from ..database import connection       # .. = one level up
```

**Which to use?**

PEP 8 (Python's style guide) recommends **absolute imports** for clarity.
They are always unambiguous -- you know exactly where something comes from.
Relative imports can be confusing in deep package hierarchies.

Use relative imports only within a package when you want the package to
be relocatable (i.e., if you rename the top-level package, internal imports
still work).

---

## 9. The Standard Library -- A Practical Tour

Python ships with a vast standard library -- hundreds of modules covering
everything from file handling to cryptography to HTTP servers. You do not
need to install any of it. It is already there.

The full library is documented at: https://docs.python.org/3/library/

Here are the modules you will reach for most often in everyday work:

---

### os -- Operating System Interface

```python
import os

# Current working directory
print(os.getcwd())                    # /home/aarav/projects

# Change directory
os.chdir("/home/aarav/data")

# List files in a directory
print(os.listdir("."))                # ['data.csv', 'notes.txt', ...]

# Check if a path exists
print(os.path.exists("data.csv"))     # True or False

# Join paths safely (works on Windows and Mac/Linux)
path = os.path.join("data", "raw", "sales.csv")
print(path)                           # data/raw/sales.csv (or data\raw\sales.csv on Windows)

# Create a directory
os.makedirs("output/charts", exist_ok=True)   # exist_ok=True -- no error if already exists

# Environment variables
print(os.environ.get("HOME"))         # /home/aarav
api_key = os.environ.get("OPENAI_API_KEY", "not set")

# Run a shell command
os.system("ls -la")                   # avoid this -- use subprocess instead

# Get file size
print(os.path.getsize("data.csv"))    # size in bytes
```

> Note: For most path operations, prefer `pathlib.Path` over `os.path`.
> pathlib is more modern, more readable, and object-oriented.
> `os` is still useful for environment variables, process management,
> and things pathlib does not cover.

---

### sys -- System-Specific Parameters

```python
import sys

# Python version
print(sys.version)           # 3.12.0 (...)
print(sys.version_info)      # sys.version_info(major=3, minor=12, ...)

# Command line arguments (when running: python script.py arg1 arg2)
print(sys.argv)              # ['script.py', 'arg1', 'arg2']
script_name = sys.argv[0]
arguments   = sys.argv[1:]

# Exit the program
# sys.exit(0)    -- clean exit (0 = success)
# sys.exit(1)    -- exit with error code

# The module search path (as discussed in Section 3)
print(sys.path)

# Platform
print(sys.platform)          # 'linux', 'darwin' (macOS), 'win32'

# Standard output and error streams
print("Normal output", file=sys.stdout)
print("Error output",  file=sys.stderr)
```

---

### datetime -- Working with Dates and Times

```python
from datetime import datetime, date, time, timedelta

# Current date and time
now   = datetime.now()
today = date.today()

print(now)     # 2024-03-15 14:30:22.123456
print(today)   # 2024-03-15

# Create specific dates
independence_day = date(1947, 8, 15)
ipl_start        = datetime(2024, 3, 22, 19, 30, 0)   # 7:30 PM

# Formatting -- strftime (datetime TO string)
print(now.strftime("%d %B %Y"))           # 15 March 2024
print(now.strftime("%d/%m/%Y %H:%M"))     # 15/03/2024 14:30
print(now.strftime("%A, %d %B %Y"))       # Friday, 15 March 2024

# Parsing -- strptime (string TO datetime)
date_str = "15-03-2024"
parsed   = datetime.strptime(date_str, "%d-%m-%Y")
print(parsed)   # 2024-03-15 00:00:00

api_timestamp = "2024-03-15T14:30:22Z"
parsed_api    = datetime.strptime(api_timestamp, "%Y-%m-%dT%H:%M:%SZ")

# Arithmetic with timedelta
deadline  = date.today() + timedelta(days=30)
last_week = datetime.now() - timedelta(weeks=1)
diff      = date.today() - independence_day
print(f"India has been independent for {diff.days} days")

# Comparing dates
if date.today() > independence_day:
    print("We are past independence day")

# Timestamps (Unix epoch -- seconds since Jan 1, 1970)
import time
timestamp = time.time()          # current timestamp as float
dt = datetime.fromtimestamp(timestamp)
print(dt)
```

---

### collections -- Specialised Container Types

```python
from collections import Counter, defaultdict, OrderedDict, namedtuple, deque

# Counter -- count occurrences of elements
ipl_winners = ["CSK", "MI", "CSK", "RCB", "MI", "CSK", "KKR", "MI", "MI", "CSK"]
counts = Counter(ipl_winners)
print(counts)                    # Counter({'CSK': 4, 'MI': 4, 'KKR': 1, 'RCB': 1})
print(counts.most_common(2))     # [('CSK', 4), ('MI', 4)]

# defaultdict -- dict that creates a default value for missing keys
# No more "if key not in dict: dict[key] = []"
from collections import defaultdict

dept_employees = defaultdict(list)   # default value is an empty list
employees = [("Aarav", "Engineering"), ("Priya", "HR"),
             ("Rohan", "Engineering"), ("Sneha", "HR"), ("Karan", "Sales")]

for name, dept in employees:
    dept_employees[dept].append(name)   # no KeyError even on first access

print(dict(dept_employees))
# {'Engineering': ['Aarav', 'Rohan'], 'HR': ['Priya', 'Sneha'], 'Sales': ['Karan']}

# namedtuple -- tuple with named fields (lightweight class)
Student = namedtuple("Student", ["name", "roll", "cgpa"])
s = Student("Aarav Sharma", 101, 8.9)
print(s.name)    # Aarav Sharma
print(s.cgpa)    # 8.9
print(s[0])      # Aarav Sharma  (still indexable like a tuple)

# deque -- double-ended queue (fast appends and pops from both ends)
from collections import deque
queue = deque(["Rohit", "Virat", "Dhoni"])
queue.appendleft("Shubman")    # add to front -- O(1)
queue.append("Jadeja")         # add to back  -- O(1)
print(queue.popleft())         # "Shubman"    -- remove from front
```

---

### math -- Mathematical Functions

```python
import math

print(math.sqrt(144))          # 12.0
print(math.ceil(4.1))          # 5
print(math.floor(4.9))         # 4
print(math.log(100, 10))       # 2.0
print(math.log2(1024))         # 10.0
print(math.factorial(10))      # 3628800
print(math.gcd(48, 18))        # 6
print(math.pi)                 # 3.14159...
print(math.e)                  # 2.71828...
print(math.inf)                # inf
print(math.isnan(float("nan")))  # True
print(math.isinf(math.inf))      # True
```

---

### random -- Random Number Generation

```python
import random

random.seed(42)   # set seed for reproducibility

# Random float between 0 and 1
print(random.random())                  # 0.6394...

# Random integer in range (inclusive)
print(random.randint(1, 6))             # dice roll

# Random float in range
print(random.uniform(10.5, 20.5))      # 14.32...

# Random choice from a sequence
players = ["Rohit", "Virat", "Dhoni", "Jadeja", "Bumrah"]
print(random.choice(players))          # one random player

# Multiple choices (with replacement)
print(random.choices(players, k=3))    # ['Virat', 'Rohit', 'Virat']

# Sample without replacement
print(random.sample(players, k=3))     # ['Dhoni', 'Bumrah', 'Jadeja']

# Shuffle a list in place
random.shuffle(players)
print(players)
```

---

### json -- JSON Encoding and Decoding

```python
import json

# Python dict to JSON string
data = {
    "name": "Aarav Sharma",
    "city": "Bangalore",
    "scores": [88, 92, 75],
    "enrolled": True,
    "grade": None
}

json_string = json.dumps(data, indent=2)    # indent for pretty printing
print(json_string)

# JSON string to Python dict
parsed = json.loads(json_string)
print(parsed["name"])     # Aarav Sharma
print(type(parsed))       # <class 'dict'>

# Read JSON from file
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Write JSON to file
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    # ensure_ascii=False preserves non-ASCII chars like Indian language text
```

---

### time -- Time Measurement

```python
import time

# Current time as Unix timestamp
print(time.time())           # 1710504622.123

# Sleep (pause execution)
time.sleep(1.5)              # sleep for 1.5 seconds

# Measure execution time
start = time.time()
result = sum(range(10_000_000))
elapsed = time.time() - start
print(f"Took {elapsed:.4f} seconds")

# More precise timing
start = time.perf_counter()
# ... code to time ...
elapsed = time.perf_counter() - start
```

---

### copy -- Shallow and Deep Copy

```python
import copy

original = {"name": "Aarav", "scores": [88, 92, 75]}

# Shallow copy -- top-level dict is new, but nested list is shared
shallow = copy.copy(original)
shallow["scores"].append(100)
print(original["scores"])    # [88, 92, 75, 100]  -- original affected!

# Deep copy -- completely independent at all levels
original = {"name": "Aarav", "scores": [88, 92, 75]}
deep = copy.deepcopy(original)
deep["scores"].append(100)
print(original["scores"])    # [88, 92, 75]  -- original unaffected
```

---

### typing -- Type Hints

```python
from typing import List, Dict, Tuple, Optional, Union, Callable, Any

def process_students(
    students: List[Dict[str, Any]],
    min_cgpa:  float = 6.0
) -> List[str]:
    """Return names of students above the minimum CGPA."""
    return [s["name"] for s in students if s["cgpa"] >= min_cgpa]

def safe_divide(a: float, b: float) -> Optional[float]:
    """Return a/b or None if b is zero."""
    if b == 0:
        return None
    return a / b

# Python does NOT enforce these at runtime
# They are hints for developers and tools like mypy
```

---

## 10. pip -- Installing Third-Party Packages

`pip` is Python's package installer. It downloads packages from PyPI
(the Python Package Index at https://pypi.org) and installs them into
your Python environment.

### Basic pip commands

```bash
# Install a package
pip install requests

# Install a specific version
pip install requests==2.31.0

# Install the latest version that is compatible with a constraint
pip install "requests>=2.28,<3.0"

# Upgrade a package to the latest version
pip install --upgrade pandas

# Uninstall a package
pip uninstall numpy

# List all installed packages
pip list

# Show details about a specific package
pip show pandas

# Search for packages (deprecated on PyPI, use the website instead)
# pip search "data visualisation"

# Check for outdated packages
pip list --outdated
```

### Installing from a requirements file

```bash
pip install -r requirements.txt
```

### Where pip installs packages

By default, pip installs into the **global** Python environment. This is the
source of many problems (covered in the virtual environments section). The
right workflow is always: create a virtual environment first, then pip install.

```bash
# WRONG -- installs globally, causes version conflicts
pip install pandas

# RIGHT -- install into an active virtual environment
python -m venv venv
source venv/bin/activate    # Mac/Linux
pip install pandas          # now installs into venv only
```

### pip vs pip3

On systems with both Python 2 and Python 3 installed, `pip` might refer
to Python 2's pip and `pip3` to Python 3's. On modern systems with only
Python 3, they are the same. The safest form is always:

```bash
python -m pip install requests
# This explicitly uses the pip associated with whichever python you are using
```

---

## 11. requirements.txt -- Sharing Dependencies

A `requirements.txt` file lists all the packages your project depends on.
It is how you tell teammates (and servers) exactly what needs to be installed
to run your code.

### Creating requirements.txt

```bash
# Manually -- write out what your project actually needs
# requirements.txt:
pandas==2.1.4
numpy==1.26.2
matplotlib==3.8.2
seaborn==0.13.0
requests==2.31.0

# Automatically -- capture everything currently installed
pip freeze > requirements.txt
# Warning: pip freeze captures ALL packages, including indirect dependencies.
# This creates a very long file. Fine for exact reproducibility,
# but consider manually listing only your direct dependencies for clarity.
```

### requirements.txt version specifiers

```
# Exact version -- maximum reproducibility
pandas==2.1.4

# Minimum version -- "at least this"
requests>=2.28.0

# Compatible release -- "same major.minor, any patch"
numpy~=1.26.0       # means >=1.26.0, <1.27.0

# Range -- useful for avoiding known-broken versions
scipy>=1.11,<2.0

# No version constraint -- just needs to be installed
matplotlib
```

### Multiple requirements files

Large projects often have separate requirements files for different purposes:

```
requirements.txt          -- production dependencies only
requirements-dev.txt      -- adds testing and development tools
requirements-test.txt     -- testing tools only

# requirements-dev.txt
-r requirements.txt       # include everything from production
pytest==7.4.3
black==23.11.0
mypy==1.7.1
jupyter==1.0.0
```

---

## 12. Virtual Environments -- Why They Are Non-Negotiable

This is the concept that most beginners skip and regret later.

### The problem

When you run `pip install pandas`, it installs pandas into your **global**
Python environment -- the one Python installation on your machine.

Now imagine:

```
Project A (built 2022):
  pandas 1.3.5
  numpy  1.21.0
  scikit-learn 1.0.2

Project B (built 2024):
  pandas 2.1.4
  numpy  1.26.2
  scikit-learn 1.3.2
```

These two projects need different versions of the same libraries.
If you install pandas 2.1.4 globally, Project A might break because it
uses APIs that were removed in pandas 2.x.

This is the **dependency conflict problem**. It affects every Python
developer who works on more than one project.

### The solution -- virtual environments

A virtual environment is an **isolated Python installation** specific to
one project. It has its own copy of pip and its own site-packages directory.

```
my_machine/
    Python 3.12 (global)     <-- base installation, keep it clean
    |
    project_a/
        venv/                <-- isolated environment for project_a
            lib/python3.12/site-packages/
                pandas-1.3.5/
                numpy-1.21.0/
    |
    project_b/
        venv/                <-- isolated environment for project_b
            lib/python3.12/site-packages/
                pandas-2.1.4/
                numpy-1.26.2/
```

Project A and Project B have completely separate dependencies.
They never conflict. You can work on both simultaneously.

### The golden rule

**Every project gets its own virtual environment. No exceptions.**

---

## 13. venv -- The Built-In Solution

`venv` is Python's built-in virtual environment tool. No installation required.

### Creating and using a virtual environment

```bash
# Step 1: Create a virtual environment
# Convention: name it 'venv' or '.venv' inside your project directory
python -m venv venv

# What this creates:
# venv/
#     bin/          (Mac/Linux) or Scripts/ (Windows)
#         python
#         pip
#     lib/
#         python3.12/
#             site-packages/   <-- packages install here
#     pyvenv.cfg


# Step 2: Activate the environment
# Mac / Linux:
source venv/bin/activate

# Windows (Command Prompt):
venv\Scripts\activate.bat

# Windows (PowerShell):
venv\Scripts\Activate.ps1

# You will see (venv) prefix in your terminal:
# (venv) aarav@laptop:~/projects/my_project$


# Step 3: Install packages -- they go into the venv, not globally
pip install pandas numpy matplotlib


# Step 4: Work on your project
python main.py
jupyter notebook


# Step 5: Deactivate when done
deactivate
# (venv) prefix disappears -- you are back to global environment
```

### The .gitignore rule

**Always add your venv directory to `.gitignore`.** You do not commit the
virtual environment to version control -- it is too large and machine-specific.
Instead, commit `requirements.txt` so anyone can recreate it.

```
# .gitignore
venv/
.venv/
__pycache__/
*.pyc
.env
```

### Recreating an environment from requirements.txt

```bash
# Another developer (or you, on a new machine) does:
git clone https://github.com/your/project
cd project
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Exact same environment, every time
```

---

## 14. conda -- The Data Science Standard

`conda` is a package and environment manager from Anaconda.
Unlike `pip` + `venv`, conda manages both Python packages AND
non-Python dependencies (like C libraries that NumPy and SciPy depend on).

This makes it particularly well-suited for data science, machine learning,
and scientific computing where many packages have complex native dependencies.

### Anaconda vs Miniconda

**Anaconda:** Full distribution. Installs Python, conda, and 250+ data science
packages out of the box (pandas, numpy, matplotlib, scikit-learn, jupyter, etc.).
Large download (~3GB). Good for beginners who want everything ready.

**Miniconda:** Minimal distribution. Just Python and conda. You install only
what you need. Smaller, faster, recommended for experienced users.

Download links:
- Anaconda: https://www.anaconda.com/download
- Miniconda: https://docs.anaconda.com/miniconda/

### Core conda commands

```bash
# Check conda version
conda --version

# Update conda itself
conda update conda

# Create a new environment
conda create --name my_project python=3.11

# Create with specific packages
conda create --name ds_project python=3.11 pandas numpy matplotlib jupyter

# Activate an environment
conda activate my_project

# Deactivate
conda deactivate

# List all environments
conda env list
# or:
conda info --envs

# Install a package into active environment
conda install pandas
conda install -c conda-forge some_package   # install from conda-forge channel

# You can still use pip inside a conda environment
pip install some_package_not_on_conda

# List packages in current environment
conda list

# Remove an environment
conda env remove --name my_project

# Export environment to a file
conda env export > environment.yml

# Recreate environment from file
conda env create -f environment.yml
```

### environment.yml -- conda's requirements file

```yaml
# environment.yml
name: codeverra_ds
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.11
  - pandas=2.1.4
  - numpy=1.26.2
  - matplotlib=3.8.2
  - seaborn=0.13.0
  - scikit-learn=1.3.2
  - jupyter=1.0.0
  - pip
  - pip:
    - some-package-only-on-pypi==1.2.3
```

```bash
# Create environment from yml
conda env create -f environment.yml

# Update environment when yml changes
conda env update -f environment.yml --prune
```

### conda channels

Channels are repositories where conda looks for packages.
The two most important ones:

- **defaults:** Anaconda's own channel. Most stable, slightly outdated.
- **conda-forge:** Community-maintained channel. More packages, more up-to-date.

```bash
# Install from conda-forge
conda install -c conda-forge plotly

# Set conda-forge as default channel
conda config --add channels conda-forge
conda config --set channel_priority strict
```

Official conda documentation: https://docs.conda.io/en/latest/

---

## 15. Other Tools -- virtualenv, uv

### virtualenv

`virtualenv` is the original virtual environment tool that inspired Python's
built-in `venv`. It is slightly faster than `venv`, supports older Python
versions, and has a few extra features that `venv` lacks. For most modern
Python 3 development, `venv` is sufficient. `virtualenv` is worth knowing
because many older tutorials and projects use it.

```bash
pip install virtualenv

virtualenv my_env
source my_env/bin/activate
```

Documentation: https://virtualenv.pypa.io/en/latest/

### uv -- The Modern High-Performance Alternative

`uv` is a very new (2024) Rust-based Python package manager and environment
tool built by Astral (the team behind the `ruff` linter). It is designed to
be a drop-in replacement for pip and venv, but dramatically faster.

Key claim: `uv` installs packages 10x to 100x faster than `pip`.
It also resolves dependencies more reliably.

```bash
# Install uv
pip install uv
# or on Mac/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create a virtual environment
uv venv

# Install packages (replaces pip install)
uv pip install pandas numpy matplotlib

# Install from requirements.txt
uv pip install -r requirements.txt

# Sync environment to exact requirements
uv pip sync requirements.txt

# Run a script in an isolated environment (no manual activation needed)
uv run script.py
```

`uv` is gaining adoption quickly in the Python community. It is worth
watching even if you start with venv + pip.

Documentation: https://docs.astral.sh/uv/

### pipenv

Another tool that combines pip and virtualenv. Was popular around 2018-2020
but has largely been superseded by venv (for simplicity) and uv (for speed).
Mentioned here because you will encounter it in older projects.

Documentation: https://pipenv.pypa.io/en/latest/

---

## 16. Which Tool Should You Use?

The tool landscape can be confusing. Here is a practical guide:

```
Are you doing data science / ML / scientific computing?
    YES --> Use conda (Miniconda recommended)
            conda manages non-Python dependencies much better
            Handles numpy, scipy, tensorflow, pytorch cleanly
    NO  --> Continue below

Are you on a modern project (2024+) and value speed?
    YES --> Consider uv
            Dramatically faster installs
            Compatible with pip and requirements.txt
            Growing community adoption
    NO  --> Continue below

Are you a beginner or on a simple project?
    YES --> Use venv + pip
            Built into Python, no extra installation
            Works everywhere, well-documented
            Fine for 90% of projects
```

**Summary table:**

| Tool | Best for | Install | Speed | Non-Python deps |
|---|---|---|---|---|
| venv + pip | General Python, beginners | Built-in | Moderate | No |
| conda | Data science, ML, scientific | Separate download | Moderate | Yes |
| uv | Modern projects, speed matters | pip install uv | Very fast | No |
| virtualenv | Compatibility with older Python | pip install | Fast | No |

**The one rule that applies to all of them:**

**Always use an isolated environment. Never install project dependencies globally.**

---

## 17. Practice Questions

Try each question before reading the solution in Section 18.
Questions are ordered: Easy (1-5), Medium (6-10), Hard (11-15).

---

### Easy

**Q1 -- Import Styles**
Given a module `geometry.py` with functions `circle_area(r)`, `rectangle_area(l, w)`,
and a constant `PI = 3.14159`, write four different ways to import and use `circle_area`.
Explain when you would use each style.

---

**Q2 -- __name__ Guard**
The file below has a bug -- it prints output every time it is imported.
Fix it so the print statements only run when the file is executed directly.

```python
# temperature.py
def celsius_to_fahrenheit(c):
    return (c * 9/5) + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5/9

print("Testing conversions:")
print(celsius_to_fahrenheit(100))
print(fahrenheit_to_celsius(32))
```

---

**Q3 -- Standard Library**
Using only the Python standard library (no pip installs), write a script that:
- Gets the current date and time
- Formats it as "Day DD Month YYYY, HH:MM" (e.g., "Friday 15 March 2024, 14:30")
- Calculates how many days until the next New Year's Day
- Prints both

---

**Q4 -- collections.Counter**
Given a list of 50 random dice rolls (use `random.randint(1, 6)`), use `Counter` to:
- Count how many times each number appeared
- Find the most common roll
- Find the least common roll
- Print a simple frequency bar chart using only string multiplication

---

**Q5 -- defaultdict**
Without using any if statements, rewrite the following code using `defaultdict`:

```python
# Original -- uses if to handle missing keys
word_positions = {}
words = "the cat sat on the mat the cat wore a hat".split()

for i, word in enumerate(words):
    if word not in word_positions:
        word_positions[word] = []
    word_positions[word].append(i)

print(word_positions)
```

---

### Medium

**Q6 -- Build a Module**
Create a module called `indian_holidays.py` that contains:
- A dictionary of major Indian national holidays with their dates (at least 6)
- A function `get_holiday(date_str)` that returns the holiday name for a given
  "DD-MM" string, or "No holiday" if none
- A function `holidays_in_month(month_num)` that returns all holidays in that month
- A function `days_until_next_holiday()` that returns the name and number of days
  until the next upcoming holiday
- A proper `if __name__ == "__main__":` section that demos all three functions

---

**Q7 -- Package Structure**
Design the folder structure for a package called `school_manager` that handles:
- Student records (create, update, delete, search)
- Course management (add courses, assign to students)
- Grade tracking (record grades, calculate averages, generate reports)
- Utilities (validators, formatters)

Write out the full directory tree with all file names.
Then write the `__init__.py` that exposes the 5 most useful functions
directly from the top-level package.

---

**Q8 -- sys.argv**
Write a command-line script `csv_stats.py` that:
- Takes a CSV filename as a command-line argument
- Validates the argument exists and the file exists
- Reads the CSV using only the standard library
- Prints: number of rows, number of columns, column names, and any rows
  where any field is empty
- Shows usage instructions if called with wrong arguments

Usage: `python csv_stats.py data.csv`

---

**Q9 -- requirements.txt and Environments**
You are given the following scenario. Write out the exact sequence of
terminal commands you would run for each step:

1. Create a new project directory called `cricket_analytics`
2. Create a virtual environment inside it
3. Activate the environment
4. Install pandas 2.1.4, matplotlib 3.8.2, and seaborn 0.13.0
5. Create a requirements.txt
6. Deactivate the environment

Then write the `.gitignore` entries for this project.

---

**Q10 -- Module Search Path**
Explain what happens step by step when Python executes this line:

```python
import pandas
```

Include: where Python looks, what file it finds, what `sys.modules` does,
and what you can inspect on the `pandas` module object after import.
Write this as a numbered explanation, not code.

---

### Hard

**Q11 -- Custom Namespace Package**
Build a package `data_toolkit` with the following submodules:
- `data_toolkit.io` -- `read_csv(path)`, `write_csv(data, path)`, `read_json(path)`
- `data_toolkit.clean` -- `remove_duplicates(data)`, `fill_missing(data, value)`, `trim_strings(data)`
- `data_toolkit.stats` -- `mean(values)`, `median(values)`, `std_dev(values)`, `percentile(values, p)`

Write a complete `__init__.py` that:
- Exposes the most commonly used functions at the top level
- Sets `__version__`, `__author__`, `__all__`
- Prints a deprecation warning if Python version is below 3.9

---

**Q12 -- Environment Investigation**
Write a Python script `env_doctor.py` that diagnoses the current Python environment:
- Python version (and whether it is at least 3.9)
- Whether running inside a virtual environment or not
- Location of the Python executable
- Number of installed packages
- Location of site-packages
- Top 5 largest installed packages by directory size
- Whether common data science packages are installed (pandas, numpy, matplotlib, sklearn)
  and their versions if installed

Hint: use `sys`, `os`, `importlib`, and `pkg_resources` or `importlib.metadata`.

---

**Q13 -- Lazy Import Pattern**
Some imports are expensive (take significant time or memory). A common pattern
is to delay importing a heavy module until it is actually needed.

Write a class `LazyImporter` that:
- Takes a module name in `__init__`
- Does NOT import the module immediately
- Imports it on first attribute access
- Caches the module after first import
- Works transparently -- `lazy.some_function()` should work exactly like
  `module.some_function()`

```python
# Usage:
np = LazyImporter("numpy")
pd = LazyImporter("pandas")

# No import happens yet -- just two LazyImporter objects

# Import happens HERE, on first use
arr = np.array([1, 2, 3])     # numpy imported now
df  = pd.DataFrame({"a": [1,2,3]})  # pandas imported now

# Subsequent uses use the cached module
arr2 = np.array([4, 5, 6])    # no re-import
```

---

**Q14 -- Plugin System**
Build a simple plugin architecture using Python's import machinery.
The system should:
- Have a `plugins/` directory where new functionality can be dropped in
- Each plugin is a Python file with a `register()` function and a `PLUGIN_NAME` constant
- A `PluginManager` class that scans the plugins directory, imports all valid plugins,
  and registers them
- Support calling a plugin by name: `manager.run("csv_exporter", data)`

Write two sample plugins: `csv_exporter.py` and `json_exporter.py`.

---

**Q15 -- Full Project Setup**
You are starting a new data analysis project for IPL statistics.
Create the complete project scaffold:

1. Full directory structure with all files (including empty ones)
2. A `setup.py` or `pyproject.toml` with project metadata
3. `requirements.txt` and `requirements-dev.txt`
4. `.gitignore`
5. A `README.md` template
6. A `config.py` module that reads settings from environment variables
   with sensible defaults
7. A `logger.py` module that sets up a standard logger for the project
8. An `__init__.py` for the main package that exposes version info

The project should follow professional Python project structure conventions.

---

## 18. Solutions

---

### Q1 -- Import Styles

```python
# geometry.py (the module we are importing from)
PI = 3.14159

def circle_area(r):
    return PI * r ** 2

def rectangle_area(l, w):
    return l * w
```

```python
# Way 1: import the whole module
# Use when: you want explicit namespace, avoid name collisions
import geometry
area = geometry.circle_area(7)

# Way 2: from ... import specific name
# Use when: you use the function frequently and want shorter syntax
from geometry import circle_area
area = circle_area(7)

# Way 3: import with alias
# Use when: the module name is long or conflicts with something
import geometry as geo
area = geo.circle_area(7)

# Way 4: from ... import with alias
# Use when: the function name conflicts with something in current scope
from geometry import circle_area as c_area
area = c_area(7)

print(area)   # 153.938...
```

---

### Q2 -- __name__ Guard

```python
# temperature.py -- fixed

def celsius_to_fahrenheit(c):
    return (c * 9/5) + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5/9

# Only runs when this file is executed directly, not when imported
if __name__ == "__main__":
    print("Testing conversions:")
    print(celsius_to_fahrenheit(100))   # 212.0
    print(fahrenheit_to_celsius(32))    # 0.0
```

---

### Q3 -- Standard Library Date Work

```python
from datetime import datetime, date

now   = datetime.now()
today = date.today()

# Format: "Friday 15 March 2024, 14:30"
formatted = now.strftime("%A %d %B %Y, %H:%M")
print(f"Current date and time: {formatted}")

# Days until next New Year's Day
current_year  = today.year
next_new_year = date(current_year + 1, 1, 1)
days_until    = (next_new_year - today).days

print(f"Days until New Year ({next_new_year}): {days_until}")
```

---

### Q4 -- Counter Dice Rolls

```python
import random
from collections import Counter

random.seed(42)
rolls = [random.randint(1, 6) for _ in range(50)]

counts = Counter(rolls)

most_common  = counts.most_common(1)[0]
least_common = counts.most_common()[-1]

print(f"Most common roll  : {most_common[0]} (appeared {most_common[1]} times)")
print(f"Least common roll : {least_common[0]} (appeared {least_common[1]} times)")

print("\nFrequency chart:")
for face in range(1, 7):
    bar = "#" * counts[face]
    print(f"  {face}: {bar:<20} ({counts[face]})")
```

---

### Q5 -- defaultdict

```python
from collections import defaultdict

word_positions = defaultdict(list)   # default value is an empty list
words = "the cat sat on the mat the cat wore a hat".split()

for i, word in enumerate(words):
    word_positions[word].append(i)   # no KeyError, no if statement needed

print(dict(word_positions))
# {'the': [0, 4, 6], 'cat': [1, 7], 'sat': [2], ...}
```

---

### Q6 -- Indian Holidays Module

```python
# indian_holidays.py

"""
indian_holidays -- Indian national and major public holidays.

Functions:
    get_holiday(date_str)         -- look up by "DD-MM"
    holidays_in_month(month_num)  -- all holidays in a month
    days_until_next_holiday()     -- countdown to next holiday
"""

from datetime import date, datetime, timedelta


# Major Indian national and public holidays
# Format: "DD-MM" -> "Holiday Name"
HOLIDAYS = {
    "26-01": "Republic Day",
    "14-04": "Dr. Ambedkar Jayanti",
    "01-05": "Labour Day / Maharashtra Day",
    "15-08": "Independence Day",
    "02-10": "Gandhi Jayanti",
    "25-12": "Christmas Day",
    "01-01": "New Year's Day",
    "14-01": "Makar Sankranti / Pongal",
}


def get_holiday(date_str):
    """
    Return holiday name for a given date string "DD-MM".

    Args:
        date_str (str): Date in "DD-MM" format (e.g., "15-08")

    Returns:
        str: Holiday name or "No holiday on this date"
    """
    return HOLIDAYS.get(date_str, "No holiday on this date")


def holidays_in_month(month_num):
    """
    Return all holidays in the given month.

    Args:
        month_num (int): Month number 1-12

    Returns:
        dict: {date_str: holiday_name} for all holidays in the month
    """
    return {
        date_str: name
        for date_str, name in HOLIDAYS.items()
        if int(date_str.split("-")[1]) == month_num
    }


def days_until_next_holiday():
    """
    Find the next upcoming Indian holiday and how many days away it is.

    Returns:
        tuple: (holiday_name, days_remaining, holiday_date)
    """
    today         = date.today()
    current_year  = today.year
    closest_name  = None
    closest_days  = float("inf")
    closest_date  = None

    for date_str, name in HOLIDAYS.items():
        day, month = map(int, date_str.split("-"))

        # Try this year first
        holiday_date = date(current_year, month, day)
        if holiday_date < today:
            # Holiday has passed -- try next year
            holiday_date = date(current_year + 1, month, day)

        days_away = (holiday_date - today).days
        if days_away < closest_days:
            closest_days  = days_away
            closest_name  = name
            closest_date  = holiday_date

    return closest_name, closest_days, closest_date


if __name__ == "__main__":
    print("=== Indian Holidays Demo ===\n")

    # get_holiday
    print("15-08:", get_holiday("15-08"))   # Independence Day
    print("10-07:", get_holiday("10-07"))   # No holiday

    # holidays_in_month
    print("\nHolidays in January:")
    for date_str, name in holidays_in_month(1).items():
        print(f"  {date_str}: {name}")

    # days_until_next_holiday
    name, days, hdate = days_until_next_holiday()
    print(f"\nNext holiday: {name} on {hdate} ({days} days away)")
```

---

### Q7 -- Package Structure

```
school_manager/
    __init__.py
    students/
        __init__.py
        records.py          -- create_student, update_student, delete_student, search_students
        enrollment.py       -- enroll_student, unenroll_student, get_enrolled_courses
    courses/
        __init__.py
        management.py       -- add_course, remove_course, update_course, list_courses
        assignment.py       -- assign_course_to_student, get_course_students
    grades/
        __init__.py
        tracking.py         -- record_grade, update_grade, get_student_grades
        reports.py          -- generate_report, calculate_average, get_class_topper
    utils/
        __init__.py
        validators.py       -- validate_roll_number, validate_grade, validate_email
        formatters.py       -- format_student_report, format_grade_card
```

```python
# school_manager/__init__.py

"""
school_manager -- A complete school management system.
"""

__version__ = "1.0.0"
__author__  = "Codeverra"

# Expose the 5 most useful functions at the top level
from school_manager.students.records      import create_student, search_students
from school_manager.grades.tracking       import record_grade
from school_manager.grades.reports        import generate_report, get_class_topper

__all__ = [
    "create_student",
    "search_students",
    "record_grade",
    "generate_report",
    "get_class_topper",
]
```

---

### Q8 -- sys.argv CSV Stats

```python
# csv_stats.py

import sys
import csv
import os


def print_usage():
    print("Usage: python csv_stats.py <filename.csv>")
    print("Example: python csv_stats.py students.csv")


def analyse_csv(filepath):
    """Read and print statistics about a CSV file."""
    rows        = []
    empty_rows  = []

    with open(filepath, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames

        for i, row in enumerate(reader, start=2):   # start=2 because row 1 is header
            rows.append(row)
            empty_fields = [col for col, val in row.items() if not val.strip()]
            if empty_fields:
                empty_rows.append((i, empty_fields))

    print(f"\nFile       : {filepath}")
    print(f"Rows       : {len(rows)}")
    print(f"Columns    : {len(headers)}")
    print(f"Column names: {', '.join(headers)}")

    if empty_rows:
        print(f"\nRows with empty fields ({len(empty_rows)} found):")
        for row_num, fields in empty_rows[:10]:   # show first 10 only
            print(f"  Row {row_num}: empty fields = {fields}")
    else:
        print("\nNo empty fields found.")


def main():
    # Validate arguments
    if len(sys.argv) != 2:
        print("Error: exactly one argument required.")
        print_usage()
        sys.exit(1)

    filepath = sys.argv[1]

    if not os.path.exists(filepath):
        print(f"Error: file not found: {filepath}")
        sys.exit(1)

    if not filepath.endswith(".csv"):
        print(f"Warning: file does not have .csv extension: {filepath}")

    try:
        analyse_csv(filepath)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
```

---

### Q9 -- Virtual Environment Commands

```bash
# 1. Create project directory
mkdir cricket_analytics
cd cricket_analytics

# 2. Create virtual environment
python -m venv venv

# 3. Activate
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate.bat       # Windows

# 4. Install packages
pip install pandas==2.1.4 matplotlib==3.8.2 seaborn==0.13.0

# 5. Create requirements.txt
pip freeze > requirements.txt

# 6. Deactivate
deactivate
```

```
# .gitignore
venv/
.venv/
__pycache__/
*.pyc
*.pyo
.env
.env.local
*.egg-info/
dist/
build/
.ipynb_checkpoints/
.DS_Store
```

---

### Q10 -- What Happens When You Import pandas

```
1. Python checks sys.modules first.
   If "pandas" is already in sys.modules (imported earlier in this session),
   Python returns the cached module object immediately -- no re-import.

2. If not cached, Python searches sys.path in order:
   a. The current directory / script directory
   b. PYTHONPATH directories (if set)
   c. Standard library directories
   d. site-packages directory (where pip installs packages)

3. Python finds pandas in site-packages, typically at:
   .../lib/python3.12/site-packages/pandas/__init__.py
   (pandas is a package, so Python enters the pandas/ directory)

4. Python executes pandas/__init__.py, which:
   - Imports pandas submodules (core, io, plotting, etc.)
   - Sets up the public API (__all__, version info, etc.)
   - Runs any package-level initialisation

5. The resulting module object is stored in sys.modules["pandas"]
   so future imports of pandas skip steps 2-4.

6. The name 'pandas' is bound in the current namespace, pointing to
   the module object in sys.modules.

After import, you can inspect:
   pandas.__file__     -- path to pandas/__init__.py
   pandas.__version__  -- version string
   pandas.__path__     -- package directory
   pandas.__name__     -- "pandas"
   dir(pandas)         -- all exported names
```

---

### Q11 -- Q15

Questions 11 through 15 are extended project-level exercises.
Full reference solutions are available on learn.codeverra.com.

**Guidance:**

- Q11: Write each submodule independently, test it, then write `__init__.py` last
- Q12: `sys.prefix != sys.base_prefix` is how you detect a virtual environment
- Q13: The key is `__getattr__` on the LazyImporter class
- Q14: Use `importlib.import_module()` to dynamically import plugins by name
- Q15: See the Python project structure guide at https://packaging.python.org

---

## 19. What Comes Next

### What This Guide Covered

| Section | Topics |
|---|---|
| Modules | .py files as modules, all import styles, namespaces |
| Module discovery | sys.path, search order, common import errors |
| __name__ | The `if __name__ == "__main__"` guard and why it exists |
| Your own modules | Writing reusable modules with docstrings and clean APIs |
| Packages | Directory structure, __init__.py, building a real package |
| Relative imports | Dot notation, when to use absolute vs relative |
| Standard library | os, sys, datetime, collections, math, random, json, time, copy, typing |
| pip | Install, upgrade, uninstall, pip freeze, python -m pip |
| requirements.txt | Version specifiers, multiple files, dev dependencies |
| Virtual environments | The dependency conflict problem and why venv is essential |
| venv | Create, activate, deactivate, .gitignore rules |
| conda | Anaconda vs Miniconda, commands, environment.yml, channels |
| Other tools | virtualenv, uv (with documentation links) |
| Choosing a tool | Decision guide for which environment tool to use |

### Next in the Curriculum

With modules and packages understood, everything else becomes clearer:

- When you write `import requests` in the next module (Working with the Real World),
  you now know exactly what Python is doing to find and load it
- When you create a data science project and conda creates an environment.yml,
  you know what that file is for
- When a teammate says "just pip install from requirements.txt", you know exactly
  what to do

The next blog in this series is:

**Working with the Real World -- requests, datetime, and JSON**
APIs, HTTP requests, parsing responses, working with timestamps,
and building a complete project that calls a real API and processes the data.

---

*Made with care for Codeverra learners | codeverra.com*
