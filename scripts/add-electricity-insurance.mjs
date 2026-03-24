#!/usr/bin/env node
/**
 * Add electricity and car_insurance fields to ALL city JSON files
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(import.meta.dirname, '..', 'public', 'data');

const STATE_ELECTRICITY_CENTS = {
  AL:13.5,AK:24.1,AZ:13.8,AR:11.8,CA:30.5,CO:14.3,CT:28.4,DE:14.8,FL:14.2,
  GA:13.2,HI:43.6,ID:10.4,IL:15.8,IN:14.2,IA:11.9,KS:13.5,KY:11.8,LA:11.7,
  ME:24.8,MD:16.2,MA:27.4,MI:18.4,MN:14.8,MS:12.7,MO:12.8,MT:11.9,NE:11.4,
  NV:13.0,NH:25.8,NJ:18.6,NM:14.2,NY:21.8,NC:13.2,ND:11.5,OH:14.8,OK:11.4,
  OR:12.8,PA:16.4,RI:24.8,SC:13.8,SD:12.0,TN:12.8,TX:14.2,UT:11.8,VT:21.4,
  VA:13.8,WA:10.8,WV:12.8,WI:17.4,WY:11.4,DC:16.8
};

const STATE_INSURANCE_ANNUAL = {
  AL:2180,AK:1850,AZ:2420,AR:2080,CA:2520,CO:2680,CT:1980,DE:2320,FL:3180,
  GA:2480,HI:1320,ID:1450,IL:1980,IN:1780,IA:1420,KS:2080,KY:2280,LA:3480,
  ME:1180,MD:2480,MA:1980,MI:2980,MN:1880,MS:2280,MO:1980,MT:1980,NE:1780,
  NV:2880,NH:1380,NJ:2580,NM:1980,NY:2980,NC:1680,ND:1580,OH:1580,OK:2280,
  OR:1780,PA:2180,RI:2380,SC:2180,SD:1780,TN:2080,TX:2880,UT:1980,VT:1380,
  VA:1880,WA:1780,WV:1680,WI:1580,WY:1780,DC:2580
};

const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'cities.json' && f !== 'national.json');

let count = 0;
for (const file of files) {
  const filePath = join(DATA_DIR, file);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));

  const stateAbbr = data.state_abbr;
  if (!stateAbbr) {
    console.warn(`⚠ Skipping ${file} — no state_abbr`);
    continue;
  }

  const elecCents = STATE_ELECTRICITY_CENTS[stateAbbr];
  const insAnnual = STATE_INSURANCE_ANNUAL[stateAbbr];

  if (elecCents == null || insAnnual == null) {
    console.warn(`⚠ Skipping ${file} — no data for state ${stateAbbr}`);
    continue;
  }

  data.electricity = {
    cents_per_kwh: elecCents,
    monthly_avg_bill: Math.round(elecCents * 900 / 100 * 100) / 100,
    national_avg_cents: 16.2,
    national_avg_bill: 145.80,
    source: "EIA Residential Electric Power (2025)"
  };

  data.car_insurance = {
    annual_avg: insAnnual,
    monthly_avg: Math.round(insAnnual / 12 * 100) / 100,
    national_avg_annual: 2150,
    source: "Bankrate/NAIC state avg full coverage (2025)"
  };

  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  count++;
}

console.log(`✓ Added electricity + car_insurance to ${count} city files`);
