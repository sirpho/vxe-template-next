import { defHttp } from '@/utils/http/axios';

enum Api {
  upload = '/api/convert/icon',
}

/**
 * @description: 上传
 */
export const upload = (data: any) => {
  return defHttp.uploadFile({ url: Api.upload }, data);
};
