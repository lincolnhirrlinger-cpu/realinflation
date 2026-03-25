#!/usr/bin/env python3
"""
Add county FIPS + median household income to each city JSON.
Also updates cities.json with income data.
Computes cost_burden_pct: (annual housing+gas+groceries+electricity) / median_income
"""
import json, math
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "public" / "data"

# Manual FIPS mapping for all 115 cities (primary county for metro area)
# Format: city_slug -> county FIPS (5 digits)
CITY_FIPS = {
    # Alabama
    "birmingham-al":    "01073",  # Jefferson County
    "huntsville-al":    "01089",  # Madison County
    "mobile-al":        "01097",  # Mobile County
    # Alaska
    "anchorage-ak":     "02020",  # Anchorage Municipality
    # Arizona
    "phoenix-az":       "04013",  # Maricopa County
    "tucson-az":        "04019",  # Pima County
    "mesa-az":          "04013",  # Maricopa County
    # Arkansas
    "little-rock-ar":   "05119",  # Pulaski County
    "fayetteville-ar":  "05143",  # Washington County
    # California
    "los-angeles-ca":   "06037",  # Los Angeles County
    "san-diego-ca":     "06073",  # San Diego County
    "san-jose-ca":      "06085",  # Santa Clara County
    "san-francisco-ca": "06075",  # San Francisco County
    "fresno-ca":        "06019",  # Fresno County
    "sacramento-ca":    "06067",  # Sacramento County
    "long-beach-ca":    "06037",  # Los Angeles County
    "oakland-ca":       "06001",  # Alameda County
    # Colorado
    "denver-co":        "08031",  # Denver County
    "colorado-springs-co": "08041", # El Paso County
    "aurora-co":        "08005",  # Arapahoe County
    # Connecticut
    "bridgeport-ct":    "09001",  # Fairfield County
    "new-haven-ct":     "09009",  # New Haven County
    "hartford-ct":      "09003",  # Hartford County
    # Delaware
    "wilmington-de":    "10003",  # New Castle County
    # Florida
    "jacksonville-fl":  "12031",  # Duval County
    "miami-fl":         "12086",  # Miami-Dade County
    "tampa-fl":         "12057",  # Hillsborough County
    "orlando-fl":       "12095",  # Orange County
    "st-petersburg-fl": "12103",  # Pinellas County
    "hialeah-fl":       "12086",  # Miami-Dade County
    "tallahassee-fl":   "12073",  # Leon County
    # Georgia
    "atlanta-ga":       "13121",  # Fulton County
    "augusta-ga":       "13245",  # Richmond County
    "savannah-ga":      "13051",  # Chatham County
    # Hawaii
    "honolulu-hi":      "15003",  # Honolulu County
    # Idaho
    "boise-id":         "16001",  # Ada County
    "meridian-id":      "16001",  # Ada County
    "nampa-id":         "16027",  # Canyon County
    "idaho-falls-id":   "16019",  # Bonneville County
    "pocatello-id":     "16005",  # Bannock County
    "twin-falls-id":    "16083",  # Twin Falls County
    "rexburg-id":       "16065",  # Madison County
    # Illinois
    "chicago-il":       "17031",  # Cook County
    "aurora-il":        "17089",  # Kane County
    "naperville-il":    "17043",  # DuPage County
    "springfield-il":   "17167",  # Sangamon County
    # Indiana
    "indianapolis-in":  "18097",  # Marion County
    "fort-wayne-in":    "18003",  # Allen County
    # Iowa
    "des-moines-ia":    "19153",  # Polk County
    "cedar-rapids-ia":  "19113",  # Linn County
    # Kansas
    "wichita-ks":       "20173",  # Sedgwick County
    "kansas-city-ks":   "20209",  # Wyandotte County
    # Kentucky
    "louisville-ky":    "21111",  # Jefferson County
    "lexington-ky":     "21067",  # Fayette County
    # Louisiana
    "new-orleans-la":   "22071",  # Orleans Parish
    "baton-rouge-la":   "22033",  # East Baton Rouge Parish
    # Maine
    "portland-me":      "23005",  # Cumberland County
    # Maryland
    "baltimore-md":     "24510",  # Baltimore City
    "annapolis-md":     "24003",  # Anne Arundel County
    # Massachusetts
    "boston-ma":        "25025",  # Suffolk County
    "worcester-ma":     "25027",  # Worcester County
    "springfield-ma":   "25013",  # Hampden County
    # Michigan
    "detroit-mi":       "26163",  # Wayne County
    "grand-rapids-mi":  "26081",  # Kent County
    # Minnesota
    "minneapolis-mn":   "27053",  # Hennepin County
    "st-paul-mn":       "27123",  # Ramsey County
    # Mississippi
    "jackson-ms":       "28049",  # Hinds County
    "biloxi-ms":        "28047",  # Harrison County
    # Missouri
    "kansas-city-mo":   "29095",  # Jackson County
    "st-louis-mo":      "29510",  # St. Louis City
    # Montana
    "billings-mt":      "30111",  # Yellowstone County
    # Nebraska
    "omaha-ne":         "31055",  # Douglas County
    "lincoln-ne":       "31109",  # Lancaster County
    # Nevada
    "las-vegas-nv":     "32003",  # Clark County
    "henderson-nv":     "32003",  # Clark County
    "reno-nv":          "32031",  # Washoe County
    # New Hampshire
    "manchester-nh":    "33011",  # Hillsborough County
    # New Jersey
    "newark-nj":        "34013",  # Essex County
    "jersey-city-nj":   "34017",  # Hudson County
    # New Mexico
    "albuquerque-nm":   "35001",  # Bernalillo County
    # New York
    "new-york-ny":      "36061",  # New York County (Manhattan)
    "buffalo-ny":       "36029",  # Erie County
    "rochester-ny":     "36055",  # Monroe County
    "yonkers-ny":       "36119",  # Westchester County
    "syracuse-ny":      "36067",  # Onondaga County
    # North Carolina
    "charlotte-nc":     "37119",  # Mecklenburg County
    "raleigh-nc":       "37183",  # Wake County
    "greensboro-nc":    "37081",  # Guilford County
    "durham-nc":        "37063",  # Durham County
    # North Dakota
    "fargo-nd":         "38017",  # Cass County
    # Ohio
    "columbus-oh":      "39049",  # Franklin County
    "cleveland-oh":     "39035",  # Cuyahoga County
    "cincinnati-oh":    "39061",  # Hamilton County
    "toledo-oh":        "39095",  # Lucas County
    # Oklahoma
    "oklahoma-city-ok": "40109",  # Oklahoma County
    "tulsa-ok":         "40143",  # Tulsa County
    # Oregon
    "portland-or":      "41051",  # Multnomah County
    "eugene-or":        "41039",  # Lane County
    "salem-or":         "41047",  # Marion County
    # Pennsylvania
    "philadelphia-pa":  "42101",  # Philadelphia County
    "pittsburgh-pa":    "42003",  # Allegheny County
    "allentown-pa":     "42077",  # Lehigh County
    # Rhode Island
    "providence-ri":    "44007",  # Providence County
    "cranston-ri":      "44007",  # Providence County
    # South Carolina
    "charleston-sc":    "45019",  # Charleston County
    "columbia-sc":      "45079",  # Richland County
    # South Dakota
    "sioux-falls-sd":   "46099",  # Minnehaha County
    # Tennessee
    "nashville-tn":     "47037",  # Davidson County
    "memphis-tn":       "47157",  # Shelby County
    "knoxville-tn":     "47093",  # Knox County
    "chattanooga-tn":   "47065",  # Hamilton County
    # Texas
    "houston-tx":       "48201",  # Harris County
    "san-antonio-tx":   "48029",  # Bexar County
    "dallas-tx":        "48113",  # Dallas County
    "austin-tx":        "48453",  # Travis County
    "fort-worth-tx":    "48439",  # Tarrant County
    "el-paso-tx":       "48141",  # El Paso County
    "arlington-tx":     "48439",  # Tarrant County
    "corpus-christi-tx":"48355",  # Nueces County
    # Utah
    "salt-lake-city-ut":"49035",  # Salt Lake County
    "west-valley-city-ut":"49035",# Salt Lake County
    "provo-ut":         "49049",  # Utah County
    "ogden-ut":         "49057",  # Weber County
    # Vermont
    "burlington-vt":    "50007",  # Chittenden County
    # Virginia
    "virginia-beach-va":"51810",  # Virginia Beach City
    "norfolk-va":       "51710",  # Norfolk City
    "richmond-va":      "51760",  # Richmond City
    "arlington-va":     "51013",  # Arlington County
    # Washington
    "seattle-wa":       "53033",  # King County
    "spokane-wa":       "53063",  # Spokane County
    "tacoma-wa":        "53053",  # Pierce County
    "vancouver-wa":     "53011",  # Clark County
    "bellevue-wa":      "53033",  # King County
    # West Virginia
    "charleston-wv":    "54039",  # Kanawha County
    # Wisconsin
    "milwaukee-wi":     "55079",  # Milwaukee County
    "madison-wi":       "55025",  # Dane County
    # Wyoming
    "cheyenne-wy":      "56021",  # Laramie County
    # DC
    "washington-dc":    "11001",  # DC (District of Columbia)
    # Missing cities
    "fort-smith-ar":    "05033",  # Crawford County
    "dover-de":         "10001",  # Kent County
    "hilo-hi":          "15001",  # Hawaii County
    "coeur-dalene-id":  "16055",  # Kootenai County
    "topeka-ks":        "20177",  # Shawnee County
    "frankfort-ky":     "21073",  # Franklin County
    "augusta-me":       "23011",  # Kennebec County
    "lansing-mi":       "26065",  # Ingham County
    "saint-paul-mn":    "27123",  # Ramsey County
    "jefferson-city-mo":"29151",  # Cole County
    "helena-mt":        "30049",  # Lewis and Clark County
    "carson-city-nv":   "32510",  # Carson City
    "concord-nh":       "33015",  # Merrimack County
    "trenton-nj":       "34021",  # Mercer County
    "santa-fe-nm":      "35049",  # Santa Fe County
    "albany-ny":        "36001",  # Albany County
    "bismarck-nd":      "38015",  # Burleigh County
    "harrisburg-pa":    "42043",  # Dauphin County
    "pierre-sd":        "46099",  # Hughes County (capital)
    "montpelier-vt":    "50023",  # Washington County
    "olympia-wa":       "53067",  # Thurston County
    "huntington-wv":    "54011",  # Cabell County
    "casper-wy":        "56025",  # Natrona County
}

