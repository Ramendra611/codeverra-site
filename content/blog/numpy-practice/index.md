---
title: "Complete Guide to Numpy Library in Python"
description: "Complete practice session on Numpy in python"

date: 2026-03-18
lastmod: 2026-03-18
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python
  - numpy
  - data-analysis


cover:
  image: "images/numpy-practice.png"
  alt: "Python programming"
  caption: "Python syllabus"
  relative: true
  hidden: false
---


# 🔢 NumPy Masterclass and Practice Sheet
### *From Zero to Confident - A Beginner's Guide to Numerical Computing in Python*

---

> **Who is this for?**
> You know Python basics  -  lists, loops, functions  -  and you want to level up into data science.
> NumPy is your first real step. Everything in data science (Pandas, Scikit-learn, TensorFlow) is built on top of it.

---

## 📌 Table of Contents

1. [What is NumPy and Why Should You Care?](#1-what-is-numpy-and-why-should-you-care)
2. [Installing and Importing NumPy](#2-installing-and-importing-numpy)
3. [Creating Arrays](#3-creating-arrays)
4. [Array Attributes](#4-array-attributes)
5. [Indexing and Slicing](#5-indexing-and-slicing)
6. [Array Operations  -  Math Made Easy](#6-array-operations--math-made-easy)
7. [Universal Functions (ufuncs)](#7-universal-functions-ufuncs)
8. [Aggregation Functions](#8-aggregation-functions)
9. [Reshaping and Transposing](#9-reshaping-and-transposing)
10. [Stacking and Splitting Arrays](#10-stacking-and-splitting-arrays)
11. [Boolean Masking and Fancy Indexing](#11-boolean-masking-and-fancy-indexing)
12. [Broadcasting](#12-broadcasting)
13. [Working with Random Numbers](#13-working-with-random-numbers)
14. [Linear Algebra with NumPy](#14-linear-algebra-with-numpy)
15. [Sorting and Searching](#15-sorting-and-searching)
16. [Copies vs Views](#16-copies-vs-views)
17. [Saving and Loading Arrays](#17-saving-and-loading-arrays)
18. [Practice Questions](#18-practice-questions)
19. [What We Covered + What's Next](#19-what-we-covered--whats-next)

---

## 1. What is NumPy and Why Should You Care?

Python lists are flexible and easy to use  -  but they are **slow** when it comes to heavy number crunching. If you have a million exam scores and want to find the average, a Python loop will take noticeably longer than it should.

**NumPy** (Numerical Python) solves this by storing data in tightly packed arrays in memory  -  similar to how C and Fortran work internally. The result? Operations on NumPy arrays can be **10x to 100x faster** than equivalent Python loops.

**NumPy gives you:**

- A powerful `ndarray` object (N-dimensional array)
- Fast mathematical operations on entire arrays at once
- Tools for linear algebra, random number generation, and statistics
- The foundation that Pandas, Matplotlib, and Scikit-learn are all built on

> **Think of it this way:** If Python lists are a notebook, NumPy arrays are a spreadsheet column  -  structured, typed, and ready for bulk operations.

---

## 2. Installing and Importing NumPy

```bash
pip install numpy
```

```python
import numpy as np   # 'np' is the universal alias  -  use this everywhere
```

---

## 3. Creating Arrays

This is where everything starts. NumPy gives you many ways to create arrays depending on what you need.

### 3.1 From a Python List

```python
import numpy as np

# Cricket scores of Virat Kohli in a 5-match series
scores = np.array([82, 45, 110, 67, 93])
print(scores)
# Output: [ 82  45 110  67  93]
```

### 3.2 2D Array (Matrix) from Nested Lists

```python
# Marks of 3 students (Aarav, Priya, Rohan) in 4 subjects
marks = np.array([
    [78, 85, 90, 88],   # Aarav
    [92, 76, 88, 95],   # Priya
    [65, 70, 80, 75]    # Rohan
])
print(marks)
```

### 3.3 Built-in Array Creators

These are shortcuts to generate common arrays quickly.

```python
# All zeros  -  placeholder when you don't have data yet
np.zeros((3, 4))          # 3 rows, 4 columns of 0.0

# All ones  -  useful for initializations
np.ones((2, 3))

# Identity matrix  -  used in linear algebra
np.eye(4)

# Fill with a specific value
np.full((2, 3), 7)        # 2x3 matrix filled with 7

# Range of values (like Python's range, but returns an array)
np.arange(1, 11)          # [1, 2, 3, ..., 10]
np.arange(0, 100, 10)     # [0, 10, 20, ..., 90]

# Evenly spaced values between two points
np.linspace(0, 1, 5)      # [0.0, 0.25, 0.5, 0.75, 1.0]
```

> **`arange` vs `linspace`:** Use `arange` when you know the **step size**. Use `linspace` when you know **how many points** you want.

### 3.4 Array Data Types

NumPy arrays are **typed**  -  every element is the same data type. This is what makes them fast.

```python
# Default type is inferred
a = np.array([1, 2, 3])
print(a.dtype)   # int64

# Specify type explicitly
b = np.array([1.5, 2.5, 3.5], dtype=np.float32)
c = np.array([True, False, True], dtype=bool)

# Convert type
d = a.astype(float)
```

**Common dtypes:** `int32`, `int64`, `float32`, `float64`, `bool`, `str`

---

## 4. Array Attributes

Before doing anything with an array, it helps to inspect it. These attributes tell you everything about the array's structure.

```python
# Monthly rainfall (mm) in major Indian cities
#         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
rainfall = np.array([
    [5,   8,  10,  15,  40, 200, 350, 320, 200,  80,  20,   8],   # Mumbai
    [2,   3,   5,  12,  30, 180, 280, 260, 170,  60,  15,   5],   # Pune
    [10, 12,  20,  25,  60, 100, 120, 110, 100,  50,  30,  15],   # Hyderabad
])

print(rainfall.ndim)    # 2  → number of dimensions
print(rainfall.shape)   # (3, 12) → 3 rows, 12 columns
print(rainfall.size)    # 36 → total number of elements
print(rainfall.dtype)   # int64
print(rainfall.itemsize) # 8 → bytes per element
```

> **`shape` is your most-used attribute.** Always check it before any operation to avoid dimension mismatches.

---

## 5. Indexing and Slicing

Accessing specific elements or sections of an array.

### 5.1 1D Indexing

```python
players = np.array(["Rohit", "Virat", "Shubman", "KL Rahul", "Hardik"])

print(players[0])    # Rohit  (first element)
print(players[-1])   # Hardik (last element)
print(players[1:4])  # ['Virat', 'Shubman', 'KL Rahul']
print(players[::2])  # Every 2nd: ['Rohit', 'Shubman', 'Hardik']
```

### 5.2 2D Indexing

For 2D arrays, think of it as `[row, column]`.

```python
marks = np.array([
    [78, 85, 90, 88],   # Aarav
    [92, 76, 88, 95],   # Priya
    [65, 70, 80, 75]    # Rohan
])

print(marks[0, 0])    # 78   -  Aarav's first subject
print(marks[1, 3])    # 95   -  Priya's fourth subject
print(marks[2, :])    # [65 70 80 75]  -  Rohan's all marks (entire row)
print(marks[:, 1])    # [85 76 70]  -  All students' second subject (entire column)
print(marks[0:2, 1:3]) # Rows 0-1, Columns 1-2 (submatrix)
```

### 5.3 Modifying Elements

```python
marks[0, 0] = 80   # Update Aarav's first mark to 80
marks[2, :] = [70, 75, 85, 80]   # Replace Rohan's entire row
```

---

## 6. Array Operations  -  Math Made Easy

One of NumPy's biggest strengths: operations apply to **every element at once**, no loops needed.

### 6.1 Element-wise Arithmetic

```python
# Temperature in Celsius for Delhi, Mumbai, Bangalore, Chennai, Kolkata
temp_c = np.array([32.5, 28.0, 22.0, 35.0, 30.0])

# Convert all to Fahrenheit in one line
temp_f = (temp_c * 9/5) + 32
print(temp_f)
# [90.5  82.4  71.6  95.   86. ]
```

```python
# IPL ticket prices before and after 10% GST
base_prices = np.array([500, 1000, 1500, 3000, 5000])
after_gst   = base_prices * 1.10
print(after_gst)
# [ 550. 1100. 1650. 3300. 5500.]
```

### 6.2 Array-to-Array Operations

```python
# Test 1 and Test 2 scores for 5 students
test1 = np.array([45, 60, 55, 70, 80])
test2 = np.array([50, 58, 62, 65, 75])

total  = test1 + test2
diff   = test2 - test1
avg    = (test1 + test2) / 2

print("Total:", total)
print("Difference:", diff)
print("Average:", avg)
```

> **Key rule:** Operations between two arrays work **element-by-element**. Both arrays must have compatible shapes.

### 6.3 Comparison Operators

```python
scores = np.array([45, 60, 72, 55, 88, 91, 38])

print(scores > 60)    # [False  False   True  False   True   True  False]
print(scores == 55)   # [False  False  False   True  False  False  False]
```

---

## 7. Universal Functions (ufuncs)

NumPy's built-in mathematical functions that operate element-wise on arrays. Much faster than applying `math` module functions in a loop.

```python
distances_km = np.array([120.5, 345.0, 78.3, 560.0])

# Square root of each element
print(np.sqrt(distances_km))

# Absolute value
errors = np.array([-2.5, 3.1, -0.8, 4.4])
print(np.abs(errors))

# Power
np.power(np.array([2, 3, 4]), 2)   # [4, 9, 16]

# Rounding
np.round(np.array([2.456, 3.891, 1.234]), 2)  # [2.46 3.89 1.23]

# Floor and ceiling
np.floor(np.array([2.7, 3.1, 4.9]))  # [2. 3. 4.]
np.ceil(np.array([2.1, 3.0, 4.2]))   # [3. 3. 5.]
```

### Trigonometric and Logarithmic

```python
angles = np.array([0, 30, 45, 60, 90])
radians = np.deg2rad(angles)

np.sin(radians)
np.cos(radians)

# Logarithms
revenues = np.array([1000, 5000, 25000, 100000])
np.log(revenues)    # Natural log
np.log10(revenues)  # Base-10 log
np.log2(revenues)   # Base-2 log

# Exponential
np.exp(np.array([1, 2, 3]))   # [e^1, e^2, e^3]
```

---

## 8. Aggregation Functions

Aggregation functions **summarize** an entire array (or along an axis) into a single value.

```python
# Monthly sales (in ₹ lakhs) for a shop in Bengaluru
monthly_sales = np.array([12.5, 15.0, 9.8, 18.2, 22.0, 16.5,
                           20.1, 19.4, 14.3, 17.8, 25.0, 30.0])

print("Total Sales:  ₹", np.sum(monthly_sales), "L")
print("Average:      ₹", np.mean(monthly_sales), "L")
print("Median:       ₹", np.median(monthly_sales), "L")
print("Std Dev:       ", np.std(monthly_sales))
print("Variance:      ", np.var(monthly_sales))
print("Max Month:    ₹", np.max(monthly_sales), "L")
print("Min Month:    ₹", np.min(monthly_sales), "L")
print("Range:        ₹", np.ptp(monthly_sales), "L")   # peak-to-peak
```

### Aggregation Along Axes (2D)

When you have a 2D array, you can aggregate **across rows** or **down columns** using the `axis` parameter.

```python
# Quarterly scores of 4 sales reps in Jaipur office
#          Q1   Q2   Q3   Q4
sales = np.array([
    [120, 135, 110, 145],   # Anjali
    [98,  105, 120, 130],   # Deepak
    [140, 150, 138, 160],   # Meera
    [88,   92,  95, 105],   # Suresh
])

# axis=0 → collapse rows → result has one value per COLUMN
print("Best per quarter:", np.max(sales, axis=0))   # [140 150 138 160]

# axis=1 → collapse columns → result has one value per ROW
print("Each rep's total:", np.sum(sales, axis=1))   # [510 453 588 380]
print("Each rep's avg:  ", np.mean(sales, axis=1))
```

> **Axis rule:** `axis=0` works **down the rows** (per column). `axis=1` works **across columns** (per row).
> A good trick: `axis=0` reduces the array by its first dimension.

---

## 9. Reshaping and Transposing

Sometimes you need to change the **shape** of an array without changing its data.

### 9.1 reshape()

```python
# Sensor readings from 12 checkpoints, taken in sequence
readings = np.arange(1, 13)
print(readings)   # [ 1  2  3  4  5  6  7  8  9 10 11 12]

# Reshape into 3 rows x 4 columns
grid = readings.reshape(3, 4)
print(grid)
# [[ 1  2  3  4]
#  [ 5  6  7  8]
#  [ 9 10 11 12]]

# Use -1 to let NumPy infer one dimension automatically
readings.reshape(4, -1)   # 4 rows, NumPy figures out columns = 3
readings.reshape(-1, 6)   # NumPy figures out rows = 2, 6 columns
```

### 9.2 flatten() and ravel()

Both convert a multi-dimensional array into 1D.

```python
grid = np.array([[1, 2, 3], [4, 5, 6]])

flat = grid.flatten()   # Returns a copy
rav  = grid.ravel()     # Returns a view (faster, be careful with modification)
```

### 9.3 Transpose

Flips rows and columns. Common in matrix math and data prep.

```python
# 3 students x 4 subjects → transpose to 4 subjects x 3 students
marks = np.array([[78, 85, 90, 88],
                  [92, 76, 88, 95],
                  [65, 70, 80, 75]])

print(marks.shape)       # (3, 4)
print(marks.T.shape)     # (4, 3)
print(marks.T)
```

### 9.4 expand_dims() and squeeze()

```python
a = np.array([1, 2, 3])          # shape: (3,)

b = np.expand_dims(a, axis=0)    # shape: (1, 3)  -  adds a row dimension
c = np.expand_dims(a, axis=1)    # shape: (3, 1)  -  adds a column dimension

d = np.squeeze(b)                # shape: (3,)   -  removes size-1 dimensions
```

---

## 10. Stacking and Splitting Arrays

### 10.1 Stacking  -  Combining Arrays

```python
# Marks from two class sections
section_a = np.array([[78, 85], [92, 76]])
section_b = np.array([[88, 91], [70, 80]])

# Vertical stack  -  add more rows
combined_v = np.vstack([section_a, section_b])
print(combined_v.shape)   # (4, 2)

# Horizontal stack  -  add more columns
combined_h = np.hstack([section_a, section_b])
print(combined_h.shape)   # (2, 4)

# np.concatenate  -  explicit and flexible
np.concatenate([section_a, section_b], axis=0)  # same as vstack
np.concatenate([section_a, section_b], axis=1)  # same as hstack
```

### 10.2 Splitting  -  Breaking Arrays Apart

```python
data = np.arange(1, 13).reshape(4, 3)

# Split into equal parts along rows
parts = np.vsplit(data, 2)     # 2 parts of 2 rows each
print(parts[0])
print(parts[1])

# Split at specific indices
top, bottom = np.split(data, [2], axis=0)   # first 2 rows vs last 2 rows
```

---

## 11. Boolean Masking and Fancy Indexing

These are powerful techniques to **filter** and **select** data without writing loops.

### 11.1 Boolean Masking

```python
# AQI readings across 10 Indian cities
cities = np.array(["Delhi", "Mumbai", "Lucknow", "Chennai", "Kanpur",
                   "Agra", "Bangalore", "Hyderabad", "Patna", "Ahmedabad"])
aqi    = np.array([312, 98, 280, 75, 320, 290, 65, 88, 305, 210])

# Create a boolean mask
poor_air = aqi > 200
print(poor_air)
# [ True False  True False  True  True False False  True  True]

# Use mask to filter
print(cities[poor_air])
# ['Delhi' 'Lucknow' 'Kanpur' 'Agra' 'Patna' 'Ahmedabad']
print(aqi[poor_air])
# [312 280 320 290 305 210]

# Combine conditions
moderate = (aqi >= 100) & (aqi <= 200)
print(cities[moderate])   # ['Ahmedabad']

# NOT operator
good_air_cities = cities[~poor_air]
```

### 11.2 np.where()

`np.where` is like a vectorized `if-else`  -  apply a label or value based on a condition.

```python
# Grade students based on marks
marks = np.array([45, 72, 88, 55, 91, 38, 65])

grade = np.where(marks >= 60, "Pass", "Fail")
print(grade)
# ['Fail' 'Pass' 'Pass' 'Fail' 'Pass' 'Fail' 'Pass']

# Nested where for multiple categories
category = np.where(marks >= 80, "Distinction",
           np.where(marks >= 60, "Pass", "Fail"))
print(category)
# ['Fail' 'Pass' 'Distinction' 'Fail' 'Distinction' 'Fail' 'Pass']
```

### 11.3 Fancy Indexing

Select multiple specific elements using an index array.

```python
ipl_teams = np.array(["CSK", "MI", "RCB", "KKR", "DC", "SRH", "PBKS", "RR"])

# Select specific teams by index
selected = ipl_teams[[0, 2, 5]]   # CSK, RCB, SRH
print(selected)

# Select elements from 2D array
marks = np.array([[78, 85, 90],
                  [92, 76, 88],
                  [65, 70, 80]])

# Pick (row 0, col 2), (row 1, col 0), (row 2, col 1)
print(marks[[0, 1, 2], [2, 0, 1]])   # [90, 92, 70]
```

---

## 12. Broadcasting

Broadcasting is how NumPy handles operations between arrays of **different shapes**. Instead of raising an error, NumPy "stretches" the smaller array to match the larger one  -  without actually copying data.

### Simple Example

```python
prices = np.array([100, 200, 300, 400])

# Add ₹50 to all prices  -  the scalar 50 is broadcast across the array
discounted = prices - 50
print(discounted)   # [ 50 150 250 350]
```

### 2D Example

```python
# Base salaries of 4 employees in Pune
base_salary = np.array([40000, 55000, 70000, 90000])   # shape: (4,)

# Monthly bonuses for 3 months
monthly_bonus = np.array([5000, 7000, 10000]).reshape(3, 1)   # shape: (3, 1)

# Broadcasting: (3, 1) broadcasts with (4,) → result is (3, 4)
total = base_salary + monthly_bonus
print(total)
# Each row = that month's total (base + bonus) for all 4 employees
```

### Broadcasting Rules

Two dimensions are **compatible** if:
1. They are equal, OR
2. One of them is 1

NumPy compares shapes from the **trailing (rightmost) dimension** backwards.

```
Array A: (3, 4)
Array B:    (4,)  → treated as (1, 4) → broadcast to (3, 4) ✅

Array A: (3, 4)
Array B: (3, 1)   → broadcast to (3, 4) ✅

Array A: (3, 4)
Array B: (3, 3)   → 4 ≠ 3 and neither is 1 → ❌ Error
```

---

## 13. Working with Random Numbers

`np.random` is used for simulations, generating test data, and probabilistic modeling.

```python
rng = np.random.default_rng(seed=42)   # Seed for reproducibility
```

### Generating Random Arrays

```python
# Random floats between 0 and 1
rng.random(5)

# Random integers (e.g., simulate dice rolls)
rng.integers(1, 7, size=10)   # 10 rolls of a dice

# Random floats in a range  -  simulate stock prices
rng.uniform(low=100, high=500, size=8)
```

### Sampling from Distributions

```python
# Normal distribution  -  e.g., heights of students in Mumbai
heights = rng.normal(loc=165, scale=10, size=1000)   # mean=165cm, std=10cm
print(f"Mean: {heights.mean():.1f}, Std: {heights.std():.1f}")

# Binomial  -  simulate 50 coin flips (10 times)
rng.binomial(n=50, p=0.5, size=10)

# Poisson  -  number of customers arriving at a Hyderabad store per hour
rng.poisson(lam=15, size=24)   # 24 hours

# Exponential
rng.exponential(scale=2.0, size=100)
```

### Random Sampling and Shuffling

```python
players = np.array(["Rohit", "Virat", "Dhoni", "Bumrah", "Jadeja",
                    "Ashwin", "Pant", "Shubman", "Surya", "Hardik", "Siraj"])

# Pick 4 players randomly
rng.choice(players, size=4, replace=False)

# Shuffle in-place
rng.shuffle(players)
print(players)
```

---

## 14. Linear Algebra with NumPy

`np.linalg` provides core linear algebra operations. This section is especially important if you're heading toward machine learning.

### 14.1 Matrix Multiplication

```python
# Marks matrix: 3 students x 3 subjects
marks = np.array([[80, 75, 90],
                  [70, 85, 95],
                  [60, 65, 70]])

# Weight matrix: importance of each subject
weights = np.array([[0.3],
                    [0.3],
                    [0.4]])

# Weighted scores for each student
weighted = marks @ weights   # @ is the matrix multiplication operator
print(weighted)
```

```python
# np.dot  -  same as @ for 2D arrays
result = np.dot(marks, weights)
```

### 14.2 Determinant and Inverse

```python
A = np.array([[2, 1],
              [5, 3]])

det = np.linalg.det(A)
print("Determinant:", det)   # 1.0

inv = np.linalg.inv(A)
print("Inverse:\n", inv)

# Verify: A @ A_inv should be the identity matrix
print(np.round(A @ inv))
```

### 14.3 Solving Linear Equations

```python
# System of equations:
# 2x + y = 8
# 5x + 3y = 21
A = np.array([[2, 1],
              [5, 3]])
b = np.array([8, 21])

solution = np.linalg.solve(A, b)
print("x =", solution[0], ", y =", solution[1])   # x = 3.0, y = 2.0
```

### 14.4 Eigenvalues and Norms

```python
M = np.array([[4, 2],
              [1, 3]])

eigenvalues, eigenvectors = np.linalg.eig(M)
print("Eigenvalues:", eigenvalues)

# Vector norm (magnitude)
v = np.array([3, 4])
print("L2 norm:", np.linalg.norm(v))   # 5.0

# Matrix norm
print("Matrix norm:", np.linalg.norm(M))
```

---

## 15. Sorting and Searching

### 15.1 Sorting

```python
# District-wise rainfall (mm) during monsoon
rainfall = np.array([320, 185, 450, 275, 510, 390, 220])

# Returns a sorted copy (original unchanged)
sorted_rain = np.sort(rainfall)
print(sorted_rain)   # [185 220 275 320 390 450 510]

# Sort in descending order
print(np.sort(rainfall)[::-1])

# Sort in-place (modifies original)
rainfall.sort()
```

### 15.2 argsort()  -  Indices of Sorted Order

Very useful when you want to rank items.

```python
players  = np.array(["Rohit", "Virat", "Shubman", "Dhoni", "Jadeja"])
centuries = np.array([45, 80, 12, 70, 3])

# Get indices that would sort the array
order = np.argsort(centuries)[::-1]   # descending
print(players[order])     # ['Virat' 'Dhoni' 'Rohit' 'Shubman' 'Jadeja']
print(centuries[order])   # [80 70 45 12  3]
```

### 15.3 Searching

```python
aqi = np.array([312, 98, 280, 75, 320, 290, 65, 88])

# Index of the minimum/maximum element
print(np.argmin(aqi))   # 6 (AQI = 65)
print(np.argmax(aqi))   # 4 (AQI = 320)

# All indices where condition is True
print(np.where(aqi > 200))   # (array([0, 2, 4, 5]),)

# Check if any/all elements satisfy condition
print(np.any(aqi > 300))    # True
print(np.all(aqi > 50))     # True
```

---

## 16. Copies vs Views

This is one of the most common sources of bugs for beginners. Understanding this will save you a lot of headaches.

### The Problem

```python
original = np.array([10, 20, 30, 40, 50])

# SLICE = VIEW (points to same memory)
view = original[1:4]
view[0] = 999
print(original)   # [10 999  30  40  50] ← original was CHANGED!
```

```python
# COPY = independent (different memory)
original = np.array([10, 20, 30, 40, 50])
copy = original[1:4].copy()
copy[0] = 999
print(original)   # [10  20  30  40  50] ← original is SAFE
```

### How to Check

```python
a = np.array([1, 2, 3])
b = a[:]        # view
c = a.copy()    # copy

print(b.base is a)   # True  → b is a view of a
print(c.base is a)   # False → c is independent
```

> **Rule of thumb:** If you plan to modify a slice and don't want to affect the original, always call `.copy()`.

---

## 17. Saving and Loading Arrays

```python
scores = np.array([82, 45, 110, 67, 93])

# Save single array to .npy file (binary format)
np.save("kohli_scores.npy", scores)

# Load it back
loaded = np.load("kohli_scores.npy")
print(loaded)

# Save multiple arrays to a .npz file
marks_2023 = np.array([78, 85, 90])
marks_2024 = np.array([82, 79, 95])
np.savez("student_marks.npz", year2023=marks_2023, year2024=marks_2024)

# Load npz
data = np.load("student_marks.npz")
print(data["year2023"])
print(data["year2024"])

# Save as plain text (CSV-compatible)
matrix = np.array([[1, 2, 3], [4, 5, 6]])
np.savetxt("matrix.csv", matrix, delimiter=",", fmt="%d")
loaded_matrix = np.loadtxt("matrix.csv", delimiter=",")
```

---

## 18. Practice Questions

Test yourself. Try to solve these without looking at the solutions first.

---

**Q1  -  Array Creation**
Create a NumPy array of the first 20 odd numbers. Then reshape it into a 4×5 matrix.

---

**Q2  -  Slicing**
Given the array below (representing daily temperatures in Delhi for a week), extract temperatures from Tuesday to Friday.
```python
temps = np.array([22, 25, 27, 24, 26, 23, 28])
# Mon  Tue  Wed  Thu  Fri  Sat  Sun
```

---

**Q3  -  Broadcasting**
You have the base price of 5 products on Flipkart. Apply a 12% GST to all prices using a single operation (no loops).
```python
base_prices = np.array([299, 499, 1299, 2499, 9999])
```

---

**Q4  -  Boolean Masking**
Given a list of student names and their marks, print the names of students who scored above 70.
```python
names = np.array(["Aarav", "Priya", "Rohan", "Sneha", "Karan"])
marks = np.array([65, 82, 58, 91, 74])
```

---

**Q5  -  Aggregation with Axis**
You have quarterly revenue (₹ crore) for 3 branches (Delhi, Mumbai, Hyderabad) over 4 quarters. Find:
- Total annual revenue per branch
- Best performing quarter across all branches
```python
revenue = np.array([
    [45, 52, 48, 60],   # Delhi
    [38, 41, 55, 62],   # Mumbai
    [30, 35, 40, 45],   # Hyderabad
])
```

---

**Q6  -  argsort Ranking**
Given IPL teams and their win counts this season, print team names ranked from most wins to fewest.
```python
teams = np.array(["CSK", "MI", "RCB", "KKR", "DC"])
wins  = np.array([9, 7, 5, 10, 6])
```

---

**Q7  -  np.where**
Given AQI readings for 8 cities, create a label array: "Good" (AQI < 100), "Moderate" (100–200), "Poor" (> 200).
```python
aqi = np.array([65, 145, 312, 88, 220, 175, 55, 280])
```

---

**Q8  -  Linear Algebra**
Solve the following system of equations using `np.linalg.solve`:
```
3x + 2y = 16
x  + 4y = 14
```

---

**Q9  -  Random Simulation**
Simulate the scores of 500 students in an exam where scores follow a normal distribution with mean = 68 and standard deviation = 12. Then find:
- How many students scored above 80
- The percentage of students who failed (scored below 40)

---

**Q10  -  Copies vs Views**
Predict the output of the following code **before** running it:
```python
a = np.array([1, 2, 3, 4, 5])
b = a[2:]
b[0] = 99
print(a)
```
Then fix it so that modifying `b` does not affect `a`.

---

**Q11  -  Stacking**
You have exam marks from two different test dates for the same 4 students. Stack them vertically and horizontally and explain the shape of each result.
```python
test1 = np.array([[55, 70], [80, 65]])
test2 = np.array([[60, 72], [85, 68]])
```

---

**Q12  -  Rainfall Analysis**
Use the rainfall data below to answer:
- Which month had the highest average rainfall across all cities?
- Which city had the most total annual rainfall?
```python
# Months: Jan–Dec | Cities: Delhi, Mumbai, Kolkata
rainfall = np.array([
    [20,  25,  18,  10,   5, 180, 220, 200, 120,  30,   5,  10],
    [ 5,   8,  10,  15,  40, 200, 350, 320, 200,  80,  20,   8],
    [10,  15,  20,  40,  80, 250, 380, 360, 250, 120,  30,  15],
])
```

---

**Q13  -  Normalization**
Normalize the following array of house prices (in ₹ lakhs) to a 0–1 scale using min-max normalization:
`normalized = (x - min) / (max - min)`
```python
prices = np.array([25, 45, 60, 80, 35, 120, 55])
```

---

**Q14  -  Matrix Operations**
Create a 4×4 matrix with values from 1 to 16. Then:
- Extract the diagonal
- Find the trace (sum of diagonal)
- Replace all even numbers with 0

---

**Q15  -  Full Pipeline**
You are given marks of 6 students across 5 subjects. Write NumPy code to:
1. Calculate each student's total and average
2. Find the class topper (highest average)
3. Find subjects where the class average is below 65
4. Give "Scholarship" to students with average ≥ 80 and "Regular" to others

```python
student_names = np.array(["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"])
marks = np.array([
    [78, 85, 90, 88, 92],
    [92, 76, 88, 95, 80],
    [65, 70, 60, 75, 68],
    [88, 91, 85, 90, 94],
    [55, 60, 58, 62, 70],
    [82, 88, 79, 85, 91],
])
```

---

## 19. What We Covered + What's Next

### ✅ What This Masterclass Covered

| Section | Topics |
|---|---|
| Array Basics | Creating arrays, data types, built-in creators |
| Array Properties | `shape`, `ndim`, `size`, `dtype`, `itemsize` |
| Indexing & Slicing | 1D/2D indexing, modifying elements |
| Math Operations | Element-wise, array-to-array, comparisons |
| Universal Functions | sqrt, abs, log, exp, trig functions |
| Aggregation | sum, mean, median, std, min, max with axis |
| Reshaping | reshape, flatten, ravel, transpose, expand_dims |
| Stacking & Splitting | vstack, hstack, concatenate, split |
| Boolean Masking | Filtering arrays, np.where for conditional values |
| Fancy Indexing | Index arrays, multi-dim selection |
| Broadcasting | Shape compatibility rules, real-world use cases |
| Random Numbers | Distributions, sampling, shuffling, seeding |
| Linear Algebra | Matrix multiply, inverse, solve, eigenvalues, norms |
| Sorting & Searching | sort, argsort, argmin/max, any/all |
| Copies vs Views | Memory behavior, when to use `.copy()` |
| File I/O | save, load, savez, savetxt, loadtxt |

---

### 🚀 What to Explore Next

If this masterclass felt comfortable, here's where to go next:

**1. Pandas**
The next layer on top of NumPy. Pandas adds labels (column names, row indices), handles missing data, and makes tabular data analysis much more convenient. Every data analyst uses it daily.

**2. Matplotlib & Seaborn**
Visualize your NumPy and Pandas data. Histograms, scatter plots, heatmaps, line charts  -  all powered by arrays underneath.

**3. Structured Arrays**
NumPy supports arrays where each column can have a different dtype (like a lightweight table). Useful for low-memory work.

**4. NumPy Memory Layout (Advanced)**
Understanding `C-order` vs `F-order`, memory contiguity, and how strides work. Important for performance-critical code.

**5. Scikit-learn**
Machine learning library that expects NumPy arrays as input. Once you're comfortable with array math, the transition to ML is much smoother.

**6. SciPy**
Built on top of NumPy. Adds advanced scientific computing  -  integration, optimization, signal processing, statistics.

---

> **Final thought:**
> NumPy's real power isn't any single function  -  it's the **mindset shift** from "loop over every element" to "operate on the whole array at once." The more naturally you think in arrays, the faster and cleaner your data code becomes.
>
> Keep practicing. The practice questions above are your gym. 💪

---

---

## 20. Practice Question Solutions

---

### Q1 -- Array Creation

```python
import numpy as np

# First 20 odd numbers: 1, 3, 5, ..., 39
odd_numbers = np.arange(1, 40, 2)
print(odd_numbers)
# [ 1  3  5  7  9 11 13 15 17 19 21 23 25 27 29 31 33 35 37 39]

matrix = odd_numbers.reshape(4, 5)
print(matrix)
# [[ 1  3  5  7  9]
#  [11 13 15 17 19]
#  [21 23 25 27 29]
#  [31 33 35 37 39]]
```

---

### Q2 -- Slicing

```python
temps = np.array([22, 25, 27, 24, 26, 23, 28])
# Mon  Tue  Wed  Thu  Fri  Sat  Sun
# idx:  0    1    2    3    4    5    6

# Tuesday is index 1, Friday is index 4 (inclusive), so slice [1:5]
tue_to_fri = temps[1:5]
print(tue_to_fri)
# [25 27 24 26]
```

---

### Q3 -- Broadcasting

```python
base_prices = np.array([299, 499, 1299, 2499, 9999])

# Multiply entire array by 1.12 in one operation -- no loop needed
after_gst = np.round(base_prices * 1.12, 2)
print(after_gst)
# [  334.88   558.88  1454.88  2798.88 11198.88]
```

---

### Q4 -- Boolean Masking

```python
names = np.array(["Aarav", "Priya", "Rohan", "Sneha", "Karan"])
marks = np.array([65, 82, 58, 91, 74])

mask = marks > 70
print(names[mask])
# ['Priya' 'Sneha' 'Karan']
```

---

### Q5 -- Aggregation with Axis

```python
revenue = np.array([
    [45, 52, 48, 60],   # Delhi
    [38, 41, 55, 62],   # Mumbai
    [30, 35, 40, 45],   # Hyderabad
])

# axis=1 collapses columns --> one total per row (per branch)
branch_totals = np.sum(revenue, axis=1)
print("Annual revenue per branch:", branch_totals)
# [205 196 150]
# Delhi: 205, Mumbai: 196, Hyderabad: 150

# axis=0 collapses rows --> one value per column (per quarter)
best_quarter_idx = np.argmax(np.sum(revenue, axis=0))
print("Best quarter:", best_quarter_idx + 1)
# Quarter 4 (index 3) had the highest combined revenue
```

---

### Q6 -- argsort Ranking

```python
teams = np.array(["CSK", "MI", "RCB", "KKR", "DC"])
wins  = np.array([9, 7, 5, 10, 6])

# argsort gives indices that would sort the array ascending
# [::-1] reverses to descending order
ranked_idx = np.argsort(wins)[::-1]

print("Teams ranked by wins:")
for i, idx in enumerate(ranked_idx, start=1):
    print(f"  {i}. {teams[idx]} -- {wins[idx]} wins")
# 1. KKR -- 10 wins
# 2. CSK -- 9 wins
# 3. MI  -- 7 wins
# 4. DC  -- 6 wins
# 5. RCB -- 5 wins
```

---

### Q7 -- np.where

```python
aqi = np.array([65, 145, 312, 88, 220, 175, 55, 280])

labels = np.where(aqi < 100, "Good",
         np.where(aqi <= 200, "Moderate", "Poor"))

print(labels)
# ['Good' 'Moderate' 'Poor' 'Good' 'Poor' 'Moderate' 'Good' 'Poor']
```

---

### Q8 -- Linear Algebra

```python
# 3x + 2y = 16
#  x + 4y = 14

A = np.array([[3, 2],
              [1, 4]])
b = np.array([16, 14])

solution = np.linalg.solve(A, b)
print(f"x = {solution[0]}, y = {solution[1]}")
# x = 3.0, y = 2.75

# Verify
print(np.allclose(A @ solution, b))   # True
```

---

### Q9 -- Random Simulation

```python
rng = np.random.default_rng(seed=42)

scores = rng.normal(loc=68, scale=12, size=500)

above_80 = np.sum(scores > 80)
print(f"Students who scored above 80: {above_80}")

failed_pct = np.sum(scores < 40) / 500 * 100
print(f"Percentage who failed: {failed_pct:.1f}%")

# Note: exact numbers vary slightly with seed, but expected values are:
# above 80 --> roughly 13-15% of 500 (~65-75 students)
# below 40 --> roughly 1-2% of 500 (~5-10 students)
```

---

### Q10 -- Copies vs Views

```python
a = np.array([1, 2, 3, 4, 5])
b = a[2:]
b[0] = 99
print(a)
# Output: [ 1  2 99  4  5]
# b is a VIEW of a -- modifying b modifies the original array too
```

Fix by using `.copy()`:

```python
a = np.array([1, 2, 3, 4, 5])
b = a[2:].copy()   # now b is an independent copy
b[0] = 99
print(a)   # [ 1  2  3  4  5] -- original is unchanged
print(b)   # [99  4  5]
```

---

### Q11 -- Stacking

```python
test1 = np.array([[55, 70], [80, 65]])
test2 = np.array([[60, 72], [85, 68]])

# Vertical stack -- adds more rows
v = np.vstack([test1, test2])
print("vstack shape:", v.shape)   # (4, 2) -- 4 rows, 2 columns
print(v)
# [[55 70]
#  [80 65]
#  [60 72]
#  [85 68]]

# Horizontal stack -- adds more columns
h = np.hstack([test1, test2])
print("hstack shape:", h.shape)   # (2, 4) -- 2 rows, 4 columns
print(h)
# [[55 70 60 72]
#  [80 65 85 68]]
```

---

### Q12 -- Rainfall Analysis

```python
# Cities: Delhi (row 0), Mumbai (row 1), Kolkata (row 2)
# Months: Jan (col 0) to Dec (col 11)

rainfall = np.array([
    [20,  25,  18,  10,   5, 180, 220, 200, 120,  30,   5,  10],
    [ 5,   8,  10,  15,  40, 200, 350, 320, 200,  80,  20,   8],
    [10,  15,  20,  40,  80, 250, 380, 360, 250, 120,  30,  15],
])

months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
cities = ["Delhi", "Mumbai", "Kolkata"]

# Monthly average across all cities (axis=0 averages across rows)
monthly_avg   = np.mean(rainfall, axis=0)
wettest_month = np.argmax(monthly_avg)
print(f"Wettest month: {months[wettest_month]}")
# July (index 6)

# Total annual rainfall per city (axis=1 sums across columns)
annual_totals = np.sum(rainfall, axis=1)
wettest_city  = np.argmax(annual_totals)
print(f"Most rainfall: {cities[wettest_city]} ({annual_totals[wettest_city]} mm)")
# Kolkata
```

---

### Q13 -- Normalization

```python
prices = np.array([25, 45, 60, 80, 35, 120, 55])

min_price    = np.min(prices)
max_price    = np.max(prices)
normalized   = (prices - min_price) / (max_price - min_price)

print(np.round(normalized, 3))
# [0.    0.211 0.368 0.579 0.105 1.    0.316]
# 25 maps to 0.0 (minimum), 120 maps to 1.0 (maximum)
```

---

### Q14 -- Matrix Operations

```python
matrix = np.arange(1, 17).reshape(4, 4)
print(matrix)
# [[ 1  2  3  4]
#  [ 5  6  7  8]
#  [ 9 10 11 12]
#  [13 14 15 16]]

# Extract diagonal
diag = np.diag(matrix)
print("Diagonal:", diag)         # [ 1  6 11 16]

# Trace (sum of diagonal)
trace = np.trace(matrix)
print("Trace:", trace)           # 34

# Replace all even numbers with 0
matrix_copy = matrix.copy()
matrix_copy[matrix_copy % 2 == 0] = 0
print(matrix_copy)
# [[ 1  0  3  0]
#  [ 5  0  7  0]
#  [ 9  0 11  0]
#  [13  0 15  0]]
```

---

### Q15 -- Full Pipeline

```python
student_names = np.array(["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"])
marks = np.array([
    [78, 85, 90, 88, 92],
    [92, 76, 88, 95, 80],
    [65, 70, 60, 75, 68],
    [88, 91, 85, 90, 94],
    [55, 60, 58, 62, 70],
    [82, 88, 79, 85, 91],
])

# 1. Total and average per student
totals   = np.sum(marks, axis=1)
averages = np.mean(marks, axis=1)

print("Totals  :", totals)
# [433 431 338 448 305 425]
print("Averages:", np.round(averages, 1))
# [86.6 86.2 67.6 89.6 61.0 85.0]

# 2. Class topper
topper_idx = np.argmax(averages)
print(f"Topper: {student_names[topper_idx]} with avg {averages[topper_idx]:.1f}")
# Sneha with avg 89.6

# 3. Subjects where class average is below 65
subject_avgs   = np.mean(marks, axis=0)
subject_names  = np.array(["Maths", "Science", "English", "History", "CS"])
weak_subjects  = subject_names[subject_avgs < 65]
print("Subjects below class avg 65:", weak_subjects)
# No subject is below 65 in this dataset -- print will show empty array
# (All subject averages: [76.7 78.3 76.7 82.5 82.5])

# 4. Scholarship vs Regular
labels = np.where(averages >= 80, "Scholarship", "Regular")
for name, label in zip(student_names, labels):
    print(f"  {name}: {label}")
# Aarav      : Scholarship
# Priya      : Scholarship
# Rohan      : Regular
# Sneha      : Scholarship
# Karan      : Regular
# Meera      : Scholarship
```

---

*Made with care for Codeverra learners | [codeverra.com](https://codeverra.com)*