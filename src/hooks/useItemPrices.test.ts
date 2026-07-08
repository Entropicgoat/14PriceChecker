import { ChangeEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getItemIds } from '../actions/getItemIds';
import { getItemPrices } from '../actions/getItemPrices';
import { universalisListing } from '../types/universalis';
import { xivApiResultsBeta } from '../types/xivapi';
import { useItemPrices } from './useItemPrices';

vi.mock('../actions/getItemIds', () => ({ getItemIds: vi.fn() }));
vi.mock('../actions/getItemPrices', () => ({ getItemPrices: vi.fn() }));

const mockGetItemIds = vi.mocked(getItemIds);
const mockGetItemPrices = vi.mocked(getItemPrices);

const searchResult = (overrides: Partial<xivApiResultsBeta> = {}): xivApiResultsBeta => ({
  score: 1,
  sheet: 'Item',
  row_id: 5111,
  fields: {
    Icon: { id: 25104, path: 'ui/icon/025000/025104.tex', path_hr1: 'ui/icon/025000/025104_hr1.tex' },
    Name: 'Mythril Ore',
    Singular: 'mythril ore',
  },
  ...overrides,
});

const listing = (worldName: string, pricePerUnit: number, quantity: number) => ({
  worldName,
  pricePerUnit,
  quantity,
  total: pricePerUnit * quantity,
} as universalisListing);

const changeEvent = (value: string) => ({ target: { value } } as ChangeEvent<HTMLInputElement>);

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

const renderUseItemPrices = (dataCenter = 'Light') =>
  renderHook((dc: string) => useItemPrices(dc), { initialProps: dataCenter });

const setName = (result: { current: ReturnType<typeof useItemPrices> }, name: string) => {
  act(() => { result.current.handleItemChange(changeEvent(name)); });
};

