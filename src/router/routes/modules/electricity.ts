import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 电量电费
   */
  path: '/electricity',
  name: 'electricity',
  component: LAYOUT,
  redirect: '/electricity/list',
  meta: {
    icon: 'pepicons-pop:electricity',
    title: t('routes.electricity.electricity'),
    orderNo: 14,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'electricity-list',
      component: () => import('@/views/electricity/list/index.vue'),
      meta: {
        icon: 'ant-design:thunderbolt-filled',
        title: t('routes.electricity.list'),
      },
    },
    /**
     * 统计分析
     */
    {
      path: 'ElectricityAnalysis',
      name: 'electricity-analysis',
      component: () => import('@/views/electricity/analysis/index.vue'),
      meta: {
        icon: 'carbon:text-link-analysis',
        title: t('routes.electricity.analysis'),
      },
    },
  ],
};

export default route;
