---
title: "Python Learning Roadmap"
description: "A structured roadmap to learning Python from scratch to advanced — what to learn, in what order, and why."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
  - learning-roadmap
---

# Python Learning Roadmap
### The Complete Codeverra Curriculum -- Your Navigation Hub

---

> This document is the master index for everything published at Codeverra.
> Every blog, masterclass, and practice workbook links back here.
> Bookmark this page. Return to it whenever you finish a topic and want to know what is next.

---

## How to Use This Roadmap

The curriculum is divided into four phases. Each phase builds on the previous one.

- Do not skip phases. A student who rushes into Pandas without knowing loops and functions will struggle badly.
- Each topic has a blog (concept explanation), a practice workbook (questions), and a solutions file.
- The estimated time per phase assumes consistent practice of 1 to 2 hours per day.

---

## Phase 1 -- Python Foundations
### Estimated time: 4 to 6 weeks

This is where everything starts. Master these before touching any library or framework.
Every data scientist, backend engineer, ML engineer, and data engineer uses these concepts every day.

---

### 1.1 Python Basics

**What you will learn:**
How Python works, variables, all basic data types (int, float, bool, None), the complete string reference (all methods, slicing, formatting), operators (arithmetic, comparison, logical, membership, identity, bitwise), type conversion, input/output, and f-strings.

**Why it matters:**
Everything else in Python is built on these primitives. You cannot understand a list until you understand what a variable is. You cannot understand Pandas until you understand strings.

| Resource | Description |
|---|---|
| 01_python_basics.md | Full masterclass covering all concepts with Indian-context examples |
| Practice questions | 18 questions -- Easy to Hard -- with full solutions in the same file |

**Key concepts checklist:**
- Variables and dynamic typing
- int, float, complex and the math module
- Strings -- creation, indexing, slicing, all methods
- Booleans and truthiness
- None and its correct usage
- All operator types and precedence
- Type conversion -- implicit and explicit
- print() and input() in depth
- f-strings and number formatting

---

### 1.2 Control Flow

**What you will learn:**
if, elif, else conditionals. Nested conditions. The ternary (one-line if). match-case (Python 3.10+).

**Why it matters:**
Programs that cannot make decisions cannot do anything useful. Control flow is how you add logic.

| Resource | Description |
|---|---|
| 02_control_flow.md | Coming soon |

**Key concepts checklist:**
- if, elif, else syntax and indentation
- Nested conditionals
- One-line ternary: `value = a if condition else b`
- match-case statement (Python 3.10+)
- Common patterns: guard clauses, early returns

---

### 1.3 Loops

**What you will learn:**
for loops, while loops, range(), break, continue, pass, else on loops, enumerate(), zip(), nested loops, list comprehensions, dictionary and set comprehensions.

**Why it matters:**
Loops are how you process collections of data. Everything in data science involves iterating over rows, columns, lists, and dictionaries.

| Resource | Description |
|---|---|
| 03_loops.md | Full masterclass -- 18 sections |
| loops_practice_solutions.md | 20 practice questions with full solutions |

**Key concepts checklist:**
- for loop over all iterable types
- while loop and when to use it
- break vs continue vs pass
- else on for and while
- enumerate() and zip()
- Nested loops and performance intuition
- List, dict, and set comprehensions

---

### 1.4 Python Collections

**What you will learn:**
List, Tuple, Dictionary, Set -- all methods, operations, and patterns. When to use each one.

**Why it matters:**
Collections are how you store and organise data in Python. Pandas DataFrames are built on top of these. SQL results come back as lists of dictionaries. APIs return JSON which becomes nested dicts and lists.

| Resource | Description |
|---|---|
| 04_collections.md | Full masterclass with strings, lists, tuples, dicts, sets |
| collections_practice.md | 40+ questions across all 5 collection types with solutions |

