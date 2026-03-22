---
title: "File Handling in Python - Complete Guide"
description: "Learn about working with files in Python"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
 - python

cover:
 image: "/images/file-handling-masterclass.png"
 alt: "file handling in python"
 caption: "file handling in python"
 relative: true
 hidden: false
---

# Working with Files in Python - The Complete Guide
### Everything you need to read, write, parse, and manage files like a professional

---

## Why Files Matter More Than You Think

Every meaningful program eventually needs to talk to the outside world. Not through a web API or a database - just a plain file sitting on disk. Your data science pipeline reads a CSV. Your web scraper writes results to JSON. Your deployment script reads a config file. Your ETL job processes gigabytes of logs.

Beginners often learn `open()`, write a few lines, close the file, and move on. But there's a lot more to it - and the gaps in knowledge show up at the worst times. The file that never gets closed because an exception was raised. The CSV that silently corrupts because of encoding. The config file that works on your Mac and breaks on the Linux server. The 10 GB log file that gets loaded into a list and crashes the machine.

This guide covers all of it - from the fundamentals of how Python opens files, through every format you'll encounter in real work, to patterns for handling large data, and finally the `pathlib` module that should replace most of your string-based path manipulation.

By the end, you'll know not just how to work with files, but *why* Python's file model works the way it does.

---

## The Mental Model: What Happens When You Open a File?

Before touching any code, understand what's actually happening when you call `open()`.

```
Your Python Script
 │
 │ open("data.txt", "r")
 ▼
┌─────────────────────┐
│ Operating System │ ← Python delegates to the OS
│ File System API │
└─────────────────────┘
 │
 │ Returns a file descriptor (an integer handle)
 ▼
┌─────────────────────┐
│ File Object │ ← Python wraps it in a file object
│ (file handle) │ with methods: read(), write(), etc.
│ │
│ - position pointer │ ← tracks where you are in the file
│ - read/write buffer│ ← data cached in memory
│ - encoding info │ ← how bytes map to characters
└─────────────────────┘
 │
 │ When you close() (or `with` exits)
 ▼
 Buffer flushed to disk
 File descriptor released back to OS
```

The key things to take away from this:

- A **file descriptor** is a limited OS resource. Systems have a maximum number of open files. If you forget to close files, you will eventually hit `Too many open files` errors.
- The **position pointer** moves as you read. If you read the whole file and try to read again, you get an empty string - the pointer is at the end. You need to `seek(0)` to go back to the start.
- The **buffer** means writes may not immediately reach disk. Calling `close()` or `flush()` forces the buffer to disk.

---

## Part 1: The Fundamentals

### `open()` - The Entry Point

```python
# Full signature
open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None)
```

The two arguments you'll use on every call are `file` (the path) and `mode`.

### File Modes - The Complete Picture

```
┌──────────┬──────────────────────────────────────────────┬──────────┬─────────┐
│ Mode │ Meaning │ Read? │ Write? │
├──────────┼──────────────────────────────────────────────┼──────────┼─────────┤
│ 'r' │ Read (default). File must exist. │ Yes │ No │
│ 'w' │ Write. Creates file or TRUNCATES existing. │ No │ Yes │
│ 'a' │ Append. Creates file or appends to end. │ No │ Yes │
│ 'x' │ Exclusive create. Fails if file exists. │ No │ Yes │
│ 'r+' │ Read and write. File must exist. │ Yes │ Yes │
│ 'w+' │ Read and write. Creates or TRUNCATES. │ Yes │ Yes │
│ 'a+' │ Read and append. Creates if needed. │ Yes │ Yes │
├──────────┼──────────────────────────────────────────────┼──────────┼─────────┤
│ + 'b' │ Binary mode. No encoding/decoding. │ │ │
│ │ Add to any mode: 'rb', 'wb', 'ab', etc. │ │ │
├──────────┼──────────────────────────────────────────────┼──────────┼─────────┤
│ + 't' │ Text mode (default). Handles encoding. │ │ │
│ │ 'rt' == 'r', 'wt' == 'w', etc. │ │ │
└──────────┴──────────────────────────────────────────────┴──────────┴─────────┘
```

```python
# Mode examples
f = open("data.txt", "r") # read text (default)
f = open("data.txt", "w") # write text - WARNING: destroys existing content!
f = open("data.txt", "a") # append text
f = open("data.txt", "x") # create new, fail if exists - safe write
f = open("image.png", "rb") # read binary
f = open("data.bin", "wb") # write binary
```

### Always Use `with` - The Context Manager Pattern

The single most important rule in file handling is this: **always open files with a `with` statement**.

```python
# NEVER do this in real code
f = open("data.txt", "r")
content = f.read()
f.close() # What if read() raised an exception? close() is never called.

# ALWAYS do this
with open("data.txt", "r") as f:
 content = f.read()
# f.close() is called automatically, even if an exception occurred inside the block
```

The `with` statement calls `__exit__` on the file object when the block ends - whether normally or via exception. The file is always closed.

```python
# Multiple files at once - single with statement
with open("input.txt", "r") as src, open("output.txt", "w") as dst:
 for line in src:
 dst.write(line.upper())
# Both files are closed when the block exits
```

### Reading Files - All the Ways

```python
# 1. read() - entire file as one string
with open("story.txt", "r", encoding="utf-8") as f:
 content = f.read()
 print(type(content)) # <class 'str'>
 print(len(content)) # total character count

# 2. read(n) - read exactly n characters
with open("story.txt", "r", encoding="utf-8") as f:
 first_100 = f.read(100) # first 100 characters
 next_100 = f.read(100) # next 100 characters

# 3. readline() - one line at a time
with open("data.txt", "r", encoding="utf-8") as f:
 first_line = f.readline() # includes the '\n'
 second_line = f.readline()
 print(repr(first_line)) # 'Hello, World!\n'

# 4. readlines() - all lines as a list
with open("data.txt", "r", encoding="utf-8") as f:
 lines = f.readlines()
 print(lines) # ['line 1\n', 'line 2\n', 'line 3\n']

# 5. Iterating directly - most Pythonic and memory-efficient
with open("data.txt", "r", encoding="utf-8") as f:
 for line in f: # file object is its own iterator
 print(line.rstrip('\n')) # strip trailing newline

# 6. List comprehension over file
with open("data.txt", "r", encoding="utf-8") as f:
 lines = [line.strip() for line in f if line.strip()] # non-empty lines only
```

