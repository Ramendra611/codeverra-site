---
title: "Practice Pandas on Zomato Dataset"
description: "Master data analysis in Python using the pandas library using hands on practice on Zomato dataset"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - dsa
  - binary-search
  - searching

cover:
  image: "/images/blog-images/binary-search.jpg"
  alt: "Binary search algorithm"
  caption: "Data Analysis using Python"
  relative: true
  hidden: false
---



# Pandas Practice Sheet — Zomato Bangalore Dataset
### A complete guided exploration: from raw messy data to real business insights

---

## Why This Dataset?

The Titanic dataset is clean, small, and predictable. The Zomato Bangalore dataset is the opposite — it is **genuinely messy in the way real-world data is messy**. Ratings stored as strings like `"3.8/5"`. Costs formatted as `"450"` with comma-separators (`"1,200"`). The `cuisines` column has multiple cuisines packed into one cell separated by commas. Several columns have inconsistent values, duplicates, and missing data scattered across them.

This is not a bug in the practice sheet. It is the point. Working through this dataset will teach you the pandas skills that actually matter when you sit down with a real business dataset:
- How to **clean** before you analyse
- How to **extract** structured data from messy string columns
- How to **explode** multi-valued columns for correct counts
- How to **group, aggregate, pivot, and transform** on a dataset with real business meaning

By the end of this sheet, you will be able to answer real questions a restaurant business owner or a Zomato product manager would actually ask.

---

## Getting the Dataset

**Kaggle page (free, no login required for direct CSV):**
```
https://www.kaggle.com/datasets/himanshupoddar/zomato-bangalore-restaurants
```

**Direct download (after Kaggle login):**
The dataset is `zomato.csv` — approximately 51,700 rows and 17 columns.

**Alternative: load a hosted mirror directly in Python (no login):**
```python
import pandas as pd

# Hosted on GitHub (public mirror of the Kaggle dataset)
url = "https://raw.githubusercontent.com/dsrscientist/dataset1/master/zomato.csv"
df = pd.read_csv(url)
```

> If the mirror URL is unavailable, download `zomato.csv` from Kaggle and load locally:
> ```python
> df = pd.read_csv("zomato.csv")
> ```

---

## Column Dictionary

Before writing a single line of code, understand every column in the raw dataset.

```
┌────────────────────────────┬──────────┬────────────────────────────────────────────────────────────┐
│ Column (raw name)          │ Type     │ Meaning & Notes                                            │
├────────────────────────────┼──────────┼────────────────────────────────────────────────────────────┤
│ url                        │ string   │ Zomato URL of the restaurant. Not useful for analysis.      │
│ address                    │ string   │ Full address. Too detailed; location is more useful.        │
│ name                       │ string   │ Restaurant name.                                            │
│ online_order               │ string   │ "Yes" or "No" — does the restaurant accept online orders?  │
│ book_table                 │ string   │ "Yes" or "No" — does the restaurant allow table booking?   │
│ rate                       │ string   │ Rating as "4.1/5" or "NEW" or "-". MESSY — needs cleaning. │
│ votes                      │ int      │ Number of votes the restaurant has received.               │
│ phone                      │ string   │ Phone number. Not useful for analysis.                     │
│ location                   │ string   │ Neighbourhood/area in Bangalore (e.g., "Koramangala 5th"). │
│ rest_type                  │ string   │ Type of restaurant (e.g., "Casual Dining", "Quick Bites"). │
│ dish_liked                 │ string   │ Comma-separated list of popular dishes. Very messy.        │
│ cuisines                   │ string   │ Comma-separated list of cuisines (e.g., "North Indian,     │
│                            │          │ Chinese, Mughlai"). MULTI-VALUED — needs explode().        │
│ approx_cost(for two people)│ string   │ Approximate cost for two, stored as string ("300", "1,200")│
│                            │          │ Has commas in numbers. Needs cleaning → numeric.           │
│ reviews_list               │ string   │ Raw list of reviews. Not structured for analysis.          │
│ menu_item                  │ string   │ Menu items. Mostly empty.                                  │
│ listed_in(type)            │ string   │ Listing category: "Buffet", "Cafes", "Delivery", etc.      │
│ listed_in(city)            │ string   │ Area-level city tag. Broader than location.                │
└────────────────────────────┴──────────┴────────────────────────────────────────────────────────────┘
```

**Dataset at a glance:**
- ~51,700 rows (restaurants in Bangalore listed on Zomato)
- Several columns are **object (string) type even though they should be numeric** — this is the core challenge
- `rate` has three types of non-numeric values: `"NEW"`, `"-"`, and `NaN`
- `approx_cost(for two people)` has commas in numbers (Indian formatting)
- `cuisines` is multi-valued — each restaurant may serve 1 to 8+ cuisines in one cell

---

## Setup Block — Run This First

```python
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv("zomato.csv")

# Quick orientation
print("Shape:", df.shape)
print("\nColumn names:")
print(df.columns.tolist())
print("\nData types:")
print(df.dtypes)
print("\nMissing values:")
print(df.isnull().sum())
print("\nFirst 3 rows:")
print(df.head(3))
```

---

---

# SECTION 1 — First Look (Questions 1–3)
### Understand the shape, structure, and quality of the data before touching anything

---

## Question 1
### What is the shape of the dataset? How many restaurants are there? How many columns? How many missing values does each column have, and what percentage of the column is missing?

**Concepts:** `shape`, `isnull()`, `sum()`, percentage calculation, `info()`

---

### Answer

```python
# --- Basic shape ---
print(f"Rows    : {df.shape[0]:,}")    # number of restaurants
print(f"Columns : {df.shape[1]}")

# --- Missing value audit: count AND percentage ---
missing = df.isnull().sum()
missing_pct = (df.isnull().sum() / len(df) * 100).round(2)

missing_report = pd.DataFrame({
    "missing_count" : missing,
    "missing_pct"   : missing_pct
}).sort_values("missing_pct", ascending=False)

print(missing_report[missing_report["missing_count"] > 0])
# dish_liked            ~26%  ← very high — mostly useless
# rate                  ~4%   ← small but critical — needs cleaning
# approx_cost...        ~1%   ← small
# cuisines              ~1%
# rest_type             ~1%
# phone                 ~0.3%

# --- Data types check ---
df.info()
# Key findings:
# rate → object (should become float after cleaning)
# approx_cost(for two people) → object (should become int after cleaning)
# votes → already int — the one clean numeric column
```

> **Why do this first?** Missing value percentages tell you what to clean, what to drop, and what to be careful about in analysis. A column that is 26% missing (`dish_liked`) is nearly useless. A column that is 4% missing (`rate`) is critical and must be cleaned before any rating analysis. Never skip this step.

---

## Question 2
### What are the unique values in `online_order`, `book_table`, and `listed_in(type)`? What is the distribution of each?

**Concepts:** `unique()`, `nunique()`, `value_counts()`, `value_counts(normalize=True)`

---

### Answer

