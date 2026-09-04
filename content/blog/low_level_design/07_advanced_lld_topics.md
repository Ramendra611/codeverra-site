---
title: "Advanced LLD Topics: A Deep Dive"
description: "Advanced low-level design topics for real systems, interviews, and production code: building on SOLID and design patterns."

date: 2026-09-10
lastmod: 2026-09-10
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - lld
  - design-patterns
  - python

cover:
  image: "/images/LLD - 7.png"
  alt: "Advanced LLD Topics"
  caption: "Advanced LLD Topics: A Deep Dive"
  relative: true
  hidden: false
---

# Advanced LLD Topics — A Deep Dive

> **Who this is for:** Anyone who has finished the SOLID principles and the three design-pattern modules (Creational, Structural, Behavioural) and is ready to learn how to use that knowledge *well* — in real systems, in real interviews, in real production code.

> **What this module builds on:** SOLID Principles (Module 2), Creational Patterns (Module 3), Structural Patterns (Module 4), Behavioural Patterns (Module 5).
> **What this module feeds into:** Case Studies (Module 9) and Testing (Module 8). The Dependency Injection section here is the foundation for every fake, mock, and stub you'll write in Module 8.

---

## Table of Contents

1. [Why This Module Exists](#1-why-this-module-exists)
2. [Topic 1 — Thread Safety in LLD](#2-topic-1--thread-safety-in-lld)
   - 2.1 [The Booking That Sold the Same Room Twice](#21-the-booking-that-sold-the-same-room-twice)
   - 2.2 [What Is a Race Condition?](#22-what-is-a-race-condition)
   - 2.3 [The Fix — `threading.Lock`](#23-the-fix--threadinglock)
   - 2.4 [The Thread-Safe Singleton](#24-the-thread-safe-singleton)
   - 2.5 [The GIL Myth — What Python's GIL Does and Does Not Protect](#25-the-gil-myth)
   - 2.6 [`RLock` — When a Lock Needs to Be Re-entrant](#26-rlock)
   - 2.7 [`queue.Queue` — Thread Safety for Free](#27-queuequeue)
   - 2.8 [LLD Scenarios Where Thread Safety Matters](#28-lld-scenarios)
3. [Topic 2 — Dependency Injection as a Practice](#3-topic-2--dependency-injection-as-a-practice)
   - 3.1 [The Class You Can't Test](#31-the-class-you-cant-test)
   - 3.2 [What DI Actually Is](#32-what-di-actually-is)
   - 3.3 [Constructor Injection](#33-constructor-injection)
   - 3.4 [Setter Injection](#34-setter-injection)
   - 3.5 [Method Injection](#35-method-injection)
   - 3.6 [Why DI Makes Testing Possible — Side by Side](#36-why-di-makes-testing-possible)
   - 3.7 [The Composition Root](#37-the-composition-root)
   - 3.8 [DI Containers — Brief Mention](#38-di-containers)
4. [Topic 3 — Anti-Patterns: What Not to Build](#4-topic-3--anti-patterns-what-not-to-build)
   - 4.1 [The God Class](#41-the-god-class)
   - 4.2 [The Anemic Domain Model](#42-the-anemic-domain-model)
   - 4.3 [Over-Engineering / Premature Pattern Application](#43-over-engineering)
5. [Topic 4 — Design Judgment: When Not to Use a Pattern](#5-topic-4--design-judgment-when-not-to-use-a-pattern)
   - 5.1 [Every Pattern Has a Cost](#51-every-pattern-has-a-cost)
   - 5.2 [The Worth-It Table](#52-the-worth-it-table)
   - 5.3 [Three Questions Before Any Pattern](#53-three-questions-before-any-pattern)
   - 5.4 [YAGNI — You Aren't Gonna Need It](#54-yagni)
   - 5.5 [The Simplest Thing That Could Possibly Work](#55-the-simplest-thing-that-could-possibly-work)
   - 5.6 [The Interview Signal: Patterns You *Didn't* Use](#56-the-interview-signal)
6. [Summary and Key Takeaways](#6-summary-and-key-takeaways)
7. [Practice Problems with Solutions](#7-practice-problems-with-solutions)

---

## 1. Why This Module Exists

You've made it through SOLID. You've worked through Creational, Structural, and Behavioural patterns. You can name Singleton, Factory, Strategy, Observer, Decorator, and Adapter, and explain when to use each.

That's the *vocabulary*. This module is about the *judgment*.

Knowing patterns and using them well are two different skills. The first is taught in books. The second is forged by working on real systems and watching them strain — or break — under load. This module collects the four topics that consistently separate developers who "know patterns" from developers who "design software":

1. **Thread safety.** Your beautiful design works perfectly in tests. Single-threaded tests. Then production runs it with 200 concurrent users and the bugs arrive. Every senior LLD interview probes this.
2. **Dependency Injection as a daily habit.** The Dependency Inversion Principle (DIP) from SOLID isn't a thing you "use once" — it's how you write classes. DI is the practice. Without it, your code has no seams for tests, no flexibility for change.
3. **Anti-patterns by name.** Patterns get named so we can talk about them. Anti-patterns get named for the same reason. An engineer who says "this is turning into a God Class, let me extract responsibilities" demonstrates more in one sentence than a candidate who just rearranges boxes on a whiteboard.
4. **Design judgment.** When *not* to apply a pattern. Restraint is a senior-level signal. Wrapping a 30-line script in Strategy and Observer is not mastery — it's anxiety dressed up as architecture.

Each topic follows the same arc: a real scenario that hurts, the named problem, the fix in code, and a discussion of when the fix applies (and when it doesn't). Practice problems with full solutions live at the end.

---

## 2. Topic 1 — Thread Safety in LLD

### 2.1 The Booking That Sold the Same Room Twice

It's 11:58 PM on a Friday. Two people at opposite ends of the city are both trying to book the last room in a popular hotel for the weekend. Both phones open the booking app within 50 milliseconds of each other.

Both apps query: "Is room 401 available this weekend?" The server replies "yes" to both — because at the moment each query arrived, the room *was* available. Both apps now display a confirm button. Both users tap it. Two HTTP requests reach the booking service within a millisecond of each other.

Both threads on the server check `room.is_available`. Both see `True`. Both set it to `False`. Both write a booking row. Both return "confirmed."

On Saturday morning, two families show up at the front desk with confirmation emails for room 401.

This is a **race condition** — a bug whose existence depends on the precise interleaving of two threads' operations. Single-user testing will never reveal it. Load tests with sparse traffic will rarely reveal it. Production at peak traffic reveals it routinely, and the support team learns to dread Mondays.

Designs that ignore concurrency work perfectly in development and fail unpredictably in production. Every interviewer worth their salt will probe this. This section is how you respond.

### 2.2 What Is a Race Condition?

A race condition is any bug whose presence depends on the *order* in which two or more operations execute, when that order isn't guaranteed.

The most common shape of this bug is **check-then-act**:

```python
# BROKEN — race condition on check-then-act
class HotelRoom:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.is_available = True

    def book(self, guest_name: str) -> str:
        if self.is_available:              # (1) check
            # ↑ thread A reaches here, sees True
            # ↑ thread B *also* reaches here at the same time, also sees True
            self.is_available = False      # (2) act
            return f"Room {self.room_id} booked for {guest_name}"
        return "Room not available"
```

Notice how lines (1) and (2) are conceptually one operation — "if available, claim it" — but Python doesn't enforce them as one. Between the `if` and the assignment, the operating system is free to suspend thread A and run thread B. If it does so right after the `if`, both threads pass the check, both threads do the assignment, and both threads return a success message. One room, two bookings.

You can reproduce this with a simulator:

```python
import threading

room = HotelRoom("401")
results = []

def attempt_to_book(guest_name):
    results.append(room.book(guest_name))

# 100 concurrent attempts — see how many succeed
threads = [threading.Thread(target=attempt_to_book, args=(f"guest-{i}",))
           for i in range(100)]
for t in threads: t.start()
for t in threads: t.join()

successes = [r for r in results if "booked" in r]
print(f"Successful bookings: {len(successes)}")
# Expected: 1.  Actual: often 2, sometimes 3 or more.
```

Run this five times. You'll see different numbers each time. That's the hallmark of a race condition — non-deterministic behaviour.

### 2.3 The Fix — `threading.Lock`

The right tool is a **lock**. A lock is a small flag with two rules:
- Only one thread can "hold" the lock at any moment.
- A thread that tries to acquire a held lock waits until it's released.

We use it to wrap "check then act" so that the two operations together become **atomic** — indivisible from any other thread's point of view.

```python
import threading

class HotelRoom:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.is_available = True
        self._lock = threading.Lock()

    def book(self, guest_name: str) -> str:
        with self._lock:                  # acquire — others wait here
            if self.is_available:
                self.is_available = False
                return f"Room {self.room_id} booked for {guest_name}"
            return "Room not available"
        # lock released automatically on exit, even if we raise
```

Now thread A enters the `with` block. Thread B arrives a microsecond later and blocks at the `with` statement. Thread A checks (`is_available = True`), acts (`is_available = False`), and returns. Then thread A releases the lock. Thread B enters, checks (`is_available = False`), and returns "not available."

Re-run the 100-concurrent-attempts simulation: exactly 1 success, every time.

**Important details:**
- The lock is **per-room**, not global. Different rooms can be booked concurrently — they don't share a lock. A single global lock would correctly prevent over-booking but at the cost of serialising every booking in the entire hotel.
- The `with self._lock:` form is the right idiom. It releases the lock even if an exception is raised inside the block. (Recall the context-manager section in the OOP module.)
- The lock protects the *invariant* — not the data. "If `is_available` is True at the moment of check, this thread is the one that claims it" is the invariant. Anything that participates in that invariant must run inside the lock.

### 2.4 The Thread-Safe Singleton

The basic Singleton you learned in the Creational Patterns module looks like this:

```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

Read carefully: this is a check-then-act. *Two threads can both pass the `is None` check, and both can create an instance.* The Singleton is now a Doubleton. Subtle, hard to reproduce, and devastating in production.

The fix is **double-checked locking**:

```python
import threading

class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:                  # (1) fast path, no lock
            with cls._lock:
                if cls._instance is None:           # (2) recheck inside lock
                    cls._instance = super().__new__(cls)
        return cls._instance
```

Why check twice?
- The **outer check** (line 1) is for speed. Once the singleton exists, every future call hits this fast path and returns immediately — no lock acquisition needed. Locks are cheap but not free.
- The **inner check** (line 2) is for correctness. Two threads can both pass the outer check at the same time, both enter the `with` block (one at a time, since it's a lock), and both try to create the instance. The inner check stops the second thread from overwriting the first thread's instance.

Both checks together are required. Drop the outer check and every access pays for a lock. Drop the inner check and you might get two singletons.

A cleaner alternative for many practical cases is module-level instantiation — Python guarantees module imports run exactly once:

```python
# config.py
class _Config:
    def __init__(self):
        self.db_url = "..."

config = _Config()       # module-level, thread-safe by virtue of import semantics
```

If you can use this pattern, prefer it. Reach for double-checked locking when you genuinely need lazy instantiation and the singleton lives in a more dynamic context.

### 2.5 The GIL Myth

A common Python-specific confusion: "Python has a GIL, so threads run one at a time, so I don't need locks."

This is wrong, and the misunderstanding causes a remarkable number of production bugs.

The Global Interpreter Lock (GIL) means that **only one Python bytecode instruction executes at a time** across threads. What it does *not* mean is that any *Python statement you write* is atomic. Statements compile into multiple bytecode instructions, and the GIL can switch between threads at the boundaries.

Consider this:

```python
counter = 0

def increment():
    global counter
    counter += 1     # looks atomic. Isn't.
```

`counter += 1` compiles into roughly:
1. Load the current value of `counter`.
2. Add 1.
3. Store the result back into `counter`.

The GIL can suspend the thread between any of those three steps. Two threads both load 5, both add 1 to get 6, both store 6. Two increments produced one effective increment. Lost update.

Demonstrate it:

```python
import threading

counter = 0
N = 100_000

def increment_many():
    global counter
    for _ in range(N):
        counter += 1

t1 = threading.Thread(target=increment_many)
t2 = threading.Thread(target=increment_many)
t1.start(); t2.start()
t1.join(); t2.join()

print(counter)
# Expected: 200_000.  Actual: typically less — sometimes much less.
```

The fix is the same as before — a lock:

```python
counter = 0
lock = threading.Lock()

def increment_many():
    global counter
    for _ in range(N):
        with lock:
            counter += 1
```

Or, in cases like this, use an atomic primitive — for example `itertools.count()` or `queue.Queue` — which we'll see in a moment.

**The takeaway:** the GIL gives you instruction-level atomicity, not statement-level atomicity, and definitely not multi-statement atomicity. Any sequence longer than one bytecode instruction can be interrupted. "Check then act," "read then modify then write," "read field A then field B" — all interruptable, all in need of synchronisation.

### 2.6 `RLock` — When a Lock Needs to Be Re-entrant

A regular `Lock` can be acquired by one thread at a time. If the *same* thread tries to acquire it again — say, because a method that holds the lock calls another method that also acquires it — the thread deadlocks against itself.

```python
class Account:
    def __init__(self, balance):
        self.balance = balance
        self._lock = threading.Lock()

    def withdraw(self, amount):
        with self._lock:
            if self.balance >= amount:
                self.balance -= amount

    def transfer(self, other, amount):
        with self._lock:
            self.withdraw(amount)        # ← deadlocks! same lock, same thread
            other.balance += amount
```

The fix is `threading.RLock` — a *re-entrant* lock. It tracks which thread holds it and a count of acquisitions. The same thread can re-acquire it freely; only when the matching number of releases happen does another thread get a chance.

```python
class Account:
    def __init__(self, balance):
        self.balance = balance
        self._lock = threading.RLock()

    def withdraw(self, amount):
        with self._lock:
            if self.balance >= amount:
                self.balance -= amount

    def transfer(self, other, amount):
        with self._lock:
            self.withdraw(amount)        # works — same thread, re-entry allowed
            other.balance += amount
```

Use `RLock` whenever a class has methods that call other locked methods of the same class. Use `Lock` otherwise — it's slightly faster.

### 2.7 `queue.Queue` — Thread Safety for Free

For producer–consumer scenarios — one or more threads pushing work onto a queue, others pulling and processing — Python's `queue.Queue` is already thread-safe. You don't need to wrap it in a lock; that work has been done.

```python
import queue
import threading

q: queue.Queue = queue.Queue()

def producer():
    for i in range(5):
        q.put(f"job-{i}")    # thread-safe
    q.put(None)              # sentinel — signal "done"

def consumer():
    while True:
        item = q.get()       # thread-safe; blocks until something is available
        if item is None:
            break
        print(f"processing {item}")
        q.task_done()


threading.Thread(target=producer).start()
threading.Thread(target=consumer).start()
```

Reach for `queue.Queue` whenever the pattern is "one thread enqueues, another dequeues." It's significantly less error-prone than building this yourself with a list and a lock.

### 2.8 LLD Scenarios

To anchor this in real LLD designs, here are the most common interview problems whose answers require thread safety:

- **Hotel/room booking.** Two users booking the last available room. (As above.) Lock per room (fine-grained) or per hotel (coarse).
- **Parking lot.** Two cars arriving simultaneously, both being assigned the same spot. Lock the spot table or the `assign_spot` operation.
- **Ticket reservation.** Two buyers both purchasing the last seat. Lock per seat or per show.
- **Inventory / e-commerce checkout.** Two orders consuming the last item in stock. Lock per SKU.
- **Connection pool.** Two threads both being handed the same database connection. The pool's `acquire`/`release` methods need a lock.
- **Singleton resources.** Configuration, registries, factories. Double-checked locking.

In every case, the test is the same: *what compound check-then-act exists in this code? What invariant must hold across that check-then-act?* Whatever participates in that invariant goes inside the lock.

We're keeping the scope to `Lock`, `RLock`, and `queue.Queue` here. Async (`asyncio`) and multiprocessing are entirely different concurrency models — they belong to a different module of the course.

**Cross-reference.** Remember the State pattern from the Behavioural module? A vending machine moving between "ready," "money-inserted," "dispensing" states is exactly the kind of small state machine that needs a lock around state transitions if multiple input sources can drive it at once. Same for an elevator's `Idle → Moving → Idle` cycle.

---

## 3. Topic 2 — Dependency Injection as a Practice

### 3.1 The Class You Can't Test

Read this class. It works. It even looks reasonable.

```python
class OrderService:
    def __init__(self):
        self.db = MySQLDatabase(host="prod-db", port=3306, password="...")
        self.notifier = EmailNotifier(smtp_host="smtp.gmail.com", port=587)

    def place_order(self, user_id: str, items: list):
        order_id = self.db.insert_order(user_id, items)
        self.notifier.send(
            to=self.db.get_user_email(user_id),
            subject="Order confirmed",
            body=f"Your order {order_id} is on the way.",
        )
        return order_id
```

Now try to *test* this without a real database or a live SMTP server. You can't. The moment you instantiate `OrderService` in a test, it tries to open a real MySQL connection. There's no seam — no place to slip in a fake.

Which means: every test of `place_order` requires a database to be running. Every CI build requires SMTP credentials. Every developer needs a local DB to even start the app. The class works in production but is a millstone to maintain.

You already met the principle that solves this: **Dependency Inversion** (the D in SOLID). Depend on abstractions, not concretions. This section is how DIP becomes a *daily coding habit* — through a practice called **Dependency Injection (DI)**.

### 3.2 What DI Actually Is

DI is not a framework. It's not magic. It's one idea, stated in one line:

> A class should not *create* its dependencies; it should *receive* them.

That's it. No annotations, no container, no XML config. Just a different way to write `__init__`.

Compare:

```python
# Without DI — the class creates its own dependencies
class OrderService:
    def __init__(self):
        self.db = MySQLDatabase()
        self.notifier = EmailNotifier()

# With DI — the class accepts its dependencies
class OrderService:
    def __init__(self, db, notifier):
        self.db = db
        self.notifier = notifier
```

The difference is two lines of code. The consequences are enormous: testability, flexibility, decoupling.

There are three injection styles. We'll see each one.

### 3.3 Constructor Injection

The most common, most explicit, and almost always the right default. Dependencies arrive as `__init__` arguments and are stored as instance attributes.

```python
from typing import Protocol


# --- Define contracts for what the service needs ---
class Database(Protocol):
    def insert_order(self, user_id: str, items: list) -> str: ...
    def get_user_email(self, user_id: str) -> str: ...


class Notifier(Protocol):
    def send(self, to: str, subject: str, body: str) -> None: ...


# --- The service depends on contracts, not concrete classes ---
class OrderService:
    def __init__(self, db: Database, notifier: Notifier):
        self.db = db
        self.notifier = notifier

    def place_order(self, user_id: str, items: list) -> str:
        order_id = self.db.insert_order(user_id, items)
        self.notifier.send(
            to=self.db.get_user_email(user_id),
            subject="Order confirmed",
            body=f"Your order {order_id} is on the way.",
        )
        return order_id
```

Constructor injection is preferred because:
- All dependencies are visible at the top of the class — no hidden creation buried in a method.
- The class is *immediately* ready to work after construction. No "did I remember to set the notifier?" risk.
- Dependencies are easy to spot during code review — they're the parameters of `__init__`.

Notice we typed against `Protocol`s, not concrete classes. That's the DIP part of DI: high-level code depends on contracts, low-level code provides implementations. (Recall Section 15A in the OOP module.)

### 3.4 Setter Injection

For *optional* dependencies. The most common example is a logger — most of your code can work without one, but you'd like the option to wire one in.

```python
class OrderService:
    def __init__(self, db: Database, notifier: Notifier):
        self.db = db
        self.notifier = notifier
        self.logger = None       # optional, may be left unset

    def set_logger(self, logger):
        self.logger = logger

    def place_order(self, user_id: str, items: list):
        if self.logger:
            self.logger.info(f"placing order for {user_id}")
        order_id = self.db.insert_order(user_id, items)
        # ...
        return order_id
```

Setter injection is fine when the dependency is genuinely optional. Don't use it for required dependencies — it lets callers forget the wiring and create half-initialised objects.

### 3.5 Method Injection

When a dependency is needed only for one specific operation, pass it as a method argument rather than storing it on the instance.

```python
class CheckoutService:
    def __init__(self, db: Database):
        self.db = db

    def calculate_total(self, cart, tax_calculator) -> float:
        """Tax rules can change per call — region, season, promotion."""
        subtotal = sum(item.price for item in cart.items)
        return subtotal + tax_calculator.calculate(subtotal, cart.region)
```

The `tax_calculator` isn't a long-lived dependency of the service; it varies by call. Passing it as a method argument expresses exactly that — and avoids polluting the instance with state that doesn't really belong to it.

### 3.6 Why DI Makes Testing Possible — Side by Side

The promise of DI is testability. Let's prove it concretely.

**The undisciplined version — untestable in any meaningful sense:**

```python
class OrderService:
    def __init__(self):
        self.db = MySQLDatabase()         # connects to real DB
        self.notifier = EmailNotifier()   # connects to real SMTP

    def place_order(self, user_id, items):
        order_id = self.db.insert_order(user_id, items)
        self.notifier.send(self.db.get_user_email(user_id), "...", "...")
        return order_id


# To test this you need:
# - A running MySQL with the right schema
# - Valid SMTP credentials
# - Maybe a mocking library to monkey-patch globals (ugly)
# Tests are slow, flaky, and require infrastructure to even start.
```

**The DI version — trivially testable:**

```python
class OrderService:
    def __init__(self, db, notifier):
        self.db = db
        self.notifier = notifier

    def place_order(self, user_id, items):
        order_id = self.db.insert_order(user_id, items)
        self.notifier.send(self.db.get_user_email(user_id), "Confirmed", f"#{order_id}")
        return order_id


# --- A real, runnable test ---
class FakeDatabase:
    def __init__(self):
        self.orders = []
        self.users = {"u-1": "amit@example.com"}

    def insert_order(self, user_id, items):
        order_id = f"o-{len(self.orders) + 1}"
        self.orders.append({"id": order_id, "user_id": user_id, "items": items})
        return order_id

    def get_user_email(self, user_id):
        return self.users[user_id]


class FakeNotifier:
    def __init__(self):
        self.sent = []

    def send(self, to, subject, body):
        self.sent.append({"to": to, "subject": subject, "body": body})


def test_place_order_sends_confirmation():
    db = FakeDatabase()
    notifier = FakeNotifier()
    svc = OrderService(db=db, notifier=notifier)

    order_id = svc.place_order(user_id="u-1", items=["headphones"])

    assert order_id == "o-1"
    assert db.orders == [{"id": "o-1", "user_id": "u-1", "items": ["headphones"]}]
    assert len(notifier.sent) == 1
    assert notifier.sent[0]["to"] == "amit@example.com"
    assert "o-1" in notifier.sent[0]["body"]


test_place_order_sends_confirmation()
print("✓ test passed")
```

Read that test. It runs in milliseconds. It needs no infrastructure. It precisely asserts what `place_order` does without depending on anything external. **That entire test is possible only because of DI.** Without it, there is no seam at which to insert `FakeDatabase` and `FakeNotifier`.

DI creates seams. Tests live at those seams.

### 3.7 The Composition Root

If `OrderService` doesn't create its dependencies, *someone* has to. That someone is the **composition root** — usually a single location (often `main.py` or an app factory function) where all concrete implementations are wired together.

```python
# main.py — the ONE place that knows about concrete implementations.
import config

def build_app():
    # Infrastructure
    db = MySQLDatabase(connection_string=config.DB_URL)
    notifier = EmailNotifier(smtp_config=config.SMTP)
    logger = StdLogger(level=config.LOG_LEVEL)
    payment_gateway = StripeGateway(api_key=config.STRIPE_KEY)

    # Services — each gets exactly the dependencies it needs
    order_service = OrderService(db=db, notifier=notifier)
    checkout_service = CheckoutService(db=db, payment_gateway=payment_gateway)
    user_service = UserService(db=db, logger=logger)

    # The HTTP layer — gets the services
    app = HTTPApp(order=order_service, checkout=checkout_service, user=user_service)
    return app


if __name__ == "__main__":
    app = build_app()
    app.run()
```

Outside this file, no class knows about MySQL, SMTP, or Stripe. Everyone depends on abstractions. The composition root is the only file you'd touch if you switched the database from MySQL to Postgres — every other class stays untouched because it never knew about MySQL in the first place.

Contrast with the test:

```python
# test_order_service.py — a completely different composition root
def make_test_service():
    db = FakeDatabase()
    notifier = FakeNotifier()
    return OrderService(db=db, notifier=notifier)
```

Same class. Different composition root. Same test, no infrastructure.

### 3.8 DI Containers

In large systems with hundreds of classes, manually wiring everything in `main.py` becomes verbose. DI containers (e.g., `dependency-injector`, `injector` in Python; Spring in Java) automate this — you register a class, declare what it depends on, and the container constructs the graph for you.

For LLD interviews and most production Python services, you don't need a container. **Constructor injection is what matters.** Containers are a production convenience for very large systems, not a precondition for doing DI properly.

If you do reach for one, do it because the manual wiring genuinely became painful — not because the container exists.

**Cross-references.**
- **Back to SOLID (Module 2):** DI is *how* you practice DIP every day. The principle says "depend on abstractions"; DI is the practical answer to "but how?"
- **Forward to Testing (Module 8):** every fake, mock, and stub in the testing module only works because the system under test was built with DI. Without seams, no doubles.

---

## 4. Topic 3 — Anti-Patterns: What Not to Build

Every experienced engineer has a horror story. A codebase where fixing one bug took two weeks because touching anything broke three unrelated things. A class so big the IDE struggled to load it. A "framework" written for a six-line problem.

**Anti-patterns** are the named culprits. Knowing them by name is as important as knowing patterns. The candidate who says "this is becoming a God Class — let me extract responsibilities before adding the feature" demonstrates more about their design instincts in one sentence than a candidate who simply draws bigger boxes.

We'll cover three. Each follows the same arc: the definition, an analogy, painful code, the fix.

### 4.1 The God Class

**Definition.** One class that knows everything, does everything, and is imported by everything.

**Analogy.** Imagine a company where every employee reports directly to the CEO. Every decision — hiring, marketing, billing, tech, lunch orders — goes through the CEO. The CEO knows everything. The CEO does everything. What happens when the CEO is sick? The company stops. What happens when you hire someone new? They go straight to the CEO. What happens when the CEO is overworked and makes a mistake? Everything is affected.

The CEO is a single point of failure and a bottleneck. Now imagine that CEO is a class in your codebase.

**The painful code:**

```python
class ECommerceSystem:
    """Does everything. Owned by everyone. Feared by all."""

    def __init__(self):
        self.db = ...

    # --- User auth ---
    def register_user(self, email, password): ...
    def login(self, email, password): ...
    def logout(self, session_id): ...
    def reset_password(self, email): ...

    # --- Catalog ---
    def search_products(self, query): ...
    def get_product(self, product_id): ...
    def add_product(self, product): ...
    def update_inventory(self, product_id, qty): ...

    # --- Cart ---
    def add_to_cart(self, user_id, product_id): ...
    def remove_from_cart(self, user_id, product_id): ...
    def get_cart(self, user_id): ...

    # --- Payments ---
    def charge_card(self, user_id, amount): ...
    def refund(self, transaction_id): ...

    # --- Notifications ---
    def send_email(self, to, subject, body): ...
    def send_sms(self, to, body): ...

    # --- Logging / metrics ---
    def log_event(self, event): ...
    def emit_metric(self, name, value): ...

    # ...18 more methods you forgot to scroll past...
```

What's wrong:
- **Many reasons to change.** Marketing changes notification copy → edit this class. Payments switches gateway → edit this class. New auth flow → edit this class. Three teams modifying one file is a merge-conflict factory.
- **Untestable.** Want to test the cart logic? You inherit the entire class — including the DB, the SMTP client, the payment gateway, all of it.
- **Hidden coupling.** A change to `send_email` could ripple into `register_user` because nothing prevents one method from quietly depending on another.
- **Every new feature touches it.** That's a sign, not a coincidence.

**Signs to recognise it in the wild:**
- More than 5–7 public methods spanning unrelated concerns.
- Imports from 10+ modules at the top of the file.
- A class name that hand-waves: `Manager`, `Helper`, `Utils`, `System`, `Handler`.
- Every new feature requires touching this class.

**The fix — extract along responsibility lines:**

```python
class UserService:
    def register(self, email, password): ...
    def login(self, email, password): ...
    def logout(self, session_id): ...
    def reset_password(self, email): ...

class CatalogService:
    def search(self, query): ...
    def get(self, product_id): ...

class CartService:
    def add(self, user_id, product_id): ...
    def remove(self, user_id, product_id): ...
    def get(self, user_id): ...

class PaymentProcessor:
    def charge(self, user_id, amount): ...
    def refund(self, transaction_id): ...

class InventoryManager:
    def get_stock(self, product_id): ...
    def update(self, product_id, qty): ...

class Notifier:
    def email(self, to, subject, body): ...
    def sms(self, to, body): ...
```

Each class has *one* reason to change. Tests for `CartService` don't drag in SMTP. The payments team can iterate on `PaymentProcessor` without coordinating with the catalog team. This is the Single Responsibility Principle (Module 2) showing up in the wild.

A god class isn't *defeated* by one refactor — it's *prevented* by noticing it forming and extracting responsibilities while the cost of extracting is still small. Once a class has 40 methods and seven teams depend on it, the surgery is much harder.

### 4.2 The Anemic Domain Model

**Definition.** Domain classes that hold data but have no meaningful behaviour. All logic lives in separate "manager" or "service" classes that reach into the domain objects and manipulate them directly.

**Analogy.** Imagine a hospital where patients are just folders of paper. The patients themselves don't speak, don't decide, don't act. All decisions are made by administrators who pull the folder, read the data, decide something, and edit the folder. The patients have no agency. When the rules for treating diabetic patients change, you update the administrators' procedures — not the patients' own behaviour, because they don't have any.

Domain models in code can devolve into this. The data lives in one place; the logic lives in another. They drift apart, and the logic loses its grip on the invariants the data is supposed to obey.

**The painful code:**

```python
@dataclass
class BankAccount:
    account_id: str
    owner: str
    balance: float


class BankAccountManager:
    """All the actual behaviour lives here, reaching into BankAccount."""

    def deposit(self, account: BankAccount, amount: float):
        account.balance += amount

    def withdraw(self, account: BankAccount, amount: float):
        if account.balance >= amount:
            account.balance -= amount
        else:
            raise ValueError("Insufficient funds")

    def transfer(self, src: BankAccount, dst: BankAccount, amount: float):
        if src.balance >= amount:
            src.balance -= amount
            dst.balance += amount


# Usage
acc = BankAccount("a-1", "Amit", 1000.0)
mgr = BankAccountManager()
mgr.withdraw(acc, 200)
```

Why this is anaemic — and why it's actually a problem, not just a stylistic choice:

- **The invariant is unenforceable.** "Balance can't go negative" is a fact about a `BankAccount`. But anyone, anywhere, can write `acc.balance -= 5000` and bypass `withdraw` entirely. The data class doesn't protect itself.
- **Logic gets duplicated.** Different managers (or just future developers) re-implement the rules slightly differently. Now there are two definitions of "what does withdrawal mean," and they slowly diverge.
- **Encapsulation is fake.** The data is technically inside `BankAccount`, but every other class freely reaches in. The boundary is ceremonial.

**The rule: logic belongs where the data lives.**

```python
class BankAccount:
    def __init__(self, account_id: str, owner: str, balance: float):
        if balance < 0:
            raise ValueError("Initial balance cannot be negative")
        self.account_id = account_id
        self.owner = owner
        self._balance = balance     # private — protected by methods

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount

    def withdraw(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Withdrawal must be positive")
        if self._balance < amount:
            raise ValueError("Insufficient funds")
        self._balance -= amount

    def transfer(self, dst: "BankAccount", amount: float) -> None:
        self.withdraw(amount)
        dst.deposit(amount)


# Usage — the account guards itself
acc = BankAccount("a-1", "Amit", 1000.0)
acc.withdraw(200)
# acc._balance = -1_000_000   ← still possible in Python, but flagged by convention
```

The invariant ("balance never goes negative") is now *intrinsic* to the class. Every code path that changes the balance goes through the class's own methods. The behaviour and the data live together.

**When you still want a service.** Not every coordination concern fits inside one entity. Multi-account transfers with audit logging, cross-currency conversion, and atomic database updates may need to live in a `TransferService` — because they coordinate *multiple* accounts and infrastructure. But within that service, the *intrinsic* behaviour of an account stays on the account. The service orchestrates; the account enforces its own rules.

Anaemic models often arise from over-applying the "DTO pattern" or from blindly mapping ORM tables to classes without adding methods. Both are warning signs.

### 4.3 Over-Engineering / Premature Pattern Application

**Definition.** Applying patterns that aren't yet needed — creating complexity in anticipation of requirements that may never arrive.

**Analogy.** Building a 12-lane highway for a village of 200 people because "it might grow one day." The cost — land, materials, maintenance — is real today. The benefit is hypothetical. By the time the village actually grows (if it ever does), the highway's design might be wrong for whatever it actually grew into.

Code has the same shape. Every pattern adds a cost — a class, a layer, a vocabulary word a new reader has to learn before they can navigate the code. That cost is paid every day by everyone who touches the file. The benefit — extensibility, swappability — is *only realised* when you actually have the variation the pattern enables.

**The painful code:**

A teammate has wrapped a simple temperature converter in three patterns "for flexibility":

```python
from abc import ABC, abstractmethod

# 1. An abstract strategy
class ConversionStrategy(ABC):
    @abstractmethod
    def convert(self, value: float) -> float: ...


# 2. Three concrete strategies — for three fixed formulas
class CelsiusToFahrenheit(ConversionStrategy):
    def convert(self, c): return c * 9 / 5 + 32

class CelsiusToKelvin(ConversionStrategy):
    def convert(self, c): return c + 273.15

class FahrenheitToCelsius(ConversionStrategy):
    def convert(self, f): return (f - 32) * 5 / 9


# 3. A factory to choose the strategy
class ConverterFactory:
    _registry = {
        ("C", "F"): CelsiusToFahrenheit,
        ("C", "K"): CelsiusToKelvin,
        ("F", "C"): FahrenheitToCelsius,
    }

    @classmethod
    def get(cls, from_unit, to_unit) -> ConversionStrategy:
        return cls._registry[(from_unit, to_unit)]()


# 4. A plugin loader, in case "users want to add custom units"
class PluginLoader:
    def load_plugins(self, directory): ...
    def register_strategy(self, key, strategy_class): ...


# Usage
strategy = ConverterFactory.get("C", "F")
print(strategy.convert(100))   # 212.0
```

What's wrong:
- **Patterns for fixed problems.** There are three temperature formulas. They will not change next quarter, next year, or in the lifetime of the codebase. Strategy is overkill.
- **A factory selecting among three things.** A dict could do this in one line.
- **A plugin loader for plugins that don't exist.** Built for a future that hasn't arrived and probably never will.
- **A reader can't see the formula.** They have to navigate three classes and a registry to find `c * 9 / 5 + 32`.

**The right code:**

```python
def celsius_to_fahrenheit(c): return c * 9 / 5 + 32
def celsius_to_kelvin(c):     return c + 273.15
def fahrenheit_to_celsius(f): return (f - 32) * 5 / 9


CONVERTERS = {
    ("C", "F"): celsius_to_fahrenheit,
    ("C", "K"): celsius_to_kelvin,
    ("F", "C"): fahrenheit_to_celsius,
}


def convert(value, from_unit, to_unit):
    return CONVERTERS[(from_unit, to_unit)](value)


print(convert(100, "C", "F"))   # 212.0
```

Three functions and a dict. Anyone can read this. It does exactly what the original did. It will keep working for years. If someday a real need for runtime-pluggable strategies appears — say, the team adds 30 unit types and wants users to plug in their own — you can refactor *toward* the original Strategy design at that point. You'll know what shape to give it because you'll have the actual requirement, not a guess.

**The rule: YAGNI.** *You Aren't Gonna Need It.* Apply a pattern when you feel the pain it solves, not before. The best code for a feature you don't need yet is no code at all.

Over-engineering is the most expensive anti-pattern in this list, because unlike a God Class or an Anemic Model, it actively looks like good engineering at first glance. Junior reviewers nod approvingly at the Strategy hierarchy. Only experience teaches you to count the moving parts and ask: "do we actually have the problem these patterns solve?"

---

## 5. Topic 4 — Design Judgment: When Not to Use a Pattern

Knowing patterns is knowing tools. *Wisdom* is knowing which to pick up and which to leave in the drawer.

A developer who wraps a 30-line script in Singleton, Factory, Strategy, and Observer is not demonstrating mastery. They're demonstrating *anxiety* — the worry that someone might one day need flexibility they can't yet envision, so they pre-pay for every kind of flexibility. The cost is real today; the benefit is hypothetical.

Real mastery shows in restraint: knowing when a function is enough.

### 5.1 Every Pattern Has a Cost

Every pattern you apply adds, at minimum:
- One new class or file.
- One new layer of indirection.
- One more concept a future reader must understand before the code makes sense.

That cost is paid every day, by every developer who touches that code. It compounds. A codebase with 50 unnecessary abstractions takes longer to onboard onto, longer to debug, and longer to change — because changes now require navigating the abstractions to find the actual logic.

The benefit — extensibility, decoupling, testability — is real *only* when you actually have the problem the pattern solves. A Strategy pattern with two strategies that will never grow gives you zero flexibility benefit but charges you for the indirection forever.

### 5.2 The Worth-It Table

A rough mental model for the most common patterns:

| Pattern | Worth it when | Not worth it when |
|---|---|---|
| **Singleton** | One truly global resource with shared mutable state (a connection pool, config registry, metrics collector). | You just want to share an object — use DI instead. Singletons create hidden global state. |
| **Factory** | The concrete type varies at runtime based on input (config, user choice, data). | You always create the same type. A direct constructor or class method is clearer. |
| **Strategy** | The algorithm genuinely varies at runtime, and the set of strategies is growing or extensible. | Two variations that are unlikely to grow. An `if`/`else` or a dict-of-functions is more honest. |
| **Observer** | Multiple independent things must react to a change, and you don't know who they all are. | One thing reacts. Just call it directly. |
| **Decorator** | Behaviours compose in many combinations (logging × caching × auth × retries). | One or two variations. A subclass is fine. |
| **Adapter** | You must integrate two existing, fixed interfaces you can't change. | You control both sides. Change one to match. |
| **Command** | Operations need to be queued, logged, undone, or replayed. | Operations execute immediately and forever. A function call is simpler. |

Read this table not as a verdict but as a starting point for the conversation: *am I adding this pattern because the problem demands it, or because the pattern is nearby?*

### 5.3 Three Questions Before Any Pattern

Before applying any pattern, ask yourself:

1. **What specific problem does this pattern solve?**
2. **Do I have that problem right now, in this code?**
3. **What complexity does adding this pattern introduce?**

If the answer to question 1 doesn't match a real pain visible in question 2, put the pattern down. If the cost in question 3 exceeds the visible benefit, put the pattern down.

A concrete example. You're writing a discount system. Two discount types exist today: FLAT (`₹100 off`) and PERCENTAGE (`10% off`). A teammate suggests Strategy.

Apply the three questions:
1. What problem does Strategy solve? *Allows new algorithms to be added without changing existing code.*
2. Do we have that problem? *Marginally. There are exactly two types and no current plans for more.*
3. What does Strategy cost? *An abstract base class, two concrete classes, a factory or registry, a context that holds the current strategy. Four to five new classes for what is currently a five-line `if`/`else`.*

The answer is: not yet. An `if`/`else` (or a dict-of-functions) is the right tool today. *If* discount rules start coming from a database, *if* business users start requesting custom rules, *if* the count grows to six and feels likely to keep growing — then the Strategy refactor has a real reason to exist. You'll do it then, with the actual requirements as your guide, instead of guessing now.

### 5.4 YAGNI

YAGNI — **You Aren't Gonna Need It** — is the single most useful design principle that has nothing to do with any specific pattern.

Stated plainly: *build for requirements you have, not requirements you imagine.*

The argument: imagined requirements are notoriously wrong. The abstraction you build for scenario A almost never matches what scenario B actually needs when it arrives. You end up with two costs — the abstraction you over-built for the wrong future, plus the refactor required to support the actual future. Compared to building straightforwardly today and refactoring *when* the real need appears, YAGNI almost always wins.

> *The best code for a feature you don't need yet is no code at all.*

This is not an argument for sloppy code or for ignoring the future. It is an argument for *staying honest about the difference between today's requirements and tomorrow's speculation*.

### 5.5 The Simplest Thing That Could Possibly Work

A useful question to ask before adding any abstraction: **"What's the simplest version that works, is readable, and passes all the tests?"**

If that simpler version is maintainable, ship it. Add abstraction only when the simple version starts cracking under real pressure.

Real pressure looks like:
- A third variant of the algorithm appears and the `if`/`else` is becoming a tangle.
- Two teams want different behaviour and the shared code path can't accommodate both.
- A unit test becomes painful to write because of a hidden dependency.

These are signals that the simple version has reached its useful life. Now refactor toward the pattern that addresses the *real* pain. The refactor will be obvious, because the pain is visible.

Refactoring under pressure is risk-free *because* the pressure tells you exactly what to refactor to. Refactoring in anticipation is high-risk because you're optimising against a future you can only guess at.

### 5.6 The Interview Signal

Here's a small thing that pays disproportionate dividends in interviews: **naming a pattern you chose NOT to use, and saying why.**

> "I considered using Strategy here, but there are only two pricing rules and they're unlikely to change. The class hierarchy isn't worth it yet. If the rules start coming from configuration or the count grows past four or five, I'd refactor to Strategy then."

That sentence signals:
- You know Strategy exists.
- You know what problem it solves.
- You know how to recognise when that problem is real.
- You're not adding complexity to look senior.

That's a more mature signal than someone who applies Strategy to everything. Interviewers notice.

Make this an explicit habit during system-design discussions. When you decline a pattern, *name it* and *explain why*. Even if no one asks. It's the cleanest way to show that you understand the patterns deeply enough to choose against them when appropriate.

---

## 6. Summary and Key Takeaways

Five points to internalise from this module:

1. **Thread safety is not automatic.** The GIL does not protect compound operations like `counter += 1`, `if available: claim()`, or `read field then write another`. Every check-then-act in a concurrent system is a potential race condition. Wrap them in `threading.Lock` (or `RLock` when the same thread re-acquires) — or use `queue.Queue` for producer/consumer flows.

2. **Dependency Injection is how DIP becomes a daily habit.** Pass dependencies into your classes; don't construct them inside. The seams DI creates are exactly where fakes, stubs, and mocks live in tests. Without DI, there are no seams — the code is a wall.

3. **Three anti-patterns to recognise and name on sight.**
   - **God Class** — one class doing everything; split along responsibility lines.
   - **Anemic Domain Model** — data without behaviour; let logic live where the data lives.
   - **Over-Engineering** — patterns applied before the problem exists; YAGNI.

4. **Every pattern has a real cost in complexity.** Classes, indirection, vocabulary. That cost is paid every day. The benefit must be *visible today*, not hypothetical, before you should pay it.

5. **The most important design question is not "which pattern?" but "do I even need a pattern here?"** Restraint is a senior signal. Naming patterns you *didn't* use — and why — communicates more than applying them indiscriminately.

---

## 7. Practice Problems with Solutions

Twelve problems across four categories. Solutions include both code and *reasoning* — because the reasoning is the actual lesson.

---

### Type 1 — Spot the Issue

*Read the code, identify the problem, name it, explain the fix. No coding required.*

---

#### P1.1 — The Ticketing Race

```python
class TicketingSystem:
    def __init__(self, total_seats: int):
        self.available = total_seats

    def book_seat(self, user_id: str) -> bool:
        if self.available > 0:
            self.available -= 1
            print(f"Seat booked for {user_id}")
            return True
        return False
```

What is the bug? Under what conditions does it manifest? What is the fix?

**Solution.**

**The bug.** Classic check-then-act race condition. `if self.available > 0` (the check) and `self.available -= 1` (the act) are two separate operations. When two threads call `book_seat` near-simultaneously and only one seat remains, both can read `available > 0` as `True` before either has decremented. Both proceed to decrement. `available` ends up at `-1`, and two bookings are confirmed for the last seat.

**When it manifests.** Any time multiple threads call `book_seat` on the same instance. The narrower the window between the check and the act, the rarer the bug — but it's always possible, and concurrent load makes it likely. Single-threaded testing will never catch it.

**The fix.** Wrap the compound operation in a lock so that no other thread can interleave between the check and the act:

```python
import threading

class TicketingSystem:
    def __init__(self, total_seats: int):
        self.available = total_seats
        self._lock = threading.Lock()

    def book_seat(self, user_id: str) -> bool:
        with self._lock:
            if self.available > 0:
                self.available -= 1
                print(f"Seat booked for {user_id}")
                return True
            return False
```

Note: the lock must wrap *both* the check and the act. Wrapping only the decrement (or only the check) would still allow the race.

---

#### P1.2 — The God Class

```python
class UserSystem:
    def register(self, email, password): ...
    def login(self, email, password): ...
    def send_welcome_email(self, email): ...
    def update_profile(self, user_id, data): ...
    def save_to_db(self, user): ...
    def generate_report(self, user_id): ...
    def log_activity(self, user_id, action): ...
```

What's wrong? Name the anti-pattern. What responsibilities can you identify? How would you split this?

**Solution.**

**The anti-pattern.** God Class. `UserSystem` is doing too many unrelated jobs, each with its own reason to change, its own collaborators, and its own test requirements.

**Responsibilities visible in the methods:**
- **Authentication.** `register`, `login`. (Plus probably `logout`, `reset_password` if the class grows further.)
- **Notifications.** `send_welcome_email`. (And almost certainly other emails before long.)
- **Profile management.** `update_profile`. (User attributes — name, address, preferences.)
- **Persistence.** `save_to_db`. (Database concerns.)
- **Reporting.** `generate_report`. (Aggregations, formatting, possibly export.)
- **Auditing.** `log_activity`. (Cross-cutting concern for security/compliance.)

**The split.**

```python
class AuthService:
    def register(self, email, password): ...
    def login(self, email, password): ...

class UserRepository:        # persistence concerns
    def save(self, user): ...
    def find_by_id(self, user_id): ...

class ProfileService:
    def update(self, user_id, data): ...

class Notifier:
    def send_welcome_email(self, email): ...

class ReportService:
    def generate(self, user_id): ...

class ActivityLogger:
    def log(self, user_id, action): ...
```

Each class now has *one reason to change*. The auth team can iterate on `AuthService` without coordinating with the reporting team. Tests for `ProfileService` no longer drag in SMTP credentials. New requirements (e.g., changing the auth flow) modify one class instead of one file owned by everyone.

In practice, an orchestrating `UserService` may exist on top — but its job is *coordination* between these smaller services, not implementing each one.

---

#### P1.3 — The Over-Engineered Converter

```python
from abc import ABC, abstractmethod

class ConverterStrategy(ABC):
    @abstractmethod
    def convert(self, amount): ...

class INRtoUSD(ConverterStrategy):
    def convert(self, amount): return amount / 83.5

class USDtoEUR(ConverterStrategy):
    def convert(self, amount): return amount * 0.92


class AbstractConverterFactory(ABC):
    @abstractmethod
    def create(self, src, dst): ...

class DefaultConverterFactory(AbstractConverterFactory):
    def create(self, src, dst):
        return STRATEGY_REGISTRY.get((src, dst))()


class PluginLoader:
    def __init__(self): self.plugins = {}
    def load(self, name, cls): self.plugins[name] = cls
    def find_or_load(self, src, dst): ...


STRATEGY_REGISTRY = {("INR", "USD"): INRtoUSD, ("USD", "EUR"): USDtoEUR}
```

Is this design appropriate? What is the correct implementation given that the rates are fixed in code and only two conversions are supported?

**Solution.**

**The anti-pattern.** Over-engineering / premature pattern application. For two hard-coded conversions, the design uses Strategy, Abstract Factory, a registry, and a plugin loader. Four pattern-shaped pieces of infrastructure for *two fixed values*.

**Costs being paid for no benefit:**
- Six classes plus a registry where two functions would do.
- A reader must understand four design patterns to find a single multiplication.
- Maintenance, code review, and onboarding all pay for indirection that has no current customer.

**The right implementation:**

```python
def inr_to_usd(amount): return amount / 83.5
def usd_to_eur(amount): return amount * 0.92


CONVERTERS = {
    ("INR", "USD"): inr_to_usd,
    ("USD", "EUR"): usd_to_eur,
}


def convert(amount, src, dst):
    return CONVERTERS[(src, dst)](amount)


print(convert(1000, "INR", "USD"))   # ~11.98
```

Two functions, a dict, and a wrapper. Reads in five seconds. Does exactly what the original did. If, in some future iteration, exchange rates start coming from a live API, conversions multiply to dozens, and rates change daily — *then* refactoring to a `Strategy` or to a `RateProvider` abstraction will be obvious and justified by the actual requirements. Until then, simpler is better.

---

### Type 2 — Fix the Code

*Broken implementation provided. Write the corrected version with explanation.*

---

#### P2.1 — Make It Thread-Safe

The connection pool below issues database connections to threads. It is *not* thread-safe. Identify the race condition. Add the right locking. Explain where the race happened and why the lock placement matters.

```python
class ConnectionPool:
    def __init__(self, size: int):
        self._connections = [self._create_connection(i) for i in range(size)]
        self._in_use = set()

    def acquire(self) -> "Connection":
        for conn in self._connections:
            if conn.id not in self._in_use:
                self._in_use.add(conn.id)
                return conn
        raise RuntimeError("No connections available")

    def release(self, conn: "Connection") -> None:
        self._in_use.discard(conn.id)

    def _create_connection(self, id_: int) -> "Connection":
        return Connection(id=id_)
```

**Solution.**

**Where the race is.** Inside `acquire()`. Two threads can both iterate, both find the same `conn` not in `_in_use`, and both add it to `_in_use` and return it. Both think they have an exclusive connection — but they're holding the same one. Database operations from the two threads would now collide on a single connection, with chaos following.

A secondary race is `release()`. If `release` is called from one thread while `acquire` is iterating in another, the membership check `conn.id not in self._in_use` can give a stale answer.

**The fix.** A lock around the *entire* `acquire` body and around `release`. Both operations participate in the same invariant ("`_in_use` accurately reflects who owns what"), so both must take the lock.

```python
import threading

class ConnectionPool:
    def __init__(self, size: int):
        self._connections = [self._create_connection(i) for i in range(size)]
        self._in_use: set[int] = set()
        self._lock = threading.Lock()

    def acquire(self) -> "Connection":
        with self._lock:
            for conn in self._connections:
                if conn.id not in self._in_use:
                    self._in_use.add(conn.id)
                    return conn
            raise RuntimeError("No connections available")

    def release(self, conn: "Connection") -> None:
        with self._lock:
            self._in_use.discard(conn.id)

    def _create_connection(self, id_: int) -> "Connection":
        return Connection(id=id_)
```

**Why the lock placement matters.** A common mistake is to lock only the `self._in_use.add(conn.id)` line. That doesn't help — by the time the lock is acquired, two threads have already chosen the same `conn`. The lock must cover the *compound* operation: iterate, check, claim. All three together form the atomic block.

A more sophisticated implementation might use a `queue.Queue` of available connections — which is itself thread-safe — to avoid manual locking altogether:

```python
import queue

class ConnectionPool:
    def __init__(self, size: int):
        self._available: queue.Queue = queue.Queue()
        for i in range(size):
            self._available.put(self._create_connection(i))

    def acquire(self, timeout=None):
        return self._available.get(timeout=timeout)   # thread-safe

    def release(self, conn):
        self._available.put(conn)                     # thread-safe
```

Both designs are correct. The first explicitly shows the lock; the second uses a thread-safe data structure that hides the lock. For production, the queue-based version is usually cleaner.

---

#### P2.2 — Refactor to Use DI

The `InvoiceService` below creates its dependencies inside its constructor. Refactor it to use constructor injection. Then write a small test using fake implementations to prove the refactor works.

```python
class PDFExporter:
    def export(self, invoice) -> bytes:
        # imagine real PDF generation here, requiring a library and disk I/O
        return b"%PDF-..."

class EmailSender:
    def send(self, to, subject, body, attachments):
        # imagine real SMTP work here, requiring credentials and a network call
        print(f"sent to {to}")

class InvoiceService:
    def __init__(self):
        self.exporter = PDFExporter()
        self.email = EmailSender()

    def send_invoice(self, invoice, to_email):
        pdf = self.exporter.export(invoice)
        self.email.send(
            to=to_email,
            subject=f"Invoice #{invoice.id}",
            body="Your invoice is attached.",
            attachments=[("invoice.pdf", pdf)],
        )
```

**Solution.**

**Refactored class:**

```python
from typing import Protocol


# --- Contracts: what the service needs, expressed structurally ---
class Exporter(Protocol):
    def export(self, invoice) -> bytes: ...

class Sender(Protocol):
    def send(self, to: str, subject: str, body: str, attachments: list): ...


class InvoiceService:
    def __init__(self, exporter: Exporter, sender: Sender):
        # Dependencies arrive as constructor arguments.
        # The class no longer knows about PDF generation or SMTP.
        self.exporter = exporter
        self.sender = sender

    def send_invoice(self, invoice, to_email):
        pdf = self.exporter.export(invoice)
        self.sender.send(
            to=to_email,
            subject=f"Invoice #{invoice.id}",
            body="Your invoice is attached.",
            attachments=[("invoice.pdf", pdf)],
        )
```

**Composition root — wires the real implementations together:**

```python
# main.py
service = InvoiceService(exporter=PDFExporter(), sender=EmailSender())
```

**Test — uses fakes, no PDF library, no SMTP server:**

```python
from dataclasses import dataclass

@dataclass
class FakeInvoice:
    id: str


class FakeExporter:
    def __init__(self):
        self.calls = []
    def export(self, invoice):
        self.calls.append(invoice)
        return b"FAKE_PDF_BYTES"


class FakeSender:
    def __init__(self):
        self.sent = []
    def send(self, to, subject, body, attachments):
        self.sent.append({
            "to": to, "subject": subject, "body": body, "attachments": attachments,
        })


def test_send_invoice_attaches_pdf_and_emails_recipient():
    exporter = FakeExporter()
    sender = FakeSender()
    svc = InvoiceService(exporter=exporter, sender=sender)

    invoice = FakeInvoice(id="INV-100")
    svc.send_invoice(invoice, to_email="user@example.com")

    # Exporter was called with the right invoice
    assert exporter.calls == [invoice]

    # Sender received exactly one email with the PDF attached
    assert len(sender.sent) == 1
    email = sender.sent[0]
    assert email["to"] == "user@example.com"
    assert email["subject"] == "Invoice #INV-100"
    assert email["attachments"] == [("invoice.pdf", b"FAKE_PDF_BYTES")]


test_send_invoice_attaches_pdf_and_emails_recipient()
print("✓ test passed")
```

**What changed, and why:**

1. `__init__` accepts `exporter` and `sender` instead of constructing them. The class is now decoupled from PDF and SMTP implementations.
2. The class depends on `Protocol`s (`Exporter`, `Sender`), not concrete classes — applying DIP from SOLID.
3. The test runs without any infrastructure: no PDF library, no SMTP server, no network. It exercises *the logic of `send_invoice`*, which is what we actually want to test.
4. The composition root (`main.py`) is now the only place where `PDFExporter()` and `EmailSender()` are mentioned. Swap one out (e.g., replace SMTP with SendGrid) by editing exactly one line.

Compare this to testing the original version: you'd have needed monkey-patching, mocking libraries, or a real SMTP server. DI made the test obvious.

---

#### P2.3 — Fix the Anemic Domain Model

The code below splits a `ShoppingCart` into a passive data class and an active service that reaches into it. Move the cart's intrinsic behaviour back onto the `ShoppingCart` itself, leaving only coordination logic in the service (if anything remains there at all).

```python
from dataclasses import dataclass, field

@dataclass
class ShoppingCart:
    user_id: str
    items: list = field(default_factory=list)
    discount_code: str | None = None


class ShoppingCartService:
    def add_item(self, cart: ShoppingCart, item: dict):
        cart.items.append(item)

    def remove_item(self, cart: ShoppingCart, item_id: str):
        cart.items = [i for i in cart.items if i["id"] != item_id]

    def apply_discount(self, cart: ShoppingCart, code: str):
        if code in {"WELCOME10", "FESTIVE25"}:
            cart.discount_code = code
        else:
            raise ValueError("Invalid discount code")

    def calculate_total(self, cart: ShoppingCart) -> float:
        subtotal = sum(i["price"] * i["qty"] for i in cart.items)
        if cart.discount_code == "WELCOME10":
            return subtotal * 0.9
        if cart.discount_code == "FESTIVE25":
            return subtotal * 0.75
        return subtotal
```

**Solution.**

The intrinsic behaviour — adding items, removing items, applying a discount, calculating the total — *belongs to the cart*. These operations protect the cart's invariants (valid discount codes, never-negative quantities, etc.). Moving them onto the cart itself is what gives the class its agency back.

```python
class ShoppingCart:
    _VALID_DISCOUNTS = {"WELCOME10": 0.10, "FESTIVE25": 0.25}

    def __init__(self, user_id: str):
        self.user_id = user_id
        self._items: list[dict] = []
        self._discount_code: str | None = None

    def add_item(self, item: dict) -> None:
        if item.get("qty", 0) <= 0:
            raise ValueError("Item quantity must be positive")
        if item.get("price", 0) < 0:
            raise ValueError("Item price cannot be negative")
        self._items.append(item)

    def remove_item(self, item_id: str) -> None:
        self._items = [i for i in self._items if i["id"] != item_id]

    def apply_discount(self, code: str) -> None:
        if code not in self._VALID_DISCOUNTS:
            raise ValueError(f"Invalid discount code: {code}")
        self._discount_code = code

    def remove_discount(self) -> None:
        self._discount_code = None

    def subtotal(self) -> float:
        return sum(i["price"] * i["qty"] for i in self._items)

    def total(self) -> float:
        discount_rate = self._VALID_DISCOUNTS.get(self._discount_code, 0)
        return self.subtotal() * (1 - discount_rate)

    def __len__(self):
        return sum(i["qty"] for i in self._items)
```

The service shrinks dramatically — possibly disappears, or becomes a thin orchestrator for cross-cutting concerns (saving the cart, integrating with checkout):

```python
class CheckoutService:
    """Coordinates a cart with payment + persistence. The cart enforces its own rules."""

    def __init__(self, payment_gateway, repo):
        self.payment_gateway = payment_gateway
        self.repo = repo

    def checkout(self, cart: ShoppingCart) -> str:
        total = cart.total()                          # cart computes its own total
        transaction_id = self.payment_gateway.charge(cart.user_id, total)
        self.repo.save(cart, status="paid", txn=transaction_id)
        return transaction_id
```

**What changed, and why:**

- Validations (`qty > 0`, valid discount code) live *inside* the cart. The cart can no longer enter an invalid state from outside.
- `total()` and `subtotal()` are properties of the cart, not of an external service — because they're computed *from cart data*.
- The cart's `_items` and `_discount_code` are private. External code can no longer reach in and bypass the rules. This is the encapsulation the dataclass version pretended to have but didn't really enforce.
- The remaining service (`CheckoutService`) is genuinely about *coordination* between the cart, the payment gateway, and persistence — concerns that span multiple objects. That's a legitimate service responsibility.

**The rule restated:** logic belongs where the data lives. Intrinsic operations (those that depend only on the object's own state and protect its own invariants) go on the object. Coordination across multiple objects and infrastructure stays in services.

---

### Type 3 — Design Judgment

*Open-ended scenarios. No single right answer — the goal is reasoning through tradeoffs.*

---

#### P3.1 — To Pattern or Not to Pattern?

A teammate is reviewing your code for a discount system. There are exactly two discount types today: `FLAT` (e.g., `₹100 off`) and `PERCENTAGE` (e.g., `10% off`). Your current implementation:

```python
def calculate_discount(subtotal: float, kind: str, value: float) -> float:
    if kind == "FLAT":
        return max(subtotal - value, 0)
    if kind == "PERCENTAGE":
        return subtotal * (1 - value / 100)
    raise ValueError(f"Unknown discount kind: {kind}")
```

Your teammate says: "This should use the Strategy pattern. Each discount type should be its own class implementing a `DiscountStrategy` interface. That way we can add new discount types without modifying existing code — it's Open/Closed."

Should you agree? Explain your reasoning. Under what conditions *would* you refactor to Strategy?

**Solution.**

The short answer: not yet. Here's the reasoning.

**Apply the three questions from Section 5.3:**

1. *What problem does Strategy solve?* It allows new variants of an algorithm to be added without modifying the dispatch code — solving the Open/Closed Principle when the set of variants is open-ended or extensible.

2. *Do we have that problem right now?* No. There are exactly two discount types. There is no current plan to add more. They are stable business rules.

3. *What does adding Strategy cost?* An abstract base class (or Protocol), two concrete classes, a factory or registry to pick between them, and a call site that delegates through the registry. Roughly 30–40 lines and 4 new symbols for what is currently 5 lines and 1 function.

Your teammate is technically right that Strategy *could* work here. They are wrong that it *should* be applied here. The Open/Closed Principle is a guideline, not a moral imperative. It's worth applying when extension is realistic and the cost of indirection is low compared to the cost of future modification. Neither is true for two fixed discount types.

**The right answer is the dict-of-functions version**, which is honest about the structure of the problem:

```python
def flat_discount(subtotal, value):       return max(subtotal - value, 0)
def percent_discount(subtotal, value):    return subtotal * (1 - value / 100)

DISCOUNTS = {"FLAT": flat_discount, "PERCENTAGE": percent_discount}

def calculate_discount(subtotal, kind, value):
    try:
        return DISCOUNTS[kind](subtotal, value)
    except KeyError:
        raise ValueError(f"Unknown discount kind: {kind}")
```

This costs almost nothing more than the original. It cleanly separates each formula, and registering a new kind is one line — without the ceremony of a class hierarchy.

**When *would* refactoring to Strategy be justified?** The refactor earns its keep when one of these is true:

- **The count grows past five or six** discount types and continues to grow. The dispatch table starts feeling cluttered.
- **Strategies become stateful.** Buy-one-get-one needs to remember which item triggered the offer. Tiered discounts have thresholds. Stateful logic doesn't fit cleanly in a single function.
- **Strategies come from configuration**, not from code. A rules engine builds them at runtime from data. Now you need a real abstraction with a defined interface, because the strategies aren't all known at compile time.
- **Two implementations must coexist** — e.g., the "old" discount engine and the "new" one — for an A/B test or a migration. A common interface helps.

Until one of these is true, the dict version is the right code. *That you can name Strategy and explain why you didn't use it* is the more senior signal here.

---

#### P3.2 — Choose Between Three Approaches

You're designing a logging system for a medium-sized service. Three teammates propose three different designs:

- **Dev A:** "Use a Singleton. There's one logger for the whole app. Every module imports it and calls `logger.info(...)`."
- **Dev B:** "Use Observer. Each class emits events; the logging system subscribes and writes the ones it cares about."
- **Dev C:** "Use Dependency Injection. Every service that needs logging gets a logger passed into its constructor. Wire them up in the composition root."

For each approach, list its strengths and weaknesses for this problem. Then recommend one, with justification.

**Solution.**

**Dev A — Singleton.**

*Strengths:*
- Extremely convenient. Every module can `import logger; logger.info(...)`.
- Truly minimal ceremony. New code starts logging in one line.

*Weaknesses:*
- **Hidden global state.** Every class that uses the logger has an invisible dependency on it. You can't see, by looking at a class's constructor, that it logs.
- **Untestable.** In a test, you have to either let the real logger write to disk/network or monkey-patch the global — both ugly. Replacing the logger for one test affects every other test running in the same process.
- **Configuration is awkward.** What if one service should log at DEBUG and another at INFO? With a singleton, you have one configuration for everyone.
- **Inflexible.** Want a different logger for a feature flag, or a tenant-specific logger? Singletons don't support per-call substitution.

**Dev B — Observer.**

*Strengths:*
- Decoupled. Emitters know nothing about subscribers.
- Open to extension — new subscribers (metrics collectors, alerters) plug in without changing emitters.

*Weaknesses:*
- **Overkill for logging.** Logging isn't "many independent things reacting to events" — it's "one thing recording what happened." Observer's value is fan-out; logging is fan-in.
- **Inverts control unnecessarily.** Logging is a synchronous, well-understood operation. The class wants to say "log this." Forcing it to "emit an event" adds indirection for no benefit.
- **Debugging becomes harder.** Tracing why a particular log line appeared requires understanding the event bus. With a direct logger call, the call site *is* the answer.
- **More code, more concepts.** Event types, registration, dispatch — all just to write a line of text.

Observer is the right answer for use cases like "the order was placed; now notify inventory, billing, and email all at once." It is not the right answer for "record what's happening in this class."

**Dev C — Dependency Injection.**

*Strengths:*
- **Explicit dependencies.** A class that needs logging declares it in its constructor. Code review sees the dependency at a glance.
- **Trivially testable.** In tests, pass a `FakeLogger` that records calls. Assertions on logged content are clean and fast.
- **Per-instance configuration.** Different services can receive loggers configured differently (different levels, different sinks).
- **Flexible.** Future changes — adding context, switching from stdout to a service like Datadog — happen in the composition root, not throughout the codebase.

*Weaknesses:*
- A little more ceremony than the singleton ("I have to pass it in to every class").
- Many classes end up with `logger` as a constructor argument. Some teams find this verbose.

**Recommendation: Dev C — Dependency Injection, with a shared logger instance.**

The composition root creates *one* configured logger (or a small number, e.g., one per major subsystem) and passes it into the services that need it:

```python
# composition root
shared_logger = StructuredLogger(level="INFO", sinks=[StdoutSink(), DatadogSink()])

order_service = OrderService(db=db, notifier=notifier, logger=shared_logger)
user_service  = UserService(db=db, logger=shared_logger)
```

This captures the *practical* benefit Dev A wanted (one logger for the app, configured once) while giving you the *testability* Dev C wanted (every class accepts a logger; tests pass a fake). Best of both, none of the singleton's downsides.

The Singleton (Dev A) and Observer (Dev B) approaches each get one thing right but trade away properties — testability, explicitness, debuggability — that matter every day in a real codebase. DI gives them up for very little cost.

This problem is a useful demonstration of a broader principle: *DI is not a single solution to one problem; it's an enabling discipline.* It makes other patterns optional rather than necessary.

---

### Type 4 — Capstone Problem

*Synthesise everything from the module.*

---

#### P4.1 — Review and Improve a Ride-Hailing Service

Below is a `TripService` that has been working in production but has been generating mysterious bugs and is impossible to test. Your senior engineer asks you to do three things:

1. **Identify the issues** in the code. Name each by its anti-pattern, principle violated, or risk category.
2. **Sketch the corrected design.** What classes/responsibilities should exist?
3. **Rewrite `TripService`** applying the fixes. Annotate the rewrite with comments explaining *why* each change was made.

```python
import threading
import time

class DatabaseConnection:
    def __init__(self):
        # imagine an expensive setup: TCP handshake, auth, schema check
        time.sleep(0.5)
    def execute(self, query, params): ...
    def fetch_one(self, query, params): return {"id": 1}

class EmailService:
    def send(self, to, subject, body):
        # imagine real SMTP work
        print(f"[email] sent to {to}")


class TripService:
    """Handles creating trips, assigning drivers, calculating fares, and notifying users."""

    def __init__(self):
        # Creates its own database — every TripService creation costs 500ms.
        self.db = DatabaseConnection()
        # Drivers list, kept in memory.
        self.available_drivers = ["driver-A", "driver-B", "driver-C"]

    def create_trip(self, rider_id: str, pickup: tuple, drop: tuple) -> dict:
        # 1. Assign a driver. No locking — two simultaneous trip creations could
        #    both grab the same driver.
        if not self.available_drivers:
            raise RuntimeError("No drivers available")
        driver_id = self.available_drivers.pop(0)

        # 2. Fare calculation lives directly inside this method.
        #    Magic numbers. Hard to test without exercising the whole flow.
        distance_km = ((pickup[0] - drop[0]) ** 2 + (pickup[1] - drop[1]) ** 2) ** 0.5
        base_fare = 50
        per_km = 15
        surge = 1.2 if 17 <= time.localtime().tm_hour <= 20 else 1.0
        fare = (base_fare + distance_km * per_km) * surge

        # 3. Persistence directly on self.db — coupled to MySQL specifics.
        trip_id = f"trip-{int(time.time())}"
        self.db.execute(
            "INSERT INTO trips VALUES (?, ?, ?, ?)",
            (trip_id, rider_id, driver_id, fare),
        )

        # 4. Notification with a hard-coded EmailService instantiated inline.
        EmailService().send(
            to=f"{rider_id}@example.com",
            subject="Trip confirmed",
            body=f"Your trip {trip_id} with {driver_id} costs ₹{fare:.2f}",
        )

        return {"trip_id": trip_id, "driver": driver_id, "fare": fare}
```

**Solution.**

**1. Issues identified:**

| # | Issue | Category |
|---|---|---|
| A | `TripService.__init__` creates its own `DatabaseConnection`. The 500ms setup runs every time. Untestable without a real DB. | Dependency Inversion violation; no seams for tests. |
| B | `EmailService()` is constructed inline inside `create_trip`. Each notification creates a new service instance, untestable, hard-coded to email. | DIP violation; tight coupling to a concrete implementation. |
| C | `available_drivers.pop(0)` is a check-then-act with no locking. Two concurrent trips could both pop the same driver. | Race condition / thread-safety bug. |
| D | Fare calculation is inlined inside `create_trip` with magic numbers and a hidden surge-pricing rule. Cannot be tested in isolation. | Single Responsibility violation + Anemic Domain (fare logic belongs on a `FarePolicy`). |
| E | `TripService` knows about: drivers list management, fare formulas, database SQL, email content, and trip creation. Many reasons to change. | God Class smell (forming, not yet full). |
| F | `EmailService` is a hard dependency. The system can never use SMS, push notifications, or no notification at all (e.g., in tests). | DIP violation. |
| G | No abstraction over notifications — assumes email is the only channel. | Open/Closed violation. |

**2. Sketch of the corrected design.**

```
┌──────────────────────────────────────────────────────────────────┐
│ composition root (main.py)                                       │
│   - creates DB connection, FarePolicy, DriverPool, Notifier,    │
│     and wires them into TripService                              │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │      TripService        │
              │  (orchestrates only)    │
              └─────┬───────┬────────┬──┘
                    │       │        │
        ┌───────────▼─┐  ┌──▼─────┐ ┌▼──────────────┐
        │ DriverPool  │  │ Fare-  │ │  Notifier     │
        │ (thread-    │  │ Policy │ │  (Protocol)   │
        │  safe)      │  │        │ │               │
        └─────────────┘  └────────┘ └───────────────┘
                                          ▲
                              ┌───────────┼───────────┐
                              │ EmailNotifier  SMSNotifier  ...
```

Roles:
- **`TripService`** orchestrates. It does not own DB connections, drivers, or fare rules — it composes them.
- **`DriverPool`** owns the available-drivers list with thread-safe acquire/release.
- **`FarePolicy`** (or `FareCalculator`) is the unit-testable home of fare logic. The surge rule lives here too, with its own dependency (a `Clock`) so it can be tested.
- **`TripRepository`** wraps DB writes — the service depends on the repository, not on SQL.
- **`Notifier`** is a `Protocol`. Concrete implementations: `EmailNotifier`, `SMSNotifier`, and `NullNotifier` for tests.

**3. Rewritten `TripService`:**

```python
import threading
import time
from dataclasses import dataclass
from typing import Protocol


# ---------- Contracts ----------
class Clock(Protocol):
    def hour(self) -> int: ...

class FarePolicy(Protocol):
    def calculate(self, pickup: tuple, drop: tuple) -> float: ...

class TripRepository(Protocol):
    def save(self, trip: "Trip") -> None: ...

class Notifier(Protocol):
    def notify(self, to: str, subject: str, body: str) -> None: ...


# ---------- Domain object ----------
@dataclass(frozen=True)
class Trip:
    """A trip is a value object — once issued, its facts don't change."""
    trip_id: str
    rider_id: str
    driver_id: str
    fare: float


# ---------- Thread-safe driver pool ----------
class DriverPool:
    """
    Owns the available-drivers list. Thread-safe acquire/release so that
    two concurrent trip-creations can never claim the same driver.
    """
    def __init__(self, drivers: list[str]):
        self._drivers = list(drivers)         # defensive copy
        self._lock = threading.Lock()

    def acquire(self) -> str:
        # Compound check-then-act is wrapped in a single critical section.
        # Removing this lock reintroduces the original race.
        with self._lock:
            if not self._drivers:
                raise RuntimeError("No drivers available")
            return self._drivers.pop(0)

    def release(self, driver_id: str) -> None:
        with self._lock:
            self._drivers.append(driver_id)


# ---------- Fare policy ----------
class StandardFarePolicy:
    """
    Encapsulates fare calculation. Lives outside TripService so it can be
    tested independently — given pickup/drop and a clock, it produces a
    fare. No I/O, no global state.
    """
    BASE_FARE = 50.0
    PER_KM = 15.0
    SURGE_MULTIPLIER = 1.2
    SURGE_START_HOUR = 17
    SURGE_END_HOUR = 20

    def __init__(self, clock: Clock):
        # The clock is injected so tests can pretend it's 6pm without waiting.
        self.clock = clock

    def calculate(self, pickup: tuple, drop: tuple) -> float:
        distance_km = ((pickup[0] - drop[0]) ** 2 + (pickup[1] - drop[1]) ** 2) ** 0.5
        fare = self.BASE_FARE + distance_km * self.PER_KM
        if self.SURGE_START_HOUR <= self.clock.hour() <= self.SURGE_END_HOUR:
            fare *= self.SURGE_MULTIPLIER
        return fare


# ---------- The orchestrator ----------
class TripService:
    """
    Orchestrates a trip creation. Owns no drivers, no fare formulas,
    no SQL. Composes collaborators that do.
    """

    def __init__(
        self,
        driver_pool: DriverPool,
        fare_policy: FarePolicy,
        trip_repo: TripRepository,
        notifier: Notifier,
    ):
        # All dependencies arrive via the constructor — no hidden creation.
        # Every collaborator can be swapped (real DB ↔ fake, email ↔ null) in tests.
        self.driver_pool = driver_pool
        self.fare_policy = fare_policy
        self.trip_repo = trip_repo
        self.notifier = notifier

    def create_trip(self, rider_id: str, pickup: tuple, drop: tuple) -> Trip:
        # 1. Acquire a driver atomically (race-free thanks to DriverPool's lock).
        driver_id = self.driver_pool.acquire()

        try:
            # 2. Fare logic delegated entirely to the policy.
            fare = self.fare_policy.calculate(pickup, drop)

            # 3. Persistence delegated to the repository.
            trip = Trip(
                trip_id=f"trip-{int(time.time() * 1000)}",
                rider_id=rider_id,
                driver_id=driver_id,
                fare=fare,
            )
            self.trip_repo.save(trip)

            # 4. Notification through the injected Notifier — could be email,
            #    SMS, push, or a null notifier in tests.
            self.notifier.notify(
                to=rider_id,
                subject="Trip confirmed",
                body=f"Trip {trip.trip_id} with driver {driver_id} costs ₹{fare:.2f}",
            )

            return trip

        except Exception:
            # If anything after the driver acquire fails, return the driver to the pool.
            # Without this, a failure during save/notify would leak the driver forever.
            self.driver_pool.release(driver_id)
            raise
```

**Composition root (production wiring):**

```python
# main.py
class SystemClock:
    def hour(self) -> int:
        return time.localtime().tm_hour

class MySQLTripRepo:
    def __init__(self, conn): self.conn = conn
    def save(self, trip: Trip) -> None:
        self.conn.execute(
            "INSERT INTO trips (id, rider_id, driver_id, fare) VALUES (?, ?, ?, ?)",
            (trip.trip_id, trip.rider_id, trip.driver_id, trip.fare),
        )

class EmailNotifier:
    def __init__(self, email_service): self.email = email_service
    def notify(self, to, subject, body):
        self.email.send(f"{to}@example.com", subject, body)


db = DatabaseConnection()                                     # built once
service = TripService(
    driver_pool=DriverPool(["driver-A", "driver-B", "driver-C"]),
    fare_policy=StandardFarePolicy(clock=SystemClock()),
    trip_repo=MySQLTripRepo(conn=db),
    notifier=EmailNotifier(email_service=EmailService()),
)
```

**Test wiring (same `TripService`, different collaborators):**

```python
class FakeClock:
    def __init__(self, hour): self._hour = hour
    def hour(self): return self._hour

class InMemoryTripRepo:
    def __init__(self): self.saved = []
    def save(self, trip): self.saved.append(trip)

class FakeNotifier:
    def __init__(self): self.sent = []
    def notify(self, to, subject, body): self.sent.append((to, subject, body))


def test_create_trip_at_surge_hour_uses_surge_pricing():
    pool = DriverPool(["driver-1"])
    repo = InMemoryTripRepo()
    notifier = FakeNotifier()
    service = TripService(
        driver_pool=pool,
        fare_policy=StandardFarePolicy(clock=FakeClock(hour=18)),  # surge hour
        trip_repo=repo,
        notifier=notifier,
    )

    trip = service.create_trip("rider-1", pickup=(0, 0), drop=(10, 0))

    # 10km * 15 = 150 base + 50 = 200, * 1.2 surge = 240.0
    assert trip.fare == 240.0
    assert trip.driver_id == "driver-1"
    assert repo.saved == [trip]
    assert notifier.sent[0][0] == "rider-1"


test_create_trip_at_surge_hour_uses_surge_pricing()
print("✓ test passed")
```

**Summary of what was changed and why:**

- **DI for every dependency.** The constructor declares everything `TripService` needs. No hidden creation. The same service can be wired with real or fake collaborators. (Fixes issues A, B, F.)
- **Thread-safe driver pool.** A dedicated `DriverPool` class owns the list and serialises access with a lock. The driver-assignment race is eliminated. (Fixes issue C.)
- **Fare policy extracted.** `StandardFarePolicy` is a small, focused class with its own injectable clock. It's directly unit-testable — give it coordinates and a clock, get a fare. The surge rule is named and documented, not hidden inside a method. (Fixes issues D, G.)
- **Repository pattern.** `TripService` doesn't write SQL. It delegates to a `TripRepository`. Swap MySQL for Postgres or an in-memory store without changing the service. (Decouples from infrastructure.)
- **`Notifier` is a Protocol.** Email is now one possible notifier. SMS, push, and a null-notifier-for-tests can be plugged in without changing the service. (Fixes issue G.)
- **`Trip` is a frozen dataclass.** A trip's facts are immutable once issued. Returning a `Trip` is more useful than returning a dict and gives downstream code a typed object to reason about.
- **Driver leak on error is fixed.** The try/except in `create_trip` ensures that if the save or notification fails, the driver is released — not left "in use" forever.

The refactored `TripService` orchestrates collaborators rather than doing all the work itself. Each collaborator has a single responsibility, a single reason to change, and a clear test surface. This is the entire module's content — thread safety, DI, anti-pattern avoidance, and design judgment — applied together to one realistic problem.

---

You're now equipped with the design vocabulary, the testing seams, the concurrency awareness, and (most importantly) the *restraint* that separates an engineer who knows patterns from one who designs systems. The remaining modules — Case Studies, Testing — build on this foundation.

---

*This content is part of **Codeverra** — a platform for learning coding, data science, DSA, and AI from scratch.*
*Explore more: [https://codeverra.com](https://codeverra.com)*
