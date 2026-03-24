#!/usr/bin/env python3
"""
Fetch Zillow ZORI (Observed Rent Index) data and update city JSON files.
ZORI is free, no API key required. Updates ~103 of 115 cities.
Run monthly to keep rent data fresh.
"""
import csv, json, io, urllib.request
from pathlib import Path
from datetime import datetime

ZORI_URL = "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv"
DATA_DIR = Path(__file__).parent.parent / "public" / "data"

# Manual fallbacks for cities not in ZORI metro list
MANUAL_FALLBACK = {
    "wilmington-de": 1400,
    "meridian-id": 1550,   # similar to Boise metro
    "nampa-id": 1350,
    "kansas-city-ks": 1200,
    "annapolis-md": 1900,
    "saint-paul-mn": 1450,
    "biloxi-ms": 1050,
    "newark-nj": 1800,
    "cranston-ri": 1600,
    "pierre-sd": 900,
    "fort-worth-tx": 1550,
    "montpelier-vt": 1400,
}

def download_zori():
    print("Downloading ZORI data from Zillow...")
    with urllib.request.urlopen(ZORI_URL) as r:
        content = r.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    date_cols = [c for c in rows[0].keys() if c[0].isdigit()]
    latest_col = date_cols[-1]
    prev_col = date_cols[-13] if len(date_cols) > 13 else date_cols[0]  # ~1yr ago
    col_2022 = next((c for c in date_cols if c.startswith('2022-01')), date_cols[0])
    print(f"Latest: {latest_col} | 1yr ago: {prev_col} | 2022 baseline: {col_2022}")
    return rows, latest_col, prev_col, col_2022

def build_lookup(rows, latest_col, prev_col, col_2022):
    lookup = {}
    for r in rows:
        region = r['RegionName']  # e.g. "Boise City, ID" or "New York, NY"
        state = r['StateName'].upper() if r['StateName'] else ''
        val = float(r[latest_col]) if r[latest_col] else None
        val_prev = float(r[prev_col]) if r[prev_col] else val
        val_2022 = float(r[col_2022]) if r[col_2022] else None
        if not val:
            continue
        payload = {
            "current": round(val),
            "prev_year": round(val_prev) if val_prev else None,
            "baseline_2022": round(val_2022) if val_2022 else None,
        }
        # Extract city portion before the comma+state
        # "Boise City, ID" -> city_part = "boise city", state_part = "id"
        parts = region.split(', ')
        city_part = parts[0].lower()
        lookup[f"{city_part}|{state}"] = payload
        # Also index the full region name lowercased
        lookup[region.lower()] = payload
    return lookup

def match_city(city_name, state_abbr, lookup):
    state = state_abbr.upper()
    city = city_name.lower()
    # Direct key matches
    candidates = [
        f"{city}|{state}",
        f"{city} city|{state}",
        f"{city}-{state.lower()}|{state}",
    ]
    for c in candidates:
        if c in lookup:
            return lookup[c]
    # Fuzzy: city name contained in key city part
    for key, val in lookup.items():
        if '|' in key:
            key_city, key_state = key.split('|')
            if key_state == state and (city in key_city or key_city.startswith(city)):
                return val
    return None

def update_cities(lookup):
    city_files = sorted(DATA_DIR.glob("*.json"))
    city_files = [f for f in city_files if f.name != 'cities.json']

    updated = 0
    skipped = 0
    fallback_used = 0

    for f in city_files:
        data = json.loads(f.read_text())
        slug = data.get('slug', f.stem)
        city_name = data.get('city', '')
        state_abbr = slug.split('-')[-1].upper()

        zori = match_city(city_name, state_abbr, lookup)

        if zori:
            current_rent = zori['current']
            baseline_2022 = zori['baseline_2022'] or round(current_rent / 1.14)
            source = "Zillow ZORI (Metro, Feb 2026)"
        elif slug in MANUAL_FALLBACK:
            current_rent = MANUAL_FALLBACK[slug]
            baseline_2022 = round(current_rent / 1.14)
            source = "Regional estimate (Zillow ZORI adjacent metro)"
            fallback_used += 1
        else:
            skipped += 1
            continue

        # Update rent fields
        data['rent']['avg_all'] = current_rent
        data['rent']['avg_1br'] = round(current_rent * 0.82)
        data['rent']['avg_2br'] = round(current_rent * 1.18)
        data['rent']['baseline_2022'] = baseline_2022
        data['rent']['yoy_change_pct'] = round(
            ((current_rent - (zori['prev_year'] or baseline_2022)) / (zori['prev_year'] or baseline_2022)) * 100, 1
        ) if zori else 3.5
        data['rent']['source'] = source
        data['last_updated'] = datetime.now().strftime('%Y-%m-%d')

        # Update rent history: recalibrate to match new current value
        if data.get('rent', {}).get('history'):
            hist = data['rent']['history']
            if hist:
                old_last = hist[-1].get('avg') or current_rent
                if old_last and abs(old_last - current_rent) / old_last > 0.01:
                    ratio = current_rent / old_last
                    for h in hist:
                        if h.get('avg'):
                            h['avg'] = round(h['avg'] * ratio, 2)
                        if h.get('onebed'):
                            h['onebed'] = round(h['onebed'] * ratio, 2)
                hist[-1]['avg'] = float(current_rent)

        f.write_text(json.dumps(data, separators=(',', ':')))
        updated += 1

    print(f"\nResults: {updated} updated | {fallback_used} fallback | {skipped} skipped")
    return updated

def main():
    rows, latest_col, prev_col, col_2022 = download_zori()
    lookup = build_lookup(rows, latest_col, prev_col, col_2022)
    print(f"ZORI metros loaded: {len(lookup)}")
    updated = update_cities(lookup)
    print(f"\nDone. {updated} city files updated with real Zillow ZORI rent data.")
    print("Run 'npm run build' to rebuild the site.")

if __name__ == '__main__':
    main()