**Key concepts checklist:**
- List: indexing, slicing, all methods, nested lists, comprehensions
- Tuple: immutability, unpacking, namedtuple, as dict keys
- Dictionary: all methods, nested dicts, dict comprehensions, merging
- Set: operations (union, intersection, difference, symmetric difference), frozenset
- String: (covered in 1.1) -- fits here too as a sequence type
- When to use which collection

---

## Phase 2 -- Core Python
### Estimated time: 4 to 6 weeks

With foundations in place, you now learn the tools that professional Python developers use every day.

---

### 2.1 Functions

**What you will learn:**
Defining functions, parameters and arguments, default values, *args and **kwargs, return values, scope and the LEGB rule, global and nonlocal, lambda functions, higher order functions, map/filter/reduce, closures, decorators, recursion, and generator functions.

**Why it matters:**
Functions are how you organise code. Decorators are used in every web framework. Closures underpin many design patterns. Generators are essential for processing large datasets efficiently.

| Resource | Description |
|---|---|
| 05_functions.md | Full masterclass -- 23 sections covering all concepts |
| functions_practice_solutions.md | 20 practice questions with full solutions |

**Key concepts checklist:**
- def, parameters, arguments, return values
- Default parameters and the mutable default trap
- *args and **kwargs
- Keyword-only and positional-only parameters
- LEGB scope rule
- global and nonlocal
- Docstrings and type annotations
- Lambda functions
- Higher order functions
- map(), filter(), reduce()
- Closures and function factories
- Decorators with @syntax and functools.wraps
- Decorators with arguments
- Chaining decorators
- Recursion and the base case
- Generator functions and yield

---

### 2.2 Exception Handling

**What you will learn:**
try, except, else, finally, raise, custom exceptions, exception hierarchy.

**Why it matters:**
Real programs fail. Exception handling is how you make programs fail gracefully instead of crashing and losing data.

| Resource | Description |
|---|---|
| 06_exceptions.md | Coming soon |

**Key concepts checklist:**
- try, except, else, finally
- Catching specific exceptions vs bare except
- Raising exceptions with raise
- Creating custom exception classes
- Exception chaining
- Context managers and the with statement

---

### 2.3 File Handling

**What you will learn:**
Reading and writing text files, CSV files, JSON files, the with statement, file modes, pathlib.

**Why it matters:**
All real data lives in files. Before you learn Pandas, you need to understand what a file actually is and how Python reads it.

| Resource | Description |
|---|---|
| 07_file_handling.md | Coming soon |

**Key concepts checklist:**
- open(), read(), write(), close()
- The with statement and why it matters
- File modes: r, w, a, rb, wb
- Reading line by line
- Reading and writing CSV manually
- Reading and writing JSON with the json module
- pathlib for modern path handling

---

### 2.4 Modules and Packages

**What you will learn:**
import statement, creating your own modules, pip, virtual environments, the standard library.

**Why it matters:**
Every Python project you work on will use external libraries. Understanding how imports and packages work prevents confusing errors and makes you self-sufficient.

| Resource | Description |
|---|---|
| 08_modules.md | Coming soon |

**Key concepts checklist:**
- import, from ... import, import ... as
- Creating your own module
- __name__ == "__main__"
- pip install and requirements.txt
- Virtual environments (venv)
- Key standard library modules: os, sys, datetime, collections, itertools, functools

---

### 2.5 Object-Oriented Programming

**What you will learn:**
Classes, objects, __init__, instance vs class variables, methods, inheritance, encapsulation, polymorphism, special (dunder) methods.

**Why it matters:**
Every Python library you use (Pandas, Scikit-learn, Django, FastAPI) is built with classes. You do not need to build complex class hierarchies in everyday data work, but you need to understand what an object is, what methods are, and why `df.groupby("city")` works.

| Resource | Description |
|---|---|
| 09_oop.md | Coming soon |