const submit = async (result: { current: ReturnType<typeof useItemPrices> }) => {
  await act(async () => { void result.current.handleSubmit(); });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useItemPrices', () => {
  it('starts idle with empty name, quantity 1 and no prices', () => {
    const { result } = renderUseItemPrices();

    expect(result.current.itemName).toBe('');
    expect(result.current.quantity).toBe('1');
    expect(result.current.status).toBe('idle');
    expect(result.current.itemPrices).toEqual([]);
  });

  it('updates quantity via handleQuantityChange', () => {
    const { result } = renderUseItemPrices();

    act(() => { result.current.handleQuantityChange(changeEvent('42')); });

    expect(result.current.quantity).toBe('42');
  });

  it('resets status and prices when the item name changes', async () => {
    mockGetItemIds.mockResolvedValue([searchResult()]);
    mockGetItemPrices.mockResolvedValue([listing('Phoenix', 100, 5)]);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');
    await submit(result);
    expect(result.current.status).toBe('done');

    setName(result, 'Mythril Or');

    expect(result.current.status).toBe('idle');
    expect(result.current.itemPrices).toEqual([]);
  });

  it('does nothing on submit with a blank name', async () => {
    const { result } = renderUseItemPrices();
    setName(result, '   ');

    await submit(result);

    expect(result.current.status).toBe('idle');
    expect(mockGetItemIds).not.toHaveBeenCalled();
  });

  it('fetches prices for an exact match and reports done', async () => {
    mockGetItemIds.mockResolvedValue([
      searchResult({ row_id: 1, fields: { ...searchResult().fields, Name: 'Mythril Ore Fragment' } }),
      searchResult(),
    ]);
    const prices = [listing('Phoenix', 100, 5), listing('Odin', 90, 3)];
    mockGetItemPrices.mockResolvedValue(prices);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');

    await submit(result);

    expect(mockGetItemIds).toHaveBeenCalledWith('Mythril Ore');
    expect(mockGetItemPrices).toHaveBeenCalledWith(5111, 'Light');
    expect(result.current.status).toBe('done');
    expect(result.current.itemPrices).toEqual(prices);
  });

  it('matches the item name case-insensitively and trims whitespace', async () => {
    mockGetItemIds.mockResolvedValue([searchResult()]);
    mockGetItemPrices.mockResolvedValue([listing('Phoenix', 100, 5)]);
    const { result } = renderUseItemPrices();
    setName(result, '  mythril ORE ');

    await submit(result);

    expect(mockGetItemIds).toHaveBeenCalledWith('mythril ORE');
    expect(result.current.status).toBe('done');
  });

  it('ignores search hits from other sheets', async () => {
    mockGetItemIds.mockResolvedValue([searchResult({ sheet: 'Quest' })]);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');

    await submit(result);

    expect(result.current.status).toBe('notFound');
    expect(result.current.itemPrices).toEqual([]);
    expect(mockGetItemPrices).not.toHaveBeenCalled();
  });

  it('reports notFound when no result matches the name exactly', async () => {
    mockGetItemIds.mockResolvedValue([searchResult()]);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril');

    await submit(result);

    expect(result.current.status).toBe('notFound');
    expect(mockGetItemPrices).not.toHaveBeenCalled();
  });

  it('reports error when the item search fails', async () => {
    mockGetItemIds.mockRejectedValue(new Error('boom'));
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');

    await submit(result);

    expect(result.current.status).toBe('error');
    expect(result.current.itemPrices).toEqual([]);
  });

  it('reports error when the price fetch fails', async () => {
    mockGetItemIds.mockResolvedValue([searchResult()]);
    mockGetItemPrices.mockRejectedValue(new Error('boom'));
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');

    await submit(result);

    expect(result.current.status).toBe('error');
    expect(result.current.itemPrices).toEqual([]);
  });

  it('discards a search response that resolves after the name was edited', async () => {
    const search = deferred<xivApiResultsBeta[]>();
    mockGetItemIds.mockReturnValue(search.promise);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');
    await submit(result);
    expect(result.current.status).toBe('loading');

    setName(result, 'Mythril Ore B');
    await act(async () => { search.resolve([searchResult()]); });

    expect(result.current.status).toBe('idle');
    expect(mockGetItemPrices).not.toHaveBeenCalled();
  });

  it('discards a search rejection that lands after the name was edited', async () => {
    const search = deferred<xivApiResultsBeta[]>();
    mockGetItemIds.mockReturnValue(search.promise);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');
    await submit(result);

    setName(result, 'Mythril Ore B');
    await act(async () => { search.reject(new Error('boom')); });

    expect(result.current.status).toBe('idle');
  });

  it('lets the newest of two overlapping submits win', async () => {
    const first = deferred<universalisListing[]>();
    const second = deferred<universalisListing[]>();
    mockGetItemIds.mockResolvedValue([searchResult()]);
    mockGetItemPrices.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderUseItemPrices();
    setName(result, 'Mythril Ore');

    await submit(result);
    await submit(result);
    await act(async () => { first.resolve([listing('Phoenix', 999, 1)]); });
    const winner = [listing('Odin', 90, 3)];
    await act(async () => { second.resolve(winner); });

    expect(result.current.status).toBe('done');
    expect(result.current.itemPrices).toEqual(winner);
  });

  it('resets results when the data center changes', async () => {
    mockGetItemIds.mockResolvedValue([searchResult()]);
    mockGetItemPrices.mockResolvedValue([listing('Phoenix', 100, 5)]);
    const { result, rerender } = renderUseItemPrices();
    setName(result, 'Mythril Ore');
    await submit(result);
    expect(result.current.status).toBe('done');

    rerender('Chaos');

    expect(result.current.status).toBe('idle');
    expect(result.current.itemPrices).toEqual([]);
    expect(result.current.itemName).toBe('Mythril Ore');
  });

  it('discards an in-flight price fetch when the data center changes', async () => {
    const prices = deferred<universalisListing[]>();
    mockGetItemIds.mockResolvedValue([searchResult()]);
    mockGetItemPrices.mockReturnValue(prices.promise);
    const { result, rerender } = renderUseItemPrices();
    setName(result, 'Mythril Ore');
    await submit(result);
    expect(mockGetItemPrices).toHaveBeenCalledWith(5111, 'Light');

    rerender('Chaos');
    await act(async () => { prices.resolve([listing('Phoenix', 100, 5)]); });

    expect(result.current.status).toBe('idle');
    expect(result.current.itemPrices).toEqual([]);
  });
});
