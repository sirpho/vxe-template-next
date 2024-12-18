import { withInstall } from '@/utils';
import type { ExtractPropTypes } from 'vue';
import popConfirmButton from './src/PopConfirmButton.vue';
import { buttonProps } from './src/props';

/**
 * 操作二次确认按钮
 */
export const PopConfirmButton = withInstall(popConfirmButton);
export declare type ButtonProps = Partial<ExtractPropTypes<typeof buttonProps>>;
