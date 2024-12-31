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
    icon: 'ic:baseline-batch-prediction',
    title: t('routes.electricity.electricity'),
    orderNo: 20,
    // roles: [Attrs.HAS_20223268],
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'list',
      component: () => import('/@/views/electricity/list/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'codicon:symbol-enum',
        title: t('routes.electricity.list'),
      },
    },
  ],
};

export default route;
