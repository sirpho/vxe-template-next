import { defHttp } from '@/utils/http/axios';
import { formatSize } from '@/utils/formatter';

enum Api {
  increment = 'https://localhost.sirpho.top:23456/api/tiktok/increment/generate',
  stock = 'https://localhost.sirpho.top:23456/api/tiktok/stock/generate',
  rename = 'https://localhost.sirpho.top:23456/api/file/rename',
  removeStaleRecords = 'https://localhost.sirpho.top:23456/api/tiktok/remove/stale/records',
  removePathRecords = 'https://localhost.sirpho.top:23456/api/tiktok/remove/path/records',
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
  return defHttp.get({ url: Api.rename, params, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 移除无效记录
 */
export const removeStaleRecords = () => {
  return defHttp.post({ url: Api.removeStaleRecords, timeout: 60 * 60 * 1000 });
};

/**
 * @description: 删除文件和记录
 */
export const removePathRecords = (data: any[]) => {
  return defHttp.post({ url: Api.removePathRecords, data, timeout: 60 * 60 * 1000 });
};

export const tiktokColumns = [
  { type: 'seq', title: '序号', width: 120, align: 'center' },
  {
    field: 'author',
    title: '作者',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 120,
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
  // {
  //   field: 'suffix',
  //   title: '后缀名',
  //   sortable: true,
  //   filters: [{}],
  //   filterRender: { name: 'FilterExtend' },
  //   width: 110,
  // },
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

export const repeatColumns = [
  { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
  {
    field: 'md5',
    title: 'md5',
    sortable: true,
  },
  {
    field: 'author',
    title: '作者',
    sortable: true,
    width: 120,
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
    field: 'size',
    title: '文件大小',
    sortable: true,
    width: 100,
    sortBy: 'size',
    formatter: ({ row }) => {
      return formatSize(row.size || 0);
    },
  },
];

export const colors: string[] = [
  '#fc8452',
  '#DDBEF6',
  '#73c0de',
  '#fac858',
  '#91cc75',
  '#C3E7FE',
  '#5470c6',
  '#F3D9E4',
  '#AFF0B5',
  '#F7BAEF',
  '#BEDAFF',
  '#B7F4EC',
  '#FFE4BA',
  '#ee6666',
  '#FEFEBE',
  '#D4E4F8',
  '#FDDDC3',
  '#3ba272',
  '#FDCDC5',
  '#BCC3FC',
  '#EDF8BB',
];
