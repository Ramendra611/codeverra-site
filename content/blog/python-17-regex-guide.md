---
title: "Regular Expressions in Python"
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Regular Expressions in Python
### Pattern Matching, Text Processing, and the re Module

---

## Before We Begin -- Why Regular Expressions Matter

Here is a real problem. You have a CSV file with 50,000 rows of customer
data. The phone number column is a mess:

```
+91-9876543210
9876 543 210
(091) 9876-543210
91-98765-43210
9876543210
+919876543210
```

All of these are the same phone number in different formats. You need to
extract just the 10-digit number from all of them.

Without regular expressions, you would write a long, fragile function
with many string operations and if statements that still misses edge cases.

With regular expressions, you write one pattern and extract all the numbers
in a single pass.

Regular expressions (regex) are a language for describing patterns in text.
They are used for:

- **Validation:** Is this a valid email address? Is this a valid PIN code?
- **Extraction:** Pull all phone numbers from a block of text.
- **Cleaning:** Remove all HTML tags from a scraped webpage.
- **Splitting:** Split a sentence on any punctuation, not just a single character.
- **Replacement:** Replace all date formats in a document with a standard format.

They appear in every domain -- data engineering (parsing logs), data science
(cleaning text data for NLP), backend development (URL routing, input validation),
and automation (processing files and documents).

The syntax looks intimidating at first. That is normal. You learn it pattern
by pattern and it becomes readable quickly.

---

## Table of Contents

