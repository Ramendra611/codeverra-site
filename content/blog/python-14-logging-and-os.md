---
title: "Logging and System Interaction in Python"
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Logging and System Interaction in Python
### Professional Observability with the logging Module and the os Module

---

## Before We Begin -- Why This Matters More Than It Looks

Here is a situation every developer eventually faces.

You write a script that processes data overnight. It runs on a server
while you sleep. In the morning you check the output and something is
wrong. Half the records are missing. You have no idea what happened
because your script used `print()` for all its messages and those prints
went nowhere -- there was nobody watching the terminal.

Or this. A script runs fine on your laptop but crashes in production.
You look at the server logs and find nothing useful because your code
never wrote any logs. You have to add print statements, redeploy, and
wait for the problem to happen again.

Both situations have the same root cause. `print()` is not a logging
system. It has no levels, no timestamps, no file output, no way to
turn it on or off without editing code, and no way to know which
part of a large codebase generated a particular message.

The `logging` module solves all of this. It is what every professional
Python project uses. Learning it properly is the difference between code
that is observable and code that is a black box.

The `os` module solves a different but equally practical problem: your
Python code needs to interact with the operating system. Read environment
variables. Walk directory trees. Check if paths exist. Run shell commands.
`os` is how Python talks to the machine it runs on.

---

## Table of Contents

