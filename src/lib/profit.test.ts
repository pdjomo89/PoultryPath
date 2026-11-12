import { describe, expect, it } from 'vitest';
import { BROILER_DEFAULTS, LAYER_DEFAULTS, calcBroilers, calcLayers } from './profit';

describe('calcBroilers', () => {
  it('computes revenue, cost and profit for a simple cycle', () => {
    const r = calcBroilers({
      birds: 100,
      chickCost: 1,
      feedPerBirdKg: 4,
      feedPricePerKg: 0.5,
      healthCostPerBird: 0.2,
      otherCostsPerCycle: 50,
      mortalityPct: 10,
      liveWeightKg: 2,
      pricePerKg: 2,
      cycleWeeks: 8,
    });
    // cost: 100 + 200 + 20 + 50 = 370; revenue: 90 birds * 2kg * 2 = 360
    expect(r.totalCost).toBeCloseTo(370);
    expect(r.revenue).toBeCloseTo(360);
    expect(r.profit).toBeCloseTo(-10);
    expect(r.unitsSold).toBeCloseTo(90);
    expect(r.breakEvenPrice).toBeCloseTo(370 / 180);
  });

  it('break-even price yields zero profit', () => {
    const base = calcBroilers(BROILER_DEFAULTS);
    const atBreakEven = calcBroilers({ ...BROILER_DEFAULTS, pricePerKg: base.breakEvenPrice });
    expect(atBreakEven.profit).toBeCloseTo(0, 6);
  });

  it('handles zero / invalid inputs without NaN', () => {
    const r = calcBroilers({ ...BROILER_DEFAULTS, birds: 0, mortalityPct: 150 });
    expect(Number.isNaN(r.marginPct)).toBe(false);
    expect(r.costPerUnit).toBe(0);
  });
});

describe('calcLayers', () => {
  it('break-even tray price yields zero profit', () => {
    const base = calcLayers(LAYER_DEFAULTS);
    const atBreakEven = calcLayers({ ...LAYER_DEFAULTS, pricePerTray: base.breakEvenPrice });
    expect(atBreakEven.profit).toBeCloseTo(0, 6);
  });

  it('higher lay rate increases profit', () => {
    const low = calcLayers({ ...LAYER_DEFAULTS, layRatePct: 70 });
    const high = calcLayers({ ...LAYER_DEFAULTS, layRatePct: 90 });
    expect(high.profit).toBeGreaterThan(low.profit);
  });
});
