#!/usr/bin/env python3
"""
Generate 33 new city JSON files for realinflation.co
Also updates public/data/cities.json with new entries.
"""
import csv
import io
import json
import zipfile
import urllib.request
from pathlib import Path
from datetime import datetime

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "public" / "data"
ZIP_2024 = Path("/tmp/bls_2024_annual.zip")
ZIP_2019 = Path("/tmp/bls_2019_annual.zip")

# ── New city definitions ─────────────────────────────────────────────────────
NEW_CITIES = {
    "riverside-ca":     {"name": "Riverside",      "state": "California",     "state_abbr": "CA", "fips": "06065", "pop": 2360000, "region": "West"},
    "birmingham-al":    {"name": "Birmingham",     "state": "Alabama",        "state_abbr": "AL", "fips": "01073", "pop": 1119000, "region": "South"},
    "rochester-ny":     {"name": "Rochester",      "state": "New York",       "state_abbr": "NY", "fips": "36055", "pop": 1080000, "region": "Northeast"},
    "grand-rapids-mi":  {"name": "Grand Rapids",   "state": "Michigan",       "state_abbr": "MI", "fips": "26081", "pop": 1070000, "region": "Midwest"},
    "knoxville-tn":     {"name": "Knoxville",      "state": "Tennessee",      "state_abbr": "TN", "fips": "47093", "pop": 890000,  "region": "South"},
    "greenville-sc":    {"name": "Greenville",     "state": "South Carolina", "state_abbr": "SC", "fips": "45045", "pop": 920000,  "region": "South"},
    "mcallen-tx":       {"name": "McAllen",        "state": "Texas",          "state_abbr": "TX", "fips": "48215", "pop": 900000,  "region": "South"},
    "dayton-oh":        {"name": "Dayton",         "state": "Ohio",           "state_abbr": "OH", "fips": "39113", "pop": 810000,  "region": "Midwest"},
    "akron-oh":         {"name": "Akron",          "state": "Ohio",           "state_abbr": "OH", "fips": "39153", "pop": 700000,  "region": "Midwest"},
    "stockton-ca":      {"name": "Stockton",       "state": "California",     "state_abbr": "CA", "fips": "06077", "pop": 780000,  "region": "West"},
    "cape-coral-fl":    {"name": "Cape Coral",     "state": "Florida",        "state_abbr": "FL", "fips": "12071", "pop": 790000,  "region": "South"},
    "bakersfield-ca":   {"name": "Bakersfield",    "state": "California",     "state_abbr": "CA", "fips": "06029", "pop": 920000,  "region": "West"},
    "ogden-ut":         {"name": "Ogden",          "state": "Utah",           "state_abbr": "UT", "fips": "49057", "pop": 680000,  "region": "West"},
    "winston-salem-nc": {"name": "Winston-Salem",  "state": "North Carolina", "state_abbr": "NC", "fips": "37067", "pop": 680000,  "region": "South"},
    "deltona-fl":       {"name": "Deltona",        "state": "Florida",        "state_abbr": "FL", "fips": "12127", "pop": 680000,  "region": "South"},
    "lakeland-fl":      {"name": "Lakeland",       "state": "Florida",        "state_abbr": "FL", "fips": "12105", "pop": 770000,  "region": "South"},
    "north-port-fl":    {"name": "North Port",     "state": "Florida",        "state_abbr": "FL", "fips": "12115", "pop": 600000,  "region": "South"},
    "oxnard-ca":        {"name": "Oxnard",         "state": "California",     "state_abbr": "CA", "fips": "06111", "pop": 850000,  "region": "West"},
    "allentown-pa":     {"name": "Allentown",      "state": "Pennsylvania",   "state_abbr": "PA", "fips": "42077", "pop": 870000,  "region": "Northeast"},
    "poughkeepsie-ny":  {"name": "Poughkeepsie",   "state": "New York",       "state_abbr": "NY", "fips": "36027", "pop": 680000,  "region": "Northeast"},
    "new-haven-ct":     {"name": "New Haven",      "state": "Connecticut",    "state_abbr": "CT", "fips": "09170", "pop": 862000,  "region": "Northeast"},
    "chattanooga-tn":   {"name": "Chattanooga",    "state": "Tennessee",      "state_abbr": "TN", "fips": "47065", "pop": 580000,  "region": "South"},
    "modesto-ca":       {"name": "Modesto",        "state": "California",     "state_abbr": "CA", "fips": "06099", "pop": 560000,  "region": "West"},
    "syracuse-ny":      {"name": "Syracuse",       "state": "New York",       "state_abbr": "NY", "fips": "36067", "pop": 650000,  "region": "Northeast"},
    "scranton-pa":      {"name": "Scranton",       "state": "Pennsylvania",   "state_abbr": "PA", "fips": "42069", "pop": 560000,  "region": "Northeast"},
    "lancaster-pa":     {"name": "Lancaster",      "state": "Pennsylvania",   "state_abbr": "PA", "fips": "42071", "pop": 580000,  "region": "Northeast"},
    "youngstown-oh":    {"name": "Youngstown",     "state": "Ohio",           "state_abbr": "OH", "fips": "39099", "pop": 540000,  "region": "Midwest"},
    "killeen-tx":       {"name": "Killeen",        "state": "Texas",          "state_abbr": "TX", "fips": "48027", "pop": 470000,  "region": "South"},
    "fayetteville-nc":  {"name": "Fayetteville",   "state": "North Carolina", "state_abbr": "NC", "fips": "37051", "pop": 380000,  "region": "South"},
    "pensacola-fl":     {"name": "Pensacola",      "state": "Florida",        "state_abbr": "FL", "fips": "12033", "pop": 510000,  "region": "South"},
    "springfield-mo":   {"name": "Springfield",    "state": "Missouri",       "state_abbr": "MO", "fips": "29077", "pop": 470000,  "region": "Midwest"},
    "salinas-ca":       {"name": "Salinas",        "state": "California",     "state_abbr": "CA", "fips": "06053", "pop": 440000,  "region": "West"},
    "ann-arbor-mi":     {"name": "Ann Arbor",      "state": "Michigan",       "state_abbr": "MI", "fips": "26161", "pop": 370000,  "region": "Midwest"},
}

