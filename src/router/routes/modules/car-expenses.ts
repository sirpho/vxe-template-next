import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const route: AppRouteModule = {
  /**
   * 用车费用
   */
  path: '/car-expenses',
  name: 'car-expenses',
  component: LAYOUT,
  redirect: '/car-expenses/list',
  meta: {
    icon: 'jam:car-f',
    title: t('routes.car-expenses.car-expenses'),
    orderNo: 13,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'car-expenses-list',
      component: () => import('@/views/car-expenses/list/index.vue'),
      meta: {
        icon: 'arcticons:calgary-transit-my-fare',
        title: t('routes.car-expenses.list'),
      },
    },
    // /**
    //  * 统计分析
    //  */
    // {
    //   path: 'car-expensesAnalysis',
    //   name: 'car-expenses-analysis',
    //   component: () => import('@/views/car-expenses/analysis/index.vue'),
    //   meta: {
    //     icon: 'carbon:text-link-analysis',
    //     title: t('routes.car-expenses.analysis'),
    //   },
    // },
  ],
};

export default route;
