---
title: "SOLID Principles: A Complete Deep Dive"
description: "A rigorous treatment of the five SOLID principles: formal statements, worked examples, tradeoffs, and when not to apply them."

date: 2026-09-05
lastmod: 2026-09-05
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - lld
  - solid
  - python
  - oop

cover:
  image: "/images/LLD - 2.png"
  alt: "SOLID Principles"
  caption: "SOLID Principles: A Complete Deep Dive"
  relative: true
  hidden: false
---

# SOLID Principles: A Complete Deep Dive

> **Prerequisite:** Working familiarity with Python object-oriented programming, specifically classes, objects, inheritance, method overriding, polymorphism, and abstract base classes. If any of those terms are unfamiliar, study the OOP document first, because every argument in this document is expressed in that vocabulary.
>
> **What this document delivers:** A rigorous treatment of the five SOLID principles. For each principle you will find its formal statement, a precise interpretation of every term in that statement, the concrete engineering problem it solves, a worked example of the problem and its resolution, the alternative techniques available for the same goal, the costs of applying the principle, and the conditions under which it should not be applied.
>
> **How to read it:** Sequentially. Section 4 defines the vocabulary used throughout. Sections 5 to 9 develop the principles one at a time, each building on terms established earlier. Section 10 explains how the five interact as a system, and Section 11 applies all five to a single realistic codebase.

---

## Table of Contents

