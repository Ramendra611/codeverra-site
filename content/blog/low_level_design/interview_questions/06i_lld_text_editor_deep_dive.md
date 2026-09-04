# LLD Deep Dive #4 — Designing a Text Editor

> **What this document is:** A genuine, step-by-step walkthrough of how to *think through* a Text Editor LLD problem in an interview. Not a finished design dropped on you — but the reasoning, the false starts, the alternatives weighed, and the justifications behind each design decision.
>
> **Time investment:** Read this slowly. If you're doing this for interview prep, treat each stage as its own thinking exercise — pause and ask yourself "what would I do here?" before reading on.

---

## Table of Contents

1. [Why This Problem Matters](#1-why-this-problem-matters)
2. [Stage 1 — Receiving the Problem](#2-stage-1--receiving-the-problem)
3. [Stage 2 — Clarifying Requirements](#3-stage-2--clarifying-requirements)
4. [Stage 3 — Identifying Entities](#4-stage-3--identifying-entities)
5. [Stage 4 — The Text Buffer: Choosing a Data Structure](#5-stage-4--the-text-buffer-choosing-a-data-structure)
6. [Stage 5 — Cursor and Selection](#6-stage-5--cursor-and-selection)
7. [Stage 6 — Insert and Delete: The Core Operations](#7-stage-6--insert-and-delete-the-core-operations)
8. [Stage 7 — Undo/Redo: The Command Pattern](#8-stage-7--undoredo-the-command-pattern)
9. [Stage 8 — Clipboard: Cut, Copy, Paste](#9-stage-8--clipboard-cut-copy-paste)
10. [Stage 9 — Find and Replace](#10-stage-9--find-and-replace)
11. [Stage 10 — Formatting: Bold, Italic, Rich Text](#11-stage-10--formatting-bold-italic-rich-text)
12. [Stage 11 — File I/O and Dirty State](#12-stage-11--file-io-and-dirty-state)
13. [Stage 12 — View Notifications: The Observer Pattern](#13-stage-12--view-notifications-the-observer-pattern)
14. [Stage 13 — Putting It All Together](#14-stage-13--putting-it-all-together)
15. [Stage 14 — Validating with a Mental Walkthrough](#15-stage-14--validating-with-a-mental-walkthrough)
16. [Stage 15 — Anticipating Follow-Up Questions](#16-stage-15--anticipating-follow-up-questions)
17. [Final Reflection — What This Problem Teaches](#17-final-reflection--what-this-problem-teaches)
18. [Practice Questions](#18-practice-questions)

---

## 1. Why This Problem Matters

The three previous deep dives centered on relationships (Parking Lot), state machines (Elevator), and policy (Library). The Text Editor is a different beast: it's an **operations-on-a-data-structure** problem.

What makes it interesting:

- **Data structure choice is design.** The entire performance profile of your editor lives or dies on how you represent the text. Every design pattern is bolted on top of that one central decision.
- **It's the canonical Command pattern problem.** Undo/redo isn't just *a* feature — it's *the* feature that reveals whether a candidate understands command objects. Interviewers love seeing this done well.
- **Observer shows up naturally.** The editor's state changes; the view must re-render. This coupling problem practically screams for Observer.
- **Rich text introduces a subtle modeling problem.** How do you represent "characters 5 through 10 are bold"? The answer isn't obvious, and there are multiple defensible approaches.
- **It rewards restraint.** You could design for collaborative editing, multi-cursor, syntax highlighting, autosave, macros — and lose the interview. Knowing what to leave out is half the skill.

If Parking Lot is *"can you model a domain,"* Elevator is *"can you handle state transitions,"* and Library is *"can you enforce policy,"* then Text Editor is *"can you pick the right data structure and pattern for a mutation-heavy system."*

Let's think through it.

---

## 2. Stage 1 — Receiving the Problem

The interviewer says:

> "Design a text editor."

That's the full prompt. Nothing more.

Same trap as always: the vagueness is intentional. Let me list what's undefined:

- Console-based (like `nano`) or GUI-based (like VS Code)?
- Plain text (Notepad) or rich text (Word)?
- Single document or multiple tabs?
- What operations? Just type/delete? Undo? Find? Formatting?
- File loading and saving?
- Concurrency? Collaboration?
- Scale — 1KB documents or 100MB source files?

If we design for the maximum interpretation (VS Code with collaboration and syntax highlighting), we'll burn the entire interview on scope. If we design for the minimum (`echo "hello" > file.txt`), the interviewer will conclude we lack depth.

Neither works. So we pause and ask.

**The mental posture here:** *"They're not testing whether I know the answer; they're testing whether I can define the question."*

---

## 3. Stage 2 — Clarifying Requirements

Time to structure our clarifications. We do this in three buckets:

- **Functional requirements** — what does it do?
- **Non-functional requirements** — what qualities does it have?
- **Out of scope** — what we're not doing.

Let's walk through the questions we'd actually ask, and *why* each matters.

### Question 1: Plain text or rich text (with formatting)?

**Why ask:** This is the biggest fork in the design. Rich text needs a way to store formatting attributes (bold, italic, color, font). Plain text is just characters. Choosing rich text triples the complexity of the buffer.

Suppose the interviewer says: *"Let's support basic formatting — bold and italic — but keep it simple."*

Now we know: rich text, but limited. We won't need multi-font layout engines, but we need *some* way to associate style with ranges of characters.

### Question 2: Is undo/redo required?

**Why ask:** Undo/redo is the single biggest architectural constraint on a text editor. If it's required, *every operation* must be captured as a reversible command. That decision propagates everywhere.

Suppose: *"Yes — unlimited undo/redo."*

We're committing to the Command pattern. Note this — it's the spine of the design.

### Question 3: Cursor, selection, and clipboard operations?

**Why ask:** These are the core interactive features. Without them, we're just writing an append-only log.

Suppose: *"Yes to all — single cursor, single-range selection, cut/copy/paste."*

We'll model a `Cursor` (a position) and a `Selection` (a range). Clipboard is a small standalone thing.

### Question 4: Find and replace?

**Why ask:** Search complicates the design in interesting ways — how do we search efficiently, are matches case-sensitive, do we support regex? But it's a bounded feature.

Suppose: *"Basic find and replace all — no regex."*

Simple enough. We'll add a small `SearchService`.

### Question 5: File load/save?

**Why ask:** Persistence layer. Whether we support it affects our design (e.g., we need a "dirty" flag) but its actual implementation is usually trivial.

Suppose: *"Yes — load from a file path, save to a file path. Track whether the document has unsaved changes."*

Note the "dirty" state requirement.

### Question 6: Multiple documents / tabs?

**Why ask:** A multi-document editor is essentially N single-document editors + a coordinator. It's easy to add if the single-document design is clean.

Suppose: *"Single document is fine for now — but design so multi-document is a natural extension."*

Good — no immediate work needed, but we'll keep our `Editor` non-singleton and non-global.

### Question 7: GUI or CLI?

**Why ask:** Because they may confuse an interview about UI plumbing with an LLD interview.

Suppose: *"Ignore the UI. Assume something calls into your editor. We want the core model, not the view."*

Perfect — no UI to worry about. But we still model a `View` abstraction, so a real UI can attach as an observer.

### Question 8: Scale?

**Why ask:** A 1MB text file behaves totally differently from a 100MB log file. Data structure choice depends on this.

Suppose: *"Assume documents up to a few megabytes — a large source file, not an entire book. Insertions and deletions should be efficient."*

That eliminates naive whole-buffer copies. We need a proper text buffer, not just a Python string.

### Question 9: Concurrency? Collaboration?

**Why ask:** Collaborative editing (Google Docs style) is *dramatically* different from local editing. It needs CRDTs or operational transforms. We want to bound this out.

Suppose: *"Single user. No collaboration. Single-threaded."*

Big relief. We'll mention collaboration as an extension only.

### Recap to the Interviewer

Now we play back:

> *"To confirm: a single-user text editor with rich text (bold/italic), full undo/redo, single-cursor with selection, clipboard (cut/copy/paste), find and replace all (no regex), file load/save with dirty tracking, single document (extensible to multi), no UI (headless model), documents of a few megabytes, single-threaded. Correct?"*

If the interviewer nods, we're aligned. If not, they adjust and we adjust. Either way — we don't write a class until this handshake is done.

---

## 4. Stage 3 — Identifying Entities

Nouns from the requirements:

- text / document
- character
- cursor
- selection
- command / operation
- undo / redo (history)
- clipboard
- editor
- view
- search
- file
- formatting / style
- user

Now we filter using the three-question test:

1. **Does it have identity?**
2. **Does it have behavior or state?**
3. **Is it part of the domain or generic infrastructure?**

| Noun | Identity? | Behavior/State? | Verdict |
|---|---|---|---|
| document / text buffer | Yes | Yes (store text, expose operations) | **Class** |
| character | No | Just a value | **Reject** (primitive) |
| cursor | Yes | Position, movement | **Class** (small) |
| selection | Yes | Range | **Class** (small) |
| command | Yes (many) | execute/undo | **Class hierarchy** |
| history | Yes | Two stacks | **Class** |
| clipboard | Yes | Holds content | **Class** (small) |
| editor | Yes | Orchestrates everything | **Class** |
| view | External-ish | Reacts to state changes | **Interface (Observer)** |
| search | No identity | Algorithm | **Strategy** |
| file | External | I/O | **Service** or method |
| formatting / style | Yes (spans) | Associates ranges with attributes | **Class** |
| user | External actor | We don't model them | **Not a class** |

Rejected:
- **character** — it's just `str[i]`. Making a `Character` class would be Java-ism, not design.
- **user** — no login, no accounts, no per-user state. External actor.

Our skeleton:

```
TextBuffer, Cursor, Selection, Command (+ subclasses), History,
Clipboard, Editor, View (interface), FormattingSpans, SearchService
```

Plus one Strategy: `SearchStrategy` (if we want swappable search algorithms).

Now we design each piece — and we do it in an order that matters. **The text buffer comes first**, because everything else depends on it.

---

## 5. Stage 4 — The Text Buffer: Choosing a Data Structure

This is the pivotal decision. Let me lay out the alternatives before picking.

### The Naive Approach: A Python String

```python
class TextBuffer:
    def __init__(self):
        self.text = ""

    def insert(self, pos, s):
        self.text = self.text[:pos] + s + self.text[pos:]

    def delete(self, start, end):
        self.text = self.text[:start] + self.text[end:]
```

**How it works:** Concatenate slices to insert; concatenate slices to delete.

**Analogy:** It's like editing an essay by rewriting the entire essay every time you add a comma.

**Cost:** Every insert or delete is **O(n)** — you copy the whole buffer. For a 5MB document, every keystroke rewrites 5MB. Absolutely fine for tiny files. Unusable for a real editor.

Reject. But note it — this is the baseline against which better approaches justify themselves.

### Approach A: List of Characters

```python
class TextBuffer:
    def __init__(self):
        self.chars = []   # list of str characters
```

**Better?** In some ways — Python lists have amortized O(1) append. But `list.insert(pos, ch)` is still O(n) because everything after `pos` shifts. Same problem, slightly better constants.

Reject for the same reason.

### Approach B: List of Lines

```python
class TextBuffer:
    def __init__(self):
        self.lines = [""]   # a list of strings, one per line
```

**Insert:** Find the line, splice within it. O(line_length + line_lookup).
**Delete:** Similar.

**Pros:** Natural for line-oriented tasks — go to line N, render line N, etc. Editors that surface line numbers (basically all of them) benefit.

**Cons:** Insertions within a very long line are still O(line_length). If someone pastes a 1MB block onto one line, we're back to slow. Multi-line paste requires splicing lines.

**Real-world usage:** Historically common. Simple and effective for well-formatted code files (source lines are usually short).

Not bad. But we can do better on worst case.

### Approach C: Gap Buffer

**Analogy:** Imagine a whiteboard where you keep writing left to right, but sometimes you insert in the middle. Instead of rewriting everything to the right when you insert, you keep a **gap** — an empty region you can fill. When the cursor moves, you shift text across the gap to keep the gap centered where you're editing.

```
Before: [H][e][l][l][o]____________[W][o][r][l][d]
                     ^ gap starts   ^ gap ends
                     ^ cursor position

Type 'X' → [H][e][l][l][o][X]__________[W][o][r][l][d]
                            ^ gap shrinks by one
```

**Complexity:**
- **Insert at cursor:** O(1) amortized (just write into the gap; grow the gap when full).
- **Delete at cursor:** O(1) (expand the gap).
- **Move cursor:** O(distance moved) — you shift characters across the gap.
- **Random-access lookup:** O(1) via index arithmetic.

Editors that use gap buffers: **Emacs**, historically vim. It's beautifully suited to editing where the cursor stays roughly in one region.

**Cons:** When the cursor jumps far, we pay O(distance). Real users mostly edit near where they just typed, so this is rare — but not free.

### Approach D: Piece Table

**Analogy:** Think of a book editor working with the original manuscript and a stack of correction slips. The final "text" is a sequence of pointers: "read from original page 3, then insert this correction slip, then continue from page 4." You never modify the original — you just build a list of pieces.

```
original:  "the quick brown fox"
add:       "very "

pieces: [ (original, 0, 10), (add, 0, 5), (original, 10, 19) ]
                  = "the quick very brown fox"
```

**Complexity:**
- **Insert:** O(1) to add a piece (plus splitting existing piece — a small local op).
- **Delete:** Similar; may need to trim or drop pieces.
- **Lookup at index:** O(pieces) unless you index the pieces (piece tree makes it O(log n)).

**Real-world usage:** **VS Code** uses a piece tree. Microsoft Word famously used a piece table. It's ideal for undo-heavy systems because old buffers are immutable — you can reconstruct any prior state cheaply.

**Cons:** More complex to implement. Reads (extracting substring) require walking pieces.

### Approach E: Rope

**Analogy:** A binary tree of string chunks. Concatenation is O(log n) — you just make a new root. Splitting is O(log n). Great for very large documents.

**Real-world usage:** Some IDEs and specialty tools. Overkill for most.

### The Decision

The interviewer said "up to a few megabytes." That rules out the naive approaches, and it doesn't require the exotic ones. Any of B / C / D would work.

For **teaching purposes and interview clarity**, I'll go with a **gap buffer**. Reasons:

- Conceptually clean — one array, one gap, three pointers (start, gap_start, gap_end).
- The performance argument is easy to state: "insertions near the cursor are O(1); we pay only when the cursor jumps."
- It's a well-known editor data structure — showing you know it signals depth without going full academic.
- Simpler code than a piece table, but a real improvement over "just use a string."

Piece table would be a defensible answer too. What matters isn't which one — it's **that you can articulate why one wins over another for this workload**.

In interview I'd say:

> *"For a few-MB document with typical editing patterns (cursor edits near a working region), a gap buffer gives O(1) insertion and deletion at the cursor with simple code. A piece table would also work well and has the nice property of immutability for undo, but adds implementation complexity. A plain Python string is O(n) per keystroke — unacceptable for MB-sized files."*

### The Code

```python
class GapBuffer:
    """
    A gap buffer text storage.

    Internally, we hold a single character array. Somewhere inside it
    lives a "gap" — an unused region we treat as free space. The cursor
    is always positioned at the start of the gap.

    - Characters before the gap are the text to the LEFT of the cursor.
    - Characters after the gap are the text to the RIGHT of the cursor.
    - The gap itself is invisible to the outside world.

    Why this design?
    - Inserting a character is just: write into the gap, shrink the gap
      by one. O(1) amortized.
    - Deleting a character (backspace) is just: grow the gap by one.
      O(1). No shifting.
    - Moving the cursor by K positions requires shifting K characters
      across the gap. O(K), but K is usually small in practice.

    Alternatives considered and rejected:
    - Naive Python string: O(n) per keystroke; unusable for MB files.
    - Piece table: better for very large docs and cheap undo history,
      but more complex code. Overkill here.
    - Rope: only useful for enormous documents.
    """

    INITIAL_GAP = 64  # size of gap when the buffer is created

    def __init__(self, initial_text: str = ""):
        # We store a Python list because Python strings are immutable.
        # A list of single-char strings gives us mutable random access.
        n = len(initial_text)

        # Layout: [initial_text chars ...][gap of INITIAL_GAP slots]
        # gap_start is where the gap begins; gap_end is one past its last slot.
        # Initially, cursor is at end of initial_text.
        self._buf = list(initial_text) + [""] * self.INITIAL_GAP
        self._gap_start = n
        self._gap_end = n + self.INITIAL_GAP

    # ---- helpers ----

    @property
    def size(self) -> int:
        """Number of actual characters (excluding the gap)."""
        return len(self._buf) - (self._gap_end - self._gap_start)

    def _gap_size(self) -> int:
        return self._gap_end - self._gap_start

    def _grow_gap(self, min_extra: int) -> None:
        """
        Ensure at least `min_extra` free slots in the gap.
        Doubles the gap size (a common growth strategy — amortized O(1)).
        """
        needed = max(min_extra, self._gap_size() * 2 or self.INITIAL_GAP)
        # Insert `needed` empty slots at gap_end.
        self._buf[self._gap_end:self._gap_end] = [""] * needed
        self._gap_end += needed

    def _move_gap_to(self, pos: int) -> None:
        """
        Move the gap so it starts at `pos`. This is how the cursor moves.
        Shifts characters across the gap — cost O(|pos - current_gap_start|).
        """
        if pos < 0 or pos > self.size:
            raise IndexError(f"position {pos} out of range [0, {self.size}]")

        if pos < self._gap_start:
            # Moving gap left: shift chars from left-of-gap to right-of-gap.
            shift = self._gap_start - pos
            self._buf[self._gap_end - shift:self._gap_end] = \
                self._buf[pos:self._gap_start]
            self._gap_start -= shift
            self._gap_end -= shift
        elif pos > self._gap_start:
            # Moving gap right: shift chars from right-of-gap to left-of-gap.
            shift = pos - self._gap_start
            self._buf[self._gap_start:self._gap_start + shift] = \
                self._buf[self._gap_end:self._gap_end + shift]
            self._gap_start += shift
            self._gap_end += shift
        # If pos == gap_start, nothing to do.

    # ---- public API ----

    def insert(self, pos: int, text: str) -> None:
        """Insert `text` at position `pos`."""
        self._move_gap_to(pos)
        if len(text) > self._gap_size():
            self._grow_gap(len(text))
        for ch in text:
            self._buf[self._gap_start] = ch
            self._gap_start += 1

    def delete(self, start: int, end: int) -> str:
        """
        Delete characters in [start, end). Return the deleted text
        (needed by undo commands to know what to restore).
        """
        if not (0 <= start <= end <= self.size):
            raise IndexError(f"invalid delete range [{start}, {end})")

        # Extract the doomed text before we lose access to it.
        deleted = self.get_text(start, end)

        # Position the gap at `start`, then expand it to swallow `end - start`.
        self._move_gap_to(start)
        self._gap_end += (end - start)
        return deleted

    def get_text(self, start: int = 0, end: int | None = None) -> str:
        """Return the text in [start, end)."""
        if end is None:
            end = self.size
        if not (0 <= start <= end <= self.size):
            raise IndexError(f"invalid range [{start}, {end})")

        # Convert logical positions to physical buffer positions, skipping the gap.
        def phys(p: int) -> int:
            return p if p < self._gap_start else p + (self._gap_end - self._gap_start)

        result = []
        for p in range(start, end):
            result.append(self._buf[phys(p)])
        return "".join(result)

    def __len__(self):
        return self.size

    def __str__(self):
        return self.get_text()
```

Notice a few pedagogical touches:

- **`delete` returns the deleted text.** Not because "return values are good practice" — but because undo needs it. If you delete "World" and later undo, you must know it was "World" you deleted. Baking this into the API from day one prevents bolt-on rework later.
- **Insertion errors, deletion errors — we raise, not return `False`.** Same reasoning as the parking-lot spot: an out-of-range delete is a caller bug.
- **We didn't optimize `get_text` for large substrings.** The per-character loop is O(n) but has clarity. A production version would slice-copy in chunks.

That's the buffer. Everything from here builds on it.

---

## 6. Stage 5 — Cursor and Selection

The cursor is a position — an integer offset into the buffer. The selection is a range: start and end offsets.

### Decision Point 1: Store cursor on buffer or separately?

**Option A:** `TextBuffer.cursor` — the buffer tracks its own cursor.
**Option B:** `Cursor` is a separate object, held by the editor, that references the buffer.

I lean **B** because:

- A buffer with no cursor is more reusable (e.g., could be used for a text-processing pipeline where "cursor" makes no sense).
- Multi-cursor is an easier future extension when cursor isn't baked in.
- Selection is a range, not a point — it can't sensibly live "on" the buffer either.

The **gap buffer** *does* internally know where the gap is (which happens to be the cursor position in most operations). But that's an implementation detail. The public API takes explicit positions.

### Decision Point 2: What happens to the cursor when text is inserted before it?

Two options:

- **Cursor is a "sticky" position.** Insert 5 chars before the cursor → cursor stays where it is *logically* (i.e., the same character is still to its right), so its offset increases by 5.
- **Cursor is a "raw" offset.** Insert 5 chars before the cursor → cursor stays at the same offset, so it's now 5 characters earlier in the visible text.

Practically **every** editor uses the sticky model. Users expect that if they type at position 10, the cursor advances to position 11, not stays at 10.

**Decision:** sticky. This means every insert/delete operation must also adjust the cursor.

### The Code

```python
class Cursor:
    """
    Represents a single cursor position in the document.

    A cursor is just an integer offset — the position between two characters
    (or before the first / after the last). It's "sticky": when text is
    inserted before the cursor, the cursor moves forward.

    Why not just use an int on the Editor?
    - Wrapping it in a class lets us attach behavior (e.g., `move_to`)
      and validate.
    - Makes future multi-cursor support natural (Editor could hold a list
      of Cursor objects).
    """

    def __init__(self, position: int = 0):
        self._pos = position

    @property
    def position(self) -> int:
        return self._pos

    def move_to(self, pos: int, max_pos: int) -> None:
        """
        Move cursor to `pos`, clamped to [0, max_pos].
        `max_pos` is the current buffer size — the caller knows this.
        """
        self._pos = max(0, min(pos, max_pos))

    def shift(self, delta: int, max_pos: int) -> None:
        """Move cursor by `delta` (positive or negative), clamped."""
        self.move_to(self._pos + delta, max_pos)

    def __repr__(self):
        return f"Cursor(pos={self._pos})"


class Selection:
    """
    A range [start, end) of characters currently selected.

    An empty selection (start == end) means "no selection" — many editors
    treat this as identical to just having a cursor at that position.

    Invariant: start <= end. The `anchor` (the fixed end when the user
    is drag-selecting) is not modeled here; we simplify to just the range.
    """

    def __init__(self, start: int = 0, end: int = 0):
        if start > end:
            start, end = end, start
        self.start = start
        self.end = end

    @property
    def is_empty(self) -> bool:
        return self.start == self.end

    @property
    def length(self) -> int:
        return self.end - self.start

    def clear(self) -> None:
        """Reset to empty (used after operations consume the selection)."""
        self.end = self.start

    def __repr__(self):
        return f"Selection({self.start}, {self.end})"
```

Simple, focused. The cursor and selection do not know about the buffer — the editor coordinates them. This will pay off when we bring in commands.

---

## 7. Stage 6 — Insert and Delete: The Core Operations

Now we start assembling the Editor. Its first two responsibilities: insert text at the cursor, and delete either a character (backspace) or the current selection.

### Decision Point 1: Should Editor call buffer directly, or go through a Command?

**Option A:** `Editor.insert(text)` → directly calls `buffer.insert(...)`.
**Option B:** `Editor.insert(text)` → creates an `InsertCommand`, calls `execute()`.

Since we need undo/redo, **B is inevitable**. Every mutation must become a Command so it can be pushed onto the undo stack.

We'll design commands next — but for now, our Editor's public API should look like the *user's* API (`insert`, `delete`, `move_cursor`), and internally it wraps each in a Command.

### Decision Point 2: What if a selection is active when the user types?

Universal editor behavior: **typing replaces the selection.** So `insert("x")` when the selection covers `[5, 10)` should delete `[5, 10)` first, then insert `"x"` at position 5. That's *two* operations — but from the user's undo perspective, it's *one*.

This foreshadows the need for **composite commands** — a single command that groups multiple sub-commands, executed and undone atomically.

We're getting ahead of ourselves. Let's design commands.

---

## 8. Stage 7 — Undo/Redo: The Command Pattern

This is the design lynchpin of the entire editor. Get this right and everything falls into place.

### What is the Command pattern?

**Analogy:** Imagine a restaurant. When you order, the waiter doesn't yell "make a pizza!" at the chef — they write a **ticket** and pin it to the wheel. The ticket is a self-contained object: it knows what was ordered, when, for whom. It can be re-fired if the food burns, canceled, or filed for the night's records.

A Command object is the ticket. It encapsulates a request as a first-class object: it knows what to do, how to undo, and what data it needs to do both.

### Structure

Each command implements:

- `execute()` — perform the action.
- `undo()` — reverse it.

The Editor keeps two stacks:

- `undo_stack` — commands that have been executed.
- `redo_stack` — commands that have been undone (available to redo).

**Rules:**

- Running a new command → push to undo stack, **clear the redo stack** (because the redo history is now invalid — the user branched).
- `undo()` → pop from undo stack, call `undo()`, push to redo stack.
- `redo()` → pop from redo stack, call `execute()`, push to undo stack.

### Why can't we just store snapshots (Memento) for undo?

Because for a 5MB file, storing a snapshot after every keystroke would eat gigabytes. Commands store only the **delta** — "you inserted 'x' at position 42" — which is tiny. Snapshots are used for coarser-grained undo (e.g., "revert to save point"); commands are used for fine-grained undo.

### The Command Interface

```python
from abc import ABC, abstractmethod


class Command(ABC):
    """
    A reversible operation on the editor.

    Each Command knows:
      - How to execute itself (state change).
      - How to undo itself (revert that change).

    We pass the editor into execute/undo rather than storing it as a field
    for two reasons:
      1. Commands become reusable across editors (unusual but conceptually clean).
      2. It's clearer at call sites where the mutation happens.

    Some frameworks also add a `redo()` method distinct from `execute()`. We
    don't — for our operations, redo IS execute. If a command needed different
    logic for redo (rare), it could override.
    """

    @abstractmethod
    def execute(self, editor: "Editor") -> None: ...

    @abstractmethod
    def undo(self, editor: "Editor") -> None: ...
```

### Concrete Commands

```python
class InsertCommand(Command):
    """
    Insert `text` at `position`.

    Undo: delete [position, position + len(text)).

    We record `position` at execute time. The cursor is NOT captured
    inside the command — the editor manages the cursor as a consequence
    of the mutation. If we captured cursor here, undo would need to
    restore both text and cursor state, coupling the two concerns.
    """

    def __init__(self, position: int, text: str):
        self.position = position
        self.text = text

    def execute(self, editor: "Editor") -> None:
        editor._buffer.insert(self.position, self.text)
        # Move cursor to just after the inserted text.
        editor._cursor.move_to(self.position + len(self.text), len(editor._buffer))

    def undo(self, editor: "Editor") -> None:
        editor._buffer.delete(self.position, self.position + len(self.text))
        editor._cursor.move_to(self.position, len(editor._buffer))


class DeleteCommand(Command):
    """
    Delete text in [start, end).

    Undo: reinsert the deleted text at `start`. We capture the deleted
    text during execute so undo has something to reinsert.

    Design note: We don't take `text` in the constructor because at
    construction time the caller doesn't know the exact content — the
    buffer does. So we store `deleted_text` as internal state set during
    execute(). This makes the command STATEFUL (execute must be called
    before undo can work), which is fine because commands always execute
    at least once before being undoable.
    """

    def __init__(self, start: int, end: int):
        self.start = start
        self.end = end
        self._deleted_text: str = ""

    def execute(self, editor: "Editor") -> None:
        self._deleted_text = editor._buffer.delete(self.start, self.end)
        editor._cursor.move_to(self.start, len(editor._buffer))

    def undo(self, editor: "Editor") -> None:
        editor._buffer.insert(self.start, self._deleted_text)
        editor._cursor.move_to(self.end, len(editor._buffer))


class CompositeCommand(Command):
    """
    A command composed of multiple sub-commands, treated as one unit.

    Used when:
    - User types with a selection active → delete selection + insert (one undo).
    - Paste over selection → delete + insert.
    - Replace-all → many delete+insert pairs, one undo.

    Undo runs sub-commands in REVERSE order — this is the general rule
    for undoing composed operations.

    This is the Composite pattern applied to Commands.
    """

    def __init__(self, commands: list[Command]):
        self.commands = commands

    def execute(self, editor: "Editor") -> None:
        for cmd in self.commands:
            cmd.execute(editor)

    def undo(self, editor: "Editor") -> None:
        for cmd in reversed(self.commands):
            cmd.undo(editor)
```

### The History

```python
class History:
    """
    Two-stack undo/redo manager.

    Invariants:
    - `undo_stack` is the sequence of commands that have been executed
      (and not undone) since some baseline. Top of stack is most recent.
    - `redo_stack` is the sequence of commands that have been undone
      (and not re-executed).

    When a NEW command is executed, redo_stack is cleared. This is the
    standard "branching invalidates future history" behavior — the
    user has diverged from their previous undo path.
    """

    def __init__(self, max_size: int | None = None):
        # max_size lets us bound memory. None = unlimited.
        self._undo_stack: list[Command] = []
        self._redo_stack: list[Command] = []
        self._max_size = max_size

    def record(self, cmd: Command) -> None:
        """Called after a new command has been executed."""
        self._undo_stack.append(cmd)
        # New action invalidates the redo path.
        self._redo_stack.clear()
        # Bound the stack size, dropping oldest.
        if self._max_size is not None and len(self._undo_stack) > self._max_size:
            self._undo_stack.pop(0)

    def can_undo(self) -> bool:
        return bool(self._undo_stack)

    def can_redo(self) -> bool:
        return bool(self._redo_stack)

    def pop_undo(self) -> Command:
        return self._undo_stack.pop()

    def push_redo(self, cmd: Command) -> None:
        self._redo_stack.append(cmd)

    def pop_redo(self) -> Command:
        return self._redo_stack.pop()

    def push_undo(self, cmd: Command) -> None:
        self._undo_stack.append(cmd)
```

The `History` doesn't do the executing itself — the `Editor` does. `History` just tracks. This split matters because it keeps history dumb: it doesn't need to know what a command *does*.

---

## 9. Stage 8 — Clipboard: Cut, Copy, Paste

The clipboard is tiny. It holds text. Three operations use it:

- **Copy:** read selected text, store in clipboard. Buffer unchanged. Not undoable.
- **Cut:** read selected text, store in clipboard, delete selection. Undoable.
- **Paste:** insert clipboard content at cursor (replacing selection if active). Undoable.

### Decision Point: Clipboard as separate class or inline in Editor?

Very small chunk of state — arguable. But we separate it because:

- It might be system-wide (a real OS clipboard is shared across apps). Abstraction makes future swap-in trivial.
- It has behavior (`get`, `set`, `has_content`) — enough to earn a class.

### The Code

```python
class Clipboard:
    """
    Holds the current clipboard content (a plain string).

    In a real system this might wrap the OS clipboard via a platform API;
    here it's an in-memory store. Keeping it as an interface (with a single
    default implementation) means we can plug in an OSClipboard later
    without changing the Editor.

    We don't currently store rich-text formatting on paste. That's a
    conscious simplification — a real editor's clipboard is a bag of
    typed payloads (plain text, rich text, image, ...). Extension point.
    """

    def __init__(self):
        self._content: str = ""

    def set(self, text: str) -> None:
        self._content = text

    def get(self) -> str:
        return self._content

    def has_content(self) -> bool:
        return bool(self._content)
```

The Cut/Paste operations use commands we've already built. **We don't need new command classes** — cut is `DeleteCommand` + a clipboard write, paste is `InsertCommand`, cut-over-selection is `CompositeCommand([DeleteCommand, ...])`. The clipboard write itself is not undoable (universal editor convention — undo doesn't restore the clipboard).

We'll wire it into the Editor shortly.

---

## 10. Stage 9 — Find and Replace

### Requirements recap: basic find, replace all. No regex.

Find returns a list of positions. Replace all replaces every occurrence and must be **one undo step** (that's the user expectation).

### Decision Point 1: Where does search live?

- **On the buffer** — buffer.find(pattern)?
- **On the editor** — editor.find(pattern)?
- **A separate SearchService?**

The buffer is a low-level storage. Search is a text-processing algorithm. They should be separate. Going with a **SearchService**.

### Decision Point 2: Strategy pattern for search algorithm?

For plain literal search on small docs, `str.find` in a loop is fine. But interviewers appreciate seeing an interface that admits multiple algorithms:

- Literal (case-sensitive)
- Case-insensitive
- Regex (extension)
- Whole word (extension)

That's a natural **Strategy pattern**.

Even if we implement only one now, sketching the interface is cheap and shows extensibility.

### The Code

```python
import re


class SearchStrategy(ABC):
    """
    Given a text and a query, return all match positions.

    A position is (start, end). We return end so that replace-all knows
    how much to delete (queries can be different lengths from replacements,
    and case-insensitive search may match different-cased text).

    Why return positions instead of doing the whole replace here?
    - Separation of concerns: search algorithm knows text, not how to mutate.
    - The Editor turns positions into commands, wrapping them for undo.
    """

    @abstractmethod
    def find_all(self, text: str, query: str) -> list[tuple[int, int]]: ...


class LiteralSearch(SearchStrategy):
    def find_all(self, text, query):
        if not query:
            return []
        positions = []
        i = 0
        while True:
            idx = text.find(query, i)
            if idx == -1:
                break
            positions.append((idx, idx + len(query)))
            i = idx + len(query)   # skip past this match (non-overlapping)
        return positions


class CaseInsensitiveSearch(SearchStrategy):
    def find_all(self, text, query):
        if not query:
            return []
        # Use regex with IGNORECASE to correctly get match lengths.
        # (We can't just lowercase both — locale-specific edge cases with
        # Unicode ß → SS mess up index arithmetic.)
        return [(m.start(), m.end()) for m in re.finditer(re.escape(query), text, re.IGNORECASE)]


class SearchService:
    """
    A small orchestrator. Holds a strategy; can be swapped at runtime.
    """
    def __init__(self, strategy: SearchStrategy | None = None):
        self._strategy = strategy or LiteralSearch()

    def set_strategy(self, strategy: SearchStrategy) -> None:
        self._strategy = strategy

    def find(self, text: str, query: str) -> list[tuple[int, int]]:
        return self._strategy.find_all(text, query)
```

### Replace-All as a Single Undo Step

The user hits "Replace All" once. If they undo, they expect **every** replacement to be undone in one step — not one-by-one.

Solution: build a `CompositeCommand` containing all the individual delete+insert pairs, execute it once, and push a single entry onto the undo stack.

Subtle detail: **replacing changes indices**. If we replace `"foo"` (3 chars) with `"bar-baz"` (7 chars), every subsequent match's index shifts by +4. To avoid this bookkeeping, we go **right-to-left**: process matches from the end of the document backward. Positions to the left are unaffected by changes to the right.

This will be a method on the Editor. We'll show it in the "putting it all together" stage.

---

## 11. Stage 10 — Formatting: Bold, Italic, Rich Text

Now we enter the trickier part. How do you represent "characters 5 through 10 are bold and characters 8 through 15 are italic"?

### Approach A: Character-Level Attributes

Every character carries its own attributes:

```python
[
  ("H", set()),
  ("e", set()),
  ("l", {"bold"}),
  ("l", {"bold"}),
  ("o", {"bold"}),
]
```

**Pros:** Simple to query — what's the style of character 5? Look at character 5.
**Cons:** Bloats memory 5–10x. Every attribute change touches every character in the range. Hard to serialize efficiently.

### Approach B: Attribute Spans (Range-Based)

Store attributes as ranges:

```python
spans = [
  Span(start=2, end=5, attrs={"bold"}),
  Span(start=4, end=8, attrs={"italic"}),
]
```

**Pros:** Compact. Natural for range operations ("make [5, 10) bold").
**Cons:** Complex to maintain — when you insert or delete text in the buffer, existing spans must be shifted / split / merged. When you apply overlapping formatting, spans must be split.

Real-world editors (Word, VS Code) essentially use span-based models with careful bookkeeping.

### Decision

**Approach B.** For the interview, we'll implement the *interface* cleanly and describe the maintenance rules; a fully bulletproof implementation would be its own hour.

### The Model

```python
from dataclasses import dataclass, field


@dataclass
class FormatSpan:
    """
    A range [start, end) with a set of formatting attributes.

    Attributes are stored as a set of string labels ("bold", "italic").
    A future extension could carry attribute *values* (e.g., color="#FF0000").
    """
    start: int
    end: int
    attrs: set[str] = field(default_factory=set)

    def contains(self, pos: int) -> bool:
        return self.start <= pos < self.end


class FormattingSpans:
    """
    Manages the collection of format spans over the document.

    Invariants (we won't enforce these strictly here, but they matter):
    - Spans may overlap (bold and italic can coexist on the same range).
    - Two spans with identical attrs may be merged for compactness — but
      we don't do this for pedagogical simplicity.

    When the buffer changes:
    - insert at pos: shift all spans with start >= pos by +len(text);
      for a span that STRADDLES pos, extend its end by +len(text)
      (the inserted text inherits the formatting of the surrounding span).
    - delete [s, e): remove or trim spans overlapping the deletion.

    This module is the source of ALL span bookkeeping. The Editor calls
    into it whenever text changes.
    """

    def __init__(self):
        self._spans: list[FormatSpan] = []

    def apply(self, start: int, end: int, attr: str) -> None:
        """Add an attribute to the range [start, end)."""
        self._spans.append(FormatSpan(start, end, {attr}))

    def remove(self, start: int, end: int, attr: str) -> None:
        """
        Remove the attribute from any span overlapping [start, end).
        This may require splitting spans — a span that partially overlaps
        must be split into overlapping and non-overlapping parts.

        We keep the implementation compact by rebuilding spans:
        for each existing span, produce 0-3 replacement spans as needed.
        """
        new_spans: list[FormatSpan] = []
        for span in self._spans:
            if attr not in span.attrs or span.end <= start or span.start >= end:
                # No overlap or attribute not present here — keep unchanged.
                new_spans.append(span)
                continue
            # There is overlap and the attribute is present.
            # Emit up to three pieces: pre-overlap, overlap-without-attr, post-overlap.
            if span.start < start:
                new_spans.append(FormatSpan(span.start, start, set(span.attrs)))
            # Overlap piece: keep other attrs; drop the removed one.
            overlap_attrs = set(span.attrs) - {attr}
            if overlap_attrs:
                new_spans.append(FormatSpan(max(span.start, start), min(span.end, end), overlap_attrs))
            if span.end > end:
                new_spans.append(FormatSpan(end, span.end, set(span.attrs)))
        self._spans = new_spans

    def attrs_at(self, pos: int) -> set[str]:
        """All attributes active at `pos`."""
        result: set[str] = set()
        for span in self._spans:
            if span.contains(pos):
                result |= span.attrs
        return result

    def on_insert(self, pos: int, length: int) -> None:
        """
        Called after `length` chars are inserted at `pos`.
        Spans starting at or after `pos` shift right by `length`.
        Spans straddling `pos` grow their end by `length`.
        """
        for span in self._spans:
            if span.start >= pos:
                span.start += length
                span.end += length
            elif span.end > pos:   # span straddles the insertion point
                span.end += length

    def on_delete(self, start: int, end: int) -> None:
        """
        Called after chars in [start, end) are deleted.
        Adjust spans: shift, trim, or drop.
        """
        length = end - start
        surviving: list[FormatSpan] = []
        for span in self._spans:
            if span.end <= start:
                # Wholly before deletion — unchanged.
                surviving.append(span)
            elif span.start >= end:
                # Wholly after deletion — shift left.
                span.start -= length
                span.end -= length
                surviving.append(span)
            else:
                # Overlaps the deletion; clip.
                new_start = min(span.start, start)
                new_end = max(span.end - length, new_start)
                if new_end > new_start:
                    surviving.append(FormatSpan(new_start, new_end, span.attrs))
                # else: span was entirely consumed by the deletion — drop it.
        self._spans = surviving
```

### Formatting as Commands

Applying bold to a range is a mutation → it must be undoable → it's a Command.

```python
class ApplyFormatCommand(Command):
    """
    Apply an attribute (e.g. 'bold') to the range [start, end).

    Undo removes that attribute from the range. We could snapshot the
    entire spans structure before/after, but incremental undo (add on
    execute, remove on undo) is much cheaper.
    """
    def __init__(self, start: int, end: int, attr: str):
        self.start = start
        self.end = end
        self.attr = attr

    def execute(self, editor):
        editor._formatting.apply(self.start, self.end, self.attr)

    def undo(self, editor):
        editor._formatting.remove(self.start, self.end, self.attr)
```

There's a subtle question: what if the range was *already* bold before we applied bold? Undo would remove bold, which is wrong (it was bold to start with). A production system captures a small delta ("which sub-ranges actually changed?") on execute. For interview scope, we call it out and move on:

> *"For simplicity, I'm treating ApplyFormat as a delta: execute adds the attribute; undo removes it. This assumes the range wasn't already fully-attributed. A production version would record only the sub-ranges that actually changed."*

That's the tradeoff spoken aloud. Interview gold.

---

## 12. Stage 11 — File I/O and Dirty State

Two operations, one flag.

- **Load:** open a file, read text, replace the buffer's content.
- **Save:** write the buffer's text to a file.
- **Dirty flag:** true if the buffer has been modified since the last save.

### Decision Point: How does Load interact with undo history?

Two reasonable choices:

- **Clear the history on load.** Loading a new file makes the prior document's history nonsensical.
- **Preserve the history.** You could "undo the load" and get the old document back.

We'll clear the history. That's Notepad/VS Code behavior and matches user intuition.

### The Code

```python
class FileService:
    """
    Thin wrapper around file I/O. Extracted as a class so we can:
    - Mock it in tests.
    - Swap in a cloud storage backend later.
    - Handle encoding issues in one place.
    """

    def load(self, path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def save(self, path: str, text: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
```

The dirty flag lives on the Editor — we'll wire it in the assembly stage.

---

## 13. Stage 12 — View Notifications: The Observer Pattern

The Editor is a model. There's a view (whatever renders text — a terminal, a GUI, a browser). The view must update when the model changes. But **the model must not know about specific views** — that would tightly couple model to presentation and prevent us from ever swapping the UI.

### Solution: Observer

The Editor exposes a subscribe/publish mechanism. Views (or anyone else) subscribe. When state changes, the Editor emits events. Subscribers react.

### Event Types

We could send one generic "state changed" event — but that forces every observer to figure out what changed. Better to be specific:

- `text_changed(start, end_before, end_after)` — the region [start, end_before) was replaced with content ending at end_after.
- `cursor_moved(new_position)`.
- `selection_changed(selection)`.
- `dirty_changed(is_dirty)`.
- `format_changed(start, end)`.

### The Code

```python
from typing import Callable

# We use a very simple observer mechanism: named events → list of callbacks.
# For interviews, this is clearer than a full Observer class hierarchy.

class EventBus:
    """
    A tiny pub/sub bus. The Editor uses it to notify observers of
    granular state changes without knowing who they are.

    Why not a formal Observer / Subject hierarchy?
    - For this size of system, callable subscribers are lighter and
      idiomatic Python.
    - Multiple event types are hard to model with a single-method
      Observer interface (would end up dispatching on event type string).
    - Callable subscribers let a single view subscribe to only the events
      it cares about (a syntax highlighter only wants text_changed,
      a status bar wants dirty_changed).
    """

    def __init__(self):
        self._subs: dict[str, list[Callable]] = {}

    def subscribe(self, event: str, callback: Callable) -> None:
        self._subs.setdefault(event, []).append(callback)

    def unsubscribe(self, event: str, callback: Callable) -> None:
        if event in self._subs and callback in self._subs[event]:
            self._subs[event].remove(callback)

    def emit(self, event: str, *args, **kwargs) -> None:
        for cb in self._subs.get(event, []):
            cb(*args, **kwargs)
```

The Editor holds an `EventBus` and emits events after each mutation. Views subscribe. No class dependency in either direction.

---

## 14. Stage 13 — Putting It All Together

Now we assemble the Editor. This is the orchestrator — the class users interact with.

### Design Point: How thin should the Editor be?

Ideally, the Editor is a thin coordinator: it takes user input, builds Commands, executes them via History, and emits events. All actual work lives in Buffer, Formatting, Clipboard, etc.

If the Editor starts *doing* things directly (mutating spans in-place, walking the buffer), we've broken the layered design.

### The Code

```python
class Editor:
    """
    The main coordinator. Users interact only with this class.

    Composition (dependencies, all injected or default-constructed):
    - _buffer:      TextBuffer (gap buffer under the hood)
    - _cursor:      Cursor
    - _selection:   Selection
    - _history:     History (undo/redo)
    - _clipboard:   Clipboard
    - _formatting:  FormattingSpans
    - _search:      SearchService
    - _files:       FileService
    - _events:      EventBus

    The Editor NEVER touches _buffer's internals directly outside of
    trivial reads. All mutations go through Command objects. This
    is the invariant that guarantees undo/redo correctness.
    """

    def __init__(self,
                 buffer: GapBuffer | None = None,
                 files: FileService | None = None):
        self._buffer = buffer or GapBuffer()
        self._cursor = Cursor(0)
        self._selection = Selection(0, 0)
        self._history = History()
        self._clipboard = Clipboard()
        self._formatting = FormattingSpans()
        self._search = SearchService()
        self._files = files or FileService()
        self._events = EventBus()

        self._dirty = False
        self._current_file: str | None = None

    # ---- state accessors ----

    @property
    def text(self) -> str:
        return str(self._buffer)

    @property
    def cursor_position(self) -> int:
        return self._cursor.position

    @property
    def selection(self) -> Selection:
        return self._selection

    @property
    def is_dirty(self) -> bool:
        return self._dirty

    def subscribe(self, event: str, callback: Callable) -> None:
        self._events.subscribe(event, callback)

    # ---- helper: run a command and record it ----

    def _run(self, command: Command) -> None:
        """
        Execute a command, record it for undo, mark dirty, emit events.

        This is THE single point through which every mutation flows.
        Any operation that skips this path breaks undo/redo. That's why
        we keep this method small and central.
        """
        command.execute(self)
        self._history.record(command)
        self._set_dirty(True)
        self._events.emit("text_changed")
        self._events.emit("cursor_moved", self._cursor.position)

    def _set_dirty(self, value: bool) -> None:
        if self._dirty != value:
            self._dirty = value
            self._events.emit("dirty_changed", value)

    # ---- cursor and selection ----

    def move_cursor(self, position: int) -> None:
        self._cursor.move_to(position, len(self._buffer))
        # Moving the cursor collapses the selection (standard behavior).
        self._selection.start = self._selection.end = self._cursor.position
        self._events.emit("cursor_moved", self._cursor.position)
        self._events.emit("selection_changed", self._selection)

    def select(self, start: int, end: int) -> None:
        self._selection = Selection(start, end)
        self._cursor.move_to(end, len(self._buffer))
        self._events.emit("selection_changed", self._selection)
        self._events.emit("cursor_moved", self._cursor.position)

    # ---- editing ----

    def insert(self, text: str) -> None:
        """
        Insert text at the cursor. If a selection is active, the
        selection is replaced with the inserted text (as one undo step).
        """
        if not self._selection.is_empty:
            # Composite: delete the selection, then insert.
            delete = DeleteCommand(self._selection.start, self._selection.end)
            insert = InsertCommand(self._selection.start, text)
            self._selection.clear()
            self._run(CompositeCommand([delete, insert]))
        else:
            self._run(InsertCommand(self._cursor.position, text))

    def backspace(self) -> None:
        """Delete the char before the cursor (or the selection, if any)."""
        if not self._selection.is_empty:
            self._delete_selection()
            return
        if self._cursor.position == 0:
            return  # nothing to delete
        start = self._cursor.position - 1
        end = self._cursor.position
        self._run(DeleteCommand(start, end))

    def _delete_selection(self) -> None:
        if self._selection.is_empty:
            return
        start, end = self._selection.start, self._selection.end
        self._selection.clear()
        self._run(DeleteCommand(start, end))

    # ---- clipboard ----

    def copy(self) -> None:
        """Copy selection to clipboard. Not undoable."""
        if self._selection.is_empty:
            return
        text = self._buffer.get_text(self._selection.start, self._selection.end)
        self._clipboard.set(text)

    def cut(self) -> None:
        """Copy + delete. Undoable as a single step."""
        if self._selection.is_empty:
            return
        text = self._buffer.get_text(self._selection.start, self._selection.end)
        self._clipboard.set(text)
        self._delete_selection()

    def paste(self) -> None:
        """Insert clipboard content at cursor (replacing selection if any)."""
        content = self._clipboard.get()
        if not content:
            return
        self.insert(content)  # reuses insert's selection-handling logic

    # ---- undo / redo ----

    def undo(self) -> None:
        if not self._history.can_undo():
            return
        cmd = self._history.pop_undo()
        cmd.undo(self)
        self._history.push_redo(cmd)
        # Note: dirty flag is intentionally left true — the standard
        # convention is "any change since save is dirty, and undo is
        # still a change since save." A stricter version would track
        # a "clean checkpoint" position in the history and compare
        # current position to it.
        self._events.emit("text_changed")
        self._events.emit("cursor_moved", self._cursor.position)

    def redo(self) -> None:
        if not self._history.can_redo():
            return
        cmd = self._history.pop_redo()
        cmd.execute(self)
        self._history.push_undo(cmd)
        self._events.emit("text_changed")
        self._events.emit("cursor_moved", self._cursor.position)

    # ---- find / replace ----

    def find_all(self, query: str) -> list[tuple[int, int]]:
        return self._search.find(self.text, query)

    def replace_all(self, query: str, replacement: str) -> int:
        """
        Replace every occurrence of `query` with `replacement`.
        Undoable as ONE step.
        Returns the number of replacements.
        """
        matches = self._search.find(self.text, query)
        if not matches:
            return 0
        # Process right-to-left so earlier indices remain valid as we go.
        subcommands: list[Command] = []
        for start, end in reversed(matches):
            subcommands.append(DeleteCommand(start, end))
            subcommands.append(InsertCommand(start, replacement))
        self._run(CompositeCommand(subcommands))
        return len(matches)

    # ---- formatting ----

    def apply_format(self, attr: str) -> None:
        """Apply an attribute to the current selection."""
        if self._selection.is_empty:
            return
        self._run(ApplyFormatCommand(self._selection.start, self._selection.end, attr))
        self._events.emit("format_changed", self._selection.start, self._selection.end)

    def attrs_at_cursor(self) -> set[str]:
        return self._formatting.attrs_at(self._cursor.position)

    # ---- file I/O ----

    def load(self, path: str) -> None:
        """
        Load a file. Clears undo history and dirty flag.
        This is NOT an undoable operation.
        """
        text = self._files.load(path)
        self._buffer = GapBuffer(text)
        self._cursor = Cursor(0)
        self._selection = Selection(0, 0)
        self._history = History()  # reset
        self._formatting = FormattingSpans()
        self._current_file = path
        self._set_dirty(False)
        self._events.emit("text_changed")

    def save(self, path: str | None = None) -> None:
        """Save to `path`, or to the current file if none given."""
        target = path or self._current_file
        if not target:
            raise ValueError("no file path known — provide one")
        self._files.save(target, self.text)
        self._current_file = target
        self._set_dirty(False)
```

Two things to notice:

1. The Editor is **thin**. Every mutation is either delegating to `_run` (which wraps it in commands and history) or a small non-mutating helper.
2. The `_run` method is the single choke point through which state changes flow. If we ever need to add logging, autosave triggers, remote sync — we add it here, once.

That's the design.

---

## 15. Stage 14 — Validating with a Mental Walkthrough

Let's simulate a user session. We do this to catch bugs the code doesn't reveal — sequences that "should work" but don't.

```
1. User creates editor. text = "", cursor = 0, dirty = false.
2. User types "Hello".
   → insert("Hello") called. selection empty, so InsertCommand(0, "Hello").
   → buffer becomes "Hello", cursor = 5, dirty = true.
   → undo_stack: [InsertCommand(0, "Hello")]
3. User types " World".
   → InsertCommand(5, " World").
   → buffer = "Hello World", cursor = 11.
   → undo_stack: [Insert("Hello"), Insert(" World")]
4. User hits undo.
   → pop Insert(" World"), call undo → delete [5, 11) → buffer = "Hello".
   → cursor moves to 5.
   → redo_stack: [Insert(" World")]
5. User types "!" — this should INVALIDATE the redo.
   → InsertCommand(5, "!").
   → buffer = "Hello!", cursor = 6.
   → undo_stack: [Insert("Hello"), Insert("!")]
   → redo_stack: []   ✓ correctly cleared
6. User selects [0, 5), types "Hi".
   → composite: [Delete(0, 5), Insert(0, "Hi")].
   → execute: buffer becomes "Hi!", cursor = 2.
   → undo: as one step, restore "Hello!"
7. User undo → back to "Hello!", selection cleared, cursor = 6.
   (Actually: undo of composite restores the deleted text and removes the inserted;
   cursor ends at wherever the LAST sub-command's undo places it. For our composite,
   the undo iterates in reverse: undo(Insert) puts cursor at 0, then undo(Delete)
   puts cursor at 5. That's the "after undoing the deletion" position. Is that
   what we want? Marginal — different editors do it differently. Note it.)
8. User selects [0, 5), copies. clipboard = "Hello". buffer unchanged.
9. User moves cursor to 6, pastes. → InsertCommand(6, "Hello") → buffer = "Hello!Hello".
10. User saves → dirty = false.
11. User types "x" → dirty = true. Save-prompt behavior triggers on close, etc.
```

The walkthrough surfaces one soft spot: **cursor position after composite undo is a bit ill-defined**. We noted it. In an interview, saying:

> *"Composite undo leaves the cursor at the position implied by the last sub-command's undo. That's semantically fuzzy — a real editor might explicitly record 'undo cursor' and 'redo cursor' in each command. I'd add that if pressed."*

...is exactly the level of scrutiny an interviewer wants.

### A Second Walkthrough: Replace-All

```
1. Buffer = "foo bar foo baz foo".
2. User: replace_all("foo", "xyz").
3. Search finds [(0,3), (8,11), (16,19)].
4. We reverse to [(16,19), (8,11), (0,3)].
5. Composite command:
      Delete(16,19), Insert(16, "xyz"),
      Delete(8, 11),  Insert(8,  "xyz"),
      Delete(0, 3),   Insert(0,  "xyz")
6. Executed: buffer becomes "xyz bar xyz baz xyz". One undo step.
7. Undo → walks composite in reverse: Insert(0,"xyz").undo (removes it),
   Delete(0,3).undo (restores "foo"), then next pair, etc.
   Result: buffer back to "foo bar foo baz foo". Confirmed one undo restores all. ✓
```

Correct. Good.

---

## 16. Stage 15 — Anticipating Follow-Up Questions

Interviewers *always* stress-test the design. Here's what to expect and how to answer.

### Q: How would you support very large files (say, 100MB)?

The gap buffer holds everything in memory. For 100MB, that's fine on modern machines (100MB is nothing), but the O(distance) cursor move becomes noticeable.

Answers:
- Switch to a **piece table** — cursor moves are O(1); random access is O(log n) with a piece tree. VS Code does this.
- Or split into a **rope** — good for very large concatenations and edits.
- For truly enormous files (multi-GB logs), consider **memory-mapped files** with a windowed view — you don't load everything, just what's rendered.

### Q: How would you support collaborative editing?

This is a huge topic. The short answer:
- Every operation becomes an **operation** in the OT (Operational Transform) or CRDT sense.
- Concurrent operations must be *transformed* against each other so their final effect converges on all clients.
- Local undo becomes tricky — you can't simply reverse if someone else has since made changes on top of yours.
- Real systems: Google Docs uses OT; many modern collab editors use CRDTs.

For interview scope: *"Beyond LLD; would need OT or CRDTs, and touches distributed systems territory."*

### Q: How would you support multi-cursor?

Change the Editor to hold `list[Cursor]` and `list[Selection]`. Every insert operation applies at each cursor position — must go **right to left** to keep indices valid. Every command records positions for all cursors.

Not that hard structurally — the code just needs to iterate cursors. The design already admits this because Cursor is a class and not just `int` on Editor.

### Q: What about undo grouping? Typing "hello" is 5 InsertCommands — but users expect one undo to remove the whole word.

Right. The fix: **coalesce** consecutive character insertions when they're contiguous and quick (say, no cursor movement between them, within a time threshold).

Implementation: on `record`, if the incoming command is an `InsertCommand`, look at the top of the undo stack. If the top is also an `InsertCommand` and its end equals the new one's start (and it happened recently), merge them. Effectively, replace the top with a single command whose text is the concatenation.

Mention this. Don't implement in a 45-min interview.

### Q: How would you add syntax highlighting?

Syntax highlighting is a separate concern layered on top:
- A **highlighter** subscribes to `text_changed`.
- On each change, it re-tokenizes the affected region (not the whole file — an incremental parser like tree-sitter does this).
- Each token's range is stored as a formatting-span-like structure (a different set from user-applied formatting).
- The view queries both sets when rendering.

Nice: syntax highlighting is *just another observer of the model*. Doesn't require touching the Editor at all.

### Q: Auto-save?

An observer on `dirty_changed(True)` starts a debounced timer. When it fires, call `editor.save()`. No editor-side changes needed.

Notice the pattern: **most extensions are new observers, not new methods on the Editor.** That's a healthy design.

### Q: How would you test this?

- **Buffer tests**: insert/delete correctness, edge cases (empty buffer, end-of-buffer).
- **Command tests**: execute-then-undo returns to original state (property-based testing shines here).
- **Editor integration tests**: sequences of user operations, verify final state.
- **Regression tests**: for every bug found, add a test that would have caught it.

### Q: What about Unicode?

We use Python strings, which are Unicode-aware, but indexes are code-point-based, not grapheme-based. "👨‍👩‍👧" is one visible glyph but multiple code points. A real editor uses a grapheme-cluster-aware cursor. Extension point.

### Q: Undo across sessions? Persistent undo?

Serialize the command stack alongside the document (VS Code and Emacs both do this). Each command must be serializable — since our commands hold only primitives (positions, text), they already are.

### Q: What if the buffer runs out of memory?

Real editors handle "out of memory" via file-backed swap or an error prompt. Beyond LLD scope; mention only.

---

## 17. Final Reflection — What This Problem Teaches

### Lesson 1: The Data Structure Choice IS the Design

We spent an entire stage on the buffer choice, and rightly so. Every operation's complexity flows from it. If you'd picked a naive Python string, your editor works fine for tiny toy inputs and collapses at any real scale. The design of the surrounding classes is easy compared to picking the right container underneath.

In interview: **never skip the data structure justification.** Even a two-line "considered X, Y, Z — chose Y because..." is worth ten lines of code.

### Lesson 2: The Command Pattern Is the Spine

Everything mutating in this system goes through a Command. Not because "commands are cool," but because *the requirement of undo/redo forces it*. Once you accept that, everything downstream falls into place: replace-all as a composite, cut as delete+clipboard-write, formatting as its own command class.

The Command pattern is one of the highest-leverage patterns you can know for LLD. Text editors, transaction systems, task queues, GUI frameworks, macros — anywhere you need to represent an action as data.

### Lesson 3: Observer Decouples Model from View

We designed the editor so a UI could attach without the editor knowing. Same for auto-save, syntax highlighting, status bars, dirty indicators — all just observers. This is what makes the design *extensible*. Add a feature by adding a subscriber; don't modify the model.

### Lesson 4: YAGNI, Continued

Look at what we deliberately didn't build:

- Multi-cursor.
- Regex search.
- Collaborative editing.
- Syntax highlighting.
- Auto-save.
- Undo grouping.
- Session-persistent undo.
- Unicode grapheme-aware cursor.

Each of these is a real feature. Each was scoped out or mentioned as an extension. The design would collapse under its own weight if we'd built all of them. **The discipline of "not now" is exactly what senior engineers exercise.**

### Lesson 5: Every Layer Has One Job

- `GapBuffer` — store text and support efficient edits. Doesn't know about cursors.
- `Cursor` — a position. Doesn't know about the buffer.
- `Command` — a reversible operation. Doesn't know about the history.
- `History` — track stacks. Doesn't know what commands do.
- `Editor` — orchestrate. Doesn't do any actual mutation itself.
- `EventBus` — pub/sub. Doesn't know about the domain.

Each of those "doesn't know" is a **deliberate boundary**. Those boundaries are where extensibility lives. Break them for convenience and you lose the design's structure.

### Lesson 6: The Composite Pattern Emerges Naturally

We didn't set out to use the Composite pattern. But when "typing with a selection" or "replace all" needed to be one undo step, `CompositeCommand` fell out of the requirements. **The pattern didn't drive the design; the design produced the pattern.** That's the right direction.

### Lesson 7: Talk Out Loud

We flagged tradeoffs everywhere: buffer choice, cursor storage, replace-all ordering, undo cursor semantics, span invariants, unicode. Every acknowledgment of a tradeoff is worth more than pretending you got it perfect. Interviewers reward candidates who see the messiness of the real problem; they penalize candidates who paper over it.

---

## 18. Practice Questions

Work through these before reading the solutions. They're designed to test whether you've internalized the *reasoning*, not just remembered the code.

---

### Question 1 (Warm-up)

Suppose we removed the requirement for undo/redo. Which classes could we simplify or eliminate? Which decisions would we revisit?

<details>
<summary>Solution</summary>

- **Eliminate:** `Command` hierarchy, `CompositeCommand`, `History`.
- **Simplify:** The `Editor._run` choke point collapses — mutations become direct calls to the buffer. `insert` calls `buffer.insert`; `backspace` calls `buffer.delete`; etc.
- **Revisit:** The choice of gap buffer stands (it's about performance, not undo). But we'd no longer need `DeleteCommand` to *return* the deleted text — the reason we captured it was for undo restoration.
- **Impact on `replace_all`:** No longer needs to be a composite. Can just loop and mutate directly.

The Command pattern imposes real complexity. Without undo, we don't pay it. This is a good reminder: **patterns aren't free — apply them when a requirement demands them.**
</details>

---

### Question 2 (Design tradeoff)

We chose the **gap buffer**. Suppose the interviewer says: "Actually, undo history must survive across editor restarts, and I want to be able to inspect the state of the document at any historical point." Does this change your buffer choice? Why?

<details>
<summary>Solution</summary>

Yes. This is a strong hint toward a **piece table**.

Why: a piece table is naturally immutable at the piece level. When you edit, you don't overwrite existing content — you add new pieces to the "add buffer" and rearrange the piece list. This means:

1. **Historical snapshots are free.** The old piece list, if retained, still refers to unchanged buffer contents. Reconstruct any prior state by remembering the piece list at that point.
2. **Serialization of history is easier.** Commands hold positions and small text fragments — plus you can serialize the underlying add-buffer once.

Gap buffer would also work, but you'd need to snapshot the whole buffer at checkpoints (memory-heavy) or replay commands from a persisted stack against a persisted starting document (correct but slow to load).

The design pivot: swap `GapBuffer` for `PieceTable`. The Editor and its interfaces are unchanged — that's the payoff of layering.
</details>

---

### Question 3 (Extend the design)

Add **multi-cursor** support. Sketch the changes to `Editor`, `Cursor`, and `InsertCommand`. What edge cases arise?

<details>
<summary>Solution</summary>

**Editor changes:**

```python
self._cursors: list[Cursor] = [Cursor(0)]     # replaces single _cursor
self._selections: list[Selection] = [Selection(0, 0)]  # parallel list
```

Every operation that referenced `self._cursor` now iterates the list. `move_cursor(index, pos)` targets a specific cursor.

**InsertCommand changes:**

A "user inserts 'x' with 3 cursors" is now one *user* action but three insertions. The insertion order matters — do them right-to-left so earlier positions don't shift.

```python
class MultiInsertCommand(Command):
    def __init__(self, positions: list[int], text: str):
        # Sort in reverse so leftward positions aren't invalidated.
        self.positions = sorted(positions, reverse=True)
        self.text = text

    def execute(self, editor):
        for pos in self.positions:
            editor._buffer.insert(pos, self.text)
        # Cursors: each shifts by len(text) if it was at or after an inserted position.
        ...

    def undo(self, editor):
        # Delete inserted texts, left-to-right (deleting reverse-order would also work).
        for pos in reversed(self.positions):
            editor._buffer.delete(pos, pos + len(self.text))
```

**Edge cases:**

- **Overlapping cursors.** Two cursors at the same position should be deduplicated or treated as one — otherwise a single character gets typed twice at that position.
- **Cursor within another cursor's selection.** Semantics get ambiguous — most editors resolve by collapsing overlapping selections into one.
- **Undo of a multi-op is one step.** Already handled by the single command wrapping the multi.

The key insight: multi-cursor doesn't change the *architecture*; it just plumbs a list where there was one. The Cursor abstraction we designed makes this natural.
</details>

---

### Question 4 (Bug hunting)

There's a subtle bug in this snippet from our `replace_all`:

```python
matches = self._search.find(self.text, query)
# ... build composite command using matches ...
self._run(CompositeCommand(subcommands))
```

Under what conditions would this misbehave? How would you fix it?

<details>
<summary>Solution</summary>

**Bug:** If `replacement` *contains* `query` as a substring, our command sequence is still fine (we process right-to-left so already-replaced text isn't scanned). But if we later re-execute (redo), matches are recomputed... except we don't recompute — the command captured the exact positions and edits at execute time. That's actually safe.

The **real** subtle bug: `matches` is computed once, then we build the composite. If some caller mutates `self.text` between the `find` call and the `_run` call (unlikely here, but possible in multi-threaded scenarios), the positions become stale.

**Fix for the general case:**
- Snapshot the text before finding, and validate no changes have occurred (in a single-threaded model, this is trivially true).
- Or make the whole replace-all atomic under a lock in a multi-threaded editor.

A more common subtle bug: **empty query**. If `query == ""`, `str.find` returns 0 forever. Our `LiteralSearch.find_all` guards against this with `if not query: return []`. Verify that guard exists.

**Another subtle bug:** what if `query == replacement`? We'd do a no-op wrapped in a composite of delete-plus-insert per match — technically correct but wasteful, and dirty flag gets set for no visible change. Optimization: return early if `query == replacement`.

Interviewer-pleaser: mentioning "empty query causes infinite loop" is a classic gotcha to know.
</details>

---

### Question 5 (Design a new feature)

Design a "**Go to Line**" feature. `go_to_line(n)` moves the cursor to the start of the nth line (1-indexed). What class does this method live on? What data structure would you use to make this O(log n) rather than O(document size)?

<details>
<summary>Solution</summary>

**Where does it live?** On the Editor, as a small public method. It uses the buffer's contents but doesn't mutate them — no command needed.

**Naive implementation:** scan the text, count newlines, return the position after the (n-1)th newline. O(document size). Fine for MB documents; sluggish for 100MB logs.

**Faster:** maintain a **line index** — a data structure that maps line numbers to byte offsets.

Options:
- **Precomputed array of newline positions.** Fast lookup (`line_starts[n]` is O(1)). But every insert/delete requires updating this array, and inserts near the front are O(newlines-after-position).
- **Sorted tree of newline positions** (e.g., a `SortedList` or Fenwick tree). Insertions O(log n). Line-to-position lookup O(1) after finding.
- **Piece table with per-piece line count.** VS Code's approach. Very fast for both edits and lookups.

**Interaction with commands:** The line index is a *derived cache*. It should be maintained by the same code that mutates the buffer — cleanest to update it inside `TextBuffer.insert` and `TextBuffer.delete`. That means either:
- The buffer knows about lines (couples two concerns).
- The buffer exposes hooks/observers for edits, and the line index subscribes.

I'd choose the observer approach: the buffer emits low-level edit events; a `LineIndex` subscribes and stays in sync. That preserves the buffer's single responsibility.

Notice: this is another observer! Same pattern as the view. **Once you set up event emission, everything derived from the model becomes a subscriber.** This is the design shape scaling as more features arrive.
</details>

---

### Question 6 (Deep tradeoff)

We used a **set of string labels** for format attributes (`{"bold", "italic"}`). What are the limitations of this? How would you extend it to support:
- Colors (e.g., font color = `#FF0000`)
- Multiple simultaneous colors on the same range (probably impossible — but how would you decide?)
- Named styles (`heading1`, `code`) that carry compound formatting?

<details>
<summary>Solution</summary>

**Current limitation:** attributes are just strings — they can't carry values. `"bold"` is on or off; there's no data to associate.

**Extension 1: Colors.**

Change `attrs` from `set[str]` to `dict[str, Any]`. Now `attrs = {"bold": True, "color": "#FF0000"}` works. Note the semantic shift: a "bold" attribute is boolean-valued; a "color" attribute has a value. You need type-safety at some level (e.g., a `FormatAttribute` schema).

**Extension 2: Simultaneous colors.**

Can you be both red and blue at the same position? No — a character has one color at a time. So `color` is a **single-valued** attribute; setting a new color on a range *overwrites* the old. That's different from `bold`, which is idempotent.

This means the model has to know each attribute's *kind*:
- **Toggle attributes** (bold, italic, underline) — set-like semantics; multiple ranges can add or remove.
- **Single-valued attributes** (color, font, font size) — the most recent (or highest z-order) wins.

You'd introduce something like:

```python
class AttributeSpec:
    def __init__(self, name: str, kind: str):  # kind in {"toggle", "single_value"}
        ...
```

When applying, the FormattingSpans logic checks the spec and behaves accordingly.

**Extension 3: Named styles.**

A named style like `heading1` is really a *bundle* of attributes: `{font_size: 24, bold: True, color: "#000000"}`. You could:

- **Expand at apply time:** applying `heading1` inserts multiple spans (one per constituent). Loses the "this is a heading1" semantic when reading back.
- **Store as a reference:** the span carries `style = "heading1"`, and a `StyleRegistry` maps names to concrete attributes at render time. This preserves the semantic, allows themes ("change what heading1 looks like globally"), and is closer to how Word / Google Docs work.

Approach 2 is more sophisticated but far more powerful. It also introduces new questions: what if you override just one attribute of a named style? (Answer: store both — the style name and a delta.) You've now stumbled into a small but real inheritance model for formatting.

**The lesson:** what looked like a small extension (add color) actually requires reworking the attribute type system. This is common. Push back gently in interview: *"Are we treating attributes uniformly, or do some like color have single-value semantics? That changes the model."*
</details>

---

### Question 7 (End-to-end)

Sketch the operations needed to implement **"undo the last N operations as one step"** — a batch undo, e.g., "undo the last 5 keystrokes together." What changes in `Editor` and `History`?

<details>
<summary>Solution</summary>

**Semantics:** the user wants to say "undo N times, treating it as one redo step."

**In History:** we don't lose the individual commands — we just batch them.

**Approach 1: Batch on the fly.**

```python
def undo_batch(self, editor, n: int) -> None:
    batched: list[Command] = []
    for _ in range(n):
        if not self._history.can_undo():
            break
        cmd = self._history.pop_undo()
        cmd.undo(editor)
        batched.append(cmd)
    if batched:
        # Wrap them (in original execute order) into a composite for redo.
        composite = CompositeCommand(list(reversed(batched)))
        self._history.push_redo(composite)
```

Note the reversal: we undid in reverse order; the composite should redo in original order.

**Approach 2: Explicit transaction markers.**

Add `Editor.begin_transaction()` and `Editor.end_transaction()`. Inside, all commands are collected into a pending composite. On end, one composite is pushed to the undo stack. This is more powerful — the user gets to decide grouping ahead of time.

**Which is better?** Depends on the use case. Batch-undo of the last N is more like a UI convenience. Transactions are more like a programmatic contract. Real editors often use auto-coalescing (Q on typing "hello" as one undo) rather than either explicit approach — because users don't want to think about grouping.

**The takeaway:** the design supports these extensions because commands are first-class objects that can be reordered, batched, and rewrapped. Try doing this with a "mutate directly" editor — you'd be re-architecting.
</details>

---

## Key Takeaways

- **Data structure first.** In text editors, the buffer implementation determines the whole system's performance ceiling. Justify your choice out loud.
- **Command pattern is unavoidable when undo/redo is required.** Every mutation → a Command. Every user action → an execute call. Every reversal → an undo call.
- **Composite commands emerge from multi-step user actions.** Typing over a selection = delete + insert = one composite. Replace-all = many pairs = one composite. This lets one undo step reverse multi-step operations.
- **Observer decouples model from view — and from every other derived cache.** Line index, syntax highlighter, autosave, dirty indicator — all subscribers.
- **Layer the design.** Buffer knows text; cursor knows position; command knows how to mutate; history knows stacks; editor orchestrates. Break these boundaries and extensions become invasive.
- **YAGNI, aggressively.** Multi-cursor, collaboration, syntax highlighting, undo grouping — all extensions, none in v1. Cost of adding later ≈ cost of adding now, if the design is layered right.
- **Talk about tradeoffs.** Gap buffer vs piece table, attribute spans vs per-char attributes, undo cursor semantics, replace-all direction — every one is a spoken tradeoff, not a silent choice.

---

## What's Next

You've now internalized four LLD deep dives — Parking Lot (relationships), Elevator (state machines), Library (policy), Text Editor (operations-on-data). Notice again what stays the same: the discipline of clarifying, the entity filtering, the alternative-weighing, the mental walkthrough, the anticipation of follow-ups.

The framework transfers. Every future LLD problem — Vending Machine, Splitwise, Ride-Hailing, Chess, Snake and Ladder, ATM — is the same set of thinking moves applied to a new domain.

The specific designs are notes; the framework is the melody.

---

*This content is part of **Codeverra** — a platform for learning coding, data science, DSA, and AI from scratch. Explore more: https://codeverra.com*
