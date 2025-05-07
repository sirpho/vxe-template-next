import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';
import { envVersion } from '@/features/utils';

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
    roles: envVersion === 'development' ? undefined : [Attrs.TIKTOK],
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
        icon: 'fluent:tag-24-filled',
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
        icon: 'fluent:person-tag-48-filled',
        title: t('routes.tiktok.manage'),
      },
    },
    /**
     * 博主一览
     */
    {
      path: 'tiktok-author',
      name: 'TiktokAuthor',
      component: () => import('@/views/tiktok/author/index.vue'),
      meta: {
        icon: 'solar:user-id-bold',
        title: t('routes.tiktok.author'),
      },
    },
    /**
     * api
     */
    {
      path: 'tiktok-fetch',
      name: 'TiktokFetch',
      component: () => import('@/views/tiktok/fetch/index.vue'),
      meta: {
        icon: 'eos-icons:api',
        title: t('routes.tiktok.fetch'),
      },
    },
  ],
};

export default route;
