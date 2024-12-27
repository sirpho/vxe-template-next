import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/tiktok/list',
  batch = '/api/tiktok/batch',
}

/**
 * @description: 列表
 */
export const list = (data: any) => {
  return defHttp.post({ url: Api.list, data });
};

/**
 * @description: 批量操作
 */
export const batch = (data: any) => {
  return defHttp.post({ url: Api.batch, data });
};
