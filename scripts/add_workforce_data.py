#!/usr/bin/env python3
"""
Fetch BLS QCEW county-level employment data for all 115 cities.
Adds a `workforce` block to each city's JSON file.
Uses pre-downloaded BLS QCEW annual ZIP files at /tmp/bls_2024_annual.zip and /tmp/bls_2019_annual.zip
"""

import json
import csv
import io
import zipfile
from pathlib import Path

# ── Project paths ────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
DATA_DIR   = SCRIPT_DIR.parent / "public" / "data"

ZIP_2024 = Path("/tmp/bls_2024_annual.zip")
ZIP_2019 = Path("/tmp/bls_2019_annual.zip")

# ── City → County FIPS ───────────────────────────────────────────────────────
CITY_FIPS = {
    # Alabama
    "birmingham-al":    "01073",
    "huntsville-al":    "01089",
    "mobile-al":        "01097",
    # Alaska
    "anchorage-ak":     "02020",
    # Arizona
    "phoenix-az":       "04013",
    "tucson-az":        "04019",
    "mesa-az":          "04013",
    # Arkansas
    "little-rock-ar":   "05119",
    "fayetteville-ar":  "05143",
    # California
    "los-angeles-ca":   "06037",
    "san-diego-ca":     "06073",
    "san-jose-ca":      "06085",
    "san-francisco-ca": "06075",
    "fresno-ca":        "06019",
    "sacramento-ca":    "06067",
    "long-beach-ca":    "06037",
    "oakland-ca":       "06001",
    # Colorado
    "denver-co":        "08031",
    "colorado-springs-co": "08041",
    "aurora-co":        "08005",
    # Connecticut
    "bridgeport-ct":    "09001",
    "new-haven-ct":     "09009",
    "hartford-ct":      "09003",
    # Delaware
    "wilmington-de":    "10003",
    # Florida
    "jacksonville-fl":  "12031",
    "miami-fl":         "12086",
    "tampa-fl":         "12057",
    "orlando-fl":       "12095",
    "st-petersburg-fl": "12103",
    "hialeah-fl":       "12086",
    "tallahassee-fl":   "12073",
    # Georgia
    "atlanta-ga":       "13121",
    "augusta-ga":       "13245",
    "savannah-ga":      "13051",
    # Hawaii
    "honolulu-hi":      "15003",
    # Idaho
    "boise-id":         "16001",
    "meridian-id":      "16001",
    "nampa-id":         "16027",
    "idaho-falls-id":   "16019",
    "pocatello-id":     "16005",
    "twin-falls-id":    "16083",
    "rexburg-id":       "16065",
    # Illinois
    "chicago-il":       "17031",
    "aurora-il":        "17089",
    "naperville-il":    "17043",
    "springfield-il":   "17167",
    # Indiana
    "indianapolis-in":  "18097",
    "fort-wayne-in":    "18003",
    # Iowa
    "des-moines-ia":    "19153",
    "cedar-rapids-ia":  "19113",
    # Kansas
    "wichita-ks":       "20173",
    "kansas-city-ks":   "20209",
    # Kentucky
    "louisville-ky":    "21111",
    "lexington-ky":     "21067",
    # Louisiana
    "new-orleans-la":   "22071",
    "baton-rouge-la":   "22033",
    # Maine
    "portland-me":      "23005",
    # Maryland
    "baltimore-md":     "24510",
    "annapolis-md":     "24003",
    # Massachusetts
    "boston-ma":        "25025",
    "worcester-ma":     "25027",
    "springfield-ma":   "25013",
    # Michigan
    "detroit-mi":       "26163",
    "grand-rapids-mi":  "26081",
    # Minnesota
    "minneapolis-mn":   "27053",
    "st-paul-mn":       "27123",
    # Mississippi
    "jackson-ms":       "28049",
    "biloxi-ms":        "28047",
    # Missouri
    "kansas-city-mo":   "29095",
    "st-louis-mo":      "29510",
    # Montana
    "billings-mt":      "30111",
    # Nebraska
    "omaha-ne":         "31055",
    "lincoln-ne":       "31109",
    # Nevada
    "las-vegas-nv":     "32003",
    "henderson-nv":     "32003",
    "reno-nv":          "32031",
    # New Hampshire
    "manchester-nh":    "33011",
    # New Jersey
    "newark-nj":        "34013",
    "jersey-city-nj":   "34017",
    # New Mexico
    "albuquerque-nm":   "35001",
    # New York
    "new-york-ny":      "36061",
    "buffalo-ny":       "36029",
    "rochester-ny":     "36055",
    "yonkers-ny":       "36119",
    "syracuse-ny":      "36067",
    # North Carolina
    "charlotte-nc":     "37119",
    "raleigh-nc":       "37183",
    "greensboro-nc":    "37081",
    "durham-nc":        "37063",
    # North Dakota
    "fargo-nd":         "38017",
    # Ohio
    "columbus-oh":      "39049",
    "cleveland-oh":     "39035",
    "cincinnati-oh":    "39061",
    "toledo-oh":        "39095",
    # Oklahoma
    "oklahoma-city-ok": "40109",
    "tulsa-ok":         "40143",
    # Oregon
    "portland-or":      "41051",
    "eugene-or":        "41039",
    "salem-or":         "41047",
    # Pennsylvania
    "philadelphia-pa":  "42101",
    "pittsburgh-pa":    "42003",
    "allentown-pa":     "42077",
    # Rhode Island
    "providence-ri":    "44007",
    "cranston-ri":      "44007",
    # South Carolina
    "charleston-sc":    "45019",
    "columbia-sc":      "45079",
    # South Dakota
    "sioux-falls-sd":   "46099",
    # Tennessee
    "nashville-tn":     "47037",
    "memphis-tn":       "47157",
    "knoxville-tn":     "47093",
    "chattanooga-tn":   "47065",
    # Texas
    "houston-tx":       "48201",
    "san-antonio-tx":   "48029",
    "dallas-tx":        "48113",
    "austin-tx":        "48453",
    "fort-worth-tx":    "48439",
    "el-paso-tx":       "48141",
    "arlington-tx":     "48439",
    "corpus-christi-tx":"48355",
    # Utah
    "salt-lake-city-ut":"49035",
    "west-valley-city-ut":"49035",
    "provo-ut":         "49049",
    "ogden-ut":         "49057",
    # Vermont
    "burlington-vt":    "50007",
    # Virginia
    "virginia-beach-va":"51810",
    "norfolk-va":       "51710",
    "richmond-va":      "51760",
    "arlington-va":     "51013",
    # Washington
    "seattle-wa":       "53033",
    "spokane-wa":       "53063",
    "tacoma-wa":        "53053",
    "vancouver-wa":     "53011",
    "bellevue-wa":      "53033",
    # West Virginia
    "charleston-wv":    "54039",
    # Wisconsin
    "milwaukee-wi":     "55079",
    "madison-wi":       "55025",
    # Wyoming
    "cheyenne-wy":      "56021",
    # DC
    "washington-dc":    "11001",
    # Missing cities
    "fort-smith-ar":    "05033",
    "dover-de":         "10001",
    "hilo-hi":          "15001",
    "coeur-dalene-id":  "16055",
    "topeka-ks":        "20177",
    "frankfort-ky":     "21073",
    "augusta-me":       "23011",
    "lansing-mi":       "26065",
    "saint-paul-mn":    "27123",
    "jefferson-city-mo":"29151",
    "helena-mt":        "30049",
    "concord-nh":       "33017",
    "trenton-nj":       "34021",
    "santa-fe-nm":      "35049",
    "albany-ny":        "36001",
    "bismarck-nd":      "38015",
    "carson-city-nv":   "32510",
    "pierre-sd":        "46099",
    "casper-wy":        "56025",
}