# State-level gas ratios (from existing city files / confirmed EIA)
STATE_GAS_RATIO = {
    "AL": 0.9103,  # STATE_GAS[AL]=3.62 / 3.977
    "CA": 1.4639,  # from LA file
    "CT": 0.9756,  # from Bridgeport file (3.88/3.977)
    "FL": 0.9857,  # from Jacksonville file
    "MI": 1.0075,  # from Detroit file
    "MO": 0.8647,  # from Jefferson City file
    "NC": 0.9469,  # from Charlotte file
    "NY": 0.9706,  # from Albany (3.86/3.977)
    "OH": 0.9625,  # from Cleveland file
    "PA": 0.9940,  # from Harrisburg file
    "SC": 0.9241,  # from Charleston file
    "TN": 0.9178,  # from Nashville file
    "TX": 0.9102,  # from Austin file
    "UT": 1.0108,  # from Provo file
}

# State gas current prices (from page.tsx STATE_GAS)
STATE_GAS_CURRENT = {
    "AL": 3.62, "CA": 5.79, "CT": 3.88, "FL": 3.93,
    "MI": 3.62, "MO": 3.32, "NC": 3.52, "NY": 3.86,
    "OH": 3.62, "PA": 3.99, "SC": 3.52, "TN": 3.52,
    "TX": 3.62, "UT": 3.85,
}

# Diesel multiplier (boise: 4.86 / 4.215 = 1.153)
DIESEL_MULT = 1.153

# COL indices by state+city size (estimated from site patterns)
COL_INDEX = {
    "riverside-ca":     118,
    "birmingham-al":    90,
    "rochester-ny":     96,
    "grand-rapids-mi":  98,
    "knoxville-tn":     92,
    "greenville-sc":    91,
    "mcallen-tx":       84,
    "dayton-oh":        88,
    "akron-oh":         90,
    "stockton-ca":      108,
    "cape-coral-fl":    98,
    "bakersfield-ca":   105,
    "ogden-ut":         98,
    "winston-salem-nc": 90,
    "deltona-fl":       93,
    "lakeland-fl":      91,
    "north-port-fl":    97,
    "oxnard-ca":        130,
    "allentown-pa":     96,
    "poughkeepsie-ny":  106,
    "new-haven-ct":     112,
    "chattanooga-tn":   90,
    "modesto-ca":       106,
    "syracuse-ny":      94,
    "scranton-pa":      90,
    "lancaster-pa":     93,
    "youngstown-oh":    82,
    "killeen-tx":       88,
    "fayetteville-nc":  86,
    "pensacola-fl":     92,
    "springfield-mo":   82,
    "salinas-ca":       128,
    "ann-arbor-mi":     108,
}

# State electricity rates (cents/kWh) from existing city files
STATE_ELEC = {
    "AL": 14.2, "CA": 30.29, "CT": 28.3, "FL": 15.92,
    "MI": 19.52, "MO": 11.8, "NC": 13.68, "NY": 28.37,
    "OH": 17.59, "PA": 20.19, "SC": 15.41, "TN": 13.1,
    "TX": 15.69, "UT": 12.88,
}

# State car insurance annual (Bankrate estimates from task)
STATE_INS = {
    "AL": 1754, "CA": 2810, "CT": 1845, "FL": 3183,
    "MI": 2691, "MO": 1821, "NC": 1392, "NY": 2877,
    "OH": 1243, "PA": 1572, "SC": 1783, "TN": 1662,
    "TX": 2142, "UT": 1547,
}

