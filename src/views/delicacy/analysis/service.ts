import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/delicacy/list',
}

/**
 * @description: 列表
 */
export const list = () => {
  return defHttp.post({ url: Api.list });
};
