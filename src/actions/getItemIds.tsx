import axios, { AxiosResponse } from 'axios';

import {xivApiResultsBeta, xivApiResponseBeta} from '../types/xivapi';

const API = axios.create({});

export const getItemIds = async (itemName: string): Promise<xivApiResultsBeta[]> => {
  const response: AxiosResponse<xivApiResponseBeta> = await API({
    method: 'get',
    url: `https://beta.xivapi.com/api/1/search?query=Name~"${itemName}"&sheets=Item`
  });

  return response.data.results;
}
