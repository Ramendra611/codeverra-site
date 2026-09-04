---
title: "Design Patterns, Part 1: Foundations and Creational Patterns"
description: "Foundations of the GoF design pattern catalogue and creational patterns: Singleton, Factory, Builder, Prototype, and Abstract Factory."

date: 2026-09-04
lastmod: 2026-09-04
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - lld
  - design-patterns
  - python

cover:
  image: "/images/LLD - 3.png"
  alt: "Creational Design Patterns"
  caption: "Design Patterns, Part 1: Foundations and Creational Patterns"
  relative: true
  hidden: false
---

# Design Patterns, Part 1: Foundations and Creational Patterns

## Table of Contents

1. [What a Design Pattern Is](#1-what-a-design-pattern-is)
2. [Why Design Patterns Are Studied](#2-why-design-patterns-are-studied)
3. [Classification of the GoF Catalogue](#3-classification-of-the-gof-catalogue)
4. [The Template Used for Each Pattern](#4-the-template-used-for-each-pattern)
5. [The Problem Space of Creational Patterns](#5-the-problem-space-of-creational-patterns)
6. [Singleton](#6-singleton)
7. [Factory Method](#7-factory-method)
8. [Abstract Factory](#8-abstract-factory)
9. [Builder](#9-builder)
10. [Prototype](#10-prototype)
11. [Comparative Summary of the Five Patterns](#11-comparative-summary-of-the-five-patterns)
12. [Key Takeaways](#12-key-takeaways)
13. [Practice Exercises with Solutions](#13-practice-exercises-with-solutions)
14. [Self-Assessment Questions](#14-self-assessment-questions)

---

## 1. What a Design Pattern Is

### 1.1 Definition

**Design pattern.** A named, general, reusable solution to a problem that recurs within a particular context of software design. A pattern is a description of communicating objects and classes that are customised to solve a general design problem in that context.

The definition has four load-bearing components, and each of them is part of the formal definition of a pattern rather than an optional extra:

| Component | Meaning | Consequence if missing |
|---|---|---|
| **Name** | A handle that identifies the design vocabulary item | The solution cannot be discussed, taught, or referenced concisely |
| **Problem** | The situation, including its preconditions, in which the pattern applies | The pattern gets applied where it does not belong |
| **Solution** | The arrangement of classes and objects, their responsibilities and collaborations | There is nothing to implement |
| **Consequences** | The results and trade-offs of applying the pattern | The engineer cannot evaluate whether the cost is justified |

The original formulation of this idea comes from the architect Christopher Alexander, who wrote that each pattern describes a problem that occurs repeatedly in the environment, and then describes the core of the solution to that problem in such a way that the solution can be used many times over without ever being implemented the same way twice.

### 1.2 What a Design Pattern Is Not

Three common misconceptions are worth removing before the catalogue is studied, because each one leads to a distinct category of misuse.

**A pattern is not code.** A pattern specifies a structure: which roles exist, what each role is responsible for, and how the roles collaborate. The concrete code that realises that structure differs by language, by domain, and by the constraints of the surrounding system. Two correct implementations of Observer may share no identical lines of code.

**A pattern is not a library or a framework.** There is no package to install. A library provides an implementation you call; a pattern provides a design decision you make. The distinction matters because a library can be adopted incrementally and removed later, whereas a pattern applied to a system shapes the structure of that system's source code.

**A pattern is not an architecture.** Design patterns operate at the level of a few classes collaborating to solve a local design problem. Architectural styles such as layered architecture, microservices, or event-driven architecture operate at the level of entire systems. The GoF catalogue is squarely at the class and object level, which is why it belongs to low-level design rather than high-level design.

### 1.3 The Gang of Four Catalogue

In 1994, Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides published *Design Patterns: Elements of Reusable Object-Oriented Software*. The book documented 23 patterns that the authors had repeatedly observed in well-designed object-oriented systems. The four authors are collectively referred to as the **Gang of Four**, abbreviated GoF, and the 23 patterns are referred to as the **classical patterns**.

The catalogue is not exhaustive. Many widely used patterns postdate it or fall outside its scope, including Repository, Unit of Work, Dependency Injection, Model-View-Controller, and Publish-Subscribe. The GoF 23 remain the standard baseline because they are the set that practitioners across languages and industries assume as shared knowledge.

### 1.4 The Two Structuring Mechanisms Behind Every Pattern

Every pattern in the catalogue achieves its flexibility through one of two mechanisms, and identifying which one a pattern uses is the fastest way to understand it.

**Inheritance (class-level reuse).** A subclass overrides a method of its superclass, and the superclass invokes that method without knowing the subclass. The relationship is fixed at compile time and cannot be changed while the program runs. Factory Method and Template Method use this mechanism.

**Composition and delegation (object-level reuse).** An object holds a reference to another object and forwards work to it. The relationship is established at runtime and can be changed while the program runs. Strategy, Abstract Factory, Bridge, and Decorator use this mechanism.

The GoF book states a principle that follows directly from this distinction: **favour object composition over class inheritance**. Composition preserves runtime flexibility and avoids the tight coupling that inheritance creates between a subclass and the internal implementation of its superclass.

---

## 2. Why Design Patterns Are Studied

### 2.1 Design Vocabulary

Communication about design becomes precise and compact when the participants share a vocabulary. The statement "the pricing rules should be Strategy objects selected by a registry" communicates a class structure, a runtime substitution mechanism, and a set of trade-offs in one sentence. Without the vocabulary, the same statement requires a diagram and several minutes of explanation, and the listener still has to verify that both parties agree on the details.

### 2.2 Documented Consequences

The value of a catalogued pattern is not only that the structure works, but that its failure modes have been recorded. Singleton is known to complicate testing. Abstract Factory is known to resist the addition of new product types. Visitor is known to break when the object hierarchy changes. An engineer who selects a pattern from the catalogue inherits decades of documented experience about where that structure causes pain, which is information that cannot be derived from the structure itself.

### 2.3 Relationship to the SOLID Principles

The SOLID principles state properties that a good design possesses. Patterns are concrete structures that produce those properties. The relationship is that of a rule to an instance of the rule.

| Principle | Statement | Patterns that realise it |
|---|---|---|
| Single Responsibility | A class should have one reason to change | Builder separates construction from representation; Command separates invocation from execution |
| Open/Closed | Software entities should be open for extension, closed for modification | Factory Method, Strategy, Decorator, Observer |
| Liskov Substitution | Subtypes must be usable wherever their base type is expected | Every pattern that relies on an abstract product or abstract handler |
| Interface Segregation | Clients should not depend on methods they do not use | Adapter, Facade |
| Dependency Inversion | High-level modules should depend on abstractions, not on concrete implementations | Abstract Factory, Strategy, Bridge |

Studying patterns converts the principles from statements that are easy to agree with into structures that can be recognised and applied.

### 2.4 Comprehension of Existing Systems

Widely used Python libraries are built out of these structures. Django's middleware stack is Chain of Responsibility. SQLAlchemy's query construction API is Builder. The `io` module's buffered and text wrappers around raw streams are Decorator. `unittest.TestCase.setUp` and `tearDown` surround `runTest` in a Template Method. Recognising the pattern in an unfamiliar codebase removes the need to reconstruct the designer's intent from the code alone.

### 2.5 The Cost of Misapplication

Every pattern adds indirection, and indirection has a measurable cost: more classes to read, more files to open, and a longer path between the point where a behaviour is invoked and the point where it is implemented. A pattern is justified when the flexibility it provides is flexibility the system actually requires.

The failure mode has a name. **Pattern fever** is the application of patterns for their own sake, typically visible as an abstract factory producing a single product family, a strategy interface with one implementation, or a builder for a class with three fields. The corrective question, asked before any pattern is introduced, is: *what specific change to the requirements does this structure make cheaper, and is that change plausible?*

---

## 3. Classification of the GoF Catalogue

The catalogue is organised along two dimensions.

**Purpose** describes what the pattern does.

**Scope** describes whether the pattern applies primarily to classes, in which case relationships are fixed at compile time through inheritance, or primarily to objects, in which case relationships are established at runtime through composition.

| Purpose | Definition | Count |
|---|---|---|
| **Creational** | Abstracts the instantiation process, so that a system is independent of how its objects are created, composed, and represented | 5 |
| **Structural** | Concerns how classes and objects are composed to form larger structures | 7 |
| **Behavioural** | Concerns algorithms and the assignment of responsibilities between objects, and describes the communication patterns between them | 11 |

The complete catalogue:

| Creational | Structural | Behavioural |
|---|---|---|
| Singleton | Adapter | Chain of Responsibility |
| Factory Method | Bridge | Command |
| Abstract Factory | Composite | Interpreter |
| Builder | Decorator | Iterator |
| Prototype | Facade | Mediator |
| | Flyweight | Memento |
| | Proxy | Observer |
| | | State |
| | | Strategy |
| | | Template Method |
| | | Visitor |

This document covers the creational family. Structural patterns are covered in Part 2 and behavioural patterns in Part 3.

---

## 4. The Template Used for Each Pattern

Each pattern below is presented using the same eight-part template. The order is deliberate: the problem is established before the solution is named, because a pattern learned without its problem will be applied without its problem.

1. **Problem context.** Working code that exhibits the defect the pattern addresses, with the defect stated precisely.
2. **Intent.** The one-sentence statement of what the pattern accomplishes, in the GoF formulation.
3. **Participants.** The roles the pattern defines, each with a definition and a responsibility.
4. **Reference implementation.** Complete Python code with commentary on the mechanism.
5. **Variants.** Alternative implementations and the conditions under which each is preferred.
6. **Applied example.** A use of the pattern in a realistic system.
7. **Consequences.** Benefits and liabilities, stated as trade-offs rather than as advantages.
8. **Python-specific considerations.** Language features that simplify, replace, or complicate the pattern.

---

## 5. The Problem Space of Creational Patterns

### 5.1 The Defect in Direct Instantiation

The default way to obtain an object in Python is a direct constructor call:

```python
notifier = EmailNotifier(smtp_host="smtp.example.com", port=587)
```

This expression does three things simultaneously. It names a concrete class, it supplies construction arguments, and it produces an instance. The consequence is that the calling code now depends on all three. A change to any one of them requires a change to the caller.

**Coupling.** The formal term for this dependency is *compile-time coupling to a concrete type*. The calling module cannot be compiled, imported, or tested without `EmailNotifier` being available and constructible. If `EmailNotifier` opens a network socket in its constructor, every test of the calling code requires a network.

**Duplication of the selection decision.** When the class to instantiate depends on runtime data, the selection logic appears at every call site. Ten call sites means ten conditional blocks that must be kept synchronised.

**Exposure of construction complexity.** If constructing a valid object requires seven arguments in a specific order with cross-field validation rules, every call site must reproduce that knowledge correctly.

### 5.2 The Axes of Variation

Creational patterns exist because there are several independent decisions embedded in object creation, and each pattern isolates a different one so that it can be changed without disturbing the rest of the system.

| Pattern | Decision it isolates | The question it answers |
|---|---|---|
| **Singleton** | How many instances may exist | How is it guaranteed that exactly one instance exists and is reachable? |
| **Factory Method** | Which concrete class is instantiated | How can a class defer the choice of concrete type to its subclasses? |
| **Abstract Factory** | Which family of related concrete classes is instantiated | How are groups of objects created so that they are guaranteed to be mutually compatible? |
| **Builder** | The sequence and validation of the construction process | How is an object with many optional components assembled without an unreadable constructor? |
| **Prototype** | Whether an object is constructed or copied | How is a new object produced from an existing configured instance? |

### 5.3 Terminology Used Throughout

These terms recur in every creational pattern and are used with the following precise meanings.

**Client.** The code that needs an object and consumes it. The client is the party being protected from the creation details.

**Product.** The object being created. When the product type is abstract, the client depends on the abstraction rather than on any concrete class.

**Concrete Product.** A specific implementation of the product interface.

**Creator.** The party responsible for producing products. Depending on the pattern this may be a method, a function, a class, or an object.

**Instantiation.** The act of allocating and initialising an object. In Python this is a two-step process: `__new__` allocates and returns an object, then `__init__` initialises the object that `__new__` returned. This distinction is directly exploited by Singleton and by Prototype.

---

## 6. Singleton

### 6.1 Problem Context

Certain resources in an application are shared by design, and duplicating them produces incorrect behaviour rather than merely wasteful behaviour. Three representative cases:

A **configuration registry** parses a configuration file at startup. If two registries exist, one may be reloaded after a change while the other retains stale values, and two parts of the system will then disagree about the same setting.

A **connection pool** manages a bounded set of database connections in order to respect a server-side connection limit. Two pools, each limited to ten connections, will together open twenty, defeating the limit that the pool exists to enforce.

An **in-memory cache** stores computed results for reuse. Two caches halve the hit rate and can hold contradictory entries for the same key.

The following code exhibits the defect:

```python
class ConnectionPool:
    def __init__(self, size=10):
        self.connections = [f"conn-{i}" for i in range(size)]


pool_in_service_a = ConnectionPool()
pool_in_service_b = ConnectionPool()

print(pool_in_service_a is pool_in_service_b)   # False
print(len(pool_in_service_a.connections) + len(pool_in_service_b.connections))   # 20
```

Nothing in the class prevents a second instantiation, and nothing at the call site indicates that a second instantiation is a defect. The requirement "exactly one instance exists" is stated nowhere in the code and is therefore enforced nowhere.

### 6.2 Intent

> Ensure a class has only one instance, and provide a global point of access to it.

The intent contains two separate guarantees, and it is useful to note that they are separable. The first is a *cardinality constraint* on instances. The second is *global accessibility*. A shared instance created once at startup and passed explicitly to its users satisfies the first guarantee without the second, and this alternative is discussed in Section 6.8.

### 6.3 Participants

| Participant | Definition | Responsibility |
|---|---|---|
| **Singleton** | The class whose instantiation is restricted | Holds the reference to its own unique instance, controls the creation of that instance, and exposes it to clients |

Singleton is the only GoF pattern with a single participant, because the pattern constrains one class rather than arranging a collaboration between several.

### 6.4 Reference Implementation: Overriding `__new__`

To restrict instantiation, the restriction must be placed at the point where instantiation occurs. In Python, the expression `ClassName()` invokes the metaclass call machinery, which performs two steps:

1. `ClassName.__new__(cls, *args, **kwargs)` is called. This method allocates and returns an object.
2. If the returned object is an instance of `ClassName`, then `__init__` is called on it with the same arguments.

Because `__init__` receives an object that already exists, it is too late to prevent a second object from being created there. The interception must occur in `__new__`.

```python
class ConnectionPool:
    _instance = None            # Class attribute: one slot shared by the class itself,
                                # not per instance. This is where the unique instance lives.

    def __new__(cls, size=10):
        # __new__ is the allocator. Returning an already existing object from it
        # means no new object is allocated at all, which is exactly the constraint
        # the pattern requires.
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialised = False
        return cls._instance

    def __init__(self, size=10):
        # __init__ runs on EVERY ConnectionPool() call, because Python calls it on
        # whatever __new__ returned. Without the guard below, the second call would
        # re-run initialisation and discard the state accumulated by the first.
        if self._initialised:
            return
        self.connections = [f"conn-{i}" for i in range(size)]
        self._initialised = True

    def acquire(self):
        return self.connections.pop()

    def release(self, conn):
        self.connections.append(conn)


a = ConnectionPool(size=10)
b = ConnectionPool(size=99)      # size is ignored: the instance already exists

print(a is b)                     # True
print(len(a.connections))         # 10
```

Two properties of this implementation deserve attention.

**Initialisation runs exactly once.** The `_initialised` flag is required because Python invokes `__init__` on every call regardless of whether `__new__` allocated anything. Omitting the flag produces a subtle defect: the pool appears to be a singleton by identity, yet its state resets on every call.

**Later arguments are silently discarded.** The second call passes `size=99` and receives a pool of size 10. This is inherent to the pattern rather than a flaw in this implementation, and it is a reason to prefer an explicit configuration step over constructor arguments on a singleton class.

### 6.5 Variant: The Decorator Implementation

The `__new__` approach mixes the singleton constraint into the class it constrains, which violates the single responsibility principle and must be repeated in every class that needs the constraint. A decorator extracts the constraint into a reusable component.

```python
import functools


def singleton(cls):
    instances = {}      # Closure variable. It survives for the lifetime of the
                        # decorated class because get_instance references it, and
                        # it is unreachable from outside, which makes it a private
                        # per-class cache.

    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance


@singleton
class Cache:
    def __init__(self):
        self.store = {}

    def put(self, key, value):
        self.store[key] = value

    def get(self, key):
        return self.store.get(key)


a = Cache()
a.put("user:1", {"name": "Amit"})
b = Cache()

print(a is b)              # True
print(b.get("user:1"))     # {'name': 'Amit'}
```

The mechanism is name rebinding. After decoration, the name `Cache` refers to the function `get_instance`, not to the class. Calling `Cache()` therefore calls the function, which consults the cache dictionary and constructs the real class only on the first call.

This variant has one significant limitation: because `Cache` is now a function, it cannot be subclassed and `isinstance(x, Cache)` raises a `TypeError`. Where either capability is required, the metaclass variant below is preferable.

### 6.6 Variant: The Metaclass Implementation

A **metaclass** is the class of a class. Just as an object's behaviour on `obj()` is determined by its class's `__call__`, a class's behaviour on `ClassName()` is determined by its metaclass's `__call__`. Overriding `__call__` in a metaclass intercepts instantiation one level above `__new__` and `__init__` together, which removes the need for the `_initialised` flag.

```python
class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        # cls here is the class being instantiated, for example Logger.
        # super().__call__ is what normally runs __new__ followed by __init__.
        # Skipping it entirely on later calls means __init__ never re-runs.
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class Logger(metaclass=SingletonMeta):
    def __init__(self, log_file="app.log"):
        self.log_file = log_file
        self.lines_written = 0

    def log(self, message):
        self.lines_written += 1
        print(f"[{self.log_file}] {message}")


a = Logger("service.log")
a.log("started")
b = Logger()

print(a is b)               # True
print(b.lines_written)      # 1, state preserved
```

The metaclass variant preserves normal class semantics: `Logger` remains a class, subclassing works, and `isinstance` works. Each subclass receives its own entry in `_instances`, so a subclass is a separate singleton rather than a competitor for the same slot.

### 6.7 Variant: Module-Level State

Python modules are themselves singletons. The first `import` of a module executes it and stores the resulting module object in `sys.modules`; every later import of the same name returns the cached object without re-executing the file. A module therefore provides single-instance semantics with no additional machinery.

```python
# logger.py
_log_file = "app.log"
_lines_written = 0


def log(message):
    global _lines_written
    _lines_written += 1
    print(f"[{_log_file}] {message}")


def line_count():
    return _lines_written
```

```python
# any_other_module.py
import logger

logger.log("started")
print(logger.line_count())    # 1, shared across every importer
```

This is the idiomatic Python solution when the shared resource is a set of functions over shared state and does not require inheritance, multiple configurations, or lazy construction. The standard library uses it: `random` exposes module-level functions backed by a single hidden `Random` instance.

### 6.8 The Testing Problem and Dependency Injection

The liability that dominates discussion of this pattern is its effect on testing, and the mechanism is worth stating precisely.

A singleton is **global mutable state**. Two consequences follow. First, tests are no longer independent: a test that writes to the singleton changes the starting conditions of every test that runs afterwards, which makes results depend on test execution order. Second, the dependency is **hidden**: a class that calls `Logger()` inside a method does not declare in its constructor that it requires a logger, so the dependency is invisible in the class's interface and cannot be substituted by a test double without patching a global name.

**Dependency injection** is the standard alternative. The instance is created once, at the application's composition root, and is passed explicitly to the objects that require it.

```python
class OrderService:
    def __init__(self, logger, pool):
        # The dependencies are declared. They can be substituted in tests
        # by passing different objects, with no patching and no global state.
        self._logger = logger
        self._pool = pool

    def place(self, order):
        conn = self._pool.acquire()
        try:
            self._logger.log(f"placing order {order}")
        finally:
            self._pool.release(conn)


# Composition root: the single place that knows about concrete implementations.
def main():
    logger = Logger("prod.log")
    pool = ConnectionPool(size=10)
    service = OrderService(logger, pool)
    service.place("order-1")
```

The cardinality guarantee is preserved because `main` creates exactly one of each. The global access point is removed, and with it the testing problem. Singleton remains appropriate when a shared instance must be reachable from code that cannot be given a constructor parameter, such as deep inside a third-party callback, and when the alternative would be threading a reference through many unrelated layers.

### 6.9 Thread Safety

The implementations above are not safe under concurrency. Consider two threads executing `__new__` at the same time:

1. Thread A evaluates `cls._instance is None` and finds it true.
2. The interpreter switches to thread B before A assigns.
3. Thread B evaluates the same condition, also finds it true, and constructs an instance.
4. Thread A resumes and constructs a second instance, overwriting B's.

Two instances now exist, and objects created before the overwrite hold a reference to the discarded one. The window is small, which makes the defect intermittent and difficult to reproduce.

The correction is to hold a lock across the check and the assignment, using the double-checked locking idiom so that the lock is acquired only on the uncontended first call:

```python
import threading


class SafeSingletonMeta(type):
    _instances = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:              # fast path, no lock
            with cls._lock:
                if cls not in cls._instances:      # re-check, now under the lock
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
```

The second check inside the lock is not redundant. A thread that blocked on the lock while another thread was constructing the instance must observe the result of that construction rather than construct again.

### 6.10 Consequences

| Benefit | Explanation |
|---|---|
| Enforced cardinality | The constraint is expressed in the class rather than in a convention that call sites may violate |
| Lazy initialisation | The instance is constructed on first use, so an expensive resource is not created if it is never needed |
| Single point of access | Code in any module can reach the instance without a reference being passed to it |

| Liability | Explanation |
|---|---|
| Global mutable state | Test isolation is lost, and state changes propagate to unrelated code with no visible dependency |
| Hidden dependencies | A class's interface does not disclose what it depends on, which violates the dependency inversion principle |
| Concurrency defects | Naive implementations admit a race on first construction |
| Subclassing ambiguity | Whether a subclass shares or replaces the parent's instance must be decided explicitly, and different implementations answer it differently |
| Lifetime is the process | The instance lives until the process exits, which prevents deterministic release of the resources it holds |

### 6.11 Related Patterns

**Monostate**, also called Borg, achieves the observable effect of Singleton without constraining the number of instances. Every instance shares the same attribute dictionary, so instances differ in identity but not in state.

```python
class Monostate:
    _shared_state = {}

    def __init__(self):
        self.__dict__ = self._shared_state    # all instances share one namespace


a = Monostate()
a.region = "ap-south-1"
b = Monostate()
print(b.region)    # ap-south-1
print(a is b)      # False
```

Monostate is preferable when subclasses should be able to add their own shared state and when client code should not need to know that sharing is occurring.

**Abstract Factory**, **Builder**, and **Prototype** are frequently implemented as singletons, because a system normally requires only one instance of each.

**Facade** objects are often singletons for the same reason.

### 6.12 Python-Specific Considerations

`functools.lru_cache` applied to a zero-argument factory function produces single-instance semantics with less code than any of the class-based variants, and it is thread-safe:

```python
from functools import lru_cache


@lru_cache(maxsize=None)
def get_pool() -> ConnectionPool:
    return ConnectionPool(size=10)
```

The ordering of preference in Python is: a module-level object or function set where inheritance is not needed; `lru_cache` on a factory function where laziness is needed; the metaclass implementation where a genuine class with singleton semantics is needed; and the `__new__` implementation only where a metaclass is unavailable because of a conflict with another metaclass.

---

## 7. Factory Method

### 7.1 Problem Context

A notification subsystem supports several delivery channels. Each channel is a separate class implementing a common operation.

```python
class EmailNotifier:
    def send(self, message): print(f"Email: {message}")

class SMSNotifier:
    def send(self, message): print(f"SMS: {message}")

class PushNotifier:
    def send(self, message): print(f"Push: {message}")


def notify_user(user, message):
    if user.channel == "email":
        notifier = EmailNotifier()
    elif user.channel == "sms":
        notifier = SMSNotifier()
    elif user.channel == "push":
        notifier = PushNotifier()
    else:
        raise ValueError(f"Unsupported channel: {user.channel}")
    notifier.send(message)
```

The function performs two distinct jobs: it selects a concrete class, and it uses the resulting object. Three defects follow.

**The selection logic is duplicated.** Any other function needing a notifier reproduces the same conditional chain. Adding a Slack channel requires locating and editing every copy.

**The open/closed principle is violated.** Extending the system with a new channel requires modifying existing, tested code rather than adding new code.

**The module depends on every concrete class.** Importing this module imports all four notifier classes and everything they import, including their transport libraries.

### 7.2 Intent

> Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.

The essential separation is between *the decision that an object of some abstract type is needed*, which stays in the general algorithm, and *the decision about which concrete type to construct*, which moves into a substitutable location.

### 7.3 Participants

| Participant | Definition | Responsibility |
|---|---|---|
| **Product** | The interface of the objects the factory method creates | Declares the operations clients invoke |
| **Concrete Product** | An implementation of the Product interface | Provides channel-specific or type-specific behaviour |
| **Creator** | The class that declares the factory method and contains the algorithm that uses its result | Declares the factory method, usually abstract, and implements operations that call it |
| **Concrete Creator** | A subclass of Creator | Overrides the factory method to return a specific Concrete Product |

The defining structural feature is that **the Creator calls its own factory method without knowing which Concrete Product it will receive**. The base class therefore contains a complete algorithm with one substitutable step.

### 7.4 Reference Implementation

```python
from abc import ABC, abstractmethod


# ---------- Product ----------
class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None:
        ...


# ---------- Concrete Products ----------
class EmailNotifier(Notifier):
    def send(self, message): print(f"Email: {message}")


class SMSNotifier(Notifier):
    def send(self, message): print(f"SMS: {message}")


# ---------- Creator ----------
class NotificationService(ABC):

    @abstractmethod
    def create_notifier(self) -> Notifier:
        """The factory method. The base class declares that a Notifier will be
        needed but refuses to decide which one, delegating that decision to
        subclasses."""

    def notify(self, user, message) -> None:
        """The template algorithm. It is written once, in terms of the abstract
        Product, and is inherited unchanged by every subclass. Retry policy,
        auditing, and formatting live here and are never duplicated."""
        notifier = self.create_notifier()
        formatted = f"Dear {user}, {message}"
        notifier.send(formatted)


# ---------- Concrete Creators ----------
class EmailService(NotificationService):
    def create_notifier(self) -> Notifier:
        return EmailNotifier()


class SMSService(NotificationService):
    def create_notifier(self) -> Notifier:
        return SMSNotifier()


service: NotificationService = EmailService()
service.notify("Amit", "your order has shipped")
# Email: Dear Amit, your order has shipped
```

The value of the structure is visible in `notify`. Any behaviour that must apply to every channel is written once. Adding a Slack channel requires two new classes and no modification to `NotificationService` or to any client that holds a `NotificationService` reference.

### 7.5 Variant: Parameterised Factory

Where the variation is a data value rather than a subclass of a larger algorithm, a single function that maps an identifier to a class is sufficient. This variant is often called **Simple Factory** and is not, strictly, the GoF pattern, because no subclassing is involved. It solves the same problem and is far more common in Python.

```python
_REGISTRY: dict[str, type[Notifier]] = {
    "email": EmailNotifier,
    "sms": SMSNotifier,
}


def create_notifier(channel: str) -> Notifier:
    try:
        cls = _REGISTRY[channel]
    except KeyError:
        raise ValueError(f"Unsupported channel: {channel}") from None
    return cls()


create_notifier("sms").send("hello")
```

Classes are first-class objects in Python, so the dictionary stores the class itself and calls it. The conditional chain is replaced by a lookup table, which is a data structure that can be extended at runtime.

### 7.6 Variant: Self-Registering Subclasses

The registry above must still be edited when a product is added. `__init_subclass__` is a hook that Python calls automatically whenever a subclass of a class is defined, which allows each product to register itself.

```python
class Notifier(ABC):
    registry: dict[str, type["Notifier"]] = {}

    def __init_subclass__(cls, channel: str = None, **kwargs):
        # Called at class-definition time for every subclass. The `channel`
        # keyword comes from the class statement's argument list.
        super().__init_subclass__(**kwargs)
        if channel:
            Notifier.registry[channel] = cls

    @abstractmethod
    def send(self, message: str) -> None:
        ...


class EmailNotifier(Notifier, channel="email"):
    def send(self, message): print(f"Email: {message}")


class SlackNotifier(Notifier, channel="slack"):
    def send(self, message): print(f"Slack: {message}")


def create_notifier(channel: str) -> Notifier:
    return Notifier.registry[channel]()


print(sorted(Notifier.registry))       # ['email', 'slack']
create_notifier("slack").send("deploy finished")
```

Adding a channel now requires exactly one new class in one new file, with no edit to any existing file. This is the strongest realisation of the open/closed principle among the variants, and it is the structure used by plugin systems.

### 7.7 Applied Example: Document Parsing

```python
from abc import ABC, abstractmethod


class Parser(ABC):
    @abstractmethod
    def parse(self, raw: bytes) -> str:
        ...


class PDFParser(Parser):
    def parse(self, raw): return f"PDF text extracted from {len(raw)} bytes"


class DocxParser(Parser):
    def parse(self, raw): return f"DOCX text extracted from {len(raw)} bytes"


class CSVParser(Parser):
    def parse(self, raw): return f"CSV rows extracted from {len(raw)} bytes"


_PARSERS = {"pdf": PDFParser, "docx": DocxParser, "csv": CSVParser}


def parser_for(extension: str) -> Parser:
    if extension not in _PARSERS:
        raise ValueError(f"No parser registered for '{extension}'")
    return _PARSERS[extension]()


def ingest(filename: str, raw: bytes) -> str:
    extension = filename.rsplit(".", 1)[-1].lower()
    return parser_for(extension).parse(raw)      # client knows only Parser


print(ingest("report.pdf", b"x" * 1024))
```

The `ingest` function contains the ingestion workflow and no knowledge of parser classes. A new format is supported by adding a class and one registry entry.

### 7.8 Consequences

| Benefit | Explanation |
|---|---|
| Client decoupled from concrete classes | The client depends only on the Product interface, satisfying the dependency inversion principle |
| Extension without modification | New products are added by writing new code, satisfying the open/closed principle |
| Creation logic localised | Argument defaults, validation, and configuration lookups for construction live in one place |
| Substitutability in tests | A test can supply a factory that returns doubles, without patching |

| Liability | Explanation |
|---|---|
| Additional indirection | Reading the code requires following the factory to learn which class is actually used |
| Class proliferation in the subclassing variant | Each product may require a corresponding creator subclass |
| Registry drift | With a mapping-based registry, an unregistered product fails at runtime rather than at import time |

### 7.9 Related Patterns

**Abstract Factory** is a set of factory methods on one object, each producing a member of a related family. Factory Method produces one product; Abstract Factory produces several that must be mutually compatible.

**Template Method** is the same inheritance mechanism applied to behaviour rather than creation. A factory method is frequently one step inside a template method.

**Prototype** is an alternative that does not require a Creator subclass hierarchy: instead of a subclass deciding which class to instantiate, an object is cloned.

### 7.10 Python-Specific Considerations

Because classes are first-class objects and functions can be passed as arguments, the full GoF Creator hierarchy is rarely necessary in Python. A dictionary of callables, a function parameter with a class as its default, or `__init_subclass__` registration achieves the same decoupling with fewer classes.

The Creator subclass hierarchy earns its cost only when the Creator contains substantial shared behaviour, as `NotificationService.notify` did in Section 7.4. If the Creator contains nothing but the factory method, the hierarchy is ceremony and a function is preferable.

---

## 8. Abstract Factory

### 8.1 Problem Context

A reporting subsystem must support two storage backends, PostgreSQL and MySQL. Each backend requires three collaborating objects: a connection, a dialect-specific query builder, and a transaction manager. The objects are not independent, because a query built in PostgreSQL dialect cannot execute on a MySQL connection.

Applying Factory Method separately to each object type produces the following:

```python
connection = connection_factory("postgres")
query_builder = query_builder_factory("mysql")     # accepted, and wrong
transaction = transaction_factory("postgres")
```

Nothing detects the inconsistency. The system compiles, imports, starts, and fails at runtime with a syntax error from the database when a MySQL-dialect query reaches a PostgreSQL server. The defect is that **the constraint "these three objects must come from the same family" is not expressed anywhere in the type system or in the construction code**.

### 8.2 Intent

> Provide an interface for creating families of related or dependent objects without specifying their concrete classes.

The word **family** is the operative term. A family is a set of Concrete Products that are designed to work together and that must not be mixed with members of another family.

### 8.3 Participants

| Participant | Definition | Responsibility |
|---|---|---|
| **Abstract Factory** | An interface declaring one creation operation per abstract product | Defines what the family consists of |
| **Concrete Factory** | An implementation of Abstract Factory | Implements every creation operation to return products of one specific family |
| **Abstract Product** | The interface for one kind of product | Declares operations clients invoke on that kind |
| **Concrete Product** | An implementation of an Abstract Product belonging to one family | Provides family-specific behaviour |
| **Client** | Code parameterised by an Abstract Factory | Creates and uses products exclusively through the abstract interfaces |

The consistency guarantee arises from a structural property: **a Concrete Factory implements every creation operation, and it implements all of them for the same family**. Since the client obtains all products from one factory object, mixing families becomes impossible.

### 8.4 Reference Implementation

```python
from abc import ABC, abstractmethod


# ---------- Abstract Products ----------
class Connection(ABC):
    @abstractmethod
    def execute(self, sql: str) -> None: ...


class QueryBuilder(ABC):
    @abstractmethod
    def limit_clause(self, n: int) -> str: ...


# ---------- Concrete Products: PostgreSQL family ----------
class PostgresConnection(Connection):
    def execute(self, sql): print(f"[postgres] {sql}")


class PostgresQueryBuilder(QueryBuilder):
    def limit_clause(self, n): return f"LIMIT {n}"


# ---------- Concrete Products: MySQL family ----------
class MySQLConnection(Connection):
    def execute(self, sql): print(f"[mysql] {sql}")


class MySQLQueryBuilder(QueryBuilder):
    def limit_clause(self, n): return f"LIMIT 0, {n}"


# ---------- Abstract Factory ----------
class StorageFactory(ABC):
    """One creation operation per abstract product. The set of operations
    defines the composition of the family."""

    @abstractmethod
    def create_connection(self) -> Connection: ...

    @abstractmethod
    def create_query_builder(self) -> QueryBuilder: ...


# ---------- Concrete Factories ----------
class PostgresFactory(StorageFactory):
    def create_connection(self) -> Connection: return PostgresConnection()
    def create_query_builder(self) -> QueryBuilder: return PostgresQueryBuilder()


class MySQLFactory(StorageFactory):
    def create_connection(self) -> Connection: return MySQLConnection()
    def create_query_builder(self) -> QueryBuilder: return MySQLQueryBuilder()


# ---------- Client ----------
def fetch_recent_orders(factory: StorageFactory, n: int) -> None:
    """Parameterised by the factory. It names no concrete class, and it cannot
    construct an inconsistent pair because both products come from one factory."""
    connection = factory.create_connection()
    builder = factory.create_query_builder()
    connection.execute(f"SELECT * FROM orders ORDER BY id DESC {builder.limit_clause(n)}")


fetch_recent_orders(PostgresFactory(), 10)
# [postgres] SELECT * FROM orders ORDER BY id DESC LIMIT 10

fetch_recent_orders(MySQLFactory(), 10)
# [mysql] SELECT * FROM orders ORDER BY id DESC LIMIT 0, 10
```

Switching the entire system to a different backend requires changing one expression, the argument passed to `fetch_recent_orders`. In a real application that argument is supplied once, at the composition root, from configuration.

### 8.5 The Two Dimensions of Extension

Abstract Factory's benefits and its principal liability both derive from the same structural fact: the design has two dimensions of variation, and it treats them very differently.

| Dimension | What changes | Cost of extension |
|---|---|---|
| **Adding a family** | A new backend, for example SQLite | One new Concrete Factory plus one Concrete Product per product kind. No existing file is modified. |
| **Adding a product kind** | A new member of every family, for example `TransactionManager` | The Abstract Factory interface changes, which forces every existing Concrete Factory to implement the new operation. Every family must be modified. |

The design is open for extension along the family dimension and closed along the product dimension. This asymmetry is the standard reason Abstract Factory is rejected in systems where the set of product kinds is still unstable, and it is the correct choice when the set of product kinds is fixed and the set of families is expected to grow.

### 8.6 Variant: Factory as a Dictionary of Callables

Where the products are simple and no shared factory behaviour exists, the family can be expressed as a mapping instead of a class hierarchy. Type safety is weaker, and the volume of code is much smaller.

```python
POSTGRES = {"connection": PostgresConnection, "query_builder": PostgresQueryBuilder}
MYSQL = {"connection": MySQLConnection, "query_builder": MySQLQueryBuilder}


def fetch_recent_orders(family: dict, n: int) -> None:
    connection = family["connection"]()
    builder = family["query_builder"]()
    connection.execute(f"SELECT * FROM orders {builder.limit_clause(n)}")
```

The consistency guarantee still holds, because all products are drawn from one dictionary. What is lost is the compile-time check that a family is complete: a missing key surfaces as a `KeyError` at runtime rather than as an instantiation error at import time, which is what an unimplemented abstract method would produce.

### 8.7 Applied Examples

**Cross-platform user interface toolkits.** A `MacFactory` produces `MacButton`, `MacCheckbox`, and `MacMenu`; a `WindowsFactory` produces the Windows equivalents. This is the example used in the original GoF text.

**Theming.** A light-theme factory and a dark-theme factory each produce a matched set of colours, fonts, and icon sets, which prevents a dark-theme icon appearing on a light-theme surface.

**Multi-cloud infrastructure clients.** An AWS factory produces an object-storage client, a queue client, and a secrets client that all use one credential provider and one region; a GCP factory produces the equivalents.

**Test doubles.** An in-memory factory produces fake implementations of an entire family, allowing a full system test with no external infrastructure.

### 8.8 Factory Method Compared with Abstract Factory

| Criterion | Factory Method | Abstract Factory |
|---|---|---|
| Number of products created | One | Several, forming a family |
| Primary mechanism | Inheritance, a subclass overrides a method | Composition, the client holds a factory object |
| Unit of substitution | A Creator subclass | A whole Concrete Factory object |
| Time of binding | Fixed when the Creator subclass is chosen | Changeable at runtime by passing a different factory |
| Guarantee provided | The correct concrete type is produced | The products produced are mutually compatible |
| Typical size | One abstract method | One abstract method per product kind |

Abstract Factory is commonly implemented using Factory Method for each of its creation operations, so the patterns compose rather than compete.

### 8.9 Consequences

| Benefit | Explanation |
|---|---|
| Enforced family consistency | Incompatible products cannot be combined, because they cannot be obtained from the same factory |
| Concrete classes isolated | Concrete product names appear only inside Concrete Factories |
| Families are interchangeable at runtime | The factory is an ordinary object and can be replaced by assignment |
| Supports the dependency inversion principle | Clients depend only on abstract products and one abstract factory |

| Liability | Explanation |
|---|---|
| Adding a product kind is expensive | Every Concrete Factory must be modified, which violates the open/closed principle along that dimension |
| Class count grows multiplicatively | Product kinds multiplied by families, plus the abstract interfaces |
| Indirection cost | Two levels of abstraction separate the client from the object it actually uses |
| Premature use is common | With one family, the entire structure is overhead with no benefit |

### 8.10 Related Patterns

**Factory Method** implements the individual creation operations of a Concrete Factory.

**Prototype** offers an alternative implementation: a Concrete Factory can hold a configured prototypical instance of each product and return clones instead of constructing new objects.

**Singleton** is frequently applied to Concrete Factories, since one instance per family is sufficient.

**Builder** is used when an individual product within the family is itself complex to construct.

---

## 9. Builder

### 9.1 Problem Context

An HTTP request object has one required component, the URL, and several optional ones: method, headers, query parameters, body, timeout, retry count, and TLS verification. Expressing this through a constructor produces the following call site:

```python
request = HttpRequest("https://api.example.com/users", "POST",
                      {"Authorization": "Bearer xyz"}, {"active": "true"},
                      '{"name": "Amit"}', 60, 3, True)
```

Three defects are present.

**The telescoping constructor problem.** A *telescoping constructor* is a constructor with a long positional parameter list, typically accompanied by a series of overloads or defaults that allow trailing parameters to be omitted. The call site is unreadable because the meaning of each argument depends on its position, and transposing two arguments of the same type is a defect the language cannot detect.

**Construction is not atomic with respect to validation.** Some rules span several fields: a body is meaningful only with methods that accept one, and a retry count is meaningful only with a positive timeout. Checking these rules inside the constructor is possible but places validation logic in the same place as field assignment, and it cannot express rules that depend on a component supplied later.

**The object cannot be assembled incrementally.** When components are gathered across several steps, for instance headers added by different middleware layers, a single constructor call is the wrong shape for the code that produces the arguments.

Keyword arguments remove the first defect but not the second or third:

```python
request = HttpRequest(url="https://api.example.com/users", method="POST",
                      headers={"Authorization": "Bearer xyz"}, timeout=60)
```

### 9.2 Intent

> Separate the construction of a complex object from its representation, so that the same construction process can create different representations.

The intent has two halves that are worth separating, because in practice most uses exercise only the first. The first half, separating construction from representation, is the common case: a dedicated object accumulates components and produces the finished product. The second half, one construction process producing different representations, is the case where the same sequence of steps is directed at different Builder implementations, for example to produce an HTML document and a PDF document from one traversal of the same source.

### 9.3 Participants

| Participant | Definition | Responsibility |
|---|---|---|
| **Builder** | The interface declaring one operation per component of the product | Defines the construction steps available |
| **Concrete Builder** | An implementation of Builder | Accumulates the components, tracks construction state, validates, and provides an operation to retrieve the finished product |
| **Product** | The complex object under construction | Holds the assembled components; often has no public construction logic of its own |
| **Director** | An object that executes a fixed sequence of Builder operations | Encodes a reusable recipe, so that a common configuration is not re-specified at every call site |

The Director is optional and is frequently omitted. It is worth introducing when the same sequence of construction steps is required in several places.

### 9.4 Reference Implementation

```python
class HttpRequest:
    """The Product. It is deliberately passive: it holds components and does not
    know how they were gathered."""

    def __init__(self, url, method, headers, query, body, timeout):
        self.url = url
        self.method = method
        self.headers = headers
        self.query = query
        self.body = body
        self.timeout = timeout

    def __repr__(self):
        return (f"HttpRequest({self.method} {self.url} headers={self.headers} "
                f"query={self.query} body={self.body} timeout={self.timeout})")


class HttpRequestBuilder:
    """The Concrete Builder. It holds partial state, which is what makes
    incremental assembly and deferred validation possible."""

    def __init__(self):
        self._url = None
        self._method = "GET"
        self._headers = {}
        self._query = {}
        self._body = None
        self._timeout = 30

    # Each configuration operation returns self. This is what permits chained
    # calls: the value of one call is the receiver of the next. Without the
    # return, each call evaluates to None and the second attribute access fails.
    def url(self, value: str) -> "HttpRequestBuilder":
        self._url = value
        return self

    def method(self, value: str) -> "HttpRequestBuilder":
        self._method = value.upper()
        return self

    def header(self, key: str, value: str) -> "HttpRequestBuilder":
        self._headers[key] = value      # additive: callable repeatedly
        return self

    def query_param(self, key: str, value: str) -> "HttpRequestBuilder":
        self._query[key] = value
        return self

    def body(self, value: str) -> "HttpRequestBuilder":
        self._body = value
        return self

    def timeout(self, seconds: int) -> "HttpRequestBuilder":
        self._timeout = seconds
        return self

    def build(self) -> HttpRequest:
        """The single point at which the accumulated state is validated as a
        whole and converted into a Product. Cross-field rules that no individual
        setter could check are enforced here."""
        if self._url is None:
            raise ValueError("url is required")
        if self._body is not None and self._method in ("GET", "HEAD"):
            raise ValueError(f"{self._method} requests must not carry a body")
        if self._timeout <= 0:
            raise ValueError("timeout must be positive")
        return HttpRequest(self._url, self._method, dict(self._headers),
                           dict(self._query), self._body, self._timeout)


request = (HttpRequestBuilder()
           .method("post")
           .url("https://api.example.com/users")
           .header("Authorization", "Bearer xyz")
           .header("Content-Type", "application/json")
           .query_param("active", "true")
           .body('{"name": "Amit"}')
           .timeout(60)
           .build())

print(request)
```

Three design decisions in this implementation are worth stating explicitly.

**The setters return `self`.** This produces a *fluent interface*, defined as an API in which method calls are chained so that the code reads as a sequence of configuration statements. The mechanism is nothing more than returning the receiver.

**Validation is concentrated in `build`.** The setters accept values without judging them, because a value that is invalid in combination with a component not yet supplied cannot be judged in isolation. The rule that a GET request must not carry a body is checkable only when both the method and the body are known.

**The product receives copies of the mutable components.** `dict(self._headers)` prevents the builder from retaining a reference into the finished product. Without the copy, reusing the builder to construct a second request would mutate the headers of the first.

### 9.5 Variant: The Director

```python
class RequestDirector:
    """Holds reusable construction recipes. The Director knows the sequence of
    steps; the Builder knows how to perform each step."""

    @staticmethod
    def json_post(builder: HttpRequestBuilder, url: str, payload: str) -> HttpRequest:
        return (builder
                .method("POST")
                .url(url)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .body(payload)
                .timeout(60)
                .build())

    @staticmethod
    def health_check(builder: HttpRequestBuilder, url: str) -> HttpRequest:
        return builder.method("GET").url(url).timeout(5).build()


print(RequestDirector.json_post(HttpRequestBuilder(), "https://api.example.com/users",
                                '{"name": "Amit"}'))
print(RequestDirector.health_check(HttpRequestBuilder(), "https://api.example.com/health"))
```

The separation matters when several Builder implementations exist. The same Director recipe applied to a `CurlCommandBuilder` instead of an `HttpRequestBuilder` would emit a shell command rather than a request object, which is the "same construction process, different representations" half of the intent.

### 9.6 Variant: Immutable Product

Where the product must be immutable after construction, the builder is the natural place to hold the mutable partial state. The product is then created in one step at the end.

```python
from dataclasses import dataclass, field
from types import MappingProxyType


@dataclass(frozen=True)
class ImmutableRequest:
    url: str
    method: str = "GET"
    headers: MappingProxyType = field(default_factory=lambda: MappingProxyType({}))
    timeout: int = 30


class ImmutableRequestBuilder:
    def __init__(self):
        self._headers = {}
        self._url = None
        self._method = "GET"
        self._timeout = 30

    def url(self, v): self._url = v; return self
    def method(self, v): self._method = v.upper(); return self
    def header(self, k, v): self._headers[k] = v; return self
    def timeout(self, v): self._timeout = v; return self

    def build(self) -> ImmutableRequest:
        if self._url is None:
            raise ValueError("url is required")
        return ImmutableRequest(self._url, self._method,
                                MappingProxyType(dict(self._headers)), self._timeout)


req = ImmutableRequestBuilder().url("https://x.dev").header("A", "1").build()
# req.url = "other"   raises FrozenInstanceError
```

`frozen=True` blocks attribute assignment on the dataclass, and `MappingProxyType` provides a read-only view over the header dictionary, which prevents mutation through the attribute.

### 9.7 Applied Examples

**Query construction.** SQLAlchemy's `select(...).where(...).order_by(...).limit(...)` accumulates clauses and compiles them into SQL only when the statement is executed. Each call returns a new object, which is an immutable variant of the pattern.

**Test data construction.** A `UserBuilder` with sensible defaults allows a test to specify only the field under test: `UserBuilder().with_status("suspended").build()`. This keeps tests readable and insulates them from changes to unrelated fields.

**Configuration objects.** Application configuration assembled from defaults, then a file, then environment variables, then command-line flags, is an incremental assembly problem with a validation step at the end.

**Document generation.** A traversal of a document tree calls `add_heading`, `add_paragraph`, and `add_table` on a Builder. Substituting an `HtmlBuilder` for a `PdfBuilder` changes the output format without changing the traversal.

### 9.8 Consequences

| Benefit | Explanation |
|---|---|
| Readable construction | Each component is named at the call site, which removes positional ambiguity |
| Incremental assembly | Components can be supplied across several statements and by several collaborators |
| Cross-field validation | `build` sees the complete configuration and can enforce rules that no individual setter can check |
| Multiple representations | One construction sequence can drive different Builder implementations |
| Supports immutable products | The mutable partial state resides in the builder rather than in the product |

| Liability | Explanation |
|---|---|
| Duplication of the product's shape | Each component of the product usually corresponds to a builder operation, so a field added to the product requires a method added to the builder |
| Additional class per product | The class count doubles for every product that gets a builder |
| Deferred error detection | A missing required component is reported at `build` time rather than at the point where it was omitted |
| Unnecessary for simple products | For objects with a few fields, keyword arguments are clearer and shorter |

### 9.9 Python-Specific Considerations

Python's keyword arguments with defaults, combined with `@dataclass`, cover a large fraction of the cases that require a Builder in languages without them:

```python
from dataclasses import dataclass, field


@dataclass
class HttpRequest:
    url: str
    method: str = "GET"
    headers: dict = field(default_factory=dict)
    timeout: int = 30


request = HttpRequest(url="https://api.example.com", method="POST", timeout=60)
```

`field(default_factory=dict)` is required rather than `= {}` because a mutable default evaluated once at function-definition time would be shared by every instance, which is a well-known defect class in Python.

A Builder is justified over keyword arguments when at least one of the following holds:

1. Validation rules span multiple fields and must be enforced as a unit.
2. Components are contributed incrementally by different parts of the system.
3. The same construction sequence must produce more than one representation.
4. A fluent interface materially improves readability at many call sites.
5. The product must be immutable while its construction is inherently multi-step.

If none of these hold, a dataclass with keyword arguments is the better design.

### 9.10 Related Patterns

**Abstract Factory** also constructs objects without exposing concrete classes. The distinction is that Abstract Factory returns a product immediately from each call, whereas Builder accumulates state across calls and returns the product only at the end. Abstract Factory emphasises families of products; Builder emphasises the construction process of one complex product.

**Composite** is frequently the product a Builder assembles, since tree structures are built incrementally.

**Fluent Interface** is the general API style of which chained builders are the most common instance.

---

## 10. Prototype

### 10.1 Problem Context

A simulation spawns several hundred enemy entities. Each entity carries statistics, an equipment loadout, an ability list, and a behaviour profile that is derived at startup by evaluating configuration and a difficulty curve. Constructing one entity from raw configuration takes measurable time and requires access to the configuration subsystem.

```python
def spawn_guard(config, difficulty_curve):
    stats = derive_stats(config, difficulty_curve)          # expensive
    loadout = resolve_equipment(config["guard"]["items"])   # expensive
    abilities = compile_abilities(config["guard"]["skills"])# expensive
    return Enemy("Guard", stats, loadout, abilities)


guards = [spawn_guard(config, curve) for _ in range(500)]   # 500 identical derivations
```

The defects are that identical derivation work is repeated for every instance, and that the spawning code must retain access to the configuration subsystem in order to create an object it has already created once.

There is a second, structurally distinct case. When an object has accumulated state at runtime, for example a document that has been edited or an entity that has been buffed, no constructor can reproduce that state, because the state is the result of a history rather than of a set of parameters.

### 10.2 Intent

> Specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.

The pattern replaces construction with copying. The consequence is that the specification of what to create is an *object* rather than a *class*, which means that the specification can be assembled at runtime, altered at runtime, and stored in a data structure.

### 10.3 Participants

| Participant | Definition | Responsibility |
|---|---|---|
| **Prototype** | An interface declaring a cloning operation | Declares `clone` |
| **Concrete Prototype** | A class implementing the cloning operation | Returns a copy of itself, with a correct policy for which parts are copied and which are shared |
| **Client** | Code that requests new objects | Calls `clone` on a prototype instead of invoking a constructor |

### 10.4 Reference Implementation

```python
import copy


class Enemy:
    def __init__(self, name, stats, loadout, abilities):
        self.name = name
        self.stats = stats            # dict, mutable
        self.loadout = loadout        # list, mutable
        self.abilities = abilities    # list, mutable

    def clone(self) -> "Enemy":
        return copy.deepcopy(self)

    def __repr__(self):
        return f"Enemy({self.name}, stats={self.stats}, abilities={self.abilities})"


# The prototype is derived once, using the expensive path.
guard_prototype = Enemy("Guard", {"hp": 100, "armour": 20},
                        ["sword", "shield"], ["block", "slash"])

# Every subsequent instance is a copy, with only the differences applied.
squad = []
for i in range(3):
    guard = guard_prototype.clone()
    guard.name = f"Guard-{i}"
    squad.append(guard)

squad[0].abilities.append("shield_bash")     # affects only this clone

print(guard_prototype)     # abilities=['block', 'slash'], unchanged
print(squad[0])            # abilities=['block', 'slash', 'shield_bash']
print(squad[1])            # abilities=['block', 'slash']
```

### 10.5 Shallow and Deep Copying

The correctness of every Prototype implementation rests on this distinction, and getting it wrong produces defects in which mutating one object silently alters another.

**Shallow copy.** A new outer object is allocated, and its attributes are bound to the *same* objects the original's attributes were bound to. The copy is independent with respect to rebinding an attribute, and shared with respect to mutating the object an attribute refers to.

**Deep copy.** A new outer object is allocated, and each attribute is bound to a recursively produced copy of what the original referred to. The result is fully independent.

```python
import copy

original = {"scores": [1, 2, 3]}

shallow = copy.copy(original)
deep = copy.deepcopy(original)

shallow["scores"].append(4)         # mutates the list both dicts refer to

print(original["scores"])           # [1, 2, 3, 4]
print(deep["scores"])               # [1, 2, 3]

shallow["scores"] = [9]             # rebinding, not mutation
print(original["scores"])           # [1, 2, 3, 4], unaffected by rebinding
```

The last two lines illustrate why the distinction is stated in terms of mutation rather than assignment. Assigning a new object to an attribute of the copy never affects the original; mutating an object reachable from both does.

Deep copy is the default choice for Prototype whenever the object has mutable attributes. Shallow copy is correct only where the shared parts are genuinely immutable or are intended to be shared, such as a texture atlas or a lookup table.

Deep copying has three failure modes worth knowing. Objects holding file handles, sockets, threads, or database connections cannot be meaningfully deep-copied, since the underlying operating system resource is not duplicated. Very large object graphs make deep copying more expensive than construction, which removes the pattern's justification. Cyclic references are handled correctly by `copy.deepcopy` through its memoisation table, described next.

### 10.6 Customising the Copy: `__copy__` and `__deepcopy__`

`copy.deepcopy` calls an object's `__deepcopy__` method if the class defines one. Overriding it is required whenever "copy every attribute verbatim" is the wrong policy for at least one attribute.

```python
import copy
from datetime import datetime


class Enemy:
    def __init__(self, name, stats, abilities, spawned_at=None):
        self.name = name
        self.stats = stats
        self.abilities = abilities
        self.spawned_at = spawned_at or datetime.now()
        self.entity_id = id(self)

    def __deepcopy__(self, memo):
        # `memo` is deepcopy's bookkeeping dictionary. It maps the id() of each
        # object already copied to its copy. Threading it through nested
        # deepcopy calls is what prevents infinite recursion on cyclic
        # references and preserves sharing: an object referenced twice in the
        # original graph is copied once and referenced twice in the result.
        clone = Enemy(
            self.name,
            copy.deepcopy(self.stats, memo),
            copy.deepcopy(self.abilities, memo),
        )
        # Fields whose value must be unique to each instance are recomputed
        # rather than copied. A spawn timestamp describes this object's own
        # creation, so copying the prototype's timestamp would be incorrect.
        clone.spawned_at = datetime.now()
        clone.entity_id = id(clone)
        memo[id(self)] = clone
        return clone
```

The rule for deciding which attributes to copy and which to recompute is: **copy the attributes that describe what the object is, and recompute the attributes that describe this particular instance's identity or history.**

### 10.7 Variant: Prototype Registry

Prototypes are commonly held in a registry keyed by name, which turns the set of available object templates into runtime data that can be loaded from configuration.

```python
class PrototypeRegistry:
    def __init__(self):
        self._prototypes: dict[str, Enemy] = {}

    def register(self, key: str, prototype: Enemy) -> None:
        self._prototypes[key] = prototype

    def create(self, key: str) -> Enemy:
        if key not in self._prototypes:
            raise KeyError(f"No prototype registered under '{key}'")
        return copy.deepcopy(self._prototypes[key])


registry = PrototypeRegistry()
registry.register("guard", Enemy("Guard", {"hp": 100}, ["block"]))
registry.register("archer", Enemy("Archer", {"hp": 70}, ["shoot", "evade"]))

wave = [registry.create("guard"), registry.create("archer"), registry.create("guard")]
```

The registry looks similar to a parameterised factory, and the distinction is precise: a factory registry maps a key to a **class** and calls it, whereas a prototype registry maps a key to a **configured instance** and copies it. The prototype registry can therefore offer variants that no class distinguishes, such as "guard with a full loadout" and "guard with a damaged shield", without defining a class for each.

### 10.8 Applied Examples

**Entity spawning in simulations and games**, as above.

**Test fixtures.** A fully populated base object is constructed once for a test module, and each test clones it and modifies the single field under examination. This gives isolation between tests without paying the construction cost repeatedly.

**Configuration templates.** A default configuration object is cloned per environment and the differing keys are overridden.

**Editor state snapshots.** Cloning an object graph at a point in time captures state that no constructor could reproduce. This overlaps with the Memento pattern, which addresses the same need with an emphasis on encapsulation of the saved state.

**Document duplication.** Duplicating a slide, a layer, or a shape in an editing application is exactly the pattern, with the prototype being whatever the user selected.

### 10.9 Consequences

| Benefit | Explanation |
|---|---|
| Avoids repeated expensive construction | Derivation work is performed once for the prototype |
| Captures runtime-accumulated state | State produced by a history, not by parameters, is reproducible only by copying |
| Adds and removes object kinds at runtime | Prototypes are objects, so the catalogue of available kinds is data rather than code |
| Reduces subclass count | Variants that differ only in field values need no class of their own |

| Liability | Explanation |
|---|---|
| Copy semantics are error-prone | An incorrect shallow copy produces defects that appear far from their cause |
| Some objects are not copyable | Objects owning operating system resources require a custom `__deepcopy__` or cannot use the pattern |
| Deep copy may be slower than construction | For large graphs of cheap objects, the pattern can be a pessimisation |
| The prototype must remain valid | Accidental mutation of the prototype corrupts every object cloned afterwards |

### 10.10 Related Patterns

**Abstract Factory** may hold prototypes internally and implement its creation operations by cloning them rather than by instantiating classes.

**Composite** and **Decorator** structures benefit from Prototype, because copying a configured tree of objects is otherwise tedious to write.

**Memento** stores a snapshot of an object's state for later restoration. Prototype produces an independent object intended for use alongside the original; Memento produces an opaque record intended to replace the original's state later.

**Singleton** constrains a class to one instance and is, in that sense, the opposite constraint.

### 10.11 Python-Specific Considerations

`copy.deepcopy` provides the pattern's mechanism without any explicit Prototype interface, so the pattern in Python usually reduces to a `clone` method one line long, or to calling `copy.deepcopy` directly.

For dataclasses, `dataclasses.replace` produces a copy with selected fields changed, which expresses "clone with modifications" directly:

```python
from dataclasses import dataclass, replace


@dataclass
class Config:
    host: str
    port: int
    debug: bool = False


base = Config(host="localhost", port=5432)
staging = replace(base, host="staging.internal")
```

`replace` performs a shallow copy, so the caveat about shared mutable fields applies to it as well.

---

## 11. Comparative Summary of the Five Patterns

### 11.1 Intent and Mechanism

| Pattern | Intent in one line | Primary mechanism | What varies |
|---|---|---|---|
| **Singleton** | Ensure one instance exists and is globally reachable | Interception of instantiation in `__new__`, a metaclass `__call__`, or a module | The number of instances, fixed at one |
| **Factory Method** | Defer the choice of concrete class to a subclass or a lookup | Inheritance, or a mapping from key to class | Which concrete product is produced |
| **Abstract Factory** | Create families of related products without naming concrete classes | Composition, the client holds a factory object | Which entire family is produced |
| **Builder** | Separate the construction of a complex object from its representation | An object that accumulates partial state and validates on completion | The construction process |
| **Prototype** | Create objects by copying a configured instance | `copy.deepcopy` with an optional `__deepcopy__` policy | Whether an object is built or copied |

### 11.2 Cost and Applicability

| Pattern | Classes added | Runtime substitutable | Chief liability | Apply when |
|---|---|---|---|---|
| **Singleton** | None, one class is constrained | No | Global mutable state complicates testing | A shared resource must be unique and reference passing is impractical |
| **Factory Method** | One product hierarchy, optionally one creator hierarchy | Yes, by replacing the factory | Indirection between call site and concrete class | The concrete type depends on runtime data or configuration |
| **Abstract Factory** | Product kinds multiplied by families | Yes, by passing a different factory | Adding a product kind modifies every factory | Several objects must be mutually compatible |
| **Builder** | One builder per product | Yes, by using a different builder | Duplicates the product's field list | Many optional components or cross-field validation |
| **Prototype** | None, one method is added | Yes, prototypes are data | Copy semantics errors and non-copyable resources | Construction is expensive or state is history-dependent |

### 11.3 Selection Procedure

The following sequence resolves most cases. Each question should be answered against the requirements as they exist, not against requirements that are anticipated.

1. Is a direct constructor call adequate, meaning the concrete class is fixed, construction is simple, and no cardinality constraint applies? If yes, use it and stop. This is the correct answer more often than any pattern.
2. Must exactly one instance exist? Prefer creating it once at the composition root and injecting it. Apply Singleton only if that is impractical, and prefer a module-level object or `lru_cache` over a class-based implementation.
3. Does the concrete class depend on runtime data? Use a parameterised factory function or a registry. Introduce the Creator subclass hierarchy only if the Creator also holds substantial shared behaviour.
4. Must several created objects be mutually compatible? Use Abstract Factory, provided the set of product kinds is stable.
5. Does the object have many optional components, or validation rules that span fields, or is it assembled incrementally? Use Builder, after confirming that keyword arguments with a dataclass are insufficient.
6. Is construction expensive, or does the object carry state that a constructor cannot reproduce? Use Prototype, and decide the shallow or deep copy policy explicitly.

---

## 12. Key Takeaways

1. **Creational patterns separate the knowledge of what is created from the code that uses it.** Every one of the five achieves this separation along a different axis: cardinality, concrete type, family, construction process, or origin.

2. **A pattern is a problem, a solution, and a set of consequences.** Learning the solution structure without the problem produces misapplication, and learning it without the consequences produces designs whose costs were never weighed.

3. **The dependency inversion and open/closed principles are visible in four of the five patterns.** Clients depend on abstract products, and new concrete types are added without modifying existing code. Singleton is the exception and works against dependency inversion, which is why it attracts more criticism than the others.

4. **Python's language features reduce the code required for several of these patterns.** Modules are singletons, classes are first-class objects that can be stored in dictionaries, keyword arguments with dataclasses cover many builder cases, and `copy.deepcopy` supplies Prototype's mechanism. Recognise the pattern, then implement it in the idiom of the language rather than transcribing a Java structure.

5. **Indirection is a cost paid on every reading of the code and repaid only when the anticipated change occurs.** Introduce a creational pattern when the variation it isolates is variation the system actually has.

6. **The patterns compose.** Abstract Factory is normally implemented with Factory Methods, Concrete Factories are frequently Singletons, and either may use a Builder or a Prototype to produce an individual product.

---

## 13. Practice Exercises with Solutions

### Exercise 1: Configuration Registry with Correct Initialisation

Implement a `ConfigManager` such that repeated instantiation returns the same object, configuration loaded through one reference is visible through every other, and initialisation does not reset state on subsequent calls. Then state why a module-level dictionary would be a reasonable alternative and when it would not be.

**Solution**

```python
class ConfigManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._config = {}      # set here, so it runs exactly once
        return cls._instance

    def load(self, mapping: dict) -> None:
        self._config.update(mapping)        # update, not reassign, to preserve
                                            # any values loaded earlier

    def get(self, key, default=None):
        return self._config.get(key, default)

    def set(self, key, value) -> None:
        self._config[key] = value


a = ConfigManager()
a.load({"db_host": "localhost", "port": 5432})

b = ConfigManager()
print(b.get("db_host"))     # localhost
b.set("port", 6000)
print(a.get("port"))        # 6000
print(a is b)               # True
```

The initialisation of `_config` is placed inside `__new__` under the `is None` guard. Placing it in `__init__` without a guard would clear the configuration on every `ConfigManager()` call, which is the most common defect in hand-written singletons.

A module-level dictionary in a `config.py` file provides the same guarantees with less machinery, because module objects are cached in `sys.modules`. It is the better choice unless the configuration must support subclassing, multiple named configurations, or lazy construction that depends on runtime arguments.

---

### Exercise 2: Extensible Shape Factory

Build a shape-drawing subsystem in which client code obtains a shape by name and calls `draw` on it. Adding a new shape must not require modifying any existing file. Implement it twice: once with an explicit registry dictionary, and once with `__init_subclass__` registration. State the difference in extension cost.

**Solution**

```python
from abc import ABC, abstractmethod


# ---------- Version A: explicit registry ----------
class Shape(ABC):
    @abstractmethod
    def draw(self) -> None: ...


class Circle(Shape):
    def draw(self): print("Drawing circle")


class Square(Shape):
    def draw(self): print("Drawing square")


_SHAPES: dict[str, type[Shape]] = {"circle": Circle, "square": Square}


def shape_factory(kind: str) -> Shape:
    if kind not in _SHAPES:
        raise ValueError(f"Unknown shape: {kind}")
    return _SHAPES[kind]()


# ---------- Version B: self-registering subclasses ----------
class AutoShape(ABC):
    registry: dict[str, type["AutoShape"]] = {}

    def __init_subclass__(cls, name: str = None, **kwargs):
        super().__init_subclass__(**kwargs)
        if name:
            AutoShape.registry[name] = cls

    @abstractmethod
    def draw(self) -> None: ...


class AutoCircle(AutoShape, name="circle"):
    def draw(self): print("Drawing circle")


class AutoHexagon(AutoShape, name="hexagon"):
    def draw(self): print("Drawing hexagon")


def auto_shape_factory(kind: str) -> AutoShape:
    return AutoShape.registry[kind]()


for k in sorted(AutoShape.registry):
    auto_shape_factory(k).draw()
```

In version A, adding a shape requires a new class plus an edit to the `_SHAPES` dictionary, so one existing file is modified. In version B, adding a shape requires only the new class, and registration occurs as a side effect of the class definition, provided the module defining it is imported. The trade-off is that version B's registration depends on import order, so a shape defined in a module that is never imported will be absent from the registry with no error.

---

### Exercise 3: Abstract Factory for a Cross-Platform Form

Design an Abstract Factory producing two product kinds, `TextInput` and `SubmitButton`, in two families, Material and iOS. Write a `render_form` client that is parameterised by the factory. Then explain what would change if a third product kind, `Checkbox`, were required.

**Solution**

```python
from abc import ABC, abstractmethod


# ---------- Abstract Products ----------
class TextInput(ABC):
    @abstractmethod
    def render(self) -> None: ...


class SubmitButton(ABC):
    @abstractmethod
    def render(self) -> None: ...


# ---------- Material family ----------
class MaterialTextInput(TextInput):
    def render(self): print("[Material text input with floating label]")


class MaterialSubmitButton(SubmitButton):
    def render(self): print("[Material raised button]")


# ---------- iOS family ----------
class IOSTextInput(TextInput):
    def render(self): print("(iOS rounded text input)")


class IOSSubmitButton(SubmitButton):
    def render(self): print("(iOS filled button)")


# ---------- Abstract Factory ----------
class FormUIFactory(ABC):
    @abstractmethod
    def create_text_input(self) -> TextInput: ...

    @abstractmethod
    def create_submit_button(self) -> SubmitButton: ...


class MaterialFactory(FormUIFactory):
    def create_text_input(self): return MaterialTextInput()
    def create_submit_button(self): return MaterialSubmitButton()


class IOSFactory(FormUIFactory):
    def create_text_input(self): return IOSTextInput()
    def create_submit_button(self): return IOSSubmitButton()


# ---------- Client ----------
def render_form(factory: FormUIFactory) -> None:
    factory.create_text_input().render()
    factory.create_submit_button().render()


render_form(MaterialFactory())
render_form(IOSFactory())
```

Adding a `Checkbox` product kind requires: one new abstract product class, one concrete class per family, a new abstract method on `FormUIFactory`, and an implementation of that method in every existing Concrete Factory. The number of files modified grows with the number of families, which is the asymmetry described in Section 8.5. Adding a third family, in contrast, requires only new files.

---

### Exercise 4: Builder with Cross-Field Validation

Implement a builder for a `DatabaseConnectionConfig` with the fields `host`, `port`, `database`, `user`, `password`, `ssl_enabled`, `ssl_cert_path`, `pool_size`, and `timeout`. Enforce these rules at build time: `host` and `database` are required; `pool_size` must be between 1 and 100; if `ssl_enabled` is true then `ssl_cert_path` is required; and supplying `password` without `user` is an error. Explain why each rule cannot be enforced in an individual setter.

**Solution**

```python
class DatabaseConnectionConfig:
    def __init__(self, host, port, database, user, password,
                 ssl_enabled, ssl_cert_path, pool_size, timeout):
        self.host = host
        self.port = port
        self.database = database
        self.user = user
        self.password = password
        self.ssl_enabled = ssl_enabled
        self.ssl_cert_path = ssl_cert_path
        self.pool_size = pool_size
        self.timeout = timeout

    def __repr__(self):
        return (f"DatabaseConnectionConfig({self.user}@{self.host}:{self.port}"
                f"/{self.database} ssl={self.ssl_enabled} pool={self.pool_size})")


class DatabaseConfigBuilder:
    def __init__(self):
        self._host = None
        self._port = 5432
        self._database = None
        self._user = None
        self._password = None
        self._ssl_enabled = False
        self._ssl_cert_path = None
        self._pool_size = 10
        self._timeout = 30

    def host(self, v): self._host = v; return self
    def port(self, v): self._port = v; return self
    def database(self, v): self._database = v; return self
    def credentials(self, user, password):
        self._user, self._password = user, password
        return self

    def with_ssl(self, cert_path):
        self._ssl_enabled = True
        self._ssl_cert_path = cert_path
        return self

    def pool_size(self, v): self._pool_size = v; return self
    def timeout(self, v): self._timeout = v; return self

    def build(self) -> DatabaseConnectionConfig:
        errors = []
        if self._host is None:
            errors.append("host is required")
        if self._database is None:
            errors.append("database is required")
        if not 1 <= self._pool_size <= 100:
            errors.append("pool_size must be between 1 and 100")
        if self._ssl_enabled and not self._ssl_cert_path:
            errors.append("ssl_cert_path is required when ssl is enabled")
        if self._password is not None and self._user is None:
            errors.append("password supplied without user")
        if errors:
            raise ValueError("Invalid configuration: " + "; ".join(errors))

        return DatabaseConnectionConfig(
            self._host, self._port, self._database, self._user, self._password,
            self._ssl_enabled, self._ssl_cert_path, self._pool_size, self._timeout)


config = (DatabaseConfigBuilder()
          .host("db.internal")
          .database("orders")
          .credentials("app_user", "s3cret")
          .with_ssl("/etc/ssl/client.pem")
          .pool_size(25)
          .build())

print(config)
```

The requiredness rules for `host` and `database` cannot be enforced in a setter because a setter that is never called cannot raise. The SSL rule and the credentials rule relate two fields, and at the time either setter runs the other field may not yet have been supplied, so neither setter has enough information to decide. Only `pool_size` could be validated in its setter, since it depends on nothing else; validating it in `build` alongside the others keeps all rules in one place and allows every violation to be reported together rather than one per exception.

The `credentials` and `with_ssl` methods set two related fields in one call, which is a common builder technique for making an invalid intermediate state unreachable rather than merely detectable.

---

### Exercise 5: Prototype with Correct Copy Semantics

Implement a `Document` class with `title`, `body`, `tags` as a list, and `metadata` as a dictionary. Provide both a deep and a shallow cloning operation, demonstrate the difference in behaviour, and then override `__deepcopy__` so that a `created_at` timestamp is set to the time of cloning rather than copied from the prototype.

**Solution**

```python
import copy
from datetime import datetime


class Document:
    def __init__(self, title, body, tags=None, metadata=None):
        self.title = title
        self.body = body
        self.tags = tags if tags is not None else []
        self.metadata = metadata if metadata is not None else {}
        self.created_at = datetime.now()

    def clone(self) -> "Document":
        return copy.deepcopy(self)

    def shallow_clone(self) -> "Document":
        return copy.copy(self)

    def __deepcopy__(self, memo):
        clone = Document(
            self.title,
            self.body,
            copy.deepcopy(self.tags, memo),
            copy.deepcopy(self.metadata, memo),
        )
        clone.created_at = datetime.now()    # identity of this copy, not copied
        memo[id(self)] = clone
        return clone

    def __repr__(self):
        return f"Document({self.title!r}, tags={self.tags}, metadata={self.metadata})"


prototype = Document("Blog Template", "Introduction...",
                     tags=["draft"], metadata={"author": "Amit"})

deep = prototype.clone()
deep.tags.append("published")
deep.metadata["reviewed"] = True
print("prototype after deep clone mutation:", prototype)
# tags=['draft'], metadata={'author': 'Amit'}

shallow = prototype.shallow_clone()
shallow.tags.append("leaked")
print("prototype after shallow clone mutation:", prototype)
# tags=['draft', 'leaked'], the mutation propagated

print(prototype.created_at == deep.created_at)     # False
```

The shallow clone shares the `tags` list object with the prototype, so appending through either name mutates the single list both refer to. The deep clone binds `tags` to a new list, so the two are independent. The `__deepcopy__` override demonstrates the general rule: attributes describing what the object *is* are copied, and attributes describing this instance's own identity or creation are recomputed.

---

### Exercise 6: Capstone, Combining Four Patterns

Design a data access layer that supports two database backends, exposes read and write connections, ensures a single connection pool exists per process, and constructs its configuration through a fluent interface. Identify which pattern plays which role, and justify each choice.

**Solution**

```python
from abc import ABC, abstractmethod
import threading


# ---------- Abstract Products ----------
class Connection(ABC):
    @abstractmethod
    def execute(self, sql: str) -> None: ...


# ---------- Concrete Products ----------
class MySQLReadConnection(Connection):
    def execute(self, sql): print(f"[mysql-read] {sql}")


class MySQLWriteConnection(Connection):
    def execute(self, sql): print(f"[mysql-write] {sql}")


class PostgresReadConnection(Connection):
    def execute(self, sql): print(f"[pg-read] {sql}")


class PostgresWriteConnection(Connection):
    def execute(self, sql): print(f"[pg-write] {sql}")


# ---------- Abstract Factory: one family per backend ----------
class ConnectionFactory(ABC):
    @abstractmethod
    def create_read(self) -> Connection: ...

    @abstractmethod
    def create_write(self) -> Connection: ...


class MySQLFactory(ConnectionFactory):
    def create_read(self): return MySQLReadConnection()
    def create_write(self): return MySQLWriteConnection()


class PostgresFactory(ConnectionFactory):
    def create_read(self): return PostgresReadConnection()
    def create_write(self): return PostgresWriteConnection()


# ---------- Builder for the pool configuration ----------
class PoolConfig:
    def __init__(self, factory, max_read, max_write, timeout):
        self.factory = factory
        self.max_read = max_read
        self.max_write = max_write
        self.timeout = timeout


class PoolConfigBuilder:
    def __init__(self):
        self._factory = None
        self._max_read = 10
        self._max_write = 5
        self._timeout = 30

    def backend(self, factory: ConnectionFactory): self._factory = factory; return self
    def max_read(self, n): self._max_read = n; return self
    def max_write(self, n): self._max_write = n; return self
    def timeout(self, s): self._timeout = s; return self

    def build(self) -> PoolConfig:
        if self._factory is None:
            raise ValueError("backend factory is required")
        if self._max_write > self._max_read:
            raise ValueError("max_write must not exceed max_read")
        return PoolConfig(self._factory, self._max_read, self._max_write, self._timeout)


# ---------- Singleton pool, with a Factory Method for role selection ----------
class SingletonMeta(type):
    _instances = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class ConnectionPool(metaclass=SingletonMeta):
    def __init__(self, config: PoolConfig):
        self._config = config

    def get_connection(self, role: str) -> Connection:
        """Factory Method in its parameterised form: the role selects which
        concrete connection is produced, and the caller never names a class."""
        creators = {
            "read": self._config.factory.create_read,
            "write": self._config.factory.create_write,
        }
        if role not in creators:
            raise ValueError(f"Unknown role: {role}")
        return creators[role]()


# ---------- Composition root ----------
config = (PoolConfigBuilder()
          .backend(PostgresFactory())
          .max_read(20)
          .max_write(5)
          .timeout(15)
          .build())

pool = ConnectionPool(config)
assert ConnectionPool(config) is pool          # singleton guarantee

pool.get_connection("read").execute("SELECT * FROM orders")
pool.get_connection("write").execute("INSERT INTO orders VALUES (...)")
```

| Role in the design | Pattern | Justification |
|---|---|---|
| `ConnectionPool` | Singleton | The pool enforces a bound on concurrent connections; a second pool would defeat that bound |
| `get_connection(role)` | Factory Method, parameterised form | The concrete connection class depends on a runtime value, and callers must not name concrete classes |
| `ConnectionFactory` and its subclasses | Abstract Factory | Read and write connections must belong to the same backend, and the factory makes mixing impossible |
| `PoolConfigBuilder` | Builder | The configuration has several optional fields and a cross-field rule relating `max_write` to `max_read` |

The composition root is the only location naming a concrete factory, so switching backends is a one-line change confined to that location.

---

## 14. Self-Assessment Questions

Attempt each question before consulting the answer.

<details>
<summary><b>Q1.</b> Why must the singleton constraint be enforced in <code>__new__</code> or in a metaclass rather than in <code>__init__</code>?</summary>

Because `__init__` receives an object that has already been allocated. `__new__` is the allocator, and returning an existing object from it means no allocation occurs. A metaclass `__call__` intercepts at a level above both, which additionally prevents `__init__` from re-running and resetting the instance's state.
</details>

<details>
<summary><b>Q2.</b> A singleton implemented by overriding <code>__new__</code> loses its state on every instantiation call. What is the defect?</summary>

Initialisation was placed in an unguarded `__init__`. Python calls `__init__` on whatever `__new__` returns, on every call, so the second `ClassName()` re-initialises the existing instance. The corrections are to place initialisation inside the `is None` branch of `__new__`, to guard `__init__` with a flag, or to use the metaclass implementation, which skips both methods after the first call.
</details>

<details>
<summary><b>Q3.</b> State the precise difference between Factory Method and Abstract Factory.</summary>

Factory Method produces one product and varies the concrete class through subclassing or a parameter. Abstract Factory produces a family of several related products and varies the entire family by substituting the factory object. The distinguishing question is whether the requirement is "which concrete X" or "which mutually compatible set of X, Y, and Z".
</details>

<details>
<summary><b>Q4.</b> Why is Abstract Factory described as open for extension in one dimension and closed in the other?</summary>

Adding a new family requires only new classes, because the abstract interfaces are unchanged. Adding a new product kind changes the Abstract Factory interface and therefore forces every existing Concrete Factory to implement the new operation. The pattern is therefore appropriate when the set of product kinds is stable and the set of families is expected to grow.
</details>

<details>
<summary><b>Q5.</b> Under what conditions is a Builder justified over a dataclass with keyword arguments?</summary>

When validation rules span multiple fields and must be enforced as a unit; when components are contributed incrementally by different collaborators; when the same construction sequence must produce more than one representation; when a fluent interface materially improves readability across many call sites; or when the product must be immutable but its construction is inherently multi-step. If none of these apply, a dataclass is the better design.
</details>

<details>
<summary><b>Q6.</b> Why does a builder's <code>build</code> method usually copy mutable components into the product?</summary>

Without the copy, the product holds a reference to a container the builder still owns. Reusing the builder for a second product would then mutate the first product's state. Copying at `build` time makes each product independent of the builder's subsequent use.
</details>

<details>
<summary><b>Q7.</b> Explain why shallow copying is unsafe for Prototype in most cases, and identify the case where it is correct.</summary>

A shallow copy binds the copy's attributes to the same objects the original's attributes refer to. Mutating any of those objects through either reference affects both, which produces defects far from their cause. Shallow copying is correct when the shared attributes are immutable, or when sharing is intended, for example a texture atlas or a read-only lookup table shared by every instance for memory reasons.
</details>

<details>
<summary><b>Q8.</b> What is the purpose of the <code>memo</code> argument in <code>__deepcopy__</code>?</summary>

It maps the identity of each object already copied to its copy. Passing it into nested `deepcopy` calls prevents infinite recursion on cyclic references, and preserves the sharing structure of the original graph: an object referenced from two places in the original is copied once and referenced from two places in the result.
</details>

<details>
<summary><b>Q9.</b> Distinguish a factory registry from a prototype registry.</summary>

A factory registry maps a key to a class and calls that class to produce an instance. A prototype registry maps a key to a configured instance and copies it. The prototype registry can distinguish variants that no class distinguishes, since the variation is in field values rather than in type, and its contents can be assembled from configuration at runtime.
</details>

<details>
<summary><b>Q10.</b> A codebase wraps every class in a factory. What is wrong with this, and what is the corrective question?</summary>

Factories are justified when the concrete class varies, when construction logic is complex, or when callers must be decoupled from concrete types. Where none of these hold, the factory adds a file to read and a step to trace while removing nothing. The corrective question before introducing any pattern is: what specific change to the requirements does this structure make cheaper, and is that change plausible?
</details>

<details>
<summary><b>Q11.</b> Why is Singleton considered to work against the dependency inversion principle?</summary>

A class that obtains the shared instance by calling the singleton's access point inside its own methods does not declare that dependency in its interface. The dependency is therefore invisible to readers and unsubstitutable by callers, which is the opposite of depending on an abstraction supplied from outside. Dependency injection restores the declaration by making the shared instance a constructor parameter.
</details>

<details>
<summary><b>Q12.</b> Identify the pattern for each description.</summary>

1. A class holding a reference to its own unique instance and controlling access to it: **Singleton**.
2. An object accumulating components across several calls and producing the finished object on a final call: **Builder**.
3. An interface with one creation operation per product kind, implemented once per family: **Abstract Factory**.
4. A method on a base class that subclasses override to determine which concrete class the base class's algorithm will use: **Factory Method**.
5. A configured instance copied to produce new objects rather than being reconstructed: **Prototype**.
</details>

---

The structural patterns, covered in Part 2, address a different question. Creational patterns govern how objects come into existence; structural patterns govern how existing objects are composed into larger assemblies, and include Adapter, Bridge, Composite, Decorator, Facade, Flyweight, and Proxy.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch. Explore more: https://codeverra.com*
