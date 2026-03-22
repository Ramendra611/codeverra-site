---
title: "Linked Lists in Python  -  Complete Guide"
description: "Understand linked lists from scratch  -  nodes, pointers, singly and doubly linked lists with Python implementations."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - dsa
---

# Linked Lists

---

## Table of Contents

- [What You Will Learn in This Blog](#what-you-will-learn-in-this-blog)
- [Why Linked Lists Exist](#why-linked-lists-exist)
- [What is a Node](#what-is-a-node)
- [What is a Linked List](#what-is-a-linked-list)
- [Singly Linked List](#singly-linked-list)
  - [Building the Node Class](#building-the-node-class)
  - [Building the LinkedList Class](#building-the-linkedlist-class)
  - [Append -- Insert at Tail](#append----insert-at-tail)
  - [Prepend -- Insert at Head](#prepend----insert-at-head)
  - [Insert at Position](#insert-at-position)
  - [Delete by Value](#delete-by-value)
  - [Delete at Position](#delete-at-position)
  - [Search](#search)
  - [Traverse and Print](#traverse-and-print)
  - [Length of the List](#length-of-the-list)
  - [Reverse a Linked List](#reverse-a-linked-list)
  - [Singly Linked List -- Complete Implementation](#singly-linked-list----complete-implementation)
  - [Time and Space Complexity Summary](#time-and-space-complexity-summary)
- [Doubly Linked List](#doubly-linked-list)
  - [Building the DoublyNode Class](#building-the-doublynode-class)
  - [Building the DoublyLinkedList Class](#building-the-doublylinkedlist-class)
  - [Append and Prepend](#append-and-prepend)
  - [Insert at Position](#insert-at-position-doubly)
  - [Delete by Value](#delete-by-value-doubly)
  - [Traverse Forward and Backward](#traverse-forward-and-backward)
  - [Doubly Linked List -- Complete Implementation](#doubly-linked-list----complete-implementation)
  - [Time and Space Complexity Summary](#doubly-linked-list-complexity)
- [Circular Linked List](#circular-linked-list)
  - [What Makes it Circular](#what-makes-it-circular)
  - [Building the CircularLinkedList Class](#building-the-circularlinkedlist-class)
  - [Append and Prepend](#circular-append-and-prepend)
  - [Delete by Value](#circular-delete-by-value)
  - [Traverse](#circular-traverse)
  - [Circular Linked List -- Complete Implementation](#circular-linked-list----complete-implementation)
  - [Time and Space Complexity Summary](#circular-linked-list-complexity)
- [Arrays vs Linked Lists -- When to Use Which](#arrays-vs-linked-lists----when-to-use-which)
- [Python and Linked Lists](#python-and-linked-lists)
- [Patterns and Techniques](#patterns-and-techniques)
  - [Pattern 1 -- Fast and Slow Pointers](#pattern-1----fast-and-slow-pointers)
  - [Pattern 2 -- In-place Reversal](#pattern-2----in-place-reversal)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Practice Problems](#practice-problems)
- [Next Steps](#next-steps)

---

## What You Will Learn in This Blog

- Why linked lists exist and what problem they solve compared to arrays
- What a node and a pointer are
- How to build a Singly Linked List from scratch with all operations
- How to build a Doubly Linked List from scratch with all operations
- How to build a Circular Linked List from scratch with all operations
- Time and space complexity of every operation
- Two patterns: Fast and Slow Pointers, and In-place Reversal
- Solved LeetCode problems with full explanation
- A practice problem table for further study

---

## Why Linked Lists Exist

In the Arrays blog, we learned that arrays store elements in **contiguous memory** -- one right after the other. This gives us O(1) access by index, which is powerful. But contiguous memory comes with a cost:

- When you insert or delete an element in the middle of an array, every element after that position must shift. That is O(n).
- When a dynamic array runs out of capacity, it must allocate a new larger block and copy everything over.
- You need a contiguous block of memory large enough to hold the entire array. If your memory is fragmented, this can be a problem.

A linked list solves these problems by giving up contiguous memory entirely. Elements can live anywhere in memory. Each element just needs to know where the next one is. This makes insertion and deletion at any position O(1) -- provided you already have a reference to the position -- because no shifting is required.

The trade-off is that you lose O(1) index access. To reach the nth element, you must walk through all n-1 elements before it. That is O(n).

Understanding this trade-off is the entire reason linked lists exist.

---

## What is a Node

A linked list is made up of **nodes**. Each node is a small object that holds two things:

- The **data** -- the actual value being stored
- A **pointer** (also called a reference or link) -- the memory address of the next node in the list

![Linked list node diagram](https://techvidvan.com/tutorials/wp-content/uploads/sites/2/2021/06/TV-Linked-List-normal-images01.jpg)

Think of nodes like train carriages. Each carriage holds passengers (the data) and is connected to the next carriage by a coupling (the pointer). The train can be as long as needed, and carriages do not need to be in any particular location in the train yard -- they just need to be connected.

---

## What is a Linked List

A linked list is a chain of nodes. The list keeps track of:

- The **head** -- a pointer to the first node
- The **tail** -- a pointer to the last node (optional but useful)
- The **size** -- the number of nodes (optional but useful)

The last node's pointer points to `None`, signalling the end of the list.

```
head
 |
[10 | *] --> [20 | *] --> [30 | *] --> [40 | None]
                                         |
                                        tail
```

---

## Singly Linked List

In a singly linked list, each node has one pointer -- pointing to the **next** node only. You can only traverse in one direction: forward.

### Building the Node Class

The node is the fundamental building block. We implement it as a simple class with two attributes.

```python
class Node:
    """
    A single node in a singly linked list.

    Attributes:
        data: the value stored in this node
        next: a reference to the next node, or None if this is the last node
    """
    def __init__(self, data):
        self.data = data   # the value
        self.next = None   # pointer to the next node, starts as None
```

Let us create a few nodes manually to understand how they connect:

```python
# Create three nodes
node1 = Node(10)
node2 = Node(20)
node3 = Node(30)

# Connect them manually
node1.next = node2   # node1 points to node2
node2.next = node3   # node2 points to node3
# node3.next is already None -- end of list

# Traverse manually
current = node1
while current is not None:
    print(current.data)   # 10, then 20, then 30
    current = current.next
```

This is exactly what a linked list does internally -- just wrapped in a cleaner interface.

---

### Building the LinkedList Class

The `LinkedList` class manages the chain of nodes. It keeps track of the head, tail, and size.

```python
class LinkedList:
    """
    A singly linked list.

    Attributes:
        head: reference to the first node, or None if the list is empty
        tail: reference to the last node, or None if the list is empty
        size: number of nodes in the list
    """
    def __init__(self):
        self.head = None   # empty list has no head
        self.tail = None   # empty list has no tail
        self.size = 0
```

---

### Append -- Insert at Tail

Adding a new node at the end of the list.

```python
def append(self, data):
    """
    Insert a new node at the tail of the list.

    Steps:
    1. Create a new node
    2. If list is empty, new node is both head and tail
    3. Otherwise, point current tail's next to new node,
       then update tail to new node

    Time complexity:  O(1) -- we have a direct reference to the tail
    Space complexity: O(1) -- only one new node created
    """
    new_node = Node(data)

    if self.head is None:          # list is empty
        self.head = new_node
        self.tail = new_node
    else:
        self.tail.next = new_node  # link current tail to new node
        self.tail = new_node       # update tail reference

    self.size += 1
```

---

### Prepend -- Insert at Head

Adding a new node at the beginning of the list.

```python
def prepend(self, data):
    """
    Insert a new node at the head of the list.

    Steps:
    1. Create a new node
    2. Point new node's next to current head
    3. Update head to new node
    4. If list was empty, also update tail

    Time complexity:  O(1) -- direct head reference
    Space complexity: O(1)
    """
    new_node = Node(data)

    if self.head is None:          # list is empty
        self.head = new_node
        self.tail = new_node
    else:
        new_node.next = self.head  # new node points to old head
        self.head = new_node       # head now points to new node

    self.size += 1
```

---

### Insert at Position

Inserting a node at a specific index (0-based).

```python
def insert_at(self, data, position):
    """
    Insert a new node at the given position (0-based index).

    Steps:
    1. Validate position
    2. If position is 0, use prepend
    3. If position is last, use append
    4. Otherwise, traverse to the node just before the position,
       then rewire the pointers

    Time complexity:  O(n) -- must traverse to find the position
    Space complexity: O(1)
    """
    if position < 0 or position > self.size:
        raise IndexError("Position out of range")

    if position == 0:
        self.prepend(data)
        return

    if position == self.size:
        self.append(data)
        return

    new_node = Node(data)

    # Traverse to the node just BEFORE the target position
    current = self.head
    for _ in range(position - 1):
        current = current.next

    # Rewire pointers:
    # new_node points to the node that was at position
    # current (node at position-1) points to new_node
    new_node.next = current.next
    current.next = new_node
    self.size += 1
```

Let us visualise what happens when we insert at position 2 in `[10 -> 20 -> 30 -> 40]`:

```
Before:
[10 | *] --> [20 | *] --> [30 | *] --> [40 | None]
              ^
              current (position 1, just before position 2)

After inserting 99 at position 2:
[10 | *] --> [20 | *] --> [99 | *] --> [30 | *] --> [40 | None]
                           new_node
```

---

### Delete by Value

Remove the first node that contains a given value.

```python
def delete_by_value(self, data):
    """
    Remove the first node with the given value.

    Steps:
    1. If list is empty, do nothing
    2. If head contains the value, update head
    3. Otherwise, traverse to find the node just before the target,
       then bypass the target node

    Time complexity:  O(n) -- may need to traverse entire list
    Space complexity: O(1)
    """
    if self.head is None:
        return   # empty list, nothing to delete

    # Special case: head is the node to delete
    if self.head.data == data:
        self.head = self.head.next
        if self.head is None:      # list is now empty
            self.tail = None
        self.size -= 1
        return

    # Traverse to find the node just BEFORE the target
    current = self.head
    while current.next is not None:
        if current.next.data == data:
            # Found it -- bypass the target node
            if current.next == self.tail:   # target is the tail
                self.tail = current
            current.next = current.next.next
            self.size -= 1
            return
        current = current.next

    # Value not found -- do nothing
```

Visualising deletion of value 20 from `[10 -> 20 -> 30 -> 40]`:

```
Before:
[10 | *] --> [20 | *] --> [30 | *] --> [40 | None]
  ^            ^
current     current.next (this is the one to delete)

After:
[10 | *] --> [30 | *] --> [40 | None]
  ^
current.next now skips over 20
```

---

### Delete at Position

Remove the node at a specific index.

```python
def delete_at(self, position):
    """
    Remove the node at the given position (0-based index).

    Time complexity:  O(n) -- traverse to position
    Space complexity: O(1)
    """
    if position < 0 or position >= self.size:
        raise IndexError("Position out of range")

    if position == 0:
        # Delete head
        self.head = self.head.next
        if self.head is None:
            self.tail = None
        self.size -= 1
        return

    # Traverse to the node just before the target position
    current = self.head
    for _ in range(position - 1):
        current = current.next

    # Bypass the node at position
    if current.next == self.tail:   # deleting the tail
        self.tail = current
    current.next = current.next.next
    self.size -= 1
```

---

### Search

Find whether a value exists and return its position.

```python
def search(self, data):
    """
    Search for a value in the list.
    Returns the 0-based index of the first occurrence, or -1 if not found.

    Time complexity:  O(n) -- may scan the entire list
    Space complexity: O(1)
    """
    current = self.head
    index = 0

    while current is not None:
        if current.data == data:
            return index       # found at this index
        current = current.next
        index += 1

    return -1   # not found
```

---

### Traverse and Print

Walk through every node and print the values.

```python
def print_list(self):
    """
    Print all values in the list, separated by arrows.

    Time complexity:  O(n) -- visits every node
    Space complexity: O(1)
    """
    elements = []
    current = self.head

    while current is not None:
        elements.append(str(current.data))
        current = current.next

    print(" -> ".join(elements) + " -> None")
```

---

### Length of the List

```python
def __len__(self):
    """
    Return the number of nodes.
    We track size as we insert/delete so this is O(1).

    Time complexity:  O(1)
    Space complexity: O(1)
    """
    return self.size
```

---

### Reverse a Linked List

Reversing a linked list in place is one of the most important linked list operations and a common interview topic. The key is to reverse the direction of every pointer.

![Linked list reversal diagram](https://media.geeksforgeeks.org/wp-content/cdn-uploads/RGIF2.gif)

```python
def reverse(self):
    """
    Reverse the linked list in place by reversing all next pointers.

    We use three pointers:
    - prev: the node that current.next should point to after reversal
    - current: the node we are currently processing
    - next_node: saved reference to current.next before we overwrite it

    Walk through the list, reversing each pointer as we go.
    At the end, swap head and tail.

    Time complexity:  O(n) -- visits every node exactly once
    Space complexity: O(1) -- only three pointer variables
    """
    prev = None
    current = self.head
    self.tail = self.head   # current head will become the new tail

    while current is not None:
        next_node = current.next   # save next before we overwrite
        current.next = prev        # reverse the pointer
        prev = current             # move prev forward
        current = next_node        # move current forward

    self.head = prev   # prev is now the last node we processed -- the new head
```

Let us trace through reversing `[10 -> 20 -> 30 -> None]` step by step:

| Step | prev | current | current.next (after reversal) |
|------|------|---------|-------------------------------|
| Start | None | 10 | -- |
| Step 1 | None | 10 | None (was 20) |
| Step 2 | 10 | 20 | 10 (was 30) |
| Step 3 | 20 | 30 | 20 (was None) |
| End | 30 | None | -- |

Result: `[30 -> 20 -> 10 -> None]`, head = 30, tail = 10.

---

### Singly Linked List -- Complete Implementation

Here is the complete implementation in one place for easy reference.

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0

    def append(self, data):
        """Insert at tail -- O(1)"""
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
        else:
            self.tail.next = new_node
            self.tail = new_node
        self.size += 1

    def prepend(self, data):
        """Insert at head -- O(1)"""
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.next = self.head
            self.head = new_node
        self.size += 1

    def insert_at(self, data, position):
        """Insert at position -- O(n)"""
        if position < 0 or position > self.size:
            raise IndexError("Position out of range")
        if position == 0:
            self.prepend(data)
            return
        if position == self.size:
            self.append(data)
            return
        new_node = Node(data)
        current = self.head
        for _ in range(position - 1):
            current = current.next
        new_node.next = current.next
        current.next = new_node
        self.size += 1

    def delete_by_value(self, data):
        """Delete first node with value -- O(n)"""
        if self.head is None:
            return
        if self.head.data == data:
            self.head = self.head.next
            if self.head is None:
                self.tail = None
            self.size -= 1
            return
        current = self.head
        while current.next is not None:
            if current.next.data == data:
                if current.next == self.tail:
                    self.tail = current
                current.next = current.next.next
                self.size -= 1
                return
            current = current.next

    def delete_at(self, position):
        """Delete node at position -- O(n)"""
        if position < 0 or position >= self.size:
            raise IndexError("Position out of range")
        if position == 0:
            self.head = self.head.next
            if self.head is None:
                self.tail = None
            self.size -= 1
            return
        current = self.head
        for _ in range(position - 1):
            current = current.next
        if current.next == self.tail:
            self.tail = current
        current.next = current.next.next
        self.size -= 1

    def search(self, data):
        """Search for value, return index or -1 -- O(n)"""
        current = self.head
        index = 0
        while current is not None:
            if current.data == data:
                return index
            current = current.next
            index += 1
        return -1

    def reverse(self):
        """Reverse the list in place -- O(n)"""
        prev = None
        current = self.head
        self.tail = self.head
        while current is not None:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        self.head = prev

    def print_list(self):
        """Print all values -- O(n)"""
        elements = []
        current = self.head
        while current is not None:
            elements.append(str(current.data))
            current = current.next
        print(" -> ".join(elements) + " -> None")

    def __len__(self):
        return self.size


# --- Test the complete implementation ---
ll = LinkedList()
ll.append(10)
ll.append(20)
ll.append(30)
ll.append(40)
ll.print_list()         # 10 -> 20 -> 30 -> 40 -> None

ll.prepend(5)
ll.print_list()         # 5 -> 10 -> 20 -> 30 -> 40 -> None

ll.insert_at(99, 2)
ll.print_list()         # 5 -> 10 -> 99 -> 20 -> 30 -> 40 -> None

ll.delete_by_value(99)
ll.print_list()         # 5 -> 10 -> 20 -> 30 -> 40 -> None

ll.delete_at(0)
ll.print_list()         # 10 -> 20 -> 30 -> 40 -> None

print(ll.search(30))    # 2
print(ll.search(99))    # -1
print(len(ll))          # 4

ll.reverse()
ll.print_list()         # 40 -> 30 -> 20 -> 10 -> None
```

---

### Time and Space Complexity Summary

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| Append (insert at tail) | O(1) | O(1) | Direct tail reference |
| Prepend (insert at head) | O(1) | O(1) | Direct head reference |
| Insert at position | O(n) | O(1) | Must traverse to position |
| Delete by value | O(n) | O(1) | Must traverse to find value |
| Delete at position | O(n) | O(1) | Must traverse to position |
| Search | O(n) | O(1) | Must scan entire list |
| Access by index | O(n) | O(1) | No direct index access |
| Reverse | O(n) | O(1) | Visits every node once |
| Traverse / Print | O(n) | O(1) | |
| Length | O(1) | O(1) | Tracked as a counter |

---

## Doubly Linked List

In a doubly linked list, each node has **two pointers** -- one to the next node and one to the previous node. This allows traversal in both directions.

![Doubly linked list diagram](https://media.geeksforgeeks.org/wp-content/cdn-uploads/gq/2014/03/DLL1.png)

```
None <-- [10 | prev | next] <--> [20 | prev | next] <--> [30 | prev | next] --> None
          head                                              tail
```

The main advantages over a singly linked list:
- You can traverse backward
- Deleting a node is O(1) if you have a direct reference to it (no need to find the previous node)
- Easier to implement some operations like delete at tail

The cost is slightly more memory per node (one extra pointer) and slightly more complex pointer management.

---

### Building the DoublyNode Class

```python
class DoublyNode:
    """
    A single node in a doubly linked list.

    Attributes:
        data: the value stored
        next: reference to the next node
        prev: reference to the previous node
    """
    def __init__(self, data):
        self.data = data
        self.next = None   # pointer to next node
        self.prev = None   # pointer to previous node
```

---

### Building the DoublyLinkedList Class

```python
class DoublyLinkedList:
    """
    A doubly linked list where each node has both next and prev pointers.
    """
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0
```

---

### Append and Prepend

```python
def append(self, data):
    """
    Insert at tail.

    Time complexity:  O(1)
    Space complexity: O(1)
    """
    new_node = DoublyNode(data)

    if self.head is None:
        self.head = new_node
        self.tail = new_node
    else:
        new_node.prev = self.tail    # new node's prev points to old tail
        self.tail.next = new_node    # old tail's next points to new node
        self.tail = new_node         # update tail

    self.size += 1

def prepend(self, data):
    """
    Insert at head.

    Time complexity:  O(1)
    Space complexity: O(1)
    """
    new_node = DoublyNode(data)

    if self.head is None:
        self.head = new_node
        self.tail = new_node
    else:
        new_node.next = self.head    # new node's next points to old head
        self.head.prev = new_node    # old head's prev points to new node
        self.head = new_node         # update head

    self.size += 1
```

---

### Insert at Position (Doubly)

```python
def insert_at(self, data, position):
    """
    Insert at given position (0-based).

    Time complexity:  O(n)
    Space complexity: O(1)
    """
    if position < 0 or position > self.size:
        raise IndexError("Position out of range")

    if position == 0:
        self.prepend(data)
        return

    if position == self.size:
        self.append(data)
        return

    new_node = DoublyNode(data)

    # Traverse to the node currently at the target position
    current = self.head
    for _ in range(position):
        current = current.next

    # Insert new_node before current
    prev_node = current.prev
    new_node.next = current       # new node points forward to current
    new_node.prev = prev_node     # new node points back to prev
    prev_node.next = new_node     # prev points forward to new node
    current.prev = new_node       # current points back to new node

    self.size += 1
```

---

### Delete by Value (Doubly)

The doubly linked list makes deletion cleaner -- when we find the node, we can directly access its previous node through `node.prev`.

```python
def delete_by_value(self, data):
    """
    Delete first node with given value.

    Because we have prev pointers, we do not need a separate
    'previous node' variable during traversal.

    Time complexity:  O(n) -- traverse to find the value
    Space complexity: O(1)
    """
    current = self.head

    while current is not None:
        if current.data == data:
            # Rewire prev and next nodes to skip current
            if current.prev is not None:
                current.prev.next = current.next  # skip current going forward
            else:
                self.head = current.next           # deleting the head

            if current.next is not None:
                current.next.prev = current.prev  # skip current going backward
            else:
                self.tail = current.prev           # deleting the tail

            self.size -= 1
            return

        current = current.next
```

---

### Traverse Forward and Backward

```python
def print_forward(self):
    """Traverse from head to tail -- O(n)"""
    elements = []
    current = self.head
    while current is not None:
        elements.append(str(current.data))
        current = current.next
    print("Forward:  None <-> " + " <-> ".join(elements) + " <-> None")

def print_backward(self):
    """Traverse from tail to head -- O(n)"""
    elements = []
    current = self.tail
    while current is not None:
        elements.append(str(current.data))
        current = current.prev
    print("Backward: None <-> " + " <-> ".join(elements) + " <-> None")
```

---

### Doubly Linked List -- Complete Implementation

```python
class DoublyNode:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None


class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0

    def append(self, data):
        """Insert at tail -- O(1)"""
        new_node = DoublyNode(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.prev = self.tail
            self.tail.next = new_node
            self.tail = new_node
        self.size += 1

    def prepend(self, data):
        """Insert at head -- O(1)"""
        new_node = DoublyNode(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
        self.size += 1

    def insert_at(self, data, position):
        """Insert at position -- O(n)"""
        if position < 0 or position > self.size:
            raise IndexError("Position out of range")
        if position == 0:
            self.prepend(data)
            return
        if position == self.size:
            self.append(data)
            return
        new_node = DoublyNode(data)
        current = self.head
        for _ in range(position):
            current = current.next
        prev_node = current.prev
        new_node.next = current
        new_node.prev = prev_node
        prev_node.next = new_node
        current.prev = new_node
        self.size += 1

    def delete_by_value(self, data):
        """Delete first node with value -- O(n)"""
        current = self.head
        while current is not None:
            if current.data == data:
                if current.prev is not None:
                    current.prev.next = current.next
                else:
                    self.head = current.next
                if current.next is not None:
                    current.next.prev = current.prev
                else:
                    self.tail = current.prev
                self.size -= 1
                return
            current = current.next

    def print_forward(self):
        """Print head to tail -- O(n)"""
        elements = []
        current = self.head
        while current is not None:
            elements.append(str(current.data))
            current = current.next
        print("Forward:  " + " <-> ".join(elements))

    def print_backward(self):
        """Print tail to head -- O(n)"""
        elements = []
        current = self.tail
        while current is not None:
            elements.append(str(current.data))
            current = current.prev
        print("Backward: " + " <-> ".join(elements))

    def __len__(self):
        return self.size


# --- Test ---
dll = DoublyLinkedList()
dll.append(10)
dll.append(20)
dll.append(30)
dll.prepend(5)
dll.print_forward()    # Forward:  5 <-> 10 <-> 20 <-> 30
dll.print_backward()   # Backward: 30 <-> 20 <-> 10 <-> 5

dll.insert_at(99, 2)
dll.print_forward()    # Forward:  5 <-> 10 <-> 99 <-> 20 <-> 30

dll.delete_by_value(99)
dll.print_forward()    # Forward:  5 <-> 10 <-> 20 <-> 30
```

---

### Doubly Linked List Complexity

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| Append | O(1) | O(1) | Direct tail reference |
| Prepend | O(1) | O(1) | Direct head reference |
| Insert at position | O(n) | O(1) | Traverse to position |
| Delete by value | O(n) | O(1) | Traverse to find value |
| Delete with direct reference | O(1) | O(1) | No traversal needed -- key advantage |
| Traverse forward | O(n) | O(1) | |
| Traverse backward | O(n) | O(1) | Not possible with singly |
| Search | O(n) | O(1) | |

---

## Circular Linked List

In a circular linked list, the last node does not point to `None`. Instead, it points back to the first node, forming a circle.

![Circular linked list diagram](https://media.geeksforgeeks.org/wp-content/uploads/20220830114920/CircularLinkedList.png)

```
head
 |
[10 | *] --> [20 | *] --> [30 | *] --> [40 | *]
  ^                                        |
  |________________________________________|
```

**Where is this useful?**

- Round-robin scheduling (CPU processes, game turns)
- Music or video playlists that loop
- Any problem where you need to cycle through a collection repeatedly without checking for the end

The key challenge with circular lists is avoiding infinite loops during traversal. You must track when you have come back to the head.

---

### What Makes it Circular

The only structural difference from a singly linked list: the tail's `next` pointer points to `head` instead of `None`.

```python
# In a regular singly list:
tail.next = None

# In a circular list:
tail.next = head   # connects back to the beginning
```

---

### Building the CircularLinkedList Class

We reuse the same `Node` class. The circular list class tracks head and tail.

```python
class CircularLinkedList:
    """
    A circular singly linked list.
    The tail's next pointer points back to the head.
    """
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0
```

---

### Circular Append and Prepend

```python
def append(self, data):
    """
    Insert at tail and maintain the circular connection.

    Time complexity:  O(1)
    Space complexity: O(1)
    """
    new_node = Node(data)

    if self.head is None:          # first node -- points to itself
        self.head = new_node
        self.tail = new_node
        new_node.next = self.head  # circular: points to itself
    else:
        new_node.next = self.head  # new node points back to head (circular)
        self.tail.next = new_node  # old tail points to new node
        self.tail = new_node       # update tail

    self.size += 1

def prepend(self, data):
    """
    Insert at head and maintain the circular connection.

    Time complexity:  O(1)
    Space complexity: O(1)
    """
    new_node = Node(data)

    if self.head is None:
        self.head = new_node
        self.tail = new_node
        new_node.next = self.head
    else:
        new_node.next = self.head  # new node points to old head
        self.head = new_node       # update head
        self.tail.next = self.head # tail must now point to new head (circular)

    self.size += 1
```

---

### Circular Delete by Value

```python
def delete_by_value(self, data):
    """
    Delete first node with the given value.

    Must handle the circular connection carefully:
    - Deleting the head requires updating tail.next
    - Deleting the tail requires updating tail reference and its prev's next

    Time complexity:  O(n)
    Space complexity: O(1)
    """
    if self.head is None:
        return

    # Only one node in the list
    if self.head == self.tail and self.head.data == data:
        self.head = None
        self.tail = None
        self.size -= 1
        return

    # Deleting the head
    if self.head.data == data:
        self.head = self.head.next
        self.tail.next = self.head   # maintain circular connection
        self.size -= 1
        return

    # Traverse to find the node just before the target
    current = self.head
    while current.next != self.head:   # stop before we loop back
        if current.next.data == data:
            if current.next == self.tail:  # deleting the tail
                self.tail = current
                self.tail.next = self.head
            else:
                current.next = current.next.next
            self.size -= 1
            return
        current = current.next
```

---

### Circular Traverse

Traversal must stop when we reach the head again -- otherwise we loop forever.

```python
def print_list(self):
    """
    Traverse and print all values.
    Must stop when we return to head to avoid infinite loop.

    Time complexity:  O(n)
    Space complexity: O(1)
    """
    if self.head is None:
        print("Empty list")
        return

    elements = []
    current = self.head

    while True:
        elements.append(str(current.data))
        current = current.next
        if current == self.head:   # we have looped back to start -- stop
            break

    print(" -> ".join(elements) + " -> (back to head)")
```

---

### Circular Linked List -- Complete Implementation

```python
class CircularLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0

    def append(self, data):
        """Insert at tail -- O(1)"""
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
            new_node.next = self.head
        else:
            new_node.next = self.head
            self.tail.next = new_node
            self.tail = new_node
        self.size += 1

    def prepend(self, data):
        """Insert at head -- O(1)"""
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
            new_node.next = self.head
        else:
            new_node.next = self.head
            self.head = new_node
            self.tail.next = self.head
        self.size += 1

    def delete_by_value(self, data):
        """Delete first node with value -- O(n)"""
        if self.head is None:
            return
        if self.head == self.tail and self.head.data == data:
            self.head = None
            self.tail = None
            self.size -= 1
            return
        if self.head.data == data:
            self.head = self.head.next
            self.tail.next = self.head
            self.size -= 1
            return
        current = self.head
        while current.next != self.head:
            if current.next.data == data:
                if current.next == self.tail:
                    self.tail = current
                    self.tail.next = self.head
                else:
                    current.next = current.next.next
                self.size -= 1
                return
            current = current.next

    def print_list(self):
        """Print all values -- O(n)"""
        if self.head is None:
            print("Empty list")
            return
        elements = []
        current = self.head
        while True:
            elements.append(str(current.data))
            current = current.next
            if current == self.head:
                break
        print(" -> ".join(elements) + " -> (back to head)")

    def __len__(self):
        return self.size


# --- Test ---
cll = CircularLinkedList()
cll.append(10)
cll.append(20)
cll.append(30)
cll.prepend(5)
cll.print_list()           # 5 -> 10 -> 20 -> 30 -> (back to head)

cll.delete_by_value(20)
cll.print_list()           # 5 -> 10 -> 30 -> (back to head)

print(len(cll))            # 3
```

---

### Circular Linked List Complexity

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| Append | O(1) | O(1) | Direct tail reference |
| Prepend | O(1) | O(1) | Direct head reference, tail.next update |
| Delete by value | O(n) | O(1) | Traverse to find value |
| Traverse | O(n) | O(1) | Stop condition is returning to head |
| Search | O(n) | O(1) | |

---

## Arrays vs Linked Lists -- When to Use Which

| Factor | Array | Linked List |
|--------|-------|-------------|
| Access by index | O(1) | O(n) |
| Search | O(n) | O(n) |
| Insert at head | O(n) -- shift required | O(1) |
| Insert at tail | O(1) amortised | O(1) with tail pointer |
| Insert in middle | O(n) -- shift required | O(n) -- traverse + O(1) rewire |
| Delete at head | O(n) -- shift required | O(1) |
| Delete in middle | O(n) -- shift required | O(n) traverse + O(1) rewire |
| Memory layout | Contiguous | Scattered |
| Memory overhead | Low (values only) | Higher (values + pointers) |
| Cache performance | Better (contiguous) | Worse (scattered) |
| Dynamic size | Yes (amortised) | Yes (naturally) |

**Use an array when:**
- You need frequent access by index
- You know the size in advance or it does not change much
- Memory locality and cache performance matter

**Use a linked list when:**
- You need frequent insertions or deletions at the head
- You are implementing a stack, queue, or deque
- You do not need random access by index

---

## Python and Linked Lists

Python does not have a built-in linked list. However, `collections.deque` is implemented as a doubly linked list internally. This is why `deque` gives O(1) append and pop from both ends, while a list gives O(n) for operations at the front.

```python
from collections import deque

dq = deque([1, 2, 3])
dq.appendleft(0)   # O(1) -- uses the doubly linked list structure
dq.popleft()       # O(1) -- same reason
```

In DSA problems you will usually build your own linked list from scratch using the `Node` class, because problems test your ability to manipulate pointers directly.

---

## Patterns and Techniques

---

### Pattern 1 -- Fast and Slow Pointers

**The core idea:** Use two pointers that move through the list at different speeds -- one moves one step at a time (slow), the other moves two steps at a time (fast). This technique detects cycles, finds midpoints, and solves several other problems without extra space.

Also called **Floyd's Tortoise and Hare algorithm**.

![Fast and slow pointer diagram](https://media.geeksforgeeks.org/wp-content/uploads/20220630114143/UntitledDiagram12.jpg)

**The template:**

```python
slow = head
fast = head

while fast is not None and fast.next is not None:
    slow = slow.next        # moves one step
    fast = fast.next.next   # moves two steps
```

When `fast` reaches the end, `slow` is at the middle.
If `fast` ever meets `slow` again (after moving past the start), there is a cycle.

---

#### Solved Problem -- Middle of the Linked List

[LeetCode 876 -- Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/)

**Problem:** Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second one.

```
Input:  [1, 2, 3, 4, 5]
Output: Node with value 3

Input:  [1, 2, 3, 4, 5, 6]
Output: Node with value 4  (second middle)
```

**Thinking through it:**

The brute force would be to count the nodes, then traverse to n//2. That is O(n) time with O(1) space but requires two passes. Fast and slow pointers solve it in one pass: when fast reaches the end, slow is at the middle.

```python
def middle_node(head):
    """
    Fast pointer moves twice as fast as slow.
    When fast reaches the end, slow is at the middle.

    For even length: fast ends at None (past last node)
                     slow ends at second middle node

    Time complexity:  O(n) -- single pass
    Space complexity: O(1) -- two pointer variables only
    """
    slow = head
    fast = head

    while fast is not None and fast.next is not None:
        slow = slow.next         # one step
        fast = fast.next.next    # two steps

    return slow   # slow is now at the middle

# Trace for [1, 2, 3, 4, 5]:
# Start:  slow=1, fast=1
# Step 1: slow=2, fast=3
# Step 2: slow=3, fast=5
# Step 3: fast.next is None -- stop. slow=3 (middle)
```

---

#### Solved Problem -- Linked List Cycle

[LeetCode 141 -- Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)

**Problem:** Given the head of a linked list, determine if the list has a cycle. A cycle exists if some node can be reached again by following `next` pointers.

```
Input:  [3, 2, 0, -4] with tail connecting back to node at index 1
Output: True

Input:  [1, 2] with no cycle
Output: False
```

**Thinking through it:**

If there is no cycle, the fast pointer will reach `None`. If there is a cycle, the fast pointer will eventually lap the slow pointer and they will meet. Think of two runners on a circular track -- the faster one always catches the slower one.

```python
def has_cycle(head):
    """
    Fast and slow pointers.
    If they ever meet, there is a cycle.
    If fast reaches None, there is no cycle.

    Time complexity:  O(n) -- in a cycle, fast catches slow in at most n steps
    Space complexity: O(1) -- two pointer variables only
    """
    slow = head
    fast = head

    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next

        if slow == fast:    # they met -- cycle detected
            return True

    return False   # fast reached end -- no cycle
```

---

### Pattern 2 -- In-place Reversal

**The core idea:** Reverse part or all of a linked list by rewiring pointers as you traverse, without allocating a new list. This is the same reversal technique shown in the implementation section, but now applied to specific subranges.

**When to use it:**
- Reverse the entire list
- Reverse a sublist between two positions
- Reverse in groups of k

![In-place reversal diagram](https://miro.medium.com/v2/resize:fit:1400/1*rBBZnQaKEhlRXAnzEhMvLA.png)

---

#### Solved Problem -- Reverse Linked List

[LeetCode 206 -- Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)

**Problem:** Given the head of a singly linked list, reverse the list and return the new head.

```
Input:  [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]
```

**Two approaches -- iterative and recursive:**

```python
def reverse_list_iterative(head):
    """
    Three-pointer approach. At each step, reverse one pointer.

    Time complexity:  O(n)
    Space complexity: O(1)
    """
    prev = None
    current = head

    while current is not None:
        next_node = current.next   # save next
        current.next = prev        # reverse the pointer
        prev = current             # move prev forward
        current = next_node        # move current forward

    return prev   # prev is the new head


def reverse_list_recursive(head):
    """
    Recursive approach: reverse the rest of the list,
    then fix the current node's pointer.

    Base case: empty list or single node -- already reversed.
    Recursive case: reverse everything after head,
                    then make head.next point back to head.

    Time complexity:  O(n)
    Space complexity: O(n) -- call stack depth
    """
    # Base case
    if head is None or head.next is None:
        return head

    # Reverse the rest of the list
    new_head = reverse_list_recursive(head.next)

    # Make the next node point back to current head
    head.next.next = head
    head.next = None   # current head is now the tail

    return new_head
```

---

#### Solved Problem -- Merge Two Sorted Lists

[LeetCode 21 -- Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)

**Problem:** You are given the heads of two sorted linked lists. Merge them into one sorted linked list and return its head.

```
Input:  list1 = [1, 2, 4],  list2 = [1, 3, 4]
Output: [1, 1, 2, 3, 4, 4]
```

**Thinking through it:**

Use a dummy head node to simplify edge cases. Compare the current nodes of both lists, attach the smaller one to the result, and advance that pointer. When one list is exhausted, attach the remainder of the other.

```python
def merge_two_lists(list1, list2):
    """
    Use a dummy head to avoid special-casing the first node.
    At each step, attach the smaller of the two current nodes.

    Time complexity:  O(n + m) -- n and m are lengths of the two lists
    Space complexity: O(1) -- rewiring existing nodes, no new nodes created
    """
    # Dummy node -- its next will be the head of the merged list
    dummy = Node(0)
    current = dummy

    while list1 is not None and list2 is not None:
        if list1.data <= list2.data:
            current.next = list1    # attach list1's node
            list1 = list1.next      # advance list1
        else:
            current.next = list2    # attach list2's node
            list2 = list2.next      # advance list2
        current = current.next      # advance result pointer

    # Attach the remaining nodes from whichever list is not exhausted
    if list1 is not None:
        current.next = list1
    else:
        current.next = list2

    return dummy.next   # skip the dummy node, return actual head
```

---

## Summary

### What We Covered

| Topic | Key Point |
|-------|-----------|
| Why linked lists exist | Solve the O(n) insert/delete cost of arrays by giving up contiguous memory |
| Nodes and pointers | A node holds data and a reference to the next node |
| Singly linked list | One direction traversal, O(1) insert/delete at head and tail |
| Doubly linked list | Two direction traversal, O(1) delete with direct reference |
| Circular linked list | Tail points back to head, used for cyclic problems and round-robin |
| Arrays vs linked lists | Arrays for index access, linked lists for frequent head insertions |
| Python deque | Internally a doubly linked list, O(1) both ends |

### Operation Complexity at a Glance

| Operation | Singly | Doubly | Circular |
|-----------|--------|--------|----------|
| Insert at head | O(1) | O(1) | O(1) |
| Insert at tail | O(1) | O(1) | O(1) |
| Insert at position | O(n) | O(n) | O(n) |
| Delete at head | O(1) | O(1) | O(1) |
| Delete by value | O(n) | O(n) | O(n) |
| Delete with direct reference | O(n) | O(1) | O(n) |
| Search | O(n) | O(n) | O(n) |
| Access by index | O(n) | O(n) | O(n) |
| Reverse | O(n) | O(n) | O(n) |

### Patterns Introduced

| Pattern | Core Idea | Use When |
|---------|-----------|----------|
| Fast and Slow Pointers | Two pointers at different speeds | Cycle detection, finding midpoint, nth from end |
| In-place Reversal | Rewire pointers as you traverse | Reverse full list or sublist without extra space |

---

## Key Takeaways

- Linked lists trade O(1) index access (which arrays have) for O(1) insert and delete at the head (which arrays do not have). Neither is strictly better -- the right choice depends on what operations you need most.
- Every pointer reassignment in a linked list must be done carefully and in the right order. Losing a reference means losing access to the rest of the list permanently.
- The dummy head node technique simplifies many linked list problems by removing special cases for operating on the head.
- Fast and slow pointers solve cycle detection and midpoint finding in a single O(n) pass with O(1) space.
- Recursive reversal is elegant but uses O(n) stack space. Iterative reversal is O(1) space and is preferred in practice.
- Always check for `None` before accessing `.next`. A null pointer error is the most common linked list bug.

---

## Practice Problems

| Problem | Link | Difficulty | Pattern |
|---------|------|------------|---------|
| Reverse Linked List | [LC 206](https://leetcode.com/problems/reverse-linked-list/) | Easy | In-place Reversal |
| Merge Two Sorted Lists | [LC 21](https://leetcode.com/problems/merge-two-sorted-lists/) | Easy | Pointer manipulation |
| Linked List Cycle | [LC 141](https://leetcode.com/problems/linked-list-cycle/) | Easy | Fast and Slow Pointers |
| Middle of the Linked List | [LC 876](https://leetcode.com/problems/middle-of-the-linked-list/) | Easy | Fast and Slow Pointers |
| Remove Duplicates from Sorted List | [LC 83](https://leetcode.com/problems/remove-duplicates-from-sorted-list/) | Easy | Pointer manipulation |
| Remove Nth Node From End | [LC 19](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | Medium | Fast and Slow Pointers |
| Linked List Cycle II | [LC 142](https://leetcode.com/problems/linked-list-cycle-ii/) | Medium | Fast and Slow Pointers |
| Reverse Linked List II | [LC 92](https://leetcode.com/problems/reverse-linked-list-ii/) | Medium | In-place Reversal |
| Reorder List | [LC 143](https://leetcode.com/problems/reorder-list/) | Medium | Fast/Slow + Reversal |
| Copy List with Random Pointer | [LC 138](https://leetcode.com/problems/copy-list-with-random-pointer/) | Medium | Hash Map |
| Merge K Sorted Lists | [LC 23](https://leetcode.com/problems/merge-k-sorted-lists/) | Hard | Heap / Divide and Conquer |
| Reverse Nodes in K-Group | [LC 25](https://leetcode.com/problems/reverse-nodes-in-k-group/) | Hard | In-place Reversal |

---

## Next Steps

- **Next blog:** [Stacks] -- a data structure built on top of linked lists or arrays, with a strict Last In First Out access pattern
- **Reference:** [Codeverra DSA Sheet](https://docs.google.com/spreadsheets/d/18eX4xoNcSj-lmGJorwgXO7Tb0_eRiDv7rzXnp9iP1MA/edit?gid=1098063012#gid=1098063012)