```python
# --- Unique values ---
for col in ["online_order", "book_table", "listed_in(type)"]:
    print(f"\n{col}")
    print(f"  Unique values : {df[col].unique()}")
    print(f"  Unique count  : {df[col].nunique()}")

# online_order     : ['Yes' 'No']
# book_table       : ['Yes' 'No']
# listed_in(type)  : ['Delivery' 'Dine-out' 'Desserts' 'Cafes'
#                     'Drinks & nightlife' 'Buffet' 'Pubs and bars']

# --- Distribution with counts and percentages ---
print("\n--- online_order distribution ---")
print(df["online_order"].value_counts())
print(df["online_order"].value_counts(normalize=True).mul(100).round(1))

print("\n--- book_table distribution ---")
print(df["book_table"].value_counts())
print(df["book_table"].value_counts(normalize=True).mul(100).round(1))

print("\n--- listed_in(type) distribution ---")
print(df["listed_in(type)"].value_counts())
```

> **Insight to draw:** If ~60–65% of restaurants offer online orders but only ~15% allow table booking, that tells you Zomato Bangalore is primarily a delivery platform, not a reservation platform. These proportions are useful business context for every downstream analysis.

> **`unique()` vs `nunique()`:**
> - `unique()` → returns the actual array of unique values (use to inspect categories)
> - `nunique()` → returns just the count of unique values (use in aggregations)
> Use `unique()` first when you're unfamiliar with a column to check for dirty values like mixed casing (`"yes"` vs `"Yes"`) or unexpected categories.

---

## Question 3
### Examine the `rate` column closely. What are all the unique non-numeric values? How many restaurants have each type of value?

**Concepts:** `value_counts()`, `str.contains()`, boolean filtering to understand dirty data before cleaning

---

### Answer

```python
# --- What does rate look like? ---
print(df["rate"].dtype)          # object
print(df["rate"].value_counts().head(20))

# Most values look like: "4.1/5", "3.8/5", "4.5/5" etc.
# But there are also: "NEW", "-", and NaN

# --- Count of non-standard values ---
print("\nNon-numeric rate values:")
print(df["rate"].isin(["NEW", "-"]).sum())     # total non-numeric entries
print(df["rate"].value_counts().get("NEW", 0)) # NEW count
print(df["rate"].value_counts().get("-", 0))   # '-' count
print(df["rate"].isnull().sum())               # NaN count

# --- Sample of each type ---
print(df[df["rate"] == "NEW"][["name", "rate", "votes"]].head(3))
print(df[df["rate"] == "-"][["name", "rate", "votes"]].head(3))

# --- What is the range of valid ratings? ---
valid_rates = df[~df["rate"].isin(["NEW", "-"]) & df["rate"].notna()]
print(valid_rates["rate"].unique()[:10])   # e.g., ["4.1/5", "3.8/5", ...]
```

> **This is the recon step.** Before you can use `rate` for any analysis, you need to understand exactly what "dirty" means in this column. `"NEW"` means the restaurant is newly listed with no ratings yet. `"-"` means ratings were suppressed (too few votes or a policy reason). Both should become `NaN` after cleaning, not `0` — treating them as `0` would devastate your average rating calculations.

---

---

# SECTION 2 — Data Cleaning (Questions 4–6)
### This section is not optional. The rest of the practice sheet depends on it.

---

## Question 4
### Clean the `rate` column: strip the `"/5"` suffix, convert `"NEW"` and `"-"` to `NaN`, and store the result as a new numeric column called `rating`.

**Concepts:** `str.replace()`, `replace()`, `pd.to_numeric()`, `astype()`, handling multiple dirty values at once

---

### Answer

```python
# Method 1 — Step by step (most readable for learners)

# Step 1: Replace "NEW" and "-" with NaN
df["rate"] = df["rate"].replace({"NEW": np.nan, "-": np.nan})

# Step 2: Strip the "/5" suffix from remaining string values
# e.g., "4.1/5" → "4.1"
df["rate"] = df["rate"].str.replace("/5", "", regex=False)

# Step 3: Convert to numeric — any remaining non-numeric becomes NaN automatically
df["rating"] = pd.to_numeric(df["rate"], errors="coerce")

# Verify
print(df["rating"].dtype)        # float64
print(df["rating"].describe())
# count    ~49400 (those with valid ratings)
# mean     ~3.72
# min      1.8
# max      4.9

print(df["rating"].isnull().sum())   # includes original NaN + NEW + "-"


# -------------------------------------------------------
# Method 2 — One-liner using a regex extract
# -------------------------------------------------------
df["rating"] = pd.to_numeric(
    df["rate"].str.extract(r"(\d+\.\d+)")[0],
    errors="coerce"
)
# str.extract() pulls out exactly the decimal number pattern
# Any row that doesn't match (NEW, -, NaN) becomes NaN automatically

# Verify both methods give the same result
print(df["rating"].isna().sum())
print(df["rating"].min(), df["rating"].max())
```

> **`pd.to_numeric(errors='coerce')` is your best friend for dirty numeric columns.**
> - `errors='raise'` → throws an error on the first bad value (default; useful during development)
> - `errors='coerce'` → silently converts unparseable values to `NaN` (useful during cleaning)
> - `errors='ignore'` → returns the original value unchanged if it can't be parsed (rarely what you want)

> **Why not `astype(float)` directly?** Because `astype(float)` on a column containing `"NEW"` raises a `ValueError`. You'd have to manually replace non-numeric values first anyway. `pd.to_numeric(errors='coerce')` does both steps atomically.

---

## Question 5
### Clean the `approx_cost(for two people)` column: remove comma separators, convert to integer, and store as a new column `cost_for_two`.

**Concepts:** `str.replace()`, `pd.to_numeric()`, working with Indian number formatting

---

### Answer

```python
# --- First, look at the problem ---
print(df["approx_cost(for two people)"].dtype)        # object
print(df["approx_cost(for two people)"].unique()[:15])
# ['300', '600', '800', '1,200', '1,500', '450', ...]
# Numbers over 999 use a comma: "1,200" instead of "1200"

# Method 1 — str.replace then pd.to_numeric
df["cost_for_two"] = pd.to_numeric(
    df["approx_cost(for two people)"].str.replace(",", "", regex=False),
    errors="coerce"
)

# Method 2 — same result, slightly different style
df["cost_for_two"] = (
    df["approx_cost(for two people)"]
    .str.replace(",", "", regex=False)
    .pipe(pd.to_numeric, errors="coerce")
)

# Verify
print(df["cost_for_two"].dtype)         # float64 (NaN requires float, not int)
print(df["cost_for_two"].describe())
# min      40
# max      6000
# mean     ~547
# median   ~400

# Safe cast to Int64 (nullable integer — pandas 1.0+)
df["cost_for_two"] = df["cost_for_two"].astype("Int64")
```

> **Why `Int64` (capital I) instead of `int64`?**
> Standard `int64` cannot hold `NaN` — numpy integers don't support null values. If you call `.astype(int)` on a column with `NaN`, it raises a `ValueError`. Pandas nullable integer type `"Int64"` handles `NaN` correctly. Use it whenever your integer column has missing values.

---

## Question 6
### Rename the messy column names to clean, usable names. Also drop columns that are not useful for analysis (`url`, `address`, `phone`, `menu_item`, `reviews_list`).

**Concepts:** `rename()`, `drop()`, column renaming best practices

---

### Answer

```python
# --- Rename columns ---
df = df.rename(columns={
    "approx_cost(for two people)" : "cost_for_two_raw",  # already cleaned → new col
    "listed_in(type)"             : "listing_type",
    "listed_in(city)"             : "listing_city",
})

# --- Drop irrelevant columns ---
cols_to_drop = ["url", "address", "phone", "menu_item", "reviews_list"]
df = df.drop(columns=cols_to_drop, errors="ignore")
# errors="ignore" → no error if a column doesn't exist (safe for re-runs)

# --- Check final column list ---
print(df.columns.tolist())
# ['name', 'online_order', 'book_table', 'rate', 'votes',
#  'location', 'rest_type', 'dish_liked', 'cuisines',
#  'cost_for_two_raw', 'listing_type', 'listing_city',
#  'rating', 'cost_for_two']

print(f"Clean shape: {df.shape}")
```

