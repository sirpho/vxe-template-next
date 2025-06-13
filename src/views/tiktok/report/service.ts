import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/tiktok/analysis',
  dancerList = '/api/dancer/analysis',
}

/**
 * @description: 马甲列表
 */
export const list = (data: any) => {
  return defHttp.post({ url: Api.list, data });
};

/**
 * @description: 福利姬列表
 */
export const dancerList = (data: any) => {
  return defHttp.post({ url: Api.dancerList, data });
};