### Writing Files - All the Ways

```python
# 1. write(string) - write a string, returns number of characters written
with open("output.txt", "w", encoding="utf-8") as f:
 chars_written = f.write("Hello, Hyderabad!\n")
 print(chars_written) # 18

# 2. writelines(iterable) - write each item; no newlines added automatically
lines = ["line 1\n", "line 2\n", "line 3\n"]
with open("output.txt", "w", encoding="utf-8") as f:
 f.writelines(lines) # does NOT add '\n' between items - include it yourself

# 3. print() to a file - convenient for formatted output
with open("report.txt", "w", encoding="utf-8") as f:
 print("Sales Report", file=f)
 print("=" * 40, file=f)
 print(f"Total: Rs.{15000:,}", file=f)

# 4. Appending - never overwrites, always adds at end
with open("log.txt", "a", encoding="utf-8") as f:
 f.write("2024-01-15 10:32:00 - User logged in\n")
```

### The Position Pointer and `seek()` / `tell()`

```python
with open("data.txt", "r", encoding="utf-8") as f:
 # tell() returns the current byte position
 print(f.tell()) # 0 - at the start

 first = f.read(10) # read 10 characters
 print(f.tell()) # 10 (for ASCII; could be more for multi-byte chars)

 # seek(offset, whence=0)
 # whence=0: from start of file (default)
 # whence=1: from current position
 # whence=2: from end of file

 f.seek(0) # go back to the beginning
 everything = f.read() # now reads the full file again

 f.seek(0, 2) # seek to end of file
 size = f.tell() # file size in bytes
 print(f"File size: {size} bytes")

 f.seek(-10, 2) # 10 bytes before the end
 last_10 = f.read() # last 10 bytes
```

---

## Part 2: Encoding - The Source of Silent Bugs

Encoding is the most common source of file-related bugs, especially when files move between systems or contain non-ASCII characters. Understanding it prevents hours of debugging.

### What Is Encoding?

A file on disk is just bytes - a sequence of integers from 0 to 255. **Encoding** is the mapping that converts those bytes into characters (and back). When you open a text file, Python uses an encoding to decode bytes into a Python string. When you write, it encodes strings back into bytes.

```
File on disk: E0 A4 A8 E0 A4 AE E0 A4 B8 (bytes)
Encoding: UTF-8 ←─────────────────────────────────
Python string: 'नमस्' (characters)
```

### Always Specify `encoding="utf-8"`

```python
# RISKY - uses the system's default encoding (varies by OS and locale)
with open("data.txt", "r") as f:
 content = f.read()
# Works on your Linux machine (UTF-8 default), fails on Windows (cp1252 default)

# SAFE - explicit is always better
with open("data.txt", "r", encoding="utf-8") as f:
 content = f.read()

# Writing with explicit encoding
with open("output.txt", "w", encoding="utf-8") as f:
 f.write("नमस्कार दुनिया\n") # Hindi text - requires UTF-8
```

### Common Encodings

```
┌──────────────────┬────────────────────────────────────────────────────┐
│ Encoding │ When you encounter it │
├──────────────────┼────────────────────────────────────────────────────┤
│ utf-8 │ Default for Linux/Mac, modern web, Python source │
│ │ Supports every character in existence │
│ utf-8-sig │ UTF-8 with a BOM (Byte Order Mark) at the start │
│ │ Common in Excel-exported CSVs from Windows │
│ cp1252 / latin-1 │ Windows legacy encoding, common in older CSVs │
│ │ Extended ASCII, covers Western European chars │
│ ascii │7-bit only (0-127); fails on any accented char │
│ utf-16 │ Used in some Windows APIs and older files │
└──────────────────┴────────────────────────────────────────────────────┘
```

### Handling Encoding Errors

```python
# errors parameter controls what happens on a bad byte

# 'strict' (default) - raises UnicodeDecodeError on bad byte
with open("file.txt", "r", encoding="utf-8", errors="strict") as f:
 content = f.read()

# 'ignore' - silently skips bad bytes (data loss, but no crash)
with open("file.txt", "r", encoding="utf-8", errors="ignore") as f:
 content = f.read()

# 'replace' - replaces bad bytes with the replacement char (U+FFFD: '?')
with open("file.txt", "r", encoding="utf-8", errors="replace") as f:
 content = f.read()

# 'backslashreplace' - replaces bad bytes with \xNN escape sequences
with open("file.txt", "r", encoding="utf-8", errors="backslashreplace") as f:
 content = f.read()

# Detecting encoding when you don't know it
# pip install chardet
import chardet

with open("mystery_file.txt", "rb") as f:
 raw = f.read(10000) # sample first 10 KB
 result = chardet.detect(raw)
 detected = result["encoding"]
 confidence = result["confidence"]
 print(f"Detected: {detected} ({confidence:.0%} confidence)")

with open("mystery_file.txt", "r", encoding=detected) as f:
 content = f.read()
```

---

## Part 3: Working with Text Files

### Reading Line by Line - The Right Way for Large Files

```python
# MEMORY-EFFICIENT: iterate over the file object directly
# Only one line is in memory at a time - works for files of any size

def count_lines(filepath):
 count = 0
 with open(filepath, "r", encoding="utf-8") as f:
 for _ in f:
 count += 1
 return count

def grep(filepath, search_term):
 """Yield lines containing search_term."""
 with open(filepath, "r", encoding="utf-8") as f:
 for line_num, line in enumerate(f, start=1):
 if search_term in line:
 yield line_num, line.rstrip("\n")

# Usage
for num, line in grep("server.log", "ERROR"):
 print(f"Line {num}: {line}")


# MEMORY-EXPENSIVE: only use when you need all lines at once
with open("small_file.txt", "r", encoding="utf-8") as f:
 lines = f.readlines() # loads entire file into a list

# BETTER alternative to readlines() - list comprehension strips newlines too
with open("small_file.txt", "r", encoding="utf-8") as f:
 lines = [line.rstrip("\n") for line in f]
```

### Writing Logs and Reports

