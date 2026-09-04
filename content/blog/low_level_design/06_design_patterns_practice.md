---
title: "Design Patterns: Practice Workbook"
description: "Hands-on design pattern practice problems to prove you understand creational, structural, and behavioral patterns."

date: 2026-09-09
lastmod: 2026-09-09
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - lld
  - design-patterns
  - python

cover:
  image: "/images/LLD - 6.png"
  alt: "Design Patterns Practice"
  caption: "Design Patterns: Practice Workbook"
  relative: true
  hidden: false
---

# Design Patterns — Practice Workbook

> **Who this is for:** Anyone who has worked through the three teaching files — `03_design_patterns_creational.md`, `04_design_patterns_structural.md`, and `05_design_patterns_behavioral.md` — and now wants to *prove they actually understand* by solving problems independently.

---

## Table of Contents

1. [Preface — How to Use This Workbook](#preface)
2. [Section 1 — Creational Patterns Practice](#section-1--creational-patterns-practice)
   - [Problem 1.1 — Application Configuration (Level 1)](#problem-11--application-configuration-level-1)
   - [Problem 1.2 — Document Export Flow (Level 1)](#problem-12--document-export-flow-level-1)
   - [Problem 1.3 — Food Delivery Order (Level 2)](#problem-13--food-delivery-order-level-2)
   - [Problem 1.4 — Game Enemy Spawning (Level 2)](#problem-14--game-enemy-spawning-level-2)
   - [Problem 1.5 — Cloud Environment Configurations (Level 3)](#problem-15--cloud-environment-configurations-level-3)
3. [Section 2 — Structural Patterns Practice](#section-2--structural-patterns-practice)
   - [Problem 2.1 — Third-Party Payment SDK (Level 1)](#problem-21--third-party-payment-sdk-level-1)
   - [Problem 2.2 — Coffee Shop Pricing (Level 2)](#problem-22--coffee-shop-pricing-level-2)
   - [Problem 2.3 — Smart Home Scenes (Level 2)](#problem-23--smart-home-scenes-level-2)
   - [Problem 2.4 — Library Book Database (Level 2)](#problem-24--library-book-database-level-2)
   - [Problem 2.5 — File System with Virtual Files (Level 3)](#problem-25--file-system-with-virtual-files-level-3)
   - [Problem 2.6 — UI Rendering Across Platforms (Level 3)](#problem-26--ui-rendering-across-platforms-level-3)
4. [Section 3 — Behavioural Patterns Practice](#section-3--behavioural-patterns-practice)
   - [Problem 3.1 — Stock Price Monitor (Level 1)](#problem-31--stock-price-monitor-level-1)
   - [Problem 3.2 — E-commerce Shipping (Level 1)](#problem-32--e-commerce-shipping-level-1)
   - [Problem 3.3 — Text Editor Undo/Redo (Level 2)](#problem-33--text-editor-undoredo-level-2)
   - [Problem 3.4 — Vending Machine (Level 2)](#problem-34--vending-machine-level-2)
   - [Problem 3.5 — Order Validation Pipeline (Level 2)](#problem-35--order-validation-pipeline-level-2)
   - [Problem 3.6 — News Aggregator (Level 3)](#problem-36--news-aggregator-level-3)
   - [Problem 3.7 — Chess Engine (Level 3)](#problem-37--chess-engine-level-3)
5. [Section 4 — Combination Problems: Multiple Patterns Together](#section-4--combination-problems-multiple-patterns-together)
   - [Problem 4.1 — Ride-Sharing App (Level 3)](#problem-41--ride-sharing-app-level-3)
   - [Problem 4.2 — Hotel Booking Platform (Level 3)](#problem-42--hotel-booking-platform-level-3)
   - [Problem 4.3 — Notification Service (Level 3)](#problem-43--notification-service-level-3)
   - [Problem 4.4 — Document Management System (Level 3 — Hardest)](#problem-44--document-management-system-level-3--hardest)
6. [Section 5 — Anti-Pattern Traps: When NOT to Use a Pattern](#section-5--anti-pattern-traps-when-not-to-use-a-pattern)
   - [Problem 5.1 — A Simple CSV Script](#problem-51--a-simple-csv-script)
   - [Problem 5.2 — TemperatureConverter](#problem-52--temperatureconverter)
   - [Problem 5.3 — Internal Bulk-Rename Tool](#problem-53--internal-bulk-rename-tool)
7. [Summary — Pattern Selection Reference Card](#summary--pattern-selection-reference-card)

---

## Preface

You've read the three teaching files. Each one *gave you* the pattern: "Here is Observer, here is what it solves, here is the example." Reading those files makes you familiar with patterns. It does not make you good at using them.

**This workbook is different.** Every problem here is a *scenario without a hint*. The pattern is not named. You have to read the requirements, decide which pattern fits (if any), design the classes, justify your decisions, and implement the solution. *That is the actual skill* — the one tested in interviews and the one used at work.

### How to use this workbook — the contract

1. **Read the scenario. Stop.** Do not scroll to the solution.
2. **Spend 2–3 minutes thinking:**
   - Which pattern do you think applies?
   - What are the key classes and interfaces?
   - In two sentences: why?
3. **Sketch your design** — on paper or a whiteboard. Even a quick list of class names is enough.
4. **Then** read the solution. Compare your reasoning to the walkthrough. The goal is not to match exactly. The goal is to *understand where your reasoning differed and why*.
5. **Run the extensibility check at the end of every solution.** It is the proof. Mentally ask: "if I add X, what changes?" That answer is how you know whether the design is good.

### What every Level 2/3 solution contains

- **Recognition** — what pain in the scenario points to this pattern? What would go wrong without it?
- **The wrong approach first** — the naive design you'd reach for. Why it falls apart.
- **Design Decisions** — why these classes, why these interfaces, why these relationships. What were the alternatives and why were they rejected?
- **Full Python implementation** — complete, runnable, commented code.
- **Extensibility check** — "now add a new variant. How many existing files change?"
- **Pattern reveal** — the pattern name and a one-paragraph note on when *not* to use it.

A learner who works every problem in this file — covering the solution, attempting it, comparing — finishes interview-ready. There are no shortcuts. The reps are the point.

---

## Section 1 — Creational Patterns Practice

Five problems. Problems 1.1–1.3 are single-pattern. Problem 1.4 touches one pattern with subtleties around shallow vs. deep copying. Problem 1.5 combines two creational patterns.

---

### Problem 1.1 — Application Configuration (Level 1)

**Scenario.** A Python web application needs a configuration system. The app reads from a JSON file at startup. Various modules — the database layer, the email service, the feature-flag service — all need access to the same configuration. When the app runs in production, the config should be loaded **exactly once** and never reloaded. When the app is tested, a different config (pointing to test infrastructure) should be loadable.

**What you must produce:**
1. The class design with reasoning.
2. Full implementation.
3. A test showing that two different modules get *the same* config object.
4. An explanation of why this beats a plain module-level variable.

---

#### Solution

##### Recognition

The pain points spelled out:

- *"All modules need access to the same config"* → there must be one canonical instance.
- *"Loaded exactly once"* → not re-loaded on each access; cached after first load.
- *"Replaceable in tests"* → there must be a way to reset or override it.

This is the **Singleton** pattern. One instance, globally accessible, created lazily, controllable in tests.

##### The naive alternative — and why it's not quite enough

You might say: "Just use a module-level variable."

```python
# config.py
import json
config = json.load(open("settings.json"))   # loaded once at import
```

That works… until it doesn't:

- **Reset between tests is awkward.** You'd have to reload the module or reach into its globals.
- **Lazy loading is impossible.** The JSON file is read at import time, even if the test never touches the config.
- **No interface.** You can't add validation, defaulting, or environment overlays without it getting messy.

Singleton with a class gives you all of these for very little code.

##### The implementation — thread-safe, lazy, testable

```python
import json
import threading
from typing import Any, Optional


class Config:
    """
    Application-wide configuration. Loaded once on first access.
    Thread-safe via double-checked locking.
    """

    _instance: Optional["Config"] = None
    _lock = threading.Lock()

    def __init__(self, source_path: str):
        # NOTE: This constructor is only invoked by `get_instance`.
        # Calling Config(...) directly skips the singleton check.
        # We allow it so tests can build isolated configs.
        with open(source_path) as f:
            self._values: dict = json.load(f)

    # -----------------------------------------------------------
    # The canonical accessor
    # -----------------------------------------------------------
    @classmethod
    def get_instance(cls, source_path: str = "settings.json") -> "Config":
        if cls._instance is None:                # 1st check (cheap, no lock)
            with cls._lock:
                if cls._instance is None:        # 2nd check (under lock)
                    cls._instance = cls(source_path)
        return cls._instance

    # -----------------------------------------------------------
    # Reading values
    # -----------------------------------------------------------
    def get(self, key: str, default: Any = None) -> Any:
        return self._values.get(key, default)

    # -----------------------------------------------------------
    # Test hooks (deliberately exposed)
    # -----------------------------------------------------------
    @classmethod
    def reset_for_tests(cls) -> None:
        """Clear the cached instance so tests can install a fresh one."""
        with cls._lock:
            cls._instance = None

    @classmethod
    def install_for_tests(cls, values: dict) -> "Config":
        """Inject a pre-built config without touching disk."""
        with cls._lock:
            cls._instance = cls.__new__(cls)
            cls._instance._values = values
            return cls._instance
```

##### Why double-checked locking?

A single check (`if cls._instance is None: cls._instance = cls(...)`) is racy: two threads can both pass the check and both create instances. Wrapping the whole accessor in a lock is correct but slow — every read goes through the lock. Double-checked locking is the standard middle ground: the cheap check skips the lock 99% of the time; the lock catches the race only on the very first hit.

##### Proving it works

```python
# In two different modules:
def database_module():
    cfg = Config.get_instance()
    return cfg.get("database_url")


def email_module():
    cfg = Config.get_instance()
    return cfg.get("smtp_host")


def test_modules_see_same_object():
    Config.reset_for_tests()
    Config.install_for_tests({
        "database_url": "sqlite:///:memory:",
        "smtp_host": "localhost",
    })

    assert Config.get_instance() is Config.get_instance()   # same object
    assert database_module() == "sqlite:///:memory:"
    assert email_module() == "localhost"
```

The `is` check (not `==`) is what proves singleton-ness.

##### Extensibility check

*Add support for environment-specific configs (dev/staging/prod).* Add a classmethod:

```python
@classmethod
def load_for_env(cls, env: str) -> "Config":
    return cls.get_instance(f"settings.{env}.json")
```

No existing line of `Config` changes. The singleton guarantee still holds (one instance once chosen).

##### Pattern reveal — and when *not* to use it

**Singleton.** Use it when:

- There is genuinely one instance for the whole process (config, logger, connection pool).
- Tests can swap or reset it cleanly.

**Don't** use it when:

- You're using it to *share state* between unrelated parts of the code that "happen" to want the same data. That's hidden global state with a polite costume. Pass things through constructors (Dependency Injection) instead.
- You think you need one instance "for now" but might need many later. Singletons are very hard to un-Singleton once code depends on the global access pattern.

---

### Problem 1.2 — Document Export Flow (Level 1)

**Scenario.** A document editor exports to multiple formats: PDF, DOCX, and HTML. The export process always follows the same three steps in the same order:

1. Prepare the content (e.g., flatten nested formatting).
2. Format it (apply the format-specific layout).
3. Write the output file.

Each format performs each step *differently*, but the *order* never changes. The editor should be able to support a new format (say, EPUB) without touching the core export flow.

**What you must produce:**
1. The class hierarchy.
2. Full implementation of the export flow and at least two concrete exporters.
3. Proof that adding EPUB requires zero changes to existing classes.

---

#### Solution

##### Recognition

Two phrases in the scenario are the clue:

- *"The export process always follows the same steps in the same order"* → the *algorithm skeleton is fixed*.
- *"Each format does each step differently"* → the *steps vary by subclass*.

When the **skeleton is fixed but the steps vary**, the pattern is **Template Method**. The base class implements the unchangeable algorithm (the `export()` method that calls prepare → format → write); subclasses implement the variable steps.

Note that this overlaps with **Factory Method** when one of the "steps" is "create the right object" — many sources show this scenario as Factory Method. The two are siblings: Template Method controls the *flow*, Factory Method controls *which object the flow uses*. We'll see both interpretations and pick Template Method because the brief emphasises *the flow itself* being fixed, not the *object that does the work*.

##### The naive alternative — and why it fails

```python
class Exporter:
    def export(self, doc, format_type: str, output_path: str):
        if format_type == "pdf":
            content = self._prepare_pdf(doc)
            formatted = self._format_pdf(content)
            self._write_pdf(formatted, output_path)
        elif format_type == "docx":
            content = self._prepare_docx(doc)
            formatted = self._format_docx(content)
            self._write_docx(formatted, output_path)
        elif format_type == "html":
            ...
```

The problems:
- Every new format = an `elif` branch + three new methods on the same class.
- The "flow" is duplicated three times. A change to the flow (say, adding a validation step) must be made in three places.
- Adding EPUB requires editing this class — OCP violation.

##### The Template Method implementation

```python
from abc import ABC, abstractmethod


class DocumentExporter(ABC):
    """
    Fixed export algorithm. Subclasses fill in the variable steps.
    """

    def export(self, document, output_path: str) -> None:
        """
        Template method. NEVER override this in subclasses.
        It defines the algorithm; subclasses only customise the steps.
        """
        prepared = self._prepare(document)
        formatted = self._format(prepared)
        self._write(formatted, output_path)
        # If we later add an audit-log step or a pre-validation step,
        # it goes here, and EVERY format gets it for free.

    # -----------------------------------------------------------
    # The "primitive operations" — abstract steps
    # -----------------------------------------------------------
    @abstractmethod
    def _prepare(self, document):
        """Flatten / normalise / pre-process the input."""
        ...

    @abstractmethod
    def _format(self, prepared):
        """Apply this format's specific layout."""
        ...

    @abstractmethod
    def _write(self, formatted, output_path: str) -> None:
        """Persist to disk in this format."""
        ...


# ---------------------------------------------------------------
# Two concrete exporters
# ---------------------------------------------------------------
class PdfExporter(DocumentExporter):
    def _prepare(self, document):
        # Strip features PDF can't represent (e.g., live form fields).
        return {"text": document.text, "images": document.images}

    def _format(self, prepared):
        # Pretend we lay out pages here using reportlab or similar.
        return f"%PDF-1.7\n[pages of {prepared}]"

    def _write(self, formatted, output_path):
        with open(output_path, "wb") as f:
            f.write(formatted.encode())


class HtmlExporter(DocumentExporter):
    def _prepare(self, document):
        # HTML can keep nested structure, but escape special chars.
        return document.text.replace("<", "&lt;")

    def _format(self, prepared):
        return f"<html><body>{prepared}</body></html>"

    def _write(self, formatted, output_path):
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(formatted)
```

##### Adding EPUB — the extensibility check

```python
class EpubExporter(DocumentExporter):
    def _prepare(self, document):
        # Chunk into chapters.
        return document.split_into_chapters()

    def _format(self, prepared):
        # Build OPF + spine XML.
        return _build_epub_package(prepared)

    def _write(self, formatted, output_path):
        # Write zip archive with the right MIME header.
        _zip_epub(formatted, output_path)
```

Lines changed in existing files: **zero.** The flow in `DocumentExporter.export()` is unchanged. `PdfExporter` and `HtmlExporter` are unchanged. The system is open for extension, closed for modification.

##### Pattern reveal — and the Factory Method distinction

**Template Method.** Use it when:

- A fixed sequence of steps must run for every variant.
- The variation is at the *step* level, not the *result* level.

**Why this is Template Method, not Abstract Factory.** Abstract Factory creates *families of related products that must be compatible* (e.g., a PDF formatter AND a PDF font loader AND a PDF metadata handler that all must agree on PDF conventions). Here we have one thing — an exporter — that internally varies its steps. That is one type of thing, not a family of related types. Template Method is the right tool.

If the brief had said *"each export format needs a Formatter, a FontLoader, and a MetadataWriter that must all match — PDF formatter cannot mix with HTML font loader"* — then Abstract Factory would be the right answer. We're not there.

---

### Problem 1.3 — Food Delivery Order (Level 2)

**Scenario.** A food delivery platform creates delivery orders. An order has:

- **Required:** customer details, delivery address, list of items.
- **Optional:** payment method (defaults to cash on delivery), special instructions, scheduled time, priority level (defaults to "normal"), corporate-invoice flag.

The order construction also runs validations:

- Delivery address must lie inside the delivery zone.
- Items list cannot be empty.
- If priority is `"express"`, scheduled time must be within 2 hours from now.

Developers have complained that `Order(customer, address, items, None, None, "normal", True, False, ...)` is unreadable and error-prone.

**What you must produce:**
1. Class design with a builder.
2. Full implementation with validation that runs at `build()` time.
3. Three different order-creation examples showing readability.
4. A comparison with the obvious alternative — "why not just use keyword arguments?"

---

#### Solution

##### Recognition

A constructor with seven arguments, half of them optional, is fragile. Two things are going wrong at once:

1. **Readability collapses** as positional arguments grow. Reading `Order(c, a, i, None, None, "normal", True, False)` requires the reader to memorise the argument order.
2. **Cross-field validation** ("if priority is express, scheduled_time must be within 2h") doesn't fit inside `__init__` cleanly — at construction, half the fields might not be set yet.

This is the **Builder** pattern. A builder is a small companion class that accumulates configuration through method calls and then produces the final object — usually with full validation — in a `build()` step.

##### Why not just keyword arguments?

`Order(customer=c, address=a, items=i, scheduled_time=t)` is readable. So why a builder?

The keyword-argument approach works *for simple construction*. It falls short when:

- **Cross-field validation** is non-trivial — `__post_init__` works but mixes validation rules into the dataclass.
- **Conditional configuration** is needed — "if corporate invoice, GST number is required" reads naturally as `.with_corporate_invoice(gst)` and clumsily as constructor logic.
- **A fluent, readable API** is wanted at the call site, especially when most callers use only 2–3 of the optional fields and writing `field4=None, field5=None, field6=None` to skip to `field7` is awkward.
- **Stepwise construction** — adding items one at a time during a checkout UI flow — is natural with a builder, awkward with kwargs.

For a 3-field object: use kwargs. For a 7-field object with cross-field validation and stepwise construction: use a builder.

##### The implementation

```python
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Optional


# ---------------------------------------------------------------
# The product: a frozen dataclass.
# Frozen makes it immutable once built.
# ---------------------------------------------------------------
@dataclass(frozen=True)
class Order:
    customer: str
    address: str
    items: List[str]
    payment_method: str = "cash"
    special_instructions: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    priority: str = "normal"
    corporate_gst: Optional[str] = None


# ---------------------------------------------------------------
# The builder: accumulates state, validates on build().
# ---------------------------------------------------------------
class OrderBuilder:
    """
    Fluent construction for Order.
    Required fields are constructor arguments of the builder itself,
    so you cannot forget them. Optional fields are setter methods.
    """

    DELIVERY_ZONES = {"Patna", "Delhi", "Mumbai"}  # demo data

    def __init__(self, customer: str, address: str, items: List[str]):
        # Required fields are HERE — the builder cannot be instantiated
        # without them. This is the type system enforcing requiredness.
        self._customer = customer
        self._address = address
        self._items = list(items)

        # Optional state — sensible defaults.
        self._payment = "cash"
        self._instructions: Optional[str] = None
        self._scheduled: Optional[datetime] = None
        self._priority = "normal"
        self._corporate_gst: Optional[str] = None

    # ---------- Fluent setters ----------
    def with_payment(self, method: str) -> "OrderBuilder":
        self._payment = method
        return self                     # ← enables chaining

    def with_special_instructions(self, text: str) -> "OrderBuilder":
        self._instructions = text
        return self

    def with_scheduled_time(self, when: datetime) -> "OrderBuilder":
        self._scheduled = when
        return self

    def with_priority(self, level: str) -> "OrderBuilder":
        if level not in {"normal", "express"}:
            raise ValueError(f"Unknown priority: {level}")
        self._priority = level
        return self

    def with_corporate_invoice(self, gst_number: str) -> "OrderBuilder":
        if not gst_number or len(gst_number) != 15:
            raise ValueError("GST number must be 15 chars")
        self._corporate_gst = gst_number
        return self

    # ---------- The validation gate ----------
    def build(self) -> Order:
        # 1. Single-field validations
        if not self._items:
            raise ValueError("Order must have at least one item")
        if self._address.split(",")[-1].strip() not in self.DELIVERY_ZONES:
            raise ValueError(f"Address not in delivery zone: {self._address}")

        # 2. Cross-field validations
        if self._priority == "express":
            if self._scheduled is None:
                raise ValueError("Express orders need a scheduled_time")
            if self._scheduled - datetime.now() > timedelta(hours=2):
                raise ValueError("Express orders must be within 2 hours")

        # 3. Construct the immutable Order
        return Order(
            customer=self._customer,
            address=self._address,
            items=self._items,
            payment_method=self._payment,
            special_instructions=self._instructions,
            scheduled_time=self._scheduled,
            priority=self._priority,
            corporate_gst=self._corporate_gst,
        )
```

##### Three call sites — see how readable each becomes

```python
# 1. The simplest possible order
order = OrderBuilder(
    customer="C001",
    address="42 MG Road, Patna",
    items=["Pizza", "Coke"],
).build()

# 2. A scheduled order with instructions
order = (
    OrderBuilder("C001", "42 MG Road, Patna", ["Pizza"])
    .with_scheduled_time(datetime.now() + timedelta(hours=1))
    .with_special_instructions("Ring doorbell twice")
    .build()
)

# 3. An express order paid by UPI
order = (
    OrderBuilder("C002", "5 Park St, Mumbai", ["Burger", "Fries"])
    .with_priority("express")
    .with_scheduled_time(datetime.now() + timedelta(minutes=30))
    .with_payment("upi")
    .build()
)
```

Each `with_*` method's *name* tells you what's being set. Compare that to `Order("C002", "5 Park St", ["Burger"], None, None, datetime.now()+..., "express", None)` — six positional `None`s and you've lost the will to live.

##### Extensibility check

Marketing wants a **corporate invoice** feature with a GST number. We already added `with_corporate_invoice(gst)` above — adding it was *one method on the builder*. No existing call site breaks (the builder method is optional). No other class touches it. That's the win.

##### Pattern reveal — Builder, and the alternatives

**Builder.** Use it when:

- The object has many fields, several optional.
- Construction needs validation that crosses field boundaries.
- Stepwise / fluent construction reads more naturally than a giant constructor call.

**Don't** use Builder for 2- or 3-field objects. A `dataclass` with keyword arguments is simpler. The Builder pattern is a *response to construction complexity*; without that complexity, it is overhead.

---

### Problem 1.4 — Game Enemy Spawning (Level 2)

**Scenario.** A game has enemy units: Warriors, Archers, Mages. Each enemy type has a base configuration — health, attack, speed, list of abilities. During gameplay, the engine spawns enemies very quickly — often by tweaking a pre-configured *template* enemy (e.g., a slightly stronger Warrior for a boss room). Constructing each enemy from scratch is slow because it involves loading textures, computing initial stats, allocating ability objects.

**What you must produce:**
1. Design supporting templates and fast cloning.
2. Python implementation using the `copy` module — and explaining shallow vs. deep copy.
3. A scenario where shallow copy creates a bug, and the fix.
4. A registry that stores named templates.

---

#### Solution

##### Recognition

Two signals:

- *"Creating an enemy from scratch is slow"* — performance pressure on construction.
- *"Often by tweaking a pre-configured template"* — the new object is almost the same as an existing one.

When new objects are nearly identical to existing ones, **Prototype** is the pattern. You build expensive *templates* once. Each spawn *clones* the template and tweaks a few fields.

##### The naive alternative

```python
def spawn_warrior():
    w = Warrior()
    w.load_textures()            # slow
    w.compute_initial_stats()    # slow
    w.attach_abilities()         # slow
    return w
```

Calling this in a tight loop costs you a frame budget. Prototype trades that for a one-time setup cost and then very cheap clones.

##### The implementation

```python
import copy
from dataclasses import dataclass, field
from typing import Dict, List


# ---------------------------------------------------------------
# A simple enemy. In a real game these would have heavy state.
# ---------------------------------------------------------------
@dataclass
class Enemy:
    name: str
    health: int
    attack: int
    speed: int
    abilities: List[str] = field(default_factory=list)

    def clone(self) -> "Enemy":
        """
        Deep copy is mandatory here. `abilities` is a list — a mutable
        object. A shallow copy would share the SAME list between every
        clone, which is the bug we walk through next.
        """
        return copy.deepcopy(self)


# ---------------------------------------------------------------
# The registry — keeps named templates ready to clone
# ---------------------------------------------------------------
class EnemyRegistry:
    def __init__(self):
        self._templates: Dict[str, Enemy] = {}

    def register(self, name: str, template: Enemy) -> None:
        self._templates[name] = template

    def spawn(self, name: str) -> Enemy:
        if name not in self._templates:
            raise KeyError(f"Unknown enemy template: {name}")
        # Cloning is the fast path. The template's expensive setup
        # cost was paid once when register() was called.
        return self._templates[name].clone()


# ---------------------------------------------------------------
# Loading the registry once at game start
# ---------------------------------------------------------------
def build_registry() -> EnemyRegistry:
    reg = EnemyRegistry()

    reg.register("basic_warrior", Enemy(
        name="Warrior",
        health=100,
        attack=15,
        speed=5,
        abilities=["slash"],
    ))

    reg.register("basic_archer", Enemy(
        name="Archer",
        health=70,
        attack=12,
        speed=8,
        abilities=["arrow_shot"],
    ))

    reg.register("basic_mage", Enemy(
        name="Mage",
        health=60,
        attack=20,
        speed=4,
        abilities=["fireball"],
    ))

    return reg
```

##### The shallow-vs-deep copy bug — explicitly

Suppose we'd used `copy.copy` (shallow) instead of `copy.deepcopy`:

```python
import copy

class BuggyEnemy:
    def __init__(self, name, abilities):
        self.name = name
        self.abilities = abilities

    def clone(self):
        return copy.copy(self)     # ← shallow


# Demo:
template = BuggyEnemy("Warrior", ["slash"])
clone1 = template.clone()
clone2 = template.clone()

clone1.abilities.append("counter_attack")
print(clone2.abilities)
# Output: ['slash', 'counter_attack']      ← !!
print(template.abilities)
# Output: ['slash', 'counter_attack']      ← template corrupted too
```

All three objects share the *same* `abilities` list. Modifying one mutates them all. In a game, this surfaces as "I added counter_attack to my boss Warrior — now every Warrior in every room has it."

The fix is `copy.deepcopy`, which recursively duplicates all nested mutable objects. The cost is a little extra time per clone, but it's still *much* faster than constructing from scratch (no asset loading, no stat computation, no ability-system registration).

##### Using the registry — and tweaking

```python
registry = build_registry()

# Standard spawn
goblin = registry.spawn("basic_warrior")
print(goblin.health)   # 100

# Boss spawn — clone and tweak
boss = registry.spawn("basic_warrior")
boss.name = "Warrior King"
boss.health = 500
boss.abilities.append("ground_slam")

# Confirm the template is untouched
template_warrior = registry.spawn("basic_warrior")
assert template_warrior.health == 100
assert "ground_slam" not in template_warrior.abilities
```

##### Extensibility check

A new enemy type — a `Necromancer` — is one new `Enemy(...)` registration. The registry, the clone method, every existing enemy: unchanged.

##### Pattern reveal — Prototype, and an aside

**Prototype.** Use it when:

- Construction is expensive (asset loading, stat computation, network calls).
- New instances are nearly identical to existing ones.
- You want to configure templates *declaratively* (in data) rather than imperatively (in code).

**An aside on Python.** Prototype is less common in Python than in Java or C++, because most Python objects are cheap to construct. The pattern remains valuable specifically when "cheap construction" is a lie — heavy I/O, expensive computation, or pre-loaded asset references hidden in the constructor.

---

### Problem 1.5 — Cloud Environment Configurations (Level 3)

**Scenario.** A cloud infrastructure tool creates environment configurations for dev, staging, and production. Each environment has:

- A **compute cluster** (CPU cores, memory, instance type)
- A **database cluster** (engine, replica count, storage size)
- A **monitoring setup** (alert thresholds, log retention)

The dev environment is minimal. Staging mirrors prod at a smaller scale. Prod is full-scale.

The company runs on **both AWS and GCP**. An AWS dev environment is *not the same* as a GCP dev environment — different instance types, different DB engines, different monitoring stacks. All four combinations must be supported. Tomorrow Azure will join.

**What you must produce:**
1. Identify the two patterns needed and why each one alone is insufficient.
2. Full class hierarchy and implementation.
3. Show that adding Azure or a new environment type ("QA") requires only new classes — no edits.

---

#### Solution

##### Recognition

Two distinct needs collide:

1. **Family consistency.** Every component in an AWS environment must be AWS-flavoured. You can't mix an AWS compute cluster with a GCP database. The set of components for a given cloud provider must travel together as a *family*. This is the **Abstract Factory** signal.

2. **Complex construction.** Each component itself is a multi-step build — compute has CPU, memory, instance type, autoscaling rules; the database has engine, replicas, storage, backup policy. A `Compute(cpu, mem, type, autoscale, ...)` constructor is fragile, and the values differ by environment type (dev vs prod). This is the **Builder** signal.

**Either pattern alone is insufficient:**

- Abstract Factory alone gives you family consistency but forces each "create method" to do complex construction in one shot.
- Builder alone gives you readable construction but does not enforce that compute, db, and monitoring all match the same cloud provider.

**Together:** Abstract Factory creates the right *family of builders*; each builder produces one complex component step-by-step.

##### The implementation

We'll walk through the hierarchy in stages so it's not overwhelming.

###### Stage 1 — Domain (the products)

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List


@dataclass
class ComputeCluster:
    provider: str
    instance_type: str
    cpu_cores: int
    memory_gb: int
    autoscale_min: int
    autoscale_max: int


@dataclass
class DatabaseCluster:
    provider: str
    engine: str
    replicas: int
    storage_gb: int
    backup_retention_days: int


@dataclass
class MonitoringSetup:
    provider: str
    log_retention_days: int
    alert_thresholds: dict


@dataclass
class Environment:
    name: str
    compute: ComputeCluster
    database: DatabaseCluster
    monitoring: MonitoringSetup
```

###### Stage 2 — Builders (one per product)

Each builder constructs one product step-by-step. The subclasses differ in their *defaults* and their *provider-specific knowledge*.

```python
class ComputeBuilder(ABC):
    """Stepwise builder for a ComputeCluster."""

    def __init__(self):
        self._instance_type = ""
        self._cpu = 1
        self._memory = 1
        self._scale_min = 1
        self._scale_max = 1

    @abstractmethod
    def for_dev(self) -> "ComputeBuilder": ...

    @abstractmethod
    def for_prod(self) -> "ComputeBuilder": ...

    def build(self) -> ComputeCluster:
        return ComputeCluster(
            provider=self._provider_name(),
            instance_type=self._instance_type,
            cpu_cores=self._cpu,
            memory_gb=self._memory,
            autoscale_min=self._scale_min,
            autoscale_max=self._scale_max,
        )

    @abstractmethod
    def _provider_name(self) -> str: ...


class AwsComputeBuilder(ComputeBuilder):
    def _provider_name(self):
        return "aws"

    def for_dev(self):
        self._instance_type = "t3.small"
        self._cpu, self._memory = 2, 2
        self._scale_min, self._scale_max = 1, 1
        return self

    def for_prod(self):
        self._instance_type = "m5.2xlarge"
        self._cpu, self._memory = 8, 32
        self._scale_min, self._scale_max = 3, 20
        return self


class GcpComputeBuilder(ComputeBuilder):
    def _provider_name(self):
        return "gcp"

    def for_dev(self):
        self._instance_type = "e2-small"
        self._cpu, self._memory = 2, 2
        self._scale_min, self._scale_max = 1, 1
        return self

    def for_prod(self):
        self._instance_type = "n2-standard-8"
        self._cpu, self._memory = 8, 32
        self._scale_min, self._scale_max = 3, 20
        return self


# ----- Database builders -----
class DatabaseBuilder(ABC):
    def __init__(self):
        self._engine = ""
        self._replicas = 1
        self._storage = 10
        self._backup_days = 7

    @abstractmethod
    def for_dev(self) -> "DatabaseBuilder": ...

    @abstractmethod
    def for_prod(self) -> "DatabaseBuilder": ...

    @abstractmethod
    def _provider_name(self) -> str: ...

    def build(self) -> DatabaseCluster:
        return DatabaseCluster(
            provider=self._provider_name(),
            engine=self._engine,
            replicas=self._replicas,
            storage_gb=self._storage,
            backup_retention_days=self._backup_days,
        )


class AwsDatabaseBuilder(DatabaseBuilder):
    def _provider_name(self):
        return "aws"

    def for_dev(self):
        self._engine, self._replicas, self._storage = "rds-postgres", 1, 20
        self._backup_days = 1
        return self

    def for_prod(self):
        self._engine, self._replicas, self._storage = "aurora-postgres", 3, 500
        self._backup_days = 30
        return self


class GcpDatabaseBuilder(DatabaseBuilder):
    def _provider_name(self):
        return "gcp"

    def for_dev(self):
        self._engine, self._replicas, self._storage = "cloudsql-postgres", 1, 20
        self._backup_days = 1
        return self

    def for_prod(self):
        self._engine, self._replicas, self._storage = "cloudsql-postgres-ha", 3, 500
        self._backup_days = 30
        return self


# ----- Monitoring builders (analogous) -----
class MonitoringBuilder(ABC):
    def __init__(self):
        self._retention = 7
        self._thresholds = {}

    @abstractmethod
    def for_dev(self) -> "MonitoringBuilder": ...

    @abstractmethod
    def for_prod(self) -> "MonitoringBuilder": ...

    @abstractmethod
    def _provider_name(self) -> str: ...

    def build(self) -> MonitoringSetup:
        return MonitoringSetup(
            provider=self._provider_name(),
            log_retention_days=self._retention,
            alert_thresholds=self._thresholds,
        )


class AwsMonitoringBuilder(MonitoringBuilder):
    def _provider_name(self):
        return "aws"

    def for_dev(self):
        self._retention = 7
        self._thresholds = {"cpu_pct": 90}
        return self

    def for_prod(self):
        self._retention = 90
        self._thresholds = {"cpu_pct": 80, "memory_pct": 85, "5xx_pct": 1}
        return self


class GcpMonitoringBuilder(MonitoringBuilder):
    def _provider_name(self):
        return "gcp"

    def for_dev(self):
        self._retention = 7
        self._thresholds = {"cpu_pct": 90}
        return self

    def for_prod(self):
        self._retention = 90
        self._thresholds = {"cpu_pct": 80, "memory_pct": 85, "5xx_pct": 1}
        return self
```

###### Stage 3 — Abstract Factory (one per cloud provider)

```python
class CloudProviderFactory(ABC):
    """Creates a CONSISTENT family of builders. All AWS or all GCP."""

    @abstractmethod
    def compute(self) -> ComputeBuilder: ...

    @abstractmethod
    def database(self) -> DatabaseBuilder: ...

    @abstractmethod
    def monitoring(self) -> MonitoringBuilder: ...


class AwsFactory(CloudProviderFactory):
    def compute(self):
        return AwsComputeBuilder()

    def database(self):
        return AwsDatabaseBuilder()

    def monitoring(self):
        return AwsMonitoringBuilder()


class GcpFactory(CloudProviderFactory):
    def compute(self):
        return GcpComputeBuilder()

    def database(self):
        return GcpDatabaseBuilder()

    def monitoring(self):
        return GcpMonitoringBuilder()
```

###### Stage 4 — The orchestrator

```python
class EnvironmentBuilder:
    """
    Knows the environment recipe (dev / staging / prod).
    Doesn't know AWS from GCP — receives a factory.
    """

    def __init__(self, factory: CloudProviderFactory):
        self.factory = factory

    def dev(self) -> Environment:
        return Environment(
            name="dev",
            compute=self.factory.compute().for_dev().build(),
            database=self.factory.database().for_dev().build(),
            monitoring=self.factory.monitoring().for_dev().build(),
        )

    def prod(self) -> Environment:
        return Environment(
            name="prod",
            compute=self.factory.compute().for_prod().build(),
            database=self.factory.database().for_prod().build(),
            monitoring=self.factory.monitoring().for_prod().build(),
        )
```

###### Using it

```python
aws_dev = EnvironmentBuilder(AwsFactory()).dev()
gcp_prod = EnvironmentBuilder(GcpFactory()).prod()

assert aws_dev.compute.instance_type == "t3.small"
assert gcp_prod.database.engine == "cloudsql-postgres-ha"
```

##### Extensibility check

**Add Azure support.** Write three new classes — `AzureComputeBuilder`, `AzureDatabaseBuilder`, `AzureMonitoringBuilder` — and one factory `AzureFactory` that wires them. *Zero* changes to `EnvironmentBuilder`, the abstract bases, or AWS/GCP code.

**Add a new environment type "QA".** Add `qa()` to `EnvironmentBuilder` and a `for_qa()` to each builder. The factory hierarchy is unchanged. (Or, even better, define environment recipes as data and remove `dev/prod` methods entirely — but that's an optimisation; the pattern remains.)

##### Pattern reveal — Abstract Factory + Builder

**Two patterns, one job:**

- **Abstract Factory** ensures that all components within one environment come from the *same family* (no AWS compute mixed with GCP database).
- **Builder** ensures that each individual component is constructed via a *readable, validated, stepwise process* — with different defaults for different environment sizes.

This combination is common when you have **(family of products) × (complex construction per product)**. Either pattern alone misses half the problem; together they fit the brief exactly.

---


## Section 2 — Structural Patterns Practice

Six problems. The first four single-pattern. Problems 2.5 and 2.6 combine patterns.

---

### Problem 2.1 — Third-Party Payment SDK (Level 1)

**Scenario.** Your team has a third-party payment library:

```python
class ThirdPartyPaymentSDK:
    def execute_transaction(
        self, account_num: str, amount_cents: int, currency_code: str
    ) -> str:
        """Returns a transaction reference."""
        ...
```

Your system uses an internal interface:

```python
class PaymentGateway:
    def charge(self, user_id: str, amount_rupees: float) -> str: ...
```

You **cannot modify** either side: the SDK is a vendor library, and `PaymentGateway` is used in 47 places across the codebase. You need them to work together.

**What you must produce:**
1. The class that makes this work.
2. A short note on why modifying either side would have been wrong.
3. A demonstration that a second vendor SDK could be plugged in tomorrow with no further changes.

---

#### Solution

##### Recognition

The phrase that gives it away: *"You cannot modify either."*

Two interfaces have a structural mismatch:

- Method names differ: `charge` vs. `execute_transaction`.
- Units differ: rupees vs. cents.
- Identifier types differ: `user_id` (your domain) vs. `account_num` (the vendor's domain).

You can't reach into the SDK or into the existing interface — but you can build a *translator* between them. That translator is the **Adapter** pattern.

##### The naive alternatives — and why they're wrong

- **"Modify `PaymentGateway` to look like the SDK."** Forty-seven call sites break. Months of work, plenty of regressions.
- **"Wrap the SDK and add a `charge` method on it."** You'd have to subclass or monkey-patch a third-party class. Fragile, and breaks on the next vendor upgrade.

The Adapter sits *between* the two — a small class you own, that implements `PaymentGateway` (because that's what the rest of your code expects) and *internally* calls the SDK.

##### The implementation

```python
from abc import ABC, abstractmethod


# ---------------------------------------------------------------
# Your existing interface — DO NOT TOUCH.
# (47 callers depend on it.)
# ---------------------------------------------------------------
class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, user_id: str, amount_rupees: float) -> str: ...


# ---------------------------------------------------------------
# The third-party SDK — DO NOT TOUCH.
# (Vendor library; we don't own its source.)
# ---------------------------------------------------------------
class ThirdPartyPaymentSDK:
    def execute_transaction(self, account_num, amount_cents, currency_code):
        print(f"[SDK] {account_num} -> {amount_cents}{currency_code}")
        return f"TXN-{account_num}-{amount_cents}"


# ---------------------------------------------------------------
# The Adapter — the new class we own.
# Implements our interface; delegates to the SDK.
# ---------------------------------------------------------------
class PaymentSDKAdapter(PaymentGateway):
    def __init__(self, sdk: ThirdPartyPaymentSDK, account_lookup):
        # `account_lookup` is a callable that maps user_id → account_num.
        # Injecting it keeps the adapter testable.
        self.sdk = sdk
        self.account_lookup = account_lookup

    def charge(self, user_id: str, amount_rupees: float) -> str:
        # Translate: user_id → account_num
        account = self.account_lookup(user_id)
        # Translate: rupees → paise (cents).
        # Cast to int because the SDK wants integer minor units.
        amount_paise = int(round(amount_rupees * 100))
        # Translate: implicit "INR" → explicit currency code
        return self.sdk.execute_transaction(
            account_num=account,
            amount_cents=amount_paise,
            currency_code="INR",
        )


# ---------------------------------------------------------------
# Use site — the rest of the codebase doesn't see the SDK at all.
# ---------------------------------------------------------------
def lookup_account(user_id: str) -> str:
    # Real implementation would hit a DB. Demo only.
    return f"ACC-{user_id}"


gateway: PaymentGateway = PaymentSDKAdapter(
    sdk=ThirdPartyPaymentSDK(),
    account_lookup=lookup_account,
)

ref = gateway.charge(user_id="U001", amount_rupees=499.99)
# 47 call sites need no change. They keep using PaymentGateway.
```

##### Extensibility check — a second vendor SDK

Tomorrow, you migrate to **Razorpay** (different method name, different unit conventions). Add a new adapter:

```python
class RazorpayAdapter(PaymentGateway):
    def __init__(self, razorpay_client, account_lookup):
        self.client = razorpay_client
        self.account_lookup = account_lookup

    def charge(self, user_id, amount_rupees):
        account = self.account_lookup(user_id)
        return self.client.payments.capture(
            account=account,
            amount_paise=int(round(amount_rupees * 100)),
        )
```

The 47 call sites still don't change. The migration is a one-line swap at the composition root:

```python
# Was:
# gateway = PaymentSDKAdapter(ThirdPartyPaymentSDK(), lookup_account)
# Now:
gateway = RazorpayAdapter(razorpay_client, lookup_account)
```

##### Pattern reveal — Adapter, and when *not* to use it

**Adapter.** Use it when:

- Two interfaces are structurally incompatible.
- One or both sides cannot be modified (legacy code, third-party libraries).
- The translation logic is mechanical enough to live in one class.

**Don't** use Adapter when:

- You *can* modify both sides. Just make them match directly.
- The "translation" is so complex it's really business logic in disguise — that work belongs in its own service, not buried in an adapter.

---

### Problem 2.2 — Coffee Shop Pricing (Level 2)

**Scenario.** A coffee shop priced its drinks like this:

- Basic espresso = ₹100
- Extras: extra shot (+₹30), oat milk (+₹50), caramel syrup (+₹20), whipped cream (+₹25)

A customer can add **multiple extras**. The drink description and total price must reflect every extra. New extras are added to the menu regularly (seasonal: pumpkin spice, lavender syrup).

**What you must produce:**
1. The naive design, with a count of how many subclasses it produces.
2. The pattern-based design, with full implementation.
3. A demonstration with one drink that has three extras stacked.
4. A short explanation of the call chain that builds the cost.

---

#### Solution

##### Recognition

The signal is **combinatorial explosion**. With 4 add-ons, there are 2^4 = 16 possible combinations. With 5 add-ons, 32. With 6, 64. A subclass per combination is unmaintainable. A single class with flags is rigid. We need a way to *stack behaviour* dynamically.

That's the **Decorator** pattern: wrap an object in another object that "decorates" it with extra behaviour, and recurse — wrapping the wrapped, and the wrapped-wrapped, and so on.

##### The naive subclass-explosion design

```python
class Espresso: ...
class EspressoWithExtraShot: ...
class EspressoWithOatMilk: ...
class EspressoWithCaramel: ...
class EspressoWithWhippedCream: ...
class EspressoWithExtraShotAndOatMilk: ...
class EspressoWithOatMilkAndCaramel: ...
# ... and 9 more ...
```

For 4 extras: 16 classes. For 5: 32. Now add `Latte` and `Cappuccino` — and we have 48 and 96 classes respectively. Nobody is reviewing 96 classes for a coffee shop.

##### The Decorator implementation

```python
from abc import ABC, abstractmethod


# ---------------------------------------------------------------
# The interface every "drink-like thing" must satisfy.
# Both base beverages and decorators implement this.
# ---------------------------------------------------------------
class Beverage(ABC):
    @abstractmethod
    def cost(self) -> float: ...

    @abstractmethod
    def description(self) -> str: ...


# ---------------------------------------------------------------
# Base beverages — the "leaf" objects
# ---------------------------------------------------------------
class Espresso(Beverage):
    def cost(self):
        return 100.0

    def description(self):
        return "Espresso"


class Latte(Beverage):
    def cost(self):
        return 120.0

    def description(self):
        return "Latte"


# ---------------------------------------------------------------
# The decorator base — wraps another Beverage.
# Every concrete decorator subclasses this.
# ---------------------------------------------------------------
class AddOnDecorator(Beverage):
    def __init__(self, beverage: Beverage):
        self._beverage = beverage

    # Default delegate behaviour — subclasses override with extras.
    def cost(self):
        return self._beverage.cost()

    def description(self):
        return self._beverage.description()


# ---------------------------------------------------------------
# Concrete decorators — each adds one specific extra
# ---------------------------------------------------------------
class ExtraShot(AddOnDecorator):
    def cost(self):
        return self._beverage.cost() + 30.0

    def description(self):
        return self._beverage.description() + ", Extra Shot"


class OatMilk(AddOnDecorator):
    def cost(self):
        return self._beverage.cost() + 50.0

    def description(self):
        return self._beverage.description() + ", Oat Milk"


class Caramel(AddOnDecorator):
    def cost(self):
        return self._beverage.cost() + 20.0

    def description(self):
        return self._beverage.description() + ", Caramel"


class WhippedCream(AddOnDecorator):
    def cost(self):
        return self._beverage.cost() + 25.0

    def description(self):
        return self._beverage.description() + ", Whipped Cream"
```

##### Stacking and the call chain

```python
drink: Beverage = Espresso()             # cost 100
drink = OatMilk(drink)                   # cost 100 + 50 = 150
drink = Caramel(drink)                   # cost 150 + 20 = 170
drink = WhippedCream(drink)              # cost 170 + 25 = 195

print(drink.description())
# → "Espresso, Oat Milk, Caramel, Whipped Cream"
print(drink.cost())
# → 195.0
```

##### Tracing `drink.cost()` to see how Decorator actually works

```
WhippedCream.cost()
  → returns self._beverage.cost() + 25
       Caramel.cost()
         → returns self._beverage.cost() + 20
              OatMilk.cost()
                → returns self._beverage.cost() + 50
                     Espresso.cost()
                       → returns 100
                ← 150
         ← 170
  ← 195
```

Each decorator asks the *inner* object for its cost, then adds its own. The recursion unwinds from the deepest layer outward.

The `description()` call works identically — each layer asks the inner layer for its description, then appends its own name.

##### Extensibility check — pumpkin spice arrives

```python
class PumpkinSpice(AddOnDecorator):
    def cost(self):
        return self._beverage.cost() + 35.0

    def description(self):
        return self._beverage.description() + ", Pumpkin Spice"
```

One new class. Zero changes to existing classes. Customers can stack it with anything: `PumpkinSpice(WhippedCream(Latte()))`.

##### Pattern reveal — Decorator vs. inheritance vs. flags

**Decorator** is the right call when:

- A base object can be enhanced in many independent ways.
- Combinations are runtime-decided (the user picks at checkout).
- Adding a new way to enhance the object should not require touching old code.

**Don't** use Decorator when the variants are mutually exclusive (you can only pick one) — a Strategy pattern is cleaner. And don't use it when there are 2–3 fixed combinations — subclasses are simpler.

---

### Problem 2.3 — Smart Home Scenes (Level 2)

**Scenario.** A smart home system has many subsystems:

- **Lights** — on/off, dim level
- **Thermostat** — temperature control
- **Security** — arm/disarm
- **Media** — play / pause / volume
- **Door locks** — lock / unlock

A resident defines two **scenes**:

- **"Good Morning"** — lights at 70%, thermostat to 22°C, media plays morning playlist, doors unlock.
- **"Good Night"** — lights off, thermostat to 18°C, security armed, doors locked.

The resident's mobile app should trigger a scene with **one tap**. The app should not need to know about all the subsystems.

**What you must produce:**
1. The pattern that fits.
2. Full implementation of the subsystems and the simplifying entry point.
3. A note on the important *difference* between this pattern and Adapter / Proxy.

---

#### Solution

##### Recognition

The key requirement: *"The app should not need to know about all the subsystems."* The app should *not* be coupled to five different APIs in a specific call order.

We need a *front door* — a single class that exposes "Good Morning" and "Good Night" as one-line operations and hides the orchestration inside. That's the **Facade** pattern.

##### The naive design — app calls subsystems directly

```python
def good_morning(app):
    app.lights.set_brightness(70)
    app.thermostat.set_temperature(22)
    app.media.play_playlist("Morning")
    app.locks.unlock_all()
```

Now the app must:

- Know all five subsystems exist
- Know their method names
- Know the right call *order* (security must be disarmed before doors unlock)
- Handle errors from each one

That's tight coupling. Five subsystems × N scenes × M app screens = a lot of places to break when one subsystem changes.

##### The Facade implementation

```python
# ---------------------------------------------------------------
# Subsystems — each owns its own behaviour
# ---------------------------------------------------------------
class Lights:
    def set_brightness(self, pct: int):
        print(f"Lights at {pct}%")

    def off(self):
        print("Lights off")


class Thermostat:
    def set_temperature(self, celsius: float):
        print(f"Thermostat -> {celsius}°C")


class Security:
    def arm(self):
        print("Security armed")

    def disarm(self):
        print("Security disarmed")


class Media:
    def play(self, playlist: str):
        print(f"Playing playlist: {playlist}")

    def stop(self):
        print("Media stopped")


class DoorLocks:
    def lock_all(self):
        print("All doors locked")

    def unlock_all(self):
        print("All doors unlocked")


# ---------------------------------------------------------------
# The Facade — the only thing the app imports
# ---------------------------------------------------------------
class SmartHomeFacade:
    def __init__(
        self,
        lights: Lights,
        thermostat: Thermostat,
        security: Security,
        media: Media,
        locks: DoorLocks,
    ):
        # Subsystems are still injectable for testing — they didn't
        # become hidden; they're just routed through one entry point.
        self.lights = lights
        self.thermostat = thermostat
        self.security = security
        self.media = media
        self.locks = locks

    # -----------------------------------------------------------
    # Scenes — one method per high-level "user intent"
    # -----------------------------------------------------------
    def good_morning(self) -> None:
        # The Facade owns the ORCHESTRATION ORDER, so nobody else
        # has to remember it. Security disarmed BEFORE doors unlock —
        # because otherwise the alarm would trigger.
        self.security.disarm()
        self.locks.unlock_all()
        self.lights.set_brightness(70)
        self.thermostat.set_temperature(22)
        self.media.play("Morning")

    def good_night(self) -> None:
        self.media.stop()
        self.lights.off()
        self.thermostat.set_temperature(18)
        self.locks.lock_all()
        self.security.arm()


# ---------------------------------------------------------------
# Use site — one import, one call per scene
# ---------------------------------------------------------------
home = SmartHomeFacade(
    Lights(), Thermostat(), Security(), Media(), DoorLocks()
)
home.good_morning()
```

##### Important — Facade *does not hide* the subsystems

A common misconception is that Facade *replaces* the underlying APIs. It doesn't. The subsystems are still fully usable for advanced users:

```python
# An automation script needs custom behaviour — it can still reach
# into the subsystems directly. The Facade is an alternative
# entry point, not a wall.
home.thermostat.set_temperature(25)
home.lights.set_brightness(30)
```

This is the **important distinction** between Facade and patterns like Proxy or Adapter:

- **Adapter** — converts an interface so two parties that couldn't talk can talk.
- **Proxy** — controls access to an object (caching, security, lazy loading).
- **Facade** — provides a *simpler* entry point to a complex subsystem, without preventing direct access.

##### Extensibility check — a new "Movie Night" scene

```python
def movie_night(self) -> None:
    self.lights.set_brightness(15)
    self.media.play("Cinema")
    self.thermostat.set_temperature(20)
```

One new method on the Facade. Zero changes to subsystems. The app gains a new one-tap action by importing nothing new.

---

### Problem 2.4 — Library Book Database (Level 2)

**Scenario.** A library system has a `BookDatabase` whose queries are **very expensive** — each call to `get_book_details(isbn)` takes 2–3 seconds. The UI layer calls this method frequently, often requesting the same book multiple times as a user browses. Additionally, some book records are **restricted**: only librarians can see the full details; regular users see a limited view. You cannot modify `BookDatabase`.

**What you must produce:**
1. The pattern (or patterns) that solve both problems.
2. Full implementation showing the two concerns separated.
3. Demonstration that the client cannot tell the difference between the real database and the wrapped version.

---

#### Solution

##### Recognition

Two distinct concerns:

1. **Performance** — repeated identical calls should be cached.
2. **Access control** — restricted records should be filtered based on user role.

Both fit the **Proxy** pattern. A Proxy implements the same interface as the real object and *stands in for* it, controlling access (caching, security, lazy loading, logging, etc.) without callers knowing they're talking to a proxy.

Because we have *two* concerns, we'll stack *two* proxies: one for caching, one for protection. Both implement the same `BookService` interface and can be composed in either order — though the typical order is protection-outside, caching-inside.

##### The implementation

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Optional
import time


# ---------------------------------------------------------------
# The interface every "book service" implements
# ---------------------------------------------------------------
class BookService(ABC):
    @abstractmethod
    def get_book_details(self, isbn: str) -> "Book": ...


@dataclass
class Book:
    isbn: str
    title: str
    author: str
    is_restricted: bool
    full_details: str    # only visible to librarians when restricted


# ---------------------------------------------------------------
# The REAL service — slow, but we own none of its source
# ---------------------------------------------------------------
class RealBookDatabase(BookService):
    def get_book_details(self, isbn):
        # Pretend this is a 2-second SQL query against a slow DB.
        time.sleep(2)
        # Demo data.
        return Book(
            isbn=isbn,
            title=f"Book {isbn}",
            author="Some Author",
            is_restricted=(isbn.startswith("R")),
            full_details=f"Detailed contents of {isbn}",
        )


# ---------------------------------------------------------------
# Proxy #1 — Caching
# ---------------------------------------------------------------
class CachingBookProxy(BookService):
    def __init__(self, real: BookService):
        self._real = real
        self._cache: Dict[str, Book] = {}

    def get_book_details(self, isbn):
        if isbn in self._cache:
            # Cache hit — instant. No 2-second delay.
            return self._cache[isbn]
        # Cache miss — go to the real service, store, return.
        book = self._real.get_book_details(isbn)
        self._cache[isbn] = book
        return book


# ---------------------------------------------------------------
# Proxy #2 — Protection (access control)
# ---------------------------------------------------------------
@dataclass
class User:
    user_id: str
    is_librarian: bool


class ProtectionBookProxy(BookService):
    def __init__(self, inner: BookService, current_user: User):
        self._inner = inner
        self._user = current_user

    def get_book_details(self, isbn):
        book = self._inner.get_book_details(isbn)
        if book.is_restricted and not self._user.is_librarian:
            # Return a "redacted" copy. Don't leak the full details.
            return Book(
                isbn=book.isbn,
                title=book.title,
                author=book.author,
                is_restricted=True,
                full_details="[restricted — librarian access only]",
            )
        return book
```

##### Stacking — protection wraps caching wraps the real DB

```python
# Composition order matters: protection outside, caching inside.
# That way the cache stores the REAL data once; protection filters
# per-request based on the user.
db = RealBookDatabase()
cached = CachingBookProxy(db)
service: BookService = ProtectionBookProxy(cached, current_user=User("U001", is_librarian=False))

# Client code:
b1 = service.get_book_details("R-9001")   # 2s — slow miss + redacted
b2 = service.get_book_details("R-9001")   # instant — cache hit, still redacted
print(b1.full_details)   # "[restricted — ...]"
```

##### Proxy vs. Decorator — the same shape, different intent

Look at the code structurally and `CachingBookProxy` looks *exactly* like a Decorator. Same shape: wraps the real object, implements the same interface, delegates internally.

The **intent** distinguishes them:

- **Decorator** *adds behaviour* — e.g., adding caramel to coffee.
- **Proxy** *controls access* — e.g., caching to make access faster, protection to make access conditional.

Both are valid here; the convention is to call them Proxies because the intent is *control of access* (caching for performance control, protection for security control), not *enhancement of capability*.

##### Extensibility check — a third proxy

Want to **log every query** for analytics? Add a `LoggingBookProxy(BookService)` that wraps the chain. Zero changes to existing proxies or the real DB.

---

### Problem 2.5 — File System with Virtual Files (Level 3)

**Scenario.** A file system manager displays folder hierarchies.

- A **Folder** can contain Files and other Folders.
- `size()` on a Folder returns the recursive total size of contents.
- `display()` on a Folder shows an indented tree view.
- Files have fixed sizes; Folders compute their size from contents.

**Additionally:** some files are **virtual** — they're generated on demand (e.g., a thumbnail computed from a source image only when first accessed). Virtual files must behave *exactly* like real files from the caller's perspective. Their content must be generated lazily on first access.

**What you must produce:**
1. The two patterns needed and where each one fits.
2. Full implementation.
3. Demonstration that the caller cannot distinguish a virtual file from a real one.

---

#### Solution

##### Recognition

Two patterns are at work:

1. *"Folders contain Files and other Folders, treated identically by `size()` and `display()`."* This is a tree where leaves and composites share an interface — the **Composite** pattern.
2. *"Virtual files generate content lazily on first access, behaving like real files."* This is a **Proxy** that delays expensive work and pretends to be the real thing.

The proxy lives *inside* the Composite tree as a leaf. The Composite doesn't know which of its leaves are real and which are proxies — and that's the design's beauty.

##### The implementation

```python
from abc import ABC, abstractmethod
from typing import List, Callable


# ---------------------------------------------------------------
# The common interface — every node implements it
# ---------------------------------------------------------------
class FileSystemNode(ABC):
    @abstractmethod
    def size(self) -> int: ...

    @abstractmethod
    def display(self, indent: int = 0) -> None: ...

    @property
    @abstractmethod
    def name(self) -> str: ...


# ---------------------------------------------------------------
# A real file — leaf
# ---------------------------------------------------------------
class RealFile(FileSystemNode):
    def __init__(self, name: str, content: bytes):
        self._name = name
        self._content = content

    @property
    def name(self):
        return self._name

    def size(self):
        return len(self._content)

    def display(self, indent=0):
        print(" " * indent + f"📄 {self._name} ({self.size()} bytes)")


# ---------------------------------------------------------------
# A Folder — the COMPOSITE
# ---------------------------------------------------------------
class Folder(FileSystemNode):
    def __init__(self, name: str):
        self._name = name
        self._children: List[FileSystemNode] = []

    @property
    def name(self):
        return self._name

    def add(self, node: FileSystemNode) -> None:
        self._children.append(node)

    def size(self):
        # Recursive: ask each child for its size — and each child
        # decides for itself how that's computed. Real file? Stored
        # content length. Sub-folder? Recurse. Virtual file? Trigger
        # generation. The folder doesn't know or care.
        return sum(child.size() for child in self._children)

    def display(self, indent=0):
        print(" " * indent + f"📁 {self._name}/")
        for child in self._children:
            child.display(indent + 2)


# ---------------------------------------------------------------
# A LazyFile — PROXY for an expensive-to-generate file
# Implements the SAME FileSystemNode interface, so it can slot into
# a Folder anywhere a RealFile could go.
# ---------------------------------------------------------------
class LazyFile(FileSystemNode):
    def __init__(self, name: str, generator: Callable[[], bytes]):
        self._name = name
        self._generator = generator        # called only on demand
        self._real: RealFile | None = None # the real file, when created

    @property
    def name(self):
        return self._name

    def _materialize(self) -> RealFile:
        if self._real is None:
            print(f"  (generating {self._name}...)")
            content = self._generator()
            self._real = RealFile(self._name, content)
        return self._real

    def size(self):
        return self._materialize().size()

    def display(self, indent=0):
        # The first display() call triggers generation.
        self._materialize().display(indent)
```

##### Demonstration — the caller cannot tell

```python
def make_thumbnail() -> bytes:
    # Imagine this opens the source image, resizes, and encodes.
    # Expensive.
    return b"FAKE_THUMBNAIL_BYTES_" * 100


root = Folder("photos")
root.add(RealFile("vacation.jpg", b"x" * 5000))
root.add(LazyFile("vacation_thumb.jpg", make_thumbnail))

subfolder = Folder("2024")
subfolder.add(RealFile("birthday.jpg", b"x" * 3000))
subfolder.add(LazyFile("birthday_thumb.jpg", make_thumbnail))
root.add(subfolder)

# Display the tree — virtual files generate on demand.
root.display()
print(f"Total bytes: {root.size()}")
```

Output (the (generating…) lines reveal the lazy materialisation, but the caller doesn't need to know):

```
📁 photos/
  📄 vacation.jpg (5000 bytes)
  (generating vacation_thumb.jpg...)
  📄 vacation_thumb.jpg (2000 bytes)
  📁 2024/
    📄 birthday.jpg (3000 bytes)
    (generating birthday_thumb.jpg...)
    📄 birthday_thumb.jpg (2000 bytes)
Total bytes: 12000
```

##### Why this combination works

The Composite pattern says: "give every node — real file, virtual file, folder — the same interface, and the parent can treat them uniformly." The Proxy pattern says: "make the virtual file *look* exactly like a real file." Stack them: the proxy *is* a leaf in the composite tree, indistinguishable from a real leaf at the interface level. The folder's recursive `size()` works correctly without ever knowing about virtual files.

##### Extensibility check

- **A new node type — `Shortcut` (a symlink-like reference)?** Implement `FileSystemNode`. Resolve the target on demand. Zero changes elsewhere.
- **A "compressed file" leaf that decompresses on display?** Same shape — a proxy that materialises on demand.

---

### Problem 2.6 — UI Rendering Across Platforms (Level 3)

**Scenario.** A UI rendering system has two independent axes of variation:

- **Shape type** — Circle, Square, Triangle.
- **Rendering platform** — SVG, Canvas, WebGL.

The current team is creating one class per combination: `SVGCircle`, `SVGSquare`, `CanvasCircle`, `CanvasSquare`, `WebGLCircle`, etc. — 9 classes for 3 shapes × 3 platforms. Adding a 4th platform (Vulkan) means 3 more classes. Adding a 4th shape means 3 more classes. Refactor this.

**What you must produce:**
1. Identify the pattern.
2. Show the class-count before and after.
3. Full implementation with at least 2 shapes × 2 platforms.
4. Explain the "axes of variation" intuition that the pattern formalises.

---

#### Solution

##### Recognition

The signal is **class explosion from two independent axes**. If you have N shapes × M platforms classes, and adding either an N+1th shape or an M+1th platform adds M or N new classes, you have the textbook **Bridge** pattern problem.

The Bridge separates the two axes:

- An **abstraction** (Shape) for the *what* — circles and squares.
- An **implementor** (Renderer) for the *how* — SVG, Canvas, WebGL.

Each shape holds a `Renderer`. To draw, the shape decomposes itself into primitives (draw a circle = draw an arc; draw a triangle = draw three lines) and asks the renderer to handle them.

##### Before vs. after — class count

| | Naive (subclass-per-combination) | Bridge |
|---|---|---|
| 3 shapes × 3 platforms | 9 classes | 3 + 3 = 6 classes |
| 3 shapes × 4 platforms | 12 classes | 3 + 4 = 7 classes |
| 4 shapes × 4 platforms | 16 classes | 4 + 4 = 8 classes |
| 10 shapes × 5 platforms | 50 classes | 10 + 5 = 15 classes |

Each axis grows linearly instead of multiplicatively. Add a new platform = 1 new renderer class, every existing shape works on it. Add a new shape = 1 new shape class, every existing renderer can draw it.

##### The implementation

```python
from abc import ABC, abstractmethod


# ---------------------------------------------------------------
# The IMPLEMENTOR axis — rendering primitives
# A renderer knows how to draw a few low-level shapes; high-level
# shapes compose themselves out of these primitives.
# ---------------------------------------------------------------
class Renderer(ABC):
    @abstractmethod
    def render_circle(self, cx: float, cy: float, radius: float) -> None: ...

    @abstractmethod
    def render_line(self, x1: float, y1: float, x2: float, y2: float) -> None: ...


class SVGRenderer(Renderer):
    def render_circle(self, cx, cy, radius):
        print(f'<svg:circle cx="{cx}" cy="{cy}" r="{radius}"/>')

    def render_line(self, x1, y1, x2, y2):
        print(f'<svg:line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>')


class CanvasRenderer(Renderer):
    def render_circle(self, cx, cy, radius):
        print(f"ctx.arc({cx}, {cy}, {radius}, 0, 2 * Math.PI);")

    def render_line(self, x1, y1, x2, y2):
        print(f"ctx.moveTo({x1}, {y1}); ctx.lineTo({x2}, {y2});")


# ---------------------------------------------------------------
# The ABSTRACTION axis — shapes
# A shape holds a Renderer and uses its primitives.
# ---------------------------------------------------------------
class Shape(ABC):
    def __init__(self, renderer: Renderer):
        self.renderer = renderer

    @abstractmethod
    def draw(self) -> None: ...


class Circle(Shape):
    def __init__(self, renderer, cx, cy, radius):
        super().__init__(renderer)
        self.cx, self.cy, self.radius = cx, cy, radius

    def draw(self):
        # A circle decomposes to one renderer primitive.
        self.renderer.render_circle(self.cx, self.cy, self.radius)


class Triangle(Shape):
    def __init__(self, renderer, p1, p2, p3):
        super().__init__(renderer)
        self.p1, self.p2, self.p3 = p1, p2, p3

    def draw(self):
        # A triangle decomposes to three line primitives.
        self.renderer.render_line(*self.p1, *self.p2)
        self.renderer.render_line(*self.p2, *self.p3)
        self.renderer.render_line(*self.p3, *self.p1)
```

##### Use site — any shape, any renderer, any combination

```python
svg = SVGRenderer()
canvas = CanvasRenderer()

shapes = [
    Circle(svg, 100, 100, 50),
    Circle(canvas, 100, 100, 50),
    Triangle(svg, (0, 0), (10, 0), (5, 8)),
    Triangle(canvas, (0, 0), (10, 0), (5, 8)),
]
for s in shapes:
    s.draw()
```

Six "classes" of behaviour exist (2 shapes × 3 renderers) — but only 5 actual classes (Shape ABC + Circle + Triangle + Renderer ABC + 2 concrete renderers excluded already). The combinations are *runtime* combinations of orthogonal axes, not compile-time combinations of subclasses.

##### Extensibility check

- **Add Square (a new shape):** one new class, `Square(Shape)`. It decomposes into 4 line primitives. Works on every existing renderer.
- **Add WebGL (a new platform):** one new class, `WebGLRenderer(Renderer)`. Every existing shape can now render to WebGL.
- **Add Vulkan:** same — one new renderer class.

Compare with the naive version, where adding WebGL meant *three* new classes (`WebGLCircle`, `WebGLSquare`, `WebGLTriangle`). The savings compound.

##### Pattern reveal — Bridge, and the intuition

**Bridge.** Use it when:

- You have two (or more) independent axes of variation.
- A naive subclass-per-combination produces N×M classes.
- Both axes are likely to grow over time.

**The intuition.** When you find yourself drawing a table where the rows are one kind of thing (shapes) and the columns are another (platforms), and each cell is a class — that table is screaming for Bridge. The rows become one class hierarchy, the columns become another, and the cells disappear because the "combination" lives in *composition* (one object holding the other), not in *inheritance*.

---
