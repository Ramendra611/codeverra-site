---
title: "Binary Search Pattern  -  Complete Guide"
description: "Understand binary search as a pattern beyond sorted arrays  -  templates, variations, and common problems."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - dsa
  - dsa-patterns
cover:
  image: "/images/dsa-patterns-02.png"
  alt: "Binary Search Pattern"
  caption: "Binary Search Pattern"
  relative: true
  hidden: false
---

# 🔰 Pattern 2: Binary Search

## Table of Contents

1. [What is Binary Search?](#what-is-binary-search)
2. [The Core Idea  -  Why Halving Works](#the-core-idea--why-halving-works)
3. [The Three Binary Search Templates](#the-three-binary-search-templates)
4. [Binary Search on Answer  -  The Hidden Pattern](#binary-search-on-answer--the-hidden-pattern)
5. [Common Pitfalls](#common-pitfalls)
6. [Problem Set](#problem-set)
   - [Problem 1: Binary Search](#problem-1-binary-search)
   - [Problem 2: Search Insert Position](#problem-2-search-insert-position)
   - [Problem 3: Find First and Last Position of Element in Sorted Array](#problem-3-find-first-and-last-position-of-element-in-sorted-array)
   - [Problem 4: Search a 2D Matrix](#problem-4-search-a-2d-matrix)
   - [Problem 5: Search in Rotated Sorted Array](#problem-5-search-in-rotated-sorted-array)
   - [Problem 6: Find Minimum in Rotated Sorted Array](#problem-6-find-minimum-in-rotated-sorted-array)
   - [Problem 7: Koko Eating Bananas](#problem-7-koko-eating-bananas)
   - [Problem 8: Capacity to Ship Packages Within D Days](#problem-8-capacity-to-ship-packages-within-d-days)
   - [Problem 9: Split Array Largest Sum](#problem-9-split-array-largest-sum)
   - [Problem 10: Median of Two Sorted Arrays](#problem-10-median-of-two-sorted-arrays)
7. [Key Takeaways & Summary](#key-takeaways--summary)

---

## What is Binary Search?

In the Two Pointers pattern, we used two indices to narrow down a search space. Binary search takes that idea to its most powerful form: instead of narrowing one step at a time, we **cut the search space in half** at every step.

Let's see the difference with a concrete example.

**Problem:** Find the number `7` in a sorted array of 1 million elements.

**Linear search (one by one):** Check index 0, then 1, then 2... up to 1,000,000 in the worst case.

**Binary search (halving):**
```
Step 1:  Check middle of 1,000,000 elements → eliminate 500,000
Step 2:  Check middle of 500,000 elements   → eliminate 250,000
Step 3:  Check middle of 250,000 elements   → eliminate 125,000
...
Step 20: Check middle of 1 element          → found (or not)
```

**20 steps to search 1 million elements.** That's the power of halving  -  each step eliminates half the remaining possibilities.

> **Binary Search** is a technique where you repeatedly divide the search space in half, using a condition to decide which half to keep, until you find your target or narrow down to a single candidate.

### Connection to Two Pointers

Binary search uses two pointers (`low` and `high`) that converge, just like opposite-direction two pointers. The difference:

| | Two Pointers | Binary Search |
|---|-------------|---------------|
| Movement | One step at a time | Jump to the middle |
| Elimination | One element per step | Half the space per step |
| Time | O(n) | O(log n) |
| Requirement | Usually sorted | Must have a condition that splits the space |

---

## The Core Idea  -  Why Halving Works

Binary search works whenever you have a **monotonic condition**  -  a property that is `False` for one portion of the search space and `True` for the rest (or vice versa), with a clean boundary between them.

```
Index:     0   1   2   3   4   5   6   7   8   9
Condition: F   F   F   F   T   T   T   T   T   T
                         ^
                    boundary (first True)
```

At any point, if we check the middle and find:
- **True** → the boundary is at or to the left → search left half
- **False** → the boundary is to the right → search right half

Each check eliminates half the candidates. After `log₂(n)` checks, we've found the boundary.

**This is more general than "finding a number in a sorted array."** The sorted-array case is just one instance where the condition is `arr[mid] >= target`. Binary search applies anytime you can define such a condition:

- "Is this speed fast enough to finish the task?" (Binary Search on Answer)
- "Is this capacity sufficient to ship all packages?" (Binary Search on Answer)
- "Is `arr[mid]` in the left or right half of a rotated array?" (Rotated Array Search)

---

## The Three Binary Search Templates

Different problems need slightly different templates. The variations come down to: **what exactly are you looking for?**

### Template 1: Find Exact Target

```python
def binary_search_exact(arr, target):
    """
    Find the index of 'target' in a sorted array.
    Returns -1 if not found.
    
    Loop invariant: if target exists, it's in arr[low..high].
    We stop when low > high (search space is empty → not found).
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    low, high = 0, len(arr) - 1
    
    while low <= high:
        mid = low + (high - low) // 2   # Avoids integer overflow
        
        if arr[mid] == target:
            return mid           # Found it
        elif arr[mid] < target:
            low = mid + 1        # Target is in the right half
        else:
            high = mid - 1       # Target is in the left half
    
    return -1  # Not found
```

**When to use:** You need the exact position of a specific value.

**Key detail:** `low <= high` (inclusive)  -  the loop runs while the search space has at least one element.

### Template 2: Find First/Left Boundary

```python
def binary_search_left(arr, target):
    """
    Find the FIRST (leftmost) position where arr[pos] >= target.
    Also known as: lower_bound, insertion point.
    
    This is the most versatile template. It finds the boundary where
    the condition arr[mid] >= target flips from False to True.
    
    Returns: index of the first element >= target.
    If all elements < target, returns len(arr).
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    low, high = 0, len(arr)   # Note: high = len(arr), not len(arr) - 1
    
    while low < high:          # Note: strict <, not <=
        mid = low + (high - low) // 2
        
        if arr[mid] < target:
            low = mid + 1      # mid is too small, search right
        else:
            high = mid         # mid could be the answer, search left (including mid)
    
    return low   # low == high == first position where arr[pos] >= target
```

**When to use:** Find the first occurrence, insertion point, or leftmost boundary.

**Key details:**
- `high = len(arr)`  -  allows returning past-the-end when all elements are smaller.
- `low < high` (strict)  -  loop ends when `low == high`, which is our answer.
- `high = mid` (not `mid - 1`)  -  because `mid` itself might be the answer.

### Template 3: Find Last/Right Boundary

```python
def binary_search_right(arr, target):
    """
    Find the LAST (rightmost) position where arr[pos] <= target.
    Also known as: upper_bound - 1.
    
    Returns: index of the last element <= target.
    If all elements > target, returns -1.
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    low, high = 0, len(arr) - 1
    result = -1
    
    while low <= high:
        mid = low + (high - low) // 2
        
        if arr[mid] <= target:
            result = mid       # mid is a valid candidate, but there might be a later one
            low = mid + 1      # Search right for a later occurrence
        else:
            high = mid - 1     # mid is too large, search left
    
    return result
```

**When to use:** Find the last occurrence, rightmost boundary, or "latest valid" position.

### Which Template to Use?

```
What are you looking for?

"Find target"                → Template 1 (exact match)
"First position where..."   → Template 2 (left boundary)
"Last position where..."    → Template 3 (right boundary)
"Where would target go?"    → Template 2 (insertion point)
"First and last position"   → Template 2 + Template 3 combined
```

### A Visual Comparison

```
arr = [1, 3, 3, 3, 5, 7, 9]

Template 1: find 3         → returns index 2 (any of the 3s  -  typically middle)
Template 2: find first ≥ 3 → returns index 1 (leftmost 3)
Template 3: find last ≤ 3  → returns index 3 (rightmost 3)
Template 2: find first ≥ 4 → returns index 4 (first element after all 3s → insertion point for 4)
```

---

## Binary Search on Answer  -  The Hidden Pattern

This is where binary search gets really interesting. Instead of searching for a value *in an array*, you search for the **answer itself** across a range of possible values.

**The setup:**
1. You're looking for the minimum (or maximum) value that satisfies some condition.
2. The condition is monotonic: once it becomes `True`, it stays `True` for all larger (or smaller) values.
3. You can write a function `is_feasible(x)` that checks if a given value `x` works.

**The structure:**
```python
def binary_search_on_answer(problem_input):
    """
    Search for the minimum valid answer in the range [lo, hi].
    """
    lo, hi = minimum_possible_answer, maximum_possible_answer
    
    while lo < hi:
        mid = lo + (hi - lo) // 2
        
        if is_feasible(mid):
            hi = mid          # mid works, but maybe something smaller also works
        else:
            lo = mid + 1      # mid doesn't work, need something bigger
    
    return lo  # Smallest value that satisfies is_feasible
```

**Example:** "Koko has piles of bananas. She can eat at speed `k` bananas/hour. What's the minimum `k` to finish all bananas in `h` hours?"

- **Search space:** `k` can range from 1 to max(piles).
- **Condition:** At speed `k`, can she finish in ≤ `h` hours? (Monotonic  -  if speed 5 works, speed 6 definitely works.)
- **Binary search on answer:** Find the smallest `k` where the condition is True.

This pattern shows up in a huge number of problems disguised as optimization questions. The trick is recognizing that the answer has a monotonic feasibility condition.

---

## Common Pitfalls

### 1. Off-by-one errors

The #1 source of bugs. The differences between templates matter:

| | Template 1 | Template 2 | Template 3 |
|---|-----------|-----------|-----------|
| `high` init | `len(arr) - 1` | `len(arr)` | `len(arr) - 1` |
| Loop condition | `low <= high` | `low < high` | `low <= high` |
| On match | `return mid` | `high = mid` | `result = mid; low = mid + 1` |

### 2. Infinite loops

If `low = mid` (without `+ 1`) when `low == mid`, the loop never progresses. This happens when:
- You use `low < high` with `low = mid` (should be `low = mid + 1`)
- You forget that integer division rounds down: `(0 + 1) // 2 = 0`

**Rule of thumb:** If `low` might equal `mid`, always use `low = mid + 1`.

### 3. Integer overflow for `mid`

In languages with fixed-size integers (C++, Java), `(low + high)` can overflow. Always use:
```python
mid = low + (high - low) // 2    # Safe
# NOT: mid = (low + high) // 2   # Can overflow in some languages
```
Python handles big integers natively, so this isn't an issue in Python, but it's good practice.

### 4. Deciding which half to search

When stuck, ask: "If `arr[mid]` has this value, can the answer be at `mid`, to the left, or to the right?"

- If the answer **could be at `mid`** → don't exclude it (`high = mid`, not `high = mid - 1`)
- If the answer **cannot be at `mid`** → exclude it (`low = mid + 1` or `high = mid - 1`)

---

## Problem Set

### Difficulty Progression

| # | Problem | Difficulty | Key Concept |
|---|---------|-----------|-------------|
| 1 | Binary Search | Easy | Basic exact match |
| 2 | Search Insert Position | Easy | Left boundary / insertion point |
| 3 | Find First and Last Position | Medium | Left + right boundary combined |
| 4 | Search a 2D Matrix | Medium | Treating 2D as 1D |
| 5 | Search in Rotated Sorted Array | Medium | Modified binary search with rotation |
| 6 | Find Minimum in Rotated Sorted Array | Medium | Boundary in rotated array |
| 7 | Koko Eating Bananas | Medium | Binary search on answer |
| 8 | Capacity to Ship Packages | Medium | Binary search on answer |
| 9 | Split Array Largest Sum | Hard | Binary search on answer (advanced) |
| 10 | Median of Two Sorted Arrays | Hard | Binary search on partition |

---

### Problem 1: Binary Search

**LeetCode Link:** [https://leetcode.com/problems/binary-search/](https://leetcode.com/problems/binary-search/)

#### Problem Statement

Given a sorted array `nums` and a `target`, return the index of `target`. If not found, return `-1`.

**Example:**
```
Input: nums = [-1, 0, 3, 5, 9, 12], target = 9
Output: 4
```

#### Clarifying Questions & Constraints

- Array is sorted in ascending order.
- All elements are unique.
- Must be O(log n).

#### Approach Discussion

**Approach 1: Linear Scan**
- Walk through the array one by one.
- **Time:** O(n) ❌  -  doesn't use the sorted property.

**Approach 2: Binary Search (Optimal) ✅**
- Classic Template 1: check the middle, go left or right.
- **Time:** O(log n), **Space:** O(1)

This is the simplest binary search problem  -  the one to get the fundamentals right.

#### Code (Optimal Solution)

```python
def search(nums: list[int], target: int) -> int:
    """
    Classic binary search for an exact target in a sorted array.
    
    At each step:
    - If nums[mid] == target → found it
    - If nums[mid] < target → target must be in the right half → low = mid + 1
    - If nums[mid] > target → target must be in the left half → high = mid - 1
    
    Time Complexity: O(log n) - halving the search space each step
    Space Complexity: O(1) - only three variables
    """
    low, high = 0, len(nums) - 1
    
    while low <= high:
        mid = low + (high - low) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    
    return -1
```

#### Edge Cases

- **Target at start:** `[1, 2, 3], target=1` → 0.
- **Target at end:** `[1, 2, 3], target=3` → 2.
- **Target not present:** `[1, 2, 3], target=4` → -1.
- **Single element:** `[5], target=5` → 0; `[5], target=3` → -1.
- **Two elements:** `[1, 3], target=3` → 1.

#### Dry Run

```
Input: nums = [-1, 0, 3, 5, 9, 12], target = 9

Step 1: low=0, high=5, mid=2
        nums[2]=3 < 9 → low = 3

Step 2: low=3, high=5, mid=4
        nums[4]=9 == 9 → return 4 ✅

Output: 4
```

---

### Problem 2: Search Insert Position

**LeetCode Link:** [https://leetcode.com/problems/search-insert-position/](https://leetcode.com/problems/search-insert-position/)

#### Problem Statement

Given a sorted array of distinct integers and a target, return the index if the target is found. If not, return the index where it would be inserted to keep the array sorted.

**Example:**
```
Input: nums = [1, 3, 5, 6], target = 5 → Output: 2
Input: nums = [1, 3, 5, 6], target = 2 → Output: 1 (insert between 1 and 3)
Input: nums = [1, 3, 5, 6], target = 7 → Output: 4 (insert at end)
```

#### Clarifying Questions & Constraints

- Array has distinct elements sorted in ascending order.
- Must be O(log n).
- This is equivalent to finding the **first index where `nums[i] >= target`**.

#### Approach Discussion

**Approach 1: Linear Scan**
- Walk until you find `target` or a value greater.
- **Time:** O(n)

**Approach 2: Binary Search  -  Left Boundary (Optimal) ✅**
- This is exactly Template 2: find the first index where `nums[mid] >= target`.
- If `target` exists, that's its index. If not, that's where it would be inserted.
- **Time:** O(log n), **Space:** O(1)

#### Code (Optimal Solution)

```python
def searchInsert(nums: list[int], target: int) -> int:
    """
    Find the insertion point for target in a sorted array.
    This is the index of the first element >= target.
    
    Uses Template 2 (left boundary):
    - If nums[mid] < target: mid is too small, search right
    - If nums[mid] >= target: mid could be the answer, search left (including mid)
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    low, high = 0, len(nums)  # high = len(nums) for "insert at end" case
    
    while low < high:
        mid = low + (high - low) // 2
        
        if nums[mid] < target:
            low = mid + 1     # Too small, search right
        else:
            high = mid        # Could be the answer, search left
    
    return low  # First index where nums[low] >= target
```

#### Edge Cases

- **Target smaller than all:** `[2, 4, 6], target=1` → 0.
- **Target larger than all:** `[2, 4, 6], target=8` → 3.
- **Target exists:** `[1, 3, 5], target=3` → 1.
- **Empty array:** `[], target=5` → 0.

#### Dry Run

```
Input: nums = [1, 3, 5, 6], target = 2

Step 1: low=0, high=4, mid=2
        nums[2]=5 >= 2 → high = 2

Step 2: low=0, high=2, mid=1
        nums[1]=3 >= 2 → high = 1

Step 3: low=0, high=1, mid=0
        nums[0]=1 < 2 → low = 1

low == high == 1 → return 1 ✅
(2 would be inserted between 1 and 3)
```

---

### Problem 3: Find First and Last Position of Element in Sorted Array

**LeetCode Link:** [https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

#### Problem Statement

Given a sorted array `nums` and a `target`, find the starting and ending position of `target`. If not found, return `[-1, -1]`. Must be O(log n).

**Example:**
```
Input: nums = [5, 7, 7, 8, 8, 10], target = 8
Output: [3, 4]
```

#### Clarifying Questions & Constraints

- Array is sorted in non-decreasing order (duplicates allowed).
- Must be O(log n)  -  can't scan linearly after finding one occurrence.
- Return `[-1, -1]` if target doesn't exist.

#### Approach Discussion

**Approach 1: Find One + Expand**
- Binary search to find any occurrence, then expand left and right.
- **Time:** O(n) in worst case (all elements are target) ❌

**Approach 2: Two Binary Searches (Optimal) ✅**
- Run binary search twice:
  1. Find the **first** (leftmost) occurrence of target.
  2. Find the **last** (rightmost) occurrence of target.
- **Time:** O(log n), **Space:** O(1)

This combines Templates 2 and 3.

#### Code (Optimal Solution)

```python
def searchRange(nums: list[int], target: int) -> list[int]:
    """
    Find the first and last positions of target using two binary searches.
    
    Search 1: Find the leftmost index where nums[i] == target.
    Search 2: Find the rightmost index where nums[i] == target.
    
    Time Complexity: O(log n) - two binary searches, each O(log n)
    Space Complexity: O(1)
    """
    def find_first(nums, target):
        """Find the leftmost index of target (Template 2 style)."""
        low, high = 0, len(nums) - 1
        result = -1
        
        while low <= high:
            mid = low + (high - low) // 2
            
            if nums[mid] == target:
                result = mid      # Found, but there might be an earlier one
                high = mid - 1    # Keep searching LEFT
            elif nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        
        return result
    
    def find_last(nums, target):
        """Find the rightmost index of target (Template 3 style)."""
        low, high = 0, len(nums) - 1
        result = -1
        
        while low <= high:
            mid = low + (high - low) // 2
            
            if nums[mid] == target:
                result = mid      # Found, but there might be a later one
                low = mid + 1     # Keep searching RIGHT
            elif nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        
        return result
    
    first = find_first(nums, target)
    
    # If target doesn't exist at all, no need to search for last
    if first == -1:
        return [-1, -1]
    
    last = find_last(nums, target)
    return [first, last]
```

#### Edge Cases

- **Target not present:** `[1, 3, 5], target=2` → `[-1, -1]`.
- **Single occurrence:** `[1, 3, 5], target=3` → `[1, 1]`.
- **All same:** `[7, 7, 7, 7], target=7` → `[0, 3]`.
- **Empty array:** `[], target=5` → `[-1, -1]`.

#### Dry Run

```
Input: nums = [5, 7, 7, 8, 8, 10], target = 8

find_first(target=8):
  low=0, high=5, mid=2: nums[2]=7 < 8 → low=3
  low=3, high=5, mid=4: nums[4]=8 == 8 → result=4, high=3
  low=3, high=3, mid=3: nums[3]=8 == 8 → result=3, high=2
  low=3 > high=2 → return 3

find_last(target=8):
  low=0, high=5, mid=2: nums[2]=7 < 8 → low=3
  low=3, high=5, mid=4: nums[4]=8 == 8 → result=4, low=5
  low=5, high=5, mid=5: nums[5]=10 > 8 → high=4
  low=5 > high=4 → return 4

Output: [3, 4] ✅
```

---

### Problem 4: Search a 2D Matrix

**LeetCode Link:** [https://leetcode.com/problems/search-a-2d-matrix/](https://leetcode.com/problems/search-a-2d-matrix/)

#### Problem Statement

Write an efficient algorithm to search for a value in an `m × n` matrix with these properties:
- Each row is sorted left to right.
- The first integer of each row is greater than the last integer of the previous row.

**Example:**
```
Matrix:
[1,  3,  5,  7]
[10, 11, 16, 20]
[23, 30, 34, 60]

target = 3 → True
```

#### Clarifying Questions & Constraints

- The entire matrix, read row by row, forms one sorted sequence.
- Must be O(log(m × n)).

#### Approach Discussion

**Approach 1: Two Binary Searches**
- Binary search to find the correct row, then binary search within that row.
- **Time:** O(log m + log n) = O(log(m × n)), **Space:** O(1)

**Approach 2: Treat as a Flat Sorted Array (Optimal) ✅**
- Since the matrix is one sorted sequence, treat it as a 1D array of size `m × n`.
- Convert 1D index to 2D: `row = index // n`, `col = index % n`.
- Run a single binary search.
- **Time:** O(log(m × n)), **Space:** O(1)

Both approaches have the same time complexity, but Approach 2 is cleaner.

#### Code (Both Approaches)

```python
# ============================================================
# APPROACH 1: Two Binary Searches  -  O(log m + log n)
# ============================================================
def searchMatrix_two(matrix: list[list[int]], target: int) -> bool:
    """
    First find the row, then search within it.
    
    Time Complexity: O(log m + log n)
    Space Complexity: O(1)
    """
    m, n = len(matrix), len(matrix[0])
    
    # Binary search for the correct row
    # The target row is the last row where matrix[row][0] <= target
    top, bottom = 0, m - 1
    while top <= bottom:
        mid = top + (bottom - top) // 2
        if matrix[mid][0] <= target <= matrix[mid][n - 1]:
            # Target could be in this row
            break
        elif matrix[mid][0] > target:
            bottom = mid - 1
        else:
            top = mid + 1
    
    if top > bottom:
        return False  # No valid row found
    
    row = top + (bottom - top) // 2
    
    # Binary search within the row
    low, high = 0, n - 1
    while low <= high:
        mid = low + (high - low) // 2
        if matrix[row][mid] == target:
            return True
        elif matrix[row][mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    
    return False


# ============================================================
# APPROACH 2: Flat 1D Binary Search  -  O(log(m × n)) ✅
# ============================================================
def searchMatrix(matrix: list[list[int]], target: int) -> bool:
    """
    Treat the 2D matrix as a flat 1D sorted array.
    
    The matrix read row by row is a sorted sequence.
    A 1D index maps to 2D as:
        row = index // num_columns
        col = index % num_columns
    
    Time Complexity: O(log(m × n))
    Space Complexity: O(1)
    """
    m, n = len(matrix), len(matrix[0])
    low, high = 0, m * n - 1
    
    while low <= high:
        mid = low + (high - low) // 2
        
        # Convert 1D index to 2D coordinates
        row = mid // n
        col = mid % n
        value = matrix[row][col]
        
        if value == target:
            return True
        elif value < target:
            low = mid + 1
        else:
            high = mid - 1
    
    return False
```

#### Edge Cases

- **Target is the smallest element:** `target = matrix[0][0]`.
- **Target is the largest element:** `target = matrix[m-1][n-1]`.
- **Target not in matrix:** Any value between existing values.
- **1×1 matrix:** `[[5]], target=5` → True.

#### Dry Run

```
Matrix:                        target = 3
[1,  3,  5,  7]
[10, 11, 16, 20]
[23, 30, 34, 60]

m=3, n=4, flat size = 12

Step 1: low=0, high=11, mid=5
        row=5//4=1, col=5%4=1 → matrix[1][1]=11
        11 > 3 → high=4

Step 2: low=0, high=4, mid=2
        row=2//4=0, col=2%4=2 → matrix[0][2]=5
        5 > 3 → high=1

Step 3: low=0, high=1, mid=0
        row=0//4=0, col=0%4=0 → matrix[0][0]=1
        1 < 3 → low=1

Step 4: low=1, high=1, mid=1
        row=1//4=0, col=1%4=1 → matrix[0][1]=3
        3 == 3 → return True ✅
```

---

### Problem 5: Search in Rotated Sorted Array

**LeetCode Link:** [https://leetcode.com/problems/search-in-rotated-sorted-array/](https://leetcode.com/problems/search-in-rotated-sorted-array/)

#### Problem Statement

A sorted array has been rotated at some pivot (e.g., `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`). Given the rotated array and a target, return the index of target or -1.

**Example:**
```
Input: nums = [4, 5, 6, 7, 0, 1, 2], target = 0
Output: 4
```

#### Clarifying Questions & Constraints

- All elements are unique.
- Must be O(log n).
- The array was sorted, then rotated  -  so one half is always sorted.

#### Approach Discussion

**Approach 1: Find Pivot + Two Binary Searches**
- Find the rotation point, then binary search the correct half.
- **Time:** O(log n), **Space:** O(1)

**Approach 2: Modified Single Binary Search (Optimal) ✅**

The key insight: when you split a rotated sorted array at any point, **at least one half is always sorted**. We can check which half is sorted and then decide whether the target falls in that sorted half.

```
[4, 5, 6, 7, 0, 1, 2]
         ^
        mid=3 (value=7)
Left:  [4, 5, 6, 7]  ← sorted ✅
Right: [0, 1, 2]     ← sorted ✅ (both can be sorted)

[6, 7, 0, 1, 2, 4, 5]
         ^
        mid=3 (value=1)
Left:  [6, 7, 0, 1]  ← NOT sorted (rotation point is here)
Right: [2, 4, 5]     ← sorted ✅
```

**Decision logic:**
1. If the left half is sorted (`nums[low] <= nums[mid]`):
   - Is the target in this sorted range? (`nums[low] <= target < nums[mid]`)
   - If yes → search left. If no → search right.
2. If the right half is sorted:
   - Is the target in this sorted range? (`nums[mid] < target <= nums[high]`)
   - If yes → search right. If no → search left.

- **Time:** O(log n), **Space:** O(1)

#### Code (Optimal Solution)

```python
def search(nums: list[int], target: int) -> int:
    """
    Binary search in a rotated sorted array.
    
    Key insight: At any mid point, at least one half (left or right) is sorted.
    We identify the sorted half, check if the target falls in it, and decide.
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    low, high = 0, len(nums) - 1
    
    while low <= high:
        mid = low + (high - low) // 2
        
        if nums[mid] == target:
            return mid
        
        # Determine which half is sorted
        if nums[low] <= nums[mid]:
            # LEFT half [low..mid] is sorted
            if nums[low] <= target < nums[mid]:
                # Target is in the sorted left half
                high = mid - 1
            else:
                # Target is in the right half
                low = mid + 1
        else:
            # RIGHT half [mid..high] is sorted
            if nums[mid] < target <= nums[high]:
                # Target is in the sorted right half
                low = mid + 1
            else:
                # Target is in the left half
                high = mid - 1
    
    return -1
```

#### Edge Cases

- **No rotation:** `[1, 2, 3, 4, 5], target=3` → works as normal binary search.
- **Rotated by 1:** `[5, 1, 2, 3, 4], target=5` → 0.
- **Two elements:** `[3, 1], target=1` → 1.
- **Target not present:** `[4, 5, 6, 7, 0, 1, 2], target=3` → -1.

#### Dry Run

```
Input: nums = [4, 5, 6, 7, 0, 1, 2], target = 0

Step 1: low=0, high=6, mid=3
        nums[3]=7, not target
        nums[0]=4 <= nums[3]=7 → LEFT half [4,5,6,7] is sorted
        Is 4 <= 0 < 7? NO → search right: low=4

Step 2: low=4, high=6, mid=5
        nums[5]=1, not target
        nums[4]=0 <= nums[5]=1 → LEFT half [0,1] is sorted
        Is 0 <= 0 < 1? YES → search left: high=4

Step 3: low=4, high=4, mid=4
        nums[4]=0 == 0 → return 4 ✅
```

---

### Problem 6: Find Minimum in Rotated Sorted Array

**LeetCode Link:** [https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)

#### Problem Statement

Find the minimum element in a rotated sorted array. All elements are unique.

**Example:**
```
Input: nums = [3, 4, 5, 1, 2]
Output: 1
```

#### Clarifying Questions & Constraints

- All elements are unique.
- Must be O(log n).
- The minimum is the rotation point  -  the place where the sorted order "breaks."

#### Approach Discussion

**Approach 1: Linear Scan**
- Find the minimum in one pass.
- **Time:** O(n) ❌

**Approach 2: Binary Search on Boundary (Optimal) ✅**

The minimum is at the point where the array "drops." We can binary search for this boundary.

**Key condition:** Compare `nums[mid]` with `nums[high]`:
- If `nums[mid] > nums[high]` → the rotation point (minimum) is in the right half.
- If `nums[mid] <= nums[high]` → `mid` is in the sorted right portion, minimum is at `mid` or to the left.

This is Template 2 (left boundary) applied to a rotated array.

- **Time:** O(log n), **Space:** O(1)

#### Code (Optimal Solution)

```python
def findMin(nums: list[int]) -> int:
    """
    Find the minimum in a rotated sorted array.
    
    The minimum is at the rotation point where the array "drops."
    We binary search for this boundary using nums[mid] vs nums[high].
    
    Why compare with nums[high] and not nums[low]?
    Comparing with nums[low] fails when the array isn't rotated at all
    (e.g., [1,2,3,4,5]). Comparing with nums[high] works universally.
    
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    low, high = 0, len(nums) - 1
    
    while low < high:
        mid = low + (high - low) // 2
        
        if nums[mid] > nums[high]:
            # The drop (minimum) is somewhere in (mid, high]
            # mid itself can't be the minimum since it's bigger than something to its right
            low = mid + 1
        else:
            # nums[mid] <= nums[high]: the right side is sorted
            # mid COULD be the minimum, so don't exclude it
            high = mid
    
    return nums[low]  # low == high, pointing to the minimum
```

#### Edge Cases

- **Not rotated:** `[1, 2, 3, 4]` → 1 (minimum is the first element).
- **Rotated by 1:** `[4, 1, 2, 3]` → 1.
- **Fully rotated (back to original):** Same as not rotated.
- **Two elements:** `[2, 1]` → 1.

#### Dry Run

```
Input: nums = [3, 4, 5, 1, 2]

Step 1: low=0, high=4, mid=2
        nums[2]=5 > nums[4]=2 → minimum is in right half
        low = 3

Step 2: low=3, high=4, mid=3
        nums[3]=1 <= nums[4]=2 → minimum could be at mid or left
        high = 3

low == high == 3 → return nums[3] = 1 ✅
```

---

### Problem 7: Koko Eating Bananas

**LeetCode Link:** [https://leetcode.com/problems/koko-eating-bananas/](https://leetcode.com/problems/koko-eating-bananas/)

#### Problem Statement

Koko has `n` piles of bananas. She can eat at most `k` bananas per hour. Each hour, she picks a pile and eats `k` bananas from it (if the pile has fewer than `k`, she eats all of it and waits). She has `h` hours to eat all bananas. Find the **minimum** `k` (eating speed) such that she can eat all bananas within `h` hours.

**Example:**
```
Input: piles = [3, 6, 7, 11], h = 8
Output: 4  (at speed 4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 ≤ 8)
```

#### Clarifying Questions & Constraints

- `h >= len(piles)` (she has at least one hour per pile).
- `1 <= k` (minimum speed is 1).
- Maximum useful speed is `max(piles)` (finishes any pile in one hour).
- At speed `k`, time for one pile = `ceil(pile_size / k)`.

#### Approach Discussion

**Approach 1: Linear Search**
- Try every speed from 1 to max(piles), pick the first one that works.
- **Time:** O(max(piles) × n), **Space:** O(1) ❌ Too slow.

**Approach 2: Binary Search on Answer (Optimal) ✅**

This is a classic "binary search on answer" problem.

- **Search space:** `k` ranges from `1` to `max(piles)`.
- **Feasibility check:** At speed `k`, total hours = `sum(ceil(pile/k) for each pile)`. Is this ≤ `h`?
- **Monotonic condition:** If speed `k` works, then speed `k+1` definitely works (faster = fewer hours). So the feasibility is monotonic.
- **We want:** The smallest `k` where feasible is True → Template 2 (left boundary).

- **Time:** O(n × log(max(piles))), **Space:** O(1)

#### Code (Optimal Solution)

```python
import math

def minEatingSpeed(piles: list[int], h: int) -> int:
    """
    Find the minimum eating speed to finish all bananas in h hours.
    
    Binary search on the answer (speed k):
    - Search space: [1, max(piles)]
    - Feasibility: at speed k, can Koko finish in ≤ h hours?
    - Monotonic: higher speed → fewer hours (always feasible if lower speed was)
    
    Time Complexity: O(n × log(max(piles)))
        - Binary search: O(log(max(piles))) iterations
        - Each feasibility check: O(n) to sum over all piles
    Space Complexity: O(1)
    """
    def hours_needed(speed):
        """Calculate total hours to eat all piles at the given speed."""
        total = 0
        for pile in piles:
            total += math.ceil(pile / speed)  # or: (pile + speed - 1) // speed
        return total
    
    # Binary search for the minimum feasible speed
    low, high = 1, max(piles)
    
    while low < high:
        mid = low + (high - low) // 2
        
        if hours_needed(mid) <= h:
            # This speed works! But maybe a slower speed also works.
            high = mid
        else:
            # Too slow  -  need to eat faster.
            low = mid + 1
    
    return low
```

#### Edge Cases

- **h == len(piles):** Must eat each pile in exactly 1 hour → `k = max(piles)`.
- **h very large:** Can eat very slowly → `k = 1` if `h >= sum(piles)`.
- **Single pile:** `piles=[10], h=5` → `k = 2` (ceil(10/2)=5 hours).
- **All piles size 1:** `piles=[1,1,1], h=3` → `k = 1`.

#### Dry Run

```
Input: piles = [3, 6, 7, 11], h = 8

Search space: low=1, high=11

Step 1: mid=6
        hours = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6
        6 ≤ 8 → works! high=6

Step 2: mid=3
        hours = ceil(3/3)+ceil(6/3)+ceil(7/3)+ceil(11/3) = 1+2+3+4 = 10
        10 > 8 → too slow. low=4

Step 3: mid=5
        hours = ceil(3/5)+ceil(6/5)+ceil(7/5)+ceil(11/5) = 1+2+2+3 = 8
        8 ≤ 8 → works! high=5

Step 4: mid=4
        hours = ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8
        8 ≤ 8 → works! high=4

low == high == 4 → return 4 ✅
```

---

### Problem 8: Capacity to Ship Packages Within D Days

**LeetCode Link:** [https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/)

#### Problem Statement

Packages on a conveyor belt have weights `weights[i]`. A ship loads packages in order (left to right). Find the **minimum ship capacity** to ship all packages within `days` days.

**Example:**
```
Input: weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5
Output: 15
```

#### Clarifying Questions & Constraints

- Packages must be shipped **in order** (can't rearrange).
- A day's load is a contiguous group of packages.
- Minimum capacity ≥ max(weights) (must fit the heaviest package).
- Maximum capacity = sum(weights) (ship everything in one day).

#### Approach Discussion

This is another "binary search on answer" problem, almost identical in structure to Koko Eating Bananas.

- **Search space:** `capacity` ranges from `max(weights)` to `sum(weights)`.
- **Feasibility check:** With this capacity, how many days are needed? Count by greedily filling each day until the capacity is reached.
- **Monotonic:** Larger capacity → fewer days (always feasible if smaller capacity was).
- **We want:** Minimum capacity where days needed ≤ `days`.

- **Time:** O(n × log(sum(weights))), **Space:** O(1)

#### Code (Optimal Solution)

```python
def shipWithinDays(weights: list[int], days: int) -> int:
    """
    Find the minimum ship capacity to deliver all packages within 'days' days.
    
    Binary search on the answer (capacity):
    - Search space: [max(weights), sum(weights)]
    - Feasibility: can we ship everything in ≤ days using this capacity?
    - Monotonic: bigger ship → fewer days needed
    
    Time Complexity: O(n × log(sum(weights) - max(weights)))
        - Binary search: O(log(range)) iterations
        - Each feasibility check: O(n) to simulate loading
    Space Complexity: O(1)
    """
    def days_needed(capacity):
        """Simulate shipping: how many days to ship all packages at this capacity?"""
        current_load = 0
        num_days = 1  # Start with day 1
        
        for w in weights:
            if current_load + w > capacity:
                # This package doesn't fit today  -  start a new day
                num_days += 1
                current_load = w
            else:
                current_load += w
        
        return num_days
    
    # Binary search for the minimum feasible capacity
    low = max(weights)     # Must fit the heaviest package
    high = sum(weights)    # Ship everything in one day
    
    while low < high:
        mid = low + (high - low) // 2
        
        if days_needed(mid) <= days:
            high = mid          # This capacity works, try smaller
        else:
            low = mid + 1       # Not enough capacity, need bigger
    
    return low
```

#### Edge Cases

- **days == len(weights):** One package per day → capacity = max(weights).
- **days == 1:** Ship everything in one day → capacity = sum(weights).
- **All same weight:** `[5,5,5,5], days=2` → capacity = 10.

#### Dry Run

```
Input: weights = [1,2,3,4,5,6,7,8,9,10], days = 5

low = max = 10, high = sum = 55

mid=32: days_needed = simulate → 2 days (1+2+...+8=36>32, so day1=[1..7]=28, day2=[8,9,10]=27) 
        Actually let me be precise:
        day1: 1+2+3+4+5+6+7=28≤32, +8=36>32 → new day
        day2: 8+9=17≤32, +10=27≤32 → fits
        days=2, 2≤5 → high=32

mid=21: 1+2+3+4+5+6=21≤21, +7>21 → day2: 7+8=15≤21, +9=24>21 → day3: 9+10=19≤21
        days=3, 3≤5 → high=21

mid=15: 1+2+3+4+5=15≤15, +6>15 → day2: 6+7=13≤15, +8>15 → day3: 8≤15, +9>15 → day4: 9≤15, +10>15 → day5: 10
        days=5, 5≤5 → high=15

mid=12: 1+2+3+4=10≤12, +5=15>12 → day2: 5+6=11≤12, +7>12 → day3: 7≤12, +8>12 → day4: 8≤12, +9>12 → day5: 9≤12, +10>12 → day6: 10
        days=6, 6>5 → low=13

mid=14: 1+2+3+4=10≤14, +5=15>14 → day2: 5+6+7=18>14... 5+6=11≤14, +7=18>14 → day3: 7≤14, +8=15>14 → day4: 8≤14, +9>14 → day5: 9≤14, +10>14 → day6: 10
        days=6, 6>5 → low=15

low == high == 15 → return 15 ✅
```

---

### Problem 9: Split Array Largest Sum

**LeetCode Link:** [https://leetcode.com/problems/split-array-largest-sum/](https://leetcode.com/problems/split-array-largest-sum/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, split `nums` into `k` non-empty contiguous subarrays such that the **largest sum** among the subarrays is **minimized**. Return this minimized largest sum.

**Example:**
```
Input: nums = [7, 2, 5, 10, 8], k = 2
Output: 18
Explanation: Split as [7,2,5] and [10,8]. Largest sum = max(14, 18) = 18.
             This is the minimum possible largest sum for any 2-way split.
```

#### Clarifying Questions & Constraints

- Must split into exactly `k` contiguous subarrays.
- Each subarray must be non-empty.
- We're minimizing the maximum subarray sum (a minimax problem).

#### Approach Discussion

**Approach 1: Dynamic Programming**
- `dp[i][j]` = minimum largest sum when splitting `nums[0..i]` into `j` parts.
- **Time:** O(n² × k), **Space:** O(n × k)
- Works but is complex and slower.

**Approach 2: Binary Search on Answer (Optimal) ✅**

This is the same structure as the previous two problems.

- **Search space:** The largest subarray sum can range from `max(nums)` (each element is its own subarray, limited by the biggest) to `sum(nums)` (one subarray takes everything).
- **Feasibility check:** If the maximum allowed subarray sum is `limit`, how many subarrays (splits) do we need? Greedily fill subarrays up to `limit`, count how many we need.
- **Monotonic:** Larger `limit` → fewer splits needed. If `limit` allows ≤ k splits, it's feasible.
- **We want:** The smallest `limit` where splits needed ≤ k.

- **Time:** O(n × log(sum - max)), **Space:** O(1)

**Connection to "Capacity to Ship Packages":** This is the exact same problem with different words! "Split into k subarrays, minimize the largest sum" = "Ship in k days, minimize the capacity."

#### Code (Optimal Solution)

```python
def splitArray(nums: list[int], k: int) -> int:
    """
    Minimize the largest subarray sum when splitting into k parts.
    
    Binary search on the answer (maximum allowed sum per subarray):
    - Search space: [max(nums), sum(nums)]
    - Feasibility: with this max allowed sum, can we split into ≤ k parts?
    - Monotonic: larger allowed sum → fewer parts needed
    
    The feasibility check is identical to the "ship packages" problem:
    greedily fill each part up to the limit, count parts.
    
    Time Complexity: O(n × log(sum(nums) - max(nums)))
    Space Complexity: O(1)
    """
    def parts_needed(max_sum):
        """How many parts are needed if each part's sum is at most max_sum?"""
        current_sum = 0
        parts = 1
        
        for num in nums:
            if current_sum + num > max_sum:
                parts += 1
                current_sum = num
            else:
                current_sum += num
        
        return parts
    
    low = max(nums)       # At minimum, must handle the largest element
    high = sum(nums)      # At maximum, put everything in one part
    
    while low < high:
        mid = low + (high - low) // 2
        
        if parts_needed(mid) <= k:
            high = mid        # This limit works, try smaller
        else:
            low = mid + 1     # Need a larger limit
    
    return low
```

#### Edge Cases

- **k == 1:** Entire array in one subarray → return `sum(nums)`.
- **k == len(nums):** Each element is its own subarray → return `max(nums)`.
- **All equal:** `[5,5,5,5], k=2` → 10.

#### Dry Run

```
Input: nums = [7, 2, 5, 10, 8], k = 2

low = 10 (max), high = 32 (sum)

mid=21: parts? 7+2+5+10=24>21 → 7+2+5=14≤21, new part: 10+8=18≤21 → 2 parts
        2 ≤ 2 → high=21

mid=15: 7+2+5=14≤15, +10=24>15 → new part: 10+8=18>15 → new part: 8 → 3 parts
        3 > 2 → low=16

mid=18: 7+2+5=14≤18, +10=24>18 → new part: 10+8=18≤18 → 2 parts
        2 ≤ 2 → high=18

mid=17: 7+2+5=14≤17, +10=24>17 → new part: 10+8=18>17 → new part: 8 → 3 parts
        3 > 2 → low=18

low == high == 18 → return 18 ✅
```

---

### Problem 10: Median of Two Sorted Arrays

**LeetCode Link:** [https://leetcode.com/problems/median-of-two-sorted-arrays/](https://leetcode.com/problems/median-of-two-sorted-arrays/)

#### Problem Statement

Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).

**Example:**
```
Input: nums1 = [1, 3], nums2 = [2]
Output: 2.0  (merged: [1, 2, 3], median = 2)

Input: nums1 = [1, 2], nums2 = [3, 4]
Output: 2.5  (merged: [1, 2, 3, 4], median = (2+3)/2 = 2.5)
```

#### Clarifying Questions & Constraints

- Must be O(log(m+n))  -  cannot merge and sort (that's O(m+n)).
- Arrays can have different lengths.
- If total length is even, median = average of the two middle elements.

#### Approach Discussion

**Approach 1: Merge and Find Middle**
- Merge both arrays, find the middle.
- **Time:** O(m+n) ❌  -  violates the O(log) requirement.

**Approach 2: Binary Search on Partition (Optimal) ✅**

This is the hardest binary search problem in this set. The idea:

The median splits the combined elements into two equal halves. We need to find the correct "partition point" in both arrays such that:
- All elements on the left side ≤ all elements on the right side.
- Left side has exactly `(m+n+1) / 2` elements.

We binary search on the partition position in the **smaller** array (to minimize search space). The partition in the larger array is determined automatically.

**Partition concept:**
```
nums1: [... left1 ...] | [... right1 ...]
nums2: [... left2 ...] | [... right2 ...]

Combined left side: left1 + left2    (size = half of total)
Combined right side: right1 + right2

Valid partition: max(left1, left2) <= min(right1, right2)
```

- **Time:** O(log(min(m, n))), **Space:** O(1)

#### Code (Optimal Solution)

```python
def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    """
    Find the median of two sorted arrays using binary search on partition.
    
    Concept:
    We want to partition both arrays into left and right halves such that:
    1. len(left_total) == len(right_total) (or differ by 1)
    2. max(left_total) <= min(right_total)
    
    Binary search on the partition index of the SMALLER array.
    The partition of the larger array is derived: partition2 = half - partition1.
    
    We check if the partition is valid (condition 2). If not, adjust.
    
    Time Complexity: O(log(min(m, n))) - binary search on the smaller array
    Space Complexity: O(1)
    """
    # Always binary search on the smaller array
    if len(nums1) > len(nums2):
        return findMedianSortedArrays(nums2, nums1)
    
    m, n = len(nums1), len(nums2)
    half = (m + n + 1) // 2  # Size of the left half (ceiling for odd total)
    
    low, high = 0, m  # We can take 0 to m elements from nums1
    
    while low <= high:
        # partition1: how many elements we take from nums1 for the left half
        partition1 = low + (high - low) // 2
        # partition2: how many elements we take from nums2 for the left half
        partition2 = half - partition1
        
        # Edge values (use -inf and +inf for boundaries)
        # left1 = largest element on the left side from nums1
        # right1 = smallest element on the right side from nums1
        left1 = nums1[partition1 - 1] if partition1 > 0 else float('-inf')
        right1 = nums1[partition1] if partition1 < m else float('inf')
        left2 = nums2[partition2 - 1] if partition2 > 0 else float('-inf')
        right2 = nums2[partition2] if partition2 < n else float('inf')
        
        # Check if the partition is valid
        if left1 <= right2 and left2 <= right1:
            # Valid partition! Calculate the median.
            if (m + n) % 2 == 1:
                # Odd total: median is the max of the left half
                return max(left1, left2)
            else:
                # Even total: median is the average of max(left) and min(right)
                return (max(left1, left2) + min(right1, right2)) / 2
        
        elif left1 > right2:
            # Too many elements from nums1 on the left → move partition1 left
            high = partition1 - 1
        else:
            # Too few elements from nums1 on the left → move partition1 right
            low = partition1 + 1
    
    return 0.0  # Should never reach here with valid input
```

#### Edge Cases

- **One empty array:** `nums1=[], nums2=[1]` → 1.0.
- **One element each:** `[1], [2]` → 1.5.
- **Very different sizes:** `[1], [2,3,4,5,6]` → 3.5.
- **Same arrays:** `[1,2], [1,2]` → 1.5.
- **No overlap:** `[1,2], [3,4]` → 2.5.

#### Dry Run

```
Input: nums1 = [1, 3, 8, 9, 15], nums2 = [7, 11, 18, 19, 21, 25]

m=5 > n=6? No, but let's swap to use the smaller array.
Actually m=5, n=6, so nums1 is already smaller.

half = (5+6+1)//2 = 6 (left half has 6 elements)
low=0, high=5

Step 1: partition1=2, partition2=6-2=4
  left1=nums1[1]=3,  right1=nums1[2]=8
  left2=nums2[3]=19, right2=nums2[4]=21
  
  left1=3 ≤ right2=21 ✅
  left2=19 ≤ right1=8? ❌ (19 > 8)
  → Too few from nums1 on left. low = 3

Step 2: partition1=4, partition2=6-4=2
  left1=nums1[3]=9,  right1=nums1[4]=15
  left2=nums2[1]=11, right2=nums2[2]=18
  
  left1=9 ≤ right2=18 ✅
  left2=11 ≤ right1=15 ✅
  → Valid partition!
  
  Total = 11 (odd), so median = max(left1, left2) = max(9, 11) = 11

Output: 11 ✅

Verify: merged = [1,3,7,8,9,11,15,18,19,21,25], median at index 5 = 11 ✅
```

---

## Key Takeaways & Summary

### Quick Reference Table

| Problem | BS Type | Time | Space | Core Trick |
|---------|---------|------|-------|------------|
| Binary Search | Exact match | O(log n) | O(1) | Template 1: `low <= high` |
| Search Insert Position | Left boundary | O(log n) | O(1) | Template 2: first `>= target` |
| First and Last Position | Left + right boundary | O(log n) | O(1) | Two searches: leftmost and rightmost |
| Search a 2D Matrix | Exact match (flattened) | O(log(mn)) | O(1) | `row = mid//n, col = mid%n` |
| Rotated Sorted Array | Modified match | O(log n) | O(1) | One half is always sorted |
| Find Min in Rotated | Boundary | O(log n) | O(1) | Compare `mid` with `high` |
| Koko Eating Bananas | BS on answer | O(n log M) | O(1) | Minimize speed, check feasibility |
| Ship Packages | BS on answer | O(n log S) | O(1) | Same as Koko  -  minimize capacity |
| Split Array Largest Sum | BS on answer | O(n log S) | O(1) | Same structure  -  minimize max sum |
| Median of Two Arrays | BS on partition | O(log min(m,n)) | O(1) | Partition both arrays, validate |

### Decision Framework

```
Is the search space SORTED or does it have a MONOTONIC property?
│
├── Searching for an EXACT VALUE in a sorted array?
│   └── Template 1 (exact match)
│
├── Searching for a BOUNDARY (first/last occurrence, insertion point)?
│   ├── First occurrence / insertion point → Template 2 (left boundary)
│   └── Last occurrence → Template 3 (right boundary)
│
├── Sorted array with a TWIST (rotated, 2D)?
│   └── Modified binary search (identify which part is "normal")
│
└── Optimization problem  -  "minimum X such that condition holds"?
    └── Binary Search on Answer
        1. Define the search space: [minimum possible, maximum possible]
        2. Write is_feasible(x)  -  can check in O(n) or similar
        3. Binary search for the boundary where feasibility changes
```

### The Binary Search on Answer Checklist

When you suspect a problem uses binary search on answer, verify these three things:

1. **Can you define a clear search range?** There should be a minimum and maximum possible answer.

2. **Is the feasibility condition monotonic?** If answer `x` works, does `x+1` also work (or vice versa)? If yes, binary search applies.

3. **Can you write a feasibility check efficiently?** The `is_feasible(x)` function should run in O(n) or O(n log n), not O(n²).

If all three are yes, the solution structure is always the same:
```python
low, high = min_answer, max_answer
while low < high:
    mid = low + (high - low) // 2
    if is_feasible(mid):
        high = mid       # (or low = mid + 1 if looking for max)
    else:
        low = mid + 1    # (or high = mid - 1)
return low
```

### What's Next?

Binary search and two pointers form the foundation of "searching" in arrays. We've now covered five patterns: Two Pointers, Binary Search, Sliding Window, Prefix Sum, and HashMap. Next up is **Pattern 6: Kadane's Algorithm**  -  the classic technique for maximum subarray problems. Stay tuned!

---

> 💡 **Practice Tip:** The three "binary search on answer" problems (7, 8, 9) are almost identical in structure. Once you solve one, the others become straightforward. The real skill is *recognizing* that a problem fits this pattern  -  look for optimization with a monotonic feasibility condition.