> **Rename before analyse.** Column names like `"approx_cost(for two people)"` and `"listed_in(type)"` are painful to type repeatedly and prone to typos. Renaming upfront pays dividends across the entire notebook. The `rename(columns={...})` dict syntax is the cleanest approach — far safer than reassigning `df.columns = [...]` (which requires getting the exact position right).

---

---

# SECTION 3 — Exploration & Aggregation (Questions 7–13)
### Now that data is clean, start answering business questions

---

## Question 7
### What are the top 10 locations (neighbourhoods) in Bangalore by number of restaurants? What percentage of all restaurants does each represent?

**Concepts:** `value_counts()`, percentage calculation, `head()`, `reset_index()`

---

### Answer

```python
# Method 1 — value_counts with percentage column
location_counts = df["location"].value_counts().reset_index()
location_counts.columns = ["location", "restaurant_count"]
location_counts["pct_of_total"] = (
    location_counts["restaurant_count"] / len(df) * 100
).round(2)

print(location_counts.head(10))
#            location  restaurant_count  pct_of_total
# BTM                          ~1100         ~2.1
# Koramangala 5th Block         ~900         ~1.7
# HSR                           ~880         ~1.7
# Indiranagar                   ~850         ~1.6
# ...

# Method 2 — groupby approach (more flexible for adding extra metrics later)
location_summary = (
    df.groupby("location")
    .agg(restaurant_count=("name", "count"))
    .sort_values("restaurant_count", ascending=False)
    .head(10)
    .reset_index()
)
location_summary["pct_of_total"] = (
    location_summary["restaurant_count"] / len(df) * 100
).round(2)

print(location_summary)
```

> **Insight:** BTM, Koramangala, HSR, and Indiranagar dominate. These are all IT-heavy neighbourhoods in South Bangalore — where tech workers who rely on food delivery are concentrated. This is not a coincidence.

> **When to use `value_counts()` vs `groupby().count()`:**
> - `value_counts()` → fastest one-liner for "how many of each category"
> - `groupby().agg()` → better when you need additional columns (average rating, average cost, etc.) alongside the count in the same table

---

## Question 8
### What is the average rating, average cost for two, and total votes for each restaurant type (`rest_type`)? Show only types with more than 100 restaurants, sorted by average rating descending.

**Concepts:** Multi-metric `agg()`, named aggregations, filtering groups with boolean indexing after groupby, `sort_values()`

---

### Answer

```python
rest_type_summary = (
    df.groupby("rest_type")
    .agg(
        restaurant_count = ("name",         "count"),
        avg_rating       = ("rating",        "mean"),
        avg_cost         = ("cost_for_two",  "mean"),
        total_votes      = ("votes",         "sum"),
        median_votes     = ("votes",         "median"),
    )
    .round(2)
    .reset_index()
)

# Filter: only types with more than 100 restaurants
filtered = rest_type_summary[rest_type_summary["restaurant_count"] > 100]

# Sort by average rating descending
result = filtered.sort_values("avg_rating", ascending=False)
print(result.to_string(index=False))
```

> **Why filter AFTER the groupby?** Because you want to calculate aggregates across ALL restaurants of each type, then filter down to types with meaningful sample sizes. If you filtered the raw `df` first (removing small types), you'd still get the same aggregate results — but filtering post-groupby is the correct mental model.

> **Named aggregation reminder:**
> `new_col_name = ("source_col", "agg_function")`
> This is the pandas 0.25+ way. Column names are clean immediately, no need for `.rename()` after.

---

## Question 9
### What proportion of restaurants in each neighbourhood offer online ordering? Find the top 10 and bottom 10 locations by online order adoption rate.

**Concepts:** `groupby()`, converting Yes/No to binary, `mean()` on derived boolean, `nlargest()`, `nsmallest()`

---

### Answer

```python
# Step 1: Convert Yes/No to 1/0 for easy mean calculation
df["online_order_flag"] = (df["online_order"] == "Yes").astype(int)

# Step 2: Groupby location — mean gives adoption rate
location_online = (
    df.groupby("location")
    .agg(
        total_restaurants   = ("name",              "count"),
        online_order_rate   = ("online_order_flag", "mean"),
    )
    .round(3)
    .reset_index()
)

# Filter to locations with at least 50 restaurants (avoid noise from tiny areas)
location_online = location_online[location_online["total_restaurants"] >= 50]

# Top 10 — highest online order adoption
print("Top 10 locations by online order rate:")
print(location_online.nlargest(10, "online_order_rate")
      [["location", "total_restaurants", "online_order_rate"]])

# Bottom 10 — lowest online order adoption
print("\nBottom 10 locations by online order rate:")
print(location_online.nsmallest(10, "online_order_rate")
      [["location", "total_restaurants", "online_order_rate"]])
```

> **The Yes/No → binary conversion pattern** (`== "Yes").astype(int)`) is one of the most reusable pandas patterns. Once you have a 0/1 column, `mean()` gives you the rate, `sum()` gives you the count, and it plays nicely with all groupby operations. Apply this pattern to any binary string column.

> **`nlargest(n, col)` vs `sort_values().head(n)`:**
> - `nlargest()` is O(n log k) — significantly faster when n is large
> - `sort_values().head()` is O(n log n) — full sort
> For datasets under ~1M rows the difference is negligible, but `nlargest` also reads more clearly.

---

## Question 10
### What is the average rating and average cost for two across all combinations of `online_order` and `book_table`? Present as a pivot table.

**Concepts:** `pd.pivot_table()`, multiple `aggfunc`, `margins`, interpreting 2×2 business tables

---

### Answer

```python
# Pivot table: rows = online_order, columns = book_table
# Values = rating and cost_for_two, aggfunc = mean

pivot_rating = pd.pivot_table(
    df,
    values   = "rating",
    index    = "online_order",
    columns  = "book_table",
    aggfunc  = "mean",
    margins  = True,
    margins_name = "Overall"
).round(3)

pivot_cost = pd.pivot_table(
    df,
    values   = "cost_for_two",
    index    = "online_order",
    columns  = "book_table",
    aggfunc  = "mean",
    margins  = True,
    margins_name = "Overall"
).round(0)

print("Average Rating:")
print(pivot_rating)
# book_table          No      Yes   Overall
# online_order
# No               3.XX    3.XX     3.XX
# Yes              3.XX    3.XX     3.XX
# Overall          3.XX    3.XX     3.XX

print("\nAverage Cost for Two (Rs.):")
print(pivot_cost)

# Combined: restaurant count in each cell
pivot_count = pd.pivot_table(
    df,
    values   = "name",
    index    = "online_order",
    columns  = "book_table",
    aggfunc  = "count",
    margins  = True,
    margins_name = "Total"
)
print("\nRestaurant Count:")
print(pivot_count)
```

> **What to read from this pivot:** Restaurants that offer table booking tend to have higher average costs (they are nicer, sit-down establishments). Restaurants that do NOT offer table booking but DO offer online orders are typically quick-service or delivery-first. The 2×2 table immediately segments the market into four distinct restaurant archetypes.