# ── Sector definitions ────────────────────────────────────────────────────────
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
SECTOR_LABELS = {code: label for code, label in SECTORS}


def build_fips_index(zip_path: Path) -> dict:
    """
    Build a dict: fips5 → internal zip name (e.g. '16001' → '2024.annual.by_area/2024.annual 16001 Ada County, Idaho.csv')
    """
    index = {}
    with zipfile.ZipFile(zip_path, "r") as zf:
        for name in zf.namelist():
            # Filenames look like: 2024.annual.by_area/2024.annual 16001 Ada County, Idaho.csv
            # Extract the 5-digit FIPS that appears after "YYYY.annual "
            parts = name.split(" ")
            if len(parts) >= 2:
                # second token after split on space should be the FIPS
                candidate = parts[1] if len(parts) > 1 else ""
                if len(candidate) == 5 and candidate.isdigit():
                    index[candidate] = name
    return index


def parse_county_csv(zip_path: Path, zip_name: str) -> dict:
    """
    Parse a county CSV from inside the zip.
    Returns dict keyed by industry_code → {employment, avg_wkly_wage}

    Ownership strategy:
    - code '10' (total all): own_code='0' (Total Covered)
    - code '1028' (Public Admin): own_code='3' (local gov is best proxy)
    - all other sector codes: own_code='5' (private, has supersector breakout)
    """
    result = {}
    with zipfile.ZipFile(zip_path, "r") as zf:
        with zf.open(zip_name) as f:
            content = f.read().decode("utf-8", errors="replace")

    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        row = {k.strip().strip('"'): v.strip().strip('"') for k, v in row.items()}
        industry_code = row.get("industry_code", "").strip()
        own_code      = row.get("own_code", "").strip()

        if industry_code not in SECTOR_CODES:
            continue

        # Pick the right ownership layer per sector
        if industry_code == "10":
            target_own = "0"   # Total Covered
        elif industry_code == "1028":
            target_own = "3"   # Local government (best proxy for public admin)
        else:
            target_own = "5"   # Private (has all supersector breakouts)

        if own_code != target_own:
            continue

        disclosure = row.get("disclosure_code", "").strip()
        if disclosure == "N":
            continue

        empl_str = row.get("annual_avg_emplvl", "").strip()
        wage_str = row.get("annual_avg_wkly_wage", "").strip()

        try:
            empl = int(empl_str.replace(",", ""))
        except (ValueError, AttributeError):
            empl = None

        try:
            wage = int(wage_str.replace(",", ""))
        except (ValueError, AttributeError):
            wage = None

        if empl is not None and empl > 0:
            result[industry_code] = {"employment": empl, "avg_wkly_wage": wage}

    return result