1. [The Problem with print()](#1-the-problem-with-print)
2. [The Five Log Levels](#2-the-five-log-levels)
3. [Basic Logging with basicConfig](#3-basic-logging-with-basicconfig)
4. [The Right Way -- Named Loggers](#4-the-right-way----named-loggers)
5. [Handlers -- Where Logs Go](#5-handlers----where-logs-go)
6. [Formatters -- What Logs Look Like](#6-formatters----what-logs-look-like)
7. [Logging to Multiple Destinations](#7-logging-to-multiple-destinations)
8. [Rotating Log Files](#8-rotating-log-files)
9. [Logging Across Multiple Modules](#9-logging-across-multiple-modules)
10. [A Production-Ready Logging Setup](#10-a-production-ready-logging-setup)
11. [The os Module -- System Interaction](#11-the-os-module----system-interaction)
12. [Environment Variables -- The Right Way](#12-environment-variables----the-right-way)
13. [Walking Directory Trees with os.walk](#13-walking-directory-trees-with-oswalk)
14. [Running Shell Commands -- os.system vs subprocess](#14-running-shell-commands----ossystem-vs-subprocess)
15. [Putting It Together -- A Data Pipeline](#15-putting-it-together----a-data-pipeline)
16. [Summary and Key Takeaways](#16-summary-and-key-takeaways)

---

## 1. The Problem with print()

```python
# Typical beginner approach -- print everything
def process_orders(orders):
    print("Starting order processing")
    for order in orders:
        print(f"Processing order {order['id']}")
        if order['amount'] > 10000:
            print(f"Large order detected: {order['id']}")
        result = calculate_total(order)
        print(f"Order {order['id']} done. Total: {result}")
    print("All orders processed")
```

This looks fine when you are watching a terminal. In production:

- **No timestamps.** You cannot tell when something happened.
- **No severity.** Is "Large order detected" information or a warning?
- **No persistence.** Output disappears when the terminal closes.
- **Cannot be filtered.** You cannot turn off the noise without editing code.
- **Cannot be routed.** You cannot send errors to one place and info to another.
- **No source information.** In a large codebase, which file generated this?

The logging module solves every one of these problems.

```python
# The professional approach
import logging

logger = logging.getLogger(__name__)

def process_orders(orders):
    logger.info("Starting order processing. Count: %d", len(orders))
    for order in orders:
        logger.debug("Processing order %s", order['id'])
        if order['amount'] > 10000:
            logger.warning("Large order: %s (Rs.%s)", order['id'], order['amount'])
        result = calculate_total(order)
        logger.debug("Order %s complete. Total: Rs.%.2f", order['id'], result)
    logger.info("All orders processed successfully")
```

Now every message has a level, can be filtered, can be written to a file,
and carries the module name automatically.

---

## 2. The Five Log Levels

Log levels let you categorise the severity of each message. You set a
minimum level and anything below it is silently ignored.

```
Level       Value   When to use it
────────────────────────────────────────────────────────────────────
DEBUG       10      Detailed diagnostic information. The most verbose
                    level. Used during development to trace exactly
                    what the program is doing step by step.
                    Example: "Entering function calculate_total with args (order_id=42)"

INFO        20      Confirmation that things are working as expected.
                    High-level progress markers.
                    Example: "Successfully loaded 500 records from CSV"

WARNING     30      Something unexpected happened but the program can
                    continue. Or a potential problem in the near future.
                    Example: "Disk space below 10%. Consider cleaning up."

ERROR       40      A serious problem. The program could not do something
                    it was supposed to do.
                    Example: "Failed to connect to database after 3 retries"

CRITICAL    50      A very serious error that may prevent the program
                    from continuing at all.
                    Example: "Could not write to output directory. Stopping."
```

```python
import logging

# Setting level to INFO means: show INFO, WARNING, ERROR, CRITICAL
# but ignore DEBUG messages
logging.basicConfig(level=logging.INFO)

logging.debug("This will NOT appear -- below INFO level")
logging.info("This WILL appear")
logging.warning("This WILL appear")
logging.error("This WILL appear")
logging.critical("This WILL appear")
```

**The rule of thumb:**

```
DEBUG    -- you want to see when actively debugging a problem
INFO     -- normal operation, always safe to show
WARNING  -- something to investigate, does not require immediate action
ERROR    -- something failed, requires attention
CRITICAL -- the application cannot continue, requires immediate action
```

---

## 3. Basic Logging with basicConfig

`basicConfig` is the quickest way to get logging working. It configures
the root logger -- the parent of all loggers in your application.

```python
import logging

# Most basic setup -- logs to console at WARNING level by default
logging.basicConfig()

# Set level and format
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s -- %(levelname)s -- %(message)s"
)

# Log to a file instead of console
logging.basicConfig(
    level=logging.INFO,
    filename="app.log",
    filemode="a",          # "a" appends, "w" overwrites each run
    encoding="utf-8",
    format="%(asctime)s -- %(levelname)s -- %(name)s -- %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
```

**Important limitation of basicConfig:** It only works once. If it has
already been called (even by an imported library), subsequent calls do
nothing. For anything beyond a quick script, use named loggers with
explicit handlers instead.

---

## 4. The Right Way -- Named Loggers

The professional way to use logging is with named loggers, not the root logger.

```python
import logging

# Create a logger for this specific module
# __name__ resolves to the module's full dotted name
# e.g., "mypackage.data_loader" or "__main__" in a script
logger = logging.getLogger(__name__)
```

This one line at the top of every module is the standard pattern.
Here is why it matters:

```python
# file: data_loader.py
import logging
logger = logging.getLogger(__name__)
# logger.name == "data_loader"

# file: analytics.py
import logging
logger = logging.getLogger(__name__)
# logger.name == "analytics"

# file: payments/billing.py
import logging
logger = logging.getLogger(__name__)
# logger.name == "payments.billing"
```

Every log message now carries its origin automatically. When you see:

```
2024-03-15 14:30:22 -- ERROR -- payments.billing -- Payment failed for order 1042
```

You know immediately which file to open.

### The Logger Hierarchy

Loggers form a tree based on their names, with the root logger at the top.

```
root
 |
 +-- data_loader
 |
 +-- analytics
 |
 +-- payments
      |
      +-- payments.billing
      |
      +-- payments.invoice
```

A logger propagates messages up to its parent by default. This means if
you configure the root logger, all child loggers inherit that configuration
unless you override it.

```python
import logging

# Configure the root logger -- affects all loggers in the application
logging.basicConfig(level=logging.DEBUG)

# Now all loggers at any level will output their messages
logger = logging.getLogger("payments.billing")
logger.info("This reaches the root logger's handler")
```

---

## 5. Handlers -- Where Logs Go

A Handler decides where log messages are sent. You can attach multiple
handlers to a single logger to send messages to multiple destinations.

```python
import logging

logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)   # set on the logger itself

# StreamHandler -- sends to console (stdout or stderr)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)

# FileHandler -- writes to a file
file_handler = logging.FileHandler("app.log", encoding="utf-8")
file_handler.setLevel(logging.WARNING)   # only warnings and above to file

# Attach both handlers to the logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)
```

**Common handlers:**

```python
import logging
import logging.handlers

# Console
logging.StreamHandler()                          # stdout/stderr

# File
logging.FileHandler("app.log")                  # plain file

# Rotating by size
logging.handlers.RotatingFileHandler(
    "app.log",
    maxBytes=5 * 1024 * 1024,    # 5 MB
    backupCount=3                 # keep 3 old files
)

# Rotating by time
logging.handlers.TimedRotatingFileHandler(
    "app.log",
    when="midnight",              # rotate at midnight
    interval=1,
    backupCount=7                 # keep 7 days of logs
)

# Memory (stores in a list -- useful for testing)
logging.handlers.MemoryHandler(capacity=1000)
```

---

## 6. Formatters -- What Logs Look Like

A Formatter controls the structure of each log line.

```python
import logging

# Create a formatter
formatter = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Apply to a handler
handler = logging.StreamHandler()
handler.setFormatter(formatter)
```

**All available format attributes:**

```
%(asctime)s       Timestamp (formatted by datefmt)
%(created)f       Time as Unix timestamp float
%(filename)s      Source file name (e.g., main.py)
%(funcName)s      Function name where log was called
%(levelname)s     Level name: DEBUG, INFO, WARNING, ERROR, CRITICAL
%(levelno)d       Level number: 10, 20, 30, 40, 50
%(lineno)d        Line number in source file
%(message)s       The actual log message
%(module)s        Module name (filename without .py)
%(name)s          Logger name
%(pathname)s      Full path to source file
%(process)d       Process ID
%(processName)s   Process name
%(thread)d        Thread ID
%(threadName)s    Thread name
```

**Practical format examples:**

```python
# Minimal -- for development
"%(levelname)s: %(message)s"

# Standard -- for most applications
"%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

# Detailed -- for debugging production issues
"%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(funcName)s | %(message)s"

# JSON format (useful for log aggregation tools)
'{"time": "%(asctime)s", "level": "%(levelname)s", "module": "%(name)s", "msg": "%(message)s"}'
```

The `-8s` in `%(levelname)-8s` left-aligns the level name and pads to
8 characters so all messages line up:

```
2024-03-15 14:30:22 | DEBUG    | data_loader | Loading file
2024-03-15 14:30:22 | INFO     | data_loader | 500 records loaded
2024-03-15 14:30:22 | WARNING  | analytics   | Missing values in column price
2024-03-15 14:30:22 | ERROR    | payments    | Payment gateway timeout
```

---

## 7. Logging to Multiple Destinations

A very common real-world setup: DEBUG and above to the console during
development, WARNING and above to a persistent log file.

```python
import logging

def setup_logger(name, log_file=None, level=logging.DEBUG):
    """
    Create a logger that outputs to console and optionally to a file.

    Args:
        name     (str):           Logger name (use __name__ from calling module)
        log_file (str, optional): Path to log file. None means console only.
        level    (int):           Minimum level for this logger.

    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid adding duplicate handlers if this function is called multiple times
    if logger.handlers:
        return logger

    # Console handler -- all messages at DEBUG and above
    console_fmt  = logging.Formatter("%(levelname)-8s | %(name)s | %(message)s")
    console_hdlr = logging.StreamHandler()
    console_hdlr.setLevel(logging.DEBUG)
    console_hdlr.setFormatter(console_fmt)
    logger.addHandler(console_hdlr)

    # File handler -- WARNING and above only
    if log_file:
        file_fmt  = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_hdlr = logging.FileHandler(log_file, encoding="utf-8")
        file_hdlr.setLevel(logging.WARNING)
        file_hdlr.setFormatter(file_fmt)
        logger.addHandler(file_hdlr)

    return logger


# Usage
logger = setup_logger(__name__, log_file="app.log")

logger.debug("Loading configuration")       # console only
logger.info("Application started")          # console only
logger.warning("Config file missing")       # console AND file
logger.error("Database connection failed")  # console AND file
```

---

## 8. Rotating Log Files

In production, log files grow indefinitely. Rotating log files prevents
them from consuming all available disk space.

### Rotate by size (RotatingFileHandler)

```python
import logging
import logging.handlers

logger  = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)

# Creates: app.log, app.log.1, app.log.2, app.log.3
# When app.log reaches 5MB it is renamed to app.log.1
# The old app.log.1 becomes app.log.2, etc.
# app.log.3 (the oldest) is deleted when a new rotation happens
handler = logging.handlers.RotatingFileHandler(
    filename="app.log",
    maxBytes=5 * 1024 * 1024,   # 5 MB
    backupCount=3,               # keep 3 backup files
    encoding="utf-8"
)

formatter = logging.Formatter(
    "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)
logger.addHandler(handler)
```

### Rotate by time (TimedRotatingFileHandler)

```python
import logging.handlers

# Creates: app.log, app.log.2024-03-14, app.log.2024-03-13 ...
# At midnight, today's log is archived and a fresh file starts
handler = logging.handlers.TimedRotatingFileHandler(
    filename="app.log",
    when="midnight",      # rotate at midnight
    interval=1,           # every 1 day
    backupCount=30,       # keep 30 days of logs
    encoding="utf-8"
)

# Other 'when' options:
# "S"  -- seconds
# "M"  -- minutes
# "H"  -- hours
# "D"  -- days
# "W0" -- every Monday (W0=Monday, W6=Sunday)
# "midnight"
```

---

## 9. Logging Across Multiple Modules

This is the pattern used in every real Python project.

The key insight: configure logging **once** at the application entry point
(usually `main.py`). Every other module just creates its own named logger
with `logging.getLogger(__name__)` and uses it. The configuration
propagates automatically through the hierarchy.

```python
# config/logging_config.py
# Centralised logging configuration

import logging
import logging.handlers
from pathlib import Path


def configure_logging(log_level=logging.INFO, log_dir="logs"):
    """
    Set up logging for the entire application.
    Call this ONCE at the start of main.py.
    """
    Path(log_dir).mkdir(exist_ok=True)

    # Configure the ROOT logger -- all child loggers inherit this
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)   # capture everything at root

    # Remove any existing handlers (in case this is called multiple times)
    root_logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%H:%M:%S"
    ))

    # File handler -- all DEBUG messages to detailed log
    debug_handler = logging.handlers.RotatingFileHandler(
        f"{log_dir}/debug.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8"
    )
    debug_handler.setLevel(logging.DEBUG)
    debug_handler.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))

    # Error file -- only errors and criticals
    error_handler = logging.handlers.RotatingFileHandler(
        f"{log_dir}/errors.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=10,
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(funcName)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))

    root_logger.addHandler(console_handler)
    root_logger.addHandler(debug_handler)
    root_logger.addHandler(error_handler)

    logging.getLogger(__name__).info("Logging configured. Log dir: %s", log_dir)
```

```python
# data_loader.py
import logging

# One line at the top of every module -- that is all
logger = logging.getLogger(__name__)


def load_csv(filepath):
    logger.debug("Attempting to load: %s", filepath)
    try:
        import pandas as pd
        df = pd.read_csv(filepath)
        logger.info("Loaded %d rows from %s", len(df), filepath)
        return df
    except FileNotFoundError:
        logger.error("File not found: %s", filepath)
        return None
    except Exception as e:
        logger.exception("Unexpected error loading %s", filepath)
        # logger.exception logs the full traceback automatically
        return None
```

```python
# analytics.py
import logging

logger = logging.getLogger(__name__)


def calculate_summary(df):
    logger.debug("Calculating summary for DataFrame with shape %s", df.shape)

    if df.empty:
        logger.warning("DataFrame is empty -- summary will be trivial")

    summary = df.describe()
    logger.info("Summary calculated successfully")
    return summary
```

```python
# main.py
from config.logging_config import configure_logging
import logging

# Configure once at the entry point
configure_logging(log_level=logging.INFO)

# Now import and use other modules -- they all use the configured logging
from data_loader import load_csv
from analytics  import calculate_summary

logger = logging.getLogger(__name__)


def main():
    logger.info("Application starting")

    df = load_csv("data/sales.csv")
    if df is None:
        logger.critical("Could not load data. Exiting.")
        return

    summary = calculate_summary(df)
    logger.info("Pipeline completed successfully")


if __name__ == "__main__":
    main()
```

### Logging exceptions properly

```python
import logging
logger = logging.getLogger(__name__)

# WRONG -- loses the traceback
try:
    result = 1 / 0
except ZeroDivisionError as e:
    logger.error("Division failed: %s", e)   # no traceback in the log

# RIGHT -- logger.exception includes the full traceback
try:
    result = 1 / 0
except ZeroDivisionError:
    logger.exception("Division failed")      # logs message + full traceback

# Or manually include traceback with logger.error
import traceback
try:
    result = 1 / 0
except ZeroDivisionError as e:
    logger.error("Division failed: %s\n%s", e, traceback.format_exc())
```

---

## 10. A Production-Ready Logging Setup

Here is a complete, drop-in logging configuration that you can use in
any project. Save it as `logger.py` in your project root.

```python
# logger.py
# Drop this into any project. Import and call configure_logging() from main.py.

import logging
import logging.handlers
import sys
from pathlib import Path


def configure_logging(
    app_name:    str  = "app",
    log_level:   int  = logging.INFO,
    log_dir:     str  = "logs",
    console:     bool = True,
    log_to_file: bool = True,
    max_bytes:   int  = 10 * 1024 * 1024,   # 10 MB
    backup_count: int = 5,
):
    """
    Configure application-wide logging.

    Call this once at the start of main.py before importing other modules.

    Args:
        app_name    : Used as prefix for log filenames
        log_level   : Minimum level for console output
        log_dir     : Directory where log files are stored
        console     : Whether to output to console
        log_to_file : Whether to write logs to files
        max_bytes   : Max size per log file before rotation
        backup_count: Number of backup files to keep
    """
    # Create log directory
    if log_to_file:
        Path(log_dir).mkdir(parents=True, exist_ok=True)

    # Root logger captures everything
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    root.handlers.clear()

    # Formats
    simple_fmt  = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%H:%M:%S"
    )
    detailed_fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(funcName)s() | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console handler
    if console:
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(log_level)
        ch.setFormatter(simple_fmt)
        root.addHandler(ch)

    if log_to_file:
        # All messages (DEBUG+) to a rolling debug log
        fh_debug = logging.handlers.RotatingFileHandler(
            Path(log_dir) / f"{app_name}_debug.log",
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8"
        )
        fh_debug.setLevel(logging.DEBUG)
        fh_debug.setFormatter(detailed_fmt)
        root.addHandler(fh_debug)

        # Errors only -- a clean, small file for monitoring
        fh_error = logging.handlers.RotatingFileHandler(
            Path(log_dir) / f"{app_name}_errors.log",
            maxBytes=max_bytes,
            backupCount=backup_count * 2,   # keep more error history
            encoding="utf-8"
        )
        fh_error.setLevel(logging.ERROR)
        fh_error.setFormatter(detailed_fmt)
        root.addHandler(fh_error)

    # Silence overly verbose third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("matplotlib").setLevel(logging.WARNING)

    logging.getLogger(__name__).debug(
        "Logging configured. app=%s level=%s dir=%s",
        app_name, logging.getLevelName(log_level), log_dir
    )
```

Usage in any project:

```python
# main.py
from logger import configure_logging
import logging

configure_logging(app_name="cricket_analysis", log_level=logging.INFO)

# Now every module that does logging.getLogger(__name__) works correctly
```

---

## 11. The os Module -- System Interaction

The `os` module is Python's interface to the operating system. It lets
your code interact with the file system, processes, and the environment
your program runs in.

We covered `pathlib` in the file handling guide -- pathlib handles most
path operations better in modern Python. What `os` does that pathlib does
not is covered here.

### What os is good for

```python
import os

# Current working directory
print(os.getcwd())                   # /home/aarav/projects/cricket_analysis

# Change directory
os.chdir("/home/aarav/data")

# Path operations (prefer pathlib, but os.path still works)
os.path.exists("data.csv")           # True or False
os.path.isfile("data.csv")           # is it a file?
os.path.isdir("results/")            # is it a directory?
os.path.abspath("data.csv")          # full absolute path
os.path.basename("/a/b/data.csv")    # "data.csv"
os.path.dirname("/a/b/data.csv")     # "/a/b"
os.path.splitext("data.csv")         # ("data", ".csv")
os.path.join("data", "raw", "x.csv")# "data/raw/x.csv"

# File metadata
os.path.getsize("data.csv")          # size in bytes
os.path.getmtime("data.csv")         # last modified time (Unix timestamp)

# Directory contents
os.listdir(".")                      # list files and folders in current dir
os.listdir("/home/aarav/data")       # list a specific directory

# Create and remove directories
os.mkdir("output")                   # create one directory (fails if exists)
os.makedirs("output/charts/2024",    # create full path
            exist_ok=True)           # no error if already exists
os.rmdir("output")                   # remove empty directory only
os.remove("old_file.csv")            # delete a file

# Rename and move
os.rename("old_name.csv", "new_name.csv")

# Get file permissions (Unix only)
os.stat("data.csv").st_mode
```

### os vs pathlib -- when to use which

```python
from pathlib import Path
import os

# pathlib is cleaner for most path operations
p = Path("data") / "raw" / "sales.csv"
if p.exists():
    content = p.read_text(encoding="utf-8")

# Use os for:
# 1. Environment variables -- pathlib does not handle these
api_key = os.environ.get("API_KEY")

# 2. os.walk for recursive directory traversal -- pathlib's rglob is simpler
# for simple cases but os.walk gives more control (covered in section 13)

# 3. Process-level operations
os.getpid()         # current process ID
os.getppid()        # parent process ID
os.cpu_count()      # number of CPUs

# 4. os.path when working with legacy code that uses strings
# pathlib is preferred for new code
```

---

## 12. Environment Variables -- The Right Way

Environment variables are key-value pairs set in the operating system
(or in a `.env` file) that your program can read at runtime. They are
the standard way to pass configuration and secrets to Python programs
without hardcoding them.

```python
import os

# Read an environment variable
api_key = os.environ.get("OPENAI_API_KEY")
print(api_key)   # None if not set

# Read with a default value
debug_mode = os.environ.get("DEBUG", "false").lower() == "true"
port       = int(os.environ.get("PORT", "8000"))
db_host    = os.environ.get("DB_HOST", "localhost")

# Read a required variable -- raise if missing
def get_required_env(key):
    """Get an environment variable or raise if not set."""
    value = os.environ.get(key)
    if value is None:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            f"Set it before running this script."
        )
    return value

api_key = get_required_env("RAZORPAY_API_KEY")
db_url  = get_required_env("DATABASE_URL")

# List all environment variables
for key, value in os.environ.items():
    print(f"{key} = {value[:20]}...")   # show first 20 chars for safety
```

### Setting environment variables in the terminal

```bash
# Mac/Linux -- for the current terminal session
export API_KEY="your_key_here"
export DB_HOST="localhost"
export DEBUG="true"

# Run your script
python main.py

# Unset a variable
unset API_KEY

# Set for a single command only
API_KEY="test_key" python main.py
```

```powershell
# Windows PowerShell
$env:API_KEY = "your_key_here"
python main.py
```

### Using .env files with python-dotenv

Manually exporting variables before every run is tedious.
`python-dotenv` reads a `.env` file and loads all variables automatically.

```bash
pip install python-dotenv
```

```bash
# .env (in your project root -- NEVER commit this to git)
API_KEY=your_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cricket_db
DEBUG=false
LOG_LEVEL=INFO
```

```python
# main.py
from dotenv import load_dotenv
import os

# Load .env file -- must be called before reading os.environ
load_dotenv()

api_key  = os.environ.get("API_KEY")
db_host  = os.environ.get("DB_HOST", "localhost")
debug    = os.environ.get("DEBUG", "false").lower() == "true"

print(f"DB Host: {db_host}")
print(f"Debug:   {debug}")
```

```python
# For more control over which .env file to load
from dotenv import load_dotenv
from pathlib import Path

# Load from a specific path
load_dotenv(Path(__file__).parent / ".env.production")

# Override existing environment variables (by default, dotenv does NOT
# override variables already set in the environment)
load_dotenv(override=True)
```

### Building a config module with environment variables

```python
# config.py
# Centralised configuration reading from environment variables

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class DatabaseConfig:
    host:     str
    port:     int
    name:     str
    user:     str
    password: str

    @property
    def url(self):
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


@dataclass
class AppConfig:
    debug:     bool
    log_level: str
    api_key:   str
    db:        DatabaseConfig


def load_config() -> AppConfig:
    """Load and validate all configuration from environment variables."""

    def required(key: str) -> str:
        val = os.environ.get(key)
        if not val:
            raise EnvironmentError(f"Required config '{key}' not set.")
        return val

    return AppConfig(
        debug     = os.environ.get("DEBUG", "false").lower() == "true",
        log_level = os.environ.get("LOG_LEVEL", "INFO").upper(),
        api_key   = required("API_KEY"),
        db=DatabaseConfig(
            host     = os.environ.get("DB_HOST",     "localhost"),
            port     = int(os.environ.get("DB_PORT", "5432")),
            name     = required("DB_NAME"),
            user     = required("DB_USER"),
            password = required("DB_PASSWORD"),
        )
    )


# Usage
config = load_config()
print(config.db.url)
print(f"Debug mode: {config.debug}")
```

---

## 13. Walking Directory Trees with os.walk

`os.walk` recursively walks a directory tree, yielding the contents of
each subdirectory. It is the right tool when you need to process files
across a nested folder structure.

```python
import os

# os.walk yields (dirpath, dirnames, filenames) for each directory
for dirpath, dirnames, filenames in os.walk("my_project"):
    print(f"Directory: {dirpath}")
    for filename in filenames:
        print(f"  File: {filename}")
        full_path = os.path.join(dirpath, filename)
        print(f"  Full path: {full_path}")
```

### Practical examples

```python
import os

# Find all Python files in a project (recursively)
def find_python_files(root_dir):
    """Return a list of all .py files under root_dir."""
    py_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude hidden directories and __pycache__
        dirnames[:] = [
            d for d in dirnames
            if not d.startswith(".") and d != "__pycache__"
        ]
        for filename in filenames:
            if filename.endswith(".py"):
                py_files.append(os.path.join(dirpath, filename))
    return py_files

files = find_python_files(".")
print(f"Found {len(files)} Python files")
for f in files[:5]:
    print(f"  {f}")
```

```python
import os

# Calculate total size of a directory tree
def directory_size(path):
    """Return total size of all files in a directory tree (bytes)."""
    total = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            try:
                total += os.path.getsize(filepath)
            except OSError:
                pass   # skip files we cannot access
    return total

size = directory_size("my_project")
print(f"Total size: {size / 1024 / 1024:.1f} MB")
```

```python
import os
import shutil

# Find and process all CSV files in a data directory
def process_all_csvs(data_dir, output_dir):
    """
    Walk a directory tree and process every CSV file found.
    """
    os.makedirs(output_dir, exist_ok=True)
    processed = 0
    errors    = 0

    for dirpath, dirnames, filenames in os.walk(data_dir):
        # Skip hidden directories
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]

        for filename in filenames:
            if not filename.lower().endswith(".csv"):
                continue

            input_path  = os.path.join(dirpath, filename)
            output_path = os.path.join(output_dir, filename)

            try:
                # Preserve relative directory structure in output
                relative  = os.path.relpath(dirpath, data_dir)
                out_dir   = os.path.join(output_dir, relative)
                os.makedirs(out_dir, exist_ok=True)
                out_path  = os.path.join(out_dir, filename)

                print(f"Processing: {input_path}")
                # ... your processing logic here ...
                shutil.copy2(input_path, out_path)   # example: just copy
                processed += 1

            except Exception as e:
                print(f"Error processing {input_path}: {e}")
                errors += 1

    print(f"\nDone. Processed: {processed}, Errors: {errors}")
```

> For simple cases, `pathlib.Path.rglob("*.csv")` is shorter and more
> readable than `os.walk`. Use `os.walk` when you need to modify the
> directory traversal (like skipping certain folders with `dirnames[:]`)
> or need more control over the walk order.

---

## 14. Running Shell Commands -- os.system vs subprocess

Sometimes Python needs to run a shell command -- call a CLI tool,
run a script, or execute a system command.

### os.system -- simple but limited

```python
import os

# Runs a command in a shell
os.system("ls -la")               # Mac/Linux
os.system("dir")                  # Windows

# Returns the exit code (0 = success, non-zero = error)
exit_code = os.system("python --version")
print(exit_code)   # 0

# Problem: you cannot capture the output
# Problem: security risk if command includes user input (shell injection)
```

### subprocess -- the right way

The `subprocess` module gives you full control: capture output, check
exit codes, handle errors, set timeouts, and avoid shell injection.

```python
import subprocess

# Run a command and wait for it to finish
result = subprocess.run(
    ["python", "--version"],
    capture_output=True,    # capture stdout and stderr
    text=True,              # decode output as string (not bytes)
    timeout=30              # raise TimeoutExpired after 30 seconds
)

print(result.stdout)        # "Python 3.12.0\n"
print(result.returncode)    # 0 (success)

# Check if command succeeded
if result.returncode != 0:
    print(f"Command failed: {result.stderr}")
```

```python
import subprocess

# check=True raises CalledProcessError if command exits with non-zero code
try:
    result = subprocess.run(
        ["pip", "install", "pandas"],
        capture_output=True,
        text=True,
        check=True
    )
    print("Installed successfully")
    print(result.stdout)

except subprocess.CalledProcessError as e:
    print(f"Installation failed (exit code {e.returncode})")
    print(e.stderr)

except subprocess.TimeoutExpired:
    print("Command took too long")

except FileNotFoundError:
    print("Command not found -- is pip installed?")
```

```python
import subprocess

# Pass arguments safely -- no shell injection risk
# WRONG (shell injection risk):
filename = "file with spaces.csv; rm -rf /"   # malicious input
os.system(f"wc -l {filename}")                 # dangerous!

# RIGHT (subprocess with list -- shell=False by default):
result = subprocess.run(
    ["wc", "-l", filename],    # filename is treated as a single argument
    capture_output=True,
    text=True
)
```

```python
import subprocess

# Running a Python script from Python
result = subprocess.run(
    ["python", "process_data.py", "--input", "data.csv", "--output", "results/"],
    capture_output=True,
    text=True,
    check=True
)

# Run a command in a specific directory
result = subprocess.run(
    ["git", "status"],
    capture_output=True,
    text=True,
    cwd="/home/aarav/projects/cricket_analysis"   # working directory
)
print(result.stdout)
```

**Rule:** Use `subprocess.run()` for everything. Only use `os.system()` for
throwaway scripts where you do not need the output.

---

## 15. Putting It Together -- A Data Pipeline

This example shows both modules working together in a realistic scenario:
a daily data pipeline that reads sales files, processes them, and logs
every step. Configuration comes from environment variables. Every
important event is logged at the appropriate level.

```python
"""
pipeline.py

Daily sales data pipeline.
Reads CSV files from an input directory, validates them,
summarises each file, and writes results to an output directory.

Environment variables required:
  INPUT_DIR   -- directory containing raw CSV files
  OUTPUT_DIR  -- directory to write processed results
  LOG_LEVEL   -- logging level (default: INFO)
  MIN_RECORDS -- minimum records per file to be considered valid (default: 10)
"""

import os
import csv
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime


# ─── Logging setup ────────────────────────────────────────────────────────

def setup_pipeline_logging(log_dir="logs", level_name="INFO"):
    """Configure logging for the pipeline."""
    log_level = getattr(logging, level_name.upper(), logging.INFO)
    Path(log_dir).mkdir(exist_ok=True)

    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    root.handlers.clear()

    # Console -- INFO and above
    console = logging.StreamHandler()
    console.setLevel(log_level)
    console.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%H:%M:%S"
    ))
    root.addHandler(console)

    # File -- everything (DEBUG+), rotated daily
    today     = datetime.now().strftime("%Y%m%d")
    file_hdlr = logging.handlers.TimedRotatingFileHandler(
        f"{log_dir}/pipeline.log",
        when="midnight",
        backupCount=14,
        encoding="utf-8"
    )
    file_hdlr.setLevel(logging.DEBUG)
    file_hdlr.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))
    root.addHandler(file_hdlr)


logger = logging.getLogger(__name__)


# ─── Configuration ────────────────────────────────────────────────────────

def load_config():
    """Load and validate pipeline configuration from environment variables."""
    logger.debug("Loading configuration from environment variables")

    required_vars = ["INPUT_DIR", "OUTPUT_DIR"]
    missing = [v for v in required_vars if not os.environ.get(v)]
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {missing}"
        )

    config = {
        "input_dir":   os.environ["INPUT_DIR"],
        "output_dir":  os.environ["OUTPUT_DIR"],
        "log_level":   os.environ.get("LOG_LEVEL",   "INFO"),
        "min_records": int(os.environ.get("MIN_RECORDS", "10")),
    }

    logger.info("Configuration loaded: input=%s output=%s min_records=%d",
                config["input_dir"], config["output_dir"], config["min_records"])
    return config


# ─── File discovery ───────────────────────────────────────────────────────

def find_csv_files(directory):
    """
    Recursively find all CSV files in a directory.
    Returns a list of absolute paths.
    """
    logger.debug("Scanning for CSV files in: %s", directory)

    if not os.path.isdir(directory):
        logger.error("Input directory does not exist: %s", directory)
        return []

    csv_files = []
    for dirpath, dirnames, filenames in os.walk(directory):
        # Skip hidden directories
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]

        for filename in filenames:
            if filename.lower().endswith(".csv"):
                full_path = os.path.join(dirpath, filename)
                csv_files.append(full_path)
                logger.debug("Found: %s", full_path)

    logger.info("Found %d CSV file(s) in %s", len(csv_files), directory)
    return csv_files


# ─── File processing ──────────────────────────────────────────────────────

def process_csv(filepath, min_records):
    """
    Read a CSV file and return a summary dict.
    Returns None if the file is invalid.
    """
    logger.debug("Processing: %s", filepath)

    try:
        with open(filepath, "r", encoding="utf-8", newline="") as f:
            reader  = csv.DictReader(f)
            rows    = list(reader)
            headers = reader.fieldnames or []

        if len(rows) < min_records:
            logger.warning(
                "File has only %d records (minimum: %d). Skipping: %s",
                len(rows), min_records, filepath
            )
            return None

        # Build summary
        summary = {
            "filename":  os.path.basename(filepath),
            "filepath":  filepath,
            "rows":      len(rows),
            "columns":   len(headers),
            "headers":   headers,
        }

        # Try to sum any numeric columns
        numeric_sums = {}
        for col in headers:
            try:
                total = sum(float(row[col]) for row in rows if row.get(col))
                numeric_sums[col] = round(total, 2)
            except (ValueError, TypeError):
                pass   # not a numeric column -- skip

        summary["numeric_sums"] = numeric_sums

        logger.info("Processed %s: %d rows, %d columns",
                    os.path.basename(filepath), len(rows), len(headers))
        return summary

    except PermissionError:
        logger.error("Permission denied reading: %s", filepath)
        return None
    except UnicodeDecodeError:
        logger.error("Encoding error in: %s. Try UTF-8-SIG.", filepath)
        return None
    except Exception:
        logger.exception("Unexpected error processing: %s", filepath)
        return None


# ─── Output writing ───────────────────────────────────────────────────────

def write_summary(summaries, output_dir):
    """Write a summary report of all processed files."""
    os.makedirs(output_dir, exist_ok=True)

    today       = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(output_dir, f"pipeline_report_{today}.txt")

    logger.debug("Writing summary report to: %s", report_path)

    try:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(f"Pipeline Report -- {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 60 + "\n\n")

            for s in summaries:
                f.write(f"File     : {s['filename']}\n")
                f.write(f"Rows     : {s['rows']}\n")
                f.write(f"Columns  : {s['columns']}\n")
                f.write(f"Headers  : {', '.join(s['headers'])}\n")
                if s['numeric_sums']:
                    f.write("Totals   :\n")
                    for col, total in s['numeric_sums'].items():
                        f.write(f"  {col}: {total:,.2f}\n")
                f.write("\n")

            f.write(f"Total files processed: {len(summaries)}\n")

        logger.info("Report written to: %s", report_path)
        return report_path

    except IOError as e:
        logger.error("Could not write report: %s", e)
        return None


# ─── Main pipeline ────────────────────────────────────────────────────────

def run_pipeline():
    """Main pipeline entry point."""
    start_time = datetime.now()
    logger.info("Pipeline starting at %s", start_time.strftime("%H:%M:%S"))

    # Load config
    try:
        config = load_config()
    except EnvironmentError as e:
        logger.critical("Configuration error: %s", e)
        return False

    # Discover files
    csv_files = find_csv_files(config["input_dir"])
    if not csv_files:
        logger.warning("No CSV files found. Nothing to process.")
        return True

    # Process each file
    summaries  = []
    failed     = 0

    for filepath in csv_files:
        summary = process_csv(filepath, config["min_records"])
        if summary:
            summaries.append(summary)
        else:
            failed += 1

    # Write output
    if summaries:
        report_path = write_summary(summaries, config["output_dir"])
        if not report_path:
            logger.error("Failed to write summary report")

    # Final summary
    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info(
        "Pipeline complete. Processed: %d, Skipped/failed: %d, Time: %.1fs",
        len(summaries), failed, elapsed
    )

    if failed > 0:
        logger.warning("%d file(s) could not be processed.", failed)

    return failed == 0


if __name__ == "__main__":
    # Load .env if present
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass   # dotenv not installed -- rely on actual env vars

    # Set up logging (using LOG_LEVEL from environment or default INFO)
    setup_pipeline_logging(
        log_dir="logs",
        level_name=os.environ.get("LOG_LEVEL", "INFO")
    )

    success = run_pipeline()
    exit(0 if success else 1)
```

---

## 16. Summary and Key Takeaways

### The logging module

**Use named loggers everywhere.**
One line at the top of every module: `logger = logging.getLogger(__name__)`.
Never use `print()` for anything that matters in production.

**Configure once at the entry point.**
Call your logging setup function in `main.py` before importing anything else.
All child loggers inherit the configuration automatically.

**Use the right level for the right message.**
DEBUG for diagnostic detail. INFO for normal progress. WARNING for something
unexpected that is not a failure. ERROR for a failure. CRITICAL for something
that prevents the program from continuing.

**Use `logger.exception()` inside except blocks.**
It automatically includes the full traceback. `logger.error()` alone does not.

**Use `logger.info("Value: %s", value)` not `logger.info(f"Value: {value}")`.**
The `%s` style defers string formatting until the message is actually logged.
If the message is below the minimum level, no formatting happens at all.
This matters for performance in tight loops.

**Rotate log files in production.**
`RotatingFileHandler` and `TimedRotatingFileHandler` prevent log files from
filling your disk. Always set `backupCount` and `maxBytes`.

---

### The os module

**Environment variables are how configuration and secrets get into your program.**
Never hardcode API keys or database credentials. Read them from environment
variables. Use `python-dotenv` for local development. Use your platform's
secret management for production.

**Prefer `pathlib` for file paths, `os` for everything else.**
`pathlib.Path` is cleaner for creating, reading, and manipulating paths.
Use `os` for environment variables, process information, `os.walk`, and
running shell commands.

**Use `subprocess.run()` not `os.system()`.**
`subprocess.run()` lets you capture output, check exit codes, set timeouts,
and pass arguments safely as a list (no shell injection risk).

**`os.walk` gives you recursive directory traversal with control.**
Use it when you need to skip specific directories or process nested structures.
For simple cases, `pathlib.Path.rglob("*.csv")` is shorter.

---

### Common mistakes to avoid

```python
# 1. Using print() instead of logging in anything that runs unattended
print("Processing started")          # disappears when terminal closes
logger.info("Processing started")    # persists, timestamped, filterable

# 2. Logging at the wrong level
logger.debug("Payment failed")       # debug -- will be invisible in production
logger.error("Payment failed")       # correct

# 3. Using the root logger directly in library/module code
logging.info("Message")              # pollutes any application that imports you
logger = logging.getLogger(__name__) # correct -- namespaced to your module
logger.info("Message")

# 4. Hardcoding secrets
API_KEY = "sk-abc123xyz"             # ends up in git history
API_KEY = os.environ.get("API_KEY")  # correct

# 5. Using os.system() when you need the output
os.system("git status")              # output goes to terminal, you cannot capture it
result = subprocess.run(["git", "status"], capture_output=True, text=True)  # correct

# 6. Not checking that required environment variables are set
db_host = os.environ.get("DB_HOST")  # silently returns None
db_host = os.environ["DB_HOST"]      # raises KeyError if not set -- fails fast
# Better: check explicitly with a helpful error message
```

---

### The ten things to remember

```
1. logger = logging.getLogger(__name__)  -- one line, every module
2. Configure logging once in main.py before importing other modules
3. DEBUG for dev, INFO for progress, WARNING for anomalies, ERROR for failures
4. logger.exception() inside except blocks -- includes traceback automatically
5. Use %s formatting, not f-strings, in log calls
6. RotatingFileHandler prevents log files from growing forever
7. os.environ.get("KEY", "default") for optional config
8. os.environ["KEY"] or raise EnvironmentError for required config
9. subprocess.run(["cmd", "arg"], capture_output=True, text=True, check=True)
10. Never commit .env files -- always add to .gitignore
```

---

*Made with care for Codeverra learners | codeverra.com*