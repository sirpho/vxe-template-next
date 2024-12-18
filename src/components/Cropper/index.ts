import { withInstall } from '@/utils';
import cropperImage from './src/Cropper.vue';
import avatarCropper from './src/CropperAvatar.vue';

export * from './src/typing';

/**
 * 图片裁剪
 */
export const CropperImage = withInstall(cropperImage);

/**
 * 头像裁剪
 */
export const CropperAvatar = withInstall(avatarCropper);
