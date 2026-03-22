---
title: "Prefix Sum Pattern - Complete Guide"
description: "Master the prefix sum technique for range query problems with Python examples and practice problems."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
 - dsa
 - dsa-patterns
---

# 🔰 Pattern 3: Prefix Sum

## Table of Contents

1. [What is Prefix Sum?](#what-is-prefix-sum)
2. [Building the Intuition Step by Step](#building-the-intuition-step-by-step)
3. [The Range Sum Formula - Why It Works](#the-range-sum-formula - why-it-works)
4. [Common Variations](#common-variations)
5. [Template Code](#template-code)
6. [Problem Set](#problem-set)
 - [Problem 1: Range Sum Query – Immutable](#problem-1-range-sum-query - immutable)
 - [Problem 2: Running Sum of 1D Array](#problem-2-running-sum-of-1d-array)
 - [Problem 3: Find Pivot Index](#problem-3-find-pivot-index)
 - [Problem 4: Subarray Sum Equals K](#problem-4-subarray-sum-equals-k)
 - [Problem 5: Contiguous Array](#problem-5-contiguous-array)
 - [Problem 6: Product of Array Except Self](#problem-6-product-of-array-except-self)
 - [Problem 7: Subarray Sums Divisible by K](#problem-7-subarray-sums-divisible-by-k)
 - [Problem 8: Range Sum Query 2D – Immutable](#problem-8-range-sum-query-2d - immutable)
 - [Problem 9: Continuous Subarray Sum](#problem-9-continuous-subarray-sum)
 - [Problem 10: Count Number of Nice Subarrays](#problem-10-count-number-of-nice-subarrays)
7. [Key Takeaways & Summary](#key-takeaways - summary)

---

## What is Prefix Sum?

Consider this scenario: you have an array of numbers and someone keeps asking you "what's the sum of elements from index `i` to index `j`?" - not once, but hundreds of times with different `i` and `j` values.

Each time, you could loop from `i` to `j` and add everything up. That's O(n) per query. If someone asks 1000 questions on an array of size 10,000, that's 10 million operations.

But what if you could answer **every** such query in O(1) - constant time - after just one pass of preprocessing?

That's what prefix sum does.

> **Prefix Sum** is a technique where you precompute a cumulative sum array, so that the sum of *any* subarray can be calculated in O(1) using simple subtraction.

---

## Building the Intuition Step by Step

Let's build the idea from scratch. No shortcuts - just following the logic.

### Step 1: What does a prefix sum array look like?

Given an array:

```
nums = [3, 1, 4, 1, 5, 9]
index: 0 1 2 3 4 5
```

The **prefix sum array** `prefix[i]` stores the sum of all elements from the start up to (and including) index `i`:

```
prefix[0] = 3 = 3
prefix[1] = 3 + 1 = 4
prefix[2] = 3 + 1 + 4 = 8
prefix[3] = 3 + 1 + 4 + 1 = 9
prefix[4] = 3 + 1 + 4 + 1 + 5 = 14
prefix[5] = 3 + 1 + 4 + 1 + 5 + 9 = 23
```

So:

```
nums = [3, 1, 4, 1, 5, 9]
prefix = [3, 4, 8, 9, 14, 23]
```

Each entry is just the previous entry plus the current element:

```
prefix[i] = prefix[i-1] + nums[i]
```

That's it. One pass through the array and we're done.

### Step 2: How does this help with range sums?

Let's say we want the sum of elements from index 2 to index 4: `nums[2] + nums[3] + nums[4]`.

We already know:
- `prefix[4] = nums[0] + nums[1] + nums[2] + nums[3] + nums[4] = 14`
- `prefix[1] = nums[0] + nums[1] = 4`

If we subtract:

```
prefix[4] - prefix[1] = 14 - 4 = 10
```

Let's verify: `nums[2] + nums[3] + nums[4] = 4 + 1 + 5 = 10` ✅

**What just happened?** `prefix[4]` contains the sum of everything from the start up to index 4. We don't want the part before index 2, so we subtract `prefix[1]` (the sum of everything before index 2). What's left is exactly the sum from index 2 to 4.

```
prefix[4]: [3 + 1 + 4 + 1 + 5] = sum of indices 0..4
prefix[1]: [3 + 1] = sum of indices 0..1
difference: [4 + 1 + 5] = sum of indices 2..4 ✅
```

### Step 3: The general formula

**Sum of `nums[left..right]` = `prefix[right] - prefix[left - 1]`**

This works because:
- `prefix[right]` = sum from index 0 to `right`
- `prefix[left - 1]` = sum from index 0 to `left - 1`
- Subtracting removes the part we don't want, leaving the sum from `left` to `right`

**But wait - what if `left = 0`?** Then `left - 1 = -1`, which is out of bounds.

Two ways to handle this:

**Option A: Special case for left = 0**
```python
if left == 0:
 range_sum = prefix[right]
else:
 range_sum = prefix[right] - prefix[left - 1]
```

**Option B: Add a dummy 0 at the beginning of the prefix array (preferred)**
```python
# prefix[0] = 0 (dummy)
# prefix[1] = nums[0]
# prefix[2] = nums[0] + nums[1]
# ...
# prefix[i+1] = sum of nums[0..i]

# Then: sum(nums[left..right]) = prefix[right + 1] - prefix[left]
# No special cases needed!
```

Let's see Option B in action:

```
nums = [3, 1, 4, 1, 5, 9]
index: 0 1 2 3 4 5

prefix = [0, 3, 4, 8, 9, 14, 23]
index: 0 1 2 3 4 5 6
```

Now `prefix` has length `n + 1`, and:
- `prefix[0] = 0` (dummy - sum of zero elements)
- `prefix[i] = sum of nums[0..i-1]`

**Range sum from index `left` to `right`:**
```
sum = prefix[right + 1] - prefix[left]
```

Example: sum from index 2 to 4:
```
prefix[5] - prefix[2] = 14 - 4 = 10 ✅
```

Example: sum from index 0 to 2:
```
prefix[3] - prefix[0] = 8 - 0 = 8
Verify: 3 + 1 + 4 = 8 ✅
```

No special cases. The dummy zero handles everything.

### Step 4: Visualizing the subtraction

Here's another way to see it. Think of the prefix sum as a running total on a number line:

```
Index: start 0 1 2 3 4 5
 | | | | | |
Prefix: 0 3 4 8 9 14 23
 |______|____|____|____|____|____|
 
To get sum(2..4):

 0 3 4 8 9 14 23
 |___________________|____|____|
 ↑ prefix[2] = 4 ↑ prefix[5] = 14
 
 14 - 4 = 10 = sum of indices 2, 3, 4
```

You're essentially reading two points on a cumulative curve and taking the difference.

### Step 5: The power - answering queries in O(1)

**Without prefix sum:** Every range sum query takes O(n) - loop and add.

**With prefix sum:** One O(n) preprocessing step, then every query is O(1) - one subtraction.

| Scenario | Without Prefix Sum | With Prefix Sum |
|----------|-------------------|-----------------|
| Build time | None | O(n) - one pass |
| Per query | O(n) - loop i to j | O(1) - one subtraction |
| 1,000 queries on array of 10,000 | 10,000,000 ops | 10,000 + 1,000 = 11,000 ops |

---

## The Range Sum Formula - Why It Works

Let's prove this clearly so there's no doubt.

**Definition:**
```
prefix[0] = 0
prefix[k] = nums[0] + nums[1] + ... + nums[k-1]
```

**We want:** `sum(nums[left..right]) = nums[left] + nums[left+1] + ... + nums[right]`

**We know:**
```
prefix[right + 1] = nums[0] + nums[1] + ... + nums[left-1] + nums[left] + ... + nums[right]
 |___________________________| |__________________________________|
 prefix[left] what we want
```

**Therefore:**
```
prefix[right + 1] = prefix[left] + sum(nums[left..right])

Rearranging:
sum(nums[left..right]) = prefix[right + 1] - prefix[left]
```

This is not a trick or a pattern to memorize. It's just the definition of cumulative sums and basic subtraction.

---

## Common Variations

Prefix sum appears in many disguises. Here are the main variations you'll encounter:

### 1. Standard Prefix Sum (Range Sum Queries)
As we just discussed. Precompute cumulative sums, answer range queries in O(1).

### 2. Prefix Sum + HashMap (Count Subarrays with Target Sum)
Instead of answering "what's the sum from i to j?", we ask "how many subarrays have sum equal to k?"

The key insight: if `prefix[right] - prefix[left] = k`, then the subarray from `left` to `right-1` has sum `k`. So for each `right`, we need to count how many previous prefix values equal `prefix[right] - k`. A hashmap makes this O(1) per position.

This is the single most important variation. It shows up in Problems 4, 5, 7, 9, and 10 below.

### 3. Prefix Product (Product Queries)
Same idea but with multiplication instead of addition. Used in "Product of Array Except Self."

### 4. 2D Prefix Sum (Range Sum in a Matrix)
Extends the concept to two dimensions. The inclusion-exclusion principle replaces simple subtraction.

### 5. Prefix XOR, Prefix Count, Prefix Anything
The concept generalizes to any operation where you can "undo" the prefix by some inverse operation (subtraction for sums, division for products, XOR for XOR).

---

## Template Code

### Template 1: Building a Prefix Sum Array

```python
def build_prefix_sum(nums):
 """
 Build a prefix sum array with a leading 0.
 
 prefix[0] = 0
 prefix[i] = nums[0] + nums[1] + ... + nums[i-1]
 
 Range sum of nums[left..right] = prefix[right+1] - prefix[left]
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - storing the prefix array
 """
 n = len(nums)
 prefix = [0] * (n + 1)
 
 for i in range(n):
 prefix[i + 1] = prefix[i] + nums[i]
 
 return prefix

# Usage:
# prefix = build_prefix_sum(nums)
# sum from index left to right (inclusive) = prefix[right + 1] - prefix[left]
```

### Template 2: Prefix Sum + HashMap (Count Subarrays with Given Sum)

```python
def count_subarrays_with_sum(nums, target):
 """
 Count the number of subarrays whose sum equals target.
 
 Core Idea:
 As we compute the running prefix sum, we ask:
 "Is there a previous prefix value such that current_prefix - previous_prefix = target?"
 That means: "Is (current_prefix - target) in our hashmap of seen prefix values?"
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - hashmap stores prefix sums
 """
 prefix_count = {0: 1} # prefix sum 0 has been seen once (before the array starts)
 current_sum = 0
 count = 0
 
 for num in nums:
 current_sum += num
 
 # How many times have we seen (current_sum - target) as a prefix sum?
 # Each such occurrence means there's a subarray ending here with sum = target
 needed = current_sum - target
 if needed in prefix_count:
 count += prefix_count[needed]
 
 # Record this prefix sum
 prefix_count[current_sum] = prefix_count.get(current_sum, 0) + 1
 
 return count
```

### Understanding the HashMap Template - A Detailed Example

This is worth spending time on, because it's the foundation for many problems.

```
nums = [1, 2, 3, -3, 1, 2], target = 3

Let's trace through:

Step 0 (before starting): prefix_count = {0: 1}, current_sum = 0
 "We've seen prefix sum 0 once - this represents the empty prefix."

Step 1: num = 1
 current_sum = 1
 needed = 1 - 3 = -2 → not in prefix_count → count stays 0
 prefix_count = {0:1, 1:1}

Step 2: num = 2
 current_sum = 3
 needed = 3 - 3 = 0 → prefix_count[0] = 1 → count += 1 → count = 1
 prefix_count = {0:1, 1:1, 3:1}
 
 What did we find? current_sum=3 and a previous prefix of 0 exists.
 That means: sum from index 0 to index 1 = 3 - 0 = 3 ✅
 Subarray: [1, 2]

Step 3: num = 3
 current_sum = 6
 needed = 6 - 3 = 3 → prefix_count[3] = 1 → count += 1 → count = 2
 prefix_count = {0:1, 1:1, 3:1, 6:1}
 
 Found: sum from some earlier point to index 2 = 3.
 Subarray: [3] (prefix went from 3 to 6, difference is 3)

Step 4: num = -3
 current_sum = 3
 needed = 3 - 3 = 0 → prefix_count[0] = 1 → count += 1 → count = 3
 prefix_count = {0:1, 1:1, 3:2, 6:1}
 
 Subarray: [1, 2, 3, -3] (prefix went from 0 to 3, difference is 3)
 
 Note: prefix_count[3] is now 2 - we've seen prefix sum 3 twice.

Step 5: num = 1
 current_sum = 4
 needed = 4 - 3 = 1 → prefix_count[1] = 1 → count += 1 → count = 4
 prefix_count = {0:1, 1:1, 3:2, 6:1, 4:1}
 
 Subarray: [2, 3, -3, 1] (prefix went from 1 to 4)

Step 6: num = 2
 current_sum = 6
 needed = 6 - 3 = 3 → prefix_count[3] = 2 → count += 2 → count = 6
 prefix_count = {0:1, 1:1, 3:2, 6:2, 4:1}
 
 TWO subarrays found at once! Prefix sum 3 appeared at two different points,
 and from each of those points to here, the sum is 3.
 Subarrays: [3, -3, 1, 2] and [1, 2]

Final count: 6
```

**Why do we initialize `{0: 1}`?**

The 0 represents the prefix sum before the array starts. Without it, we'd miss subarrays that start at index 0. In Step 2 above, we found that `current_sum = 3` and `needed = 0`. The prefix sum 0 exists because of this initialization - it means "the subarray starting from the very beginning sums to 3."

If we forgot to put `{0: 1}`, we'd miss the subarray `[1, 2]`. Try it yourself and see.

---

## Problem Set

### Difficulty Progression

| # | Problem | Difficulty | Key Concept |
|---|---------|-----------|-------------|
| 1 | Range Sum Query – Immutable | Easy | Basic prefix sum |
| 2 | Running Sum of 1D Array | Easy | Building prefix sums |
| 3 | Find Pivot Index | Easy | Left sum vs right sum |
| 4 | Subarray Sum Equals K | Medium | Prefix sum + hashmap |
| 5 | Contiguous Array | Medium | Transform + prefix sum + hashmap |
| 6 | Product of Array Except Self | Medium | Prefix and suffix products |
| 7 | Subarray Sums Divisible by K | Medium | Prefix sum + modular arithmetic |
| 8 | Range Sum Query 2D – Immutable | Medium | 2D prefix sum |
| 9 | Continuous Subarray Sum | Medium | Prefix sum + modular + hashmap |
| 10 | Count Number of Nice Subarrays | Medium | Transform + prefix sum + hashmap |

---

### Problem 1: Range Sum Query – Immutable

**LeetCode Link:** [https://leetcode.com/problems/range-sum-query-immutable/](https://leetcode.com/problems/range-sum-query-immutable/)

#### Problem Statement

Implement the `NumArray` class:
- `NumArray(nums)` - initializes with the array.
- `sumRange(left, right)` - returns the sum of `nums[left..right]` inclusive.

`sumRange` will be called many times.

**Example:**
```
nums = [-2, 0, 3, -5, 2, -1]
sumRange(0, 2) → -2 + 0 + 3 = 1
sumRange(2, 5) → 3 + (-5) + 2 + (-1) = -1
sumRange(0, 5) → -2 + 0 + 3 + (-5) + 2 + (-1) = -3
```

#### Clarifying Questions & Constraints

- The array does **not** change after initialization (immutable).
- `sumRange` will be called up to 10⁴ times - it needs to be fast.
- `0 <= left <= right < nums.length`

#### Approach Discussion

**Approach 1: Brute Force - Sum on every query**
- Loop from `left` to `right` and add elements each time.
- **Time:** O(n) per query, **Space:** O(1)
- ❌ With many queries, this is too slow.

**Approach 2: Prefix Sum (Optimal) ✅**
- Precompute the prefix sum array once in the constructor.
- Answer each query in O(1) using the formula.
- **Time:** O(n) initialization + O(1) per query, **Space:** O(n)

This is the textbook use case for prefix sum - exactly the scenario we described in the intuition section.

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n) per query
# ============================================================
class NumArray_Brute:
 """
 Store the array and compute the sum from scratch on every query.
 
 Time Complexity:
 __init__: O(1)
 sumRange: O(n) per call
 Space Complexity: O(1) extra (just storing the reference)
 """
 def __init__(self, nums: list[int]):
 self.nums = nums
 
 def sumRange(self, left: int, right: int) -> int:
 total = 0
 for i in range(left, right + 1):
 total += nums[i]
 return total


# ============================================================
# APPROACH 2: Prefix Sum - O(1) per query ✅
# ============================================================
class NumArray:
 """
 Precompute prefix sums for O(1) range queries.
 
 We use the "leading zero" convention:
 prefix[0] = 0
 prefix[i] = nums[0] + nums[1] + ... + nums[i-1]
 
 Then: sumRange(left, right) = prefix[right + 1] - prefix[left]
 
 Time Complexity:
 __init__: O(n) - one pass to build prefix array
 sumRange: O(1) - single subtraction
 Space Complexity: O(n) - storing the prefix array
 """
 def __init__(self, nums: list[int]):
 n = len(nums)
 self.prefix = [0] * (n + 1)
 
 # Build the prefix sum array
 for i in range(n):
 self.prefix[i + 1] = self.prefix[i] + nums[i]
 
 def sumRange(self, left: int, right: int) -> int:
 # Sum of nums[left..right] = prefix[right+1] - prefix[left]
 return self.prefix[right + 1] - self.prefix[left]
```

#### Edge Cases

- **Single element range:** `sumRange(2, 2)` → just `nums[2]`.
- **Entire array:** `sumRange(0, n-1)` → `prefix[n] - prefix[0] = total sum`.
- **Negative numbers:** Works fine - subtraction handles negatives correctly.

#### Dry Run

```
nums = [-2, 0, 3, -5, 2, -1]

Building prefix:
prefix[0] = 0
prefix[1] = 0 + (-2) = -2
prefix[2] = -2 + 0 = -2
prefix[3] = -2 + 3 = 1
prefix[4] = 1 + (-5) = -4
prefix[5] = -4 + 2 = -2
prefix[6] = -2 + (-1) = -3

prefix = [0, -2, -2, 1, -4, -2, -3]

Query: sumRange(0, 2) = prefix[3] - prefix[0] = 1 - 0 = 1 ✅
Query: sumRange(2, 5) = prefix[6] - prefix[2] = -3 - (-2) = -1 ✅
Query: sumRange(0, 5) = prefix[6] - prefix[0] = -3 - 0 = -3 ✅
```

---

### Problem 2: Running Sum of 1D Array

**LeetCode Link:** [https://leetcode.com/problems/running-sum-of-1d-array/](https://leetcode.com/problems/running-sum-of-1d-array/)

#### Problem Statement

Given an array `nums`, return the running sum where `runningSum[i] = sum(nums[0]..nums[i])`.

**Example:**
```
Input: nums = [1, 2, 3, 4]
Output: [1, 3, 6, 10]
```

#### Clarifying Questions & Constraints

- This is literally computing the prefix sum array (without the leading zero).
- `1 <= nums.length <= 1000`

#### Approach Discussion

**Approach 1: Create a new array**
- Compute cumulative sums into a new array.
- **Time:** O(n), **Space:** O(n)

**Approach 2: In-place modification (Optimal) ✅**
- Modify `nums` directly: `nums[i] += nums[i-1]`.
- **Time:** O(n), **Space:** O(1)

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: New array - O(n) time, O(n) space
# ============================================================
def runningSum_new(nums: list[int]) -> list[int]:
 """
 Build a new array of running sums.
 
 Time Complexity: O(n)
 Space Complexity: O(n)
 """
 result = [0] * len(nums)
 result[0] = nums[0]
 
 for i in range(1, len(nums)):
 result[i] = result[i - 1] + nums[i]
 
 return result


# ============================================================
# APPROACH 2: In-place - O(n) time, O(1) space ✅
# ============================================================
def runningSum(nums: list[int]) -> list[int]:
 """
 Compute running sum by modifying the array in-place.
 Each element becomes the sum of itself and everything before it.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(1) - modifying in place (no extra array)
 """
 for i in range(1, len(nums)):
 nums[i] += nums[i - 1]
 
 return nums
```

#### Edge Cases

- **Single element:** `[5]` → `[5]`.
- **All zeros:** `[0, 0, 0]` → `[0, 0, 0]`.
- **Negative numbers:** `[-1, 2, -3]` → `[-1, 1, -2]`.

#### Dry Run

```
Input: nums = [1, 2, 3, 4]

i=1: nums[1] = 2 + nums[0] = 2 + 1 = 3 → [1, 3, 3, 4]
i=2: nums[2] = 3 + nums[1] = 3 + 3 = 6 → [1, 3, 6, 4]
i=3: nums[3] = 4 + nums[2] = 4 + 6 = 10 → [1, 3, 6, 10]

Output: [1, 3, 6, 10] ✅
```

---

### Problem 3: Find Pivot Index

**LeetCode Link:** [https://leetcode.com/problems/find-pivot-index/](https://leetcode.com/problems/find-pivot-index/)

#### Problem Statement

Given an array `nums`, find the **pivot index** where the sum of all elements to the left equals the sum of all elements to the right. The element at the pivot index is not included in either side.

Return the **leftmost** pivot index. If none exists, return -1.

**Example:**
```
Input: nums = [1, 7, 3, 6, 5, 6]
Output: 3 (left sum = 1+7+3 = 11, right sum = 5+6 = 11)
```

#### Clarifying Questions & Constraints

- "Left of index 0" is empty → left sum = 0.
- "Right of last index" is empty → right sum = 0.
- Return the leftmost pivot if there are multiple.

#### Approach Discussion

**Approach 1: Brute Force**
- For each index, compute left sum and right sum separately.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Total Sum - Prefix Sum Logic (Optimal) ✅**
- Compute the total sum.
- As we scan left to right, maintain a running `left_sum`.
- At each index `i`: `right_sum = total_sum - left_sum - nums[i]`.
- If `left_sum == right_sum`, we found the pivot.
- **Time:** O(n), **Space:** O(1)

The insight: we don't actually need to *build* a prefix sum array. We just need the running left sum and can derive the right sum from the total.

#### Code (Optimal Solution)

```python
def pivotIndex(nums: list[int]) -> int:
 """
 Find the pivot index where left sum equals right sum.
 
 Instead of building a full prefix sum array, we use:
 - left_sum: running sum of elements to the left of current index
 - right_sum = total_sum - left_sum - nums[i]
 
 We check if left_sum == right_sum at each position.
 
 Time Complexity: O(n) - two passes (one for total, one for scanning)
 Space Complexity: O(1) - only a few variables
 """
 total_sum = sum(nums)
 left_sum = 0
 
 for i in range(len(nums)):
 # Right sum = everything except left_sum and nums[i]
 right_sum = total_sum - left_sum - nums[i]
 
 if left_sum == right_sum:
 return i # Found the pivot
 
 # Add nums[i] to left_sum for the next iteration
 left_sum += nums[i]
 
 return -1 # No pivot found
```

#### Edge Cases

- **Pivot at index 0:** `[2, 1, -1]` → left sum = 0, right sum = 1+(-1) = 0 → return 0.
- **Pivot at last index:** `[-1, 1, 2]` → left sum = -1+1 = 0, right sum = 0 → return 2.
- **No pivot:** `[1, 2, 3]` → no index works → return -1.
- **Single element:** `[1]` → left sum = 0, right sum = 0 → return 0.

#### Dry Run

```
Input: nums = [1, 7, 3, 6, 5, 6]
total_sum = 28

i=0: left_sum=0, right_sum=28-0-1=27, 0≠27 → left_sum=1
i=1: left_sum=1, right_sum=28-1-7=20, 1≠20 → left_sum=8
i=2: left_sum=8, right_sum=28-8-3=17, 8≠17 → left_sum=11
i=3: left_sum=11, right_sum=28-11-6=11, 11==11 ✅ → return 3

Output: 3 ✅
```

---

### Problem 4: Subarray Sum Equals K

**LeetCode Link:** [https://leetcode.com/problems/subarray-sum-equals-k/](https://leetcode.com/problems/subarray-sum-equals-k/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, return the total number of subarrays whose sum equals `k`.

**Example:**
```
Input: nums = [1, 1, 1], k = 2
Output: 2 (subarrays: [1,1] starting at index 0, and [1,1] starting at index 1)
```

#### Clarifying Questions & Constraints

- Subarrays are **contiguous**.
- Elements can be **negative** (so sliding window doesn't work here!).
- We need the **count**, not the actual subarrays.
- `1 <= nums.length <= 2 × 10⁴`

#### Approach Discussion

**Approach 1: Brute Force**
- Check every subarray.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Prefix Sum + HashMap (Optimal) ✅**
- This is exactly the pattern from Template 2 above.
- Track `current_sum` (running prefix sum). For each position, check how many times `current_sum - k` has appeared before.
- **Time:** O(n), **Space:** O(n)

**Why can't we use sliding window?**
Sliding window works for "min/max length subarray with sum ≥ target" **only when all elements are positive**. With negatives, growing the window can decrease the sum and shrinking can increase it, so the window logic breaks. Prefix sum + hashmap handles negatives perfectly.

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n²)
# ============================================================
def subarraySum_brute(nums: list[int], k: int) -> int:
 """
 Check every subarray.
 
 Time Complexity: O(n²)
 Space Complexity: O(1)
 """
 count = 0
 n = len(nums)
 
 for i in range(n):
 current_sum = 0
 for j in range(i, n):
 current_sum += nums[j]
 if current_sum == k:
 count += 1
 
 return count


# ============================================================
# APPROACH 2: Prefix Sum + HashMap - O(n) ✅
# ============================================================
def subarraySum(nums: list[int], k: int) -> int:
 """
 Count subarrays with sum equal to k using prefix sum + hashmap.
 
 Core Idea:
 If prefix_sum at index j minus prefix_sum at index i equals k,
 then the subarray from i+1 to j has sum k.
 
 So for each position j, we need: how many earlier prefix sums equal (current_prefix - k)?
 A hashmap gives us this in O(1).
 
 Why we initialize {0: 1}:
 This accounts for subarrays starting at index 0.
 If current_sum == k at some point, then current_sum - k = 0,
 and we need to find that prefix_sum 0 exists (it does - before the array starts).
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - hashmap of prefix sums
 """
 prefix_count = {0: 1} # prefix_sum → how many times we've seen it
 current_sum = 0
 count = 0
 
 for num in nums:
 # Extend the prefix sum
 current_sum += num
 
 # How many earlier prefix sums equal current_sum - k?
 needed = current_sum - k
 if needed in prefix_count:
 count += prefix_count[needed]
 
 # Record this prefix sum
 prefix_count[current_sum] = prefix_count.get(current_sum, 0) + 1
 
 return count
```

#### Edge Cases

- **Single element equals k:** `nums=[3], k=3` → 1.
- **Negative numbers:** `nums=[-1, -1, 1], k=0` → 1 (subarray `[-1, 1]`).
- **k = 0:** `nums=[0, 0, 0]` → 6 (every subarray of zeros sums to 0).
- **No valid subarray:** `nums=[1, 2, 3], k=10` → 0.

#### Dry Run

```
Input: nums = [1, 2, 3], k = 3

prefix_count = {0: 1}, current_sum = 0, count = 0

num=1: current_sum = 1
 needed = 1 - 3 = -2 → not in map → count = 0
 prefix_count = {0:1, 1:1}

num=2: current_sum = 3
 needed = 3 - 3 = 0 → prefix_count[0] = 1 → count = 1
 prefix_count = {0:1, 1:1, 3:1}
 Found: subarray [1, 2] sums to 3

num=3: current_sum = 6
 needed = 6 - 3 = 3 → prefix_count[3] = 1 → count = 2
 prefix_count = {0:1, 1:1, 3:1, 6:1}
 Found: subarray [3] sums to 3

Output: 2 ✅ (subarrays: [1,2] and [3])
```

---

### Problem 5: Contiguous Array

**LeetCode Link:** [https://leetcode.com/problems/contiguous-array/](https://leetcode.com/problems/contiguous-array/)

#### Problem Statement

Given a binary array `nums`, find the maximum length of a contiguous subarray with an **equal number of 0s and 1s**.

**Example:**
```
Input: nums = [0, 1, 0, 0, 1, 1, 0]
Output: 6 (subarray [0, 1, 0, 0, 1, 1] or [1, 0, 0, 1, 1, 0] → 3 zeros and 3 ones)
```

#### Clarifying Questions & Constraints

- The array contains only 0s and 1s.
- We want the **longest** such subarray.

#### Approach Discussion

**Approach 1: Brute Force**
- Check every subarray, count 0s and 1s.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Transform + Prefix Sum + HashMap (Optimal) ✅**

The trick is a clever transformation: **treat 0s as -1s**. Then "equal number of 0s and 1s" becomes "subarray sum equals 0."

Why? If we have three 1s and three 0s (treated as -1s): `1 + 1 + 1 + (-1) + (-1) + (-1) = 0`.

Now the problem is: find the **longest** subarray with sum 0. This is a variation of the prefix sum + hashmap pattern.

**Key insight for "longest" vs "count":**
- "Count subarrays with sum k" → store the count of each prefix sum.
- "Longest subarray with sum k" → store the **first occurrence** of each prefix sum (earliest index). When we see the same prefix sum again, the subarray between those two positions has sum 0.

- **Time:** O(n), **Space:** O(n)

#### Code (Optimal Solution)

```python
def findMaxLength(nums: list[int]) -> int:
 """
 Find the longest subarray with equal 0s and 1s.
 
 Transformation: Replace every 0 with -1.
 Now the problem becomes: find the longest subarray with sum = 0.
 
 If prefix_sum[i] == prefix_sum[j], then sum(nums[i+1..j]) = 0,
 meaning equal 0s and 1s in that range.
 
 We store the FIRST occurrence of each prefix sum. When we see the
 same prefix sum again, the distance is a candidate for the longest subarray.
 
 Why first occurrence? Because we want the LONGEST subarray, so we want
 the earliest start point.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - hashmap stores prefix sums
 """
 # Map: prefix_sum → first index where this prefix_sum was seen
 first_seen = {0: -1} # prefix_sum 0 first seen at index -1 (before array starts)
 
 current_sum = 0
 max_length = 0
 
 for i in range(len(nums)):
 # Transform: treat 0 as -1
 current_sum += 1 if nums[i] == 1 else -1
 
 if current_sum in first_seen:
 # We've seen this prefix sum before!
 # The subarray from (first_seen[current_sum] + 1) to i has sum 0
 length = i - first_seen[current_sum]
 max_length = max(max_length, length)
 else:
 # First time seeing this prefix sum - record the index
 first_seen[current_sum] = i
 
 return max_length
```

#### Edge Cases

- **All zeros or all ones:** `[0, 0, 0]` → 0 (can never balance).
- **Perfectly balanced:** `[0, 1]` → 2.
- **Already balanced:** `[0, 1, 0, 1]` → 4.
- **Empty-ish:** `[0]` → 0.

#### Dry Run

```
Input: nums = [0, 1, 0, 0, 1, 1, 0]

Transform 0→-1: [-1, 1, -1, -1, 1, 1, -1]
first_seen = {0: -1}, current_sum = 0, max_length = 0

i=0: num=0 → current_sum = -1
 -1 not in first_seen → first_seen[-1] = 0

i=1: num=1 → current_sum = 0
 0 in first_seen (at index -1)!
 length = 1 - (-1) = 2, max_length = 2

i=2: num=0 → current_sum = -1
 -1 in first_seen (at index 0)!
 length = 2 - 0 = 2, max_length = 2

i=3: num=0 → current_sum = -2
 -2 not in first_seen → first_seen[-2] = 3

i=4: num=1 → current_sum = -1
 -1 in first_seen (at index 0)!
 length = 4 - 0 = 4, max_length = 4

i=5: num=1 → current_sum = 0
 0 in first_seen (at index -1)!
 length = 5 - (-1) = 6, max_length = 6

i=6: num=0 → current_sum = -1
 -1 in first_seen (at index 0)!
 length = 6 - 0 = 6, max_length = 6

Output: 6 ✅
```

---

### Problem 6: Product of Array Except Self

**LeetCode Link:** [https://leetcode.com/problems/product-of-array-except-self/](https://leetcode.com/problems/product-of-array-except-self/)

#### Problem Statement

Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of all elements except `nums[i]`. You must solve it **without using division** and in O(n) time.

**Example:**
```
Input: nums = [1, 2, 3, 4]
Output: [24, 12, 8, 6]
```

#### Clarifying Questions & Constraints

- **Cannot use division** (so `total_product / nums[i]` is not allowed).
- Must run in O(n).
- Follow-up: Can you do it in O(1) extra space (not counting the output array)?

#### Approach Discussion

**Approach 1: Division (Not Allowed)**
- Compute total product, divide by each element.
- **Problem:** Division by zero if any element is 0. Also explicitly forbidden.

**Approach 2: Prefix and Suffix Products (Good)**
- `prefix_product[i]` = product of all elements before index i.
- `suffix_product[i]` = product of all elements after index i.
- `answer[i] = prefix_product[i] × suffix_product[i]`.
- **Time:** O(n), **Space:** O(n)

**Approach 3: Single-Pass Optimization (Optimal) ✅**
- First pass: build `answer[i]` as the prefix product (everything to the left).
- Second pass (right to left): multiply each `answer[i]` by the running suffix product.
- **Time:** O(n), **Space:** O(1) extra (output array doesn't count).

This is the prefix sum idea applied to multiplication: instead of cumulative sums, we compute cumulative products from both directions.

#### Code (Both Approaches)

```python
# ============================================================
# APPROACH 2: Prefix and Suffix Arrays - O(n) time, O(n) space
# ============================================================
def productExceptSelf_arrays(nums: list[int]) -> list[int]:
 """
 Build prefix product and suffix product arrays, then multiply.
 
 prefix[i] = product of nums[0] × nums[1] × ... × nums[i-1]
 suffix[i] = product of nums[i+1] × nums[i+2] × ... × nums[n-1]
 answer[i] = prefix[i] × suffix[i]
 
 Time Complexity: O(n) - three passes
 Space Complexity: O(n) - two extra arrays
 """
 n = len(nums)
 prefix = [1] * n
 suffix = [1] * n
 
 # Build prefix products (everything to the LEFT of i)
 for i in range(1, n):
 prefix[i] = prefix[i - 1] * nums[i - 1]
 
 # Build suffix products (everything to the RIGHT of i)
 for i in range(n - 2, -1, -1):
 suffix[i] = suffix[i + 1] * nums[i + 1]
 
 # Combine
 answer = [prefix[i] * suffix[i] for i in range(n)]
 return answer


# ============================================================
# APPROACH 3: Two-Pass O(1) Extra Space - ✅
# ============================================================
def productExceptSelf(nums: list[int]) -> list[int]:
 """
 Compute product of array except self without division and with O(1) extra space.
 
 Pass 1 (left to right): Build prefix products into the answer array.
 answer[i] = product of all elements to the LEFT of i.
 
 Pass 2 (right to left): Multiply each answer[i] by the running suffix product.
 After this, answer[i] = left_product × right_product = everything except nums[i].
 
 Time Complexity: O(n) - two passes
 Space Complexity: O(1) extra - only the output array and one variable
 """
 n = len(nums)
 answer = [1] * n
 
 # Pass 1: Fill answer with prefix products (left side)
 # answer[i] will contain the product of all elements BEFORE index i
 left_product = 1
 for i in range(n):
 answer[i] = left_product
 left_product *= nums[i]
 
 # Pass 2: Multiply with suffix products (right side)
 # Multiply answer[i] by the product of all elements AFTER index i
 right_product = 1
 for i in range(n - 1, -1, -1):
 answer[i] *= right_product
 right_product *= nums[i]
 
 return answer
```

#### Edge Cases

- **Contains zero:** `[1, 0, 3]` → `[0, 3, 0]`.
- **Multiple zeros:** `[0, 0, 3]` → `[0, 0, 0]`.
- **Two elements:** `[2, 3]` → `[3, 2]`.
- **Negative numbers:** `[-1, 2, -3]` → `[2×-3, -1×-3, -1×2] = [-6, 3, -2]`.

#### Dry Run

```
Input: nums = [1, 2, 3, 4]

Pass 1 (left to right): Build prefix products
 i=0: answer[0] = 1, left_product = 1*1 = 1
 i=1: answer[1] = 1, left_product = 1*2 = 2
 i=2: answer[2] = 2, left_product = 2*3 = 6
 i=3: answer[3] = 6, left_product = 6*4 = 24
 
 answer = [1, 1, 2, 6] (each entry = product of everything to its left)

Pass 2 (right to left): Multiply by suffix products
 i=3: answer[3] = 6 * 1 = 6, right_product = 1*4 = 4
 i=2: answer[2] = 2 * 4 = 8, right_product = 4*3 = 12
 i=1: answer[1] = 1 * 12 = 12, right_product = 12*2 = 24
 i=0: answer[0] = 1 * 24 = 24, right_product = 24*1 = 24

 answer = [24, 12, 8, 6] ✅
```

---

### Problem 7: Subarray Sums Divisible by K

**LeetCode Link:** [https://leetcode.com/problems/subarray-sums-divisible-by-k/](https://leetcode.com/problems/subarray-sums-divisible-by-k/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, return the number of subarrays whose sum is divisible by `k`.

**Example:**
```
Input: nums = [4, 5, 0, -2, -3, 1], k = 5
Output: 7
Subarrays: [4,5,0,-2,-3,1], [5], [5,0], [5,0,-2,-3], [0], [-2,-3], [4,5,0,-2,-3]
```

#### Clarifying Questions & Constraints

- Elements can be **negative**.
- `k` is always positive.
- "Divisible by k" means the sum modulo k equals 0.

#### Approach Discussion

**Approach 1: Brute Force**
- Check every subarray sum.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Prefix Sum + Modular Arithmetic + HashMap (Optimal) ✅**

This is a variation of the "subarray sum equals k" pattern with a twist.

**Key math insight:**
If `prefix[j] % k == prefix[i] % k`, then `(prefix[j] - prefix[i]) % k == 0`, which means the subarray from `i+1` to `j` has a sum divisible by k.

So instead of looking for `prefix[j] - prefix[i] == target`, we look for `prefix[j] % k == prefix[i] % k`. Group prefix sums by their remainder when divided by k.

**Handling negative remainders:**
In Python, `-1 % 5 = 4` (Python handles this correctly). In some languages, you need `((prefix % k) + k) % k` to ensure a non-negative remainder.

- **Time:** O(n), **Space:** O(k)

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n²)
# ============================================================
def subarraysDivByK_brute(nums: list[int], k: int) -> int:
 """
 Check every subarray sum for divisibility by k.
 
 Time Complexity: O(n²)
 Space Complexity: O(1)
 """
 count = 0
 n = len(nums)
 
 for i in range(n):
 current_sum = 0
 for j in range(i, n):
 current_sum += nums[j]
 if current_sum % k == 0:
 count += 1
 
 return count


# ============================================================
# APPROACH 2: Prefix Sum + Modular Arithmetic - O(n) ✅
# ============================================================
def subarraysDivByK(nums: list[int], k: int) -> int:
 """
 Count subarrays with sum divisible by k using prefix sum remainders.
 
 Core Idea:
 If two prefix sums have the SAME remainder when divided by k, then the
 subarray between them has a sum divisible by k.
 
 Why? If prefix[j] % k == prefix[i] % k, then:
 (prefix[j] - prefix[i]) % k == 0
 → sum of subarray from i+1 to j is divisible by k.
 
 So we count how many prefix sums share each remainder.
 If n prefix sums have the same remainder, we can choose any 2 of them
 to form a valid subarray → n*(n-1)/2 pairs. But we count incrementally.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(k) - at most k different remainders (0 to k-1)
 """
 # Map: remainder → how many prefix sums have this remainder
 remainder_count = {0: 1} # prefix_sum 0 has remainder 0 (seen once)
 current_sum = 0
 count = 0
 
 for num in nums:
 current_sum += num
 remainder = current_sum % k # In Python, this is always non-negative
 
 # How many previous prefix sums had the same remainder?
 if remainder in remainder_count:
 count += remainder_count[remainder]
 
 # Record this remainder
 remainder_count[remainder] = remainder_count.get(remainder, 0) + 1
 
 return count
```

#### Edge Cases

- **All zeros:** `[0, 0, 0], k=5` → 6 (every subarray sums to 0, divisible by anything).
- **Single element:** `[5], k=5` → 1.
- **Negative numbers:** `[-1, 2, 9], k=2` → remainders are handled by Python's modulo.
- **k = 1:** Every subarray has a sum divisible by 1 → `n*(n+1)/2`.

#### Dry Run

```
Input: nums = [4, 5, 0, -2, -3, 1], k = 5

remainder_count = {0: 1}, current_sum = 0, count = 0

num=4: current_sum = 4, remainder = 4%5 = 4
 4 not in map → count = 0
 map = {0:1, 4:1}

num=5: current_sum = 9, remainder = 9%5 = 4
 4 in map, count = 1 → count = 1
 map = {0:1, 4:2}

num=0: current_sum = 9, remainder = 9%5 = 4
 4 in map (count=2), count += 2 → count = 3
 map = {0:1, 4:3}

num=-2: current_sum = 7, remainder = 7%5 = 2
 2 not in map → count = 3
 map = {0:1, 4:3, 2:1}

num=-3: current_sum = 4, remainder = 4%5 = 4
 4 in map (count=3), count += 3 → count = 6
 map = {0:1, 4:4, 2:1}

num=1: current_sum = 5, remainder = 5%5 = 0
 0 in map (count=1), count += 1 → count = 7
 map = {0:2, 4:4, 2:1}

Output: 7 ✅
```

---

### Problem 8: Range Sum Query 2D – Immutable

**LeetCode Link:** [https://leetcode.com/problems/range-sum-query-2d-immutable/](https://leetcode.com/problems/range-sum-query-2d-immutable/)

#### Problem Statement

Given a 2D matrix, handle multiple queries of the following type: calculate the sum of elements inside a rectangle defined by its upper-left corner `(row1, col1)` and lower-right corner `(row2, col2)`.

**Example:**
```
Matrix:
[3, 0, 1, 4, 2]
[5, 6, 3, 2, 1]
[1, 2, 0, 1, 5]
[4, 1, 0, 1, 7]
[1, 0, 3, 0, 5]

sumRegion(2, 1, 4, 3) → 8
(sum of the rectangle from (2,1) to (4,3): 2+0+1 + 1+0+1 + 0+3+0 = 8)
```

#### Clarifying Questions & Constraints

- The matrix does not change (immutable).
- `sumRegion` will be called many times.
- Extend the 1D prefix sum idea to 2D.

#### Approach Discussion

**Approach 1: Brute Force**
- For each query, loop over the rectangle and sum.
- **Time:** O(m × n) per query. ❌

**Approach 2: 2D Prefix Sum (Optimal) ✅**
- Build a 2D prefix sum matrix where `prefix[i][j]` = sum of all elements in the rectangle from `(0,0)` to `(i-1, j-1)`.
- Use **inclusion-exclusion** to answer queries in O(1).
- **Time:** O(m × n) to build + O(1) per query. **Space:** O(m × n).

**Inclusion-Exclusion Principle:**

To get the sum of a rectangle from `(r1, c1)` to `(r2, c2)`:

```
sum = prefix[r2+1][c2+1] (whole rectangle from origin to (r2,c2))
 - prefix[r1][c2+1] (subtract the rows above)
 - prefix[r2+1][c1] (subtract the columns to the left)
 + prefix[r1][c1] (add back the corner we subtracted twice)
```

This is exactly like the 1D formula but in two dimensions. In 1D, we subtract the prefix to the left. In 2D, we subtract the top and left regions, then add back the overlap (top-left corner) that was subtracted twice.

```
+-----+-------+
| D | C |
+-----+-------+
| B | query |
+-----+-------+

sum(query) = sum(everything) - sum(C) - sum(B) + sum(D)
 (D was subtracted in both B and C, so add it back)
```

#### Code (Optimal Solution)

```python
class NumMatrix:
 """
 2D prefix sum for O(1) rectangular range queries.
 
 prefix[i][j] stores the sum of all elements in the rectangle
 from (0,0) to (i-1, j-1) in the original matrix.
 
 Time Complexity:
 __init__: O(m × n) to build the prefix matrix
 sumRegion: O(1) per query
 Space Complexity: O(m × n) for the prefix matrix
 """
 
 def __init__(self, matrix: list[list[int]]):
 if not matrix or not matrix[0]:
 return
 
 m, n = len(matrix), len(matrix[0])
 
 # prefix has (m+1) rows and (n+1) cols, with a border of zeros
 self.prefix = [[0] * (n + 1) for _ in range(m + 1)]
 
 # Build the 2D prefix sum
 for i in range(1, m + 1):
 for j in range(1, n + 1):
 self.prefix[i][j] = (
 matrix[i - 1][j - 1] # Current cell value
 + self.prefix[i - 1][j] # Sum of everything above
 + self.prefix[i][j - 1] # Sum of everything to the left
 - self.prefix[i - 1][j - 1] # Subtract overlap (counted twice)
 )
 
 def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
 """
 Return the sum of elements in the rectangle from (row1, col1) to (row2, col2).
 
 Uses inclusion-exclusion:
 sum = total - top - left + top_left_overlap
 """
 return (
 self.prefix[row2 + 1][col2 + 1] # Full rectangle from origin
 - self.prefix[row1][col2 + 1] # Subtract rows above row1
 - self.prefix[row2 + 1][col1] # Subtract columns left of col1
 + self.prefix[row1][col1] # Add back the overlap
 )
```

#### Edge Cases

- **Single cell:** `sumRegion(0, 0, 0, 0)` → just that one cell.
- **Entire matrix:** `sumRegion(0, 0, m-1, n-1)` → `prefix[m][n]`.
- **Single row/column:** Works as a special case of the general formula.

#### Dry Run

```
Matrix:
[3, 0, 1, 4, 2]
[5, 6, 3, 2, 1]
[1, 2, 0, 1, 5]
[4, 1, 0, 1, 7]
[1, 0, 3, 0, 5]

Building prefix (showing the final result):
[0, 0, 0, 0, 0, 0]
[0, 3, 3, 4, 8, 10]
[0, 8, 14, 18, 24, 27]
[0, 9, 17, 21, 28, 36]
[0, 13, 22, 26, 34, 49]
[0, 14, 23, 30, 38, 58]

Query: sumRegion(2, 1, 4, 3)
= prefix[5][4] - prefix[2][4] - prefix[5][1] + prefix[2][1]
= 38 - 24 - 14 + 8
= 8 ✅

Verify manually:
Row 2: 2 + 0 + 1 = 3
Row 3: 1 + 0 + 1 = 2
Row 4: 0 + 3 + 0 = 3
Total: 3 + 2 + 3 = 8 ✅
```

---

### Problem 9: Continuous Subarray Sum

**LeetCode Link:** [https://leetcode.com/problems/continuous-subarray-sum/](https://leetcode.com/problems/continuous-subarray-sum/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, return `True` if `nums` has a **good subarray** - a subarray of length **at least 2** whose sum is a multiple of `k`.

**Example:**
```
Input: nums = [23, 2, 4, 6, 7], k = 6
Output: True (subarray [2, 4] has sum 6, which is 6×1)
```

#### Clarifying Questions & Constraints

- Subarray must have length ≥ 2.
- A multiple of k includes 0 (since 0 = k × 0).
- `k >= 1`, elements are non-negative.

#### Approach Discussion

**Approach 1: Brute Force**
- Check every subarray of length ≥ 2.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Prefix Sum + Modular Arithmetic + HashMap (Optimal) ✅**

Same concept as Problem 7 but with a twist: we need the subarray to have length ≥ 2.

If `prefix[j] % k == prefix[i] % k` and `j - i >= 2`, then the subarray from `i+1` to `j` has sum divisible by k and length ≥ 2.

Store the **first index** where each remainder was seen. If the same remainder appears again at an index ≥ 2 positions later, we found a valid subarray.

- **Time:** O(n), **Space:** O(min(n, k))

#### Code (Optimal Solution)

```python
def checkSubarraySum(nums: list[int], k: int) -> bool:
 """
 Check if there's a subarray of length >= 2 with sum divisible by k.
 
 Strategy:
 Same as "subarray sums divisible by k" but we need length >= 2.
 
 Store the FIRST index where each remainder appears.
 When the same remainder appears again at index j, the subarray from
 (first_index + 1) to j has sum divisible by k.
 We check if j - first_index >= 2 (ensuring length >= 2).
 
 Why first index? We want the LONGEST gap to maximize our chance of
 length >= 2. First index gives the widest possible range.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(min(n, k)) - at most k distinct remainders
 """
 # Map: remainder → first index where this remainder appeared
 # Remainder 0 is first seen at "index -1" (before the array)
 remainder_first = {0: -1}
 
 current_sum = 0
 
 for i in range(len(nums)):
 current_sum += nums[i]
 remainder = current_sum % k
 
 if remainder in remainder_first:
 # Same remainder seen before - check if the subarray is long enough
 if i - remainder_first[remainder] >= 2:
 return True
 # Don't update the index - we want to keep the FIRST occurrence
 else:
 remainder_first[remainder] = i
 
 return False
```

#### Edge Cases

- **Length 1 subarray with sum divisible by k:** `[6], k=6` → False (length < 2).
- **Two zeros:** `[0, 0], k=anything` → True (sum 0 is a multiple of everything).
- **k = 1:** Any subarray of length ≥ 2 works (every integer sum is divisible by 1).
- **Large k:** `[1, 2], k=100` → False (sum 3 is not divisible by 100).

#### Dry Run

```
Input: nums = [23, 2, 4, 6, 7], k = 6

remainder_first = {0: -1}, current_sum = 0

i=0: current_sum = 23, remainder = 23%6 = 5
 5 not in map → remainder_first = {0:-1, 5:0}

i=1: current_sum = 25, remainder = 25%6 = 1
 1 not in map → remainder_first = {0:-1, 5:0, 1:1}

i=2: current_sum = 29, remainder = 29%6 = 5
 5 in map (first at index 0)!
 i - first = 2 - 0 = 2 ≥ 2 ✅ → return True

The subarray is nums[1..2] = [2, 4], sum = 6, which is 6×1. ✅
```

---

### Problem 10: Count Number of Nice Subarrays

**LeetCode Link:** [https://leetcode.com/problems/count-number-of-nice-subarrays/](https://leetcode.com/problems/count-number-of-nice-subarrays/)

#### Problem Statement

Given an array of integers `nums` and an integer `k`, return the number of **nice subarrays** - subarrays that contain exactly `k` odd numbers.

**Example:**
```
Input: nums = [1, 1, 2, 1, 1], k = 3
Output: 2 (subarrays: [1,1,2,1] and [1,2,1,1])
```

#### Clarifying Questions & Constraints

- We care about the count of **odd** numbers, not even numbers.
- Even numbers don't affect the count but affect the subarray boundaries.
- `1 <= nums.length <= 50000`

#### Approach Discussion

**Approach 1: Brute Force**
- Check every subarray, count odd numbers.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Transform + Prefix Sum + HashMap (Optimal) ✅**

Transform the problem: replace each number with 1 if odd, 0 if even. Now "exactly k odd numbers" becomes "subarray sum equals k." This is exactly Problem 4 (Subarray Sum Equals K)!

- **Time:** O(n), **Space:** O(n)

This is the same transformation trick we saw in Problem 5 (Contiguous Array), where we turned 0s into -1s. Here, we turn the "counting odds" problem into a "sum equals k" problem.

#### Code (Optimal Solution)

```python
def numberOfSubarrays(nums: list[int], k: int) -> int:
 """
 Count subarrays with exactly k odd numbers.
 
 Transformation: Replace each number with 1 (odd) or 0 (even).
 Now the problem is: count subarrays with sum exactly k.
 This is identical to the "Subarray Sum Equals K" pattern.
 
 We don't even need to physically transform the array - we just
 add (num % 2) to the running sum instead of the number itself.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - hashmap of prefix sums
 """
 prefix_count = {0: 1} # prefix_sum 0 seen once (before array)
 current_sum = 0 # Counts odd numbers seen so far
 count = 0
 
 for num in nums:
 # Add 1 if odd, 0 if even
 current_sum += num % 2
 
 # How many earlier positions had (current_sum - k) odd numbers?
 needed = current_sum - k
 if needed in prefix_count:
 count += prefix_count[needed]
 
 prefix_count[current_sum] = prefix_count.get(current_sum, 0) + 1
 
 return count
```

#### Edge Cases

- **All odd:** `[1, 1, 1], k=2` → 2 (subarrays `[1,1]` at indices 0-1 and 1-2).
- **All even:** `[2, 4, 6], k=1` → 0 (no odd numbers at all).
- **k = 0:** Count subarrays with no odd numbers (all even).
- **Single element:** `[1], k=1` → 1.

#### Dry Run

```
Input: nums = [1, 1, 2, 1, 1], k = 3

Transform: [1, 1, 0, 1, 1] (odd→1, even→0)
Now count subarrays with sum = 3.

prefix_count = {0: 1}, current_sum = 0, count = 0

num=1 (odd): current_sum = 1
 needed = 1-3 = -2 → not in map → count = 0
 map = {0:1, 1:1}

num=1 (odd): current_sum = 2
 needed = 2-3 = -1 → not in map → count = 0
 map = {0:1, 1:1, 2:1}

num=2 (even): current_sum = 2
 needed = 2-3 = -1 → not in map → count = 0
 map = {0:1, 1:1, 2:2}

num=1 (odd): current_sum = 3
 needed = 3-3 = 0 → map[0] = 1 → count = 1
 map = {0:1, 1:1, 2:2, 3:1}
 Found: subarray from index 0 to 3 → [1, 1, 2, 1] has 3 odds ✅

num=1 (odd): current_sum = 4
 needed = 4-3 = 1 → map[1] = 1 → count = 2
 map = {0:1, 1:1, 2:2, 3:1, 4:1}
 Found: subarray from index 1 to 4 → [1, 2, 1, 1] has 3 odds ✅

Output: 2 ✅
```

---

## Key Takeaways & Summary

### Quick Reference Table

| Problem | Variation | Time | Space | Core Trick |
|---------|----------|------|-------|------------|
| Range Sum Query | Basic prefix sum | O(n) + O(1)/query | O(n) | `prefix[r+1] - prefix[l]` |
| Running Sum | Building prefix sums | O(n) | O(1) | `nums[i] += nums[i-1]` |
| Find Pivot Index | Left sum vs right sum | O(n) | O(1) | `right_sum = total - left - nums[i]` |
| Subarray Sum = K | Prefix + hashmap | O(n) | O(n) | Count `prefix - k` in map |
| Contiguous Array | Transform (0→-1) + hashmap | O(n) | O(n) | First occurrence of prefix sum |
| Product Except Self | Prefix & suffix products | O(n) | O(1) | Two-pass: left products then right |
| Sums Divisible by K | Prefix + modular + hashmap | O(n) | O(k) | Same remainder → divisible |
| Range Sum 2D | 2D prefix sum | O(mn) + O(1)/query | O(mn) | Inclusion-exclusion |
| Continuous Subarray Sum | Modular + first index | O(n) | O(k) | Same remainder, gap ≥ 2 |
| Nice Subarrays | Transform (odd→1) + hashmap | O(n) | O(n) | Reduce to subarray sum = k |

### The Three Flavors of Prefix Sum Problems

```
What are you asked to find?

1. RANGE SUM QUERIES - "What's the sum from index i to j?"
 └─ Build prefix array, answer in O(1)
 Formula: sum(i..j) = prefix[j+1] - prefix[i]

2. COUNT/FIND SUBARRAYS - "How many subarrays have sum = k / divisible by k?"
 └─ Prefix Sum + HashMap
 - For "sum = k": store count of each prefix sum, look for (current - k)
 - For "divisible by k": store count of each prefix sum % k (same remainder trick)
 - For "longest": store first index of each prefix sum (not count)
 - Initialize {0: 1} (or {0: -1} for longest)

3. PREFIX/SUFFIX PRODUCTS - "Product of everything except self"
 └─ Two-pass: prefix products left-to-right, then suffix products right-to-left
```

### The HashMap Initialization - A Summary

This trips up many people, so here's a clear rule:

| Problem Type | Initialize | Why |
|-------------|------------|-----|
| Count subarrays with sum = k | `{0: 1}` | Count 1 occurrence of prefix sum 0 (subarrays starting at index 0) |
| Longest subarray with sum = k | `{0: -1}` | Prefix sum 0 first seen at index -1 (before array starts) |
| Exists subarray with sum % k = 0 | `{0: -1}` | Remainder 0 first seen at index -1 |

The value in the map tells us:
- If we're **counting** → how many times this prefix sum appeared
- If we're finding **longest/exists** → the first index where it appeared

### Common Transformation Tricks

Several problems don't look like prefix sum problems at first, but become one after a transformation:

| Original Problem | Transformation | Becomes |
|-----------------|----------------|---------|
| Equal 0s and 1s | 0 → -1 | Subarray sum = 0 |
| Exactly k odd numbers | odd → 1, even → 0 | Subarray sum = k |
| At most k distinct | (various) | Sliding window (different pattern) |

The transformation step is often the hardest part. If a problem asks about counting specific elements in a subarray, try transforming it into a sum problem.

### What's Next?

With Prefix Sum covered, we've now completed three core patterns: Two Pointers, Sliding Window, and Prefix Sum. These three together handle a huge portion of array problems. Next up is **Pattern 4: HashMap / Frequency Counting** - a pattern that often works alongside prefix sums and shows up in almost every category of problems. Stay tuned!

---

> 💡 **Practice Tip:** The "prefix sum + hashmap" combination is one of the highest-value patterns in interviews. If you master Problems 4, 5, 7, 9, and 10 from this set, you'll be able to recognize and solve most subarray-sum variants. The key is always the same: "for the current prefix sum, how many (or where) have I seen `current_sum - target` before?"