**Key concepts checklist:**
- class keyword and __init__
- self and instance attributes
- Instance methods, class methods, static methods
- Inheritance and super()
- Method overriding
- Encapsulation with _ and __
- Dunder methods: __str__, __repr__, __len__, __eq__, __lt__
- Properties with @property
- Dataclasses (Python 3.7+)

---

## Phase 3 -- Data Tools
### Estimated time: 6 to 10 weeks

This is where Python connects to real-world data work. These are the libraries used by data analysts, data scientists, and ML engineers every day.

---

### 3.1 NumPy

**What you will learn:**
N-dimensional arrays, all array operations, indexing and slicing, boolean masking, broadcasting, universal functions, aggregations, linear algebra, random number generation, saving and loading arrays.

**Why it matters:**
NumPy is the foundation of every numerical computing library in Python. Pandas, Scikit-learn, TensorFlow, and PyTorch all use NumPy arrays underneath.

| Resource | Description |
|---|---|
| numpy_masterclass.md | Full masterclass -- 19 sections with 15 practice questions |
| numpy_masterclass.md (Section 20) | Full solutions to all 15 questions |

**Key concepts checklist:**
- ndarray creation and data types
- Indexing, slicing, fancy indexing
- Boolean masking and np.where
- Array math -- element-wise and axis-based
- Universal functions (ufuncs)
- Aggregation: sum, mean, std, min, max along axes
- Reshaping, transpose, stacking, splitting
- Broadcasting rules
- Random number generation with np.random
- Linear algebra: dot, inv, solve, eig
- Sorting and searching
- Copies vs views

---

### 3.2 Pandas

**What you will learn:**
Series and DataFrame, reading/writing data, exploring datasets, selecting and filtering, adding and modifying columns, handling missing data, string operations, datetime operations, apply/map, GroupBy, merging and joining, pivot tables, reshaping, and performance tips.

**Why it matters:**
Pandas is the primary tool for data manipulation in Python. Every data analyst and data scientist uses it daily. It is the bridge between raw data and analysis.

| Resource | Description |
|---|---|
| pandas_masterclass.md | Full masterclass -- 22 sections with 13 practice questions |
| pandas_masterclass.md (Section 23) | Full solutions to all 13 questions |

**Key concepts checklist:**
- Series and DataFrame -- creation and structure
- read_csv, read_excel, read_json, read_sql
- head, tail, info, describe, value_counts
- loc and iloc -- label vs position indexing
- Boolean filtering, isin, between, query
- Adding, renaming, dropping columns
- Sorting values and index
- Handling missing data -- dropna, fillna, interpolate
- String operations with .str accessor
- Datetime operations with .dt accessor
- apply(), map(), DataFrame.map()
- GroupBy -- agg, transform, filter
- merge() -- all four join types
- concat() for stacking
- pivot_table and crosstab
- melt() and stack/unstack
- Category dtype for memory efficiency

---

### 3.3 Matplotlib

**What you will learn:**
The full Matplotlib API -- every major chart type (line, bar, scatter, histogram, pie, box, heatmap, area), all customisations (colours, typography, axes, grid, spines, legend, annotations), subplots and gridspec, saving figures, and a complete dataset analysis project.

**Why it matters:**
Every chart you will ever present -- in a report, a notebook, a dashboard -- will be built on Matplotlib, even if you use Seaborn or Pandas .plot() on top of it.

| Resource | Description |
|---|---|
| matplotlib_masterclass.md | Full masterclass -- 19 sections with 15 practice questions and solutions |

**Key concepts checklist:**
- Figure and Axes -- the two-object model
- pyplot vs object-oriented interface
- Line, bar, horizontal bar, scatter, histogram, pie, box, heatmap, area charts
- Subplots with nrows/ncols and gridspec
- All customisation options -- colour, font, ticks, grid, spines, legend
- Annotations and reference lines
- Colour maps
- Saving at print quality

---

### 3.4 Seaborn

