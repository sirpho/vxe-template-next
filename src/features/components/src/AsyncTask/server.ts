import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/whhim-erp-service-center/async/getAsyncTaskList',
  save = '/whhim-erp-service-center/async/saveAsyncTask',
}

/**
 * @description: 列表
 */
export const list = (data: any) => {
  return defHttp.post({ url: Api.list, data }, { ignoreCancelToken: false, joinPrefix: false });
};

/**
 * @description: 列表
 */
export const save = (data: any) => {
  return defHttp.post({ url: Api.save, data }, { ignoreCancelToken: false, joinPrefix: false });
};
