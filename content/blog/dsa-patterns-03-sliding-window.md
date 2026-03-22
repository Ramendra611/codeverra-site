---
title: "Sliding Window Pattern - Complete Guide"
description: "Learn the sliding window technique to efficiently solve subarray and substring problems in Python."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
 - dsa
 - dsa-patterns
---

# 🔰 Pattern 2: Sliding Window

## Table of Contents

1. [What is the Sliding Window Technique?](#what-is-the-sliding-window-technique)
2. [When to Use Sliding Window?](#when-to-use-sliding-window)
3. [Types of Sliding Window](#types-of-sliding-window)
4. [Template Code](#template-code)
5. [Problem Set](#problem-set)
 - [Problem 1: Maximum Sum Subarray of Size K](#problem-1-maximum-sum-subarray-of-size-k)
 - [Problem 2: Longest Substring Without Repeating Characters](#problem-2-longest-substring-without-repeating-characters)
 - [Problem 3: Maximum Average Subarray I](#problem-3-maximum-average-subarray-i)
 - [Problem 4: Minimum Size Subarray Sum](#problem-4-minimum-size-subarray-sum)
 - [Problem 5: Permutation in String](#problem-5-permutation-in-string)
 - [Problem 6: Longest Repeating Character Replacement](#problem-6-longest-repeating-character-replacement)
 - [Problem 7: Fruit Into Baskets](#problem-7-fruit-into-baskets)
 - [Problem 8: Minimum Window Substring](#problem-8-minimum-window-substring)
 - [Problem 9: Sliding Window Maximum](#problem-9-sliding-window-maximum)
 - [Problem 10: Substring with Concatenation of All Words](#problem-10-substring-with-concatenation-of-all-words)
6. [Key Takeaways & Summary](#key-takeaways - summary)

---

## What is the Sliding Window Technique?

In the Two Pointers pattern, we learned how two indices can traverse an array efficiently. Sliding Window builds on that idea - it maintains a **range (window) between two pointers** and cares about the elements *inside* that range.

Let's see why this matters with a concrete problem.

**Problem:** Given an array `[2, 1, 5, 1, 3, 2]`, find the maximum sum of any 3 consecutive elements.

**Brute force:** For every starting index, sum up 3 elements.

```
[2, 1, 5, 1, 3, 2]
 ------ sum = 2+1+5 = 8
 ------ sum = 1+5+1 = 7
 ------ sum = 5+1+3 = 9
 ------ sum = 1+3+2 = 6

Max = 9
```

Each sum takes O(k) work, and there are O(n) positions → O(n × k) total.

**Sliding window insight:** When the window slides one position to the right, most of the elements stay the same. We only lose the leftmost element and gain one new element on the right.

```
Window [2, 1, 5] → sum = 8
Slide: drop 2, add 1
Window [1, 5, 1] → sum = 8 - 2 + 1 = 7 (reused the previous sum!)
Slide: drop 1, add 3
Window [5, 1, 3] → sum = 7 - 1 + 3 = 9
Slide: drop 5, add 2
Window [1, 3, 2] → sum = 9 - 5 + 2 = 6

Max = 9
```

Instead of recalculating the entire sum each time, we **update** it by subtracting the element that left the window and adding the element that entered. This turns O(n × k) into O(n).

> **Sliding Window** is a technique where you maintain a window (a contiguous subarray or substring) defined by two pointers, and slide it across the data - expanding or shrinking the window as needed - while efficiently tracking some property of the elements inside (sum, count, frequency, etc.).

### Why is it useful?

- **Avoids redundant work**: Instead of recomputing from scratch, you update incrementally.
- **Turns O(n × k) or O(n²) into O(n)**: One pass through the data.
- **Naturally handles "contiguous subarray/substring" problems**: If the problem asks about consecutive elements, think sliding window.

---

## When to Use Sliding Window?

Look for these **signals** in a problem:

| Signal | Example |
|--------|---------|
| "Contiguous subarray" or "substring" | "Find the longest substring that..." |
| "Of size k" or "of length k" | "Maximum sum of subarray of size k" |
| "Minimum/maximum length subarray with some condition" | "Shortest subarray with sum ≥ target" |
| Involves **frequency counting** in a range | "Check if string contains a permutation of another" |
| "At most k distinct" or "at most k changes" | "Longest substring with at most 2 distinct characters" |

### Sliding Window vs Two Pointers - What's the Difference?

Both use two pointers, so the line can feel blurry. The key distinction:

- **Two Pointers**: You care about the elements **at** the two pointer positions (e.g., `nums[left] + nums[right]`).
- **Sliding Window**: You care about **all elements between** the two pointers - the window as a whole (e.g., sum of the window, frequency map of the window).

In practice, if you're maintaining some running state (a sum, a hashmap, a count) that represents the content of a range, you're using a sliding window.

---

## Types of Sliding Window

### 1. Fixed-Size Window

The window size `k` is given. You slide a window of exactly `k` elements across the array.

```
Array: [a, b, c, d, e, f, g] k = 3
 [-----] window 1
 [-----] window 2
 [-----] window 3
 [-----] window 4
 [-----] window 5
```

**How it works:**
1. Build the first window (indices 0 to k-1).
2. Slide: remove the leftmost element, add the next right element.
3. Track the best result at each position.

**Use when:** The problem specifies a fixed window size ("subarray of size k", "every k consecutive elements").

### 2. Variable-Size Window (Expanding/Shrinking)

The window size changes dynamically. You expand the right end to include more elements, and shrink from the left when some condition is violated.

```
Array: [a, b, c, d, e, f, g]

 [ - ] expand right
 [-----] expand right
 [--------] condition violated!
 [-----] shrink left
 [--------] expand right
 [-----] shrink left
```

**How it works:**
1. Expand the window by moving `right` forward.
2. When the window **violates** the constraint, shrink by moving `left` forward.
3. At each step, check if the current window is the best answer so far.

**Use when:** You're looking for the **longest/shortest** subarray or substring that satisfies some condition.

### The Shrinking Decision

The hardest part of variable-size windows is knowing **when to shrink**. Here's the general rule:

- **Finding the longest** valid window → Shrink when the window becomes **invalid**. Keep it as large as possible.
- **Finding the shortest** valid window → Shrink when the window becomes **valid**. Try to make it smaller.

---

## Template Code

### Template 1: Fixed-Size Window

```python
def fixed_window(arr, k):
 """
 Template for fixed-size sliding window.
 
 Time Complexity: O(n) - one pass through the array
 Space Complexity: O(1) - only tracking the window state
 """
 n = len(arr)
 
 # Step 1: Build the first window (indices 0 to k-1)
 window_state = 0 # could be sum, product, count, etc.
 for i in range(k):
 window_state += arr[i] # or whatever operation
 
 best = window_state
 
 # Step 2: Slide the window from position k to n-1
 for right in range(k, n):
 # Add the new element entering the window
 window_state += arr[right]
 
 # Remove the element leaving the window
 left_leaving = right - k
 window_state -= arr[left_leaving]
 
 # Update the result
 best = max(best, window_state) # or min, or whatever
 
 return best
```

### Template 2: Variable-Size Window (Longest)

```python
def variable_window_longest(arr):
 """
 Template for variable-size window - finding the LONGEST valid window.
 Expand right always, shrink left only when window becomes invalid.
 
 Time Complexity: O(n) - each element is added and removed at most once
 Space Complexity: depends on what state you track (often O(k) for a hashmap)
 """
 left = 0
 window_state = {} # or sum, count, etc.
 best = 0
 
 for right in range(len(arr)):
 # EXPAND: Add arr[right] to window state
 # (update your hashmap, sum, count, etc.)
 
 # SHRINK: While the window is INVALID, remove from left
 while window_is_invalid():
 # Remove arr[left] from window state
 left += 1
 
 # UPDATE: Current window [left..right] is valid
 best = max(best, right - left + 1)
 
 return best
```

### Template 3: Variable-Size Window (Shortest)

```python
def variable_window_shortest(arr, target):
 """
 Template for variable-size window - finding the SHORTEST valid window.
 Expand right always, shrink left while window REMAINS valid.
 
 Time Complexity: O(n)
 Space Complexity: depends on state tracking
 """
 left = 0
 window_state = 0
 best = float('inf')
 
 for right in range(len(arr)):
 # EXPAND: Add arr[right] to window state
 window_state += arr[right]
 
 # SHRINK: While the window is VALID, try to make it smaller
 while window_is_valid():
 best = min(best, right - left + 1)
 # Remove arr[left] from window state
 window_state -= arr[left]
 left += 1
 
 return best if best != float('inf') else 0
```

---

## Problem Set

### Difficulty Progression

| # | Problem | Difficulty | Key Concept |
|---|---------|-----------|-------------|
| 1 | Max Sum Subarray of Size K | Easy | Fixed window basics |
| 2 | Longest Substring Without Repeating Characters | Medium | Variable window + hashmap |
| 3 | Maximum Average Subarray I | Easy | Fixed window with division |
| 4 | Minimum Size Subarray Sum | Medium | Variable window - shortest |
| 5 | Permutation in String | Medium | Fixed window + frequency matching |
| 6 | Longest Repeating Character Replacement | Medium | Variable window + character count |
| 7 | Fruit Into Baskets | Medium | Variable window - at most k distinct |
| 8 | Minimum Window Substring | Hard | Variable window - shortest with frequency |
| 9 | Sliding Window Maximum | Hard | Window + monotonic deque |
| 10 | Substring with Concatenation of All Words | Hard | Fixed window + word-level matching |

---

### Problem 1: Maximum Sum Subarray of Size K

**LeetCode Link:** This is a classic problem available on many platforms. On LeetCode, it maps to [https://leetcode.com/problems/maximum-average-subarray-i/](https://leetcode.com/problems/maximum-average-subarray-i/) (same logic, just divide by k at the end).

#### Problem Statement

Given an array of integers `nums` and an integer `k`, find the maximum sum of any contiguous subarray of size `k`.

**Example:**
```
Input: nums = [2, 1, 5, 1, 3, 2], k = 3
Output: 9 (subarray [5, 1, 3])
```

#### Clarifying Questions & Constraints

- `1 <= k <= len(nums)` - there's always at least one window.
- Elements can be negative.

#### Approach Discussion

**Approach 1: Brute Force**
- For each starting index `i`, sum up `k` elements: `sum(nums[i:i+k])`.
- **Time:** O(n × k) - summing k elements for each of n positions.
- **Space:** O(1)
- ❌ Redundant: most of the sum stays the same between adjacent windows.

**Approach 2: Fixed-Size Sliding Window (Optimal) ✅**
- Compute the sum of the first `k` elements.
- Slide: subtract the element going out, add the element coming in.
- **Time:** O(n) - single pass.
- **Space:** O(1)

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n × k)
# ============================================================
def max_sum_brute(nums: list[int], k: int) -> int:
 """
 Check every subarray of size k and return the maximum sum.
 
 Time Complexity: O(n × k) - for each position, sum k elements
 Space Complexity: O(1)
 """
 max_sum = float('-inf')
 
 for i in range(len(nums) - k + 1):
 # Sum the subarray from index i to i+k-1
 current_sum = 0
 for j in range(i, i + k):
 current_sum += nums[j]
 max_sum = max(max_sum, current_sum)
 
 return max_sum


# ============================================================
# APPROACH 2: Fixed-Size Sliding Window - O(n) ✅
# ============================================================
def max_sum_sliding_window(nums: list[int], k: int) -> int:
 """
 Find the maximum sum of any contiguous subarray of size k.
 
 Strategy:
 1. Compute the sum of the first window (indices 0 to k-1).
 2. Slide the window one step at a time:
 - Subtract the element that leaves (left side)
 - Add the element that enters (right side)
 3. Track the maximum sum seen.
 
 Time Complexity: O(n) - single pass through the array
 Space Complexity: O(1) - only a few variables
 """
 # Step 1: Compute the sum of the first window
 window_sum = sum(nums[:k])
 max_sum = window_sum
 
 # Step 2: Slide the window from index k to the end
 for right in range(k, len(nums)):
 # The element leaving the window is at index (right - k)
 # The element entering the window is at index (right)
 window_sum += nums[right] - nums[right - k]
 
 max_sum = max(max_sum, window_sum)
 
 return max_sum
```

#### Edge Cases

- **k equals array length:** Only one window - return the total sum.
- **All negative:** `[-3, -2, -5], k=2` → return `-5` (least negative).
- **Single element windows:** `k=1` → return the maximum element.

#### Dry Run

```
Input: nums = [2, 1, 5, 1, 3, 2], k = 3

Step 1: First window = nums[0:3] = [2, 1, 5]
 window_sum = 8, max_sum = 8

Step 2: right = 3
 window_sum = 8 + nums[3] - nums[0] = 8 + 1 - 2 = 7
 max_sum = max(8, 7) = 8

Step 3: right = 4
 window_sum = 7 + nums[4] - nums[1] = 7 + 3 - 1 = 9
 max_sum = max(8, 9) = 9

Step 4: right = 5
 window_sum = 9 + nums[5] - nums[2] = 9 + 2 - 5 = 6
 max_sum = max(9, 6) = 9

Output: 9 ✅ (subarray [5, 1, 3])
```

---

### Problem 2: Longest Substring Without Repeating Characters

**LeetCode Link:** [https://leetcode.com/problems/longest-substring-without-repeating-characters/](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

#### Problem Statement

Given a string `s`, find the length of the **longest substring** without repeating characters.

**Example:**
```
Input: s = "abcabcbb"
Output: 3 (substring "abc")
```

#### Clarifying Questions & Constraints

- The string can contain letters, digits, symbols, and spaces.
- An empty string has length 0.
- We need a **substring** (contiguous), not a subsequence.

#### Approach Discussion

**Approach 1: Brute Force**
- Check every substring, verify it has no duplicates.
- **Time:** O(n³) - O(n²) substrings × O(n) to check each.
- **Space:** O(min(n, 26)) for the character set.
- ❌ Far too slow.

**Approach 2: Sliding Window + HashSet (Good)**
- Expand `right` to include characters. If a duplicate is found, shrink from `left` one step at a time until the duplicate is removed.
- **Time:** O(2n) = O(n) - in the worst case, each character is added and removed once.
- **Space:** O(min(n, charset_size))

**Approach 3: Sliding Window + HashMap (Optimal) ✅**
- Instead of shrinking one step at a time, store the **last seen index** of each character.
- When we find a duplicate, jump `left` directly to `last_seen[char] + 1`.
- **Time:** O(n) - single pass, no inner shrinking loop.
- **Space:** O(min(n, charset_size))

#### Code (Approaches 2 and 3)

```python
# ============================================================
# APPROACH 2: Sliding Window + HashSet - O(n)
# ============================================================
def lengthOfLongestSubstring_set(s: str) -> int:
 """
 Use a set to track characters in the current window.
 When a duplicate is found, shrink from the left until it's removed.
 
 Time Complexity: O(n) - each character is added and removed from the set at most once
 (left and right each traverse the string once → 2n operations max)
 Space Complexity: O(min(n, m)) where m is the size of the character set
 """
 char_set = set()
 left = 0
 max_length = 0
 
 for right in range(len(s)):
 # If s[right] is already in the window, shrink from the left
 while s[right] in char_set:
 char_set.remove(s[left])
 left += 1
 
 # Add the new character to the window
 char_set.add(s[right])
 
 # Update the maximum length
 max_length = max(max_length, right - left + 1)
 
 return max_length


# ============================================================
# APPROACH 3: Sliding Window + HashMap - O(n) ✅ (Optimized)
# ============================================================
def lengthOfLongestSubstring(s: str) -> int:
 """
 Use a hashmap to store the last seen index of each character.
 When a duplicate is found, jump 'left' directly past the previous occurrence.
 
 Why is this better than the set approach?
 With a set, when we find a duplicate, we shrink left one step at a time.
 With a hashmap, we can jump left directly to the right position.
 
 Example: s = "abcba"
 - Set approach: when we hit the second 'b' at index 3, we remove 'a', then 'b' (2 steps)
 - HashMap approach: we see 'b' was last at index 1, so jump left to index 2 (1 step)
 
 Time Complexity: O(n) - single pass, right pointer visits each character exactly once
 Space Complexity: O(min(n, m)) where m is the character set size
 """
 last_seen = {} # char → most recent index where it appeared
 left = 0
 max_length = 0
 
 for right in range(len(s)):
 char = s[right]
 
 # If we've seen this character before AND it's inside our current window
 if char in last_seen and last_seen[char] >= left:
 # Jump left to one position past the previous occurrence
 left = last_seen[char] + 1
 
 # Update the last seen position of this character
 last_seen[char] = right
 
 # Update the maximum length
 max_length = max(max_length, right - left + 1)
 
 return max_length
```

#### Edge Cases

- **Empty string:** `""` → 0.
- **All same characters:** `"aaaa"` → 1.
- **All unique:** `"abcdef"` → 6 (the whole string).
- **Single character:** `"a"` → 1.
- **Spaces and symbols:** `"a b c"` → 3 (`"a b"` or `" b "` etc., space counts as a character).

#### Dry Run

```
Input: s = "abcabcbb"

Using Approach 3 (HashMap):
last_seen = {}, left = 0, max_length = 0

right=0: char='a', not seen → last_seen={'a':0}, max_length=max(0, 0-0+1)=1
right=1: char='b', not seen → last_seen={'a':0,'b':1}, max_length=max(1, 1-0+1)=2
right=2: char='c', not seen → last_seen={'a':0,'b':1,'c':2}, max_length=max(2, 2-0+1)=3
right=3: char='a', seen at 0, 0 >= left(0) → left=1
 last_seen={'a':3,'b':1,'c':2}, max_length=max(3, 3-1+1)=3
right=4: char='b', seen at 1, 1 >= left(1) → left=2
 last_seen={'a':3,'b':4,'c':2}, max_length=max(3, 4-2+1)=3
right=5: char='c', seen at 2, 2 >= left(2) → left=3
 last_seen={'a':3,'b':4,'c':5}, max_length=max(3, 5-3+1)=3
right=6: char='b', seen at 4, 4 >= left(3) → left=5
 last_seen={'a':3,'b':6,'c':5}, max_length=max(3, 6-5+1)=2
right=7: char='b', seen at 6, 6 >= left(5) → left=7
 last_seen={'a':3,'b':7,'c':5}, max_length=max(3, 7-7+1)=3 → stays 3

Output: 3 ✅
```

---

### Problem 3: Maximum Average Subarray I

**LeetCode Link:** [https://leetcode.com/problems/maximum-average-subarray-i/](https://leetcode.com/problems/maximum-average-subarray-i/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, find a contiguous subarray of length `k` that has the maximum average value and return this value.

**Example:**
```
Input: nums = [1, 12, -5, -6, 50, 3], k = 4
Output: 12.75 (subarray [12, -5, -6, 50] → sum=51, avg=51/4=12.75)
```

#### Clarifying Questions & Constraints

- `1 <= k <= nums.length`
- Elements can be negative.
- Result should be a floating point number.

#### Approach Discussion

**Approach 1: Brute Force**
- For each starting index, sum up k elements and compute average.
- **Time:** O(n × k), **Space:** O(1)

**Approach 2: Fixed-Size Sliding Window (Optimal) ✅**
- Identical to "Max Sum Subarray of Size K" - just divide the max sum by k at the end.
- No need to divide at every step since `max(sum/k)` = `max(sum) / k` when k is constant.
- **Time:** O(n), **Space:** O(1)

#### Code (Optimal Solution)

```python
def findMaxAverage(nums: list[int], k: int) -> float:
 """
 Find the maximum average of any contiguous subarray of size k.
 
 Since k is constant, maximizing the average is the same as maximizing the sum.
 We find the max sum and divide by k at the end.
 
 Time Complexity: O(n) - single pass after building the first window
 Space Complexity: O(1) - only tracking window sum and max sum
 """
 # Build the first window
 window_sum = sum(nums[:k])
 max_sum = window_sum
 
 # Slide the window
 for right in range(k, len(nums)):
 window_sum += nums[right] - nums[right - k]
 max_sum = max(max_sum, window_sum)
 
 # Divide at the end (not at each step - avoids floating point operations in the loop)
 return max_sum / k
```

#### Edge Cases

- **k equals array length:** Average of the entire array.
- **All negative:** `[-1, -2, -3], k=2` → `-1.5`.
- **k = 1:** Maximum element in the array.

#### Dry Run

```
Input: nums = [1, 12, -5, -6, 50, 3], k = 4

Step 1: First window = [1, 12, -5, -6] → window_sum = 2, max_sum = 2

Step 2: right=4 → window_sum = 2 + 50 - 1 = 51, max_sum = 51
 Window: [12, -5, -6, 50]

Step 3: right=5 → window_sum = 51 + 3 - 12 = 42, max_sum = 51
 Window: [-5, -6, 50, 3]

Result: 51 / 4 = 12.75 ✅
```

---

### Problem 4: Minimum Size Subarray Sum

**LeetCode Link:** [https://leetcode.com/problems/minimum-size-subarray-sum/](https://leetcode.com/problems/minimum-size-subarray-sum/)

#### Problem Statement

Given an array of **positive integers** `nums` and a positive integer `target`, return the **minimum length** of a subarray whose sum is greater than or equal to `target`. If no such subarray exists, return 0.

**Example:**
```
Input: target = 7, nums = [2, 3, 1, 2, 4, 3]
Output: 2 (subarray [4, 3] has sum 7 ≥ 7)
```

#### Clarifying Questions & Constraints

- All numbers are **positive** (this is important - it guarantees that adding more elements always increases the sum).
- Return 0 if no valid subarray exists.
- We want the **shortest** valid subarray.

#### Approach Discussion

**Approach 1: Brute Force**
- Try every subarray, check if its sum ≥ target, track the shortest.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Variable-Size Sliding Window - Shortest (Optimal) ✅**
- Expand `right` to grow the window sum.
- Once the sum ≥ target (window is **valid**), try to **shrink** from the left to find the minimum length.
- This works because all numbers are positive - shrinking the window always decreases the sum.
- **Time:** O(n), **Space:** O(1)

**Why does this only work with positive numbers?**
If there were negative numbers, shrinking from the left might actually *increase* the sum (removing a negative), which breaks the logic. For arrays with negatives, you'd need a different approach (e.g., prefix sum + binary search → O(n log n)).

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n²)
# ============================================================
def minSubArrayLen_brute(target: int, nums: list[int]) -> int:
 """
 Try every subarray starting from each index.
 
 Time Complexity: O(n²) - two nested loops
 Space Complexity: O(1)
 """
 n = len(nums)
 min_length = float('inf')
 
 for i in range(n):
 current_sum = 0
 for j in range(i, n):
 current_sum += nums[j]
 if current_sum >= target:
 min_length = min(min_length, j - i + 1)
 break # No point continuing - longer subarrays won't be shorter
 
 return min_length if min_length != float('inf') else 0


# ============================================================
# APPROACH 2: Variable-Size Sliding Window - O(n) ✅
# ============================================================
def minSubArrayLen(target: int, nums: list[int]) -> int:
 """
 Find the shortest subarray with sum >= target using a variable-size window.
 
 Strategy (Shortest valid window):
 - Expand right to increase the window sum.
 - Once sum >= target (valid), record the length, then SHRINK from left
 to see if we can find an even shorter valid window.
 - Keep shrinking as long as the window remains valid.
 
 Time Complexity: O(n) - left and right each move at most n times
 Space Complexity: O(1) - only a few variables
 """
 left = 0
 window_sum = 0
 min_length = float('inf')
 
 for right in range(len(nums)):
 # EXPAND: Add the new element to the window
 window_sum += nums[right]
 
 # SHRINK: While the window is valid (sum >= target), try to make it smaller
 while window_sum >= target:
 # Current window [left..right] is valid - record its length
 min_length = min(min_length, right - left + 1)
 
 # Remove the left element and shrink
 window_sum -= nums[left]
 left += 1
 
 return min_length if min_length != float('inf') else 0
```

#### Edge Cases

- **No valid subarray:** `target=100, nums=[1, 2, 3]` → return 0.
- **Single element ≥ target:** `target=5, nums=[5, 1, 2]` → return 1.
- **Entire array needed:** `target=15, nums=[1, 2, 3, 4, 5]` → return 5.

#### Dry Run

```
Input: target = 7, nums = [2, 3, 1, 2, 4, 3]

left=0, window_sum=0, min_length=∞

right=0: window_sum = 2 (< 7, don't shrink)
right=1: window_sum = 5 (< 7)
right=2: window_sum = 6 (< 7)
right=3: window_sum = 8 (≥ 7!)
 → min_length = min(∞, 3-0+1) = 4, window: [2,3,1,2]
 → shrink: window_sum = 8-2=6, left=1 (< 7, stop shrinking)

right=4: window_sum = 6+4 = 10 (≥ 7!)
 → min_length = min(4, 4-1+1) = 4, window: [3,1,2,4]
 → shrink: window_sum = 10-3=7, left=2 (≥ 7!)
 → min_length = min(4, 4-2+1) = 3, window: [1,2,4]
 → shrink: window_sum = 7-1=6, left=3 (< 7, stop)

right=5: window_sum = 6+3 = 9 (≥ 7!)
 → min_length = min(3, 5-3+1) = 3, window: [2,4,3]
 → shrink: window_sum = 9-2=7, left=4 (≥ 7!)
 → min_length = min(3, 5-4+1) = 2, window: [4,3]
 → shrink: window_sum = 7-4=3, left=5 (< 7, stop)

Output: 2 ✅ (subarray [4, 3])
```

---

### Problem 5: Permutation in String

**LeetCode Link:** [https://leetcode.com/problems/permutation-in-string/](https://leetcode.com/problems/permutation-in-string/)

#### Problem Statement

Given two strings `s1` and `s2`, return `True` if `s2` contains a permutation of `s1`.

In other words, check if any substring of `s2` is an anagram of `s1`.

**Example:**
```
Input: s1 = "ab", s2 = "eidbaooo"
Output: True (s2 contains "ba" which is a permutation of "ab")
```

#### Clarifying Questions & Constraints

- Both strings consist of lowercase English letters.
- A permutation of `s1` means same characters, same frequency, any order.
- `1 <= s1.length, s2.length <= 10^4`

#### Approach Discussion

**Approach 1: Generate All Permutations**
- Generate all permutations of `s1`, check if any exists in `s2`.
- **Time:** O(n! × m) - there are n! permutations, checking each in s2 takes O(m).
- ❌ Factorial time - completely impractical.

**Approach 2: Sort + Fixed Window (Decent)**
- Sort `s1`. For every window of size `len(s1)` in `s2`, sort the window and compare.
- **Time:** O(m × n log n) where m = len(s2), n = len(s1)
- ❌ Better but still not great.

**Approach 3: Fixed Window + Frequency Count (Optimal) ✅**
- A permutation has the exact same character frequencies as the original.
- Maintain a frequency count for a window of size `len(s1)` sliding over `s2`.
- Compare the window's frequency count with `s1`'s frequency count.
- **Time:** O(m) where m = len(s2) - O(26) comparison at each step is constant.
- **Space:** O(1) - frequency arrays of size 26.

#### Code (Optimal Solution)

```python
from collections import Counter

def checkInclusion(s1: str, s2: str) -> bool:
 """
 Check if any substring of s2 is a permutation (anagram) of s1.
 
 Strategy:
 - A permutation of s1 has the same character frequencies as s1.
 - Slide a window of size len(s1) over s2.
 - Maintain a frequency count for the window.
 - If the window's frequency matches s1's frequency → found a permutation.
 
 Optimization: Instead of comparing full frequency maps each time,
 we track how many characters have matching counts. When all 26
 characters match, we've found a permutation.
 
 Time Complexity: O(n + m) where n = len(s1), m = len(s2)
 - Building s1's frequency: O(n)
 - Sliding the window: O(m), with O(1) work per step
 Space Complexity: O(1) - frequency arrays of size 26 (constant)
 """
 n, m = len(s1), len(s2)
 
 # If s1 is longer than s2, no permutation can exist
 if n > m:
 return False
 
 # Frequency counts for s1 and the current window in s2
 s1_count = Counter(s1)
 window_count = Counter()
 
 # Track how many distinct characters have matching frequencies
 # When matches == number of distinct characters in s1_count, we found it
 matches = 0
 # Total distinct characters we need to match
 required = len(s1_count)
 
 for right in range(m):
 # ADD the new character to the window
 char = s2[right]
 window_count[char] += 1
 
 # Check if this character's count now matches s1
 if char in s1_count:
 if window_count[char] == s1_count[char]:
 matches += 1
 # If we just went FROM matching TO not matching (one over)
 elif window_count[char] == s1_count[char] + 1:
 matches -= 1
 
 # REMOVE the character that's leaving the window (once window > n)
 if right >= n:
 left_char = s2[right - n]
 # Check BEFORE removing: was this character matching?
 if left_char in s1_count:
 if window_count[left_char] == s1_count[left_char]:
 matches -= 1
 elif window_count[left_char] == s1_count[left_char] + 1:
 matches += 1
 window_count[left_char] -= 1
 
 # If all required characters match → permutation found
 if matches == required:
 return True
 
 return False
```

#### A Simpler (But Slightly Less Efficient) Version

The optimized version above can be tricky to get right. Here's a cleaner version that's still O(m):

```python
from collections import Counter

def checkInclusion_simple(s1: str, s2: str) -> bool:
 """
 Simpler version: compare full frequency counters.
 
 Since we only have 26 lowercase letters, comparing two Counters
 is O(26) = O(1), so the overall complexity is still O(m).
 
 Time Complexity: O(m × 26) = O(m) - comparing counters is O(26) per step
 Space Complexity: O(1) - counters hold at most 26 entries
 """
 n, m = len(s1), len(s2)
 if n > m:
 return False
 
 s1_count = Counter(s1)
 window_count = Counter(s2[:n]) # First window
 
 if s1_count == window_count:
 return True
 
 for right in range(n, m):
 # Add new character
 window_count[s2[right]] += 1
 
 # Remove old character
 left_char = s2[right - n]
 window_count[left_char] -= 1
 if window_count[left_char] == 0:
 del window_count[left_char] # Clean up zero counts for comparison
 
 if s1_count == window_count:
 return True
 
 return False
```

#### Edge Cases

- **s1 longer than s2:** `s1="abc", s2="ab"` → False.
- **Exact match:** `s1="abc", s2="abc"` → True.
- **Single character:** `s1="a", s2="a"` → True.
- **No match:** `s1="ab", s2="cccc"` → False.

#### Dry Run

```
Input: s1 = "ab", s2 = "eidbaooo"

Using the simpler version:
s1_count = {'a': 1, 'b': 1}, n = 2

First window "ei": window_count = {'e':1, 'i':1} → ≠ s1_count

right=2: add 'd', remove 'e' → window "id" → {'i':1, 'd':1} → ≠
right=3: add 'b', remove 'i' → window "db" → {'d':1, 'b':1} → ≠
right=4: add 'a', remove 'd' → window "ba" → {'b':1, 'a':1} → == s1_count ✅

Output: True ✅
```

---

### Problem 6: Longest Repeating Character Replacement

**LeetCode Link:** [https://leetcode.com/problems/longest-repeating-character-replacement/](https://leetcode.com/problems/longest-repeating-character-replacement/)

#### Problem Statement

Given a string `s` and an integer `k`, you can choose any character of the string and change it to any other uppercase character. You can perform this operation at most `k` times. Return the length of the longest substring containing the same letter after performing at most `k` replacements.

**Example:**
```
Input: s = "AABABBA", k = 1
Output: 4 ("AABABBA" → change one B → "AAAAABA" or similar, longest run = 4)
```

#### Clarifying Questions & Constraints

- String contains only uppercase English letters.
- `0 <= k <= len(s)`
- We want the **longest** window where we can make all characters the same with at most k changes.

#### Approach Discussion

**Key Insight:** In any window, the number of characters we need to change = `window_length - count_of_most_frequent_char`. If this is ≤ k, the window is valid (we can make all characters the same with at most k changes).

**Approach 1: Brute Force**
- For each substring, check if it can be made uniform with ≤ k changes.
- **Time:** O(n² × 26), **Space:** O(1)

**Approach 2: Variable-Size Sliding Window (Optimal) ✅**
- Expand `right`. Track frequency of each character in the window.
- The window is valid if: `window_length - max_frequency <= k`.
- If invalid, shrink from `left`.
- **Time:** O(n), **Space:** O(26) = O(1)

**A subtle point about `max_frequency`:** When we shrink the window, the true max frequency might decrease, but we don't bother updating it downward. Why? Because we only care about finding a *longer* valid window than our current best. The max_frequency only needs to increase (or stay the same) for that to happen. This is a common optimization in sliding window problems.

#### Code (Optimal Solution)

```python
def characterReplacement(s: str, k: int) -> int:
 """
 Find the longest substring where all characters can be made the same
 with at most k replacements.
 
 Core Idea:
 For a window to be valid: (window_size - max_freq_in_window) <= k
 - max_freq_in_window = count of the most frequent character in the window
 - (window_size - max_freq_in_window) = characters that need to be changed
 
 Time Complexity: O(n) - each character is visited at most twice (right adds, left removes)
 Space Complexity: O(26) = O(1) - frequency array for uppercase letters
 """
 freq = {} # Character frequencies in the current window
 max_freq = 0 # Highest frequency of any single character in the window
 left = 0
 max_length = 0
 
 for right in range(len(s)):
 # EXPAND: Add s[right] to the window
 char = s[right]
 freq[char] = freq.get(char, 0) + 1
 
 # Update max_freq if this character now has the highest count
 max_freq = max(max_freq, freq[char])
 
 # Window size = right - left + 1
 # Characters to change = window_size - max_freq
 window_size = right - left + 1
 
 # SHRINK: If the window is invalid (too many characters need changing)
 if window_size - max_freq > k:
 # Remove the leftmost character
 freq[s[left]] -= 1
 left += 1
 # Note: we DON'T decrease max_freq here.
 # It might be stale, but that's okay - we only need max_freq
 # to increase to find a LONGER valid window.
 
 # UPDATE: Record the current window length
 max_length = max(max_length, right - left + 1)
 
 return max_length
```

#### Edge Cases

- **k = 0:** Longest run of identical characters (no changes allowed).
- **k ≥ len(s):** Return len(s) (change everything).
- **All same characters:** `"AAAA", k=2` → 4 (already uniform).
- **Single character:** `"A", k=0` → 1.

#### Dry Run

```
Input: s = "AABABBA", k = 1

left=0, max_freq=0, freq={}

right=0: char='A', freq={'A':1}, max_freq=1
 window=1, changes=1-1=0 ≤ 1 ✅, max_length=1

right=1: char='A', freq={'A':2}, max_freq=2
 window=2, changes=2-2=0 ≤ 1 ✅, max_length=2

right=2: char='B', freq={'A':2,'B':1}, max_freq=2
 window=3, changes=3-2=1 ≤ 1 ✅, max_length=3

right=3: char='A', freq={'A':3,'B':1}, max_freq=3
 window=4, changes=4-3=1 ≤ 1 ✅, max_length=4

right=4: char='B', freq={'A':3,'B':2}, max_freq=3
 window=5, changes=5-3=2 > 1 ❌
 → remove s[0]='A': freq={'A':2,'B':2}, left=1
 max_length=4

right=5: char='B', freq={'A':2,'B':3}, max_freq=3
 window=5, changes=5-3=2 > 1 ❌
 → remove s[1]='A': freq={'A':1,'B':3}, left=2
 max_length=4

right=6: char='A', freq={'A':2,'B':3}, max_freq=3
 window=5, changes=5-3=2 > 1 ❌
 → remove s[2]='B': freq={'A':2,'B':2}, left=3
 max_length=4

Output: 4 ✅
```

---

### Problem 7: Fruit Into Baskets

**LeetCode Link:** [https://leetcode.com/problems/fruit-into-baskets/](https://leetcode.com/problems/fruit-into-baskets/)

#### Problem Statement

You have a row of trees, each producing one type of fruit (`fruits[i]`). You have **two baskets**, and each basket can only hold **one type** of fruit. Starting from any tree, you pick fruits from consecutive trees moving right. You stop when you encounter a third type of fruit.

Return the **maximum number of fruits** you can pick.

**Translation:** Find the longest contiguous subarray with **at most 2 distinct** elements.

**Example:**
```
Input: fruits = [1, 2, 1, 2, 3]
Output: 4 (subarray [1, 2, 1, 2] - only 2 types)
```

#### Clarifying Questions & Constraints

- This is the classic "longest subarray with at most k distinct elements" problem, where k = 2.
- `1 <= fruits.length <= 10^5`

#### Approach Discussion

**Approach 1: Brute Force**
- Check every subarray, count distinct elements, track the longest with ≤ 2.
- **Time:** O(n²), **Space:** O(n)

**Approach 2: Variable-Size Sliding Window (Optimal) ✅**
- Maintain a frequency map of fruit types in the window.
- Expand `right` to add fruits.
- When the window has more than 2 distinct types, shrink from `left`.
- **Time:** O(n), **Space:** O(1) - at most 3 entries in the map before shrinking.

#### Code (Optimal Solution)

```python
from collections import defaultdict

def totalFruit(fruits: list[int]) -> int:
 """
 Find the longest subarray with at most 2 distinct elements.
 
 This is the general "at most K distinct" sliding window pattern
 with K = 2.
 
 Strategy:
 - Expand right, adding fruit types to a frequency map.
 - When we have more than 2 distinct types, shrink from left
 until we're back to 2 types.
 - Track the maximum window size throughout.
 
 Time Complexity: O(n) - each element is added and removed at most once
 Space Complexity: O(1) - the frequency map has at most 3 entries at any point
 """
 freq = defaultdict(int) # fruit_type → count in current window
 left = 0
 max_fruits = 0
 
 for right in range(len(fruits)):
 # EXPAND: Add the new fruit to the window
 freq[fruits[right]] += 1
 
 # SHRINK: While we have more than 2 distinct types
 while len(freq) > 2:
 left_fruit = fruits[left]
 freq[left_fruit] -= 1
 if freq[left_fruit] == 0:
 del freq[left_fruit] # Remove the type entirely
 left += 1
 
 # UPDATE: Current window is valid (≤ 2 types)
 max_fruits = max(max_fruits, right - left + 1)
 
 return max_fruits
```

#### Generalizing to "At Most K Distinct"

```python
def longest_with_k_distinct(arr: list[int], k: int) -> int:
 """
 General version: longest subarray with at most K distinct elements.
 
 The Fruit Into Baskets problem is just this with k=2.
 
 Time Complexity: O(n)
 Space Complexity: O(k)
 """
 freq = defaultdict(int)
 left = 0
 max_length = 0
 
 for right in range(len(arr)):
 freq[arr[right]] += 1
 
 while len(freq) > k:
 freq[arr[left]] -= 1
 if freq[arr[left]] == 0:
 del freq[arr[left]]
 left += 1
 
 max_length = max(max_length, right - left + 1)
 
 return max_length
```

#### Edge Cases

- **Single type:** `[1, 1, 1]` → 3.
- **Two types:** `[1, 2, 1, 2]` → 4.
- **All different:** `[1, 2, 3, 4]` → 2.
- **Single element:** `[5]` → 1.

#### Dry Run

```
Input: fruits = [1, 2, 3, 2, 2]

left=0, freq={}, max_fruits=0

right=0: freq={1:1}, distinct=1 ≤ 2 ✅, max_fruits=1
right=1: freq={1:1, 2:1}, distinct=2 ≤ 2 ✅, max_fruits=2
right=2: freq={1:1, 2:1, 3:1}, distinct=3 > 2 ❌
 → remove fruits[0]=1: freq={2:1, 3:1}, left=1, distinct=2 ✅
 max_fruits = max(2, 2-1+1) = 2

right=3: freq={2:2, 3:1}, distinct=2 ≤ 2 ✅, max_fruits=3
right=4: freq={2:3, 3:1}, distinct=2 ≤ 2 ✅, max_fruits=4

Output: 4 ✅ (subarray [2, 3, 2, 2])
```

---

### Problem 8: Minimum Window Substring

**LeetCode Link:** [https://leetcode.com/problems/minimum-window-substring/](https://leetcode.com/problems/minimum-window-substring/)

#### Problem Statement

Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If no such window exists, return `""`.

**Example:**
```
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
```

#### Clarifying Questions & Constraints

- Characters can appear multiple times in `t`, and the window must contain at least that many.
- If multiple answers exist with the same length, any one is acceptable.
- `s` and `t` consist of uppercase and lowercase English letters.

#### Approach Discussion

**Approach 1: Brute Force**
- Check every substring of `s`, see if it contains all characters of `t`.
- **Time:** O(n² × m) where n = len(s), m = len(t). ❌ Way too slow.

**Approach 2: Variable-Size Sliding Window - Shortest (Optimal) ✅**
- Expand `right` to include more characters until the window contains everything in `t`.
- Once valid, **shrink** from `left` to find the minimum length.
- Track character frequencies with a counter, and use a `formed` variable to know when all required characters have been satisfied.
- **Time:** O(n + m), **Space:** O(m + n) in worst case for the frequency maps.

#### Code (Optimal Solution)

```python
from collections import Counter

def minWindow(s: str, t: str) -> str:
 """
 Find the shortest substring of s containing all characters of t.
 
 Strategy (Variable-size window - finding the SHORTEST valid window):
 1. Count the required frequencies from t.
 2. Expand right to include characters.
 3. Track how many required characters are fully satisfied.
 4. Once fully valid, shrink from left while staying valid, recording the min.
 
 Key variables:
 - required: number of distinct characters in t we need to match
 - formed: number of distinct characters currently satisfied in the window
 - When formed == required, the window is valid
 
 Time Complexity: O(|s| + |t|) - building t's counter is O(|t|),
 sliding window is O(|s|) since left and right each move at most |s| times
 Space Complexity: O(|s| + |t|) - for the frequency maps
 """
 if not s or not t or len(s) < len(t):
 return ""
 
 # Frequency of each character we need from t
 t_count = Counter(t)
 required = len(t_count) # Number of distinct characters to match
 
 # Current window state
 window_count = {}
 formed = 0 # How many distinct characters in t are fully satisfied
 
 # Result tracking: (window_length, left_index, right_index)
 result = (float('inf'), 0, 0)
 
 left = 0
 
 for right in range(len(s)):
 # EXPAND: Add s[right] to the window
 char = s[right]
 window_count[char] = window_count.get(char, 0) + 1
 
 # Check if this character is now fully satisfied
 if char in t_count and window_count[char] == t_count[char]:
 formed += 1
 
 # SHRINK: While the window is valid, try to minimize it
 while formed == required:
 # Update result if this window is smaller
 window_length = right - left + 1
 if window_length < result[0]:
 result = (window_length, left, right)
 
 # Remove the leftmost character
 left_char = s[left]
 window_count[left_char] -= 1
 
 # Check if removing this character breaks a satisfied condition
 if left_char in t_count and window_count[left_char] < t_count[left_char]:
 formed -= 1
 
 left += 1
 
 # Extract the result
 length, start, end = result
 return s[start:end + 1] if length != float('inf') else ""
```

#### Edge Cases

- **t longer than s:** `s="a", t="abc"` → `""`.
- **Exact match:** `s="abc", t="abc"` → `"abc"`.
- **No valid window:** `s="xyz", t="abc"` → `""`.
- **Duplicate characters in t:** `s="aaab", t="aa"` → `"aa"`.
- **t is a single character:** `s="abcda", t="a"` → `"a"`.

#### Dry Run

```
Input: s = "ADOBECODEBANC", t = "ABC"
t_count = {'A':1, 'B':1, 'C':1}, required = 3

right=0: char='A', window={'A':1}, formed=1 (A satisfied)
right=1: char='D', window={'A':1,'D':1}, formed=1
right=2: char='O', window={...,'O':1}, formed=1
right=3: char='B', window={...,'B':1}, formed=2 (B satisfied)
right=4: char='E', window={...,'E':1}, formed=2
right=5: char='C', window={...,'C':1}, formed=3 ✅ (all satisfied!)

 SHRINK:
 window "ADOBEC" length=6, result=(6, 0, 5)
 remove 'A': window_count['A']=0 < t_count['A']=1 → formed=2, left=1
 → stop shrinking (formed < required)

right=6: char='O', formed still 2
right=7: char='D', formed still 2
right=8: char='E', formed still 2
right=9: char='B', formed still 2
right=10: char='A', window_count['A']=1 == t_count['A']=1 → formed=3 ✅

 SHRINK:
 window "DOBECODEBA" (left=1, right=10) length=10 → not better than 6
 remove 'D': not in t_count, formed stays 3
 window "OBECODEBA" (left=2, right=10) length=9 → not better
 remove 'O': not in t_count
 "BECODEBA" length=8 → not better
 remove 'B': window_count['B']=1, still == t_count['B']=1, formed=3
 "ECODEBA" length=7 → not better
 remove 'E': not in t_count
 "CODEBA" length=6 → ties with current result
 remove 'C': window_count['C']=0 < 1 → formed=2, stop

right=11: char='N', formed=2
right=12: char='C', window_count['C']=1 → formed=3 ✅

 SHRINK:
 window "ODEBANC" (left=6, right=12) length=7 → not better than 6
 remove 'O': formed=3, left=7
 "DEBANC" length=6 → ties
 remove 'D': formed=3, left=8
 "EBANC" length=5 → NEW BEST! result=(5, 8, 12)
 remove 'E': formed=3, left=9
 "BANC" length=4 → NEW BEST! result=(4, 9, 12)
 remove 'B': window_count['B']=0 < 1 → formed=2, stop

Output: s[9:13] = "BANC" ✅
```

---

### Problem 9: Sliding Window Maximum

**LeetCode Link:** [https://leetcode.com/problems/sliding-window-maximum/](https://leetcode.com/problems/sliding-window-maximum/)

#### Problem Statement

Given an array `nums` and a sliding window of size `k`, return the maximum value in each window as it slides from left to right.

**Example:**
```
Input: nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]

Window [1,3,-1] → max=3
Window [3,-1,-3] → max=3
Window [-1,-3,5] → max=5
Window [-3,5,3] → max=5
Window [5,3,6] → max=6
Window [3,6,7] → max=7
```

#### Clarifying Questions & Constraints

- `1 <= k <= nums.length`
- The output has `n - k + 1` elements.
- This is asking for the max of each window, not just the overall max.

#### Approach Discussion

**Approach 1: Brute Force**
- For each window, scan all `k` elements to find the max.
- **Time:** O(n × k), **Space:** O(1)

**Approach 2: Sorted Container / Heap**
- Use a max-heap. Add new element, remove old element.
- **Time:** O(n log k) - heap operations are O(log k).
- Tricky to implement correctly (lazy deletion).

**Approach 3: Monotonic Deque (Optimal) ✅**
- Maintain a **deque** (double-ended queue) that stores **indices** of elements.
- Keep the deque in **decreasing order** of element values.
- The front of the deque is always the maximum of the current window.
- **Time:** O(n), **Space:** O(k)

**Why does the monotonic deque work?**
The key insight: if `nums[i] >= nums[j]` and `i > j`, then `nums[j]` can **never** be the maximum of any future window (because `nums[i]` entered later and is bigger). So we can discard `nums[j]`. This keeps only "useful" elements in the deque.

#### Code (Both Approaches)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n × k)
# ============================================================
def maxSlidingWindow_brute(nums: list[int], k: int) -> list[int]:
 """
 For each window position, find the max by scanning all k elements.
 
 Time Complexity: O(n × k)
 Space Complexity: O(1) extra (not counting the output)
 """
 result = []
 for i in range(len(nums) - k + 1):
 result.append(max(nums[i:i + k]))
 return result


# ============================================================
# APPROACH 3: Monotonic Deque - O(n) ✅
# ============================================================
from collections import deque

def maxSlidingWindow(nums: list[int], k: int) -> list[int]:
 """
 Find the maximum in each sliding window using a monotonic deque.
 
 The deque stores INDICES (not values) and maintains this invariant:
 - Elements in the deque are in DECREASING order of their values.
 - The front of the deque is the index of the current window's maximum.
 
 For each new element:
 1. Remove indices from the BACK if their values are ≤ current value
 (they'll never be the max while current element exists in the window).
 2. Add the current index to the back.
 3. Remove the FRONT if it's outside the current window.
 4. The front is the max of the current window.
 
 Time Complexity: O(n) - each element is added and removed from the deque at most once
 Space Complexity: O(k) - the deque holds at most k elements
 """
 dq = deque() # Stores indices, values are in decreasing order
 result = []
 
 for right in range(len(nums)):
 # Step 1: Remove elements from the BACK that are smaller than current
 # They can never be the max while nums[right] is in the window
 while dq and nums[dq[-1]] <= nums[right]:
 dq.pop()
 
 # Step 2: Add current index to the back
 dq.append(right)
 
 # Step 3: Remove the front if it's outside the current window
 # The window is [right - k + 1, right]
 if dq[0] < right - k + 1:
 dq.popleft()
 
 # Step 4: Once we've built the first full window, record the max
 # (The first full window is complete when right >= k - 1)
 if right >= k - 1:
 result.append(nums[dq[0]]) # Front of deque = max of window
 
 return result
```

#### Edge Cases

- **k = 1:** Every element is its own window → return the array as-is.
- **k = n:** Single window → return `[max(nums)]`.
- **Ascending array:** `[1,2,3,4], k=2` → `[2,3,4]` (front gets popped every time).
- **Descending array:** `[4,3,2,1], k=2` → `[4,3,2]` (back never gets popped, front gets popped).

#### Dry Run

```
Input: nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

right=0: num=1
 deque empty → add 0
 dq = [0] (values: [1])
 right < 2 → no output yet

right=1: num=3
 nums[0]=1 ≤ 3 → pop 0
 add 1
 dq = [1] (values: [3])
 right < 2 → no output yet

right=2: num=-1
 nums[1]=3 > -1 → don't pop
 add 2
 dq = [1, 2] (values: [3, -1])
 right >= 2 → output nums[1] = 3
 result = [3]

right=3: num=-3
 nums[2]=-1 > -3 → don't pop
 add 3
 dq = [1, 2, 3] (values: [3, -1, -3])
 dq[0]=1 >= 3-3+1=1 → front is still in window
 output nums[1] = 3
 result = [3, 3]

right=4: num=5
 nums[3]=-3 ≤ 5 → pop 3
 nums[2]=-1 ≤ 5 → pop 2
 nums[1]=3 ≤ 5 → pop 1
 add 4
 dq = [4] (values: [5])
 output nums[4] = 5
 result = [3, 3, 5]

right=5: num=3
 nums[4]=5 > 3 → don't pop
 add 5
 dq = [4, 5] (values: [5, 3])
 output nums[4] = 5
 result = [3, 3, 5, 5]

right=6: num=6
 nums[5]=3 ≤ 6 → pop 5
 nums[4]=5 ≤ 6 → pop 4
 add 6
 dq = [6] (values: [6])
 output nums[6] = 6
 result = [3, 3, 5, 5, 6]

right=7: num=7
 nums[6]=6 ≤ 7 → pop 6
 add 7
 dq = [7] (values: [7])
 output nums[7] = 7
 result = [3, 3, 5, 5, 6, 7]

Output: [3, 3, 5, 5, 6, 7] ✅
```

---

### Problem 10: Substring with Concatenation of All Words

**LeetCode Link:** [https://leetcode.com/problems/substring-with-concatenation-of-all-words/](https://leetcode.com/problems/substring-with-concatenation-of-all-words/)

#### Problem Statement

Given a string `s` and an array of strings `words` (all the same length), find all starting indices of substrings in `s` that are a concatenation of each word in `words` exactly once, in any order.

**Example:**
```
Input: s = "barfoothefoobarman", words = ["foo", "bar"]
Output: [0, 9]
Explanation:
 s[0:6] = "barfoo" → "bar" + "foo" ✅
 s[9:15] = "foobar" → "foo" + "bar" ✅
```

#### Clarifying Questions & Constraints

- All words have the **same length**.
- Words can repeat in the `words` array (e.g., `["foo", "foo"]`).
- The total window size = `word_length × number_of_words`.
- `1 <= words.length <= 5000`, `1 <= words[i].length <= 30`

#### Approach Discussion

**Approach 1: Brute Force**
- For each starting index in `s`, extract a window of the total size, split it into word-length chunks, and check if the chunks match `words`.
- **Time:** O(n × m × w) where n = len(s), m = number of words, w = word length. 
- Acceptable for moderate inputs but has redundant work.

**Approach 2: Sliding Window on Word Level (Optimal) ✅**
- Since all words have the same length `w`, we can think of the problem as a sliding window **at the word level**.
- We try `w` different starting offsets (0, 1, ..., w-1) to cover all alignments.
- For each offset, slide a word-level window, comparing word-sized chunks to the required frequency.
- **Time:** O(n × w) - for each of the w offsets, we scan the string once.
- **Space:** O(m) for the frequency map.

#### Code (Both Solutions)

```python
from collections import Counter

# ============================================================
# APPROACH 1: Brute Force - Check each position
# ============================================================
def findSubstring_brute(s: str, words: list[str]) -> list[int]:
 """
 For each starting position, extract words and check if they match.
 
 Time Complexity: O(n × m × w) where n=len(s), m=len(words), w=len(words[0])
 Space Complexity: O(m) for the word counter
 """
 if not s or not words:
 return []
 
 word_len = len(words[0])
 num_words = len(words)
 total_len = word_len * num_words
 word_count = Counter(words)
 result = []
 
 for i in range(len(s) - total_len + 1):
 # Extract the window and split into word-sized chunks
 seen = {}
 valid = True
 
 for j in range(num_words):
 word = s[i + j * word_len : i + (j + 1) * word_len]
 
 if word not in word_count:
 valid = False
 break
 
 seen[word] = seen.get(word, 0) + 1
 
 if seen[word] > word_count[word]:
 valid = False
 break
 
 if valid:
 result.append(i)
 
 return result


# ============================================================
# APPROACH 2: Word-Level Sliding Window - O(n × w) ✅
# ============================================================
def findSubstring(s: str, words: list[str]) -> list[int]:
 """
 Use a sliding window at the word level for each possible starting offset.
 
 Key Insight: Since all words have the same length w, any valid concatenation
 starts at some offset 0, 1, ..., w-1 relative to word boundaries.
 For each offset, we slide a window of num_words words across s.
 
 For offset = 0: check positions 0, w, 2w, 3w, ...
 For offset = 1: check positions 1, w+1, 2w+1, ...
 ...
 For offset = w-1: check positions w-1, 2w-1, ...
 
 At each step, we add one word to the right of the window and potentially
 remove one from the left, maintaining a frequency count.
 
 Time Complexity: O(n × w) - for each of w offsets, we scan the string in O(n/w) steps
 Space Complexity: O(m) where m = number of words
 """
 if not s or not words:
 return []
 
 word_len = len(words[0])
 num_words = len(words)
 total_len = word_len * num_words
 word_count = Counter(words)
 result = []
 
 # Try each starting offset from 0 to word_len - 1
 for offset in range(word_len):
 # Window state for this offset
 window = {}
 formed = 0 # Number of distinct words with matching counts
 required = len(word_count)
 left = offset # Left boundary of the window (character index)
 
 # Slide through the string in steps of word_len
 for right_start in range(offset, len(s) - word_len + 1, word_len):
 # Extract the word entering the window
 word = s[right_start : right_start + word_len]
 
 if word in word_count:
 # Add the word to the window
 window[word] = window.get(word, 0) + 1
 
 if window[word] == word_count[word]:
 formed += 1
 elif window[word] == word_count[word] + 1:
 # We just went over - was matching, now isn't
 formed -= 1
 
 # SHRINK: If we have too many of this word, shrink from left
 while window.get(word, 0) > word_count.get(word, 0):
 left_word = s[left : left + word_len]
 if left_word in word_count:
 if window[left_word] == word_count[left_word]:
 formed -= 1
 window[left_word] -= 1
 if window[left_word] == word_count[left_word]:
 formed += 1
 left += word_len
 
 # CHECK: If all words are satisfied
 if formed == required:
 result.append(left)
 
 else:
 # Word not in our required set - reset the window
 window.clear()
 formed = 0
 left = right_start + word_len
 
 return sorted(result)
```

#### Edge Cases

- **Single word:** `s="foobar", words=["foo"]` → `[0]`.
- **No match:** `s="abc", words=["def"]` → `[]`.
- **Duplicate words:** `s="aaa", words=["a", "a"]` → `[0, 1]`.
- **s shorter than total_len:** `s="ab", words=["abc"]` → `[]`.

#### Dry Run

```
Input: s = "barfoothefoobarman", words = ["foo", "bar"]
word_len = 3, num_words = 2, total_len = 6
word_count = {"foo": 1, "bar": 1}

Offset 0: positions 0, 3, 6, 9, 12, 15
 left=0, window={}, formed=0

 pos=0: word="bar" (in word_count)
 window={"bar":1}, bar matches → formed=1
 
 pos=3: word="foo" (in word_count)
 window={"bar":1,"foo":1}, foo matches → formed=2
 formed==required ✅ → result.append(0)
 
 pos=6: word="the" (NOT in word_count)
 → reset: window={}, formed=0, left=9
 
 pos=9: word="foo" → window={"foo":1}, formed=1
 
 pos=12: word="bar" → window={"foo":1,"bar":1}, formed=2
 formed==required ✅ → result.append(9)
 
 pos=15: word="man" → reset

Offsets 1 and 2 produce no additional matches.

Output: [0, 9] ✅
```

---

## Key Takeaways & Summary

### Quick Reference Table

| Problem | Window Type | Time | Space | Core Trick |
|---------|------------|------|-------|------------|
| Max Sum Subarray K | Fixed | O(n) | O(1) | Add right, subtract left |
| Longest Substring No Repeat | Variable (longest) | O(n) | O(min(n,m)) | HashMap tracks last seen index |
| Max Average Subarray I | Fixed | O(n) | O(1) | Same as max sum, divide at end |
| Min Size Subarray Sum | Variable (shortest) | O(n) | O(1) | Shrink while valid (positive numbers) |
| Permutation in String | Fixed | O(n) | O(1) | Frequency matching with counters |
| Longest Repeating Char Replace | Variable (longest) | O(n) | O(1) | window - max_freq ≤ k |
| Fruit Into Baskets | Variable (longest) | O(n) | O(1) | At most k=2 distinct |
| Min Window Substring | Variable (shortest) | O(n) | O(m) | Frequency match, shrink while valid |
| Sliding Window Maximum | Fixed | O(n) | O(k) | Monotonic deque |
| Concat All Words | Fixed (word-level) | O(n×w) | O(m) | Word-level window, w offsets |

### Decision Framework

```
Does the problem involve contiguous subarrays/substrings?
├── YES → Sliding Window is likely the right approach
│
│ Is the window size given (fixed k)?
│ ├── YES → Fixed-Size Window
│ │ Build first window, then slide: add right, remove left
│ │
│ └── NO → Variable-Size Window
│ │
│ Looking for the LONGEST valid window?
│ ├── YES → Expand always, shrink when INVALID
│ │
│ └── NO (looking for SHORTEST)
│ → Expand always, shrink while VALID
│
└── NO → Consider other patterns (Two Pointers, Prefix Sum, etc.)
```

### Common Mistakes to Avoid

1. **Forgetting to handle the first window separately** in fixed-size problems. The sliding part starts *after* the first window is built.

2. **Confusing when to shrink**: For longest → shrink when invalid. For shortest → shrink when valid. Getting this backwards is a very common bug.

3. **Not cleaning up zero counts** in frequency maps. When using `Counter` comparison (`==`), a key with count 0 is different from the key being absent. Always `del` keys that drop to 0 if you're comparing maps.

4. **Off-by-one errors** on window boundaries. The window `[left, right]` has size `right - left + 1`. The element leaving a fixed window of size k when `right` enters is at index `right - k`.

5. **Assuming sliding window works with negative numbers** for min-size subarray problems. It only works when the window sum is monotonically related to window size (which requires positive numbers).

### What's Next?

With Two Pointers and Sliding Window covered, the next pattern is **Prefix Sum** - a technique for answering range-sum queries in O(1) after O(n) preprocessing. It pairs naturally with hashmaps for powerful subarray-sum problems like "Subarray Sum Equals K". Stay tuned for Pattern 3!

---

> 💡 **Practice Tip:** For sliding window problems, always start by asking two questions: (1) Is the window fixed or variable? (2) Am I looking for the longest or shortest? These two answers determine which template to use.
