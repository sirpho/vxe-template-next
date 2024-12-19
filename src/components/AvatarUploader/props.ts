import { PropType } from 'vue';

export const Props = {
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  action: {
    type: String as PropType<string>,
    default: '/file/upload',
  },
  onChange: {
    type: Function as PropType<(fileList: any) => void>,
  },
  value: {
    type: String as PropType<string>,
    default: '',
  },
};
