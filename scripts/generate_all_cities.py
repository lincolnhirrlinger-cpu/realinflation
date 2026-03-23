#!/usr/bin/env python3
"""
Generate realistic JSON data files for US state capitals + major metros.
Writes each city to public/data/{slug}.json and updates public/data/cities.json.
"""

import json
import os
import random
from pathlib import Path

# Seed for reproducibility
random.seed(42)

# Output directory
DATA_DIR = Path(__file__).parent.parent / "public" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# ─── Regional baselines (2026 values) ────────────────────────────────────────

REGIONS = {
    "Pacific": {
        "gas": 4.80, "diesel_mult": 1.12,
        "rent_1br": 2200, "rent_all_mult": 1.10, "rent_nat": 1900,
        "electricity": 0.26, "nat_gas_therm": 1.45, "internet": 75,
        "car_insurance": 185, "used_car": 28000,
        "fast_food": 16.50, "casual": 32.00, "coffee": 7.50,
        "doctor": 220, "dental": 175,
        "haircut": 32, "gym": 55, "movie": 18,
        "median_home": 750000,
    },
    "Mountain": {
        "gas": 3.90, "diesel_mult": 1.10,
        "rent_1br": 1450, "rent_all_mult": 1.08, "rent_nat": 1900,
        "electricity": 0.14, "nat_gas_therm": 1.10, "internet": 65,
        "car_insurance": 145, "used_car": 24000,
        "fast_food": 13.50, "casual": 26.00, "coffee": 6.50,
        "doctor": 180, "dental": 145,
        "haircut": 24, "gym": 42, "movie": 15,
        "median_home": 420000,
    },
    "West South Central": {
        "gas": 3.10, "diesel_mult": 1.09,
        "rent_1br": 1150, "rent_all_mult": 1.07, "rent_nat": 1900,
        "electricity": 0.12, "nat_gas_therm": 0.95, "internet": 60,
        "car_insurance": 165, "used_car": 22000,
        "fast_food": 12.00, "casual": 23.00, "coffee": 5.80,
        "doctor": 160, "dental": 130,
        "haircut": 20, "gym": 38, "movie": 14,
        "median_home": 280000,
    },
    "East South Central": {
        "gas": 3.00, "diesel_mult": 1.09,
        "rent_1br": 950, "rent_all_mult": 1.06, "rent_nat": 1900,
        "electricity": 0.11, "nat_gas_therm": 0.90, "internet": 60,
        "car_insurance": 155, "used_car": 21000,
        "fast_food": 11.50, "casual": 21.00, "coffee": 5.50,
        "doctor": 150, "dental": 120,
        "haircut": 18, "gym": 35, "movie": 13,
        "median_home": 230000,
    },
    "South Atlantic": {
        "gas": 3.20, "diesel_mult": 1.10,
        "rent_1br": 1350, "rent_all_mult": 1.08, "rent_nat": 1900,
        "electricity": 0.13, "nat_gas_therm": 1.00, "internet": 65,
        "car_insurance": 160, "used_car": 23000,
        "fast_food": 13.00, "casual": 25.00, "coffee": 6.20,
        "doctor": 175, "dental": 140,
        "haircut": 22, "gym": 40, "movie": 15,
        "median_home": 340000,
    },
    "Midwest": {
        "gas": 3.30, "diesel_mult": 1.10,
        "rent_1br": 1100, "rent_all_mult": 1.07, "rent_nat": 1900,
        "electricity": 0.14, "nat_gas_therm": 1.05, "internet": 62,
        "car_insurance": 140, "used_car": 22000,
        "fast_food": 12.50, "casual": 23.00, "coffee": 6.00,
        "doctor": 170, "dental": 135,
        "haircut": 20, "gym": 38, "movie": 14,
        "median_home": 250000,
    },
    "Northeast": {
        "gas": 3.60, "diesel_mult": 1.11,
        "rent_1br": 1900, "rent_all_mult": 1.09, "rent_nat": 1900,
        "electricity": 0.22, "nat_gas_therm": 1.30, "internet": 70,
        "car_insurance": 175, "used_car": 26000,
        "fast_food": 15.00, "casual": 30.00, "coffee": 7.00,
        "doctor": 210, "dental": 165,
        "haircut": 28, "gym": 50, "movie": 17,
        "median_home": 480000,
    },
}

# ─── State → region mapping ───────────────────────────────────────────────────

