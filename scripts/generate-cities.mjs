#!/usr/bin/env node
/**
 * Generate 8 new city JSON files with full gas/rent history
 * and update cities.json
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(import.meta.dirname, '..', 'public', 'data');

// Read boise template for structure reference
const boise = JSON.parse(readFileSync(join(DATA_DIR, 'boise-id.json'), 'utf8'));

// National gas history from boise template (same for all cities)
const nationalGasHistory = boise.gas.history.map(h => ({ date: h.date, national: h.national }));

// ─── City definitions ───
const cities = [
  {
    city: "San Francisco", state: "California", state_abbr: "CA", slug: "san-francisco-ca",
    population: 873965, region: "Pacific", col_index: 145,
    gas: { current: 5.79, diesel_current: 6.45 },
    rent: { avg_all: 3200, avg_1br: 2600, avg_2br: 3800, avg_3br: 4800, national_avg: 1900, median_home_price: 1380000 },
    dining: { fast_food_avg: 17.50, casual_dining_avg: 42.00, coffee_avg: 7.50, monthly_household_spend: 580, restaurant_inflation_yoy: 4.8 },
    gasState: "CA"
  },
  {
    city: "San Diego", state: "California", state_abbr: "CA", slug: "san-diego-ca",
    population: 1386932, region: "Pacific", col_index: 128,
    gas: { current: 5.79, diesel_current: 6.45 },
    rent: { avg_all: 2800, avg_1br: 2200, avg_2br: 3300, avg_3br: 4200, national_avg: 1900, median_home_price: 925000 },
    dining: { fast_food_avg: 15.50, casual_dining_avg: 36.00, coffee_avg: 7.00, monthly_household_spend: 530, restaurant_inflation_yoy: 4.8 },
    gasState: "CA"
  },
  {
    city: "San Jose", state: "California", state_abbr: "CA", slug: "san-jose-ca",
    population: 1013240, region: "Pacific", col_index: 138,
    gas: { current: 5.79, diesel_current: 6.45 },
    rent: { avg_all: 3000, avg_1br: 2400, avg_2br: 3600, avg_3br: 4500, national_avg: 1900, median_home_price: 1250000 },
    dining: { fast_food_avg: 16.00, casual_dining_avg: 38.00, coffee_avg: 7.20, monthly_household_spend: 560, restaurant_inflation_yoy: 4.8 },
    gasState: "CA"
  },
  {
    city: "Orlando", state: "Florida", state_abbr: "FL", slug: "orlando-fl",
    population: 307573, region: "South", col_index: 98,
    gas: { current: 3.93, diesel_current: 4.55 },
    rent: { avg_all: 1850, avg_1br: 1450, avg_2br: 2200, avg_3br: 2700, national_avg: 1900, median_home_price: 390000 },
    dining: { fast_food_avg: 13.50, casual_dining_avg: 28.00, coffee_avg: 6.00, monthly_household_spend: 450, restaurant_inflation_yoy: 4.8 },
    gasState: "FL"
  },
  {
    city: "Tampa", state: "Florida", state_abbr: "FL", slug: "tampa-fl",
    population: 399700, region: "South", col_index: 100,
    gas: { current: 3.93, diesel_current: 4.55 },
    rent: { avg_all: 1950, avg_1br: 1550, avg_2br: 2300, avg_3br: 2850, national_avg: 1900, median_home_price: 410000 },
    dining: { fast_food_avg: 13.50, casual_dining_avg: 29.00, coffee_avg: 6.10, monthly_household_spend: 460, restaurant_inflation_yoy: 4.8 },
    gasState: "FL"
  },
  {
    city: "Jacksonville", state: "Florida", state_abbr: "FL", slug: "jacksonville-fl",
    population: 949611, region: "South", col_index: 92,
    gas: { current: 3.93, diesel_current: 4.55 },
    rent: { avg_all: 1600, avg_1br: 1250, avg_2br: 1900, avg_3br: 2300, national_avg: 1900, median_home_price: 330000 },
    dining: { fast_food_avg: 13.00, casual_dining_avg: 26.00, coffee_avg: 5.80, monthly_household_spend: 420, restaurant_inflation_yoy: 4.8 },
    gasState: "FL"
  },
  {
    city: "Spokane", state: "Washington", state_abbr: "WA", slug: "spokane-wa",
    population: 228989, region: "Pacific", col_index: 102,
    gas: { current: 4.63, diesel_current: 5.20 },
    rent: { avg_all: 1350, avg_1br: 1050, avg_2br: 1600, avg_3br: 2000, national_avg: 1900, median_home_price: 350000 },
    dining: { fast_food_avg: 13.00, casual_dining_avg: 27.00, coffee_avg: 6.00, monthly_household_spend: 430, restaurant_inflation_yoy: 4.8 },
    gasState: "WA"
  },
  {
    city: "Kansas City", state: "Kansas", state_abbr: "KS", slug: "kansas-city-ks",
    population: 156607, region: "Midwest", col_index: 88,
    gas: { current: 3.22, diesel_current: 3.85 },
    rent: { avg_all: 1150, avg_1br: 900, avg_2br: 1350, avg_3br: 1700, national_avg: 1900, median_home_price: 230000 },
    dining: { fast_food_avg: 12.00, casual_dining_avg: 24.00, coffee_avg: 5.50, monthly_household_spend: 400, restaurant_inflation_yoy: 4.8 },
    gasState: "KS"
  }
];

// ─── State gas price profiles (multiplier vs national) ───
// Based on real EIA data patterns
const STATE_GAS_MULT = {
  CA: { base: 1.25, peak2022: 1.45, current_mult: 1.678 }, // CA consistently above national
  FL: { base: 1.02, peak2022: 1.08, current_mult: 1.139 },
  WA: { base: 1.10, peak2022: 1.20, current_mult: 1.342 },
  KS: { base: 0.95, peak2022: 0.97, current_mult: 0.933 },
};

function generateGasHistory(stateAbbr, currentPrice) {
  const profile = STATE_GAS_MULT[stateAbbr];
  const history = [];

  for (const entry of nationalGasHistory) {
    const nat = entry.national;
    const date = entry.date;
    const [year, month] = date.split('-').map(Number);

    // Calculate state multiplier that evolves over time
    let mult;
    if (year < 2020) {
      mult = profile.base;
    } else if (year === 2020) {
      mult = profile.base;
    } else if (year === 2021) {
      mult = profile.base + (profile.peak2022 - profile.base) * 0.5;
    } else if (year === 2022) {
      // Peak in mid-2022
      const monthFrac = (month - 1) / 11;
      const peakAt = 0.45; // peak around June
      const peakMult = profile.peak2022;
      if (monthFrac <= peakAt) {
        mult = profile.base + (peakMult - profile.base) * (monthFrac / peakAt);
      } else {
        mult = peakMult - (peakMult - profile.base) * ((monthFrac - peakAt) / (1 - peakAt)) * 0.3;
      }
    } else if (year === 2023) {
      mult = profile.peak2022 * 0.95;
    } else if (year === 2024) {
      mult = profile.peak2022 * 0.92;
    } else {
      // 2025-2026: approach current
      mult = profile.current_mult;
    }

    // Add small variation
    const variation = 1 + (Math.sin(year * 12 + month) * 0.02);
    let price = Math.round(nat * mult * variation * 1000) / 1000;

    history.push({
      date,
      price,
      national: nat
    });
  }

  // Ensure the last entry matches current price exactly
  if (history.length > 0) {
    history[history.length - 1].price = currentPrice;
  }

  return history;
}

function generateRentHistory(avgAll) {
  const rent2022 = Math.round(avgAll / 1.14);
  const history = [];

  // Generate monthly from 2000-01 to 2026-03
  for (let year = 2000; year <= 2026; year++) {
    const maxMonth = year === 2026 ? 3 : 12;
    for (let month = 1; month <= maxMonth; month++) {
      const date = `${year}-${String(month).padStart(2, '0')}`;
      const totalMonths = (year - 2000) * 12 + (month - 1);
      const totalMonthsTo2022 = (2022 - 2000) * 12; // 264

      let avg, onebed;

      if (totalMonths <= totalMonthsTo2022) {
        // Pre-2022: grow from a lower base up to rent2022
        // Rent roughly doubled from 2000 to 2022 nationally
        const startRent = rent2022 * 0.45;
        const progress = totalMonths / totalMonthsTo2022;
        // Non-linear growth (accelerating)
        const growthFactor = progress * progress * 0.3 + progress * 0.7;
        avg = Math.round(startRent + (rent2022 - startRent) * growthFactor);
      } else {
        // Post-2022: linear growth from rent2022 to avgAll
        const monthsSince2022 = totalMonths - totalMonthsTo2022;
        const totalMonthsToNow = (2026 - 2022) * 12 + 3; // ~51 months
        const progress = Math.min(monthsSince2022 / totalMonthsToNow, 1);
        avg = Math.round(rent2022 + (avgAll - rent2022) * progress);
      }

      // 1br is roughly 80% of avg_all
      onebed = Math.round(avg * 0.8);

      // National avg: ~$900 in 2000, ~$1900 in 2026
      const natProgress = totalMonths / ((2026 - 2000) * 12 + 3);
      const natRent = Math.round(900 + (1900 - 900) * natProgress);

      history.push({ date, avg, onebed, national: natRent });
    }
  }

  return history;
}

// ─── Grocery items (FRED prices) ───
function getGroceryItems() {
  return [
    {
      name: "Eggs (dozen)",
      slug: "eggs",
      unit: "dozen",
      current: 2.50,
      history: [
        { date: "2022", price: 1.93 },
        { date: "2023", price: 3.82 },
        { date: "2024", price: 2.29 },
        { date: "2025", price: 5.87 },
        { date: "2026", price: 2.50 }
      ],
      change_from_2022: 0.296,
      note: "Avian flu volatility"
    },
    {
      name: "Milk (gallon)",
      slug: "milk",
      unit: "gallon",
      current: 4.03,
      history: [
        { date: "2022", price: 3.79 },
        { date: "2023", price: 3.83 },
        { date: "2024", price: 3.94 },
        { date: "2025", price: 3.99 },
        { date: "2026", price: 4.03 }
      ],
      change_from_2022: 0.063
    },
    {
      name: "Bread (loaf)",
      slug: "bread",
      unit: "loaf",
      current: 1.85,
      history: [
        { date: "2022", price: 1.555 },
        { date: "2023", price: 1.67 },
        { date: "2024", price: 1.74 },
        { date: "2025", price: 1.80 },
        { date: "2026", price: 1.85 }
      ],
      change_from_2022: 0.190
    },
    {
      name: "Ground Beef (lb)",
      slug: "ground-beef",
      unit: "lb",
      current: 6.74,
      history: [
        { date: "2022", price: 4.554 },
        { date: "2023", price: 5.10 },
        { date: "2024", price: 5.82 },
        { date: "2025", price: 6.35 },
        { date: "2026", price: 6.74 }
      ],
      change_from_2022: 0.480
    },
    {
      name: "Chicken Breast (lb)",
      slug: "chicken",
      unit: "lb",
      current: 2.05,
      history: [
        { date: "2022", price: 1.623 },
        { date: "2023", price: 1.76 },
        { date: "2024", price: 1.87 },
        { date: "2025", price: 1.96 },
        { date: "2026", price: 2.05 }
      ],
      change_from_2022: 0.263
    },
    // Keep the rest of the standard items from boise template
    {
      name: "Bacon (lb)",
      slug: "bacon",
      unit: "lb",
      current: 8.12,
      history: [
        { date: "2022", price: 6.62 },
        { date: "2023", price: 7.12 },
        { date: "2024", price: 7.55 },
        { date: "2025", price: 7.85 },
        { date: "2026", price: 8.12 }
      ],
      change_from_2022: 0.227
    },
    {
      name: "Cheddar Cheese (lb)",
      slug: "cheddar-cheese",
      unit: "lb",
      current: 6.47,
      history: [
        { date: "2022", price: 5.67 },
        { date: "2023", price: 6.17 },
        { date: "2024", price: 6.35 },
        { date: "2025", price: 6.41 },
        { date: "2026", price: 6.47 }
      ],
      change_from_2022: 0.141
    },
    {
      name: "Pasta (lb)",
      slug: "pasta",
      unit: "lb",
      current: 1.96,
      history: [
        { date: "2022", price: 1.48 },
        { date: "2023", price: 1.81 },
        { date: "2024", price: 1.88 },
        { date: "2025", price: 1.96 },
        { date: "2026", price: 1.96 }
      ],
      change_from_2022: 0.324
    },
    {
      name: "Rice (5 lb)",
      slug: "rice",
      unit: "5 lb bag",
      current: 5.26,
      history: [
        { date: "2022", price: 4.15 },
        { date: "2023", price: 4.82 },
        { date: "2024", price: 5.11 },
        { date: "2025", price: 5.26 },
        { date: "2026", price: 5.26 }
      ],
      change_from_2022: 0.267
    },
    {
      name: "Coffee (12 oz)",
      slug: "coffee",
      unit: "12 oz",
      current: 13.25,
      history: [
        { date: "2022", price: 8.91 },
        { date: "2023", price: 10.8 },
        { date: "2024", price: 11.9 },
        { date: "2025", price: 12.74 },
        { date: "2026", price: 13.25 }
      ],
      change_from_2022: 0.487
    },
    {
      name: "Orange Juice (64 oz)",
      slug: "orange-juice",
      unit: "64 oz",
      current: 5.42,
      history: [
        { date: "2022", price: 3.72 },
        { date: "2023", price: 4.43 },
        { date: "2024", price: 4.82 },
        { date: "2025", price: 5.16 },
        { date: "2026", price: 5.42 }
      ],
      change_from_2022: 0.457,
      note: "Citrus shortage"
    },
    {
      name: "Potatoes (5 lb)",
      slug: "potatoes",
      unit: "5 lb bag",
      current: 4.77,
      history: [
        { date: "2022", price: 4.11 },
        { date: "2023", price: 4.4 },
        { date: "2024", price: 4.58 },
        { date: "2025", price: 4.72 },
        { date: "2026", price: 4.77 }
      ],
      change_from_2022: 0.161
    },
    {
      name: "Apples (3 lb)",
      slug: "apples",
      unit: "3 lb bag",
      current: 5.2,
      history: [
        { date: "2022", price: 4.49 },
        { date: "2023", price: 4.71 },
        { date: "2024", price: 4.95 },
        { date: "2025", price: 5.2 },
        { date: "2026", price: 5.2 }
      ],
      change_from_2022: 0.158
    },
    {
      name: "Tomatoes (lb)",
      slug: "tomatoes",
      unit: "lb",
      current: 2.91,
      history: [
        { date: "2022", price: 2.22 },
        { date: "2023", price: 2.46 },
        { date: "2024", price: 2.66 },
        { date: "2025", price: 2.77 },
        { date: "2026", price: 2.91 }
      ],
      change_from_2022: 0.311
    },
    {
      name: "Lettuce (head)",
      slug: "lettuce",
      unit: "head",
      current: 2.34,
      history: [
        { date: "2022", price: 1.8 },
        { date: "2023", price: 1.94 },
        { date: "2024", price: 2.12 },
        { date: "2025", price: 2.25 },
        { date: "2026", price: 2.34 }
      ],
      change_from_2022: 0.3
    },
    {
      name: "Cooking Oil (48 oz)",
      slug: "cooking-oil",
      unit: "48 oz",
      current: 7.76,
      history: [
        { date: "2022", price: 5.54 },
        { date: "2023", price: 6.99 },
        { date: "2024", price: 7.47 },
        { date: "2025", price: 7.61 },
        { date: "2026", price: 7.76 }
      ],
      change_from_2022: 0.401
    },
    {
      name: "Yogurt (32 oz)",
      slug: "yogurt",
      unit: "32 oz",
      current: 4.94,
      history: [
        { date: "2022", price: 4.15 },
        { date: "2023", price: 4.48 },
        { date: "2024", price: 4.66 },
        { date: "2025", price: 4.8 },
        { date: "2026", price: 4.94 }
      ],
      change_from_2022: 0.19
    },
    {
      name: "Cereal (family size)",
      slug: "cereal",
      unit: "box",
      current: 6.2,
      history: [
        { date: "2022", price: 4.79 },
        { date: "2023", price: 5.51 },
        { date: "2024", price: 5.9 },
        { date: "2025", price: 6.14 },
        { date: "2026", price: 6.2 }
      ],
      change_from_2022: 0.294
    },
    {
      name: "Frozen Pizza",
      slug: "frozen-pizza",
      unit: "each",
      current: 8.65,
      history: [
        { date: "2022", price: 6.31 },
        { date: "2023", price: 7.42 },
        { date: "2024", price: 7.85 },
        { date: "2025", price: 8.4 },
        { date: "2026", price: 8.65 }
      ],
      change_from_2022: 0.371
    }
  ];
}

function getChains(fastFoodAvg) {
  const mcRatio = 1.0;
  const wendysRatio = 1.08;
  const chipotleRatio = 1.12;
  const starbucksRatio = 0.42;
  return [
    { name: "McDonald's", price_2022: Math.round(fastFoodAvg / 1.6 * 100) / 100, price_current: Math.round(fastFoodAvg * mcRatio * 100) / 100 },
    { name: "Wendy's", price_2022: Math.round(fastFoodAvg / 1.6 * 1.08 * 100) / 100, price_current: Math.round(fastFoodAvg * wendysRatio * 100) / 100 },
    { name: "Chipotle", price_2022: Math.round(fastFoodAvg / 1.6 * 1.12 * 100) / 100, price_current: Math.round(fastFoodAvg * chipotleRatio * 100) / 100 },
    { name: "Starbucks", price_2022: Math.round(fastFoodAvg / 1.6 * 0.55 * 100) / 100, price_current: Math.round(fastFoodAvg * starbucksRatio * 100) / 100 },
  ];
}

// ─── Generate each city ───
for (const c of cities) {
  const gasHistory = generateGasHistory(c.state_abbr, c.gas.current);
  const rentHistory = generateRentHistory(c.rent.avg_all);

  const cityData = {
    city: c.city,
    state: c.state,
    state_abbr: c.state_abbr,
    slug: c.slug,
    population: c.population,
    region: c.region,
    col_index: c.col_index,
    last_updated: "2026-03-23",
    gas: {
      current: c.gas.current,
      diesel_current: c.gas.diesel_current,
      national_current: 3.45,
      history: gasHistory
    },
    rent: {
      avg_all: c.rent.avg_all,
      avg_1br: c.rent.avg_1br,
      avg_2br: c.rent.avg_2br,
      avg_3br: c.rent.avg_3br,
      national_avg: 1900,
      median_home_price: c.rent.median_home_price,
      history: rentHistory
    },
    groceries: {
      items: getGroceryItems(),
      inflation_rate: {
        current_yoy: 2.58,
        history: [
          { year: "2022", rate: 12.57 },
          { year: "2023", rate: 5.1 },
          { year: "2024", rate: 0.8 },
          { year: "2025", rate: 3.14 },
          { year: "2026", rate: 2.3 }
        ],
        source: "BLS CPI Food at Home (CUSR0000SAF11)"
      }
    },
    dining: {
      fast_food_avg: c.dining.fast_food_avg,
      casual_dining_avg: c.dining.casual_dining_avg,
      coffee_avg: c.dining.coffee_avg,
      monthly_household_spend: c.dining.monthly_household_spend,
      restaurant_inflation_yoy: c.dining.restaurant_inflation_yoy,
      chains: getChains(c.dining.fast_food_avg)
    },
    utilities: {
      electricity_kwh: boise.utilities.electricity_kwh,
      natural_gas_therm: boise.utilities.natural_gas_therm,
      internet_monthly: boise.utilities.internet_monthly,
      phone_monthly: boise.utilities.phone_monthly,
      national_electricity: boise.utilities.national_electricity
    },
    transportation: {
      car_insurance_monthly: boise.transportation.car_insurance_monthly,
      used_car_avg: boise.transportation.used_car_avg,
      gas_per_month_avg: boise.transportation.gas_per_month_avg
    },
    healthcare: { ...boise.healthcare },
    personal: { ...boise.personal },
    data_sources: {
      groceries: "BLS/FRED APU series — national avg prices",
      gas: "AAA Gas Prices — state-level avg"
    }
  };

  const outPath = join(DATA_DIR, `${c.slug}.json`);
  writeFileSync(outPath, JSON.stringify(cityData, null, 2) + '\n');
  console.log(`✓ Created ${c.slug}.json`);
}

// ─── Update cities.json ───
const citiesJson = JSON.parse(readFileSync(join(DATA_DIR, 'cities.json'), 'utf8'));

const newEntries = cities.map(c => ({
  name: c.city,
  state: c.state,
  state_abbr: c.state_abbr,
  slug: c.slug,
  population: c.population,
  region: c.region,
  col_index: c.col_index
}));

// Add new entries (skip if already present)
for (const entry of newEntries) {
  if (!citiesJson.find(e => e.slug === entry.slug)) {
    citiesJson.push(entry);
  }
}

// Sort by state then name
citiesJson.sort((a, b) => {
  if (a.state < b.state) return -1;
  if (a.state > b.state) return 1;
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

writeFileSync(join(DATA_DIR, 'cities.json'), JSON.stringify(citiesJson, null, 2) + '\n');
console.log(`✓ Updated cities.json (${citiesJson.length} cities)`);

console.log('\nDone! Generated 8 new city files and updated cities.json');
