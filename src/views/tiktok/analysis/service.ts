import { defHttp } from '@/utils/http/axios';

enum Api {
  analysis = '/api/dancer/analysis',
}

/**
 * @description: 列表
 */
export const analysis = () => {
  return defHttp.post({ url: Api.analysis, data: {} });
};
