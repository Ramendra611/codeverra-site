---
title: "Complete Guide to Pandas in Python"
description: "Complete practice session on Pandas in python"

date: 2026-03-18
lastmod: 2026-03-18
author: "codeverra"

toc: true
tocopen: true
draft: false
tags:
  - python
  - pandas
  - data-analysis


cover:
  image: "images/pandas-practice.png"
  alt: "Python programming"
  caption: "Python syllabus"
  relative: true
  hidden: false
---

# 🐼 Pandas Masterclass
### *From Raw Data to Real Insights - A Beginner's Guide to Data Analysis in Python*

---

> **Who is this for?**
> You've done the NumPy Masterclass (or know the basics of Python and arrays).
> Now you want to work with **real tabular data**  -  rows, columns, missing values, merges, and group-level summaries.
> That's exactly what Pandas is for.

---

## 📌 Table of Contents

1. [What is Pandas and Why Do You Need It?](#1-what-is-pandas-and-why-do-you-need-it)
2. [Installing and Importing Pandas](#2-installing-and-importing-pandas)
3. [The Two Core Data Structures](#3-the-two-core-data-structures)
4. [Creating DataFrames](#4-creating-dataframes)
5. [Reading and Writing Data](#5-reading-and-writing-data)
6. [Exploring a DataFrame](#6-exploring-a-dataframe)
7. [Selecting Data  -  loc, iloc, and Column Access](#7-selecting-data--loc-iloc-and-column-access)
8. [Filtering Rows](#8-filtering-rows)
9. [Adding, Modifying, and Dropping Columns](#9-adding-modifying-and-dropping-columns)
10. [Sorting Data](#10-sorting-data)
11. [Handling Missing Data](#11-handling-missing-data)
12. [String Operations](#12-string-operations)
13. [Working with Dates and Times](#13-working-with-dates-and-times)
14. [apply(), map(), and applymap()](#14-apply-map-and-applymap)
15. [GroupBy  -  Aggregation and Split-Apply-Combine](#15-groupby--aggregation-and-split-apply-combine)
16. [Merging and Joining DataFrames](#16-merging-and-joining-dataframes)
17. [Pivot Tables and Crosstabs](#17-pivot-tables-and-crosstabs)
18. [Reshaping  -  melt() and stack()/unstack()](#18-reshaping--melt-and-stackunstack)
19. [MultiIndex DataFrames](#19-multiindex-dataframes)
20. [Performance Tips](#20-performance-tips)
21. [Practice Questions](#21-practice-questions)
22. [What We Covered + What's Next](#22-what-we-covered--whats-next)

---

## 1. What is Pandas and Why Do You Need It?

NumPy arrays are powerful, but they have one limitation: **every column must be the same data type**, and there are no column names or row labels.

Real-world data doesn't look like that. A sales table has strings (city names), integers (quantities), floats (prices), and dates  -  all in the same table.

**Pandas** gives you:

- A `DataFrame`  -  a 2D table with named columns and labeled rows, where each column can be a different type
- A `Series`  -  a single labeled column
- Built-in tools for reading CSVs, Excel files, SQL, and JSON
- Powerful data cleaning (missing values, duplicates, type conversions)
- Grouping, aggregating, merging, pivoting  -  the full analytics toolkit

> **Think of it this way:** NumPy is a calculator. Pandas is a spreadsheet that also knows how to do the math.

---

## 2. Installing and Importing Pandas

```bash
pip install pandas
```

```python
import pandas as pd
import numpy as np   # often used alongside pandas
```

---

## 3. The Two Core Data Structures

### 3.1 Series  -  A Labeled 1D Array

A `Series` is like a single column from a spreadsheet. It has values and an **index** (labels for each row).

```python
# Monthly revenue (₹ lakhs) for a chai shop in Nagpur
revenue = pd.Series(
    [12.5, 15.0, 9.8, 18.2, 22.0, 16.5],
    index=["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    name="Revenue (₹L)"
)
print(revenue)
# Jan    12.5
# Feb    15.0
# Mar     9.8
# Apr    18.2
# May    22.0
# Jun    16.5
# Name: Revenue (₹L), dtype: float64

print(revenue["Apr"])   # 18.2
print(revenue[["Jan", "Mar", "May"]])   # Multiple labels
print(revenue.mean())   # 15.67
```

> A `Series` always has an **index**. By default it's 0, 1, 2... but you can make it anything  -  dates, city names, IDs.

### 3.2 DataFrame  -  A Labeled 2D Table

A `DataFrame` is a collection of `Series` sharing the same index. Think of it as a table where each column is a `Series`.

```python
data = {
    "Name":   ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "City":   ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"],
    "Score":  [85, 92, 78, 95, 70],
    "Grade":  ["B", "A", "B", "A", "C"]
}
df = pd.DataFrame(data)
print(df)
#     Name       City  Score Grade
# 0  Aarav      Delhi     85     B
# 1  Priya     Mumbai     92     A
# 2  Rohan  Bangalore     78     B
# 3  Sneha  Hyderabad     95     A
# 4  Karan       Pune     70     C
```

---

## 4. Creating DataFrames

There are several ways to create a DataFrame depending on what data you start with.

### From a Dictionary

```python
employees = pd.DataFrame({
    "emp_id":     [101, 102, 103, 104, 105],
    "name":       ["Vikram", "Ananya", "Suresh", "Divya", "Rahul"],
    "department": ["Engineering", "HR", "Sales", "Engineering", "Marketing"],
    "salary":     [75000, 55000, 48000, 82000, 60000],
    "city":       ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai"]
})
```

### From a List of Dictionaries

Each dictionary = one row. Very common when reading JSON APIs.

```python
orders = pd.DataFrame([
    {"order_id": 1001, "product": "Laptop",  "qty": 1, "price": 65000},
    {"order_id": 1002, "product": "Mouse",   "qty": 3, "price":  850},
    {"order_id": 1003, "product": "Monitor", "qty": 2, "price": 18000},
])
```

### From NumPy Array

```python
marks_array = np.array([[78, 85, 90], [92, 76, 88], [65, 70, 80]])
df_marks = pd.DataFrame(
    marks_array,
    index=["Aarav", "Priya", "Rohan"],
    columns=["Maths", "Science", "English"]
)
```

### Setting a Custom Index

```python
employees.set_index("emp_id", inplace=True)
# Now rows are labeled by emp_id instead of 0, 1, 2...
```

---

## 5. Reading and Writing Data

In practice, you almost never create DataFrames manually  -  you read them from files.

### Reading CSV

```python
# Read a CSV file
df = pd.read_csv("zomato_bangalore.csv")

# Useful parameters
df = pd.read_csv(
    "zomato_bangalore.csv",
    usecols=["name", "rate", "location", "cuisines"],  # only load these columns
    nrows=500,          # load only first 500 rows (great for large files)
    skiprows=1,         # skip first row if it's not a header
    na_values=["--", "N/A", "none"],   # treat these as NaN
    encoding="utf-8"
)
```

### Writing CSV

```python
df.to_csv("cleaned_data.csv", index=False)   # index=False avoids writing row numbers
```

### Reading Excel

```python
df = pd.read_excel("ipl_stats.xlsx", sheet_name="Season_2023")
df.to_excel("output.xlsx", sheet_name="Results", index=False)
```

### Reading JSON

```python
df = pd.read_json("api_response.json")
df.to_json("output.json", orient="records", indent=2)
```

### Reading from SQL

```python
import sqlite3
conn = sqlite3.connect("sales.db")
df = pd.read_sql("SELECT * FROM orders WHERE city = 'Mumbai'", conn)
```

> **Pro tip:** For large CSV files, use `nrows` first to preview the data before loading everything.

---

## 6. Exploring a DataFrame

The first thing to do when you load any dataset is to **understand its shape and content**. These are your go-to commands.

```python
# Using a sample employee dataset
print(df.shape)          # (105, 5)  -  105 rows, 5 columns
print(df.head())         # First 5 rows
print(df.head(10))       # First 10 rows
print(df.tail())         # Last 5 rows
print(df.sample(5))      # 5 random rows

print(df.columns)        # Column names
print(df.index)          # Row index info
print(df.dtypes)         # Data type of each column
print(df.info())         # Summary: dtypes + non-null counts + memory usage
print(df.describe())     # Statistical summary of numeric columns
print(df.describe(include="all"))  # Include object/string columns too

print(df.nunique())      # Number of unique values per column
print(df["city"].value_counts())   # Frequency count of each city
print(df["city"].unique())         # Distinct city values
print(df.isnull().sum())           # Count of missing values per column
```

> **`df.info()` is your best friend** on a new dataset. It tells you data types AND which columns have nulls  -  both critical for cleaning.

---

## 7. Selecting Data  -  loc, iloc, and Column Access

Pandas gives you multiple ways to select rows and columns. The two main methods are `loc` (label-based) and `iloc` (position-based).

### Column Selection

```python
# Single column → returns a Series
df["name"]

# Multiple columns → returns a DataFrame
df[["name", "city", "salary"]]
```

### Row Selection with loc (label-based)

`loc` uses **index labels** and is **inclusive** on both ends.

```python
# Single row by label
df.loc[101]           # Row with index label 101

# Range of labels
df.loc[101:104]       # Rows 101, 102, 103, 104 (all inclusive)

# Row + column selection
df.loc[101, "name"]               # One cell
df.loc[101:103, ["name", "city"]] # Rows 101-103, specific columns

# All rows, specific column
df.loc[:, "salary"]
```

### Row Selection with iloc (position-based)

`iloc` uses **integer positions** (0-based) and is **exclusive** on the end, like Python slicing.

```python
df.iloc[0]          # First row
df.iloc[-1]         # Last row
df.iloc[0:5]        # Rows 0 to 4 (position 5 excluded)
df.iloc[0, 2]       # Row 0, Column 2 (single cell)
df.iloc[0:3, 1:4]   # Rows 0-2, Columns 1-3
df.iloc[[0, 2, 4]]  # Specific rows by position
```

### Key Difference

```
                loc                     iloc
Rows        Index labels (e.g. 101)   Integer positions (0, 1, 2...)
End point   Inclusive                 Exclusive (like Python slice)
Best for    Named/custom indexes      Default integer indexes
```

---

## 8. Filtering Rows

Filtering is how you answer questions like "show me all orders from Hyderabad above ₹10,000."

### Single Condition

```python
employees = pd.DataFrame({
    "name":       ["Vikram", "Ananya", "Suresh", "Divya", "Rahul", "Pooja", "Amit"],
    "department": ["Engineering", "HR", "Sales", "Engineering", "Marketing", "HR", "Sales"],
    "salary":     [75000, 55000, 48000, 82000, 60000, 52000, 45000],
    "city":       ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Delhi"],
    "experience": [4, 2, 6, 5, 3, 1, 7]
})

# Engineers
engineers = employees[employees["department"] == "Engineering"]

# Salary above 60k
high_earners = employees[employees["salary"] > 60000]

# City is Delhi
delhi_team = employees[employees["city"] == "Delhi"]
```

### Multiple Conditions

```python
# Use & for AND, | for OR  -  always wrap each condition in parentheses

# Engineers in Bangalore
eng_blr = employees[
    (employees["department"] == "Engineering") &
    (employees["city"] == "Bangalore")
]

# Sales OR HR department
support = employees[
    (employees["department"] == "Sales") |
    (employees["department"] == "HR")
]

# Experience between 3 and 6 years
mid_level = employees[
    (employees["experience"] >= 3) &
    (employees["experience"] <= 6)
]
```

### isin()  -  Filter by List of Values

```python
# Employees in specific cities
metro_employees = employees[employees["city"].isin(["Mumbai", "Delhi", "Bangalore"])]

# Exclude a list of departments
non_tech = employees[~employees["department"].isin(["Engineering", "Data Science"])]
```

### between()  -  Numeric Range Filter

```python
mid_salary = employees[employees["salary"].between(50000, 70000)]
```

### query()  -  SQL-style Filtering

```python
# Cleaner syntax for complex filters
result = employees.query("salary > 60000 and city == 'Bangalore'")
result = employees.query("department in ['HR', 'Sales'] and experience >= 3")
```

---

## 9. Adding, Modifying, and Dropping Columns

### Adding New Columns

```python
# Direct assignment
employees["annual_salary"] = employees["salary"] * 12

# Conditional column
employees["level"] = np.where(employees["experience"] >= 5, "Senior", "Junior")

# Calculated from multiple columns
employees["salary_per_year_exp"] = employees["salary"] / employees["experience"]
```

### Modifying Existing Columns

```python
# Apply a transformation to a whole column
employees["salary"] = employees["salary"] * 1.10   # 10% hike for everyone

# Conditional update using loc
employees.loc[employees["experience"] >= 5, "salary"] *= 1.15  # extra 15% for seniors
```

### Renaming Columns

```python
employees.rename(columns={
    "name": "employee_name",
    "city": "work_city"
}, inplace=True)

# Rename all columns at once
employees.columns = ["emp_name", "dept", "sal", "city", "exp", "annual_sal", "level", "sal_per_exp"]
```

### Dropping Columns and Rows

```python
# Drop column
employees.drop(columns=["salary_per_year_exp"], inplace=True)

# Drop multiple columns
employees.drop(columns=["level", "annual_salary"], inplace=True)

# Drop rows by index label
employees.drop(index=[2, 4], inplace=True)

# Drop rows matching a condition
employees = employees[employees["salary"] >= 40000]  # keep only salary >= 40k
```

### Reordering Columns

```python
# Specify the exact column order you want
employees = employees[["name", "city", "department", "experience", "salary"]]
```

---

## 10. Sorting Data

```python
students = pd.DataFrame({
    "name":    ["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera"],
    "city":    ["Delhi", "Mumbai", "Delhi", "Hyderabad", "Mumbai", "Bangalore"],
    "marks":   [85, 92, 78, 95, 70, 88],
    "subject": ["Maths", "Science", "Maths", "English", "Science", "Maths"]
})

# Sort by single column (ascending by default)
students.sort_values("marks")

# Sort descending
students.sort_values("marks", ascending=False)

# Sort by multiple columns
students.sort_values(["city", "marks"], ascending=[True, False])
# → Cities sorted A-Z, within each city marks sorted high to low

# Sort by index
students.sort_index()

# Reset index after sorting
students = students.sort_values("marks", ascending=False).reset_index(drop=True)
# drop=True prevents old index from becoming a column
```

---

## 11. Handling Missing Data

Real datasets always have missing values. Pandas represents them as `NaN` (Not a Number) for numeric columns and `None`/`NaN` for object columns.

```python
import numpy as np

df = pd.DataFrame({
    "name":    ["Anjali", "Deepak", "Ritu", "Mohan", "Kavya"],
    "age":     [25, np.nan, 30, 28, np.nan],
    "city":    ["Jaipur", "Delhi", None, "Mumbai", "Pune"],
    "income":  [45000, 60000, np.nan, np.nan, 52000]
})
```

### Detecting Missing Values

```python
df.isnull()           # True/False for each cell
df.isnull().sum()     # Count of nulls per column
df.isnull().sum() / len(df) * 100  # Percentage missing

df.notnull()          # Inverse  -  True where NOT null
```

### Dropping Missing Values

```python
# Drop rows with ANY null value
df.dropna()

# Drop rows only if ALL values are null
df.dropna(how="all")

# Drop rows only if specific columns have nulls
df.dropna(subset=["income", "age"])

# Drop columns with more than 50% missing
threshold = len(df) * 0.5
df.dropna(thresh=threshold, axis=1)
```

### Filling Missing Values

```python
# Fill with a fixed value
df["city"].fillna("Unknown", inplace=True)

# Fill numeric columns with mean/median
df["age"].fillna(df["age"].mean(), inplace=True)
df["income"].fillna(df["income"].median(), inplace=True)

# Forward fill  -  use the previous row's value
df["income"].fillna(method="ffill")

# Backward fill  -  use the next row's value
df["income"].fillna(method="bfill")

# Fill different columns with different values
df.fillna({"age": df["age"].mean(), "city": "Unknown", "income": 0})
```

### Interpolation

Useful for time series data where filling with mean doesn't make sense.

```python
# Monthly temperatures in Shimla (some readings missing)
temps = pd.Series([15.0, np.nan, 17.5, np.nan, np.nan, 20.0])
temps.interpolate()   # Fills gaps linearly between known values
# [15.0, 16.25, 17.5, 18.33, 19.17, 20.0]
```

---

## 12. String Operations

Pandas provides a `.str` accessor to apply string methods to an entire Series at once  -  no loops needed.

```python
df = pd.DataFrame({
    "name":    ["  aarav sharma ", "PRIYA SINGH", "rohan Mehta", "sneha PATEL"],
    "email":   ["aarav@gmail.com", "priya@yahoo.com", "rohan@outlook.com", "sneha@gmail.com"],
    "city":    ["New Delhi", "Mumbai", "Bengaluru", "Surat"],
    "pincode": ["110001", "400001", "560001", "395001"]
})

# Case
df["name"].str.upper()
df["name"].str.lower()
df["name"].str.title()
df["name"].str.strip()          # Remove leading/trailing spaces

# Checking content
df["email"].str.contains("gmail")             # [True, False, False, True]
df["email"].str.endswith(".com")
df["name"].str.startswith("A")

# Extracting
df["email"].str.split("@").str[0]             # Get username part
df["email"].str.split("@").str[1]             # Get domain part
df["name"].str.len()                           # Length of each string
df["city"].str[:3]                             # First 3 characters

# Replacing
df["name"].str.replace("  ", " ")
df["pincode"].str.replace("^1", "2", regex=True)  # Regex replace

# Counting and finding
df["name"].str.count("a")                     # Count 'a' in each name
df["city"].str.find("u")                      # Position of 'u'
```

---

## 13. Working with Dates and Times

Date handling is one of Pandas' killer features. Once a column is a proper `datetime`, you unlock a whole set of operations.

```python
# Sample sales data
df = pd.DataFrame({
    "order_date": ["2024-01-15", "2024-03-22", "2024-07-04", "2024-11-12", "2024-12-25"],
    "customer":   ["Arjun", "Meera", "Sameer", "Lata", "Vijay"],
    "amount":     [1200, 3500, 800, 4200, 2100]
})

# Convert string to datetime
df["order_date"] = pd.to_datetime(df["order_date"])
print(df.dtypes)   # order_date → datetime64[ns]
```

### Extracting Date Components

```python
df["year"]    = df["order_date"].dt.year
df["month"]   = df["order_date"].dt.month
df["day"]     = df["order_date"].dt.day
df["weekday"] = df["order_date"].dt.day_name()      # 'Monday', 'Tuesday'...
df["quarter"] = df["order_date"].dt.quarter
df["week"]    = df["order_date"].dt.isocalendar().week
```

### Date Arithmetic

```python
# Time since order
df["days_since_order"] = (pd.Timestamp.today() - df["order_date"]).dt.days

# Add/subtract time
df["delivery_date"] = df["order_date"] + pd.Timedelta(days=5)
df["return_window"] = df["order_date"] + pd.DateOffset(months=1)
```

### Filtering by Date

```python
# Orders after July 2024
df[df["order_date"] > "2024-07-01"]

# Orders in a specific range
df[df["order_date"].between("2024-03-01", "2024-09-30")]

# Orders in Q4
df[df["order_date"].dt.quarter == 4]
```

### Resampling Time Series

```python
# Monthly sales total (requires datetime index)
df.set_index("order_date", inplace=True)
monthly = df["amount"].resample("ME").sum()    # Month-end frequency
quarterly = df["amount"].resample("QE").mean()

# Available frequencies: 'D' (day), 'W' (week), 'ME' (month-end),
# 'QE' (quarter-end), 'YE' (year-end)
```

---

## 14. apply(), map(), and applymap()

These three methods let you apply custom functions to your data in different ways.

### map()  -  Element-wise on a Series

Apply a function or mapping to each element of a **Series**.

```python
students = pd.DataFrame({
    "name":  ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "marks": [85, 92, 78, 95, 60]
})

# Using a dictionary mapping
grade_map = {85: "B", 92: "A+", 78: "B+", 95: "A+", 60: "D"}
students["grade_dict"] = students["marks"].map(grade_map)

# Using a lambda function
students["marks_normalized"] = students["marks"].map(lambda x: round(x / 100, 2))
```

### apply()  -  Row-wise or Column-wise on a DataFrame

The most powerful and flexible method. Apply a function along rows (`axis=1`) or columns (`axis=0`).

```python
# apply() on a single column (same as map)
students["grade"] = students["marks"].apply(lambda x:
    "A+" if x >= 90 else
    "A"  if x >= 80 else
    "B"  if x >= 70 else "C"
)

# apply() across rows (axis=1)  -  access multiple columns at once
students["result_summary"] = students.apply(
    lambda row: f"{row['name']} scored {row['marks']} and got {row['grade']}",
    axis=1
)

# apply() with a named function
def classify_performance(marks):
    if marks >= 90: return "Distinction"
    elif marks >= 75: return "First Class"
    elif marks >= 60: return "Second Class"
    else: return "Pass"

students["performance"] = students["marks"].apply(classify_performance)
```

```python
# apply() across columns (axis=0)  -  summarize each column
df_scores = pd.DataFrame({
    "Maths":   [78, 92, 65, 88],
    "Science": [85, 76, 70, 91],
    "English": [90, 88, 80, 75]
})

# Range (max - min) for each subject
df_scores.apply(lambda col: col.max() - col.min(), axis=0)

# Total marks for each student
df_scores.apply(lambda row: row.sum(), axis=1)
```

### DataFrame.map() (formerly applymap)  -  Element-wise on Entire DataFrame

Apply a function to every single cell.

```python
# Round all values to 1 decimal place
df_scores_float = df_scores / 3.0
df_scores_float.map(lambda x: round(x, 1))
```

> **Quick guide:**
> - **`Series.map()`** → every element of one column
> - **`DataFrame.apply(axis=1)`** → every row (can use multiple columns)
> - **`DataFrame.apply(axis=0)`** → every column (summarize each column)
> - **`DataFrame.map()`** → every single cell in the whole DataFrame

---

## 15. GroupBy  -  Aggregation and Split-Apply-Combine

GroupBy is one of the most important Pandas features. It splits your data into groups, applies a function to each group, and combines the results.

```python
# E-commerce order data  -  a Flipkart-style dataset
orders = pd.DataFrame({
    "order_id":  [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
    "customer":  ["Aarav", "Priya", "Aarav", "Rohan", "Priya", "Sneha", "Rohan", "Aarav", "Sneha", "Priya"],
    "city":      ["Delhi", "Mumbai", "Delhi", "Bangalore", "Mumbai", "Hyderabad", "Bangalore", "Delhi", "Hyderabad", "Mumbai"],
    "category":  ["Electronics", "Clothing", "Books", "Electronics", "Books", "Clothing", "Electronics", "Books", "Electronics", "Clothing"],
    "amount":    [15000, 2500, 450, 32000, 350, 1800, 28000, 600, 22000, 3200],
    "status":    ["Delivered", "Delivered", "Delivered", "Pending", "Delivered", "Delivered", "Delivered", "Cancelled", "Delivered", "Delivered"]
})
```

### Basic GroupBy

```python
# Total amount per customer
orders.groupby("customer")["amount"].sum()

# Average order value per city
orders.groupby("city")["amount"].mean()

# Count of orders per category
orders.groupby("category")["order_id"].count()
```

### Multiple Aggregations with agg()

```python
# Multiple stats per category
orders.groupby("category")["amount"].agg(["sum", "mean", "count", "max", "min"])

# Custom names for aggregations
orders.groupby("category")["amount"].agg(
    total_revenue=("sum"),
    avg_order=("mean"),
    order_count=("count")
)

# Different aggregations for different columns
orders.groupby("city").agg({
    "amount":   ["sum", "mean"],
    "order_id": "count"
})
```

### GroupBy on Multiple Columns

```python
# Revenue by city AND category
orders.groupby(["city", "category"])["amount"].sum()

# Orders by city and status
orders.groupby(["city", "status"])["order_id"].count()
```

### transform()  -  GroupBy Without Reducing

`transform` applies a function to each group but **returns a result the same size as the original DataFrame**  -  very useful for adding group-level stats back to the original rows.

```python
# Add "city_avg_order" as a new column (same value for all rows in the same city)
orders["city_avg_order"] = orders.groupby("city")["amount"].transform("mean")

# Flag orders that are above their city's average
orders["above_city_avg"] = orders["amount"] > orders["city_avg_order"]
```

### filter()  -  Keep Only Groups That Meet a Condition

```python
# Keep only cities where total revenue > 30000
high_rev_cities = orders.groupby("city").filter(lambda g: g["amount"].sum() > 30000)
```

---

## 16. Merging and Joining DataFrames

Combining data from multiple tables is a daily task in data analysis. Pandas `merge()` works like SQL JOINs.

```python
# Customer details
customers = pd.DataFrame({
    "cust_id":  [1, 2, 3, 4, 5],
    "name":     ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "city":     ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"],
    "tier":     ["Gold", "Silver", "Gold", "Platinum", "Silver"]
})

# Orders placed
orders = pd.DataFrame({
    "order_id": [101, 102, 103, 104, 105, 106],
    "cust_id":  [1, 2, 1, 3, 6, 4],       # cust_id 6 doesn't exist in customers
    "product":  ["Laptop", "Phone", "Tablet", "TV", "Watch", "Headphones"],
    "amount":   [65000, 18000, 32000, 45000, 9500, 4200]
})
```

### Inner Join (default)  -  Only matching rows

```python
merged = pd.merge(orders, customers, on="cust_id")
# Only orders where cust_id exists in both tables (cust_id 6 dropped)
```

### Left Join  -  All rows from left, match from right

```python
merged = pd.merge(orders, customers, on="cust_id", how="left")
# All 6 orders kept; cust_id=6 gets NaN for customer columns
```

### Right Join  -  All rows from right, match from left

```python
merged = pd.merge(orders, customers, on="cust_id", how="right")
# All 5 customers kept; Karan (no orders) gets NaN for order columns
```

### Outer Join  -  All rows from both

```python
merged = pd.merge(orders, customers, on="cust_id", how="outer")
# All customers + all orders; NaN where no match
```

### Merging on Different Column Names

```python
# If the join key has different names in each table
pd.merge(orders, customers,
         left_on="cust_id",
         right_on="customer_id")
```

### concat()  -  Stack DataFrames

Use `concat` when tables have the same structure (same columns) and you want to stack them.

```python
# Q1 and Q2 sales data
q1_sales = pd.DataFrame({"month": ["Jan","Feb","Mar"], "revenue": [120, 135, 118]})
q2_sales = pd.DataFrame({"month": ["Apr","May","Jun"], "revenue": [145, 160, 152]})

# Stack vertically (add more rows)
full_h1 = pd.concat([q1_sales, q2_sales], ignore_index=True)

# Stack horizontally (add more columns)
pd.concat([df1, df2], axis=1)
```

### Join Types Summary

```
INNER  → Only rows with a match in BOTH tables
LEFT   → All rows from the LEFT table; NaN if no match on right
RIGHT  → All rows from the RIGHT table; NaN if no match on left
OUTER  → All rows from BOTH tables; NaN where no match
```

---

## 17. Pivot Tables and Crosstabs

### pivot_table()  -  Spreadsheet-style Summarization

If you've used pivot tables in Excel, this is the same idea  -  but in code.

```python
ipl = pd.DataFrame({
    "player":  ["Kohli", "Rohit", "Dhoni", "Kohli", "Rohit", "Bumrah", "Dhoni", "Kohli"],
    "team":    ["RCB", "MI", "CSK", "RCB", "MI", "MI", "CSK", "RCB"],
    "season":  [2022, 2022, 2022, 2023, 2023, 2023, 2023, 2023],
    "runs":    [405, 380, 220, 639, 442, 5, 250, 741],
    "matches": [16, 14, 14, 17, 16, 14, 15, 17]
})

# Pivot: Average runs per player per season
pivot = ipl.pivot_table(
    values="runs",
    index="player",
    columns="season",
    aggfunc="sum",
    fill_value=0       # Replace NaN with 0
)
print(pivot)

# Multiple values and aggregation functions
ipl.pivot_table(
    values=["runs", "matches"],
    index="team",
    aggfunc={"runs": "sum", "matches": "mean"}
)

# Add row/column totals with margins
ipl.pivot_table(values="runs", index="team", columns="season",
                aggfunc="sum", margins=True, margins_name="Total")
```

### crosstab()  -  Frequency Tables

Crosstab is a shortcut for counting combinations of categorical variables.

```python
employees = pd.DataFrame({
    "department": ["Engineering", "HR", "Sales", "Engineering", "HR", "Sales", "Engineering"],
    "city":       ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Delhi", "Mumbai", "Bangalore"],
    "level":      ["Senior", "Junior", "Senior", "Junior", "Senior", "Junior", "Senior"]
})

# Count of employees per department per city
pd.crosstab(employees["department"], employees["city"])

# With percentages
pd.crosstab(employees["department"], employees["city"], normalize="index")  # Row %
pd.crosstab(employees["department"], employees["city"], normalize="columns") # Column %

# With a values column (not just counts)
pd.crosstab(employees["department"], employees["level"],
            values=np.random.randint(40000, 90000, 7),
            aggfunc="mean")
```

---

## 18. Reshaping  -  melt() and stack()/unstack()

Sometimes your data is in the wrong shape for analysis. These tools reshape it.

### melt()  -  Wide to Long Format

"Wide" data has one column per category. "Long" data has a category column and a value column. Long format is required by most plotting libraries.

```python
# Wide format: one column per subject
wide = pd.DataFrame({
    "student": ["Aarav", "Priya", "Rohan"],
    "Maths":   [78, 92, 65],
    "Science": [85, 76, 70],
    "English": [90, 88, 80]
})

# Melt to long format
long = pd.melt(
    wide,
    id_vars=["student"],         # columns to keep as-is
    value_vars=["Maths", "Science", "English"],  # columns to unpivot
    var_name="subject",          # name for the new category column
    value_name="marks"           # name for the new value column
)
print(long)
#   student  subject  marks
# 0   Aarav    Maths     78
# 1   Priya    Maths     92
# 2   Rohan    Maths     65
# 3   Aarav  Science     85
# ... and so on
```

### pivot()  -  Long to Wide Format (inverse of melt)

```python
# Convert long back to wide
wide_again = long.pivot(index="student", columns="subject", values="marks")
wide_again.columns.name = None   # Clean up the column axis name
wide_again.reset_index(inplace=True)
```

### stack() and unstack()

```python
# stack() moves column labels → row labels (makes DataFrame taller)
# unstack() moves row labels → column labels (makes DataFrame wider)

df = pd.DataFrame({
    "Q1": [100, 200],
    "Q2": [150, 250]
}, index=["Delhi", "Mumbai"])

stacked = df.stack()
# Delhi   Q1    100
#         Q2    150
# Mumbai  Q1    200
#         Q2    250

unstacked = stacked.unstack()   # back to original shape
```

---

## 19. MultiIndex DataFrames

Sometimes one level of indexing isn't enough. MultiIndex lets you have hierarchical row or column labels.

```python
# Create MultiIndex from tuples
index = pd.MultiIndex.from_tuples([
    ("Delhi",   "Q1"), ("Delhi",   "Q2"),
    ("Mumbai",  "Q1"), ("Mumbai",  "Q2"),
    ("Chennai", "Q1"), ("Chennai", "Q2"),
], names=["City", "Quarter"])

revenue = pd.Series([120, 145, 180, 210, 95, 115], index=index)
print(revenue)

# Selecting with MultiIndex
revenue["Delhi"]          # All Delhi quarters
revenue["Delhi", "Q1"]    # Specific cell
revenue.loc["Mumbai":"Chennai"]  # Range of cities
```

### MultiIndex on DataFrames

```python
arrays = [
    ["North", "North", "South", "South"],
    ["Delhi", "Chandigarh", "Chennai", "Bangalore"]
]
multi_idx = pd.MultiIndex.from_arrays(arrays, names=["Zone", "City"])

df_multi = pd.DataFrame({
    "Sales":    [450, 120, 380, 290],
    "Expenses": [200, 80,  170, 140]
}, index=multi_idx)

# Select entire zone
df_multi.loc["North"]

# Select specific city
df_multi.loc[("South", "Chennai")]

# Cross-section
df_multi.xs("Delhi", level="City")
```

### Flattening MultiIndex

```python
# After groupby with multiple aggregations, flatten column MultiIndex
df.columns = ["_".join(col).strip() for col in df.columns.values]
```

---

## 20. Performance Tips

As your datasets grow, these habits will save you real time.

### Use Appropriate Data Types

```python
# Check memory usage
df.info(memory_usage="deep")
df.memory_usage(deep=True)

# Downcast integers
df["age"] = pd.to_numeric(df["age"], downcast="integer")  # int64 → int8 if possible

# Convert low-cardinality string columns to 'category'
# (e.g. a 'city' column with 10 unique cities repeated 1 million times)
df["city"] = df["city"].astype("category")
df["department"] = df["department"].astype("category")
# Can cut memory by 10-50x for string columns!
```

### Avoid Loops  -  Use Vectorized Operations

```python
# SLOW  -  Python loop
for i in range(len(df)):
    df.loc[i, "tax"] = df.loc[i, "salary"] * 0.30

# FAST  -  vectorized
df["tax"] = df["salary"] * 0.30
```

### Use query() for Readable Filters

```python
# Avoids creating temporary boolean Series
result = df.query("salary > 60000 and city == 'Bangalore' and experience >= 3")
```

### Read Only What You Need

```python
# Only load required columns
df = pd.read_csv("large_file.csv", usecols=["name", "city", "amount"])

# Load in chunks for very large files
for chunk in pd.read_csv("huge_file.csv", chunksize=10000):
    process(chunk)
```

### copy() to Avoid SettingWithCopyWarning

```python
# When slicing a DataFrame and modifying it, always copy first
subset = df[df["city"] == "Delhi"].copy()
subset["new_col"] = "value"   # Safe  -  no warning
```

---

## 21. Practice Questions

Work through these on your own. They cover the full range of what you've learned.

---

**Q1  -  DataFrame Creation and Exploration**
Create a DataFrame for 8 students with columns: `name`, `city`, `marks_theory`, `marks_practical`. Add a `total` column and display basic statistics using `describe()`.

---

**Q2  -  loc and iloc**
Using the DataFrame below, extract:
- Rows where `emp_id` is between 102 and 104 using `loc`
- The last 3 rows using `iloc`
- The salary and city columns for the first 2 rows
```python
df = pd.DataFrame({
    "emp_id":     [101, 102, 103, 104, 105],
    "name":       ["Vikram", "Ananya", "Suresh", "Divya", "Rahul"],
    "salary":     [75000, 55000, 48000, 82000, 60000],
    "city":       ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai"]
}).set_index("emp_id")
```

---

**Q3  -  Filtering**
Using the Zomato-style dataset below, find:
- All restaurants in Koramangala with rating above 4.0
- Restaurants that serve "North Indian" OR "Chinese" cuisine
- Restaurants with votes between 500 and 2000
```python
zomato = pd.DataFrame({
    "name":     ["The Fatty Bao", "Truffles", "Meghana Foods", "Smoke House Deli", "Vidyarthi Bhavan"],
    "location": ["Koramangala", "Koramangala", "Koramangala", "Indiranagar", "Gandhi Bazaar"],
    "cuisine":  ["Asian", "American", "North Indian", "American", "South Indian"],
    "rating":   [4.1, 4.4, 4.2, 4.0, 4.5],
    "votes":    [4200, 9800, 7600, 3200, 12000],
    "cost_for2":[800, 600, 500, 1100, 150]
})
```

---

**Q4  -  Missing Data**
Load the dataset below and:
- Count nulls in each column
- Fill `age` with the median, `city` with "Unknown", `salary` with column mean
- Drop rows where both `age` and `salary` are null
```python
df = pd.DataFrame({
    "name":   ["Arjun", "Bhavna", "Chirag", "Divya", "Esha"],
    "age":    [28, None, 32, None, 25],
    "city":   ["Pune", None, "Delhi", "Surat", None],
    "salary": [50000, 65000, None, None, 48000]
})
```

---

**Q5  -  String Operations**
Given the dataset below:
- Standardize `name` to title case and strip whitespace
- Extract the domain from each email (e.g. "gmail.com")
- Find all customers from Gmail
```python
df = pd.DataFrame({
    "name":  ["  arjun SHARMA", "PRIYA patel ", "rohan VERMA"],
    "email": ["arjun@gmail.com", "priya@yahoo.in", "rohan@gmail.com"]
})
```

---

**Q6  -  Date Operations**
Given a dataset of Diwali sale orders:
- Convert `order_date` to datetime
- Extract month name and day of week
- Find all orders placed in October
- Calculate how many days ago each order was placed
```python
df = pd.DataFrame({
    "order_date": ["2024-10-15", "2024-10-22", "2024-11-01", "2024-10-28", "2024-11-05"],
    "customer":   ["Ravi", "Sita", "Arjun", "Deepa", "Mohan"],
    "amount":     [5000, 3200, 8900, 4100, 2200]
})
```

---

**Q7  -  apply() and map()**
Using the employee dataset:
- Use `apply()` to create an `experience_band` column: "Fresher" (<2yr), "Mid-level" (2–5yr), "Senior" (>5yr)
- Use `map()` to create a `city_tier` column (Delhi/Mumbai/Bangalore = Tier 1, others = Tier 2)
```python
employees = pd.DataFrame({
    "name":       ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "city":       ["Delhi", "Pune", "Mumbai", "Jaipur", "Bangalore"],
    "experience": [1, 3, 7, 4, 2]
})
```

---

**Q8  -  GroupBy**
Using the IPL dataset:
- Find total runs per team
- Find average strike rate per player
- Find the team with the most boundaries (fours + sixes)
- Use `transform` to add a column showing each player's team's total runs alongside each row
```python
ipl = pd.DataFrame({
    "player":  ["Rohit", "Kohli", "Dhoni", "Jadeja", "Bumrah", "Surya", "Shubman"],
    "team":    ["MI", "RCB", "CSK", "CSK", "MI", "MI", "GT"],
    "runs":    [440, 639, 210, 180, 15, 380, 520],
    "fours":   [42, 55, 20, 18, 1, 35, 48],
    "sixes":   [20, 30, 10, 8, 0, 22, 25],
    "sr":      [148, 145, 125, 120, 100, 165, 140]
})
```

---

**Q9  -  Merging**
You have two tables: `students` and `exam_results`. Merge them to:
- Show all students even if they didn't appear in the exam
- Show only students who appeared in the exam
- Find students with no exam record
```python
students = pd.DataFrame({
    "student_id": [1, 2, 3, 4, 5],
    "name": ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "class": ["10A", "10B", "10A", "10B", "10A"]
})
exam_results = pd.DataFrame({
    "student_id": [1, 2, 3, 5],
    "score": [88, 91, 74, 65],
    "grade": ["A", "A+", "B", "C"]
})
```

---

**Q10  -  Pivot Table**
Using the sales data below, create a pivot table showing total `revenue` for each `product` across each `city`. Add row and column totals.
```python
sales = pd.DataFrame({
    "city":    ["Delhi","Delhi","Mumbai","Mumbai","Bangalore","Bangalore","Delhi","Mumbai"],
    "product": ["Laptop","Phone","Laptop","Tablet","Phone","Laptop","Tablet","Phone"],
    "revenue": [65000, 18000, 62000, 32000, 16000, 70000, 28000, 20000]
})
```

---

**Q11  -  melt() and Reshape**
The table below is in wide format. Melt it into long format with columns `student`, `subject`, and `marks`. Then find the subject-wise average.
```python
wide = pd.DataFrame({
    "student": ["Aarav", "Priya", "Rohan", "Sneha"],
    "Maths":   [78, 92, 65, 88],
    "Science": [85, 76, 70, 91],
    "English": [90, 88, 80, 85],
    "History": [72, 80, 68, 79]
})
```

---

**Q12  -  Performance Optimization**
Take the dataset below (or create a similar one with 100,000 rows using `pd.concat`) and:
- Check memory usage before and after
- Convert `city` and `department` to category dtype
- Rewrite the salary filter (salary > 60000) using `query()` instead of boolean indexing
```python
import numpy as np
n = 100000
df = pd.DataFrame({
    "name":       [f"emp_{i}" for i in range(n)],
    "department": np.random.choice(["Engineering", "HR", "Sales", "Marketing"], n),
    "city":       np.random.choice(["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"], n),
    "salary":     np.random.randint(30000, 150000, n),
    "experience": np.random.randint(0, 20, n)
})
```

---

**Q13  -  Full Analysis Pipeline**
You are given sales data from a fictional Indian retail chain. Answer the following:
1. Which city has the highest average order value?
2. What percentage of orders are "Delivered" vs "Cancelled"?
3. Which product category generates the most revenue?
4. Add a column `revenue_tier`: "High" (≥10000), "Medium" (3000–9999), "Low" (<3000)
5. Find customers who have placed more than 2 orders
6. Which month had peak revenue?
```python
np.random.seed(42)
n = 200
sales = pd.DataFrame({
    "order_id":   range(1001, 1001+n),
    "order_date": pd.date_range("2024-01-01", periods=n, freq="2D"),
    "customer":   np.random.choice(["Aarav","Priya","Rohan","Sneha","Karan","Meera","Arjun","Divya"], n),
    "city":       np.random.choice(["Delhi","Mumbai","Bangalore","Hyderabad","Pune","Chennai"], n),
    "category":   np.random.choice(["Electronics","Clothing","Books","Home","Beauty"], n),
    "amount":     np.random.randint(200, 50000, n),
    "status":     np.random.choice(["Delivered","Pending","Cancelled"], n, p=[0.75, 0.15, 0.10])
})
```

---

## 22. What We Covered + What's Next

### ✅ What This Masterclass Covered

| Section | Topics |
|---|---|
| Core Structures | Series, DataFrame, index, dtypes |
| Creating DataFrames | From dict, list, NumPy, custom index |
| Reading & Writing | CSV, Excel, JSON, SQL |
| Exploration | head, info, describe, value_counts, isnull |
| Selection | Column access, loc, iloc |
| Filtering | Boolean masks, isin, between, query |
| Column Operations | Add, modify, rename, drop, reorder |
| Sorting | sort_values, sort_index, reset_index |
| Missing Data | isnull, dropna, fillna, interpolate |
| Strings | .str accessor  -  case, contains, split, replace |
| Dates & Times | to_datetime, dt accessors, resample |
| apply / map | map, apply (row + column), DataFrame.map |
| GroupBy | groupby, agg, transform, filter |
| Merging | merge (inner/left/right/outer), concat |
| Pivoting | pivot_table, crosstab |
| Reshaping | melt, pivot, stack, unstack |
| MultiIndex | Hierarchical indexing, xs |
| Performance | dtypes, category, vectorization, chunked reading |

---

### 🚀 What to Explore Next

**1. Matplotlib & Seaborn**
Visualize your Pandas DataFrames. Line charts, bar plots, histograms, heatmaps, pair plots. Data without visuals is half the story.

**2. Plotly / Plotly Express**
Interactive charts in the browser. Drag, zoom, hover  -  much better for dashboards and presentations.

**3. Real Datasets**
Go to [Kaggle.com](https://kaggle.com) and pick a dataset you care about. IPL, Zomato Bangalore, Indian census, air quality  -  all available free. Real data will teach you more than any masterclass.

**4. Pandas + SQL**
`pd.read_sql()` and `df.to_sql()` let Pandas talk directly to databases. Combined with SQLAlchemy, you can build full data pipelines.

**5. Scikit-learn**
Once your data is clean and shaped with Pandas, Scikit-learn turns it into machine learning models. Feature engineering with Pandas + model training with Scikit-learn is a standard workflow.

**6. Polars**
A newer, faster alternative to Pandas written in Rust. If you ever need to process datasets with tens of millions of rows, Polars is worth learning  -  and the API is similar.

**7. dask**
Pandas for data that doesn't fit in RAM. If you need to process a 50GB CSV, dask wraps Pandas in a parallel, lazy computation model.

---

> **Final thought:**
> Pandas is where most data stories actually get told. The code patterns you've learned here  -  groupby, merge, pivot, filter  -  are the same ones used at every analytics team in the country.
>
> The best next step is simple: open a real Indian dataset (IPL, Zomato, NIFTY 50, census) and start asking questions. The answers are in the data  -  Pandas is just the language to find them. 🇮🇳

---

---

## 23. Practice Question Solutions

---

### Q1 -- DataFrame Creation and Exploration

```python
import pandas as pd

df = pd.DataFrame({
    "name":             ["Aarav", "Priya", "Rohan", "Sneha", "Karan", "Meera", "Arjun", "Divya"],
    "city":             ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Jaipur"],
    "marks_theory":     [78, 92, 65, 88, 55, 81, 70, 95],
    "marks_practical":  [82, 88, 70, 91, 60, 79, 74, 90],
})

df["total"] = df["marks_theory"] + df["marks_practical"]

print(df)
print("\n")
print(df.describe())
```

---

### Q2 -- loc and iloc

```python
df = pd.DataFrame({
    "emp_id":   [101, 102, 103, 104, 105],
    "name":     ["Vikram", "Ananya", "Suresh", "Divya", "Rahul"],
    "salary":   [75000, 55000, 48000, 82000, 60000],
    "city":     ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai"]
}).set_index("emp_id")

# Rows where emp_id (index label) is between 102 and 104 -- loc is label inclusive
print(df.loc[102:104])

# Last 3 rows by position
print(df.iloc[-3:])

# Salary and city columns for the first 2 rows
print(df.iloc[0:2][["salary", "city"]])
# or equivalently:
print(df.loc[101:102, ["salary", "city"]])
```

---

### Q3 -- Filtering

```python
zomato = pd.DataFrame({
    "name":     ["The Fatty Bao", "Truffles", "Meghana Foods", "Smoke House Deli", "Vidyarthi Bhavan"],
    "location": ["Koramangala", "Koramangala", "Koramangala", "Indiranagar", "Gandhi Bazaar"],
    "cuisine":  ["Asian", "American", "North Indian", "American", "South Indian"],
    "rating":   [4.1, 4.4, 4.2, 4.0, 4.5],
    "votes":    [4200, 9800, 7600, 3200, 12000],
    "cost_for2":[800, 600, 500, 1100, 150]
})

# Koramangala restaurants with rating > 4.0
print(zomato[
    (zomato["location"] == "Koramangala") & (zomato["rating"] > 4.0)
])

# North Indian OR Chinese cuisine
print(zomato[zomato["cuisine"].isin(["North Indian", "Chinese"])])

# Votes between 500 and 2000
# Note: none in this dataset fall in that range -- the result will be empty
# The correct approach is:
print(zomato[zomato["votes"].between(500, 2000)])
```

---

### Q4 -- Missing Data

```python
import numpy as np

df = pd.DataFrame({
    "name":   ["Arjun", "Bhavna", "Chirag", "Divya", "Esha"],
    "age":    [28, None, 32, None, 25],
    "city":   ["Pune", None, "Delhi", "Surat", None],
    "salary": [50000, 65000, None, None, 48000]
})

# Count nulls
print(df.isnull().sum())

# Fill age with median, city with "Unknown", salary with mean
df["age"]    = df["age"].fillna(df["age"].median())
df["city"]   = df["city"].fillna("Unknown")
df["salary"] = df["salary"].fillna(df["salary"].mean())

print(df)

# Drop rows where BOTH age and salary were originally null
# (Divya has both null -- she would have been dropped before filling)
df_original = pd.DataFrame({
    "name":   ["Arjun", "Bhavna", "Chirag", "Divya", "Esha"],
    "age":    [28, None, 32, None, 25],
    "city":   ["Pune", None, "Delhi", "Surat", None],
    "salary": [50000, 65000, None, None, 48000]
})
df_dropped = df_original.dropna(subset=["age", "salary"], how="all")
print(df_dropped)
```

---

### Q5 -- String Operations

```python
df = pd.DataFrame({
    "name":  ["  arjun SHARMA", "PRIYA patel ", "rohan VERMA"],
    "email": ["arjun@gmail.com", "priya@yahoo.in", "rohan@gmail.com"]
})

# Standardize name: strip whitespace then title case
df["name"] = df["name"].str.strip().str.title()
print(df["name"])
# Arjun Sharma, Priya Patel, Rohan Verma

# Extract domain (everything after @)
df["domain"] = df["email"].str.split("@").str[1]
print(df["domain"])
# gmail.com, yahoo.in, gmail.com

# Gmail customers
gmail_customers = df[df["email"].str.contains("gmail")]
print(gmail_customers[["name", "email"]])
```

---

### Q6 -- Date Operations

```python
df = pd.DataFrame({
    "order_date": ["2024-10-15", "2024-10-22", "2024-11-01", "2024-10-28", "2024-11-05"],
    "customer":   ["Ravi", "Sita", "Arjun", "Deepa", "Mohan"],
    "amount":     [5000, 3200, 8900, 4100, 2200]
})

# Convert to datetime
df["order_date"] = pd.to_datetime(df["order_date"])

# Extract month name and day of week
df["month_name"] = df["order_date"].dt.month_name()
df["day_of_week"] = df["order_date"].dt.day_name()

print(df[["order_date", "month_name", "day_of_week"]])

# Orders in October
october_orders = df[df["order_date"].dt.month == 10]
print(october_orders)

# Days ago (from today -- output will vary by when you run this)
df["days_ago"] = (pd.Timestamp.today() - df["order_date"]).dt.days
print(df[["customer", "order_date", "days_ago"]])
```

---

### Q7 -- apply() and map()

```python
employees = pd.DataFrame({
    "name":       ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "city":       ["Delhi", "Pune", "Mumbai", "Jaipur", "Bangalore"],
    "experience": [1, 3, 7, 4, 2]
})

# experience_band using apply()
def exp_band(yrs):
    if yrs < 2:
        return "Fresher"
    elif yrs <= 5:
        return "Mid-level"
    else:
        return "Senior"

employees["experience_band"] = employees["experience"].apply(exp_band)

# city_tier using map() with a dictionary
tier_map = {
    "Delhi": "Tier 1", "Mumbai": "Tier 1", "Bangalore": "Tier 1"
}
employees["city_tier"] = employees["city"].map(tier_map).fillna("Tier 2")

print(employees)
```

---

### Q8 -- GroupBy

```python
ipl = pd.DataFrame({
    "player":  ["Rohit", "Kohli", "Dhoni", "Jadeja", "Bumrah", "Surya", "Shubman"],
    "team":    ["MI", "RCB", "CSK", "CSK", "MI", "MI", "GT"],
    "runs":    [440, 639, 210, 180, 15, 380, 520],
    "fours":   [42, 55, 20, 18, 1, 35, 48],
    "sixes":   [20, 30, 10, 8, 0, 22, 25],
    "sr":      [148, 145, 125, 120, 100, 165, 140]
})

# Total runs per team
print(ipl.groupby("team")["runs"].sum())

# Average strike rate per player (each player has one row, so this is just the sr column)
print(ipl.groupby("player")["sr"].mean())

# Team with most boundaries (fours + sixes)
ipl["boundaries"] = ipl["fours"] + ipl["sixes"]
most_boundaries   = ipl.groupby("team")["boundaries"].sum()
print(most_boundaries)
print("Most boundaries:", most_boundaries.idxmax())

# transform: add team's total runs to each player's row
ipl["team_total_runs"] = ipl.groupby("team")["runs"].transform("sum")
print(ipl[["player", "team", "runs", "team_total_runs"]])
```

---

### Q9 -- Merging

```python
students = pd.DataFrame({
    "student_id": [1, 2, 3, 4, 5],
    "name":  ["Aarav", "Priya", "Rohan", "Sneha", "Karan"],
    "class": ["10A", "10B", "10A", "10B", "10A"]
})
exam_results = pd.DataFrame({
    "student_id": [1, 2, 3, 5],
    "score": [88, 91, 74, 65],
    "grade": ["A", "A+", "B", "C"]
})

# All students even if they have no exam record (left join)
all_students = pd.merge(students, exam_results, on="student_id", how="left")
print("Left join (all students):")
print(all_students)

# Only students who appeared in the exam (inner join)
appeared = pd.merge(students, exam_results, on="student_id", how="inner")
print("\nInner join (appeared only):")
print(appeared)

# Students with NO exam record
# After left join, students with no match will have NaN in score
no_record = all_students[all_students["score"].isna()][["student_id", "name", "class"]]
print("\nNo exam record:")
print(no_record)
# Sneha (student_id 4) has no exam record
```

---

### Q10 -- Pivot Table

```python
sales = pd.DataFrame({
    "city":    ["Delhi","Delhi","Mumbai","Mumbai","Bangalore","Bangalore","Delhi","Mumbai"],
    "product": ["Laptop","Phone","Laptop","Tablet","Phone","Laptop","Tablet","Phone"],
    "revenue": [65000, 18000, 62000, 32000, 16000, 70000, 28000, 20000]
})

pivot = sales.pivot_table(
    values="revenue",
    index="product",
    columns="city",
    aggfunc="sum",
    fill_value=0,
    margins=True,
    margins_name="Total"
)

print(pivot)
```

---

### Q11 -- melt() and Reshape

```python
wide = pd.DataFrame({
    "student": ["Aarav", "Priya", "Rohan", "Sneha"],
    "Maths":   [78, 92, 65, 88],
    "Science": [85, 76, 70, 91],
    "English": [90, 88, 80, 85],
    "History": [72, 80, 68, 79]
})

# Melt to long format
long = pd.melt(
    wide,
    id_vars=["student"],
    value_vars=["Maths", "Science", "English", "History"],
    var_name="subject",
    value_name="marks"
)

print(long.head(8))

# Subject-wise average
subject_avg = long.groupby("subject")["marks"].mean().round(1)
print("\nSubject-wise average:")
print(subject_avg)
```

---

### Q12 -- Performance Optimization

```python
import numpy as np

n = 100000
df = pd.DataFrame({
    "name":       [f"emp_{i}" for i in range(n)],
    "department": np.random.choice(["Engineering", "HR", "Sales", "Marketing"], n),
    "city":       np.random.choice(["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"], n),
    "salary":     np.random.randint(30000, 150000, n),
    "experience": np.random.randint(0, 20, n)
})

# Memory before
print("Before:")
print(df.memory_usage(deep=True).sum() / 1024**2, "MB")

# Convert string columns to category
df["department"] = df["department"].astype("category")
df["city"]       = df["city"].astype("category")

# Memory after
print("After category conversion:")
print(df.memory_usage(deep=True).sum() / 1024**2, "MB")

# query() instead of boolean indexing
result_boolean = df[df["salary"] > 60000]
result_query   = df.query("salary > 60000")

print(f"\nRows with salary > 60000: {len(result_query)}")

# Both produce the same result -- query() is more readable for complex filters
```

---

### Q13 -- Full Analysis Pipeline

```python
import numpy as np

np.random.seed(42)
n = 200
sales = pd.DataFrame({
    "order_id":   range(1001, 1001+n),
    "order_date": pd.date_range("2024-01-01", periods=n, freq="2D"),
    "customer":   np.random.choice(["Aarav","Priya","Rohan","Sneha","Karan","Meera","Arjun","Divya"], n),
    "city":       np.random.choice(["Delhi","Mumbai","Bangalore","Hyderabad","Pune","Chennai"], n),
    "category":   np.random.choice(["Electronics","Clothing","Books","Home","Beauty"], n),
    "amount":     np.random.randint(200, 50000, n),
    "status":     np.random.choice(["Delivered","Pending","Cancelled"], n, p=[0.75, 0.15, 0.10])
})

# 1. City with highest average order value
city_avg = sales.groupby("city")["amount"].mean()
print("Highest avg order value city:", city_avg.idxmax())
print(city_avg.sort_values(ascending=False))

# 2. Percentage of Delivered vs Cancelled
status_pct = sales["status"].value_counts(normalize=True) * 100
print("\nOrder status breakdown:")
print(status_pct.round(1))

# 3. Category with most revenue
cat_revenue = sales.groupby("category")["amount"].sum()
print("\nTop revenue category:", cat_revenue.idxmax())
print(cat_revenue.sort_values(ascending=False))

# 4. revenue_tier column
sales["revenue_tier"] = pd.cut(
    sales["amount"],
    bins=[0, 2999, 9999, float("inf")],
    labels=["Low", "Medium", "High"]
)
# Alternative with np.where:
# sales["revenue_tier"] = np.where(sales["amount"] >= 10000, "High",
#                         np.where(sales["amount"] >= 3000, "Medium", "Low"))

print("\nRevenue tier counts:")
print(sales["revenue_tier"].value_counts())

# 5. Customers with more than 2 orders
order_counts    = sales.groupby("customer")["order_id"].count()
repeat_customers = order_counts[order_counts > 2]
print("\nCustomers with more than 2 orders:")
print(repeat_customers)

# 6. Month with peak revenue
sales["month"] = sales["order_date"].dt.month_name()
monthly_rev    = sales.groupby("month")["amount"].sum()
print("\nPeak revenue month:", monthly_rev.idxmax())
print(monthly_rev.sort_values(ascending=False).head(3))
```

---

*Made with care for Codeverra learners | [codeverra.com](https://codeverra.com)*