# Load county income data
counties_raw = json.loads(Path(DATA_DIR / 'counties.json').read_text())
county_income = {c['fips']: c['median_household_income'] for c in counties_raw['counties']}
print(f"Loaded {len(county_income)} county income records")

# Update cities.json
cities = json.loads(Path(DATA_DIR / 'cities.json').read_text())
for city in cities:
    slug = city['slug']
    fips = CITY_FIPS.get(slug)
    if fips:
        income = county_income.get(fips)
        city['county_fips'] = fips
        city['median_household_income'] = income
    else:
        print(f"  ⚠️  No FIPS for {slug}")

matched = sum(1 for c in cities if c.get('median_household_income'))
print(f"Matched: {matched}/{len(cities)} cities with income data")
Path(DATA_DIR / 'cities.json').write_text(json.dumps(cities, separators=(',', ':')))
print("Saved cities.json")

# Update each city JSON — add income + compute cost burden
MONTHS_IN_YEAR = 12
updated = 0
for city in cities:
    slug = city['slug']
    fips = city.get('county_fips')
    income = city.get('median_household_income')
    if not income or not fips:
        continue

    city_file = DATA_DIR / f'{slug}.json'
    if not city_file.exists():
        continue

    d = json.loads(city_file.read_text())

    # Add income
    d['income'] = {
        'median_household': income,
        'county_fips': fips,
        'year': 2023,
        'source': 'Census ACS 5-Year 2023',
    }

    # Compute annual cost burden
    # Annual rent
    rent_monthly = d.get('rent', {}).get('avg_all', 0)
    rent_annual = rent_monthly * 12

    # Annual gas (assume 15,000 miles/yr, 25 mpg = 600 gallons)
    gas_price = d.get('gas', {}).get('current', 0)
    gas_annual = gas_price * 600  # 600 gal/yr = 15k miles / 25mpg

    # Annual groceries (rough: 2-person household at BLS basket)
    # Eggs 52 doz, milk 52 gal, bread 52 loaves, beef 52 lb, chicken 52 lb
    groceries = d.get('groceries', {}).get('items', [])
    grocery_map = {g['name']: g.get('current', g.get('current_price', 0)) for g in groceries}
    grocery_annual = (
        grocery_map.get('Eggs (dozen)', 2.50) * 52 +
        grocery_map.get('Milk (gallon)', 4.03) * 52 +
        grocery_map.get('Bread (loaf)', 1.85) * 52 +
        grocery_map.get('Ground Beef (lb)', 6.74) * 52 +
        grocery_map.get('Chicken Breast (lb)', 2.05) * 52
    )

    # Annual electricity
    elec = d.get('electricity', {})
    elec_monthly = elec.get('avg_monthly_bill') or (elec.get('rate_per_kwh', 0.1738) * 900)
    elec_annual = elec_monthly * 12

    # Annual car insurance
    insurance_annual = d.get('car_insurance', {}).get('annual_premium', 1700)

    # Total essential costs
    total_essential = rent_annual + gas_annual + grocery_annual + elec_annual + insurance_annual
    burden_pct = round(total_essential / income * 100, 1) if income else None

    d['income']['cost_burden'] = {
        'rent_annual': round(rent_annual),
        'gas_annual': round(gas_annual),
        'grocery_annual': round(grocery_annual),
        'electricity_annual': round(elec_annual),
        'insurance_annual': round(insurance_annual),
        'total_essential_annual': round(total_essential),
        'burden_pct': burden_pct,
        'note': 'Essential costs as % of median household income (rent+gas+groceries+electricity+insurance)',
    }

    city_file.write_text(json.dumps(d, separators=(',', ':')))
    updated += 1

print(f"\nUpdated {updated} city JSON files with income + cost burden")

# Show sample
d = json.loads(Path(DATA_DIR / 'boise-id.json').read_text())
inc = d['income']
cb = inc['cost_burden']
print(f"\nBoise:")
print(f"  Median household income: ${inc['median_household']:,}")
print(f"  Rent annual: ${cb['rent_annual']:,}")
print(f"  Gas annual (15k mi): ${cb['gas_annual']:,}")
print(f"  Groceries annual: ${cb['grocery_annual']:,}")
print(f"  Electricity annual: ${cb['electricity_annual']:,}")
print(f"  Insurance annual: ${cb['insurance_annual']:,}")
print(f"  Total essential: ${cb['total_essential_annual']:,}")
print(f"  Cost burden: {cb['burden_pct']}% of income")
