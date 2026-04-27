---
title: "Control Flow in Python"
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Control Flow in Python
### Making Decisions in Your Code -- if, elif, else, and Beyond

---

## Before We Begin -- Why Control Flow is Everything

Every program you have ever used makes decisions.

When you log into a website: if the password is correct, show the dashboard,
otherwise show an error. When your food delivery app calculates the delivery fee:
if the order is above Rs.200, delivery is free, else charge Rs.30.
When a data pipeline processes records: if the record is valid, process it,
else log an error and skip it.

These decisions -- branching based on conditions -- are called control flow.
Without it, every program would execute the same instructions in the same
order every time, regardless of the data or the situation. That is not a
program. That is a calculator.

Control flow is what makes programs intelligent.

You already know how to write conditions from the Python Basics guide:
comparison operators, logical operators, truthiness. This guide is about
using those conditions to direct your program's execution.

---

## Table of Contents

1. [The if Statement](#1-the-if-statement)
2. [if-else -- Two Paths](#2-if-else----two-paths)
3. [if-elif-else -- Multiple Conditions](#3-if-elif-else----multiple-conditions)
4. [Nested Conditions](#4-nested-conditions)
5. [The Ternary Operator -- One-Line if-else](#5-the-ternary-operator----one-line-if-else)
6. [Truthiness -- What Python Considers True or False](#6-truthiness----what-python-considers-true-or-false)
7. [Comparison and Logical Operators in Depth](#7-comparison-and-logical-operators-in-depth)
8. [Common Patterns -- Guard Clauses and Early Returns](#8-common-patterns----guard-clauses-and-early-returns)
9. [match-case -- Structural Pattern Matching (Python 3.10+)](#9-match-case----structural-pattern-matching-python-310)
10. [Common Mistakes and How to Avoid Them](#10-common-mistakes-and-how-to-avoid-them)
11. [Practice Questions](#11-practice-questions)
12. [Solutions](#12-solutions)
13. [Summary and Key Takeaways](#13-summary-and-key-takeaways)

---

## 1. The if Statement

The `if` statement is the most fundamental control flow tool. It runs
a block of code only when a condition is True.

```python
# Syntax
if condition:
    # this block runs only when condition is True
    # it can be as many lines as you need
```

```python
# Simple example
temperature = 38.5

if temperature > 37.5:
    print("You have a fever.")
    print("Please rest and drink water.")
```

```
You have a fever.
Please rest and drink water.
```

If the condition is False, the block is skipped entirely:

```python
temperature = 36.8

if temperature > 37.5:
    print("You have a fever.")   # not printed -- condition is False

print("Condition check complete.")   # always runs
```

```
Condition check complete.
```

### Indentation is not optional

The indented block is how Python knows what belongs to the if statement.
Four spaces is the standard. Never use tabs mixed with spaces.

```python
score = 85

if score >= 60:
    print("Passed")          # inside the if block (4 spaces)
    print("Congratulations") # also inside (same indentation)

print("End of check")        # outside the if block (no indentation)
```

---

## 2. if-else -- Two Paths

`else` provides an alternative block that runs when the condition is False.
One of the two blocks always runs. Never both, never neither.

```python
if condition:
    # runs when condition is True
else:
    # runs when condition is False
```

```python
# Student grade check
marks = 45

if marks >= 60:
    print("Passed")
    print(f"Your marks: {marks}/100")
else:
    print("Failed")
    print(f"You need {60 - marks} more marks to pass.")
```

```
Failed
You need 15 more marks to pass.
```

```python
# Zomato delivery fee calculation
order_amount = 180

if order_amount >= 200:
    delivery_fee = 0
else:
    delivery_fee = 30

print(f"Delivery fee: Rs.{delivery_fee}")
# Delivery fee: Rs.30
```

### Every if-else is a choice, not a sequence

A very common beginner mistake is writing two separate if statements
when they mean if-else:

```python
# WRONG -- both conditions can be checked
# even though they are mutually exclusive
marks = 45

if marks >= 60:
    result = "Passed"
if marks < 60:
    result = "Failed"

# RIGHT -- exactly one block runs
if marks >= 60:
    result = "Passed"
else:
    result = "Failed"
```

The second version is more efficient (only evaluates one condition),
clearer to read, and correctly expresses the intent.

---

## 3. if-elif-else -- Multiple Conditions

When you have more than two possible outcomes, `elif` (short for "else if")
lets you chain conditions. Python evaluates them top to bottom and runs
the first block whose condition is True. Once a match is found, all
remaining elif and else blocks are skipped.

```python
if condition1:
    # runs if condition1 is True
elif condition2:
    # runs if condition1 is False AND condition2 is True
elif condition3:
    # runs if condition1 and condition2 are both False AND condition3 is True
else:
    # runs if ALL conditions above are False
```

```python
# Grade classification
marks = 82

if marks >= 90:
    grade = "A+"
elif marks >= 80:
    grade = "A"
elif marks >= 70:
    grade = "B"
elif marks >= 60:
    grade = "C"
elif marks >= 40:
    grade = "D"
else:
    grade = "F"

print(f"Marks: {marks} -- Grade: {grade}")
# Marks: 82 -- Grade: A
```

### Order matters

Python stops at the first True condition. This means:
- Put the most specific conditions first
- Put the broadest conditions last

```python
# WRONG -- will always match the first condition
# because >= 40 is True for 82
marks = 82

if marks >= 40:
    grade = "D"   # this matches first!
elif marks >= 60:
    grade = "C"
elif marks >= 80:
    grade = "A"   # never reached for marks=82

# RIGHT -- most specific (highest threshold) first
if marks >= 80:
    grade = "A"   # matches correctly
elif marks >= 60:
    grade = "C"
elif marks >= 40:
    grade = "D"
```

### Real example -- ticket pricing

```python
# Indian Railways ticket pricing by age
age = 67

if age < 5:
    fare_category = "Free"
    discount      = 100
elif age < 12:
    fare_category = "Child"
    discount      = 50
elif age >= 60:
    fare_category = "Senior Citizen"
    discount      = 40
else:
    fare_category = "Adult"
    discount      = 0

base_fare = 850
final_fare = base_fare * (1 - discount / 100)

print(f"Category : {fare_category}")
print(f"Discount : {discount}%")
print(f"Fare     : Rs.{final_fare:.0f}")
```

```
Category : Senior Citizen
Discount : 40%
Fare     : Rs.510
```

### There can be many elifs but only one else

```python
# Day of week classifier
day_num = 6   # Saturday

if day_num == 1:
    day_name = "Monday"
elif day_num == 2:
    day_name = "Tuesday"
elif day_num == 3:
    day_name = "Wednesday"
elif day_num == 4:
    day_name = "Thursday"
elif day_num == 5:
    day_name = "Friday"
elif day_num == 6:
    day_name = "Saturday"
elif day_num == 7:
    day_name = "Sunday"
else:
    day_name = "Invalid day number"

print(day_name)   # Saturday
```

Note: for this specific case, `match-case` (covered in Section 9) or a
dictionary lookup is cleaner than a long if-elif chain.

---

## 4. Nested Conditions

You can place if statements inside other if statements. This is called
nesting. Use it when a second decision only makes sense if the first
condition is True.

```python
# Login system
is_registered = True
entered_password = "india@123"
correct_password = "india@123"
is_active        = True

if is_registered:
    if entered_password == correct_password:
        if is_active:
            print("Login successful. Welcome!")
        else:
            print("Account is deactivated. Contact support.")
    else:
        print("Wrong password. Please try again.")
else:
    print("Account not found. Please register.")
```

### Nesting depth -- when to stop

Deep nesting is hard to read and maintain. As a rule of thumb:
**if you are nesting more than two levels deep, consider refactoring.**

The guard clause pattern (covered in Section 8) is the standard way
to reduce nesting.

```python
# Deep nesting -- hard to follow
def process_order(order):
    if order is not None:
        if order["status"] == "pending":
            if order["amount"] > 0:
                if order["customer_id"] in active_customers:
                    # finally do the actual work
                    return process_payment(order)
                else:
                    return "Invalid customer"
            else:
                return "Invalid amount"
        else:
            return "Order not pending"
    else:
        return "No order"

# Flatter -- same logic, easier to read (covered properly in Section 8)
def process_order(order):
    if order is None:
        return "No order"
    if order["status"] != "pending":
        return "Order not pending"
    if order["amount"] <= 0:
        return "Invalid amount"
    if order["customer_id"] not in active_customers:
        return "Invalid customer"
    return process_payment(order)
```

---

## 5. The Ternary Operator -- One-Line if-else

Python has a one-line form of if-else called the conditional expression
(commonly called the ternary operator). It is useful for simple assignments
where both branches produce a single value.

```python
# Syntax
value = expression_if_true if condition else expression_if_false
```

```python
# Traditional if-else
marks = 72
if marks >= 60:
    result = "Pass"
else:
    result = "Fail"

# Ternary -- same result, one line
result = "Pass" if marks >= 60 else "Fail"
print(result)   # Pass
```

```python
# Practical examples

age = 22
category = "Adult" if age >= 18 else "Minor"

temperature = 35
weather = "Hot" if temperature > 30 else "Comfortable"

# With function calls
name = "  Aarav  "
clean_name = name.strip() if name else "Unknown"

# In f-strings
score = 88
print(f"Result: {'Pass' if score >= 60 else 'Fail'}")

# Absolute value without abs()
x = -42
absolute = x if x >= 0 else -x

# Default value pattern
config = {}
timeout = config.get("timeout") if config else 30
```

### When NOT to use ternary

```python
# Acceptable -- simple, readable
status = "Active" if is_logged_in else "Inactive"

# Too complex -- use regular if-else
# This is hard to read
result = (process_high(x) if x > 100 else process_low(x)) if x > 0 else handle_negative(x)

# Much better as if-elif-else
if x > 100:
    result = process_high(x)
elif x > 0:
    result = process_low(x)
else:
    result = handle_negative(x)
```

---

## 6. Truthiness -- What Python Considers True or False

Python's `if` statement does not require a strictly `True` or `False` value.
Any value can be used as a condition. Python converts it to a boolean
internally using the rules of **truthiness**.

```
Falsy values -- evaluate to False in a boolean context:
  False
  None
  0 (int zero)
  0.0 (float zero)
  0j (complex zero)
  "" (empty string)
  [] (empty list)
  () (empty tuple)
  {} (empty dict)
  set() (empty set)

Everything else is Truthy -- evaluates to True.
```

```python
# You can use truthiness to check for empty/None values directly
name = ""

if name:
    print(f"Hello, {name}!")
else:
    print("No name provided.")
# No name provided.  -- because "" is falsy

# Check if a list has items
students = []
if students:
    print(f"Processing {len(students)} students")
else:
    print("No students to process")

# Check if a value is not None
result = None
if result:
    print(f"Got result: {result}")
else:
    print("No result yet")
```

### Truthiness with numbers

```python
count = 0
if count:
    print("Has items")
else:
    print("Empty")   # 0 is falsy

count = 5
if count:
    print(f"Has {count} items")   # 5 is truthy
```

### Be careful with 0 and False

Truthiness can cause subtle bugs when you specifically need to allow 0:

```python
# BUG -- treats 0 as "no value"
def set_timeout(seconds=None):
    timeout = seconds if seconds else 30   # BUG: if seconds=0, uses 30
    return timeout

print(set_timeout(0))    # 30 -- wrong! Should be 0.
print(set_timeout(None)) # 30 -- correct

# CORRECT -- check for None specifically
def set_timeout(seconds=None):
    timeout = seconds if seconds is not None else 30
    return timeout

print(set_timeout(0))    # 0 -- correct
print(set_timeout(None)) # 30 -- correct
```

---

## 7. Comparison and Logical Operators in Depth

You covered these in Python Basics. Here we look at the less obvious
behaviour that matters in real control flow.

### Chained comparisons

Python supports chaining comparisons in a way that is both readable
and correct:

```python
marks = 75

# Python (clean and correct)
if 60 <= marks <= 100:
    print("Valid passing marks")

# Other languages need this (verbose, also has a subtle bug)
if marks >= 60 and marks <= 100:
    print("Valid passing marks")

# The chained version is exactly equivalent to the 'and' version
# but more readable and more Pythonic
```

```python
# Multi-step range check
temperature = 22

if 15 <= temperature <= 25:
    print("Comfortable temperature")
elif 25 < temperature <= 35:
    print("Warm")
elif temperature > 35:
    print("Hot")
else:
    print("Cold")
```

### Short-circuit evaluation

`and` and `or` stop evaluating as soon as the result is known.
This has practical consequences:

```python
# 'and' stops at the first False
# 'or'  stops at the first True

user = None

# Safe -- if user is None (falsy), the second condition is never evaluated
# so user["name"] never raises a TypeError or KeyError
if user and user["name"] == "Aarav":
    print("Found Aarav")

# This uses short-circuit to provide defaults
name = "" or "Anonymous"    # "" is falsy, so 'or' continues to "Anonymous"
print(name)                  # Anonymous

value = 42 or "default"     # 42 is truthy, so 'or' stops here
print(value)                 # 42

# Common pattern: default value using 'or'
config_timeout = None
timeout = config_timeout or 30    # if config_timeout is None/0/"", use 30
```

### is vs ==

```python
# == checks VALUE equality
# is checks IDENTITY (same object in memory)

a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)    # True -- same values
print(a is b)    # False -- different objects
print(a is c)    # True -- same object

# Always use 'is' for None checks
result = None
if result is None:     # correct
    print("No result")

if result == None:     # works but not recommended (PEP 8)
    print("No result")

# 'is not' for the negative check
if result is not None:
    print(f"Result: {result}")
```

### not, and, or -- operator precedence

```python
# Precedence (highest to lowest): not, then and, then or

x = True
y = False
z = True

# This is evaluated as: (not x) and y or z
# = False and False or True
# = False or True
# = True
print(not x and y or z)   # True

# When in doubt, use parentheses to be explicit
print((not x) and (y or z))   # False -- (not True) and (False or True)
                                #        = False and True = False
```

### in and not in

```python
# Membership testing -- works on lists, tuples, sets, strings, dicts (checks keys)
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai"]

city = "Mumbai"
if city in cities:
    print(f"{city} is in our list")

if "Kolkata" not in cities:
    print("Kolkata is not in our list")

# Checking against multiple values -- cleaner than multiple == comparisons
status = "pending"

# Instead of:
if status == "pending" or status == "processing" or status == "queued":
    print("Order is in progress")

# Write:
if status in {"pending", "processing", "queued"}:
    print("Order is in progress")
# Use a set (curly braces) instead of a list for membership checks --
# sets have O(1) lookup while lists have O(n) lookup
```

---

## 8. Common Patterns -- Guard Clauses and Early Returns

### The guard clause pattern

A guard clause is an early return (or raise) at the top of a function
that handles edge cases before the main logic. It eliminates deep nesting
and makes the happy path clear.

```python
# WITHOUT guard clauses -- deeply nested
def process_payment(order, user, payment_method):
    if order is not None:
        if user is not None:
            if user["is_active"]:
                if payment_method in ["UPI", "NetBanking", "Card"]:
                    if order["amount"] > 0:
                        # actual work is buried five levels deep
                        return charge_payment(order, payment_method)
                    else:
                        return {"error": "Invalid amount"}
                else:
                    return {"error": "Invalid payment method"}
            else:
                return {"error": "User account inactive"}
        else:
            return {"error": "User not found"}
    else:
        return {"error": "Order not found"}


# WITH guard clauses -- flat and readable
def process_payment(order, user, payment_method):
    # Guard clauses: handle all invalid cases first, return early
    if order is None:
        return {"error": "Order not found"}
    if user is None:
        return {"error": "User not found"}
    if not user["is_active"]:
        return {"error": "User account inactive"}
    if payment_method not in {"UPI", "NetBanking", "Card"}:
        return {"error": "Invalid payment method"}
    if order["amount"] <= 0:
        return {"error": "Invalid amount"}

    # Happy path: all validations passed, do the actual work
    return charge_payment(order, payment_method)
```

The second version is:
- Easier to read (the main logic is not buried)
- Easier to test (each guard can be tested independently)
- Easier to extend (add a new validation without touching indentation)

### Using guard clauses in loops

```python
# Processing a list of student records
students = [
    {"name": "Aarav",  "marks": 88, "active": True},
    {"name": None,     "marks": 75, "active": True},   # missing name
    {"name": "Rohan",  "marks": -5, "active": True},   # invalid marks
    {"name": "Sneha",  "marks": 91, "active": False},  # inactive
    {"name": "Karan",  "marks": 72, "active": True},
]

results = []
for student in students:
    # Guard clauses -- skip invalid records with continue
    if not student.get("name"):
        print("Skipping record with missing name")
        continue
    if student["marks"] < 0 or student["marks"] > 100:
        print(f"Invalid marks for {student['name']}: {student['marks']}")
        continue
    if not student["active"]:
        print(f"Skipping inactive student: {student['name']}")
        continue

    # Happy path
    grade = "Pass" if student["marks"] >= 60 else "Fail"
    results.append({"name": student["name"], "grade": grade})

print(results)
```

---

## 9. match-case -- Structural Pattern Matching (Python 3.10+)

`match-case` was introduced in Python 3.10. It is Python's version of the
switch-case statement found in other languages, but significantly more
powerful because it can match on structure, not just values.

### Basic value matching

```python
# The old way -- long if-elif chain for simple value matching
command = "quit"

if command == "start":
    print("Starting...")
elif command == "stop":
    print("Stopping...")
elif command == "quit":
    print("Quitting...")
else:
    print(f"Unknown command: {command}")


# match-case -- cleaner for this kind of logic
command = "quit"

match command:
    case "start":
        print("Starting...")
    case "stop":
        print("Stopping...")
    case "quit":
        print("Quitting...")
    case _:             # _ is the wildcard -- matches anything
        print(f"Unknown command: {command}")
```

### Matching multiple values in one case

```python
status_code = 404

match status_code:
    case 200 | 201 | 204:
        print("Success")
    case 400 | 422:
        print("Client error -- check your request")
    case 401 | 403:
        print("Authentication/authorisation error")
    case 404:
        print("Resource not found")
    case 500 | 502 | 503:
        print("Server error -- try again later")
    case _:
        print(f"Unexpected status: {status_code}")
```

### Matching with a guard (if condition inside case)

```python
score = 72

match score:
    case n if n >= 90:
        grade = "A+"
    case n if n >= 80:
        grade = "A"
    case n if n >= 70:
        grade = "B"
    case n if n >= 60:
        grade = "C"
    case _:
        grade = "F"

print(f"Score: {score} -- Grade: {grade}")
```

### Matching sequences (lists and tuples)

```python
# match-case can destructure sequences
point = (3, 4)

match point:
    case (0, 0):
        print("Origin")
    case (x, 0):
        print(f"On X-axis at {x}")
    case (0, y):
        print(f"On Y-axis at {y}")
    case (x, y):
        print(f"Point at ({x}, {y})")
```

```python
# Matching commands with arguments
command = ["move", "north", "10"]

match command:
    case ["quit"]:
        print("Quitting game")
    case ["move", direction, steps]:
        print(f"Moving {direction} by {steps} steps")
    case ["attack", target]:
        print(f"Attacking {target}")
    case ["help"]:
        print("Showing help")
    case _:
        print(f"Unknown command: {command}")
```

### Matching dictionaries

```python
# Matching based on the presence and values of dict keys
event = {"type": "order_placed", "amount": 5000, "city": "Mumbai"}

match event:
    case {"type": "order_placed", "amount": amount} if amount > 10000:
        print(f"Large order placed: Rs.{amount}")
    case {"type": "order_placed", "amount": amount}:
        print(f"Order placed: Rs.{amount}")
    case {"type": "order_cancelled", "reason": reason}:
        print(f"Order cancelled: {reason}")
    case {"type": event_type}:
        print(f"Unknown event type: {event_type}")
```

### Matching class instances

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

@dataclass
class Circle:
    center: Point
    radius: float

shape = Circle(center=Point(0, 0), radius=5)

match shape:
    case Circle(center=Point(x=0, y=0), radius=r):
        print(f"Circle centred at origin with radius {r}")
    case Circle(center=Point(x=cx, y=cy), radius=r):
        print(f"Circle at ({cx}, {cy}) with radius {r}")
    case Point(x=x, y=y):
        print(f"A point at ({x}, {y})")
```

### When to use match-case vs if-elif

```
Use match-case when:
  - Matching a single value against multiple specific values
  - Matching the structure of sequences or dicts
  - Destructuring data as part of the match

Use if-elif when:
  - Conditions involve complex expressions or multiple variables
  - You need range checks (>= 60 and < 80)
  - Running Python < 3.10
  - The conditions are fundamentally different in type
```

---

## 10. Common Mistakes and How to Avoid Them

### Mistake 1 -- Assignment inside a condition (= instead of ==)

```python
score = 85

# WRONG -- assigns 0 to score, condition is always False (0 is falsy)
if score = 0:      # SyntaxError in Python -- Python catches this one
    print("Zero")

# RIGHT
if score == 0:
    print("Zero")

# Note: Python 3.8+ introduced the walrus operator := for intentional
# assignment inside a condition -- covered briefly below
```

### Mistake 2 -- Checking a boolean variable redundantly

```python
is_logged_in = True

# Redundant -- already a boolean
if is_logged_in == True:
    print("Welcome")

# Correct -- just use the boolean directly
if is_logged_in:
    print("Welcome")

# For False check
if not is_logged_in:
    print("Please log in")
```

### Mistake 3 -- Forgetting that elif stops checking

```python
score = 72

# WRONG -- this prints two things because there are two separate if statements
if score >= 60:
    print("Passed")
if score >= 70:
    print("Good performance")   # also prints! two separate conditions

# RIGHT -- use elif so only one branch runs
if score >= 70:
    print("Good performance")
elif score >= 60:
    print("Passed")
else:
    print("Failed")
```

### Mistake 4 -- Confusing 'is' and '=='

```python
# == for value comparison
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)    # True -- same values

# is for identity (same object)
print(a is b)    # False -- different objects

# is for None (always correct)
result = None
print(result is None)     # True -- correct
print(result == None)     # True -- works but not recommended
```

### Mistake 5 -- Not handling the else case

```python
# Can lead to NameError if no condition matches
score = 105   # invalid

if score >= 90:
    grade = "A+"
elif score >= 80:
    grade = "A"
# No else -- if score is 105, 'grade' is never set
print(grade)   # NameError: name 'grade' is not defined

# Always handle the fallthrough case
if score >= 90:
    grade = "A+"
elif score >= 80:
    grade = "A"
else:
    grade = "Invalid"   # or raise ValueError(f"Invalid score: {score}")
```

### The walrus operator := (Python 3.8+)

The walrus operator assigns a value AND uses it in the same expression.
Useful for avoiding redundant function calls.

```python
import re

# Without walrus -- calls match() twice
if re.match(r"\d{10}", phone_number):
    match = re.match(r"\d{10}", phone_number)
    print(f"Valid number: {match.group()}")

# With walrus -- assign and check in one step
if match := re.match(r"\d{10}", phone_number):
    print(f"Valid number: {match.group()}")
```

```python
# Another common use -- reading from a file or stream
with open("data.txt") as f:
    while line := f.readline():   # assign and check in one step
        print(line.strip())
        # loop ends when readline() returns "" (empty string = falsy)
```

---

## 11. Practice Questions

Try each question before reading the solution. Questions are ordered:
Easy (1-5), Medium (6-10), Hard (11-15).

---

### Easy

**Q1 -- Basic if-else**
Write a function `check_eligibility(age)` that returns:
- `"Eligible to vote"` if age is 18 or above
- `"Not eligible to vote"` if age is below 18

Test with ages: 15, 18, 25, 17.

---

**Q2 -- if-elif-else**
Write a function `bmi_category(bmi)` that returns the category:
- Below 18.5: `"Underweight"`
- 18.5 to 24.9: `"Normal"`
- 25.0 to 29.9: `"Overweight"`
- 30 and above: `"Obese"`

Test with: 17.2, 22.5, 27.8, 35.1

---

**Q3 -- Ternary operator**
Rewrite the following using a ternary expression:
```python
number = -7
if number >= 0:
    sign = "positive"
else:
    sign = "negative"
```
Then use it to print: `"-7 is negative"`

---

**Q4 -- Truthiness**
Given the dictionary below, use truthiness (not explicit `== None` or
`== ""` checks) to print only the fields that have values:

```python
profile = {
    "name":    "Aarav Sharma",
    "email":   "",
    "phone":   None,
    "city":    "Bangalore",
    "website": "",
    "company": "Codeverra",
}
```

Expected output:
```
name    : Aarav Sharma
city    : Bangalore
company : Codeverra
```

---

**Q5 -- Nested conditions**
Write a function `classify_triangle(a, b, c)` that:
- First checks if the three sides form a valid triangle
  (each side must be less than the sum of the other two)
- If valid, classifies it as:
  - `"Equilateral"` if all sides are equal
  - `"Isosceles"` if exactly two sides are equal
  - `"Scalene"` if all sides are different

```python
classify_triangle(3, 3, 3)    # Equilateral
classify_triangle(5, 5, 8)    # Isosceles
classify_triangle(3, 4, 5)    # Scalene (also a right triangle)
classify_triangle(1, 2, 10)   # Not a valid triangle
```

---

### Medium

**Q6 -- Guard clauses**
Rewrite the following function using guard clauses to eliminate the nesting:

```python
def process_student(student):
    if student is not None:
        if isinstance(student, dict):
            if "name" in student:
                if "marks" in student:
                    if 0 <= student["marks"] <= 100:
                        return f"{student['name']}: {'Pass' if student['marks'] >= 60 else 'Fail'}"
                    else:
                        return "Invalid marks"
                else:
                    return "Missing marks"
            else:
                return "Missing name"
        else:
            return "Invalid type"
    else:
        return "No student"
```

---

**Q7 -- Membership and logical operators**
Write a function `validate_password(password)` that checks all of:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one digit
- Contains at least one special character from `!@#$%^&*()`

Return a list of all failed requirements. If all pass, return an empty list.

```python
validate_password("abc")
# ["Too short (min 8 chars)", "No uppercase letter", "No digit", "No special character"]

validate_password("Codeverra1!")
# []  (all requirements met)
```

---

**Q8 -- match-case**
Write a function `process_command(command)` using `match-case` that handles
a list-based command format:

```python
process_command(["help"])                     # "Showing available commands"
process_command(["add", "Aarav", "88"])       # "Added student Aarav with marks 88"
process_command(["update", "Aarav", "92"])    # "Updated Aarav's marks to 92"
process_command(["delete", "Aarav"])          # "Deleted student Aarav"
process_command(["search", "Priya"])          # "Searching for Priya"
process_command(["export", "csv", "output.csv"])  # "Exporting to CSV: output.csv"
process_command(["unknown"])                  # "Unknown command: unknown"
```

---

**Q9 -- Short-circuit evaluation**
Explain what each of the following prints and why:

```python
x = 0
y = 10

print(x and y)
print(x or y)
print(not x)
print(x or "default")
print(y and "found")
print(None or [] or 0 or "fallback")
```

Write your predictions before running the code. Then verify.

---

**Q10 -- Complete control flow**
Write a function `calculate_electricity_bill(units)` that calculates a
monthly electricity bill based on units consumed, using these slabs
(similar to Indian utility billing):

```
First 100 units    : Rs.3.50 per unit
101 to 200 units   : Rs.4.50 per unit (for units above 100)
201 to 300 units   : Rs.6.00 per unit (for units above 200)
Above 300 units    : Rs.8.00 per unit (for units above 300)
Fixed charge       : Rs.50
If total > Rs.500  : add 10% surcharge
```

Test with: 80, 150, 250, 400 units.

---

### Hard

**Q11 -- Walrus operator**
Rewrite the following loop using the walrus operator:

```python
import re

messages = [
    "Call me at 9876543210",
    "No number here",
    "Contact: 8765432109",
    "Email only",
    "Reach out: 7654321098",
]

for msg in messages:
    match = re.search(r"\b[6-9]\d{9}\b", msg)
    if match:
        print(f"Found number: {match.group()} in: {msg[:30]}")
```

---

**Q12 -- match-case with data structures**
You receive API responses as dictionaries. Write a function
`handle_api_response(response)` using `match-case` that:

```python
# Success with data
{"status": "success", "data": {"users": [...]}, "count": 42}
# Output: "Success: 42 users returned"

# Success but empty
{"status": "success", "data": {}, "count": 0}
# Output: "Success but no data returned"

# Error with code
{"status": "error", "code": 404, "message": "Not found"}
# Output: "Error 404: Not found"

# Error without code
{"status": "error", "message": "Server error"}
# Output: "Error: Server error"

# Unexpected structure
anything_else
# Output: "Unexpected response format"
```

---

**Q13 -- Full validation pipeline**
Write a function `validate_order(order)` that validates an e-commerce order
dictionary and returns a tuple of `(is_valid, list_of_errors)`.

```python
# Valid order
order = {
    "order_id":    "ORD001",
    "customer_id": "CUST123",
    "items":       [{"product": "Laptop", "qty": 1, "price": 65000}],
    "city":        "Bangalore",
    "pincode":     "560001",
    "payment":     "UPI",
}

# Required checks:
# - order_id must be non-empty string
# - customer_id must be non-empty string
# - items must be a non-empty list
# - each item must have product (str), qty (int >= 1), price (float > 0)
# - city must be a non-empty string
# - pincode must be exactly 6 digits
# - payment must be one of: UPI, Card, NetBanking, COD
```

---

**Q14 -- Dynamic condition builder**
Write a function `filter_students(students, **criteria)` that accepts a list
of student dicts and any combination of filter criteria as keyword arguments.
It should apply all provided criteria and return matching students.

```python
students = [
    {"name": "Aarav",  "city": "Delhi",     "marks": 88, "dept": "CS"},
    {"name": "Priya",  "city": "Mumbai",    "marks": 92, "dept": "IT"},
    {"name": "Rohan",  "city": "Delhi",     "marks": 65, "dept": "CS"},
    {"name": "Sneha",  "city": "Bangalore", "marks": 95, "dept": "IT"},
]

filter_students(students, city="Delhi")
# [Aarav, Rohan]

filter_students(students, dept="CS", min_marks=80)
# [Aarav]  -- Rohan has CS but marks=65 < 80

filter_students(students, min_marks=90)
# [Priya, Sneha]
```

---

**Q15 -- State machine**
Implement a simple order status state machine. An order can only transition
between states in specific ways:

```
Valid transitions:
  Pending    --> Confirmed
  Pending    --> Cancelled
  Confirmed  --> Processing
  Confirmed  --> Cancelled
  Processing --> Shipped
  Shipped    --> Delivered
  Shipped    --> Returned
```

Write a class `Order` with a method `transition(new_status)` that:
- Allows the transition if it is valid
- Raises `ValueError` with a clear message if not
- Records the full history of transitions

---

## 12. Solutions

---

### Q1

```python
def check_eligibility(age):
    return "Eligible to vote" if age >= 18 else "Not eligible to vote"

for age in [15, 18, 25, 17]:
    print(f"Age {age}: {check_eligibility(age)}")
```

---

### Q2

```python
def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25.0:
        return "Normal"
    elif bmi < 30.0:
        return "Overweight"
    else:
        return "Obese"

for bmi in [17.2, 22.5, 27.8, 35.1]:
    print(f"BMI {bmi}: {bmi_category(bmi)}")
```

---

### Q3

```python
number = -7
sign   = "positive" if number >= 0 else "negative"
print(f"{number} is {sign}")
```

---

### Q4

```python
profile = {
    "name":    "Aarav Sharma",
    "email":   "",
    "phone":   None,
    "city":    "Bangalore",
    "website": "",
    "company": "Codeverra",
}

for field, value in profile.items():
    if value:   # truthiness check -- empty string and None are falsy
        print(f"{field:<10}: {value}")
```

---

### Q5

```python
def classify_triangle(a, b, c):
    # Guard clause: validity check first
    if not (a + b > c and b + c > a and a + c > b):
        return "Not a valid triangle"

    if a == b == c:
        return "Equilateral"
    elif a == b or b == c or a == c:
        return "Isosceles"
    else:
        return "Scalene"

print(classify_triangle(3, 3, 3))    # Equilateral
print(classify_triangle(5, 5, 8))    # Isosceles
print(classify_triangle(3, 4, 5))    # Scalene
print(classify_triangle(1, 2, 10))   # Not a valid triangle
```

---

### Q6

```python
def process_student(student):
    if student is None:
        return "No student"
    if not isinstance(student, dict):
        return "Invalid type"
    if "name" not in student:
        return "Missing name"
    if "marks" not in student:
        return "Missing marks"
    if not (0 <= student["marks"] <= 100):
        return "Invalid marks"

    result = "Pass" if student["marks"] >= 60 else "Fail"
    return f"{student['name']}: {result}"
```

---

### Q7

```python
def validate_password(password):
    errors = []
    special = set("!@#$%^&*()")

    if len(password) < 8:
        errors.append("Too short (min 8 chars)")
    if not any(c.isupper() for c in password):
        errors.append("No uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("No lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("No digit")
    if not any(c in special for c in password):
        errors.append("No special character")

    return errors

print(validate_password("abc"))
print(validate_password("Codeverra1!"))
```

---

### Q8

```python
def process_command(command):
    match command:
        case ["help"]:
            return "Showing available commands"
        case ["add", name, marks]:
            return f"Added student {name} with marks {marks}"
        case ["update", name, marks]:
            return f"Updated {name}'s marks to {marks}"
        case ["delete", name]:
            return f"Deleted student {name}"
        case ["search", name]:
            return f"Searching for {name}"
        case ["export", fmt, filename]:
            return f"Exporting to {fmt.upper()}: {filename}"
        case [cmd, *_]:
            return f"Unknown command: {cmd}"
```

---

### Q9

```python
x = 0
y = 10

print(x and y)              # 0   -- x is falsy, 'and' returns x
print(x or y)               # 10  -- x is falsy, 'or' continues and returns y
print(not x)                # True -- not 0 is True
print(x or "default")       # "default" -- x is falsy, 'or' returns "default"
print(y and "found")        # "found" -- y is truthy, 'and' returns the second value
print(None or [] or 0 or "fallback")  # "fallback" -- all before it are falsy
```

Key insight: `and` and `or` do not return True/False -- they return one of
their operands. `and` returns the first falsy value (or the last value if all
are truthy). `or` returns the first truthy value (or the last value if all
are falsy).

---

### Q10

```python
def calculate_electricity_bill(units):
    if units < 0:
        raise ValueError("Units cannot be negative")

    cost = 50   # fixed charge

    if units <= 100:
        cost += units * 3.50
    elif units <= 200:
        cost += 100 * 3.50 + (units - 100) * 4.50
    elif units <= 300:
        cost += 100 * 3.50 + 100 * 4.50 + (units - 200) * 6.00
    else:
        cost += 100 * 3.50 + 100 * 4.50 + 100 * 6.00 + (units - 300) * 8.00

    if cost > 500:
        cost *= 1.10   # 10% surcharge

    return round(cost, 2)

for units in [80, 150, 250, 400]:
    bill = calculate_electricity_bill(units)
    print(f"{units:>4} units: Rs.{bill:,.2f}")
```

---

### Q11

```python
import re

messages = [
    "Call me at 9876543210",
    "No number here",
    "Contact: 8765432109",
    "Email only",
    "Reach out: 7654321098",
]

for msg in messages:
    if match := re.search(r"\b[6-9]\d{9}\b", msg):
        print(f"Found number: {match.group()} in: {msg[:30]}")
```

---

### Q12

```python
def handle_api_response(response):
    match response:
        case {"status": "success", "count": count} if count > 0:
            return f"Success: {count} users returned"
        case {"status": "success"}:
            return "Success but no data returned"
        case {"status": "error", "code": code, "message": msg}:
            return f"Error {code}: {msg}"
        case {"status": "error", "message": msg}:
            return f"Error: {msg}"
        case _:
            return "Unexpected response format"
```

---

### Q13

```python
def validate_order(order):
    errors = []
    valid_payments = {"UPI", "Card", "NetBanking", "COD"}

    if not order.get("order_id") or not isinstance(order["order_id"], str):
        errors.append("order_id must be a non-empty string")

    if not order.get("customer_id") or not isinstance(order["customer_id"], str):
        errors.append("customer_id must be a non-empty string")

    items = order.get("items", [])
    if not items or not isinstance(items, list):
        errors.append("items must be a non-empty list")
    else:
        for i, item in enumerate(items):
            if not isinstance(item.get("product"), str) or not item["product"]:
                errors.append(f"Item {i}: product must be a non-empty string")
            if not isinstance(item.get("qty"), int) or item.get("qty", 0) < 1:
                errors.append(f"Item {i}: qty must be an integer >= 1")
            if not isinstance(item.get("price"), (int, float)) or item.get("price", 0) <= 0:
                errors.append(f"Item {i}: price must be a positive number")

    if not order.get("city") or not isinstance(order["city"], str):
        errors.append("city must be a non-empty string")

    pincode = str(order.get("pincode", ""))
    if not pincode.isdigit() or len(pincode) != 6:
        errors.append("pincode must be exactly 6 digits")

    if order.get("payment") not in valid_payments:
        errors.append(f"payment must be one of: {valid_payments}")

    return (len(errors) == 0, errors)

is_valid, errors = validate_order({"order_id": "ORD001", "customer_id": "C1",
    "items": [{"product": "Laptop", "qty": 1, "price": 65000}],
    "city": "Bangalore", "pincode": "560001", "payment": "UPI"})
print(is_valid, errors)
```

---

### Q14

```python
def filter_students(students, **criteria):
    results = []
    for student in students:
        match = True
        for key, value in criteria.items():
            if key == "min_marks":
                if student.get("marks", 0) < value:
                    match = False
                    break
            elif key == "max_marks":
                if student.get("marks", 0) > value:
                    match = False
                    break
            else:
                if student.get(key) != value:
                    match = False
                    break
        if match:
            results.append(student)
    return results
```

---

### Q15

```python
class Order:

    TRANSITIONS = {
        "Pending":    {"Confirmed", "Cancelled"},
        "Confirmed":  {"Processing", "Cancelled"},
        "Processing": {"Shipped"},
        "Shipped":    {"Delivered", "Returned"},
        "Delivered":  set(),
        "Cancelled":  set(),
        "Returned":   set(),
    }

    def __init__(self, order_id):
        self.order_id = order_id
        self.status   = "Pending"
        self.history  = ["Pending"]

    def transition(self, new_status):
        allowed = self.TRANSITIONS.get(self.status, set())
        if new_status not in allowed:
            raise ValueError(
                f"Cannot transition from '{self.status}' to '{new_status}'. "
                f"Allowed: {allowed if allowed else 'none (terminal state)'}"
            )
        self.status = new_status
        self.history.append(new_status)
        print(f"Order {self.order_id}: {' -> '.join(self.history)}")


order = Order("ORD001")
order.transition("Confirmed")
order.transition("Processing")
order.transition("Shipped")
order.transition("Delivered")

try:
    order.transition("Cancelled")   # cannot cancel a delivered order
except ValueError as e:
    print(f"Error: {e}")
```

---

## 13. Summary and Key Takeaways

### What you learned

`if`, `elif`, and `else` are how Python's execution branches. Only one
branch runs. Once a condition matches, the rest are skipped.

Ternary expressions (`x if condition else y`) are clean for simple
one-line assignments but should not be nested.

Every value in Python has a boolean meaning. Empty strings, empty
collections, zero, and None are all falsy. Everything else is truthy.
Use this directly in conditions instead of explicit `== None` checks.

Guard clauses -- returning early at the top of a function for invalid
cases -- eliminate nesting and make the happy path clear. This is one
of the most important patterns in clean code.

`match-case` (Python 3.10+) is cleaner than long if-elif chains when
matching values, sequences, or dictionary structures. Use it when you
are matching a single subject against multiple patterns.

### The rules to follow

```
Put more specific conditions before broader ones in if-elif chains.
Use 'is' for None checks, '==' for value comparisons.
Use 'in' with a set for membership checks against multiple values.
Use guard clauses to keep functions flat instead of deeply nested.
Use 'is not None' explicitly when 0 or False are valid values.
Always have an else or a default case to handle the unexpected.
```

---

*Made with care for Codeverra learners | codeverra.com*