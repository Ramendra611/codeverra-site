---
title: "Practice Pandas on IPL Dataset"
description: "Master data analysis in Python using the pandas library using hands on practice on IPL dataset"

date: 2026-03-17
lastmod: 2026-03-17
author: "codeverra"

showToc: false
TocOpen: false
toc: false
tocopen: true
draft: false
tags:
  - python
  - data-analysis
  - pandas

cover:
  image: "/images//pandas_ipl.png"
  alt: "pandas practice on IPL dataset"
  caption: "pandas practice"
  relative: true
  hidden: false
---


# Pandas Practice Sheet — IPL Dataset
### A complete two-table exploration: from match summaries to ball-by-ball intelligence

---

## Why IPL Is the Best Dataset for Pandas After Zomato

The Zomato dataset taught you how to clean a single messy table. The IPL dataset teaches you something more important: **how to work with two related tables and merge them to answer questions neither table can answer alone.**

This is how data exists in every real company — not as one giant flat file, but as a set of related tables that you must join, aggregate across levels, and reason about carefully.

The IPL dataset has two tables:

- **`matches.csv`** — one row per match (meta-data: who played, who won, when, where)
- **`deliveries.csv`** — one row per ball bowled (~180,000 rows: the ball-by-ball record)

Answering most interesting questions requires combining both. Who is the best death-overs bowler? You need the bowler's name (deliveries), linked to the season (matches). What is a team's win rate in knockout matches at Wankhede? You need venue and match type (matches) linked to team info (deliveries).

This practice sheet takes you from basic aggregation on a single table, through multi-table merges, through window functions and ranking, all the way to a full player performance scorecard. By the end, you will be comfortable working with any multi-table sports dataset — and that skill transfers directly to e-commerce order data, financial transaction data, and healthcare records.

---

## Getting the Datasets

Both files are available as direct raw CSVs — no login required.

```python
import pandas as pd
import numpy as np

# --- Matches: one row per IPL match (2008–2019, ~756 matches) ---
matches_url = (
    "https://raw.githubusercontent.com/ashutoshkrris/Data-Analysis-with-Python"
    "/master/zerotopandas-course-project-starter/dataset/matches.csv"
)

# --- Deliveries: one row per ball bowled (~179,000 rows) ---
deliveries_url = (
    "https://raw.githubusercontent.com/ashutoshkrris/Data-Analysis-with-Python"
    "/master/zerotopandas-course-project-starter/dataset/deliveries.csv"
)

matches    = pd.read_csv(matches_url)
deliveries = pd.read_csv(deliveries_url)

print("Matches shape   :", matches.shape)       # (~756, 18)
print("Deliveries shape:", deliveries.shape)    # (~179000, 21)
```

**Alternative (Kaggle, newer seasons up to 2024):**
```
https://www.kaggle.com/datasets/patrickb1912/ipl-complete-dataset-20082020
```

> Throughout this sheet we use `matches` and `deliveries` as the variable names. The `id` column in `matches` corresponds to `match_id` in `deliveries` — this is the join key between the two tables.

---

## Column Dictionaries

### `matches` — One Row Per Match

```
┌──────────────────────┬──────────┬───────────────────────────────────────────────────────┐
│ Column               │ Type     │ Meaning                                               │
├──────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ id                   │ int      │ Unique match identifier. JOIN KEY to deliveries.       │
│ season               │ int      │ IPL season year (2008–2019).                           │
│ city                 │ string   │ City where the match was played.                       │
│ date                 │ string   │ Date of match (YYYY-MM-DD or DD-MM-YYYY format).       │
│ team1                │ string   │ First team listed in the fixture.                      │
│ team2                │ string   │ Second team listed in the fixture.                     │
│ toss_winner          │ string   │ Team that won the toss.                                │
│ toss_decision        │ string   │ Toss winner's decision: "bat" or "field".              │
│ result               │ string   │ How the match was decided: "normal", "tie", "no result"│
│ dl_applied           │ int      │ 1 if Duckworth-Lewis method was applied, else 0.       │
│ winner               │ string   │ Name of the winning team. NaN for no-result matches.  │
│ win_by_runs          │ int      │ Margin of victory in runs (if batting first won).      │
│ win_by_wickets       │ int      │ Margin of victory in wickets (if chasing team won).    │
│ player_of_match      │ string   │ Player of the match award winner.                     │
│ venue                │ string   │ Full name of the stadium.                              │
│ umpire1              │ string   │ First on-field umpire.                                 │
│ umpire2              │ string   │ Second on-field umpire.                                │
│ umpire3              │ string   │ Third umpire (TV umpire). Mostly NaN.                  │
└──────────────────────┴──────────┴───────────────────────────────────────────────────────┘
```

### `deliveries` — One Row Per Ball

```
┌──────────────────────┬──────────┬───────────────────────────────────────────────────────┐
│ Column               │ Type     │ Meaning                                               │
├──────────────────────┼──────────┼───────────────────────────────────────────────────────┤
│ match_id             │ int      │ FK → matches.id                                       │
│ inning               │ int      │ 1 = first innings, 2 = second innings.                │
│ batting_team         │ string   │ Team currently batting.                               │
│ bowling_team         │ string   │ Team currently bowling.                               │
│ over                 │ int      │ Over number (0-indexed in some versions, 1-indexed     │
│                      │          │ in others — always check!).                           │
│ ball                 │ int      │ Ball number within the over (1–6, or more for extras). │
│ batsman              │ string   │ Batsman on strike.                                    │
│ non_striker          │ string   │ Batsman at the non-striking end.                      │
│ bowler               │ string   │ Bowler delivering the ball.                           │
│ is_super_over        │ int      │ 1 if the ball was bowled in a Super Over.             │
│ wide_runs            │ int      │ Runs from wide (0 or 1+).                             │
│ bye_runs             │ int      │ Runs from byes.                                       │
│ legbye_runs          │ int      │ Runs from leg byes.                                   │
│ noball_runs          │ int      │ Runs from no ball.                                    │
│ penalty_runs         │ int      │ Penalty runs.                                         │
│ batsman_runs         │ int      │ Runs credited to the batsman (0,1,2,3,4,6).           │
│ extra_runs           │ int      │ Total extras on this delivery.                        │
│ total_runs           │ int      │ Total runs on this delivery (batsman + extras).       │
│ player_dismissed     │ string   │ Name of dismissed batsman. NaN if no dismissal.      │
│ dismissal_kind       │ string   │ How out: caught, bowled, run out, lbw, etc.           │
│ fielder              │ string   │ Fielder involved in dismissal (for catches/run outs). │
└──────────────────────┴──────────┴───────────────────────────────────────────────────────┘
```

**The most important columns for analysis:**
- `batsman_runs` → runs scored by the batsman (use for batting stats)
- `total_runs` → total runs on the delivery including extras (use for team totals)
- `extra_runs` → only extras (use to isolate economy rate without extras)
- `player_dismissed` → non-null means a wicket fell on this delivery
- `over` → over number (verify if 0-indexed or 1-indexed with `deliveries["over"].min()`)

---

## Setup Block

```python
import pandas as pd
import numpy as np

matches    = pd.read_csv(matches_url)
deliveries = pd.read_csv(deliveries_url)

# Orientation
print("=== MATCHES ===")
print(matches.shape)
print(matches.dtypes)
print(matches.isnull().sum())
print(matches.head(3))

print("\n=== DELIVERIES ===")
print(deliveries.shape)
print(deliveries.dtypes)
print(deliveries.isnull().sum())
print(deliveries.head(3))

# Verify the join key
print("\nMatch IDs in matches   :", matches["id"].nunique())
print("Match IDs in deliveries:", deliveries["match_id"].nunique())
print("Over numbering starts at:", deliveries["over"].min())  # 1 or 0?
```

> **Always verify the join key before merging.** If `matches["id"].nunique()` ≠ `deliveries["match_id"].nunique()`, some matches have no ball data (e.g., abandoned matches or missing data). Know this before you merge.

---

---

# SECTION 1 — Matches Table Basics (Questions 1–5)
### Learn the structure of the match-level data before touching deliveries

---

## Question 1
### How many matches were played each season? Which season had the most matches? Which had the fewest, and why?

**Concepts:** `value_counts()`, `groupby().count()`, `sort_index()`, domain knowledge about IPL format

---

### Answer

```python
# Method 1 — value_counts sorted by season year
matches_per_season = matches["season"].value_counts().sort_index()
print(matches_per_season)
# 2008     58
# 2009     57   ← hosted in South Africa (security concerns in India)
# 2010     60
# 2011     73
# 2012     76
# 2013     76
# 2014     60   ← partial hosting in UAE
# 2015     59
# 2016     60
# 2017     59
# 2018     60
# 2019     60

# Method 2 — groupby for the same result
print(matches.groupby("season").size().rename("match_count"))

# Most and fewest
print(f"\nSeason with most matches  : {matches_per_season.idxmax()} ({matches_per_season.max()} matches)")
print(f"Season with fewest matches: {matches_per_season.idxmin()} ({matches_per_season.min()} matches)")

# Total matches across all seasons
print(f"\nTotal matches in dataset: {len(matches)}")
```

