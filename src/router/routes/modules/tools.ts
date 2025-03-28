import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 工具集
   */
  path: '/tools',
  name: 'tools',
  component: LAYOUT,
  redirect: '/tools/obs',
  meta: {
    icon: 'mingcute:tool-fill',
    title: t('routes.tools.tools'),
    orderNo: 10,
    // roles: [Attrs.HAS_20223268],
  },
  children: [
    /**
     * 文件夹图标生成
     */
    {
      path: 'desktop',
      name: 'desktop',
      // @ts-ignore
      component: () => import('@/views/tools/desktop/index.tsx'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'ph:desktop-duotone',
        title: t('routes.tools.desktop'),
      },
    },

    /**
     * dns配置
     */
    {
      path: 'dns',
      name: 'dns',
      // @ts-ignore
      component: () => import('@/views/tools/dns/index.tsx'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'eos-icons:dns',
        title: t('routes.tools.dns'),
      },
    },

    /**
     * obs上传
     */
    {
      path: 'obs',
      name: 'obs',
      // @ts-ignore
      component: () => import('@/views/tools/obs/index.tsx'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'line-md:cloud-up',
        title: t('routes.tools.obs'),
      },
    },

    /**
     * 网络拓扑
     */
    {
      path: 'network',
      name: 'network',
      component: () => import('@/views/tools/network/index.vue'),
      meta: {
        icon: 'carbon:network-3',
        title: t('routes.tools.network'),
      },
    },
  ],
};

export default route;
