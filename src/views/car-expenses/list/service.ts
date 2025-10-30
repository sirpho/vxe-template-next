import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/car-expenses/list',
  batch = '/api/car-expenses/batch',
}

/**
 * @description: 列表
 */
export const list = (data: any) => {
  return defHttp.post({ url: Api.list, data });
};

/**
 * @description: 批量操作
 */
export const batch = (data: any) => {
  return defHttp.post({ url: Api.batch, data });
};

/**
 * 类型下拉配置
 */
export const typeOptions: any = {
  gridProps: {
    columns: [{ field: 'value', title: '类型' }],
  },
  autoFill: false,
  action: 'noChange',
  allowInput: false,
  option: { label: 'value', value: 'value' },
};
