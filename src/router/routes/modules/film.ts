import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

// export enum Attrs {
//   'HAS_20223268' = 20223268, //基础数据
// }

const route: AppRouteModule = {
  /**
   * 影视
   */
  path: '/film',
  name: 'film',
  component: LAYOUT,
  redirect: '/film/list',
  meta: {
    icon: 'mdi:film-open-play',
    title: t('routes.film.film'),
    orderNo: 12,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'film-list',
      component: () => import('@/views/film/list/index.vue'),
      meta: {
        icon: 'lets-icons:book-duotone-line',
        title: t('routes.film.list'),
      },
    },
    /**
     * 统计分析
     */
    {
      path: 'analysis',
      name: 'film-analysis',
      component: () => import('@/views/film/analysis/index.vue'),
      meta: {
        icon: 'carbon:text-link-analysis',
        title: t('routes.film.analysis'),
      },
    },
  ],
};

export default route;
