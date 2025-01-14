import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/dns/list',
  create = '/api/dns/create',
  modify = '/api/dns/modify',
  delete = '/api/dns/delete',
}

/**
 * @description: 列表
 */
export const queryList = (data) => {
  return defHttp.post({ url: Api.list, data });
};

/**
 * @description: 新增
 */
export const createRecord = (data) => {
  return defHttp.post({ url: Api.create, data });
};

/**
 * @description: 修改
 */
export const modifyRecord = (data) => {
  return defHttp.post({ url: Api.modify, data });
};

/**
 * @description: 删除
 */
export const deleteRecord = (data) => {
  return defHttp.post({ url: Api.delete, data });
};
