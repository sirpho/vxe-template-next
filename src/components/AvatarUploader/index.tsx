import { computed, defineComponent, reactive } from 'vue';
import { Props } from './props';
import { message, Upload, UploadChangeParam, Image } from 'ant-design-vue';
import { useUserStoreWithOut } from '@/store/modules/user';
import { useGlobSetting } from '@/hooks/setting';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'AvatarUploader',
  props: Props,
  setup(props, { emit }) {
    const user = useUserStoreWithOut();
    const { apiUrl = '' } = useGlobSetting();
    const state = reactive({
      loading: false,
    });

    const modelValue = computed({
      get: () => props.value,
      set: (v) => {
        emit('update:value', v);
      },
    });

    /**
     *  提交改变
     * @param v
     */
    const handleEmit = (v: string) => {
      modelValue.value = v;
    };

    const handleChange = (info: UploadChangeParam) => {
      if (info.file.status === 'uploading') {
        state.loading = true;
        return;
      }
      if (info.file.status === 'done') {
        state.loading = false;

        const file = info.fileList?.pop();
        if (file && file.response && file.response.code === 200) {
          if (file.response.data && file.response.data.length > 0) {
            const url = file.response.data[0].url || file.response.data[0].localUrl;
            handleEmit(url);
          }
        }
      }
      if (info.file.status === 'error') {
        state.loading = false;
        message.error('上传失败');
      }
    };

    const beforeUpload = (file: any) => {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isImage) {
        message.error('请选择图片文件');
      }
      return isImage;
    };

    const avatar = (preview: boolean) =>
      modelValue.value ? (
        <Image src={modelValue.value} preview={preview} alt="avatar" />
      ) : (
        <div class={'upload-text'}>
          {state.loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div class="ant-upload-text">封面</div>
        </div>
      );

    return () => {
      return (
        <div>
          {props.disabled ? (
            avatar(true)
          ) : (
            <Upload
              accept={props.accept}
              headers={{ token: user.getToken }}
              name={'files'}
              list-type="picture-card"
              show-upload-list={false}
              action={`${apiUrl}${props.action}`}
              onChange={handleChange}
              beforeUpload={beforeUpload}
            >
              {avatar(false)}
            </Upload>
          )}
        </div>
      );
    };
  },
});