> **Multiple values in pivot_table:**
> You can pass `values=["rating", "cost_for_two"]` with a list. The result has a MultiIndex column. It is slightly harder to read but gives both metrics in one call. For teaching purposes, separate calls are cleaner.

---

## Question 11
### Find the top 10 most expensive locations (by median cost for two). For each, also show the average rating and restaurant count. Why median instead of mean?

**Concepts:** `groupby().agg()`, mean vs median for skewed data, `sort_values()`

---

### Answer

```python
location_cost = (
    df.groupby("location")
    .agg(
        restaurant_count = ("name",           "count"),
        median_cost      = ("cost_for_two",   "median"),
        mean_cost        = ("cost_for_two",   "mean"),
        avg_rating       = ("rating",         "mean"),
    )
    .round(2)
    .reset_index()
)

# Filter for locations with at least 30 restaurants
location_cost = location_cost[location_cost["restaurant_count"] >= 30]

# Sort by median cost
top10_expensive = location_cost.nlargest(10, "median_cost")
print(top10_expensive[["location", "restaurant_count", "median_cost",
                        "mean_cost", "avg_rating"]].to_string(index=False))

# Show the difference between mean and median (skew diagnostic)
location_cost["cost_skew"] = (
    location_cost["mean_cost"] - location_cost["median_cost"]
).round(0)
print("\nLocations with most cost skew (mean >> median → expensive outliers):")
print(location_cost.nlargest(5, "cost_skew")
      [["location", "median_cost", "mean_cost", "cost_skew"]])
```

> **Mean vs Median — always think about this for price data.**
> A location might have 200 budget restaurants and 5 luxury fine-dining restaurants. The 5 luxury ones can pull the mean cost to Rs.1200 even if the typical restaurant costs Rs.400. The median gives you the "typical" restaurant cost for that area — which is what you actually want when answering "how expensive is Koramangala?"
>
> The gap between mean and median is itself informative: a large gap means a location has high-end outliers. A small gap means costs are more homogeneous.

---

## Question 12
### What is the distribution of ratings? Create rating bands (Poor: <3.5, Average: 3.5–4.0, Good: 4.0–4.5, Excellent: >4.5) and show how many restaurants fall into each band along with their average cost and average votes.

**Concepts:** `pd.cut()`, custom bins, `groupby()` on categorical, `observed=True`

---

### Answer

```python
# Step 1: Create rating bands using pd.cut()
df["rating_band"] = pd.cut(
    df["rating"],
    bins   = [0, 3.5, 4.0, 4.5, 5.0],
    labels = ["Poor (<3.5)", "Average (3.5-4.0)", "Good (4.0-4.5)", "Excellent (>4.5)"],
    right  = True,   # intervals are (left, right]
)

# Step 2: Analyse by rating band
rating_band_analysis = (
    df.groupby("rating_band", observed=True)
    .agg(
        restaurant_count = ("name",           "count"),
        avg_cost         = ("cost_for_two",   "mean"),
        avg_votes        = ("votes",          "mean"),
        total_votes      = ("votes",          "sum"),
    )
    .round(1)
    .reset_index()
)
print(rating_band_analysis.to_string(index=False))

# Percentage of restaurants in each band
rating_band_analysis["pct"] = (
    rating_band_analysis["restaurant_count"]
    / rating_band_analysis["restaurant_count"].sum() * 100
).round(1)
print("\nPercentage distribution:")
print(rating_band_analysis[["rating_band", "restaurant_count", "pct"]])
```

> **`pd.cut()` recap:**
> - Bins are `[0, 3.5, 4.0, 4.5, 5.0]` → creates 4 intervals: (0,3.5], (3.5,4.0], (4.0,4.5], (4.5,5.0]
> - `right=True` means the right boundary IS included in the bin (the default)
> - Values outside the bin range become `NaN` — which is why we start from 0, not 1
>
> **Insight to draw:** The bulk of restaurants cluster in the 3.5–4.0 range. Very few are below 3.5 (Zomato may suppress bad listings) or above 4.5 (genuine excellence is rare). This "compressed toward the top" distribution is common in online review systems.

---

## Question 13
### Which are the top 10 restaurants by number of votes? For each, show their rating, cost, location, and restaurant type.

**Concepts:** `sort_values()`, `nlargest()`, multi-column display, `reset_index()`

---

### Answer

```python
# Method 1 — sort_values (returns all rows, then head)
top10_votes = (
    df.sort_values("votes", ascending=False)
    .head(10)
    [["name", "location", "rest_type", "rating", "cost_for_two", "votes",
      "online_order", "listing_type"]]
    .reset_index(drop=True)
)
print(top10_votes.to_string(index=False))

# Method 2 — nlargest (more efficient, direct)
top10_votes_v2 = df.nlargest(10, "votes")[
    ["name", "location", "rest_type", "rating", "cost_for_two", "votes"]
]
print(top10_votes_v2)

# Bonus: are highly voted restaurants also highly rated?
# Check correlation
correlation = df[["votes", "rating"]].corr()
print(f"\nCorrelation between votes and rating: {correlation.loc['votes', 'rating']:.3f}")
# Expect a mild positive correlation (~0.2-0.4)
# High votes ≠ high rating — some famous restaurants are famous for being debated
```

> **`votes` vs `rating` — an important distinction.** A restaurant with 5000 votes and rating 3.8 is very well-known but not universally loved. A restaurant with 50 votes and rating 4.8 might be a hidden gem or a new place. Both have value — they answer different questions ("most popular" vs "highest quality").

---

---

# SECTION 4 — String Operations & Multi-valued Columns (Questions 14–17)
### The most distinctly Zomato-specific skills in this sheet

---

## Question 14
### The `cuisines` column contains multiple cuisines per restaurant separated by commas (e.g., `"North Indian, Chinese, Mughlai"`). What are the top 20 most popular individual cuisines across all restaurants?

**Concepts:** `str.split()`, `explode()`, `value_counts()`, working with multi-valued string columns — the single most important pattern for this dataset

---

### Answer

```python
# --- The problem ---
print(df["cuisines"].head(5))
# 0    North Indian, Mughlai, Chinese
# 1    Chinese, North Indian, Thai
# 2    Cafe, Mexican, Italian, Continental, ...
# If we do value_counts() directly, each COMBINATION is counted as one category
# "North Indian, Chinese" ≠ "North Indian" ≠ "Chinese, North Indian"

# --- The solution: split → explode → value_counts ---

# Step 1: Split each cell by "," into a list
# Step 2: explode() turns each item in the list into its own row
# Step 3: value_counts() on individual cuisines

cuisine_counts = (
    df["cuisines"]
    .dropna()                          # remove NaN rows first
    .str.split(",")                    # split "North Indian, Chinese" → ["North Indian", " Chinese"]
    .explode()                         # one row per cuisine
    .str.strip()                       # remove leading/trailing spaces from " Chinese" → "Chinese"
    .value_counts()
    .head(20)
)

print(cuisine_counts)
# North Indian     ~14000
# Chinese          ~10000
# Continental      ~ 7000
# South Indian     ~ 6000
# Fast Food        ~ 5000
# ...
```

