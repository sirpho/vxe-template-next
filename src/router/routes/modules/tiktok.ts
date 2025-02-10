import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

export enum Attrs {
  TIKTOK = 110, //权限
}

const route: AppRouteModule = {
  /**
   * 抖音风
   */
  path: '/tiktok',
  name: 'tiktok',
  component: LAYOUT,
  redirect: '/tiktok/analysis',
  meta: {
    icon: 'ri:tiktok-fill',
    title: t('routes.tiktok.tiktok'),
    orderNo: 30,
    roles: [Attrs.TIKTOK],
  },
  children: [
    /**
     * 统计分析
     */
    {
      path: 'analysis',
      name: 'Analysis',
      component: () => import('@/views/tiktok/analysis/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'icon-park-twotone:analysis',
        title: t('routes.tiktok.analysis'),
      },
    },
    /**
     * 分类标签
     */
    {
      path: 'tiktok-class',
      name: 'TiktokClass',
      component: () => import('@/views/tiktok/class/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'tabler:category-2',
        title: t('routes.tiktok.class'),
      },
    },
    /**
     * 标签设置
     */
    {
      path: 'tiktok-manage',
      name: 'TiktokManage',
      component: () => import('@/views/tiktok/manage/index.vue'),
      meta: {
        // roles: [Attrs.HAS_20223278],
        icon: 'tabler:category-2',
        title: t('routes.tiktok.manage'),
      },
    },
  ],
};

export default route;
