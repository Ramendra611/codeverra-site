---
title: "Working with the Real World in Python"
description: "Learn how Python interacts with real-world systems  -  APIs, files, databases, and external libraries."
date: 2026-03-21
author: "codeverra"
toc: true
tocopen: false
draft: false
tags:
  - python
---

# Working with the Real World
### APIs, JSON, Dates, and HTTP Requests in Python

---

## Before We Begin -- What Changes After This Guide

Everything you have learned so far has worked entirely inside your own machine.
You write code, it runs, it produces output, it reads files you already have.

This guide is where that changes.

After this guide your Python programs will be able to:
- Ask a server in another country for the current weather in Mumbai
- Get the latest currency exchange rate between INR and USD
- Pull real-time cricket scores from a sports API
- Send data to a web service and get a response back
- Work with dates and times the way real applications do

This is not tutorial-level Python anymore. This is the Python that powers
every data pipeline, every web application, every automation script, and every
data science project that talks to the outside world.

The three tools you will learn:

- **json** -- the language that APIs speak. Every web service sends and receives data
  in JSON format. You already saw the basics in the modules guide -- here you learn
  everything.

- **datetime** -- the module for working with dates and times. API responses always
  include timestamps. Data always has dates. Understanding datetime properly separates
  code that handles time correctly from code that silently produces wrong answers.

- **requests** -- the most downloaded Python library in the world. The tool that lets
  your Python code speak HTTP -- the same protocol your browser uses to load websites.

By the end, you will build a complete project that calls real public APIs, processes
the responses, handles errors, and presents the output cleanly.

---

## Table of Contents