STATE_REGION = {
    "AK": "Pacific", "HI": "Pacific", "CA": "Pacific", "WA": "Pacific", "OR": "Pacific",
    "CO": "Mountain", "UT": "Mountain", "ID": "Mountain", "MT": "Mountain",
    "WY": "Mountain", "NV": "Mountain", "AZ": "Mountain", "NM": "Mountain",
    "TX": "West South Central", "OK": "West South Central",
    "AR": "West South Central", "LA": "West South Central",
    "MS": "East South Central", "AL": "East South Central",
    "TN": "East South Central", "KY": "East South Central",
    "FL": "South Atlantic", "GA": "South Atlantic", "SC": "South Atlantic",
    "NC": "South Atlantic", "VA": "South Atlantic", "WV": "South Atlantic",
    "MD": "South Atlantic", "DE": "South Atlantic", "DC": "South Atlantic",
    "MN": "Midwest", "WI": "Midwest", "MI": "Midwest", "OH": "Midwest",
    "IN": "Midwest", "IL": "Midwest", "IA": "Midwest", "MO": "Midwest",
    "ND": "Midwest", "SD": "Midwest", "NE": "Midwest", "KS": "Midwest",
    "NY": "Northeast", "PA": "Northeast", "NJ": "Northeast", "CT": "Northeast",
    "MA": "Northeast", "RI": "Northeast", "VT": "Northeast",
    "NH": "Northeast", "ME": "Northeast",
}

STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
}

# ─── City list ────────────────────────────────────────────────────────────────
# (city_name, state_abbr, slug, population, col_index)

