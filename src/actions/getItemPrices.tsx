import axios, { AxiosResponse } from 'axios';

import {universalisPriceResponse, universalisListing} from '../types/universalis';

const API = axios.create({});

export const getItemPrices = async (itemId: number): Promise<universalisListing[]> => {
  const itemIds: AxiosResponse<universalisPriceResponse> = await API({
    method: 'get',
    url: `https://universalis.app/api/v2/Europe/${itemId}`,
  });

  return itemIds.data.listings;
}