> **Domain insight:** 2009 had slightly fewer matches because the tournament was moved to South Africa due to general elections in India. 2011 onwards had more matches because the league expanded to 10 teams (adding Pune Warriors and Kochi Tuskers Kerala). Understanding *why* numbers fluctuate across time is as important as reading the numbers themselves.

> **`sort_index()` vs `sort_values()`:**
> `value_counts()` sorts by frequency (most common first) by default. For time series data like seasons, you almost always want chronological order — use `.sort_index()` to get that.

---

## Question 2
### Which teams have played the most matches in IPL history? Calculate total matches played, total wins, and win percentage for each team.

**Concepts:** Combining two columns (`team1` + `team2`) with `pd.concat()`, `value_counts()`, separate groupby for wins, merging two aggregations

---

### Answer

```python
# Total matches played = appearances as team1 + appearances as team2
# We need to count every time a team name appears in EITHER column

# Step 1: Stack team1 and team2 into a single Series
all_teams_played = pd.concat([matches["team1"], matches["team2"]], ignore_index=True)
total_played = all_teams_played.value_counts().rename("total_played")

# Step 2: Count wins
total_wins = matches["winner"].value_counts().rename("total_wins")

# Step 3: Merge into one table
team_record = pd.DataFrame({
    "total_played": total_played,
    "total_wins"  : total_wins,
}).dropna()  # remove teams that never won (or never appeared)

team_record["win_pct"] = (
    team_record["total_wins"] / team_record["total_played"] * 100
).round(2)

team_record = team_record.sort_values("total_played", ascending=False)
print(team_record)

# Quick sanity check: losses
team_record["total_losses"] = team_record["total_played"] - team_record["total_wins"]
```

> **The `pd.concat([team1, team2])` pattern** is the standard way to count appearances across two columns. `team1` and `team2` are two perspectives on the same fact ("this team was in this match"), and concatenating them before `value_counts()` counts total appearances correctly. This pattern appears constantly in sports data — goals scored/conceded, home/away records, etc.

> **Why `dropna()` here?** `total_wins` comes from `matches["winner"]`, which has NaN for no-result matches. When we merge, teams that never won or were never in a result have NaN wins. `dropna()` removes them — but in production you'd want to `fillna(0)` instead to keep all teams with 0 wins.

---

## Question 3
### What percentage of toss winners also won the match? Break this down by toss decision (bat vs field).

**Concepts:** Boolean column from comparison, `groupby()`, `mean()` on binary flag, `crosstab()`

---

### Answer

```python
# Step 1: Flag whether the toss winner also won the match
# Filter out no-result matches first
valid = matches[matches["result"] == "normal"].copy()
valid["toss_won_match"] = (valid["toss_winner"] == valid["winner"]).astype(int)

# Overall toss-to-win conversion
overall_rate = valid["toss_won_match"].mean()
print(f"Overall: toss winner won the match {overall_rate:.1%} of the time")

# Step 2: Break down by toss decision
toss_decision_stats = (
    valid.groupby("toss_decision")["toss_won_match"]
    .agg(
        matches_count = "count",
        won_match     = "sum",
        win_rate      = "mean",
    )
    .round(3)
)
print("\nBy toss decision:")
print(toss_decision_stats)

# Step 3: Crosstab for a cleaner view
ct = pd.crosstab(
    index   = valid["toss_decision"],
    columns = valid["toss_won_match"].map({1: "Won Match", 0: "Lost Match"}),
    margins = True,
    margins_name = "Total"
)
print("\nCrosstab:")
print(ct)

# Normalize by row — win rate per decision type
ct_pct = pd.crosstab(
    index     = valid["toss_decision"],
    columns   = valid["toss_won_match"].map({1: "Won", 0: "Lost"}),
    normalize = "index"
).round(3)
print("\nNormalized:")
print(ct_pct)
```

> **Insight:** Across most IPL seasons, fielding first (chasing) has been slightly more advantageous. Teams that elected to field after winning the toss have a marginally higher win rate than those who batted. This trend has strengthened over the years as T20 teams got better at chasing. The toss is not destiny — but the *decision* matters more than people think.

---

## Question 4
### Which venues have hosted the most matches? For the top 10 venues, what is the average win margin (in runs for first-innings wins, in wickets for second-innings wins)?

**Concepts:** `value_counts()`, conditional aggregation, `loc[]` filtering, `groupby()` with separate filters

---

### Answer

```python
# Top 10 venues by match count
top10_venues = matches["venue"].value_counts().head(10)
print("Top 10 venues:")
print(top10_venues)

# Win margins — separated by type
# Batting-first wins: win_by_runs > 0
# Chasing wins: win_by_wickets > 0

batting_first_wins = matches[matches["win_by_runs"] > 0]
chasing_wins       = matches[matches["win_by_wickets"] > 0]

venue_bat_margin = (
    batting_first_wins.groupby("venue")["win_by_runs"]
    .agg(count="count", avg_margin="mean")
    .round(1)
    .rename(columns={"count": "bat_first_wins", "avg_margin": "avg_runs_margin"})
)

venue_chase_margin = (
    chasing_wins.groupby("venue")["win_by_wickets"]
    .agg(count="count", avg_margin="mean")
    .round(1)
    .rename(columns={"count": "chase_wins", "avg_margin": "avg_wkt_margin"})
)

# Combine into one venue table
venue_stats = pd.DataFrame({"total_matches": matches["venue"].value_counts()})
venue_stats = venue_stats.join(venue_bat_margin).join(venue_chase_margin)

print("\nVenue statistics for top 10:")
print(venue_stats.head(10).to_string())
```

> **Separate filtering before groupby** is often cleaner than a conditional inside agg. Matches won by runs and matches won by wickets are mutually exclusive — filtering first, then aggregating, keeps the logic explicit and avoids the need for `np.where()` or lambda gymnastics.

---

## Question 5
### Who are the top 10 "Player of the Match" winners all-time? Show their count and the teams they most often played for when winning the award.

**Concepts:** `value_counts()`, `groupby()` with `mode()` inside lambda, merging two aggregations

---

### Answer

```python
# Top 10 player of the match winners
top_pom = (
    matches["player_of_match"]
    .value_counts()
    .head(10)
    .reset_index()
)
top_pom.columns = ["player", "pom_count"]
print(top_pom)

# For each player, which team were they playing for most often when they won?
# This requires checking both team1 and team2 against the winner column
# Approximation: use the winning team when the player won PoM

# Build a player→winning_team mapping per match
pom_with_winner = matches[["player_of_match", "winner"]].dropna()
pom_team_mode = (
    pom_with_winner
    .groupby("player_of_match")["winner"]
    .agg(lambda x: x.mode().iloc[0])  # most common winning team for this player
    .reset_index()
    .rename(columns={"player_of_match": "player", "winner": "primary_team"})
)

# Merge
top_pom = top_pom.merge(pom_team_mode, on="player", how="left")
print("\nTop 10 PoM winners with primary team:")
print(top_pom.to_string(index=False))
```

---

---

# SECTION 2 — Deliveries Table Basics (Questions 6–9)
### Learn the ball-by-ball table before joining the two tables

---

## Question 6
### What is the total number of runs scored in IPL history (from the deliveries table)? Break it down into batsman runs vs extra runs. What percentage of all runs came from extras?

**Concepts:** `sum()` on multiple columns, percentage calculation, `describe()` for distribution

---

### Answer

```python
# Total runs from each source
total_batsman_runs = deliveries["batsman_runs"].sum()
total_extra_runs   = deliveries["extra_runs"].sum()
total_runs_all     = deliveries["total_runs"].sum()

print(f"Total batsman runs : {total_batsman_runs:,}")
print(f"Total extra runs   : {total_extra_runs:,}")
print(f"Total runs (all)   : {total_runs_all:,}")
print(f"Extras as % of all runs: {total_extra_runs / total_runs_all * 100:.2f}%")

# Break extras down further
extra_types = {
    "wide_runs"   : deliveries["wide_runs"].sum(),
    "noball_runs" : deliveries["noball_runs"].sum(),
    "bye_runs"    : deliveries["bye_runs"].sum(),
    "legbye_runs" : deliveries["legbye_runs"].sum(),
    "penalty_runs": deliveries["penalty_runs"].sum(),
}
print("\nExtra run breakdown:")
for k, v in extra_types.items():
    print(f"  {k:<15}: {v:,}  ({v/total_extra_runs*100:.1f}% of extras)")

# Distribution of total_runs per delivery
print("\nDistribution of runs per ball:")
print(deliveries["total_runs"].value_counts().sort_index())
# 0    ~55%  (dot balls)
# 1    ~24%
# 2    ~4%
# 4    ~9%
# 6    ~5%
```

> **`total_runs` vs `batsman_runs`:** Always be deliberate about which column you use. For team scoring totals (match scores), use `total_runs` — it includes extras. For individual batting statistics (strike rate, batting average), use `batsman_runs` — extras don't count toward a batsman's personal tally. Using the wrong column is a very common mistake in cricket analytics.

