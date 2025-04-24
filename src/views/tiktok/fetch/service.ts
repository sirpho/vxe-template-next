import { defHttp } from '@/utils/http/axios';

enum Api {
  increment = 'http://localhost.sirpho.top:23456/api/tiktok/increment/generate',
  stock = 'http://localhost.sirpho.top:23456/api/tiktok/stock/generate',
  rename = 'http://localhost.sirpho.top:23456/api/file/rename',
}

/**
 * @description: 增量文件重命名
 */
export const increment = () => {
  return defHttp.get({ url: Api.increment });
};

/**
 * @description: 全量重新生成
 */
export const stock = () => {
  return defHttp.get({ url: Api.stock });
};

/**
 * @description: 文件夹内文件md5重命名
 */
export const rename = (params: any) => {
  return defHttp.get({ url: Api.rename, params });
};
