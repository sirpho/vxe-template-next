import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 小城食记
   */
  path: '/delicacy',
  name: 'delicacy',
  component: LAYOUT,
  redirect: '/delicacy/list',
  meta: {
    icon: 'emojione-monotone:pot-of-food',
    title: t('routes.delicacy.delicacy'),
    orderNo: 12,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'delicacy-list',
      component: () => import('/@/views/delicacy/list/index.vue'),
      meta: {
        icon: 'dashicons:food',
        title: t('routes.delicacy.list'),
      },
    },
    /**
     * 统计分析
     */
    {
      path: 'delicacyAnalysis',
      name: 'delicacy-analysis',
      component: () => import('/@/views/delicacy/analysis/index.vue'),
      meta: {
        icon: 'carbon:text-link-analysis',
        title: t('routes.delicacy.analysis'),
      },
    },
  ],
};

export default route;
