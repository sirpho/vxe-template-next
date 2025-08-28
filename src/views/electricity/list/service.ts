import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/electricity/list',
  batch = '/api/electricity/batch',
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
 * 房屋下拉配置
 */
export const houseOptions: any = {
  gridProps: {
    columns: [
      { field: 'name', title: '房屋', width: '150px' },
      { field: 'value', title: '电费户号' },
    ],
  },
  autoFill: false,
  action: 'noChange',
  allowInput: false,
  option: { label: 'name', value: 'name' },
};
