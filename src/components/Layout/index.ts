import { withInstall } from '@/utils';
import pageContainer from './src/PageContainer/index.vue';
import vxeContainer from './src/VxeContainer/index.vue';
import queryFilterContainer from './src/QueryFilterContainer/index.vue';

/**
 * 查询区域容器
 */
export const QueryFilterContainer = withInstall(queryFilterContainer);

/**
 * 页面容器
 */
export const PageContainer = withInstall(pageContainer);

/**
 * vxeTable 容器
 */
export const VxeContainer = withInstall(vxeContainer);
