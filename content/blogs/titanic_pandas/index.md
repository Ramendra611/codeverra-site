---
title: "Practice Pandas on Titanic Dataset"
description: "Master data analysis in Python using the pandas library using hands on practice on Titanic dataset"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python
  - data-analysis
  - pandas

cover:
  image: "/images/blog-images/binary-search.jpg"
  alt: "Binary search algorithm"
  caption: "Data Analysis using Python"
  relative: true
  hidden: false
---


# Pandas Practice Sheet — Titanic Dataset
### 20 Questions from Zero to Advanced, with Full Solutions

---

## Getting the Dataset

The Titanic dataset is hosted publicly and can be loaded directly into pandas — no download needed.

**Direct CSV URL (no login required):**
```
https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv
```

**Load it in one line:**
```python
import pandas as pd

df = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")
```

**Or load via seaborn (also free, slightly different column names):**
```python
import seaborn as sns
df = sns.load_dataset("titanic")
```

> We'll use the datasciencedojo version throughout this sheet. Always run `df.head()` and `df.info()` before answering any question — knowing your data is half the battle.

---

## Column Dictionary

Before writing a single line of pandas, understand what every column means.

```
┌─────────────────┬──────────┬──────────────────────────────────────────────────────┐
│ Column          │ Type     │ Meaning                                              │
├─────────────────┼──────────┼──────────────────────────────────────────────────────┤
│ PassengerId     │ int      │ Unique ID for each passenger (1–891)                 │
│ Survived        │ int      │ 0 = Did not survive, 1 = Survived                   │
│ Pclass          │ int      │ Ticket class: 1 = First, 2 = Second, 3 = Third      │
│ Name            │ string   │ Full name including title (Mr., Mrs., Miss., etc.)   │
│ Sex             │ string   │ "male" or "female"                                   │
│ Age             │ float    │ Age in years. ~177 values are missing (NaN)          │
│ SibSp           │ int      │ # of siblings + spouses aboard                      │
│ Parch           │ int      │ # of parents + children aboard                      │
│ Ticket          │ string   │ Ticket number (mostly irrelevant for analysis)       │
│ Fare            │ float    │ Ticket price in British pounds                       │
│ Cabin           │ string   │ Cabin number. ~687 values are missing                │
│ Embarked        │ string   │ Port of embarkation: S=Southampton, C=Cherbourg,    │
│                 │          │ Q=Queenstown. 2 values missing.                      │
└─────────────────┴──────────┴──────────────────────────────────────────────────────┘
```

**Key facts to keep in your head:**
- 891 rows total (training set — not all passengers)
- `Survived` is the target column (1 = survived)
- `Age` and `Cabin` have significant missing values
- `Pclass` is stored as an integer but is a categorical variable

---

## Setup Block

Run this at the top of every notebook. We will reference `df` throughout.

```python
import pandas as pd
import numpy as np

df = pd.read_csv(
    "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
)

# Quick sanity check
print(df.shape)       # (891, 12)
print(df.dtypes)
print(df.isnull().sum())
```

---

---

# LEVEL 1 — Basics (Questions 1–5)
### Core selection, filtering, and summary statistics

---

## Question 1
### How many passengers are in the dataset, and what does the data look like?

**Concepts:** `shape`, `head()`, `tail()`, `info()`, `describe()`

This is always Question 0 in any real data project. Never skip it.

---

### Answer

```python
# --- Shape: rows and columns ---
print(df.shape)
# (891, 12)  → 891 passengers, 12 columns

# --- First 5 rows ---
print(df.head())

# --- Last 5 rows ---
print(df.tail())

# --- Data types and non-null counts ---
df.info()
# Tells you: dtype per column, how many non-null values exist
# Key insight: Age has 714/891 non-null → 177 missing
#              Cabin has only 204/891 non-null → 687 missing!

# --- Statistical summary for numeric columns ---
print(df.describe())
# count, mean, std, min, 25%, 50%, 75%, max for each numeric column

# --- Include all columns (including object/string types) ---
print(df.describe(include="all"))
# Adds: unique, top (most frequent), freq (frequency of top) for string columns
```

**What to read from `describe()`:**
- `Age` mean ≈ 29.7 but median (50%) ≈ 28 → slight right skew
- `Fare` max is 512 but 75th percentile is only 31 → massive outliers
- `Survived` mean ≈ 0.38 → only 38% of passengers survived

---

## Question 2
### How many passengers survived, and what is the overall survival rate?

**Concepts:** `value_counts()`, `value_counts(normalize=True)`, boolean filtering, `mean()`

---

### Answer

**Method 1 — `value_counts()` for raw counts**
```python
print(df["Survived"].value_counts())
# 0    549   (did not survive)
# 1    342   (survived)
```

**Method 2 — `value_counts(normalize=True)` for proportions**
```python
print(df["Survived"].value_counts(normalize=True).round(3))
# 0    0.616
# 1    0.384
# Interpretation: 38.4% survived, 61.6% did not
```

**Method 3 — `mean()` on a binary column (cleanest for survival rate)**
```python
survival_rate = df["Survived"].mean()
print(f"Survival rate: {survival_rate:.1%}")
# Survival rate: 38.4%
```

> **Why does `mean()` work here?** Because `Survived` is 0 or 1. The average of a binary column is identical to the proportion of 1s. This trick is idiomatic pandas and much cleaner than dividing counts manually.

**Method 4 — Boolean filter to count survivors directly**
```python
survivors     = df[df["Survived"] == 1]
non_survivors = df[df["Survived"] == 0]

print(f"Survived:     {len(survivors)}")     # 342
print(f"Did not:      {len(non_survivors)}")  # 549
print(f"Total:        {len(df)}")             # 891
```

> **Tradeoff:** `value_counts()` is great for a quick count of each category. `mean()` is the one-liner for a rate. For larger workflows, `groupby` (coming later) scales better.

