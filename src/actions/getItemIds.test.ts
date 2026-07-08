import { describe, it, expect, vi, afterEach } from 'vitest';

import { getItemIds } from './getItemIds';
import { xivApiResponseBeta } from '../types/xivapi';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getItemIds', () => {
  it('builds the correct request URL with the query encoded', async () => {
    const body: xivApiResponseBeta = { schema: 'schema', results: [] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getItemIds('Dark Matter');

    const expectedQuery = encodeURIComponent('Name~"Dark Matter"');
    expect(fetchMock).toHaveBeenCalledWith(
      `https://beta.xivapi.com/api/1/search?query=${expectedQuery}&sheets=Item`,
    );
  });

  it('returns data.results, not the whole response body', async () => {
    const body: xivApiResponseBeta = {
      schema: 'schema',
      results: [
        {
          score: 1,
          sheet: 'Item',
          row_id: 5333,
          fields: {
            Icon: { id: 1, path: 'icon/1.png', path_hr1: 'icon/1_hr1.png' },
            Name: 'Dark Matter',
            Singular: 'dark matter',
          },
        },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getItemIds('Dark Matter');

    expect(result).toEqual(body.results);
  });

  it('throws an error containing the status code when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getItemIds('Dark Matter')).rejects.toThrow('500');
  });

  it('propagates a fetch rejection', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getItemIds('Dark Matter')).rejects.toThrow('network error');
  });
});
