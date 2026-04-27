---
title: "Python Loops Masterclass"
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# 🔁 Python Loops Masterclass
### *Complete Command Over for and while Loops — From Basics to Patterns*

---

> **Who is this for?**
> You know Python basics — variables, conditionals, functions.
> Now you want to truly master loops — not just use them, but *think* in them.
> This guide covers every loop concept in Python, with simple examples before every idea.

---

## 📌 Table of Contents

1. [Why Loops Exist](#1-why-loops-exist)
2. [The for Loop](#2-the-for-loop)
3. [Iterating Over Different Data Types](#3-iterating-over-different-data-types)
4. [The range() Function](#4-the-range-function)
5. [The while Loop](#5-the-while-loop)
6. [break — Exit the Loop Early](#6-break--exit-the-loop-early)
7. [continue — Skip to the Next Iteration](#7-continue--skip-to-the-next-iteration)
8. [pass — Do Nothing (Placeholder)](#8-pass--do-nothing-placeholder)
9. [else with Loops](#9-else-with-loops)
10. [enumerate() — Loop with an Index](#10-enumerate--loop-with-an-index)
11. [zip() — Loop Over Multiple Sequences](#11-zip--loop-over-multiple-sequences)
12. [Nested Loops](#12-nested-loops)
13. [List Comprehensions](#13-list-comprehensions)
14. [Dictionary and Set Comprehensions](#14-dictionary-and-set-comprehensions)
15. [Loop Patterns Every Programmer Uses](#15-loop-patterns-every-programmer-uses)
16. [Common Loop Mistakes and How to Avoid Them](#16-common-loop-mistakes-and-how-to-avoid-them)
17. [Practice Questions](#17-practice-questions)
18. [What We Covered + What's Next](#18-what-we-covered--whats-next)

---

## 1. Why Loops Exist

Imagine you need to print a welcome message for 500 students. Without loops:

```python
print("Welcome, Aarav!")
print("Welcome, Priya!")
print("Welcome, Rohan!")
# ... 497 more lines
```

With a loop:

```python
students = ["Aarav", "Priya", "Rohan", "Sneha", "Karan"]

for student in students:
    print(f"Welcome, {student}!")
```

```
Welcome, Aarav!
Welcome, Priya!
Welcome, Rohan!
Welcome, Sneha!
Welcome, Karan!
```

That's the entire point of a loop — **repeat an action for every item in a sequence, or until a condition changes**.

Python has two types of loops:

- **`for` loop** — when you know what you're iterating over (a list, string, range, etc.)
- **`while` loop** — when you repeat as long as a condition is `True`

---

## 2. The for Loop

### Basic Syntax

```python
for variable in sequence:
    # code to run for each item
```

The `variable` takes the value of each item in the sequence, one at a time. The loop runs once per item.

```python
# Runs 5 times — variable 'city' changes each iteration
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"]

for city in cities:
    print(city)
```

```
Delhi
Mumbai
Bangalore
Chennai
Kolkata
```

### The loop body is indented

Everything indented under `for` is part of the loop. The first unindented line is after the loop.

```python
prices = [100, 250, 80, 430]

for price in prices:
    discounted = price * 0.9          # inside loop
    print(f"₹{price} → ₹{discounted}")  # inside loop

print("Done!")                        # outside loop — runs once
```

```
₹100 → ₹90.0
₹250 → ₹225.0
₹80 → ₹72.0
₹430 → ₹387.0
Done!
```

---

## 3. Iterating Over Different Data Types

A `for` loop works on anything **iterable** — any object you can step through item by item.

### 3.1 Iterating Over a List

```python
ipl_teams = ["CSK", "MI", "RCB", "KKR", "DC", "SRH"]

for team in ipl_teams:
    print(f"Team: {team}")
```

### 3.2 Iterating Over a String

A string is a sequence of characters — you can loop over each character.

```python
name = "INDIA"

for char in name:
    print(char)
```

```
I
N
D
I
A
```

```python
# Count vowels in a word
word = "Hyderabad"
vowels = 0

for char in word.lower():
    if char in "aeiou":
        vowels += 1

print(f"Vowels in '{word}': {vowels}")   # Vowels in 'Hyderabad': 4
```

### 3.3 Iterating Over a Tuple

Tuples work exactly like lists in a loop.

```python
coordinates = (28.6, 77.2)    # Delhi's lat/long
lat, lon = coordinates        # unpacking (not a loop)

# Loop over a list of coordinate tuples
cities = [("Delhi", 28.6, 77.2), ("Mumbai", 19.0, 72.8), ("Bangalore", 12.9, 77.5)]

for city, lat, lon in cities:
    print(f"{city} is at {lat}°N, {lon}°E")
```

```
Delhi is at 28.6°N, 77.2°E
Mumbai is at 19.0°N, 72.8°E
Bangalore is at 12.9°N, 77.5°E
```

> This is called **tuple unpacking in a loop** — Python automatically unpacks each tuple into the variables you name.

### 3.4 Iterating Over a Dictionary

Looping over a dictionary gives you **keys** by default.

```python
player_scores = {
    "Rohit":   45,
    "Kohli":   82,
    "Dhoni":   37,
    "Hardik":  55,
}

# Loop over keys (default)
for player in player_scores:
    print(player)
# Rohit, Kohli, Dhoni, Hardik

# Loop over values
for score in player_scores.values():
    print(score)
# 45, 82, 37, 55

# Loop over key-value pairs — most common
for player, score in player_scores.items():
    print(f"{player} scored {score} runs")
```

```
Rohit scored 45 runs
Kohli scored 82 runs
Dhoni scored 37 runs
Hardik scored 55 runs
```

```python
# Real use case: update all values
updated_scores = {}
for player, score in player_scores.items():
    updated_scores[player] = score + 10   # bonus 10 runs

print(updated_scores)
# {'Rohit': 55, 'Kohli': 92, 'Dhoni': 47, 'Hardik': 65}
```

### 3.5 Iterating Over a Set

Sets are unordered — the loop works, but order is not guaranteed.

```python
unique_cities = {"Delhi", "Mumbai", "Bangalore", "Delhi", "Mumbai"}

for city in unique_cities:
    print(city)
# Output order varies — sets don't preserve insertion order
```

### 3.6 Iterating Over a Range

`range()` produces a sequence of numbers — covered in detail in the next section.

```python
for i in range(5):
    print(i)   # 0, 1, 2, 3, 4
```

---

## 4. The range() Function

`range()` is how you loop a specific number of times or generate a sequence of numbers.

### Three Forms of range()

```python
range(stop)            # 0 to stop-1
range(start, stop)     # start to stop-1
range(start, stop, step)  # start to stop-1, jumping by step
```

```python
# Count from 0 to 4
for i in range(5):
    print(i)   # 0 1 2 3 4

# Count from 1 to 5
for i in range(1, 6):
    print(i)   # 1 2 3 4 5

# Count even numbers from 2 to 10
for i in range(2, 11, 2):
    print(i)   # 2 4 6 8 10

# Count backwards from 10 to 1
for i in range(10, 0, -1):
    print(i)   # 10 9 8 7 6 5 4 3 2 1
```

### range() in Practice

```python
# Print multiplication table for 7
for i in range(1, 11):
    print(f"7 × {i} = {7 * i}")
```

```
7 × 1  = 7
7 × 2  = 14
...
7 × 10 = 70
```

```python
# Use range with len() to access list items by index
students = ["Aarav", "Priya", "Rohan", "Sneha"]

for i in range(len(students)):
    print(f"Roll #{i+1}: {students[i]}")
```

```
Roll #1: Aarav
Roll #2: Priya
Roll #3: Rohan
Roll #4: Sneha
```

> **Tip:** `for item in list` is cleaner when you just need values. Use `range(len(list))` only when you need the index AND need to modify the list in-place.

---

## 5. The while Loop

A `while` loop keeps running **as long as its condition is `True`**. Use it when you don't know in advance how many iterations you need.

### Basic Syntax

```python
while condition:
    # code to run while condition is True
```

```python
# Countdown from 5
count = 5

while count > 0:
    print(f"T-minus {count}...")
    count -= 1     # IMPORTANT: update the variable, or loop runs forever

print("Liftoff! 🚀")
```

```
T-minus 5...
T-minus 4...
T-minus 3...
T-minus 2...
T-minus 1...
Liftoff! 🚀
```

### while for User Input

The classic use case for `while` — keep asking until valid input is given.

```python
# Ask until the user enters a positive number
number = -1

while number <= 0:
    number = int(input("Enter a positive number: "))
    if number <= 0:
        print("That's not positive. Try again.")

print(f"Great! You entered {number}.")
```

### while for Searching

```python
# Find first score above 80
scores = [45, 62, 58, 84, 91, 70]
i = 0

while i < len(scores):
    if scores[i] > 80:
        print(f"First score above 80: {scores[i]} at index {i}")
        break
    i += 1
```

### Infinite Loop with break

Sometimes the cleanest structure is `while True` with an explicit `break`.

```python
# ATM-style menu
while True:
    print("\n--- MENU ---")
    print("1. Check Balance")
    print("2. Withdraw")
    print("3. Exit")
    choice = input("Enter choice: ")

    if choice == "1":
        print("Balance: ₹10,000")
    elif choice == "2":
        print("Withdrawing...")
    elif choice == "3":
        print("Thank you. Goodbye!")
        break
    else:
        print("Invalid choice. Try again.")
```

---

## 6. break — Exit the Loop Early

`break` immediately **exits** the loop, skipping all remaining iterations — even if there are more items to go through.

```python
# Stop as soon as you find a failing score
scores = [88, 76, 92, 45, 81, 67]

for score in scores:
    if score < 50:
        print(f"Found a failing score: {score}. Stopping.")
        break
    print(f"Score {score} — OK")
```

```
Score 88 — OK
Score 76 — OK
Score 92 — OK
Found a failing score: 45. Stopping.
```

```python
# Search for a name in a list
names = ["Aarav", "Priya", "Rohan", "Sneha", "Karan"]
target = "Rohan"

for i, name in enumerate(names):
    if name == target:
        print(f"Found '{target}' at position {i}")
        break
else:
    print(f"'{target}' not found")   # else runs only if break was never hit
```

### break in while loop

```python
attempts = 0
password = "india@123"

while True:
    attempt = input("Enter password: ")
    attempts += 1

    if attempt == password:
        print("Access granted!")
        break

    if attempts >= 3:
        print("Too many failed attempts. Locked.")
        break

    print(f"Wrong password. {3 - attempts} attempt(s) left.")
```

---

## 7. continue — Skip to the Next Iteration

`continue` **skips the rest of the current iteration** and jumps straight to the next one. The loop does not exit — it just moves on.

```python
# Print only even numbers — skip odd ones
for i in range(1, 11):
    if i % 2 != 0:
        continue       # skip this iteration
    print(i)
```

```
2
4
6
8
10
```

```python
# Skip students who haven't submitted
students = ["Aarav", "Priya", None, "Sneha", None, "Karan"]

for student in students:
    if student is None:
        continue     # skip missing entries
    print(f"Processing submission for {student}")
```

```
Processing submission for Aarav
Processing submission for Priya
Processing submission for Sneha
Processing submission for Karan
```

```python
# Skip negative numbers when computing sum
numbers = [10, -3, 25, -7, 8, -1, 14]
total = 0

for n in numbers:
    if n < 0:
        continue
    total += n

print(f"Sum of positives: {total}")   # 57
```

### break vs continue — side by side

```
break    → EXIT the loop entirely
continue → SKIP this iteration, keep looping
```

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8]

# break at 5 → prints 1 2 3 4
for n in numbers:
    if n == 5:
        break
    print(n)

# continue at 5 → prints 1 2 3 4 6 7 8
for n in numbers:
    if n == 5:
        continue
    print(n)
```

---

## 8. pass — Do Nothing (Placeholder)

`pass` is a **no-op** — it literally does nothing. It's used when Python's syntax requires a code block, but you have nothing to write yet.

```python
# Placeholder while building logic
for i in range(5):
    pass   # TODO: add logic later

# You can also use it in conditionals
for score in [88, 45, 92, 38, 76]:
    if score >= 60:
        pass       # handle passing students later
    else:
        print(f"Failed: {score}")
```

```python
# Common use: stub out a loop you'll fill in later
cities = ["Delhi", "Mumbai", "Bangalore"]

for city in cities:
    pass   # will add city-specific processing here
```

> `pass` is not for skipping items (that's `continue`). It's for writing syntactically valid code when the body is intentionally empty.

---

## 9. else with Loops

Python has a unique feature: a `for` or `while` loop can have an `else` block. The `else` runs **only if the loop completed normally** — i.e., was never stopped by a `break`.

```python
# Search for a city — else confirms "not found"
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai"]
target = "Kolkata"

for city in cities:
    if city == target:
        print(f"Found: {target}")
        break
else:
    print(f"{target} not found in the list")   # runs because break was never hit
```

```
Kolkata not found in the list
```

```python
# Check if a number is prime
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            print(f"{n} is not prime (divisible by {i})")
            break
    else:
        print(f"{n} is prime!")   # only reaches here if no divisor was found

is_prime(7)    # 7 is prime!
is_prime(12)   # 12 is not prime (divisible by 2)
```

### else with while

```python
attempts = 3
password = "india@123"

while attempts > 0:
    guess = input("Password: ")
    if guess == password:
        print("Correct!")
        break
    attempts -= 1
else:
    # runs only if while condition became False (ran out of attempts without break)
    print("Account locked after too many attempts.")
```

---

## 10. enumerate() — Loop with an Index

When you need both the **position** and the **value** while looping, use `enumerate()`. It's cleaner than managing a counter variable yourself.

```python
players = ["Rohit", "Kohli", "Pant", "Jadeja", "Bumrah"]

# Without enumerate — messy
i = 0
for player in players:
    print(f"{i}: {player}")
    i += 1

# With enumerate — clean
for i, player in enumerate(players):
    print(f"{i}: {player}")
```

```
0: Rohit
1: Kohli
2: Pant
3: Jadeja
4: Bumrah
```

### Custom start index

```python
# Start counting from 1 (like a rank or roll number)
for rank, player in enumerate(players, start=1):
    print(f"Rank #{rank}: {player}")
```

```
Rank #1: Rohit
Rank #2: Kohli
Rank #3: Pant
Rank #4: Jadeja
Rank #5: Bumrah
```

### Real use case — find index of a value

```python
marks = [78, 92, 65, 88, 45, 91]

for i, mark in enumerate(marks):
    if mark < 50:
        print(f"Student at index {i} failed with {mark} marks")
```

```
Student at index 4 failed with 45 marks
```

### Real use case — add numbered labels to a list

```python
menu_items = ["Masala Dosa", "Idli Sambar", "Vada", "Filter Coffee"]

for num, item in enumerate(menu_items, start=1):
    print(f"  {num}. {item}")
```

```
  1. Masala Dosa
  2. Idli Sambar
  3. Vada
  4. Filter Coffee
```

---

## 11. zip() — Loop Over Multiple Sequences

`zip()` lets you loop over **two or more sequences at the same time**, pairing up their items by position.

```python
students = ["Aarav", "Priya", "Rohan", "Sneha"]
marks    = [85, 92, 78, 95]

for student, mark in zip(students, marks):
    print(f"{student}: {mark}")
```

```
Aarav: 85
Priya: 92
Rohan: 78
Sneha: 95
```

### zip() with three sequences

```python
names    = ["Aarav", "Priya", "Rohan"]
maths    = [85, 92, 78]
science  = [90, 88, 82]

for name, m, s in zip(names, maths, science):
    total = m + s
    print(f"{name} — Maths: {m}, Science: {s}, Total: {total}")
```

```
Aarav — Maths: 85, Science: 90, Total: 175
Priya — Maths: 92, Science: 88, Total: 180
Rohan — Maths: 78, Science: 82, Total: 160
```

### zip() stops at the shortest sequence

```python
a = [1, 2, 3, 4, 5]
b = ["a", "b", "c"]

for x, y in zip(a, b):
    print(x, y)
# 1 a
# 2 b
# 3 c  ← stops here because b is exhausted
```

### zip() to create a dictionary

```python
keys   = ["name", "city", "score"]
values = ["Kohli", "Delhi", 82]

result = dict(zip(keys, values))
print(result)   # {'name': 'Kohli', 'city': 'Delhi', 'score': 82}
```

### enumerate() + zip() together

```python
students = ["Aarav", "Priya", "Rohan"]
marks    = [85, 92, 78]

for i, (student, mark) in enumerate(zip(students, marks), start=1):
    print(f"{i}. {student}: {mark}")
```

```
1. Aarav: 85
2. Priya: 92
3. Rohan: 78
```

---

## 12. Nested Loops

A nested loop is a loop **inside** another loop. The inner loop completes all its iterations for each single iteration of the outer loop.

```python
# Multiplication table for 1 to 3
for i in range(1, 4):         # outer loop: 3 times
    for j in range(1, 4):     # inner loop: 3 times per outer
        print(f"{i} × {j} = {i*j}")
    print("---")
```

```
1 × 1 = 1
1 × 2 = 2
1 × 3 = 3
---
2 × 1 = 2
2 × 2 = 4
2 × 3 = 6
---
3 × 1 = 3
3 × 2 = 6
3 × 3 = 9
---
```

### Nested loop on a 2D list (matrix)

```python
# Marks of 3 students in 3 subjects
marks_matrix = [
    [78, 85, 90],   # Aarav
    [92, 76, 88],   # Priya
    [65, 70, 80],   # Rohan
]
student_names = ["Aarav", "Priya", "Rohan"]
subjects      = ["Maths", "Science", "English"]

for i, row in enumerate(marks_matrix):
    print(f"\n{student_names[i]}'s marks:")
    for j, mark in enumerate(row):
        print(f"  {subjects[j]}: {mark}")
```

### Pattern Printing with Nested Loops

Pattern printing is a classic way to build intuition for nested loops.

```python
# Right triangle of stars
for i in range(1, 6):
    for j in range(i):
        print("*", end=" ")
    print()
```

```
*
* *
* * *
* * * *
* * * * *
```

```python
# Number triangle
for i in range(1, 6):
    for j in range(1, i + 1):
        print(j, end=" ")
    print()
```

```
1
1 2
1 2 3
1 2 3 4
1 2 3 4 5
```

### break inside nested loops

`break` only exits the **innermost** loop it's in.

```python
# Stop searching as soon as target is found
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
target = 5
found = False

for row in matrix:
    for val in row:
        if val == target:
            print(f"Found {target}!")
            found = True
            break          # exits inner loop only
    if found:
        break              # now exit outer loop too
```

---

## 13. List Comprehensions

List comprehension is a compact, readable way to build a new list using a loop — all in one line.

### Basic Syntax

```python
new_list = [expression for item in iterable]

# With a condition (filter)
new_list = [expression for item in iterable if condition]
```

### Side-by-side comparison

```python
# Traditional loop
squares = []
for i in range(1, 6):
    squares.append(i ** 2)

# List comprehension — same result, one line
squares = [i ** 2 for i in range(1, 6)]
print(squares)   # [1, 4, 9, 16, 25]
```

### With a condition

```python
# Only even numbers
evens = [i for i in range(1, 11) if i % 2 == 0]
print(evens)   # [2, 4, 6, 8, 10]

# Students who passed
marks = [78, 45, 92, 38, 65, 88]
passed = [m for m in marks if m >= 60]
print(passed)   # [78, 92, 65, 88]
```

### With transformation

```python
# Apply 10% GST to all prices
prices = [100, 250, 480, 1200, 3000]
after_gst = [round(p * 1.1, 2) for p in prices]
print(after_gst)   # [110.0, 275.0, 528.0, 1320.0, 3300.0]

# Convert all city names to uppercase
cities = ["delhi", "mumbai", "bangalore", "chennai"]
upper_cities = [city.upper() for city in cities]
```

### With if-else (transformation based on condition)

```python
marks = [78, 45, 92, 38, 65, 88]

# Assign pass/fail label for each mark
result = ["Pass" if m >= 60 else "Fail" for m in marks]
print(result)   # ['Pass', 'Fail', 'Pass', 'Fail', 'Pass', 'Pass']
```

### Nested list comprehension

```python
# Flatten a 2D list into 1D
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [val for row in matrix for val in row]
print(flat)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

> **When to use comprehensions:** For simple, readable transformations and filters. If the logic needs multiple lines or nested conditions, a regular loop is clearer.

---

## 14. Dictionary and Set Comprehensions

The same idea as list comprehensions, but for dictionaries and sets.

### Dictionary Comprehension

```python
# Basic: {key: value for item in iterable}
students = ["Aarav", "Priya", "Rohan", "Sneha"]
marks    = [85, 92, 78, 95]

# Create a dict mapping name → marks
grade_dict = {student: mark for student, mark in zip(students, marks)}
print(grade_dict)
# {'Aarav': 85, 'Priya': 92, 'Rohan': 78, 'Sneha': 95}
```

```python
# Square of numbers from 1 to 5
squares = {n: n**2 for n in range(1, 6)}
print(squares)
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# With a condition — only passing students
passed = {name: m for name, m in zip(students, marks) if m >= 80}
print(passed)
# {'Aarav': 85, 'Priya': 92, 'Sneha': 95}
```

```python
# Invert a dictionary (swap keys and values)
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
print(inverted)   # {1: 'a', 2: 'b', 3: 'c'}
```

### Set Comprehension

```python
# Like list comprehension, but uses {} and guarantees uniqueness
cities = ["Delhi", "Mumbai", "Delhi", "Bangalore", "Mumbai", "Chennai"]

unique_cities = {city for city in cities}
print(unique_cities)   # {'Delhi', 'Mumbai', 'Bangalore', 'Chennai'}

# Only long city names
long_names = {city for city in cities if len(city) > 5}
print(long_names)   # {'Mumbai', 'Bangalore', 'Chennai'}
```

---

## 15. Loop Patterns Every Programmer Uses

These are the building blocks you'll see in real code over and over again.

### Pattern 1 — Accumulator

Build up a result by adding to it each iteration.

```python
# Sum all odd numbers from 1 to 20
total = 0
for i in range(1, 21):
    if i % 2 != 0:
        total += i
print(total)   # 100

# Concatenate strings
words = ["Jai", "Hind", "Zindabad"]
sentence = ""
for word in words:
    sentence += word + " "
print(sentence.strip())   # Jai Hind Zindabad
```

### Pattern 2 — Find Maximum / Minimum Manually

```python
scores = [88, 45, 92, 73, 65, 100, 58]

maximum = scores[0]
for score in scores:
    if score > maximum:
        maximum = score

print(f"Highest score: {maximum}")   # 100
```

### Pattern 3 — Counting

```python
feedback = ["good", "bad", "good", "excellent", "bad", "good"]

count_good = 0
for f in feedback:
    if f == "good":
        count_good += 1

print(f"Good ratings: {count_good}")   # 3
```

### Pattern 4 — Building a New List

```python
orders = [("Laptop", 65000), ("Mouse", 850), ("Monitor", 18000), ("Keyboard", 2200)]

expensive = []
for product, price in orders:
    if price > 5000:
        expensive.append(product)

print(expensive)   # ['Laptop', 'Monitor']
```

### Pattern 5 — Group by Category (Dictionary of Lists)

```python
employees = [
    ("Aarav",  "Engineering"),
    ("Priya",  "HR"),
    ("Rohan",  "Engineering"),
    ("Sneha",  "Marketing"),
    ("Karan",  "HR"),
    ("Meera",  "Engineering"),
]

departments = {}
for name, dept in employees:
    if dept not in departments:
        departments[dept] = []
    departments[dept].append(name)

print(departments)
# {
#   'Engineering': ['Aarav', 'Rohan', 'Meera'],
#   'HR': ['Priya', 'Karan'],
#   'Marketing': ['Sneha']
# }
```

### Pattern 6 — Running Total / Cumulative

```python
# Cumulative sales by month
monthly = [12, 18, 15, 22, 19, 25]
cumulative = []
running_total = 0

for sales in monthly:
    running_total += sales
    cumulative.append(running_total)

print(cumulative)   # [12, 30, 45, 67, 86, 111]
```

### Pattern 7 — Filtering and Transforming Together

```python
transactions = [
    {"city": "Mumbai",    "amount": 15000, "status": "success"},
    {"city": "Delhi",     "amount": 8200,  "status": "failed"},
    {"city": "Bangalore", "amount": 22000, "status": "success"},
    {"city": "Chennai",   "amount": 4500,  "status": "success"},
    {"city": "Pune",      "amount": 1200,  "status": "failed"},
]

# Total of all successful transactions above ₹5000
total = 0
for t in transactions:
    if t["status"] == "success" and t["amount"] > 5000:
        total += t["amount"]

print(f"Total successful high-value transactions: ₹{total}")   # ₹37,000
```

### Pattern 8 — Sliding Window

```python
# Moving average over 3 months
monthly_sales = [10, 14, 12, 18, 22, 19, 25, 28]

for i in range(len(monthly_sales) - 2):
    window = monthly_sales[i:i+3]
    avg = sum(window) / 3
    print(f"Months {i+1}-{i+3}: avg = {avg:.1f}")
```

```
Months 1-3: avg = 12.0
Months 2-4: avg = 14.7
Months 3-5: avg = 17.3
Months 4-6: avg = 19.7
Months 5-7: avg = 22.0
Months 6-8: avg = 24.0
```

---

## 16. Common Loop Mistakes and How to Avoid Them

### Mistake 1 — Forgetting to update the while variable (infinite loop)

```python
# WRONG — runs forever
i = 0
while i < 5:
    print(i)
    # forgot: i += 1

# CORRECT
i = 0
while i < 5:
    print(i)
    i += 1
```

### Mistake 2 — Modifying a list while iterating over it

```python
# WRONG — unpredictable behavior
numbers = [1, 2, 3, 4, 5]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)   # modifying while iterating

# CORRECT — iterate over a copy
for n in numbers[:]:        # numbers[:] is a copy
    if n % 2 == 0:
        numbers.remove(n)

# OR — better: build a new list
numbers = [n for n in numbers if n % 2 != 0]
```

### Mistake 3 — Using range(len()) when you don't need the index

```python
# UNNECESSARY
names = ["Aarav", "Priya", "Rohan"]
for i in range(len(names)):
    print(names[i])

# CLEANER
for name in names:
    print(name)
```

### Mistake 4 — Off-by-one errors with range()

```python
# Prints 0 to 9, NOT 1 to 10
for i in range(10):
    print(i)

# Prints 1 to 10
for i in range(1, 11):
    print(i)
```

### Mistake 5 — Assuming dict order in older Python

```python
# In Python 3.7+, dicts maintain insertion order — this is fine
# In older versions (pre-3.7), iteration order was not guaranteed
# Always use Python 3.7+ for predictable dict iteration
```

### Mistake 6 — Misplacing the accumulator reset

```python
# WRONG — reset inside the loop, total is always 0 at end of each run
for month in range(1, 4):
    total = 0           # ← reset INSIDE loop
    for sale in [100, 200, 300]:
        total += sale
    print(total)

# CORRECT — reset outside
total = 0               # ← reset OUTSIDE loop
for sale in [100, 200, 300]:
    total += sale
print(total)   # 600
```

---

## 17. Practice Questions

Sharpen your skills. Questions go from easy to hard — don't jump ahead.

---

### 🟢 Easy

**Q1 — Basic for Loop**
Print all numbers from 1 to 20 that are divisible by 3.

---

**Q2 — String Loop**
Write a loop that counts the number of uppercase letters in the string below.
```python
text = "Welcome To India, The Land Of DiversiTy"
```
Expected output: `Uppercase letters: 6`

---

**Q3 — List Loop with Condition**
Given the list below, print only the names that have more than 4 characters.
```python
names = ["Ali", "Priya", "Raj", "Sneha", "Om", "Vikram", "Ria"]
```

---

**Q4 — while Loop**
Write a `while` loop that keeps dividing a number by 2 until it goes below 1. Print the value at each step.
```python
number = 64
```
Expected output: `64 → 32.0 → 16.0 → 8.0 → 4.0 → 2.0 → 1.0`

---

**Q5 — Dictionary Loop**
Given the dictionary below, print each item's name and its price after a 15% discount.
```python
menu = {
    "Masala Chai":   20,
    "Vada Pav":      15,
    "Samosa":        10,
    "Filter Coffee": 25,
    "Idli":          30,
}
```

---

### 🟡 Medium

**Q6 — enumerate() + Logic**
Given a list of cricket scores, use `enumerate()` to print each score with its ball number (starting from 1). Then print the ball number on which the highest score was hit.
```python
ball_scores = [1, 0, 4, 6, 1, 2, 6, 0, 4, 3]
```

---

**Q7 — zip() and Comparison**
You have two lists: last year's sales and this year's sales for 6 cities. Use `zip()` to print, for each city, whether sales went up, went down, or stayed the same.
```python
cities    = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune"]
last_year = [120, 145, 98, 110, 85, 76]
this_year = [135, 140, 115, 110, 92, 88]
```

---

**Q8 — break and continue Together**
Given the list of transactions below, skip any transaction with `status = "pending"`, and stop processing entirely if you encounter a `status = "fraud"`. Print all valid processed transactions.
```python
transactions = [
    {"id": 1, "amount": 5000,  "status": "success"},
    {"id": 2, "amount": 1200,  "status": "pending"},
    {"id": 3, "amount": 8800,  "status": "success"},
    {"id": 4, "amount": 3200,  "status": "fraud"},
    {"id": 5, "amount": 4400,  "status": "success"},
]
```

---

**Q9 — Nested Loop Pattern**
Print the following pattern using nested loops:
```
1
2 2
3 3 3
4 4 4 4
5 5 5 5 5
```

---

**Q10 — List Comprehension**
Using a single list comprehension, create a list of all words from the sentence below that are longer than 3 characters and start with a vowel.
```python
sentence = "An elephant ate orange apples in an orchard outside the city"
```

---

**Q11 — Dictionary Comprehension**
Given the two lists below, create a dictionary where each student's name maps to their grade ("A" if marks ≥ 80, "B" if 60–79, "C" otherwise).
```python
students = ["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"]
marks    = [88, 55, 73, 91, 62, 47]
```

---

### 🔴 Hard

**Q12 — Loop + Data Grouping**
Given the list of orders below, write a loop to build a summary dictionary showing:
- Total revenue per city
- Number of orders per city
Then print each city's summary in a readable format.
```python
orders = [
    {"city": "Mumbai",    "amount": 1500},
    {"city": "Delhi",     "amount": 3200},
    {"city": "Mumbai",    "amount": 800},
    {"city": "Bangalore", "amount": 4500},
    {"city": "Delhi",     "amount": 1100},
    {"city": "Mumbai",    "amount": 2200},
    {"city": "Bangalore", "amount": 3800},
    {"city": "Delhi",     "amount": 900},
]
```
Expected output format:
```
Mumbai    → Orders: 3, Revenue: ₹4500
Delhi     → Orders: 3, Revenue: ₹5200
Bangalore → Orders: 2, Revenue: ₹8300
```

---

**Q13 — while + Validation Logic**
Write a number guessing game. The program picks a secret number between 1 and 50. The user gets 6 attempts. After each wrong guess, tell the user if the answer is higher or lower. If they exhaust all attempts, reveal the number. *(For testing, hardcode the secret number as 33.)*

---

**Q14 — Nested Loop + Star Pattern**
Print a diamond shape of stars for a given size `n`. For `n = 4`:
```
   *
  * *
 * * *
* * * *
* * * *
 * * *
  * *
   *
```

---

**Q15 — Full Pipeline**
You are given a dataset of students. Write a complete program using loops to:
1. Calculate each student's total marks and percentage
2. Assign grade: "Distinction" (≥85%), "First Class" (≥60%), "Pass" (≥40%), "Fail" (<40%)
3. Count how many students got each grade
4. Find the topper (highest percentage)
5. Print the full report

```python
students = [
    {"name": "Aarav",  "maths": 88, "science": 92, "english": 85, "history": 78, "cs": 95},
    {"name": "Priya",  "maths": 55, "science": 48, "english": 62, "history": 50, "cs": 58},
    {"name": "Rohan",  "maths": 72, "science": 68, "english": 75, "history": 70, "cs": 65},
    {"name": "Sneha",  "maths": 95, "science": 98, "english": 92, "history": 88, "cs": 97},
    {"name": "Karan",  "maths": 35, "science": 40, "english": 38, "history": 42, "cs": 30},
    {"name": "Meera",  "maths": 78, "science": 82, "english": 80, "history": 75, "cs": 84},
    {"name": "Arjun",  "maths": 45, "science": 55, "english": 50, "history": 48, "cs": 52},
]
```

Expected output format:
```
===== STUDENT REPORT =====
Aarav   | Total: 438/500 | 87.6% | Distinction
Priya   | Total: 273/500 | 54.6% | Pass
...

===== GRADE SUMMARY =====
Distinction : 2
First Class : 2
Pass        : 2
Fail        : 1

===== TOPPER =====
Sneha with 94.0%
```

---

## 18. What We Covered + What's Next

### ✅ What This Masterclass Covered

| Concept | What It Does |
|---|---|
| `for` loop | Iterate over any sequence — list, string, tuple, dict, set, range |
| Iterating data types | Lists, strings, tuples, dicts (.keys, .values, .items), sets |
| `range()` | Generate number sequences with start, stop, step |
| `while` loop | Repeat while a condition is True |
| `break` | Exit the loop immediately |
| `continue` | Skip current iteration, keep looping |
| `pass` | Syntactic placeholder — do nothing |
| `else` with loops | Runs only if loop completed without a `break` |
| `enumerate()` | Loop with index + value together |
| `zip()` | Loop over multiple sequences in parallel |
| Nested loops | Loops inside loops — for matrices, patterns, combinations |
| List comprehensions | Build lists in one readable line |
| Dict comprehensions | Build dicts in one readable line |
| Set comprehensions | Build unique sets in one line |
| Loop patterns | Accumulator, max/min, grouping, sliding window, filtering |
| Common mistakes | Infinite loops, modifying while iterating, off-by-one |

---

### 🚀 What to Explore Next

**1. Itertools**
The `itertools` module gives you powerful loop tools: `chain`, `product`, `combinations`, `permutations`, `groupby`, `islice`. Essential once you're doing serious iteration work.

**2. Generators**
Instead of building an entire list in memory, generators produce items **one at a time** using `yield`. Much more memory-efficient for large sequences. `range()` itself is a generator.

**3. Map, Filter, Reduce**
Functional programming alternatives to loops. `map(func, list)`, `filter(func, list)`, and `functools.reduce()`. Often replaced by comprehensions in modern Python, but good to know.

**4. Recursion**
Sometimes the cleanest way to repeat something is to have a function call itself. Recursion is loops taken to a different level — essential for trees, graphs, and divide-and-conquer algorithms.

**5. DSA with Loops**
Loops are the backbone of algorithms — sorting (bubble, insertion, selection), searching (linear, binary), and dynamic programming all rely on mastering iteration patterns.

---

> **Final thought:**
> Every experienced Python developer has one thing in common — they've written *a lot* of loops. The patterns in Section 15 will show up in every data pipeline, web app, and algorithm you ever write.
>
> Do the practice questions. Especially Q12 to Q15. The questions that make you think for 10 minutes are the ones that actually build the skill. 💪

---

*Made with ❤️ for Codeverra learners | [codeverra.com](https://codeverra.com)*