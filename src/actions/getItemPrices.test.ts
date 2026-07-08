import { describe, it, expect, vi, afterEach } from 'vitest';

import { getItemPrices } from './getItemPrices';
import { universalisPriceResponse, universalisListing } from '../types/universalis';

afterEach(() => {
  vi.unstubAllGlobals();
});

const listing = (overrides: Partial<universalisListing> = {}): universalisListing => ({
  creatorID: null,
  creatorName: '',
  hq: false,
  isCrafted: false,
  lastReviewTime: 0,
  listingID: '1',
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
  worldID: 402,
  worldName: 'Odin',
  ...overrides,
});

const priceResponse = (listings: universalisListing[]): universalisPriceResponse => ({
  averagePrice: 0,
  averagePriceHQ: 0,
  averagePriceNQ: 0,
  currentAveragePrice: 0,
  currentAveragePriceHQ: 0,
  currentAveragePriceNQ: 0,
  hqSaleVelocity: 0,
  itemID: 5333,
  lastUploadTime: 0,
  listings,
  listingsCount: listings.length,
  maxPrice: 0,
  maxPriceHQ: 0,
  maxPriceNQ: 0,
  minPrice: 0,
  minPriceHQ: 0,
  minPriceNQ: 0,
  nqSaleVelocity: 0,
  recentHistory: [],
  recentHistoryCount: 0,
  regionName: 'Europe',
  regularSaleVelocity: 0,
  stackSizeHistogram: {},
  stackSizeHistogramHQ: {},
  stackSizeHistogramNQ: {},
  unitsForSale: listings.length,
  unitsSold: 0,
  worldUploadTimes: {},
});

describe('getItemPrices', () => {
  it('builds the correct request URL with the data center encoded', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(priceResponse([])),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getItemPrices(5333, 'Light');

    expect(fetchMock).toHaveBeenCalledWith('https://universalis.app/api/v2/Light/5333');
  });

  it('URI-encodes a data center name with special characters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(priceResponse([])),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getItemPrices(5333, 'North America');

    expect(fetchMock).toHaveBeenCalledWith(
      `https://universalis.app/api/v2/${encodeURIComponent('North America')}/5333`,
    );
  });

  it('returns data.listings only, not the whole response body', async () => {
    const listings = [listing({ worldName: 'Odin' }), listing({ worldName: 'Shiva', listingID: '2' })];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(priceResponse(listings)),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getItemPrices(5333, 'Light');

    expect(result).toEqual(listings);
  });

  it('throws an error containing the status code when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getItemPrices(5333, 'Light')).rejects.toThrow('404');
  });

  it('propagates a fetch rejection', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getItemPrices(5333, 'Light')).rejects.toThrow('network error');
  });
});