# Dining by state (from existing city file data)
STATE_DINING = {
    "AL": {"fast_food_avg": 11.5, "casual_dining_avg": 20, "coffee_avg": 4.9,
           "monthly_household_spend": 295, "restaurant_inflation_yoy": 5.1,
           "chains": [
               {"name": "McDonald's", "price_2022": 6.79, "price_current": 10.8},
               {"name": "Wendy's", "price_2022": 7.69, "price_current": 11.7},
               {"name": "Chipotle", "price_2022": 8.25, "price_current": 11.5},
               {"name": "Starbucks", "price_2022": 3.8, "price_current": 4.9},
           ]},
    "CA": {"fast_food_avg": 15, "casual_dining_avg": 48.13, "coffee_avg": 12,
           "monthly_household_spend": 540, "restaurant_inflation_yoy": 6.2,
           "chains": [
               {"name": "McDonald's", "price_2022": 8.99, "price_current": 14.5},
               {"name": "Wendy's", "price_2022": 9.99, "price_current": 15.5},
               {"name": "Chipotle", "price_2022": 10.99, "price_current": 16.5},
               {"name": "Starbucks", "price_2022": 5.5, "price_current": 12},
           ]},
    "CT": {"fast_food_avg": 16, "casual_dining_avg": 34, "coffee_avg": 8,
           "monthly_household_spend": 440, "restaurant_inflation_yoy": 5.5,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.99, "price_current": 13.5},
               {"name": "Wendy's", "price_2022": 8.99, "price_current": 14.5},
               {"name": "Chipotle", "price_2022": 9.5, "price_current": 14.8},
               {"name": "Starbucks", "price_2022": 4.8, "price_current": 8},
           ]},
    "FL": {"fast_food_avg": 13, "casual_dining_avg": 26, "coffee_avg": 5.8,
           "monthly_household_spend": 321, "restaurant_inflation_yoy": 5.2,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.5, "price_current": 12.5},
               {"name": "Wendy's", "price_2022": 8.0, "price_current": 13.0},
               {"name": "Chipotle", "price_2022": 8.99, "price_current": 13.5},
               {"name": "Starbucks", "price_2022": 4.2, "price_current": 5.8},
           ]},
    "MI": {"fast_food_avg": 10.5, "casual_dining_avg": 20.5, "coffee_avg": 5.1,
           "monthly_household_spend": 278, "restaurant_inflation_yoy": 5.0,
           "chains": [
               {"name": "McDonald's", "price_2022": 6.5, "price_current": 10.2},
               {"name": "Wendy's", "price_2022": 7.3, "price_current": 11.2},
               {"name": "Chipotle", "price_2022": 8.2, "price_current": 11.8},
               {"name": "Starbucks", "price_2022": 3.7, "price_current": 5.1},
           ]},
    "MO": {"fast_food_avg": 8.46, "casual_dining_avg": 16.56, "coffee_avg": 4.28,
           "monthly_household_spend": 240, "restaurant_inflation_yoy": 4.8,
           "chains": [
               {"name": "McDonald's", "price_2022": 5.99, "price_current": 8.8},
               {"name": "Wendy's", "price_2022": 6.89, "price_current": 9.7},
               {"name": "Chipotle", "price_2022": 7.5, "price_current": 10.5},
               {"name": "Starbucks", "price_2022": 3.5, "price_current": 4.28},
           ]},
    "NC": {"fast_food_avg": 12.5, "casual_dining_avg": 27, "coffee_avg": 6.45,
           "monthly_household_spend": 312, "restaurant_inflation_yoy": 5.2,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.2, "price_current": 12.0},
               {"name": "Wendy's", "price_2022": 8.1, "price_current": 12.9},
               {"name": "Chipotle", "price_2022": 8.7, "price_current": 13.2},
               {"name": "Starbucks", "price_2022": 4.3, "price_current": 6.45},
           ]},
    "NY": {"fast_food_avg": 16.5, "casual_dining_avg": 32, "coffee_avg": 7.2,
           "monthly_household_spend": 455, "restaurant_inflation_yoy": 5.8,
           "chains": [
               {"name": "McDonald's", "price_2022": 8.5, "price_current": 14.5},
               {"name": "Wendy's", "price_2022": 9.5, "price_current": 15.5},
               {"name": "Chipotle", "price_2022": 10.5, "price_current": 15.8},
               {"name": "Starbucks", "price_2022": 4.7, "price_current": 7.2},
           ]},
    "OH": {"fast_food_avg": 10.5, "casual_dining_avg": 19, "coffee_avg": 4.6,
           "monthly_household_spend": 275, "restaurant_inflation_yoy": 5.0,
           "chains": [
               {"name": "McDonald's", "price_2022": 6.5, "price_current": 10.2},
               {"name": "Wendy's", "price_2022": 7.3, "price_current": 11.0},
               {"name": "Chipotle", "price_2022": 8.0, "price_current": 11.8},
               {"name": "Starbucks", "price_2022": 3.65, "price_current": 4.6},
           ]},
    "PA": {"fast_food_avg": 13.2, "casual_dining_avg": 26.66, "coffee_avg": 6.04,
           "monthly_household_spend": 330, "restaurant_inflation_yoy": 5.3,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.3, "price_current": 12.5},
               {"name": "Wendy's", "price_2022": 8.2, "price_current": 13.2},
               {"name": "Chipotle", "price_2022": 9.0, "price_current": 13.8},
               {"name": "Starbucks", "price_2022": 4.3, "price_current": 6.04},
           ]},
    "SC": {"fast_food_avg": 12.0, "casual_dining_avg": 22.5, "coffee_avg": 5.6,
           "monthly_household_spend": 305, "restaurant_inflation_yoy": 5.1,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.0, "price_current": 11.5},
               {"name": "Wendy's", "price_2022": 7.9, "price_current": 12.2},
               {"name": "Chipotle", "price_2022": 8.5, "price_current": 12.7},
               {"name": "Starbucks", "price_2022": 4.0, "price_current": 5.6},
           ]},
    "TN": {"fast_food_avg": 12.5, "casual_dining_avg": 21, "coffee_avg": 5.28,
           "monthly_household_spend": 315, "restaurant_inflation_yoy": 5.2,
           "chains": [
               {"name": "McDonald's", "price_2022": 6.99, "price_current": 11.27},
               {"name": "Wendy's", "price_2022": 7.89, "price_current": 12.17},
               {"name": "Chipotle", "price_2022": 8.45, "price_current": 12.62},
               {"name": "Starbucks", "price_2022": 3.8, "price_current": 5.28},
           ]},
    "TX": {"fast_food_avg": 13.5, "casual_dining_avg": 25, "coffee_avg": 6.2,
           "monthly_household_spend": 330, "restaurant_inflation_yoy": 5.3,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.5, "price_current": 12.5},
               {"name": "Wendy's", "price_2022": 8.4, "price_current": 13.4},
               {"name": "Chipotle", "price_2022": 8.9, "price_current": 13.5},
               {"name": "Starbucks", "price_2022": 4.2, "price_current": 6.2},
           ]},
    "UT": {"fast_food_avg": 13.47, "casual_dining_avg": 25.19, "coffee_avg": 6.05,
           "monthly_household_spend": 320, "restaurant_inflation_yoy": 5.2,
           "chains": [
               {"name": "McDonald's", "price_2022": 7.3, "price_current": 12.5},
               {"name": "Wendy's", "price_2022": 8.2, "price_current": 13.2},
               {"name": "Chipotle", "price_2022": 8.9, "price_current": 13.5},
               {"name": "Starbucks", "price_2022": 4.0, "price_current": 6.05},
           ]},
}

