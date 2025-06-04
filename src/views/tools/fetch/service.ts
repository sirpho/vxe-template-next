import { defHttp } from '@/utils/http/axios';
import { formatSize } from '@/utils/formatter';

enum Api {
  articleList = '/api/article/list',
  browseArticle = '/api/article/browse/',
  generateResize = '/api/file/resize',
  generateMusic = 'https://localhost.sirpho.top:23456/api/music/generate',
  updateMd5 = 'https://localhost.sirpho.top:23456/api/music/update/md5',
  generateMusicTagger = 'https://localhost.sirpho.top:23456/api/music/generate/tagger',
}

const timeout = 60 * 60 * 1000;

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
  return defHttp.post({ url: Api.generateMusic, timeout });
};

/**
 * @description: 音乐md5更新
 */
export const updateMd5 = () => {
  return defHttp.post({ url: Api.updateMd5, timeout });
};

/**
 * @description: 整理文件大小
 */
export const generateResize = () => {
  return defHttp.post({ url: Api.generateResize, timeout });
};

/**
 * @description: 音乐元数据生成
 */
export const generateMusicTagger = () => {
  return defHttp.post({ url: Api.generateMusicTagger, timeout });
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
