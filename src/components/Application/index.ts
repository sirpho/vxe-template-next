import { withInstall } from '@/utils';

import appLogo from './src/AppLogo.vue';
import appProvider from './src/AppProvider.vue';
import appSearch from './src/search/AppSearch.vue';
import appLocalePicker from './src/AppLocalePicker.vue';
import appDarkModeToggle from './src/AppDarkModeToggle.vue';

export { useAppProviderContext } from './src/useAppContext';

/**
 * 应用图标
 */
export const AppLogo = withInstall(appLogo);

/**
 * 应用容器
 * 监听大小改变
 */
export const AppProvider = withInstall(appProvider);

/**
 * 菜单搜索
 */
export const AppSearch = withInstall(appSearch);

/**
 * 语言切换器
 */
export const AppLocalePicker = withInstall(appLocalePicker);

/**
 * 昼夜切换器
 */
export const AppDarkModeToggle = withInstall(appDarkModeToggle);
