---
title: "Python Collections - Theory"
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Python Collections
### Lists, Tuples, Dictionaries, and Sets -- The Four Ways to Store Data

---

## Before We Begin -- Why Collections Are Central to Everything

At some point you stop writing programs that work on one value at a time
and start writing programs that work on many values at once. A list of
students. A dictionary of city populations. A set of unique tags.
A tuple representing a coordinate.

Collections are the bridge between "I know Python basics" and "I can solve
real problems." Everything that follows in this curriculum -- loops,
functions, Pandas, APIs -- assumes you are comfortable with collections.

Python has four built-in collection types, each designed for a specific
kind of data storage problem:

```
List    -- ordered, mutable, allows duplicates
          "a sequence of things I can change"

Tuple   -- ordered, immutable, allows duplicates
          "a fixed record that should not change"

Dictionary -- key-value pairs, ordered (3.7+), mutable, unique keys
          "a lookup table"

Set     -- unordered, mutable, no duplicates
          "a bag of unique things"
```

This guide covers each one completely -- how they work, all their methods,
when to use them, and the patterns you will see in real code.

---

## Table of Contents

1. [Lists](#1-lists)
2. [List Methods -- Complete Reference](#2-list-methods----complete-reference)
3. [List Patterns and Idioms](#3-list-patterns-and-idioms)
4. [Tuples](#4-tuples)
5. [When to Use a Tuple vs a List](#5-when-to-use-a-tuple-vs-a-list)
6. [Dictionaries](#6-dictionaries)
7. [Dictionary Methods -- Complete Reference](#7-dictionary-methods----complete-reference)
8. [Dictionary Patterns and Idioms](#8-dictionary-patterns-and-idioms)
9. [Sets](#9-sets)
10. [Set Operations -- Complete Reference](#10-set-operations----complete-reference)
11. [Strings as Sequences](#11-strings-as-sequences)
12. [Nested Collections](#12-nested-collections)
13. [Choosing the Right Collection](#13-choosing-the-right-collection)
14. [The collections Module](#14-the-collections-module)
15. [Summary and Key Takeaways](#15-summary-and-key-takeaways)

---

## 1. Lists

A list is an ordered sequence of items. Items can be of any type and can
be repeated. You can add, remove, and change items after the list is created.
This is what "mutable" means -- it can be changed.

### Creating lists

```python
# Empty list
students = []
scores   = list()

# List with items
cities        = ["Delhi", "Mumbai", "Bangalore", "Chennai"]
temperatures  = [32.5, 28.0, 22.0, 35.0]
mixed         = ["Aarav", 21, 8.9, True, None]   # any types allowed
nested        = [[1, 2], [3, 4], [5, 6]]          # lists inside lists

# From another iterable
numbers = list(range(1, 11))      # [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
chars   = list("India")           # ['I', 'n', 'd', 'i', 'a']
```

### Indexing -- accessing single elements

```python
ipl_teams = ["CSK", "MI", "RCB", "KKR", "DC", "SRH"]
#             0      1     2      3      4     5      (positive index)
#            -6     -5    -4     -3     -2    -1      (negative index)

print(ipl_teams[0])    # CSK   (first element)
print(ipl_teams[2])    # RCB   (third element)
print(ipl_teams[-1])   # SRH   (last element)
print(ipl_teams[-2])   # DC    (second to last)
```

### Slicing -- accessing a range of elements

Slicing creates a new list. It never modifies the original.

```python
# Syntax: list[start:stop:step]
# start -- inclusive (default: 0)
# stop  -- exclusive (default: end)
# step  -- how many to jump (default: 1)

teams = ["CSK", "MI", "RCB", "KKR", "DC", "SRH", "GT", "LSG"]

print(teams[1:4])     # ['MI', 'RCB', 'KKR']     (index 1, 2, 3)
print(teams[:3])      # ['CSK', 'MI', 'RCB']      (first 3)
print(teams[5:])      # ['SRH', 'GT', 'LSG']      (from index 5 to end)
print(teams[::2])     # ['CSK', 'RCB', 'DC', 'GT'] (every 2nd)
print(teams[::-1])    # reversed list
print(teams[-3:])     # last 3 elements

# Slicing a copy
copy = teams[:]       # creates a shallow copy of the entire list
```

### Modifying lists

```python
players = ["Rohit", "Kohli", "Dhoni", "Jadeja", "Bumrah"]

# Change an element
players[2] = "Pant"
print(players)   # ['Rohit', 'Kohli', 'Pant', 'Jadeja', 'Bumrah']

# Change a slice
players[1:3] = ["Virat", "MS", "SKY"]   # can change length too
print(players)   # ['Rohit', 'Virat', 'MS', 'SKY', 'Jadeja', 'Bumrah']

# Delete an element
del players[0]
print(players)   # ['Virat', 'MS', 'SKY', 'Jadeja', 'Bumrah']
```

### Checking membership

```python
cities = ["Delhi", "Mumbai", "Bangalore"]

print("Mumbai" in cities)       # True
print("Kolkata" in cities)      # False
print("Kolkata" not in cities)  # True
```

---

## 2. List Methods -- Complete Reference

```python
fruits = ["mango", "banana", "apple", "mango", "orange"]

# ── Adding elements ──────────────────────────────────────────────────────
fruits.append("guava")           # add to end
print(fruits)
# ['mango', 'banana', 'apple', 'mango', 'orange', 'guava']

fruits.insert(2, "papaya")       # insert at index 2
print(fruits)
# ['mango', 'banana', 'papaya', 'apple', 'mango', 'orange', 'guava']

fruits.extend(["grapes", "kiwi"]) # add multiple items from another iterable
# equivalent to: fruits += ["grapes", "kiwi"]

# ── Removing elements ────────────────────────────────────────────────────
fruits.remove("banana")          # removes FIRST occurrence of this value
                                  # raises ValueError if not found

popped = fruits.pop()            # removes and returns the LAST element
popped = fruits.pop(0)           # removes and returns element at index 0

fruits.clear()                    # removes ALL elements

# ── Searching ────────────────────────────────────────────────────────────
teams = ["CSK", "MI", "RCB", "KKR", "MI", "CSK"]

print(teams.index("MI"))         # 1  -- index of FIRST occurrence
                                  # raises ValueError if not found
print(teams.count("CSK"))        # 2  -- how many times it appears

# ── Sorting ──────────────────────────────────────────────────────────────
scores = [45, 88, 72, 91, 60, 38, 55]

scores.sort()                     # sort IN PLACE (modifies original)
print(scores)                     # [38, 45, 55, 60, 72, 88, 91]

scores.sort(reverse=True)         # sort descending
print(scores)                     # [91, 88, 72, 60, 55, 45, 38]

# Sort by a key function
students = ["Priya", "Aarav", "Rohan", "Sneha", "Karan"]
students.sort(key=len)            # sort by string length
print(students)

students.sort(key=str.lower)      # sort case-insensitively

# sorted() -- returns a NEW sorted list, does not modify original
original  = [5, 2, 8, 1, 9]
new_list  = sorted(original)      # original unchanged
print(original)  # [5, 2, 8, 1, 9]
print(new_list)  # [1, 2, 5, 8, 9]

# ── Other operations ─────────────────────────────────────────────────────
nums = [1, 2, 3]
nums.reverse()                    # reverses IN PLACE
print(nums)                       # [3, 2, 1]

nums_copy = nums.copy()           # shallow copy (same as nums[:])

# ── Built-in functions ───────────────────────────────────────────────────
scores = [45, 88, 72, 91, 60]

print(len(scores))                # 5     -- number of items
print(min(scores))                # 45    -- minimum value
print(max(scores))                # 91    -- maximum value
print(sum(scores))                # 356   -- sum of all values
print(sum(scores) / len(scores))  # 71.2  -- average
```

---

## 3. List Patterns and Idioms

### List comprehension

The most important list technique. Creates a new list from an existing
iterable in one readable line.

```python
# Basic comprehension: [expression for item in iterable]
marks = [88, 45, 72, 95, 60, 38, 81]

# Double all marks
doubled = [m * 2 for m in marks]

# Add 5% bonus to all
with_bonus = [round(m * 1.05, 1) for m in marks]

# String transformation
cities = ["delhi", "mumbai", "bangalore"]
proper = [city.title() for city in cities]

# With condition: [expression for item in iterable if condition]
passed  = [m for m in marks if m >= 60]
# [88, 72, 95, 60, 81]

# Condition in the expression (if-else inside comprehension)
results = ["Pass" if m >= 60 else "Fail" for m in marks]

# Nested comprehension (flatten a 2D list)
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat   = [val for row in matrix for val in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Unpacking

```python
# Unpack list into variables
first, second, third = [10, 20, 30]
print(first, second, third)   # 10 20 30

# Extended unpacking with * (star)
first, *rest       = [1, 2, 3, 4, 5]
*start, last       = [1, 2, 3, 4, 5]
first, *middle, last = [1, 2, 3, 4, 5]

print(first)    # 1
print(rest)     # [2, 3, 4, 5]
print(last)     # 5
print(middle)   # [2, 3, 4]

# Swap two variables (no temp variable needed)
a, b = 10, 20
a, b = b, a
print(a, b)   # 20 10
```

### Checking list contents

```python
marks = [88, 45, 72, 95, 60]

# any() -- True if at least one element satisfies the condition
print(any(m >= 90 for m in marks))    # True (95 >= 90)
print(any(m >= 100 for m in marks))   # False

# all() -- True if ALL elements satisfy the condition
print(all(m >= 40 for m in marks))    # True (all >= 40)
print(all(m >= 60 for m in marks))    # False (45 < 60)
```

---

## 4. Tuples

A tuple is like a list, but immutable -- once created, it cannot be changed.
You cannot add, remove, or modify elements.

### Creating tuples

```python
# Empty tuple
empty = ()
empty = tuple()

# Single item tuple -- the comma is required
single = (42,)      # without comma: (42) is just 42 in parentheses
single = 42,        # parentheses are optional

# Multiple items
coordinates = (28.6139, 77.2090)     # Delhi lat/lon
rgb_red     = (255, 0, 0)
student     = ("Aarav Sharma", 101, 8.9, "Computer Science")

# Parentheses are optional (but recommended for clarity)
point = 3, 4
```

### Accessing tuple elements

```python
student = ("Aarav Sharma", 101, 8.9, "Computer Science")

print(student[0])     # Aarav Sharma
print(student[-1])    # Computer Science
print(student[1:3])   # (101, 8.9)  -- slicing returns a tuple
```

### Tuple unpacking

```python
# Basic unpacking
name, roll, cgpa, dept = ("Aarav Sharma", 101, 8.9, "CS")

# Swap values
a, b = 10, 20
a, b = b, a

# Ignore values with _
name, _, cgpa, _ = ("Aarav", 101, 8.9, "CS")
# _ is a convention for "I don't need this value"

# Multiple return values from a function (returns a tuple)
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, avg = get_stats([45, 88, 72, 91, 60])
print(f"Low: {low}, High: {high}, Avg: {avg}")
```

### Tuple methods

Tuples have only two methods (because they are immutable):

```python
cities = ("Delhi", "Mumbai", "Delhi", "Bangalore", "Delhi")

print(cities.count("Delhi"))    # 3
print(cities.index("Mumbai"))   # 1  -- index of first occurrence
```

### Tuples as dictionary keys

Because tuples are immutable, they can be used as dictionary keys.
Lists cannot.

```python
# Map city coordinates to city names
locations = {
    (28.6139, 77.2090): "Delhi",
    (19.0760, 72.8777): "Mumbai",
    (12.9716, 77.5946): "Bangalore",
}

lookup = (28.6139, 77.2090)
print(locations[lookup])   # Delhi

# Lists cannot be dict keys (unhashable)
# {[1, 2]: "value"}   # TypeError: unhashable type: 'list'
```

---

## 5. When to Use a Tuple vs a List

```
Use a TUPLE when:
  - The data represents a fixed record that should not change
    Example: GPS coordinates (lat, lon), an RGB colour (r, g, b)
  - Returning multiple values from a function
  - Using as a dictionary key
  - Performance matters -- tuples are slightly faster than lists
  - You want to signal to readers: "this data is not meant to change"

Use a LIST when:
  - You need to add, remove, or modify elements
  - The number of elements changes over time
  - Order matters but the contents can change
  - You are building up a collection iteratively
```

```python
# Good uses of tuples
MONTHS        = ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
DB_CONFIG     = ("localhost", 5432, "mydb")   # host, port, name
DELHI_COORDS  = (28.6139, 77.2090)

# Good uses of lists
students      = ["Aarav", "Priya", "Rohan"]   # students join and leave
scores        = []                             # accumulate during processing
current_queue = ["task1", "task2"]             # items added and removed
```

---

## 6. Dictionaries

A dictionary stores data as key-value pairs. You look up values by their
key rather than by position. Keys must be unique and immutable (strings,
numbers, tuples). Values can be anything.

### Creating dictionaries

```python
# Empty dictionary
profile = {}
profile = dict()

# With initial data
student = {
    "name":    "Aarav Sharma",
    "roll":    101,
    "cgpa":    8.9,
    "courses": ["Python", "Data Science", "SQL"],
    "active":  True,
}

# From a list of key-value pairs
items  = [("name", "Priya"), ("age", 22), ("city", "Mumbai")]
person = dict(items)

# Using keyword arguments
config = dict(host="localhost", port=5432, db="mydb")
```

### Accessing values

```python
student = {"name": "Aarav", "roll": 101, "cgpa": 8.9}

# Direct access -- raises KeyError if key does not exist
print(student["name"])    # Aarav
print(student["roll"])    # 101

# .get() -- returns None (or a default) if key does not exist
print(student.get("cgpa"))           # 8.9
print(student.get("email"))          # None
print(student.get("email", "N/A"))   # N/A

# Always use .get() when the key might not exist
```

### Modifying dictionaries

```python
student = {"name": "Aarav", "roll": 101}

# Add a new key
student["cgpa"] = 8.9

# Update an existing key
student["cgpa"] = 9.1

# Add/update multiple keys at once
student.update({"city": "Bangalore", "year": 2})
student.update(cgpa=9.2, active=True)   # keyword argument form

# Delete a key
del student["roll"]

# Delete and return a value
cgpa = student.pop("cgpa")             # returns 9.2, removes key
city = student.pop("city", "Unknown")  # safe pop -- returns "Unknown" if missing
```

### Checking keys

```python
config = {"host": "localhost", "port": 5432}

print("host" in config)     # True
print("user" in config)     # False
print("user" not in config) # True

# Iterating
for key in config:                     # iterate over keys
    print(key, config[key])

for key in config.keys():             # same as above, explicit
    print(key)

for value in config.values():         # iterate over values
    print(value)

for key, value in config.items():     # iterate over key-value pairs
    print(f"{key}: {value}")
```

---

## 7. Dictionary Methods -- Complete Reference

```python
inventory = {"Laptop": 15, "Phone": 42, "Tablet": 8, "Monitor": 20}

# ── Accessing ─────────────────────────────────────────────────────────────
print(inventory.get("Laptop", 0))       # 15
print(inventory.get("Printer", 0))      # 0 (default)

# setdefault -- add key with default ONLY if key does not exist
inventory.setdefault("Keyboard", 0)     # adds "Keyboard": 0
inventory.setdefault("Laptop", 999)     # does NOT update -- Laptop already exists
print(inventory["Laptop"])              # still 15

# ── Views ────────────────────────────────────────────────────────────────
print(inventory.keys())         # dict_keys(['Laptop', 'Phone', ...])
print(inventory.values())       # dict_values([15, 42, ...])
print(inventory.items())        # dict_items([('Laptop', 15), ...])

# Convert to list if you need to index or slice
key_list = list(inventory.keys())

# ── Removing ─────────────────────────────────────────────────────────────
removed = inventory.pop("Tablet")           # returns 8, removes key
removed = inventory.pop("Headphones", 0)    # safe -- returns 0 if missing
last    = inventory.popitem()               # removes and returns last inserted pair

inventory.clear()                           # removes all pairs

# ── Merging ──────────────────────────────────────────────────────────────
defaults = {"timeout": 30, "retries": 3, "debug": False}
overrides = {"timeout": 60, "debug": True}

# update() -- modifies in place
merged = dict(defaults)
merged.update(overrides)
print(merged)   # {'timeout': 60, 'retries': 3, 'debug': True}

# | operator (Python 3.9+) -- creates new dict
merged = defaults | overrides
print(merged)

# |= operator (Python 3.9+) -- update in place
defaults |= overrides

# ── Copying ──────────────────────────────────────────────────────────────
shallow = inventory.copy()   # top-level copy
import copy
deep    = copy.deepcopy(inventory)   # full independent copy
```

---

## 8. Dictionary Patterns and Idioms

### Dictionary comprehension

```python
# Basic: {key_expr: value_expr for item in iterable}
students = ["Aarav", "Priya", "Rohan", "Sneha"]
marks    = [88, 92, 78, 95]

grade_dict = {name: mark for name, mark in zip(students, marks)}
print(grade_dict)
# {'Aarav': 88, 'Priya': 92, 'Rohan': 78, 'Sneha': 95}

# With condition
passing = {name: mark for name, mark in grade_dict.items() if mark >= 80}

# Transform values
with_grade = {
    name: ("A" if m >= 85 else "B" if m >= 70 else "C")
    for name, m in grade_dict.items()
}

# Invert a dictionary
inverted = {v: k for k, v in grade_dict.items()}
```

### Using setdefault for grouping

```python
# Group employees by department
employees = [
    ("Aarav",  "Engineering"),
    ("Priya",  "HR"),
    ("Rohan",  "Engineering"),
    ("Sneha",  "Marketing"),
    ("Karan",  "HR"),
]

by_department = {}
for name, dept in employees:
    by_department.setdefault(dept, []).append(name)

print(by_department)
# {'Engineering': ['Aarav', 'Rohan'], 'HR': ['Priya', 'Karan'], 'Marketing': ['Sneha']}
```

### Using a dictionary as a lookup table (replacing if-elif)

```python
# Instead of:
def get_day_name(day_num):
    if day_num == 1:   return "Monday"
    elif day_num == 2: return "Tuesday"
    elif day_num == 3: return "Wednesday"
    # ... etc

# Use a dictionary:
DAY_NAMES = {
    1: "Monday", 2: "Tuesday", 3: "Wednesday",
    4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday"
}

def get_day_name(day_num):
    return DAY_NAMES.get(day_num, "Invalid day")

print(get_day_name(5))    # Friday
print(get_day_name(9))    # Invalid day
```

### Counting frequencies

```python
# Manually count word frequencies
words = "the cat sat on the mat the cat wore a hat".split()

freq = {}
for word in words:
    freq[word] = freq.get(word, 0) + 1

print(sorted(freq.items(), key=lambda x: x[1], reverse=True))
# [('the', 3), ('cat', 2), ...]

# Using collections.Counter (cleaner)
from collections import Counter
freq = Counter(words)
print(freq.most_common(3))
```

---

## 9. Sets

A set is an unordered collection of unique elements. Duplicates are
automatically removed. Sets are extremely fast for membership testing
and support mathematical set operations.

### Creating sets

```python
# From a literal
cities = {"Delhi", "Mumbai", "Bangalore", "Chennai"}

# From a list (removes duplicates)
tags = set(["python", "data", "python", "ml", "data"])
print(tags)   # {'python', 'data', 'ml'}  -- order not guaranteed

# Empty set -- MUST use set(), not {}
empty_set  = set()
empty_dict = {}   # this creates an empty DICT, not a set!
```

### Basic set operations

```python
cities = {"Delhi", "Mumbai", "Bangalore"}

# Membership (O(1) -- very fast, unlike list which is O(n))
print("Mumbai" in cities)      # True
print("Kolkata" in cities)     # False

# Add and remove
cities.add("Chennai")           # add one element
cities.add("Mumbai")            # adding a duplicate does nothing

cities.remove("Delhi")          # remove -- raises KeyError if not found
cities.discard("Kolkata")       # safe remove -- no error if not found
popped = cities.pop()           # remove and return an ARBITRARY element

cities.clear()                  # remove all elements
```

---

## 10. Set Operations -- Complete Reference

Sets support all the mathematical set operations from set theory.

```python
# Two teams competing in IPL finals
team_a = {"Rohit", "Virat", "Bumrah", "Jadeja", "Pant"}
team_b = {"Dhoni", "Jadeja", "Bumrah", "Ashwin", "Kohli"}

# Union -- all players from EITHER team (no duplicates)
all_players = team_a | team_b
all_players = team_a.union(team_b)
print(all_players)
# {'Rohit', 'Virat', 'Bumrah', 'Jadeja', 'Pant', 'Dhoni', 'Ashwin', 'Kohli'}

# Intersection -- players in BOTH teams
both_teams = team_a & team_b
both_teams = team_a.intersection(team_b)
print(both_teams)   # {'Bumrah', 'Jadeja'}

# Difference -- players in team_a but NOT in team_b
only_a = team_a - team_b
only_a = team_a.difference(team_b)
print(only_a)   # {'Rohit', 'Virat', 'Pant'}

# Symmetric difference -- players in EXACTLY ONE team (not both)
exclusive = team_a ^ team_b
exclusive = team_a.symmetric_difference(team_b)
print(exclusive)
# {'Rohit', 'Virat', 'Pant', 'Dhoni', 'Ashwin', 'Kohli'}

# Subset -- is team_a a subset of a larger set?
squad    = {"Rohit", "Virat", "Bumrah", "Jadeja", "Pant", "Dhoni", "Hardik"}
playing11 = {"Rohit", "Virat", "Bumrah"}

print(playing11.issubset(squad))     # True -- all in playing11 are in squad
print(squad.issuperset(playing11))   # True -- squad contains all of playing11
print(team_a.isdisjoint(team_b))     # False -- they share elements

# In-place set operations
team_a |= {"Hardik", "Surya"}        # add elements from another set
team_a &= team_b                      # keep only elements in both
team_a -= {"Pant"}                    # remove elements in second set
```

### Set comprehension

```python
# {expression for item in iterable if condition}
marks   = [88, 45, 72, 95, 60, 38, 72, 88]

# Unique passing marks
unique_passing = {m for m in marks if m >= 60}
print(unique_passing)   # {88, 72, 95, 60} -- no duplicates, unordered

# First letters of city names
cities       = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Darjeeling"]
first_letters = {city[0] for city in cities}
print(first_letters)   # {'D', 'M', 'B', 'C'}
```

### Frozenset -- immutable sets

```python
# frozenset is immutable -- can be used as a dict key or in a set
tags1 = frozenset(["python", "beginner"])
tags2 = frozenset(["python", "advanced"])

# Can be dict keys
course_map = {
    frozenset(["python", "beginner"]):  "Python 101",
    frozenset(["python", "advanced"]):  "Python OOP",
}

print(course_map[frozenset(["python", "beginner"])])   # Python 101
```

---

## 11. Strings as Sequences

Strings share many behaviours with lists and tuples because they are also
sequences. Everything you learned about indexing and slicing applies.

```python
name = "Hyderabad"

# Indexing
print(name[0])      # H
print(name[-1])     # d

# Slicing
print(name[0:5])    # Hyder
print(name[::-1])   # darebadyH  (reversed)
print(name[::2])    # Hdrd

# Membership
print("Hyde" in name)    # True
print("x" not in name)  # True

# Iteration
for char in name:
    print(char, end=" ")
# H y d e r a b a d

# Length
print(len(name))    # 9
```

### Key difference from lists: strings are immutable

```python
name = "Aarav"
name[0] = "a"   # TypeError -- strings cannot be modified

# To change a string, create a new one
name = name.replace("A", "a", 1)   # "aarav"
# or
name = "a" + name[1:]              # "aarav"
```

---

## 12. Nested Collections

Real-world data is almost always nested. API responses, database records,
configuration files -- all involve collections within collections.

### List of dictionaries (the most common pattern)

```python
# This pattern represents what you will get from APIs, databases, and CSV files
students = [
    {"name": "Aarav Sharma",  "roll": 101, "marks": [88, 92, 75, 90, 85]},
    {"name": "Priya Patel",   "roll": 102, "marks": [95, 88, 91, 87, 93]},
    {"name": "Rohan Verma",   "roll": 103, "marks": [65, 70, 60, 75, 68]},
]

# Access
print(students[0]["name"])           # Aarav Sharma
print(students[1]["marks"][2])       # 91  (Priya's third mark)

# Process all students
for student in students:
    avg   = sum(student["marks"]) / len(student["marks"])
    grade = "Pass" if avg >= 60 else "Fail"
    print(f"{student['name']}: {avg:.1f} -- {grade}")

# List comprehension on nested data
all_names = [s["name"] for s in students]
averages  = [sum(s["marks"]) / len(s["marks"]) for s in students]
toppers   = [s["name"] for s in students if sum(s["marks"]) / len(s["marks"]) >= 85]
```

### Dictionary of lists

```python
# Employees grouped by department
by_dept = {
    "Engineering": ["Aarav", "Rohan", "Meera"],
    "HR":          ["Priya", "Karan"],
    "Sales":       ["Sneha", "Arjun", "Divya"],
}

# Access
print(by_dept["Engineering"])         # ['Aarav', 'Rohan', 'Meera']
print(by_dept["Engineering"][0])      # Aarav

# Iterate
for dept, members in by_dept.items():
    print(f"{dept}: {len(members)} members -- {', '.join(members)}")

# Add to a department
by_dept["Engineering"].append("Vikram")

# Safe access
finance_team = by_dept.get("Finance", [])   # returns [] if Finance not present
```

### Deeply nested JSON-style data

```python
# Simulating an API response
order = {
    "order_id": "ORD001",
    "customer": {
        "name": "Aarav Sharma",
        "city": "Bangalore",
        "contact": {
            "email": "aarav@example.com",
            "phone": "9876543210"
        }
    },
    "items": [
        {"product": "Laptop",   "qty": 1, "price": 65000},
        {"product": "Mouse",    "qty": 2, "price": 850},
        {"product": "Keyboard", "qty": 1, "price": 2200},
    ],
    "status": "Processing"
}

# Navigating nested data
customer_name  = order["customer"]["name"]
customer_email = order["customer"]["contact"]["email"]
first_item     = order["items"][0]["product"]
total          = sum(item["qty"] * item["price"] for item in order["items"])

print(f"Customer: {customer_name}")
print(f"Email   : {customer_email}")
print(f"Total   : Rs.{total:,}")

# Safe navigation with .get()
phone = (order
         .get("customer", {})
         .get("contact", {})
         .get("phone", "Not provided"))
```

---

## 13. Choosing the Right Collection

This decision affects the readability, correctness, and performance of
your code. Here is the complete decision guide:

```
Do you need to look up values by a key (name, ID, etc.)?
  YES --> Dictionary

Do you need uniqueness? (no duplicates, fast membership test)
  YES --> Set (or frozenset if it must be immutable)

Do you need an ordered sequence?
  YES --> Continue below
  NO  --> Set or Dictionary

Will the sequence change (add/remove/modify)?
  YES --> List
  NO  --> Tuple

Is it fixed data that represents a record (like a coordinate or RGB value)?
  YES --> Tuple

Is it a collection that will grow or shrink over time?
  YES --> List
```

```python
# Choosing well
student_id   = 101                          # int (not a collection)
student_name = "Aarav Sharma"               # str (a sequence)
coordinates  = (28.6139, 77.2090)           # tuple (fixed, immutable record)
tags         = {"python", "data", "ml"}     # set (unique, no order needed)
history      = ["Python", "SQL", "Pandas"]  # list (ordered, can change)
profile      = {"name": "Aarav", "age": 21} # dict (key-value lookup)
```

### Performance comparison

```python
import time

n = 1_000_000
data_list = list(range(n))
data_set  = set(range(n))
data_dict = {i: i for i in range(n)}

# Membership check: list vs set vs dict
target = 999_999

# List: O(n) -- must check every element
start = time.perf_counter()
target in data_list
print(f"List  : {time.perf_counter() - start:.6f}s")   # ~0.01s

# Set: O(1) -- hash lookup
start = time.perf_counter()
target in data_set
print(f"Set   : {time.perf_counter() - start:.6f}s")   # ~0.000001s

# Dict: O(1) -- hash lookup
start = time.perf_counter()
target in data_dict
print(f"Dict  : {time.perf_counter() - start:.6f}s")   # ~0.000001s
```

**For large membership checks, always use a set or dict, never a list.**

---

## 14. The collections Module

Python's `collections` module provides specialised container types that
extend the built-in ones.

### Counter

Counts occurrences of elements. Returns a dictionary-like object.

```python
from collections import Counter

# Count IPL match results
results = ["CSK", "MI", "CSK", "RCB", "MI", "CSK", "KKR", "MI", "MI", "CSK"]
wins    = Counter(results)

print(wins)
# Counter({'CSK': 4, 'MI': 4, 'KKR': 1, 'RCB': 1})

print(wins.most_common(2))    # [('CSK', 4), ('MI', 4)]
print(wins["CSK"])            # 4
print(wins["DC"])             # 0  (no KeyError for missing keys)

# Count characters in a string
letter_freq = Counter("Bangalore")
print(letter_freq.most_common(3))   # [('a', 2), ('l', 2), ('B', 1)]
```

### defaultdict

A dictionary that automatically creates a default value for missing keys.

```python
from collections import defaultdict

# Default value is an empty list
by_dept = defaultdict(list)

employees = [("Aarav", "Engineering"), ("Priya", "HR"),
             ("Rohan", "Engineering"), ("Karan", "HR")]

for name, dept in employees:
    by_dept[dept].append(name)   # no need to check if key exists

print(dict(by_dept))
# {'Engineering': ['Aarav', 'Rohan'], 'HR': ['Priya', 'Karan']}

# Default value is 0 (useful for counting)
word_count = defaultdict(int)
for word in "the cat sat on the mat".split():
    word_count[word] += 1   # no KeyError on first increment
```

### namedtuple

A tuple where each position has a name. Readable, immutable, memory-efficient.

```python
from collections import namedtuple

# Create a type
Student = namedtuple("Student", ["name", "roll", "cgpa", "dept"])

# Create instances
s1 = Student("Aarav Sharma", 101, 8.9, "CS")
s2 = Student(name="Priya Patel", roll=102, cgpa=9.2, dept="IT")

# Access by name (readable) or index (still works)
print(s1.name)     # Aarav Sharma
print(s1.cgpa)     # 8.9
print(s1[0])       # Aarav Sharma (tuple indexing still works)

# Unpack like a tuple
name, roll, cgpa, dept = s1

# Cannot modify (immutable)
# s1.cgpa = 9.0   # AttributeError

# Convert to dict
print(s1._asdict())   # {'name': 'Aarav Sharma', 'roll': 101, ...}
```

### deque

A double-ended queue. Fast O(1) appends and pops from BOTH ends.
Lists have O(n) for `insert(0)` and `pop(0)`.

```python
from collections import deque

# Use as a queue (FIFO)
queue = deque()
queue.append("task1")      # add to right
queue.append("task2")
queue.append("task3")

print(queue.popleft())     # "task1" -- remove from left (FIFO order)

# Use as a stack (LIFO)
stack = deque()
stack.append("page1")
stack.append("page2")
print(stack.pop())         # "page2" -- remove from right (LIFO order)

# appendleft and extendleft
queue.appendleft("urgent_task")    # add to front -- O(1)

# Bounded deque -- automatically discards oldest when full
recent = deque(maxlen=3)
for i in range(6):
    recent.append(i)
print(recent)   # deque([3, 4, 5], maxlen=3)
```

### OrderedDict

Dictionaries in Python 3.7+ maintain insertion order, so `OrderedDict`
is rarely needed. But it has one unique method:

```python
from collections import OrderedDict

od = OrderedDict([("a", 1), ("b", 2), ("c", 3)])

# move_to_end -- not available on regular dict
od.move_to_end("a")          # move "a" to the end
od.move_to_end("c", last=False)  # move "c" to the front
```

---

## 15. Summary and Key Takeaways

### The four collections at a glance

```
LIST       Ordered, mutable, duplicates allowed
           Use for: sequences that change over time
           Literal: [1, 2, 3]

TUPLE      Ordered, immutable, duplicates allowed
           Use for: fixed records, multiple return values, dict keys
           Literal: (1, 2, 3) or 1, 2, 3

DICTIONARY Key-value pairs, ordered (3.7+), mutable, unique keys
           Use for: lookup by key, grouping, counting, config
           Literal: {"key": "value"}

SET        Unordered, mutable, no duplicates
           Use for: uniqueness, fast membership, set math
           Literal: {1, 2, 3}  -- but set() for empty set!
```

### The most important operations to know

```python
# List
lst.append(x)           # add to end
lst.insert(i, x)        # insert at position
lst.remove(x)           # remove first occurrence
lst.pop(i)              # remove and return at index
sorted(lst, key=...)    # return sorted copy
[expr for x in lst if cond]   # comprehension

# Tuple
t[i]                    # index access
a, b, c = t             # unpack
t.count(x)              # count occurrences

# Dictionary
d.get(k, default)       # safe access
d.setdefault(k, v)      # add only if missing
d.update(other)         # merge
for k, v in d.items()   # iterate key-value pairs
{k: expr for k, v in d.items()}  # comprehension

# Set
s.add(x)                # add element
s.discard(x)            # safe remove
s | other               # union
s & other               # intersection
s - other               # difference
s ^ other               # symmetric difference
x in s                  # O(1) membership test
```

### Common mistakes to avoid

```python
# 1. Empty set vs empty dict
empty_set  = set()    # correct
empty_set  = {}       # WRONG -- this is an empty dict

# 2. Modifying a list while iterating over it
for item in my_list:
    my_list.remove(item)   # unpredictable behaviour

# Correct: iterate over a copy
for item in my_list[:]:
    my_list.remove(item)
# Or: build a new list
my_list = [item for item in my_list if keep_condition(item)]

# 3. Forgetting that sort() modifies in place and returns None
sorted_list = my_list.sort()   # sorted_list is None!
my_list.sort()                  # sort in place
sorted_list = sorted(my_list)   # create a new sorted list

# 4. Shallow copy vs deep copy with nested structures
original = {"scores": [88, 92]}
shallow  = original.copy()
shallow["scores"].append(100)
print(original["scores"])   # [88, 92, 100] -- original was affected!

import copy
deep = copy.deepcopy(original)
deep["scores"].append(999)
print(original["scores"])   # [88, 92, 100] -- original unaffected

# 5. Using list for membership checks on large data
# O(n) lookup -- slow for large lists
if name in large_name_list:   # slow if large_name_list has 100,000 items

# Convert to set first -- O(1) lookup
name_set = set(large_name_list)
if name in name_set:          # fast
```

---

*Made with care for Codeverra learners | codeverra.com*