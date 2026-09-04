# LLD Deep Dive #5: Designing Splitwise (Expense Sharing)

> **What this document is.** This is a complete, step by step walkthrough of how to design an expense sharing system of the kind popularised by the Splitwise application. It reasons from first principles, states the alternatives at every decision point, and justifies the option that is chosen. The design developed here is implemented as a small, runnable, modular Python project that accompanies this document, so that every concept discussed in prose can be examined and executed as real code.
>
> **How to use this document alongside the code.** Each design stage names the exact module in the accompanying project that implements the idea under discussion. The project is laid out under `splitwise_lld/`, and the module paths quoted in this document (for example `splitwise/core/balance_sheet.py`) refer to files inside that project. Reading the prose and the corresponding module together is the most effective way to absorb the material.
>
> **Prerequisites.** This is the fifth problem in the low level design series. It assumes familiarity with the design patterns covered earlier in the course, in particular the Strategy pattern, the Decorator pattern, the Observer pattern, and the Facade pattern, together with the SOLID principles. Where a pattern is applied, this document names it and connects it back to its earlier appearances so that the recurring structure becomes visible.

---

## Table of Contents

1. [Learning Objectives](#1-learning-objectives)
2. [Why This Problem Matters](#2-why-this-problem-matters)
3. [Stage 1: Receiving the Problem](#3-stage-1-receiving-the-problem)
4. [Stage 2: Clarifying Requirements](#4-stage-2-clarifying-requirements)
5. [Stage 3: Identifying the Entities](#5-stage-3-identifying-the-entities)
6. [Stage 4: The Central Decision, How to Represent Debt](#6-stage-4-the-central-decision-how-to-represent-debt)
7. [Stage 5: The Shape of the Project](#7-stage-5-the-shape-of-the-project)
8. [Stage 6: Representing Money in Minor Units](#8-stage-6-representing-money-in-minor-units)
9. [Stage 7: Modeling Users and Groups](#9-stage-7-modeling-users-and-groups)
10. [Stage 8: Split Types as a Strategy](#10-stage-8-split-types-as-a-strategy)
11. [Stage 9: The Expense and the Balance Update Rule](#11-stage-9-the-expense-and-the-balance-update-rule)
12. [Stage 10: The BalanceSheet as the Source of Truth](#12-stage-10-the-balancesheet-as-the-source-of-truth)
13. [Stage 11: Debt Simplification](#13-stage-11-debt-simplification)
14. [Stage 12: The ExpenseManager as a Facade](#14-stage-12-the-expensemanager-as-a-facade)
15. [Stage 13: Validating the Design with a Walkthrough](#15-stage-13-validating-the-design-with-a-walkthrough)
16. [Stage 14: Anticipating Follow Up Questions](#16-stage-14-anticipating-follow-up-questions)
17. [Stage 15: Running the Project in PyCharm](#17-stage-15-running-the-project-in-pycharm)
18. [Summary Tables](#18-summary-tables)
19. [Key Takeaways](#19-key-takeaways)
20. [Practice Questions and Solutions](#20-practice-questions-and-solutions)

---

## 1. Learning Objectives

By the end of this document a reader should be able to do the following. First, explain why the choice of data model is the most consequential decision in a data centred design problem, and defend the net balance model against the more obvious alternative of storing one record per transaction. Second, apply the Strategy pattern to a family of related algorithms and state the correctness contract that binds them. Third, describe and implement a greedy algorithm for reducing a set of mutual debts to a small number of settlement payments, and state honestly where that algorithm sits relative to the theoretical optimum. Fourth, assemble these parts behind a Facade so that the coordinating class remains thin. Fifth, run and extend the accompanying modular project.

A note on terminology before proceeding. **Low level design**, abbreviated LLD, refers to the activity of specifying the classes, their responsibilities, their relationships, and their interactions for a single system or component, as distinct from **high level design**, which concerns the arrangement of services, databases, and network boundaries across a whole distributed system. The present problem is an LLD problem, so the emphasis throughout is on classes, responsibilities, and the interactions between objects held in the memory of a single process.

---

## 2. Why This Problem Matters

Splitwise is the canonical problem for the skill of modeling money that flows between people. It is valuable in a design curriculum because it exercises two distinct competencies at the same time, and because it contains a tempting wrong path that teaches an important lesson when it is recognised and rejected.

The first competency is **domain modeling**, which is the activity of choosing the classes and the data structures that represent the concepts of the problem. The problem requires a representation of the fact that one person owes another a certain amount, and this representation must support the operations that the application performs most frequently. A representation that makes the common operation cheap is a good model, and a representation that makes the common operation expensive is a poor model even if it appears more natural at first sight.

The second competency is **algorithm design**. The feature that distinguishes a serious expense sharing system from a simple ledger is the ability to reduce a tangle of mutual debts to the smallest practical number of payments. This is a genuine computational problem with a well understood structure, and reasoning about it demonstrates that a candidate can move beyond arranging classes into designing the procedure that operates on them.

The problem also teaches restraint in the selection of patterns. Earlier problems in this series were built around behavioural patterns such as State. It would be a mistake to assume that every design must be organised around such a pattern. Splitwise has no state machine at its core. Its centre is a data model and an algorithm. Recognising that a problem does not call for a behavioural pattern, and resisting the urge to introduce one, is itself a mark of design maturity.

---

## 3. Stage 1: Receiving the Problem

The interviewer states the problem in a single sentence.

> "Design Splitwise."

A reader who has used the application will have strong intuitions, and those intuitions are a hazard rather than an asset at this moment. The application appears simple, because its visible behaviour is only the recording of who paid for what. Its true difficulty is concealed behind that surface, in the questions of how debt is represented and how a group of people can settle their mutual obligations with as few payments as possible.

The correct opening move is therefore not to begin declaring classes. It is to establish what the phrase "settling up" means in this system and how debt is to be represented, because that single decision determines the shape of everything that follows. The clarification stage that follows is the vehicle for establishing this.

---

## 4. Stage 2: Clarifying Requirements

A clarification round is a structured activity rather than a scatter of questions. The questions are organised into functional requirements, which describe what the system does, non functional requirements, which describe the qualities the system must possess, and an explicit statement of what lies outside the scope of the design. Each question below is presented together with the reason it influences the design, because asking a question without understanding why it matters is of little value.

### 4.1 Which kinds of split must the system support?

This is the largest single driver of the design. A system that only ever divides a cost equally requires one algorithm. A system that also divides by exact amounts, by percentage, and by weighted shares requires several algorithms that perform the same task differently. The presence of several interchangeable algorithms for one task is the precise condition under which the Strategy pattern applies.

Assume the interviewer answers that the system must support equal division, division by exact amounts, and division by percentage, and that division by weighted shares may be required later. The mention of a future requirement is significant, because it instructs the designer to build the mechanism for selecting a split algorithm in a way that admits a new algorithm without modification to the existing ones.

### 4.2 Does an expense have a single payer or several?

An expense in which one person settles the entire bill is considerably simpler to model than an expense whose cost is advanced by two or more people. The data model must record which case it is dealing with.

Assume the interviewer answers that a single payer per expense is sufficient for the first version, and that multiple payers are a desirable later addition. The design will therefore record one payer per expense and will note the extension explicitly.

### 4.3 Are groups required, or only pairwise expenses?

A group is a named collection of users, such as the participants in a trip or the members of a household. Groups change how expenses are organised and make it possible to settle the balances of one group in isolation.

Assume the interviewer answers that both are required. Users may share one off expenses with one another, and they may also form groups. The design will therefore include a Group entity that scopes a set of expenses without owning any balance information.

### 4.4 Must the system simplify debts?

This is the question that separates a serious system from a simple ledger. To **simplify debts** means to take a web of mutual obligations and produce the minimum practical set of payments that settles everyone to a zero balance. This is a real algorithmic feature and it is the most likely subject of a deep follow up.

Assume the interviewer answers that the system must be able to display the minimum number of transactions required to settle a group. This requirement must be flagged prominently, because it exerts a strong influence on the choice of debt representation made in the next stage.

### 4.5 Is more than one currency required?

Support for multiple currencies introduces conversion, fluctuating exchange rates, and additional rounding concerns. It is frequently excluded from a first version.

Assume the interviewer answers that a single currency is sufficient for now. The design will nevertheless store all amounts as integers in the smallest unit of the currency, for reasons of arithmetic correctness that are explained in Stage 6.

### 4.6 What are the non functional requirements?

These are the qualities of the system rather than its behaviours. The relevant ones here are persistence, meaning whether data must survive beyond the life of the process, scale, meaning how many users and expenses the system must accommodate, and concurrency, meaning whether several operations proceed at the same time.

Assume the interviewer answers that an in memory implementation is acceptable, that the system may be single threaded, and that the priority is a clean object model to which storage can be added later. The design will therefore hold all state in memory and will treat persistence and concurrency as extensions discussed at the end.

### 4.7 Restating the scope

After the clarification round the designer restates the agreed scope so that the interviewer can confirm or correct it before any class is written.

> "To confirm the scope: users record expenses that are paid by a single payer and divided equally, by exact amounts, or by percentage, with division by shares as a likely later addition, optionally within groups. The system tracks the net balance between users and can produce the minimum practical set of payments that settles a group. A single currency is used, and all amounts are stored as integers in the smallest currency unit to avoid rounding error. The implementation is in memory and single threaded, and persistence, concurrency, and multiple currencies are treated as extensions."

With the scope agreed, the design proceeds to the decision on which everything else depends.

---

## 5. Stage 3: Identifying the Entities

The candidate classes of a design are drawn from the nouns of the requirements. Not every noun deserves a class. A noun becomes a class only if it possesses its own identity, meaning that the system must refer to a specific instance of it over time, and its own behaviour or state, meaning that it does more than hold a single value. Nouns that are merely values become fields or value objects, and nouns that describe actors outside the system are not modelled at all.

The following table records this analysis for the nouns that arise in the Splitwise requirements.

| Noun | Has identity | Has state or behaviour | Verdict |
|---|---|---|---|
| User | Yes | Yes, participates in expenses | Entity class |
| Group | Yes | Yes, holds members and expenses | Entity class |
| Expense | Yes | Yes, records payer, total, and shares | Entity class |
| Split | No | Holds one user and one amount | Value object |
| Split type such as equal or percentage | No | An algorithm | Strategy, not an entity |
| Balance or debt | Not applicable | The central data of the system | Resolved in Stage 4 |
| Settlement or payment | Yes | Records a transfer | Modelled as a reverse debt and a result type |
| Currency amount | No | A single value | Integer field in minor units |
| Expense manager | Yes | Coordinates the subsystem | Facade class |

Two verdicts deserve comment. The split type is not an entity, because it has no identity and consists only of an algorithm. It is therefore modelled as a Strategy. The balance is the one cell of the table that cannot be resolved by inspection, because the choice of representation is itself the principal design decision. It is given its own stage.

The skeleton that emerges from this analysis is as follows. The entity classes are `User`, `Group`, and `Expense`, supported by the `Split` value object. The splitting algorithms form a Strategy hierarchy. The balance representation and the settlement algorithm form the core of the system, and a coordinating class ties everything together. Each of these appears as a module in the accompanying project, which is described in Stage 5.

---

## 6. Stage 4: The Central Decision, How to Represent Debt

Every subsequent decision depends on how debt is represented, so this stage examines the options with the care the decision deserves. Three representations are considered.

### 6.1 Approach A: One debt record per expense

Under this approach the system stores, for every expense, an individual record for each obligation that the expense creates, such as a record stating that Alice owes Bob two hundred as a result of a particular dinner. All such records are retained in a list.

The advantage of this approach is that it preserves a complete and literal history. It is possible to trace every obligation back to the expense that produced it.

The disadvantages are decisive. The most frequent question the application must answer is how much one user owes another in total, and under this approach that question requires a scan and summation of every record between the two users, which costs time proportional to the length of the entire history. Furthermore, obligations never cancel. If Alice owes Bob two hundred and Bob later owes Alice two hundred, the approach stores two records and never recognises that they offset one another. The stored data grows without bound and never simplifies, and settling up requires locating and neutralising records scattered throughout the history.

### 6.2 Approach B: A pairwise net balance map

Under this approach the system maintains, for every ordered pair of users, a single number representing the net amount one owes the other. The entry `balance[A][B]` holds the amount that A owes B, and a negative value indicates that B in fact owes A. Every expense updates the relevant entries.

The advantages are substantial. The question of how much one user owes another is answered in constant time by a single lookup. Obligations cancel automatically, because an offsetting expense simply moves the stored number toward zero. The stored data is compact, requiring at most one number per pair of users that has ever transacted.

The one apparent disadvantage, that the per expense history is not visible in the balance itself, is not a genuine loss, because the list of expenses is retained separately as an immutable history for auditing. The balance map and the expense history serve different purposes and coexist without conflict. A second consideration is that the representation must be kept consistent, so that the entry for A owing B always equals the negation of the entry for B owing A. This consistency requirement is addressed in Stage 10 by confining all mutation to a single method.

### 6.3 Approach C: A single net position per user

Under this approach each user carries one number representing the total amount they have overpaid or underpaid across all expenses. A positive number means the user is owed money overall, and a negative number means the user owes money overall.

The advantage is that this is the smallest possible representation, requiring one number per user, and it is precisely the input required by the debt simplification algorithm.

The disadvantage is that it is too lossy to serve as the source of truth, because it cannot answer the question of how much one specific user owes another. It records only the aggregate position of each user.

### 6.4 The decision

The design adopts **Approach B, the pairwise net balance map, as the source of truth, and derives Approach C, the net position per user, on demand** for the purpose of debt simplification.

The reasoning is as follows. Approach A is the intuitive path and it is the trap, because it makes the most common query expensive and never allows debts to cancel. Approach B answers the common query in constant time and cancels offsetting debts automatically, which is the defining behaviour of an expense sharing application. Approach C is ideal as the input to the simplification algorithm but too lossy to be the source of truth, so rather than storing it separately the design computes it from Approach B whenever it is needed. The result combines the strengths of both: the pairwise map holds the precise truth, and the net position per user is a projection derived from that truth when the algorithm requires it.

This choice is an instance of a principle that recurs throughout good design, namely **derive rather than duplicate**. When one quantity can be computed from another, storing both invites the two copies to drift out of agreement. Computing the net position from the pairwise map on demand guarantees that the two views can never disagree, because there is only one stored copy of the information.

The pairwise map is implemented in `splitwise/core/balance_sheet.py` and the derivation of net positions is the `net_position` method of that same module. The full analysis of that module appears in Stage 10.

---

## 7. Stage 5: The Shape of the Project

Before implementing the classes it is worth establishing the structure of the project, because a modular arrangement makes the responsibilities visible and keeps each concept in a place where it can be studied and tested in isolation. The accompanying project is organised into four layers, each of which is a Python package.

The **domain layer**, under `splitwise/domain/`, contains the passive data types and the money helpers. These are the `User`, `Group`, `Split`, and `Expense` types together with the money conversion and formatting functions. A passive data type holds information and enforces its own small invariants but does not orchestrate the behaviour of other objects.

The **strategy layer**, under `splitwise/strategies/`, contains the interchangeable splitting algorithms. It holds the abstract `SplitStrategy` interface and the concrete implementations for equal, exact, percentage, and shares based division.

The **core layer**, under `splitwise/core/`, contains the two most important pieces of the design, namely the `BalanceSheet`, which is the source of truth for debt, and the `DebtSimplifier`, which is the settlement algorithm.

The **service layer**, under `splitwise/services/`, contains the `ExpenseManager`, which is the facade that coordinates the other layers and presents a small interface to the outside world.

This separation into layers is a direct application of the Single Responsibility Principle at the level of packages rather than classes. A change to the formatting of money touches only the domain layer, a new splitting algorithm touches only the strategy layer, and a change to the settlement algorithm touches only the core layer. The dependencies flow in one direction, from the service layer inward to the core, strategy, and domain layers, so that the passive data types at the centre depend on nothing above them.

The following table maps each design concept to the module that implements it.

| Concept | Module |
|---|---|
| Money convention and formatting | `splitwise/domain/money.py` |
| User identity | `splitwise/domain/user.py` |
| One participant's share of one expense | `splitwise/domain/split.py` |
| Immutable record of a spending event | `splitwise/domain/expense.py` |
| Named collection of users | `splitwise/domain/group.py` |
| Interchangeable splitting algorithms | `splitwise/strategies/split_strategy.py` |
| Source of truth for debt | `splitwise/core/balance_sheet.py` |
| Settlement algorithm | `splitwise/core/debt_simplifier.py` |
| Coordinating facade | `splitwise/services/expense_manager.py` |
| Demonstration | `main.py` |

---

## 8. Stage 6: Representing Money in Minor Units

Money is stored throughout the system as an integer count of the smallest indivisible unit of the currency, which is referred to as the **minor unit**. For the Indian rupee the minor unit is the paisa, of which there are one hundred to a rupee, and for the United States dollar the minor unit is the cent. This convention is established in `splitwise/domain/money.py`.

The justification is a matter of arithmetic correctness. A floating point number cannot represent most decimal fractions exactly, because it stores values in binary. The consequence is that an expression such as the sum of one tenth and two tenths does not equal three tenths in floating point arithmetic, but differs from it by a minute error. Financial software that stores money as a floating point number of rupees accumulates these errors across many operations and eventually reports balances that are incorrect by a fraction of a unit. Storing money as an integer count of minor units removes this class of error completely, because integer arithmetic in Python is exact and is not subject to a fixed width overflow.

The module provides two helpers. The `rupees` function converts a human readable rupee amount into integer paise, so that demonstration code and tests may be written in familiar units while the system stores paise internally. The `format_paise` function renders an integer paise amount as a readable rupee string, handling the sign explicitly so that negative balances display cleanly and always showing two digits for the paise portion so that amounts align when printed in a column.

The decision to store money as integers is small in code but significant in what it signals about the maturity of the design, and it is worth stating aloud when presenting the solution.

---

## 9. Stage 7: Modeling Users and Groups

The user and group classes are deliberately thin. They are implemented in `splitwise/domain/user.py` and `splitwise/domain/group.py`.

A **User** is an entity, which means it has a stable identity that persists across many expenses and balances. The identity is a universally unique identifier assigned at construction, so that two user records are regarded as the same user precisely when they share this identifier, regardless of any later change to name or email. The `User` class overrides the hashing and equality operations to be based on this identifier, because user objects are used as dictionary keys inside the balance model, and a dictionary key must have a stable hash that does not depend on mutable fields.

```python
import uuid


class User:
    """A person who can pay for and participate in expenses."""

    def __init__(self, name: str, email: str):
        self.user_id: str = str(uuid.uuid4())
        self.name: str = name
        self.email: str = email

    def __hash__(self) -> int:
        return hash(self.user_id)

    def __eq__(self, other: object) -> bool:
        return isinstance(other, User) and self.user_id == other.user_id
```

A **User** deliberately holds no balance information. A balance is a relationship between two users rather than a property of a single user, and placing it inside the user class would scatter the source of truth for debt across many objects and invite inconsistency. This is an application of the Single Responsibility Principle: the user class is responsible for identity and profile data and for nothing else. The balance is held instead in the `BalanceSheet` described in Stage 10.

A **Group** is a named collection of users that provides a scope within which expenses are organised. It records which users belong together and, by identifier, which expenses were charged to the group. Like the user, it holds no balance information, because the balance remains the exclusive responsibility of the `BalanceSheet`. Keeping the source of truth for debt in exactly one place is the same discipline applied twice, once to the user and once to the group.

---

## 10. Stage 8: Split Types as a Strategy

The division of an expense among its participants is a task that admits several algorithms, namely equal division, division by exact amounts, division by percentage, and division by weighted shares. A single well defined task that has several interchangeable implementations is the defining condition of the **Strategy pattern**, which is the pattern that encapsulates each algorithm in its own class behind a common interface so that the algorithm can be selected and exchanged without altering the code that uses it.

This is the fourth appearance of the Strategy pattern in this series. It was used for pricing in the parking lot problem, for scheduling and target selection in the elevator problem, and for change making in the vending machine problem. The recurring signal is the presence of several interchangeable algorithms for one task, together with the expectation that further algorithms may be added. When the interviewer stated in Stage 2 that division by shares might be required later, that statement was in effect an instruction to use the Strategy pattern, because only an open ended mechanism for selecting an algorithm accommodates a future addition without modification to the existing algorithms.

### 10.1 The result type

The output of a splitting algorithm is a list of shares, one per participant. Each share is represented by the `Split` value object defined in `splitwise/domain/split.py`. A **value object** is an object that has no identity of its own and is defined entirely by its contents. The class is declared frozen, meaning immutable, so that a computed share cannot be altered after it has been produced, which removes an entire category of defects in which a share is accidentally modified after the expense has been recorded.

```python
from dataclasses import dataclass

from splitwise.domain.user import User


@dataclass(frozen=True)
class Split:
    user: User
    amount: int
```

### 10.2 The interface and its correctness contract

The abstract interface, defined in `splitwise/strategies/split_strategy.py`, declares a single method that divides a total among a list of participants and returns one `Split` per participant.

```python
from abc import ABC, abstractmethod
from typing import List

from splitwise.domain.split import Split
from splitwise.domain.user import User


class SplitStrategy(ABC):
    """Abstract interface for an algorithm that divides an expense."""

    @abstractmethod
    def calculate(self, total_amount: int,
                  participants: List[User]) -> List[Split]:
        raise NotImplementedError
```

Every implementation is bound by a correctness contract that is as important as the interface itself. The amounts of the returned shares must sum exactly to the total amount of the expense. Money must never be created or lost through rounding. Where integer division leaves a remainder, the implementation is responsible for distributing that remainder deterministically, so that the sum remains exact. This contract is the reason the money is stored in minor units, because a remainder can then be assigned as a whole number of minor units rather than lost to a floating point approximation.

### 10.3 Equal division

The equal strategy divides the total into equal shares. Because an integer total rarely divides evenly among the participants, the remainder is distributed one minor unit at a time to the first participants in the list. This satisfies the contract while distributing the unavoidable rounding difference in a deterministic manner. A total of three hundred and one paise divided among three participants therefore yields shares of one hundred and one, one hundred, and one hundred.

```python
class EqualSplit(SplitStrategy):
    def calculate(self, total_amount, participants):
        count = len(participants)
        if count == 0:
            raise ValueError("Cannot split an expense among zero participants")
        base_share = total_amount // count
        remainder = total_amount - base_share * count
        splits = []
        for index, user in enumerate(participants):
            extra = 1 if index < remainder else 0
            splits.append(Split(user, base_share + extra))
        return splits
```

### 10.4 Division by exact amounts

The exact strategy assigns an explicitly specified amount to each participant. The amounts are supplied to the strategy through its constructor, which is why the strategy object encapsulates both the algorithm and its configuration. The strategy validates that the supplied amounts sum to the expense total, because a set of exact amounts that does not reconcile with the total is an error on the part of the caller that must be rejected rather than silently absorbed.

```python
class ExactSplit(SplitStrategy):
    def __init__(self, amounts):
        self._amounts = dict(amounts)

    def calculate(self, total_amount, participants):
        supplied_total = sum(self._amounts.get(u, 0) for u in participants)
        if supplied_total != total_amount:
            raise ValueError(
                f"Exact amounts sum to {supplied_total} "
                f"but the expense total is {total_amount}")
        return [Split(u, self._amounts[u]) for u in participants]
```

### 10.5 Division by percentage and by shares

The percentage strategy divides the total according to a percentage assigned to each participant, requiring that the percentages sum to one hundred. The shares strategy divides the total in proportion to a set of integer weights, which expresses a ratio directly. In both cases the percentages or shares are converted to integer minor units by rounding, and the final participant receives the exact residual so that the shares still sum to the total. This preservation of the total despite intermediate rounding is the mechanism by which the correctness contract is honoured. The full implementations of both strategies appear in `splitwise/strategies/split_strategy.py`.

### 10.6 Why the strategy object carries its configuration

An alternative design would pass the per participant inputs, such as the exact amounts or the percentages, into the `calculate` method rather than into the constructor. The chosen design places them in the constructor so that the `calculate` method has a uniform signature across every strategy, taking only the total and the participants. This uniformity is what allows the `ExpenseManager` to hold a strategy of any concrete type behind the abstract interface and invoke it without knowing which concrete algorithm it holds. The strategy object thereby encapsulates both the algorithm and the parameters that algorithm requires, which is the more complete expression of the Strategy pattern.

---

## 11. Stage 9: The Expense and the Balance Update Rule

An **Expense** is an immutable record of a single spending event, implemented in `splitwise/domain/expense.py`. It captures the payer, the total amount, and the list of per participant shares produced by a splitting strategy. It is an entity because the system retains a history of expenses for auditing and for display.

The expense is deliberately passive. It does not update balances and it contains no splitting logic. The division of the total into shares is performed by a strategy before the expense is constructed, and the recording of the resulting debts is performed by the `ExpenseManager`. Keeping the expense passive means it can be stored, listed, and replayed without triggering side effects, which in turn makes it possible to rebuild the balance model from the expense history should that ever be required.

The rule by which an expense updates the balances is the conceptual centre of the system, and it is stated precisely as follows. When one participant, the payer, settles the entire bill, every other participant owes the payer the amount of their own share. The payer's own share requires no entry, because the payer has already paid for it. This rule is applied in the `ExpenseManager` and not in the expense, so that the expense remains a passive record and the mutation of the balance model is confined to a single place.

---

## 12. Stage 10: The BalanceSheet as the Source of Truth

The `BalanceSheet`, implemented in `splitwise/core/balance_sheet.py`, is the concrete form of Approach B from Stage 4. It is the single source of truth for who owes whom, and it stores a pairwise net balance for every ordered pair of users that has transacted.

The entry `balance[debtor][creditor]` holds the net amount, in minor units, that the debtor currently owes the creditor. A positive value means the debtor owes the creditor, and a negative value means the creditor owes the debtor. The class maintains an **antisymmetry invariant**, which is the property that for every pair of users A and B the entry for A owing B equals the negation of the entry for B owing A. This invariant is what allows offsetting debts to cancel automatically, because an obligation in one direction and an equal obligation in the other direction sum to zero in both entries.

```python
from collections import defaultdict
from typing import Dict

from splitwise.domain.user import User


class BalanceSheet:
    def __init__(self):
        self._balances: Dict[User, Dict[User, int]] = defaultdict(
            lambda: defaultdict(int))

    def record_debt(self, debtor: User, creditor: User, amount: int) -> None:
        if debtor == creditor or amount == 0:
            return
        self._balances[debtor][creditor] += amount
        self._balances[creditor][debtor] -= amount

    def amount_owed(self, debtor: User, creditor: User) -> int:
        return self._balances.get(debtor, {}).get(creditor, 0)

    def net_position(self, user: User) -> int:
        total = 0
        for other in list(self._balances.keys()):
            if other == user:
                continue
            total += self._balances[other].get(user, 0)
        return total
```

The invariant is preserved by a single design decision, namely that the only method which mutates the balances, `record_debt`, updates both directions together. Because every mutation passes through this one method, and that method always adjusts both entries, no caller can ever leave the two entries inconsistent. This is a general and valuable technique: an invariant that is enforced in exactly one place cannot be violated from anywhere else.

The `net_position` method is the derivation of Approach C from the pairwise map. It computes a user's single net position by summing, over every other user, the amount that the other user owes this user. Because of the antisymmetry invariant this single sum accounts for amounts flowing in both directions, so a positive result means the user is owed money overall and a negative result means the user owes money overall. The method reads the entries with a defensive lookup so that querying a pair that has never transacted does not create spurious entries in the map.

---

## 13. Stage 11: Debt Simplification

Debt simplification is the algorithmic centrepiece of the system, implemented in `splitwise/core/debt_simplifier.py`. The task is to take the net position of every user and produce a small set of payments that settles everyone to a zero balance.

### 13.1 The insight that reduces the problem

Once the balances have been reduced to net positions, the original detail of who owed whom is no longer relevant to the task of settlement. The only facts that matter are how much each user owes or is owed. The users with a negative net position are debtors who must pay, the users with a positive net position are creditors who must be paid, and the total owed equals the total that is owed, because the balance model conserves money. The problem is therefore to move money from the debtors to the creditors using as few transfers as possible.

### 13.2 The greedy algorithm

The algorithm repeatedly matches the user who owes the most with the user who is owed the most, and settles the smaller of the two magnitudes between them. Each such transfer reduces at least one of the two users to a zero balance, so the number of participants who still carry a balance strictly decreases at every step and the procedure terminates.

The implementation uses two heaps. A **heap**, also called a priority queue, is a data structure that allows the largest or smallest element of a collection to be retrieved efficiently. Python provides a min heap, which yields the smallest element first, so the magnitudes are negated in order to obtain the behaviour of a max heap, which yields the largest element first. One heap holds the creditors ordered by the amount they are owed, and the other holds the debtors ordered by the magnitude of what they owe.

```python
import heapq
import itertools
from dataclasses import dataclass
from typing import Dict, List

from splitwise.domain.user import User


@dataclass(frozen=True)
class Settlement:
    debtor: User
    creditor: User
    amount: int


class DebtSimplifier:
    def simplify(self, net_positions: Dict[User, int]) -> List[Settlement]:
        counter = itertools.count()
        creditors, debtors = [], []
        for user, amount in net_positions.items():
            if amount > 0:
                heapq.heappush(creditors, (-amount, next(counter), user))
            elif amount < 0:
                heapq.heappush(debtors, (amount, next(counter), user))

        settlements = []
        while creditors and debtors:
            owed_negated, _, creditor = heapq.heappop(creditors)
            owe_signed, _, debtor = heapq.heappop(debtors)
            owed, owe = -owed_negated, -owe_signed
            transfer = min(owed, owe)
            settlements.append(Settlement(debtor, creditor, transfer))
            if owed - transfer > 0:
                heapq.heappush(creditors, (-(owed - transfer), next(counter), creditor))
            if owe - transfer > 0:
                heapq.heappush(debtors, (-(owe - transfer), next(counter), debtor))
        return settlements
```

A detail of the implementation deserves explanation. Each heap entry contains a monotonic counter value between the magnitude and the user. This counter is a tie breaker. Without it, two entries of equal magnitude would cause the heap to compare the user objects, and because user objects are not ordered this comparison would raise an error. The counter, being unique and ordered, ensures that the comparison never reaches the user object.

### 13.3 Optimality and complexity

An honest account of the algorithm requires stating where it sits relative to the theoretical optimum. Producing the provably minimum number of transfers is **NP hard** in the general case, which means that no algorithm is known that solves every instance optimally in time that grows only polynomially with the number of users, and the problem is believed to admit none. The difficulty arises because the problem is related to the partition problem, in which one seeks to divide a set of numbers into groups of equal sum. The greedy matching used here is therefore a heuristic rather than an exact optimiser. It is the standard near optimal heuristic, it runs quickly, and it produces very few transfers in practice, which is why real expense sharing applications use it. Stating this boundary plainly, rather than claiming that the greedy result is provably minimal, is the mark of an engineer who understands the solution rather than one who has memorised it.

The complexity of the algorithm is as follows. Building the two heaps costs time proportional to the number of users multiplied by the logarithm of that number. Each transfer removes at least one participant, so there are at most as many transfers as there are users, and each heap operation costs time proportional to the logarithm of the number of users. The overall cost is therefore proportional to the number of users multiplied by the logarithm of that number.

### 13.4 Why greedy matching outperforms arbitrary pairing

Matching the largest debtor with the largest creditor at each step maximises the chance of reducing at least one participant to zero at every transfer, which minimises the total number of transfers. Pairing participants in an arbitrary order can leave small residual amounts that require additional transfers to clear. The greedy rule consistently eliminates a participant at each step and avoids creating new small residuals, which keeps the number of transfers low.

---

## 14. Stage 12: The ExpenseManager as a Facade

The `ExpenseManager`, implemented in `splitwise/services/expense_manager.py`, is a **Facade**, which is the structural pattern that presents a small and stable interface over a subsystem of several cooperating classes. Client code adds an expense, records a settlement, queries a balance, or requests a simplified settlement plan, and never needs to interact with the splitting strategies, the balance sheet, or the debt simplifier directly.

The manager holds no algorithmic logic of its own. It does not compute splits, because that is the responsibility of a strategy. It does not maintain the antisymmetry invariant, because that is the responsibility of the balance sheet. It does not compute settlement plans, because that is the responsibility of the debt simplifier. Keeping the coordinator thin is what prevents it from growing into a single class that accumulates every responsibility in the system, a failure that was identified in the first problem of this series and that recurs whenever a coordinating class is allowed to absorb the work of its collaborators.

```python
class ExpenseManager:
    def __init__(self):
        self.balance_sheet = BalanceSheet()
        self.expenses = []
        self._simplifier = DebtSimplifier()

    def add_expense(self, description, total_amount, paid_by,
                    participants, strategy):
        splits = strategy.calculate(total_amount, participants)
        computed_total = sum(split.amount for split in splits)
        if computed_total != total_amount:
            raise ValueError(
                f"Splits sum to {computed_total} rather than {total_amount}")
        expense = Expense(description, total_amount, paid_by, splits)
        self.expenses.append(expense)
        for split in splits:
            if split.user != paid_by:
                self.balance_sheet.record_debt(
                    debtor=split.user, creditor=paid_by, amount=split.amount)
        return expense

    def settle_up(self, payer, payee, amount):
        self.balance_sheet.record_debt(debtor=payee, creditor=payer, amount=amount)

    def simplify_debts(self):
        return self._simplifier.simplify(self.balance_sheet.all_net_positions())
```

Two aspects of this class merit attention. First, the splitting strategy is passed into `add_expense` by the caller rather than chosen inside the method. This is an application of the **Dependency Inversion Principle**, under which a high level component depends on an abstraction rather than on a concrete implementation. The manager depends on the abstract `SplitStrategy` interface and is therefore indifferent to which concrete algorithm it receives, which allows a new algorithm to be introduced without any change to the manager.

Second, the `settle_up` method reveals a useful unification. A real world payment from one person to another is modelled as a debt in the opposite direction, because when the payer hands money to the payee the amount the payer owes the payee is reduced. This reuse of the existing debt machinery means that settling up requires no separate code path. Recognising that a payment and an obligation are the same operation viewed from opposite directions is exactly the kind of simplification that a clean data model makes available.

The `add_expense` method also validates that the shares returned by the strategy sum to the total before recording any debt. Although every supplied strategy is expected to honour the correctness contract, verifying it at the boundary protects the balance model from a faulty strategy, and a faulty balance model would be far harder to diagnose than a rejected expense.

---

## 15. Stage 13: Validating the Design with a Walkthrough

A design that has not been simulated is a design that is not yet trusted. The following walkthrough traces the classic three friends trip, which is also the scenario implemented in `main.py` and asserted in the test suite. The amounts are written in rupees for readability and are stored internally as paise.

The participants are Alice, Bob, and Carol. The first expense is a dinner of three hundred paid by Alice and divided equally, which makes Bob and Carol each owe Alice one hundred, while Alice's own share of one hundred requires no entry. The second expense is a cab fare of three hundred paid by Bob and divided equally, which makes Alice and Carol each owe Bob one hundred. At this point the obligation between Alice and Bob illustrates the central advantage of the chosen model. Alice now owes Bob one hundred from the cab, and Bob owed Alice one hundred from the dinner, so the two entries cancel and the balance between Alice and Bob returns to zero automatically, without any special handling.

After these two expenses Carol owes one hundred to each of Alice and Bob. If a third expense is added, namely tickets of six hundred paid by Carol and divided in the proportion fifty, twenty five, and twenty five percent, then Alice owes Carol three hundred and Bob owes Carol one hundred and fifty, while Carol's own share requires no entry. The resulting net positions are that Alice owes two hundred, Bob owes fifty, and Carol is owed two hundred and fifty, and these three figures sum to zero as required by the conservation of money.

The simplification of these positions proceeds as follows. Carol is the sole creditor, owed two hundred and fifty. The largest debtor is Alice, owing two hundred, who pays Carol two hundred and is thereby reduced to zero. The remaining debtor is Bob, owing fifty, who pays Carol fifty, and both are reduced to zero. The settlement plan is therefore two payments, Alice to Carol of two hundred and Bob to Carol of fifty, which is the minimum for this configuration. This is exactly the output produced by `main.py`, and it is asserted by the tests in `tests/test_expense_manager.py`.

The walkthrough confirms the property that most distinguishes the chosen model, namely that the obligation between Alice and Bob cancelled itself the moment the offsetting expense was recorded. Under the rejected Approach A the system would carry several stale records and would be obliged to discover the cancellation during simplification. The chosen model made the difficult behaviour automatic, and this is the point worth emphasising when presenting the design.

The walkthrough also surfaces a matter that is a scope note rather than a defect. The equal division assigns any leftover minor units to the first participants in the list. For a total that divides evenly this is invisible, but for a total that does not divide evenly the first participants pay one minor unit more than the others. The distribution is deterministic and the sum is exact, but a refinement worth mentioning is to rotate which participant absorbs the remainder across successive expenses, so that the burden of the leftover unit is shared over time.

---

## 16. Stage 14: Anticipating Follow Up Questions

### 16.1 How would the system support several payers on one expense?

The single payer field would be replaced by a mapping from payer to the amount that payer advanced, with the amounts summing to the total. The balance update rule generalises so that each participant owes each payer a proportional share. Neither the balance sheet nor the strategies change, because only the bookkeeping loop inside the manager is affected. The isolation of the balance update inside a single method is what confines the change to one place.

### 16.2 How would a new split type be added?

A new split type is introduced as a new class that implements the `SplitStrategy` interface, such as the shares based strategy already present in the project. No existing strategy and no other component requires modification, which is the property described by the **Open Closed Principle**, under which software should be open to extension but closed to modification. This is the benefit for which the Strategy seam was created in Stage 8.

### 16.3 How would the system support several currencies?

Money would become a value object carrying both an amount in minor units and a currency, and balances would be tracked separately per currency, because a user may owe an amount in one currency and be owed an amount in another. Cross currency settlement would require an exchange rate service, which would be injected as a dependency in accordance with the Dependency Inversion Principle. This is a substantial extension and would be scoped as such rather than built into the first version.

### 16.4 How would users be notified when they are added to an expense?

Notification is the province of the **Observer pattern**, under which a subject maintains a list of observers and informs them when an event occurs. The manager or the group would act as the subject, and notifiers for email and for push messages would act as observers, each informed when an expense is added. This is the same pattern that drove the display boards in the parking lot problem. It is not built in the first version, in accordance with the principle of not adding capability before it is required, but the point at which it would attach is clear.

### 16.5 How would the system persist data?

Two approaches are available. The first is to persist only the immutable expense history and to rebuild the balance sheet by replaying that history when the system starts, which is safe because the balances are derivable from the history. The second is to persist the balances directly through a repository abstraction for speed, with periodic reconciliation against a replay. In both cases the repository is introduced as an abstraction on which the manager depends, again in accordance with the Dependency Inversion Principle. That the balances can be replayed from history is a direct dividend of having kept the expense an immutable record.

### 16.6 Is the settlement plan guaranteed to be minimal?

It is not, and this must be stated plainly. The exact minimisation of the number of transfers is NP hard, so the greedy heuristic is used instead. It is near optimal, it runs quickly, and it is what production applications use. If exact minimality were required for small groups, an exact solver based on examining subsets could be added for groups below a modest size, with the greedy heuristic used beyond that threshold.

### 16.7 How would the design be tested?

The design is highly testable, which is a consequence of its separation of concerns. The strategies are pure functions of their inputs and are tested by asserting that their output sums to the total and divides correctly. The balance sheet is tested by asserting the antisymmetry invariant and the automatic cancellation of offsetting debts. The simplifier is tested by supplying crafted net positions and asserting that the settlements conserve money, clear every balance, and are few in number. The manager is tested end to end with the three friends trip. The accompanying project contains all of these tests under the `tests` directory, and they may be run with a single command.

---

## 17. Stage 15: Running the Project in PyCharm

The accompanying project is arranged so that it can be demonstrated directly in the PyCharm integrated development environment. The steps are as follows.

First, open the project by choosing Open from the PyCharm welcome screen and selecting the `splitwise_lld` folder. PyCharm indexes the project and recognises the package structure. If prompted, mark the project root as a sources root so that the imports of the form `from splitwise.domain.user import User` resolve correctly.

Second, run the demonstration by right clicking the file `main.py` in the project view and choosing the run action. The output shows the three expenses, the resulting net positions, and the simplified settlement plan in which Carol is paid by both Alice and Bob. This provides a concrete artefact to project during a class.

Third, run the test suite by right clicking the `tests` folder and choosing the option to run the tests within it. PyCharm displays the results in its test runner, and all tests should pass. Running the tests live demonstrates that the design behaves as the walkthrough claimed, and it allows a lesson to show the effect of deliberately breaking a piece of code and observing which test fails.

A recommended order for presenting the code in a class follows the direction of the dependencies, from the innermost data types outward to the coordinator. Begin with the money module to establish the minor unit convention, proceed to the user, split, expense, and group types, then to the splitting strategies, then to the balance sheet, which contains the central modeling decision, then to the debt simplifier, then to the expense manager, and finally to the demonstration in `main.py`, which shows the whole system in operation.

---

## 18. Summary Tables

The following table summarises the classes of the design, their responsibilities, and the design idea each one embodies.

| Class or module | Responsibility | Design idea embodied |
|---|---|---|
| `User` | Identity and profile of a person | Entity with identity based equality |
| `Group` | A named scope for a set of expenses | Entity that holds no balance data |
| `Split` | One participant's share of one expense | Immutable value object |
| `Expense` | Immutable record of a spending event | Passive entity supporting replay |
| `SplitStrategy` and subclasses | Interchangeable division algorithms | Strategy pattern |
| `BalanceSheet` | Source of truth for pairwise debt | Net balance model, single mutation point |
| `DebtSimplifier` | Minimal set of settlement payments | Greedy heuristic over a heap |
| `ExpenseManager` | Coordination of the subsystem | Facade with dependency injection |

The following table summarises the design decisions, the alternatives that were considered, and the reason for the choice.

| Decision | Alternatives considered | Reason for the choice |
|---|---|---|
| Store money as integer minor units | Floating point rupees | Integer arithmetic is exact and avoids rounding error |
| Represent debt as a pairwise net map | One record per expense; single net position per user | Constant time queries and automatic cancellation, with net positions derived on demand |
| Encapsulate split algorithms as strategies | A single method with conditional branches | New algorithms added without modifying existing ones |
| Confine balance mutation to one method | Allow callers to update entries directly | The antisymmetry invariant cannot then be violated |
| Simplify debts with a greedy heuristic | An exact optimiser | Exact minimisation is NP hard, and greedy is near optimal and fast |
| Coordinate through a thin facade | A single class holding all logic | Prevents the coordinator from becoming a class that absorbs every responsibility |

---

## 19. Key Takeaways

The data model is the design. The single decision to represent debt as a pairwise net map, with net positions derived on demand, made every subsequent operation efficient and made offsetting debts cancel automatically. The rejected alternative of storing one record per expense would have made the most common query expensive and would never have allowed debts to cancel. In a data centred problem the greatest share of the reasoning budget should be spent on the choice of model.

Derive rather than duplicate. The net position of a user is computed from the pairwise map rather than stored, and the balances can be replayed from the immutable expense history. Each derivation removes an opportunity for two copies of the same information to disagree.

Money requires integer minor units and explicit handling of rounding. Amounts are stored as integers, and every splitting strategy distributes any rounding remainder deterministically so that the shares sum exactly to the total. In a financial system rounding is a first class concern rather than an afterthought.

Not every problem calls for a behavioural pattern. This design contains no state machine, and introducing one would have been a mistake. Its centre is a data model and an algorithm. Recognising when not to apply a pattern is part of the skill of applying patterns well.

Invariants are enforced most reliably in a single place. The antisymmetry of the balance sheet is guaranteed because the only method that mutates the balances updates both directions together. An invariant confined to one method cannot be violated from elsewhere.

Honesty about complexity is a professional virtue. The design states plainly that exact debt minimisation is NP hard and that the greedy algorithm is a near optimal heuristic. Naming the boundary of a solution distinguishes an engineer who understands the solution from one who has memorised it.

---

## 20. Practice Questions and Solutions

The following questions are intended to exercise the reasoning developed in this document rather than the recall of code. Each should be attempted before its solution is read.

### Question 1

A colleague proposes to store a list of records of the form debt from one user to another with an associated expense identifier, one record for each participant of each expense, and never to delete any record. Identify the principal problem with this proposal and describe the representation that resolves it.

<details>
<summary>Solution</summary>

The proposal is Approach A from Stage 4, and it has two connected problems. The most frequent query, namely the net balance between two users, requires a scan and summation of the entire history for those two users, which costs time proportional to the length of the history rather than constant time. In addition, offsetting obligations never cancel, so the stored data grows without bound and the system must rediscover cancellations during every simplification. The resolution is the pairwise net balance map of Approach B, in which a single entry per ordered pair is updated in place, queries are answered in constant time, and offsetting debts cancel automatically. The per expense records may still be retained, but as an immutable history for auditing and replay rather than as the source of truth for balances.
</details>

### Question 2

Explain why the `record_debt` method of the balance sheet updates both the entry for the debtor owing the creditor and the entry for the creditor owing the debtor within a single method, rather than allowing callers to update one entry at a time. State the category of defect this design prevents.

<details>
<summary>Solution</summary>

Updating both entries within one method guarantees the antisymmetry invariant, which is the property that the entry for A owing B always equals the negation of the entry for B owing A. If callers were permitted to update one entry at a time, any caller that omitted the mirroring update would silently corrupt the balances, and the corruption would surface only later as an incorrect settlement plan, which is difficult to trace to its origin. By making the single mutation path adjust both entries together, the invariant becomes impossible to violate from outside the class. The prevented defect is the class of silent data corruption arising from a partially applied update.
</details>

### Question 3

The team wishes to support, at the time an expense is created, a choice among equal, exact, percentage, and shares based division, and additionally to apply an optional service charge that is added to the total and divided in the same manner as the underlying expense. Identify the patterns that apply and describe where each attaches without requiring a new class for every combination.

<details>
<summary>Solution</summary>

The choice among division methods is the Strategy pattern, expressed by injecting a concrete `SplitStrategy` when the expense is created, and the addition of a division method such as shares is a new strategy class that requires no modification to the existing strategies, in accordance with the Open Closed Principle. The optional service charge is naturally expressed as a Decorator over a splitting strategy, that is, a strategy that wraps another strategy, inflates the total by the service charge, and then delegates the division of the inflated total to the wrapped strategy. This composition avoids writing a separate class for every combination of division method and service charge, because the service charge decorator can wrap any strategy. This is the same relationship between the Strategy pattern and the Decorator pattern that arose in the layered pricing of the parking lot problem.
</details>

### Question 4

In the greedy simplifier, explain why the largest debtor is matched with the largest creditor at each step rather than pairing participants in an arbitrary order, and state honestly what guarantee the algorithm does and does not provide.

<details>
<summary>Solution</summary>

Matching the largest debtor with the largest creditor maximises the probability that at least one of the two participants is reduced to a zero balance at each transfer, which minimises the total number of transfers. Pairing participants in an arbitrary order can leave small residual amounts that require additional transfers to clear. The algorithm provides the guarantee that every balance is settled and that money is conserved, and it produces a small number of transfers in practice. It does not provide the guarantee that the number of transfers is the theoretical minimum, because exact minimisation is NP hard. The correct characterisation is therefore that the algorithm is a near optimal heuristic rather than an exact optimiser.
</details>

### Question 5

Describe how the design would change to allow an expense to be advanced by more than one payer, and identify which components remain unchanged.

<details>
<summary>Solution</summary>

The single payer field of the expense would be replaced by a mapping from each payer to the amount that payer advanced, with the amounts summing to the total. The balance update rule would generalise so that each participant owes each payer a share proportional to that payer's contribution. The splitting strategies remain unchanged, because they continue to divide the total among the participants without regard to who paid. The balance sheet remains unchanged, because it continues to record debts between pairs of users. Only the bookkeeping loop inside the `add_expense` method of the manager changes, because the recording of debts now iterates over several payers. The confinement of the balance update to a single method is what limits the change to one location.
</details>

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch. Explore more at https://codeverra.com*