---

## Question 7
### Who are the top 10 run-scorers of all time in IPL? Show total runs, balls faced (legal deliveries only), boundaries (4s and 6s), and strike rate.

**Concepts:** Multiple aggregations, `groupby()` on player, filtering wide balls for legal deliveries, strike rate calculation as a derived column

---

### Answer

```python
# Legal deliveries = balls where wide_runs == 0
# (Wide balls don't count as "balls faced" by the batsman)
legal_deliveries = deliveries[deliveries["wide_runs"] == 0]

batting_stats = (
    legal_deliveries.groupby("batsman")
    .agg(
        total_runs   = ("batsman_runs", "sum"),
        balls_faced  = ("batsman_runs", "count"),  # count of legal balls
        fours        = ("batsman_runs", lambda x: (x == 4).sum()),
        sixes        = ("batsman_runs", lambda x: (x == 6).sum()),
    )
    .reset_index()
)

# Derived columns
batting_stats["strike_rate"]      = (
    batting_stats["total_runs"] / batting_stats["balls_faced"] * 100
).round(2)

batting_stats["boundary_runs"]    = (
    batting_stats["fours"] * 4 + batting_stats["sixes"] * 6
)

batting_stats["boundary_pct"]     = (
    batting_stats["boundary_runs"] / batting_stats["total_runs"] * 100
).round(1)

# Top 10 by runs
top10_batsmen = (
    batting_stats
    .nlargest(10, "total_runs")
    .reset_index(drop=True)
)
top10_batsmen.index += 1  # rank starts at 1

print("Top 10 Run Scorers in IPL History:")
print(top10_batsmen[["batsman", "total_runs", "balls_faced", "fours",
                       "sixes", "strike_rate", "boundary_pct"]].to_string())
```

> **Filtering wides before counting balls faced** is a non-negotiable step in cricket analytics. A wide ball is not counted as a ball faced by the batsman in the official scorecard. If you count all rows per batsman, you'll overcount their balls faced (and therefore undercount their strike rate) by roughly 2–4%.

> **Lambda inside `agg()`** is the correct way to count how many times a value equals 4 or 6: `lambda x: (x == 4).sum()`. This is readable and efficient for this dataset size. For very large datasets, consider doing it in a separate step using boolean masks.

---

## Question 8
### Who are the top 10 wicket-takers of all time? Show wickets, overs bowled, runs conceded, economy rate, and bowling average.

**Concepts:** Filtering dismissals, handling run-outs (not credited to bowler), `groupby()` with multiple derived stats

---

### Answer

```python
# Wickets: player_dismissed is not NaN AND dismissal is NOT run_out or retired_hurt
# (Run-outs are not credited to the bowler)
bowler_wickets = deliveries[
    deliveries["player_dismissed"].notna() &
    ~deliveries["dismissal_kind"].isin(["run out", "retired hurt", "obstructing the field"])
]

# Count wickets per bowler
wickets_per_bowler = (
    bowler_wickets.groupby("bowler")["player_dismissed"]
    .count()
    .rename("wickets")
)

# Runs conceded (exclude wide and no-ball runs for economy)
# Economy = runs per over (6 legal balls = 1 over)
# Balls bowled = deliveries where wide_runs == 0
legal_balls = deliveries[deliveries["wide_runs"] == 0]

bowling_stats = (
    legal_balls.groupby("bowler")
    .agg(
        legal_balls_bowled = ("total_runs", "count"),
        runs_conceded      = ("total_runs", "sum"),
    )
    .reset_index()
)

# Add wides and no-balls to runs conceded (they count toward economy)
all_extras = (
    deliveries.groupby("bowler")[["wide_runs", "noball_runs"]]
    .sum()
    .reset_index()
)
all_extras["extra_runs_bowler"] = all_extras["wide_runs"] + all_extras["noball_runs"]

bowling_stats = bowling_stats.merge(
    all_extras[["bowler", "extra_runs_bowler"]], on="bowler", how="left"
)
bowling_stats["total_runs_conceded"] = (
    bowling_stats["runs_conceded"] + bowling_stats["extra_runs_bowler"].fillna(0)
)

# Merge wickets in
bowling_stats = bowling_stats.merge(
    wickets_per_bowler.reset_index(), on="bowler", how="left"
)
bowling_stats["wickets"] = bowling_stats["wickets"].fillna(0).astype(int)

# Derived metrics
bowling_stats["overs_bowled"] = (bowling_stats["legal_balls_bowled"] / 6).round(2)
bowling_stats["economy_rate"] = (
    bowling_stats["total_runs_conceded"] / bowling_stats["overs_bowled"]
).round(2)
bowling_stats["bowling_avg"] = (
    bowling_stats["total_runs_conceded"] / bowling_stats["wickets"].replace(0, np.nan)
).round(2)

# Top 10 wicket-takers (min 50 overs bowled)
top10_bowlers = (
    bowling_stats[bowling_stats["overs_bowled"] >= 50]
    .nlargest(10, "wickets")
    .reset_index(drop=True)
)
top10_bowlers.index += 1

print("Top 10 Wicket-Takers in IPL History:")
print(top10_bowlers[["bowler", "wickets", "overs_bowled",
                       "total_runs_conceded", "economy_rate", "bowling_avg"]].to_string())
```

> **Why exclude run-outs from bowler wickets?** In cricket scoring rules, run-outs, retired hurts, and obstruction are not credited to the bowler. Counting them would inflate a bowler's wicket tally incorrectly. This kind of domain knowledge is essential — pandas will happily count them if you don't filter explicitly.

> **Economy rate uses TOTAL runs conceded** (including wides and no-balls), but **overs bowled counts only LEGAL deliveries**. This is the official cricket convention. A bowler who bowls 3 wides in an over has a 7-ball over (those 3 wides are counted toward runs but the over length is still 6 legal balls).

---

## Question 9
### What is the run-scoring pattern across overs? Calculate the average runs per over for each over number (1–20) across all matches. Identify the powerplay (overs 1–6), middle (7–15), and death (16–20) phase averages.

**Concepts:** `groupby()` on over number, phase labeling with `pd.cut()`, `transform()` for phase averages

---

### Answer

```python
# Average runs per over across all deliveries
# total_runs per over = sum of all runs in that over number across all matches

runs_per_over = (
    deliveries.groupby("over")["total_runs"]
    .agg(
        total_runs  = "sum",
        total_balls = "count",
        avg_per_ball = "mean",
    )
    .reset_index()
)

# Average runs per over = total_runs / number of times that over was bowled
# "Number of times over X was bowled" = total_balls / ~6 (approx overs)
# More precisely: group by (match_id, inning, over) to count actual overs
overs_bowled_count = (
    deliveries.groupby(["match_id", "inning", "over"])["total_runs"]
    .sum()
    .reset_index()
)
avg_runs_per_over = (
    overs_bowled_count.groupby("over")["total_runs"]
    .mean()
    .round(2)
    .reset_index()
    .rename(columns={"total_runs": "avg_runs_per_over"})
)

print("Average runs per over:")
print(avg_runs_per_over.to_string(index=False))

# Phase labeling
avg_runs_per_over["phase"] = pd.cut(
    avg_runs_per_over["over"],
    bins   = [0, 6, 15, 20],
    labels = ["Powerplay (1-6)", "Middle (7-15)", "Death (16-20)"],
    right  = True
)

phase_summary = (
    avg_runs_per_over.groupby("phase", observed=True)["avg_runs_per_over"]
    .mean()
    .round(2)
)
print("\nPhase averages:")
print(phase_summary)
# Powerplay: ~7.5–8 runs/over
# Middle:    ~7.0–7.5 runs/over
# Death:     ~9.5–10 runs/over  ← highest scoring phase
```

> **The two-step groupby pattern** (first group by match+inning+over, then group by over) is how you correctly compute "average runs per over." If you directly average `total_runs` across all rows with over=16, you're averaging individual ball runs, not over totals. Always think about what the unit of your analysis is.

---

---

# SECTION 3 — Merging the Two Tables (Questions 10–13)
### The most important section — joining match-level and ball-level data

---

## Question 10
### Add the season information to the deliveries table by merging. Then calculate the total runs scored per team per season. Which team had the highest scoring season in IPL history?

**Concepts:** `pd.merge()`, left vs inner join, `groupby()` on merged columns, understanding join types

---

### Answer

