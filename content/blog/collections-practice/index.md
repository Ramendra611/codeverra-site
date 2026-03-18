---
title: "Master Collections in Python"
description: "Complete practice session on colletions in python"

date: 2026-03-18
lastmod: 2026-03-18
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python


cover:
  image: "images/collections-practice.png"
  alt: "Python programming"
  caption: "Python syllabus"
  relative: true
  hidden: false
---


# Python Collections - Practice Questions and Solutions
### List, Tuple, Dictionary, Set -- Complete Practice Set

---

> This practice set covers all four major Python collections.
> Questions are grouped by collection type, then by difficulty within each section.
> The final section has mixed questions that combine multiple collections, loops, and conditionals.
> Try each question before reading the solution.

---

## Table of Contents

- [Part 1 -- Lists](#part-1--lists)
- [Part 2 -- Tuples](#part-2--tuples)
- [Part 3 -- Dictionaries](#part-3--dictionaries)
- [Part 4 -- Sets](#part-4--sets)
- [Part 5 -- Mixed Questions](#part-5--mixed-questions)
- [Quick Reference](#quick-reference)

---

## Part 1 -- Lists

A list is an **ordered, mutable** collection. It allows duplicate values and supports indexing, slicing, appending, and sorting.

---

### L1 -- Basic Indexing and Slicing

Given the list below, write code to:
- Print the first element
- Print the last element
- Print elements from index 2 to 5 (inclusive)
- Print every alternate element

```python
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"]
```

**Expected Output:**
```
First : Delhi
Last  : Ahmedabad
Slice : ['Bangalore', 'Chennai', 'Hyderabad', 'Pune']
Every alternate : ['Delhi', 'Bangalore', 'Hyderabad', 'Kolkata']
```

**Solution:**

```python
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"]

print("First :", cities[0])
print("Last  :", cities[-1])
print("Slice :", cities[2:6])
print("Every alternate :", cities[::2])
```

---

### L2 -- List Methods

Start with the list below and apply the following operations in order. Print the list after each step.
- Append "Jaipur"
- Insert "Surat" at index 2
- Remove "Chennai"
- Sort the list alphabetically
- Reverse it

```python
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"]
```

**Solution:**

```python
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"]

cities.append("Jaipur")
print("After append :", cities)

cities.insert(2, "Surat")
print("After insert :", cities)

cities.remove("Chennai")
print("After remove :", cities)

cities.sort()
print("After sort   :", cities)

cities.reverse()
print("After reverse:", cities)
```

---

### L3 -- List Comprehension with Transformation

Given the list of product prices below, use a list comprehension to:
- Create a new list with 18% GST added to each price
- Create another list with only prices above Rs.500 (after GST)

```python
prices = [120, 450, 800, 250, 1200, 60, 3500, 175]
```

**Solution:**

```python
prices = [120, 450, 800, 250, 1200, 60, 3500, 175]

with_gst = [round(p * 1.18, 2) for p in prices]
print("With GST:", with_gst)

expensive = [p for p in with_gst if p > 500]
print("Above 500:", expensive)
```

---

### L4 -- Nested List (2D)

You have a marks matrix for 4 students across 3 subjects. Write code to:
- Print the marks of the second student (index 1)
- Print the third subject marks for all students
- Find the student with the highest total

```python
marks = [
    [78, 85, 90],   # Aarav
    [92, 76, 88],   # Priya
    [65, 70, 80],   # Rohan
    [88, 91, 95],   # Sneha
]
names = ["Aarav", "Priya", "Rohan", "Sneha"]
```

**Solution:**

```python
marks = [
    [78, 85, 90],
    [92, 76, 88],
    [65, 70, 80],
    [88, 91, 95],
]
names = ["Aarav", "Priya", "Rohan", "Sneha"]

print("Second student's marks:", marks[1])

print("Third subject marks:", [row[2] for row in marks])

totals = [sum(row) for row in marks]
max_total = max(totals)
topper    = names[totals.index(max_total)]
print(f"Topper: {topper} with {max_total} marks")
```

---

### L5 -- List Operations Without Built-ins

Write a function `second_largest(lst)` that returns the second largest unique number from a list. Do not use `sorted()` or `max()`.

```python
numbers = [45, 92, 78, 92, 55, 88, 78, 100, 63]
```

**Expected Output:**
```
Second largest: 92
```

**Solution:**

```python
def second_largest(lst):
    unique = []
    for n in lst:
        if n not in unique:
            unique.append(n)

    # Find max manually
    first = unique[0]
    for n in unique:
        if n > first:
            first = n

    # Find second max (largest value that is not the max)
    second = None
    for n in unique:
        if n == first:
            continue
        if second is None or n > second:
            second = n

    return second

numbers = [45, 92, 78, 92, 55, 88, 78, 100, 63]
print("Second largest:", second_largest(numbers))
```

---

### L6 -- Rotate a List

Write a function `rotate_left(lst, k)` that rotates a list to the left by k positions without using any slicing tricks -- use a loop.

```python
items = [10, 20, 30, 40, 50]
rotate_left(items, 2)  # Expected: [30, 40, 50, 10, 20]
```

**Solution:**

```python
def rotate_left(lst, k):
    k = k % len(lst)   # handle k larger than list length
    result = []
    for i in range(k, len(lst)):
        result.append(lst[i])
    for i in range(k):
        result.append(lst[i])
    return result

items = [10, 20, 30, 40, 50]
print(rotate_left(items, 2))   # [30, 40, 50, 10, 20]
print(rotate_left(items, 7))   # same as rotating by 2
```

---

### L7 -- Chunk a List

Write a function `chunk(lst, size)` that splits a list into smaller lists of a given size. The last chunk may be smaller.

```python
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
chunk(data, 3)
# Expected: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

**Solution:**

```python
def chunk(lst, size):
    result = []
    for i in range(0, len(lst), size):
        result.append(lst[i:i+size])
    return result

data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(chunk(data, 3))
print(chunk(data, 4))
```

---

## Part 2 -- Tuples

A tuple is an **ordered, immutable** collection. Once created, its values cannot be changed. Tuples are used for fixed data, function return values, and dictionary keys.

---

### T1 -- Tuple Basics and Unpacking

```python
employee = ("Vikram Nair", "Engineering", 85000, "Bangalore")
```

- Unpack this tuple into four variables
- Print each variable on a separate line
- Try to change the salary (third element) -- explain what happens

**Solution:**

```python
employee = ("Vikram Nair", "Engineering", 85000, "Bangalore")

name, department, salary, city = employee

print("Name       :", name)
print("Department :", department)
print("Salary     :", salary)
print("City       :", city)

# Attempting to modify raises a TypeError
# employee[2] = 90000   -->  TypeError: 'tuple' object does not support item assignment

# The right way to "update" a tuple is to create a new one
updated_employee = employee[:2] + (90000,) + employee[3:]
print("Updated:", updated_employee)
```

---

### T2 -- Tuple of Tuples (Loop and Unpack)

You have a list of tuples representing train journeys. Print a formatted summary for each journey.

```python
journeys = [
    ("Rajdhani Express", "Delhi",     "Mumbai",    16),
    ("Shatabdi",         "Chennai",   "Bangalore",  5),
    ("Duronto",          "Kolkata",   "Delhi",      17),
    ("Vande Bharat",     "Hyderabad", "Pune",        8),
]
```

**Expected Output:**
```
Rajdhani Express : Delhi -> Mumbai (16 hrs)
Shatabdi         : Chennai -> Bangalore (5 hrs)
Duronto          : Kolkata -> Delhi (17 hrs)
Vande Bharat     : Hyderabad -> Pune (8 hrs)
```

**Solution:**

```python
journeys = [
    ("Rajdhani Express", "Delhi",     "Mumbai",    16),
    ("Shatabdi",         "Chennai",   "Bangalore",  5),
    ("Duronto",          "Kolkata",   "Delhi",      17),
    ("Vande Bharat",     "Hyderabad", "Pune",        8),
]

for train, origin, destination, hours in journeys:
    print(f"{train:<18}: {origin} -> {destination} ({hours} hrs)")
```

---

### T3 -- Tuple as Dictionary Key

Tuples can be dictionary keys because they are immutable. Create a dictionary that maps (city, year) tuples to population (in lakhs).

Then write a loop to print cities whose population grew between 2020 and 2023.

```python
population = {
    ("Delhi",     2020): 300,
    ("Delhi",     2023): 320,
    ("Mumbai",    2020): 205,
    ("Mumbai",    2023): 210,
    ("Bangalore", 2020): 120,
    ("Bangalore", 2023): 140,
    ("Chennai",   2020): 92,
    ("Chennai",   2023): 90,
}
```

**Solution:**

```python
population = {
    ("Delhi",     2020): 300,
    ("Delhi",     2023): 320,
    ("Mumbai",    2020): 205,
    ("Mumbai",    2023): 210,
    ("Bangalore", 2020): 120,
    ("Bangalore", 2023): 140,
    ("Chennai",   2020): 92,
    ("Chennai",   2023): 90,
}

cities = {city for city, year in population.keys()}

for city in sorted(cities):
    pop_2020 = population[(city, 2020)]
    pop_2023 = population[(city, 2023)]
    if pop_2023 > pop_2020:
        growth = pop_2023 - pop_2020
        print(f"{city}: grew by {growth} lakhs")
```

---

### T4 -- Named Tuple (collections.namedtuple)

Use `namedtuple` to create a `Student` type. Create 3 student instances and print a report.

**Solution:**

```python
from collections import namedtuple

Student = namedtuple("Student", ["name", "roll_no", "marks", "city"])

s1 = Student("Aarav",  101, 88, "Delhi")
s2 = Student("Priya",  102, 92, "Mumbai")
s3 = Student("Rohan",  103, 75, "Bangalore")

students = [s1, s2, s3]

for s in students:
    grade = "A" if s.marks >= 85 else "B" if s.marks >= 70 else "C"
    print(f"Roll {s.roll_no} | {s.name:<8} | {s.marks} | {grade} | {s.city}")
```

**Why namedtuple?** You get tuple immutability but can access fields by name (`s.marks`) instead of index (`s[2]`). Much more readable.

---

### T5 -- Swap Without a Temp Variable

Python allows elegant swapping using tuple unpacking. Demonstrate this and write a function that takes a list of tuples and swaps each pair.

```python
pairs = [(1, 2), (10, 20), ("Delhi", "Mumbai"), (True, False)]
```

**Expected Output:**
```
(2, 1)
(20, 10)
('Mumbai', 'Delhi')
(False, True)
```

**Solution:**

```python
# Classic swap using tuple unpacking
a = 10
b = 20
a, b = b, a
print(a, b)   # 20 10

# Swap all pairs in a list
pairs = [(1, 2), (10, 20), ("Delhi", "Mumbai"), (True, False)]

swapped = [(b, a) for a, b in pairs]
print(swapped)
```

---

## Part 3 -- Dictionaries

A dictionary is an **ordered (Python 3.7+), mutable** collection of key-value pairs. Keys must be unique and immutable. Dictionaries are optimised for fast lookup by key.

---

### D1 -- Dictionary Basics

Given the dictionary below:
- Access Kohli's runs
- Add a new player "Hardik" with 320 runs
- Update Rohit's runs to 580
- Delete Dhoni's entry
- Check if "Bumrah" is in the dictionary

```python
ipl_runs = {
    "Rohit":  520,
    "Kohli":  639,
    "Dhoni":  210,
    "Jadeja": 180,
}
```

**Solution:**

```python
ipl_runs = {
    "Rohit":  520,
    "Kohli":  639,
    "Dhoni":  210,
    "Jadeja": 180,
}

print(ipl_runs["Kohli"])         # 639

ipl_runs["Hardik"] = 320
print(ipl_runs)

ipl_runs["Rohit"] = 580
print(ipl_runs["Rohit"])

del ipl_runs["Dhoni"]
print(ipl_runs)

print("Bumrah" in ipl_runs)      # False
print("Kohli"  in ipl_runs)      # True
```

---

### D2 -- Safe Access with get() and setdefault()

The `.get()` method avoids KeyError when accessing a key that might not exist.

Given the inventory below, write code that:
- Prints the stock for "Laptop" and "Printer" using `.get()` with a default of 0
- Uses `setdefault()` to add "Printer" with a stock of 5 if it does not exist

```python
inventory = {
    "Laptop":  15,
    "Phone":   42,
    "Tablet":  8,
    "Monitor": 20,
}
```

**Solution:**

```python
inventory = {
    "Laptop":  15,
    "Phone":   42,
    "Tablet":  8,
    "Monitor": 20,
}

print(inventory.get("Laptop",  0))    # 15
print(inventory.get("Printer", 0))    # 0  -- no error

inventory.setdefault("Printer", 5)    # adds only if key is missing
print(inventory["Printer"])           # 5

inventory.setdefault("Laptop", 100)   # does NOT overwrite existing key
print(inventory["Laptop"])            # still 15
```

---

### D3 -- Merging Dictionaries

You have sales data from two regions. Merge them into one dictionary. For cities that appear in both, sum the values.

```python
north = {"Delhi": 450, "Chandigarh": 120, "Lucknow": 200}
south = {"Chennai": 380, "Bangalore": 520, "Delhi": 150}
```

**Expected Output:**
```
{'Delhi': 600, 'Chandigarh': 120, 'Lucknow': 200, 'Chennai': 380, 'Bangalore': 520}
```

**Solution:**

```python
north = {"Delhi": 450, "Chandigarh": 120, "Lucknow": 200}
south = {"Chennai": 380, "Bangalore": 520, "Delhi": 150}

merged = dict(north)   # start with a copy of north

for city, sales in south.items():
    if city in merged:
        merged[city] += sales     # sum if city already exists
    else:
        merged[city] = sales      # add new city

print(merged)
```

---

### D4 -- Inverting a Dictionary

Write a function that inverts a dictionary -- keys become values and values become keys. Handle cases where multiple keys share the same value by grouping them into a list.

```python
departments = {
    "Aarav":  "Engineering",
    "Priya":  "HR",
    "Rohan":  "Engineering",
    "Sneha":  "Marketing",
    "Karan":  "HR",
    "Meera":  "Engineering",
}
```

**Expected Output:**
```
{'Engineering': ['Aarav', 'Rohan', 'Meera'], 'HR': ['Priya', 'Karan'], 'Marketing': ['Sneha']}
```

**Solution:**

```python
departments = {
    "Aarav":  "Engineering",
    "Priya":  "HR",
    "Rohan":  "Engineering",
    "Sneha":  "Marketing",
    "Karan":  "HR",
    "Meera":  "Engineering",
}

inverted = {}
for name, dept in departments.items():
    if dept not in inverted:
        inverted[dept] = []
    inverted[dept].append(name)

print(inverted)
```

---

### D5 -- Nested Dictionary

You have a nested dictionary representing student report cards. Write code to:
- Print Priya's science marks
- Find the overall class topper (highest average across all subjects)
- Count how many students scored above 80 in maths

```python
report_cards = {
    "Aarav": {"maths": 88, "science": 92, "english": 85},
    "Priya": {"maths": 75, "science": 68, "english": 79},
    "Rohan": {"maths": 55, "science": 60, "english": 72},
    "Sneha": {"maths": 95, "science": 98, "english": 91},
}
```

**Solution:**

```python
report_cards = {
    "Aarav": {"maths": 88, "science": 92, "english": 85},
    "Priya": {"maths": 75, "science": 68, "english": 79},
    "Rohan": {"maths": 55, "science": 60, "english": 72},
    "Sneha": {"maths": 95, "science": 98, "english": 91},
}

# Priya's science marks
print("Priya's science:", report_cards["Priya"]["science"])

# Class topper by average
topper     = ""
top_avg    = 0
for name, subjects in report_cards.items():
    avg = sum(subjects.values()) / len(subjects)
    if avg > top_avg:
        top_avg = avg
        topper  = name
print(f"Topper: {topper} with avg {top_avg:.1f}")

# Count students above 80 in maths
above_80 = sum(1 for data in report_cards.values() if data["maths"] > 80)
print(f"Students above 80 in maths: {above_80}")
```

---

### D6 -- Word Frequency with Dictionary

Write a function that takes a sentence and returns a dictionary with each word and how many times it appears. Ignore case. Then print the top 3 most frequent words.

```python
text = "to be or not to be that is the question to be is to live"
```

**Expected Output:**
```
Top 3 words:
to  : 4
be  : 3
is  : 2
```

**Solution:**

```python
def word_frequency(text):
    freq = {}
    for word in text.lower().split():
        freq[word] = freq.get(word, 0) + 1
    return freq

text = "to be or not to be that is the question to be is to live"
freq = word_frequency(text)

sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)

print("Top 3 words:")
for word, count in sorted_freq[:3]:
    print(f"{word:<4}: {count}")
```

---

## Part 4 -- Sets

A set is an **unordered, mutable** collection of **unique** elements. It has no duplicates and no index. Sets shine when you need fast membership checks or mathematical set operations.

---

### S1 -- Set Basics and Deduplication

Given a list with many duplicate values, use a set to find all unique values. Then convert back to a sorted list.

```python
orders = ["Delhi", "Mumbai", "Delhi", "Bangalore", "Pune",
          "Mumbai", "Delhi", "Chennai", "Pune", "Bangalore"]
```

**Expected Output:**
```
Unique cities (5): ['Bangalore', 'Chennai', 'Delhi', 'Mumbai', 'Pune']
```

**Solution:**

```python
orders = ["Delhi", "Mumbai", "Delhi", "Bangalore", "Pune",
          "Mumbai", "Delhi", "Chennai", "Pune", "Bangalore"]

unique = sorted(set(orders))
print(f"Unique cities ({len(unique)}): {unique}")
```

---

### S2 -- Set Operations (Union, Intersection, Difference)

Two cricket teams have been announced. Use set operations to find:
- All players across both teams (union)
- Players selected in both teams (intersection)
- Players in Team A but not Team B (difference)
- Players in exactly one team but not both (symmetric difference)

```python
team_a = {"Rohit", "Virat", "Shubman", "Pant", "Jadeja", "Bumrah", "Siraj"}
team_b = {"Rohit", "Shubman", "Dhoni",  "Jadeja", "Ashwin", "Bumrah", "Kuldeep"}
```

**Solution:**

```python
team_a = {"Rohit", "Virat", "Shubman", "Pant", "Jadeja", "Bumrah", "Siraj"}
team_b = {"Rohit", "Shubman", "Dhoni",  "Jadeja", "Ashwin", "Bumrah", "Kuldeep"}

print("All players (union)       :", sorted(team_a | team_b))
print("In both teams (intersect) :", sorted(team_a & team_b))
print("Only in Team A (diff)     :", sorted(team_a - team_b))
print("Only in Team B (diff)     :", sorted(team_b - team_a))
print("Exactly one team (sym diff):", sorted(team_a ^ team_b))
```

---

### S3 -- Set Methods: add, remove, discard

```python
registered = {"Aarav", "Priya", "Rohan", "Sneha"}
```

- Add "Karan" to the set
- Remove "Rohan" using `remove()` -- show what happens if the name is not there
- Remove "Meera" using `discard()` -- show that no error is raised
- Check if "Priya" is in the set

**Solution:**

```python
registered = {"Aarav", "Priya", "Rohan", "Sneha"}

registered.add("Karan")
print("After add:", registered)

registered.remove("Rohan")
print("After remove:", registered)

# registered.remove("Meera")   # raises KeyError -- "Meera" is not in set

registered.discard("Meera")    # no error even if "Meera" does not exist
print("After discard:", registered)

print("Priya in set:", "Priya" in registered)
```

---

### S4 -- Subset and Superset

You have a set of required skills for a job and a set of skills each candidate has. Check whether each candidate qualifies.

```python
required  = {"Python", "SQL", "Pandas"}

candidate_a = {"Python", "SQL", "Pandas", "Excel", "Tableau"}
candidate_b = {"Python", "SQL"}
candidate_c = {"Python", "SQL", "Pandas"}
candidate_d = {"Java",   "SQL", "Spring"}
```

**Expected Output:**
```
Candidate A: Qualified  (has all required skills + more)
Candidate B: Not qualified (missing: {'Pandas'})
Candidate C: Qualified
Candidate D: Not qualified (missing: {'Python', 'Pandas'})
```

**Solution:**

```python
required    = {"Python", "SQL", "Pandas"}
candidates  = {
    "Candidate A": {"Python", "SQL", "Pandas", "Excel", "Tableau"},
    "Candidate B": {"Python", "SQL"},
    "Candidate C": {"Python", "SQL", "Pandas"},
    "Candidate D": {"Java",   "SQL", "Spring"},
}

for name, skills in candidates.items():
    missing = required - skills
    if not missing:
        print(f"{name}: Qualified")
    else:
        print(f"{name}: Not qualified (missing: {missing})")
```

---

### S5 -- Frozen Set

A `frozenset` is an immutable set -- useful as a dictionary key or when you want a set that cannot change.

Demonstrate the difference between `set` and `frozenset` and use a frozenset as a dictionary key.

**Solution:**

```python
# Regular set is mutable
tags = set(["python", "data", "beginner"])
tags.add("loops")
print("Set:", tags)

# Frozenset is immutable
frozen = frozenset(["python", "data", "beginner"])
# frozen.add("loops")   --> AttributeError: 'frozenset' object has no attribute 'add'

# frozenset can be used as a dictionary key (regular set cannot)
course_levels = {
    frozenset(["python", "beginner"]):     "Python 101",
    frozenset(["python", "intermediate"]): "Python OOP",
    frozenset(["sql",    "beginner"]):     "SQL Basics",
}

search = frozenset(["python", "beginner"])
print(course_levels[search])    # Python 101
```

---

## Part 5 -- Mixed Questions

These questions combine multiple collections with loops, conditionals, and comprehensions.

---

### M1 -- Frequency Counter (List + Dictionary + Loop)

Given a list of exam scores, write a program that:
- Counts how many students fall in each grade band
- Prints the result sorted from highest grade band to lowest

```python
scores = [88, 45, 72, 95, 60, 55, 83, 91, 38, 74, 66, 49, 87, 100, 52]
```

**Expected Output:**
```
Distinction (>=85) : 4
First Class (>=60) : 5
Pass        (>=40) : 4
Fail        (<40)  : 1
Fail        (<40)  : 1
```

**Solution:**

```python
scores = [88, 45, 72, 95, 60, 55, 83, 91, 38, 74, 66, 49, 87, 100, 52]

bands = {"Distinction": 0, "First Class": 0, "Pass": 0, "Fail": 0}

for s in scores:
    if s >= 85:
        bands["Distinction"] += 1
    elif s >= 60:
        bands["First Class"] += 1
    elif s >= 40:
        bands["Pass"] += 1
    else:
        bands["Fail"] += 1

for band, count in bands.items():
    print(f"{band:<12}: {count}")
```

---

### M2 -- Anagram Checker (String + Set + Dictionary)

Write a function `are_anagrams(s1, s2)` that returns True if two strings are anagrams of each other (same letters, different order). Ignore spaces and case.

```python
are_anagrams("listen",  "silent")      # True
are_anagrams("Triangle", "Integral")   # True
are_anagrams("hello",    "world")      # False
are_anagrams("Astronomer", "Moon starer")  # True (ignore spaces)
```

**Solution:**

```python
def are_anagrams(s1, s2):
    # Remove spaces and convert to lowercase
    clean1 = s1.replace(" ", "").lower()
    clean2 = s2.replace(" ", "").lower()

    # Build frequency dictionaries
    freq1 = {}
    for char in clean1:
        freq1[char] = freq1.get(char, 0) + 1

    freq2 = {}
    for char in clean2:
        freq2[char] = freq2.get(char, 0) + 1

    return freq1 == freq2

print(are_anagrams("listen",      "silent"))       # True
print(are_anagrams("Triangle",    "Integral"))     # True
print(are_anagrams("hello",       "world"))        # False
print(are_anagrams("Astronomer",  "Moon starer"))  # True
```

---

### M3 -- Group Transactions (List of Dicts + Nested Dict + Loop)

Given a list of bank transactions, group them by category and compute:
- Total spent per category
- Number of transactions per category
- Average transaction per category

```python
transactions = [
    {"desc": "Zomato order",     "amount": 450,  "category": "Food"},
    {"desc": "Metro recharge",   "amount": 200,  "category": "Travel"},
    {"desc": "Amazon purchase",  "amount": 1800, "category": "Shopping"},
    {"desc": "Swiggy order",     "amount": 380,  "category": "Food"},
    {"desc": "Uber ride",        "amount": 320,  "category": "Travel"},
    {"desc": "Grocery store",    "amount": 950,  "category": "Food"},
    {"desc": "Flipkart order",   "amount": 2200, "category": "Shopping"},
    {"desc": "OLA ride",         "amount": 180,  "category": "Travel"},
    {"desc": "Restaurant",       "amount": 1100, "category": "Food"},
]
```

**Expected Output:**
```
Category   | Transactions | Total Spent | Avg per Transaction
Food       |      4       |    Rs.2880  |    Rs.720.0
Travel     |      3       |    Rs.700   |    Rs.233.33
Shopping   |      2       |    Rs.4000  |    Rs.2000.0
```

**Solution:**

```python
transactions = [
    {"desc": "Zomato order",     "amount": 450,  "category": "Food"},
    {"desc": "Metro recharge",   "amount": 200,  "category": "Travel"},
    {"desc": "Amazon purchase",  "amount": 1800, "category": "Shopping"},
    {"desc": "Swiggy order",     "amount": 380,  "category": "Food"},
    {"desc": "Uber ride",        "amount": 320,  "category": "Travel"},
    {"desc": "Grocery store",    "amount": 950,  "category": "Food"},
    {"desc": "Flipkart order",   "amount": 2200, "category": "Shopping"},
    {"desc": "OLA ride",         "amount": 180,  "category": "Travel"},
    {"desc": "Restaurant",       "amount": 1100, "category": "Food"},
]

summary = {}

for t in transactions:
    cat = t["category"]
    if cat not in summary:
        summary[cat] = {"count": 0, "total": 0}
    summary[cat]["count"] += 1
    summary[cat]["total"] += t["amount"]

print(f"{'Category':<10} | {'Txns':>5} | {'Total':>12} | {'Avg':>10}")
print("-" * 50)

for cat, data in summary.items():
    avg = round(data["total"] / data["count"], 2)
    print(f"{cat:<10} | {data['count']:>5} | Rs.{data['total']:>9} | Rs.{avg:>9}")
```

---

### M4 -- Find Common Elements Across Multiple Lists (Set + Loop)

Given results from three different quiz rounds, find:
- Students who passed all three rounds
- Students who passed exactly two rounds
- Students who passed only one round

```python
round1 = ["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"]
round2 = ["Priya", "Sneha", "Karan", "Arjun", "Divya"]
round3 = ["Aarav", "Priya", "Sneha", "Arjun", "Vikram"]
```

**Solution:**

```python
round1 = set(["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"])
round2 = set(["Priya", "Sneha", "Karan", "Arjun", "Divya"])
round3 = set(["Aarav", "Priya", "Sneha", "Arjun", "Vikram"])

all_three  = round1 & round2 & round3
exactly_two = (
    (round1 & round2) |
    (round2 & round3) |
    (round1 & round3)
) - all_three

all_students = round1 | round2 | round3
only_one     = all_students - (round1 & round2) - (round2 & round3) - (round1 & round3)

print("Passed all three :", sorted(all_three))
print("Passed exactly two:", sorted(exactly_two))
print("Passed only one  :", sorted(only_one))
```

---

### M5 -- Top N with Tuples and Sorting (List + Tuple + Sort)

Given a list of product sales tuples, write a function `top_n(sales, n)` that returns the top n products by revenue. Each tuple is `(product_name, units_sold, price_per_unit)`.

```python
sales = [
    ("Laptop",    120, 65000),
    ("Phone",     450, 18000),
    ("Tablet",    210, 32000),
    ("Headphones",780, 2500),
    ("Monitor",   95,  22000),
    ("Keyboard",  640, 1200),
    ("Mouse",     900, 800),
]
```

**Expected Output for top_n(sales, 3):**
```
Rank 1: Phone      -- Revenue: Rs.81,00,000 (450 units)
Rank 2: Laptop     -- Revenue: Rs.78,00,000 (120 units)
Rank 3: Tablet     -- Revenue: Rs.67,20,000 (210 units)
```

**Solution:**

```python
sales = [
    ("Laptop",    120, 65000),
    ("Phone",     450, 18000),
    ("Tablet",    210, 32000),
    ("Headphones",780, 2500),
    ("Monitor",   95,  22000),
    ("Keyboard",  640, 1200),
    ("Mouse",     900, 800),
]

def top_n(sales, n):
    # Create list of (name, revenue, units) tuples
    with_revenue = []
    for name, units, price in sales:
        revenue = units * price
        with_revenue.append((name, revenue, units))

    # Sort by revenue descending
    with_revenue.sort(key=lambda x: x[1], reverse=True)

    for rank, (name, revenue, units) in enumerate(with_revenue[:n], start=1):
        print(f"Rank {rank}: {name:<12} -- Revenue: Rs.{revenue:,} ({units} units)")

top_n(sales, 3)
```

---

### M6 -- Matrix Transpose Using Lists (Nested List + Comprehension)

Write a function `transpose(matrix)` that returns the transpose of a 2D list (rows become columns and columns become rows). Do it in two ways: with a loop and with a list comprehension.

```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
# Expected transpose:
# [[1, 4, 7],
#  [2, 5, 8],
#  [3, 6, 9]]
```

**Solution:**

```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

# Method 1: loop
def transpose_loop(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    result = [[0] * rows for _ in range(cols)]
    for i in range(rows):
        for j in range(cols):
            result[j][i] = matrix[i][j]
    return result

# Method 2: list comprehension
def transpose_comprehension(matrix):
    return [[row[i] for row in matrix] for i in range(len(matrix[0]))]

print(transpose_loop(matrix))
print(transpose_comprehension(matrix))
```

---

### M7 -- Inventory Manager (Dict + List + Conditional + Loop)

You manage a small shop. Write a program that:
- Starts with an inventory dictionary
- Processes a list of sales
- Reduces stock after each sale
- Prints a "LOW STOCK" warning if quantity falls below 5
- Prints "OUT OF STOCK" and skips the sale if quantity is 0

```python
inventory = {
    "Pen":      50,
    "Notebook": 20,
    "Eraser":   8,
    "Ruler":    3,
    "Compass":  0,
}

sales = [
    ("Pen",      12),
    ("Notebook",  5),
    ("Compass",   1),
    ("Eraser",    5),
    ("Ruler",     2),
    ("Pen",      40),
    ("Notebook", 18),
]
```

**Solution:**

```python
inventory = {
    "Pen":      50,
    "Notebook": 20,
    "Eraser":   8,
    "Ruler":    3,
    "Compass":  0,
}

sales = [
    ("Pen",      12),
    ("Notebook",  5),
    ("Compass",   1),
    ("Eraser",    5),
    ("Ruler",     2),
    ("Pen",      40),
    ("Notebook", 18),
]

for item, qty in sales:
    if inventory.get(item, 0) == 0:
        print(f"OUT OF STOCK : {item} -- sale of {qty} skipped")
        continue

    if qty > inventory[item]:
        print(f"INSUFFICIENT : Only {inventory[item]} {item}(s) left, cannot sell {qty}")
        continue

    inventory[item] -= qty
    remaining = inventory[item]

    if remaining < 5:
        print(f"Sold {qty} {item}(s). Remaining: {remaining}  [LOW STOCK]")
    else:
        print(f"Sold {qty} {item}(s). Remaining: {remaining}")

print("\nFinal Inventory:")
for item, qty in inventory.items():
    print(f"  {item:<10}: {qty}")
```

---

### M8 -- Caesar Cipher (String + List + Dictionary + Loop)

Write a function `caesar_encrypt(text, shift)` and `caesar_decrypt(text, shift)` that encrypts and decrypts text using the Caesar cipher. Only shift letters, leave spaces and punctuation unchanged.

```python
message = "Attack at Dawn"
shift   = 3

encrypted = caesar_encrypt(message, shift)
decrypted = caesar_decrypt(encrypted, shift)
# encrypted: "Dwwdfn dw Gdzq"
# decrypted: "Attack at Dawn"
```

**Solution:**

```python
def caesar_encrypt(text, shift):
    result = []
    for char in text:
        if char.isalpha():
            base  = ord("A") if char.isupper() else ord("a")
            shifted = chr((ord(char) - base + shift) % 26 + base)
            result.append(shifted)
        else:
            result.append(char)
    return "".join(result)

def caesar_decrypt(text, shift):
    return caesar_encrypt(text, -shift)

message   = "Attack at Dawn"
shift     = 3
encrypted = caesar_encrypt(message, shift)
decrypted = caesar_decrypt(encrypted, shift)

print(f"Original : {message}")
print(f"Encrypted: {encrypted}")
print(f"Decrypted: {decrypted}")
```

---

### M9 -- Student Ranking System (Full Pipeline)

Given a list of student records, write a complete program that:
1. Calculates total and percentage for each student
2. Assigns grade: "Distinction" (>=85%), "First Class" (>=60%), "Pass" (>=40%), "Fail" (<40%)
3. Ranks students from topper to lowest
4. Identifies students who improved from their previous percentage (given separately)
5. Prints a complete ranked report

```python
students = [
    {"name": "Aarav",  "maths": 88, "science": 92, "english": 85, "history": 78, "cs": 95},
    {"name": "Priya",  "maths": 55, "science": 48, "english": 62, "history": 50, "cs": 58},
    {"name": "Rohan",  "maths": 72, "science": 68, "english": 75, "history": 70, "cs": 65},
    {"name": "Sneha",  "maths": 95, "science": 98, "english": 92, "history": 88, "cs": 97},
    {"name": "Karan",  "maths": 35, "science": 40, "english": 38, "history": 42, "cs": 30},
    {"name": "Meera",  "maths": 78, "science": 82, "english": 80, "history": 75, "cs": 84},
]

previous_pct = {
    "Aarav": 80.0,
    "Priya": 60.0,
    "Rohan": 65.0,
    "Sneha": 91.0,
    "Karan": 42.0,
    "Meera": 75.0,
}
```

**Solution:**

```python
students = [
    {"name": "Aarav",  "maths": 88, "science": 92, "english": 85, "history": 78, "cs": 95},
    {"name": "Priya",  "maths": 55, "science": 48, "english": 62, "history": 50, "cs": 58},
    {"name": "Rohan",  "maths": 72, "science": 68, "english": 75, "history": 70, "cs": 65},
    {"name": "Sneha",  "maths": 95, "science": 98, "english": 92, "history": 88, "cs": 97},
    {"name": "Karan",  "maths": 35, "science": 40, "english": 38, "history": 42, "cs": 30},
    {"name": "Meera",  "maths": 78, "science": 82, "english": 80, "history": 75, "cs": 84},
]

previous_pct = {
    "Aarav": 80.0, "Priya": 60.0, "Rohan": 65.0,
    "Sneha": 91.0, "Karan": 42.0, "Meera": 75.0,
}

subjects   = ["maths", "science", "english", "history", "cs"]
max_marks  = 500
processed  = []

for s in students:
    total = sum(s[sub] for sub in subjects)
    pct   = round((total / max_marks) * 100, 1)

    if pct >= 85:
        grade = "Distinction"
    elif pct >= 60:
        grade = "First Class"
    elif pct >= 40:
        grade = "Pass"
    else:
        grade = "Fail"

    improved = pct > previous_pct.get(s["name"], 0)
    processed.append((s["name"], total, pct, grade, improved))

# Sort by percentage descending
processed.sort(key=lambda x: x[2], reverse=True)

print("=" * 65)
print(f"{'Rank':<5} {'Name':<8} {'Total':>6} {'Pct':>7} {'Grade':<13} {'Trend'}")
print("=" * 65)

for rank, (name, total, pct, grade, improved) in enumerate(processed, start=1):
    trend = "Up" if improved else "Down"
    print(f"{rank:<5} {name:<8} {total:>6}/500 {pct:>6}% {grade:<13} {trend}")

print("=" * 65)
```

---

## Quick Reference

### List
```python
lst = [1, 2, 3]
lst.append(4)           # add to end
lst.insert(1, 99)       # insert at index
lst.remove(2)           # remove first occurrence
lst.pop()               # remove and return last
lst.pop(0)              # remove and return at index
lst.sort()              # sort in place
lst.reverse()           # reverse in place
lst.index(99)           # find index of value
lst.count(3)            # count occurrences
lst.copy()              # shallow copy
lst[1:3]                # slicing
lst[::-1]               # reversed copy
[x*2 for x in lst]      # list comprehension
```

### Tuple
```python
t = (1, 2, 3)
t[0]                    # access (no modify)
a, b, c = t             # unpack
t.count(1)              # count occurrences
t.index(2)              # find index
t1 + t2                 # concatenate (new tuple)
```

### Dictionary
```python
d = {"a": 1}
d["a"]                  # access
d["b"] = 2              # add / update
del d["a"]              # delete
d.get("x", 0)           # safe access with default
d.setdefault("y", 5)    # add only if missing
d.keys()                # all keys
d.values()              # all values
d.items()               # all key-value pairs
d.pop("a")              # remove and return
{k: v for k, v in d.items()}  # dict comprehension
```

### Set
```python
s = {1, 2, 3}
s.add(4)                # add element
s.remove(2)             # remove (error if missing)
s.discard(9)            # remove (no error)
s.pop()                 # remove arbitrary element
s1 | s2                 # union
s1 & s2                 # intersection
s1 - s2                 # difference
s1 ^ s2                 # symmetric difference
s1.issubset(s2)         # check subset
s1.issuperset(s2)       # check superset
frozenset(s)            # immutable version
```

### When to Use Which

| Collection | Use when |
|---|---|
| List | Order matters, duplicates allowed, items change |
| Tuple | Fixed data, function return values, dict keys |
| Dictionary | Fast lookup by key, key-value relationships |
| Set | Uniqueness, fast membership check, set math |

---

*Made with care for Codeverra learners | codeverra.com*