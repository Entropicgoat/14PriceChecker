import { describe, it, expect, vi, afterEach } from 'vitest';

import { getDataCenters } from './getDataCenters';
import { universalisDataCenter } from '../types/universalis';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getDataCenters', () => {
  it('returns parsed JSON on success', async () => {
    const dataCenters: universalisDataCenter[] = [
      { name: 'Light', region: 'Europe', worlds: [402, 403, 404] },
      { name: 'Aether', region: 'North-America', worlds: [40, 41, 42] },
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(dataCenters),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getDataCenters();

    expect(result).toEqual(dataCenters);
  });

  it('throws an error containing the status code when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getDataCenters()).rejects.toThrow('503');
  });

  it('propagates a fetch rejection', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getDataCenters()).rejects.toThrow('network error');
  });
});
