---
title: "Stacks in Python - Complete Guide"
description: "Learn how stacks work, how to implement them in Python, and how to solve common stack-based problems."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
 - dsa
---

# Stacks

---

## Table of Contents

- [What You Will Learn in This Blog](#what-you-will-learn-in-this-blog)
- [What is a Stack](#what-is-a-stack)
- [Core Stack Operations](#core-stack-operations)
- [Implementing a Stack](#implementing-a-stack)
 - [Implementation 1 - Using a Python List](#implementation-1----using-a-python-list)
 - [Implementation 2 - Using a Linked List](#implementation-2----using-a-linked-list)
 - [Which Implementation to Use](#which-implementation-to-use)
- [The Call Stack](#the-call-stack)
 - [How Python Uses a Stack for Function Calls](#how-python-uses-a-stack-for-function-calls)
 - [Stack Overflow](#stack-overflow)
- [Monotonic Stack](#monotonic-stack)
 - [What is a Monotonic Stack](#what-is-a-monotonic-stack)
 - [Monotonic Increasing Stack](#monotonic-increasing-stack)
 - [Monotonic Decreasing Stack](#monotonic-decreasing-stack)
 - [The Template](#the-template)
- [Time and Space Complexity](#time-and-space-complexity)
- [Patterns and Techniques](#patterns-and-techniques)
 - [Pattern 1 - Stack for Matching and Validation](#pattern-1----stack-for-matching-and-validation)
 - [Pattern 2 - Stack for State Tracking](#pattern-2----stack-for-state-tracking)
 - [Pattern 3 - Monotonic Stack](#pattern-3----monotonic-stack)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Practice Problems](#practice-problems)
- [Next Steps](#next-steps)

---

## What You Will Learn in This Blog

- What a stack is and the LIFO principle
- The four core operations: push, pop, peek, and isEmpty
- Two ways to implement a stack from scratch - using a list and using a linked list
- How Python uses a stack internally for function calls and recursion
- What a monotonic stack is and when to reach for it
- Three problem-solving patterns that use stacks
- Solved LeetCode problems with full explanation
- A practice problem table for further study

---

## What is a Stack

A stack is a linear data structure that follows the **Last In, First Out** principle - LIFO. The last element added is the first one to be removed.

The classic real world analogy is a stack of plates. You add a new plate on top. When you take a plate, you take it from the top. You cannot take a plate from the middle without removing the ones above it first.

![Stack LIFO diagram](https://media.geeksforgeeks.org/wp-content/cdn-uploads/20221219100314/stack.drawio2.png)

Other real world examples of LIFO behaviour:

- The back button in a browser - each page you visit is pushed onto a stack. Pressing back pops the most recent page.
- Undo in a text editor - each action is pushed onto a stack. Ctrl+Z pops and reverses the most recent action.
- Function calls in any program - each function call is pushed onto the call stack. When it returns, it is popped.

The key constraint of a stack is that you can only interact with the **top** element. You cannot access elements below the top without first removing everything above them.

---

## Core Stack Operations

A stack has exactly four operations. Everything else is built from these.

| Operation | Description | Time Complexity |
|-----------|-------------|-----------------|
| push(x) | Add element x to the top of the stack | O(1) |
| pop() | Remove and return the top element | O(1) |
| peek() | Return the top element without removing it | O(1) |
| is_empty() | Return True if the stack has no elements | O(1) |

All four operations are O(1). This is what makes a stack efficient - the constraint of only accessing the top means there is never any searching or shifting.

---

## Implementing a Stack

A stack is an abstract data structure - it defines behaviour, not implementation. You can build it on top of different underlying structures. We will implement it two ways.

---

### Implementation 1 - Using a Python List

Python's list is a natural fit for a stack. The end of the list is the top of the stack. `append()` is push and `pop()` is pop - both are O(1) amortised.

```python
class Stack:
 """
 Stack implemented using a Python list.
 The end of the list represents the top of the stack.
 """

 def __init__(self):
 self._data = [] # internal list - underscore signals it is private

 def push(self, x):
 """
 Add element x to the top of the stack.

 Time complexity: O(1) amortised
 Space complexity: O(1)
 """
 self._data.append(x)

 def pop(self):
 """
 Remove and return the top element.
 Raises IndexError if the stack is empty.

 Time complexity: O(1)
 Space complexity: O(1)
 """
 if self.is_empty():
 raise IndexError("Pop from an empty stack")
 return self._data.pop()

 def peek(self):
 """
 Return the top element without removing it.
 Raises IndexError if the stack is empty.

 Time complexity: O(1)
 Space complexity: O(1)
 """
 if self.is_empty():
 raise IndexError("Peek at an empty stack")
 return self._data[-1] # last element = top of stack

 def is_empty(self):
 """
 Return True if the stack is empty.

 Time complexity: O(1)
 Space complexity: O(1)
 """
 return len(self._data) == 0

 def __len__(self):
 return len(self._data)

 def __str__(self):
 return str(self._data) + " <- top"


# --- Test ---
s = Stack()
s.push(10)
s.push(20)
s.push(30)
print(s) # [10, 20, 30] <- top

print(s.peek()) # 30 (top element, not removed)
print(s.pop()) # 30 (removed)
print(s.pop()) # 20 (removed)
print(s) # [10] <- top
print(len(s)) # 1
print(s.is_empty()) # False
s.pop()
print(s.is_empty()) # True
```

---

### Implementation 2 - Using a Linked List

A linked list also works well for a stack. The head of the linked list is the top of the stack. Push and pop at the head are both O(1) with no amortised cost - no resizing ever happens.

```python
class StackNode:
 """A node in the linked list backing the stack."""
 def __init__(self, data):
 self.data = data
 self.next = None


class LinkedStack:
 """
 Stack implemented using a singly linked list.
 The head of the list is the top of the stack.
 Push and pop at the head are O(1) - no resizing, ever.
 """

 def __init__(self):
 self._top = None # head of the linked list
 self._size = 0

 def push(self, x):
 """
 Create a new node and insert it at the head.

 Time complexity: O(1)
 Space complexity: O(1)
 """
 new_node = StackNode(x)
 new_node.next = self._top # new node points to old top
 self._top = new_node # update top
 self._size += 1

 def pop(self):
 """
 Remove and return the head node's data.

 Time complexity: O(1)
 Space complexity: O(1)
 """
 if self.is_empty():
 raise IndexError("Pop from an empty stack")
 value = self._top.data
 self._top = self._top.next # move top down
 self._size -= 1
 return value

 def peek(self):
 """
 Return the head node's data without removing it.

 Time complexity: O(1)
 Space complexity: O(1)
 """
 if self.is_empty():
 raise IndexError("Peek at an empty stack")
 return self._top.data

 def is_empty(self):
 return self._top is None

 def __len__(self):
 return self._size


# --- Test ---
ls = LinkedStack()
ls.push(10)
ls.push(20)
ls.push(30)
print(ls.peek()) # 30
print(ls.pop()) # 30
print(ls.pop()) # 20
print(len(ls)) # 1
```

---

### Which Implementation to Use

| Factor | List-based Stack | Linked List Stack |
|--------|-----------------|-------------------|
| Push | O(1) amortised | O(1) always |
| Pop | O(1) | O(1) |
| Memory | Contiguous, cache friendly | Scattered, extra pointer per node |
| Simplicity | Simpler to write and read | Slightly more code |
| Resizing | Occasional O(n) resize | Never resizes |
| In practice | Almost always preferred | Useful when resizing overhead matters |

In Python, the list-based stack is what you will use in virtually every DSA problem. The linked list version is good to know for understanding how stacks work at a lower level.

> **In practice for LeetCode problems:** You rarely need to define a Stack class at all. You just use a plain Python list and treat `append()` as push and `pop()` as pop. The class is built here so you understand the abstraction fully.

```python
# What you will actually write in most problems
stack = []
stack.append(10) # push
stack.append(20) # push
top = stack[-1] # peek
stack.pop() # pop
```

---

## The Call Stack

The call stack is one of the most important applications of the stack data structure. Every time your Python program runs a function, the stack is involved.

### How Python Uses a Stack for Function Calls

When your program calls a function, Python creates a **stack frame** for that call. This frame holds:
- The function's local variables
- The parameters passed to the function
- The return address - where to go back to when the function finishes

This frame is pushed onto the call stack. When the function returns, its frame is popped off and execution resumes where it left off.

![Call stack diagram](https://miro.medium.com/v2/resize:fit:1400/1*rTpyTQcdMDuu-n4lZmcOVA.png)

```python
def greet(name):
 message = build_message(name) # push build_message frame
 print(message) # build_message frame is popped, back here
 # greet frame is popped when this returns

def build_message(name):
 return "Hello, " + name # this frame is popped when return executes

greet("Alice") # push greet frame onto the call stack
```

The call stack at the moment `build_message` is executing:

```
| build_message frame | <- top (currently executing)
| greet frame |
| main / module frame | <- bottom
```

When `build_message` returns, its frame is popped and `greet` continues. When `greet` returns, its frame is popped and the main program continues.

This is exactly why recursion works - each recursive call pushes a new frame. The frames accumulate until a base case is hit, then they are popped one by one as each call returns.

```python
def factorial(n):
 if n == 0:
 return 1 # base case - start popping
 return n * factorial(n-1) # push a new frame

# factorial(3) call stack at deepest point:
# | factorial(0) | <- top, returns 1
# | factorial(1) | waiting for factorial(0)
# | factorial(2) | waiting for factorial(1)
# | factorial(3) | waiting for factorial(2)
# | main frame | <- bottom
```

---

### Stack Overflow

Every program has a maximum call stack size. If recursion goes too deep - too many frames are pushed without being popped - Python raises a `RecursionError`. This is called a **stack overflow**.

```python
def infinite_recursion(n):
 return infinite_recursion(n + 1) # no base case - keeps pushing frames

# infinite_recursion(0)
# RecursionError: maximum recursion depth exceeded

# Python's default recursion limit
import sys
print(sys.getrecursionlimit()) # typically 1000

# You can increase it, but it is rarely a good idea
# sys.setrecursionlimit(10000)
```

This is why every recursive function must have a base case, and why very deep recursion should often be replaced with an iterative approach using an explicit stack.

---

## Monotonic Stack

### What is a Monotonic Stack

A monotonic stack is a stack where the elements are always kept in a sorted order - either always increasing from bottom to top, or always decreasing from bottom to top.

It is not a separate data structure. It is a technique - a way of using a regular stack while maintaining an ordering invariant. You enforce the ordering by popping elements that violate it before pushing a new one.

This technique efficiently solves a class of problems involving **next greater element**, **next smaller element**, **previous greater**, and **previous smaller** - problems that would otherwise require O(n^2) nested loops.

![Monotonic stack diagram](https://media.geeksforgeeks.org/wp-content/uploads/20230726162636/What-is-Monotonic-Stack.png)

---

### Monotonic Increasing Stack

Elements in the stack are always increasing from bottom to top (smallest at bottom, largest at top). Before pushing a new element, pop all elements that are **greater than or equal to** the new element. This ensures the stack stays increasing.

```python
nums = [3, 1, 4, 1, 5, 9, 2, 6]

stack = []
for num in nums:
 # Pop elements that are greater than current - they violate increasing order
 while stack and stack[-1] >= num:
 stack.pop()
 stack.append(num)

print(stack) # [1, 2, 6] - monotonic increasing from bottom to top
```

---

### Monotonic Decreasing Stack

Elements are always decreasing from bottom to top (largest at bottom, smallest at top). Before pushing, pop all elements that are **less than or equal to** the new element.

```python
nums = [3, 1, 4, 1, 5, 9, 2, 6]

stack = []
for num in nums:
 # Pop elements that are smaller than current - they violate decreasing order
 while stack and stack[-1] <= num:
 stack.pop()
 stack.append(num)

print(stack) # [9, 6] - monotonic decreasing from bottom to top
```

---

### The Template

The general monotonic stack template. The key insight is that **elements are popped at exactly the right moment** - when a new element comes in that breaks the ordering. That moment of popping is when you extract your answer for the popped element.

```python
def monotonic_stack_template(nums):
 stack = [] # stores indices, not values - indices are more useful
 result = [0] * len(nums)

 for i in range(len(nums)):
 # For a "next greater element" problem:
 # Pop while current element is greater than the element at stack top
 while stack and nums[stack[-1]] < nums[i]:
 index = stack.pop()
 # nums[i] is the next greater element for nums[index]
 result[index] = nums[i]

 stack.append(i)

 # Elements remaining in stack have no next greater element
 while stack:
 result[stack.pop()] = -1

 return result
```

---

## Time and Space Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| push | O(1) amortised (list) / O(1) (linked list) | O(1) |
| pop | O(1) | O(1) |
| peek | O(1) | O(1) |
| is_empty | O(1) | O(1) |
| Overall space of a stack with n elements | - | O(n) |
| Monotonic stack (single pass) | O(n) - each element pushed and popped at most once | O(n) |

The monotonic stack is O(n) even though there is a while loop inside a for loop. The reason: each element is pushed exactly once and popped at most once. The total number of push and pop operations across the entire pass is at most 2n, which is O(n).

---

## Patterns and Techniques

---

### Pattern 1 - Stack for Matching and Validation

**The core idea:** Use a stack to match opening brackets, tags, or tokens with their corresponding closing counterparts. Push when you see an opener, pop and verify when you see a closer.

**When to use it:**
- Balanced brackets or parentheses
- Matching HTML or XML tags
- Validating any nested structure

---

#### Solved Problem - Valid Parentheses

[LeetCode 20 - Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)

**Problem:** Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[`, and `]`, determine if the input string is valid. A string is valid if every opening bracket is closed by the same type of bracket in the correct order.

```
Input: s = "()" Output: True
Input: s = "()[]{}" Output: True
Input: s = "(]" Output: False
Input: s = "([)]" Output: False
Input: s = "{[]}" Output: True
```

**Thinking through it:**

![Balanced parentheses diagram](https://www.codewhoop.com/storage/app/media/Stacks/matching-brackets-in-python.jpg)

Walk through the string character by character. When you see an opening bracket, push it. When you see a closing bracket, check if it matches the most recent opening bracket (the top of the stack). If it does, pop the opening bracket and continue. If it does not, the string is invalid. At the end, the stack should be empty - every opener was matched.

```python
def is_valid(s: str) -> bool:
 """
 Push opening brackets onto the stack.
 On each closing bracket, check if it matches the top of the stack.

 Time complexity: O(n) - single pass through the string
 Space complexity: O(n) - stack can hold at most n/2 opening brackets
 """
 stack = []

 # Map each closing bracket to its corresponding opening bracket
 matching = {
 ')': '(',
 '}': '{',
 ']': '['
 }

 for char in s:
 if char in '({[':
 stack.append(char) # opening bracket - push it
 else:
 # Closing bracket - check if stack is non-empty
 # and top of stack matches the expected opener
 if not stack or stack[-1] != matching[char]:
 return False
 stack.pop() # valid match - pop the opener

 return len(stack) == 0 # valid only if all openers were matched

# Test
print(is_valid("()")) # True
print(is_valid("()[]{}")) # True
print(is_valid("(]")) # False
print(is_valid("([)]")) # False
print(is_valid("{[]}")) # True
print(is_valid("")) # True (empty string is valid)
```

Let us trace through `"{[]}"`:

| Char | Action | Stack |
|------|--------|-------|
| `{` | Push | `['{']` |
| `[` | Push | `['{', '[']` |
| `]` | Top is `[`, matches `]` - pop | `['{']` |
| `}` | Top is `{`, matches `}` - pop | `[]` |
| End | Stack is empty | Valid |

---

### Pattern 2 - Stack for State Tracking

**The core idea:** Use a stack to remember state as you process a sequence. When you need to go back to a previous state, pop the stack.

**When to use it:**
- Problems where you process a sequence and occasionally need to revert
- Implementing undo/redo
- Evaluating expressions
- Problems with nested structures

---

#### Solved Problem - Min Stack

[LeetCode 155 - Min Stack](https://leetcode.com/problems/min-stack/)

**Problem:** Design a stack that supports push, pop, top, and retrieving the minimum element - all in O(1) time.

```
MinStack minStack = new MinStack();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
minStack.getMin(); - > -3
minStack.pop();
minStack.top(); - > 0
minStack.getMin(); - > -2
```

**Thinking through it:**

The challenge is `getMin()` in O(1). A naive approach would scan the entire stack to find the minimum - that is O(n). The trick is to maintain a second stack that tracks the minimum at each state. Every time you push a value, also push the current minimum onto the min stack. When you pop, also pop the min stack. The top of the min stack is always the current minimum.

```python
class MinStack:
 """
 Uses two stacks:
 - main_stack: stores all values in push order
 - min_stack: stores the minimum value at each point in time

 At any moment, min_stack[-1] is the minimum of all values
 currently in main_stack.

 Time complexity: O(1) for all operations
 Space complexity: O(n) - two stacks, each holding at most n elements
 """

 def __init__(self):
 self.main_stack = [] # stores all pushed values
 self.min_stack = [] # stores the running minimum

 def push(self, val: int) -> None:
 self.main_stack.append(val)

 # Push the new minimum onto min_stack
 # If min_stack is empty, the new value is the minimum
 # Otherwise, the minimum is the smaller of val and current minimum
 if not self.min_stack:
 self.min_stack.append(val)
 else:
 self.min_stack.append(min(val, self.min_stack[-1]))

 def pop(self) -> None:
 self.main_stack.pop()
 self.min_stack.pop() # keep both stacks in sync

 def top(self) -> int:
 return self.main_stack[-1]

 def getMin(self) -> int:
 return self.min_stack[-1] # always the current minimum - O(1)


# Test
ms = MinStack()
ms.push(-2)
ms.push(0)
ms.push(-3)
print(ms.getMin()) # -3
ms.pop()
print(ms.top()) # 0
print(ms.getMin()) # -2
```

Let us trace through the pushes to make the min stack clear:

| Operation | main_stack | min_stack | Explanation |
|-----------|------------|-----------|-------------|
| push(-2) | [-2] | [-2] | min is -2 |
| push(0) | [-2, 0] | [-2, -2] | min is still -2 |
| push(-3) | [-2, 0, -3] | [-2, -2, -3] | new min is -3 |
| getMin() | - | - | top of min_stack = -3 |
| pop() | [-2, 0] | [-2, -2] | both stacks shrink |
| getMin() | - | - | top of min_stack = -2 |

---

### Pattern 3 - Monotonic Stack

**The core idea:** Maintain a stack in sorted order by popping elements that violate the order before pushing each new element. The moment an element is popped is exactly when you have found the answer for that element.

**When to use it:**
- Next greater element / next smaller element
- Previous greater / previous smaller
- Problems involving temperature, stock prices, or histogram bars
- Any problem where you need to find the nearest element satisfying a condition

---

#### Solved Problem - Daily Temperatures

[LeetCode 739 - Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)

**Problem:** Given an array of integers `temperatures` where `temperatures[i]` is the temperature on day `i`, return an array `answer` where `answer[i]` is the number of days you have to wait after day `i` to get a warmer temperature. If there is no future day with a warmer temperature, `answer[i]` is 0.

```
Input: temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
Output: [1, 1, 4, 2, 1, 1, 0, 0]

Explanation:
Day 0 (73): next warmer is day 1 (74), wait 1 day
Day 1 (74): next warmer is day 2 (75), wait 1 day
Day 2 (75): next warmer is day 6 (76), wait 4 days
Day 3 (71): next warmer is day 5 (72), wait 2 days
...
Day 6 (76): no warmer day, answer is 0
Day 7 (73): no warmer day, answer is 0
```

**Thinking through it:**

The brute force is O(n^2): for each day, scan forward to find the next warmer day. We can do better with a monotonic decreasing stack of indices.

We maintain a stack of day indices whose temperatures are waiting for a warmer day. When we process day `i`, we check the stack. If the temperature today is warmer than the temperature at the index on top of the stack, that index has found its answer. We pop it and record the difference. We keep popping as long as today is warmer than the stack top. Then we push today's index.

```python
def daily_temperatures(temperatures: list) -> list:
 """
 Monotonic decreasing stack of indices.
 When a warmer temperature is found for a day, pop it and record the gap.

 Time complexity: O(n) - each index is pushed and popped at most once
 Space complexity: O(n) - stack holds at most n indices
 """
 n = len(temperatures)
 answer = [0] * n # default answer is 0 (no warmer day found)
 stack = [] # stores indices of days waiting for a warmer day

 for i in range(n):
 # While today is warmer than the day at the top of the stack
 while stack and temperatures[i] > temperatures[stack[-1]]:
 prev_day = stack.pop()
 answer[prev_day] = i - prev_day # number of days waited

 stack.append(i) # push today's index - waiting for a warmer day

 # Remaining indices in stack have no warmer day - answer stays 0

 return answer


# Test
print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]
```

Let us trace through the first few steps with `[73, 74, 75, 71, 69, 72, 76, 73]`:

| i | temp | Action | Stack (indices) | answer so far |
|---|------|--------|-----------------|---------------|
| 0 | 73 | Push 0 | [0] | [0,0,0,0,0,0,0,0] |
| 1 | 74 | 74>73: pop 0, answer[0]=1-0=1. Push 1 | [1] | [1,0,0,0,0,0,0,0] |
| 2 | 75 | 75>74: pop 1, answer[1]=2-1=1. Push 2 | [2] | [1,1,0,0,0,0,0,0] |
| 3 | 71 | 71 not > 75. Push 3 | [2,3] | [1,1,0,0,0,0,0,0] |
| 4 | 69 | 69 not > 71. Push 4 | [2,3,4] | [1,1,0,0,0,0,0,0] |
| 5 | 72 | 72>69: pop 4, answer[4]=5-4=1. 72>71: pop 3, answer[3]=5-3=2. 72 not > 75. Push 5 | [2,5] | [1,1,0,2,1,0,0,0] |
| 6 | 76 | 76>72: pop 5, answer[5]=6-5=1. 76>75: pop 2, answer[2]=6-2=4. Push 6 | [6] | [1,1,4,2,1,1,0,0] |
| 7 | 73 | 73 not > 76. Push 7 | [6,7] | [1,1,4,2,1,1,0,0] |

Final answer: `[1, 1, 4, 2, 1, 1, 0, 0]`

---

## Summary

### What We Covered

| Topic | Key Point |
|-------|-----------|
| Stack and LIFO | Last element pushed is first to be popped |
| List-based stack | Use Python list, append is push, pop is pop, -1 index is peek |
| Linked list stack | O(1) push and pop without amortised cost, slightly more complex |
| Call stack | Python pushes a frame for each function call, pops on return |
| Stack overflow | Too many recursive frames cause RecursionError |
| Monotonic stack | Keep elements sorted by popping violators - O(n) for next greater/smaller problems |

### Operation Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| push | O(1) amortised | O(1) |
| pop | O(1) | O(1) |
| peek | O(1) | O(1) |
| is_empty | O(1) | O(1) |
| Stack of n elements | - | O(n) |
| Monotonic stack pass | O(n) | O(n) |

### Patterns Introduced

| Pattern | Core Idea | Use When |
|---------|-----------|----------|
| Matching and Validation | Push openers, pop and verify on closers | Balanced brackets, nested structure validation |
| State Tracking | Stack remembers past states, pop to revert | Min/max tracking, undo, expression evaluation |
| Monotonic Stack | Maintain sorted order, pop on violation | Next greater/smaller element, temperatures, histogram |

---

## Key Takeaways

- A stack is LIFO. You only ever interact with the top. All four operations are O(1).
- In Python, a plain list is all you need for a stack. `append()` is push, `pop()` is pop, `[-1]` is peek.
- The call stack is a real stack. Every function call is a push, every return is a pop. Recursion depth is literally stack depth.
- The monotonic stack is O(n) even though it has a while loop inside a for loop. Each element is pushed once and popped at most once - total work is 2n.
- When using a monotonic stack, store indices rather than values. Indices let you compute distances and access the original values.
- The Min Stack problem teaches a general principle: when you need O(1) access to some aggregate (min, max, sum) of the current stack contents, maintain a parallel stack that tracks that aggregate.

---

## Practice Problems

| Problem | Link | Difficulty | Pattern |
|---------|------|------------|---------|
| Valid Parentheses | [LC 20](https://leetcode.com/problems/valid-parentheses/) | Easy | Matching and Validation |
| Min Stack | [LC 155](https://leetcode.com/problems/min-stack/) | Medium | State Tracking |
| Daily Temperatures | [LC 739](https://leetcode.com/problems/daily-temperatures/) | Medium | Monotonic Stack |
| Implement Stack using Queues | [LC 225](https://leetcode.com/problems/implement-stack-using-queues/) | Easy | Stack fundamentals |
| Baseball Game | [LC 682](https://leetcode.com/problems/baseball-game/) | Easy | State Tracking |
| Backspace String Compare | [LC 844](https://leetcode.com/problems/backspace-string-compare/) | Easy | State Tracking |
| Next Greater Element I | [LC 496](https://leetcode.com/problems/next-greater-element-i/) | Easy | Monotonic Stack |
| Next Greater Element II | [LC 503](https://leetcode.com/problems/next-greater-element-ii/) | Medium | Monotonic Stack |
| Largest Rectangle in Histogram | [LC 84](https://leetcode.com/problems/largest-rectangle-in-histogram/) | Hard | Monotonic Stack |
| Trapping Rain Water | [LC 42](https://leetcode.com/problems/trapping-rain-water/) | Hard | Monotonic Stack / Two Pointers |

---

## Next Steps

- **Next blog:** [Queues and Deques] - a data structure where elements are added at one end and removed from the other, following First In First Out order
- **Reference:** [Codeverra DSA Sheet](https://docs.google.com/spreadsheets/d/18eX4xoNcSj-lmGJorwgXO7Tb0_eRiDv7rzXnp9iP1MA/edit?gid=1098063012#gid=1098063012)
