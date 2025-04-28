import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const route: AppRouteModule = {
  /**
   * 音乐
   */
  path: '/music',
  name: 'music',
  component: LAYOUT,
  redirect: '/music/list',
  meta: {
    icon: 'material-symbols-light:music-cast',
    title: t('routes.music.music'),
    orderNo: 12,
  },
  children: [
    /**
     * 数据维护
     */
    {
      path: 'list',
      name: 'music-list',
      component: () => import('@/views/music/list/index.vue'),
      meta: {
        icon: 'mdi:music-note-plus',
        title: t('routes.music.list'),
      },
    },
    /**
     * 统计分析
     */
    {
      path: 'analysis',
      name: 'music-analysis',
      component: () => import('@/views/music/analysis/index.vue'),
      meta: {
        icon: 'carbon:text-link-analysis',
        title: t('routes.music.analysis'),
      },
    },
  ],
};

export default route;
