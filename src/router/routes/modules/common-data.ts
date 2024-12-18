import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

export enum Attrs {
  'HAS_20223268' = 20223268, //基础数据
  'HAS_20223278' = 20223278, //工厂产线维护
}

const route: AppRouteModule = {
  /**
   * 基础数据
   */
  path: '/common-data',
  name: 'common-data',
  component: LAYOUT,
  redirect: '/common-data/factory-product-line',
  meta: {
    icon: 'material-symbols:home-and-garden-outline',
    title: t('routes.common-data.common-data'),
    orderNo: 1,
    // roles: [Attrs.HAS_20223268],
  },
  children: [
    /**
     * 工厂产线维护
     */
    {
      path: 'factory-product-line',
      name: 'FactoryProductLine',
      component: () => import('/@/views/common-data/factory-product-line/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        title: t('routes.common-data.factory-product-line'),
      },
    },
  ],
};

export default route;