CITIES = [
    # AZ
    ("Phoenix",         "AZ", "phoenix-az",          1608000, 100),
    ("Tucson",          "AZ", "tucson-az",             545000,  85),
    # AR
    ("Little Rock",     "AR", "little-rock-ar",        202000,  72),
    ("Fort Smith",      "AR", "fort-smith-ar",         89000,   65),
    # CA
    ("Sacramento",      "CA", "sacramento-ca",         524000, 130),
    ("Los Angeles",     "CA", "los-angeles-ca",       3980000, 160),
    # CO
    ("Denver",          "CO", "denver-co",             715000, 118),
    ("Colorado Springs","CO", "colorado-springs-co",   478000, 100),
    # CT
    ("Hartford",        "CT", "hartford-ct",           122000, 120),
    ("Bridgeport",      "CT", "bridgeport-ct",         148000, 125),
    # DE
    ("Dover",           "DE", "dover-de",               38000,  90),
    ("Wilmington",      "DE", "wilmington-de",          71000, 105),
    # FL
    ("Tallahassee",     "FL", "tallahassee-fl",        196000,  88),
    ("Miami",           "FL", "miami-fl",              442000, 130),
    # GA
    ("Atlanta",         "GA", "atlanta-ga",            498000, 110),
    ("Savannah",        "GA", "savannah-ga",           147000,  88),
    # HI
    ("Honolulu",        "HI", "honolulu-hi",           345000, 175),
    ("Hilo",            "HI", "hilo-hi",                45000, 155),
    # ID
    ("Boise",           "ID", "boise-id",              240000, 102),
    ("Idaho Falls",     "ID", "idaho-falls-id",         66000,  84),
    # IL
    ("Springfield",     "IL", "springfield-il",        115000,  82),
    ("Chicago",         "IL", "chicago-il",           2696000, 120),
    # IN
    ("Indianapolis",    "IN", "indianapolis-in",       872000,  85),
    ("Fort Wayne",      "IN", "fort-wayne-in",         265000,  78),
    # IA
    ("Des Moines",      "IA", "des-moines-ia",         214000,  84),
    ("Cedar Rapids",    "IA", "cedar-rapids-ia",       133000,  80),
    # KS
    ("Topeka",          "KS", "topeka-ks",              126000,  75),
    ("Wichita",         "KS", "wichita-ks",             390000,  80),
    # KY
    ("Frankfort",       "KY", "frankfort-ky",           27000,  72),
    ("Louisville",      "KY", "louisville-ky",          633000,  82),
    # LA
    ("Baton Rouge",     "LA", "baton-rouge-la",         220000,  82),
    ("New Orleans",     "LA", "new-orleans-la",         383000,  90),
    # ME
    ("Augusta",         "ME", "augusta-me",              18000,  88),
    ("Portland",        "ME", "portland-me",             68000, 105),
    # MD
    ("Annapolis",       "MD", "annapolis-md",            40000, 120),
    ("Baltimore",       "MD", "baltimore-md",            585000, 108),
    # MA
    ("Boston",          "MA", "boston-ma",              675000, 155),
    ("Worcester",       "MA", "worcester-ma",            206000, 118),
    # MI
    ("Lansing",         "MI", "lansing-mi",              112000,  80),
    ("Detroit",         "MI", "detroit-mi",              640000,  82),
    # MN
    ("Saint Paul",      "MN", "saint-paul-mn",           308000, 100),
    ("Minneapolis",     "MN", "minneapolis-mn",          429000, 108),
    # MS
    ("Jackson",         "MS", "jackson-ms",              153000,  65),
    ("Biloxi",          "MS", "biloxi-ms",                44000,  70),
    # MO
    ("Jefferson City",  "MO", "jefferson-city-mo",        43000,  72),
    ("Kansas City",     "MO", "kansas-city-mo",           495000,  85),
    # MT
    ("Helena",          "MT", "helena-mt",                32000,  85),
    ("Billings",        "MT", "billings-mt",             113000,  88),
    # NE
    ("Lincoln",         "NE", "lincoln-ne",              289000,  78),
    ("Omaha",           "NE", "omaha-ne",                478000,  82),
    # NV
    ("Carson City",     "NV", "carson-city-nv",           55000,  92),
    ("Las Vegas",       "NV", "las-vegas-nv",           641000,  98),
    # NH
    ("Concord",         "NH", "concord-nh",               44000, 108),
    ("Manchester",      "NH", "manchester-nh",            115000, 112),
    # NJ
    ("Trenton",         "NJ", "trenton-nj",               90000, 118),
    ("Newark",          "NJ", "newark-nj",               311000, 125),
    # NM
    ("Santa Fe",        "NM", "santa-fe-nm",              84000,  95),
    ("Albuquerque",     "NM", "albuquerque-nm",           564000,  85),
    # NY
    ("Albany",          "NY", "albany-ny",               100000, 108),
    ("New York",        "NY", "new-york-ny",            8336000, 170),
    # NC
    ("Raleigh",         "NC", "raleigh-nc",              467000, 100),
    ("Charlotte",       "NC", "charlotte-nc",            874000, 102),
    # ND
    ("Bismarck",        "ND", "bismarck-nd",              74000,  75),
    ("Fargo",           "ND", "fargo-nd",                125000,  80),
    # OH
    ("Columbus",        "OH", "columbus-oh",             905000,  85),
    ("Cleveland",       "OH", "cleveland-oh",            383000,  78),
    # OK
    ("Oklahoma City",   "OK", "oklahoma-city-ok",        649000,  78),
    ("Tulsa",           "OK", "tulsa-ok",                413000,  75),
    # OR
    ("Salem",           "OR", "salem-or",                175000, 105),
    ("Portland",        "OR", "portland-or",             652000, 128),
    # PA
    ("Harrisburg",      "PA", "harrisburg-pa",            50000,  88),
    ("Philadelphia",    "PA", "philadelphia-pa",        1584000, 115),
    # RI
    ("Providence",      "RI", "providence-ri",           190000, 118),
    ("Cranston",        "RI", "cranston-ri",             82000, 112),
    # SC
    ("Columbia",        "SC", "columbia-sc",             133000,  82),
    ("Charleston",      "SC", "charleston-sc",           150000,  98),
    # SD
    ("Pierre",          "SD", "pierre-sd",               14000,  70),
    ("Sioux Falls",     "SD", "sioux-falls-sd",          192000,  78),
    # TN
    ("Nashville",       "TN", "nashville-tn",            689000, 100),
    ("Memphis",         "TN", "memphis-tn",              633000,  78),
    # TX
    ("Austin",          "TX", "austin-tx",               961000, 108),
    ("Houston",         "TX", "houston-tx",             2304000,  95),
    # UT
    ("Salt Lake City",  "UT", "salt-lake-city-ut",       200000, 108),
    ("Provo",           "UT", "provo-ut",                115000,  95),
    # VT
    ("Montpelier",      "VT", "montpelier-vt",             8000,  98),
    ("Burlington",      "VT", "burlington-vt",            45000, 112),
    # VA
    ("Richmond",        "VA", "richmond-va",             226000, 102),
    ("Virginia Beach",  "VA", "virginia-beach-va",       459000,  98),
    # WA
    ("Olympia",         "WA", "olympia-wa",               53000, 118),
    ("Seattle",         "WA", "seattle-wa",              737000, 158),
    # WV
    ("Charleston",      "WV", "charleston-wv",            48000,  68),
    ("Huntington",      "WV", "huntington-wv",            46000,  65),
    # WI
    ("Madison",         "WI", "madison-wi",              259000, 100),
    ("Milwaukee",       "WI", "milwaukee-wi",            577000,  88),
    # WY
    ("Cheyenne",        "WY", "cheyenne-wy",              63000,  82),
    ("Casper",          "WY", "casper-wy",                58000,  78),
    # DC
    ("Washington",      "DC", "washington-dc",           689000, 155),
]