---

## Question 3
### What are the minimum, maximum, and average age of passengers? How many passengers have a missing age?

**Concepts:** `min()`, `max()`, `mean()`, `median()`, `isnull()`, `sum()`, `dropna()`

---

### Answer

```python
# Basic statistics on Age
print(f"Min age:    {df['Age'].min()}")          # 0.42  (infant)
print(f"Max age:    {df['Age'].max()}")          # 80.0
print(f"Mean age:   {df['Age'].mean():.2f}")     # 29.70
print(f"Median age: {df['Age'].median():.2f}")   # 28.00

# Missing age count
missing_age = df["Age"].isnull().sum()
total       = len(df)
print(f"Missing age: {missing_age} out of {total} ({missing_age/total:.1%})")
# Missing age: 177 out of 891 (19.9%)
```

**Method 2 — `describe()` gives everything at once**
```python
print(df["Age"].describe())
# count    714.000000   ← non-null count
# mean      29.699118
# std       14.526497
# min        0.420000
# 25%       20.125000
# 50%       28.000000
# 75%       38.000000
# max       80.000000
```

**Method 3 — `agg()` for custom summary in one call**
```python
print(df["Age"].agg(["min", "max", "mean", "median", "count"]))
```

> **Mean vs Median for Age:** Mean is 29.7, median is 28.0. They're close, meaning the age distribution is fairly symmetric. But when a column has outliers (like `Fare`), mean can be misleading — always check both.

> **Tradeoff on missing values:** `min()`, `max()`, `mean()` all skip NaN by default (`skipna=True`). This is convenient but means your statistics are computed on only 714 of 891 passengers. Always note this when reporting results.

---

## Question 4
### Select only the `Name`, `Sex`, `Age`, and `Survived` columns for passengers who are female.

**Concepts:** Column selection, boolean filtering, `loc[]`, `iloc[]`

---

### Answer

**Method 1 — Boolean filter then column selection (most readable)**
```python
female_passengers = df[df["Sex"] == "female"][["Name", "Sex", "Age", "Survived"]]
print(female_passengers.head(10))
```

**Method 2 — `loc[]` in one step (preferred — reads naturally as "rows, columns")**
```python
female_passengers = df.loc[
    df["Sex"] == "female",          # row condition
    ["Name", "Sex", "Age", "Survived"]   # columns to select
]
print(female_passengers.shape)   # (314, 4)
```

**Method 3 — `query()` for a SQL-like feel**
```python
female_passengers = df.query('Sex == "female"')[["Name", "Sex", "Age", "Survived"]]
```

> **`loc` vs `iloc`:**
> - `loc[row_label, col_label]` — selects by **label** (column name, index value)
> - `iloc[row_integer, col_integer]` — selects by **position** (0-based integers)
>
> Always prefer `loc` when filtering by condition. Use `iloc` when you need a specific row by position (e.g., `df.iloc[0]` for the first row).

> **Tradeoff — chained indexing pitfall:**
> `df[df["Sex"] == "female"]["Survived"] = 1` → This can silently fail with a `SettingWithCopyWarning`!
> Always use `loc` when **modifying** values:
> `df.loc[df["Sex"] == "female", "Survived"] = 1` → This is safe.

---

## Question 5
### How many passengers are in each passenger class (1st, 2nd, 3rd)?

**Concepts:** `value_counts()`, `groupby().size()`, `groupby().count()`

---

### Answer

**Method 1 — `value_counts()` (fastest for a single column)**
```python
print(df["Pclass"].value_counts().sort_index())
# 1    216
# 2    184
# 3    491
```

**Method 2 — `groupby().size()`**
```python
print(df.groupby("Pclass").size())
# Pclass
# 1    216
# 2    184
# 3    491
```

**Method 3 — `groupby().count()`**
```python
# .count() counts non-null values per column, not rows
# Different from .size() when columns have missing values!
print(df.groupby("Pclass")["PassengerId"].count())
```

> **`size()` vs `count()` — the critical difference:**
> - `size()` → counts ALL rows in the group, including those with NaN
> - `count()` → counts only NON-NULL values per column
>
> For counting rows in a group, always use `size()`. If you use `count()` on `Age`, you'll get 714 not 891 because of missing ages. Use `count()` only when you want "how many valid values exist in this column for this group."

```python
# Proof of the difference
print(df.groupby("Pclass").size())          # always 216, 184, 491
print(df.groupby("Pclass")["Age"].count())  # only non-null ages per class
# Pclass
# 1    186
# 2    173
# 3    355
```

---

---

# LEVEL 2 — Filtering & Grouping (Questions 6–10)
### Multi-condition filters, groupby aggregations, multiple aggregations

---

## Question 6
### What is the survival rate for male vs female passengers?

**Concepts:** `groupby()`, `agg()`, `mean()`, multiple columns in groupby

---

### Answer

**Method 1 — `groupby().mean()` on the Survived column**
```python
survival_by_sex = df.groupby("Sex")["Survived"].mean()
print(survival_by_sex)
# Sex
# female    0.742038
# male      0.188908
```

**Method 2 — `groupby().agg()` to get both count and rate together**
```python
survival_by_sex = df.groupby("Sex")["Survived"].agg(
    total_passengers="count",
    survivors="sum",
    survival_rate="mean"
)
print(survival_by_sex.round(3))
#         total_passengers  survivors  survival_rate
# female               314        233          0.742
# male                 577        109          0.189
```

**Method 3 — `value_counts()` crosstab style**
```python
print(df.groupby(["Sex", "Survived"]).size().unstack())
# Survived    0    1
# Sex
# female     81  233
# male      468  109
```

> **Insight:** Female passengers had a 74.2% survival rate vs only 18.9% for males — a massive difference reflecting the "women and children first" evacuation policy.

