# LLD Deep Dive #1 — Designing a Parking Lot

> **What this document is:** A genuine, step-by-step walkthrough of how to *think through* a Parking Lot LLD problem in an interview. Not a finished design dropped on you — but the reasoning, the false starts, the alternatives weighed, and the justifications that lead to each design decision.
>
> **Time investment:** Read this slowly. If you're doing this for interview prep, it's worth treating each section as its own thinking exercise — pause and ask yourself "what would I do here?" before reading on.

---

## Table of Contents

1. [Why This Problem? Why First?](#1-why-this-problem-why-first)
2. [Stage 1 — Receiving the Problem](#2-stage-1--receiving-the-problem)
3. [Stage 2 — Clarifying Requirements](#3-stage-2--clarifying-requirements)
4. [Stage 3 — Identifying Entities (And Rejecting Some)](#4-stage-3--identifying-entities)
5. [Stage 4 — Deciding the Vehicle Hierarchy](#5-stage-4--deciding-the-vehicle-hierarchy)
6. [Stage 5 — Modeling Spots and Sizes](#6-stage-5--modeling-spots-and-sizes)
7. [Stage 6 — Modeling Floors and the Spot-Finding Logic](#7-stage-6--modeling-floors-and-the-spot-finding-logic)
8. [Stage 7 — Tickets, Gates, and the Park/Exit Flow](#8-stage-7--tickets-gates-and-the-parkexit-flow)
9. [Stage 8 — Pricing as a Strategy](#9-stage-8--pricing-as-a-strategy)
10. [Stage 9 — Display Boards and the Observer Decision](#10-stage-9--display-boards-and-the-observer-decision)
11. [Stage 10 — Putting It All Together](#11-stage-10--putting-it-all-together)
12. [Stage 11 — Validating with a Mental Walkthrough](#12-stage-11--validating-with-a-mental-walkthrough)
13. [Stage 12 — Anticipating Follow-Up Questions](#13-stage-12--anticipating-follow-up-questions)
14. [Final Reflection — What This Problem Teaches](#14-final-reflection)

---

## 1. Why This Problem? Why First?

Parking Lot is the most frequently asked LLD question — for good reason. It's deceptively simple-sounding ("just track which spots are full, right?"), but every meaningful design decision in it foreshadows a real-world architecture concern:

- **How do you model a hierarchy of related types?** (Vehicles.)
- **How do you make policy pluggable?** (Pricing.)
- **How do you separate state from notification?** (Spots and display boards.)
- **How do you keep the top-level orchestrator from becoming a god class?**

If you can do this problem *well* — with full reasoning, not pattern-matching — you've demonstrated most of what an LLD interview tests. So we're going to do it slowly, deliberately, and out loud.

---

## 2. Stage 1 — Receiving the Problem

The interviewer says:

> "Design a parking lot."

That's it. That's all they said. No floors, no fees, no vehicle types, no scale.

**This vagueness is intentional.** They're testing whether you'll dive in or pause. Most candidates dive in and lose immediately. Let's pause.

What do we actually know? Almost nothing. What do we *think* the interviewer probably has in mind? A multi-floor commercial parking lot — that's the canonical version. But "thinking" isn't enough. We must *ask*.

Why is asking better than assuming?

- **Wrong assumption = wasted design time.** If you spend 20 minutes designing for a single-floor lot and they wanted multi-floor, you've burned half the interview on a wrong premise.
- **Asking shows process.** A senior engineer wouldn't start coding without scope. Behaving like a senior engineer is half the evaluation.
- **It elicits hints.** When you ask "should this support multiple floors?", the interviewer's tone might give it away — they may say "yes, definitely" (signal: scale matters) or "let's keep it simple" (signal: don't over-engineer).

So our first move is not to think. It's to ask.

---

## 3. Stage 2 — Clarifying Requirements

A clarification round is structured. We don't fire random questions; we organize them into:

- **Functional requirements** — what does it do?
- **Non-functional requirements** — what qualities does it have?
- **Out of scope** — what we're explicitly *not* doing.

Let's walk through what we'd actually ask, and *why* each question matters.

### Question 1: Single floor or multiple floors?

**Why ask:** Affects the entire structure. Multi-floor means we need a `Floor` entity; single-floor means `ParkingLot` directly holds spots. Conflating them is bad design.

Suppose the interviewer says: *"Multiple — 3 to 5 floors."*

That tells us: `ParkingLot` → `Floor` → `Spot` is going to be our containment hierarchy. We're definitely modeling `Floor` as a first-class concept.

### Question 2: Different vehicle types?

**Why ask:** If everything is a generic "vehicle," our design collapses to a much simpler form. If types differ in how they're parked, priced, or sized, we need polymorphism.

Suppose: *"Yes — bikes, cars, trucks."*

Now we have a hierarchy decision to make later. We've also implicitly learned that **size matters** — bikes, cars, and trucks need different-sized spots. Note this.

### Question 3: How are spots assigned?

**Why ask:** This affects the spot-finding algorithm. Options:
- Any free spot of correct size?
- Closest to entrance?
- Best fit (smallest spot that fits)?

Suppose: *"Best fit — smallest spot that fits the vehicle."*

This is a single-line answer that drives a real algorithm choice. We'll come back to it.

### Question 4: Pricing model?

**Why ask:** Pricing is one of the most varied real-world concerns — flat, hourly, surge, discounts, memberships. If we hardcode it now, we'll regret it.

Suppose: *"Hourly. Different rates for bikes, cars, trucks. Round up to next hour."*

That's enough for v1. The "round up to next hour" is a small but specific detail — note it; we'll implement it precisely.

### Question 5: Multiple gates?

**Why ask:** One entry/exit gate vs many affects concurrency considerations and whether tickets need globally unique IDs.

Suppose: *"Multiple entries and exits."*

We'll keep this in mind. For our single-threaded design we'll mostly ignore it but mention concurrency as an extension.

### Question 6: Display boards?

**Why ask:** Cars circling looking for spots is a real UX problem. Display boards solve it. They're also a great chance to show the Observer pattern — interviewers often want to see this.

Suppose: *"Yes — per floor, showing spots free per size category."*

Excellent. We've now committed ourselves to thinking about how `Floor` notifies a display when its state changes.

### Question 7: Payment methods?

**Why ask:** Payment is its own rabbit hole. We want to scope-bound it.

Suppose: *"Cash and card. But payment gateway integration is out of scope — just track the amount."*

Good — we don't have to model complex payment flows. We just compute and "accept" payment.

### Question 8: Concurrency? Persistence? Scale?

**Why ask:** These are the non-functional requirements that make or break a real system but often slow down an LLD interview if overemphasized.

Suppose: *"Single-threaded is fine. In-memory storage. Mention concurrency as an extension."*

We're cleared to make a clean, in-memory, single-threaded design and discuss the rest at the end.

### Recap to the Interviewer

After the clarification round, **state your understanding back**:

> *"To make sure I have this right: a multi-floor lot (3-5 floors), three vehicle types (bike, car, truck) needing differently-sized spots, best-fit allocation, hourly pricing per vehicle type with round-up, multiple entry/exit gates, per-floor display boards showing free spots, and cash/card payments where the gateway is out of scope. I'll design it single-threaded and in-memory, mentioning concurrency and persistence as extensions. Anyone bit you'd like to add or change?"*

This recap is critical — it forces the interviewer to confirm your scope. If you missed something, they'll add it now. If you over-included something, they'll trim. Either way, you're aligned before writing a single class.

---

## 4. Stage 3 — Identifying Entities (And Rejecting Some)

Now we look at our requirements and pull out **nouns**. Nouns are candidate classes. But not every noun deserves a class — some are attributes, some are external actors, some are too vague.

Let me list everything noun-ish that came up:

- parking lot
- floor
- spot
- vehicle (bike, car, truck)
- entry gate
- exit gate
- ticket
- payment
- pricing
- display board
- driver / customer
- size
- system
- amount
- hours

Now I filter. For each, I ask three questions:

1. **Does it have its own identity?** (i.e., do I need to reference *this specific one* later?)
2. **Does it have its own behavior or state?** (vs being just a value)
3. **Is it part of the domain, or is it just generic infrastructure language?**

Let's apply this:

| Noun | Identity? | Behavior/State? | Verdict |
|---|---|---|---|
| parking lot | Yes | Yes (orchestrates) | **Class** |
| floor | Yes | Yes (holds spots, notifies) | **Class** |
| spot | Yes | Yes (occupied/free) | **Class** |
| vehicle | Yes | Yes (type-specific) | **Class hierarchy** |
| entry gate | Yes (multiple) | Yes (admit) | **Class** |
| exit gate | Yes (multiple) | Yes (process exit) | **Class** |
| ticket | Yes | Yes (entry time, etc.) | **Class** |
| payment | Maybe | Has amount, method | **Probably class** (small) |
| pricing | No identity | Has algorithm | **Strategy/algorithm**, not entity |
| display board | Yes (multiple) | Yes (renders state) | **Class** |
| driver / customer | External actor | We don't model them — they trigger actions | **Not a class** in this design |
| size | No identity | Just a label | **Enum**, not class |
| system | Too vague | — | **Reject** |
| amount | Just a number | — | **Reject** (it's a field) |
| hours | Just a number | — | **Reject** (it's a field) |

Why did we reject "driver / customer"? Because in this scope we don't need to model the customer. They don't log in, don't have accounts, don't have a history we track. They're an *actor* outside the system, not a *thing inside* the system. Adding a `Customer` class with no fields and no methods would be noise.

Could that change? Sure — if the next requirement is "loyalty programs," we'd add `Customer`. But for now, reject. **YAGNI — You Aren't Gonna Need It.**

We've now identified our core classes:

```
ParkingLot, Floor, ParkingSpot, Vehicle (+ Bike, Car, Truck),
EntryGate, ExitGate, Ticket, Payment, DisplayBoard
```

Plus a Strategy: `PricingStrategy` (with implementations).

Plus an Enum: `SpotSize`.

That's our skeleton. Now we design each piece.

---

## 5. Stage 4 — Deciding the Vehicle Hierarchy

This is the first real design decision. Three approaches present themselves; let me lay them out.

### Approach A: Single class with a type field

```python
class Vehicle:
    def __init__(self, plate, type):
        self.plate = plate
        self.type = type   # "bike", "car", "truck"
```

**Pros:**
- Simplest possible.
- One class to maintain.
- Easy to add a new type — just a new string.

**Cons:**
- Behavior that varies by type ends up as `if vehicle.type == "bike":` everywhere. Violates OCP.
- No type safety — what if someone passes `type="crab"`?
- We can't attach type-specific data (e.g., bikes have helmets stored, trucks have permits) without a bag of optional fields.

### Approach B: Inheritance — abstract Vehicle, concrete Bike/Car/Truck

```python
class Vehicle(ABC):
    @property
    @abstractmethod
    def required_size(self) -> SpotSize: ...

class Bike(Vehicle):
    @property
    def required_size(self) -> SpotSize: return SpotSize.SMALL

class Car(Vehicle): ...
class Truck(Vehicle): ...
```

**Pros:**
- Type-specific behavior lives on the type itself. Clean polymorphism.
- New vehicle type → new class. No `if/elif` ladder.
- Type checker can verify usage.
- Can add type-specific fields naturally.

**Cons:**
- More classes upfront.
- Slight ceremony for what may be just "different label."

### Approach C: Composition — Vehicle has a VehicleType object

```python
class VehicleType:
    def __init__(self, name, required_size, base_rate):
        ...

class Vehicle:
    def __init__(self, plate, type: VehicleType):
        self.plate = plate
        self.type = type
```

**Pros:**
- Maximum flexibility — types can be created at runtime, configured externally.
- Adding a new type doesn't require code changes — just data.

**Cons:**
- Loses the "Bike is a kind of Vehicle" semantic from the type system.
- Harder to add type-specific *methods* (would have to dispatch via the VehicleType object).
- Overkill for our scope.

### Decision

I'll go with **Approach B (inheritance)**.

**Reasoning:** The vehicle types in our problem genuinely differ in behavior and properties (size requirement is the obvious one; in real systems they'd differ in pricing too). The set of vehicle types is small and stable (bike/car/truck — we're not constantly adding new types at runtime). Approach B gives us clean polymorphism without unnecessary abstraction.

Approach A would be tempting if we had only the type label and no per-type behavior — but we already have one (`required_size`), and pricing might use it later. Approach C is interesting for systems where types are data-driven (e.g., a CMS), but here it's overengineering.

In the interview, I'd say this aloud:

> *"I'm going with an abstract Vehicle base class and concrete Bike/Car/Truck subclasses. The alternative would be a single class with a type enum, but since vehicles genuinely differ in their required spot size — and possibly more behaviors as the system grows — polymorphism keeps the design open to extension. A composition-based approach (Vehicle has a VehicleType) would be more flexible but feels overkill for three stable types."*

That sentence shows: I considered alternatives, I weighed them, I chose with reasoning. **That sentence is worth more than perfect code.**

### The Code

```python
from abc import ABC, abstractmethod
from enum import Enum


class SpotSize(Enum):
    """
    Discrete spot sizes. The integer values define a natural ordering:
    a larger spot can fit any vehicle that fits in a smaller spot.

    Why an Enum (not strings)?
    - Type safety: you can't pass an arbitrary string by mistake.
    - Comparable via `.value` for the "can fit" check.
    - Self-documenting in IDE autocomplete.
    """
    SMALL = 1   # Fits bikes only
    MEDIUM = 2  # Fits bikes and cars
    LARGE = 3   # Fits bikes, cars, and trucks


class Vehicle(ABC):
    """
    Abstract base for all vehicle types in the lot.

    Design choice:
    - We could have used a single Vehicle class with a type field,
      but each vehicle type has a different `required_size`, and that
      logic belongs on the type itself (polymorphism > conditionals).
    - Subclasses are expected to be small — they exist to declare
      their type-specific properties.

    Adding a new type (e.g., ElectricScooter):
    - Create a new subclass.
    - Override `required_size`.
    - No existing code changes (Open/Closed Principle).
    """

    def __init__(self, license_plate: str):
        # license_plate is the vehicle's identity in our system.
        # In a real system this would also have validation (length, format).
        self.license_plate = license_plate

    @property
    @abstractmethod
    def required_size(self) -> SpotSize:
        """
        The smallest spot size that can hold this vehicle.
        Used by the spot-finding algorithm to filter candidates.
        """
        ...

    def __repr__(self):
        # Useful for logging and debugging.
        return f"{self.__class__.__name__}({self.license_plate})"


class Bike(Vehicle):
    @property
    def required_size(self) -> SpotSize:
        return SpotSize.SMALL


class Car(Vehicle):
    @property
    def required_size(self) -> SpotSize:
        return SpotSize.MEDIUM


class Truck(Vehicle):
    @property
    def required_size(self) -> SpotSize:
        return SpotSize.LARGE
```

Notice the documentation. The class docstring explains *why* we chose this design, not just what the class is. That's the level interviewers reward — and that students learn most from.

Also notice: we kept `Bike`, `Car`, `Truck` empty beyond the property. **They don't need to do anything else right now.** Don't add fields just because "real bikes have helmets." Add when needed.

---

## 6. Stage 5 — Modeling Spots and Sizes

A spot is a fixed physical location in the lot. It has a size. It's either occupied or free. Sometimes a vehicle is in it.

This is dead simple — but there are still decisions to make.

### Decision Point 1: How do we represent occupancy?

**Option A:** Boolean `is_occupied`.
**Option B:** Reference to the vehicle: `vehicle: Optional[Vehicle]`.

A is simpler. B is more useful — if I have a spot, I can ask "what's parked here?", which is needed when we vacate.

Going with **B**. The boolean is implied: `spot.is_free == (spot.vehicle is None)`.

### Decision Point 2: Should "can this vehicle fit?" live on Spot or Vehicle?

**Option A:** `vehicle.fits_in(spot)` — vehicle knows what it fits in.
**Option B:** `spot.can_fit(vehicle)` — spot knows what it can hold.

Both are valid. I lean **B** because:

- The spot is the constraint. The check is naturally phrased "does this *spot* accept this *vehicle*?"
- When iterating spots looking for a fit, the loop reads naturally: `for spot in spots: if spot.can_fit(v): ...`.

### Decision Point 3: Where does the parking transition happen?

When a vehicle parks, several things change: the spot becomes occupied, the vehicle is associated with the spot, and (eventually) the floor needs to know to update its display board. Where does this logic go?

**Option A:** On `ParkingSpot.park(vehicle)` — the spot manages its own state.
**Option B:** On `Floor.park(vehicle, spot)` — the floor manages its child spots.
**Option C:** On `ParkingLot.park(vehicle, floor, spot)` — the lot manages everything top-down.

I'll do **A and B together**: the spot manages its own state (it knows how to be parked-in), and the floor coordinates the *which spot* selection plus notification. The lot just selects which *floor* to try.

This is a layered responsibility: each level handles what it owns.

### The Code

```python
from typing import Optional


class ParkingSpot:
    """
    A single physical parking spot.

    Responsibilities (Single Responsibility Principle):
    - Track its own occupancy.
    - Decide whether a given vehicle fits.
    - Get parked in / vacated.

    NOT its responsibility:
    - Knowing about other spots, floors, or the lot.
    - Pricing.
    - Notifying display boards (that's Floor's job).

    The spot is intentionally "dumb" about its surroundings.
    This keeps it reusable and testable.
    """

    def __init__(self, spot_id: str, size: SpotSize):
        # spot_id is a unique identifier — useful for tickets and logs.
        # We make it human-readable (e.g., "F0-M3" = Floor 0, Medium spot 3).
        self.spot_id = spot_id
        self.size = size

        # The currently parked vehicle, or None if free.
        # Storing the vehicle (vs just a boolean) lets us know
        # who occupies the spot — needed when validating that a
        # vacate request matches the parked vehicle.
        self.vehicle: Optional[Vehicle] = None

    @property
    def is_free(self) -> bool:
        """Convenience boolean for the most-common check."""
        return self.vehicle is None

    def can_fit(self, vehicle: Vehicle) -> bool:
        """
        A spot can fit a vehicle if (1) it's currently free AND
        (2) it's at least as large as the vehicle requires.

        Why compare via .value?
        - SpotSize is an Enum where larger spots have larger integer values.
        - This gives us a natural ordering without writing custom comparators.

        Note: we deliberately include the `is_free` check here so callers
        get a single yes/no answer. If a spot is occupied, it can't fit
        anything new — that's a fact, not two facts.
        """
        return self.is_free and self.size.value >= vehicle.required_size.value

    def park(self, vehicle: Vehicle) -> None:
        """
        Park a vehicle in this spot.

        Raises ValueError if the spot is occupied or the vehicle doesn't fit.
        We raise (rather than returning False) because parking a vehicle
        in an invalid spot is a *bug* in the caller's logic — they should
        have checked `can_fit` first. Loud failure is better than silent.
        """
        if not self.is_free:
            raise ValueError(
                f"Spot {self.spot_id} is already occupied by "
                f"{self.vehicle.license_plate}"
            )
        if not self.can_fit(vehicle):
            raise ValueError(
                f"Vehicle {vehicle.license_plate} (needs {vehicle.required_size.name}) "
                f"doesn't fit in spot {self.spot_id} (size {self.size.name})"
            )
        self.vehicle = vehicle

    def vacate(self) -> Vehicle:
        """
        Free up the spot. Returns the vehicle that was parked
        (useful for logging or further processing).

        Raises ValueError if the spot was already empty — again,
        this is a bug in the caller's logic.
        """
        if self.is_free:
            raise ValueError(f"Spot {self.spot_id} was already empty")
        vehicle = self.vehicle
        self.vehicle = None
        return vehicle

    def __repr__(self):
        status = f"occupied by {self.vehicle.license_plate}" if not self.is_free else "free"
        return f"Spot({self.spot_id}, size={self.size.name}, {status})"
```

A few details worth highlighting:

- **`spot.park(vehicle)` raises on invalid input.** Why not return `False`? Because at this layer, an invalid call is a *programming error*, not a user error. The caller (Floor) is supposed to have validated `can_fit` already. Raising is louder and more debuggable.
- **`vacate()` returns the vehicle.** Why? Because the caller often wants to know who left — perhaps to log it, perhaps to validate the ticket matches. Returning the vehicle costs nothing and adds information.
- **No Floor reference, no DisplayBoard reference.** The spot has zero knowledge of where it lives. This is intentional. If we ever want to reuse `ParkingSpot` in a different system, we can.

---

## 7. Stage 6 — Modeling Floors and the Spot-Finding Logic

A floor holds spots. Its job is to find a spot for a parking vehicle, and to know the total state of its spots (so display boards can show counts).

### Decision Point 1: How does Floor find a spot?

Several algorithms are reasonable. Let's enumerate them.

**Option A — First-fit:** loop through spots, return the first that can fit.

```python
for spot in self.spots:
    if spot.can_fit(vehicle):
        return spot
```

Simple. Fast. But may leave large spots filled with bikes — wasting capacity.

**Option B — Best-fit:** find the smallest spot that can fit.

```python
candidates = [s for s in self.spots if s.can_fit(vehicle)]
return min(candidates, key=lambda s: s.size.value, default=None)
```

Optimal in terms of spot utilization. Slightly more work (iterates whole list).

**Option C — Best-fit by data structure:** maintain a sorted multiset of free spots per size, pop the smallest that fits.

```python
# Pre-sort by size, then pop best match
```

Most efficient. But complicates the design — now we have to maintain consistency between the spots list and the sorted structure.

### Decision

The interviewer told us **best-fit**. So that's the algorithm. Between B and C, I pick **B**.

**Why?** For interview-scope numbers (a few hundred spots per floor), iterating the full list is microseconds. The complexity of maintaining a sorted structure isn't justified. If we later learn the lot has 100,000 spots and parking happens at 10,000/sec, we'd switch to C.

**This is a tradeoff worth verbalizing in interview**: *"I'm using a linear scan for best-fit. It's O(n) per parking event. For lots of even thousands of spots, that's fast enough. If we needed millions of spots or extreme throughput, I'd maintain free-spot pools indexed by size — but that adds bookkeeping complexity that's not worth it here."*

### Decision Point 2: What does Floor return?

If a spot is found, return it. If not, return `None`.

We could raise an exception ("LotFullError"), but a full floor is *not* an error — it's an expected normal outcome. Exceptions for control flow is an anti-pattern. Returning `Optional[ParkingSpot]` is the right choice.

### The Code

```python
class Floor:
    """
    A single floor of the parking lot.

    Responsibilities:
    - Hold a fixed set of ParkingSpots.
    - Find a free spot that fits a given vehicle (best-fit algorithm).
    - Coordinate park/vacate calls to its spots.
    - Notify observers (e.g., DisplayBoard) when its state changes.

    Notice we delegate the actual occupancy management to ParkingSpot.
    Floor doesn't directly mutate spot.vehicle — it asks the spot to
    park itself or vacate itself. This keeps the SRP boundary clean.
    """

    def __init__(self, floor_number: int, spots: list[ParkingSpot]):
        self.floor_number = floor_number
        self.spots = spots

        # Observers (DisplayBoards, alerters, etc.) registered with this floor.
        # We use a plain list for simplicity; a set would prevent duplicates
        # but we don't expect duplicates in normal use.
        self._observers: list["FloorObserver"] = []

    def attach(self, observer: "FloorObserver") -> None:
        """Register an observer to receive update notifications."""
        self._observers.append(observer)

    def detach(self, observer: "FloorObserver") -> None:
        """Unregister an observer. Useful for tests and dynamic UIs."""
        self._observers.remove(observer)

    def _notify(self) -> None:
        """
        Internal: tell all observers this floor's state changed.
        Called after every park/vacate. We don't pass any data —
        observers can pull what they need from the floor.

        This is the "pull" variant of Observer (vs push). We chose pull
        because different observers want different things — display boards
        want counts; an alert system might want individual events.
        Pushing one common payload would be less flexible.
        """
        for observer in self._observers:
            observer.update(self)

    def find_free_spot(self, vehicle: Vehicle) -> Optional[ParkingSpot]:
        """
        Find the smallest free spot that can hold the vehicle.

        Algorithm: linear scan + min().
        Time: O(n) where n is spots on this floor.

        Returns the spot if found, else None (floor full for this size).

        Design note: we don't reserve or mutate anything here. Just find.
        Mutation happens in `park`. This separation makes the function
        side-effect-free and trivially testable.
        """
        # Filter to candidate spots.
        candidates = [s for s in self.spots if s.can_fit(vehicle)]

        if not candidates:
            return None

        # Best-fit: pick the smallest that fits.
        # `min` with a key is idiomatic and clear in Python.
        return min(candidates, key=lambda s: s.size.value)

    def park(self, vehicle: Vehicle) -> Optional[ParkingSpot]:
        """
        Find and occupy a spot for the vehicle.

        Returns the spot used, or None if no spot was available.

        Notice the two-step structure: find then park. This deliberately
        mirrors the way a real driver thinks ("I need to find a spot,
        then drive into it"). It also means find_free_spot is safely
        callable for "is there room?" queries without actually parking.
        """
        spot = self.find_free_spot(vehicle)
        if spot is None:
            return None

        spot.park(vehicle)   # Spot does its own validation
        self._notify()       # Tell observers state changed
        return spot

    def vacate(self, spot: ParkingSpot) -> Vehicle:
        """
        Free up a previously occupied spot.

        Returns the vehicle that was parked (handy for the caller
        to confirm it matches the ticket).

        We trust the caller to pass a spot that belongs to this floor.
        We could validate (`assert spot in self.spots`) but for an
        interview-scope design, the trust boundary is acceptable.
        """
        vehicle = spot.vacate()
        self._notify()
        return vehicle

    def free_spots_by_size(self) -> dict[SpotSize, int]:
        """
        Aggregate count of free spots per size category.
        This is what DisplayBoard renders.

        We compute on-demand rather than maintaining a counter,
        because:
        (a) For interview-scale numbers, the loop is negligible.
        (b) An incrementally-updated counter is one more state to keep
            consistent — and one more chance to bug.

        For very large floors, we'd cache and incrementally update.
        """
        # Initialize all sizes to 0 so the result has every key,
        # even if some sizes have no free spots.
        counts = {size: 0 for size in SpotSize}
        for spot in self.spots:
            if spot.is_free:
                counts[spot.size] += 1
        return counts

    def __repr__(self):
        return f"Floor({self.floor_number}, {len(self.spots)} spots)"
```

A note on the observer pattern here: I introduced `_observers` and `_notify()` even though we haven't yet defined `FloorObserver`. That's fine — we know it's coming, and the structure is clean. In an interview, I'd code it this way and verbally say *"I'll define the FloorObserver interface next."*

---

## 8. Stage 7 — Tickets, Gates, and the Park/Exit Flow

Now we need the entry-exit flow. Let's reason about who does what.

### Who creates the ticket?

Three options:

**Option A:** The `Vehicle` creates its own ticket.
**Option B:** The `EntryGate` creates the ticket.
**Option C:** The `ParkingLot` creates the ticket.

A is wrong — the vehicle is just a thing in the world; it shouldn't know about the lot's data structures.

B and C are both reasonable. C is more centralized (lot owns ticket creation). B is more distributed (gate handles the front-of-house).

I'll pick **C — `ParkingLot.park()` creates and returns the ticket**, and the gate calls into it.

**Why:** The lot is the authority on tickets — it tracks the active set and handles uniqueness. The gate is just the user-facing actor that triggers the operation. Putting ticket creation on the gate would force every gate instance to know how to construct unique IDs, which feels like leaking state.

### What goes on the ticket?

A ticket needs enough information to:
- Identify itself uniquely (so a customer can present it later).
- Refer to the vehicle (so we can validate at exit).
- Refer to the spot (so we know what to free).
- Record the entry time (so we can compute duration).
- Record the exit time + amount once paid (for the receipt).

I'd model it as a dataclass — it's mostly data, very little behavior.

### What does the gate do?

In our scope, the **EntryGate** is a thin wrapper that takes a vehicle and asks the lot to park it. It exists mainly to model "where the user interacts." The interesting logic lives in the lot.

The **ExitGate** is slightly more interesting: it takes a ticket, asks the lot to compute the bill (via the pricing strategy), accepts payment, and tells the lot to free the spot.

### The Code

```python
from datetime import datetime
import uuid
from dataclasses import dataclass, field


@dataclass
class Ticket:
    """
    A receipt issued at entry, redeemed at exit.

    Why a dataclass?
    - This is mostly data with very little behavior.
    - @dataclass auto-generates __init__, __repr__, and __eq__,
      saving us boilerplate while keeping the class explicit.
    - Easy to extend later (add a `customer_phone` field, etc.).

    Fields:
    - id: unique identifier; we use a short UUID slice for readability
          in logs. In production we'd use a cryptographically unique ID
          to prevent ticket forgery.
    - vehicle, spot, floor_number: identifies what was parked where.
    - entry_time: set at issuance; used to compute duration.
    - exit_time, amount_paid: filled in at exit.
    """
    vehicle: Vehicle
    spot: ParkingSpot
    floor_number: int
    entry_time: datetime = field(default_factory=datetime.now)
    exit_time: Optional[datetime] = None
    amount_paid: Optional[float] = None
    # Use a default_factory so each ticket gets its own unique ID.
    # Generating it inline (e.g., id: str = str(uuid.uuid4())) would
    # share the same ID across all instances — a classic Python gotcha.
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
```

A subtle but important detail: `field(default_factory=...)` for the ID. If we'd written `id: str = str(uuid.uuid4())[:8]`, Python would evaluate the expression *once at class definition time* and every ticket would get the same ID. Using `default_factory` ensures each instance gets a fresh value.

Now the gates:

```python
class EntryGate:
    """
    A physical entry point to the lot.

    Responsibility: take a vehicle, ask the lot to park it,
    and hand back a ticket (or signal "lot is full").

    Why have a gate class at all (rather than calling lot.park directly)?
    - Models the real-world topology (multiple gates exist).
    - Provides a place to add gate-specific concerns later
      (e.g., gate-specific logging, "is this gate operational?").
    - Lets us count entries per gate for analytics.

    Right now the class is tiny. That's fine. Don't add fields/methods
    speculatively; add when needed.
    """

    def __init__(self, gate_id: str, lot: "ParkingLot"):
        self.gate_id = gate_id
        self.lot = lot

    def admit(self, vehicle: Vehicle) -> Optional[Ticket]:
        """
        Admit a vehicle and issue a ticket.
        Returns None if the lot has no space for this vehicle.

        We deliberately let the lot decide. The gate doesn't iterate
        floors itself — that's not the gate's job.
        """
        ticket = self.lot.park(vehicle)
        if ticket is None:
            print(f"[Gate {self.gate_id}] Sorry, no space for {vehicle}")
        else:
            print(f"[Gate {self.gate_id}] Issued ticket {ticket.id} to {vehicle}")
        return ticket


class ExitGate:
    """
    A physical exit point.

    Responsibility:
    - Accept a ticket.
    - Compute the amount due (via pricing strategy).
    - Accept payment (in this scope, we just record it).
    - Tell the lot to free the spot.

    Why does the ExitGate hold a PricingStrategy reference rather than
    having the ParkingLot know about pricing?
    - In real lots, different exits could in principle apply different
      pricing (e.g., a VIP exit). Keeping pricing on the gate models that.
    - More importantly, it gives us a clean spot to demonstrate Strategy:
      gate.pricing is injected, easy to swap.

    A reasonable alternative: put pricing on the ParkingLot. Both work.
    The gate placement happens to be a bit more flexible.
    """

    def __init__(self, gate_id: str, lot: "ParkingLot", pricing: "PricingStrategy"):
        self.gate_id = gate_id
        self.lot = lot
        self.pricing = pricing

    def process(self, ticket: Ticket) -> float:
        """
        Process an exit:
        1. Stamp exit time.
        2. Compute the bill via the injected pricing strategy.
        3. Record payment (in this scope, just amount; gateway is out of scope).
        4. Tell the lot to free the spot.

        Returns the amount charged.

        We're combining "compute" and "process payment" into one method
        for simplicity. In a richer design you'd separate them so the
        customer could see the bill before confirming payment.
        """
        # Stamp the exit time so the pricing has the duration.
        ticket.exit_time = datetime.now()

        # Pricing is pluggable — could be HourlyPricing, FlatRatePricing, etc.
        amount = self.pricing.calculate(ticket)
        ticket.amount_paid = amount

        # Tell the lot to release the spot. We pass the whole ticket
        # because the lot needs the spot reference; and there's value
        # in passing the full context for logging/auditing.
        self.lot.vacate(ticket)

        print(f"[Gate {self.gate_id}] Ticket {ticket.id} closed. "
              f"Amount: ₹{amount:.2f}")
        return amount
```

---

## 9. Stage 8 — Pricing as a Strategy

This is one of the most critical design moments. Pricing is *exactly* the kind of thing that varies — and it's exactly the kind of thing that, if hardcoded, becomes the source of the worst kind of technical debt.

### Why Strategy?

Imagine we hardcode pricing inside `ExitGate.process`:

```python
# DON'T DO THIS
def process(self, ticket):
    duration_hours = ...
    if isinstance(ticket.vehicle, Bike):
        amount = 10 * duration_hours
    elif isinstance(ticket.vehicle, Car):
        amount = 30 * duration_hours
    elif isinstance(ticket.vehicle, Truck):
        amount = 60 * duration_hours
    ...
```

Now: what happens when marketing wants happy-hour pricing on Tuesdays? Or weekend rates? Or a flat fee for short stays? Or surge pricing? Or VIP discounts? Or membership rates?

Each new requirement = modifying `ExitGate`. `ExitGate` becomes the source of all pricing change. Every change risks breaking existing pricing. Tests multiply. Bugs ship.

Instead: extract pricing as a **Strategy**. The exit gate doesn't *know* about pricing rules — it just calls `self.pricing.calculate(ticket)`. The strategy implementation can be swapped, configured, decorated.

### Defining the Interface

What does a pricing strategy need?

- **Input:** a Ticket (which contains entry time, exit time, vehicle, spot).
- **Output:** a float (the amount to charge).

That's the entire interface. Let's not pollute it with extra params we might need someday. **YAGNI.**

### Concrete Strategies

We were told: hourly pricing, different rates per vehicle type, round up to next hour.

Let's implement that, and one alternative (flat rate) to demonstrate the value of Strategy.

### The Code

```python
from abc import ABC, abstractmethod
import math


class PricingStrategy(ABC):
    """
    The contract for all pricing algorithms.

    Why an abstract base class?
    - Enforces that all concrete strategies implement `calculate`.
    - Acts as the type for dependency injection (ExitGate depends
      on this abstraction, satisfying the Dependency Inversion Principle).
    - Documents the expected behavior in one place.

    Adding a new pricing rule = subclass + override calculate().
    No existing strategy or any caller changes (Open/Closed Principle).
    """

    @abstractmethod
    def calculate(self, ticket: Ticket) -> float:
        """
        Compute the amount due for a ticket whose exit_time is set.

        Strategies are pure functions of the ticket — they don't mutate
        anything. This makes them trivial to unit test (no setup, no DB).
        """
        ...


class HourlyPricing(PricingStrategy):
    """
    Charge per started hour, with rates depending on vehicle type.

    "Per started hour" means we round duration UP to the nearest hour:
    a 2-hour-and-1-minute stay is charged for 3 hours. This is a common
    real-world policy (parking lots monetize partial hours).

    The rates table is a class attribute because:
    - It's shared across all instances of HourlyPricing.
    - It's effectively configuration — the algorithm is "multiply hours
      by per-vehicle rate," and the rates are the parameters.

    To support per-lot rate variation, we could pass rates to __init__
    instead. Showing the simplest version here.
    """

    # Rates in rupees per started hour, keyed by Vehicle subclass.
    # We use the class itself as the key (vs a string) so we get
    # type safety and IDE autocomplete.
    RATES: dict[type, float] = {
        Bike: 10.0,
        Car: 30.0,
        Truck: 60.0,
    }

    def calculate(self, ticket: Ticket) -> float:
        # Pricing requires the ticket to be stamped on exit.
        # If exit_time is None, we have a bug — fail loudly.
        if ticket.exit_time is None:
            raise ValueError("Cannot price an unfinished ticket (no exit_time)")

        # Compute duration in hours (as a float).
        duration_seconds = (ticket.exit_time - ticket.entry_time).total_seconds()
        duration_hours = duration_seconds / 3600

        # Round UP to the next started hour.
        # math.ceil(0.0) is 0 — but a parking event always charges
        # at least 1 hour, so we max with 1 to enforce that floor.
        # (Alternative: charge nothing for stays under N minutes.
        #  We can add that as a different strategy later.)
        billable_hours = max(1, math.ceil(duration_hours))

        # Look up rate by the vehicle's actual class.
        # If we ever add a Vehicle subtype without updating RATES,
        # this will KeyError — which is the right failure mode
        # (loud, immediate, easy to fix).
        vehicle_class = type(ticket.vehicle)
        rate = self.RATES[vehicle_class]

        return rate * billable_hours


class FlatRatePricing(PricingStrategy):
    """
    Single flat fee per vehicle type, regardless of duration.

    Useful for special promotions ("flat ₹100 for any stay today").
    Demonstrates the strategy pattern by being structurally different
    from HourlyPricing while honoring the same interface.
    """

    RATES: dict[type, float] = {
        Bike: 50.0,
        Car: 150.0,
        Truck: 300.0,
    }

    def calculate(self, ticket: Ticket) -> float:
        if ticket.exit_time is None:
            raise ValueError("Cannot price an unfinished ticket")
        return self.RATES[type(ticket.vehicle)]
```

Now in the interview, I'd articulate:

> *"I'm extracting pricing as a Strategy because pricing is the most volatile part of any commercial parking system. Hourly rates change, surge gets added, promotions come and go. By isolating it behind an interface, every new pricing rule is a new class — no existing code changes. The ExitGate depends on the abstract PricingStrategy, so I can swap implementations at construction time. This also makes pricing trivially unit-testable: it's a pure function from ticket to float."*

That's a Strategy justification with three angles: business motivation (pricing changes), technical motivation (OCP), and engineering payoff (testability).

---

## 10. Stage 9 — Display Boards and the Observer Decision

Customers driving in want to know "is the lot full? Where do I look?" — that's what display boards solve.

### Why Observer (and not just polling)?

There are two ways to keep a display in sync with floor state:

**Option A — Polling:** the display, on its own clock, asks "hey floor, what's free?" every N seconds.

**Option B — Observer (push):** the floor notifies the display whenever its state changes.

Both work. Observer is generally preferred because:

- **Updates are immediate**, not delayed by the polling interval.
- **No wasted work** when nothing has changed. (Polling burns cycles even when state is static.)
- **The floor is the source of truth and it knows when state changed** — let it tell others.

Polling has its place — when the source can't notify (legacy system, polling-only API, distributed system without a message bus). For our in-process, single-threaded design, Observer is clearly better.

### What does the Observer interface look like?

We have one signal — *"floor state changed"* — and we want to keep observers loosely coupled to the floor. So:

```python
class FloorObserver(ABC):
    @abstractmethod
    def update(self, floor: Floor) -> None: ...
```

The observer just gets the floor reference and pulls what it wants. We discussed earlier that this "pull" style is more flexible than push (where the floor would have to know what every observer needs).

### What goes on the DisplayBoard?

The board's job: when notified, render the current free counts.

That's it. It doesn't store history; it doesn't decide layout. In a real system there'd be a UI layer; in our LLD scope, "render" means "print to console."

### The Code

```python
class FloorObserver(ABC):
    """
    Anything that wants to react to changes in a Floor's occupancy.

    By depending on this interface (not on Floor or DisplayBoard
    concrete classes), Floor stays decoupled from its observers.
    We could add EmailAlertObserver, MetricsObserver, etc., without
    touching Floor.
    """

    @abstractmethod
    def update(self, floor: Floor) -> None:
        """Called by Floor whenever its occupancy state changes."""
        ...


class DisplayBoard(FloorObserver):
    """
    Shows real-time free-spot counts for one floor, broken down by size.

    This is intentionally minimal — it just prints. In a real system
    this would push data to a physical LED display, a web dashboard,
    or a Kafka topic. The pattern is the same: react to the update.
    """

    def __init__(self, label: str = ""):
        # An optional label so a viewer (or a log reader) can tell
        # which board is which.
        self.label = label

    def update(self, floor: Floor) -> None:
        # Pull what we need from the floor.
        # We do this on every update; for a board that displays counts,
        # that's exactly right.
        counts = floor.free_spots_by_size()

        # Render. The format string is chosen for readability in logs.
        # In production this would write to whatever display backend.
        prefix = f"[{self.label}] " if self.label else ""
        print(
            f"{prefix}Floor {floor.floor_number} free → "
            f"Small: {counts[SpotSize.SMALL]}, "
            f"Medium: {counts[SpotSize.MEDIUM]}, "
            f"Large: {counts[SpotSize.LARGE]}"
        )
```

Notice how small `DisplayBoard` is. That's a *good* sign — it has a single, well-scoped responsibility. Its size says "this class does one thing." If it grew to 200 lines, that would be a smell.

---

## 11. Stage 10 — Putting It All Together

Now we need the top-level coordinator: `ParkingLot`.

### What should `ParkingLot` know?

- Its floors (it owns them).
- The active tickets (so we can look them up at exit).

### What should `ParkingLot` not know?

- About display boards (those are observers attached to floors).
- About pricing (that lives in the exit gate's strategy).
- About payment processing (out of scope).

This restraint — knowing only what we need — is what keeps the lot from becoming a god class.

### The Core Methods

`ParkingLot` needs two main operations:

1. `park(vehicle) → Optional[Ticket]` — find a floor with space, park there, issue a ticket.
2. `vacate(ticket)` — free the spot referenced by the ticket.

Both delegate the real work to `Floor`. The lot's own logic is just orchestration.

### Decision Point: How do we pick which floor to try?

When a vehicle arrives, we have multiple floors. Where do we send it?

**Option A:** Try floors in order (0, 1, 2, ...). Simplest.
**Option B:** Try the floor with the most free space first. Spreads load.
**Option C:** Try the lowest floor first if vehicle is large; ground floor is easier to drive into. Encodes domain knowledge.

For our scope, **Option A is fine**. The interviewer didn't specify. Verbalize this:

> *"I'm trying floors in order. We could prefer floors with most free space, or have type-specific routing (heavy vehicles to ground floor), but the requirements didn't call for that. I'll mention it as an extension."*

### The Code

```python
class ParkingLot:
    """
    The top-level entity that orchestrates parking and exit operations.

    Responsibilities:
    - Own the collection of floors.
    - Find a floor that can accommodate a vehicle (delegates to floors).
    - Track active tickets (so we can vacate by ticket).

    Explicitly NOT responsible for:
    - Pricing (handled by ExitGate's PricingStrategy).
    - Display (handled by DisplayBoards observing floors).
    - Payment processing (out of scope).
    - User/customer modeling (no Customer entity in this design).

    By keeping the lot focused on orchestration, we avoid the classic
    "god class" anti-pattern.
    """

    def __init__(self, floors: list[Floor]):
        if not floors:
            raise ValueError("ParkingLot must have at least one floor")
        self.floors = floors

        # Map of ticket_id -> Ticket. Lets us look up a ticket
        # quickly at exit. dict gives O(1) lookup.
        self.active_tickets: dict[str, Ticket] = {}

    def park(self, vehicle: Vehicle) -> Optional[Ticket]:
        """
        Try each floor in order. The first one with space wins.

        Returns the issued Ticket, or None if every floor is full
        (for this vehicle's required spot size).

        Why try floors in order rather than picking the "best" floor?
        - It's simple and deterministic.
        - For interview scope, the requirements don't dictate a preference.
        - Smarter routing (most-free-first, or size-aware routing) can
          be added later without changing this method's signature.
        """
        for floor in self.floors:
            spot = floor.park(vehicle)
            if spot is not None:
                # Found space. Build and store the ticket.
                ticket = Ticket(
                    vehicle=vehicle,
                    spot=spot,
                    floor_number=floor.floor_number,
                )
                self.active_tickets[ticket.id] = ticket
                return ticket

        # All floors full for this vehicle's size category.
        return None

    def vacate(self, ticket: Ticket) -> None:
        """
        Free the spot associated with this ticket and remove
        the ticket from the active set.

        We trust the caller has already computed payment and stamped
        exit_time on the ticket. The lot's job is just spot release.
        """
        # Look up the floor by floor_number.
        # We use direct indexing because floor_number is the floor's index.
        # (If floor numbers weren't 0-based or sequential, we'd use a dict.)
        floor = self.floors[ticket.floor_number]
        floor.vacate(ticket.spot)

        # Remove from active set. .pop with a default avoids KeyError
        # if vacate is called twice for the same ticket — defensive
        # but cheap.
        self.active_tickets.pop(ticket.id, None)
```

### A Helper to Build a Demo Lot

For the demo, we want a small but realistic lot. Let's add a builder helper:

```python
def build_sample_lot(num_floors: int = 3) -> ParkingLot:
    """
    Construct a sample lot: `num_floors` floors, each with
    5 small, 10 medium, and 3 large spots, with a DisplayBoard attached.

    This is a convenience for demos and tests — not part of the
    core design. In a real system, lot configuration would come
    from a config file or database.
    """
    floors = []
    for floor_num in range(num_floors):
        # Build the spots for this floor.
        spots = []
        spots += [
            ParkingSpot(f"F{floor_num}-S{i}", SpotSize.SMALL)
            for i in range(5)
        ]
        spots += [
            ParkingSpot(f"F{floor_num}-M{i}", SpotSize.MEDIUM)
            for i in range(10)
        ]
        spots += [
            ParkingSpot(f"F{floor_num}-L{i}", SpotSize.LARGE)
            for i in range(3)
        ]

        floor = Floor(floor_num, spots)
        floor.attach(DisplayBoard(label=f"Display-F{floor_num}"))
        floors.append(floor)

    return ParkingLot(floors)
```

---

## 12. Stage 11 — Validating with a Mental Walkthrough

Before declaring victory, we run the design through a realistic scenario. This is not optional. **Almost every interview design has a bug that surfaces only when you walk through it.**

### Scenario: A typical day

> A bike, a car, and a truck arrive in that order. They each park, stay for varying times, then leave.

Let's walk through it step by step.

```python
# Setup
lot = build_sample_lot(num_floors=2)
entry = EntryGate("E1", lot)
exit_gate = ExitGate("X1", lot, HourlyPricing())

# 1. Bike arrives
bike = Bike("KA-01-B-1234")
ticket1 = entry.admit(bike)
```

Trace through:
- `entry.admit(bike)` → `lot.park(bike)`.
- `lot.park(bike)` loops floors. Floor 0: `floor.park(bike)`.
- `floor.park(bike)` → `find_free_spot(bike)`. Candidates: 5 SMALL, 10 MEDIUM, 3 LARGE all free, all can fit a bike. Best fit = SMALL. Picks `F0-S0`.
- `spot.park(bike)` succeeds. `floor._notify()` → DisplayBoard prints updated counts.
- Floor returns the spot. Lot creates a ticket, stores it, returns it.
- Gate prints "Issued ticket ... to Bike(...)".

✓ Works. Bike got a SMALL spot (best-fit), as required.

```python
# 2. Car arrives
car = Car("KA-01-C-5678")
ticket2 = entry.admit(car)
```

- Car needs MEDIUM. Candidates: 10 MEDIUM + 3 LARGE. Best fit = MEDIUM. Picks `F0-M0`.

✓ Works.

```python
# 3. Truck arrives
truck = Truck("KA-01-T-9999")
ticket3 = entry.admit(truck)
```

- Truck needs LARGE. Only 3 LARGE spots fit. Picks `F0-L0`.

✓ Works.

```python
# 4. Bike leaves after some time
import time; time.sleep(0.05)   # simulate elapsed time
amount1 = exit_gate.process(ticket1)
```

- Ticket1's exit_time set to now.
- `pricing.calculate(ticket1)` → duration ≈ 0.05s ≈ 0.0000139 hours. `math.ceil(0.0000139)` = 1. Rate for Bike = 10. Amount = 10.
- `lot.vacate(ticket1)` → floor 0 vacates spot F0-S0. DisplayBoard prints. Ticket removed from active set.

✓ Works. Amount is ₹10 (one hour minimum).

### Edge Cases — Where Designs Usually Break

Let's consider what happens in less happy scenarios.

**Edge case 1: Lot is full.**

```python
# Fill all SMALL spots on floor 0.
for i in range(5):
    entry.admit(Bike(f"BIKE-{i}"))
# Floor 0 has 0 small spots free. But MEDIUM is still free, and a bike
# fits in MEDIUM. So our 6th bike should get a MEDIUM spot.
ticket6 = entry.admit(Bike("BIKE-6"))
# ticket6 is non-None — Floor 0 had MEDIUM spots; bike went into one.
```

✓ Best-fit means a bike gets a small spot when available, but happily takes a medium spot when small ones are full. Correct behavior.

**Edge case 2: A vehicle requests a size for which no spot exists anywhere.**

Say all LARGE spots across all floors are taken. A second truck arrives.

- Floor 0: `find_free_spot(truck)` → no candidates (no free LARGE). Returns None.
- Floor 1: same. Returns None.
- Lot.park returns None.
- Gate prints "Sorry, no space."

✓ Correct.

**Edge case 3: Customer presents a ticket twice.**

After exiting, the customer (somehow) presents the same ticket at another exit gate.

- `exit_gate.process(ticket1)` — ticket1.exit_time is already set; pricing computes again, re-vacates a spot that's no longer occupied.
- `floor.vacate(spot)` → `spot.vacate()` raises ValueError ("already empty").

So we'd get a noisy error. **Is that OK?** For our scope, yes — re-presenting a ticket *is* an error. We'd want explicit handling in production (e.g., reject already-paid tickets) but mentioning it as an extension is appropriate.

In an interview, you'd say:

> *"I see one weakness: re-presenting a paid ticket would currently raise. In production, ExitGate.process should first check if `ticket.exit_time` is already set and refuse early with a clear message. I'd add that as a small refinement."*

That kind of self-critique scores points.

**Edge case 4: Display board observer was never attached.**

A floor with no observers — `_notify` iterates an empty list. No error. No notifications. Correct.

✓ Defensive design holds.

**Edge case 5: ParkingLot constructed with no floors.**

We added `if not floors: raise ValueError(...)` in `__init__`. Catches this immediately, with a clear message.

✓ Defensive design holds.

### Walkthrough Summary

We've validated the happy path and several edge cases. We found one minor issue (re-presenting a ticket) and noted it as a follow-up. The design behaves correctly for everything we've thrown at it.

**This walkthrough is what separates "I wrote some classes" from "I designed a system."** Always do it in the interview, even briefly.

---

## 13. Stage 12 — Anticipating Follow-Up Questions

Interviewers love to extend the problem. Here are the questions they're most likely to ask, with thought-out answers.

### Q: "How would you handle multiple gates parking simultaneously?"

This is the classic concurrency question. With our current design:

- Two threads could both call `lot.park(vehicle)` at the same time.
- Both could reach `floor.find_free_spot(vehicle)` and select the same spot.
- Both call `spot.park(vehicle)`. The second one raises ("already occupied") — but the first thread has already taken the spot, so we have a customer inside who got an error.

**Fix options:**

1. **Lock on the floor.** Each `Floor.park` acquires a mutex. Simple, correct, but bottlenecks all parking on a floor. Fine for hundreds of cars; not for thousands per second.

2. **Optimistic locking on the spot.** `spot.park(vehicle)` becomes atomic via a CAS (compare-and-swap). Each `find_free_spot` returns a candidate; the actual `park` retries on conflict. More throughput.

3. **Per-size queues.** Maintain free-spot pools per size. Multiple parkers atomically pop. Highest throughput but most complex.

For an interview, I'd say:

> *"I'd start with a per-floor lock. It's simple and correct. If we needed higher concurrency, I'd move to atomic spot acquisition — but I wouldn't add that complexity unless we measured contention as a real problem."*

### Q: "What about reserved spots — handicapped, electric, VIP?"

Add an optional `reserved_for` attribute on `ParkingSpot`. `can_fit` extends to check this:

```python
def can_fit(self, vehicle: Vehicle) -> bool:
    if not self.is_free: return False
    if self.size.value < vehicle.required_size.value: return False
    if self.reserved_for is not None and not self.reserved_for(vehicle):
        return False
    return True
```

Where `reserved_for` is a callable like `lambda v: v.is_electric` or `lambda v: v.has_handicap_permit`. This is the **Strategy pattern at the spot level** — predicate-based reservation.

### Q: "How would you support different pricing on weekends or holidays?"

Two clean approaches:

**Approach 1: Composite pricing.** A `WeekendMultiplier` decorator wraps another pricing strategy and applies a multiplier on weekends.

```python
class WeekendMultiplier(PricingStrategy):
    def __init__(self, base: PricingStrategy, multiplier: float = 1.5):
        self.base = base
        self.multiplier = multiplier
    def calculate(self, ticket):
        base_amount = self.base.calculate(ticket)
        if ticket.entry_time.weekday() >= 5:
            return base_amount * self.multiplier
        return base_amount
```

Now `ExitGate(lot, WeekendMultiplier(HourlyPricing()))` does the right thing. **Decorator pattern**, layered on Strategy. Beautifully composable.

**Approach 2: A new strategy class.** `WeekendAwareHourlyPricing` directly. Less flexible but simpler.

I'd prefer Approach 1 because it composes — you can stack `HolidayMultiplier`, `WeekendMultiplier`, `MemberDiscount`, etc.

### Q: "What if the lot has 100,000 spots?"

Our linear scans become noticeable. Mitigations:

- **Per-size free-spot pools.** Each floor maintains a heap or sorted set per size. `find_free_spot` becomes O(log n) instead of O(n).
- **Per-floor counters.** Maintain `free_count_by_size` incrementally on park/vacate. `free_spots_by_size` becomes O(1) instead of O(n).

I wouldn't pre-build these for an interview. I'd describe them as "if profiling showed contention here, this is how I'd evolve."

### Q: "How would you persist this?"

Introduce a `Repository` layer:

```python
class TicketRepository(ABC):
    @abstractmethod
    def save(self, ticket: Ticket): ...
    @abstractmethod
    def find(self, ticket_id: str) -> Optional[Ticket]: ...

class InMemoryTicketRepository(TicketRepository): ...
class SQLTicketRepository(TicketRepository): ...
```

`ParkingLot` depends on `TicketRepository` (DIP) instead of holding `active_tickets` directly. Now we can plug in real persistence without touching lot logic.

### Q: "How would you test this?"

The design is *very* testable because of dependency injection:

- **Strategies are pure functions of input.** `HourlyPricing().calculate(test_ticket)` — no setup needed.
- **Spot, Floor, Lot are independent units.** Unit-test each in isolation.
- **DisplayBoard is replaceable** — write a `RecordingObserver` that captures updates as a list, assert on its contents.
- **No external dependencies (DB, network).** Pure Python, fast tests.

A typical test:

```python
def test_best_fit_picks_smallest_spot():
    spots = [
        ParkingSpot("a", SpotSize.LARGE),
        ParkingSpot("b", SpotSize.MEDIUM),  # Best fit for a Car
        ParkingSpot("c", SpotSize.LARGE),
    ]
    floor = Floor(0, spots)
    spot = floor.park(Car("X-1"))
    assert spot.spot_id == "b"
```

---

## 14. Final Reflection — What This Problem Teaches

If you've read this far, you've seen something more important than a parking lot design. You've seen the *texture* of how to think through an LLD problem.

Let's distill the meta-lessons.

### Lesson 1: Design Decisions Have Reasons. State Them.

At every junction, we considered alternatives and picked one with reasoning. This:

- Demonstrates engineering maturity.
- Catches bad ideas early (sometimes the discarded alternative reveals a flaw).
- Communicates clearly with the interviewer.

The phrase *"I'm doing X because Y, considered Z but rejected it because..."* is your most powerful interview tool.

### Lesson 2: Defer, Don't Pre-Solve

We didn't add `Customer`. We didn't add reserved spots. We didn't add concurrency. We didn't add weekend pricing. **We added them as we needed them, and not before.**

The temptation to "design for everything" is the road to over-engineering. Solve what's in scope; mention extensions; don't build them.

### Lesson 3: Boundaries Matter More Than Code

The reason `ParkingSpot` knows nothing about `Floor`, and `Floor` knows nothing about `DisplayBoard` directly (only through the `FloorObserver` interface), is **deliberate**. These boundaries are what let us evolve the system later. Without them, every change ripples.

The boundaries are the design. The code is just notation.

### Lesson 4: Patterns Are Tools, Not Trophies

We used three classical patterns: **Strategy** (pricing), **Observer** (display boards), **Factory** (the helper builder, sort of). Each was chosen because it solved a specific problem we faced — not because we wanted to "demonstrate patterns."

The interviewer wants to see you reach for the right pattern at the right moment, not pile patterns on. Our pricing-as-Strategy is a perfect example: the alternative (hardcoded if-elif) was clearly worse, so Strategy *deserves* to be there.

### Lesson 5: Walk Through Your Design Before You Trust It

The validation walkthrough caught the "ticket re-presentation" issue. That's typical — designs always have one or two soft spots that surface only when you simulate use. Don't skip this.

### Lesson 6: Comments Earn Their Keep

The code in this document is heavily commented — but every comment serves a purpose. They explain *why*, *tradeoffs*, *alternatives considered*, *invariants*. They don't paraphrase the code ("this method parks a vehicle"); they justify it.

That level of code documentation isn't always feasible in 45-minute interviews — but the *thinking* behind those comments is exactly what you should be verbalizing.

---

## What's Next

You now have one problem fully internalized — not just memorized, but understood at the level of *why each decision was made*. The remaining five problems in this series (Elevator, Library, Vending Machine, Splitwise, Ride-Hailing) follow the same structure.

When you read the next ones, notice what *changes* and what *stays the same*. The framework — clarify, identify, decide-with-reasoning, code-with-comments, validate, anticipate — is universal. The specific decisions vary by problem.

That universality is what you want to internalize. The specific designs are bonuses.
