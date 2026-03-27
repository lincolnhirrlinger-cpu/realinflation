#!/usr/bin/env python3
"""
Master data refresh script for RealInflation.
Fetches fresh data from all free APIs and updates city JSON files.

Sources:
  - FRED API (free): grocery prices, CPI — updates monthly
  - Zillow ZORI (free CSV): metro rent — updates monthly  
  - AAA (scrape): state gas prices — updates daily
  - BLS public API (no key): CPI confirmation

Run daily via cron. Build + deploy after.
Usage: python3 scripts/refresh_all_data.py [--gas-only] [--rent-only] [--groceries-only]
"""
import json, sys, urllib.request, urllib.parse, csv, io, re, time
from pathlib import Path
from datetime import datetime, date

DATA_DIR = Path(__file__).parent.parent / "public" / "data"
FRED_KEY = "1d0a4dea7fae4b805a3f1eb20c48d790"
EIA_KEY = "ah7QeFKdBjHWLGxTlcGpiV28bmxbfVyhQOsOm7aQ"
SCRAPE_WORKER = "http://127.0.0.1:8741"
SCRAPE_TOKEN = "u7cM6fYyU0_BHjtOz0l1PqDgKtrSupW2451L935wZoQ"
TODAY = date.today().isoformat()

# ─── FRED Grocery Prices ─────────────────────────────────────────────────────

FRED_SERIES = {
    "eggs":        ("APU0000708111", "Eggs (dozen)"),
    "milk":        ("APU0000709112", "Milk (gallon)"),
    "bread":       ("APU0000702111", "Bread (loaf)"),
    "ground_beef": ("APU0000703112", "Ground Beef (lb)"),
    "chicken":     ("APU0000706111", "Chicken Breast (lb)"),
}
FRED_CPI = {
    "cpi_food":    "CUSR0000SAF11",
    "cpi_all":     "CPIAUCSL",
    "cpi_shelter": "CUSR0000SAH1",
}

def fetch_fred_series(sid: str, limit: int = 60) -> list:
    url = (f"https://api.stlouisfed.org/fred/series/observations"
           f"?series_id={sid}&api_key={FRED_KEY}&sort_order=desc&limit={limit}&file_type=json")
    resp = urllib.request.urlopen(url, timeout=15)
    return json.loads(resp.read())['observations']

def refresh_groceries() -> dict:
    """Returns dict of item_key -> {current, baseline_2022, change_pct, history}"""
    print("  Fetching FRED grocery prices...")
    results = {}
    for key, (sid, name) in FRED_SERIES.items():
        try:
            obs = fetch_fred_series(sid, 60)
            # latest valid value
            current = next((float(o['value']) for o in obs if o['value'] != '.'), None)
            latest_date = next((o['date'] for o in obs if o['value'] != '.'), None)
            # 2022-01 baseline
            b2022 = next((float(o['value']) for o in reversed(obs) if o['date'].startswith('2022-01') and o['value'] != '.'), None)
            if not b2022:
                b2022 = next((float(o['value']) for o in reversed(obs) if o['date'].startswith('2022') and o['value'] != '.'), None)
            change_pct = round((current - b2022) / b2022 * 100, 1) if (current and b2022) else 0.0
            # Build year history
            history = {}
            for o in reversed(obs):
                if o['value'] == '.': continue
                yr = o['date'][:4]
                if yr not in history:
                    history[yr] = round(float(o['value']), 3)
            results[key] = {
                "name": name, "current": round(current, 3) if current else None,
                "baseline_2022": round(b2022, 3) if b2022 else None,
                "change_pct": change_pct,
                "history": history,
                "date": latest_date,
                "source": f"BLS/FRED {sid}",
            }
            print(f"    {name}: ${current:.3f} ({'+' if change_pct>0 else ''}{change_pct:.1f}% vs 2022)")
            time.sleep(0.3)
        except Exception as e:
            print(f"    ERROR {key}: {e}")
    # CPI
    try:
        obs = fetch_fred_series(FRED_CPI["cpi_food"], 2)
        v = float(obs[0]['value']); pv = float(obs[1]['value'])
        results["cpi_food_yoy"] = round((v - pv) / pv * 100 * 12, 2)  # annualized
        print(f"    Food CPI YoY: {results['cpi_food_yoy']:.2f}%")
    except: pass
    return results

