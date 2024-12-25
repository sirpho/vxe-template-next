import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 抖音风
   */
  path: '/tiktok',
  name: 'tiktok',
  component: LAYOUT,
  redirect: '/tiktok/analysis',
  meta: {
    icon: 'ri:tiktok-fill',
    title: t('routes.tiktok.tiktok'),
    orderNo: 20,
    // roles: [Attrs.HAS_20223268],
  },
  children: [
    /**
     * 统计分析
     */
    {
      path: 'analysis',
      name: 'Analysis',
      component: () => import('/@/views/tiktok/analysis/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'icon-park-twotone:analysis',
        title: t('routes.tiktok.analysis'),
      },
    },
  ],
};

export default route;