# ─── Grocery item definitions ─────────────────────────────────────────────────

GROCERY_ITEMS = [
    # (slug, name, unit, base_2022, growth_pattern)
    # growth_pattern: list of year-over-year multipliers [2022→2023, 2023→2024, 2024→2025, 2025→2026]
    ("eggs",           "Eggs (dozen)",          "dozen",   1.80, [1.18, 1.28, 1.48, 0.55], "Bird flu volatility"),
    ("milk",           "Milk (gallon)",          "gallon",  3.50, [1.07, 0.99, 1.03, 1.02], None),
    ("ground-beef",    "Ground Beef (lb)",       "lb",      3.95, [1.24, 1.05, 1.05, 1.02], None),
    ("bread",          "Bread (loaf)",           "loaf",    2.18, [1.35, 1.08, 1.06, 1.02], None),
    ("chicken",        "Chicken Breast (lb)",    "lb",      3.73, [1.06, 1.03, 1.01, 1.01], None),
    ("butter",         "Butter (lb)",            "lb",      4.20, [1.12, 1.05, 1.04, 1.03], None),
    ("bacon",          "Bacon (lb)",             "lb",      6.50, [1.08, 1.06, 1.04, 1.03], None),
    ("cheddar-cheese", "Cheddar Cheese (lb)",    "lb",      5.80, [1.10, 1.04, 1.03, 1.02], None),
    ("pasta",          "Pasta (lb)",             "lb",      1.50, [1.22, 1.05, 1.03, 1.01], None),
    ("rice",           "Rice (5 lb)",            "5 lb bag",4.20, [1.15, 1.04, 1.02, 1.02], None),
    ("coffee",         "Coffee (12 oz)",         "12 oz",   8.50, [1.20, 1.08, 1.05, 1.03], None),
    ("orange-juice",   "Orange Juice (64 oz)",   "64 oz",   3.80, [1.18, 1.10, 1.06, 1.04], "Citrus shortage"),
    ("potatoes",       "Potatoes (5 lb)",        "5 lb bag",4.00, [1.06, 1.04, 1.03, 1.02], None),
    ("apples",         "Apples (3 lb)",          "3 lb bag",4.50, [1.05, 1.04, 1.03, 1.02], None),
    ("tomatoes",       "Tomatoes (lb)",          "lb",      2.20, [1.12, 1.06, 1.05, 1.03], None),
    ("lettuce",        "Lettuce (head)",         "head",    1.80, [1.10, 1.08, 1.05, 1.03], None),
    ("cooking-oil",    "Cooking Oil (48 oz)",    "48 oz",   5.50, [1.25, 1.08, 1.04, 1.02], None),
    ("yogurt",         "Yogurt (32 oz)",         "32 oz",   4.20, [1.08, 1.05, 1.04, 1.02], None),
    ("cereal",         "Cereal (family size)",   "box",     4.80, [1.15, 1.07, 1.04, 1.02], None),
    ("frozen-pizza",   "Frozen Pizza",           "each",    6.20, [1.20, 1.08, 1.06, 1.03], None),
]

# ─── Helper functions ─────────────────────────────────────────────────────────

def jitter(val: float, pct: float = 0.05) -> float:
    """Add ±pct random variation."""
    return round(val * (1 + random.uniform(-pct, pct)), 2)

def col_factor(col_index: int, base: int = 100) -> float:
    """Scale a price by COL index relative to base."""
    return col_index / base

def r(val: float, places: int = 2) -> float:
    return round(val, places)

