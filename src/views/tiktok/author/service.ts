import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/tiktok/analysis',
}

/**
 * @description: 列表
 */
export const list = (data: any) => {
  return defHttp.get({ url: Api.list, data });
};
