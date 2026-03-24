export interface GroceryItem {
  name: string
  slug: string
  current: number
  history: { date: string; price: number }[]
  change_from_2022: number
  note?: string
  unit: string
}

export interface ElectricityData {
  cents_per_kwh: number
  monthly_avg_bill: number
  avg_monthly_bill?: number
  national_avg_cents: number
  national_avg_rate?: number
  national_avg_bill: number
  source: string
}

export interface CarInsuranceData {
  annual_avg: number
  monthly_avg: number
  national_avg_annual: number
  source: string
}

export interface CityData {
  city: string
  state: string
  state_abbr: string
  slug: string
  population: number
  region: string
  col_index: number
  last_updated: string
  gas: {
    current: number
    diesel_current: number
    national_current: number
    history: { date: string; price: number; national: number }[]
  }
  rent: {
    avg_all: number
    avg_1br: number
    avg_2br: number
    avg_3br: number
    national_avg: number
    median_home_price: number
    history: { date: string; avg: number; onebed: number; national: number }[]
  }
  groceries: {
    items: GroceryItem[]
    inflation_rate: {
      current_yoy: number
      history: { year: string; rate: number }[]
    }
  }
  dining: {
    fast_food_avg: number
    casual_dining_avg: number
    coffee_avg: number
    monthly_household_spend: number
    restaurant_inflation_yoy: number
    chains: { name: string; price_2022: number; price_current: number }[]
  }
  utilities: {
    electricity_kwh: number
    natural_gas_therm: number
    internet_monthly: number
    phone_monthly: number
    national_electricity: number
  }
  transportation: {
    car_insurance_monthly: number
    used_car_avg: number
    gas_per_month_avg: number
  }
  healthcare: {
    doctor_visit: number
    prescription_generic: number
    dental_cleaning: number
  }
  personal: {
    haircut_mens: number
    gym_membership: number
    movie_ticket: number
  }
  electricity?: ElectricityData
  car_insurance?: CarInsuranceData
}

export interface CityMeta {
  name: string
  state: string
  state_abbr: string
  slug: string
  population: number
  region: string
  col_index: number
}
