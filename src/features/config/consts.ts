export type SelectTableRemoteConfig = {
  url: string;
  method: 'get' | 'post';
  params?: {};
};

export const varients: Record<string, SelectTableRemoteConfig> = {
  // 工厂下拉 - 带权限
  factory: {
    url: '/sy-manager/common/getUserFactoryList',
    method: 'post',
  },
};

export type Varient = keyof typeof varients;
