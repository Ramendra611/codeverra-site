# LLD Deep Dive #3 — Designing a Library Management System

> **What this document is:** A genuine, step-by-step walkthrough of how to think through a Library Management LLD problem. We'll reason from first principles, weigh alternatives, and document each design decision — building toward a clean, extensible system that handles books, members, loans, fines, and reservations.

---

## Table of Contents

1. [Why This Problem Matters](#1-why-this-problem-matters)
2. [Stage 1 — Receiving the Problem](#2-stage-1--receiving-the-problem)
3. [Stage 2 — Clarifying Requirements](#3-stage-2--clarifying-requirements)
4. [Stage 3 — Identifying Entities (And the Big Modeling Decision)](#4-stage-3--identifying-entities)
5. [Stage 4 — Modeling Books vs Book Copies](#5-stage-4--modeling-books-vs-book-copies)
6. [Stage 5 — Modeling Members and Their Policies](#6-stage-5--modeling-members-and-their-policies)
7. [Stage 6 — The Loan Lifecycle](#7-stage-6--the-loan-lifecycle)
8. [Stage 7 — The Reservation Queue](#8-stage-7--the-reservation-queue)
9. [Stage 8 — Search Functionality](#9-stage-8--search-functionality)
10. [Stage 9 — The Library (Top-Level Coordinator)](#10-stage-9--the-library-top-level-coordinator)
11. [Stage 10 — Validating with a Mental Walkthrough](#11-stage-10--validating-with-a-mental-walkthrough)
12. [Stage 11 — Anticipating Follow-Up Questions](#12-stage-11--anticipating-follow-up-questions)
13. [Final Reflection — What This Problem Teaches](#13-final-reflection)

---

## 1. Why This Problem Matters

The library system is the canonical "policy-driven domain modeling" interview problem. What it tests:

- **The Book vs BookItem distinction** — a subtle modeling insight that separates designers who think in domain terms from those who blindly map "noun → class."
- **Policy variation across user types** — students, faculty, and guests have different borrowing rules. Where does that variation live?
- **Lifecycle management** — books move through borrowed/available/reserved states; loans accrue fines; reservations queue up.
- **Multiple "actors"** — members, librarians, the system itself. Each has different responsibilities.

Get this design right, and you've shown that you can model a domain *as it actually exists* rather than as it superficially appears.

---

## 2. Stage 1 — Receiving the Problem

The interviewer says:

> "Design a library management system."

Vague again. What might be meant:

- A simple book-loan tracker?
- A multi-branch system?
- Digital books, audiobooks, ebooks?
- Member management with billing?
- Search engine for the catalog?

We need to bound this with questions.

---

## 3. Stage 2 — Clarifying Requirements

### Q1: What core operations must we support?

**Why ask:** Sets the bare minimum scope. If they answer "just borrow and return," the design is much simpler than if they say "borrow, return, reserve, search, fine."

Suppose: *"Borrow, return, search, reserve, and assess fines for late returns."*

Comprehensive. We're building a real (small) system.

### Q2: Single library or multiple branches?

**Why ask:** Multiple branches means books can move between them, members might be branch-affiliated, transfers become a thing. Significantly more complex.

Suppose: *"Single library for now. Multi-branch is a possible extension."*

Good — keeps scope manageable.

### Q3: What kinds of items can be borrowed?

**Why ask:** "Just books"? Or also "ebooks, audiobooks, magazines, DVDs"? Each could have different rules (ebooks have license-based "loans" rather than physical copies).

Suppose: *"Just physical books for now. We might add ebooks later."*

Note this — when designing, leave room for future item types but don't over-engineer for them.

### Q4: How do we identify books?

**Why ask:** This is where the **Book vs BookItem** distinction emerges. If the library has 5 copies of *The Pragmatic Programmer*, are those 5 separate things or one thing with quantity 5?

The right answer: **5 separate physical copies, each tracked individually**, but they share metadata (title, author, ISBN, etc.) about the underlying *title*.

Why? Because each physical copy has its own state — one might be borrowed, one might be on hold, one might be lost. We can't treat them as interchangeable items in a counter.

Suppose: *"Yes, distinguish title from physical copy. Each copy is uniquely identifiable."*

Excellent — this is the key insight. Verbalize it:

> *"I'll model two distinct entities: Book (the title — author, ISBN, category — that's shared across all copies) and BookItem (a specific physical copy — its location, status, condition). Many candidates conflate these and end up with awkward designs where 'borrowing a book' is actually 'decrementing a counter.' Modeling each copy as a first-class entity gives us per-copy state and a clean reservation model."*

### Q5: Different member types?

**Why ask:** If all members are the same, life is simple. If students vs faculty have different rules, we need to model that variation.

Suppose: *"Yes — Students, Faculty, and Guests. Different borrowing limits and durations."*

Now we know we need varied policy. **Policy variation is a classic Strategy pattern application.**

| Member Type | Max Books | Loan Duration | Fine/Day |
|---|---|---|---|
| Student | 3 | 14 days | ₹5 |
| Faculty | 10 | 30 days | ₹2 |
| Guest | 1 | 7 days | ₹10 |

### Q6: How do reservations work?

**Why ask:** Several possible behaviors:
- "I want this book sometime — notify me when available."
- "I want this book at this date."
- FIFO queue vs priority queue.

Suppose: *"FIFO. When a copy is returned, the next person in queue is notified."*

Simple and standard. We'll use a queue (deque).

### Q7: Fine handling?

**Why ask:** What triggers fines? When are they computed? When are they paid? What if unpaid fines block borrowing?

Suppose: *"Fines are computed at return time based on days overdue. Track the amount; payment processing is out of scope. Unpaid fines don't block borrowing in v1."*

### Q8: Concurrency and persistence?

Suppose: *"In-memory storage. Single-threaded."*

### Recap

> *"To summarize: a single library with physical books (each title can have multiple copies, each copy tracked individually). Three member types — Student, Faculty, Guest — with different borrowing limits, durations, and fine rates. Operations: borrow, return, search (by title/author/category), reserve (FIFO queue), and fine assessment at return time. In-memory, single-threaded. Multi-branch and digital books are future extensions. Aligned?"*

Confirmed. Now we design.

---

## 4. Stage 3 — Identifying Entities

Pull nouns from the requirements:

- library
- book
- copy / book item
- member (student, faculty, guest)
- loan
- reservation
- fine
- search
- librarian (administrative actor)
- queue

Filter:

| Noun | Class? | Reasoning |
|---|---|---|
| library | **Yes** | Top-level entity (facade) |
| book | **Yes** | The title — shared metadata across copies |
| book item / copy | **Yes** | Each physical copy with its own state |
| member | **Yes** (with subtypes? or single class?) | We'll decide soon |
| loan | **Yes** | A borrowing record with its own lifecycle |
| reservation | **Yes** | A queued request |
| fine | Maybe — see below | Could be a class, or just a calculation |
| search | **Yes** | A focused responsibility |
| librarian | Reject for now | An actor outside the system; not modeled |
| queue | **No** | Use a deque |

### Should `Fine` be a class?

A fine is just an amount of money associated with an overdue loan. It doesn't have its own behavior beyond being computed. In our scope, treating it as `loan.calculate_fine()` returning a float is sufficient.

If the system grew to track fine payments, fine waivers, fine appeals, etc., then `Fine` would deserve a class. **YAGNI — defer.**

### Member subtypes — Inheritance or Strategy?

This is the most interesting modeling decision in this problem. We have three member types with different behavior. Two natural approaches:

**Approach A — Inheritance:** `Student`, `Faculty`, `Guest` are subclasses of `Member`. Each overrides methods like `max_books()`, `loan_duration()`, `fine_per_day()`.

**Approach B — Composition (Strategy):** A single `Member` class with a `policy` attribute. `MembershipPolicy` is a Strategy with implementations `StudentPolicy`, `FacultyPolicy`, `GuestPolicy`.

Both work. Let me weigh them.

**Inheritance pros:**
- Simple, intuitive — "a Student is a Member."
- One class per type.

**Inheritance cons:**
- A member's *type can change* (a student graduates and becomes a faculty member, or vice versa). Inheritance makes this awkward — you'd have to construct a new object and migrate state.
- If we add new dimensions of variation (e.g., "premium member" status that adds extra benefits), we'd combinatorially explode subclasses.

**Composition (Strategy) pros:**
- Member type can change at runtime — just swap the policy.
- Multiple orthogonal dimensions don't combinatorially explode (e.g., we could have membership level and academic role separately).
- Easier to test policies in isolation.

**Composition cons:**
- Slightly less natural to read — `member.policy.max_books` vs `member.max_books`.
- One more class to manage.

### Decision

**Composition / Strategy.** Here's why:

The policies are pure data + behavior, with no member-specific state. `StudentPolicy` doesn't have a name or an email — it just has rules. Putting those rules on a separate object that the Member references gives us:

- **The ability to upgrade a member without recreating them** (e.g., guest → student when they enroll).
- **A single place to define each policy**, which is easier for an administrator to read/edit.
- **Easier extension** — new policies plug in without subclassing Member.

Verbalize:

> *"I'm using composition: a single Member class that holds a MembershipPolicy reference. The alternative — Student/Faculty/Guest as Member subclasses — works, but member type can change in real life (a student graduates), and inheritance makes that awkward. With composition, a member's policy can be swapped at runtime without recreating the member object. It also separates 'who is the member' from 'what rules apply to them' — two distinct concerns."*

Final entity list:
- `Library` (top-level facade)
- `Book` (the title)
- `BookItem` (a physical copy)
- `Member`
- `MembershipPolicy` (abstract) → `StudentPolicy`, `FacultyPolicy`, `GuestPolicy`
- `Loan`
- `Reservation`
- `BookSearch` (search functionality)
- `BookStatus` (enum)

---

## 5. Stage 4 — Modeling Books vs Book Copies

The two-class split is the cornerstone of this design. Let's model it carefully.

### What goes on `Book`?

The title's metadata — things shared by every copy of this title:
- ISBN
- Title
- Author
- Category / genre
- Publication year (optional)
- Description (optional, often)

What about the list of copies? Should `Book` hold its own copies?

**Option A:** `Book` has a list of `BookItem` (copies).
**Option B:** Copies are managed separately; book and copies are linked via ISBN.

**Option A** is more cohesive — asking "what copies do we have of this book?" is natural. Let's go with it.

But there's a subtlety: who manages the *list* of all books? The Library. Who manages the copies of *one specific book*? That book itself.

This split puts ownership where it logically belongs: the library owns the book catalog; each book owns its copies.

### What goes on `BookItem`?

The physical copy's state:
- A reference back to its `Book` (so we can ask "what title is this?")
- A unique copy ID (e.g., barcode)
- Current status: AVAILABLE / BORROWED / LOST / RESERVED (we can debate the last)
- Possibly: shelf location, condition

Should "RESERVED" be a status of `BookItem`?

This is interesting. Let's think.

When a member reserves a title, they're not reserving a *specific copy* — they're queued for *any* copy. When a copy becomes available, the next person in queue gets it. So reservation is at the *Book* level, not the *BookItem* level.

Hence, `BookItem.status` doesn't need a RESERVED value. Statuses are just AVAILABLE, BORROWED, LOST.

### The Code

```python
from enum import Enum
from typing import Optional


class BookStatus(Enum):
    """
    Status of a single physical copy.

    AVAILABLE: in the library, ready to be borrowed.
    BORROWED: currently lent to a member.
    LOST: copy has been reported missing/destroyed.

    Notably absent: RESERVED. Reservations are at the Book (title)
    level, not the BookItem level — when a copy becomes AVAILABLE,
    the reservation queue is checked. The copy itself is just
    AVAILABLE; whoever asks first gets it (which is the reservation
    queue's job to manage).
    """
    AVAILABLE = "available"
    BORROWED = "borrowed"
    LOST = "lost"


class Book:
    """
    Represents a title in the catalog (e.g., 'The Pragmatic Programmer').

    Multiple physical copies (BookItem instances) can exist for one Book.
    The Book holds the metadata shared across all its copies.

    Why model Book and BookItem as distinct entities?
    - A title and a physical copy have different lifecycles. The title
      is added to the catalog once; copies come and go (lost, replaced).
    - Each physical copy has its own state — borrowed, available, lost.
      Conflating them into a single 'Book with quantity' loses this.
    - Reservations queue against the title (next available copy wins),
      while loans target a specific copy. The two concepts demand
      separate entities.
    """

    def __init__(
        self,
        isbn: str,
        title: str,
        author: str,
        category: str,
    ):
        self.isbn = isbn          # International Standard Book Number — unique key
        self.title = title
        self.author = author
        self.category = category
        # Copies of this title. We use a list because order doesn't
        # really matter, and lookups are typically iterating to find
        # an available one.
        self.copies: list[BookItem] = []

    def add_copy(self, copy: "BookItem") -> None:
        """
        Add a physical copy. Called by the library when stocking new copies.

        We accept the BookItem (rather than constructing one here)
        because the caller may want to control how copies are created
        (with their own copy_ids, etc.).
        """
        self.copies.append(copy)

    def available_copy(self) -> Optional["BookItem"]:
        """
        Return the first AVAILABLE copy, or None if no copies are free.

        Why "first" rather than some other policy?
        - We're not optimizing for shelf location or anything subtle.
        - The list ordering doesn't have meaning in our scope, so
          "first" is just a deterministic choice.
        - In a real system you might prefer the copy with the lowest
          shelf position, or the one in best condition.
        """
        return next(
            (c for c in self.copies if c.status == BookStatus.AVAILABLE),
            None,
        )

    def total_copies(self) -> int:
        return len(self.copies)

    def available_copy_count(self) -> int:
        """Useful for displaying availability in search results."""
        return sum(1 for c in self.copies if c.status == BookStatus.AVAILABLE)

    def __repr__(self):
        return f"Book({self.isbn}, {self.title!r}, by {self.author})"


class BookItem:
    """
    A single physical copy of a book.

    Has its own lifecycle (status), its own identifier, and a reference
    back to the Book metadata. The reference is one-way (item knows
    its book) rather than bidirectional, because Book already knows
    its copies via .copies — bidirectional links would be redundant
    and risk inconsistency.

    Conceptually a BookItem is owned by exactly one Book. We don't
    enforce this with code (Python doesn't make that easy), but we
    rely on the convention that you create BookItems via Book.add_copy.
    """

    def __init__(self, book: Book, copy_id: str):
        self.book = book
        self.copy_id = copy_id
        # Newly added copies start as AVAILABLE.
        self.status = BookStatus.AVAILABLE

    def __repr__(self):
        return f"BookItem({self.copy_id} of {self.book.title!r}, {self.status.name})"
```

A few things worth noting:

**1. The Book ↔ BookItem relationship is one-way at the model level.** Book has a list of copies, each copy has a back-reference to its book. We could maintain bidirectional integrity (when you remove a copy, also clear the back-ref) but for our scope, the simplicity of "Book owns copies" is fine.

**2. We deliberately did *not* expose mutation of `BookItem.status` through methods like `borrow()` or `return_to_shelf()`.** Why? Because status changes are part of the loan flow, which is the Library's responsibility, not the BookItem's. The Library will set `status` directly. If we found that status changes were happening from many places and getting tangled, we'd refactor — but right now, exposing setters too early is premature encapsulation.

A good interview-level critique of myself: *"In production I'd probably wrap status changes in BookItem methods (`mark_borrowed`, `mark_returned`) to enforce valid transitions. For this scope, I'm letting the Library mutate the status directly because the loan flow is the only thing that does it."*

---

## 6. Stage 5 — Modeling Members and Their Policies

We decided: composition (Strategy). Let's implement.

### Defining the Policy Interface

What does a policy need to express?

- Maximum books a member can borrow at once.
- Loan duration in days.
- Fine per day for overdue returns.

That's the whole interface for now. Three values, exposed as properties.

### Why properties (not just attributes)?

Because the values might be *computed* in some implementations. E.g., a "premium" policy might compute fine_per_day as `base_rate * (1 - discount)`. Properties give us that flexibility without changing callers.

### The Code

```python
from abc import ABC, abstractmethod


class MembershipPolicy(ABC):
    """
    Encapsulates the rules a member operates under:
    how many books they can borrow, how long they get to keep them,
    and what they pay per day for overdue returns.

    Implemented as Strategy: each concrete policy is a class, and
    a Member holds a reference to one. This decouples 'who the
    member is' from 'what rules they follow.'

    Adding a new policy (Premium, Alumni, etc.) = a new class.
    No changes to Member, Library, or any other policy.
    """

    @property
    @abstractmethod
    def max_books(self) -> int:
        """Maximum number of books this member can have on loan at one time."""
        ...

    @property
    @abstractmethod
    def loan_days(self) -> int:
        """How many days a single loan lasts before becoming overdue."""
        ...

    @property
    @abstractmethod
    def fine_per_day(self) -> float:
        """Fine amount per day for overdue returns."""
        ...

    def __repr__(self):
        return self.__class__.__name__


class StudentPolicy(MembershipPolicy):
    """Rules for student members: limited capacity, moderate fines."""

    @property
    def max_books(self) -> int:
        return 3

    @property
    def loan_days(self) -> int:
        return 14

    @property
    def fine_per_day(self) -> float:
        return 5.0


class FacultyPolicy(MembershipPolicy):
    """
    Rules for faculty members: generous limits and longer loans, with
    a lower fine rate (faculty are usually trusted to return on time).
    """

    @property
    def max_books(self) -> int:
        return 10

    @property
    def loan_days(self) -> int:
        return 30

    @property
    def fine_per_day(self) -> float:
        return 2.0


class GuestPolicy(MembershipPolicy):
    """Rules for guests: minimal access with strict consequences."""

    @property
    def max_books(self) -> int:
        return 1

    @property
    def loan_days(self) -> int:
        return 7

    @property
    def fine_per_day(self) -> float:
        return 10.0
```

A note on style: I'm using `@property` for each value. The alternative is class-level constants (`max_books = 3`). Class constants are slightly less flexible (can't be overridden by subclasses with computation) but slightly cleaner-looking. I lean toward properties because it keeps the door open for computed values.

### The Member Class

```python
class Member:
    """
    A library patron.

    Holds:
    - Identity (id, name, email — for contact and tracking).
    - Current policy (what rules apply to them).
    - Active loans (so we can enforce max_books).

    Note we DON'T hold a list of past loans here. Loan history
    belongs in the Library (or a dedicated repository) — we don't
    want every Member to grow unboundedly with history.

    Why expose `policy` as a public attribute? Because it's
    expected to be swappable (a guest becomes a student, etc.),
    and Python's convention is direct attribute access for such
    cases. A setter wrapping it would add no value.
    """

    def __init__(
        self,
        member_id: str,
        name: str,
        email: str,
        policy: MembershipPolicy,
    ):
        self.member_id = member_id
        self.name = name
        self.email = email
        self.policy = policy
        # Loans currently in effect (not yet returned).
        # Used by the library to enforce max_books.
        self.active_loans: list["Loan"] = []

    def can_borrow_more(self) -> bool:
        """
        True if this member is below their borrowing limit.
        Used by the library before issuing a loan.
        """
        return len(self.active_loans) < self.policy.max_books

    def __repr__(self):
        return f"Member({self.name}, {self.policy})"
```

The `can_borrow_more()` method is a small but important responsibility: the *member* knows how to check its own limit. We could put this logic in the Library (`if len(member.active_loans) < member.policy.max_books`), but that scatters policy knowledge. By putting `can_borrow_more` on Member, we keep the rule encapsulated.

This is the Tell-Don't-Ask principle in action: ask the member if they can borrow more, rather than asking for their internals and computing externally.

---

## 7. Stage 6 — The Loan Lifecycle

A loan represents one specific instance of a member borrowing one specific copy. It has its own data and behavior.

### What does a loan need?

- The member.
- The book item being borrowed.
- Issue date (when the loan started).
- Due date (when it must be returned by).
- Return date (None until returned).
- An ID, for tracking.

### What about behavior?

- Determine if it's overdue.
- Calculate the fine (based on overdue days × member's policy).

The fine calculation is interesting. Should it live on `Loan`, on a separate `FineCalculator`, or on the policy?

**Option A:** `loan.calculate_fine()` — the loan knows its data, asks the policy for the rate.
**Option B:** `fine_calculator.compute(loan)` — separate utility.
**Option C:** `policy.compute_fine(loan)` — policy owns it.

A is the most natural: the loan has all the data (issue date, return date, member's policy), so it can compute. And it doesn't grow much code — it's a single method.

If fine logic became complex (rounding rules, grace periods, holiday handling), we'd extract a `FineCalculator`. For now, keep it on Loan.

### The Code

```python
from datetime import datetime, timedelta
from typing import Optional
import uuid


class Loan:
    """
    A single borrowing event: this member checked out this copy
    on this date.

    Lifecycle:
    1. Created when the member borrows the copy.
    2. Active until returned.
    3. On return, return_date is stamped and the loan moves
       to "completed" (we don't model this as an enum; we infer
       it from return_date being non-None).

    Holds enough data to compute fines, due dates, etc.
    """

    def __init__(self, member: Member, book_item: "BookItem"):
        self.id = str(uuid.uuid4())[:8]
        self.member = member
        self.book_item = book_item
        # Issue date is set at construction. Using datetime.now() means
        # loans created in the same millisecond would have the same time;
        # for our purposes that's fine.
        self.issue_date = datetime.now()
        # Due date is computed from the member's policy at the time of
        # borrowing. We store it (rather than recomputing each time) so
        # the loan terms don't change retroactively if the member's
        # policy is later upgraded.
        self.due_date = self.issue_date + timedelta(days=member.policy.loan_days)
        # Return date is None until the loan is closed.
        self.return_date: Optional[datetime] = None

    @property
    def is_returned(self) -> bool:
        """True if the loan has been completed."""
        return self.return_date is not None

    @property
    def is_overdue(self) -> bool:
        """
        True if the loan is past its due date AND not yet returned.
        Returned loans aren't 'overdue' — they're done.
        """
        return not self.is_returned and datetime.now() > self.due_date

    def calculate_fine(self) -> float:
        """
        Compute the fine for this loan.

        Fine logic:
        - If returned on or before due date: no fine.
        - If returned after due date: (overdue days) × (member's fine rate).
        - If not yet returned: compute as if returning right now (this is
          useful for displaying 'fine if you return today' to members).

        We use the member's CURRENT fine rate, not the rate at borrowing
        time. This is a policy choice — if the member's fine rate
        changes mid-loan, the new rate applies. (Alternative: snapshot
        the rate on Loan creation. Both are defensible; we pick current
        for simplicity.)
        """
        end_date = self.return_date or datetime.now()
        if end_date <= self.due_date:
            return 0.0

        # +1 to count partial days as full days (a common library policy).
        overdue_days = (end_date - self.due_date).days + 1
        return overdue_days * self.member.policy.fine_per_day

    def __repr__(self):
        status = "returned" if self.is_returned else "active"
        return (
            f"Loan({self.id}, {self.book_item.book.title!r} → "
            f"{self.member.name}, {status})"
        )
```

The decision to store `due_date` on the loan (rather than recomputing it) deserves attention. If we recomputed each time as `issue_date + member.policy.loan_days`, then a member upgrading their policy would suddenly have all their existing loans extended (or shortened). That's almost certainly wrong — loan terms are a contract at the time of borrowing.

We DO use the current fine rate (not the rate at borrowing). That's a choice — both are defensible. In a real interview, I'd note this tradeoff:

> *"I store the due_date on the Loan so it's a snapshot — if the member upgrades their policy, existing loans keep their original due dates. For fine_per_day, I use the current rate at calculation time. Both approaches are defensible; in production I'd ask product what behavior they want."*

---

## 8. Stage 7 — The Reservation Queue

Reservations let members "wait in line" for a borrowed book. When a copy is returned, the next person in queue is notified.

### Where do queues live?

The queues are per-title (per `Book`). We have three options:

**Option A:** Each `Book` holds its own reservation queue.
**Option B:** The `Library` holds a dict mapping ISBN → queue.
**Option C:** A separate `ReservationManager` holds and manages all queues.

A is most cohesive (Book owns its reservations). B is more centralized. C is most flexible (can grow into its own service).

For our scope, **B** is a reasonable middle ground — the library is the one orchestrating returns and reservations, so it makes sense for the library to hold the queues. If reservation logic grew (priority queues, time-based reservations, expiry), we'd extract C.

We could also do A — but it'd require Book to have notification logic, which feels like scope creep.

**Decision:** B — Library holds `dict[isbn] → deque[Reservation]`.

### The Reservation class itself

Pretty simple:
- The member
- The book they reserved
- When they reserved it (for FIFO ordering and possible expiry)

```python
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Reservation:
    """
    A request to be notified when a book becomes available.

    Reservations are queued FIFO per title. The member at the front
    of the queue gets the next available copy.

    We use a dataclass because this is mostly data — there's no
    interesting behavior on a Reservation itself.

    Note: we do NOT hold a reference to a specific BookItem. The
    member is queued for the title; whichever copy frees up first
    is theirs.
    """
    member: Member
    book: Book
    reserved_at: datetime = field(default_factory=datetime.now)
```

The deque (from `collections`) is the right data structure for the queue: O(1) `append` (enqueue at the back) and O(1) `popleft` (dequeue from the front). A list would have O(n) `pop(0)`.

We'll integrate the queues into the Library next.

---

## 9. Stage 8 — Search Functionality

Members need to find books. By title, author, category, etc.

### Should search be a method on Library, or its own class?

If search is just `def search_by_title(...)`, it's fine as Library methods. But:

- Search will likely grow (filters, full-text, ranking).
- Search has very different concerns from the rest of the library (storage, retrieval, indexing).
- Separating search lets us swap implementations (e.g., add a real full-text engine like Elasticsearch later).

I'll make `BookSearch` a separate class. It's a small but principled SRP boundary.

### What does search return?

A list of `Book` objects matching the query. Should it return matches sorted by relevance? Filtered to those with available copies? Limited to N?

For our scope, let's keep it simple: return all matches. Callers can filter further. **YAGNI.**

### The Code

```python
class BookSearch:
    """
    Encapsulates search functionality over the catalog.

    Why a separate class (rather than methods on Library)?
    - Search has different lifecycle/scaling concerns from the
      core library. We might later replace the in-memory linear
      scan with an indexed engine — that swap is much easier with
      a separate class.
    - Library's responsibility is orchestration; mixing search
      methods bloats it.

    Constructed with a list of Books — the caller (Library) provides
    the catalog. We don't hold a reference to Library because we
    don't need anything from it beyond the books.
    """

    def __init__(self, books: list[Book]):
        # We keep a reference to the list (not a copy). This means
        # if the caller's list grows, our search sees new books too.
        # Trade-off: shared mutable state. For our purposes that's
        # the desired behavior.
        self._books = books

    def by_title(self, query: str) -> list[Book]:
        """
        Find books whose title CONTAINS the query (case-insensitive).
        Linear scan; for thousands of books this is fine, for millions
        we'd want an index.
        """
        q = query.lower()
        return [b for b in self._books if q in b.title.lower()]

    def by_author(self, query: str) -> list[Book]:
        """Match on author substring (case-insensitive)."""
        q = query.lower()
        return [b for b in self._books if q in b.author.lower()]

    def by_category(self, category: str) -> list[Book]:
        """
        Exact category match (case-insensitive). We use exact match
        for category because categories are typically a controlled
        vocabulary, not free text.
        """
        return [
            b for b in self._books
            if b.category.lower() == category.lower()
        ]

    def by_isbn(self, isbn: str) -> Optional[Book]:
        """
        ISBN is unique — return at most one book.
        Returns None if no match.
        """
        return next((b for b in self._books if b.isbn == isbn), None)
```

The decision to make `by_title` use `contains` (substring) but `by_category` use exact match reflects domain reality: titles are free text where you might remember a fragment ("pragmatic"); categories are an enumeration (you wouldn't search "tec" hoping to find "Tech").

This kind of small contextual decision — knowing the domain enough to make the right choice — is what shows real design thinking.

---

## 10. Stage 9 — The Library (Top-Level Coordinator)

Now we tie it together. The Library is the **Facade** — it exposes the operations users care about (borrow, return, reserve, search) and hides the internal machinery.

### What does Library hold?

- Catalog: dict[isbn → Book]
- Members: dict[member_id → Member]
- Active loans: dict[loan_id → Loan]  (so we can look up loans by ID at return time)
- Reservation queues: dict[isbn → deque[Reservation]]

### The Core Operations

**Borrow:**
1. Validate member exists, book exists.
2. Check member can borrow more.
3. Find an available copy.
4. If no copy available, return None (caller should consider reserving).
5. Create the loan, update copy status, add to member's active loans.

**Return:**
1. Look up the loan.
2. Stamp return date, compute fine.
3. Update copy status to AVAILABLE.
4. Remove from member's active loans.
5. **If there's a reservation queue for this book, notify the next person.**
6. Return the fine amount.

**Reserve:**
1. Validate inputs.
2. If a copy is currently available, no need to reserve — caller should just borrow.
3. Add to the reservation queue.

### The Code

```python
class Library:
    """
    The top-level facade for the library system.

    Responsibilities:
    - Manage the catalog (books) and membership (members).
    - Orchestrate borrowing, returning, reserving.
    - Maintain the reservation queues.
    - Provide search.

    NOT responsible for:
    - Computing fines (that's Loan's job).
    - Knowing about borrowing limits (that's the member's policy).
    - Persistence (in scope: in-memory; production: would inject a repository).

    Library is intentionally a coordination layer — most actual work
    is delegated to the entities it owns.
    """

    def __init__(self):
        # Catalog: ISBN → Book. Dict for O(1) lookup.
        self.books: dict[str, Book] = {}
        # Membership directory: member_id → Member.
        self.members: dict[str, Member] = {}
        # Active loans: loan_id → Loan. Used to look up a loan at return.
        self.active_loans: dict[str, Loan] = {}
        # Reservation queues: ISBN → deque of Reservations.
        # We use deque for O(1) popleft (dequeue from the front).
        self.reservations: dict[str, deque[Reservation]] = {}

    # === Catalog management ===

    def add_book(self, book: Book) -> None:
        """
        Add a book to the catalog. Idempotent — if the book already
        exists, just keep the existing entry.
        """
        if book.isbn in self.books:
            # Same ISBN means same title; ignore duplicates rather than
            # overwriting. Real systems might merge copies.
            return
        self.books[book.isbn] = book

    def add_member(self, member: Member) -> None:
        """Register a new member."""
        if member.member_id in self.members:
            raise ValueError(f"Member {member.member_id} already exists")
        self.members[member.member_id] = member

    @property
    def search(self) -> BookSearch:
        """
        Convenience accessor for search.

        We construct a new BookSearch each access. This is cheap
        (BookSearch holds a reference, not a copy) but we could cache
        if it became a hotspot.
        """
        return BookSearch(list(self.books.values()))

    # === Borrow / Return / Reserve ===

    def borrow(self, member_id: str, isbn: str) -> Optional[Loan]:
        """
        Attempt to issue a loan: this member borrows a copy of this title.

        Returns the Loan if successful, None if no copy is available
        or the member is at their limit.

        Order of checks matters:
        1. First validate that the member and book exist (KeyError if not).
        2. Then check the member's borrowing limit (cheap check).
        3. Then look for an available copy (potentially expensive).

        We do the cheap checks first to fail fast.
        """
        member = self.members[member_id]   # raises KeyError if unknown
        book = self.books[isbn]

        if not member.can_borrow_more():
            print(
                f"{member.name} cannot borrow more — "
                f"already at limit ({member.policy.max_books})."
            )
            return None

        copy = book.available_copy()
        if copy is None:
            print(
                f"No copies of {book.title!r} are available. "
                f"Consider reserving."
            )
            return None

        # All checks passed. Issue the loan.
        copy.status = BookStatus.BORROWED
        loan = Loan(member, copy)
        member.active_loans.append(loan)
        self.active_loans[loan.id] = loan

        print(
            f"Issued: {book.title!r} (copy {copy.copy_id}) → "
            f"{member.name}. Due: {loan.due_date.date()}"
        )
        return loan

    def return_book(self, loan_id: str) -> float:
        """
        Process the return of a previously-issued loan.

        Steps:
        1. Look up the loan (KeyError if unknown).
        2. Stamp return date.
        3. Compute the fine (uses loan's own logic).
        4. Update the copy back to AVAILABLE.
        5. Remove the loan from active loans (it's done).
        6. Check the reservation queue for this title; if anyone's
           waiting, notify the front of the queue.

        Returns the fine amount.

        We don't actually charge the fine here — we just compute and
        return it. Payment processing is out of scope. A real system
        would track fine payment as a separate concern.
        """
        loan = self.active_loans[loan_id]

        # Stamp the loan as completed.
        loan.return_date = datetime.now()
        fine = loan.calculate_fine()

        # Free up the copy.
        loan.book_item.status = BookStatus.AVAILABLE

        # Remove the loan from active tracking.
        del self.active_loans[loan_id]
        loan.member.active_loans.remove(loan)

        title = loan.book_item.book.title
        print(f"Returned: {title!r}. Fine: ₹{fine:.2f}")

        # Reservation queue handling.
        self._fulfill_next_reservation(loan.book_item.book)

        return fine

    def reserve(self, member_id: str, isbn: str) -> Optional[Reservation]:
        """
        Add a reservation for a member on a book.

        If a copy of this book is currently available, we don't reserve
        — we tell the caller they should just borrow. This avoids
        useless reservations.

        Returns the Reservation if queued, None if a copy is available
        (suggesting borrow instead).
        """
        member = self.members[member_id]
        book = self.books[isbn]

        if book.available_copy() is not None:
            print(
                f"{book.title!r} has copies available. "
                f"{member.name} should just borrow it."
            )
            return None

        reservation = Reservation(member, book)
        # setdefault ensures the deque exists, even on first reservation
        # for this title.
        self.reservations.setdefault(isbn, deque()).append(reservation)

        position = len(self.reservations[isbn])
        print(
            f"{member.name} reserved {book.title!r} "
            f"(position {position} in queue)"
        )
        return reservation

    # === Internal helpers ===

    def _fulfill_next_reservation(self, book: Book) -> None:
        """
        Called after a copy of `book` becomes available.
        If anyone has a reservation, notify the front of the queue.

        In our scope, "notify" is just printing. In a real system this
        would send an email/SMS, possibly start a hold timer (member has
        24 hours to come pick up the book before the next person is
        notified).
        """
        queue = self.reservations.get(book.isbn)
        if not queue:
            return   # No one waiting

        next_reservation = queue.popleft()
        print(
            f"  → Notifying {next_reservation.member.name}: "
            f"{book.title!r} is now available for you."
        )
```

A few details worth pointing out:

**1. `borrow()` does the cheap checks first (member exists, can_borrow_more) before the more expensive `available_copy()` check.** Fast failure is better engineering.

**2. The reservation queue check happens inside `return_book`.** This is a critical interaction point — the moment a book becomes available, we need to notify the next reservation. Easy to forget, but it's the whole point of having reservations.

**3. `reserve()` checks for an available copy first.** If a copy is available, queueing the reservation would be silly — the member should just borrow now. The method is honest with the caller about this.

**4. We use a deque for reservation queues.** O(1) operations from both ends. A list would have O(n) `pop(0)`.

---

## 11. Stage 10 — Validating with a Mental Walkthrough

Let's run a realistic scenario.

**Scenario:** A library with 2 copies of "The Pragmatic Programmer." Three members: Amit (student), Priya (faculty), Rohan (guest). They borrow, queue up, return.

```python
library = Library()

# Add a book with 2 copies.
book = Book("978-001", "The Pragmatic Programmer", "Hunt & Thomas", "Tech")
book.add_copy(BookItem(book, "PP-001"))
book.add_copy(BookItem(book, "PP-002"))
library.add_book(book)

# Add members.
amit = Member("M1", "Amit", "amit@x.com", StudentPolicy())
priya = Member("M2", "Priya", "priya@x.com", FacultyPolicy())
rohan = Member("M3", "Rohan", "rohan@x.com", GuestPolicy())
for m in (amit, priya, rohan):
    library.add_member(m)
```

State: 2 copies AVAILABLE. No loans. No reservations.

```python
loan_amit = library.borrow("M1", "978-001")
```

Trace:
- `borrow("M1", "978-001")`.
- Member found (Amit). Book found.
- `amit.can_borrow_more()` → 0 active loans, max 3. True.
- `book.available_copy()` → returns PP-001 (first AVAILABLE).
- Mark PP-001 BORROWED. Create Loan. Append to amit.active_loans. Add to library.active_loans.
- Print "Issued..."

State: 1 copy AVAILABLE (PP-002), 1 BORROWED (PP-001). Amit has 1 active loan.

```python
loan_priya = library.borrow("M2", "978-001")
```

- Same flow. PP-002 selected. Now BORROWED.

State: 0 copies available. Amit has 1, Priya has 1.

```python
loan_rohan = library.borrow("M3", "978-001")
```

- Member, book found. Rohan.can_borrow_more → 0 < 1, True.
- `book.available_copy()` → None (both BORROWED).
- Returns None. Print "No copies available."

State: unchanged.

```python
res_rohan = library.reserve("M3", "978-001")
```

- Member, book found.
- `book.available_copy()` → None. Good, queue the reservation.
- Reservation added to queue. Print "Rohan reserved... (position 1)".

State: queue has [Rohan's reservation].

```python
fine = library.return_book(loan_amit.id)
```

- Look up loan.
- Stamp return_date. Calculate fine.
- Loan was just created, so end_date - issue_date is tiny. 0.0 fine.
- Mark PP-001 AVAILABLE.
- Remove from active_loans.
- Check reservation queue for "978-001": queue not empty!
  - Pop Rohan from queue.
  - Print "Notifying Rohan...".

State: PP-001 AVAILABLE, queue empty. fine = 0.0.

In a richer system, the notification would actually trigger Rohan to come borrow it — and we'd want to "hold" the copy for him for some period. We don't model that yet. Let's note it as an extension.

```python
# Rohan now manually borrows.
loan_rohan = library.borrow("M3", "978-001")
```

- Member, book found.
- `rohan.can_borrow_more()` → 0 < 1, True.
- `book.available_copy()` → PP-001 AVAILABLE.
- Issue loan.

State: PP-001 BORROWED by Rohan, PP-002 BORROWED by Priya, queue empty.

✓ All transitions work. Reservation is correctly notified on return.

### Edge Cases to Consider

**Edge case 1: Member at borrowing limit tries to borrow.**

If Rohan (max 1) already has a loan and tries to borrow another:
- `can_borrow_more()` → False.
- Print "cannot borrow more". Return None.
- ✓ Correct.

**Edge case 2: Returning a non-existent loan.**

`library.return_book("nonexistent_id")` → `KeyError` from `self.active_loans[...]`. Loud failure. In production we'd catch and return a clean error. For our scope, KeyError is acceptable.

**Edge case 3: Reserving a book you can already borrow.**

- `book.available_copy()` is not None.
- Returns None with a message. ✓ Correct.

**Edge case 4: Multiple reservations for the same book.**

- queue has [A, B, C]. Copy returned. Notify A. Pop A.
- Next return: notify B. Pop B.
- ✓ FIFO works.

**Edge case 5: A reserved copy is "borrowed" by someone else before the reserved member gets to it.**

This is a real bug. After we notify Rohan, the copy is AVAILABLE. If Amit walks in and `borrow`s it, he gets it instead of Rohan.

In a real library, the notified person typically has a hold period (e.g., 24 hours) during which the copy is reserved for them. We don't model this. **Mention as an extension.**

> *"In a richer design, after notifying the front-of-queue member, the copy would be 'on hold' for them for some period — neither borrowable by others nor returnable to general circulation. We'd model this with a HOLD status on BookItem and a hold expiration time. For interview scope I've kept it simpler."*

That's a great self-critique to articulate.

---

## 12. Stage 11 — Anticipating Follow-Up Questions

### Q: "How would you handle multiple branches?"

Introduce `Branch`. Each branch has its own copies of books, its own members, its own queues. Books (titles) are shared across the system.

```python
class Branch:
    def __init__(self, name):
        self.name = name
        self.copies: list[BookItem] = []
        self.reservations: dict[str, deque[Reservation]] = {}

class LibrarySystem:
    def __init__(self):
        self.branches: dict[str, Branch] = {}
        self.books: dict[str, Book] = {}   # shared catalog
        self.members: dict[str, Member] = {}   # shared membership
```

Now operations specify which branch. Members can borrow from any branch. Inter-branch transfers become a thing.

This is significant complexity — easily another 200 lines. Don't write it unless asked.

### Q: "How would you support digital books?"

Abstract the borrowable concept:

```python
class BorrowableItem(ABC):
    @abstractmethod
    def is_available(self): ...
    @abstractmethod
    def acquire(self): ...
    @abstractmethod
    def release(self): ...

class BookItem(BorrowableItem): ...
class EbookLicense(BorrowableItem):
    """An ebook license — N concurrent users can have it 'checked out'."""
```

Loan would now reference a `BorrowableItem` rather than specifically a `BookItem`. The logic generalizes.

### Q: "How would you implement notifications for real?"

Use Observer. Library publishes events; consumers (email service, SMS service) subscribe.

```python
class LibraryEvent(ABC): ...
class ReservationFulfilled(LibraryEvent):
    member: Member; book: Book

class LibraryEventListener(ABC):
    @abstractmethod
    def on_event(self, event: LibraryEvent): ...

class EmailNotifier(LibraryEventListener):
    def on_event(self, event):
        if isinstance(event, ReservationFulfilled):
            self.send_email(event.member.email, ...)
```

Library would have an `event_listeners: list[LibraryEventListener]` and call `_notify(event)` at appropriate points.

### Q: "How would you persist all this?"

Repository pattern. Define `BookRepository`, `MemberRepository`, `LoanRepository` as interfaces. Provide in-memory and SQL implementations. Library depends on the interfaces.

```python
class BookRepository(ABC):
    @abstractmethod
    def save(self, book): ...
    @abstractmethod
    def find_by_isbn(self, isbn): ...

class Library:
    def __init__(self, books: BookRepository, members: MemberRepository, ...):
        self.books = books
        self.members = members
```

This is straightforward DIP. Library logic doesn't change; the storage backend does.

### Q: "What about concurrent borrowers?"

Two members trying to borrow the last copy at the same time. With our current code:
- Both call `borrow()`.
- Both find the same available copy.
- Both mark it BORROWED, both create loans. Bad.

Fix: lock the book during the borrow operation. Or use compare-and-swap on the copy's status (atomically transition AVAILABLE → BORROWED).

```python
def borrow(self, member_id, isbn):
    with self._lock:   # crude but works
        ...
```

For higher concurrency, use per-book locks (multiple books can be borrowed in parallel; only racing for the *same* book matters).

### Q: "How would you test this?"

Each component is testable:

- `MembershipPolicy`: trivial — assert returned values.
- `Loan.calculate_fine`: construct a Loan, manipulate dates, assert fines.
- `Book.available_copy`: add copies in various states, assert which is returned.
- `Library.borrow`: integration test — set up state, borrow, assert side effects (copy status, loan in dict, member's active_loans).

Tests run in milliseconds since everything is in-memory.

---

## 13. Final Reflection — What This Problem Teaches

### Lesson 1: Distinguish Title from Copy

The Book vs BookItem split is the most important decision in this design. It models reality: titles and physical copies are conceptually different things. Conflating them produces awkward APIs ("borrow this Book and decrement its quantity") and loses per-copy state.

This pattern generalizes: anytime you have a "type" and many "instances of that type" with their own state, model both as separate entities.

### Lesson 2: Policy Variation Belongs in Strategy, Not Subclasses

We chose composition (`Member` has-a `MembershipPolicy`) over inheritance (`Student extends Member`). The deciding factors:

- **Type changes are normal.** A guest enrolls → becomes a student. With composition, this is `member.policy = StudentPolicy()`. With inheritance, you'd have to construct a new `Student` and migrate state.
- **Multiple variation dimensions.** If we add another variation (e.g., "premium tier"), inheritance combinatorially explodes. Composition keeps each dimension orthogonal.

The general principle: **prefer composition when the "type" is mutable or when multiple varying dimensions exist.**

### Lesson 3: Tell, Don't Ask

`member.can_borrow_more()` is on the Member, not the Library. The library *asks* the member; it doesn't reach into the member's data and compute externally.

This Tell-Don't-Ask discipline keeps logic close to data, which is what good encapsulation is about.

### Lesson 4: Where Does Logic Go?

A recurring question in this design: should X live on entity A or entity B?

- **Fine calculation:** on Loan (it has the data).
- **Borrowing limit check:** on Member (it owns its policy and state).
- **Reservation queue:** on Library (it orchestrates returns and reservations).
- **Search:** in its own class (separation of concerns).

The principle: **logic belongs where the data lives**, with separation when concerns truly differ.

### Lesson 5: Walkthroughs Reveal Hidden Bugs

We found the "notified-but-not-held copy" issue only by walking through the reservation flow. Without that walkthrough, we'd have missed it. Always trace through your design.

Equally important: when we found the bug, we didn't pretend it didn't exist. We named it as a real-world concern, sketched the fix (HOLD status), and noted it as an extension. Self-critique scores points.

### Lesson 6: YAGNI — Defer Until You Need It

We didn't model:
- Multi-branch (wasn't required)
- Digital books (wasn't required)
- Notifications (mentioned only)
- Fine payment (out of scope)
- Librarian as an entity (no behavior)

Each of these is a real concern that could be added — but adding them speculatively would have made this design twice as long without making it better. The discipline of "we're not solving that yet" is essential.

---

**Onwards to the next problem: Vending Machine — where the State pattern shines once more, and we'll get into the weeds of inventory management and change-making logic.**