> **`explode()` is the most important method for this dataset.** Without it, you can never correctly count cuisines, dishes, or any other multi-valued column. It was introduced in pandas 0.25 and transforms a column of lists into individual rows, replicating the other column values.
>
> ```
> Before explode:
> row 0: name="Rest A", cuisines=["North Indian", "Chinese"]
>
> After explode:
> row 0: name="Rest A", cuisines="North Indian"
> row 0: name="Rest A", cuisines="Chinese"
> ```
>
> **The `str.strip()` after explode is not optional.** Commas in CSVs often have spaces after them. Without strip, `"Chinese"` and `" Chinese"` (with a leading space) are counted as different cuisines, giving you dozens of phantom duplicates.

---

## Question 15
### How many cuisines does each restaurant serve? Create a column `cuisine_count`. Then show the average rating, average cost, and restaurant count for each cuisine count (1 cuisine, 2 cuisines, 3 cuisines, etc.).

**Concepts:** `str.split()` + `str.len()`, new column from string length, `groupby()` on derived numeric column

---

### Answer

```python
# Step 1: Count cuisines per restaurant
df["cuisine_count"] = df["cuisines"].str.split(",").str.len()
# str.split(",") → list of cuisines
# str.len()      → length of that list = number of cuisines
# NaN cuisines → NaN cuisine_count (handled automatically)

print(df["cuisine_count"].value_counts().sort_index())
# 1    ~8000  (single cuisine restaurants)
# 2    ~9000
# 3    ~9000
# 4    ~8000
# 5    ~6000
# ...

# Step 2: Analyse by cuisine count
cuisine_count_analysis = (
    df.groupby("cuisine_count")
    .agg(
        restaurant_count = ("name",          "count"),
        avg_rating       = ("rating",        "mean"),
        avg_cost         = ("cost_for_two",  "mean"),
    )
    .round(2)
    .reset_index()
)
print(cuisine_count_analysis)

# Insight check: do restaurants with more cuisines tend to cost more?
# (multi-cuisine = bigger menu = usually higher cost?)
```

> **`str.split().str.len()` is a compound string operation.**
> Chaining `.str` accessors works because `str.split()` returns a Series of lists, and `str.len()` on a Series of lists returns the length of each list. This pattern — `str.split() → str.len()` — is how you extract length from any delimited string column.

---

## Question 16
### For each of the top 10 cuisines, what is the average rating and average cost for two? Use `explode()` properly so each restaurant is counted once per cuisine it serves.

**Concepts:** `str.split()` + `explode()` on a copy of the DataFrame, groupby on exploded data, avoiding double-counting

---

### Answer

```python
# The key challenge: after explode, one restaurant appears multiple times
# (once per cuisine). This is correct for cuisine-level analysis.
# Don't add up "sum of votes" on exploded data — it will be wrong.
# Do use "mean of rating" — that's fine (same value repeated is still the same mean).

# Step 1: Create an exploded copy (never explode the main df in-place!)
df_exploded = df.copy()
df_exploded["cuisines"] = df_exploded["cuisines"].str.split(",")
df_exploded = df_exploded.explode("cuisines")
df_exploded["cuisines"] = df_exploded["cuisines"].str.strip()

# Step 2: Find top 10 cuisines by restaurant count
top10_cuisines = (
    df_exploded["cuisines"]
    .value_counts()
    .head(10)
    .index
    .tolist()
)
print("Top 10 cuisines:", top10_cuisines)

# Step 3: Filter to only top 10 cuisines and aggregate
cuisine_stats = (
    df_exploded[df_exploded["cuisines"].isin(top10_cuisines)]
    .groupby("cuisines")
    .agg(
        restaurant_count = ("name",           "count"),
        avg_rating       = ("rating",         "mean"),
        avg_cost         = ("cost_for_two",   "mean"),
        avg_votes        = ("votes",          "mean"),
    )
    .round(2)
    .sort_values("avg_rating", ascending=False)
    .reset_index()
)
print(cuisine_stats.to_string(index=False))
```

> **Critical: always explode a copy, never the main `df`.**
> After exploding, a restaurant serving 3 cuisines appears 3 times. If you then try to count total restaurants (`df.shape[0]` gives a wrong number) or compute a global average cost (each restaurant contributes its cost 3 times instead of 1), your results will be inflated. Keep the main `df` intact for analyses that should be at the restaurant level.

> **When is it correct to use exploded data?** For any question about individual cuisines: "what is the average rating of restaurants serving North Indian food?" That question is naturally answered on the exploded frame. For "what is the average cost of restaurants in Koramangala?", use the original frame.

---

## Question 17
### Extract the primary cuisine (the first cuisine listed for each restaurant). Create a new column `primary_cuisine`. Which primary cuisine has the highest average rating?

**Concepts:** `str.split()` + `str[0]` (indexing into a list Series), deriving structured data from unstructured strings

---

### Answer

```python
# str.split(",") gives a list; str[0] extracts the first element of each list
df["primary_cuisine"] = (
    df["cuisines"]
    .str.split(",")
    .str[0]                   # first cuisine in the comma-separated list
    .str.strip()              # clean whitespace
)

print(df["primary_cuisine"].value_counts().head(10))
# North Indian    ~5000
# South Indian    ~3000
# Chinese         ~2000
# ...

# Average rating by primary cuisine (only cuisines with 100+ restaurants)
primary_cuisine_rating = (
    df.groupby("primary_cuisine")
    .agg(
        count      = ("name",   "count"),
        avg_rating = ("rating", "mean"),
        avg_cost   = ("cost_for_two", "mean"),
    )
    .round(3)
    .reset_index()
)

# Filter for statistical reliability
primary_cuisine_rating = primary_cuisine_rating[
    primary_cuisine_rating["count"] >= 100
]
print(
    primary_cuisine_rating
    .sort_values("avg_rating", ascending=False)
    .head(10)
    .to_string(index=False)
)
```

> **`str[0]` on a Series of lists** works because the `.str` accessor supports integer indexing — `str[0]` means "first element of each list". This is the same as `str.get(0)` with `NaN` safety. Use `str[0]`, `str[1]`, `str[-1]` to extract specific positions from a split.

---

---

# SECTION 5 — Groupby Transforms & Derived Insights (Questions 18–22)
### Adding context back to individual rows using transform() and other advanced patterns

---

## Question 18
### Add a column `rating_vs_location_avg` that shows how much each restaurant's rating differs from the average rating of all restaurants in the same location.

**Concepts:** `groupby().transform()` — the core advanced concept

---

### Answer

```python
# Step 1: Compute location-level average rating and broadcast back to each row
df["location_avg_rating"] = df.groupby("location")["rating"].transform("mean")

# Step 2: Compute the difference
df["rating_vs_location_avg"] = (df["rating"] - df["location_avg_rating"]).round(3)

# Step 3: Verify it works
sample = df[["name", "location", "rating", "location_avg_rating",
             "rating_vs_location_avg"]].dropna().head(10)
print(sample.to_string(index=False))

# Step 4: Find restaurants that most outperform their neighbourhood
outperformers = (
    df[["name", "location", "rating", "location_avg_rating",
        "rating_vs_location_avg"]]
    .dropna()
    .sort_values("rating_vs_location_avg", ascending=False)
    .head(10)
)
print("\nTop outperformers vs their neighbourhood:")
print(outperformers.to_string(index=False))

# Underperformers
underperformers = (
    df[["name", "location", "rating", "location_avg_rating",
        "rating_vs_location_avg"]]
    .dropna()
    .sort_values("rating_vs_location_avg", ascending=True)
    .head(10)
)
print("\nMost underperforming vs their neighbourhood:")
print(underperformers.to_string(index=False))
```

