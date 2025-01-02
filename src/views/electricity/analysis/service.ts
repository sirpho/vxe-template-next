import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/electricity/list',
}

/**
 * @description: 列表
 */
export const list = () => {
  return defHttp.post({ url: Api.list });
};

export type ElectricityRecord = {
  year: string;
  month: string;
  power: number;
  cost: number;
  price: number;
};