def gas_history(base_current: float) -> list:
    # Prices: spike in 2022, moderate 2023-2025, up in 2026
    h2022 = r(base_current * 1.10 + random.uniform(-0.15, 0.15))
    h2023 = r(base_current * 0.93 + random.uniform(-0.10, 0.10))
    h2024 = r(base_current * 0.88 + random.uniform(-0.10, 0.10))
    h2025 = r(base_current * 0.80 + random.uniform(-0.10, 0.10))
    nat_base = 3.45
    return [
        {"date": "2022-03", "price": h2022, "national": r(nat_base * 1.24)},
        {"date": "2023-03", "price": h2023, "national": r(nat_base * 0.99)},
        {"date": "2024-03", "price": h2024, "national": r(nat_base * 1.00)},
        {"date": "2025-03", "price": h2025, "national": r(nat_base * 0.87)},
        {"date": "2026-03", "price": base_current, "national": 3.45},
    ]

def rent_history(base_1br: float) -> list:
    all_mult = 1.08
    h2022_1 = r(base_1br * 0.78)
    h2023_1 = r(base_1br * 0.82)
    h2024_1 = r(base_1br * 0.88)
    h2025_1 = r(base_1br * 0.95)
    return [
        {"date": "2022", "avg": r(h2022_1 * all_mult), "onebed": h2022_1, "national": 1750},
        {"date": "2023", "avg": r(h2023_1 * all_mult), "onebed": h2023_1, "national": 1780},
        {"date": "2024", "avg": r(h2024_1 * all_mult), "onebed": h2024_1, "national": 1820},
        {"date": "2025", "avg": r(h2025_1 * all_mult), "onebed": h2025_1, "national": 1870},
        {"date": "2026", "avg": r(base_1br * all_mult), "onebed": base_1br, "national": 1900},
    ]

def build_groceries(col_index: int, region: str) -> dict:
    items = []
    for slug, name, unit, base_2022, growth, note in GROCERY_ITEMS:
        # Apply COL scaling with a mild factor (groceries vary less than rent)
        col_scale = 0.6 + 0.4 * col_factor(col_index)
        p2022 = r(base_2022 * col_scale * jitter(1.0, 0.04))
        prices = [p2022]
        for mult in growth:
            prices.append(r(prices[-1] * mult * jitter(1.0, 0.02)))
        current = prices[-1]
        change = r((current - p2022) / p2022, 3)
        history = [
            {"date": str(y), "price": prices[i]}
            for i, y in enumerate([2022, 2023, 2024, 2025, 2026])
        ]
        item = {
            "name": name, "slug": slug, "unit": unit,
            "current": current, "history": history,
            "change_from_2022": change,
        }
        if note:
            item["note"] = note
        items.append(item)

    return {
        "items": items,
        "inflation_rate": {
            "current_yoy": r(random.uniform(2.0, 3.5)),
            "history": [
                {"year": "2022", "rate": r(random.uniform(10.0, 13.0))},
                {"year": "2023", "rate": r(random.uniform(4.0, 6.5))},
                {"year": "2024", "rate": r(random.uniform(0.8, 2.5))},
                {"year": "2025", "rate": r(random.uniform(1.8, 3.2))},
                {"year": "2026", "rate": r(random.uniform(2.0, 3.5))},
            ],
        },
    }