```python
import datetime

def write_report(filepath, data):
 """Write a formatted report to a text file."""
 timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

 with open(filepath, "w", encoding="utf-8") as f:
 f.write(f"Report generated: {timestamp}\n")
 f.write("=" * 60 + "\n\n")

 for section_title, rows in data.items():
 f.write(f"{section_title}\n")
 f.write("-" * len(section_title) + "\n")
 for row in rows:
 f.write(f" {row}\n")
 f.write("\n")

data = {
 "Top Scorers": ["Virat Kohli: 520 runs", "Rohit Sharma: 480 runs"],
 "Top Wicket Takers": ["Jasprit Bumrah: 22 wickets", "R Ashwin: 18 wickets"],
}
write_report("ipl_report.txt", data)


# Append-only logging
def log_event(logfile, level, message):
 """Append a timestamped log entry."""
 timestamp = datetime.datetime.now().isoformat()
 with open(logfile, "a", encoding="utf-8") as f:
 f.write(f"{timestamp} [{level.upper()}] {message}\n")

log_event("app.log", "INFO", "Server started on port 8000")
log_event("app.log", "WARNING", "Memory usage above 80%")
log_event("app.log", "ERROR", "Database connection refused")
```

### Safe Write Pattern - Write-Then-Rename (Atomic Writes)

A common problem: you write to a file, but the process is killed halfway through. Now the file is corrupt. The solution is to write to a temp file, then atomically rename it.

```python
import os
import tempfile

def safe_write(filepath, content):
 """
 Write content to filepath safely:
 1. Write to a temp file in the same directory
 2. Rename temp → target (atomic on most systems)
 This ensures the target file is never partially written.
 """
 directory = os.path.dirname(os.path.abspath(filepath))
 with tempfile.NamedTemporaryFile(
 mode="w",
 encoding="utf-8",
 dir=directory,
 delete=False,
 suffix=".tmp"
 ) as tmp:
 tmp.write(content)
 tmp_path = tmp.name

 os.replace(tmp_path, filepath) # atomic on POSIX; near-atomic on Windows
 print(f"Written safely to {filepath}")

safe_write("config.txt", "host=localhost\nport=5432\n")
```

---

## Part 4: CSV Files

CSV (Comma-Separated Values) is the most common format for tabular data. Python's `csv` module handles quoting, special characters, and delimiters correctly - never split CSV lines with `.split(",")`.

### Reading CSV Files

```python
import csv

# Basic reading
with open("players.csv", "r", encoding="utf-8", newline="") as f:
 reader = csv.reader(f)
 header = next(reader) # skip the header row
 print("Columns:", header)
 for row in reader:
 print(row) # each row is a list of strings

# DictReader - rows as dicts (column names as keys)
with open("players.csv", "r", encoding="utf-8", newline="") as f:
 reader = csv.DictReader(f)
 for row in reader:
 print(dict(row))
 # {'name': 'Rohit Sharma', 'team': 'MI', 'runs': '1200', 'avg': '48.5'}
```

> **Why `newline=""`?** The `csv` module handles its own line endings. If you let Python's text mode translate `\r\n` to `\n` first, the csv module can get confused on some Windows-written files. Always use `newline=""` when opening files for `csv.reader` or `csv.writer`.

### Writing CSV Files

```python
import csv

players = [
 ["name", "team", "runs", "wickets"],
 ["Rohit Sharma", "MI", 1200, 0],
 ["Virat Kohli", "RCB", 980, 0],
 ["Jasprit Bumrah","MI", 45, 28],
]

with open("output.csv", "w", encoding="utf-8", newline="") as f:
 writer = csv.writer(f)
 writer.writerows(players) # writerow() for one row, writerows() for many

# DictWriter - write from dicts
fieldnames = ["name", "team", "runs", "wickets"]
records = [
 {"name": "Rohit Sharma", "team": "MI", "runs": 1200, "wickets": 0},
 {"name": "Virat Kohli", "team": "RCB", "runs": 980, "wickets": 0},
 {"name": "Jasprit Bumrah","team": "MI", "runs": 45, "wickets": 28},
]

with open("players_dict.csv", "w", encoding="utf-8", newline="") as f:
 writer = csv.DictWriter(f, fieldnames=fieldnames)
 writer.writeheader() # writes the column header row
 writer.writerows(records)
```

### Handling Real-World CSV Complications

```python
import csv

# Custom delimiter (TSV, pipe-separated, etc.)
with open("data.tsv", "r", encoding="utf-8", newline="") as f:
 reader = csv.reader(f, delimiter="\t") # tab-separated
 for row in reader:
 print(row)

# Quoting - fields with commas or newlines are automatically quoted
with open("tricky.csv", "w", encoding="utf-8", newline="") as f:
 writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL) # default
 writer.writerow(["name", "address", "notes"])
 writer.writerow(["Ravi", "123, MG Road, Bangalore", "Has a comma in address"])
 # Output: Ravi,"123, MG Road, Bangalore",Has a comma in address

# Skipping blank lines and comments
with open("dirty.csv", "r", encoding="utf-8", newline="") as f:
 reader = csv.reader(f)
 cleaned = [
 row for row in reader
 if row and not row[0].startswith("#") # skip empty and comment rows
 ]

# Excel-exported CSVs often have UTF-8-BOM encoding
with open("excel_export.csv", "r", encoding="utf-8-sig", newline="") as f:
 reader = csv.DictReader(f)
 for row in reader:
 print(row) # column names won't have a BOM prefix

# Type conversion - CSV values are always strings; convert explicitly
with open("stats.csv", "r", encoding="utf-8", newline="") as f:
 reader = csv.DictReader(f)
 for row in reader:
 name = row["name"]
 runs = int(row["runs"]) # explicit conversion
 avg = float(row["average"])
 active = row["active"].lower() == "true"
```

### Processing Large CSV Files Without pandas

```python
import csv
from collections import defaultdict

def summarize_csv(filepath):
 """
 Read a large CSV and compute per-team totals
 without loading the whole file into memory.
 """
 team_runs = defaultdict(int)

 with open(filepath, "r", encoding="utf-8", newline="") as f:
 reader = csv.DictReader(f)
 for row in reader:
 team = row["team"]
 runs = int(row["runs"])
 team_runs[team] += runs

 return dict(sorted(team_runs.items(), key=lambda x: -x[1]))

# Each row is processed and discarded - constant memory usage regardless of file size
```

---

## Part 5: JSON Files

JSON is the default format for configuration files, API responses, and data exchange between services.

### Reading and Writing JSON

