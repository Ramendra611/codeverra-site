---
title: "Numpy Masterclass - Beginner to Advanced"
description: "Get a comprehensive introduction to Numpy library in python"

date: 2026-03-18
lastmod: 2026-03-18
author: "codeverra"

showToc: false
TocOpen: false
toc: false
tocopen: false
draft: false
tags:
  - python
  - numpy
  - data-analysis

cover:
  image: "/images/numpy-masterclass.png"
  alt: "learn about numpy library"
  caption: "learn about numpy library"
  relative: true
  hidden: false
---
# NumPy Masterclass - From Basics to Advanced

> **Prerequisites:** Python basics, lists, loops, functions  
> **Install:** `pip install numpy`  
> **Import convention:** `import numpy as np`

---

## Table of Contents

1. [What is NumPy and Why Use It?](#1-what-is-numpy-and-why-use-it)
2. [Creating Arrays](#2-creating-arrays)
3. [Array Properties](#3-array-properties)
4. [Indexing and Slicing](#4-indexing-and-slicing)
5. [Modifying Arrays](#5-modifying-arrays)
6. [Reshaping and Stacking](#6-reshaping-and-stacking)
7. [Math Operations and Broadcasting](#7-math-operations-and-broadcasting)
8. [Universal Functions (ufuncs)](#8-universal-functions-ufuncs)
9. [Aggregations and Statistics](#9-aggregations-and-statistics)
10. [Sorting and Searching](#10-sorting-and-searching)
11. [Boolean Operations and Masking](#11-boolean-operations-and-masking)
12. [Random Number Generation](#12-random-number-generation)
13. [Linear Algebra](#13-linear-algebra)
14. [Working with Files](#14-working-with-files)
15. [Performance Tips and Best Practices](#15-performance-tips-and-best-practices)

---

## 1. What is NumPy and Why Use It?

NumPy (Numerical Python) is the foundation of the entire Python data science stack. Pandas, Matplotlib, Scikit-learn, and TensorFlow all build on top of it.

### Why not just use Python lists?

```python
import numpy as np
import time

# Python list — slow loop-based
python_list = list(range(1_000_000))
start = time.time()
result = [x * 2 for x in python_list]
print(f"List: {time.time() - start:.4f}s")

# NumPy array — vectorized C operations
np_array = np.arange(1_000_000)
start = time.time()
result = np_array * 2
print(f"NumPy: {time.time() - start:.4f}s")

# NumPy is typically 10–100x faster for numerical operations
```

### Key differences from Python lists

| Feature | Python List | NumPy Array |
|---|---|---|
| Data types | Mixed (int, str, etc.) | All same type |
| Speed | Slow (Python loop) | Fast (C under the hood) |
| Memory | More overhead | Compact |
| Operations | Need explicit loops | Vectorized (no loops) |
| Dimensions | Only 1D natively | Any number of dimensions |

---

## 2. Creating Arrays

### From Python sequences

```python
import numpy as np

# From a list — 1D array
a = np.array([1, 2, 3, 4, 5])
print(a)           # [1 2 3 4 5]
print(type(a))     # <class 'numpy.ndarray'>

# From a list of lists — 2D array (matrix)
m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m)
# [[1 2 3]
#  [4 5 6]]

# From a tuple
b = np.array((10, 20, 30))
print(b)           # [10 20 30]

# Specify data type explicitly
c = np.array([1, 2, 3], dtype=float)
print(c)           # [1. 2. 3.]

d = np.array([1.7, 2.9, 3.1], dtype=int)
print(d)           # [1 2 3]  (truncated, not rounded!)
```

### Built-in array creation functions

```python
# Zeros — all elements are 0.0
np.zeros(5)              # [0. 0. 0. 0. 0.]
np.zeros((3, 4))         # 3 rows, 4 cols of zeros

# Ones — all elements are 1.0
np.ones(4)               # [1. 1. 1. 1.]
np.ones((2, 3))          # 2×3 matrix of ones

# Full — fill with a specific value
np.full(5, 7)            # [7 7 7 7 7]
np.full((2, 2), 3.14)    # [[3.14 3.14]
                         #  [3.14 3.14]]

# Identity matrix (n×n, 1s on diagonal)
np.eye(3)
# [[1. 0. 0.]
#  [0. 1. 0.]
#  [0. 0. 1.]]

# Uninitialized — fast but contains garbage values (use carefully)
np.empty((2, 3))

# Like another array (same shape)
a = np.array([[1, 2], [3, 4]])
np.zeros_like(a)    # [[0 0] [0 0]]
np.ones_like(a)     # [[1 1] [1 1]]
np.full_like(a, 9)  # [[9 9] [9 9]]
```

### Range-based arrays

```python
# np.arange(start, stop, step) — like Python range()
np.arange(5)           # [0 1 2 3 4]
np.arange(1, 10)       # [1 2 3 4 5 6 7 8 9]
np.arange(0, 1, 0.2)   # [0.  0.2 0.4 0.6 0.8]
np.arange(10, 0, -2)   # [10  8  6  4  2]

# np.linspace(start, stop, num) — exactly num evenly spaced points
# NOTE: stop IS included (unlike arange)
np.linspace(0, 1, 5)     # [0.   0.25 0.5  0.75 1.  ]
np.linspace(0, 10, 11)   # [0. 1. 2. 3. 4. 5. 6. 7. 8. 9. 10.]

# Logarithmically spaced
np.logspace(0, 3, 4)   # [   1.   10.  100. 1000.]  (10^0 to 10^3)
```

> **When to use arange vs linspace:**  
> Use `arange` when you need a specific **step size**.  
> Use `linspace` when you need a specific **number of points** (great for plotting x-axes).

---

## 3. Array Properties

```python
a = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9,10,11,12]])

# Shape — (rows, cols) for 2D
print(a.shape)      # (3, 4)

# Number of dimensions
print(a.ndim)       # 2

# Total number of elements
print(a.size)       # 12

# Data type of elements
print(a.dtype)      # int64

# Memory size of each element in bytes
print(a.itemsize)   # 8  (int64 = 8 bytes)

# Total memory in bytes
print(a.nbytes)     # 96  (12 elements × 8 bytes)
```

### Common dtypes

```python
np.array([1, 2, 3], dtype=np.int8)      # -128 to 127
np.array([1, 2, 3], dtype=np.int32)     # ±2 billion
np.array([1, 2, 3], dtype=np.int64)     # default int on most systems
np.array([1.0], dtype=np.float32)       # single precision
np.array([1.0], dtype=np.float64)       # double precision (default)
np.array([True, False], dtype=np.bool_) # boolean
np.array(['a', 'b'], dtype=np.str_)     # unicode string

# Convert dtype
a = np.array([1, 2, 3])
a.astype(float)        # [1. 2. 3.]
a.astype(np.float32)
```

---

## 4. Indexing and Slicing

### 1D indexing

```python
a = np.array([10, 20, 30, 40, 50])

# Single element (0-based)
a[0]      # 10
a[4]      # 50
a[-1]     # 50  (last element)
a[-2]     # 40  (second to last)

# Slicing [start:stop:step]  — stop is EXCLUSIVE
a[1:4]    # [20 30 40]
a[:3]     # [10 20 30]  (from beginning)
a[2:]     # [30 40 50]  (to end)
a[:]      # [10 20 30 40 50]  (all)
a[::2]    # [10 30 50]  (every 2nd)
a[::-1]   # [50 40 30 20 10]  (reversed!)
a[1::2]   # [20 40]  (start at 1, every 2nd)
```

### 2D indexing

```python
m = np.array([[1,  2,  3,  4],
              [5,  6,  7,  8],
              [9, 10, 11, 12]])

# Single element [row, col]
m[0, 0]     # 1  (top-left)
m[2, 3]     # 12 (bottom-right)
m[1, 2]     # 7
m[-1, -1]   # 12

# Entire row
m[0]        # [1 2 3 4]
m[1, :]     # [5 6 7 8]
m[-1, :]    # [9 10 11 12]

# Entire column
m[:, 0]     # [1 5 9]
m[:, 2]     # [3 7 11]

# Submatrix [row_slice, col_slice]
m[0:2, 1:3]   # [[2 3] [6 7]]
m[1:, 2:]     # [[7 8] [11 12]]
m[:2, :2]     # [[1 2] [5 6]]
```

### Fancy indexing (index with an array)

```python
a = np.array([10, 20, 30, 40, 50])

# Index with a list of positions — returns a COPY (not a view)
idx = [0, 2, 4]
a[idx]          # [10 30 50]
a[[1, 3]]       # [20 40]

# 2D fancy indexing
m = np.arange(12).reshape(3, 4)
rows = [0, 2]
cols = [1, 3]
m[rows, cols]   # [m[0,1], m[2,3]] = [1, 11]
```

### Views vs Copies — important!

```python
a = np.array([1, 2, 3, 4, 5])

# Slices return VIEWS — modifying changes the original!
b = a[1:4]
b[0] = 99
print(a)   # [1 99 3 4 5]  ← original changed!

# Use .copy() to avoid this
c = a[1:4].copy()
c[0] = 0
print(a)   # unchanged

# Check if an array is a view
b.base is a    # True  (b is a view of a)
c.base is a    # False (c is independent)
```

---

## 5. Modifying Arrays

### Setting values

```python
a = np.array([1, 2, 3, 4, 5])

# Set single element
a[0] = 99

# Set a slice
a[1:3] = [20, 30]

# Set multiple positions with fancy indexing
a[[0, 4]] = 0

# 2D assignment
m = np.zeros((3, 3))
m[0, :] = [1, 2, 3]    # set first row
m[:, 1] = 9            # set second column to all 9s
m[1:3, 1:3] = [[5, 6], [7, 8]]  # set submatrix
```

### Adding and removing elements

```python
a = np.array([1, 2, 3])

# Append — returns a NEW array (doesn't modify in place)
np.append(a, 4)          # [1 2 3 4]
np.append(a, [4, 5, 6])  # [1 2 3 4 5 6]

# Insert at position
np.insert(a, 1, 99)      # [1 99 2 3]  (insert 99 at index 1)

# Delete by index
np.delete(a, 0)          # [2 3]
np.delete(a, [0, 2])     # [2]

# Note: all of these return NEW arrays
```

---

## 6. Reshaping and Stacking

### Reshaping

```python
a = np.arange(12)   # [0 1 2 3 4 5 6 7 8 9 10 11]

# reshape(rows, cols) — total elements must match
m = a.reshape(3, 4)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]

a.reshape(2, 6)     # 2 rows × 6 cols
a.reshape(4, 3)     # 4 rows × 3 cols
a.reshape(2, 2, 3)  # 3D: 2 blocks × 2 rows × 3 cols

# Use -1 to let NumPy infer one dimension
a.reshape(4, -1)    # 4 rows, NumPy figures out 3 cols
a.reshape(-1, 3)    # NumPy figures out 4 rows, 3 cols
a.reshape(-1)       # flatten to 1D

# np.reshape is the same
np.reshape(a, (3, 4))
```

### Flattening

```python
m = np.array([[1, 2, 3], [4, 5, 6]])

m.flatten()   # [1 2 3 4 5 6]  — returns a COPY
m.ravel()     # [1 2 3 4 5 6]  — returns a VIEW (faster)
m.reshape(-1) # same as ravel
```

### Adding dimensions

```python
a = np.array([1, 2, 3])   # shape (3,)

# Add dimension to make it a row vector
a[np.newaxis, :]       # shape (1, 3)
a.reshape(1, -1)       # same

# Add dimension to make it a column vector
a[:, np.newaxis]       # shape (3, 1)
a.reshape(-1, 1)       # same

# np.expand_dims
np.expand_dims(a, axis=0)   # (1, 3)
np.expand_dims(a, axis=1)   # (3, 1)
```

### Transpose

```python
m = np.array([[1, 2, 3],
              [4, 5, 6]])   # shape (2, 3)

m.T             # shape (3, 2) — rows become cols
np.transpose(m) # same

# For higher dimensions — specify axis order
a = np.arange(24).reshape(2, 3, 4)
a.T.shape       # (4, 3, 2)
np.transpose(a, axes=(0, 2, 1))  # custom axis order
```

### Stacking and splitting

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Stack vertically (add rows)
np.vstack([a, b])          # [[1 2 3] [4 5 6]]  shape (2, 3)

# Stack horizontally (extend columns / join end-to-end for 1D)
np.hstack([a, b])          # [1 2 3 4 5 6]       shape (6,)

# Stack along new axis
np.stack([a, b], axis=0)   # [[1 2 3] [4 5 6]]  axis=0 → new first axis
np.stack([a, b], axis=1)   # [[1 4] [2 5] [3 6]]

# column_stack — makes each 1D array a column
np.column_stack([a, b])    # [[1 4] [2 5] [3 6]]

# General concatenate
np.concatenate([a, b])              # 1D: [1 2 3 4 5 6]
np.concatenate([m1, m2], axis=0)    # stack rows
np.concatenate([m1, m2], axis=1)    # stack cols

# Splitting
a = np.arange(12)
np.split(a, 3)          # 3 equal arrays of 4
np.split(a, [3, 7])     # split at positions 3 and 7

m = np.arange(12).reshape(3, 4)
np.vsplit(m, 3)          # split into 3 row-blocks
np.hsplit(m, 2)          # split into 2 col-blocks
```

---

## 7. Math Operations and Broadcasting

### Element-wise operations

```python
a = np.array([1, 2, 3, 4])
b = np.array([10, 20, 30, 40])

# Arithmetic (all element-wise)
a + b      # [11 22 33 44]
a - b      # [-9 -18 -27 -36]
a * b      # [10 40 90 160]
a / b      # [0.1 0.1 0.1 0.1]
a // b     # [0 0 0 0]  integer division
a % b      # [1 2 3 4]  remainder
a ** 2     # [1 4 9 16] exponentiation

# Comparison (returns boolean array)
a > 2      # [False False True True]
a == 2     # [False True False False]
a != 3     # [True True False True]
a >= 3     # [False False True True]
```

### Scalar broadcasting

```python
a = np.array([1, 2, 3, 4])

# Scalar stretches to match the array
a + 10      # [11 12 13 14]
a * 2       # [2 4 6 8]
a / 2.0     # [0.5 1.0 1.5 2.0]
a ** 2      # [1 4 9 16]
10 - a      # [9 8 7 6]
```

### Broadcasting with arrays of different shapes

```python
# Rule: dimensions are compared trailing → leading
# Sizes must match OR one of them must be 1

m = np.array([[1, 2, 3],
              [4, 5, 6]])        # shape (2, 3)
row = np.array([10, 20, 30])    # shape (3,)

# row broadcasts to (2, 3) — added to every row
m + row
# [[11 22 33]
#  [14 25 36]]

col = np.array([[100],
                [200]])          # shape (2, 1)

# col broadcasts to (2, 3) — added to every column
m + col
# [[101 102 103]
#  [204 205 206]]

# Both broadcast simultaneously
row + col
# [[110 120 130]
#  [210 220 230]]
```

---

## 8. Universal Functions (ufuncs)

Universal functions operate element-wise and are very fast (C-implemented).

```python
a = np.array([1, 4, 9, 16, 25])

# Math
np.sqrt(a)        # [1. 2. 3. 4. 5.]
np.square(a)      # [1 16 81 256 625]
np.abs([-1, -2, 3])  # [1 2 3]
np.log(a)         # natural log
np.log2(a)        # base-2 log
np.log10(a)       # base-10 log
np.exp(a)         # e^x
np.exp2(a)        # 2^x

# Trig (angles in RADIANS)
x = np.array([0, np.pi/6, np.pi/4, np.pi/2, np.pi])
np.sin(x)         # [0. 0.5 0.707 1. 0.]
np.cos(x)
np.tan(x)
np.arcsin([0, 1]) # inverse sin → [0. 1.5707...]
np.degrees(x)     # convert radians to degrees
np.radians([0, 90, 180])  # degrees to radians

# Rounding
a = np.array([1.2, 2.5, 3.7, -1.5])
np.round(a)       # [1. 2. 4. -2.]  (banker's rounding)
np.floor(a)       # [1. 2. 3. -2.]  (round down)
np.ceil(a)        # [2. 3. 4. -1.]  (round up)
np.trunc(a)       # [1. 2. 3. -1.]  (truncate toward zero)
np.clip(a, 0, 3)  # [1.2 2.5 3.0 0.0]  (clamp to range)

# Min / max between two arrays
a = np.array([1, 5, 3])
b = np.array([4, 2, 6])
np.maximum(a, b)  # [4 5 6]  (element-wise max)
np.minimum(a, b)  # [1 2 3]  (element-wise min)

# Sign and modulo
np.sign([-3, 0, 5])   # [-1 0 1]
np.mod(a, 2)          # remainder after dividing by 2
np.divmod(a, 2)       # quotient and remainder together
```

---

## 9. Aggregations and Statistics

### Basic aggregations

```python
a = np.array([[1, 2, 3],
              [4, 5, 6]])

# Aggregate entire array
a.sum()       # 21
a.min()       # 1
a.max()       # 6
a.mean()      # 3.5
a.std()       # standard deviation ≈ 1.708
a.var()       # variance = std²
a.prod()      # product of all elements = 720
```

### The `axis` parameter — critical concept

```python
a = np.array([[1, 2, 3],
              [4, 5, 6]])

# axis=0 → collapse ROWS → result is per COLUMN (↓ vertical)
a.sum(axis=0)    # [5 7 9]   (1+4, 2+5, 3+6)
a.min(axis=0)    # [1 2 3]
a.max(axis=0)    # [4 5 6]
a.mean(axis=0)   # [2.5 3.5 4.5]

# axis=1 → collapse COLS → result is per ROW (→ horizontal)
a.sum(axis=1)    # [6 15]   (1+2+3, 4+5+6)
a.min(axis=1)    # [1 4]
a.max(axis=1)    # [3 6]
a.mean(axis=1)   # [2. 5.]

# keepdims — preserve dimensions for broadcasting
a.sum(axis=1, keepdims=True)   # [[6], [15]]  shape (2,1)
```

> **Memory trick:** axis=0 collapses rows (goes **down** ↓), axis=1 collapses cols (goes **across** →).

### Index of min/max

```python
a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

np.argmin(a)   # 1  (index of minimum value 1)
np.argmax(a)   # 5  (index of maximum value 9)

# For 2D — flattened index by default
m = np.array([[3, 1], [4, 1]])
np.argmax(m)          # 2  (flat index)
np.argmax(m, axis=0)  # [1 0]  (index per column)
np.argmax(m, axis=1)  # [0 0]  (index per row)
```

### Cumulative operations

```python
a = np.array([1, 2, 3, 4, 5])

np.cumsum(a)    # [1 3 6 10 15]  running total
np.cumprod(a)   # [1 2 6 24 120] running product

# 2D cumulative
m = np.array([[1, 2], [3, 4]])
np.cumsum(m, axis=0)   # cumulative down each column
np.cumsum(m, axis=1)   # cumulative across each row
```

### Statistical functions

```python
a = np.array([2, 4, 4, 4, 5, 5, 7, 9])

np.mean(a)       # 5.0
np.median(a)     # 4.5
np.std(a)        # 2.0  (population std)
np.var(a)        # 4.0

# Percentile / quantile
np.percentile(a, 25)    # Q1 = 4.0
np.percentile(a, 50)    # median = 4.5
np.percentile(a, 75)    # Q3 = 5.5
np.percentile(a, [25, 50, 75])  # all at once

np.quantile(a, 0.25)    # same as percentile 25

# Correlation and covariance
x = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])
np.corrcoef(x, y)        # correlation matrix
np.cov(x, y)             # covariance matrix

# Histogram
counts, bin_edges = np.histogram(a, bins=5)
```

---

## 10. Sorting and Searching

```python
a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# Sort — returns a NEW sorted array
np.sort(a)         # [1 1 2 3 4 5 6 9]
np.sort(a)[::-1]   # descending: [9 6 5 4 3 2 1 1]

# Sort IN PLACE (modifies original)
a.sort()

# argsort — returns indices that would sort the array
np.argsort(a)       # [1 3 6 0 2 4 7 5]
a[np.argsort(a)]    # same as np.sort(a)

# 2D sorting
m = np.array([[3, 1, 2], [6, 4, 5]])
np.sort(m, axis=0)   # sort each column
np.sort(m, axis=1)   # sort each row

# Partial sort — find the k smallest
np.partition(a, 3)   # first 3 positions are the 3 smallest (unordered)
np.argpartition(a, 3)  # indices version

# Searching
np.searchsorted([1, 3, 5, 7], 4)   # 2  (insert 4 before index 2)
np.where(a > 3)                    # indices where condition is True
np.nonzero(a)                      # indices of non-zero elements

# Count occurrences
np.count_nonzero(a > 3)   # how many elements are > 3
```

---

## 11. Boolean Operations and Masking

```python
a = np.array([1, 5, 3, 8, 2, 9, 4, 7])

# Conditions produce boolean arrays
mask = a > 4          # [False True False True False True False True]
print(mask)

# Use mask to select elements
a[mask]               # [5 8 9 7]
a[a > 4]              # same shorthand

# Modify elements based on condition
a[a > 4] = 0          # set all >4 to zero
a[a < 3] = -1         # set all <3 to -1

# np.where(condition, if_true, if_false) — vectorized if/else
np.where(a > 4, a, 0)      # keep value if >4, else 0
np.where(a > 0, a, -a)     # absolute value!
np.where(a % 2 == 0, 'even', 'odd')

# Combining conditions (use &, |, ~ NOT and/or/not)
a[(a > 2) & (a < 8)]       # between 2 and 8
a[(a < 2) | (a > 7)]       # less than 2 or greater than 7
a[~(a == 5)]               # everything EXCEPT 5

# Logical functions
np.logical_and(a > 2, a < 8)
np.logical_or(a < 2, a > 7)
np.logical_not(a > 5)

# Any / all
np.any(a > 5)     # True if at least one element satisfies
np.all(a > 0)     # True if ALL elements satisfy
np.any(a > 5, axis=0)   # per column for 2D

# Finding unique values
np.unique(a)                    # sorted unique values
vals, counts = np.unique(a, return_counts=True)   # with counts
np.isin(a, [2, 4, 6])          # True where element is in list
```

---

## 12. Random Number Generation

```python
# Modern API — always use default_rng with a seed for reproducibility
rng = np.random.default_rng(seed=42)

# Uniform floats [0, 1)
rng.random()            # single float
rng.random(5)           # 1D array of 5 floats
rng.random((3, 4))      # 3×4 matrix

# Uniform floats in a range [low, high)
rng.uniform(0, 10, 100)

# Random integers [low, high)
rng.integers(1, 7, 10)       # 10 dice rolls (1-6)
rng.integers(0, 100, (3, 3)) # 3×3 matrix of ints

# Normal (Gaussian) distribution
rng.normal(loc=0, scale=1, size=1000)       # μ=0, σ=1
rng.normal(loc=100, scale=15, size=500)     # IQ-like scores

# Other distributions
rng.binomial(n=10, p=0.5, size=100)   # binomial
rng.poisson(lam=3, size=100)          # Poisson
rng.exponential(scale=1.0, size=100) # exponential
rng.choice([1, 2, 3, 4, 5], size=10) # sample from array
rng.choice([1, 2, 3], size=5, replace=False)  # without replacement

# Shuffle
a = np.arange(10)
rng.shuffle(a)         # in-place shuffle
rng.permutation(10)    # returns new shuffled array

# Seed for reproducibility — same seed = same numbers
rng1 = np.random.default_rng(42)
rng2 = np.random.default_rng(42)
print(rng1.random(3) == rng2.random(3))  # [True True True]
```

> **Always set a seed** when writing code others will run, or when you need reproducible results for testing.

---

## 13. Linear Algebra

```python
A = np.array([[1, 2],
              [3, 4]])
B = np.array([[5, 6],
              [7, 8]])

# Matrix multiplication — use @ operator or np.dot
A @ B
# [[19 22]
#  [43 50]]

np.dot(A, B)      # same result

# WARNING: * is element-wise, NOT matrix multiply!
A * B             # [[5 12] [21 32]]  ← wrong for matrix math

# Matrix-vector multiplication
v = np.array([1, 2])
A @ v             # [5 11]

# Determinant
np.linalg.det(A)           # -2.0

# Matrix inverse (A must be square and non-singular)
np.linalg.inv(A)
# [[-2.   1. ]
#  [ 1.5 -0.5]]

# Verify: A @ inv(A) should give identity
A @ np.linalg.inv(A)   # [[1. 0.] [0. 1.]]

# Solving linear systems: Ax = b
b = np.array([5, 11])
x = np.linalg.solve(A, b)     # [1. 2.]
print(A @ x)                   # [5. 11.]  ← verify

# Eigenvalues and eigenvectors
eigenvalues, eigenvectors = np.linalg.eig(A)
print(eigenvalues)    # [-0.372 5.372]

# Norm (magnitude)
v = np.array([3, 4])
np.linalg.norm(v)         # 5.0  (Euclidean = sqrt(3²+4²))
np.linalg.norm(A)         # Frobenius norm (default for matrices)
np.linalg.norm(v, ord=1)  # L1 norm = 7.0
np.linalg.norm(v, ord=np.inf)  # max norm = 4.0

# Rank
np.linalg.matrix_rank(A)  # 2

# Trace (sum of diagonal)
np.trace(A)           # 5  (1 + 4)

# Singular Value Decomposition
U, s, Vt = np.linalg.svd(A)

# Cross product and dot product
a = np.array([1, 0, 0])
b = np.array([0, 1, 0])
np.cross(a, b)   # [0 0 1]  (z-axis)
np.dot(a, b)     # 0  (orthogonal vectors)
```

---

## 14. Working with Files

```python
# Save a single array (binary .npy format)
a = np.array([1, 2, 3, 4, 5])
np.save('my_array.npy', a)
loaded = np.load('my_array.npy')

# Save multiple arrays (binary .npz format)
x = np.arange(10)
y = np.linspace(0, 1, 10)
np.savez('my_data.npz', x=x, y=y)

data = np.load('my_data.npz')
data['x']   # retrieve x
data['y']   # retrieve y

# Compressed version
np.savez_compressed('my_data.npz', x=x, y=y)

# Save to text / CSV
m = np.array([[1, 2, 3], [4, 5, 6]])
np.savetxt('matrix.csv', m, delimiter=',', fmt='%d')
np.savetxt('matrix.txt', m, header='col1 col2 col3')

# Load from text / CSV
loaded = np.loadtxt('matrix.csv', delimiter=',')
loaded = np.genfromtxt('data.csv', delimiter=',',
                        skip_header=1,    # skip header row
                        filling_values=0) # fill NaNs with 0
```

---

## 15. Performance Tips and Best Practices

### Vectorize — avoid Python loops

```python
# SLOW — Python loop
a = np.arange(1_000_000)
result = []
for x in a:
    result.append(x * 2 + 1)

# FAST — vectorized
result = a * 2 + 1
```

### Use views over copies when possible

```python
a = np.arange(1_000_000)

# Returns a VIEW (fast, no memory copy)
b = a[::2]
b = a.ravel()

# Returns a COPY (slower, allocates memory)
c = a[::2].copy()
c = a.flatten()
```

### Pre-allocate arrays

```python
# SLOW — growing array in a loop
result = np.array([])
for i in range(1000):
    result = np.append(result, i**2)  # new array every iteration!

# FAST — pre-allocate
result = np.empty(1000)
for i in range(1000):
    result[i] = i**2

# BEST — vectorize entirely
result = np.arange(1000) ** 2
```

### Choose the right dtype

```python
# Use smaller dtypes when you don't need full precision
a = np.arange(100, dtype=np.int8)    # 100 bytes
b = np.arange(100, dtype=np.int64)   # 800 bytes  — 8x larger!

c = np.zeros((1000, 1000), dtype=np.float32)  # 4 MB
d = np.zeros((1000, 1000), dtype=np.float64)  # 8 MB
```

### Useful utility functions

```python
# Check if two arrays are equal (including floats)
np.array_equal(a, b)        # exact equality
np.allclose(a, b)           # approximate equality (for floats)
np.allclose(a, b, atol=1e-6, rtol=1e-5)

# Copy
a.copy()            # explicit copy
np.copy(a)          # same

# Check for NaN and inf
np.isnan(a)         # boolean mask where NaN
np.isinf(a)         # boolean mask where ±inf
np.isfinite(a)      # boolean mask where finite
np.nan_to_num(a)    # replace NaN with 0, inf with large number

# Type checking
np.isscalar(5)      # True
np.isreal(a)        # True for all-real arrays
```

---

## Quick Reference Card

```python
# ── CREATION ─────────────────────────────────────────
np.array([1,2,3])           # from list
np.zeros((r,c))             # zeros
np.ones((r,c))              # ones
np.eye(n)                   # identity
np.arange(start,stop,step)  # range
np.linspace(start,stop,n)   # n evenly spaced

# ── PROPERTIES ───────────────────────────────────────
a.shape     a.ndim     a.size     a.dtype    a.itemsize

# ── INDEXING ─────────────────────────────────────────
a[i]        a[i:j]     a[::step]  a[-1]
m[r,c]      m[r,:]     m[:,c]     m[r1:r2, c1:c2]

# ── RESHAPING ────────────────────────────────────────
a.reshape(r,c)   a.T   a.flatten()   a.ravel()
np.vstack([a,b])  np.hstack([a,b])  np.concatenate([a,b])

# ── MATH ─────────────────────────────────────────────
a + b  a * b  a ** 2  a / b         # element-wise
A @ B  np.dot(A,B)                  # matrix multiply
np.sqrt(a)  np.abs(a)  np.exp(a)    # ufuncs

# ── AGGREGATIONS ─────────────────────────────────────
a.sum(axis=0)   a.mean()   a.std()
a.min()  a.max()  a.argmin()  a.argmax()
np.cumsum(a)  np.percentile(a, 75)

# ── BOOLEAN / MASKING ────────────────────────────────
a[a > 5]                      # filter
np.where(a > 5, a, 0)         # conditional
np.any(a > 5)  np.all(a > 0)

# ── RANDOM ───────────────────────────────────────────
rng = np.random.default_rng(42)
rng.random(n)  rng.integers(lo,hi,n)  rng.normal(μ,σ,n)

# ── LINEAR ALGEBRA ───────────────────────────────────
np.linalg.inv(A)   np.linalg.det(A)
np.linalg.solve(A,b)  np.linalg.eig(A)
```

---

*End of NumPy Masterclass*