def build_city(city_name: str, state_abbr: str, slug: str, population: int, col_index: int) -> dict:
    region = STATE_REGION[state_abbr]
    state_name = STATE_NAMES[state_abbr]
    rb = REGIONS[region]

    # COL scaling factor (centered at 100)
    cf = col_factor(col_index)

    # Gas
    gas_cur = r(rb["gas"] * (0.85 + 0.3 * cf) * jitter(1.0, 0.03))
    diesel_cur = r(gas_cur * rb["diesel_mult"] * jitter(1.0, 0.02))
    nat_gas_cur = 3.45

    # Rent
    rent_1br = r(rb["rent_1br"] * cf * jitter(1.0, 0.06))
    rent_2br = r(rent_1br * random.uniform(1.22, 1.30))
    rent_3br = r(rent_1br * random.uniform(1.55, 1.70))
    rent_all = r(rent_1br * rb["rent_all_mult"])
    median_home = r(rb["median_home"] * cf * jitter(1.0, 0.10))

    # Utilities
    elec = r(rb["electricity"] * jitter(1.0, 0.05))
    nat_gas_therm = r(rb["nat_gas_therm"] * jitter(1.0, 0.05))
    internet = r(rb["internet"] * jitter(1.0, 0.08))
    phone = r(random.uniform(75, 95))

    # Transportation
    car_ins = r(rb["car_insurance"] * cf * jitter(1.0, 0.10))
    used_car = r(rb["used_car"] * cf * jitter(1.0, 0.08))
    gas_monthly = r(gas_cur * random.uniform(38, 55))  # ~40-55 gallons/mo

    # Dining
    fast_food = r(rb["fast_food"] * cf * jitter(1.0, 0.06))
    casual = r(rb["casual"] * cf * jitter(1.0, 0.06))
    coffee = r(rb["coffee"] * cf * jitter(1.0, 0.05))
    monthly_spend = r((fast_food * 8 + casual * 4) * random.uniform(1.8, 2.2))
    rest_inflation = r(random.uniform(3.0, 5.5))

    # Healthcare
    doctor = r(rb["doctor"] * cf * jitter(1.0, 0.08))
    prescription = r(random.uniform(12, 22))
    dental = r(rb["dental"] * cf * jitter(1.0, 0.08))

    # Personal
    haircut = r(rb["haircut"] * cf * jitter(1.0, 0.10))
    gym = r(rb["gym"] * cf * jitter(1.0, 0.10))
    movie = r(rb["movie"] * cf * jitter(1.0, 0.06))

    return {
        "city": city_name,
        "state": state_name,
        "state_abbr": state_abbr,
        "slug": slug,
        "population": population,
        "region": region,
        "col_index": col_index,
        "last_updated": "2026-03-23",
        "gas": {
            "current": gas_cur,
            "diesel_current": diesel_cur,
            "national_current": nat_gas_cur,
            "history": gas_history(gas_cur),
        },
        "rent": {
            "avg_all": rent_all,
            "avg_1br": rent_1br,
            "avg_2br": rent_2br,
            "avg_3br": rent_3br,
            "national_avg": 1900,
            "median_home_price": median_home,
            "history": rent_history(rent_1br),
        },
        "groceries": build_groceries(col_index, region),
        "dining": {
            "fast_food_avg": fast_food,
            "casual_dining_avg": casual,
            "coffee_avg": coffee,
            "monthly_household_spend": monthly_spend,
            "restaurant_inflation_yoy": rest_inflation,
            "chains": [
                {"name": "McDonald's",  "price_2022": r(fast_food * 0.62), "price_current": fast_food},
                {"name": "Wendy's",     "price_2022": r(fast_food * 0.70), "price_current": r(fast_food * 1.08)},
                {"name": "Chipotle",    "price_2022": r(fast_food * 0.75), "price_current": r(fast_food * 1.12)},
                {"name": "Starbucks",   "price_2022": r(coffee * 0.72),    "price_current": coffee},
            ],
        },
        "utilities": {
            "electricity_kwh": elec,
            "natural_gas_therm": nat_gas_therm,
            "internet_monthly": internet,
            "phone_monthly": phone,
            "national_electricity": 0.16,
        },
        "transportation": {
            "car_insurance_monthly": car_ins,
            "used_car_avg": used_car,
            "gas_per_month_avg": gas_monthly,
        },
        "healthcare": {
            "doctor_visit": doctor,
            "prescription_generic": prescription,
            "dental_cleaning": dental,
        },
        "personal": {
            "haircut_mens": haircut,
            "gym_membership": gym,
            "movie_ticket": movie,
        },
    }

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    cities_meta = []
    generated = 0

    for city_name, state_abbr, slug, population, col_index in CITIES:
        region = STATE_REGION[state_abbr]
        state_name = STATE_NAMES[state_abbr]

        data = build_city(city_name, state_abbr, slug, population, col_index)
        out_path = DATA_DIR / f"{slug}.json"
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)

        cities_meta.append({
            "name": city_name,
            "state": state_name,
            "state_abbr": state_abbr,
            "slug": slug,
            "population": population,
            "region": region,
            "col_index": col_index,
        })
        generated += 1
        print(f"  ✓ {city_name}, {state_abbr} → {slug}.json")

    # Write cities.json
    cities_path = DATA_DIR / "cities.json"
    with open(cities_path, "w") as f:
        json.dump(cities_meta, f, indent=2)

    print(f"\nDone! Generated {generated} city files + cities.json")
    print(f"Output directory: {DATA_DIR}")

if __name__ == "__main__":
    main()
