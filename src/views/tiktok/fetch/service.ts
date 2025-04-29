import { defHttp } from '@/utils/http/axios';

enum Api {
  increment = 'https://localhost.sirpho.top:23456/api/tiktok/increment/generate',
  stock = 'https://localhost.sirpho.top:23456/api/tiktok/stock/generate',
  rename = 'https://localhost.sirpho.top:23456/api/file/rename',
  generateMusic = 'https://localhost.sirpho.top:23456/api/music/generate',
}

/**
 * @description: 增量文件重命名
 */
export const increment = () => {
  return defHttp.get({ url: Api.increment, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 全量重新生成
 */
export const stock = () => {
  return defHttp.get({ url: Api.stock, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 音乐生成
 */
export const generateMusic = () => {
  return defHttp.get({ url: Api.generateMusic, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 文件夹内文件md5重命名
 */
export const rename = (params: any) => {
  return defHttp.get({ url: Api.rename, params, timeout: 60 * 60 * 1000 });
};
