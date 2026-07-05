import {xivApiResultsBeta, xivApiResponseBeta} from '../types/xivapi';

export const getItemIds = async (itemName: string): Promise<xivApiResultsBeta[]> => {
  const query = encodeURIComponent(`Name~"${itemName}"`);
  const response = await fetch(`https://beta.xivapi.com/api/1/search?query=${query}&sheets=Item`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: xivApiResponseBeta = await response.json();
  return data.results;
}
