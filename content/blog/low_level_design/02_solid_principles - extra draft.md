---
title: "LLD Foundations - SOLID Principles"
description: "A complete guide to  solid principles which are fundamental of object oriented design."

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
  image: "/images/LLD - 2.png"
  alt: "SOLID principles explained using Python"
  caption: "SOLID principles in Python: A Deep Dive"
  relative: true
  hidden: false
---

# SOLID Principles

**Prerequisite:** This material assumes familiarity with Python object-oriented programming, including classes, inheritance, polymorphism, and abstraction. The discussion builds directly on that foundation and extends it toward writing object-oriented code that remains maintainable as a system grows.

---

## Table of Contents

1. [Why SOLID Exists](#1-why-solid-exists)
2. [What SOLID Stands For](#2-what-solid-stands-for)
3. [Single Responsibility Principle (SRP)](#3-single-responsibility-principle-srp)
4. [Open/Closed Principle (OCP)](#4-openclosed-principle-ocp)
5. [Liskov Substitution Principle (LSP)](#5-liskov-substitution-principle-lsp)
6. [Interface Segregation Principle (ISP)](#6-interface-segregation-principle-isp)
7. [Dependency Inversion Principle (DIP)](#7-dependency-inversion-principle-dip)
8. [How the Five Principles Reinforce Each Other](#8-how-the-five-principles-reinforce-each-other)
9. [Capstone Example: Applying All Five Together](#9-capstone-example)
10. [Common Pitfalls and Anti-Patterns](#10-common-pitfalls)
11. [When Not to Apply SOLID](#11-when-not-to-apply-solid)
12. [Summary and Key Takeaways](#12-summary)
13. [Self-Assessment Questions](#13-self-assessment-questions)
14. [Practice Exercises with Solutions](#14-practice-exercises)

---

## 1. Why SOLID Exists

A learner who has completed a course on object-oriented programming knows how to define classes, establish inheritance hierarchies, and use polymorphism. A natural question follows: if these tools are already available, why does a separate set of principles need to be learned before writing "good" object-oriented code?

The answer becomes clear once a codebase grows beyond the size of a classroom exercise. Consider a common scenario in professional software development. An engineer joins a team maintaining a system of fifty classes. A request arrives to add a new payment method. The change takes two days, touches six files, and breaks two unrelated tests. The engineer fixes them. The following week, a colleague adds an unrelated feature, and it breaks the first engineer's code. Over several sprints, the word "refactor" becomes something the team avoids because no one is confident about the blast radius of a change. Development velocity declines steadily even though the team is not writing objectively bad code line by line.

This outcome is not caused by a flaw in Python or in object-oriented programming as a paradigm. It is a **design** problem. The classes exist and function correctly in isolation, but the relationships between them are tangled in a way that causes a change in one place to propagate unpredictably to others.

Object-oriented programming supplies the raw constructs: classes, objects, inheritance, and polymorphism. These constructs do not, by themselves, guarantee a well-structured system, in the same way that possessing bricks and cement does not guarantee a structurally sound building. The arrangement of the materials determines whether the resulting structure is sound or fragile.

**SOLID is a set of five design principles that describe how object-oriented constructs should be arranged so that the resulting system exhibits four properties:**

| Property | Definition |
|---|---|
| Flexibility | New features can be added with proportionally small effort. |
| Robustness | A change in one part of the system does not produce unintended effects elsewhere. |
| Testability | Individual components can be verified in isolation, without requiring the entire system to be running. |
| Readability | Each component has a clearly identifiable purpose, so a reader does not need to trace unrelated logic to understand it. |

### Relating SOLID to OOP

It is useful to think of object-oriented programming as supplying the vocabulary of a language, where classes act as nouns and methods act as verbs. SOLID supplies the grammar: the rules that determine how this vocabulary should be composed so that the resulting statements remain coherent as more are added. A system with correct vocabulary but poor grammar can still communicate its intent, but every addition makes the whole harder to parse and more prone to contradiction.

### Historical Note

The individual principles predate the acronym. Several were described by **Bertrand Meyer** and **Barbara Liskov** in the late 1980s. **Robert C. Martin** (commonly referred to as "Uncle Bob") consolidated and popularized them in the early 2000s, and the acronym SOLID itself was coined later by **Michael Feathers**. These principles are not laws in the mathematical sense. They are heuristics distilled from decades of observed failure patterns in large codebases, and they should be applied with judgment rather than followed dogmatically. Section 11 addresses this distinction in detail.

---

## 2. What SOLID Stands For

| Letter | Principle | Core Statement |
|---|---|---|
| S | Single Responsibility Principle | A class should have only one reason to change. |
| O | Open/Closed Principle | Software entities should be open for extension but closed for modification. |
| L | Liskov Substitution Principle | Objects of a subtype must be substitutable for objects of their base type without altering the correctness of the program. |
| I | Interface Segregation Principle | Clients should not be forced to depend on methods they do not use. |
| D | Dependency Inversion Principle | High-level modules and low-level modules should both depend on abstractions, not on each other directly. |

Each principle is examined in detail in the sections that follow, including the specific problem it addresses, the mechanism by which it solves that problem, and the ways in which it can be misapplied.

---

## 3. Single Responsibility Principle (SRP)

> "A class should have one, and only one, reason to change."
> Robert C. Martin

### Precise Definition

A common but imprecise reading of SRP states that "a class should do only one thing." This phrasing is too vague to apply consistently, since almost any class can be described as doing "one thing" at a sufficiently abstract level, and almost any class can also be decomposed into multiple smaller actions at a sufficiently granular level.

The precise formulation, as intended by Martin, concerns **stakeholders**, not method count:

> A class should have exactly one stakeholder, or one category of stakeholder, whose changing requirements would require modifying that class.

In this formulation, "reason to change" means "a distinct source of requirements that could independently demand a change." If two responsibilities are typically modified by different people, for different business reasons, at different times, they represent two separate reasons to change and therefore belong in two separate classes.

### The Problem Without SRP

Consider the following class:

```python
class Employee:
    def __init__(self, name, hours_worked, hourly_rate):
        self.name = name
        self.hours_worked = hours_worked
        self.hourly_rate = hourly_rate

    def calculate_pay(self):
        return self.hours_worked * self.hourly_rate

    def save_to_database(self):
        # Opens DB connection, writes employee, closes connection
        print(f"Saving {self.name} to DB...")

    def generate_report(self, format):
        if format == "pdf":
            print(f"Generating PDF for {self.name}...")
        elif format == "html":
            print(f"Generating HTML for {self.name}...")
```

This single class serves three distinct stakeholders:

1. The **finance department**, which owns the rules governing pay calculation.
2. The **database or infrastructure team**, which owns how employee data is persisted.
3. The **reporting team**, which owns how employee data is presented.

Whenever finance revises pay rules, this class must be modified. Whenever the infrastructure team migrates to a new database technology, this class must be modified. Whenever reporting adds a new output format, this class must be modified. The class becomes what practitioners refer to as a **hot file**, a file that is edited frequently for unrelated reasons, which increases the probability that an unrelated change introduces a regression.

### Applying SRP

Each responsibility is extracted into its own class:

```python
class Employee:
    def __init__(self, name, hours_worked, hourly_rate):
        self.name = name
        self.hours_worked = hours_worked
        self.hourly_rate = hourly_rate


class PayrollCalculator:
    def calculate_pay(self, employee):
        return employee.hours_worked * employee.hourly_rate


class EmployeeRepository:
    def save(self, employee):
        print(f"Saving {employee.name} to DB...")


class EmployeeReportGenerator:
    def generate(self, employee, format):
        if format == "pdf":
            print(f"PDF for {employee.name}")
        elif format == "html":
            print(f"HTML for {employee.name}")
```

With this structure, each stakeholder's changes are isolated:

- A revision to pay rules affects only `PayrollCalculator`.
- A database migration affects only `EmployeeRepository`.
- A new report format affects only `EmployeeReportGenerator`.

Each class now has exactly one reason to change, satisfying the principle.

### A Common Misreading

SRP does not state that a class must have only one method, nor that classes must be kept extremely small. A class can legitimately contain many methods if all of them serve one cohesive responsibility. For example, a `ShoppingCart` class with methods `add_item`, `remove_item`, `update_quantity`, `total_price`, and `clear` has five methods but a single responsibility: managing the state of a cart. This design satisfies SRP despite having multiple methods, because all five methods change for the same reason, namely a change in how the cart's contents are managed.

### Indicators of an SRP Violation

| Indicator | Explanation |
|---|---|
| The class name contains "and" | Names such as `UserAndEmailSender` signal that two responsibilities were merged into one class. |
| Groups of methods never share state | If half the methods never touch the same instance attributes as the other half, the class is likely serving two purposes. |
| Multiple teams edit the same class | If different teams routinely modify the same file for unrelated reasons, responsibilities have not been separated. |
| Business logic is mixed with I/O | A class that both computes a result and performs database access, file access, or network access typically has more than one reason to change. |
| Unrelated test failures | A change to one method causing failures in tests for a seemingly unrelated feature indicates hidden coupling between responsibilities. |

### Scope of SRP Beyond Classes

The principle applies at multiple levels of granularity within a system:

- **Methods**: a single method should perform one logical operation. A three-hundred-line method that both validates input and performs a calculation and formats output is a violation at the method level.
- **Modules and packages**: a module should group functionality that serves one cohesive purpose.
- **Services**: in a distributed system, a microservice should own one business capability rather than several unrelated ones.

The scale changes, but the underlying reasoning, isolating distinct sources of change, remains identical.

---

## 4. Open/Closed Principle (OCP)

> "Software entities (classes, modules, functions) should be open for extension, but closed for modification."
> Bertrand Meyer, 1988, popularized by Robert C. Martin

### Precise Definition

The principle states that new behavior should be addable to a system without altering the source code of existing, already-tested components. "Open for extension" means the system's behavior can be extended as requirements grow. "Closed for modification" means that extending the behavior does not require editing the source code of the module that already works.

This does not mean a class can never be edited. Bug fixes and legitimate design corrections necessarily involve modification. The principle addresses the **common, expected axis of change**: when a system is known to require new variants of a certain behavior over time (new discount types, new payment methods, new shape types), the code should be structured so that adding a variant means adding new code rather than editing existing code.

Modifying working code carries risk. Every edit to an already-functioning class introduces the possibility of a regression, requires re-running and possibly rewriting existing tests, and can trigger changes in code that depends on the modified class. OCP reduces this risk by containing extension to new code paths.

### The Problem Without OCP

Consider a discount calculator implemented with conditional branching:

```python
class DiscountCalculator:
    def calculate(self, customer_type, amount):
        if customer_type == "regular":
            return amount * 0.05
        elif customer_type == "premium":
            return amount * 0.10
        elif customer_type == "vip":
            return amount * 0.20
        else:
            return 0
```

When a new customer category, "corporate," is introduced with a fifteen percent discount, the existing method must be opened and another `elif` branch added. When a "student" category follows with an eight percent discount, the method is edited again. Over time, as seasonal discounts, regional discounts, and first-time-buyer discounts accumulate, the method grows into a large conditional chain in which every new addition risks altering the behavior of an existing branch, and every addition requires re-verifying the entire method.

### Applying OCP

Polymorphism is used to allow new behavior to be introduced through new classes rather than through modification of existing ones:

```python
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount): pass

class RegularDiscount(DiscountStrategy):
    def calculate(self, amount): return amount * 0.05

class PremiumDiscount(DiscountStrategy):
    def calculate(self, amount): return amount * 0.10

class VIPDiscount(DiscountStrategy):
    def calculate(self, amount): return amount * 0.20


class DiscountCalculator:
    def calculate(self, strategy, amount):
        return strategy.calculate(amount)
```

Adding a corporate discount now requires only a new class:

```python
class CorporateDiscount(DiscountStrategy):
    def calculate(self, amount): return amount * 0.15
```

No line inside `DiscountCalculator` or any existing strategy class is changed. The system has been extended, not modified.

### Relationship to Polymorphism

OCP depends on polymorphism as its enabling mechanism. Without polymorphism, extending behavior would require explicit type checks, such as `if isinstance(x, RegularDiscount)`, and every new type would require editing this check, which is precisely the modification OCP seeks to avoid. Polymorphism allows the calling code, `DiscountCalculator` in this example, to remain unaware of how many strategy classes exist.

### A Necessary Qualification

OCP does not imply that every part of a system should be made abstract and extensible. Attempting to make everything open for extension produces excessive layers of abstraction that make the system harder to understand without providing corresponding benefit. The engineering judgment required here is identifying which axes of change are likely to occur in practice and protecting only those axes with the appropriate abstraction. Stable, unlikely-to-change logic can remain concrete.

### Indicators of an OCP Violation

| Indicator | Explanation |
|---|---|
| Growing conditional chains | Every new feature requires adding a branch to an existing `if`/`elif` or `switch` structure. |
| Type checks scattered across files | Adding a new type requires updating multiple files that each check for that type explicitly. |
| Repeated re-testing of stable code | Old, previously verified functionality must be re-tested every time a new feature is added. |
| Maintenance comments | Comments such as "remember to update this when a new type is added" indicate a hardcoded extension point. |

---

## 5. Liskov Substitution Principle (LSP)

> "If S is a subtype of T, then objects of type T in a program may be replaced with objects of type S without altering any desirable properties of that program."
> Barbara Liskov, 1987

### Precise Definition

LSP states that any code written to operate on a base class should continue to operate correctly when given an instance of any subclass of that base class, without the calling code needing to know which specific subclass it received.

If a class `Sparrow` inherits from `Bird`, then any function written to accept a `Bird` argument must behave correctly when a `Sparrow` instance is passed to it, with no special handling required. LSP formalizes what it means for an inheritance relationship to be behaviorally correct, as opposed to merely syntactically valid. It distinguishes a subclass that genuinely satisfies the contract of its parent from a subclass that shares a superficial resemblance to the parent but violates the parent's guarantees when actually used.

### Classic Violation: The Rectangle and Square Problem

Geometrically, a square is a special case of a rectangle where width equals height. Modeling this relationship through inheritance produces a behavioral contradiction:

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def set_width(self, w):
        self.width = w

    def set_height(self, h):
        self.height = h

    def area(self):
        return self.width * self.height


class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)

    def set_width(self, w):
        self.width = w
        self.height = w   # Keep it square

    def set_height(self, h):
        self.width = h
        self.height = h
```

Consider code written against the `Rectangle` interface:

```python
def stretch_rectangle(rect: Rectangle):
    rect.set_width(10)
    rect.set_height(5)
    assert rect.area() == 50   # Expected for a rectangle
```

Passing a genuine `Rectangle(1, 1)` produces an area of 50, as expected. Passing a `Square(1)` produces an area of 25, and the assertion fails. The `Square` subclass silently breaks an implicit contract of `Rectangle`, namely that width and height can be set independently of one another. Any code written against `Rectangle`, without knowledge of `Square`, contains a latent defect that surfaces only when a `Square` instance is supplied.

This demonstrates that LSP is a behavioral criterion, not a mathematical or taxonomic one. Despite the "is-a" relationship holding mathematically, `Square` is not substitutable for `Rectangle` in this design, and the principle is therefore violated. The correct resolution is to avoid modeling `Square` as a subclass of `Rectangle`. The two should be represented as separate types, each with its own contract.

### Another Classic Violation: Birds and Flight

```python
class Bird:
    def fly(self):
        print("Flying!")

class Sparrow(Bird):
    pass

class Penguin(Bird):
    def fly(self):
        raise NotImplementedError("Penguins can't fly!")
```

Code written against the base class:

```python
def make_birds_fly(birds):
    for bird in birds:
        bird.fly()
```

If the list passed to `make_birds_fly` includes a `Penguin` instance, the program raises an exception at runtime, since `Penguin` cannot honor the contract implied by `Bird.fly`. This is again an LSP violation. The correction involves restructuring the hierarchy so that the base class contract reflects only what every subclass can genuinely guarantee:

```python
class Bird(ABC):
    @abstractmethod
    def move(self): pass

class FlyingBird(Bird):
    def move(self): print("Flying!")

class FlightlessBird(Bird):
    def move(self): print("Walking!")

class Sparrow(FlyingBird): pass
class Penguin(FlightlessBird): pass
```

With this hierarchy, any `Bird` instance can be asked to `move()`, and the guarantee holds for every subclass without exception.

### Formal Rules for Preserving LSP

A subclass must satisfy the following conditions to remain substitutable for its parent:

1. **Preconditions cannot be strengthened.** If the parent method accepts any integer, the child method cannot narrow this to accept only positive integers.
2. **Postconditions cannot be weakened.** If the parent method guarantees a sorted list is returned, the child method cannot return an unsorted list.
3. **Invariants must be preserved.** If the parent guarantees that an account balance never falls below zero, the child cannot introduce a code path that violates this invariant.
4. **The history constraint must hold.** A subclass should not permit state transitions that the parent's contract forbids.

### An Illustrative Comparison

Consider a hiring scenario in which a role is defined as: report at 9 AM, drive from location A to location B, without additional conditions. A candidate who fulfills exactly this description can be substituted freely into any schedule built around this role. A second candidate states that they will only drive on Tuesdays and will not use highways. This second candidate may describe themselves using the same job title, but they cannot be substituted into a schedule that assumes the unconditional role, since doing so will produce failures whenever the schedule requires a non-Tuesday or a highway route.

The principle, translated to software, states that if a subclass's actual behavior differs materially from what the base class's contract promises, it should not be modeled as that subclass. It should instead be represented as a distinct type with its own, narrower contract.

### Why LSP Matters

A violation of LSP undermines the value of polymorphism itself. If subtypes are not genuinely substitutable, calling code cannot safely treat all subtypes uniformly and must instead perform type checks to handle exceptions, which defeats the purpose of using polymorphism in the first place. Since OCP depends on polymorphism functioning reliably, an LSP violation typically undermines OCP as well.

### Indicators of an LSP Violation

| Indicator | Explanation |
|---|---|
| Overridden methods raise `NotImplementedError` | A subclass refuses to support an operation the parent guarantees. |
| Overridden methods return a weaker guarantee | The subclass returns a different type or provides a less specific result than the parent's contract promises. |
| Callers require `isinstance()` checks | If code using a base class needs to branch based on the concrete subtype, substitutability has already broken down. |
| Hidden side effects on state | An overridden method silently mutates object state in ways the base class contract does not anticipate. |

---

## 6. Interface Segregation Principle (ISP)

> "Clients should not be forced to depend on interfaces they do not use."
> Robert C. Martin

### Precise Definition

ISP states that large interfaces containing many unrelated methods should be decomposed into smaller, focused interfaces, so that a class implementing an interface is only required to implement methods relevant to it, and client code depending on an interface only needs knowledge of the methods it actually calls.

### The Problem Without ISP

Consider an interface intended to represent office equipment:

```python
from abc import ABC, abstractmethod

class OfficeMachine(ABC):
    @abstractmethod
    def print(self, doc): pass

    @abstractmethod
    def scan(self, doc): pass

    @abstractmethod
    def fax(self, doc): pass
```

A multifunction printer implements this interface without difficulty:

```python
class AllInOnePrinter(OfficeMachine):
    def print(self, doc): print(f"Printing {doc}")
    def scan(self, doc): print(f"Scanning {doc}")
    def fax(self, doc): print(f"Faxing {doc}")
```

A basic printer, however, cannot scan or fax, yet the interface forces it to declare these methods:

```python
class BasicPrinter(OfficeMachine):
    def print(self, doc): print(f"Printing {doc}")
    def scan(self, doc): raise NotImplementedError("Can't scan!")
    def fax(self, doc): raise NotImplementedError("Can't fax!")
```

This design produces two distinct problems. First, `BasicPrinter` carries stub methods whose only function is to raise an exception, which is wasted code that provides no value. Second, `BasicPrinter` claims, through its type, to be a fully functional `OfficeMachine`, but breaks this claim the moment it is used polymorphically as one. This is a direct violation of LSP, which illustrates that a bloated interface (an ISP violation) frequently forces the classes that implement it into an LSP violation as well.

### Applying ISP

The single, large interface is decomposed into narrower, single-purpose interfaces:

```python
class Printer(ABC):
    @abstractmethod
    def print(self, doc): pass

class Scanner(ABC):
    @abstractmethod
    def scan(self, doc): pass

class Fax(ABC):
    @abstractmethod
    def fax(self, doc): pass


class BasicPrinter(Printer):
    def print(self, doc): print(f"Printing {doc}")


class AllInOnePrinter(Printer, Scanner, Fax):
    def print(self, doc): print(f"Printing {doc}")
    def scan(self, doc): print(f"Scanning {doc}")
    def fax(self, doc): print(f"Faxing {doc}")
```

With this structure, `BasicPrinter` implements only the interface it can genuinely fulfill. `AllInOnePrinter` composes multiple narrow interfaces to represent its full functionality. Client code that requires only printing depends on the `Printer` interface alone and remains entirely unaware of scanning or faxing capability.

### ISP in Python

Python's support for duck typing reduces the practical impact of this issue in some contexts, since code can be written to accept any object exposing a required method without formally declaring an interface. However, when interfaces are explicitly defined using abstract base classes or `typing.Protocol`, the same principle applies: interfaces should remain narrow.

```python
from typing import Protocol

class Printable(Protocol):
    def print(self, doc): ...

def print_many(docs, printer: Printable):
    for doc in docs:
        printer.print(doc)
```

Any object that defines a `print` method, regardless of what other methods it defines, satisfies the `Printable` protocol. The interface remains narrow and focused on exactly the capability the client requires.

### Indicators of an ISP Violation

| Indicator | Explanation |
|---|---|
| `NotImplementedError` in subclasses | A concrete class raises an error for a method it was forced to declare but cannot support. |
| Interfaces with many rarely co-used methods | Methods on the same interface are used together infrequently, suggesting they belong to different clients. |
| Clients importing large interfaces for small usage | Code depends on a large interface but only calls one or two of its methods. |
| Bloated test doubles | Mocks and stubs used in tests must implement many methods that the test does not actually exercise. |

---

## 7. Dependency Inversion Principle (DIP)

> "High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions."
> Robert C. Martin

### Precise Definition

DIP states that classes should depend on abstractions (interfaces or abstract base classes) rather than on concrete implementations, so that implementations can be substituted without modifying the code that uses them.

Two terms require precise definition here. A **high-level module** is one that contains business logic, that is, the policies and rules that define what the application actually does. A **low-level module** is one that contains mechanical detail, such as how data is read from or written to a database, a file system, or a network connection.

In a naive design, high-level modules depend directly on low-level modules: business logic calls the database access code directly. DIP requires inverting this relationship so that both the high-level and low-level modules depend on an abstraction positioned between them.

### The Problem Without DIP

```python
class MySQLDatabase:
    def save(self, data):
        print(f"Saving {data} to MySQL")


class UserService:
    def __init__(self):
        self.db = MySQLDatabase()   # Hardcoded dependency

    def register_user(self, name):
        self.db.save({"name": name})
```

This design produces three distinct problems:

1. **Tight coupling.** `UserService` can operate only with `MySQLDatabase`. Switching to PostgreSQL requires editing `UserService` directly.
2. **Reduced testability.** A unit test for `UserService` cannot run without a live MySQL server, which converts what should be a fast unit test into a slower integration test.
3. **Reduced flexibility.** Every variation, such as logging to a file during development or publishing events to a message queue instead of a database, requires modifying the internals of `UserService`.

`UserService`, which represents high-level business logic, depends directly on `MySQLDatabase`, a low-level mechanism. Any change to the storage mechanism therefore forces a change in the business logic that has nothing conceptually to do with storage.

### Applying DIP

An abstraction is introduced between the two layers:

```python
from abc import ABC, abstractmethod

class Database(ABC):    # The abstraction
    @abstractmethod
    def save(self, data): pass


class MySQLDatabase(Database):
    def save(self, data):
        print(f"Saving {data} to MySQL")


class PostgresDatabase(Database):
    def save(self, data):
        print(f"Saving {data} to Postgres")


class InMemoryDatabase(Database):    # Useful for tests
    def __init__(self):
        self.data = []
    def save(self, data):
        self.data.append(data)


class UserService:
    def __init__(self, db: Database):   # Depends on the abstraction
        self.db = db

    def register_user(self, name):
        self.db.save({"name": name})
```

This design allows the following usages without modifying `UserService`:

```python
# Production
service = UserService(MySQLDatabase())

# Development
service = UserService(PostgresDatabase())

# Tests
fake_db = InMemoryDatabase()
service = UserService(fake_db)
service.register_user("Amit")
assert fake_db.data == [{"name": "Amit"}]
```

`UserService` has no knowledge of which concrete class implements `Database`. Substituting one implementation for another is a change made once, at the point where the object is constructed, rather than a change to the class's internal logic.

### Dependency Injection

**Dependency injection (DI)** refers to the technique of supplying a class's dependencies from outside the class, typically through its constructor, rather than having the class construct its own dependencies internally. DI is the standard practical mechanism through which DIP is achieved. When a dependency is supplied externally, it can be substituted freely for tests or for different runtime environments, and the class receiving the dependency has no knowledge of which implementation it was given.

Three common injection styles are used in practice:

| Style | Description |
|---|---|
| Constructor injection | The dependency is passed as an argument to `__init__`. This is the most common style. |
| Setter or method injection | The dependency is supplied through a setter method or as a parameter to a specific method, rather than at construction time. |
| Framework-based injection | A framework automatically resolves and supplies dependencies, for example FastAPI's `Depends` mechanism. |

### An Illustrative Comparison

Consider the distinction between a laptop with a charging port hardwired to accept only one proprietary charger design and a laptop that charges through a standard USB-C port. In the first case, losing the specific charger, or traveling to a region where it is unavailable, leaves the device unusable. In the second case, the laptop depends on an abstraction, namely conformance to the USB-C specification, and can therefore draw power from any compliant source: a wall adapter, a portable battery, or another laptop.

The laptop, representing the high-level component in this comparison, has no knowledge of the specific power source it is connected to. It depends only on the interface. Manufacturers of power sources, representing the low-level components, also conform to that same interface. Neither side is required to know the internal details of the other, and either side can be replaced independently as long as the interface is honored.

### Why the Term "Inversion"

In the naive design, the dependency arrow points from the high-level module toward the low-level module:

```
UserService  ->  MySQLDatabase
 (high)          (low)
```

After applying DIP, both modules point toward the abstraction instead:

```
UserService     MySQLDatabase
     |                |
     v                v
     Database (abstraction)
```

This reversal of direction, in which the low-level detail now conforms to an abstraction rather than the high-level module depending on the low-level detail directly, is the reason the principle is described as an "inversion" of the conventional dependency direction.

### Indicators of a DIP Violation

| Indicator | Explanation |
|---|---|
| Internal construction of dependencies | A class constructs its own collaborators, for example `self.db = MySQLDatabase()`, rather than receiving them from outside. |
| Tests require real infrastructure | Unit tests cannot run without a real database, external API, or file system available. |
| Wide-reaching implementation swaps | Replacing one implementation with another requires editing many files rather than a single configuration point. |
| Direct imports of infrastructure libraries in business logic | Business logic modules directly import libraries such as a specific database driver or HTTP client library. |

---

## 8. How the Five Principles Reinforce Each Other

The five principles should not be treated as an independent checklist to be verified one at a time. In practice, they form a reinforcing chain, where satisfying one principle makes the next easier to satisfy, and violating one principle tends to produce violations of the others.

The chain can be summarized as follows. Applying SRP forces responsibilities to be split across multiple small, focused classes. Small, focused classes naturally lead to small, focused interfaces, which satisfies ISP. Small interfaces are easier for subclasses to implement honestly, which supports LSP. When classes behave honestly with respect to their declared contracts, substituting one implementation for another becomes safe, which enables DIP. Once code depends on abstractions rather than concrete types, adding new behavior becomes a matter of adding new implementations of that abstraction rather than modifying existing code, which satisfies OCP.

```
SRP -> small classes -> small interfaces (ISP) -> honest subclasses (LSP)
                                                        |
                                            safe polymorphism
                                                        |
                                    abstractions trusted (DIP)
                                                        |
                                     extension over modification (OCP)
                                                        |
                               system stays maintainable -> easier SRP next time
```

The reverse pattern also holds. A single class accumulating multiple unrelated responsibilities (an SRP violation) typically exposes a bloated interface (an ISP violation). Subclasses of that interface are then forced to implement methods that do not apply to them, often by raising exceptions (an LSP violation). Because these subclasses cannot be trusted to behave correctly when substituted, code cannot safely depend on the abstraction (a DIP violation), which in turn forces the calling code to fall back on explicit type checks and conditional branches (an OCP violation).

---

## 9. Capstone Example

This section constructs a notification system from an initial version that violates all five principles, then refactors it step by step to satisfy each one.

### Initial Version

```python
class NotificationService:
    def send(self, user, message, channel):
        if channel == "email":
            # Hardcoded SMTP stuff
            print(f"Connecting to smtp.example.com...")
            print(f"Email to {user.email}: {message}")
        elif channel == "sms":
            # Hardcoded Twilio stuff
            print(f"Calling Twilio API...")
            print(f"SMS to {user.phone}: {message}")
        elif channel == "push":
            print(f"Push to {user.device_id}: {message}")

        # Also log to database
        print(f"Logging notification to MySQL...")

        # Also update user's last_notified_at
        user.last_notified_at = "now"
```

The violations present in this version are summarized below.

| Principle | Violation |
|---|---|
| SRP | The class mixes message sending, logging, and user record updates in a single method. |
| OCP | Adding a new channel, such as Slack or Telegram, requires editing this method directly. |
| LSP | Not directly applicable, since no substitutable types exist yet, but the monolithic design prevents introducing them. |
| ISP | Not directly applicable yet, since no interface has been defined, which is itself part of the problem. |
| DIP | SMTP, Twilio, and MySQL are hardcoded, making the class impossible to unit test without real external services. |

### Refactoring Step by Step

**Step 1: Extract narrow interfaces (addresses ISP).**

```python
from abc import ABC, abstractmethod

class NotificationChannel(ABC):
    @abstractmethod
    def send(self, recipient, message): pass

class NotificationLogger(ABC):
    @abstractmethod
    def log(self, recipient, message, channel_name): pass
```

**Step 2: Implement each channel independently (addresses OCP).**

```python
class EmailChannel(NotificationChannel):
    def send(self, recipient, message):
        print(f"Email to {recipient.email}: {message}")

class SMSChannel(NotificationChannel):
    def send(self, recipient, message):
        print(f"SMS to {recipient.phone}: {message}")

class PushChannel(NotificationChannel):
    def send(self, recipient, message):
        print(f"Push to {recipient.device_id}: {message}")
```

Introducing `SlackChannel` or `TelegramChannel` at a later date requires creating a new class only. No existing class is touched.

**Step 3: Implement logging as a separate responsibility (addresses SRP).**

```python
class DatabaseLogger(NotificationLogger):
    def log(self, recipient, message, channel_name):
        print(f"DB log: {channel_name} to {recipient}: {message}")

class InMemoryLogger(NotificationLogger):    # For tests
    def __init__(self):
        self.entries = []
    def log(self, recipient, message, channel_name):
        self.entries.append((recipient, message, channel_name))
```

**Step 4: Introduce an orchestrator that depends on abstractions (addresses DIP).**

```python
class NotificationService:
    def __init__(self, channel: NotificationChannel, logger: NotificationLogger):
        self.channel = channel
        self.logger = logger

    def notify(self, recipient, message):
        self.channel.send(recipient, message)
        self.logger.log(recipient, message, self.channel.__class__.__name__)
```

**Step 5: Verify LSP.** Any implementation of `NotificationChannel` can be substituted for another, since all of them honor the same contract, `send(recipient, message)`, without exception or special-casing.

### Usage

```python
# Production
email_service = NotificationService(EmailChannel(), DatabaseLogger())
email_service.notify(user, "Your order has shipped")

# Tests
test_logger = InMemoryLogger()
test_service = NotificationService(EmailChannel(), test_logger)
test_service.notify(fake_user, "hello")
assert len(test_logger.entries) == 1
```

### Verification Against Each Principle

| Principle | How it is satisfied |
|---|---|
| SRP | Each class, `NotificationChannel` implementations, `NotificationLogger` implementations, and `NotificationService`, has exactly one reason to change. |
| OCP | New channels or loggers are added as new classes, with zero modification to `NotificationService`. |
| LSP | Any `NotificationChannel` implementation is substitutable for another, since all honor the same method signature and behavioral contract. |
| ISP | `NotificationChannel` exposes only `send`, and `NotificationLogger` exposes only `log`, keeping each interface narrow. |
| DIP | `NotificationService` depends entirely on the two abstractions, never on a specific channel or logger implementation. |

The resulting design is extensible, independently testable, and each component can be reasoned about without reference to the others.

---

## 10. Common Pitfalls

### Over-Engineering

Applying SOLID can become a justification for introducing unnecessary layers of abstraction. If an application has exactly one type of discount and there is no reasonable expectation of additional types in the foreseeable future, introducing four classes and an abstract base class for `DiscountCalculator` adds complexity without corresponding benefit.

The applicable rule is that SOLID should be applied when an axis of change genuinely exists or is reasonably anticipated based on the domain, not applied speculatively to every part of a system.

### Mistaking Class Splitting for SRP

Dividing one class into two classes does not automatically satisfy SRP. The relevant test is whether the two resulting classes have genuinely different reasons to change. If both classes continue to change together, for the same underlying reason, the split has merely distributed one responsibility across two files, which is a worse outcome than the original single class, since the coupling now spans multiple files instead of being visible in one.

### Interface Explosion from Over-Applying ISP

Excessive application of ISP produces a large number of narrow interfaces, each used in exactly one place, which introduces noise rather than clarity. Interface segregation is justified when there are genuinely distinct clients with distinct needs. It is not justified purely for the sake of minimizing method count on every interface.

### Forcing Inheritance to Enable Polymorphism

LSP violations frequently originate from inheritance relationships introduced because two classes appear conceptually similar, such as the square and rectangle example in Section 5, even though their behavior under mutation differs. When the "is-a" relationship does not hold behaviorally, composition or separate class hierarchies should be used instead of inheritance.

### Applying DIP to Every Dependency

Not every dependency requires an abstraction layer. A call to `datetime.now()`, for instance, rarely needs to be abstracted behind an interface. A dependency on a remote API that may change providers, or a database that needs to be replaced with an in-memory implementation for testing, is a stronger candidate for abstraction. The general rule is to abstract dependencies at system boundaries, meaning input/output operations, third-party services, and volatile external dependencies, while keeping internal business logic concrete wherever it is stable.

### Dogmatic Application

SOLID is a heuristic derived from observed patterns in long-lived, team-maintained software. A short-lived script, a throwaway prototype, or a small configuration parser does not require five layers of abstraction. The decision to apply SOLID should be based on the expected lifetime and complexity of the code in question, not applied uniformly regardless of context.

---

## 11. When Not to Apply SOLID

| Context | Reasoning |
|---|---|
| Prototypes and technical spikes | The purpose of this code is exploration. Premature abstraction slows down the exploration it is meant to support. |
| Small, single-purpose scripts | A fifty-line automation script intended for one-time or infrequent use does not justify the overhead of formal abstraction layers. |
| Performance-critical inner loops | Abstraction mechanisms such as virtual method dispatch can introduce measurable overhead in code paths where every unit of latency matters. |
| Genuinely stable domains | If a piece of logic is tied to a fact that will not change, such as a mathematical constant, designing an extension point for it provides no value. |
| Cases where abstraction reduces clarity | If introducing an abstraction makes the code harder for a future maintainer to read and understand than the direct alternative, the abstraction is counterproductive. |

The underlying skill required is judgment: apply SOLID where change is expected and the resulting flexibility will be used, and avoid it where it introduces friction without a corresponding benefit.

---

## 12. Summary

The following table consolidates the five principles for quick reference.

| Principle | Core Idea | Primary Benefit |
|---|---|---|
| SRP | A class should have exactly one reason to change. | Changes remain localized, reducing unintended side effects. |
| OCP | Extend behavior through new code rather than modification of existing code. | New features can be added without risking regressions in existing functionality. |
| LSP | Subclasses must honor the behavioral contract of their parent class. | Polymorphism can be relied upon without special-case handling. |
| ISP | Interfaces should remain narrow and focused on a single client's needs. | Classes are not forced to implement irrelevant methods, and contracts remain clear. |
| DIP | Depend on abstractions rather than concrete implementations. | Implementations become swappable and components become independently testable. |

### Key Takeaways

1. SOLID describes how object-oriented constructs should be arranged so that a system remains maintainable as it grows. Object-oriented programming supplies the constructs; SOLID supplies the arrangement rules.
2. Every principle addresses, from a different angle, the goal of minimizing the extent to which a single change propagates through a system.
3. The five principles are interdependent. Satisfying one tends to make the others easier to satisfy, and violating one tends to produce violations of the others.
4. Nearly all five principles reduce, at some level, to the same underlying technique: depending on the correct abstraction, at the correct level of the system.
5. SOLID is a set of heuristics, not a set of laws. It should be applied where the change patterns of a system justify the overhead, and it should be withheld where it does not.
6. SOLID provides the conceptual foundation for design patterns. Most classical design patterns are concrete, named applications of one or more SOLID principles, for example the Strategy pattern applies OCP and DIP together, and the Adapter pattern applies LSP and DIP together.

---

## 13. Self-Assessment Questions

The following questions test conceptual understanding rather than memorization. Attempt an answer before revealing the solution.

<details>
<summary>Question 1</summary>

A class has fifteen methods, all operating on the same underlying state and all serving one cohesive purpose. Does this class violate SRP?

**Answer:** No. SRP concerns the number of distinct reasons a class might need to change, not the number of methods it defines. If all fifteen methods serve one responsibility and would only change for one reason, the class satisfies SRP. A `ShoppingCart` class with fifteen methods, all related to managing cart state, is a valid design under this principle.

</details>

<details>
<summary>Question 2</summary>

An `Animal` class defines a method `fly()`. A new class `Penguin` needs to be added. What is the correct response under SOLID?

**Answer:** The class hierarchy should be restructured. `Penguin` should not override `fly()` to raise an exception, since this would violate LSP. Instead, the hierarchy should be split, for example into `FlyingAnimal` and `FlightlessAnimal`, or the `fly()` method should be removed from the base `Animal` class entirely. The base class's contract should only promise behavior that every subclass can genuinely deliver.

</details>

<details>
<summary>Question 3</summary>

Adding a new payment type requires modifying a central `if`/`elif` chain inside a `PaymentProcessor` class. Which principle is being violated?

**Answer:** This is primarily a violation of OCP, since existing code must be modified to extend behavior. It is often also a violation of DIP, since the class depends on concrete payment types rather than an abstraction. The fix is to introduce a `PaymentStrategy` interface with one implementing class per payment type, and to have `PaymentProcessor` depend on the interface rather than on concrete types.

</details>

<details>
<summary>Question 4</summary>

A `Printable` interface defines `print()`, `scan()`, and `fax()`. A `BasicPrinter` class implements only `print()` and raises `NotImplementedError` for the other two methods. Which principle is being violated directly, and which principle is being violated indirectly?

**Answer:** This is a direct violation of ISP, since `BasicPrinter` is forced to implement methods it has no use for. It is an indirect violation of LSP, since any code that treats a `Printable` polymorphically will encounter a runtime exception when given a `BasicPrinter`. The fix is to split the interface into `Printer`, `Scanner`, and `Fax`, so that each concrete class implements only the interfaces it genuinely supports.

</details>

<details>
<summary>Question 5</summary>

A class `OrderService` constructs a `PostgresDatabase` instance directly inside its constructor. As a result, tests for `OrderService` must run against a real PostgreSQL server. What principle is violated, and what is the fix?

**Answer:** This violates DIP, since the high-level `OrderService` depends directly on the low-level `PostgresDatabase` implementation. The fix is to extract a `Database` abstraction, have `OrderService` receive an instance of this abstraction through constructor injection, and supply an in-memory or mock implementation during testing.

</details>

<details>
<summary>Question 6</summary>

True or false: if a class has only one method, it automatically satisfies SRP.

**Answer:** False. SRP concerns reasons to change, not the number of methods. A single method containing five hundred lines of tangled logic that performs several unrelated tasks still violates SRP. Conversely, a class with twenty methods can satisfy SRP if every method serves one cohesive responsibility.

</details>

<details>
<summary>Question 7</summary>

A `Duck` class defines a `quack()` method. A subclass `RubberDuck` overrides `quack()` to play a squeaking sound rather than an actual duck call. Does this violate LSP?

**Answer:** Generally, no, provided the contract of the base class is understood as "produce some form of duck-associated sound," which both a real duck and a rubber duck satisfy. LSP would only be violated if the base class's contract made a stronger guarantee that the subclass fails to honor, for example if the contract specified "returns a recording of an actual duck," and `RubberDuck` returned nothing at all. LSP concerns adherence to a stated contract, not identical implementation.

</details>

<details>
<summary>Question 8</summary>

Can a design satisfy SRP while still violating OCP? Provide a brief example.

**Answer:** Yes. A `DiscountCalculator` class with a single, well-defined responsibility, calculating a discount, can still implement that responsibility using a large `if`/`elif` chain, which requires modification whenever a new discount type is introduced. SRP concerns the boundaries around a class's responsibilities; OCP concerns the mechanism by which that responsibility is extended. The two principles are related but address distinct aspects of a design.

</details>

<details>
<summary>Question 9</summary>

What is the relationship between Dependency Injection and the Dependency Inversion Principle?

**Answer:** DIP is the principle: high-level and low-level modules should both depend on abstractions. Dependency Injection is the most common practical technique used to satisfy DIP, whereby dependencies are supplied to a class from outside, through a constructor, a setter, or a framework, rather than being constructed internally by the class itself. DIP describes the goal; Dependency Injection describes one common method of achieving it.

</details>

<details>
<summary>Question 10</summary>

A hundred-line script reads a CSV file and produces a summary report. Should all five SOLID principles be carefully applied to this script?

**Answer:** Generally, no. The overhead associated with SOLID is justified when code is expected to persist and evolve over time under changing requirements. For a short, throwaway script, applying all five principles typically over-engineers the solution relative to its actual lifespan and complexity. The appropriate judgment is to abstract where change is genuinely likely and to remain concrete where it is not.

</details>

---

## 14. Practice Exercises

### Exercise 1: SRP Refactor

The following class violates SRP. Identify the distinct responsibilities present, split the class accordingly, and justify the resulting structure.

```python
class Invoice:
    def __init__(self, items):
        self.items = items  # list of (name, price, qty)

    def calculate_total(self):
        return sum(price * qty for _, price, qty in self.items)

    def calculate_tax(self):
        return self.calculate_total() * 0.18

    def save_to_pdf(self, filepath):
        print(f"Writing PDF to {filepath}")

    def send_by_email(self, to):
        print(f"Sending invoice to {to}")
```

**Solution**

The class contains four distinct responsibilities:

1. Holding invoice data, specifically the list of items.
2. Performing financial calculations, specifically totals and tax, which belongs to the finance domain.
3. Rendering the invoice as a PDF, which belongs to the presentation domain.
4. Delivering the invoice by email, which belongs to the infrastructure domain.

```python
class Invoice:
    def __init__(self, items):
        self.items = items


class InvoiceCalculator:
    TAX_RATE = 0.18

    def total(self, invoice):
        return sum(price * qty for _, price, qty in invoice.items)

    def tax(self, invoice):
        return self.total(invoice) * self.TAX_RATE


class InvoicePDFRenderer:
    def render(self, invoice, filepath):
        print(f"Writing PDF of {len(invoice.items)} items to {filepath}")


class InvoiceEmailSender:
    def send(self, invoice, to):
        print(f"Sending invoice with {len(invoice.items)} items to {to}")
```

Each resulting class can now change independently. A revision to the tax rate affects only `InvoiceCalculator`. A change to the PDF layout affects only `InvoicePDFRenderer`. A migration to a new email delivery system affects only `InvoiceEmailSender`.

---

### Exercise 2: OCP Application

The following class violates OCP.

```python
class AreaCalculator:
    def compute(self, shapes):
        total = 0
        for shape in shapes:
            if shape["type"] == "circle":
                total += 3.14 * shape["radius"] ** 2
            elif shape["type"] == "square":
                total += shape["side"] ** 2
            elif shape["type"] == "rectangle":
                total += shape["width"] * shape["height"]
        return total
```

Adding a new shape type currently requires modifying `AreaCalculator` directly. Refactor this design to comply with OCP.

**Solution**

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self): pass

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

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height


class AreaCalculator:
    def compute(self, shapes):
        return sum(shape.area() for shape in shapes)
```

Introducing a `Triangle` type now requires only the addition of a new `Triangle(Shape)` class. `AreaCalculator` is not modified.

---

### Exercise 3: LSP Check

Examine the following two subclasses. Determine whether each violates LSP and justify the conclusion.

```python
class FileReader:
    def read(self, path):
        with open(path) as f:
            return f.read()

class LoggingFileReader(FileReader):
    def read(self, path):
        print(f"Reading {path}")
        return super().read(path)
```

```python
class StrictFileReader(FileReader):
    def read(self, path):
        if not path.endswith(".txt"):
            raise ValueError("Only .txt supported!")
        return super().read(path)
```

**Solution**

`LoggingFileReader` does not violate LSP. It adds a side effect, printing a log line, but continues to return the full file contents for any valid path, exactly as the parent's contract guarantees.

`StrictFileReader` does violate LSP. It strengthens the precondition of the parent method by restricting valid input to files with a `.txt` extension. Code written against `FileReader` that supplies a `.json` file would succeed with the parent class but raise an exception with `StrictFileReader`. Substitutability is broken.

The general lesson is that a subclass may extend the behavior of its parent, for example by adding a side effect, but must not restrict what the parent was willing to accept.

---

### Exercise 4: ISP Design

Design a set of interfaces for a workshop with the following constraints. A `Carpenter` requires only a `cut_wood` capability. A `Plumber` requires only a `fix_pipe` capability. A `Handyman` requires both capabilities. Neither specialist should be forced to implement the other's capability.

**Solution**

```python
from abc import ABC, abstractmethod

class WoodWorker(ABC):
    @abstractmethod
    def cut_wood(self): pass

class PipeWorker(ABC):
    @abstractmethod
    def fix_pipe(self): pass


class Carpenter(WoodWorker):
    def cut_wood(self): print("Cutting wood")

class Plumber(PipeWorker):
    def fix_pipe(self): print("Fixing pipe")

class Handyman(WoodWorker, PipeWorker):
    def cut_wood(self): print("Cutting wood")
    def fix_pipe(self): print("Fixing pipe")
```

Multiple inheritance from narrow interfaces allows `Handyman` to represent the combination of both skills without either `Carpenter` or `Plumber` carrying methods irrelevant to their role.

---

### Exercise 5: DIP via Injection

The following code is difficult to test because `EmailService` depends on a hardcoded SMTP client. Refactor it to comply with DIP.

```python
class SmtpClient:
    def send(self, to, subject, body):
        print(f"SMTP -> {to}: {subject}")


class EmailService:
    def __init__(self):
        self.client = SmtpClient()

    def send_welcome(self, user):
        self.client.send(user.email, "Welcome!", f"Hi {user.name}")
```

**Solution**

```python
from abc import ABC, abstractmethod

class EmailClient(ABC):
    @abstractmethod
    def send(self, to, subject, body): pass


class SmtpClient(EmailClient):
    def send(self, to, subject, body):
        print(f"SMTP -> {to}: {subject}")


class FakeEmailClient(EmailClient):    # For tests
    def __init__(self):
        self.sent = []
    def send(self, to, subject, body):
        self.sent.append((to, subject, body))


class EmailService:
    def __init__(self, client: EmailClient):
        self.client = client

    def send_welcome(self, user):
        self.client.send(user.email, "Welcome!", f"Hi {user.name}")


# Usage
prod_service = EmailService(SmtpClient())

# Testing
fake = FakeEmailClient()
test_service = EmailService(fake)
test_service.send_welcome(SomeUser)
assert len(fake.sent) == 1
```

`EmailService` now depends on the `EmailClient` abstraction rather than a concrete client. Implementations are supplied externally, and testing no longer requires a real SMTP connection.

---

### Exercise 6: Full SOLID Refactor (Capstone)

The following class, commonly referred to as a "god class," violates every SOLID principle. Refactor it completely.

```python
class OrderManager:
    def __init__(self):
        self.orders = []

    def place_order(self, customer_type, items, payment_method):
        # Calculate total
        total = sum(price * qty for _, price, qty in items)

        # Apply discount
        if customer_type == "regular":
            total *= 0.95
        elif customer_type == "premium":
            total *= 0.90
        elif customer_type == "vip":
            total *= 0.80

        # Process payment
        if payment_method == "card":
            print(f"Charging Rs.{total} on card")
        elif payment_method == "upi":
            print(f"Processing Rs.{total} via UPI")
        elif payment_method == "cash":
            print(f"Collecting Rs.{total} cash on delivery")

        # Save to MySQL
        print(f"Saving order to MySQL...")

        # Send email
        print(f"Sending confirmation email...")

        self.orders.append({"items": items, "total": total})
        return total
```

**Solution**

```python
from abc import ABC, abstractmethod

# --- Discount strategies (OCP, DIP) ---
class DiscountStrategy(ABC):
    @abstractmethod
    def apply(self, amount): pass

class RegularDiscount(DiscountStrategy):
    def apply(self, amount): return amount * 0.95

class PremiumDiscount(DiscountStrategy):
    def apply(self, amount): return amount * 0.90

class VIPDiscount(DiscountStrategy):
    def apply(self, amount): return amount * 0.80


# --- Payment processors (OCP, DIP) ---
class PaymentProcessor(ABC):
    @abstractmethod
    def charge(self, amount): pass

class CardProcessor(PaymentProcessor):
    def charge(self, amount): print(f"Card: Rs.{amount}")

class UPIProcessor(PaymentProcessor):
    def charge(self, amount): print(f"UPI: Rs.{amount}")

class CashProcessor(PaymentProcessor):
    def charge(self, amount): print(f"Cash on delivery: Rs.{amount}")


# --- Repository (SRP, DIP) ---
class OrderRepository(ABC):
    @abstractmethod
    def save(self, order): pass

class MySQLOrderRepository(OrderRepository):
    def save(self, order): print(f"MySQL: saved order {order}")

class InMemoryOrderRepository(OrderRepository):
    def __init__(self): self.orders = []
    def save(self, order): self.orders.append(order)


# --- Notification (SRP, DIP) ---
class OrderNotifier(ABC):
    @abstractmethod
    def notify(self, order): pass

class EmailOrderNotifier(OrderNotifier):
    def notify(self, order): print(f"Email: order {order} confirmed")


# --- Pricing (SRP) ---
class PriceCalculator:
    def total(self, items):
        return sum(price * qty for _, price, qty in items)


# --- Orchestrator (SRP: coordinates, does not perform every task itself) ---
class OrderService:
    def __init__(self,
                 calculator: PriceCalculator,
                 discount: DiscountStrategy,
                 payment: PaymentProcessor,
                 repository: OrderRepository,
                 notifier: OrderNotifier):
        self.calculator = calculator
        self.discount = discount
        self.payment = payment
        self.repository = repository
        self.notifier = notifier

    def place_order(self, items):
        total = self.calculator.total(items)
        total = self.discount.apply(total)
        self.payment.charge(total)
        order = {"items": items, "total": total}
        self.repository.save(order)
        self.notifier.notify(order)
        return total
```

Usage:

```python
service = OrderService(
    calculator=PriceCalculator(),
    discount=PremiumDiscount(),
    payment=UPIProcessor(),
    repository=MySQLOrderRepository(),
    notifier=EmailOrderNotifier(),
)
service.place_order([("book", 300, 2), ("pen", 50, 5)])
```

**Verification against each principle**

| Principle | Verification |
|---|---|
| SRP | Each class has one reason to change. `PriceCalculator`, `DiscountStrategy`, `PaymentProcessor`, `OrderRepository`, `OrderNotifier`, and `OrderService` each own a distinct, non-overlapping responsibility. |
| OCP | New discount types, payment methods, repositories, or notifiers are added as new classes. `OrderService` remains unmodified. |
| LSP | Any implementation of `DiscountStrategy`, `PaymentProcessor`, `OrderRepository`, or `OrderNotifier` is substitutable within `OrderService`, since each honors its respective contract without exception. |
| ISP | Each interface is narrow: `apply`, `charge`, `save`, and `notify` are each defined on a separate interface, so no class is forced to implement a method irrelevant to its role. |
| DIP | `OrderService` depends entirely on abstractions. Production and test configurations differ only in which concrete implementations are supplied at construction time. |

---

With OOP supplying the raw constructs and SOLID supplying the rules for arranging them, the natural next step is the study of design patterns: well-documented, reusable solutions to recurring design problems, most of which are, on close inspection, a concrete application of one or more SOLID principles.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch.
Explore more: https://codeverra.com*
