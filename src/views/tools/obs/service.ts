import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/cloudFile/list',
  save = '/api/cloudFile/save',
  remove = '/api/cloudFile/remove/',
  upload = '/api/cloudFile/upload',
}

/**
 * @description: 列表
 */
export const list = (data: any) => {
  return defHttp.get({ url: Api.list, data });
};

/**
 * @description: 新增
 */
export const save = (data: any) => {
  return defHttp.post({ url: Api.save, data });
};

/**
 * @description: 删除
 */
export const remove = (id: string) => {
  return defHttp.get({ url: `${Api.remove}${id}` });
};

/**
 * @description: 上传
 */
export const upload = (data: FormData) => {
  return defHttp.defaultPost({
    url: Api.upload,
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
