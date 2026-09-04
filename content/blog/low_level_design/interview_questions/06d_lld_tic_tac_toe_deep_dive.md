# LLD Deep Dive #4: Designing a Tic Tac Toe Game

> **What this document covers:** A rigorous, step-by-step examination of how to approach a Tic Tac Toe Low-Level Design (LLD) problem in a technical interview. The document walks through the reasoning process at each design juncture, evaluates competing alternatives, and provides justification for every decision made. The finished design is a consequence of the reasoning, not its starting point.
>
> **How to read this document:** Read it slowly and deliberately. The problem appears trivial at the surface, since Tic Tac Toe requires only a three by three grid, two players, and a rule for detecting three marks in a row. That surface simplicity is precisely why the problem is used in interviews: it invites the unwary candidate to produce a short procedural script, when the actual expectation is a properly modelled, extensible, and testable object-oriented design.

---

## Table of Contents

1. [Why This Problem Is Deceptively Instructive](#1-why-this-problem-is-deceptively-instructive)
2. [Stage 1: Receiving the Problem Statement](#2-stage-1-receiving-the-problem-statement)
3. [Stage 2: Clarifying the Requirements](#3-stage-2-clarifying-the-requirements)
4. [Stage 3: Identifying the Domain Entities](#4-stage-3-identifying-the-domain-entities)
5. [Stage 4: Modelling the Board and Cells](#5-stage-4-modelling-the-board-and-cells)
6. [Stage 5: Modelling Symbols and Players](#6-stage-5-modelling-symbols-and-players)
7. [Stage 6: Making a Move, Validation and Placement](#7-stage-6-making-a-move-validation-and-placement)
8. [Stage 7: Win Detection as an Algorithmic Concern](#8-stage-7-win-detection-as-an-algorithmic-concern)
9. [Stage 8: Modelling the Game State](#9-stage-8-modelling-the-game-state)
10. [Stage 9: The Game Class as the Orchestrator](#10-stage-9-the-game-class-as-the-orchestrator)
11. [Stage 10: Introducing an AI Player via the Strategy Pattern](#11-stage-10-introducing-an-ai-player-via-the-strategy-pattern)
12. [Stage 11: Observers for Game Events](#12-stage-11-observers-for-game-events)
13. [Stage 12: Validating the Design Through Mental Simulation](#13-stage-12-validating-the-design-through-mental-simulation)
14. [Stage 13: Anticipating Follow-Up Questions](#14-stage-13-anticipating-follow-up-questions)
15. [Practice Questions with Detailed Solutions](#15-practice-questions-with-detailed-solutions)
16. [Summary Tables and Key Takeaways](#16-summary-tables-and-key-takeaways)
17. [Final Reflection on the Design Process](#17-final-reflection-on-the-design-process)

---

## 1. Why This Problem Is Deceptively Instructive

Before examining the mechanics of the design, it is worth establishing why an interviewer selects this specific problem. Low-Level Design (LLD) is the discipline of translating a set of functional requirements into a well-structured collection of classes, interfaces, and relationships that together implement the required behaviour. LLD sits between requirements analysis on one side and code implementation on the other, and its principal concerns are separation of responsibilities, extensibility, testability, and the correct use of design patterns.

Tic Tac Toe is chosen for interviews because it exhibits a specific combination of properties that make it useful as an assessment instrument. The problem is small enough to be completed within a typical interview window of forty-five to sixty minutes, yet it contains at least four independent design concerns: representation of the board, modelling of players and their behaviours, detection of terminal game conditions, and orchestration of the game loop. Each of these concerns admits multiple reasonable design choices, and the interviewer is interested in observing how the candidate reasons about those choices rather than simply which one is picked.

The following capabilities can be demonstrated through this problem:

1. **Class identification at appropriate granularity.** Producing too few classes results in procedural code disguised as object-oriented code. Producing too many classes results in excessive ceremony and cognitive load. The candidate is expected to draw the line between what deserves to be a first-class abstraction and what is better represented as a value or attribute.
2. **State-machine modelling.** A game progresses through a small number of well-defined states such as in-progress, won, and drawn. This provides an opportunity to demonstrate awareness of state modelling techniques and, importantly, the judgement to know when the full State pattern is warranted versus when a simpler enumeration and guard clauses will suffice.
3. **Application of the Strategy pattern.** Two independent behaviours in the system can vary: how a player selects a move (human input versus algorithmic computation) and how the win condition is evaluated (three in a row on a three by three board versus more general variants). Both are canonical use cases for the Strategy pattern, which is defined as an object-oriented pattern that encapsulates interchangeable algorithms behind a common interface.
4. **Extensibility thinking.** The interviewer will typically ask follow-up questions that require the design to accommodate a four by four board, a K-in-a-row rule, more than two players, or networked play. A rigid design fails these questions; a properly abstracted design accommodates them with minimal change.
5. **Complexity analysis of the win-detection algorithm.** Naive implementations rescan the entire board after every move, incurring redundant work. More efficient implementations exploit the observation that only a bounded number of lines can be affected by the most recent move. The candidate is expected to articulate this trade-off and justify the choice made.

A candidate who produces a short procedural script and stops has signalled that they do not distinguish coding from designing. A candidate who produces a properly abstracted design with clearly justified boundaries, pluggable strategies, and validated invariants has signalled senior-level thinking on a problem that junior candidates dismiss as an easy warm-up.

**Definition of key terms used above:**

- **Low-Level Design (LLD):** The activity of specifying the internal class structure, interfaces, method signatures, and object interactions that will realise a given set of requirements, typically expressed through class diagrams, sequence diagrams, and reference implementations.
- **Design pattern:** A named, general, reusable solution to a commonly occurring problem in software design, originally catalogued in the 1994 work commonly referred to as the Gang of Four book.
- **Strategy pattern:** A behavioural design pattern that defines a family of algorithms, encapsulates each one behind a common interface, and makes them interchangeable at runtime through composition.
- **State pattern:** A behavioural design pattern that allows an object to alter its behaviour when its internal state changes, by delegating state-specific behaviour to a separate class per state.
- **Observer pattern:** A behavioural design pattern that defines a one-to-many dependency between objects, so that when one object changes state, all its registered dependents are notified automatically.

---

## 2. Stage 1: Receiving the Problem Statement

The interviewer opens with a deliberately terse instruction:

> "Design a Tic Tac Toe game."

No specification is provided for board dimensions, number of players, presence of artificial intelligence, user interface expectations, or extensibility requirements. This vagueness is intentional and forms the first evaluation criterion: the candidate is being observed to determine whether they will proceed to code immediately or first establish scope.

Proceeding to code immediately, however familiar the problem may feel from childhood, is an error. The instruction admits several materially different interpretations:

1. **Board dimensions.** The classical three by three board is one possibility, but variants exist that use four by four, five by five, or even fifteen by fifteen grids as in the game of Gomoku.
2. **Number of players.** Two players is the standard case, but nothing in the instruction rules out three or four player variants.
3. **Player types.** Both players might be human, or one might be an artificial intelligence, or the game might need to support arbitrary combinations of human and machine participants.
4. **Presentation surface.** The game might run on a command-line terminal, in a web browser, or as a graphical desktop application, or the interviewer may consider the user interface entirely out of scope.
5. **Win condition.** Traditional Tic Tac Toe requires three collinear identical symbols. A generalisation to N-in-a-row on an N by N board is common, and further generalisations to K-in-a-row on an N by N board (where K may differ from N) are also possible.
6. **Auxiliary features.** The design may or may not need to support undo of moves, saving and loading of games, replay of historical games, and score tracking across multiple sessions.
7. **Deployment context.** The game might be a single-process console program, a networked multiplayer service, or an embedded component of a larger application.

Making incorrect assumptions on any of these axes results in wasted design effort that cannot be recovered without discarding work. The disciplined response is therefore to pause, indicate that clarifying questions will follow, and then proceed methodically through those questions. A single introductory sentence establishes the correct posture: "Before I begin sketching classes, I would like to ask a series of clarifying questions to establish the scope and expected behaviours." This sentence signals professional maturity and separates the candidate from those who begin typing immediately.

---

## 3. Stage 2: Clarifying the Requirements

Requirements clarification is a structured activity, not a random enumeration of questions. The recommended structure organises questions into three categories, each of which serves a distinct purpose in the design process.

**Functional requirements** describe what the system must do, expressed in terms of observable behaviours and outcomes. They answer questions of the form "what actions does the system perform?" and "what results does it produce?"

**Non-functional requirements** describe qualities that the system must possess but that are not themselves behaviours. Common non-functional concerns include performance characteristics, concurrency behaviour, persistence requirements, security constraints, and scale expectations.

**Out-of-scope declarations** enumerate concerns that are intentionally excluded from the design. Making these explicit prevents the candidate from over-engineering solutions to problems the interviewer did not ask them to solve, and it makes the assumed boundary of the design visible.

The following subsections walk through the actual questions the candidate should ask, along with the rationale for asking each and the design implications of the likely answers.

### Question 1: Should the board be fixed at three by three, or configurable to arbitrary N by N?

The importance of this question stems from its effect on the win-detection algorithm. A fixed three by three board permits enumerating the eight winning lines as constants, whereas a configurable N by N board demands a general-purpose algorithm that generates winning lines dynamically. Designing initially for the fixed case and later discovering the requirement was general leads to substantial rework.

Suppose the interviewer replies: "The board should support arbitrary N by N sizes, with three as the default." This single sentence has significant design implications. The board dimension must become a parameter rather than a hard-coded constant, and the win-detection component must operate uniformly across all values of N.

### Question 2: What is the win condition for board sizes greater than three?

On a three by three board, the condition of three identical marks in a row is unambiguous and coincides with the natural notion of N in a row where N equals the board size. On larger boards, however, two natural generalisations exist. The first requires N marks in a row, where N equals the board dimension. The second allows the winning line length K to differ from the board dimension N, enabling variants such as Gomoku, which requires five in a row on a fifteen by fifteen board.

Suppose the interviewer specifies: "For an N by N board, the win condition is N in a row. Keep the design simple." This answer permits a single algorithm that generates all lines of length equal to the board dimension. The more general K-in-a-row rule will be considered later as an extension point.

### Question 3: How many players participate, and what types of players are supported?

The number of players affects the turn-rotation logic and the assignment of symbols. Supporting only two players permits certain simplifications, such as representing whose turn it is by a Boolean flag, whereas supporting a variable number of players requires index-based rotation. The type of player also matters: a human player receives moves through input from a console or user interface, while an artificial intelligence player computes moves through an algorithm. These two behaviours have almost nothing in common at the implementation level, though they share the same conceptual role in the game.

Suppose the interviewer answers: "Support two players initially, both human. However, the design should accommodate the future addition of an artificial intelligence opponent without requiring modification of the game logic." This is a direct invitation to apply the Strategy pattern to the player abstraction, defining a common interface that both human and machine players will implement.

### Question 4: Is the user interface in scope, and if so, what form should it take?

User interface concerns can consume disproportionate amounts of design effort if not scoped explicitly. Interviewers typically expect the candidate to focus on the game logic and its abstractions, treating any rendering concerns as adjacent rather than central.

Suppose the interviewer states: "Console rendering is acceptable for demonstration purposes, but the interview evaluation will concentrate on the game logic and its abstractions rather than on presentation." This response permits a minimal string-based rendering method on the board and defers any more sophisticated presentation to a future concern.

### Question 5: Are features such as undo, save, load, or replay required?

These features individually appear modest but each of them changes the design substantively. Undo requires the ability to reverse a move, which in turn requires either a history of moves or a snapshot mechanism. Save and load require serialization of game state. Replay requires either a move log or the ability to reconstruct intermediate states.

Suppose the interviewer answers: "None of these are required for the initial version. Mention them briefly as potential extensions." The design should therefore not implement these features but should be structured in a way that permits their later addition. Maintaining a move history at negligible cost is a defensible pre-emptive investment because it enables undo, replay, and audit features without redesign.

### Question 6: Is the design a single game session, or is it expected to manage multiple games such as a tournament?

The distinction between a single game and a series of games is architecturally significant because tournament management introduces new concerns such as bracketing, score aggregation, and match scheduling. Assuming the wrong scope leads to either an incomplete design or an over-engineered one.

Suppose the interviewer states: "One game per session is sufficient. Tournament features are out of scope." This confirms a simpler design without a Tournament class or associated scaffolding.

### Question 7: What are the concurrency and persistence requirements?

Two humans playing on a single console produce a strictly sequential interaction that requires no concurrency management. Networked multiplayer games, in contrast, require careful attention to concurrent state modification, message ordering, and recovery from disconnected clients. Persistence requirements determine whether game state must survive process termination.

Suppose the interviewer confirms: "The design is a single-process, in-memory game with no networking or persistence requirements." This clearance permits a straightforward synchronous design without introducing locks, transactions, or external storage.

### Consolidating the Scope

Once the clarification round is complete, the candidate should restate the confirmed scope back to the interviewer in a single consolidated summary. Restating serves two purposes: it forces the interviewer to confirm or correct the candidate's understanding before design work begins, and it visibly documents the assumptions on which the subsequent design will rest.

A suitable restatement is: "The design will support a two-player game on an N by N board with a default size of three, using the N-in-a-row win condition across rows, columns, and diagonals. Both players are human initially, but the player abstraction should allow an artificial intelligence player to be added later without modification of the game logic. Rendering will be minimal and console-based. There is one game per session, no undo or persistence, no networking, and no concurrency requirements. Please confirm if any of these assumptions is incorrect or incomplete."

This confirmation gate is the natural transition point from analysis into design.

---

## 4. Stage 3: Identifying the Domain Entities

With the requirements fixed, the next activity is to identify the classes that will populate the design. The recommended technique is noun extraction: enumerate the significant nouns in the requirements specification and evaluate each one as a candidate class. Not every noun deserves its own class, however, and the discipline lies in the filtering step rather than the enumeration step.

Three questions guide the filter. First, does the noun have distinct identity, meaning that different instances of it need to be tracked separately? Second, does the noun possess its own state or behaviour, distinguishing it from a mere data value? Third, is the noun genuinely part of the problem domain, or is it a piece of technical vocabulary or a linguistic filler that should not be reified into a class?

The nouns present in the clarified requirements include the following: game, board, cell, player, human player, artificial intelligence player, symbol, mark, move, position, turn, win condition, score, and console. Applying the three-question filter yields the following assessment:

| Noun | Distinct Identity | Own State or Behaviour | Verdict |
|---|---|---|---|
| Game | Yes, one game per session | Yes, orchestrates play | **Class** |
| Board | Yes, one per game | Yes, stores cells and validates moves | **Class** |
| Cell | Weak, referenced by coordinates | None beyond holding a symbol | **Not a class** (represented as a symbol value inside the board grid) |
| Player | Yes, one per participant | Yes, holds identity and generates moves | **Class hierarchy** |
| Symbol / Mark | Small fixed set of values | None beyond identity of the value | **Enumeration** |
| Move | Yes, each move is a distinct event | Small, primarily data | **Immutable data class** |
| Position | Weak, referenced by row and column | None beyond value semantics | **Immutable data class** |
| Turn | Not an entity, merely a piece of state | None | **Attribute of Game** |
| Win condition | Not an entity, but an algorithm | Yes, defines behaviour | **Strategy interface** |
| Score | Not tracked in single-game scope | None | **Rejected for the current scope** |
| Console | Rendering surface | Yes, produces output | **Small helper class if needed** |

Two of the entries in this table involve judgement calls that warrant explicit justification, since the wrong decision in either case would degrade the design.

### Justification for Not Modelling Cell as a Class

A cell in this problem holds exactly one value from the fixed set {X, O, EMPTY}. Introducing a Cell class would create a wrapper around a single enumeration value, contributing indirection without adding either state or behaviour. The Single Responsibility Principle, which states that a class should have one and only one reason to change, cannot be satisfied by a class that has no responsibility beyond storing a single enumeration value. Consequently, the board grid will be represented as a two-dimensional array of Symbol values, and any per-cell operations will be expressed as methods on the Board class using coordinate pairs.

This decision is reversible if requirements later demand richer per-cell behaviour, such as cells that award scoring multipliers or cells that are highlighted for animation. The principle of You Aren't Gonna Need It (YAGNI) counsels against introducing such structures speculatively, and the noun filter correctly excludes them at this stage.

### Justification for Modelling Position as a Frozen Data Class

A position denotes the coordinates of a cell on the board and is used pervasively throughout the design: in method signatures, in the move history, and potentially as keys in dictionaries for indexed lookup. Four representations are available: a raw tuple, a namedtuple, a frozen dataclass, and a full class.

A raw tuple of the form (row, column) provides no attribute names and no type documentation, which reduces code readability and eliminates the possibility of static type checking on individual fields. A namedtuple resolves the attribute-naming concern but retains the implementation constraints of a tuple. A frozen dataclass, introduced in Python 3.7, provides named typed attributes, immutability, automatic implementation of equality and hashing, and the ability to add methods later without changing the calling code. A full class introduces ceremony without corresponding benefit at this scale.

The frozen dataclass is selected because it provides the best combination of type safety, immutability, hashability (which permits use as dictionary keys), and extensibility. The term "frozen" here means that instances cannot be modified after construction; any attempt to assign to a field raises a FrozenInstanceError. Immutability is desirable for Position because a coordinate pair is conceptually a value, and values do not change over time.

### Final Set of Classes and Supporting Types

Applying the noun filter yields the following components:

**Classes:**
- `Game`, which coordinates the overall game loop
- `Board`, which maintains the grid state and enforces move legality
- `Player`, the abstract base for all player types
- `HumanPlayer`, which reads moves from console input
- `RandomAIPlayer` and `SmartAIPlayer`, which will be introduced in Stage 10

**Interfaces (abstract base classes):**
- `WinChecker`, which encapsulates the algorithm for determining a winner
- `GameObserver`, which will be introduced in Stage 11 for event notification

**Enumerations:**
- `Symbol`, holding the values X, O, and EMPTY
- `GameStatus`, holding the values IN_PROGRESS, WON, and DRAWN

**Immutable data classes:**
- `Position`, denoting a coordinate pair
- `Move`, recording a completed move as a historical fact

**Exceptions:**
- `GameOverError`, raised when a move is attempted after the game has ended

The classes deliberately omitted include Cell, Turn, Score, Rules as an entity, and any Tournament-related structures. Each omission is a design decision, not an oversight, and each is justified by the current scope. This restraint is central to sound design; a class that is not needed is a class that will not need to be maintained, tested, or explained.


---

## 5. Stage 4: Modelling the Board and Cells

The Board class occupies a central position in the design because it holds the ground-truth state of the game. Design choices at this stage propagate through the rest of the system, so each choice warrants explicit justification.

### Choice of Grid Representation

Three plausible representations exist for the grid.

**Representation A: two-dimensional list.** The grid is stored as a list of lists, where each inner list represents one row. Access is performed via `grid[row][column]`. This representation matches the conventional mental model of a two-dimensional array, and it produces code that reads naturally in relation to the problem statement. Memory overhead includes one list object per row plus one list object for the outer container, which is negligible for the board sizes under consideration.

**Representation B: one-dimensional list with index arithmetic.** The grid is stored as a single flat list of length N times N, and coordinate access is computed as `grid[row * N + column]`. This representation uses slightly less memory than the two-dimensional list because it involves one list object rather than N plus one. The associated cost is that all coordinate access requires explicit index arithmetic, which introduces opportunities for off-by-one errors and reduces readability.

**Representation C: dictionary keyed by Position.** The grid is stored as a dictionary from Position to Symbol, with occupied cells present as keys and unoccupied cells either absent or explicitly mapped to EMPTY. This representation is efficient in memory when the board is sparsely populated, and it generalises naturally to non-rectangular grids such as hexagonal boards. The associated cost is hashing overhead on every access and the loss of natural ordering when iterating over cells.

The two-dimensional list representation is selected for this design. The reasoning is that the board is small and dense in every scenario the design must support, so the memory arguments for Representation B do not apply. The readability argument in favour of Representation A is significant, since the code will read almost identically to the mathematical description of the problem. The generalisation argument for Representation C does not apply because the problem specifies a rectangular board.

### Location of Move Validation Logic

When a player attempts to place a mark at a coordinate pair, two conditions must be verified: the coordinate pair must lie within the bounds of the board, and the cell at that coordinate must currently be empty. Three plausible locations exist for this validation logic.

The first option locates validation on the top-level Game class, treating validation as a coordination responsibility. The second option locates validation on the Board class, treating validation as a natural consequence of the fact that the Board holds the state being validated. The third option introduces a separate MoveValidator class, treating validation as a distinct concern worthy of its own abstraction.

The second option is selected. The Board class is the sole holder of the state that determines move legality, so placing the validation on the Board minimises the amount of state that must be exposed to other classes and honours the principle that logic belongs with the data it operates on. Introducing a MoveValidator class would separate the validation logic from the state it validates without corresponding benefit, since the validation rules under consideration are simple and are unlikely to grow substantially. The Game class will invoke Board methods to perform validation rather than duplicating the logic.

### Handling of Invalid Move Attempts

Two error-signalling conventions are available: return a Boolean indicating success or failure, or raise an exception when an invalid operation is attempted. The choice determines the ergonomics and safety of the calling code.

The convention adopted here is to expose a query method `is_valid_move` that returns a Boolean without raising, and a mutating method `place` that raises `ValueError` if invoked with an invalid argument. The rationale is that the query method is expected to be used defensively by callers who wish to check legality before acting, whereas the mutating method should not be reached with an invalid argument in correctly written code. Silent failure of a mutating method would obscure programming errors and defer their detection, whereas an exception surfaces the error immediately at its source. This convention mirrors the design of Python's built-in data structures, where methods such as `dict.pop` provide both a mutating variant and a variant with a default value for defensive use.

### The Board Class Implementation

The implementation that follows realises the design decisions justified above.

```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Symbol(Enum):
    """
    Enumeration of the possible values a cell may hold.

    Definition: An enumeration is a finite, named set of related values.
    Python's Enum class provides type safety by restricting the set of
    admissible values at both runtime and static analysis time.

    Design rationale for including EMPTY as an enum member rather than
    representing empty cells with None:
      1. Uniform typing. Every cell holds a value of type Symbol,
         which eliminates the need to write Optional[Symbol] throughout
         the codebase and simplifies type annotations for method
         signatures that operate on cell values.
      2. Explicit rendering. An EMPTY value carries a display glyph
         (the dot character below), which the rendering method can
         emit uniformly without a conditional branch for None.
      3. Semantic clarity. An empty cell is a distinct game-state
         concept, and representing it as a first-class enumeration
         value acknowledges its status as such.
    """
    EMPTY = "."
    X = "X"
    O = "O"


@dataclass(frozen=True)
class Position:
    """
    Immutable coordinate pair identifying a cell on the board.

    Definition: A dataclass is a Python construct, introduced in
    Python 3.7 via PEP 557, that generates boilerplate methods
    (__init__, __repr__, __eq__, and optionally __hash__) from
    a class definition annotated with type-hinted attributes.

    The frozen=True parameter marks instances as immutable: any
    attempt to assign to an attribute after construction raises
    FrozenInstanceError. Immutability is desirable here because a
    Position is conceptually a mathematical value, and values do not
    change over time. Immutability also enables use of Position as
    a dictionary key, since frozen dataclasses receive a working
    __hash__ implementation automatically.

    A Position could alternatively be represented as a plain tuple,
    but a dataclass provides attribute names (pos.row instead of
    pos[0]) and allows methods to be attached in future revisions
    without changing the calling convention.
    """
    row: int
    col: int


class Board:
    """
    The N-by-N game grid, responsible for storing cell state and
    enforcing the rules governing move legality.

    Responsibilities, aligned with the Single Responsibility Principle:
      1. Store the current value of every cell.
      2. Report the current value at any given coordinate.
      3. Determine whether a proposed move is legal.
      4. Apply a legal move by placing a symbol at a coordinate.
      5. Report whether the board is fully occupied.
      6. Produce a human-readable rendering of the board state.

    Responsibilities explicitly excluded from this class:
      1. Determining whether the game has been won. Win detection is
         encapsulated separately in a WinChecker implementation so
         that alternative win rules can be introduced without
         modifying the Board class.
      2. Managing turn rotation or player identity. The Board operates
         solely in terms of Symbol values and has no awareness of
         which player holds which symbol.
      3. Rendering to any surface beyond returning a string. Producing
         graphical or networked output is the concern of a separate
         presentation component.
    """

    def __init__(self, size: int = 3):
        """
        Construct an N-by-N board with every cell initialised to EMPTY.

        The minimum admissible size is three. Boards of size one and
        two are excluded because they are degenerate: a one by one
        board is won by any move, and a two by two board admits only
        trivial or unwinnable configurations. Rejecting these sizes
        at construction time prevents downstream code from having to
        handle these anomalous cases.
        """
        if size < 3:
            raise ValueError(
                f"Board size must be at least 3, received {size}"
            )

        self.size = size

        # The grid is constructed using a nested list comprehension
        # rather than the more concise but incorrect expression
        # [[Symbol.EMPTY] * size] * size. The latter form creates a
        # single inner list and repeats the reference to it size
        # times, which means that mutating one row would mutate all
        # rows. The nested comprehension creates a distinct inner
        # list for each row and thereby avoids this aliasing hazard.
        self._grid: list[list[Symbol]] = [
            [Symbol.EMPTY for _ in range(size)] for _ in range(size)
        ]

        # An occupied-cell counter is maintained so that the is_full
        # query can be answered in constant time. Recomputing the
        # count by iteration would require O(N squared) work per
        # query, which is inconsequential for small boards but
        # unnecessary given that the counter is trivially maintained
        # by incrementing on each successful placement.
        self._filled_count = 0

    # ------------------------------------------------------------------
    # Query methods, none of which mutate the board state.
    # ------------------------------------------------------------------

    def get(self, position: Position) -> Symbol:
        """
        Return the Symbol currently occupying the given position.
        The caller is expected to have verified that the position
        lies within bounds before invoking this method.
        """
        return self._grid[position.row][position.col]

    def is_in_bounds(self, position: Position) -> bool:
        """
        Return True if and only if the given coordinate pair falls
        within the valid index range of the board along both axes.
        """
        return (
            0 <= position.row < self.size
            and 0 <= position.col < self.size
        )

    def is_empty_at(self, position: Position) -> bool:
        """
        Return True if the position is both within bounds and currently
        occupied by the EMPTY symbol. This is a defensive combination
        that ensures the bounds check precedes the cell access, since
        indexing an out-of-range coordinate would raise IndexError.
        """
        return (
            self.is_in_bounds(position)
            and self._grid[position.row][position.col] == Symbol.EMPTY
        )

    def is_valid_move(self, position: Position) -> bool:
        """
        Return True if the given position is a legal target for a move,
        which requires that it be within bounds and currently empty.
        Callers use this method to determine whether it is safe to
        invoke the place method with the given position.
        """
        return self.is_empty_at(position)

    @property
    def is_full(self) -> bool:
        """
        Return True if every cell on the board has been played.
        The computation is constant time thanks to the maintained
        occupancy counter, in contrast to a full iteration over the
        grid.
        """
        return self._filled_count == self.size * self.size

    # ------------------------------------------------------------------
    # Mutating methods.
    # ------------------------------------------------------------------

    def place(self, symbol: Symbol, position: Position) -> None:
        """
        Place the given symbol at the given position, subject to
        validation.

        Three conditions must be satisfied for the placement to
        proceed. First, the symbol must be a real playing symbol
        rather than EMPTY, since EMPTY does not represent a move
        that any player would make. Second, the position must lie
        within the bounds of the board. Third, the target cell must
        currently be empty.

        If any of the three conditions is violated, the method raises
        ValueError with a descriptive message identifying the specific
        violation. Raising rather than returning False is appropriate
        here because reaching this method with invalid arguments
        indicates a programming defect in the caller, and defects
        should surface immediately at their source rather than being
        silently absorbed.
        """
        if symbol == Symbol.EMPTY:
            raise ValueError(
                "Cannot place EMPTY as a move; EMPTY is a state, not an action"
            )
        if not self.is_in_bounds(position):
            raise ValueError(
                f"Position {position} is out of bounds for a board "
                f"of size {self.size}"
            )
        if not self.is_empty_at(position):
            raise ValueError(
                f"Position {position} is already occupied by "
                f"{self.get(position).value}"
            )

        self._grid[position.row][position.col] = symbol
        self._filled_count += 1

    # ------------------------------------------------------------------
    # Rendering. This is deliberately minimal since presentation
    # concerns are outside the scope of the game logic.
    # ------------------------------------------------------------------

    def render(self) -> str:
        """
        Return a human-readable multi-line string representation of the
        board suitable for printing to a text terminal. The method
        returns a string rather than printing directly so that callers
        may redirect the output to a log file, a test assertion, or an
        alternative presentation surface without modification of this
        method.
        """
        header = "    " + "   ".join(str(c) for c in range(self.size))
        separator = "   " + "-" * (4 * self.size - 1)

        rows = []
        for r in range(self.size):
            cells = "   ".join(
                self._grid[r][c].value for c in range(self.size)
            )
            rows.append(f" {r} | {cells}")

        return "\n".join([header, separator] + rows)
```

Several aspects of this implementation warrant additional commentary.

The decision to include EMPTY as a Symbol enumeration value rather than using None simplifies typing throughout the codebase. Every cell holds a value of type Symbol, which permits methods that operate on cell values to be typed without the overhead of Optional wrapping, and which permits equality comparisons to be expressed uniformly.

The occupancy counter `_filled_count` is a form of derived state that is maintained incrementally on each successful placement. The alternative of recomputing the count by iteration on demand would be functionally equivalent but computationally wasteful. The tradeoff of maintaining derived state is the requirement to keep it consistent with the primary state, which is why placement is the only method that mutates the counter and does so atomically alongside the grid modification.

The list comprehension used to construct the initial grid deliberately avoids the concise but hazardous form that multiplies a single row list. The multiplied form produces a list containing multiple references to the same inner list, so mutating any single row through indexing would mutate every row. The nested comprehension creates an independent inner list for each row and thereby avoids this aliasing hazard entirely.

Win-detection logic is deliberately absent from this class. The reason is that win detection is a candidate variation point in the design, and locating variable behaviour behind a dedicated abstraction is a core discipline of extensible design. A separate WinChecker class will be introduced in Stage 7.


---

## 6. Stage 5: Modelling Symbols and Players

The Symbol enumeration was defined in the previous section. This section addresses the Player abstraction, which is the mechanism by which different kinds of move-generating actors are represented uniformly within the game.

### Choice Between a Single Class and a Class Hierarchy

Two competing designs are available for representing players.

The first design uses a single Player class with a callable attribute that provides moves. The callable is injected at construction time and may point to a function that reads console input, a function that computes a move algorithmically, or any other move-producing function. The advantages of this design are its brevity and its functional character. The disadvantages are that different kinds of players may require different auxiliary state, such as game-tree search parameters for an artificial intelligence, and packing all such state into a single class produces a class with an ill-defined responsibility.

The second design uses an abstract Player class as the root of a hierarchy, with concrete subclasses HumanPlayer, RandomAIPlayer, and SmartAIPlayer implementing the abstract interface. The advantages of this design are that each subclass may carry its own state and behaviour without polluting the others, and that the abstract interface documents the contract that every player must honour. The disadvantages are the initial ceremony of defining a class hierarchy for what could be a single class.

The class hierarchy design is selected for two principal reasons. The first reason is that the different kinds of players in this design have materially different state and behaviour: a human player interacts with the console, an artificial intelligence player evaluates game trees, and a hypothetical networked player would communicate over a socket. Encapsulating each of these in its own class localises the associated concerns. The second reason is that the class hierarchy provides a natural place to formally state, using the abstract method mechanism, the contract that all players must satisfy. This aligns with the Interface Segregation Principle, which states that clients should not be forced to depend on interfaces they do not use, and with the general principle of programming to an interface rather than an implementation.

### Assignment of Symbols to Players

A player is associated with a specific playing symbol for the duration of a game. Two designs are available for making this association.

The first design constructs a Player with its symbol supplied as a constructor argument. The player's symbol is intrinsic to its identity from the moment of construction, and any code that examines the player can immediately determine its symbol without consulting external state.

The second design constructs a Player without a symbol and assigns the symbol later, typically when the player is added to a game. This design permits the same player object to participate in multiple games with different symbols, at the cost of an intermediate state in which the player exists but has no assigned symbol.

The first design is selected. The player and its symbol are conceptually inseparable during the game, and constructing them together avoids the intermediate unassigned state that the second design would produce. The consequence is that a player object is bound to a single game session; if the same human were to play in multiple games, a new Player object would be constructed for each. This trade-off is acceptable given the scope of the design.

### The Player Class Hierarchy Implementation

```python
from abc import ABC, abstractmethod


class Player(ABC):
    """
    Abstract base class defining the interface that all player types
    must implement.

    Definition: An abstract base class (ABC) is a class that cannot
    be instantiated directly and that declares one or more abstract
    methods that concrete subclasses must implement. Python provides
    the abstract base class mechanism through the abc module.

    Design rationale for defining a class hierarchy rather than a
    single Player class with a move-provider callback:

      1. Different player types have materially different auxiliary
         state. A human player has no computation-related state, a
         Monte Carlo AI has iteration counts and random seeds, a
         minimax AI has search depth limits and evaluation function
         parameters, and a networked player has communication
         channels and message-serialisation logic. Packing all of
         this into a single class would violate the Single
         Responsibility Principle.

      2. The abstract method make_move formally states the contract
         that every player must honour. Static analysis tools and
         the Python runtime both enforce that concrete subclasses
         provide an implementation, preventing the accidental
         instantiation of a player that cannot produce moves.

      3. Introducing a new player type consists of adding a new
         subclass and requires no modification of the existing code,
         which is the essence of the Open-Closed Principle.

    The abstract make_move method is the strategy pattern realised
    through inheritance: the interface is fixed by the abstract base
    class, and each concrete subclass provides its own strategy for
    the same interface.
    """

    def __init__(self, name: str, symbol: Symbol):
        """
        Construct a player with the given display name and playing
        symbol.

        The name is used for logging and display purposes and does not
        affect the game logic. The symbol determines which mark this
        player places on the board and is intrinsic to the player's
        identity within a game session.

        The EMPTY symbol is rejected because it does not represent a
        valid playing symbol; assigning it to a player would produce
        a player who cannot make legal moves. Detecting this at
        construction time prevents the error from surfacing later
        during gameplay.
        """
        if symbol == Symbol.EMPTY:
            raise ValueError(
                "A player cannot be assigned the EMPTY symbol"
            )
        self.name = name
        self.symbol = symbol

    @abstractmethod
    def make_move(self, board: Board) -> Position:
        """
        Return the Position at which this player wishes to place its
        next symbol.

        The board is passed as an argument so that the player may
        inspect the current state of play in reaching its decision.
        Although the board is technically mutable, the contract of
        this method requires that implementations treat it as
        read-only; any mutation of the board during move selection
        would corrupt the game state.

        Implementations are responsible for returning a legal move.
        The Game class re-validates the returned move as a defence
        against implementation errors, but a well-behaved player
        implementation will only ever return a position that satisfies
        board.is_valid_move at the time of invocation.
        """
        ...

    def __repr__(self) -> str:
        """Return a diagnostic representation for logging and debugging."""
        return f"{self.__class__.__name__}({self.name}, {self.symbol.name})"


class HumanPlayer(Player):
    """
    A player whose move decisions are supplied via console input.

    The implementation is intentionally tolerant of ill-formed input:
    a typographical error or an illegal move causes the method to
    prompt again rather than to raise, since these represent expected
    user behaviour rather than exceptional conditions.

    Input format: two whitespace-separated integers denoting the row
    index and column index respectively, with both indices being
    zero-based.

    Design note: input handling is localised to this class rather than
    the Game class because the Game class should have no dependency
    on any particular input mechanism. A different concrete Player
    subclass, such as one reading input from a graphical user
    interface, would replace this class without any change to the
    Game orchestration logic.
    """

    def make_move(self, board: Board) -> Position:
        """
        Prompt the human user for a move, re-prompting on ill-formed
        or illegal input, and return the resulting Position.
        """
        while True:
            # Display the current board state so that the human has
            # the information needed to select a move. In a design
            # with a proper presentation layer, this rendering would
            # be triggered by an observer rather than by the player
            # itself, but the current scope permits this simpler
            # arrangement.
            print(board.render())

            raw_input_text = input(
                f"{self.name} playing {self.symbol.value}, "
                f"enter row and column indices in the range "
                f"0 to {board.size - 1}, separated by a space "
                f"(for example, '1 2'): "
            ).strip()

            tokens = raw_input_text.split()

            if len(tokens) != 2:
                print(
                    "Input must consist of exactly two integers "
                    "separated by whitespace. Please try again."
                )
                continue

            try:
                row = int(tokens[0])
                col = int(tokens[1])
            except ValueError:
                print(
                    "Both inputs must be integers. Please try again."
                )
                continue

            position = Position(row, col)

            if not board.is_valid_move(position):
                print(
                    f"The move {position} is not legal: the position "
                    f"is either out of bounds or the cell is already "
                    f"occupied. Please try again."
                )
                continue

            return position
```

Two aspects of this implementation deserve additional commentary.

The abstract Player class deliberately provides no default implementation of `make_move`. This forces every concrete subclass to make an explicit choice about how moves are generated, and it prevents the accidental creation of a partially-formed player. Python's abstract base class mechanism enforces this at instantiation time: attempting to instantiate a subclass that has not implemented all abstract methods raises TypeError, which surfaces the error at the earliest possible moment.

The `HumanPlayer.make_move` implementation encapsulates all interactive input handling within a single method. The loop structure permits the method to keep prompting until a valid move is supplied, treating typographical errors and illegal moves as expected user behaviour that should be recovered from gracefully. The alternative of raising an exception on invalid input would push the recovery burden onto the caller, which would in turn need to know about console input mechanics, thereby violating the encapsulation this class is intended to provide.

Concrete artificial intelligence implementations are deferred to Stage 10, after the win-checker and Game class have been defined, since the intelligence implementations depend on both.

---

## 7. Stage 6: Making a Move, Validation and Placement

Before designing the Game class, it is worth examining the sequence of operations that constitutes a single move. Making this sequence explicit clarifies the responsibilities of the participating classes and reveals whether a dedicated Move class is warranted.

### The Move Sequence

A single move consists of the following operations executed in order:

1. The Game identifies the current player by consulting its turn-tracking state.
2. The Game invokes the current player's `make_move` method, passing the board as an argument, and receives a Position in return.
3. The Game validates the returned Position against the current board state, treating an invalid Position as evidence of a defect in the player implementation.
4. The Game invokes `board.place` with the player's symbol and the returned Position, updating the board's state.
5. The Game records the move in its history for potential future features such as undo or replay.
6. The Game invokes the WinChecker to determine whether the completed move resulted in a win. If so, the game enters the WON state and terminates further play.
7. If no win occurred, the Game checks whether the board is now full. If so, the game enters the DRAWN state and terminates.
8. Otherwise, the Game advances the turn-tracking state to the next player.

Every one of these operations is conceptually part of a single "make a move" action, and packaging them together within the Game class ensures that the invariants of the game are maintained atomically.

### Justification for a Move Data Class

A Move records a completed move as a historical fact, capturing the identity of the player, the position played, and a timestamp. Three of the eventual features that this history enables are undo, replay, and audit logging.

The alternative to a Move data class is to not track history at all, discarding move information as soon as the move has been applied to the board. This alternative has the advantage of simplicity but forecloses the future features that history enables. Given that the cost of maintaining a history is a single list append per move, which is negligible in both time and space for a game of this size, and given that the presence of history opens the door to substantially richer functionality with minimal further effort, the preemptive investment in a Move class is justified even though the current scope does not require it.

This is a rare case in which the principle of You Aren't Gonna Need It is overridden. The overriding factor is the very low cost of the investment combined with the very high value of the future capabilities it enables. In general, the principle should be observed unless a specific and compelling counter-argument can be articulated.

### The Move Class Implementation

```python
from datetime import datetime
from dataclasses import field


@dataclass(frozen=True)
class Move:
    """
    An immutable record of a completed move, comprising the identity
    of the player who made the move, the position on the board where
    the mark was placed, and the timestamp at which the move occurred.

    Design rationale for making the class frozen (immutable):
      1. A completed move is a historical fact and, by definition,
         cannot be revised. Enforcing immutability at the language
         level prevents accidental modification.
      2. Frozen dataclasses are hashable, which permits Move
         instances to be stored in sets and used as dictionary keys
         if future features require it.

    Design rationale for including the timestamp:
      1. The cost is negligible: a single additional field with a
         default factory.
      2. The benefit is substantial: features such as move-time
         analysis, replay pacing, and timeout enforcement (as used
         in timed variants of chess) all require timestamps, and
         retrofitting them later would require modifying every
         call site that constructs a Move.

    Design rationale for storing the player rather than only the
    symbol: the player object contains the player's display name,
    which is useful for logging and replay. The symbol can always
    be recovered from move.player.symbol, so storing the player is
    strictly more informative.
    """
    player: Player
    position: Position
    timestamp: datetime = field(default_factory=datetime.now)
```

The `field(default_factory=datetime.now)` construction merits explanation. If the timestamp field were initialised with the expression `datetime.now()` as its default value, Python would evaluate that expression exactly once at the time the class was defined, and every subsequent Move instance would receive the same timestamp. Using `field(default_factory=datetime.now)` supplies a callable that Python invokes at each Move construction, producing a fresh timestamp per instance. This same idiom applies to any mutable or freshly-computed default value in a dataclass and is one of the more common subtleties of the dataclass API.


---

## 8. Stage 7: Win Detection as an Algorithmic Concern

Win detection is the most algorithmically substantive part of the design. This section examines the range of possible implementations, justifies the selected approach, and explains why the win-detection logic is separated into its own class rather than embedded within the Board.

### The Naive Constant Approach and Its Limitations

The simplest possible implementation for a three by three board enumerates the eight winning lines as constants and checks each of them after every move.

```python
WINNING_LINES = [
    [(0, 0), (0, 1), (0, 2)],  # top row
    [(1, 0), (1, 1), (1, 2)],  # middle row
    [(2, 0), (2, 1), (2, 2)],  # bottom row
    [(0, 0), (1, 0), (2, 0)],  # left column
    [(0, 1), (1, 1), (2, 1)],  # middle column
    [(0, 2), (1, 2), (2, 2)],  # right column
    [(0, 0), (1, 1), (2, 2)],  # main diagonal
    [(0, 2), (1, 1), (2, 0)],  # anti-diagonal
]
```

This approach is correct for a three by three board and, taken in isolation, requires no substantial explanation. However, it fails immediately when the board size is generalised, because the set of winning lines depends on the board dimension and cannot be hard-coded once for all sizes. Since the confirmed requirements specify support for arbitrary N by N boards, this approach is inadmissible.

### The Generalised Algorithm

For an N by N board with the N-in-a-row win condition, the winning lines are precisely the following:

1. The N rows, each of which is a sequence of N cells sharing a row index.
2. The N columns, each of which is a sequence of N cells sharing a column index.
3. The main diagonal, consisting of the N cells whose row and column indices are equal.
4. The anti-diagonal, consisting of the N cells whose row and column indices sum to N minus 1.

The total number of lines is therefore 2N + 2. For each line, the algorithm inspects the N cells along the line and determines whether they all contain the same non-EMPTY symbol. If any line satisfies this condition, the symbol common to that line is the winner. If no line satisfies the condition, no winner exists.

The time complexity of a single win check under this algorithm is O(N squared), since the algorithm inspects 2N + 2 lines of N cells each. For the sizes under consideration, this is trivially fast: at N equal to three, the total cell inspection count is at most 24; at N equal to fifteen, the count is at most 480. These figures are well below any practical performance threshold.

### The Incremental Alternative

A more sophisticated alternative observes that only a small number of lines can be affected by any single move: specifically, the row containing the move, the column containing the move, and at most two diagonals passing through the move. All other lines are unchanged from their state after the previous move, so re-examining them is wasted work.

Under the incremental approach, the win checker inspects only the lines passing through the most recent move, reducing the per-move complexity to O(N) rather than O(N squared). This is a factor-of-N improvement that becomes significant at very large board sizes but is inconsequential at the sizes under consideration.

The trade-off is that the incremental approach requires more code and admits more opportunities for error, particularly in the diagonal cases where the geometry is less symmetric than for rows and columns. For a design at the current scope, the full-scan approach is preferred for its simplicity and obvious correctness. If the design were subsequently deployed to a context with very large boards or very high move rates, the incremental approach could be introduced without disturbing the rest of the system, since win detection is encapsulated behind an interface.

### Justification for Separating Win Detection from the Board

The Board class could plausibly include a `winner` method that performs win detection directly against its own state. However, this would tightly couple the win rule to the Board, making it difficult to accommodate variant win rules such as K-in-a-row on an N-by-N board or the corner-configuration wins found in some Tic Tac Toe variants.

The Strategy pattern provides the appropriate solution. Win detection is encapsulated behind an abstract WinChecker interface, and multiple concrete implementations can coexist. The Game class holds a reference to whichever WinChecker implementation is active for the current game, and it invokes the checker after each move without concerning itself with the details of the check. Introducing a new win rule consists of writing a new WinChecker subclass and instantiating the Game with an instance of that subclass, requiring no modification of the Game, Board, or Player classes.

This separation also improves testability. A WinChecker is a pure function of the board state: it accepts a board and returns either a winning symbol or None, with no side effects and no dependence on external state. Pure functions are the easiest kind of code to unit-test because their behaviour is fully determined by their inputs.

### The WinChecker Interface and NInARowChecker Implementation

```python
from typing import Iterator, Optional


class WinChecker(ABC):
    """
    Abstract base class defining the interface for all win-detection
    algorithms.

    Every concrete implementation of this interface is a pure function
    of the board state, meaning that its behaviour depends only on
    the board passed as an argument and produces no observable side
    effects. This property makes WinChecker implementations trivially
    unit-testable.

    Introducing a new win rule (for example, K-in-a-row, or a
    corner-configuration win rule) consists of writing a new subclass
    of this base class and injecting an instance of it into the Game
    at construction time. No modification of the Game, Board, or
    Player classes is required. This is a direct application of the
    Open-Closed Principle: the system is open for extension via new
    subclasses but closed for modification of existing classes.
    """

    @abstractmethod
    def check(self, board: Board) -> Optional[Symbol]:
        """
        Return the Symbol that has won the game, or None if no
        player has yet achieved the win condition.

        The method does not distinguish between an in-progress game
        and a drawn game; that distinction is the responsibility of
        the Game class, which combines the WinChecker result with
        the board's is_full property to reach a final determination.
        """
        ...


class NInARowChecker(WinChecker):
    """
    Concrete WinChecker implementation for the standard N-in-a-row
    win rule, where N is equal to the board dimension.

    Algorithm: enumerate every winning line on the board (there are
    2N + 2 such lines), and for each line determine whether all N
    cells contain the same non-EMPTY symbol. If any line satisfies
    this condition, return the symbol common to that line. If no
    line satisfies the condition, return None.

    Time complexity: O(N squared) per invocation. For the board sizes
    supported by this design, this is well below any performance
    threshold that would justify a more sophisticated implementation.
    """

    def check(self, board: Board) -> Optional[Symbol]:
        """
        Iterate over every winning line and return the winning symbol
        of the first line that constitutes a win, or None if no such
        line exists.
        """
        for line in self._all_lines(board.size):
            winner = self._line_winner(board, line)
            if winner is not None:
                return winner
        return None

    def _all_lines(self, n: int) -> Iterator[list[Position]]:
        """
        Generate every winning line on an N-by-N board.

        The method is implemented as a generator, meaning that lines
        are produced lazily one at a time rather than being
        accumulated into a list. Laziness has two advantages: memory
        consumption is bounded by a single line rather than by all
        lines simultaneously, and short-circuit evaluation in the
        caller can terminate iteration as soon as a winning line is
        found.

        The four categories of winning lines are generated in the
        following order: rows, then columns, then the main diagonal,
        then the anti-diagonal.
        """
        # Rows: for each row index r, the line consists of the cells
        # at (r, 0), (r, 1), ..., (r, n - 1).
        for r in range(n):
            yield [Position(r, c) for c in range(n)]

        # Columns: for each column index c, the line consists of the
        # cells at (0, c), (1, c), ..., (n - 1, c).
        for c in range(n):
            yield [Position(r, c) for r in range(n)]

        # Main diagonal: the cells at (0, 0), (1, 1), ..., (n - 1, n - 1).
        yield [Position(i, i) for i in range(n)]

        # Anti-diagonal: the cells at (0, n - 1), (1, n - 2), ..., (n - 1, 0).
        yield [Position(i, n - 1 - i) for i in range(n)]

    def _line_winner(
        self, board: Board, line: list[Position]
    ) -> Optional[Symbol]:
        """
        Determine whether the given line constitutes a win.

        A line constitutes a win if and only if all of its cells
        contain the same non-EMPTY symbol. The method extracts the
        symbol of the first cell in the line, immediately rejects the
        line if that symbol is EMPTY (since an empty first cell
        cannot begin a winning line), and otherwise verifies that
        every subsequent cell contains the same symbol.

        The all() built-in short-circuits on the first False value,
        so the method returns as soon as any mismatch is detected.
        """
        first = board.get(line[0])
        if first == Symbol.EMPTY:
            return None
        if all(board.get(p) == first for p in line[1:]):
            return first
        return None
```

The design of this implementation supports future extension in a straightforward manner. A K-in-a-row variant, which generalises the win condition to permit winning lines shorter than the board dimension, is implemented by writing a new subclass of WinChecker with a different line-generation and inspection strategy that accepts K as a parameter. No modification of the existing code is required. This extension is demonstrated in the Practice Questions section.

The use of a generator for `_all_lines` is worth explaining in more detail. A generator function in Python is one that contains one or more `yield` statements. When called, a generator function returns a generator object, which is an iterator that produces values on demand. Each call to the iterator's `__next__` method resumes the function from its most recent `yield`, executes until the next `yield`, and produces the yielded value. Memory consumption is bounded by a single value at a time, rather than by the full sequence of values. For small board sizes the difference is negligible, but the generator idiom is a good habit because it scales to arbitrarily large sequences without changing the calling convention.

---

## 9. Stage 8: Modelling the Game State

A game progresses through a small number of well-defined states. The initial state is in-progress, during which players alternate moves. The game may terminate in either of two ways: a player achieves the win condition (the won state) or the board fills without any player winning (the drawn state). Both terminal states share the property that no further moves are permitted; any attempt to play after termination should be rejected as an error.

This section addresses how the state should be represented in the design and, in particular, whether the full State pattern is warranted or whether a simpler representation will suffice.

### The State Pattern Versus an Enumeration

The State pattern is a behavioural design pattern in which each state is represented as a separate class, and the object whose state is being modelled delegates state-dependent operations to an instance of the current state class. State transitions are effected by replacing the current state instance with an instance of the destination state class. The pattern is valuable when different states admit substantially different behaviour, because the branching that would otherwise be required (typically in the form of conditional dispatch on a state-identifying field) is replaced by polymorphism.

The Elevator design in an earlier document of this series used the State pattern precisely because the Idle, MovingUp, MovingDown, and DoorsOpen states admit substantially different behaviour: each state accepts different transitions, produces different next actions, and has different rules governing valid inputs. The pattern's overhead was justified by the richness of the per-state behaviour.

In the Tic Tac Toe design, the state-dependent behaviour is markedly less rich. The IN_PROGRESS state accepts moves and applies them to the board; the WON and DRAWN states both reject moves with an identical response. The transitions are also very simple: only two are possible, both from IN_PROGRESS, and neither has any special behaviour beyond updating the status field.

Given this simplicity, the full State pattern would introduce structural complexity disproportionate to the behavioural variation it captures. A single enumeration with three values, combined with a guard clause at the entry of the `play_turn` method, expresses the same behaviour in fewer lines and with lower cognitive load. This is the correct choice, and articulating the reason for it demonstrates awareness that pattern selection is a matter of judgement rather than a matter of applying patterns wherever they fit syntactically.

### The GameStatus Enumeration Implementation

```python
class GameStatus(Enum):
    """
    Enumeration of the three possible game states.

    Design rationale for using an enumeration rather than the State
    pattern:

      The State pattern is valuable when different states admit
      substantially different behaviour that would otherwise be
      expressed as conditional dispatch. In this design, the state
      dependent behaviour is limited to a single conditional at the
      entry of the play_turn method, which rejects moves in terminal
      states. This is insufficient behavioural variation to justify
      the structural overhead of a class per state.

      Should future requirements introduce richer per-state behaviour
      (for example, a PAUSED state that accepts unpause commands but
      not moves, or an AWAITING_CONFIRMATION state that accepts move
      confirmations), the design could be refactored to use the full
      State pattern without disturbing the rest of the system.
    """
    IN_PROGRESS = "in_progress"
    WON = "won"
    DRAWN = "drawn"


class GameOverError(Exception):
    """
    Exception raised when a move is attempted on a game that has
    already reached a terminal state (either WON or DRAWN).

    Defining a distinct exception type, rather than raising a
    generic ValueError, allows callers to distinguish this specific
    error condition from other invalid-argument errors and to
    handle it separately if desired.
    """
    pass
```

The choice to define a custom exception class rather than reuse ValueError is intentional. Custom exception classes carry semantic meaning that generic exceptions do not: catching `GameOverError` in a caller signals a very specific error condition, whereas catching `ValueError` catches a broader range of unrelated errors. The cost of defining a custom exception is minimal (three lines including docstring), and the payoff is more precise error handling.


---

## 10. Stage 9: The Game Class as the Orchestrator

The Game class occupies the top of the composition hierarchy in this design. It holds references to the Board, the collection of Players, the WinChecker, and the current game state, and it defines the game loop that drives play forward. The design goal for this class is to make it an orchestrator rather than a repository of logic: each of the other classes contains its own domain-specific behaviour, and the Game class merely coordinates their interaction.

### The Boundaries of the Game Class

The following responsibilities belong to the Game class:

1. Owning the Board, the collection of Players, and the WinChecker.
2. Tracking whose turn it currently is.
3. Enforcing the invariant that no moves may be played after the game has reached a terminal state.
4. Recording the sequence of moves in a history for potential future use.
5. Coordinating the sequence of operations that constitute a single turn.

The following responsibilities do not belong to the Game class and are delegated elsewhere:

1. Determining how a player selects a move; this is the responsibility of the Player subclass.
2. Managing the internal representation of the board grid; this is the responsibility of the Board class.
3. Determining whether a completed board configuration is a win; this is the responsibility of the WinChecker.
4. Producing user-facing output or presentation; this is the responsibility of a separate presentation component (or, in this scope, of console print statements localised to the driver code).

This distribution of responsibilities keeps the Game class small and focused, preventing the anti-pattern colloquially known as the god class, in which a single class accumulates so many responsibilities that it becomes difficult to modify, test, or reason about.

### Turn Rotation Strategy

Two representations of turn state are available. The first uses a Boolean flag indicating whether the current player is player one or player two, which is compact but does not generalise beyond two players. The second uses an integer index into the players list, which is trivially generalisable to any number of players by advancing the index modulo the list length.

The integer-index representation is selected because it generalises without additional code. Advancing the index is a single expression: `index = (index + 1) % len(players)`. This expression is correct for any number of players and requires no special-casing for the two-player scenario.

### The Order of Terminal-State Checks

After each move, the Game must check whether the game has reached a terminal state. Two terminal conditions exist: a win, indicated by the WinChecker returning a non-None symbol, and a draw, indicated by the board being full without a winner. The order in which these checks are performed matters.

Consider a scenario in which the last empty cell on the board is filled with a mark that completes a winning line. If the draw check is performed first, the check succeeds (because the board is now full) and the game is incorrectly declared a draw. The win check must be performed first, so that a winning move on the final cell is recognised as a win rather than misclassified as a draw. This ordering is not obvious from a superficial reading of the code, and it is exactly the kind of subtle correctness issue that a mental walkthrough of the design (covered in Stage 12) is intended to surface.

### The Game Class Implementation

```python
from typing import Optional


class Game:
    """
    Orchestrator class that composes the Board, Players, WinChecker,
    and game state into a functioning game.

    Responsibilities of this class:
      1. Own the Board, the ordered collection of Players, and the
         WinChecker.
      2. Track whose turn it is via an index into the players list.
      3. Enforce that moves may not be played after termination.
      4. Coordinate the sequence of operations that constitute a
         single turn: solicit the move, validate it, apply it,
         record it, check terminal conditions, and advance the turn.
      5. Maintain a history of moves for future use.

    Responsibilities delegated to other classes:
      1. Move selection is delegated to Player.make_move.
      2. Grid state and move validation are delegated to Board.
      3. Win detection is delegated to WinChecker.
      4. User interface concerns are outside the scope of this class.

    Composition over inheritance: this class does not inherit from
    any other class; its behaviour arises from the composition of
    its collaborators. This composition-based design is more flexible
    than an inheritance-based alternative because collaborators can
    be substituted independently.
    """

    def __init__(
        self,
        players: list[Player],
        board_size: int = 3,
        win_checker: Optional[WinChecker] = None,
    ):
        """
        Construct a new Game with the specified players, board size,
        and win checker.

        The players argument must contain at least two players, and
        every player must have a distinct symbol. Both invariants are
        checked at construction time so that violations are detected
        before any gameplay begins.

        The win_checker argument is optional; if omitted, an
        NInARowChecker is instantiated by default. Making the
        default explicit (rather than hiding it behind a None check
        elsewhere) makes the behaviour of the class transparent to
        callers.
        """
        if len(players) < 2:
            raise ValueError(
                f"A game requires at least two players, received {len(players)}"
            )

        symbols = [p.symbol for p in players]
        if len(set(symbols)) != len(symbols):
            raise ValueError(
                f"Players must have distinct symbols, but received "
                f"the following symbols: {[s.name for s in symbols]}"
            )

        self.board = Board(size=board_size)
        self.players = players
        self.win_checker = win_checker or NInARowChecker()

        # Turn tracking is implemented as an integer index into the
        # players list. Advancing the turn is a modulo operation,
        # which generalises to any number of players without
        # additional code.
        self._current_player_index = 0

        # The game begins in the IN_PROGRESS state and transitions
        # to either WON or DRAWN upon reaching a terminal condition.
        self.status = GameStatus.IN_PROGRESS

        # The winner attribute is None until the game reaches the
        # WON state, at which point it is set to the winning player.
        # A drawn game has no winner and this attribute remains None.
        self.winner: Optional[Player] = None

        # The move history is a list of Move records in chronological
        # order. The cost of maintaining this list is a single list
        # append per move, which is negligible, and the presence of
        # the history enables features such as undo, replay, and
        # audit logging to be added later without redesign.
        self.history: list[Move] = []

    # ------------------------------------------------------------------
    # Public interface.
    # ------------------------------------------------------------------

    @property
    def current_player(self) -> Player:
        """
        Return the Player whose turn it is currently. This property
        is defined for the convenience of callers who wish to identify
        the current player without knowing about the internal index
        representation.
        """
        return self.players[self._current_player_index]

    @property
    def is_over(self) -> bool:
        """
        Return True if the game has reached a terminal state, whether
        WON or DRAWN. This is the convenience predicate used by the
        game loop to determine whether further turns should be played.
        """
        return self.status != GameStatus.IN_PROGRESS

    def play_turn(self) -> None:
        """
        Execute a single complete turn.

        The sequence of operations is as follows:
          1. Verify that the game is still in progress, raising
             GameOverError otherwise.
          2. Identify the current player and solicit their move.
          3. Re-validate the returned move as a defensive check.
          4. Apply the move to the board.
          5. Record the move in the history.
          6. Check for a winning line via the WinChecker. If a winner
             is found, transition to the WON state and return.
          7. Otherwise, check whether the board is now full. If it
             is, transition to the DRAWN state and return.
          8. Otherwise, advance the turn to the next player.

        The check for a winning line must precede the check for a
        full board, because a move that both fills the final cell
        and completes a winning line should be classified as a win
        rather than as a draw.
        """
        if self.is_over:
            raise GameOverError(
                f"Cannot play a turn because the game has already "
                f"terminated in state {self.status.name}"
            )

        player = self.current_player

        # Solicit the move from the player. A well-behaved player
        # implementation returns a legal Position; a defective one
        # might return an illegal Position, and the following
        # validation catches that case.
        position = player.make_move(self.board)

        # Re-validate the returned position against the board. If
        # the position is illegal, this indicates a defect in the
        # player implementation, and the resulting exception carries
        # sufficient information to identify the offending player.
        if not self.board.is_valid_move(position):
            raise ValueError(
                f"Player {player} returned an illegal move at "
                f"position {position}"
            )

        # Apply the move to the board.
        self.board.place(player.symbol, position)

        # Record the move in the history.
        move = Move(player=player, position=position)
        self.history.append(move)

        # Check for a winning line. If a winner is found, transition
        # to the WON state, identify the winning player, and return
        # without advancing the turn.
        winner_symbol = self.win_checker.check(self.board)
        if winner_symbol is not None:
            self.status = GameStatus.WON
            # Locate the player whose symbol matches the winning
            # symbol. A linear search over the players list is used
            # because the list is small; a dictionary lookup would
            # be marginally faster but is not warranted at this scale.
            self.winner = next(
                p for p in self.players if p.symbol == winner_symbol
            )
            return

        # No winner. Check for a drawn game, indicated by a full
        # board with no winner.
        if self.board.is_full:
            self.status = GameStatus.DRAWN
            return

        # The game continues. Advance the turn to the next player.
        self._advance_turn()

    def play(self) -> None:
        """
        Execute the game loop, repeatedly calling play_turn until the
        game reaches a terminal state, and then produce a summary of
        the outcome.

        This method is a convenience wrapper around play_turn for
        callers that wish to run the game to completion in a
        synchronous, blocking fashion. Callers that require turn-by
        turn control (for example, a graphical user interface driven
        by an event loop) should invoke play_turn directly and manage
        the loop themselves.
        """
        while not self.is_over:
            self.play_turn()

        print(self.board.render())
        if self.status == GameStatus.WON:
            print(
                f"The game has ended. "
                f"{self.winner.name} playing {self.winner.symbol.value} "
                f"is the winner."
            )
        else:
            print("The game has ended in a draw.")

    # ------------------------------------------------------------------
    # Internal helpers.
    # ------------------------------------------------------------------

    def _advance_turn(self) -> None:
        """
        Rotate the turn to the next player.

        The modulo operation makes this method correct for any number
        of players. The method is separated from play_turn so that
        the turn-advancement rule is expressed in one place and can
        be modified independently if the rotation rule ever needs to
        change (for example, to skip a player who has resigned).
        """
        self._current_player_index = (
            self._current_player_index + 1
        ) % len(self.players)
```

Several aspects of this implementation deserve additional commentary.

The re-validation of the move returned by the player is a defence in depth. A well-behaved player implementation should never return an illegal move, and the HumanPlayer implementation guarantees this by re-prompting until a legal move is supplied. However, an artificial intelligence player with a bug in its move-selection logic might return an illegal move, and detecting this condition with an informative error message is more helpful than allowing the bug to manifest as an obscure error deep inside the Board class.

The winner lookup uses a linear search over the players list rather than maintaining a symbol-to-player dictionary. The reasoning is that the list has at most a handful of entries in any realistic scenario, and the constant factors of dictionary lookup exceed the constant factors of linear search at these sizes. A dictionary would become preferable only if the list grew to hundreds or thousands of entries, which is far outside the scope of any reasonable Tic Tac Toe variant.

The move history is populated on every successful move even though no current feature consumes it. This preemptive investment is defensible because the cost is negligible (one list append per move) and because it enables a family of future features (undo, replay, save-and-load, audit) to be added without redesign. Preemptive investment of this kind should be uncommon rather than routine; it is warranted here because the cost-benefit ratio is exceptionally favourable.

The separation between `play_turn` (which executes a single turn) and `play` (which runs the loop to completion) is a general design discipline: primitive operations are separated from convenience wrappers so that callers with different needs can select the appropriate level of granularity. A caller driving the game from a graphical event loop, for example, would invoke `play_turn` from an event handler and would not use `play` at all.


---

## 11. Stage 10: Introducing an AI Player via the Strategy Pattern

With the core game infrastructure in place, this section demonstrates how the Player abstraction accommodates artificial intelligence implementations without any modification to the existing code. Two AI implementations are provided: a trivial random player and a perfect-play minimax player. The two implementations differ dramatically in their internal complexity but share the same external interface, illustrating the Strategy pattern's principal benefit.

### The Random AI Implementation

The random AI selects uniformly at random from the set of currently legal moves. This implementation is useful for three purposes: as a stand-in for a human player during automated testing, as a beginner-level opponent in real gameplay, and as a baseline for measuring the strength of more sophisticated implementations.

```python
import random


class RandomAIPlayer(Player):
    """
    A player that selects uniformly at random from the currently legal
    moves.

    This implementation is suitable for the following purposes:
      1. Automated testing that requires a player capable of playing
         a full game without console input.
      2. Beginner-level opposition in interactive gameplay.
      3. A baseline against which more sophisticated artificial
         intelligence implementations can be measured.

    Time complexity per move: O(N squared) to enumerate the legal
    moves, plus O(1) for the random selection.
    """

    def make_move(self, board: Board) -> Position:
        """
        Enumerate the currently legal positions and return one chosen
        uniformly at random.
        """
        # Enumerate the legal positions. A position is legal if the
        # cell at that position is currently empty; the is_empty_at
        # method encapsulates both the bounds check and the emptiness
        # check.
        legal_positions = [
            Position(row, col)
            for row in range(board.size)
            for col in range(board.size)
            if board.is_empty_at(Position(row, col))
        ]

        # The Game class should never invoke make_move when no legal
        # moves exist, since the game would have terminated as a
        # draw before that point. A defensive check is included
        # nonetheless, since the cost is negligible and the benefit
        # is a clear error message in the event of a defect elsewhere.
        if not legal_positions:
            raise RuntimeError(
                "make_move was invoked but no legal moves are available"
            )

        return random.choice(legal_positions)
```

### The Minimax AI Implementation

The minimax algorithm is a recursive decision procedure for two-player zero-sum games with perfect information. Tic Tac Toe satisfies all three conditions: it has exactly two players, one player's win is the other's loss (zero sum), and the game state is fully visible to both players (perfect information).

**Definition of minimax:** The algorithm assigns a numerical score to each possible game state, representing the value of that state from the perspective of one player, referred to as the maximiser. Terminal states are scored directly: a win for the maximiser scores +1, a loss scores -1, and a draw scores 0. Non-terminal states are scored recursively: if it is the maximiser's turn, the score of the state is the maximum of the scores of the states reachable by any legal move; if it is the opponent's (the minimiser's) turn, the score is the minimum of those reachable states' scores. The maximiser plays optimally by selecting the move that maximises the score, under the assumption that the opponent will also play optimally.

**Definition of alpha-beta pruning:** Alpha-beta pruning is a refinement of minimax that eliminates the evaluation of moves that cannot affect the final decision. The refinement maintains two bounds, conventionally called alpha (the highest score the maximiser is guaranteed to achieve so far) and beta (the lowest score the minimiser is guaranteed to achieve so far). When the score of a partially-evaluated subtree is proven to fall outside the range (alpha, beta), the remainder of the subtree can be skipped without changing the final result. This pruning does not change the correctness of the algorithm; it only reduces the number of states examined.

For a three by three Tic Tac Toe board, the minimax algorithm with alpha-beta pruning is fast enough to compute the optimal move in a small fraction of a second, and it guarantees that the AI player will never lose (the AI wins or draws every game). For larger board sizes, minimax becomes computationally infeasible without additional refinements such as depth limits and heuristic evaluation functions, and Monte Carlo tree search or reinforcement learning approaches become preferable.

```python
class SmartAIPlayer(Player):
    """
    A player that selects moves via the minimax algorithm with
    alpha-beta pruning, achieving perfect play on the three by three
    board.

    For the three by three board, the entire game tree is small enough
    to be exhaustively searched within a fraction of a second. The
    resulting player never loses: it wins whenever a winning strategy
    exists, and draws otherwise.

    For larger boards, minimax becomes computationally infeasible
    without additional refinements such as depth limits, transposition
    tables, and heuristic evaluation functions. This implementation
    is therefore suitable for demonstration purposes on small boards
    but should not be relied upon for larger variants.
    """

    def __init__(self, name: str, symbol: Symbol):
        super().__init__(name, symbol)

        # The AI uses an internal WinChecker to evaluate hypothetical
        # board states during the recursive search. Instantiating this
        # once at construction time and reusing it avoids the cost of
        # repeated instantiation during the search.
        self._checker = NInARowChecker()

    def make_move(self, board: Board) -> Position:
        """
        Select the move that maximises the score under minimax
        evaluation.

        The implementation iterates over every currently legal
        position, tentatively applies the move, evaluates the
        resulting board state via minimax, undoes the move, and
        retains the position that produced the highest score.
        """
        # Identify the opponent's symbol. The design assumes exactly
        # two players; if the design were extended to more players,
        # the opponent identification would need to be revisited.
        opponent = Symbol.O if self.symbol == Symbol.X else Symbol.X

        best_score = float("-inf")
        best_position: Optional[Position] = None

        for row in range(board.size):
            for col in range(board.size):
                position = Position(row, col)
                if not board.is_empty_at(position):
                    continue

                # Tentatively apply the move to the board.
                board.place(self.symbol, position)

                # Evaluate the resulting position via minimax. The
                # score reflects the outcome assuming both players
                # play optimally from this point forward.
                score = self._minimax(
                    board=board,
                    maximiser_symbol=self.symbol,
                    to_move=opponent,
                    alpha=float("-inf"),
                    beta=float("inf"),
                )

                # Undo the tentative move. The Board class does not
                # currently expose a public undo method, so the AI
                # manipulates the private state directly. In a
                # production design, an unplace method should be
                # added to Board to provide a clean interface.
                board._grid[row][col] = Symbol.EMPTY
                board._filled_count -= 1

                if score > best_score:
                    best_score = score
                    best_position = position

        # A well-behaved caller (the Game class) ensures that
        # make_move is invoked only when at least one legal move
        # exists, so best_position should always be non-None. The
        # assertion documents this expected invariant.
        assert best_position is not None, (
            "make_move was invoked with no legal moves available"
        )
        return best_position

    def _minimax(
        self,
        board: Board,
        maximiser_symbol: Symbol,
        to_move: Symbol,
        alpha: float,
        beta: float,
    ) -> float:
        """
        Recursively evaluate the given board position via minimax with
        alpha-beta pruning.

        Return value semantics:
          +1 indicates that the maximiser will win under optimal play.
          -1 indicates that the maximiser will lose under optimal play.
           0 indicates that the game will end in a draw.

        Parameters:
          board: the current board state, mutated during recursion.
          maximiser_symbol: the symbol whose perspective is being
              optimised.
          to_move: the symbol of the player whose turn it currently is.
          alpha: the highest score the maximiser is guaranteed so far.
          beta: the lowest score the minimiser is guaranteed so far.

        The alpha and beta bounds are updated as the search progresses,
        and any subtree whose score cannot fall within the (alpha, beta)
        range is skipped without further evaluation.
        """
        # Base case: terminal position.
        winner = self._checker.check(board)
        if winner == maximiser_symbol:
            return 1
        if winner is not None:
            return -1
        if board.is_full:
            return 0

        # Recursive case: enumerate legal moves for the player to move
        # and evaluate each recursively.
        opponent = Symbol.O if to_move == Symbol.X else Symbol.X
        is_maximising = (to_move == maximiser_symbol)

        if is_maximising:
            best = float("-inf")
            for row in range(board.size):
                for col in range(board.size):
                    position = Position(row, col)
                    if not board.is_empty_at(position):
                        continue
                    board.place(to_move, position)
                    score = self._minimax(
                        board, maximiser_symbol, opponent, alpha, beta
                    )
                    board._grid[row][col] = Symbol.EMPTY
                    board._filled_count -= 1
                    best = max(best, score)
                    alpha = max(alpha, best)
                    if beta <= alpha:
                        # Beta cutoff: no further exploration of this
                        # subtree can improve the maximiser's outcome
                        # given the minimiser's guaranteed response.
                        return best
            return best
        else:
            best = float("inf")
            for row in range(board.size):
                for col in range(board.size):
                    position = Position(row, col)
                    if not board.is_empty_at(position):
                        continue
                    board.place(to_move, position)
                    score = self._minimax(
                        board, maximiser_symbol, opponent, alpha, beta
                    )
                    board._grid[row][col] = Symbol.EMPTY
                    board._filled_count -= 1
                    best = min(best, score)
                    beta = min(beta, best)
                    if beta <= alpha:
                        # Alpha cutoff: no further exploration of this
                        # subtree can degrade the minimiser's outcome
                        # given the maximiser's guaranteed response.
                        return best
            return best
```

Two design compromises in this implementation deserve honest acknowledgement.

The first compromise is that the AI accesses the private `_grid` and `_filled_count` attributes of the Board directly in order to undo a tentative move. This is an encapsulation violation: the Board's private attributes should not be reached across the class boundary. The proper resolution is to add an `unplace` method to the Board class that reverses a placement in a controlled manner, and to have the AI invoke that method. Practice Question 1 asks the reader to make this improvement.

The second compromise is that the opponent identification assumes exactly two players and hard-codes the mapping from X to O and vice versa. Generalising to more than two players would require the AI to hold a reference to the players list and identify the opponent contextually. The current implementation documents this limitation in its docstring.

The critical observation is that neither the Game class nor any other existing class requires any modification to accommodate these AI implementations. Both AI subclasses satisfy the abstract Player interface, and constructing a Game with one or two AI players is a matter of passing different Player instances into the Game constructor. This is the Strategy pattern producing its intended benefit: variability of behaviour behind a stable interface.

---

## 12. Stage 11: Observers for Game Events

The final major concern of the design is the ability of external components to react to game events. Examples of components that might wish to be notified include logging systems that record moves for audit purposes, user interface components that update in response to game state changes, network broadcasters that relay events to spectators, and statistics collectors that aggregate data across many games.

The naive approach is to embed calls to each such component directly within the Game class, but this approach quickly produces a god class as each new listener requires modifications to the Game code. The Observer pattern provides a principled alternative.

### The Observer Pattern

**Definition:** The Observer pattern is a behavioural design pattern that defines a one-to-many dependency between a subject and its observers, so that when the subject changes state, all registered observers are notified automatically. The pattern decouples the subject from the concrete observer classes by requiring only that observers implement a common notification interface.

In this design, the Game class plays the role of the subject, and any class that wishes to react to game events plays the role of an observer. Observers register themselves with the Game via an `attach` method and are notified via callback methods when events occur.

### The Design of the Observer Interface

Two general variants of the Observer pattern are commonly encountered. The first variant, sometimes called the pull model, defines a single generic notification method (typically `update`) that observers use to pull whatever information they need from the subject. The second variant, sometimes called the push model, defines multiple event-specific notification methods, each of which receives the relevant event data as arguments.

The push model is selected here because games have several distinct events (a move was made, the game ended) that different observers may care about to different degrees. Providing event-specific methods with default no-op implementations allows each concrete observer to implement only the events it cares about, in accordance with the Interface Segregation Principle.

### The Observer Implementation

```python
class GameObserver(ABC):
    """
    Abstract base class defining the notification interface for
    components that wish to react to game events.

    Design rationale: the interface exposes multiple event-specific
    methods rather than a single generic method, so that concrete
    observers may implement only those events they care about. Each
    method is provided with a default no-op implementation, so that
    subclassing does not require overriding methods that the observer
    does not use. This design aligns with the Interface Segregation
    Principle, which holds that clients should not be forced to
    depend on interfaces they do not use.

    The Game class does not know the concrete types of its observers;
    it interacts with them solely through this abstract interface.
    This decoupling means that new observer types can be added
    without any modification to the Game class, in accordance with
    the Open-Closed Principle.
    """

    def on_move(self, game: "Game", move: Move) -> None:
        """
        Called after a legal move has been applied to the board and
        recorded in the history, but before the terminal-state checks.
        Default behaviour is a no-op.
        """
        pass

    def on_game_end(self, game: "Game") -> None:
        """
        Called when the game transitions to a terminal state (WON or
        DRAWN). Observers may consult game.status to determine which
        terminal state was reached and game.winner to identify the
        winning player if applicable. Default behaviour is a no-op.
        """
        pass


class ConsoleLogger(GameObserver):
    """
    Concrete observer that prints move and outcome information to the
    console. Suitable for demonstrations and for debugging games in
    which the players do not themselves produce visible output.
    """

    def on_move(self, game: "Game", move: Move) -> None:
        turn_number = len(game.history)
        print(
            f"[log] Turn {turn_number}: "
            f"{move.player.name} placed {move.player.symbol.value} "
            f"at {move.position}"
        )

    def on_game_end(self, game: "Game") -> None:
        if game.status == GameStatus.WON:
            print(
                f"[log] The game has ended. Winner: {game.winner.name}"
            )
        else:
            print("[log] The game has ended in a draw.")
```

### Integrating Observers with the Game Class

The Game class requires small modifications to support observer registration and notification. The modifications add an observers collection, methods to attach and detach observers, and internal notification helpers that iterate over the observers and invoke the appropriate callback methods.

```python
class Game:
    # ... previously defined content ...

    def __init__(
        self,
        players: list[Player],
        board_size: int = 3,
        win_checker: Optional[WinChecker] = None,
    ):
        # ... previously defined initialisation ...

        # The observers collection holds registered listeners. A plain
        # list is used rather than a set because duplicate registrations
        # are unlikely in practice and, if they occur, produce
        # duplicate notifications rather than errors.
        self._observers: list[GameObserver] = []

    def attach(self, observer: GameObserver) -> None:
        """
        Register the given observer to receive event notifications.
        Observers registered after game events have already occurred
        will not receive retroactive notifications for those events.
        """
        self._observers.append(observer)

    def detach(self, observer: GameObserver) -> None:
        """
        Unregister the given observer. If the observer was not
        previously registered, the method raises ValueError, mirroring
        the behaviour of list.remove.
        """
        self._observers.remove(observer)

    def _notify_move(self, move: Move) -> None:
        """
        Invoke the on_move callback on every registered observer,
        passing the current game and the move that was just applied.
        """
        for observer in self._observers:
            observer.on_move(self, move)

    def _notify_end(self) -> None:
        """
        Invoke the on_game_end callback on every registered observer,
        passing the current game.
        """
        for observer in self._observers:
            observer.on_game_end(self)

    def play_turn(self) -> None:
        # ... previously defined content up to and including
        #     history.append(move) ...

        # Notify observers that a move has been made.
        self._notify_move(move)

        # ... win-check block, with the addition of _notify_end() call
        #     before the return statement ...
        # ... draw-check block, with the addition of _notify_end() call
        #     before the return statement ...
```

The result of these modifications is that any number of observers can be attached to a game without any code change in the Game class, and each observer can react to whichever events it cares about. Testing becomes straightforward because a test can attach a recording observer that captures all events into a list, permitting assertions about the sequence and content of events.


---

## 13. Stage 12: Validating the Design Through Mental Simulation

Before declaring a design complete, the designer should walk through the design mentally against a set of representative scenarios. This exercise, sometimes called a design walk-through or a paper simulation, exposes correctness issues that are not apparent from reading the code in isolation. Almost every design has one or more subtle issues that surface only when the design is executed in the mind against realistic inputs.

### Scenario 1: A Standard Human Versus Human Game on a Three by Three Board

The setup constructs two human players and a game with the default board size, attaches a console logger, and enters the game loop.

```python
alice = HumanPlayer("Alice", Symbol.X)
bob = HumanPlayer("Bob", Symbol.O)
game = Game(players=[alice, bob], board_size=3)
game.attach(ConsoleLogger())
game.play()
```

The trace of a single turn proceeds as follows. The Game confirms that the game is in progress. The current player is Alice (index 0). Alice's `make_move` method displays the board, prompts for input, parses the input as (0, 0), validates the move, and returns Position(0, 0). The Game re-validates the move successfully. The Board places Symbol.X at (0, 0), incrementing the fill count to 1. A Move record is appended to the history. The logger is notified of the move and prints an appropriate line. The WinChecker runs and finds no winning line, since the first move cannot possibly complete a line of three. The board is not full. The turn advances to index 1 (Bob). Control returns to the outer loop, which invokes `play_turn` again.

The trace continues through subsequent turns in the same manner. Eventually, either Alice or Bob completes a winning line, at which point the WinChecker returns the winning symbol, the Game transitions to the WON state, the winner is identified, the logger is notified, and the loop terminates. Alternatively, all nine cells are filled without any winning line being completed, at which point the WinChecker returns None, the fullness check succeeds, the Game transitions to the DRAWN state, the logger is notified, and the loop terminates.

This scenario passes.

### Scenario 2: A Game That Ends in a Draw

Consider a terminal board configuration in which none of the eight winning lines contain three identical marks and every cell is occupied. After the ninth move produces such a configuration, the WinChecker inspects each of the eight lines and finds no line whose three cells all share the same non-EMPTY symbol. The check returns None. The fullness check succeeds because the fill count equals nine, which equals three squared. The Game transitions to the DRAWN state and the loop terminates with the drawn-game message.

This scenario passes.

### Scenario 3: A Game Won on the Final Move

Consider a board state in which eight cells are filled without any winner, and the final available cell is filled with a mark that completes a winning line. The critical concern in this scenario is the order in which terminal conditions are checked.

After the ninth move is applied, the board is now full. If the design were to check fullness first, the fullness check would succeed and the Game would incorrectly transition to the DRAWN state, silently discarding the fact that the same move also completed a winning line. If the design instead checks for a winner first, the WinChecker returns the winning symbol, the Game correctly transitions to the WON state, and the early return prevents the fullness check from executing.

The Game class as designed checks the winner first, so this scenario passes. This is a subtle correctness property that would not be visible from a casual inspection of the code, and it is precisely the kind of issue that mental simulation is intended to surface. Documenting this ordering explicitly in the docstring of `play_turn` serves as a signpost for future maintainers who might otherwise be tempted to reorder the checks for stylistic reasons.

### Scenario 4: A Player Implementation Returns an Illegal Move

Suppose a defective AI player implementation returns a Position at which the cell is already occupied. The Game's re-validation via `board.is_valid_move` detects this and raises ValueError with a message identifying the offending player and the illegal position. The message provides sufficient context for the defect to be located and corrected. This scenario passes with the expected behaviour of surfacing the defect rather than hiding it.

### Scenario 5: A Move Is Attempted After the Game Has Terminated

Suppose the game has already transitioned to the WON state and a caller invokes `play_turn` again. The guard clause at the entry of `play_turn` detects that `is_over` is True and raises GameOverError with a message identifying the terminal status. This scenario passes with the expected behaviour of preventing invalid operations on a terminated game.

### Scenario 6: Two Players Are Constructed with the Same Symbol

Suppose the Game constructor receives two Player instances both holding Symbol.X. The constructor detects that the distinct-symbols invariant is violated and raises ValueError before any gameplay begins. This scenario passes because the invariant is checked at the earliest possible moment.

### Scenario 7: A Board of Size Less Than Three Is Requested

Suppose the Board constructor receives a size of two. The constructor detects that the minimum-size invariant is violated and raises ValueError. This scenario passes.

### Summary of the Validation Exercise

The design passes all seven scenarios, and the exercise has surfaced one non-obvious correctness property (the ordering of the winner check and the fullness check) that the design was constructed to honour deliberately. The exercise has also confirmed that the design's error-handling strategy consistently surfaces defects at their source rather than concealing them.

One trust boundary is worth noting explicitly: the design assumes that a Player implementation does not mutate the board during its `make_move` invocation. A rogue implementation that placed marks directly on the board would corrupt the game state, since the Game class would subsequently apply the returned move on top of the already-modified board. Enforcing this invariant would require passing an immutable view of the board to the player rather than the mutable Board instance itself. This hardening is not implemented in the current design but is noted as a potential future improvement.

---

## 14. Stage 13: Anticipating Follow-Up Questions

Interviewers commonly extend the initial problem with follow-up questions that probe the design's extensibility. This section addresses the follow-up questions most likely to arise and sketches the design responses to each.

### Question: How would the design support undo of the most recent move?

The design already maintains a move history, so undo requires only the ability to reverse a placement on the board and to restore the previous turn state. A conceptual implementation of an undo method is as follows:

```python
def undo(self) -> None:
    """
    Reverse the most recent move, restoring the board and turn state
    to their previous values. If no move has been made, raise
    ValueError.
    """
    if not self.history:
        raise ValueError("There is no move to undo")

    last_move = self.history.pop()

    # Reverse the placement on the board. In the current design this
    # requires accessing private attributes of the Board, which is an
    # encapsulation violation. Adding a public Board.unplace method
    # would resolve this cleanly.
    self.board._grid[last_move.position.row][last_move.position.col] = Symbol.EMPTY
    self.board._filled_count -= 1

    # Roll back the turn indicator so that the player whose move was
    # undone is now the current player again.
    self._current_player_index = (
        self._current_player_index - 1
    ) % len(self.players)

    # Reset the terminal state, since the undone move may have been
    # the one that ended the game.
    self.status = GameStatus.IN_PROGRESS
    self.winner = None
```

A more principled implementation would use the Command pattern, in which each move is represented as a Command object with `execute` and `undo` methods. The Game would maintain a stack of executed commands, and undo would pop the most recent command and invoke its `undo` method. This design generalises to arbitrary undo depth and to redo operations.

### Question: How would the design support saving and loading of games?

Two design approaches are available. The first serialises the current game state (board grid, turn index, players, status, and history) to a persistent format such as JSON. Loading reconstructs the game from the serialised state. The advantage is that saving and loading are constant-time operations regardless of game length. The disadvantage is that the serialised state includes all derived state, which can become inconsistent if the format changes across versions.

The second approach serialises only the sequence of moves. Loading reconstructs the game by replaying the moves from an empty starting position. The advantage is that the serialised representation is minimal and self-consistent by construction. The additional benefit is that the replay mechanism required for loading is also useful for demonstrating games to spectators. The disadvantage is that loading takes time proportional to the number of moves, though this is negligible in practice.

The second approach is preferred for its elegance and additional capability.

### Question: How would the design generalise to K-in-a-row on an N-by-N board?

The K-in-a-row variant permits the winning line length K to differ from the board dimension N. This variant enables games such as Gomoku, which uses K equal to five on an N by N board of any size at least five.

The generalisation is implemented by writing a new WinChecker subclass named `KInARowChecker` that accepts K as a constructor parameter. The algorithm for this variant iterates over every cell as a potential starting point, and for each starting point examines the K cells extending in each of four forward directions (right, down, down-right, down-left). If any such K-cell sequence lies entirely within the board and contains the same non-EMPTY symbol in every cell, that symbol is the winner. The full implementation appears as Practice Question 3.

The Game constructor accepts the new WinChecker via its existing `win_checker` parameter. No modification of the Game, Board, or Player classes is required. This is the Strategy pattern demonstrating its intended benefit of accommodating new algorithms without disturbing the surrounding code.

### Question: How would the design support more than two players?

The Game class already supports any number of players via its index-based turn rotation. Three modifications are required to complete the generalisation. First, the Symbol enumeration must be extended to include additional values (for example, TRIANGLE, STAR) so that each additional player has a distinct symbol. Second, the AI implementations must be revised so that opponent identification does not hard-code the two-player X-versus-O assumption; instead, the AI must consult the players list to identify all opponents. Third, the WinChecker interface is unchanged, since the win condition remains that any player's symbol form a winning line.

A middle-ground approach that avoids extending the Symbol enumeration is to promote Symbol from an enumeration to a proper class that permits construction of new symbol values at runtime with arbitrary labels. This approach loses the type-safety benefits of enumerations but gains flexibility. The choice depends on how many players the extended design must support and whether the set of players is known at compile time.

### Question: How would the design support networked multiplayer?

Networked multiplayer is implemented by introducing a new Player subclass called `NetworkedPlayer`, whose `make_move` method blocks on a socket read for the remote client's move. From the Game class's perspective, this player is indistinguishable from a HumanPlayer or an AIPlayer: the Player abstraction handles the variation.

On the server side, the Game runs to completion, and each move triggers a notification to registered observers. A `NetworkBroadcastObserver` would be attached to the Game to relay events to all connected spectator clients. The Observer pattern accommodates this addition without any change to the Game class.

Additional concerns arise in a networked context that are outside the scope of the LLD as presented: session management, authentication, disconnection handling, and consistency guarantees. These are properly addressed at a higher level of the system architecture.

### Question: How would the design be tested?

The design is highly amenable to unit testing because of its dependency injection and its separation of concerns. The following testing strategies are available.

The Board class is tested by constructing a board, applying a sequence of placements, and asserting on the resulting state via the query methods. Invalid operations are tested by asserting that the appropriate exceptions are raised.

The WinChecker implementations are tested as pure functions of board state. A test constructs a board with specific cell values, invokes the checker's `check` method, and asserts on the returned value. No mock objects are required because the checker has no external dependencies.

The Game class is tested with a helper class named `ScriptedPlayer`, which returns a pre-programmed sequence of moves rather than reading from console input. The full implementation appears as Practice Question 2. A test constructs a game with two ScriptedPlayers, plays the game to completion, and asserts on the final status and winner.

Observer behaviour is tested with a `RecordingObserver` that captures every callback into a list. A test attaches the recorder, plays a game, and asserts on the sequence of recorded events.

### Question: How would the AI difficulty be made configurable?

Configurable difficulty is implemented by nesting a Strategy pattern within the AI player. The SmartAIPlayer accepts a `MoveSelectionStrategy` at construction time, and the strategy determines how moves are computed. Possible strategies include random selection, heuristic evaluation, minimax with a specified depth limit, and Monte Carlo tree search with a specified iteration count. Difficulty corresponds to the choice of strategy.

This design has the interesting property that Strategy is applied at two levels: the Player is a strategy for how moves are chosen, and within an AI player the MoveSelectionStrategy is a further strategy for how the AI decides. This nesting is not gratuitous; each level of Strategy addresses a distinct axis of variation.


---

## 15. Practice Questions with Detailed Solutions

The following exercises are provided to deepen understanding of the concepts covered in this document. Attempt each question independently before consulting the accompanying solution.

### Practice Question 1: Introduce a Public unplace Method on Board

**Task:** The `SmartAIPlayer.make_move` method as currently implemented accesses the private `_grid` and `_filled_count` attributes of the Board to reverse a tentative placement. This is an encapsulation violation. Introduce a public `unplace` method on the Board class that reverses a placement in a controlled manner, and refactor the AI implementation to use this method instead of accessing private state directly. The `unplace` method should validate its argument and raise ValueError on invalid input.

<details>
<summary>Solution</summary>

The `unplace` method is symmetric to the `place` method in its validation discipline: it verifies that the position is within bounds and currently occupied, and it raises ValueError if either condition is violated. The method returns the symbol that was removed, which is useful for undo stacks that may need to know what was removed.

```python
def unplace(self, position: Position) -> Symbol:
    """
    Reverse a previous placement, restoring the cell at the given
    position to EMPTY. Return the symbol that was removed.

    The method validates its argument in the same manner as place:
    the position must be within bounds, and the cell must currently
    be occupied. Raising ValueError on invalid input maintains
    symmetry with place and ensures that programming defects surface
    at their source.
    """
    if not self.is_in_bounds(position):
        raise ValueError(
            f"Position {position} is out of bounds for a board "
            f"of size {self.size}"
        )
    if self.is_empty_at(position):
        raise ValueError(
            f"Position {position} is already empty and cannot be "
            f"unplaced"
        )

    removed_symbol = self._grid[position.row][position.col]
    self._grid[position.row][position.col] = Symbol.EMPTY
    self._filled_count -= 1
    return removed_symbol
```

The AI implementation is refactored to use this method, eliminating the direct access to private attributes:

```python
# Within SmartAIPlayer.make_move:
board.place(self.symbol, position)
score = self._minimax(...)
board.unplace(position)  # replaces direct manipulation of _grid and _filled_count
```

The benefit of this refactoring extends beyond the immediate encapsulation improvement. The Board's private attributes are now genuinely private, meaning that any change to the internal representation of the grid does not require corresponding changes in the AI. If a future revision were to replace the two-dimensional list representation with a one-dimensional list or a dictionary, the AI would continue to function without modification because it interacts with the Board solely through the public interface.

</details>

### Practice Question 2: Implement a ScriptedPlayer for Testing

**Task:** Implement a `ScriptedPlayer` class that plays a pre-programmed sequence of moves rather than reading from console input or computing moves. The class is intended for use in deterministic unit tests, where reproducibility requires that the sequence of moves be fully specified in advance. If the player is asked to produce more moves than were specified at construction time, the class should raise a clear error.

<details>
<summary>Solution</summary>

The `ScriptedPlayer` accepts the move sequence as a constructor parameter and returns moves in order on successive invocations of `make_move`. Running out of scripted moves indicates that the test scenario is misconfigured, so the method raises RuntimeError with a descriptive message.

```python
class ScriptedPlayer(Player):
    """
    A player that returns moves from a pre-programmed sequence, in
    order. Suitable for unit tests that require deterministic and
    reproducible gameplay.

    If the player is asked to produce more moves than were specified
    at construction time, the make_move method raises RuntimeError.
    This condition indicates either a test scenario that runs longer
    than expected (which may reveal a bug in the code under test) or
    a script that is too short (which is a defect in the test itself).
    """

    def __init__(
        self,
        name: str,
        symbol: Symbol,
        moves: list[Position],
    ):
        super().__init__(name, symbol)

        # A shallow copy of the moves list is stored so that
        # subsequent modification of the caller's list does not
        # affect the player. Position instances are frozen dataclasses,
        # so a shallow copy is safe.
        self._moves = list(moves)
        self._index = 0

    def make_move(self, board: Board) -> Position:
        if self._index >= len(self._moves):
            raise RuntimeError(
                f"ScriptedPlayer {self.name} was asked for move number "
                f"{self._index + 1} but only {len(self._moves)} moves "
                f"were provided at construction time"
            )
        next_move = self._moves[self._index]
        self._index += 1
        return next_move
```

A representative unit test using this class demonstrates how the design's separation of concerns enables straightforward deterministic testing:

```python
def test_x_wins_via_top_row():
    """
    Verify that a game in which X completes the top row results in
    the correct final status and winner.
    """
    x_moves = [Position(0, 0), Position(0, 1), Position(0, 2)]
    o_moves = [Position(1, 0), Position(1, 1)]

    alice = ScriptedPlayer("Alice", Symbol.X, x_moves)
    bob = ScriptedPlayer("Bob", Symbol.O, o_moves)

    game = Game(players=[alice, bob])
    game.play()

    assert game.status == GameStatus.WON, (
        f"Expected WON, got {game.status}"
    )
    assert game.winner is alice, (
        f"Expected alice as winner, got {game.winner}"
    )
```

The test exercises the entire game loop end-to-end without any human interaction and without any randomness, producing the same outcome on every run.

</details>

### Practice Question 3: Implement KInARowChecker for Gomoku Variants

**Task:** Implement a `KInARowChecker` class that generalises the win condition to permit winning lines of length K on a board of dimension N, where K may be less than or equal to N. This class enables variants such as Gomoku, which uses K equal to five on a fifteen by fifteen board. The class should be a drop-in replacement for `NInARowChecker` and should require no modification of any other class in the design.

<details>
<summary>Solution</summary>

The algorithm iterates over every cell as a potential starting point for a winning line. For each starting point, it examines the K cells extending in each of four forward directions: right (0, 1), down (1, 0), down-right (1, 1), and down-left (1, -1). The four backward directions (left, up, up-left, up-right) do not need to be examined separately, because any line extending backward from cell A also extends forward from some other cell B, and B will be examined as its own starting point in the outer iteration.

```python
class KInARowChecker(WinChecker):
    """
    Concrete WinChecker for the generalised K-in-a-row win rule,
    where K may be less than or equal to the board dimension.

    Example uses:
      Standard three by three Tic Tac Toe: KInARowChecker(k=3) on a
      board of size 3.
      Gomoku: KInARowChecker(k=5) on a board of size 15.

    Algorithm: iterate over every cell as a potential starting point
    for a winning line. For each starting cell that is not EMPTY,
    examine the K cells extending in each of four forward directions
    (right, down, down-right, down-left). If any such K-cell sequence
    lies entirely within the board and contains the same non-EMPTY
    symbol in every cell, that symbol is the winner. The four
    backward directions do not need to be examined separately because
    they are covered by starting from a different cell.

    Time complexity: O(N squared * 4 * K) per invocation, which is
    equal to O(N squared * K).
    """

    # The four forward directions, expressed as (row-delta, col-delta)
    # tuples. Backward directions are implicitly covered by starting
    # from the other end of the line.
    _DIRECTIONS = [(0, 1), (1, 0), (1, 1), (1, -1)]

    def __init__(self, k: int):
        if k < 2:
            raise ValueError(
                f"The win length K must be at least 2, received {k}"
            )
        self.k = k

    def check(self, board: Board) -> Optional[Symbol]:
        n = board.size

        # If K exceeds the board dimension, no winning line of length
        # K can fit on the board and no winner is possible.
        if self.k > n:
            return None

        for row in range(n):
            for col in range(n):
                starting_symbol = board.get(Position(row, col))
                if starting_symbol == Symbol.EMPTY:
                    continue
                for direction_row, direction_col in self._DIRECTIONS:
                    if self._line_matches(
                        board,
                        row,
                        col,
                        direction_row,
                        direction_col,
                        starting_symbol,
                    ):
                        return starting_symbol
        return None

    def _line_matches(
        self,
        board: Board,
        start_row: int,
        start_col: int,
        direction_row: int,
        direction_col: int,
        target_symbol: Symbol,
    ) -> bool:
        """
        Return True if the K cells starting at (start_row, start_col)
        and stepping by (direction_row, direction_col) all contain
        target_symbol and all lie within the board.
        """
        n = board.size
        for step in range(self.k):
            current_row = start_row + step * direction_row
            current_col = start_col + step * direction_col
            if not (0 <= current_row < n and 0 <= current_col < n):
                return False
            if board.get(Position(current_row, current_col)) != target_symbol:
                return False
        return True
```

Constructing a Gomoku game with this checker requires no modification of the Game, Board, or Player classes:

```python
game = Game(
    players=[HumanPlayer("Alice", Symbol.X), HumanPlayer("Bob", Symbol.O)],
    board_size=15,
    win_checker=KInARowChecker(k=5),
)
```

The Game class accepts the new WinChecker via its existing constructor parameter. This exercise concretely demonstrates the value of designing WinChecker as a Strategy interface from the outset: a substantial new game variant is accommodated by writing a single new class, with zero modification of the surrounding code.

</details>

### Practice Question 4: Add an on_invalid_move Observer Event

**Task:** Extend the `GameObserver` interface with a new event method called `on_invalid_move` that is invoked when a player returns an illegal move. Observers should receive the game, the offending player, and the illegal position as arguments. Wire this event into `Game.play_turn` so that observers are notified before the Game raises its ValueError.

<details>
<summary>Solution</summary>

The new event method is added to the abstract base class with a default no-op implementation, so that existing observer subclasses continue to function without modification. The Game's `play_turn` method is amended to notify observers of the invalid-move event before raising the exception.

```python
class GameObserver(ABC):
    def on_move(self, game: "Game", move: Move) -> None:
        pass

    def on_game_end(self, game: "Game") -> None:
        pass

    def on_invalid_move(
        self,
        game: "Game",
        player: Player,
        position: Position,
    ) -> None:
        """
        Called when a player's make_move method returns an illegal
        move. Observers may use this event for logging, metrics, or
        alternative recovery strategies. Default behaviour is a no-op.
        """
        pass
```

The Game's `play_turn` method is amended as follows:

```python
def play_turn(self) -> None:
    if self.is_over:
        raise GameOverError(
            f"Cannot play a turn because the game has already "
            f"terminated in state {self.status.name}"
        )

    player = self.current_player
    position = player.make_move(self.board)

    if not self.board.is_valid_move(position):
        # Notify observers before raising, so that observers may log
        # the event, update statistics, or trigger alternative
        # recovery logic before the exception propagates.
        for observer in self._observers:
            observer.on_invalid_move(self, player, position)
        raise ValueError(
            f"Player {player} returned an illegal move at "
            f"position {position}"
        )

    # ... remainder of the method is unchanged ...
```

This extension illustrates how the Observer pattern shades into event-driven policy. A concrete observer might, for example, log the invalid-move event for later analysis, or it might implement a retry policy that solicits a corrected move from the offending player before allowing the exception to propagate. Either policy can be introduced without any further modification to the Game class, because the point of extension is the Observer interface.

</details>

### Practice Question 5: Critique the Current Design

**Task:** Identify three specific weaknesses in the design as it stands, and for each, describe how the weakness could be addressed. Consider issues of encapsulation, extensibility, testability, and general software engineering discipline.

<details>
<summary>Solution</summary>

**Weakness 1: Encapsulation violation in the SmartAIPlayer minimax implementation.**

The SmartAIPlayer accesses the private `_grid` and `_filled_count` attributes of the Board directly in order to undo tentative placements during the minimax search. This coupling is fragile because any future change to the Board's internal representation would break the AI without any warning at the Board interface level. The correct resolution is to introduce a public `unplace` method on the Board class, as detailed in Practice Question 1, and refactor the AI to use that method exclusively.

**Weakness 2: The Symbol enumeration limits the design to two or three players.**

The Symbol enumeration currently contains three values: EMPTY, X, and O. Adding support for more players would require either extending the enumeration (which is a modification of the type and therefore affects all code that depends on it) or promoting Symbol from an enumeration to a class that permits construction of new symbol values at runtime. The first approach is simpler but less flexible; the second approach is more flexible but loses the compile-time type safety that enumerations provide.

A pragmatic middle ground is to extend the enumeration with a modest set of additional values (for example, up to eight symbols) and to document that the design supports at most that many players. This approach preserves type safety while accommodating small variations. A design that must support arbitrary numbers of dynamically-created player symbols should adopt the class-based approach.

**Weakness 3: The Game.play method performs input and output directly.**

The `Game.play` method contains print statements that render the final board and announce the outcome. This directly couples the Game class to the console output channel, which is inconsistent with the general design principle of keeping input and output at the edges of the system rather than embedded in the core logic.

The resolution is to remove the print statements from `Game.play` and to introduce a `ConsoleRenderer` observer that reacts to `on_game_end` events by producing the final rendering. Callers who wish to render the game to the console attach a ConsoleRenderer; callers who wish to render it to a graphical user interface or a network channel attach a different observer. The Game class becomes independent of the output surface, and the same Game logic can be used with any presentation mechanism.

A related weakness that could be listed as a fourth item is that the `history` attribute is exposed as a mutable list rather than through a getter method that returns a copy. External code that iterates over the history could inadvertently modify it, corrupting the game's audit trail. Introducing a `get_history` method that returns a defensive copy of the list resolves this issue while preserving the ability of external code to inspect the history.

</details>


---

## 16. Summary Tables and Key Takeaways

This section consolidates the design into reference tables and summarises the principal lessons of the exercise.

### Class Inventory

| Component | Kind | Role |
|---|---|---|
| `Symbol` | Enumeration | The three possible cell values: X, O, EMPTY |
| `Position` | Frozen dataclass | A coordinate pair identifying a cell |
| `Move` | Frozen dataclass | A historical record of one completed move |
| `GameStatus` | Enumeration | The three possible game states |
| `GameOverError` | Exception | Raised when a move is attempted on a terminated game |
| `Board` | Class | Owner of the grid state and enforcer of move legality |
| `Player` | Abstract base class | The contract that all player types must satisfy |
| `HumanPlayer` | Concrete subclass | A player driven by console input |
| `RandomAIPlayer` | Concrete subclass | A player that selects moves uniformly at random |
| `SmartAIPlayer` | Concrete subclass | A player that selects moves via minimax |
| `WinChecker` | Abstract base class | The contract for win-detection algorithms |
| `NInARowChecker` | Concrete subclass | The standard N-in-a-row win rule |
| `KInARowChecker` | Concrete subclass (Practice Q3) | The generalised K-in-a-row win rule |
| `GameObserver` | Abstract base class | The contract for components that react to game events |
| `ConsoleLogger` | Concrete subclass | An observer that logs events to the console |
| `Game` | Class | The orchestrator that composes all of the above |

### Design Patterns Applied

| Pattern | Location in the Design | Justification |
|---|---|---|
| Strategy | `Player` hierarchy, `WinChecker` hierarchy | Player behaviour and win rules are both axes of variation that benefit from being encapsulated behind stable interfaces. |
| Observer | `GameObserver` interface and `Game.attach` mechanism | External reactions to game events (logging, presentation, networking) should be decoupled from the Game class to avoid the accumulation of responsibilities. |
| Enumeration with guard clauses | `GameStatus` and `play_turn` guard | The state-dependent behaviour of the game is limited enough that a full State pattern would introduce disproportionate structural overhead. |

### SOLID Principles Applied

| Principle | Where It Applies |
|---|---|
| Single Responsibility Principle | Each class has one focused responsibility: Board manages the grid, Player selects moves, WinChecker evaluates win conditions, Game coordinates the loop. |
| Open-Closed Principle | New player types and new win rules are added by writing new subclasses rather than by modifying existing classes. |
| Liskov Substitution Principle | Any Player subclass may be substituted wherever a Player is expected without altering the correctness of the Game. The same holds for WinChecker and GameObserver. |
| Interface Segregation Principle | The GameObserver interface provides multiple event-specific methods with default no-op implementations, so that observers implement only the events they care about. |
| Dependency Inversion Principle | The Game class depends on the abstract Player and WinChecker interfaces rather than on their concrete implementations, permitting substitution at construction time. |

### Key Design Decisions and Justifications

| Decision | Justification |
|---|---|
| Two-dimensional list for the board grid | Matches the natural mental model of the problem, produces readable code, and performs adequately for the scales under consideration. |
| Symbol enumeration includes EMPTY | Uniform typing across all cell operations, avoiding the overhead of Optional wrapping. |
| Position as a frozen dataclass | Provides named attributes, immutability, hashability, and extensibility with negligible ceremony. |
| Player as an abstract class hierarchy | Different player types have materially different auxiliary state and behaviour, justifying separate classes rather than a single class with a callback. |
| WinChecker as a separate Strategy | Win rules are an anticipated axis of variation; separating the algorithm behind an interface permits new rules without modification of existing code. |
| GameStatus as an enumeration rather than State pattern | The state-dependent behaviour is limited to a single guard clause, insufficient to justify the structural overhead of a class per state. |
| Move history maintained despite the absence of a current consumer | The cost is negligible and the presence of history enables a family of future features without redesign. |
| Observer for event notification, Strategy for behaviour variation | Clear separation between two different extension mechanisms: Observer for reactions to events, Strategy for pluggable algorithms. |

### The Universal LLD Framework

The framework applied in this document is universal across LLD problems. It consists of the following stages, executed in order:

1. **Clarify.** Never assume; ask structured questions to establish functional requirements, non-functional requirements, and out-of-scope declarations.
2. **Enumerate entities.** Extract nouns from the requirements and filter them through the identity-behaviour-domain test to identify candidate classes.
3. **Decide with alternatives.** For each significant design choice, enumerate the plausible alternatives and articulate the reasoning that leads to the selected option.
4. **Code with intent.** Write implementations whose comments explain the reasons for the design decisions rather than merely describing what the code does.
5. **Validate by simulation.** Walk through the design mentally against representative scenarios, including edge cases, and document any issues found.
6. **Anticipate extensions.** Describe how the design would accommodate likely follow-up requirements and identify the extension points that make those accommodations possible.

Internalising this framework is more valuable than memorising any specific design, because the framework applies to arbitrary future problems whereas the specific design applies only to Tic Tac Toe.

---

## 17. Final Reflection on the Design Process

The exercise of designing Tic Tac Toe well is instructive precisely because the problem sounds too small to reward significant design effort. The temptation to produce a short procedural implementation is strong, and the candidate who succumbs to that temptation has communicated something specific about their engineering discipline. The candidate who resists the temptation and produces a properly abstracted design has communicated something quite different.

Several general lessons emerge from the exercise.

### Restraint Is a Design Skill

Throughout the design, decisions were made to omit classes that would not have contributed value at the current scope. Cell was omitted because it would have been a wrapper around a single enumeration value. Turn was omitted because it is a piece of state rather than an entity. Score was omitted because the scope specified only a single game. Tournament-related structures were omitted for the same reason. Each of these omissions is a design decision, not an oversight, and articulating the reason for each demonstrates that the designer is exercising judgement rather than accumulating classes reflexively.

Over-design and under-design are both failures. The correct middle path is characterised by adding structure only when its value can be articulated, and by removing structure when its cost exceeds its benefit. The phrase "I considered adding class X but decided against it because Y" carries as much evidential weight as the phrase "I chose to add class X because Y."

### Strategy Pattern Rewards Foresight

The Player and WinChecker abstractions were introduced as abstract classes from the beginning of the design, well before any concrete need for variation existed. The value of that foresight materialised in Stage 10, when two AI player implementations were introduced without any modification to the surrounding code, and in Practice Question 3, when a K-in-a-row win rule was introduced without any modification to the surrounding code.

The trigger for applying the Strategy pattern is not the presence of current variation but the anticipation of future variation. Recognising the likelihood of future variation is a distinct skill from responding to current variation, and it is the more valuable of the two skills because it prevents rework rather than merely accommodating it.

### Pattern Application Is a Matter of Judgement

The State pattern was explicitly rejected in favour of an enumeration with a guard clause. This decision would have been the wrong one for the Elevator design, where the states admit substantially different behaviour, but it is the right decision for the Tic Tac Toe design, where the state-dependent behaviour is limited to a single conditional check. The ability to make this distinction is more valuable than the ability to apply a pattern mechanically wherever it fits syntactically.

Design patterns are tools that solve specific classes of problems. Applying a pattern where its problem does not exist introduces overhead without benefit, and it clutters the code with structure that will need to be maintained and explained despite serving no purpose. The candidate who declines to apply a pattern, and articulates the reason for the declining, demonstrates deeper understanding than the candidate who applies every pattern that could plausibly fit.

### Mental Simulation Surfaces Non-Obvious Correctness Issues

The Stage 12 validation exercise surfaced a correctness property of the design that is not obvious from reading the code: the winner check must precede the fullness check, or a game won on the final move will be misclassified as a draw. This property is documented in the docstring of `play_turn`, but the property itself was surfaced only by mentally simulating a specific scenario. Correctness issues of this kind are common in designs that have not been walked through, and they are often responsible for the most embarrassing production defects.

Mental simulation is inexpensive relative to the debugging cost of the defects it prevents. The discipline of walking through the design against representative scenarios should be routine, not an afterthought.

### Cross-Problem Fluency Is the Ultimate Goal

The design decisions in this document mirror the decisions made in earlier problems in the series. The Player hierarchy is structurally similar to the Vehicle hierarchy in the Parking Lot design. The WinChecker Strategy is structurally similar to the PricingStrategy in the same design. The GameObserver interface is structurally similar to the FloorObserver interface used with the Parking Lot's display boards. The pattern of validation via exceptions, the pattern of Enum-based status representation, and the pattern of composition-based orchestration all recur across the four designs that have been developed so far.

This recurrence is not a coincidence. It is the essence of design fluency: the ability to recognise the same structural patterns across superficially different problems and to apply the same principles to their solutions. A candidate who has internalised this fluency does not need to prepare for LLD interviews as such; the candidate simply does LLD, and each new problem is a variation on themes already understood.

The remaining problems in this series (Vending Machine, Splitwise, Ride-Hailing, and others) will add further concepts to the accumulated body of understanding: inventory management with concurrent access, graph-based relationship modelling, distributed state management, and real-time matching. As each new problem is worked through, the guiding question should be: what is new here, and what is a recurrence of a pattern already understood? The framework remains constant; the specific applications vary. Fluency is the ability to distinguish the invariant from the variable.

---

*This content is part of **Codeverra**, a platform for learning coding, data science, DSA, and AI from scratch.*
*Explore more at: [https://codeverra.com](https://codeverra.com)*
