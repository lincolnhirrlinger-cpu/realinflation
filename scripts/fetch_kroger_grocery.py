#!/usr/bin/env python3
"""
Kroger Products API integration for RealInflation.
Fetches real store prices for grocery items by city using Kroger's free public API.

Covers: Kroger, Fred Meyer, King Soopers, Smith's, Ralphs, Fry's, Harris Teeter,
        Dillons, Mariano's, Pick 'n Save, and more (~2,800 US stores).

Setup:
  1. Register at https://developer.kroger.com/manage/apps/registration
  2. Create an app, get client_id + client_secret
  3. Set env vars: KROGER_CLIENT_ID, KROGER_CLIENT_SECRET
  OR pass --client-id / --client-secret flags

Usage:
  python3 scripts/fetch_kroger_grocery.py
  python3 scripts/fetch_kroger_grocery.py --city boise-id
  python3 scripts/fetch_kroger_grocery.py --dry-run
"""
import os, json, sys, time, base64, urllib.request, urllib.parse
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "public" / "data"
TODAY = date.today().isoformat()

# Items to search + UPCs to prefer (avoids brand noise)
GROCERY_ITEMS = [
    {
        "slug": "eggs",
        "name": "Eggs (dozen)",
        "query": "eggs grade a large",
        "terms": ["egg", "eggs"],
        "unit_filter": "dozen",
        "max_price": 8.00,
    },
    {
        "slug": "milk",
        "name": "Milk (gallon)",
        "query": "whole milk gallon",
        "terms": ["whole milk gallon", "2% milk gallon", "vitamin d milk"],
        "unit_filter": "gallon",
        "max_price": 7.00,
    },
    {
        "slug": "bread",
        "name": "Bread (loaf)",
        "query": "white bread loaf sandwich",
        "terms": ["white bread", "sandwich bread", "wheat bread loaf"],
        "unit_filter": None,
        "max_price": 5.00,
    },
    {
        "slug": "ground_beef",
        "name": "Ground Beef (lb)",
        "query": "ground beef 80 20 1 lb",
        "terms": ["ground beef", "ground chuck", "hamburger meat"],
        "unit_filter": None,
        "max_price": 10.00,
    },
    {
        "slug": "chicken",
        "name": "Chicken Breast (lb)",
        "query": "boneless skinless chicken breast",
        "terms": ["chicken breast", "boneless skinless chicken"],
        "unit_filter": None,
        "max_price": 8.00,
    },
    {
        "slug": "butter",
        "name": "Butter (lb)",
        "query": "butter 1 pound salted",
        "terms": ["butter", "salted butter", "unsalted butter"],
        "unit_filter": None,
        "max_price": 8.00,
    },
]

# City → nearest Kroger-family store zip code
# Kroger uses zip to find nearest store; we pick a central zip per city
CITY_ZIPS = {
    "boise-id":        "83702",
    "meridian-id":     "83642",
    "nampa-id":        "83651",
    "twin-falls-id":   "83301",
    "idaho-falls-id":  "83401",
    "pocatello-id":    "83201",
    "rexburg-id":      "83440",
    "new-york-ny":     "10001",
    "los-angeles-ca":  "90001",
    "chicago-il":      "60601",
    "houston-tx":      "77001",
    "phoenix-az":      "85001",
    "philadelphia-pa": "19101",
    "san-antonio-tx":  "78201",
    "san-diego-ca":    "92101",
    "dallas-tx":       "75201",
    "san-jose-ca":     "95101",
    "austin-tx":       "78701",
    "jacksonville-fl": "32201",
    "fort-worth-tx":   "76101",
    "columbus-oh":     "43201",
    "charlotte-nc":    "28201",
    "indianapolis-in": "46201",
    "san-francisco-ca":"94101",
    "seattle-wa":      "98101",
    "denver-co":       "80201",
    "nashville-tn":    "37201",
    "oklahoma-city-ok":"73101",
    "washington-dc":   "20001",
    "el-paso-tx":      "79901",
    "boston-ma":       "02101",
    "portland-or":     "97201",
    "las-vegas-nv":    "89101",
    "memphis-tn":      "38101",
    "louisville-ky":   "40201",
    "baltimore-md":    "21201",
    "milwaukee-wi":    "53201",
    "albuquerque-nm":  "87101",
    "tucson-az":       "85701",
    "fresno-ca":       "93701",
    "sacramento-ca":   "95801",
    "mesa-az":         "85201",
    "kansas-city-mo":  "64101",
    "atlanta-ga":      "30301",
    "omaha-ne":        "68101",
    "colorado-springs-co": "80901",
    "raleigh-nc":      "27601",
    "miami-fl":        "33101",
    "long-beach-ca":   "90801",
    "virginia-beach-va":"23451",
    "minneapolis-mn":  "55401",
    "tampa-fl":        "33601",
    "new-orleans-la":  "70101",
    "cleveland-oh":    "44101",
    "pittsburgh-pa":   "15201",
    "cincinnati-oh":   "45201",
    "detroit-mi":      "48201",
    "st-louis-mo":     "63101",
    "salt-lake-city-ut":"84101",
}