# State utilities by state
STATE_UTILS = {
    "AL": {"electricity_kwh": 0.142, "natural_gas_therm": 0.86, "internet_monthly": 58, "phone_monthly": 79, "national_electricity": 0.16},
    "CA": {"electricity_kwh": 0.303, "natural_gas_therm": 1.51, "internet_monthly": 71.25, "phone_monthly": 79.22, "national_electricity": 0.16},
    "CT": {"electricity_kwh": 0.283, "natural_gas_therm": 1.27, "internet_monthly": 72.8, "phone_monthly": 91.38, "national_electricity": 0.16},
    "FL": {"electricity_kwh": 0.159, "natural_gas_therm": 1.11, "internet_monthly": 65, "phone_monthly": 77.81, "national_electricity": 0.16},
    "MI": {"electricity_kwh": 0.195, "natural_gas_therm": 1.06, "internet_monthly": 58.9, "phone_monthly": 88.63, "national_electricity": 0.16},
    "MO": {"electricity_kwh": 0.118, "natural_gas_therm": 1.01, "internet_monthly": 63.24, "phone_monthly": 86.67, "national_electricity": 0.16},
    "NC": {"electricity_kwh": 0.137, "natural_gas_therm": 1.03, "internet_monthly": 66.95, "phone_monthly": 76.05, "national_electricity": 0.16},
    "NY": {"electricity_kwh": 0.284, "natural_gas_therm": 1.29, "internet_monthly": 67.9, "phone_monthly": 82.78, "national_electricity": 0.16},
    "OH": {"electricity_kwh": 0.176, "natural_gas_therm": 1.02, "internet_monthly": 66.34, "phone_monthly": 78.53, "national_electricity": 0.16},
    "PA": {"electricity_kwh": 0.202, "natural_gas_therm": 1.31, "internet_monthly": 68.6, "phone_monthly": 87.65, "national_electricity": 0.16},
    "SC": {"electricity_kwh": 0.154, "natural_gas_therm": 0.95, "internet_monthly": 63.7, "phone_monthly": 88.1, "national_electricity": 0.16},
    "TN": {"electricity_kwh": 0.131, "natural_gas_therm": 0.88, "internet_monthly": 57.6, "phone_monthly": 80.84, "national_electricity": 0.16},
    "TX": {"electricity_kwh": 0.157, "natural_gas_therm": 0.91, "internet_monthly": 60, "phone_monthly": 83.79, "national_electricity": 0.16},
    "UT": {"electricity_kwh": 0.129, "natural_gas_therm": 1.09, "internet_monthly": 67.6, "phone_monthly": 90.57, "national_electricity": 0.16},
}

