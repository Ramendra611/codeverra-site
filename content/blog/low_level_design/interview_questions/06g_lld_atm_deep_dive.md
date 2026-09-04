# LLD Deep Dive #4: Designing an ATM System

> **What this document is:** A structured, step-by-step walkthrough of the ATM low-level design problem as it would be reasoned through in a technical interview. The document proceeds from first principles, weighs alternative designs at each decision point, and arrives at a solution that combines the State pattern, the Strategy pattern, the Command pattern, and a clean separation between hardware and software concerns. Definitions of every technical term are provided when the term is introduced, so the document can be read without prior familiarity with the design-pattern literature.
>
> **Prerequisite reading:** Deep dives on the Parking Lot (#1), Elevator (#2), and Library (#3). The State pattern discussed at length in the Elevator deep dive is directly reused here. The Dependency Inversion Principle, Single Responsibility Principle, and abstract-base-class mechanics from earlier documents are assumed as background.

---

## Table of Contents

1. [Why This Problem Matters](#1-why-this-problem-matters)
2. [Stage 1: Receiving the Problem](#2-stage-1-receiving-the-problem)
3. [Stage 2: Clarifying Requirements](#3-stage-2-clarifying-requirements)
4. [Stage 3: Identifying Entities](#4-stage-3-identifying-entities)
5. [Stage 4: Modeling the ATM State Machine](#5-stage-4-modeling-the-atm-state-machine)
6. [Stage 5: Modeling Transactions](#6-stage-5-modeling-transactions)
7. [Stage 6: The Cash Dispenser (Strategy and Chain of Responsibility)](#7-stage-6-the-cash-dispenser-strategy-and-chain-of-responsibility)
8. [Stage 7: Card, Account, and the Bank Interface](#8-stage-7-card-account-and-the-bank-interface)
9. [Stage 8: The ATM Class and Hardware Composition](#9-stage-8-the-atm-class-and-hardware-composition)
10. [Stage 9: Session, Authentication, and Timeout](#10-stage-9-session-authentication-and-timeout)
11. [Stage 10: Putting It All Together](#11-stage-10-putting-it-all-together)
12. [Stage 11: Validating with Mental Walkthroughs](#12-stage-11-validating-with-mental-walkthroughs)
13. [Stage 12: Anticipating Follow-Up Questions](#13-stage-12-anticipating-follow-up-questions)
14. [Summary of Patterns and Principles Used](#14-summary-of-patterns-and-principles-used)
15. [Key Takeaways](#15-key-takeaways)
16. [Practice Questions with Solutions](#16-practice-questions-with-solutions)
17. [Final Reflection](#17-final-reflection)

---

## 1. Why This Problem Matters

The ATM problem occupies a distinctive position in the landscape of low-level design questions. On the surface it is a state-machine problem comparable to the elevator or the vending machine, and recognising that fact quickly is expected of any competent candidate. Beneath this surface, however, three additional dimensions raise its complexity substantially and make it a richer exercise than most state-machine problems.

The first dimension is **integration with an external system**. The ATM is not the authoritative source of information about accounts, balances, or authentication. That authority resides with the bank, which is reached over a potentially unreliable network. Every design decision must accommodate the fact that the data owned by the bank may become unavailable, may return errors, or may return stale values. Candidates who treat the ATM as a self-contained system that owns its data invariably produce a design that will fail on this axis.

The second dimension is **the presence of multiple transaction types with genuinely different execution paths**. A withdrawal is not merely a deposit with a sign flip. A withdrawal touches the cash dispenser and requires a compensating action on hardware failure; a deposit takes cash from the user and requires a compensating action on bank failure; a transfer touches two accounts and requires atomicity between them; a balance inquiry is read-only. Modeling this heterogeneity cleanly requires either inheritance-based polymorphism or the Command pattern, both of which represent real design decisions rather than mechanical rewrites.

The third dimension is **a physical constraint that shapes the software**. Cash is dispensed in denominations, and the machine holds a finite inventory of each. Producing a requested amount from the available denominations is a small optimisation problem, and how it is structured has consequences for extensibility. This is where the Strategy pattern and the Chain of Responsibility pattern become relevant. Recognising which pattern applies, and why, is one of the most distinctive signals a candidate can send on this problem.

A candidate who demonstrates command of the state machine, models transactions cleanly, chooses an appropriate dispensing strategy, and cleanly abstracts the bank interface has covered a broader surface area of the design-pattern landscape than most LLD problems require. That surface area is what makes the ATM problem worth studying carefully, even though it does not appear in interview question banks quite as frequently as the parking lot or the elevator.

---

## 2. Stage 1: Receiving the Problem

The interviewer's opening prompt is typically a single sentence:

> "Design an ATM."

The vagueness is intentional and constitutes the first evaluation criterion. The candidate is expected to notice how underspecified the problem is and to respond with structured clarification rather than assumption. The set of interpretations consistent with the prompt is large, and each interpretation carries different design consequences.

Reasonable interpretations of what "an ATM" might mean include the following. The machine may support only cash withdrawal, or it may additionally accept deposits, execute transfers, and print statements. The machine may serve customers of a single bank, or it may accept cards issued by any bank through a switching network such as NPCI or Visa. Authentication may use only a PIN, or it may additionally use biometrics, one-time passwords, or challenge questions. The bank backend may be considered inside the scope of the design or treated as an opaque external service. The hardware model may be coarse (the whole machine is one object) or fine-grained (card reader, cash dispenser, screen, keypad, printer, and deposit slot are modeled separately).

The scope-defining decisions listed above cannot be inferred from the prompt itself. The interviewer expects the candidate to enumerate them and to elicit answers before proceeding. Beginning to design without doing so is the most common way this problem is failed at Stage 1.

---

## 3. Stage 2: Clarifying Requirements

The following section walks through nine structured clarifying questions. For each, the reasoning behind asking is stated (what the answer commits us to), a plausible interviewer response is supplied, and the design consequence is drawn out. This structure of "reason to ask, answer received, consequence" is exactly what is expected in the interview itself.

### Q1: What transactions does the ATM support?

**Reason to ask.** This is the largest scope-shaping question. The set of transactions determines how many concrete transaction classes are designed, which hardware components must be present, and how the state machine branches after authentication.

The candidate space of transactions includes cash withdrawal, cash deposit, cheque deposit, balance inquiry, mini-statement (a printed list of recent transactions), funds transfer, and PIN change.

**Assumed response.** "Withdrawal, cash deposit, balance inquiry, and same-bank funds transfer."

**Consequence.** A `Transaction` hierarchy with exactly four concrete subclasses will be designed. Cheque deposit is out of scope, which removes the need to model a document scanner, cheque validation, or a clearing workflow. Mini-statement is out of scope, which removes the need to model a transaction history store on the bank side. These exclusions materially reduce the design surface.

### Q2: Single bank or interbank?

**Reason to ask.** An interbank ATM must route non-home-bank requests through a switching network, which introduces additional latency, additional failure modes, and a routing layer between the ATM and the ultimate account holder. A single-bank ATM has a simpler dependency graph: it talks directly to one bank service and no other.

**Assumed response.** "Assume single bank for now. Interbank routing can be treated as an extension."

**Consequence.** The bank can be modeled as a single dependency, referred to as `BankService`, rather than as a tree of routing decisions. When the extension question is raised later in the interview, we can describe how a `RoutingService` would be inserted between the ATM and the bank without materially altering the rest of the design.

### Q3: What is the authentication mechanism?

**Reason to ask.** The authentication phase of the state machine varies significantly depending on the mechanism. PIN-only authentication involves one credential exchange; PIN plus biometric involves two; OTP-backed authentication involves a callback into a separate delivery channel. Each mechanism dictates the states and transitions between card insertion and confirmed authentication.

**Assumed response.** "Card plus 4-digit PIN. Three consecutive wrong PIN attempts result in the card being physically retained by the machine."

**Consequence.** The design must include a wrong-attempt counter, a retention (capture) action on the card reader, and clear state transitions for the retention event. Card capture is a physical event in which the machine draws the card into an internal bin, from which only a bank technician can retrieve it. This is a specific, named event and requires modeling.

### Q4: What denominations does the machine dispense, and how is the amount broken up?

**Reason to ask.** This question determines whether the dispensing subsystem is trivial or non-trivial. If the interviewer states that any amount may be requested and the machine dispenses exact change with no concern for available denominations, the dispenser degenerates into a stub. If the interviewer specifies denominations and requires the machine to compute a valid combination from current inventory, the dispenser becomes an interesting design problem in its own right and admits either the Strategy pattern or the Chain of Responsibility pattern.

**Assumed response.** "Indian denominations, namely ₹100, ₹200, ₹500, and ₹2,000. The machine dispenses using the largest denominations first. Requested amounts must be multiples of ₹100. If the requested amount cannot be produced from the currently available denominations, the request is rejected."

**Consequence.** Four denominations, a deterministic largest-first algorithm, and a real possibility of failure due to inventory shortage. This is exactly the shape of a problem for which we will introduce a `DispensingStrategy` abstraction with a `GreedyStrategy` default implementation. The Chain of Responsibility variant will be introduced as an alternative for scenarios in which per-denomination policy diverges, and the trade-off will be discussed explicitly in Stage 6.

### Q5: How does the ATM know about accounts and balances?

**Reason to ask.** This forces an explicit decision about the boundary between the ATM and the bank. If the ATM stores accounts and balances internally, the bank is inside the design and must be modeled as a component. If the bank is treated as external, the ATM depends on an abstract service interface and forwards operations to it.

**Assumed response.** "The ATM does not store accounts. It calls the bank's service for balance lookups, debits, and credits. Assume synchronous calls that may fail. On failure, the ATM must cancel the transaction and reverse any pending changes."

**Consequence.** A `BankService` abstraction is introduced, and an implicit rule is established: if a bank call fails, the transaction cannot proceed and any prior state changes must be reversed. This rule has consequences for the ordering of operations inside every mutating transaction, which will be addressed in Stage 5.

### Q6: How are deposited notes counted?

**Reason to ask.** Real ATMs use a bill validator inside the deposit slot to count and authenticate notes automatically. Whether this counting logic is inside our design or abstracted behind a component boundary is a scope decision.

**Assumed response.** "Model the deposit slot as a component that returns the counted, validated total. The internals of note validation are out of scope."

**Consequence.** A `DepositSlot` component is introduced with a `collect_and_count()` method that returns the total amount collected. The design trusts the returned value. The physical mechanics of counting and validation are not modeled.

### Q7: What are the concurrency assumptions?

**Reason to ask.** ATMs are single-user machines: only one person interacts with the physical hardware at a time. However, the bank backend is shared, and the same account can be touched by another ATM or by an online transaction while our machine is mid-transaction. Concurrency at the account level is therefore a real concern, even though concurrency within our machine is not.

**Assumed response.** "Single user per ATM. Assume the bank enforces account-level serialisation correctly. Our ATM must handle any resulting failure gracefully."

**Consequence.** The ATM itself does not require internal locking. The bank interface is expected to report conflicts as failures, which the ATM handles the same way it handles insufficient funds: by cleanly reporting the failure and returning to a valid state.

### Q8: Are receipts printed?

**Reason to ask.** Receipt printing is a minor but real feature. Some transactions produce a receipt, some do not, and the user may decline. The presence or absence of a printer is a component decision.

**Assumed response.** "Optional receipt at the end of each transaction. If the user opts in, print via a Printer component."

**Consequence.** A `Printer` component is added to the ATM. The receipt-decision branch appears at the end of each successful transaction's flow.

### Q9: What is the session timeout policy?

**Reason to ask.** If a user walks away mid-transaction without ejecting the card, the machine must not remain in an authenticated state indefinitely. Otherwise, the next user finds an active session belonging to someone else, which is a serious security failure.

**Assumed response.** "If no user input is received for 30 seconds during an active session, eject the card and return to the idle state."

**Consequence.** Timeout logic is added to the `Session` object, with the timeout enforced at the entry point of each state's action methods. Alternative timeout mechanisms (a background scheduler that fires on the timeout deadline) are noted as production improvements but not implemented here.

### Recap of the Confirmed Scope

Before beginning the design, the scope is reflected back to the interviewer in a single paragraph:

> "The ATM supports four transactions: withdrawal, cash deposit, balance inquiry, and same-bank transfer. Authentication is card plus 4-digit PIN, with card capture after three wrong attempts. Cash is dispensed in ₹100, ₹200, ₹500, and ₹2,000 denominations using a largest-first strategy, and requested amounts must be multiples of ₹100. The bank is an external service accessed through a `BankService` interface, and bank failures must be handled cleanly. Deposits are counted by a validated slot that returns the total. One user per ATM. Optional receipt printing. A 30-second inactivity timeout ejects the card. Account-level concurrency is handled by the bank."

Confirming the scope explicitly serves two purposes. It gives the interviewer an opportunity to correct any misinterpretation before design effort is spent. It also establishes a shared reference point that the candidate can return to whenever a design choice needs to be justified.

---

## 4. Stage 3: Identifying Entities

With the requirements confirmed, the next step is to extract candidate nouns and filter them into a final entity list. This is a mechanical exercise that ensures no important object is overlooked and that no unimportant one is elevated to a class.

The full list of candidate nouns from the requirements: ATM, card, PIN, account, bank, bank service, transaction, withdrawal, deposit, balance inquiry, transfer, receipt, screen, keypad, cash dispenser, deposit slot, printer, card reader, denomination, session, and state (with its various sub-states: idle, has-card, authenticated, transaction-selected).

The filtering step evaluates each noun for whether it merits a distinct class in the design. The criteria are: does the noun carry data or behavior of its own, does it have a lifecycle, and does it appear in multiple places in the design such that a shared type helps.

| Noun | Class? | Reasoning |
|---|---|---|
| ATM | Yes | Top-level coordinator that owns hardware components, the bank reference, and the current state |
| Card | Yes | Has data fields (number, holder name, expiry date, associated account number) and simple behavior (`is_valid()`) |
| PIN | No | A plain string, validated by the bank and not persisted client-side |
| Account | Yes | A lightweight data holder with identifiers; the authoritative state (balance) lives with the bank |
| BankService | Yes (interface) | Modeled as an abstract interface to allow multiple concrete implementations |
| Transaction | Yes (hierarchy) | Different transactions have genuinely different execution paths; polymorphism is natural |
| Receipt | Yes | A small immutable value object capturing details for printing |
| Screen | Yes | A component with a single responsibility (rendering text) |
| Keypad | Yes | A component that reads user input |
| CashDispenser | Yes | A component with substantial internal logic; the primary structural focus of Stage 6 |
| DepositSlot | Yes | A component that returns a counted amount |
| Printer | Yes | A component that prints receipts |
| CardReader | Yes | A component that reads, ejects, and captures cards |
| Denomination | Not required | The denomination values are integer keys in the dispenser's inventory dictionary |
| Session | Yes | Captures per-visit transient state including authentication flag, wrong-PIN counter, and timing |
| ATMState | Yes (hierarchy) | One class per state under the State pattern |

### Why the design has so many hardware component classes

The decision to introduce five distinct hardware component classes (Screen, Keypad, CardReader, CashDispenser, DepositSlot, Printer, plus the Printer's data object Receipt) reflects two considerations.

First is the **Single Responsibility Principle (SRP)**, which states that a class should have only one reason to change. If all hardware behavior were folded into the `ATM` class, the class would accumulate methods for rendering text, reading input, ejecting cards, counting deposits, dispensing cash, and printing receipts. Any change to any hardware behavior would touch this single class, and the class would rapidly become the largest and most fragile component in the system. Distributing the responsibilities across dedicated components isolates changes to their proper location.

Second is **testability**. The Dependency Inversion Principle (DIP) states that high-level modules should not depend on low-level modules and that both should depend on abstractions. By isolating each hardware behavior in its own class, we make it feasible to substitute a test double for any component during unit testing. A test that verifies the withdrawal flow does not require an actual cash dispenser; it requires an object exposing the same interface against which assertions can be made.

### Why BankService is an interface rather than a concrete class

The `BankService` is defined as an abstract interface rather than a concrete class because the ATM should not have any awareness of whether the bank is implemented as a REST client, a database connection, or an in-memory dictionary used only for testing. What the ATM cares about is a small set of operations: authenticating a PIN, retrieving a balance, debiting an account, crediting an account, and transferring funds between accounts. That set of operations is precisely the signature of a service interface, and defining it as such is the direct application of the Dependency Inversion Principle.

The interface is defined using Python's `abc` module. An **abstract base class (ABC)** is a class that cannot be instantiated directly and typically declares one or more abstract methods that must be implemented by any concrete subclass. In Python, this is achieved by inheriting from `ABC` and decorating methods with `@abstractmethod`. Attempting to instantiate a class that has unimplemented abstract methods raises a `TypeError` at construction time, which is how the language enforces the contract.

### The Final Entity List

The consolidated set of classes to be designed is as follows:

- `ATM`: the top-level coordinator
- `Card`, `Account`, `Session`, `Receipt`: data-holding value objects
- `Transaction` (abstract), with concrete subclasses `Withdrawal`, `Deposit`, `BalanceInquiry`, and `Transfer`
- `ATMState` (abstract), with concrete subclasses `IdleState`, `HasCardState`, `AuthenticatedState`, and `TransactionSelectedState`
- `BankService` (abstract), with concrete implementation `InMemoryBankService`
- Hardware components: `CardReader`, `Screen`, `Keypad`, `CashDispenser`, `DepositSlot`, `Printer`
- Dispensing-algorithm classes: `DispensingStrategy` (abstract), `GreedyStrategy` (default), `ChainStrategy` and `DenominationHandler` (alternative)

---

## 5. Stage 4: Modeling the ATM State Machine

The single most consequential structural decision in this problem is how the ATM's operational modes are represented in code. A careless decision at this stage produces a design that is difficult to extend and difficult to reason about, regardless of how carefully the remainder is executed.

### Why an ATM Is a State Machine

Observing the sequence of interactions at an actual ATM reveals that the machine operates in a small number of distinct **modes**, and that the set of actions the user may perform depends entirely on which mode is currently active.

At rest, the machine displays a welcome message and awaits card insertion. The card reader is armed. No other action is meaningful in this mode: entering a PIN, requesting a balance, or ejecting a card produces no effect because there is no card to authenticate against, no account to inquire about, and no card to eject.

After a card is inserted, the machine transitions into a mode in which it awaits PIN entry. In this mode, the keypad's input is interpreted as a PIN. Inserting a second card is not meaningful because the reader already holds one; requesting a transaction is not meaningful because the user has not yet been authenticated.

After correct PIN entry, the machine is authenticated and awaits transaction selection. The keypad's input is now interpreted as menu selection rather than PIN. Entering a PIN again is not meaningful because authentication is already complete.

After a transaction is selected, the machine executes the transaction. During execution, most user actions are ignored or deferred until the execution completes.

After execution completes, the machine returns to the authenticated mode so the user may perform another transaction, or the user may eject the card and return the machine to the idle mode.

Each of these operational modes is a **state** in the formal sense: a distinct condition of the system in which the set of permissible actions differs from other conditions, and in which each action either transitions the system to another specified state or is rejected as invalid.

### Definition of the State Pattern

The **State pattern** is a behavioral design pattern in which an object's behavior changes based on its internal state. Each state is represented as a separate class that conforms to a common interface, and the enclosing object delegates operations to the current state object rather than branching on state internally. The pattern's purpose is to keep the invariants of each state local to a single class, rather than scattering them across many methods of a larger class that must remain mutually consistent.

Two alternative designs will now be presented, with a comparison of their properties.

### Approach A: Flag-Based Design with Conditional Branching

The naive design maintains a single string field to record the current state and branches on that field inside every action method:

```python
class ATM:
    def __init__(self):
        self.state = "idle"
        self.card = None
        self.pin_attempts = 0

    def insert_card(self, card):
        if self.state == "idle":
            self.card = card
            self.state = "has_card"
        else:
            raise InvalidOperation("Card already inserted")

    def enter_pin(self, pin):
        if self.state == "has_card":
            # Verify the PIN and transition to the authenticated state.
            ...
        elif self.state == "idle":
            raise InvalidOperation("No card inserted")
        elif self.state == "authenticated":
            raise InvalidOperation("Already authenticated")
        # Continue with additional branches for other states.
```

Every action method contains a large conditional block that inspects `self.state`. The invariants defining what is legal in each state are scattered across every method. Adding a new state requires editing every method to insert the new case. Removing a state requires editing every method to remove the corresponding case. Renaming a state requires editing every method to update the string comparison.

This scattering of invariants is precisely the design defect that the State pattern is intended to prevent.

### Approach B: One Class per State (State Pattern)

Under the State pattern, each operational mode becomes a distinct class that inherits from a common abstract base class. The abstract base declares every action the ATM can receive and provides a default implementation for each that raises `InvalidOperation`. Concrete state classes override only the actions that are valid in their state, leaving invalid actions to inherit the base's rejection behavior.

```python
from abc import ABC
from atm_system.exceptions import InvalidOperation


class ATMState(ABC):
    """Abstract base class for all ATM states.

    Every action the ATM can receive is declared here with a default
    implementation that raises InvalidOperation. Concrete states override
    only the actions valid in their state. This design keeps the invariants
    of each state local to a single class.
    """

    def insert_card(self, atm, card):
        raise InvalidOperation(f"Cannot insert card in state {self.name()}")

    def enter_pin(self, atm, pin):
        raise InvalidOperation(f"Cannot enter PIN in state {self.name()}")

    def select_transaction(self, atm, txn):
        raise InvalidOperation(f"Cannot select transaction in state {self.name()}")

    def eject_card(self, atm):
        raise InvalidOperation(f"Cannot eject card in state {self.name()}")

    def name(self) -> str:
        return self.__class__.__name__
```

Concrete states override only the actions that are meaningful in that state:

```python
class IdleState(ATMState):
    """The machine is at rest, waiting for a card. Only insert_card is valid."""

    def insert_card(self, atm, card):
        atm.session = Session(card=card)
        atm.set_state(HasCardState())
        atm.screen.show("Please enter your PIN")


class HasCardState(ATMState):
    """A card has been inserted; the PIN has not yet been verified."""

    def enter_pin(self, atm, pin):
        if atm.bank.authenticate(atm.session.card, pin):
            atm.session.authenticated = True
            atm.set_state(AuthenticatedState())
            atm.screen.show("Authenticated. Select a transaction.")
        else:
            atm.session.wrong_pin_attempts += 1
            if atm.session.wrong_pin_attempts >= 3:
                atm.card_reader.capture(atm.session.card)
                atm.set_state(IdleState())
                atm.session = None
                atm.screen.show("Card retained. Contact your bank.")
            else:
                remaining = 3 - atm.session.wrong_pin_attempts
                atm.screen.show(f"Incorrect PIN. {remaining} attempts remaining.")

    def eject_card(self, atm):
        atm.card_reader.eject(atm.session.card)
        atm.set_state(IdleState())
        atm.session = None
```

The remaining states (`AuthenticatedState`, `TransactionSelectedState`) follow the same shape and are presented in full in Stage 10 when the complete design is assembled.

### Comparison of the Two Approaches

The following table summarises the trade-offs between the two approaches on the dimensions that matter most for maintenance and extension.

| Concern | Flag-Based | State Pattern |
|---|---|---|
| Locality of invariants | Scattered across all action methods | Local to each state class |
| Cost of adding a new state | Edit every action method | Add one new class |
| Cost of removing a state | Edit every action method | Delete one class |
| Overriding-only-what-is-valid | Requires disciplined convention | Enforced by inheritance |
| Testing a specific transition | Requires walking the machine through prior states | Instantiate the state and test directly |
| Number of classes | One (fat) | Several (thin) |
| Overhead on small state machines | None | Non-trivial ceremony |

The pattern's cost is the ceremony of several small classes. Its benefit is the elimination of the scattered-invariant problem. For a state machine with three or fewer states, the ceremony arguably outweighs the benefit; for one with five or more states, each supporting several actions, the flag-based design becomes a maintenance liability. The ATM has five effective states and four action methods on each, giving twenty potential (state, action) combinations. The State pattern is the correct choice.

### The Complete State Diagram

The state diagram for the ATM shows the transitions available from each state, labeled by the triggering action:

```
                        [IdleState]
                            |
                            |  insert_card (valid card)
                            v
                       [HasCardState]
                       /              \
              eject_card                enter_pin (correct)
                     |                            |
                     v                            v
                [IdleState]              [AuthenticatedState]
                                          /            \
                                 eject_card       select_transaction
                                     |                     |
                                     v                     v
                                [IdleState]     [TransactionSelectedState]
                                                          |
                                                          |  execute
                                                          v
                                                [AuthenticatedState]
                                                (loop or eject_card)
```

Two features of this diagram merit explicit attention.

First, after a successful transaction, the machine returns to `AuthenticatedState` rather than to `IdleState`. This allows the user to perform multiple transactions without re-authenticating for each. Requiring re-authentication after each transaction would be technically simpler but would produce a user experience unlike any real ATM.

Second, the diagram does not show a separate `EjectingCardState`. In real hardware, ejection is a physical event that takes measurable time and during which no user input should be accepted. In this simplified design, ejection is treated as an atomic operation that completes immediately, and the machine transitions directly to `IdleState`. In Stage 12, we discuss how the design accommodates a proper `EjectingCardState` if the interviewer raises the point.

---

## 6. Stage 5: Modeling Transactions

The four transaction types (withdrawal, deposit, balance inquiry, transfer) differ from one another in their required inputs, their execution paths, and their failure modes. Modeling this heterogeneity cleanly requires a design decision comparable in significance to the state-machine decision.

### Approach A: A Single Transaction Class with a Type Flag

The naive design uses a single `Transaction` class with optional fields and branches on a type discriminator:

```python
class Transaction:
    def __init__(self, txn_type, amount=None, target_account=None):
        self.txn_type = txn_type   # "WITHDRAWAL", "DEPOSIT", "INQUIRY", "TRANSFER"
        self.amount = amount
        self.target_account = target_account

    def execute(self, bank, dispenser=None, deposit_slot=None):
        if self.txn_type == "WITHDRAWAL":
            ...
        elif self.txn_type == "DEPOSIT":
            ...
        elif self.txn_type == "INQUIRY":
            ...
        elif self.txn_type == "TRANSFER":
            ...
```

This design has three concrete defects. The `target_account` field is meaningful only for transfers, so it is `None` for three-quarters of transactions and its presence in the constructor signature is misleading. The `amount` field is meaningless for balance inquiries. The `execute` method is a large conditional block on the type field, and every additional transaction type extends this block. These are the same categories of defect that afflict the flag-based state-machine design in the previous stage.

### Approach B: A Transaction Hierarchy

Under the polymorphic approach, `Transaction` is an abstract base class that declares a single abstract `execute` method. Each concrete transaction subclass carries only the fields it requires and provides its own implementation of `execute`:

```python
from abc import ABC, abstractmethod


class Transaction(ABC):
    """A transaction encapsulates one unit of work against an account.

    Each transaction knows how to execute itself against a BankService.
    The ATM does not branch on transaction type; it invokes execute()
    and relies on polymorphism to dispatch to the correct implementation.
    This design is a variant of the Command pattern.
    """

    def __init__(self, account):
        self.account = account
        self.status = "PENDING"

    @abstractmethod
    def execute(self, bank):
        """Execute the transaction and return a TransactionResult."""
```

### Definition of the Command Pattern

The **Command pattern** is a behavioral design pattern that encapsulates a request as an object, allowing the request to be parameterised, queued, logged, or undone. In the classical formulation, a `Command` object holds a reference to a receiver (the object on which the operation acts) and exposes an `execute` method that performs the operation. The invoker (in our case, the ATM) calls `execute` without knowing which specific command is being executed.

The transaction hierarchy is a lightweight application of this pattern. Each transaction object holds references to the resources it needs (an account, an amount, a dispenser, a target account) and exposes an `execute` method. The ATM invokes `execute` without dispatching on type, and the concrete transaction determines what actually happens.

### The Four Concrete Transactions

The withdrawal transaction is the most complex because it touches two subsystems (the bank and the cash dispenser) and requires a compensating action if the second subsystem fails after the first has succeeded.

```python
class Withdrawal(Transaction):
    """Withdraw cash from an account.

    Execution order:
    1. Check that the dispenser can produce the requested amount.
    2. Debit the account through the bank.
    3. Physically dispense the cash.
    4. If step 3 fails, credit the account back (compensating action).

    The ordering matters. If we debited first and then discovered that
    the dispenser could not produce the amount, the user's account would
    be debited without the user receiving cash. Feasibility-check-first
    eliminates most of that risk; the compensating credit handles the
    residual risk of a hardware failure between plan and commit.
    """

    def __init__(self, account, amount, dispenser):
        super().__init__(account)
        self.amount = amount
        self.dispenser = dispenser

    def execute(self, bank):
        # Step 1: Feasibility. Read-only check that does not modify inventory.
        if not self.dispenser.can_dispense(self.amount):
            self.status = "FAILED"
            return TransactionResult.fail(
                "ATM cannot dispense the requested amount"
            )

        # Step 2: Debit. The bank enforces balance, limits, and holds.
        if not bank.debit(self.account, self.amount):
            self.status = "FAILED"
            return TransactionResult.fail("Insufficient funds")

        # Step 3: Physically dispense. Any failure here triggers step 4.
        try:
            self.dispenser.dispense(self.amount)
        except DispenseError:
            # Step 4: Compensating action.
            bank.credit(self.account, self.amount)
            self.status = "FAILED"
            return TransactionResult.fail(
                "Dispensing failed; account has been credited back"
            )

        self.status = "SUCCESS"
        return TransactionResult.ok(
            value=self.amount,
            message=f"Dispensed ₹{self.amount}",
        )
```

The deposit transaction accepts cash from the user and credits the account, with a compensating physical return of cash if the bank rejects the deposit:

```python
class Deposit(Transaction):
    """Deposit cash into an account.

    Execution order:
    1. Collect and count the cash via the deposit slot.
    2. Credit the account through the bank.
    3. If crediting fails, physically return the cash to the user.
    """

    def __init__(self, account, deposit_slot):
        super().__init__(account)
        self.deposit_slot = deposit_slot
        self.amount = 0.0

    def execute(self, bank):
        self.amount = self.deposit_slot.collect_and_count()

        if self.amount == 0:
            self.status = "CANCELLED"
            return TransactionResult.fail("No cash deposited")

        if not bank.credit(self.account, self.amount):
            self.deposit_slot.return_cash()
            self.status = "FAILED"
            return TransactionResult.fail("Bank rejected the deposit")

        self.status = "SUCCESS"
        return TransactionResult.ok(
            value=self.amount,
            message=f"Deposited ₹{self.amount:.2f}",
        )
```

The balance inquiry transaction is read-only and has no compensating actions:

```python
class BalanceInquiry(Transaction):
    """Read the current balance for the account. No side effects."""

    def execute(self, bank):
        balance = bank.get_balance(self.account)
        self.status = "SUCCESS"
        return TransactionResult.ok(
            value=balance,
            message=f"Balance: ₹{balance:.2f}",
        )
```

The transfer transaction moves funds between two accounts and delegates atomicity to the bank:

```python
class Transfer(Transaction):
    """Transfer funds between two accounts.

    Atomicity of the two-sided operation is delegated to the BankService,
    which is expected to either commit both sides or roll back both sides.
    """

    def __init__(self, source, target, amount):
        super().__init__(source)
        self.target = target
        self.amount = amount

    def execute(self, bank):
        if not bank.transfer(self.account, self.target, self.amount):
            self.status = "FAILED"
            return TransactionResult.fail(
                "Transfer failed (insufficient funds or bank error)"
            )
        self.status = "SUCCESS"
        return TransactionResult.ok(
            value=self.amount,
            message=f"Transferred ₹{self.amount:.2f} to {self.target.account_number}",
        )
```

### The TransactionResult Value Object

A uniform result type is defined so that calling code does not need to interpret tuples or booleans and does not need to know which specific fields each transaction produces:

```python
class TransactionResult:
    """Uniform result type across all transaction executions.

    Having a single return type simplifies the ATM's handling of results:
    the ATM inspects `success` to decide whether to print a receipt and
    inspects `message` to display to the user, without needing to know
    which transaction type produced the result.
    """

    def __init__(self, success, value=None, message=""):
        self.success = success
        self.value = value       # amount, balance, or None depending on transaction
        self.message = message   # user-facing message

    @classmethod
    def ok(cls, value=None, message="OK"):
        return cls(True, value=value, message=message)

    @classmethod
    def fail(cls, message):
        return cls(False, message=message)
```

### The Discipline of Order-of-Operations

The execution order in `Withdrawal.execute` (feasibility check, then debit, then dispense, with a compensating credit on dispense failure) reflects a general discipline that is worth stating explicitly. Whenever code contains two or more mutating operations, the following question should be asked for each pair: if the second operation fails after the first has succeeded, is the state resulting from the first recoverable?

If the answer is yes, the operations may be executed in either order, though there may still be a preferred order for other reasons (efficiency, common-case fast paths, minimising work done before a failure).

If the answer is no, the operations must be either reordered so that the recoverable one occurs first, wrapped in a transaction that provides atomicity, or paired with an explicit compensating action that reverses the first operation when the second fails.

This discipline is the foundation of correct behavior in distributed systems more generally. The withdrawal transaction is a small instance of the same reasoning that produces two-phase commit, saga patterns, and outbox patterns in larger systems.

---

## 7. Stage 6: The Cash Dispenser (Strategy and Chain of Responsibility)

The cash dispenser is the most technically distinctive component of the ATM design. The stated problem is as follows: given a requested amount (say, ₹4,600) and an inventory of denominations (say, five ₹2,000 notes, ten ₹500 notes, five ₹200 notes, and eight ₹100 notes), produce the requested amount using the largest denominations first, and fail cleanly if the available inventory cannot produce the exact amount.

Two design patterns are candidates for structuring this component: the **Strategy pattern** and the **Chain of Responsibility pattern**. These patterns operate at different levels of abstraction, and understanding the distinction is one of the most valuable exercises the ATM problem offers. The design presented here uses Strategy as the primary abstraction and treats Chain of Responsibility as an alternative implementation strategy that becomes justified only under specific conditions.

### The Naive Approach as a Baseline

Before introducing either pattern, consider the direct implementation: a single function that iterates over denominations from largest to smallest and accumulates a plan:

```python
def dispense_naive(amount, inventory):
    plan = {}
    for denom in sorted(inventory.keys(), reverse=True):
        available = inventory[denom]
        count = min(amount // denom, available)
        if count > 0:
            plan[denom] = count
            amount -= denom * count
        if amount == 0:
            break
    if amount != 0:
        raise DispenseError("Cannot dispense with current inventory")
    return plan
```

This implementation is short, clear, and correct for the stated problem. Any design change that adds complexity beyond this baseline must be justified by a real requirement, not by pattern-application for its own sake.

The naive implementation has two limitations. First, the algorithm is hardcoded: only greedy largest-first behavior is supported. If a different algorithm is needed later (for example, an algorithm that preserves high-denomination notes for future large withdrawals), the function must be modified. Second, if per-denomination policy diverges (for example, if the ₹2,000 handler must reserve stock below a threshold, or if the ₹100 handler must cap contributions per transaction), the branching logic accumulates in this function and it stops being clean.

### Definition of the Strategy Pattern

The **Strategy pattern** is a behavioral design pattern in which a family of interchangeable algorithms is defined behind a common interface, allowing the algorithm used by a client to be selected or replaced at runtime without modifying the client. Each concrete strategy is a self-contained implementation of the algorithm. The client holds a reference to a strategy through the interface and delegates the algorithmic decision to it.

Applied to cash dispensing, the Strategy pattern captures the observation that different algorithms may be used to break an amount into denominations. Greedy largest-first is one such algorithm. Others include:

- A **balanced** algorithm that preserves high-denomination notes when the requested amount is small, so that future large withdrawals remain possible.
- An **optimal** algorithm that minimises the total number of notes dispensed. For canonical currency systems such as the Indian rupee, this is equivalent to greedy; for pathological denomination sets it differs.
- An **exact-only** algorithm that refuses to dispense unless a valid plan exists that uses only whole notes. This is trivially the same as greedy for the ATM but differs for vending machines that must also give change.

The Strategy pattern answers the question: **which algorithm do we use to solve the whole problem?** Each strategy is a complete, self-contained solution.

### Definition of the Chain of Responsibility Pattern

The **Chain of Responsibility (CoR) pattern** is a behavioral design pattern in which a request is passed along a sequence of handler objects. Each handler either handles the request in whole or in part and forwards the remainder, or forwards the request unchanged. The chain terminates when either a handler fully handles the request or the request reaches the end of the chain without being fully handled.

Applied to cash dispensing, the CoR pattern makes each denomination a distinct handler that contributes what it can from its own inventory and forwards the remaining amount to the next handler in the chain. Handlers are linked in order from largest denomination to smallest.

The CoR pattern answers the question: **how do we structure the execution across multiple handlers, each with its own logic?** It shines when handlers have genuinely different behavior, not merely different parameters.

### The Two Patterns Compared

The distinction between the two patterns is subtle but consequential. The following table summarises when each pattern earns its place in the design.

| Aspect | Strategy | Chain of Responsibility |
|---|---|---|
| Question answered | Which algorithm for the whole problem? | How to distribute execution across handlers? |
| Number of "solvers" per request | One (the selected strategy) | Multiple (one per handler in the chain) |
| Concrete objects differ in | Algorithmic approach | Per-handler logic and configuration |
| Justified when | Multiple interchangeable algorithms exist | Per-handler policy genuinely diverges |
| Not justified when | Only one algorithm makes sense | All handlers do the same thing with different parameters |
| Client sees | The strategy interface | The head of the chain (or a facade over it) |

For a uniform greedy algorithm across all denominations, the Strategy pattern with a single `GreedyStrategy` implementation is sufficient. The Chain of Responsibility becomes justified only when per-denomination policy diverges. Introducing CoR without such divergence produces a chain in which every handler is essentially identical modulo a parameter (the denomination value), which is a loop with additional ceremony.

The honest presentation of the design is therefore to lead with Strategy and treat CoR as a refinement available for when per-denomination logic becomes non-uniform. Both are implemented below so that the trade-off can be studied directly.

### The DispensingStrategy Interface

The abstract strategy is declared with a single method that computes a dispensing plan without mutating any state:

```python
from abc import ABC, abstractmethod
from typing import Optional


class DispensingStrategy(ABC):
    """Abstract algorithm for planning a cash dispense.

    Strategies are stateless. They take a target amount and a snapshot of
    the current inventory and return a plan (or None if the amount cannot
    be produced). The dispenser itself owns the inventory and is responsible
    for committing the plan; the strategy never mutates inventory.

    Separating "plan" (which the strategy computes) from "commit" (which
    the dispenser performs) ensures that a failed plan never corrupts the
    inventory state.
    """

    @abstractmethod
    def plan(self, amount: int, inventory: dict) -> Optional[dict]:
        """Compute a dispensing plan.

        Args:
            amount: The amount to dispense.
            inventory: Current stock as a mapping of denomination to count.

        Returns:
            A dict mapping denomination to count to dispense, or None if
            the amount cannot be produced from the available inventory.
        """
```

### The GreedyStrategy Implementation

The default strategy implements the greedy largest-first algorithm described in the requirements:

```python
class GreedyStrategy(DispensingStrategy):
    """Largest-denomination-first greedy allocation.

    For each denomination from largest to smallest, take as many notes as
    fit into the remaining amount, capped by the available inventory. If
    the remaining amount reaches zero, a valid plan has been constructed;
    otherwise the amount cannot be produced from current stock.

    This algorithm is optimal (minimum note count) when denominations form
    a canonical system, which is true for standard Indian and most Western
    currencies. It is not optimal for pathological denomination sets such
    as {1, 3, 4} for a target of 6, where greedy gives 4+1+1 (three notes)
    and the optimum is 3+3 (two notes). This limitation is not a concern
    for real currency.
    """

    def plan(self, amount, inventory):
        plan = {}
        remaining = amount
        for denom in sorted(inventory.keys(), reverse=True):
            available = inventory[denom]
            count = min(remaining // denom, available)
            if count > 0:
                plan[denom] = count
                remaining -= count * denom
            if remaining == 0:
                break
        return plan if remaining == 0 else None
```

### The Chain of Responsibility Implementation

For scenarios in which per-denomination policy diverges, the CoR variant provides a structural alternative. A `DenominationHandler` class represents one denomination and its associated logic; a `ChainStrategy` builds a chain of handlers from an inventory and delegates planning to the chain.

```python
class DenominationHandler:
    """One handler in the chain, responsible for one denomination.

    Handlers form a linked chain from largest denomination to smallest.
    Each handler determines how much of the request it can contribute
    from its own stock, records its contribution in the plan, and
    delegates the remainder to the next handler.

    A subclass may override contribute() to inject per-denomination
    policy: reserving stock below a threshold, capping the contribution
    per transaction, or applying priority rules that depend on
    context. This extension point is the reason the pattern exists.
    """

    def __init__(self, denomination, count):
        self.denomination = denomination
        self.count = count
        self.next = None

    def set_next(self, handler):
        # Returns the passed handler so that setup can be chained fluently:
        # a.set_next(b).set_next(c).set_next(d)
        self.next = handler
        return handler

    def contribute(self, amount, plan):
        """Contribute what this denomination can. Return the remainder."""
        needed = amount // self.denomination
        used = min(needed, self.count)
        if used > 0:
            plan[self.denomination] = used
            amount -= used * self.denomination

        if amount > 0 and self.next is not None:
            return self.next.contribute(amount, plan)
        return amount


class ChainStrategy(DispensingStrategy):
    """DispensingStrategy that plans by walking a chain of DenominationHandlers.

    Produces the same result as GreedyStrategy for the default uniform-policy
    case. The chain becomes valuable only when per-denomination policy
    diverges, at which point a subclass of DenominationHandler for the
    relevant denomination is the natural home for the divergent logic.
    """

    def plan(self, amount, inventory):
        head = None
        prev = None
        for denom in sorted(inventory.keys(), reverse=True):
            handler = DenominationHandler(denom, inventory[denom])
            if head is None:
                head = handler
            if prev is not None:
                prev.set_next(handler)
            prev = handler

        if head is None:
            return {} if amount == 0 else None

        plan = {}
        remaining = head.contribute(amount, plan)
        return plan if remaining == 0 else None
```

### The CashDispenser Facade

The dispenser is a facade over the inventory and the strategy. It exposes a small, clear interface (`can_dispense`, `dispense`, `restock`) and internally coordinates the strategy's planning with the atomic commit to inventory.

**Facade pattern definition:** The Facade pattern is a structural design pattern that provides a simplified, unified interface to a set of interfaces in a subsystem. The facade defines a higher-level interface that makes the subsystem easier to use, without preventing clients from accessing the subsystem directly when needed.

```python
class CashDispenser:
    """Manages cash inventory and coordinates dispensing.

    The dispenser is the single source of truth for what notes exist in
    the physical machine. It uses a DispensingStrategy to decide how to
    dispense a given amount, but the strategy does not modify inventory;
    the dispenser does that, atomically, after the strategy returns a
    valid plan.
    """

    def __init__(self, inventory, strategy=None):
        # Copy the inventory so external mutations of the passed-in
        # dictionary do not corrupt the dispenser's state.
        self.inventory = dict(inventory)
        self.strategy = strategy or GreedyStrategy()

    def can_dispense(self, amount):
        """Non-mutating feasibility check.

        Returns True if the requested amount can be produced from current
        inventory using the current strategy. Safe to call before
        committing to a debit.
        """
        return self.strategy.plan(amount, self.inventory) is not None

    def dispense(self, amount):
        """Produce a physical dispense of the given amount.

        Two-phase: first compute the plan, and only if the plan is
        feasible do we commit the inventory changes. If planning fails,
        we raise before touching inventory, ensuring that no partial
        dispense or inconsistent state can occur.
        """
        plan = self.strategy.plan(amount, self.inventory)
        if plan is None:
            raise DispenseError(
                f"Cannot dispense ₹{amount} with available inventory"
            )
        for denom, count in plan.items():
            self.inventory[denom] -= count
        return plan

    def restock(self, denom, count):
        """Refill inventory of a given denomination."""
        self.inventory[denom] = self.inventory.get(denom, 0) + count

    def total_cash(self):
        return sum(denom * count for denom, count in self.inventory.items())
```

### A Worked Example

To make the algorithm concrete, consider a request for ₹4,600 against an inventory of 2,000 × 3, 500 × 10, 200 × 5, and 100 × 8.

The greedy algorithm proceeds as follows. The ₹2,000 denomination contributes two notes for ₹4,000; the remaining amount is ₹600. The ₹500 denomination contributes one note for ₹500; the remaining amount is ₹100. The ₹200 denomination contributes zero notes because ₹200 does not fit into ₹100; the remaining amount is unchanged at ₹100. The ₹100 denomination contributes one note for ₹100; the remaining amount is ₹0.

The resulting plan is `{2000: 2, 500: 1, 100: 1}`, which totals ₹4,600 as required. Both the `GreedyStrategy` and the `ChainStrategy` produce this plan; they differ only in code organisation, not in output.

### An Example of Failure

Consider the same request for ₹4,600 against a degenerate inventory containing only ten ₹200 notes (with the ₹2,000, ₹500, and ₹100 slots empty).

The greedy algorithm proceeds as follows. The ₹2,000 handler has zero notes; contribution is zero. The ₹500 handler has zero notes; contribution is zero. The ₹200 handler has ten notes and could contribute up to twenty-three notes (₹4,600 divided by ₹200), so it is limited to ten notes for a contribution of ₹2,000; the remaining amount is ₹2,600. The ₹100 handler has zero notes; contribution is zero. The remaining amount is ₹2,600, which is non-zero.

`plan()` returns `None`, and `can_dispense` returns False. The bank is not called, no debit occurs, and no inventory is modified. The transaction is rejected cleanly with a message advising the user to try a different amount.

### Interview Framing of the Strategy vs Chain Trade-off

The recommended sequence for presenting this component in an interview is:

1. Introduce the `DispensingStrategy` abstraction and implement `GreedyStrategy` as the default. This handles the stated requirement completely and correctly.
2. If the interviewer asks about alternative algorithms, introduce `BalancedStrategy`, `OptimalStrategy`, or `ExactChangeStrategy` as sketches. Each is a self-contained algorithm and demonstrates why Strategy is the right level of abstraction for the algorithmic question.
3. If the interviewer asks about per-denomination policies such as reserving high-denomination notes or capping contributions of small-denomination notes, introduce the `ChainStrategy` and `DenominationHandler` classes, explaining that subclasses of `DenominationHandler` are the natural home for divergent per-denomination logic.

The reverse order (leading with Chain of Responsibility) is a common mistake and reflects a misunderstanding of when the pattern earns its place. A pattern must be earned by the problem it solves; if all handlers do the same thing modulo a parameter, the pattern has not been earned.

---

## 8. Stage 7: Card, Account, and the Bank Interface

The ATM does not own accounts, balances, or authentication credentials. These belong to the bank. This section models the client-side view of each and defines the interface through which the ATM communicates with the bank.

### The Card Class

A card carries the identifiers needed to look up the associated account with the bank, along with the metadata needed to validate the card physically. It does not carry a balance because the balance belongs to the account and is authoritative only at the bank.

```python
from datetime import datetime


class Card:
    """A debit card as presented to the ATM.

    The card carries the account identifier that the bank uses to look up
    the associated account, along with expiry metadata that the ATM can
    validate locally before making any bank call. The card does not carry
    a balance, since the balance is owned by the account and is
    authoritative only at the bank.
    """

    def __init__(self, number, holder_name, expiry, account_number):
        self.number = number
        self.holder_name = holder_name
        self.expiry = expiry
        self.account_number = account_number

    def is_valid(self):
        """Return True if the card has not passed its expiry date."""
        return datetime.now() < self.expiry
```

The `is_valid` method is invoked by the `IdleState.insert_card` handler as a preliminary check before any bank interaction. Rejecting an expired card locally saves an unnecessary round trip to the bank and returns the card to the user immediately.

### The Account Class

The account class holds only the identifiers required to address the account in bank calls. It is deliberately anemic: it does not hold a balance, does not hold behavior, and does not hold cached state that could become stale.

```python
class Account:
    """A bank account as seen from the ATM's perspective.

    Deliberately anemic. The bank owns the authoritative state (balance,
    limits, holds, ledger entries). This class carries only the identifiers
    the ATM needs to address the account in bank service calls.

    If the design were of the bank backend itself, this class would grow
    considerably. From the ATM's viewpoint, growth would be a mistake:
    every additional field would be a candidate for staleness.
    """

    def __init__(self, account_number, holder_name):
        self.account_number = account_number
        self.holder_name = holder_name
```

The term **anemic domain model** refers to a design in which entity classes carry data with little or no behavior, with the behavior implemented in separate service classes. It is often cited as an antipattern in domain-driven design because it can lead to a proliferation of service classes and a loss of the encapsulation benefits of object orientation. In this specific case, however, the anemic model is appropriate because the account's behavior genuinely belongs to the bank, which is external to our design. Attempting to give the account behavior on the ATM side would require duplicating logic that lives authoritatively at the bank, creating a source of potential inconsistency.

### The BankService Abstract Interface

The `BankService` is defined as an abstract base class that declares every operation the ATM performs against the bank. Concrete implementations may include a REST client for production, a database-backed implementation for direct integration, and an in-memory implementation for testing and demonstration.

```python
from abc import ABC, abstractmethod
from typing import Optional


class BankService(ABC):
    """Abstract interface between the ATM and the bank.

    The ATM depends on this abstraction rather than on any concrete
    implementation. This is the Dependency Inversion Principle: the
    high-level ATM code depends on an abstraction (BankService), not on
    a low-level concrete class (InMemoryBankService or RestBankClient).

    Two categories of failure are distinguished:

    - Business-level failures (insufficient funds, invalid PIN, closed
      account) are signalled by return values. False indicates a
      verifiable business rule violation; None indicates an absent lookup.

    - Infrastructure failures (network timeout, malformed response, bank
      unavailable) are signalled by raising BankError. These are caught
      at the transaction boundary inside the state machine.
    """

    @abstractmethod
    def authenticate(self, card: Card, pin: str) -> bool:
        """Verify the PIN for a given card. Return True if valid."""

    @abstractmethod
    def get_balance(self, account: Account) -> float:
        """Return the current balance for an account."""

    @abstractmethod
    def debit(self, account: Account, amount: float) -> bool:
        """Debit amount from account. Return False on insufficient funds."""

    @abstractmethod
    def credit(self, account: Account, amount: float) -> bool:
        """Credit amount to account. Return False on failure."""

    @abstractmethod
    def transfer(self, source: Account, target: Account, amount: float) -> bool:
        """Transfer amount from source to target. Return False on failure.

        Implementations must ensure atomicity: either both accounts change
        or neither does.
        """

    @abstractmethod
    def get_account(self, account_number: str) -> Optional[Account]:
        """Look up an account by account number. Return None if not found."""
```

### The Concrete In-Memory Implementation

The concrete implementation used for demonstration stores all state in dictionaries. It is deliberately minimal: no daily limits, no overdraft protection, no ledger entries, no audit trail, no concurrency handling. Its purpose is to make the ATM runnable end-to-end, not to model a production bank.

```python
class InMemoryBankService(BankService):
    """A dict-backed BankService for demonstrations and tests.

    In production, this class is replaced by a REST client that talks to
    the bank's core-banking system, or by a direct database client. The
    ATM code does not change; it depends on BankService, which both
    implementations satisfy.
    """

    def __init__(self):
        self.accounts = {}   # account_number -> Account
        self.balances = {}   # account_number -> balance
        self.pins = {}       # card_number -> pin (plaintext for demo only)

    def register_account(self, account, balance, card, pin):
        """Setup utility (not part of the BankService contract).

        Registers an account with a starting balance and associates a
        card with a PIN. In production, the bank would already contain
        these records; this method exists purely to seed data for demos.
        """
        self.accounts[account.account_number] = account
        self.balances[account.account_number] = balance
        self.pins[card.number] = pin

    def authenticate(self, card, pin):
        return self.pins.get(card.number) == pin

    def get_balance(self, account):
        return self.balances.get(account.account_number, 0.0)

    def debit(self, account, amount):
        current = self.balances.get(account.account_number, 0.0)
        if current < amount:
            return False
        self.balances[account.account_number] = current - amount
        return True

    def credit(self, account, amount):
        self.balances[account.account_number] = (
            self.balances.get(account.account_number, 0.0) + amount
        )
        return True

    def transfer(self, source, target, amount):
        # Two-phase with compensation. In a production database, this
        # would be a single transactional operation covered by a database
        # transaction. Here the compensation is manual.
        if not self.debit(source, amount):
            return False
        if not self.credit(target, amount):
            self.credit(source, amount)  # compensating action
            return False
        return True

    def get_account(self, account_number):
        return self.accounts.get(account_number)
```

The **plaintext PIN storage** in this class is a simplification for demonstration only. In a production system, PINs are never stored in plaintext. They are stored as salted cryptographic hashes, and the comparison happens on the bank side using constant-time comparison to avoid timing-attack leakage. The mechanism for transmitting the PIN from the card to the bank uses encryption keys that never leave the hardware security module.

---

## 9. Stage 8: The ATM Class and Hardware Composition

The ATM class is the top-level coordinator. Its role is to hold references to the hardware components, the bank service, the cash dispenser, and the current state, and to delegate every user-initiated action to the current state. It contains almost no branching logic of its own; all branching is handled by polymorphism through the state objects.

### The Hardware Component Classes

Each hardware component is kept small and focused on a single responsibility. The classes are grouped in one file (`hardware/components.py`) because each is small, but each remains a distinct class with its own methods.

```python
class Screen:
    """Renders text to the user.

    In production this drives an LCD or touchscreen through a hardware
    driver. In this simulation, output is directed to standard output.
    """

    def show(self, message):
        print(f"[SCREEN] {message}")


class Keypad:
    """Reads user input.

    In production this reads from a physical keypad or touchscreen input.
    In this simulation, input is read from standard input. In the demo
    driver used later, this component is bypassed because the demo drives
    the ATM programmatically.
    """

    def read(self, prompt=""):
        return input(prompt)


class CardReader:
    """Handles card insertion, ejection, and physical retention (capture).

    Capture refers to the physical retention of a card after too many
    failed PIN attempts. In real hardware the card is drawn into an
    internal bin from which only a technician can retrieve it. In this
    simulation, capture is represented by printing a message.
    """

    def read(self, card):
        # In real hardware, this reads the chip or magnetic stripe and
        # validates cryptographic material. Here the card is returned
        # unchanged.
        return card

    def eject(self, card):
        print(f"[CARD READER] Ejecting card {card.number}")

    def capture(self, card):
        print(f"[CARD READER] Card {card.number} retained. Contact your bank.")


class DepositSlot:
    """Accepts, counts, and validates deposited cash.

    In production, a bill validator inside the slot counts and
    authenticates notes automatically. In this simulation, the count
    is obtained from a prompt.
    """

    def __init__(self):
        self._pending_amount = 0.0

    def collect_and_count(self):
        raw = input("[DEPOSIT SLOT] Enter deposit amount (simulated): ")
        try:
            amount = float(raw)
        except ValueError:
            amount = 0.0
        self._pending_amount = amount
        return amount

    def return_cash(self):
        """Physically return the cash to the user (used if the bank rejects
        the deposit after counting)."""
        print(f"[DEPOSIT SLOT] Returning ₹{self._pending_amount} to user")
        self._pending_amount = 0.0


class Printer:
    """Prints receipts to the user."""

    def print(self, receipt):
        print("=" * 40)
        print(receipt.render())
        print("=" * 40)


class Receipt:
    """Immutable record of a completed transaction."""

    def __init__(self, txn_type, amount, status, timestamp):
        self.txn_type = txn_type
        self.amount = amount
        self.status = status
        self.timestamp = timestamp

    def render(self):
        lines = [
            f"Transaction: {self.txn_type}",
            f"Status:      {self.status}",
        ]
        if self.amount is not None:
            lines.append(f"Amount:      ₹{self.amount:.2f}")
        lines.append(f"Time:        {self.timestamp.isoformat()}")
        return "\n".join(lines)
```

### The ATM Class

The `ATM` class is thin by design. Each user-initiated method is a single line that delegates to the current state. The class contains no `if` statements based on state, no `isinstance` checks based on transaction type, and no direct execution of business logic. This thinness is diagnostic: when a top-level coordinator class stays thin, it usually means responsibilities have been located correctly.

```python
class ATM:
    """Top-level coordinator for the ATM.

    Owns the hardware components, the external bank service, the cash
    dispenser, and the current state. Every user-facing method delegates
    to the current state, which is responsible for validating the action
    and performing any transition.

    The absence of branching logic in this class is intentional and
    diagnostic. If branching accumulates here, it usually indicates that
    logic has been placed in the wrong location and should be moved to
    the appropriate state class.
    """

    def __init__(self, bank, dispenser,
                 screen=None, keypad=None, card_reader=None,
                 deposit_slot=None, printer=None):
        # Hardware components. Constructor accepts injections so that
        # tests can substitute mocks; defaults are provided for
        # production use.
        self.screen = screen or Screen()
        self.keypad = keypad or Keypad()
        self.card_reader = card_reader or CardReader()
        self.deposit_slot = deposit_slot or DepositSlot()
        self.printer = printer or Printer()
        self.dispenser = dispenser

        # External dependency (abstract interface).
        self.bank = bank

        # Runtime state.
        self._state = IdleState()
        self.session = None

        self.screen.show("Welcome. Please insert your card.")

    def set_state(self, state):
        """Called by state objects during transitions to advance the machine."""
        self._state = state

    def state_name(self):
        return self._state.name()

    # Public user-facing actions. All delegate to the current state.

    def insert_card(self, card):
        self._state.insert_card(self, card)

    def enter_pin(self, pin):
        self._state.enter_pin(self, pin)

    def select_transaction(self, txn):
        self._state.select_transaction(self, txn)

    def eject_card(self):
        self._state.eject_card(self)
```

### The Composition Root

The `main.py` module (shown in Stage 10) is the **composition root** of the application. The composition root is the location in an application where the object graph is constructed and dependencies are wired together, typically at application startup. Every concrete implementation is chosen here: which `BankService` to use, which `DispensingStrategy` to use, what initial inventory to load, which hardware components to instantiate.

The importance of concentrating construction in the composition root is that every class below this point can be written against abstractions and remain ignorant of concrete implementations. Testing, extension, and replacement all become simpler because the seams for substitution are all located in one place.

---

## 10. Stage 9: Session, Authentication, and Timeout

The `Session` object carries transient state that belongs to a single user's visit to the ATM. It is created when a card is inserted and destroyed when the card is ejected or captured. Session state includes the card reference, the authentication flag, the wrong-PIN counter, and timestamps used for inactivity timeout.

### The Session Class

```python
from datetime import datetime


class Session:
    """Transient state of one user's visit to the ATM.

    Created when a card is inserted; destroyed when the card is ejected
    or captured. Tracks authentication status, wrong-PIN attempts, and
    timing information used for the inactivity timeout.

    The session is the natural home for any state that spans the entire
    interaction but does not survive it. Balance snapshots, authorised
    transaction limits, and per-visit audit information all belong here.
    """

    TIMEOUT_SECONDS = 30

    def __init__(self, card):
        self.card = card
        self.authenticated = False
        self.wrong_pin_attempts = 0
        self.started_at = datetime.now()
        self.last_activity = datetime.now()

    def touch(self):
        """Update the last-activity timestamp. Called on every user action."""
        self.last_activity = datetime.now()

    def is_timed_out(self):
        """Return True if no activity has occurred for TIMEOUT_SECONDS."""
        elapsed = (datetime.now() - self.last_activity).total_seconds()
        return elapsed > self.TIMEOUT_SECONDS
```

### Where Timeout Enforcement Belongs

Two designs for enforcing the timeout are possible, and the choice between them depends on the deployment environment.

**Design A: Enforcement on user action.** The timeout is checked at the entry point of each state's action methods. Before performing any real work, the state consults `session.is_timed_out()` and, if the session has expired, ejects the card and transitions to the idle state. This design is simple and requires no additional infrastructure, but it enforces the timeout only when the user attempts an action. A session that has expired remains logically alive until the user does something, at which point the expiration is discovered and enforced.

**Design B: Enforcement by a background timer.** A scheduler thread runs continuously and, at each configured interval, checks whether the current session has expired. If so, the scheduler triggers the ejection procedure regardless of user activity. This design is more accurate but requires a threading or async model, and it introduces concerns about safely mutating state from a thread other than the one processing user actions.

For the interview design, Design A is sufficient and is the one implemented. Design B would be identified in the follow-up discussion as the production improvement that would be introduced when the design moves into production.

### Integration of Timeout Enforcement into the State Methods

The `AuthenticatedState.select_transaction` method illustrates the enforcement:

```python
class AuthenticatedState(ATMState):
    def select_transaction(self, atm, txn):
        if atm.session.is_timed_out():
            self._handle_timeout(atm)
            return
        atm.session.touch()
        # Proceed with the transaction flow.
        from atm_system.states.transaction_selected import TransactionSelectedState
        new_state = TransactionSelectedState(txn)
        atm.set_state(new_state)
        atm.screen.show(f"Processing {txn.__class__.__name__}...")
        new_state.execute(atm)

    def _handle_timeout(self, atm):
        atm.card_reader.eject(atm.session.card)
        from atm_system.states.idle import IdleState
        atm.set_state(IdleState())
        atm.session = None
        atm.screen.show("Session timed out. Card returned.")
```

The timeout check appears at the top of every state method that mutates session state. In a production refactor, this check could be extracted into a decorator to eliminate the repetition, but for a design walkthrough the inline version is clearer.

---

## 11. Stage 10: Putting It All Together

This section assembles the complete design. The state classes are shown in full (including those deferred from Stage 4), the exception hierarchy is defined, and an end-to-end demonstration runs a scripted user journey. Every class defined in the preceding stages participates in this final assembly.

### The Exception Hierarchy

Three exception types capture the failure modes distinguished in the design:

```python
class InvalidOperation(Exception):
    """Raised when an action is attempted in a state that does not permit it.

    Example: attempting to enter a PIN before a card has been inserted.
    This exception is the mechanism by which the State pattern enforces
    its invariants.
    """


class DispenseError(Exception):
    """Raised when the cash dispenser cannot fulfil a request.

    Typically caused by insufficient inventory of the right denominations
    to produce the requested amount. Distinct from an authorisation failure,
    which is a bank concern.
    """


class BankError(Exception):
    """Raised on bank service infrastructure failures.

    Distinct from business-level failures such as insufficient funds,
    which are signalled by return values from BankService methods.
    BankError covers network timeouts, malformed responses, and other
    conditions where the outcome of a bank operation cannot be determined.
    """
```

### The Complete State Classes

The abstract base class and all four concrete states, presented in the order they appear during a normal user journey:

```python
from abc import ABC
from datetime import datetime


class ATMState(ABC):
    """Abstract base class for all ATM states."""

    def insert_card(self, atm, card):
        raise InvalidOperation(f"Cannot insert card in state {self.name()}")

    def enter_pin(self, atm, pin):
        raise InvalidOperation(f"Cannot enter PIN in state {self.name()}")

    def select_transaction(self, atm, txn):
        raise InvalidOperation(f"Cannot select transaction in state {self.name()}")

    def eject_card(self, atm):
        raise InvalidOperation(f"Cannot eject card in state {self.name()}")

    def name(self):
        return self.__class__.__name__


class IdleState(ATMState):
    """The machine is at rest, waiting for a card."""

    def insert_card(self, atm, card):
        if not card.is_valid():
            atm.card_reader.eject(card)
            atm.screen.show("Card expired. Please use a valid card.")
            return
        atm.session = Session(card=card)
        atm.set_state(HasCardState())
        atm.screen.show("Please enter your PIN")


class HasCardState(ATMState):
    """A card has been inserted; the PIN has not yet been verified."""

    MAX_PIN_ATTEMPTS = 3

    def enter_pin(self, atm, pin):
        atm.session.touch()
        if atm.bank.authenticate(atm.session.card, pin):
            atm.session.authenticated = True
            atm.set_state(AuthenticatedState())
            atm.screen.show("Authenticated. Select a transaction.")
            return

        atm.session.wrong_pin_attempts += 1
        if atm.session.wrong_pin_attempts >= self.MAX_PIN_ATTEMPTS:
            atm.card_reader.capture(atm.session.card)
            atm.set_state(IdleState())
            atm.session = None
            atm.screen.show("Card retained. Contact your bank.")
        else:
            remaining = self.MAX_PIN_ATTEMPTS - atm.session.wrong_pin_attempts
            atm.screen.show(f"Incorrect PIN. {remaining} attempts remaining.")

    def eject_card(self, atm):
        atm.card_reader.eject(atm.session.card)
        atm.set_state(IdleState())
        atm.session = None
        atm.screen.show("Card returned. Welcome.")


class AuthenticatedState(ATMState):
    """The user is authenticated and may select transactions or eject the card."""

    def select_transaction(self, atm, txn):
        if atm.session.is_timed_out():
            self._handle_timeout(atm)
            return
        atm.session.touch()
        new_state = TransactionSelectedState(txn)
        atm.set_state(new_state)
        atm.screen.show(f"Processing {txn.__class__.__name__}...")
        new_state.execute(atm)

    def eject_card(self, atm):
        atm.card_reader.eject(atm.session.card)
        atm.set_state(IdleState())
        atm.session = None
        atm.screen.show("Thank you. Please take your card.")

    def _handle_timeout(self, atm):
        atm.card_reader.eject(atm.session.card)
        atm.set_state(IdleState())
        atm.session = None
        atm.screen.show("Session timed out. Card returned.")


class TransactionSelectedState(ATMState):
    """A transaction has been selected and is being executed.

    Held only briefly during execution. After completion, the machine
    returns to AuthenticatedState so the user may perform another
    transaction or eject the card.
    """

    def __init__(self, transaction):
        self.transaction = transaction

    def execute(self, atm):
        # Wrap execution in try/except so that a bank exception does not
        # leave the ATM stuck in this state indefinitely.
        try:
            result = self.transaction.execute(atm.bank)
        except Exception as exc:
            atm.screen.show(f"System error: {exc}. Please try again.")
            self._return_to_authenticated(atm)
            return

        self._display_result(atm, result)
        if self.transaction.status == "SUCCESS":
            self._print_receipt(atm, result)
        self._return_to_authenticated(atm)

    def _display_result(self, atm, result):
        prefix = "Success" if result.success else "Failed"
        atm.screen.show(f"{prefix}: {result.message}")

    def _print_receipt(self, atm, result):
        amount = result.value if isinstance(result.value, (int, float)) else None
        receipt = Receipt(
            txn_type=self.transaction.__class__.__name__,
            amount=amount,
            status=self.transaction.status,
            timestamp=datetime.now(),
        )
        atm.printer.print(receipt)

    def _return_to_authenticated(self, atm):
        atm.set_state(AuthenticatedState())
        atm.screen.show("Another transaction? Or eject card.")
```

### End-to-End Demonstration

The following demonstration wires together every class defined in the preceding stages and runs a scripted user journey through the ATM. The demonstration exercises card insertion, PIN entry, balance inquiry, withdrawal, transfer, and card ejection.

```python
def demo():
    # Set up the bank with two customers.
    bank = InMemoryBankService()

    alice_account = Account("ACC-1001", "Alice")
    alice_card = Card(
        number="4111-1111-1111-1111",
        holder_name="Alice",
        expiry=datetime(2030, 12, 31),
        account_number="ACC-1001",
    )
    bank.register_account(alice_account, balance=10_000, card=alice_card, pin="4321")

    bob_account = Account("ACC-1002", "Bob")
    bob_card = Card(
        number="4222-2222-2222-2222",
        holder_name="Bob",
        expiry=datetime(2030, 12, 31),
        account_number="ACC-1002",
    )
    bank.register_account(bob_account, balance=500, card=bob_card, pin="0000")

    # Set up the ATM with a stocked dispenser.
    dispenser = CashDispenser({
        2000: 5,    # five ₹2,000 notes
        500: 10,    # ten ₹500 notes
        200: 5,     # five ₹200 notes
        100: 8,     # eight ₹100 notes
    })
    atm = ATM(bank=bank, dispenser=dispenser)

    # Simulated user journey.
    print("\n--- Alice inserts her card ---")
    atm.insert_card(alice_card)

    print("\n--- Alice enters her PIN ---")
    atm.enter_pin("4321")

    print("\n--- Alice checks her balance ---")
    atm.select_transaction(BalanceInquiry(alice_account))

    print("\n--- Alice withdraws ₹4,600 ---")
    atm.select_transaction(Withdrawal(alice_account, 4600, dispenser))

    print("\n--- Alice transfers ₹1,000 to Bob ---")
    atm.select_transaction(Transfer(alice_account, bob_account, 1000))

    print("\n--- Alice ejects the card ---")
    atm.eject_card()


if __name__ == "__main__":
    demo()
```

Running this program produces a sequence of screen messages that trace the state transitions and transaction results. The final balances after the demonstration are as follows: Alice has ₹4,400 (₹10,000 minus ₹4,600 withdrawn minus ₹1,000 transferred), and Bob has ₹1,500 (₹500 initial plus ₹1,000 received). The dispenser inventory has been reduced by two ₹2,000 notes, one ₹500 note, and one ₹100 note (totaling ₹4,600).

---

## 12. Stage 11: Validating with Mental Walkthroughs

Design walkthroughs are the stage at which quiet bugs surface. The purpose of a walkthrough is not to demonstrate the design to the interviewer; it is to expose defects that are invisible when the code is read as static text. Each walkthrough traces a specific scenario through the design, noting the state transitions, the calls made to external components, and the resulting state of the system. Five walkthroughs are presented, covering the primary happy path, two failure modes visible in the requirements, one edge case that reveals subtle correctness, and one defect that only walkthrough analysis would reveal.

### Flow 1: Happy-Path Withdrawal

**Scenario.** Alice inserts her card, enters her PIN correctly, and withdraws ₹4,600. Her account has ₹10,000. The dispenser holds sufficient inventory of every denomination.

**Trace.** Card insertion triggers `IdleState.insert_card`. The card's expiry is validated locally and passes. A `Session` object is created; the state advances to `HasCardState`. PIN entry triggers `HasCardState.enter_pin`. The bank's `authenticate` call returns True. The session's authenticated flag is set; the state advances to `AuthenticatedState`. Transaction selection triggers `AuthenticatedState.select_transaction`. A `TransactionSelectedState` is constructed and `execute` is called on it. `Withdrawal.execute` runs the three-step sequence: `dispenser.can_dispense(4600)` returns True, `bank.debit` succeeds (balance becomes ₹5,400), and `dispenser.dispense(4600)` succeeds with the plan `{2000: 2, 500: 1, 100: 1}`. The receipt is printed. The state returns to `AuthenticatedState`. Ejection triggers `AuthenticatedState.eject_card`. The card is ejected, the session is cleared, and the state advances to `IdleState`.

**Outcome.** All transitions are valid. Alice's balance is consistent. The dispenser inventory is decremented once, and the physical dispense occurred once. No exceptions were raised.

### Flow 2: Insufficient Funds

**Scenario.** Alice authenticates successfully, then requests a withdrawal of ₹15,000 against her balance of ₹10,000.

**Trace.** `Withdrawal.execute` runs step one: `dispenser.can_dispense(15000)` returns True because the dispenser holds sufficient cash. Step two: `bank.debit(alice_account, 15000)` returns False because the account does not have sufficient funds. The transaction status becomes `FAILED` and a failure result is returned. The dispenser is not called for step three, so no inventory is modified. The state returns to `AuthenticatedState`, from which Alice may retry with a smaller amount.

**Outcome.** The order of operations prevented an inventory modification for a transaction that could not complete. If the ordering had placed dispensing before the debit check, cash would have been physically dispensed against a debit that then failed, producing a serious integrity defect.

### Flow 3: Dispenser Cannot Produce the Amount

**Scenario.** Alice has ₹50,000 in her account. The ATM's inventory has been depleted such that only ten ₹200 notes remain (the ₹2,000, ₹500, and ₹100 slots are empty). Alice requests ₹4,600.

**Trace.** `Withdrawal.execute` runs step one: `dispenser.can_dispense(4600)` invokes `GreedyStrategy.plan`, which iterates over denominations. The ₹2,000 handler contributes zero (empty inventory). The ₹500 handler contributes zero (empty inventory). The ₹200 handler could theoretically contribute twenty-three notes but is limited to ten by available inventory, contributing ₹2,000; the remaining amount is ₹2,600. The ₹100 handler contributes zero (empty inventory). The remaining amount is non-zero. `plan` returns None; `can_dispense` returns False. The transaction status becomes `FAILED`. The bank is not called; no debit occurs; no inventory is modified.

**Outcome.** The infeasibility of the request was detected before any state was mutated. The user is informed and may try a different amount (for example, ₹2,000, which the dispenser can produce).

### Flow 4: Three Wrong PIN Attempts

**Scenario.** Alice inserts her card but enters an incorrect PIN three times in a row.

**Trace.** First entry: `HasCardState.enter_pin` calls `bank.authenticate`, which returns False. The session's `wrong_pin_attempts` counter is incremented to 1, and a screen message reports two remaining attempts. Second entry: same behavior; counter is 2, one remaining. Third entry: bank returns False, counter becomes 3, and the branch that handles the maximum-attempts condition activates. `card_reader.capture` is invoked, which physically retains the card. The state is reset to `IdleState`. The session is cleared. The screen displays a message directing Alice to contact her bank.

**Outcome.** The card capture is triggered exactly at the threshold. The session is fully cleared, preventing any subsequent action from operating against stale session state. The machine is ready for the next user.

### Flow 5: A Defect Revealed Only by Walkthrough

**Scenario.** Alice authenticates and initiates a withdrawal. During the transaction's execution, the bank's `debit` method raises `BankError` (network timeout) rather than returning False.

**Trace.** Consider what happens if the `TransactionSelectedState.execute` method is written without exception handling. `Withdrawal.execute` raises `BankError`, which propagates out of `execute`. The state was set to `TransactionSelectedState` before `execute` was called and is never reset. The screen was updated to "Processing Withdrawal..." and is never updated with a result. The user is stuck in `TransactionSelectedState`, which has no defined action methods, so every subsequent user action raises `InvalidOperation`. The card is not ejected, and no message informs the user of the problem.

**Defect and fix.** This is a real defect not visible from reading the code as static text. The fix is to wrap the transaction's execution in a try/except at the state level, catching broad exceptions, displaying a user-friendly message, and returning the state to `AuthenticatedState`:

```python
def execute(self, atm):
    try:
        result = self.transaction.execute(atm.bank)
    except Exception as exc:
        atm.screen.show(f"System error: {exc}. Please try again.")
        self._return_to_authenticated(atm)
        return
    # ... continue with normal result handling
```

**Outcome.** After the fix, a bank exception produces a user-visible error message and a return to `AuthenticatedState`, from which the user may retry or eject the card. The system does not become stuck. This defect illustrates why walkthrough analysis is not optional: no amount of pattern-application substitutes for tracing specific failure paths through the actual code.

---

## 13. Stage 12: Anticipating Follow-Up Questions

Interviewers almost always follow the primary design with a set of extension questions that probe how well the design accommodates change. A strong candidate has concise, confident answers to each. The following eight questions cover the extensions most commonly raised for the ATM problem, with the reasoning for each answer.

### Q1: How would the design support interbank transactions?

A `RoutingService` is introduced between the ATM and the concrete bank. The ATM does not know which bank issued a given card; it delegates the routing decision to the router, which inspects the card's identifier prefix (in real systems, the Bank Identification Number or BIN), determines the issuing bank, and forwards the transaction to that bank's service. Failure modes multiply because the routing layer itself may be unavailable, timeouts may occur at any hop, and the issuing bank may reject transactions for reasons the routing layer does not know. The ATM code changes only at the single point where it currently calls `self.bank`; that call becomes `self.router.route(...)`. The routing layer is itself a service that satisfies the same `BankService` interface, so the interaction with the ATM remains unchanged.

### Q2: How does the design handle concurrent access to the same account from multiple ATMs?

Concurrency at the account level is not the ATM's responsibility. The bank owns the account state and must serialise concurrent access using database-level mechanisms (row-level locks, optimistic concurrency with version numbers, or serialisable transactions). The ATM's responsibility is to react cleanly to whichever failure mode the bank reports. The compensating-action discipline demonstrated in `Withdrawal.execute` already handles this: if a concurrent transaction consumes the balance between the ATM's feasibility check and its debit call, the debit call returns False, and the transaction is failed cleanly. If the bank supports optimistic concurrency and returns a conflict indication, the ATM treats this exactly like insufficient funds: fail the transaction, restore consistency, and inform the user.

### Q3: How would the design accommodate physical dispensing time and jam handling?

In the current design, `dispenser.dispense` is synchronous and atomic. In real hardware, dispensing a large amount takes several seconds during which the machine must accept no user input, and the physical mechanism can jam mid-way. To accommodate this, a `DispensingState` is inserted between `TransactionSelectedState` and the return to `AuthenticatedState`. The machine remains in `DispensingState` while cash physically emerges. All user actions in this state raise `InvalidOperation` because no user input is meaningful. A callback from the physical dispenser signals either completion or jam. On completion, the state advances to `AuthenticatedState`. On jam, the transaction is captured as **disputed**: the debit stands (money has left the account), but the physical dispense is incomplete. The user is instructed to contact the bank for reconciliation, and the incident is logged for the bank's dispute-resolution process. This scenario is one of the most common sources of real-world ATM complaints, and naming it explicitly in the interview demonstrates awareness of production concerns.

### Q4: How does the design handle receipt-printing failure?

Receipt printing is not part of the transaction's atomicity. The transaction has completed at the bank and the dispense (if any) has completed at the hardware before the receipt is printed. If the printer fails (out of paper, mechanical fault), the transaction is still complete. The correct response is to display a screen message ("Receipt could not be printed; your transaction was successful") and to log the printer failure for maintenance. Under no circumstance should a printer failure trigger a reversal of the transaction.

### Q5: How would the design accommodate biometric authentication?

The cleanest extension introduces an `AuthenticationStrategy` interface with concrete implementations for PIN, biometric, and one-time password. The `HasCardState` holds a reference to the current authentication strategy and delegates verification to it:

```python
class AuthenticationStrategy(ABC):
    @abstractmethod
    def verify(self, card, credential) -> bool: ...


class PINStrategy(AuthenticationStrategy):
    def __init__(self, bank):
        self.bank = bank

    def verify(self, card, credential):
        return self.bank.authenticate(card, credential)


class BiometricStrategy(AuthenticationStrategy):
    def __init__(self, biometric_service):
        self.biometric_service = biometric_service

    def verify(self, card, credential):
        return self.biometric_service.match(card, credential)
```

This is the Strategy pattern again, applied at the authentication layer. Multiple strategies can be composed by requiring more than one to succeed (multi-factor authentication) or by allowing any one to succeed (either PIN or biometric). The state machine is unaffected: the state that awaits authentication delegates to a strategy, and strategies are swapped at composition-root time.

### Q6: How would the design support cardless withdrawal?

Cardless withdrawal is initiated through a channel other than card insertion, typically a mobile banking application that generates a reference code. A new entry point is added to the ATM: `initiate_cardless_withdrawal(reference_code)`. This bypasses the `IdleState.insert_card` transition and enters a new state, `HasReferenceState`, which verifies the reference code with the bank. Upon verification, the state advances to `AuthenticatedState`, from which the rest of the flow (transaction selection, dispensing, ejection) reuses the existing states unchanged. The State pattern accommodates this cleanly: new entry paths become new starting states, without requiring modification of the states downstream.

### Q7: How would the design be tested?

Each layer is tested independently. **State tests** construct a state, invoke an action with a mock ATM, and assert the resulting transition and the mock calls. **Transaction tests** construct a transaction with a mock bank service and a mock dispenser, invoke `execute`, and assert the sequence of calls and the resulting `TransactionResult`. **Dispenser tests** stock the dispenser with a specific inventory, request an amount, and assert the resulting plan and the resulting inventory. **Bank tests** exercise the `InMemoryBankService` implementation directly, and the `BankService` interface is mocked using `unittest.mock.Mock` for tests that focus on the ATM's handling of specific bank behaviors. **End-to-end tests** wire the whole system together and run scripted user journeys such as the demonstration in Stage 10. The isolation produced by the design makes each of these categories small, independent, and fast.

### Q8: How does the design handle the ATM being offline?

Two policies are possible. The **deny-all policy** refuses all transactions and displays "ATM is offline" to any user who attempts to insert a card. This is the safest policy and is the one used by most real ATMs. The **cached-read policy** allows read-only transactions (balance inquiry) using cached data from the last successful bank contact and refuses all mutating transactions. This policy is difficult to implement correctly because the cached balance may be stale, and it is rarely worth the operational risk. The current design accommodates either policy without modification: the `BankService` implementation reports its own availability by raising `BankError` on operations, and the transaction-level try/except (Flow 5 in Stage 11) handles the resulting exception cleanly.

### Q9: How would an audit trail be added?

A `TransactionLog` is introduced that receives every completed or failed transaction. Log entries are immutable and append-only, satisfying regulatory audit requirements. Two implementation locations are possible. The first places the logging call inside the `TransactionSelectedState.execute` method, immediately after the transaction returns: `atm.transaction_log.record(txn, result)`. The second places the logging call inside each transaction's `execute` method. The first location is cleaner because it keeps transactions focused on their own execution and does not require every new transaction subclass to remember to log itself. The state acts as the crosscutting concern's integration point.

### Q10: How would low-inventory alerting be added?

The Observer pattern is applied to the dispenser. **Observer pattern definition:** the Observer pattern is a behavioral design pattern in which an object (the subject) maintains a list of dependents (observers) and notifies them of state changes. Applied here, the dispenser is the subject; observers include a maintenance system that dispatches refills and an operations dashboard that displays inventory levels. When any denomination's count drops below a configured threshold, the dispenser notifies its observers with the affected denomination and the new count. The chain-of-handlers logic is unaffected; only the observer wiring is added. This composition of patterns (Strategy for algorithm selection, Observer for cross-cutting notification, State for the machine's mode) is characteristic of well-designed systems in which multiple patterns collaborate, each doing one job.

---

## 14. Summary of Patterns and Principles Used

The ATM design integrates several design patterns and principles. The following table summarises where each is applied and what problem it solves in this context.

| Pattern or Principle | Where Applied | Problem Solved |
|---|---|---|
| State pattern | `ATMState` hierarchy with `IdleState`, `HasCardState`, `AuthenticatedState`, `TransactionSelectedState` | Localises the invariants of each operational mode; allows new states to be added without modifying existing code |
| Command pattern (light) | `Transaction` hierarchy with `Withdrawal`, `Deposit`, `BalanceInquiry`, `Transfer` | Encapsulates a request as an object; enables polymorphic execution without type-based branching |
| Strategy pattern | `DispensingStrategy` with `GreedyStrategy` (and alternatives such as `BalancedStrategy`, `OptimalStrategy`); also applied to `AuthenticationStrategy` in the biometric extension | Allows algorithms to be selected or replaced at runtime without modifying the client |
| Chain of Responsibility pattern | `DenominationHandler` chain inside `ChainStrategy` | Distributes execution across handlers with distinct per-denomination logic; justified only when policy diverges |
| Facade pattern | `CashDispenser` over `DispensingStrategy` and inventory | Presents a simplified interface (`can_dispense`, `dispense`) to a subsystem with multiple internal parts |
| Observer pattern | Dispenser inventory alerts (Q10 extension) | Notifies interested parties of state changes without coupling the source to the recipients |
| Dependency Inversion Principle | `BankService` interface with concrete implementations (`InMemoryBankService`, `RestBankClient`) | High-level modules (ATM) depend on abstractions rather than concrete implementations |
| Single Responsibility Principle | Separate classes for each hardware component and each state | Each class has one reason to change; changes remain localised |
| Open/Closed Principle | Adding a new state, transaction, dispensing strategy, or denomination handler requires no modification of existing classes | Software entities are open for extension but closed for modification |
| Liskov Substitution Principle | Any concrete `BankService`, `DispensingStrategy`, or `ATMState` may be substituted for its abstract type without altering correctness | Subtypes preserve the contracts of their base types |
| Composition Root | `main.py` (the demo driver) | Concentrates dependency wiring in one location; keeps every other class free of concrete-implementation knowledge |
| Compensating Action | `Withdrawal.execute` reversing the debit on dispense failure; `Deposit.execute` returning cash on credit failure; `InMemoryBankService.transfer` reversing the debit on credit failure | Restores consistency when a multi-step operation fails partway |

---

## 15. Key Takeaways

The following six lessons distill the transferable insights from the ATM problem. Each generalises beyond the ATM to a broad category of low-level design problems.

**Lesson 1: The State pattern is the correct choice for any problem with named operational modes.** The ATM has clearly separated modes (idle, has-card, authenticated, transaction-selected), and each mode admits a different set of actions. This is the diagnostic signature of a State-pattern problem. Recognising the signature quickly and reaching for the pattern produces a design that is more maintainable and more extensible than any flag-based alternative. The same signature appears in the elevator, the vending machine, order processing systems, document workflows, network connections, and payment gateways.

**Lesson 2: The Strategy pattern is the right level of abstraction for algorithmic variability, while the Chain of Responsibility pattern is the right structure for divergent per-handler logic.** The two patterns operate at different levels and answer different questions. Confusing them is a common design error. When the problem admits multiple interchangeable algorithms, use Strategy. When the problem requires distinct logic per handler in an ordered sequence, use Chain of Responsibility. When both apply, the correct structure is Strategy at the outer level with Chain of Responsibility as one strategy implementation.

**Lesson 3: Order of operations matters for integrity, and the discipline of compensating actions is foundational.** `Withdrawal.execute` checks dispenser feasibility first, then debits, then dispenses, and reverses the debit on dispense failure. This ordering is not incidental. It is what prevents the user's money from disappearing on a hardware failure. Whenever code contains two or more mutating operations, the following question must be asked: if the second operation fails after the first has succeeded, is the state from the first recoverable? If not, either reorder the operations, wrap them in a transaction, or add explicit compensation. This discipline is the miniature of distributed-transaction management and applies far beyond ATMs.

**Lesson 4: External systems must be modeled as interfaces, not as concrete classes.** The ATM does not own accounts or balances; it calls into `BankService`, defined as an abstract interface. This is the Dependency Inversion Principle expressed concretely: the high-level ATM depends on an abstraction rather than a concrete `InMemoryBankService` or `RestBankClient`. Any implementation plugs in without modification of the ATM. Every LLD problem worth solving has at least one such boundary. Locating it and modeling it as an interface simplifies the rest of the design substantially.

**Lesson 5: Design walkthroughs surface defects that reading code does not.** The Flow 5 defect (a bank exception leaving the ATM stuck in `TransactionSelectedState`) was found by tracing a specific execution path, not by reading the code as static text. Every design should be validated by tracing at least one happy path and one failure path. If the designer cannot describe what the system does when the network fails or when hardware jams, the design is incomplete regardless of how many patterns it applies.

**Lesson 6: A thin coordinator is a diagnostic sign of good design.** The `ATM` class contains one-line methods with no branching logic. It knows about states, transactions, hardware, and the bank, but it does not decide anything. The states decide. When a top-level class stays thin, responsibilities have usually been located correctly. When it grows fat, something is misplaced. The god-class antipattern is exactly the failure of this discipline. Whenever a top-level class accumulates logic, the question to ask is: where else could this logic live? The answer is almost always: with the object that owns the data the logic operates on.

---

## 16. Practice Questions with Solutions

The following practice questions test the design and its extensions. Solutions are provided immediately after each question to support self-paced study.

### Question 1

The `Withdrawal.execute` method performs three operations in a specific order: feasibility check, debit, dispense. Explain what could go wrong if the order were rearranged to dispense first, then debit, and describe the resulting integrity problem in detail.

**Solution.** If dispensing occurs before the debit, the physical cash emerges from the machine before the account has been debited. If the debit then fails (for example, because the account has insufficient funds, or because the bank is unreachable, or because a concurrent transaction has consumed the balance), the user has already received cash for which the account has not been charged. There is no way to recover the physical cash from the user's hand. The bank is out of the amount, and there is no legitimate way to reconcile the difference from a system-integrity standpoint. This produces a financial loss for the bank and a compliance failure because bank records do not accurately reflect what happened. The correct ordering (feasibility check first, then debit, then dispense) ensures that the debit succeeds before any irreversible physical action occurs, and the compensating credit handles the residual case in which dispensing fails despite passing the feasibility check.

### Question 2

The `HasCardState.enter_pin` method contains a hardcoded constant `MAX_PIN_ATTEMPTS = 3`. Describe two ways to make this configurable, discuss the trade-offs of each approach, and identify which approach is more consistent with the design principles used elsewhere in the ATM.

**Solution.** The first approach makes the constant a class attribute that can be overridden by subclassing `HasCardState`. This is a lightweight change but couples configuration to inheritance, which is generally reserved for behavioral variation. The second approach passes the value into the `HasCardState` constructor as a parameter, with the ATM providing the value from its configuration. This decouples configuration from inheritance and allows the value to be sourced from a configuration file, environment variable, or centralised policy service without modifying any state class.

The second approach is more consistent with the design principles used elsewhere. The ATM already uses constructor injection for its major dependencies (bank service, dispenser, hardware components), and applying the same discipline to policy values keeps the injection pattern uniform. A production refinement would introduce a `Policy` or `SecurityPolicy` object holding all such thresholds (maximum PIN attempts, session timeout duration, maximum withdrawal per transaction), which is then injected into the ATM and passed down to state constructors as needed. This centralises policy configuration and simplifies both testing and operational tuning.

### Question 3

Design a `BalancedStrategy` implementation of `DispensingStrategy` with the following requirement: for requested amounts below ₹5,000, the strategy preserves ₹2,000 notes by treating them as unavailable (contributing zero regardless of inventory). For requested amounts of ₹5,000 or greater, the strategy uses standard greedy behavior. Provide the Python implementation and explain in which file it belongs.

**Solution.** The implementation belongs in a new file `dispenser/balanced_strategy.py` because it is a new strategy that should not modify any existing file. Adding a new file rather than modifying existing ones satisfies the Open/Closed Principle directly.

```python
from typing import Optional
from atm_system.dispenser.strategy import DispensingStrategy


class BalancedStrategy(DispensingStrategy):
    """Preserves high-denomination notes for large withdrawals.

    For amounts below ₹5,000, the ₹2,000 denomination is treated as
    unavailable, forcing the algorithm to use smaller denominations.
    For amounts of ₹5,000 or greater, standard greedy behavior applies.

    The threshold is configurable via the constructor.
    """

    def __init__(self, preserve_threshold=5000, preserved_denomination=2000):
        self.preserve_threshold = preserve_threshold
        self.preserved_denomination = preserved_denomination

    def plan(self, amount, inventory):
        # Construct a view of inventory that respects the preservation policy.
        effective_inventory = dict(inventory)
        if amount < self.preserve_threshold:
            effective_inventory[self.preserved_denomination] = 0

        plan = {}
        remaining = amount
        for denom in sorted(effective_inventory.keys(), reverse=True):
            available = effective_inventory[denom]
            count = min(remaining // denom, available)
            if count > 0:
                plan[denom] = count
                remaining -= count * denom
            if remaining == 0:
                break
        return plan if remaining == 0 else None
```

Wiring this into the ATM happens at the composition root. In `main.py`, the dispenser is constructed with the new strategy:

```python
dispenser = CashDispenser(inventory={...}, strategy=BalancedStrategy())
```

No other file requires modification. The `CashDispenser`, `Withdrawal`, `ATM`, and all state classes remain unchanged.

### Question 4

The current design executes transactions synchronously inside `TransactionSelectedState.execute`. Suppose the interviewer asks how the design would accommodate transactions that take significant time (for example, a physical dispense of thousands of notes taking tens of seconds). Describe the modifications required, identify which existing classes are affected, and specify what a new `DispensingState` would look like.

**Solution.** The current design assumes that transaction execution is instantaneous. Accommodating physically time-consuming operations requires introducing a state in which the ATM sits while the operation completes and during which no user input is accepted.

A new state `DispensingState` is added to the state machine. It is entered from `TransactionSelectedState` immediately before the physical dispense begins, and it is exited when the dispenser signals completion (or jam). All user-facing actions in `DispensingState` inherit the base `ATMState` default and raise `InvalidOperation`, correctly rejecting input during the physical operation.

```python
class DispensingState(ATMState):
    """Physical dispensing is in progress. No user input is accepted."""

    def __init__(self, transaction, on_complete, on_jam):
        self.transaction = transaction
        self.on_complete = on_complete
        self.on_jam = on_jam

    def notify_complete(self, atm):
        """Called by the physical dispenser when dispensing succeeds."""
        self.on_complete(atm, self.transaction)

    def notify_jam(self, atm):
        """Called by the physical dispenser when a jam is detected."""
        self.on_jam(atm, self.transaction)
```

The dispenser interface is extended to expose a callback-based dispense method: `dispense_async(amount, on_complete, on_jam)` rather than the synchronous `dispense(amount)`. `Withdrawal.execute` initiates dispensing and transitions the state to `DispensingState`; it does not wait for completion.

The callbacks translate the physical outcome into state transitions: `on_complete` prints the receipt and returns to `AuthenticatedState`; `on_jam` marks the transaction as disputed, logs the incident, and returns to `AuthenticatedState` with a message directing the user to contact the bank.

The classes affected are `Withdrawal`, `CashDispenser`, `DispensingStrategy` (which gains an async variant), and the state hierarchy (which gains `DispensingState`). The `ATM` class itself is unchanged because the delegation to states remains uniform.

### Question 5

Explain why the `Account` class in this design does not carry a balance field, and describe under what design change the decision would be reconsidered.

**Solution.** The `Account` class does not carry a balance because the balance is owned authoritatively by the bank, not by the ATM. Any balance value held by the ATM would be a cached snapshot at some point in time, and the value would become stale the moment any transaction occurs. Since transactions can occur concurrently from other ATMs, from online banking, or from card payments elsewhere, a cached balance cannot be treated as reliable. Displaying a stale balance to the user is a serious usability defect, and executing a transaction based on a stale balance is a serious correctness defect. The safe policy is to fetch the balance from the bank at the moment it is needed and to treat every subsequent operation as requiring bank confirmation.

The decision would be reconsidered under two design changes. First, if the ATM were extended to operate in an offline mode using cached data, a balance snapshot would need to be stored. The design accommodates this by treating the snapshot as belonging to the `Session` rather than to the `Account` itself, preserving the invariant that `Account` is a stable identifier and not a mutable state holder. Second, if the design scope were extended to include the bank backend itself, `Account` would take on behavior and state because it would then be the authoritative holder rather than a client-side reference. In that scope, methods such as `debit`, `credit`, and `get_balance` would move onto the account class, and the anemic-model criticism would apply. Within the ATM's scope, the anemic model is the correct choice.

---

## 17. Final Reflection

The ATM problem consolidates several distinct low-level design techniques into a single exercise. The State pattern organises the machine's operational modes. The Command pattern (in its lightweight form) organises the transaction hierarchy. The Strategy pattern organises the choice of dispensing algorithm. The Chain of Responsibility pattern becomes available for the specific extension in which per-denomination policy diverges. The Facade pattern presents the dispenser as a single object to the rest of the system. The Observer pattern is available for cross-cutting concerns such as inventory alerting. The Dependency Inversion Principle governs the boundary between the ATM and the bank. The compensating-action discipline governs the ordering of operations within each transaction that touches more than one subsystem.

A candidate who executes each of these decisions correctly demonstrates competence across a broader surface area of the design-pattern landscape than most LLD problems require. The problem is therefore worth studying carefully even though it does not appear on interview lists as frequently as the parking lot or the elevator.

Beyond the specific patterns, the ATM problem teaches four transferable habits. The first is the discipline of clarifying requirements before designing; the nine-question walkthrough in Stage 2 is the model for how any LLD problem should be opened. The second is the discipline of validating designs by mental walkthrough; the five flows in Stage 11 illustrate how quiet defects surface only when specific execution paths are traced. The third is the discipline of choosing patterns based on the problem's structure rather than on their availability; the Strategy-versus-Chain-of-Responsibility discussion in Stage 6 illustrates how the same problem admits different structural choices and how the choice must be justified. The fourth is the discipline of keeping coordinators thin and locating decision logic with the object that owns the relevant data; the `ATM` class's one-line methods demonstrate this principle concretely.

Taken together with the parking lot (which teaches relationships and pluggable policy), the elevator (which teaches state machines and scheduling), and the library (which teaches policy-driven domain modeling), the ATM completes the four canonical shapes of LLD interview problems. Most other LLD questions decompose into some combination of these four shapes, and mastery of them provides the reasoning framework for addressing any specific problem encountered in an interview.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch. Explore more at https://codeverra.com*
