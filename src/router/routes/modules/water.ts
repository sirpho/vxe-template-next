import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const route: AppRouteModule = {
  /**
   * 水量水费
   */
  path: '/water',
  name: 'water',
  component: LAYOUT,
  redirect: '/water/list',
  meta: {
    icon: 'game-icons:water-tank',
    title: t('routes.water.water'),
    orderNo: 14,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'water-list',
      component: () => import('@/views/water/list/index.vue'),
      meta: {
        icon: 'ant-design:thunderbolt-filled',
        title: t('routes.water.list'),
      },
    },
    /**
     * 统计分析
     */
    {
      path: 'waterAnalysis',
      name: 'water-analysis',
      component: () => import('@/views/water/analysis/index.vue'),
      meta: {
        icon: 'carbon:text-link-analysis',
        title: t('routes.water.analysis'),
      },
    },
  ],
};

export default route;
