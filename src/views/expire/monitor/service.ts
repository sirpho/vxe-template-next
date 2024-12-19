import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/utensil/list',
  update = '/api/utensil/update',
  info = '/api/utensil/browse/',
  remove = '/api/utensil/remove/',
}

/**
 * @description: 列表
 */
export const list = (params: any) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * @description: 详情
 */
export const getInfo = (params: any) => {
  return defHttp.get({ url: `${Api.info}${params.id}` });
};

/**
 * @description: 新增|编辑
 */
export const update = (data: any) => {
  return defHttp.post({ url: Api.update, data });
};

/**
 * @description: 删除
 */
export const remove = (id: string) => {
  return defHttp.get({ url: `${Api.remove}${id}` });
};