```python
import json

# Write a Python object to JSON
data = {
 "tournament": "IPL 2024",
 "teams": ["MI", "CSK", "RCB", "KKR", "SRH"],
 "matches": 74,
 "champion": "KKR",
 "stats": {
 "highest_score": 287,
 "total_sixes": 1234,
 },
}

with open("ipl2024.json", "w", encoding="utf-8") as f:
 json.dump(data, f, indent=4, ensure_ascii=False)
 # indent=4 → pretty-printed with 4-space indentation
 # ensure_ascii=False → allows non-ASCII characters (Hindi, etc.) as-is

# Read a JSON file back
with open("ipl2024.json", "r", encoding="utf-8") as f:
 loaded = json.load(f)
 print(loaded["champion"]) # KKR
 print(loaded["stats"]["total_sixes"]) # 1234

# JSON serialization (to string) vs deserialization (from string)
json_string = json.dumps(data, indent=2) # dumps → to string
print(json_string[:80])

back_to_dict = json.loads(json_string) # loads → from string
```

### JSON Type Mapping

```
Python JSON
─────────────────────────────────
dict → object {}
list, tuple → array []
str → string ""
int, float → number
True / False → true / false
None → null
```

### Handling Non-Serializable Types

```python
import json
import datetime
from decimal import Decimal
from pathlib import Path

# By default, datetime, Decimal, and Path objects are not JSON-serializable
data = {
 "name": "Rohit Sharma",
 "dob": datetime.date(1987, 4, 30), # ← not serializable
 "salary": Decimal("15000000.50"), # ← not serializable
}

# json.dumps(data) → TypeError!

# Solution 1: Custom default function
def json_serializer(obj):
 if isinstance(obj, (datetime.date, datetime.datetime)):
 return obj.isoformat()
 if isinstance(obj, Decimal):
 return float(obj)
 if isinstance(obj, Path):
 return str(obj)
 raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

json_string = json.dumps(data, default=json_serializer, indent=2)
print(json_string)

# Solution 2: Custom JSONEncoder subclass (better for repeated use)
class AppJSONEncoder(json.JSONEncoder):
 def default(self, obj):
 if isinstance(obj, (datetime.date, datetime.datetime)):
 return obj.isoformat()
 if isinstance(obj, Decimal):
 return str(obj) # str preserves precision; float may lose it
 if isinstance(obj, set):
 return sorted(list(obj))
 return super().default(obj)

with open("data.json", "w", encoding="utf-8") as f:
 json.dump(data, f, cls=AppJSONEncoder, indent=2)
```

### JSON Lines Format (JSONL) - One JSON Object Per Line

JSONL is ideal for streaming or appending records because each line is independent.

```python
import json

# Writing JSONL - append records one by one
records = [
 {"id": 1, "player": "Rohit Sharma", "score": 89},
 {"id": 2, "player": "Virat Kohli", "score": 112},
 {"id": 3, "player": "MS Dhoni", "score": 67},
]

with open("scores.jsonl", "w", encoding="utf-8") as f:
 for record in records:
 f.write(json.dumps(record) + "\n") # one JSON object per line

# Reading JSONL - lazy, memory-efficient
def read_jsonl(filepath):
 with open(filepath, "r", encoding="utf-8") as f:
 for line in f:
 line = line.strip()
 if line: # skip blank lines
 yield json.loads(line)

for record in read_jsonl("scores.jsonl"):
 print(record)
# {'id': 1, 'player': 'Rohit Sharma', 'score': 89}
# ...
```

---

## Part 6: Binary Files

Some files aren't text - images, PDFs, executables, compressed archives. You handle these with binary mode.

### Reading and Writing Binary Files

```python
# Copy a binary file
def copy_file(src_path, dst_path, chunk_size=65536):
 """Copy a file in binary chunks - works for files of any size."""
 with open(src_path, "rb") as src, open(dst_path, "wb") as dst:
 while True:
 chunk = src.read(chunk_size)
 if not chunk: # empty bytes = end of file
 break
 dst.write(chunk)

copy_file("photo.jpg", "photo_backup.jpg")

# Get file size without loading content
import os
size_bytes = os.path.getsize("photo.jpg")
print(f"File size: {size_bytes:,} bytes ({size_bytes / 1024 / 1024:.2f} MB)")

# Read the first few bytes - magic bytes for file type detection
def detect_file_type(filepath):
 """Detect file type by reading magic bytes."""
 signatures = {
 b'\xff\xd8\xff': 'JPEG image',
 b'\x89PNG\r\n\x1a\n': 'PNG image',
 b'%PDF': 'PDF document',
 b'PK\x03\x04': 'ZIP archive',
 b'\x1f\x8b': 'GZIP compressed',
 b'RIFF': 'RIFF file (WAV/AVI)',
 }
 with open(filepath, "rb") as f:
 header = f.read(8)
 for signature, file_type in signatures.items():
 if header.startswith(signature):
 return file_type
 return "Unknown file type"

print(detect_file_type("report.pdf")) # PDF document
print(detect_file_type("photo.jpg")) # JPEG image
```

### Working with `struct` - Reading Structured Binary Data

```python
import struct

# Write structured binary data (a simple binary format)
# Format: name (20 chars), score (int), average (float)
players = [
 ("Rohit Sharma", 1200, 48.50),
 ("Virat Kohli", 980, 52.10),
 ("Jasprit Bumrah", 45, 9.00),
]

record_format = "20s i f" # 20-char string, int (4 bytes), float (4 bytes)
record_size = struct.calcsize(record_format) # = 28 bytes

with open("players.bin", "wb") as f:
 for name, runs, avg in players:
 packed = struct.pack(record_format, name.encode("utf-8").ljust(20), runs, avg)
 f.write(packed)

# Read it back
with open("players.bin", "rb") as f:
 while True:
 data = f.read(record_size)
 if not data:
 break
 name_bytes, runs, avg = struct.unpack(record_format, data)
 name = name_bytes.decode("utf-8").rstrip("\x00")
 print(f"{name}: {runs} runs, avg {avg:.2f}")
```

---

## Part 7: Configuration Files with `configparser`

INI-style config files are common for application settings. Python's `configparser` module handles them natively.

### Reading and Writing Config Files

