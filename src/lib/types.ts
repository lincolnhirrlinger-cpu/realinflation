export interface GasHistory {
  date: string
  price: number
  national: number
}

export interface RentHistory {
  date: string
  avg: number
  onebed: number
  national: number
}

export interface GroceryItem {
  name: string
  slug: string
  current: number
  history: Array<{ date: string; price: number }>
  change_from_2022: number
  note?: string
}

export interface ChainPrice {
  name: string
  price_2022: number
  price_current: number
}

export interface CityData {
  city: string
  state: string
  slug: string
  population: number
  region: string
  col_index: number
  last_updated: string
  gas: {
    current: number
    national_current: number
    history: GasHistory[]
  }
  rent: {
    avg_all: number
    avg_1br: number
    avg_2br: number
    national_avg: number
    history: RentHistory[]
  }
  groceries: {
    items: GroceryItem[]
    inflation_rate: {
      current_yoy: number
      history: Array<{ year: string; rate: number }>
    }
  }
  dining: {
    fast_food_avg: number
    casual_dining_avg: number
    monthly_household_spend: number
    restaurant_inflation_yoy: number
    chains: ChainPrice[]
  }
}

export interface CityMeta {
  name: string
  state: string
  slug: string
  population: number
  region: string
}
