---
title: "Two Pointers Pattern — Complete Guide"
description: "Master the two pointers technique with clear explanations, Python implementations, and practice problems."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - dsa
  - dsa-patterns
---

# 🔰 Pattern 1: Two Pointers

## Table of Contents

1. [What is the Two Pointer Technique?](#what-is-the-two-pointer-technique)
2. [When to Use Two Pointers?](#when-to-use-two-pointers)
3. [Types of Two Pointer Patterns](#types-of-two-pointer-patterns)
4. [Visual Walkthrough](#visual-walkthrough)
5. [Template Code](#template-code)
6. [Problem Set](#problem-set)
   - [Problem 1: Two Sum II – Input Array Is Sorted](#problem-1-two-sum-ii--input-array-is-sorted)
   - [Problem 2: Valid Palindrome](#problem-2-valid-palindrome)
   - [Problem 3: Remove Duplicates from Sorted Array](#problem-3-remove-duplicates-from-sorted-array)
   - [Problem 4: Container With Most Water](#problem-4-container-with-most-water)
   - [Problem 5: 3Sum](#problem-5-3sum)
   - [Problem 6: Trapping Rain Water](#problem-6-trapping-rain-water)
   - [Problem 7: Sort Colors (Dutch National Flag)](#problem-7-sort-colors-dutch-national-flag)
   - [Problem 8: Move Zeroes](#problem-8-move-zeroes)
   - [Problem 9: Squares of a Sorted Array](#problem-9-squares-of-a-sorted-array)
   - [Problem 10: Merge Sorted Array](#problem-10-merge-sorted-array)
7. [Key Takeaways & Summary](#key-takeaways--summary)

---

## What is the Two Pointer Technique?

> **Two Pointers** is a technique where you use two index variables that move through an array or string — either toward each other from opposite ends, or in the same direction at different speeds — to solve a problem efficiently.

Let's understand why this is useful with a concrete problem.

**Problem:** Given a sorted array `[1, 3, 5, 7, 9, 11]`, find two numbers that add up to 12.

**Brute force approach:** Check every pair — `(1,3), (1,5), (1,7)...` — that's O(n²) comparisons.

**Two pointer approach:** Place one pointer at the start and one at the end:

```
[1, 3, 5, 7, 9, 11]    target = 12
 ^                 ^
 left            right   → 1 + 11 = 12 ✅ Found!
```

What if the target were 10?

```
Step 1: 1 + 11 = 12 > 10  → sum too big, move right ←
Step 2: 1 + 9  = 10       → ✅ Found!
```

What if the target were 8?

```
Step 1: 1 + 11 = 12 > 8   → move right ←
Step 2: 1 + 9  = 10 > 8   → move right ←
Step 3: 1 + 7  = 8        → ✅ Found!
```

Because the array is sorted, we know exactly which pointer to move: if the sum is too large, moving `right` leftward gives us a smaller value; if too small, moving `left` rightward gives us a larger value. This gives us an O(n) solution — each pointer moves at most n times.

### Why is it useful?

- **Reduces time complexity**: Often turns an O(n²) brute-force into an O(n) solution.
- **No extra space**: Works in-place, so usually O(1) extra space.
- **Simple to implement**: Once you spot the pattern, the code is clean and short.

---

## When to Use Two Pointers?

Look for these **signals** in a problem:

| Signal | Example |
|--------|---------|
| Array is **sorted** (or should be sorted) | "Given a sorted array, find two numbers that..." |
| Need to find a **pair/triplet** with a certain property | "Find two elements whose sum is X" |
| Need to **compare elements from both ends** | "Check if a string is a palindrome" |
| Need to **remove/rearrange in-place** | "Remove duplicates in-place" |
| Need to **partition** the array | "Move all zeroes to the end" |
| Involves **merging** two sorted structures | "Merge two sorted arrays" |

---

## Types of Two Pointer Patterns

### 1. Opposite Direction (Converging) Pointers

```
Array:  [1,  3,  5,  7,  9,  11]
         ^                    ^
        left               right

left moves →      ← right moves
They move toward each other until they meet.
```

**Use when:**
- Array is sorted and you need to find pairs
- Checking palindromes
- Problems involving "two ends" of the array

### 2. Same Direction (Fast & Slow) Pointers

```
Array:  [0,  0,  1,  1,  2,  3]
         ^   ^
        slow fast

Both move →
slow tracks the "valid" position, fast scans ahead.
```

**Use when:**
- Removing duplicates in-place
- Partitioning an array (e.g., move zeroes)
- Finding a specific element arrangement

### 3. Three Pointers (Extension)

```
Array:  [2,  0,  1,  2,  0,  1]
         ^            ^      ^
        low          mid    high

Used for 3-way partitioning (like Dutch National Flag).
```

---

## Visual Walkthrough

### Example: Find two numbers in a sorted array that sum to 10

```
Array: [1, 3, 4, 6, 8, 11]    Target: 10

Step 1: left=0, right=5  →  1 + 11 = 12 > 10  →  move right ←
        [1, 3, 4, 6, 8, 11]
         ^               ^

Step 2: left=0, right=4  →  1 + 8 = 9 < 10   →  move left →
        [1, 3, 4, 6, 8, 11]
         ^            ^

Step 3: left=1, right=4  →  3 + 8 = 11 > 10  →  move right ←
        [1, 3, 4, 6, 8, 11]
            ^         ^

Step 4: left=1, right=3  →  3 + 6 = 9 < 10   →  move left →
        [1, 3, 4, 6, 8, 11]
            ^      ^

Step 5: left=2, right=3  →  4 + 6 = 10 = target  ✅ FOUND!
        [1, 3, 4, 6, 8, 11]
               ^   ^
```

**Key Insight:** Because the array is sorted:
- If the sum is **too big** → we need a **smaller** number → move `right` left
- If the sum is **too small** → we need a **bigger** number → move `left` right

---

## Template Code

### Template 1: Opposite Direction Pointers

```python
def two_pointer_opposite(arr):
    """
    Template for converging (opposite direction) two pointers.
    Useful for: pair finding, palindrome checks, container problems.
    
    Time Complexity: O(n) — each pointer moves at most n times
    Space Complexity: O(1) — only two variables
    """
    left = 0
    right = len(arr) - 1
    
    while left < right:
        # Process current pair (arr[left], arr[right])
        
        if some_condition:
            left += 1       # Move left pointer forward
        elif other_condition:
            right -= 1      # Move right pointer backward
        else:
            # Found the answer or process result
            break  # or continue based on problem
    
    return result
```

### Template 2: Same Direction Pointers (Slow & Fast)

```python
def two_pointer_same_direction(arr):
    """
    Template for same-direction (slow/fast) two pointers.
    Useful for: removing duplicates, partitioning, rearranging.
    
    Time Complexity: O(n) — fast pointer traverses the array once
    Space Complexity: O(1) — in-place modification
    """
    slow = 0  # Tracks the position for next valid element
    
    for fast in range(len(arr)):
        if some_condition(arr[fast]):
            arr[slow] = arr[fast]
            slow += 1
    
    return slow  # Usually returns the new length
```

---

## Problem Set

### Difficulty Progression

| # | Problem | Difficulty | Key Concept |
|---|---------|-----------|-------------|
| 1 | Two Sum II | Easy | Opposite direction basics |
| 2 | Valid Palindrome | Easy | Opposite direction on strings |
| 3 | Remove Duplicates from Sorted Array | Easy | Same direction (slow/fast) |
| 4 | Container With Most Water | Medium | Opposite direction with greedy |
| 5 | 3Sum | Medium | Sort + two pointers |
| 6 | Trapping Rain Water | Hard | Opposite direction with tracking |
| 7 | Sort Colors | Medium | Three pointers |
| 8 | Move Zeroes | Easy | Same direction partitioning |
| 9 | Squares of a Sorted Array | Easy | Opposite direction with merge |
| 10 | Merge Sorted Array | Easy | Reverse two pointers |

---

### Problem 1: Two Sum II – Input Array Is Sorted

**LeetCode Link:** [https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

#### Problem Statement

Given a **1-indexed** sorted array `numbers`, find two numbers that add up to a specific `target`. Return their indices (1-indexed).

**Example:**
```
Input: numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]  (because numbers[0] + numbers[1] = 2 + 7 = 9)
```

#### Clarifying Questions & Constraints

- The array is **already sorted** in non-decreasing order.
- There is **exactly one** solution.
- You may **not** use the same element twice.
- The answer must use **constant extra space** (O(1)).

#### Approach Discussion

**Approach 1: Brute Force**
- Try every pair `(i, j)` where `i < j`.
- Check if `numbers[i] + numbers[j] == target`.
- **Time Complexity:** O(n²) — two nested loops
- **Space Complexity:** O(1)
- ❌ Too slow for large inputs. Doesn't use the "sorted" property at all.

**Approach 2: HashMap**
- For each number, check if `target - number` exists in a hashmap.
- **Time Complexity:** O(n)
- **Space Complexity:** O(n) — need extra space for the hashmap
- ❌ Works, but the problem says "constant extra space". Doesn't use the "sorted" property.

**Approach 3: Two Pointers (Optimal) ✅**
- Place `left` at index 0 and `right` at the last index.
- If `sum < target`, move `left` right (we need a bigger number).
- If `sum > target`, move `right` left (we need a smaller number).
- If `sum == target`, we found our answer!
- **Time Complexity:** O(n) — each pointer moves at most n steps
- **Space Complexity:** O(1) — only two variables

**Why does this work?**
Because the array is sorted! When the sum is too small, moving `left` forward guarantees a larger value. When the sum is too large, moving `right` backward guarantees a smaller value. We never skip a valid pair.

#### Code (Optimal Solution)

```python
def twoSum(numbers: list[int], target: int) -> list[int]:
    """
    Find two numbers in a sorted array that sum to target.
    Uses the two-pointer (opposite direction) technique.
    
    Args:
        numbers: A sorted (non-decreasing) list of integers (1-indexed in problem)
        target: The target sum we're looking for
    
    Returns:
        A list of two 1-indexed positions [i, j] where numbers[i-1] + numbers[j-1] = target
    
    Time Complexity: O(n) - each pointer moves at most n times total
    Space Complexity: O(1) - only two integer variables used
    """
    # Initialize two pointers at opposite ends
    left = 0
    right = len(numbers) - 1
    
    while left < right:
        # Calculate the current sum
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            # Found the pair! Return 1-indexed positions
            return [left + 1, right + 1]
        elif current_sum < target:
            # Sum is too small → we need a bigger number → move left forward
            left += 1
        else:
            # Sum is too big → we need a smaller number → move right backward
            right -= 1
    
    # Problem guarantees a solution exists, so we'll never reach here
    return []
```

#### Edge Cases

- **Array of length 2:** `[1, 3], target=4` → Only one pair to check, works fine.
- **Negative numbers:** `[-3, -1, 0, 2, 4], target=1` → Works because sorting handles negatives.
- **Duplicates:** `[1, 1, 3, 5], target=2` → Both pointers will find `[1, 2]`.

#### Dry Run

```
Input: numbers = [2, 7, 11, 15], target = 9

Step 1: left=0, right=3
        sum = numbers[0] + numbers[3] = 2 + 15 = 17
        17 > 9 → move right ← (right = 2)

Step 2: left=0, right=2
        sum = numbers[0] + numbers[2] = 2 + 11 = 13
        13 > 9 → move right ← (right = 1)

Step 3: left=0, right=1
        sum = numbers[0] + numbers[1] = 2 + 7 = 9
        9 == 9 → ✅ Found! Return [1, 2]

Output: [1, 2]
```

---

### Problem 2: Valid Palindrome

**LeetCode Link:** [https://leetcode.com/problems/valid-palindrome/](https://leetcode.com/problems/valid-palindrome/)

#### Problem Statement

Given a string `s`, determine if it is a palindrome, considering **only alphanumeric characters** and **ignoring cases**.

**Example:**
```
Input: s = "A man, a plan, a canal: Panama"
Output: True  (after cleanup: "amanaplanacanalpanama" is a palindrome)
```

#### Clarifying Questions & Constraints

- We ignore all non-alphanumeric characters (spaces, punctuation, etc.).
- Comparison is case-insensitive.
- An empty string is considered a valid palindrome.

#### Approach Discussion

**Approach 1: Clean + Reverse**
- Remove all non-alphanumeric characters, convert to lowercase.
- Check if the cleaned string equals its reverse.
- **Time Complexity:** O(n)
- **Space Complexity:** O(n) — creating the cleaned string
- ✅ Simple but uses extra space.

**Approach 2: Two Pointers (Optimal) ✅**
- Use `left` and `right` pointers starting from both ends.
- Skip non-alphanumeric characters.
- Compare characters (case-insensitive) at each step.
- **Time Complexity:** O(n)
- **Space Complexity:** O(1) — no extra string created

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Clean + Reverse (Simpler but O(n) space)
# ============================================================
def isPalindrome_clean(s: str) -> bool:
    """
    Check palindrome by cleaning the string first, then comparing with reverse.
    
    Time Complexity: O(n) - one pass to clean, one pass to reverse and compare
    Space Complexity: O(n) - storing the cleaned string
    """
    # Step 1: Keep only alphanumeric characters and convert to lowercase
    cleaned = ""
    for char in s:
        if char.isalnum():
            cleaned += char.lower()
    
    # Step 2: Check if cleaned string equals its reverse
    return cleaned == cleaned[::-1]


# ============================================================
# APPROACH 2: Two Pointers (Optimal — O(1) space)
# ============================================================
def isPalindrome(s: str) -> bool:
    """
    Check palindrome using two pointers without creating a new string.
    
    The idea: place one pointer at the start and one at the end.
    Skip non-alphanumeric characters. Compare characters at both pointers.
    If all pairs match → palindrome.
    
    Time Complexity: O(n) - each pointer traverses the string at most once
    Space Complexity: O(1) - only two integer pointers used
    """
    left = 0
    right = len(s) - 1
    
    while left < right:
        # Skip non-alphanumeric characters from the left
        while left < right and not s[left].isalnum():
            left += 1
        
        # Skip non-alphanumeric characters from the right
        while left < right and not s[right].isalnum():
            right -= 1
        
        # Compare characters (case-insensitive)
        if s[left].lower() != s[right].lower():
            return False  # Mismatch found → not a palindrome
        
        # Move both pointers inward
        left += 1
        right -= 1
    
    # All pairs matched → it's a palindrome
    return True
```

#### Edge Cases

- **Empty string:** `""` → True (nothing to mismatch).
- **Single character:** `"a"` → True.
- **Only non-alphanumeric:** `",.!?"` → True (no characters to compare).
- **Mixed case:** `"Aa"` → True (case-insensitive comparison).

#### Dry Run

```
Input: s = "A man, a plan, a canal: Panama"

Pointers start: left=0 ('A'), right=29 ('a')

Step 1: left=0 ('A'), right=29 ('a')
        'a' == 'a' ✅ → left=1, right=28

Step 2: left=1 (' ') → skip → left=2 ('m')
        right=28 ('m')
        'm' == 'm' ✅ → left=3, right=27

Step 3: left=3 ('a'), right=27 ('a')
        'a' == 'a' ✅ → left=4, right=26

... (continues, all characters match)

Final: left >= right → return True ✅
```

---

### Problem 3: Remove Duplicates from Sorted Array

**LeetCode Link:** [https://leetcode.com/problems/remove-duplicates-from-sorted-array/](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

#### Problem Statement

Given a sorted array `nums`, remove duplicates **in-place** such that each element appears only once. Return the number of unique elements.

**Example:**
```
Input: nums = [1, 1, 2]
Output: 2  (nums becomes [1, 2, _])
```

#### Clarifying Questions & Constraints

- Must modify the array **in-place** with O(1) extra space.
- The relative order of elements must be maintained.
- Return `k` = number of unique elements. First `k` elements of `nums` should hold the result.
- Elements beyond position `k` don't matter.

#### Approach Discussion

**Approach 1: Using a Set (Not In-Place)**
- Insert all elements into a set, copy back.
- **Time:** O(n), **Space:** O(n) ❌ Violates O(1) space constraint.

**Approach 2: Two Pointers — Slow & Fast (Optimal) ✅**
- `slow` marks where the next unique element should go.
- `fast` scans through the array looking for new unique values.
- Whenever `nums[fast] != nums[slow]`, we found a new unique element → copy it to `slow + 1`.
- **Time Complexity:** O(n), **Space Complexity:** O(1)

#### Code (Optimal Solution)

```python
def removeDuplicates(nums: list[int]) -> int:
    """
    Remove duplicates from a sorted array in-place using slow/fast pointers.
    
    How it works:
    - 'slow' always points to the last confirmed unique element.
    - 'fast' scans ahead looking for the next different element.
    - When fast finds something new, we place it right after slow.
    
    Time Complexity: O(n) - single pass through the array
    Space Complexity: O(1) - only two pointers, modification is in-place
    """
    # Edge case: empty array
    if not nums:
        return 0
    
    # 'slow' starts at index 0 — the first element is always unique
    slow = 0
    
    # 'fast' starts at index 1 and scans the rest of the array
    for fast in range(1, len(nums)):
        # If we found a new unique element (different from the last unique one)
        if nums[fast] != nums[slow]:
            slow += 1               # Move slow to the next position
            nums[slow] = nums[fast] # Place the new unique element there
    
    # 'slow' is the index of the last unique element
    # Number of unique elements = slow + 1
    return slow + 1
```

#### Edge Cases

- **Empty array:** `[]` → return 0.
- **All same:** `[7, 7, 7, 7]` → return 1, `nums = [7, ...]`.
- **Already unique:** `[1, 2, 3]` → return 3, no changes needed.
- **Length 1:** `[5]` → return 1.

#### Dry Run

```
Input: nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]

Initial: slow = 0

fast=1: nums[1]=0 == nums[0]=0 → skip
fast=2: nums[2]=1 != nums[0]=0 → slow=1, nums[1]=1 → [0,1,1,1,1,2,2,3,3,4]
fast=3: nums[3]=1 == nums[1]=1 → skip
fast=4: nums[4]=1 == nums[1]=1 → skip
fast=5: nums[5]=2 != nums[1]=1 → slow=2, nums[2]=2 → [0,1,2,1,1,2,2,3,3,4]
fast=6: nums[6]=2 == nums[2]=2 → skip
fast=7: nums[7]=3 != nums[2]=2 → slow=3, nums[3]=3 → [0,1,2,3,1,2,2,3,3,4]
fast=8: nums[8]=3 == nums[3]=3 → skip
fast=9: nums[9]=4 != nums[3]=3 → slow=4, nums[4]=4 → [0,1,2,3,4,2,2,3,3,4]

Return: slow + 1 = 5
First 5 elements: [0, 1, 2, 3, 4] ✅
```

---

### Problem 4: Container With Most Water

**LeetCode Link:** [https://leetcode.com/problems/container-with-most-water/](https://leetcode.com/problems/container-with-most-water/)

#### Problem Statement

Given `n` non-negative integers `height[0], height[1], ..., height[n-1]` where each represents a vertical line at position `i`, find two lines that together with the x-axis forms a container that holds the most water.

**Example:**
```
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49  (between index 1 and index 8: min(8,7) * (8-1) = 49)
```

#### Clarifying Questions & Constraints

- `n >= 2` (at least two lines).
- You cannot tilt the container.
- Water = `min(height[left], height[right]) * (right - left)`.

#### Approach Discussion

**Approach 1: Brute Force**
- Try every pair `(i, j)` and compute the area.
- **Time Complexity:** O(n²) — two nested loops
- **Space Complexity:** O(1)
- ❌ Too slow for large inputs.

**Approach 2: Two Pointers (Optimal) ✅**
- Start with the widest container (`left=0, right=n-1`).
- Calculate the area. Update the maximum.
- **Key insight:** Move the pointer with the **shorter** height, because:
  - The width is going to **decrease** no matter what.
  - So our only hope of finding a bigger area is to find a **taller** line.
  - Moving the taller line inward can never increase the area (the bottleneck is the shorter line).
- **Time Complexity:** O(n), **Space Complexity:** O(1)

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force — O(n²)
# ============================================================
def maxArea_brute(height: list[int]) -> int:
    """
    Try every pair of lines and compute the area.
    
    Time Complexity: O(n²) - checking all pairs
    Space Complexity: O(1)
    """
    max_water = 0
    n = len(height)
    
    for i in range(n):
        for j in range(i + 1, n):
            # Water is limited by the shorter line
            water = min(height[i], height[j]) * (j - i)
            max_water = max(max_water, water)
    
    return max_water


# ============================================================
# APPROACH 2: Two Pointers — O(n) ✅
# ============================================================
def maxArea(height: list[int]) -> int:
    """
    Find the maximum water container using two pointers.
    
    Strategy:
    - Start with the widest container (pointers at both ends).
    - Always move the pointer pointing to the SHORTER line.
    - Why? The area is limited by the shorter line. Moving the taller 
      line inward will only decrease width without helping the height 
      bottleneck. Moving the shorter line gives us a chance at finding 
      a taller line.
    
    Time Complexity: O(n) - each pointer moves at most n times total
    Space Complexity: O(1) - only three variables
    """
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        # Calculate the area formed by the two current lines
        # Height = the shorter of the two lines
        # Width = distance between the two lines
        width = right - left
        current_height = min(height[left], height[right])
        current_water = current_height * width
        
        # Update the maximum area found so far
        max_water = max(max_water, current_water)
        
        # Move the pointer with the shorter line inward
        # (If equal, moving either is fine — both are equally limiting)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water
```

#### Edge Cases

- **Two elements:** `[1, 1]` → area = `min(1,1) * 1 = 1`.
- **Descending order:** `[5, 4, 3, 2, 1]` → max area at widest possible with good heights.
- **One very tall line:** `[1, 1, 1, 100, 1, 1]` → the tall line doesn't help alone.

#### Dry Run

```
Input: height = [1, 8, 6, 2, 5, 4, 8, 3, 7]

Step 1: left=0(h=1), right=8(h=7)
        area = min(1,7) * 8 = 8,  max_water = 8
        height[left]=1 < height[right]=7 → left++

Step 2: left=1(h=8), right=8(h=7)
        area = min(8,7) * 7 = 49, max_water = 49
        height[left]=8 > height[right]=7 → right--

Step 3: left=1(h=8), right=7(h=3)
        area = min(8,3) * 6 = 18, max_water = 49
        height[left]=8 > height[right]=3 → right--

Step 4: left=1(h=8), right=6(h=8)
        area = min(8,8) * 5 = 40, max_water = 49
        height[left]=8 == height[right]=8 → right--

Step 5: left=1(h=8), right=5(h=4)
        area = min(8,4) * 4 = 16, max_water = 49
        height[left]=8 > height[right]=4 → right--

Step 6: left=1(h=8), right=4(h=5)
        area = min(8,5) * 3 = 15, max_water = 49
        height[left]=8 > height[right]=5 → right--

Step 7: left=1(h=8), right=3(h=2)
        area = min(8,2) * 2 = 4,  max_water = 49
        height[left]=8 > height[right]=2 → right--

Step 8: left=1(h=8), right=2(h=6)
        area = min(8,6) * 1 = 6,  max_water = 49
        height[left]=8 > height[right]=6 → right--

left >= right → STOP

Output: 49 ✅
```

---

### Problem 5: 3Sum

**LeetCode Link:** [https://leetcode.com/problems/3sum/](https://leetcode.com/problems/3sum/)

#### Problem Statement

Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`. The result must **not contain duplicate triplets**.

**Example:**
```
Input: nums = [-1, 0, 1, 2, -1, -4]
Output: [[-1, -1, 2], [-1, 0, 1]]
```

#### Clarifying Questions & Constraints

- Result set must not contain duplicate triplets (order doesn't matter).
- `3 <= nums.length <= 3000`
- Array is **not** sorted initially.
- Elements can be negative, zero, or positive.

#### Approach Discussion

**Approach 1: Brute Force (Three Nested Loops)**
- Check every combination of three elements.
- Use a set to avoid duplicates.
- **Time:** O(n³), **Space:** O(n) for the set
- ❌ Way too slow.

**Approach 2: Sort + Two Pointers (Optimal) ✅**
- **Sort** the array first.
- Fix one element (`nums[i]`) and use Two Pointers to find two elements in the remaining part that sum to `-nums[i]`.
- Skip duplicates at each level to avoid duplicate triplets.
- **Time Complexity:** O(n²) — O(n log n) for sort + O(n) × O(n) for nested two-pointer
- **Space Complexity:** O(1) extra (ignoring the output and sort space)

**Why sort?**
Sorting lets us:
1. Use the two-pointer technique (needs sorted data).
2. Easily skip duplicates by checking `nums[i] == nums[i-1]`.

#### Code (Optimal Solution)

```python
def threeSum(nums: list[int]) -> list[list[int]]:
    """
    Find all unique triplets that sum to zero using sort + two pointers.
    
    Strategy:
    1. Sort the array.
    2. For each element nums[i], use two pointers on the remaining subarray
       to find pairs that sum to -nums[i].
    3. Skip duplicates at every level to ensure unique triplets.
    
    Time Complexity: O(n²)
        - Sorting: O(n log n)
        - Outer loop: O(n), inner two-pointer: O(n) → total O(n²)
        - Overall: O(n²) dominates
    Space Complexity: O(1) extra (not counting the output list)
        - Sorting may use O(log n) depending on implementation
    """
    nums.sort()  # Step 1: Sort the array
    result = []
    n = len(nums)
    
    for i in range(n - 2):  # Fix the first element
        # OPTIMIZATION: If nums[i] > 0, no triplet can sum to 0
        # (all remaining elements are >= nums[i] > 0)
        if nums[i] > 0:
            break
        
        # SKIP DUPLICATES for the first element
        # If nums[i] == nums[i-1], we've already processed this value
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        # Two pointers for the remaining subarray
        left = i + 1
        right = n - 1
        target = -nums[i]  # We need nums[left] + nums[right] = -nums[i]
        
        while left < right:
            current_sum = nums[left] + nums[right]
            
            if current_sum < target:
                # Sum too small → need a bigger number → move left forward
                left += 1
            elif current_sum > target:
                # Sum too big → need a smaller number → move right backward
                right -= 1
            else:
                # Found a valid triplet!
                result.append([nums[i], nums[left], nums[right]])
                
                # SKIP DUPLICATES for the second element
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                
                # SKIP DUPLICATES for the third element
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                
                # Move both pointers inward to look for more triplets
                left += 1
                right -= 1
    
    return result
```

#### Edge Cases

- **All zeros:** `[0, 0, 0, 0]` → `[[0, 0, 0]]` (only one unique triplet).
- **No valid triplets:** `[1, 2, 3]` → `[]`.
- **All positive:** `[1, 2, 3, 4]` → `[]` (can't sum to 0).
- **Heavy duplicates:** `[-1, -1, -1, 2, 2]` → `[[-1, -1, 2]]`.

#### Dry Run

```
Input: nums = [-1, 0, 1, 2, -1, -4]
After sort: [-4, -1, -1, 0, 1, 2]

i=0: nums[0] = -4, target = 4
     left=1(-1), right=5(2): sum = -1+2 = 1 < 4 → left++
     left=2(-1), right=5(2): sum = -1+2 = 1 < 4 → left++
     left=3(0),  right=5(2): sum = 0+2 = 2 < 4 → left++
     left=4(1),  right=5(2): sum = 1+2 = 3 < 4 → left++
     left=5 >= right=5 → STOP

i=1: nums[1] = -1, target = 1
     left=2(-1), right=5(2): sum = -1+2 = 1 == 1 ✅
         → add [-1, -1, 2]
         → skip duplicate left: nums[2]==nums[3]? -1==0? No
         → skip duplicate right: nums[5]==nums[4]? 2==1? No
         → left=3, right=4
     left=3(0), right=4(1): sum = 0+1 = 1 == 1 ✅
         → add [-1, 0, 1]
         → left=4, right=3 → STOP

i=2: nums[2] = -1, but nums[2]==nums[1] → SKIP (duplicate)

i=3: nums[3] = 0, target = 0
     left=4(1), right=5(2): sum = 1+2 = 3 > 0 → right--
     left=4 >= right=4 → STOP

Output: [[-1, -1, 2], [-1, 0, 1]] ✅
```

---

### Problem 6: Trapping Rain Water

**LeetCode Link:** [https://leetcode.com/problems/trapping-rain-water/](https://leetcode.com/problems/trapping-rain-water/)

#### Problem Statement

Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

**Example:**
```
Input: height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
Output: 6
```

#### Clarifying Questions & Constraints

- `n >= 1`
- `height[i] >= 0`
- Water at position `i` = `min(max_left, max_right) - height[i]` (if positive)

#### Approach Discussion

**Approach 1: Brute Force**
- For each bar, find the tallest bar to its left and right.
- Water at position `i` = `min(left_max, right_max) - height[i]`.
- **Time:** O(n²), **Space:** O(1)
- ❌ Too slow for large inputs.

**Approach 2: Prefix/Suffix Arrays**
- Pre-compute `left_max[i]` and `right_max[i]` arrays.
- **Time:** O(n), **Space:** O(n) — two extra arrays

**Approach 3: Two Pointers (Optimal) ✅**
- Use `left` and `right` pointers from both ends.
- Track `left_max` and `right_max` as we go.
- **Key insight:** If `left_max < right_max`, the water at `left` is determined by `left_max` (regardless of the actual `right_max`, it's at least as high). So we can safely process the left side.
- **Time Complexity:** O(n), **Space Complexity:** O(1)

#### Code (Optimal Solution)

```python
def trap(height: list[int]) -> int:
    """
    Calculate trapped rainwater using two pointers.
    
    Core Insight:
    Water at any position depends on min(max_left, max_right) - height[i].
    
    If left_max < right_max:
        → The water at 'left' is bounded by left_max (since right_max is even bigger,
          it won't be the bottleneck). So we can safely calculate water at 'left'.
    If right_max <= left_max:
        → Same logic applies to the 'right' side.
    
    Time Complexity: O(n) - single pass with two pointers
    Space Complexity: O(1) - only a few variables
    """
    if not height:
        return 0
    
    left = 0
    right = len(height) - 1
    left_max = 0   # Tallest bar seen from the left so far
    right_max = 0  # Tallest bar seen from the right so far
    water = 0
    
    while left < right:
        if height[left] < height[right]:
            # Process the left side
            if height[left] >= left_max:
                # Current bar is taller than anything seen from left → no water here
                # Update left_max
                left_max = height[left]
            else:
                # Water can be trapped: left_max - height[left]
                water += left_max - height[left]
            left += 1
        else:
            # Process the right side
            if height[right] >= right_max:
                # Current bar is taller than anything seen from right → no water here
                right_max = height[right]
            else:
                # Water can be trapped: right_max - height[right]
                water += right_max - height[right]
            right -= 1
    
    return water
```

#### Edge Cases

- **Flat:** `[3, 3, 3]` → 0 (no dips to trap water).
- **Single bar:** `[5]` → 0.
- **Ascending:** `[1, 2, 3, 4]` → 0 (water runs off the left).
- **Descending:** `[4, 3, 2, 1]` → 0 (water runs off the right).
- **V-shape:** `[3, 0, 3]` → 3.

#### Dry Run

```
Input: height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]

Initial: left=0, right=11, left_max=0, right_max=0, water=0

Step 1:  h[0]=0 < h[11]=1  → process left
         h[0]=0 >= left_max=0 → left_max=0, left=1

Step 2:  h[1]=1 >= h[11]=1 → process right
         h[11]=1 >= right_max=0 → right_max=1, right=10

Step 3:  h[1]=1 < h[10]=2  → process left
         h[1]=1 >= left_max=0 → left_max=1, left=2

Step 4:  h[2]=0 < h[10]=2  → process left
         h[2]=0 < left_max=1 → water += 1-0 = 1, left=3      water=1

Step 5:  h[3]=2 >= h[10]=2 → process right
         h[10]=2 >= right_max=1 → right_max=2, right=9

Step 6:  h[3]=2 >= h[9]=1  → process right
         h[9]=1 < right_max=2 → water += 2-1 = 1, right=8     water=2

Step 7:  h[3]=2 >= h[8]=2  → process right
         h[8]=2 >= right_max=2 → right_max=2, right=7

Step 8:  h[3]=2 < h[7]=3   → process left
         h[3]=2 >= left_max=1 → left_max=2, left=4

Step 9:  h[4]=1 < h[7]=3   → process left
         h[4]=1 < left_max=2 → water += 2-1 = 1, left=5       water=3

Step 10: h[5]=0 < h[7]=3   → process left
         h[5]=0 < left_max=2 → water += 2-0 = 2, left=6       water=5

Step 11: h[6]=1 < h[7]=3   → process left
         h[6]=1 < left_max=2 → water += 2-1 = 1, left=7       water=6

left=7 >= right=7 → STOP

Output: 6 ✅
```

---

### Problem 7: Sort Colors (Dutch National Flag)

**LeetCode Link:** [https://leetcode.com/problems/sort-colors/](https://leetcode.com/problems/sort-colors/)

#### Problem Statement

Given an array `nums` with `n` objects colored red (0), white (1), and blue (2), sort them **in-place** so that objects of the same color are adjacent, in the order red, white, blue.

**Example:**
```
Input: nums = [2, 0, 2, 1, 1, 0]
Output: [0, 0, 1, 1, 2, 2]
```

#### Clarifying Questions & Constraints

- Must solve in-place without using the library sort function.
- One-pass algorithm is preferred.
- Only contains values 0, 1, and 2.

#### Approach Discussion

**Approach 1: Counting Sort**
- Count the number of 0s, 1s, and 2s, then overwrite the array.
- **Time:** O(n), **Space:** O(1)
- ✅ Works but requires **two passes** (one to count, one to write).

**Approach 2: Dutch National Flag — Three Pointers (Optimal) ✅**
- Use three pointers: `low`, `mid`, `high`.
- `low` = boundary for 0s (everything before `low` is 0)
- `mid` = current element being examined
- `high` = boundary for 2s (everything after `high` is 2)
- **Time:** O(n), **Space:** O(1), **single pass**

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Counting Sort — Two passes
# ============================================================
def sortColors_count(nums: list[int]) -> None:
    """
    Count occurrences of 0, 1, 2, then overwrite the array.
    
    Time Complexity: O(n) - two passes through the array
    Space Complexity: O(1) - only three counters
    """
    count = [0, 0, 0]
    
    # Pass 1: Count each color
    for num in nums:
        count[num] += 1
    
    # Pass 2: Overwrite the array
    idx = 0
    for color in range(3):
        for _ in range(count[color]):
            nums[idx] = color
            idx += 1


# ============================================================
# APPROACH 2: Dutch National Flag — Single pass ✅
# ============================================================
def sortColors(nums: list[int]) -> None:
    """
    Sort colors in a single pass using three pointers (Dutch National Flag).
    
    Pointer roles:
    - low:  Everything BEFORE low is guaranteed to be 0
    - mid:  Current element being examined
    - high: Everything AFTER high is guaranteed to be 2
    - Between low and mid: all 1s
    
    Array zones: [0...0 | 1...1 | unsorted | 2...2]
                  0   low    mid        high    n-1
    
    Rules:
    - If nums[mid] == 0: swap with low, move both forward
    - If nums[mid] == 1: it's in the right place, just move mid
    - If nums[mid] == 2: swap with high, move high back (DON'T move mid!)
    
    Why don't we move mid when swapping with high?
    Because the element swapped FROM high is unexamined — it could be 0, 1, or 2.
    
    Time Complexity: O(n) - single pass, mid moves from 0 to high
    Space Complexity: O(1) - only three pointers
    """
    low = 0               # Next position for 0
    mid = 0               # Current element
    high = len(nums) - 1  # Next position for 2
    
    while mid <= high:
        if nums[mid] == 0:
            # Swap current element with the low boundary
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1   # Expand the 0-zone
            mid += 1   # Safe to move forward (swapped element is 0 or 1)
        
        elif nums[mid] == 1:
            # 1 is already in the middle section — just skip it
            mid += 1
        
        else:  # nums[mid] == 2
            # Swap current element with the high boundary
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1  # Expand the 2-zone
            # DON'T increment mid! The swapped element needs to be examined
```

#### Edge Cases

- **Already sorted:** `[0, 0, 1, 2, 2]` → no swaps needed.
- **Reverse sorted:** `[2, 2, 1, 0, 0]` → fully rearranged.
- **All same:** `[1, 1, 1]` → no swaps.
- **Single element:** `[0]` → already sorted.

#### Dry Run

```
Input: nums = [2, 0, 2, 1, 1, 0]

Initial: low=0, mid=0, high=5

mid=0: nums[0]=2 → swap(nums[0], nums[5]) → [0,0,2,1,1,2], high=4
       DON'T move mid (need to check swapped value)

mid=0: nums[0]=0 → swap(nums[0], nums[0]) → [0,0,2,1,1,2], low=1, mid=1

mid=1: nums[1]=0 → swap(nums[1], nums[1]) → [0,0,2,1,1,2], low=2, mid=2

mid=2: nums[2]=2 → swap(nums[2], nums[4]) → [0,0,1,1,2,2], high=3

mid=2: nums[2]=1 → mid=3

mid=3: nums[3]=1 → mid=4

mid=4 > high=3 → STOP

Result: [0, 0, 1, 1, 2, 2] ✅
```

---

### Problem 8: Move Zeroes

**LeetCode Link:** [https://leetcode.com/problems/move-zeroes/](https://leetcode.com/problems/move-zeroes/)

#### Problem Statement

Given an array `nums`, move all `0`s to the end while maintaining the relative order of the non-zero elements. Must be done **in-place**.

**Example:**
```
Input: nums = [0, 1, 0, 3, 12]
Output: [1, 3, 12, 0, 0]
```

#### Clarifying Questions & Constraints

- Must be in-place (no extra array).
- Maintain relative order of non-zero elements.
- Minimize the total number of operations.

#### Approach Discussion

**Approach 1: Using Extra Array**
- Collect all non-zero elements, then append zeros.
- **Time:** O(n), **Space:** O(n) ❌ Not in-place.

**Approach 2: Two Pointers — Slow & Fast (Optimal) ✅**
- `slow` tracks where the next non-zero element should go.
- `fast` scans through the array.
- When `fast` finds a non-zero, swap it with `slow` position.
- **Time:** O(n), **Space:** O(1)

#### Code (Optimal Solution)

```python
def moveZeroes(nums: list[int]) -> None:
    """
    Move all zeroes to the end using the slow/fast pointer technique.
    
    How it works:
    - 'slow' points to the position where the next non-zero should go.
    - 'fast' scans the entire array.
    - When fast finds a non-zero, we swap it into the slow position.
    - This naturally pushes all zeros toward the end.
    
    Why swap instead of overwrite?
    Swapping preserves all elements. Overwriting would lose zeros
    and require a separate step to fill them in.
    
    Time Complexity: O(n) - single pass through the array
    Space Complexity: O(1) - only two pointers
    """
    slow = 0  # Position for next non-zero element
    
    for fast in range(len(nums)):
        if nums[fast] != 0:
            # Swap the non-zero element into the 'slow' position
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    
    # After the loop:
    # - Elements before 'slow' are all non-zero (in original order)
    # - Elements from 'slow' onward are all zeros
```

#### Edge Cases

- **No zeros:** `[1, 2, 3]` → unchanged.
- **All zeros:** `[0, 0, 0]` → unchanged.
- **Zeros at start:** `[0, 0, 1]` → `[1, 0, 0]`.
- **Single element:** `[0]` or `[5]` → unchanged.

#### Dry Run

```
Input: nums = [0, 1, 0, 3, 12]

Initial: slow = 0

fast=0: nums[0]=0 → skip (it's zero)
fast=1: nums[1]=1 → swap(nums[0], nums[1]) → [1,0,0,3,12], slow=1
fast=2: nums[2]=0 → skip
fast=3: nums[3]=3 → swap(nums[1], nums[3]) → [1,3,0,0,12], slow=2
fast=4: nums[4]=12 → swap(nums[2], nums[4]) → [1,3,12,0,0], slow=3

Output: [1, 3, 12, 0, 0] ✅
```

---

### Problem 9: Squares of a Sorted Array

**LeetCode Link:** [https://leetcode.com/problems/squares-of-a-sorted-array/](https://leetcode.com/problems/squares-of-a-sorted-array/)

#### Problem Statement

Given an integer array `nums` sorted in **non-decreasing order**, return an array of the squares of each number sorted in non-decreasing order.

**Example:**
```
Input: nums = [-4, -1, 0, 3, 10]
Output: [0, 1, 9, 16, 100]
```

#### Clarifying Questions & Constraints

- Array is sorted (can have negative numbers).
- Need to return a **new** sorted array of squares.
- Must be O(n) — can't just square and sort (that's O(n log n)).

#### Approach Discussion

**Approach 1: Square + Sort**
- Square every element, then sort.
- **Time:** O(n log n), **Space:** O(n)
- ❌ Not O(n).

**Approach 2: Two Pointers from Both Ends (Optimal) ✅**
- **Key insight:** The largest squares are at the **ends** of the array (since negatives with large absolute value and large positives both produce large squares).
- Use two pointers from both ends, compare absolute values, and fill the result array from **right to left** (largest to smallest).
- **Time:** O(n), **Space:** O(n) (for the result array — required)

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Square + Sort — O(n log n)
# ============================================================
def sortedSquares_sort(nums: list[int]) -> list[int]:
    """
    Square every element and sort the result.
    
    Time Complexity: O(n log n) - dominated by sorting
    Space Complexity: O(n) - for the result array
    """
    return sorted(x * x for x in nums)


# ============================================================
# APPROACH 2: Two Pointers — O(n) ✅
# ============================================================
def sortedSquares(nums: list[int]) -> list[int]:
    """
    Produce sorted squares using two pointers from both ends.
    
    Key insight: In a sorted array with negatives, the LARGEST squares
    are at the ends (e.g., [-4, -1, 0, 3, 10] → squares: [16, 1, 0, 9, 100]).
    The largest is either at the far left or far right.
    
    Strategy: Compare absolute values at both ends, place the larger
    square at the END of the result array, and work backwards.
    
    Time Complexity: O(n) - single pass through the array
    Space Complexity: O(n) - for the result array (can't avoid this)
    """
    n = len(nums)
    result = [0] * n      # Pre-allocate result array
    left = 0
    right = n - 1
    pos = n - 1            # Fill from the end (largest first)
    
    while left <= right:
        left_sq = nums[left] ** 2
        right_sq = nums[right] ** 2
        
        if left_sq > right_sq:
            # Left end has the larger square
            result[pos] = left_sq
            left += 1
        else:
            # Right end has the larger square (or they're equal)
            result[pos] = right_sq
            right -= 1
        
        pos -= 1  # Move to the next position (going backwards)
    
    return result
```

#### Edge Cases

- **All positive:** `[1, 2, 3]` → `[1, 4, 9]`.
- **All negative:** `[-3, -2, -1]` → `[1, 4, 9]`.
- **Single element:** `[5]` → `[25]`.
- **Zeros:** `[-2, 0, 0, 3]` → `[0, 0, 4, 9]`.

#### Dry Run

```
Input: nums = [-4, -1, 0, 3, 10]

Initial: left=0, right=4, pos=4, result=[0,0,0,0,0]

Step 1: left_sq = (-4)²=16, right_sq = 10²=100
        100 > 16 → result[4]=100, right=3
        result = [0, 0, 0, 0, 100]

Step 2: left_sq = (-4)²=16, right_sq = 3²=9
        16 > 9 → result[3]=16, left=1
        result = [0, 0, 0, 16, 100]

Step 3: left_sq = (-1)²=1, right_sq = 3²=9
        9 > 1 → result[2]=9, right=2
        result = [0, 0, 9, 16, 100]

Step 4: left_sq = (-1)²=1, right_sq = 0²=0
        1 > 0 → result[1]=1, left=2
        result = [0, 1, 9, 16, 100]

Step 5: left=2, right=2 (left <= right)
        left_sq = 0²=0, right_sq = 0²=0
        0 == 0 → result[0]=0, right=1
        result = [0, 1, 9, 16, 100]

left=2 > right=1 → STOP

Output: [0, 1, 9, 16, 100] ✅
```

---

### Problem 10: Merge Sorted Array

**LeetCode Link:** [https://leetcode.com/problems/merge-sorted-array/](https://leetcode.com/problems/merge-sorted-array/)

#### Problem Statement

Given two sorted arrays `nums1` and `nums2`, merge `nums2` into `nums1` as one sorted array **in-place**. `nums1` has a size of `m + n`, where the first `m` elements are the actual values and the rest are 0s (placeholders).

**Example:**
```
Input: nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3
Output: [1, 2, 2, 3, 5, 6]
```

#### Clarifying Questions & Constraints

- `nums1` has enough space (size `m + n`) to hold all elements.
- Must be done **in-place** in `nums1`.
- Both arrays are sorted in non-decreasing order.

#### Approach Discussion

**Approach 1: Merge + Sort**
- Copy `nums2` into the extra space in `nums1`, then sort.
- **Time:** O((m+n) log(m+n)), **Space:** O(1)
- ❌ Doesn't leverage the sorted property.

**Approach 2: Two Pointers from Front (with extra space)**
- Standard merge like in merge sort.
- **Time:** O(m+n), **Space:** O(m) — need temp array
- ❌ Uses extra space.

**Approach 3: Two Pointers from Back (Optimal) ✅**
- **Key insight:** Start filling `nums1` from the **end** (rightmost position). Compare the largest remaining elements from both arrays.
- This way, we never overwrite elements in `nums1` that we haven't processed yet!
- **Time:** O(m+n), **Space:** O(1)

#### Code (Optimal Solution)

```python
def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    """
    Merge nums2 into nums1 in-place using two pointers from the back.
    
    Why from the back?
    If we start from the front, we'd overwrite elements in nums1 that
    we still need. But the END of nums1 is just zeros (placeholders),
    so it's safe to write there!
    
    Strategy:
    - p1 points to the last real element in nums1 (index m-1)
    - p2 points to the last element in nums2 (index n-1)
    - pos points to the last position in nums1 (index m+n-1)
    - Compare nums1[p1] and nums2[p2], place the larger one at pos
    
    Time Complexity: O(m + n) - each element is placed exactly once
    Space Complexity: O(1) - everything is done in-place
    """
    # Pointers starting from the end
    p1 = m - 1       # Last real element in nums1
    p2 = n - 1       # Last element in nums2
    pos = m + n - 1  # Last position in nums1 (where we'll place elements)
    
    # Merge from back to front
    while p1 >= 0 and p2 >= 0:
        if nums1[p1] > nums2[p2]:
            # nums1's element is larger → place it at the end
            nums1[pos] = nums1[p1]
            p1 -= 1
        else:
            # nums2's element is larger (or equal) → place it at the end
            nums1[pos] = nums2[p2]
            p2 -= 1
        pos -= 1
    
    # If there are remaining elements in nums2, copy them
    # (If p1 >= 0, those elements are already in place in nums1!)
    while p2 >= 0:
        nums1[pos] = nums2[p2]
        p2 -= 1
        pos -= 1
```

#### Edge Cases

- **nums2 is empty:** `nums1=[1], m=1, nums2=[], n=0` → no changes.
- **nums1 is empty:** `nums1=[0,0], m=0, nums2=[1,2], n=2` → just copy nums2.
- **All nums2 smaller:** `nums1=[3,4,5,0,0], m=3, nums2=[1,2], n=2` → `[1,2,3,4,5]`.
- **All nums2 larger:** `nums1=[1,2,0,0], m=2, nums2=[3,4], n=2` → `[1,2,3,4]`.

#### Dry Run

```
Input: nums1 = [1, 2, 3, 0, 0, 0], m=3, nums2 = [2, 5, 6], n=3

Initial: p1=2, p2=2, pos=5

Step 1: nums1[2]=3 vs nums2[2]=6 → 6 is bigger
        nums1[5]=6, p2=1, pos=4
        nums1 = [1, 2, 3, 0, 0, 6]

Step 2: nums1[2]=3 vs nums2[1]=5 → 5 is bigger
        nums1[4]=5, p2=0, pos=3
        nums1 = [1, 2, 3, 0, 5, 6]

Step 3: nums1[2]=3 vs nums2[0]=2 → 3 is bigger
        nums1[3]=3, p1=1, pos=2
        nums1 = [1, 2, 3, 3, 5, 6]

Step 4: nums1[1]=2 vs nums2[0]=2 → equal, place nums2
        nums1[2]=2, p2=-1, pos=1
        nums1 = [1, 2, 2, 3, 5, 6]

p2 < 0 → STOP (remaining nums1 elements are already in place)

Output: [1, 2, 2, 3, 5, 6] ✅
```

---

## Key Takeaways & Summary

### Quick Reference Table

| Problem | Pattern Type | Time | Space | Core Trick |
|---------|-------------|------|-------|------------|
| Two Sum II | Opposite direction | O(n) | O(1) | Sorted → shrink search space from both ends |
| Valid Palindrome | Opposite direction | O(n) | O(1) | Skip non-alphanumeric, compare ends |
| Remove Duplicates | Same direction | O(n) | O(1) | Slow tracks unique, fast scans |
| Container With Most Water | Opposite direction | O(n) | O(1) | Move the shorter line inward |
| 3Sum | Sort + opposite | O(n²) | O(1) | Fix one, two-pointer for rest, skip duplicates |
| Trapping Rain Water | Opposite direction | O(n) | O(1) | Process the side with smaller max |
| Sort Colors | Three pointers | O(n) | O(1) | Dutch National Flag partitioning |
| Move Zeroes | Same direction | O(n) | O(1) | Swap non-zeros to the front |
| Squares of Sorted Array | Opposite direction | O(n) | O(n) | Largest squares at ends, fill backwards |
| Merge Sorted Array | Reverse two pointers | O(m+n) | O(1) | Fill from the back to avoid overwriting |

### Pattern Recognition Cheat Sheet

```
Is the array sorted (or should you sort it)?
├── YES → Can you use OPPOSITE direction pointers?
│         ├── Finding a pair with target sum? → Two Sum II pattern
│         ├── Finding triplets? → 3Sum pattern (fix one + two pointers)
│         ├── Comparing from both ends? → Palindrome / Container pattern
│         └── Merging two sorted things? → Merge pattern (consider reverse!)
│
└── NO  → Can you use SAME direction (slow/fast) pointers?
          ├── Removing elements in-place? → Remove Duplicates / Move Zeroes
          ├── Partitioning by categories? → Dutch National Flag
          └── Need to track running max from both sides? → Trapping Rain Water
```

### Top 5 Things to Remember

1. **Sorted array = Think two pointers first.** The sorted property is what makes moving pointers inward safe — you know which direction gives you a larger or smaller value.

2. **Opposite direction** for pair/comparison problems (shrink the search space), **same direction** for in-place modification problems (slow writes, fast reads).

3. **Always ask: "Why is it safe to move this pointer?"** The proof of correctness for two-pointer problems comes from understanding why you won't miss the optimal answer.

4. **Duplicate handling is crucial** in problems like 3Sum. Always think about what happens with repeated values.

5. **"From the back" trick** (as in Merge Sorted Array and Squares of Sorted Array) is powerful when you'd otherwise overwrite needed data.

### What's Next?

Now that you've mastered Two Pointers, the natural next pattern is **Sliding Window** — it builds on the same-direction pointer concept but adds a "window" of elements between the two pointers. Stay tuned for Pattern 2!

---

> 💡 **Practice Tip:** Don't just read the solutions — try solving each problem yourself first for 15-20 minutes. If you're stuck, read only the approach section (not the code) and try again. The struggle is where the learning happens!