> **Why `transform()` matters here:** You want to add "context" to each restaurant row. The context is the average rating of all restaurants around it. `groupby().agg()` gives you one number per location. `groupby().transform()` broadcasts that number back to every row in that location, giving you the same shape as the original DataFrame so you can subtract directly.
>
> This is the classic "deviation from group mean" pattern — used in almost every real EDA.

---

## Question 19
### Add a column `cost_percentile_in_type` showing where each restaurant's cost falls within its restaurant type (as a percentile). Use this to find "value for money" restaurants — those in the top 25% of their type by rating but bottom 25% by cost.

**Concepts:** `groupby().transform()` with a `rank`-based lambda, percentile calculation, multi-condition filtering

---

### Answer

```python
# Step 1: Compute cost percentile within each restaurant type
# rank(pct=True) gives percentile ranks (0.0 to 1.0) within the group
df["cost_pctile_in_type"] = (
    df.groupby("rest_type")["cost_for_two"]
    .transform(lambda x: x.rank(pct=True, na_option="keep"))
    .round(3)
)

# Step 2: Compute rating percentile within each restaurant type
df["rating_pctile_in_type"] = (
    df.groupby("rest_type")["rating"]
    .transform(lambda x: x.rank(pct=True, na_option="keep"))
    .round(3)
)

# Step 3: Define "value for money" = high rating, low cost within its type
value_for_money = df[
    (df["rating_pctile_in_type"] >= 0.75) &    # top 25% by rating in its type
    (df["cost_pctile_in_type"]   <= 0.25)        # bottom 25% by cost in its type
].copy()

result = (
    value_for_money[
        ["name", "location", "rest_type", "rating", "cost_for_two",
         "rating_pctile_in_type", "cost_pctile_in_type", "cuisines"]
    ]
    .dropna(subset=["rating", "cost_for_two"])
    .sort_values("rating", ascending=False)
    .head(20)
)
print(f"Value-for-money restaurants found: {len(value_for_money)}")
print(result.to_string(index=False))
```

> **`rank(pct=True)` gives a value between 0 and 1 representing the percentile of that row within the group.** A restaurant at the 95th percentile of cost in its type (`cost_pctile_in_type = 0.95`) is among the 5% most expensive for its category. This is far more meaningful than comparing raw costs across restaurant types (a fine dining restaurant at Rs.1200 might be cheap for its type; a quick bites restaurant at Rs.600 might be expensive for its type).

---

## Question 20
### For each location, find the single highest-rated restaurant. Use `groupby().idxmax()` to do this efficiently.

**Concepts:** `groupby().idxmax()`, using index values to slice the original DataFrame, `loc[]`

---

### Answer

```python
# Method 1 — idxmax() returns the INDEX of the max-rated row per group
idx_of_best = df.groupby("location")["rating"].idxmax()
# idx_of_best is a Series: index=location, values=row index in df

best_per_location = df.loc[idx_of_best.values][
    ["name", "location", "rating", "cost_for_two", "rest_type", "cuisines", "votes"]
].sort_values("rating", ascending=False)

print(best_per_location.head(20).to_string(index=False))


# Method 2 — sort + groupby().first() (alternative approach)
best_per_location_v2 = (
    df.sort_values("rating", ascending=False)
    .groupby("location")
    .first()
    .reset_index()
    [["location", "name", "rating", "cost_for_two", "rest_type"]]
    .sort_values("rating", ascending=False)
)
print(best_per_location_v2.head(10))


# Method 3 — groupby().apply() with nlargest (top 3 instead of top 1)
top3_per_location = (
    df.dropna(subset=["rating"])
    .groupby("location")[["name", "rating", "cost_for_two"]]
    .apply(lambda g: g.nlargest(3, "rating"))
    .reset_index(drop=True)
)
print(top3_per_location.head(15))
```

> **`idxmax()` vs `sort + first()`:**
> - `idxmax()` is O(n) per group — faster
> - `sort + first()` is O(n log n) but more readable and generalises to "top k" easily
> - For "top 1", use `idxmax()`. For "top k", use `nlargest()` inside `apply()`.
>
> **Important gotcha with `idxmax()` and NaN:** If a group has all `NaN` ratings, `idxmax()` raises an error. Use `df.dropna(subset=["rating"])` before calling if this is a risk.

---

## Question 21
### Create a `crosstab` showing the count of restaurants for every combination of `listing_type` and `online_order`. Then normalise it two ways: by row and by column. What does each normalisation tell you?

**Concepts:** `pd.crosstab()`, `normalize='index'` vs `normalize='columns'` vs `normalize=True`

---

### Answer

```python
# --- Raw counts ---
ct_counts = pd.crosstab(
    index   = df["listing_type"],
    columns = df["online_order"],
    margins = True,
    margins_name = "Total"
)
print("Raw Counts:")
print(ct_counts)

# --- Normalize by ROW (index) ---
# "Of all Delivery restaurants, what % accept online orders?"
ct_row = pd.crosstab(
    index     = df["listing_type"],
    columns   = df["online_order"],
    normalize = "index"
).round(3)
print("\nNormalized by Row (% within each listing type):")
print(ct_row)
# Shows: Delivery → almost all Yes. Buffet → mostly No. Etc.

# --- Normalize by COLUMN ---
# "Of all restaurants that DO accept online orders, what % are Delivery type?"
ct_col = pd.crosstab(
    index     = df["listing_type"],
    columns   = df["online_order"],
    normalize = "columns"
).round(3)
print("\nNormalized by Column (% within each order type):")
print(ct_col)

# --- Normalize across entire table ---
# "What % of ALL restaurants are Delivery + Yes online order?"
ct_all = pd.crosstab(
    index     = df["listing_type"],
    columns   = df["online_order"],
    normalize = True
).round(4)
print("\nNormalized across entire table:")
print(ct_all)
```

> **The three normalizations answer three completely different questions:**
>
> | `normalize` value | Question answered |
> |---|---|
> | `"index"` (row-wise) | "Within each listing type, what share accepts online orders?" |
> | `"columns"` (column-wise) | "Among online-order restaurants, what share is each listing type?" |
> | `True` (whole table) | "What fraction of ALL restaurants are in each combination?" |
>
> Confusing these is a very common analytical error. Always state which normalisation you applied and why before interpreting the numbers.

---

## Question 22
### Identify duplicate restaurant entries. Some restaurants appear in the dataset multiple times (same name, different listing type). How many truly unique restaurant names are there? For restaurants that appear multiple times, is there any systematic difference in how they are listed?

**Concepts:** `duplicated()`, `nunique()`, `groupby().filter()`, understanding what "duplicate" means in context

---

### Answer

```python
# --- How many unique restaurant names? ---
total_rows   = len(df)
unique_names = df["name"].nunique()
print(f"Total rows     : {total_rows:,}")
print(f"Unique names   : {unique_names:,}")
print(f"Duplicate rows : {total_rows - unique_names:,}")

# --- True duplicates: same name, same location, same listing_type ---
true_dupes = df.duplicated(subset=["name", "location", "listing_type"], keep=False)
print(f"\nTrue duplicates (same name+location+type): {true_dupes.sum():,}")

# --- Restaurants that appear under multiple listing_types ---
listing_counts = (
    df.groupby("name")["listing_type"]
    .nunique()
    .reset_index()
    .rename(columns={"listing_type": "listing_type_count"})
)
multi_listed = listing_counts[listing_counts["listing_type_count"] > 1]
print(f"\nRestaurants appearing under multiple listing types: {len(multi_listed):,}")
print(multi_listed.sort_values("listing_type_count", ascending=False).head(10))

# --- See an example ---
example_name = multi_listed.iloc[0]["name"]
example_rows = df[df["name"] == example_name][
    ["name", "location", "listing_type", "rating", "votes", "online_order"]
]
print(f"\nAll entries for '{example_name}':")
print(example_rows)
```