# State healthcare by state
STATE_HEALTH = {
    "AL": {"doctor_visit": 145, "prescription_generic": 14, "dental_cleaning": 120},
    "CA": {"doctor_visit": 337.92, "prescription_generic": 19.07, "dental_cleaning": 288.4},
    "CT": {"doctor_visit": 273, "prescription_generic": 16.94, "dental_cleaning": 214.5},
    "FL": {"doctor_visit": 183.6, "prescription_generic": 16.95, "dental_cleaning": 152.34},
    "MI": {"doctor_visit": 129.64, "prescription_generic": 12.08, "dental_cleaning": 119.56},
    "MO": {"doctor_visit": 122.4, "prescription_generic": 13.94, "dental_cleaning": 94.28},
    "NC": {"doctor_visit": 180.28, "prescription_generic": 15.37, "dental_cleaning": 147.08},
    "NY": {"doctor_visit": 231.34, "prescription_generic": 21.83, "dental_cleaning": 167.51},
    "OH": {"doctor_visit": 135.25, "prescription_generic": 20.7, "dental_cleaning": 107.41},
    "PA": {"doctor_visit": 197.74, "prescription_generic": 15.52, "dental_cleaning": 133.58},
    "SC": {"doctor_visit": 171.5, "prescription_generic": 19.35, "dental_cleaning": 134.46},
    "TN": {"doctor_visit": 156, "prescription_generic": 14.87, "dental_cleaning": 129.6},
    "TX": {"doctor_visit": 167.62, "prescription_generic": 17.22, "dental_cleaning": 140.4},
    "UT": {"doctor_visit": 169.29, "prescription_generic": 13.3, "dental_cleaning": 132.24},
}

# State personal costs
STATE_PERSONAL = {
    "AL": {"haircut_mens": 16, "gym_membership": 30, "movie_ticket": 10.5},
    "CA": {"haircut_mens": 50.69, "gym_membership": 91.52, "movie_ticket": 30.24},
    "CT": {"haircut_mens": 36.75, "gym_membership": 61.88, "movie_ticket": 22.31},
    "FL": {"haircut_mens": 23.99, "gym_membership": 45.84, "movie_ticket": 15.3},
    "MI": {"haircut_mens": 16.5, "gym_membership": 30, "movie_ticket": 11.5},
    "MO": {"haircut_mens": 14.69, "gym_membership": 29.82, "movie_ticket": 10.58},
    "NC": {"haircut_mens": 24.68, "gym_membership": 42.84, "movie_ticket": 15.15},
    "NY": {"haircut_mens": 30.54, "gym_membership": 59.4, "movie_ticket": 19.09},
    "OH": {"haircut_mens": 15.76, "gym_membership": 31.42, "movie_ticket": 10.59},
    "PA": {"haircut_mens": 23.16, "gym_membership": 42.24, "movie_ticket": 15.41},
    "SC": {"haircut_mens": 23.28, "gym_membership": 36.85, "movie_ticket": 15.14},
    "TN": {"haircut_mens": 17.46, "gym_membership": 36.05, "movie_ticket": 12.35},
    "TX": {"haircut_mens": 23.33, "gym_membership": 43.91, "movie_ticket": 15.88},
    "UT": {"haircut_mens": 23.26, "gym_membership": 43.89, "movie_ticket": 13.96},
}

# ── BLS QCEW sector definitions ───────────────────────────────────────────────
SECTORS = [
    ("10",   "Total All Industries"),
    ("1011", "Natural Resources & Mining"),
    ("1012", "Manufacturing"),
    ("1013", "Construction"),
    ("1021", "Trade, Transportation & Utilities"),
    ("1022", "Information"),
    ("1023", "Financial Activities"),
    ("1024", "Professional & Business Services"),
    ("1025", "Education & Health Services"),
    ("1026", "Leisure & Hospitality"),
    ("1027", "Other Services"),
    ("1028", "Public Administration"),
]
SECTOR_CODES = {code for code, _ in SECTORS}


def build_fips_index(zip_path):
    index = {}
    with zipfile.ZipFile(zip_path, "r") as zf:
        for name in zf.namelist():
            parts = name.split(" ")
            if len(parts) >= 2:
                candidate = parts[1]
                if len(candidate) == 5 and candidate.isdigit():
                    index[candidate] = name
    return index


def parse_county_csv(zip_path, zip_name):
    result = {}
    with zipfile.ZipFile(zip_path, "r") as zf:
        with zf.open(zip_name) as f:
            content = f.read().decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        row = {k.strip().strip('"'): v.strip().strip('"') for k, v in row.items()}
        industry_code = row.get("industry_code", "").strip()
        own_code = row.get("own_code", "").strip()
        if industry_code not in SECTOR_CODES:
            continue
        if industry_code == "10":
            target_own = "0"
        elif industry_code == "1028":
            target_own = "3"
        else:
            target_own = "5"
        if own_code != target_own:
            continue
        if row.get("disclosure_code", "").strip() == "N":
            continue
        try:
            empl = int(row.get("annual_avg_emplvl", "0").replace(",", ""))
        except:
            empl = None
        try:
            wage = int(row.get("annual_avg_wkly_wage", "0").replace(",", ""))
        except:
            wage = None
        if empl and empl > 0:
            result[industry_code] = {"employment": empl, "avg_wkly_wage": wage}
    return result


