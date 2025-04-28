import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/music/list',
}

/**
 * @description: 列表
 */
export const analysis = () => {
  return defHttp.post({ url: Api.list });
};
