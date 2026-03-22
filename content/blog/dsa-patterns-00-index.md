---
title: "Array Patterns  -  The Complete Study Guide"
description: "A complete index of the most important array problem-solving patterns for DSA, with links to each pattern guide."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - dsa
  - dsa-patterns
---

# 🗺️ Array Patterns  -  The Complete Study Guide

## Welcome

This is a structured, beginner-friendly study guide for mastering **array and string patterns**  -  the building blocks of coding interviews. Each pattern has a dedicated deep-dive document with theory, intuition, templates, and 10 LeetCode problems solved step by step.

**Who is this for?**

- You're preparing for coding interviews and want a systematic approach
- You can solve easy problems but struggle to recognize *which technique* to apply
- You want to understand *why* an approach works, not just memorize solutions

**How to use this guide:**

1. Follow the patterns in order  -  they build on each other
2. Read the theory and templates first
3. Try each problem yourself for 15-20 minutes before reading the solution
4. If stuck, read only the approach section (not the code) and try again
5. After solving, read the dry run and edge cases to solidify understanding

---

## The Patterns

| # | Pattern | Document | Key Idea | Problems |
|---|---------|----------|----------|----------|
| 1 | [Two Pointers](./01_Two_Pointers.md) | `01_Two_Pointers.md` | Two indices moving through an array  -  toward each other or in the same direction  -  to find pairs, partition, or rearrange | 10 |
| 2 | [Binary Search](./02_Binary_Search.md) | `02_Binary_Search.md` | Halving the search space each step by exploiting sorted order or a monotonic condition | 10 |
| 3 | [Sliding Window](./03_Sliding_Window.md) | `03_Sliding_Window.md` | A moving range between two pointers, tracking a running state (sum, frequency, etc.) to avoid redundant computation | 10 |
| 4 | [Prefix Sum](./04_Prefix_Sum.md) | `04_Prefix_Sum.md` | Precomputing cumulative sums so any range sum can be answered in O(1) via subtraction | 10 |
| 5 | [HashMap / Frequency Counting](./05_HashMap_Frequency_Counting.md) | `05_HashMap_Frequency_Counting.md` | Trading O(n) space for O(1) lookups  -  complement search, frequency counting, grouping, and index tracking | 10 |
| 6 | Kadane's Algorithm | `06_Kadanes_Algorithm.md` | Finding the maximum (or minimum) subarray sum in one pass using a local vs global max decision | *Coming soon* |
| 7 | Sorting-Based Patterns | `07_Sorting_Based.md` | Sorting as a preprocessing step to simplify pair-finding, interval merging, and greedy decisions | *Coming soon* |
| 8 | Interval / Merge Intervals | `08_Intervals.md` | Sorting intervals by start time and merging or processing overlaps | *Coming soon* |
| 9 | Monotonic Stack | `09_Monotonic_Stack.md` | Maintaining a stack in increasing/decreasing order to efficiently find "next greater/smaller" elements | *Coming soon* |

> **Total: 90 problems** across 9 patterns when complete.

---

## How the Patterns Connect

These patterns don't exist in isolation. Understanding how they relate helps you pick the right tool.

```
                        ┌──────────────┐
                        │  Two Pointers │
                        └──────┬───────┘
                               │
               ┌───────────────┼───────────────┐
               │               │               │
               ▼               ▼               ▼
      ┌────────────┐   ┌─────────────┐   ┌──────────────┐
      │  Binary     │   │  Sliding    │   │   Sorting    │
      │  Search     │   │  Window     │   │   Based      │
      └────────────┘   └──────┬──────┘   └──────┬───────┘
                               │                 │
                               │                 ▼
                               │          ┌──────────────┐
                               │          │  Intervals   │
                               │          └──────────────┘
                               ▼
                        ┌─────────────┐
                        │  Prefix Sum │
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  HashMap /  │
                        │  Frequency  │
                        └─────────────┘

         ┌──────────────┐          ┌─────────────────┐
         │   Kadane's   │          │  Monotonic Stack │
         │  Algorithm   │          │                  │
         └──────────────┘          └─────────────────┘
         (builds on prefix sum      (often combined with
          and sliding window)        sliding window)
```

**Key relationships:**

- **Two Pointers → Binary Search**: Binary search uses two pointers (`low`, `high`) that converge on an answer by halving the search space. It's the "sorted array" specialization of two pointers.
- **Two Pointers → Sliding Window**: Sliding window is two same-direction pointers with a "window state" tracked between them.
- **Sliding Window → Prefix Sum**: Both avoid recomputation over ranges. Sliding window updates incrementally; prefix sum precomputes everything upfront.
- **Prefix Sum → HashMap**: Many prefix sum problems use a hashmap to store and look up previous prefix values (e.g., "subarray sum equals k").
- **Sorting → Intervals**: Nearly all interval problems start by sorting by start time.
- **Kadane's**: Combines ideas from prefix sum (running sum) and sliding window (expand/reset decision).
- **Monotonic Stack**: Often paired with sliding window for problems like "sliding window maximum."

---

## Pattern Selection Cheat Sheet