> **Note on `agg()` syntax:** The `agg(new_col_name="original_agg_func")` named aggregation syntax was introduced in pandas 0.25. It's the cleanest way to rename columns during aggregation. Before that, people used `.rename()` after the fact.

---

## Question 7
### What is the average fare paid by passengers in each class?

**Concepts:** `groupby()`, `agg()` with multiple functions, `round()`, sorting

---

### Answer

**Method 1 — Simple `groupby().mean()`**
```python
avg_fare = df.groupby("Pclass")["Fare"].mean().round(2)
print(avg_fare)
# Pclass
# 1    84.15
# 2    20.66
# 3    13.68
```

**Method 2 — Multiple aggregations using `agg()`**
```python
fare_stats = df.groupby("Pclass")["Fare"].agg(
    avg_fare="mean",
    median_fare="median",
    min_fare="min",
    max_fare="max",
    passengers="count"
).round(2)

print(fare_stats)
#         avg_fare  median_fare  min_fare   max_fare  passengers
# Pclass
# 1          84.15        60.29      0.00    512.33         216
# 2          20.66        14.25      0.00     73.50         184
# 3          13.68         8.05      0.00     69.55         491
```

> **Mean vs Median for Fare:** In Class 1, the mean is 84.15 but the median is only 60.29. That gap tells you there are some very expensive tickets pulling the mean up (max = 512!). The median is more representative here. Always compare both when dealing with potentially skewed distributions like prices or incomes.

**Method 3 — `agg()` with a list of functions (older but still common)**
```python
fare_stats = df.groupby("Pclass")["Fare"].agg(["mean", "median", "min", "max"])
# Column names will be 'mean', 'median', 'min', 'max' — use rename() to relabel
```

> **Tradeoff — named agg vs list agg:**
> - Named: `agg(avg="mean")` → clean column names immediately, self-documenting
> - List: `agg(["mean", "median"])` → simpler syntax but ugly default column names
> Prefer named aggregations in any code you'll share or read later.

---

## Question 8
### How many passengers survived AND did not survive, broken down by both Sex and Pclass?

**Concepts:** Multi-column `groupby()`, `unstack()`, `crosstab()`

---

### Answer

**Method 1 — `groupby()` on two columns + `size()` + `unstack()`**
```python
counts = df.groupby(["Pclass", "Sex", "Survived"]).size().unstack(fill_value=0)
print(counts)
# Survived         0    1
# Pclass Sex
# 1      female    3   91
#        male     77   45
# 2      female    6   70
#        male     91   17
# 3      female   72   72
#        male    300   47
```

**Method 2 — `pd.crosstab()` — the cleanest for cross-tabulations**
```python
ct = pd.crosstab(
    index=[df["Pclass"], df["Sex"]],
    columns=df["Survived"],
    margins=True,          # adds row/column totals
    margins_name="Total"
)
ct.columns = ["Did Not Survive", "Survived", "Total"]
print(ct)
```

**Method 3 — `pd.crosstab()` with `normalize` for proportions**
```python
# Row-wise proportions (survival rate per Pclass-Sex group)
ct_pct = pd.crosstab(
    index=[df["Pclass"], df["Sex"]],
    columns=df["Survived"],
    normalize="index"      # normalize across rows (sum of each row = 1)
).round(3)
ct_pct.columns = ["survival_rate_0", "survival_rate_1"]
print(ct_pct)
#                survival_rate_0  survival_rate_1
# Pclass Sex
# 1      female            0.032            0.968  ← 96.8% of 1st class women survived!
#        male              0.631            0.369
# 2      female            0.079            0.921
#        male               0.843            0.157
# 3      female            0.500            0.500
#        male               0.864            0.136
```

> **`groupby` vs `crosstab`:**
> - `groupby` is more flexible and works naturally in data pipelines
> - `crosstab` is more ergonomic for 2D frequency tables with labels
> - `crosstab` supports `normalize` directly — cleaner than doing `groupby().size() / groupby().size().sum()` manually
>
> For exploratory analysis, reach for `crosstab`. For production pipelines and chaining, use `groupby`.

---

## Question 9
### Find all passengers who were over 60 years old OR paid a fare over £100. How many are there, and how many survived?

**Concepts:** Multiple boolean conditions with `|` and `&`, `query()`, `sum()`, `mean()`

---

### Answer

**Method 1 — Boolean operators `|` (OR) and `&` (AND)**
```python
# IMPORTANT: Each condition must be wrapped in parentheses!
mask = (df["Age"] > 60) | (df["Fare"] > 100)
subset = df[mask]

print(f"Passengers matching criteria: {len(subset)}")
print(f"Survivors among them:         {subset['Survived'].sum()}")
print(f"Survival rate:                {subset['Survived'].mean():.1%}")
```

**Method 2 — `query()` — more readable for complex conditions**
```python
subset = df.query("Age > 60 or Fare > 100")
print(len(subset))
```

> **Query handles NaN differently:** `query("Age > 60")` silently drops rows where Age is NaN from the result — the same as boolean indexing. But the string syntax is cleaner for complex multi-condition filters.

**Adding an AND condition for comparison:**
```python
# Passengers who are BOTH old AND paid high fare
high_value = df[(df["Age"] > 60) & (df["Fare"] > 100)]
print(f"Old AND expensive passengers: {len(high_value)}")

# Very common mistake — using Python's `and`/`or` instead of `&`/`|`
# df[(df["Age"] > 60) and (df["Fare"] > 100)]  ← ValueError: ambiguous truth value!
# Always use & and | for element-wise comparison on Series
```

> **Tradeoff — `|`/`&` vs `query()`:**
> - `|`/`&` is faster on very large DataFrames and supports variables directly
> - `query()` is cleaner to read and write, especially for 3+ conditions
> - `query()` has limitations with column names containing spaces (use backticks: `df.query("column name > 5")` → `` df.query("`column name` > 5") ``)

