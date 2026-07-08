import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import InfoRow from './infoRow';
import { universalisListing } from '../types/universalis';
import { purchasePlan, worldPurchasePlan } from '../utils/prices';

afterEach(cleanup);

let nextListingId = 0;

const makeListing = (overrides: Partial<universalisListing> = {}): universalisListing => ({
  creatorID: null,
  creatorName: '',
  hq: false,
  isCrafted: false,
  lastReviewTime: 0,
  listingID: `listing-${nextListingId++}`,
  materia: [],
  onMannequin: false,
  pricePerUnit: 100,
  quantity: 1,
  retainerCity: 0,
  retainerID: 'retainer',
  retainerName: 'Retainer',
  sellerID: null,
  stainID: 0,
  tax: 0,
  total: 100,
  worldID: 402,
  worldName: 'Light',
  ...overrides,
});

describe('InfoRow', () => {
  it('shows only the "not enough listings" message when all props are undefined', () => {
    render(<InfoRow single={undefined} singleWorld={undefined} combined={undefined} />);

    expect(screen.getByText('Not enough listings to cover that quantity.')).toBeTruthy();
    expect(screen.queryByText(/Cheapest single listing/)).toBeNull();
    expect(screen.queryByText(/Cheapest single server/)).toBeNull();
    expect(screen.queryByText(/Cheapest combined/)).toBeNull();
  });

  it('renders only the single-listing line when only `single` is provided', () => {
    const single = makeListing({ pricePerUnit: 100, quantity: 3, worldName: 'Light' });

    render(<InfoRow single={single} singleWorld={undefined} combined={undefined} />);

    expect(screen.getByText('Cheapest single listing: 300 gil for 3 on Light')).toBeTruthy();
    expect(screen.queryByText('Not enough listings to cover that quantity.')).toBeNull();
    expect(screen.queryByText(/Cheapest single server/)).toBeNull();
    expect(screen.queryByText(/Cheapest combined/)).toBeNull();
  });

  it('renders the single-server line with singular "listing" for exactly one listing', () => {
    const singleWorld: worldPurchasePlan = {
      worldName: 'Light',
      totalCost: 500,
      totalQuantity: 5,
      listings: [makeListing({ pricePerUnit: 100, quantity: 5, worldName: 'Light' })],
    };

    render(<InfoRow single={undefined} singleWorld={singleWorld} combined={undefined} />);

    expect(screen.getByText('Cheapest single server: 500 gil for 5 on Light (1 listing)')).toBeTruthy();
  });

  it('renders the single-server line with plural "listings" for more than one listing', () => {
    const singleWorld: worldPurchasePlan = {
      worldName: 'Light',
      totalCost: 500,
      totalQuantity: 5,
      listings: [
        makeListing({ pricePerUnit: 60, quantity: 3, worldName: 'Light' }),
        makeListing({ pricePerUnit: 80, quantity: 2, worldName: 'Light' }),
      ],
    };

    render(<InfoRow single={undefined} singleWorld={singleWorld} combined={undefined} />);

    expect(screen.getByText('Cheapest single server: 500 gil for 5 on Light (2 listings)')).toBeTruthy();
  });

  it('hides the combined block when combined.totalCost equals singleWorld.totalCost', () => {
    const singleWorld: worldPurchasePlan = {
      worldName: 'Light',
      totalCost: 300,
      totalQuantity: 3,
      listings: [makeListing({ pricePerUnit: 100, quantity: 3, worldName: 'Light' })],
    };
    const combined: purchasePlan = {
      totalCost: 300,
      totalQuantity: 3,
      listings: [makeListing({ pricePerUnit: 100, quantity: 3, worldName: 'Light' })],
    };

    render(<InfoRow single={undefined} singleWorld={singleWorld} combined={combined} />);

    expect(screen.queryByText(/Cheapest combined/)).toBeNull();
  });

  it('hides the combined block when combined.totalCost is greater than singleWorld.totalCost', () => {
    const singleWorld: worldPurchasePlan = {
      worldName: 'Light',
      totalCost: 250,
      totalQuantity: 3,
      listings: [makeListing({ pricePerUnit: 250 / 3, quantity: 3, worldName: 'Light' })],
    };
    const combined: purchasePlan = {
      totalCost: 300,
      totalQuantity: 3,
      listings: [makeListing({ pricePerUnit: 100, quantity: 3, worldName: 'Light' })],
    };

    render(<InfoRow single={undefined} singleWorld={singleWorld} combined={combined} />);

    expect(screen.queryByText(/Cheapest combined/)).toBeNull();
  });

  it('shows the combined block grouped by world, with per-world subtotals and singular/plural listing counts, when cheaper than singleWorld', () => {
    const singleWorld: worldPurchasePlan = {
      worldName: 'Primal',
      totalCost: 999,
      totalQuantity: 4,
      listings: [makeListing({ pricePerUnit: 999, quantity: 4, worldName: 'Primal' })],
    };
    const combined: purchasePlan = {
      totalCost: 260,
      totalQuantity: 4,
      listings: [
        makeListing({ pricePerUnit: 100, quantity: 1, worldName: 'Light' }),
        makeListing({ pricePerUnit: 50, quantity: 2, worldName: 'Chaos' }),
        makeListing({ pricePerUnit: 60, quantity: 1, worldName: 'Chaos' }),
      ],
    };

    render(<InfoRow single={undefined} singleWorld={singleWorld} combined={combined} />);

    expect(screen.getByText('Cheapest combined: 260 gil for 4 across:')).toBeTruthy();
    // Light has exactly one listing -> singular.
    expect(screen.getByText('Light: 100 gil for 1 (1 listing)')).toBeTruthy();
    // Chaos has two listings -> plural.
    expect(screen.getByText('Chaos: 160 gil for 3 (2 listings)')).toBeTruthy();
  });

  it('shows the combined block when singleWorld is undefined', () => {
    const combined: purchasePlan = {
      totalCost: 150,
      totalQuantity: 2,
      listings: [makeListing({ pricePerUnit: 75, quantity: 2, worldName: 'Light' })],
    };

    render(<InfoRow single={undefined} singleWorld={undefined} combined={combined} />);

    expect(screen.getByText('Cheapest combined: 150 gil for 2 across:')).toBeTruthy();
    expect(screen.getByText('Light: 150 gil for 2 (1 listing)')).toBeTruthy();
  });
});
