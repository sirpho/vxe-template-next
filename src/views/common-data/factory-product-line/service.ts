import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/sy-manager/factory-product-line/list',
  save = '/sy-manager/factory-product-line/saveList',
}

/**
 * @description: 列表
 */
export const list = (data: any) => {
  return defHttp.post({ url: Api.list, data });
};

/**
 * @description: table 保存
 */
export const save = (data: any) => {
  return defHttp.post({ url: Api.save, data });
};
