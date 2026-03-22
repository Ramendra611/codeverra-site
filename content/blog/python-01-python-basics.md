---
title: "Python Basics Masterclass"
description: "A complete beginner-friendly guide to Python basics - syntax, data types, variables, and core concepts."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
 - python
---

# Python Basics Masterclass
### Variables, Data Types, Strings, Operators, and Input/Output - A Complete Foundation

---

> Who is this for?
> You are new to Python or just getting started. This is the very first thing to read and practice
> before moving on to collections, loops, functions, or anything else in the curriculum.
> Every concept is explained simply, with small Indian-context examples, before moving to the next.

---

## Table of Contents

1. [How Python Works](#1-how-python-works)
2. [Your First Python Program](#2-your-first-python-program)
3. [Comments](#3-comments)
4. [Variables and Assignment](#4-variables-and-assignment)
5. [Naming Rules and Conventions](#5-naming-rules-and-conventions)
6. [Python Keywords](#6-python-keywords)
7. [Numbers - int, float, complex](#7-numbers----int-float-complex)
8. [The math Module](#8-the-math-module)
9. [Booleans](#9-booleans)
10. [None - The Absence of a Value](#10-none----the-absence-of-a-value)
11. [Strings - Complete Guide](#11-strings----complete-guide)
12. [Operators](#12-operators)
13. [Type Conversion](#13-type-conversion)
14. [Input and Output](#14-input-and-output)
15. [f-strings and String Formatting](#15-f-strings-and-string-formatting)
16. [Practice Questions](#16-practice-questions)
17. [Solutions](#17-solutions)
18. [What Comes Next](#18-what-comes-next)

---

## 1. How Python Works

When you write Python code and run it, here is what happens behind the scenes:

```
Your .py file (source code)
 |
 Python Interpreter
 |
 Bytecode (.pyc)
 |
 Python Virtual Machine (PVM)
 |
 Output on your screen
```

Python is an **interpreted language** - it reads and executes your code line by line, top to bottom. This is different from compiled languages like C++ where you compile the entire program first and then run it.

This means:
- You see errors immediately at the line they happen
- You can run code interactively in Jupyter Notebook or the Python shell
- You do not need a compile step - write, save, run

### Running Python

```bash
# Run a script from terminal
python my_script.py

# Open interactive shell
python

# Run a single expression
python -c "print(2 + 2)"
```

---

## 2. Your First Python Program

```python
print("Namaste, World!")
```

```
Namaste, World!
```

That is it. One line. No imports, no main function, no class required. Python's simplicity is intentional.

```python
# A slightly more interesting first program
name = "Aarav"
city = "Bangalore"
year = 2024

print(f"Hello! I am {name} from {city}.")
print(f"I started learning Python in {year}.")
```

```
Hello! I am Aarav from Bangalore.
I started learning Python in 2024.
```

---

## 3. Comments

Comments are notes in your code that Python completely ignores. They exist for humans reading the code.

### Single-line comments

```python
# This is a comment
print("Hello") # This is an inline comment

# Always explain WHY, not just WHAT
# BAD: x = x + 1 # add 1 to x
# GOOD: x = x + 1 # increment page number before rendering
```

### Multi-line comments

Python does not have a dedicated multi-line comment syntax. You can use multiple `#` lines or a multi-line string (triple quotes). The triple-quote version is technically a string that is not assigned to anything - Python ignores it.

```python
# Line one of a long explanation
# Line two of the same explanation
# Line three

"""
This is also used as a multi-line comment.
Python evaluates it as a string but discards it
because it is not assigned to a variable.
"""
```

### Docstrings - documentation comments

Docstrings are triple-quoted strings placed at the start of a function, class, or module. They are the official way to document your code and are accessible at runtime.

```python
def add_gst(price):
 """
 Calculate price after adding 18% GST.

 Parameters:
 price (float): Base price of the product

 Returns:
 float: Price including GST
 """
 return round(price * 1.18, 2)

print(add_gst.__doc__) # prints the docstring
help(add_gst) # formatted help output
```

> Good comments and docstrings are a professional habit. Write them as if someone else will read your code tomorrow - because they will, and that someone is often your future self.

---

## 4. Variables and Assignment

A variable is a named container that holds a value. In Python you do not declare variables - you simply assign a value and Python creates the variable.

```python
# Assignment: name = value
student_name = "Priya Sharma"
age = 21
gpa = 8.7
is_enrolled = True
```

### How assignment works

When you write `age = 21`, Python:
1. Creates an integer object with value 21 in memory
2. Creates a label `age` that points to that object

The variable is just a label. You can move the label to a different object at any time.

```python
age = 21 # age points to integer 21
age = "twenty" # age now points to string "twenty" - perfectly valid
age = [1, 2, 3] # age now points to a list - still valid
```

This is what **dynamic typing** means - the variable itself has no fixed type. The object it points to does.

### Multiple assignment

```python
# Assign the same value to multiple variables
x = y = z = 0

# Assign multiple values in one line (tuple unpacking)
name, city, score = "Rohan", "Delhi", 88

# Swap two variables - elegant Python syntax
a, b = 10, 20
a, b = b, a
print(a, b) # 20 10
```

### Augmented assignment operators

```python
score = 50

score += 10 # score = score + 10 - > 60
score -= 5 # score = score - 5 - > 55
score *= 2 # score = score * 2 - > 110
score //= 3 # score = score // 3 - > 36
score **= 2 # score = score ** 2 - > 1296
score %= 100 # score = score % 100 - > 96
```

### Checking a variable's type

```python
name = "Aarav"
age = 21
gpa = 8.7
flag = True

print(type(name)) # <class 'str'>
print(type(age)) # <class 'int'>
print(type(gpa)) # <class 'float'>
print(type(flag)) # <class 'bool'>

# isinstance() is the preferred way to check type in real code
print(isinstance(age, int)) # True
print(isinstance(gpa, float)) # True
print(isinstance(name, str)) # True
```

---

## 5. Naming Rules and Conventions

### Rules - these are enforced by Python

```python
# Valid names
student_name = "Priya"
_private = 42
CamelCase = True
name2 = "Rohan"
CONSTANT = 3.14

# Invalid names - these cause SyntaxError
2name = "Aarav" # cannot start with a digit
my-name = "Priya" # hyphens not allowed
class = "10A" # cannot use a keyword
my name = "Rohan" # spaces not allowed
```

### Conventions - these are style standards (PEP 8)

| What | Convention | Example |
|---|---|---|
| Regular variables | snake_case | `student_name`, `total_marks` |
| Constants | UPPER_SNAKE_CASE | `MAX_SCORE`, `TAX_RATE` |
| Functions | snake_case | `calculate_gst()`, `get_name()` |
| Classes | PascalCase | `StudentRecord`, `BankAccount` |
| Private variables | leading underscore | `_internal_count` |
| "Don't care" variable | single underscore | `for _ in range(5):` |

```python
# Good naming - self-documenting code
monthly_revenue = 125000
gst_rate = 0.18
MAX_RETRIES = 3

# Bad naming - cryptic
mr = 125000
g = 0.18
x = 3
```

> Naming well is one of the most valuable skills in programming. A good variable name makes the code read like a sentence and eliminates the need for a comment.

---

## 6. Python Keywords

Keywords are reserved words that have special meaning in Python. You cannot use them as variable names.

```python
import keyword
print(keyword.kwlist)
```

```
['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
 'try', 'while', 'with', 'yield']
```

You will learn what each of these does as you progress through the curriculum. For now, just know you cannot name a variable any of these words.

---

## 7. Numbers - int, float, complex

Python has three numeric types built in.

### int - integers

```python
# Positive and negative whole numbers - no size limit in Python
population = 1_428_627_663 # underscores for readability (Python 3.6+)
temperature = -15
zero = 0

# Different bases
binary = 0b1010 # binary - value is 10
octal = 0o17 # octal - value is 15
hex_val = 0xFF # hex - value is 255

print(binary, octal, hex_val) # 10 15 255

# Convert to other bases
print(bin(255)) # '0b11111111'
print(oct(255)) # '0o377'
print(hex(255)) # '0xff'
```

### float - decimal numbers

```python
price = 299.99
pi = 3.14159
gst_rate = 0.18

# Scientific notation
avogadro = 6.022e23 # 6.022 x 10^23
electron = 1.6e-19 # 1.6 x 10^-19

print(avogadro) # 6.022e+23
print(electron) # 1.6e-19

# Float precision - a known quirk
print(0.1 + 0.2) # 0.30000000000000004 (not exactly 0.3)
print(round(0.1 + 0.2, 2)) # 0.3 (use round() for financial calculations)

# For exact decimal arithmetic, use the decimal module
from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2")) # 0.3 (exact)
```

### Arithmetic operators

```python
a, b = 17, 5

print(a + b) # 22 addition
print(a - b) # 12 subtraction
print(a * b) # 85 multiplication
print(a / b) # 3.4 division - always returns float
print(a // b) # 3 floor division - integer result, rounds down
print(a % b) # 2 modulo - remainder
print(a ** b) # 1419857 exponentiation

# Important: // always rounds towards negative infinity
print( 17 // 5) # 3
print(-17 // 5) # -4 (not -3)
print( 17 // -5) # -4
```

### Operator precedence (BODMAS equivalent)

```python
# Python follows standard mathematical precedence
# ** > unary - > * / // % > + -

print(2 + 3 * 4) # 14, not 20 (multiplication before addition)
print((2 + 3) * 4) # 20 (parentheses first)
print(2 ** 3 ** 2) # 512 (** is right-associative: 2 ** (3**2) = 2**9)
print(10 - 4 - 2) # 4 (left to right: (10-4)-2)
```

### complex - complex numbers

```python
z1 = 3 + 4j
z2 = 1 - 2j

print(z1 + z2) # (4+2j)
print(z1 * z2) # (11-2j)
print(z1.real) # 3.0
print(z1.imag) # 4.0
print(abs(z1)) # 5.0 (magnitude: sqrt(3^2 + 4^2))
```

---

## 8. The math Module

The `math` module gives you mathematical functions beyond basic arithmetic.

```python
import math

# Constants
print(math.pi) # 3.141592653589793
print(math.e) # 2.718281828459045
print(math.inf) # infinity
print(math.tau) # 6.283... (2 * pi)

# Rounding
print(math.floor(4.9)) # 4 (round down)
print(math.ceil(4.1)) # 5 (round up)
print(round(4.5)) # 4 (built-in - banker's rounding)
print(round(4.567, 2)) # 4.57

# Power and logarithm
print(math.sqrt(144)) # 12.0
print(math.pow(2, 10)) # 1024.0
print(math.log(100, 10)) # 2.0 (log base 10 of 100)
print(math.log(math.e)) # 1.0 (natural log)
print(math.log2(1024)) # 10.0

# Absolute value
print(abs(-42)) # 42 (built-in)
print(math.fabs(-42)) # 42.0 (math module - always returns float)

# Trigonometry (input in radians)
print(math.sin(math.pi / 2)) # 1.0
print(math.cos(0)) # 1.0
print(math.tan(math.pi / 4)) # 0.9999... (~1.0)

# Convert degrees to radians and back
print(math.degrees(math.pi)) # 180.0
print(math.radians(180)) # 3.14159...

# Factorial and combinations
print(math.factorial(5)) # 120
print(math.comb(10, 3)) # 120 (10 choose 3)
print(math.perm(10, 3)) # 720 (10 P 3)

# Greatest common divisor and least common multiple
print(math.gcd(48, 18)) # 6
print(math.lcm(4, 6)) # 12
```

---

## 9. Booleans

Booleans represent truth values. There are exactly two: `True` and `False`. Note the capital first letter - Python is case-sensitive.

```python
is_logged_in = True
has_paid = False
is_eligible = True

print(type(True)) # <class 'bool'>
print(type(False)) # <class 'bool'>
```

### Booleans are integers

In Python, `bool` is a subclass of `int`. `True` equals 1 and `False` equals 0.

```python
print(True + True) # 2
print(True * 5) # 5
print(False + 10) # 10
print(True == 1) # True
print(False == 0) # True

# Useful trick: count True values in a list
results = [True, False, True, True, False]
print(sum(results)) # 3 (counts the Trues)
```

### Comparison operators - always return a boolean

```python
score = 78

print(score > 60) # True
print(score < 60) # False
print(score == 78) # True - equality check (note: ==, not =)
print(score != 78) # False - not equal
print(score >= 78) # True - greater than or equal
print(score <= 77) # False - less than or equal

# Chained comparisons - very Pythonic
marks = 85
print(60 <= marks <= 100) # True - between 60 and 100 inclusive
print(0 < marks < 60) # False - marks is not below 60
```

### Logical operators

```python
age = 22
has_degree = True
experience = 3

# and - True only if BOTH are True
print(age >= 21 and has_degree) # True
print(age >= 21 and experience >= 5) # False

# or - True if AT LEAST ONE is True
print(has_degree or experience >= 5) # True
print(age < 18 or experience >= 5) # False

# not - reverses the boolean
print(not has_degree) # False
print(not False) # True

# Short-circuit evaluation
# and stops at the first False
# or stops at the first True
print(False and 1/0) # False (1/0 never evaluated - short-circuit)
print(True or 1/0) # True (1/0 never evaluated - short-circuit)
```

### Truthy and Falsy values

In Python, every value has a boolean meaning. This is used heavily in conditionals.

```python
# Falsy values - evaluate to False in a boolean context
# False, None, 0, 0.0, 0j, "", [], (), {}, set()

# Everything else is Truthy

print(bool(0)) # False
print(bool("")) # False
print(bool([])) # False
print(bool(None)) # False

print(bool(1)) # True
print(bool("hi")) # True
print(bool([0])) # True - list with one item, even if item is 0

# Used in conditions directly
name = ""
if name:
 print(f"Hello, {name}")
else:
 print("No name provided") # this runs because "" is falsy
```

---

## 10. None - The Absence of a Value

`None` is Python's way of saying "nothing", "missing", or "not yet set". It is not zero, not an empty string, not False - it is the intentional absence of a value.

```python
result = None
response = None

print(result) # None
print(type(result)) # <class 'NoneType'>
print(result is None) # True - use 'is' to check for None, not ==
print(result == None) # True - works but not recommended

# Common patterns
def find_student(name, students):
 for s in students:
 if s["name"] == name:
 return s
 return None # explicit: did not find anything

result = find_student("Rohan", [{"name": "Priya"}])
if result is None:
 print("Student not found")

# None as a default parameter (avoids the mutable default trap)
def register(name, courses=None):
 if courses is None:
 courses = []
 courses.append("Python Basics")
 return courses
```

---

## 11. Strings - Complete Guide

A string is a sequence of characters. In Python, strings are **immutable** - once created, they cannot be changed in place. Any operation that seems to modify a string actually creates a new one.

### Creating strings

```python
# Single or double quotes - both identical
name1 = 'Aarav Sharma'
name2 = "Priya Patel"

# Use the other quote type to include quotes inside
sentence1 = "It's a beautiful day in Mumbai."
sentence2 = 'He said "Namaste" to everyone.'

# Escape characters
tab_eg = "Name:\tAarav" # \t = tab
newline = "Line1\nLine2" # \n = newline
backslash = "C:\\Users\\Aarav" # \\ = literal backslash
raw_str = r"C:\Users\Aarav" # r"..." = raw string, no escapes

# Triple quotes - multi-line strings
address = """
123, MG Road,
Koramangala,
Bangalore - 560001
"""

poem = '''
Itna na mujhse tu pyaar badha,
ke main ek rooh awaara tha.
'''
```

### String indexing and slicing

Strings are sequences - each character has a position (index) starting from 0.

```python
city = "Hyderabad"
# 012345678 (positive indices)
# -987654321 (negative indices)

# Indexing
print(city[0]) # H (first character)
print(city[-1]) # d (last character)
print(city[4]) # r
print(city[-4]) # r (same character, from the end)

# Slicing: string[start:stop:step]
# start - inclusive, stop - exclusive
print(city[0:5]) # Hyder (index 0 to 4)
print(city[5:]) # abad (index 5 to end)
print(city[:5]) # Hyder (start to index 4)
print(city[:]) # Hyderabad (full copy)
print(city[::2]) # Hdrbd (every 2nd character)
print(city[::-1]) # darebadyH (reversed)

# Strings are immutable - you cannot change individual characters
city[0] = "h" # TypeError: 'str' object does not support item assignment
```

### String operators

```python
first = "Jai "
second = "Hind"

# Concatenation
print(first + second) # Jai Hind

# Repetition
print("Ha" * 3) # HaHaHa
print("-" * 30) # ------------------------------ (useful for separators)

# Membership
print("Hind" in first + second) # True
print("bye" in first + second) # False
print("bye" not in "Hello") # True
```

### String methods - complete reference

All string methods return a new string. They never modify the original.

#### Case methods

```python
text = " hello, INDIA! "

print(text.upper()) # " HELLO, INDIA! "
print(text.lower()) # " hello, india! "
print(text.title()) # " Hello, India! "
print(text.capitalize()) # " hello, india! " (only first char of whole string)
print(text.swapcase()) # " HELLO, india! "
```

#### Stripping whitespace

```python
text = " Namaste "

print(text.strip()) # "Namaste" (both ends)
print(text.lstrip()) # "Namaste " (left only)
print(text.rstrip()) # " Namaste" (right only)

# Strip specific characters
"***hello***".strip("*") # "hello"
"...ok...".strip(".") # "ok"
```

#### Finding and checking

```python
city = "Bangalore"

print(city.find("gal")) # 3 (index of first occurrence, -1 if not found)
print(city.find("xyz")) # -1
print(city.index("gal")) # 3 (same as find, but raises ValueError if not found)
print(city.count("a")) # 2 (how many times "a" appears)

print(city.startswith("Ban")) # True
print(city.endswith("lore")) # True
print(city.startswith("Mum")) # False

# Type checking methods
print("hello123".isalnum()) # True (only letters and digits)
print("hello".isalpha()) # True (only letters)
print("12345".isdigit()) # True (only digits)
print(" ".isspace()) # True (only whitespace)
print("Hello World".istitle()) # True (title case)
print("HELLO".isupper()) # True
print("hello".islower()) # True
```

#### Replacing and splitting

```python
text = "Mumbai is the financial capital of India"

# Replace all occurrences
print(text.replace("India", "Bharat"))
# "Mumbai is the financial capital of Bharat"

# Replace only first n occurrences
print("aaa".replace("a", "b", 2)) # "bba"

# Split into a list
print(text.split()) # splits on whitespace by default
# ['Mumbai', 'is', 'the', 'financial', 'capital', 'of', 'India']

print(text.split(",")) # split on comma
# ['Mumbai is the financial capital of India'] (no comma, so no split)

csv_line = "Aarav,21,Delhi,Engineering"
print(csv_line.split(","))
# ['Aarav', '21', 'Delhi', 'Engineering']

# Split with limit
print("a:b:c:d".split(":", 2)) # ['a', 'b', 'c:d'] (max 2 splits)

# rsplit - split from the right
print("a:b:c:d".rsplit(":", 1)) # ['a:b:c', 'd']

# splitlines - split on newline characters
lines = "Line1\nLine2\nLine3"
print(lines.splitlines()) # ['Line1', 'Line2', 'Line3']
```

#### Joining

```python
# join - the opposite of split
# join is called on the separator, with the list as the argument
words = ["Jai", "Hind", "Zindabad"]
result = " ".join(words)
print(result) # "Jai Hind Zindabad"

# Join with different separators
print(", ".join(["Delhi", "Mumbai", "Bangalore"]))
# "Delhi, Mumbai, Bangalore"

print("-".join(["2024", "01", "15"]))
# "2024-01-15"

# Join is much faster than concatenation in a loop
# BAD:
sentence = ""
for word in words:
 sentence += word + " "

# GOOD:
sentence = " ".join(words)
```

#### Padding and alignment

```python
text = "Aarav"

print(text.ljust(10)) # "Aarav " (left-aligned, padded to width 10)
print(text.rjust(10)) # " Aarav" (right-aligned)
print(text.center(11)) # " Aarav " (centred)
print(text.center(11, "-")) # "---Aarav---" (centred with fill character)
print("42".zfill(6)) # "000042" (pad with zeros on left)
```

#### Encoding

```python
text = "Namaste"

encoded = text.encode("utf-8") # bytes object: b'Namaste'
decoded = encoded.decode("utf-8") # back to string: "Namaste"
```

### Useful built-in functions for strings

```python
text = "Bangalore"

print(len(text)) # 9 - length
print(min(text)) # 'B' - character with lowest ASCII value
print(max(text)) # 'r' - character with highest ASCII value
print(sorted(text)) # sorted list of characters
print(list(text)) # ['B','a','n','g','a','l','o','r','e']

# ord() and chr() - convert between character and ASCII code
print(ord("A")) # 65
print(ord("a")) # 97
print(chr(65)) # 'A'
print(chr(2309)) # Indian language character (Unicode)
```

### String immutability - understanding what happens

```python
name = "Priya"

# This does NOT modify 'name' - it creates a new string and reassigns the label
name = name.upper()
print(name) # "PRIYA"

# The original string "Priya" is still in memory until garbage collected
# The variable 'name' now points to the new string "PRIYA"

# This is why you must reassign the result
city = "bangalore"
city.title() # does nothing visible
print(city) # still "bangalore"

city = city.title() # now it works
print(city) # "Bangalore"
```

---

## 12. Operators

### Arithmetic operators (covered in Section 7)

```python
print(10 + 3) # 13
print(10 - 3) # 7
print(10 * 3) # 30
print(10 / 3) # 3.333...
print(10 // 3) # 3
print(10 % 3) # 1
print(10 ** 3) # 1000
```

### Comparison operators (covered in Section 9)

```python
print(5 > 3) # True
print(5 < 3) # False
print(5 == 5) # True
print(5 != 3) # True
print(5 >= 5) # True
print(5 <= 4) # False
```

### Logical operators (covered in Section 9)

```python
print(True and False) # False
print(True or False) # True
print(not True) # False
```

### Membership operators

```python
cities = ["Delhi", "Mumbai", "Bangalore"]

print("Mumbai" in cities) # True
print("Chennai" in cities) # False
print("Chennai" not in cities) # True

# Works on strings too
name = "Aarav Sharma"
print("Sharma" in name) # True
print("Patel" not in name) # True
```

### Identity operators

```python
# 'is' checks if two variables point to the SAME object in memory
# '==' checks if two variables have the SAME VALUE

a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b) # True - same value
print(a is b) # False - different objects in memory
print(a is c) # True - same object (c is just another label for a)

# None check - always use 'is', never '=='
result = None
print(result is None) # True - correct way
print(result == None) # True - works but not recommended (PEP 8)
```

### Bitwise operators

Used for binary operations. Less common in everyday code but important for systems programming, flags, and some performance-critical work.

```python
a = 0b1010 # 10 in decimal
b = 0b1100 # 12 in decimal

print(a & b) # 8 AND: 0b1000
print(a | b) # 14 OR: 0b1110
print(a ^ b) # 6 XOR: 0b0110
print(~a) # -11 NOT: flips all bits
print(a << 1) # 20 left shift by 1 (multiply by 2)
print(a >> 1) # 5 right shift by 1 (divide by 2, floor)

# Practical use: check if a number is even or odd
def is_even(n):
 return n & 1 == 0 # last bit is 0 means even

print(is_even(8)) # True
print(is_even(7)) # False
```

### Operator precedence - full order (high to low)

```
1. () Parentheses
2. ** Exponentiation (right to left)
3. +x, -x, ~x Unary plus, minus, bitwise NOT
4. *, /, //, % Multiplication, division, floor div, modulo
5. +, - Addition, subtraction
6. <<, >> Bitwise shift
7. & Bitwise AND
8. ^ Bitwise XOR
9. | Bitwise OR
10. ==, !=, >, >=, <, <=, Comparisons
 is, is not, in, not in
11. not Logical NOT
12. and Logical AND
13. or Logical OR
```

```python
# When in doubt, use parentheses
result = (2 + 3) * (4 - 1) ** 2 # 45 - clear
result = 2 + 3 * 4 - 1 ** 2 # 13 - requires knowing precedence
```

---

## 13. Type Conversion

### Implicit conversion (automatic)

Python automatically converts between compatible types in some operations.

```python
# int + float - > float
result = 5 + 2.0
print(result) # 7.0
print(type(result)) # <class 'float'>

# int + bool - > int
print(10 + True) # 11
print(10 + False) # 10
```

### Explicit conversion (casting)

```python
# int()
print(int(3.9)) # 3 (truncates - does NOT round)
print(int("42")) # 42
print(int(True)) # 1
print(int(False)) # 0
print(int("0xFF", 16)) # 255 (hex string to int)
print(int("1010", 2)) # 10 (binary string to int)

# float()
print(float(5)) # 5.0
print(float("3.14")) # 3.14
print(float("inf")) # inf

# str()
print(str(42)) # "42"
print(str(3.14)) # "3.14"
print(str(True)) # "True"
print(str(None)) # "None"

# bool()
print(bool(0)) # False
print(bool(1)) # True
print(bool("")) # False
print(bool("hello")) # True
print(bool([])) # False
print(bool([1,2])) # True

# Conversion failures - raise ValueError
int("hello") # ValueError: invalid literal for int()
float("abc") # ValueError: could not convert string to float

# Safe conversion pattern
def safe_int(value):
 try:
 return int(value)
 except (ValueError, TypeError):
 return None

print(safe_int("42")) # 42
print(safe_int("hello")) # None
print(safe_int(None)) # None
```

---

## 14. Input and Output

### print() - in depth

```python
# Basic print
print("Hello, Aarav!")

# Multiple values - separated by space by default
print("Name:", "Priya", "Age:", 21)
# Name: Priya Age: 21

# Change separator
print("2024", "01", "15", sep="-") # 2024-01-15
print("Delhi", "Mumbai", sep=" | ") # Delhi | Mumbai

# Change end character (default is newline)
print("Loading", end="")
print("...") # Loading... (on same line)

print("A", end=" ")
print("B", end=" ")
print("C")
# A B C

# Print to a file
with open("output.txt", "w") as f:
 print("Hello, file!", file=f)

# Flush the output buffer immediately (useful for progress indicators)
import time
for i in range(5):
 print(f"\rProgress: {i+1}/5", end="", flush=True)
 time.sleep(0.5)
```

### input() - reading user input

`input()` always returns a string. You must convert it to the appropriate type.

```python
# Basic input
name = input("Enter your name: ")
print(f"Hello, {name}!")

# Convert to number
age = int(input("Enter your age: "))
gpa = float(input("Enter your GPA: "))

# Multiple inputs on one line
x, y = input("Enter two numbers separated by space: ").split()
x, y = int(x), int(y)
print(f"Sum: {x + y}")

# Or in one step
a, b = map(int, input("Enter two integers: ").split())
print(f"Product: {a * b}")

# Input with validation
while True:
 age_str = input("Enter a valid age (0-120): ")
 if age_str.isdigit() and 0 <= int(age_str) <= 120:
 age = int(age_str)
 break
 print("Invalid input. Please try again.")

print(f"Your age is {age}")
```

---

## 15. f-strings and String Formatting

f-strings (formatted string literals, introduced in Python 3.6) are the modern and preferred way to embed values inside strings.

### Basic f-string syntax

```python
name = "Sneha"
score = 91.5
city = "Hyderabad"

print(f"Name: {name}, Score: {score}, City: {city}")
# Name: Sneha, Score: 91.5, City: Hyderabad

# Expressions inside f-strings
print(f"Score in percentage: {score / 100:.1%}")
# Score in percentage: 91.5%

print(f"Double the score: {score * 2}")
# Double the score: 183.0

print(f"Name in uppercase: {name.upper()}")
# Name in uppercase: SNEHA
```

### Number formatting

```python
price = 1234567.89
discount = 0.1825
count = 42

# Thousands separator
print(f"Price: Rs.{price:,}") # Rs.1,234,567.89
print(f"Price: Rs.{price:,.2f}") # Rs.1,234,567.89 (2 decimal places)

# Decimal places
print(f"Pi: {3.14159265:.3f}") # Pi: 3.142
print(f"Pi: {3.14159265:.6f}") # Pi: 3.141593

# Percentage
print(f"Discount: {discount:.1%}") # Discount: 18.3%
print(f"Discount: {discount:.2%}") # Discount: 18.25%

# Integer with padding
print(f"Count: {count:05d}") # Count: 00042
print(f"Count: {count:>10d}") # Count: 42 (right-aligned)
print(f"Count: {count:<10d}") # Count: 42 (left-aligned)
print(f"Count: {count:^10d}") # Count: 42 (centred)

# Scientific notation
print(f"Avogadro: {6.022e23:.3e}") # Avogadro: 6.022e+23
```

### String alignment in f-strings

```python
# Build a formatted table
students = [("Aarav", 88), ("Priya", 92), ("Rohan", 75), ("Sneha", 96)]

print(f"{'Name':<12} {'Score':>6}")
print("-" * 20)
for name, score in students:
 print(f"{name:<12} {score:>6}")
```

```
Name Score
--------------------
Aarav 88
Priya 92
Rohan 75
Sneha 96
```

### Debugging with f-strings (Python 3.8+)

```python
x = 42
y = 3.14

# The = sign prints both the expression and its value
print(f"{x = }") # x = 42
print(f"{y = :.2f}") # y = 3.14
print(f"{x * y = }") # x * y = 131.88
```

### Older formatting methods (still seen in legacy code)

```python
name = "Aarav"
score = 88

# % formatting (old style, avoid in new code)
print("Name: %s, Score: %d" % (name, score))
print("Price: Rs.%.2f" % 1234.567)

# .format() method (Python 3, before f-strings)
print("Name: {}, Score: {}".format(name, score))
print("Name: {0}, Score: {1}".format(name, score))
print("Name: {n}, Score: {s}".format(n=name, s=score))
```

> Use f-strings for all new code. They are faster, more readable, and support the full formatting mini-language.

---

## 16. Practice Questions

Try every question on your own before reading the solutions in Section 17.
Questions are ordered: Easy (1-6), Medium (7-12), Hard (13-18).

---

### Easy

**Q1 - Variables and Types**
Create variables for the following information about a student and print each one with its type.
- Name: "Arjun Verma"
- Age: 20
- CGPA: 8.45
- Is hostel resident: True
- Pending fee: None

Expected output format:
```
Name : Arjun Verma | Type: <class 'str'>
Age : 20 | Type: <class 'int'>
...
```

---

**Q2 - Arithmetic**
A Zomato order has the following details. Calculate and print:
- Subtotal (sum of all item prices)
- Delivery fee (Rs.30 if subtotal < 200, else Rs.0)
- GST at 5% on subtotal
- Grand total (subtotal + delivery fee + GST), rounded to 2 decimal places

```python
item1 = 120 # Masala Dosa
item2 = 80 # Filter Coffee
item3 = 60 # Idli Sambar
```

---

**Q3 - String Basics**
Given the string below, write code to:
- Print the first and last character
- Print the string reversed
- Print the length
- Print the string in title case
- Count how many times the letter 'a' appears (case-insensitive)

```python
text = "incredible india"
```

---

**Q4 - String Methods**
Given the messy name string below, clean it up using string methods:
- Strip leading and trailing whitespace
- Convert to title case
- Replace any double spaces with single spaces
- Check if it starts with "Priya"

```python
name = " priya sharma "
```

---

**Q5 - Type Conversion**
The following variables are all strings (as if read from user input). Convert each to the appropriate type, perform the required operation, and print the result.

```python
price_str = "1299"
quantity_str = "4"
discount_str = "15" # percent
```

- Calculate total price before discount
- Apply the discount
- Print final amount rounded to 2 decimal places

---

**Q6 - Booleans and Operators**
Given the voter eligibility rules (age >= 18 and is_citizen = True and not is_disqualified), write code to check eligibility for three people and print the result.

```python
person1 = {"name": "Aarav", "age": 22, "is_citizen": True, "is_disqualified": False}
person2 = {"name": "Priya", "age": 16, "is_citizen": True, "is_disqualified": False}
person3 = {"name": "Rohan", "age": 30, "is_citizen": False, "is_disqualified": False}
```

---

### Medium

**Q7 - String Slicing**
Given the IFSC code string below, extract and print each component.

```python
ifsc = "SBIN0001234"
# Format: Bank code (4 chars) + '0' + Branch code (6 chars)
```

Expected output:
```
Bank Code : SBIN
Branch Code : 001234
Full IFSC : SBIN0001234
Is valid : True (length must be 11)
```

---

**Q8 - String Operations Pipeline**
Take the raw sentence below and apply the following transformations in order:
1. Strip whitespace
2. Convert to lowercase
3. Replace all commas with spaces
4. Split into words
5. Remove duplicate words while preserving order
6. Join back with a single space
7. Print the result and the word count

```python
sentence = " Delhi, Mumbai, Bangalore, Delhi, Chennai, Mumbai, Hyderabad "
```

---

**Q9 - Number Operations**
Write code to:
- Check if 2024 is a leap year using only arithmetic and logical operators
- Find the sum of digits of the number 987654
- Reverse the digits of 12345 without converting to string
- Find the GCD of 252 and 105 using the math module

---

**Q10 - f-string Formatting**
Given the sales data below, print a formatted table with right-aligned numbers, a thousands separator for revenue, and percentage sign for growth.

```python
data = [
 ("Electronics", 845000, 12.4),
 ("Clothing", 320000, -3.2),
 ("Books", 95000, 8.7),
 ("Home", 210000, 5.1),
 ("Beauty", 145000, 22.8),
]
# Columns: Category, Revenue (Rs.), Growth (%)
```

Expected output:
```
Category Revenue Growth
------------------------------------
Electronics Rs.8,45,000 12.4%
Clothing Rs.3,20,000 -3.2%
...
```

---

**Q11 - Input Validation**
Write a program that:
- Asks the user to enter a mobile number
- Validates it: must be exactly 10 digits, all numeric, and start with 6, 7, 8, or 9
- Keeps asking until a valid number is entered
- Prints "Valid mobile number: XXXXXXXXXX"

(For testing without actual input, write the logic as a function `validate_mobile(number_str)` that returns True or False.)

---

**Q12 - Operator Challenge**
Without using any if statements or loops, write expressions using only operators to:
- Return the absolute value of a number (hint: use `**` and `**0.5`, or think about `abs()`)
- Check if a number is divisible by both 3 and 7
- Extract the tens digit from a 3-digit number (e.g., from 347, get 4)
- Check if a year is a century year (divisible by 100) but not a leap year (not divisible by 400)

```python
num = -42
value = 347
year = 1900
```

---

### Hard

**Q13 - String Parsing**
You are given a raw transaction log string. Parse it and extract the date, transaction ID, amount, and status without using any imports. Then print a clean summary.

```python
log = "TXN|2024-03-15|TXN004521|RS.12500.00|SUCCESS|HDFC|NEFT"
```

Expected output:
```
Date : 2024-03-15
Transaction ID : TXN004521
Amount : Rs.12,500.00
Status : Success
Bank : HDFC
Mode : NEFT
```

---

**Q14 - Caesar Cipher using String Methods**
Write a function `caesar(text, shift)` that encrypts a string by shifting each letter by `shift` positions in the alphabet. Preserve case and leave non-alphabetic characters unchanged. Then write `decrypt(text, shift)` that reverses it.

```python
message = "Namaste, India! Python hai sahi."
shift = 5
encrypted = caesar(message, shift)
decrypted = decrypt(encrypted, shift)

print(f"Original : {message}")
print(f"Encrypted: {encrypted}")
print(f"Decrypted: {decrypted}")
```

---

**Q15 - Number to Words**
Write a function `number_to_words(n)` that converts any integer from 0 to 9999 into its English word form. Use only string operations, arithmetic, and dictionaries.

```python
print(number_to_words(0)) # "zero"
print(number_to_words(15)) # "fifteen"
print(number_to_words(100)) # "one hundred"
print(number_to_words(342)) # "three hundred forty two"
print(number_to_words(1999)) # "one thousand nine hundred ninety nine"
print(number_to_words(9999)) # "nine thousand nine hundred ninety nine"
```

---

**Q16 - String Statistics**
Write a function `text_stats(text)` that analyses a paragraph and returns a dictionary with:
- Total characters (including spaces)
- Total characters (excluding spaces)
- Word count
- Sentence count (count ".", "!", "?")
- Most frequent word (case-insensitive, excluding common words like "the", "a", "is", "in", "of", "and", "to")
- Average word length

```python
para = """
India is a land of diversity. It has many cultures, languages and traditions.
From the mountains of Himalayas to the beaches of Kerala, India is truly incredible.
The people of India are known for their warmth and hospitality.
"""
```

---

**Q17 - Justified Text Formatter**
Write a function `justify(text, width)` that takes a paragraph and reformats it so every line is exactly `width` characters wide (full justification - spaces are distributed evenly between words). The last line of each paragraph is left-aligned.

```python
paragraph = "Python is a high level general purpose programming language known for its simplicity and readability"
width = 40

justify(paragraph, width)
```

Expected output (approximately):
```
Python is a high level general
purpose programming language
known for its simplicity and
readability
```

---

**Q18 - Full Pipeline**
You receive a messy CSV string of student exam records. Write a complete program that:
1. Parses each record into a dictionary
2. Cleans all string fields (strip, title case)
3. Converts numeric fields to correct types
4. Calculates total and percentage (out of 500)
5. Assigns grade: Distinction (>=85%), First Class (>=60%), Pass (>=40%), Fail (<40%)
6. Prints a formatted report
7. Prints summary stats: class average, highest scorer, number of failures

```python
raw_csv = """
name, maths, science, english, history, cs
aarav SHARMA, 88, 92, 85, 78, 95
 PRIYA patel, 55, 48, 62, 50, 58
rohan VERMA, 72, 68, 75, 70, 65
 SNEHA iyer, 95, 98, 92, 88, 97
karan SINGH, 35, 40, 38, 42, 30
meera NAIR, 78, 82, 80, 75, 84
"""
```

---

## 17. Solutions

---

### Q1 - Variables and Types

```python
name = "Arjun Verma"
age = 20
cgpa = 8.45
is_hostel = True
pending_fee = None

fields = [
 ("Name", name),
 ("Age", age),
 ("CGPA", cgpa),
 ("Is hostel resident", is_hostel),
 ("Pending fee", pending_fee),
]

for label, value in fields:
 print(f"{label:<22}: {str(value):<15} | Type: {type(value)}")
```

---

### Q2 - Arithmetic

```python
item1 = 120
item2 = 80
item3 = 60

subtotal = item1 + item2 + item3
delivery_fee = 0 if subtotal >= 200 else 30
gst = subtotal * 0.05
grand_total = round(subtotal + delivery_fee + gst, 2)

print(f"Subtotal : Rs.{subtotal}")
print(f"Delivery fee : Rs.{delivery_fee}")
print(f"GST (5%) : Rs.{gst:.2f}")
print(f"Grand Total : Rs.{grand_total}")
```

---

### Q3 - String Basics

```python
text = "incredible india"

print("First character :", text[0])
print("Last character :", text[-1])
print("Reversed :", text[::-1])
print("Length :", len(text))
print("Title case :", text.title())
print("Count of 'a' :", text.lower().count("a"))
```

---

### Q4 - String Methods

```python
name = " priya sharma "

name = name.strip()
name = name.title()
while " " in name:
 name = name.replace(" ", " ")

print("Cleaned name :", name)
print("Starts with Priya:", name.startswith("Priya"))
```

---

### Q5 - Type Conversion

```python
price_str = "1299"
quantity_str = "4"
discount_str = "15"

price = int(price_str)
quantity = int(quantity_str)
discount = int(discount_str)

subtotal = price * quantity
discount_amount = subtotal * (discount / 100)
final_amount = round(subtotal - discount_amount, 2)

print(f"Subtotal : Rs.{subtotal:,}")
print(f"Discount ({discount}%) : Rs.{discount_amount:,.2f}")
print(f"Final Amount : Rs.{final_amount:,.2f}")
```

---

### Q6 - Booleans and Operators

```python
people = [
 {"name": "Aarav", "age": 22, "is_citizen": True, "is_disqualified": False},
 {"name": "Priya", "age": 16, "is_citizen": True, "is_disqualified": False},
 {"name": "Rohan", "age": 30, "is_citizen": False, "is_disqualified": False},
]

for p in people:
 eligible = (p["age"] >= 18 and
 p["is_citizen"] and
 not p["is_disqualified"])
 status = "Eligible to vote" if eligible else "Not eligible"
 print(f"{p['name']:<8}: {status}")
```

---

### Q7 - String Slicing

```python
ifsc = "SBIN0001234"

bank_code = ifsc[:4]
branch_code = ifsc[5:]
is_valid = len(ifsc) == 11

print(f"Bank Code : {bank_code}")
print(f"Branch Code : {branch_code}")
print(f"Full IFSC : {ifsc}")
print(f"Is valid : {is_valid}")
```

---

### Q8 - String Operations Pipeline

```python
sentence = " Delhi, Mumbai, Bangalore, Delhi, Chennai, Mumbai, Hyderabad "

result = sentence.strip().lower().replace(",", " ")
words = result.split()

seen = []
unique_words = []
for word in words:
 if word not in seen:
 seen.append(word)
 unique_words.append(word)

final = " ".join(unique_words)

print("Result :", final)
print("Word count:", len(unique_words))
```

---

### Q9 - Number Operations

```python
import math

# Leap year check
year = 2024
is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
print(f"{year} is a leap year: {is_leap}")

# Sum of digits of 987654
n = 987654
digit_sum = 0
temp = n
while temp > 0:
 digit_sum += temp % 10
 temp //= 10
print(f"Sum of digits of {n}: {digit_sum}")

# Reverse digits of 12345
num = 12345
reversed_num = 0
temp = num
while temp > 0:
 reversed_num = reversed_num * 10 + temp % 10
 temp //= 10
print(f"Reversed {num}: {reversed_num}")

# GCD
print(f"GCD of 252 and 105: {math.gcd(252, 105)}")
```

---

### Q10 - f-string Formatting

```python
data = [
 ("Electronics", 845000, 12.4),
 ("Clothing", 320000, -3.2),
 ("Books", 95000, 8.7),
 ("Home", 210000, 5.1),
 ("Beauty", 145000, 22.8),
]

print(f"{'Category':<16} {'Revenue':>14} {'Growth':>8}")
print("-" * 42)

for category, revenue, growth in data:
 sign = "+" if growth >= 0 else ""
 print(f"{category:<16} Rs.{revenue:>10,} {sign}{growth:.1f}%")
```

---

### Q11 - Input Validation

```python
def validate_mobile(number_str):
 if len(number_str) != 10:
 return False
 if not number_str.isdigit():
 return False
 if number_str[0] not in "6789":
 return False
 return True

# Test the function
test_numbers = ["9876543210", "1234567890", "8765", "abc1234567", "7000000001"]
for num in test_numbers:
 status = "Valid" if validate_mobile(num) else "Invalid"
 print(f"{num:<15}: {status}")

# For actual use with input():
# while True:
# mobile = input("Enter mobile number: ").strip()
# if validate_mobile(mobile):
# print(f"Valid mobile number: {mobile}")
# break
# print("Invalid. Must be 10 digits starting with 6, 7, 8, or 9.")
```

---

### Q12 - Operator Challenge

```python
num = -42
value = 347
year = 1900

# Absolute value without if
absolute = (num ** 2) ** 0.5
print(f"Absolute value of {num}: {absolute}") # or just abs(num)

# Divisible by both 3 and 7
n = 42
div_3_and_7 = (n % 3 == 0) and (n % 7 == 0)
print(f"{n} divisible by 3 and 7: {div_3_and_7}")

# Extract tens digit from 3-digit number
tens_digit = (value // 10) % 10
print(f"Tens digit of {value}: {tens_digit}")

# Century year but not a leap year
is_century_non_leap = (year % 100 == 0) and (year % 400 != 0)
print(f"{year} is century but not leap: {is_century_non_leap}")
```

---

### Q13 - String Parsing

```python
log = "TXN|2024-03-15|TXN004521|RS.12500.00|SUCCESS|HDFC|NEFT"

parts = log.split("|")
date = parts[1]
txn_id = parts[2]
amount = float(parts[3].replace("RS.", "").replace(",", ""))
status = parts[4].title()
bank = parts[5]
mode = parts[6]

print(f"Date : {date}")
print(f"Transaction ID : {txn_id}")
print(f"Amount : Rs.{amount:,.2f}")
print(f"Status : {status}")
print(f"Bank : {bank}")
print(f"Mode : {mode}")
```

---

### Q14 - Caesar Cipher

```python
def caesar(text, shift):
 result = []
 for char in text:
 if char.isalpha():
 base = ord("A") if char.isupper() else ord("a")
 shifted = chr((ord(char) - base + shift) % 26 + base)
 result.append(shifted)
 else:
 result.append(char)
 return "".join(result)

def decrypt(text, shift):
 return caesar(text, -shift)

message = "Namaste, India! Python hai sahi."
shift = 5
encrypted = caesar(message, shift)
decrypted = decrypt(encrypted, shift)

print(f"Original : {message}")
print(f"Encrypted: {encrypted}")
print(f"Decrypted: {decrypted}")
```

---

### Q15 - Number to Words

```python
def number_to_words(n):
 if n == 0:
 return "zero"

 ones = ["", "one", "two", "three", "four", "five", "six", "seven",
 "eight", "nine", "ten", "eleven", "twelve", "thirteen",
 "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
 tens = ["", "", "twenty", "thirty", "forty", "fifty",
 "sixty", "seventy", "eighty", "ninety"]

 def below_100(num):
 if num < 20:
 return ones[num]
 elif num % 10 == 0:
 return tens[num // 10]
 else:
 return tens[num // 10] + " " + ones[num % 10]

 def below_1000(num):
 if num < 100:
 return below_100(num)
 else:
 rest = num % 100
 hundreds = ones[num // 100] + " hundred"
 if rest == 0:
 return hundreds
 return hundreds + " " + below_100(rest)

 if n < 1000:
 return below_1000(n)
 else:
 thousands = ones[n // 1000] + " thousand"
 rest = n % 1000
 if rest == 0:
 return thousands
 return thousands + " " + below_1000(rest)

print(number_to_words(0))
print(number_to_words(15))
print(number_to_words(100))
print(number_to_words(342))
print(number_to_words(1999))
print(number_to_words(9999))
```

---

### Q16 - String Statistics

```python
def text_stats(text):
 stop_words = {"the", "a", "is", "in", "of", "and", "to", "it",
 "are", "for", "was", "has", "its", "an"}

 total_chars = len(text)
 no_space_chars = len(text.replace(" ", "").replace("\n", ""))
 words = text.split()
 word_count = len(words)
 sentence_count = sum(1 for ch in text if ch in ".!?")

 freq = {}
 for word in words:
 clean = word.strip(".,!?\"'").lower()
 if clean and clean not in stop_words:
 freq[clean] = freq.get(clean, 0) + 1

 most_frequent = max(freq, key=freq.get) if freq else ""
 avg_word_len = round(sum(len(w) for w in words) / word_count, 2) if word_count else 0

 return {
 "total_chars": total_chars,
 "no_space_chars": no_space_chars,
 "word_count": word_count,
 "sentence_count": sentence_count,
 "most_frequent": most_frequent,
 "avg_word_len": avg_word_len,
 }

para = """
India is a land of diversity. It has many cultures, languages and traditions.
From the mountains of Himalayas to the beaches of Kerala, India is truly incredible.
The people of India are known for their warmth and hospitality.
"""

stats = text_stats(para)
for key, value in stats.items():
 print(f"{key:<20}: {value}")
```

---

### Q17 - Justified Text Formatter

```python
def justify(text, width):
 words = text.split()
 lines = []
 current_line = []
 current_len = 0

 for word in words:
 if current_len + len(word) + len(current_line) <= width:
 current_line.append(word)
 current_len += len(word)
 else:
 lines.append(current_line)
 current_line = [word]
 current_len = len(word)
 lines.append(current_line) # last line

 output = []
 for i, line in enumerate(lines):
 if i == len(lines) - 1 or len(line) == 1:
 output.append(" ".join(line))
 else:
 total_chars = sum(len(w) for w in line)
 total_spaces = width - total_chars
 gaps = len(line) - 1
 base_space = total_spaces // gaps
 extra = total_spaces % gaps

 result = ""
 for j, word in enumerate(line):
 result += word
 if j < gaps:
 spaces = base_space + (1 if j < extra else 0)
 result += " " * spaces
 output.append(result)

 for line in output:
 print(line)

paragraph = "Python is a high level general purpose programming language known for its simplicity and readability"
justify(paragraph, 40)
```

---

### Q18 - Full Pipeline

```python
raw_csv = """
name, maths, science, english, history, cs
aarav SHARMA, 88, 92, 85, 78, 95
 PRIYA patel, 55, 48, 62, 50, 58
rohan VERMA, 72, 68, 75, 70, 65
 SNEHA iyer, 95, 98, 92, 88, 97
karan SINGH, 35, 40, 38, 42, 30
meera NAIR, 78, 82, 80, 75, 84
"""

lines = [l for l in raw_csv.strip().split("\n") if l.strip()]
headers = [h.strip() for h in lines[0].split(",")]
subjects = headers[1:]

students = []
for line in lines[1:]:
 parts = [p.strip() for p in line.split(",")]
 record = {
 "name": parts[0].title(),
 "maths": int(parts[1]),
 "science": int(parts[2]),
 "english": int(parts[3]),
 "history": int(parts[4]),
 "cs": int(parts[5]),
 }
 record["total"] = sum(record[s] for s in subjects)
 record["pct"] = round(record["total"] / 500 * 100, 1)

 if record["pct"] >= 85:
 record["grade"] = "Distinction"
 elif record["pct"] >= 60:
 record["grade"] = "First Class"
 elif record["pct"] >= 40:
 record["grade"] = "Pass"
 else:
 record["grade"] = "Fail"

 students.append(record)

# Report
print("=" * 65)
print(f"{'Name':<18} {'Total':>6} {'Pct':>7} {'Grade'}")
print("=" * 65)
for s in students:
 print(f"{s['name']:<18} {s['total']:>6}/500 {s['pct']:>6}% {s['grade']}")

# Summary
print("=" * 65)
avg_pct = round(sum(s["pct"] for s in students) / len(students), 1)
topper = max(students, key=lambda s: s["pct"])
failures = sum(1 for s in students if s["grade"] == "Fail")

print(f"\nClass Average : {avg_pct}%")
print(f"Topper : {topper['name']} ({topper['pct']}%)")
print(f"Failures : {failures}")
```

---

## 18. What Comes Next

Now that you have a solid foundation in Python basics, here is where this fits in the full curriculum:

| Step | Topic | Status |
|---|---|---|
| 1 | Python Basics (this document) | Complete |
| 2 | Python Collections - List, Tuple, Dict, Set, String | Next |
| 3 | Python Loops - for, while, comprehensions | Available |
| 4 | Python Functions - all concepts | Available |
| 5 | NumPy - numerical computing | Available |
| 6 | Pandas - data analysis | Available |
| 7 | Matplotlib - data visualisation | Available |
| 8 | Seaborn - statistical visualisation | Available |

**Before moving to Collections:**
Make sure you are comfortable with:
- Creating and using variables of all basic types
- All string methods and slicing
- Arithmetic and comparison operators
- Type conversion
- f-string formatting
- Boolean logic and truthiness

The collections blog (lists, tuples, dictionaries, sets) builds directly on strings because strings are sequences - everything you learned about indexing and slicing applies there too.

---

*Made with care for Codeverra learners | codeverra.com*