def build_workforce_block(fips, data_2024, data_2019):
    total_row = data_2024.get("10", {})
    total_empl = total_row.get("employment", 0)
    median_wage = total_row.get("avg_wkly_wage")
    top_sectors = []
    for code, label in SECTORS:
        if code == "10":
            continue
        row = data_2024.get(code)
        if not row:
            continue
        empl = row["employment"]
        wage = row["avg_wkly_wage"]
        pct = round(empl / total_empl * 100, 1) if total_empl else None
        trend = None
        if data_2019:
            row_2019 = data_2019.get(code)
            if row_2019 and row_2019.get("employment", 0) > 0:
                trend = round((empl - row_2019["employment"]) / row_2019["employment"] * 100, 1)
        sector = {
            "code": code, "label": label, "employment": empl,
            "avg_weekly_wage": wage, "pct_of_total": pct,
        }
        if trend is not None:
            sector["trend_5yr_pct"] = trend
        top_sectors.append(sector)
    top_sectors.sort(key=lambda x: x["employment"], reverse=True)
    top_sectors = top_sectors[:8]
    dominant = top_sectors[0]["label"] if top_sectors else None
    return {
        "county_fips": fips, "year": 2024, "source": "BLS QCEW 2024 Annual",
        "total_employment": total_empl, "top_sectors": top_sectors,
        "dominant_sector": dominant, "median_weekly_wage_all": median_wage,
    }


def download_zori():
    print("Downloading ZORI data...")
    url = "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv"
    with urllib.request.urlopen(url) as r:
        content = r.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    date_cols = [c for c in rows[0].keys() if c[0].isdigit()]
    return rows, date_cols


def get_zori_for_city(rows, date_cols, city_name, state_abbr):
    """Find ZORI data and return rent history for a city."""
    state = state_abbr.upper()
    city_lower = city_name.lower()
    best_row = None
    for row in rows:
        region = row['RegionName']
        row_state = (row.get('StateName') or '').strip().upper()
        # Convert state name to abbr
        STATE_NAMES = {
            'CALIFORNIA': 'CA', 'ALABAMA': 'AL', 'NEW YORK': 'NY', 'MICHIGAN': 'MI',
            'TENNESSEE': 'TN', 'SOUTH CAROLINA': 'SC', 'TEXAS': 'TX', 'OHIO': 'OH',
            'FLORIDA': 'FL', 'UTAH': 'UT', 'NORTH CAROLINA': 'NC', 'PENNSYLVANIA': 'PA',
            'CONNECTICUT': 'CT', 'MISSOURI': 'MO', 'WASHINGTON': 'WA',
        }
        row_state_abbr = STATE_NAMES.get(row_state, row_state[:2] if len(row_state) >= 2 else '')
        if row_state_abbr != state and row_state != state:
            continue
        region_lower = region.lower()
        # Match city name in region
        if city_lower in region_lower or region_lower.startswith(city_lower):
            best_row = row
            break
    if not best_row:
        return None
    # Build 60-month history (last 60 data points)
    history = []
    for dc in date_cols:
        val = best_row.get(dc)
        if val and float(val) > 0:
            # Convert date from "2021-03-31" to "2021-03"
            date_str = dc[:7]
            history.append({"date": date_str, "avg": round(float(val)), "onebed": round(float(val)*0.82), "national": 1895})
    # Keep last 60 months
    history = history[-60:]
    if not history:
        return None
    current = history[-1]["avg"]
    prev_year = history[-13]["avg"] if len(history) >= 13 else history[0]["avg"]
    # Find 2022-01 baseline
    baseline_2022 = None
    for h in history:
        if h["date"].startswith("2022-01"):
            baseline_2022 = h["avg"]
            break
    if not baseline_2022 and history:
        # use earliest available or estimate
        baseline_2022 = history[0]["avg"]
    yoy = round((current - prev_year) / prev_year * 100, 1) if prev_year else 0
    return {
        "current": current,
        "prev_year": prev_year,
        "baseline_2022": baseline_2022,
        "history": history,
        "yoy": yoy,
    }


def build_gas_history(state_abbr):
    """Build gas history using boise national prices × state ratio."""
    boise = json.loads((DATA_DIR / 'boise-id.json').read_text())
    ratio = STATE_GAS_RATIO[state_abbr]
    gas_current = round(STATE_GAS_CURRENT[state_abbr], 3)
    national_current = 3.983
    diesel_current = round(gas_current * DIESEL_MULT, 2)
    history = []
    for h in boise['gas']['history']:
        state_price = round(h['national'] * ratio, 3)
        history.append({"date": h['date'], "price": state_price, "national": h['national']})
    return {
        "current": gas_current,
        "diesel_current": diesel_current,
        "national_current": national_current,
        "history": history,
    }