class KrogerClient:
    BASE = "https://api.kroger.com/v1"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.token_expires = 0

    def _get_token(self):
        """OAuth2 client_credentials flow"""
        creds = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
        req = urllib.request.Request(
            f"{self.BASE}/connect/oauth2/token",
            data=b"grant_type=client_credentials&scope=product.compact",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {creds}",
            }
        )
        resp = urllib.request.urlopen(req, timeout=15)
        d = json.loads(resp.read())
        self.token = d["access_token"]
        self.token_expires = time.time() + d.get("expires_in", 1800) - 60
        return self.token

    def _token(self):
        if not self.token or time.time() > self.token_expires:
            self._get_token()
        return self.token

    def find_store(self, zip_code: str) -> str | None:
        """Find nearest Kroger location ID for a zip"""
        params = urllib.parse.urlencode({
            "filter.zipCode.near": zip_code,
            "filter.limit": "1",
            "filter.radiusInMiles": "25",
        })
        req = urllib.request.Request(
            f"{self.BASE}/locations?{params}",
            headers={"Authorization": f"Bearer {self._token()}"}
        )
        try:
            resp = urllib.request.urlopen(req, timeout=15)
            d = json.loads(resp.read())
            locs = d.get("data", [])
            if locs:
                loc = locs[0]
                chain = loc.get("chain", "")
                name = loc.get("name", "")
                return loc["locationId"], f"{name} ({chain})"
        except Exception as e:
            print(f"      Store lookup error: {e}")
        return None, None

    def search_product(self, query: str, location_id: str, limit: int = 10, retries: int = 3) -> list:
        """Search products at a specific store location (with retry/backoff)"""
        params = urllib.parse.urlencode({
            "filter.term": query,
            "filter.locationId": location_id,
            "filter.limit": str(limit),
            "filter.fulfillment": "ais",  # available in store
        })
        for attempt in range(retries):
            req = urllib.request.Request(
                f"{self.BASE}/products?{params}",
                headers={"Authorization": f"Bearer {self._token()}"}
            )
            try:
                resp = urllib.request.urlopen(req, timeout=15)
                d = json.loads(resp.read())
                return d.get("data", [])
            except urllib.error.HTTPError as e:
                if e.code == 503 and attempt < retries - 1:
                    wait = 2 ** (attempt + 1)
                    time.sleep(wait)
                    continue
                print(f"      Product search error: HTTP {e.code}")
                return []
            except Exception as e:
                print(f"      Product search error: {e}")
                return []
        return []

    def get_best_price(self, item_def: dict, location_id: str) -> float | None:
        """Find the best matching price for an item at a store"""
        products = self.search_product(item_def["query"], location_id)
        if not products:
            return None

        candidates = []
        for p in products:
            desc = p.get("description", "").lower()
            items_data = p.get("items", [])

            # Check name matches
            matched = any(t in desc for t in item_def["terms"])
            if not matched:
                continue

            for it in items_data:
                price_info = it.get("price", {})
                regular = price_info.get("regular")
                promo = price_info.get("promo")
                price = promo if promo and promo > 0 else regular
                if price and 0.50 < price < item_def.get("max_price", 20):
                    size = it.get("size", "").lower()
                    candidates.append({
                        "price": price,
                        "desc": p.get("description", ""),
                        "size": size,
                    })

        if not candidates:
            return None

        # Prefer median price (avoids outliers)
        prices = sorted(c["price"] for c in candidates)
        mid = len(prices) // 2
        return round(prices[mid], 2)