1. [How This Document Is Organised](#1-how-this-document-is-organised)
2. [The Problem SOLID Solves: The Economics of Change](#2-the-problem-solid-solves-the-economics-of-change)
3. [The Five Principles at a Glance](#3-the-five-principles-at-a-glance)
4. [Foundational Vocabulary](#4-foundational-vocabulary)
5. [Single Responsibility Principle (SRP)](#5-single-responsibility-principle-srp)
6. [Open/Closed Principle (OCP)](#6-openclosed-principle-ocp)
7. [Liskov Substitution Principle (LSP)](#7-liskov-substitution-principle-lsp)
8. [Interface Segregation Principle (ISP)](#8-interface-segregation-principle-isp)
9. [Dependency Inversion Principle (DIP)](#9-dependency-inversion-principle-dip)
10. [How the Five Principles Interact](#10-how-the-five-principles-interact)
11. [Capstone: Refactoring an Order Processing System](#11-capstone-refactoring-an-order-processing-system)
12. [SOLID Beyond Classes: Functions, Modules, and Services](#12-solid-beyond-classes-functions-modules-and-services)
13. [Anti-Patterns and Misapplications](#13-anti-patterns-and-misapplications)
14. [When SOLID Should Not Be Applied](#14-when-solid-should-not-be-applied)
15. [Summary and Key Takeaways](#15-summary-and-key-takeaways)
16. [Self-Assessment Questions with Answers](#16-self-assessment-questions-with-answers)
17. [Practice Exercises with Solutions](#17-practice-exercises-with-solutions)
18. [Where SOLID Leads Next](#18-where-solid-leads-next)

---

## 1. How This Document Is Organised

Each of the five principles is presented using an identical ten-part structure. The uniformity is deliberate: once you internalise the structure, you can navigate any principle quickly and you can compare principles against each other along the same dimensions.

| Part | Content | Question It Answers |
|---|---|---|
| 1 | Formal statement | What exactly was claimed, and by whom |
| 2 | Term-by-term interpretation | What each word in the statement means precisely |
| 3 | The problem it solves | Why the principle exists at all |
| 4 | Worked violation | What the failure looks like in real code |
| 5 | Diagnosis | How to recognise the failure systematically |
| 6 | Resolution | How to restructure the code |
| 7 | Alternative techniques | What other ways exist to reach the same goal |
| 8 | Costs and limits | What the principle charges you, and when the price is too high |
| 9 | Detection heuristics | Signals that indicate a violation |
| 10 | Checkpoint questions | Immediate verification of understanding |

Every code example is written in Python 3. Abstract base classes are used to make contracts explicit, because explicit contracts are pedagogically clearer than implicit ones, even though Python's duck typing would often permit the abstraction to be omitted. Section 8.7 discusses when the explicit form is worth its cost and when structural typing via `typing.Protocol` is preferable.

---

## 2. The Problem SOLID Solves: The Economics of Change

### 2.1 The observation behind the principles

A program is written once and modified many times. Industry studies of software cost consistently attribute the majority of total lifetime expenditure to maintenance rather than to initial construction. The practical consequence is that the dominant quality attribute of a codebase is not how quickly it was written but how cheaply it can be changed.

**Definition (cost of change).** The total effort required to implement a modification to a system, including the effort to understand the existing code, to write the modification, to update the affected tests, to verify that unrelated behaviour is unaffected, and to repair defects introduced by the modification.

SOLID is a set of five structural heuristics whose shared purpose is to reduce the cost of change. Each principle attacks the problem from a different direction, but the target is the same.

### 2.2 The four symptoms of degrading design

Robert C. Martin catalogued four observable symptoms that indicate a design is decaying. These are the diagnostic vocabulary of the rest of this document.

| Symptom | Definition | Typical observation |
|---|---|---|
| **Rigidity** | The difficulty of changing the software, because every change forces a cascade of further changes in dependent modules. | A one-line business rule change turns into a three-day task touching fourteen files. |
| **Fragility** | The tendency of the software to break in places that have no conceptual relationship to the part that was changed. | Modifying the invoice printer breaks the login flow. |
| **Immobility** | The inability to reuse a component in another system, because extracting it drags along unwanted dependencies. | The pricing logic cannot be reused because it is entangled with the database connection and the email client. |
| **Viscosity** | The condition in which preserving the design is harder than violating it, so developers repeatedly choose the design-damaging shortcut. | Adding the feature "properly" needs three new classes, but adding one `elif` takes thirty seconds. |

A fifth symptom, **opacity**, refers to code that is difficult to read and understand. Opacity is not addressed directly by SOLID, but it is usually reduced as a side effect, because each principle pushes toward smaller units with narrower purposes.

### 2.3 Coupling and cohesion: the underlying variables

Every SOLID principle can be restated as an instruction to lower coupling or raise cohesion. These two properties are therefore worth defining precisely before proceeding.

**Definition (coupling).** The degree of interdependence between two software modules. Module A is coupled to module B if a change to B can require a change to A. Coupling is measured by the number of assumptions A makes about B and by how specific those assumptions are.

**Definition (cohesion).** The degree to which the elements inside a single module belong together. A module is cohesive when its methods and fields all contribute to a single, well-defined purpose, and when removing any one of them would leave that purpose incomplete.

The design objective is **low coupling and high cohesion**. The two are related: when a module contains unrelated responsibilities (low cohesion), it necessarily accumulates dependencies belonging to all of them, which raises its coupling to the rest of the system.

Coupling comes in degrees, not merely in the binary of present or absent. The following ordering, from most damaging to least, is useful when judging a design.

| Form of coupling | Description | Example |
|---|---|---|
| **Content coupling** | One module modifies the internal state of another directly. | `order._items.append(x)` reaching into a private attribute. |
| **Common coupling** | Multiple modules share global mutable state. | Several classes read and write a module-level `CONFIG` dictionary. |
| **Control coupling** | One module passes a flag that dictates the internal control flow of another. | `report.generate(fmt="pdf")` where the flag selects an internal branch. |
| **Stamp coupling** | A module receives a composite object but uses only a fragment of it. | A function takes an entire `User` object only to read `user.email`. |
| **Data coupling** | Modules communicate only through simple parameters that are all used. | `calculate_tax(amount, rate)`. |
| **Abstraction coupling** | A module depends only on an interface, not on any concrete implementation. | `UserService` depends on the abstract `Repository`. |

The lower two rows are the targets. The Dependency Inversion Principle in Section 9 is precisely a technique for converting the upper rows into the bottom row.

### 2.4 Why object-oriented programming alone is not sufficient

Object-oriented programming supplies four mechanisms: encapsulation, abstraction, inheritance, and polymorphism. These are mechanisms, not policies. They determine what is expressible, not what is advisable.

Consider the analogy of a language and its grammar, which is used here because the correspondence is exact rather than decorative. Vocabulary determines which words exist; grammar determines which arrangements of those words produce meaning. A speaker who knows ten thousand words but no grammar produces sequences that are lexically valid and semantically useless. Object-oriented programming is the vocabulary of classes, methods, and inheritance relationships. SOLID is a grammar that constrains how those elements may be arranged so that the resulting structure remains comprehensible and modifiable.

Concretely, inheritance permits a subclass to override a method in a way that contradicts the parent's guarantees; nothing in the language prevents it. Encapsulation permits a class to hide fifteen unrelated responsibilities behind a clean public interface; the compiler is satisfied. The mechanisms are neutral. SOLID supplies the missing judgement.

### 2.5 Historical origin

The principles were formulated separately over roughly two decades and later assembled under one acronym.

| Principle | Originator | Year of first clear formulation |
|---|---|---|
| Open/Closed | Bertrand Meyer, in *Object-Oriented Software Construction* | 1988 |
| Liskov Substitution | Barbara Liskov, in a keynote address; formalised with Jeannette Wing | 1987, formalised 1994 |
| Single Responsibility | Robert C. Martin, drawing on earlier work on cohesion by Tom DeMarco and Meilir Page-Jones | 1990s |
| Interface Segregation | Robert C. Martin, arising from consulting work at Xerox | 1990s |
| Dependency Inversion | Robert C. Martin | 1996 |

Martin collected the five in his writings during the late 1990s. Michael Feathers proposed the SOLID mnemonic in the early 2000s. The acronym imposes a memorable ordering but not a logical one: the principles were not designed as a sequence and need not be applied in the order S, O, L, I, D.

### 2.6 What the principles are, and what they are not

SOLID principles are **heuristics**, meaning rules of thumb that produce good outcomes in the majority of cases within their domain of applicability, but which admit exceptions and require judgement to apply. They are not theorems, not language rules, and not universal laws. A design that violates a SOLID principle is not automatically defective; it is a design that has accepted a specific risk, and the engineer should be able to state why that risk is acceptable.

Section 14 treats this point at length, because the most common failure mode among developers newly exposed to SOLID is not under-application but over-application.

---

## 3. The Five Principles at a Glance

| Letter | Name | Formal essence | Primary variable improved | Chief mechanism |
|---|---|---|---|---|
| **S** | Single Responsibility Principle | A module should have one, and only one, reason to change. | Cohesion | Separation of responsibilities into distinct classes |
| **O** | Open/Closed Principle | Software entities should be open for extension but closed for modification. | Rigidity | Polymorphic dispatch behind a stable abstraction |
| **L** | Liskov Substitution Principle | Subtypes must be substitutable for their base types without altering program correctness. | Reliability of polymorphism | Contract preservation in subclasses |
| **I** | Interface Segregation Principle | Clients should not be forced to depend on methods they do not use. | Coupling | Decomposition of wide interfaces into narrow, client-specific ones |
| **D** | Dependency Inversion Principle | High-level modules and low-level modules should both depend on abstractions. | Coupling and testability | Inversion of the dependency direction through an interface |

Read the table once now and again after finishing Section 9. The second reading will carry substantially more information, which is a reasonable test of whether the intervening material has been absorbed.

---

## 4. Foundational Vocabulary

The five principles are stated in a compact technical vocabulary. Ambiguity in these terms is the primary cause of misapplication, so each is defined here and used consistently thereafter.

| Term | Definition |
|---|---|
| **Module** | Any cohesive unit of code with a boundary: a function, a class, a package, or a deployable service. SOLID statements that say "class" apply to all of these; the class is simply the most common granularity. |
| **Client** | The code that calls a module. If `OrderService` calls `PaymentGateway`, then `OrderService` is the client of `PaymentGateway`. The direction matters: principles such as ISP are stated from the client's point of view. |
| **Abstraction** | A description of what a module does, stated without reference to how it does it. In Python this is realised as an abstract base class, a `typing.Protocol`, or an informal duck-typed convention. |
| **Concretion** | A specific implementation of an abstraction. `MySQLRepository` is a concretion of the abstraction `Repository`. |
| **Interface** | The set of operations a module exposes, together with the guarantees attached to them. Python has no `interface` keyword; the role is played by abstract base classes and protocols. |
| **Contract** | The complete agreement between a module and its callers: what the caller must guarantee before invocation (preconditions), what the module guarantees on return (postconditions), and what remains true throughout (invariants). Contracts include behaviour, not just method signatures. |
| **Dependency** | A relationship in which module A requires module B in order to compile, import, or execute correctly. The arrow points from the dependent to the dependency. |
| **High-level module** | A module that expresses policy: the business rules and workflows that give the application its purpose. Example: "an order must be paid before it is shipped." |
| **Low-level module** | A module that expresses mechanism: the technical details of how an operation is physically performed. Example: opening a TCP connection to a payment provider. |
| **Axis of change** | A dimension along which requirements are expected to vary over time, such as "new payment methods will be added" or "the tax rate will change." Identifying the correct axes is the central skill in applying OCP. |
| **Blast radius** | The set of modules that must be inspected, modified, or retested as a consequence of a single change. Minimising blast radius is the practical objective of SRP and DIP. |
| **Polymorphism** | The ability of a single call site to invoke different implementations depending on the runtime type of the receiving object. This is the language mechanism on which OCP, LSP, and DIP all depend. |
| **Composition** | Building behaviour by holding references to other objects and delegating to them, as opposed to inheriting behaviour from a parent class. |
| **Dependency injection** | The technique of supplying a module's dependencies from outside rather than having the module construct them internally. Discussed in Section 9.7. |

Two of these deserve immediate elaboration, because they are the most frequently confused.

**Interface versus contract.** An interface is a syntactic construct: a list of method names, parameters, and return types. A contract is a semantic one: it additionally specifies what the methods must actually do. A subclass can satisfy an interface perfectly while violating the contract, for instance by implementing `withdraw(amount)` with the correct signature but permitting the balance to go negative when the parent guaranteed it would not. The Liskov Substitution Principle in Section 7 is concerned with contracts, not interfaces, and this distinction is the entire subject of that section.

**Policy versus mechanism.** The distinction between high-level and low-level modules is not about position in a call stack or about how many lines of code a module contains. It is about whether the module states a rule of the business domain or a technique for accomplishing something. "Apply a 10 percent discount to premium customers" is policy and would remain true if the company migrated from PostgreSQL to DynamoDB. "Execute an INSERT statement against a PostgreSQL connection pool" is mechanism and has no meaning in the business domain. Policy is stable and valuable; mechanism is volatile and replaceable. The Dependency Inversion Principle in Section 9 exists to ensure that stable policy never depends on volatile mechanism.

---

## 5. Single Responsibility Principle (SRP)

### 5.1 Formal statement

> "A class should have one, and only one, reason to change."
>
> Robert C. Martin

Martin later restated the principle in a form he considered less prone to misreading:

> "A module should be responsible to one, and only one, actor."

Both formulations are used below, because each clarifies a different aspect of the same idea.

### 5.2 Term-by-term interpretation

The principle contains three terms whose ordinary-language meanings are misleading in this context.

**"Responsibility."** In SRP a responsibility is not a task, a method, or a feature. A responsibility is a **reason to change**, and a reason to change originates with a person or group who has the authority to request that change. Finance owns the rules for computing pay. Operations owns the rules for scheduling shifts. The database administration team owns the storage schema. Each of these is a distinct source of change requests.

**"Reason to change."** This phrase is deliberately about causes, not effects. Two pieces of code that happen to change at the same time do not share a reason to change if the underlying causes are unrelated. Conversely, two pieces of code that change at different times can share a reason if both changes trace back to the same decision by the same group.

**"One."** The principle does not restrict the number of methods, lines, or fields. A class with twenty methods that all serve a single purpose and all change together in response to requests from a single actor satisfies SRP. A class with two methods that answer to two different departments violates it.

**Definition (Single Responsibility Principle).** A module should have exactly one actor, meaning one person or group of stakeholders, whose changing requirements can cause that module to be modified.

### 5.3 The problem it solves

Consider what happens structurally when a single class answers to three actors. Every request from any of the three actors causes the same file to be edited. Three consequences follow mechanically.

**Merge contention.** Three teams edit the same file concurrently. Version control conflicts are frequent and their resolution requires someone who understands all three domains.

**Unintended coupling of independent concerns.** A change requested by Finance is deployed together with whatever half-finished work the Reporting team left in the same file. The two concerns share a release, a review, and a rollback unit even though they are logically unrelated. This is the mechanism by which fragility (Section 2.2) arises: the person changing the pay calculation had no reason to suspect the report generator, so they did not test it.

**Loss of independent reusability.** Another system needs only the pay calculation. Importing the class drags in the database driver and the PDF renderer, because they live in the same module. This is immobility.

The principle addresses all three by ensuring that the unit of code corresponds to the unit of organisational responsibility.

### 5.4 Worked violation

The following class is representative of code that accumulates naturally when features are added without periodic restructuring.

```python
class Employee:
    """
    Represents an employee AND computes their pay AND persists them AND
    renders them into reports. The conjunction in that sentence is the defect.
    """

    def __init__(self, name, hours_worked, hourly_rate):
        self.name = name
        self.hours_worked = hours_worked
        self.hourly_rate = hourly_rate

    def calculate_pay(self):
        # Owned by Finance. Overtime rules, tax slabs, and bonus policy
        # will all eventually land inside this method.
        return self.hours_worked * self.hourly_rate

    def save(self):
        # Owned by the database team. The choice of engine, the schema,
        # the connection handling, and the retry policy all live here.
        print(f"INSERT INTO employees VALUES ('{self.name}', ...)")

    def generate_report(self, output_format):
        # Owned by the Reporting team. Layout, branding, and supported
        # export formats change on their schedule, not Finance's.
        if output_format == "pdf":
            print(f"Rendering PDF for {self.name}")
        elif output_format == "html":
            print(f"Rendering HTML for {self.name}")
```

### 5.5 Diagnosis

The diagnostic procedure is mechanical and should be applied literally rather than intuitively.

**Step 1: List every method and ask who requests changes to it.**

| Method | Actor who owns the rules | Example change request |
|---|---|---|
| `calculate_pay` | Finance | "Overtime above 40 hours is paid at 1.5 times the base rate." |
| `save` | Database administration | "We are migrating from MySQL to PostgreSQL." |
| `generate_report` | Reporting and Compliance | "Payslips must now be exportable as CSV for the auditor." |

**Step 2: Count the distinct actors.** Three distinct actors implies three reasons to change, which implies three responsibilities in one class. The principle is violated.

**Step 3: Verify by constructing a concrete failure scenario.** Suppose Finance changes the overtime rule and, while editing the file, a developer alters a shared helper used by `generate_report`. The payroll test suite passes because it does not exercise reporting. The defect reaches production in a module that no one associated with the change. This scenario is not hypothetical; it is the standard mechanism by which fragility manifests.

There is a subtler diagnostic worth internalising. Examine which methods use which fields. In the class above, `calculate_pay` uses `hours_worked` and `hourly_rate`; `generate_report` uses only `name`. When the methods of a class partition cleanly into groups that touch disjoint sets of fields, the class is almost certainly implementing multiple responsibilities. This measure is formalised in the software metrics literature as **Lack of Cohesion of Methods (LCOM)**, and while the numeric metric is rarely worth computing by hand, the underlying observation is a reliable signal.

### 5.6 Resolution

Each responsibility is extracted into a class whose name states its single purpose.

```python
class Employee:
    """
    A pure data holder for employee attributes.

    Design decision: this class deliberately contains no behaviour beyond
    holding state. It changes only when the *definition* of an employee
    changes, for instance when HR introduces an employment-type field.
    It does not change when pay rules, storage, or report layouts change.
    """

    def __init__(self, name, hours_worked, hourly_rate):
        self.name = name
        self.hours_worked = hours_worked
        self.hourly_rate = hourly_rate


class PayrollCalculator:
    """
    Owns all monetary computation for employees. Answers to Finance.

    Overtime rules, tax handling, and bonus policy will be added here as
    the domain grows, and none of those additions can affect persistence
    or reporting, because this class shares no code with them.
    """

    OVERTIME_THRESHOLD_HOURS = 40
    OVERTIME_MULTIPLIER = 1.5

    def calculate_pay(self, employee):
        # The overtime split is expressed as explicit arithmetic rather
        # than a branch on hours, so that both components remain visible
        # and independently testable when tax rules are layered on later.
        regular_hours = min(employee.hours_worked, self.OVERTIME_THRESHOLD_HOURS)
        overtime_hours = max(0, employee.hours_worked - self.OVERTIME_THRESHOLD_HOURS)

        regular_pay = regular_hours * employee.hourly_rate
        overtime_pay = overtime_hours * employee.hourly_rate * self.OVERTIME_MULTIPLIER
        return regular_pay + overtime_pay


class EmployeeRepository:
    """
    Owns persistence of employees. Answers to the database team.

    The name 'Repository' is conventional and signals a specific contract:
    this class translates between domain objects and storage, and it
    contains no business rules. A tax calculation appearing in this class
    would itself be an SRP violation.
    """

    def save(self, employee):
        print(f"Persisting {employee.name}")

    def find_by_name(self, name):
        print(f"Loading {name}")


class PayslipRenderer:
    """
    Owns presentation of employee pay. Answers to Reporting.

    Note that this class receives the already-computed pay rather than an
    Employee, so that it has no opportunity to recompute or reinterpret
    monetary values. Keeping the calculation out of the renderer is what
    prevents the two responsibilities from silently merging again.
    """

    def render(self, employee, net_pay, output_format):
        if output_format == "pdf":
            print(f"PDF payslip for {employee.name}: {net_pay}")
        elif output_format == "html":
            print(f"HTML payslip for {employee.name}: {net_pay}")
```

The coordination that previously lived inside `Employee` now lives at the call site or in an explicit orchestrator.

```python
employee = Employee("Ananya", hours_worked=45, hourly_rate=500)

calculator = PayrollCalculator()
repository = EmployeeRepository()
renderer = PayslipRenderer()

net_pay = calculator.calculate_pay(employee)
repository.save(employee)
renderer.render(employee, net_pay, output_format="pdf")
```

The effect on blast radius is the point of the exercise and can be tabulated.

| Change request | Before refactoring | After refactoring |
|---|---|---|
| New overtime rule | `Employee` edited; payroll, persistence, and reporting tests all re-run | `PayrollCalculator` edited only |
| Migrate to PostgreSQL | `Employee` edited; all tests re-run | `EmployeeRepository` edited only |
| Add CSV payslip export | `Employee` edited; all tests re-run | `PayslipRenderer` edited only |
| Add an `employee_id` field | `Employee` edited | `Employee` edited, plus repository mapping |

The final row is instructive. Adding a field genuinely does touch two classes, because storage must know about the new field. SRP does not promise that every change touches exactly one file; it promises that each file changes for exactly one reason. The repository changes because storage rules changed, which is its own reason.

### 5.7 Alternative techniques for the same goal

Extracting classes is the standard resolution, but it is not the only one, and choosing it reflexively is itself a mistake.

**Module-level separation without new classes.** In a small program, moving `calculate_pay`, `save`, and `render` into three separate modules as plain functions achieves the same separation of change reasons at lower ceremony. Python's module system is a first-class unit of encapsulation, and a function in `payroll.py` is separated from a function in `storage.py` just as effectively as two classes would be. Classes earn their place when the behaviour needs configuration, state, or polymorphic substitution.

**The Facade pattern to preserve caller convenience.** Splitting a class multiplies the number of objects a caller must assemble. When the original single-call convenience matters, a thin facade restores it without recombining the responsibilities.

```python
class PayrollService:
    """
    A facade that orchestrates the specialised collaborators.

    This class has exactly one reason to change: the *sequence* of steps
    in the payroll workflow. It contains no pay arithmetic, no SQL, and no
    formatting, so a change to any of those does not reach it.
    """

    def __init__(self, calculator, repository, renderer):
        self.calculator = calculator
        self.repository = repository
        self.renderer = renderer

    def process(self, employee, output_format="pdf"):
        net_pay = self.calculator.calculate_pay(employee)
        self.repository.save(employee)
        self.renderer.render(employee, net_pay, output_format)
        return net_pay
```

The facade is worth studying because it demonstrates that "orchestrating a workflow" is itself a legitimate single responsibility. The workflow changes when the business changes the order or composition of steps, which is a genuine and distinct reason to change.

**Deliberate non-separation for value objects.** A class such as `Money` or `Date` may legitimately contain arithmetic, comparison, parsing, and formatting. These appear to be several responsibilities but are all owned by the same actor, namely whoever defines what money or a date means in the domain, and they all change together. Splitting them would produce anaemic fragments and increase, not decrease, the cost of change.

The following table summarises the decision.

| Situation | Recommended approach | Reason |
|---|---|---|
| Methods answer to different departments | Extract separate classes | Distinct actors, distinct release cadences |
| Small script, no state, no substitution needed | Separate modules with plain functions | Same separation, lower ceremony |
| Callers need a single convenient entry point | Extract classes and add a facade | Preserves separation and convenience simultaneously |
| Cohesive value object with many methods | Leave as one class | One actor, methods change together |

### 5.8 Costs and limits

SRP is not free, and the costs are the reason it must be applied with judgement.

**Increased indirection.** After splitting, understanding the payroll flow requires reading four files instead of one. For a reader unfamiliar with the codebase this is a genuine comprehension cost. The cost is worth paying when the classes change independently; it is pure overhead when they do not.

**Anaemic domain models.** Aggressively stripping behaviour from entities produces classes that are little more than dictionaries with attribute access, while all logic accumulates in service classes. This is a recognised anti-pattern, because it discards the principal benefit of object orientation, namely the co-location of data with the operations that maintain its invariants. Behaviour that enforces an entity's own invariants, such as `Order.add_item` rejecting a negative quantity, belongs on the entity. Behaviour that coordinates across entities or reaches outside the process belongs elsewhere.

**Premature decomposition.** Splitting a class before the axes of change are known frequently produces the wrong split, and an incorrect boundary is more expensive than no boundary, because it must first be dismantled before the correct one can be created.

### 5.9 Detection heuristics

| Signal | Why it indicates an SRP violation |
|---|---|
| The class name contains "and", or is vague ("Manager", "Processor", "Helper", "Util") | A name that cannot be stated precisely usually reflects a purpose that is not singular. |
| Methods partition into groups that use disjoint sets of fields | Low cohesion; the groups are separate concepts sharing a file by accident. |
| The class contains both business rules and input/output operations | Business rules change with the domain; input/output changes with infrastructure. These are always distinct actors. |
| Version control history shows commits from several teams for unrelated reasons | The most reliable empirical signal, because it measures actual change reasons rather than predicted ones. |
| Unit testing the class requires mocking a database, a network client, or a clock | Direct evidence that non-domain responsibilities have leaked in. |
| The file appears near the top of a "most frequently modified files" report | High change frequency concentrated in one file usually means many reasons to change converge there. |

The fourth and sixth signals deserve emphasis because they are empirical rather than speculative. Running `git log --format=format: --name-only | sort | uniq -c | sort -rg | head -20` over a repository lists the files that change most often. Those files are the practical candidates for SRP analysis, since they are where the cost of poor separation is actually being paid.

### 5.10 Checkpoint questions

**Q1.** A `ShoppingCart` class exposes `add_item`, `remove_item`, `update_quantity`, `apply_coupon`, `subtotal`, and `clear`. Six public methods. Does this violate SRP?

<details><summary>Answer</summary>

Not on the evidence given. All six methods operate on the same state, namely the collection of cart lines, and all six change for the same reason, namely a change to what a cart is or how cart contents are manipulated. Method count is irrelevant to SRP. The one method worth examining further is `apply_coupon`: if coupon eligibility involves promotional rules owned by a marketing team, that logic constitutes a second actor and should be extracted into a separate pricing or promotion component, leaving the cart to merely record the resulting adjustment.

</details>

**Q2.** A developer splits a 300-line `ReportGenerator` into `ReportGeneratorPartOne` and `ReportGeneratorPartTwo`, each 150 lines. Has SRP been applied?

<details><summary>Answer</summary>

No. SRP concerns reasons to change, not file size. Both halves still change for the same reasons and must be modified together, so the single responsibility has merely been distributed across two files. The result is worse than the original, because a reader must now hold two files in mind to understand one concept, with no compensating reduction in blast radius. A correct split would divide the class along actor boundaries, for example separating data aggregation, which changes when the business defines new metrics, from layout, which changes when the presentation requirements change.

</details>

**Q3.** Two classes, `InvoiceCalculator` and `TaxCalculator`, are always modified in the same commit. Does this prove an SRP violation?

<details><summary>Answer</summary>

It is a signal warranting investigation, not proof. If both change because the same tax authority issued a new rule, they share a reason to change and should probably be one module. If they change together merely because the team happens to schedule finance work in batches, the underlying reasons remain distinct and the separation is correct. The test is causal, not temporal: identify the originating decision, not the calendar date.

</details>

---

## 6. Open/Closed Principle (OCP)

### 6.1 Formal statement

> "Software entities (classes, modules, functions) should be open for extension, but closed for modification."
>
> Bertrand Meyer, *Object-Oriented Software Construction*, 1988

### 6.2 Term-by-term interpretation

**"Open for extension."** The behaviour of the module can be augmented. New cases, new variants, and new capabilities can be introduced.

**"Closed for modification."** The augmentation is achieved without editing the module's existing source code. Its file remains untouched, its compiled artefact remains valid, and its existing tests remain relevant without revision.

The two clauses appear contradictory, since adding behaviour to something usually means changing it. The contradiction dissolves once a level of indirection is introduced. The module is written against an abstraction; new behaviour arrives as a new implementation of that abstraction; the module never learns that the new implementation exists. Polymorphic dispatch is the mechanism that makes the apparent contradiction tractable, which is why OCP cannot be discussed independently of polymorphism.

**Definition (Open/Closed Principle).** A module satisfies OCP with respect to a particular axis of change if new variations along that axis can be added by writing new code rather than by editing existing code.

The qualifier "with respect to a particular axis of change" is essential and is omitted in most informal presentations. No module can be closed against every conceivable change. A discount system may be closed against the addition of new discount types while remaining wide open to a change in the signature of the discount calculation itself. Meyer's principle is therefore a directive to identify the axes along which change is likely and to arrange the design so that those specific axes require extension rather than modification.

### 6.3 The problem it solves

Modifying working code carries a category of risk that adding new code does not.

| Risk of modifying existing code | Explanation |
|---|---|
| Regression | Existing behaviour may be altered inadvertently. Code that was previously verified must be re-verified. |
| Test invalidation | Tests covering the modified unit must be reviewed, and often rewritten, even though they concern behaviour that has not changed. |
| Ripple through dependents | Every module that depends on the modified one may be affected, expanding the review and retest surface. |
| Deployment coupling | The new feature and all pre-existing behaviour in the same unit are released together and must be rolled back together. |

Adding a new class that no existing code references carries none of these risks in principle. The existing code cannot behave differently, because it has not changed. Verification of the new class is confined to the new class. This asymmetry between modification and addition is the entire economic argument for OCP.

### 6.4 Worked violation

```python
class DiscountCalculator:
    """Computes a discount based on the customer's category."""

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

The requirement history of such a class is predictable. A corporate tier is introduced at 15 percent, so an `elif` is added. A student tier follows at 8 percent. A first-purchase promotion is introduced, which is not a customer type at all but a condition, so a boolean parameter is threaded through the signature. A regional festival discount is added, requiring a date parameter. Within a year the method is several hundred lines long, its parameter list encodes four orthogonal concerns, and no developer can modify one branch with confidence that the others are unaffected.

Observe precisely which property has been lost. Each new customer type requires editing a file that already contains working, tested logic for every previous customer type. The blast radius of adding a customer type is the entire discount subsystem.

### 6.5 Diagnosis

**The conditional-on-type test.** Locate every conditional that branches on a type, a category name, an enumeration value, or a string tag. Each such conditional is a point at which the addition of a new value forces modification of existing code. This is the single most reliable indicator of an OCP violation.

**The shotgun surgery test.** Trace what a realistic new requirement would touch. If adding one conceptual thing, such as a customer tier, requires edits at several locations, and especially if it requires edits in several files that must be kept mutually consistent, the design is not closed along that axis. The failure mode where a developer updates three of the four required locations and ships a partially implemented tier is the direct consequence.

**Distinguishing genuine violations from acceptable conditionals.** Not every conditional is an OCP violation. A conditional is a violation when it branches on a set of values that is expected to grow. A conditional that branches on a genuinely fixed set, such as the three possible outcomes of a comparison, is stable and should not be replaced with polymorphism.

### 6.6 Resolution

The resolution introduces an abstraction that represents the varying concept, then supplies one implementation per variant.

```python
from abc import ABC, abstractmethod


class DiscountPolicy(ABC):
    """
    The stable abstraction. Everything that varies between customer tiers
    is pushed behind this single method, and everything that does not vary
    stays in the calling code.

    Naming note: 'Policy' rather than 'Strategy' is used here because the
    concept is a business rule. The structural pattern is identical to the
    Strategy pattern, which is examined in the behavioural patterns
    document; OCP is the principle, Strategy is one pattern that realises it.
    """

    @abstractmethod
    def discount_for(self, amount: float) -> float:
        """
        Return the absolute discount amount, not the discounted total.

        Contract note: returning the discount rather than the final price
        means the caller retains control over how the discount is applied,
        combined with other discounts, or reported. Returning the final
        price would have embedded that decision inside every policy and
        made discount stacking impossible to implement later.
        """
        ...


class RegularCustomerDiscount(DiscountPolicy):
    def discount_for(self, amount):
        return amount * 0.05


class PremiumCustomerDiscount(DiscountPolicy):
    def discount_for(self, amount):
        return amount * 0.10


class VIPCustomerDiscount(DiscountPolicy):
    def discount_for(self, amount):
        return amount * 0.20


class NoDiscount(DiscountPolicy):
    """
    The Null Object variant. Its existence removes the need for callers to
    check whether a policy is present, which eliminates a null check at
    every call site and prevents the reappearance of conditionals in the
    client code.
    """

    def discount_for(self, amount):
        return 0.0
```

The consuming code is written once against the abstraction and is then never modified again on this axis.

```python
class Checkout:
    def final_price(self, amount: float, policy: DiscountPolicy) -> float:
        # This method contains no knowledge of which policies exist. Adding
        # a hundred new policies leaves this line untouched, which is the
        # operational meaning of "closed for modification".
        return amount - policy.discount_for(amount)
```

Introducing a corporate tier is now purely additive.

```python
class CorporateDiscount(DiscountPolicy):
    """
    Added later. No existing file was edited to introduce this class,
    so no existing test could have been invalidated by its addition.
    """

    def discount_for(self, amount):
        return amount * 0.15
```

### 6.7 Alternative techniques for the same goal

Polymorphic classes are the canonical realisation of OCP, but several alternatives achieve extensibility at different cost and expressiveness points. Selecting among them is a genuine engineering decision.

**Alternative 1: dictionary dispatch.** The mapping from key to behaviour is stored in a data structure rather than encoded in control flow.

```python
DISCOUNT_RATES = {
    "regular": 0.05,
    "premium": 0.10,
    "vip": 0.20,
}


def discount_for(customer_type: str, amount: float) -> float:
    # Adding a tier means adding a dictionary entry. The function is
    # untouched, so it is closed for modification along this axis.
    return amount * DISCOUNT_RATES.get(customer_type, 0.0)
```

This is appropriate when every variant differs only by a value. It becomes unsuitable the moment a variant needs behaviour rather than a constant, for example a tier whose discount is capped at a maximum amount or depends on order history.

**Alternative 2: first-class functions.** Python treats functions as objects, so a policy can be a function rather than a class instance.

```python
def regular_discount(amount):
    return amount * 0.05


def volume_discount(amount):
    # Behaviour, not merely a constant, so the dictionary-of-rates approach
    # would not have accommodated this variant.
    return amount * 0.15 if amount > 100_000 else amount * 0.05


def final_price(amount, discount_fn):
    return amount - discount_fn(amount)
```

The trade-off is explicit. Functions are lighter, require no class declaration, and are trivially testable. They lose the formal contract that an abstract base class enforces, they cannot hold configured state without closures, and they cannot be extended with additional operations later without changing every call site. Functions are preferable when the abstraction has exactly one operation and no state; classes are preferable otherwise.

**Alternative 3: registry with self-registration.** The set of implementations is discovered rather than enumerated, which closes the *composition root* as well as the consuming code.

```python
class DiscountRegistry:
    """
    Maps a tier name to a policy instance.

    Without a registry, some module must contain a mapping from string to
    class, and that mapping is itself a place that must be edited whenever
    a tier is added. The registry moves that edit into the new class's own
    file, so the addition remains confined to a single new file.
    """

    _policies: dict = {}

    @classmethod
    def register(cls, tier_name):
        def decorator(policy_class):
            cls._policies[tier_name] = policy_class()
            return policy_class
        return decorator

    @classmethod
    def get(cls, tier_name) -> DiscountPolicy:
        return cls._policies.get(tier_name, NoDiscount())


@DiscountRegistry.register("corporate")
class CorporateDiscountV2(DiscountPolicy):
    def discount_for(self, amount):
        return amount * 0.15
```

The cost of a registry is reduced traceability: static analysis and simple text search no longer reveal where a policy is used, because the connection is made at runtime. Registries are justified in plugin architectures and frameworks, where the set of implementations is genuinely open-ended and may be supplied by third parties. They are over-engineering for a fixed internal set of five tiers.

**Alternative 4: accepting the conditional.** When the set of variants is small, stable, and unlikely to grow, an `if` statement is the correct design. It is shorter, immediately readable, and imposes no indirection. The engineering error is not the use of a conditional; it is the use of a conditional along an axis that is known to be growing.

The following table summarises the selection criteria.

| Technique | Use when | Principal cost |
|---|---|---|
| Conditional (`if`/`elif`) | Variants are few and the set is stable | Every new variant modifies existing, tested code |
| Dictionary of values | Variants differ only by data | Cannot express variant-specific behaviour |
| First-class functions | Abstraction has one operation and no state | No enforced contract; hard to extend the abstraction later |
| Polymorphic classes | Variants have behaviour, possibly state, and the set will grow | More files, more indirection, more ceremony |
| Registry | The implementation set is open-ended or plugin-supplied | Runtime wiring reduces traceability and complicates debugging |

### 6.8 Costs and limits

**Every abstraction is a bet on a predicted axis of change.** If the prediction is correct, the abstraction pays for itself the first time a variant is added. If the prediction is wrong, the codebase carries permanent indirection that serves nothing and obstructs the change that actually arrives. Predicting the wrong axis is a common and expensive error, which is why the widely quoted guideline is to write the conditional first and introduce the abstraction when the second or third variant appears. By then the axis is established by evidence rather than by speculation.

**Closing one axis usually opens another.** In the discount example, the design is now closed against new tiers but open to modification if the `discount_for` signature must change, since every implementation would then require editing. Abstractions redistribute the cost of change; they do not eliminate it. Choosing which axis to protect is therefore a decision about which changes are most probable.

**Indirection has a comprehension cost.** Tracing a call through an abstract base class to an unknown implementation is harder than reading a conditional. In a codebase with dozens of unnecessary abstractions, this cost accumulates into the opacity described in Section 2.2.

### 6.9 Detection heuristics

| Signal | Why it indicates an OCP violation |
|---|---|
| A conditional branching on a type name, category, or enumeration | Each new value forces modification of existing code. |
| Use of `isinstance` to select behaviour | An explicit substitute for polymorphism, and it must be edited when a new subtype appears. |
| A comment such as "add new types here as well" | Direct evidence that the design requires coordinated edits at multiple sites. |
| The same `elif` chain replicated in several files | The strongest form of the violation: adding a variant requires several consistent edits, and inconsistency between them is a defect. |
| A parameter list that has accumulated flags over time | Each flag was almost certainly added to accommodate a variant that should have been a separate implementation. |

### 6.10 Checkpoint questions

**Q1.** A function branches on three cases: less than, equal to, and greater than. Does this violate OCP?

<details><summary>Answer</summary>

No. The set of possible orderings between two comparable values is mathematically closed at three; no fourth case can ever be added. OCP protects against growth along an axis, and this axis cannot grow. Replacing this conditional with polymorphism would add indirection with no possibility of future benefit.

</details>

**Q2.** After refactoring to polymorphic discount policies, some code must still decide which policy object to construct for a given customer. Has the conditional simply moved rather than disappeared?

<details><summary>Answer</summary>

The conditional has moved, and that is precisely the intended outcome rather than a failure of the refactoring. The decision about which implementation to use is now isolated at a single point, conventionally called the composition root or a factory, and it is the only place that must change when a tier is added. Previously the tier knowledge was mixed into the calculation logic, so a tier addition and a calculation change occupied the same file and the same tests. Concentrating unavoidable variability at one deliberate location, rather than diffusing it through business logic, is the achievable form of OCP. Section 6.7 shows how a registry can shrink even that remaining edit to zero.

</details>

**Q3.** A codebase has one discount type and the product manager states no others are planned. Should the polymorphic design be applied?

<details><summary>Answer</summary>

No. With a single variant, the abstraction has no variation to absorb and constitutes speculative generality. The appropriate action is to write the direct implementation and introduce the abstraction when a second variant appears, at which point the refactoring is mechanical and the axis of change has been demonstrated by evidence rather than assumed.

</details>

---

## 7. Liskov Substitution Principle (LSP)

### 7.1 Formal statement

> "Let φ(x) be a property provable about objects x of type T. Then φ(y) should be true for objects y of type S where S is a subtype of T."
>
> Barbara Liskov and Jeannette Wing, *A Behavioral Notion of Subtyping*, 1994

The engineering restatement, which is the form used in practice:

> Code written against a base type must continue to behave correctly when given any subtype, without knowing that it received a subtype.

### 7.2 Term-by-term interpretation

**"Property provable about objects of type T."** This includes every guarantee a caller may legitimately rely upon: the range of accepted inputs, the guarantees on returned values, the exceptions that may be raised, the invariants maintained across the object's lifetime, and the observable effects of calling methods in a particular order. It does not include implementation details such as which algorithm is used internally.

**"Subtype."** Liskov's notion of subtype is **behavioural**, not syntactic. Declaring `class Square(Rectangle)` establishes a syntactic subtype relationship in Python. Whether `Square` is a behavioural subtype of `Rectangle` is a separate question decided entirely by whether the contract is preserved. LSP asserts that the syntactic relationship should be created only when the behavioural relationship holds.

**Definition (behavioural subtyping).** Type S is a behavioural subtype of type T if every program that is correct when using instances of T remains correct when those instances are replaced by instances of S.

**Definition (Liskov Substitution Principle).** Inheritance should be used only when the derived type is a behavioural subtype of the base type. Where the behavioural relationship does not hold, the inheritance relationship must not be declared.

### 7.3 The rules that constitute the contract

Liskov and Wing decomposed behavioural subtyping into a small set of verifiable conditions. These are the operational form of the principle and the checklist that should be applied to any proposed override.

| Rule | Statement | Practical meaning |
|---|---|---|
| **Preconditions cannot be strengthened** | The subtype must accept at least every input the base type accepts. | If the base accepts any integer, the subtype cannot reject negative ones. |
| **Postconditions cannot be weakened** | The subtype must guarantee at least everything the base type guarantees. | If the base returns a sorted list, the subtype cannot return an unsorted one. |
| **Invariants must be preserved** | Every condition the base type maintains across its lifetime must continue to hold. | If the base guarantees a non-negative balance, the subtype cannot permit a negative one. |
| **History constraint** | The subtype must not permit state transitions the base type forbids. | If the base type is immutable after construction, the subtype cannot introduce a mutator. |
| **Exception constraint** | The subtype must not raise exception types the base type's contract does not permit. | A subtype cannot raise `NotImplementedError` for an operation the base declares as supported. |
| **Return type covariance** | The subtype may return a more specific type than the base, but never a more general one. | Returning `Sparrow` where `Bird` is promised is acceptable; returning `object` is not. |
| **Parameter type contravariance** | The subtype may accept a more general parameter type than the base, but never a more specific one. | Accepting `Iterable` where `list` was promised is acceptable; accepting only `SortedList` is not. |

The last two rules follow directly from the first two. A narrower parameter type is a strengthened precondition; a broader return type is a weakened postcondition. They are listed separately because type checkers can verify them mechanically while the behavioural rules generally cannot be verified automatically.

A memory device that captures the asymmetry: a subtype may **demand less and deliver more**, never the reverse.

### 7.4 Worked violation 1: the Square and Rectangle problem

This example is canonical because it demonstrates that a relationship which is true in the problem domain can be false in the behavioural domain.

```python
class Rectangle:
    """
    Contract: width and height are independently mutable. Setting one
    has no effect on the other. This guarantee is not written in any
    method signature, yet every caller depends on it.
    """

    def __init__(self, width, height):
        self._width = width
        self._height = height

    def set_width(self, width):
        self._width = width

    def set_height(self, height):
        self._height = height

    def area(self):
        return self._width * self._height


class Square(Rectangle):
    """
    Mathematically a square is a rectangle, so inheritance appears
    justified. The invariant width == height must be maintained, which
    forces each setter to modify both dimensions.
    """

    def __init__(self, side):
        super().__init__(side, side)

    def set_width(self, width):
        self._width = width
        self._height = width      # Silently violates the independence guarantee

    def set_height(self, height):
        self._width = height
        self._height = height
```

The violation becomes observable in any client written against the base contract.

```python
def resize_and_verify(rectangle: Rectangle):
    """
    A perfectly reasonable function written against Rectangle's contract.
    It relies only on the independence of width and height, which the
    base class guarantees.
    """
    rectangle.set_width(10)
    rectangle.set_height(5)
    assert rectangle.area() == 50, f"Expected 50, computed {rectangle.area()}"


resize_and_verify(Rectangle(1, 1))   # Passes: area is 50
resize_and_verify(Square(1))         # Fails: area is 25
```

The failure is not in `Square` considered in isolation, which is internally consistent, nor in `resize_and_verify`, which uses only documented behaviour. The failure is in the declaration that `Square` is a subtype of `Rectangle`. `Square` strengthens an invariant, namely that the two dimensions are always equal, and any strengthened invariant on a mutable object is visible to clients as weakened postconditions on the setters.

A widespread misdiagnosis holds that the problem is mathematical. It is not. Geometry is untouched. The problem is that `Rectangle` was defined as a **mutable** type with independent dimensions, and that specific contract admits no square. The following demonstrates the point by changing the contract rather than the geometry.

```python
class ImmutableRectangle:
    """
    With no setters, the independence guarantee has no observable
    consequence, because dimensions can never be changed after
    construction. The contract that Square violated no longer exists.
    """

    def __init__(self, width, height):
        self._width = width
        self._height = height

    @property
    def width(self):
        return self._width

    @property
    def height(self):
        return self._height

    def area(self):
        return self._width * self._height

    def with_width(self, width):
        # Returns a new object rather than mutating this one. A subtype
        # can legitimately return a different concrete type here as long
        # as it remains an ImmutableRectangle.
        return ImmutableRectangle(width, self._height)


class ImmutableSquare(ImmutableRectangle):
    """
    A legitimate behavioural subtype. Every guarantee ImmutableRectangle
    makes is upheld, because there is no mutation through which the
    equality invariant could surprise a caller.
    """

    def __init__(self, side):
        super().__init__(side, side)
```

The lesson generalises well beyond this example: **mutability is what converts a benign specialisation into an LSP violation**, because mutation is the mechanism by which a subtype's stricter invariant becomes observable to a client that did not expect it.

### 7.5 Resolution options for the Square and Rectangle problem

Three resolutions are available, and the choice among them is determined by how the types are actually used.

**Option 1: eliminate the inheritance relationship.** Model both as independent implementations of a shared abstraction that promises only what both can deliver.

```python
from abc import ABC, abstractmethod


class Shape(ABC):
    """
    The abstraction promises only area computation, which both shapes can
    honour unconditionally. Nothing about mutable dimensions is promised,
    so nothing about mutable dimensions can be violated.
    """

    @abstractmethod
    def area(self) -> float:
        ...


class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height


class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2
```

**Option 2: make the base type immutable**, as shown in Section 7.4. Appropriate when the domain naturally treats shapes as values rather than as entities with identity and mutable state.

**Option 3: weaken the base contract explicitly.** If `Rectangle` documents that setting width may adjust height in some subtypes, then `Square` no longer violates anything. This resolution is technically valid and almost always undesirable, because the base contract has become so weak that clients can rely on nothing, and the value of the abstraction collapses.

| Option | When appropriate | Consequence |
|---|---|---|
| Remove inheritance, share an abstraction | The types share operations but not mutation semantics | Cleanest and most common resolution |
| Make the base immutable | The domain treats these as value objects | Removes the class of violation entirely |
| Weaken the base contract | Rarely appropriate | Preserves the hierarchy at the cost of a useless abstraction |

### 7.6 Worked violation 2: the unsupported operation

The second canonical violation occurs when a subtype cannot perform an operation the base type declares.

```python
class Bird:
    def fly(self):
        print("Flying")


class Penguin(Bird):
    def fly(self):
        # Violates the exception constraint. The base contract states that
        # fly() succeeds; this subtype converts a normal call into a crash.
        raise NotImplementedError("Penguins cannot fly")
```

Any generic loop over birds now fails on a subset of its inputs, which forces callers to reintroduce type checks and thereby destroys the benefit of polymorphism.

The correct resolution is to restructure the hierarchy so that each abstraction promises only what all of its subtypes can deliver.

```python
from abc import ABC, abstractmethod


class Bird(ABC):
    """
    The abstraction is narrowed to locomotion in general, which every bird
    supports. Flight is not part of the base contract because it is not
    universal among birds.
    """

    @abstractmethod
    def move(self) -> None:
        ...


class FlyingBird(Bird):
    def move(self):
        self.fly()

    def fly(self):
        print("Flying")


class FlightlessBird(Bird):
    def move(self):
        print("Walking")


class Sparrow(FlyingBird):
    pass


class Penguin(FlightlessBird):
    def move(self):
        print("Swimming")     # Legitimate override: still locomotion, contract intact
```

Code that requires flight now declares `FlyingBird` in its parameter type, and the type system prevents a penguin from reaching it. Code that requires only locomotion declares `Bird` and accepts every subtype safely.

The general principle extracted from this example: **an abstraction must promise only the intersection of what all its implementations can deliver, never the union.** Promising the union guarantees that some implementation will have to break the contract.

### 7.7 Violations that are not violations

Several patterns superficially resemble LSP violations but do not violate the principle. Recognising them prevents unnecessary refactoring.

**Adding new methods.** A subtype may introduce operations the base type does not declare. Existing clients cannot call methods they do not know about, so no existing guarantee is affected.

**Changing the implementation while preserving guarantees.** A subtype may sort using a different algorithm, cache results, log calls, or open a network connection. As long as the observable contract holds, the substitution is safe. This is exactly why the Decorator and Proxy patterns are legitimate.

**Returning a more specific type.** Covariant returns strengthen the postcondition and are permitted.

**Accepting a broader parameter type.** Contravariant parameters weaken the precondition and are permitted.

The following pair illustrates the boundary precisely.

```python
class FileReader:
    def read(self, path: str) -> str:
        with open(path) as handle:
            return handle.read()


class LoggingFileReader(FileReader):
    """
    Does NOT violate LSP. A side effect is added, but every path the parent
    accepts is still accepted, and the returned content is unchanged.
    """

    def read(self, path):
        print(f"Reading {path}")
        return super().read(path)


class TextOnlyFileReader(FileReader):
    """
    VIOLATES LSP. The precondition has been strengthened from "any readable
    path" to "any readable path ending in .txt". A client that worked with
    the parent will crash when handed this subtype and a JSON file.
    """

    def read(self, path):
        if not path.endswith(".txt"):
            raise ValueError("Only .txt files are supported")
        return super().read(path)
```

### 7.8 LSP in Python specifically

Python's dynamic typing changes how violations are detected, not whether they matter.

**No compile-time enforcement.** Python performs no static verification of overrides by default. A subclass may change a method's signature entirely and the interpreter will accept it. Violations therefore surface at runtime, typically in production, and typically in code far from the subclass that caused them.

**Static type checkers verify the mechanical rules.** Tools such as `mypy` verify parameter contravariance and return covariance when type annotations are present. They cannot verify behavioural rules such as invariant preservation, because those are semantic rather than syntactic. Type annotations therefore catch a useful subset of LSP violations at low cost, and behavioural violations remain the responsibility of design review and tests.

**Duck typing narrows the scope of the problem.** When a function accepts any object exposing a `read` method, no inheritance relationship is declared and the base contract is defined implicitly by what the function actually requires. This does not eliminate LSP concerns; it relocates them. The implicit contract still exists, and an object that exposes `read` but returns an integer instead of a string still breaks callers. `typing.Protocol` makes such implicit contracts explicit without requiring inheritance, and is discussed in Section 8.7.

**Contract tests are the practical enforcement mechanism.** Because Python cannot verify behavioural contracts, the standard technique is to write one test suite against the abstraction and run it against every implementation.

```python
import pytest


class DiscountPolicyContract:
    """
    A reusable contract test. Every concrete policy must pass every test
    defined here, which turns the informal contract into an executable one.

    Design note: this class is deliberately not named with a Test prefix,
    so the test runner does not attempt to execute it directly. Subclasses
    supply the implementation under test and inherit the assertions.
    """

    def create_policy(self):
        raise NotImplementedError("Subclasses supply the implementation")

    def test_discount_is_never_negative(self):
        policy = self.create_policy()
        assert policy.discount_for(1000) >= 0

    def test_discount_never_exceeds_the_amount(self):
        policy = self.create_policy()
        assert policy.discount_for(1000) <= 1000

    def test_zero_amount_yields_zero_discount(self):
        policy = self.create_policy()
        assert policy.discount_for(0) == 0


class TestVIPDiscount(DiscountPolicyContract):
    def create_policy(self):
        return VIPCustomerDiscount()


class TestCorporateDiscount(DiscountPolicyContract):
    def create_policy(self):
        return CorporateDiscount()
```

Any future implementation that violates the shared contract fails the inherited tests immediately, at the point where the violation was introduced rather than at the point where a client happens to encounter it.

### 7.9 Costs and limits

**Contracts must be documented to be enforceable.** LSP presupposes that the base type's guarantees are known. In practice, many base classes carry undocumented guarantees that clients discovered empirically. A subtype author cannot preserve a contract that was never stated, so writing contracts down is a precondition for applying the principle at all.

**Strict application discourages inheritance broadly.** Applied rigorously, LSP eliminates most inheritance hierarchies, because genuine behavioural subtyping is rarer than it appears. This is generally a benefit rather than a cost. Composition and delegation avoid the entire class of problems, which is the basis of the long-standing guidance to prefer composition over inheritance.

**Some violations are economically acceptable.** A subtype that violates a rarely exercised guarantee in an internal tool may be cheaper to tolerate than to restructure. The requirement is that the violation be identified, documented, and consciously accepted, rather than discovered later as a production defect.

### 7.10 Detection heuristics

| Signal | Why it indicates an LSP violation |
|---|---|
| An override raises `NotImplementedError` or `UnsupportedOperationException` | Direct violation of the exception constraint; the subtype cannot honour a declared operation. |
| An override begins with a validation that the parent does not perform | Strengthened precondition. |
| Client code uses `isinstance` to handle particular subtypes differently | Empirical proof that substitution is not actually safe, since clients have been forced to compensate. |
| An override returns `None` where the parent returns a value | Weakened postcondition. |
| An override silently ignores an argument the parent honours | Weakened postcondition, and particularly dangerous because it fails silently. |
| A subclass documents "do not use method X on this class" | The contract has been broken and the breakage delegated to documentation. |
| A subclass overrides a method to do nothing | Usually indicates the operation does not belong in the base abstraction. |

### 7.11 Checkpoint questions

**Q1.** A `CachingRepository` subclasses `Repository` and returns cached results rather than querying storage on every call. Does this violate LSP?

<details><summary>Answer</summary>

It depends entirely on whether the base contract promises freshness. If `Repository.find` guarantees only that it returns the entity with the given identifier, caching is an implementation detail and substitution is safe. If it guarantees that the returned data reflects the current state of storage, caching weakens that postcondition and the substitution is unsafe in any client that depends on immediate consistency. This case demonstrates why LSP cannot be evaluated from code structure alone; the contract must be known.

</details>

**Q2.** A subclass overrides a method to accept `Iterable` where the parent accepted `list`. Is this permitted?

<details><summary>Answer</summary>

Yes. Every `list` is an `Iterable`, so every input the parent accepted is still accepted, and the precondition has been weakened rather than strengthened. This is parameter contravariance and it is explicitly permitted. The reverse, accepting only `list` where the parent accepted any `Iterable`, would be a violation.

</details>

**Q3.** `Stack` inherits from `list` in order to reuse `append` and `pop`. What is the LSP concern?

<details><summary>Answer</summary>

Inheriting from `list` exposes the full list interface, including `insert`, `__setitem__`, and slice assignment, all of which permit modification at arbitrary positions. A stack's defining invariant is that access is restricted to one end. Any client holding the object as a `list` may legally violate that invariant, so the subtype cannot maintain it. The correct design is composition: `Stack` holds a list privately and exposes only `push`, `pop`, and `peek`. This is also an Interface Segregation concern, because the stack was forced to inherit an interface far wider than its clients require.

</details>

---

## 8. Interface Segregation Principle (ISP)

### 8.1 Formal statement

> "Clients should not be forced to depend upon interfaces that they do not use."
>
> Robert C. Martin

### 8.2 Term-by-term interpretation

**"Client."** The calling code, not the implementing class. ISP is stated from the perspective of the consumer. This orientation is what distinguishes ISP from SRP and is the most frequently missed aspect of the principle.

**"Forced to depend upon."** A client depends on every method declared in the interface it references, whether or not it calls them. The dependency is real even when unused, because a change to any method in that interface, including a signature change or the addition of a new abstract method, propagates to everyone who references the interface.

**"Interfaces they do not use."** Methods present in the declared type but irrelevant to the particular client.

**Definition (fat interface).** An interface that aggregates operations serving several distinct client groups, such that no single client uses more than a fraction of it.

**Definition (Interface Segregation Principle).** Wide interfaces should be decomposed into several narrow, client-specific interfaces, so that each client depends only on the operations it actually invokes.

### 8.3 The problem it solves

Two distinct costs arise from fat interfaces, and they affect implementers and clients respectively.

**Cost imposed on implementers.** A class that can perform only part of the interface must nonetheless supply every declared method. The residual methods become stubs that raise exceptions or return meaningless values, which is simultaneously an LSP violation, since the object cannot honour the contract it advertises. This is the mechanism by which ISP violations manufacture LSP violations, and it explains why the two principles are almost always discussed together.

**Cost imposed on clients.** A client that requires one operation but declares a dependency on a twelve-method interface is coupled to eleven methods it never invokes. Three concrete consequences follow. Recompilation and redeployment are triggered by changes the client does not care about. Test doubles must implement all twelve methods, making every test more expensive to write and more fragile. The reader of the client code cannot determine from the type declaration what the client actually needs, which obscures the true dependency structure of the system.

### 8.4 Worked violation

```python
from abc import ABC, abstractmethod


class OfficeMachine(ABC):
    """
    A single abstraction covering every capability any office device might
    have. The defect is that no real device has all of them.
    """

    @abstractmethod
    def print_document(self, document): ...

    @abstractmethod
    def scan_document(self, document): ...

    @abstractmethod
    def fax_document(self, document): ...

    @abstractmethod
    def staple(self, document): ...


class AllInOnePrinter(OfficeMachine):
    """Satisfies the interface honestly, since it genuinely has every capability."""

    def print_document(self, document): print(f"Printing {document}")
    def scan_document(self, document): print(f"Scanning {document}")
    def fax_document(self, document): print(f"Faxing {document}")
    def staple(self, document): print(f"Stapling {document}")


class BudgetPrinter(OfficeMachine):
    """
    Cannot honour three quarters of the contract it advertises. The stubs
    are not a cosmetic problem: any client holding this object as an
    OfficeMachine may legally call scan_document and will crash.
    """

    def print_document(self, document): print(f"Printing {document}")
    def scan_document(self, document): raise NotImplementedError
    def fax_document(self, document): raise NotImplementedError
    def staple(self, document): raise NotImplementedError
```

The client-side cost is equally concrete.

```python
def print_all(documents, machine: OfficeMachine):
    # This function uses exactly one of the four declared operations, yet it
    # is coupled to all four. Adding a fifth abstract method to OfficeMachine
    # would break every test double written for this function, even though
    # the function's own behaviour is unaffected.
    for document in documents:
        machine.print_document(document)
```

### 8.5 Diagnosis

**Step 1: build a client-to-method usage matrix.** For each client of the interface, record which methods it invokes.

| Client | `print_document` | `scan_document` | `fax_document` | `staple` |
|---|---|---|---|---|
| `print_all` | used | unused | unused | unused |
| `ArchiveService` | unused | used | unused | unused |
| `LegalNoticeSender` | unused | unused | used | unused |
| `BindingStation` | unused | unused | unused | used |

**Step 2: examine the pattern.** A diagonal pattern, in which each client uses a different single method, is definitive evidence that the interface is an arbitrary aggregation rather than a coherent abstraction. A dense matrix, in which most clients use most methods, indicates a genuinely cohesive interface that should not be split.

**Step 3: count the stubs.** Every method in every implementation that raises, returns a placeholder, or does nothing is a location where the interface promised something the implementer cannot deliver.

### 8.6 Resolution

The interface is decomposed along the boundaries revealed by the usage matrix, and implementations compose the capabilities they actually possess.

```python
from abc import ABC, abstractmethod


class Printer(ABC):
    @abstractmethod
    def print_document(self, document): ...


class Scanner(ABC):
    @abstractmethod
    def scan_document(self, document): ...


class FaxMachine(ABC):
    @abstractmethod
    def fax_document(self, document): ...


class Stapler(ABC):
    @abstractmethod
    def staple(self, document): ...


class BudgetPrinter(Printer):
    """
    Declares exactly one capability and implements it. There is no stub,
    no exception, and no possibility of a client calling an operation this
    device cannot perform, because the type system prevents it.
    """

    def print_document(self, document):
        print(f"Printing {document}")


class AllInOnePrinter(Printer, Scanner, FaxMachine, Stapler):
    """
    Multiple inheritance is used here as interface composition rather than
    implementation reuse. Each base contributes one abstract method and no
    state, so the diamond and initialisation problems associated with
    multiple inheritance of concrete classes do not arise.
    """

    def print_document(self, document): print(f"Printing {document}")
    def scan_document(self, document): print(f"Scanning {document}")
    def fax_document(self, document): print(f"Faxing {document}")
    def staple(self, document): print(f"Stapling {document}")
```

Clients now declare precisely what they need.

```python
def print_all(documents, machine: Printer):
    # The signature now documents the actual requirement. A reader learns
    # from the type alone that this function neither scans nor faxes, and a
    # test double needs exactly one method.
    for document in documents:
        machine.print_document(document)


def archive(documents, scanner: Scanner):
    for document in documents:
        scanner.scan_document(document)


def print_and_staple(documents, machine):
    """
    A client requiring two capabilities. Python's structural flexibility
    permits passing any object that has both methods; a statically checked
    version would declare an intersection type or a dedicated Protocol.
    """
    for document in documents:
        machine.print_document(document)
        machine.staple(document)
```

### 8.7 Alternative techniques and the Python-specific dimension

**Role interfaces versus header interfaces.** Martin Fowler distinguishes two styles of interface definition, and the distinction is the practical core of ISP.

| Style | Definition | Consequence |
|---|---|---|
| **Header interface** | The interface mirrors the full public surface of an existing implementation class, typically extracted mechanically. | Reproduces the implementation's shape, so it is fat by construction and every client depends on everything. |
| **Role interface** | The interface describes one role that a client requires, defined from the client's needs rather than from any implementation. | Narrow by construction, and one class may implement several roles. |

ISP is effectively an instruction to define role interfaces. The practical technique is to name the interface after the capability the client requires, not after the class that happens to provide it. `Printer` is a role; `HPLaserJetInterface` is a header.

**Client-owned interfaces.** A stronger form of the same idea places the interface definition in the client's module rather than the implementer's. The client declares what it needs; the implementer conforms. This inverts the ownership of the abstraction and is the structural basis of the ports and adapters architecture discussed in Section 9.8.

**`typing.Protocol` as the Pythonic realisation.** Python 3.8 introduced structural subtyping through `typing.Protocol`, which allows an interface to be declared and statically checked without any inheritance relationship.

```python
from typing import Protocol


class SupportsPrint(Protocol):
    """
    A structural interface. Any object with a matching print_document
    method satisfies it, with no inheritance and no import dependency from
    the implementer to this declaration.

    This is the strongest available form of ISP in Python: the client
    declares its requirement, implementations remain entirely unaware of
    the declaration, and mypy still verifies conformance statically.
    """

    def print_document(self, document) -> None: ...


def print_all(documents, machine: SupportsPrint) -> None:
    for document in documents:
        machine.print_document(document)
```

The trade-off between the two mechanisms is worth stating precisely.

| Mechanism | Advantages | Disadvantages |
|---|---|---|
| Abstract base class (`ABC`) | Explicit, discoverable through the class hierarchy, prevents instantiation of incomplete subclasses, permits shared default implementations | Requires implementers to import and inherit, creating a compile-time dependency on the abstraction |
| `typing.Protocol` | No dependency from implementer to interface, works with third-party classes that cannot be modified, statically checked | Conformance is not visible in the implementing class, no shared default implementations, requires a type checker to obtain any enforcement |

**Duck typing without any declaration.** Passing an object and calling a method, with no interface declared at all, is the lightest option and remains common in Python. The interface still exists; it is simply implicit and undocumented. This is acceptable for small internal code and unsuitable for module boundaries, where the absence of a written contract makes both LSP verification and safe evolution impossible.

### 8.8 Costs and limits

**Interface proliferation.** Segregating without evidence produces dozens of single-method interfaces, each with one implementation and one client. This is not modularity; it is indirection without benefit. The correct trigger for segregation is the observed existence of distinct client groups with distinct needs, demonstrated by the usage matrix of Section 8.5.

**Composition complexity at the point of use.** When a client legitimately needs three capabilities, it must express a compound requirement. Python has no first-class intersection type, so the options are a combined Protocol, multiple parameters, or an untyped parameter with a documented expectation. Each of these carries some awkwardness.

**Segregation does not reduce total surface area.** Splitting one four-method interface into four one-method interfaces leaves the same number of methods in the system. The benefit is in the dependency graph, not in the amount of code. If no client actually benefits from the narrower dependency, the split has produced cost with no return.

### 8.9 Detection heuristics

| Signal | Why it indicates an ISP violation |
|---|---|
| Implementations contain methods that raise `NotImplementedError` | The interface promises capabilities that implementers do not have. |
| A test double must stub methods the test never exercises | Direct measurement of unnecessary client dependency. |
| The client-to-method usage matrix is sparse or diagonal | Distinct client groups are sharing an interface for no reason. |
| An interface name is a noun of convenience such as `Service`, `Manager`, or `Handler` | Such names rarely describe a single role and usually indicate aggregation. |
| Adding a method to an interface breaks several unrelated implementations | The interface is serving groups that should have been separate. |
| A client imports a large interface and calls one method | The dependency declared far exceeds the dependency required. |

### 8.10 Checkpoint questions

**Q1.** An interface has eight methods and every one of its four clients uses all eight. Does this violate ISP?

<details><summary>Answer</summary>

No. ISP prohibits forced dependency on unused methods. When all clients use all methods, the interface is cohesive and the dependency is entirely warranted. Splitting it would impose composition overhead on every client with no reduction in coupling. Method count alone never establishes a violation; the usage matrix does.

</details>

**Q2.** How are ISP and SRP different, given that both push toward smaller units?

<details><summary>Answer</summary>

They are distinguished by perspective and by subject. SRP concerns the implementation and asks how many actors can cause it to change; it is evaluated from the producer's side. ISP concerns the interface and asks whether clients are coupled to operations they do not invoke; it is evaluated from the consumer's side. The two are independent: a class with a single responsibility can still expose a fat interface if different clients use disjoint parts of it, and a narrow interface can be backed by an implementation that violates SRP internally.

</details>

**Q3.** In Python, where duck typing means a function can simply call whatever method it needs, is ISP still relevant?

<details><summary>Answer</summary>

Yes, though the mechanism of violation changes. Duck typing removes the compile-time coupling but not the semantic coupling: a function that calls four methods on its parameter requires all four from every caller, and every test double must supply all four. The interface exists whether or not it is declared. Duck typing makes it easier to satisfy ISP accidentally, because a function tends to require only what it calls, and harder to verify deliberately, because the requirement is nowhere written down. `typing.Protocol` exists precisely to make these implicit requirements explicit and checkable.

</details>

---

## 9. Dependency Inversion Principle (DIP)

### 9.1 Formal statement

> "A. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> B. Abstractions should not depend on details. Details should depend on abstractions."
>
> Robert C. Martin

### 9.2 Term-by-term interpretation

The definitions of high-level module, low-level module, abstraction, and concretion were established in Section 4 and are used here without restatement.

**Clause A** prohibits a direct dependency from policy to mechanism. The business rule must not name the database driver.

**Clause B** is the clause that gives the principle its name and is the one most often overlooked. It states that the abstraction must be defined in terms of the domain rather than in terms of any particular implementation. An interface named `Repository` with a method `save(entity)` satisfies clause B. An interface named `Repository` with a method `execute_sql(query)` does not, because although it is technically abstract, its vocabulary is that of a relational database and no document store could implement it sensibly. Such an interface is a **leaky abstraction**: it has inverted the syntax of the dependency while preserving its semantics.

**"Inversion."** The term is comparative and refers to the reversal of the conventional layered dependency direction. In traditional layered design, the dependency arrows point downward from user interface to business logic to data access. DIP reverses the lower arrow so that data access depends on business logic through an abstraction that business logic owns.

**Definition (Dependency Inversion Principle).** Source-level dependencies should point toward abstractions that are owned by the higher-level, more stable module, so that volatile implementation details depend on stable policy rather than the reverse.

### 9.3 The problem it solves

```python
class MySQLDatabase:
    def save(self, record):
        print(f"INSERT INTO users ... {record}")


class UserService:
    """
    High-level policy: what it means to register a user.

    The constructor hard-codes a specific storage technology, which
    produces three separate defects examined below.
    """

    def __init__(self):
        self.database = MySQLDatabase()      # The defect is on this line

    def register(self, name, email):
        if "@" not in email:
            raise ValueError("Invalid email address")
        self.database.save({"name": name, "email": email})
```

| Defect | Explanation |
|---|---|
| **Rigidity** | Changing the storage technology requires editing `UserService`, which contains no storage logic and should have no opinion about storage. |
| **Untestability** | The registration rule cannot be unit tested without a running MySQL server. A test of a three-line validation rule acquires a database dependency, becomes slow, and becomes capable of failing for reasons unrelated to the code under test. |
| **Immobility** | `UserService` cannot be reused in any context lacking MySQL, including a command-line tool, a batch job, or a different product line. |

The structural statement of the problem is that the arrow points in the wrong direction. Business policy is the stable, valuable part of a system and typically outlives several generations of storage technology. Storage is volatile. A dependency from stable to volatile means the stable component is destabilised by every change to the volatile one.

### 9.4 Resolution

An abstraction is introduced, defined in the vocabulary of the domain, and every concrete mechanism conforms to it.

```python
from abc import ABC, abstractmethod


class UserRepository(ABC):
    """
    The abstraction, expressed entirely in domain vocabulary. There is no
    mention of tables, connections, queries, or files, which is what allows
    a relational store, a document store, an in-memory structure, or a
    remote service to implement it without distortion.

    Ownership note: conceptually this interface belongs to the business
    layer, not to the persistence layer, because it exists to state what
    the business layer requires. Placing it in the persistence package
    would satisfy the letter of the principle while defeating its purpose.
    """

    @abstractmethod
    def save(self, user: dict) -> None:
        ...

    @abstractmethod
    def find_by_email(self, email: str) -> dict | None:
        ...


class MySQLUserRepository(UserRepository):
    def save(self, user):
        print(f"MySQL insert: {user}")

    def find_by_email(self, email):
        print(f"MySQL select where email = {email}")
        return None


class InMemoryUserRepository(UserRepository):
    """
    A production-quality implementation for tests, not a mock. It has real
    behaviour and can therefore verify that the service actually stored
    what it claimed to store, which a bare mock cannot do without
    replicating the assertion logic in every test.
    """

    def __init__(self):
        self._users = {}

    def save(self, user):
        self._users[user["email"]] = user

    def find_by_email(self, email):
        return self._users.get(email)


class UserService:
    def __init__(self, repository: UserRepository):
        # The dependency arrives from outside. This class now names no
        # storage technology anywhere in its source, so no change of
        # storage technology can require editing it.
        self.repository = repository

    def register(self, name, email):
        if "@" not in email:
            raise ValueError("Invalid email address")
        if self.repository.find_by_email(email) is not None:
            raise ValueError("Email is already registered")
        self.repository.save({"name": name, "email": email})
```

Testing the business rule now requires no infrastructure whatsoever.

```python
def test_duplicate_registration_is_rejected():
    repository = InMemoryUserRepository()
    service = UserService(repository)

    service.register("Ananya", "ananya@example.com")

    try:
        service.register("Ananya Again", "ananya@example.com")
        assert False, "Expected a duplicate registration to be rejected"
    except ValueError:
        pass
```

The test executes in microseconds, has no external dependency, and fails only when the business rule is wrong. This improvement in testability is the most immediately measurable benefit of DIP and is usually the argument that persuades teams to adopt it.

### 9.5 Why the relationship is called an inversion

Before applying the principle, the source-level dependency runs downward:

```
UserService  ---->  MySQLDatabase
 (policy)            (mechanism)
```

After applying it, the dependency from the mechanism has been reversed:

```
UserService  ---->  UserRepository  <----  MySQLUserRepository
 (policy)            (abstraction)          (mechanism)
```

Two properties of the second diagram deserve attention. First, the arrow from `MySQLUserRepository` points upward, which is the inversion the principle is named for. Second, `UserService` and `UserRepository` together form a self-contained unit that compiles, imports, and tests without any knowledge that `MySQLUserRepository` exists. That unit is the reusable, valuable core of the system.

The runtime call still flows from `UserService` into `MySQLUserRepository`. Only the source-level dependency has been inverted. Distinguishing the direction of control flow from the direction of source dependency is the conceptual key to the principle, and confusing the two is the most common source of misunderstanding.

### 9.6 Where the abstraction should live

Clause B of the formal statement has a structural consequence that is frequently ignored. An interface placed in the same package as its implementation, and shaped around that implementation's capabilities, provides syntactic indirection without reducing coupling.

| Placement | Effect |
|---|---|
| Interface defined in the persistence package, shaped by the database | Business layer imports from the persistence package, so the dependency remains. The abstraction is decorative. |
| Interface defined in the business package, shaped by business needs | Persistence package imports from the business package. The dependency is genuinely inverted and the business package can be extracted and reused. |

The practical test is to ask whether the business package can be packaged and shipped with its persistence package deleted. If it can, the inversion is real.

### 9.7 Dependency injection: the technique that realises DIP

**Definition (dependency injection).** The practice of supplying a module's collaborators from outside the module rather than having the module construct or locate them itself.

Dependency inversion is the principle, which describes what the dependency structure should look like. Dependency injection is a technique, which describes how the correct structure is achieved at runtime. A third term, inversion of control, is broader still.

| Term | Category | Meaning |
|---|---|---|
| Dependency Inversion Principle | Design principle | Depend on abstractions; abstractions should be owned by the higher-level module. |
| Dependency Injection | Implementation technique | Supply collaborators from outside rather than constructing them internally. |
| Inversion of Control | Architectural style | The framework or the caller, rather than the module itself, determines flow and wiring. Dependency injection is one instance of it. |

Three injection styles are in common use.

**Constructor injection**, which is the default choice.

```python
class ReportService:
    def __init__(self, repository: UserRepository, formatter):
        # Required collaborators are supplied at construction, so an
        # instance cannot exist in a partially configured state. This is
        # the reason constructor injection is preferred by default.
        self.repository = repository
        self.formatter = formatter
```

**Setter injection**, for optional or replaceable collaborators.

```python
class ReportService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
        self._logger = NullLogger()      # Safe default, so the object is always usable

    def set_logger(self, logger):
        # Optional collaborator. Using setter injection here signals that
        # logging is not required for correct operation, which constructor
        # injection would have obscured by making it mandatory.
        self._logger = logger
```

**Method injection**, when the collaborator varies per call rather than per object.

```python
class Checkout:
    def final_price(self, amount: float, policy: DiscountPolicy) -> float:
        # The policy differs for every customer, so binding it to the
        # object would force a new Checkout instance per customer.
        return amount - policy.discount_for(amount)
```

**Framework-based injection** delegates the wiring to a container, as with FastAPI's `Depends` or the various dependency injection libraries. The benefit is reduced boilerplate in large applications; the cost is that the object graph is assembled by machinery that is harder to trace than explicit construction.

Regardless of style, the concrete implementations must be selected somewhere. That location is called the **composition root**, and it is conventionally the application's entry point.

```python
def main():
    """
    The composition root. This is the only function in the application that
    names concrete infrastructure classes. Every other module refers to
    abstractions, which is what makes the rest of the system portable.
    """
    repository = MySQLUserRepository()
    service = UserService(repository)
    service.register("Ananya", "ananya@example.com")
```

### 9.8 Architectural consequences

DIP applied consistently across a whole system produces a recognisable architecture. Business rules occupy the centre and depend on nothing external. Interfaces for everything the business rules require, such as persistence, messaging, and time, are defined in the centre. All infrastructure sits at the periphery and depends inward by implementing those interfaces.

This arrangement appears in the literature under several names: hexagonal architecture, ports and adapters, onion architecture, and clean architecture. They differ in terminology and in how many layers they name, but each is fundamentally an application of the Dependency Inversion Principle at the scale of an entire system. The interfaces defined by the centre are the ports; the infrastructure implementations are the adapters.

### 9.9 Costs and limits

**Not every dependency should be inverted.** The criterion is volatility combined with the need to substitute. Stable dependencies with no realistic alternative implementation should be used directly.

| Dependency | Invert? | Reason |
|---|---|---|
| Database, message broker, payment gateway, third-party HTTP API | Yes | Volatile, externally owned, and must be substituted in tests. |
| The system clock, when time-dependent logic is tested | Yes | Non-determinism makes tests unreliable unless time is injectable. |
| Standard library data structures such as `list` and `dict` | No | Stable, ubiquitous, and never substituted. |
| Pure functions with no input or output, such as arithmetic helpers | No | Deterministic and independently testable already. |
| A domain value object such as `Money` | No | Part of the domain itself, not a mechanism behind it. |

**Indirection increases the cost of comprehension.** Following a call from policy to the executing code requires knowing which implementation was wired at the composition root. In a large object graph this is genuine friction, and it is the reason explicit composition roots are preferable to magical container configuration in codebases of moderate size.

**Abstractions defined too early are usually wrong.** An interface extracted from a single implementation before a second one exists tends to reproduce the first implementation's shape and then requires reworking when the second arrives. Extracting the interface at the moment the second implementation is genuinely needed produces a better abstraction with less rework.

### 9.10 Detection heuristics

| Signal | Why it indicates a DIP violation |
|---|---|
| A class constructs its own collaborators, as in `self.db = MySQLDatabase()` | The class has chosen a concrete implementation, so no substitution is possible. |
| Business logic modules import infrastructure libraries such as `psycopg2`, `requests`, or `boto3` | Policy has acquired a direct dependency on mechanism. |
| A unit test requires a database, a network connection, or a running service | The unit under test cannot be isolated, which is the observable symptom of an uninverted dependency. |
| Calls to `datetime.now()` or `random()` inside logic that must be tested deterministically | Non-substitutable dependencies on ambient state. |
| An interface whose method names use infrastructure vocabulary, such as `execute_query` | Violation of clause B: the abstraction has been shaped by the detail. |
| Changing an implementation requires edits in several unrelated modules | Concrete types have leaked into multiple call sites. |

### 9.11 Checkpoint questions

**Q1.** A team introduces an interface `IUserRepository` whose only method is `execute_sql(query: str)`. Has DIP been satisfied?

<details><summary>Answer</summary>

No. Clause A has been satisfied syntactically, since the service now refers to an interface, but clause B has been violated. The abstraction is expressed in the vocabulary of relational databases, so a document store or an in-memory implementation cannot honour it without absurdity, and the caller must construct SQL, which means SQL knowledge has been pushed into the business layer. The dependency has been renamed rather than inverted. A correct abstraction would expose domain operations such as `find_by_email` and `save`.

</details>

**Q2.** Is `datetime.now()` a DIP violation?

<details><summary>Answer</summary>

Only when the surrounding logic must be tested deterministically or must support alternative time sources. Logging a timestamp does not warrant abstraction. A subscription expiry rule does, because the test must control the current time in order to verify boundary behaviour, and a hard-coded call to the system clock makes that impossible. The general criterion applies here: invert a dependency when it is volatile or non-deterministic and substitution is required, not merely because it is external.

</details>

**Q3.** Does dependency injection by itself guarantee dependency inversion?

<details><summary>Answer</summary>

No. Injecting a concrete `MySQLDatabase` through a constructor improves testability slightly and permits substitution by a subclass, but the parameter type still names a concrete class, so the high-level module remains coupled to a specific mechanism. Inversion requires that the declared dependency be an abstraction owned by the high-level module. Injection is the delivery mechanism; the abstraction is what makes the delivery meaningful.

</details>

---

## 10. How the Five Principles Interact

### 10.1 The principles are not independent

Presenting SOLID as five separate rules obscures the fact that they describe one structural property from five angles. Each principle, correctly applied, makes the others easier to satisfy, and each violation makes the others harder.

The causal chain runs as follows. Separating responsibilities produces classes with narrow purposes (SRP). Classes with narrow purposes naturally expose narrow interfaces, because there is little to expose (ISP). Narrow interfaces are easy for a subtype to honour completely, since the number of guarantees is small (LSP). When subtypes reliably honour their contracts, depending on an abstraction becomes safe rather than speculative (DIP). When clients depend on trustworthy abstractions, new behaviour can be introduced by adding implementations rather than editing existing code (OCP). Systems that are extended by addition accumulate less entanglement, which makes the next round of responsibility separation cheaper (SRP again).

The reverse chain is equally mechanical and describes how codebases decay. A class that accumulates responsibilities (SRP violation) exposes a wide interface (ISP violation). A wide interface cannot be fully honoured by every implementation, so implementations begin stubbing methods (LSP violation). Clients learn that the abstraction is unreliable and start checking concrete types to compensate (DIP violation). Type checks are conditionals on type, so each new variant requires editing them (OCP violation). At that point all five have failed, and the original cause was a single class that was allowed to grow.

### 10.2 Dependency map

| Principle | Depends on | Enables |
|---|---|---|
| SRP | Nothing; it is the entry point | Narrow interfaces, therefore ISP |
| ISP | Cohesive classes produced by SRP | Contracts small enough to honour, therefore LSP |
| LSP | Narrow contracts produced by ISP | Trustworthy substitution, therefore DIP and OCP |
| DIP | Reliable substitution guaranteed by LSP | Extension points, therefore OCP |
| OCP | Abstractions established by DIP; substitutability from LSP | Additive change, which preserves SRP over time |

### 10.3 Grouping by purpose

A different organisation of the same material is useful when deciding which principle to reach for.

| Concern | Principles | Question to ask |
|---|---|---|
| How code is partitioned | SRP, ISP | Is this unit doing one thing, and is its interface no wider than its clients require? |
| How code is extended | OCP | Can the expected new variant be added without editing existing code? |
| How code is connected | DIP | Does policy depend on abstractions that policy itself defines? |
| Whether abstractions can be trusted | LSP | Can any implementation be substituted without a client noticing? |

LSP occupies a distinct position among the five. The other four describe how to structure code; LSP describes a correctness condition that the structure must satisfy for the others to deliver their benefits. An OCP design built on subtypes that violate their contracts is not extensible, it is merely indirect.

---

## 11. Capstone: Refactoring an Order Processing System

This section applies all five principles to a single realistic module. The starting point is code of a kind that appears in most codebases that have grown without periodic restructuring. The refactoring proceeds in explicit stages, and each stage states which principle motivates it and what would go wrong if the stage were skipped.

### 11.1 The starting point

```python
class OrderManager:
    """
    Handles the complete order lifecycle. The word 'complete' in that
    sentence is the entire problem.
    """

    def __init__(self):
        self.orders = []

    def place_order(self, customer_type, items, payment_method, email):
        # Responsibility 1: pricing arithmetic
        total = sum(price * quantity for _, price, quantity in items)

        # Responsibility 2: discount policy, owned by the commercial team
        if customer_type == "regular":
            total *= 0.95
        elif customer_type == "premium":
            total *= 0.90
        elif customer_type == "vip":
            total *= 0.80

        # Responsibility 3: payment execution, owned by the payments team
        if payment_method == "card":
            print(f"Charging {total} to card via the card gateway")
        elif payment_method == "upi":
            print(f"Collecting {total} via UPI")
        elif payment_method == "cash":
            print(f"Recording {total} as cash on delivery")

        # Responsibility 4: persistence, owned by the platform team
        print("Executing INSERT INTO orders ...")

        # Responsibility 5: customer communication, owned by the growth team
        print(f"Sending confirmation email to {email}")

        order = {"items": items, "total": total}
        self.orders.append(order)
        return total
```

### 11.2 Diagnosis against all five principles

| Principle | Status | Specific evidence |
|---|---|---|
| SRP | Violated | Five actors can require changes to this single method: commercial, payments, platform, growth, and whoever owns pricing arithmetic. |
| OCP | Violated | Two conditionals branch on values that are certain to grow: customer tiers and payment methods. |
| LSP | Not yet applicable | No abstractions exist, so there is nothing to substitute. The absence of abstraction is itself the finding. |
| ISP | Not yet applicable | No interfaces exist. |
| DIP | Violated | The payment gateway, the database, and the email transport are all named directly inside business logic, which makes the method impossible to unit test. |

The order in which these are addressed matters. Extracting responsibilities (SRP) is performed first, because it produces the units against which the remaining principles are then applied. Attempting OCP or DIP inside a class that still does five things produces abstractions along the wrong boundaries.

### 11.3 Stage 1, separate responsibilities (SRP)

Each responsibility identified in the diagnosis becomes its own concept. At this stage the classes remain concrete; abstraction is introduced deliberately in later stages, only where an axis of change justifies it.

```python
class OrderLine:
    """
    A value object representing one line of an order.

    Introduced because tuples of (name, price, quantity) carry no meaning
    at the point of use, permit silent argument reordering, and cannot
    enforce their own invariants.
    """

    def __init__(self, product_name: str, unit_price: float, quantity: int):
        if unit_price < 0:
            raise ValueError("Unit price cannot be negative")
        if quantity <= 0:
            raise ValueError("Quantity must be positive")

        self.product_name = product_name
        self.unit_price = unit_price
        self.quantity = quantity

    @property
    def line_total(self) -> float:
        # Behaviour placed on the data it operates on, which avoids the
        # anaemic model problem discussed in Section 5.8.
        return self.unit_price * self.quantity


class Order:
    """
    The order entity. It owns its own invariants and nothing else. It does
    not know how it is priced, paid for, stored, or announced.
    """

    def __init__(self, customer_email: str):
        self.customer_email = customer_email
        self.lines: list[OrderLine] = []
        self.total: float | None = None

    def add_line(self, line: OrderLine) -> None:
        self.lines.append(line)

    @property
    def subtotal(self) -> float:
        return sum(line.line_total for line in self.lines)
```

### 11.4 Stage 2, make the varying policies extensible (OCP)

The two conditionals identified in the diagnosis are replaced by abstractions, because both branch on sets that are known to grow.

```python
from abc import ABC, abstractmethod


class DiscountPolicy(ABC):
    """
    Axis of change: the commercial team introduces new customer tiers and
    promotional schemes several times a year. This is the clearest possible
    justification for an abstraction, since the axis is demonstrated rather
    than predicted.
    """

    @abstractmethod
    def discount_for(self, subtotal: float) -> float:
        """Return the absolute discount amount, never the discounted total."""
        ...


class NoDiscount(DiscountPolicy):
    def discount_for(self, subtotal): return 0.0


class RegularDiscount(DiscountPolicy):
    def discount_for(self, subtotal): return subtotal * 0.05


class PremiumDiscount(DiscountPolicy):
    def discount_for(self, subtotal): return subtotal * 0.10


class VIPDiscount(DiscountPolicy):
    def discount_for(self, subtotal): return subtotal * 0.20


class CappedDiscount(DiscountPolicy):
    """
    A composite policy that wraps another and limits its effect.

    Its existence is the strongest evidence that a class-based abstraction
    was the right choice over a dictionary of percentage rates: this
    variant expresses behaviour that no table of constants could represent,
    and it was added without modifying any existing policy.
    """

    def __init__(self, inner: DiscountPolicy, maximum: float):
        self.inner = inner
        self.maximum = maximum

    def discount_for(self, subtotal):
        return min(self.inner.discount_for(subtotal), self.maximum)
```

### 11.5 Stage 3, invert the infrastructure dependencies (DIP and ISP)

Payment, persistence, and notification are all mechanisms behind stable policy. Each receives an abstraction expressed in domain vocabulary, and each abstraction is deliberately narrow so that no client depends on operations it does not use.

```python
class PaymentGateway(ABC):
    """
    One method, because the order workflow requires exactly one operation.
    Refunds and settlement reports are genuine capabilities but belong to
    separate interfaces used by separate clients, in accordance with ISP.
    """

    @abstractmethod
    def charge(self, amount: float, reference: str) -> bool:
        """Return True when the charge succeeds, False when it is declined."""
        ...


class OrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> None: ...


class OrderNotifier(ABC):
    @abstractmethod
    def notify_confirmed(self, order: Order) -> None: ...


class CardGateway(PaymentGateway):
    def charge(self, amount, reference):
        print(f"Card charge of {amount} for {reference}")
        return True


class UPIGateway(PaymentGateway):
    def charge(self, amount, reference):
        print(f"UPI collection of {amount} for {reference}")
        return True


class CashOnDeliveryGateway(PaymentGateway):
    """
    Honours the contract without moving money at authorisation time.

    LSP check: the contract states that True means the charge succeeded,
    where success is defined as the payment being validly arranged. Cash on
    delivery arranges payment at delivery, which satisfies that definition.
    Had the contract stated that True means funds have settled, this class
    would violate it and would require a different abstraction.
    """

    def charge(self, amount, reference):
        print(f"Cash on delivery recorded: {amount} for {reference}")
        return True


class SQLOrderRepository(OrderRepository):
    def save(self, order):
        print(f"Persisting order for {order.customer_email}")


class InMemoryOrderRepository(OrderRepository):
    def __init__(self):
        self.saved: list[Order] = []

    def save(self, order):
        self.saved.append(order)


class EmailNotifier(OrderNotifier):
    def notify_confirmed(self, order):
        print(f"Confirmation email to {order.customer_email}")


class NullNotifier(OrderNotifier):
    """Used in tests and batch imports where no customer contact is desired."""

    def notify_confirmed(self, order):
        pass
```

### 11.6 Stage 4, the orchestrator

The remaining class coordinates the workflow and does nothing else. Its single reason to change is a change to the sequence or composition of steps in placing an order.

```python
class PaymentDeclined(Exception):
    """
    A domain-level exception. The service raises this rather than a
    gateway-specific error, so callers never need to know which gateway
    was used. Leaking a gateway exception here would reintroduce the
    dependency that the PaymentGateway abstraction removed.
    """


class OrderService:
    def __init__(
        self,
        discount_policy: DiscountPolicy,
        payment_gateway: PaymentGateway,
        repository: OrderRepository,
        notifier: OrderNotifier,
    ):
        self.discount_policy = discount_policy
        self.payment_gateway = payment_gateway
        self.repository = repository
        self.notifier = notifier

    def place_order(self, order: Order) -> float:
        subtotal = order.subtotal
        discount = self.discount_policy.discount_for(subtotal)
        order.total = subtotal - discount

        # Payment precedes persistence so that a declined payment leaves no
        # order record. The alternative ordering, persisting first and
        # marking the order failed afterwards, is also defensible and is
        # chosen when an audit trail of failed attempts is required. The
        # decision belongs here, in the workflow, which is exactly why the
        # workflow is a responsibility in its own right.
        if not self.payment_gateway.charge(order.total, order.customer_email):
            raise PaymentDeclined(f"Payment declined for {order.customer_email}")

        self.repository.save(order)
        self.notifier.notify_confirmed(order)
        return order.total
```

### 11.7 Composition and testing

```python
def main():
    """The composition root, and the only place concrete classes are named."""
    order = Order("ananya@example.com")
    order.add_line(OrderLine("Textbook", 1200.0, 2))
    order.add_line(OrderLine("Notebook", 80.0, 5))

    service = OrderService(
        discount_policy=CappedDiscount(VIPDiscount(), maximum=500.0),
        payment_gateway=UPIGateway(),
        repository=SQLOrderRepository(),
        notifier=EmailNotifier(),
    )
    service.place_order(order)


def test_discount_is_applied_and_order_is_persisted():
    """
    A complete test of the ordering workflow with no infrastructure. This
    is the practical payoff of the refactoring and would have been
    impossible against the original OrderManager.
    """

    class DecliningGateway(PaymentGateway):
        def charge(self, amount, reference):
            return False

    repository = InMemoryOrderRepository()
    order = Order("test@example.com")
    order.add_line(OrderLine("Book", 1000.0, 1))

    service = OrderService(
        discount_policy=RegularDiscount(),
        payment_gateway=DecliningGateway(),
        repository=repository,
        notifier=NullNotifier(),
    )

    try:
        service.place_order(order)
        assert False, "A declined payment should prevent order placement"
    except PaymentDeclined:
        pass

    assert repository.saved == [], "No order should be persisted after a decline"
```

### 11.8 Verification against each principle

| Principle | How the final design satisfies it |
|---|---|
| **SRP** | `OrderLine` owns line arithmetic, `Order` owns order invariants, each policy owns one pricing rule, each gateway owns one payment mechanism, the repository owns persistence, the notifier owns communication, and `OrderService` owns the workflow sequence. Each has exactly one actor. |
| **OCP** | A new customer tier is a new `DiscountPolicy` subclass. A new payment method is a new `PaymentGateway` subclass. Neither requires editing `OrderService` or any existing implementation. |
| **LSP** | Every implementation honours its contract without stubs or unsupported operations. The `CashOnDeliveryGateway` docstring records the contract reasoning explicitly, which is what makes the substitution verifiable rather than assumed. |
| **ISP** | Each interface declares exactly one method, because each client requires exactly one operation. No implementation raises `NotImplementedError`. |
| **DIP** | `OrderService` names no concrete infrastructure. All three infrastructure abstractions are expressed in domain vocabulary, so alternative implementations are possible without distortion. Concrete selection occurs only in `main`. |

### 11.9 An honest accounting of the cost

The original implementation was one class of roughly thirty lines. The refactored version is thirteen classes across roughly a hundred and fifty lines. That expansion is a real cost and must be justified rather than assumed.

The justification rests on specific, observed facts about this domain: customer tiers change several times a year, payment methods are added when the business enters new markets, and the ordering workflow must be tested without infrastructure because it encodes revenue-critical rules. Each abstraction in the final design corresponds to one of those documented axes of change.

Had the business supported exactly one customer tier and one payment method with no expectation of growth, the original class would have been the better design, and the refactoring would have been speculative generality. The engineering judgement is not "apply SOLID" but "identify the axes along which this system will actually change, and pay for abstraction only along those axes."

---

## 12. SOLID Beyond Classes: Functions, Modules, and Services

The principles are usually taught with classes because that is the granularity at which they are easiest to demonstrate. They apply unchanged at every level of decomposition, and recognising this generalisation is a mark of maturity in applying them.

| Principle | At function level | At module or package level | At service level |
|---|---|---|---|
| **SRP** | A function does one thing; its name fully describes its effect, with no hidden side effects. | A package serves one area of concern and does not mix domain logic with infrastructure. | A service owns one business capability and one data store. |
| **OCP** | New behaviour is added by passing a different function argument rather than adding a branch. | New capability arrives as a new module registered through an existing extension point. | New behaviour arrives as a new subscriber to an existing event stream, with no change to the publisher. |
| **LSP** | A replacement function accepts the same inputs and returns the same guarantees. | A replacement module honours the package's public contract. | A new version of a service remains backward compatible with existing consumers. |
| **ISP** | A function takes only the parameters it uses, rather than a large configuration object. | A package exposes a narrow public surface and keeps the rest private. | A service exposes purpose-specific endpoints instead of one generic endpoint driven by a mode flag. |
| **DIP** | A function receives its collaborators as parameters rather than importing them at module scope. | Domain packages define the interfaces that infrastructure packages implement. | Services communicate through published contracts and message schemas rather than through each other's databases. |

Two entries in this table deserve elaboration.

**Stamp coupling at function level.** A function that accepts an entire `Order` object in order to read `order.total` is coupled to the whole of `Order`. Accepting `total: float` removes that coupling, makes the function reusable in contexts that have no `Order`, and states the actual requirement in the signature. This is ISP applied to a parameter list.

**The shared database as a DIP violation between services.** When two services read and write the same tables, each is coupled to the other's internal storage schema, which is the most concrete detail either service has. Neither can change its schema independently, so the services are separately deployable but not separately modifiable, which forfeits the main benefit of separating them. Communicating through published contracts restores the inversion.

---

## 13. Anti-Patterns and Misapplications

The failures below are all committed by developers who have learned SOLID and are applying it earnestly. They are more common in practice than outright ignorance of the principles.

### 13.1 Speculative generality

An abstraction is created for a variation that has never occurred and has not been requested. The codebase carries an interface, a factory, and a configuration entry to support exactly one implementation.

The diagnostic is quantitative: count the implementations of each abstraction in the codebase. An abstraction with a single implementation and no documented plan for a second is a candidate for removal. The counter-consideration is testability, since an abstraction with one production implementation and one test implementation genuinely has two, and that is sufficient justification when the dependency is infrastructural.

### 13.2 Mechanical splitting mistaken for SRP

A large class is divided by line count or by alphabetical grouping of methods rather than by reason to change. The result is two classes that must always be modified together, so the blast radius is unchanged while the comprehension cost has doubled. The corrective question is not "is this class large" but "which distinct actors can require this class to change."

### 13.3 The anaemic domain model

Every behaviour is extracted into a service class, leaving entities as bare attribute containers. Invariants that the entity should enforce are enforced instead by whichever service remembers to check them, which means they are eventually enforced inconsistently. Behaviour that maintains an entity's own invariants belongs on the entity; behaviour that coordinates several entities or reaches outside the process does not.

### 13.4 Interface proliferation

Every class is given a corresponding interface, frequently generated mechanically and named by prefixing the class name. These are header interfaces in the sense of Section 8.7: they mirror an implementation rather than describing a client's role, so they add a file and an indirection without reducing coupling.

### 13.5 Abstraction in the wrong vocabulary

An interface is introduced, satisfying clause A of DIP, but its methods are named after the implementation's operations, violating clause B. `IEmailSender.send_smtp_message` is abstract in form and concrete in meaning. The test is whether a genuinely different implementation could satisfy the interface without distortion.

### 13.6 Configuration-driven complexity

Extensibility is pursued through configuration files and runtime registries in a system where the set of variants is small, internal, and stable. The result is behaviour that cannot be traced by reading code, that fails at runtime rather than at import time, and that requires reading two artefacts to understand one flow. Registries are appropriate for genuine plugin systems and are overhead for five internal variants.

### 13.7 Applying principles without measuring the outcome

The strongest available evidence for whether a design decision worked is the version control history. If a class was split six months ago and both halves have changed together in every subsequent commit, the split was wrong and should be reversed. Design principles produce predictions about future change; the repository records what actually happened, and consulting it converts design from an aesthetic exercise into an empirical one.

---

## 14. When SOLID Should Not Be Applied

Each principle imposes a cost in indirection, file count, and comprehension effort. That cost is justified only when the corresponding benefit is realised, and the benefit is realised only when the code changes in the anticipated way.

| Context | Recommendation | Reason |
|---|---|---|
| Exploratory prototypes and spikes | Do not apply | The purpose is to discover requirements. Abstractions built on unknown requirements are built on the wrong boundaries and will be discarded with the prototype. |
| Scripts under a few hundred lines with a short lifetime | Do not apply | Total lifetime cost is dominated by writing, not by maintenance, so there is no maintenance cost to reduce. |
| Stable domains with no realistic variation | Apply selectively | Physical constants and closed mathematical enumerations do not grow. Abstracting them yields indirection with no possible return. |
| Performance-critical inner loops | Apply selectively and measure | Dynamic dispatch and object allocation carry measurable cost in tight loops. The correct procedure is to profile first, since intuitions about hot paths are frequently wrong. |
| Code with a single implementation and no test substitution need | Defer | Introduce the abstraction when the second implementation appears, at which point the correct shape is known from evidence. |
| Long-lived business logic in an evolving domain | Apply thoroughly | This is the context the principles were formulated for, and the context in which they repay their cost most reliably. |
| Any module at a boundary with external systems | Apply DIP in particular | External systems are the most volatile and least controllable dependencies, and they are the ones that make testing expensive. |

Two general guidelines summarise the judgement required.

**The rule of three.** Write the direct implementation for the first case. Duplicate or extend it for the second while observing what actually varies. Introduce the abstraction at the third, when the axis of change has been demonstrated by evidence rather than predicted. This sequence produces better abstractions than up-front design, because it is informed by real variation.

**Abstract the boundaries, keep the core concrete.** Apply DIP aggressively where the system meets databases, networks, clocks, file systems, and third-party services, because these are volatile and make testing expensive. Keep pure domain computation concrete, direct, and free of indirection, because it is stable, deterministic, and already easy to test.

---

## 15. Summary and Key Takeaways

### 15.1 Principle reference

| Principle | Statement | Problem addressed | Primary mechanism | Chief cost |
|---|---|---|---|---|
| **SRP** | One reason to change per module | Merge contention, fragility, immobility | Separation by actor | More files, indirection, risk of anaemic entities |
| **OCP** | Open for extension, closed for modification | Regression risk when adding variants | Polymorphic dispatch behind a stable abstraction | Wrong axis prediction produces useless indirection |
| **LSP** | Subtypes must honour base contracts | Unreliable polymorphism and defensive type checks | Contract preservation, verified by contract tests | Requires documented contracts and discourages inheritance |
| **ISP** | No forced dependency on unused methods | Unnecessary coupling and stubbed implementations | Decomposition into role interfaces | Interface proliferation, composition complexity |
| **DIP** | Depend on abstractions owned by policy | Untestable, rigid, immobile business logic | Inverted source dependency plus injection | Object graph is harder to trace |

### 15.2 Diagnostic quick reference

| Observed symptom | Most likely violated principle | First corrective action |
|---|---|---|
| One file is edited by several teams for unrelated reasons | SRP | Identify actors and split along actor boundaries |
| Adding a variant requires editing a conditional | OCP | Introduce an abstraction for the varying concept |
| Implementations raise `NotImplementedError` | ISP, and consequently LSP | Split the interface along the client usage matrix |
| Clients use `isinstance` to handle subtypes differently | LSP | Restructure the hierarchy so the base promises only what all subtypes deliver |
| A unit test requires a database or a network | DIP | Extract a domain-vocabulary interface and inject the implementation |
| Changing a technology requires edits across many modules | DIP | Locate the concrete type references and replace them with an abstraction |
| The same conditional chain appears in several files | OCP | Consolidate into one polymorphic abstraction |

### 15.3 Key takeaways

1. **The principles share a single objective, which is reducing the cost of change.** Each addresses a different mechanism by which change becomes expensive, and every one of them can be restated as an instruction to lower coupling or raise cohesion.

2. **The principles form a reinforcing system rather than a checklist.** Correct application of one makes the others easier to satisfy, and a violation of one propagates predictably into violations of the rest, beginning almost always with an unchecked accumulation of responsibilities.

3. **Contracts are behavioural, not syntactic.** A subclass that matches every signature and violates a single guarantee has broken the abstraction as thoroughly as one that fails to compile. This is the reason LSP occupies a different position from the other four.

4. **Abstraction is a bet on a predicted axis of change.** Correct predictions repay their cost at the first variation; incorrect predictions impose permanent indirection that serves nothing. Deferring abstraction until the axis is demonstrated by evidence produces better designs than predicting it in advance.

5. **Testability is the most reliable available proxy for good design.** Code that can be unit tested without infrastructure has, almost by construction, separated policy from mechanism, depends on abstractions, and has narrow interfaces. When a design decision is genuinely unclear, asking how the result will be tested resolves it more often than any other question.

6. **The most common failure among practitioners is over-application, not under-application.** Speculative abstraction, mechanical splitting, and interface proliferation are the characteristic errors of developers who have recently learned SOLID, and they are more expensive than the entangled code they were intended to prevent.

7. **SOLID is the conceptual foundation of the design patterns catalogue.** Nearly every pattern in the Gang of Four catalogue is a concrete, named realisation of one or more of these principles, which is why the patterns become substantially easier to understand once the principles are secure.

---

## 16. Self-Assessment Questions with Answers

Answer each question in writing before expanding the response. Questions test conceptual discrimination rather than recall, and several are deliberately constructed so that the obvious answer is incorrect.

**Q1.** A `Report` class has eighteen methods, all operating on the same dataset and all changing whenever the reporting requirements change. Does it violate SRP?

<details><summary>Answer</summary>

Not on the evidence given. SRP counts actors, not methods. If all eighteen methods change in response to requests from the reporting stakeholder and no other, the class has one reason to change and is cohesive. The class should be examined for a second actor, for instance if some methods perform data retrieval owned by a platform team, or if some perform file output owned by an infrastructure team. If such methods exist, the violation lies in those specific methods and not in the method count.

</details>

**Q2.** Is it possible to satisfy SRP fully while violating OCP badly?

<details><summary>Answer</summary>

Yes, and the combination is common. A `DiscountCalculator` whose sole purpose is calculating discounts has exactly one reason to change and satisfies SRP. If it implements that purpose with a conditional chain over customer tiers, every new tier requires editing it, which violates OCP. SRP governs where boundaries are drawn between modules; OCP governs how variation is handled inside a boundary. They are orthogonal.

</details>

**Q3.** A subclass overrides a method to add caching. Under what circumstances is this an LSP violation?

<details><summary>Answer</summary>

It is a violation when the base contract promises freshness and the cache can return stale data, since that weakens a postcondition. It is not a violation when the base contract promises only to return the entity with the given identifier, since caching is then an unobservable implementation detail. The determining factor is the documented contract, not the presence of caching. This is a case where the correct answer cannot be derived from the code alone.

</details>

**Q4.** Explain the difference between the Dependency Inversion Principle and dependency injection, and state whether either implies the other.

<details><summary>Answer</summary>

DIP is a principle governing the shape of the dependency graph: policy should depend on abstractions that policy itself defines, and mechanisms should depend on those abstractions. Dependency injection is a technique for supplying collaborators from outside a module. Neither implies the other. Injecting a concrete `MySQLDatabase` uses injection without achieving inversion, since the declared dependency is still a concrete class. Conversely, a module could depend on an abstraction and obtain its instance from a service locator, achieving inversion without injection, though at the cost of a hidden dependency on the locator. In practice DIP is normally realised through injection because injection makes the dependency explicit at the constructor.

</details>

**Q5.** An interface declares `save`, `load`, `delete`, `export_to_csv`, and `send_by_email`. Which principle is most clearly violated, and what is the secondary consequence?

<details><summary>Answer</summary>

ISP is most clearly violated, since the five operations serve at least three distinct client groups: persistence clients, reporting clients, and communication clients. No client requires all five. The secondary consequence is an LSP violation, because implementations that can persist but cannot send email will supply stubs that raise exceptions, which breaks the contract they advertise. There is also an SRP concern on the implementation side, since persistence, export, and communication answer to different actors. This question illustrates the cascade described in Section 10.1.

</details>

**Q6.** Under what circumstances should a conditional chain be preferred over polymorphic dispatch?

<details><summary>Answer</summary>

When the set of cases is closed and cannot grow, such as the three orderings between two comparable values. When the set is small, stable, and entirely local, so that the cost of indirection exceeds the cost of an occasional edit. When the branches are trivial value lookups, in which case a dictionary is simpler than either a conditional or a class hierarchy. When the code is a short-lived script whose total maintenance cost is negligible. The error is never the conditional itself; it is the use of a conditional along an axis that is known to be growing.

</details>

**Q7.** A team introduces `IUserService`, `IOrderService`, and `IPaymentService`, each with exactly one implementation and each mirroring its implementation's full public surface. Evaluate this design.

<details><summary>Answer</summary>

These are header interfaces, described in Section 8.7. They provide syntactic indirection without reducing coupling, because their shape is determined by the implementation rather than by any client's requirement, and any change to an implementation propagates to its interface and then to all clients. They also constitute speculative generality if no second implementation is anticipated. The defensible exception is when the interface enables test substitution at a genuine infrastructure boundary. For internal application services, the interfaces should be removed, and reintroduced later as narrow role interfaces defined by the clients that need them.

</details>

**Q8.** Two classes have been separate for a year. Version control shows they have been modified in the same commit on every occasion. What does this indicate?

<details><summary>Answer</summary>

It indicates that the original separation did not follow an actor boundary, so the two classes share a reason to change and should probably be merged. This is the empirical test described in Section 13.7: design principles produce predictions about future change, and the repository records what actually happened. Consistent co-modification over a long period is strong evidence that the predicted boundary was incorrect. The counter-consideration is that the classes may be co-changing because of a third, poorly placed dependency, in which case relocating that dependency is the better remedy.

</details>

**Q9.** Why is the Liskov Substitution Principle described as occupying a different position from the other four?

<details><summary>Answer</summary>

The other four are structural directives that describe how code should be arranged: how it is partitioned, how it is extended, how wide its interfaces are, and which direction its dependencies point. LSP is a correctness condition on the arrangement rather than a directive about it. If subtypes do not honour their contracts, then abstractions cannot be trusted, and every design built on those abstractions inherits the defect: OCP produces extension points that are unreliable, and DIP produces indirection without genuine substitutability. LSP is therefore a precondition for the other principles delivering their claimed benefits.

</details>

**Q10.** A senior engineer rejects a pull request that introduces four new interfaces to support a single feature. What questions should the reviewer be asking?

<details><summary>Answer</summary>

How many implementations does each interface have, counting test implementations separately from production ones. Which documented or observed axis of change does each interface protect. What would break if the interface were removed and the concrete class used directly. Is each interface shaped by a client's requirement or by an implementation's public surface. Has a similar abstraction in this codebase previously been introduced and never used. These questions convert the review from a matter of taste into an examination of evidence, which is the only basis on which abstraction decisions can be settled reliably.

</details>

---

## 17. Practice Exercises with Solutions

Attempt each exercise before reading the solution. Solutions include the reasoning behind the design choices, not only the resulting code, because the reasoning is the transferable part.

### Exercise 1: Diagnose and repair an SRP violation

Identify every responsibility in the class below, name the actor associated with each, and restructure accordingly.

```python
class Invoice:
    def __init__(self, items):
        self.items = items                       # list of (name, price, quantity)

    def calculate_total(self):
        return sum(price * quantity for _, price, quantity in self.items)

    def calculate_tax(self):
        return self.calculate_total() * 0.18

    def save_to_pdf(self, filepath):
        print(f"Writing PDF to {filepath}")

    def send_by_email(self, recipient):
        print(f"Emailing invoice to {recipient}")

    def record_in_ledger(self):
        print("INSERT INTO ledger ...")
```

<details><summary>Solution</summary>

**Responsibilities and actors.**

| Responsibility | Actor | Trigger for change |
|---|---|---|
| Holding invoice data | Domain modelling | A new field such as a purchase order reference is required |
| Monetary computation | Finance | The tax rate changes, or tax becomes jurisdiction-dependent |
| PDF rendering | Presentation and branding | The layout or logo changes |
| Email delivery | Infrastructure | The mail provider changes |
| Ledger persistence | Platform and accounting systems | The schema or storage engine changes |

Five actors, therefore five reasons to change, therefore five responsibilities in one class.

```python
class InvoiceLine:
    def __init__(self, description: str, unit_price: float, quantity: int):
        self.description = description
        self.unit_price = unit_price
        self.quantity = quantity

    @property
    def line_total(self) -> float:
        return self.unit_price * self.quantity


class Invoice:
    """
    Holds invoice state and computes only what is intrinsic to it. The
    subtotal is intrinsic, because it is a direct consequence of the lines
    present. Tax is not intrinsic, because it depends on jurisdiction and
    on rules owned outside the invoice.
    """

    def __init__(self, lines: list[InvoiceLine]):
        self.lines = lines

    @property
    def subtotal(self) -> float:
        return sum(line.line_total for line in self.lines)


class TaxCalculator:
    """
    Owned by Finance. Made a class rather than a constant so that
    jurisdiction-specific subclasses or configured rates can be introduced
    later without changing any caller.
    """

    def __init__(self, rate: float = 0.18):
        self.rate = rate

    def tax_for(self, invoice: Invoice) -> float:
        return invoice.subtotal * self.rate


class InvoicePdfRenderer:
    def render(self, invoice: Invoice, tax: float, filepath: str) -> None:
        # Receives the computed tax rather than a TaxCalculator, so that it
        # cannot recompute or reinterpret monetary values. This keeps the
        # two responsibilities from silently merging again.
        print(f"PDF at {filepath}: subtotal {invoice.subtotal}, tax {tax}")


class InvoiceEmailSender:
    def send(self, recipient: str, filepath: str) -> None:
        print(f"Emailing {filepath} to {recipient}")


class LedgerRepository:
    def record(self, invoice: Invoice, tax: float) -> None:
        print(f"Recording {invoice.subtotal + tax} in the ledger")
```

**Note on the subtotal decision.** Leaving `subtotal` on `Invoice` while extracting tax is deliberate. The subtotal is a direct arithmetic consequence of the invoice's own contents and changes only when the definition of an invoice line changes. Tax depends on external rules and changes when a tax authority acts. Extracting the subtotal as well would produce the anaemic model described in Section 5.8.

</details>

### Exercise 2: Apply OCP, then evaluate the alternatives

The class below requires modification whenever a new shape is supported. Refactor it, then state under what circumstances a simpler approach would have been preferable.

```python
class AreaCalculator:
    def total_area(self, shapes):
        total = 0
        for shape in shapes:
            if shape["type"] == "circle":
                total += 3.14159 * shape["radius"] ** 2
            elif shape["type"] == "square":
                total += shape["side"] ** 2
            elif shape["type"] == "rectangle":
                total += shape["width"] * shape["height"]
        return total
```

<details><summary>Solution</summary>

```python
from abc import ABC, abstractmethod
import math


class Shape(ABC):
    """
    The abstraction promises only area computation, which every shape can
    honour unconditionally. Adding a perimeter method would force every
    future shape to implement it, so operations are added here only when
    all conceivable shapes can supply them.
    """

    @abstractmethod
    def area(self) -> float:
        ...


class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2


class Square(Shape):
    def __init__(self, side: float):
        self.side = side

    def area(self):
        return self.side ** 2


class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height


class AreaCalculator:
    def total_area(self, shapes: list[Shape]) -> float:
        # No knowledge of any concrete shape. Adding a triangle requires
        # writing one new class and editing nothing.
        return sum(shape.area() for shape in shapes)
```

**When a simpler approach would suffice.** If the three shapes were fixed by the problem domain and no fourth could arise, the original conditional would be acceptable and shorter. The refactoring is justified here by two additional benefits beyond extensibility. First, the dictionary representation permitted invalid data, such as a circle without a radius, which the class-based version prevents at construction. Second, the original computed area with a truncated value of pi, an error that is easy to miss in a conditional chain and easy to isolate and test in a dedicated class.

</details>

### Exercise 3: Determine whether LSP is violated

For each subclass, state whether LSP is violated and identify the specific rule involved.

```python
class Account:
    """Contract: balance never becomes negative; withdraw raises on insufficient funds."""

    def __init__(self, balance: float):
        self._balance = balance

    def withdraw(self, amount: float) -> float:
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        return self._balance


class AuditedAccount(Account):
    def withdraw(self, amount):
        print(f"Audit: withdrawal of {amount}")
        return super().withdraw(amount)


class OverdraftAccount(Account):
    def withdraw(self, amount):
        self._balance -= amount          # Permits a negative balance
        return self._balance


class MinimumBalanceAccount(Account):
    def withdraw(self, amount):
        if self._balance - amount < 1000:
            raise ValueError("Balance would fall below the minimum")
        self._balance -= amount
        return self._balance
```

<details><summary>Solution</summary>

| Subclass | Violates LSP | Rule involved | Explanation |
|---|---|---|---|
| `AuditedAccount` | No | None | A side effect is added while every guarantee is preserved. Inputs accepted and outputs produced are unchanged. This is the Decorator pattern's structure and is always safe when the contract holds. |
| `OverdraftAccount` | Yes | Invariant preservation | The base guarantees a non-negative balance. This subclass permits a negative balance, so any client relying on the invariant, such as a report that assumes no negative totals, is broken by substitution. |
| `MinimumBalanceAccount` | Yes | Precondition strengthening | The base accepts any amount up to the current balance. This subclass rejects amounts that would breach a minimum, so inputs the base accepted are now refused, and a client that verified `amount <= balance` before calling will still encounter an exception. |

**Resolution.** The base abstraction promises too much. Restructure so that `Account` declares only that `withdraw` either succeeds or raises when its own policy forbids the withdrawal, with the specific policy left to each implementation. Clients then handle the exception in all cases rather than relying on a universal rule about balances. Alternatively, introduce an explicit `WithdrawalPolicy` collaborator, which converts the variation from an inheritance concern into a composition concern and eliminates the substitution question entirely.

</details>

### Exercise 4: Design segregated interfaces

Design the interfaces for a workshop in which a carpenter cuts wood only, a plumber fits pipes only, an electrician wires circuits only, and a general contractor performs all three. No specialist may be forced to implement another's operation.

<details><summary>Solution</summary>

```python
from abc import ABC, abstractmethod


class WoodCutter(ABC):
    @abstractmethod
    def cut_wood(self, plank) -> None: ...


class PipeFitter(ABC):
    @abstractmethod
    def fit_pipe(self, pipe) -> None: ...


class Electrician(ABC):
    @abstractmethod
    def wire_circuit(self, circuit) -> None: ...


class Carpenter(WoodCutter):
    def cut_wood(self, plank):
        print(f"Cutting {plank}")


class Plumber(PipeFitter):
    def fit_pipe(self, pipe):
        print(f"Fitting {pipe}")


class GeneralContractor(WoodCutter, PipeFitter, Electrician):
    """
    Multiple inheritance is used purely for interface composition. Each base
    contributes one abstract method and no state, so none of the usual
    hazards of multiple inheritance apply.
    """

    def cut_wood(self, plank): print(f"Contractor cutting {plank}")
    def fit_pipe(self, pipe): print(f"Contractor fitting {pipe}")
    def wire_circuit(self, circuit): print(f"Contractor wiring {circuit}")


def build_frame(planks, worker: WoodCutter) -> None:
    # The signature states the exact requirement. A plumber cannot be passed
    # here, and a test double needs exactly one method.
    for plank in planks:
        worker.cut_wood(plank)
```

**Alternative worth considering.** Modelling capability as data rather than as type is sometimes preferable, for instance a `Worker` class holding a set of `Skill` values. That design supports runtime capability changes, such as a worker gaining a certification, which a type hierarchy cannot express without replacing the object. The trade-off is that capability errors then surface at runtime rather than being prevented by the type system. Choose the type-based design when capabilities are fixed at construction, and the data-based design when they vary during an object's lifetime.

</details>

### Exercise 5: Invert a dependency and make the code testable

Refactor the class below so that its logic can be unit tested without a network connection and without waiting for real time to pass.

```python
import requests
from datetime import datetime


class SubscriptionChecker:
    def is_active(self, user_id):
        response = requests.get(f"https://api.billing.example.com/users/{user_id}")
        expiry = datetime.fromisoformat(response.json()["expires_at"])
        return expiry > datetime.now()
```

<details><summary>Solution</summary>

Two dependencies require inversion, and they are inverted for different reasons. The HTTP client is inverted because it is external, volatile, and slow. The clock is inverted because it is non-deterministic, and boundary conditions around expiry cannot otherwise be tested.

```python
from abc import ABC, abstractmethod
from datetime import datetime


class SubscriptionRepository(ABC):
    """
    Expressed in domain vocabulary. There is no mention of HTTP, URLs, or
    JSON, which is what permits a database-backed or in-memory
    implementation to satisfy it without distortion. An interface with a
    method named get_json would have violated clause B of DIP.
    """

    @abstractmethod
    def expiry_for(self, user_id: str) -> datetime | None:
        ...


class Clock(ABC):
    @abstractmethod
    def now(self) -> datetime: ...


class SystemClock(Clock):
    def now(self):
        return datetime.now()


class FixedClock(Clock):
    """Test implementation permitting exact control of boundary conditions."""

    def __init__(self, moment: datetime):
        self.moment = moment

    def now(self):
        return self.moment


class HttpSubscriptionRepository(SubscriptionRepository):
    """
    The only class that knows the billing service exists. All HTTP concerns,
    including retries, timeouts, and response parsing, are confined here.
    """

    def __init__(self, http_client, base_url: str):
        self.http_client = http_client
        self.base_url = base_url

    def expiry_for(self, user_id):
        response = self.http_client.get(f"{self.base_url}/users/{user_id}")
        payload = response.json()
        if payload.get("expires_at") is None:
            return None
        return datetime.fromisoformat(payload["expires_at"])


class InMemorySubscriptionRepository(SubscriptionRepository):
    def __init__(self, expiries: dict[str, datetime]):
        self.expiries = expiries

    def expiry_for(self, user_id):
        return self.expiries.get(user_id)


class SubscriptionChecker:
    """
    Contains the business rule and nothing else. The rule is that a
    subscription is active when an expiry exists and lies in the future.
    That rule is now independently testable.
    """

    def __init__(self, repository: SubscriptionRepository, clock: Clock):
        self.repository = repository
        self.clock = clock

    def is_active(self, user_id: str) -> bool:
        expiry = self.repository.expiry_for(user_id)
        if expiry is None:
            return False
        return expiry > self.clock.now()
```

Boundary behaviour can now be tested exactly.

```python
def test_subscription_expiring_exactly_now_is_inactive():
    moment = datetime(2026, 1, 1, 12, 0, 0)
    repository = InMemorySubscriptionRepository({"u1": moment})

    checker = SubscriptionChecker(repository, FixedClock(moment))

    # The rule uses a strict comparison, so an expiry equal to the current
    # instant is inactive. This boundary is untestable without an
    # injectable clock, and it is exactly the kind of case that produces
    # production defects.
    assert checker.is_active("u1") is False
```

</details>

### Exercise 6: Decide whether abstraction is warranted

A developer proposes introducing `ILoggerFactory`, `ILogFormatter`, `ILogSink`, and `ILogLevelResolver` for an internal tool that writes messages to standard output. The tool is used by four people and has no plan for structured logging. Evaluate the proposal.

<details><summary>Answer</summary>

The proposal should be rejected in its current form, and the reasoning matters more than the conclusion.

**Evidence against.** Each abstraction would have exactly one implementation with no documented second, which is the definition of speculative generality given in Section 13.1. The axis of change has not been demonstrated: no requirement for structured logging, alternative sinks, or configurable levels exists. Four abstractions to write a line to standard output inverts the ratio of ceremony to value, and the resulting indirection imposes a permanent comprehension cost on every reader.

**Evidence that might change the conclusion.** If the tool's output must be asserted in tests, a single narrow abstraction over the sink is warranted, since a test implementation is a genuine second implementation. If the tool is a library consumed by other teams, allowing callers to supply a logger is a reasonable interface decision rather than speculative abstraction.

**Recommended response.** Use the standard library's `logging` module directly, which already provides handler and formatter extensibility without any code being written. This illustrates a general point that is frequently overlooked: before building an abstraction, check whether the platform already supplies one.

</details>

### Exercise 7: Full refactoring with justification

The class below violates all five principles. Refactor it, and for each abstraction you introduce, state the axis of change that justifies it. Any abstraction you cannot justify should not be introduced.

```python
class ReportManager:
    def generate(self, report_type, start_date, end_date, output_format, email_to):
        if report_type == "sales":
            rows = self._query("SELECT * FROM sales WHERE date BETWEEN ...")
        elif report_type == "inventory":
            rows = self._query("SELECT * FROM inventory WHERE date BETWEEN ...")

        if output_format == "csv":
            content = ",".join(str(r) for r in rows)
        elif output_format == "html":
            content = "<table>" + "".join(f"<tr>{r}</tr>" for r in rows) + "</table>"

        print(f"Sending report to {email_to}")
        return content

    def _query(self, sql):
        print(f"Executing {sql}")
        return [1, 2, 3]
```

<details><summary>Solution</summary>

**Axes of change, established before any code is written.**

| Axis | Evidence that it will change | Abstraction justified |
|---|---|---|
| Report types | New reports are requested routinely by the business | Yes, a `ReportSource` abstraction |
| Output formats | Formats are added when new consumers appear, such as an auditor requiring PDF | Yes, a `ReportFormatter` abstraction |
| Delivery mechanism | Delivery may move to file storage or a message queue, and tests must not send email | Yes, a `ReportDelivery` abstraction |
| Date range handling | The concept of a date range is stable | No abstraction; a value object suffices |
| The report workflow itself | The sequence of fetch, format, deliver is stable | No abstraction; a concrete orchestrator suffices |

The final two rows are the important part of the answer. Recognising which axes do not warrant abstraction is as much a part of the exercise as recognising those that do.

```python
from abc import ABC, abstractmethod
from datetime import date


class DateRange:
    """A value object. Concrete because the concept does not vary."""

    def __init__(self, start: date, end: date):
        if end < start:
            raise ValueError("End date cannot precede start date")
        self.start = start
        self.end = end


class ReportSource(ABC):
    """Axis: new report types. One implementation per report."""

    @abstractmethod
    def rows_for(self, period: DateRange) -> list[dict]: ...


class ReportFormatter(ABC):
    """Axis: new output formats. Formatting is independent of data source."""

    @abstractmethod
    def format(self, rows: list[dict]) -> str: ...


class ReportDelivery(ABC):
    """Axis: new delivery channels, and the need for a test implementation."""

    @abstractmethod
    def deliver(self, content: str, destination: str) -> None: ...


class SalesReportSource(ReportSource):
    def __init__(self, database):
        # The database is injected rather than constructed, so this class is
        # itself testable and is not bound to a specific engine.
        self.database = database

    def rows_for(self, period):
        return self.database.query(
            "SELECT * FROM sales WHERE date BETWEEN ? AND ?",
            period.start, period.end,
        )


class CsvFormatter(ReportFormatter):
    def format(self, rows):
        if not rows:
            return ""
        headers = list(rows[0].keys())
        lines = [",".join(headers)]
        lines.extend(",".join(str(row[h]) for h in headers) for row in rows)
        return "\n".join(lines)


class HtmlFormatter(ReportFormatter):
    def format(self, rows):
        body = "".join(
            "<tr>" + "".join(f"<td>{value}</td>" for value in row.values()) + "</tr>"
            for row in rows
        )
        return f"<table>{body}</table>"


class EmailDelivery(ReportDelivery):
    def __init__(self, mail_client):
        self.mail_client = mail_client

    def deliver(self, content, destination):
        self.mail_client.send(destination, content)


class CapturingDelivery(ReportDelivery):
    """Test implementation. Its existence is the second implementation that
    justifies the ReportDelivery abstraction independently of future channels."""

    def __init__(self):
        self.delivered: list[tuple[str, str]] = []

    def deliver(self, content, destination):
        self.delivered.append((destination, content))


class ReportService:
    """
    Concrete, because the workflow does not vary. Its single reason to
    change is a change to the sequence of steps, for instance if reports
    must be archived before delivery.
    """

    def __init__(self, source: ReportSource, formatter: ReportFormatter,
                 delivery: ReportDelivery):
        self.source = source
        self.formatter = formatter
        self.delivery = delivery

    def produce(self, period: DateRange, destination: str) -> str:
        rows = self.source.rows_for(period)
        content = self.formatter.format(rows)
        self.delivery.deliver(content, destination)
        return content
```

**Principle verification.**

| Principle | How it is satisfied |
|---|---|
| SRP | Data retrieval, formatting, delivery, and workflow coordination are four separate concerns owned by four different groups, and each occupies its own class. |
| OCP | New report types and new formats are new classes. `ReportService` is never edited. |
| LSP | Every formatter accepts any list of rows and returns a string; every source accepts any date range. No implementation restricts inputs its abstraction accepts. |
| ISP | Each interface declares one method, matching what each client actually invokes. |
| DIP | `ReportService` names no database, no template engine, and no mail transport. `SalesReportSource` receives its database rather than constructing it. |

**On the two rejected abstractions.** A `DateRangeStrategy` would have added indirection for a concept with no variation. A `ReportWorkflow` interface would have added a substitution point for a sequence that no requirement suggests will vary. Declining to build them is a design decision of the same weight as building the three that were justified.

</details>

---

## 18. Where SOLID Leads Next

The five principles describe properties that a good design exhibits. They do not supply a catalogue of concrete solutions to recurring problems. That catalogue is the subject of design patterns, and the relationship between the two bodies of knowledge is direct: most patterns are named, reusable structures that realise one or more SOLID principles for a specific class of problem.

| Pattern | Principles it primarily realises | Problem it addresses |
|---|---|---|
| Strategy | OCP, DIP | Selecting among interchangeable algorithms at runtime |
| Factory Method and Abstract Factory | OCP, DIP | Deferring the choice of concrete class to a single, isolated location |
| Adapter | DIP, LSP | Making an existing incompatible interface conform to a required abstraction |
| Decorator | OCP, LSP, SRP | Adding behaviour to an object without modifying it or its class |
| Observer | OCP, SRP | Notifying an open-ended set of dependents without the subject knowing them |
| Template Method | OCP, LSP | Fixing an algorithm's skeleton while allowing specific steps to vary |
| Repository | DIP, SRP | Separating domain logic from persistence mechanism |
| Composite | LSP, OCP | Treating individual objects and compositions of objects uniformly |

Studying patterns before the principles produces memorisation of structures without understanding of purpose, which is why patterns applied in that state tend to be applied where they do not belong. Studying the principles first, as this document has done, means each pattern arrives as a familiar idea in a specific form: Strategy is recognisable immediately as the OCP resolution from Section 6.6, and Repository is recognisable as the DIP resolution from Section 9.4.

The next documents in this series treat the creational, structural, and behavioural pattern families in that light.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch. Explore more: https://codeverra.com*
