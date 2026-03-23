#!/usr/bin/env python3
"""
Fetch current gas prices from AAA via scrape-worker.
Updates gas.current in all city JSON files.
"""
import json, re, os, sys
from pathlib import Path
import requests

WORKER_URL = "http://127.0.0.1:8741/fetch"
WORKER_TOKEN = os.getenv("WORKER_TOKEN", "u7cM6fYyU0_BHjtOz0l1PqDgKtrSupW2451L935wZoQ")
DATA_DIR = Path(__file__).parent.parent / "public" / "data"

STATE_ABBR = {
    "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
    "Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
    "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS",
    "Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA",
    "Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT",
    "Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM",
    "New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK",
    "Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
    "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT",
    "Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
    "District of Columbia":"DC"
}

def fetch_html(url):
    r = requests.post(WORKER_URL, 
        json={"url": url, "mode": "http"},
        headers={"Authorization": f"Bearer {WORKER_TOKEN}"},
        timeout=30)
    return r.json().get("html", "")

def scrape_aaa_state_prices():
    """Returns dict: state_abbr -> regular_price"""
    html = fetch_html("https://gasprices.aaa.com/state-gas-price-averages/")
    prices = {}
    # Parse rows: state name + regular price
    rows = re.findall(
        r'state=([A-Z]{2})">\s*([\w\s]+?)\s*</a>.*?class="regular"[^>]*>\s*\$?([\d.]+)',
        html, re.DOTALL
    )
    for abbr, state_name, price in rows:
        try:
            prices[abbr.strip()] = float(price.strip())
        except ValueError:
            pass
    # Fallback: simpler pattern
    if not prices:
        rows2 = re.findall(r'Idaho.*?\$([\d.]+)', html[:5000])
        if rows2:
            print(f"Fallback: Idaho = {rows2[0]}")
    print(f"Fetched {len(prices)} state gas prices from AAA")
    return prices

def update_city_files(state_prices):
    updated = 0
    cities_json = DATA_DIR / "cities.json"
    cities = json.loads(cities_json.read_text())
    
    for city_meta in cities:
        abbr = city_meta.get("state_abbr", "")
        slug = city_meta.get("slug", "")
        price = state_prices.get(abbr)
        if not price:
            continue
        city_file = DATA_DIR / f"{slug}.json"
        if not city_file.exists():
            continue
        city_data = json.loads(city_file.read_text())
        old = city_data.get("gas", {}).get("current", 0)
        city_data["gas"]["current"] = price
        city_file.write_text(json.dumps(city_data, indent=2))
        print(f"  {city_meta['name']}, {abbr}: ${old:.3f} → ${price:.3f}")
        updated += 1
    
    print(f"\nUpdated {updated} city files with real AAA gas prices")
    return updated

if __name__ == "__main__":
    print("Fetching gas prices from AAA...")
    prices = scrape_aaa_state_prices()
    if prices:
        print("\nSample prices:")
        for s in ["ID", "CA", "TX", "NY", "FL", "WA"]:
            if s in prices:
                print(f"  {s}: ${prices[s]:.3f}")
        update_city_files(prices)
    else:
        print("ERROR: No prices fetched")
        sys.exit(1)