1. [What is an API and Why Does It Matter?](#1-what-is-an-api-and-why-does-it-matter)
2. [How HTTP Works -- The Request-Response Cycle](#2-how-http-works----the-request-response-cycle)
3. [JSON -- The Language of APIs](#3-json----the-language-of-apis)
4. [The datetime Module -- Complete Guide](#4-the-datetime-module----complete-guide)
5. [The requests Library](#5-the-requests-library)
6. [Query Parameters and Headers](#6-query-parameters-and-headers)
7. [Handling Errors Properly](#7-handling-errors-properly)
8. [POST Requests and Sending Data](#8-post-requests-and-sending-data)
9. [Sessions and Authentication Basics](#9-sessions-and-authentication-basics)
10. [Complete Project -- India Weather and Currency Dashboard](#10-complete-project----india-weather-and-currency-dashboard)
11. [Summary and Key Takeaways](#11-summary-and-key-takeaways)
12. [Practice Questions](#12-practice-questions)
13. [Solutions](#13-solutions)

---

## 1. What is an API and Why Does It Matter?

### The restaurant analogy

Imagine you walk into a restaurant. You cannot walk into the kitchen and
make your own food. Instead, there is a menu -- a defined list of things
you can ask for. You place an order with the waiter. The kitchen prepares
it. The waiter brings it back.

An API (Application Programming Interface) works exactly like this.

- The **menu** is the API documentation -- the list of things you can ask for
- **You** are the client (your Python code)
- The **waiter** is the HTTP protocol
- The **kitchen** is the server
- The **food** is the data you get back

You never see how the kitchen works. You do not need to. You just follow
the menu and get your order back.

### Why APIs exist

Consider these scenarios:

**Weather data:** The Indian Meteorological Department has sensors across the
country collecting real-time weather data. They expose an API so that apps
like weather.com, Zomato (for restaurant delivery ETAs), and farmers'
dashboards can all access that data without each needing to build their
own sensor network.

**Payment processing:** Razorpay and PayU have built complex, secure payment
infrastructure. They expose an API so that every e-commerce site in India
does not have to rebuild that infrastructure. Your food delivery app calls
Razorpay's API when you pay for your order.

**Currency rates:** Banks and financial data providers collect exchange rates.
They expose APIs so that fintech apps, import/export software, and travel
platforms can show accurate conversion rates.

APIs let services share data and functionality without sharing their internal
code or infrastructure.

### REST APIs -- the standard

Most modern APIs are REST APIs (Representational State Transfer). REST is
not a protocol or a technology -- it is a set of conventions for how to
structure an API over HTTP. The conventions are:

```
GET     /students          -- retrieve a list of students
GET     /students/101      -- retrieve student with ID 101
POST    /students          -- create a new student
PUT     /students/101      -- update student 101 (full update)
PATCH   /students/101      -- update student 101 (partial update)
DELETE  /students/101      -- delete student 101
```

Each URL is a **resource**. The HTTP method tells you what to do with it.

---

## 2. How HTTP Works -- The Request-Response Cycle

When your browser loads a webpage, or when your Python code calls an API,
the same thing happens:

```
Your Python Code (Client)
        |
        |  HTTP Request
        |  ┌─────────────────────────────────┐
        |  │ Method:  GET                    │
        |  │ URL:     api.example.com/data   │
        |  │ Headers: Accept: application/json│
        |  │ Body:    (empty for GET)         │
        |  └─────────────────────────────────┘
        |
        ▼  (travels over the internet)
        |
Remote Server
        |
        |  HTTP Response
        |  ┌─────────────────────────────────┐
        |  │ Status:  200 OK                 │
        |  │ Headers: Content-Type: app/json │
        |  │ Body:    {"temperature": 32,    │
        |  │           "city": "Mumbai"}     │
        |  └─────────────────────────────────┘
        |
        ▼
Your Python Code (receives and processes response)
```

### HTTP Status Codes

Status codes tell you what happened. You must always check these in your code.

```
2xx -- Success
  200 OK            -- request succeeded, data in response body
  201 Created       -- resource was created successfully (POST)
  204 No Content    -- success but no data to return (DELETE)

3xx -- Redirection
  301 Moved Permanently   -- URL has changed permanently
  302 Found               -- temporary redirect

4xx -- Client Error (you made a mistake)
  400 Bad Request         -- your request is malformed
  401 Unauthorized        -- authentication required
  403 Forbidden           -- authenticated but not allowed
  404 Not Found           -- the resource does not exist
  422 Unprocessable       -- request understood but invalid data
  429 Too Many Requests   -- you are being rate-limited

5xx -- Server Error (their problem)
  500 Internal Server Error -- something crashed on the server
  502 Bad Gateway           -- server received an invalid response
  503 Service Unavailable   -- server is down or overloaded
```

```python
# In code, always check status codes
response = requests.get("https://api.example.com/data")

if response.status_code == 200:
    data = response.json()
elif response.status_code == 404:
    print("Resource not found")
elif response.status_code == 429:
    print("Rate limited -- wait before retrying")
else:
    print(f"Unexpected status: {response.status_code}")
```

---

## 3. JSON -- The Language of APIs

JSON (JavaScript Object Notation) is the data format that virtually every
modern API uses to send and receive data. Despite the name, it has nothing
to do with JavaScript in practice -- it is a language-independent text format
that maps cleanly to Python's own data structures.

### JSON to Python mapping

```
JSON Type         Python Type       Example
─────────────────────────────────────────────────────
object            dict              {"name": "Aarav"}
array             list              [1, 2, 3]
string            str               "Namaste"
number (int)      int               42
number (float)    float             3.14
true              True              true  →  True
false             False             false →  False
null              None              null  →  None
```

### The four core json functions

```python
import json

# json.loads() -- parse a JSON STRING into a Python object
json_string = '{"name": "Aarav", "city": "Bangalore", "score": 88}'
data = json.loads(json_string)
print(data)           # {'name': 'Aarav', 'city': 'Bangalore', 'score': 88}
print(type(data))     # <class 'dict'>
print(data["name"])   # Aarav

# json.dumps() -- convert a Python object TO a JSON string
student = {
    "name":    "Priya Patel",
    "roll":    102,
    "marks":   [88, 92, 75, 90, 85],
    "active":  True,
    "notes":   None
}
json_out = json.dumps(student)
print(json_out)
# {"name": "Priya Patel", "roll": 102, "marks": [88, 92, 75, 90, 85], "active": true, "notes": null}

# json.dumps() with formatting options
pretty = json.dumps(student, indent=2, sort_keys=True)
print(pretty)
# {
#   "active": true,
#   "marks": [88, 92, 75, 90, 85],
#   "name": "Priya Patel",
#   ...
# }

# json.load() -- read JSON FROM a file
with open("students.json", "r", encoding="utf-8") as f:
    students = json.load(f)

# json.dump() -- write Python object TO a file as JSON
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(student, f, indent=2, ensure_ascii=False)
    # ensure_ascii=False preserves non-ASCII characters (Hindi, Tamil, etc.)
```

### Working with nested JSON

Real API responses are deeply nested. You need to navigate them confidently.

```python
# A typical API response from a cricket scores API
api_response = """
{
    "status": "success",
    "match": {
        "teams": {
            "home": {"name": "India",     "short": "IND", "score": 287},
            "away": {"name": "Australia", "short": "AUS", "score": 245}
        },
        "venue":  "Wankhede Stadium, Mumbai",
        "format": "ODI",
        "status": "India won by 42 runs"
    },
    "top_performers": [
        {"name": "Rohit Sharma",   "runs": 87,  "balls": 76},
        {"name": "Virat Kohli",    "runs": 102, "balls": 95},
        {"name": "Jasprit Bumrah", "wickets": 3, "economy": 4.2}
    ],
    "timestamp": "2024-03-15T19:30:00Z"
}
"""

data = json.loads(api_response)

# Navigate nested structure with chained key access
home_team    = data["match"]["teams"]["home"]["name"]
home_score   = data["match"]["teams"]["home"]["score"]
match_status = data["match"]["status"]
venue        = data["match"]["venue"]

print(f"{home_team}: {home_score}")    # India: 287
print(f"Status: {match_status}")       # India won by 42 runs
print(f"Venue: {venue}")               # Wankhede Stadium, Mumbai

# Access list items
top_scorer = data["top_performers"][1]  # Virat Kohli (index 1)
print(f"Top scorer: {top_scorer['name']} -- {top_scorer['runs']} runs")

# Iterate over the list
print("\nTop Performers:")
for performer in data["top_performers"]:
    if "runs" in performer:
        print(f"  {performer['name']}: {performer['runs']} runs")
    elif "wickets" in performer:
        print(f"  {performer['name']}: {performer['wickets']} wickets")
```

### Safe access with .get()

Real API responses are not always complete. Fields can be missing.
Always use `.get()` with a default when accessing keys that might not exist.

```python
# Risky -- KeyError if field is missing
user_name = data["user"]["profile"]["display_name"]

# Safe -- returns None (or your default) if any key is missing
user_name = (data
             .get("user", {})
             .get("profile", {})
             .get("display_name", "Anonymous"))
```

### Handling non-serialisable types

Some Python objects cannot be converted to JSON directly.
The most common ones you will encounter:

```python
import json
import datetime
from decimal import Decimal

data = {
    "date":   datetime.date.today(),     # not JSON serialisable
    "price":  Decimal("1234.56"),        # not JSON serialisable
    "name":   "Aarav",                   # fine
}

# This raises TypeError
# json.dumps(data)

# Solution 1: Convert manually before serialising
data_clean = {
    "date":  data["date"].isoformat(),    # "2024-03-15"
    "price": float(data["price"]),         # 1234.56
    "name":  data["name"],
}
print(json.dumps(data_clean, indent=2))

# Solution 2: Custom encoder (for when you do this frequently)
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

print(json.dumps(data, indent=2, cls=CustomEncoder))
```

---

## 4. The datetime Module -- Complete Guide

Dates and times are everywhere in real-world data. Every API response has
a timestamp. Every database record has a created_at field. Every report
covers a date range.

Getting date handling right is surprisingly tricky -- timezones, formats,
arithmetic, and parsing all have subtle traps. This section gives you a
complete, practical reference.

### The three main classes

```python
from datetime import date, time, datetime, timedelta, timezone

# date -- year, month, day only
today = date.today()
print(today)           # 2024-03-15
print(type(today))     # <class 'datetime.date'>

# time -- hour, minute, second, microsecond only (no date)
t = time(14, 30, 45)
print(t)               # 14:30:45

# datetime -- date AND time combined (most commonly used)
now = datetime.now()   # local time
print(now)             # 2024-03-15 14:30:45.123456
```

### Creating specific dates and datetimes

```python
from datetime import date, datetime

# Specific date
independence_day = date(1947, 8, 15)
print(independence_day)   # 1947-08-15

# Specific datetime
ipl_match = datetime(2024, 3, 22, 19, 30, 0)   # 7:30 PM on 22 March 2024
print(ipl_match)   # 2024-03-22 19:30:00

# Today and now
print(date.today())     # current date
print(datetime.now())   # current date and time (local timezone)
print(datetime.utcnow()) # current UTC time (timezone-naive)
```

### Formatting -- datetime to string (strftime)

`strftime` = "string format time" -- converts a datetime TO a string.

```python
from datetime import datetime

now = datetime(2024, 3, 15, 14, 30, 45)

# Common format codes
print(now.strftime("%Y-%m-%d"))              # 2024-03-15  (ISO format)
print(now.strftime("%d/%m/%Y"))              # 15/03/2024  (Indian format)
print(now.strftime("%d %B %Y"))              # 15 March 2024
print(now.strftime("%A, %d %B %Y"))          # Friday, 15 March 2024
print(now.strftime("%d %b %Y %H:%M"))        # 15 Mar 2024 14:30
print(now.strftime("%I:%M %p"))              # 02:30 PM
print(now.strftime("%Y-%m-%dT%H:%M:%SZ"))    # 2024-03-15T14:30:45Z (ISO 8601)
```

**Complete format code reference:**

```
Date codes:
  %Y  -- 4-digit year              (2024)
  %y  -- 2-digit year              (24)
  %m  -- Month as zero-padded int  (03)
  %B  -- Full month name           (March)
  %b  -- Abbreviated month         (Mar)
  %d  -- Day as zero-padded int    (15)
  %A  -- Full weekday name         (Friday)
  %a  -- Abbreviated weekday       (Fri)
  %j  -- Day of the year           (075)
  %W  -- Week number               (11)

Time codes:
  %H  -- 24-hour hour (00-23)      (14)
  %I  -- 12-hour hour (01-12)      (02)
  %M  -- Minute (00-59)            (30)
  %S  -- Second (00-59)            (45)
  %f  -- Microsecond (000000-999999)
  %p  -- AM or PM                  (PM)

Timezone:
  %Z  -- Timezone name             (IST)
  %z  -- UTC offset                (+0530)
```

### Parsing -- string to datetime (strptime)

`strptime` = "string parse time" -- converts a string TO a datetime.
This is what you use when an API gives you a date as a string.

```python
from datetime import datetime

# Parse various date string formats
date1 = datetime.strptime("15-03-2024",           "%d-%m-%Y")
date2 = datetime.strptime("March 15, 2024",        "%B %d, %Y")
date3 = datetime.strptime("15/03/24 14:30",        "%d/%m/%y %H:%M")
date4 = datetime.strptime("2024-03-15T14:30:00Z",  "%Y-%m-%dT%H:%M:%SZ")
date5 = datetime.strptime("Fri, 15 Mar 2024",      "%a, %d %b %Y")

print(date1)   # 2024-03-15 00:00:00
print(date4)   # 2024-03-15 14:30:00

# Python 3.7+ -- use fromisoformat() for standard ISO 8601 strings
date6 = datetime.fromisoformat("2024-03-15T14:30:00")
print(date6)   # 2024-03-15 14:30:00

# Python 3.11+ -- fromisoformat() handles the trailing Z
# date7 = datetime.fromisoformat("2024-03-15T14:30:00Z")  # works in 3.11+

# For older Python -- strip the Z manually
api_timestamp = "2024-03-15T14:30:00Z"
date8 = datetime.strptime(api_timestamp, "%Y-%m-%dT%H:%M:%SZ")
```

### Date arithmetic with timedelta

```python
from datetime import date, datetime, timedelta

today = date.today()

# Add or subtract days
tomorrow     = today + timedelta(days=1)
last_week    = today - timedelta(weeks=1)
thirty_days  = today + timedelta(days=30)
two_hours    = datetime.now() + timedelta(hours=2)
ninety_mins  = datetime.now() + timedelta(minutes=90)

print(f"Tomorrow    : {tomorrow}")
print(f"Last week   : {last_week}")
print(f"30 days out : {thirty_days}")

# Difference between two dates
independence_day = date(1947, 8, 15)
diff = today - independence_day
print(f"India has been independent for {diff.days:,} days")
print(f"That is approximately {diff.days // 365} years")

# Comparing dates
deadline = date(2024, 12, 31)
if today > deadline:
    print("Deadline has passed")
elif today == deadline:
    print("Today is the deadline!")
else:
    days_left = (deadline - today).days
    print(f"Deadline in {days_left} days")
```

### Replacing parts of a datetime

```python
from datetime import datetime

now = datetime.now()

# Replace creates a new datetime with specific fields changed
start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
end_of_day   = now.replace(hour=23, minute=59, second=59, microsecond=999999)
first_of_month = now.replace(day=1)

print(f"Start of today : {start_of_day}")
print(f"End of today   : {end_of_day}")
```

### Working with timezones

Timezone handling is one of the trickiest parts of datetime. A common
mistake is mixing timezone-aware and timezone-naive datetime objects.

```python
from datetime import datetime, timezone, timedelta

# UTC -- the universal reference timezone
utc_now = datetime.now(timezone.utc)
print(utc_now)   # 2024-03-15 09:00:00+00:00

# IST (Indian Standard Time) = UTC + 5:30
IST = timezone(timedelta(hours=5, minutes=30))
ist_now = datetime.now(IST)
print(ist_now)   # 2024-03-15 14:30:00+05:30

# Convert UTC to IST
utc_time = datetime(2024, 3, 15, 9, 0, 0, tzinfo=timezone.utc)
ist_time  = utc_time.astimezone(IST)
print(ist_time)  # 2024-03-15 14:30:00+05:30

# Working with API timestamps
# APIs typically return UTC timestamps
api_ts = "2024-03-15T09:00:00Z"
utc_dt = datetime.strptime(api_ts, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
ist_dt = utc_dt.astimezone(IST)
print(f"UTC: {utc_dt.strftime('%H:%M')}  IST: {ist_dt.strftime('%H:%M')}")
# UTC: 09:00  IST: 14:30

# For serious timezone work, use the 'zoneinfo' module (Python 3.9+)
from zoneinfo import ZoneInfo
india_tz    = ZoneInfo("Asia/Kolkata")
ist_now_v2  = datetime.now(india_tz)
print(ist_now_v2)   # 2024-03-15 14:30:00+05:30
```

### Unix timestamps

APIs sometimes return timestamps as Unix timestamps -- seconds since
January 1, 1970 UTC.

```python
import time
from datetime import datetime, timezone

# Current Unix timestamp
ts = time.time()
print(ts)   # 1710500400.123

# Convert Unix timestamp to datetime
dt = datetime.fromtimestamp(ts)           # local time
dt_utc = datetime.fromtimestamp(ts, tz=timezone.utc)  # UTC

print(dt)      # 2024-03-15 14:30:00.123000
print(dt_utc)  # 2024-03-15 09:00:00.123000+00:00

# Convert datetime to Unix timestamp
dt = datetime(2024, 3, 15, 14, 30, 0)
ts = dt.timestamp()
print(ts)   # 1710500400.0
```

---

## 5. The requests Library

`requests` is a third-party library (not in the standard library) that
makes HTTP requests simple and human-friendly. It was created because
Python's built-in `urllib` is verbose and awkward.

```bash
pip install requests
```

### Making your first GET request

```python
import requests

# The simplest possible request
response = requests.get("https://api.restcountries.com/v3.1/name/india")

# What you get back is a Response object
print(type(response))              # <class 'requests.models.Response'>
print(response.status_code)        # 200
print(response.headers["content-type"])   # application/json;charset=utf-8
```

### The Response object -- everything inside it

```python
import requests

response = requests.get("https://api.restcountries.com/v3.1/name/india")

# Status
print(response.status_code)    # 200
print(response.ok)             # True if 200-299, False otherwise

# Content -- three ways to access it
response.text          # response body as a string
response.content       # response body as raw bytes
response.json()        # parse body as JSON -- returns Python dict/list

# Headers
print(response.headers)                          # dict of all headers
print(response.headers.get("content-type"))      # specific header

# URL (after any redirects)
print(response.url)    # the final URL

# Response time
print(response.elapsed)   # timedelta -- how long the request took
```

### A complete example -- RestCountries API

RestCountries (https://restcountries.com) is a free, open API with no
authentication required. It returns data about countries worldwide.

```python
import requests
import json

def get_country_info(country_name):
    """
    Fetch information about a country from the RestCountries API.

    Args:
        country_name (str): Country name to look up

    Returns:
        dict: Country data, or None if not found
    """
    url = f"https://api.restcountries.com/v3.1/name/{country_name}"

    response = requests.get(url)

    if response.status_code == 200:
        # API returns a list -- take the first result
        countries = response.json()
        return countries[0]
    elif response.status_code == 404:
        print(f"Country '{country_name}' not found.")
        return None
    else:
        print(f"Error: {response.status_code}")
        return None


# Fetch India's data
india = get_country_info("India")

if india:
    name        = india["name"]["common"]
    capital     = india["capital"][0]
    population  = india["population"]
    area        = india["area"]
    currencies  = india["currencies"]
    languages   = india["languages"]
    region      = india["region"]
    flag        = india["flag"]

    print(f"\n{flag} {name}")
    print(f"Capital    : {capital}")
    print(f"Population : {population:,}")
    print(f"Area       : {area:,} km²")
    print(f"Region     : {region}")

    # Currencies is a nested dict
    for code, info in currencies.items():
        print(f"Currency   : {info['name']} ({code}, {info['symbol']})")

    # Languages is a dict of code: name
    lang_list = list(languages.values())
    print(f"Languages  : {', '.join(lang_list[:5])}")
```

```
🇮🇳 India
Capital    : New Delhi
Population : 1,428,627,663
Area       : 3,287,590 km²
Region     : Asia
Currency   : Indian rupee (INR, ₹)
Languages  : Hindi, English, Bengali, Telugu, Marathi
```

---

## 6. Query Parameters and Headers

### Query parameters

Query parameters are the `?key=value&key2=value2` part of a URL. They
filter, sort, or configure the data you are requesting.

```python
import requests

# Wrong way -- building URL strings manually (error-prone)
url = "https://api.example.com/matches?sport=cricket&format=T20&season=2024"

# Right way -- pass params as a dict, requests handles encoding
params = {
    "sport":  "cricket",
    "format": "T20",
    "season": 2024,
}
response = requests.get("https://api.example.com/matches", params=params)
print(response.url)
# https://api.example.com/matches?sport=cricket&format=T20&season=2024
# requests handles URL encoding automatically (spaces -> %20, etc.)
```

### Real example -- Open-Meteo Weather API

Open-Meteo (https://open-meteo.com) is a completely free, open weather API.
No account, no API key, no rate limits for reasonable use.

```python
import requests

def get_weather(city_name, latitude, longitude):
    """
    Fetch current weather for a location using Open-Meteo API.
    No API key required.

    Args:
        city_name  (str):   Display name of the city
        latitude   (float): City latitude
        longitude  (float): City longitude

    Returns:
        dict: Weather data
    """
    url    = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude":        latitude,
        "longitude":       longitude,
        "current":         "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        "timezone":        "Asia/Kolkata",
        "forecast_days":   1,
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()   # raises exception for 4xx/5xx

    data    = response.json()
    current = data["current"]

    return {
        "city":        city_name,
        "temperature": current["temperature_2m"],
        "humidity":    current["relative_humidity_2m"],
        "wind_speed":  current["wind_speed_10m"],
        "time":        current["time"],
    }


# Coordinates for major Indian cities
cities = [
    ("Mumbai",    19.0760, 72.8777),
    ("Delhi",     28.6139, 77.2090),
    ("Bangalore", 12.9716, 77.5946),
    ("Chennai",   13.0827, 80.2707),
    ("Kolkata",   22.5726, 88.3639),
]

print("Current Weather in Indian Cities")
print("=" * 50)

for city, lat, lon in cities:
    weather = get_weather(city, lat, lon)
    print(f"\n{weather['city']}")
    print(f"  Temperature : {weather['temperature']}°C")
    print(f"  Humidity    : {weather['humidity']}%")
    print(f"  Wind Speed  : {weather['wind_speed']} km/h")
```

### Headers

Headers carry metadata about your request. The most common ones you will
set or read:

```python
import requests

# Setting request headers
headers = {
    "Accept":          "application/json",   # tell server you want JSON back
    "Content-Type":    "application/json",   # tell server you are sending JSON
    "Authorization":   "Bearer your_token",  # authentication token
    "User-Agent":      "MyApp/1.0",          # identify your application
    "Accept-Language": "en-IN",              # language preference
}

response = requests.get(
    "https://api.example.com/data",
    headers=headers
)

# Reading response headers
print(response.headers["content-type"])
print(response.headers.get("x-rate-limit-remaining", "N/A"))
print(response.headers.get("x-request-id"))
```

---

## 7. Handling Errors Properly

Bad error handling is one of the most common mistakes in code that talks
to APIs. Networks fail. Servers go down. Rate limits are hit.
Your code must handle all of this gracefully.

### The two types of failures

```
1. Network/connection failure
   -- The request never reached the server
   -- Python raises a requests.exceptions.* exception
   -- No status code because there was no response

2. HTTP error response
   -- The server responded, but with an error status code
   -- Python does NOT automatically raise an exception for 4xx/5xx
   -- You must check response.status_code or call response.raise_for_status()
```

### raise_for_status() -- the one-liner check

```python
import requests

response = requests.get("https://api.example.com/data")

# Raises requests.exceptions.HTTPError for 4xx and 5xx responses
# Does nothing for 2xx responses
response.raise_for_status()

# After this line, you know the request succeeded
data = response.json()
```

### Complete error handling pattern

```python
import requests
from requests.exceptions import (
    ConnectionError,    # network unreachable
    Timeout,            # request took too long
    HTTPError,          # 4xx or 5xx response
    RequestException,   # base class for all requests errors
)

def fetch_data(url, params=None, timeout=10):
    """
    Fetch data from an API with comprehensive error handling.

    Returns:
        dict: Parsed JSON data on success
        None: On any failure (with error printed)
    """
    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()   # raises HTTPError for 4xx/5xx
        return response.json()

    except Timeout:
        print(f"Request timed out after {timeout}s: {url}")
        return None

    except ConnectionError:
        print(f"Network error -- cannot connect to: {url}")
        print("Check your internet connection.")
        return None

    except HTTPError as e:
        status = e.response.status_code
        if status == 404:
            print(f"Resource not found (404): {url}")
        elif status == 401:
            print(f"Authentication required (401): {url}")
        elif status == 403:
            print(f"Access forbidden (403): {url}")
        elif status == 429:
            print(f"Rate limit exceeded (429). Wait before retrying.")
        elif status >= 500:
            print(f"Server error ({status}). Try again later.")
        else:
            print(f"HTTP error {status}: {e}")
        return None

    except ValueError as e:
        # response.json() failed -- response was not valid JSON
        print(f"Invalid JSON in response: {e}")
        return None

    except RequestException as e:
        # Catch-all for any other requests error
        print(f"Request failed: {e}")
        return None


# Usage
data = fetch_data(
    "https://api.open-meteo.com/v1/forecast",
    params={"latitude": 28.6, "longitude": 77.2, "current": "temperature_2m"}
)

if data:
    print(f"Temperature in Delhi: {data['current']['temperature_2m']}°C")
```

### Timeouts -- always set them

```python
import requests

# NEVER do this -- will hang forever if server is slow or unresponsive
response = requests.get("https://api.example.com/data")

# ALWAYS set a timeout
# timeout=(connect_timeout, read_timeout)
response = requests.get(
    "https://api.example.com/data",
    timeout=(5, 30)    # 5s to connect, 30s to read response
)

# Or a single value applies to both
response = requests.get("https://api.example.com/data", timeout=10)
```

### Retrying failed requests

```python
import requests
import time

def fetch_with_retry(url, params=None, max_retries=3, backoff=2):
    """
    Fetch a URL with exponential backoff retry logic.

    backoff=2 means: wait 2s, then 4s, then 8s between retries.
    """
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            wait = backoff ** attempt
            print(f"Timeout on attempt {attempt}/{max_retries}. Retrying in {wait}s...")
            time.sleep(wait)

        except requests.exceptions.HTTPError as e:
            # Do not retry client errors (4xx) -- they will not resolve
            if e.response.status_code < 500:
                print(f"Client error {e.response.status_code} -- not retrying.")
                return None
            wait = backoff ** attempt
            print(f"Server error on attempt {attempt}/{max_retries}. Retrying in {wait}s...")
            time.sleep(wait)

        except requests.exceptions.ConnectionError:
            wait = backoff ** attempt
            print(f"Connection error on attempt {attempt}/{max_retries}. Retrying in {wait}s...")
            time.sleep(wait)

    print(f"All {max_retries} attempts failed.")
    return None
```

---

## 8. POST Requests and Sending Data

GET requests retrieve data. POST requests send data to create or update
something on the server.

```python
import requests
import json

# Sending JSON data in the request body
url  = "https://api.example.com/students"
data = {
    "name":   "Aarav Sharma",
    "roll":   201,
    "course": "Data Science",
    "email":  "aarav@example.com"
}

# Method 1: Use json= parameter -- requests sets Content-Type automatically
response = requests.post(url, json=data, timeout=10)

# Method 2: Manually serialise and set headers
headers  = {"Content-Type": "application/json"}
response = requests.post(url, data=json.dumps(data), headers=headers, timeout=10)

# Sending form data (like an HTML form submission)
form_data = {
    "username": "aarav_sharma",
    "password": "secure_password_123"
}
response = requests.post(url, data=form_data, timeout=10)   # not json=, but data=

print(response.status_code)   # 201 if successfully created
if response.status_code == 201:
    created = response.json()
    print(f"Created: {created}")
```

### PUT and PATCH -- updating data

```python
import requests

student_id = 201

# PUT -- full update (replace the entire resource)
full_update = {
    "name":   "Aarav Sharma",
    "roll":   201,
    "course": "Machine Learning",  # changed
    "email":  "aarav@example.com"
}
response = requests.put(
    f"https://api.example.com/students/{student_id}",
    json=full_update,
    timeout=10
)

# PATCH -- partial update (only the fields you want to change)
partial_update = {
    "course": "Machine Learning"   # only updating the course
}
response = requests.patch(
    f"https://api.example.com/students/{student_id}",
    json=partial_update,
    timeout=10
)

# DELETE -- remove a resource
response = requests.delete(
    f"https://api.example.com/students/{student_id}",
    timeout=10
)
print(response.status_code)   # 204 No Content if successfully deleted
```

---

## 9. Sessions and Authentication Basics

### Sessions -- reusing connections and settings

A `Session` object persists settings across multiple requests to the same
server. Useful when you make many requests and want to share headers,
authentication, or cookies.

```python
import requests

# Without session -- you repeat headers every time
headers = {"Authorization": "Bearer my_token", "User-Agent": "MyApp/1.0"}
r1 = requests.get("https://api.example.com/students", headers=headers)
r2 = requests.get("https://api.example.com/courses",  headers=headers)
r3 = requests.get("https://api.example.com/grades",   headers=headers)

# With session -- set headers once, reused for all requests
session = requests.Session()
session.headers.update({
    "Authorization": "Bearer my_token",
    "User-Agent":    "MyApp/1.0",
    "Accept":        "application/json",
})

r1 = session.get("https://api.example.com/students")
r2 = session.get("https://api.example.com/courses")
r3 = session.get("https://api.example.com/grades")

# Sessions also reuse TCP connections -- faster for multiple requests
# Always close the session when done
session.close()

# Or use as a context manager
with requests.Session() as session:
    session.headers.update({"Authorization": "Bearer my_token"})
    r1 = session.get("https://api.example.com/students")
    r2 = session.get("https://api.example.com/courses")
# Session automatically closed here
```

### Authentication -- the common patterns

```python
import requests
from requests.auth import HTTPBasicAuth

# 1. API Key in header (most common for public APIs)
response = requests.get(
    "https://api.example.com/data",
    headers={"X-API-Key": "your_api_key_here"},
    timeout=10
)

# 2. API Key as query parameter
response = requests.get(
    "https://api.example.com/data",
    params={"api_key": "your_api_key_here"},
    timeout=10
)

# 3. Bearer token (JWT -- common in modern APIs)
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
response = requests.get(
    "https://api.example.com/data",
    headers={"Authorization": f"Bearer {token}"},
    timeout=10
)

# 4. Basic authentication (username + password)
response = requests.get(
    "https://api.example.com/data",
    auth=HTTPBasicAuth("username", "password"),
    timeout=10
)
# Shorthand:
response = requests.get(
    "https://api.example.com/data",
    auth=("username", "password"),
    timeout=10
)
```

### Storing API keys safely

**Never hardcode API keys in your source code.** They end up in git history
and can be exposed publicly.

```python
import os
import requests

# WRONG -- never do this
API_KEY = "sk-abc123xyz"

# RIGHT -- read from environment variable
API_KEY = os.environ.get("MY_API_KEY")
if not API_KEY:
    raise ValueError("MY_API_KEY environment variable not set.")

response = requests.get(
    "https://api.example.com/data",
    headers={"Authorization": f"Bearer {API_KEY}"},
    timeout=10
)
```

```bash
# Set the environment variable in your terminal before running
export MY_API_KEY="sk-abc123xyz"
python my_script.py

# Or use a .env file with python-dotenv
# pip install python-dotenv
```

```python
# Using python-dotenv (for .env files)
from dotenv import load_dotenv
import os

load_dotenv()   # reads .env file and sets environment variables
API_KEY = os.environ.get("MY_API_KEY")
```

```
# .env file (add this to .gitignore!)
MY_API_KEY=sk-abc123xyz
DATABASE_URL=postgresql://user:pass@localhost/mydb
```

---

## 10. Complete Project -- India Weather and Currency Dashboard

Now we put everything together. This project:

- Calls the **Open-Meteo API** (free, no auth) for real-time weather data
  for major Indian cities
- Calls the **ExchangeRate API** (free tier, no auth needed for basic use)
  for INR currency conversion
- Parses and formats all timestamps properly using datetime
- Handles all errors gracefully
- Presents a clean dashboard in the terminal

Both APIs are completely free and require no sign-up for basic use.

```python
"""
india_dashboard.py

A real-time dashboard showing:
- Current weather for major Indian cities
- INR exchange rates against major currencies

Uses:
- Open-Meteo API: https://open-meteo.com (free, no auth)
- Open Exchange Rates (simplified): https://open.er-api.com (free tier)
- requests, datetime, json
"""

import requests
import json
from datetime import datetime, timezone, timedelta
from requests.exceptions import RequestException, Timeout, ConnectionError, HTTPError


# ─── Configuration ────────────────────────────────────────────────────────────

# Indian Standard Time = UTC + 5:30
IST = timezone(timedelta(hours=5, minutes=30))

# Major Indian cities with coordinates
CITIES = [
    {"name": "Mumbai",    "lat": 19.0760, "lon": 72.8777},
    {"name": "Delhi",     "lat": 28.6139, "lon": 77.2090},
    {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946},
    {"name": "Chennai",   "lat": 13.0827, "lon": 80.2707},
    {"name": "Kolkata",   "lat": 22.5726, "lon": 88.3639},
    {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
]

# Currencies to compare against INR
TARGET_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AED", "SGD"]

# WMO Weather interpretation codes (simplified)
WEATHER_CODES = {
    0:  "Clear sky",
    1:  "Mainly clear",
    2:  "Partly cloudy",
    3:  "Overcast",
    45: "Foggy",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    80: "Slight showers",
    95: "Thunderstorm",
}


# ─── API Functions ────────────────────────────────────────────────────────────

def fetch_weather(city):
    """
    Fetch current weather for one city using Open-Meteo API.

    Args:
        city (dict): {"name": str, "lat": float, "lon": float}

    Returns:
        dict: Parsed weather data, or None on failure
    """
    url    = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude":      city["lat"],
        "longitude":     city["lon"],
        "current":       ",".join([
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "wind_speed_10m",
            "weather_code",
        ]),
        "timezone":      "Asia/Kolkata",
        "forecast_days": 1,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data    = response.json()
        current = data["current"]

        # Parse the timestamp the API returns
        # Format: "2024-03-15T14:30"
        observed_at = datetime.strptime(current["time"], "%Y-%m-%dT%H:%M")
        observed_at = observed_at.replace(tzinfo=IST)

        # Look up weather description
        weather_code = current.get("weather_code", 0)
        description  = WEATHER_CODES.get(weather_code, f"Code {weather_code}")

        return {
            "city":              city["name"],
            "temperature":       current["temperature_2m"],
            "feels_like":        current["apparent_temperature"],
            "humidity":          current["relative_humidity_2m"],
            "wind_speed":        current["wind_speed_10m"],
            "description":       description,
            "observed_at":       observed_at,
        }

    except Timeout:
        print(f"  [Weather] Timeout fetching {city['name']}")
        return None
    except ConnectionError:
        print(f"  [Weather] No internet connection")
        return None
    except HTTPError as e:
        print(f"  [Weather] HTTP {e.response.status_code} for {city['name']}")
        return None
    except (KeyError, ValueError) as e:
        print(f"  [Weather] Unexpected response format: {e}")
        return None


def fetch_exchange_rates():
    """
    Fetch INR exchange rates using the free Open Exchange Rates API.

    Returns:
        dict: {currency_code: rate_from_1_INR} or None on failure
    """
    # This free endpoint gives rates relative to USD -- we convert to INR
    url = "https://open.er-api.com/v6/latest/INR"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("result") != "success":
            print(f"  [Rates] API returned non-success: {data.get('result')}")
            return None

        # Parse the update timestamp
        # The API returns Unix timestamp
        updated_ts = data.get("time_last_update_unix", 0)
        updated_at = datetime.fromtimestamp(updated_ts, tz=timezone.utc)
        updated_ist = updated_at.astimezone(IST)

        # Extract rates for our target currencies
        all_rates = data.get("rates", {})
        rates = {
            currency: rate
            for currency, rate in all_rates.items()
            if currency in TARGET_CURRENCIES
        }

        return {
            "base":       "INR",
            "rates":      rates,
            "updated_at": updated_ist,
        }

    except Timeout:
        print("  [Rates] Timeout fetching exchange rates")
        return None
    except ConnectionError:
        print("  [Rates] No internet connection")
        return None
    except HTTPError as e:
        print(f"  [Rates] HTTP {e.response.status_code}")
        return None
    except (KeyError, ValueError) as e:
        print(f"  [Rates] Unexpected response format: {e}")
        return None


# ─── Display Functions ────────────────────────────────────────────────────────

def print_header():
    now_ist = datetime.now(IST)
    print("\n" + "=" * 60)
    print("      INDIA DASHBOARD -- LIVE DATA")
    print(f"      {now_ist.strftime('%A, %d %B %Y  %I:%M %p IST')}")
    print("=" * 60)


def print_weather_section(weather_data):
    print("\n  CURRENT WEATHER -- MAJOR INDIAN CITIES")
    print("  " + "-" * 56)
    print(f"  {'City':<12} {'Temp':>6} {'Feels':>6} {'Humidity':>9} {'Wind':>7}  Condition")
    print("  " + "-" * 56)

    for w in weather_data:
        if w is None:
            continue
        print(
            f"  {w['city']:<12}"
            f" {w['temperature']:>5.1f}C"
            f" {w['feels_like']:>5.1f}C"
            f" {w['humidity']:>7}%"
            f" {w['wind_speed']:>5.1f}km/h"
            f"  {w['description']}"
        )

    # Show data freshness
    valid = [w for w in weather_data if w is not None]
    if valid:
        observed = valid[0]["observed_at"]
        print(f"\n  Data observed at: {observed.strftime('%I:%M %p IST')}")


def print_currency_section(rate_data):
    if rate_data is None:
        print("\n  EXCHANGE RATES -- Unavailable")
        return

    print("\n  INR EXCHANGE RATES")
    print("  " + "-" * 40)
    print(f"  {'Currency':<10} {'1 INR =':>15}  {'100 INR =':>12}")
    print("  " + "-" * 40)

    currency_names = {
        "USD": "US Dollar",
        "EUR": "Euro",
        "GBP": "British Pound",
        "JPY": "Japanese Yen",
        "AED": "UAE Dirham",
        "SGD": "Singapore Dollar",
    }

    for currency, rate in rate_data["rates"].items():
        name    = currency_names.get(currency, currency)
        per_100 = rate * 100
        print(
            f"  {currency} ({name[:12]:<12})"
            f" {rate:>10.4f}"
            f"  {per_100:>10.4f}"
        )

    updated = rate_data["updated_at"]
    print(f"\n  Rates updated: {updated.strftime('%d %b %Y, %I:%M %p IST')}")


def print_footer():
    print("\n" + "=" * 60)
    print("  Data sources:")
    print("  Weather : Open-Meteo (open-meteo.com)")
    print("  Rates   : Open Exchange Rates (open.er-api.com)")
    print("=" * 60 + "\n")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print_header()

    # Fetch weather for all cities
    print("\n  Fetching weather data...")
    weather_data = []
    for city in CITIES:
        result = fetch_weather(city)
        weather_data.append(result)

    # Fetch exchange rates
    print("  Fetching exchange rates...")
    rate_data = fetch_exchange_rates()

    # Display everything
    print_weather_section(weather_data)
    print_currency_section(rate_data)
    print_footer()


if __name__ == "__main__":
    main()
```

**Sample output (actual values will reflect real current data):**

```
============================================================
      INDIA DASHBOARD -- LIVE DATA
      Friday, 15 March 2024  02:30 PM IST
============================================================

  Fetching weather data...
  Fetching exchange rates...

  CURRENT WEATHER -- MAJOR INDIAN CITIES
  --------------------------------------------------------
  City          Temp  Feels  Humidity    Wind  Condition
  --------------------------------------------------------
  Mumbai        32.4C  36.1C      78%  18.5km/h  Partly cloudy
  Delhi         28.1C  26.8C      45%  12.3km/h  Clear sky
  Bangalore     26.3C  25.9C      62%   8.4km/h  Mainly clear
  Chennai       34.8C  39.2C      81%  22.1km/h  Partly cloudy
  Kolkata       33.2C  37.5C      74%  15.7km/h  Slight rain
  Hyderabad     31.7C  33.4C      55%  10.2km/h  Clear sky

  Data observed at: 02:15 PM IST

  INR EXCHANGE RATES
  ----------------------------------------
  Currency       1 INR =     100 INR =
  ----------------------------------------
  USD (US Dollar    )    0.0120      1.2000
  EUR (Euro         )    0.0111      1.1100
  GBP (British Pound)    0.0095      0.9500
  JPY (Japanese Yen )    1.8200    182.0000
  AED (UAE Dirham   )    0.0441      4.4100
  SGD (Singapore Dol)    0.0162      1.6200

  Rates updated: 15 Mar 2024, 09:00 AM IST

============================================================
  Data sources:
  Weather : Open-Meteo (open-meteo.com)
  Rates   : Open Exchange Rates (open.er-api.com)
============================================================
```

---

## 11. Summary and Key Takeaways

### What you learned in this guide

**JSON**

- JSON is the universal data format for APIs. It maps directly to Python
  dicts, lists, strings, numbers, booleans, and None.
- `json.loads()` parses a JSON string into Python. `json.dumps()` converts
  Python to a JSON string. `json.load()` / `json.dump()` work with files.
- Always use `.get()` with a default when navigating API responses -- fields
  can be missing in unexpected ways.
- Dates, Decimals, and custom objects are not JSON-serialisable by default.
  Convert them manually or write a custom encoder.

**datetime**

- Use `datetime.now()` for local time, `datetime.now(timezone.utc)` for UTC.
- `strftime` converts datetime TO a string (format for output).
- `strptime` converts a string TO a datetime (parse from input).
- `timedelta` is how you do date arithmetic.
- API timestamps are almost always UTC. Convert to IST using
  `astimezone(IST)` where `IST = timezone(timedelta(hours=5, minutes=30))`.
- For Python 3.9+ use `zoneinfo.ZoneInfo("Asia/Kolkata")` for cleaner timezone handling.
- Timezone-aware and timezone-naive datetimes cannot be mixed. Pick one and
  stay consistent throughout your code.

**requests**

- `requests.get(url, params={}, headers={}, timeout=10)` is the core pattern.
- Always set a timeout. Code without timeouts will hang indefinitely.
- Always handle errors. Networks fail, servers crash, rate limits are hit.
- Use `response.raise_for_status()` as a one-liner to catch 4xx and 5xx errors.
- Use `response.json()` to parse the response body directly into Python.
- Use a `Session` when making multiple requests to the same server.
- Never hardcode API keys. Use environment variables.

---

### The three mental models to keep

**1. The request-response cycle**

Every API call is a conversation. You send a request with a method, URL,
headers, and body. You get back a response with a status code, headers, and body.
The status code tells you what happened before you look at the body.

**2. JSON is just text**

An API response is just a string of text that follows the JSON format.
`response.json()` converts that text into Python objects you can work with.
`json.dumps()` converts Python objects back to text to send in a request body.

**3. Time is always somewhere**

Every datetime exists in a timezone. When you read a timestamp from an API,
always ask: is this UTC or local time? Convert to IST for display in Indian
applications. Store and compare in UTC for consistency.

---

### Common mistakes to avoid

```python
# 1. No timeout -- never do this
requests.get("https://api.example.com/data")

# 2. No error handling -- never do this
response = requests.get(url)
data = response.json()   # crashes if request failed

# 3. Hardcoded API key -- never do this
API_KEY = "sk-abc123"

# 4. Ignoring status code -- never do this
response = requests.get(url)
data = response.json()   # might be an error response

# 5. Mixing timezone-aware and naive datetimes
now = datetime.now()              # naive (no timezone)
utc = datetime.now(timezone.utc)  # aware (UTC)
diff = utc - now                   # TypeError!

# 6. Using string concatenation for URLs
url = "https://api.example.com/data?city=" + city_name + "&format=json"
# Use params= instead -- requests handles encoding for you
```

---

### Where these skills lead

Every project from here builds on what you learned in this guide.

**Data Science:** Pulling datasets from APIs (financial data, sports stats,
census data, weather) for analysis in Pandas.

**Machine Learning:** Calling inference APIs, sending data to model endpoints,
receiving predictions back.

**Backend Engineering:** Building your own APIs with FastAPI or Django REST
Framework -- which means understanding the request-response cycle from the
server side.

**Data Engineering:** Calling third-party data sources, ingesting API data
into databases, scheduling regular data pulls with timestamps.

**Automation:** Sending WhatsApp messages via Twilio API, posting to Slack,
triggering webhooks, interacting with GitHub API.

The pattern is always the same: make a request, check the status, parse the
response, handle the errors. Once this pattern is natural to you, every API
in the world becomes accessible.

---

## 12. Practice Questions

All questions are self-contained. Try each one before reading the solution.
Questions are ordered: Easy (1-5), Medium (6-10), Hard (11-15).

---

### Easy

**Q1 -- JSON Parsing**
Parse the JSON string below and print: the student's name, their highest mark,
and whether they passed (average >= 60).

```python
json_str = '''
{
    "student": {
        "name": "Arjun Mehta",
        "roll": 305,
        "city": "Pune"
    },
    "marks": {
        "maths":   78,
        "science": 55,
        "english": 62,
        "history": 48,
        "cs":      91
    },
    "active": true
}
'''
```

---

**Q2 -- datetime Formatting**
Given the datetime below, print it in five different formats:
1. ISO format: `2024-03-15`
2. Indian format: `15/03/2024`
3. Long format: `Friday, 15 March 2024`
4. Time only: `02:30 PM`
5. Full: `Fri 15 Mar 2024, 14:30:45`

```python
from datetime import datetime
dt = datetime(2024, 3, 15, 14, 30, 45)
```

---

**Q3 -- datetime Parsing**
Parse each of these date strings into a datetime object and print them
all in the same format: `DD-MM-YYYY HH:MM`.

```python
dates = [
    "2024-03-15T09:30:00Z",
    "15 March 2024 09:30",
    "15/03/24 09:30",
    "March 15, 2024 09:30 AM",
]
```

---

**Q4 -- First GET Request**
Use the RestCountries API to fetch information about Japan and print:
- Common name
- Capital city
- Population (formatted with commas)
- Currency name and symbol
- Whether it is a UN member

URL: `https://api.restcountries.com/v3.1/name/japan`

---

**Q5 -- datetime Arithmetic**
Write a function `age_calculator(dob_str)` that takes a date of birth as
`"DD-MM-YYYY"` and returns a tuple of `(years, months, days)` representing
the person's exact age today.

```python
print(age_calculator("15-08-1947"))   # India's independence day
# Expected: something like (76, 7, 0) -- varies by when you run it
```

---

### Medium

**Q6 -- Safe JSON Navigation**
The following API response sometimes has missing fields. Write a function
`extract_profile(response_json)` that safely extracts: name, email, city,
and subscription tier. Use `.get()` with sensible defaults for all fields.

```python
# Sometimes complete
response1 = '{"user": {"name": "Priya", "email": "p@x.com", "location": {"city": "Mumbai"}, "subscription": {"tier": "pro"}}}'

# Sometimes incomplete
response2 = '{"user": {"name": "Rohan"}}'
response3 = '{"error": "user not found"}'
```

---

**Q7 -- Working with Timezones**
An international tech company schedules a meeting at 10:00 AM IST.
Write a function `meeting_times(ist_hour, ist_minute)` that prints the
meeting time in IST, UTC, New York (UTC-5), London (UTC+0 in winter),
Dubai (UTC+4), and Singapore (UTC+8).

---

**Q8 -- Error Handling**
Write a robust function `get_country_population(country_name)` that:
- Calls the RestCountries API
- Returns the population as an integer if successful
- Returns None for 404 (country not found)
- Returns None for any network error
- Raises ValueError if the country name is empty
- Never crashes regardless of what the API returns

Test it with: "India", "Brazil", "notacountry", and ""

---

**Q9 -- Multiple API Calls**
Fetch data for five South Asian countries (India, Pakistan, Bangladesh,
Sri Lanka, Nepal) from the RestCountries API and build a comparison table
showing: name, population, area, and capital. Sort by population descending.
Print as a formatted table.

---

**Q10 -- JSON to CSV**
Fetch the top 10 countries by population from RestCountries
(`https://api.restcountries.com/v3.1/all`) and save them to a CSV file
with columns: name, population, area, region, capital.
Use only the standard library (json, csv, requests is fine to use).

---

### Hard

**Q11 -- Weather Comparison**
Using the Open-Meteo API, fetch the weather forecast for the next 7 days
for Mumbai and Delhi. For each day show the max and min temperature for both
cities. Find the day with the greatest temperature difference between the
two cities and print it.

Hint: Add `daily=temperature_2m_max,temperature_2m_min` and
`forecast_days=7` to your params.

---

**Q12 -- Currency Trend Simulator**
Using the exchange rate API from the project, write a function that:
- Takes an amount in INR and a target currency
- Converts it to the target currency
- Simulates what the value would have been if the rate were 5% better or worse
- Prints a comparison showing current value, optimistic value, and pessimistic value
- Formats all monetary values appropriately for the currency (USD with 2 decimals,
  JPY with 0 decimals, etc.)

---

**Q13 -- API Rate Limiter**
Build a `RateLimitedSession` class that wraps `requests.Session` and:
- Accepts a `requests_per_minute` limit
- Tracks when each request was made
- Automatically waits (sleeps) before making a request if the rate limit
  would be exceeded
- Logs every request and wait with a timestamp

```python
session = RateLimitedSession(requests_per_minute=10)
# These 15 calls should automatically pace themselves to stay under 10/min
for city in cities:
    response = session.get(f"https://api.example.com/weather?city={city}")
```

---

**Q14 -- Response Caching**
Build a simple file-based cache for API responses that:
- Stores responses as JSON files named by URL hash
- Accepts a `max_age_seconds` parameter (default 3600 -- one hour)
- Returns cached response if it exists and is not expired
- Fetches fresh data and updates cache if expired or missing
- Has a `clear_cache()` method that removes all cached files

```python
cache = APICache(cache_dir="api_cache", max_age_seconds=3600)

# First call -- fetches from API and caches
data = cache.get("https://api.open-meteo.com/v1/forecast", params={...})

# Second call (within an hour) -- returns from cache, no network request
data = cache.get("https://api.open-meteo.com/v1/forecast", params={...})
```

---

**Q15 -- Full Pipeline**
Build a complete data pipeline that:
1. Fetches the list of all countries from RestCountries API
2. Filters to Asian countries only
3. For each Asian country, extracts: name, capital, population, area, currencies
4. Saves the raw API response to `raw_countries.json`
5. Saves the processed data to `asian_countries.csv`
6. Prints a summary report:
   - Total countries in Asia
   - Most populated country
   - Largest country by area
   - Number of unique currencies used
   - Countries that use INR (Indian Rupee)
7. All API calls must have error handling and timeouts
8. The entire pipeline must complete within 30 seconds or raise TimeoutError

---

## 13. Solutions

---

### Q1 -- JSON Parsing

```python
import json

json_str = '''
{
    "student": {"name": "Arjun Mehta", "roll": 305, "city": "Pune"},
    "marks": {"maths": 78, "science": 55, "english": 62, "history": 48, "cs": 91},
    "active": true
}
'''

data   = json.loads(json_str)
name   = data["student"]["name"]
marks  = list(data["marks"].values())
avg    = sum(marks) / len(marks)
passed = avg >= 60

print(f"Name    : {name}")
print(f"Highest : {max(marks)}")
print(f"Average : {avg:.1f}")
print(f"Result  : {'Pass' if passed else 'Fail'}")
```

---

### Q2 -- datetime Formatting

```python
from datetime import datetime

dt = datetime(2024, 3, 15, 14, 30, 45)

print(dt.strftime("%Y-%m-%d"))              # 2024-03-15
print(dt.strftime("%d/%m/%Y"))              # 15/03/2024
print(dt.strftime("%A, %d %B %Y"))          # Friday, 15 March 2024
print(dt.strftime("%I:%M %p"))              # 02:30 PM
print(dt.strftime("%a %d %b %Y, %H:%M:%S")) # Fri 15 Mar 2024, 14:30:45
```

---

### Q3 -- datetime Parsing

```python
from datetime import datetime

dates = [
    ("2024-03-15T09:30:00Z",    "%Y-%m-%dT%H:%M:%SZ"),
    ("15 March 2024 09:30",     "%d %B %Y %H:%M"),
    ("15/03/24 09:30",          "%d/%m/%y %H:%M"),
    ("March 15, 2024 09:30 AM", "%B %d, %Y %I:%M %p"),
]

for date_str, fmt in dates:
    dt = datetime.strptime(date_str, fmt)
    print(dt.strftime("%d-%m-%Y %H:%M"))
```

---

### Q4 -- RestCountries Japan

```python
import requests

response = requests.get(
    "https://api.restcountries.com/v3.1/name/japan",
    timeout=10
)
response.raise_for_status()
japan = response.json()[0]

name    = japan["name"]["common"]
capital = japan["capital"][0]
pop     = japan["population"]
un      = japan.get("unMember", False)

currencies = japan.get("currencies", {})
for code, info in currencies.items():
    currency = f"{info['name']} ({info.get('symbol', code)})"

print(f"Name      : {name}")
print(f"Capital   : {capital}")
print(f"Population: {pop:,}")
print(f"Currency  : {currency}")
print(f"UN Member : {'Yes' if un else 'No'}")
```

---

### Q5 -- Age Calculator

```python
from datetime import date

def age_calculator(dob_str):
    """Return (years, months, days) of age from 'DD-MM-YYYY' string."""
    dob   = date(*reversed([int(x) for x in dob_str.split("-")]))
    today = date.today()

    years  = today.year - dob.year
    months = today.month - dob.month
    days   = today.day - dob.day

    if days < 0:
        months -= 1
        # Days in previous month
        prev_month = today.month - 1 if today.month > 1 else 12
        prev_year  = today.year if today.month > 1 else today.year - 1
        import calendar
        days += calendar.monthrange(prev_year, prev_month)[1]

    if months < 0:
        years  -= 1
        months += 12

    return years, months, days

years, months, days = age_calculator("15-08-1947")
print(f"India's age: {years} years, {months} months, {days} days")
```

---

### Q6 -- Safe JSON Navigation

```python
import json

def extract_profile(response_json):
    try:
        data = json.loads(response_json)
    except json.JSONDecodeError:
        return {"name": "Unknown", "email": "N/A", "city": "N/A", "tier": "free"}

    user = data.get("user", {})
    return {
        "name":  user.get("name",  "Unknown"),
        "email": user.get("email", "N/A"),
        "city":  user.get("location", {}).get("city", "N/A"),
        "tier":  user.get("subscription", {}).get("tier", "free"),
    }

response1 = '{"user": {"name": "Priya", "email": "p@x.com", "location": {"city": "Mumbai"}, "subscription": {"tier": "pro"}}}'
response2 = '{"user": {"name": "Rohan"}}'
response3 = '{"error": "user not found"}'

for r in [response1, response2, response3]:
    print(extract_profile(r))
```

---

### Q7 -- Timezone Meeting Times

```python
from datetime import datetime, timezone, timedelta

def meeting_times(ist_hour, ist_minute):
    IST       = timezone(timedelta(hours=5,  minutes=30))
    UTC       = timezone.utc
    NEW_YORK  = timezone(timedelta(hours=-5))
    LONDON    = timezone(timedelta(hours=0))
    DUBAI     = timezone(timedelta(hours=4))
    SINGAPORE = timezone(timedelta(hours=8))

    ist_time = datetime.now(IST).replace(
        hour=ist_hour, minute=ist_minute, second=0, microsecond=0
    )

    zones = [
        ("IST (India)",     IST),
        ("UTC",             UTC),
        ("New York",        NEW_YORK),
        ("London",          LONDON),
        ("Dubai",           DUBAI),
        ("Singapore",       SINGAPORE),
    ]

    print(f"Meeting scheduled for {ist_time.strftime('%I:%M %p')} IST:")
    for label, tz in zones:
        local_time = ist_time.astimezone(tz)
        print(f"  {label:<18}: {local_time.strftime('%I:%M %p %Z')}")

meeting_times(10, 0)
```

---

### Q8 -- Robust Country Population

```python
import requests
from requests.exceptions import RequestException

def get_country_population(country_name):
    if not country_name or not country_name.strip():
        raise ValueError("Country name cannot be empty.")

    try:
        response = requests.get(
            f"https://api.restcountries.com/v3.1/name/{country_name.strip()}",
            timeout=10
        )
        if response.status_code == 404:
            print(f"Country not found: {country_name}")
            return None
        response.raise_for_status()
        data = response.json()
        return data[0]["population"]

    except RequestException as e:
        print(f"Network error: {e}")
        return None
    except (KeyError, IndexError, ValueError):
        print(f"Unexpected response format for: {country_name}")
        return None


for country in ["India", "Brazil", "notacountry"]:
    pop = get_country_population(country)
    if pop:
        print(f"{country}: {pop:,}")

try:
    get_country_population("")
except ValueError as e:
    print(f"Error: {e}")
```

---

### Q9 -- South Asian Countries Table

```python
import requests

countries = ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal"]
data      = []

for country in countries:
    try:
        resp = requests.get(
            f"https://api.restcountries.com/v3.1/name/{country}",
            timeout=10
        )
        resp.raise_for_status()
        info    = resp.json()[0]
        capital = info.get("capital", ["N/A"])[0]
        data.append({
            "name":       info["name"]["common"],
            "population": info["population"],
            "area":       info.get("area", 0),
            "capital":    capital,
        })
    except Exception as e:
        print(f"Failed for {country}: {e}")

data.sort(key=lambda x: x["population"], reverse=True)

print(f"\n{'Country':<15} {'Population':>14} {'Area (km²)':>12} {'Capital'}")
print("-" * 55)
for d in data:
    print(f"{d['name']:<15} {d['population']:>14,} {d['area']:>12,.0f}  {d['capital']}")
```

---

### Q10 -- Q15

Questions 10 through 15 are extended project-level exercises.
Full solutions are available on learn.codeverra.com.

**Guidance:**

- Q10: Use `response.json()` to get all countries, sort by population, slice top 10, use csv.DictWriter
- Q11: Add `daily=temperature_2m_max,temperature_2m_min` to params, parse `data["daily"]`
- Q12: Fetch rate once, compute `amount * rate`, then `amount * rate * 1.05` and `* 0.95`
- Q13: Use `collections.deque` to track request timestamps, `time.sleep()` to throttle
- Q14: Use `hashlib.md5(url.encode()).hexdigest()` for filename, `json` for storage, `os.path.getmtime()` for age
- Q15: Chain all steps in a `main()` function, wrap each step in try/except

---

## 14. What Comes Next

With this guide complete, here is where you stand in the curriculum:

| Phase | Topic | Status |
|---|---|---|
| Phase 1 | Python Basics | Complete |
| Phase 1 | Control Flow | Coming soon |
| Phase 1 | Loops | Complete |
| Phase 1 | Collections | Complete |
| Phase 2 | Functions | Complete |
| Phase 2 | Exception Handling | Complete |
| Phase 2 | File Handling | Complete |
| Phase 2 | Modules and Packages | Complete |
| Phase 2 | OOP | Complete |
| Phase 3 | NumPy | Complete |
| Phase 3 | Pandas | Complete |
| Phase 3 | Matplotlib | Complete |
| Phase 3 | Seaborn | Complete |
| Phase 3 | Working with the Real World | Complete -- this guide |

**Next in the series:** Git Basics -- version control for every Python developer.

---

*Made with care for Codeverra learners | codeverra.com*
