import { defHttp } from '@/utils/http/axios';

enum Api {
  analysis = '/api/tiktok/analysis',
}

/**
 * @description: 列表
 */
export const analysis = () => {
  return defHttp.get({ url: Api.analysis });
};
