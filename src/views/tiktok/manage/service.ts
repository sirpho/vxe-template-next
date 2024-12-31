import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/tiktok/list',
  batch = '/api/tiktok/batch',
  classList = '/api/tiktok/class/list',
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

/**
 * @description: 标签列表
 */
export const getClassList = (data: any) => {
  return defHttp.post({ url: Api.classList, data });
};