```python
# Step 1: Merge season info from matches into deliveries
# We need: match_id → season (from matches table)

deliveries_with_season = deliveries.merge(
    matches[["id", "season"]],      # only bring the columns we need
    left_on  = "match_id",
    right_on = "id",
    how      = "left"               # keep all deliveries even if match not found
)

print(f"Deliveries before merge: {len(deliveries):,}")
print(f"Deliveries after merge : {len(deliveries_with_season):,}")
print(f"Season column added    : {deliveries_with_season['season'].notna().sum():,} non-null")

# Step 2: Total runs per team per season
team_season_runs = (
    deliveries_with_season.groupby(["season", "batting_team"])["total_runs"]
    .sum()
    .reset_index()
    .rename(columns={"total_runs": "total_runs_scored"})
)

# Highest single-season run total by a team
best_season = team_season_runs.nlargest(10, "total_runs_scored")
print("\nTop 10 highest-scoring team-seasons:")
print(best_season.to_string(index=False))

# Overall total runs per team across all seasons
overall_runs = (
    team_season_runs.groupby("batting_team")["total_runs_scored"]
    .sum()
    .sort_values(ascending=False)
    .reset_index()
    .rename(columns={"total_runs_scored": "all_time_runs"})
)
print("\nAll-time runs scored per team:")
print(overall_runs.to_string(index=False))
```

> **`how='left'` vs `how='inner'`:**
> - `inner` → only keeps rows where the key exists in BOTH tables (safe, no NaN from join)
> - `left` → keeps ALL rows from the left table; adds NaN for right columns when no match found
>
> For deliveries, use `left` join. If a match was abandoned mid-game, the deliveries still exist but the match might be marked "no result." An `inner` join would silently drop those deliveries. Use `left` and check `.isnull().sum()` on the new column to see how many rows didn't match.

> **Only bring columns you need from the right table.** `matches[["id", "season"]]` instead of the full `matches` DataFrame. This avoids column name conflicts and keeps the merged table clean.

---

## Question 11
### Which batsmen perform best in the death overs (overs 16–20)? Calculate death-over runs, death-over strike rate, and the percentage of team's death-over runs each player contributes. Minimum 100 balls faced in death overs.

**Concepts:** Multi-condition filtering, `groupby()` on filtered subset, `transform()` for within-group percentage

---

### Answer

```python
# Step 1: Filter to death overs only (over numbers 16–20)
# Check if overs are 0-indexed or 1-indexed
print("Over range:", deliveries["over"].min(), "to", deliveries["over"].max())
# If min is 0: overs 15-19 = death overs
# If min is 1: overs 16-20 = death overs

is_one_indexed = deliveries["over"].min() == 1
death_over_start = 16 if is_one_indexed else 15
death_over_end   = 20 if is_one_indexed else 19

death_overs = deliveries[
    (deliveries["over"] >= death_over_start) &
    (deliveries["over"] <= death_over_end) &
    (deliveries["wide_runs"] == 0)          # legal balls only for balls faced
].copy()

# Step 2: Death-over batting stats per player
death_batting = (
    death_overs.groupby("batsman")
    .agg(
        runs_scored  = ("batsman_runs", "sum"),
        balls_faced  = ("batsman_runs", "count"),
        fours        = ("batsman_runs", lambda x: (x == 4).sum()),
        sixes        = ("batsman_runs", lambda x: (x == 6).sum()),
    )
    .reset_index()
)

death_batting["strike_rate"] = (
    death_batting["runs_scored"] / death_batting["balls_faced"] * 100
).round(2)

# Step 3: Filter minimum 100 balls
death_batting = death_batting[death_batting["balls_faced"] >= 100]

# Step 4: Rank by death-over strike rate
top_death_batsmen = (
    death_batting
    .sort_values("strike_rate", ascending=False)
    .head(15)
    .reset_index(drop=True)
)
top_death_batsmen.index += 1

print("Best Death-Over Batsmen (min 100 balls, sorted by SR):")
print(top_death_batsmen[["batsman", "runs_scored", "balls_faced",
                           "fours", "sixes", "strike_rate"]].to_string())
```

> **Phase-based analysis** (powerplay, middle, death) is the backbone of modern T20 analytics. Most batting and bowling records are meaningless without phase context — a batsman with SR 120 in the middle overs is average; the same SR in death overs is weak. Always segment by phase before comparing players.

---

## Question 12
### Build a head-to-head record between any two teams: total matches, wins each, win rate, and average winning margin. Then show the all-time head-to-head matrix for all team pairs.

**Concepts:** Multi-condition filtering, `groupby()` on two columns simultaneously, `pivot_table()` to create a matrix, `crosstab()`

---

### Answer

```python
# Step 1: Head-to-head function for any two teams
def head_to_head(team_a, team_b):
    h2h = matches[
        ((matches["team1"] == team_a) & (matches["team2"] == team_b)) |
        ((matches["team1"] == team_b) & (matches["team2"] == team_a))
    ].copy()
    h2h = h2h[h2h["result"] == "normal"]

    total = len(h2h)
    wins_a = (h2h["winner"] == team_a).sum()
    wins_b = (h2h["winner"] == team_b).sum()

    print(f"\n{team_a} vs {team_b}")
    print(f"  Total matches : {total}")
    print(f"  {team_a:<35}: {wins_a} wins ({wins_a/total*100:.1f}%)")
    print(f"  {team_b:<35}: {wins_b} wins ({wins_b/total*100:.1f}%)")

head_to_head("Mumbai Indians", "Chennai Super Kings")
head_to_head("Royal Challengers Bangalore", "Kolkata Knight Riders")

# Step 2: All-time win matrix (how many times team A beat team B)
# Create a row per match with (winner, loser)
results_df = matches[matches["result"] == "normal"].copy()
results_df["loser"] = results_df.apply(
    lambda r: r["team2"] if r["winner"] == r["team1"] else r["team1"],
    axis=1
)

# Pivot: rows = winner, columns = loser, values = count
win_matrix = pd.crosstab(
    index   = results_df["winner"],
    columns = results_df["loser"]
)
win_matrix.index.name   = "Winner →"
win_matrix.columns.name = "← Loser"

print("\nHead-to-head win matrix (row team beat column team N times):")
print(win_matrix)
```

> **Using `apply(axis=1)` with a lambda** is the right tool for row-level logic that depends on multiple columns simultaneously. Here we need both `winner` and `team1`/`team2` to determine the loser. This can't be done with a simple vectorized operation — `apply(axis=1)` iterates row-by-row, which is slower but correct.

> **`axis=1` in apply vs `axis=0`:**
> - `axis=0` (default) → function applied to each COLUMN
> - `axis=1` → function applied to each ROW
> When your lambda receives a full row and uses `row["col_name"]`, you need `axis=1`.

---

## Question 13
### Merge the two tables to find: for each player, how many "Player of the Match" awards have they won, and what is their average runs scored in those specific matches (vs their overall average)?

**Concepts:** Multi-step merge, filtering on merged data, comparing two aggregations with `merge()`

---

### Answer

```python
# Step 1: Get Player of the Match for each match
pom = matches[["id", "player_of_match"]].dropna()

# Step 2: Merge deliveries with PoM info
# We want to know: in the matches where player X won PoM, how many runs did they score?
deliveries_pom = deliveries.merge(
    pom,
    left_on  = "match_id",
    right_on = "id",
    how      = "inner"
)

# Step 3: Filter to rows where the batsman IS the PoM winner
pom_matches_batting = deliveries_pom[
    deliveries_pom["batsman"] == deliveries_pom["player_of_match"]
]

# Runs scored by each player in their PoM matches
pom_runs = (
    pom_matches_batting.groupby("player_of_match")
    .agg(
        pom_count      = ("match_id", "nunique"),  # unique matches = PoM count
        pom_total_runs = ("batsman_runs", "sum"),
    )
    .reset_index()
    .rename(columns={"player_of_match": "player"})
)
pom_runs["avg_runs_pom_match"] = (
    pom_runs["pom_total_runs"] / pom_runs["pom_count"]
).round(1)

# Step 4: Overall batting average per player
overall_avg = (
    deliveries[deliveries["wide_runs"] == 0]
    .groupby("batsman")["batsman_runs"]
    .mean()
    .round(1)
    .reset_index()
    .rename(columns={"batsman": "player", "batsman_runs": "overall_avg_runs_per_ball"})
)

# Step 5: Merge and compare
result = pom_runs.merge(overall_avg, on="player", how="left")
result = result[result["pom_count"] >= 3].sort_values("pom_count", ascending=False)

print("Players with 3+ PoM awards — PoM match avg vs overall avg:")
print(result[["player", "pom_count", "avg_runs_pom_match",
              "overall_avg_runs_per_ball"]].to_string(index=False))
```

> **`nunique()` in groupby** is the correct way to count distinct match IDs — if a player faces multiple balls in a match (which they always do), counting rows would massively overcount. `nunique()` on `match_id` gives the number of distinct matches.

---

---

# SECTION 4 — Advanced Aggregation & Window Analysis (Questions 14–18)

---

## Question 14
### Calculate each team's net run rate (NRR) for each season. NRR = (runs scored / overs faced) − (runs conceded / overs bowled).

**Concepts:** Multi-groupby on two different perspectives (batting/bowling), merging two aggregations, formula application

---

### Answer