# ─── Zillow ZORI Rent ────────────────────────────────────────────────────────

ZORI_URL = "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv"
MANUAL_RENT = {
    "wilmington-de": 1400, "meridian-id": 1550, "nampa-id": 1350,
    "kansas-city-ks": 1200, "annapolis-md": 1900, "saint-paul-mn": 1450,
    "biloxi-ms": 1050, "newark-nj": 1800, "cranston-ri": 1600,
    "pierre-sd": 900, "fort-worth-tx": 1550, "montpelier-vt": 1400,
}

def refresh_rent() -> dict:
    """Returns dict of city_slug -> {current, prev_year, baseline_2022, yoy_pct}"""
    print("  Fetching Zillow ZORI rent data...")
    resp = urllib.request.urlopen(ZORI_URL, timeout=30)
    rows = list(csv.DictReader(io.TextIOWrapper(resp, 'utf-8')))
    date_cols = [c for c in rows[0].keys() if c[0].isdigit()]
    latest = date_cols[-1]
    prev_yr = date_cols[-13] if len(date_cols) > 13 else date_cols[0]
    b2022 = next((c for c in date_cols if c.startswith('2022-01')), date_cols[0])
    print(f"    Latest: {latest} | 1yr ago: {prev_yr} | 2022: {b2022}")
    
    lookup = {}
    for r in rows:
        region = r['RegionName']
        state = r['StateName'].upper() if r['StateName'] else ''
        val = r.get(latest, '')
        if not val: continue
        city_part = region.split(', ')[0].lower()
        payload = {
            "current": round(float(val)),
            "prev_year": round(float(r[prev_yr])) if r.get(prev_yr) else None,
            "baseline_2022": round(float(r[b2022])) if r.get(b2022) else None,
            "date": latest,
        }
        lookup[f"{city_part}|{state}"] = payload
        lookup[region.lower()] = payload
    
    print(f"    Loaded {len(lookup)//2} ZORI metros")
    return lookup

def match_rent(city_name: str, state_abbr: str, lookup: dict):
    state = state_abbr.upper()
    city = city_name.lower()
    for c in [f"{city}|{state}", f"{city} city|{state}"]:
        if c in lookup: return lookup[c]
    for key, val in lookup.items():
        if '|' in key:
            kc, ks = key.split('|')
            if ks == state and (city in kc or kc.startswith(city)):
                return val
    return None

# ─── AAA Gas Prices ──────────────────────────────────────────────────────────

STATE_ABBR = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
    'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA',
    'Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT',
    'Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM',
    'New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
    'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
    'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT',
    'Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY',
    'District of Columbia':'DC',
}

def refresh_gas() -> dict:
    """Returns dict of state_abbr -> price"""
    print("  Fetching AAA gas prices...")
    try:
        req = urllib.request.Request(
            "https://gasprices.aaa.com/state-gas-price-averages/",
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        )
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
    except:
        # Fallback to scrape-worker
        try:
            req = urllib.request.Request(
                f"{SCRAPE_WORKER}/fetch",
                data=json.dumps({"url":"https://gasprices.aaa.com/state-gas-price-averages/","render_js":True,"wait":3}).encode(),
                headers={"Content-Type":"application/json","Authorization":f"Bearer {SCRAPE_TOKEN}"}
            )
            html = json.loads(urllib.request.urlopen(req, timeout=20).read())['html']
        except Exception as e:
            print(f"    AAA fetch failed: {e}")
            return {}

    # Extract state prices
    # National avg
    natl_m = re.findall(r'[Nn]ational[^0-9$]{0,20}\$?\s*([23456]\.[0-9]{1,3})', html)
    national = float(natl_m[0]) if natl_m else None

    state_prices = {}
    for state_name, abbr in STATE_ABBR.items():
        pattern = rf'{re.escape(state_name)}[^0-9$]{{0,50}}\$?\s*([23456]\.[0-9]{{3}})'
        m = re.findall(pattern, html)
        if m:
            state_prices[abbr] = float(m[0])

    if national:
        state_prices['NATIONAL'] = national
        print(f"    National: ${national:.3f} | States found: {len(state_prices)-1}")
    else:
        print(f"    States found: {len(state_prices)}")

    return state_prices