---

## Question 10
### What is the survival rate for each combination of Pclass and Sex? Present it as a clean pivot table.

**Concepts:** `pivot_table()`, `aggfunc`, `margins`

---

### Answer

**Method 1 — `pd.pivot_table()` — the purpose-built tool**
```python
pivot = pd.pivot_table(
    df,
    values="Survived",      # the column to aggregate
    index="Pclass",         # rows
    columns="Sex",          # columns
    aggfunc="mean",         # how to aggregate
    margins=True,           # add row/column totals
    margins_name="Overall"
).round(3)

print(pivot)
# Sex     female   male  Overall
# Pclass
# 1        0.968  0.369    0.630
# 2        0.921  0.157    0.473
# 3        0.500  0.136    0.242
# Overall  0.742  0.189    0.384
```

**Method 2 — `groupby().unstack()` gives the same result**
```python
pivot2 = df.groupby(["Pclass", "Sex"])["Survived"].mean().unstack().round(3)
print(pivot2)
# Sex     female   male
# Pclass
# 1        0.968  0.369
# 2        0.921  0.157
# 3        0.500  0.136
```

**Method 3 — Multiple aggregation functions in `pivot_table()`**
```python
pivot_multi = pd.pivot_table(
    df,
    values="Survived",
    index="Pclass",
    columns="Sex",
    aggfunc=["mean", "count"]   # survival rate AND passenger count
).round(3)
print(pivot_multi)
```

> **`pivot_table` vs `groupby().unstack()`:**
> - `pivot_table` is more explicit, supports `margins`, `fill_value`, and multiple `aggfunc` directly
> - `groupby().unstack()` is more composable — easier to chain with other operations
> - If you're building a display table, use `pivot_table`. If you're continuing a transformation pipeline, use `groupby().unstack()`

> **What the pivot table reveals:** Class 1 females had a 96.8% survival rate. Class 3 males had only a 13.6% survival rate. The "Pclass" effect is dramatic and exists independently within both sexes.

---

---

# LEVEL 3 — Aggregation Depth (Questions 11–15)
### Multiple aggregations, transforms, and derived columns

---

## Question 11
### For each passenger class, compute: total passengers, number of survivors, survival rate, average age, and average fare — all in one query.

**Concepts:** Named multi-column `agg()`, `groupby()` on multiple metrics

---

### Answer

```python
class_summary = df.groupby("Pclass").agg(
    total_passengers  = ("PassengerId", "count"),
    survivors         = ("Survived",    "sum"),
    survival_rate     = ("Survived",    "mean"),
    avg_age           = ("Age",         "mean"),
    avg_fare          = ("Fare",        "mean"),
    median_fare       = ("Fare",        "median"),
).round(2)

print(class_summary)
#         total_passengers  survivors  survival_rate  avg_age  avg_fare  median_fare
# Pclass
# 1                    216        136           0.63    38.23     84.15        60.29
# 2                    184         87           0.47    29.88     20.66        14.25
# 3                    491        119           0.24    25.14     13.68         8.05
```

> **Named aggregation syntax — the right way:**
> `new_column_name = ("source_column", "aggregation_function")`
>
> This was introduced in pandas 0.25.0 and is now the recommended approach. It produces clean column names without needing `.rename()` afterwards.

**Bonus — adding a percentage column after the fact:**
```python
class_summary["pct_of_total"] = (
    class_summary["total_passengers"] / class_summary["total_passengers"].sum() * 100
).round(1)
print(class_summary["pct_of_total"])
# Pclass
# 1    24.2%
# 2    20.6%
# 3    55.1%
```

> **Insight:** Class 3 passengers made up 55% of all passengers but had only a 24% survival rate. Class 1 had 24% of passengers and a 63% survival rate. This directly reflects which decks lifeboats were accessible from.

---

## Question 12
### Create a new column called `FamilySize` (total family members aboard including the passenger). Then show the survival rate for each family size.

**Concepts:** Column creation, arithmetic on columns, `groupby()` on derived column

---

### Answer

```python
# FamilySize = SibSp (siblings/spouses) + Parch (parents/children) + 1 (self)
df["FamilySize"] = df["SibSp"] + df["Parch"] + 1

# Survival rate by family size
family_survival = df.groupby("FamilySize")["Survived"].agg(
    passengers    = "count",
    survival_rate = "mean"
).round(3)

print(family_survival)
#             passengers  survival_rate
# FamilySize
# 1                  537          0.304   ← traveling alone: 30.4% survival
# 2                  161          0.553
# 3                  102          0.578
# 4                   29          0.724   ← family of 4: best survival rate!
# 5                   15          0.200
# 6                   22          0.136
# 7                    12          0.333
# 8                    6          0.000   ← all large families died
# 11                   7          0.000
```

**Bonus — create a categorical `IsAlone` column:**
```python
df["IsAlone"] = (df["FamilySize"] == 1).astype(int)

print(df.groupby("IsAlone")["Survived"].mean().round(3))
# IsAlone
# 0    0.506   (traveling with family: 50.6% survival)
# 1    0.304   (traveling alone: 30.4% survival)
```

> **Column creation is fundamental pandas.** New columns from arithmetic operations are vectorized — they operate on the entire column at once, not row by row. Never use a `for` loop to create a new column. Use `df["new"] = df["a"] + df["b"]` instead.

> **Insight:** Traveling alone was actually the worst scenario. Small families (2–4) had the best survival rates. Very large families (7+) had 0% survival — possibly because they couldn't all get on the same lifeboat.

---

## Question 13
### Add a column `AgeBand` that bins passengers into age groups: Child (0–12), Teen (13–17), Adult (18–60), Senior (60+). What is the survival rate per age band?

**Concepts:** `pd.cut()`, custom bins and labels, handling NaN, `groupby()` on categorical