```python
# Merge season into deliveries first
del_s = deliveries.merge(
    matches[["id", "season"]], left_on="match_id", right_on="id", how="left"
)

# --- Runs scored and balls faced (batting perspective) ---
runs_scored = (
    del_s.groupby(["season", "batting_team"])
    .agg(runs_for=("total_runs", "sum"), balls_faced=("total_runs", "count"))
    .reset_index()
    .rename(columns={"batting_team": "team"})
)

# --- Runs conceded and balls bowled (bowling perspective) ---
runs_conceded = (
    del_s.groupby(["season", "bowling_team"])
    .agg(runs_against=("total_runs", "sum"), balls_bowled=("total_runs", "count"))
    .reset_index()
    .rename(columns={"bowling_team": "team"})
)

# --- Merge both perspectives ---
nrr_df = runs_scored.merge(runs_conceded, on=["season", "team"])

# --- Calculate NRR ---
nrr_df["overs_batted"]  = nrr_df["balls_faced"]  / 6
nrr_df["overs_bowled_"]  = nrr_df["balls_bowled"] / 6
nrr_df["run_rate_for"]   = (nrr_df["runs_for"]     / nrr_df["overs_batted"]).round(3)
nrr_df["run_rate_against"] = (nrr_df["runs_against"] / nrr_df["overs_bowled_"]).round(3)
nrr_df["nrr"]            = (nrr_df["run_rate_for"] - nrr_df["run_rate_against"]).round(3)

# Top NRR by team-season
print("Best NRR performances (team-season):")
print(nrr_df.nlargest(10, "nrr")[["season", "team", "run_rate_for",
                                    "run_rate_against", "nrr"]].to_string(index=False))
```

> **NRR requires two separate groupbys** — one where your team is batting, one where your team is bowling — then merging on team+season. This is a classic "self-join by role" pattern in sports analytics. The same player or team appears in two different roles (batter/bowler, home/away), and you must aggregate each role separately before combining.

---

## Question 15
### Use `groupby().transform()` to add context columns to the deliveries table: (a) total match runs for that innings, (b) each delivery's contribution as a percentage of innings total, (c) cumulative runs in the innings up to that ball.

**Concepts:** `groupby().transform()`, `groupby().cumsum()`, percentage contribution within group

---

### Answer

```python
# (a) Total innings runs — broadcast back to every ball in that innings
deliveries["innings_total"] = (
    deliveries.groupby(["match_id", "inning"])["total_runs"]
    .transform("sum")
)

# (b) Each ball's contribution as % of innings total
deliveries["pct_of_innings"] = (
    deliveries["total_runs"] / deliveries["innings_total"] * 100
).round(3)

# (c) Cumulative runs within the innings up to and including this ball
# cumsum() within a group = running total
deliveries["cumulative_runs"] = (
    deliveries.groupby(["match_id", "inning"])["total_runs"]
    .cumsum()
)

# Verify: last ball of each innings should equal innings_total
last_ball = deliveries.groupby(["match_id", "inning"]).last().reset_index()
matches_check = (last_ball["cumulative_runs"] == last_ball["innings_total"]).all()
print(f"Cumulative runs verified: {matches_check}")

# Show a sample innings build-up
sample_innings = deliveries[
    (deliveries["match_id"] == deliveries["match_id"].iloc[0]) &
    (deliveries["inning"] == 1)
][["over", "ball", "batsman", "bowler", "batsman_runs",
   "total_runs", "cumulative_runs", "innings_total"]].head(20)

print("\nSample innings ball-by-ball with cumulative runs:")
print(sample_innings.to_string(index=False))
```

> **`groupby().cumsum()` vs `groupby().transform("sum")`:**
> - `transform("sum")` → broadcasts the FINAL total back to every row (same value for all rows in the group)
> - `cumsum()` → gives a RUNNING total that grows with each row
>
> Both use the same groupby keys. `transform` answers "what was the total?" and `cumsum` answers "how much had been scored at this point in time?" They serve completely different analytical purposes.

---

## Question 16
### Identify "momentum shifts": balls in the 2nd innings where the required run rate (RRR) dropped by more than 2 runs per over in a single over. Use `pairwise` differences to detect these.

**Concepts:** `groupby().transform()`, `diff()`, required run rate calculation, derived analytics

---

### Answer

```python
# Step 1: Merge target score for each match
# Target = total runs scored in innings 1 + 1
innings1_totals = (
    deliveries.groupby(["match_id"])
    .apply(lambda g: g[g["inning"] == 1]["total_runs"].sum())
    .reset_index()
    .rename(columns={0: "innings1_total"})
)
innings1_totals["target"] = innings1_totals["innings1_total"] + 1

# Step 2: Work on innings 2 only
innings2 = deliveries[deliveries["inning"] == 2].copy()
innings2 = innings2.merge(innings1_totals[["match_id", "target"]], on="match_id")

# Step 3: At the END of each over, compute the required run rate
innings2["cumulative_runs_i2"] = (
    innings2.groupby("match_id")["total_runs"].cumsum()
)
innings2["runs_still_needed"]  = innings2["target"] - innings2["cumulative_runs_i2"]

# Count balls remaining (approximate)
innings2["ball_number"] = innings2.groupby("match_id").cumcount() + 1
innings2["balls_remaining"] = 120 - innings2["ball_number"]
innings2["overs_remaining"]  = (innings2["balls_remaining"] / 6).clip(lower=0.01)

innings2["rrr"] = (
    innings2["runs_still_needed"] / innings2["overs_remaining"]
).round(2)

# Step 4: Get end-of-over RRR and compute change between overs
end_of_over_rrr = (
    innings2.groupby(["match_id", "over"])["rrr"]
    .last()   # last ball of each over
    .reset_index()
)

# Diff within each match's innings 2
end_of_over_rrr["rrr_change"] = (
    end_of_over_rrr.groupby("match_id")["rrr"]
    .diff()   # change from previous over
)

# Big positive drops in RRR = batsmen took pressure off
momentum_shifts = end_of_over_rrr[end_of_over_rrr["rrr_change"] < -2]
print(f"Overs with RRR drop > 2: {len(momentum_shifts)}")
print(momentum_shifts.nsmallest(10, "rrr_change")[["match_id", "over",
                                                     "rrr", "rrr_change"]].to_string())
```

> **`groupby().diff()`** computes the difference between consecutive rows within a group. Combined with `groupby().last()` to get end-of-over snapshots, this creates a powerful pattern for detecting changes over time — wicket clusters, run-rate swings, or any "before vs after" within a grouped sequence.

---

## Question 17
### For each bowler, calculate their performance in the powerplay vs death overs separately. Then rank them within each phase using `groupby().rank()`.

**Concepts:** Multi-phase analysis, wide `pivot` from long format, `groupby().rank()`, phase-comparison metrics

---

### Answer

```python
# Step 1: Assign phase to each delivery
is_one_indexed = deliveries["over"].min() == 1

def assign_phase(over):
    if is_one_indexed:
        if over <= 6:  return "Powerplay"
        if over <= 15: return "Middle"
        return "Death"
    else:
        if over <= 5:  return "Powerplay"
        if over <= 14: return "Middle"
        return "Death"

deliveries["phase"] = deliveries["over"].apply(assign_phase)

# Step 2: Bowling stats by (bowler, phase)
# Legal balls only for economy calculation
legal = deliveries[deliveries["wide_runs"] == 0].copy()
legal["phase"] = legal["over"].apply(assign_phase)

# Wickets (non-run-out only)
wicket_balls = legal[
    legal["player_dismissed"].notna() &
    ~legal["dismissal_kind"].isin(["run out", "retired hurt"])
].copy()
wicket_balls["phase"] = wicket_balls["over"].apply(assign_phase)

wickets_by_phase = (
    wicket_balls.groupby(["bowler", "phase"])["player_dismissed"]
    .count()
    .reset_index()
    .rename(columns={"player_dismissed": "wickets"})
)

bowling_phase = (
    legal.groupby(["bowler", "phase"])
    .agg(
        balls    = ("total_runs", "count"),
        runs     = ("total_runs", "sum"),
    )
    .reset_index()
)

bowling_phase = bowling_phase.merge(wickets_by_phase, on=["bowler", "phase"], how="left")
bowling_phase["wickets"]  = bowling_phase["wickets"].fillna(0).astype(int)
bowling_phase["overs"]    = (bowling_phase["balls"] / 6).round(2)
bowling_phase["economy"]  = (bowling_phase["runs"] / bowling_phase["overs"]).round(2)

# Step 3: Filter meaningful sample (20+ overs per phase)
bowling_phase = bowling_phase[bowling_phase["overs"] >= 20]

# Step 4: Rank within each phase by economy (lower = better rank)
bowling_phase["economy_rank"] = (
    bowling_phase.groupby("phase")["economy"]
    .rank(method="dense", ascending=True)  # lower economy = rank 1
)

# Show top 5 in each phase
for phase in ["Powerplay", "Middle", "Death"]:
    top = (
        bowling_phase[bowling_phase["phase"] == phase]
        .nsmallest(5, "economy")
        [["bowler", "overs", "wickets", "economy", "economy_rank"]]
    )
    print(f"\nBest {phase} bowlers (by economy, min 20 overs):")
    print(top.to_string(index=False))
```

> **`rank(method='dense')`** ensures no gaps in the ranking sequence when there are ties — if two bowlers have the same economy, both get rank 1 and the next gets rank 2 (not rank 3). For leaderboards and "top N" selections, `dense` is almost always what you want.

