import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 基础数据
   */
  path: '/common-data',
  name: 'common-data',
  component: LAYOUT,
  redirect: '/common-data/enum',
  meta: {
    icon: 'lets-icons:setting-fill',
    title: t('routes.common-data.common-data'),
    orderNo: 20,
  },
  children: [
    /**
     * 枚举字段管理
     */
    {
      path: 'enum',
      name: 'Enum',
      component: () => import('/@/views/common-data/enum/index.vue'),
      meta: {
        icon: 'codicon:symbol-enum',
        title: t('routes.common-data.enum'),
      },
    },
  ],
};

export default route;