---

### Answer

```python
# Method 1 — pd.cut() with explicit bins and labels
df["AgeBand"] = pd.cut(
    df["Age"],
    bins   = [0, 12, 17, 60, 100],
    labels = ["Child", "Teen", "Adult", "Senior"],
    right  = True    # intervals are (left, right] — i.e., right-inclusive
)

# Survival rate per age band
age_survival = df.groupby("AgeBand", observed=True)["Survived"].agg(
    passengers    = "count",
    survivors     = "sum",
    survival_rate = "mean"
).round(3)

print(age_survival)
#          passengers  survivors  survival_rate
# AgeBand
# Child            69         40          0.580   ← children evacuated first
# Teen             55         27          0.491
# Adult           566        215          0.380
# Senior           24         11          0.458
```

> **`pd.cut()` vs `pd.qcut()`:**
> - `pd.cut()` → you define the bin **boundaries** (e.g., 0–12, 13–17...)
> - `pd.qcut()` → you define the number of **quantiles** (e.g., 4 equal-sized groups)
>
> Use `cut` when the boundaries are meaningful (age groups, score bands).
> Use `qcut` when you want equal-sized groups (quartiles, deciles).

```python
# Method 2 — pd.qcut() for equal-frequency bins
df["AgeBand_q"] = pd.qcut(df["Age"], q=4, labels=["Q1", "Q2", "Q3", "Q4"])
print(df.groupby("AgeBand_q", observed=True)["Survived"].mean().round(3))
```

> **Watch out for `observed=True`:** In newer pandas (2.0+), groupby on Categorical columns produces a FutureWarning if `observed` is not specified. Pass `observed=True` to only show categories that actually appear in the data.

**Handling passengers with missing Age:**
```python
# NaN Age → NaN AgeBand (they won't appear in groupby — they're silently excluded)
print(df["AgeBand"].isnull().sum())   # 177 — same count as missing Age
```

---

## Question 14
### Add a column showing each passenger's fare relative to the average fare in their class — i.e., how much more or less they paid vs their class average.

**Concepts:** `groupby().transform()` — the key concept that separates intermediate from advanced pandas users

---

### Answer

```python
# transform() broadcasts the group aggregate back to the original DataFrame index
# The result has the SAME shape as the original DataFrame — that's what makes it special

# Step 1: compute class-level average fare using transform
df["ClassAvgFare"] = df.groupby("Pclass")["Fare"].transform("mean")

# Step 2: compute how far each passenger's fare is from their class average
df["FareDiff"] = df["Fare"] - df["ClassAvgFare"]

# Step 3: verify it worked
print(df[["Pclass", "Fare", "ClassAvgFare", "FareDiff"]].head(10).round(2))
#    Pclass   Fare  ClassAvgFare  FareDiff
# 0       3   7.25         13.68     -6.43   ← paid 6.43 less than Class 3 avg
# 1       1  71.28         84.15    -12.87
# 2       3   7.93         13.68     -5.75
# 3       1  53.10         84.15    -31.05
# ...
```

**The transform() pattern explained:**
```python
# Without transform — result has one row per group (can't assign back to df)
df.groupby("Pclass")["Fare"].mean()
# Pclass
# 1    84.15   ← only 3 rows
# 2    20.66
# 3    13.68

# With transform — result has the same shape as the original (891 rows)
df.groupby("Pclass")["Fare"].transform("mean")
# 0    13.68   ← row 0 is Pclass 3 → gets 13.68
# 1    84.15   ← row 1 is Pclass 1 → gets 84.15
# 2    13.68
# 3    84.15
# ... (891 rows total)
```

**Real-world use cases for `transform()`:**
```python
# Normalize scores within groups (z-score)
df["FareZScore"] = df.groupby("Pclass")["Fare"].transform(
    lambda x: (x - x.mean()) / x.std()
)

# Fill NaN age with the median age of that passenger's class
df["AgeFilled"] = df["Age"].fillna(
    df.groupby("Pclass")["Age"].transform("median")
)

# Cumulative count within a group
df["RankInClass"] = df.groupby("Pclass")["Fare"].transform("rank", ascending=False)
```

> **`transform()` vs `apply()` vs `agg()`:**
> | Operation | Output shape | Use when... |
> |-----------|-------------|-------------|
> | `agg()` | One row per group | You want a summary table |
> | `transform()` | Same shape as input | You want to add a column back to the original df |
> | `apply()` | Flexible | Complex per-group logic that doesn't fit agg/transform |
>
> `transform()` is the right tool for creating new columns that depend on group-level statistics.

---

## Question 15
### Extract the passenger's title (Mr., Mrs., Miss., etc.) from the Name column and find the survival rate per title.

**Concepts:** `str.extract()`, regex, string operations on Series, `groupby()` on extracted column

---

### Answer

```python
# Every name follows the pattern: "Last, Title. First Middle"
# We want to extract the title using regex

# Step 1: Extract title
df["Title"] = df["Name"].str.extract(r",\s*([A-Za-z]+)\.")
# Regex: comma, optional spaces, then capture word characters, then a period

print(df["Title"].value_counts())
# Mr        517
# Miss      182
# Mrs       125
# Master     40
# Dr          7
# Rev         6
# Mlle        2
# ... (rare titles)

# Step 2: Consolidate rare titles
title_mapping = {
    "Mlle":     "Miss",
    "Ms":       "Miss",
    "Mme":      "Mrs",
    "Capt":     "Rare",
    "Col":      "Rare",
    "Major":    "Rare",
    "Jonkheer": "Rare",
    "Don":      "Rare",
    "Sir":      "Rare",
    "Countess": "Rare",
    "Lady":     "Rare",
    "Dr":       "Rare",
    "Rev":      "Rare",
}
df["Title"] = df["Title"].replace(title_mapping)

# Step 3: Survival rate per title
title_survival = df.groupby("Title")["Survived"].agg(
    count         = "count",
    survival_rate = "mean"
).round(3).sort_values("survival_rate", ascending=False)

print(title_survival)
#         count  survival_rate
# Mrs       125          0.792
# Miss      184          0.702
# Master     40          0.575
# Rare       23          0.347
# Mr        517          0.157
```