def build_electricity_block(state_abbr):
    rate = STATE_ELEC[state_abbr]
    # Avg monthly kWh usage: national avg ~900, adjust by state
    avg_kwh = 900
    monthly_bill = round(rate * avg_kwh / 100, 1)
    return {
        "cents_per_kwh": rate,
        "monthly_avg_bill": monthly_bill,
        "national_avg_cents": 17.38,
        "national_avg_bill": 156.4,
        "source": "EIA Residential (2026-03)",
        "avg_monthly_kwh_rate": rate,
        "national_avg_rate": 17.38,
        "avg_monthly_bill": round(monthly_bill),
    }


def build_car_insurance_block(state_abbr):
    annual = STATE_INS[state_abbr]
    return {
        "annual_avg": annual,
        "monthly_avg": round(annual / 12, 2),
        "national_avg_annual": 2150,
        "source": "Bankrate/NAIC state avg full coverage (2025)",
    }


def build_transportation_block(state_abbr, gas_current):
    # Assume 15,000 miles/yr, 25 mpg = 600 gal/yr = 50 gal/month
    gas_per_month = round(gas_current * 50, 2)
    ins_monthly = round(STATE_INS[state_abbr] / 12, 2)
    return {
        "car_insurance_monthly": ins_monthly,
        "used_car_avg": 24000,
        "gas_per_month_avg": gas_per_month,
    }


def get_groceries_block():
    """Get the national groceries block from boise-id.json."""
    boise = json.loads((DATA_DIR / 'boise-id.json').read_text())
    return boise['groceries']


def build_income_block(fips, income, rent_monthly, gas_current, elec_rate, ins_annual):
    """Build income + cost burden block."""
    rent_annual = rent_monthly * 12
    gas_annual = round(gas_current * 600)
    # Simplified grocery annual (same as add_county_income.py)
    grocery_annual = round(2.5 * 52 + 4.026 * 52 + 6.739 * 52 + 1.85 * 52 + 2.049 * 52)
    elec_monthly = round(elec_rate * 900 / 100, 1)
    elec_annual = round(elec_monthly * 12)
    total = rent_annual + gas_annual + grocery_annual + elec_annual + ins_annual
    burden = round(total / income * 100, 1) if income else None
    return {
        "median_household": income,
        "county_fips": fips,
        "year": 2023,
        "source": "Census ACS 5-Year 2023",
        "cost_burden": {
            "rent_annual": round(rent_annual),
            "gas_annual": gas_annual,
            "grocery_annual": grocery_annual,
            "electricity_annual": elec_annual,
            "insurance_annual": ins_annual,
            "total_essential_annual": round(total),
            "burden_pct": burden,
            "note": "Essential costs as % of median household income (rent+gas+groceries+electricity+insurance)",
        }
    }