> **"Duplicate" in this dataset has a specific meaning.** A restaurant like "Truffles" appears as "Delivery" AND "Dine-out" as two separate rows — because it is listed under two categories on Zomato. These are NOT errors to drop. They represent different Zomato pages for the same physical restaurant. If you want one row per restaurant, you need to decide: take the row with the most votes? Average the ratings? The right answer depends on the question you're asking.
>
> **`duplicated(subset=[...], keep=False)`:** The `keep=False` flag marks ALL occurrences of duplicates (not just the second+). This lets you see and inspect every duplicated row. `keep='first'` keeps the first and marks the rest; `keep='last'` keeps the last.

---

---

# SECTION 6 — Advanced Multi-Step Analysis (Questions 23–27)
### Questions that combine multiple pandas techniques in a single analytical pipeline

---

## Question 23
### Build a full neighbourhood comparison report: for each location with at least 50 restaurants, show the number of restaurants, average rating, median cost, % with online orders, % with table booking, and the most common restaurant type.

**Concepts:** Multiple aggregations in one `agg()`, custom lambda aggregations, `mode()` in groupby, `reset_index()`, filtering on aggregated results

---

### Answer

```python
# Adding binary flags for easy averaging
df["online_order_flag"] = (df["online_order"] == "Yes").astype(int)
df["book_table_flag"]   = (df["book_table"]   == "Yes").astype(int)

# agg() with a lambda for mode (most common value)
location_report = (
    df.groupby("location")
    .agg(
        restaurant_count   = ("name",              "count"),
        avg_rating         = ("rating",            "mean"),
        median_cost        = ("cost_for_two",      "median"),
        pct_online_order   = ("online_order_flag", "mean"),
        pct_book_table     = ("book_table_flag",   "mean"),
        total_votes        = ("votes",             "sum"),
        top_rest_type      = ("rest_type",         lambda x: x.mode().iloc[0]
                                                   if not x.mode().empty else "Unknown"),
    )
    .round(3)
    .reset_index()
)

# Percentage formatting
location_report["pct_online_order"] = (location_report["pct_online_order"] * 100).round(1)
location_report["pct_book_table"]   = (location_report["pct_book_table"]   * 100).round(1)

# Filter for locations with at least 50 restaurants
location_report = location_report[location_report["restaurant_count"] >= 50]

# Sort by average rating
location_report = location_report.sort_values("avg_rating", ascending=False)

print(f"Locations with 50+ restaurants: {len(location_report)}")
print(location_report.head(15).to_string(index=False))
```

> **`mode()` inside `agg()` with a lambda.** The mode (most common value) is not a built-in aggregation function in pandas groupby. You have to pass a lambda. The `.mode()` method returns a Series (there can be multiple modes), so we take `.iloc[0]` to get the first one. The `if not x.mode().empty else "Unknown"` guard handles groups where all values are NaN.

> **`lambda` inside `agg()` — tradeoffs:**
> - More flexible than built-in aggregation strings
> - Slower on large datasets (not vectorised)
> - For datasets under ~500k rows (like this one), performance is fine
> - For large data, consider computing the lambda column separately and merging it in

---

## Question 24
### For the top 5 locations by restaurant count, build a crosstab showing the distribution of listing types (Delivery, Dine-out, Cafes, etc.). Normalise by row to see the "character" of each neighbourhood.

**Concepts:** Filtering to a subset, `pd.crosstab()` with `normalize`, multi-step pipeline

---

### Answer

```python
# Step 1: Identify top 5 locations
top5_locations = df["location"].value_counts().head(5).index.tolist()
print("Top 5 locations:", top5_locations)

# Step 2: Filter df to only those locations
df_top5 = df[df["location"].isin(top5_locations)]

# Step 3: Crosstab — location vs listing_type, normalised by row
ct = pd.crosstab(
    index     = df_top5["location"],
    columns   = df_top5["listing_type"],
    normalize = "index"   # each row sums to 1.0
).round(3).mul(100).round(1)  # convert to percentages

print("Listing type distribution (%) per top location:")
print(ct)

# Step 4: Also show raw counts for context
ct_raw = pd.crosstab(
    index   = df_top5["location"],
    columns = df_top5["listing_type"],
    margins = True
)
print("\nRaw counts:")
print(ct_raw)
```

> **Why normalise by row here?** Locations have very different numbers of restaurants (BTM might have 1100, another location 200). Raw counts would make BTM look dominant in every category simply because it is larger. Row normalisation lets you compare the *profile* of each area — "what proportion of BTM restaurants are Delivery vs Dine-out?" — on equal footing.

---

## Question 25
### Find cuisine combinations that appear most frequently together (the top 20 most common cuisine pairings). For each pair, show average rating and average cost.

**Concepts:** `str.split()`, `combinations()` from itertools, `Counter`, advanced multi-step analysis

---

### Answer

```python
from itertools import combinations
from collections import Counter

# Step 1: Extract cuisine pairs from each restaurant
pair_counter = Counter()
pair_details = []  # store rating and cost alongside

for _, row in df.dropna(subset=["cuisines"]).iterrows():
    cuisines = [c.strip() for c in row["cuisines"].split(",")]
    if len(cuisines) >= 2:
        for pair in combinations(sorted(cuisines), 2):   # sorted → canonical order
            pair_counter[pair] += 1
            pair_details.append({
                "pair"        : pair,
                "rating"      : row["rating"],
                "cost_for_two": row["cost_for_two"],
            })

# Step 2: Top 20 pairs by frequency
top20_pairs = pair_counter.most_common(20)
pair_df = pd.DataFrame(top20_pairs, columns=["cuisine_pair", "frequency"])

# Step 3: Compute average rating and cost per pair
details_df = pd.DataFrame(pair_details)
pair_stats = (
    details_df.groupby("pair")
    .agg(
        avg_rating = ("rating",       "mean"),
        avg_cost   = ("cost_for_two", "mean"),
    )
    .round(2)
    .reset_index()
)
pair_stats["pair"] = pair_stats["pair"].astype(str)
pair_df["cuisine_pair_str"] = pair_df["cuisine_pair"].astype(str)

# Note: for large datasets, replace iterrows() with a vectorised approach
print(pair_df.head(20))
print("\nTop pairs with stats:")
print(pair_stats.sort_values("avg_rating", ascending=False).head(10))
```

> **`iterrows()` warning:** This approach uses `iterrows()`, which is slow for very large DataFrames. For this ~50k row dataset it runs in a few seconds. For millions of rows, you would use a vectorised approach with `explode()` and a self-join or `apply()`. The logic here is more important than the performance for this dataset.

> **`sorted()` for canonical pairing:** `combinations()` preserves order. To avoid counting `("North Indian", "Chinese")` and `("Chinese", "North Indian")` as different pairs, we `sorted()` the cuisine list first. This ensures every pair is always in alphabetical order.

---

