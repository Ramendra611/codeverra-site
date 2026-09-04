# SOLID Principles: Practice Workbook

> **Prerequisite:** `02_solid_principles.md`. This workbook assumes the five principles have already been defined and demonstrated. It contains no new theory. Its purpose is to convert conceptual knowledge into diagnostic skill.

---

## Table of Contents

1. [How to Use This Workbook](#1-how-to-use-this-workbook)
2. [Vocabulary and the Diagnostic Method](#2-vocabulary-and-the-diagnostic-method)
3. [Section A: Recognition Drills](#3-section-a-recognition-drills)
4. [Section B: Single Responsibility Principle](#4-section-b-single-responsibility-principle)
5. [Section C: Open/Closed Principle](#5-section-c-openclosed-principle)
6. [Section D: Liskov Substitution Principle](#6-section-d-liskov-substitution-principle)
7. [Section E: Interface Segregation Principle](#7-section-e-interface-segregation-principle)
8. [Section F: Dependency Inversion Principle](#8-section-f-dependency-inversion-principle)
9. [Section G: Combined Violations](#9-section-g-combined-violations)
10. [Section H: Capstone Refactor](#10-section-h-capstone-refactor)
11. [Self-Review Checklist](#11-self-review-checklist)
12. [Summary and Key Takeaways](#12-summary-and-key-takeaways)
13. [Appendix: Violation Signature Reference](#13-appendix-violation-signature-reference)

---

## 1. How to Use This Workbook

### 1.1 What this document is for

Knowing the definition of the Single Responsibility Principle and being able to detect a Single Responsibility violation in unfamiliar code are two different competencies. The first is declarative knowledge and can be acquired by reading. The second is a diagnostic skill and can only be acquired by repeated exposure to examples, followed by correction.

This workbook supplies that exposure. It contains 24 problems arranged so that each principle is encountered three times at increasing levels of difficulty, then encountered again in combination with other principles, and finally encountered inside a single large class that violates all five at once. The last arrangement is the one that occurs in production code and in design interviews.

The objective is stated precisely as follows. On completing this workbook, a learner presented with an unfamiliar class of 40 to 60 lines should be able to state which principles are under strain, justify each claim by pointing to specific lines, and describe the direction of the correction without needing to consult reference material.

### 1.2 The three difficulty levels

Every section progresses through three levels. The levels are not merely longer problems; they exercise different cognitive operations.

| Level | Name | Input given to the learner | Operation exercised | Expected time |
|---|---|---|---|---|
| 1 | Recognition | A short code fragment, 10 to 20 lines | Identify the violated principle and state the reason in one or two sentences. No code is written. | 2 to 4 minutes |
| 2 | Correction | A defective class, 20 to 45 lines | Diagnose the defect, then produce corrected code that preserves existing behaviour | 15 to 25 minutes |
| 3 | Construction | A prose requirement only, no code | Derive the class structure independently, define the abstractions, and justify the design | 25 to 45 minutes |

Level 1 tests whether the violation signature is recognised. Level 2 tests whether the correction is known. Level 3 tests whether the principle has been internalised well enough to prevent the violation from occurring in the first place, which is the only level that transfers directly to real work.

Learners who find Level 2 comfortable should not treat Level 3 as optional. Correcting supplied code is a substantially easier task than designing structure from a requirement, because the supplied code already contains the domain vocabulary, the method names, and the data shapes. At Level 3 none of that is given.

### 1.3 Working method

Each problem states its requirements completely before the solution appears. The solution is preceded by a horizontal rule and a `### Solution` heading so that it can be scrolled past. The recommended procedure is:

1. Read the problem statement and the code, if code is supplied.
2. Write the diagnosis in your own words before writing any code. A diagnosis that cannot be written in two sentences is usually incomplete.
3. Produce the correction or the design.
4. Read the solution and compare, paying attention to the reasoning rather than to superficial differences in naming.

Differences in class names, in the choice between `abc.ABC` and `typing.Protocol`, and in the placement of small helper methods are not errors. Differences in where the dependencies are created, in which class owns which decision, and in whether new behaviour requires editing existing code are errors, and they are the differences worth studying.

### 1.4 Recommended schedule

The workbook is designed for two passes separated by at least one week.

| Pass | Timing | Method | Purpose |
|---|---|---|---|
| First | Immediately after studying `02_solid_principles.md` | Reference material permitted for Level 3 problems | Establish the vocabulary and the correction patterns |
| Second | Seven to ten days later | No reference material, no notes | Measure retention and expose the principles that were memorised rather than understood |

The difference between the two passes is the useful measurement. A principle that is diagnosed correctly in the first pass and incorrectly in the second was never learned; it was recalled.

---

## 2. Vocabulary and the Diagnostic Method

### 2.1 Terms used throughout the solutions

Precise vocabulary is what allows a diagnosis to be stated in two sentences instead of two paragraphs. The following terms appear repeatedly in the solutions and are defined here for reference.

| Term | Definition |
|---|---|
| **Responsibility** | A single reason for a module to change, expressed as the concern of one stakeholder role. Formatting rules are the concern of a presentation owner; storage schema is the concern of a database owner. These are two responsibilities regardless of how few lines each occupies. |
| **Axis of change** | An independent direction along which a requirement can vary. Payment provider, output format, and persistence technology are three axes. A class touched by movement along more than one axis holds more than one responsibility. |
| **Contract** | The complete set of promises a callable makes: what it requires before being invoked, what it guarantees afterwards, and what it may raise. A contract includes obligations that are documented informally or implied by the type signature, not only those enforced by the interpreter. |
| **Precondition** | A condition that must hold before a method is invoked for the method to behave as specified. Example: `withdraw(amount)` requires `amount > 0`. |
| **Postcondition** | A condition the method guarantees on return. Example: after a successful `withdraw(amount)`, the balance has decreased by exactly `amount`. |
| **Invariant** | A condition true of an object throughout its observable lifetime. Example: a savings account balance never falls below zero. |
| **Abstraction** | A named contract with no implementation commitment, expressed in Python as an abstract base class (`abc.ABC`) or a structural type (`typing.Protocol`). |
| **Role interface** | An abstraction defined by what a specific client needs rather than by what an implementer can do. `Readable` is a role interface; `DataManager` with six unrelated methods is not. |
| **Seam** | A point at which behaviour can be substituted without editing the surrounding code. A constructor parameter accepting an abstraction is a seam; a constructor body that instantiates a concrete class is not. |
| **Composition root** | The single location, normally the application entry point, at which concrete implementations are selected and assembled into an object graph. Every other module receives its collaborators rather than choosing them. |
| **Change magnet** | A class that appears in the diff of most feature branches. Its presence is empirical evidence of a responsibility or extensibility defect, independent of any reading of the code. |
| **Shotgun surgery** | The condition in which a single logical change requires coordinated edits across many files. It is the symptom that results when one responsibility has been scattered rather than localised. |

### 2.2 A repeatable scan

Diagnosis is faster and more reliable when it follows a fixed order rather than an intuition. The following five questions, asked in this sequence, will locate the majority of violations in a class of moderate size. The ordering matters: responsibility defects are addressed first because they frequently cause the others, and a class that has been correctly split often turns out to have no remaining extensibility or dependency problem.

1. **Enumerate the reasons this class would be edited.** List them as concrete requirement changes, not as abstract categories. If the list has more than one entry, the Single Responsibility Principle is under strain.
2. **Search for conditional chains keyed on a type, a mode, or a string constant.** Each such chain is a location that must be edited when a new variant appears, which is an Open/Closed defect.
3. **Inspect every override for narrowed behaviour.** An override that raises an exception the base does not declare, that rejects inputs the base accepts, or that guarantees less than the base promises is a Liskov violation.
4. **Inspect every implementer for unused inherited obligations.** A method implemented as `pass`, as `return None`, or as `raise NotImplementedError` indicates that the interface obliges the implementer to declare capability it does not have, which is an Interface Segregation defect.
5. **Locate every point at which the class obtains a collaborator.** A collaborator constructed inside the class, imported as a module-level singleton, or read from global configuration is a Dependency Inversion defect, because it removes the seam at which substitution would occur.

### 2.3 The relationship between the answers

The five questions are not independent, and the solutions in this workbook repeatedly rely on the following relationships.

| Observation | Principle primarily violated | Principle usually violated as a consequence |
|---|---|---|
| One class formats, stores, and transmits | SRP | DIP, because storage and transport are concrete infrastructure |
| Conditional chain on a variant code | OCP | SRP, because each branch is a distinct policy living in a shared method |
| Subclass raises `NotImplementedError` | ISP, if the base declared too much | LSP, because callers holding the base type now fail unpredictably |
| Caller uses `isinstance` before calling a method | LSP | OCP, because each new subtype adds a branch to the guard |
| Dependency constructed in `__init__` | DIP | None directly, but it makes the class untestable in isolation |

The practical consequence is that a diagnosis naming one violation is usually incomplete. Section G and Section H are built specifically to train the habit of enumerating all of them.

---

## 3. Section A: Recognition Drills

Five short fragments follow. For each one, name the principle under strain and state the reason in a single sentence. No code is to be written. The intended time is two to four minutes per fragment, which is short enough to force pattern recognition rather than deliberation.

The fragments are drawn from five different domains deliberately. A learner who practises on a single domain begins to recognise the domain rather than the defect.

---

### Drill A.1

```python
class PatientRecord:
    def __init__(self, patient_id: str, name: str, contact: str):
        self.patient_id = patient_id
        self.name = name
        self.contact = contact
        self.visits = []

    def update_contact(self, new_contact: str) -> None:
        self.contact = new_contact

    def add_visit(self, visit) -> None:
        self.visits.append(visit)

    def send_discharge_email(self, smtp_host: str, smtp_user: str) -> None:
        import smtplib
        server = smtplib.SMTP(smtp_host)
        server.login(smtp_user, "hunter2")
        server.sendmail(smtp_user, self.contact, f"Discharge summary for {self.name}")
        server.quit()

    def generate_pdf_summary(self, output_path: str) -> None:
        with open(output_path, "wb") as handle:
            handle.write(b"%PDF-1.4 ... rendered visit history ...")

    def save_to_database(self, connection) -> None:
        connection.execute(
            "INSERT INTO patients (id, name, contact) VALUES (?, ?, ?)",
            (self.patient_id, self.name, self.contact),
        )
```

**Question:** Which principle is violated, and why?

---

### Solution A.1

**Single Responsibility Principle.**

The class holds four independent reasons to change: the structure of patient data, the mail transport mechanism, the layout of the printed discharge summary, and the relational schema used for persistence. A migration from SMTP to a transactional email API, a change to the PDF layout, and a change to the database schema are three unrelated requirements originating from three different stakeholder roles, yet all three arrive at this one file.

The direction of correction is to reduce `PatientRecord` to the data and the rules that govern that data, and to relocate mail transport, document rendering, and persistence into separate collaborators. Note that the mail and persistence methods also constitute a Dependency Inversion defect, because `smtplib` is imported and used directly rather than being reached through an abstraction. The responsibility defect is the primary one, because correcting it is what creates the classes in which the dependency can then be injected.

---

### Drill A.2

```python
class ShippingCostCalculator:
    def calculate(self, order, courier: str) -> float:
        weight = order.total_weight_kg
        if courier == "bluedart":
            return 40.0 + (12.0 * weight)
        elif courier == "delhivery":
            return 35.0 + (10.5 * weight) + (20.0 if order.is_cod else 0.0)
        elif courier == "indiapost":
            base = 25.0 + (8.0 * weight)
            return base * 0.5 if order.is_book_media else base
        elif courier == "fedex":
            return 150.0 + (30.0 * weight) if order.is_international else 90.0 + (18.0 * weight)
        else:
            raise ValueError(f"Unsupported courier: {courier}")
```

**Question:** Which principle is violated, and why?

---

### Solution A.2

**Open/Closed Principle.**

Every additional courier requires an edit inside `calculate`, which means the class is not closed against a change that is certain to recur. The specific cost of this arrangement is that adding a courier requires re-testing the rate logic of every existing courier, because all of it lives in one method that has just been modified.

The direction of correction is to define an abstraction representing a courier rate card with a single method that returns a cost for an order, to implement one class per courier, and to reduce the calculator to a lookup and a delegation. Adding a courier then consists of adding a class and registering it, with no edit to any existing rate logic.

A secondary observation worth making at this stage is that the four branches contain genuinely different business rules: a cash-on-delivery surcharge, a media discount, and an international multiplier. These are separate policies that have been co-located purely because they share a method, which is also a responsibility defect.

---

### Drill A.3

```python
class SavingsAccount:
    def __init__(self, account_no: str, balance: float):
        self.account_no = account_no
        self.balance = balance

    def deposit(self, amount: float) -> None:
        self.balance += amount

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        return amount


class FixedDepositAccount(SavingsAccount):
    def withdraw(self, amount: float) -> float:
        raise PermissionError("Fixed deposits cannot be withdrawn before maturity")


def sweep_idle_funds(account: SavingsAccount, target) -> None:
    if account.balance > 100_000:
        surplus = account.balance - 100_000
        account.withdraw(surplus)
        target.deposit(surplus)
```

**Question:** Which principle is violated, and why?

---

### Solution A.3

**Liskov Substitution Principle.**

`sweep_idle_funds` is written against the contract of `SavingsAccount`, which promises that `withdraw` succeeds whenever the requested amount does not exceed the balance. `FixedDepositAccount` is a declared subtype and is therefore accepted by the parameter, but it violates that promise unconditionally by raising `PermissionError`, an exception type the base contract never declares. The caller has no way to anticipate the failure short of testing the concrete type, which is precisely what subtype polymorphism is supposed to eliminate.

The direction of correction is to reject the inheritance relationship rather than to defend against it at the call site. A fixed deposit is not a savings account with one method disabled; it is a distinct product whose funds are not withdrawable on demand. Section D develops the two acceptable corrections in detail: separating the withdrawable capability into its own abstraction, or widening the base contract so that a refusal to withdraw is a declared and expected outcome rather than a surprise.

---

### Drill A.4

```python
from abc import ABC, abstractmethod


class RideVehicle(ABC):
    @abstractmethod
    def start_ride(self, rider_id: str) -> None: ...

    @abstractmethod
    def end_ride(self, rider_id: str) -> float: ...

    @abstractmethod
    def load_luggage(self, pieces: int) -> None: ...

    @abstractmethod
    def install_child_seat(self) -> None: ...

    @abstractmethod
    def enable_air_conditioning(self) -> None: ...


class Motorbike(RideVehicle):
    def start_ride(self, rider_id: str) -> None:
        print(f"Bike ride started for {rider_id}")

    def end_ride(self, rider_id: str) -> float:
        return 48.0

    def load_luggage(self, pieces: int) -> None:
        pass

    def install_child_seat(self) -> None:
        pass

    def enable_air_conditioning(self) -> None:
        pass
```

**Question:** Which principle is violated, and why?

---

### Solution A.4

**Interface Segregation Principle.**

`RideVehicle` obliges every implementer to declare five capabilities, but a motorbike possesses only two of them. The three empty implementations are not harmless boilerplate; each one is a false statement about the object's capability, and it is a statement that client code is entitled to rely on. A booking flow holding a `RideVehicle` reference will call `install_child_seat` and receive silent success, which is worse than an error because the failure surfaces later, at the kerb, rather than at the point of the mistaken call.

The direction of correction is to decompose the interface along the lines of client need: a `Rideable` abstraction carrying the two lifecycle methods, and separate `LuggageCapable`, `ChildSeatCapable`, and `ClimateControlled` abstractions. `Motorbike` then implements only `Rideable`, and its declared type contains no untrue promises.

Note the coupling to the Liskov Substitution Principle. Had the three unsupported methods raised `NotImplementedError` instead of silently passing, the same fragment would additionally be a Liskov violation. The underlying defect is identical in both variants: the interface promises more than the implementer can deliver, and the implementer is forced to choose between lying quietly and failing loudly.

---

### Drill A.5

```python
class InventoryService:
    def __init__(self):
        self.repository = MySQLInventoryRepository(
            host="prod-inventory.internal", user="svc_inv", password="s3cr3t"
        )
        self.notifier = FirebasePushSender(project_id="retail-prod-4417")

    def reserve(self, sku: str, quantity: int, customer_id: str) -> bool:
        available = self.repository.available_quantity(sku)
        if available < quantity:
            self.notifier.send(customer_id, f"{sku} is out of stock")
            return False
        self.repository.decrement(sku, quantity)
        self.notifier.send(customer_id, f"Reserved {quantity} units of {sku}")
        return True
```

**Question:** Which principle is violated, and why?

---

### Solution A.5

**Dependency Inversion Principle.**

The reservation policy, which is the high-level concern of this class, is expressed in terms of two concrete low-level implementations that it constructs for itself. Two consequences follow directly. The reservation rule cannot be exercised in a test without a reachable MySQL instance and a valid Firebase project, because both objects are created during `__init__` and the failure occurs before any policy code runs. Substituting a different data store or a different notification channel requires editing this class, even though the reservation rule itself is unchanged.

The direction of correction is to define `InventoryRepository` and `Notifier` abstractions expressing only what the reservation policy requires, to accept both through the constructor, and to move the selection of MySQL and Firebase to the composition root. The credentials embedded in the constructor are a separate defect of a different kind and should also be relocated to configuration, but the structural problem is the absence of a seam.

---

### Section A review

| Drill | Domain | Principle | Signature that identifies it |
|---|---|---|---|
| A.1 | Hospital records | SRP | Data, transport, rendering, and persistence in one class |
| A.2 | E-commerce shipping | OCP | Conditional chain keyed on a variant string |
| A.3 | Banking | LSP | Override raises an exception the base does not declare |
| A.4 | Ride-hailing | ISP | Implementer supplies empty bodies for unsupported obligations |
| A.5 | Retail inventory | DIP | Collaborators constructed inside `__init__` |

The rightmost column is the operative part of this table. Each signature is a syntactic pattern that can be spotted without understanding the domain, which is what makes rapid diagnosis possible in unfamiliar code.

---

## 4. Section B: Single Responsibility Principle

The principle under examination states that a module should have exactly one reason to change. The formal statement given by Robert C. Martin is that a module should be responsible to one, and only one, actor. The practical test used throughout this section is the enumeration described in Section 2.2: list the concrete requirement changes that would force an edit to the class, and count the distinct stakeholder roles those changes originate from.

---

### Problem B.1 (Level 1)

A content platform contains the following class.

```python
class BlogPost:
    def __init__(self, author_id: str):
        self.author_id = author_id
        self.title = ""
        self.body = ""
        self.tags: list[str] = []
        self.published = False

    def set_title(self, title: str) -> None:
        if len(title) > 120:
            raise ValueError("Title exceeds 120 characters")
        self.title = title

    def set_body(self, body: str) -> None:
        self.body = body

    def format_as_html(self) -> str:
        tag_markup = "".join(f"<span class='tag'>{t}</span>" for t in self.tags)
        return f"<article><h1>{self.title}</h1>{tag_markup}<div>{self.body}</div></article>"

    def format_as_markdown(self) -> str:
        tag_line = " ".join(f"#{t}" for t in self.tags)
        return f"# {self.title}\n\n{tag_line}\n\n{self.body}"

    def save_to_db(self, conn) -> None:
        conn.execute(
            "REPLACE INTO posts (author, title, body) VALUES (?, ?, ?)",
            (self.author_id, self.title, self.body),
        )

    def email_to_subscribers(self, subscriber_emails: list[str]) -> None:
        for address in subscriber_emails:
            print(f"POST /sendgrid/v3/mail/send to {address}: {self.title}")
```

**Questions:**

1. How many responsibilities does this class hold? Name each one and identify the stakeholder role it belongs to.
2. Which requirement changes would force an edit to this class despite having nothing to do with the data or rules of a blog post?

---

### Solution B.1

**Four responsibilities, belonging to four stakeholder roles.**

| Responsibility | Methods | Stakeholder role requesting change | Example change |
|---|---|---|---|
| Post state and validation rules | `__init__`, `set_title`, `set_body` | Editorial team | Raise the title limit to 200 characters |
| Presentation | `format_as_html`, `format_as_markdown` | Front-end or design team | Wrap tags in a different element for a redesign |
| Persistence | `save_to_db` | Database or platform team | Split the `posts` table and change the write |
| Subscriber notification | `email_to_subscribers` | Growth or marketing team | Migrate from SendGrid to Amazon SES |

**Answer to question 2.** A redesign of the article markup, a change to the storage schema, and a change of email vendor are three requirement changes that arrive from three different teams and none of which concerns what a blog post is or what makes one valid. Each of them nevertheless forces an edit to `BlogPost`. The direct operational consequence is that these four teams contend for the same file, so their changes must be sequenced, reviewed together, and released together, and a defect introduced by any one of them is attributed to a class the other three also depend on.

A useful supplementary observation concerns the naming test. The class is called `BlogPost`, which correctly describes only the first responsibility. A name that described the class as it currently stands would be something on the order of `BlogPostWithRenderingAndStorageAndNotification`, and the awkwardness of that name is a reliable signal. When an honest name for a class requires a conjunction, the class holds more than one responsibility.

---

### Problem B.2 (Level 2)

The following class belongs to a human resources reporting tool. It works correctly. Diagnose its structural defects and produce a corrected version that preserves the existing behaviour.

```python
class EmployeeReport:
    def __init__(self, employees):
        self.employees = employees

    def get_top_performers(self):
        return [e for e in self.employees if e.performance_score > 8.0]

    def format_as_table(self):
        header = f"{'Name':<20} {'Score':<10} {'Department':<15}\n"
        rows = "\n".join(
            f"{e.name:<20} {e.performance_score:<10} {e.department:<15}"
            for e in self.employees
        )
        return header + rows

    def save_to_csv(self, filepath):
        import csv
        with open(filepath, "w") as f:
            writer = csv.DictWriter(f, fieldnames=["name", "score", "department"])
            writer.writeheader()
            for e in self.employees:
                writer.writerow({
                    "name": e.name,
                    "score": e.performance_score,
                    "department": e.department,
                })

    def send_to_hr(self, email_address):
        print(f"Emailing report to {email_address}")
```

**Required:**

1. Enumerate the responsibilities.
2. Refactor into separate classes, each with one reason to change.
3. State what each split makes possible that was not possible before.

---

### Solution B.2

**Diagnosis.**

The class holds three responsibilities, and the fourth method reveals a dependency defect that becomes visible only after the split.

The first responsibility is analysis: deciding which employees qualify as top performers. The threshold of 8.0 is a business rule owned by the human resources policy team, and it is hard-coded into a method that cannot be reused with a different threshold.

The second responsibility is presentation: converting employee records into fixed-width text. Column widths, column order, and the choice of which fields appear are owned by whoever consumes the report.

The third responsibility is transport and serialisation: writing CSV to a filesystem path and sending mail. These are infrastructure concerns owned by the platform team, and they carry the additional problem that `save_to_csv` reaches directly for the filesystem and `send_to_hr` reaches directly for a mail mechanism, so neither can be exercised without side effects.

There is a fourth defect that is a consequence of the first three. `format_as_table` ignores the result of `get_top_performers` and formats `self.employees` in its entirety, while the class name promises a report about top performers. When several responsibilities share mutable state, inconsistencies of this kind become easy to introduce and hard to notice, which is one of the concrete costs of the violation rather than an accident of this particular example.

**Corrected version.**

```python
from __future__ import annotations

import csv
from dataclasses import dataclass
from typing import Iterable, Protocol, Sequence


@dataclass(frozen=True)
class Employee:
    name: str
    performance_score: float
    department: str


# Responsibility 1: analysis. Owns the question of who qualifies.
class PerformanceAnalyser:
    def __init__(self, threshold: float = 8.0):
        self._threshold = threshold

    def top_performers(self, employees: Iterable[Employee]) -> list[Employee]:
        return [e for e in employees if e.performance_score > self._threshold]


# Responsibility 2: presentation. Owns layout only, and returns text
# rather than writing it anywhere.
class TableFormatter:
    COLUMNS = ("Name", "Score", "Department")

    def render(self, employees: Sequence[Employee]) -> str:
        header = f"{self.COLUMNS[0]:<20} {self.COLUMNS[1]:<10} {self.COLUMNS[2]:<15}"
        rows = [
            f"{e.name:<20} {e.performance_score:<10} {e.department:<15}"
            for e in employees
        ]
        return "\n".join([header, *rows])


# Responsibility 3: serialisation to a tabular file format.
class CsvExporter:
    FIELDS = ("name", "score", "department")

    def export(self, employees: Sequence[Employee], filepath: str) -> None:
        with open(filepath, "w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=self.FIELDS)
            writer.writeheader()
            for e in employees:
                writer.writerow({
                    "name": e.name,
                    "score": e.performance_score,
                    "department": e.department,
                })


# Responsibility 4: delivery, expressed as an abstraction so that the
# coordinator does not depend on any particular mail vendor.
class ReportDelivery(Protocol):
    def deliver(self, recipient: str, subject: str, body: str) -> None: ...


class ConsoleDelivery:
    def __init__(self) -> None:
        self.delivered: list[tuple[str, str, str]] = []

    def deliver(self, recipient: str, subject: str, body: str) -> None:
        self.delivered.append((recipient, subject, body))
        print(f"To {recipient}: {subject}")


# Coordination. Owns the sequence of steps, none of the steps themselves.
class TopPerformerReport:
    def __init__(
        self,
        analyser: PerformanceAnalyser,
        formatter: TableFormatter,
        delivery: ReportDelivery,
    ):
        self._analyser = analyser
        self._formatter = formatter
        self._delivery = delivery

    def send(self, employees: Sequence[Employee], recipient: str) -> str:
        qualifying = self._analyser.top_performers(employees)
        body = self._formatter.render(qualifying)
        self._delivery.deliver(recipient, "Top performers", body)
        return body
```

**What each split makes possible.**

| Change request | Before the split | After the split |
|---|---|---|
| Human resources raises the threshold to 8.5 for one department | Edit the class that also formats and exports | Construct `PerformanceAnalyser(8.5)` with no code change at all |
| Report is required in JSON | Add a fourth method to the same class | Add a `JsonFormatter` class, edit nothing existing |
| Migrate from console printing to a transactional mail API | Edit the reporting class | Add a class implementing `ReportDelivery`, select it at the composition root |
| Verify the qualification rule in a unit test | Requires an object graph that can write files and send mail | Instantiate `PerformanceAnalyser` alone and assert on a returned list |

The last row is the most important, because it is the one that changes daily working conditions. The qualification rule is the part of this code most likely to contain a business defect, and after the split it is testable in three lines with no filesystem and no mail transport.

Two points of technique deserve comment. First, `TableFormatter.render` returns a string and writes nothing, which is what allows the same output to be delivered by mail, written to a file, or asserted in a test. A formatter that performs its own output has silently absorbed a second responsibility. Second, `ReportDelivery` is declared as a `Protocol` rather than an abstract base class, which means `ConsoleDelivery` satisfies it structurally without inheriting from it. This matters when the implementer is a third-party object that cannot be made to inherit from an abstraction defined in this codebase.

---

### Problem B.3 (Level 3)

**Scenario.** A restaurant management system must support the following order lifecycle.

A waiter creates an order against a table and adds items to it. Items may be added or removed while the order is open. When the waiter places the order, the kitchen must be notified of the items to prepare. The kitchen marks items ready, and when all items are ready the order is served. When the order is closed, the billing system must compute the payable amount including a service charge and applicable tax, an invoice must be produced in a printable form, and the customer must receive a receipt by either SMS or email according to the contact details held for the table's guest.

Orders may be cancelled while open, in which case no notification, no bill, and no receipt are produced. Cancellation after placement requires a manager override and must be recorded for audit.

**Required:**

1. Identify the responsibilities present in this scenario and assign each to a class.
2. Present the design as a table of classes, responsibilities, and key method signatures.
3. Write the code for the coordinating class and the signatures of the collaborators. Full implementations of the collaborators are not required.
4. Write a short justification of the design decisions, stating in each case which future change the decision protects against.

---

### Solution B.3

**Step 1: separating the responsibilities in the requirement text.**

The requirement contains six distinct concerns, and identifying them from prose is the skill this problem exercises. A reliable technique is to underline each noun phrase that names an artefact or a rule, then group the verbs that act on it.

| Concern | Evidence in the requirement | Why it is separate |
|---|---|---|
| Order state and its legal transitions | Created, items added or removed while open, placed, served, closed, cancelled | Owned by operations. Changes when the workflow changes, for example if a "held" state is introduced. |
| Kitchen notification | Kitchen must be notified of items to prepare | Owned by kitchen operations. Changes when the kitchen display system changes. |
| Bill computation | Service charge and applicable tax | Owned by finance and by tax regulation. Changes when a tax rate changes, which is frequent and externally imposed. |
| Invoice rendering | Printable form | Owned by whoever specifies the printed document. Changes independently of the arithmetic. |
| Receipt dispatch | SMS or email according to contact details | Owned by the messaging platform. Changes when a vendor changes. |
| Audit recording | Cancellation after placement must be recorded | Owned by compliance. Changes when retention or record format requirements change. |

**Step 2: the design.**

| Class | Responsibility | Key methods |
|---|---|---|
| `OrderItem` | Immutable record of one ordered line | Data only: `menu_item_id`, `name`, `unit_price`, `quantity` |
| `Order` | Holds order state and enforces legal transitions | `add_item`, `remove_item`, `place`, `mark_item_ready`, `serve`, `close`, `cancel`, `items`, `status` |
| `OrderStatus` | Enumeration of the lifecycle states | `OPEN`, `PLACED`, `SERVED`, `CLOSED`, `CANCELLED` |
| `KitchenNotifier` (abstraction) | Delivers a prepared-items instruction to the kitchen | `notify(order) -> None` |
| `BillCalculator` | Computes the payable amount from an order | `calculate(order) -> Bill` |
| `Bill` | Immutable result of a calculation | Data only: `subtotal`, `service_charge`, `tax`, `total` |
| `InvoiceRenderer` (abstraction) | Converts an order and a bill into a document | `render(order, bill) -> str` |
| `ReceiptSender` (abstraction) | Delivers a receipt to a contact address | `send(contact, document) -> None` |
| `AuditLog` (abstraction) | Records events that compliance requires | `record(event_type, payload) -> None` |
| `OrderService` | Coordinates the collaborators at the correct lifecycle moments | `place_order`, `close_order`, `cancel_order` |

**Step 3: the code.**

```python
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Protocol


class OrderStatus(Enum):
    OPEN = "open"
    PLACED = "placed"
    SERVED = "served"
    CLOSED = "closed"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class OrderItem:
    menu_item_id: str
    name: str
    unit_price: float
    quantity: int

    @property
    def line_total(self) -> float:
        return self.unit_price * self.quantity


@dataclass(frozen=True)
class Bill:
    subtotal: float
    service_charge: float
    tax: float

    @property
    def total(self) -> float:
        return self.subtotal + self.service_charge + self.tax


class IllegalTransition(Exception):
    """Raised when a lifecycle operation is invalid for the current status."""


class Order:
    """Holds order state and guards its own invariants. Knows nothing about
    kitchens, money, documents, messaging, or audit."""

    def __init__(self, order_id: str, table_no: int):
        self.order_id = order_id
        self.table_no = table_no
        self._items: list[OrderItem] = []
        self._ready: set[str] = set()
        self._status = OrderStatus.OPEN

    @property
    def status(self) -> OrderStatus:
        return self._status

    @property
    def items(self) -> tuple[OrderItem, ...]:
        return tuple(self._items)

    def add_item(self, item: OrderItem) -> None:
        self._require(OrderStatus.OPEN, "add items")
        self._items.append(item)

    def remove_item(self, menu_item_id: str) -> None:
        self._require(OrderStatus.OPEN, "remove items")
        self._items = [i for i in self._items if i.menu_item_id != menu_item_id]

    def place(self) -> None:
        self._require(OrderStatus.OPEN, "place")
        if not self._items:
            raise IllegalTransition("Cannot place an order with no items")
        self._status = OrderStatus.PLACED

    def mark_item_ready(self, menu_item_id: str) -> None:
        self._require(OrderStatus.PLACED, "mark items ready")
        self._ready.add(menu_item_id)

    def all_items_ready(self) -> bool:
        return {i.menu_item_id for i in self._items} <= self._ready

    def serve(self) -> None:
        self._require(OrderStatus.PLACED, "serve")
        if not self.all_items_ready():
            raise IllegalTransition("Cannot serve before all items are ready")
        self._status = OrderStatus.SERVED

    def close(self) -> None:
        self._require(OrderStatus.SERVED, "close")
        self._status = OrderStatus.CLOSED

    def cancel(self) -> None:
        if self._status in (OrderStatus.CLOSED, OrderStatus.CANCELLED):
            raise IllegalTransition(f"Cannot cancel an order that is {self._status.value}")
        self._status = OrderStatus.CANCELLED

    def _require(self, expected: OrderStatus, action: str) -> None:
        if self._status is not expected:
            raise IllegalTransition(
                f"Cannot {action} while order is {self._status.value}"
            )


# ---------- Collaborator contracts, signatures only ----------

class KitchenNotifier(Protocol):
    def notify(self, order: Order) -> None: ...


class BillCalculator(Protocol):
    def calculate(self, order: Order) -> Bill: ...


class InvoiceRenderer(Protocol):
    def render(self, order: Order, bill: Bill) -> str: ...


class ReceiptSender(Protocol):
    def send(self, contact: str, document: str) -> None: ...


class AuditLog(Protocol):
    def record(self, event_type: str, payload: dict) -> None: ...


# ---------- Coordination ----------

class OrderService:
    """Owns the sequence in which collaborators are invoked. Contains no
    kitchen logic, no arithmetic, no formatting, and no transport."""

    def __init__(
        self,
        kitchen: KitchenNotifier,
        calculator: BillCalculator,
        renderer: InvoiceRenderer,
        receipts: ReceiptSender,
        audit: AuditLog,
    ):
        self._kitchen = kitchen
        self._calculator = calculator
        self._renderer = renderer
        self._receipts = receipts
        self._audit = audit

    def place_order(self, order: Order) -> None:
        order.place()
        self._kitchen.notify(order)

    def close_order(self, order: Order, guest_contact: str) -> str:
        order.close()
        bill = self._calculator.calculate(order)
        invoice = self._renderer.render(order, bill)
        self._receipts.send(guest_contact, invoice)
        return invoice

    def cancel_order(self, order: Order, manager_id: str | None = None) -> None:
        requires_override = order.status is not OrderStatus.OPEN
        if requires_override and manager_id is None:
            raise PermissionError("Manager override required after placement")

        previous = order.status
        order.cancel()

        if requires_override:
            self._audit.record(
                "order_cancelled_after_placement",
                {
                    "order_id": order.order_id,
                    "previous_status": previous.value,
                    "manager_id": manager_id,
                },
            )
```

**Step 4: design decisions and the changes they protect against.**

*The lifecycle rules live in `Order`, not in `OrderService`.* The condition that an order cannot be served before all its items are ready is an invariant of an order, and placing it in the object that owns the state means no code path can bypass it. Had the check lived in `OrderService.serve_order`, a second caller added later, for example a bulk-close routine at end of shift, would be able to reach an inconsistent state. This decision protects against invariant violations introduced by new callers.

*`OrderService` contains sequencing and nothing else.* Every method in it reads as a short list of steps delegated elsewhere. This is the correct shape for a coordinator, and it provides a test that can be applied to any coordinator: if arithmetic, string formatting, or `if` statements about business values appear in it, a responsibility has leaked in.

*Bill calculation is separated from invoice rendering.* These are frequently combined because both concern the printed bill, and the separation is the single decision in this design most likely to be omitted. They change for unrelated reasons. A change in the tax rate is imposed externally, must be applied on a specific date, and must be verifiable by finance. A change in the printed layout comes from operations and has no financial consequence. Keeping them separate means the tax change is a two-line edit to a class whose entire content is arithmetic and is therefore straightforward to test exhaustively.

*Receipt dispatch is one abstraction, not two.* The requirement mentions SMS and email, which suggests two classes. The correct reading is that both are instances of the same role, delivering a document to a contact address, so both implement `ReceiptSender`. The decision of which to use for a given guest is a selection among implementations and belongs either at the composition root or in a small dispatching implementation of the same interface. This protects against the arrival of a third channel, which then requires no change to `OrderService`.

*Audit recording is invoked by the coordinator rather than by `Order`.* Auditing is an obligation of the enclosing process, not a property of an order. If `Order.cancel` wrote audit records, then constructing an order in a test would require an audit sink, and the domain object would depend on infrastructure.

*Cancellation before placement produces no bill, no receipt, and no audit record.* This is visible in the code as the absence of calls rather than as a conditional, because the requirement was read carefully: the manager override and the audit record are both consequences of the same condition, that the order has already been placed. Deriving `requires_override` once and using it twice keeps the two consequences in agreement, which is preferable to writing two independent status checks that a later edit could allow to diverge.

---

### Section B review

| Problem | Domain | Level | Central lesson |
|---|---|---|---|
| B.1 | Content platform | 1 | Count stakeholder roles, not lines. Four short methods can be four responsibilities. |
| B.2 | Human resources | 2 | Formatters return values rather than performing output, which is what makes them reusable and testable. |
| B.3 | Restaurant | 3 | Invariants belong to the object holding the state. Coordinators sequence and delegate only. |

---

## 5. Section C: Open/Closed Principle

The principle under examination states that a module should be open for extension and closed for modification. New behaviour should be addable by writing new code rather than by editing code that already works and is already tested.

The practical significance is a matter of risk rather than of elegance. Code that has been in production for a year has been validated by that year of operation. Editing it discards part of that validation, because the tests that pass now were written against the previous behaviour. Adding a new class alongside it discards none of it. The Open/Closed Principle is therefore best understood as a technique for confining the blast radius of a change.

---

### Problem C.1 (Level 1)

A payments service contains the following method.

```python
class PaymentProcessor:
    def process(self, payment) -> dict:
        if payment.method == "card":
            self._validate_card(payment.card_number, payment.cvv)
            fee = payment.amount * 0.02
            return {"status": "captured", "fee": fee, "gateway": "razorpay"}
        elif payment.method == "upi":
            if not payment.vpa.endswith(("@okhdfcbank", "@ybl", "@paytm")):
                return {"status": "rejected", "reason": "unsupported VPA"}
            return {"status": "captured", "fee": 0.0, "gateway": "npci"}
        elif payment.method == "netbanking":
            fee = 15.0
            return {"status": "pending", "fee": fee, "gateway": payment.bank_code}
        elif payment.method == "wallet":
            if payment.wallet_balance < payment.amount:
                return {"status": "rejected", "reason": "insufficient balance"}
            return {"status": "captured", "fee": 0.0, "gateway": "internal"}
        else:
            raise ValueError(f"Unknown payment method: {payment.method}")

    def _validate_card(self, number: str, cvv: str) -> None:
        if len(number) != 16 or len(cvv) != 3:
            raise ValueError("Invalid card")
```

**Questions:**

1. Which principle is violated?
2. Describe precisely what must happen when a cryptocurrency method is added, and state the risk that arises.
3. What is the direction of the correction?

---

### Solution C.1

**Answer to question 1.** The Open/Closed Principle. `process` must be modified for every new payment method, so the class is not closed against the change that the business is most certain to request.

**Answer to question 2.** Adding a cryptocurrency method requires inserting a branch into `process`, which means editing a method that currently handles four working payment flows. Three risks follow, and they should be stated in this order of severity.

The first is regression risk. Card, UPI, netbanking, and wallet payments all flow through the modified method, so a mistake made while adding the new branch can break a payment method that is currently taking live money. The change cannot be reviewed in isolation, because the reviewer must reason about the whole method.

The second is test invalidation. The existing tests for `process` were written against a method that no longer exists in the same form. They may still pass, but they no longer constitute complete coverage of the method as modified, and determining what additional coverage is required is manual work that grows with each branch.

The third is deployment coupling. The cryptocurrency feature cannot be released independently of the existing payment methods, because it ships inside the same class. If the new method must be disabled after release, the rollback affects code paths that were working.

**Answer to question 3.** Each payment method becomes a class implementing a common abstraction with a single method that accepts a payment and returns a result. `PaymentProcessor` holds a mapping from method identifier to handler and delegates to the selected handler. The conditional chain disappears entirely, because the mapping lookup performs the selection that the chain was performing. Adding cryptocurrency then consists of writing one new class and adding one entry to the registry, and the existing four classes are neither edited nor recompiled nor re-reviewed.

Two further observations are worth recording. First, the four branches contain markedly different logic: card validation, VPA suffix checking, a flat fee, and a balance comparison. These are four independent policies, which is why the method also violates the Single Responsibility Principle. The two violations have the same correction, which is common. Second, the final `else` clause that raises `ValueError` is the only part of the chain that survives the refactor, appearing as the failure branch of the registry lookup.

---

### Problem C.2 (Level 2)

An observability library contains the following class. Refactor it so that adding an XML format or an HTML format requires no modification to any existing class.

```python
class LogFormatter:
    def format(self, log_entry, output_format: str) -> str:
        if output_format == "plain":
            return f"[{log_entry.level}] {log_entry.timestamp}: {log_entry.message}"
        elif output_format == "json":
            import json
            return json.dumps({
                "level": log_entry.level,
                "timestamp": str(log_entry.timestamp),
                "message": log_entry.message,
            })
        elif output_format == "csv":
            return f"{log_entry.level},{log_entry.timestamp},{log_entry.message}"
        else:
            raise ValueError(f"Unknown format: {output_format}")
```

**Required:**

1. State the defect and the specific cost it imposes.
2. Produce the refactored design.
3. Show how a caller selects a format, and show what the addition of an XML formatter looks like.
4. Explain why the `output_format` string parameter disappears from the formatting call.

---

### Solution C.2

**Diagnosis.**

The class conflates two decisions that occur at different times. The decision of which format to use is made once, at configuration time, by whoever operates the application. The decision of how to render a single entry is made on every log line. By taking `output_format` as a parameter of `format`, the class re-evaluates a configuration-time decision on every invocation, and it must contain every possible answer to that decision in order to do so.

The cost is that the class accumulates one branch per format and becomes a change magnet for a concern that is not shared between formats. The CSV rendering and the JSON rendering have nothing in common beyond their input type, so a defect fixed in one has no relationship to the other, yet both are edited in the same file and shipped together. A secondary cost is that the class cannot be extended by a consumer of the library at all. A user of this logging package who requires a proprietary format has no option but to modify the package source, which is the clearest possible demonstration that the class is not closed for modification.

**Refactored design.**

```python
from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from xml.sax.saxutils import escape


@dataclass(frozen=True)
class LogEntry:
    level: str
    timestamp: datetime
    message: str


class LogFormatter(ABC):
    """The abstraction. One responsibility: render a single entry as text."""

    @abstractmethod
    def format(self, entry: LogEntry) -> str: ...


class PlainFormatter(LogFormatter):
    def format(self, entry: LogEntry) -> str:
        return f"[{entry.level}] {entry.timestamp}: {entry.message}"


class JsonFormatter(LogFormatter):
    def format(self, entry: LogEntry) -> str:
        return json.dumps({
            "level": entry.level,
            "timestamp": entry.timestamp.isoformat(),
            "message": entry.message,
        })


class CsvFormatter(LogFormatter):
    def format(self, entry: LogEntry) -> str:
        message = entry.message.replace('"', '""')
        return f'{entry.level},{entry.timestamp.isoformat()},"{message}"'
```

The consumer of a formatter holds the abstraction and never learns which implementation it received.

```python
class Logger:
    def __init__(self, formatter: LogFormatter, sink):
        self._formatter = formatter
        self._sink = sink

    def log(self, level: str, message: str) -> None:
        entry = LogEntry(level=level, timestamp=datetime.now(), message=message)
        self._sink.write(self._formatter.format(entry) + "\n")
```

Adding a format is now an addition of a file, with no edit anywhere else.

```python
class XmlFormatter(LogFormatter):
    def format(self, entry: LogEntry) -> str:
        return (
            "<log>"
            f"<level>{escape(entry.level)}</level>"
            f"<timestamp>{entry.timestamp.isoformat()}</timestamp>"
            f"<message>{escape(entry.message)}</message>"
            "</log>"
        )
```

Where configuration supplies a format as a string, the mapping from string to implementation belongs in one place at the edge of the system rather than inside the formatting call path.

```python
_FORMATTERS: dict[str, type[LogFormatter]] = {
    "plain": PlainFormatter,
    "json": JsonFormatter,
    "csv": CsvFormatter,
    "xml": XmlFormatter,
}


def formatter_from_config(name: str) -> LogFormatter:
    try:
        return _FORMATTERS[name]()
    except KeyError:
        raise ValueError(f"Unknown log format: {name}") from None
```

**Answer to question 4.** The `output_format` parameter disappears because the selection has been moved from call time to construction time, where it belongs. A `Logger` is constructed once with a `JsonFormatter` and thereafter produces JSON; there is no per-call decision to make. This relocation is the substance of the refactor, and the elimination of the conditional chain is its consequence rather than its goal. A refactor that kept the parameter and merely replaced the chain with a dictionary lookup inside `format` would remove the branches without removing the coupling, since the class would still need to know every available format.

Two points of technique appear in the code above and are worth noting because they are frequently missed. The registry maps names to classes rather than to instances, so a formatter that holds per-logger state remains safe to use. The `CsvFormatter` quotes and escapes the message field, and the `XmlFormatter` escapes its text nodes; these correctness details were absent from the original and become straightforward to add once each format occupies its own class, which is a practical benefit of the separation beyond extensibility.

---

### Problem C.3 (Level 3)

**Scenario.** An e-commerce platform applies promotions to orders at checkout. Three promotion types exist today.

A flat discount reduces the order total by a fixed amount, for example 200 rupees off. A percentage discount reduces the total by a proportion, for example 10 percent, and is subject to a maximum discount cap. A buy-one-get-one promotion applies to a specified product and gives 50 percent off the second and subsequent qualifying units.

The marketing team introduces new promotion types every quarter and has already asked about free shipping above a threshold, a first-order discount, and a bundle price for a fixed set of products. Promotions may be combined on a single order, in which case they apply in a defined sequence, and the platform must be able to display a line-by-line breakdown of which promotion contributed which reduction.

**Required:**

1. Design a promotions system that is open to new promotion types without modification of the pricing engine.
2. Implement the abstraction, the three existing promotion types, and the pricing engine.
3. Support the line-by-line breakdown requirement.
4. Demonstrate the addition of a free-shipping promotion, and state precisely which existing files are edited.
5. Write the design decisions, including the reason for the chosen return type of the promotion method.

---

### Solution C.3

**Step 1: locating the axis of variation.**

The requirement contains one axis that varies without limit, which is the set of promotion types, and one axis that is stable, which is the process of applying a list of promotions to an order and reporting the result. The Open/Closed Principle is applied by expressing the varying axis as implementations of an abstraction and the stable axis as a single class that depends only on that abstraction.

The breakdown requirement determines the shape of the abstraction and is the part of this problem most often designed incorrectly. If a promotion returns a number, the engine can compute a total but cannot report which promotion produced which reduction, and the natural repair is for the engine to inspect the promotion type in order to label the line, which reintroduces exactly the conditional chain that the design exists to eliminate. The abstraction must therefore return a value that carries its own description.

**Step 2 and 3: implementation.**

```python
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Sequence


@dataclass(frozen=True)
class OrderLine:
    product_id: str
    unit_price: float
    quantity: int

    @property
    def line_total(self) -> float:
        return self.unit_price * self.quantity


@dataclass(frozen=True)
class Order:
    order_id: str
    customer_id: str
    lines: tuple[OrderLine, ...]
    shipping_cost: float
    is_first_order: bool = False

    @property
    def item_subtotal(self) -> float:
        return sum(line.line_total for line in self.lines)


@dataclass(frozen=True)
class Discount:
    """The result of one promotion. Carries its own label so that the engine
    never needs to inspect the promotion type to describe the reduction."""

    label: str
    amount: float
    applies_to: str = "items"   # "items" or "shipping"

    @staticmethod
    def none(label: str) -> "Discount":
        return Discount(label=label, amount=0.0)

    @property
    def is_zero(self) -> bool:
        return self.amount <= 0.0


class Promotion(ABC):
    """The abstraction. A promotion decides whether it applies to an order and
    how large a reduction it produces. It never mutates the order and never
    knows about other promotions."""

    @property
    @abstractmethod
    def code(self) -> str: ...

    @abstractmethod
    def apply(self, order: Order, running_total: float) -> Discount: ...


class FlatDiscount(Promotion):
    def __init__(self, amount: float, minimum_order_value: float = 0.0):
        self._amount = amount
        self._minimum = minimum_order_value

    @property
    def code(self) -> str:
        return f"FLAT{int(self._amount)}"

    def apply(self, order: Order, running_total: float) -> Discount:
        if running_total < self._minimum:
            return Discount.none(self.code)
        return Discount(self.code, min(self._amount, running_total))


class PercentageDiscount(Promotion):
    def __init__(self, percent: float, maximum_discount: float | None = None):
        self._percent = percent
        self._cap = maximum_discount

    @property
    def code(self) -> str:
        return f"PCT{int(self._percent)}"

    def apply(self, order: Order, running_total: float) -> Discount:
        raw = running_total * (self._percent / 100.0)
        amount = min(raw, self._cap) if self._cap is not None else raw
        return Discount(self.code, amount)


class BuyOneGetHalfOff(Promotion):
    def __init__(self, product_id: str):
        self._product_id = product_id

    @property
    def code(self) -> str:
        return f"BOGO50:{self._product_id}"

    def apply(self, order: Order, running_total: float) -> Discount:
        qualifying = [l for l in order.lines if l.product_id == self._product_id]
        reduction = sum(
            line.unit_price * 0.5 * (line.quantity - 1)
            for line in qualifying
            if line.quantity > 1
        )
        return Discount(self.code, reduction)
```

The engine holds a sequence of promotions and knows nothing about any of them beyond the abstraction.

```python
@dataclass(frozen=True)
class PricedOrder:
    item_subtotal: float
    shipping_cost: float
    breakdown: tuple[Discount, ...]

    @property
    def total_discount(self) -> float:
        return sum(d.amount for d in self.breakdown)

    @property
    def payable(self) -> float:
        return round(
            self.item_subtotal + self.shipping_cost - self.total_discount, 2
        )


class PricingEngine:
    """Stable. Applies promotions in the configured sequence and reports the
    result. Contains no promotion-specific logic and no conditional chain."""

    def __init__(self, promotions: Sequence[Promotion]):
        self._promotions = tuple(promotions)

    def price(self, order: Order) -> PricedOrder:
        running_total = order.item_subtotal
        shipping_remaining = order.shipping_cost
        applied: list[Discount] = []

        for promotion in self._promotions:
            discount = promotion.apply(order, running_total)
            if discount.is_zero:
                continue
            if discount.applies_to == "shipping":
                capped = Discount(
                    discount.label, min(discount.amount, shipping_remaining), "shipping"
                )
                shipping_remaining -= capped.amount
                applied.append(capped)
            else:
                capped = Discount(
                    discount.label, min(discount.amount, running_total), "items"
                )
                running_total -= capped.amount
                applied.append(capped)

        return PricedOrder(
            item_subtotal=order.item_subtotal,
            shipping_cost=order.shipping_cost,
            breakdown=tuple(applied),
        )
```

**Step 4: adding a promotion type.**

```python
class FreeShippingAbove(Promotion):
    def __init__(self, threshold: float):
        self._threshold = threshold

    @property
    def code(self) -> str:
        return f"FREESHIP{int(self._threshold)}"

    def apply(self, order: Order, running_total: float) -> Discount:
        if running_total < self._threshold:
            return Discount.none(self.code)
        return Discount(self.code, order.shipping_cost, applies_to="shipping")
```

The files edited in order to introduce free shipping are: one new file containing `FreeShippingAbove`, and the composition root or campaign configuration where the active promotions for a campaign are listed. `PricingEngine`, `FlatDiscount`, `PercentageDiscount`, `BuyOneGetHalfOff`, `Discount`, and `PricedOrder` are all unmodified. No existing test requires revision, and the existing promotions require no re-review.

A worked example of the composition and the resulting breakdown:

```python
order = Order(
    order_id="ORD-9001",
    customer_id="CUST-22",
    lines=(
        OrderLine("BOOK-1", 499.0, 3),
        OrderLine("MUG-7", 250.0, 1),
    ),
    shipping_cost=60.0,
    is_first_order=True,
)

engine = PricingEngine([
    BuyOneGetHalfOff("BOOK-1"),
    PercentageDiscount(percent=10, maximum_discount=150.0),
    FlatDiscount(amount=200.0, minimum_order_value=1000.0),
    FreeShippingAbove(threshold=750.0),
])

priced = engine.price(order)
for line in priced.breakdown:
    print(f"{line.label:<20} -{line.amount:>8.2f}  ({line.applies_to})")
print(f"{'Payable':<20}  {priced.payable:>8.2f}")
```

**Step 5: design decisions.**

*The promotion method returns a `Discount` rather than a float or a modified order.* Three candidate return types were available and the choice determines whether the design holds. Returning a float satisfies the arithmetic but destroys the breakdown, and it forces the engine to label lines by inspecting types. Returning a modified `Order` gives each promotion the power to alter any part of the order, which makes the effect of a promotion sequence unpredictable and makes each promotion far harder to test. Returning a descriptive value object gives the engine everything it needs to both compute and report while confining each promotion to producing a single number and a label. This decision protects against the breakdown requirement being satisfied by a type check, which is the failure mode this design exists to prevent.

*Promotions receive the running total as an explicit parameter.* The requirement states that promotions apply in a defined sequence, which means a percentage promotion applied after a flat discount must compute its percentage on the reduced amount. Passing `running_total` makes the ordering semantics explicit at the call site and keeps promotions free of mutable state. The alternative, in which each promotion reads a mutable amount from the order, produces promotions whose results depend on invocation history in ways that are not visible in their signatures.

*Capping is enforced by the engine, not trusted to each promotion.* A promotion that returns a reduction larger than the amount remaining would drive the payable total negative. Because promotions are written by many people over many quarters, the engine treats their output as untrusted and clamps it. This is a deliberate placement of a system-wide invariant in the one class that cannot be bypassed, and it is the same reasoning applied to `Order` in Problem B.3.

*A promotion decides for itself whether it applies.* The zero-valued `Discount` returned when a condition is unmet allows eligibility rules to live inside the promotion that owns them. The alternative of a separate `is_applicable` predicate on the abstraction requires the engine to call two methods in the correct order and permits an inconsistent implementation in which the predicate and the calculation disagree.

*Shipping is modelled as a separate target rather than folded into the item total.* Free shipping is already on the roadmap, and a promotion reducing shipping must not be permitted to reduce the item subtotal. Introducing the `applies_to` field costs one attribute and one branch in the engine, and it prevents an entire class of pricing defect. This is a case where a small anticipatory generalisation is justified, because the requirement explicitly names free shipping as forthcoming rather than merely conceivable.

---

### Section C review

| Problem | Domain | Level | Central lesson |
|---|---|---|---|
| C.1 | Payments | 1 | The cost of an Open/Closed defect is regression risk in working code, not inelegance |
| C.2 | Logging | 2 | Move the selection from call time to construction time. Removing the branches is a consequence. |
| C.3 | E-commerce promotions | 3 | The return type of the abstraction determines whether the design survives its reporting requirements |

---

## 6. Section D: Liskov Substitution Principle

The principle under examination states that if `S` is a subtype of `T`, then objects of type `T` may be replaced with objects of type `S` without altering the correctness of the program. Barbara Liskov's original formulation concerns the properties provable about supertype objects remaining provable about subtype objects.

The operational content of the principle is a set of rules governing what an override is permitted to do. An override may accept the same inputs or a wider range of inputs, but it may not narrow the accepted range, which is stated as the rule that preconditions may not be strengthened in a subtype. An override may guarantee the same outcome or a stronger outcome, but it may not guarantee less, which is stated as the rule that postconditions may not be weakened. An override may raise the exception types declared by the supertype or their subtypes, but it may not introduce new categories of failure. An override may not invalidate any invariant the supertype maintains.

Violations are diagnosed by reading the override against the base contract rather than by reading the override alone. This is what makes Liskov violations harder to spot than the other four: the defect is a mismatch between two locations, and neither location is wrong in isolation.

---

### Problem D.1 (Level 1)

```python
class Rectangle:
    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    def set_width(self, width: float) -> None:
        self._width = width

    def set_height(self, height: float) -> None:
        self._height = height

    def area(self) -> float:
        return self._width * self._height


class Square(Rectangle):
    def __init__(self, side: float):
        super().__init__(side, side)

    def set_width(self, width: float) -> None:
        self._width = width
        self._height = width

    def set_height(self, height: float) -> None:
        self._width = height
        self._height = height


def resize_and_verify(shape: Rectangle) -> None:
    shape.set_width(5)
    shape.set_height(10)
    assert shape.area() == 50, f"Expected 50, got {shape.area()}"
```

**Questions:**

1. What happens when `resize_and_verify` receives a `Square`?
2. Which rule of the principle is broken, stated precisely?
3. Why is adding an `isinstance` check inside `resize_and_verify` not a correction?

---

### Solution D.1

**Answer to question 1.** Setting the width to 5 also sets the height to 5. Setting the height to 10 also sets the width to 10. The area is 100 rather than 50, and the assertion fails. The function is correct with respect to the contract it was written against, and it fails only because it was handed an object whose declared type promises behaviour the object does not exhibit.

**Answer to question 2.** The rule broken is that invariants of the supertype must be preserved. `Rectangle` maintains the invariant that width and height are independent, which is observable through its public interface: after `set_width(w)` followed by `set_height(h)`, the area is `w * h` for any `w` and `h`. `Square` cannot preserve this invariant, because its own invariant requires the two dimensions to be equal. Stated more sharply, `Square` weakens the postcondition of `set_width` from "the width is `w` and the height is unchanged" to "the width is `w`", and every caller relying on the discarded clause is broken.

**Answer to question 3.** A type check inside the consumer is not a correction for three reasons, and the third is the decisive one.

It does not remove the defect; it documents it at every call site. The next function written against `Rectangle` will need the same guard, and the guard will be omitted somewhere.

It violates the Open/Closed Principle in the consumer. Each new shape subtype requires a new branch in every guard, so the number of edits grows as the product of subtypes and consumers.

It contradicts the purpose of subtype polymorphism. The reason to declare a parameter as `Rectangle` is to avoid knowing which concrete shape arrived. If the function must know, the type declaration is not providing the abstraction it appears to provide, and the inheritance relationship is providing no benefit while imposing a cost.

The correction is to recognise that the inheritance relationship is unsound as modelled. A square is a rectangle in geometry, where shapes are immutable values, and is not a rectangle in this design, where shapes have independently mutable dimensions. Two sound alternatives exist. Immutable shapes with a read-only `area` can be related by inheritance without difficulty, because there are no setters whose postconditions can be weakened. Alternatively, `Square` and `Rectangle` can be siblings implementing a common `Shape` abstraction that declares `area` and no dimension setters. The general lesson is that whether inheritance is valid depends on the mutability and the contract of the base, not on the taxonomy of the concepts.

---

### Problem D.2 (Level 2)

A storage library contains the following hierarchy.

```python
class FileStorage:
    def read(self, path: str) -> bytes:
        raise NotImplementedError

    def write(self, path: str, data: bytes) -> None:
        raise NotImplementedError

    def delete(self, path: str) -> None:
        raise NotImplementedError


class LocalFileStorage(FileStorage):
    def __init__(self, root: str):
        self._root = root

    def read(self, path: str) -> bytes:
        with open(f"{self._root}/{path}", "rb") as handle:
            return handle.read()

    def write(self, path: str, data: bytes) -> None:
        with open(f"{self._root}/{path}", "wb") as handle:
            handle.write(data)

    def delete(self, path: str) -> None:
        import os
        os.remove(f"{self._root}/{path}")


class ReadOnlyArchiveStorage(FileStorage):
    def __init__(self, bucket: str):
        self._bucket = bucket

    def read(self, path: str) -> bytes:
        return b"...object bytes from immutable archive..."

    def write(self, path: str, data: bytes) -> None:
        raise PermissionError("Archive storage is immutable")

    def delete(self, path: str) -> None:
        raise PermissionError("Archive storage is immutable")


def archive_and_purge(storage: FileStorage, path: str, destination: str) -> None:
    payload = storage.read(path)
    storage.write(destination, payload)
    storage.delete(path)
```

**Required:**

1. State the violation precisely and identify which caller is broken.
2. Explain why catching `PermissionError` in `archive_and_purge` is not the correction.
3. Redesign the hierarchy so that the defect is unrepresentable, and show the corrected signature of `archive_and_purge`.
4. Identify which additional principle the original code violates.

---

### Solution D.2

**Diagnosis.**

`FileStorage` declares three capabilities, and its contract therefore promises that any instance can read, write, and delete. `ReadOnlyArchiveStorage` is a declared subtype and satisfies the interface syntactically while contradicting it semantically: two of its three methods fail unconditionally with an exception type the base contract never mentions. `archive_and_purge` is written against the base contract, is correct with respect to that contract, and fails at the second statement when handed an archive instance. The failure occurs after the read has succeeded, which means the function fails partway through a multi-step operation, and this is the practical reason the defect is expensive rather than merely inelegant.

**Answer to question 2.** Catching the exception addresses the symptom at one call site and leaves the defect in place. Three specific objections apply.

The handler has no correct action available. If the write fails because the target is immutable, the archiving operation cannot be completed, so the handler can only re-raise a different exception or silently abandon the work. Neither outcome is better than the original failure, and the second is worse.

The knowledge is in the wrong place. The call site learns, by experiment at runtime, a fact that was known statically at construction time, namely that this particular storage cannot be written to. Discovering statically available information through exception handling is a design defect independent of the principle being discussed.

It does not generalise. Every function in the library that writes or deletes requires the same handler, and each is an opportunity to omit it. The compiler and the type checker provide no assistance, because the declared type continues to promise the capability.

**Corrected hierarchy.**

The correction separates the capabilities into distinct abstractions, so that a function requiring write access cannot be handed an object that lacks it.

```python
from abc import ABC, abstractmethod


class ReadableStorage(ABC):
    """Contract: read returns the bytes at path, or raises FileNotFoundError
    if no object exists at that path."""

    @abstractmethod
    def read(self, path: str) -> bytes: ...


class WritableStorage(ReadableStorage):
    """Contract: everything ReadableStorage promises, and in addition write
    stores data at path and delete removes it. Neither refuses on grounds of
    the store being immutable."""

    @abstractmethod
    def write(self, path: str, data: bytes) -> None: ...

    @abstractmethod
    def delete(self, path: str) -> None: ...


class LocalFileStorage(WritableStorage):
    def __init__(self, root: str):
        self._root = root

    def read(self, path: str) -> bytes:
        with open(f"{self._root}/{path}", "rb") as handle:
            return handle.read()

    def write(self, path: str, data: bytes) -> None:
        with open(f"{self._root}/{path}", "wb") as handle:
            handle.write(data)

    def delete(self, path: str) -> None:
        import os
        os.remove(f"{self._root}/{path}")


class ReadOnlyArchiveStorage(ReadableStorage):
    """Implements only what it can honour. There is no write method to break."""

    def __init__(self, bucket: str):
        self._bucket = bucket

    def read(self, path: str) -> bytes:
        return b"...object bytes from immutable archive..."
```

The consumers now declare the narrowest capability they require, which is what converts the runtime failure into a static error.

```python
def archive_and_purge(
    source: ReadableStorage, sink: WritableStorage, path: str, destination: str
) -> None:
    """Reads from any readable store and writes to any writable store. The
    parameter types make it impossible to pass an immutable store as the sink."""
    payload = source.read(path)
    sink.write(destination, payload)


def load_manifest(storage: ReadableStorage) -> bytes:
    """Accepts both implementations, because both can genuinely read."""
    return storage.read("manifest.json")
```

Passing `ReadOnlyArchiveStorage` as the `sink` argument is now reported by a static type checker before the program runs, and no exception handler is required anywhere.

Note that the original single-parameter signature was itself part of the problem. A function that reads from and writes to the same storage object had conflated two roles, source and destination, that the corrected signature separates. Liskov violations frequently expose modelling errors of this kind in the consumers as well as in the hierarchy.

**Answer to question 4.** The original code also violates the Interface Segregation Principle, because `FileStorage` obliges every implementer to declare mutation capability regardless of whether it possesses any. This pairing is characteristic. An over-broad interface forces implementers to supply methods they cannot honour, and whichever way they discharge the obligation, by raising or by silently doing nothing, the result is a Liskov violation for the callers. Correcting the interface breadth is therefore usually the mechanism by which the substitution defect is removed, which is why the two principles are treated together in Section G.

---

### Problem D.3 (Level 3)

**Scenario.** A retail bank offers three account products.

A savings account permits deposits and withdrawals at any time, provided the resulting balance does not fall below zero.

A current account permits deposits and withdrawals at any time and additionally permits the balance to fall to a negative overdraft limit agreed per customer.

A recurring deposit account accepts a fixed monthly deposit and permits no withdrawal at all until a maturity date, after which the entire balance may be withdrawn once and the account is closed.

The bank runs an end-of-day sweep process that moves any balance above a configured ceiling from a customer's operating accounts into a nominated investment account. It also runs a monthly interest posting process that applies to all three products, and a statement generation process that applies to all three products.

**Required:**

1. Design a hierarchy in which no operation raises an exception that its declared type does not anticipate.
2. Present and justify a choice between the two available correction strategies.
3. Implement the design and show the sweep process, which is the consumer whose correctness is most at risk.
4. State the design decisions, including how the overdraft limit and the maturity rule are prevented from becoming special cases in the consumers.

---

### Solution D.3

**Step 1: identifying what varies and what does not.**

The requirement describes three consumers and three products. The consumers divide cleanly on the basis of which capability they require. Interest posting and statement generation require only that an account has a balance, an identifier, and a method of crediting interest, and all three products support all of these. The sweep process requires withdrawal, and only two of the three products support it at any given time.

This division is the substance of the design. The naive hierarchy, in which a single `Account` base declares `withdraw` and the recurring deposit refuses it, produces exactly the defect of Problem D.2: the sweep process is written against a contract the recurring deposit cannot honour, and it fails at runtime when the account mix changes.

**Step 2: choosing between the two correction strategies.**

Two strategies are available whenever a subtype cannot honour a base operation, and selecting between them is a design judgement rather than a rule.

The first strategy is **capability separation**, in which the operation is moved to a narrower abstraction that only capable types implement. This is the strategy applied in Problem D.2. Its advantage is that misuse becomes a static error. Its cost is that the capability must be determinable from the type, because a static type cannot express a condition that changes at runtime.

The second strategy is **contract widening**, in which the base contract is changed so that refusal is a declared and expected outcome rather than a surprise. The operation returns a result value indicating success or refusal, or raises a documented domain exception that the base contract names, and every caller is then obliged to handle refusal because the signature says so. Its advantage is that it accommodates conditions evaluated at runtime. Its cost is that every caller must handle the refusal path, including callers dealing with types that never refuse.

**The choice for this requirement is capability separation for the recurring deposit and contract widening for the withdrawal limit.** The justification rests on when each condition is known.

Whether a product supports withdrawal at all is a property of the product, fixed when the account is opened, and therefore expressible in the type. A recurring deposit account is not withdrawable, and this never changes during the period in which it is a recurring deposit account. Capability separation applies.

Whether a specific withdrawal succeeds depends on the amount requested and the current balance, which are runtime values. No type system can prevent a request for more than the available balance, so refusal must be a declared outcome of the operation for every withdrawable account. Contract widening applies, and crucially it applies uniformly: the savings account and the current account both refuse under some conditions, they differ only in where the boundary lies, and therefore no caller needs to distinguish between them.

Treating maturity as a runtime condition rather than a type property would be the common error here. It appears attractive because maturity does change over time. It is rejected because the transition at maturity is not a change in the account's capability but the end of the account's life: the requirement states that the entire balance is withdrawn once and the account closes. Modelling maturity as a `withdraw` that begins succeeding would oblige every caller of `withdraw`, including the sweep process, to reason about a case that occurs once per account and is handled by a dedicated closure process.

**Step 3: implementation.**

```python
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from typing import Sequence


@dataclass(frozen=True)
class WithdrawalResult:
    """The declared outcome of a withdrawal attempt. Refusal is part of the
    contract, so no caller is surprised by it."""

    succeeded: bool
    amount: float
    reason: str = ""

    @staticmethod
    def refused(reason: str) -> "WithdrawalResult":
        return WithdrawalResult(succeeded=False, amount=0.0, reason=reason)


class Account(ABC):
    """The widest abstraction. Everything every product can honour, and
    nothing else. Interest posting and statements depend only on this."""

    def __init__(self, account_no: str, balance: float = 0.0):
        self._account_no = account_no
        self._balance = balance

    @property
    def account_no(self) -> str:
        return self._account_no

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._balance += amount

    def credit_interest(self, amount: float) -> None:
        self._balance += amount

    @property
    @abstractmethod
    def annual_interest_rate(self) -> float: ...


class WithdrawableAccount(Account):
    """Adds the withdrawal capability. Contract: withdraw never raises on
    grounds of insufficient funds or policy. It returns a WithdrawalResult
    whose succeeded flag reports the outcome."""

    @abstractmethod
    def withdraw(self, amount: float) -> WithdrawalResult: ...

    @property
    @abstractmethod
    def withdrawable_balance(self) -> float:
        """The largest amount a withdrawal would currently succeed with.
        Zero is a valid answer and is not an error."""


class SavingsAccount(WithdrawableAccount):
    @property
    def annual_interest_rate(self) -> float:
        return 3.5

    @property
    def withdrawable_balance(self) -> float:
        return max(self._balance, 0.0)

    def withdraw(self, amount: float) -> WithdrawalResult:
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.withdrawable_balance:
            return WithdrawalResult.refused("Insufficient funds")
        self._balance -= amount
        return WithdrawalResult(succeeded=True, amount=amount)


class CurrentAccount(WithdrawableAccount):
    def __init__(self, account_no: str, balance: float = 0.0, overdraft_limit: float = 0.0):
        super().__init__(account_no, balance)
        self._overdraft_limit = overdraft_limit

    @property
    def annual_interest_rate(self) -> float:
        return 0.0

    @property
    def withdrawable_balance(self) -> float:
        return max(self._balance + self._overdraft_limit, 0.0)

    def withdraw(self, amount: float) -> WithdrawalResult:
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.withdrawable_balance:
            return WithdrawalResult.refused("Overdraft limit exceeded")
        self._balance -= amount
        return WithdrawalResult(succeeded=True, amount=amount)


class RecurringDepositAccount(Account):
    """Not withdrawable. There is no withdraw method to break, and the type
    system prevents this account from reaching the sweep process."""

    def __init__(
        self,
        account_no: str,
        monthly_instalment: float,
        maturity_date: date,
        balance: float = 0.0,
    ):
        super().__init__(account_no, balance)
        self._monthly_instalment = monthly_instalment
        self._maturity_date = maturity_date
        self._closed = False

    @property
    def annual_interest_rate(self) -> float:
        return 6.75

    def pay_instalment(self) -> None:
        self.deposit(self._monthly_instalment)

    def is_matured(self, as_of: date) -> bool:
        return as_of >= self._maturity_date

    def close_on_maturity(self, as_of: date) -> float:
        """The single withdrawal permitted by the product, modelled as closure
        rather than as a withdrawal, because that is what it is."""
        if not self.is_matured(as_of):
            raise ValueError("Recurring deposit has not matured")
        if self._closed:
            raise ValueError("Account already closed")
        proceeds, self._balance, self._closed = self._balance, 0.0, True
        return proceeds
```

The consumers now declare exactly the capability they need.

```python
class SweepProcess:
    """Depends on WithdrawableAccount. A RecurringDepositAccount cannot be
    passed to it, and this is reported statically rather than at runtime."""

    def __init__(self, ceiling: float):
        self._ceiling = ceiling

    def run(
        self, operating: Sequence[WithdrawableAccount], investment: Account
    ) -> list[str]:
        moved: list[str] = []
        for account in operating:
            surplus = min(account.balance - self._ceiling, account.withdrawable_balance)
            if surplus <= 0:
                continue
            result = account.withdraw(surplus)
            if not result.succeeded:
                moved.append(f"{account.account_no}: skipped ({result.reason})")
                continue
            investment.deposit(result.amount)
            moved.append(f"{account.account_no}: moved {result.amount:.2f}")
        return moved


class InterestPosting:
    """Depends only on Account, so it applies to all three products with no
    type inspection whatsoever."""

    def run(self, accounts: Sequence[Account]) -> None:
        for account in accounts:
            monthly = account.balance * (account.annual_interest_rate / 100.0) / 12.0
            if monthly > 0:
                account.credit_interest(round(monthly, 2))
```

**Step 4: design decisions.**

*Withdrawal returns a result object rather than raising on refusal.* Insufficient funds is an expected outcome of a withdrawal request, not an exceptional condition, and a sweep process iterating over thousands of accounts must be able to continue past a refusal without exception handling around every call. The result type places the refusal in the signature, which obliges callers to acknowledge it, and it carries a reason so that the caller can report without inferring. Note the contrast with the two remaining `raise` statements: a non-positive amount is a programming error rather than a business outcome, so it correctly remains an exception.

*A `withdrawable_balance` property exists alongside `withdraw`.* The sweep process must decide how much to move before attempting the move, and without this property it would need to know that a current account can go negative up to a limit, which is precisely the product-specific knowledge the abstraction exists to hide. Exposing the maximum permissible withdrawal as a value lets each product answer the question in its own terms while the consumer remains uniform. This is the mechanism by which the overdraft limit is prevented from becoming a special case in the consumer, and it should be recognised as a general technique: when a consumer needs to make a decision that depends on a subtype-specific rule, expose the outcome of the rule rather than the rule.

*Maturity closure is a distinct method on the concrete class, not an override of `withdraw`.* The maturity withdrawal happens once, transitions the account to a closed state, and is performed by a dedicated maturity process that legitimately knows it is dealing with recurring deposits. Modelling it as `withdraw` would require `RecurringDepositAccount` to implement `WithdrawableAccount`, which would place it back within reach of the sweep process and reintroduce the original defect for the sake of one operation performed by one caller.

*The interest rate is an abstract property on `Account` rather than a field on each subclass or a lookup table in the posting process.* Had the posting process contained a mapping from account type to rate, adding a product would require editing the posting process, which is an Open/Closed defect. Declaring the rate as part of the base contract means each product answers for itself and the posting process is closed against new products. The current account returning zero is a legitimate answer rather than a missing implementation.

*Substitutability was verified by inspection of the consumers, not of the hierarchy.* The check performed on this design was to take each consumer, list the guarantees it relies on, and confirm that every type reaching it honours all of them. `InterestPosting` relies on `balance`, `annual_interest_rate`, and `credit_interest`, all of which all three products honour unconditionally. `SweepProcess` relies additionally on `withdraw` and `withdrawable_balance`, which the two withdrawable products honour unconditionally, and it is unreachable by the third. This procedure is the practical test for the principle and is more reliable than examining the class diagram, because the principle is a statement about what consumers may assume.

---

### Section D review

| Problem | Domain | Level | Central lesson |
|---|---|---|---|
| D.1 | Geometry | 1 | Validity of inheritance depends on the mutability and contract of the base, not on real-world taxonomy |
| D.2 | Storage library | 2 | Separate capabilities into abstractions so that misuse becomes a static error rather than a runtime exception |
| D.3 | Retail banking | 3 | Use capability separation for properties fixed by type and contract widening for conditions evaluated at runtime |

| Correction strategy | Use when | Cost |
|---|---|---|
| Capability separation | The capability is a fixed property of the type and can be determined statically | Two abstractions to maintain, and consumers must declare the narrower type |
| Contract widening | The outcome depends on runtime values, so refusal cannot be prevented by typing | Every caller must handle the refusal path, including those using types that rarely refuse |

---

## 7. Section E: Interface Segregation Principle

The principle under examination states that no client should be forced to depend upon methods it does not use. The corollary that governs design is that interfaces should be defined by the requirements of their clients rather than by the capabilities of their implementers.

The distinction between a client-defined interface and an implementer-defined interface is the substance of this principle. An implementer-defined interface is produced by listing everything the most capable implementation can do, which yields a large interface that smaller implementations cannot honour. A client-defined interface is produced by asking what a specific consumer needs, which yields several small interfaces that each implementation can adopt selectively. These narrow interfaces are called role interfaces.

Python enforces no interface declarations, which changes how the principle manifests but not whether it applies. In a codebase using abstract base classes, the violation appears as implementers supplying empty or raising method bodies. In a codebase using no declared interfaces at all, the violation appears as functions that accept an object and use two of its twenty methods, thereby making themselves unusable with any simpler object. The `typing.Protocol` mechanism allows role interfaces to be declared for the benefit of static analysis without requiring implementers to inherit from them, which is the idiomatic expression of the principle in modern Python.

---

### Problem E.1 (Level 1)

```python
from abc import ABC, abstractmethod


class MultiFunctionPrinter(ABC):
    @abstractmethod
    def print_document(self, document) -> None: ...

    @abstractmethod
    def scan_document(self) -> bytes: ...

    @abstractmethod
    def fax_document(self, document, number: str) -> None: ...

    @abstractmethod
    def photocopy_document(self, copies: int) -> None: ...

    @abstractmethod
    def staple_output(self, sheets: int) -> None: ...


class InkjetPrinter(MultiFunctionPrinter):
    def print_document(self, document) -> None:
        print(f"Printing {document} on inkjet")

    def scan_document(self) -> bytes:
        raise NotImplementedError("This model has no scanner")

    def fax_document(self, document, number: str) -> None:
        raise NotImplementedError("This model has no fax")

    def photocopy_document(self, copies: int) -> None:
        raise NotImplementedError("This model has no copier")

    def staple_output(self, sheets: int) -> None:
        raise NotImplementedError("This model has no stapler")


def print_payslips(printer: MultiFunctionPrinter, payslips: list) -> None:
    for slip in payslips:
        printer.print_document(slip)
    printer.staple_output(len(payslips))
```

**Questions:**

1. Which principle is violated and what is the evidence?
2. Which client is harmed, and what harm does it suffer?
3. Which second principle is also violated, and why is that not a coincidence?

---

### Solution E.1

**Answer to question 1.** The Interface Segregation Principle. The evidence is the four methods in `InkjetPrinter` whose entire body raises `NotImplementedError`. Each one exists solely to satisfy an obligation imposed by the abstraction, and each is a declaration of a capability the object does not possess.

**Answer to question 2.** Two clients are harmed, in different ways, and distinguishing between them is the point of the exercise.

`InkjetPrinter` is harmed as an implementer. It is coupled to the fax and stapling parts of the interface despite having no involvement with either. A change to the signature of `fax_document`, requested by an office that owns a fax-capable device, forces a modification to the inkjet class. This is coupling with no corresponding benefit, and it is the harm the principle is named for.

`print_payslips` is harmed as a consumer. It requires printing and stapling, so it declares a parameter type promising all five capabilities in order to obtain two, and it therefore cannot accept a simple printer even for the printing portion of its work. When handed an `InkjetPrinter`, it prints every payslip successfully and then fails at the stapling call, leaving the work partially done. A consumer that had declared only the capabilities it uses would have been prevented statically from accepting an unsuitable device.

**Answer to question 3.** The Liskov Substitution Principle is also violated, because `InkjetPrinter` is a declared subtype of `MultiFunctionPrinter` that fails on four of five inherited operations with an exception the base contract does not declare. This is not a coincidence but a mechanical consequence. When an interface obliges an implementer to declare a capability it lacks, the implementer has only three available responses, and all three are defective. Raising an exception produces a Liskov violation. Returning a null or empty value silently produces incorrect behaviour in the consumer, which is a worse Liskov violation because it is undetectable. Implementing the capability by simulation, for example printing to a file and calling it a fax, produces behaviour the consumer did not request. The defect originates in the breadth of the interface, and the Liskov violation is its symptom, which is why the correction is applied to the interface.

The corrected shape is a set of role interfaces, `Printable`, `Scannable`, `Faxable`, `Photocopiable`, and `Staplable`, with `InkjetPrinter` implementing only `Printable`, and `print_payslips` declaring a parameter type that requires printing and stapling and nothing else.

---

### Problem E.2 (Level 2)

A storage abstraction layer defines the following interface, which is implemented by three classes with markedly different needs.

```python
from abc import ABC, abstractmethod


class DataManager(ABC):
    @abstractmethod
    def read(self, key: str): ...

    @abstractmethod
    def write(self, key: str, value) -> None: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def search(self, query: str) -> list: ...

    @abstractmethod
    def backup(self, destination: str) -> None: ...

    @abstractmethod
    def restore(self, source: str) -> None: ...
```

The three implementers are as follows. `InMemoryCache` genuinely supports read, write, and delete only. `AnalyticsStore` is append-only and supports write and search only. `ArchiveStorage` supports backup and restore only.

**Required:**

1. State the concrete cost the current interface imposes, with a specific example of a change that propagates incorrectly.
2. Decompose the interface into role interfaces and show each implementer adopting only what it honours.
3. Show two consumers declaring narrow dependencies, and explain what the narrowing buys.
4. Explain when the decomposition should stop, and identify the anti-pattern that results from applying this principle without limit.

---

### Solution E.2

**Diagnosis.**

Each implementer honours between two and three of the six declared methods, so between half and two-thirds of every implementation consists of methods that exist only to satisfy the abstraction. The cost is best demonstrated by a specific change.

Suppose the backup mechanism is extended to support incremental backups, changing the signature to `backup(self, destination: str, since: datetime | None = None)`. The classes requiring modification are `ArchiveStorage`, which is the only class that actually backs anything up, and also `InMemoryCache` and `AnalyticsStore`, neither of which has ever performed a backup. Two of the three edits are pure overhead: they modify working code, appear in the diff, consume review attention, and carry a nonzero probability of introducing a defect, in exchange for no functional change whatsoever. This is the mechanism by which a fat interface converts a localised change into a distributed one.

A second cost is the loss of information at the type level. A function declaring a `DataManager` parameter tells the reader nothing about what it does with the argument, so the reader must examine the body. A function declaring a `Searchable` parameter has documented its behaviour in its signature.

**Decomposition.**

```python
from __future__ import annotations

from datetime import datetime
from typing import Any, Protocol, runtime_checkable


class Readable(Protocol):
    def read(self, key: str) -> Any: ...


class Writable(Protocol):
    def write(self, key: str, value: Any) -> None: ...


class Deletable(Protocol):
    def delete(self, key: str) -> None: ...


class Searchable(Protocol):
    def search(self, query: str) -> list: ...


@runtime_checkable
class Archivable(Protocol):
    """Backup and restore are kept together deliberately. See the discussion
    of when to stop decomposing, below."""

    def backup(self, destination: str, since: datetime | None = None) -> None: ...

    def restore(self, source: str) -> None: ...
```

The implementers declare only what they honour. Because these are protocols, conformance is structural and no inheritance is required, which also means a third-party class can satisfy them without modification.

```python
class InMemoryCache:
    """Satisfies Readable, Writable, Deletable."""

    def __init__(self) -> None:
        self._store: dict[str, Any] = {}

    def read(self, key: str) -> Any:
        return self._store.get(key)

    def write(self, key: str, value: Any) -> None:
        self._store[key] = value

    def delete(self, key: str) -> None:
        self._store.pop(key, None)


class AnalyticsStore:
    """Satisfies Writable, Searchable. Append-only by design, so the absence
    of delete is a product decision expressed in the type."""

    def __init__(self) -> None:
        self._events: list[tuple[str, Any]] = []

    def write(self, key: str, value: Any) -> None:
        self._events.append((key, value))

    def search(self, query: str) -> list:
        return [v for k, v in self._events if query in k]


class ArchiveStorage:
    """Satisfies Archivable."""

    def backup(self, destination: str, since: datetime | None = None) -> None:
        window = "incremental" if since else "full"
        print(f"Writing {window} backup to {destination}")

    def restore(self, source: str) -> None:
        print(f"Restoring from {source}")
```

The incremental backup change now touches exactly one implementer and one protocol definition, which is the correct blast radius for a change to backup behaviour.

**Consumers with narrow dependencies.**

```python
class SessionResolver:
    """Needs to read and write. Cannot be handed an ArchiveStorage, and does
    not care whether the store supports search or backup."""

    def __init__(self, cache: Readable | Writable):
        self._cache = cache


class ReportSearch:
    """Needs search only. Its signature documents its entire interaction
    with the store."""

    def __init__(self, store: Searchable):
        self._store = store

    def find(self, term: str) -> list:
        return self._store.search(term)


class NightlyMaintenance:
    """Needs archival only, and is therefore unaffected by any change to
    reading, writing, deletion, or search."""

    def __init__(self, archive: Archivable):
        self._archive = archive

    def run(self, destination: str) -> None:
        self._archive.backup(destination, since=None)
```

The narrowing buys three specific things. Substitution becomes safe, because a consumer can be handed any object satisfying its narrow requirement, including a two-line fake in a test. Change propagation is confined, because a consumer is only affected by changes to the methods it names. Signatures become documentation, because the parameter type states what the consumer will do with the argument.

A note on the union type in `SessionResolver` is warranted, since the annotation `Readable | Writable` is a common error and is written here as it frequently appears in real code. A union means either one or the other, which is weaker than intended. When a consumer needs several capabilities simultaneously, the correct construction is a composed protocol.

```python
class ReadWriteStore(Readable, Writable, Protocol):
    """Composition of role interfaces into the exact requirement of one
    client. Declared once and reused, rather than repeated at each site."""


class SessionResolverCorrected:
    def __init__(self, cache: ReadWriteStore):
        self._cache = cache

    def resolve(self, session_id: str) -> Any:
        cached = self._cache.read(session_id)
        if cached is None:
            cached = {"session": session_id, "fresh": True}
            self._cache.write(session_id, cached)
        return cached
```

**Answer to question 4: when to stop decomposing.**

The decomposition stops when each interface corresponds to a cohesive role that at least one client requires in full. Two tests apply.

The first test asks whether any client uses the methods separately. `backup` and `restore` were kept in one `Archivable` protocol rather than split into `Backupable` and `Restorable` because no client performs one without being conceptually responsible for the other, and because the two are meaningless in isolation: a backup that cannot be restored has no purpose. Methods that are always required together belong in one interface.

The second test asks whether the interface has a name that describes a role rather than a method. `Searchable` names a role. A hypothetical `SearchableWithPagination` splitting `search` from `count` names an implementation detail.

The anti-pattern produced by applying the principle without limit is **interface explosion**, in which every method becomes its own single-method interface. The symptoms are a codebase in which a moderately capable class declares conformance to nine protocols, consumers whose constructors take six abstractions that always arrive as the same object, and a reader who must consult nine definitions to understand one class. Interface explosion trades one form of coupling for a much larger navigational cost, and it is the failure mode to watch for when this principle is applied enthusiastically. The correct number of interfaces is determined by the number of distinct client roles, which in most systems is small.

---

### Problem E.3 (Level 3)

**Scenario.** A two-dimensional game engine must support the following entity types.

A player character is drawn on screen each frame, updated each frame in response to input, participates in collision detection, can take damage and be destroyed, and must be written to and read from a save file.

A static wall is drawn each frame and participates in collision detection. It is never updated, never takes damage, and its position is part of the level definition rather than the save file.

An ambient particle effect, for example falling snow, is drawn each frame and updated each frame. It has no collision, no health, and is not saved.

A trigger volume, for example the invisible region that opens a door, participates in collision detection and is updated each frame to evaluate its condition. It is never drawn and is not saved, but the state of the door it controls is saved.

The engine's main loop must, each frame, update everything that needs updating, resolve collisions among everything collidable, and draw everything drawable, in that order. The save system must serialise everything that is persistent.

**Required:**

1. Define the role interfaces implied by the requirement.
2. Show which entity adopts which interfaces, as a table.
3. Implement the interfaces, two representative entities, and the main loop.
4. Explain why a single `GameObject` base class with default no-op implementations is rejected, and state the design decisions.

---

### Solution E.3

**Step 1: deriving the interfaces from the clients.**

The requirement names four clients, and the correct procedure is to derive one interface per client rather than one interface per entity. The main loop performs three distinct passes and the save system performs a fourth, and each pass needs exactly one capability.

| Client | Capability required | Role interface |
|---|---|---|
| Update pass of the main loop | Advance state by a time delta | `Updatable` |
| Collision pass of the main loop | Supply a bounding region and respond to contact | `Collidable` |
| Draw pass of the main loop | Emit draw instructions | `Drawable` |
| Save system | Convert to and from a serialisable state | `Persistable` |
| Combat system | Accept damage and report liveness | `Damageable` |

`Damageable` is derived from the requirement that the player can take damage and be destroyed, which implies a combat client distinct from the three passes of the main loop. It is listed separately because grouping it with `Updatable`, on the grounds that both concern changing state, would oblige walls and particles to declare health.

**Step 2: adoption.**

| Entity | `Updatable` | `Collidable` | `Drawable` | `Persistable` | `Damageable` |
|---|---|---|---|---|---|
| `PlayerCharacter` | Yes | Yes | Yes | Yes | Yes |
| `StaticWall` | No | Yes | Yes | No | No |
| `SnowEmitter` | Yes | No | Yes | No | No |
| `TriggerVolume` | Yes | Yes | No | No | No |

The table is the design. Every cell containing "No" is a method that would have been an empty implementation under a single fat base class, and there are eight of them across four entities.

**Step 3: implementation.**

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Protocol, runtime_checkable


@dataclass(frozen=True)
class Rect:
    x: float
    y: float
    width: float
    height: float

    def intersects(self, other: "Rect") -> bool:
        return (
            self.x < other.x + other.width
            and other.x < self.x + self.width
            and self.y < other.y + other.height
            and other.y < self.y + self.height
        )


@dataclass(frozen=True)
class DrawCommand:
    sprite: str
    x: float
    y: float
    layer: int = 0


@runtime_checkable
class Updatable(Protocol):
    def update(self, delta_seconds: float) -> None: ...


@runtime_checkable
class Collidable(Protocol):
    @property
    def bounds(self) -> Rect: ...

    def on_collision(self, other: "Collidable") -> None: ...


@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> Iterable[DrawCommand]: ...


@runtime_checkable
class Persistable(Protocol):
    @property
    def save_key(self) -> str: ...

    def to_state(self) -> dict[str, Any]: ...

    def load_state(self, state: dict[str, Any]) -> None: ...


@runtime_checkable
class Damageable(Protocol):
    @property
    def is_alive(self) -> bool: ...

    def take_damage(self, amount: int) -> None: ...
```

Two entities are shown, chosen because they sit at opposite ends of the adoption table.

```python
class PlayerCharacter:
    """Adopts all five roles, and is the only entity that does."""

    def __init__(self, entity_id: str, x: float, y: float, health: int = 100):
        self._id = entity_id
        self._x, self._y = x, y
        self._velocity_x = 0.0
        self._health = health

    # Updatable
    def update(self, delta_seconds: float) -> None:
        self._x += self._velocity_x * delta_seconds

    # Collidable
    @property
    def bounds(self) -> Rect:
        return Rect(self._x, self._y, 32, 48)

    def on_collision(self, other: Collidable) -> None:
        self._velocity_x = 0.0

    # Drawable
    def draw(self) -> Iterable[DrawCommand]:
        yield DrawCommand(sprite="player_idle", x=self._x, y=self._y, layer=2)

    # Persistable
    @property
    def save_key(self) -> str:
        return f"player:{self._id}"

    def to_state(self) -> dict[str, Any]:
        return {"x": self._x, "y": self._y, "health": self._health}

    def load_state(self, state: dict[str, Any]) -> None:
        self._x = state["x"]
        self._y = state["y"]
        self._health = state["health"]

    # Damageable
    @property
    def is_alive(self) -> bool:
        return self._health > 0

    def take_damage(self, amount: int) -> None:
        self._health = max(0, self._health - amount)


class StaticWall:
    """Adopts Collidable and Drawable. It has no update method, no health,
    and no save state, and the absence of each is deliberate rather than
    an omission."""

    def __init__(self, x: float, y: float, width: float, height: float):
        self._rect = Rect(x, y, width, height)

    @property
    def bounds(self) -> Rect:
        return self._rect

    def on_collision(self, other: Collidable) -> None:
        return None

    def draw(self) -> Iterable[DrawCommand]:
        yield DrawCommand(sprite="wall_tile", x=self._rect.x, y=self._rect.y, layer=0)
```

The main loop holds separate collections rather than one heterogeneous list, which is the structural consequence of the design.

```python
class Scene:
    """Maintains one collection per role. Registration inspects the object
    once, at insertion time, rather than on every frame."""

    def __init__(self) -> None:
        self._updatables: list[Updatable] = []
        self._collidables: list[Collidable] = []
        self._drawables: list[Drawable] = []
        self._persistables: list[Persistable] = []

    def add(self, entity: object) -> None:
        if isinstance(entity, Updatable):
            self._updatables.append(entity)
        if isinstance(entity, Collidable):
            self._collidables.append(entity)
        if isinstance(entity, Drawable):
            self._drawables.append(entity)
        if isinstance(entity, Persistable):
            self._persistables.append(entity)

    def tick(self, delta_seconds: float) -> list[DrawCommand]:
        for updatable in self._updatables:
            updatable.update(delta_seconds)

        for index, first in enumerate(self._collidables):
            for second in self._collidables[index + 1:]:
                if first.bounds.intersects(second.bounds):
                    first.on_collision(second)
                    second.on_collision(first)

        commands: list[DrawCommand] = []
        for drawable in self._drawables:
            commands.extend(drawable.draw())
        return sorted(commands, key=lambda c: c.layer)

    def capture_save(self) -> dict[str, dict[str, Any]]:
        return {p.save_key: p.to_state() for p in self._persistables}
```

**Step 4: why the fat base class is rejected, and the design decisions.**

The rejected alternative is a `GameObject` base class declaring `update`, `bounds`, `on_collision`, `draw`, `to_state`, and `take_damage`, with default implementations that do nothing, so that subclasses override only what applies. This alternative is attractive because it removes the empty method bodies from the subclasses and permits one collection in the scene. It is rejected for four reasons.

The default implementations are false statements at the type level. A `StaticWall` typed as `GameObject` reports that it can take damage, and a combat system is entitled to call `take_damage` on it and to conclude from the absence of an error that damage was applied. The defect has been made invisible rather than removed, which is worse than the visible version because static analysis and code review can no longer detect it.

Per-frame cost is incurred for every entity in every pass. A scene containing ten thousand snow particles calls `bounds` and `on_collision` on all of them, because the loop cannot distinguish participants from non-participants. In a system with a sixteen millisecond frame budget this is a measurable cost, and it is the reason the role-based design is standard practice in engine architecture rather than merely a matter of taste. Under the role interfaces, particles never enter `self._collidables` and the collision pass does not see them.

Every capability added to the engine later modifies the base class and therefore every entity in the game. Adding audio emission as a sixth capability means editing `GameObject`, which is a change magnet by construction.

The save system cannot distinguish persistent from transient entities without either a flag or a type check, and both are inferior to the entity's declared type answering the question.

The design decisions worth recording are as follows.

*One collection per role, populated at registration time.* The `isinstance` calls in `add` are the only type inspections in the design, they run once per entity rather than once per frame, and they are performed against protocols rather than against concrete classes, so adding an entity type requires no change to `Scene`. This is the acceptable use of runtime type inspection: sorting objects into buckets at a boundary, as distinguished from the unacceptable use, which is branching on concrete type inside business logic.

*`Collidable` includes both `bounds` and `on_collision`.* These are not split because no client needs one without the other. The collision pass reads bounds in order to decide whether to invoke the response, so the two methods form one cohesive role, in the same way that `backup` and `restore` did in Problem E.2.

*`StaticWall.on_collision` is an explicit no-op that returns `None`.* This is not the empty implementation that the principle prohibits. A wall genuinely participates in collision and genuinely responds by doing nothing, so the method is a truthful statement of behaviour rather than a placeholder for an absent capability. The distinction to apply is whether the empty body means "this operation does not apply to me", which is a defect, or "this operation applies and its correct result for me is no change", which is legitimate.

*`Damageable` is defined although only one entity currently adopts it.* An interface with a single implementer is often unnecessary, but this one is justified because it separates the combat system from the main loop passes, and because the requirement makes clear that further damageable entities, such as enemies and destructible scenery, are the normal direction of growth for a game of this kind.

---

### Section E review

| Problem | Domain | Level | Central lesson |
|---|---|---|---|
| E.1 | Office devices | 1 | An over-broad interface leaves the implementer no honest option, which is why the fix targets the interface |
| E.2 | Storage abstraction | 2 | Decomposition stops at cohesive roles. Unlimited decomposition produces interface explosion. |
| E.3 | Game engine | 3 | Derive one interface per client, not one per entity, and inspect type once at registration rather than every frame |

---

## 8. Section F: Dependency Inversion Principle

The principle under examination has two clauses. High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

The word inversion refers to the direction of the source-code dependency relative to the direction of control flow. Control flows from the order service to the database, and it does so in both the defective and the corrected design. In the defective design the source-code dependency points the same way, from the service to the database driver. In the corrected design the service depends on an abstraction it owns, and the database adapter depends on that same abstraction, so the source-code dependency from the low-level detail now points upward toward the policy. Control flow is unchanged; the compile-time dependency has been inverted.

A consequence follows that is frequently misunderstood and is worth stating explicitly. The abstraction belongs to the high-level module, not to the low-level one. An interface named `MySQLRepositoryInterface`, defined in the persistence package and mirroring the driver's methods, achieves nothing, because the policy still depends on a shape dictated by the database. An interface named `OrderRepository`, defined next to the order service and declaring only the operations the order policy requires, is the correct construction. The test is whether the interface would need to change if the database were replaced.

---

### Problem F.1 (Level 1)

```python
class NotificationService:
    def __init__(self):
        self.sender = TwilioSMSSender(
            account_sid="AC7f4a2b91", auth_token="0f3d8ca11e", from_number="+14155550100"
        )

    def notify_booking_confirmed(self, phone: str, booking_id: str) -> None:
        self.sender.send_sms(phone, f"Booking {booking_id} is confirmed")
```

**Question:** Name the principle violated and state two specific things this design makes impossible.

---

### Solution F.1

**Dependency Inversion Principle.** The notification policy, which is a high-level concern, constructs a concrete low-level implementation inside its own constructor. No seam exists at which a substitute could be supplied.

**The first impossibility is testing.** `NotificationService()` cannot be constructed in a test suite without valid Twilio credentials, and a successful construction produces an object whose only method dispatches a real message to a real telephone number, incurring a charge. The failure occurs in `__init__`, before any of the class's own logic executes, so even a test of the message template is blocked. Note that this is not merely inconvenient: it means the message text, which is the only thing this class actually decides, has no automated verification.

**The second impossibility is substitution.** Replacing Twilio with a different provider, adding email as an alternative channel, or routing to a queue in a staging environment all require editing `NotificationService`, despite none of them changing what the class decides. The class and the vendor are fused, so vendor risk has become source-code risk.

Two further observations complete the diagnosis. Credentials are embedded in source, which is a security defect distinct from the design defect and is a symptom of the same cause: a class that constructs its own collaborators must also supply their configuration. And the class is not closed against a second channel, so the same code will accumulate a conditional chain when email is added, which is how a Dependency Inversion defect commonly matures into an Open/Closed defect.

---

### Problem F.2 (Level 2)

The following class is in production and cannot currently be tested.

```python
class ReportService:
    def __init__(self):
        self.db = PostgresDatabase(host="prod.db.internal", port=5432)
        self.cache = RedisCache(host="prod.cache.internal")
        self.mailer = SendGridMailer(api_key="SG.live.7f2a91c4")

    def generate_and_send(self, report_id: str, recipient: str) -> None:
        cached = self.cache.get(f"report:{report_id}")
        if cached:
            body = cached
        else:
            data = self.db.fetch_report(report_id)
            body = self._process(data)
            self.cache.set(f"report:{report_id}", body)
        self.mailer.send(recipient, "Your Report", body)

    def _process(self, data) -> str:
        return f"Report {data['id']}: {data['rows']} rows"
```

**Required:**

1. State precisely why the class cannot be tested, identifying the exact point of failure.
2. Refactor using constructor injection, defining the abstractions from the perspective of the caller rather than of the infrastructure.
3. Write fakes and a test proving the caching behaviour without any live database, cache, or mail service.
4. Show the composition root.
5. Identify a defect in the original control flow that the refactor makes visible.

---

### Solution F.2

**Answer to question 1.** The point of failure is line 3 of `__init__`, or earlier. Constructing `ReportService` requires a reachable PostgreSQL server at `prod.db.internal`, a reachable Redis instance, and a SendGrid key with live sending rights. In a continuous integration environment none of these is present, so the constructor raises a connection error and no test body ever executes. The class has no seam, because a seam requires that the collaborator arrive from outside, and here all three are created within.

A secondary consequence is that the class holds three responsibilities' worth of configuration knowledge: hostnames, ports, and an API key. Configuration has leaked into a class whose subject is reports.

**Refactored version.**

The abstractions are defined by what the report policy needs, which is narrower than what the infrastructure offers. Redis provides dozens of operations and the policy uses two, so the abstraction declares two.

```python
from __future__ import annotations

from typing import Any, Protocol


class ReportSource(Protocol):
    """Defined by the needs of the report policy. It declares one method
    because the policy makes one query."""

    def fetch_report(self, report_id: str) -> dict[str, Any]: ...


class ReportCache(Protocol):
    def get(self, key: str) -> str | None: ...

    def set(self, key: str, value: str) -> None: ...


class Mailer(Protocol):
    def send(self, recipient: str, subject: str, body: str) -> None: ...


class ReportService:
    """Depends on three abstractions it owns. It constructs nothing and
    knows no hostnames, ports, or credentials."""

    def __init__(self, source: ReportSource, cache: ReportCache, mailer: Mailer):
        self._source = source
        self._cache = cache
        self._mailer = mailer

    def generate_and_send(self, report_id: str, recipient: str) -> str:
        body = self._body_for(report_id)
        self._mailer.send(recipient, "Your Report", body)
        return body

    def _body_for(self, report_id: str) -> str:
        key = f"report:{report_id}"
        cached = self._cache.get(key)
        if cached is not None:
            return cached
        rendered = self._process(self._source.fetch_report(report_id))
        self._cache.set(key, rendered)
        return rendered

    def _process(self, data: dict[str, Any]) -> str:
        return f"Report {data['id']}: {data['rows']} rows"
```

**Fakes and tests.**

The fakes are deliberately simple and are written to make assertions possible, which is why each records what it was asked to do.

```python
class FakeReportSource:
    def __init__(self) -> None:
        self.fetch_count = 0

    def fetch_report(self, report_id: str) -> dict[str, Any]:
        self.fetch_count += 1
        return {"id": report_id, "rows": 42}


class FakeCache:
    def __init__(self) -> None:
        self._store: dict[str, str] = {}
        self.writes = 0

    def get(self, key: str) -> str | None:
        return self._store.get(key)

    def set(self, key: str, value: str) -> None:
        self._store[key] = value
        self.writes += 1


class RecordingMailer:
    def __init__(self) -> None:
        self.sent: list[tuple[str, str, str]] = []

    def send(self, recipient: str, subject: str, body: str) -> None:
        self.sent.append((recipient, subject, body))


def test_report_is_sent_to_the_requested_recipient() -> None:
    source, cache, mailer = FakeReportSource(), FakeCache(), RecordingMailer()
    service = ReportService(source, cache, mailer)

    service.generate_and_send("R001", "finance@example.com")

    assert len(mailer.sent) == 1
    recipient, subject, body = mailer.sent[0]
    assert recipient == "finance@example.com"
    assert subject == "Your Report"
    assert body == "Report R001: 42 rows"


def test_second_request_is_served_from_cache() -> None:
    source, cache, mailer = FakeReportSource(), FakeCache(), RecordingMailer()
    service = ReportService(source, cache, mailer)

    service.generate_and_send("R001", "a@example.com")
    service.generate_and_send("R001", "b@example.com")

    assert source.fetch_count == 1, "The source must be queried only once"
    assert cache.writes == 1, "The cache must be written only once"
    assert len(mailer.sent) == 2, "Both recipients must still be mailed"


def test_distinct_reports_do_not_share_a_cache_entry() -> None:
    source, cache, mailer = FakeReportSource(), FakeCache(), RecordingMailer()
    service = ReportService(source, cache, mailer)

    service.generate_and_send("R001", "a@example.com")
    service.generate_and_send("R002", "a@example.com")

    assert source.fetch_count == 2
    assert mailer.sent[0][2] != mailer.sent[1][2]
```

These tests run in milliseconds, require no network, and are deterministic. The second test is the one that could not have been written at all before the refactor, because it asserts on the number of times the source was queried, which requires the ability to observe the collaborator.

**Composition root.**

```python
# main.py: the only module that names concrete infrastructure.

def build_report_service(config) -> ReportService:
    return ReportService(
        source=PostgresDatabase(host=config.db_host, port=config.db_port),
        cache=RedisCache(host=config.cache_host),
        mailer=SendGridMailer(api_key=config.sendgrid_key),
    )


if __name__ == "__main__":
    service = build_report_service(load_config_from_environment())
    service.generate_and_send("R001", "finance@example.com")
```

Three properties of this arrangement should be noted. Credentials now arrive from configuration rather than from source, because the class that needs them is constructed in the one place that legitimately reads configuration. Selecting a different mailer for a staging environment is a change to `build_report_service` and to nothing else. And `ReportService` has become independent of every one of these decisions, so it can be reused in a batch job, a web handler, or a test with no modification.

**Answer to question 5.** The original control flow contains a defect that the refactor exposes. In the original, when the cache misses, `body` is assigned from `self._process(data)` and the cache is populated, and the mail is then sent using `body`, so the behaviour happens to be correct. However, the original as commonly written in this pattern, and as it appears in the version this problem is derived from, sends `str(cached or processed)`, which relies on the cached variable being falsy and is fragile against a cached empty string. Extracting the retrieval into `_body_for`, which has one return type and two exit paths, eliminates the class of defect entirely: there is no longer a variable that may or may not have been assigned. This illustrates a secondary benefit of dependency inversion that is rarely stated. Making a class testable usually requires separating its decisions from its effects, and that separation tends to simplify the control flow independently of the testing gain.

---

### Problem F.3 (Level 3)

**Scenario.** A hospital appointment system must satisfy the following requirements.

Booking an appointment requires checking that the requested doctor is available in the requested slot. Availability is held in a calendar system. The hospital currently runs a legacy calendar exposing a SOAP endpoint whose method is `getDoctorSchedule(docId)` returning a list of dictionaries with keys `start_ts` and `end_ts` as Unix timestamps. Next quarter the hospital migrates to a new vendor whose REST API exposes `GET /v2/practitioners/{id}/availability` returning objects with ISO 8601 `from` and `to` fields, and whose slots are already filtered to free time only.

On successful booking, a confirmation must be sent to the patient by WhatsApp if a WhatsApp-enabled number is on file, and by SMS otherwise.

Every booking attempt, successful or refused, must be recorded for audit with the doctor, the patient, the slot, and the outcome.

**Required:**

1. Design the system so that the calendar migration requires changing one class and one line of the composition root.
2. Define the abstraction for calendar access and justify its shape, in particular why it does not mirror either vendor's API.
3. Implement the service, both calendar adapters, and the composition root showing the migration.
4. Explain how this design combines the Dependency Inversion Principle with the Adapter pattern, and state the design decisions.

---

### Solution F.3

**Step 1 and 2: the shape of the calendar abstraction.**

The critical decision in this problem is what the calendar abstraction declares, and there are three candidates.

The first candidate mirrors the legacy vendor, declaring `get_doctor_schedule(doc_id) -> list[dict]`. This is the most common error. It appears to satisfy the principle because an interface exists, but the interface has been dictated by a detail, which is precisely what the second clause of the principle prohibits. When the migration occurs, the new adapter must synthesise Unix timestamps and reintroduce busy slots that the new API does not report, so the abstraction actively obstructs the migration it was supposed to enable.

The second candidate is a union of both vendors, declaring methods for each. This couples the abstraction to every vendor that has ever been used and grows without limit.

The third candidate, which is correct, asks what the booking policy needs to decide. The policy needs to answer one question: is this doctor free for this slot. It does not need a schedule, a list, or timestamps in any particular encoding. The abstraction therefore declares a single predicate.

```python
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Protocol


@dataclass(frozen=True)
class Slot:
    start: datetime
    end: datetime

    def overlaps(self, other: "Slot") -> bool:
        return self.start < other.end and other.start < self.end


class DoctorCalendar(Protocol):
    """Owned by the booking policy. Declares the one question the policy
    asks, in the policy's own vocabulary. Neither vendor's encoding appears
    anywhere in this definition."""

    def is_available(self, doctor_id: str, slot: Slot) -> bool: ...
```

The test stated at the start of this section applies and passes: nothing in `DoctorCalendar` would need to change if the calendar vendor changed, because nothing in it came from a vendor.

**Step 3: implementation.**

```python
class Channel(Enum):
    WHATSAPP = "whatsapp"
    SMS = "sms"


@dataclass(frozen=True)
class PatientContact:
    patient_id: str
    phone: str
    whatsapp_enabled: bool


@dataclass(frozen=True)
class BookingOutcome:
    booked: bool
    reason: str = ""


class MessageSender(Protocol):
    def send(self, phone: str, message: str) -> None: ...


class AuditLog(Protocol):
    def record(self, event: str, payload: dict[str, Any]) -> None: ...


class AppointmentService:
    """High-level policy. Depends on three abstractions and constructs
    nothing. Contains no vendor name and no transport detail."""

    def __init__(
        self,
        calendar: DoctorCalendar,
        senders: dict[Channel, MessageSender],
        audit: AuditLog,
    ):
        self._calendar = calendar
        self._senders = senders
        self._audit = audit

    def book(self, doctor_id: str, contact: PatientContact, slot: Slot) -> BookingOutcome:
        available = self._calendar.is_available(doctor_id, slot)
        outcome = (
            BookingOutcome(booked=True)
            if available
            else BookingOutcome(booked=False, reason="Doctor unavailable in requested slot")
        )

        if outcome.booked:
            self._confirm(contact, doctor_id, slot)

        self._audit.record(
            "appointment_booking_attempted",
            {
                "doctor_id": doctor_id,
                "patient_id": contact.patient_id,
                "slot_start": slot.start.isoformat(),
                "slot_end": slot.end.isoformat(),
                "booked": outcome.booked,
                "reason": outcome.reason,
            },
        )
        return outcome

    def _confirm(self, contact: PatientContact, doctor_id: str, slot: Slot) -> None:
        channel = Channel.WHATSAPP if contact.whatsapp_enabled else Channel.SMS
        message = (
            f"Appointment confirmed with {doctor_id} "
            f"on {slot.start:%d %b %Y at %H:%M}"
        )
        self._senders[channel].send(contact.phone, message)
```

The two adapters translate between each vendor's encoding and the abstraction. All vendor-specific knowledge is confined to these classes.

```python
class LegacySoapCalendarAdapter:
    """Adapts the SOAP client. Owns the knowledge that the legacy API returns
    busy periods as Unix timestamps and therefore requires inversion."""

    def __init__(self, soap_client):
        self._client = soap_client

    def is_available(self, doctor_id: str, slot: Slot) -> bool:
        booked_periods = self._client.getDoctorSchedule(doctor_id)
        for period in booked_periods:
            busy = Slot(
                start=datetime.fromtimestamp(period["start_ts"], tz=timezone.utc),
                end=datetime.fromtimestamp(period["end_ts"], tz=timezone.utc),
            )
            if busy.overlaps(slot):
                return False
        return True


class VendorRestCalendar:
    """Adapts the new REST API. Owns the knowledge that this vendor already
    returns free periods, so the logic is containment rather than inversion."""

    def __init__(self, http_client, base_url: str):
        self._http = http_client
        self._base_url = base_url

    def is_available(self, doctor_id: str, slot: Slot) -> bool:
        response = self._http.get(
            f"{self._base_url}/v2/practitioners/{doctor_id}/availability"
        )
        for window in response.json():
            free = Slot(
                start=datetime.fromisoformat(window["from"]),
                end=datetime.fromisoformat(window["to"]),
            )
            if free.start <= slot.start and slot.end <= free.end:
                return True
        return False
```

The composition root performs the migration.

```python
# main.py

def build_appointment_service(config) -> AppointmentService:
    # Before the migration:
    calendar: DoctorCalendar = LegacySoapCalendarAdapter(
        soap_client=SoapClient(config.legacy_wsdl_url)
    )

    # After the migration, this single assignment is replaced:
    # calendar = VendorRestCalendar(
    #     http_client=HttpClient(timeout=5), base_url=config.calendar_base_url
    # )

    return AppointmentService(
        calendar=calendar,
        senders={
            Channel.WHATSAPP: WhatsAppBusinessSender(config.wa_token),
            Channel.SMS: TwilioSender(config.twilio_sid, config.twilio_token),
        },
        audit=DatabaseAuditLog(config.audit_dsn),
    )
```

A test of the booking policy requires no vendor at all.

```python
class AlwaysAvailableCalendar:
    def is_available(self, doctor_id: str, slot: Slot) -> bool:
        return True


class NeverAvailableCalendar:
    def is_available(self, doctor_id: str, slot: Slot) -> bool:
        return False


class RecordingSender:
    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def send(self, phone: str, message: str) -> None:
        self.sent.append((phone, message))


class RecordingAudit:
    def __init__(self) -> None:
        self.events: list[tuple[str, dict]] = []

    def record(self, event: str, payload: dict) -> None:
        self.events.append((event, payload))


def test_refused_booking_sends_no_message_but_is_audited() -> None:
    whatsapp, sms, audit = RecordingSender(), RecordingSender(), RecordingAudit()
    service = AppointmentService(
        calendar=NeverAvailableCalendar(),
        senders={Channel.WHATSAPP: whatsapp, Channel.SMS: sms},
        audit=audit,
    )
    slot = Slot(datetime(2026, 4, 2, 10, 0), datetime(2026, 4, 2, 10, 30))

    outcome = service.book("DOC-11", PatientContact("P-9", "+919812345678", True), slot)

    assert outcome.booked is False
    assert whatsapp.sent == [] and sms.sent == []
    assert audit.events[0][1]["booked"] is False


def test_patient_without_whatsapp_receives_sms() -> None:
    whatsapp, sms, audit = RecordingSender(), RecordingSender(), RecordingAudit()
    service = AppointmentService(
        calendar=AlwaysAvailableCalendar(),
        senders={Channel.WHATSAPP: whatsapp, Channel.SMS: sms},
        audit=audit,
    )
    slot = Slot(datetime(2026, 4, 2, 10, 0), datetime(2026, 4, 2, 10, 30))

    service.book("DOC-11", PatientContact("P-9", "+919812345678", False), slot)

    assert len(sms.sent) == 1
    assert whatsapp.sent == []
```

**Step 4: the combination with the Adapter pattern, and the design decisions.**

The Adapter pattern converts the interface of an existing class into the interface a client expects. Dependency inversion states which interface the client should expect, namely one the client owns and defines. The two work together in a fixed division of labour that is worth memorising, because this pairing is the single most common structural arrangement in production systems that integrate external services.

Dependency inversion determines the direction of the dependency: the policy declares `DoctorCalendar` and the adapters depend on it, so the compile-time arrow points from the vendor code toward the policy.

The Adapter pattern determines the content of the translation: each adapter absorbs one vendor's encoding, protocol, and semantics, and presents the policy's vocabulary.

The result is that vendor-specific knowledge exists in exactly one class per vendor. The two adapters in this solution demonstrate why this matters, because their internal logic is not merely different in syntax but opposite in meaning. The legacy API reports busy periods, so availability is the absence of an overlap. The new API reports free periods, so availability is containment within a window. Had this logic lived in the service, the migration would have required rewriting the booking policy, and the policy's tests would have had to be rewritten with it. Confined to adapters, the migration changes one class and one assignment, and the booking policy's tests are untouched and continue to serve as evidence that the policy still works.

The remaining design decisions are as follows.

*The abstraction declares a predicate rather than a schedule accessor.* This is the decision that makes the one-line migration possible, and it follows from asking what the policy decides rather than what the vendor offers. A general formulation of the technique: define the abstraction as the question the policy asks, not as the data the provider holds.

*Channel selection uses a mapping rather than a conditional chain over sender classes.* The policy decides which channel applies, which is a business rule, and then looks up the sender for that channel, which is a configuration concern. Adding a third channel requires adding an enumeration member and a mapping entry at the composition root, with the rule for choosing it being the only edit inside the policy. Had the policy held `self._whatsapp` and `self._sms` as separate fields, each new channel would add a constructor parameter to a class that has no interest in transport.

*Audit recording occurs on both paths and is written once.* The requirement states that every attempt is recorded, and placing the single `record` call after both branches makes it structurally impossible for a future edit to add a refusal path that skips auditing. Compliance requirements of this kind are best expressed as code that has no alternative path, rather than as a call duplicated in each branch.

*`BookingOutcome` is returned rather than an exception being raised on refusal.* An unavailable slot is an expected result of a booking request, and the caller, most likely a web handler, must render it as a message to the user rather than as an error. This is the same contract-widening reasoning applied in Problem D.3, and it appears here to show that the technique is not specific to the Liskov principle.

---

### Section F review

| Problem | Domain | Level | Central lesson |
|---|---|---|---|
| F.1 | Notifications | 1 | A dependency constructed in `__init__` removes the seam, and the failure occurs before any logic runs |
| F.2 | Reporting | 2 | Define abstractions from the caller's needs. Fakes that record enable assertions impossible before the refactor. |
| F.3 | Hospital scheduling | 3 | Declare the abstraction as the question the policy asks. Confine each vendor's semantics to one adapter. |

| Injection style | Mechanism | Appropriate when |
|---|---|---|
| Constructor injection | Collaborators are parameters of `__init__` and stored as private fields | The dependency is required for the object's entire life. This is the default and covers the large majority of cases. |
| Method injection | The collaborator is a parameter of the method that uses it | The collaborator varies per call, or is needed by only one of many methods |
| Setter injection | A property or setter assigns the collaborator after construction | The dependency is genuinely optional, or a cycle must be broken. Use sparingly, because it permits an object to exist in an incompletely configured state. |

---

## 9. Section G: Combined Violations

The preceding sections isolated one principle at a time, which is necessary for learning and is unrepresentative of practice. Code written under delivery pressure violates several principles simultaneously, and the violations interact: a responsibility defect creates the conditions for a dependency defect, and an over-broad interface produces substitution failures in every consumer.

This section requires a different working method. For each problem, produce a numbered diagnosis naming every violation separately, with the specific evidence for each, before writing any code. Then perform the corrections in an order justified by dependency between them. The order that works in nearly all cases is the following.

1. **Separate responsibilities first.** This is what produces the classes into which the remaining corrections can be applied. Attempting to inject dependencies into a class that holds four responsibilities produces a constructor with eight parameters, which is a symptom that the first step was skipped.
2. **Correct interface breadth second.** This resolves the substitution failures, because most of them were caused by implementers being obliged to declare capability they lack.
3. **Introduce abstractions for extension points third.** With responsibilities separated, the conditional chains are now visible in single-purpose classes where the correct abstraction is obvious.
4. **Invert the infrastructure dependencies last.** By this point the seams are apparent, and each newly separated class needs only the one or two collaborators relevant to its own responsibility.

---

### Problem G.1 (Level 2 to 3)

The following class is the entirety of a small library management application.

```python
class LibrarySystem:
    def __init__(self):
        self.books = {}
        self.db_conn = MySQLConnector("localhost", "library_db")

    def add_book(self, isbn, title, author, copies):
        self.books[isbn] = {"title": title, "author": author, "copies": copies}
        self.db_conn.execute(
            f"INSERT INTO books VALUES ('{isbn}', '{title}', {copies})"
        )

    def borrow_book(self, isbn, member_id):
        if isbn not in self.books or self.books[isbn]["copies"] < 1:
            print("Not available")
            return
        self.books[isbn]["copies"] -= 1
        self.db_conn.execute(
            f"UPDATE books SET copies=copies-1 WHERE isbn='{isbn}'"
        )
        print(f"Email sent to member {member_id}: you borrowed {self.books[isbn]['title']}")
        with open("library.log", "a") as f:
            f.write(f"Member {member_id} borrowed {isbn}\n")

    def generate_report(self, report_type):
        if report_type == "available":
            return {k: v for k, v in self.books.items() if v["copies"] > 0}
        elif report_type == "unavailable":
            return {k: v for k, v in self.books.items() if v["copies"] == 0}
        elif report_type == "all":
            return self.books
```

**Required:**

1. Produce a numbered diagnosis. Name each violation, cite the evidence, and state the consequence.
2. Refactor the system. Map each change back to a numbered item in the diagnosis.
3. Note the defects present that are not violations of design principles.
4. Write one test demonstrating the borrowing rule in isolation.

---

### Solution G.1

**Diagnosis.**

**Violation 1: Single Responsibility Principle.** The class holds four responsibilities. Book inventory state is held in `self.books`. Persistence is performed by `self.db_conn.execute` calls embedded in two methods. Member notification is performed by the `print` statement in `borrow_book`. Audit logging is performed by the file write in the same method. Reporting is performed by `generate_report`, which is arguably a fifth. The consequence is that a change of mail provider, a change of database schema, a change of log destination, and a change of reporting requirement all arrive at this one class, and the borrowing rule, which is the only business logic in the file, cannot be modified without touching code that also writes files and executes SQL.

**Violation 2: Open/Closed Principle.** `generate_report` selects behaviour by a conditional chain on `report_type`. The consequence is that each new report, for example books by a given author or books overdue, requires editing a method that already serves three working reports. The chain has no `else` clause, so an unrecognised report type returns `None` silently, which is a defect the structure invites.

**Violation 3: Dependency Inversion Principle.** `MySQLConnector` is constructed inside `__init__` with a hard-coded host and database name, and the file path `library.log` is hard-coded in `borrow_book`. The consequence is that the borrowing rule cannot be exercised without a running MySQL server and a writable working directory, so the most important logic in the application has no automated verification.

**Violation 4: Single Responsibility Principle applied to state, listed separately because its correction differs.** The inventory is held in two places at once, in the in-memory dictionary and in the database, and the two are updated by separate statements with no transaction. If the `UPDATE` fails, the in-memory count has already been decremented, and the two representations diverge with no mechanism for reconciliation. This is a consequence of the class owning both the state and its persistence.

**Violation 5: Interface Segregation and Liskov are not violated here,** because the code declares no abstractions at all. This is worth stating explicitly, because a diagnosis should report what is absent as well as what is defective. A codebase with no interfaces cannot violate the interface principles, and it also cannot be extended or tested.

**Refactoring.**

The corrections follow the order given at the head of this section. Responsibilities are separated first, which produces the classes into which the abstractions and injections are then applied.

```python
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Protocol


# Addresses Violation 1: the book record is data, with no behaviour beyond
# its own invariants.
@dataclass
class Book:
    isbn: str
    title: str
    author: str
    copies: int

    @property
    def is_available(self) -> bool:
        return self.copies > 0

    def take_one(self) -> None:
        if not self.is_available:
            raise ValueError(f"No copies of {self.isbn} available")
        self.copies -= 1

    def return_one(self) -> None:
        self.copies += 1


# Addresses Violations 1 and 3: persistence is an abstraction owned by the
# library policy, and the in-memory dictionary is gone. There is now one
# source of truth.
class BookRepository(Protocol):
    def add(self, book: Book) -> None: ...

    def get(self, isbn: str) -> Book | None: ...

    def update(self, book: Book) -> None: ...

    def all_books(self) -> list[Book]: ...


class MySQLBookRepository:
    """The only class in the system that knows SQL. Uses parameter binding,
    which also closes the injection defect noted below."""

    def __init__(self, connector):
        self._conn = connector

    def add(self, book: Book) -> None:
        self._conn.execute(
            "INSERT INTO books (isbn, title, author, copies) VALUES (%s, %s, %s, %s)",
            (book.isbn, book.title, book.author, book.copies),
        )

    def get(self, isbn: str) -> Book | None:
        row = self._conn.fetch_one("SELECT * FROM books WHERE isbn = %s", (isbn,))
        return Book(**row) if row else None

    def update(self, book: Book) -> None:
        self._conn.execute(
            "UPDATE books SET copies = %s WHERE isbn = %s", (book.copies, book.isbn)
        )

    def all_books(self) -> list[Book]:
        return [Book(**row) for row in self._conn.fetch_all("SELECT * FROM books")]


class InMemoryBookRepository:
    """Satisfies the same protocol. Used by tests and by local development,
    which is what makes the borrowing rule verifiable without a database."""

    def __init__(self) -> None:
        self._books: dict[str, Book] = {}

    def add(self, book: Book) -> None:
        self._books[book.isbn] = book

    def get(self, isbn: str) -> Book | None:
        return self._books.get(isbn)

    def update(self, book: Book) -> None:
        self._books[book.isbn] = book

    def all_books(self) -> list[Book]:
        return list(self._books.values())


# Addresses Violations 1 and 3: notification and audit become abstractions,
# so neither a mail vendor nor a file path appears in the policy.
class MemberNotifier(Protocol):
    def notify(self, member_id: str, message: str) -> None: ...


class AuditLog(Protocol):
    def record(self, event: str, payload: dict[str, Any]) -> None: ...


class EmailNotifier:
    def __init__(self, mail_client):
        self._client = mail_client

    def notify(self, member_id: str, message: str) -> None:
        self._client.send(to=member_id, subject="Library", body=message)


class FileAuditLog:
    def __init__(self, path: str):
        self._path = path

    def record(self, event: str, payload: dict[str, Any]) -> None:
        with open(self._path, "a") as handle:
            handle.write(f"{event} {payload}\n")


# Addresses Violation 2: each report becomes a class implementing a common
# abstraction, and the conditional chain disappears.
class Report(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def rows(self, books: list[Book]) -> list[Book]: ...


class AvailableBooksReport(Report):
    @property
    def name(self) -> str:
        return "available"

    def rows(self, books: list[Book]) -> list[Book]:
        return [b for b in books if b.is_available]


class UnavailableBooksReport(Report):
    @property
    def name(self) -> str:
        return "unavailable"

    def rows(self, books: list[Book]) -> list[Book]:
        return [b for b in books if not b.is_available]


class FullCatalogueReport(Report):
    @property
    def name(self) -> str:
        return "all"

    def rows(self, books: list[Book]) -> list[Book]:
        return list(books)


class ReportService:
    """Closed against new reports. Adding a report means adding a class and
    registering it, with no edit to this class."""

    def __init__(self, repository: BookRepository, reports: list[Report]):
        self._repository = repository
        self._reports = {r.name: r for r in reports}

    def run(self, report_name: str) -> list[Book]:
        try:
            report = self._reports[report_name]
        except KeyError:
            raise ValueError(f"Unknown report: {report_name}") from None
        return report.rows(self._repository.all_books())


# Addresses Violation 1: the policy holds the borrowing rule and the sequence
# of collaborations, and nothing else.
@dataclass(frozen=True)
class BorrowResult:
    succeeded: bool
    reason: str = ""


class LendingService:
    def __init__(
        self,
        repository: BookRepository,
        notifier: MemberNotifier,
        audit: AuditLog,
    ):
        self._repository = repository
        self._notifier = notifier
        self._audit = audit

    def add_book(self, book: Book) -> None:
        self._repository.add(book)

    def borrow(self, isbn: str, member_id: str) -> BorrowResult:
        book = self._repository.get(isbn)
        if book is None:
            result = BorrowResult(False, "No such book")
        elif not book.is_available:
            result = BorrowResult(False, "No copies available")
        else:
            book.take_one()
            self._repository.update(book)
            self._notifier.notify(member_id, f"You borrowed {book.title}")
            result = BorrowResult(True)

        self._audit.record(
            "borrow_attempted",
            {"isbn": isbn, "member_id": member_id, "succeeded": result.succeeded},
        )
        return result
```

The composition root assembles the system and is the only module naming concrete infrastructure.

```python
# main.py

def build_services(config):
    repository = MySQLBookRepository(MySQLConnector(config.db_host, config.db_name))
    lending = LendingService(
        repository=repository,
        notifier=EmailNotifier(SmtpClient(config.smtp_host)),
        audit=FileAuditLog(config.audit_path),
    )
    reports = ReportService(
        repository=repository,
        reports=[AvailableBooksReport(), UnavailableBooksReport(), FullCatalogueReport()],
    )
    return lending, reports
```

**Mapping of corrections to the diagnosis.**

| Diagnosis item | Correction | Result |
|---|---|---|
| 1: four responsibilities | Split into `Book`, `BookRepository`, `MemberNotifier`, `AuditLog`, `ReportService`, `LendingService` | Each class has one reason to change. The borrowing rule occupies eight lines that touch no infrastructure. |
| 2: report conditional chain | `Report` abstraction with three implementations and a registry | A new report is a new class plus one registration entry |
| 3: hard-wired MySQL and file path | Constructor injection of three abstractions, selection moved to the composition root | The policy is testable and the database is replaceable |
| 4: duplicated state | The in-memory dictionary removed; the repository is the single source of truth | Divergence between two representations is no longer representable |
| 5: no abstractions present | Four abstractions introduced, each defined by a client's need | Extension and substitution become possible |

**Answer to question 3: defects that are not principle violations.**

Three defects in the original are serious and are not design-principle violations. They are listed because a diagnosis limited to principles is an incomplete review, and because an interview answer that notices them demonstrates a broader competence.

The `INSERT` and `UPDATE` statements interpolate values into SQL with f-strings, which is a SQL injection vulnerability. A title containing a single quote corrupts the statement, and a maliciously chosen title executes arbitrary SQL. The corrected repository uses parameter binding.

`borrow_book` reports failure by printing to standard output and returning `None`, so a caller cannot distinguish success from failure. The corrected version returns a `BorrowResult`.

The two writes in `borrow_book`, to memory and to the database, are not atomic, and `add_book` has the same defect. Removing the duplicate state resolves it here, but in a system where a borrow updated two tables, an explicit transaction boundary would be required, and it would belong in the repository rather than in the policy.

**Test of the borrowing rule in isolation.**

```python
class RecordingNotifier:
    def __init__(self) -> None:
        self.messages: list[tuple[str, str]] = []

    def notify(self, member_id: str, message: str) -> None:
        self.messages.append((member_id, message))


class RecordingAudit:
    def __init__(self) -> None:
        self.events: list[tuple[str, dict]] = []

    def record(self, event: str, payload: dict) -> None:
        self.events.append((event, payload))


def test_last_copy_can_be_borrowed_and_the_next_request_is_refused() -> None:
    repository = InMemoryBookRepository()
    repository.add(Book("978-0132350884", "Clean Code", "Martin", copies=1))
    notifier, audit = RecordingNotifier(), RecordingAudit()
    service = LendingService(repository, notifier, audit)

    first = service.borrow("978-0132350884", "M-100")
    second = service.borrow("978-0132350884", "M-101")

    assert first.succeeded is True
    assert second.succeeded is False and second.reason == "No copies available"
    assert repository.get("978-0132350884").copies == 0
    assert len(notifier.messages) == 1
    assert len(audit.events) == 2, "Both attempts must be audited"
```

The test requires no database, no mail server, and no filesystem, runs in under a millisecond, and asserts on the boundary condition most likely to contain a defect. None of it was possible before the refactor.

---

### Problem G.2 (Level 3)

The following is the device layer of a home automation system.

```python
from abc import ABC, abstractmethod


class SmartDevice(ABC):
    @abstractmethod
    def turn_on(self) -> None: ...

    @abstractmethod
    def turn_off(self) -> None: ...

    @abstractmethod
    def set_brightness(self, level: int) -> None: ...

    @abstractmethod
    def set_target_temperature(self, celsius: float) -> None: ...

    @abstractmethod
    def start_recording(self) -> None: ...

    @abstractmethod
    def battery_percentage(self) -> int: ...


class SmartBulb(SmartDevice):
    def __init__(self, device_id: str):
        self.device_id = device_id
        self._on = False
        self._brightness = 100

    def turn_on(self) -> None:
        self._on = True

    def turn_off(self) -> None:
        self._on = False

    def set_brightness(self, level: int) -> None:
        self._brightness = level

    def set_target_temperature(self, celsius: float) -> None:
        raise NotImplementedError("A bulb has no thermostat")

    def start_recording(self) -> None:
        raise NotImplementedError("A bulb has no camera")

    def battery_percentage(self) -> int:
        raise NotImplementedError("Mains powered")


class SmartThermostat(SmartDevice):
    def __init__(self, device_id: str):
        self.device_id = device_id
        self._on = False
        self._target = 22.0

    def turn_on(self) -> None:
        self._on = True

    def turn_off(self) -> None:
        self._on = False

    def set_brightness(self, level: int) -> None:
        raise NotImplementedError("A thermostat has no lamp")

    def set_target_temperature(self, celsius: float) -> None:
        self._target = celsius

    def start_recording(self) -> None:
        raise NotImplementedError("A thermostat has no camera")

    def battery_percentage(self) -> int:
        raise NotImplementedError("Mains powered")


class SecurityCamera(SmartDevice):
    def __init__(self, device_id: str):
        self.device_id = device_id
        self._on = False
        self._battery = 87

    def turn_on(self) -> None:
        self._on = True

    def turn_off(self) -> None:
        self._on = False

    def set_brightness(self, level: int) -> None:
        raise NotImplementedError("Use set_ir_level instead")

    def set_target_temperature(self, celsius: float) -> None:
        raise NotImplementedError("A camera has no thermostat")

    def start_recording(self) -> None:
        print(f"{self.device_id} recording")

    def battery_percentage(self) -> int:
        return self._battery


class HomeController:
    def __init__(self):
        self.devices = [
            SmartBulb("bulb-1"),
            SmartThermostat("therm-1"),
            SecurityCamera("cam-1"),
        ]

    def activate_night_mode(self) -> None:
        for device in self.devices:
            if isinstance(device, SmartBulb):
                device.set_brightness(15)
            elif isinstance(device, SmartThermostat):
                device.set_target_temperature(19.0)
            elif isinstance(device, SecurityCamera):
                device.turn_on()
                device.start_recording()

    def low_battery_alerts(self) -> list[str]:
        alerts = []
        for device in self.devices:
            try:
                if device.battery_percentage() < 20:
                    alerts.append(device.device_id)
            except NotImplementedError:
                pass
        return alerts
```

**Required:**

1. Produce a numbered diagnosis of every violation.
2. Refactor the device layer and the controller.
3. Show what happens to the `isinstance` chain and to the exception handler, and explain why each disappears.
4. State the design decisions, including how a new device type is added.

---

### Solution G.2

**Diagnosis.**

**Violation 1: Interface Segregation Principle.** `SmartDevice` declares six capabilities and no implementer possesses more than four. The evidence is eleven methods across three classes whose entire body raises `NotImplementedError`. The interface was written by listing everything any device might do, which is the implementer-defined construction that the principle prohibits.

**Violation 2: Liskov Substitution Principle.** Every implementer raises an exception type the base contract does not declare, for methods the base contract promises unconditionally. Any consumer holding a `SmartDevice` and calling `set_brightness` fails for two of the three device types. The evidence that this violation is causing real damage is the `try` and `except NotImplementedError` block in `low_battery_alerts`, which is a consumer defending itself against its own declared type.

**Violation 3: Dependency Inversion Principle.** `HomeController.__init__` constructs three concrete device objects with hard-coded identifiers. The consequence is that the night-mode policy cannot be tested without instantiating real device classes, and the set of devices in a home is fixed in source code rather than being configuration.

**Violation 4: Open/Closed Principle.** `activate_night_mode` selects behaviour with a chain of `isinstance` checks on concrete classes. Adding a smart lock, a smart blind, or a second kind of camera requires editing this method, and each new device type also requires editing `SmartDevice` and therefore every existing device class.

**Violation 5: Single Responsibility Principle.** `HomeController` owns the device registry, the night-mode policy, and the battery-monitoring policy. These change for different reasons: night mode is a user preference, battery alerting is an operational concern, and the registry is configuration.

The violations are causally linked, and stating the chain is the substance of a good diagnosis. The fat interface, Violation 1, forces implementers to raise, which produces Violation 2. Because a `SmartDevice` reference cannot be trusted, consumers must determine the concrete type before acting, which produces the `isinstance` chain of Violation 4. The chain is only writable because the controller knows every concrete class, which is Violation 3. Correcting Violation 1 removes the others.

**Refactoring.**

```python
from __future__ import annotations

from typing import Iterable, Protocol, runtime_checkable


@runtime_checkable
class Switchable(Protocol):
    @property
    def device_id(self) -> str: ...

    def turn_on(self) -> None: ...

    def turn_off(self) -> None: ...


@runtime_checkable
class Dimmable(Protocol):
    @property
    def device_id(self) -> str: ...

    def set_brightness(self, level: int) -> None: ...


@runtime_checkable
class ClimateControl(Protocol):
    @property
    def device_id(self) -> str: ...

    def set_target_temperature(self, celsius: float) -> None: ...


@runtime_checkable
class Recordable(Protocol):
    @property
    def device_id(self) -> str: ...

    def start_recording(self) -> None: ...

    def stop_recording(self) -> None: ...


@runtime_checkable
class BatteryPowered(Protocol):
    @property
    def device_id(self) -> str: ...

    def battery_percentage(self) -> int: ...
```

Each device now declares only what it can honour, and every method body is real.

```python
class SmartBulb:
    """Switchable and Dimmable. Mains powered, therefore not BatteryPowered,
    and that fact is now expressed in the type rather than in an exception."""

    def __init__(self, device_id: str):
        self._device_id = device_id
        self._on = False
        self._brightness = 100

    @property
    def device_id(self) -> str:
        return self._device_id

    def turn_on(self) -> None:
        self._on = True

    def turn_off(self) -> None:
        self._on = False

    def set_brightness(self, level: int) -> None:
        if not 0 <= level <= 100:
            raise ValueError("Brightness must be between 0 and 100")
        self._brightness = level


class SmartThermostat:
    """Switchable and ClimateControl."""

    def __init__(self, device_id: str):
        self._device_id = device_id
        self._on = False
        self._target = 22.0

    @property
    def device_id(self) -> str:
        return self._device_id

    def turn_on(self) -> None:
        self._on = True

    def turn_off(self) -> None:
        self._on = False

    def set_target_temperature(self, celsius: float) -> None:
        self._target = celsius


class SecurityCamera:
    """Switchable, Recordable, BatteryPowered. Note that it is not Dimmable,
    which removes the original class's misleading suggestion that brightness
    and infrared level are the same capability."""

    def __init__(self, device_id: str, battery: int = 87):
        self._device_id = device_id
        self._on = False
        self._recording = False
        self._battery = battery

    @property
    def device_id(self) -> str:
        return self._device_id

    def turn_on(self) -> None:
        self._on = True

    def turn_off(self) -> None:
        self._on = False

    def start_recording(self) -> None:
        self._recording = True

    def stop_recording(self) -> None:
        self._recording = False

    def battery_percentage(self) -> int:
        return self._battery
```

The controller is split into a registry and two policies, each depending on the narrowest capability it requires.

```python
class DeviceRegistry:
    """Owns the set of devices and answers capability queries. The only place
    in the system that performs type inspection, and it does so against
    protocols rather than concrete classes."""

    def __init__(self, devices: Iterable[object]):
        self._devices = list(devices)

    def dimmable(self) -> list[Dimmable]:
        return [d for d in self._devices if isinstance(d, Dimmable)]

    def climate(self) -> list[ClimateControl]:
        return [d for d in self._devices if isinstance(d, ClimateControl)]

    def recordable(self) -> list[Recordable]:
        return [d for d in self._devices if isinstance(d, Recordable)]

    def battery_powered(self) -> list[BatteryPowered]:
        return [d for d in self._devices if isinstance(d, BatteryPowered)]

    def switchable(self) -> list[Switchable]:
        return [d for d in self._devices if isinstance(d, Switchable)]


class NightModePolicy:
    """One responsibility: the definition of night mode. Depends on the
    registry, not on any device class."""

    def __init__(self, registry: DeviceRegistry, brightness: int = 15, temperature: float = 19.0):
        self._registry = registry
        self._brightness = brightness
        self._temperature = temperature

    def activate(self) -> None:
        for lamp in self._registry.dimmable():
            lamp.set_brightness(self._brightness)
        for unit in self._registry.climate():
            unit.set_target_temperature(self._temperature)
        for camera in self._registry.recordable():
            camera.start_recording()


class BatteryMonitor:
    """One responsibility: reporting devices needing attention. Depends only
    on BatteryPowered, so mains-powered devices are structurally invisible
    to it."""

    def __init__(self, registry: DeviceRegistry, threshold: int = 20):
        self._registry = registry
        self._threshold = threshold

    def low_battery_devices(self) -> list[str]:
        return [
            d.device_id
            for d in self._registry.battery_powered()
            if d.battery_percentage() < self._threshold
        ]
```

The composition root supplies the devices, which now come from configuration rather than from a constructor body.

```python
# main.py

def build_home(device_config) -> tuple[NightModePolicy, BatteryMonitor]:
    registry = DeviceRegistry([
        SmartBulb("bulb-living-room"),
        SmartBulb("bulb-hall"),
        SmartThermostat("therm-main"),
        SecurityCamera("cam-porch", battery=14),
    ])
    return NightModePolicy(registry), BatteryMonitor(registry)
```

**Answer to question 3.**

The `isinstance` chain in `activate_night_mode` disappears because the question it was asking has changed. It asked which concrete class this object belongs to, in order to infer what may safely be called. The refactored policy asks which devices can be dimmed, and the answer is supplied by the registry as a typed list. The distinction is between branching on identity, which must be extended for every new type, and selecting by capability, which does not. A smart blind that implements `Dimmable` is picked up by `NightModePolicy` with no edit to the policy, because it appears in `registry.dimmable()` by virtue of its structure.

The `except NotImplementedError` handler disappears because the condition it was catching no longer exists. It was present because `battery_percentage` was declared on all devices and honoured by one, so the consumer had to attempt the call to discover whether it was valid. After the refactor, `registry.battery_powered()` returns only devices that genuinely report a battery level, so every call in the comprehension is valid by construction. The general form of this improvement is worth stating: an exception handler that exists to discover a static fact about a collaborator is evidence of an interface breadth defect, and correcting the interface deletes the handler.

**Answer to question 4: design decisions.**

*Type inspection is confined to the registry, and is performed against protocols.* Some runtime capability discovery is unavoidable in a system whose device set is configuration, and the design does not pretend otherwise. What it does is place all of it in one class, perform it against structural types rather than concrete classes, and expose the results as typed collections. A new device type therefore requires no change to `DeviceRegistry`, because a class satisfying `Dimmable` is recognised without being enumerated anywhere.

*The `device_id` property is repeated in each protocol rather than being factored into a common base.* A shared `Device` base protocol declaring only `device_id` would be defensible and would reduce the repetition. It is avoided here because the protocols are consumed independently and a common base tends to attract additional members over time, which is how the original fat interface came into existence. The repetition of a single read-only property is a lower cost than reopening that path.

*Night mode is a policy class with configurable values rather than hard-coded constants.* The brightness and temperature applied by night mode are user preferences that will be made adjustable, and passing them to the constructor anticipates that at negligible cost.

*Adding a new device type requires no edit to any existing class.* A smart lock is added by writing a class that implements `Switchable` and a new `Lockable` protocol, adding a `lockable()` accessor to the registry if a policy needs to select locks, and registering the instance at the composition root. Under the original design the same addition required editing `SmartDevice`, all three existing device classes, and both controller methods, which is seven files for one feature.

---

### Section G review

| Problem | Domain | Violations | Central lesson |
|---|---|---|---|
| G.1 | Library management | SRP, OCP, DIP, duplicated state | Separate responsibilities first. The other corrections become obvious once single-purpose classes exist. |
| G.2 | Home automation | ISP, LSP, DIP, OCP, SRP | An `isinstance` chain and an exception handler guarding against a declared type are both symptoms of interface breadth |

---

## 10. Section H: Capstone Refactor

This is the most demanding problem in the workbook and is comparable in scope to a low-level design interview of 45 to 60 minutes. It violates all five principles, and it contains defects of correctness alongside defects of design, which is representative of code that has grown under delivery pressure.

Complete all four required parts before reading the solution. Producing the diagnosis in writing before touching the code is not optional at this level, because the value of the exercise lies in the disentangling rather than in the typing.

---

### Problem H.1

The following class is the entire booking layer of a cinema ticketing application.

```python
import psycopg2
from twilio.rest import Client


class CinemaBookingSystem:
    def __init__(self):
        self.shows = {}
        self.bookings = {}
        self.conn = psycopg2.connect(
            host="prod-cinema.internal", dbname="cinema", user="app", password="p@ssw0rd"
        )
        self.sms = Client("AC91f2b7", "5d3e0a8c17")

    def add_show(self, show_id, movie, screen, start_time, seats_available):
        self.shows[show_id] = {
            "movie": movie,
            "screen": screen,
            "start": start_time,
            "seats": seats_available,
        }

    def book(self, show_id, customer_name, phone, seat_count, ticket_type):
        show = self.shows.get(show_id)
        if show is None:
            print("No such show")
            return None
        if show["seats"] < seat_count:
            print("Not enough seats")
            return None

        if ticket_type == "standard":
            price = 180.0 * seat_count
            convenience = 20.0 * seat_count
        elif ticket_type == "premium":
            price = 320.0 * seat_count
            convenience = 35.0 * seat_count
            if seat_count >= 4:
                price = price * 0.9
        elif ticket_type == "recliner":
            price = 550.0 * seat_count
            convenience = 50.0 * seat_count
        else:
            print("Unknown ticket type")
            return None

        gst = (price + convenience) * 0.18
        total = price + convenience + gst

        booking_id = f"BK{len(self.bookings) + 1:05d}"
        show["seats"] -= seat_count
        self.bookings[booking_id] = {
            "show": show_id,
            "name": customer_name,
            "phone": phone,
            "count": seat_count,
            "type": ticket_type,
            "total": total,
        }

        cur = self.conn.cursor()
        cur.execute(
            f"INSERT INTO bookings VALUES ('{booking_id}', '{show_id}', "
            f"'{customer_name}', {seat_count}, {total})"
        )
        self.conn.commit()

        self.sms.messages.create(
            to=phone,
            from_="+14155551234",
            body=f"Booking {booking_id} confirmed for {show['movie']}. Total Rs {total}",
        )

        with open("/var/log/cinema/audit.log", "a") as f:
            f.write(f"BOOKED {booking_id} {customer_name} {seat_count} {total}\n")

        return booking_id

    def generate_invoice(self, booking_id):
        b = self.bookings.get(booking_id)
        if b is None:
            return None
        show = self.shows[b["show"]]
        base = b["total"] / 1.18
        gst = b["total"] - base
        text = (
            f"INVOICE {booking_id}\n"
            f"Movie: {show['movie']}   Screen: {show['screen']}\n"
            f"Customer: {b['name']}\n"
            f"Seats: {b['count']} ({b['type']})\n"
            f"Base: {base:.2f}\nGST: {gst:.2f}\nTotal: {b['total']:.2f}\n"
        )
        with open(f"/var/invoices/{booking_id}.txt", "w") as f:
            f.write(text)
        return text
```

**Required:**

1. Identify every violation by name, citing the specific lines or methods that constitute the evidence, and state the consequence of each.
2. Present the corrected design as a table of classes, responsibilities, and the abstractions each implements.
3. Implement the refactored system.
4. Write tests proving that a booking can be exercised with no database, no SMS provider, and no filesystem.
5. State what the refactored system makes possible that the original did not, in operational terms.

---

### Solution H.1

**Part 1: diagnosis.**

**Violation 1: Single Responsibility Principle.** `book` performs seven distinct activities: show lookup, seat availability checking, price calculation, tax calculation, identifier generation, persistence, SMS dispatch, and audit logging. The consequence is that a change to the goods and services tax rate, a change of SMS vendor, and a change to the audit format all require editing the method that contains the seat availability rule. The method is 45 lines and has eleven reasons to change.

**Violation 2: Single Responsibility Principle in `generate_invoice`.** The method computes the tax split, formats the document, and writes it to a filesystem path. The consequence is visible as a correctness defect discussed under Violation 6: the arithmetic is performed a second time, in a second place, by reversing the original calculation.

**Violation 3: Open/Closed Principle.** Pricing is selected by a conditional chain on `ticket_type`, and each branch contains a different rule, including a bulk discount that applies to premium tickets only. The consequence is that adding an IMAX tier, a matinee price, or a weekday discount requires editing a method that also books seats and sends messages, so a pricing change carries the risk of breaking the booking flow.

**Violation 4: Dependency Inversion Principle.** The constructor establishes a live PostgreSQL connection and a Twilio client, and `book` and `generate_invoice` write to hard-coded absolute filesystem paths. The consequence is that no part of this class can be instantiated in a test environment, so the pricing rules, the tax calculation, and the seat availability rule have no automated verification. Credentials are additionally embedded in source.

**Violation 5: Interface Segregation and Liskov Substitution.** The class declares no abstractions, so no interface can be too broad and no subtype can fail to substitute. This is a violation by absence rather than by construction, and its practical consequence is identical to the consequence of the other kind: nothing can be substituted, so nothing can be tested or replaced. A complete diagnosis states this rather than reporting that the two principles are satisfied.

**Violation 6: defects of correctness, listed because a design review that omits them is incomplete.**

The `INSERT` statement interpolates a customer-supplied name into SQL, which is an injection vulnerability. A customer named `O'Brien` corrupts the statement and a maliciously named booking executes arbitrary SQL.

`generate_invoice` recovers the base amount by dividing the stored total by 1.18. This reverses the tax calculation rather than recording it, and it produces a wrong answer for the premium bulk discount case because the discount was applied before tax and is not recoverable from the total alone. The convenience fee is also silently folded into the base line of the invoice. Storing a computed total without its components is what makes the error possible.

Seat inventory is decremented in memory and separately inserted into the database with no transaction. If the `INSERT` fails, the seats are already gone from the in-memory count and the booking does not exist in the database.

Failures are reported by printing and returning `None`, so a caller cannot distinguish an unknown show from insufficient seats from an unknown ticket type.

The booking identifier is derived from the length of the in-memory dictionary, which produces duplicates on restart and on any concurrent booking.

**Part 2: the corrected design.**

| Class | Responsibility | Abstraction implemented |
|---|---|---|
| `Show` | Show data and the seat inventory invariant | Data class with behaviour |
| `TicketType` | Enumeration of tiers | Enumeration |
| `PriceBreakdown` | Immutable record of every pricing component | Data class |
| `Booking` | Immutable record of a completed booking | Data class |
| `PricingRule` | Contract for computing a price for a tier | Abstraction |
| `StandardPricing`, `PremiumPricing`, `ReclinerPricing` | One tier's rule each | `PricingRule` |
| `TaxPolicy` | Applies the applicable tax to a subtotal | Abstraction plus `GstPolicy` |
| `PriceCalculator` | Assembles a full breakdown from a rule and a tax policy | Concrete, closed against new tiers |
| `BookingRepository` | Persistence of bookings and shows | Abstraction plus `PostgresBookingRepository` and `InMemoryBookingRepository` |
| `BookingIdGenerator` | Produces unique identifiers | Abstraction plus `UuidBookingIdGenerator` |
| `MessageSender` | Delivers a confirmation to a phone number | Abstraction plus `TwilioSender` |
| `AuditLog` | Records booking events | Abstraction plus `FileAuditLog` |
| `InvoiceRenderer` | Converts a booking and a breakdown into a document | Abstraction plus `TextInvoiceRenderer` |
| `DocumentStore` | Persists a rendered document | Abstraction plus `FileDocumentStore` |
| `BookingService` | Coordinates the booking sequence | Concrete policy, depends only on abstractions |
| `InvoiceService` | Coordinates rendering and storage | Concrete policy, depends only on abstractions |

**Part 3: implementation.**

```python
from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, replace
from datetime import datetime
from enum import Enum
from typing import Any, Protocol


class TicketType(Enum):
    STANDARD = "standard"
    PREMIUM = "premium"
    RECLINER = "recliner"


@dataclass
class Show:
    show_id: str
    movie: str
    screen: str
    start: datetime
    seats_available: int

    def can_accommodate(self, seat_count: int) -> bool:
        return 0 < seat_count <= self.seats_available

    def reserve(self, seat_count: int) -> None:
        if not self.can_accommodate(seat_count):
            raise ValueError(f"Cannot reserve {seat_count} seats on {self.show_id}")
        self.seats_available -= seat_count


@dataclass(frozen=True)
class PriceBreakdown:
    """Every component is stored, so no downstream consumer needs to reverse
    the arithmetic. This closes the invoice defect at its source."""

    ticket_subtotal: float
    discount: float
    convenience_fee: float
    tax: float

    @property
    def taxable_amount(self) -> float:
        return self.ticket_subtotal - self.discount + self.convenience_fee

    @property
    def total(self) -> float:
        return round(self.taxable_amount + self.tax, 2)


@dataclass(frozen=True)
class Booking:
    booking_id: str
    show_id: str
    customer_name: str
    phone: str
    seat_count: int
    ticket_type: TicketType
    breakdown: PriceBreakdown


@dataclass(frozen=True)
class BookingOutcome:
    booking: Booking | None
    reason: str = ""

    @property
    def succeeded(self) -> bool:
        return self.booking is not None


# ---------- Pricing: open for new tiers ----------

class PricingRule(ABC):
    @property
    @abstractmethod
    def ticket_type(self) -> TicketType: ...

    @abstractmethod
    def subtotal(self, seat_count: int) -> float: ...

    @abstractmethod
    def discount(self, seat_count: int, subtotal: float) -> float: ...

    @abstractmethod
    def convenience_fee(self, seat_count: int) -> float: ...


class StandardPricing(PricingRule):
    @property
    def ticket_type(self) -> TicketType:
        return TicketType.STANDARD

    def subtotal(self, seat_count: int) -> float:
        return 180.0 * seat_count

    def discount(self, seat_count: int, subtotal: float) -> float:
        return 0.0

    def convenience_fee(self, seat_count: int) -> float:
        return 20.0 * seat_count


class PremiumPricing(PricingRule):
    @property
    def ticket_type(self) -> TicketType:
        return TicketType.PREMIUM

    def subtotal(self, seat_count: int) -> float:
        return 320.0 * seat_count

    def discount(self, seat_count: int, subtotal: float) -> float:
        return subtotal * 0.10 if seat_count >= 4 else 0.0

    def convenience_fee(self, seat_count: int) -> float:
        return 35.0 * seat_count


class ReclinerPricing(PricingRule):
    @property
    def ticket_type(self) -> TicketType:
        return TicketType.RECLINER

    def subtotal(self, seat_count: int) -> float:
        return 550.0 * seat_count

    def discount(self, seat_count: int, subtotal: float) -> float:
        return 0.0

    def convenience_fee(self, seat_count: int) -> float:
        return 50.0 * seat_count


class TaxPolicy(Protocol):
    def tax_on(self, taxable_amount: float) -> float: ...


class GstPolicy:
    def __init__(self, rate_percent: float = 18.0):
        self._rate = rate_percent

    def tax_on(self, taxable_amount: float) -> float:
        return round(taxable_amount * self._rate / 100.0, 2)


class PriceCalculator:
    """Closed against new tiers and against tax changes. Adding a tier means
    registering a rule; changing the tax rate means constructing a different
    TaxPolicy at the composition root."""

    def __init__(self, rules: list[PricingRule], tax: TaxPolicy):
        self._rules = {rule.ticket_type: rule for rule in rules}
        self._tax = tax

    def calculate(self, ticket_type: TicketType, seat_count: int) -> PriceBreakdown:
        try:
            rule = self._rules[ticket_type]
        except KeyError:
            raise ValueError(f"No pricing rule for {ticket_type.value}") from None

        subtotal = rule.subtotal(seat_count)
        discount = rule.discount(seat_count, subtotal)
        fee = rule.convenience_fee(seat_count)
        taxable = subtotal - discount + fee
        return PriceBreakdown(
            ticket_subtotal=subtotal,
            discount=discount,
            convenience_fee=fee,
            tax=self._tax.tax_on(taxable),
        )


# ---------- Infrastructure abstractions, defined by the policy's needs ----------

class BookingRepository(Protocol):
    def get_show(self, show_id: str) -> Show | None: ...

    def save_show(self, show: Show) -> None: ...

    def save_booking(self, booking: Booking) -> None: ...

    def get_booking(self, booking_id: str) -> Booking | None: ...


class BookingIdGenerator(Protocol):
    def next_id(self) -> str: ...


class MessageSender(Protocol):
    def send(self, phone: str, message: str) -> None: ...


class AuditLog(Protocol):
    def record(self, event: str, payload: dict[str, Any]) -> None: ...


class InvoiceRenderer(Protocol):
    def render(self, booking: Booking, show: Show) -> str: ...


class DocumentStore(Protocol):
    def put(self, name: str, content: str) -> None: ...


# ---------- Policy ----------

class BookingService:
    """The booking rule and the sequence of collaborations. Contains no SQL,
    no vendor, no filesystem path, and no pricing arithmetic."""

    def __init__(
        self,
        repository: BookingRepository,
        calculator: PriceCalculator,
        ids: BookingIdGenerator,
        sender: MessageSender,
        audit: AuditLog,
    ):
        self._repository = repository
        self._calculator = calculator
        self._ids = ids
        self._sender = sender
        self._audit = audit

    def book(
        self,
        show_id: str,
        customer_name: str,
        phone: str,
        seat_count: int,
        ticket_type: TicketType,
    ) -> BookingOutcome:
        show = self._repository.get_show(show_id)
        if show is None:
            return self._refuse(show_id, customer_name, "No such show")
        if not show.can_accommodate(seat_count):
            return self._refuse(show_id, customer_name, "Not enough seats")

        breakdown = self._calculator.calculate(ticket_type, seat_count)
        booking = Booking(
            booking_id=self._ids.next_id(),
            show_id=show_id,
            customer_name=customer_name,
            phone=phone,
            seat_count=seat_count,
            ticket_type=ticket_type,
            breakdown=breakdown,
        )

        show.reserve(seat_count)
        self._repository.save_booking(booking)
        self._repository.save_show(show)

        self._sender.send(
            phone,
            f"Booking {booking.booking_id} confirmed for {show.movie}. "
            f"Total Rs {breakdown.total:.2f}",
        )
        self._audit.record(
            "booking_confirmed",
            {
                "booking_id": booking.booking_id,
                "show_id": show_id,
                "seat_count": seat_count,
                "total": breakdown.total,
            },
        )
        return BookingOutcome(booking=booking)

    def _refuse(self, show_id: str, customer_name: str, reason: str) -> BookingOutcome:
        self._audit.record(
            "booking_refused",
            {"show_id": show_id, "customer_name": customer_name, "reason": reason},
        )
        return BookingOutcome(booking=None, reason=reason)


class TextInvoiceRenderer:
    """Formatting only. Reads the stored components rather than reversing
    the total, so the premium discount appears as its own line."""

    def render(self, booking: Booking, show: Show) -> str:
        b = booking.breakdown
        return (
            f"INVOICE {booking.booking_id}\n"
            f"Movie: {show.movie}   Screen: {show.screen}\n"
            f"Customer: {booking.customer_name}\n"
            f"Seats: {booking.seat_count} ({booking.ticket_type.value})\n"
            f"Tickets:     {b.ticket_subtotal:>10.2f}\n"
            f"Discount:    {-b.discount:>10.2f}\n"
            f"Convenience: {b.convenience_fee:>10.2f}\n"
            f"GST:         {b.tax:>10.2f}\n"
            f"Total:       {b.total:>10.2f}\n"
        )


class InvoiceService:
    def __init__(
        self,
        repository: BookingRepository,
        renderer: InvoiceRenderer,
        store: DocumentStore,
    ):
        self._repository = repository
        self._renderer = renderer
        self._store = store

    def issue(self, booking_id: str) -> str:
        booking = self._repository.get_booking(booking_id)
        if booking is None:
            raise ValueError(f"Unknown booking: {booking_id}")
        show = self._repository.get_show(booking.show_id)
        if show is None:
            raise ValueError(f"Unknown show: {booking.show_id}")
        document = self._renderer.render(booking, show)
        self._store.put(f"{booking_id}.txt", document)
        return document


class UuidBookingIdGenerator:
    def next_id(self) -> str:
        return f"BK{uuid.uuid4().hex[:10].upper()}"
```

A representative concrete adapter, showing that all SQL knowledge is confined to one class and uses parameter binding:

```python
class PostgresBookingRepository:
    def __init__(self, connection):
        self._conn = connection

    def get_show(self, show_id: str) -> Show | None:
        with self._conn.cursor() as cur:
            cur.execute(
                "SELECT show_id, movie, screen, start_time, seats_available "
                "FROM shows WHERE show_id = %s",
                (show_id,),
            )
            row = cur.fetchone()
        return Show(*row) if row else None

    def save_show(self, show: Show) -> None:
        with self._conn.cursor() as cur:
            cur.execute(
                "UPDATE shows SET seats_available = %s WHERE show_id = %s",
                (show.seats_available, show.show_id),
            )

    def save_booking(self, booking: Booking) -> None:
        b = booking.breakdown
        with self._conn.cursor() as cur:
            cur.execute(
                "INSERT INTO bookings (booking_id, show_id, customer_name, phone, "
                "seat_count, ticket_type, ticket_subtotal, discount, convenience_fee, "
                "tax) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    booking.booking_id,
                    booking.show_id,
                    booking.customer_name,
                    booking.phone,
                    booking.seat_count,
                    booking.ticket_type.value,
                    b.ticket_subtotal,
                    b.discount,
                    b.convenience_fee,
                    b.tax,
                ),
            )

    def get_booking(self, booking_id: str) -> Booking | None:
        ...
```

The composition root assembles the system.

```python
# main.py

def build_services(config):
    connection = psycopg2.connect(
        host=config.db_host,
        dbname=config.db_name,
        user=config.db_user,
        password=config.db_password,
    )
    repository = PostgresBookingRepository(connection)
    calculator = PriceCalculator(
        rules=[StandardPricing(), PremiumPricing(), ReclinerPricing()],
        tax=GstPolicy(rate_percent=config.gst_rate),
    )
    booking = BookingService(
        repository=repository,
        calculator=calculator,
        ids=UuidBookingIdGenerator(),
        sender=TwilioSender(config.twilio_sid, config.twilio_token, config.from_number),
        audit=FileAuditLog(config.audit_path),
    )
    invoices = InvoiceService(
        repository=repository,
        renderer=TextInvoiceRenderer(),
        store=FileDocumentStore(config.invoice_dir),
    )
    return booking, invoices
```

**Part 4: tests.**

```python
class InMemoryBookingRepository:
    def __init__(self, shows: list[Show] | None = None):
        self._shows = {s.show_id: s for s in (shows or [])}
        self._bookings: dict[str, Booking] = {}

    def get_show(self, show_id: str) -> Show | None:
        return self._shows.get(show_id)

    def save_show(self, show: Show) -> None:
        self._shows[show.show_id] = show

    def save_booking(self, booking: Booking) -> None:
        self._bookings[booking.booking_id] = booking

    def get_booking(self, booking_id: str) -> Booking | None:
        return self._bookings.get(booking_id)


class SequentialIds:
    def __init__(self) -> None:
        self._n = 0

    def next_id(self) -> str:
        self._n += 1
        return f"BK{self._n:05d}"


class RecordingSender:
    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def send(self, phone: str, message: str) -> None:
        self.sent.append((phone, message))


class RecordingAudit:
    def __init__(self) -> None:
        self.events: list[tuple[str, dict]] = []

    def record(self, event: str, payload: dict) -> None:
        self.events.append((event, payload))


class InMemoryDocumentStore:
    def __init__(self) -> None:
        self.documents: dict[str, str] = {}

    def put(self, name: str, content: str) -> None:
        self.documents[name] = content


def _build(seats: int = 100):
    show = Show("SH1", "Dune Part Two", "Screen 3", datetime(2026, 4, 2, 19, 30), seats)
    repository = InMemoryBookingRepository([show])
    sender, audit = RecordingSender(), RecordingAudit()
    service = BookingService(
        repository=repository,
        calculator=PriceCalculator(
            rules=[StandardPricing(), PremiumPricing(), ReclinerPricing()],
            tax=GstPolicy(18.0),
        ),
        ids=SequentialIds(),
        sender=sender,
        audit=audit,
    )
    return service, repository, sender, audit, show


def test_standard_booking_prices_and_reserves_correctly() -> None:
    service, repository, sender, audit, show = _build(seats=100)

    outcome = service.book("SH1", "Asha", "+919812345678", 2, TicketType.STANDARD)

    assert outcome.succeeded
    breakdown = outcome.booking.breakdown
    assert breakdown.ticket_subtotal == 360.0
    assert breakdown.convenience_fee == 40.0
    assert breakdown.discount == 0.0
    assert breakdown.tax == 72.0
    assert breakdown.total == 472.0
    assert show.seats_available == 98
    assert len(sender.sent) == 1
    assert audit.events[0][0] == "booking_confirmed"


def test_premium_bulk_discount_applies_before_tax() -> None:
    service, *_ = _build()

    outcome = service.book("SH1", "Ravi", "+919812345678", 4, TicketType.PREMIUM)

    b = outcome.booking.breakdown
    assert b.ticket_subtotal == 1280.0
    assert b.discount == 128.0
    assert b.convenience_fee == 140.0
    assert b.taxable_amount == 1292.0
    assert b.tax == 232.56
    assert b.total == 1524.56


def test_booking_is_refused_when_seats_are_insufficient() -> None:
    service, repository, sender, audit, show = _build(seats=3)

    outcome = service.book("SH1", "Meera", "+919812345678", 5, TicketType.RECLINER)

    assert outcome.succeeded is False
    assert outcome.reason == "Not enough seats"
    assert show.seats_available == 3, "A refused booking must not reserve seats"
    assert sender.sent == [], "A refused booking must send no message"
    assert audit.events[0][0] == "booking_refused"


def test_invoice_reports_the_discount_as_its_own_line() -> None:
    service, repository, *_ = _build()
    outcome = service.book("SH1", "Ravi", "+919812345678", 4, TicketType.PREMIUM)
    store = InMemoryDocumentStore()
    invoices = InvoiceService(repository, TextInvoiceRenderer(), store)

    document = invoices.issue(outcome.booking.booking_id)

    assert "Discount:       -128.00" in document
    assert "Total:          1524.56" in document
    assert f"{outcome.booking.booking_id}.txt" in store.documents


def test_a_zero_rated_tax_jurisdiction_needs_no_code_change() -> None:
    calculator = PriceCalculator([StandardPricing()], GstPolicy(rate_percent=0.0))

    breakdown = calculator.calculate(TicketType.STANDARD, 2)

    assert breakdown.tax == 0.0
    assert breakdown.total == 400.0
```

Five tests cover the pricing arithmetic, the bulk discount ordering, the refusal path, the invoice contents, and the configurability of the tax rate. All five run without a database, an SMS provider, or a filesystem, and the entire suite completes in milliseconds. The second test is the one the original code could not have passed at all, because the discount was not recoverable from the stored total.

**Part 5: what the refactor makes possible.**

The following statements are operational rather than aesthetic, and they are the terms in which a refactor should be justified to a team or an interviewer.

| Requirement | Original | Refactored |
|---|---|---|
| The goods and services tax rate changes on a stated date | Edit the multiplier inside a 45-line booking method, then manually verify that booking, SMS, and audit behaviour are unaffected | Construct `GstPolicy(rate_percent=...)` from configuration. No code change, and the existing tests continue to prove correctness. |
| An IMAX tier is introduced | Add a branch to the pricing chain inside the booking method | Add one `PricingRule` class and one registry entry. No existing pricing class, and no booking code, is edited. |
| Migration from Twilio to a different provider | Edit the constructor and the send call inside the booking method | Write one class satisfying `MessageSender` and change one line at the composition root |
| Verifying the premium bulk discount | Not possible without a production database and a live SMS account, and the result is unverifiable because the discount is not stored | A three-line assertion in a test that runs offline |
| Invoices for a booking made before a tax change | Wrong, because the invoice reverses the current rate against a historical total | Correct, because the tax charged is stored with the booking rather than recomputed |
| Concurrent bookings for the last seats | Identifier collisions and lost updates | Identifiers are collision-free, and the seat check and reservation are colocated in `Show`, which is the correct place for a transaction or a lock to be introduced |
| A customer named `O'Brien` | Corrupts the SQL statement | Handled by parameter binding in the one class that issues SQL |

A final observation on scope. The refactored system contains sixteen classes where the original contained one, and this is the objection most frequently raised against work of this kind. The count is justified here because each class corresponds to an axis along which this system is known to change: tax rates change by legislation, tiers change by commercial decision, vendors change by procurement, and storage changes by platform migration. Had the requirement been a single-screen cinema with one ticket price and no tax, the same sixteen classes would be unjustifiable. The judgement of when structure is warranted is developed further in the module on advanced design topics; for the purposes of this workbook, the operative rule is that structure is warranted by demonstrated axes of change and not by the possibility of change in the abstract.

---

## 11. Self-Review Checklist

The following checklist is intended for application to one's own code, in review, before a design is submitted. It is deliberately phrased as questions with unambiguous answers rather than as principles to consider.

```
SINGLE RESPONSIBILITY
  [ ] Can I list more than one concrete requirement change that would edit this class?
  [ ] Does an honest name for this class require the word "And" or the suffix "Manager"?
  [ ] Does this class both decide something and perform input or output?
  [ ] Would two different teams need to change this file for unrelated reasons?

OPEN / CLOSED
  [ ] Is there a conditional chain keyed on a type code, mode, or format string?
  [ ] Does adding the next obvious variant require editing working, tested code?
  [ ] Could a consumer of this module extend it without modifying its source?

LISKOV SUBSTITUTION
  [ ] Does any override raise an exception the base contract does not declare?
  [ ] Does any override reject inputs the base accepts, or guarantee less than the base?
  [ ] Does any caller use isinstance to decide whether a method is safe to call?
  [ ] Does any override leave an invariant of the base broken?

INTERFACE SEGREGATION
  [ ] Does any implementer supply a method body that is pass, None, or NotImplementedError?
  [ ] Does any consumer declare a type with ten methods in order to call two?
  [ ] Is any interface defined by what the largest implementer can do rather than by
      what a client needs?
  [ ] Conversely: does any class now declare conformance to more than four interfaces
      that are always required together? (Interface explosion.)

DEPENDENCY INVERSION
  [ ] Does this class construct any collaborator inside __init__ or a method body?
  [ ] Does this class contain a hostname, port, path, API key, or vendor name?
  [ ] Can this class be instantiated in a test with no network and no filesystem?
  [ ] Was each abstraction defined by the needs of the caller, or copied from the
      shape of the provider's API?
  [ ] Is there exactly one composition root, and does it contain every concrete
      infrastructure choice?
```

The final question in each group is the one most often answered incorrectly, because each concerns a defect that looks like a correction. A class split into ten pieces along the wrong lines, an interface hierarchy that has exploded, an override defended by a caller's type check, and an abstraction that mirrors a vendor's API are all failures produced by applying a principle without understanding its purpose.

---

## 12. Summary and Key Takeaways

### 12.1 What the workbook covered

| Section | Problems | Levels | Domains |
|---|---|---|---|
| A: Recognition drills | 5 | 1 | Hospital, e-commerce, banking, ride-hailing, retail |
| B: Single Responsibility | 3 | 1, 2, 3 | Content platform, human resources, restaurant |
| C: Open/Closed | 3 | 1, 2, 3 | Payments, logging, e-commerce promotions |
| D: Liskov Substitution | 3 | 1, 2, 3 | Geometry, storage library, retail banking |
| E: Interface Segregation | 3 | 1, 2, 3 | Office devices, storage abstraction, game engine |
| F: Dependency Inversion | 3 | 1, 2, 3 | Notifications, reporting, hospital scheduling |
| G: Combined violations | 2 | 2, 3 | Library management, home automation |
| H: Capstone | 1 | 3 | Cinema ticketing |
| **Total** | **23** | | **Fifteen distinct domains** |

### 12.2 Diagnostic signatures

This table is the practical residue of the workbook and is worth committing to memory, because each row is a syntactic pattern detectable without domain knowledge.

| Signature observed in code | Principle | Direction of correction |
|---|---|---|
| A class that computes, formats, stores, and transmits | SRP | Split by axis of change, then inject the infrastructure into the coordinator |
| A conditional chain on a type code or mode string | OCP | One class per variant behind a common abstraction, selected by registry lookup |
| An override raising an exception the base does not declare | LSP | Separate the capability, or widen the base contract so refusal is expected |
| A caller using `isinstance` to decide what is safe to call | LSP and OCP | Select by capability rather than by identity |
| An implementer with `pass` or `NotImplementedError` bodies | ISP | Decompose the interface into cohesive role interfaces |
| A collaborator constructed inside `__init__` | DIP | Constructor injection, with selection moved to the composition root |
| An abstraction whose method names mirror a vendor's API | DIP | Redefine the abstraction as the question the policy asks |
| An exception handler that exists to discover a static fact | ISP | Correct the interface; the handler then has nothing to catch |

### 12.3 Key takeaways

**Diagnose in a fixed order.** Responsibilities first, then interface breadth, then extension points, then dependencies. A responsibility defect creates the conditions for the others, so correcting it first frequently causes the remaining problems to have obvious solutions. The reverse order produces constructors with eight parameters, which is the characteristic sign that the split was skipped.

**Count stakeholder roles, not lines.** The Single Responsibility Principle is not a statement about class size. Four methods of three lines each can be four responsibilities, and a two-hundred-line class implementing one algorithm can be one.

**The abstraction belongs to the caller.** This single idea determines whether an application of the Dependency Inversion Principle achieves anything. An interface derived from what a provider offers leaves the policy coupled to the provider through the shape of the interface. An interface derived from what the policy needs to decide is what makes a vendor migration a one-line change.

**Extensibility is a risk-management technique.** The reason to prefer adding a class over editing a method is that working code carries accumulated validation which editing partially discards. Stating the benefit in these terms, rather than as elegance, is what makes the case for a refactor persuasive to people who own delivery dates.

**Substitutability is a property of consumers.** A hierarchy cannot be judged in isolation. The test is to take each consumer, enumerate what it assumes, and verify that every type reaching it honours all of those assumptions unconditionally.

**Choose between capability separation and contract widening by asking when the condition is known.** Conditions fixed by type belong in the type system, where misuse becomes a static error. Conditions determined by runtime values belong in the contract, expressed as a declared outcome that every caller must handle.

**Each principle has a failure mode that resembles compliance.** Excessive splitting for SRP, speculative abstraction for OCP, defensive type checks for LSP, interface explosion for ISP, and container-driven indirection for DIP are all produced by applying a rule without its purpose. Structure is warranted by demonstrated axes of change, and a design that anticipates variation which never arrives has paid a cost for nothing.

**The measurement that matters is the second pass.** Repeat this workbook after seven to ten days with no reference material. Principles diagnosed correctly on the first attempt and incorrectly on the second were recalled rather than learned, and those are the sections to revisit.

---

## 13. Appendix: Violation Signature Reference

A single-page reference for use during review or interview preparation.

| # | Signature | Principle | Standard correction | Workbook problem |
|---|---|---|---|---|
| 1 | Data, formatting, storage, and transport in one class | SRP | Split by axis of change | A.1, B.1, B.2 |
| 2 | A class name requiring "And" to be honest | SRP | Split; the conjunction names the seam | B.1 |
| 3 | A method that both decides and performs output | SRP | Return a value; let a coordinator perform the output | B.2 |
| 4 | Conditional chain on a variant string | OCP | Abstraction plus one class per variant plus registry | A.2, C.1, C.2, G.1 |
| 5 | A caller-supplied mode parameter re-evaluated per call | OCP | Move the selection to construction time | C.2 |
| 6 | Engine inspecting variant type to label its output | OCP | Have the abstraction return a self-describing value | C.3 |
| 7 | Override raising an undeclared exception type | LSP | Capability separation or contract widening | A.3, D.2 |
| 8 | Override weakening a postcondition of an inherited setter | LSP | Reject the inheritance relationship | D.1 |
| 9 | `isinstance` guard protecting a method call | LSP, OCP | Select by capability, not identity | G.2 |
| 10 | Implementer with `pass` bodies | ISP | Decompose into role interfaces | A.4, E.1 |
| 11 | Implementer with `NotImplementedError` bodies | ISP, LSP | Decompose into role interfaces | E.1, G.2 |
| 12 | Change to one method propagating to unrelated implementers | ISP | Decompose; verify the blast radius afterwards | E.2 |
| 13 | Nine single-method interfaces on one class | ISP applied without limit | Recombine into cohesive roles | E.2 |
| 14 | Collaborator constructed in `__init__` | DIP | Constructor injection | A.5, F.1, F.2, G.1, H.1 |
| 15 | Hostname, path, or credential in a policy class | DIP | Move to configuration, read at the composition root | F.2, H.1 |
| 16 | Abstraction mirroring a provider's method names | DIP | Redefine as the question the policy asks | F.3 |
| 17 | Exception handler discovering a statically known fact | ISP | Correct the interface | G.2 |
| 18 | A computed total stored without its components | Not a SOLID violation; a modelling defect | Store the breakdown | H.1 |
| 19 | Values interpolated into SQL | Not a SOLID violation; a security defect | Parameter binding, in one repository class | G.1, H.1 |
| 20 | Failure reported by printing and returning `None` | Not a SOLID violation; a contract defect | Return an outcome value carrying the reason | G.1, H.1 |

The last three rows are included deliberately. A design review that reports only principle violations is incomplete, and the ability to notice a security defect or a modelling error alongside the structural ones is what distinguishes a competent review from a recitation of the acronym.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch.*
*Explore more: https://codeverra.com*