def main():
    print("=" * 70)
    print("Generating 33 new city JSON files")
    print("=" * 70)

    # Load county income data
    counties_raw = json.loads((DATA_DIR / 'counties.json').read_text())
    county_income = {c['fips']: c['median_household_income'] for c in counties_raw['counties']}
    # Override New Haven CT to use South Central Planning Region
    county_income["09170"] = 86266  # South Central CT Planning Region

    # Download ZORI data
    zori_rows, date_cols = download_zori()
    print(f"ZORI loaded: {len(zori_rows)} rows, {len(date_cols)} months")

    # Build BLS QCEW indexes
    print("Building BLS QCEW indexes...")
    idx_2024 = build_fips_index(ZIP_2024)
    idx_2019 = build_fips_index(ZIP_2019)
    print(f"  2024: {len(idx_2024)} | 2019: {len(idx_2019)}")

    # Load groceries template
    groceries = get_groceries_block()

    # Process each new city
    results = []
    cities_json = json.loads((DATA_DIR / 'cities.json').read_text())
    existing_slugs = {c['slug'] for c in cities_json}

    for slug, meta in NEW_CITIES.items():
        if slug in existing_slugs:
            print(f"  SKIP {slug} (already exists)")
            continue

        name = meta["name"]
        state_abbr = meta["state_abbr"]
        fips = meta["fips"]
        pop = meta["pop"]
        region = meta["region"]
        col = COL_INDEX[slug]

        print(f"\nBuilding {slug}...")

        # 1. Gas history
        gas = build_gas_history(state_abbr)

        # 2. Rent from ZORI
        zori = get_zori_for_city(zori_rows, date_cols, name, state_abbr)
        if not zori:
            print(f"  WARNING: No ZORI data for {slug}, using state estimate")
            # Fallback
            STATE_RENT = {
                "AL": 1050, "CA": 2300, "CT": 1650, "FL": 1750, "MI": 1150,
                "MO": 1050, "NC": 1350, "NY": 2400, "OH": 1100, "PA": 1400,
                "SC": 1300, "TN": 1350, "TX": 1400, "UT": 1500,
            }
            avg = STATE_RENT.get(state_abbr, 1200)
            baseline_2022 = round(avg / 1.15)
            zori = {
                "current": avg, "prev_year": round(avg * 0.97), "baseline_2022": baseline_2022,
                "history": [], "yoy": 3.0,
            }

        avg_rent = zori["current"]
        avg_1br = round(avg_rent * 0.82)
        avg_2br = round(avg_rent * 1.18)
        avg_3br = round(avg_rent * 1.33)

        rent_block = {
            "avg_all": avg_rent,
            "avg_1br": avg_1br,
            "avg_2br": avg_2br,
            "avg_3br": avg_3br,
            "national_avg": 1900,
            "median_home_price": round(avg_rent * 200),  # rough
            "history": zori["history"],
            "baseline_2022": zori["baseline_2022"],
            "yoy_change_pct": zori["yoy"],
            "source": "Zillow ZORI Metro (2026-02)",
        }

        # 3. Groceries (national data)
        groceries_block = groceries

        # 4. Electricity
        elec = build_electricity_block(state_abbr)

        # 5. Car insurance
        ins = build_car_insurance_block(state_abbr)

        # 6. Dining
        dining = STATE_DINING[state_abbr]

        # 7. Utilities
        utils = STATE_UTILS[state_abbr]

        # 8. Healthcare
        health = STATE_HEALTH[state_abbr]

        # 9. Personal
        personal = STATE_PERSONAL[state_abbr]

        # 10. Transportation
        transport = build_transportation_block(state_abbr, gas["current"])

        # 11. Income + cost burden
        income = county_income.get(fips, 65000)
        income_block = build_income_block(
            fips, income, avg_rent, gas["current"],
            STATE_ELEC[state_abbr], STATE_INS[state_abbr]
        )

        # 12. Workforce from BLS QCEW
        workforce_block = None
        zip_name_2024 = idx_2024.get(fips)
        if zip_name_2024:
            data_2024 = parse_county_csv(ZIP_2024, zip_name_2024)
            zip_name_2019 = idx_2019.get(fips)
            data_2019 = parse_county_csv(ZIP_2019, zip_name_2019) if zip_name_2019 else None
            workforce_block = build_workforce_block(fips, data_2024, data_2019)
        else:
            print(f"  WARNING: No BLS data for FIPS {fips}")
            workforce_block = {
                "county_fips": fips, "year": 2024, "source": "BLS QCEW 2024 Annual",
                "total_employment": 0, "top_sectors": [],
                "dominant_sector": "Trade, Transportation & Utilities",
                "median_weekly_wage_all": 1000,
            }

        dominant = workforce_block.get("dominant_sector", "Unknown")

        # Assemble city JSON
        city_data = {
            "city": name,
            "state": meta["state"],
            "state_abbr": state_abbr,
            "slug": slug,
            "population": pop,
            "region": region,
            "col_index": col,
            "last_updated": "2026-03-25",
            "gas": gas,
            "rent": rent_block,
            "groceries": groceries_block,
            "dining": dining,
            "utilities": utils,
            "transportation": transport,
            "healthcare": health,
            "personal": personal,
            "data_sources": {
                "groceries": "BLS/FRED APU series — national avg prices",
                "gas": "AAA Gas Prices — state-level avg"
            },
            "electricity": {
                "cents_per_kwh": STATE_ELEC[state_abbr],
                "monthly_avg_bill": round(STATE_ELEC[state_abbr] * 900 / 100),
                "national_avg_cents": 17.38,
                "national_avg_bill": 156.4,
                "source": "EIA Residential (2026-03)",
                "avg_monthly_kwh_rate": STATE_ELEC[state_abbr],
                "national_avg_rate": 17.38,
                "avg_monthly_bill": round(STATE_ELEC[state_abbr] * 900 / 100),
            },
            "car_insurance": ins,
            "income": income_block,
            "workforce": workforce_block,
        }

        # Write file
        out_path = DATA_DIR / f"{slug}.json"
        out_path.write_text(json.dumps(city_data, separators=(',', ':')))
        print(f"  ✓ {slug}: rent=${avg_rent}, dominant={dominant}, income=${income:,}")

        results.append({
            "slug": slug,
            "name": name,
            "rent": avg_rent,
            "dominant": dominant,
            "income": income,
        })

        # Add to cities.json
        cities_json.append({
            "name": name,
            "state": meta["state"],
            "state_abbr": state_abbr,
            "slug": slug,
            "population": pop,
            "region": region,
            "col_index": col,
            "county_fips": fips,
            "median_household_income": income,
        })

    # Save updated cities.json
    (DATA_DIR / 'cities.json').write_text(json.dumps(cities_json, separators=(',', ':')))
    print(f"\n✅ Updated cities.json: {len(cities_json)} total cities")

    # Final summary
    print(f"\n{'='*70}")
    print(f"SUMMARY: {len(results)} new cities added")
    print(f"{'='*70}")
    for r in results:
        print(f"  {r['slug']:<28} rent=${r['rent']:,}  dominant={r['dominant']}  income=${r['income']:,}")

    print("\nCITY EXPANSION COMPLETE")
    return results


if __name__ == "__main__":
    main()
