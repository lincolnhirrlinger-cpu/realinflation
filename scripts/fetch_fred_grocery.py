#!/usr/bin/env python3
"""
Fetch real grocery prices from FRED API and update all city JSON files.
Run: python3 scripts/fetch_fred_grocery.py
"""
import json, os, sys
from pathlib import Path
from datetime import date
import urllib.request

FRED_KEY = os.getenv("FRED_API_KEY", "1d0a4dea7fae4b805a3f1eb20c48d790")
DATA_DIR = Path(__file__).parent.parent / "public" / "data"

SERIES = {
    "eggs":        ("APU0000708111", "Eggs, grade A, large (dozen)"),
    "milk":        ("APU0000709112", "Milk, whole, fortified (gallon)"),
    "bread":       ("APU0000702111", "Bread, white, pan (lb)"),
    "ground_beef": ("APU0000703112", "Ground beef, 100% beef (lb)"),
    "chicken":     ("APU0000706111", "Chicken breast, boneless (lb)"),
}

# Also pull Food at Home CPI for YoY calc
FOOD_AT_HOME_SERIES = "CUSR0000SAF11"
ALL_ITEMS_SERIES    = "CPIAUCSL"

def fred_fetch(series_id, limit=60):
    url = (f"https://api.stlouisfed.org/fred/series/observations"
           f"?series_id={series_id}&api_key={FRED_KEY}&file_type=json"
           f"&limit={limit}&sort_order=desc")
    with urllib.request.urlopen(url, timeout=15) as r:
        return json.loads(r.read())["observations"]

def get_current_and_history(series_id):
    obs = fred_fetch(series_id, limit=60)
    # Filter out '.' (missing) values
    valid = [(o["date"][:7], float(o["value"])) for o in obs if o["value"] != "."]
    current = valid[0][1] if valid else None
    # Build history dict: YYYY-MM -> price
    history = {date: price for date, price in valid}
    return current, history

def calc_yoy_pct(series_id):
    """Calculate YoY % change from Food at Home CPI."""
    obs = fred_fetch(series_id, limit=24)
    valid = [(o["date"][:7], float(o["value"])) for o in obs if o["value"] != "."]
    if len(valid) < 13:
        return None
    latest_val = valid[0][1]
    # Find 12 months ago
    latest_date = valid[0][0]
    year_ago_date = f"{int(latest_date[:4])-1}{latest_date[4:]}"
    year_ago = next((v for d,v in valid if d == year_ago_date), None)
    if not year_ago:
        return None
    return round((latest_val - year_ago) / year_ago * 100, 2)

print("Fetching FRED grocery data...")
grocery_data = {}
for slug, (series_id, desc) in SERIES.items():
    current, history = get_current_and_history(series_id)
    grocery_data[slug] = {"current": current, "history": history, "desc": desc, "series": series_id}
    print(f"  {slug}: ${current:.3f} ({desc})")

# Get 2022-01 baseline for each item
baseline_2022 = {}
for slug, data in grocery_data.items():
    b = data["history"].get("2022-01") or data["history"].get("2022-02") or data["history"].get("2022-03")
    baseline_2022[slug] = b
    if b:
        chg = (data["current"] - b) / b * 100
        print(f"  {slug} vs Jan 2022: {chg:+.1f}%")

# Get national Food at Home YoY
food_yoy = calc_yoy_pct(FOOD_AT_HOME_SERIES)
print(f"\nFood at Home CPI YoY: {food_yoy}%")

# Update ALL city files with real FRED prices
cities_path = DATA_DIR / "cities.json"
cities = json.loads(cities_path.read_text())

updated = 0
for city_meta in cities:
    slug = city_meta["slug"]
    f = DATA_DIR / f"{slug}.json"
    if not f.exists():
        continue
    d = json.loads(f.read_text())

    # Update grocery items with real national prices
    # (FRED is national; we don't have city-level for most items)
    items = d.get("groceries", {}).get("items", [])
    for item in items:
        item_slug = item["slug"]
        if item_slug in grocery_data:
            real = grocery_data[item_slug]
            b2022 = baseline_2022.get(item_slug)
            item["current"] = real["current"]
            item["source"] = f"BLS/FRED {real['series']}"
            if b2022:
                item["change_from_2022"] = round((real["current"] - b2022) / b2022 * 100, 1)
                item["price_2022"] = b2022

    # Update YoY inflation rate with real FRED Food at Home CPI
    if food_yoy is not None:
        d["groceries"]["inflation_rate"]["current_yoy"] = food_yoy
        d["groceries"]["inflation_rate"]["source"] = "BLS CPI Food at Home (CUSR0000SAF11)"

    # Add data source metadata
    d["data_sources"] = d.get("data_sources", {})
    d["data_sources"]["groceries"] = "BLS/FRED APU series — national avg prices"
    d["data_sources"]["gas"] = "AAA Gas Prices — state-level avg"

    f.write_text(json.dumps(d, indent=2))
    updated += 1

print(f"\nUpdated {updated} city files with real FRED grocery data")
print("\nSummary of real prices now in all cities:")
for slug, data in grocery_data.items():
    b = baseline_2022.get(slug)
    chg = f"{(data['current']-b)/b*100:+.1f}%" if b else "n/a"
    print(f"  {slug}: ${data['current']:.2f} ({chg} vs Jan 2022)")
