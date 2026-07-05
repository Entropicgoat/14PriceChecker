import { describe, it, expect } from 'vitest';

import {
  cheapestSinglePurchase,
  cheapestPurchase,
  cheapestSingleWorldPurchase,
  cheapestCombinedPurchase,
} from './prices';
import { universalisListing } from '../types/universalis';


const listing = (overrides: Partial<universalisListing>): universalisListing => ({
  creatorID: null,
  creatorName: '',
  hq: false,
  isCrafted: false,
  lastReviewTime: 0,
  listingID: '',
  materia: [],
  onMannequin: false,
  pricePerUnit: 100,
  quantity: 1,
  retainerCity: 0,
  retainerID: '',
  retainerName: '',
  sellerID: null,
  stainID: 0,
  tax: 0,
  total: 100,
  worldID: 0,
  worldName: 'Odin',
  ...overrides,
});

describe('cheapestSinglePurchase', () => {
  it('ignores listings with less than the requested quantity', () => {
    const prices = [
      listing({ quantity: 2, pricePerUnit: 1 }),
      listing({ quantity: 5, pricePerUnit: 50 }),
    ];
    expect(cheapestSinglePurchase(prices, '5')?.pricePerUnit).toBe(50);
  });

  it('picks the listing with the lowest total price among sufficient quantities', () => {
    const prices = [
      listing({ quantity: 5, pricePerUnit: 20 }),  // total 100
      listing({ quantity: 5, pricePerUnit: 10 }),  // total 50
      listing({ quantity: 6, pricePerUnit: 15 }),  // total 90
    ];
    expect(cheapestSinglePurchase(prices, '5')?.pricePerUnit).toBe(10);
  });

  it('returns undefined when no listing has enough quantity', () => {
    const prices = [listing({ quantity: 3 })];
    expect(cheapestSinglePurchase(prices, '10')).toBeUndefined();
  });

  it('returns undefined for invalid or non-positive quantities', () => {
    const prices = [listing({ quantity: 5 })];
    expect(cheapestSinglePurchase(prices, 'abc')).toBeUndefined();
    expect(cheapestSinglePurchase(prices, '0')).toBeUndefined();
  });
});

describe('cheapestPurchase', () => {
  it('combines small stacks when that beats any single listing', () => {
    const prices = [
      listing({ quantity: 3, pricePerUnit: 2 }),  // 6
      listing({ quantity: 3, pricePerUnit: 2 }),  // 6
      listing({ quantity: 6, pricePerUnit: 3 }),  // 18
    ];
    const plan = cheapestPurchase(prices, '6');
    expect(plan?.totalCost).toBe(12);
    expect(plan?.totalQuantity).toBe(6);
    expect(plan?.listings).toHaveLength(2);
  });

  it('beats greedy per-unit picking (whole stacks must be bought)', () => {
    // Greedy by price-per-unit takes 9@1 then 10@2 = 29 gil for 19 items.
    // Optimal is the single 10@2 stack: 20 gil.
    const prices = [
      listing({ quantity: 9, pricePerUnit: 1 }),
      listing({ quantity: 10, pricePerUnit: 2 }),
      listing({ quantity: 9, pricePerUnit: 3 }),
    ];
    const plan = cheapestPurchase(prices, '10');
    expect(plan?.totalCost).toBe(20);
    expect(plan?.listings).toHaveLength(1);
  });

  it('allows overbuying when whole stacks overshoot the quantity', () => {
    const prices = [
      listing({ quantity: 3, pricePerUnit: 1 }),  // 3
      listing({ quantity: 3, pricePerUnit: 1 }),  // 3
      listing({ quantity: 5, pricePerUnit: 2 }),  // 10
    ];
    const plan = cheapestPurchase(prices, '5');
    expect(plan?.totalCost).toBe(6);
    expect(plan?.totalQuantity).toBe(6);
  });

  it('returns undefined when total available quantity is insufficient', () => {
    const prices = [listing({ quantity: 3 }), listing({ quantity: 4 })];
    expect(cheapestPurchase(prices, '10')).toBeUndefined();
  });

  it('returns undefined for invalid or non-positive quantities and empty input', () => {
    expect(cheapestPurchase([listing({})], 'abc')).toBeUndefined();
    expect(cheapestPurchase([listing({})], '-1')).toBeUndefined();
    expect(cheapestPurchase([], '5')).toBeUndefined();
  });
});

describe('cheapestSingleWorldPurchase', () => {
  it('picks the world with the cheapest total, combining listings within it', () => {
    const prices = [
      listing({ worldName: 'Odin', quantity: 3, pricePerUnit: 2 }),   // 6
      listing({ worldName: 'Odin', quantity: 3, pricePerUnit: 2 }),   // 6  -> Odin: 12
      listing({ worldName: 'Shiva', quantity: 6, pricePerUnit: 1 }),  //    -> Shiva: 6
    ];
    const plan = cheapestSingleWorldPurchase(prices, '6');
    expect(plan?.worldName).toBe('Shiva');
    expect(plan?.totalCost).toBe(6);
  });

  it('skips worlds that cannot cover the quantity, even if cheaper per unit', () => {
    const prices = [
      listing({ worldName: 'Odin', quantity: 2, pricePerUnit: 1 }),
      listing({ worldName: 'Shiva', quantity: 5, pricePerUnit: 10 }),
    ];
    const plan = cheapestSingleWorldPurchase(prices, '5');
    expect(plan?.worldName).toBe('Shiva');
  });

  it('returns undefined when no single world has enough', () => {
    const prices = [
      listing({ worldName: 'Odin', quantity: 3 }),
      listing({ worldName: 'Shiva', quantity: 3 }),
    ];
    expect(cheapestSingleWorldPurchase(prices, '6')).toBeUndefined();
  });
});

describe('cheapestCombinedPurchase', () => {
  it('combines listings across worlds when no single world suffices', () => {
    const prices = [
      listing({ worldName: 'Odin', quantity: 3, pricePerUnit: 1 }),
      listing({ worldName: 'Shiva', quantity: 3, pricePerUnit: 1 }),
    ];
    const plan = cheapestCombinedPurchase(prices, '6');
    expect(plan?.totalCost).toBe(6);
    expect(plan?.listings.map((l) => l.worldName).sort()).toEqual(['Odin', 'Shiva']);
  });

  it('never costs more than the best single world', () => {
    const prices = [
      listing({ worldName: 'Odin', quantity: 5, pricePerUnit: 4 }),   // 20
      listing({ worldName: 'Shiva', quantity: 3, pricePerUnit: 1 }),  // 3
      listing({ worldName: 'Lich', quantity: 2, pricePerUnit: 1 }),   // 2
    ];
    const combined = cheapestCombinedPurchase(prices, '5');
    const singleWorld = cheapestSingleWorldPurchase(prices, '5');
    expect(combined?.totalCost).toBe(5);
    expect(singleWorld?.totalCost).toBe(20);
    expect(combined!.totalCost).toBeLessThanOrEqual(singleWorld!.totalCost);
  });
});