**What you will learn:**
All Seaborn plot types (lineplot, barplot, countplot, histplot, kdeplot, ecdfplot, boxplot, violinplot, stripplot, swarmplot, boxenplot, pointplot, scatterplot, regplot, heatmap, pairplot, FacetGrid, catplot, lmplot), themes, palettes, axes-level vs figure-level API, and combining with Matplotlib.

**Why it matters:**
Seaborn produces statistical charts -- confidence intervals, regression lines, density curves -- with much less code than Matplotlib. It is the standard for exploratory data analysis.

| Resource | Description |
|---|---|
| seaborn_masterclass.md | Full masterclass -- 26 sections with 15 practice questions and solutions |

**Key concepts checklist:**
- Axes-level vs figure-level functions
- Statistical aggregation built into plots
- hue, size, style for multi-dimensional encoding
- FacetGrid for automatic subplot grids
- All distribution plots -- hist, kde, ecdf
- All categorical plots -- box, violin, strip, point, bar
- Regression plots -- regplot, lmplot
- Heatmaps and pairplots
- Themes, styles, contexts, palettes

---

### 3.5 SQL with Python

**What you will learn:**
SQL fundamentals, all query types, joins, aggregations, window functions, connecting Python to databases with SQLAlchemy, using pandas with SQL, and working with real Kaggle datasets.

**Why it matters:**
Most data in the world lives in relational databases. SQL is the language of data. Every data analyst, data scientist, and data engineer needs it. Python and SQL together are far more powerful than either alone.

| Resource | Description |
|---|---|
| SQL with Python course | Modules 1-3 available at learn.codeverra.com |

**Key concepts checklist:**
- SELECT, WHERE, ORDER BY, LIMIT
- Aggregate functions: COUNT, SUM, AVG, MIN, MAX
- GROUP BY and HAVING
- All JOIN types: INNER, LEFT, RIGHT, FULL OUTER
- Subqueries and CTEs
- Window functions: ROW_NUMBER, RANK, LAG, LEAD
- Connecting Python to SQLite, PostgreSQL
- pd.read_sql() and df.to_sql()
- Real dataset analysis with IPL, Zomato, Kaggle data

---

## Phase 4 -- Specialisation
### Estimated time: 3 to 12 months depending on path

After completing Phases 1-3, you have enough to choose a direction. Each path below builds on the same core. Pick the one that aligns with your goal.

---

### Path A -- Data Analyst

**Goal:** Turn raw data into business decisions. Build reports, dashboards, and data stories.

**Core additional skills:**
- Advanced Pandas and SQL
- Statistical thinking: distributions, hypothesis testing, correlation
- Matplotlib and Seaborn for storytelling charts
- Power BI or Tableau for business dashboards
- Excel integration with openpyxl

**Typical first job titles:** Data Analyst, Business Analyst, Analytics Engineer

---

### Path B -- Data Scientist

**Goal:** Build predictive models and extract deeper insight from data.

**Core additional skills:**
- Statistics: probability, distributions, inference, regression
- Scikit-learn: preprocessing, model training, evaluation, pipelines
- Feature engineering
- Model selection and cross-validation
- Experiment design and A/B testing
- Plotly for interactive visualisation

**Typical first job titles:** Data Scientist, ML Researcher (junior), Analyst

---

### Path C -- Machine Learning Engineer

**Goal:** Build, train, and deploy machine learning models at scale in production.

**Core additional skills:**
- Deep learning with PyTorch or TensorFlow
- MLflow for experiment tracking
- Docker and containerisation
- FastAPI for model serving
- Cloud platforms: AWS SageMaker, GCP Vertex AI, Azure ML
- MLOps: CI/CD for ML pipelines

**Typical first job titles:** ML Engineer, Applied Scientist, AI Engineer

---

### Path D -- AI / LLM Engineer

**Goal:** Build applications powered by large language models. One of the fastest-growing roles as of 2024.