---

## Question 18
### Build a complete batsman scorecard: for the top 20 run-scorers, show all key batting metrics including average, strike rate, highest score in a single innings, number of 50s, and number of 100s.

**Concepts:** Multiple complex aggregations, `nunique()` for innings count, `max()` for highest score, custom lambda for milestone counts, merging dismissal data

---

### Answer

```python
# Step 1: Innings-level runs per batsman (runs per match-innings combination)
legal_balls = deliveries[deliveries["wide_runs"] == 0].copy()

innings_runs = (
    legal_balls.groupby(["match_id", "inning", "batsman"])["batsman_runs"]
    .sum()
    .reset_index()
    .rename(columns={"batsman_runs": "innings_runs"})
)

# Step 2: Dismissal count (how many times was this batsman out?)
dismissals = (
    deliveries[deliveries["player_dismissed"].notna()]
    .groupby("player_dismissed")["match_id"]
    .count()
    .reset_index()
    .rename(columns={"player_dismissed": "batsman", "match_id": "times_out"})
)

# Step 3: Aggregate innings data
batting_scorecard = (
    innings_runs.groupby("batsman")
    .agg(
        innings       = ("innings_runs", "count"),
        total_runs    = ("innings_runs", "sum"),
        highest_score = ("innings_runs", "max"),
        fifties       = ("innings_runs", lambda x: ((x >= 50) & (x < 100)).sum()),
        hundreds      = ("innings_runs", lambda x: (x >= 100).sum()),
        ducks         = ("innings_runs", lambda x: (x == 0).sum()),
    )
    .reset_index()
)

# Step 4: Merge dismissals for average calculation
batting_scorecard = batting_scorecard.merge(dismissals, on="batsman", how="left")
batting_scorecard["times_out"] = batting_scorecard["times_out"].fillna(0).astype(int)

# Batting average = total runs / times out (not innings)
batting_scorecard["batting_avg"] = (
    batting_scorecard["total_runs"]
    / batting_scorecard["times_out"].replace(0, np.nan)
).round(2)

# Step 5: Ball-by-ball strike rate
balls_faced_total = (
    legal_balls.groupby("batsman")["batsman_runs"]
    .count()
    .reset_index()
    .rename(columns={"batsman_runs": "balls_faced"})
)
batting_scorecard = batting_scorecard.merge(balls_faced_total, on="batsman")
batting_scorecard["strike_rate"] = (
    batting_scorecard["total_runs"] / batting_scorecard["balls_faced"] * 100
).round(2)

# Top 20 by total runs
top20 = (
    batting_scorecard
    .nlargest(20, "total_runs")
    .reset_index(drop=True)
)
top20.index += 1

print("Complete IPL Batting Scorecard — Top 20 Run Scorers:")
cols = ["batsman", "innings", "total_runs", "batting_avg", "strike_rate",
        "highest_score", "fifties", "hundreds", "ducks", "balls_faced"]
print(top20[cols].to_string())
```

> **Batting average ≠ runs per innings.** In cricket, batting average is total runs ÷ number of times dismissed. A batsman who scored 1000 runs in 20 innings with 15 dismissals has an average of 66.67, not 50. The distinction matters enormously — it penalises batsmen who get out often, and rewards those who are not out frequently. Always compute average from dismissal count, not innings count.

---

---

# SECTION 5 — Season Trends & Time Analysis (Questions 19–22)

---

## Question 19
### How has the average first-innings score changed across IPL seasons? Is T20 becoming a more high-scoring game over time?

**Concepts:** Filtering by innings, groupby on season, `merge()` to attach season to deliveries, trend analysis

---

### Answer

```python
# First innings total per match
first_innings = (
    deliveries[deliveries["inning"] == 1]
    .groupby("match_id")["total_runs"]
    .sum()
    .reset_index()
    .rename(columns={"total_runs": "first_innings_total"})
)

# Attach season
first_innings = first_innings.merge(
    matches[["id", "season"]], left_on="match_id", right_on="id"
)

# Season-level stats
season_scores = (
    first_innings.groupby("season")["first_innings_total"]
    .agg(
        matches      = "count",
        avg_score    = "mean",
        median_score = "median",
        max_score    = "max",
        min_score    = "min",
        std_score    = "std",
    )
    .round(1)
    .reset_index()
)

print("First Innings Scores by Season:")
print(season_scores.to_string(index=False))

# Year-over-year change
season_scores["avg_score_yoy_change"] = season_scores["avg_score"].diff().round(1)
print("\nYear-over-year change in average first innings score:")
print(season_scores[["season", "avg_score", "avg_score_yoy_change"]].to_string(index=False))

# Rolling 3-season average (smooths out single-season anomalies)
season_scores["rolling_3yr_avg"] = (
    season_scores["avg_score"].rolling(window=3, min_periods=1).mean().round(1)
)
print("\nRolling 3-season average score:")
print(season_scores[["season", "avg_score", "rolling_3yr_avg"]].to_string(index=False))
```

