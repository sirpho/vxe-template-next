import { withInstall } from '@/utils';
import comboBox from './src/ComboBox.vue';
import modalBox from './src/ModalBox.vue';

/**
 * 多列下拉选择
 */
export const ComboBox = withInstall(comboBox);

/**
 * 弹窗选择器
 */
export const ModalBox = withInstall(modalBox);
