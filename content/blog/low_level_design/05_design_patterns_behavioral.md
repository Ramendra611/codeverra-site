---
title: "Design Patterns, Part 3: Behavioral Patterns"
description: "Behavioral design patterns: how objects communicate, divide responsibility, and coordinate behavior in complex systems."

date: 2026-09-08
lastmod: 2026-09-08
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - lld
  - design-patterns
  - python

cover:
  image: "/images/LLD - 5.png"
  alt: "Behavioral Design Patterns"
  caption: "Design Patterns, Part 3: Behavioral Patterns"
  relative: true
  hidden: false
---

# Design Patterns — Part 3: Behavioral Patterns

> **Who this is for:** Anyone who has worked through Creational and Structural patterns and is ready for the final, largest, and arguably most important family — the patterns that govern how objects *communicate* and *divide responsibility*.

---

## Table of Contents

1. [Behavioral Patterns — What and Why](#1-behavioral-patterns)
2. [Chain of Responsibility](#2-chain-of-responsibility)
3. [Command](#3-command)
4. [Interpreter](#4-interpreter)
5. [Iterator](#5-iterator)
6. [Mediator](#6-mediator)
7. [Memento](#7-memento)
8. [Observer](#8-observer)
9. [State](#9-state)
10. [Strategy](#10-strategy)
11. [Template Method](#11-template-method)
12. [Visitor](#12-visitor)
13. [Summary of Behavioral Patterns](#13-summary)
14. [Practice Exercises with Solutions](#14-practice-exercises)
15. [Self-Assessment Test](#15-self-assessment-test)
16. [Final Words — All 23 Patterns at a Glance](#16-final-words)

---

## 1. Behavioral Patterns

Creational patterns answered *"how do we make objects?"*
Structural patterns answered *"how do we glue objects together?"*
Behavioral patterns answer: **"how do objects *talk to each other*, and *who is responsible for what*?"**

In any system of more than a few classes, objects collaborate constantly. Poor collaboration shows up as:

- Tangled, bidirectional references (class A knows about B, which knows about C, which calls back into A).
- Long `if/elif` chains selecting behavior based on state or type.
- Duplicate algorithms that differ only in small steps.
- Tight coupling between "who triggers what" and "what gets done."

Behavioral patterns give us refined vocabulary for these collaborations:

- **Chain of Responsibility** — pass a request along a chain of handlers until one handles it.
- **Command** — encapsulate a request as an object (so you can queue, log, undo, or schedule it).
- **Interpreter** — define a grammar and evaluate sentences in it.
- **Iterator** — access elements of a collection sequentially without exposing its internals.
- **Mediator** — let objects communicate through a central mediator instead of directly.
- **Memento** — capture an object's internal state so it can be restored later.
- **Observer** — notify interested parties when something changes (pub/sub).
- **State** — change an object's behavior when its internal state changes.
- **Strategy** — make an algorithm interchangeable with others of the same kind.
- **Template Method** — define an algorithm's skeleton; let subclasses fill in steps.
- **Visitor** — add new operations to an object structure without modifying the objects.

Eleven patterns. Each is a specific answer to a specific collaboration pain. Let's dive in.

---

## 2. Chain of Responsibility

### The Pain

Imagine processing a customer support ticket. It needs to pass through:

1. **Auto-responder** — can it handle common FAQs?
2. **Level 1 support** — basic troubleshooting.
3. **Level 2 support** — deeper technical issues.
4. **Engineering** — bugs requiring code changes.

Naive implementation:

```python
def handle_ticket(ticket):
    if can_auto_respond(ticket):
        auto_respond(ticket)
    elif can_L1_handle(ticket):
        L1_handle(ticket)
    elif can_L2_handle(ticket):
        L2_handle(ticket)
    else:
        escalate_to_engineering(ticket)
```

Problems:
- Adding a new handler (say, a chatbot between auto-responder and L1) requires modifying this function.
- The order of handlers is hardcoded.
- The function "knows" about all handlers — a central bottleneck.
- Testing requires mocking the entire chain.

### Intent

> Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.

### Analogy

Think of a **customer complaint at a retail store**. You start with the cashier. Can't help? Shift lead. Can't help? Manager. Still stuck? Regional manager. Each person either resolves it or passes it up. You (the complainer) don't need to know the org chart — you just hand your complaint to the next person in the chain.

Or: **air traffic control handoffs**. An aircraft gets passed from ground control → tower → departure → center → approach → tower → ground. Each controller handles their segment or hands off.

### Structure

- **Handler** — interface declaring `handle(request)` and optionally a link to the next handler.
- **ConcreteHandlers** — each decides whether to handle or forward.
- **Client** — hands the request to the first handler; doesn't know the chain's length.

### Python Implementation

```python
from abc import ABC, abstractmethod

class SupportHandler(ABC):
    def __init__(self):
        self._next = None

    def set_next(self, handler):
        self._next = handler
        return handler   # Allow chaining: h1.set_next(h2).set_next(h3)

    def handle(self, ticket):
        if self._next:
            return self._next.handle(ticket)
        print(f"No handler for ticket: {ticket}")


class AutoResponder(SupportHandler):
    FAQ = {"reset password", "pricing", "hours"}

    def handle(self, ticket):
        if ticket["issue"].lower() in self.FAQ:
            print(f"Auto-responder handled: {ticket['issue']}")
        else:
            super().handle(ticket)


class L1Support(SupportHandler):
    def handle(self, ticket):
        if ticket["priority"] <= 2:
            print(f"L1 handled: {ticket['issue']}")
        else:
            super().handle(ticket)


class L2Support(SupportHandler):
    def handle(self, ticket):
        if ticket["priority"] <= 4:
            print(f"L2 handled: {ticket['issue']}")
        else:
            super().handle(ticket)


class Engineering(SupportHandler):
    def handle(self, ticket):
        print(f"Engineering escalated: {ticket['issue']}")


# Build the chain
auto = AutoResponder()
l1 = L1Support()
l2 = L2Support()
eng = Engineering()

auto.set_next(l1).set_next(l2).set_next(eng)

# Send requests
auto.handle({"issue": "reset password", "priority": 1})
auto.handle({"issue": "login broken", "priority": 2})
auto.handle({"issue": "data corruption bug", "priority": 5})
```

Output:
```
Auto-responder handled: reset password
L1 handled: login broken
Engineering escalated: data corruption bug
```

Key property: the client just calls `auto.handle(ticket)`. The client doesn't know what the chain looks like or who will handle it. Reordering, inserting, or removing handlers changes nothing for the client.

### Realistic Use Cases

- **Web middleware** (authentication → authorization → logging → rate limiting → route handler).
- **Event handling in UI frameworks** — events bubble up the widget tree; each widget can handle or forward.
- **Logging frameworks** — handlers of different severities in a chain.
- **Approval workflows** — expense approval (manager → director → VP → CFO).
- **Validation pipelines** — each validator checks its concern and passes the request on.

### Tradeoffs

**Pros:**
- Decouples sender from receivers — sender doesn't know who handles what.
- OCP-friendly — add new handlers without touching existing ones.
- Dynamic — you can reconfigure the chain at runtime.

**Cons:**
- No guarantee any handler handles the request — it may fall off the end.
- Debugging can be tricky — who handled this? Why didn't handler X catch it?
- Performance overhead if the chain is long and the winning handler is near the end.

### Related Patterns

- **Decorator** — also chains, but every decorator handles the request; in CoR, exactly one handles (typically).
- **Command** — often used together; Commands can be passed through a CoR.
- **Composite** — handlers themselves may form a tree structure.

---

## 3. Command

### The Pain

You're building a text editor. A user can `cut`, `copy`, `paste`, `bold`, `italic`, etc. Naively, every button calls the corresponding method directly:

```python
cut_button.on_click = lambda: editor.cut()
paste_button.on_click = lambda: editor.paste()
```

Now the product team wants:
- **Undo** (with history).
- **Redo**.
- **Keyboard shortcut customization** (user remaps Ctrl+X to "bold").
- **Macro recording** — replay a sequence of actions.
- **Queued operations** — run this later / in background.

Each of these requires treating operations as **first-class things** you can store, inspect, reverse, and re-execute. A direct method call is not a thing — it's a transient event. You need to turn *actions* into *objects*.

### Intent

> Encapsulate a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations.

### Analogy

A **restaurant order ticket**. When you order at a restaurant, the waiter writes your order on a ticket. That ticket is a physical object. It can be passed to the kitchen, queued, logged, re-read, retried, even canceled. The waiter isn't directly yelling "make a pizza!" to the chef — there's an intermediating object (the ticket) that carries the request.

Or: a **TV remote**. Each button holds a command. The remote doesn't know how the TV changes channels; it just issues the "channel up" command. The TV executes it.

### Structure

- **Command** — interface with `execute()` (and optionally `undo()`).
- **ConcreteCommand** — binds a specific action to a receiver, with any needed parameters stored.
- **Receiver** — the object that actually does the work.
- **Invoker** — holds commands and triggers `execute()` (e.g., a button, a queue, a script).
- **Client** — creates ConcreteCommands and assigns them to Invokers.

### Python Implementation

```python
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self): pass

    @abstractmethod
    def undo(self): pass


class Editor:
    def __init__(self):
        self.text = ""

    def write(self, s):
        self.text += s

    def delete_last(self, n):
        self.text = self.text[:-n]


class WriteCommand(Command):
    def __init__(self, editor: Editor, text: str):
        self.editor = editor
        self.text = text

    def execute(self):
        self.editor.write(self.text)

    def undo(self):
        self.editor.delete_last(len(self.text))


class EditorApp:
    def __init__(self):
        self.editor = Editor()
        self.history = []
        self.redo_stack = []

    def run(self, command: Command):
        command.execute()
        self.history.append(command)
        self.redo_stack.clear()   # New action invalidates redo

    def undo(self):
        if not self.history: return
        cmd = self.history.pop()
        cmd.undo()
        self.redo_stack.append(cmd)

    def redo(self):
        if not self.redo_stack: return
        cmd = self.redo_stack.pop()
        cmd.execute()
        self.history.append(cmd)


# Usage
app = EditorApp()
app.run(WriteCommand(app.editor, "Hello "))
app.run(WriteCommand(app.editor, "World"))
print(app.editor.text)   # Hello World

app.undo()
print(app.editor.text)   # Hello

app.undo()
print(app.editor.text)   # (empty)

app.redo()
print(app.editor.text)   # Hello
```

Each user action becomes a Command object. The app keeps a history list. Undo pops the last command and calls `undo()`. Redo pushes it back.

### Realistic Use Cases

- **Undo/redo systems** (editors, IDEs, graphic tools).
- **Transaction systems** — each transaction is a command, replayable, rollbackable.
- **Task queues** (Celery, Sidekiq) — jobs are commands serialized and executed asynchronously.
- **Macro recording** — record a sequence of commands, replay later.
- **Smart home automation** — "when I say 'movie night,' run these 5 commands."
- **GUI frameworks** — menu items, buttons, and keyboard shortcuts all bound to Command objects.

### Tradeoffs

**Pros:**
- Undo/redo becomes trivial (well-designed commands are reversible).
- Actions become storable, queueable, schedulable, loggable.
- Decouples invoker (button) from receiver (business logic).
- Macros/compositions of commands = composite Commands.

**Cons:**
- More classes — a command per action. Can feel heavy for simple apps.
- Undo logic is sometimes genuinely hard (think: undoing a DB DELETE that also cascaded).
- Memory usage — history lists can grow large; often need pruning.

### Related Patterns

- **Composite** — MacroCommand is a Composite of Commands.
- **Memento** — often used inside Command to save state for undo.
- **Chain of Responsibility** — Commands can be passed along CoR handlers.

---

## 4. Interpreter

### The Pain

You have a domain-specific language — maybe a **filter expression** like `"age > 30 AND country == 'IN'"`, or a **math formula**, or a **search query syntax**. You need to *evaluate* these expressions repeatedly for different inputs.

Naive approach: write a huge parser + evaluator tangled with `if/elif` on every token. The code becomes an unreadable mess, and every new grammar rule requires invasive changes.

### Intent

> Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.

The idea: model each grammar rule as a class. Build an expression tree (AST) of these classes. Evaluate recursively.

### Analogy

Think of **sentence diagramming in English class**. A sentence like *"The cat sat on the mat"* is broken down: `<sentence> = <subject> <verb> <prepositional_phrase>`. Each piece is a rule; together they form a tree. To "understand" the sentence, you interpret each piece.

The Interpreter pattern encodes such grammar-as-classes literally.

### Structure

- **AbstractExpression** — interface with `interpret(context)`.
- **TerminalExpression** — leaf; represents a literal or variable.
- **NonterminalExpression** — represents grammar rules composed of other expressions (And, Or, Greater, etc.).
- **Context** — holds the data against which expressions are evaluated.

### Python Implementation — A Tiny Boolean Filter Language

Let's build interpreter for: `(age > 18) AND (country == "IN")`

The single most important idea in this pattern: **each production rule of the grammar becomes a class.** A grammar for our filter language might read:

```
expression := variable | literal | comparison | conjunction
comparison := expression ">" expression | expression "==" expression
conjunction := expression "AND" expression
```

Map that directly onto classes. **Terminals** (`Variable`, `Literal`) are the *leaves* of the tree — they resolve to a value with no further sub-expressions. **Non-terminals** (`GreaterThan`, `Equals`, `And`) are the *internal nodes* — they combine sub-expressions and recurse into them. Every class implements the same `interpret(context)` method, so the whole tree evaluates by uniform recursion (this is Composite quietly doing the structural work underneath Interpreter).

```python
from abc import ABC, abstractmethod

class Expression(ABC):
    # The single operation every grammar element must support. Note interpret()
    # takes the `context` (the data we're evaluating against) — the SAME tree is
    # reused across many contexts, which is the payoff of building it once.
    @abstractmethod
    def interpret(self, context: dict): pass


# Terminals — leaves of the AST. They bottom out the recursion: no children.
class Variable(Expression):
    # Terminal: looks its name up in the context. The "age" in (age > 18).
    def __init__(self, name):
        self.name = name
    def interpret(self, context):
        return context[self.name]


class Literal(Expression):
    # Terminal: a constant value baked into the rule. The 18 in (age > 18).
    def __init__(self, value):
        self.value = value
    def interpret(self, context):
        return self.value


# Nonterminals — internal nodes. Each holds sub-expressions and recurses.
class GreaterThan(Expression):
    # Nonterminal for the ">" production. It doesn't know if left/right are
    # variables, literals, or whole sub-trees — it just calls interpret() on
    # them and compares. That uniformity is what makes the grammar composable.
    def __init__(self, left: Expression, right: Expression):
        self.left = left
        self.right = right
    def interpret(self, ctx):
        return self.left.interpret(ctx) > self.right.interpret(ctx)


class Equals(Expression):
    # Nonterminal for the "==" production — same recursive shape as GreaterThan.
    def __init__(self, left, right):
        self.left = left
        self.right = right
    def interpret(self, ctx):
        return self.left.interpret(ctx) == self.right.interpret(ctx)


class And(Expression):
    # Nonterminal for "AND" — combines two boolean sub-expressions. Because each
    # side is itself an Expression, And can sit atop arbitrarily deep trees.
    def __init__(self, left, right):
        self.left = left
        self.right = right
    def interpret(self, ctx):
        return self.left.interpret(ctx) and self.right.interpret(ctx)


# Build: (age > 18) AND (country == "IN")
# This nested construction IS the abstract syntax tree (AST). The shape of the
# object graph mirrors the shape of the expression exactly.
expr = And(
    GreaterThan(Variable("age"), Literal(18)),
    Equals(Variable("country"), Literal("IN"))
)

# Evaluate for different contexts
print(expr.interpret({"age": 25, "country": "IN"}))   # True
print(expr.interpret({"age": 15, "country": "IN"}))   # False
print(expr.interpret({"age": 40, "country": "US"}))   # False
```

Each grammar rule is a small class. The expression tree is built once and evaluated many times for different data contexts.

### Realistic Use Cases

- **Rule engines** — business rules expressed as parse trees.
- **SQL query planners** — SQL statements become expression trees internally.
- **Regular expression engines** — a regex is compiled into an expression tree, interpreted against strings.
- **Template engines** — parse templates into trees of nodes (text, variables, loops), interpret against data.
- **Scripting languages embedded in applications** (e.g., formula cells in spreadsheets).

### Tradeoffs

**Pros:**
- Extending the grammar is easy — one new class per rule.
- Reusability — the same AST can be evaluated many times, cached, optimized.
- Clean mapping between grammar and code structure.

**Cons:**
- Grammars of even moderate size balloon into many classes.
- Performance — pure interpretation is slow compared to compiled code. Often, real systems use Interpreter for prototyping then compile to bytecode/native.
- Parsing (turning text into an expression tree) is a separate problem; Interpreter only addresses evaluation of an already-built tree.

### Python-Specific Notes

Python's `ast` module and `eval()` can sometimes replace Interpreter entirely for simple cases — but at the cost of security (eval runs arbitrary code). Libraries like `lark`, `pyparsing`, and `sympy` often give you parser + interpreter functionality far beyond what you'd hand-roll.

Interpreter is the least-used GoF pattern in modern Python code — but understanding it helps you read and build grammar-driven systems.

### Related Patterns

- **Composite** — the AST is a Composite tree.
- **Visitor** — often used to traverse the AST and perform operations like type-checking, optimization, or compilation.
- **Iterator** — used to traverse AST nodes.

---

## 5. Iterator

### The Pain

You have various collections — a list, a tree, a graph, a paginated API, a streaming file. You want to *traverse* each one. But each has its own internal structure.

If clients have to know the internal structure of every collection to iterate it — tree traversal algorithm for trees, cursor API for DB, batch pagination for APIs — your code is a mess.

You need a **uniform way to step through elements**, regardless of what's inside.

### Intent

> Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

### Analogy

A **book**. You read page 1, then page 2, then page 3. You don't need to know whether pages are printed with offset lithography, stored in an ebook's EPUB file, or rendered from a PDF. You just `turn_page()`. The iterator (your thumb, or the "next page" button) abstracts the traversal.

Or: a **TV remote's channel up/down button**. The TV has hundreds of channels stored internally; you don't care how. You press "up," it gives you the next one.

### Structure

- **Iterator** — interface with `__next__` and `__iter__` in Python (or `hasNext()` / `next()` in other languages).
- **ConcreteIterator** — implementation that traverses a specific collection.
- **Aggregate** — the collection that returns an Iterator.

### Python Implementation

Python has **first-class built-in iterator support**. Any object implementing `__iter__` (returning self or another iterator) and `__next__` is iterable.

```python
class TreeNode:
    def __init__(self, value, children=None):
        self.value = value
        self.children = children or []


class PreorderIterator:
    def __init__(self, root: TreeNode):
        self.stack = [root]

    def __iter__(self):
        return self

    def __next__(self):
        if not self.stack:
            raise StopIteration
        node = self.stack.pop()
        # Push children in reverse so leftmost is processed first
        self.stack.extend(reversed(node.children))
        return node.value


class Tree:
    def __init__(self, root):
        self.root = root

    def __iter__(self):
        return PreorderIterator(self.root)


tree = Tree(TreeNode("A", [
    TreeNode("B", [TreeNode("D"), TreeNode("E")]),
    TreeNode("C", [TreeNode("F")]),
]))

for v in tree:
    print(v, end=" ")   # A B D E C F
```

The client does `for v in tree` — no idea whether the tree is stored flat, recursively, on disk, or streamed.

### Generator Functions — Python's Iterator Superpower

Python's `yield` keyword makes writing iterators dramatically simpler:

```python
def preorder(node):
    yield node.value
    for child in node.children:
        yield from preorder(child)


tree_root = TreeNode("A", [
    TreeNode("B", [TreeNode("D"), TreeNode("E")]),
    TreeNode("C", [TreeNode("F")]),
])

for v in preorder(tree_root):
    print(v, end=" ")   # A B D E C F
```

Four lines. No iterator class. No state machine. `yield` handles everything. This is the Pythonic way to implement the Iterator pattern.

### External vs Internal Iteration

- **External** (what we've shown) — caller drives the iteration (`for x in ...`). Flexible: can skip, break, filter.
- **Internal** — collection controls iteration, client supplies a callback (`tree.for_each(lambda v: ...)`). Simpler for callers, less flexible.

Most Pythonic code uses external iteration via generators.

### Realistic Use Cases

- **Any collection-like class** you write.
- **Database cursor traversal** — don't load 10 million rows; iterate them.
- **Paginated API consumption** — each `next()` fetches the next page.
- **Streaming file processing** — iterate lines without loading the full file.
- **Lazy computation** — generators produce values on demand.

### Tradeoffs

**Pros:**
- Uniform API for traversal across many different collection types.
- Decouples collection implementation from traversal logic.
- Supports lazy evaluation — generate values only as needed.

**Cons:**
- Simple collections might not need a formal iterator — `for x in list` already works.
- Iteration state is stored in the iterator, so you can't rewind without re-creating.

### Python-Specific Notes

Iterator is so deeply woven into Python that you almost never implement it "classically." Whenever a class represents a collection, just define `__iter__` (usually as a generator method with `yield`) and you're done. The GoF's elaborate iterator class hierarchy collapses into a few `yield` statements.

### Related Patterns

- **Composite** — iterators often traverse Composite structures.
- **Factory Method** — aggregates often use a factory method to return their iterator (`__iter__`).
- **Visitor** — often combined with Iterator to process each element.

---

## 6. Mediator

### The Pain

Imagine a **chatroom** with 20 users. Naively, each user has direct references to all others — when Alice sends a message, her code notifies each of the other 19. Adding/removing users means updating references everywhere. Users know each other. Knowledge is scattered.

Or: a **complex UI form**. When the "country" dropdown changes, the "state" dropdown should repopulate, the "tax" field should recalculate, the "submit" button might enable/disable. If each widget directly calls methods on others, you get a web of references: country → state, country → tax, country → submit, state → tax, etc. A few widgets → *n²* references.

You need a **central coordinator** that absorbs peer-to-peer communication.

### Intent

> Define an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly.

### Analogy

An **air traffic control tower**. Planes don't coordinate with each other directly ("you land, I'll wait"). They talk to the tower. The tower coordinates — "Flight 101, cleared to land. Flight 202, hold." If planes talked to each other, chaos.

Or: a **project manager**. Developers don't directly task each other — the manager routes work, resolves conflicts, and communicates across the team. One central role mediates.

### Structure

- **Mediator** — interface for communication between colleagues.
- **ConcreteMediator** — knows the colleagues; routes messages.
- **Colleagues** — each knows only the mediator, not other colleagues.

### Python Implementation — A Chatroom

```python
class ChatroomMediator:
    def __init__(self):
        self._users = []

    def register(self, user):
        self._users.append(user)
        user.mediator = self

    def send(self, sender, message):
        for user in self._users:
            if user is not sender:
                user.receive(sender.name, message)


class User:
    def __init__(self, name):
        self.name = name
        self.mediator = None

    def send(self, message):
        print(f"[{self.name} sends] {message}")
        self.mediator.send(self, message)

    def receive(self, sender_name, message):
        print(f"  [{self.name} got from {sender_name}]: {message}")


chat = ChatroomMediator()
alice = User("Alice")
bob = User("Bob")
carol = User("Carol")

for user in (alice, bob, carol):
    chat.register(user)

alice.send("Hi everyone!")
bob.send("Hello Alice!")
```

Output:
```
[Alice sends] Hi everyone!
  [Bob got from Alice]: Hi everyone!
  [Carol got from Alice]: Hi everyone!
[Bob sends] Hello Alice!
  [Alice got from Bob]: Hello Alice!
  [Carol got from Bob]: Hello Alice!
```

Each `User` knows only about the mediator — not about other users. Adding a fourth user is one `register` call; no other user changes.

### Realistic Use Cases

- **UI frameworks** — a form with interdependent widgets, coordinated by a mediator.
- **Chatrooms and messaging systems** — users communicate via a server, not peer-to-peer.
- **Air traffic / traffic-light coordination** — central controller.
- **Complex business workflows** where multiple services must stay coordinated.

### Observer vs Mediator — A Classic Confusion

- **Observer** — a *one-to-many* notification from a subject to its observers. Observers are passive receivers.
- **Mediator** — a *many-to-many* coordination. Colleagues actively send messages through the mediator.

The cleanest way to feel the difference is to see what the *same chatroom scenario* would look like under Observer, then contrast it with the Mediator version above.

**If we modeled the chatroom with Observer**, each `User` would be a *subject* that other users *subscribe to*. When Alice posts, she notifies her subscribers — but here's the key: the subject (Alice) has no idea what observers will *do* with the notification, and there's no central place coordinating the group. Adding "Bob can't see messages from people he's blocked" means stuffing that logic into either every subject or every observer:

```python
# OBSERVER-style sketch — note the coupling creeping back in
class User:
    def __init__(self, name):
        self.name = name
        self._subscribers = []          # everyone who follows ME

    def subscribe(self, other):
        self._subscribers.append(other)  # to hear Alice, you subscribe to Alice

    def post(self, message):
        # Alice fires-and-forgets to her subscribers. She does NOT coordinate
        # the room; she has no notion of "the group" — only her own listeners.
        for sub in self._subscribers:
            sub.on_message(self.name, message)

    def on_message(self, sender, message):
        print(f"[{self.name}] heard from {sender}: {message}")
```

To make a group chat work this way, *every user must subscribe to every other user* — that's the n-to-n web (the exact coupling Mediator exists to kill). And cross-cutting rules (blocking, rate limits, message history) have nowhere natural to live.

**In the Mediator version** (the chatroom above), the `ChatroomMediator` is the single place that knows the whole roster and decides who receives what. Users know only the mediator. A new rule like blocking is a one-line change *inside `send`* — the colleagues stay dumb and reusable.

So the deepest distinction is about **knowledge and coordination, not just cardinality**:
- In **Observer**, the subject broadcasts blindly — it doesn't know or care what observers do, and no one orchestrates the participants.
- In **Mediator**, the mediator *actively coordinates* the actions of multiple peers — it holds the interaction rules centrally and decides how peers affect each other.

They overlap in practice; mediators often use observer internally (the mediator *observes* its colleagues, then *coordinates* a response).

### Tradeoffs

**Pros:**
- Reduces n-to-n coupling to n-to-1.
- Coordination logic centralized — easier to maintain.
- Colleagues are simpler and more reusable.

**Cons:**
- The mediator itself can grow complex — a "god object" that knows too much.
- Performance overhead — every interaction routes through the mediator.
- Debugging: "who triggered this?" trails may go through the mediator.

### Related Patterns

- **Facade** — also centralizes, but for a subsystem viewed from outside; Mediator is internal peer coordination.
- **Observer** — frequently used to implement the mediator's notification mechanism.

---

## 7. Memento

### The Pain

You have an object with rich internal state — say, a `TextEditor` with current text, cursor position, selection, undo history. A user says "save this state; I want to come back to it." Or: you implement undo — you need to capture state *before* each change so you can restore it.

Naive approach: expose all internal fields so external code can copy them. But this **violates encapsulation** — everyone now knows the editor's internals, and the editor can't evolve its state representation without breaking external savers.

### Intent

> Without violating encapsulation, capture and externalize an object's internal state so that the object can be restored to this state later.

The object produces a "snapshot" (the Memento) — an opaque token that external code can hold and later hand back. Only the original object can read the memento's contents.

### Analogy

A **game save file**. You play for hours, accumulating inventory, quests, XP, map exploration. You save → the game writes a file. You load → the file is given back, game restored. The save file is opaque to you; only the game engine knows how to interpret it.

Or: a **photograph of a scene**. The photo captures the state at that moment. You can look at it later; you can try to recreate the scene. But the photo isn't the same as being there — it's a self-contained, opaque snapshot.

### Structure

- **Originator** — the object whose state you want to save (e.g., `Editor`).
- **Memento** — a snapshot of Originator's state. Typically has a narrow interface visible to outside code and a wide interface visible only to Originator.
- **Caretaker** — manages mementos (stores, orders them). Does NOT inspect their contents.

### Python Implementation

```python
class EditorMemento:
    """Opaque snapshot. Only Editor should read its fields."""
    def __init__(self, text, cursor):
        self._text = text
        self._cursor = cursor


class Editor:
    def __init__(self):
        self._text = ""
        self._cursor = 0

    def type(self, s):
        self._text = self._text[:self._cursor] + s + self._text[self._cursor:]
        self._cursor += len(s)

    def move_cursor(self, pos):
        self._cursor = pos

    def save(self) -> EditorMemento:
        return EditorMemento(self._text, self._cursor)

    def restore(self, m: EditorMemento):
        self._text = m._text
        self._cursor = m._cursor

    def __repr__(self):
        return f"Editor(text={self._text!r}, cursor={self._cursor})"


class History:
    """Caretaker — stores mementos but doesn't peek inside."""
    def __init__(self):
        self._mementos = []

    def push(self, m):
        self._mementos.append(m)

    def pop(self):
        return self._mementos.pop() if self._mementos else None


editor = Editor()
history = History()

editor.type("Hello")
history.push(editor.save())

editor.type(" World")
history.push(editor.save())

editor.type("!")
print(editor)   # Editor(text='Hello World!', cursor=12)

# Undo
editor.restore(history.pop())
print(editor)   # Editor(text='Hello World', cursor=11)

editor.restore(history.pop())
print(editor)   # Editor(text='Hello', cursor=5)
```

`History` stores mementos but never reads their internals. `Editor` is the only class that understands the memento's contents. Encapsulation preserved.

### Realistic Use Cases

- **Undo/redo** in editors, drawing tools, etc.
- **Save/load** game state.
- **Transaction rollback** — capture state before a transaction; restore on abort.
- **Snapshot testing** — capture application state, compare across runs.
- **Checkpointing** long-running computations.

### Tradeoffs

**Pros:**
- Preserves encapsulation — external code can save/restore without inspecting internals.
- Separates state-management concerns (in Caretaker) from state-having concerns (in Originator).

**Cons:**
- Mementos can be memory-heavy if state is large; may need pruning.
- If the state has external references (files, sockets), snapshotting is nontrivial.
- Python's dynamic nature makes the "encapsulation" weaker — everything's accessible with underscore conventions rather than language enforcement.

### Related Patterns

- **Command** — commands often store mementos internally for `undo()`.
- **Iterator** — iterator state itself is a memento-like object in some implementations.
- **Prototype** — `clone()` is often used to implement memento creation.

---

## 8. Observer

### The Pain

You have a `WeatherStation` that measures temperature. Several components should react when temperature changes: a `Display`, a `Logger`, a `MobileAlertService`. Naively:

```python
class WeatherStation:
    def set_temperature(self, t):
        self.temperature = t
        display.update(t)
        logger.log(t)
        mobile_alert.check_and_send(t)
```

Every new subscriber forces a change to `WeatherStation`. The station knows too much about who consumes its data. OCP, DIP, SRP all unhappy.

You need a way for interested parties to **subscribe** to events, and for the source to **broadcast** changes — without knowing or caring who's listening.

### Intent

> Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

This is the pattern behind **publish/subscribe** systems, event buses, reactive programming, and countless UI frameworks.

### Analogy

Think of a **YouTube subscription**. When a creator uploads a video, YouTube notifies all subscribers. The creator doesn't know every subscriber personally, nor do they manually message each one — they just upload, and the system broadcasts to subscribers. Subscribing and unsubscribing is entirely the viewer's choice.

Or: a **newspaper subscription**. The publisher prints. They don't care who reads. Subscribers pay to receive. You can cancel anytime; the publisher carries on unaffected.

### Structure

- **Subject** (aka Observable, Publisher) — maintains a list of Observers; provides `attach` and `detach`; notifies them on change.
- **Observer** (aka Subscriber) — interface with `update(...)`.
- **ConcreteObservers** — react to updates specifically.

### Python Implementation

```python
from abc import ABC, abstractmethod

class Observer(ABC):
    @abstractmethod
    def update(self, subject): pass


class Subject:
    def __init__(self):
        self._observers = []

    def attach(self, observer: Observer):
        self._observers.append(observer)

    def detach(self, observer: Observer):
        self._observers.remove(observer)

    def notify(self):
        for obs in self._observers:
            obs.update(self)


class WeatherStation(Subject):
    def __init__(self):
        super().__init__()
        self._temperature = 0

    @property
    def temperature(self):
        return self._temperature

    @temperature.setter
    def temperature(self, value):
        self._temperature = value
        self.notify()


class Display(Observer):
    def update(self, subject):
        print(f"[Display] Temperature is now {subject.temperature}°C")


class Logger(Observer):
    def update(self, subject):
        print(f"[Log] temp={subject.temperature}")


class MobileAlert(Observer):
    def update(self, subject):
        if subject.temperature > 40:
            print(f"[Mobile] ALERT! Too hot: {subject.temperature}°C")


station = WeatherStation()
station.attach(Display())
station.attach(Logger())
station.attach(MobileAlert())

station.temperature = 30
station.temperature = 42
```

Output:
```
[Display] Temperature is now 30°C
[Log] temp=30
[Display] Temperature is now 42°C
[Log] temp=42
[Mobile] ALERT! Too hot: 42°C
```

Adding a `EmailAlert` subscriber? One new class. `WeatherStation` doesn't change.

### Pythonic Observer — Callables as Observers

In Python, you often don't need formal Observer classes. Functions are first-class:

```python
class EventEmitter:
    def __init__(self):
        self._listeners = []

    def on(self, callback):
        self._listeners.append(callback)

    def emit(self, *args, **kwargs):
        for cb in self._listeners:
            cb(*args, **kwargs)


bell = EventEmitter()
bell.on(lambda: print("Ding!"))
bell.on(lambda: print("Logging the ding..."))
bell.emit()
```

This is closer to Node.js's `EventEmitter` or JavaScript's DOM events — same pattern, lighter syntax.

### Push vs Pull

- **Push**: Subject sends the changed data as argument to `update(data)`. Observers get everything they need directly.
- **Pull**: Subject calls `update(self)`; Observers call back into Subject to fetch what they want.

Our implementation is pull. Push is more efficient but couples Subject more tightly to what Observers need.

### Realistic Use Cases

- **UI event systems** — buttons, form field changes.
- **Model-View architectures** — views observe model changes.
- **Message queues / pub-sub** (Kafka, RabbitMQ, Redis pub/sub, at larger scales).
- **Reactive programming** — RxPy, reactive streams, observables.
- **Monitoring and alerting** — metric collectors, log aggregators.
- **Django signals, Flask signals, framework lifecycle events.**

### Tradeoffs

**Pros:**
- Strong decoupling between publisher and subscribers.
- OCP — add new subscribers without touching the publisher.
- Works well with dynamic subscription (attach/detach at runtime).

**Cons:**
- Observation order isn't guaranteed (unless you manage it).
- **Unexpected cascades** — one update triggers many observers, which may trigger their own updates. Debugging flow gets hard.
- **Memory leaks** — observers hold references, preventing garbage collection if not detached properly.
- For high-frequency events, notifying all observers can be a performance hotspot.

### Related Patterns

- **Mediator** — Observer is often used inside a Mediator.
- **Command** — the notification carries a Command to execute.
- **Publish/Subscribe systems** (Kafka, etc.) — distributed versions of Observer.

---

## 9. State

### The Pain

You're building a document approval workflow. A document goes through `Draft → PendingReview → Approved` (or `Rejected`). Each state has its own allowed actions: you can only `submit_for_review` from `Draft`; you can only `approve` or `reject` from `PendingReview`; nothing's allowed from `Approved`.

Naive implementation — a state field with `if/elif` everywhere:

```python
class Document:
    def __init__(self):
        self.state = "draft"

    def submit(self):
        if self.state == "draft":
            self.state = "pending_review"
        elif self.state == "pending_review":
            print("Already submitted")
        else:
            print("Can't submit")

    def approve(self):
        if self.state == "pending_review":
            self.state = "approved"
        elif self.state == "draft":
            print("Submit first!")
        # ... and so on
```

Every method is an `if/elif` ladder over states. Adding a new state (say, `NeedsRevision`) requires updating every method. Behavior lives in branches, not in states.

### Intent

> Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.

Instead of one class branching on state, have **one class per state**, each encapsulating that state's behavior.

### Analogy

Think of **traffic lights**. Red → Green → Yellow → Red. In each color's regime, the rules are different ("stop," "go," "slow down"). The "behavior" of the traffic light is entirely different per state — and the light transitions from one state to another.

Or: a **vending machine**. States: `Idle → HasMoney → DispensingItem → ReturningChange`. Each state accepts different inputs and transitions differently.

### Structure

- **Context** — the object whose behavior changes (holds a reference to the current State).
- **State** — interface declaring state-specific operations.
- **ConcreteStates** — implement behavior for each specific state; decide transitions.

### Python Implementation

```python
from abc import ABC, abstractmethod

class DocumentState(ABC):
    @abstractmethod
    def submit(self, doc): pass
    @abstractmethod
    def approve(self, doc): pass
    @abstractmethod
    def reject(self, doc): pass


class Draft(DocumentState):
    def submit(self, doc):
        print("Submitted for review.")
        doc.state = PendingReview()
    def approve(self, doc):
        print("Cannot approve — document is still a draft.")
    def reject(self, doc):
        print("Cannot reject — document is still a draft.")


class PendingReview(DocumentState):
    def submit(self, doc):
        print("Already submitted.")
    def approve(self, doc):
        print("Approved!")
        doc.state = Approved()
    def reject(self, doc):
        print("Rejected; back to draft.")
        doc.state = Draft()


class Approved(DocumentState):
    def submit(self, doc):
        print("Already approved; no need to submit.")
    def approve(self, doc):
        print("Already approved.")
    def reject(self, doc):
        print("Cannot reject an approved document.")


class Document:
    def __init__(self):
        self.state = Draft()

    def submit(self):
        self.state.submit(self)

    def approve(self):
        self.state.approve(self)

    def reject(self):
        self.state.reject(self)


doc = Document()
doc.approve()   # Cannot approve — document is still a draft.
doc.submit()    # Submitted for review.
doc.reject()    # Rejected; back to draft.
doc.submit()    # Submitted for review.
doc.approve()   # Approved!
doc.submit()    # Already approved; no need to submit.
```

Each state is a class. Each class *owns* the behavior for that state. Transitions are explicit in the state classes. Adding a new state (`NeedsRevision`) is a new class; existing states unchanged except possibly for transitions.

### State vs Strategy — They Look Similar

Both inject behavior via composition. The difference is *who controls what*:

| State | Strategy |
|---|---|
| **Who initiates the change?** The object **transitions itself** in response to events at runtime | **Who initiates the change?** The **client picks** the strategy upfront, and it usually stays put |
| States know about each other; they **transition** | Strategies are independent; they don't know one another exists |
| Behavior changes **over time**, driven by events | Behavior is chosen **upfront** by the client |
| Models finite state machines | Models interchangeable algorithms |

That first row is the deepest difference and the one most often missed. In **State**, a `VendingMachine` sitting in `NoCoinState` flips *itself* to `HasCoinState` when a coin event arrives — the transition is internal, automatic, and event-driven; the client just feeds events and never names a state. In **Strategy**, the client says "use `ExpressShipping`" and that choice persists until the client deliberately swaps it — the strategy never decides on its own to become a different strategy. Put bluntly: **a State changes itself; a Strategy is changed by someone else.**

Example: document workflow is State (it transitions). Discount calculation is Strategy (you pick premium vs regular).

### Realistic Use Cases

- **Workflow engines** — documents, orders, tickets passing through states.
- **Game character states** — idle, walking, jumping, attacking.
- **TCP connection state machines** — LISTEN, SYN_SENT, ESTABLISHED, etc.
- **Media players** — stopped, playing, paused, buffering.
- **Transaction processing** — initiated, authorized, captured, refunded.

### Tradeoffs

**Pros:**
- Eliminates large `if/elif` chains on state.
- Each state class is cohesive and self-contained.
- Adding new states is a new class — strong OCP.

**Cons:**
- More classes (one per state).
- State transition logic is distributed — to understand the full flow, you read multiple classes.
- Sometimes a simple state enum + dispatch table is plenty; a full State pattern is overkill.

### Related Patterns

- **Strategy** — same scaffolding, different intent.
- **Singleton** — concrete State objects are often stateless and can be singletons, shared across all contexts.
- **Memento** — to save/restore state during transitions.

---

## 10. Strategy

### The Pain

Your e-commerce app calculates shipping cost. Currently it's a single method:

```python
def calculate_shipping(order):
    # Complex rules for domestic shipping
    if order.is_domestic:
        return 50 + order.weight * 10
    else:  # international
        return 500 + order.weight * 20 + customs_fee(order)
```

Today, the business wants another shipping strategy: *express* (flat ₹1000), *economy* (slow but ₹30), *pickup* (₹0). Each season, new options pop up. The method becomes a branching monster.

The core insight: **shipping cost computation is an *algorithm*, and there are multiple alternative algorithms**. You want to select one at runtime, and you want adding a new one to be painless.

### Intent

> Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### Analogy

**Navigation apps**. You enter "home to office." Google Maps gives you multiple strategies: fastest, shortest, avoid tolls, walking, public transit. Each is an algorithm. Each produces a route. The *user* picks which strategy. The overall "plan a route" behavior doesn't change — only the algorithm does.

Or: **paying for a meal**. The action is "pay ₹500." The strategy is cash, card, UPI, wallet, or IOU. Same outcome; different mechanism.

### Structure

- **Context** — the object that uses a strategy (e.g., `Order`).
- **Strategy** — interface for interchangeable algorithms.
- **ConcreteStrategies** — each implements a specific algorithm.

### Python Implementation

```python
from abc import ABC, abstractmethod

class ShippingStrategy(ABC):
    @abstractmethod
    def calculate(self, order) -> float: pass


class StandardShipping(ShippingStrategy):
    def calculate(self, order):
        return 50 + order.weight * 10

class ExpressShipping(ShippingStrategy):
    def calculate(self, order):
        return 1000   # Flat rate

class EconomyShipping(ShippingStrategy):
    def calculate(self, order):
        return 30 + order.weight * 5

class PickupShipping(ShippingStrategy):
    def calculate(self, order):
        return 0


class Order:
    def __init__(self, items, weight, shipping: ShippingStrategy):
        self.items = items
        self.weight = weight
        self.shipping_strategy = shipping

    def shipping_cost(self):
        return self.shipping_strategy.calculate(self)


order = Order(["book"], weight=2, shipping=ExpressShipping())
print(order.shipping_cost())   # 1000

order.shipping_strategy = EconomyShipping()
print(order.shipping_cost())   # 40
```

New strategy (`FreeShippingForPremium`)? One new class. No modification to `Order` or existing strategies. **Textbook OCP.**

### Pythonic Strategy — Functions as Strategies

In Python, functions are first-class. You don't always need ABCs:

```python
# Each strategy is just a function taking an order and returning a cost. No ABC,
# no class hierarchy — the "interface" is the informal contract "callable(order)
# -> number". This is lighter, but the contract is now UNENFORCED: nothing stops
# someone passing a function with the wrong signature, and there's no shared base
# advertising what a valid strategy looks like. With an ABC, abstractmethod would
# catch a malformed strategy at definition time; here a mismatch only surfaces at
# the call site, at runtime. Trade formality for brevity with eyes open.
def standard(order): return 50 + order.weight * 10
def express(order): return 1000
def economy(order): return 30 + order.weight * 5
def pickup(order): return 0


class Order:
    def __init__(self, items, weight, shipping_strategy):
        self.items = items
        self.weight = weight
        self.shipping_strategy = shipping_strategy   # Just a callable

    def shipping_cost(self):
        return self.shipping_strategy(self)


order = Order(["book"], 2, express)
print(order.shipping_cost())   # 1000
```

Lighter weight. Just as flexible. Loses some structure (no common interface enforced) but gains brevity. Rule of thumb: reach for functions when strategies are simple and stateless; reach for ABC-backed classes when strategies carry their own state, share helper methods, or you want the type system to document and enforce the contract.

### Realistic Use Cases

- **Sorting algorithms** — `sorted(list, key=func)` is strategy (the `key` is the strategy).
- **Discount strategies**, **tax strategies**, **pricing strategies** in e-commerce.
- **Compression strategies** in file handling.
- **Authentication strategies** (username/password, OAuth, SSO).
- **Payment strategies** (card, UPI, wallet, cash).

### Strategy vs State — Revisited

Strategy: client *chooses* the algorithm; it doesn't change based on internal events.
State: the object *transitions* between states based on its behavior; the client just calls methods and states change automatically.

### Tradeoffs

**Pros:**
- OCP: new algorithms plug in without modifying context.
- Algorithms are isolated and individually testable.
- Runtime swapping is trivial.
- Eliminates `if/elif` ladders on algorithm type.

**Cons:**
- More classes (if using full ABC approach).
- Client has to understand available strategies to pick.
- Overkill for tiny decisions — a single `if` may be clearer.

### Related Patterns

- **State** — same shape, different intent.
- **Factory** — often used to create strategies based on config.
- **Template Method** — opposite in a sense: Template Method fixes the algorithm, varying only steps; Strategy varies the whole algorithm.

---

## 11. Template Method

### The Pain

You have several "algorithms" that share the same overall *structure* but differ in some specific *steps*. For example, making different hot beverages:

- **Tea**: boil water → steep tea → pour → add lemon.
- **Coffee**: boil water → brew grounds → pour → add sugar & milk.

Structurally: boil water, brew, pour, add condiments. Steps 1 and 3 are identical. Steps 2 and 4 differ. If you write two independent classes, you duplicate boil+pour. If you tangle them, you get conditionals.

You want to: **define the skeleton once, let subclasses fill in the varying parts**.

### Intent

> Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.

### Analogy

A **cooking recipe template**. "Preheat oven. Prepare ingredients (varies). Bake at X°C for Y minutes (varies). Let cool. Serve." The top-level structure is fixed; the specifics (what to prep, temperature, time) vary per dish.

Or: **standardized onboarding processes** at a company. "Sign offer letter. [Team-specific orientation]. HR training. [Role-specific training]. First week wrap-up." Fixed skeleton, varying team/role parts.

### Structure

- **AbstractClass** — defines the *template method* (which is concrete and calls other methods in order) and declares the step methods (some abstract, some with default implementations).
- **ConcreteClasses** — override the abstract steps.

### Python Implementation

```python
from abc import ABC, abstractmethod

class Beverage(ABC):
    # The template method — final structure of the algorithm
    def prepare(self):
        self.boil_water()
        self.brew()
        self.pour_in_cup()
        self.add_condiments()

    def boil_water(self):
        print("Boiling water")

    def pour_in_cup(self):
        print("Pouring into cup")

    @abstractmethod
    def brew(self): pass

    @abstractmethod
    def add_condiments(self): pass


class Tea(Beverage):
    def brew(self):
        print("Steeping tea bag")
    def add_condiments(self):
        print("Adding lemon")


class Coffee(Beverage):
    def brew(self):
        print("Brewing coffee grounds")
    def add_condiments(self):
        print("Adding sugar and milk")


Tea().prepare()
# Boiling water
# Steeping tea bag
# Pouring into cup
# Adding lemon

Coffee().prepare()
# Boiling water
# Brewing coffee grounds
# Pouring into cup
# Adding sugar and milk
```

The *algorithm shape* (`boil → brew → pour → condiments`) is fixed in `prepare()`. Subclasses plug in their specifics.

This is the clearest illustration of the **Hollywood Principle**: *"Don't call us, we'll call you."* In ordinary code, *your* class calls into a library. Here it's inverted — the **parent** `Beverage.prepare()` is in charge of the control flow, and it *calls down into* the subclass's hooks (`brew`, `add_condiments`) at the moments it decides. The subclass never invokes `prepare`'s steps in order itself; it just supplies the pieces and waits to be called. That inversion of control is exactly what keeps the algorithm's skeleton tamper-proof: a subclass can change *what* brewing means, but it cannot reorder boil/brew/pour or skip a step, because it isn't the one driving.

### Hooks — Optional Steps

You can also provide default implementations that subclasses may override but don't have to:

```python
class Beverage(ABC):
    def prepare(self):
        self.boil_water()
        self.brew()
        self.pour_in_cup()
        if self.customer_wants_condiments():   # Hook
            self.add_condiments()

    def customer_wants_condiments(self):
        return True   # Default
```

Subclasses override `customer_wants_condiments` only if they need different logic.

### Template Method vs Strategy

Both solve "variation in behavior." The key difference:

| Template Method | Strategy |
|---|---|
| Uses **inheritance** — subclass overrides steps | Uses **composition** — inject a whole algorithm |
| Fixes algorithm structure, varies steps | Varies the entire algorithm |
| "Hollywood principle": don't call us, we'll call you (parent calls subclass's hooks) | Client picks a strategy object |
| Fewer runtime decisions | More runtime flexibility |

Both are valid for different situations. Prefer Strategy when you want more flexibility and runtime swapping; prefer Template Method when the skeleton truly is fixed and only steps vary.

### Realistic Use Cases

- **Framework extension points** — Django's class-based views, Flask's view functions, unittest's `setUp/tearDown`.
- **Data processing pipelines** — fixed "extract → transform → load" skeleton; subclasses customize each step.
- **Lifecycle hooks** in libraries (e.g., React's lifecycle methods).
- **Game loops** — fixed structure (input → update → render), specific games customize.

### Tradeoffs

**Pros:**
- Eliminates duplication of algorithm structure.
- Enforces consistency — every subclass follows the same sequence.
- Great for "framework" code — you provide the skeleton, users fill in the blanks.

**Cons:**
- Inheritance-based — tight coupling between parent and child.
- Subclasses may be tempted to override more than intended.
- Harder to test individual steps in isolation.
- Can lead to deep inheritance hierarchies.

### Related Patterns

- **Strategy** — composition-based alternative.
- **Factory Method** — often itself a Template Method (create the product, then customize it).
- **Hollywood Principle** — the underlying philosophy ("don't call us, we'll call you").

---

## 12. Visitor

### The Pain

You have a **document object model** — paragraphs, images, tables, lists. On this model you need to perform various operations: spell check, word count, HTML export, PDF export, translation, accessibility audit, etc.

You could add a method for each operation to every node class (`spell_check()`, `word_count()`, `export_html()`, ...). But:

- Every new operation bloats every class. Classes grow unboundedly.
- The classes stop having a single responsibility — they accumulate unrelated operations.
- If you can't modify the classes (e.g., third-party library), you're stuck.

You want: **define new operations on an object structure without modifying the object classes.**

### Intent

> Represent an operation to be performed on the elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements on which it operates.

The trick: each element accepts a Visitor. The Visitor has a method per element type. The element dispatches to the right method.

### Analogy

A **tax auditor visiting different businesses**. A restaurant, a factory, a retailer — each has different books, inventory, and concerns. The auditor (visitor) has specialized routines: how to audit a restaurant, how to audit a factory, how to audit a retailer. The businesses don't change; the auditor brings the operation.

Next year, there's a "health inspector" visitor — different routines, same businesses, no modifications to the businesses.

### Structure

- **Visitor** — interface declaring `visit_X(x)` for each element type X.
- **ConcreteVisitors** — specific operations.
- **Element** — interface with `accept(visitor)` method.
- **ConcreteElements** — implement `accept` by calling `visitor.visit_Self(self)` (double dispatch).

### Python Implementation

```python
from abc import ABC, abstractmethod

# Elements
class DocElement(ABC):
    @abstractmethod
    def accept(self, visitor): pass


class Paragraph(DocElement):
    def __init__(self, text):
        self.text = text
    def accept(self, visitor):
        # FIRST DISPATCH — selected by THIS element's type. We're inside
        # Paragraph.accept, so Python already resolved "which element am I?"
        # That's why we can hard-code the call to visit_paragraph below.
        visitor.visit_paragraph(self)   # SECOND DISPATCH — selected by the
        # visitor's type: WordCountVisitor.visit_paragraph vs
        # HTMLExportVisitor.visit_paragraph resolve differently. Element type ×
        # visitor type = the right method. Together: double dispatch.


class Image(DocElement):
    def __init__(self, url, alt):
        self.url = url
        self.alt = alt
    def accept(self, visitor):
        visitor.visit_image(self)


class Table(DocElement):
    def __init__(self, rows):
        self.rows = rows
    def accept(self, visitor):
        visitor.visit_table(self)


# Visitors
class Visitor(ABC):
    @abstractmethod
    def visit_paragraph(self, p): pass
    @abstractmethod
    def visit_image(self, i): pass
    @abstractmethod
    def visit_table(self, t): pass


class WordCountVisitor(Visitor):
    def __init__(self):
        self.count = 0
    def visit_paragraph(self, p):
        self.count += len(p.text.split())
    def visit_image(self, i):
        self.count += len(i.alt.split())   # count alt-text words
    def visit_table(self, t):
        for row in t.rows:
            for cell in row:
                self.count += len(cell.split())


class HTMLExportVisitor(Visitor):
    def __init__(self):
        self.html = []
    def visit_paragraph(self, p):
        self.html.append(f"<p>{p.text}</p>")
    def visit_image(self, i):
        self.html.append(f'<img src="{i.url}" alt="{i.alt}">')
    def visit_table(self, t):
        rows_html = "".join(
            "<tr>" + "".join(f"<td>{c}</td>" for c in row) + "</tr>"
            for row in t.rows
        )
        self.html.append(f"<table>{rows_html}</table>")


# A document
document = [
    Paragraph("The quick brown fox jumps"),
    Image("fox.jpg", "A red fox"),
    Table([["Name", "Age"], ["Amit", "30"]]),
    Paragraph("The end."),
]

# Operation 1: word count
wc = WordCountVisitor()
for elem in document:
    elem.accept(wc)
print(f"Total words: {wc.count}")

# Operation 2: HTML export — no changes to element classes
html = HTMLExportVisitor()
for elem in document:
    elem.accept(html)
print("\n".join(html.html))
```

Adding a third operation — say, `SpellCheckVisitor` — is a new class. The document element classes (`Paragraph`, `Image`, `Table`) don't change. **OCP for operations**, at the cost of structural stability for element types.

### Double Dispatch — The Clever Bit

When you call `elem.accept(visitor)`:
1. `elem` knows its type (say, `Paragraph`).
2. It calls `visitor.visit_paragraph(self)` — the exact right method on the visitor.

This is double dispatch: the method resolved depends on *both* the element type AND the visitor type. Most OOP languages (including Python) have single dispatch (on the method's receiver only); `accept` manually fakes the second dispatch.

**Why can't we just call `visitor.visit(element)` directly and skip the `accept` dance?** Because Python (like Java, C#, C++) dispatches on exactly *one* type — the object before the dot. If we wrote a single `visit(self, element)` method, the visitor would receive an `element` whose concrete type (`Paragraph`? `Image`? `Table`?) it can only discover by writing `isinstance` checks — the very `if/elif` ladder Visitor exists to abolish. The two-step `accept` → `visit_xxx` handshake launders the missing dispatch through the type system: step one is a normal method call on the element (Python resolves *which element*), and from *inside* that element's `accept` we now statically know the type, so we can call the correctly-named `visit_paragraph`/`visit_image`/`visit_table` — and *that* call resolves on the visitor's type. Two single dispatches, chained, give us the double dispatch the language won't give us directly.

### Visitor's Tradeoff — Operations vs Elements

Visitor makes it easy to **add operations** (new visitors = no change to elements), but hard to **add element types** (a new element class forces every existing visitor to implement `visit_new_type`). This is often called the **Expression Problem**.

Before using Visitor, ask: do element types change less than operations? If yes → Visitor. If operations are stable but element types evolve → inheritance methods on elements.

### Realistic Use Cases

- **Compilers** — AST nodes visited by type checkers, optimizers, code generators.
- **Document formats** — nodes in a parsed doc visited by exporters (HTML, PDF, plain text, accessibility).
- **Object databases** — visitors for serialization, validation, indexing.
- **Static analysis tools** — visit AST nodes to flag code smells.

### Tradeoffs

**Pros:**
- Adds new operations without touching element classes.
- Keeps element classes focused (SRP).
- Works well on stable hierarchies with many operations.

**Cons:**
- Adding a new element type is painful — every existing visitor must change.
- Double-dispatch ceremony (`accept` methods) feels heavy.
- Visitor methods may need access to internal state, forcing wider interfaces on elements.

### Python-Specific Notes

Python's duck typing and `functools.singledispatch` can achieve similar effects without the formal Visitor machinery:

```python
from functools import singledispatch

@singledispatch
def word_count(elem): raise NotImplementedError

@word_count.register
def _(p: Paragraph): return len(p.text.split())

@word_count.register
def _(i: Image): return len(i.alt.split())
```

Not always better, but often simpler when formal Visitor is overkill.

### Related Patterns

- **Composite** — Visitors typically traverse Composite structures.
- **Interpreter** — ASTs built via Interpreter are often operated on with Visitor.
- **Iterator** — used to walk through elements during a visit.

---

## 13. Summary

Eleven patterns. Each answers a different question about how objects collaborate:

| Pattern | Question It Answers | Core Mechanism |
|---|---|---|
| **Chain of Responsibility** | Who should handle this request? | Pass through a chain until someone handles it |
| **Command** | How do I make actions first-class (store, queue, undo)? | Encapsulate a request as an object |
| **Interpreter** | How do I evaluate sentences in a mini-language? | Each grammar rule as a class; build a tree; recurse |
| **Iterator** | How do I traverse a collection uniformly? | An object that yields elements one at a time |
| **Mediator** | How do I coordinate many peers without n² connections? | A central hub they all talk through |
| **Memento** | How do I save/restore state without breaking encapsulation? | An opaque snapshot only the owner can read |
| **Observer** | How do I notify many parties of a change? | Subscribers register; subject broadcasts |
| **State** | How does an object change behavior as it changes state? | One class per state; state objects handle transitions |
| **Strategy** | How do I make algorithms interchangeable? | Inject a strategy object; swap at will |
| **Template Method** | How do I fix an algorithm's structure but vary its steps? | Parent defines skeleton; children override steps |
| **Visitor** | How do I add operations to a structure without modifying it? | Double dispatch: element accepts visitor, visitor handles element |

### Decision Flow

- **Need to decouple sender from receiver?** → Chain of Responsibility.
- **Need actions as objects (undo, queue, log)?** → Command.
- **Need to evaluate a DSL or grammar?** → Interpreter.
- **Need uniform traversal?** → Iterator.
- **Need to coordinate complex peer interactions?** → Mediator.
- **Need to save/restore state?** → Memento.
- **Need to notify many listeners of changes?** → Observer.
- **Object behavior depends on a state that transitions?** → State.
- **Need interchangeable algorithms?** → Strategy.
- **Need a fixed process with variable steps?** → Template Method.
- **Need to add operations to a stable structure?** → Visitor.

### Recognizing Patterns in Your Own Code — A Symptom-Driven Tree

The list above works once you already know which pattern you want. In practice you usually start from a *smell* in your own code, not from a pattern name. This tree walks from the symptom you can actually observe to the pattern that addresses it. Read it as "if you catch yourself writing X, reach for Y."

```
What is the code smell you're staring at?
│
├─ A big if/elif (or switch) ladder that keeps growing...
│   │
│   ├─ ...branching on a "type" or "kind" field, and you keep ADDING operations
│   │   over a FIXED set of types?                          → VISITOR
│   │
│   ├─ ...branching on the object's current "mode/phase/status," and the object
│   │   moves between those modes over time?                → STATE
│   │
│   └─ ...branching to pick one of several algorithms the caller chose?
│                                                            → STRATEGY
│
├─ Two methods share the same skeleton but differ in a few steps
│   (copy-pasted with small edits)...                       → TEMPLATE METHOD
│
├─ Objects are wired directly to each other and the web of references is
│   exploding (n×n)...                                      → MEDIATOR
│
├─ "When X happens, several unrelated things must react," and you don't want
│   X to know about all of them...                          → OBSERVER
│
├─ You need to treat an action as a *thing* — to queue it, log it, retry it,
│   or undo it...                                           → COMMAND
│       └─ ...and undo needs to restore prior state cleanly?
│                                            → COMMAND + MEMENTO
│
├─ A request might be handled by one of several handlers and you don't know
│   which upfront (and want to add/reorder handlers freely)? → CHAIN OF RESPONSIBILITY
│
├─ You're parsing/evaluating little expressions in a mini-language
│   (filters, rules, formulas)...                           → INTERPRETER
│
└─ You want callers to walk a collection without exposing its internals
    (or you wrote a custom data structure)...               → ITERATOR
```

The decisive questions, distilled:
- **Who chooses the behavior, and when?** The client up front → Strategy. The object itself, reacting to events → State.
- **What's stable and what changes?** Operations grow over fixed types → Visitor. Types grow over fixed operations → keep methods on the elements (don't use Visitor).
- **Is the structure fixed and only steps vary?** → Template Method. Is the *whole* algorithm swappable? → Strategy.
- **Is it one-to-many notification?** → Observer. **Many-to-many coordination with central rules?** → Mediator.

When two candidates still feel plausible, you're usually choosing between a *static* shape (inheritance, decided at definition: Template Method) and a *dynamic* one (composition, decided at runtime: Strategy, State). Default to the composition-based option unless the skeleton genuinely never varies — it ages better.

### Key Takeaways

1. **Behavioral patterns are the richest and most varied family.** Each one addresses a genuinely distinct collaboration problem.
2. **Many pairs look similar structurally; tell them apart by intent.** State vs Strategy, Template Method vs Strategy, Mediator vs Observer, Command vs Chain of Responsibility — all are disambiguated by *why* you use them, not just *what they look like*.
3. **Python simplifies several of these patterns significantly.** Generators collapse Iterator. First-class functions simplify Strategy, Command, and Observer. `functools.singledispatch` can replace Visitor in some cases. Always recognize the *pattern*; choose the most Pythonic *implementation*.
4. **Behavior + SOLID = much of good OO design.** Observer embodies OCP. Strategy embodies OCP and DIP. State embodies OCP by splitting state-dependent behavior across classes. Command embodies SRP by turning actions into first-class objects.
5. **Patterns can combine.** A `Command` often holds a `Memento`. A `Mediator` often uses `Observer`. A `Visitor` traverses a `Composite`. Real systems layer patterns naturally.

---

## 14. Practice Exercises

### Exercise 1 — Chain of Responsibility

You're building a **purchase approval system**. An employee submits a purchase request. Approval rules:

- Up to ₹10,000: Team Lead.
- Up to ₹1,00,000: Manager.
- Up to ₹10,00,000: Director.
- Above: CFO.

Design a chain. Show what happens for requests of ₹5,000, ₹80,000, ₹5,00,000, and ₹2,00,00,000.

**Solution:**

```python
from abc import ABC, abstractmethod

class Approver(ABC):
    def __init__(self):
        self._next = None

    def set_next(self, next_approver):
        self._next = next_approver
        return next_approver

    def approve(self, amount):
        if self._can_approve(amount):
            self._handle(amount)
        elif self._next:
            self._next.approve(amount)
        else:
            print(f"Cannot approve ₹{amount:,}")

    @abstractmethod
    def _can_approve(self, amount): pass
    @abstractmethod
    def _handle(self, amount): pass


class TeamLead(Approver):
    def _can_approve(self, amount): return amount <= 10_000
    def _handle(self, amount): print(f"Team Lead approved ₹{amount:,}")

class Manager(Approver):
    def _can_approve(self, amount): return amount <= 1_00_000
    def _handle(self, amount): print(f"Manager approved ₹{amount:,}")

class Director(Approver):
    def _can_approve(self, amount): return amount <= 10_00_000
    def _handle(self, amount): print(f"Director approved ₹{amount:,}")

class CFO(Approver):
    def _can_approve(self, amount): return True  # CFO handles everything above
    def _handle(self, amount): print(f"CFO approved ₹{amount:,}")


# Build chain
lead = TeamLead()
lead.set_next(Manager()).set_next(Director()).set_next(CFO())

for amt in [5_000, 80_000, 5_00_000, 2_00_00_000]:
    lead.approve(amt)
```

Output:
```
Team Lead approved ₹5,000
Manager approved ₹80,000
Director approved ₹5,00,000
CFO approved ₹2,00,00,000
```

---

### Exercise 2 — Command with Undo

Implement a simple calculator with `Add`, `Subtract`, and `Multiply` commands. Support undo. Demonstrate.

**Solution:**

```python
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self, calc): pass
    @abstractmethod
    def undo(self, calc): pass


class Calculator:
    def __init__(self):
        self.value = 0
        self.history = []

    def run(self, cmd):
        cmd.execute(self)
        self.history.append(cmd)

    def undo(self):
        if self.history:
            self.history.pop().undo(self)


class Add(Command):
    def __init__(self, n): self.n = n
    def execute(self, calc): calc.value += self.n
    def undo(self, calc): calc.value -= self.n


class Subtract(Command):
    def __init__(self, n): self.n = n
    def execute(self, calc): calc.value -= self.n
    def undo(self, calc): calc.value += self.n


class Multiply(Command):
    def __init__(self, n):
        self.n = n
        self._previous = None
    def execute(self, calc):
        self._previous = calc.value
        calc.value *= self.n
    def undo(self, calc):
        calc.value = self._previous


calc = Calculator()
calc.run(Add(10))        # 10
calc.run(Multiply(3))    # 30
calc.run(Subtract(5))    # 25
print(calc.value)        # 25

calc.undo(); print(calc.value)   # 30
calc.undo(); print(calc.value)   # 10
calc.undo(); print(calc.value)   # 0
```

Note: `Multiply` stores `_previous` because undoing multiplication by zero can't be done via division. Undo design requires care.

---

### Exercise 3 — Iterator

Build a class `FibonacciSequence(n)` that iterates over the first `n` Fibonacci numbers. Use Python's generator style.

**Solution:**

```python
class FibonacciSequence:
    def __init__(self, n):
        self.n = n

    def __iter__(self):
        a, b = 0, 1
        for _ in range(self.n):
            yield a
            a, b = b, a + b


for f in FibonacciSequence(10):
    print(f, end=" ")
# 0 1 1 2 3 5 8 13 21 34
```

Short, lazy, and fully Pythonic. No explicit `__next__` needed.

---

### Exercise 4 — Mediator

Model a **smart home**. A motion sensor triggers: lights turn on, camera records, phone gets a notification. A door sensor triggers: lights turn on, security alarm starts, phone gets a notification. Implement via Mediator so that sensors don't directly reference all consumers.

**Solution:**

```python
class SmartHomeHub:
    def __init__(self):
        self.lights = None
        self.camera = None
        self.alarm = None
        self.phone = None

    def register(self, lights=None, camera=None, alarm=None, phone=None):
        if lights: self.lights = lights
        if camera: self.camera = camera
        if alarm: self.alarm = alarm
        if phone: self.phone = phone

    def handle(self, event):
        if event == "motion":
            self.lights.on()
            self.camera.record()
            self.phone.notify("Motion detected")
        elif event == "door":
            self.lights.on()
            self.alarm.sound()
            self.phone.notify("Door opened!")


class Lights:
    def on(self): print("Lights ON")

class Camera:
    def record(self): print("Camera recording")

class Alarm:
    def sound(self): print("Alarm SOUNDING")

class Phone:
    def notify(self, msg): print(f"Phone notified: {msg}")


class MotionSensor:
    def __init__(self, hub): self.hub = hub
    def trigger(self): self.hub.handle("motion")

class DoorSensor:
    def __init__(self, hub): self.hub = hub
    def trigger(self): self.hub.handle("door")


hub = SmartHomeHub()
hub.register(lights=Lights(), camera=Camera(), alarm=Alarm(), phone=Phone())

motion = MotionSensor(hub)
door = DoorSensor(hub)

motion.trigger()
print("---")
door.trigger()
```

Sensors only know the hub. Consumers are registered with the hub. Wiring changes are a one-line registration update.

---

### Exercise 5 — Observer

Build a simple **stock ticker**. A `Stock` has a price. Multiple observers — a `PriceDisplay`, an `AlertSystem` (fires if price drops > 5%), and an `AutoTrader` (buys if price drops > 10%) — should react when price changes.

**Solution:**

```python
class Stock:
    def __init__(self, symbol, price):
        self.symbol = symbol
        self._price = price
        self._previous = price
        self._observers = []

    def attach(self, obs):
        self._observers.append(obs)

    def set_price(self, price):
        self._previous = self._price
        self._price = price
        self._notify()

    @property
    def price(self): return self._price
    @property
    def previous(self): return self._previous
    @property
    def change_pct(self): return (self._price - self._previous) / self._previous * 100

    def _notify(self):
        for obs in self._observers:
            obs.update(self)


class PriceDisplay:
    def update(self, stock):
        print(f"[Display] {stock.symbol}: ₹{stock.price} ({stock.change_pct:+.2f}%)")


class AlertSystem:
    def update(self, stock):
        if stock.change_pct < -5:
            print(f"[Alert] {stock.symbol} DROPPED {stock.change_pct:.2f}%")


class AutoTrader:
    def update(self, stock):
        if stock.change_pct < -10:
            print(f"[Trader] BUYING {stock.symbol} at ₹{stock.price}")


stock = Stock("INFY", 1500)
stock.attach(PriceDisplay())
stock.attach(AlertSystem())
stock.attach(AutoTrader())

stock.set_price(1450)   # -3.33% — only display fires
stock.set_price(1350)   # Bigger drop from 1450 — alert fires
stock.set_price(1200)   # Big drop from 1350 — alert + trader
```

---

### Exercise 6 — State

Implement a **vending machine** with states: `Idle`, `HasMoney`, `Dispensing`. Actions: `insert_money()`, `select_item()`, `dispense()`. Valid transitions:
- Idle + insert_money → HasMoney.
- HasMoney + select_item → Dispensing.
- Dispensing + dispense → Idle.
- Other combinations print an error.

**Solution:**

```python
from abc import ABC, abstractmethod

class State(ABC):
    @abstractmethod
    def insert_money(self, machine): pass
    @abstractmethod
    def select_item(self, machine): pass
    @abstractmethod
    def dispense(self, machine): pass


class Idle(State):
    def insert_money(self, m):
        print("Money inserted."); m.state = HasMoney()
    def select_item(self, m):
        print("Insert money first.")
    def dispense(self, m):
        print("Nothing to dispense.")


class HasMoney(State):
    def insert_money(self, m):
        print("Already have money.")
    def select_item(self, m):
        print("Item selected."); m.state = Dispensing()
    def dispense(self, m):
        print("Select an item first.")


class Dispensing(State):
    def insert_money(self, m):
        print("Busy dispensing.")
    def select_item(self, m):
        print("Already selected.")
    def dispense(self, m):
        print("Dispensing... enjoy!"); m.state = Idle()


class VendingMachine:
    def __init__(self):
        self.state = Idle()
    def insert_money(self): self.state.insert_money(self)
    def select_item(self): self.state.select_item(self)
    def dispense(self): self.state.dispense(self)


m = VendingMachine()
m.select_item()    # Insert money first.
m.insert_money()   # Money inserted.
m.insert_money()   # Already have money.
m.select_item()    # Item selected.
m.dispense()       # Dispensing... enjoy!
m.dispense()       # Nothing to dispense.
```

---

### Exercise 7 — Strategy

You have a list of numbers. Implement three sorting strategies: ascending, descending, and alphabetical (by string representation). Use Strategy. Then show the Pythonic version using functions.

**Solution:**

```python
from abc import ABC, abstractmethod

# Classical Strategy
class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data): pass


class Ascending(SortStrategy):
    def sort(self, data): return sorted(data)

class Descending(SortStrategy):
    def sort(self, data): return sorted(data, reverse=True)

class AlphabeticalStr(SortStrategy):
    def sort(self, data): return sorted(data, key=str)


class Sorter:
    def __init__(self, strategy: SortStrategy):
        self.strategy = strategy
    def sort(self, data):
        return self.strategy.sort(data)


data = [10, 2, 33, 4]
print(Sorter(Ascending()).sort(data))       # [2, 4, 10, 33]
print(Sorter(Descending()).sort(data))      # [33, 10, 4, 2]
print(Sorter(AlphabeticalStr()).sort(data)) # [10, 2, 33, 4] (because "10" < "2" < "33" < "4")


# Pythonic version — functions as strategies
asc = lambda d: sorted(d)
desc = lambda d: sorted(d, reverse=True)
alpha = lambda d: sorted(d, key=str)

for strat in (asc, desc, alpha):
    print(strat(data))
```

The second form uses Python's `key` argument in `sorted` — a Strategy-pattern application built right into the language.

---

### Exercise 8 — Template Method

Build a `DataExporter` abstract class. The template method `export()` has steps: `fetch()`, `transform()`, `format()`, `save()`. `fetch` and `save` have defaults. Concrete classes `CSVExporter` and `JSONExporter` override `transform` and `format`.

**Solution:**

```python
from abc import ABC, abstractmethod
import json

class DataExporter(ABC):
    def export(self):
        data = self.fetch()
        transformed = self.transform(data)
        output = self.format(transformed)
        self.save(output)

    def fetch(self):
        print("Fetching data from DB...")
        return [{"name": "Amit", "age": 30}, {"name": "Priya", "age": 25}]

    def save(self, output):
        print(f"Saving:\n{output}")

    @abstractmethod
    def transform(self, data): pass
    @abstractmethod
    def format(self, data): pass


class CSVExporter(DataExporter):
    def transform(self, data):
        print("Transforming for CSV...")
        return data
    def format(self, data):
        keys = data[0].keys()
        lines = [",".join(keys)]
        for d in data:
            lines.append(",".join(str(d[k]) for k in keys))
        return "\n".join(lines)


class JSONExporter(DataExporter):
    def transform(self, data):
        print("Transforming for JSON...")
        return data
    def format(self, data):
        return json.dumps(data, indent=2)


print("=== CSV ===")
CSVExporter().export()
print("\n=== JSON ===")
JSONExporter().export()
```

Algorithm structure (`fetch → transform → format → save`) is fixed in `export`. Subclasses plug in the varying steps.

---

### Exercise 9 — Visitor

You have shapes: `Circle`, `Rectangle`, `Triangle` (with base and height). Implement two visitors: `AreaVisitor` and `PerimeterVisitor`. Don't modify the shape classes when adding a new visitor.

**Solution:**

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def accept(self, visitor): pass


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def accept(self, v): return v.visit_circle(self)


class Rectangle(Shape):
    def __init__(self, width, height):
        self.width, self.height = width, height
    def accept(self, v): return v.visit_rectangle(self)


class Triangle(Shape):
    def __init__(self, base, height, side_a, side_b):
        self.base, self.height = base, height
        self.side_a, self.side_b = side_a, side_b
    def accept(self, v): return v.visit_triangle(self)


class Visitor(ABC):
    @abstractmethod
    def visit_circle(self, c): pass
    @abstractmethod
    def visit_rectangle(self, r): pass
    @abstractmethod
    def visit_triangle(self, t): pass


class AreaVisitor(Visitor):
    def visit_circle(self, c): return math.pi * c.radius ** 2
    def visit_rectangle(self, r): return r.width * r.height
    def visit_triangle(self, t): return 0.5 * t.base * t.height


class PerimeterVisitor(Visitor):
    def visit_circle(self, c): return 2 * math.pi * c.radius
    def visit_rectangle(self, r): return 2 * (r.width + r.height)
    def visit_triangle(self, t): return t.base + t.side_a + t.side_b


shapes = [Circle(5), Rectangle(4, 6), Triangle(3, 4, 5, 4)]
area = AreaVisitor()
perim = PerimeterVisitor()

for s in shapes:
    print(f"Area: {s.accept(area):.2f}, Perimeter: {s.accept(perim):.2f}")
```

Adding a `BoundingBoxVisitor` = one new class. Shape classes unchanged.

---

### Exercise 10 — Capstone (Multi-Pattern)

Design a **game character** that combines several behavioral patterns:

- **State** — character has states (`Idle`, `Walking`, `Jumping`, `Falling`).
- **Command** — player input (`MoveLeftCommand`, `JumpCommand`) is dispatched as commands.
- **Observer** — game UI observes character's health and updates display on change.
- **Strategy** — different attack strategies (melee, ranged, magic).

Outline the class structure.

**Solution (outline with working code):**

```python
from abc import ABC, abstractmethod

# --- State ---
class CharacterState(ABC):
    @abstractmethod
    def update(self, char): pass
    @abstractmethod
    def name(self): pass

class Idle(CharacterState):
    def update(self, char): pass
    def name(self): return "Idle"

class Walking(CharacterState):
    def update(self, char): pass
    def name(self): return "Walking"

class Jumping(CharacterState):
    def update(self, char):
        char.y += 5
        if char.y >= 10: char.state = Falling()
    def name(self): return "Jumping"

class Falling(CharacterState):
    def update(self, char):
        char.y -= 5
        if char.y <= 0:
            char.y = 0
            char.state = Idle()
    def name(self): return "Falling"


# --- Strategy ---
class AttackStrategy(ABC):
    @abstractmethod
    def attack(self, char, target): pass

class MeleeAttack(AttackStrategy):
    def attack(self, char, target):
        print(f"{char.name} slashes {target} for 10 damage")

class RangedAttack(AttackStrategy):
    def attack(self, char, target):
        print(f"{char.name} shoots {target} for 7 damage")

class MagicAttack(AttackStrategy):
    def attack(self, char, target):
        print(f"{char.name} casts fireball on {target} for 15 damage")


# --- Observer ---
class UIObserver:
    def update(self, character):
        print(f"[UI] {character.name}: HP={character.hp}, state={character.state.name()}")


# --- Character ---
class Character:
    def __init__(self, name, attack: AttackStrategy):
        self.name = name
        self.hp = 100
        self.x = 0
        self.y = 0
        self.state = Idle()
        self.attack_strategy = attack
        self._observers = []

    def attach(self, obs): self._observers.append(obs)
    def _notify(self):
        for o in self._observers: o.update(self)

    def take_damage(self, amt):
        self.hp -= amt
        self._notify()

    def tick(self):
        self.state.update(self)

    def attack(self, target):
        self.attack_strategy.attack(self, target)


# --- Command ---
class Command(ABC):
    @abstractmethod
    def execute(self, char): pass

class MoveLeft(Command):
    def execute(self, char):
        char.x -= 1
        char.state = Walking()

class Jump(Command):
    def execute(self, char):
        if isinstance(char.state, Idle):
            char.state = Jumping()


# --- Game loop ---
hero = Character("Hero", MeleeAttack())
hero.attach(UIObserver())

hero.take_damage(20)             # UI reacts

MoveLeft().execute(hero)         # State → Walking
Jump().execute(hero)             # (ignored — not in Idle)
hero.state = Idle()              # reset for demo
Jump().execute(hero)             # State → Jumping
for _ in range(5): hero.tick()   # animate jump/fall

hero.attack("goblin")
hero.attack_strategy = MagicAttack()
hero.attack("dragon")
```

Each pattern solves a distinct concern: State handles behavior-per-state, Command encodes actions, Observer informs the UI, Strategy swaps attacks. Together, they form a clean architecture for a game character.

---

## 15. Self-Assessment Test

<details>

**Q1.** When would you pick Chain of Responsibility over a giant `if/elif` dispatch?

<br>

**Answer:** When (a) the set of handlers is dynamic or needs to be reconfigured at runtime, (b) handlers represent a logical hierarchy (escalation, priority), (c) a request may be handled by any one handler but you want to decouple the sender from knowing who, or (d) new handlers will be added over time. A static `if/elif` is fine for stable, small dispatches.

---

**Q2.** What problem does Command solve that a regular method call cannot?

<br>

**Answer:** A method call is transient — it happens and disappears. A Command is an *object*: it can be stored in a list (queuing), serialized (persisting), inspected (logging), executed later (scheduling), or reversed (undo). Essentially, Command turns invocations into first-class, manipulable entities.

---

**Q3.** What's the difference between Observer and Mediator?

<br>

**Answer:** Observer is about *one-to-many notifications* — a subject broadcasts changes to passive subscribers. Mediator is about *coordinating many peers* — objects interact through a central hub rather than directly with each other. Mediator often *uses* Observer internally, but its intent is about peer coordination, not change propagation.

---

**Q4.** When do you use State and when do you use Strategy?

<br>

**Answer:**
- **State** — behavior changes *automatically* based on an object's internal state transitions driven by events. The object "becomes" different over time.
- **Strategy** — behavior is *chosen* by an external client upfront; the object doesn't transition by itself.
Both look structurally similar (inject an object that encapsulates behavior). The intent distinguishes them.

---

**Q5.** What's "double dispatch" in Visitor, and why is it necessary?

<br>

**Answer:** Regular method dispatch in most OOP languages (Python included) is *single dispatch* — the method resolved depends only on the receiver's type. Visitor needs dispatch on *two* types (the element AND the visitor). The `element.accept(visitor)` → `visitor.visit_X(element)` indirection achieves double dispatch manually, ensuring the right visitor method is called for the right element type.

---

**Q6.** Why is Memento superior to just copying an object's state?

<br>

**Answer:** Memento preserves encapsulation. External code doesn't read the object's internal fields directly — it just holds an opaque memento. The original object controls what's captured and how it's restored, so implementation details can change without breaking external code. Plain state copying tends to leak internals.

---

**Q7.** Identify the pattern: "Subscribers register with a publisher; when the publisher changes, all subscribers are notified automatically."

<br>

**Answer:** Observer.

---

**Q8.** Identify the pattern: "Different algorithms for the same task, each wrapped in a class, selectable at runtime."

<br>

**Answer:** Strategy.

---

**Q9.** Why would you use Template Method instead of Strategy?

<br>

**Answer:** When the algorithm's *overall structure* is truly fixed and only a few *specific steps* vary. Template Method uses inheritance — the parent owns the skeleton, children fill in blanks. Strategy uses composition — the client swaps out the whole algorithm. If most of the algorithm repeats and only small parts differ, Template Method avoids duplication. If entire algorithms vary freely, Strategy is more flexible.

---

**Q10.** What's a major downside of Visitor?

<br>

**Answer:** Adding a new *element type* to the structure forces every existing visitor to implement a method for it. This is the "Expression Problem": Visitor makes adding operations cheap but adding element types expensive. Use Visitor when your element set is stable and operations evolve; use plain methods-on-elements when operations are stable and elements evolve.

---

**Q11.** Why does Python often make Iterator almost invisible?

<br>

**Answer:** Because Python bakes iteration into the language: `__iter__` + `__next__` are first-class protocols, and `yield` (generators) lets you write an iterator in a few lines without a formal class. The GoF's full Iterator class hierarchy is replaced by `def method(self): yield ...`. The pattern is everywhere in Python, just not visible as a "pattern."

---

**Q12.** A colleague replaces Observer with a direct method call "for simplicity." When is this actually fine?

<br>

**Answer:** When (a) there's exactly one consumer of the event, (b) that consumer is stable (won't change), (c) the consumer is intimately related to the publisher (not independent), and (d) there's no plausible future need for additional consumers. If any of these might not hold, Observer's decoupling is worth the small overhead.

---

**Q13.** Can Command be used without undo? Give an example.

<br>

**Answer:** Yes. Undo is one common *reason* for Command, but not the only one. Commands can be used purely for queuing (background job systems like Celery), logging (audit trails), macro recording, remote execution (RPC), or simply to decouple the invoker from the receiver. Many Command implementations don't have `undo()` at all.

---

**Q14.** Why are Flyweight objects usually Singletons in practice?

<br>

**Answer:** (Cross-family question.) Flyweight shares intrinsic state. A factory typically creates one Flyweight per unique intrinsic configuration and reuses it. That "one per config" is singleton-like. They're not identical patterns — Flyweight is about many shared instances across configs, Singleton is about exactly one instance — but concrete Flyweights often behave like singletons in practice.

---

**Q15.** You have a 5-state workflow with complex transition rules. Should you use State, or a dictionary-based state machine?

<br>

**Answer:** Depends on complexity. For a simple state machine with straightforward transitions, a dict of `{(current_state, event): new_state}` is fine — and often clearer than a dozen State classes. For complex per-state behavior (different operations, entry/exit actions, rich logic within each state), the State pattern's cohesion pays off. Use judgment: prefer simpler approaches when sufficient.

</details>

---

## 16. Final Words — All 23 Patterns at a Glance

Congratulations — you've now studied all 23 classical GoF patterns across three families.

### The Complete Roster

**Creational (5)** — *how we create objects*
1. Singleton
2. Factory Method
3. Abstract Factory
4. Builder
5. Prototype

**Structural (7)** — *how we compose objects*
6. Adapter
7. Bridge
8. Composite
9. Decorator
10. Facade
11. Flyweight
12. Proxy

**Behavioral (11)** — *how objects collaborate and distribute responsibility*
13. Chain of Responsibility
14. Command
15. Interpreter
16. Iterator
17. Mediator
18. Memento
19. Observer
20. State
21. Strategy
22. Template Method
23. Visitor

### The Arc You've Traveled

- **OOP** gave you the raw materials: classes, inheritance, polymorphism, abstraction.
- **SOLID** gave you the architectural principles: how to arrange those materials so the system welcomes change.
- **Design Patterns** gave you the vocabulary of recurring solutions: recognizable shapes that apply SOLID concretely.

Notice how it all flows together. Nearly every pattern is a concrete embodiment of SOLID:
- Strategy, Observer, Chain, State, Decorator — all textbook OCP + DIP.
- Visitor — strong OCP for operations.
- Adapter, Facade, Bridge, Proxy — DIP through careful abstraction.
- Template Method — SRP + OCP through the Hollywood principle.
- Builder, Factory — SRP for construction logic.

### Final Principles for Pattern Mastery

1. **Patterns are a vocabulary, not a toolkit.** You don't go hunting for chances to "use a pattern." You recognize a design pain, recall a pattern that addresses it, and apply it judiciously.

2. **Pattern names are communication shortcuts.** Saying "let's use Observer here" conveys structure, intent, and tradeoffs in two words. Learn the names so you can communicate with other designers.

3. **Implementation varies wildly by language and situation.** The GoF book's Java-centric implementations are one of many. Python's generators make Iterator trivial. First-class functions simplify Strategy and Command. Decorators-the-syntax relate to Decorator-the-pattern. Always ask: what's the most idiomatic expression of this pattern in my language?

4. **Recognize when you're using patterns without naming them.** Django middleware is Chain of Responsibility. Flask's route decorators are Decorator (the pattern) + Decorator (the syntax). SQLAlchemy sessions are a Unit of Work + Identity Map. Python context managers are Template Method. Once you know the names, you see them everywhere.

5. **Combine patterns freely.** Real systems are rarely "just one pattern." A web app uses Facade (request handlers) + Chain of Responsibility (middleware) + Strategy (auth, serialization) + Command (background jobs) + Observer (signals) + Iterator (querysets) + all woven together.

6. **Not every problem needs a pattern.** Simple code is often just simple code. Patterns shine when you feel genuine pain from change, rigidity, or coupling. Premature pattern application is its own anti-pattern.

### What's Next

You now have a strong foundation in low-level design. From here, you can explore:

- **Architectural patterns** (MVC, MVVM, Clean Architecture, Hexagonal Architecture) — larger-scale structure.
- **Concurrency patterns** (Actor, Reactor, Producer-Consumer, Future/Promise).
- **Distributed system patterns** (Saga, CQRS, Event Sourcing, Circuit Breaker).
- **Domain-Driven Design** — modeling business problems in code.
- **Refactoring catalogs** (Fowler's *Refactoring*) — how to evolve designs toward patterns over time.

These build on the same foundation: classes, SOLID, and patterns.

Great design isn't about knowing every pattern. It's about **understanding the forces** that patterns respond to — coupling, duplication, rigidity, change — and using the right tool, at the right moment, with the right judgment.

You now have that judgment. Go build.

---

*This content is part of **Codeverra** — a platform for learning coding, data science, DSA, and AI from scratch. Explore more: https://codeverra.com*
