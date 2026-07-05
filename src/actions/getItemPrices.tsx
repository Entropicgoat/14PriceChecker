import {universalisPriceResponse, universalisListing} from '../types/universalis';

export const getItemPrices = async (itemId: number, dataCenter: string): Promise<universalisListing[]> => {
  const response = await fetch(`https://universalis.app/api/v2/${encodeURIComponent(dataCenter)}/${itemId}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: universalisPriceResponse = await response.json();
  return data.listings;
}