**Core additional skills:**
- LangChain and LlamaIndex
- OpenAI, Anthropic, and open-source model APIs
- Retrieval-Augmented Generation (RAG)
- Vector databases: Pinecone, Chroma, Weaviate
- Prompt engineering and evaluation
- Fine-tuning with PEFT and LoRA
- FastAPI for building LLM-powered APIs

**Typical first job titles:** LLM Engineer, AI Engineer, Prompt Engineer

---

### Path E -- Backend Engineer

**Goal:** Build the APIs and server-side logic that power web and mobile applications.

**Core additional skills:**
- FastAPI or Django for web frameworks
- Pydantic for data validation
- PostgreSQL and Redis
- SQLAlchemy ORM
- Docker and docker-compose
- REST API design
- Authentication: JWT, OAuth 2.0
- Deployment: Linux, Nginx, cloud platforms

**Typical first job titles:** Backend Engineer, Python Developer, API Developer

---

### Path F -- Data Engineer

**Goal:** Build the pipelines that move, transform, and store data at scale.

**Core additional skills:**
- Apache Spark with PySpark
- Apache Airflow for pipeline orchestration
- dbt for data transformation
- Apache Kafka for streaming
- Cloud data warehouses: BigQuery, Redshift, Snowflake
- ETL pipeline design patterns
- SQL at scale

**Typical first job titles:** Data Engineer, Analytics Engineer, Pipeline Engineer

---

## Curriculum Progress Tracker

Use this table to track what you have completed.

| # | Topic | Blog | Practice | Status |
|---|---|---|---|---|
| 1.1 | Python Basics | 01_python_basics.md | In blog | |
| 1.2 | Control Flow | 02_control_flow.md | Coming soon | |
| 1.3 | Loops | 03_loops.md | loops_practice_solutions.md | |
| 1.4 | Collections | 04_collections.md | collections_practice.md | |
| 2.1 | Functions | 05_functions.md | functions_practice_solutions.md | |
| 2.2 | Exception Handling | 06_exceptions.md | Coming soon | |
| 2.3 | File Handling | 07_file_handling.md | Coming soon | |
| 2.4 | Modules and Packages | 08_modules.md | Coming soon | |
| 2.5 | OOP | 09_oop.md | Coming soon | |
| 3.1 | NumPy | numpy_masterclass.md | In masterclass | |
| 3.2 | Pandas | pandas_masterclass.md | In masterclass | |
| 3.3 | Matplotlib | matplotlib_masterclass.md | In masterclass | |
| 3.4 | Seaborn | seaborn_masterclass.md | In masterclass | |
| 3.5 | SQL with Python | learn.codeverra.com | Course exercises | |

---

## How Long Will This Take?

| Phase | Consistent learner (1-2 hrs/day) | Intensive learner (4+ hrs/day) |
|---|---|---|
| Phase 1 | 4 to 6 weeks | 2 to 3 weeks |
| Phase 2 | 4 to 6 weeks | 2 to 3 weeks |
| Phase 3 | 6 to 10 weeks | 3 to 5 weeks |
| Phase 4 | 3 to 12 months | 2 to 6 months |
| Total to first job | 6 to 18 months | 4 to 12 months |

The range is wide because it depends on your starting point, how much you practice, and the quality of your projects. The most important variable is not how many tutorials you watch -- it is how many problems you solve yourself.

---

## The Most Important Advice on This Page

Reading a tutorial and understanding it feels like learning. It is not. Real learning only happens when you sit down with a blank file and build something from memory.

After every blog post, close it and try to reproduce the key examples from scratch. After every section, solve the practice questions before reading the solutions. After every phase, build a small project that uses everything you learned.

The students who finish this curriculum in 6 months are not more intelligent. They practice more consistently and they build things.

---

*Made with care for Codeverra learners | codeverra.com | learn.codeverra.com*
