import { universalisDataCenter } from '../types/universalis';

export const getDataCenters = async (): Promise<universalisDataCenter[]> => {
  const response = await fetch('https://universalis.app/api/v2/data-centers');
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<universalisDataCenter[]>;
}
