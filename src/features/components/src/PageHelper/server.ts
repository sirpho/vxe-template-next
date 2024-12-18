import { defHttp } from '@/utils/http/axios';

enum Api {
  init = '/auth/getModuleInfo',
}

/**
 * @description: 查询
 */
export const initServer = (data: { moduleUrl: string }): Promise<Result<any>> => {
  return defHttp.post({ url: Api.init, data }, { ignoreCancelToken: false });
};