# ─── EIA Electricity Prices ─────────────────────────────────────────────────

def refresh_electricity() -> dict:
    """Returns dict of state_abbr -> cents_per_kwh (residential)"""
    print("  Fetching EIA electricity prices (residential)...")
    all_data = []
    for offset in [0, 60, 120]:
        params = urllib.parse.urlencode({
            "api_key": EIA_KEY,
            "frequency": "monthly",
            "data[0]": "price",
            "facets[sectorid][]": "RES",
            "sort[0][column]": "period",
            "sort[0][direction]": "desc",
            "length": "60",
            "offset": str(offset),
        })
        url = f"https://api.eia.gov/v2/electricity/retail-sales/data/?{params}"
        try:
            resp = urllib.request.urlopen(url, timeout=15)
            batch = json.loads(resp.read()).get('response', {}).get('data', [])
            if not batch: break
            all_data.extend(batch)
            time.sleep(0.2)
        except Exception as e:
            print(f"    EIA fetch error (offset {offset}): {e}")
            break

    if not all_data:
        return {}

    latest_period = all_data[0]['period']
    state_prices = {}
    national_sum = 0.0
    national_count = 0
    for r in all_data:
        sid = r.get('stateid', '')
        if r['period'] == latest_period and len(sid) == 2 and sid.isalpha() and r.get('price'):
            state_prices[sid] = round(float(r['price']), 2)
            if sid not in ('AK', 'HI'):  # exclude outliers from national avg
                national_sum += float(r['price'])
                national_count += 1

    national_avg = round(national_sum / national_count, 2) if national_count else 17.0
    state_prices['NATIONAL'] = national_avg

    print(f"    Period: {latest_period} | States: {len(state_prices)-1} | National avg: {national_avg}¢/kWh")
    # Show extremes
    sorted_states = sorted([(k, v) for k, v in state_prices.items() if k != 'NATIONAL'], key=lambda x: x[1])
    print(f"    Cheapest: {sorted_states[0][0]} {sorted_states[0][1]}¢ | Priciest: {sorted_states[-1][0]} {sorted_states[-1][1]}¢")
    return state_prices


# ─── Apply to City Files ─────────────────────────────────────────────────────

