---
title: "HashMap and Frequency Counting Pattern - Complete Guide"
description: "Learn how to use hashmaps and frequency counting to solve common DSA problems efficiently in Python."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
 - dsa
 - dsa-patterns
---

# 🔰 Pattern 4: HashMap / Frequency Counting

## Table of Contents

1. [What is the HashMap Pattern?](#what-is-the-hashmap-pattern)
2. [When to Use HashMaps?](#when-to-use-hashmaps)
3. [Types of HashMap Patterns](#types-of-hashmap-patterns)
4. [Template Code](#template-code)
5. [Problem Set](#problem-set)
 - [Problem 1: Two Sum](#problem-1-two-sum)
 - [Problem 2: Valid Anagram](#problem-2-valid-anagram)
 - [Problem 3: Group Anagrams](#problem-3-group-anagrams)
 - [Problem 4: Top K Frequent Elements](#problem-4-top-k-frequent-elements)
 - [Problem 5: Longest Consecutive Sequence](#problem-5-longest-consecutive-sequence)
 - [Problem 6: Contains Duplicate II](#problem-6-contains-duplicate-ii)
 - [Problem 7: Intersection of Two Arrays II](#problem-7-intersection-of-two-arrays-ii)
 - [Problem 8: First Unique Character in a String](#problem-8-first-unique-character-in-a-string)
 - [Problem 9: 4Sum II](#problem-9-4sum-ii)
 - [Problem 10: Encode and Decode TinyURL](#problem-10-encode-and-decode-tinyurl)
6. [Key Takeaways & Summary](#key-takeaways - summary)

---

## What is the HashMap Pattern?

In the previous patterns, we've already used hashmaps as a supporting tool - tracking character frequencies in sliding window, storing prefix sums for subarray problems. In this section, we focus on problems where **the hashmap is the core of the solution**, not just a helper.

A hashmap (dictionary in Python) gives us two superpowers:

1. **O(1) lookup**: "Have I seen this value before?" - answered instantly.
2. **O(1) counting**: "How many times has this value appeared?" - tracked effortlessly.

These two operations are at the heart of an enormous number of array and string problems.

Let's see why this matters with the most classic example.

**Problem:** Given an array `[2, 7, 11, 15]` and target `9`, find two numbers that add up to 9.

**Without a hashmap (brute force):** Check every pair - O(n²).

```
(2,7) → 9 ✅ Found!
But in the worst case, we check n×(n-1)/2 pairs.
```

**With a hashmap:** For each number, ask "have I already seen `target - number`?"

```
num=2: need 9-2=7, seen={} → 7 not seen. Store 2.
num=7: need 9-7=2, seen={2: idx 0} → 2 IS seen! ✅ Done in 2 steps.
```

The hashmap turns "searching for a complement" from O(n) to O(1), reducing the overall time from O(n²) to O(n).

This trade-off - **spending O(n) space to save O(n) time per operation** - is the fundamental idea behind every problem in this section.

---

## When to Use HashMaps?

| Signal | Example |
|--------|---------|
| "Find if a **complement/pair** exists" | "Two numbers that sum to target" |
| "Count **frequencies** of elements" | "Most frequent element", "valid anagram" |
| "**Group** elements by some property" | "Group anagrams together" |
| "Find **duplicates** or unique elements" | "Contains duplicate", "first unique character" |
| "Check if something was **seen before**" | "Have we visited this state/value?" |
| "Need O(1) lookup" in a collection | Any problem where repeated searching kills performance |

### HashMap vs Sorting

Many hashmap problems can also be solved by sorting. The trade-off:

| Approach | Time | Space | When to prefer |
|----------|------|-------|---------------|
| HashMap | O(n) | O(n) | When you need O(n) time; when order doesn't matter |
| Sorting | O(n log n) | O(1)* | When you can't afford O(n) space; when you need order |

*Sorting may use O(n) or O(log n) space depending on the algorithm.

In interviews, the hashmap approach is usually preferred because it's faster. But knowing both gives you flexibility.

---

## Types of HashMap Patterns

### 1. Complement Lookup

Store values you've seen, and for each new value check if its **complement** (the value that would complete the condition) exists in the map.

```python
# "Does target - num exist in what I've seen?"
seen = {}
for i, num in enumerate(arr):
 complement = target - num
 if complement in seen:
 # Found a pair!
 seen[num] = i
```

**Used in:** Two Sum, 4Sum II, pair-finding problems.

### 2. Frequency Counting

Count how many times each element appears. Use the counts to answer questions about the data.

```python
from collections import Counter
freq = Counter(arr) # {element: count}
# or manually:
freq = {}
for x in arr:
 freq[x] = freq.get(x, 0) + 1
```

**Used in:** Anagram problems, top-k problems, duplicate detection.

### 3. Grouping by Key

Group elements that share a property. The "key" is derived from each element, and the "value" is a list of elements with that key.

```python
from collections import defaultdict
groups = defaultdict(list)
for item in items:
 key = compute_key(item)
 groups[key].append(item)
```

**Used in:** Group Anagrams, grouping by frequency, bucket sort.

### 4. Index Tracking

Store the **index** (not just presence) of each element. Useful when you need to know *where* something was seen, not just *if* it was seen.

```python
last_seen = {}
for i, num in enumerate(arr):
 if num in last_seen:
 prev_index = last_seen[num]
 # Do something with the gap (i - prev_index)
 last_seen[num] = i
```

**Used in:** Contains Duplicate II, finding distances between occurrences.

### 5. Set as a Simple HashMap

When you only need "seen or not seen" (no counting, no indices), a set is a cleaner choice. It's still a hash-based structure with O(1) lookup.

```python
seen = set()
for num in arr:
 if num in seen:
 # Duplicate found
 seen.add(num)
```

**Used in:** Longest Consecutive Sequence, duplicate detection.

---

## Template Code

### Template 1: Complement Lookup (Two Sum Style)

```python
def find_complement(arr, target):
 """
 For each element, check if the complement (target - element) was seen before.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - storing seen elements
 """
 seen = {} # value → index
 
 for i, num in enumerate(arr):
 complement = target - num
 if complement in seen:
 return [seen[complement], i] # Found the pair
 seen[num] = i
 
 return [] # No pair found
```

### Template 2: Frequency Counter

```python
from collections import Counter

def frequency_analysis(arr):
 """
 Count occurrences of each element and use the counts.
 
 Time Complexity: O(n) - one pass to count
 Space Complexity: O(k) - where k is the number of distinct elements
 """
 freq = Counter(arr)
 
 # Common operations on frequency maps:
 # freq.most_common(k) → top k elements by frequency
 # freq[x] → count of x
 # len(freq) → number of distinct elements
 # sum(freq.values()) → total elements (should equal len(arr))
 
 return freq
```

### Template 3: Grouping

```python
from collections import defaultdict

def group_by_property(items):
 """
 Group elements that share some computed property.
 
 Time Complexity: O(n × key_cost) - one pass, key computation per element
 Space Complexity: O(n) - storing all elements in groups
 """
 groups = defaultdict(list)
 
 for item in items:
 key = compute_key(item) # Define based on problem
 groups[key].append(item)
 
 return list(groups.values())
```

---

## Problem Set

### Difficulty Progression

| # | Problem | Difficulty | Key Concept |
|---|---------|-----------|-------------|
| 1 | Two Sum | Easy | Complement lookup |
| 2 | Valid Anagram | Easy | Frequency comparison |
| 3 | Group Anagrams | Medium | Grouping by sorted key |
| 4 | Top K Frequent Elements | Medium | Frequency + bucket sort |
| 5 | Longest Consecutive Sequence | Medium | Set for O(1) lookup |
| 6 | Contains Duplicate II | Easy | Index tracking |
| 7 | Intersection of Two Arrays II | Easy | Frequency intersection |
| 8 | First Unique Character | Easy | Frequency + order |
| 9 | 4Sum II | Medium | Complement lookup (pair sums) |
| 10 | Encode and Decode TinyURL | Medium | Bidirectional mapping |

---

### Problem 1: Two Sum

**LeetCode Link:** [https://leetcode.com/problems/two-sum/](https://leetcode.com/problems/two-sum/)

#### Problem Statement

Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. Each input has **exactly one solution**, and you may not use the same element twice.

**Example:**
```
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)
```

#### Clarifying Questions & Constraints

- Exactly one solution exists.
- Cannot use the same element twice (same index).
- Return indices, not values.
- Array is **not** sorted (unlike Two Sum II from the Two Pointers pattern).

#### Approach Discussion

**Approach 1: Brute Force**
- Check every pair.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Sort + Two Pointers**
- Sort the array, use two pointers.
- **Problem:** Sorting changes the indices. You'd need to track original indices.
- **Time:** O(n log n), **Space:** O(n)

**Approach 3: HashMap - Complement Lookup (Optimal) ✅**
- For each number, check if `target - num` is already in the map.
- If yes → return the two indices.
- If no → store `num: index` in the map for future lookups.
- **Time:** O(n), **Space:** O(n)

**Why is this the go-to approach for unsorted arrays?**
Two pointers needs a sorted array. Sorting costs O(n log n) and loses index information. The hashmap skips sorting entirely and gives us O(n).

#### Code (Both Solutions)

```python
# ============================================================
# APPROACH 1: Brute Force - O(n²)
# ============================================================
def twoSum_brute(nums: list[int], target: int) -> list[int]:
 """
 Check every pair of elements.
 
 Time Complexity: O(n²) - nested loops
 Space Complexity: O(1)
 """
 n = len(nums)
 for i in range(n):
 for j in range(i + 1, n):
 if nums[i] + nums[j] == target:
 return [i, j]
 return []


# ============================================================
# APPROACH 3: HashMap - O(n) ✅
# ============================================================
def twoSum(nums: list[int], target: int) -> list[int]:
 """
 Find two indices whose values sum to target using complement lookup.
 
 For each number, the complement is (target - number).
 If the complement is already in our map, we found the pair.
 Otherwise, store this number and its index for future lookups.
 
 Why single pass works:
 When we reach the second number of the pair, the first number
 is already in the map. We don't need to look ahead - only behind.
 
 Time Complexity: O(n) - single pass, O(1) per lookup
 Space Complexity: O(n) - storing up to n elements in the map
 """
 seen = {} # value → index
 
 for i, num in enumerate(nums):
 complement = target - num
 
 if complement in seen:
 # The complement was seen earlier - return both indices
 return [seen[complement], i]
 
 # Store this number's index for future lookups
 seen[num] = i
 
 return [] # Problem guarantees a solution, so this won't execute
```

#### Edge Cases

- **First two elements:** `[3, 3], target=6` → `[0, 1]`.
- **Negative numbers:** `[-1, -2, -3, -4, -5], target=-8` → `[-3 + -5]` → `[2, 4]`.
- **Zero in array:** `[0, 4, 3, 0], target=0` → `[0, 3]`.
- **Large array:** HashMap handles it in O(n) regardless of size.

#### Dry Run

```
Input: nums = [2, 7, 11, 15], target = 9

seen = {}

i=0, num=2: complement = 9-2 = 7
 7 not in seen → seen = {2: 0}

i=1, num=7: complement = 9-7 = 2
 2 IS in seen (index 0)! → return [0, 1] ✅

Output: [0, 1]
```

---

### Problem 2: Valid Anagram

**LeetCode Link:** [https://leetcode.com/problems/valid-anagram/](https://leetcode.com/problems/valid-anagram/)

#### Problem Statement

Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`, and `False` otherwise. An anagram uses the same characters with the same frequencies.

**Example:**
```
Input: s = "anagram", t = "nagaram"
Output: True
```

#### Clarifying Questions & Constraints

- Both strings consist of lowercase English letters.
- Same length is necessary but not sufficient (frequencies must also match).
- Follow-up: What if the inputs contain Unicode characters?

#### Approach Discussion

**Approach 1: Sort Both Strings**
- Sort both strings and compare.
- **Time:** O(n log n), **Space:** O(n) for the sorted copies.

**Approach 2: Frequency Count with Two Maps**
- Count character frequencies in both strings, compare the maps.
- **Time:** O(n), **Space:** O(1) - at most 26 lowercase letters.

**Approach 3: Single Frequency Count (Optimal) ✅**
- Use one map. Increment for characters in `s`, decrement for characters in `t`.
- If all counts are zero at the end, they're anagrams.
- **Time:** O(n), **Space:** O(1) - at most 26 entries.

#### Code (All Three Approaches)

```python
# ============================================================
# APPROACH 1: Sort - O(n log n)
# ============================================================
def isAnagram_sort(s: str, t: str) -> bool:
 """
 Sort both strings and compare.
 
 Time Complexity: O(n log n)
 Space Complexity: O(n) for sorted copies
 """
 return sorted(s) == sorted(t)


# ============================================================
# APPROACH 2: Two Counters - O(n)
# ============================================================
from collections import Counter

def isAnagram_two_counters(s: str, t: str) -> bool:
 """
 Compare frequency maps of both strings.
 
 Time Complexity: O(n)
 Space Complexity: O(1) - at most 26 entries
 """
 return Counter(s) == Counter(t)


# ============================================================
# APPROACH 3: Single Counter - O(n) ✅
# ============================================================
def isAnagram(s: str, t: str) -> bool:
 """
 Use a single frequency map: increment for s, decrement for t.
 If all counts end at zero, the strings are anagrams.
 
 Why a single map is slightly better:
 - One pass instead of building two separate maps.
 - Early exit possible if lengths differ.
 - Handles the Unicode follow-up naturally.
 
 Time Complexity: O(n) - one pass through each string
 Space Complexity: O(1) - at most 26 entries for lowercase English
 O(k) for Unicode where k is the charset size
 """
 # Quick check: different lengths can't be anagrams
 if len(s) != len(t):
 return False
 
 freq = {}
 
 # Increment for characters in s
 for char in s:
 freq[char] = freq.get(char, 0) + 1
 
 # Decrement for characters in t
 for char in t:
 freq[char] = freq.get(char, 0) - 1
 
 # Early exit: if any count goes negative, t has a character
 # that s doesn't have (or has more of it)
 if freq[char] < 0:
 return False
 
 # All counts should be zero (guaranteed by the length check + no negatives)
 return True
```

#### Edge Cases

- **Empty strings:** `"", ""` → True.
- **Different lengths:** `"ab", "abc"` → False (caught by length check).
- **Same characters, different counts:** `"aab", "abb"` → False.
- **Single characters:** `"a", "a"` → True; `"a", "b"` → False.

#### Dry Run

```
Input: s = "anagram", t = "nagaram"

len(s) = 7 == len(t) = 7 ✅

Increment for s = "anagram":
freq = {'a': 3, 'n': 1, 'g': 1, 'r': 1, 'm': 1}

Decrement for t = "nagaram":
'n': 1→0, 'a': 3→2, 'g': 1→0, 'a': 2→1, 'r': 1→0, 'a': 1→0, 'm': 1→0
No negative counts → return True ✅
```

---

### Problem 3: Group Anagrams

**LeetCode Link:** [https://leetcode.com/problems/group-anagrams/](https://leetcode.com/problems/group-anagrams/)

#### Problem Statement

Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.

**Example:**
```
Input: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
```

#### Clarifying Questions & Constraints

- All strings are lowercase English letters.
- Anagrams have the same characters with the same frequencies.
- Two strings are anagrams of each other if sorting them produces the same result.

#### Approach Discussion

**Approach 1: Sort Each String, Group by Sorted Key ✅**
- For each string, sort its characters to produce a canonical form.
- Group strings with the same sorted form.
- **Time:** O(n × k log k) where n = number of strings, k = max string length
- **Space:** O(n × k)

**Approach 2: Frequency Tuple as Key (Slightly Better) ✅**
- Instead of sorting, count character frequencies and use the frequency as a key.
- For lowercase English: a tuple of 26 counts like `(1, 0, 0, ..., 1, 0)` for "ae".
- **Time:** O(n × k) - counting is O(k), no sorting needed.
- **Space:** O(n × k)

Both approaches use the **grouping by key** pattern. The key insight is: two strings are anagrams if and only if they produce the same key (whether that key is a sorted string or a frequency tuple).

#### Code (Both Approaches)

```python
from collections import defaultdict

# ============================================================
# APPROACH 1: Sort as Key - O(n × k log k)
# ============================================================
def groupAnagrams_sort(strs: list[str]) -> list[list[str]]:
 """
 Group anagrams by using the sorted string as a dictionary key.
 
 Two strings are anagrams ⟺ their sorted forms are identical.
 
 Time Complexity: O(n × k log k) - sorting each string of length k
 Space Complexity: O(n × k) - storing all strings in groups
 """
 groups = defaultdict(list)
 
 for s in strs:
 # The key is the sorted version of the string
 key = tuple(sorted(s)) # tuple because lists aren't hashable
 groups[key].append(s)
 
 return list(groups.values())


# ============================================================
# APPROACH 2: Frequency Tuple as Key - O(n × k) ✅
# ============================================================
def groupAnagrams(strs: list[str]) -> list[list[str]]:
 """
 Group anagrams by using character frequency as a dictionary key.
 
 Instead of sorting (O(k log k)), we count characters (O(k)).
 The frequency tuple (count of 'a', count of 'b', ..., count of 'z')
 uniquely identifies an anagram group.
 
 Time Complexity: O(n × k) - counting characters in each string
 Space Complexity: O(n × k) - storing all strings in groups
 """
 groups = defaultdict(list)
 
 for s in strs:
 # Build a frequency key: 26-element tuple
 count = [0] * 26
 for char in s:
 count[ord(char) - ord('a')] += 1
 
 key = tuple(count) # e.g., "eat" → (1,0,0,0,1,0,...,1,0,0,0)
 groups[key].append(s)
 
 return list(groups.values())
```

#### Edge Cases

- **All same strings:** `["a", "a", "a"]` → `[["a", "a", "a"]]`.
- **All different:** `["a", "b", "c"]` → `[["a"], ["b"], ["c"]]`.
- **Empty strings:** `["", ""]` → `[["", ""]]` (both sort to "").
- **Single string:** `["abc"]` → `[["abc"]]`.

#### Dry Run

```
Input: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]

Using Approach 1 (sorted key):

"eat" → sorted = "aet" → groups["aet"] = ["eat"]
"tea" → sorted = "aet" → groups["aet"] = ["eat", "tea"]
"tan" → sorted = "ant" → groups["ant"] = ["tan"]
"ate" → sorted = "aet" → groups["aet"] = ["eat", "tea", "ate"]
"nat" → sorted = "ant" → groups["ant"] = ["tan", "nat"]
"bat" → sorted = "abt" → groups["abt"] = ["bat"]

Output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] ✅
```

---

### Problem 4: Top K Frequent Elements

**LeetCode Link:** [https://leetcode.com/problems/top-k-frequent-elements/](https://leetcode.com/problems/top-k-frequent-elements/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.

**Example:**
```
Input: nums = [1, 1, 1, 2, 2, 3], k = 2
Output: [1, 2]
```

#### Clarifying Questions & Constraints

- `k` is always valid (1 ≤ k ≤ number of distinct elements).
- The answer is guaranteed to be unique.
- Follow-up: Can you solve it in better than O(n log n)?

#### Approach Discussion

**Approach 1: Sort by Frequency**
- Count frequencies, sort by count, take top k.
- **Time:** O(n log n), **Space:** O(n)

**Approach 2: Heap (Min-Heap of Size k)**
- Count frequencies. Maintain a min-heap of size k.
- Push each element; if heap exceeds size k, pop the smallest.
- **Time:** O(n log k), **Space:** O(n)

**Approach 3: Bucket Sort (Optimal) ✅**
- Count frequencies. Create "buckets" indexed by frequency.
- Bucket `i` contains all elements that appear `i` times.
- Walk buckets from highest to lowest, collecting elements until we have k.
- **Time:** O(n), **Space:** O(n)

**Why bucket sort works here:** The maximum possible frequency is `n` (the array length). So we create `n+1` buckets. This avoids comparison-based sorting entirely.

#### Code (All Three Approaches)

```python
from collections import Counter
import heapq

# ============================================================
# APPROACH 1: Sort by Frequency - O(n log n)
# ============================================================
def topKFrequent_sort(nums: list[int], k: int) -> list[int]:
 """
 Count frequencies, sort by count, return top k.
 
 Time Complexity: O(n log n) - sorting dominates
 Space Complexity: O(n) - for the frequency map
 """
 freq = Counter(nums)
 # Sort by frequency (descending) and take the first k
 return [num for num, count in freq.most_common(k)]


# ============================================================
# APPROACH 2: Min-Heap of Size k - O(n log k)
# ============================================================
def topKFrequent_heap(nums: list[int], k: int) -> list[int]:
 """
 Use a min-heap of size k to efficiently find top k elements.
 
 We push (frequency, element) pairs. When the heap exceeds size k,
 pop the smallest - this ensures only the k largest remain.
 
 Time Complexity: O(n log k) - n insertions, each O(log k)
 Space Complexity: O(n) for frequency map + O(k) for heap
 """
 freq = Counter(nums)
 
 # Use a min-heap of size k
 # heapq is a min-heap, so smallest frequency gets popped
 heap = []
 for num, count in freq.items():
 heapq.heappush(heap, (count, num))
 if len(heap) > k:
 heapq.heappop(heap) # Remove the least frequent
 
 return [num for count, num in heap]


# ============================================================
# APPROACH 3: Bucket Sort - O(n) ✅
# ============================================================
def topKFrequent(nums: list[int], k: int) -> list[int]:
 """
 Use bucket sort to find top k frequent elements in O(n).
 
 Idea: Create an array of buckets where bucket[i] holds all elements
 that appear exactly i times. Since max frequency is n, we need n+1 buckets.
 Then walk from the highest bucket downward, collecting elements.
 
 Why this is O(n):
 - Counting frequencies: O(n)
 - Filling buckets: O(n) - each element goes into exactly one bucket
 - Collecting results: O(n) - we scan at most n buckets
 
 Time Complexity: O(n)
 Space Complexity: O(n) - for the frequency map and buckets
 """
 freq = Counter(nums)
 
 # Create buckets: index = frequency, value = list of elements with that frequency
 # Max frequency possible is len(nums)
 n = len(nums)
 buckets = [[] for _ in range(n + 1)]
 
 for num, count in freq.items():
 buckets[count].append(num)
 
 # Collect top k elements, starting from highest frequency
 result = []
 for i in range(n, 0, -1): # From frequency n down to 1
 for num in buckets[i]:
 result.append(num)
 if len(result) == k:
 return result
 
 return result
```

#### Edge Cases

- **k equals number of distinct elements:** Return all distinct elements.
- **All same element:** `[1,1,1], k=1` → `[1]`.
- **All unique:** `[1,2,3], k=2` → any 2 of the three (all have frequency 1).
- **Single element:** `[1], k=1` → `[1]`.

#### Dry Run

```
Input: nums = [1, 1, 1, 2, 2, 3], k = 2

Step 1: Count frequencies
freq = {1: 3, 2: 2, 3: 1}

Step 2: Fill buckets (n = 6)
buckets[0] = []
buckets[1] = [3] ← 3 appears 1 time
buckets[2] = [2] ← 2 appears 2 times
buckets[3] = [1] ← 1 appears 3 times
buckets[4] = []
buckets[5] = []
buckets[6] = []

Step 3: Collect from highest frequency
i=6: empty
i=5: empty
i=4: empty
i=3: result = [1] (need 1 more)
i=2: result = [1, 2] (got k=2 elements) → return!

Output: [1, 2] ✅
```

---

### Problem 5: Longest Consecutive Sequence

**LeetCode Link:** [https://leetcode.com/problems/longest-consecutive-sequence/](https://leetcode.com/problems/longest-consecutive-sequence/)

#### Problem Statement

Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in **O(n)** time.

**Example:**
```
Input: nums = [100, 4, 200, 1, 3, 2]
Output: 4 (sequence: [1, 2, 3, 4])
```

#### Clarifying Questions & Constraints

- Elements can be negative and can contain duplicates.
- "Consecutive" means the values differ by 1: `[1, 2, 3, 4]` not `[1, 3, 5, 7]`.
- Must be O(n) - so sorting (O(n log n)) is not allowed.

#### Approach Discussion

**Approach 1: Sort**
- Sort the array, scan for consecutive runs.
- **Time:** O(n log n) ❌ violates the O(n) constraint.
- **Space:** O(1) (or O(n) depending on sort).

**Approach 2: HashSet + Smart Sequence Start Detection (Optimal) ✅**

The key insight: we only want to start counting a sequence from its **beginning** - the smallest number in that sequence.

How do we know if a number is the start of a sequence? **If `num - 1` is NOT in the set.** If `num - 1` exists, then `num` is in the middle of some sequence, and we'll count it when we process the actual start.

- Put all numbers in a set (O(n)).
- For each number, if it's a sequence start (`num - 1` not in set), count how long the sequence goes (`num`, `num+1`, `num+2`, ...).
- Track the maximum length.

**Time:** O(n) - each number is visited at most twice (once when checking if it's a start, once when extending a sequence). **Space:** O(n).

#### Code (Both Approaches)

```python
# ============================================================
# APPROACH 1: Sort - O(n log n)
# ============================================================
def longestConsecutive_sort(nums: list[int]) -> int:
 """
 Sort and scan for consecutive runs.
 
 Time Complexity: O(n log n)
 Space Complexity: O(1) extra
 """
 if not nums:
 return 0
 
 nums.sort()
 max_length = 1
 current_length = 1
 
 for i in range(1, len(nums)):
 if nums[i] == nums[i - 1]:
 continue # Skip duplicates
 elif nums[i] == nums[i - 1] + 1:
 current_length += 1
 else:
 current_length = 1
 max_length = max(max_length, current_length)
 
 return max_length


# ============================================================
# APPROACH 2: HashSet - O(n) ✅
# ============================================================
def longestConsecutive(nums: list[int]) -> int:
 """
 Find the longest consecutive sequence using a set for O(1) lookups.
 
 Key Insight:
 Only start counting from the BEGINNING of a sequence.
 A number is a sequence start if (num - 1) is NOT in the set.
 
 Why this is O(n) and not O(n²):
 The inner while loop seems dangerous, but consider: each number
 in the array is part of exactly ONE sequence. It gets visited
 at most once by the inner loop (when we extend the sequence from
 its starting point) and once by the outer loop (where we skip it
 because num-1 exists). So total work across all iterations is O(n).
 
 Time Complexity: O(n) - each element is processed at most twice
 Space Complexity: O(n) - storing elements in a set
 """
 if not nums:
 return 0
 
 num_set = set(nums) # O(n) to build, handles duplicates automatically
 max_length = 0
 
 for num in num_set:
 # Only start counting if this is the BEGINNING of a sequence
 # (i.e., num-1 is NOT in the set)
 if num - 1 not in num_set:
 # This is a sequence start - count how far it goes
 current = num
 length = 1
 
 while current + 1 in num_set:
 current += 1
 length += 1
 
 max_length = max(max_length, length)
 
 return max_length
```

#### Edge Cases

- **Empty array:** `[]` → 0.
- **Single element:** `[7]` → 1.
- **All same:** `[5, 5, 5]` → 1 (set removes duplicates).
- **Negatives:** `[-2, -1, 0, 1]` → 4.
- **No consecutive:** `[10, 30, 50]` → 1.

#### Dry Run

```
Input: nums = [100, 4, 200, 1, 3, 2]

num_set = {1, 2, 3, 4, 100, 200}

num=1: 1-1=0 not in set → sequence START
 1→2→3→4→ (5 not in set) → length=4, max_length=4

num=2: 2-1=1 IS in set → SKIP (not a start)

num=3: 3-1=2 IS in set → SKIP

num=4: 4-1=3 IS in set → SKIP

num=100: 100-1=99 not in set → sequence START
 100→ (101 not in set) → length=1, max_length=4

num=200: 200-1=199 not in set → sequence START
 200→ (201 not in set) → length=1, max_length=4

Output: 4 ✅
```

---

### Problem 6: Contains Duplicate II

**LeetCode Link:** [https://leetcode.com/problems/contains-duplicate-ii/](https://leetcode.com/problems/contains-duplicate-ii/)

#### Problem Statement

Given an integer array `nums` and an integer `k`, return `True` if there are two distinct indices `i` and `j` such that `nums[i] == nums[j]` and `abs(i - j) <= k`.

**Example:**
```
Input: nums = [1, 2, 3, 1], k = 3
Output: True (nums[0] == nums[3] and |0 - 3| = 3 ≤ 3)
```

#### Clarifying Questions & Constraints

- We need both conditions: same value AND indices within distance k.
- Multiple duplicates may exist; we need any valid pair.

#### Approach Discussion

**Approach 1: Brute Force**
- For each pair `(i, j)`, check both conditions.
- **Time:** O(n × k) or O(n²), **Space:** O(1)

**Approach 2: HashMap - Track Last Index (Optimal) ✅**
- Store each value's most recent index.
- When we see a value again, check if the distance to the previous index is ≤ k.
- **Time:** O(n), **Space:** O(n)

**Approach 3: Sliding Window Set (Alternative) ✅**
- Maintain a set of elements in the current window of size k.
- If a new element is already in the set → duplicate within distance k.
- **Time:** O(n), **Space:** O(k)

#### Code (Approaches 2 and 3)

```python
# ============================================================
# APPROACH 2: HashMap - Track Last Index - O(n) ✅
# ============================================================
def containsNearbyDuplicate(nums: list[int], k: int) -> bool:
 """
 For each element, check if it appeared before within distance k.
 
 We store the most recent index of each value. When we see a value
 again, we check if (current_index - last_index) <= k.
 
 Why store the most recent index (not the first)?
 If the first occurrence is too far away, a later occurrence might be
 close enough. We want the CLOSEST previous match.
 
 Time Complexity: O(n) - single pass
 Space Complexity: O(n) - storing indices of all distinct values
 """
 last_index = {} # value → most recent index
 
 for i, num in enumerate(nums):
 if num in last_index and i - last_index[num] <= k:
 return True
 
 # Update to the most recent index
 last_index[num] = i
 
 return False


# ============================================================
# APPROACH 3: Sliding Window Set - O(n), O(k) space ✅
# ============================================================
def containsNearbyDuplicate_set(nums: list[int], k: int) -> bool:
 """
 Maintain a set of elements within a window of size k.
 
 If a new element is already in the set, it must be within distance k.
 When the window exceeds size k, remove the oldest element.
 
 Time Complexity: O(n) - single pass, O(1) per set operation
 Space Complexity: O(k) - set holds at most k+1 elements
 """
 window = set()
 
 for i, num in enumerate(nums):
 # If num is already in the window, found a duplicate within distance k
 if num in window:
 return True
 
 # Add the new element
 window.add(num)
 
 # If window exceeds size k, remove the element that's now too far away
 if len(window) > k:
 window.remove(nums[i - k])
 
 return False
```

#### Edge Cases

- **k = 0:** `abs(i-j) <= 0` means `i == j`, but we need distinct indices → always False.
- **No duplicates:** `[1, 2, 3], k=2` → False.
- **Duplicate too far:** `[1, 2, 3, 1], k=2` → False (distance is 3 > 2).
- **Adjacent duplicates:** `[1, 1], k=1` → True.

#### Dry Run

```
Input: nums = [1, 2, 3, 1], k = 3

Using Approach 2 (HashMap):
last_index = {}

i=0, num=1: not in map → last_index = {1: 0}
i=1, num=2: not in map → last_index = {1: 0, 2: 1}
i=2, num=3: not in map → last_index = {1: 0, 2: 1, 3: 2}
i=3, num=1: IN map, last at index 0. |3 - 0| = 3 ≤ 3 → return True ✅
```

---

### Problem 7: Intersection of Two Arrays II

**LeetCode Link:** [https://leetcode.com/problems/intersection-of-two-arrays-ii/](https://leetcode.com/problems/intersection-of-two-arrays-ii/)

#### Problem Statement

Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays. The result can be in any order.

**Example:**
```
Input: nums1 = [1, 2, 2, 1], nums2 = [2, 2]
Output: [2, 2]
```

#### Clarifying Questions & Constraints

- Result includes duplicates (unlike set intersection).
- `[2, 2]` intersected with `[2]` → `[2]` (limited by the smaller count).
- Follow-up: What if `nums1` is much smaller? What if `nums2` is stored on disk?

#### Approach Discussion

**Approach 1: Sort Both Arrays + Two Pointers**
- Sort both arrays, use two pointers to find common elements.
- **Time:** O(n log n + m log m), **Space:** O(1) extra.
- ✅ Good when arrays are already sorted or memory is limited.

**Approach 2: HashMap - Frequency Intersection (Optimal) ✅**
- Count frequencies in the smaller array (saves space).
- Iterate through the larger array; for each match, decrement the count.
- **Time:** O(n + m), **Space:** O(min(n, m)).

#### Code (Both Approaches)

```python
from collections import Counter

# ============================================================
# APPROACH 1: Sort + Two Pointers - O(n log n + m log m)
# ============================================================
def intersect_sort(nums1: list[int], nums2: list[int]) -> list[int]:
 """
 Sort both arrays and use two pointers to find matches.
 
 Time Complexity: O(n log n + m log m) for sorting
 Space Complexity: O(1) extra (not counting the result)
 """
 nums1.sort()
 nums2.sort()
 
 i, j = 0, 0
 result = []
 
 while i < len(nums1) and j < len(nums2):
 if nums1[i] == nums2[j]:
 result.append(nums1[i])
 i += 1
 j += 1
 elif nums1[i] < nums2[j]:
 i += 1
 else:
 j += 1
 
 return result


# ============================================================
# APPROACH 2: HashMap - O(n + m) ✅
# ============================================================
def intersect(nums1: list[int], nums2: list[int]) -> list[int]:
 """
 Count frequencies in the smaller array, then match against the larger.
 
 Why count the smaller array?
 The map size is proportional to the array we count. Using the smaller
 one minimizes space usage.
 
 For each element in the larger array:
 - If it exists in the map with count > 0: add to result, decrement count.
 - Decrementing prevents using the same occurrence twice.
 
 Time Complexity: O(n + m) - one pass each
 Space Complexity: O(min(n, m)) - map for the smaller array
 """
 # Always count the smaller array
 if len(nums1) > len(nums2):
 return intersect(nums2, nums1)
 
 freq = Counter(nums1) # Count the smaller array
 result = []
 
 for num in nums2:
 if freq.get(num, 0) > 0:
 result.append(num)
 freq[num] -= 1 # "Use up" one occurrence
 
 return result
```

#### Edge Cases

- **No intersection:** `[1, 2], [3, 4]` → `[]`.
- **Complete overlap:** `[2, 2], [2, 2]` → `[2, 2]`.
- **One empty:** `[], [1, 2]` → `[]`.
- **Partial overlap:** `[4, 9, 5], [9, 4, 9, 8, 4]` → `[4, 9]` (or `[9, 4]`).

#### Dry Run

```
Input: nums1 = [1, 2, 2, 1], nums2 = [2, 2]

nums2 is smaller → freq = Counter([2, 2]) = {2: 2}

Iterate through nums1:
num=1: freq.get(1, 0) = 0 → skip
num=2: freq[2] = 2 > 0 → result=[2], freq[2]=1
num=2: freq[2] = 1 > 0 → result=[2, 2], freq[2]=0
num=1: freq.get(1, 0) = 0 → skip

Output: [2, 2] ✅
```

---

### Problem 8: First Unique Character in a String

**LeetCode Link:** [https://leetcode.com/problems/first-unique-character-in-a-string/](https://leetcode.com/problems/first-unique-character-in-a-string/)

#### Problem Statement

Given a string `s`, find the first non-repeating character and return its index. If it does not exist, return `-1`.

**Example:**
```
Input: s = "leetcode"
Output: 0 ('l' appears only once and is the first such character)
```

#### Clarifying Questions & Constraints

- String consists of only lowercase English letters.
- We need the **first** (leftmost) unique character.

#### Approach Discussion

**Approach 1: Brute Force**
- For each character, scan the entire string to check if it appears elsewhere.
- **Time:** O(n²), **Space:** O(1)

**Approach 2: Two-Pass with Frequency Map (Optimal) ✅**
- Pass 1: Count the frequency of every character.
- Pass 2: Scan left to right, return the first character with count 1.
- **Time:** O(n), **Space:** O(1) - at most 26 entries.

**Why two passes?**
In one pass, when we see a character for the first time, we don't yet know if it will repeat later. We need the full frequency picture before we can answer "which character is unique."

#### Code (Optimal Solution)

```python
from collections import Counter

def firstUniqChar(s: str) -> int:
 """
 Find the first character that appears exactly once.
 
 Pass 1: Count all character frequencies.
 Pass 2: Scan left to right, return the first character with count == 1.
 
 Why can't we do this in one pass?
 At position i, we don't know if s[i] will repeat later. We need the
 complete frequency count before we can identify unique characters.
 
 Time Complexity: O(n) - two passes through the string
 Space Complexity: O(1) - at most 26 lowercase letters in the map
 """
 # Pass 1: Count frequencies
 freq = Counter(s)
 
 # Pass 2: Find the first character with count 1
 for i, char in enumerate(s):
 if freq[char] == 1:
 return i
 
 return -1 # No unique character found
```

#### Edge Cases

- **All unique:** `"abc"` → 0.
- **All same:** `"aaa"` → -1.
- **Unique at end:** `"aabb c"` → 4 (space at index 4 is unique if present, but constraints say lowercase letters only, so `"aabbc"` → 4, `'c'` is first unique).
- **Single character:** `"z"` → 0.
- **Empty string:** `""` → -1.

#### Dry Run

```
Input: s = "loveleetcode"

Pass 1: freq = {'l': 1, 'o': 2, 'v': 1, 'e': 4, 't': 1, 'c': 1, 'd': 1}

Pass 2:
i=0, 'l': freq['l']=1 → not anymore, wait...
Actually: let me recount.
s = "loveleetcode"
l:1, o:2, v:1, e:4, l:wait...

s = l, o, v, e, l, e, e, t, c, o, d, e
freq = {'l':2, 'o':2, 'v':1, 'e':4, 't':1, 'c':1, 'd':1}

Pass 2:
i=0, 'l': freq=2 → skip
i=1, 'o': freq=2 → skip
i=2, 'v': freq=1 → return 2 ✅

Output: 2
```

---

### Problem 9: 4Sum II

**LeetCode Link:** [https://leetcode.com/problems/4sum-ii/](https://leetcode.com/problems/4sum-ii/)

#### Problem Statement

Given four integer arrays `nums1`, `nums2`, `nums3`, and `nums4`, all of length `n`, return the number of tuples `(i, j, k, l)` such that `nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0`.

**Example:**
```
Input: nums1 = [1, 2], nums2 = [-2, -1], nums3 = [-1, 2], nums4 = [0, 2]
Output: 2
Tuples: (0,0,0,1) → 1+(-2)+(-1)+2 = 0
 (1,1,0,0) → 2+(-1)+(-1)+0 = 0
```

#### Clarifying Questions & Constraints

- All four arrays have the same length n.
- Elements can be from different arrays (indices are independent).
- We count **all** valid tuples (not just unique values).
- n ≤ 200.

#### Approach Discussion

**Approach 1: Brute Force - Four Nested Loops**
- Check every combination of `(i, j, k, l)`.
- **Time:** O(n⁴) ❌ - way too slow even for n=200 (1.6 billion operations).

**Approach 2: Three Loops + Set Lookup**
- Precompute all values of `nums4` into a set.
- Three nested loops for `nums1, nums2, nums3`, check if `-(a+b+c)` is in the set.
- **Time:** O(n³) - still too slow for n=200.

**Approach 3: Two-Map Split (Optimal) ✅**
- Split the four arrays into two groups: `(nums1, nums2)` and `(nums3, nums4)`.
- Compute all possible sums of pairs from group 1 → store in a hashmap with counts.
- Compute all possible sums of pairs from group 2 → look up `-(c+d)` in the map.
- **Time:** O(n²), **Space:** O(n²)

This is the "meet in the middle" technique - a powerful application of the complement lookup pattern.

#### Code (Optimal Solution)

```python
from collections import Counter

def fourSumCount(nums1: list[int], nums2: list[int], 
 nums3: list[int], nums4: list[int]) -> int:
 """
 Count tuples (i,j,k,l) where nums1[i]+nums2[j]+nums3[k]+nums4[l] = 0.
 
 Strategy - "Meet in the Middle":
 1. Compute all possible sums (a + b) for a in nums1, b in nums2.
 Store each sum and how many ways it can be formed.
 2. For each possible sum (c + d) where c in nums3, d in nums4,
 check if -(c + d) exists in the map from step 1.
 
 Why split into two halves?
 Four arrays with n elements each → n⁴ brute force.
 Splitting into pairs: n² pairs in each half → n² + n² = O(n²) total.
 
 Time Complexity: O(n²) - n² pairs per half
 Space Complexity: O(n²) - storing up to n² sums in the map
 """
 # Step 1: Compute all (a + b) sums and their counts
 ab_sums = Counter()
 for a in nums1:
 for b in nums2:
 ab_sums[a + b] += 1
 
 # Step 2: For each (c + d), check if -(c+d) was a valid (a+b) sum
 count = 0
 for c in nums3:
 for d in nums4:
 target = -(c + d)
 if target in ab_sums:
 count += ab_sums[target]
 
 return count
```

#### Edge Cases

- **All zeros:** `[0],[0],[0],[0]` → 1.
- **No valid tuples:** All positive numbers → 0 (can't sum to 0).
- **Large counts:** If many pairs produce the same sum, the count multiplies.

#### Dry Run

```
Input: nums1=[1,2], nums2=[-2,-1], nums3=[-1,2], nums4=[0,2]

Step 1: All (a+b) sums:
 1+(-2) = -1
 1+(-1) = 0
 2+(-2) = 0
 2+(-1) = 1
 ab_sums = {-1: 1, 0: 2, 1: 1}

Step 2: For each (c+d), look up -(c+d):
 c=-1, d=0: target = -(-1+0) = 1 → ab_sums[1] = 1 → count += 1
 c=-1, d=2: target = -(-1+2) = -1 → ab_sums[-1] = 1 → count += 1
 c=2, d=0: target = -(2+0) = -2 → not in map → count += 0
 c=2, d=2: target = -(2+2) = -4 → not in map → count += 0

Output: 2 ✅
```

---

### Problem 10: Encode and Decode TinyURL

**LeetCode Link:** [https://leetcode.com/problems/encode-and-decode-tinyurl/](https://leetcode.com/problems/encode-and-decode-tinyurl/)

#### Problem Statement

Design a URL shortening service. Implement `encode(longUrl)` which converts a long URL to a short URL, and `decode(shortUrl)` which converts the short URL back to the original.

**Example:**
```
url = "https://leetcode.com/problems/design-tinyurl"
tiny = encode(url) # e.g., "http://tinyurl.com/abc123"
original = decode(tiny) # "https://leetcode.com/problems/design-tinyurl"
```

#### Clarifying Questions & Constraints

- There's no restriction on how your encode/decode algorithm works.
- The short URL should map back to exactly the original long URL.
- This is a design problem - the focus is on demonstrating hashmap-based bidirectional mapping.

#### Approach Discussion

**Approach 1: Counter-Based (Simple)**
- Assign each URL an incrementing integer ID. Short URL = base URL + ID.
- **Pros:** Simple, deterministic, no collisions.
- **Cons:** Predictable (someone can guess URLs), IDs grow large.

**Approach 2: Random Code Generation (Better) ✅**
- Generate a random alphanumeric code for each URL.
- Store the mapping in both directions: code → long URL, long URL → code.
- Check for collisions (unlikely but possible).
- **Pros:** Unpredictable, short codes.
- **Cons:** Tiny collision risk.

**Approach 3: Hashing (Alternative)**
- Hash the long URL to produce the short code.
- **Pros:** Deterministic (same URL always gets same code).
- **Cons:** Hash collisions need handling.

The core data structure for all approaches is a **bidirectional hashmap** - two maps that let you look up in both directions.

#### Code (Approaches 1 and 2)

```python
import random
import string

# ============================================================
# APPROACH 1: Counter-Based - Simple
# ============================================================
class Codec_Counter:
 """
 Assign each URL an incrementing integer ID.
 
 Encode: Store longUrl with the next available ID.
 Decode: Look up the long URL by ID.
 
 Time Complexity: O(1) for both encode and decode
 Space Complexity: O(n) where n = number of URLs stored
 """
 def __init__(self):
 self.id_to_url = {} # id → long URL
 self.url_to_id = {} # long URL → id (avoid encoding same URL twice)
 self.counter = 0
 
 def encode(self, longUrl: str) -> str:
 # If already encoded, return the existing short URL
 if longUrl in self.url_to_id:
 return f"http://tinyurl.com/{self.url_to_id[longUrl]}"
 
 self.counter += 1
 self.id_to_url[self.counter] = longUrl
 self.url_to_id[longUrl] = self.counter
 return f"http://tinyurl.com/{self.counter}"
 
 def decode(self, shortUrl: str) -> str:
 # Extract the ID from the short URL
 url_id = int(shortUrl.split('/')[-1])
 return self.id_to_url[url_id]


# ============================================================
# APPROACH 2: Random Code - More Realistic ✅
# ============================================================
class Codec:
 """
 Generate a random 6-character code for each URL.
 
 Two hashmaps form a bidirectional mapping:
 - code_to_url: short code → original long URL (for decoding)
 - url_to_code: long URL → short code (to avoid encoding same URL twice)
 
 With 62 characters and 6 positions: 62^6 ≈ 56.8 billion possible codes.
 Collision probability is negligible for reasonable usage.
 
 Time Complexity: O(1) amortized for both encode and decode
 Space Complexity: O(n) where n = number of URLs stored
 """
 BASE = "http://tinyurl.com/"
 CHARS = string.ascii_letters + string.digits # a-z, A-Z, 0-9 (62 chars)
 CODE_LENGTH = 6
 
 def __init__(self):
 self.code_to_url = {} # code → long URL
 self.url_to_code = {} # long URL → code
 
 def _generate_code(self) -> str:
 """Generate a random 6-character alphanumeric code."""
 return ''.join(random.choices(self.CHARS, k=self.CODE_LENGTH))
 
 def encode(self, longUrl: str) -> str:
 # If already encoded, return the existing short URL
 if longUrl in self.url_to_code:
 return self.BASE + self.url_to_code[longUrl]
 
 # Generate a unique code (handle unlikely collisions)
 code = self._generate_code()
 while code in self.code_to_url:
 code = self._generate_code()
 
 # Store in both directions
 self.code_to_url[code] = longUrl
 self.url_to_code[longUrl] = code
 
 return self.BASE + code
 
 def decode(self, shortUrl: str) -> str:
 # Extract the code from the short URL and look it up
 code = shortUrl.replace(self.BASE, "")
 return self.code_to_url[code]
```

#### Edge Cases

- **Same URL encoded twice:** Should return the same short URL (handled by `url_to_code` check).
- **Empty URL:** Works, but unusual.
- **Very long URL:** No issue - the code length is independent of the URL length.
- **Decode an invalid short URL:** Would raise a KeyError (in production, return an error).

#### Dry Run

```
Using Approach 2 (Random Code):

encode("https://leetcode.com/problems/design-tinyurl"):
 Not in url_to_code → generate code "aB3xY7"
 code_to_url["aB3xY7"] = "https://leetcode.com/problems/design-tinyurl"
 url_to_code["https://leetcode.com/problems/design-tinyurl"] = "aB3xY7"
 Return: "http://tinyurl.com/aB3xY7"

decode("http://tinyurl.com/aB3xY7"):
 code = "aB3xY7"
 code_to_url["aB3xY7"] = "https://leetcode.com/problems/design-tinyurl"
 Return: "https://leetcode.com/problems/design-tinyurl" ✅

encode("https://leetcode.com/problems/design-tinyurl") again:
 Already in url_to_code → return "http://tinyurl.com/aB3xY7" (same code) ✅
```

---

## Key Takeaways & Summary

### Quick Reference Table

| Problem | HashMap Pattern | Time | Space | Core Trick |
|---------|----------------|------|-------|------------|
| Two Sum | Complement lookup | O(n) | O(n) | Look up `target - num` |
| Valid Anagram | Frequency comparison | O(n) | O(1) | Increment for s, decrement for t |
| Group Anagrams | Grouping by key | O(n×k) | O(n×k) | Sorted string or freq tuple as key |
| Top K Frequent | Frequency + bucket sort | O(n) | O(n) | Buckets indexed by frequency |
| Longest Consecutive | Set membership | O(n) | O(n) | Only start from sequence beginnings |
| Contains Duplicate II | Index tracking | O(n) | O(n) | Store last seen index, check gap |
| Intersection of Arrays | Frequency intersection | O(n+m) | O(min(n,m)) | Count smaller, decrement on match |
| First Unique Char | Frequency + scan | O(n) | O(1) | Two-pass: count then scan |
| 4Sum II | Meet in the middle | O(n²) | O(n²) | Split into two halves, complement |
| Encode/Decode TinyURL | Bidirectional map | O(1) | O(n) | Two maps: code↔URL |

### The Five HashMap Patterns - When to Use Each

```
What does the problem ask you to do?

1. "Find a PAIR/COMPLEMENT that satisfies some condition"
 └─ Complement Lookup
 Store seen values, check if (target - current) exists.
 Examples: Two Sum, 4Sum II

2. "Count/compare CHARACTER or ELEMENT frequencies"
 └─ Frequency Counting
 Use Counter or manual dict. Compare, find max, check validity.
 Examples: Valid Anagram, Top K Frequent, First Unique

3. "GROUP elements that share a property"
 └─ Grouping by Key
 Compute a key from each element, group into lists by key.
 Examples: Group Anagrams

4. "Check for DUPLICATES or DISTANCES between occurrences"
 └─ Index Tracking
 Store the index of each element. Compare indices when seen again.
 Examples: Contains Duplicate II, Longest Consecutive Sequence

5. "Map between two DOMAINS (lookup in both directions)"
 └─ Bidirectional Mapping
 Two maps: A→B and B→A.
 Examples: Encode/Decode TinyURL
```

### HashMap vs Other Approaches - Choosing Wisely

| Scenario | HashMap | Sorting | Two Pointers | Notes |
|----------|---------|---------|-------------|-------|
| Array is unsorted, need pairs | ✅ O(n) | O(n log n) | Needs sort first | HashMap is faster |
| Array is already sorted, need pairs | Works O(n) | Already done | ✅ O(n), O(1) space | Two pointers saves space |
| Need to group elements | ✅ Natural fit | Can sort, but grouping is awkward | N/A | HashMap is cleaner |
| Memory is very limited | ❌ O(n) space | ✅ O(1) space | ✅ O(1) space | Sort/two-pointers save space |
| Need elements in order | Extra work | ✅ Natural | ✅ Natural | HashMap loses insertion order (unless ordered dict) |

### Common Mistakes to Avoid

1. **Forgetting to handle the `{0: 1}` initialization** in prefix sum + hashmap problems. This isn't a hashmap-pattern mistake per se, but it overlaps heavily since those problems use hashmaps.

2. **Using a list where a set would suffice.** If you only need "seen or not," a set is cleaner and communicates intent better. `x in set` is O(1); `x in list` is O(n).

3. **Not considering what to store as the value.** Sometimes you need the index, sometimes the count, sometimes a list of items. The choice of value type determines which pattern you're using.

4. **Mutating the hashmap while iterating over it.** In Python, this raises a `RuntimeError`. If you need to modify, iterate over a copy: `for key in list(my_dict.keys())`.

5. **Assuming hashmap operations are always O(1).** They're O(1) *amortized*. In the worst case (many hash collisions), they can degrade. For interviews, O(1) is the standard assumption.

### What's Next?

We've now covered four core array patterns: Two Pointers, Sliding Window, Prefix Sum, and HashMap. These four alone will handle the majority of array problems you'll encounter. Next up is **Pattern 5: Kadane's Algorithm** - a deceptively simple technique for maximum subarray problems that shows up constantly in interviews. Stay tuned!

---

> 💡 **Practice Tip:** The hashmap is the most versatile tool in your algorithm toolkit. Almost every array problem has a hashmap-based solution. When you're stuck, ask yourself: "What would I store in a hashmap that would let me answer the question I need in O(1)?" That single question unlocks most solutions.
