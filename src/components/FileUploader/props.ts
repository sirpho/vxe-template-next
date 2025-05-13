import { PropType } from 'vue';

export type RawFileItem = {
  name: string;
  url: string;
  uid?: string;
  id?: string;
};

export const FileUploaderProps = {
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  showUploadList: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  action: {
    type: String as PropType<string>,
    default: '/api/file/upload',
  },
  onChange: {
    type: Function as PropType<(fileList: any) => void>,
  },
  fileList: {
    type: Array as PropType<RawFileItem[]>,
    default: () => [],
  },
  beforeUpload: {
    type: Function as PropType<(fileList: any) => void>,
  },
  text: {
    type: String as PropType<string>,
  },
};