```python
# config.ini
# [database]
# host = localhost
# port = 5432
# name = myapp_db
# pool_size = 10
#
# [server]
# host = 0.0.0.0
# port = 8000
# debug = true
# allowed_origins = http://localhost:3000,https://myapp.com

import configparser

config = configparser.ConfigParser()
config.read("config.ini", encoding="utf-8")

# Access values - always returns strings
db_host = config["database"]["host"]
db_port = config.getint("database", "port") # parse as int
pool = config.getint("database", "pool_size")
debug = config.getboolean("server", "debug") # 'true'/'false' → bool
origins = config["server"]["allowed_origins"].split(",")

print(f"Database: {db_host}:{db_port}/{config['database']['name']}")
print(f"Debug mode: {debug}")

# Safe access with fallback
log_level = config.get("logging", "level", fallback="INFO")

# Writing a config file
config2 = configparser.ConfigParser()
config2["database"] = {
 "host": "prod-db.example.com",
 "port": "5432",
 "name": "production",
 "pool_size": "20",
}
config2["server"] = {
 "host": "0.0.0.0",
 "port": "8000",
 "debug": "false",
}

with open("prod_config.ini", "w", encoding="utf-8") as f:
 config2.write(f)
```

---

## Part 8: `pathlib` - The Modern Way to Handle Paths

Python 3.4 introduced `pathlib`, which replaces string-based path operations with an object-oriented API. It's cleaner, more readable, and cross-platform by default. Prefer `pathlib` over `os.path` in all new code.

### `Path` Objects - The Basics

```python
from pathlib import Path

# Create a Path object - works on Windows, Mac, and Linux
p = Path("data/reports/ipl2024.csv")

# Path components
print(p.name) # 'ipl2024.csv' ← filename with extension
print(p.stem) # 'ipl2024' ← filename without extension
print(p.suffix) # '.csv' ← extension
print(p.suffixes) # ['.csv'] ← all extensions
print(p.parent) # data/reports ← parent directory
print(p.parents[0]) # data/reports
print(p.parents[1]) # data
print(p.parts) # ('data', 'reports', 'ipl2024.csv')

# Build paths with / operator - works cross-platform
base = Path("data")
reports = base / "reports"
file = reports / "ipl2024.csv"
print(file) # data/reports/ipl2024.csv

# Absolute path
print(Path.cwd()) # current working directory
print(file.resolve())# fully resolved absolute path
```

### Checking, Creating, and Deleting

```python
from pathlib import Path

p = Path("data/reports/ipl2024.csv")

# Checking
print(p.exists()) # True/False - does it exist?
print(p.is_file()) # True if it's a regular file
print(p.is_dir()) # True if it's a directory
print(p.is_absolute()) # True if path is absolute

# Create directories
Path("data/reports").mkdir(parents=True, exist_ok=True)
# parents=True → creates intermediate directories (like mkdir -p)
# exist_ok=True → no error if directory already exists

# Create a file
Path("data/notes.txt").touch() # create empty file, or update mtime if exists

# Delete
Path("data/temp.txt").unlink() # delete a file
Path("data/temp.txt").unlink(missing_ok=True) # no error if doesn't exist (3.8+)
Path("data/empty_dir").rmdir() # delete empty directory

# Rename / move
p.rename("data/reports/ipl2024_backup.csv")
p.replace("data/archive/ipl2024.csv") # replace() works even if destination exists
```

### Listing and Searching Files

```python
from pathlib import Path

project = Path("my_project")

# List immediate children
for item in project.iterdir():
 kind = "DIR " if item.is_dir() else "FILE"
 print(f"{kind} {item.name}")

# Find files matching a pattern - one level deep
for csv_file in project.glob("*.csv"):
 print(csv_file)

# Recursive search - all levels
for py_file in project.rglob("*.py"):
 print(py_file)

# Find all Python files, skip hidden directories and __pycache__
py_files = [
 f for f in project.rglob("*.py")
 if "__pycache__" not in f.parts
 and not any(part.startswith(".") for part in f.parts)
]

# Get file metadata
p = Path("data.csv")
stat = p.stat()
print(f"Size: {stat.st_size:,} bytes")
print(f"Modified: {datetime.datetime.fromtimestamp(stat.st_mtime)}")
print(f"Created: {datetime.datetime.fromtimestamp(stat.st_ctime)}")
```

### Reading and Writing with `pathlib`

Path objects have their own read/write methods for convenience:

```python
from pathlib import Path

p = Path("notes.txt")

# Write and read text
p.write_text("Hello, Python!\nSecond line.\n", encoding="utf-8")
content = p.read_text(encoding="utf-8")
print(content)

# Write and read bytes
p_bin = Path("data.bin")
p_bin.write_bytes(b"\x00\x01\x02\x03")
data = p_bin.read_bytes()
print(data) # b'\x00\x01\x02\x03'

# For more control (large files, line-by-line), use open() as before
with p.open("r", encoding="utf-8") as f:
 for line in f:
 print(line.rstrip())
```

### `os.path` vs `pathlib` Side-by-Side

```python
import os
from pathlib import Path

filepath = "data/reports/ipl2024.csv"

# --- String-based (old way) ---
dirname = os.path.dirname(filepath) # 'data/reports'
basename = os.path.basename(filepath) # 'ipl2024.csv'
stem, ext = os.path.splitext(basename) # ('ipl2024', '.csv')
joined = os.path.join("data", "reports", "f") # 'data/reports/f'
exists = os.path.exists(filepath)
abspath = os.path.abspath(filepath)

# --- pathlib (new way) ---
p = Path(filepath)
dirname = p.parent # Path('data/reports')
basename = p.name # 'ipl2024.csv'
stem = p.stem # 'ipl2024'
ext = p.suffix # '.csv'
joined = Path("data") / "reports" / "f" # Path('data/reports/f')
exists = p.exists()
abspath = p.resolve()
```

---

## Part 9: Working with `os` and `shutil` - File System Operations

For operations beyond reading and writing - copying, moving, deleting, directory management - use `os` and `shutil`.

```python
import os
import shutil
from pathlib import Path

# --- File operations ---
os.rename("old.txt", "new.txt") # rename (same filesystem)
os.replace("src.txt", "dst.txt") # rename, overwriting dst if it exists
os.remove("unwanted.txt") # delete a file

# shutil for copying
shutil.copy("src.txt", "dst.txt") # copy file (no metadata)
shutil.copy2("src.txt", "dst.txt") # copy file + metadata (timestamps)
shutil.copyfileobj(src_file, dst_file) # copy between open file objects

# --- Directory operations ---
os.mkdir("new_dir") # create one directory
os.makedirs("a/b/c", exist_ok=True) # create full path
os.rmdir("empty_dir") # delete empty directory
shutil.rmtree("full_dir") # delete directory and all contents (careful!)

# --- Move ---
shutil.move("src_path", "dst_path") # move file or directory

# --- Disk usage ---
total, used, free = shutil.disk_usage("/")
print(f"Total: {total // (2**30):.1f} GB")
print(f"Used: {used // (2**30):.1f} GB")
print(f"Free: {free // (2**30):.1f} GB")

# --- Environment and current directory ---
print(os.getcwd()) # current working directory
os.chdir("/tmp") # change directory
print(os.environ.get("HOME", "unknown")) # environment variables
```

