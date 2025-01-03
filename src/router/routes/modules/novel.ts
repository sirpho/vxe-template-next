import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 小说
   */
  path: '/novel',
  name: 'novel',
  component: LAYOUT,
  redirect: '/novel/list',
  meta: {
    icon: 'healthicons:register-book-outline',
    title: t('routes.novel.novel'),
    orderNo: 20,
    // roles: [Attrs.HAS_20223268],
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'novel-list',
      component: () => import('/@/views/novel/list/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'lets-icons:book-duotone-line',
        title: t('routes.novel.list'),
      },
    },
  ],
};

export default route;