When you see a new problem, use these signals to narrow down the pattern:

```
Is the input SORTED (or should you sort it)?
│
├── YES, and looking for a TARGET value or boundary
│   └── Binary Search
│
├── YES, and looking for PAIRS or comparing ends
│   └── Two Pointers (opposite direction)
│
├── SORT FIRST, then process
│   ├── Intervals / overlaps → Merge Intervals
│   ├── Pairs / triplets → Sort + Two Pointers
│   └── Greedy decisions → Sorting-Based
│
└── NO (unsorted), what are you looking for?
    │
    ├── CONTIGUOUS subarray / substring with some property?
    │   ├── Fixed size or longest/shortest → Sliding Window
    │   ├── Range sum queries → Prefix Sum
    │   ├── Count subarrays with sum = k → Prefix Sum + HashMap
    │   └── Maximum sum subarray → Kadane's Algorithm
    │
    ├── Finding PAIRS, complements, or duplicates?
    │   └── HashMap
    │
    ├── Rearranging IN-PLACE?
    │   └── Two Pointers (same direction / partitioning)
    │
    ├── "Next greater / smaller element"?
    │   └── Monotonic Stack
    │
    └── Grouping or frequency analysis?
        └── HashMap / Frequency Counting
```

---

## Difficulty Progression Across All Patterns

If you're just starting out, here's a suggested order of problems across all patterns, grouped by difficulty:

### Phase 1: Foundations (Easy)
| Problem | Pattern | LeetCode # |
|---------|---------|-----------|
| Binary Search | Binary Search | 704 |
| Two Sum | HashMap | 1 |
| Valid Palindrome | Two Pointers | 125 |
| Running Sum of 1D Array | Prefix Sum | 1480 |
| Move Zeroes | Two Pointers | 283 |
| Maximum Average Subarray I | Sliding Window | 643 |
| Search Insert Position | Binary Search | 35 |
| Squares of a Sorted Array | Two Pointers | 977 |
| First Unique Character | HashMap | 387 |
| Merge Sorted Array | Two Pointers | 88 |

### Phase 2: Core Patterns (Easy-Medium)
| Problem | Pattern | LeetCode # |
|---------|---------|-----------|
| Two Sum II | Two Pointers | 167 |
| Find First and Last Position | Binary Search | 34 |
| Remove Duplicates | Two Pointers | 26 |
| Valid Anagram | HashMap | 242 |
| Range Sum Query | Prefix Sum | 303 |
| Find Pivot Index | Prefix Sum | 724 |
| Contains Duplicate II | HashMap | 219 |
| Search a 2D Matrix | Binary Search | 74 |
| Minimum Size Subarray Sum | Sliding Window | 209 |
| Intersection of Two Arrays II | HashMap | 350 |

### Phase 3: Pattern Mastery (Medium)
| Problem | Pattern | LeetCode # |
|---------|---------|-----------|
| Container With Most Water | Two Pointers | 11 |
| 3Sum | Two Pointers | 15 |
| Search in Rotated Sorted Array | Binary Search | 33 |
| Longest Substring Without Repeating | Sliding Window | 3 |
| Subarray Sum Equals K | Prefix Sum + HashMap | 560 |
| Group Anagrams | HashMap | 49 |
| Top K Frequent Elements | HashMap | 347 |
| Longest Consecutive Sequence | HashMap/Set | 128 |
| Find Minimum in Rotated Sorted Array | Binary Search | 153 |
| Koko Eating Bananas | Binary Search on Answer | 875 |

### Phase 4: Advanced (Medium-Hard)
| Problem | Pattern | LeetCode # |
|---------|---------|-----------|
| Trapping Rain Water | Two Pointers | 42 |
| Minimum Window Substring | Sliding Window | 76 |
| Sliding Window Maximum | Sliding Window + Deque | 239 |
| 4Sum II | HashMap | 454 |
| Range Sum Query 2D | 2D Prefix Sum | 304 |
| Median of Two Sorted Arrays | Binary Search | 4 |
| Split Array Largest Sum | Binary Search on Answer | 410 |
| Capacity to Ship Packages | Binary Search on Answer | 1011 |

---

## Each Document Follows This Structure

Every pattern document is organized the same way so you always know what to expect:

1. **What is [Pattern]?**  -  Concept explained from scratch with a concrete example
2. **When to Use It?**  -  Signals and triggers to recognize in problem statements
3. **Types / Variations**  -  Sub-patterns within the main technique
4. **Template Code**  -  Reusable Python templates with comments
5. **Problem Set (10 problems)**  -  Each with:
   - Problem statement & LeetCode link
   - Clarifying questions & constraints
   - Multiple approaches (brute force → optimal) with complexity analysis
   - Well-documented Python code
   - Edge case discussion
   - Step-by-step dry run
6. **Key Takeaways & Summary**  -  Tables, decision trees, and cheat sheets

---

## Getting Started

Open [`01_Two_Pointers.md`](./01_Two_Pointers.md) and begin. Good luck, and remember  -  the struggle is where the learning happens. Don't rush to the solutions.

---

*This guide is a work in progress. Patterns 6-9 are coming soon.*