> **Why extract titles?** This is a classic feature engineering technique. The raw `Name` column looks useless, but the title inside it encodes gender, social class, and marital status simultaneously — all correlated with survival. `str.extract()` with a regex pattern is how you unlock that information.

> **`str.extract()` vs `str.split()` vs `str.findall()`:**
> - `str.extract(pattern)` → returns the first captured group as a new Series/DataFrame
> - `str.findall(pattern)` → returns a list of all matches
> - `str.split(pat)` → splits on a delimiter; good for simple cases
>
> Use `str.extract()` when the pattern is structured (like a title surrounded by specific characters).

---

---

# LEVEL 4 — Advanced (Questions 16–20)
### Window functions, complex transforms, multi-level operations, real-world workflows

---

## Question 16
### Rank passengers within each class by fare paid (highest fare = rank 1). Show the top 3 fare-payers in each class.

**Concepts:** `groupby().rank()`, `groupby().apply()`, `nlargest()`

---

### Answer

**Method 1 — `groupby().rank()` + filter**
```python
# rank() within each Pclass group
df["FareRankInClass"] = df.groupby("Pclass")["Fare"].rank(
    method    = "dense",       # ties get the same rank (no gaps)
    ascending = False          # highest fare = rank 1
)

# Top 3 fare-payers per class
top3 = df[df["FareRankInClass"] <= 3].sort_values(["Pclass", "FareRankInClass"])
print(top3[["Pclass", "Name", "Fare", "FareRankInClass", "Survived"]].to_string())
```

**Method 2 — `groupby().apply()` with `nlargest()`**
```python
top3_v2 = (
    df.groupby("Pclass")[["Name", "Fare", "Survived"]]
    .apply(lambda g: g.nlargest(3, "Fare"))
    .reset_index(drop=True)
)
print(top3_v2)
```

**Method 3 — `sort_values` + `groupby().head()`**
```python
top3_v3 = (
    df.sort_values("Fare", ascending=False)
      .groupby("Pclass")
      .head(3)
      [["Pclass", "Name", "Fare", "Survived"]]
      .sort_values(["Pclass", "Fare"], ascending=[True, False])
)
print(top3_v3)
```

> **`rank()` method options:**
> - `'average'` (default) → tied items share the average of their ranks
> - `'min'` → tied items all get the lowest rank
> - `'max'` → tied items all get the highest rank
> - `'dense'` → like `'min'` but no gaps in rank numbers (1, 2, 2, 3 not 1, 2, 2, 4)
> - `'first'` → ranked in order of appearance (no ties)
>
> For leaderboards and "top N" queries, `'dense'` is usually what you want.

---

## Question 17
### What percentage of passengers in each class survived? Additionally, what percentage of ALL survivors came from each class?

**Concepts:** `groupby()`, percentage within groups vs percentage of total, `crosstab(normalize=...)`

These are two different questions that look similar but produce completely different numbers.

---

### Answer

```python
# --- Question A: Survival RATE by class (what % of each class survived?) ---
survival_rate_by_class = df.groupby("Pclass")["Survived"].mean().round(3)
print("Survival rate by class:")
print(survival_rate_by_class)
# Pclass
# 1    0.630   ← 63% of Class 1 passengers survived
# 2    0.473
# 3    0.242


# --- Question B: Composition of survivors (what % of survivors were from each class?) ---
survivor_composition = (
    df[df["Survived"] == 1]
    .groupby("Pclass")
    .size()
    / df["Survived"].sum()
    * 100
).round(1)

print("\nOf all survivors, % from each class:")
print(survivor_composition)
# Pclass
# 1    39.8   ← 39.8% of survivors were Class 1 (even though Class 1 = 24% of passengers)
# 2    25.4
# 3    34.8


# --- Both together using crosstab with normalize ---
print("\n--- Rate within class (normalize='index') ---")
print(pd.crosstab(df["Pclass"], df["Survived"], normalize="index").round(3))
#           0      1
# Pclass
# 1     0.370  0.630
# 2     0.527  0.473
# 3     0.758  0.242

print("\n--- Share of total (normalize='columns') ---")
print(pd.crosstab(df["Pclass"], df["Survived"], normalize="columns").round(3))
#           0      1
# Pclass
# 1     0.140  0.398
# 2     0.166  0.254
# 3     0.694  0.348
```

> **This is a critical conceptual distinction in data analysis:**
> - "Survival rate by class" → `normalize='index'` → conditioned on class (row-wise)
> - "Share of survivors from each class" → `normalize='columns'` → conditioned on survival outcome (column-wise)
> - `normalize=True` → as % of the entire dataset
>
> Confusing these two is one of the most common analytical errors in practice.

---

## Question 18
### Find passengers who paid MORE than the median fare for their class. Add a column `PaidAboveMedian` (True/False).

**Concepts:** `groupby().transform()` with a custom lambda, boolean column creation

---

### Answer

```python
# Step 1: Use transform to broadcast the class-level median fare to each row
df["ClassMedianFare"] = df.groupby("Pclass")["Fare"].transform("median")

# Step 2: Compare each passenger's fare to their class median
df["PaidAboveMedian"] = df["Fare"] > df["ClassMedianFare"]

# Verify
print(df[["Pclass", "Fare", "ClassMedianFare", "PaidAboveMedian"]].head(10).round(2))

# Breakdown: how many passengers paid above median in each class?
print(df.groupby(["Pclass", "PaidAboveMedian"]).size())

# Does paying above the class median correlate with better survival?
print(
    df.groupby("PaidAboveMedian")["Survived"].mean().round(3)
)
# PaidAboveMedian
# False    0.340
# True     0.437   ← paid more → slightly better survival
```

