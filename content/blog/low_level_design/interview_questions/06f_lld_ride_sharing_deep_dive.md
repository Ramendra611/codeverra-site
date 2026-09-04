# LLD Deep Dive #4: Designing a Ride-Sharing System

> **What this document is.** This is a comprehensive, first-principles walkthrough of how to design a ride-sharing system (of the Uber or Ola variety) as a low-level design (LLD) interview problem. It reasons from the vague problem statement through requirement clarification, entity identification, class hierarchy decisions, behavioural modelling with design patterns, and finally a fully composed system. Every design choice is stated together with the alternatives that were considered and the criteria that decided between them, so that a learner reading this can not only reproduce the design but also defend it and adapt it.

---

## Table of Contents

1.  [Learning Objectives and How to Use This Document](#1-learning-objectives-and-how-to-use-this-document)
2.  [Why the Ride-Sharing Problem Matters](#2-why-the-ride-sharing-problem-matters)
3.  [Prerequisite Vocabulary](#3-prerequisite-vocabulary)
4.  [Stage 1: Receiving the Problem Statement](#4-stage-1-receiving-the-problem-statement)
5.  [Stage 2: Clarifying Requirements](#5-stage-2-clarifying-requirements)
6.  [Stage 3: Identifying Entities and Weighing the Class Hierarchy Decision](#6-stage-3-identifying-entities-and-weighing-the-class-hierarchy-decision)
7.  [Stage 4: Modelling Users, Riders, and Drivers](#7-stage-4-modelling-users-riders-and-drivers)
8.  [Stage 5: Locations, Vehicles, and the Composition Choice](#8-stage-5-locations-vehicles-and-the-composition-choice)
9.  [Stage 6: The Trip Lifecycle and the State Pattern](#9-stage-6-the-trip-lifecycle-and-the-state-pattern)
10. [Stage 7: Matching a Rider to a Driver (Strategy Application 1)](#10-stage-7-matching-a-rider-to-a-driver-strategy-application-1)
11. [Stage 8: Pricing, Surge, and Layered Strategies (Strategy Application 2)](#11-stage-8-pricing-surge-and-layered-strategies-strategy-application-2)
12. [Stage 9: Payment Methods (Strategy Application 3 with Factory)](#12-stage-9-payment-methods-strategy-application-3-with-factory)
13. [Stage 10: Cancellation Encoded as a Policy Object](#13-stage-10-cancellation-encoded-as-a-policy-object)
14. [Stage 11: The RideManager as a Facade](#14-stage-11-the-ridemanager-as-a-facade)
15. [Stage 12: Validating the Design with Mental Walkthroughs](#15-stage-12-validating-the-design-with-mental-walkthroughs)
16. [Stage 13: Anticipating Follow-Up Questions](#16-stage-13-anticipating-follow-up-questions)
17. [Summary of Design Decisions](#17-summary-of-design-decisions)
18. [Key Takeaways](#18-key-takeaways)
19. [Practice Questions and Solutions](#19-practice-questions-and-solutions)
20. [Further Reading and Cross-References](#20-further-reading-and-cross-references)

---

## 1. Learning Objectives and How to Use This Document

After completing this deep dive, a learner should be able to:

1.  Reproduce the entire ride-sharing design from a blank sheet of paper, including class relationships, state transitions, and pattern choices.
2.  Defend every non-trivial choice by naming the alternatives that were rejected and the criterion that eliminated each one.
3.  Explain how the three separate Strategy applications (matching, pricing, payment) coexist without one leaking into another.
4.  Identify which SOLID principle each modelling decision preserves.
5.  Extend the design to accommodate common follow-up requirements such as pool rides, scheduled rides, real-time notifications, and geospatial scaling of driver lookup.

The document is intended to be read linearly. Each stage assumes the previous stage has been understood. If a reader is comfortable with the general pattern of LLD interviews and wants only the design rationale, the summary in section 17 together with the code listings inside sections 6 through 14 will be sufficient. Everyone else is advised to read from the beginning.

---

## 2. Why the Ride-Sharing Problem Matters

The ride-sharing problem occupies a distinguished place in the standard low-level design curriculum. Where the parking-lot problem is largely a test of class hierarchies, the elevator problem is largely a test of state machines, and the library management problem is largely a test of domain modelling, ride-sharing exercises all three of these skills simultaneously and adds a further dimension of pluggable algorithms. The following characteristics make it uniquely valuable as a diagnostic problem for evaluating design maturity.

**The system contains several pluggable algorithms that must coexist.** Selecting a driver for a given rider is one pluggable choice: today the platform may prefer proximity, tomorrow it may prefer driver rating, next quarter it may prefer some blend of both. Computing the fare for a completed trip is a second pluggable choice: distance-and-time-based pricing is standard, but flat-rate airport pricing and subscription-based pricing are all common in real deployments. Applying surge to a base fare is a third concern that varies independently of the base pricing algorithm. Handling payment is a fourth axis of variation, because cash, card, UPI, and wallet all involve different flows and different failure modes. A design that fails to isolate these axes will produce a monolithic manager class in which every pricing tweak requires touching payment code, and every matching change risks breaking cancellation logic.

**A trip has a rich lifecycle.** A trip is not a static record. It is a stateful object that passes through several qualitatively distinct phases, namely request, driver assignment, in-progress travel, completion, and cancellation. Each phase permits a different set of operations. A ride that has already been completed cannot be cancelled; a ride whose driver has not yet been assigned should not be startable; and the cost of cancellation depends on which phase the trip was in when the cancellation was requested. This is a textbook motivation for the State design pattern.

**Two roles interact through a shared substrate.** A rider requests a ride; a driver accepts one. Both are people with accounts on the platform, and both have profile data, ratings, and notification preferences in common. The question of whether to model them as a single class with a role attribute, as two entirely separate classes, or as subclasses of a common base is a genuine design decision that reveals a candidate's understanding of substitutability and single responsibility.

**The system is naturally event-driven.** State changes in a trip should notify both parties. New requests should be broadcast to nearby drivers. A driver going online should update matching availability. In a full production system these are handled through an event bus, a publish-subscribe queue, and push notification services. Even at the LLD scope, the design should be structured such that adding an Observer layer later requires no changes to existing classes.

**Scale considerations are latent in every method.** A naive nearest-driver scan over the entire driver population is O(N) per request. In production, the pool of drivers is partitioned by a geospatial index (a geohash grid, an H3 cell, or an R-tree). The design must at least allow such an index to be dropped in without disturbing the rest of the system. An LLD design that hardcodes the linear scan into the manager will require a rewrite when the scaling question is posed; a well-decomposed design will require only a new implementation of an existing interface.

For all of these reasons the ride-sharing problem tests the single most important skill in LLD, which is the ability to decompose a system into independent concerns and compose them back through well-defined interfaces. A candidate who cannot do this will produce a god class named `RideManager` that contains matching logic, pricing logic, surge logic, payment logic, and state transitions, all held together with conditional statements. A candidate who can do this will produce a lean manager that owns nothing except references to strategy objects, each of which can be replaced without touching any other.

The remainder of this document works through the problem stage by stage, in the order that these stages would be encountered during an actual interview.

---

## 3. Prerequisite Vocabulary

Before proceeding, several terms need precise definitions. These terms will recur throughout the document and precision here saves confusion later.

| Term | Definition |
|------|------------|
| **Entity** | An object with identity that persists through changes to its attributes. Two entities are equal only if they share the same identity, not merely the same attribute values. |
| **Value object** | An object without identity, defined entirely by its attributes. Two value objects with equal attributes are considered equal. Value objects are commonly immutable. |
| **Aggregate root** | An entity that owns a cluster of related objects and mediates all external access to them. In this design, the `Trip` acts as an aggregate root over its state, driver reference, and payment record. |
| **Strategy pattern** | A behavioural design pattern that encapsulates an algorithm behind an interface so that different algorithms can be substituted at runtime without altering the client that uses them. |
| **State pattern** | A behavioural design pattern in which an object appears to change its class as its internal state changes, achieved by delegating state-dependent behaviour to a separate state object. |
| **Facade pattern** | A structural design pattern that provides a simplified interface to a subsystem of related classes, hiding the internal complexity from external callers. |
| **Factory pattern** | A creational design pattern in which the construction of an object is deferred to a dedicated function or class, isolating callers from the details of instantiation. |
| **Open/Closed Principle (OCP)** | The SOLID principle stating that software entities should be open for extension but closed for modification. New behaviour should be added by writing new code, not by editing existing code. |
| **Single Responsibility Principle (SRP)** | The SOLID principle stating that a class should have exactly one reason to change, meaning it should encapsulate only one axis of variation. |
| **Liskov Substitution Principle (LSP)** | The SOLID principle stating that objects of a subtype must be usable wherever objects of the supertype are expected, without altering the correctness of the program. |
| **Interface Segregation Principle (ISP)** | The SOLID principle stating that clients should not be forced to depend on interfaces they do not use. |
| **Dependency Inversion Principle (DIP)** | The SOLID principle stating that high-level modules should depend on abstractions, not on concrete implementations. |
| **Geospatial index** | A data structure optimised for querying spatial data. Examples include geohash-based grids, quadtrees, R-trees, and Uber's H3 hexagonal grid. In production ride-sharing systems, drivers are stored in such an index so that nearest-neighbour queries run in sub-linear time. |
| **Surge multiplier** | A dynamic scalar (typically between 1.0 and about 5.0) applied to a base fare to reflect current supply and demand conditions in the pickup area. |

With these terms established, the actual design work begins.

---

## 4. Stage 1: Receiving the Problem Statement

In a real interview, the problem statement is typically brief and deliberately underspecified. A representative opening is:

> *"Design a ride-sharing system, something like Uber or Ola."*

This single sentence is the entirety of the initial specification. Nothing else is provided. The candidate must interpret this as the starting point of a conversation, not as a complete requirement document. Several qualitatively different systems are compatible with this description, and the design that emerges will depend heavily on which interpretation is adopted. The main axes along which interpretations vary are:

1.  **Scope of user roles.** Is the design confined to the rider-facing experience, or does it include the driver-facing side as well? Realistically both sides are needed for the trip lifecycle to make sense, so both are typically in scope.
2.  **Geographic scope.** Is this a single-city deployment, a national one, or a global one? Geographic scope affects assumptions about time zones, currency, regulatory constraints, and geospatial partitioning.
3.  **Vehicle categories.** Is the platform limited to sedans, or does it include a wider set (mini, sedan, SUV, auto-rickshaw, bike, and possibly food-delivery two-wheelers)? The presence of multiple vehicle types affects both pricing and matching.
4.  **Trip types.** Are only point-to-point on-demand trips supported, or are scheduled trips, outstation trips, and shared (pool) trips also in scope? Each additional trip type changes the lifecycle and introduces new concerns.
5.  **Auxiliary concerns.** Is payment in scope, or is it treated as external? Are ratings supported? Cancellations? Surge pricing? Loyalty programmes?
6.  **Matching model.** Is matching centralised (the platform assigns the driver) or auction-style (drivers bid on requests)? These are architecturally very different systems.
7.  **Deployment model.** Is this an in-memory single-instance design suitable for an LLD interview, or is it distributed across multiple servers with all the coordination that implies?

The vagueness of the problem statement is intentional on the interviewer's part. It is a test of whether the candidate will begin by writing classes (which is the wrong instinct) or begin by asking questions (which is the correct instinct). The correct response is always the second: seek clarification before committing to design decisions that will constrain everything that follows.

---

## 5. Stage 2: Clarifying Requirements

Clarification is organised into three categories: functional requirements (what the system must do), non-functional requirements (what qualities the system must have), and explicit non-goals (what the system will deliberately not do within the scope of this design). Working through these categories in an ordered fashion prevents important considerations from being forgotten and demonstrates methodical thinking to the interviewer.

Each question below is stated together with the rationale for asking it, so that the reader can generalise the pattern to problems outside this specific one.

### 5.1 Question: What is the end-to-end flow of a typical trip?

Without an agreed flow, it is impossible to distinguish essential entities from optional ones. A flow that involves pre-booking will need a scheduler; a flow that involves bidding will need an auction model; a flow that is purely on-demand will need neither. The candidate should ask for a description of the happy path.

A representative interviewer response is:

> *"A rider opens the app, requests a ride from a current location to a chosen destination, the system selects a suitable nearby driver, the driver accepts, drives to the pickup point, starts the trip on arrival, drives to the destination, ends the trip, the rider pays, and both parties rate each other."*

This description commits the design to three things implicitly. First, matching is assignment-based rather than auction-based, because the system selects the driver rather than the driver bidding. Second, trips are on-demand rather than scheduled, because no booking-for-later step appears in the flow. Third, each trip has one driver rather than several, because the description mentions a driver rather than drivers. Each of these commitments is important and should be noted.

### 5.2 Question: What vehicle categories are supported?

The presence or absence of multiple categories determines whether vehicle type is a first-class concept in the design. A single-vehicle system requires no dispatch on type; a multi-vehicle system requires that pricing, matching, and possibly cancellation all be aware of type.

A representative response is:

> *"Three types are supported, namely mini, sedan, and SUV. Each has different base fares and per-kilometre rates."*

This confirms that `VehicleType` will be a real enumeration used at least by the pricing component (to look up rates) and by the matching component (to filter candidates by requested type). The question of whether vehicle types justify a full class hierarchy is deferred to the entity-identification stage, where it will be considered explicitly.

### 5.3 Question: How is matching performed?

Matching is the single most substantive algorithmic component of the system and therefore the most important to design for variability. If the interviewer says "nearest driver," the candidate should probe whether that is the only policy that will ever be used, because the answer heavily influences whether matching should be extracted as a Strategy.

A representative response is:

> *"For now, the nearest available driver of the requested vehicle type. Ranking by driver rating may be added later."*

The phrase "for now" is a strong signal that matching logic must be pluggable. The candidate should treat this as an explicit request to design for extension, which is exactly what the Strategy pattern is intended to enable.

### 5.4 Question: Is surge pricing supported?

Surge pricing is a dynamic scalar applied to fares based on current demand and supply. If it is in scope, it must integrate cleanly with base fare computation; if it is not, an entire concern can be omitted from the design.

A representative response is:

> *"Yes. During peak hours, prices are multiplied by an area-specific factor."*

Surge is confirmed as an in-scope concern that varies independently of base pricing. This suggests that surge should be modelled as its own component that composes with pricing rather than being embedded within it.

### 5.5 Question: What payment methods are supported?

Payment method affects the design in two ways. First, each method has different behaviour and different failure modes, which motivates polymorphism. Second, the integration with an external gateway is often out of scope for LLD interviews, and confirming this saves time.

A representative response is:

> *"Card, UPI, wallet, and cash. The actual payment gateway integration is out of scope; simply record that a payment was made."*

This confirms four payment methods, which is enough variety to justify the Strategy pattern, and simultaneously scopes out the external integration concern.

### 5.6 Question: Are ratings supported?

Ratings, if present, must be recorded per trip and aggregated per user. They may also influence future matching. If ratings are out of scope, an entire attribute and its associated update logic can be removed from the User model.

A representative response is:

> *"Yes, in both directions. The rider rates the driver, the driver rates the rider, and this happens after each completed trip."*

Ratings are bidirectional and per-trip. A running average lives on the `User` entity so that a driver's overall rating is available at matching time without recomputing from history.

### 5.7 Question: Is cancellation supported, and if so with what fee structure?

Cancellation is a common source of subtle design bugs, particularly around state validation and fee computation. Establishing the fee structure early makes the state design cleaner.

A representative response is:

> *"Yes. Cancellation is free before a driver has been assigned, incurs a small fee if cancelled after driver acceptance but before pickup, and incurs a larger fee if cancelled after the trip has started."*

This response confirms two important design consequences. First, the fee depends on the lifecycle phase at cancellation time, which is direct evidence that the trip has a genuine lifecycle deserving of a State pattern. Second, the fee schedule itself is a policy that could change independently of the state machine, which suggests it should be extracted as a separate policy object.

### 5.8 Question: What are the non-functional expectations regarding concurrency, persistence, and scale?

These questions distinguish an LLD interview (which focuses on object-oriented design) from a high-level design interview (which focuses on distributed systems). The interviewer typically expects the candidate to note these concerns and set them aside for the follow-up discussion.

A representative response is:

> *"Assume an in-memory, single-threaded, single-instance design. Concurrency, persistence, and geospatial scaling should be mentioned at the end as extensions rather than built into the initial design."*

This response gives permission to build a clean in-memory design and defer the difficult distributed concerns to a follow-up discussion. This is the standard scope for an LLD interview and should be accepted gratefully.

### 5.9 Summary of Clarified Scope

After the clarification round, the candidate should restate the agreed scope explicitly to confirm alignment with the interviewer. A concise restatement follows.

| Concern | Decision |
|---------|----------|
| Region | Single region, in-memory, single-instance |
| Trip type | On-demand, single-driver-per-trip |
| Vehicle types | Mini, sedan, SUV (each with distinct pricing) |
| Matching | Nearest available driver of the requested type, with future support for other policies |
| Surge | Peak-hour multiplier, area-aware in interface but time-based by default |
| Payment methods | Cash, card, UPI, wallet (gateway integration out of scope) |
| Ratings | Bidirectional, one per completed trip, aggregated into a running average |
| Cancellation | Allowed at all pre-completion states, with state-dependent fees |
| Concurrency | Out of scope for the initial design, discussed as an extension |
| Persistence | Out of scope for the initial design, discussed as an extension |
| Geospatial indexing | Linear scan for the initial design, discussed as an extension |

This summary functions as the contract between the candidate and the interviewer. Any correction or addition made at this point will affect the entire subsequent design, so it is worth the minute or two required to state it explicitly.

---

## 6. Stage 3: Identifying Entities and Weighing the Class Hierarchy Decision

With the scope agreed, the next task is to identify the entities that will populate the design. This is done by extracting the significant nouns from the requirements and evaluating each one for genuine classhood. Not every noun deserves to become a class; equally, some concepts that are not explicitly named in the requirements must be introduced as classes because they represent axes of variation that the design needs to accommodate.

### 6.1 Concrete Entities from the Domain

The following entities are directly implied by the requirements. Each represents something that exists in the real world of the system and has a persistent identity or a clear representational role.

| Entity | Role | Justification |
|--------|------|---------------|
| `User` | Base for anyone with an account | Both riders and drivers share identity, contact, and rating attributes. |
| `Rider` | A user who requests trips | Distinct role with distinct operations, warrants a separate type. |
| `Driver` | A user who offers trips | Distinct role, plus additional state (vehicle, current location, availability). |
| `Vehicle` | The physical car (or auto or bike) driven by a driver | Has identity (licence plate) and metadata (type, model). |
| `Trip` | The core lifecycle object of the system | Central aggregate; owns state, references to driver and rider, fare, payment, and ratings. |
| `Location` | A geographic coordinate | Value object with equality by attributes, used ubiquitously. |
| `Rating` | A score with an optional comment | Recorded per trip; may be a full class or a scalar depending on requirements. |
| `Payment` | The record of a completed monetary transaction | Sometimes a full entity, sometimes a value; see section 12 for the reasoning. |

### 6.2 Behavioural Components Not Directly Named in the Requirements

The following components are not nouns in the problem statement but are essential to the design because they encapsulate axes of variation. Each one exists to satisfy the Open/Closed Principle for a specific concern.

| Component | Purpose | Pattern |
|-----------|---------|---------|
| `TripState` | Formal representation of a trip's lifecycle phase | State pattern |
| `MatchingStrategy` | Pluggable algorithm for choosing a driver | Strategy pattern |
| `PricingStrategy` | Pluggable algorithm for computing base fare | Strategy pattern |
| `SurgeCalculator` | Pluggable component that returns a surge multiplier | Strategy pattern (informally) |
| `PaymentMethod` | Pluggable mechanism for money movement | Strategy pattern |
| `CancellationPolicy` | Pluggable rule for cancellation-fee computation | Policy object (a strategy by another name) |
| `RideManager` | Facade coordinating all of the above | Facade pattern |

### 6.3 Nouns That Are Deliberately Not Modelled as Classes

An equally important part of entity identification is recognising which nouns from the problem statement should not become classes. Every unnecessary class adds cognitive load, testing burden, and coupling. The following nouns are rejected as classes in this design, with explicit reasons.

| Noun | Reason for Rejection |
|------|----------------------|
| `App` | The user-facing application is the caller of this design, not part of it. |
| `Notification` | Without a concrete requirement involving delivery guarantees or history, a class is speculative; the concept is deferred to an Observer extension. |
| `Map` | Geospatial and routing services are external. The design uses `Location` and `distance_to`; anything richer is an external dependency. |
| `Bank` or `Gateway` | The external payment gateway is out of scope by explicit interviewer statement. |
| `Route` | A route with turn-by-turn directions is a real thing in production but has no operational role in the LLD; a trip is adequately described by its source and destination. |

The discipline of not modelling things is at least as important as the discipline of modelling them. A class that exists without a genuine role is not a neutral cost; it becomes something future maintainers must read, understand, and preserve. Rejecting speculative classes is a demonstration of design restraint.

### 6.4 Informal Class Relationships

Before writing any code, the relationships between the identified entities are sketched in prose. This informal class diagram guides the subsequent implementation.

1.  A `Trip` has-one `Rider`, has-one `Driver` (once assigned), has-one `Vehicle` (populated at driver assignment), has-one `Location` for its source, has-one `Location` for its destination, has-one `TripState`, and eventually has-one final fare and has-one `Payment` record.
2.  A `Driver` has-one `Vehicle` and has-one current `Location`, and carries an `is_available` flag.
3.  The `RideManager` owns a collection of registered `Driver` instances and a registry of all `Trip` instances, and holds references (not copies) to the `MatchingStrategy`, `PricingStrategy`, `SurgeCalculator`, and `CancellationPolicy` currently configured.
4.  `TripState` is an abstract class with concrete subclasses `Requested`, `DriverAssigned`, `Started`, `Completed`, and `Cancelled`. A `Trip` moves through these states via method calls that are delegated to the current state object.

This informal model is a working hypothesis. If a walkthrough later reveals a contradiction or a missing relationship, the model is revised. The next several sections take this hypothesis and translate it into concrete code, one concern at a time.

---

## 7. Stage 4: Modelling Users, Riders, and Drivers

The first substantive modelling decision concerns how to represent the two user roles. This is worth treating carefully because it is a design decision that gets made silently and badly by many candidates, when in fact the alternatives have distinctly different consequences.

### 7.1 The Three Defensible Approaches

There are three internally consistent ways to model users in a ride-sharing system. Each is discussed below with its advantages and disadvantages.

**Approach 1: A single `User` class with a role attribute.** In this design there is exactly one class, and instances differentiate themselves by an attribute such as `role == "rider"` or `role == "driver"`. The apparent economy is misleading. Drivers require attributes that riders do not, most notably a vehicle and a current location. If those attributes live on the shared class, riders will carry them as permanently null fields, and every access to a driver-specific attribute will require a guard against the null case. Furthermore, driver-specific and rider-specific methods will accumulate on the same class, forcing the class to become a repository of role-conditional logic. This is the very situation that object-oriented modelling was designed to eliminate.

**Approach 2: Two entirely independent classes, `Rider` and `Driver`, that share nothing.** This design avoids the null-attribute problem of Approach 1 by giving each role its own class. However, it discards the fact that both are users of the same platform. Any behaviour or attribute that is genuinely shared (identity, contact information, rating, notification preferences, authentication) must be duplicated. If a third role is ever added (a support agent, a fleet operator, an admin), the duplication triples. This design violates the Don't Repeat Yourself principle in a way that grows worse with time.

**Approach 3: A base `User` class with `Rider` and `Driver` as subclasses.** This design places the shared attributes and behaviour on the base class and adds role-specific attributes and behaviour on the subclasses. When a real difference in behaviour or state exists, the class hierarchy exposes it plainly rather than hiding it behind runtime checks. This is the approach adopted here.

The three approaches are summarised in the following table.

| Criterion | Role Flag | Independent Classes | Base Class with Subclasses |
|-----------|-----------|---------------------|-----------------------------|
| Null-attribute pollution | High (drivers' fields on riders) | None | None |
| Duplication of shared behaviour | None | High | None |
| Type safety at API boundaries | Low (dispatch on flag) | High | High |
| Extensibility for new roles | Low (adds branches everywhere) | Low (more duplication) | High (new subclass) |
| Adherence to SRP | Violated (mixed responsibilities) | Satisfied | Satisfied |
| Adherence to LSP | Violated (behaviour depends on flag) | N/A (no shared supertype) | Satisfied |

Approach 3 is chosen for this design because it satisfies the greatest number of criteria and imposes the fewest constraints on future evolution.

### 7.2 Implementation of the User Hierarchy

The base class captures the shared identity and rating attributes.

```python
from dataclasses import dataclass, field
from typing import Optional


class User:
    """
    Base class for anyone with an account in the system.

    Holds identity and contact information along with a running
    rating. Both riders and drivers accumulate ratings from the
    other party after each completed trip, so the rating attribute
    is placed on the base class rather than on either subclass.
    """

    def __init__(self, user_id: str, name: str, phone: str):
        self.user_id = user_id
        self.name = name
        self.phone = phone
        # Every new user begins at a neutral 5.0 rating so that
        # no user is systematically disadvantaged by matching
        # strategies that prefer highly-rated participants. In a
        # production system this would be more nuanced, for
        # example using a provisional flag or a Bayesian prior,
        # but a plain float is sufficient for the design.
        self.rating: float = 5.0
        self.total_ratings: int = 0

    def update_rating(self, new_score: int) -> None:
        """
        Incorporate a new rating (an integer between 1 and 5) into
        the running average.

        The running total count is maintained explicitly so that
        the average is a true cumulative mean rather than a naive
        blending of the current average with the new score. A
        naive blend of the form (rating + new_score) / 2 would
        over-weight recent ratings, which is incorrect.
        """
        if not 1 <= new_score <= 5:
            raise ValueError("Rating must be an integer between 1 and 5")
        total = self.rating * self.total_ratings + new_score
        self.total_ratings += 1
        self.rating = total / self.total_ratings
```

The `Rider` subclass is intentionally empty in the current design.

```python
class Rider(User):
    """
    A user who requests rides.

    Riders have no persistent state beyond what a User carries.
    The subclass is retained for two reasons even in the absence
    of additional state. First, it expresses design intent: a
    Rider instance cannot be accidentally used where a Driver is
    expected, which is a form of type safety that catches errors
    at development time. Second, it provides a natural home for
    future rider-specific behaviour such as saved addresses,
    payment preferences, or ride history views.
    """
    pass
```

A frequent objection is that an empty subclass is a waste of a class. This objection misses the point of subclasses. A class does not need to earn its place by adding fields or methods; it can earn its place by adding type identity. In a strongly-typed function signature, `def start_trip(rider: Rider, ...)` makes it a compile-time (or in Python, a lint-time) error to pass a driver where a rider is expected. That guarantee is worth the cost of a two-line subclass.

The `Driver` subclass adds the driver-specific attributes.

```python
class Driver(User):
    """
    A user who provides rides.

    Adds vehicle ownership, current location, and an availability
    flag. The is_available flag is the piece of driver state that
    matching strategies inspect when filtering candidates. In a
    real system this would be more nuanced (on-duty but out of
    area, on-duty but currently in a fare, off-duty entirely),
    but a boolean is sufficient for the LLD scope.
    """

    def __init__(
        self,
        user_id: str,
        name: str,
        phone: str,
        vehicle: "Vehicle",
        location: "Location",
    ):
        super().__init__(user_id, name, phone)
        self.vehicle = vehicle
        self.location = location
        self.is_available = True

    def go_online(self) -> None:
        self.is_available = True

    def go_offline(self) -> None:
        self.is_available = False
```

Two design commitments embedded in this code deserve explicit mention.

First, `is_available` lives on the `Driver`, not on the `Trip`. This is a deliberate placement. Availability is a property of the driver as an actor in the world, not a property of any particular trip. A trip does not know whether its driver is available; a driver knows whether they are. The `RideManager` toggles this flag as part of assignment and release.

Second, the `Driver` composes a `Vehicle` rather than inheriting from one. A driver has-a vehicle; a driver is not a vehicle. This is the classical composition-over-inheritance judgment, and in this case the correct answer is unambiguous because a driver and a vehicle are qualitatively different kinds of things.

---

## 8. Stage 5: Locations, Vehicles, and the Composition Choice

Two supporting types now need to be modelled. Both are structurally simple but conceptually important because they force decisions about value semantics and about when a class hierarchy is or is not appropriate.

### 8.1 Location as an Immutable Value Object

A `Location` is a geographic coordinate. It has no identity of its own; two `Location(12.97, 77.59)` instances are the same location. This is the defining characteristic of a value object.

The natural Python implementation is a frozen dataclass, which provides value-based equality, hashability, and immutability with almost no code.

```python
import math
from dataclasses import dataclass


@dataclass(frozen=True)
class Location:
    """
    A geographic point defined by latitude and longitude.

    Frozen for two reasons. First, value semantics: two locations
    with the same coordinates should be considered equal, and
    freezing gives automatic equality by value along with
    hashability. Second, immutability: a location, once created,
    should not mutate. When a driver moves, the driver's location
    reference is reassigned to a new Location instance rather
    than mutating the existing one. This eliminates a category
    of aliasing bugs in which shared references are unexpectedly
    modified.
    """

    lat: float
    lng: float

    def distance_to(self, other: "Location") -> float:
        """
        Compute the approximate straight-line distance in
        kilometres to another location.

        The implementation uses the equirectangular approximation,
        which is accurate over city-scale distances (up to
        approximately a few dozen kilometres) and computationally
        cheaper than the Haversine formula. Over larger distances
        or at extreme latitudes, Haversine or a full geodesic
        calculation would be required. For the LLD scope, the
        equirectangular approximation is more than sufficient.

        For production use, the relevant distance is road
        distance rather than crow-flight distance, which would
        be obtained from an external routing service such as
        Google Maps Directions API or OSRM. The design does not
        depend on which distance function is used, only on the
        signature.
        """
        # Approximately 111 kilometres per degree of latitude.
        # The longitude conversion is less accurate at higher
        # latitudes because meridians converge, but for LLD it
        # is more than sufficient.
        dlat = self.lat - other.lat
        dlng = self.lng - other.lng
        return math.sqrt(dlat * dlat + dlng * dlng) * 111
```

Placing `distance_to` as a method of `Location` rather than as a free function is a stylistic choice with a real basis. At the call site, `driver.location.distance_to(trip.source)` reads more naturally than `distance(driver.location, trip.source)`, and the method form makes it plain which object owns the operation.

### 8.2 Vehicle as an Entity with an Enum Type

A `Vehicle` is not purely a value object because two cars with the same licence plate are the same car; the plate serves as identity. However, a vehicle is small and rarely modified, so the full weight of a mutable entity is not required.

The more consequential decision is whether to model vehicle types (mini, sedan, SUV) as an enumeration or as a class hierarchy. This is the decision point at which many novice designs go wrong by defaulting to a hierarchy when an enum would be clearer.

The criterion for choosing between an enum and a class hierarchy is whether the different types require different behaviour. If the types differ only in their metadata (base fare, capacity, name), an enum suffices. If the types differ in the methods they support or in how they behave, a class hierarchy is warranted.

In the ride-sharing domain, vehicle types are used for two things: pricing looks up rates by type, and matching filters candidates by type. Neither of these is polymorphic behaviour dispatched to the type itself; both are external components that consume the type as data. There is no `Mini.start()` that differs meaningfully from `Sedan.start()` in this code. Therefore an enum is the correct choice.

This is worth contrasting explicitly with the parking-lot problem, where `Bike`, `Car`, and `Truck` each declared their own required spot size, and where spot-fitting logic was dispatched to the vehicle type. In that domain, type-specific behaviour existed and a class hierarchy was appropriate. In the ride-sharing domain, no such type-specific behaviour exists, and the same modelling choice would be inappropriate.

```python
from enum import Enum
from dataclasses import dataclass


class VehicleType(Enum):
    """
    Enumeration of supported vehicle categories.

    Ordered by capacity from smallest to largest for readability,
    although the code does not depend on the enumeration order.
    """
    MINI = "mini"
    SEDAN = "sedan"
    SUV = "suv"


@dataclass
class Vehicle:
    """
    A physical vehicle owned by a driver.

    Identity is by licence plate; type is used by pricing (to
    look up rates) and by matching (to filter candidates by the
    rider's requested type). The model field is metadata for
    display purposes only.
    """
    plate: str
    type: VehicleType
    model: str = ""
```

The `Vehicle` dataclass is not frozen because some attributes such as colour or model may legitimately change over the life of the vehicle. A driver may switch to a different car under the same account, or an administrator may correct a typographical error. Freezing the dataclass would prevent these legitimate operations without providing any real value.

---

## 9. Stage 6: The Trip Lifecycle and the State Pattern

The `Trip` is the central entity of the system, and its lifecycle is the single most important modelling concern. The design must express clearly which operations are legal at which times and must make it impossible for callers to trigger an operation from a state that does not permit it.

### 9.1 The Lifecycle in Prose

A trip progresses through the following states in the following order.

1.  **Requested.** The rider has issued a ride request; no driver has been assigned yet. The system may transition this trip to `DriverAssigned` when a suitable driver is found, or to `Cancelled` if the rider cancels before any driver is assigned.
2.  **DriverAssigned.** A driver has accepted the request and is en route to the pickup point. The trip may transition to `Started` when the driver reaches the pickup and initiates the ride, or to `Cancelled` if either party cancels.
3.  **Started.** The trip is under way; the driver is transporting the rider toward the destination. The trip may transition to `Completed` when the driver reaches the destination and ends the ride, or (less commonly but legally) to `Cancelled` if the ride is aborted mid-way.
4.  **Completed.** The trip has finished successfully; fare has been computed and payment has been attempted. This is a terminal state; no further transitions are legal, although ratings may still be recorded.
5.  **Cancelled.** The trip has been aborted; a cancellation fee may or may not apply depending on the state at cancellation time. This is a terminal state.

The transitions permitted from each state are summarised in the following table.

| From State | Permitted Transitions |
|------------|----------------------|
| `Requested` | `DriverAssigned` (via `assign_driver`), `Cancelled` (via `cancel`) |
| `DriverAssigned` | `Started` (via `start`), `Cancelled` (via `cancel`) |
| `Started` | `Completed` (via `complete`), `Cancelled` (via `cancel`) |
| `Completed` | None (terminal); rating recording is still allowed as a non-state-changing operation |
| `Cancelled` | None (terminal) |

### 9.2 Why the State Pattern Is Appropriate

The naive way to model a lifecycle is with a string or enum attribute (`trip.state == "requested"`) combined with conditional statements in every trip method. This approach works at very small scale but degrades quickly. Two problems appear.

First, every operation must inspect the state and branch. Adding a new operation requires adding a new conditional to every state in the state's own switch, and adding a new state requires editing every operation. This is a matrix of conditionals whose complexity grows as the product of states and operations, not as their sum.

Second, the string-based approach provides no compile-time or lint-time guarantee that all legal transitions are handled and that all illegal transitions are rejected. Bugs of the form "we forgot to handle cancellation from the Started state" become common and are only caught in testing.

The State design pattern addresses both problems. It defines an abstract `TripState` class with methods for every possible transition, and creates a concrete subclass for each state. The default implementation of every method on the abstract class raises an exception, so any transition not explicitly overridden by a concrete state is rejected. The `Trip` delegates all state-dependent operations to its current `TripState` instance. Adding a new state requires only adding a new subclass; adding a new operation requires only adding a new method to each state that permits it.

The State pattern brings three concrete benefits to this design.

1.  **Transition rules are localised.** Each state class knows what it can do; no external code needs to check the state before acting.
2.  **Illegal transitions are impossible.** The default raising behaviour of the abstract class ensures that any attempt to perform an operation from a state that does not override it fails loudly rather than silently.
3.  **Extension is additive.** Adding a `Paused` state (for a mid-trip stop, for example) requires one new class and no modifications to existing states or operations.

### 9.3 The Abstract State

```python
from abc import ABC, abstractmethod
from typing import Optional


class TripState(ABC):
    """
    Abstract base for all trip states.

    Every state exposes the same set of transition methods so that
    the Trip can invoke them polymorphically without knowing the
    concrete state. The default behaviour of each transition is to
    raise, because most transitions are invalid from most states.
    Concrete states override only the transitions they permit.

    The design was considered against two alternatives:

    1. Defining each concrete state with only its legal
       transitions. This appears tidier but breaks polymorphism
       because callers would need to know which methods a state
       supports. It also complicates static type checking.

    2. Defining a single generic method such as handle(event)
       that dispatches on event type inside each state. This is
       cleaner when there are many small events but becomes
       verbose for a small number of well-defined transitions.

    The chosen shape names each transition explicitly and relies
    on the base-class defaults to raise for illegal transitions.
    Callers can trust that trip.state.assign_driver(...) either
    performs the correct transition or fails visibly.
    """

    @abstractmethod
    def name(self) -> str:
        ...

    def assign_driver(self, trip: "Trip", driver: "Driver") -> None:
        raise InvalidStateTransition(
            f"Cannot assign a driver in state {self.name()}"
        )

    def start(self, trip: "Trip") -> None:
        raise InvalidStateTransition(
            f"Cannot start a trip in state {self.name()}"
        )

    def complete(self, trip: "Trip", fare: float) -> None:
        raise InvalidStateTransition(
            f"Cannot complete a trip in state {self.name()}"
        )

    def cancel(self, trip: "Trip") -> None:
        raise InvalidStateTransition(
            f"Cannot cancel a trip in state {self.name()}"
        )


class InvalidStateTransition(Exception):
    """Raised when an operation is attempted from an illegal state."""
```

The design commitment embedded here is that the state itself is the guard. There is no `if trip.state == ...` anywhere in the trip class or in the manager. The state object enforces which transitions are legal. This is the single largest reason to use the State pattern over an enum.

### 9.4 The Concrete States

```python
class Requested(TripState):
    def name(self) -> str:
        return "REQUESTED"

    def assign_driver(self, trip: "Trip", driver: "Driver") -> None:
        trip.driver = driver
        trip.vehicle = driver.vehicle
        trip.state = DriverAssigned()

    def cancel(self, trip: "Trip") -> None:
        # No driver has been assigned yet, so cancellation is free.
        # The fee itself is computed by the CancellationPolicy,
        # not by the state.
        trip.state = Cancelled()


class DriverAssigned(TripState):
    def name(self) -> str:
        return "DRIVER_ASSIGNED"

    def start(self, trip: "Trip") -> None:
        from datetime import datetime
        trip.started_at = datetime.now()
        trip.state = Started()

    def cancel(self, trip: "Trip") -> None:
        # A driver was assigned but the ride has not started, so
        # a small cancellation fee is incurred. The fee amount is
        # determined by the CancellationPolicy at the time it is
        # invoked; the state itself simply knows that this
        # transition is legal.
        trip.state = Cancelled()


class Started(TripState):
    def name(self) -> str:
        return "STARTED"

    def complete(self, trip: "Trip", fare: float) -> None:
        from datetime import datetime
        trip.completed_at = datetime.now()
        trip.fare = fare
        trip.state = Completed()

    def cancel(self, trip: "Trip") -> None:
        # The trip has already started, so the largest
        # cancellation fee applies.
        trip.state = Cancelled()


class Completed(TripState):
    def name(self) -> str:
        return "COMPLETED"

    # All transitions from Completed use the base-class defaults,
    # which raise InvalidStateTransition. A completed trip is
    # terminal with respect to lifecycle transitions, although
    # ratings may still be recorded through a separate
    # non-state-changing method on the manager.


class Cancelled(TripState):
    def name(self) -> str:
        return "CANCELLED"

    # Terminal state. No further transitions are legal.
```

A subtle but important point is that the states know about the transition graph but do not know about fees, ratings, or fare computation. Each state is responsible for exactly one thing, namely enforcing which lifecycle transitions are legal. Fee computation, ratings, and pricing are separate concerns handled by separate components. This separation is what allows each concern to evolve independently.

### 9.5 The Trip Class

```python
from datetime import datetime
from typing import Optional
import uuid


class Trip:
    """
    The central entity of the system, representing one ride from
    request through to completion or cancellation.

    A Trip carries the data associated with a ride but delegates
    all state-dependent behaviour to its current TripState
    instance. Callers should almost always interact with trips
    through the RideManager rather than by invoking Trip methods
    directly, because the manager owns cross-cutting concerns
    such as driver-pool management and fare computation.
    """

    def __init__(
        self,
        rider: "Rider",
        source: "Location",
        destination: "Location",
        vehicle_type: "VehicleType",
    ):
        self.id: str = str(uuid.uuid4())
        self.rider = rider
        self.source = source
        self.destination = destination
        self.requested_vehicle_type = vehicle_type

        # Populated when a driver is assigned.
        self.driver: Optional["Driver"] = None
        self.vehicle: Optional["Vehicle"] = None

        # Populated as the lifecycle progresses.
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.fare: Optional[float] = None
        self.cancellation_fee: Optional[float] = None

        # Ratings are recorded once the trip has completed and
        # both parties have submitted their scores.
        self.rider_rating_of_driver: Optional[int] = None
        self.driver_rating_of_rider: Optional[int] = None

        # Every new trip begins in the Requested state.
        self.state: TripState = Requested()

    # The following methods are thin pass-throughs that delegate
    # to the current state. They exist for two reasons: first,
    # they read more naturally at the call site than
    # trip.state.start(trip); second, they provide a single choke
    # point where cross-cutting concerns such as logging or audit
    # trails could be added later without modifying the state
    # classes.

    def assign_driver(self, driver: "Driver") -> None:
        self.state.assign_driver(self, driver)

    def start(self) -> None:
        self.state.start(self)

    def complete(self, fare: float) -> None:
        self.state.complete(self, fare)

    def cancel(self) -> None:
        self.state.cancel(self)

    def distance_km(self) -> float:
        return self.source.distance_to(self.destination)
```

The `Trip` class is deliberately thin. It owns the data that describes one ride and delegates behaviour to its state. It does not compute fares, does not select drivers, and does not process payments. Those responsibilities belong to the components that specialise in each of them.

---

## 10. Stage 7: Matching a Rider to a Driver (Strategy Application 1)

The task of matching a rider to a driver is the first of three places in this system where the Strategy pattern is applied. It is worth understanding not just what the Strategy pattern is, but why it is the right choice here and what would go wrong if a simpler design were used instead.

### 10.1 Why Matching Is a Strategy

During requirement clarification, the interviewer stated that matching would use the nearest available driver "for now" and that ranking by driver rating might be added later. This is an explicit statement of variability along one axis, and it is exactly the situation for which the Strategy pattern was designed.

Consider what happens if the nearest-driver logic is hardcoded directly inside the `RideManager`. The manager acquires a large, specific responsibility (choosing drivers) in addition to its coordination responsibility. When a second matching policy is later added, the manager either grows a conditional (`if self.policy == "nearest": ... elif self.policy == "highest_rated": ...`) or is edited directly to replace one algorithm with another. Both outcomes violate the Open/Closed Principle. The correct alternative is to extract matching as an abstract interface with concrete implementations, and to have the manager hold a reference to one such implementation. Adding a new matching policy then requires writing a new class rather than editing an existing one.

### 10.2 The Abstract Strategy

```python
from abc import ABC, abstractmethod
from typing import Optional


class MatchingStrategy(ABC):
    """
    Chooses one driver for a given trip request from a pool of
    candidate drivers. Concrete subclasses encapsulate specific
    matching policies.

    The method returns None if no suitable driver exists. The
    caller must handle the None case explicitly; the strategy
    does not raise for the ordinary case of no available
    driver because that case is expected and recoverable, not
    exceptional.
    """

    @abstractmethod
    def select(
        self,
        trip: "Trip",
        drivers: list["Driver"],
    ) -> Optional["Driver"]:
        ...
```

The method signature is deliberately narrow. The strategy takes only the trip (which conveys the pickup location and the requested vehicle type) and the pool of drivers. It does not take a reference to the `RideManager` or to any other component. This narrow interface prevents the strategy from developing coupling to concerns outside its own responsibility and keeps it easy to test in isolation.

### 10.3 Two Concrete Strategies

The first concrete strategy implements the nearest-driver policy that satisfies the initial requirement.

```python
class NearestDriverStrategy(MatchingStrategy):
    """
    Selects the driver closest to the pickup point, from those
    who are available and driving a vehicle of the requested type.

    The time complexity is O(N) in the size of the driver pool.
    This is acceptable for an LLD-scope design because the pool
    is treated as small. For production use at scale, drivers
    would be pre-indexed by a geospatial data structure such as
    a geohash grid or an H3 hexagonal grid, and the strategy
    would receive only the drivers within the relevant cells.
    That indexing lives outside the strategy; the strategy
    itself remains a simple minimum-selection over whatever
    pool is passed in.
    """

    def select(self, trip, drivers):
        candidates = [
            d for d in drivers
            if d.is_available
            and d.vehicle.type == trip.requested_vehicle_type
        ]
        if not candidates:
            return None
        return min(
            candidates,
            key=lambda d: d.location.distance_to(trip.source),
        )
```

The second strategy implements the ranking-by-rating policy that the interviewer mentioned as a possible future addition. Its inclusion here serves two purposes: it demonstrates that the abstraction is real (not vacuous), and it provides a second data point that clarifies what varies between strategies.

```python
class HighestRatedNearbyStrategy(MatchingStrategy):
    """
    Selects, from the K nearest candidates, the one with the
    highest rating.

    This policy is genuinely different from the nearest-driver
    policy. A slightly-farther driver with a noticeably better
    rating will be chosen in preference to a nearer driver with
    an average rating. The K parameter is a tunable value: a
    smaller K biases the policy toward proximity, and a larger
    K biases it toward rating quality. Setting K to 1 recovers
    the pure nearest-driver policy exactly.
    """

    def __init__(self, k: int = 5):
        self.k = k

    def select(self, trip, drivers):
        candidates = [
            d for d in drivers
            if d.is_available
            and d.vehicle.type == trip.requested_vehicle_type
        ]
        if not candidates:
            return None
        nearest_k = sorted(
            candidates,
            key=lambda d: d.location.distance_to(trip.source),
        )[: self.k]
        return max(nearest_k, key=lambda d: d.rating)
```

The `RideManager` will hold a reference to whichever matching strategy is configured at construction time. Substituting one for another requires no changes to the manager, no changes to the trip class, and no changes to any other strategy. This is the property that the Strategy pattern was designed to provide, and this is why the extraction is worth the small additional structural cost.

---

## 11. Stage 8: Pricing, Surge, and Layered Strategies (Strategy Application 2)

The computation of a trip's fare is the second application of the Strategy pattern, and it introduces a subtlety that the matching component did not: the fare is composed of two independently varying parts, namely a base fare and a surge multiplier. This section discusses why these two parts must be modelled as separate components, and how they are composed by the manager without either component becoming aware of the other.

### 11.1 Why Pricing and Surge Must Be Separate

Both pricing and surge produce numerical outputs that end up multiplied together to yield the final fare. A tempting simplification would be to combine them into a single `FareStrategy` that returns the final number directly. This simplification is a mistake, for the following reasons.

**Pricing and surge vary along different axes.** Pricing depends on distance, time, and vehicle type. Surge depends on time of day and area of the city. Combining them means that any change to the base-fare formula would require editing surge-aware code, and any change to the surge calculation would require editing pricing code.

**Pricing is stable; surge is dynamic.** Base pricing schedules change infrequently, typically once per quarter as part of formal rate revisions. Surge multipliers change continuously as supply and demand fluctuate. Coupling them produces a component that is simultaneously slow-changing and fast-changing, which is a signal that two concerns have been conflated.

**Testing is simpler when the two are separate.** A test of the pricing strategy can supply a known trip and assert a specific base fare without concern for surge. A test of the surge calculator can assert a specific multiplier for a given time and location without concern for the underlying fare. Combining them forces every pricing test to reason about surge, and vice versa.

The separation of these two concerns is an application of the Single Responsibility Principle at the design level. Each component has exactly one reason to change.

### 11.2 The PricingStrategy Interface and Its Default Implementation

```python
from abc import ABC, abstractmethod


class PricingStrategy(ABC):
    """
    Computes the base fare for a trip, prior to the application
    of any surge multiplier.

    The base fare should be deterministic in the sense that the
    same trip inputs always produce the same fare output. Anything
    dynamic (surge, discounts, promotions, driver-specific rates)
    belongs in a separate layer that composes with the base fare
    rather than replacing it.
    """

    @abstractmethod
    def compute(self, trip: "Trip") -> float:
        ...


# Per-vehicle-type rate table. In production these values would
# come from a configuration file, an admin panel, or a rate
# service, not be hardcoded in source. Hardcoding here keeps
# the LLD design self-contained.
BASE_RATES = {
    VehicleType.MINI: {"base": 30.0, "per_km": 10.0, "per_min": 1.0},
    VehicleType.SEDAN: {"base": 50.0, "per_km": 14.0, "per_min": 1.5},
    VehicleType.SUV: {"base": 80.0, "per_km": 20.0, "per_min": 2.0},
}


class DistanceAndTimeBasedPricing(PricingStrategy):
    """
    Fare = base_rate + per_km_rate * distance + per_min_rate * duration.

    Duration is known only after the trip has completed, so this
    strategy is invoked at the completion step, not at the request
    step. If a fare estimate is required at request time (for
    example, to display an estimated fare to the rider before
    they confirm), a separate EstimatedFarePricing implementation
    would be used that omits the time component.
    """

    def compute(self, trip: "Trip") -> float:
        if trip.started_at is None or trip.completed_at is None:
            raise ValueError(
                "Distance-and-time-based fare requires both a "
                "start and a completion timestamp on the trip."
            )
        rates = BASE_RATES[trip.vehicle.type]
        distance = trip.distance_km()
        duration_min = (trip.completed_at - trip.started_at).total_seconds() / 60
        return (
            rates["base"]
            + rates["per_km"] * distance
            + rates["per_min"] * duration_min
        )
```

The strategy is deliberately focused. It computes the base fare and nothing else. It does not know about surge, does not know about discounts, does not care whether the payment succeeds. Its single responsibility is captured in its single method.

### 11.3 The SurgeCalculator

Surge is not treated as a full Strategy family in this design because there is really only one kind of surge, namely a multiplier that varies with time and location. However, it is factored out as a separately-injectable component so that the mechanism by which the multiplier is calculated can be replaced without disturbing the pricing strategy or the manager.

```python
from datetime import datetime


class SurgeCalculator:
    """
    Returns a surge multiplier for a given time and location.

    The default implementation applies a simple peak-hour
    multiplier (mornings between 07:00 and 10:00, evenings
    between 17:00 and 21:00). Area-based surge is not implemented
    in this default, but the interface accepts a Location so that
    a more sophisticated implementation can be substituted without
    any change to callers.
    """

    def multiplier(
        self,
        at_time: datetime,
        at_location: "Location",
    ) -> float:
        hour = at_time.hour
        if 7 <= hour < 10 or 17 <= hour < 21:
            return 1.5
        return 1.0
```

Two design decisions embedded here are worth noticing.

First, the interface takes a `Location` even though the default implementation ignores it. This is a deliberate provision for future extension. When area-based surge is added, no caller of `multiplier` needs to change; only the implementation is replaced.

Second, the multiplier is composed with the base fare outside both components. The `RideManager` calls the pricing strategy for the base fare and the surge calculator for the multiplier, then multiplies them together. Neither component knows that the other exists. This layering is what preserves the independence of the two concerns.

### 11.4 Summary of the Fare Computation Layering

The fare computation involves three components acting in sequence, coordinated by the `RideManager`. The following table summarises the responsibilities.

| Component | Responsibility | Depends On |
|-----------|---------------|------------|
| `PricingStrategy` | Compute base fare from trip distance, duration, and vehicle type | Trip data only |
| `SurgeCalculator` | Compute multiplier from time and location | Time and location only |
| `RideManager` | Invoke both components and multiply their outputs to produce final fare | Both components as injected dependencies |

The manager is the only place in the system that knows both about pricing and about surge. This is the correct place for that knowledge because coordinating independent components is the manager's job.

---

## 12. Stage 9: Payment Methods (Strategy Application 3 with Factory)

Payment methods form the third and final application of the Strategy pattern in this design. Each payment method (cash, card, UPI, wallet) has different behaviour, different failure modes, and different external dependencies, so polymorphism through a common interface is the natural fit.

### 12.1 The PaymentMethod Interface and Its Concrete Implementations

```python
from abc import ABC, abstractmethod


class PaymentMethod(ABC):
    """
    Abstract payment method.

    Real implementations would communicate with external payment
    gateways, handle retries and idempotency, and return richer
    PaymentResult objects carrying gateway-specific status and
    error information. For the LLD scope, the interface is kept
    simple: the charge method either succeeds silently (returning
    None) or raises an exception. Callers must handle the
    exceptional case explicitly.
    """

    @abstractmethod
    def charge(self, amount: float, from_user: "User") -> None:
        ...


class CashPayment(PaymentMethod):
    def charge(self, amount: float, from_user: "User") -> None:
        # Cash is settled in person; the system merely records
        # that the transaction occurred. No external interaction
        # is required.
        pass


class CardPayment(PaymentMethod):
    def __init__(self, card_last4: str):
        self.card_last4 = card_last4

    def charge(self, amount: float, from_user: "User") -> None:
        # In a production implementation, this method would
        # invoke the card gateway, handle failure and retry,
        # and persist the resulting transaction identifier. For
        # the LLD scope, the method is stubbed to succeed.
        pass


class UPIPayment(PaymentMethod):
    def __init__(self, upi_id: str):
        self.upi_id = upi_id

    def charge(self, amount: float, from_user: "User") -> None:
        # Stubbed to succeed. Production would invoke the UPI
        # collect request through the appropriate PSP.
        pass


class WalletPayment(PaymentMethod):
    """
    An in-app wallet payment.

    Unlike the other payment methods, this one has behaviour
    that can be meaningfully implemented at the LLD scope
    because the wallet balance is entirely internal to the
    system. The charge method debits the balance and raises if
    the balance is insufficient.
    """

    def __init__(self, balance: float):
        self.balance = balance

    def charge(self, amount: float, from_user: "User") -> None:
        if amount > self.balance:
            raise ValueError(
                f"Wallet has {self.balance:.2f}, "
                f"fare is {amount:.2f}"
            )
        self.balance -= amount
```

### 12.2 An Optional Factory for Payment Methods

If callers specify payment methods as strings (as would be the case for an HTTP API where the request body contains something like `{"method": "card", "card_last4": "4242"}`), a factory keeps the manager from doing string-based dispatch itself.

```python
class PaymentMethodFactory:
    """
    Constructs a PaymentMethod from a type identifier and its
    associated configuration.

    The factory isolates the creation logic from callers, keeping
    the RideManager free of if/elif chains on payment type
    strings. If a new payment method is added, only the factory
    is edited.
    """

    @staticmethod
    def create(kind: str, **kwargs) -> PaymentMethod:
        if kind == "cash":
            return CashPayment()
        if kind == "card":
            return CardPayment(card_last4=kwargs["card_last4"])
        if kind == "upi":
            return UPIPayment(upi_id=kwargs["upi_id"])
        if kind == "wallet":
            return WalletPayment(balance=kwargs["balance"])
        raise ValueError(f"Unknown payment kind: {kind}")
```

Whether to include the factory in an interview design depends on how the question is framed. If the interviewer explicitly asks about constructing payment methods from user input, the factory is warranted. If the interviewer treats payment as an already-constructed object handed to the manager, the factory is optional. Mentioning its existence and moving on is generally the correct choice.

---

## 13. Stage 10: Cancellation Encoded as a Policy Object

Cancellation is the concern where many otherwise-decent designs quietly go wrong. The temptation is to embed cancellation fee logic directly inside the manager with statements of the form `if trip.state.name() == "DRIVER_ASSIGNED": fee = 30`. This approach hardcodes a policy into a coordinator, which is exactly the anti-pattern that the Strategy and Policy patterns exist to prevent.

The correct alternative is to externalise the cancellation fee schedule as a policy object.

```python
class CancellationPolicy:
    """
    Computes the fee owed by a rider who cancels a trip.

    The fee depends on how far into the lifecycle the trip has
    progressed at the time of cancellation. Extracting this
    computation into a dedicated policy object means the fee
    schedule can be revised (for example, extending the free-
    cancellation window or introducing type-dependent fees)
    without touching the RideManager or the trip state classes.
    """

    def fee(self, trip: "Trip") -> float:
        # By the time this method is invoked, the trip has
        # already transitioned to Cancelled. The policy therefore
        # cannot look at trip.state to determine which state was
        # active immediately before cancellation. Instead it
        # inspects markers on the trip data:
        #
        #   - trip.started_at set means the trip had actually
        #     started, which is the highest-fee case.
        #   - trip.driver set means a driver was assigned but
        #     the trip had not yet started, which is the
        #     moderate-fee case.
        #   - Neither set means the trip was cancelled before
        #     any driver was assigned, which is the free case.
        if trip.started_at is not None:
            return 100.0
        if trip.driver is not None:
            return 30.0
        return 0.0
```

There is a subtle design fragility embedded in this implementation, and it is worth identifying explicitly rather than glossing over. Because `cancel()` transitions the trip to `Cancelled` before the fee is computed, the policy cannot read `trip.state` to determine which state was active immediately prior to cancellation. Instead the policy infers the pre-cancel state from other markers on the trip: the presence of `started_at` implies the trip had actually started, the presence of `driver` without `started_at` implies a driver had been assigned but the ride had not begun, and the absence of both implies no driver had been assigned. This inference is correct in the current design but relies on invariants that a future change could accidentally break. For example, if the design were later modified to clear `driver` on cancellation, the policy would return the free-cancellation fee for cancellations that should attract a moderate fee.

A cleaner alternative is to record the pre-cancellation state explicitly on the trip at the moment of cancellation, either as a snapshot attribute (`trip.state_before_cancel`) or as a parameter to the policy method. This alternative eliminates the inference and its associated fragility at the cost of a small additional piece of state on the trip. For an interview response, identifying the tradeoff and articulating both options is worth as many points as solving it fully.

---

## 14. Stage 11: The RideManager as a Facade

The `RideManager` is the top-level coordinator of the system. Its role is to expose a small number of high-level operations (`request_ride`, `start_trip`, `complete_trip`, `cancel_trip`, `rate_trip`) and to hide the choreography required to implement them. This is the definition of the Facade design pattern.

### 14.1 What the Manager Owns and What It Does Not

The manager owns:

1.  The pool of registered drivers, indexed by driver identifier for constant-time lookup.
2.  The registry of trips (active and completed), indexed by trip identifier.
3.  References to the currently-configured matching strategy, pricing strategy, surge calculator, and cancellation policy.

The manager does not own:

1.  The matching algorithm itself. That is inside the `MatchingStrategy` implementation.
2.  The fare-computation formula. That is inside the `PricingStrategy` implementation.
3.  The surge-computation formula. That is inside the `SurgeCalculator` implementation.
4.  The cancellation fee schedule. That is inside the `CancellationPolicy` implementation.
5.  The trip lifecycle transitions. Those are inside the `TripState` subclasses.
6.  The payment execution logic. That is inside the `PaymentMethod` implementation supplied per call.

The manager is deliberately thin. It is glue, not logic. The measure of a good facade is how little logic it needs to contain of its own.

### 14.2 Implementation

```python
from typing import Optional


class RideManager:
    """
    The Facade for the ride-sharing system.

    Orchestrates end-to-end operations by composing:

      - MatchingStrategy for driver selection
      - PricingStrategy plus SurgeCalculator for fare computation
      - CancellationPolicy for cancellation fee determination
      - PaymentMethod for money movement (supplied per call)
      - TripState for lifecycle enforcement

    The manager owns none of this logic. It knows when to invoke
    each component, not how each component works internally.
    This delegation is what keeps the manager stable: a change
    to the pricing formula does not touch the manager, and a
    change to the matching policy does not touch the manager.
    Only a change to the choreography itself does.
    """

    def __init__(
        self,
        matching: MatchingStrategy,
        pricing: PricingStrategy,
        surge: SurgeCalculator,
        cancellation: CancellationPolicy,
    ):
        self._matching = matching
        self._pricing = pricing
        self._surge = surge
        self._cancellation = cancellation

        # Registered drivers, keyed by identifier for O(1)
        # lookup on unregister. The matching strategy is passed
        # the list of values.
        self._drivers: dict[str, Driver] = {}

        # All trips ever created, keyed by identifier. In a
        # production system, completed trips would be moved to
        # cold storage; here everything remains in memory.
        self._trips: dict[str, Trip] = {}

    # Driver pool management

    def register_driver(self, driver: Driver) -> None:
        if driver.user_id in self._drivers:
            raise ValueError(
                f"Driver {driver.user_id} is already registered"
            )
        self._drivers[driver.user_id] = driver

    def unregister_driver(self, driver_id: str) -> None:
        self._drivers.pop(driver_id, None)

    # Trip lifecycle

    def request_ride(
        self,
        rider: Rider,
        source: Location,
        destination: Location,
        vehicle_type: VehicleType,
    ) -> Trip:
        """
        Create a trip and attempt to assign a driver.

        The trip is returned in either case. If the matching
        strategy returned a driver, the trip is in DriverAssigned
        state and the driver's availability flag has been cleared.
        If matching returned None, the trip remains in Requested
        state; the caller may retry later or cancel the trip.
        This design choice (returning the trip rather than raising
        when no driver is available) reflects the fact that
        driver unavailability is an expected, recoverable
        condition rather than an exceptional one.
        """
        trip = Trip(rider, source, destination, vehicle_type)
        self._trips[trip.id] = trip

        driver = self._matching.select(
            trip, list(self._drivers.values())
        )
        if driver is not None:
            trip.assign_driver(driver)
            driver.is_available = False

        return trip

    def start_trip(self, trip_id: str) -> None:
        trip = self._get_trip(trip_id)
        trip.start()

    def complete_trip(
        self,
        trip_id: str,
        payment_method: PaymentMethod,
    ) -> float:
        """
        End the trip, compute the final fare (base multiplied by
        surge), transition to Completed, charge the payment
        method, and release the driver.

        Returns the final fare that was charged.

        The order of operations is significant:

          1. Verify that the trip actually started; refuse
             otherwise.
          2. Set completed_at temporarily so that the pricing
             strategy has both timestamps available.
          3. Compute the base fare through the pricing strategy.
          4. Compute the surge multiplier through the surge
             calculator.
          5. Multiply to obtain the final fare.
          6. Transition the state to Completed, which also sets
             completed_at and fare on the trip. The double-set
             of completed_at is harmless.
          7. Invoke the payment method to charge the rider.
          8. Release the driver back to the available pool and
             update the driver's location to the drop-off point.

        If the payment method raises, the trip is still Completed;
        the caller decides how to retry payment. This mirrors
        real-world behaviour: the ride happened, so the trip
        should reflect that; the money is a separate follow-up
        concern.
        """
        from datetime import datetime

        trip = self._get_trip(trip_id)

        if trip.started_at is None:
            raise InvalidStateTransition(
                "Cannot complete a trip that never started"
            )

        now = datetime.now()
        # Temporarily set completed_at so that pricing has both
        # timestamps available.
        trip.completed_at = now
        base_fare = self._pricing.compute(trip)
        multiplier = self._surge.multiplier(now, trip.destination)
        final_fare = base_fare * multiplier

        # Formally transition through the state machine. This
        # sets fare and (redundantly) completed_at.
        trip.complete(final_fare)

        # Attempt to settle payment. If this raises, the trip
        # remains in Completed state; retry is the caller's
        # responsibility.
        payment_method.charge(final_fare, trip.rider)

        # Release the driver and update location to the drop-off
        # point so subsequent matching sees the driver where
        # they actually are.
        if trip.driver is not None:
            trip.driver.is_available = True
            trip.driver.location = trip.destination

        return final_fare

    def cancel_trip(self, trip_id: str) -> float:
        """
        Cancel a trip and return the cancellation fee, which may
        be zero.

        The state transition happens first (which validates that
        the trip is in a cancellable state); the policy then
        computes the fee from the trip data; the driver, if any
        was assigned, is finally released back to the available
        pool.
        """
        trip = self._get_trip(trip_id)
        driver_at_cancel = trip.driver

        trip.cancel()  # State-guarded; raises if not cancellable.
        fee = self._cancellation.fee(trip)
        trip.cancellation_fee = fee

        if driver_at_cancel is not None:
            driver_at_cancel.is_available = True

        return fee

    def rate_trip(
        self,
        trip_id: str,
        by_rider: Optional[int] = None,
        by_driver: Optional[int] = None,
    ) -> None:
        """
        Record ratings for a completed trip. Only permitted after
        the trip has entered the Completed state.
        """
        trip = self._get_trip(trip_id)
        if not isinstance(trip.state, Completed):
            raise InvalidStateTransition(
                "Ratings can only be recorded on completed trips"
            )
        if by_rider is not None and trip.driver is not None:
            trip.rider_rating_of_driver = by_rider
            trip.driver.update_rating(by_rider)
        if by_driver is not None:
            trip.driver_rating_of_rider = by_driver
            trip.rider.update_rating(by_driver)

    # Helpers

    def _get_trip(self, trip_id: str) -> Trip:
        if trip_id not in self._trips:
            raise KeyError(f"Unknown trip: {trip_id}")
        return self._trips[trip_id]
```

The entire manager runs under 150 lines and delegates every substantive decision. This is the shape of a good Facade: it coordinates but does not compute.

---

## 15. Stage 12: Validating the Design with Mental Walkthroughs

A design that has never been walked through is a design that has never been tested. Mental walkthroughs are the LLD equivalent of unit tests: they exercise specific scenarios against the design and confirm that the resulting behaviour matches what the requirements specify. Almost every non-trivial design contains at least one bug that surfaces only during walkthrough, so this stage is not optional.

The following six scenarios cover the happy path, several important error paths, and one scenario that exposes a genuine limitation of the design.

### 15.1 Scenario A: The Happy Path

**Setup.** A rider named Amit requests a sedan from location (12.97, 77.59) to location (12.95, 77.55). The system has two available sedans and one available mini registered.

**Trace.**

1.  `mgr.request_ride(amit, source, destination, VehicleType.SEDAN)` creates a new trip and invokes `NearestDriverStrategy.select`. The candidate list is filtered to the two sedans (the mini is excluded by vehicle-type mismatch). The nearer sedan is selected. The trip transitions from `Requested` to `DriverAssigned`. The selected driver's `is_available` flag is cleared.
2.  `mgr.start_trip(trip.id)` invokes `trip.start()`, which delegates to the current state (`DriverAssigned`) and transitions to `Started`. The `started_at` timestamp is set.
3.  `mgr.complete_trip(trip.id, UPIPayment("amit@upi"))` verifies that the trip has started, computes the base fare through the pricing strategy, computes the surge multiplier (assumed to be 1.0 for off-peak), multiplies to obtain the final fare, transitions the state to `Completed`, invokes `UPIPayment.charge`, and releases the driver.
4.  `mgr.rate_trip(trip.id, by_rider=5, by_driver=4)` records both ratings and updates the running averages on both users.

**Outcome.** The happy path executes exactly as intended. The trip ends in `Completed` state with a valid fare, both users have updated ratings, and the driver is available for another trip.

### 15.2 Scenario B: No Driver Available

**Setup.** A rider requests an SUV, but no SUV is registered or available.

**Trace.**

1.  `mgr.request_ride(...)` creates a trip and invokes matching. The matching strategy filters to zero candidates and returns None. The trip's `driver` attribute remains None, and the trip stays in `Requested` state.
2.  The caller inspects `trip.driver is None`, recognises that matching failed, and decides on a follow-up action (retry later, notify the rider, or cancel).
3.  If the caller invokes `mgr.cancel_trip(trip.id)`, the trip transitions from `Requested` to `Cancelled` via `Requested.cancel`. The `CancellationPolicy` observes that no driver was assigned and no timestamp was set, and returns a fee of 0.0. No driver needs to be released because none was ever assigned.

**Outcome.** The design correctly handles the case where no driver is available. No spurious exceptions are raised, no invalid state transitions occur, and the correct (zero) fee is computed on cancellation.

### 15.3 Scenario C: Cancellation After Driver Assignment but Before Start

**Setup.** A rider requests a sedan, matching succeeds, and the trip enters `DriverAssigned`. The rider then cancels before the driver reaches the pickup point.

**Trace.**

1.  `mgr.request_ride(...)` succeeds; the trip is in `DriverAssigned` and the driver is marked unavailable.
2.  `mgr.cancel_trip(trip.id)` invokes `trip.cancel()`, which delegates to `DriverAssigned.cancel` and transitions to `Cancelled`. The policy observes that a driver was assigned (`trip.driver` is not None) but the trip never started (`trip.started_at` is None), and returns a fee of 30.0. The driver is released back to the available pool.

**Outcome.** The moderate cancellation fee is correctly applied, and the driver is correctly released.

### 15.4 Scenario D: Attempting to Start a Completed Trip

**Setup.** Through a client bug, a replay attack, or any other spurious cause, `start_trip` is invoked on a trip that has already reached the `Completed` state.

**Trace.**

1.  `mgr.start_trip(trip.id)` invokes `trip.start()`, which delegates to `self.state.start(self)`. The current state is `Completed`. The `Completed` class does not override `start`, so the base class's default implementation raises `InvalidStateTransition("Cannot start a trip in state COMPLETED")`.

**Outcome.** The invalid transition is rejected loudly, without any explicit state check in the manager. This is the primary benefit of the State pattern: illegal transitions are impossible by construction.

### 15.5 Scenario E: Completing a Trip That Never Started

**Setup.** A client accidentally calls `complete_trip` immediately after `request_ride`, skipping the `start_trip` step entirely.

**Trace.**

1.  `mgr.complete_trip(trip.id, payment)` performs its precondition check and observes that `trip.started_at` is None. It raises `InvalidStateTransition` before any state transition is attempted. Even if this precondition were absent, the subsequent call to `trip.complete(final_fare)` would fail because the current state (`DriverAssigned`) does not override `complete`, and the base class default would raise.

**Outcome.** The invalid operation is rejected. The design has two independent lines of defence against this class of error: the manager's precondition check and the state pattern's default raising.

### 15.6 Scenario F: Concurrent Requests Targeting the Same Driver

**Setup.** Two `request_ride` calls arrive simultaneously, and the matching strategy identifies the same driver as the best match for both.

**Trace.**

1.  In the single-threaded design, one call executes to completion before the other begins. The first call assigns the driver and marks them unavailable. The second call's matching invocation sees the driver as unavailable and filters them out, selecting a different driver (or returning None if no other suitable driver exists).
2.  In a hypothetical multi-threaded design, both calls could reach the matching step and both could observe the driver as available. Both would proceed to assign the same driver, resulting in a duplicate assignment that would need to be resolved by some higher-level coordination mechanism.

**Outcome.** The single-threaded assumption from the requirements is what saves the design here. The scenario surfaces a genuine limitation that would need to be addressed if concurrency were later introduced. This limitation is identified explicitly and discussed in the follow-up section.

### 15.7 Summary of Walkthroughs

The design behaves correctly for all tested scenarios within the single-threaded, in-memory scope that was agreed during requirement clarification. The one genuine limitation surfaced (concurrent driver assignment) is exactly the kind of concern that the interviewer expects to be identified and deferred rather than solved inside the LLD.

| Scenario | Result | Notes |
|----------|--------|-------|
| Happy path | Passes | All components behave as designed |
| No driver available | Passes | Returns trip with driver=None; free cancellation works |
| Cancel after assign | Passes | Moderate fee applied, driver released |
| Start completed trip | Passes | Rejected by State pattern default |
| Complete unstarted trip | Passes | Rejected by manager precondition and by State pattern |
| Concurrent same-driver | Limitation surfaced | Requires concurrency support to solve |

---

## 16. Stage 13: Anticipating Follow-Up Questions

Interviewers use follow-up questions to probe the depth of a candidate's design maturity. The follow-ups on ride-sharing are usually predictable, and rehearsing answers to them is worth the effort. The following are the most common, together with grounded and specific responses.

### 16.1 How Would You Scale Matching to Millions of Drivers?

The linear scan in `NearestDriverStrategy` is O(N) per request, where N is the total number of registered drivers. At scale this is untenable. The replacement is a geospatial index that partitions drivers by geographic cell, allowing matching to consider only the drivers within cells near the pickup point.

Two common indexing schemes are relevant. Geohash-based indexing partitions the world into a hierarchical rectangular grid, in which each geohash string identifies a cell of a specific size. Uber's H3 library uses a hexagonal grid, which has better neighbour-uniformity properties than the geohash grid. In either case, drivers are inserted into the appropriate cell when they go online and are moved between cells as they travel.

The design accommodates this change through composition rather than modification. A new `GeohashNearestStrategy` implementation of `MatchingStrategy` receives a much smaller candidate list from a driver-pool component that maintains the index internally. The `RideManager` continues to hold a `MatchingStrategy` reference, and neither the manager nor the trip class needs to change. This is the payoff for having extracted matching as a Strategy from the beginning.

### 16.2 How Would You Handle Concurrent Driver Assignment?

Concurrent assignment can be addressed at two levels, which are commonly layered together.

The first level is a lock on the driver-pool access. The read-then-mark-unavailable pair is wrapped in a critical section so that it executes atomically with respect to other assignments. This is simple, correct, and easy to reason about. Its principal disadvantage is that all matching attempts contend for the same lock, which becomes a throughput bottleneck as the system scales.

The second level is a compare-and-swap on the driver's availability flag. The matching strategy returns a candidate; the manager atomically attempts to flip the flag from True to False; on failure (which indicates another manager instance beat this one to the assignment), the manager re-runs matching. This gives much higher throughput at the cost of occasional retries.

At the largest scales (real Uber-scale, tens of thousands of assignments per second), matching is implemented as an event-driven pipeline. Driver availability events flow through a distributed queue, assignments are committed through a coordination service such as etcd or Zookeeper, and the system tolerates a small window of inconsistency in exchange for horizontal scalability. The LLD design supports all of these approaches because the `MatchingStrategy` interface makes no assumptions about how availability is checked.

### 16.3 How Would You Support Real-Time Supply-and-Demand Surge?

The `SurgeCalculator` interface is already designed for this extension. The default implementation applies a fixed time-of-day multiplier, but a `DemandBasedSurge` implementation would query a running index of active requests per area versus available drivers per area, and would return a multiplier accordingly. The signature `multiplier(at_time, at_location) -> float` is sufficient for any such implementation, so no caller changes are required to switch from the default to a demand-based version.

The running indices themselves are maintained by a separate component (an aggregator that observes ride requests and driver availability changes), which is architecturally similar to the driver-pool component that maintains the geospatial index for matching.

### 16.4 How Would You Support Pool (Shared) Rides?

Pool rides are a substantive extension because they change the fundamental assumption that a trip has one rider. Two structural approaches are worth discussing.

The first approach introduces a new `PoolTrip` entity that contains multiple `TripSegment` objects, one per rider. Each segment has its own source, destination, and state, but all segments share a driver, a vehicle, and a route. Pricing splits proportionally by distance. This approach models the multi-rider nature explicitly and cleanly separates the pool concern from the point-to-point trip class.

The second approach extends the existing `Trip` with a `co_riders` list and a per-rider fare computation. This is simpler to implement but conflates two genuinely different kinds of trip (single-rider and multi-rider), which will produce awkward conditional logic anywhere that the difference matters.

For an interview, the correct response is to describe both approaches, explain the tradeoff between them, and observe that the state machine becomes meaningfully more complex under either approach because a pool trip may be in different phases for different riders simultaneously (started for rider A, still en route to pickup for rider B).

### 16.5 How Would You Support Scheduled (Pre-Booked) Rides?

Scheduled rides add a `scheduled_for: Optional[datetime]` attribute to `Trip` and introduce a new state `Scheduled` that precedes `Requested`. A scheduler component (whose implementation is outside the LLD scope for interview purposes) fires the transition from `Scheduled` to `Requested` at the appropriate time, at which point the normal matching pipeline takes over. The remainder of the design does not change, which is a good sign about the design's extensibility.

### 16.6 How Would Ratings Actually Affect Driver Rankings?

Ratings are already recorded on the `User` base class. The `HighestRatedNearbyStrategy` defined earlier is the natural consumer. For richer ranking (combining rating, acceptance rate, cancellation rate, and other quality signals), a dedicated `DriverRankingStrategy` interface can be introduced that returns a numerical score for a given driver. The matching strategy then invokes the ranking strategy as part of its selection logic. This becomes a fourth strategy family composed by the manager.

### 16.7 How Would Notifications Work?

Notifications are the natural place for the Observer pattern to enter this design. Drivers subscribe to "request-created" events in their operating area; riders subscribe to state-change events on their own trip. The `Trip` (or the `RideManager`) acts as an event source, and the app clients act as observers. An `EventBus` component would be introduced to decouple publishers from subscribers, and the state transition methods would emit events at appropriate points.

Adding notifications to the design does not require changes to any existing class beyond instrumenting the state transitions with event emissions. This is another consequence of having separated concerns cleanly from the beginning.

### 16.8 How Would You Handle Payment Failures?

The current design has `charge()` either returning or raising. In a production system the flow is richer. A `PaymentResult` object would carry success, failure, or pending status; gateway-specific error codes; and retry hints. The trip would record the payment attempt as a first-class object. A separate retry job would periodically pick up failed payments and retry them with exponential backoff. If all retries exhaust, the rider's account would enter a "settle before next ride" state that blocks new ride requests until the outstanding balance is cleared.

All of this can be layered on without changing the trip lifecycle. The trip does not care whether payment succeeded on the first attempt or the tenth; it only cares that the ride happened and the fare was recorded.

### 16.9 How Would Trust and Safety Concerns Be Modelled?

Trust and safety (fraudulent drivers, abusive riders, disputes, reputation) is an entire subsystem in its own right. It touches the `User` base class (with flags for holds, review states, and reputation scores) and the `Trip` class (with a `disputed` marker and links to review records), but is otherwise orthogonal to the core ride-lifecycle design. The composition-based approach adopted throughout this design accommodates trust-and-safety extensions cleanly: adding fraud checks does not require restructuring matching, pricing, or lifecycle management.

---

## 17. Summary of Design Decisions

The following table consolidates every substantive design decision made during the walkthrough, together with the alternatives that were considered and the criterion that led to the choice.

| Decision | Chosen Approach | Alternatives Considered | Deciding Criterion |
|----------|----------------|-------------------------|--------------------|
| User modelling | `User` base with `Rider` and `Driver` subclasses | Single class with role flag; two independent classes | Avoids null attributes and duplication; preserves type safety |
| Vehicle type modelling | `VehicleType` enum | Class hierarchy (`Car`, `Bike`, etc.) | Types differ in metadata only, not behaviour |
| Location representation | Immutable frozen dataclass | Mutable class; tuple | Value semantics require equality by attributes; immutability prevents aliasing |
| Trip lifecycle | State pattern with abstract base | String or enum with conditional checks; `handle(event)` dispatcher | Localises transition rules; makes illegal transitions impossible by construction |
| Trip state named methods | Explicit named transition methods | Single `handle(event)` method | Small number of well-defined transitions favours explicit naming |
| Matching | Strategy pattern with pluggable concrete implementations | Hardcoded nearest-driver algorithm in manager | Interviewer signalled variability; OCP compliance |
| Pricing | Strategy pattern separate from surge | Combined pricing-and-surge strategy | Pricing and surge vary along different axes and change at different rates |
| Surge | Separately-injectable calculator component | Embedded in pricing strategy; embedded in manager | Composition preserves independent evolution |
| Payment | Strategy pattern per method | Conditional dispatch on method string | Each method has distinct behaviour and failure modes |
| Payment construction | Optional Factory for string-based construction | Direct construction by callers | Only necessary when callers use string identifiers |
| Cancellation | Externalised policy object | Inline in manager | Policy may change independently of state machine |
| Coordination | `RideManager` as thin Facade | Distribute coordination across entities; god-class manager | Facade hides subsystem complexity while keeping coordination discoverable |
| Driver availability | Attribute on `Driver` | Attribute on `Trip`; managed by matching strategy | Availability is a property of the driver in the world, not of any particular trip |
| Trip driver snapshot | Vehicle captured on assignment | Read from driver at completion time | Handles vehicle switches between assignment and completion |
| No-driver-available behaviour | Return trip with `driver=None` | Raise exception | Recoverable condition, not exceptional |
| Payment failure behaviour | Trip stays `Completed`; payment retry is caller's problem | Roll back trip to un-completed state | Mirrors real system behaviour; ride happened regardless |

The following table maps each SOLID principle to where in the design it is upheld.

| Principle | Where Upheld |
|-----------|--------------|
| Single Responsibility | Each strategy, policy, and state has exactly one reason to change |
| Open/Closed | New matching, pricing, payment, and cancellation policies can be added without modifying the manager |
| Liskov Substitution | Any `MatchingStrategy`, `PricingStrategy`, `PaymentMethod`, or `TripState` subclass is usable wherever the base is expected |
| Interface Segregation | Each strategy interface exposes only the methods relevant to its concern |
| Dependency Inversion | The manager depends on abstractions (strategy interfaces), not on concrete implementations |

The following table summarises the patterns used and where each earned its place.

| Pattern | Applied To | Justification |
|---------|-----------|---------------|
| State | Trip lifecycle | Rich lifecycle with state-dependent operations |
| Strategy | Matching | Interviewer signalled future variability |
| Strategy | Pricing | Multiple pricing schemes possible in production |
| Strategy | Payment | Distinct behaviour and failure modes per method |
| Facade | `RideManager` | Coordinates many subsystems behind a small interface |
| Factory | Payment construction | Isolates string-to-instance construction from callers |
| Observer | Notifications (deferred) | Not built into initial design; extension point identified |
| Policy | Cancellation fees | Extracted from manager for independent evolution |

---

## 18. Key Takeaways

The following six principles generalise from this design to almost every LLD problem a candidate will encounter.

**Decompose relentlessly, then compose deliberately.** The single most important skill in low-level design is the ability to identify independent concerns and place each in its own component. The ride-sharing system has at least five such concerns (matching, pricing, surge, payment, cancellation) plus a lifecycle state machine, and treating them as truly independent is what allows each to evolve without disturbing the others.

**A good coordinator is a thin coordinator.** The `RideManager` in this design runs under 150 lines and contains no domain logic. Every substantive decision it makes is delegated to a component it holds a reference to. When the coordinator is thin, the system is composable; when the coordinator is fat, the system becomes a monolith with class syntax.

**Every pattern must earn its place.** Patterns are tools, not decorations. The State pattern is used because the trip has a genuinely rich lifecycle; the Strategy pattern is used three times because three independent axes of variation exist; the Facade pattern is used because many components require coordination behind a small interface. Patterns that do not correspond to a real need (such as speculative repositories, builders, or command objects) are omitted.

**Discipline in what is not modelled matters as much as discipline in what is modelled.** Every unnecessary class is future maintenance debt. The design deliberately does not model apps, notifications (as a class), maps, gateways, or routes, because none of these has a genuine operational role at the LLD scope. Restraint here is a demonstration of design maturity.

**Interfaces are contracts, not suggestions.** The narrow interface of `MatchingStrategy.select(trip, drivers) -> Optional[Driver]` prevents matching strategies from developing coupling to unrelated concerns. Every interface in this design is intentionally narrow, and this narrowness is what allows implementations to be substituted freely.

**Follow-up questions are opportunities, not threats.** The concerns raised in follow-up questions (scale, concurrency, notifications, pool rides, scheduled rides, payment failures, trust and safety) are all accommodated by the design without structural changes. Anticipating these questions and rehearsing grounded responses is the difference between a passable design and an impressive one.

---

## 19. Practice Questions and Solutions

The following questions are designed to consolidate understanding of the design decisions made in this deep dive. Each question is accompanied by a full solution.

### Question 1

Suppose the requirement changes so that a rider can specify a preference for a specific driver (a favourite driver). Which component of the design should be modified, and how?

**Solution.** This is a matching-policy change, so it belongs in a new `MatchingStrategy` implementation. A `FavouriteDriverStrategy` would attempt to match the specified favourite driver first if they are available and driving the requested vehicle type, and would fall back to nearest-driver behaviour otherwise. The `RideManager` requires no modification; only a new strategy class is added and the manager is configured with it. This is the Open/Closed Principle in action: extension without modification.

### Question 2

Explain why the `CancellationPolicy` in this design cannot inspect `trip.state` at the time of fee computation. What are two alternative designs that eliminate this limitation, and what is the tradeoff of each?

**Solution.** The `CancellationPolicy` cannot inspect `trip.state` because by the time the policy's `fee` method is invoked, the state has already been transitioned to `Cancelled`. The current design works around this by inferring the pre-cancel state from other markers on the trip (`started_at` and `driver`).

The first alternative is to capture a snapshot of the pre-cancel state on the trip at cancellation time, for example by setting `trip.state_before_cancel = trip.state` before performing the transition. The policy then reads this attribute directly. The tradeoff is an additional piece of state on the trip that exists solely to support the policy computation.

The second alternative is to invert the order of operations: compute the fee first (while the state is still valid), then transition to `Cancelled`. The tradeoff is that fee computation becomes tangled with state-transition logic in the manager, and any failure in the fee computation would leave the trip in an inconsistent state.

Both alternatives eliminate the inference brittleness at some structural cost. The right choice depends on how frequently the cancellation policy is expected to change and how much the design values immutability of the trip's transition sequence.

### Question 3

The `RideManager.complete_trip` method invokes the pricing strategy before performing the state transition to `Completed`, and it sets `trip.completed_at` twice (once directly and once through the state transition). Why is this awkward, and what alternative design would avoid it?

**Solution.** The awkwardness arises because the pricing strategy requires both `started_at` and `completed_at` to be set on the trip in order to compute the duration, but the state transition to `Completed` is what conventionally sets `completed_at`. Setting `completed_at` before the state transition is required to give pricing the data it needs, and the state transition then redundantly sets it again.

The alternative design changes the pricing strategy's signature to take the completion time as an explicit parameter rather than reading it from the trip. The manager then computes the fare as `pricing.compute(trip, now)`, and only the state transition writes to the trip. This removes the double-set and cleanly separates the "compute fare" concern from the "record fare on trip" concern.

The current design was retained because keeping the pricing strategy's signature narrow (`compute(trip)`) is arguably worth the small awkwardness in the manager. Either choice is defensible.

### Question 4

Consider adding a new `Paused` state that represents a mid-trip stop (for example, when a rider asks the driver to wait outside a shop). What changes are required across the design?

**Solution.** The State pattern makes this change substantially easier than it would be under a conditional-based design. The following additions are required:

1.  Add a new `Paused` state class that permits transitions to `Started` (to resume) and to `Cancelled`. The `Started.pause` method is added to allow the transition into `Paused`, and `Paused.resume` allows the transition back.
2.  Add corresponding `pause` and `resume` methods to the `TripState` abstract base with the default raising behaviour.
3.  Add pass-through `pause` and `resume` methods on the `Trip` class.
4.  Add corresponding manager methods `pause_trip` and `resume_trip`.
5.  Decide how paused time is handled by the pricing strategy: does time spent in `Paused` count toward the per-minute charge? If not, the pricing strategy must track paused intervals.

No changes are required to matching, surge, cancellation, or payment. The lifecycle change is contained within the state machine and its immediate coordinators. This localisation is precisely what the State pattern was designed to provide.

### Question 5

The current `NearestDriverStrategy` uses straight-line distance. In production, road distance would be used instead, requiring an external routing service. How should the design accommodate this without making the strategy dependent on the routing service?

**Solution.** The `distance_to` method on `Location` is the current source of distance values. Replacing straight-line distance with road distance requires a different distance computation, but embedding the routing service directly in `Location` would give `Location` a network dependency, which is a significant increase in coupling for a value object.

The correct approach is to inject a distance function into the matching strategy at construction time. The strategy signature becomes `NearestDriverStrategy(distance_fn=lambda a, b: a.distance_to(b))` by default, and a production variant substitutes `distance_fn=road_distance_service.distance_between`. The routing service is thus a dependency of the matching strategy, not of `Location`, which preserves `Location` as a pure value object.

An alternative is to introduce a `DistanceProvider` abstraction that the matching strategy holds a reference to, giving even more flexibility (for example, allowing multiple distance functions to be blended). Either approach preserves the separation between `Location` (a pure value type) and the distance computation (a potentially expensive external operation).

### Question 6

The Factory pattern was introduced for `PaymentMethod` construction. Would a Factory also be justified for constructing `Trip`, `Rider`, or `Driver` instances? Explain.

**Solution.** A Factory is justified when the construction of an object is either complex (many parameters with defaults or interdependencies), variable (multiple concrete subtypes depending on input), or requires isolation from callers (as in the string-to-type dispatch for payment methods).

`Trip` construction is currently direct: the manager creates a `Trip` inside `request_ride`. Introducing a `TripFactory` would add a layer of indirection without corresponding benefit, because there is only one trip type and its constructor arguments are all supplied directly by the caller. This would be pattern-for-its-own-sake, which is a form of over-engineering.

`Rider` construction is similarly direct: an application creates a `Rider` when a user signs up. No factory is needed.

`Driver` construction is a marginally more interesting case because a driver requires a vehicle and a location. If drivers are constructed from database records or from API payloads, a factory could encapsulate the mapping between the input representation and the constructor arguments. Whether this rises to the level of a factory or remains a simple mapping function depends on the complexity of the input format.

The general principle is that Factory is a solution to a specific problem (isolating construction from callers when construction is non-trivial), and applying it in the absence of that problem introduces cost without benefit.

### Question 7

The design uses a single-threaded, in-memory assumption. Describe the smallest set of changes required to make the design safe for concurrent driver assignment, and explain what invariant this preserves.

**Solution.** The concurrent-assignment vulnerability is in `RideManager.request_ride`, where the sequence of operations (invoke matching, mark driver unavailable) is not atomic. If two threads execute this sequence with overlapping timing, both may observe the same driver as available and both may attempt to assign them.

The smallest change is to introduce a lock (either a global lock on the manager or a per-driver lock) around the read-then-mark sequence:

```python
with self._matching_lock:
    driver = self._matching.select(trip, list(self._drivers.values()))
    if driver is not None:
        trip.assign_driver(driver)
        driver.is_available = False
```

The invariant preserved by this lock is that at most one trip observes any given driver as available and successfully assigns them. Any two threads attempting to assign the same driver will serialise, and only the first will succeed; the second will re-invoke matching after the lock is released and either select a different driver or receive None.

A more scalable alternative uses compare-and-swap on the `is_available` flag itself, avoiding the global lock and allowing higher throughput at the cost of occasional retries. The invariant preserved is identical.

Either approach requires no changes to the strategy classes, the state classes, or the trip class. The concurrency concern is localised to the manager's coordination logic, which is where it belongs.

### Question 8

Explain why the `Rider` class in this design is retained even though it contains no additional attributes or methods beyond what `User` provides. Under what circumstances would you eliminate it?

**Solution.** The `Rider` class is retained because it provides type identity even in the absence of additional state. A method signature such as `def request_ride(rider: Rider, ...)` establishes at development time (through type checkers such as mypy or pyright) that a `Driver` cannot be accidentally passed where a `Rider` is expected. This kind of type-based error prevention is valuable and comes at the cost of a two-line subclass.

The class would be eliminated only under the following circumstances. If the design were entirely dynamically typed with no type-checker involvement, the type identity benefit would be reduced (though not eliminated, because `isinstance(user, Rider)` would still work). If it were established that no rider-specific behaviour or attribute would ever be added and no type-based distinction was desired, the class would become truly redundant. In practice, both of these conditions are rarely met, and retaining the subclass is the safer default.

### Question 9

The `SurgeCalculator` interface takes both a time and a location as parameters, even though the default implementation ignores the location. Explain the design principle at work and give one other example of the same principle from this design.

**Solution.** The principle is that an interface should be designed for the range of expected implementations, not merely for the current default. Including the location parameter in `multiplier` allows future area-based surge implementations to be substituted without any caller change. Omitting the location would force every caller of `multiplier` to change when area-based surge is added, propagating the modification across the codebase.

The same principle appears in the `MatchingStrategy.select(trip, drivers)` signature. The trip parameter includes source location, requested vehicle type, and rider identity, even though the default `NearestDriverStrategy` uses only source location and vehicle type. A future strategy that considers rider preferences (favourite drivers, historical driver ratings) needs only the trip parameter as it already exists.

This principle is sometimes called "designing for the interface, not the implementation," and it is one of the practical manifestations of the Open/Closed Principle at the level of method signatures.

### Question 10

The `RideManager.rate_trip` method updates the running average on both `Driver` and `Rider` through their shared `update_rating` method on `User`. Is this a violation of the Liskov Substitution Principle? Explain.

**Solution.** No, this is not a violation. Liskov Substitution requires that subclass instances be usable wherever superclass instances are expected, without altering the correctness of the program. In this design, both `Rider` and `Driver` inherit `update_rating` from `User` and implement it identically (through inheritance, without override). The method's behaviour is consistent regardless of which subtype the instance is, so substitutability holds trivially.

A hypothetical violation would arise if, for example, `Driver.update_rating` were overridden to reject updates below a certain threshold (thereby narrowing the accepted input), or if `Rider.update_rating` had side effects that `Driver.update_rating` lacked (thereby introducing behavioural inconsistency). In such cases, code that relied on `User.update_rating`'s general contract would produce different results depending on the actual runtime type, which is the essence of a Liskov violation.

The current design avoids this pitfall by keeping the rating behaviour on the base class and having both subclasses inherit it unchanged.

---

## 20. Further Reading and Cross-References

This deep dive is one of a series of low-level design problem walkthroughs. The recommended reading order for a learner working through the full curriculum is as follows.

1.  `01_oop_in_python.md` for the Python object-oriented foundations assumed throughout.
2.  `02_solid_principles.md` for the SOLID principles referenced at every stage of this design.
3.  `03_design_patterns_creational.md`, `04_design_patterns_structural.md`, and `05_design_patterns_behavioral.md` for the design patterns applied here (Strategy, State, Facade, Factory).
4.  `06_lld_interview_questions.md` for the general approach to LLD interview problems.
5.  `06a_lld_parking_lot_deep_dive.md`, `06b_lld_elevator_deep_dive.md`, and `06c_lld_library_deep_dive.md` for earlier problems in the series that establish techniques used here.
6.  `07_advanced_lld_topics.md` for the follow-up topics (concurrency, distribution, event-driven architecture) touched on in section 16.

The accompanying modular Python project (`ride_sharing_system/`) implements the design described in this document. Reading the code alongside the corresponding sections here is the most effective way to internalise the design and to develop the ability to reproduce it under interview conditions.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch. Explore more at https://codeverra.com*
