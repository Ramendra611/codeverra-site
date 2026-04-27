---
title: "Object-Oriented Programming in Python  -  Masterclass"
description: "A comprehensive guide to OOP in Python  -  classes, objects, inheritance, encapsulation, and polymorphism."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Object-Oriented Programming in Python
### A Structured Guide from First Principles to Advanced Patterns

---

## Before We Begin - How This Guide is Organised

Most OOP tutorials throw syntax at you immediately. You copy the code, it works,
and you think you understand it. Two weeks later you cannot write a class from scratch.

This guide takes a different approach. We build understanding in three layers,
each one preparing you for the next.

---

### Part 1 -- Building Intuition (Beginner)

The goal of Part 1 is not to teach you syntax. It is to make OOP feel
obvious and natural -- something you already think about in real life,
just without the vocabulary.

| Section | What you will learn |
|---|---|
| 1 | Why OOP exists -- the problem it actually solves |
| 2 | Classes and Objects -- the blueprint and the building |
| 3 | `__init__` -- setting up a fresh object |
| 4 | Instance methods -- what an object can do |
| 5 | Class variables vs instance variables |
| 6 | Class methods and static methods |
| 7 | Custom exceptions using classes |

---

### Part 2 -- The Four Pillars (Intermediate)

Once you can build basic classes, Part 2 teaches the four principles that
make OOP genuinely powerful. Every serious Python codebase uses all four.

| Section | What you will learn |
|---|---|
| 8  | Encapsulation -- hiding internal details, `_` and `__` naming |
| 9  | Properties -- controlled access with `@property` |
| 10 | Inheritance -- building on existing classes, `super()` |
| 11 | Polymorphism -- same interface, different behaviour |
| 12 | Abstraction -- `ABC` and `@abstractmethod` |
| 13 | Magic (Dunder) Methods -- making your objects feel built-in |

---

### Part 3 -- Advanced OOP

Part 3 is for students going into library development, ML engineering,
or framework work. These are the patterns used inside Pandas, Scikit-learn,
Django, and FastAPI.

| Section | What you will learn |
|---|---|
| 14 | Multiple Inheritance and the MRO |
| 15 | Mixins -- composable, reusable behaviour |
| 16 | `__slots__` -- memory optimisation |
| 17 | Metaclasses -- classes that create classes |
| 18 | Dataclasses -- modern, clean class definitions |
| 19 | OOP in the Wild -- a peek at Pandas and Scikit-learn |

---

### Practice and Solutions

| Section | What you will find |
|---|---|
| 20 | Practice Questions (20 questions, Easy to Hard, grouped together) |
| 21 | Solutions (all 20, complete working code) |

---

> A note on pace:
> If you are new to OOP, read Part 1 slowly and do the practice questions
> for each section before moving on. Part 2 will make much more sense once
> Part 1 is genuinely comfortable, not just familiar.

---

## Table of Contents

