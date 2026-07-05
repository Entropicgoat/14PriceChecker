import { universalisListing } from '../types/universalis';


export type purchasePlan = {
  listings: universalisListing[];
  totalCost: number;
  totalQuantity: number;
}

export type worldPurchasePlan = purchasePlan & {
  worldName: string;
}

const stackCost = (listing: universalisListing) => listing.pricePerUnit * listing.quantity;

export const groupListingsByWorld = (listings: universalisListing[]): Record<string, universalisListing[]> => {
  const byWorld: Record<string, universalisListing[]> = {};
  listings.forEach((listing) => {
    (byWorld[listing.worldName] ??= []).push(listing);
  });
  return byWorld;
}

export const cheapestSinglePurchase = (prices: universalisListing[], quantityString: string): universalisListing|undefined => {
  const quantity = parseInt(quantityString);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return undefined;
  }
  return prices
    .filter((price) => price.quantity >= quantity)
    .reduce<universalisListing|undefined>(
      (cheapest, price) => !cheapest || stackCost(price) < stackCost(cheapest) ? price : cheapest,
      undefined,
    );
}

// Cheapest set of whole listings totalling at least `quantity` items. Exact
// (knapsack-style DP): greedy per-unit picking overpays when stacks must be
// bought whole. dp[q] = cheapest way to hold q items, with q capped at the
// requested quantity so any overshoot lands in the final bucket.
export const cheapestPurchase = (prices: universalisListing[], quantityString: string): purchasePlan|undefined => {
  const quantity = parseInt(quantityString);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return undefined;
  }

  type dpCell = { cost: number, picks: number[] };
  const dp: (dpCell|undefined)[] = new Array(quantity + 1).fill(undefined);
  dp[0] = { cost: 0, picks: [] };

  prices.forEach((price, i) => {
    if (price.quantity <= 0) {
      return;
    }
    const cost = stackCost(price);
    // Descending so each listing is used at most once: targets are always
    // above q and have already been passed this iteration.
    for (let q = quantity; q >= 0; q--) {
      const cell = dp[q];
      if (!cell) {
        continue;
      }
      const target = Math.min(q + price.quantity, quantity);
      const existing = dp[target];
      if (!existing || cell.cost + cost < existing.cost) {
        dp[target] = { cost: cell.cost + cost, picks: [...cell.picks, i] };
      }
    }
  });

  const best = dp[quantity];
  if (!best) {
    return undefined;
  }
  const listings = best.picks.map((i) => prices[i]);
  return {
    listings,
    totalCost: best.cost,
    totalQuantity: listings.reduce((sum, listing) => sum + listing.quantity, 0),
  };
}

// Cheapest single world to buy the full quantity from, allowing multiple
// listings on that world.
export const cheapestSingleWorldPurchase = (prices: universalisListing[], quantityString: string): worldPurchasePlan|undefined => {
  const byWorld = groupListingsByWorld(prices);
  let best: worldPurchasePlan|undefined;

  Object.entries(byWorld).forEach(([worldName, listings]) => {
    const plan = cheapestPurchase(listings, quantityString);
    if (plan && (!best || plan.totalCost < best.totalCost)) {
      best = { ...plan, worldName };
    }
  });
  return best;
}

// Cheapest deal across all worlds combined.
export const cheapestCombinedPurchase = (prices: universalisListing[], quantityString: string): purchasePlan|undefined => {
  return cheapestPurchase(prices, quantityString);
}