**Method 2 — one-liner using transform with lambda**
```python
df["PaidAboveMedian"] = df["Fare"] > df.groupby("Pclass")["Fare"].transform(
    lambda x: x.median()
)
```

> **Why not just use the global median?** The global median fare is ~£14.45. But a £20 fare is below average for Class 1 (median ~£60) while being way above average for Class 3 (median ~£8). Context-relative comparison is only possible with `transform()`.

---

## Question 19
### Build a complete passenger profile summary: for each combination of Sex, Pclass, and AgeBand, show passenger count, survival rate, average fare, and average age.

**Concepts:** Multi-level `groupby()`, `agg()`, handling NaN categories, `reset_index()`, `sort_values()`

---

### Answer

```python
# Make sure AgeBand exists (created in Q13)
if "AgeBand" not in df.columns:
    df["AgeBand"] = pd.cut(
        df["Age"],
        bins=[0, 12, 17, 60, 100],
        labels=["Child", "Teen", "Adult", "Senior"]
    )

# Multi-level groupby with multiple aggregations
profile = (
    df.groupby(["Sex", "Pclass", "AgeBand"], observed=True)
    .agg(
        passengers    = ("PassengerId", "count"),
        survival_rate = ("Survived",    "mean"),
        avg_fare      = ("Fare",        "mean"),
        avg_age       = ("Age",         "mean"),
    )
    .round(2)
    .reset_index()               # bring group keys back as columns
    .sort_values(
        ["Sex", "Pclass", "AgeBand"],
        ascending=[True, True, True]
    )
)

print(profile.to_string())
```

**Accessing specific slices of a multi-index result:**
```python
# If you keep the multi-index (don't reset_index), you can slice with .loc
profile_mi = (
    df.groupby(["Sex", "Pclass", "AgeBand"], observed=True)
    ["Survived"].mean().round(3)
)

# Get all Class 1 female results
print(profile_mi.loc["female", 1])

# Get Class 1 female children specifically
print(profile_mi.loc[("female", 1, "Child")])
```

> **`reset_index()` after `groupby()`:** By default, `groupby()` puts the group keys as the DataFrame index. This is useful for label-based slicing but awkward for most downstream operations. Call `.reset_index()` to bring them back as regular columns — almost always the right move before saving results or further filtering.