def build_workforce_block(slug: str, fips: str, data_2024: dict, data_2019: dict | None) -> dict:
    total_row  = data_2024.get("10", {})
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
        pct  = round(empl / total_empl * 100, 1) if total_empl else None

        trend = None
        if data_2019:
            row_2019 = data_2019.get(code)
            if row_2019 and row_2019.get("employment", 0) > 0:
                empl_2019 = row_2019["employment"]
                trend = round((empl - empl_2019) / empl_2019 * 100, 1)

        sector = {
            "code": code,
            "label": label,
            "employment": empl,
            "avg_weekly_wage": wage,
            "pct_of_total": pct,
        }
        if trend is not None:
            sector["trend_5yr_pct"] = trend
        top_sectors.append(sector)

    top_sectors.sort(key=lambda x: x["employment"], reverse=True)
    top_sectors = top_sectors[:8]
    dominant = top_sectors[0]["label"] if top_sectors else None

    return {
        "county_fips": fips,
        "year": 2024,
        "source": "BLS QCEW 2024 Annual",
        "total_employment": total_empl,
        "top_sectors": top_sectors,
        "dominant_sector": dominant,
        "median_weekly_wage_all": median_wage,
    }


def main():
    print("=" * 70)
    print("BLS QCEW Workforce Data — using local ZIP files")
    print("=" * 70)

    if not ZIP_2024.exists():
        print(f"ERROR: {ZIP_2024} not found. Download it first.")
        return
    if not ZIP_2019.exists():
        print(f"ERROR: {ZIP_2019} not found. Download it first.")
        return

    print("Building FIPS indexes…", flush=True)
    idx_2024 = build_fips_index(ZIP_2024)
    idx_2019 = build_fips_index(ZIP_2019)
    print(f"  2024: {len(idx_2024)} counties")
    print(f"  2019: {len(idx_2019)} counties")

    # Cache parsed data per FIPS
    cache_2024 = {}
    cache_2019 = {}

    data_files = {f.stem: f for f in DATA_DIR.glob("*.json") if f.stem != "cities"}

    summary = []
    updated = 0
    skipped = 0

    for slug, fips in sorted(CITY_FIPS.items()):
        city_file = data_files.get(slug)
        if not city_file:
            print(f"  ⚠  No JSON file for {slug} — skipping")
            skipped += 1
            continue

        # 2024 data
        if fips not in cache_2024:
            zip_name = idx_2024.get(fips)
            if not zip_name:
                cache_2024[fips] = None
            else:
                cache_2024[fips] = parse_county_csv(ZIP_2024, zip_name)

        data_2024 = cache_2024[fips]
        if not data_2024:
            print(f"  ✗  {slug} ({fips}) — no 2024 data in ZIP")
            skipped += 1
            continue

        # 2019 data
        if fips not in cache_2019:
            zip_name_19 = idx_2019.get(fips)
            cache_2019[fips] = parse_county_csv(ZIP_2019, zip_name_19) if zip_name_19 else None

        data_2019 = cache_2019[fips]

        # Build block
        wf = build_workforce_block(slug, fips, data_2024, data_2019)

        # Update JSON
        d = json.loads(city_file.read_text())
        d["workforce"] = wf
        city_file.write_text(json.dumps(d, separators=(",", ":")))

        total_empl = wf.get("total_employment", 0)
        wage       = wf.get("median_weekly_wage_all", 0)
        dominant   = wf.get("dominant_sector", "?")
        dominant_str = dominant or "Unknown"
        print(f"  ✓  {slug:<30} {dominant_str:<36} {total_empl:>10,}  ${wage}/wk")
        updated += 1

        summary.append({
            "slug": slug,
            "county_fips": fips,
            "dominant_sector": dominant,
            "total_employment": total_empl,
            "median_weekly_wage": wage,
            "data_year": 2024,
        })

    # Write summary
    summary_file = SCRIPT_DIR / "workforce_summary.json"
    summary_file.write_text(json.dumps(summary, indent=2))
    print(f"\n✅ Wrote {summary_file}")
    print(f"\nUpdated: {updated}   Skipped: {skipped}")

    # Final summary table
    print(f"\n{'=' * 90}")
    print(f"{'City':<30} {'Dominant Sector':<38} {'Empl':>10} {'$/Wk':>7} {'Year':>5}")
    print("-" * 90)
    for row in sorted(summary, key=lambda x: x["slug"]):
        empl_str = f"{row['total_employment']:,}" if row['total_employment'] else "N/A"
        wage_str = f"${row['median_weekly_wage']}" if row['median_weekly_wage'] else "N/A"
        dom = row['dominant_sector'] or "Unknown"
        print(f"{row['slug']:<30} {dom:<38} {empl_str:>10} {wage_str:>7} {row['data_year']:>5}")

    print("\nWORKFORCE DATA COMPLETE")


if __name__ == "__main__":
    main()