def fetch_city_prices(client: KrogerClient, city_slug: str, zip_code: str, dry_run: bool = False) -> dict:
    """Fetch all grocery item prices for one city"""
    print(f"\n  📍 {city_slug} (zip {zip_code})")

    location_id, store_name = client.find_store(zip_code)
    if not location_id:
        print(f"     No Kroger-family store found within 25 miles")
        return {}

    print(f"     Store: {store_name} ({location_id})")

    if dry_run:
        return {"store": store_name, "location_id": location_id}

    prices = {"store": store_name, "location_id": location_id, "date": TODAY, "items": {}}
    for item in GROCERY_ITEMS:
        price = client.get_best_price(item, location_id)
        if price:
            prices["items"][item["slug"]] = {"price": price, "name": item["name"]}
            print(f"     {item['name']:25} ${price:.2f}")
        else:
            print(f"     {item['name']:25} not found")
        time.sleep(0.5)

    return prices


def update_city_file(slug: str, kroger_prices: dict):
    """Update city JSON with Kroger prices, keeping BLS as fallback"""
    f = DATA_DIR / f"{slug}.json"
    if not f.exists():
        return
    d = json.loads(f.read_text())

    if "kroger" not in d:
        d["kroger"] = {}

    d["kroger"] = {
        "store": kroger_prices.get("store"),
        "location_id": kroger_prices.get("location_id"),
        "date": kroger_prices.get("date"),
        "prices": kroger_prices.get("items", {}),
    }

    # Update grocery items with Kroger prices where available
    for item in d.get("groceries", {}).get("items", []):
        item_slug = item.get("slug")
        if item_slug and item_slug in kroger_prices.get("items", {}):
            kroger = kroger_prices["items"][item_slug]
            # Store Kroger price alongside BLS national
            item["kroger_price"] = kroger["price"]
            item["kroger_store"] = kroger_prices.get("store", "Kroger")
            item["kroger_date"] = kroger_prices.get("date")

    d["last_updated"] = TODAY
    f.write_text(json.dumps(d, separators=(",", ":")))


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    city_filter = None
    if "--city" in args:
        idx = args.index("--city")
        city_filter = args[idx + 1] if idx + 1 < len(args) else None

    client_id = os.environ.get("KROGER_CLIENT_ID") or next(
        (args[i+1] for i, a in enumerate(args) if a == "--client-id" and i+1 < len(args)), None
    )
    client_secret = os.environ.get("KROGER_CLIENT_SECRET") or next(
        (args[i+1] for i, a in enumerate(args) if a == "--client-secret" and i+1 < len(args)), None
    )

    if not client_id or not client_secret:
        print("❌ Missing Kroger API credentials.")
        print("   Set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET env vars,")
        print("   or pass --client-id / --client-secret flags.")
        print()
        print("   Register free at: https://developer.kroger.com/manage/apps/registration")
        sys.exit(1)

    client = KrogerClient(client_id, client_secret)

    print(f"\n🛒 Kroger Price Fetch — {TODAY}")
    print("=" * 50)

    if dry_run:
        print("DRY RUN — checking store coverage only\n")

    cities = {k: v for k, v in CITY_ZIPS.items()
              if not city_filter or k == city_filter}

    found = 0
    no_store = []

    for slug, zip_code in cities.items():
        try:
            prices = fetch_city_prices(client, slug, zip_code, dry_run)
            if prices.get("location_id"):
                found += 1
                if not dry_run and prices.get("items"):
                    update_city_file(slug, prices)
            else:
                no_store.append(slug)
            time.sleep(1.0)
        except Exception as e:
            print(f"  ERROR {slug}: {e}")

    print(f"\n✅ Done: {found}/{len(cities)} cities have a nearby Kroger-family store")
    if no_store:
        print(f"   No store: {', '.join(no_store)}")
    if not dry_run:
        print(f"\n   Run 'npm run build' and deploy to publish updated prices.")


if __name__ == "__main__":
    main()
