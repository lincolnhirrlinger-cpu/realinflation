#!/usr/bin/env python3
"""
Rebuild all city grocery data with 2000 baseline instead of 2022.
Fetches full FRED history from 2000-01-01 to present.
Updates change_from_baseline, history, and baseline fields.
"""
import json, urllib.request, time
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "public" / "data"
FRED_KEY = "1d0a4dea7fae4b805a3f1eb20c48d790"
BASE_URL = "https://api.stlouisfed.org/fred/series/observations"
TODAY = date.today().isoformat()
BASELINE_YEAR = "2000"

FRED_SERIES = {
    "Eggs (dozen)":       "APU0000708111",
    "Milk (gallon)":      "APU0000709112",
    "Bread (loaf)":       "APU0000702111",
    "Ground Beef (lb)":   "APU0000703112",
    "Chicken Breast (lb)":"APU0000706111",
}

def fetch_series(sid: str) -> list:
    url = (f"{BASE_URL}?series_id={sid}&api_key={FRED_KEY}"
           f"&observation_start=2000-01-01&sort_order=asc&file_type=json")
    resp = urllib.request.urlopen(url, timeout=15)
    obs = json.loads(resp.read())['observations']
    return [o for o in obs if o['value'] != '.']

def annual_series(obs: list) -> dict:
    """Collapse monthly FRED data into annual snapshots (Jan of each year)."""
    annual = {}
    for o in obs:
        yr = o['date'][:4]
        mo = o['date'][5:7]
        # Use January reading as year anchor; fallback to first available month
        if mo == '01' or yr not in annual:
            annual[yr] = round(float(o['value']), 3)
    return annual

print(f"Fetching FRED data from 2000→present for {len(FRED_SERIES)} series...")
series_data = {}
for item_name, sid in FRED_SERIES.items():
    obs = fetch_series(sid)
    annual = annual_series(obs)
    latest = round(float(obs[-1]['value']), 3)
    baseline = annual.get(BASELINE_YEAR) or round(float(obs[0]['value']), 3)
    change_pct = round((latest - baseline) / baseline * 100, 1)
    series_data[item_name] = {
        "annual": annual,
        "latest": latest,
        "latest_date": obs[-1]['date'],
        "baseline_2000": baseline,
        "change_from_2000": change_pct,
        "source": f"BLS/FRED {sid}",
    }
    print(f"  {item_name}: ${baseline:.2f} (2000) → ${latest:.2f} (now) = +{change_pct:.1f}%")
    time.sleep(0.3)

# Also fetch CPI for context
print("\nFetching CPI series...")
for label, sid in [("CPI All Items", "CPIAUCSL"), ("Food at Home CPI", "CUSR0000SAF11")]:
    obs = fetch_series(sid)
    annual = annual_series(obs)
    b2000 = annual.get("2000", float(obs[0]['value']))
    latest = float(obs[-1]['value'])
    print(f"  {label}: {b2000:.1f} (2000) → {latest:.1f} (now) = +{(latest-b2000)/b2000*100:.1f}%")
    time.sleep(0.3)

# Now update all city JSON files
city_files = [f for f in sorted(DATA_DIR.glob("*.json")) if f.name != 'cities.json']
print(f"\nUpdating {len(city_files)} city files...")
updated = 0

for f in city_files:
    d = json.loads(f.read_text())
    changed = False

    items = d.get('groceries', {}).get('items', [])
    for item in items:
        name = item.get('name')
        if name not in series_data:
            continue
        sd = series_data[name]

        # Update baseline
        item['baseline_2000'] = sd['baseline_2000']
        item['price_2000'] = sd['baseline_2000']
        item['change_from_2000'] = sd['change_from_2000']

        # Keep 2022 baseline too for reference
        item['baseline_2022'] = sd['annual'].get('2022', item.get('baseline_2022'))
        item['price_2022'] = item['baseline_2022']
        item['change_from_2022'] = round(
            (sd['latest'] - item['baseline_2022']) / item['baseline_2022'] * 100, 1
        ) if item.get('baseline_2022') else item.get('change_from_2022')

        # Primary change metric is now from 2000
        item['change_from_baseline'] = sd['change_from_2000']
        item['baseline_year'] = 2000
        item['current'] = sd['latest']
        item['current_price'] = sd['latest']

        # Full annual history from 2000
        item['history'] = [
            {"date": yr, "price": price}
            for yr, price in sorted(sd['annual'].items())
        ]
        item['source'] = sd['source']
        changed = True

    if changed:
        d['groceries']['baseline_year'] = 2000
        d['last_updated'] = TODAY
        f.write_text(json.dumps(d, separators=(',', ':')))
        updated += 1

print(f"✅ Updated {updated}/{len(city_files)} city files with 2000 baseline")

# Show sample
d = json.loads(Path(DATA_DIR / 'boise-id.json').read_text())
print("\nBoise sample:")
for item in d['groceries']['items'][:5]:
    name = item['name']
    b2000 = item.get('price_2000', '?')
    current = item.get('current_price', '?')
    chg = item.get('change_from_2000', '?')
    print(f"  {name}: ${b2000} (2000) → ${current} (now) = +{chg}%")
