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
};

export type Varient = keyof typeof varients;
