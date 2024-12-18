import { withInstall } from '@/utils';
import collapseContainer from './src/collapse/CollapseContainer.vue';
import scrollContainer from './src/ScrollContainer.vue';

/**
 * 伸缩容器
 */
export const CollapseContainer = withInstall(collapseContainer);

/**
 * 滚动容器
 */
export const ScrollContainer = withInstall(scrollContainer);

export * from './src/typing';