## Question 26
### Using `groupby().transform()`, add a column `votes_zscore_in_location` that shows the z-score of each restaurant's votes relative to other restaurants in the same location. Then identify the restaurants that are statistically unusual (|z-score| > 2).

**Concepts:** Z-score via `transform()` with a lambda, statistical outlier detection, multi-step analysis

---

### Answer

```python
# Z-score = (value - group_mean) / group_std
# transform() broadcasts group mean and std back to each row

df["votes_zscore_loc"] = df.groupby("location")["votes"].transform(
    lambda x: (x - x.mean()) / x.std()
).round(3)

# Restaurants that are statistical outliers in their location (|z| > 2)
outliers = df[df["votes_zscore_loc"].abs() > 2].copy()

print(f"Outlier restaurants (|z-score| > 2): {len(outliers)}")

# Positive outliers — far more popular than their neighbourhood average
popular_outliers = (
    outliers[outliers["votes_zscore_loc"] > 2]
    .sort_values("votes_zscore_loc", ascending=False)
    [["name", "location", "votes", "votes_zscore_loc", "rating", "listing_type"]]
    .head(15)
)
print("\nMost unusually popular restaurants:")
print(popular_outliers.to_string(index=False))

# Why z-score over raw vote count?
print("\n--- Why z-score matters ---")
print("A restaurant with 500 votes in BTM (avg: 200 votes) is more exceptional")
print("than the same 500 votes in Koramangala (avg: 450 votes)")
```

> **Z-score normalisation is the "correct" way to compare within-group standing** when groups have different scales. Using raw votes to compare restaurants across locations is misleading — an area with more restaurants naturally accumulates more votes on average. The z-score removes this location-level bias and tells you how exceptional a restaurant is *relative to its own neighbourhood*.

---

## Question 27
### Build the final "investor report": for a hypothetical new restaurant investor, identify the top 5 locations that have the best combination of: (a) high average rating, (b) moderate average cost (Rs.300–Rs.700), (c) high online order adoption, and (d) moderate competition (between 50 and 200 restaurants). Score each location and rank them.

**Concepts:** Multi-condition filtering, column normalisation with `transform()`/manual min-max scaling, creating a composite score, `sort_values()`

---

### Answer

```python
# Step 1: Build location-level summary
location_inv = (
    df.groupby("location")
    .agg(
        restaurant_count = ("name",              "count"),
        avg_rating       = ("rating",            "mean"),
        avg_cost         = ("cost_for_two",      "mean"),
        online_rate      = ("online_order_flag", "mean"),
    )
    .round(3)
    .reset_index()
)

# Step 2: Apply investor filters
# - Moderate competition: 50–200 restaurants
# - Average cost in the "accessible" range: Rs.300–700
filtered = location_inv[
    (location_inv["restaurant_count"].between(50, 200)) &
    (location_inv["avg_cost"].between(300, 700))
].copy()

print(f"Locations passing filters: {len(filtered)}")

# Step 3: Normalise each metric to 0–1 scale (min-max normalisation)
def minmax(s):
    return (s - s.min()) / (s.max() - s.min())

filtered["score_rating"] = minmax(filtered["avg_rating"])
filtered["score_online"] = minmax(filtered["online_rate"])

# For competition: FEWER restaurants in range = better opportunity
# So invert the scale: lower count → higher score
filtered["score_competition"] = 1 - minmax(filtered["restaurant_count"])

# Step 4: Composite score (equal weights — adjustable)
filtered["composite_score"] = (
    filtered["score_rating"]      * 0.40 +  # rating quality: 40% weight
    filtered["score_online"]      * 0.35 +  # digital readiness: 35% weight
    filtered["score_competition"] * 0.25    # lower competition: 25% weight
).round(4)

# Step 5: Top 5
top5_investment = filtered.nlargest(5, "composite_score")[
    ["location", "restaurant_count", "avg_rating", "avg_cost",
     "online_rate", "composite_score"]
].reset_index(drop=True)

top5_investment["online_rate"] = (top5_investment["online_rate"] * 100).round(1)
top5_investment.index = top5_investment.index + 1   # rank starts at 1

print("\nTop 5 Locations for Restaurant Investment:")
print(top5_investment.to_string())
```

> **Composite scoring with min-max normalisation** is a standard decision analysis technique. The key steps are:
> 1. Normalise each metric to [0,1] so they are comparable in scale
> 2. Invert metrics where "lower is better" (like competition count)
> 3. Apply weights based on business priorities
> 4. Sum to a single score
>
> The weights (40%, 35%, 25%) are a business decision, not a statistical one. A good analyst would document these weights, explain why they were chosen, and run a sensitivity analysis — what if we gave rating 50% weight? Does the ranking change dramatically?

---

---

# Concepts Coverage Checklist

```
BASICS
✅ shape, dtypes, info(), describe()
✅ isnull().sum() — missing value audit with percentages
✅ unique(), nunique(), value_counts(), value_counts(normalize=True)

CLEANING
✅ str.replace() — removing unwanted substrings
✅ replace({...}) — mapping specific values to NaN
✅ pd.to_numeric(errors='coerce') — safe string-to-number conversion
✅ astype("Int64") — nullable integer type for columns with NaN
✅ rename(columns={...}) — clean column renaming
✅ drop(columns=[...], errors='ignore') — safe column dropping

SELECTION & FILTERING
✅ Boolean filtering with single conditions
✅ Boolean filtering with & (AND) and | (OR)
✅ .between() — range filtering
✅ isin([...]) — membership filtering
✅ .loc[] — label-based selection
✅ nlargest() / nsmallest()

STRING OPERATIONS
✅ str.split() — splitting delimited strings
✅ str.strip() — removing whitespace
✅ str.len() — length of each string
✅ str[0] — indexing into a list Series
✅ str.extract(regex) — extracting patterns

MULTI-VALUED COLUMNS (CORE ZOMATO SKILL)
✅ str.split() + explode() — expanding multi-valued cells
✅ str.strip() after explode() — removing phantom duplicates
✅ Working on exploded copy vs original DataFrame

AGGREGATION
✅ groupby().size() vs groupby().count()
✅ groupby().mean(), .sum(), .median(), .min(), .max()
✅ Named aggregations: agg(col_name=("source", "func"))
✅ Multiple aggregations in one agg() call
✅ Lambda inside agg() — e.g., mode()
✅ idxmax() / idxmin() to find the row with max/min value

GROUPBY TRANSFORMS
✅ groupby().transform("mean") — broadcast group mean to rows
✅ groupby().transform(lambda x: ...) — custom group-level computation
✅ rank(pct=True) inside transform — within-group percentiles
✅ Z-score normalisation via transform()

RESHAPING
✅ unstack() — multi-level index to columns
✅ pd.crosstab() — frequency tables
✅ pd.crosstab(normalize='index'/'columns'/True) — row/col/total normalisation
✅ pd.pivot_table() — flexible pivot with aggfunc and margins
✅ reset_index() — after groupby, bringing group keys back to columns

ADVANCED
✅ pd.cut() — custom bin ranges
✅ pd.qcut() — quantile-based bins
✅ duplicated(subset=[...], keep=False)
✅ combinations() from itertools — pair analysis
✅ Composite scoring with min-max normalisation
✅ Multi-step investor analysis pipeline
```

---

*End of Practice Sheet — Zomato Bangalore Dataset*
*Codeverra — learn.codeverra.com*