1. [How Regular Expressions Work](#1-how-regular-expressions-work)
2. [The re Module -- Core Functions](#2-the-re-module----core-functions)
3. [Character Classes](#3-character-classes)
4. [Quantifiers -- How Many?](#4-quantifiers----how-many)
5. [Anchors -- Where in the String?](#5-anchors----where-in-the-string)
6. [Groups and Capturing](#6-groups-and-capturing)
7. [Alternation and Special Characters](#7-alternation-and-special-characters)
8. [Lookahead and Lookbehind](#8-lookahead-and-lookbehind)
9. [Flags -- Modifying Behaviour](#9-flags----modifying-behaviour)
10. [Compiled Patterns -- re.compile](#10-compiled-patterns----recompile)
11. [Common Real-World Patterns](#11-common-real-world-patterns)
12. [Data Cleaning with Regex](#12-data-cleaning-with-regex)
13. [Practice Questions](#13-practice-questions)
14. [Solutions](#14-solutions)
15. [Summary and Key Takeaways](#15-summary-and-key-takeaways)

---

## 1. How Regular Expressions Work

A regular expression is a pattern string that describes what you are
looking for in a body of text.

```python
import re

text    = "My phone number is 9876543210 and my PIN is 560001."
pattern = r"\d{10}"   # \d means "a digit", {10} means "exactly 10 of them"

match = re.search(pattern, text)
print(match.group())   # 9876543210
```

### The raw string prefix r"..."

Always use raw strings (`r"..."`) for regex patterns. Without the `r`, Python
processes backslash sequences (`\n`, `\t`) before the regex engine sees them.
With `r`, backslashes are passed literally to the regex engine.

```python
# Without r -- Python processes \d as invalid escape
pattern = "\d+"       # might produce a DeprecationWarning or unexpected behaviour

# With r -- regex engine gets the literal characters \d+
pattern = r"\d+"      # always use this
```

### Regex patterns are matched left to right

The engine scans the text from left to right and tries to match the pattern
at each position. When it finds a match, it reports it (or all of them, if
you ask for all matches).

---

## 2. The re Module -- Core Functions

```python
import re

text = "Aarav scored 88 marks. Priya scored 95. Rohan scored 72."
```

### re.search() -- find first match anywhere

```python
match = re.search(r"\d+", text)

if match:
    print(match.group())    # "88" -- first number found
    print(match.start())    # 13   -- index where match starts
    print(match.end())      # 15   -- index where match ends
    print(match.span())     # (13, 15) -- (start, end) tuple
else:
    print("No match found")
```

### re.findall() -- return all non-overlapping matches as a list

```python
numbers = re.findall(r"\d+", text)
print(numbers)    # ['88', '95', '72']   -- always returns strings

# With groups, returns list of tuples
pairs = re.findall(r"(\w+) scored (\d+)", text)
print(pairs)
# [('Aarav', '88'), ('Priya', '95'), ('Rohan', '72')]
```

### re.finditer() -- return iterator of match objects

```python
# Better than findall when you need match positions or other match data
for match in re.finditer(r"\d+", text):
    print(f"Found {match.group()} at position {match.start()}-{match.end()}")
```

### re.match() -- match only at the START of the string

```python
# re.match() only checks the beginning of the string
print(re.match(r"\d+", "123 abc"))    # match -- starts with digits
print(re.match(r"\d+", "abc 123"))    # None  -- does not start with digits

# re.search() checks anywhere in the string
print(re.search(r"\d+", "abc 123"))   # match -- finds 123 inside
```

### re.fullmatch() -- match must cover the ENTIRE string

```python
# Useful for validation
print(re.fullmatch(r"\d{10}", "9876543210"))    # match -- exactly 10 digits
print(re.fullmatch(r"\d{10}", "98765432"))      # None  -- only 8 digits
print(re.fullmatch(r"\d{10}", "9876543210 "))   # None  -- trailing space
```

### re.sub() -- find and replace

```python
# re.sub(pattern, replacement, string, count=0)
text = "Phone: 98765-43210, Alt: 87654-32109"

# Replace with a fixed string
cleaned = re.sub(r"-", "", text)
print(cleaned)   # "Phone: 9876543210, Alt: 8765432109"

# Replace using a function
def mask_number(match):
    number = match.group()
    return "X" * (len(number) - 4) + number[-4:]

masked = re.sub(r"\d{10}", mask_number, "Contact: 9876543210")
print(masked)   # Contact: XXXXXX3210

# Limit replacements
text2   = "aaa bbb aaa ccc aaa"
result  = re.sub(r"aaa", "ZZZ", text2, count=2)
print(result)   # "ZZZ bbb ZZZ ccc aaa"  (only first 2 replaced)
```

### re.split() -- split on a pattern

```python
# Split on any punctuation or whitespace
text  = "Delhi,Mumbai;Bangalore Hyderabad|Chennai"
parts = re.split(r"[,;|\s]+", text)
print(parts)   # ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai']

# Split a sentence on sentence-ending punctuation
sentences = re.split(r"[.!?]+\s*", "Hello! How are you? I am fine. Thanks.")
print(sentences)   # ['Hello', 'How are you', 'I am fine', 'Thanks', '']
```

---

## 3. Character Classes

Character classes match a single character from a set.

### Built-in shorthand classes

```
\d    Any digit: 0-9
\D    Any NON-digit
\w    Any word character: letters, digits, underscore [a-zA-Z0-9_]
\W    Any NON-word character
\s    Any whitespace: space, tab, newline, etc.
\S    Any NON-whitespace
.     Any character EXCEPT newline (unless re.DOTALL is set)
```

```python
text = "Aarav scored 88/100 in Python (4 credits)"

print(re.findall(r"\d+",  text))  # ['88', '100', '4']  -- all numbers
print(re.findall(r"\w+",  text))  # all words (letters+digits)
print(re.findall(r"\s",   text))  # all whitespace characters
print(re.findall(r"\D+",  text))  # sequences of non-digit characters
```

### Custom character classes with []

```python
# [abc]    -- match a, b, or c
# [a-z]    -- match any lowercase letter
# [A-Z]    -- match any uppercase letter
# [0-9]    -- match any digit (same as \d)
# [a-zA-Z] -- match any letter
# [^abc]   -- match any character EXCEPT a, b, c (^ inside [] negates)

text = "Zomato Order #AB-2024-001: Rs.450.00"

# Extract only letters
letters  = re.findall(r"[a-zA-Z]+", text)
print(letters)   # ['Zomato', 'Order', 'AB', 'Rs']

# Extract only digits
digits   = re.findall(r"[0-9]+", text)
print(digits)    # ['2024', '001', '450', '00']

# Extract alphanumeric sequences
alphanum = re.findall(r"[a-zA-Z0-9]+", text)
print(alphanum)  # ['Zomato', 'Order', 'AB', '2024', '001', 'Rs', '450', '00']

# Match vowels
vowels = re.findall(r"[aeiouAEIOU]", "Bangalore")
print(vowels)    # ['a', 'a', 'o', 'e']

# Match non-vowels
consonants = re.findall(r"[^aeiouAEIOU\s]", "Bangalore")
print(consonants)  # ['B', 'n', 'g', 'l', 'r']
```

---

## 4. Quantifiers -- How Many?

Quantifiers say how many times the preceding element must appear.

```
?       Zero or one (optional)
*       Zero or more
+       One or more
{n}     Exactly n times
{n,}    At least n times
{n,m}   Between n and m times (inclusive)
```

```python
text = "colour color colouur colooor"

# ? -- zero or one 'u'
print(re.findall(r"colou?r", text))
# ['colour', 'color']   -- matches with or without 'u'

# * -- zero or more 'u'
print(re.findall(r"colou*r", text))
# ['colour', 'color', 'colouur', 'colooor'... wait, let us look at this more carefully
# 'colooor' doesn't match because o* needs o's between colo and r, not u's
# Actually the pattern "colou*r" matches: colo + zero or more u's + r

# + -- one or more digits
phone = "Call 9876543210 or 022-12345678"
print(re.findall(r"\d+", phone))   # ['9876543210', '022', '12345678']

# {n} -- exact count
print(re.findall(r"\d{10}", phone))   # ['9876543210']  -- exactly 10 digits

# {n,m} -- range
print(re.findall(r"\d{3,5}", "12 123 1234 12345 123456"))
# ['123', '1234', '12345', '12345']  -- 3 to 5 digits
# Note: '123456' matches as '12345' (first 5 digits) then '6' is left
```

### Greedy vs lazy matching

By default, quantifiers are **greedy** -- they match as much as possible.
Adding `?` after a quantifier makes it **lazy** -- it matches as little
as possible.

```python
html = "<b>Bold</b> and <i>Italic</i>"

# Greedy -- matches from first < to LAST >
greedy = re.findall(r"<.+>", html)
print(greedy)   # ['<b>Bold</b> and <i>Italic</i>']   -- one huge match

# Lazy -- matches from < to the NEXT >
lazy = re.findall(r"<.+?>", html)
print(lazy)     # ['<b>', '</b>', '<i>', '</i>']   -- four separate matches

# Greedy quantifiers: *  +  ?  {n,m}
# Lazy quantifiers:   *? +? ?? {n,m}?
```

---

## 5. Anchors -- Where in the String?

Anchors do not match characters -- they match positions.

```
^     Start of string (or start of line with re.MULTILINE)
$     End of string (or end of line with re.MULTILINE)
\b    Word boundary (between \w and \W)
\B    NOT a word boundary
```

```python
# ^ -- must be at the start
print(re.search(r"^\d{4}", "2024 is the year"))   # match -- starts with digits
print(re.search(r"^\d{4}", "The year is 2024"))   # None  -- not at start

# $ -- must be at the end
print(re.search(r"\d{4}$", "The year is 2024"))   # match -- ends with digits
print(re.search(r"\d{4}$", "2024 is the year"))   # None  -- not at end

# Both -- must match the ENTIRE string (similar to fullmatch)
print(re.search(r"^\d{4}$", "2024"))    # match
print(re.search(r"^\d{4}$", "20245"))   # None

# \b -- word boundary
text = "cat concatenate category cats"
print(re.findall(r"\bcat\b", text))    # ['cat']   -- only the exact word
print(re.findall(r"cat", text))        # ['cat', 'cat', 'cat', 'cat']
                                        # -- matches inside other words too
```

### Practical anchor use

```python
# Validate that a string is a valid 6-digit Indian PIN code
def is_valid_pin(pin: str) -> bool:
    return bool(re.fullmatch(r"[1-9]\d{5}", pin))
    # Starts with 1-9 (no Indian PIN starts with 0)
    # Followed by exactly 5 more digits

print(is_valid_pin("560001"))   # True
print(is_valid_pin("060001"))   # False -- starts with 0
print(is_valid_pin("56000"))    # False -- only 5 digits

# Validate a line starts with a date
lines = [
    "2024-03-15 Payment received",
    "Error: Payment failed",
    "2024-03-16 Refund processed",
]

date_lines = [l for l in lines if re.match(r"^\d{4}-\d{2}-\d{2}", l)]
print(date_lines)
# ['2024-03-15 Payment received', '2024-03-16 Refund processed']
```

---

## 6. Groups and Capturing

Parentheses `()` create groups. Groups:
1. Capture the matched text so you can extract it separately
2. Allow you to apply quantifiers to a sequence
3. Enable backreferences

```python
text = "Aarav scored 88. Priya scored 95. Rohan scored 72."

# Without groups -- matches the whole pattern
matches = re.findall(r"\w+ scored \d+", text)
print(matches)   # ['Aarav scored 88', 'Priya scored 95', 'Rohan scored 72']

# With groups -- returns tuples of captured groups
matches = re.findall(r"(\w+) scored (\d+)", text)
print(matches)   # [('Aarav', '88'), ('Priya', '95'), ('Rohan', '72')]

# Extract just the scores
for name, score in matches:
    print(f"{name}: {int(score)}")
```

### Accessing groups in match objects

```python
log_line = "2024-03-15 14:30:22 ERROR payments.billing Payment failed for order 1042"

pattern  = r"(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) (\w+) (\S+) (.+)"
match    = re.search(pattern, log_line)

if match:
    print(match.group(0))   # entire match
    print(match.group(1))   # 2024-03-15
    print(match.group(2))   # 14:30:22
    print(match.group(3))   # ERROR
    print(match.group(4))   # payments.billing
    print(match.group(5))   # Payment failed for order 1042
    print(match.groups())   # tuple of all groups
```

### Named groups -- r"(?P<name>pattern)"

```python
log_line = "2024-03-15 14:30:22 ERROR payments.billing Payment failed"

pattern = (
    r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>\w+)\s+"
    r"(?P<module>\S+)\s+"
    r"(?P<message>.+)"
)

match = re.search(pattern, log_line)
if match:
    print(match.group("date"))     # 2024-03-15
    print(match.group("level"))    # ERROR
    print(match.group("message"))  # Payment failed
    print(match.groupdict())       # dict of all named groups
```

### Non-capturing groups -- r"(?:pattern)"

When you need grouping for structure but do not need to capture:

```python
# You want to match "colour" or "color" but not capture the group
text   = "American color and British colour"
# (?:...) groups without capturing
words  = re.findall(r"colo(?:u?)r", text)
print(words)   # ['color', 'colour']

# Without non-capturing group, findall would return the captured 'u' parts
words2 = re.findall(r"colo(u?)r", text)
print(words2)  # ['', 'u']   -- only the captured group content returned!
```

---

## 7. Alternation and Special Characters

### Alternation with |

```python
# Match "cat" or "dog" or "bird"
animals = re.findall(r"cat|dog|bird", "I have a cat and a dog but no bird")
print(animals)   # ['cat', 'dog', 'bird']

# Use with groups for more complex alternation
# Match Mumbai or Delhi or Bangalore as whole words
cities = re.findall(r"\b(?:Mumbai|Delhi|Bangalore)\b",
                    "Flight from Delhi to Mumbai via Bangalore")
print(cities)    # ['Delhi', 'Mumbai', 'Bangalore']
```

### Escaping special characters

These characters have special meaning in regex and must be escaped with
`\` if you want to match them literally:

```
. ^ $ * + ? { } [ ] \ | ( )
```

```python
# Match a literal dot (.)
text   = "Price: Rs.450.00"
prices = re.findall(r"\d+\.\d+", text)
print(prices)   # ['450.00']

# Without escape, . matches ANY character
prices2 = re.findall(r"\d+.\d+", text)
print(prices2)  # ['450.00']  -- happens to work here but is wrong

# Match a literal pipe character
parts = re.split(r"\|", "Delhi|Mumbai|Bangalore")
print(parts)    # ['Delhi', 'Mumbai', 'Bangalore']

# Match parentheses
text  = "Score (out of 100): 88"
match = re.search(r"\(out of (\d+)\)", text)
if match:
    print(match.group(1))   # 100
```

---

## 8. Lookahead and Lookbehind

Lookahead and lookbehind are zero-width assertions -- they check for a
pattern without including it in the match.

```
(?=pattern)    Positive lookahead  -- what FOLLOWS the match
(?!pattern)    Negative lookahead  -- what does NOT follow
(?<=pattern)   Positive lookbehind -- what PRECEDES the match
(?<!pattern)   Negative lookbehind -- what does NOT precede
```

```python
# Positive lookahead: find numbers followed by "kg"
text = "I have 5kg of rice, 2 apples, and 10kg of flour"
numbers_before_kg = re.findall(r"\d+(?=kg)", text)
print(numbers_before_kg)   # ['5', '10']  -- only numbers before "kg"

# Positive lookbehind: find numbers preceded by "Rs."
text = "Order total: Rs.450, Delivery: Rs.30, Tax: Rs.22"
amounts = re.findall(r"(?<=Rs\.)\d+", text)
print(amounts)   # ['450', '30', '22']

# Negative lookahead: find "Python" NOT followed by "3"
text = "Python is great. Python 3 is even better. Learn Python."
matches = re.findall(r"Python(?! 3)", text)
print(matches)   # ['Python', 'Python']  -- not the "Python 3" instance

# Practical: extract values from key=value pairs
config = "timeout=30, retries=3, debug=false, host=localhost"
values = re.findall(r"(?<=timeout=)\d+|(?<=retries=)\d+", config)
print(values)   # ['30', '3']

# Better approach: extract all key=value pairs
pairs = re.findall(r"(\w+)=(\w+)", config)
print(pairs)   # [('timeout', '30'), ('retries', '3'), ('debug', 'false'), ('host', 'localhost')]
```

---

## 9. Flags -- Modifying Behaviour

Flags change how the regex engine interprets patterns.

```python
import re

# re.IGNORECASE (re.I) -- case-insensitive matching
text   = "Python PYTHON python PyThOn"
matches = re.findall(r"python", text, re.IGNORECASE)
print(matches)   # ['Python', 'PYTHON', 'python', 'PyThOn']

# re.MULTILINE (re.M) -- ^ and $ match start/end of each LINE
text = """First line
Second line
Third line"""

print(re.findall(r"^\w+", text))             # ['First']  -- only first line
print(re.findall(r"^\w+", text, re.M))       # ['First', 'Second', 'Third']

# re.DOTALL (re.S) -- . matches newlines too
text  = "Name: Aarav\nCity: Bangalore\nScore: 88"
match = re.search(r"Name: .+Score", text)
print(match)   # None -- . does not cross newlines

match = re.search(r"Name: .+Score", text, re.DOTALL)
print(match.group() if match else None)   # Name: Aarav\nCity: Bangalore\nScore

# re.VERBOSE (re.X) -- allows whitespace and comments in pattern
# Makes complex patterns readable
phone_pattern = re.compile(r"""
    (?:\+91|0)?     # optional country code
    [-.\s]?         # optional separator
    ([6-9]\d{9})    # 10-digit mobile number starting with 6-9
""", re.VERBOSE)

print(phone_pattern.findall("+91-9876543210"))   # ['9876543210']

# Combine flags with | (pipe)
matches = re.findall(r"^python", text, re.IGNORECASE | re.MULTILINE)
```

---

## 10. Compiled Patterns -- re.compile

When you use the same pattern many times, compile it first.
`re.compile()` pre-processes the pattern once, making repeated use faster.

```python
import re

# Without compile -- pattern re-processed each time
for text in large_list_of_texts:
    matches = re.findall(r"\d{10}", text)   # pattern compiled on each call

# With compile -- pattern compiled once
phone_pattern = re.compile(r"\d{10}")
for text in large_list_of_texts:
    matches = phone_pattern.findall(text)   # uses pre-compiled pattern

# Compiled pattern has the same methods as re module functions
pattern = re.compile(r"(\w+)\s+scored\s+(\d+)", re.IGNORECASE)

pattern.search("Aarav scored 88")
pattern.findall("Aarav scored 88. Priya scored 95.")
pattern.match("Scored 88 Aarav")   # None -- wrong order
pattern.sub("REDACTED", "Aarav scored 88")
pattern.split("info scored 88 more info")
```

---

## 11. Common Real-World Patterns

A reference collection of patterns you will use regularly.

```python
import re

# ── Indian context ───────────────────────────────────────────────────────

# Mobile number (Indian -- starts with 6-9, 10 digits)
MOBILE = re.compile(r"(?:\+91|91|0)?[-.\s]?([6-9]\d{9})")

# Indian PIN code (6 digits, does not start with 0)
PIN_CODE = re.compile(r"\b[1-9]\d{5}\b")

# Indian PAN card (AAAAA1234A format)
PAN = re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b")

# Indian Aadhaar number (12 digits, often formatted as XXXX XXXX XXXX)
AADHAAR = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")

# ── General ──────────────────────────────────────────────────────────────

# Email address
EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")

# URL
URL = re.compile(r"https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}"
                 r"\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&=/]*")

# IPv4 address
IPV4 = re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}"
                  r"(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b")

# Date formats
DATE_ISO  = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")                    # 2024-03-15
DATE_IN   = re.compile(r"\b\d{2}/\d{2}/\d{4}\b")                    # 15/03/2024
DATE_LONG = re.compile(r"\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|"
                        r"Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b",
                        re.IGNORECASE)                                # 15 March 2024

# Time (24-hour)
TIME_24   = re.compile(r"\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b")

# Password strength check components
HAS_UPPER   = re.compile(r"[A-Z]")
HAS_LOWER   = re.compile(r"[a-z]")
HAS_DIGIT   = re.compile(r"\d")
HAS_SPECIAL = re.compile(r"[!@#$%^&*(),.?\":{}|<>]")

# ── Usage examples ───────────────────────────────────────────────────────
texts = [
    "Contact Aarav at aarav@codeverra.com or +91-9876543210",
    "Visit us at https://learn.codeverra.com",
    "Office PIN: 560001, PAN: ABCDE1234F",
    "DOB: 15 March 2024",
]

for text in texts:
    emails   = EMAIL.findall(text)
    phones   = MOBILE.findall(text)
    urls     = URL.findall(text)
    pins     = PIN_CODE.findall(text)
    dates    = DATE_LONG.findall(text)

    if emails:   print(f"Emails : {emails}")
    if phones:   print(f"Phones : {phones}")
    if urls:     print(f"URLs   : {urls}")
    if pins:     print(f"PINs   : {pins}")
    if dates:    print(f"Dates  : {dates}")
```

---

## 12. Data Cleaning with Regex

This is where regex earns its place in data science work.

```python
import re
import pandas as pd

# ── Phone number normalisation ────────────────────────────────────────────

def normalise_phone(phone: str) -> str | None:
    """
    Normalise an Indian mobile number to 10 digits.
    Handles formats like: +91-9876543210, 09876543210, 9876 543 210
    Returns None if not a valid mobile number.
    """
    # Remove all non-digit characters
    digits = re.sub(r"\D", "", phone)

    # Remove country code if present
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    # Validate: 10 digits starting with 6-9
    if re.fullmatch(r"[6-9]\d{9}", digits):
        return digits
    return None

phones = ["+91-9876543210", "09876543210", "9876 543 210",
          "98765432", "+44-9876543210", "9876543210"]

for phone in phones:
    result = normalise_phone(phone)
    print(f"{phone:<20} --> {result}")
```

```python
# ── Text cleaning for NLP ─────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """
    Clean raw text for NLP processing.
    - Remove HTML tags
    - Remove URLs
    - Remove extra whitespace
    - Keep only letters and spaces
    """
    text = re.sub(r"<[^>]+>",         "", text)   # remove HTML tags
    text = re.sub(r"https?://\S+",    "", text)   # remove URLs
    text = re.sub(r"[^a-zA-Z\s]",     "", text)   # keep only letters
    text = re.sub(r"\s+",            " ", text)   # collapse whitespace
    return text.strip().lower()

raw = """
<p>Check out our website at https://codeverra.com!
Python is GREAT for data science & ML. Call us: 9876543210.</p>
"""

print(clean_text(raw))
# "check out our website at python is great for data science ml call us"
```

```python
# ── Log file parsing ──────────────────────────────────────────────────────

def parse_log_line(line: str) -> dict | None:
    """
    Parse a structured log line into components.

    Format: 2024-03-15 14:30:22,123 ERROR module.name Message here
    """
    pattern = re.compile(
        r"(?P<date>\d{4}-\d{2}-\d{2})\s+"
        r"(?P<time>\d{2}:\d{2}:\d{2}),(?P<ms>\d{3})\s+"
        r"(?P<level>DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+"
        r"(?P<module>\S+)\s+"
        r"(?P<message>.+)"
    )

    match = pattern.fullmatch(line.strip())
    if not match:
        return None

    return match.groupdict()

logs = [
    "2024-03-15 14:30:22,123 ERROR payments.billing Payment failed for order 1042",
    "2024-03-15 14:30:23,456 INFO data_loader Loaded 500 records",
    "Not a valid log line",
    "2024-03-15 14:30:24,789 WARNING analytics Missing values in column price",
]

for line in logs:
    parsed = parse_log_line(line)
    if parsed:
        print(f"[{parsed['level']}] {parsed['module']}: {parsed['message']}")
    else:
        print(f"Unparseable: {line[:40]}")
```

```python
# ── CSV field extraction ──────────────────────────────────────────────────

def extract_product_info(description: str) -> dict:
    """
    Extract structured info from product descriptions like:
    "Laptop 16GB RAM 512GB SSD 15.6 inch Rs.65000"
    """
    result = {}

    ram_match   = re.search(r"(\d+)GB\s+RAM", description, re.IGNORECASE)
    ssd_match   = re.search(r"(\d+)GB\s+SSD", description, re.IGNORECASE)
    inch_match  = re.search(r"(\d+\.?\d*)\s*inch", description, re.IGNORECASE)
    price_match = re.search(r"Rs\.(\d+(?:,\d+)*)", description, re.IGNORECASE)

    if ram_match:   result["ram_gb"]    = int(ram_match.group(1))
    if ssd_match:   result["ssd_gb"]    = int(ssd_match.group(1))
    if inch_match:  result["screen"]    = float(inch_match.group(1))
    if price_match: result["price"]     = int(price_match.group(1).replace(",", ""))

    return result

descriptions = [
    "Laptop 16GB RAM 512GB SSD 15.6 inch Rs.65000",
    "MacBook 8GB RAM 256GB SSD 13.3 inch Rs.1,10,000",
    "Gaming laptop 32GB RAM 1024GB SSD 17.3 inch Rs.1,50,000",
]

for desc in descriptions:
    print(extract_product_info(desc))
```

---

## 13. Practice Questions

Try each question before reading the solution.
Questions ordered: Easy (1-5), Medium (6-10), Hard (11-15).

---

### Easy

**Q1 -- Basic search**
Write a function `has_number(text)` that returns True if the text
contains at least one number (digit sequence).

```python
has_number("Hello World")          # False
has_number("I scored 88 marks")    # True
has_number("Room 404")             # True
```

---

**Q2 -- Extract all**
Write a function `extract_emails(text)` that returns a list of all
email addresses found in the text.

```python
text = "Contact aarav@codeverra.com or support@codeverra.com for help"
extract_emails(text)   # ['aarav@codeverra.com', 'support@codeverra.com']
```

---

**Q3 -- Validation**
Write a function `is_valid_pin(pin)` that returns True if the string
is a valid Indian PIN code (6 digits, first digit 1-9).

```python
is_valid_pin("560001")   # True
is_valid_pin("060001")   # False
is_valid_pin("56001")    # False
is_valid_pin("5600011")  # False
```

---

**Q4 -- Substitution**
Write a function `mask_card(text)` that replaces all 16-digit credit card
numbers in a string with "XXXX-XXXX-XXXX-XXXX".

```python
text = "Card 4532015112830366 was charged Rs.5000"
mask_card(text)   # "Card XXXX-XXXX-XXXX-XXXX was charged Rs.5000"
```

---

**Q5 -- Split**
Write a function `split_csv_line(line)` that splits a CSV line correctly,
handling multiple consecutive delimiters (`,`, `;`, or `|`) as one separator.

```python
split_csv_line("Delhi,,Mumbai;Bangalore||Chennai")
# ['Delhi', 'Mumbai', 'Bangalore', 'Chennai']
```

---

### Medium

**Q6 -- Groups**
Write a function `parse_date(text)` that extracts dates in the format
`DD-MM-YYYY` or `DD/MM/YYYY` and returns them as a list of dicts with
keys `day`, `month`, `year`.

```python
parse_date("Event on 15-03-2024 and 22/04/2024")
# [{'day': '15', 'month': '03', 'year': '2024'},
#  {'day': '22', 'month': '04', 'year': '2024'}]
```

---

**Q7 -- Named groups**
Write a function `parse_transaction(line)` that parses transaction log
lines in this format and returns a dict:

```
TXN20240315143022-001 | CREDIT | Rs.5000.00 | Aarav Sharma | UPI
```

The dict should have keys: `txn_id`, `type`, `amount`, `name`, `method`.

---

**Q8 -- Lookahead**
Write a function `extract_quantities(text)` that extracts numbers that
are immediately followed by a unit (kg, g, L, ml, km) but returns only
the number, not the unit.

```python
extract_quantities("I need 500g sugar, 2kg flour, and 1L milk for 5km drive")
# [('500', 'g'), ('2', 'kg'), ('1', 'L'), ('5', 'km')]
# Return as list of (number, unit) tuples
```

---

**Q9 -- Multiline**
You have a multiline string of student results. Extract each student's
name and their total marks. Use `re.MULTILINE`.

```python
results = """
RESULT CARD
Name: Aarav Sharma     Total: 445/500
Name: Priya Patel      Total: 472/500
Name: Rohan Verma      Total: 398/500
"""
```

Expected output:
```
[('Aarav Sharma', '445'), ('Priya Patel', '472'), ('Rohan Verma', '398')]
```

---

**Q10 -- Password validator**
Write a function `check_password(password)` that returns a list of
requirements the password fails. Use regex for each check.

Requirements:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character from `!@#$%^&*()`

---

### Hard

**Q11 -- Log parser**
Write a complete log parser that reads a multi-line log string and returns
a list of parsed records. Each record should have: timestamp, level,
module, message. Count records by level.

---

**Q12 -- HTML tag stripper**
Write a function `strip_html(html)` that removes all HTML tags but preserves
the text content. Handle nested tags, self-closing tags, and tags with attributes.

```python
html = '<p class="intro">Hello <b>World</b>! Visit <a href="url">here</a>.</p>'
strip_html(html)   # "Hello World! Visit here."
```

---

**Q13 -- Data normalisation pipeline**
Given a DataFrame column of messy address strings, write a function that
uses regex to extract: flat number, building/area, city, and PIN code.

```python
addresses = [
    "Flat 4B, Prestige Towers, Koramangala, Bangalore - 560034",
    "42/A Indiranagar, Bangalore 560038",
    "House No. 15, MG Road, Delhi - 110001",
]
```

---

**Q14 -- Template engine**
Write a simple template substitution function `render(template, context)`
that replaces `{{variable_name}}` placeholders with values from a dictionary.
Handle missing variables gracefully.

```python
template = "Dear {{name}}, your order {{order_id}} of Rs.{{amount}} is {{status}}."
context  = {"name": "Aarav", "order_id": "ORD001", "amount": "5000"}
render(template, context)
# "Dear Aarav, your order ORD001 of Rs.5000 is [MISSING:status]."
```

---

**Q15 -- Tokeniser**
Write a simple tokeniser that splits code-like text into tokens:
integers, floats, strings (in quotes), operators (+,-,*,/,=,==,!=),
identifiers (variable names), and keywords (if, else, for, while, return).

```python
code  = 'if score >= 88: grade = "A"'
tokens = tokenise(code)
# [('KEYWORD', 'if'), ('IDENTIFIER', 'score'), ('OPERATOR', '>='),
#  ('INTEGER', '88'), ('OPERATOR', ':'), ('IDENTIFIER', 'grade'),
#  ('OPERATOR', '='), ('STRING', '"A"')]
```

---

## 14. Solutions

---

### Q1

```python
import re

def has_number(text: str) -> bool:
    return bool(re.search(r"\d+", text))
```

---

### Q2

```python
def extract_emails(text: str) -> list[str]:
    return re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", text)
```

---

### Q3

```python
def is_valid_pin(pin: str) -> bool:
    return bool(re.fullmatch(r"[1-9]\d{5}", pin))
```

---

### Q4

```python
def mask_card(text: str) -> str:
    return re.sub(r"\b\d{16}\b", "XXXX-XXXX-XXXX-XXXX", text)
```

---

### Q5

```python
def split_csv_line(line: str) -> list[str]:
    return [part for part in re.split(r"[,;|]+", line) if part]
```

---

### Q6

```python
def parse_date(text: str) -> list[dict]:
    pattern = r"(\d{2})[/-](\d{2})[/-](\d{4})"
    return [
        {"day": m.group(1), "month": m.group(2), "year": m.group(3)}
        for m in re.finditer(pattern, text)
    ]
```

---

### Q7

```python
def parse_transaction(line: str) -> dict | None:
    pattern = re.compile(
        r"(?P<txn_id>\S+)\s*\|\s*"
        r"(?P<type>\w+)\s*\|\s*"
        r"Rs\.(?P<amount>[\d.]+)\s*\|\s*"
        r"(?P<name>[^|]+?)\s*\|\s*"
        r"(?P<method>\w+)"
    )
    match = pattern.search(line)
    if not match:
        return None
    data = match.groupdict()
    data["amount"] = float(data["amount"])
    return data

line = "TXN20240315143022-001 | CREDIT | Rs.5000.00 | Aarav Sharma | UPI"
print(parse_transaction(line))
```

---

### Q8

```python
def extract_quantities(text: str) -> list[tuple[str, str]]:
    pattern = r"(\d+(?:\.\d+)?)(kg|g|L|ml|km)\b"
    return re.findall(pattern, text)
```

---

### Q9

```python
def extract_results(results: str) -> list[tuple[str, str]]:
    pattern = r"Name:\s+(.+?)\s+Total:\s+(\d+)/500"
    return re.findall(pattern, results, re.MULTILINE)

results = """
RESULT CARD
Name: Aarav Sharma     Total: 445/500
Name: Priya Patel      Total: 472/500
Name: Rohan Verma      Total: 398/500
"""
print(extract_results(results))
```

---

### Q10

```python
def check_password(password: str) -> list[str]:
    errors = []
    if len(password) < 8:
        errors.append("At least 8 characters required")
    if not re.search(r"[A-Z]", password):
        errors.append("At least one uppercase letter required")
    if not re.search(r"[a-z]", password):
        errors.append("At least one lowercase letter required")
    if not re.search(r"\d", password):
        errors.append("At least one digit required")
    if not re.search(r"[!@#$%^&*()]", password):
        errors.append("At least one special character required")
    return errors
```

---

### Q11

```python
def parse_logs(log_text: str) -> list[dict]:
    pattern = re.compile(
        r"(?P<timestamp>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s+"
        r"(?P<level>DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+"
        r"(?P<module>\S+)\s+"
        r"(?P<message>.+)"
    )
    records = []
    for line in log_text.strip().split("\n"):
        match = pattern.search(line.strip())
        if match:
            records.append(match.groupdict())

    from collections import Counter
    levels = Counter(r["level"] for r in records)
    print("Level counts:", dict(levels))
    return records
```

---

### Q12

```python
def strip_html(html: str) -> str:
    # Remove all HTML tags
    text = re.sub(r"<[^>]+>", "", html)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()
```

---

### Q13

```python
def parse_address(address: str) -> dict:
    result = {}

    flat_match = re.search(
        r"(?:Flat|House\s+No\.?)\s*([A-Za-z0-9/]+)", address, re.IGNORECASE
    )
    pin_match  = re.search(r"\b\d{6}\b", address)
    city_match = re.search(
        r"(?:Bangalore|Delhi|Mumbai|Hyderabad|Chennai|Pune)", address, re.IGNORECASE
    )

    if flat_match: result["flat"]    = flat_match.group(1)
    if pin_match:  result["pin"]     = pin_match.group()
    if city_match: result["city"]    = city_match.group()

    return result

addresses = [
    "Flat 4B, Prestige Towers, Koramangala, Bangalore - 560034",
    "42/A Indiranagar, Bangalore 560038",
    "House No. 15, MG Road, Delhi - 110001",
]
for addr in addresses:
    print(parse_address(addr))
```

---

### Q14

```python
def render(template: str, context: dict) -> str:
    def replace(match):
        key = match.group(1).strip()
        return str(context.get(key, f"[MISSING:{key}]"))

    return re.sub(r"\{\{(.+?)\}\}", replace, template)
```

---

### Q15

```python
def tokenise(code: str) -> list[tuple[str, str]]:
    KEYWORDS = {"if", "else", "elif", "for", "while", "return", "def",
                "class", "import", "from", "in", "not", "and", "or"}

    token_spec = [
        ("FLOAT",      r"\d+\.\d+"),
        ("INTEGER",    r"\d+"),
        ("STRING",     r'"[^"]*"|\'[^\']*\''),
        ("OPERATOR",   r"==|!=|>=|<=|[+\-*/=<>:]"),
        ("IDENTIFIER", r"[a-zA-Z_]\w*"),
        ("SKIP",       r"[\s,]+"),
    ]

    master_pattern = re.compile(
        "|".join(f"(?P<{name}>{pattern})" for name, pattern in token_spec)
    )

    tokens = []
    for match in master_pattern.finditer(code):
        kind  = match.lastgroup
        value = match.group()
        if kind == "SKIP":
            continue
        if kind == "IDENTIFIER" and value in KEYWORDS:
            kind = "KEYWORD"
        tokens.append((kind, value))

    return tokens

code = 'if score >= 88: grade = "A"'
for token in tokenise(code):
    print(token)
```

---

## 15. Summary and Key Takeaways

### The core functions

```python
re.search(pattern, text)        # find first match anywhere -- returns match or None
re.findall(pattern, text)       # return all matches as list of strings (or tuples)
re.finditer(pattern, text)      # return iterator of match objects
re.match(pattern, text)         # match at start only
re.fullmatch(pattern, text)     # match must cover entire string
re.sub(pattern, repl, text)     # find and replace
re.split(pattern, text)         # split on pattern
re.compile(pattern, flags)      # compile for repeated use
```

### The essential pattern vocabulary

```
.       any char except newline       \d   digit
^       start of string               \D   non-digit
$       end of string                 \w   word char (letter/digit/_)
\b      word boundary                 \W   non-word char
?       zero or one                   \s   whitespace
*       zero or more                  \S   non-whitespace
+       one or more                   [abc]  any of a, b, c
{n}     exactly n                     [^abc] not a, b, or c
{n,m}   n to m                        [a-z]  any lowercase letter
()      capture group                 (?:)   non-capturing group
|       alternation                   (?P<name>) named group
```

### The rules to remember

```
Always use raw strings:  r"\d+"  not  "\d+"
Test your patterns at:   regex101.com  or  pythex.org
Use re.compile() when you use the same pattern more than twice
Use non-capturing (?:) when you need grouping but not capturing
Add ? after quantifiers to make them lazy: *? +? {n,m}?
Use \b for word boundaries to avoid matching inside words
Use re.VERBOSE for complex patterns with comments
Never use re.match() thinking it searches -- it only matches at the start
```

---

*Made with care for Codeverra learners | codeverra.com*