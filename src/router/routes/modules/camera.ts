import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const route: AppRouteModule = {
  /**
   * 监控
   */
  path: 'camera/:type',
  name: 'camera',
  component: LAYOUT,
  meta: {
    icon: 'jam:video-camera-f',
    title: t('routes.camera.camera'),
    orderNo: 18,
    carryParam: true,
    hidePathForChildren: true,
  },
  children: [
    /**
     * 车库
     */
    {
      path: 'camera/parking',
      name: 'parking',
      // @ts-ignore
      component: () => import('/@/views/camera/rtsp/index.vue'),
      meta: {
        icon: 'cbi:camera-car',
        title: t('routes.camera.parking'),
        carryParam: true,
      },
    },
    /**
     * 平台
     */
    {
      path: 'camera/balcony',
      name: 'balcony',
      // @ts-ignore
      component: () => import('/@/views/camera/rtsp/index.vue'),
      meta: {
        icon: 'material-symbols:outdoor-garden',
        title: t('routes.camera.balcony'),
        carryParam: true,
      },
    },
    /**
     * 大门
     */
    {
      path: 'camera/gate',
      name: 'gate',
      // @ts-ignore
      component: () => import('/@/views/camera/rtsp/index.vue'),
      meta: {
        icon: 'bi:house-door-fill',
        title: t('routes.camera.gate'),
        carryParam: true,
      },
    },
    /**
     * 过道
     */
    {
      path: 'camera/aisle',
      name: 'aisle',
      // @ts-ignore
      component: () => import('/@/views/camera/rtsp/index.vue'),
      meta: {
        icon: 'mingcute:hotel-fill',
        title: t('routes.camera.aisle'),
        carryParam: true,
      },
    },
    /**
     * 后门
     */
    {
      path: 'camera/back',
      name: 'back',
      // @ts-ignore
      component: () => import('/@/views/camera/rtsp/index.vue'),
      meta: {
        icon: 'fluent:door-28-filled',
        title: t('routes.camera.back'),
        carryParam: true,
      },
    },
    /**
     * 楼梯
     */
    {
      path: 'camera/staircase',
      name: 'staircase',
      // @ts-ignore
      component: () => import('/@/views/camera/rtsp/index.vue'),
      meta: {
        icon: 'cbi:roomsstaircase',
        title: t('routes.camera.staircase'),
        carryParam: true,
      },
    },
  ],
};

export default route;