> **`observed=True` in multi-level groupby with Categoricals:** Without it, pandas generates a row for every *possible* combination of categories (including combinations that don't exist in the data, like Senior Class 3 females). With `observed=True`, only combinations that actually appear are shown.

---

## Question 20
### Identify the 5 most expensive cabins (by average fare of passengers in that cabin prefix). Then for those cabin prefixes, show the full survival breakdown.

**Concepts:** `str[0]` string indexing, `groupby()` on derived column, chaining, `isin()`, complex multi-step analysis

This is the kind of multi-step question you'd encounter in a real data analysis interview.

---

### Answer

```python
# Step 1: Extract cabin prefix (first letter of cabin, e.g., 'C85' → 'C')
# About 77% of Cabin is missing — those become NaN
df["CabinPrefix"] = df["Cabin"].str[0]   # str[0] gives first character

print(df["CabinPrefix"].value_counts())
# C    59
# B    47
# D    33
# E    32
# A    15
# F    13
# G     4
# T     1
# NaN (missing) = 687

# Step 2: Average fare per cabin prefix
cabin_fare = (
    df.dropna(subset=["CabinPrefix"])    # work only with known cabins
    .groupby("CabinPrefix")["Fare"]
    .mean()
    .round(2)
    .sort_values(ascending=False)
)
print("\nAverage fare by cabin prefix:")
print(cabin_fare)
# CabinPrefix
# T    35.50  (only 1 passenger — unreliable)
# B    93.68
# C   107.25  ← most expensive on average
# D    57.24
# E    46.03
# A    39.62
# F    11.13
# G     9.45

# Step 3: Top 5 prefixes by average fare
top5_prefixes = cabin_fare.nlargest(5).index.tolist()
print(f"\nTop 5 cabin prefixes by average fare: {top5_prefixes}")

# Step 4: Survival breakdown for those prefixes
top5_analysis = (
    df[df["CabinPrefix"].isin(top5_prefixes)]
    .groupby("CabinPrefix")
    .agg(
        passengers    = ("PassengerId", "count"),
        survivors     = ("Survived",    "sum"),
        survival_rate = ("Survived",    "mean"),
        avg_fare      = ("Fare",        "mean"),
    )
    .round(3)
    .sort_values("avg_fare", ascending=False)
)
print("\nSurvival breakdown — top 5 cabin prefixes by fare:")
print(top5_analysis)

# Step 5: Compare with passengers who had NO cabin recorded
no_cabin = df[df["CabinPrefix"].isna()]["Survived"].mean()
print(f"\nSurvival rate — no cabin recorded: {no_cabin:.3f}")
# Result: ~0.30 — much lower than most cabin groups
# Inference: having a recorded cabin (associated with Pclass 1/2) → better survival
```

> **`nlargest(n)` vs `sort_values().head(n)`:**
> - `nlargest(n)` is more efficient — it doesn't fully sort the Series
> - `sort_values().head(n)` is more readable and also returns the full sorted order if needed
> - For production code with large data, use `nlargest/nsmallest`. For exploration, either is fine.

> **The missing cabin problem:** 77% of passengers have no cabin recorded. This is almost certainly not random — third-class passengers generally had no assigned cabin. The missing value itself is informative. Techniques for handling this: (1) treat NaN as its own category `"Unknown"`, (2) use it as a binary feature `has_cabin = Cabin.notna()`, (3) impute based on class. Each choice has analysis tradeoffs.

```python
# Bonus: create has_cabin feature and check its correlation with survival
df["has_cabin"] = df["Cabin"].notna().astype(int)
print(df.groupby("has_cabin")["Survived"].mean().round(3))
# has_cabin
# 0    0.300   (no cabin recorded)
# 1    0.667   (cabin recorded)
```

---

---

# Concepts Coverage Checklist

```
✅ df.shape, head(), tail(), info(), describe()
✅ value_counts(), value_counts(normalize=True)
✅ Boolean filtering with single condition
✅ Boolean filtering with multiple conditions (& and |)
✅ loc[] and iloc[]
✅ query()
✅ Column selection (list of columns)
✅ New column creation (arithmetic)
✅ pd.cut() and pd.qcut()
✅ groupby().size()
✅ groupby().count() — and why it differs from size()
✅ groupby().mean(), .sum(), .min(), .max()
✅ groupby() single column aggregation
✅ groupby() multi-column aggregation with named agg()
✅ groupby() on multiple keys
✅ agg() with a list of functions
✅ Named aggregation syntax: agg(new_name=("col", "func"))
✅ unstack() to reshape groupby results
✅ pd.crosstab() — counts and proportions
✅ pd.crosstab(normalize='index'/'columns'/True)
✅ pd.pivot_table() with aggfunc, margins
✅ groupby().transform() — core concept, broadcasting back
✅ transform() with lambda functions
✅ str.extract() with regex
✅ str[0] string indexing
✅ replace() for value mapping
✅ rank() within groups
✅ groupby().apply() with nlargest()
✅ nlargest() / nsmallest()
✅ isin() for membership filtering
✅ dropna(subset=[...])
✅ fillna() with transform()-derived values
✅ reset_index() after groupby
✅ sort_values() with multiple columns
✅ Multi-level groupby with observed=True
✅ Multi-index slicing with .loc[]
```

---

---

# Beyond Titanic — What Dataset to Learn Next?

You're right that Titanic is overused. It's small, it's clean-ish, and everyone's seen the analysis. Here are the best datasets for levelling up, grouped by what skill they sharpen.

---

## For GroupBy, Aggregation & Time Series

### 1. IPL (Indian Premier League) Dataset
**Why it's perfect:** It's Indian-relevant, students care about cricket, and it has natural groupby dimensions — team, season, player, match, venue. You can do everything from simple survival-style survival-rate questions to window functions (running averages) to pivot tables (team vs team head-to-head).

**Where to get it:** https://www.kaggle.com/datasets/patrickb1912/ipl-complete-dataset-20082020

**Sample questions it enables:**
- Which team has the highest win rate at home vs away?
- Which bowler has the best economy rate in death overs?
- Use `transform()` to add "runs above team average" per match

---

### 2. Zomato Restaurant Dataset
**Why it's perfect:** Real Indian cities, messy real-world data (ratings as strings like "3.1/5", location names inconsistent), great for `groupby`, `pivot_table`, and string cleaning.

**Where to get it:** https://www.kaggle.com/datasets/shrutimehta/zomato-restaurants-data

**Sample questions it enables:**
- Average rating and cost per city
- `crosstab` of cuisine type vs city
- Which city has the highest proportion of online-order-enabled restaurants?

---

## For Multi-Join, Merge, and Relational Data

### 3. Superstore Sales Dataset (Global)
**Why it's perfect:** It has Orders, Returns, and People in separate sheets — forces you to learn `merge()` and `concat()`. It also has date columns for time series, regions for geographic groupby, and profit/sales for numeric aggregation.

**Where to get it:** Built into Tableau's sample data. Also available at:
https://www.kaggle.com/datasets/vivek468/superstore-dataset-final

**Sample questions it enables:**
- `merge()` orders with returns to flag returned orders
- Monthly revenue trend using `resample()` or `groupby(pd.Grouper(freq='M'))`
- Running total of sales per region using `transform(cumsum)`

---

## For String Operations, `apply()`, and Messy Data

### 4. Netflix Titles Dataset
**Why it's perfect:** It has multi-valued columns ("Comedies, Dramas, Thrillers" in one cell), missing values scattered everywhere, and date strings that need parsing. Forces you to use `str.split()`, `explode()`, `apply()`, and `pd.to_datetime()`.

**Where to get it:** https://www.kaggle.com/datasets/shivamb/netflix-shows

**Sample questions it enables:**
- `explode()` the genres column to count content per genre
- `apply()` to classify movies vs TV shows by duration
- `pd.to_datetime()` to analyze content added per year

---

## For Advanced Aggregation and window-style Operations

### 5. NYC Yellow Taxi Trips
**Why it's perfect:** It's millions of rows — so you learn efficient pandas (chunked reading, vectorized ops vs apply). Rich time, location, and numerical data. Teaches `resample()`, `rolling()`, `cut()` for fare bins, and multi-level groupby at scale.

**Where to get it:** https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page (free, official)

**Sample questions it enables:**
- Average tip percentage by hour of day
- `rolling(7).mean()` of daily trips (weekly average trend)
- `pd.cut()` fare bins and groupby

---

## Recommended Learning Path

```
Start here:
Titanic → IPL → Zomato
   ↓           ↓           ↓
Basic       GroupBy    Messy data
filtering   mastery    + strings
            + pivots

Then:
Superstore → Netflix → NYC Taxi
     ↓            ↓          ↓
  Merges       explode()   Scale +
+ datetime     + apply()   rolling()
```

The sweet spot is **IPL after Titanic** — it's familiar, motivating for Indian students, and naturally exercises every pandas skill in a new context. The domain change forces you to *think* in pandas rather than just copy patterns.

---

*End of Practice Sheet — Titanic Dataset with Pandas*
*Codeverra — learn.codeverra.com*
