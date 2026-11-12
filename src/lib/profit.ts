/**
 * Poultry profitability models. Pure functions so they can be unit-tested
 * and reused (e.g. on a future backend or in PDF reports).
 */

export interface BroilerInputs {
  birds: number;              // chicks placed per cycle
  chickCost: number;          // price per day-old chick
  feedPerBirdKg: number;      // total feed consumed per bird over the cycle
  feedPricePerKg: number;
  healthCostPerBird: number;  // vaccines, medication, vitamins
  otherCostsPerCycle: number; // labour, litter, energy, transport, rent
  mortalityPct: number;       // 0-100
  liveWeightKg: number;       // average live weight at sale
  pricePerKg: number;         // selling price per kg live weight
  cycleWeeks: number;         // grow-out + cleaning/downtime
}

export interface LayerInputs {
  birds: number;                 // hens housed at point of lay
  pulletCost: number;            // price per point-of-lay pullet
  feedPerBirdPerDayG: number;    // grams of feed per hen per day
  feedPricePerKg: number;
  layRatePct: number;            // average hen-day production, 0-100
  pricePerTray: number;          // tray of 30 eggs
  healthCostPerBird: number;     // over the whole laying period
  otherCostsPerMonth: number;    // labour, packaging, energy, rent
  mortalityPct: number;          // over the whole laying period, 0-100
  layingMonths: number;          // length of the laying period
  spentHenPrice: number;         // salvage value per hen at end of lay
}

/** Cost categories; display names live in the i18n messages (calculator.costs). */
export type CostKey = 'chicks' | 'pullets' | 'feed' | 'health' | 'overheads';

export interface CostLine {
  key: CostKey;
  amount: number;
}

export interface ProfitResult {
  revenue: number;
  totalCost: number;
  profit: number;
  marginPct: number;           // profit / revenue
  roiPct: number;              // profit / totalCost
  costs: CostLine[];
  /** Units sold: birds for broilers, trays for layers. */
  unitsSold: number;
  unit: 'birds' | 'trays';
  costPerUnit: number;
  /** Selling price at which profit is exactly zero (per kg or per tray). */
  breakEvenPrice: number;
  breakEvenUnit: 'kg' | 'tray';
  /** Profit per month — makes broiler cycles and layer flocks comparable. */
  monthlyProfit: number;
}

const DAYS_PER_MONTH = 30.4;
const EGGS_PER_TRAY = 30;

const clampPct = (v: number) => Math.min(Math.max(v, 0), 100) / 100;
const nonNeg = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

function summarize(
  revenue: number,
  costs: CostLine[],
  extra: Omit<ProfitResult, 'revenue' | 'totalCost' | 'profit' | 'marginPct' | 'roiPct' | 'costs' | 'monthlyProfit'>,
  months: number,
): ProfitResult {
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const profit = revenue - totalCost;
  return {
    revenue,
    totalCost,
    profit,
    marginPct: safeDiv(profit, revenue) * 100,
    roiPct: safeDiv(profit, totalCost) * 100,
    costs,
    monthlyProfit: safeDiv(profit, months),
    ...extra,
  };
}

export function calcBroilers(input: BroilerInputs): ProfitResult {
  const birds = nonNeg(input.birds);
  const survivors = birds * (1 - clampPct(input.mortalityPct));
  const kgSold = survivors * nonNeg(input.liveWeightKg);

  const costs: CostLine[] = [
    { key: 'chicks', amount: birds * nonNeg(input.chickCost) },
    { key: 'feed', amount: birds * nonNeg(input.feedPerBirdKg) * nonNeg(input.feedPricePerKg) },
    { key: 'health', amount: birds * nonNeg(input.healthCostPerBird) },
    { key: 'overheads', amount: nonNeg(input.otherCostsPerCycle) },
  ];
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const revenue = kgSold * nonNeg(input.pricePerKg);

  return summarize(
    revenue,
    costs,
    {
      unitsSold: survivors,
      unit: 'birds',
      costPerUnit: safeDiv(totalCost, survivors),
      breakEvenPrice: safeDiv(totalCost, kgSold),
      breakEvenUnit: 'kg',
    },
    (nonNeg(input.cycleWeeks) * 7) / DAYS_PER_MONTH,
  );
}

export function calcLayers(input: LayerInputs): ProfitResult {
  const birds = nonNeg(input.birds);
  const months = nonNeg(input.layingMonths);
  const days = months * DAYS_PER_MONTH;
  const mortality = clampPct(input.mortalityPct);

  // Assume mortality is spread evenly over the period, so the average
  // flock size is halfway between the start and end headcount.
  const avgHens = birds * (1 - mortality / 2);
  const endHens = birds * (1 - mortality);

  const eggs = avgHens * days * clampPct(input.layRatePct);
  const trays = eggs / EGGS_PER_TRAY;
  const feedKg = (avgHens * days * nonNeg(input.feedPerBirdPerDayG)) / 1000;

  const costs: CostLine[] = [
    { key: 'pullets', amount: birds * nonNeg(input.pulletCost) },
    { key: 'feed', amount: feedKg * nonNeg(input.feedPricePerKg) },
    { key: 'health', amount: birds * nonNeg(input.healthCostPerBird) },
    { key: 'overheads', amount: nonNeg(input.otherCostsPerMonth) * months },
  ];
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);
  const spentHenRevenue = endHens * nonNeg(input.spentHenPrice);
  const revenue = trays * nonNeg(input.pricePerTray) + spentHenRevenue;

  return summarize(
    revenue,
    costs,
    {
      unitsSold: trays,
      unit: 'trays',
      costPerUnit: safeDiv(totalCost, trays),
      // Spent-hen sales offset part of the cost the eggs must cover.
      breakEvenPrice: safeDiv(Math.max(totalCost - spentHenRevenue, 0), trays),
      breakEvenUnit: 'tray',
    },
    months,
  );
}

export const BROILER_DEFAULTS: BroilerInputs = {
  birds: 1000,
  chickCost: 0.75,
  feedPerBirdKg: 4.2,
  feedPricePerKg: 0.55,
  healthCostPerBird: 0.15,
  otherCostsPerCycle: 450,
  mortalityPct: 5,
  liveWeightKg: 2.4,
  pricePerKg: 1.9,
  cycleWeeks: 8,
};

export const LAYER_DEFAULTS: LayerInputs = {
  birds: 1000,
  pulletCost: 6,
  feedPerBirdPerDayG: 115,
  feedPricePerKg: 0.5,
  layRatePct: 82,
  pricePerTray: 3.6,
  healthCostPerBird: 0.8,
  otherCostsPerMonth: 400,
  mortalityPct: 8,
  layingMonths: 14,
  spentHenPrice: 2.5,
};
