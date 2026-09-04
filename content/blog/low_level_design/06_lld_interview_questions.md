# Low-Level Design Interview Questions — A Complete Walkthrough

> **Who this is for:** Anyone preparing for low-level design interviews — or anyone who wants to see the OOP, SOLID, and design-pattern concepts from the previous documents come together into real, working designs. We'll walk through six classic problems end-to-end.

---

## Table of Contents

1. [How to Approach Any LLD Interview Problem](#1-how-to-approach-any-lld-interview-problem)
2. [The Universal Framework](#2-the-universal-framework)
3. [Common Pitfalls in LLD Interviews](#3-common-pitfalls)
4. [Problem 1 — Design a Parking Lot](#4-problem-1--design-a-parking-lot)
5. [Problem 2 — Design an Elevator System](#5-problem-2--design-an-elevator-system)
6. [Problem 3 — Design a Library Management System](#6-problem-3--design-a-library-management-system)
7. [Problem 4 — Design a Vending Machine](#7-problem-4--design-a-vending-machine)
8. [Problem 5 — Design a Splitwise-Like Expense Sharing System](#8-problem-5--design-a-splitwise-like-expense-sharing-system)
9. [Problem 6 — Design a Ride-Hailing System (Uber-Lite)](#9-problem-6--design-a-ride-hailing-system)
10. [Meta-Patterns Across All Six Problems](#10-meta-patterns)
11. [Final Interview Tips](#11-final-interview-tips)

---

## 1. How to Approach Any LLD Interview Problem

The LLD interview isn't really about the specific problem — parking lot, elevator, chess, whatever. **It's about demonstrating a structured thinking process.** The interviewer watches *how* you decompose ambiguity, handle tradeoffs, and communicate design decisions.

Most candidates fail not because they can't code, but because they:

- Dive into writing classes before clarifying requirements.
- Design for imagined scope instead of actual scope.
- Can't explain *why* they chose a particular class structure.
- Miss the chance to apply SOLID principles or known patterns when they fit naturally.

We'll beat all of that by following a consistent framework for every problem.

### The Mental Model

An LLD interview is a conversation, not a monologue. Think of yourself as a **design consultant**: the interviewer is your client, they've given you vague requirements, and your job is to produce a clean, extensible design while thinking out loud.

You will be judged on:

1. **Clarity of thought** — Can you reduce ambiguity into specific decisions?
2. **Object identification** — Can you find the right classes (not too many, not too few)?
3. **Relationships** — Do your classes compose in ways that make sense (is-a vs has-a)?
4. **SOLID awareness** — Are you subtly baking in extensibility?
5. **Pattern fluency** — Do you reach for patterns when genuinely appropriate?
6. **Communication** — Can you explain your decisions and weigh tradeoffs?

Writing perfect code is *not* the primary criterion. Writing *thoughtful, defensible* design is.

---

## 2. The Universal Framework

Apply these six steps to *every* LLD problem. Internalize this; it's your skeleton for the whole interview.

### Step 1 — Clarify Requirements (5-10 min)

Never assume. Ask clarifying questions to define scope. Categorize them:

**Functional requirements** — what the system must do.
- What are the core actions the system supports?
- Who are the users/actors?
- What are the happy-path scenarios?
- What edge cases exist?

**Non-functional requirements** — qualities of the system.
- Scale? (How many users, items, events/sec?)
- Concurrency? (Single-threaded vs multi-threaded?)
- Persistence? (In-memory vs database?)
- Real-time constraints?

**Out of scope** — explicitly state what you won't design.
- Payment gateway internals? No.
- Frontend UI? No.
- Authentication? Probably no.

State these back to the interviewer: *"So I'll focus on X, Y, Z, and assume A, B are out of scope — does that work?"*

### Step 2 — Identify Core Entities (Nouns)

Read your requirements. Pull out the **nouns**. These are your candidate classes.

Parking Lot → Lot, Floor, Spot, Vehicle, Ticket, Payment, Gate, User.
Library → Book, Member, Loan, Librarian, Shelf, Reservation.

Not every noun becomes a class. Filter:

- **Distinct identity?** A "parking spot" has identity; a "free space" doesn't.
- **Distinct behavior or state?** If two "nouns" behave identically, collapse them.
- **Meaningful in the domain?** Words like "process," "system," "data" are usually not classes.

### Step 3 — Identify Actions (Verbs) and Actors

What are the use cases? For each use case, identify:

- **Actor** — who initiates it (Customer, Admin, System).
- **Action** — what happens (Park a car, Issue a book).
- **Collaborators** — which entities participate.

This shapes your methods. Actions like "park a car" become methods on `ParkingLot` or `ParkingSpot`. Methods follow the entities they logically belong to.

### Step 4 — Define Relationships

For each pair of related classes, ask:

- **Is-a** (inheritance)? `Car` is-a `Vehicle`.
- **Has-a** (composition)? `ParkingLot` has-a collection of `Floors`.
- **Uses-a** (dependency)? `PaymentProcessor` uses a `PricingStrategy`.

Prefer composition over inheritance — this avoids rigid hierarchies (remember the "Favor composition over inheritance" principle from the OOP doc).

Multiplicities matter:
- One-to-one: a `Ticket` belongs to one `Vehicle`.
- One-to-many: a `Floor` has many `Spots`.
- Many-to-many: `Members` can have many `Books`, `Books` can be read by many members over time.

### Step 5 — Apply SOLID and Patterns

Now, with the skeleton in place, look for opportunities:

- **Strategy** — is there an algorithm that might vary? (Pricing, discount, matching.)
- **State** — does an entity have a lifecycle with distinct behaviors? (Elevator, order, vehicle in lot.)
- **Observer** — is there a "when X changes, notify Y" relationship? (Display boards, notifications.)
- **Factory** — is object creation complex or variable? (Different vehicle types, different spot types.)
- **Singleton** — genuinely one-of-a-kind resource? (Pool manager, coordinator — but be wary of overuse.)
- **Chain of Responsibility** — escalation or ordered handling? (Approvals, matching priorities.)
- **Command** — actions that need to be queued, undone, or logged? (Bookings, transactions.)

You don't have to force patterns. If none apply, that's fine — simple code is often best.

Check SOLID:
- **SRP** — does each class have one reason to change?
- **OCP** — can I add a new variant without modifying existing classes?
- **LSP** — do subclasses honor their parent's contract?
- **ISP** — are interfaces small and focused?
- **DIP** — are high-level classes depending on abstractions?

### Step 6 — Write Code (The Design You've Designed)

Now, only now, write code. If you've done steps 1-5 well, this part is fast and clean. You're transcribing, not inventing.

Use:
- **Python** (or whatever language the interviewer prefers).
- Clear class and method names.
- Type hints (shows discipline).
- Docstrings for classes and non-obvious methods.
- `@dataclass` where appropriate to cut boilerplate.
- Abstract base classes (`abc`) for contracts.
- Short working examples showing the API in action.

**Resist the urge to implement everything.** Sketch the key classes; leave simple methods as skeletons. An interview is about *design*, not LeetCode.

### Step 7 — Discuss Extensions & Tradeoffs

Great candidates anticipate follow-ups. Proactively discuss:

- "What if we needed to add X?"
- "This design assumes single-threaded; here's how we'd handle concurrency."
- "We could swap this strategy for that one easily because of X."
- "If scale grew to 1M events/sec, this in-memory map wouldn't work — we'd need Y."

This shows design maturity. You're not just solving the problem; you're *owning* it.

---

## 3. Common Pitfalls

Avoid these recurring mistakes:

### Pitfall 1 — Jumping to Code Too Early

You hear "parking lot" and start writing `class ParkingLot:`. Don't. Spend 5-10 minutes clarifying first. Interviewers *expect* this — if you skip it, you're signaling poor process.

### Pitfall 2 — Over-Engineering

A parking lot for an interview doesn't need a Visitor pattern for pricing strategies combined with an Abstract Factory for spot types. **Match complexity to the problem.** Start simple; add sophistication only where justified.

### Pitfall 3 — Under-Engineering

The opposite: one giant `ParkingLot` class with 40 methods. No inheritance, no strategy for pricing, no separation of concerns. This fails every SOLID test and interviewers notice immediately.

### Pitfall 4 — Ignoring the Interviewer

The interviewer drops hints. "What if the parking lot had multiple floors?" isn't a casual question — they want you to account for it. **Listen actively** and adjust your design.

### Pitfall 5 — Silence

Think out loud. *"I'm considering making Vehicle abstract with Car/Bike/Truck subclasses — the alternative would be a single class with a type enum. I'll go with inheritance because the pricing and spot-size logic differs genuinely per type."* That narration is half the evaluation.

### Pitfall 6 — Not Validating the Design

After coding, run a mental walkthrough: *"A customer enters with a car. They grab a ticket. We find a free spot. They park. Later they pay and leave."* Catch any gaps live.

### Pitfall 7 — Forgetting Edge Cases

- What if the lot is full?
- What if a user loses their ticket?
- What if payment fails?
- What if the elevator is called on two floors at once?

Even if you don't implement every edge case, *mentioning* them shows maturity.

---

## 4. Problem 1 — Design a Parking Lot

> **The Prompt:** Design the object model for a multi-floor parking lot system.

This is perhaps the most-asked LLD question in existence. Let's walk through it by-the-book.

### Step 1 — Clarify Requirements

**Questions to ask:**

- Multiple floors? → Yes (assume 3-5 floors).
- Different vehicle types? → Yes: Bike, Car, Truck.
- Different spot sizes? → Yes: Small (bikes), Medium (cars), Large (trucks).
- Pricing model? → Hourly. First hour flat; subsequent hours variable.
- Entry/exit gates? → Multiple of each.
- Payments? → Assume cash + card, but payment gateway integration is out of scope.
- Display boards showing free spots? → Yes, per floor.
- Concurrency? → Assume single-threaded for simplicity; mention locking in extensions.
- Persistence? → In-memory.

**Scope summary:** *"I'll design a multi-floor lot with typed vehicles, typed spots, entry/exit flow, ticket issuance, hourly billing with pluggable pricing, and display boards that show real-time availability. Concurrency handling and database persistence are out of scope."*

### Step 2 — Identify Entities (Nouns)

From the requirements:

- `ParkingLot` — top-level entity.
- `Floor` — a level of the lot.
- `ParkingSpot` — a specific spot (sized: small/medium/large).
- `Vehicle` — abstract; `Bike`, `Car`, `Truck` are concrete.
- `Ticket` — issued on entry; used to compute billing.
- `EntryGate`, `ExitGate` — gates (likely just one class with a role).
- `Payment` — records payment for a ticket.
- `DisplayBoard` — shows availability per floor.
- `PricingStrategy` — pluggable billing algorithm.

Reject: "customer" (they're just an external actor), "system" (too vague), "data" (not a thing).

### Step 3 — Identify Actions

- **Park a vehicle**: actor = driver + entry gate; produces a ticket.
- **Exit**: actor = driver + exit gate; consumes ticket, computes bill, accepts payment, frees the spot.
- **View availability**: actor = display board consuming floor state.

### Step 4 — Relationships

- `ParkingLot` **has-many** `Floors` (composition).
- `Floor` **has-many** `ParkingSpots` (composition).
- `Vehicle` **is** the abstract parent; `Bike`/`Car`/`Truck` are concrete subclasses (is-a).
- `ParkingSpot` is associated with a `SpotSize` enum or subtypes.
- `Ticket` **references** one `Vehicle` and one `ParkingSpot`.
- `ExitGate` **uses** a `PricingStrategy` (dependency injection).
- `DisplayBoard` **observes** its `Floor` (Observer pattern).

### Step 5 — SOLID and Patterns

- **Strategy** — `PricingStrategy` is pluggable (hourly, flat-rate, weekend-special).
- **Observer** — `DisplayBoard` watches `Floor` changes. When a spot fills/empties, the board updates automatically.
- **Factory** (optional) — `VehicleFactory` could create vehicles from input, but we can skip this for simplicity.
- **Singleton** — `ParkingLot` is sometimes modeled as a singleton. We'll avoid this unless justified (prefer dependency injection).
- **SRP** — pricing lives in the strategy, not the gate; display logic in display board, not floor.
- **OCP** — new vehicle types, new spot types, new pricing models: add classes, don't modify.

### Step 6 — Code

```python
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
from typing import Optional
import uuid


# --- Enums ---
class VehicleType(Enum):
    BIKE = "bike"
    CAR = "car"
    TRUCK = "truck"

class SpotSize(Enum):
    SMALL = 1   # fits Bike
    MEDIUM = 2  # fits Bike, Car
    LARGE = 3   # fits Bike, Car, Truck


# --- Vehicle hierarchy (inheritance for type-specific behavior) ---
class Vehicle(ABC):
    def __init__(self, license_plate: str):
        self.license_plate = license_plate

    @property
    @abstractmethod
    def type(self) -> VehicleType: pass

    @property
    @abstractmethod
    def required_size(self) -> SpotSize: pass


class Bike(Vehicle):
    @property
    def type(self): return VehicleType.BIKE
    @property
    def required_size(self): return SpotSize.SMALL


class Car(Vehicle):
    @property
    def type(self): return VehicleType.CAR
    @property
    def required_size(self): return SpotSize.MEDIUM


class Truck(Vehicle):
    @property
    def type(self): return VehicleType.TRUCK
    @property
    def required_size(self): return SpotSize.LARGE


# --- Parking spot ---
class ParkingSpot:
    def __init__(self, spot_id: str, size: SpotSize):
        self.spot_id = spot_id
        self.size = size
        self.vehicle: Optional[Vehicle] = None

    @property
    def is_free(self) -> bool:
        return self.vehicle is None

    def can_fit(self, vehicle: Vehicle) -> bool:
        # A spot can fit a vehicle if it's at least as large as the vehicle needs
        return self.size.value >= vehicle.required_size.value

    def park(self, vehicle: Vehicle):
        if not self.is_free:
            raise ValueError(f"Spot {self.spot_id} is occupied")
        if not self.can_fit(vehicle):
            raise ValueError(f"Vehicle doesn't fit in spot {self.spot_id}")
        self.vehicle = vehicle

    def vacate(self):
        self.vehicle = None


# --- Observer pattern for display boards ---
class FloorObserver(ABC):
    @abstractmethod
    def update(self, floor): pass


class Floor:
    def __init__(self, floor_number: int, spots: list[ParkingSpot]):
        self.floor_number = floor_number
        self.spots = spots
        self._observers: list[FloorObserver] = []

    def attach(self, observer: FloorObserver):
        self._observers.append(observer)

    def _notify(self):
        for o in self._observers:
            o.update(self)

    def find_free_spot(self, vehicle: Vehicle) -> Optional[ParkingSpot]:
        # Best-fit: smallest spot that fits
        candidates = [s for s in self.spots if s.is_free and s.can_fit(vehicle)]
        return min(candidates, key=lambda s: s.size.value, default=None)

    def park(self, vehicle: Vehicle) -> Optional[ParkingSpot]:
        spot = self.find_free_spot(vehicle)
        if spot:
            spot.park(vehicle)
            self._notify()
        return spot

    def vacate(self, spot: ParkingSpot):
        spot.vacate()
        self._notify()

    def free_spots_by_size(self) -> dict[SpotSize, int]:
        result = {s: 0 for s in SpotSize}
        for spot in self.spots:
            if spot.is_free:
                result[spot.size] += 1
        return result


class DisplayBoard(FloorObserver):
    def update(self, floor: Floor):
        counts = floor.free_spots_by_size()
        print(f"[Floor {floor.floor_number}] Free — "
              f"Small: {counts[SpotSize.SMALL]}, "
              f"Medium: {counts[SpotSize.MEDIUM]}, "
              f"Large: {counts[SpotSize.LARGE]}")


# --- Ticket ---
class Ticket:
    def __init__(self, vehicle: Vehicle, spot: ParkingSpot, floor_number: int):
        self.id = str(uuid.uuid4())[:8]
        self.vehicle = vehicle
        self.spot = spot
        self.floor_number = floor_number
        self.entry_time = datetime.now()
        self.exit_time: Optional[datetime] = None
        self.amount: Optional[float] = None


# --- Strategy pattern for pricing ---
class PricingStrategy(ABC):
    @abstractmethod
    def calculate(self, ticket: Ticket) -> float: pass


class HourlyPricing(PricingStrategy):
    RATES = {
        VehicleType.BIKE: 10,
        VehicleType.CAR: 30,
        VehicleType.TRUCK: 60,
    }

    def calculate(self, ticket: Ticket) -> float:
        duration = ticket.exit_time - ticket.entry_time
        hours = max(1, duration.total_seconds() / 3600)   # min 1 hour
        return self.RATES[ticket.vehicle.type] * hours


class FlatRatePricing(PricingStrategy):
    RATES = {VehicleType.BIKE: 50, VehicleType.CAR: 150, VehicleType.TRUCK: 300}

    def calculate(self, ticket: Ticket) -> float:
        return self.RATES[ticket.vehicle.type]


# --- Gates ---
class EntryGate:
    def __init__(self, lot):
        self.lot = lot

    def admit(self, vehicle: Vehicle) -> Optional[Ticket]:
        return self.lot.park(vehicle)


class ExitGate:
    def __init__(self, lot, pricing: PricingStrategy):
        self.lot = lot
        self.pricing = pricing

    def process(self, ticket: Ticket) -> float:
        ticket.exit_time = datetime.now()
        ticket.amount = self.pricing.calculate(ticket)
        self.lot.vacate(ticket)
        return ticket.amount


# --- ParkingLot ---
class ParkingLot:
    def __init__(self, floors: list[Floor]):
        self.floors = floors
        self.active_tickets: dict[str, Ticket] = {}   # ticket_id -> Ticket

    def park(self, vehicle: Vehicle) -> Optional[Ticket]:
        for floor in self.floors:
            spot = floor.park(vehicle)
            if spot:
                ticket = Ticket(vehicle, spot, floor.floor_number)
                self.active_tickets[ticket.id] = ticket
                return ticket
        return None   # lot full

    def vacate(self, ticket: Ticket):
        floor = self.floors[ticket.floor_number]
        floor.vacate(ticket.spot)
        self.active_tickets.pop(ticket.id, None)


# --- Usage ---
def build_lot():
    floors = []
    for f in range(3):
        spots = (
            [ParkingSpot(f"F{f}-S{i}", SpotSize.SMALL) for i in range(5)]
            + [ParkingSpot(f"F{f}-M{i}", SpotSize.MEDIUM) for i in range(10)]
            + [ParkingSpot(f"F{f}-L{i}", SpotSize.LARGE) for i in range(3)]
        )
        floor = Floor(f, spots)
        floor.attach(DisplayBoard())
        floors.append(floor)
    return ParkingLot(floors)


lot = build_lot()
entry = EntryGate(lot)
exit_gate = ExitGate(lot, HourlyPricing())

t1 = entry.admit(Car("KA-01-1234"))
t2 = entry.admit(Bike("KA-01-5678"))
t3 = entry.admit(Truck("KA-01-9999"))

import time; time.sleep(0.1)
amount = exit_gate.process(t1)
print(f"\nCar paid: ₹{amount:.2f}")
```

### Step 7 — Extensions & Tradeoffs

**If the interviewer asks "What if we needed...":**

- **Reserved spots** (electric, handicapped, VIP): add a `reserved_for` field on `ParkingSpot` and filter accordingly during `find_free_spot`.
- **Concurrency** (multiple gates admitting at once): wrap spot acquisition in a lock per floor. Or use a concurrent reservation system.
- **Different pricing per day/time**: introduce a `TimeBasedPricingStrategy` that wraps hourly rates with multipliers.
- **Membership-based discounts**: introduce a `DiscountStrategy` applied on top of `PricingStrategy` (Decorator pattern).
- **Lost ticket**: define a special `LostTicketPricing` strategy (flat heavy fee).
- **Persistence**: extract a `ParkingRepository` interface (DIP); back it with in-memory or DB.
- **Multiple entry/exit gates**: gates are already independent; they all share the same `lot` reference. With concurrency, we'd need lot-level locking.

### Common Pitfalls in This Problem

- **Putting pricing logic inside `ExitGate` or `Ticket`** — violates SRP and OCP. Isolate it as a Strategy.
- **One `ParkingSpot` class handling all sizes via conditionals** — works, but rigid. Using a `SpotSize` enum + `can_fit()` is clean and extensible.
- **Making `ParkingLot` a Singleton** — often unnecessary. If you want "one global lot," pass it around via DI.
- **Ignoring display boards** — interviewers often ask; always have a story for "how does the user see availability?"
- **Forgetting the "full lot" case** — your `park()` must return something meaningful (None, or raise).

### Patterns Used

- **Strategy** — `PricingStrategy` (pluggable billing).
- **Observer** — `DisplayBoard` observes `Floor` changes.
- **Template Method** (subtle) — `Vehicle` sets up the skeleton; subclasses fill in `type` and `required_size`.

### SOLID Checks

- **SRP** ✓ — Vehicle knows vehicle stuff; Spot knows spot stuff; Pricing knows pricing; DisplayBoard knows display; Gate knows entry/exit flow.
- **OCP** ✓ — Add a new vehicle type, new spot size, new pricing strategy, new display type — all without modifying existing code.
- **LSP** ✓ — All `Vehicle` subclasses honor the same contract.
- **ISP** ✓ — Interfaces (`PricingStrategy`, `FloorObserver`) are narrow.
- **DIP** ✓ — `ExitGate` depends on `PricingStrategy` (abstraction), not a concrete pricer.

---

## 5. Problem 2 — Design an Elevator System

> **The Prompt:** Design a multi-elevator system for a building with N floors.

Elevators are trickier than parking lots because of **state transitions** and **request scheduling**. This is a great problem to showcase the State pattern.

### Step 1 — Clarify Requirements

**Questions to ask:**

- How many elevators and floors? → M elevators, N floors (configurable).
- Two types of requests: external (press button on a floor, want to go up/down) and internal (inside elevator, pick destination). Support both? → Yes.
- Elevator directions? → Moves up, down, or idle.
- Door opens/closes? → Yes, as part of the state.
- Multiple elevators — how are requests assigned? → Need a scheduler/dispatcher.
- Scheduling algorithm? → Nearest-idle-elevator for this interview, but make it pluggable.
- Capacity limits? → Optional; mention as an extension.
- Emergency stop? → Out of scope for core design; mention as extension.
- Real-time / concurrency? → Simplify: one request at a time, single-threaded.

**Scope summary:** *"I'll design N floors, M elevators, each elevator having states (idle, moving up/down, doors opening/closing), external and internal request types, and a pluggable dispatcher that selects which elevator handles a request. Concurrency, capacity, and emergency modes are extensions."*

### Step 2 — Identify Entities

- `Building` — holds floors and elevators.
- `Floor` — represents a level; has up/down external buttons.
- `Elevator` — the car itself.
- `ElevatorState` — Idle, MovingUp, MovingDown, DoorOpen, DoorClosed.
- `Request` — abstract; `ExternalRequest` (from floor) and `InternalRequest` (from inside).
- `Direction` — enum (UP, DOWN, IDLE).
- `Dispatcher` — assigns requests to elevators.
- `SchedulingStrategy` — pluggable algorithm for selection.

### Step 3 — Identify Actions

- User presses floor button (external request): dispatcher picks an elevator, routes the request.
- User inside elevator presses floor number (internal request): added to that elevator's queue.
- Elevator moves between floors, opens doors, closes doors, continues or idles.
- Display shows current floor per elevator.

### Step 4 — Relationships

- `Building` **has-many** `Floors` and **has-many** `Elevators`.
- `Elevator` **has-one** `ElevatorState` (changes over time).
- `Elevator` **maintains** a set of target floors (pending stops).
- `Dispatcher` **uses-a** `SchedulingStrategy` (DIP).
- `Request` → `ExternalRequest` and `InternalRequest` (inheritance).

### Step 5 — SOLID and Patterns

- **State** — `ElevatorState` hierarchy models the elevator's lifecycle cleanly. `Idle`, `MovingUp`, `MovingDown`, `DoorOpen` each encapsulate their behavior and transitions.
- **Strategy** — `SchedulingStrategy` lets us swap algorithms (nearest, round-robin, least-busy).
- **Command** (subtle) — `Request` objects carry the action to perform.
- **Observer** (optional) — floor displays could observe elevator position.
- **DIP** — `Dispatcher` depends on `SchedulingStrategy` abstraction.
- **OCP** — new scheduling strategies or states can be added cleanly.

### Step 6 — Code

```python
from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional
import heapq


class Direction(Enum):
    UP = 1
    DOWN = -1
    IDLE = 0


# --- Request types ---
class Request(ABC):
    @property
    @abstractmethod
    def floor(self) -> int: pass


class ExternalRequest(Request):
    def __init__(self, source_floor: int, direction: Direction):
        self._floor = source_floor
        self.direction = direction
    @property
    def floor(self): return self._floor
    def __repr__(self):
        return f"ExternalRequest(floor={self._floor}, dir={self.direction.name})"


class InternalRequest(Request):
    def __init__(self, destination: int):
        self._floor = destination
    @property
    def floor(self): return self._floor
    def __repr__(self):
        return f"InternalRequest(dest={self._floor})"


# --- State pattern for elevator ---
class ElevatorState(ABC):
    @abstractmethod
    def step(self, elevator): pass
    @abstractmethod
    def name(self) -> str: pass


class Idle(ElevatorState):
    def step(self, elevator):
        if elevator.has_pending_requests():
            target = elevator.next_target()
            if target > elevator.current_floor:
                elevator.set_state(MovingUp())
            elif target < elevator.current_floor:
                elevator.set_state(MovingDown())
            else:
                elevator.set_state(DoorOpen())
    def name(self): return "IDLE"


class MovingUp(ElevatorState):
    def step(self, elevator):
        elevator.current_floor += 1
        print(f"[Elevator {elevator.id}] Moving UP → floor {elevator.current_floor}")
        if elevator.current_floor in elevator.stops:
            elevator.set_state(DoorOpen())
    def name(self): return "MOVING_UP"


class MovingDown(ElevatorState):
    def step(self, elevator):
        elevator.current_floor -= 1
        print(f"[Elevator {elevator.id}] Moving DOWN → floor {elevator.current_floor}")
        if elevator.current_floor in elevator.stops:
            elevator.set_state(DoorOpen())
    def name(self): return "MOVING_DOWN"


class DoorOpen(ElevatorState):
    def step(self, elevator):
        print(f"[Elevator {elevator.id}] Doors open at floor {elevator.current_floor}")
        elevator.stops.discard(elevator.current_floor)
        elevator.set_state(DoorClosed())
    def name(self): return "DOOR_OPEN"


class DoorClosed(ElevatorState):
    def step(self, elevator):
        print(f"[Elevator {elevator.id}] Doors closed")
        if elevator.has_pending_requests():
            target = elevator.next_target()
            if target > elevator.current_floor:
                elevator.set_state(MovingUp())
            elif target < elevator.current_floor:
                elevator.set_state(MovingDown())
            else:
                elevator.set_state(DoorOpen())
        else:
            elevator.set_state(Idle())
    def name(self): return "DOOR_CLOSED"


# --- Elevator ---
class Elevator:
    def __init__(self, id: int, num_floors: int):
        self.id = id
        self.num_floors = num_floors
        self.current_floor = 0
        self.stops: set[int] = set()
        self._state: ElevatorState = Idle()

    def set_state(self, state: ElevatorState):
        self._state = state

    @property
    def state_name(self): return self._state.name()

    def step(self):
        self._state.step(self)

    def accept(self, request: Request):
        self.stops.add(request.floor)
        if isinstance(self._state, Idle):
            self._state.step(self)   # Wake it up

    def has_pending_requests(self):
        return bool(self.stops)

    def next_target(self) -> int:
        # Simple: go to nearest stop
        return min(self.stops, key=lambda f: abs(f - self.current_floor))

    @property
    def direction(self) -> Direction:
        if isinstance(self._state, MovingUp): return Direction.UP
        if isinstance(self._state, MovingDown): return Direction.DOWN
        return Direction.IDLE


# --- Strategy for dispatching ---
class SchedulingStrategy(ABC):
    @abstractmethod
    def select(self, elevators: list[Elevator], request: Request) -> Elevator: pass


class NearestCarStrategy(SchedulingStrategy):
    def select(self, elevators, request):
        # Idle elevators are best; else pick the one whose current trajectory matches
        def score(e: Elevator):
            distance = abs(e.current_floor - request.floor)
            # Prefer idle (bonus of 0); penalize if direction disagrees
            if e.direction == Direction.IDLE:
                return distance
            # Same direction as request is better
            moving_toward = (
                (e.direction == Direction.UP and request.floor >= e.current_floor) or
                (e.direction == Direction.DOWN and request.floor <= e.current_floor)
            )
            return distance + (0 if moving_toward else 100)
        return min(elevators, key=score)


class RoundRobinStrategy(SchedulingStrategy):
    def __init__(self):
        self._index = 0
    def select(self, elevators, request):
        chosen = elevators[self._index % len(elevators)]
        self._index += 1
        return chosen


# --- Dispatcher ---
class Dispatcher:
    def __init__(self, elevators: list[Elevator], strategy: SchedulingStrategy):
        self.elevators = elevators
        self.strategy = strategy

    def submit(self, request: Request, for_elevator: Optional[Elevator] = None):
        if isinstance(request, InternalRequest) and for_elevator:
            for_elevator.accept(request)
        else:
            chosen = self.strategy.select(self.elevators, request)
            print(f">>> Routing {request} to Elevator {chosen.id}")
            chosen.accept(request)


# --- Simulation tick ---
class Building:
    def __init__(self, num_floors: int, num_elevators: int,
                 strategy: SchedulingStrategy):
        self.num_floors = num_floors
        self.elevators = [Elevator(i, num_floors) for i in range(num_elevators)]
        self.dispatcher = Dispatcher(self.elevators, strategy)

    def tick(self):
        """One time unit — every elevator advances its state."""
        for e in self.elevators:
            e.step()


# --- Usage ---
building = Building(num_floors=10, num_elevators=2, strategy=NearestCarStrategy())

# Simulate some requests
building.dispatcher.submit(ExternalRequest(5, Direction.UP))
for _ in range(12):
    building.tick()
    # After elevator reaches floor 5, rider presses "floor 8"
    if building.elevators[0].current_floor == 5 and 8 not in building.elevators[0].stops:
        building.dispatcher.submit(InternalRequest(8), for_elevator=building.elevators[0])
```

### Step 7 — Extensions & Tradeoffs

- **Scheduling algorithm sophistication** — real elevator algorithms (SCAN, LOOK, SSTF) can replace `NearestCarStrategy` as new strategies. OCP wins.
- **Capacity limit** — add `max_weight` or `max_persons`; reject internal requests that would overflow.
- **Concurrency** — in reality, requests come from multiple floors concurrently. Wrap dispatcher state with a lock, or use a queue processed by a single worker.
- **Emergency stop / maintenance mode** — add `EmergencyStopped`, `UnderMaintenance` states.
- **Floor displays** — `Floor` could observe each elevator's position via the Observer pattern.
- **Predictive dispatching** — assign elevators based on historical traffic patterns (ML-heavy; out of interview scope but worth mentioning).

### Common Pitfalls

- **Representing states as strings/enums** — works but pushes all behavior into `if/elif`. The State pattern is cleaner here and is exactly the kind of thing interviewers love to see.
- **Coupling dispatcher to nearest-car logic** — hard-wiring the algorithm. Use Strategy so alternatives swap in.
- **One massive `Elevator.move()` method with nested conditionals** — fragile and untestable. State objects fix this.
- **Forgetting external vs internal requests have different routing rules** — internal requests go to *the specific elevator*; external go through the dispatcher.

### Patterns Used

- **State** — elevator states (Idle, MovingUp, MovingDown, DoorOpen, DoorClosed).
- **Strategy** — `SchedulingStrategy` for dispatching.
- **Command** (subtle) — `Request` objects encapsulate actions.

### SOLID Checks

- **SRP** ✓ — State transitions in state classes, dispatching in dispatcher, scheduling in strategy.
- **OCP** ✓ — Add a new State (emergency), new Strategy (SCAN algorithm) — no existing code changes.
- **LSP** ✓ — All states substitute for `ElevatorState` properly.
- **ISP** ✓ — Interfaces are narrow (`SchedulingStrategy.select`, `ElevatorState.step`).
- **DIP** ✓ — Dispatcher depends on abstract `SchedulingStrategy`.

---

## 6. Problem 3 — Design a Library Management System

> **The Prompt:** Design a library system that supports members borrowing books, returning, and reserving.

Library systems showcase relationships (members ↔ books), lifecycle (book states), and policy (borrowing rules).

### Step 1 — Clarify Requirements

**Questions to ask:**

- Book copies? → Yes; multiple physical copies per title.
- Member types? → Student, Faculty, Guest — different borrowing limits and durations.
- Reservations? → A member can reserve a currently-borrowed book; first in queue gets it when returned.
- Fines for late returns? → Yes; per day after due date.
- Search capabilities? → By title, author, category — basic in-memory search.
- Multiple branches/libraries? → Single library for core design; extension for multi-branch.
- Concurrency? → Single-threaded for simplicity.
- Payment? → Out of scope; just track fine amounts.

**Scope summary:** *"I'll design a library with book titles and copies, member types with different policies, a borrowing flow with due dates and fines, a reservation queue, and search. Multi-branch, payment processing, and concurrency are extensions."*

### Step 2 — Identify Entities

- `Library` — the system root.
- `BookItem` (a physical copy) vs `Book` (the title).
- `Member` — abstract; `Student`, `Faculty`, `Guest` subclasses.
- `Loan` — represents a borrowing record.
- `Reservation` — a waiting request for a book.
- `MembershipPolicy` — limits + durations + fine rates per member type.
- `Librarian` — actor who performs administrative actions.
- `Search` — a component for querying books.

**Key distinction**: `Book` is the abstract title (*1984* by Orwell); `BookItem` is a specific copy (ISBN + physical copy ID). Many interviewers look for this distinction.

### Step 3 — Identify Actions

- Member **borrows** a book copy → creates a Loan.
- Member **returns** a book → closes the Loan, potentially assesses fine, triggers next reservation.
- Member **reserves** a book → adds to reservation queue.
- Librarian **adds/removes** books.
- System **searches** by title/author/category.

### Step 4 — Relationships

- `Book` **has-many** `BookItem` (copies).
- `BookItem` has a status: AVAILABLE, BORROWED, RESERVED.
- `Member` **has-many** `Loans`.
- `Member` is linked to a `MembershipPolicy` (Strategy-like).
- `Reservation` links a `Member` to a `Book`.
- `Library` **has-many** `Books`, `Members`, `Loans`, `Reservations`.

### Step 5 — SOLID and Patterns

- **Strategy** — `MembershipPolicy` (varies per member type: borrowing limits, loan durations, fine rates).
- **Observer** (optional) — reservations notify members when their book becomes available.
- **State** (optional) — `BookItem.status` could use State pattern, but since logic is simple, an enum + checks is adequate. *This is a judgment call — interviewers appreciate hearing "I could use State here but it's overkill for this flow."*
- **Factory** — `MemberFactory` could produce the right member type + policy.
- **SRP** — policy logic separated from member; search separated from library core.

### Step 6 — Code

```python
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime, timedelta
from typing import Optional
from collections import deque
import uuid


# --- Enums ---
class BookStatus(Enum):
    AVAILABLE = "available"
    BORROWED = "borrowed"
    LOST = "lost"


# --- Domain entities ---
class Book:
    """The title (abstract book)."""
    def __init__(self, isbn: str, title: str, author: str, category: str):
        self.isbn = isbn
        self.title = title
        self.author = author
        self.category = category
        self.copies: list[BookItem] = []

    def add_copy(self, copy: "BookItem"):
        self.copies.append(copy)

    def available_copy(self) -> Optional["BookItem"]:
        return next((c for c in self.copies if c.status == BookStatus.AVAILABLE), None)


class BookItem:
    """A physical copy of a book."""
    def __init__(self, book: Book, copy_id: str):
        self.book = book
        self.copy_id = copy_id
        self.status = BookStatus.AVAILABLE


# --- Strategy for membership policy ---
class MembershipPolicy(ABC):
    @property
    @abstractmethod
    def max_books(self) -> int: pass
    @property
    @abstractmethod
    def loan_days(self) -> int: pass
    @property
    @abstractmethod
    def fine_per_day(self) -> float: pass


class StudentPolicy(MembershipPolicy):
    @property
    def max_books(self): return 3
    @property
    def loan_days(self): return 14
    @property
    def fine_per_day(self): return 5.0


class FacultyPolicy(MembershipPolicy):
    @property
    def max_books(self): return 10
    @property
    def loan_days(self): return 30
    @property
    def fine_per_day(self): return 2.0


class GuestPolicy(MembershipPolicy):
    @property
    def max_books(self): return 1
    @property
    def loan_days(self): return 7
    @property
    def fine_per_day(self): return 10.0


# --- Member ---
class Member:
    def __init__(self, member_id: str, name: str, policy: MembershipPolicy):
        self.member_id = member_id
        self.name = name
        self.policy = policy
        self.active_loans: list[Loan] = []

    def can_borrow_more(self) -> bool:
        return len(self.active_loans) < self.policy.max_books


# --- Loan ---
class Loan:
    def __init__(self, member: Member, book_item: BookItem):
        self.id = str(uuid.uuid4())[:8]
        self.member = member
        self.book_item = book_item
        self.issue_date = datetime.now()
        self.due_date = self.issue_date + timedelta(days=member.policy.loan_days)
        self.return_date: Optional[datetime] = None

    @property
    def is_overdue(self) -> bool:
        return datetime.now() > self.due_date and self.return_date is None

    def calculate_fine(self) -> float:
        end_date = self.return_date or datetime.now()
        if end_date <= self.due_date:
            return 0.0
        overdue_days = (end_date - self.due_date).days + 1
        return overdue_days * self.member.policy.fine_per_day


# --- Reservation ---
class Reservation:
    def __init__(self, member: Member, book: Book):
        self.member = member
        self.book = book
        self.reserved_on = datetime.now()


# --- Search ---
class BookSearch:
    def __init__(self, books: list[Book]):
        self.books = books

    def by_title(self, title: str) -> list[Book]:
        return [b for b in self.books if title.lower() in b.title.lower()]

    def by_author(self, author: str) -> list[Book]:
        return [b for b in self.books if author.lower() in b.author.lower()]

    def by_category(self, category: str) -> list[Book]:
        return [b for b in self.books if b.category.lower() == category.lower()]


# --- Library (the facade/coordinator) ---
class Library:
    def __init__(self):
        self.books: dict[str, Book] = {}           # isbn -> Book
        self.members: dict[str, Member] = {}
        self.active_loans: dict[str, Loan] = {}    # loan_id -> Loan
        self.reservations: dict[str, deque[Reservation]] = {}  # isbn -> queue

    # Book management
    def add_book(self, book: Book):
        self.books[book.isbn] = book

    def add_member(self, member: Member):
        self.members[member.member_id] = member

    @property
    def search(self) -> BookSearch:
        return BookSearch(list(self.books.values()))

    # Core flow
    def borrow(self, member_id: str, isbn: str) -> Optional[Loan]:
        member = self.members[member_id]
        book = self.books[isbn]

        if not member.can_borrow_more():
            print(f"{member.name} has reached borrowing limit.")
            return None

        copy = book.available_copy()
        if not copy:
            print(f"No copies available for '{book.title}'. Consider reserving.")
            return None

        copy.status = BookStatus.BORROWED
        loan = Loan(member, copy)
        member.active_loans.append(loan)
        self.active_loans[loan.id] = loan
        print(f"Issued '{book.title}' to {member.name}. Due: {loan.due_date.date()}")
        return loan

    def return_book(self, loan_id: str) -> float:
        loan = self.active_loans.pop(loan_id)
        loan.return_date = datetime.now()
        fine = loan.calculate_fine()
        loan.book_item.status = BookStatus.AVAILABLE
        loan.member.active_loans.remove(loan)
        print(f"Returned '{loan.book_item.book.title}'. Fine: ₹{fine:.2f}")

        # Check reservation queue
        isbn = loan.book_item.book.isbn
        queue = self.reservations.get(isbn)
        if queue:
            next_reservation = queue.popleft()
            print(f"  Notifying {next_reservation.member.name}: "
                  f"'{loan.book_item.book.title}' is now available for you.")
        return fine

    def reserve(self, member_id: str, isbn: str):
        member = self.members[member_id]
        book = self.books[isbn]
        if book.available_copy():
            print(f"Book '{book.title}' is available — just borrow it.")
            return
        self.reservations.setdefault(isbn, deque()).append(Reservation(member, book))
        print(f"{member.name} reserved '{book.title}'.")


# --- Usage ---
library = Library()

# Add books
b1 = Book("978-001", "The Pragmatic Programmer", "Hunt & Thomas", "Tech")
b1.add_copy(BookItem(b1, "c1"))
b1.add_copy(BookItem(b1, "c2"))
library.add_book(b1)

# Add members
amit = Member("M1", "Amit", StudentPolicy())
priya = Member("M2", "Priya", FacultyPolicy())
library.add_member(amit)
library.add_member(priya)

# Flow
loan1 = library.borrow("M1", "978-001")
loan2 = library.borrow("M2", "978-001")
loan3 = library.borrow("M1", "978-001")   # No copies — should reserve
library.reserve("M1", "978-001")

library.return_book(loan1.id)   # Should notify Amit
```

### Step 7 — Extensions & Tradeoffs

- **Multiple branches** — introduce a `Branch` class; `Library` becomes a network of branches. Books can be transferred between branches.
- **Digital books / e-books** — abstract `BorrowableItem`; `BookItem` and `EbookLicense` become subtypes.
- **Notifications** — Observer pattern: when a reservation becomes available, notify the member via email/SMS.
- **Fine payment flow** — add a `Payment` component; extend `return_book` to accept payment.
- **Membership upgrade** — Policy is already a strategy — just swap the `policy` attribute.
- **Popularity tracking** — add a `BorrowingHistory` per book; use for recommendations (out of scope but a great mention).

### Common Pitfalls

- **Not distinguishing `Book` (title) from `BookItem` (copy)** — very common mistake; leads to modeling headaches when the library has 10 copies of the same book.
- **Stuffing all policy logic inside `Member`** — violates SRP and makes it hard to add new member types.
- **Ignoring the reservation queue** — interviewers ask about this often.
- **Fines computed in `Library`** — should be on `Loan` (it has the data) or a dedicated `FineCalculator` if logic grows complex.

### Patterns Used

- **Strategy** — `MembershipPolicy` (student/faculty/guest).
- **Facade** — `Library` provides a simple interface over the internal moving parts.
- **Repository-like pattern** (implicitly) — `self.books`, `self.members` are in-memory repositories.

### SOLID Checks

- **SRP** ✓ — Policies, loans, searches, reservations, and library administration are separate.
- **OCP** ✓ — New member types (Premium, Alumni) = new policy classes, no modification.
- **LSP** ✓ — All `MembershipPolicy` variants are substitutable.
- **ISP** ✓ — `MembershipPolicy` has a focused interface.
- **DIP** ✓ — `Member` depends on `MembershipPolicy` abstraction, not a concrete policy.

---

## 7. Problem 4 — Design a Vending Machine

> **The Prompt:** Design a vending machine that sells items, accepts coins/notes, returns change, and handles inventory.

Vending machines are the canonical **State pattern** interview problem. A clean design here immediately shouts "this candidate knows the State pattern."

### Step 1 — Clarify Requirements

**Questions to ask:**

- Items have a fixed set of prices and quantities? → Yes; inventory is pre-loaded.
- Accepted denominations? → Indian coins + notes: ₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100.
- Exact change required? → No; machine gives change if possible. If not enough change, reject or notify.
- Cancel button (refund without purchase)? → Yes.
- Restocking? → Yes; administrator interface.
- Concurrency? → Assume one user at a time.

**Scope summary:** *"I'll design a vending machine with product inventory, multi-denomination payment, a clear state lifecycle (idle → has money → dispensing), change-giving, cancel/refund, and restock. Concurrency and payment gateways are extensions."*

### Step 2 — Identify Entities

- `VendingMachine` — the overall system.
- `Product` — an item sold (name, price, code).
- `Inventory` — tracks product stock and coin/note availability.
- `VendingMachineState` — Idle, HasMoney, Dispensing, OutOfStock (State pattern).
- `Coin` / `Note` — denominations.
- `PaymentProcessor` — handles coin/note insertion and change calculation.
- `Administrator` — restocks and collects money.

### Step 3 — Identify Actions

- **Insert coin/note** → adds to current balance; transitions Idle → HasMoney.
- **Select product** → checks stock and balance; dispenses + returns change; transitions HasMoney → Dispensing → Idle.
- **Cancel** → refund the balance; transitions back to Idle.
- **Restock** (admin) → add items / denominations.

### Step 4 — Relationships

- `VendingMachine` **has-a** `Inventory`, **has-a** current `VendingMachineState`, **has-a** current `balance`.
- `State` classes know how to transition the machine.
- `Inventory` **has-many** product slots + denomination counts.

### Step 5 — SOLID and Patterns

- **State** — the heart of the design. Behavior changes drastically based on current state.
- **Strategy** (optional) — `ChangeStrategy` for computing change (greedy vs exact-only).
- **Command** (optional) — represent actions as commands for logging/undo. Often overkill for this problem.
- **SRP** — inventory management separate from state management, payment separate from dispensing.

### Step 6 — Code

```python
from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional


# --- Product ---
class Product:
    def __init__(self, code: str, name: str, price: int):
        self.code = code
        self.name = name
        self.price = price   # in rupees (integer for simplicity)


# --- Inventory ---
class Inventory:
    def __init__(self):
        self.products: dict[str, tuple[Product, int]] = {}   # code -> (product, qty)
        self.coins: dict[int, int] = {1: 0, 2: 0, 5: 0, 10: 0, 20: 0, 50: 0, 100: 0}

    def add_product(self, product: Product, qty: int):
        if product.code in self.products:
            p, existing = self.products[product.code]
            self.products[product.code] = (p, existing + qty)
        else:
            self.products[product.code] = (product, qty)

    def stock_coins(self, denomination: int, count: int):
        if denomination not in self.coins:
            raise ValueError(f"Invalid denomination: {denomination}")
        self.coins[denomination] += count

    def get_product(self, code: str) -> Optional[Product]:
        if code not in self.products: return None
        return self.products[code][0]

    def has_stock(self, code: str) -> bool:
        return code in self.products and self.products[code][1] > 0

    def remove_one(self, code: str):
        p, qty = self.products[code]
        if qty == 0:
            raise ValueError("Out of stock")
        self.products[code] = (p, qty - 1)

    def can_provide_change(self, amount: int) -> bool:
        # Greedy check — can we make this amount?
        remaining = amount
        for denom in sorted(self.coins.keys(), reverse=True):
            use = min(self.coins[denom], remaining // denom)
            remaining -= use * denom
        return remaining == 0

    def dispense_change(self, amount: int) -> dict[int, int]:
        dispensed = {}
        remaining = amount
        for denom in sorted(self.coins.keys(), reverse=True):
            use = min(self.coins[denom], remaining // denom)
            if use > 0:
                dispensed[denom] = use
                self.coins[denom] -= use
                remaining -= use * denom
        if remaining != 0:
            raise ValueError("Can't make exact change")
        return dispensed


# --- State pattern ---
class VendingState(ABC):
    @abstractmethod
    def insert_money(self, machine, denomination: int): pass
    @abstractmethod
    def select_product(self, machine, code: str): pass
    @abstractmethod
    def cancel(self, machine): pass


class Idle(VendingState):
    def insert_money(self, machine, denomination):
        machine.inventory.stock_coins(denomination, 1)   # machine absorbs it
        machine.balance += denomination
        print(f"[Idle → HasMoney] Balance: ₹{machine.balance}")
        machine.set_state(HasMoney())

    def select_product(self, machine, code):
        print("Insert money first.")

    def cancel(self, machine):
        print("Nothing to cancel.")


class HasMoney(VendingState):
    def insert_money(self, machine, denomination):
        machine.inventory.stock_coins(denomination, 1)
        machine.balance += denomination
        print(f"Balance: ₹{machine.balance}")

    def select_product(self, machine, code):
        product = machine.inventory.get_product(code)
        if not product:
            print(f"Unknown product code: {code}"); return
        if not machine.inventory.has_stock(code):
            print(f"'{product.name}' is out of stock"); return
        if machine.balance < product.price:
            print(f"Insufficient balance. Need ₹{product.price - machine.balance} more."); return

        change = machine.balance - product.price
        if change > 0 and not machine.inventory.can_provide_change(change):
            print(f"Can't give ₹{change} change. Please use exact amount or cancel.")
            return

        print(f"[HasMoney → Dispensing]")
        machine.set_state(Dispensing())
        machine.dispense(product, change)

    def cancel(self, machine):
        # Refund — but we've already pooled the coins. In reality we'd track separately.
        refund = machine.inventory.dispense_change(machine.balance)
        print(f"Refunding ₹{machine.balance} → {refund}")
        machine.balance = 0
        machine.set_state(Idle())


class Dispensing(VendingState):
    def insert_money(self, m, d):
        print("Busy dispensing. Please wait.")
    def select_product(self, m, code):
        print("Busy dispensing.")
    def cancel(self, m):
        print("Can't cancel during dispense.")


# --- Vending machine ---
class VendingMachine:
    def __init__(self, inventory: Inventory):
        self.inventory = inventory
        self.balance = 0
        self._state: VendingState = Idle()

    def set_state(self, state: VendingState):
        self._state = state

    def insert_money(self, denomination: int):
        self._state.insert_money(self, denomination)

    def select_product(self, code: str):
        self._state.select_product(self, code)

    def cancel(self):
        self._state.cancel(self)

    def dispense(self, product: Product, change: int):
        self.inventory.remove_one(product.code)
        print(f"Dispensed: {product.name}")
        if change > 0:
            change_dispensed = self.inventory.dispense_change(change)
            print(f"Change: ₹{change} → {change_dispensed}")
        self.balance = 0
        self.set_state(Idle())


# --- Usage ---
inv = Inventory()
inv.add_product(Product("A1", "Coke", 30), 5)
inv.add_product(Product("A2", "Chips", 20), 5)
inv.add_product(Product("A3", "Water", 15), 5)
for denom in [1, 2, 5, 10, 20]:
    inv.stock_coins(denom, 20)   # pre-stocked change

vm = VendingMachine(inv)

vm.select_product("A1")     # Error: no money
vm.insert_money(20)
vm.insert_money(10)
vm.insert_money(5)          # Balance ₹35
vm.select_product("A1")     # Dispense Coke, ₹5 change
```

### Step 7 — Extensions & Tradeoffs

- **Exact-change-only mode** — when low on change denominations, machine refuses overpayments. Add a `ChangeStrategy`.
- **Multiple products in one transaction** — change the state machine to allow cart-like behavior. Significantly more complex — mention but don't over-engineer.
- **Digital payment** — add `PaymentMethod` abstraction; `CashPayment`, `UPIPayment`, `CardPayment` as subtypes.
- **Hardware failure handling** — states like `Jammed` or `OutOfService`.
- **Admin portal** — restocking, coin retrieval, sales reports — probably its own class.
- **Concurrency** — locking around state transitions (only one user at a time anyway; often not needed).

### Common Pitfalls

- **Not using State pattern** — easy to fall into one big class with `if self.state == "idle"` everywhere. Interviewers often explicitly hint: "think about how the machine's behavior differs based on its current state."
- **Confusing balance (inserted money) with inventory coins (available for change)** — in reality these are separate pools; simplifying them into one (as I did) is a modeling choice worth noting.
- **Forgetting the "no change available" case** — a real vending-machine pain; candidates miss this frequently.
- **Treating product code as name** — keep them distinct (code for selection, name for display).

### Patterns Used

- **State** — core of the design; Idle, HasMoney, Dispensing.
- **Strategy** (implicitly in change logic; explicit if extended).
- **Facade** — `VendingMachine` fronts a subsystem (inventory + state + dispenser).

### SOLID Checks

- **SRP** ✓ — Inventory, State classes, and VendingMachine each have focused roles.
- **OCP** ✓ — New states (jammed, maintenance), new denominations, new products — all additive.
- **LSP** ✓ — All states substitute uniformly.
- **ISP** ✓ — State interface is narrow (3 methods).
- **DIP** ✓ — VendingMachine holds a state *interface*, not a concrete state.

---

## 8. Problem 5 — Design a Splitwise-Like Expense Sharing System

> **The Prompt:** Design a system where users can record shared expenses (e.g., "I paid ₹1200 for dinner; split equally among 4 people") and track who owes whom.

This problem stretches beyond simple entity modeling — it exercises **policy (split strategies)**, **graph-like debt tracking**, and **observability of complex state**.

### Step 1 — Clarify Requirements

**Questions to ask:**

- How can expenses be split? → Equally, by exact amounts, by percentage, or by shares.
- Currency handling? → Single currency for simplicity.
- Groups? → Yes; users can be in multiple groups; expenses are typically group-scoped but can be one-off.
- Debt simplification? → Should the system suggest the minimum number of settlements to clear debts? → Yes — a nice add-on showcasing algorithms.
- Payments/settlements? → Recording a "I paid X to Y" action reduces debt.
- Notifications? → Out of scope; mention Observer pattern as extension.

**Scope summary:** *"Users, groups, expenses split by various strategies, a balance ledger showing who owes whom, settlement recording, and optional debt simplification. Notifications and multi-currency are extensions."*

### Step 2 — Identify Entities

- `User` — a person in the system.
- `Group` — a set of users sharing expenses.
- `Expense` — a record of who paid how much and who shares in what way.
- `SplitStrategy` — equal, exact, percentage, shares.
- `Split` — an individual user's portion of an expense.
- `BalanceSheet` — tracks pairwise balances (who owes whom).
- `ExpenseManager` — the facade coordinating it all.

### Step 3 — Identify Actions

- Create user, group.
- Add expense (paid by X, split among Y with strategy Z).
- Record settlement (user A pays user B).
- View balance (for a user, or for a group).
- Simplify debts in a group.

### Step 4 — Relationships

- `Group` **has-many** `Users`.
- `Expense` **has-one** payer (`User`), **has-many** `Splits` (each tied to a user).
- `BalanceSheet` is a map `{(user_a, user_b): amount}` where positive means a owes b.
- `ExpenseManager` orchestrates.

### Step 5 — SOLID and Patterns

- **Strategy** — `SplitStrategy` is the cleanest fit: different algorithms for splitting.
- **Facade** — `ExpenseManager` provides a simple API over users/groups/expenses/balances.
- **Command** (optional) — each action (add expense, settle) could be a Command for undo/audit. Usually out of scope.
- **Observer** (optional) — balance updates could notify UI.
- **SRP** — each concern isolated.

### Step 6 — Code

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import uuid


# --- User / Group ---
@dataclass
class User:
    user_id: str
    name: str
    email: str

    def __hash__(self): return hash(self.user_id)
    def __eq__(self, other): return isinstance(other, User) and self.user_id == other.user_id


@dataclass
class Group:
    group_id: str
    name: str
    members: list[User] = field(default_factory=list)

    def add_member(self, user: User):
        if user not in self.members:
            self.members.append(user)


# --- Split ---
@dataclass
class Split:
    user: User
    amount: float


# --- Strategy for splitting ---
class SplitStrategy(ABC):
    @abstractmethod
    def calculate(self, total: float, participants: list[User], **kwargs) -> list[Split]: pass


class EqualSplit(SplitStrategy):
    def calculate(self, total, participants, **kwargs):
        n = len(participants)
        share = round(total / n, 2)
        splits = [Split(u, share) for u in participants]
        # Adjust last split for rounding drift
        drift = total - share * n
        splits[-1] = Split(splits[-1].user, round(splits[-1].amount + drift, 2))
        return splits


class ExactSplit(SplitStrategy):
    def calculate(self, total, participants, *, exact_amounts: dict[User, float], **kwargs):
        if abs(sum(exact_amounts.values()) - total) > 0.01:
            raise ValueError("Exact amounts don't sum to total")
        return [Split(u, exact_amounts[u]) for u in participants]


class PercentSplit(SplitStrategy):
    def calculate(self, total, participants, *, percentages: dict[User, float], **kwargs):
        if abs(sum(percentages.values()) - 100) > 0.01:
            raise ValueError("Percentages don't sum to 100")
        return [Split(u, round(total * percentages[u] / 100, 2)) for u in participants]


# --- Expense ---
@dataclass
class Expense:
    id: str
    description: str
    amount: float
    payer: User
    splits: list[Split]
    group: Optional[Group] = None


# --- Balance sheet ---
class BalanceSheet:
    """
    Stores pairwise debts. balances[a][b] = how much a owes b.
    Invariant: balances[a][b] and balances[b][a] are not both nonzero;
    we net them out.
    """
    def __init__(self):
        self._balances: dict[User, dict[User, float]] = {}

    def _get(self, a: User, b: User) -> float:
        return self._balances.get(a, {}).get(b, 0.0)

    def _set(self, a: User, b: User, amount: float):
        self._balances.setdefault(a, {})[b] = amount

    def add_debt(self, debtor: User, creditor: User, amount: float):
        """debtor owes creditor `amount` more."""
        if debtor == creditor: return
        # Net against reverse direction
        reverse = self._get(creditor, debtor)
        if reverse >= amount:
            self._set(creditor, debtor, round(reverse - amount, 2))
        else:
            # Clear reverse, add remainder to forward
            remainder = amount - reverse
            self._set(creditor, debtor, 0.0)
            self._set(debtor, creditor, round(self._get(debtor, creditor) + remainder, 2))

    def get_balance(self, user: User) -> dict[User, float]:
        """Returns dict of other_user -> amount (positive = user owes them, negative = they owe user)."""
        result = {}
        for other, amt in self._balances.get(user, {}).items():
            if amt > 0:
                result[other] = amt
        for other, inner in self._balances.items():
            if other == user: continue
            amt = inner.get(user, 0.0)
            if amt > 0:
                result[other] = result.get(other, 0) - amt
        return result

    def all_pairwise(self) -> list[tuple[User, User, float]]:
        result = []
        for debtor, inner in self._balances.items():
            for creditor, amt in inner.items():
                if amt > 0:
                    result.append((debtor, creditor, amt))
        return result


# --- ExpenseManager (Facade) ---
class ExpenseManager:
    def __init__(self):
        self.users: dict[str, User] = {}
        self.groups: dict[str, Group] = {}
        self.expenses: list[Expense] = []
        self.balance_sheet = BalanceSheet()

    def add_user(self, user: User):
        self.users[user.user_id] = user

    def add_group(self, group: Group):
        self.groups[group.group_id] = group

    def add_expense(self, description: str, amount: float, payer: User,
                    participants: list[User], strategy: SplitStrategy,
                    group: Optional[Group] = None, **strategy_kwargs) -> Expense:
        splits = strategy.calculate(amount, participants, **strategy_kwargs)
        expense = Expense(
            id=str(uuid.uuid4())[:8],
            description=description, amount=amount,
            payer=payer, splits=splits, group=group,
        )
        self.expenses.append(expense)

        # Update balances: each non-payer participant owes the payer their split
        for s in splits:
            if s.user != payer:
                self.balance_sheet.add_debt(s.user, payer, s.amount)
        return expense

    def record_settlement(self, from_user: User, to_user: User, amount: float):
        """A direct payment reduces debt from_user → to_user."""
        self.balance_sheet.add_debt(to_user, from_user, amount)
        print(f"Settled: {from_user.name} paid {to_user.name} ₹{amount}")

    def show_balances(self, user: User):
        balances = self.balance_sheet.get_balance(user)
        if not balances:
            print(f"{user.name}: all settled!")
            return
        for other, amt in balances.items():
            if amt > 0:
                print(f"{user.name} owes {other.name}: ₹{amt:.2f}")
            else:
                print(f"{other.name} owes {user.name}: ₹{-amt:.2f}")


# --- Usage ---
mgr = ExpenseManager()
amit = User("u1", "Amit", "amit@x.com")
priya = User("u2", "Priya", "priya@x.com")
rohan = User("u3", "Rohan", "rohan@x.com")
for u in [amit, priya, rohan]:
    mgr.add_user(u)

trip = Group("g1", "Goa Trip")
for u in [amit, priya, rohan]:
    trip.add_member(u)
mgr.add_group(trip)

# Amit pays ₹1200 for dinner; split equally among all 3
mgr.add_expense("Dinner", 1200, amit, [amit, priya, rohan],
                EqualSplit(), group=trip)

# Priya pays ₹900 for cab; Amit owes 500, Rohan owes 400 (exact)
mgr.add_expense("Cab", 900, priya, [amit, priya, rohan],
                ExactSplit(), group=trip,
                exact_amounts={amit: 500, priya: 0, rohan: 400})

mgr.show_balances(amit)
mgr.show_balances(priya)
mgr.show_balances(rohan)

# Settlement
mgr.record_settlement(amit, priya, 100)
print("---")
mgr.show_balances(amit)
mgr.show_balances(priya)
```

### Step 7 — Extensions & Tradeoffs

- **Debt simplification** — given current pairwise balances, find the minimum-transaction way to settle all. This is a graph problem (min-cashflow); use a greedy algorithm or netting approach. This is a common **follow-up** to this problem in interviews.
- **Multiple currencies** — store expenses in native currency; convert via a `CurrencyConverter` when computing balances in a user's preferred currency.
- **Multi-payer expenses** — someone pays part, another pays part. Extend the `payer` field to `payers: list[Split]`.
- **Activity feed** — Observer pattern: UI observes balance updates.
- **Immutable history** — represent each expense as a Command for auditability and potential undo.
- **Concurrency** — if multiple users add expenses simultaneously to a group, use proper transactions. Interview-level: mention and move on.

### Common Pitfalls

- **Conflating Expense and Split** — Expense is the event; Split is one person's share. Keep them separate.
- **Not using Strategy for splitting** — hardcoding equal/exact/percent with conditionals loses OCP.
- **Double-counting balances** — forgetting to subtract/net against reverse direction.
- **Floating-point for money** — interviewers often ask; in production use `Decimal` or cents-as-int. Mention this tradeoff even if you use floats for demo.
- **Over-engineering the balance sheet** — a simple dict-of-dicts works for interviews; distributed ledger stuff is out of scope.

### Patterns Used

- **Strategy** — `SplitStrategy` variants.
- **Facade** — `ExpenseManager` provides a simple API over everything.
- **Composite** (subtle) — Groups contain users; expenses compose splits.

### SOLID Checks

- **SRP** ✓ — Split strategies, balance sheet, manager all separate.
- **OCP** ✓ — New split algorithm (e.g., `SharesSplit`) = new class.
- **LSP** ✓ — All strategies substitutable.
- **ISP** ✓ — `SplitStrategy` is narrow.
- **DIP** ✓ — Manager depends on `SplitStrategy` abstraction.

---

## 9. Problem 6 — Design a Ride-Hailing System

> **The Prompt:** Design a ride-hailing service (like Uber/Ola) at the LLD level — riders request rides, drivers accept, trips complete, fares are computed.

This is the most open-ended of the six. It's a great showcase for **multiple patterns working together** and for thinking about **extensibility and scale**.

### Step 1 — Clarify Requirements

**Questions to ask:**

- Core flow? → Rider requests ride → system matches nearby driver → driver accepts → trip happens → fare calculated → payment recorded.
- Multiple ride types? → Yes: mini, sedan, SUV; each with different pricing.
- Surge pricing? → Yes, during high demand.
- Matching algorithm? → Nearest available driver to pickup; pluggable.
- Payment methods? → Card, UPI, wallet, cash; external gateway is out of scope.
- Ratings? → Both rider and driver rate each other.
- Concurrency? → Real system is distributed; for LLD, assume in-memory, optional mention of locking.
- Cancellation? → Yes; with potential fee depending on when canceled.

**Scope summary:** *"I'll design entities (User, Rider, Driver, Vehicle, Trip), a matching flow with pluggable strategies, a lifecycle state for trips, pricing with vehicle type and surge, rating capture, and payment recording. Real-time geolocation, persistence, and concurrency are extensions."*

### Step 2 — Identify Entities

- `User` (base), `Rider`, `Driver` — inheritance.
- `Vehicle` — driver owns one; attributes (type, plate).
- `Trip` — the core unit: rider, driver, vehicle, source, destination, fare, state.
- `Location` — (lat, lng) + helpers.
- `TripState` — Requested, DriverAssigned, Started, Completed, Cancelled (State pattern).
- `MatchingStrategy` — picks a driver for a ride request.
- `PricingStrategy` — computes fare.
- `SurgeCalculator` — multiplier for peak hours.
- `PaymentMethod` — abstract; subtypes for each method.
- `RideManager` — the orchestrator/facade.

### Step 3 — Identify Actions

- Rider requests a ride.
- System matches a driver; driver accepts (or declines, falling through to next).
- Driver starts the trip upon pickup.
- Driver ends the trip at drop-off; fare is calculated.
- Payment is processed.
- Rider/driver rate each other.
- Cancellation can happen before driver accepts, before trip starts, or mid-trip — different fee rules.

### Step 4 — Relationships

- `Driver` **has-one** `Vehicle`.
- `Trip` **has-one** `Rider`, **has-one** `Driver`, **has-one** `Vehicle`, **has-one** `TripState`.
- `RideManager` **has-many** drivers, **has-many** trips.
- `MatchingStrategy`, `PricingStrategy`, `SurgeCalculator` are dependencies of `RideManager`.

### Step 5 — SOLID and Patterns

- **State** — `TripState` (Requested, DriverAssigned, Started, Completed, Cancelled).
- **Strategy** — matching algorithm, pricing algorithm, payment method — *three strategies!* This problem naturally attracts multiple Strategy applications.
- **Observer** (optional) — drivers observe ride-request events in their area; riders observe trip state changes for the app UI.
- **Factory** (optional) — `PaymentMethodFactory` for creating payment objects.
- **Facade** — `RideManager` as the orchestrator.
- **SRP** — each component owns one concern.
- **DIP** — manager depends on strategy abstractions.

### Step 6 — Code

```python
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
import uuid
import math


# --- Location helper ---
@dataclass
class Location:
    lat: float
    lng: float

    def distance_to(self, other: "Location") -> float:
        # Simplified: treat lat/lng as flat plane; enough for LLD
        return math.sqrt((self.lat - other.lat) ** 2 + (self.lng - other.lng) ** 2) * 111  # km


# --- Users ---
class User:
    def __init__(self, user_id: str, name: str, phone: str):
        self.user_id = user_id
        self.name = name
        self.phone = phone


class Rider(User):
    pass


class VehicleType(Enum):
    MINI = "mini"
    SEDAN = "sedan"
    SUV = "suv"


@dataclass
class Vehicle:
    plate: str
    type: VehicleType


class Driver(User):
    def __init__(self, user_id, name, phone, vehicle: Vehicle, location: Location):
        super().__init__(user_id, name, phone)
        self.vehicle = vehicle
        self.location = location
        self.is_available = True
        self.rating = 5.0


# --- Trip state ---
class TripState(ABC):
    @abstractmethod
    def name(self) -> str: pass


class Requested(TripState):
    def name(self): return "REQUESTED"

class DriverAssigned(TripState):
    def name(self): return "DRIVER_ASSIGNED"

class Started(TripState):
    def name(self): return "STARTED"

class Completed(TripState):
    def name(self): return "COMPLETED"

class Cancelled(TripState):
    def name(self): return "CANCELLED"


# --- Trip ---
@dataclass
class Trip:
    id: str
    rider: Rider
    source: Location
    destination: Location
    vehicle_type: VehicleType
    state: TripState = field(default_factory=Requested)
    driver: Optional[Driver] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    fare: Optional[float] = None
    rider_rating_of_driver: Optional[int] = None
    driver_rating_of_rider: Optional[int] = None


# --- Matching strategy ---
class MatchingStrategy(ABC):
    @abstractmethod
    def select(self, trip: Trip, drivers: list[Driver]) -> Optional[Driver]: pass


class NearestDriverStrategy(MatchingStrategy):
    def select(self, trip: Trip, drivers):
        candidates = [d for d in drivers
                      if d.is_available and d.vehicle.type == trip.vehicle_type]
        if not candidates: return None
        return min(candidates, key=lambda d: d.location.distance_to(trip.source))


class HighestRatedStrategy(MatchingStrategy):
    """Among nearby drivers, pick the highest-rated."""
    def __init__(self, radius_km: float = 5):
        self.radius_km = radius_km
    def select(self, trip, drivers):
        candidates = [
            d for d in drivers
            if d.is_available and d.vehicle.type == trip.vehicle_type
            and d.location.distance_to(trip.source) <= self.radius_km
        ]
        if not candidates: return None
        return max(candidates, key=lambda d: d.rating)


# --- Pricing strategy ---
class PricingStrategy(ABC):
    @abstractmethod
    def calculate(self, trip: Trip, surge: float) -> float: pass


class DistanceBasedPricing(PricingStrategy):
    BASE_FARE = {VehicleType.MINI: 50, VehicleType.SEDAN: 80, VehicleType.SUV: 120}
    PER_KM = {VehicleType.MINI: 10, VehicleType.SEDAN: 15, VehicleType.SUV: 20}

    def calculate(self, trip, surge):
        distance = trip.source.distance_to(trip.destination)
        fare = self.BASE_FARE[trip.vehicle_type] + self.PER_KM[trip.vehicle_type] * distance
        return round(fare * surge, 2)


class SurgeCalculator:
    """Computes surge based on supply/demand. Stub for interview."""
    def current_multiplier(self, pickup: Location, available_drivers: int) -> float:
        if available_drivers < 2: return 2.0
        if available_drivers < 5: return 1.3
        return 1.0


# --- Payment ---
class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, amount: float, user: User) -> bool: pass


class CardPayment(PaymentMethod):
    def charge(self, amount, user):
        print(f"Charging ₹{amount} on {user.name}'s card")
        return True


class UPIPayment(PaymentMethod):
    def charge(self, amount, user):
        print(f"Charging ₹{amount} via UPI to {user.name}")
        return True


class CashPayment(PaymentMethod):
    def charge(self, amount, user):
        print(f"{user.name} to pay ₹{amount} cash to driver")
        return True


# --- Ride Manager (Facade) ---
class RideManager:
    def __init__(self,
                 matching: MatchingStrategy,
                 pricing: PricingStrategy,
                 surge: SurgeCalculator):
        self.drivers: dict[str, Driver] = {}
        self.trips: dict[str, Trip] = {}
        self.matching = matching
        self.pricing = pricing
        self.surge = surge

    def register_driver(self, d: Driver):
        self.drivers[d.user_id] = d

    def request_ride(self, rider: Rider, source: Location, destination: Location,
                     vehicle_type: VehicleType) -> Optional[Trip]:
        trip = Trip(
            id=str(uuid.uuid4())[:8],
            rider=rider, source=source, destination=destination,
            vehicle_type=vehicle_type,
        )
        self.trips[trip.id] = trip

        # Match
        driver = self.matching.select(trip, list(self.drivers.values()))
        if not driver:
            print(f"No drivers available for {vehicle_type.value}")
            trip.state = Cancelled()
            return trip

        trip.driver = driver
        driver.is_available = False
        trip.state = DriverAssigned()
        print(f"Trip {trip.id}: Assigned {driver.name} to {rider.name}")
        return trip

    def start_trip(self, trip_id: str):
        trip = self.trips[trip_id]
        if not isinstance(trip.state, DriverAssigned):
            print(f"Can't start: trip is {trip.state.name()}")
            return
        trip.state = Started()
        trip.started_at = datetime.now()
        print(f"Trip {trip_id}: Started")

    def complete_trip(self, trip_id: str, payment: PaymentMethod):
        trip = self.trips[trip_id]
        if not isinstance(trip.state, Started):
            print(f"Can't complete: trip is {trip.state.name()}")
            return
        trip.state = Completed()
        trip.completed_at = datetime.now()

        surge = self.surge.current_multiplier(
            trip.source,
            sum(1 for d in self.drivers.values() if d.is_available),
        )
        trip.fare = self.pricing.calculate(trip, surge)
        print(f"Trip {trip_id}: Completed. Fare: ₹{trip.fare} (surge x{surge})")

        payment.charge(trip.fare, trip.rider)
        trip.driver.is_available = True
        trip.driver.location = trip.destination

    def cancel_trip(self, trip_id: str):
        trip = self.trips[trip_id]
        if isinstance(trip.state, (Completed, Cancelled)):
            print(f"Can't cancel: trip already {trip.state.name()}")
            return
        # Cancellation fees could depend on current state
        fee = 0
        if isinstance(trip.state, DriverAssigned):
            fee = 30
        elif isinstance(trip.state, Started):
            fee = 100
        trip.state = Cancelled()
        if trip.driver:
            trip.driver.is_available = True
        print(f"Trip {trip_id}: Cancelled. Fee: ₹{fee}")

    def rate_trip(self, trip_id: str, by_rider: Optional[int] = None, by_driver: Optional[int] = None):
        trip = self.trips[trip_id]
        if not isinstance(trip.state, Completed):
            print("Can only rate completed trips")
            return
        if by_rider is not None:
            trip.rider_rating_of_driver = by_rider
            # update driver's average rating (simplified)
            trip.driver.rating = (trip.driver.rating + by_rider) / 2
        if by_driver is not None:
            trip.driver_rating_of_rider = by_driver


# --- Usage ---
mgr = RideManager(
    matching=NearestDriverStrategy(),
    pricing=DistanceBasedPricing(),
    surge=SurgeCalculator(),
)

# Register drivers
d1 = Driver("d1", "Raj", "9999", Vehicle("KA01-AA", VehicleType.SEDAN), Location(12.97, 77.59))
d2 = Driver("d2", "Sita", "8888", Vehicle("KA02-BB", VehicleType.SEDAN), Location(12.96, 77.58))
d3 = Driver("d3", "Ahmed", "7777", Vehicle("KA03-CC", VehicleType.MINI), Location(12.98, 77.60))
for d in [d1, d2, d3]: mgr.register_driver(d)

# Create a rider and request
rider = Rider("r1", "Amit", "6666")
trip = mgr.request_ride(rider, Location(12.97, 77.59), Location(12.95, 77.55), VehicleType.SEDAN)
mgr.start_trip(trip.id)
mgr.complete_trip(trip.id, UPIPayment())
mgr.rate_trip(trip.id, by_rider=5, by_driver=4)
```

### Step 7 — Extensions & Tradeoffs

- **Real geolocation** — Haversine formula or a geo index (quadtree, geohash, H3) for efficient nearest-driver queries.
- **Driver pool scalability** — in-memory list is fine for LLD; real system uses a geospatial index (Redis GEO, PostGIS).
- **Event-driven architecture** — request, driver acceptance, pickup, drop-off become events on a queue. Observer pattern on top.
- **Cancellation policy refinement** — externalize as `CancellationPolicy` strategy.
- **Driver matching with preferences** — e.g., prefer drivers with matching language, female driver option — another layer of strategies or filters.
- **Payment retries and failures** — introduce `PaymentResult` and retry logic.
- **Scheduled / outstation trips** — extend `Trip` with scheduling fields; different state machine.
- **Trip history, receipts** — repository pattern for persistence.

### Common Pitfalls

- **Putting matching logic inside `RideManager`** — violates SRP and OCP. Externalize as Strategy.
- **Hardcoding fare formulas** — same issue. Strategy fixes it.
- **Forgetting trip states** — State pattern is natural here; without it, you get `if/elif` everywhere.
- **Having one `User` class with a flag `is_driver`** — works, but loses polymorphism; interviewers prefer a class per role.
- **Coupling `Trip` to payment** — trip and payment should be separable concerns; manager orchestrates.
- **Ignoring cancellation** — a realistic system needs cancellation at multiple states with different rules.

### Patterns Used

- **State** — `TripState` lifecycle.
- **Strategy** — matching, pricing, payment method.
- **Facade** — `RideManager`.
- **Factory** (could be introduced) — for creating payment methods by type string.
- **Observer** (extension) — for event-driven UI updates.

### SOLID Checks

- **SRP** ✓ — Matching, pricing, surge, payment, manager — all distinct concerns.
- **OCP** ✓ — New vehicle types, new matching/pricing/payment strategies — all additive.
- **LSP** ✓ — All strategy variants substitutable.
- **ISP** ✓ — Narrow interfaces.
- **DIP** ✓ — `RideManager` depends on abstractions.

---

## 10. Meta-Patterns Across All Six Problems

Look back at the six problems. Patterns keep appearing for the same reasons. Internalizing these meta-patterns lets you recognize design choices quickly in *any* LLD problem.

### Meta-Pattern 1 — "Pluggable Algorithm" → Strategy

Almost every problem has at least one. Parking has `PricingStrategy`. Elevator has `SchedulingStrategy`. Library has `MembershipPolicy`. Vending machine has change-giving (implicit). Splitwise has `SplitStrategy`. Ride-hailing has `MatchingStrategy`, `PricingStrategy`, `PaymentMethod`.

**Trigger**: *Is there an operation that might reasonably be done in more than one way?* → Strategy.

### Meta-Pattern 2 — "Lifecycle with Distinct Behaviors" → State

Problems where an entity transitions through named stages, each with different allowed actions, scream State: Elevator (Idle/Moving/DoorOpen), Vending Machine (Idle/HasMoney/Dispensing), Trip (Requested/Assigned/Started/Completed).

**Trigger**: *Does an entity behave differently based on where it is in its lifecycle, with strict transition rules?* → State.

### Meta-Pattern 3 — "Orchestrator of Many Parts" → Facade

Every problem has a top-level coordinator. `ParkingLot`, `Library`, `VendingMachine`, `ExpenseManager`, `RideManager`. Each exposes a simple API and internally coordinates sub-components.

**Trigger**: *Is the system made of several moving parts that clients shouldn't juggle directly?* → Facade.

### Meta-Pattern 4 — "Notify Interested Parties" → Observer

Parking's `DisplayBoard` watching `Floor`. Library's reservation notifications. Ride-hailing's driver receiving ride requests.

**Trigger**: *When X happens, does Y need to know, without X knowing Y explicitly?* → Observer.

### Meta-Pattern 5 — "Is-a Hierarchy with Behavioral Variance" → Inheritance + Polymorphism

`Vehicle` → Bike/Car/Truck. `User` → Rider/Driver. `Member` → Student/Faculty/Guest (though we used Strategy for their policies, which is often cleaner).

**Trigger**: *Do I have related types with genuinely different behaviors or attributes?* → Inheritance.

### Meta-Pattern 6 — "Depend on Abstraction, Inject Concrete" → DIP

Every orchestrator in these problems receives strategies via its constructor rather than newing them up internally. This enables testing (inject a fake), swapping implementations, and configuration.

**Trigger**: Always. You should almost always inject dependencies rather than hardcoding them.

### How to Use This Meta-View in Interviews

When you hear a new LLD problem, run through these triggers:

1. What varies in algorithm? → Strategy candidates.
2. What has a lifecycle? → State candidates.
3. What's the top-level orchestrator? → Facade.
4. Who watches what? → Observer candidates.
5. What are my main noun hierarchies? → Inheritance.
6. Where should I inject vs construct? → DIP everywhere.

Most LLD problems will hit 3-5 of these. Hitting all six is unusual but impressive.

---

## 11. Final Interview Tips

### Before the Interview

- **Study the six problems in this document thoroughly.** Most actual LLD interview questions are variations or combinations of these.
- **Practice verbalizing your thinking.** Design well internally, but also articulate well externally. A great design poorly explained is a mediocre interview.
- **Practice on paper or a whiteboard without running code.** You won't have `python` to validate syntax — you need to write clean code from memory.
- **Memorize the 6-step framework.** Clarify → Entities → Actions → Relationships → SOLID/Patterns → Code → Extensions.
- **Know your language well.** Type hints, ABCs, dataclasses, enums — these show polish.

### During the Interview

- **Always start by clarifying.** If you dive into code without clarifying, the interviewer will steer you back — that's wasted time.
- **Speak constantly.** Silence is the enemy. Even "I'm considering X vs Y; I'll go with X because..." is valuable.
- **Write clean code, but not complete code.** Sketch the main classes fully; use method stubs for secondary ones. Say "I'll stub this; the logic would be...".
- **Explicitly call out patterns and SOLID.** *"I'm using Strategy here for pricing because..."* — interviewers love this narration.
- **Handle pushback gracefully.** If the interviewer pokes at your design, they're probably hinting at a problem. Listen, reconsider, adjust.
- **Stay flexible.** If you over-designed, admit it: *"Actually, for this scope, a simple dict would be clearer than a full factory."* That's a win, not a loss.

### Common Follow-Up Questions

Interviewers often probe with:

- **"How would you test this?"** → Talk about unit tests for each strategy/state; mock the DB/repository; test the orchestrator with fakes. Show you understand dependency injection makes testing easy.
- **"How would this scale to 1 million users?"** → Move in-memory maps to a database; introduce caching (Redis); shard by user_id; async processing via queues.
- **"What if X was distributed?"** → Mention event-driven architecture, idempotency, eventual consistency.
- **"Are there concurrency issues?"** → Identify critical sections; use locks or transactional boundaries; mention optimistic vs pessimistic locking.
- **"What patterns did you use and why?"** → Be ready to articulate not just what pattern, but *what problem it solved* in your design.
- **"What would you change?"** → Always have at least one self-identified improvement. Shows self-awareness.

### Pitfalls Interviewers Specifically Look For

From the interviewer's perspective, red flags include:

- Writing code before clarifying.
- One giant class handling everything.
- Hardcoded strategies (`if type == "premium":`).
- No inheritance or polymorphism when they'd obviously fit.
- No state pattern where a clear lifecycle exists.
- Ignoring the interviewer's hints.
- Being unable to explain any design choice.
- Perfect code but zero design thinking.

### The Three Things You Must Demonstrate

Regardless of the problem, by the end of the interview you should have clearly demonstrated:

1. **Structured thinking** — a clean, deliberate decomposition of the problem.
2. **Design fluency** — natural use of SOLID and a few well-chosen patterns.
3. **Communication** — explaining your reasoning and handling feedback well.

If you nail these three, the specific problem almost doesn't matter.

---

## Final Thought

Designing software is a craft. Patterns, principles, and frameworks like the ones in this series are the tools of the craft — but *craftsmanship* is what emerges when you apply them with judgment, restraint, and a clear eye for the problem in front of you.

You've walked through OOP fundamentals, SOLID principles, 23 design patterns, and six realistic interview designs. You now have the vocabulary *and* the judgment to approach any LLD problem with confidence.

**Go practice. Design things. Build things. Break them. Refactor them.** That's where real mastery comes from.

Good luck in your interviews — you've got the toolkit. Now make it yours.
