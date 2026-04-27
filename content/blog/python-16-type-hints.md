---
title: "Type Hints in Python"
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Type Hints in Python
### Writing Code That Explains Itself -- The typing Module and Beyond

---

## Before We Begin -- Why Type Hints Matter

Here is a function:

```python
def calculate_discount(price, discount, is_member):
    ...
```

What type is `price`? A float? An int? A string like `"1299"`?
What is `discount`? A percentage like `18.5`? Or a multiplier like `0.185`?
What does `is_member` do to the result?

You cannot tell without reading the implementation. In a codebase with
hundreds of functions, this adds up to an enormous cognitive load.

Now look at this:

```python
def calculate_discount(price: float, discount: float, is_member: bool) -> float:
    ...
```

You know exactly what each parameter expects and what the function returns.
Before reading a single line of the body.

Type hints are optional annotations that describe the expected types of
variables, function parameters, and return values. Python does not enforce
them at runtime -- your code runs exactly the same with or without them.
But they provide three major benefits:

**1. Documentation that cannot go stale.** Comments lie. Type hints are
part of the code and tools can check them.

**2. IDE intelligence.** VS Code, PyCharm, and other editors use type hints
to give you accurate autocomplete, catch typos, and show warnings before
you run anything.

**3. Static analysis with mypy.** A tool called `mypy` reads your type hints
and reports type errors before your code runs. It catches entire categories
of bugs -- passing a string where a list is expected, calling a method on
None, returning the wrong type -- all without executing the code.

Type hints become more valuable as your codebase grows. In a 50-line script
they are optional convenience. In a 50-file project with multiple developers
they are essential infrastructure.

---

## Table of Contents

