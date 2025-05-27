export type SelectTableRemoteConfig = {
  url: string;
  method: 'get' | 'post';
  params?: {};
};

export const varients: Record<string, SelectTableRemoteConfig> = {
  // 抖音分类标签
  TiktokClass: {
    url: '/api/tiktok/class/list',
    method: 'post',
  },
  // 抖音博主
  TiktokAuthor: {
    url: '/api/tiktok/analysis',
    method: 'post',
  },
  // 过期监控标签
  TagUtensilCombox: {
    url: '/api/tag/utensil/statistics',
    method: 'post',
  },
  // 过期监控分类
  TypeUtensilCombox: {
    url: '/api/utensil/type/statistics',
    method: 'post',
  },
};

export type Varient = keyof typeof varients;
