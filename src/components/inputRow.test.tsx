import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

import InputRow from './inputRow';
import { getItemIds } from '../actions/getItemIds';
import { getItemPrices } from '../actions/getItemPrices';
import { xivApiResultsBeta } from '../types/xivapi';
import { universalisListing } from '../types/universalis';

vi.mock('../actions/getItemIds', () => ({
  getItemIds: vi.fn(),
}));
vi.mock('../actions/getItemPrices', () => ({
  getItemPrices: vi.fn(),
}));

const mockedGetItemIds = vi.mocked(getItemIds);
const mockedGetItemPrices = vi.mocked(getItemPrices);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const makeItem = (overrides: Partial<xivApiResultsBeta> = {}): xivApiResultsBeta => ({
  score: 1,
  sheet: 'Item',
  row_id: 5333,
  fields: {
    Icon: { id: 1, path: 'icon/1.png', path_hr1: 'icon/1_hr1.png' },
    Name: 'Potion',
    Singular: 'potion',
  },
  ...overrides,
});

const makeListing = (overrides: Partial<universalisListing> = {}): universalisListing => ({
  creatorID: null,
  creatorName: '',
  hq: false,
  isCrafted: false,
  lastReviewTime: 0,
  listingID: 'listing-1',
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

const fetchButton = () => screen.getByRole('button', { name: 'fetch data' });
const itemInput = () => screen.getByLabelText(/item name/i) as HTMLInputElement;

const searchFor = (name: string) => {
  fireEvent.change(itemInput(), { target: { value: name } });
  fireEvent.click(fetchButton());
};

describe('InputRow', () => {
  it('shows the loading message while the fetch is in flight', async () => {
    mockedGetItemIds.mockImplementation(() => new Promise(() => {}));

    render(<InputRow dataCenter="Light" />);
    searchFor('Potion');

    await screen.findByText('Fetching prices…');
  });

  it('shows a "not found" message when no exact item match is returned', async () => {
    mockedGetItemIds.mockResolvedValue([makeItem({ fields: { ...makeItem().fields, Name: 'Ether' } })]);

    render(<InputRow dataCenter="Light" />);
    searchFor('Potion');

    await screen.findByText('No item named "Potion" found.');
  });

  it('shows an error message when the fetch flow throws', async () => {
    mockedGetItemIds.mockRejectedValue(new Error('network error'));

    render(<InputRow dataCenter="Light" />);
    searchFor('Potion');

    await screen.findByText('Fetching prices failed — try again.');
  });

  it('shows a "no listings" message when done with an empty result', async () => {
    mockedGetItemIds.mockResolvedValue([makeItem()]);
    mockedGetItemPrices.mockResolvedValue([]);

    render(<InputRow dataCenter="Light" />);
    searchFor('Potion');

    await screen.findByText('No listings on Light for this item.');
    expect(mockedGetItemPrices).toHaveBeenCalledWith(5333, 'Light');
  });

  it('renders InfoRow output when done with listings', async () => {
    mockedGetItemIds.mockResolvedValue([makeItem()]);
    mockedGetItemPrices.mockResolvedValue([makeListing({ pricePerUnit: 100, quantity: 1, worldName: 'Light' })]);

    render(<InputRow dataCenter="Light" />);
    searchFor('Potion');

    await screen.findByText('Cheapest single listing: 100 gil for 1 on Light');
  });

  it('updates the item input value as the user types and resets a previous "not found" state', async () => {
    mockedGetItemIds.mockResolvedValue([makeItem({ fields: { ...makeItem().fields, Name: 'Ether' } })]);

    render(<InputRow dataCenter="Light" />);
    searchFor('Potion');
    await screen.findByText('No item named "Potion" found.');

    fireEvent.change(itemInput(), { target: { value: 'Potions' } });

    expect(itemInput().value).toBe('Potions');
    expect(screen.queryByText('No item named "Potion" found.')).toBeNull();
  });

  it('triggers the fetch flow on submit', async () => {
    mockedGetItemIds.mockResolvedValue([makeItem()]);
    mockedGetItemPrices.mockResolvedValue([makeListing()]);

    render(<InputRow dataCenter="Light" />);
    fireEvent.change(itemInput(), { target: { value: 'Potion' } });
    fireEvent.click(fetchButton());

    await waitFor(() => {
      expect(mockedGetItemIds).toHaveBeenCalledWith('Potion');
    });
    await waitFor(() => {
      expect(mockedGetItemPrices).toHaveBeenCalledWith(5333, 'Light');
    });
  });
});
