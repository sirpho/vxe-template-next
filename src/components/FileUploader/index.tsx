import { UploadOutlined } from '@ant-design/icons-vue';
import { defineComponent, reactive, toRefs, watchEffect, ref } from 'vue';
import { FileUploaderProps } from '@/components/FileUploader/props';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
import { UploadFileStatus } from 'ant-design-vue/lib/upload/interface';
import { message, Upload } from 'ant-design-vue';
import { nanoid } from 'nanoid';
import { useUserStoreWithOut } from '@/store/modules/user';

export default defineComponent({
  name: 'FileUploader',
  props: FileUploaderProps,
  setup(props) {
    const user = useUserStoreWithOut();
    const state = reactive({
      list: [] as any[],
    });

    watchEffect(() => {
      if (props.fileList) {
        const files = props.fileList.map((item) => ({
          uid: nanoid(),
          status: 'done' as UploadFileStatus,
          ...item,
        }));
        // @ts-ignore
        state.list = ref<UploadProps['fileList']>(files);
      }
    });

    const handleChange = (info: UploadChangeParam) => {
      let resFileList = [...info.fileList];

      // 2. read from response and show file link
      resFileList = resFileList.map((file) => {
        // // 这里逻辑可以根据项目进行修改
        if (file.response && file.response.code === 200) {
          // Component will show file.url as link
          if (file.response.data && file.response.data.length > 0) {
            file.url = file.response.data[0].url || file.response.data[0].localUrl;
          }
        }
        return file;
      });

      state.list = resFileList;

      if (info.file.status === 'done') {
        // 这里逻辑可以根据项目进行修改
        if (info.file.response && info.file.response.code !== 200) {
          message.error(info.file.response.msg || '文件上传异常！');
        }
        emit();
      }
    };

    const removeFile = (file) => {
      state.list = state.list.filter((item) => item.uid !== file.uid);
      emit();
    };

    const emit = () => {
      if (props.onChange && typeof props.onChange === 'function') {
        props.onChange(state.list.filter((item) => !!item.url));
      }
    };

    return {
      ...toRefs(state),
      props,
      accessToken: user.getToken,
      removeFile,
      handleChange,
    };
  },
  render() {
    const { list, accessToken, props, removeFile, handleChange } = this;
    return (
      <Upload
        disabled={props.disabled}
        headers={{ token: accessToken }}
        name={'files'}
        action={`${import.meta.env.VITE_GLOB_API_URL}${props.action}`}
        fileList={list}
        onRemove={removeFile}
        onChange={handleChange}
        beforeUpload={props.beforeUpload}
        showUploadList={props.showUploadList}
      >
        {!props.disabled && (
          <a-button size="small" icon={<UploadOutlined />}>
            {props.text}
          </a-button>
        )}
        {props.disabled && list.length <= 0 && <span style="color: rgba(0,0,0,.25)">暂无附件</span>}
      </Upload>
    );
  },
});
