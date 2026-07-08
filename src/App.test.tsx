import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import App from './App';
import { getDataCenters } from './actions/getDataCenters';
import { universalisDataCenter } from './types/universalis';

vi.mock('./actions/getDataCenters', () => ({
  getDataCenters: vi.fn(),
}));

vi.mock('./components/inputRow', () => ({
  default: ({ dataCenter }: { dataCenter: string }) => (
    <div data-testid="input-row">{dataCenter}</div>
  ),
}));

const mockedGetDataCenters = vi.mocked(getDataCenters);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const dataCenterSelect = () => screen.getByRole('combobox') as HTMLSelectElement;

describe('App', () => {
  it('replaces the fallback data center options with the fetched list when non-empty', async () => {
    const centers: universalisDataCenter[] = [
      { name: 'TestCenter', region: 'TestRegion', worlds: [] },
    ];
    mockedGetDataCenters.mockResolvedValue(centers);

    render(<App />);

    await screen.findByText('TestCenter (TestRegion)');
    expect(screen.queryByText('Light (Europe)')).toBeNull();
    expect(screen.queryByText('Aether (North-America)')).toBeNull();
  });

  it('keeps the fallback options when the fetched list is empty', async () => {
    mockedGetDataCenters.mockResolvedValue([]);

    render(<App />);

    await screen.findByText('Light (Europe)');
    expect(screen.getByText('Aether (North-America)')).toBeTruthy();
  });

  it('keeps the fallback options when the fetch rejects', async () => {
    mockedGetDataCenters.mockRejectedValue(new Error('network error'));

    render(<App />);

    await screen.findByText('Light (Europe)');
    expect(screen.getByText('Aether (North-America)')).toBeTruthy();
  });

  it('adds another InputRow when "Add item" is clicked', async () => {
    mockedGetDataCenters.mockResolvedValue([]);

    render(<App />);
    await screen.findByText('Light (Europe)');

    expect(screen.getAllByTestId('input-row')).toHaveLength(1);

    fireEvent.click(screen.getByText('Add item'));
    expect(screen.getAllByTestId('input-row')).toHaveLength(2);

    fireEvent.click(screen.getByText('Add item'));
    expect(screen.getAllByTestId('input-row')).toHaveLength(3);
  });

  it('only shows "Remove item" when there is more than one row, and removes a row', async () => {
    mockedGetDataCenters.mockResolvedValue([]);

    render(<App />);
    await screen.findByText('Light (Europe)');

    expect(screen.queryByText('Remove item')).toBeNull();

    fireEvent.click(screen.getByText('Add item'));
    expect(screen.getByText('Remove item')).toBeTruthy();
    expect(screen.getAllByTestId('input-row')).toHaveLength(2);

    fireEvent.click(screen.getByText('Remove item'));
    expect(screen.getAllByTestId('input-row')).toHaveLength(1);
    expect(screen.queryByText('Remove item')).toBeNull();
  });

  it('passes the newly selected data center down to the InputRow(s)', async () => {
    mockedGetDataCenters.mockResolvedValue([]);

    render(<App />);
    await screen.findByText('Light (Europe)');

    expect(screen.getAllByTestId('input-row')[0].textContent).toBe('Light');

    fireEvent.change(dataCenterSelect(), { target: { value: 'Chaos' } });

    expect(screen.getAllByTestId('input-row')[0].textContent).toBe('Chaos');
  });
});