1. [Why OOP Exists](#1-why-oop-exists)
2. [Classes and Objects](#2-classes-and-objects)
3. [The __init__ Method and Instance Attributes](#3-the-init-method-and-instance-attributes)
4. [Instance Methods](#4-instance-methods)
5. [Class Variables vs Instance Variables](#5-class-variables-vs-instance-variables)
6. [Class Methods and Static Methods](#6-class-methods-and-static-methods)
7. [Custom Exceptions](#7-custom-exceptions)
8. [Encapsulation](#8-encapsulation)
9. [Properties](#9-properties)
10. [Inheritance](#10-inheritance)
11. [Polymorphism](#11-polymorphism)
12. [Abstraction](#12-abstraction)
13. [Magic (Dunder) Methods](#13-magic-dunder-methods)
14. [Multiple Inheritance and MRO](#14-multiple-inheritance-and-mro)
15. [Mixins](#15-mixins)
16. [__slots__](#16-slots)
17. [Metaclasses](#17-metaclasses)
18. [Dataclasses](#18-dataclasses)
19. [OOP in the Wild](#19-oop-in-the-wild)
20. [Practice Questions](#20-practice-questions)
21. [Solutions](#21-solutions)
22. [What Comes Next](#22-what-comes-next)

---

# Part 1 -- Building Intuition

---

## 1. Why OOP Exists

Before writing a single line of OOP code, let us understand the problem it solves.

### The problem with procedural code at scale

Imagine you are building a system to manage students at a college in Pune.
With what you know so far, you might write this:

```python
# Procedural approach -- works fine for 1 student
student_name    = "Aarav Sharma"
student_roll    = 101
student_marks   = [88, 92, 75, 90, 85]
student_course  = "Computer Science"

def calculate_average(marks):
    return sum(marks) / len(marks)

def get_grade(average):
    if average >= 85:
        return "Distinction"
    elif average >= 60:
        return "First Class"
    else:
        return "Pass"

avg   = calculate_average(student_marks)
grade = get_grade(avg)
print(f"{student_name} -- Average: {avg:.1f}, Grade: {grade}")
```

This works perfectly for one student. Now add a second student:

```python
# Things start getting messy fast
student1_name   = "Aarav Sharma"
student1_roll   = 101
student1_marks  = [88, 92, 75, 90, 85]
student1_course = "Computer Science"

student2_name   = "Priya Patel"
student2_roll   = 102
student2_marks  = [95, 88, 91, 87, 93]
student2_course = "Electronics"

# For 500 students, this approach completely falls apart
# You end up with 2000 variables and no structure
```

What you really want is a way to say:
**"A student is a thing that has a name, roll number, marks, and a course.
And a student can calculate their own average and grade."**

That is exactly what OOP gives you.

### The OOP solution - bundle data and behaviour together

```python
class Student:
    def __init__(self, name, roll, marks, course):
        self.name   = name
        self.roll   = roll
        self.marks  = marks
        self.course = course

    def average(self):
        return sum(self.marks) / len(self.marks)

    def grade(self):
        avg = self.average()
        if avg >= 85:   return "Distinction"
        elif avg >= 60: return "First Class"
        else:           return "Pass"

# Create as many students as you need -- all organised, all consistent
s1 = Student("Aarav Sharma",  101, [88, 92, 75, 90, 85], "Computer Science")
s2 = Student("Priya Patel",   102, [95, 88, 91, 87, 93], "Electronics")
s3 = Student("Rohan Verma",   103, [65, 70, 68, 72, 60], "Mechanical")

for student in [s1, s2, s3]:
    print(f"{student.name} -- Avg: {student.average():.1f}, Grade: {student.grade()}")
```

```
Aarav Sharma  -- Avg: 86.0, Grade: Distinction
Priya Patel   -- Avg: 90.8, Grade: Distinction
Rohan Verma   -- Avg: 67.0, Grade: First Class
```

The data (name, roll, marks) and the behaviour (calculate average, get grade)
are now bundled together in one place. That bundle is called a **class**.

### The three core benefits

**1. Organisation:** Related data and functions live together, not scattered across the file.

**2. Reusability:** Define the Student class once, create a thousand Student objects.

**3. Maintainability:** If the grading logic changes, you update one method in one class.
  Not twenty functions spread across ten files.

---

## 2. Classes and Objects

### The blueprint and the building

A **class** is a blueprint. It defines what something looks like and what it can do.
An **object** is a specific instance created from that blueprint.

Think of it like this:

```
Class = Blueprint for a house
         (specifies: 3 bedrooms, 2 bathrooms, one kitchen)

Object = An actual house built from that blueprint
          House in Bandra     -- 3 bed, 2 bath, one kitchen, painted blue
          House in Koramangala -- 3 bed, 2 bath, one kitchen, painted white
          House in Salt Lake   -- 3 bed, 2 bath, one kitchen, painted yellow

Each house is unique (different colour, different address, different residents)
but all follow the same blueprint.
```

### Defining a class

```python
# The 'class' keyword defines a new blueprint
# Class names use PascalCase (capital first letter of each word)

class BankAccount:
    pass   # 'pass' means empty body -- valid Python, does nothing yet
```

### Creating objects (instances)

```python
# Creating an object is called "instantiation"
# You call the class like a function

account1 = BankAccount()
account2 = BankAccount()

# These are two separate objects -- completely independent
print(type(account1))           # <class '__main__.BankAccount'>
print(account1 is account2)     # False -- different objects in memory
```

### Every object knows its class

```python
print(isinstance(account1, BankAccount))   # True
print(type(account1).__name__)             # BankAccount
```

---

## 3. The init Method and Instance Attributes

Right now our `BankAccount` class creates empty objects. That is not very useful.
We need a way to set up each object with its own data when it is created.

That is what `__init__` is for.

### What __init__ does

`__init__` is called automatically every time you create a new object.
It is your chance to set up the object's initial state.

```python
class BankAccount:

    def __init__(self, account_holder, account_number, balance=0):
        """
        Called automatically when a new BankAccount is created.

        Parameters:
            account_holder (str): Name of the account holder
            account_number (str): Unique account number
            balance (float):      Starting balance (default 0)
        """
        # These are instance attributes -- each object gets its own copy
        self.account_holder  = account_holder
        self.account_number  = account_number
        self.balance         = balance

# Creating objects now initialises their data
acc1 = BankAccount("Aarav Sharma",  "SBI001234", 15000)
acc2 = BankAccount("Priya Patel",   "SBI005678", 50000)
acc3 = BankAccount("Rohan Verma",   "SBI009012")         # balance defaults to 0

# Each object has its own independent data
print(acc1.account_holder)   # Aarav Sharma
print(acc2.balance)          # 50000
print(acc3.balance)          # 0
```

### What is self?

`self` is the first parameter of every instance method, including `__init__`.
It refers to the specific object being worked on right now.

When you write:
```python
acc1 = BankAccount("Aarav Sharma", "SBI001234", 15000)
```

Python internally does:
```python
BankAccount.__init__(acc1, "Aarav Sharma", "SBI001234", 15000)
```

`self` is `acc1`. The dot notation `self.balance = balance` means
"set the `balance` attribute on THIS specific object".

```python
# You can name it anything, but 'self' is universal convention
# Never deviate from this convention in real code

class Demo:
    def __init__(this_object, value):   # 'this_object' works but never do this
        this_object.value = value
```

### Instance attributes -- each object has its own

Instance attributes are variables that belong to a specific object.
They are created by assigning to `self.something` inside `__init__`.

```python
class Student:

    def __init__(self, name, roll, course):
        # Each student object gets its own name, roll, and course
        self.name   = name
        self.roll   = roll
        self.course = course
        self.marks  = []          # starts empty for every new student
        self.active = True        # all students start active

# Two students -- completely independent attribute sets
s1 = Student("Sneha Iyer",   201, "Data Science")
s2 = Student("Karan Singh",  202, "Cybersecurity")

s1.marks.append(88)   # only s1's marks list is affected
print(s1.marks)       # [88]
print(s2.marks)       # []   -- s2 is unaffected
```

### Adding attributes outside __init__

You can add attributes to an object after creation, but this is generally
bad practice -- it makes the object's structure unpredictable.

```python
s1 = Student("Sneha Iyer", 201, "Data Science")

# Valid but not recommended -- other code won't know this attribute exists
s1.hometown = "Chennai"

# Preferred: define all attributes in __init__, even if they start as None
class Student:
    def __init__(self, name, roll, course):
        self.name     = name
        self.roll     = roll
        self.course   = course
        self.hometown = None    # known attribute, just not set yet
```

---

## 4. Instance Methods

Instance methods are functions defined inside a class that operate on a specific object.
They always take `self` as the first parameter.

```python
class BankAccount:

    def __init__(self, account_holder, account_number, balance=0):
        self.account_holder = account_holder
        self.account_number = account_number
        self.balance        = balance
        self.transactions   = []   # list to track all transactions

    def deposit(self, amount):
        """Add money to the account."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self.balance += amount
        self.transactions.append(("deposit", amount))
        print(f"Rs.{amount:,} deposited. New balance: Rs.{self.balance:,}")

    def withdraw(self, amount):
        """Remove money from the account if sufficient balance exists."""
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive.")
        if amount > self.balance:
            print(f"Insufficient balance. Available: Rs.{self.balance:,}")
            return False
        self.balance -= amount
        self.transactions.append(("withdrawal", amount))
        print(f"Rs.{amount:,} withdrawn. New balance: Rs.{self.balance:,}")
        return True

    def get_statement(self):
        """Print a summary of all transactions."""
        print(f"\n--- Statement for {self.account_holder} ---")
        print(f"Account: {self.account_number}")
        for txn_type, amount in self.transactions:
            symbol = "+" if txn_type == "deposit" else "-"
            print(f"  {symbol} Rs.{amount:,}  ({txn_type})")
        print(f"Current Balance: Rs.{self.balance:,}")
        print("-" * 40)

    def __str__(self):
        """String representation -- what print(account) shows."""
        return (f"BankAccount({self.account_holder}, "
                f"Acc: {self.account_number}, "
                f"Balance: Rs.{self.balance:,})")


# Using the methods
acc = BankAccount("Meera Nair", "HDFC00456", 10000)

acc.deposit(5000)
acc.deposit(2500)
acc.withdraw(3000)
acc.withdraw(20000)   # insufficient balance
acc.get_statement()

print(acc)   # calls __str__
```

```
Rs.5,000 deposited. New balance: Rs.15,000
Rs.2,500 deposited. New balance: Rs.17,500
Rs.3,000 withdrawn. New balance: Rs.14,500
Insufficient balance. Available: Rs.14,500

--- Statement for Meera Nair ---
Account: HDFC00456
  + Rs.5,000  (deposit)
  + Rs.2,500  (deposit)
  - Rs.3,000  (withdrawal)
Current Balance: Rs.14,500
----------------------------------------
BankAccount(Meera Nair, Acc: HDFC00456, Balance: Rs.14,500)
```

### Methods can call other methods

```python
class Student:

    def __init__(self, name, marks):
        self.name  = name
        self.marks = marks   # list of marks across 5 subjects

    def average(self):
        """Calculate average marks."""
        return sum(self.marks) / len(self.marks)

    def grade(self):
        """Determine grade based on average."""
        avg = self.average()   # calling another method using self
        if avg >= 85:   return "Distinction"
        elif avg >= 60: return "First Class"
        elif avg >= 40: return "Pass"
        else:           return "Fail"

    def report(self):
        """Print full report -- calls both average() and grade()."""
        print(f"Student : {self.name}")
        print(f"Marks   : {self.marks}")
        print(f"Average : {self.average():.1f}")
        print(f"Grade   : {self.grade()}")

s = Student("Arjun Kumar", [88, 92, 75, 90, 85])
s.report()
```

---

## 5. Class Variables vs Instance Variables

This is one of the most important and most misunderstood concepts in OOP.
Understanding the difference prevents some very subtle bugs.

### Instance variables -- belong to one object

Instance variables are set with `self.something` and are unique to each object.

```python
class Employee:
    def __init__(self, name, salary):
        self.name   = name    # instance variable -- unique to each Employee
        self.salary = salary  # instance variable -- unique to each Employee

e1 = Employee("Vikram Nair",   85000)
e2 = Employee("Ananya Sharma", 72000)

# Each employee has their own name and salary
print(e1.name)    # Vikram Nair
print(e2.salary)  # 72000
```

### Class variables -- shared across all objects

Class variables are defined directly inside the class body, outside any method.
All objects of that class share the same class variable.

```python
class Employee:

    # Class variables -- shared by ALL Employee objects
    company_name = "Codeverra Technologies"
    employee_count = 0
    ANNUAL_BONUS_RATE = 0.10   # 10% bonus, same for all

    def __init__(self, name, salary, department):
        # Instance variables -- unique to each Employee
        self.name       = name
        self.salary     = salary
        self.department = department

        # Modify the class variable to track how many employees exist
        Employee.employee_count += 1   # use class name, not self, for clarity

    def annual_bonus(self):
        """Calculate bonus using the shared class variable."""
        return self.salary * Employee.ANNUAL_BONUS_RATE

    def company_info(self):
        """Access class variable through self -- also works."""
        return f"{self.name} works at {self.company_name}"
        # self.company_name works but Employee.company_name is clearer


# Creating employees
e1 = Employee("Vikram Nair",   85000, "Engineering")
e2 = Employee("Ananya Sharma", 72000, "Product")
e3 = Employee("Suresh Kumar",  68000, "Sales")

print(Employee.employee_count)   # 3  -- class variable updated by all three
print(e1.employee_count)         # 3  -- accessible via instance too
print(e2.employee_count)         # 3  -- same value for everyone

print(e1.company_info())   # Vikram Nair works at Codeverra Technologies
print(e2.company_info())   # Ananya Sharma works at Codeverra Technologies

print(f"Vikram's bonus: Rs.{e1.annual_bonus():,}")   # Rs.8,500
print(f"Ananya's bonus: Rs.{e2.annual_bonus():,}")   # Rs.7,200
```

### The critical danger -- modifying class variables via self

```python
class Employee:
    company_name   = "Codeverra Technologies"
    employee_count = 0

    def __init__(self, name):
        self.name = name
        Employee.employee_count += 1

e1 = Employee("Vikram")
e2 = Employee("Ananya")

# DANGEROUS -- this does NOT modify the class variable
# It creates a NEW instance variable on e1 that shadows the class variable
e1.company_name = "New Company"

print(e1.company_name)     # "New Company"  -- e1's own instance variable
print(e2.company_name)     # "Codeverra Technologies"  -- still the class variable
print(Employee.company_name) # "Codeverra Technologies" -- class variable unchanged

# CORRECT way to update a class variable (affects all objects)
Employee.company_name = "Codeverra Pvt Ltd"
print(e1.company_name)   # still "New Company" -- e1 has its own instance variable now
print(e2.company_name)   # "Codeverra Pvt Ltd" -- uses the updated class variable
```

> Rule: Always modify class variables using the class name (`Employee.count += 1`),
> never via `self` (`self.count += 1`). The latter creates a shadowing instance variable.

---

## 6. Class Methods and Static Methods

Python gives you three types of methods. Knowing which to use is a mark of clean design.

### Type 1 -- Instance methods (what you have seen so far)

- First parameter is `self` -- the specific object
- Can access and modify instance attributes via `self`
- Most methods you write will be instance methods

```python
class Student:
    def __init__(self, name, marks):
        self.name  = name
        self.marks = marks

    def average(self):        # instance method
        return sum(self.marks) / len(self.marks)
```

### Type 2 -- Class methods (@classmethod)

- Decorated with `@classmethod`
- First parameter is `cls` -- the class itself, not any specific object
- Can access and modify class variables
- Common use: alternative constructors (different ways to create an object)

```python
class Student:

    # Class variable
    institution = "Codeverra Institute, Pune"

    def __init__(self, name, roll, marks):
        self.name  = name
        self.roll  = roll
        self.marks = marks

    @classmethod
    def from_csv_string(cls, csv_string):
        """
        Alternative constructor -- create a Student from a CSV line.
        Usage: Student.from_csv_string("Aarav,101,88,92,75,90,85")
        """
        parts  = csv_string.split(",")
        name   = parts[0].strip()
        roll   = int(parts[1].strip())
        marks  = [int(m.strip()) for m in parts[2:]]
        return cls(name, roll, marks)   # cls(...) is same as Student(...)

    @classmethod
    def from_dict(cls, data_dict):
        """Alternative constructor -- create from a dictionary."""
        return cls(data_dict["name"], data_dict["roll"], data_dict["marks"])

    @classmethod
    def set_institution(cls, new_name):
        """Modify the class variable for all students."""
        cls.institution = new_name

    def __str__(self):
        avg = sum(self.marks) / len(self.marks)
        return f"Student({self.name}, Roll: {self.roll}, Avg: {avg:.1f})"


# Using regular constructor
s1 = Student("Aarav Sharma", 101, [88, 92, 75, 90, 85])

# Using class method constructors -- much cleaner for real data pipelines
s2 = Student.from_csv_string("Priya Patel, 102, 95, 88, 91, 87, 93")
s3 = Student.from_dict({"name": "Rohan Verma", "roll": 103, "marks": [72, 68, 75, 70, 65]})

print(s1)   # Student(Aarav Sharma, Roll: 101, Avg: 86.0)
print(s2)   # Student(Priya Patel, Roll: 102, Avg: 90.8)
print(s3)   # Student(Rohan Verma, Roll: 103, Avg: 70.0)

print(Student.institution)        # Codeverra Institute, Pune
Student.set_institution("Codeverra Academy, Mumbai")
print(Student.institution)        # Codeverra Academy, Mumbai
print(s1.institution)             # Codeverra Academy, Mumbai (class var updated)
```

### Type 3 -- Static methods (@staticmethod)

- Decorated with `@staticmethod`
- No `self` or `cls` parameter
- Cannot access instance or class attributes -- completely independent
- Used for utility functions that logically belong to the class but do not
  need any object or class data

```python
class TemperatureConverter:
    """A utility class for temperature conversions."""

    @staticmethod
    def celsius_to_fahrenheit(c):
        """Convert Celsius to Fahrenheit."""
        return (c * 9/5) + 32

    @staticmethod
    def fahrenheit_to_celsius(f):
        """Convert Fahrenheit to Celsius."""
        return (f - 32) * 5/9

    @staticmethod
    def celsius_to_kelvin(c):
        """Convert Celsius to Kelvin."""
        return c + 273.15


# Static methods can be called on the class directly -- no object needed
print(TemperatureConverter.celsius_to_fahrenheit(37))   # 98.6  (body temp)
print(TemperatureConverter.celsius_to_fahrenheit(0))    # 32.0
print(TemperatureConverter.celsius_to_kelvin(100))      # 373.15

# Also callable via an instance, though the class version is more common
tc = TemperatureConverter()
print(tc.fahrenheit_to_celsius(98.6))   # 37.0
```

```python
class Student:

    institution = "Codeverra Institute"

    def __init__(self, name, marks):
        self.name  = name
        self.marks = marks

    def average(self):
        return sum(self.marks) / len(self.marks)

    @staticmethod
    def is_valid_mark(mark):
        """
        Check if a mark is in the valid range (0-100).
        Does not need any student data -- pure utility.
        """
        return 0 <= mark <= 100

    @staticmethod
    def letter_grade(average):
        """
        Convert a numeric average to a letter grade.
        Useful as a standalone utility -- does not need self or cls.
        """
        if average >= 85: return "A"
        if average >= 70: return "B"
        if average >= 55: return "C"
        if average >= 40: return "D"
        return "F"


# Validate marks before creating a student
raw_marks = [88, 105, 72, -5, 90]   # two invalid marks
valid_marks = [m for m in raw_marks if Student.is_valid_mark(m)]
print(valid_marks)   # [88, 72, 90]

s = Student("Divya Menon", valid_marks)
print(Student.letter_grade(s.average()))   # B
```

### Summary -- which type to use?

```
Instance method  --> needs to access or modify object data (use self)
Class method     --> needs to access or modify class data, OR
                     is an alternative constructor (use cls)
Static method    --> is a utility function related to the class
                     but does not need any data from it
```

---

## 7. Custom Exceptions

Before moving to Part 2, here is one very practical early use of classes:
building your own exception types.

### Why custom exceptions?

Python has built-in exceptions: `ValueError`, `TypeError`, `FileNotFoundError`.
But when you build an application, you want errors that describe YOUR domain.

A banking app should raise `InsufficientFundsError`, not a generic `ValueError`.
A course platform should raise `EnrollmentLimitError`, not a generic `Exception`.
Custom exceptions make your code self-documenting and easier to handle precisely.

### Creating a custom exception

All you need to do is inherit from `Exception` (or any built-in exception class).

```python
# Custom exceptions are just classes that inherit from Exception
class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the available balance."""
    pass


class InvalidAmountError(Exception):
    """Raised when a transaction amount is zero or negative."""
    pass


class AccountFrozenError(Exception):
    """Raised when a transaction is attempted on a frozen account."""
    pass
```

### Adding useful information to custom exceptions

```python
class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the available balance."""

    def __init__(self, requested, available):
        self.requested = requested
        self.available = available
        # Always call super().__init__() with a helpful message
        super().__init__(
            f"Cannot withdraw Rs.{requested:,}. "
            f"Available balance: Rs.{available:,}. "
            f"Shortfall: Rs.{requested - available:,}."
        )


class InvalidAmountError(Exception):
    """Raised when a transaction amount is zero or negative."""

    def __init__(self, amount, operation):
        self.amount    = amount
        self.operation = operation
        super().__init__(
            f"Invalid {operation} amount: Rs.{amount}. "
            f"Amount must be greater than zero."
        )


class AccountFrozenError(Exception):
    """Raised when a transaction is attempted on a frozen account."""

    def __init__(self, account_number):
        self.account_number = account_number
        super().__init__(
            f"Account {account_number} is frozen. "
            f"Contact your branch to resolve this."
        )
```

### Using custom exceptions in a class

```python
class BankAccount:

    def __init__(self, holder, account_number, balance=0):
        self.holder         = holder
        self.account_number = account_number
        self.balance        = balance
        self.is_frozen      = False

    def freeze(self):
        self.is_frozen = True
        print(f"Account {self.account_number} has been frozen.")

    def deposit(self, amount):
        if self.is_frozen:
            raise AccountFrozenError(self.account_number)
        if amount <= 0:
            raise InvalidAmountError(amount, "deposit")
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if self.is_frozen:
            raise AccountFrozenError(self.account_number)
        if amount <= 0:
            raise InvalidAmountError(amount, "withdrawal")
        if amount > self.balance:
            raise InsufficientFundsError(amount, self.balance)
        self.balance -= amount
        return self.balance


# Using the account with proper exception handling
acc = BankAccount("Aarav Sharma", "SBI001234", 10000)

# Test InsufficientFundsError
try:
    acc.withdraw(25000)
except InsufficientFundsError as e:
    print(f"Transaction failed: {e}")
    print(f"Requested: Rs.{e.requested:,}")
    print(f"Available: Rs.{e.available:,}")

# Test AccountFrozenError
acc.freeze()
try:
    acc.deposit(5000)
except AccountFrozenError as e:
    print(f"Transaction failed: {e}")

# Test InvalidAmountError
acc2 = BankAccount("Priya Patel", "HDFC005678", 50000)
try:
    acc2.deposit(-1000)
except InvalidAmountError as e:
    print(f"Transaction failed: {e}")
```

```
Transaction failed: Cannot withdraw Rs.25,000. Available balance: Rs.10,000. Shortfall: Rs.15,000.
Requested: Rs.25,000
Available: Rs.10,000
Account SBI001234 has been frozen.
Transaction failed: Account SBI001234 is frozen. Contact your branch to resolve this.
Transaction failed: Invalid deposit amount: Rs.-1000. Amount must be greater than zero.
```

### Exception hierarchy -- building related exceptions

```python
# Create a base exception for your entire application
class CodevenaError(Exception):
    """Base exception for all Codeverra application errors."""
    pass


# All domain-specific exceptions inherit from your base
class StudentError(CodevenaError):
    """Base for all student-related errors."""
    pass


class EnrollmentError(StudentError):
    """Raised when enrollment fails."""
    pass


class EnrollmentLimitError(EnrollmentError):
    """Raised when a course is full."""

    def __init__(self, course_name, limit):
        super().__init__(
            f"Course '{course_name}' is full. Maximum enrollment: {limit}."
        )


class PrerequisiteError(EnrollmentError):
    """Raised when prerequisite courses are not completed."""

    def __init__(self, course_name, missing):
        super().__init__(
            f"Cannot enroll in '{course_name}'. "
            f"Missing prerequisites: {', '.join(missing)}."
        )


# Now you can catch at different levels of specificity
try:
    raise PrerequisiteError("Machine Learning", ["Python Basics", "Statistics"])
except EnrollmentError as e:
    print(f"Enrollment failed: {e}")   # catches PrerequisiteError too
except StudentError as e:
    print(f"Student error: {e}")
except CodevenaError as e:
    print(f"Application error: {e}")
```

---

# Part 2 -- The Four Pillars

---

## 8. Encapsulation

Encapsulation means **bundling data and the methods that operate on it together,
and controlling what the outside world can access**.

Think of a TV remote. You press buttons and the TV changes channels.
You do not need to know about the infrared signals, the circuit board,
or how the microcontroller encodes the command. The internals are hidden.
You get a clean, simple interface.

That is encapsulation.

### Why it matters

Without encapsulation, any part of your code can reach into any object
and mess with its data directly:

```python
# Without encapsulation -- dangerous
acc = BankAccount("Aarav", "SBI001", 10000)
acc.balance = -999999   # nothing stops this -- corrupted state
acc.balance = "hello"   # also valid Python -- completely wrong type
```

With encapsulation, you control how data is accessed and modified.

### Python's naming conventions for access control

Python does not have true private variables like Java or C++.
Instead, it uses naming conventions that signal intent:

```
No underscore:    public    -- anyone can access and modify
Single underscore: _name   -- "internal use" -- technically accessible but
                              convention says "do not touch from outside"
Double underscore: __name  -- name-mangled -- harder to access from outside,
                              genuine discourage from external access
```

```python
class CricketPlayer:

    def __init__(self, name, team, runs, is_contracted):
        self.name           = name         # public -- access freely
        self.team           = team         # public
        self._runs          = runs         # protected -- internal use
        self.__is_contracted = is_contracted  # private -- name-mangled

    def get_runs(self):
        """Public method to access protected attribute."""
        return self._runs

    def is_available(self):
        """Public method to check private attribute."""
        return self.__is_contracted

player = CricketPlayer("Rohit Sharma", "Mumbai Indians", 9825, True)

# Public -- fine
print(player.name)            # Rohit Sharma
print(player.team)            # Mumbai Indians

# Protected -- accessible but signals "please do not"
print(player._runs)           # 9825  -- works but is bad practice

# Private -- name-mangled, harder to reach
# print(player.__is_contracted) # AttributeError!

# Python mangles the name to _ClassName__attribute
print(player._CricketPlayer__is_contracted)   # True -- but never do this

# Use the public methods instead
print(player.get_runs())      # 9825
print(player.is_available())  # True
```

### Name mangling in detail

```python
class BankAccount:

    def __init__(self, holder, balance):
        self.holder   = holder    # public
        self._log     = []        # protected -- internal transaction log
        self.__balance = balance  # private -- name mangled to _BankAccount__balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount          # accessed freely inside the class
            self._log.append(f"+{amount}")
        else:
            raise ValueError("Amount must be positive")

    def get_balance(self):
        """Public interface to read the private balance."""
        return self.__balance


acc = BankAccount("Priya Patel", 50000)
acc.deposit(10000)
print(acc.get_balance())   # 60000

# acc.__balance  -->  AttributeError
# acc._BankAccount__balance  -->  60000 (works but is a violation of intent)
```

---

## 9. Properties

The `@property` decorator is the Pythonic way to implement encapsulation.
It lets you control attribute access with getter, setter, and deleter methods
while keeping the clean `object.attribute` syntax from the caller's perspective.

### The problem @property solves

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius   # public -- anyone can set radius = -5

c = Circle(7)
c.radius = -10   # nothing stops this -- physically meaningless
```

You want to add validation but you do not want to break every line that
currently reads `c.radius` or writes `c.radius = 5`.

`@property` lets you add that validation without changing the interface.

```python
import math

class Circle:

    def __init__(self, radius):
        # Note: calls the setter below (not direct assignment)
        self.radius = radius

    @property
    def radius(self):
        """Getter -- called when you READ circle.radius"""
        return self.__radius

    @radius.setter
    def radius(self, value):
        """Setter -- called when you WRITE circle.radius = value"""
        if value <= 0:
            raise ValueError(f"Radius must be positive. Got: {value}")
        self.__radius = value   # store in private attribute

    @property
    def diameter(self):
        """Computed property -- no setter because it is derived."""
        return self.__radius * 2

    @property
    def area(self):
        """Computed property."""
        return round(math.pi * self.__radius ** 2, 4)

    @property
    def circumference(self):
        """Computed property."""
        return round(2 * math.pi * self.__radius, 4)


c = Circle(7)
print(c.radius)         # 7       -- calls the getter
print(c.diameter)       # 14      -- computed property
print(c.area)           # 153.938
print(c.circumference)  # 43.9823

c.radius = 10           # calls the setter -- validated
print(c.area)           # 314.1593

c.radius = -5           # ValueError: Radius must be positive. Got: -5

# diameter has no setter -- it is read-only
c.diameter = 20         # AttributeError: can't set attribute
```

### A more complete property example

```python
class Employee:

    # Class variable: valid department names
    VALID_DEPARTMENTS = {"Engineering", "Product", "Sales", "HR", "Marketing", "Finance"}

    def __init__(self, name, salary, department):
        # These all go through their setters for validation
        self.name       = name
        self.salary     = salary
        self.department = department

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Name must be a non-empty string.")
        self.__name = value.strip().title()   # clean and normalise

    @property
    def salary(self):
        return self.__salary

    @salary.setter
    def salary(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError("Salary must be a number.")
        if value < 15000:
            raise ValueError(f"Salary cannot be below Rs.15,000. Got: Rs.{value:,}")
        self.__salary = float(value)

    @salary.deleter
    def salary(self):
        """Called when you do: del employee.salary"""
        print(f"Salary record for {self.__name} has been cleared.")
        self.__salary = None

    @property
    def department(self):
        return self.__department

    @department.setter
    def department(self, value):
        if value not in Employee.VALID_DEPARTMENTS:
            raise ValueError(
                f"'{value}' is not a valid department. "
                f"Choose from: {sorted(Employee.VALID_DEPARTMENTS)}"
            )
        self.__department = value

    @property
    def annual_salary(self):
        """Read-only computed property."""
        if self.__salary is None:
            return None
        return self.__salary * 12

    def __str__(self):
        return (f"Employee({self.__name}, "
                f"Dept: {self.__department}, "
                f"Salary: Rs.{self.__salary:,.0f}/month)")


# All validation happens automatically through setters
emp = Employee("vikram nair", 85000, "Engineering")
print(emp)              # Employee(Vikram Nair, Dept: Engineering, Salary: Rs.85,000/month)
print(emp.annual_salary) # 1020000.0

emp.salary = 95000      # valid -- goes through setter
print(emp.salary)       # 95000.0

try:
    emp.salary = 5000   # invalid
except ValueError as e:
    print(e)            # Salary cannot be below Rs.15,000. Got: Rs.5,000

try:
    emp.department = "Accounts"  # invalid
except ValueError as e:
    print(e)

del emp.salary          # calls the deleter
print(emp.annual_salary) # None
```

## 10. Inheritance

Inheritance lets one class **acquire the attributes and methods of another class**.
It models the "is-a" relationship: a SavingsAccount IS-A BankAccount.
A Dog IS-AN Animal.

This eliminates duplication. Define common behaviour once in a parent class.
Let child classes inherit it and add only what is unique to them.

### Basic inheritance

```python
class Animal:
    """Parent class -- defines common behaviour for all animals."""

    def __init__(self, name, species, age):
        self.name    = name
        self.species = species
        self.age     = age

    def breathe(self):
        print(f"{self.name} is breathing.")

    def eat(self, food):
        print(f"{self.name} is eating {food}.")

    def describe(self):
        print(f"{self.name} is a {self.age}-year-old {self.species}.")


class Dog(Animal):
    """Child class -- inherits everything from Animal, adds dog-specific behaviour."""

    def __init__(self, name, age, breed):
        # Call the parent __init__ to set up the inherited attributes
        super().__init__(name, species="Dog", age=age)
        self.breed = breed   # dog-specific attribute

    def bark(self):
        print(f"{self.name} says: Woof!")

    def fetch(self, item):
        print(f"{self.name} fetched the {item}!")


class Cat(Animal):
    """Another child class of Animal."""

    def __init__(self, name, age, is_indoor):
        super().__init__(name, species="Cat", age=age)
        self.is_indoor = is_indoor

    def meow(self):
        print(f"{self.name} says: Meow!")

    def purr(self):
        print(f"{self.name} is purring...")


# Creating objects
tommy = Dog("Tommy",  3, "Labrador")
whiskers = Cat("Whiskers", 5, is_indoor=True)

# Inherited methods -- available without redefining
tommy.describe()         # Tommy is a 3-year-old Dog.
tommy.breathe()          # Tommy is breathing.
tommy.eat("chicken")     # Tommy is eating chicken.

# Dog-specific methods
tommy.bark()             # Tommy says: Woof!
tommy.fetch("ball")      # Tommy fetched the ball!

# Cat-specific methods
whiskers.meow()
whiskers.purr()
whiskers.describe()      # Whiskers is a 5-year-old Cat.

# isinstance() checks inheritance hierarchy
print(isinstance(tommy, Dog))     # True
print(isinstance(tommy, Animal))  # True  -- Dog IS-AN Animal
print(isinstance(tommy, Cat))     # False
```

### super() -- calling the parent class

`super()` gives you access to the parent class. Most commonly used in
`__init__` to initialise inherited attributes.

```python
class Vehicle:
    """Base class for all vehicles."""

    def __init__(self, make, model, year, fuel_type):
        self.make      = make
        self.model     = model
        self.year      = year
        self.fuel_type = fuel_type
        self.speed     = 0   # all vehicles start at rest

    def accelerate(self, amount):
        self.speed += amount
        print(f"{self.make} {self.model} accelerating to {self.speed} km/h")

    def brake(self, amount):
        self.speed = max(0, self.speed - amount)
        print(f"{self.make} {self.model} slowing to {self.speed} km/h")

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.fuel_type})"


class ElectricVehicle(Vehicle):
    """Electric vehicles -- inherits from Vehicle, adds battery management."""

    def __init__(self, make, model, year, battery_kwh, range_km):
        # Call Vehicle.__init__ for the shared attributes
        super().__init__(make, model, year, fuel_type="Electric")
        # Add EV-specific attributes
        self.battery_kwh    = battery_kwh
        self.range_km       = range_km
        self.charge_percent = 100   # starts fully charged

    def charge(self, percent):
        self.charge_percent = min(100, self.charge_percent + percent)
        print(f"{self.make} {self.model} charged to {self.charge_percent}%")

    def estimated_range(self):
        return self.range_km * (self.charge_percent / 100)

    def __str__(self):
        # Extend the parent's __str__ with EV-specific info
        base = super().__str__()
        return f"{base} | Battery: {self.battery_kwh}kWh | Range: {self.range_km}km"


class Tata_Nexon_EV(ElectricVehicle):
    """Specific model -- inherits from ElectricVehicle."""

    # Tata Nexon EV Long Range specs
    DEFAULT_BATTERY = 40.5   # kWh
    DEFAULT_RANGE   = 465    # km (claimed)

    def __init__(self, year, color):
        super().__init__(
            make="Tata", model="Nexon EV",
            year=year,
            battery_kwh=self.DEFAULT_BATTERY,
            range_km=self.DEFAULT_RANGE
        )
        self.color = color

    def __str__(self):
        return f"{super().__str__()} | Color: {self.color}"


# Using the hierarchy
nexon = Tata_Nexon_EV(2024, "Pristine White")
print(nexon)
nexon.accelerate(60)
nexon.accelerate(40)
nexon.brake(30)

print(f"Estimated remaining range: {nexon.estimated_range():.0f}km")

# All three are True -- full hierarchy
print(isinstance(nexon, Tata_Nexon_EV))    # True
print(isinstance(nexon, ElectricVehicle))  # True
print(isinstance(nexon, Vehicle))          # True
```

### Method overriding

A child class can redefine a method inherited from the parent.
When you call that method on a child object, Python uses the child's version.

```python
class Shape:
    """Base class for geometric shapes."""

    def __init__(self, colour="white"):
        self.colour = colour

    def area(self):
        """To be overridden by each specific shape."""
        raise NotImplementedError("Subclasses must implement area()")

    def describe(self):
        print(f"I am a {self.__class__.__name__} with area {self.area():.2f} sq units.")


class Rectangle(Shape):

    def __init__(self, length, width, colour="white"):
        super().__init__(colour)
        self.length = length
        self.width  = width

    def area(self):
        """Override parent's area() with rectangle-specific formula."""
        return self.length * self.width

    def perimeter(self):
        return 2 * (self.length + self.width)


class Circle(Shape):

    def __init__(self, radius, colour="white"):
        import math
        super().__init__(colour)
        self.radius = radius
        self._pi    = math.pi

    def area(self):
        """Override parent's area() with circle-specific formula."""
        return self._pi * self.radius ** 2


class Triangle(Shape):

    def __init__(self, base, height, colour="white"):
        super().__init__(colour)
        self.base   = base
        self.height = height

    def area(self):
        """Override parent's area() with triangle-specific formula."""
        return 0.5 * self.base * self.height


# Each shape uses its own area() method
r = Rectangle(8, 5)
c = Circle(7)
t = Triangle(6, 4)

r.describe()   # I am a Rectangle with area 40.00 sq units.
c.describe()   # I am a Circle with area 153.94 sq units.
t.describe()   # I am a Triangle with area 12.00 sq units.
```

---

## 11. Polymorphism

Polymorphism means **one interface, many implementations**.
The same method name works differently depending on which object you call it on.

You already saw this with `area()` above. The word "polymorphism" just gives
this pattern a name and makes it explicit that you are designing for it.

### Polymorphism through method overriding

```python
class PaymentGateway:
    """Base class for all payment methods."""

    def __init__(self, name):
        self.name = name

    def process_payment(self, amount):
        """Each subclass implements this differently."""
        raise NotImplementedError

    def refund(self, amount, reason):
        """Each subclass implements this differently."""
        raise NotImplementedError


class UPIPayment(PaymentGateway):

    def __init__(self, upi_id):
        super().__init__("UPI")
        self.upi_id = upi_id

    def process_payment(self, amount):
        print(f"Processing Rs.{amount:,} via UPI ({self.upi_id})")
        print(f"  Sending payment request to {self.upi_id}...")
        print(f"  Payment of Rs.{amount:,} successful via UPI.")
        return True

    def refund(self, amount, reason):
        print(f"Initiating UPI refund of Rs.{amount:,} to {self.upi_id}")
        print(f"  Reason: {reason}")
        print(f"  Refund will reflect in 1-3 business days.")


class NetBankingPayment(PaymentGateway):

    def __init__(self, bank_name, account_last4):
        super().__init__("Net Banking")
        self.bank_name      = bank_name
        self.account_last4  = account_last4

    def process_payment(self, amount):
        print(f"Processing Rs.{amount:,} via {self.bank_name} Net Banking")
        print(f"  Account ending: ****{self.account_last4}")
        print(f"  Payment of Rs.{amount:,} successful via Net Banking.")
        return True

    def refund(self, amount, reason):
        print(f"Initiating Net Banking refund of Rs.{amount:,}")
        print(f"  To: {self.bank_name} account ****{self.account_last4}")
        print(f"  Reason: {reason}")
        print(f"  Refund will reflect in 5-7 business days.")


class WalletPayment(PaymentGateway):

    def __init__(self, wallet_name, wallet_balance):
        super().__init__(wallet_name)
        self.wallet_balance = wallet_balance

    def process_payment(self, amount):
        if amount > self.wallet_balance:
            print(f"Insufficient wallet balance. Available: Rs.{self.wallet_balance:,}")
            return False
        self.wallet_balance -= amount
        print(f"Processing Rs.{amount:,} via {self.name} Wallet")
        print(f"  Remaining wallet balance: Rs.{self.wallet_balance:,}")
        return True

    def refund(self, amount, reason):
        self.wallet_balance += amount
        print(f"Rs.{amount:,} refunded to {self.name} Wallet")
        print(f"  New balance: Rs.{self.wallet_balance:,}")


# THE POWER OF POLYMORPHISM:
# This function works with ANY payment gateway -- present or future
def checkout(order_total, payment_method):
    """
    Process a payment -- does not care which gateway is used.
    All gateways have process_payment() -- polymorphism handles the rest.
    """
    print(f"\n--- Checkout: Rs.{order_total:,} ---")
    success = payment_method.process_payment(order_total)
    if success:
        print("Order confirmed!")
    else:
        print("Payment failed. Please try another method.")


# Create different payment methods
upi      = UPIPayment("aarav@okaxis")
netbank  = NetBankingPayment("HDFC Bank", "4521")
paytm    = WalletPayment("Paytm", 2000)

# Same function call -- completely different behaviour
checkout(1299, upi)
checkout(5499, netbank)
checkout(1299, paytm)
checkout(3500, paytm)   # insufficient balance

# Iterate over a mixed list of payment objects
print("\n--- All payment methods ---")
all_methods = [upi, netbank, paytm]
for method in all_methods:
    # process_payment is called on each -- Python picks the right version
    method.process_payment(100)
```

### Duck typing -- Python's informal polymorphism

Python does not require inheritance for polymorphism.
If an object has the method you need, it works. Period.
"If it walks like a duck and quacks like a duck, it is a duck."

```python
class Printer:
    def print_document(self, text):
        print(f"[Printer]: {text}")

class EmailSender:
    def print_document(self, text):
        print(f"[Email]: Sending '{text}' to inbox...")

class SMSService:
    def print_document(self, text):
        print(f"[SMS]: Sending '{text}' as SMS...")

# None of these inherit from a common base class
# But they all have print_document() -- duck typing makes them interchangeable
def distribute_report(report_text, *output_channels):
    for channel in output_channels:
        channel.print_document(report_text)

printer = Printer()
email   = EmailSender()
sms     = SMSService()

distribute_report("Q3 Sales Report", printer, email, sms)
```

---

## 12. Abstraction

Abstraction means **hiding the complexity and showing only what is necessary**.

You have already seen informal abstraction -- `raise NotImplementedError`
in a base class method. Python also has a formal mechanism: **Abstract Base Classes (ABCs)**.

An abstract class:
- Cannot be instantiated directly
- Forces subclasses to implement specified methods
- Acts as a contract: "anything that calls itself a PaymentGateway MUST have process_payment()"

```python
from abc import ABC, abstractmethod


class PaymentGateway(ABC):
    """
    Abstract base class for payment gateways.

    Any concrete payment gateway MUST implement:
    - process_payment(amount)
    - refund(amount, reason)
    - get_transaction_id()
    """

    def __init__(self, gateway_name):
        self.gateway_name = gateway_name
        self._transaction_history = []

    @abstractmethod
    def process_payment(self, amount):
        """Process a payment of the given amount."""
        pass   # subclasses must implement this

    @abstractmethod
    def refund(self, amount, reason):
        """Refund the given amount."""
        pass   # subclasses must implement this

    @abstractmethod
    def get_transaction_id(self):
        """Return the last transaction ID."""
        pass

    # Concrete method -- shared by all gateways, no need to override
    def get_history(self):
        """Return list of all transactions -- already implemented."""
        return self._transaction_history

    def add_to_history(self, record):
        self._transaction_history.append(record)


# Trying to instantiate the abstract class directly raises TypeError
try:
    gateway = PaymentGateway("Test")
except TypeError as e:
    print(f"Cannot instantiate: {e}")
    # TypeError: Can't instantiate abstract class PaymentGateway
    # with abstract methods get_transaction_id, process_payment, refund


class RazorpayGateway(PaymentGateway):
    """Concrete implementation using Razorpay."""

    def __init__(self, api_key):
        super().__init__("Razorpay")
        self.api_key         = api_key
        self._last_txn_id    = None
        self._txn_counter    = 1000

    def process_payment(self, amount):
        self._txn_counter    += 1
        self._last_txn_id    = f"pay_RZP{self._txn_counter}"
        record = {"txn_id": self._last_txn_id, "type": "payment", "amount": amount}
        self.add_to_history(record)
        print(f"Razorpay: Payment of Rs.{amount:,} processed. TXN: {self._last_txn_id}")
        return True

    def refund(self, amount, reason):
        self._txn_counter   += 1
        refund_id = f"rfnd_RZP{self._txn_counter}"
        record    = {"txn_id": refund_id, "type": "refund", "amount": amount}
        self.add_to_history(record)
        print(f"Razorpay: Refund of Rs.{amount:,} initiated. Reason: {reason}")

    def get_transaction_id(self):
        return self._last_txn_id


class PhonePeGateway(PaymentGateway):
    """Concrete implementation using PhonePe."""

    def __init__(self, merchant_id):
        super().__init__("PhonePe")
        self.merchant_id  = merchant_id
        self._last_txn_id = None
        self._txn_counter = 2000

    def process_payment(self, amount):
        self._txn_counter += 1
        self._last_txn_id  = f"PP{self._txn_counter}_{self.merchant_id}"
        record = {"txn_id": self._last_txn_id, "type": "payment", "amount": amount}
        self.add_to_history(record)
        print(f"PhonePe: Payment of Rs.{amount:,} processed. TXN: {self._last_txn_id}")
        return True

    def refund(self, amount, reason):
        self._txn_counter += 1
        refund_id = f"PP_R{self._txn_counter}"
        self.add_to_history({"txn_id": refund_id, "type": "refund", "amount": amount})
        print(f"PhonePe: Refund of Rs.{amount:,} initiated. TXN: {refund_id}")

    def get_transaction_id(self):
        return self._last_txn_id


# Both work through the same interface -- abstraction in action
rzp = RazorpayGateway(api_key="rzp_live_abc123")
php = PhonePeGateway(merchant_id="CODEVERRA")

rzp.process_payment(2499)
rzp.process_payment(1299)
rzp.refund(1299, "Customer returned item")

php.process_payment(5000)

print("\nRazorpay history:", rzp.get_history())
print("Last TXN:", rzp.get_transaction_id())

# issubclass and ABC
print(issubclass(RazorpayGateway, PaymentGateway))   # True
print(issubclass(PhonePeGateway, PaymentGateway))    # True
```

---

## 13. Magic (Dunder) Methods

Magic methods (also called dunder methods -- double underscore) let your
custom objects work with Python's built-in syntax and functions.

They are what makes `len(my_object)` work, or `obj1 + obj2`,
or `print(my_object)` give a meaningful output.

### __str__ and __repr__

```python
class Product:

    def __init__(self, name, price, category):
        self.name     = name
        self.price    = price
        self.category = category

    def __str__(self):
        """
        Called by print() and str() -- meant for end users.
        Should be readable and informative.
        """
        return f"{self.name} (Rs.{self.price:,}) -- {self.category}"

    def __repr__(self):
        """
        Called in the REPL and for debugging -- meant for developers.
        Should ideally be valid Python that recreates the object.
        """
        return (f"Product(name={self.name!r}, "
                f"price={self.price}, "
                f"category={self.category!r})")


p = Product("iPhone 15", 79900, "Electronics")

print(p)       # calls __str__: iPhone 15 (Rs.79,900) -- Electronics
repr(p)        # calls __repr__: Product(name='iPhone 15', price=79900, ...)

# In a list, Python uses __repr__
products = [Product("Book", 299, "Books"), Product("Pen", 15, "Stationery")]
print(products)   # uses __repr__ for each item
```

### __len__, __contains__, __getitem__

```python
class ShoppingCart:

    def __init__(self, customer_name):
        self.customer  = customer_name
        self._items    = []   # list of (product, quantity) tuples

    def add(self, product, quantity=1):
        self._items.append((product, quantity))

    def __len__(self):
        """Called by len(cart) -- returns number of items."""
        return len(self._items)

    def __contains__(self, product_name):
        """Called by 'x in cart' -- check if product is in cart."""
        return any(item[0].name == product_name for item in self._items)

    def __getitem__(self, index):
        """Called by cart[0], cart[1] -- index access."""
        return self._items[index]

    def __iter__(self):
        """Called by 'for item in cart' -- makes cart iterable."""
        return iter(self._items)

    def total(self):
        return sum(p.price * qty for p, qty in self._items)

    def __str__(self):
        lines = [f"Cart for {self.customer}:"]
        for product, qty in self._items:
            lines.append(f"  {product.name} x{qty} = Rs.{product.price * qty:,}")
        lines.append(f"  Total: Rs.{self.total():,}")
        return "\n".join(lines)


p1 = Product("Laptop",   65000, "Electronics")
p2 = Product("Mouse",      850, "Electronics")
p3 = Product("Python Book", 599, "Books")

cart = ShoppingCart("Aarav Sharma")
cart.add(p1, 1)
cart.add(p2, 2)
cart.add(p3, 3)

print(len(cart))             # 3   -- calls __len__
print("Laptop" in cart)      # True -- calls __contains__
print("TV" in cart)          # False
print(cart[0])               # first item -- calls __getitem__

for product, qty in cart:    # calls __iter__
    print(f"  {product.name}: {qty} unit(s)")

print(cart)                  # calls __str__
```

### Comparison dunder methods

```python
from functools import total_ordering

@total_ordering   # automatically generates all comparison methods from __eq__ and __lt__
class Student:

    def __init__(self, name, cgpa):
        self.name = name
        self.cgpa = cgpa

    def __eq__(self, other):
        """Called by == and !="""
        if not isinstance(other, Student):
            return NotImplemented
        return self.cgpa == other.cgpa

    def __lt__(self, other):
        """Called by <. @total_ordering derives <=, >, >= from this."""
        if not isinstance(other, Student):
            return NotImplemented
        return self.cgpa < other.cgpa

    def __str__(self):
        return f"{self.name} (CGPA: {self.cgpa})"


students = [
    Student("Aarav",  8.9),
    Student("Priya",  9.4),
    Student("Rohan",  7.8),
    Student("Sneha",  9.4),
    Student("Karan",  8.2),
]

# These all work because of our dunder methods
print(max(students))                     # Priya (CGPA: 9.4)
print(min(students))                     # Rohan (CGPA: 7.8)
sorted_students = sorted(students)
for s in sorted_students:
    print(s)

print(students[0] == students[1])        # False (8.9 != 9.4)
print(students[1] == students[3])        # True  (9.4 == 9.4)
print(students[0] < students[1])         # True  (8.9 < 9.4)
print(students[0] > students[4])         # True  (8.9 > 8.2)
```

### Arithmetic dunder methods

```python
class Vector:
    """2D vector for physics calculations."""

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        """Called by v1 + v2"""
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        """Called by v1 - v2"""
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        """Called by v * 3  (scalar multiplication)"""
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar):
        """Called by 3 * v  (right multiply -- Python tries this if left fails)"""
        return self.__mul__(scalar)

    def __abs__(self):
        """Called by abs(v) -- magnitude of the vector"""
        import math
        return math.sqrt(self.x**2 + self.y**2)

    def __neg__(self):
        """Called by -v -- negate the vector"""
        return Vector(-self.x, -self.y)

    def __bool__(self):
        """Called in boolean context -- zero vector is falsy"""
        return self.x != 0 or self.y != 0

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        return f"Vector(x={self.x}, y={self.y})"


v1 = Vector(3, 4)
v2 = Vector(1, 2)

print(v1 + v2)    # Vector(4, 6)
print(v1 - v2)    # Vector(2, 2)
print(v1 * 3)     # Vector(9, 12)
print(3 * v1)     # Vector(9, 12)  -- uses __rmul__
print(abs(v1))    # 5.0
print(-v1)        # Vector(-3, -4)
print(bool(Vector(0, 0)))   # False
print(bool(v1))             # True
```

### Context manager dunders -- __enter__ and __exit__

```python
class DatabaseConnection:
    """
    A database connection that automatically closes itself.
    Used with the 'with' statement.
    """

    def __init__(self, host, database):
        self.host     = host
        self.database = database
        self.connection = None

    def __enter__(self):
        """Called when entering the 'with' block -- set up the resource."""
        print(f"Connecting to {self.database} on {self.host}...")
        self.connection = f"CONN_{self.host}_{self.database}"   # simulated
        print("Connection established.")
        return self   # the 'as' variable in 'with ... as conn:' gets this

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Called when leaving the 'with' block -- clean up the resource.
        Even called if an exception was raised inside the block.

        exc_type, exc_val, exc_tb: exception info (None if no exception)
        Return True to suppress the exception, False to let it propagate.
        """
        print(f"Closing connection to {self.database}...")
        self.connection = None
        if exc_type:
            print(f"Exception occurred: {exc_val}")
            return False   # let the exception propagate
        print("Connection closed cleanly.")
        return False

    def query(self, sql):
        if not self.connection:
            raise RuntimeError("No active connection.")
        print(f"Executing: {sql}")
        return [{"id": 1, "name": "Aarav"}, {"id": 2, "name": "Priya"}]  # simulated


# The with statement calls __enter__ and __exit__ automatically
with DatabaseConnection("db.codeverra.com", "students_db") as conn:
    results = conn.query("SELECT * FROM students WHERE active = 1")
    for row in results:
        print(f"  {row}")
# __exit__ is called here automatically -- even if an exception occurred
```

---

# Part 3 -- Advanced OOP

---

## 14. Multiple Inheritance and MRO

Python allows a class to inherit from **more than one parent class**.
This is more powerful than single inheritance but requires understanding
how Python decides which method to use when multiple parents define it.

### Basic multiple inheritance

```python
class Flyable:
    """Mixin-style class: gives the ability to fly."""

    def fly(self):
        print(f"{self.__class__.__name__} is flying!")

    def land(self):
        print(f"{self.__class__.__name__} has landed.")


class Swimmable:
    """Mixin-style class: gives the ability to swim."""

    def swim(self):
        print(f"{self.__class__.__name__} is swimming!")

    def dive(self):
        print(f"{self.__class__.__name__} has dived.")


class Animal:
    def __init__(self, name):
        self.name = name

    def breathe(self):
        print(f"{self.name} is breathing.")


class Duck(Animal, Flyable, Swimmable):
    """Duck inherits from Animal, Flyable, and Swimmable."""

    def quack(self):
        print(f"{self.name} says: Quack!")


donald = Duck("Donald")
donald.breathe()   # from Animal
donald.fly()       # from Flyable
donald.swim()      # from Swimmable
donald.quack()     # Duck's own method

print(Duck.__mro__)   # shows the Method Resolution Order
```

### The Method Resolution Order (MRO)

When multiple parent classes define the same method, Python needs a rule
to decide which one to use. This rule is the **MRO** -- the order in which
Python searches through the class hierarchy.

Python uses the **C3 Linearisation** algorithm to compute the MRO.
For everyday use, remember this: **left to right, depth first, no class listed twice**.

```python
class A:
    def hello(self):
        print("Hello from A")

class B(A):
    def hello(self):
        print("Hello from B")

class C(A):
    def hello(self):
        print("Hello from C")

class D(B, C):
    pass

d = D()
d.hello()   # "Hello from B" -- B comes before C in D's definition

print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
# MRO: D --> B --> C --> A --> object

# Python searches in this exact order for any method
```

```
Visualising the diamond:

        A
       / \
      B   C
       \ /
        D

MRO: D, B, C, A, object
```

### super() in multiple inheritance

`super()` follows the MRO, not just "the parent class".

```python
class A:
    def __init__(self):
        print("A.__init__")
        super().__init__()   # follows MRO -- calls next in line

class B(A):
    def __init__(self):
        print("B.__init__")
        super().__init__()   # follows MRO -- calls C next, not A directly

class C(A):
    def __init__(self):
        print("C.__init__")
        super().__init__()   # follows MRO -- calls A next

class D(B, C):
    def __init__(self):
        print("D.__init__")
        super().__init__()   # starts the MRO chain

d = D()
# Output:
# D.__init__
# B.__init__
# C.__init__
# A.__init__
# Every class in the MRO gets called exactly once -- cooperative multiple inheritance
```

---

## 15. Mixins

A **Mixin** is a class designed to be mixed into other classes to add a specific
piece of functionality. Mixins:

- Are not meant to be instantiated on their own
- Do not define `__init__` (usually)
- Do one thing and do it well
- Are the Pythonic alternative to multiple inheritance soup

Think of them as plug-in features you can add to any class by including
them in the inheritance list.

```python
class LoggingMixin:
    """
    Mixin that adds logging capability to any class.
    Mix this into any class that needs to log its method calls.
    """

    def log(self, message, level="INFO"):
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{level}] {timestamp} [{self.__class__.__name__}] {message}")


class ValidationMixin:
    """
    Mixin that adds input validation helpers.
    """

    def validate_positive(self, value, field_name):
        if value <= 0:
            raise ValueError(f"{field_name} must be positive. Got: {value}")
        return value

    def validate_string(self, value, field_name, min_length=1):
        if not isinstance(value, str) or len(value.strip()) < min_length:
            raise ValueError(f"{field_name} must be a non-empty string.")
        return value.strip()

    def validate_range(self, value, field_name, min_val, max_val):
        if not (min_val <= value <= max_val):
            raise ValueError(
                f"{field_name} must be between {min_val} and {max_val}. Got: {value}"
            )
        return value


class SerializationMixin:
    """
    Mixin that adds JSON serialization capability.
    Assumes all attributes are stored in __dict__.
    """

    def to_dict(self):
        """Convert object to dictionary."""
        return {
            k: v for k, v in self.__dict__.items()
            if not k.startswith("_")   # skip private attributes
        }

    def to_json(self):
        """Convert object to JSON string."""
        import json
        return json.dumps(self.to_dict(), indent=2, default=str)


# Now mix these into real classes -- pick and choose what you need

class BankAccount(LoggingMixin, ValidationMixin, SerializationMixin):
    """A full-featured bank account using three mixins."""

    def __init__(self, holder, account_number, balance=0):
        self.holder         = self.validate_string(holder, "Account holder")
        self.account_number = account_number
        self.balance        = self.validate_positive(balance + 1, "Balance") - 1
        # balance can be 0, so we add 1 before validating positive, then subtract
        self.balance        = balance
        self.log(f"Account created for {self.holder} with balance Rs.{balance:,}")

    def deposit(self, amount):
        self.validate_positive(amount, "Deposit amount")
        self.balance += amount
        self.log(f"Deposited Rs.{amount:,}. New balance: Rs.{self.balance:,}")
        return self.balance

    def withdraw(self, amount):
        self.validate_positive(amount, "Withdrawal amount")
        if amount > self.balance:
            self.log(f"Withdrawal of Rs.{amount:,} failed -- insufficient funds.", "WARN")
            raise ValueError(f"Insufficient funds. Balance: Rs.{self.balance:,}")
        self.balance -= amount
        self.log(f"Withdrew Rs.{amount:,}. New balance: Rs.{self.balance:,}")
        return self.balance


class Student(LoggingMixin, ValidationMixin, SerializationMixin):
    """A student that also uses the three mixins."""

    def __init__(self, name, roll, cgpa):
        self.name = self.validate_string(name, "Student name")
        self.roll = roll
        self.cgpa = self.validate_range(cgpa, "CGPA", 0.0, 10.0)
        self.log(f"Student record created: {self.name} (Roll: {self.roll})")

    def update_cgpa(self, new_cgpa):
        self.cgpa = self.validate_range(new_cgpa, "CGPA", 0.0, 10.0)
        self.log(f"CGPA updated to {self.cgpa}")


# Using BankAccount with all three mixins
acc = BankAccount("Aarav Sharma", "SBI001234", 10000)
acc.deposit(5000)
acc.withdraw(3000)

print(acc.to_json())   # SerializationMixin gives us this

# Using Student with all three mixins
s = Student("Priya Patel", 102, 9.2)
s.update_cgpa(9.4)
print(s.to_dict())
```

---

## 16. __slots__

By default, Python stores instance attributes in a dictionary called `__dict__`.
This is flexible but uses more memory than necessary when you have thousands of objects.

`__slots__` replaces the `__dict__` with a fixed set of attribute slots,
reducing memory and slightly improving attribute access speed.

```python
import sys

# Without __slots__
class RegularPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# With __slots__
class SlottedPoint:
    __slots__ = ("x", "y")   # only these attributes are allowed

    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = RegularPoint(3, 4)
p2 = SlottedPoint(3, 4)

print(sys.getsizeof(p1.__dict__))   # ~232 bytes (the dict overhead)
print(hasattr(p2, "__dict__"))       # False -- no __dict__ for slotted objects

# Memory difference becomes significant at scale
regular_points = [RegularPoint(i, i) for i in range(100000)]
slotted_points = [SlottedPoint(i, i) for i in range(100000)]

# Slotted points use significantly less memory

# Restriction: cannot add attributes not in __slots__
try:
    p2.z = 5   # AttributeError: 'SlottedPoint' object has no attribute 'z'
except AttributeError as e:
    print(e)
```

```python
# Practical use: a GPS coordinate system tracking millions of points
class GPSCoordinate:
    """
    Tracks lat/long for a large number of delivery locations.
    __slots__ is important when you have 100,000+ objects.
    """

    __slots__ = ("latitude", "longitude", "timestamp", "label")

    def __init__(self, lat, lon, label=""):
        import datetime
        self.latitude  = lat
        self.longitude = lon
        self.timestamp = datetime.datetime.now()
        self.label     = label

    def distance_to(self, other):
        """Approximate distance in km using Haversine formula."""
        import math
        R     = 6371
        dlat  = math.radians(other.latitude  - self.latitude)
        dlon  = math.radians(other.longitude - self.longitude)
        a     = (math.sin(dlat/2)**2 +
                 math.cos(math.radians(self.latitude)) *
                 math.cos(math.radians(other.latitude)) *
                 math.sin(dlon/2)**2)
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    def __repr__(self):
        return f"GPS({self.latitude:.4f}, {self.longitude:.4f})"


mumbai    = GPSCoordinate(19.0760, 72.8777, "Mumbai")
bangalore = GPSCoordinate(12.9716, 77.5946, "Bangalore")

print(mumbai)
print(f"Distance Mumbai to Bangalore: {mumbai.distance_to(bangalore):.0f}km")
```

---

## 17. Metaclasses

A metaclass is a class whose instances are themselves classes.
In Python, `type` is the default metaclass -- it is what creates all classes.

This is advanced Python. You rarely need to write metaclasses.
But understanding them demystifies things like Django models, SQLAlchemy,
and the `ABC` mechanism.

```python
# type() with three arguments creates a new class dynamically
# type(name, bases, dict)
DynamicClass = type("DynamicClass", (object,), {"x": 42, "greet": lambda self: "Hello"})

obj = DynamicClass()
print(obj.x)        # 42
print(obj.greet())  # Hello

# Every class is an instance of type
print(type(int))    # <class 'type'>
print(type(str))    # <class 'type'>
print(type(DynamicClass))  # <class 'type'>
```

### Writing a custom metaclass

```python
class SingletonMeta(type):
    """
    A metaclass that makes any class using it a Singleton.
    A Singleton is a class that can only ever have ONE instance.

    This is how the pattern is used:
    class DatabasePool(metaclass=SingletonMeta):
        ...

    pool1 = DatabasePool()
    pool2 = DatabasePool()
    pool1 is pool2  -->  True  (same object, not two separate ones)
    """

    _instances = {}   # stores one instance per class

    def __call__(cls, *args, **kwargs):
        """
        __call__ on a metaclass is called when you do ClassName().
        We intercept it to return the existing instance if one exists.
        """
        if cls not in cls._instances:
            # First time -- create and store the instance
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class DatabasePool(metaclass=SingletonMeta):
    """Only one database pool should exist in the entire application."""

    def __init__(self, host, max_connections=10):
        self.host            = host
        self.max_connections = max_connections
        self.active_connections = 0
        print(f"DatabasePool created: {self.host}")

    def get_connection(self):
        if self.active_connections < self.max_connections:
            self.active_connections += 1
            return f"Connection #{self.active_connections}"
        raise RuntimeError("Connection pool exhausted")


pool1 = DatabasePool("db.codeverra.com", max_connections=5)
pool2 = DatabasePool("different-host.com")   # this argument is IGNORED

print(pool1 is pool2)     # True -- same object
print(pool1.host)         # db.codeverra.com
print(pool2.host)         # db.codeverra.com  (pool2 IS pool1)

conn = pool1.get_connection()
print(conn)               # Connection #1
```

### A validation metaclass

```python
class ValidatedMeta(type):
    """
    Metaclass that checks all method names follow snake_case convention.
    Useful for enforcing coding standards across a codebase.
    """

    def __new__(mcs, name, bases, namespace):
        for method_name in namespace:
            if method_name.startswith("_"):
                continue   # skip dunder and private methods
            if not method_name == method_name.lower():
                raise TypeError(
                    f"Method '{method_name}' in class '{name}' must be snake_case."
                )
        return super().__new__(mcs, name, bases, namespace)


class GoodClass(metaclass=ValidatedMeta):
    def calculate_total(self):   # valid snake_case
        pass

    def get_name(self):          # valid
        pass


try:
    class BadClass(metaclass=ValidatedMeta):
        def CalculateTotal(self):   # invalid -- raises TypeError
            pass
except TypeError as e:
    print(e)   # Method 'CalculateTotal' in class 'BadClass' must be snake_case.
```

---

## 18. Dataclasses

Dataclasses (introduced in Python 3.7) let you define classes that primarily
hold data with far less boilerplate. They automatically generate `__init__`,
`__repr__`, `__eq__`, and more.

```python
from dataclasses import dataclass, field, asdict, astuple
from typing import List


# Before dataclasses -- lots of boilerplate
class OldStudent:
    def __init__(self, name, roll, marks):
        self.name  = name
        self.roll  = roll
        self.marks = marks

    def __repr__(self):
        return f"OldStudent(name={self.name!r}, roll={self.roll}, marks={self.marks})"

    def __eq__(self, other):
        return (self.name, self.roll, self.marks) == (other.name, other.roll, other.marks)


# With dataclasses -- clean and concise
@dataclass
class Student:
    name:  str
    roll:  int
    marks: List[int] = field(default_factory=list)   # mutable default -- use field()

    # You can still add methods
    def average(self):
        return sum(self.marks) / len(self.marks) if self.marks else 0

    def grade(self):
        avg = self.average()
        if avg >= 85: return "Distinction"
        if avg >= 60: return "First Class"
        return "Pass"


# __init__, __repr__, __eq__ all generated automatically
s1 = Student("Aarav Sharma", 101, [88, 92, 75, 90, 85])
s2 = Student("Priya Patel",  102, [95, 88, 91, 87, 93])
s3 = Student("Aarav Sharma", 101, [88, 92, 75, 90, 85])

print(s1)           # Student(name='Aarav Sharma', roll=101, marks=[88, 92, 75, 90, 85])
print(s1 == s3)     # True  -- __eq__ compares all fields
print(s1 == s2)     # False

print(s1.average())  # 86.0
print(s1.grade())    # Distinction

# Convert to dict or tuple
print(asdict(s1))    # {'name': 'Aarav Sharma', 'roll': 101, 'marks': [...]}
print(astuple(s1))   # ('Aarav Sharma', 101, [88, 92, 75, 90, 85])
```

### Dataclass options

```python
from dataclasses import dataclass, field
import datetime


@dataclass(
    order=True,      # generate __lt__, __le__, __gt__, __ge__ based on field order
    frozen=True,     # make immutable -- generates __hash__, prevents attribute changes
)
class GeoPoint:
    """Immutable, comparable GPS coordinate."""
    latitude:  float
    longitude: float
    label:     str = ""

    def __post_init__(self):
        """Called after __init__ -- for validation."""
        if not (-90 <= self.latitude <= 90):
            raise ValueError(f"Invalid latitude: {self.latitude}")
        if not (-180 <= self.longitude <= 180):
            raise ValueError(f"Invalid longitude: {self.longitude}")


mumbai    = GeoPoint(19.0760, 72.8777, "Mumbai")
bangalore = GeoPoint(12.9716, 77.5946, "Bangalore")
delhi     = GeoPoint(28.6139, 77.2090, "Delhi")

# Sortable (by latitude first, then longitude, then label)
cities = [mumbai, bangalore, delhi]
print(sorted(cities))

# Hashable (because frozen=True)
city_set = {mumbai, bangalore, delhi}

# Immutable -- raises FrozenInstanceError
try:
    mumbai.latitude = 20.0
except Exception as e:
    print(f"Cannot modify frozen dataclass: {e}")
```

```python
# Dataclass with computed fields and post-init
@dataclass
class Order:
    product_name: str
    quantity:     int
    unit_price:   float
    discount_pct: float = 0.0
    order_id:     str   = field(default="", init=False)   # not in __init__
    total:        float = field(default=0.0, init=False)  # computed

    def __post_init__(self):
        import random
        # Generate order ID after regular init
        self.order_id = f"ORD{random.randint(10000, 99999)}"
        # Compute total
        subtotal    = self.quantity * self.unit_price
        discount    = subtotal * (self.discount_pct / 100)
        self.total  = round(subtotal - discount, 2)

    def __str__(self):
        return (f"Order {self.order_id}: {self.product_name} x{self.quantity} "
                f"@ Rs.{self.unit_price:,} "
                f"(Discount: {self.discount_pct}%) "
                f"= Rs.{self.total:,}")


o1 = Order("MacBook Pro", 1, 129900, discount_pct=5)
o2 = Order("Python Book",  3,    599, discount_pct=10)

print(o1)
print(o2)
```

---

## 19. OOP in the Wild

You have been using OOP without knowing it this entire time.
Every object you use in Python is an instance of some class.

```python
import pandas as pd
import numpy as np

# A DataFrame IS an object -- an instance of pd.DataFrame
df = pd.DataFrame({"city": ["Delhi", "Mumbai"], "population": [33, 20]})
print(type(df))            # <class 'pandas.core.frame.DataFrame'>
print(isinstance(df, pd.DataFrame))   # True

# .groupby() returns a GroupBy object
grp = df.groupby("city")
print(type(grp))           # <class 'pandas.core.groupby...DataFrameGroupBy'>

# .sum() is a method on that GroupBy object
result = grp.sum()
print(type(result))        # <class 'pandas.core.frame.DataFrame'>

# NumPy arrays are ndarray objects
arr = np.array([1, 2, 3])
print(type(arr))           # <class 'numpy.ndarray'>
print(arr.shape)           # (3,) -- a property on the ndarray class
print(arr.dtype)           # dtype('int64') -- another property
```

### How Scikit-learn uses OOP -- a teaser

Scikit-learn's entire API is built on two classes from the base module:
`BaseEstimator` and mixins like `TransformerMixin`, `ClassifierMixin`.

```python
# Every sklearn model follows this pattern:
# 1. fit(X, y)   -- learn from data
# 2. predict(X)  -- use what was learned
# 3. score(X, y) -- evaluate

from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
print(type(model))   # <class 'sklearn.linear_model._logistic.LogisticRegression'>

# LogisticRegression inherits from:
# LogisticRegression --> LinearClassifierMixin --> ClassifierMixin
#                    --> BaseEstimator
#
# ClassifierMixin provides: score()
# BaseEstimator provides:   get_params(), set_params()
# LogisticRegression provides: fit(), predict(), predict_proba()

# You can build your own sklearn-compatible transformer using the same pattern.
# That is covered in the Advanced OOP Applications document.
```

### The key insight

When you learned functions, you learned to bundle behaviour.
When you learn OOP, you learn to bundle **data + behaviour + state** together.

Every library you use -- Pandas, NumPy, Matplotlib, Scikit-learn, FastAPI, Django --
is built from classes following exactly the patterns in this guide.

Understanding OOP does not just help you write better code.
It helps you read and understand the tools you depend on.

---

## 20. Practice Questions

All questions are self-contained -- each one has the starter code or context you need.
Questions are ordered: Easy (1-7), Medium (8-14), Hard (15-20).

---

### Easy

**Q1 -- Your First Class**
Define a class `Rectangle` with:
- `__init__` that takes `length` and `width`
- `area()` method that returns length x width
- `perimeter()` method that returns 2 x (length + width)
- `is_square()` method that returns True if length equals width
- `__str__` that returns something like `"Rectangle(8 x 5)"`

Create three rectangles and print their area, perimeter, and whether they are squares.

```python
r1 = Rectangle(8, 5)
r2 = Rectangle(6, 6)
r3 = Rectangle(10, 3)
```

---

**Q2 -- Class Variables and Instance Variables**
Build a `CricketTeam` class that:
- Tracks the total number of teams created (class variable)
- Each team has a name, home city, and a list of players (instance variables)
- Has an `add_player(name)` method
- Has a `remove_player(name)` method
- Has a `show_squad()` method that prints all players

```python
# Create two teams, add players, and demonstrate the team counter
```

---

**Q3 -- Class Methods and Static Methods**
Build a `Temperature` class with:
- An instance variable `celsius`
- A `@property` that gives the temperature in Fahrenheit
- A `@classmethod` called `from_fahrenheit(f)` that creates a Temperature from a Fahrenheit value
- A `@staticmethod` called `is_fever(celsius)` that returns True if temp > 37.5

Test with: body temp (37.0 C), fever (39.2 C), boiling water (100 C), and create one from 98.6 F.

---

**Q4 -- Custom Exceptions**
Build an `ATM` class with a custom exception hierarchy:
- `ATMError(Exception)` -- base
- `InsufficientFundsError(ATMError)`
- `InvalidPINError(ATMError)`
- `DailyLimitExceededError(ATMError)`

The ATM should have a `withdraw(pin, amount)` method that raises the appropriate
exception for wrong PIN (correct PIN is 1234), insufficient balance, or exceeding
the daily limit of Rs.20,000.

---

**Q5 -- Properties with Validation**
Build a `StudentProfile` class where:
- `name` must be a non-empty string (setter validates and title-cases it)
- `age` must be between 15 and 30 (setter validates)
- `cgpa` must be between 0.0 and 10.0 (setter validates)
- `email` must contain "@" and end with a valid domain (setter validates)
- All are readable properties

---

**Q6 -- Dunder Methods**
Build a `Fraction` class (like Python's built-in `fractions.Fraction`) that:
- Stores numerator and denominator
- Reduces itself to lowest terms on creation (use GCD)
- Implements `+`, `-`, `*`, `/` between two Fraction objects
- Implements `==`, `<`, `>` for comparison
- Has a clean `__str__` (e.g. `"3/4"`) and `__repr__`

```python
f1 = Fraction(1, 2)
f2 = Fraction(1, 3)
print(f1 + f2)    # 5/6
print(f1 * f2)    # 1/6
print(f1 > f2)    # True
```

---

**Q7 -- Context Manager**
Build a `Timer` class that works as a context manager and measures the time
taken to execute the code inside the `with` block.

```python
import time

with Timer("Sorting 1 million numbers") as t:
    data = list(range(1000000, 0, -1))
    data.sort()

# Expected output:
# Starting: Sorting 1 million numbers
# Sorting 1 million numbers completed in 0.0842 seconds
```

---

### Medium

**Q8 -- Inheritance Chain**
Build a class hierarchy for an Indian bank:

```
BankAccount
    |-- SavingsAccount     (interest rate: 3.5% per year)
    |-- CurrentAccount     (no interest, overdraft limit of Rs.50,000)
    |-- FixedDeposit       (lock-in period in months, higher interest rate: 6.5%)
```

Each should inherit `deposit()` and `withdraw()` from `BankAccount` but
override behaviour where needed (e.g., `CurrentAccount.withdraw()` allows
going negative up to the overdraft limit, `FixedDeposit.withdraw()` raises
an error if the FD has not matured).

Add a `calculate_interest()` method to each.

---

**Q9 -- Polymorphism**
Build a reporting system for a school. Define:
- `Report` (abstract base class) with an `@abstractmethod generate()`
- `ProgressReport(Report)` -- generates a student's subject-wise marks
- `AttendanceReport(Report)` -- generates attendance percentage per month
- `FeeReport(Report)` -- generates fee payment status

Write a function `generate_all_reports(reports)` that takes a list of any
Report objects and calls `generate()` on each. Demonstrate that it works
with a mixed list.

---

**Q10 -- Mixin Composition**
Build three mixins:
- `TimestampMixin` -- adds `created_at` and `updated_at` attributes, and an `update()` method that refreshes `updated_at`
- `SoftDeleteMixin` -- adds `is_deleted` flag, a `delete()` method (sets flag, does not remove), and `restore()` method
- `AuditMixin` -- adds a `change_log` list that records every attribute change with timestamp

Then build a `Product` class that uses all three mixins, and demonstrate
each mixin's behaviour independently.

---

**Q11 -- Complete __dunder__ Suite**
Build a `Vector3D` class (3-dimensional vector) with:
- `__add__`, `__sub__`, `__mul__` (scalar), `__truediv__` (scalar)
- `__abs__` (magnitude), `__neg__`, `__bool__`
- `__eq__`, `__iter__` (iterate over x, y, z), `__len__` (always 3)
- `dot_product(other)`, `cross_product(other)`, `normalize()`
- `__str__` and `__repr__`

```python
v1 = Vector3D(1, 2, 3)
v2 = Vector3D(4, 5, 6)
print(v1 + v2)          # Vector3D(5, 7, 9)
print(v1.dot_product(v2))  # 32
print(list(v1))         # [1, 2, 3]
print(abs(v1))          # 3.7417...
```

---

**Q12 -- Abstract Base Class Design**
Design an abstract class `DataExporter` for a reporting tool that can export
data in multiple formats. It should enforce that all exporters implement:
- `connect()` -- establish connection to output
- `write(data)` -- write data to output
- `close()` -- close the connection

But provide concrete shared methods:
- `export(data)` -- orchestrates connect -> write -> close, with error handling
- `validate(data)` -- checks data is not empty

Implement `CSVExporter`, `JSONExporter`, and `ExcelExporter`.

---

**Q13 -- Dataclass with Full Features**
Model an IPL match result using a dataclass:
- `Team` dataclass: name, home_city, captain
- `MatchResult` dataclass: team1, team2, venue, date, winner, margin (runs or wickets), man_of_match
- `MatchResult` should be orderable by date
- Add a `@property` called `summary` that returns a one-line description
- Add a `__post_init__` that validates the winner is one of the two teams

Demonstrate creating 3 match results, sorting them by date, and printing summaries.

---

**Q14 -- MRO and Multiple Inheritance**
Build a system for Indian food delivery platform roles:

```
Person
    |-- Employee(Person)     -- has employee_id, department
    |-- Customer(Person)     -- has customer_id, address
    |-- DeliveryPartner(Employee)  -- has vehicle, rating
    |-- AdminUser(Employee)        -- has permissions list
    |-- PowerUser(Customer, Employee)  -- is both customer and employee
```

Write out the MRO for `PowerUser` before running the code. Verify with `PowerUser.__mro__`.
Each class should have a `describe()` method and the child should call `super().describe()`
to print the full chain.

---

### Hard

**Q15 -- Complete Banking System**
Build a complete banking system using everything from this guide:

Classes required:
- `BankError`, `InsufficientFundsError`, `AccountFrozenError`, `TransactionLimitError` (custom exceptions)
- `Transaction` (dataclass): transaction_id, type, amount, timestamp, balance_after
- `Account` (abstract base class): `deposit()`, `withdraw()`, `get_statement()` as abstract
- `SavingsAccount(Account)`: interest, minimum balance enforcement
- `CurrentAccount(Account)`: overdraft facility
- `AccountMixin` (LoggingMixin + SerializationMixin combined)
- `Bank`: manages multiple accounts, can transfer between them

The `Bank` class should:
- Open accounts and generate account numbers
- Transfer funds between accounts atomically (either both sides update or neither does)
- Print a full bank statement for any account
- Show total deposits across all accounts

---

**Q16 -- Singleton Metaclass + Configuration Manager**
Build a `ConfigManager` using the Singleton metaclass pattern that:
- Can only ever have one instance (config should be consistent across the app)
- Loads settings from a dictionary on first creation
- Supports nested key access: `config.get("database.host")`
- Supports dot-notation setting: `config.set("database.port", 5433)`
- Tracks which settings were changed since load (change log)
- Has a `reset()` class method that destroys the singleton and allows recreating

```python
config = ConfigManager({
    "database": {"host": "localhost", "port": 5432, "name": "codeverra"},
    "app": {"debug": True, "max_students": 1000},
})

config2 = ConfigManager({"other": "data"})  # returns same instance, ignores args
print(config is config2)   # True
print(config.get("database.host"))   # localhost
config.set("database.port", 5433)
```

---

**Q17 -- Descriptor Protocol**
A **descriptor** is an object that defines how attribute access works through
`__get__`, `__set__`, and `__delete__`. Properties are built on descriptors.

Build a `Validated` descriptor class that:
- Accepts a `validator` function and an optional `type_check`
- Raises `TypeError` if the value is the wrong type
- Raises `ValueError` if the validator returns False
- Can be used to define validated class attributes

```python
class Student:
    name  = Validated(str,   lambda v: len(v) >= 2,  "Name must be at least 2 chars")
    cgpa  = Validated(float, lambda v: 0.0 <= v <= 10.0, "CGPA must be 0-10")
    age   = Validated(int,   lambda v: 15 <= v <= 30, "Age must be 15-30")

s = Student()
s.name = "Aarav"   # valid
s.cgpa = 9.2       # valid
s.age  = 21        # valid
s.cgpa = 11.0      # ValueError: CGPA must be 0-10
```

---

**Q18 -- Observer Pattern**
The Observer pattern is a design pattern where objects (observers) subscribe
to events from another object (the subject) and are notified automatically
when the event occurs.

Build an event system for an e-commerce platform:
- `EventEmitter` -- base class for anything that emits events
- `Order(EventEmitter)` -- emits `order_placed`, `order_shipped`, `order_delivered`
- `NotificationService` -- observer that sends "notifications"
- `InventoryService` -- observer that updates stock
- `AnalyticsService` -- observer that logs events

When an order changes state, all subscribed services are notified automatically.

---

**Q19 -- Custom Collection Class**
Build a `StudentRoster` class that behaves like a collection:
- Supports `len(roster)`
- Supports `for student in roster:`
- Supports `roster[0]`, `roster["Aarav Sharma"]` (by name or index)
- Supports `"Aarav" in roster` (partial name match)
- Supports `roster + other_roster` (merge two rosters, no duplicates by roll)
- Supports `roster.sort(by="cgpa")` or `roster.sort(by="name")`
- Has `top_n(n)` returning top n students by CGPA
- Has `filter(department=...)` returning a new StudentRoster

---

**Q20 -- Full System Design**
Design and implement a Library Management System using all OOP concepts:

```
Hierarchy:
  LibraryItem (abstract)
      |-- Book
      |-- Journal
      |-- DVD

  Person (abstract)
      |-- Member
      |-- Librarian(Member)   -- has extra permissions

  Library
      |-- uses Singleton pattern (one library system)
      |-- manages items and members

Mixins:
  SearchableMixin  -- adds search() to Library
  ReportableMixin  -- adds generate_report() to Library

Custom Exceptions:
  LibraryError
      |-- ItemNotAvailableError
      |-- MembershipExpiredError
      |-- MaxBooksExceededError (members can borrow max 3 items)

Dataclasses:
  BorrowRecord: member_id, item_id, borrowed_date, due_date, returned_date

Features:
  - Members can borrow and return items
  - Librarians can add/remove items and members
  - Late fee calculation (Rs.5 per day after due date)
  - Search by title, author, or category
  - Report showing all currently borrowed items with due dates
```

---

## 21. Solutions

---

### Q1 -- Rectangle

```python
class Rectangle:

    def __init__(self, length, width):
        self.length = length
        self.width  = width

    def area(self):
        return self.length * self.width

    def perimeter(self):
        return 2 * (self.length + self.width)

    def is_square(self):
        return self.length == self.width

    def __str__(self):
        return f"Rectangle({self.length} x {self.width})"


r1 = Rectangle(8, 5)
r2 = Rectangle(6, 6)
r3 = Rectangle(10, 3)

for r in [r1, r2, r3]:
    print(f"{r}")
    print(f"  Area      : {r.area()}")
    print(f"  Perimeter : {r.perimeter()}")
    print(f"  Is square : {r.is_square()}")
    print()
```

---

### Q2 -- CricketTeam

```python
class CricketTeam:

    total_teams = 0   # class variable -- shared

    def __init__(self, name, home_city):
        self.name      = name
        self.home_city = home_city
        self.players   = []
        CricketTeam.total_teams += 1

    def add_player(self, name):
        if name not in self.players:
            self.players.append(name)
            print(f"{name} added to {self.name}.")
        else:
            print(f"{name} is already in {self.name}.")

    def remove_player(self, name):
        if name in self.players:
            self.players.remove(name)
            print(f"{name} removed from {self.name}.")
        else:
            print(f"{name} not found in {self.name}.")

    def show_squad(self):
        print(f"\n{self.name} Squad ({self.home_city}):")
        for i, player in enumerate(self.players, 1):
            print(f"  {i}. {player}")

    def __str__(self):
        return f"{self.name} ({self.home_city}) -- {len(self.players)} players"


mi  = CricketTeam("Mumbai Indians", "Mumbai")
csk = CricketTeam("Chennai Super Kings", "Chennai")

mi.add_player("Rohit Sharma")
mi.add_player("Jasprit Bumrah")
mi.add_player("Suryakumar Yadav")

csk.add_player("MS Dhoni")
csk.add_player("Ravindra Jadeja")
csk.add_player("Deepak Chahar")

mi.show_squad()
csk.show_squad()

print(f"\nTotal teams created: {CricketTeam.total_teams}")
```

---

### Q3 -- Temperature

```python
class Temperature:

    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @property
    def fahrenheit(self):
        return (self._celsius * 9/5) + 32

    @classmethod
    def from_fahrenheit(cls, f):
        celsius = (f - 32) * 5/9
        return cls(celsius)

    @staticmethod
    def is_fever(celsius):
        return celsius > 37.5

    def __str__(self):
        return f"{self._celsius:.1f}C / {self.fahrenheit:.1f}F"


temps = [
    Temperature(37.0),
    Temperature(39.2),
    Temperature(100.0),
    Temperature.from_fahrenheit(98.6),
]

for t in temps:
    fever_status = "FEVER" if Temperature.is_fever(t.celsius) else "Normal"
    print(f"{t} -- {fever_status}")
```

---

### Q4 -- ATM with Custom Exceptions

```python
class ATMError(Exception):
    pass

class InsufficientFundsError(ATMError):
    def __init__(self, requested, available):
        super().__init__(
            f"Insufficient funds. Requested: Rs.{requested:,}, Available: Rs.{available:,}"
        )

class InvalidPINError(ATMError):
    def __init__(self, attempts_left):
        super().__init__(f"Wrong PIN. {attempts_left} attempt(s) remaining.")

class DailyLimitExceededError(ATMError):
    def __init__(self, limit, already_withdrawn):
        super().__init__(
            f"Daily limit of Rs.{limit:,} exceeded. "
            f"Already withdrawn today: Rs.{already_withdrawn:,}."
        )


class ATM:

    CORRECT_PIN   = 1234
    DAILY_LIMIT   = 20000

    def __init__(self, account_holder, balance):
        self.account_holder  = account_holder
        self.balance         = balance
        self._withdrawn_today = 0
        self._pin_attempts   = 3

    def withdraw(self, pin, amount):
        # Validate PIN
        if pin != self.CORRECT_PIN:
            self._pin_attempts -= 1
            raise InvalidPINError(self._pin_attempts)

        # Reset PIN attempts on success
        self._pin_attempts = 3

        # Validate daily limit
        if self._withdrawn_today + amount > self.DAILY_LIMIT:
            raise DailyLimitExceededError(self.DAILY_LIMIT, self._withdrawn_today)

        # Validate balance
        if amount > self.balance:
            raise InsufficientFundsError(amount, self.balance)

        self.balance          -= amount
        self._withdrawn_today += amount
        print(f"Rs.{amount:,} dispensed. Remaining balance: Rs.{self.balance:,}")


atm = ATM("Aarav Sharma", 15000)

try: atm.withdraw(9999, 5000)           # Wrong PIN
except InvalidPINError as e: print(e)

try: atm.withdraw(1234, 5000)           # Valid
except ATMError as e: print(e)

try: atm.withdraw(1234, 18000)          # Daily limit
except DailyLimitExceededError as e: print(e)

try: atm.withdraw(1234, 12000)          # Insufficient balance
except InsufficientFundsError as e: print(e)
```

---

### Q5 -- StudentProfile with Properties

```python
class StudentProfile:

    def __init__(self, name, age, cgpa, email):
        self.name  = name
        self.age   = age
        self.cgpa  = cgpa
        self.email = email

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Name must be a non-empty string.")
        self.__name = value.strip().title()

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):
        if not isinstance(value, int) or not (15 <= value <= 30):
            raise ValueError("Age must be an integer between 15 and 30.")
        self.__age = value

    @property
    def cgpa(self):
        return self.__cgpa

    @cgpa.setter
    def cgpa(self, value):
        if not isinstance(value, (int, float)) or not (0.0 <= value <= 10.0):
            raise ValueError("CGPA must be a number between 0.0 and 10.0.")
        self.__cgpa = float(value)

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, value):
        if not isinstance(value, str) or "@" not in value:
            raise ValueError("Email must contain '@'.")
        domain = value.split("@")[-1]
        if "." not in domain:
            raise ValueError("Email domain must contain '.'.")
        self.__email = value.lower()

    def __str__(self):
        return (f"Student: {self.__name} | Age: {self.__age} | "
                f"CGPA: {self.__cgpa} | Email: {self.__email}")


s = StudentProfile("aarav sharma", 21, 8.9, "Aarav@Gmail.com")
print(s)

try: s.cgpa = 11.0
except ValueError as e: print(e)

try: s.email = "invalid-email"
except ValueError as e: print(e)
```

---

### Q6 -- Fraction

```python
import math

class Fraction:

    def __init__(self, numerator, denominator):
        if denominator == 0:
            raise ZeroDivisionError("Denominator cannot be zero.")
        # Reduce to lowest terms
        gcd = math.gcd(abs(numerator), abs(denominator))
        sign = -1 if (numerator < 0) != (denominator < 0) else 1
        self.numerator   = sign * abs(numerator) // gcd
        self.denominator = abs(denominator) // gcd

    def __add__(self, other):
        n = self.numerator * other.denominator + other.numerator * self.denominator
        d = self.denominator * other.denominator
        return Fraction(n, d)

    def __sub__(self, other):
        n = self.numerator * other.denominator - other.numerator * self.denominator
        d = self.denominator * other.denominator
        return Fraction(n, d)

    def __mul__(self, other):
        return Fraction(self.numerator * other.numerator,
                        self.denominator * other.denominator)

    def __truediv__(self, other):
        return Fraction(self.numerator * other.denominator,
                        self.denominator * other.numerator)

    def __eq__(self, other):
        return self.numerator == other.numerator and self.denominator == other.denominator

    def __lt__(self, other):
        return self.numerator * other.denominator < other.numerator * self.denominator

    def __gt__(self, other):
        return other < self

    def __str__(self):
        if self.denominator == 1:
            return str(self.numerator)
        return f"{self.numerator}/{self.denominator}"

    def __repr__(self):
        return f"Fraction({self.numerator}, {self.denominator})"


f1 = Fraction(1, 2)
f2 = Fraction(1, 3)

print(f1 + f2)     # 5/6
print(f1 - f2)     # 1/6
print(f1 * f2)     # 1/6
print(f1 / f2)     # 3/2
print(f1 > f2)     # True
print(f1 == Fraction(2, 4))  # True  (reduced)
```

---

### Q7 -- Timer Context Manager

```python
import time

class Timer:

    def __init__(self, label="Task"):
        self.label    = label
        self.start    = None
        self.elapsed  = None

    def __enter__(self):
        print(f"Starting: {self.label}")
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.time() - self.start
        print(f"{self.label} completed in {self.elapsed:.4f} seconds")
        return False   # do not suppress exceptions


with Timer("Sorting 1 million numbers") as t:
    data = list(range(1000000, 0, -1))
    data.sort()

print(f"Elapsed time stored: {t.elapsed:.4f}s")
```

---

### Q8 -- Banking Hierarchy

```python
from abc import ABC, abstractmethod
import datetime

class BankAccount(ABC):

    def __init__(self, holder, account_number, balance=0):
        self.holder         = holder
        self.account_number = account_number
        self._balance       = balance
        self._transactions  = []

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive.")
        self._balance += amount
        self._transactions.append(("deposit", amount, self._balance))
        print(f"Deposited Rs.{amount:,}. Balance: Rs.{self._balance:,}")

    @abstractmethod
    def withdraw(self, amount):
        pass

    @abstractmethod
    def calculate_interest(self):
        pass

    def get_statement(self):
        print(f"\n--- {self.__class__.__name__} Statement: {self.holder} ---")
        for txn_type, amount, bal in self._transactions:
            print(f"  {txn_type.capitalize():12} Rs.{amount:>10,}  Balance: Rs.{bal:,}")
        print(f"Current Balance: Rs.{self._balance:,}")


class SavingsAccount(BankAccount):

    INTEREST_RATE    = 0.035   # 3.5% per annum
    MINIMUM_BALANCE  = 1000

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Withdrawal must be positive.")
        if self._balance - amount < self.MINIMUM_BALANCE:
            raise ValueError(
                f"Cannot withdraw Rs.{amount:,}. "
                f"Minimum balance of Rs.{self.MINIMUM_BALANCE:,} must be maintained."
            )
        self._balance -= amount
        self._transactions.append(("withdrawal", amount, self._balance))
        print(f"Withdrawn Rs.{amount:,}. Balance: Rs.{self._balance:,}")

    def calculate_interest(self):
        interest = self._balance * self.INTEREST_RATE
        print(f"Annual interest at {self.INTEREST_RATE*100}%: Rs.{interest:,.2f}")
        return interest


class CurrentAccount(BankAccount):

    OVERDRAFT_LIMIT = 50000

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Withdrawal must be positive.")
        if self._balance - amount < -self.OVERDRAFT_LIMIT:
            raise ValueError(
                f"Exceeds overdraft limit of Rs.{self.OVERDRAFT_LIMIT:,}."
            )
        self._balance -= amount
        self._transactions.append(("withdrawal", amount, self._balance))
        status = "(overdraft)" if self._balance < 0 else ""
        print(f"Withdrawn Rs.{amount:,}. Balance: Rs.{self._balance:,} {status}")

    def calculate_interest(self):
        print("Current accounts do not earn interest.")
        return 0


class FixedDeposit(BankAccount):

    INTEREST_RATE = 0.065   # 6.5% per annum

    def __init__(self, holder, account_number, principal, months):
        super().__init__(holder, account_number, principal)
        self.months     = months
        self.maturity   = datetime.date.today() + datetime.timedelta(days=30*months)
        print(f"FD created. Maturity date: {self.maturity}")

    def withdraw(self, amount):
        if datetime.date.today() < self.maturity:
            raise ValueError(
                f"FD has not matured. Maturity date: {self.maturity}. "
                f"Premature withdrawal not allowed."
            )
        # After maturity, full withdrawal only
        print(f"FD matured. Withdrawing full amount: Rs.{self._balance:,}")
        withdrawn     = self._balance
        self._balance = 0
        return withdrawn

    def calculate_interest(self):
        interest = self._balance * self.INTEREST_RATE * (self.months / 12)
        print(f"FD interest ({self.months} months at {self.INTEREST_RATE*100}%): Rs.{interest:,.2f}")
        return interest


# Demonstrate
sa = SavingsAccount("Aarav Sharma", "SBI001", 10000)
sa.deposit(5000)
sa.withdraw(3000)
sa.calculate_interest()
sa.get_statement()

ca = CurrentAccount("Priya Patel", "HDFC001", 5000)
ca.deposit(2000)
ca.withdraw(10000)   # goes into overdraft
ca.get_statement()

fd = FixedDeposit("Rohan Verma", "SBI-FD-001", 100000, months=12)
fd.calculate_interest()
try:
    fd.withdraw(100000)   # not matured yet
except ValueError as e:
    print(e)
```

---

### Q9 -- Polymorphic Reporting System

```python
from abc import ABC, abstractmethod

class Report(ABC):

    @abstractmethod
    def generate(self):
        pass

    def header(self, title):
        print(f"\n{'='*40}")
        print(f"  {title}")
        print(f"{'='*40}")


class ProgressReport(Report):

    def __init__(self, student_name, subjects_marks):
        self.student_name   = student_name
        self.subjects_marks = subjects_marks   # dict: subject -> marks

    def generate(self):
        self.header(f"Progress Report: {self.student_name}")
        total = 0
        for subject, marks in self.subjects_marks.items():
            status = "Pass" if marks >= 40 else "Fail"
            print(f"  {subject:<15}: {marks:>3}/100  [{status}]")
            total += marks
        avg = total / len(self.subjects_marks)
        print(f"\n  Average: {avg:.1f}%")


class AttendanceReport(Report):

    def __init__(self, student_name, monthly_attendance):
        self.student_name        = student_name
        self.monthly_attendance  = monthly_attendance  # dict: month -> (attended, total)

    def generate(self):
        self.header(f"Attendance Report: {self.student_name}")
        total_attended = total_classes = 0
        for month, (attended, total) in self.monthly_attendance.items():
            pct = attended / total * 100
            total_attended += attended
            total_classes  += total
            print(f"  {month:<10}: {attended}/{total} ({pct:.1f}%)")
        overall = total_attended / total_classes * 100
        print(f"\n  Overall: {total_attended}/{total_classes} ({overall:.1f}%)")


class FeeReport(Report):

    def __init__(self, student_name, fee_records):
        self.student_name = student_name
        self.fee_records  = fee_records   # list of (month, amount, status)

    def generate(self):
        self.header(f"Fee Report: {self.student_name}")
        for month, amount, status in self.fee_records:
            icon = "Paid" if status == "paid" else "PENDING"
            print(f"  {month:<10}: Rs.{amount:>8,}  [{icon}]")
        paid    = sum(a for _, a, s in self.fee_records if s == "paid")
        pending = sum(a for _, a, s in self.fee_records if s != "paid")
        print(f"\n  Paid: Rs.{paid:,}  |  Pending: Rs.{pending:,}")


def generate_all_reports(reports):
    """Works with any Report subclass -- polymorphism in action."""
    for report in reports:
        report.generate()


reports = [
    ProgressReport("Aarav Sharma", {
        "Maths": 88, "Science": 92, "English": 75, "History": 80, "CS": 95
    }),
    AttendanceReport("Aarav Sharma", {
        "January": (22, 24), "February": (18, 20), "March": (25, 26)
    }),
    FeeReport("Aarav Sharma", [
        ("January", 15000, "paid"),
        ("February", 15000, "paid"),
        ("March",    15000, "pending"),
    ]),
]

generate_all_reports(reports)
```

---

### Q10 -- Mixin Composition

```python
import datetime

class TimestampMixin:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()

    def update(self):
        self.updated_at = datetime.datetime.now()
        print(f"Updated at {self.updated_at.strftime('%H:%M:%S')}")


class SoftDeleteMixin:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.is_deleted = False

    def delete(self):
        self.is_deleted = True
        print(f"{self.__class__.__name__} soft-deleted.")

    def restore(self):
        self.is_deleted = False
        print(f"{self.__class__.__name__} restored.")


class AuditMixin:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.change_log = []

    def __setattr__(self, name, value):
        if name not in ("change_log",) and hasattr(self, "change_log"):
            entry = {
                "field":     name,
                "new_value": value,
                "timestamp": datetime.datetime.now().strftime("%H:%M:%S")
            }
            self.change_log.append(entry)
        super().__setattr__(name, value)


class Product(TimestampMixin, SoftDeleteMixin, AuditMixin):

    def __init__(self, name, price, category):
        super().__init__()
        self.name     = name
        self.price    = price
        self.category = category

    def __str__(self):
        status = "DELETED" if self.is_deleted else "Active"
        return f"Product({self.name}, Rs.{self.price:,}, {self.category}) [{status}]"


p = Product("Laptop", 75000, "Electronics")
print(p)

p.price = 72000   # logged by AuditMixin
p.update()        # updates timestamp

p.delete()
print(p)

p.restore()
print(p)

print("\nChange log:")
for entry in p.change_log:
    print(f"  [{entry['timestamp']}] {entry['field']} = {entry['new_value']}")
```

---

### Q11 -- Vector3D

```python
import math

class Vector3D:

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def __add__(self, other):
        return Vector3D(self.x+other.x, self.y+other.y, self.z+other.z)

    def __sub__(self, other):
        return Vector3D(self.x-other.x, self.y-other.y, self.z-other.z)

    def __mul__(self, scalar):
        return Vector3D(self.x*scalar, self.y*scalar, self.z*scalar)

    def __rmul__(self, scalar):
        return self.__mul__(scalar)

    def __truediv__(self, scalar):
        return Vector3D(self.x/scalar, self.y/scalar, self.z/scalar)

    def __abs__(self):
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)

    def __neg__(self):
        return Vector3D(-self.x, -self.y, -self.z)

    def __bool__(self):
        return self.x != 0 or self.y != 0 or self.z != 0

    def __eq__(self, other):
        return (self.x, self.y, self.z) == (other.x, other.y, other.z)

    def __iter__(self):
        yield self.x
        yield self.y
        yield self.z

    def __len__(self):
        return 3

    def dot_product(self, other):
        return self.x*other.x + self.y*other.y + self.z*other.z

    def cross_product(self, other):
        return Vector3D(
            self.y*other.z - self.z*other.y,
            self.z*other.x - self.x*other.z,
            self.x*other.y - self.y*other.x
        )

    def normalize(self):
        magnitude = abs(self)
        if magnitude == 0:
            raise ValueError("Cannot normalize zero vector.")
        return self / magnitude

    def __str__(self):
        return f"Vector3D({self.x}, {self.y}, {self.z})"

    def __repr__(self):
        return f"Vector3D(x={self.x}, y={self.y}, z={self.z})"


v1 = Vector3D(1, 2, 3)
v2 = Vector3D(4, 5, 6)

print(v1 + v2)                 # Vector3D(5, 7, 9)
print(v1 - v2)                 # Vector3D(-3, -3, -3)
print(v1 * 3)                  # Vector3D(3, 6, 9)
print(3 * v1)                  # Vector3D(3, 6, 9)
print(abs(v1))                 # 3.7417...
print(v1.dot_product(v2))      # 32
print(v1.cross_product(v2))    # Vector3D(-3, 6, -3)
print(list(v1))                # [1, 2, 3]
print(len(v1))                 # 3
n = v1.normalize()
print(f"{abs(n):.6f}")         # 1.000000 (unit vector)
```

---

### Q12 through Q20

Questions 12 through 20 are design and implementation exercises.
The solutions involve 50 to 200+ lines each and are best attempted
as project-level work. Full reference solutions are available in the
Codeverra Advanced OOP Applications document.

**Guidance for Q12-Q20:**

- Q12: Start with the abstract `DataExporter` class, then implement each exporter independently
- Q13: Use `@dataclass(order=True)` and `field()` for computed fields
- Q14: Write out the MRO on paper first -- draw the diamond and trace the C3 algorithm
- Q15: Build bottom-up: exceptions first, then dataclasses, then account types, then Bank
- Q16: The key is `__call__` on the metaclass intercepting instance creation
- Q17: A descriptor is an object with `__get__` and `__set__` -- it lives as a class attribute
- Q18: Use a list of observer objects stored in the subject, iterate and call on event
- Q19: Implement dunder methods one at a time, testing each before adding the next
- Q20: This is a full project -- plan the class hierarchy on paper, then code bottom-up

---

## 22. What Comes Next

### What This Guide Covered

| Part | Concepts |
|---|---|
| Part 1 (Beginner) | Classes, objects, `__init__`, instance attributes, instance methods, class vs instance variables, class methods, static methods, custom exceptions |
| Part 2 (Intermediate) | Encapsulation (`_` and `__`), properties (`@property`), inheritance, `super()`, method overriding, polymorphism, duck typing, abstraction (`ABC`, `@abstractmethod`), magic methods |
| Part 3 (Advanced) | Multiple inheritance, MRO, mixins, `__slots__`, metaclasses, dataclasses, OOP in the wild |

### Recommended Next Step -- Advanced OOP Applications

A separate document covers OOP patterns used inside real Python libraries:

- Building your own Scikit-learn-compatible transformer using `BaseEstimator` and `TransformerMixin`
- Custom Pandas DataFrame accessors with `@pd.api.extensions.register_dataframe_accessor`
- Subclassing Matplotlib `Artist` for custom plot elements
- Django model metaclass -- how `class Meta` inside a model works
- FastAPI dependency injection using classes
- The Repository pattern for database access

### Other topics that build on OOP

- **Design Patterns** -- Singleton, Factory, Observer, Strategy, Decorator pattern (not the same as the Python decorator)
- **SOLID Principles** -- the five principles of good OOP design
- **Type checking with mypy** -- using type annotations on class attributes and methods
- **Testing OOP code** -- unittest, pytest, mocking objects with `unittest.mock`

---

> Final thought:
> OOP is not a set of syntax rules to memorise. It is a way of thinking about
> problems -- breaking them into things (objects) that have properties (attributes)
> and behaviour (methods), and defining how those things relate to each other.
>
> The best way to get comfortable is to model something real.
> Pick anything -- a cricket tournament, a college system, a food delivery app --
> and try to model it entirely with classes before looking at any reference.
> That exercise will teach you more than any tutorial.

---

*Made with care for Codeverra learners | codeverra.com*