def apply_updates(grocery_data: dict, rent_lookup: dict, gas_prices: dict, elec_prices: dict = None):
    SKIP_FILES = {'cities.json', 'counties.json'}
    city_files = [f for f in sorted(DATA_DIR.glob("*.json")) if f.name not in SKIP_FILES]
    national_gas = gas_prices.get('NATIONAL', 3.977)
    updated = 0

    for f in city_files:
        d = json.loads(f.read_text())
        slug = d.get('slug', f.stem)
        city_name = d.get('city', '')
        state_abbr = slug.split('-')[-1].upper()
        changed = False

        # Gas
        city_gas = gas_prices.get(state_abbr)
        if city_gas:
            d['gas']['current'] = round(city_gas, 3)
            d['gas']['national_current'] = round(national_gas, 3)
            changed = True

        # Rent
        zori = match_rent(city_name, state_abbr, rent_lookup)
        if zori:
            current_rent = zori['current']
            d['rent']['avg_all'] = current_rent
            d['rent']['avg_1br'] = round(current_rent * 0.82)
            d['rent']['avg_2br'] = round(current_rent * 1.18)
            if zori['baseline_2022']:
                d['rent']['baseline_2022'] = zori['baseline_2022']
            if zori['prev_year']:
                d['rent']['yoy_change_pct'] = round((current_rent - zori['prev_year']) / zori['prev_year'] * 100, 1)
            d['rent']['source'] = f"Zillow ZORI Metro ({zori['date'][:7]})"
            changed = True
        elif slug in MANUAL_RENT:
            d['rent']['avg_all'] = MANUAL_RENT[slug]
            changed = True

        # Groceries — update items array
        if grocery_data:
            item_map = {
                "eggs": "Eggs (dozen)", "milk": "Milk (gallon)",
                "bread": "Bread (loaf)", "ground_beef": "Ground Beef (lb)",
                "chicken": "Chicken Breast (lb)",
            }
            for key, item_name in item_map.items():
                if key not in grocery_data: continue
                gd = grocery_data[key]
                for item in d.get('groceries', {}).get('items', []):
                    if item.get('name') == item_name:
                        if gd['current']: item['current_price'] = gd['current']
                        if gd['baseline_2022']: item['price_2022'] = gd['baseline_2022']
                        if gd['change_pct'] is not None: item['change_from_2022'] = gd['change_pct']
                        # Update year history
                        if gd['history']:
                            item['history'] = [
                                {"date": yr, "price": price}
                                for yr, price in sorted(gd['history'].items())
                            ]
                        item['source'] = gd['source']
                        changed = True
                        break

            # Update YoY inflation rate
            if 'cpi_food_yoy' in grocery_data:
                d['groceries']['inflation_rate']['current_yoy'] = grocery_data['cpi_food_yoy']

        # Electricity
        if elec_prices:
            state_rate = elec_prices.get(state_abbr)
            national_rate = elec_prices.get('NATIONAL', 17.0)
            if state_rate:
                if 'electricity' not in d:
                    d['electricity'] = {}
                elec = d['electricity']
                elec['cents_per_kwh'] = state_rate
                elec['avg_monthly_kwh_rate'] = state_rate
                elec['national_avg_cents'] = national_rate
                elec['national_avg_rate'] = national_rate
                # Recalc monthly bill (avg US home uses ~900 kWh/mo)
                usage_kwh = 900
                elec['monthly_avg_bill'] = round(usage_kwh * state_rate / 100, 1)
                elec['avg_monthly_bill'] = round(usage_kwh * state_rate / 100)
                elec['national_avg_bill'] = round(usage_kwh * national_rate / 100, 1)
                elec['source'] = f"EIA Residential ({TODAY[:7]})"
                changed = True

        if changed:
            d['last_updated'] = TODAY
            f.write_text(json.dumps(d, separators=(',', ':')))
            updated += 1

    print(f"\n  ✅ Updated {updated}/{len(city_files)} city files")
    return updated

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    gas_only = '--gas-only' in args
    rent_only = '--rent-only' in args
    groceries_only = '--groceries-only' in args
    electricity_only = '--electricity-only' in args
    all_data = not any([gas_only, rent_only, groceries_only, electricity_only])

    print(f"\n🔄 RealInflation Data Refresh — {TODAY}")
    print("=" * 50)

    grocery_data = {}
    rent_lookup = {}
    gas_prices = {}
    elec_prices = {}

    if all_data or groceries_only:
        print("\n📦 Groceries (FRED/BLS):")
        grocery_data = refresh_groceries()

    if all_data or rent_only:
        print("\n🏠 Rent (Zillow ZORI):")
        rent_lookup = refresh_rent()

    if all_data or gas_only:
        print("\n⛽ Gas (AAA):")
        gas_prices = refresh_gas()

    if all_data or electricity_only:
        print("\n⚡ Electricity (EIA):")
        elec_prices = refresh_electricity()

    print("\n💾 Applying to city files...")
    apply_updates(grocery_data, rent_lookup, gas_prices, elec_prices)

    print(f"\n✅ Done! Run 'npm run build' then deploy.")
    print(f"   Gas national: ${gas_prices.get('NATIONAL', 'N/A')}")
    if elec_prices:
        print(f"   Electricity national avg: {elec_prices.get('NATIONAL', 'N/A')}¢/kWh")

if __name__ == '__main__':
    main()