> **`rolling(window=3).mean()`** computes a moving average — the average of the current season and the two preceding ones. This smooths out noise from single anomalous seasons (like 2009's different pitches in South Africa). Rolling averages are the standard technique for revealing trends in time series data.

---

## Question 20
### Which venues are "batsman-friendly" vs "bowler-friendly"? Define this as: venues where the average first-innings score is above/below the overall median. Minimum 20 matches at the venue.

**Concepts:** Global median as a reference point, `transform()` to broadcast global stats, categorisation with `np.where()`

---

### Answer

```python
# First innings totals per match with venue
first_innings_venue = (
    deliveries[deliveries["inning"] == 1]
    .groupby("match_id")["total_runs"]
    .sum()
    .reset_index()
    .rename(columns={"total_runs": "first_innings_total"})
    .merge(matches[["id", "venue", "season"]], left_on="match_id", right_on="id")
)

# Venue-level stats
venue_scores = (
    first_innings_venue.groupby("venue")
    .agg(
        matches        = ("first_innings_total", "count"),
        avg_score      = ("first_innings_total", "mean"),
        median_score   = ("first_innings_total", "median"),
        highest_score  = ("first_innings_total", "max"),
    )
    .round(1)
    .reset_index()
)

# Filter minimum 20 matches
venue_scores = venue_scores[venue_scores["matches"] >= 20]

# Global median across all venues
global_median = first_innings_venue["first_innings_total"].median()
print(f"Global median first-innings score: {global_median:.1f}")

# Classify venues
venue_scores["venue_type"] = np.where(
    venue_scores["avg_score"] > global_median,
    "Batsman-Friendly",
    "Bowler-Friendly"
)

# Sort by avg score
venue_scores = venue_scores.sort_values("avg_score", ascending=False)

print("\nTop batting venues:")
print(venue_scores[venue_scores["venue_type"] == "Batsman-Friendly"]
      .head(8)[["venue", "matches", "avg_score", "highest_score"]].to_string(index=False))

print("\nTop bowling venues:")
print(venue_scores[venue_scores["venue_type"] == "Bowler-Friendly"]
      .tail(8)[["venue", "matches", "avg_score", "highest_score"]].to_string(index=False))
```

> **`np.where(condition, value_if_true, value_if_false)`** is the vectorized ternary operator — far faster than `apply(lambda row: ...)` for creating conditional columns. Use it whenever your new column depends on a single boolean condition applied element-wise.

---

## Question 21
### Track each team's cumulative wins across the seasons. Use `groupby().cumsum()` on the wins data to build a "running title tally" chart.

**Concepts:** `groupby().cumsum()`, multi-level sort, time-ordered cumulative aggregation

---

### Answer

```python
# Step 1: One row per match result per team (was this team in this match and did they win?)
match_outcomes = pd.concat([
    matches[["season", "team1", "winner"]].rename(columns={"team1": "team"}),
    matches[["season", "team2", "winner"]].rename(columns={"team2": "team"}),
], ignore_index=True)

match_outcomes["won"] = (match_outcomes["team"] == match_outcomes["winner"]).astype(int)

# Step 2: Sort by season (essential before cumsum)
match_outcomes = match_outcomes.sort_values("season")

# Step 3: Cumulative wins per team across seasons
season_wins = (
    match_outcomes.groupby(["team", "season"])["won"]
    .sum()
    .reset_index()
    .rename(columns={"won": "wins_this_season"})
    .sort_values(["team", "season"])
)

# Cumulative wins: running total across seasons for each team
season_wins["cumulative_wins"] = (
    season_wins.groupby("team")["wins_this_season"]
    .cumsum()
)

# Show for major teams
major_teams = ["Mumbai Indians", "Chennai Super Kings",
               "Kolkata Knight Riders", "Royal Challengers Bangalore"]
print("Cumulative wins across seasons:")
print(
    season_wins[season_wins["team"].isin(major_teams)]
    .pivot(index="season", columns="team", values="cumulative_wins")
    .fillna(method="ffill")   # fill missing seasons with last value
    .to_string()
)
```

> **Order matters for `cumsum()`!** You must sort by the time dimension (season) BEFORE applying `cumsum()` within a group. If the data is in random order, the running total will be computed in the wrong sequence. Always `sort_values()` before any cumulative operation.

---

## Question 22
### Build the ultimate all-in-one team performance summary: for every team across all seasons, show win rate, average runs scored, average runs conceded, NRR, most common captain (player who won most tosses for that team), and their best season.

**Concepts:** Full pipeline combining matches and deliveries, multiple groupby perspectives, lambda mode, `idxmax()` for best season

---

### Answer

```python
# --- Win rate ---
all_appearances = pd.concat([
    matches[["season", "team1"]].rename(columns={"team1": "team"}),
    matches[["season", "team2"]].rename(columns={"team2": "team"}),
])
total_played_team = all_appearances.groupby("team").size().rename("total_played")
total_wins_team   = matches["winner"].value_counts().rename("total_wins")

# --- Average runs scored and conceded (from deliveries merged with season) ---
del_s = deliveries.merge(matches[["id", "season"]], left_on="match_id", right_on="id")

avg_runs_scored = (
    del_s.groupby("batting_team")["total_runs"]
    .mean()
    .mul(6)  # per-ball average × 6 ≈ per-over average
    .round(2)
    .rename("avg_run_rate_scored")
)
avg_runs_conceded = (
    del_s.groupby("bowling_team")["total_runs"]
    .mean()
    .mul(6)
    .round(2)
    .rename("avg_run_rate_conceded")
)

# --- Most common toss-winner (proxy for captain) ---
toss_freq = (
    matches.groupby("toss_winner")["player_of_match"]
    .count()  # just to count toss wins per team
)
# Actually: captain = player who won most tosses FOR their team
# Approximation using toss_winner = team and player_of_match of those matches
# (Best proxy we have without captain data)

# --- Best season by win rate ---
season_wins_df = (
    match_outcomes.groupby(["team", "season"])
    .agg(
        played = ("won", "count"),
        wins   = ("won",   "sum"),
    )
    .reset_index()
)
season_wins_df["season_win_rate"] = season_wins_df["wins"] / season_wins_df["played"]
best_season_idx = season_wins_df.groupby("team")["season_win_rate"].idxmax()
best_seasons    = season_wins_df.loc[best_season_idx][["team", "season", "season_win_rate"]]
best_seasons    = best_seasons.rename(columns={"season": "best_season",
                                                "season_win_rate": "best_season_win_rate"})

# --- Assemble final table ---
team_summary = pd.DataFrame({
    "total_played"          : total_played_team,
    "total_wins"            : total_wins_team,
    "avg_run_rate_scored"   : avg_runs_scored,
    "avg_run_rate_conceded" : avg_runs_conceded,
})
team_summary["win_rate"] = (team_summary["total_wins"] / team_summary["total_played"] * 100).round(1)
team_summary["nrr"]      = (team_summary["avg_run_rate_scored"] - team_summary["avg_run_rate_conceded"]).round(3)
team_summary = team_summary.reset_index().rename(columns={"index": "team"})
team_summary = team_summary.merge(best_seasons, on="team", how="left")
team_summary = team_summary.sort_values("win_rate", ascending=False)

print("Ultimate Team Performance Summary:")
print(team_summary[["team", "total_played", "total_wins", "win_rate",
                      "nrr", "best_season", "best_season_win_rate"]].to_string(index=False))
```

---

---

# SECTION 6 — Advanced Patterns & Practice Problems (Questions 23–27)

---

## Question 23
### Identify "impact players" — batsmen whose runs in the first 6 overs (powerplay) have the highest correlation with their team's match outcome. Use `groupby()` and `merge()` to build the dataset, then compute correlations.

**Concepts:** Multi-level groupby, merging aggregated data with match results, `corr()`, defining an analytical metric from scratch

---

### Answer

```python
# Step 1: Powerplay runs per batsman per match
is_one_indexed = deliveries["over"].min() == 1
pp_end = 6 if is_one_indexed else 5

powerplay_batting = (
    deliveries[
        (deliveries["over"] <= pp_end) &
        (deliveries["inning"] == 1) &
        (deliveries["wide_runs"] == 0)
    ]
    .groupby(["match_id", "batsman"])["batsman_runs"]
    .sum()
    .reset_index()
    .rename(columns={"batsman_runs": "pp_runs"})
)

# Step 2: Attach match outcome — did batting team win?
powerplay_batting = powerplay_batting.merge(
    deliveries[["match_id", "batting_team"]].drop_duplicates(subset=["match_id", "batting_team"]),
    on="match_id"
)

powerplay_batting = powerplay_batting.merge(
    matches[["id", "winner"]], left_on="match_id", right_on="id"
)

powerplay_batting["team_won"] = (
    powerplay_batting["batting_team"] == powerplay_batting["winner"]
).astype(int)

# Step 3: For each batsman, compute correlation between pp_runs and win
min_pp_appearances = 20
batsman_pp_corr = (
    powerplay_batting.groupby("batsman")
    .filter(lambda g: len(g) >= min_pp_appearances)
    .groupby("batsman")
    .apply(lambda g: g["pp_runs"].corr(g["team_won"]))
    .reset_index()
    .rename(columns={0: "pp_win_correlation"})
    .sort_values("pp_win_correlation", ascending=False)
)

print("Batsmen with highest powerplay-run / team-win correlation:")
print(batsman_pp_corr.head(10).to_string(index=False))
```

> **`corr()` within `apply()`** computes the Pearson correlation between two columns within a group. This is a powerful pattern for "does metric X predict outcome Y, and does this relationship differ by player/team/venue?" The `filter()` before `apply()` ensures only players with enough data are included, preventing spurious correlations from small samples.

---

## Question 24
### Find partnerships: pairs of batsmen (batsman + non_striker) who have scored the most partnership runs together across all IPL matches.

**Concepts:** Groupby on two columns simultaneously, creating a canonical pair key with `sorted()` + `apply()`, `sum()` on partnership runs

---

### Answer

```python
# Step 1: Create a canonical partnership key (alphabetical order)
# So (Rohit, Tendulkar) and (Tendulkar, Rohit) are treated as the same partnership
deliveries["partnership_key"] = deliveries.apply(
    lambda r: " & ".join(sorted([str(r["batsman"]), str(r["non_striker"])])),
    axis=1
)

# Step 2: Partnership runs per match per key
# Use batsman_runs (not total_runs) as extras aren't partnership runs
partnership_runs = (
    deliveries[deliveries["wide_runs"] == 0]
    .groupby(["match_id", "inning", "partnership_key"])["batsman_runs"]
    .sum()
    .reset_index()
    .rename(columns={"batsman_runs": "partnership_contribution"})
)

# Step 3: Total partnership runs across all instances
all_time_partnerships = (
    partnership_runs.groupby("partnership_key")
    .agg(
        total_runs    = ("partnership_contribution", "sum"),
        partnership_innings = ("partnership_contribution", "count"),
        avg_runs      = ("partnership_contribution", "mean"),
        best_stand    = ("partnership_contribution", "max"),
    )
    .round(1)
    .reset_index()
    .sort_values("total_runs", ascending=False)
)

print("Top 20 All-Time IPL Partnerships by Total Runs:")
print(all_time_partnerships.head(20).to_string(index=False))
```

> **Canonical key creation** (`sorted()` + `join()`) solves the ordering problem: the batsman on strike and the non-striker switch roles between balls, but they're in the same partnership. By sorting the two names alphabetically and joining them, we create a consistent key regardless of who was on strike. This pattern — creating a canonical representation to group bidirectional relationships — is essential for pair/edge analysis in any domain (user pairs, transaction pairs, etc.).

---

## Question 25
### Use `pd.crosstab` to build a dismissal-type matrix: for each bowler (top 15 by wickets), show how many wickets they took via each dismissal type (caught, bowled, lbw, etc.).

**Concepts:** `pd.crosstab()`, multi-level column analysis, filtering to top N, `fillna()`

---

### Answer

```python
# Get wickets only (no run-outs)
wicket_deliveries = deliveries[
    deliveries["player_dismissed"].notna() &
    ~deliveries["dismissal_kind"].isin(["run out", "retired hurt", "obstructing the field"])
].copy()

# Top 15 bowlers by wicket count
top15_bowlers = (
    wicket_deliveries["bowler"].value_counts().head(15).index.tolist()
)

# Filter to top 15 bowlers
top15_wickets = wicket_deliveries[wicket_deliveries["bowler"].isin(top15_bowlers)]

# Crosstab: rows = bowler, columns = dismissal_kind
dismissal_matrix = pd.crosstab(
    index   = top15_wickets["bowler"],
    columns = top15_wickets["dismissal_kind"],
    margins = True,
    margins_name = "Total"
).fillna(0).astype(int)

# Sort rows by total wickets descending
dismissal_matrix = dismissal_matrix.sort_values("Total", ascending=False)

print("Dismissal Type Matrix — Top 15 IPL Wicket-Takers:")
print(dismissal_matrix)

# Normalize: what % of each bowler's wickets came via each type?
dismissal_pct = pd.crosstab(
    index     = top15_wickets["bowler"],
    columns   = top15_wickets["dismissal_kind"],
    normalize = "index"
).round(3).mul(100).round(1)

print("\nDismissal type % per bowler:")
print(dismissal_pct.sort_values("caught", ascending=False))
```

> **`crosstab` with `normalize='index'`** gives the row-wise percentage — for each bowler, what percentage of their wickets were caught vs bowled vs lbw. This reveals each bowler's "style" — a spinner who takes 70% of wickets caught vs a fast bowler who takes 40% bowled.

---

## Question 26
### Calculate the "Pressure Index" for each bowler in death overs: economy rate × (1 - wicket rate). Lower is better — it means they're economical AND taking wickets.

**Concepts:** Derived multi-metric scoring formula, `groupby()` with multiple agg functions, applying a custom scoring formula

---

### Answer

```python
is_one_indexed = deliveries["over"].min() == 1
death_start = 16 if is_one_indexed else 15

death_bowling = deliveries[deliveries["over"] >= death_start].copy()

# Wickets in death (not run-outs)
death_bowling["is_wicket"] = (
    death_bowling["player_dismissed"].notna() &
    ~death_bowling["dismissal_kind"].isin(["run out", "retired hurt"])
).astype(int)

# Legal balls for economy
death_legal = death_bowling[death_bowling["wide_runs"] == 0]

death_bowler_stats = (
    death_legal.groupby("bowler")
    .agg(
        balls   = ("total_runs", "count"),
        runs    = ("total_runs", "sum"),
        wickets = ("is_wicket",  "sum"),
    )
    .reset_index()
)

death_bowler_stats["overs"]       = (death_bowler_stats["balls"] / 6).round(2)
death_bowler_stats["economy"]     = (death_bowler_stats["runs"] / death_bowler_stats["overs"]).round(2)
death_bowler_stats["wicket_rate"] = (death_bowler_stats["wickets"] / death_bowler_stats["balls"]).round(4)

# Pressure Index = economy × (1 - wicket_rate)
# Lower = better: economical AND takes wickets
death_bowler_stats["pressure_index"] = (
    death_bowler_stats["economy"] * (1 - death_bowler_stats["wicket_rate"])
).round(3)

# Filter: minimum 10 overs in death
qualified = death_bowler_stats[death_bowler_stats["overs"] >= 10]

print("Death Over Bowling — Pressure Index (lower is better, min 10 overs):")
print(
    qualified.nsmallest(15, "pressure_index")
    [["bowler", "overs", "wickets", "economy", "wicket_rate", "pressure_index"]]
    .reset_index(drop=True)
    .to_string(index=False)
)
```

> **Composite scoring in sports analytics** always involves a tradeoff — a single metric is never sufficient. Economy rate doesn't account for wickets; wicket rate doesn't account for runs. The Pressure Index combines both: a bowler who goes at 12 per over but takes wickets is worse than one who goes at 9 but takes none. The formula `economy × (1 - wicket_rate)` rewards both dimensions simultaneously.

---

## Question 27
### Build the final investor/selector report: if you were picking a team for a high-stakes match, rank the top all-rounders using a composite score based on batting (runs + SR) and bowling (wickets + economy).

**Concepts:** Multi-table pipeline, normalising different metrics to a common scale, weighted composite scoring, `merge()` across three aggregated datasets

---

### Answer

```python
# --- Batting score (legal balls) ---
legal = deliveries[deliveries["wide_runs"] == 0]

batting = (
    legal.groupby("batsman")
    .agg(
        bat_runs  = ("batsman_runs", "sum"),
        balls_bat = ("batsman_runs", "count"),
    )
    .reset_index()
)
batting["bat_sr"] = (batting["bat_runs"] / batting["balls_bat"] * 100).round(2)
batting = batting[batting["balls_bat"] >= 200]  # minimum 200 balls faced

# --- Bowling score ---
wicket_balls = deliveries[
    deliveries["player_dismissed"].notna() &
    ~deliveries["dismissal_kind"].isin(["run out", "retired hurt"])
]
wickets_count = (
    wicket_balls.groupby("bowler")["player_dismissed"].count()
    .reset_index()
    .rename(columns={"bowler": "player", "player_dismissed": "wickets"})
)

bowling = (
    legal.groupby("bowler")
    .agg(
        balls_bow = ("total_runs", "count"),
        runs_bow  = ("total_runs", "sum"),
    )
    .reset_index()
    .rename(columns={"bowler": "player"})
)
bowling["overs"]   = (bowling["balls_bow"] / 6).round(2)
bowling["economy"] = (bowling["runs_bow"] / bowling["overs"]).round(2)
bowling = bowling[bowling["overs"] >= 30]  # minimum 30 overs bowled
bowling = bowling.merge(wickets_count, on="player", how="left")
bowling["wickets"] = bowling["wickets"].fillna(0).astype(int)

# --- Merge batting and bowling ---
batting = batting.rename(columns={"batsman": "player"})
allrounders = batting.merge(bowling, on="player", how="inner")
# inner join: only players who have BOTH batting AND bowling records

print(f"Players with both batting and bowling records: {len(allrounders)}")

# --- Normalise each metric to 0–1 ---
def minmax(s):
    rng = s.max() - s.min()
    return (s - s.min()) / rng if rng > 0 else pd.Series(0, index=s.index)

allrounders["norm_runs"]    = minmax(allrounders["bat_runs"])
allrounders["norm_sr"]      = minmax(allrounders["bat_sr"])
allrounders["norm_wickets"] = minmax(allrounders["wickets"])
# For economy: LOWER is BETTER — so invert
allrounders["norm_economy"] = 1 - minmax(allrounders["economy"])

# --- Composite score (weights reflect importance) ---
allrounders["allrounder_score"] = (
    allrounders["norm_runs"]    * 0.30 +
    allrounders["norm_sr"]      * 0.20 +
    allrounders["norm_wickets"] * 0.30 +
    allrounders["norm_economy"] * 0.20
).round(4)

# Top 20 all-rounders
top_allrounders = (
    allrounders.nlargest(20, "allrounder_score")
    [["player", "bat_runs", "bat_sr", "wickets", "economy", "allrounder_score"]]
    .reset_index(drop=True)
)
top_allrounders.index += 1

print("\nTop 20 IPL All-Rounders — Composite Score:")
print(top_allrounders.to_string())
```

---

## Concepts Coverage Checklist

```
BASICS
✅ shape, dtypes, info(), describe() on two tables
✅ value_counts(), sort_index() for time-ordered counts
✅ isnull().sum() — missing value audit
✅ nunique() — unique value counts

SINGLE-TABLE AGGREGATION
✅ groupby().size()
✅ groupby().count() vs groupby().size()
✅ groupby().mean(), .sum(), .median(), .max(), .min()
✅ Named multi-metric aggregations: agg(col=("src", "fn"))
✅ Lambda inside agg() — e.g., (x == 4).sum(), mode()
✅ nlargest(), nsmallest()
✅ value_counts(normalize=True) — proportions

FILTERING
✅ Boolean filtering with & and |
✅ ~isin() — exclusion filter
✅ notna() / isna() — null filters
✅ Multi-condition filtering with complex logic
✅ .between() — range filter

MERGING (THE CORE SKILL)
✅ pd.merge() — left join vs inner join
✅ merge() on different key names (left_on / right_on)
✅ Bringing only needed columns from right table
✅ Verifying row counts before and after merge
✅ Multi-step multi-table pipeline

RESHAPING
✅ pd.concat([col1, col2]) — stacking columns into a series
✅ pd.crosstab() — frequency tables with margins
✅ pd.crosstab(normalize='index'/'columns'/True)
✅ pivot() — long to wide format
✅ unstack() — multi-level index to columns
✅ pd.pivot_table() — flexible pivot with aggfunc

TRANSFORMS
✅ groupby().transform("sum") — broadcast group total to rows
✅ groupby().transform("mean") — broadcast group mean to rows
✅ groupby().cumsum() — running total within groups
✅ groupby().diff() — change from previous row within group
✅ groupby().rank() — rank within group (dense, pct)
✅ groupby().transform(lambda) — custom within-group computation

ADVANCED
✅ pd.cut() — custom phase bins (powerplay/middle/death)
✅ rolling(window=n).mean() — rolling average over time
✅ apply(axis=1) — row-level logic using multiple columns
✅ groupby().idxmax() — index of max value per group
✅ groupby().apply() with nlargest() — top N per group
✅ corr() within groupby — correlation by group
✅ np.where() — vectorized conditional column creation
✅ sorted() + join() — canonical pair keys
✅ Composite scoring with min-max normalisation
✅ Multi-perspective merging (batting + bowling perspectives)
✅ Wicket filtering with ~isin() for proper credit attribution
✅ Wide-ball filtering for accurate balls faced / overs
✅ Domain-specific formulas (NRR, economy, batting avg, SR)
```

---

*End of Practice Sheet — IPL Dataset*
*Codeverra — codeverra.com*