1. [Basic Type Annotations](#1-basic-type-annotations)
2. [Function Annotations -- Parameters and Return Types](#2-function-annotations----parameters-and-return-types)
3. [Built-in Collection Types](#3-built-in-collection-types)
4. [Optional and Union](#4-optional-and-union)
5. [Any -- The Escape Hatch](#5-any----the-escape-hatch)
6. [Callable -- Annotating Functions as Arguments](#6-callable----annotating-functions-as-arguments)
7. [Type Aliases](#7-type-aliases)
8. [TypeVar -- Generic Functions](#8-typevar----generic-functions)
9. [Annotating Classes](#9-annotating-classes)
10. [TypedDict -- Typing Dictionaries](#10-typeddict----typing-dictionaries)
11. [Protocols -- Structural Typing](#11-protocols----structural-typing)
12. [Literal -- Specific Allowed Values](#12-literal----specific-allowed-values)
13. [Final -- Constants](#13-final----constants)
14. [Type Guards and Narrowing](#14-type-guards-and-narrowing)
15. [mypy -- Static Type Checking](#15-mypy----static-type-checking)
16. [Practical Patterns](#16-practical-patterns)
17. [Summary and Key Takeaways](#17-summary-and-key-takeaways)

---

## 1. Basic Type Annotations

### Variable annotations

```python
# Syntax: variable_name: type = value
name:    str   = "Aarav Sharma"
age:     int   = 21
cgpa:    float = 8.9
active:  bool  = True

# Annotation without assignment (declares intent)
student_id: int
# student_id is not yet assigned -- using it raises NameError
# but the annotation is recorded in __annotations__
```

### The annotation is a hint, not enforcement

```python
# Python does NOT enforce type hints at runtime
name: str = 42       # no error -- runs fine
name: str = [1,2,3]  # still no error

# The type checker (mypy) would flag these, not Python itself
```

---

## 2. Function Annotations -- Parameters and Return Types

```python
# Syntax: def func(param: type, param2: type) -> return_type:

def greet(name: str) -> str:
    return f"Namaste, {name}!"

def add(a: int, b: int) -> int:
    return a + b

def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def send_notification(user_id: int, message: str) -> None:
    """None means this function returns nothing (no return value)."""
    print(f"Sending to {user_id}: {message}")
```

### Inspecting annotations at runtime

```python
def calculate_gst(price: float, rate: float = 0.18) -> float:
    return round(price * (1 + rate), 2)

print(calculate_gst.__annotations__)
# {'price': <class 'float'>, 'rate': <class 'float'>, 'return': <class 'float'>}
```

### Default values with type hints

```python
def create_profile(
    name:       str,
    age:        int,
    city:       str  = "Bangalore",
    is_premium: bool = False,
) -> dict:
    return {
        "name":       name,
        "age":        age,
        "city":       city,
        "is_premium": is_premium,
    }
```

---

## 3. Built-in Collection Types

### Python 3.9+ -- use built-in types directly

From Python 3.9 onwards, you can use the built-in collection types
directly as generic types without importing from `typing`.

```python
# Python 3.9+
def process_marks(marks: list[int]) -> float:
    return sum(marks) / len(marks)

def get_city_populations() -> dict[str, int]:
    return {"Delhi": 32941000, "Mumbai": 20667656}

def unique_tags(items: list[str]) -> set[str]:
    return set(items)

def get_coordinates() -> tuple[float, float]:
    return (28.6139, 77.2090)

# Nested
def group_by_dept(employees: list[str]) -> dict[str, list[str]]:
    ...
```

### Python 3.8 and below -- import from typing

```python
# Python 3.8 and below
from typing import List, Dict, Set, Tuple, FrozenSet

def process_marks(marks: List[int]) -> float:
    return sum(marks) / len(marks)

def get_city_populations() -> Dict[str, int]:
    return {"Delhi": 32941000}

def unique_tags(items: List[str]) -> Set[str]:
    return set(items)

def get_coordinates() -> Tuple[float, float]:
    return (28.6139, 77.2090)
```

### Tuple -- fixed length vs variable length

```python
# Fixed-length tuple: Tuple[type1, type2, type3]
def get_student_record() -> tuple[str, int, float]:
    return ("Aarav", 101, 8.9)

# Variable-length tuple of a single type: tuple[int, ...]
# The ... (Ellipsis) means "zero or more of this type"
def get_scores() -> tuple[int, ...]:
    return (88, 92, 75, 90, 85)
```

---

## 4. Optional and Union

### Optional -- a value that might be None

`Optional[X]` means the value is either type X or None.
It is equivalent to `Union[X, None]`.

```python
from typing import Optional

# This function returns a string or None
def find_student(student_id: int, students: list[dict]) -> Optional[str]:
    for student in students:
        if student["id"] == student_id:
            return student["name"]
    return None   # not found

# Parameter that can be None
def greet(name: Optional[str] = None) -> str:
    if name is None:
        return "Hello, stranger!"
    return f"Namaste, {name}!"

# Python 3.10+ shorthand using | (pipe)
def find_student_v2(student_id: int) -> str | None:
    ...

def greet_v2(name: str | None = None) -> str:
    ...
```

### Always narrow Optional before using

```python
from typing import Optional

def get_discount(user: Optional[dict]) -> float:
    # mypy will warn if you use user without checking None first
    if user is None:
        return 0.0
    # After the None check, mypy knows user is dict here
    return 0.10 if user.get("is_premium") else 0.0
```

### Union -- one of several types

```python
from typing import Union

# A value that can be int OR float
def format_price(price: Union[int, float]) -> str:
    return f"Rs.{price:,.2f}"

# Python 3.10+ shorthand
def format_price_v2(price: int | float) -> str:
    return f"Rs.{price:,.2f}"

# Union with more types
def process_input(value: Union[str, int, list]) -> str:
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)
```

---

## 5. Any -- The Escape Hatch

`Any` is compatible with every type. Use it sparingly when you genuinely
cannot or do not want to type a value.

```python
from typing import Any

# A function that accepts anything
def log(value: Any) -> None:
    print(f"[LOG] {value}")

# A container of mixed types
def process_raw_data(data: list[Any]) -> list[str]:
    return [str(item) for item in data]
```

`Any` disables type checking for that variable. The type checker will not
warn you about anything you do with an `Any` value. Overusing it defeats
the purpose of type hints. Use it as a last resort.

---

## 6. Callable -- Annotating Functions as Arguments

When a function takes another function as an argument, use `Callable`.

```python
from typing import Callable

# Callable[[arg_types], return_type]
# Callable[[int, int], int] means: takes two ints, returns an int

def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

def add(x: int, y: int) -> int:
    return x + y

result = apply(add, 3, 4)   # 7

# A function that takes no arguments and returns a string
def get_greeting_fn() -> Callable[[], str]:
    def greet():
        return "Namaste!"
    return greet

# A callback that accepts anything and returns None
def run_with_callback(
    data:     list,
    callback: Callable[[list], None]
) -> None:
    callback(data)
```

---

## 7. Type Aliases

Give a complex type a short, readable name.

```python
from typing import TypeAlias   # Python 3.10+

# Simple alias
StudentName: TypeAlias = str
Marks:       TypeAlias = list[int]
StudentID:   TypeAlias = int

# Complex alias
StudentRecord: TypeAlias = dict[str, str | int | list[int]]
CityPopMap:    TypeAlias = dict[str, int]
Matrix:        TypeAlias = list[list[float]]

# Use the aliases in function signatures
def get_average(marks: Marks) -> float:
    return sum(marks) / len(marks)

def find_student(
    student_id: StudentID,
    students:   list[StudentRecord]
) -> StudentRecord | None:
    ...

# For Python 3.8/3.9 -- just assign directly
StudentName = str
Marks       = list[int]   # works but less explicit
```

---

## 8. TypeVar -- Generic Functions

TypeVar lets you write functions that work with any type while preserving
the type relationship between input and output.

```python
from typing import TypeVar

T = TypeVar("T")   # T can be any type

# A function where the return type is the same as the input type
def first_element(items: list[T]) -> T:
    return items[0]

# Type checker knows the return type based on input
result1 = first_element([1, 2, 3])       # result1 is int
result2 = first_element(["a", "b"])      # result2 is str
result3 = first_element([1.0, 2.0])      # result3 is float

# Constrained TypeVar -- only specific types allowed
Number = TypeVar("Number", int, float)

def double(value: Number) -> Number:
    return value * 2

double(5)      # valid -- int
double(3.14)   # valid -- float
double("hi")   # type error -- str not allowed
```

---

## 9. Annotating Classes

```python
from typing import Optional, ClassVar

class Student:
    # ClassVar -- belongs to the class, not instances
    institution: ClassVar[str] = "Codeverra Institute"
    _count:      ClassVar[int] = 0

    # Instance variables annotated in __init__
    def __init__(
        self,
        name:    str,
        roll:    int,
        cgpa:    float,
        courses: list[str] | None = None,
    ) -> None:
        self.name:    str        = name
        self.roll:    int        = roll
        self.cgpa:    float      = cgpa
        self.courses: list[str]  = courses or []
        Student._count += 1

    def average_marks(self, marks: list[int]) -> float:
        return sum(marks) / len(marks)

    def add_course(self, course: str) -> None:
        self.courses.append(course)

    def get_summary(self) -> dict[str, str | int | float]:
        return {
            "name":    self.name,
            "roll":    self.roll,
            "cgpa":    self.cgpa,
        }

    @classmethod
    def get_count(cls) -> int:
        return cls._count

    @staticmethod
    def is_valid_cgpa(cgpa: float) -> bool:
        return 0.0 <= cgpa <= 10.0
```

### __init__ with no return type

`__init__` always returns `None`. Annotate it as `-> None` or omit the
return annotation -- both are acceptable.

---

## 10. TypedDict -- Typing Dictionaries

When a dictionary always has specific keys with specific types, use
`TypedDict` to document and check its structure.

```python
from typing import TypedDict, NotRequired   # NotRequired: Python 3.11+

class StudentRecord(TypedDict):
    name:    str
    roll:    int
    cgpa:    float
    city:    str

class OrderItem(TypedDict):
    product:  str
    quantity: int
    price:    float
    discount: NotRequired[float]   # this key is optional

# Usage
student: StudentRecord = {
    "name": "Aarav Sharma",
    "roll": 101,
    "cgpa": 8.9,
    "city": "Bangalore",
}

# Type checker will flag missing keys or wrong types
bad_student: StudentRecord = {
    "name": "Priya",
    "roll": "102",   # type error -- should be int
    "cgpa": 9.1,
    # city is missing -- type error
}

# Functions with TypedDict
def get_student_name(student: StudentRecord) -> str:
    return student["name"]

def process_order_items(items: list[OrderItem]) -> float:
    return sum(item["quantity"] * item["price"] for item in items)
```

---

## 11. Protocols -- Structural Typing

A Protocol defines an interface -- a set of methods an object must have.
Any class that has those methods satisfies the Protocol, regardless of
whether it explicitly inherits from it. This is called structural subtyping
or duck typing with type safety.

```python
from typing import Protocol, runtime_checkable

# Define the interface
class Printable(Protocol):
    def print_summary(self) -> str:
        ...   # the ... means "required but not implemented here"

class Serializable(Protocol):
    def to_dict(self) -> dict:
        ...

    def to_json(self) -> str:
        ...

# These classes do NOT inherit from Printable or Serializable
# but they satisfy the protocol by having the required methods

class Student:
    def __init__(self, name: str, cgpa: float):
        self.name = name
        self.cgpa = cgpa

    def print_summary(self) -> str:   # satisfies Printable
        return f"Student: {self.name} ({self.cgpa})"

class Product:
    def __init__(self, name: str, price: float):
        self.name  = name
        self.price = price

    def print_summary(self) -> str:   # also satisfies Printable
        return f"Product: {self.name} @ Rs.{self.price}"

# This function works with ANY Printable -- structural duck typing
def display(item: Printable) -> None:
    print(item.print_summary())

display(Student("Aarav", 8.9))      # valid
display(Product("Laptop", 65000))   # also valid

# @runtime_checkable lets you use isinstance() with Protocol
@runtime_checkable
class HasName(Protocol):
    name: str

class City:
    def __init__(self, name: str):
        self.name = name

print(isinstance(City("Delhi"), HasName))   # True
```

---

## 12. Literal -- Specific Allowed Values

`Literal` constrains a value to a specific set of allowed values.

```python
from typing import Literal

# Only "asc" or "desc" are valid
def sort_students(
    students:  list[dict],
    order:     Literal["asc", "desc"] = "asc"
) -> list[dict]:
    reverse = (order == "desc")
    return sorted(students, key=lambda s: s["name"], reverse=reverse)

# Only these specific integers
def set_log_level(level: Literal[10, 20, 30, 40, 50]) -> None:
    import logging
    logging.getLogger().setLevel(level)

# Status strings
OrderStatus = Literal["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"]

def update_status(order_id: int, status: OrderStatus) -> None:
    print(f"Order {order_id} status: {status}")

update_status(1, "Shipped")     # valid
update_status(1, "Processing")  # type error -- not in Literal
```

---

## 13. Final -- Constants

`Final` marks a variable as a constant that should not be reassigned.

```python
from typing import Final

# Module-level constants
MAX_STUDENTS:  Final = 500
DEFAULT_CITY:  Final[str] = "Bangalore"
GST_RATE:      Final[float] = 0.18
API_VERSION:   Final = "v2"

# In a class
class Config:
    MAX_RETRIES:  Final = 3
    BASE_URL:     Final[str] = "https://api.codeverra.com"
    DEBUG:        Final[bool] = False

# Type checker will warn if you try to reassign
MAX_STUDENTS = 600    # type error -- cannot reassign Final
```

---

## 14. Type Guards and Narrowing

Type narrowing is when the type checker understands that within a specific
code block, a variable has a more specific type.

```python
from typing import Union

def process(value: Union[str, int, list]) -> str:
    # After isinstance check, type is narrowed
    if isinstance(value, str):
        return value.upper()      # type checker knows value is str here
    elif isinstance(value, int):
        return str(value * 2)     # type checker knows value is int here
    else:
        return ", ".join(str(v) for v in value)  # type checker knows: list

# None narrowing
from typing import Optional

def get_name_length(name: Optional[str]) -> int:
    if name is None:
        return 0
    # After the None check, type checker knows name is str here
    return len(name)    # .upper() and len() now work without warnings
```

### TypeGuard -- custom type narrowing functions

```python
from typing import TypeGuard

def is_string_list(val: list) -> TypeGuard[list[str]]:
    """Returns True if val is a list where all items are strings."""
    return all(isinstance(x, str) for x in val)

def process_names(data: list) -> None:
    if is_string_list(data):
        # type checker knows data is list[str] here
        for name in data:
            print(name.upper())   # .upper() is valid -- name is str
```

---

## 15. mypy -- Static Type Checking

mypy is the standard static type checker for Python. It reads your
type annotations and reports errors without running your code.

### Installation and basic use

```bash
pip install mypy

# Check a single file
mypy main.py

# Check an entire directory
mypy my_project/

# More strict checking
mypy --strict main.py
```

### Understanding mypy output

```python
# example.py
def greet(name: str) -> str:
    return f"Namaste, {name}!"

greet(42)   # passing int where str expected
```

```bash
$ mypy example.py
example.py:4: error: Argument 1 to "greet" has incompatible type "int"; expected "str"
Found 1 error in 1 file (checked 1 source file)
```

### Common mypy errors and fixes

```python
# Error: Item "None" of "str | None" has no attribute "upper"
def process(name: str | None) -> str:
    return name.upper()   # mypy error -- name might be None

# Fix: narrow the type first
def process(name: str | None) -> str:
    if name is None:
        return ""
    return name.upper()   # safe -- name is str here


# Error: Incompatible return value type
def get_count() -> int:
    return "five"   # mypy error -- returning str, not int

# Fix: return correct type
def get_count() -> int:
    return 5


# Error: Cannot infer type of "result"
result = []           # mypy: need type annotation
result.append(1)

# Fix: annotate
result: list[int] = []
result.append(1)
```

### mypy configuration -- mypy.ini

```ini
# mypy.ini (in project root)
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
ignore_missing_imports = True

# Per-module overrides
[mypy-pandas.*]
ignore_missing_imports = True

[mypy-numpy.*]
ignore_missing_imports = True
```

### Gradual typing -- adding types incrementally

You do not need to type everything at once. mypy works with partially
typed codebases. Start with the most important functions and add more
annotations over time.

```python
# Ignore a specific line
result = get_data()  # type: ignore

# Ignore a specific error
result = get_data()  # type: ignore[assignment]
```

---

## 16. Practical Patterns

### Pattern 1 -- Type a data pipeline

```python
from typing import Optional

# Define types for your data domain
StudentID   = int
CourseName  = str
MarksRecord = dict[CourseName, float]

def load_students(filepath: str) -> list[dict[str, str | int]]:
    """Load student records from CSV."""
    ...

def calculate_cgpa(marks: MarksRecord) -> float:
    """Calculate CGPA from subject marks."""
    if not marks:
        return 0.0
    return round(sum(marks.values()) / len(marks) / 10, 2)

def get_toppers(
    students:  list[dict],
    threshold: float = 8.5,
    top_n:     Optional[int] = None,
) -> list[dict]:
    """Return students above CGPA threshold, optionally limited to top N."""
    qualifying = [s for s in students if s.get("cgpa", 0) >= threshold]
    qualifying.sort(key=lambda s: s["cgpa"], reverse=True)
    return qualifying[:top_n] if top_n else qualifying
```

### Pattern 2 -- Type a class hierarchy

```python
from typing import Protocol
from abc import ABC, abstractmethod

class PaymentProcessor(Protocol):
    def process(self, amount: float) -> bool: ...
    def refund(self, amount: float, reason: str) -> bool: ...

class UPIPayment:
    def __init__(self, upi_id: str) -> None:
        self.upi_id = upi_id

    def process(self, amount: float) -> bool:
        print(f"Processing Rs.{amount:.2f} via UPI {self.upi_id}")
        return True

    def refund(self, amount: float, reason: str) -> bool:
        print(f"Refunding Rs.{amount:.2f}: {reason}")
        return True

# Works with any PaymentProcessor without explicit inheritance
def checkout(processor: PaymentProcessor, total: float) -> None:
    success = processor.process(total)
    if not success:
        print("Payment failed")
```

### Pattern 3 -- Type hints in real Pandas code

```python
import pandas as pd
from typing import Optional

def load_ipl_data(filepath: str) -> pd.DataFrame:
    return pd.read_csv(filepath)

def filter_by_team(
    df:   pd.DataFrame,
    team: str,
) -> pd.DataFrame:
    return df[df["batting_team"] == team]

def top_scorers(
    df:       pd.DataFrame,
    n:        int = 10,
    min_runs: Optional[int] = None,
) -> pd.DataFrame:
    grouped = df.groupby("batsman")["batsman_runs"].sum().reset_index()
    grouped.columns = ["batsman", "total_runs"]
    if min_runs:
        grouped = grouped[grouped["total_runs"] >= min_runs]
    return grouped.nlargest(n, "total_runs")
```

### Pattern 4 -- Overload for multiple signatures

When a function behaves differently based on input type:

```python
from typing import overload

@overload
def format_value(value: int) -> str: ...
@overload
def format_value(value: float) -> str: ...
@overload
def format_value(value: list[int]) -> list[str]: ...

def format_value(value):
    if isinstance(value, list):
        return [str(v) for v in value]
    return f"{value:.2f}" if isinstance(value, float) else str(value)
```

---

## 17. Summary and Key Takeaways

### What type hints give you

Type hints do not change how your code runs. They give you documentation
that tools can check, IDE intelligence that makes you faster, and static
analysis that catches bugs before they reach production.

### The essential types to know

```python
# Primitives
x: int       = 42
y: float     = 3.14
z: str       = "hello"
b: bool      = True
n: None      = None

# Collections (Python 3.9+)
lst:  list[int]           = [1, 2, 3]
dct:  dict[str, int]      = {"a": 1}
tup:  tuple[str, int]     = ("Aarav", 21)
st:   set[str]            = {"python", "data"}

# Optional and Union
maybe:  str | None        = None    # Python 3.10+
either: int | str         = 42      # Python 3.10+

from typing import Optional, Union
maybe2:  Optional[str]    = None    # older syntax
either2: Union[int, str]  = 42      # older syntax

# Any (avoid overuse)
from typing import Any
anything: Any = ...

# Callable
from typing import Callable
fn: Callable[[int, int], int]   # takes two ints, returns int

# Return nothing
def side_effect() -> None: ...
```

### The modern shorthand (Python 3.10+)

```python
# Old                          # New (3.10+)
Optional[str]              --> str | None
Union[int, str]            --> int | str
Union[int, str, None]      --> int | str | None
```

### Adoption strategy

```
Start here:
  1. Annotate all function signatures (parameters and return types)
  2. Annotate class __init__ parameters
  These two alone catch 80% of type-related bugs.

Then add:
  3. Annotate module-level variables and constants
  4. Use TypedDict for dictionary schemas
  5. Use Literal for constrained string/int values

Advanced:
  6. Add Protocol for structural typing
  7. Add TypeVar for generic functions
  8. Run mypy in CI/CD to prevent type regressions
```

### Common mistakes

```python
# 1. Using Optional when you mean Union
# Wrong:
def process(x: Optional[Union[int, str]]) -> None: ...
# Right: just use | None
def process(x: int | str | None) -> None: ...

# 2. Forgetting to narrow Optional before use
def get_length(s: Optional[str]) -> int:
    return len(s)   # error: s might be None
# Fix:
def get_length(s: Optional[str]) -> int:
    return len(s) if s is not None else 0

# 3. Using List (capital L) in Python 3.9+
from typing import List
def process(items: List[int]) -> None: ...  # works but outdated
def process(items: list[int]) -> None: ...  # preferred in 3.9+

# 4. Overusing Any
def process(data: Any) -> Any: ...  # defeats the purpose
```

---

*Made with care for Codeverra learners | codeverra.com*