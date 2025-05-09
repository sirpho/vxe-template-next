import { defHttp } from '@/utils/http/axios';
import { formatSize } from '@/utils/formatter';

enum Api {
  increment = 'https://localhost.sirpho.top:23456/api/tiktok/increment/generate',
  stock = 'https://localhost.sirpho.top:23456/api/tiktok/stock/generate',
  rename = 'https://localhost.sirpho.top:23456/api/file/rename',
  generateDancer = '/api/dancer/generate',
  repeat = '/api/tiktok/repeat',
}

/**
 * @description: 增量文件重命名
 */
export const increment = () => {
  return defHttp.post({ url: Api.increment, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 全量重新生成
 */
export const stock = () => {
  return defHttp.post({ url: Api.stock, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 博主整理
 */
export const generateDancer = () => {
  return defHttp.post({ url: Api.generateDancer, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 重复文件查询
 */
export const repeat = () => {
  return defHttp.post({ url: Api.repeat, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 文件夹内文件md5重命名
 */
export const rename = (params: any) => {
  return defHttp.post({ url: Api.rename, params, timeout: 60 * 60 * 1000 });
};

export const tiktokColumns = [
  { type: 'seq', title: '序号', width: 120, align: 'center' },
  {
    field: 'author',
    title: '作者',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
  },
  {
    field: 'path',
    title: '路径',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
  },
  {
    field: 'name',
    title: '文件名',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
  },
  {
    field: 'suffix',
    title: '后缀名',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
  },
];

export const renameColumns = [
  { type: 'seq', title: '序号', width: 120, align: 'center' },
  {
    field: 'originalName',
    title: '原文件名',
    sortable: true,
  },
  {
    field: 'name',
    title: '重命名后文件名',
    sortable: true,
  },
  {
    field: 'size',
    title: '文件大小',
    sortable: true,
    sortBy: 'size',
    formatter: ({ row }) => {
      return formatSize(row.size || 0);
    },
  },
];
