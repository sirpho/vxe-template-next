/**
The routing of this file will not show the layout.
It is an independent new page.
the contents of the file still need to log in to access
 */
import type { AppRouteModule } from '@/router/types';

// 主框架外的页面
export const mainOutRoutes: AppRouteModule[] = [];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