### Temporary Files and Directories

```python
import tempfile
import os

# Temporary file - deleted when closed
with tempfile.NamedTemporaryFile(mode="w", suffix=".csv",
 encoding="utf-8", delete=True) as tmp:
 tmp.write("name,score\nRavi,95\n")
 print(f"Temp file: {tmp.name}")
 # File is accessible here by name

# Temporary directory - deleted when the context exits
with tempfile.TemporaryDirectory() as tmpdir:
 tmpdir_path = Path(tmpdir)
 output_file = tmpdir_path / "results.json"
 output_file.write_text('{"status": "ok"}', encoding="utf-8")
 # Process files...
# tmpdir and all its contents are deleted here

# Persistent temp file (you manage deletion)
fd, path = tempfile.mkstemp(suffix=".txt")
os.close(fd) # close the low-level file descriptor
with open(path, "w", encoding="utf-8") as f:
 f.write("temporary content")
# ... use the file ...
os.unlink(path) # you must delete it manually
```

---

## Part 10: Common Mistakes to Avoid

### Mistake 1 - Forgetting to Close Files (Not Using `with`)

```python
# BAD - if an exception occurs, the file is never closed
f = open("data.txt", "r")
content = f.read()
process(content) # raises an exception!
f.close() # never reached → file descriptor leaked

# GOOD - with guarantees closure
with open("data.txt", "r", encoding="utf-8") as f:
 content = f.read()
 process(content)
```

### Mistake 2 - Opening in Write Mode Accidentally Destroys Data

```python
# CATASTROPHIC - 'w' truncates the file immediately on open
with open("important_data.csv", "w") as f:
 # The file is NOW EMPTY, even before you write anything!
 f.write(new_data)

# SAFE - if the file might exist, use 'a' or 'x' depending on intent
with open("log.csv", "a") as f: # append, never destroys
 f.write(new_row)

with open("new_file.csv", "x") as f: # fails if file already exists
 f.write(data)
```

### Mistake 3 - Splitting CSV Lines Manually

```python
# BAD - breaks on values containing commas
line = 'Ravi,"123, MG Road, Bangalore",Hyderabad'
parts = line.split(",") # WRONG: gives 4 parts instead of 3

# GOOD - use the csv module which handles quoting correctly
import csv
import io
reader = csv.reader(io.StringIO(line))
parts = next(reader) # ['Ravi', '123, MG Road, Bangalore', 'Hyderabad']
```

### Mistake 4 - Not Specifying Encoding

```python
# BAD - works on your machine, breaks elsewhere
with open("hindi_content.txt", "r") as f:
 content = f.read() # might raise UnicodeDecodeError on different systems

# GOOD - always explicit
with open("hindi_content.txt", "r", encoding="utf-8") as f:
 content = f.read()
```

### Mistake 5 - Loading Huge Files Entirely Into Memory

```python
# BAD - loads a 5 GB log file into a single list
with open("huge.log", "r", encoding="utf-8") as f:
 lines = f.readlines() # 5 GB in RAM!

# GOOD - process one line at a time
with open("huge.log", "r", encoding="utf-8") as f:
 for line in f:
 process(line) # constant memory, any file size
```

### Mistake 6 - Reading a File Object Twice Without Seeking

```python
# BUG - second read returns empty string
with open("data.txt", "r", encoding="utf-8") as f:
 first_read = f.read() # reads all content, pointer at end
 second_read = f.read() # returns '' - pointer is at end!
 print(bool(second_read)) # False

# FIX - seek back to the start
with open("data.txt", "r", encoding="utf-8") as f:
 first_read = f.read()
 f.seek(0) # reset pointer to beginning
 second_read = f.read() # reads full content again
 print(first_read == second_read) # True
```

### Mistake 7 - String Concatenation for Path Building

```python
import os
from pathlib import Path

# BAD - breaks on Windows ('\' vs '/')
path = base_dir + "/" + subdir + "/" + filename

# ALSO BAD - verbose and error-prone
path = os.path.join(base_dir, subdir, filename)

# GOOD - use pathlib
path = Path(base_dir) / subdir / filename
```

### Mistake 8 - Forgetting `newline=""` for CSV Files

```python
import csv

# BAD - on Windows, Python's universal newline translation
# + csv's own newline handling can create blank rows in output
with open("data.csv", "w") as f:
 writer = csv.writer(f)
 writer.writerow(["a", "b"])

# GOOD - always use newline="" with csv module
with open("data.csv", "w", encoding="utf-8", newline="") as f:
 writer = csv.writer(f)
 writer.writerow(["a", "b"])
```

---

## Part 11: Real-World Patterns

### Pattern 1 - Config Loader with Multiple Formats

```python
import json
import configparser
from pathlib import Path

def load_config(config_path):
 """
 Load configuration from JSON or INI file.
 Returns a plain dict in either case.
 """
 p = Path(config_path)
 if not p.exists():
 raise FileNotFoundError(f"Config file not found: {p}")

 if p.suffix == ".json":
 with p.open("r", encoding="utf-8") as f:
 return json.load(f)

 elif p.suffix in (".ini", ".cfg"):
 config = configparser.ConfigParser()
 config.read(p, encoding="utf-8")
 return {
 section: dict(config[section])
 for section in config.sections()
 }

 else:
 raise ValueError(f"Unsupported config format: {p.suffix}")

# Usage
config = load_config("app.json")
db_host = config["database"]["host"]
```

### Pattern 2 - Streaming File Processor

Process large files efficiently by reading in chunks, never loading the whole file.

