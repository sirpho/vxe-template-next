import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 监测模块
   */
  path: '/expire',
  name: 'expire',
  component: LAYOUT,
  redirect: '/expire/monitor',
  meta: {
    icon: 'material-symbols:monitor-heart-outline-rounded',
    title: t('routes.expire.monitor'),
    orderNo: 1,
    // roles: [Attrs.HAS_20223268],
  },
  children: [
    /**
     * 过期监测
     */
    {
      path: 'monitor',
      name: 'monitor',
      // @ts-ignore
      component: () => import('/@/views/expire/monitor/index.tsx'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'icon-park-outline:medicine-bottle',
        title: t('routes.expire.monitor'),
      },
    },
  ],
};

export default route;
