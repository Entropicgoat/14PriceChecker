import axios, { AxiosResponse } from 'axios';

import {xivApiResults, xivApiResponse} from '../types/xivapi';

const API = axios.create({});

export const getItemIds = async (itemName: string): Promise<xivApiResults[]> => {
  const itemIds: AxiosResponse<xivApiResponse> = await API({
    method: 'get',
    url: `https://xivapi.com/search?string=${itemName}`,
  });

  return itemIds.data.Results;
}