```python
from pathlib import Path
from itertools import islice

def read_in_batches(filepath, batch_size=1000):
 """Yield batches of `batch_size` lines from a file."""
 with open(filepath, "r", encoding="utf-8") as f:
 while True:
 batch = list(islice(f, batch_size))
 if not batch:
 break
 yield [line.rstrip("\n") for line in batch]


def process_large_log(filepath):
 """Count error occurrences by error code in a large log file."""
 from collections import Counter
 error_counts = Counter()

 for batch in read_in_batches(filepath, batch_size=500):
 for line in batch:
 if "ERROR" in line:
 # Parse error code from line like: "2024-01-15 [ERROR] E1234 message"
 parts = line.split()
 if len(parts) >= 3:
 error_counts[parts[2]] += 1

 return error_counts.most_common(10)
```

### Pattern 3 - Directory Organizer

```python
import shutil
from pathlib import Path

def organize_downloads(source_dir, target_dir):
 """
 Move files from source_dir to categorized subdirectories in target_dir
 based on file extension.
 """
 CATEGORIES = {
 "Images": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"},
 "Documents": {".pdf", ".docx", ".doc", ".txt", ".md", ".xlsx"},
 "Data": {".csv", ".json", ".xml", ".parquet", ".sql"},
 "Code": {".py", ".js", ".ts", ".html", ".css", ".sh"},
 "Archives": {".zip", ".tar", ".gz", ".rar", ".7z"},
 }

 source = Path(source_dir)
 target = Path(target_dir)
 moved = 0

 for file in source.iterdir():
 if not file.is_file():
 continue

 category = "Other"
 for cat_name, extensions in CATEGORIES.items():
 if file.suffix.lower() in extensions:
 category = cat_name
 break

 dest_dir = target / category
 dest_dir.mkdir(parents=True, exist_ok=True)
 shutil.move(str(file), dest_dir / file.name)
 moved += 1
 print(f" {file.name} → {category}/")

 print(f"\nOrganized {moved} files.")

organize_downloads("~/Downloads", "~/Downloads/Organized")
```

### Pattern 4 - File Watcher

```python
import time
import os
from pathlib import Path

def watch_file(filepath, poll_interval=1.0):
 """
 Generator that yields the file content whenever it changes.
 Useful for watching log files or config reloads.
 """
 p = Path(filepath)
 last_mtime = None

 while True:
 try:
 current_mtime = p.stat().st_mtime
 if current_mtime != last_mtime:
 last_mtime = current_mtime
 yield p.read_text(encoding="utf-8")
 except FileNotFoundError:
 pass # file may not exist yet
 time.sleep(poll_interval)

# Usage (in a separate thread or async context)
# for content in watch_file("app.log"):
# process_new_content(content)
```

---

## Practice Problems

---

### Problem 1 - Word Frequency Counter

**Task:** Read a text file, count the frequency of each word (case-insensitive, ignoring punctuation), and write the top 10 most common words to a new file, one word per line with its count.

**Solution:**

```python
import re
from collections import Counter
from pathlib import Path

def word_frequency(input_path, output_path, top_n=10):
 # Read and clean
 text = Path(input_path).read_text(encoding="utf-8").lower()
 words = re.findall(r"\b[a-z]+\b", text) # only alphabetic words
 counts = Counter(words)

 # Write top N
 with open(output_path, "w", encoding="utf-8") as f:
 f.write(f"Top {top_n} words\n")
 f.write("-" * 25 + "\n")
 for word, count in counts.most_common(top_n):
 f.write(f"{word:<20} {count:>5}\n")

word_frequency("novel.txt", "word_freq.txt", top_n=10)
```

---

### Problem 2 - CSV Filter and Transform

**Task:** Read a CSV of cricket players. Keep only players with average > 40. Add a new column `grade` (A for avg > 50, B for avg > 40). Write the result to a new CSV, sorted by average descending.

**Solution:**

```python
import csv

def filter_and_grade(input_csv, output_csv, min_avg=40.0):
 results = []

 with open(input_csv, "r", encoding="utf-8", newline="") as f:
 reader = csv.DictReader(f)
 for row in reader:
 avg = float(row["average"])
 if avg > min_avg:
 row["grade"] = "A" if avg > 50 else "B"
 results.append(row)

 results.sort(key=lambda r: float(r["average"]), reverse=True)

 if not results:
 print("No qualifying players.")
 return

 fieldnames = list(results[0].keys())
 with open(output_csv, "w", encoding="utf-8", newline="") as f:
 writer = csv.DictWriter(f, fieldnames=fieldnames)
 writer.writeheader()
 writer.writerows(results)

 print(f"Wrote {len(results)} players to {output_csv}")

filter_and_grade("players.csv", "top_players.csv")
```

---

### Problem 3 - JSON Config Merge

**Task:** Given a `defaults.json` and an `overrides.json`, merge them so that overrides take precedence. Write the merged config to `final.json`. Handle missing files gracefully.

**Solution:**

```python
import json
from pathlib import Path

def merge_configs(defaults_path, overrides_path, output_path):
 def load_json_safe(path):
 p = Path(path)
 if not p.exists():
 print(f"File not found: {path}, using empty dict")
 return {}
 with p.open("r", encoding="utf-8") as f:
 return json.load(f)

 defaults = load_json_safe(defaults_path)
 overrides = load_json_safe(overrides_path)

 # Deep merge: overrides take precedence, nested dicts are merged recursively
 def deep_merge(base, override):
 result = base.copy()
 for key, value in override.items():
 if key in result and isinstance(result[key], dict) and isinstance(value, dict):
 result[key] = deep_merge(result[key], value)
 else:
 result[key] = value
 return result

 merged = deep_merge(defaults, overrides)

 with open(output_path, "w", encoding="utf-8") as f:
 json.dump(merged, f, indent=2, ensure_ascii=False)

 print(f"Merged config written to {output_path}")

merge_configs("defaults.json", "overrides.json", "final.json")
```

---

### Problem 4 - Log File Analyzer

**Task:** Read a log file where each line has the format `YYYY-MM-DD HH:MM:SS [LEVEL] message`. Count entries per level (INFO, WARNING, ERROR, etc.). Print a summary and write all ERROR lines to a separate file.

**Solution:**

