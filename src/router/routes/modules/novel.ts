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
    icon: 'material-symbols:book-4-rounded',
    title: t('routes.novel.novel'),
    orderNo: 11,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'novel-list',
      component: () => import('@/views/novel/list/index.vue'),
      meta: {
        icon: 'lets-icons:book-duotone-line',
        title: t('routes.novel.list'),
      },
    },
    /**
     * 统计分析
     */
    {
      path: 'analysis',
      name: 'novel-analysis',
      component: () => import('@/views/novel/analysis/index.vue'),
      meta: {
        icon: 'carbon:text-link-analysis',
        title: t('routes.novel.analysis'),
      },
    },
  ],
};

export default route;
