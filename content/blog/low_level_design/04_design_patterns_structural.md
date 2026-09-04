---
title: "Design Patterns, Part 2: Structural Patterns"
description: "Structural design patterns: how to combine classes and objects into larger structures that stay flexible and maintainable."

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
  image: "/images/LLD - 4.png"
  alt: "Structural Design Patterns"
  caption: "Design Patterns, Part 2: Structural Patterns"
  relative: true
  hidden: false
---

# Design Patterns — Part 2: Structural Patterns

> **Who this is for:** Anyone who has worked through the Creational patterns and is ready to learn how objects fit together — how to combine classes and objects into larger structures that stay flexible and maintainable.

---

## Table of Contents

1. [Structural Patterns — What and Why](#1-structural-patterns)
2. [Adapter](#2-adapter)
3. [Bridge](#3-bridge)
4. [Composite](#4-composite)
5. [Decorator](#5-decorator)
6. [Facade](#6-facade)
7. [Flyweight](#7-flyweight)
8. [Proxy](#8-proxy)
9. [Summary of Structural Patterns](#9-summary)
10. [Practice Exercises with Solutions](#10-practice-exercises)
11. [Self-Assessment Test](#11-self-assessment-test)

---

## 1. Structural Patterns

Creational patterns answered: *"how do we make objects flexibly?"*
Structural patterns answer: *"how do we combine objects into larger structures flexibly?"*

In any non-trivial system, you have many objects, and they have to fit together. Naively, you hardcode those connections — class A owns a class B which calls class C. Then C's interface changes, or you need to plug in an alternative D, or you need to wrap B with extra behavior. The tight connections resist change.

Structural patterns are recipes for **gluing objects together in flexible ways**:

- **Adapter** — lets incompatible interfaces work together.
- **Bridge** — decouples abstraction from implementation so they can vary independently.
- **Composite** — treats individual objects and groups of objects uniformly.
- **Decorator** — adds responsibilities to an object dynamically, without changing its class.
- **Facade** — provides a simplified interface to a complex subsystem.
- **Flyweight** — shares objects to support huge numbers of similar instances efficiently.
- **Proxy** — provides a placeholder or surrogate for another object.

Each one is a specific answer to a specific integration problem. Let's meet them.

---

## 2. Adapter

### The Pain

You're building an app. You have this interface that your existing code expects:

```python
class PaymentProcessor:
    def pay(self, amount): ...
```

A new requirement: integrate with a third-party payment library — say, **StripeAPI** — that your company just licensed. But StripeAPI has its own interface:

```python
class StripeAPI:
    def make_payment(self, cents): ...   # Takes cents, not rupees/dollars!
```

You can't modify `StripeAPI` (it's a third-party library). You can't easily change every caller of `PaymentProcessor.pay(amount)` either — that's your entire codebase. You need a **translator** between the two.

### Intent

> Convert the interface of a class into another interface clients expect. Adapter lets classes work together that couldn't otherwise because of incompatible interfaces.

### Analogy

The classic analogy: a **travel plug adapter**.

Your Indian laptop charger has round pins. The wall socket in the US has flat pins. Both work electrically — they just don't *fit*. A travel adapter sits in between: flat pins on one side (to fit the wall), round holes on the other (for your charger). Neither device changes; the adapter bridges the interface mismatch.

Adapter in software plays exactly the same role.

### Structure

- **Target** — the interface your client code expects (`PaymentProcessor`).
- **Adaptee** — the existing class with a different interface (`StripeAPI`).
- **Adapter** — a class that *implements* Target and *delegates* to Adaptee, translating as needed.

### Python Implementation

```python
# Target — what our code expects
class PaymentProcessor:
    def pay(self, amount_in_rupees):
        raise NotImplementedError


# Adaptee — third-party, can't modify
class StripeAPI:
    def make_payment(self, cents):
        print(f"Stripe charged {cents} cents")


# Adapter — bridges the two
class StripeAdapter(PaymentProcessor):
    def __init__(self, stripe_api: StripeAPI):
        self.stripe_api = stripe_api

    def pay(self, amount_in_rupees):
        # Translate rupees → cents (hypothetical: ₹1 = 100 paise-equivalent)
        cents = int(amount_in_rupees * 100)
        self.stripe_api.make_payment(cents)


# Client code — only knows about PaymentProcessor
def checkout(processor: PaymentProcessor, amount):
    processor.pay(amount)


stripe = StripeAPI()
adapter = StripeAdapter(stripe)
checkout(adapter, 500)   # Stripe charged 50000 cents
```

The client (`checkout`) remains oblivious to Stripe. Tomorrow, if a new vendor arrives with their own quirky API, you write a new adapter — the rest of the code stays untouched.

### A Subtle Variant — Object Adapter vs Class Adapter

- **Object Adapter** (shown above) — the adapter *holds* the adaptee as a field, delegating via composition. Preferred.
- **Class Adapter** — the adapter *inherits* from both Target and Adaptee, wiring them through multiple inheritance. Less flexible; only works in languages/situations that support multiple inheritance.

In Python, Object Adapter is almost always the right choice.

### Realistic Use Cases

- Integrating third-party libraries that don't match your domain's vocabulary.
- Wrapping legacy code so new code can consume it cleanly.
- Testing — wrapping a complex dependency behind a simple adapter you control.
- Bridging sync and async APIs (a classic modern use).

### Tradeoffs

**Pros:**
- Lets you keep using third-party code without distorting your own design.
- Isolates translation logic in one place.
- Respects OCP — you can plug in new vendors behind new adapters.

**Cons:**
- Adds a layer of indirection.
- If you need to adapt *many* methods with lots of translation, the adapter itself becomes complex.

### Related Patterns

- **Facade** — also simplifies an interface but typically wraps an entire *subsystem*, not translate a single class's interface.
- **Decorator** — adds responsibilities while *preserving* interface. Adapter *changes* interface.
- **Bridge** — intentionally designed upfront; Adapter is retrofit.

---

## 3. Bridge

### The Pain

Suppose you're designing a UI framework with `Shape` types (`Circle`, `Square`) and multiple rendering backends (`RasterRenderer`, `VectorRenderer`). Naively:

```python
class RasterCircle: ...
class VectorCircle: ...
class RasterSquare: ...
class VectorSquare: ...
```

Already 4 classes. Add `Triangle` → 6 classes. Add a third renderer → 9 classes. This is a **combinatorial explosion**. Every new shape OR renderer multiplies your class count.

The root cause: you've merged two *independent* axes of variation (shape × renderer) into a single class hierarchy.

### Intent

> Decouple an abstraction from its implementation so that the two can vary independently.

The idea: *separate the two axes*. Shapes on one side, renderers on the other, connected via a reference ("bridge").

### Analogy

Think of **TV remotes and TVs**. You have different remotes (basic, smart, universal) and different TV models (LG, Sony, Samsung). You don't build 3 × 3 = 9 specific remote-TV products. You build remotes that speak a common protocol (IR signals), and TVs that understand that protocol. Any remote can pair with any TV.

Or: **drivers and cars**. A driver (abstraction) operates any car (implementation). You don't design a "Honda-driver" separately from a "Toyota-driver" — the *driving* behavior is one axis, *the car* is another axis.

### Structure

- **Abstraction** — the high-level layer (e.g., `Shape`).
- **Refined Abstraction** — subclasses of Abstraction (`Circle`, `Square`).
- **Implementor** — the interface for the low-level layer (`Renderer`).
- **Concrete Implementors** — implementations of Implementor (`RasterRenderer`, `VectorRenderer`).
- **Bridge** — the Abstraction holds a reference to an Implementor, delegating low-level work to it.

### Python Implementation

```python
from abc import ABC, abstractmethod

# Implementor
class Renderer(ABC):
    @abstractmethod
    def render_circle(self, radius): pass
    @abstractmethod
    def render_square(self, side): pass


# Concrete Implementors
class RasterRenderer(Renderer):
    def render_circle(self, radius):
        print(f"Drawing circle of radius {radius} pixel-by-pixel")
    def render_square(self, side):
        print(f"Drawing square of side {side} pixel-by-pixel")


class VectorRenderer(Renderer):
    def render_circle(self, radius):
        print(f"Drawing vector circle radius={radius}")
    def render_square(self, side):
        print(f"Drawing vector square side={side}")


# Abstraction (holds a bridge to Implementor)
class Shape(ABC):
    def __init__(self, renderer: Renderer):
        # THIS is the "bridge": instead of Shape inheriting rendering behavior
        # (which would force one subclass per shape×renderer combination), Shape
        # *holds a reference* to a Renderer via composition. The two hierarchies
        # — what to draw (Shape) and how to draw it (Renderer) — now vary
        # independently and are connected only by this single attribute.
        self.renderer = renderer
    @abstractmethod
    def draw(self): pass


# Refined Abstractions
class Circle(Shape):
    def __init__(self, renderer, radius):
        super().__init__(renderer)
        self.radius = radius
    def draw(self):
        # Circle knows WHAT it is (a circle of some radius) but delegates HOW to
        # render across the bridge. It never asks whether the renderer is raster
        # or vector — that's the decoupling the Bridge buys us.
        self.renderer.render_circle(self.radius)


class Square(Shape):
    def __init__(self, renderer, side):
        super().__init__(renderer)
        self.side = side
    def draw(self):
        self.renderer.render_square(self.side)


# Client code — mix and match freely
raster = RasterRenderer()
vector = VectorRenderer()

Circle(raster, 5).draw()   # Drawing circle of radius 5 pixel-by-pixel
Circle(vector, 5).draw()   # Drawing vector circle radius=5
Square(vector, 3).draw()   # Drawing vector square side=3
```

Now:
- Adding `Triangle` → one new class in the Abstraction hierarchy.
- Adding a new renderer (`SVGRenderer`) → one new class in the Implementor hierarchy.
- **No combinatorial explosion.** Any shape can pair with any renderer.

To see why this matters concretely: with inheritance you'd need a class per combination — `RasterCircle`, `VectorCircle`, `RasterSquare`, `VectorSquare`… that's N shapes × M renderers = **N×M** classes, and adding one renderer means adding N new classes. With the Bridge, you have N shape classes *plus* M renderer classes = **N+M**, and adding a renderer costs exactly one class. Five shapes and four renderers is 20 classes the naive way versus 9 with the Bridge — and the gap widens fast.

### Adapter vs Bridge — A Common Confusion

They look structurally similar but serve different purposes:

| Adapter | Bridge |
|---|---|
| **Retrofit**: makes two incompatible interfaces work together after the fact | **Upfront design**: lets two independent hierarchies evolve separately |
| Usually between third-party code and your code | Usually within your own design |
| Fixes a mismatch | Prevents combinatorial explosion |

You reach for Adapter because you're forced to. You reach for Bridge because you planned ahead.

### Realistic Use Cases

- **Cross-platform abstractions** — e.g., a `Window` abstraction with `WindowsImpl` / `MacImpl` / `LinuxImpl` implementations.
- **Rendering engines** that support multiple backends (as shown).
- **Database-agnostic ORMs** — a query abstraction that can delegate to different SQL dialects.
- **Notification systems** where messages (sms, email, push) are the abstraction and channels (Twilio, SendGrid) are the implementors.

### Tradeoffs

**Pros:**
- Prevents combinatorial class explosion.
- Abstraction and Implementation evolve independently — different teams can own each axis.
- Supports OCP on *both* axes.

**Cons:**
- Upfront complexity — two hierarchies and wiring between them.
- Overkill if you really only have one implementation, or only one abstraction.

### Related Patterns

- **Adapter** — similar structure, different intent (retrofit vs upfront).
- **Strategy** — also delegates work to an injected object, but Strategy is about *swappable algorithms*, Bridge about *separating abstraction from implementation hierarchies*.

---

## 4. Composite

### The Pain

Consider building a **file system**. You have `Files` (leaf nodes, contain data) and `Directories` (can contain Files *and* other Directories). You want to compute the total size of a thing — whether it's a single File or a whole Directory tree.

Naively:

```python
def total_size(thing):
    if isinstance(thing, File):
        return thing.size
    elif isinstance(thing, Directory):
        total = 0
        for child in thing.children:
            if isinstance(child, File):
                total += child.size
            elif isinstance(child, Directory):
                total += total_size(child)   # Recurse
        return total
```

The `isinstance` checks sprawl everywhere. Adding `Symlink` means updating every such function. The structure's recursion logic is tangled with its type logic.

### Intent

> Compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.

The word "uniformly" is the key. A client can call `.size()` on *anything* — a leaf or a branch — and get the right answer, without caring which it is.

### Analogy

Think of a **folder on your computer**. You right-click → Properties. It tells you "Size: 2.4 GB." Whether that folder contains 3 files or 3,000 files in 50 subfolders, *you asked one thing and got one answer*. You don't manually sum up file sizes.

Or: an **organization chart**. "How many people report to the CTO?" You want a single number. The CTO might have direct reports who are managers, and those managers have their own reports, etc. You don't build different logic per layer — you ask every node, "how many under you?" and sum up.

### Structure

- **Component** — common interface for both leaves and composites (defines `.size()`, `.list()`, or whatever the common operation is).
- **Leaf** — the individual items (e.g., `File`).
- **Composite** — contains children (Leaves or other Composites) and implements the operation by delegating to children.

### Python Implementation

```python
from abc import ABC, abstractmethod

# Component
class FileSystemNode(ABC):
    @abstractmethod
    def size(self) -> int: pass
    @abstractmethod
    def show(self, indent=0): pass


# Leaf
class File(FileSystemNode):
    def __init__(self, name, size):
        self.name = name
        self._size = size

    def size(self):
        # A File is a LEAF: it knows its own size directly. This is the base
        # case that stops the recursion — no children to descend into.
        return self._size

    def show(self, indent=0):
        print(" " * indent + f"- {self.name} ({self._size} bytes)")


# Composite
class Directory(FileSystemNode):
    def __init__(self, name):
        self.name = name
        self.children = []

    def add(self, child: FileSystemNode):
        # `child` is typed as FileSystemNode, so a Directory can hold Files AND
        # other Directories interchangeably — that uniformity is the pattern.
        self.children.append(child)
        return self   # chainable

    def size(self):
        # The heart of Composite. Directory doesn't check whether each child is
        # a File or a Directory — it just calls child.size(). Polymorphism
        # routes that call to File.size() (returns a number, recursion stops) or
        # to another Directory.size() (which sums ITS children, recursing
        # deeper). One line handles a tree of arbitrary depth because both node
        # types honor the same FileSystemNode.size() contract.
        return sum(c.size() for c in self.children)

    def show(self, indent=0):
        print(" " * indent + f"[DIR] {self.name}/")
        for c in self.children:
            c.show(indent + 2)


# Client code — treats everything uniformly
root = (Directory("root")
        .add(File("readme.txt", 100))
        .add(Directory("src")
             .add(File("main.py", 500))
             .add(File("utils.py", 300)))
        .add(Directory("docs")
             .add(File("guide.md", 1000))))

root.show()
print(f"Total size: {root.size()} bytes")
```

Output:
```
[DIR] root/
  - readme.txt (100 bytes)
  [DIR] src/
    - main.py (500 bytes)
    - utils.py (300 bytes)
  [DIR] docs/
    - guide.md (1000 bytes)
Total size: 1900 bytes
```

Notice: `root.size()` recursively works through the whole tree. No `isinstance`, no branching. Each node knows how to compute its own size, and Directory simply sums its children's results.

### Realistic Use Cases

- **File systems.**
- **UI component trees** — a `Panel` contains `Buttons` and other `Panels`. `render()` recurses naturally.
- **Menus with submenus** — every menu item has a `click()` or `render()` that works uniformly.
- **Organization/team hierarchies** — query "total headcount" at any level.
- **Parsed expression trees** (`2 + (3 * 4)`) — leaves are numbers, composites are operators.
- **Bill-of-materials** — a product made of sub-products made of parts; `total_cost()` recursively.

### Tradeoffs

**Pros:**
- Uniform treatment of leaves and composites — simplifies client code enormously.
- New leaf or composite types plug in cleanly (OCP).
- Recursion becomes natural and encapsulated.

**Cons:**
- Common interface may have to include operations irrelevant to some types (e.g., `.add(child)` on a `File` — throws, returns nothing, or is absent by design — tension with LSP/ISP).
- Can make the design "too permissive" — it's harder to constrain what kinds of things can go where.

### Related Patterns

- **Decorator** — also has a recursive structure (decorator wrapping decorator), but its intent is adding *responsibilities*, not representing *part-whole* relationships.
- **Iterator** — often combined with Composite to traverse the tree.
- **Visitor** — used to add new operations to a Composite structure without modifying the node classes.

---

## 5. Decorator

### The Pain

You have a `Coffee` class. Price: ₹100. Now marketing wants to sell coffee with milk (+₹20), coffee with sugar (+₹10), coffee with milk and sugar, coffee with milk and chocolate, coffee with cream and cinnamon and...

The combinatorics are brutal. You could try inheritance:

```python
class Coffee: ...
class CoffeeWithMilk(Coffee): ...
class CoffeeWithSugar(Coffee): ...
class CoffeeWithMilkAndSugar(Coffee): ...
```

Five add-ons = 2^5 = 32 subclasses. This is insane.

Alternatively, you could add every possible flag to one class:

```python
class Coffee:
    def __init__(self, milk=False, sugar=False, chocolate=False, ...): ...
```

Works but becomes a god class; adding a new add-on means modifying `Coffee` itself (OCP violation).

You need a way to **compose responsibilities dynamically at runtime**.

### Intent

> Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

### Analogy

Think of **wrapping a gift**. You have a present (the core object). You wrap it in one paper (one decorator). Then put it in a bag (another decorator). Then attach a bow (another decorator). Each layer adds something (appearance, cost, complexity) but the underlying gift is unchanged. And you can unwrap, rewrap, rearrange freely.

Or: **putting toppings on a pizza**. You start with a plain base. Add cheese. Add olives. Add mushrooms. Each topping is a wrapper; you can combine them in any order.

### Structure

- **Component** — the common interface (e.g., `Beverage` with `cost()`).
- **ConcreteComponent** — the core object (`Coffee`).
- **Decorator** — a class that implements Component AND holds a reference to another Component. It forwards requests and adds behavior before/after.
- **ConcreteDecorators** — specific decorators (`MilkDecorator`, `SugarDecorator`).

### Python Implementation — Classical Approach

```python
from abc import ABC, abstractmethod

# Component
class Beverage(ABC):
    @abstractmethod
    def cost(self): pass
    @abstractmethod
    def description(self): pass


# ConcreteComponent
class Coffee(Beverage):
    def cost(self): return 100
    def description(self): return "Coffee"


# Decorator base
class BeverageDecorator(Beverage):
    def __init__(self, wrapped: Beverage):
        self.wrapped = wrapped


# Concrete Decorators
class Milk(BeverageDecorator):
    def cost(self): return self.wrapped.cost() + 20
    def description(self): return self.wrapped.description() + ", milk"


class Sugar(BeverageDecorator):
    def cost(self): return self.wrapped.cost() + 10
    def description(self): return self.wrapped.description() + ", sugar"


class Chocolate(BeverageDecorator):
    def cost(self): return self.wrapped.cost() + 30
    def description(self): return self.wrapped.description() + ", chocolate"


# Usage — compose at runtime
order = Chocolate(Milk(Sugar(Coffee())))
print(order.description())  # Coffee, sugar, milk, chocolate
print(order.cost())         # 100 + 10 + 20 + 30 = 160

# How cost() cascades: you call cost() on the OUTERMOST wrapper first, but each
# decorator must ask its inner object before it can add its own price. So the
# call travels INWARD to the core, then accumulates on the way back OUT:
#   Chocolate.cost()
#     -> Milk.cost()
#         -> Sugar.cost()
#             -> Coffee.cost() = 100      (innermost: the real base)
#         -> 100 + 10 = 110               (Sugar adds on the way back)
#     -> 110 + 20 = 130                   (Milk adds)
#   -> 130 + 30 = 160                     (Chocolate adds last)
```

Each decorator wraps its subordinate, adds its bit to `cost()` and `description()`, and forwards to the inner object. The composition is built fresh at runtime — different orders produce different chains.

Adding a new add-on (say, `Cinnamon`) requires one new class and zero changes anywhere else.

### Python-Native Decorators

Python has `@decorator` syntax for decorating *functions and methods* — conceptually related to this pattern, but not identical. The pattern applies to objects (wrapping instances); Python's `@decorator` applies to functions.

```python
def with_logging(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Done {func.__name__}")
        return result
    return wrapper

@with_logging
def greet(name): print(f"Hello {name}")

greet("Amit")
# Calling greet
# Hello Amit
# Done greet
```

Same *idea* — wrapping to add behavior — applied at the function level.

### Realistic Use Cases

- **I/O streams** — Java's `InputStream` → `BufferedInputStream` → `GzipInputStream` → `CipherInputStream` is textbook Decorator.
- **Middleware in web frameworks** — a request is wrapped by authentication, logging, caching middlewares. Each is a decorator.
- **UI widgets** — a `TextView` decorated with `ScrollableDecorator`, `BorderDecorator`, etc.
- **Permissions / access control layers** — a `PaymentService` wrapped by `AuditedPaymentService`, which wraps `FraudCheckingPaymentService`.
- **Feature toggles** — wrap a service with a decorator that applies behavior only when a flag is on.

### Tradeoffs

**Pros:**
- Dynamic, composable responsibilities at runtime.
- Far better than subclass explosion.
- Strongly OCP — new decorators add functionality without touching existing code.
- Single Responsibility — each decorator does one thing well.

**Cons:**
- Debugging a long chain can be confusing ("who added this cost?").
- Many small decorator classes can fragment logic.
- Order can matter and be tricky — `Milk(Chocolate(Coffee()))` vs `Chocolate(Milk(Coffee()))` may differ subtly in some designs.

### Related Patterns

- **Composite** — also has wrapping structure, but Composite is part-whole, Decorator is adding responsibilities.
- **Strategy** — swaps algorithms; Decorator stacks behaviors.
- **Chain of Responsibility** — also involves a chain of objects, but each CoR link may stop the chain; decorators always pass through.

---

## 6. Facade

### The Pain

You're integrating a home theater system. To watch a movie, you have to:

```python
projector.turn_on()
projector.set_input("hdmi-2")
screen.lower()
amplifier.turn_on()
amplifier.set_volume(25)
amplifier.set_source("dvd")
dvd_player.turn_on()
dvd_player.play("Interstellar")
lights.dim(10)
```

Nine lines of intricate coordination just to watch a movie. Every time. Every caller. And if the vendor updates one device, every caller has to update their 9-line dance.

What you want is a button: "Watch Movie." A single entry point.

### Intent

> Provide a unified, simplified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.

### Analogy

A **hotel concierge**. Instead of you calling the kitchen, the transport desk, the ticket office, and housekeeping separately, you call the concierge. They coordinate behind the scenes. You say "please arrange a dinner and movie tickets"; they handle it.

Or: **car ignition**. You turn one key. Behind the scenes: starter motor, fuel pump, ignition coil, ECU, alternator — a whole orchestra. You only see the key.

### Structure

- **Subsystem classes** — the existing, complex set of classes.
- **Facade** — a new class that exposes a small, convenient API and orchestrates the subsystem internally.

### Python Implementation

```python
# Subsystem classes — complex but unchanged
class Projector:
    def turn_on(self): print("Projector ON")
    def set_input(self, src): print(f"Projector input: {src}")

class Screen:
    def lower(self): print("Screen lowered")
    def raise_(self): print("Screen raised")

class Amplifier:
    def turn_on(self): print("Amp ON")
    def set_volume(self, v): print(f"Volume: {v}")
    def set_source(self, src): print(f"Amp source: {src}")

class DVDPlayer:
    def turn_on(self): print("DVD ON")
    def play(self, movie): print(f"Playing '{movie}'")
    def stop(self): print("DVD stopped")

class Lights:
    def dim(self, pct): print(f"Lights at {pct}%")
    def on(self): print("Lights ON")


# Facade
class HomeTheater:
    def __init__(self):
        self.projector = Projector()
        self.screen = Screen()
        self.amp = Amplifier()
        self.dvd = DVDPlayer()
        self.lights = Lights()

    def watch_movie(self, movie):
        self.lights.dim(10)
        self.screen.lower()
        self.projector.turn_on()
        self.projector.set_input("hdmi-2")
        self.amp.turn_on()
        self.amp.set_source("dvd")
        self.amp.set_volume(25)
        self.dvd.turn_on()
        self.dvd.play(movie)

    def end_movie(self):
        self.dvd.stop()
        self.screen.raise_()
        self.lights.on()


# Client code — beautifully simple
theater = HomeTheater()
theater.watch_movie("Interstellar")
# ...
theater.end_movie()
```

The client's nine-line ritual has become `theater.watch_movie(...)`. The facade owns the complexity.

### Facade Is Not About Hiding — It's About *Convenience*

A subtle point: the subsystem classes are still accessible. A power user can still do `theater.amp.set_volume(40)` if they need low-level control. Facade isn't a restriction; it's a convenience layer.

### Realistic Use Cases

- **SDKs / libraries** — a library's top-level API is usually a Facade over its internal modules.
- **Microservice clients** — a `UserServiceClient` Facade hiding HTTP requests, retries, auth, serialization.
- **Compiler toolchains** — `compile_file(path)` hides lexing + parsing + codegen + linking.
- **Frameworks** — Flask's `Flask()` hides request parsing, routing, response generation.
- **Database ORMs** — `session.query(User).filter(...).all()` is a facade over SQL + connection management.

### Facade vs Adapter vs Mediator

| Facade | Adapter | Mediator |
|---|---|---|
| Simplify a *subsystem* | Translate one class's *interface* | Coordinate *communication between peers* |
| New, convenient API | Matches an existing expected API | Centralizes otherwise tangled peer-to-peer links |

### Tradeoffs

**Pros:**
- Massive simplification for common operations.
- Decouples callers from subsystem internals.
- The subsystem can evolve freely as long as the facade's API stays stable.

**Cons:**
- Risk of "god facade" — it grows to wrap too much, becoming a dumping ground.
- May hide useful complexity (users might need finer control than the facade exposes).

### Related Patterns

- **Abstract Factory** — often used inside a facade to create subsystem objects.
- **Singleton** — a facade is often a singleton, since one per application usually suffices.

---

## 7. Flyweight

### The Pain

You're building a **text editor**. Each character on screen is an object with font, size, color, position. A 100,000-character document = 100,000 character objects. Each one stores its own font metadata. Memory balloons. Performance dies.

But notice: *most* of those characters share the exact same font data. There's no reason each `A` needs its own copy of "Arial, 12pt, black." The variable parts are the *position* and *specific character*. The invariant parts (font properties) can be shared.

You need a way to share the bulk of data across many objects.

### Intent

> Use sharing to support large numbers of fine-grained objects efficiently.

### Analogy

Think of a **library**. Thousands of readers want to read *Harry Potter*. The library doesn't create a new book for every reader — there's one book that many readers access (perhaps reserving it in turn). The book's content is the shared state; each reader has their own bookmark (their own position).

Or: **playing cards**. In 100 games, the rules of the game (shared) don't change; only the specific sequence of cards dealt (extrinsic, per-game). You don't ship a new rulebook per game.

### Intrinsic vs Extrinsic State — The Key Distinction

The Flyweight pattern splits object state into two parts:

- **Intrinsic state** — shared, immutable, context-independent. (Font "Arial, 12pt, black".)
- **Extrinsic state** — unique per use, passed in from outside when needed. (Position, specific character.)

The intrinsic state lives inside a Flyweight object (shared among many contexts). The extrinsic state is *not stored* — it's passed in as arguments when operations are called.

### Structure

- **Flyweight** — object that stores intrinsic state and accepts extrinsic state as parameters.
- **Flyweight Factory** — caches flyweights; returns existing ones when possible, creates new ones otherwise.
- **Client** — holds extrinsic state and asks the factory for flyweights.

### Python Implementation

```python
class TreeType:
    """Flyweight — shared across many trees in a forest."""
    def __init__(self, name, color, texture):
        # INTRINSIC state: identical for every tree of this species, so it's
        # stored ONCE here and shared. This is the heavy data we refuse to
        # duplicate millions of times — that's the entire point of the pattern.
        self.name = name
        self.color = color
        self.texture = texture   # Imagine this is 5 MB of image data

    def render(self, x, y):
        # x, y are EXTRINSIC — they differ per tree, so they're NOT stored on
        # the flyweight. The caller passes them in at render time instead.
        print(f"Rendering {self.name} ({self.color}) at ({x}, {y})")


class TreeTypeFactory:
    _types = {}

    @classmethod
    def get_tree_type(cls, name, color, texture):
        key = (name, color, texture)
        if key not in cls._types:
            cls._types[key] = TreeType(name, color, texture)
        return cls._types[key]


class Tree:
    """Context — holds extrinsic state (position) + reference to flyweight."""
    def __init__(self, x, y, tree_type: TreeType):
        # EXTRINSIC state: unique to THIS tree, so it lives here in the context.
        self.x = x
        self.y = y
        # A reference (not a copy) to the shared flyweight. A thousand oaks all
        # point at the SAME TreeType object — only x/y differ between them.
        self.type = tree_type

    def render(self):
        # Recombine the two halves: pass our extrinsic position into the shared
        # flyweight, which supplies the intrinsic appearance.
        self.type.render(self.x, self.y)


class Forest:
    def __init__(self):
        self.trees = []

    def plant_tree(self, x, y, name, color, texture):
        tree_type = TreeTypeFactory.get_tree_type(name, color, texture)
        self.trees.append(Tree(x, y, tree_type))

    def render(self):
        for t in self.trees:
            t.render()


forest = Forest()
for i in range(1_000_000):
    forest.plant_tree(i, i, "Oak", "green", "oak_texture.png")
for i in range(1_000_000):
    forest.plant_tree(i, -i, "Pine", "dark green", "pine_texture.png")

# Millions of trees, but only TWO TreeType objects in memory
print(len(TreeTypeFactory._types))   # 2
```

Two tree types in memory serve two million trees. The heavy texture data is shared. Positions are stored per-tree because they vary.

### Realistic Use Cases

- **Game engines** — particle systems, vegetation, enemy units (thousands of sprites sharing textures).
- **Text editors** — characters sharing font data.
- **Chess/Go engines** — many pieces sharing piece-type data.
- **Icons in file explorers** — one icon object per file type, shared across all files.
- **String interning** — Python itself uses flyweight for short strings and small integers internally.

### Python's Built-in Flyweight-Like Optimizations

Python interns small integers and some strings automatically:

```python
a = 5
b = 5
print(a is b)   # True — same object, shared

x = "hello"
y = "hello"
print(x is y)   # Often True in CPython due to string interning
```

This is the Flyweight idea applied by the runtime.

### Tradeoffs

**Pros:**
- Massive memory savings for very large numbers of similar objects.
- Enables rendering/processing that would otherwise OOM.

**Cons:**
- Complicates the design — splitting intrinsic vs extrinsic state requires care.
- Flyweights must be **immutable** (or carefully thread-safe), else shared state becomes a bug.
- Passing extrinsic state everywhere can be cumbersome.
- Premature optimization for small datasets — adds complexity without payoff.

Only apply when you have genuine scale (thousands+ of similar objects) and memory pressure. For hundreds of objects, don't bother.

### Related Patterns

- **Singleton** — also about sharing, but Singleton = "exactly one"; Flyweight = "share many instances that happen to be identical."
- **Factory** — Flyweight Factory is a specific factory design.
- **Composite** — often Flyweights are leaves in Composite structures (like characters in a document tree).

---

## 8. Proxy

### The Pain

You have an `Image` class that loads a large file from disk and renders it. In your UI, you may create 50 image references but most are off-screen — the user scrolls past them. Loading all 50 eagerly wastes memory and time.

Or: you have a `RemoteService` class that calls a slow network API. You'd like to cache results, or check permissions, or log calls — without bloating `RemoteService` itself.

You need something that *looks like* the real object to the client but *interposes* extra logic before (or instead of) delegating to the real object.

### Intent

> Provide a surrogate or placeholder for another object to control access to it.

### Analogy

A **debit card** is a proxy for your bank account. You hand it to the shopkeeper. They treat it like cash. Behind the scenes: the card communicates with the bank, checks your balance (access control), logs the transaction (logging), maybe converts currency (virtual work). Your account isn't directly accessed, but the final effect is the same.

Or: a **receptionist**. You want to see the CEO. The receptionist is the proxy — filters unauthorized visitors, schedules meetings, sometimes answers simple questions without bothering the CEO.

### Types of Proxy

The classical pattern has several flavors:

1. **Virtual Proxy** — defers expensive object creation until actually needed (lazy loading).
2. **Protection Proxy** — enforces access control.
3. **Remote Proxy** — represents an object in a different address space (e.g., on another server).
4. **Logging/Smart Proxy** — adds housekeeping like logging, caching, reference counting.

### Structure

- **Subject** — the common interface the proxy and real object share.
- **RealSubject** — the actual object.
- **Proxy** — same interface as RealSubject; holds reference to RealSubject; adds pre/post logic.

### Python Implementation — Virtual Proxy (Lazy Loading)

```python
from abc import ABC, abstractmethod

class Image(ABC):
    @abstractmethod
    def display(self): pass


class RealImage(Image):
    def __init__(self, filename):
        self.filename = filename
        self._load_from_disk()

    def _load_from_disk(self):
        print(f"Loading {self.filename} from disk... (expensive)")

    def display(self):
        print(f"Displaying {self.filename}")


class ImageProxy(Image):
    def __init__(self, filename):
        self.filename = filename
        self._real_image = None   # Not loaded yet

    def display(self):
        if self._real_image is None:
            self._real_image = RealImage(self.filename)   # Lazy load
        self._real_image.display()


# Usage
img = ImageProxy("giant_photo.jpg")   # Cheap — no disk I/O yet
print("Proxy created; nothing loaded")
img.display()   # NOW loads from disk
img.display()   # Uses cached RealImage — no reload
```

### Python Implementation — Protection Proxy

```python
class Document:
    def __init__(self, content):
        self.content = content

    def read(self):
        return self.content

    def write(self, content):
        self.content = content


class ProtectedDocument:
    def __init__(self, document: Document, user_role: str):
        self._doc = document
        self._role = user_role

    def read(self):
        return self._doc.read()

    def write(self, content):
        if self._role != "admin":
            raise PermissionError("Only admins can write")
        self._doc.write(content)


doc = Document("Sensitive data")
admin_view = ProtectedDocument(doc, "admin")
guest_view = ProtectedDocument(doc, "guest")

print(guest_view.read())    # OK
admin_view.write("Updated")  # OK
# guest_view.write("Hack")   # PermissionError!
```

### Python Implementation — Logging Proxy

```python
class LoggingProxy:
    def __init__(self, wrapped):
        self._wrapped = wrapped

    def __getattr__(self, name):
        """Forward any attribute/method access, with logging."""
        # __getattr__ is a Python fallback hook: it runs ONLY when normal
        # attribute lookup fails — i.e., when `name` isn't found on the proxy
        # instance or its class. Since LoggingProxy defines no add/multiply of
        # its own, EVERY call like calc.add lands here. That's what lets one
        # method intercept an unbounded set of calls without us listing them.
        # (Note: _wrapped IS found normally in __init__, so it never recurses
        # here — only the wrapped object's own methods fall through.)
        attr = getattr(self._wrapped, name)
        if callable(attr):
            # If the looked-up attribute is a method, we don't return it raw —
            # we return a wrapper closure that logs, calls through, logs again,
            # and passes the result back. The closure captures `name` and `attr`.
            def logged(*args, **kwargs):
                print(f"Calling {name}({args}, {kwargs})")
                result = attr(*args, **kwargs)
                print(f"{name} returned {result!r}")
                return result
            return logged
        return attr   # Plain (non-callable) attributes pass straight through


class Calculator:
    def add(self, a, b): return a + b
    def multiply(self, a, b): return a * b


calc = LoggingProxy(Calculator())
calc.add(2, 3)        # Logs call + result
calc.multiply(4, 5)   # Same
```

This is a **dynamic proxy** — Python's `__getattr__` makes it trivial to intercept *all* method calls without listing them manually. Very Pythonic. The mechanism is worth internalizing: `__getattr__(self, name)` is invoked by Python *only as a last resort*, when an attribute can't be found through the usual channels (the instance dict, then the class, then base classes). Because our proxy deliberately implements none of the wrapped object's methods, they all "miss" and route through `__getattr__`, where we forward them. Contrast this with `__getattribute__`, which intercepts *every* access (even ones that would succeed) and is far easier to break with infinite recursion — `__getattr__` is the safer, more idiomatic choice for a forwarding proxy.

### Realistic Use Cases

- **ORM lazy loading** — `user.orders` doesn't hit the DB until you actually iterate.
- **Remote object access** — client-side proxy for a server object (RPC frameworks use this pattern heavily).
- **Access control layers** — wrap a service with a permission-checking proxy.
- **Caching proxy** — wrap a slow service to cache responses.
- **Mock objects in tests** — test doubles are proxies that record calls or return fake responses.

### Proxy vs Decorator — Close Cousins

Both wrap an object with the same interface. The difference is *intent*:

- **Decorator** — adds *new responsibilities* (behavioral extension).
- **Proxy** — *controls access* to the subject (lazy, remote, protected, logged).

Structurally they're twins; philosophically they're cousins.

### Tradeoffs

**Pros:**
- Adds cross-cutting concerns (logging, caching, security) without bloating the real object.
- Enables lazy initialization of expensive objects.
- Respects SRP — the real object focuses on its job; the proxy focuses on control.

**Cons:**
- Adds indirection (may surprise users if proxy silently triggers loading).
- Multiple layered proxies can obscure behavior (which proxy caught this call?).
- Can complicate debugging (stack traces go through proxy layers).

### Related Patterns

- **Decorator** — same structure, different intent (extension vs control).
- **Adapter** — same structure, different intent (interface change).
- **Facade** — simplifies a *subsystem*, not a single object.

---

## 9. Summary

All seven structural patterns address the same underlying question: **how do we compose objects into flexible structures?** But each attacks a distinct problem:

| Pattern | Problem It Solves | Core Mechanism |
|---|---|---|
| **Adapter** | Interface mismatch between existing classes | Translate one interface to another |
| **Bridge** | Combinatorial explosion from two independent axes of variation | Separate abstraction from implementation; compose at runtime |
| **Composite** | Treating individual objects and trees of objects uniformly | Common interface for leaves and composites |
| **Decorator** | Adding responsibilities dynamically without subclass explosion | Wrap an object in layers, each adding behavior |
| **Facade** | Complex subsystem with many moving parts; clients want simple usage | A new class exposing a simple API, orchestrating the subsystem |
| **Flyweight** | Too many similar objects consuming too much memory | Share intrinsic state; pass extrinsic state as arguments |
| **Proxy** | Need to control access to an object (lazy, remote, secure, logged) | Same-interface wrapper that adds control logic |

### Decision Flow

1. **Are two components speaking different "languages"?** → Adapter.
2. **Am I staring at a class explosion from two independent axes?** → Bridge.
3. **Do I need to treat single objects and groups the same way?** → Composite.
4. **Do I want to compose optional behaviors flexibly at runtime?** → Decorator.
5. **Am I forcing clients to do complex orchestration of multiple classes?** → Facade.
6. **Do I have millions of similar objects eating memory?** → Flyweight.
7. **Do I want to control, defer, or monitor access to an object?** → Proxy.

### Key Takeaways

1. **Structural patterns are about *connecting* objects, not creating them.** They give you vocabulary for composition.
2. **Adapter, Decorator, and Proxy are structural twins with different intents.** Adapter changes interface; Decorator extends responsibilities; Proxy controls access. Learn to distinguish by *intent*, not structure.
3. **Composite and Decorator both use recursion.** Composite for part-whole; Decorator for wrapping.
4. **Facade is often the first pattern you reach for** — it's the simplest and addresses one of the most common pains (complex subsystems).
5. **Flyweight is niche** but crucial when you actually face it. Most systems don't need it; games and editors do.
6. **Bridge is preventive, Adapter is corrective.** If you're designing from scratch and see two independent axes of variation — use Bridge. If you're integrating legacy or third-party code — Adapter.
7. **Python often simplifies these patterns.** `__getattr__` for Proxy, duck typing for Adapter-lite, decorators (the syntax) relating to Decorator (the pattern), `@dataclass` for trivial data — all make Python implementations lighter than textbook versions.

---

## 10. Practice Exercises

### Exercise 1 — Adapter

You have an existing `TemperatureSensor` interface used throughout your code:

```python
class TemperatureSensor:
    def get_celsius(self) -> float: ...
```

A new third-party sensor library arrives with this interface (you cannot modify it):

```python
class ExternalFahrenheitSensor:
    def read_fahrenheit(self) -> float:
        return 98.6   # example
```

Write an adapter that lets you use `ExternalFahrenheitSensor` wherever `TemperatureSensor` is expected.

**Solution:**

```python
class FahrenheitSensorAdapter(TemperatureSensor):
    def __init__(self, external: ExternalFahrenheitSensor):
        self._external = external

    def get_celsius(self) -> float:
        f = self._external.read_fahrenheit()
        return (f - 32) * 5 / 9


def display_room_temp(sensor: TemperatureSensor):
    print(f"Room temperature: {sensor.get_celsius():.1f}°C")


external = ExternalFahrenheitSensor()
adapter = FahrenheitSensorAdapter(external)
display_room_temp(adapter)   # Works transparently
```

The rest of your codebase — any function expecting `TemperatureSensor` — works unchanged.

---

### Exercise 2 — Bridge

Design a `Message` abstraction that can be sent through different channels. Support these message types: `TextMessage`, `UrgentMessage`. Support these channels: `EmailChannel`, `SMSChannel`, `SlackChannel`. Show that any message × any channel combination works without creating N × M classes.

**Solution:**

```python
from abc import ABC, abstractmethod

# Implementor
class Channel(ABC):
    @abstractmethod
    def send(self, content: str): pass


# Concrete Implementors
class EmailChannel(Channel):
    def send(self, content): print(f"[Email] {content}")

class SMSChannel(Channel):
    def send(self, content): print(f"[SMS] {content}")

class SlackChannel(Channel):
    def send(self, content): print(f"[Slack] {content}")


# Abstraction
class Message(ABC):
    def __init__(self, channel: Channel):
        self.channel = channel

    @abstractmethod
    def send(self, text: str): pass


# Refined Abstractions
class TextMessage(Message):
    def send(self, text):
        self.channel.send(text)

class UrgentMessage(Message):
    def send(self, text):
        self.channel.send(f"🚨 URGENT: {text.upper()} 🚨")


# Mix and match
TextMessage(EmailChannel()).send("Hello there")
UrgentMessage(SMSChannel()).send("Server is down")
UrgentMessage(SlackChannel()).send("Page the oncall")
```

2 message types × 3 channels = 6 combinations, with only 5 classes in total (plus base abstractions). New channel or new message type = one new class each.

---

### Exercise 3 — Composite

Model a company's organizational hierarchy. An `Employee` has a name and salary. A `Manager` is an `Employee` who also manages other employees (or managers). Implement a `total_salary_cost()` method that works uniformly on any node.

**Solution:**

```python
from abc import ABC, abstractmethod

class OrgNode(ABC):
    @abstractmethod
    def total_salary_cost(self): pass
    @abstractmethod
    def describe(self, indent=0): pass


class Employee(OrgNode):
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def total_salary_cost(self):
        return self.salary

    def describe(self, indent=0):
        print(" " * indent + f"- {self.name}: {self.salary}")


class Manager(OrgNode):
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
        self.reports = []

    def add(self, node: OrgNode):
        self.reports.append(node)
        return self

    def total_salary_cost(self):
        return self.salary + sum(r.total_salary_cost() for r in self.reports)

    def describe(self, indent=0):
        print(" " * indent + f"[MGR] {self.name}: {self.salary}")
        for r in self.reports:
            r.describe(indent + 2)


# Build hierarchy
cto = (Manager("CTO", 500_000)
       .add(Manager("Eng Manager", 200_000)
            .add(Employee("Dev 1", 100_000))
            .add(Employee("Dev 2", 110_000)))
       .add(Manager("QA Manager", 180_000)
            .add(Employee("Tester 1", 80_000))))

cto.describe()
print(f"\nTotal salary cost under CTO: {cto.total_salary_cost()}")
```

Same `total_salary_cost()` call works for an individual employee or an entire subtree.

---

### Exercise 4 — Decorator

Design a `Notification` interface with a `send(msg)` method. Implement a base `EmailNotification`. Then add decorators: `WithLogging` (logs every send), `WithRetry` (retries up to 3 times on failure), `WithRateLimit` (adds delay between sends). Compose them.

**Solution:**

```python
import time
from abc import ABC, abstractmethod
import random


class Notification(ABC):
    @abstractmethod
    def send(self, msg): pass


class EmailNotification(Notification):
    def send(self, msg):
        # Simulate 30% chance of failure
        if random.random() < 0.3:
            raise RuntimeError("Network glitch")
        print(f"Email sent: {msg}")


class NotificationDecorator(Notification):
    def __init__(self, wrapped: Notification):
        self.wrapped = wrapped


class WithLogging(NotificationDecorator):
    def send(self, msg):
        print(f"[LOG] Sending: {msg}")
        try:
            self.wrapped.send(msg)
            print(f"[LOG] Sent successfully")
        except Exception as e:
            print(f"[LOG] Failed: {e}")
            raise


class WithRetry(NotificationDecorator):
    def __init__(self, wrapped, attempts=3):
        super().__init__(wrapped)
        self.attempts = attempts

    def send(self, msg):
        last_exc = None
        for i in range(self.attempts):
            try:
                self.wrapped.send(msg)
                return
            except Exception as e:
                print(f"[RETRY] Attempt {i+1} failed: {e}")
                last_exc = e
        raise last_exc


class WithRateLimit(NotificationDecorator):
    def __init__(self, wrapped, delay_sec=0.1):
        super().__init__(wrapped)
        self.delay = delay_sec

    def send(self, msg):
        time.sleep(self.delay)
        self.wrapped.send(msg)


# Compose
random.seed(7)
notifier = WithLogging(WithRetry(WithRateLimit(EmailNotification()), attempts=5))

notifier.send("Your order has shipped")
```

Each concern (logging, retry, rate-limiting) lives in its own class, can be stacked in any order, and none of them modify `EmailNotification`.

---

### Exercise 5 — Facade

You have a `VideoDownloader`, `VideoTranscoder`, `ThumbnailGenerator`, `S3Uploader`, and `CDNRegistrar`. A user uploading a video needs all five orchestrated in sequence. Write a `VideoUploadService` facade that exposes a single `upload(file_path, title)` method.

**Solution:**

```python
# Subsystem
class VideoDownloader:
    def download(self, path): print(f"Reading {path}"); return b"raw_video_bytes"

class VideoTranscoder:
    def transcode(self, raw): print("Transcoding to H.264..."); return b"transcoded"

class ThumbnailGenerator:
    def generate(self, video): print("Generating thumbnail..."); return b"thumbnail"

class S3Uploader:
    def upload(self, data, key):
        print(f"Uploading {key} to S3")
        return f"https://s3.example.com/{key}"

class CDNRegistrar:
    def register(self, url, title): print(f"Registered '{title}' → {url} on CDN")


# Facade
class VideoUploadService:
    def __init__(self):
        self.downloader = VideoDownloader()
        self.transcoder = VideoTranscoder()
        self.thumbnailer = ThumbnailGenerator()
        self.uploader = S3Uploader()
        self.cdn = CDNRegistrar()

    def upload(self, file_path, title):
        raw = self.downloader.download(file_path)
        transcoded = self.transcoder.transcode(raw)
        thumb = self.thumbnailer.generate(transcoded)

        video_url = self.uploader.upload(transcoded, f"videos/{title}.mp4")
        self.uploader.upload(thumb, f"thumbs/{title}.jpg")

        self.cdn.register(video_url, title)
        print(f"✓ Upload complete: {title}")


# Client
service = VideoUploadService()
service.upload("/tmp/my_video.mov", "my_first_video")
```

One-call API for callers; complexity absorbed by the facade.

---

### Exercise 6 — Flyweight

Model a **forest simulation**. You want to render 100,000 trees, but there are only 3 species (`Oak`, `Pine`, `Birch`), each with their own name, color, and texture (imagine heavy data). Position varies per tree. Implement Flyweight so that only 3 species objects live in memory regardless of tree count.

**Solution:** (builds on the TreeType example; this exercise asks the reader to extend it)

```python
class TreeSpecies:
    """Flyweight — heavy intrinsic state shared across many trees."""
    def __init__(self, name, color, texture_data):
        self.name = name
        self.color = color
        self.texture_data = texture_data   # Imagine 10 MB

    def render(self, x, y, height):
        print(f"Rendering {self.name} (h={height}) at ({x}, {y})")


class TreeSpeciesFactory:
    _cache = {}

    @classmethod
    def get(cls, name, color, texture_data):
        if name not in cls._cache:
            cls._cache[name] = TreeSpecies(name, color, texture_data)
        return cls._cache[name]

    @classmethod
    def count(cls):
        return len(cls._cache)


class Tree:
    def __init__(self, x, y, height, species: TreeSpecies):
        self.x = x
        self.y = y
        self.height = height
        self.species = species

    def render(self):
        self.species.render(self.x, self.y, self.height)


class Forest:
    def __init__(self):
        self.trees = []

    def plant(self, x, y, height, species_name, color, texture_data):
        species = TreeSpeciesFactory.get(species_name, color, texture_data)
        self.trees.append(Tree(x, y, height, species))


# Plant 100,000 trees
import random
random.seed(1)
species_defs = [
    ("Oak", "green", b"oak_texture"),
    ("Pine", "dark green", b"pine_texture"),
    ("Birch", "light yellow", b"birch_texture"),
]

forest = Forest()
for _ in range(100_000):
    name, color, tex = random.choice(species_defs)
    forest.plant(random.randint(0, 1000), random.randint(0, 1000),
                 random.randint(10, 50), name, color, tex)

print(f"Trees planted: {len(forest.trees)}")
print(f"Species objects in memory: {TreeSpeciesFactory.count()}")
# Trees planted: 100000
# Species objects in memory: 3
```

100,000 trees, 3 species objects. Memory stays flat.

---

### Exercise 7 — Proxy

Create a `RemoteUserAPI` with a `get_user(user_id)` method that (simulates) a 1-second network call. Write a `CachingProxy` that caches results for 10 seconds, and a `LoggingProxy` that logs each call. Stack them.

**Solution:**

```python
import time
from abc import ABC, abstractmethod

class UserAPI(ABC):
    @abstractmethod
    def get_user(self, user_id): pass


class RemoteUserAPI(UserAPI):
    def get_user(self, user_id):
        time.sleep(1)   # Simulated network
        return {"id": user_id, "name": f"User-{user_id}"}


class CachingProxy(UserAPI):
    def __init__(self, wrapped: UserAPI, ttl_sec=10):
        self.wrapped = wrapped
        self.ttl = ttl_sec
        self.cache = {}   # user_id -> (user, timestamp)

    def get_user(self, user_id):
        now = time.time()
        if user_id in self.cache:
            user, ts = self.cache[user_id]
            if now - ts < self.ttl:
                return user
        user = self.wrapped.get_user(user_id)
        self.cache[user_id] = (user, now)
        return user


class LoggingProxy(UserAPI):
    def __init__(self, wrapped: UserAPI):
        self.wrapped = wrapped

    def get_user(self, user_id):
        print(f"[LOG] get_user({user_id}) called")
        start = time.time()
        result = self.wrapped.get_user(user_id)
        dur = time.time() - start
        print(f"[LOG] returned in {dur:.3f}s")
        return result


# Usage — stack the proxies
api = LoggingProxy(CachingProxy(RemoteUserAPI(), ttl_sec=10))

api.get_user(42)   # Slow (1s); caches; logs
api.get_user(42)   # Fast (cached); logs
api.get_user(99)   # Slow (1s); new user; caches; logs
```

Caching and logging are both cross-cutting concerns added as proxies without touching `RemoteUserAPI`.

---

### Exercise 8 — Capstone (Multi-Pattern)

Design an **image-processing pipeline** that:

1. Uses a **Facade** (`ImageProcessor.process(file)`) to orchestrate the pipeline.
2. Internally uses a **Composite** of filters (a pipeline containing individual filters or sub-pipelines).
3. Each filter is wrapped in a **Decorator** that logs execution time.
4. The image loader is a **Proxy** that caches already-loaded images by path.

Outline the classes and show one working example.

**Solution (sketch):**

```python
import time
from abc import ABC, abstractmethod

# --- Image and filters ---

class Image:
    def __init__(self, path):
        self.path = path
        self.data = f"<pixels of {path}>"

    def __repr__(self):
        return f"Image({self.path}, data={self.data})"


class Filter(ABC):
    @abstractmethod
    def apply(self, image: Image) -> Image: pass


class GrayscaleFilter(Filter):
    def apply(self, image):
        image.data = f"gray({image.data})"
        return image


class BlurFilter(Filter):
    def apply(self, image):
        image.data = f"blur({image.data})"
        return image


# --- Composite (pipeline of filters) ---
class FilterPipeline(Filter):
    def __init__(self):
        self.filters = []

    def add(self, f: Filter):
        self.filters.append(f)
        return self

    def apply(self, image):
        for f in self.filters:
            image = f.apply(image)
        return image


# --- Decorator (timing) ---
class TimedFilter(Filter):
    def __init__(self, wrapped: Filter):
        self.wrapped = wrapped

    def apply(self, image):
        start = time.time()
        result = self.wrapped.apply(image)
        dur = (time.time() - start) * 1000
        print(f"{self.wrapped.__class__.__name__} took {dur:.2f}ms")
        return result


# --- Proxy (image loader with caching) ---
class ImageLoader(ABC):
    @abstractmethod
    def load(self, path) -> Image: pass


class RealImageLoader(ImageLoader):
    def load(self, path):
        print(f"Loading {path} from disk...")
        time.sleep(0.1)   # Simulate I/O
        return Image(path)


class CachingImageLoader(ImageLoader):
    def __init__(self, wrapped: ImageLoader):
        self.wrapped = wrapped
        self.cache = {}

    def load(self, path):
        if path not in self.cache:
            self.cache[path] = self.wrapped.load(path)
        else:
            print(f"Cache hit for {path}")
        return self.cache[path]


# --- Facade ---
class ImageProcessor:
    def __init__(self):
        self.loader = CachingImageLoader(RealImageLoader())
        self.pipeline = (FilterPipeline()
                         .add(TimedFilter(GrayscaleFilter()))
                         .add(TimedFilter(BlurFilter())))

    def process(self, path):
        image = self.loader.load(path)
        return self.pipeline.apply(image)


# --- Usage ---
processor = ImageProcessor()
result1 = processor.process("photo.jpg")   # Loads + filters
result2 = processor.process("photo.jpg")   # Cache hit
print(result2)
```

**Patterns identified:**
- `ImageProcessor` → **Facade**.
- `FilterPipeline` → **Composite** (itself a Filter; contains Filters).
- `TimedFilter` → **Decorator**.
- `CachingImageLoader` → **Proxy** (virtual/caching).

---

## 11. Self-Assessment Test

*Attempt each before revealing the answer.*

<details>

**Q1.** Adapter and Bridge look structurally similar. What's the intent-level difference?

<br>

**Answer:** Adapter is *retrofit* — you use it when two existing components have incompatible interfaces and you need them to work together. Bridge is *upfront design* — you use it when you anticipate two independent axes of variation and want to prevent a combinatorial class explosion. Adapter fixes a mismatch; Bridge prevents one.

---

**Q2.** What's the key property that Composite provides to clients?

<br>

**Answer:** **Uniform treatment** of leaf nodes and composite nodes. Clients can call the same method on either without needing to know which they have. This dramatically simplifies code that traverses or operates on tree-like structures.

---

**Q3.** Without using the word "Decorator," describe why the pattern exists.

<br>

**Answer:** To let you add responsibilities to an object dynamically, at runtime, in any combination — without exploding into 2^N subclasses for every combination of optional behaviors. It replaces inheritance-based extension with composition-based extension.

---

**Q4.** What's the difference between Decorator and Proxy, given they have nearly identical structure?

<br>

**Answer:** Decorator **adds behavior** (extends responsibilities); Proxy **controls access** (lazy loading, remote access, permission checks, caching). Decorator is "and also does X"; Proxy is "is the gatekeeper to X." Same scaffolding, different intent.

---

**Q5.** Under what circumstances is Flyweight worth the complexity?

<br>

**Answer:** When you have a very large number of similar objects (thousands to millions) and memory is a bottleneck, AND those objects share a substantial amount of state that can be separated into intrinsic (shared) and extrinsic (per-context) parts. For hundreds of objects, the pattern is usually overkill.

---

**Q6.** What does Facade *not* do?

<br>

**Answer:** Facade doesn't *hide* the subsystem or *restrict* access to it. The subsystem classes remain usable by anyone who wants fine-grained control. Facade is a *convenience* layer — a simple default for common operations — not an enforcement mechanism.

---

**Q7.** A `Tree` class has a method `add_child(c)` and a `Leaf` class in your Composite doesn't support it. How do you handle this?

<br>

**Answer:** Options:
- **Include `add_child` in the Component interface** but have Leaf throw an exception (or silently ignore). Simpler client code, but weakens LSP.
- **Keep `add_child` only on Composite** (not in the Component interface). Stronger design; client code may need to check before calling — but often this check isn't needed because client code operates through the common interface.

The "right" choice is design-dependent. The GoF book explicitly notes this is a trade-off between safety and transparency.

---

**Q8.** Does the `@decorator` syntax in Python implement the Decorator pattern?

<br>

**Answer:** Related but not identical. The pattern applies to *objects* (wrapping instances). Python's `@decorator` syntax wraps *functions*. The underlying *idea* — wrap to add behavior — is the same, but the pattern as GoF describes it is about object composition, while Python's `@decorator` operates at function level. Both are legitimate uses of the word "decorator."

---

**Q9.** You have three layered proxies: `LoggingProxy(CachingProxy(RateLimitProxy(Real())))`. A call is made. In what order do the proxies execute?

<br>

**Answer:** Outside-in on the way *in*; inside-out on the way *out*.
- Call: Logging → Caching → RateLimit → Real.
- Return: Real → RateLimit → Caching → Logging.

Each proxy runs its pre-logic, delegates inward, then runs its post-logic.

---

**Q10.** Facade, Adapter, and Proxy all wrap things. Tell them apart in one sentence each.

<br>

**Answer:**
- **Facade** — wraps an entire subsystem to simplify it.
- **Adapter** — wraps one object to make its interface compatible with something else.
- **Proxy** — wraps one object to control access to it (lazy, remote, secure, logged).

---

**Q11.** Why is it important that Flyweight objects be immutable?

<br>

**Answer:** Because Flyweights are shared across many contexts. If one client mutates a Flyweight, every other client sharing it sees the change — leading to very subtle, very hard-to-debug bugs. Immutability eliminates this hazard. Practical implementation: make intrinsic state read-only after construction.

---

**Q12.** A junior dev has written a "Facade" that now has 50 methods and is called by 30 modules. Is this healthy?

<br>

**Answer:** Probably not. A Facade that grows too large becomes a **god object** — a dumping ground of "every convenience we ever wanted." Signs it's gone wrong: methods serve very different purposes, many clients use only tiny subsets, and changes ripple through many consumers. Consider splitting it into multiple focused facades by domain (e.g., `UserFacade`, `OrderFacade`, `ReportingFacade`).

</details>

---

**You've now mastered the Structural patterns.** The common thread: *how do we connect objects without locking ourselves into rigid, inflexible structures?* Each pattern offers a different composition technique — translation, bridging, trees, wrapping, simplification, sharing, and control.

**Next up: Behavioral Patterns** — the final and largest family. These patterns focus on **how objects interact and distribute responsibility**: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, and Visitor.

---

*This content is part of **Codeverra** — a platform for learning coding, data science, DSA, and AI from scratch. Explore more: https://codeverra.com*