```python
import re
from collections import Counter
from pathlib import Path

LOG_PATTERN = re.compile(
 r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)"
)

def analyze_logs(log_path, error_output_path):
 level_counts = Counter()
 error_lines = []

 with open(log_path, "r", encoding="utf-8") as f:
 for line_num, line in enumerate(f, start=1):
 match = LOG_PATTERN.match(line.strip())
 if match:
 timestamp, level, message = match.groups()
 level_counts[level] += 1
 if level == "ERROR":
 error_lines.append(line.strip())
 else:
 print(f" Unparseable line {line_num}: {line[:60]!r}")

 # Summary
 print("\nLog Summary")
 print("=" * 30)
 total = sum(level_counts.values())
 for level, count in sorted(level_counts.items()):
 pct = count / total * 100
 print(f" {level:<10} {count:>5} ({pct:5.1f}%)")
 print(f" {'TOTAL':<10} {total:>5}")

 # Write errors
 if error_lines:
 with open(error_output_path, "w", encoding="utf-8") as f:
 f.write(f"# {len(error_lines)} ERROR entries\n\n")
 f.write("\n".join(error_lines) + "\n")
 print(f"\nWrote {len(error_lines)} errors to {error_output_path}")

analyze_logs("app.log", "errors_only.log")
```

---

### Problem 5 - Directory Diff

**Task:** Given two directories, find files that exist in the first but not the second (missing), files that exist in both (common), and files that exist only in the second (new). Use `pathlib`.

**Solution:**

```python
from pathlib import Path

def directory_diff(dir_a, dir_b):
 """
 Compare two directories by filename.
 Returns (only_in_a, common, only_in_b) as sets of filenames.
 """
 a = Path(dir_a)
 b = Path(dir_b)

 files_a = {f.name for f in a.iterdir() if f.is_file()}
 files_b = {f.name for f in b.iterdir() if f.is_file()}

 only_in_a = files_a - files_b
 common = files_a & files_b
 only_in_b = files_b - files_a

 print(f"Only in {a.name}/ ({len(only_in_a)}): {sorted(only_in_a)}")
 print(f"Common ({len(common)}): {sorted(common)}")
 print(f"Only in {b.name}/ ({len(only_in_b)}): {sorted(only_in_b)}")

 return only_in_a, common, only_in_b

directory_diff("project_v1", "project_v2")
```

---

### Problem 6 - Bulk File Renamer

**Task:** Write a function that renames all `.txt` files in a directory by adding a timestamp prefix to their names. Use `pathlib`. Dry-run mode should print what would happen without actually renaming.

**Solution:**

```python
import datetime
from pathlib import Path

def bulk_rename(directory, pattern="*.txt", dry_run=True):
 """
 Rename all files matching `pattern` in `directory`,
 prepending today's date as YYYYMMDD_.
 """
 base = Path(directory)
 today = datetime.date.today().strftime("%Y%m%d")
 renamed = 0

 for filepath in sorted(base.glob(pattern)):
 new_name = f"{today}_{filepath.name}"
 new_path = filepath.parent / new_name

 if new_path.exists():
 print(f" SKIP (target exists): {filepath.name} → {new_name}")
 continue

 if dry_run:
 print(f" DRY RUN: {filepath.name} → {new_name}")
 else:
 filepath.rename(new_path)
 print(f" RENAMED: {filepath.name} → {new_name}")
 renamed += 1

 if dry_run:
 print("\nDry run complete. Pass dry_run=False to apply changes.")
 else:
 print(f"\nRenamed {renamed} file(s).")

# Preview first
bulk_rename("my_notes", pattern="*.txt", dry_run=True)
# Then apply
# bulk_rename("my_notes", pattern="*.txt", dry_run=False)
```

---

## Quick Reference Cheat Sheet

```
┌──────────────────────────────────────────────────────────────────────────┐
│ FILE HANDLING QUICK REFERENCE │
├──────────────────────────┬───────────────────────────────────────────────┤
│ OPEN MODES │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ 'r' │ Read text. File must exist. │
│ 'w' │ Write text. Creates or TRUNCATES. │
│ 'a' │ Append text. Creates or adds to end. │
│ 'x' │ Create. Fails if already exists. │
│ 'rb' / 'wb' │ Binary read / write. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ READING METHODS │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ f.read() │ Entire file as one string. │
│ f.read(n) │ Next n characters. │
│ f.readline() │ One line (with \n). │
│ f.readlines() │ All lines as a list. │
│ for line in f: │ One line at a time. BEST for large files. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ WRITING METHODS │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ f.write(s) │ Write string s. Returns char count. │
│ f.writelines(lst) │ Write each item. No newlines added. │
│ print(..., file=f) │ Formatted write to file. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ POSITION │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ f.tell() │ Current byte position. │
│ f.seek(0) │ Go to start of file. │
│ f.seek(0, 2) │ Go to end of file. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ CSV MODULE │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ csv.reader(f) │ Rows as lists. │
│ csv.DictReader(f) │ Rows as dicts. │
│ csv.writer(f) │ Write rows as lists. │
│ csv.DictWriter(f, ...) │ Write rows as dicts. │
│ Always newline="" │ When opening files for csv module. │
│ Always encoding utf-8-sig│ For Excel-exported CSVs. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ JSON MODULE │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ json.load(f) │ File → Python object. │
│ json.dump(obj, f) │ Python object → file. │
│ json.loads(s) │ String → Python object. │
│ json.dumps(obj) │ Python object → string. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ PATHLIB │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ Path(str) │ Create a path object. │
│ p / "subdir" / "file" │ Join paths with /. │
│ p.exists() │ Check if path exists. │
│ p.is_file() / is_dir() │ Check type. │
│ p.mkdir(parents=True, │ Create directory tree. │
│ exist_ok=True) │ │
│ p.glob("*.csv") │ Match files in one directory. │
│ p.rglob("*.csv") │ Match files recursively. │
│ p.read_text(encoding=..) │ Read entire file to string. │
│ p.write_text(s, enc=..) │ Write string to file. │
│ p.rename(new) │ Rename/move path. │
│ p.unlink() │ Delete file. │
│ p.stat().st_size │ File size in bytes. │
├──────────────────────────┼───────────────────────────────────────────────┤
│ GOLDEN RULES │ │
├──────────────────────────┼───────────────────────────────────────────────┤
│ ALWAYS │ Use `with` statement to open files. │
│ ALWAYS │ Specify encoding="utf-8" explicitly. │
│ ALWAYS │ Use newline="" with csv module. │
│ ALWAYS │ Iterate over file object for large files. │
│ NEVER │ Use 'w' without confirming overwrite is ok. │
│ NEVER │ Split CSV lines with .split(','). │
│ PREFER │ pathlib.Path over os.path string methods. │
└──────────────────────────┴───────────────────────────────────────────────┘
```

---

*End of Guide - Working with Files in Python*
*Codeverra - codeverra.com*
