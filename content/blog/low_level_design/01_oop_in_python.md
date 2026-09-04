---
title: "Object-Oriented Programming in Python: A Deep Dive"
description: "A complete guide to Python OOP: why it exists, what problems it solves, and how to wield it well in real systems."

date: 2026-09-04
lastmod: 2026-09-04
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - lld
  - oop
  - python

cover:
  image: "/images/LLD - 1.png"
  alt: "Object-Oriented Programming in Python"
  caption: "Object-Oriented Programming in Python: A Deep Dive"
  relative: true
  hidden: false
---

# Object-Oriented Programming in Python — A Deep Dive

> **Who this is for:** Anyone who knows basic Python (variables, functions, lists, dicts) and wants to truly understand OOP — not just the syntax, but *why* it exists, *what problems* it solves, and *how* to wield it well in real systems.

---

## Table of Contents

1. [The World Before OOP — Why Do We Even Need It?](#1-the-world-before-oop)
2. [Classes and Objects — The Blueprint and the Building](#2-classes-and-objects)
3. [The `self` Parameter — Python's Most Misunderstood Keyword](#3-the-self-parameter)
4. [Attributes — Instance vs Class Attributes](#4-attributes)
5. [Methods — Instance, Class, and Static](#5-methods)
6. [The Four Pillars of OOP](#6-the-four-pillars-of-oop)
7. [Encapsulation — The Art of Hiding](#7-encapsulation)
8. [Inheritance — Building on What Exists](#8-inheritance)
9. [Polymorphism — Many Forms, One Interface](#9-polymorphism)
10. [Abstraction — Focusing on What Matters](#10-abstraction)
11. [Dunder Methods — Making Your Objects Feel Native](#11-dunder-methods)
12. [Properties — Controlled Attribute Access](#12-properties)
13. [Multiple Inheritance and the MRO](#13-multiple-inheritance-and-the-mro)
13A. [Mixins as a Pattern — Composable Capabilities](#13a-mixins-as-a-pattern)
14. [Composition vs Inheritance](#14-composition-vs-inheritance)
15. [Dataclasses — OOP with Less Boilerplate](#15-dataclasses)
15A. [`ABC` vs `Protocol` — Two Ways to Define an Interface](#15a-abc-vs-protocol)
15B. [`@classmethod` as a Factory — Named Constructors](#15b-classmethod-as-a-factory)
16. [Summary & Key Takeaways](#16-summary)
17. [Practice Problems](#17-practice-problems)

---

## 1. The World Before OOP

Before we learn *what* OOP is, let's understand *why* humanity invented it. Imagine you've been hired to build software for a ride-hailing company (think Uber). You start writing code procedurally — just functions and dictionaries.

```python
# Procedural approach — how most of us start
driver1 = {"name": "Amit", "rating": 4.8, "car": "Swift", "is_available": True}
driver2 = {"name": "Priya", "rating": 4.5, "car": "WagonR", "is_available": False}

def start_ride(driver, rider_name, destination):
    if not driver["is_available"]:
        print(f"{driver['name']} is busy!")
        return
    driver["is_available"] = False
    print(f"{driver['name']} is picking up {rider_name} to go to {destination}")

def end_ride(driver):
    driver["is_available"] = True
```

This works! For a while. Then reality starts biting:

**Problem 1: Data and behavior live apart.**
The `driver1` dictionary holds data. The `start_ride` function holds behavior. But they're conceptually one thing — a driver. Nothing stops someone from calling `start_ride("hello", "Priya", "Airport")`. Python won't complain until it crashes at runtime.

**Problem 2: No structure or invariants.**
What if someone does `driver1["ratng"] = 5.0` (typo)? Or sets `rating = -9999`? Nothing prevents it. There's no enforced "shape" for a driver.

**Problem 3: Code duplication explodes.**
Now you need a `Rider`. And a `DeliveryPartner`. Each has similar fields (name, rating, availability) but also differences. You end up copy-pasting logic everywhere.

**Problem 4: Change is expensive.**
One day, product says: "Drivers now have a tier — Gold, Silver, Bronze — and their commission depends on tier." You have to hunt down every function that touches drivers and update it. Miss one, and bugs ship.

OOP was invented to solve exactly these pain points. The core insight is beautifully simple:

> **Data and the behaviors that operate on that data belong together, as one unit.**

That unit is called an **object**. And the template used to build objects is called a **class**.

### An Everyday Analogy

Think of a **cookie cutter** and the **cookies** it produces.

- The cookie cutter is the **class**. It defines the shape, but you can't eat it.
- Each cookie is an **object** (also called an instance). It has its own existence, its own icing, its own bite marks.
- The cutter can make thousands of cookies, all with the same *shape* but independent lives.

Or think of an **architect's blueprint** for a house (class) and the actual houses built from it (objects). Each house has the same layout but its own residents, furniture, and wifi password.

Keep these analogies in mind — we'll refer back to them.

---

## 2. Classes and Objects

Let's rewrite the driver example using a class.

```python
class Driver:
    def __init__(self, name, rating, car):
        self.name = name
        self.rating = rating
        self.car = car
        self.is_available = True

    def start_ride(self, rider_name, destination):
        if not self.is_available:
            print(f"{self.name} is busy!")
            return
        self.is_available = False
        print(f"{self.name} is picking up {rider_name} to go to {destination}")

    def end_ride(self):
        self.is_available = True
        print(f"{self.name} is now available again")


# Creating objects (instances) from the class
amit = Driver("Amit", 4.8, "Swift")
priya = Driver("Priya", 4.5, "WagonR")

amit.start_ride("Rohan", "Airport")
# Output: Amit is picking up Rohan to go to Airport

priya.start_ride("Sneha", "Mall")
# Output: Priya is picking up Sneha to go to Mall
```

Let's dissect this carefully.

**`class Driver:`** — This is a declaration. We're telling Python: "I'm defining a new type of thing called `Driver`." Nothing is created yet — it's just a blueprint.

**`__init__`** — This is the **constructor** (technically, it's an *initializer*, but most people call it constructor). It runs automatically whenever a new `Driver` is created. Its job is to set up the initial state. When you write `Driver("Amit", 4.8, "Swift")`, Python:
1. Creates a new empty `Driver` object in memory
2. Calls `__init__` on it, passing `"Amit"`, `4.8`, `"Swift"` as arguments
3. `__init__` populates the object's attributes
4. Returns the fully-formed object

**`self`** — The current object. We'll cover this in depth next. For now, think of it as "me" — the specific object this method is being called on.

**`amit = Driver(...)`** — This creates a new instance. `amit` and `priya` are two completely independent cookies made from the same cutter. Modifying `amit.is_available` doesn't touch `priya` at all.

### What Did We Gain?

Compared to the procedural version:

1. **Cohesion.** `Driver` data and driver behavior live together. You can't accidentally call `start_ride` on a random dict.
2. **Identity.** `amit` is clearly a `Driver`. Type checkers, IDEs, and humans all know this.
3. **Encapsulation (even if weak so far).** The driver's state is managed through its own methods.
4. **Readability.** `amit.start_ride(...)` reads like English. Contrast with `start_ride(amit_dict, ...)`.

---

## 3. The `self` Parameter

`self` confuses nearly every beginner. Let's demystify it once and for all.

When you write:

```python
amit.start_ride("Rohan", "Airport")
```

Python translates this internally to roughly:

```python
Driver.start_ride(amit, "Rohan", "Airport")
```

That is — Python takes the object before the dot (`amit`) and passes it as the **first argument** to the method. That first argument is conventionally named `self`. It's just a reference to "the object this method was called on."

### Why is `self` explicit in Python?

Languages like Java and C++ have an implicit `this`. Python made a deliberate design choice: **explicit is better than implicit** (a core Python philosophy). By requiring `self`, Python:

- Makes it crystal clear what's an instance attribute (`self.name`) vs a local variable (`name`).
- Makes method definitions and function definitions look identical — no magic.
- Lets you rename it if you want (though please don't — use `self`).

### A Mental Model

When you call `amit.start_ride("Rohan", "Airport")`, imagine Python whispering to the method:
*"Hey `start_ride`, here's the driver you're working with (amit), and here are the other arguments."*

The method then uses `self.name`, `self.is_available`, etc., to access *that specific driver's* data.

```python
# These two calls operate on DIFFERENT self objects
amit.start_ride("Rohan", "Airport")   # self IS amit
priya.start_ride("Sneha", "Mall")     # self IS priya
```

This is how one method definition can serve thousands of different objects — each invocation automatically knows *which* object it's dealing with.

---

## 4. Attributes

Attributes are variables attached to objects (or classes). Python distinguishes two kinds: **instance attributes** and **class attributes**.

### Instance Attributes

These belong to individual objects. Each object has its own copy. `self.name`, `self.rating`, `self.is_available` — all instance attributes.

```python
amit.name = "Amit Kumar"   # Only affects amit
priya.name                 # Still "Priya"
```

### Class Attributes

These belong to the class itself — one copy shared across all instances. Useful for constants or shared state.

```python
class Driver:
    company_name = "QuickRide"       # Class attribute — shared
    total_drivers_created = 0        # Shared counter

    def __init__(self, name, rating, car):
        self.name = name             # Instance attribute
        self.rating = rating
        self.car = car
        self.is_available = True
        Driver.total_drivers_created += 1  # Modify the class attribute
```

```python
amit = Driver("Amit", 4.8, "Swift")
priya = Driver("Priya", 4.5, "WagonR")

print(Driver.total_drivers_created)  # 2
print(amit.company_name)             # "QuickRide" — accessed via instance
print(priya.company_name)            # "QuickRide"
```

### The Subtle Trap

Here's something that burns many beginners. Consider:

```python
class Driver:
    rides_taken = []   # Class attribute — a MUTABLE list, shared!

    def __init__(self, name):
        self.name = name

    def add_ride(self, dest):
        self.rides_taken.append(dest)

amit = Driver("Amit")
priya = Driver("Priya")

amit.add_ride("Airport")
print(priya.rides_taken)  # ['Airport']  ← WHAT?!
```

Because `rides_taken` is a class attribute and lists are mutable, **every instance shares the same list**. `amit.rides_taken` and `priya.rides_taken` both refer to the exact same list object.

**The fix**: use instance attributes for per-object mutable state:

```python
class Driver:
    def __init__(self, name):
        self.name = name
        self.rides_taken = []   # Fresh list for each driver
```

**Rule of thumb**: use class attributes for constants and immutable values. Use instance attributes (set in `__init__`) for per-object mutable state.

---

## 5. Methods

Python has three kinds of methods. Most beginners only know the first.

### Instance Methods

The usual kind. Take `self` as first parameter. Operate on a specific object.

```python
class Driver:
    def __init__(self, name):
        self.name = name

    def greet(self):                  # Instance method
        return f"Hi, I'm {self.name}"
```

### Class Methods

Marked with `@classmethod`. Take `cls` (the class itself) as first parameter instead of `self`. Useful for **alternative constructors** or operations involving the class as a whole.

```python
class Driver:
    def __init__(self, name, rating, car):
        self.name = name
        self.rating = rating
        self.car = car

    @classmethod
    def from_dict(cls, data):
        """Alternative constructor: build Driver from a dict."""
        return cls(data["name"], data["rating"], data["car"])

    @classmethod
    def rookie(cls, name):
        """Alternative constructor: a brand new driver."""
        return cls(name, rating=5.0, car="Unknown")


amit = Driver.from_dict({"name": "Amit", "rating": 4.8, "car": "Swift"})
newbie = Driver.rookie("Rahul")
```

Why use `cls` instead of hardcoding `Driver`? Because if someone subclasses `Driver` (say, `PremiumDriver`), `cls` will correctly refer to the subclass. You get polymorphism for free.

### Static Methods

Marked with `@staticmethod`. Take neither `self` nor `cls`. They're just regular functions that happen to live inside a class's namespace for logical grouping.

```python
class Driver:
    @staticmethod
    def is_valid_rating(rating):
        return 0 <= rating <= 5

Driver.is_valid_rating(4.8)  # True
```

Why put it in the class at all? For organization. Callers see that this utility is logically related to `Driver`, even though it doesn't touch any instance or class state.

### When to Use Which?

| Method Type | First Param | Use When |
|---|---|---|
| Instance method | `self` | You need to read/modify a specific object's state |
| Class method | `cls` | You need the class itself (alt constructors, factories, operations on the class) |
| Static method | none | Utility logically grouped with the class but needing no state |

---

## 6. The Four Pillars of OOP

Every OOP course teaches "the four pillars." They're not arbitrary — each pillar solves a specific category of software engineering pain.

| Pillar | One-Line Essence | Pain It Solves |
|---|---|---|
| **Encapsulation** | Bundle data + behavior; hide internals | Prevents random code from corrupting an object's state |
| **Inheritance** | Create new classes by extending existing ones | Eliminates duplication across similar types |
| **Polymorphism** | Different objects, same interface | Lets code work with many types without knowing which |
| **Abstraction** | Expose *what*, hide *how* | Reduces cognitive load; lets you change implementations |

We'll cover each in depth. But first, remember: these aren't separate features — they reinforce each other. Good OOP code tends to use all four naturally.

---

## 7. Encapsulation

**Encapsulation = bundling data with the methods that operate on that data, AND controlling access to the data.**

The second part is crucial. Without access control, you're just bundling — which is nice but insufficient.

### The Problem Without Encapsulation

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

acc = BankAccount("Amit", 1000)
acc.balance = -999999   # Nothing stops this absurdity!
```

Anyone can set `balance` to any value. Invariants (balance >= 0) can't be enforced.

### Python's Approach: Naming Conventions

Unlike Java (which has `private`/`public` keywords), Python uses naming conventions. Python's philosophy is *"we're all consenting adults"* — the language trusts you, but signals intent clearly.

- **`name`** (no underscore) → public. Part of the API. Use freely.
- **`_name`** (single underscore) → "protected" / internal. A *convention* meaning "don't touch this unless you know what you're doing."
- **`__name`** (double underscore) → name-mangled. Python actually renames it to `_ClassName__name` behind the scenes to prevent accidental subclass overrides.

```python
class BankAccount:
    def __init__(self, owner, initial_balance):
        self.owner = owner          # public
        self._balance = initial_balance  # "private" by convention
        self.__pin = "1234"          # name-mangled

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount

    def get_balance(self):
        return self._balance


acc = BankAccount("Amit", 1000)
acc.deposit(500)
acc.withdraw(200)
print(acc.get_balance())  # 1300

# acc._balance = -999  ← Possible, but you're breaking the contract
# acc.__pin            ← AttributeError! (actually stored as _BankAccount__pin)
```

Now the invariant "balance is only modified via legal operations" is enforced (as long as users respect the underscore convention).

### Encapsulation's Real Value

It's not just about hiding. It's about **creating a contract**. The class says: *"Here's my public API. Use only this. I promise this API is stable. Internals may change without notice."*

Without this contract, every change ripples everywhere. With it, you can refactor internals freely.

---

## 8. Inheritance

Inheritance lets you define a new class *based on* an existing one, reusing its attributes and methods while adding or changing behavior.

### The Problem It Solves

Back to our ride-hailing app. You now have Drivers, DeliveryPartners, and TruckDrivers. All three have names, ratings, and availability. All three can start and end jobs. But each has specializations.

Without inheritance, you'd copy-paste a lot. With inheritance, you extract common parts into a base class.

```python
class Worker:
    """Base class for anyone doing work on the platform."""

    def __init__(self, name, rating):
        self.name = name
        self.rating = rating
        self.is_available = True

    def start_job(self):
        if not self.is_available:
            print(f"{self.name} is busy!")
            return False
        self.is_available = False
        return True

    def end_job(self):
        self.is_available = True


class Driver(Worker):
    def __init__(self, name, rating, car):
        super().__init__(name, rating)   # Delegate to parent's __init__
        self.car = car

    def start_job(self, rider, destination):
        if super().start_job():
            print(f"{self.name} ({self.car}) picking up {rider} → {destination}")


class DeliveryPartner(Worker):
    def __init__(self, name, rating, vehicle_type):
        super().__init__(name, rating)
        self.vehicle_type = vehicle_type

    def start_job(self, order_id, address):
        if super().start_job():
            print(f"{self.name} delivering order #{order_id} to {address}")
```

### Anatomy of What Happened

- `class Driver(Worker):` → Driver **inherits** from Worker. Driver is now a "subclass" (or "child"); Worker is the "superclass" (or "parent").
- `super().__init__(name, rating)` → Call Worker's `__init__` to do the common setup. Then we add our own (`self.car = car`).
- We overrode `start_job` in each subclass to add specialized logic, while still delegating the common "set availability" logic to the parent.

### The "Is-A" Relationship

Inheritance models an **is-a** relationship. A `Driver` *is a* `Worker`. A `DeliveryPartner` *is a* `Worker`. If you can't say "X is a Y" comfortably in English, don't use inheritance.

❌ A `Car` is not a `Engine`. Don't make `Car` inherit `Engine`. Use composition (Car *has* an Engine).
✅ A `Dog` is an `Animal`. Inheritance fits.

### What Gets Inherited?

All public and "protected" (_underscore) methods and attributes from the parent. Private (__double-underscore) attributes are name-mangled and won't be directly accessible.

### The `super()` Function

`super()` returns a proxy object that lets you call methods from the parent class. It's the mechanism that makes inheritance composable — you can extend parent behavior rather than replace it.

```python
class Driver(Worker):
    def describe(self):
        base = super().describe()   # "hypothetically, if Worker had describe"
        return base + f" Drives a {self.car}."
```

This way, if Worker's `describe` changes, Driver automatically benefits.

---

## 9. Polymorphism

**Polymorphism** (Greek: "many shapes") means that **the same interface can refer to different underlying implementations**.

In practice: you write code that works with a general type (like `Worker`), and it automatically works with every specific subtype (`Driver`, `DeliveryPartner`, etc.), each behaving appropriately.

### The Classic Example

```python
class Animal:
    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

class Cow(Animal):
    def speak(self):
        return "Moo!"


animals = [Dog(), Cat(), Cow()]
for animal in animals:
    print(animal.speak())
```

Notice how the loop doesn't care what kind of animal it is. It just calls `speak()` and trusts that each animal knows how to do its thing.

### Why This Is Powerful

Imagine the alternative without polymorphism:

```python
for animal in animals:
    if isinstance(animal, Dog):
        print("Woof!")
    elif isinstance(animal, Cat):
        print("Meow!")
    elif isinstance(animal, Cow):
        print("Moo!")
    # ...add a case every time a new animal is introduced
```

Every time you add a new animal, you have to modify this loop. **Polymorphism lets you add new behaviors without modifying existing code.** (This is literally the Open-Closed Principle, which you'll see later in SOLID.)

### Python's Duck Typing

Python takes polymorphism a step further with **duck typing**:

> "If it walks like a duck and quacks like a duck, it's a duck."

In Python, you don't *need* a common parent class. As long as two objects have a method with the same name and signature, they can be used interchangeably.

```python
class Dog:
    def speak(self):
        return "Woof!"

class Car:
    def speak(self):
        return "Vroom!"  # Cars don't normally speak, but we're being silly

for thing in [Dog(), Car()]:
    print(thing.speak())   # Works fine — no shared parent needed
```

This is looser than Java-style polymorphism but very Pythonic. The tradeoff: no compile-time guarantee that an object has the method. If it doesn't, you get an `AttributeError` at runtime.

### Method Overriding

When a subclass defines a method with the same name as its parent, it **overrides** the parent's version:

```python
class Worker:
    def describe(self):
        return f"I'm a worker named {self.name}"

class Driver(Worker):
    def describe(self):  # Overrides the parent's describe
        return f"I'm a driver named {self.name}, I drive a {self.car}"
```

### Method Overloading?

Python does **not** support traditional method overloading (multiple methods with same name but different parameter lists) like Java/C++. Instead, Python uses default arguments and `*args`/`**kwargs`:

```python
class Greeter:
    def greet(self, name=None, formal=False):
        if name is None:
            return "Hello!"
        return f"Good day, {name}" if formal else f"Hey {name}"
```

One method, multiple behaviors based on arguments. Pythonic.

---

## 10. Abstraction

**Abstraction = hiding complex implementation details behind a simple, understandable interface.**

When you press a car's accelerator, you don't think about fuel injection, combustion, or torque conversion. You just press the pedal; the car accelerates. That's abstraction.

Encapsulation and abstraction are closely related:
- **Encapsulation** is about *protecting* internals.
- **Abstraction** is about *simplifying* what users see.

Same coin, different sides.

### Abstract Base Classes (ABCs)

Sometimes you want to declare: *"Any class claiming to be a Worker MUST implement these methods."* Python gives you the `abc` module for this.

```python
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    @abstractmethod
    def process(self, amount):
        pass

    @abstractmethod
    def refund(self, amount):
        pass


class UPIProcessor(PaymentProcessor):
    def process(self, amount):
        print(f"Processing ₹{amount} via UPI")

    def refund(self, amount):
        print(f"Refunding ₹{amount} via UPI")


class CardProcessor(PaymentProcessor):
    def process(self, amount):
        print(f"Charging ₹{amount} on card")
    # Forgot to implement refund!


# processor = PaymentProcessor()  ← TypeError! Can't instantiate abstract class.
upi = UPIProcessor()              # ✓ Works — all abstract methods implemented
# card = CardProcessor()         ← TypeError! `refund` is not implemented.
```

**Why this matters**: in a large codebase, ABCs catch "I forgot to implement this" errors at instantiation time rather than at a random runtime moment. They document the contract explicitly.

### Abstraction Without ABCs

You don't *always* need ABCs. Duck typing often suffices. Use ABCs when:
- You're building a framework or library where others will implement your interfaces.
- You want explicit, enforced contracts.
- You have a family of related classes where "forgetting to implement" would be catastrophic.

For simple, internal code, a common base class with `NotImplementedError` is often enough.

---

## 11. Dunder Methods

"Dunder" = "double underscore". Methods like `__init__`, `__str__`, `__len__`. These are Python's hooks for making your objects feel native — integrated with the language's built-in operations.

### The Problem They Solve

Without dunders:
```python
class Money:
    def __init__(self, amount):
        self.amount = amount

a = Money(100)
b = Money(50)
print(a + b)  # TypeError: unsupported operand type(s) for +
print(a)      # <__main__.Money object at 0x7f8a...> — useless
len(a)        # TypeError
```

Your objects feel foreign. Dunders fix this.

### Common Dunders

```python
class Money:
    def __init__(self, amount, currency="INR"):
        self.amount = amount
        self.currency = currency

    def __repr__(self):
        """Unambiguous representation — for developers, debugging."""
        return f"Money({self.amount!r}, {self.currency!r})"

    def __str__(self):
        """Readable representation — for users."""
        return f"{self.currency} {self.amount:.2f}"

    def __eq__(self, other):
        return isinstance(other, Money) and self.amount == other.amount and self.currency == other.currency

    def __lt__(self, other):
        self._check_currency(other)
        return self.amount < other.amount

    def __add__(self, other):
        self._check_currency(other)
        return Money(self.amount + other.amount, self.currency)

    def __hash__(self):
        return hash((self.amount, self.currency))

    def _check_currency(self, other):
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")


a = Money(100)
b = Money(50)

print(a + b)       # INR 150.00
print(a == Money(100))  # True
print(a > b)       # True
print(repr(a))     # Money(100, 'INR')
```

Now `Money` feels like a first-class Python type.

### A Broader List

| Dunder | When It's Called |
|---|---|
| `__init__(self, ...)` | Object creation |
| `__repr__(self)` | `repr(obj)`, debugger, REPL |
| `__str__(self)` | `str(obj)`, `print(obj)` |
| `__eq__`, `__lt__`, `__gt__`, etc. | `==`, `<`, `>`, etc. |
| `__add__`, `__sub__`, `__mul__` | `+`, `-`, `*` |
| `__len__(self)` | `len(obj)` |
| `__getitem__(self, key)` | `obj[key]` |
| `__setitem__(self, key, value)` | `obj[key] = value` |
| `__iter__`, `__next__` | `for x in obj:` |
| `__call__(self, ...)` | `obj(...)` — makes object callable like a function |
| `__enter__`, `__exit__` | `with obj:` — context manager |
| `__hash__` | Using obj as dict key or in a set |

Dunders are Python's way of letting you plug into its entire ecosystem.

### 11.1 `__hash__` — The Companion of `__eq__`

Look back at the `Money` example. You may have noticed something we glossed over: when we defined `__eq__`, we also defined `__hash__`. That wasn't optional. It's a rule.

**The rule:** if you define `__eq__`, you must also define `__hash__`. Always. Together. Forever.

Why? Because the moment Python sees a custom `__eq__`, it silently sets `__hash__` to `None` — meaning your object becomes *unhashable*. It can no longer go into a `set` or be used as a `dict` key.

Here's the bug almost every Python developer hits once:

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y


# Looks innocent enough...
points = {Point(1, 2), Point(3, 4)}
# TypeError: unhashable type: 'Point'
```

**Why does Python do this?** Because hashing has a contract: two objects that are equal *must* have the same hash. If you redefine equality but leave the default identity-based hash in place, you violate the contract — and dicts and sets break in mysterious ways. Python protects you by refusing to hash the object at all.

**The fix:** define both, and derive the hash from the same fields you use for equality.

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))   # tuple of the fields used in __eq__


points = {Point(1, 2), Point(3, 4), Point(1, 2)}
print(len(points))   # 2 — the duplicate (1, 2) was deduped correctly
```

The formula is mechanical: `hash(tuple_of_equality_fields)`. As long as you remember "same fields in `__eq__` go into `__hash__`", you'll never write a bug here.

**The shortcut:** `@dataclass(frozen=True)` does both for you automatically. We'll see this in Section 15.

**LLD connection.** In a parking lot, suppose you want to know which `Vehicle` is parked in which `ParkingSpot` — a `dict[ParkingSpot, Vehicle]`. For that to work, `ParkingSpot` instances need to be hashable. The same applies to using `Book` as a key in a borrow-history dict, or `Coordinates` in a geo-cache. Whenever a value object needs to live in a `set` or a `dict` key, `__hash__` is non-negotiable.

### 11.2 `__contains__` — Making `in` Work

The `in` operator is one of the most readable bits of Python. `"hello" in some_string`, `5 in some_list`. You can make your own classes work with it by defining `__contains__`.

Without it, callers have to peek into your internals:

```python
class ParkingFloor:
    def __init__(self, spots):
        self.spots = spots   # list of ParkingSpot

# Caller has to know about .spots
if some_spot in floor.spots:
    ...
```

That's a leak. The caller now knows that `spots` is a list. Tomorrow you switch to a set or a dict, and every caller breaks.

With `__contains__`, you expose the *intent* — "does this floor contain this spot?" — and hide the data structure:

```python
class ParkingFloor:
    def __init__(self, spots):
        self._spots = set(spots)

    def __contains__(self, spot):
        return spot in self._spots


# Reads like English. No internal knowledge needed.
if some_spot in floor:
    print("Spot belongs to this floor")
```

This is encapsulation paying interest. The internal data structure can change freely; the public interface (`in`) stays stable.

### 11.3 `__enter__` and `__exit__` — Context Managers

Some resources need cleanup: file handles, database connections, network sockets, locks. The painful version looks like this:

```python
conn = db.connect()
try:
    conn.begin()
    conn.execute("INSERT INTO orders ...")
    conn.commit()
except Exception:
    conn.rollback()
    raise
finally:
    conn.close()
```

Every single time you touch a connection, you must remember the `try`/`except`/`finally` choreography. Forget one rollback, leak one connection, and production pages you at 3am.

**Analogy.** Think of a library borrowing system. When you take a book, you must return it. Now imagine the library hands you a magic backpack: the moment you walk out the door (whether you finished the book, dropped it in a puddle, or it caught fire), the backpack auto-returns it. You can't forget — the system handles it.

That magic backpack is a **context manager**. The `with` statement is "walking through the door."

```python
class DatabaseTransaction:
    def __init__(self, connection):
        self.connection = connection

    def __enter__(self):
        """Called when we enter the `with` block. Return the resource."""
        self.connection.begin()
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Called when we leave the `with` block — even on exception.
        - exc_type is None if the block exited normally.
        - Return True to suppress the exception, False/None to let it propagate.
        """
        if exc_type is None:
            self.connection.commit()
        else:
            self.connection.rollback()
        self.connection.close()
        return False   # never silently swallow exceptions


with DatabaseTransaction(conn) as txn:
    txn.execute("INSERT INTO orders ...")
    txn.execute("UPDATE inventory ...")
# commit happens here automatically.
# If anything above raised — rollback happens automatically.
# Either way, the connection is closed.
```

Read `__exit__` carefully. The three parameters describe what (if anything) went wrong inside the `with` block. The return value decides whether to swallow that exception — and the answer is almost always **no, let it propagate.** Suppressing exceptions silently is how you write bugs that are impossible to debug.

**The lighter alternative — `contextlib.contextmanager`.** For simple cases, the full dunder approach is overkill. The `contextlib` decorator lets you write a context manager as a generator function:

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(connection):
    connection.begin()
    try:
        yield connection         # everything before yield = __enter__
    except Exception:
        connection.rollback()
        raise
    else:
        connection.commit()
    finally:
        connection.close()       # everything after yield = __exit__


with database_transaction(conn) as txn:
    txn.execute("INSERT INTO orders ...")
```

Rule of thumb: use the decorator for one-off, simple cases. Use the class-based form when the context manager has its own state, multiple methods, or needs to be reused.

**LLD connections.** Context managers are everywhere in real LLD:
- **Parking spot lock:** acquire the spot's lock on `__enter__`, release it on `__exit__`, even if the parking attempt raises.
- **Hotel reservation hold:** put the room into a 5-minute "tentative" state on entry; either commit it (on payment) or release it (on timeout/error).
- **Chess board move attempt:** snapshot the board state on entry; restore it if the move turns out to be illegal.

Any time the rule is "set something up, do work, tear something down — even if work fails," you want a context manager.

### 11.4 `__slots__` — Memory Optimisation for Many-Instance Classes

By default, every Python object carries a per-instance `__dict__` — a small dictionary that stores its attributes. That dict gives Python tremendous flexibility (you can add new attributes at runtime), but it also costs memory. For a class with a few instances, it doesn't matter. For a class with millions of instances, it adds up fast.

```python
import sys

class PointDict:
    def __init__(self, x, y):
        self.x = x
        self.y = y


class PointSlots:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y


p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)

# Crude approximation — actual savings include the __dict__ too
print(sys.getsizeof(p1) + sys.getsizeof(p1.__dict__))   # ~152 bytes
print(sys.getsizeof(p2))                                # ~48 bytes
```

`__slots__` tells Python: "this class only ever has these attributes — skip the per-instance dict." The savings are substantial. On modern Python, you typically save 40–60% memory per instance.

There's a useful side effect too: `__slots__` prevents typo bugs.

```python
p = PointSlots(1, 2)
p.z = 5    # AttributeError: 'PointSlots' object has no attribute 'z'
```

A regular class would have happily added a `z` attribute, hiding the typo. The slotted class catches it at the point of the bug.

**Costs to know:**
- No `__dict__` means no dynamic attribute addition. (Often a feature.)
- Inheritance with `__slots__` requires every class in the chain to use it; otherwise the saving is lost.
- Can't be mixed with class-level mutable defaults easily.

**LLD connections.**
- A parking lot with 10,000 spots: `ParkingSpot.__slots__ = ("id", "level", "type", "status")`.
- A ride-sharing app with 100,000 active trips in memory: `Trip` with slots.
- A chess engine evaluating 1M board states per second: `BoardState` with slots is the difference between fitting in cache and not.

You don't reach for `__slots__` by default. You reach for it when profiling shows that object overhead is your bottleneck.

---

## 12. Properties

Sometimes you want attribute-like access but need to intercept reads/writes. Getters/setters, essentially. Python gives you `@property` for this — elegant and Pythonic.

### The Setup

Suppose we want to ensure `temperature` in Celsius never goes below absolute zero.

### The Java-ish Way

```python
class Thermometer:
    def __init__(self, celsius):
        self._celsius = celsius

    def get_celsius(self):
        return self._celsius

    def set_celsius(self, value):
        if value < -273.15:
            raise ValueError("Below absolute zero!")
        self._celsius = value


t = Thermometer(25)
t.set_celsius(30)
print(t.get_celsius())
```

Works, but verbose. Every access is `obj.get_xxx()`/`obj.set_xxx()`.

### The Pythonic Way

```python
class Thermometer:
    def __init__(self, celsius):
        self.celsius = celsius   # Will trigger the setter below!

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Below absolute zero!")
        self._celsius = value

    @property
    def fahrenheit(self):
        """Computed attribute — no storage needed."""
        return self._celsius * 9 / 5 + 32


t = Thermometer(25)
print(t.celsius)       # 25 — looks like attribute access
t.celsius = 30         # Looks like attribute assignment
print(t.fahrenheit)    # 86.0 — computed on the fly
# t.celsius = -500     # ValueError
```

`@property` lets you evolve a simple attribute into a computed or validated one *without changing the class's public API*. Clients doing `t.celsius` don't have to care whether it's stored or computed.

This is a beautiful illustration of **abstraction** — the interface stays stable while the implementation can evolve.

### 12.1 Lazy Initialisation — Compute Only When Needed

Some attributes are *expensive* to produce. A user's lifetime statistics may require a database query that scans months of order data. A PDF's text layer may require a parse over thousands of pages. Computing these eagerly — in `__init__` — punishes every caller, even those who never touch the attribute.

**Analogy.** A government office may *commission* a 100-page report on demand. It doesn't print all reports for every citizen the moment they register. It prints each one only when someone actually asks for it — and then files a copy so the next request is fast.

That's lazy initialisation. Compute on first access. Cache for subsequent ones.

```python
class UserReport:
    def __init__(self, user_id):
        self.user_id = user_id
        self._statistics = None   # not computed yet — sentinel

    @property
    def statistics(self):
        if self._statistics is None:
            self._statistics = self._fetch_from_db()   # expensive
        return self._statistics

    def _fetch_from_db(self):
        # Imagine a heavy join across orders, refunds, ratings, etc.
        print(f"[db] Computing statistics for user {self.user_id}...")
        return {"orders": 42, "ltv": 12350.0}


u = UserReport(user_id=99)
# No DB call yet.

print(u.statistics)   # [db] Computing... then {'orders': 42, ...}
print(u.statistics)   # No DB call — cached.
```

The first access pays the cost. Every subsequent access is free. Callers don't have to know.

**Why this is better than computing in `__init__`.** Creating a `UserReport` is now cheap. You can build a thousand `UserReport`s for a leaderboard view and only the ones the user clicks on will pay the DB cost. That's a real performance win on a real API.

**A standard-library shortcut.** Python's `functools.cached_property` does exactly this in one decorator:

```python
from functools import cached_property

class UserReport:
    def __init__(self, user_id):
        self.user_id = user_id

    @cached_property
    def statistics(self):
        return self._fetch_from_db()
```

The manual version is worth knowing — it shows what `cached_property` is doing under the hood and works in environments where you need custom invalidation behaviour.

### 12.2 The `deleter` — Cache Invalidation Done Properly

`@property` has a third form: `@property_name.deleter`. It runs when someone does `del obj.attribute`. Most of the time you don't need it. When you do need it, it's the cleanest way to express *cache invalidation*.

```python
class UserReport:
    def __init__(self, user_id):
        self.user_id = user_id
        self._statistics = None

    @property
    def statistics(self):
        if self._statistics is None:
            self._statistics = self._fetch_from_db()
        return self._statistics

    @statistics.deleter
    def statistics(self):
        """Invalidate the cache. Next access will refetch."""
        self._statistics = None

    def _fetch_from_db(self):
        print(f"[db] Fetching for {self.user_id}")
        return {"orders": 42}


u = UserReport(99)
print(u.statistics)   # [db] Fetching... then {'orders': 42}
print(u.statistics)   # cached

# Later, after the user places a new order:
del u.statistics       # invalidate
print(u.statistics)   # [db] Fetching... fresh value
```

The deleter is also useful for cleaning up external resources — closing a file handle, releasing a connection — when an attribute is no longer needed.

### 12.3 Validated Setters Across Multiple Fields

The earlier `Thermometer` example showed a setter that validates *one* field in isolation. Real systems often have invariants that span multiple fields. A `DateRange` must have `end >= start`. A `ParkingFloor`'s `available_spots` must satisfy `0 <= available_spots <= capacity`. A `Hotel`'s `check_out` must be after `check_in`.

The naive trap is to validate only inside `__init__`. But fields can be mutated later — and the moment they are, the invariant is at risk.

```python
from datetime import date

class DateRange:
    def __init__(self, start: date, end: date):
        # Set the private fields first so the setter can compare.
        self._start = start
        self._end = end
        self._validate()

    @property
    def start(self):
        return self._start

    @start.setter
    def start(self, value):
        if value > self._end:
            raise ValueError(f"start ({value}) cannot be after end ({self._end})")
        self._start = value

    @property
    def end(self):
        return self._end

    @end.setter
    def end(self, value):
        if value < self._start:
            raise ValueError(f"end ({value}) cannot be before start ({self._start})")
        self._end = value

    def _validate(self):
        if self._start > self._end:
            raise ValueError(f"start ({self._start}) cannot be after end ({self._end})")


dr = DateRange(date(2026, 1, 1), date(2026, 1, 31))
dr.end = date(2026, 2, 15)         # OK
# dr.end = date(2025, 12, 1)       # ValueError — would violate invariant
```

The pattern is clear: every setter that participates in an invariant must check the invariant before committing the change. The class can never enter an invalid state — not in `__init__`, not after any later assignment.

**LLD connection.** Validated setters are how you enforce *domain invariants* — facts that must always be true. The `available_spots` count on a parking floor should never go below 0 or above capacity. The `balance` on a `BankAccount` (with overdraft disabled) should never go below 0. The `occupants` count in an elevator should never exceed capacity. These are precisely the kinds of bugs that bring systems down in production, and validated setters are the seam at which you catch them.

---

## 13. Multiple Inheritance and the MRO

Python, unlike Java, allows a class to inherit from multiple parents. Powerful, but comes with its own puzzle: if two parents have a method with the same name, which one wins?

```python
class A:
    def greet(self):
        print("Hi from A")

class B:
    def greet(self):
        print("Hi from B")

class C(A, B):
    pass

c = C()
c.greet()   # Which one runs?
```

Answer: **A**. Because Python looks up methods following the **MRO (Method Resolution Order)**, which goes left-to-right through parents.

```python
print(C.__mro__)
# (<class 'C'>, <class 'A'>, <class 'B'>, <class 'object'>)
```

Python uses the **C3 linearization algorithm** to compute a consistent MRO — it ensures:
1. A class appears before its parents.
2. Order of parents in `class X(A, B, C)` is preserved.

### The Diamond Problem

```
    A
   / \
  B   C
   \ /
    D
```

If B and C both inherit A and override some method, what does D see?

```python
class A:
    def method(self):
        print("A")

class B(A):
    def method(self):
        print("B"); super().method()

class C(A):
    def method(self):
        print("C"); super().method()

class D(B, C):
    def method(self):
        print("D"); super().method()

D().method()
# D
# B
# C
# A
```

Thanks to C3 linearization, `A.method` is called exactly **once**, not twice. This is the key correctness guarantee.

### Practical Advice

Multiple inheritance is powerful but often misused. Prefer:
- Single inheritance + composition, OR
- **Mixins** — small, focused classes designed to be combined.

```python
class JSONSerializableMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__)

class LoggableMixin:
    def log(self, msg):
        print(f"[{self.__class__.__name__}] {msg}")

class User(JSONSerializableMixin, LoggableMixin):
    def __init__(self, name):
        self.name = name

u = User("Amit")
u.log("created")        # [User] created
print(u.to_json())      # {"name": "Amit"}
```

Mixins are a clean way to share orthogonal behaviors without deep hierarchies.

---

## 13A. Mixins as a Pattern

You just saw mixins in passing. They're worth a section of their own — because once you start designing real systems, you'll find that the same "horizontal" capabilities keep showing up across unrelated classes. Logging. Timestamps. Audit trails. Caching. Serialisation. These aren't an inheritance hierarchy. They're **capabilities**.

### Why Mixins Exist

Deep inheritance is fragile. A class hierarchy that's six levels deep is a class hierarchy where changing the base class can break anything. But some behaviour genuinely needs to be shared across many unrelated types.

Think about three classes in a system: `User`, `Order`, and `Product`. They have nothing in common as concepts. But all three probably need:
- A `created_at` and `updated_at` timestamp.
- An audit trail of changes.
- The ability to be serialised to JSON.

You don't want a `TimestampedAuditableSerializableBase` class that all three inherit from. That's brittle, and it forces an unnatural "is-a" relationship: a `User` is not "a kind of TimestampedAuditableThing." A `User` is a `User` that happens to *have* timestamping, auditing, and serialisation *capabilities*.

That's what mixins encode.

### The Analogy

Think of skills on a LinkedIn profile. A person can list "Python," "Public Speaking," and "Data Analysis." These aren't an inheritance tree. You don't say a Python developer "is a" public speaker. They're independent, composable capabilities the person *has*.

Or: a Swiss Army knife. The knife blade, screwdriver, scissors, and corkscrew are mixed into one handle. None of them "is-a" Swiss Army knife — they're capabilities composed into one tool.

Mixins are the same idea in code: small, focused classes that contribute a single capability when mixed into a host class.

### What a Mixin Looks Like

A well-formed mixin:
1. Adds **one** specific, self-contained capability — not five.
2. Is **never instantiated on its own**. It only exists to be combined.
3. Has either no `__init__`, or one that uses cooperative `super().__init__(*args, **kwargs)` to play nicely with other classes in the MRO.
4. Doesn't carry state that has its own meaning — the state belongs to the host class.

Here's a `TimestampMixin`:

```python
from datetime import datetime

class TimestampMixin:
    """Adds created_at and updated_at to any model."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)   # cooperative — pass through
        self.created_at = datetime.now()
        self.updated_at = self.created_at

    def touch(self):
        """Call whenever the object is modified."""
        self.updated_at = datetime.now()
```

And an `AuditMixin`:

```python
class AuditMixin:
    """Adds a tamper-evident audit trail to any model."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._audit_log = []

    def record_change(self, field: str, old_value, new_value, actor: str):
        self._audit_log.append({
            "field": field,
            "old": old_value,
            "new": new_value,
            "actor": actor,
            "at": datetime.now(),
        })

    def audit_trail(self):
        return list(self._audit_log)   # defensive copy
```

Each mixin contributes one capability. Each calls `super().__init__(*args, **kwargs)` so that whatever class it sits next to in the MRO chain also gets its initialiser called.

### Composing Mixins on a Real Class

Now combine them on a `User` that inherits from a `BaseModel`:

```python
class BaseModel:
    """The 'root' for our domain models — provides an ID."""

    def __init__(self, id: str):
        self.id = id


class User(TimestampMixin, AuditMixin, BaseModel):
    def __init__(self, id: str, name: str, email: str):
        # Cooperative call — kicks off the chain along the MRO.
        super().__init__(id=id)
        self.name = name
        self.email = email

    def update_email(self, new_email: str, actor: str):
        old = self.email
        self.email = new_email
        self.touch()                                   # from TimestampMixin
        self.record_change("email", old, new_email, actor)   # from AuditMixin


u = User(id="u-1", name="Amit", email="amit@old.com")
u.update_email("amit@new.com", actor="self")

print(u.created_at)        # set by TimestampMixin
print(u.updated_at)        # updated by .touch()
print(u.audit_trail())     # one entry from AuditMixin
print(u.id, u.name)        # id from BaseModel, name from User itself
```

One `User`, four sources of behaviour, no deep hierarchy.

### Tracing the MRO

The magic of mixins lives in the MRO. When you call `super().__init__(id=id)` inside `User.__init__`, Python doesn't just go to `BaseModel`. It walks the MRO in order.

```python
print(User.__mro__)
# (<class '__main__.User'>,
#  <class '__main__.TimestampMixin'>,
#  <class '__main__.AuditMixin'>,
#  <class '__main__.BaseModel'>,
#  <class 'object'>)
```

So the call sequence is:
1. `User.__init__` calls `super().__init__(id=id)` → goes to `TimestampMixin`.
2. `TimestampMixin.__init__` calls `super().__init__(*args, **kwargs)` → goes to `AuditMixin`.
3. `AuditMixin.__init__` calls `super().__init__(*args, **kwargs)` → goes to `BaseModel`.
4. `BaseModel.__init__` sets `self.id`.
5. Control unwinds back: `AuditMixin` sets `_audit_log`, `TimestampMixin` sets `created_at`/`updated_at`, `User` sets `name`/`email`.

The order **matters** and is determined by C3 linearisation (the algorithm you met in Section 13). The rule of thumb most teams follow: **mixins first, base class last.** That way each mixin gets to enrich the object before the base class anchors it.

### Why `super().__init__(*args, **kwargs)` in Mixins

If you've written Python for a few years, you've probably written a class with `super().__init__()` and no arguments. That works for single inheritance. It breaks for mixins.

```python
class TimestampMixin:
    def __init__(self):                  # BROKEN for multiple inheritance
        self.created_at = datetime.now()
        # no super() call

class User(TimestampMixin, BaseModel):
    def __init__(self, id, name):
        super().__init__()               # only TimestampMixin runs
        # BaseModel.__init__ never gets called → self.id is missing
```

By using `super().__init__(*args, **kwargs)` in each mixin, every class in the chain gets its arguments and its turn. This is called **cooperative multiple inheritance** — every class in the chain cooperates by passing the call along.

### LLD Connections

You'll see this pattern in many real LLD designs:

- **Library Management System.** `Book`, `Member`, `Loan` all benefit from `TimestampMixin` and `AuditMixin`. The audit trail is critical for compliance — knowing who changed what about a member record.
- **Hotel Management.** `Booking`, `Guest`, `Room` all need timestamps. The booking system in particular needs a clean audit log of who modified a reservation.
- **Ride-Hailing.** `Trip`, `Driver`, `Rider`, `Payment` all need timestamping. Disputes are resolved by walking audit trails.

When you spot the same capability appearing in unrelated classes, that's a mixin asking to be born.

### When NOT to Use a Mixin

Mixins are not a hammer for every nail. Reach for plain composition (the `__init__` parameter — having an `auditor` field rather than inheriting `AuditMixin`) when:
- The capability has its own meaningful lifetime (e.g., a logger that lives across many objects).
- You need to swap implementations at runtime.
- The mixin would need to know too much about the host class (e.g., it has to access many fields specifically).

Composition is the default; mixins are for "I want this capability automatically present, without ceremony."

---

## 14. Composition vs Inheritance

One of the most important judgment calls in OOP: *should I inherit, or should I compose?*

- **Inheritance** = "is-a" relationship. Car *is a* Vehicle.
- **Composition** = "has-a" relationship. Car *has an* Engine.

### Why Composition Often Wins

Inheritance creates **tight coupling** between parent and child. Changes in the parent ripple to every child. Deep hierarchies become rigid, fragile, and hard to reason about.

Composition creates **loose coupling**. A Car holds an Engine object. If you want to change the engine type, swap in a different engine — no class hierarchy touched.

```python
# INHERITANCE — rigid
class Vehicle:
    def start(self): ...
    def accelerate(self): ...

class Car(Vehicle): ...
class ElectricCar(Car):   # What if electric cars don't "start" the same way?
    def start(self): ...

class HybridCar(Car, ElectricCar):   # Combinatorial explosion of subclasses
    ...
```

```python
# COMPOSITION — flexible
class PetrolEngine:
    def start(self): print("Vroom!")

class ElectricEngine:
    def start(self): print("Silent hum...")

class Car:
    def __init__(self, engine):
        self.engine = engine

    def start(self):
        self.engine.start()


Car(PetrolEngine()).start()    # Vroom!
Car(ElectricEngine()).start()  # Silent hum...
```

Same Car class, different engines. Zero subclassing.

### A Famous Principle

> **"Favor composition over inheritance."** — Design Patterns (Gang of Four)

This doesn't mean *never* inherit. It means: before you inherit, ask *"Is this really an 'is-a' relationship, or is 'has-a' more honest?"*

---

## 15. Dataclasses

A common pain point: classes that are basically "bags of data" require a lot of boilerplate.

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"

    def __eq__(self, other):
        return isinstance(other, Point) and self.x == other.x and self.y == other.y
```

Ugh. Python 3.7+ gives us `@dataclass`:

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1)        # Point(x=1, y=2)
print(p1 == p2)  # True
```

`@dataclass` auto-generates `__init__`, `__repr__`, `__eq__`, and more. You can customize:

```python
@dataclass(frozen=True, order=True)   # Immutable, comparable
class Point:
    x: float
    y: float

p = Point(1, 2)
# p.x = 5    ← FrozenInstanceError
```

When to use dataclasses? When your class is primarily **data with simple behavior**. For rich behavior, use regular classes.

### 15.1 `field()` — The Correct Way to Handle Mutable Defaults

The single most common dataclass bug — every Python developer hits it exactly once:

```python
from dataclasses import dataclass

@dataclass
class ShoppingCart:
    user_id: str
    items: list = []          # ← BUG: looks innocent. Is not.


cart_a = ShoppingCart("user-1")
cart_b = ShoppingCart("user-2")

cart_a.items.append("book")
print(cart_b.items)           # ['book']  ← what?!
```

Both carts share the *same* list. Why? Because `items: list = []` evaluates `[]` exactly once — at class definition time — and stores it as a class-level default. Every instance that doesn't pass `items` ends up with a reference to that single shared list.

This is the classic "mutable default argument" bug, dressed up in dataclass clothing.

**The fix:** `field(default_factory=list)`. The factory is called *each time an instance is created*, producing a fresh list.

```python
from dataclasses import dataclass, field

@dataclass
class ShoppingCart:
    user_id: str
    items: list = field(default_factory=list)


cart_a = ShoppingCart("user-1")
cart_b = ShoppingCart("user-2")

cart_a.items.append("book")
print(cart_b.items)           # []  ← correct
```

Use `default_factory` for any mutable default: lists, dicts, sets, custom mutable objects. For immutable defaults (numbers, strings, tuples, `None`), `= value` works fine — there's nothing to share.

In fact, Python helps you here: if you try to write `items: list = []` directly inside `@dataclass`, recent versions raise `ValueError: mutable default <class 'list'> for field items is not allowed`. The language itself is steering you toward `field()`.

### 15.2 `__post_init__` — Validation and Derived Fields

Dataclasses auto-generate `__init__`, which is great — but what if you need validation, or to compute a derived field? You don't replace `__init__` (that defeats the point). You add a `__post_init__`.

```python
@dataclass
class Product:
    name: str
    price: float
    sku: str = field(default="")     # derived if not provided

    def __post_init__(self):
        # Validation
        if self.price < 0:
            raise ValueError(f"price cannot be negative: {self.price}")
        if not self.name.strip():
            raise ValueError("name cannot be empty")

        # Normalisation
        self.name = self.name.strip().title()

        # Derived field
        if not self.sku:
            self.sku = f"{self.name.replace(' ', '-').upper()}-{int(self.price)}"


p = Product(name="  python book  ", price=599.0)
print(p.name)   # 'Python Book'
print(p.sku)    # 'PYTHON-BOOK-599'
# Product(name="x", price=-1)   ← ValueError
```

`__post_init__` runs automatically after `__init__`. It's the canonical place for validation logic, normalisation, and computing derived state in dataclasses.

### 15.3 `frozen=True` — Immutable Value Objects

There's a category of objects in any system that don't really have an identity — they represent a *value*. `Money(100, "INR")`, `Coordinates(28.6, 77.2)`, `DateRange(start, end)`, `SpotType.COMPACT`. Two `Money(100, "INR")` objects aren't "two different ₹100 amounts." They're the same value, twice.

For these, mutability is a liability, not a feature. If a `Money` were mutable, a method could quietly change its amount under your feet — like rewriting the number on a banknote. That's nonsense for a value.

`@dataclass(frozen=True)` enforces this:

```python
@dataclass(frozen=True)
class Money:
    amount: float
    currency: str


m = Money(100, "INR")
# m.amount = 200    ← dataclasses.FrozenInstanceError
```

`frozen=True` does two important things:
1. **Blocks attribute assignment** after construction. Any attempt raises `FrozenInstanceError`.
2. **Auto-generates `__hash__`** based on the dataclass fields. This means `Money(100, "INR")` is now usable as a `dict` key or in a `set`.

That second point is huge. It means frozen dataclasses *are* the cleanest way to write hashable value objects in Python — no need to write `__eq__` and `__hash__` by hand.

```python
prices = {
    Money(100, "INR"): "tea",
    Money(250, "INR"): "coffee",
}
print(prices[Money(100, "INR")])   # 'tea'  — works because frozen → hashable
```

**LLD connection.** `Money`, `Coordinates`, `DateRange`, `SpotType`, `Address` — all of these are value objects. All of them should be `@dataclass(frozen=True)`. The pattern is so consistent that "is this a value object?" is the first question you should ask before deciding between a regular class and a dataclass.

### 15.4 `asdict` and `astuple` — Serialisation Helpers

Two utility functions from the `dataclasses` module that come up constantly when serialising objects (e.g., to JSON for an API response):

```python
from dataclasses import asdict, astuple

@dataclass
class Product:
    name: str
    price: float
    tags: list = field(default_factory=list)


p = Product(name="Book", price=599, tags=["education", "python"])

print(asdict(p))
# {'name': 'Book', 'price': 599, 'tags': ['education', 'python']}

print(astuple(p))
# ('Book', 599, ['education', 'python'])
```

Both are **recursive** — nested dataclasses inside dataclasses get unpacked properly:

```python
@dataclass
class Address:
    city: str
    pincode: str

@dataclass
class User:
    name: str
    address: Address


u = User(name="Amit", address=Address(city="Bengaluru", pincode="560001"))
print(asdict(u))
# {'name': 'Amit', 'address': {'city': 'Bengaluru', 'pincode': '560001'}}
```

That single call replaces the hand-written `to_dict()` method you'd otherwise be writing on every model. Pair it with `json.dumps(asdict(u))` and you have JSON serialisation in one line.

**Note:** these are *functions* in the `dataclasses` module, not methods on the instance. You call `asdict(u)`, not `u.asdict()`. Easy to forget once.

---

## 15A. `ABC` vs `Protocol`

Every design pattern that defines an "interface" — Strategy, Observer, Command, Factory — needs a way in Python to *express* that interface. Python gives you two ways: **Abstract Base Classes (`ABC`)** and **`Protocol`**. They look similar at first. They are not interchangeable. Picking the wrong one is the source of an entire family of integration headaches.

This section is one of the most practically important in the whole module. Every chapter on patterns that follows uses one or both of these.

### Why Interfaces Matter at All

Recall the Strategy pattern. You have a `PaymentProcessor` and multiple ways to pay — credit card, UPI, wallet, COD. You don't want `PaymentProcessor` to know about each one specifically. You want a contract — "anything that can charge a customer" — and you want to plug in implementations.

That contract is the interface. The question is: how do you *define* the contract in Python?

### Approach 1 — `ABC` (Abstract Base Class)

```python
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    """A contract for anything that can process payments."""

    def log_attempt(self, amount, currency):
        """Concrete shared behaviour — every processor logs attempts."""
        print(f"[audit] Attempting {amount} {currency}")

    @abstractmethod
    def charge(self, amount: float, currency: str) -> str:
        """Must be implemented by every subclass."""
        ...

    @abstractmethod
    def refund(self, transaction_id: str) -> bool:
        ...


class StripeProcessor(PaymentProcessor):
    def charge(self, amount, currency):
        self.log_attempt(amount, currency)
        return f"stripe_tx_{amount}_{currency}"

    def refund(self, transaction_id):
        return True
```

Two important properties:
1. **Forced implementation.** If `StripeProcessor` forgot `refund()`, Python would raise `TypeError: Can't instantiate abstract class StripeProcessor with abstract method refund` the moment you tried to create one. The contract is enforced at construction.
2. **Shared concrete behaviour.** `log_attempt` is defined once and inherited by every subclass. You don't repeat yourself.

### The Problem with ABC

ABC requires **explicit inheritance**. The subclass must declare `(PaymentProcessor)` in its class definition. This is fine when you control all the implementations. It breaks the moment you don't.

```python
# A third-party library you can't modify
class SlackClient:
    def send(self, message: str) -> bool:
        return True

    def get_delivery_status(self, message_id: str) -> str:
        return "delivered"


# Your code expects a Notifier ABC
class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> bool: ...

    @abstractmethod
    def get_delivery_status(self, message_id: str) -> str: ...


def alert_all(notifier: Notifier, message: str):
    notifier.send(message)


# SlackClient has the right methods, but it doesn't inherit from Notifier.
alert_all(SlackClient(), "hello")
# Works at runtime in Python (duck typing), but:
# - A type checker (mypy, pyright) will flag this
# - isinstance(slack_client, Notifier) returns False
# - You can't enforce the contract on this third-party class
```

You don't own `SlackClient`. You can't make it inherit from `Notifier`. But you'd like to use it where a `Notifier` is expected. This is exactly the case `Protocol` was designed for.

### Approach 2 — `Protocol` (Structural Subtyping)

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Notifier(Protocol):
    """Anything with these methods qualifies as a Notifier."""

    def send(self, message: str) -> bool: ...

    def get_delivery_status(self, message_id: str) -> str: ...
```

That's it. There's no `(Notifier)` on `SlackClient`. There doesn't need to be.

```python
def alert_all(notifier: Notifier, message: str):
    notifier.send(message)


slack = SlackClient()
print(isinstance(slack, Notifier))   # True — thanks to @runtime_checkable

alert_all(slack, "hello")            # type checker and runtime both happy
```

This is called **structural subtyping** — sometimes nicknamed "static duck typing." If it walks like a duck and quacks like a duck, the type system *agrees* it's a duck, even without an inheritance declaration.

### The Decision Rule

Use this flow, in this order:

1. **Do I control the hierarchy AND do subclasses share concrete methods?** → `ABC`.
   You want forced implementation, and you want to share code (like `log_attempt`).
2. **Do I just need to express "anything with these methods qualifies"?** → `Protocol`.
   No shared code. Possibly multiple unrelated classes (including third-party ones) satisfy the contract.
3. **Do I need `isinstance()` checks at runtime?** → `Protocol` decorated with `@runtime_checkable`.
4. **Both?** Sometimes you genuinely want both — an `ABC` for your team's internal implementations (forced contract + shared code) plus a `Protocol` exposing the same shape for external integration. That's a legitimate design, not a code smell.

### Side-by-Side: Same Problem, Both Approaches

A `Serializable` contract — anything with `to_dict()` and `to_json()`.

```python
# ABC version — would force every existing class to inherit
from abc import ABC, abstractmethod

class SerializableABC(ABC):
    @abstractmethod
    def to_dict(self) -> dict: ...
    @abstractmethod
    def to_json(self) -> str: ...

# Problem: a dataclass already auto-generates fields; we'd have to wrap it
# in a subclass of SerializableABC just to satisfy the type — annoying.


# Protocol version — works for any class that happens to have these methods
from typing import Protocol

class Serializable(Protocol):
    def to_dict(self) -> dict: ...
    def to_json(self) -> str: ...

# Now any dataclass with these methods is automatically a Serializable.
# No inheritance changes. No code modification.
```

For pure *shape* contracts — "anything that quacks like X" — `Protocol` is almost always the better choice. ABC earns its place when you want to *share implementation*, not just specify shape.

### LLD Connection

- **Strategy pattern** for a payment system where all gateways are written by your team → ABC with shared logging behaviour.
- **Strategy pattern** for a payment system that must integrate third-party gateways → Protocol.
- **Observer pattern** — `Listener` is naturally a Protocol. Any class with `on_event(event)` qualifies.
- **Command pattern** — `Command` is a Protocol. Any object with `execute()` and `undo()` qualifies.

Every time a design pattern says "we need an interface," start by asking: *do the implementations share code, or just a shape?* That answer decides ABC vs Protocol.

---

## 15B. `@classmethod` as a Factory

Constructors (`__init__`) can only ever create one kind of object. But objects often have multiple natural starting points: from a dict, from a row, from defaults, from another object. Stuffing all these into one `__init__` with optional parameters is how `__init__` signatures end up with 15 parameters and three contradictory branches.

**The pattern:** define multiple `@classmethod` "named constructors," each capturing one creation intent. This is sometimes called the **factory class method pattern**, and it's the simplest form of the Factory pattern you'll meet.

### Why Named Constructors Beat Boolean Flags

Compare these two styles. First, the boolean-flag style:

```python
@dataclass
class Member:
    name: str
    email: str
    tier: str
    borrow_limit: int


# Caller has to know magic strings and magic numbers
m = Member(name="Amit", email="a@b.com", tier="premium", borrow_limit=10)
```

The caller has to remember: *what tier strings are valid? what's the right borrow_limit for premium?* Every call site repeats this logic and risks mistakes — `tier="Premium"` (wrong case), `borrow_limit=15` (wrong policy).

Now the factory-method style:

```python
@dataclass
class Member:
    name: str
    email: str
    tier: str
    borrow_limit: int

    @classmethod
    def regular(cls, name: str, email: str) -> "Member":
        return cls(name=name, email=email, tier="regular", borrow_limit=3)

    @classmethod
    def premium(cls, name: str, email: str) -> "Member":
        return cls(name=name, email=email, tier="premium", borrow_limit=10)

    @classmethod
    def from_dict(cls, data: dict) -> "Member":
        return cls(
            name=data["name"],
            email=data["email"],
            tier=data.get("tier", "regular"),
            borrow_limit=data.get("borrow_limit", 3),
        )


# Call sites are clear about intent. No magic strings.
m1 = Member.regular(name="Amit", email="a@b.com")
m2 = Member.premium(name="Priya", email="p@b.com")
m3 = Member.from_dict({"name": "Raj", "email": "r@b.com"})
```

`Member.premium("Priya", "p@b.com")` reads exactly like English. The policy (what `premium` means in terms of `borrow_limit`) is captured once, inside the class. Every call site stays clean.

### Why `cls` and Not `Member`

Notice the methods use `cls(...)` rather than `Member(...)`. That's deliberate. `cls` refers to whatever subclass invoked the method. If someone later defines:

```python
class GoldMember(Member):
    pass

g = GoldMember.premium(name="Geet", email="g@b.com")
print(type(g))     # GoldMember — not Member
```

The `cls` ensures the right type comes back. Hard-coding `Member(...)` would silently return a `Member` even when called on `GoldMember`. Always use `cls` in factory methods.

### Common Factory-Method Patterns

A few patterns you'll see repeatedly:

```python
@dataclass
class User:
    id: str
    name: str
    email: str
    created_at: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        """For deserialisation from JSON / API payloads."""
        return cls(
            id=data["id"],
            name=data["name"],
            email=data["email"],
            created_at=datetime.fromisoformat(data["created_at"]),
        )

    @classmethod
    def from_db_row(cls, row: tuple) -> "User":
        """For loading from a database row."""
        id, name, email, created_at = row
        return cls(id=id, name=name, email=email, created_at=created_at)

    @classmethod
    def anonymous(cls) -> "User":
        """A pre-configured default — useful for tests and guest users."""
        return cls(
            id="guest",
            name="Anonymous",
            email="guest@example.com",
            created_at=datetime.now(),
        )
```

Each method is small, named for its intent, and makes call-site code dramatically more readable.

### LLD Connection

This is the **simplest form of the Factory pattern** — before you ever need a full `FactoryMethod` class. In an LLD interview, if you're asked "how would you create different kinds of `Vehicle` based on type?" — and there are only a handful of vehicle types — factory class methods are often the right answer:

```python
@dataclass
class Vehicle:
    type: str
    plate: str
    spot_size: str

    @classmethod
    def bike(cls, plate: str) -> "Vehicle":
        return cls(type="BIKE", plate=plate, spot_size="SMALL")

    @classmethod
    def car(cls, plate: str) -> "Vehicle":
        return cls(type="CAR", plate=plate, spot_size="MEDIUM")

    @classmethod
    def truck(cls, plate: str) -> "Vehicle":
        return cls(type="TRUCK", plate=plate, spot_size="LARGE")
```

You only reach for a full Factory class (a separate `VehicleFactory` with subclasses) when creation logic is itself complex — say, vehicles must be loaded from external configuration or built up from multiple sources. For the common case, factory class methods are enough.

---

## 16. Summary

**The mental map you should carry away:**

- OOP is a response to real pain: scattered data+behavior, duplication, tight coupling, and change-resistance in procedural code.
- A **class** is a blueprint; an **object** is an instance built from it. Data lives as **attributes**; behavior lives as **methods**.
- **`self`** is simply the object the method was called on — made explicit for clarity.
- **Instance attributes** are per-object; **class attributes** are shared. Don't use mutable class attributes unintentionally.
- **Three kinds of methods**: instance (`self`), class (`cls`), static (neither). Pick based on what state the method needs.
- The **four pillars**:
  - **Encapsulation** — bundle + protect state, define a contract.
  - **Inheritance** — share code along "is-a" relationships.
  - **Polymorphism** — one interface, many implementations. Enables open/closed design.
  - **Abstraction** — expose simple interfaces; hide complex internals.
- **Dunders** plug your objects into Python's ecosystem so they feel native. `__eq__` always travels with `__hash__`. Context managers (`__enter__`/`__exit__`) guarantee cleanup. `__slots__` removes per-instance overhead when objects are many.
- **Properties** give attribute-like access with validation or computation. They also unlock **lazy initialisation** for expensive attributes and **multi-field invariants** via validated setters.
- **Multiple inheritance** uses C3 MRO; **mixins** turn that machinery into a clean pattern for composing orthogonal capabilities (timestamping, auditing, serialisation) onto otherwise unrelated classes.
- **Composition ("has-a")** is often preferable to inheritance ("is-a") for flexibility.
- **Dataclasses** remove boilerplate. `field(default_factory=...)` prevents the mutable-default trap. `__post_init__` is the place for validation. `frozen=True` makes value objects immutable *and* hashable in one move.
- **`ABC` vs `Protocol`**: ABC when you control the hierarchy and share concrete code; Protocol when you just need to express "anything with these methods qualifies."
- **`@classmethod` factories** are named constructors. They capture creation intent at the call site without needing a separate Factory class.

### Key Takeaways

1. **OOP is a tool, not a religion.** Use it where it clarifies; don't force it.
2. **Model with real-world relationships.** "Is-a" → inheritance; "has-a" → composition.
3. **The public API is sacred.** Design it carefully; hide everything else.
4. **Favor composition over inheritance** unless "is-a" is genuinely true.
5. **Polymorphism is how OOP enables extension without modification** — the seed of SOLID.
6. **Reach for the right interface mechanism.** Define ABCs for hierarchies you own; define Protocols for shapes that anything can satisfy.
7. **Treat value objects as immutable.** `@dataclass(frozen=True)` is the default starting point for anything that represents a value rather than an entity.

---

## 17. Practice Problems

### Problem 1 — Foundational

Design a `Rectangle` class with:
- `width` and `height` as attributes (must be positive; raise ValueError otherwise).
- Methods `area()` and `perimeter()`.
- Proper `__repr__` and `__eq__`.

**Solution:**

```python
class Rectangle:
    def __init__(self, width, height):
        if width <= 0 or height <= 0:
            raise ValueError("Dimensions must be positive")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def __repr__(self):
        return f"Rectangle({self.width}, {self.height})"

    def __eq__(self, other):
        return (isinstance(other, Rectangle)
                and self.width == other.width
                and self.height == other.height)
```

### Problem 2 — Inheritance + Polymorphism

Build a small shape hierarchy:
- Abstract `Shape` with abstract `area()` method.
- Concrete `Circle` and `Square` subclasses.
- A function `total_area(shapes)` that works for any list of shapes.

**Solution:**

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return math.pi * self.radius ** 2

class Square(Shape):
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2

def total_area(shapes):
    return sum(shape.area() for shape in shapes)

print(total_area([Circle(1), Square(2), Circle(3)]))
```

Notice `total_area` doesn't know or care about specific shape types. Adding a `Triangle` later requires zero changes here.

### Problem 3 — Spot the Bug

Find the bug. Explain why. Fix it.

```python
class Team:
    members = []

    def __init__(self, name):
        self.name = name

    def add_member(self, member):
        self.members.append(member)


t1 = Team("Alpha")
t1.add_member("Amit")

t2 = Team("Bravo")
print(t2.members)    # Why is this non-empty?!
```

**Solution:**

`members = []` is a **class attribute**, shared across all instances. `add_member` mutates it, so `t2.members` reflects changes made via `t1`.

Fix:

```python
class Team:
    def __init__(self, name):
        self.name = name
        self.members = []    # Instance attribute — independent per team
```

### Problem 4 — Design Exercise

You're modeling a library system. It has:
- `Book` (title, author, ISBN, is_available)
- `Member` (name, member_id, list of borrowed books)
- `Library` (holds books, members; supports `borrow(member, book)`, `return_book(member, book)`).

Design the classes. Ensure:
- A book can't be borrowed if unavailable.
- Members can borrow at most 3 books.
- Returning a book updates both the book's availability and member's list.

**Solution (one valid design):**

```python
class Book:
    def __init__(self, title, author, isbn):
        self.title = title
        self.author = author
        self.isbn = isbn
        self.is_available = True

    def __repr__(self):
        return f"Book({self.title!r})"


class Member:
    MAX_BOOKS = 3

    def __init__(self, name, member_id):
        self.name = name
        self.member_id = member_id
        self.borrowed_books = []

    def can_borrow(self):
        return len(self.borrowed_books) < Member.MAX_BOOKS


class Library:
    def __init__(self):
        self.books = []
        self.members = []

    def add_book(self, book):
        self.books.append(book)

    def register_member(self, member):
        self.members.append(member)

    def borrow(self, member, book):
        if not book.is_available:
            raise ValueError(f"{book} is not available")
        if not member.can_borrow():
            raise ValueError(f"{member.name} has reached the borrow limit")
        book.is_available = False
        member.borrowed_books.append(book)

    def return_book(self, member, book):
        if book not in member.borrowed_books:
            raise ValueError("Member did not borrow this book")
        member.borrowed_books.remove(book)
        book.is_available = True
```

**Discussion questions to ponder:**
- Where did we use encapsulation? (State is modified only through `Library` methods.)
- Could we use inheritance here? (Perhaps `Book` → `Ebook`, `PrintBook` — only if they actually differ in behavior.)
- What if borrow limits differ per member type (student vs faculty)? (Hint: subclass `Member` or compose a `BorrowingPolicy` object. We'll revisit this in SOLID.)

### Problem 5 — Dunder Method Practice

Create a `Vector2D` class supporting:
- `v1 + v2` (vector addition)
- `v * 3` (scalar multiplication)
- `v1 == v2`
- `len(v)` returning magnitude (approximate — rounded int)
- Printable via `print(v)`

**Solution:**

```python
import math

class Vector2D:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector2D(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar):
        return Vector2D(self.x * scalar, self.y * scalar)

    def __eq__(self, other):
        return isinstance(other, Vector2D) and self.x == other.x and self.y == other.y

    def __len__(self):
        return int(math.sqrt(self.x ** 2 + self.y ** 2))

    def __repr__(self):
        return f"Vector2D({self.x}, {self.y})"


v1 = Vector2D(3, 4)
v2 = Vector2D(1, 2)
print(v1 + v2)         # Vector2D(4, 6)
print(v1 * 2)          # Vector2D(6, 8)
print(v1 == Vector2D(3, 4))  # True
print(len(v1))         # 5
```

---

### Advanced Python OOP Practice

These problems target the deeper toolkit — `__hash__`, context managers, frozen dataclasses, `ABC` vs `Protocol`, mixins, and factory class methods. Work them in order; later problems build on earlier insights.

---

#### Type 1 — Spot the Bug

**P1.1 — The missing `__hash__`**

```python
class BookISBN:
    def __init__(self, isbn: str):
        self.isbn = isbn

    def __eq__(self, other):
        return isinstance(other, BookISBN) and self.isbn == other.isbn


# What happens here? Why?
isbns = {BookISBN("978-0-13-468599-1"), BookISBN("978-0-13-468599-1")}
```

What does the snippet do, and what's the fix?

**Solution.**
The code raises `TypeError: unhashable type: 'BookISBN'`. Defining `__eq__` without `__hash__` causes Python to set `__hash__` to `None`. The rule of thumb is *always pair `__eq__` and `__hash__`*. The hash must be derived from the same fields as the equality check, otherwise the dict/set invariant ("equal objects have equal hashes") is violated.

```python
class BookISBN:
    def __init__(self, isbn: str):
        self.isbn = isbn

    def __eq__(self, other):
        return isinstance(other, BookISBN) and self.isbn == other.isbn

    def __hash__(self):
        return hash(self.isbn)
```

Or — the one-liner version with `@dataclass(frozen=True)`:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class BookISBN:
    isbn: str
```

`frozen=True` generates `__eq__` and `__hash__` based on the fields automatically.

---

**P1.2 — Mutable dataclass default**

```python
from dataclasses import dataclass

@dataclass
class ShoppingCart:
    user_id: str
    items: list = []

cart_a = ShoppingCart("user-1")
cart_b = ShoppingCart("user-2")

cart_a.items.append("book")
print(cart_b.items)
```

What is wrong with this code, and what would `print(cart_b.items)` output? Fix it.

**Solution.**
Modern Python actually refuses to define this class at all: it raises `ValueError: mutable default <class 'list'> for field items is not allowed: use default_factory`. Older Python (and the manual equivalent of this dataclass) would let it through, and both carts would share the same list — so `print(cart_b.items)` would output `['book']`.

The fix is `field(default_factory=list)`. The factory is called *per instance*, producing a fresh list each time.

```python
from dataclasses import dataclass, field

@dataclass
class ShoppingCart:
    user_id: str
    items: list = field(default_factory=list)
```

Now `cart_b.items` is `[]`, as a clean new cart should be.

---

**P1.3 — ABC used where Protocol was needed**

```python
from abc import ABC, abstractmethod

class Drawable(ABC):
    @abstractmethod
    def draw(self) -> None: ...


# A third-party class — you cannot modify this
class SVGCircle:
    def draw(self):
        print("<circle cx='10' cy='10' r='5'/>")


def render_all(drawables: list[Drawable]):
    for d in drawables:
        d.draw()


render_all([SVGCircle()])
```

What's the issue here? What's the right fix?

**Solution.**
`SVGCircle` has the `draw` method but doesn't inherit from `Drawable`. At runtime, Python's duck typing will let `render_all` work — but the type system flags it, `isinstance(svg_circle, Drawable)` is `False`, and any code that does an `isinstance` check (e.g., for filtering) will exclude `SVGCircle`. You also can't enforce that callers actually pass valid drawables.

ABC requires explicit inheritance. We don't own `SVGCircle`, so inheritance isn't an option. The right tool is `Protocol`: a *shape* contract that any class with the right methods satisfies automatically.

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...


def render_all(drawables: list[Drawable]):
    for d in drawables:
        d.draw()


print(isinstance(SVGCircle(), Drawable))   # True
render_all([SVGCircle()])                  # works, type-checks correctly
```

Use `ABC` when you control the hierarchy and want to share concrete code. Use `Protocol` when you just want to say "anything with this shape qualifies."

---

#### Type 2 — Implement It

**P2.1 — Context manager for a parking spot**

Implement a `ParkingSpotLock` context manager. On entry, it marks the given spot as occupied. On exit, it releases the spot — even if an exception was raised inside the `with` block. Demonstrate this behaviour by including a usage example where the parking session raises an exception, and show that the spot is still released.

**Solution.**

```python
class ParkingSpot:
    def __init__(self, spot_id: str):
        self.spot_id = spot_id
        self.is_occupied = False


class ParkingSpotLock:
    """Acquires a parking spot on entry; releases it on exit unconditionally."""

    def __init__(self, spot: ParkingSpot):
        self.spot = spot

    def __enter__(self):
        if self.spot.is_occupied:
            raise RuntimeError(f"Spot {self.spot.spot_id} is already occupied")
        self.spot.is_occupied = True
        return self.spot

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Release the spot regardless of whether the block raised.
        # exc_type is None on a clean exit, or the exception class otherwise.
        self.spot.is_occupied = False
        # Return False so any exception inside the `with` block still propagates.
        return False


# --- Usage demonstrating exception safety ---
spot = ParkingSpot("L1-A-07")

try:
    with ParkingSpotLock(spot) as locked_spot:
        print(f"In block: occupied = {locked_spot.is_occupied}")    # True
        raise ValueError("Payment failed mid-parking")
except ValueError as e:
    print(f"Caught: {e}")

print(f"After block: occupied = {spot.is_occupied}")    # False — released
```

Two important details:
1. `__exit__` releases the spot *before* it returns. The release happens whether the block ran cleanly or raised.
2. Returning `False` (or `None`) from `__exit__` means the exception is allowed to propagate. Returning `True` would silently swallow it — almost always a bug.

---

**P2.2 — Frozen value object: `Money`**

Implement a `Money` value object that:
- Has `amount: float` and `currency: str`.
- Is immutable.
- Supports `__add__` for adding two `Money` of the same currency.
- Raises `ValueError` on currency mismatch.
- Has a `__repr__` of the form `Money(₹500.00)` for INR, `Money($500.00)` for USD, etc.

Demonstrate that `Money` is hashable (usable as a dict key) thanks to `frozen=True`.

**Solution.**

```python
from dataclasses import dataclass

CURRENCY_SYMBOLS = {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£"}


@dataclass(frozen=True)
class Money:
    amount: float
    currency: str

    def __add__(self, other: "Money") -> "Money":
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise ValueError(
                f"Currency mismatch: {self.currency} vs {other.currency}"
            )
        # Return a new Money — never mutate (we're frozen anyway).
        return Money(amount=self.amount + other.amount, currency=self.currency)

    def __repr__(self) -> str:
        symbol = CURRENCY_SYMBOLS.get(self.currency, self.currency + " ")
        return f"Money({symbol}{self.amount:.2f})"


m1 = Money(500.0, "INR")
m2 = Money(250.0, "INR")
print(m1 + m2)              # Money(₹750.00)

# m1.amount = 0            # FrozenInstanceError — immutability enforced

# Hashable because of frozen=True — usable as a dict key
prices = {Money(500.0, "INR"): "headphones", Money(2500.0, "INR"): "keyboard"}
print(prices[Money(500.0, "INR")])   # 'headphones'

# Currency mismatch raises
try:
    print(Money(100, "INR") + Money(100, "USD"))
except ValueError as e:
    print(f"Caught: {e}")
```

Why `frozen=True` is the right call here: `Money` is a *value object*. There's no notion of "the same Money changing its amount over time." Two `Money(500, "INR")` instances are the same value and should be interchangeable — exactly the case for immutability and equality-by-value. `frozen=True` gives you all of that, plus `__hash__`, in one decorator.

---

**P2.3 — Mixin composition**

Implement three classes:
- `SerializableMixin` — adds a `to_dict()` method (using `vars(self)`) and `to_json()` (using `json.dumps`).
- `ValidatableMixin` — adds a `validate()` method that returns a list of error strings. Subclasses provide rules by overriding `_validation_rules()`.
- A `Product` class inheriting from both mixins (plus a `BaseModel`), with concrete validation rules.

Show that `Product.__mro__` resolves methods in the expected order, and demonstrate both mixins working on the same instance.

**Solution.**

```python
import json
from datetime import datetime


class BaseModel:
    """Root model. Holds an id and a created_at."""

    def __init__(self, *, id: str):
        self.id = id
        self.created_at = datetime.now()


class SerializableMixin:
    """Adds .to_dict() and .to_json() to any model."""

    def to_dict(self) -> dict:
        # vars(self) returns the instance's __dict__ — all attributes.
        # Strip private attributes and non-serializable values for safety.
        return {
            key: value.isoformat() if isinstance(value, datetime) else value
            for key, value in vars(self).items()
            if not key.startswith("_")
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str)


class ValidatableMixin:
    """Adds .validate() — returns a list of error strings (empty if valid)."""

    def validate(self) -> list[str]:
        errors: list[str] = []
        for rule_name, rule in self._validation_rules().items():
            if not rule():
                errors.append(rule_name)
        return errors

    def _validation_rules(self) -> dict:
        """Subclasses override this with their own rule mapping."""
        return {}


class Product(SerializableMixin, ValidatableMixin, BaseModel):
    def __init__(self, *, id: str, name: str, price: float):
        super().__init__(id=id)
        self.name = name
        self.price = price

    def _validation_rules(self) -> dict:
        return {
            "name must be non-empty":   lambda: bool(self.name.strip()),
            "price must be positive":   lambda: self.price > 0,
        }


# --- Demonstration ---
p = Product(id="p-1", name="Headphones", price=2499.0)
print(p.to_dict())
# {'id': 'p-1', 'created_at': '2026-05-21T...', 'name': 'Headphones', 'price': 2499.0}

print(p.validate())   # []  — no errors

bad = Product(id="p-2", name="  ", price=-1)
print(bad.validate())
# ['name must be non-empty', 'price must be positive']

print(Product.__mro__)
# (Product, SerializableMixin, ValidatableMixin, BaseModel, object)
```

The MRO matches the rule "mixins first, base class last." When `Product.__init__` calls `super().__init__(id=id)`, Python walks the MRO: `SerializableMixin` has no `__init__` of its own, neither does `ValidatableMixin`, so the call ultimately lands on `BaseModel.__init__`, which sets `self.id` and `self.created_at`.

---

**P2.4 — ABC vs Protocol: side-by-side comparison**

Define a `Notifier` contract twice — once as an ABC, once as a Protocol — with methods `send(message: str) -> bool` and `get_delivery_status(message_id: str) -> str`. Then:

(a) Write an `SMSNotifier` class that satisfies both versions.
(b) Show that an existing third-party `SlackClient` (which has the right methods but doesn't inherit from anything) satisfies the Protocol but not the ABC.
(c) Explain in code comments why the Protocol version is better for integration with code you don't control.

**Solution.**

```python
from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable


# --- ABC version ---
class NotifierABC(ABC):
    @abstractmethod
    def send(self, message: str) -> bool: ...

    @abstractmethod
    def get_delivery_status(self, message_id: str) -> str: ...


# --- Protocol version ---
@runtime_checkable
class NotifierProto(Protocol):
    def send(self, message: str) -> bool: ...
    def get_delivery_status(self, message_id: str) -> str: ...


# (a) A class that satisfies both — explicit inheritance for ABC,
#     structural conformance for Protocol.
class SMSNotifier(NotifierABC):
    def send(self, message: str) -> bool:
        print(f"[SMS] {message}")
        return True

    def get_delivery_status(self, message_id: str) -> str:
        return "delivered"


# (b) A third-party class we can't modify.
class SlackClient:
    def send(self, message: str) -> bool:
        return True

    def get_delivery_status(self, message_id: str) -> str:
        return "delivered"


slack = SlackClient()
sms = SMSNotifier()

print(isinstance(sms, NotifierABC))       # True
print(isinstance(slack, NotifierABC))     # False — no inheritance
print(isinstance(sms, NotifierProto))     # True
print(isinstance(slack, NotifierProto))   # True  — structural match

# (c) Why Protocol wins for integration:
# To make SlackClient satisfy NotifierABC, we'd have to monkey-patch its bases
# or wrap it in an adapter class. Both add ceremony and risk for no real benefit
# — the class already does exactly what we need.
# NotifierProto accepts SlackClient as-is, which is the whole point of structural
# subtyping. Use ABC when you want a contract AND shared concrete behaviour.
# Use Protocol when you just need a shape that anything (including third-party
# code) can satisfy.
```

---

#### Type 3 — Design Judgment

**P3.1 — Choose the right interface mechanism**

You're building a payment system. Today, the gateways `StripeGateway`, `RazorpayGateway`, and `PayPalGateway` are all written by your team in the same codebase. In the future, the platform will support third-party payment providers — written by external developers, dropped in as plugins.

Should `PaymentGateway` be an `ABC` or a `Protocol`? Justify your answer. Is there a way to support both?

**Solution.**

There isn't a single "right" answer — it depends on what matters most. Here's the reasoning:

**Arguments for `ABC` for the internal gateways.**
- You control the hierarchy.
- You probably want to share concrete logic — logging payment attempts, recording metrics, retry policies. ABC lets you put these in one place.
- You want the type system (and runtime) to force your team to implement required methods. Forgetting `refund()` should be a `TypeError` at class instantiation, not a `NoneType has no attribute 'refund'` bug at 3am.

**Arguments for `Protocol` for the external/plugin gateways.**
- Third-party developers can't be forced to inherit from your ABC — and you wouldn't want to force a foreign dependency on them anyway.
- You only need to express the *shape* of a payment gateway, not share code with third parties.

**The pragmatic design: do both.**

```python
from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable


@runtime_checkable
class PaymentGateway(Protocol):
    """Public contract — anything with these methods works."""
    def charge(self, amount: float, currency: str) -> str: ...
    def refund(self, transaction_id: str) -> bool: ...


class InternalGateway(ABC):
    """For your team's gateways. Forces implementation + shared behaviour."""

    def log_attempt(self, amount, currency):
        # shared concrete code
        ...

    @abstractmethod
    def charge(self, amount: float, currency: str) -> str: ...

    @abstractmethod
    def refund(self, transaction_id: str) -> bool: ...


class StripeGateway(InternalGateway):
    def charge(self, amount, currency): ...
    def refund(self, tx_id): ...


# A third-party plugin gateway needs no inheritance to be acceptable here.
def process(gateway: PaymentGateway, amount: float, currency: str):
    return gateway.charge(amount, currency)
```

Every `InternalGateway` automatically satisfies the `PaymentGateway` Protocol because of structural subtyping. External plugins satisfy `PaymentGateway` without knowing your ABC exists. You get the best of both: forced contracts and shared code for your team, structural compatibility for the world.

**Alternative.** If you don't have meaningful shared code, drop the ABC entirely and rely on Protocol everywhere. Simpler. Pick this if internal code-sharing isn't actually paying off.

---

**P3.2 — When is a dataclass NOT the right tool?**

For each of the following, decide whether `@dataclass` (or `@dataclass(frozen=True)`) is appropriate, or whether a regular class is better. Justify.

(a) A `BankAccount` with a balance that must never go negative, and methods `deposit()`, `withdraw()`, `transfer()`.
(b) A `Coordinates(lat, lon)` value object used as a dict key in a geographic cache.
(c) An `EventBus` that manages subscriptions and dispatches events to listeners.

**Solution.**

(a) **Regular class.** A `BankAccount` is an *entity* with identity (the account number) and rich behaviour (deposit/withdraw/transfer with rules). Dataclasses excel at data + simple behaviour; they don't help much when the class is mostly methods that enforce invariants. You can still use a dataclass — for the fields — and add methods, but the dataclass-generated `__eq__` may not make sense for an account (two accounts with the same balance aren't "equal"). A regular class avoids the ambiguity.

(b) **`@dataclass(frozen=True)`.** This is the textbook case for a frozen dataclass. `Coordinates` is a pure value object with no identity, used as a dict key. `frozen=True` gives you immutability, structural equality, and `__hash__` in a single decorator. Writing this by hand is just busywork.

```python
@dataclass(frozen=True)
class Coordinates:
    lat: float
    lon: float
```

(c) **Regular class.** An `EventBus` is behaviour-first: it has subscribers, methods to subscribe/unsubscribe, methods to dispatch. There's barely any "data" to auto-generate boilerplate for. A dataclass would auto-generate `__eq__` and `__repr__` based on internal subscriber lists — both meaningless for an `EventBus`. A regular class is clearer and avoids unwanted dunders.

The principle: **dataclasses are for data; regular classes are for behaviour.** Value objects and DTOs love `@dataclass`. Services, controllers, and stateful entities are better as regular classes.

---

#### Type 4 — Capstone

**P4.1 — Design a model layer for a Library Management System**

Design a small model layer using everything from this module. Requirements:

- `Book` — value object identified by ISBN; immutable; usable as a dict key.
- `Member` — entity with timestamps, an audit trail of changes, and validation (name must be non-empty, borrow limit must be positive).
- `Borrowable` — a Protocol that any lendable item (Book, Magazine, DVD) must satisfy, with `is_available()` and `get_due_date()`.
- `LibraryItem` — an ABC for items the library owns, with abstract `catalogue_entry()` and shared `age_in_collection()`.

Then walk through one scenario: a `Member` borrows a `Book`, the `Book`'s availability changes, and the `Member`'s audit trail records the borrow event.

**Solution.**

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, date, timedelta
from typing import Protocol, runtime_checkable


# ---------- Value object: Book ----------
@dataclass(frozen=True)
class Book:
    """
    A book is identified by its ISBN. The same ISBN means the same book
    (logically) — equality and hashing are by all fields, which suit
    a pure value object. Frozen so it can sit in dicts and sets.
    """
    isbn: str
    title: str
    author: str


# ---------- Mixins for entities ----------
class TimestampMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.created_at = datetime.now()
        self.updated_at = self.created_at

    def touch(self):
        self.updated_at = datetime.now()


class AuditMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._audit_log: list[dict] = []

    def record_change(self, action: str, details: dict):
        self._audit_log.append({
            "action": action,
            "details": details,
            "at": datetime.now(),
        })

    def audit_trail(self) -> list[dict]:
        return list(self._audit_log)


# ---------- Base for entities ----------
class BaseEntity:
    def __init__(self, *, id: str):
        self.id = id


# ---------- Member (entity, not value object) ----------
class Member(TimestampMixin, AuditMixin, BaseEntity):
    def __init__(self, *, id: str, name: str, borrow_limit: int):
        super().__init__(id=id)
        self._validate(name, borrow_limit)
        self.name = name
        self.borrow_limit = borrow_limit
        self.borrowed: dict[str, date] = {}    # isbn -> due_date

    def _validate(self, name, borrow_limit):
        if not name.strip():
            raise ValueError("Member name cannot be empty")
        if borrow_limit <= 0:
            raise ValueError("borrow_limit must be positive")

    def can_borrow_more(self) -> bool:
        return len(self.borrowed) < self.borrow_limit

    def borrow(self, book: Book, due_date: date):
        if not self.can_borrow_more():
            raise RuntimeError("Borrow limit reached")
        self.borrowed[book.isbn] = due_date
        self.touch()
        self.record_change(
            "borrowed",
            {"isbn": book.isbn, "title": book.title, "due": due_date.isoformat()},
        )


# ---------- Protocol: structural contract for lendable items ----------
@runtime_checkable
class Borrowable(Protocol):
    """Any class with these methods is borrowable — no inheritance required."""
    def is_available(self) -> bool: ...
    def get_due_date(self) -> date | None: ...


# ---------- ABC: items the library physically owns ----------
class LibraryItem(ABC):
    """
    For things the library owns and tracks. ABC because we want forced
    implementation AND shared concrete behaviour (age_in_collection).
    """

    def __init__(self, acquired_on: date):
        self.acquired_on = acquired_on

    def age_in_collection(self) -> timedelta:
        return date.today() - self.acquired_on

    @abstractmethod
    def catalogue_entry(self) -> str:
        """One-line catalogue summary."""


# ---------- A concrete library item satisfying both LibraryItem and Borrowable ----------
class BookCopy(LibraryItem):
    """
    A *physical copy* of a Book. The Book is a value object; the BookCopy
    is the physical thing on the shelf — it can be borrowed, has a state.
    """

    def __init__(self, copy_id: str, book: Book, acquired_on: date):
        super().__init__(acquired_on=acquired_on)
        self.copy_id = copy_id
        self.book = book
        self._due_date: date | None = None

    def is_available(self) -> bool:
        return self._due_date is None

    def get_due_date(self) -> date | None:
        return self._due_date

    def borrow_until(self, due: date):
        if not self.is_available():
            raise RuntimeError(f"Copy {self.copy_id} is already borrowed")
        self._due_date = due

    def catalogue_entry(self) -> str:
        return f"[{self.copy_id}] {self.book.title} by {self.book.author}"


# ---------- Scenario walkthrough ----------
book = Book(isbn="978-0-13-468599-1", title="Effective Python", author="Brett Slatkin")
copy = BookCopy(copy_id="C-001", book=book, acquired_on=date(2024, 1, 15))

member = Member(id="M-001", name="Amit", borrow_limit=3)

# Confirm the Borrowable Protocol is satisfied — structurally, no inheritance.
assert isinstance(copy, Borrowable)

# The member borrows the copy.
due = date.today() + timedelta(days=14)
copy.borrow_until(due)
member.borrow(book, due)

print(copy.catalogue_entry())          # [C-001] Effective Python by Brett Slatkin
print(copy.is_available())             # False
print(copy.get_due_date())             # in 14 days

print(member.borrowed)                 # {'978-0-13-468599-1': date(...)}
print(member.audit_trail())            # one 'borrowed' entry
```

**Why each design decision was made:**

- **`Book` is a frozen dataclass.** Books are values, not entities — two `Book` objects with the same ISBN are interchangeable. `frozen=True` gives us immutability and a free `__hash__` so books can live in dicts/sets.
- **`Member` is a regular class with mixins.** Members are entities (they have an `id`, lifecycle, mutable state). Timestamping and auditing are reused across entities, so they become mixins. The MRO is `Member → TimestampMixin → AuditMixin → BaseEntity → object` — mixins first, base last.
- **`Borrowable` is a Protocol.** A magazine or DVD class (potentially defined elsewhere) should be borrowable without having to inherit from anything. Protocol enables this with no ceremony.
- **`LibraryItem` is an ABC.** Things the library owns share concrete behaviour (`age_in_collection`) and need forced implementation of `catalogue_entry`. ABC is the right fit.
- **`BookCopy` is the bridge.** It inherits from the ABC `LibraryItem` (because it's a library-owned thing) and structurally satisfies the `Borrowable` Protocol (because it has `is_available` and `get_due_date`). One class can satisfy both an ABC and a Protocol — they're complementary, not exclusive.

This single example uses: dataclasses (frozen), mixins with cooperative `super()`, ABC, Protocol, validated state, and audit trails — i.e., the entire toolkit working together.

---

**You're now fluent in Python OOP.** Next up: **SOLID Principles** — the five rules that separate "code that uses classes" from "code that uses classes *well*."

---

*This content is part of **Codeverra** — a platform for learning coding, data science, DSA, and AI from scratch.*
*Explore more: [https://codeverra.com](https://codeverra.com)*
