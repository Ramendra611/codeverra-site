---
title: "Master Loops in Python"
description: "Complete practice session on Loops in python"

date: 2026-03-18
lastmod: 2026-03-18
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
 - python


cover:
 image: "images/loops-practice.png"
 alt: "Python programming"
 caption: "Python syllabus"
 relative: true
 hidden: false
---



# Python Loops - Practice Questions and Solutions
### 20 Questions from Easy to Hard

---

> All 20 questions are based on the Loops Masterclass.
> Try each question on your own before reading the solution.
> The questions are ordered by difficulty: Easy (1-7), Medium (8-14), Hard (15-20).

---

## Table of Contents

- [Easy Questions (1-7)](#easy-questions-1-7)
- [Medium Questions (8-14)](#medium-questions-8-14)
- [Hard Questions (15-20)](#hard-questions-15-20)

---

## Easy Questions (1-7)

---

### Q1 - Basic for Loop with range()

Print all numbers from 1 to 30 that are divisible by both 3 and 5.

**Expected Output:**
```
15
30
```

**Solution:**

```python
for i in range(1, 31):
 if i % 3 == 0 and i % 5 == 0:
 print(i)
```

**What this tests:** range(), for loop, compound condition with `and`.

---

### Q2 - String Loop

Write a loop that counts the number of uppercase letters in the string below.

```python
text = "Welcome To India, The Land Of DiversiTy"
```

**Expected Output:**
```
Uppercase letters: 6
```

**Solution:**

```python
text = "Welcome To India, The Land Of DiversiTy"

count = 0
for char in text:
 if char.isupper():
 count += 1

print(f"Uppercase letters: {count}")
```

**What this tests:** Iterating over a string character by character, `.isupper()` method, accumulator pattern.

---

### Q3 - List Loop with Condition

Print only the names from the list below that have more than 4 characters.

```python
names = ["Ali", "Priya", "Raj", "Sneha", "Om", "Vikram", "Ria"]
```

**Expected Output:**
```
Priya
Sneha
Vikram
```

**Solution:**

```python
names = ["Ali", "Priya", "Raj", "Sneha", "Om", "Vikram", "Ria"]

for name in names:
 if len(name) > 4:
 print(name)
```

**What this tests:** Looping over a list, `len()` inside a condition.

---

### Q4 - while Loop with Division

Write a while loop that keeps dividing a number by 2 until it goes below 1. Print the value at each step.

```python
number = 64
```

**Expected Output:**
```
64
32.0
16.0
8.0
4.0
2.0
1.0
```

**Solution:**

```python
number = 64

while number >= 1:
 print(number)
 number = number / 2
```

**What this tests:** while loop, updating the loop variable each iteration, float division.

---

### Q5 - Dictionary Loop

Print each item name and its price after a 15% discount. Round to 2 decimal places.

```python
menu = {
 "Masala Chai": 20,
 "Vada Pav": 15,
 "Samosa": 10,
 "Filter Coffee": 25,
 "Idli": 30,
}
```

**Expected Output:**
```
Masala Chai : Rs.17.0
Vada Pav : Rs.12.75
Samosa : Rs.8.5
Filter Coffee : Rs.21.25
Idli : Rs.25.5
```

**Solution:**

```python
menu = {
 "Masala Chai": 20,
 "Vada Pav": 15,
 "Samosa": 10,
 "Filter Coffee": 25,
 "Idli": 30,
}

for item, price in menu.items():
 discounted = round(price * 0.85, 2)
 print(f"{item} : Rs.{discounted}")
```

**What this tests:** `.items()` to loop over a dictionary, arithmetic inside a loop, f-strings.

---

### Q6 - Countdown with while

Write a countdown timer from 10 to 1, then print "Happy New Year!" at the end.

**Expected Output:**
```
10
9
8
7
6
5
4
3
2
1
Happy New Year!
```

**Solution:**

```python
count = 10

while count > 0:
 print(count)
 count -= 1

print("Happy New Year!")
```

**What this tests:** while loop with decrement, code outside the loop runs once.

---

### Q7 - Sum with for and range()

Calculate the sum of all integers from 1 to 100 using a for loop. Do not use the `sum()` function.

**Expected Output:**
```
Sum from 1 to 100: 5050
```

**Solution:**

```python
total = 0

for i in range(1, 101):
 total += i

print(f"Sum from 1 to 100: {total}")
```

**What this tests:** Accumulator pattern, range() with both start and stop.

---

## Medium Questions (8-14)

---

### Q8 - enumerate() with Logic

Given a list of cricket scores for each ball, use `enumerate()` to:
- Print each ball number (starting from 1) with its score
- Print the ball number on which the highest score was hit

```python
ball_scores = [1, 0, 4, 6, 1, 2, 6, 0, 4, 3]
```

**Expected Output:**
```
Ball 1: 1 run
Ball 2: 0 runs
Ball 3: 4 runs
Ball 4: 6 runs
Ball 5: 1 run
Ball 6: 2 runs
Ball 7: 6 runs
Ball 8: 0 runs
Ball 9: 4 runs
Ball 10: 3 runs

Highest score of 6 was first hit on Ball 4
```

**Solution:**

```python
ball_scores = [1, 0, 4, 6, 1, 2, 6, 0, 4, 3]

for ball_num, score in enumerate(ball_scores, start=1):
 label = "run" if score == 1 else "runs"
 print(f"Ball {ball_num}: {score} {label}")

max_score = max(ball_scores)
for ball_num, score in enumerate(ball_scores, start=1):
 if score == max_score:
 print(f"\nHighest score of {max_score} was first hit on Ball {ball_num}")
 break
```

**What this tests:** enumerate() with custom start, finding max + its position, break to stop after first match.

---

### Q9 - zip() and Comparison

You have two lists: last year's sales and this year's sales for 6 cities. Use `zip()` to print, for each city, whether sales went up, went down, or stayed the same.

```python
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune"]
last_year = [120, 145, 98, 110, 85, 76]
this_year = [135, 140, 115, 110, 92, 88]
```

**Expected Output:**
```
Delhi : Up (120 -> 135)
Mumbai : Down (145 -> 140)
Bangalore : Up (98 -> 115)
Chennai : Same (110 -> 110)
Hyderabad : Up (85 -> 92)
Pune : Up (76 -> 88)
```

**Solution:**

```python
cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune"]
last_year = [120, 145, 98, 110, 85, 76]
this_year = [135, 140, 115, 110, 92, 88]

for city, prev, curr in zip(cities, last_year, this_year):
 if curr > prev:
 trend = "Up"
 elif curr < prev:
 trend = "Down"
 else:
 trend = "Same"
 print(f"{city:<10}: {trend} ({prev} -> {curr})")
```

**What this tests:** zip() over three lists at once, comparison logic, string formatting with alignment.

---

### Q10 - break and continue Together

Given a list of transactions, skip any with `status = "pending"`, and stop all processing the moment a `status = "fraud"` is encountered. Print all transactions that were actually processed.

```python
transactions = [
 {"id": 1, "amount": 5000, "status": "success"},
 {"id": 2, "amount": 1200, "status": "pending"},
 {"id": 3, "amount": 8800, "status": "success"},
 {"id": 4, "amount": 3200, "status": "fraud"},
 {"id": 5, "amount": 4400, "status": "success"},
]
```

**Expected Output:**
```
Processed transaction #1 : Rs.5000
Skipping pending transaction #2
Processed transaction #3 : Rs.8800
Fraud detected on transaction #4. Halting all processing.
```

**Solution:**

```python
transactions = [
 {"id": 1, "amount": 5000, "status": "success"},
 {"id": 2, "amount": 1200, "status": "pending"},
 {"id": 3, "amount": 8800, "status": "success"},
 {"id": 4, "amount": 3200, "status": "fraud"},
 {"id": 5, "amount": 4400, "status": "success"},
]

for t in transactions:
 if t["status"] == "pending":
 print(f"Skipping pending transaction #{t['id']}")
 continue
 if t["status"] == "fraud":
 print(f"Fraud detected on transaction #{t['id']}. Halting all processing.")
 break
 print(f"Processed transaction #{t['id']} : Rs.{t['amount']}")
```

**What this tests:** break and continue in the same loop, accessing dict keys inside a loop, order of conditions matters.

---

### Q11 - Nested Loop Pattern

Print the following number pattern using nested loops:

```
1
2 2
3 3 3
4 4 4 4
5 5 5 5 5
```

**Solution:**

```python
for i in range(1, 6):
 for j in range(i):
 print(i, end=" ")
 print()
```

**What this tests:** Nested loops, `end=" "` to print on same line, outer loop controls rows, inner loop controls columns.

---

### Q12 - List Comprehension with Multiple Conditions

Using a single list comprehension, extract all words from the sentence below that:
- Are longer than 3 characters
- Start with a vowel

```python
sentence = "An elephant ate orange apples in an orchard outside the city"
```

**Expected Output:**
```
['elephant', 'ate', 'orange', 'apples', 'orchard', 'outside']
```

**Solution:**

```python
sentence = "An elephant ate orange apples in an orchard outside the city"

result = [
 word for word in sentence.split()
 if len(word) > 3 and word[0].lower() in "aeiou"
]

print(result)
```

**What this tests:** List comprehension with two conditions using `and`, `.split()` to tokenize, checking first character.

---

### Q13 - Dictionary Comprehension with Grade Logic

Given the two lists below, create a dictionary where each student's name maps to their grade using the rules: "A" if marks >= 80, "B" if 60-79, "C" otherwise.

```python
students = ["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"]
marks = [88, 55, 73, 91, 62, 47]
```

**Expected Output:**
```
{'Aarav': 'A', 'Priya': 'C', 'Rohan': 'B', 'Sneha': 'A', 'Karan': 'B', 'Meera': 'C'}
```

**Solution:**

```python
students = ["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"]
marks = [88, 55, 73, 91, 62, 47]

grades = {
 name: ("A" if m >= 80 else "B" if m >= 60 else "C")
 for name, m in zip(students, marks)
}

print(grades)
```

**What this tests:** Dictionary comprehension, nested ternary in a comprehension, zip() to pair two lists.

---

### Q14 - else with a Loop (Prime Checker)

Write a function `is_prime(n)` that uses a for loop with an `else` block to check whether a number is prime. Test it on a list of numbers.

```python
numbers = [2, 7, 10, 13, 25, 29, 36, 41]
```

**Expected Output:**
```
2 is prime
7 is prime
10 is not prime
13 is prime
25 is not prime
29 is prime
36 is not prime
41 is prime
```

**Solution:**

```python
def is_prime(n):
 if n < 2:
 return False
 for i in range(2, n):
 if n % i == 0:
 return False
 return True

numbers = [2, 7, 10, 13, 25, 29, 36, 41]

for num in numbers:
 status = "is prime" if is_prime(num) else "is not prime"
 print(f"{num:<2} {status}")
```

**Note:** The `else` block on a for loop is an alternative way to write this:

```python
def is_prime_with_else(n):
 if n < 2:
 return False
 for i in range(2, n):
 if n % i == 0:
 print(f"{n} is not prime (divisible by {i})")
 break
 else:
 # This else runs only if the loop finished without hitting break
 print(f"{n} is prime")

is_prime_with_else(13)
is_prime_with_else(15)
```

**What this tests:** for-else, returning from a function inside a loop, looping over a list and calling a function.

---

## Hard Questions (15-20)

---

### Q15 - Loop with Data Grouping

Given the list of orders below, write a loop to build a summary dictionary that tracks total revenue and number of orders per city. Then print each city's summary.

```python
orders = [
 {"city": "Mumbai", "amount": 1500},
 {"city": "Delhi", "amount": 3200},
 {"city": "Mumbai", "amount": 800},
 {"city": "Bangalore", "amount": 4500},
 {"city": "Delhi", "amount": 1100},
 {"city": "Mumbai", "amount": 2200},
 {"city": "Bangalore", "amount": 3800},
 {"city": "Delhi", "amount": 900},
]
```

**Expected Output:**
```
Mumbai | Orders: 3 | Revenue: Rs.4500
Delhi | Orders: 3 | Revenue: Rs.5200
Bangalore | Orders: 2 | Revenue: Rs.8300
```

**Solution:**

```python
orders = [
 {"city": "Mumbai", "amount": 1500},
 {"city": "Delhi", "amount": 3200},
 {"city": "Mumbai", "amount": 800},
 {"city": "Bangalore", "amount": 4500},
 {"city": "Delhi", "amount": 1100},
 {"city": "Mumbai", "amount": 2200},
 {"city": "Bangalore", "amount": 3800},
 {"city": "Delhi", "amount": 900},
]

summary = {}

for order in orders:
 city = order["city"]
 if city not in summary:
 summary[city] = {"orders": 0, "revenue": 0}
 summary[city]["orders"] += 1
 summary[city]["revenue"] += order["amount"]

for city, data in summary.items():
 print(f"{city:<10}| Orders: {data['orders']} | Revenue: Rs.{data['revenue']}")
```

**What this tests:** Building a nested dictionary inside a loop, the "key not in dict" initialization pattern, formatting output from a nested dict.

---

### Q16 - while Loop with Validation Logic

Write a number guessing game. The secret number is 33. The player gets 6 attempts. After each wrong guess, tell the player if the answer is higher or lower. If all attempts are exhausted without a correct guess, reveal the number.

**Expected interaction:**
```
Guess a number between 1 and 50: 25
Too low! 5 attempts left.
Guess a number between 1 and 50: 40
Too high! 4 attempts left.
Guess a number between 1 and 50: 33
Correct! You got it in 3 attempt(s).
```

**Solution:**

```python
secret = 33
attempts_allowed = 6
attempts_used = 0

while attempts_used < attempts_allowed:
 guess = int(input("Guess a number between 1 and 50: "))
 attempts_used += 1
 remaining = attempts_allowed - attempts_used

 if guess == secret:
 print(f"Correct! You got it in {attempts_used} attempt(s).")
 break
 elif guess < secret:
 print(f"Too low! {remaining} attempt(s) left.")
 else:
 print(f"Too high! {remaining} attempt(s) left.")
else:
 # while-else: runs only if the while condition became False (never broke out)
 print(f"Out of attempts! The number was {secret}.")
```

**What this tests:** while-else, tracking attempts with a counter, break inside while, multi-branch elif.

---

### Q17 - Nested Loop with Diamond Pattern

Print a diamond shape of stars for a given `n`. For `n = 4`, the output should be:

```
 *
 * *
 * * *
* * * *
* * * *
 * * *
 * *
 *
```

**Solution:**

```python
n = 4

# Top half (rows 1 to n)
for i in range(1, n + 1):
 spaces = n - i
 print(" " * spaces + "* " * i)

# Bottom half (rows n-1 down to 1)
for i in range(n - 1, 0, -1):
 spaces = n - i
 print(" " * spaces + "* " * i)
```

**What this tests:** Two separate loops for top and bottom halves, calculating spaces as a function of row number, range() going downward, string multiplication.

---

### Q18 - Flatten and Deduplicate

Given the nested list of city lists from different survey sources below, write a loop to:
- Flatten it into a single list
- Remove duplicates while preserving the first-seen order
- Print the final clean list

```python
survey_data = [
 ["Delhi", "Mumbai", "Pune"],
 ["Bangalore", "Mumbai", "Hyderabad"],
 ["Chennai", "Delhi", "Kochi"],
 ["Pune", "Kochi", "Surat"],
]
```

**Expected Output:**
```
['Delhi', 'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kochi', 'Surat']
```

**Solution:**

```python
survey_data = [
 ["Delhi", "Mumbai", "Pune"],
 ["Bangalore", "Mumbai", "Hyderabad"],
 ["Chennai", "Delhi", "Kochi"],
 ["Pune", "Kochi", "Surat"],
]

seen = []

for sublist in survey_data:
 for city in sublist:
 if city not in seen:
 seen.append(city)

print(seen)
```

**Alternative using a set to track seen items (faster for large data):**

```python
seen_set = set()
result = []

for sublist in survey_data:
 for city in sublist:
 if city not in seen_set:
 result.append(city)
 seen_set.add(city)

print(result)
```

**What this tests:** Nested loops over a list of lists, deduplication while preserving order, two approaches (list vs set for membership check).

---

### Q19 - Word Frequency Counter

Write a program that counts how many times each word appears in the paragraph below. Ignore case and punctuation. Print the results sorted from most frequent to least frequent. Show only words that appear more than once.

```python
paragraph = """
Cricket is the most popular sport in India. India has produced many great cricket
players. The cricket World Cup is watched by millions in India and around the world.
Players from India have won the World Cup twice for India.
"""
```

**Expected Output (order may vary for equal counts):**
```
india : 6
cricket : 4
the : 4
world : 3
cup : 2
players : 2
has : 1 <- only shown if you choose to include count >= 1
```

*(Show only words with count > 1 in the final output.)*

**Solution:**

```python
paragraph = """
Cricket is the most popular sport in India. India has produced many great cricket
players. The cricket World Cup is watched by millions in India and around the world.
Players from India have won the World Cup twice for India.
"""

# Clean and split
cleaned = ""
for char in paragraph.lower():
 if char.isalpha() or char == " ":
 cleaned += char

words = cleaned.split()

# Count frequencies
freq = {}
for word in words:
 if word not in freq:
 freq[word] = 0
 freq[word] += 1

# Sort by count descending
sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)

# Print words that appear more than once
for word, count in sorted_words:
 if count > 1:
 print(f"{word:<10}: {count}")
```

**What this tests:** Nested loops, building a frequency dictionary, sorting a list of tuples by value, string cleaning with a loop, lambda as a sort key.

---

### Q20 - Full Student Report Pipeline

You are given student records. Write a complete program that:
1. Calculates each student's total marks and percentage (out of 500)
2. Assigns a grade: "Distinction" (>= 85%), "First Class" (>= 60%), "Pass" (>= 40%), "Fail" (< 40%)
3. Counts how many students got each grade
4. Finds the topper (highest percentage)
5. Prints the full formatted report

```python
students = [
 {"name": "Aarav", "maths": 88, "science": 92, "english": 85, "history": 78, "cs": 95},
 {"name": "Priya", "maths": 55, "science": 48, "english": 62, "history": 50, "cs": 58},
 {"name": "Rohan", "maths": 72, "science": 68, "english": 75, "history": 70, "cs": 65},
 {"name": "Sneha", "maths": 95, "science": 98, "english": 92, "history": 88, "cs": 97},
 {"name": "Karan", "maths": 35, "science": 40, "english": 38, "history": 42, "cs": 30},
 {"name": "Meera", "maths": 78, "science": 82, "english": 80, "history": 75, "cs": 84},
 {"name": "Arjun", "maths": 45, "science": 55, "english": 50, "history": 48, "cs": 52},
]
```

**Expected Output:**
```
===== STUDENT REPORT =====
Aarav | Total: 438/500 | 87.6% | Distinction
Priya | Total: 273/500 | 54.6% | Pass
Rohan | Total: 350/500 | 70.0% | First Class
Sneha | Total: 470/500 | 94.0% | Distinction
Karan | Total: 185/500 | 37.0% | Fail
Meera | Total: 399/500 | 79.8% | First Class
Arjun | Total: 250/500 | 50.0% | Pass

===== GRADE SUMMARY =====
Distinction : 2
First Class : 2
Pass : 2
Fail : 1

===== TOPPER =====
Sneha with 94.0%
```

**Solution:**

```python
students = [
 {"name": "Aarav", "maths": 88, "science": 92, "english": 85, "history": 78, "cs": 95},
 {"name": "Priya", "maths": 55, "science": 48, "english": 62, "history": 50, "cs": 58},
 {"name": "Rohan", "maths": 72, "science": 68, "english": 75, "history": 70, "cs": 65},
 {"name": "Sneha", "maths": 95, "science": 98, "english": 92, "history": 88, "cs": 97},
 {"name": "Karan", "maths": 35, "science": 40, "english": 38, "history": 42, "cs": 30},
 {"name": "Meera", "maths": 78, "science": 82, "english": 80, "history": 75, "cs": 84},
 {"name": "Arjun", "maths": 45, "science": 55, "english": 50, "history": 48, "cs": 52},
]

subjects = ["maths", "science", "english", "history", "cs"]
max_marks = 500
grade_count = {"Distinction": 0, "First Class": 0, "Pass": 0, "Fail": 0}
topper_name = ""
topper_pct = 0

print("===== STUDENT REPORT =====")

for student in students:
 total = sum(student[sub] for sub in subjects)
 pct = round((total / max_marks) * 100, 1)

 if pct >= 85:
 grade = "Distinction"
 elif pct >= 60:
 grade = "First Class"
 elif pct >= 40:
 grade = "Pass"
 else:
 grade = "Fail"

 grade_count[grade] += 1

 if pct > topper_pct:
 topper_pct = pct
 topper_name = student["name"]

 print(f"{student['name']:<6} | Total: {total}/{max_marks} | {pct}% | {grade}")

print("\n===== GRADE SUMMARY =====")
for grade, count in grade_count.items():
 print(f"{grade:<12}: {count}")

print("\n===== TOPPER =====")
print(f"{topper_name} with {topper_pct}%")
```

**What this tests:** Everything. Loop over list of dicts, inner loop to sum subject scores, grade assignment with if-elif-else, accumulator for grade counts, tracking max value and its label across iterations, formatted multi-section output.

---

## Quick Reference

| Concept | One-liner reminder |
|---|---|
| for loop | `for item in collection:` |
| while loop | `while condition:` |
| range | `range(start, stop, step)` |
| break | Exit the loop immediately |
| continue | Skip this iteration, keep going |
| pass | Do nothing, placeholder |
| else on loop | Runs only if break was never hit |
| enumerate | `for i, val in enumerate(lst, start=1):` |
| zip | `for a, b in zip(list1, list2):` |
| list comprehension | `[expr for x in lst if condition]` |
| dict comprehension | `{k: v for k, v in zip(keys, vals)}` |
| dict loop | `for key, val in d.items():` |
| nested loop | Inner loop runs fully for each outer iteration |

---

*Made with care for Codeverra learners | codeverra.com*