import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/api/tiktok/list',
  batch = '/api/tiktok/batch',
  // classList = '/api/tiktok/class/list',
  classList = '/api/tiktok/class/recentList',
  potPlayer = 'https://localhost.sirpho.top:23456/api/tiktok/player',
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
 * @description: 标签列表
 */
export const getClassList = (data: any) => {
  return defHttp.post({ url: Api.classList, data });
};

/**
 * @description: potPlayer
 */
export const potPlayer = (data: any) => {
  return defHttp.post({ url: Api.potPlayer, data });
};

/**
 * 默认列
 */
export const defaultColumns = [
  { type: 'checkbox', width: 60, fixed: 'left', align: 'center' },
  { title: '序号', width: 60, align: 'center', slots: { default: 'seq' } },
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
    minWidth: 700,
  },
  {
    field: 'duration',
    title: '播放时长',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    slots: { default: 'duration' },
    width: 120,
  },
  {
    field: 'size',
    title: '存储容量',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    slots: { default: 'size' },
    width: 120,
  },
  {
    field: 'bitrate',
    title: '比特率',
    slots: { default: 'bitrate' },
    sortable: true,
    width: 120,
  },
  {
    field: 'classIdList',
    title: '标签',
    editRender: { autofocus: '.ant-input' },
    slots: { edit: 'classIdList', default: 'classIdList_default' },
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    minWidth: 140,
  },
];

/**
 * 可选列
 */
export const optionalColumns = [
  {
    field: 'category',
    title: '类别',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 100,
  },
  {
    field: 'createTime',
    title: '创建时间',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 150,
    formatter: 'time',
  },
  {
    field: 'lastUpdateTime',
    title: '更新时间',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 150,
    formatter: 'time',
  },
  {
    field: 'md5',
    title: 'md5',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 280,
  },
  {
    field: 'suffix',
    title: '后缀名',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 120,
  },
  {
    field: 'id',
    title: 'id',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    width: 120,
  },
  {
    field: 'name',
    title: '文件名称',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
    minWidth: 300,
  },
];
/**
 * 可选表格列
 */
export const fieldComboboxOption = {
  requestTrigger: 'onMount',
  autoFill: false,
  action: 'noChange',
  allowClear: true,
  gridProps: {
    columns: [
      { field: 'field', title: '字段', visible: false },
      { field: 'title', title: '字段' },
    ],
  },
  option: { label: 'title', value: 'field' },
  style: { width: '200px' },
} as any;
