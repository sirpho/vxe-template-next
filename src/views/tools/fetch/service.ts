import { defHttp } from '@/utils/http/axios';
import { formatSize } from '@/utils/formatter';

enum Api {
  articleList = '/api/article/list',
  browseArticle = '/api/article/browse/',
  generateMusic = 'https://localhost.sirpho.top:23456/api/music/generate',
}

/**
 * @description: 文章列表
 */
export const getArticleList = () => {
  return defHttp.get({
    url: Api.articleList,
    params: {
      pageNum: 1,
      pageSize: 9999,
    },
  });
};

/**
 * @description: 文章内容
 */
export const browseArticle = (id: string) => {
  return defHttp.get({
    url: `${Api.browseArticle}${id}`,
  });
};

/**
 * @description: 音乐生成
 */
export const generateMusic = () => {
  return defHttp.get({ url: Api.generateMusic, timeout: 60 * 60 * 1000 });
};

export const musicColumns = [
  { type: 'seq', title: '序号', width: 120, align: 'center' },
  {
    field: 'name',
    title: '名称',
    sortable: true,
  },
  {
    field: 'singer',
    title: '歌手',
    sortable: true,
  },
  {
    field: 'language',
    title: '语言',
    sortable: true,
  },
  {
    field: 'lyric',
    title: '有歌词',
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
  {
    field: 'suffix',
    title: '后缀',
    sortable: true,
  },
  {
    field: 'duration',
    title: '时长',
    sortBy: 'duration',
    formatter: ({ row }) => {
      const duration = row.duration || 0;
      const minute = Math.floor(duration / 60);
      const second = duration % 60;

      return duration ? `${(minute ? minute + '分钟' : '') + (second ? second + '秒' : '')}` : '';
    },
    sortable: true,
  },
  {
    field: 'path',
    title: '路径',
    sortable: true,
    filters: [{}],
    filterRender: { name: 'FilterExtend' },
  },
];
