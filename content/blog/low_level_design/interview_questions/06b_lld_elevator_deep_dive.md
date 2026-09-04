# LLD Deep Dive #2 — Designing an Elevator System

> **What this document is:** A genuine, step-by-step walkthrough of how to think through an Elevator LLD problem in an interview. We'll reason from first principles, weigh alternatives, and document each design decision — building toward a clean, extensible design centered on the State pattern.

---

## Table of Contents

1. [Why This Problem Matters](#1-why-this-problem-matters)
2. [Stage 1 — Receiving the Problem](#2-stage-1--receiving-the-problem)
3. [Stage 2 — Clarifying Requirements](#3-stage-2--clarifying-requirements)
4. [Stage 3 — Identifying Entities](#4-stage-3--identifying-entities)
5. [Stage 4 — Modeling Requests (Internal vs External)](#5-stage-4--modeling-requests)
6. [Stage 5 — The State Pattern Decision](#6-stage-5--the-state-pattern-decision)
7. [Stage 6 — Implementing the States](#7-stage-6--implementing-the-states)
8. [Stage 7 — The Elevator Class](#8-stage-7--the-elevator-class)
9. [Stage 8 — The Dispatcher and Scheduling Strategy](#9-stage-8--the-dispatcher-and-scheduling-strategy)
10. [Stage 9 — The Building (Top-Level Coordinator)](#10-stage-9--the-building-top-level-coordinator)
11. [Stage 10 — Validating with a Mental Walkthrough](#11-stage-10--validating-with-a-mental-walkthrough)
12. [Stage 11 — Anticipating Follow-Up Questions](#12-stage-11--anticipating-follow-up-questions)
13. [Final Reflection — What This Problem Teaches](#13-final-reflection)

---

## 1. Why This Problem Matters

If Parking Lot is the canonical "model relationships" problem, Elevator is the canonical "model state transitions" problem. It's specifically designed (whether interviewers know it or not) to make the **State pattern** shine.

What makes the elevator interesting:

- **An elevator has distinct modes of operation** — idle, moving up, moving down, stopped with doors open. Each mode allows different actions and produces different next moves.
- **Multiple elevators must coordinate** — when a request comes in, who handles it?
- **Two kinds of input exist** — pressing a button on a floor (external) vs pressing a destination inside the elevator (internal). Their routing is fundamentally different.

Get this design right, and you've shown mastery of state machines, the Strategy pattern, and the discipline of separating coordination from execution. Get it wrong (one giant `if` chain on a `state` string), and the interviewer files you under "didn't know about the State pattern."

---

## 2. Stage 1 — Receiving the Problem

The interviewer says:

> "Design an elevator system."

That's it. Same as before — deliberately vague.

Possible interpretations:

- A single elevator? Or multiple in a building?
- How many floors?
- Express elevators? Service elevators?
- Capacity limits? Weight limits?
- Real-time scheduling, or just FIFO?
- Emergency mode? Maintenance mode?
- What's the simulation granularity — discrete time steps? Real time?

We don't know. So we ask.

---

## 3. Stage 2 — Clarifying Requirements

Let's go through the questions structurally — what we'd ask, and *why each question changes the design*.

### Q1: One elevator or multiple?

**Why ask:** With a single elevator, there's no scheduling problem — every request goes to the only car. With multiple, we need a *dispatcher* to decide which elevator handles a given request. That's a major architectural difference.

Suppose: *"Multiple — say, 3 elevators in a 10-floor building."*

Now we know we need a dispatcher. We'll likely also want a scheduling strategy (nearest-elevator, round-robin, etc.) — perfect setup for the Strategy pattern.

### Q2: How are requests made?

**Why ask:** This shapes what kinds of input the system handles.

In a real elevator system, there are *two* kinds of requests:

- **External (hall call):** Someone on floor 5 presses "up." They want *some* elevator to come pick them up.
- **Internal (car call):** Someone inside an elevator presses "8." They want *this elevator* to go to floor 8.

These are fundamentally different. External requests go through the dispatcher (it picks the elevator). Internal requests bypass the dispatcher (the rider is already inside a specific elevator).

Many candidates miss this distinction and build a system that only handles one type. **Naming this distinction up front is a strong signal of LLD experience.**

Suppose: *"Yes, both types — external from a floor, and internal from inside the car."*

Good. We now know we need at least two `Request` types (or one type with a flag — we'll decide later).

### Q3: What states does an elevator have?

**Why ask:** Some interviewers will tell you, others want you to enumerate them. Either way, naming the lifecycle is critical.

A reasonable list:

- **Idle** — sitting at a floor, no pending requests.
- **Moving up** — between floors, heading up.
- **Moving down** — between floors, heading down.
- **Door open** — stopped at a floor with doors open.
- **Door closed** — stopped at a floor with doors closed (transitional).

Some designs collapse "door open" and "door closed" into a single "stopped" state. We'll discuss this when we model states.

Suppose the interviewer agrees: *"Yes, those states are fine."*

### Q4: How is a moving elevator scheduled?

**Why ask:** Real elevators don't reverse direction mid-trip. If an elevator is going up and there's a request below, it usually finishes its upward run before turning around. This is sometimes called the **SCAN/LOOK algorithm** (analogous to disk scheduling).

Implementing realistic scheduling is complex. For an interview, we usually simplify.

Suppose: *"Use a simple nearest-stop algorithm for now. Mention more sophisticated alternatives as extensions."*

### Q5: Dispatch strategy among elevators?

**Why ask:** When an external request comes in, which elevator gets it?

Options:
- **Nearest idle elevator** (or nearest of any state).
- **Round-robin.**
- **Least-loaded** (fewest pending stops).
- **Trajectory-aware** (prefer an elevator already moving toward the request).

Suppose: *"Nearest car. Also pluggable for future strategies."*

Excellent — pluggable strategy = clear Strategy pattern signal.

### Q6: Capacity, weight limits, emergency?

**Why ask:** Scope-bounding. These are real concerns but often beyond interview scope.

Suppose: *"Out of scope. Mention as extensions."*

### Q7: How does the simulation advance?

**Why ask:** This is subtle but important. In a real system, elevators move continuously. In a simulation, we usually use **discrete time steps** ("ticks"). Each tick, every elevator advances its state by one unit (e.g., moves one floor, opens doors, etc.).

This ticking model is much simpler to implement than continuous time. We'll use it.

### Recap

> *"So we have: a building with 10 floors and 3 elevators. Each elevator has Idle / MovingUp / MovingDown / DoorOpen / DoorClosed states. Two request types — external (from a floor, handled by a dispatcher) and internal (from inside a car). Dispatcher uses nearest-car selection but is pluggable. Simulation advances in discrete ticks. Capacity, weight, and emergency are out of scope. Sound right?"*

This recap gets confirmed, and now we design.

---

## 4. Stage 3 — Identifying Entities

Let's pull nouns from the requirements.

- building
- floor
- elevator
- request (external, internal)
- dispatcher
- scheduling strategy
- state (Idle, MovingUp, MovingDown, DoorOpen, DoorClosed)
- direction (Up, Down, Idle)
- button
- panel

Let's filter:

| Noun | Candidate Class? | Reasoning |
|---|---|---|
| building | **Yes** | Top-level entity; owns floors and elevators |
| floor | Maybe — see below | Does it have behavior of its own? |
| elevator | **Yes** | Core entity with state and behavior |
| request | **Yes** | First-class concept; benefits from inheritance for external/internal |
| dispatcher | **Yes** | Distinct responsibility — routing requests |
| scheduling strategy | **Yes (interface)** | Pluggable algorithm = Strategy pattern |
| state | **Yes (hierarchy)** | The State pattern — one class per state |
| direction | **Enum**, not class | Just a label |
| button | Reject | UI artifact; we just receive resulting requests |
| panel | Reject | Same reasoning |

### Should `Floor` be a class?

Floors don't really have behavior in our scope — they're just integer positions. We *could* make `Floor` a class to represent floor-specific things (per-floor buttons, displays, occupancy), but those are out of scope.

**Decision:** Skip `Floor` as a class. Use integers for floor numbers. We can revisit if richer floor concerns enter scope.

This is a YAGNI decision, and it's worth verbalizing:

> *"I'm representing floors as integers rather than a Floor class. Floors don't carry any behavior in our current scope — no per-floor buttons or displays we're modeling. If we needed those, I'd promote Floor to a class."*

Final entity list:
- `Building`
- `Elevator`
- `Request` → `ExternalRequest`, `InternalRequest`
- `Dispatcher`
- `SchedulingStrategy` (abstract)
- `ElevatorState` → `Idle`, `MovingUp`, `MovingDown`, `DoorOpen`, `DoorClosed`
- `Direction` (enum)

---

## 5. Stage 4 — Modeling Requests (Internal vs External)

The two request types are conceptually different:

- **External:** "I'm on floor 5, I want to go up." Carries: source floor, desired direction.
- **Internal:** "I'm in elevator 2, take me to floor 8." Carries: destination floor.

How do we model them?

### Approach A — One Request class with flags

```python
class Request:
    def __init__(self, floor, request_type, direction=None):
        self.floor = floor
        self.request_type = request_type   # "external" or "internal"
        self.direction = direction          # only meaningful for external
```

**Pros:** One class.

**Cons:**
- Mixes concerns. `direction` is meaningful only for external — having a None field for internal is sloppy.
- Branches everywhere on `request_type`.
- Loses type safety.

### Approach B — Inheritance: ExternalRequest and InternalRequest

```python
class Request(ABC):
    @property
    @abstractmethod
    def floor(self) -> int: ...

class ExternalRequest(Request): ...
class InternalRequest(Request): ...
```

**Pros:**
- Each class carries exactly the fields it needs.
- Type-checking can distinguish them (`isinstance` check).
- Adding a new request type (e.g., `EmergencyRequest`) is a clean extension.

**Cons:** Two classes vs one.

### Decision

**Approach B** — inheritance.

The two types differ in what data they carry and how they're routed. Polymorphism here is justified: `ExternalRequest` goes through the dispatcher (which picks an elevator); `InternalRequest` goes directly to a specific elevator the rider is already inside. The shape of the data and the routing both differ — that's exactly when inheritance pays off.

In the interview:

> *"I'm modeling external and internal requests as separate subclasses of an abstract Request. They differ in fields (external has a direction, internal has destination only) and in routing (external goes through the dispatcher, internal goes directly to a specific elevator). A single class with flags would work but would push branching into the dispatcher; subclasses keep each type's data clean and let the dispatcher use isinstance to make routing decisions explicitly."*

### The Code

```python
from abc import ABC, abstractmethod
from enum import Enum


class Direction(Enum):
    """
    Direction of travel for an elevator.

    Why an Enum?
    - Type-safe: can't accidentally pass "uo" instead of "up".
    - Self-documenting in IDE autocomplete.

    The integer values (1, -1, 0) are deliberately chosen so that
    direction can be added to a floor number to compute the next floor:
    next_floor = current_floor + direction.value
    """
    UP = 1
    DOWN = -1
    IDLE = 0


class Request(ABC):
    """
    Abstract base for any kind of request that prompts elevator action.

    All requests have a target floor — that's the common contract.
    Beyond that, subclasses add type-specific data.

    Why abstract a `floor` property instead of a regular attribute?
    1. Each subclass might want its own internal name for the field
       (source_floor vs destination) but expose the same interface.
    2. Marking it abstract makes the contract explicit: every Request
       MUST tell us which floor it concerns.
    """

    @property
    @abstractmethod
    def floor(self) -> int:
        """The floor this request concerns."""
        ...


class ExternalRequest(Request):
    """
    A hall call: someone on a floor pressed an up/down button.

    Routing: external requests go through the Dispatcher because the
    requester doesn't care which elevator picks them up.
    """

    def __init__(self, source_floor: int, direction: Direction):
        # Validate at construction time. Invariants are easier to
        # enforce here than scattered through downstream code.
        if direction == Direction.IDLE:
            raise ValueError("External requests must specify UP or DOWN")
        self._floor = source_floor
        self.direction = direction

    @property
    def floor(self) -> int:
        return self._floor

    def __repr__(self):
        return f"ExternalRequest(floor={self._floor}, dir={self.direction.name})"


class InternalRequest(Request):
    """
    A car call: someone inside an elevator pressed a destination button.

    Routing: internal requests are submitted directly to the specific
    elevator the rider is in. They DO NOT go through the dispatcher.
    """

    def __init__(self, destination: int):
        self._floor = destination

    @property
    def floor(self) -> int:
        return self._floor

    def __repr__(self):
        return f"InternalRequest(dest={self._floor})"
```

A small but important detail: I validate `direction != IDLE` for `ExternalRequest` in the constructor. **An invalid request should be impossible to construct.** Validating at construction time prevents bad data from spreading — it fails immediately, with a clear message, at the original site.

---

## 6. Stage 5 — The State Pattern Decision

Now the central design decision. **How do we model elevator behavior over its lifecycle?**

The naive approach uses a state field with branching logic:

```python
class Elevator:
    def __init__(self):
        self.state = "idle"

    def step(self):
        if self.state == "idle":
            ...
        elif self.state == "moving_up":
            self.current_floor += 1
            if self.current_floor in self.stops:
                self.state = "door_open"
        elif self.state == "moving_down":
            ...
```

This works. For a simple system, it's perfectly readable.

But **here's what happens as the system grows**:

- Every method on Elevator gets the same `if state == ...` chain.
- Adding a new state (Maintenance, Emergency) requires touching every method.
- Logic for one state is interleaved with logic for all others — hard to read what "Idle behavior" actually is.
- Tests have to cover every state × every method combination.

Now consider the **State pattern**:

```python
class Elevator:
    def __init__(self):
        self.state = Idle()

    def step(self):
        self.state.step(self)
```

**Benefits:**
- Each state's behavior is in one place.
- Adding a new state = a new class, no existing code changes.
- Each state can be tested in isolation.
- Transitions are explicit (each state decides where to go next).

**Costs:**
- More classes (one per state).
- Slightly more indirection.

For our problem (5 states × multiple methods, growing requirements), **the State pattern is clearly worth it.**

### Verbalizing the Decision

> *"I'm using the State pattern. Each elevator state — Idle, MovingUp, MovingDown, DoorOpen, DoorClosed — gets its own class implementing a common ElevatorState interface. The alternative is a state-string-with-if-elif inside Elevator, which is fine for a sketch but quickly becomes unmaintainable as we add states or methods. Per-state classes give us cohesion (one state's logic in one place), open-closed extensibility (new states are new classes), and isolated testability."*

---

## 7. Stage 6 — Implementing the States

A key question: **what does the state interface look like?**

Looking at the operations we need:
- `step()` — advance one tick. The state decides what to do (move, open doors, etc.) and what state to transition to.

That's actually the *only* operation we strictly need. Other operations on Elevator (`accept_request`, etc.) don't need to be state-dependent in our scope — accepting a request is the same regardless of state.

We'll keep our state interface narrow (just `step`) and add more methods later only if needed. This respects ISP — narrow interfaces are easier to implement and reason about.

### State Lifecycle

How states flow:

```
              ┌────────┐
              │  Idle  │
              └───┬────┘
                  │ has request?
        up?  ┌────┴────┐  down?
             ▼         ▼
       ┌──────────┐ ┌────────────┐
       │ MovingUp │ │ MovingDown │
       └────┬─────┘ └──────┬─────┘
            │ at stop?     │ at stop?
            ▼              ▼
         ┌──────────────────┐
         │    DoorOpen       │
         └────────┬──────────┘
                  │ tick
                  ▼
         ┌──────────────────┐
         │   DoorClosed      │
         └────────┬──────────┘
                  │ more requests?
         yes ┌────┴────┐ no
             ▼         ▼
       (back to        (back to
        MovingUp/Down)   Idle)
```

Each state knows the rules for transitioning to the next.

### The Code

```python
class ElevatorState(ABC):
    """
    Abstract state for an elevator.

    Each concrete state encapsulates:
    - What the elevator does on a tick (one unit of simulated time).
    - When and to what state to transition.

    The state RECEIVES the elevator as an argument to step() rather than
    holding a reference to it. This keeps state objects stateless and
    therefore safely shareable across elevators (they're effectively
    flyweights). It also makes the dependency direction explicit:
    the elevator owns the state, the state mutates the elevator.
    """

    @abstractmethod
    def step(self, elevator: "Elevator") -> None:
        """
        Advance the elevator by one tick while in this state.
        May change the elevator's current_floor, may transition to
        another state via elevator.set_state(...).
        """
        ...

    @abstractmethod
    def name(self) -> str:
        """Human-readable state name, used for logging and display."""
        ...


class Idle(ElevatorState):
    """
    The elevator is sitting at a floor with no pending requests.

    On a tick:
    - If there's a pending request, decide direction and transition.
    - If we're already at a requested floor (rare edge case), open doors.
    - Otherwise, stay idle.
    """

    def step(self, elevator: "Elevator") -> None:
        if not elevator.has_pending_requests():
            # Nothing to do. Remain idle.
            return

        target = elevator.next_target()

        if target > elevator.current_floor:
            elevator.set_state(MovingUp())
        elif target < elevator.current_floor:
            elevator.set_state(MovingDown())
        else:
            # Already at the requested floor — open doors.
            elevator.set_state(DoorOpen())

    def name(self) -> str:
        return "IDLE"


class MovingUp(ElevatorState):
    """
    The elevator is moving up, one floor per tick.

    On a tick:
    - Increment current_floor.
    - If we've arrived at a requested stop, transition to DoorOpen.
    - Otherwise, keep moving (stay in MovingUp).

    Real elevators implement smarter behavior (LOOK algorithm:
    keep going up until no more upward stops, then reverse). We stick
    with simple nearest-stop tracking for now.
    """

    def step(self, elevator: "Elevator") -> None:
        elevator.current_floor += 1
        elevator.log(f"Moving UP → floor {elevator.current_floor}")

        if elevator.current_floor in elevator.stops:
            # Arrived at a requested stop. Open doors.
            elevator.set_state(DoorOpen())

    def name(self) -> str:
        return "MOVING_UP"


class MovingDown(ElevatorState):
    """Mirror of MovingUp, in the other direction."""

    def step(self, elevator: "Elevator") -> None:
        elevator.current_floor -= 1
        elevator.log(f"Moving DOWN → floor {elevator.current_floor}")

        if elevator.current_floor in elevator.stops:
            elevator.set_state(DoorOpen())

    def name(self) -> str:
        return "MOVING_DOWN"


class DoorOpen(ElevatorState):
    """
    Doors are open at a floor. Riders can board/disembark.

    On a tick:
    - Remove this floor from the pending stops (request fulfilled).
    - Transition to DoorClosed.

    We model door-open and door-closed as separate states (rather than
    one "stopped" state) because real elevators have these as physically
    distinct phases. Modeling them separately also gives us a clean place
    to add door-related behavior later (door obstruction sensors, etc.).
    """

    def step(self, elevator: "Elevator") -> None:
        elevator.log(f"Doors OPEN at floor {elevator.current_floor}")
        # Remove this stop from pending — we're servicing it now.
        # discard() (vs remove()) doesn't raise if the floor isn't in stops.
        elevator.stops.discard(elevator.current_floor)
        elevator.set_state(DoorClosed())

    def name(self) -> str:
        return "DOOR_OPEN"


class DoorClosed(ElevatorState):
    """
    Doors are closed. About to either resume motion or go idle.

    On a tick:
    - If more pending requests, decide direction and start moving.
    - If no more requests, return to Idle.

    Note: this state's logic mirrors Idle's. We could collapse them,
    but keeping them separate is more honest about the elevator's
    physical state and leaves room for state-specific behavior later
    (e.g., a brief delay after door closure before motion).
    """

    def step(self, elevator: "Elevator") -> None:
        elevator.log(f"Doors CLOSED at floor {elevator.current_floor}")

        if not elevator.has_pending_requests():
            elevator.set_state(Idle())
            return

        target = elevator.next_target()
        if target > elevator.current_floor:
            elevator.set_state(MovingUp())
        elif target < elevator.current_floor:
            elevator.set_state(MovingDown())
        else:
            # Another stop at the same floor — open doors again.
            elevator.set_state(DoorOpen())

    def name(self) -> str:
        return "DOOR_CLOSED"
```

A few important aspects:

**1. State objects hold no per-elevator data.** They receive the elevator as argument and mutate it. We *could* share state instances across elevators (flyweight-style). We don't bother, but it's a nice property.

**2. Each state is small (10-30 lines).** That's a sign we've cut the right joints. Each state does one thing.

**3. Explicit transitions.** Each state explicitly calls `elevator.set_state(NextState())`. The transition rules live with the behavior. There's no central "state transition table" elsewhere.

---

## 8. Stage 7 — The Elevator Class

Now the elevator itself. Its responsibilities:

- Track current floor.
- Hold pending stops (set of floor numbers).
- Hold its current state.
- Delegate `step()` to the current state.
- Accept new requests (add to stops).
- Provide query methods (`has_pending_requests`, `next_target`).

What it does NOT do:
- Decide *which* request to handle next from a global perspective (dispatcher's job).
- Compute pricing, manage occupancy.

### How does the elevator decide its `next_target`?

This is the only "scheduling" decision the elevator makes for itself. Several approaches:

**Approach A — Nearest stop:** pick the floor in `stops` closest to `current_floor`. Simple. Can lead to "thrashing" (going up, then down, then up).

**Approach B — Continue in current direction:** if moving up, pick lowest stop above current; if no stops above, pick highest below.

**Approach C — Full LOOK algorithm:** like B, but stops at every requested floor in current direction first, then reverses.

For interview scope, **A** is fine. We chose it earlier; let's stick with it. We can mention B and C as extensions.

### The Code

```python
from typing import Optional


class Elevator:
    """
    A single elevator car within a building.

    State machine: the elevator's behavior is governed by its current
    ElevatorState. Each tick, we delegate to state.step(self), which may
    move the elevator and/or transition to a new state.

    Pending stops are stored as a set (no duplicates, O(1) operations).
    The elevator chooses next_target() with a nearest-stop heuristic.

    Note: the Elevator does NOT decide WHICH external requests it should
    handle — that's the Dispatcher's job. The elevator just executes
    stops it's been given (whether from internal requests or assigned
    by the dispatcher).
    """

    def __init__(self, elevator_id: int, num_floors: int):
        self.id = elevator_id
        self.num_floors = num_floors
        # Current floor (we start everyone at ground = 0).
        self.current_floor = 0
        # Set of floors we need to visit. Set ensures no duplicates;
        # gives us O(1) add/remove/contains.
        self.stops: set[int] = set()
        # Current state. We start every elevator idle.
        self._state: ElevatorState = Idle()

    def set_state(self, state: ElevatorState) -> None:
        """
        Transition to a new state. Called by states themselves.
        Log the transition for visibility.
        """
        self.log(f"State {self._state.name()} → {state.name()}")
        self._state = state

    @property
    def state_name(self) -> str:
        """Read-only access to current state name (for display, tests)."""
        return self._state.name()

    @property
    def direction(self) -> Direction:
        """
        Current direction of motion, inferred from state.

        Used by the dispatcher's scheduling strategy to decide which
        elevator best serves a new request (e.g., favor elevators
        already moving toward the requester).

        Derived rather than stored: the state already implies it.
        Keeping a separate field would risk drift between state and
        direction (always one source of truth).
        """
        if isinstance(self._state, MovingUp):
            return Direction.UP
        if isinstance(self._state, MovingDown):
            return Direction.DOWN
        return Direction.IDLE

    def step(self) -> None:
        """Advance the simulation by one tick. Delegates to current state."""
        self._state.step(self)

    def accept(self, request: Request) -> None:
        """
        Add a request's target floor to our pending stops.

        Both internal and external requests result in the same action
        (add a stop). The DIFFERENCE between the two types is in HOW
        the request reached this elevator:
        - Internal: rider pressed a destination button while inside.
        - External: dispatcher assigned this elevator to a floor call.

        That difference is handled upstream (by the dispatcher);
        from the elevator's perspective, all requests are just stops.
        """
        if not 0 <= request.floor < self.num_floors:
            raise ValueError(
                f"Floor {request.floor} out of range "
                f"(building has floors 0 to {self.num_floors - 1})"
            )

        self.stops.add(request.floor)
        self.log(f"Accepted {request}; pending stops: {sorted(self.stops)}")

        # If we're idle, prod ourselves to start moving immediately
        # rather than waiting for the next external tick. This ensures
        # responsiveness: a request to an idle elevator gets processed
        # without an unnecessary one-tick delay.
        if isinstance(self._state, Idle):
            self._state.step(self)

    def has_pending_requests(self) -> bool:
        """True if there's at least one floor we still need to visit."""
        return bool(self.stops)

    def next_target(self) -> int:
        """
        Pick the next floor to head toward.

        Strategy: nearest stop. We could be smarter (LOOK algorithm:
        finish current direction first), but nearest-stop is easy
        to understand and acceptable for interview scope.

        Precondition: stops is non-empty. Caller must check
        has_pending_requests() first.
        """
        if not self.stops:
            raise ValueError("No pending stops to target")
        return min(self.stops, key=lambda f: abs(f - self.current_floor))

    def log(self, message: str) -> None:
        """
        Centralized logging. Keeps state-specific code from having to
        know about print formatting and lets us redirect logs (to file,
        in-memory list for tests, etc.) from one place.
        """
        print(f"[Elevator {self.id} @ floor {self.current_floor}] {message}")

    def __repr__(self):
        return (
            f"Elevator(id={self.id}, floor={self.current_floor}, "
            f"state={self.state_name}, stops={sorted(self.stops)})"
        )
```

A few things worth highlighting:

**1. `direction` is a derived property, not a field.** The state already implies the direction; storing direction separately would invite the bug "I set state but forgot to update direction." Always derive when you can.

**2. `accept()` proactively wakes up an idle elevator.** Without this, a request to an idle elevator would only start being processed on the next external `step()` call. That one-tick delay is acceptable in some designs, but I prefer immediacy.

**3. The elevator's logging is centralized.** States call `elevator.log(...)`, not `print(...)`. We can route logs anywhere from one place.

---

## 9. Stage 8 — The Dispatcher and Scheduling Strategy

The dispatcher's job: given an incoming request, decide which elevator handles it.

### Decision Point: What signature for the strategy?

The strategy needs to pick one elevator from a list, given the request. So:

```python
def select(self, request: Request, elevators: list[Elevator]) -> Optional[Elevator]: ...
```

Returns `Optional` because in some scenarios no elevator may be suitable (e.g., all out of service in extensions).

### Implementing Nearest Car

A reasonable scoring function:

- Idle elevators score by their distance to the request floor.
- Moving elevators score by distance, but penalized if their direction disagrees with the request.

Why? An elevator moving up and a downward request below it isn't a great match — it'd have to finish going up first. An idle nearby elevator is better.

Let's implement this cleanly.

### Why Strategy at all?

Because real elevator systems have evolved scheduling algorithms over decades. SCAN, LOOK, EDF (earliest deadline first), even ML-based dispatching exist. Hardcoding "nearest car" inside `Dispatcher` would lock us in. The Strategy pattern keeps it pluggable.

### The Code

```python
class SchedulingStrategy(ABC):
    """
    The contract for any algorithm that picks an elevator to handle
    an external request.

    Receives the request and the list of elevators; returns the chosen
    one, or None if none are suitable.

    By depending on this abstraction (not a concrete algorithm), the
    Dispatcher follows the Dependency Inversion Principle. New
    algorithms (round-robin, least-loaded, ML-based) plug in without
    changing the dispatcher.
    """

    @abstractmethod
    def select(
        self,
        request: Request,
        elevators: list[Elevator],
    ) -> Optional[Elevator]:
        """Pick the best elevator to handle the request, or None."""
        ...


class NearestCarStrategy(SchedulingStrategy):
    """
    Picks the elevator that can reach the request soonest.

    Scoring rule:
    - Distance from elevator's current floor to request floor.
    - Plus a penalty if the elevator is moving in the OPPOSITE direction
      from the request (it has to finish its current run first).

    This is a heuristic, not optimal. Real systems use much more
    sophisticated scheduling. But it's a sensible default for interview
    scope and demonstrates the right approach to extensibility.
    """

    # Penalty (in "virtual floors") added to score when direction
    # disagrees. Tuned to be larger than typical distances so direction
    # mismatch dominates the choice.
    DIRECTION_MISMATCH_PENALTY = 1000

    def select(self, request, elevators):
        if not elevators:
            return None

        return min(elevators, key=lambda e: self._score(e, request))

    def _score(self, elevator: Elevator, request: Request) -> int:
        """
        Lower score = better choice. Computes:
        distance + (penalty if direction disagrees)
        """
        distance = abs(elevator.current_floor - request.floor)

        # Idle elevators have no direction issues.
        if elevator.direction == Direction.IDLE:
            return distance

        # For moving elevators, check if they're heading toward the request.
        # If yes, no penalty. If they're heading away, big penalty.
        moving_toward_request = (
            (elevator.direction == Direction.UP and request.floor >= elevator.current_floor) or
            (elevator.direction == Direction.DOWN and request.floor <= elevator.current_floor)
        )

        if moving_toward_request:
            return distance
        return distance + self.DIRECTION_MISMATCH_PENALTY


class RoundRobinStrategy(SchedulingStrategy):
    """
    Cycles through elevators in order, ignoring distance entirely.

    Useful as a baseline / for showing the strategy interface really
    is pluggable. In practice it's a poor scheduler — but it's simple,
    fair (every elevator gets equal load over time), and predictable.
    """

    def __init__(self):
        self._next_index = 0

    def select(self, request, elevators):
        if not elevators:
            return None
        chosen = elevators[self._next_index % len(elevators)]
        self._next_index += 1
        return chosen
```

### The Dispatcher

The dispatcher is small. It accepts requests and routes them — using the strategy for external requests, sending internal requests directly.

```python
class Dispatcher:
    """
    Routes incoming requests to elevators.

    Two routing rules:
    - ExternalRequest: use the SchedulingStrategy to pick an elevator.
    - InternalRequest: route directly to a specific elevator
                       (the one the rider is in).

    The dispatcher itself doesn't decide HOW to pick an elevator —
    that's delegated to the strategy. This separation lets us swap
    scheduling algorithms freely.
    """

    def __init__(self, elevators: list[Elevator], strategy: SchedulingStrategy):
        self.elevators = elevators
        self.strategy = strategy

    def submit(
        self,
        request: Request,
        for_elevator: Optional[Elevator] = None,
    ) -> Optional[Elevator]:
        """
        Submit a request for handling.

        For internal requests, the caller MUST pass `for_elevator`
        (the elevator the rider is in). We could try to infer it, but
        it's cleaner to require it explicitly — the rider knows which
        elevator they're in.

        For external requests, we ignore `for_elevator` and use the
        strategy to pick.

        Returns the elevator that was assigned, or None if no elevator
        could handle the request (rare; means strategy returned None).
        """
        if isinstance(request, InternalRequest):
            if for_elevator is None:
                raise ValueError(
                    "Internal requests must specify for_elevator "
                    "(the elevator the rider is in)"
                )
            for_elevator.accept(request)
            return for_elevator

        # External request — let the strategy decide.
        chosen = self.strategy.select(request, self.elevators)
        if chosen is None:
            print(f"No elevator available for {request}")
            return None

        print(f"Dispatcher: routing {request} to Elevator {chosen.id}")
        chosen.accept(request)
        return chosen
```

Notice the `isinstance` check. Some style guides discourage `isinstance` — but here it's *exactly* the right tool. The dispatcher's whole job is routing based on type. We could use polymorphism instead (e.g., `request.route_via(dispatcher)`), but that would put dispatcher knowledge into the request classes — leaking abstractions in the wrong direction. `isinstance` is honest about what's happening.

---

## 10. Stage 9 — The Building (Top-Level Coordinator)

The `Building` is our top-level entity. Like `ParkingLot` in the previous deep-dive, it should be small — just hold the components and provide a `tick()` method to advance the simulation.

```python
class Building:
    """
    Top-level entity holding floors, elevators, and the dispatcher.

    Responsibility: coordinate the simulation. Each tick(), every
    elevator advances. New requests are submitted via the dispatcher.

    Notice we don't track floor objects (we use integer floor numbers).
    If we ever need per-floor entities (display boards, hall buttons),
    we'd add a Floor class here.
    """

    def __init__(
        self,
        num_floors: int,
        num_elevators: int,
        strategy: SchedulingStrategy,
    ):
        if num_floors < 2:
            raise ValueError("Building needs at least 2 floors")
        if num_elevators < 1:
            raise ValueError("Building needs at least 1 elevator")

        self.num_floors = num_floors
        # Build elevators with sequential IDs.
        self.elevators = [Elevator(i, num_floors) for i in range(num_elevators)]
        # The dispatcher orchestrates request routing using the strategy.
        self.dispatcher = Dispatcher(self.elevators, strategy)

    def tick(self) -> None:
        """
        Advance the simulation by one time unit.
        Every elevator gets one step.

        In a real (multi-threaded) system, each elevator would move
        on its own clock. For our discrete-time simulation, we drive
        them all together, which is simpler to reason about.
        """
        for elevator in self.elevators:
            elevator.step()

    def request(
        self,
        request: Request,
        for_elevator: Optional[Elevator] = None,
    ) -> Optional[Elevator]:
        """Convenience wrapper for submitting a request via the dispatcher."""
        return self.dispatcher.submit(request, for_elevator)
```

---

## 11. Stage 10 — Validating with a Mental Walkthrough

Let's run a realistic scenario.

**Scenario:** A 5-floor building with 2 elevators, both starting at floor 0. Someone on floor 3 presses "down." Then someone on floor 1 presses "up." Then the rider in the first-assigned elevator picks floor 0.

```python
building = Building(num_floors=5, num_elevators=2, strategy=NearestCarStrategy())
e0, e1 = building.elevators
```

Both elevators are at floor 0, idle. Direction = IDLE for both.

```python
building.request(ExternalRequest(3, Direction.DOWN))
```

Trace:
- Dispatcher receives ExternalRequest(3, DOWN).
- Strategy scores both elevators. Both at floor 0, both IDLE. Distance = 3 for both. Score tie.
- `min()` returns the first one (Python's stable order). e0 is chosen.
- e0.accept(request) → e0.stops = {3}. e0 is Idle, so we proactively step.
- Idle.step(e0): target = 3, > current 0 → transition to MovingUp.

```python
building.tick()   # tick 1
```

- e0 is MovingUp. `current_floor` becomes 1. Not in stops, stays MovingUp.
- e1 is Idle, no requests. Stays Idle.

```python
building.request(ExternalRequest(1, Direction.UP))
```

- Strategy scores both elevators for request to floor 1.
- e0: at floor 1, direction UP. Request to floor 1 in UP direction. Distance = 0, direction matches → score 0.
- e1: at floor 0, direction IDLE. Distance = 1. Score 1.
- e0 wins. But wait — e0 already had stops = {3}. Now stops = {1, 3}.
- e0 is in MovingUp; we don't "wake it up" (only Idle elevators get woken). It'll process the new stop on its next tick.

Hmm. Let's pause and think.

**Is this right?** e0 is at floor 1, just having arrived during the previous tick. Stops = {1, 3}. On its next step (still in MovingUp), it'll move to floor 2 — passing the new stop at floor 1!

**This is a bug.** When we accept a request whose floor we're currently *on*, we should open doors, not move past it. Let me trace more carefully.

Actually wait — let me re-trace. When e0 stepped to floor 1 in the previous tick, it checked `if self.current_floor in elevator.stops`. At that point, stops was {3}, so 1 wasn't in stops. It stayed MovingUp.

Now we add 1 to stops. But we've already stepped past the check. Next tick, the state is still MovingUp, and step() will increment to floor 2.

**Yes, this is a real bug.** It's a subtle one — the timing matters.

How to fix? When `accept()` is called and the new floor *equals current_floor* and we're between transitions, we should probably open doors. Let me think about what's cleanest.

**Option A — Special-case in accept():** if `request.floor == current_floor`, transition to DoorOpen. Adds a state-aware check to accept(), which we wanted to keep stateless.

**Option B — Always check at start of step():** before the state's normal logic, check if current_floor is in stops; if so, ensure we open doors. Pushes the check into a wrapper.

**Option C — Acceptable simplification:** acknowledge the bug in interview, note that real systems handle this with more nuanced state machines, and move on for time's sake.

For the interview, I'd implement A as a small fix and explain it:

```python
def accept(self, request: Request) -> None:
    ...
    self.stops.add(request.floor)

    # Edge case: if we're currently AT the requested floor and not
    # already in DoorOpen, jump to DoorOpen so we don't accidentally
    # pass our own stop. This handles the case where a new request
    # arrives for the floor we just reached but haven't yet "noticed"
    # because the in-stops check happens during MovingUp/MovingDown.
    if (request.floor == self.current_floor
        and not isinstance(self._state, (DoorOpen, DoorClosed))):
        self.set_state(DoorOpen())
        return

    # Otherwise, the existing wake-up-from-idle behavior:
    if isinstance(self._state, Idle):
        self._state.step(self)
```

This kind of bug-finding-and-fixing is *gold* in an interview. **It shows you actually trace through your design, not just write it.**

Let me continue the walkthrough with the fix in place.

```python
building.request(ExternalRequest(1, Direction.UP))
```

- e0 is at floor 1, in MovingUp. Request adds floor 1 to stops.
- Check: request.floor (1) == current_floor (1) and state isn't Door*. → Transition to DoorOpen.
- The next tick will open the door, then close.

```python
building.tick()   # tick 2
```

- e0 is in DoorOpen. step(): logs "Doors OPEN at floor 1", removes 1 from stops, transitions to DoorClosed.
- e1 still idle.

```python
building.tick()   # tick 3
```

- e0 is in DoorClosed. Has pending stops ({3}). Target = 3, > current 1. → MovingUp.
- e1 idle.

```python
building.tick()   # tick 4
```

- e0 in MovingUp. floor → 2. Not in stops. Continues MovingUp.

```python
building.tick()   # tick 5
```

- e0 in MovingUp. floor → 3. In stops! → DoorOpen.

Now the rider inside presses floor 0:

```python
building.request(InternalRequest(0), for_elevator=e0)
```

- Internal request. Routed directly to e0 (no strategy involved).
- e0.accept(InternalRequest(0)): adds 0 to stops. Not at current_floor (3 != 0). Not idle. So no wake-up needed.

```python
building.tick()   # tick 6
```

- e0 in DoorOpen. step(): logs, removes 3 from stops, transitions to DoorClosed.

```python
building.tick()   # tick 7
```

- e0 in DoorClosed. Has stops ({0}). Target 0, < current 3. → MovingDown.

```python
building.tick()   # tick 8, 9, 10
```

- floor → 2 → 1 → 0. At floor 0, in stops. → DoorOpen.

```python
building.tick()   # tick 11
```

- DoorOpen → removes 0 → DoorClosed.

```python
building.tick()   # tick 12
```

- DoorClosed → no stops → Idle.

✓ Full lifecycle works. The bug we found in tracing is fixed. Both internal and external requests are handled. The dispatcher used the strategy for external; bypassed it for internal.

### Edge cases worth mentioning

**Building with one elevator:** the strategy still works (only one to pick). Logic uniform.

**Request to a floor out of range:** `accept()` raises ValueError. Caller (dispatcher) doesn't catch — error propagates up. In production we'd want graceful handling at the API layer.

**Multiple requests for same floor:** stops is a set, so deduplicated automatically.

**Tied scores in strategy:** Python's `min` returns the first encountered — predictable but not always optimal. Could be improved with secondary keys (e.g., elevator with fewer pending stops as tiebreaker).

---

## 12. Stage 11 — Anticipating Follow-Up Questions

### Q: "What if requests come in while the simulation is in the middle of a tick?"

Currently, requests are atomic — they happen *between* ticks. In a multi-threaded system, requests might arrive concurrently with ticks. We'd need:

- Locking around `elevator.stops` modifications.
- Possibly a request queue that ticks drain at the start.

For interview, I'd say:

> *"Right now requests are processed synchronously between ticks. If we needed concurrency, I'd add a thread-safe request queue per elevator, and have step() drain it at the start of each tick. The state machine itself wouldn't need changes."*

### Q: "How would you implement LOOK scheduling?"

LOOK: keep going in current direction until no more stops in that direction; then reverse.

Change `next_target()` to be direction-aware:

```python
def next_target(self) -> int:
    if not self.stops:
        raise ValueError("No pending stops")

    if self.direction == Direction.UP:
        # Stops above us, then reverse if none.
        above = [s for s in self.stops if s > self.current_floor]
        if above:
            return min(above)   # Lowest above (closest going up)
        return max(self.stops)   # Reverse — highest below
    elif self.direction == Direction.DOWN:
        below = [s for s in self.stops if s < self.current_floor]
        if below:
            return max(below)
        return min(self.stops)
    else:
        # Idle: nearest is fine
        return min(self.stops, key=lambda f: abs(f - self.current_floor))
```

Note: this is just changing the strategy *for one elevator's choice of next stop*. The dispatcher's strategy is separate.

### Q: "How do you handle capacity?"

Add `capacity` to Elevator. In `accept()`, reject (or queue) when capacity reached:

```python
def __init__(self, ..., capacity: int = 10):
    self.capacity = capacity
    self.current_load = 0   # number of riders
```

When doors open, riders get on/off. We'd need to track per-stop how many board and how many leave. This complicates the model considerably and probably isn't worth doing in an interview unless asked.

### Q: "Maintenance or emergency state?"

Trivial with State pattern: add `Maintenance` and `Emergency` classes. Maintenance might refuse all requests; Emergency might go to ground floor and stay there. No existing state class changes — that's the OCP win.

```python
class Maintenance(ElevatorState):
    def step(self, elevator):
        # Do nothing. Maintenance mode is inert.
        pass
    def name(self): return "MAINTENANCE"
```

Then `elevator.set_state(Maintenance())` puts it out of service. The dispatcher could filter it out:

```python
class NearestCarStrategy(SchedulingStrategy):
    def select(self, request, elevators):
        # Filter out non-operational elevators.
        operational = [
            e for e in elevators
            if not isinstance(e._state, Maintenance)   # extension as needed
        ]
        if not operational: return None
        return min(operational, key=lambda e: self._score(e, request))
```

### Q: "How would you test this?"

Each piece is testable in isolation:

- **States:** call `state.step(mock_elevator)` and assert what changed. No real elevator needed.
- **Elevator:** test transitions by stepping and checking `state_name`.
- **Strategy:** call `strategy.select(request, [mock_elevators])` and assert the right one is chosen.
- **Dispatcher:** verify routing by submitting requests and checking which elevator received them.

The State pattern *especially* helps here — each state's logic is in one method, and you don't need to set up a complex elevator history to test "what does Idle do given a pending request?"

### Q: "What about display boards showing each elevator's floor?"

Same Observer pattern as the parking lot — `Elevator` becomes observable; `FloorIndicator` observes and renders. We'd add `attach()` / `_notify()` to Elevator and notify on floor changes.

I won't code it in detail; the pattern from the parking lot deep-dive transfers directly.

---

## 13. Final Reflection — What This Problem Teaches

### Lesson 1: When You See "Modes of Operation," Reach for State Pattern

The hallmark of a State-pattern problem: an entity has named operational modes that change over time, with different behavior per mode. Elevator, vending machine, order processing, document approval, traffic light, network connection — all classic examples.

Once you recognize the pattern, the design almost writes itself: identify the states, define the transition rules, write a class per state. The mechanical clarity of this approach is exactly what makes the State pattern beloved.

### Lesson 2: Distinguish the Two Routing Surfaces

External vs internal requests is the elevator-specific instance of a general principle: *not all requests are alike*. They may differ in source, in priority, in routing.

When you spot this kind of asymmetry early — in any LLD problem — model it explicitly with separate types. The cost is an extra class or two; the benefit is dispatch logic that's clear and extensible.

### Lesson 3: Walking Through Designs Catches Real Bugs

We found the "request for current floor while moving" bug only by tracing through the simulation step by step. **No amount of staring at code reveals all the timing bugs.** Always simulate.

The fact that we *found* the bug, *named* it, *fixed* it, and explained it — that sequence is exactly what interviewers are watching for. Real designers find bugs in their own designs. They don't pretend bugs don't exist.

### Lesson 4: Derive, Don't Duplicate

`Elevator.direction` is derived from `_state` — not stored as a separate field. This avoids one of the most common bug categories: state and derived data drifting apart.

In any design, ask: *"Is this attribute the source of truth, or can it be computed from something else?"* If derivable, derive.

### Lesson 5: Strategy Pattern Pays Off Multiple Times

We have *two* strategies in this design: scheduling (which elevator handles a request) and `next_target` (which floor the elevator picks next). Each is independently swappable. Each has multiple reasonable implementations. Each is in a single, isolated file you can replace without touching the rest.

This is the State + Strategy combination at its best: one pattern handles the entity's lifecycle; the other handles its decision-making algorithms.

---

**Onwards to the next problem: Library Management — where we'll explore policy-driven design, the Book vs BookItem distinction, and how reservations introduce queues.**
