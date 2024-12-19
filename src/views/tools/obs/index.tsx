import { Button, Input, message, Switch, Image } from 'ant-design-vue';
import ObsClient from 'esdk-obs-browserjs';
import './index.less';
import { list, save } from './service';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { nanoid } from 'nanoid';
import { PageContainer, VxeContainer } from '@/components/Layout';
import { VxeGrid, VxeGridProps } from 'vxe-table';

export default defineComponent({
  setup() {
    const fileInputRef = ref();
    const state = reactive({
      folder: 'sirpho',
      existFile: false,
      upLoading: false,
      loading: false,
      visible: false,
      previewSrc: '',
      rename: false,
      tableData: [],
    });

    const { VITE_OBS_AK, VITE_OBS_SK } = import.meta.env;
    const BUCKET = 'fe-static';
    const ENDPOINT = 'obs.cn-hz1.ctyun.cn';
    const ACCESS_DOMAIN = 'fe-static.obs.cn-hz1.ctyun.cn';

    const obsClient = new ObsClient({
      access_key_id: VITE_OBS_AK,
      secret_access_key: VITE_OBS_SK,
      server: `https://${ENDPOINT}`,
    });

    const gridOptions = reactive<VxeGridProps>({
      keepSource: true,
      columns: [
        {
          field: 'name',
          title: '文件名',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          align: 'center',
          width: 300,
          slots: { default: 'name' },
        },
        {
          field: 'suffix',
          title: '后缀名',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          width: 120,
        },
        {
          field: 'originalName',
          title: '原文件名',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          width: 200,
        },
        {
          field: 'size',
          title: '文件大小',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          width: 120,
        },
        {
          field: 'url',
          title: '对象存储服务器路径',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          slots: { default: 'url' },
        },
      ],
      showHeaderOverflow: 'tooltip',
      height: 'auto',
    });

    onMounted(() => {
      query();
    });

    const query = () => {
      state.loading = true;
      list({ page: 1, pageSize: Number.MAX_SAFE_INTEGER })
        .then((response) => {
          const result = response?.data || response?.page;
          state.tableData = (result?.records || []).map((item) => ({
            ...item,
            size: formatSize(item.size),
          }));
        })
        .finally(() => {
          state.loading = false;
        });
    };

    /**
     * 修改文件时带出文件名
     * @param e
     */
    const handleChangeFile = (e) => {
      const [file] = e.target.files;
      state.existFile = !!file;
    };

    /**
     * 上传
     */
    const handleUpload = async () => {
      state.upLoading = true;
      for (const file of fileInputRef.value.files) {
        await handleUploadSingle(file);
      }
      state.upLoading = false;
      query();
    };

    const handleUploadSingle = (file) => {
      return new Promise((resolve, reject) => {
        const { folder, rename } = state;
        const originalName = file.name;
        let suffix = '';
        if (originalName.indexOf('.') !== -1) {
          suffix = originalName.split('.').pop();
        }

        let nextName = nanoid().replaceAll('-', '');
        if (suffix) {
          nextName += `.${suffix}`;
        }

        const name = rename ? nextName : file.name;

        let key = '';
        if (folder) {
          key = `${folder}/${name}`;
        } else {
          key = name;
        }

        obsClient.putObject(
          {
            Bucket: BUCKET,
            Key: key,
            SourceFile: file,
          },
          (err, _result) => {
            if (err) {
              message.error('上传失败，请稍后重试');
              reject(err);
            } else {
              const objectUrl = `https://${ACCESS_DOMAIN}/${key}`;
              save({
                suffix: suffix,
                name: name,
                originalName: originalName,
                size: file.size,
                url: objectUrl,
              }).then(() => {
                resolve(objectUrl);
              });
            }
          },
        );
      });
    };

    /**
     * 复制下载链接
     */
    const handleCopy = (record: any) => {
      navigator.clipboard.writeText(record.url);
      message.success('复制成功');
    };

    /**
     * 判断是否是图片文件
     * @param record
     */
    const isImage = (record: any) => {
      return [
        'webp',
        'awebp',
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'tiff',
        'tif',
        'ico',
        'svg',
        'ps',
        'psd',
      ].includes(record.suffix);
    };

    /**
     * 文件大小格式化
     */
    const formatSize = (bits: number) => {
      const units = ['B', 'KB', 'MB', 'G'];
      let i = 0;
      while (bits >= 1024) {
        bits /= 1024;
        i++;
      }
      return bits.toFixed(1) + ' ' + units[i];
    };

    const handlePreview = (record) => {
      state.previewSrc = record.url;
      state.visible = true;
    };

    return () => {
      return (
        <PageContainer className={'obs-page'}>
          <VxeContainer direction="vertical" size={[20, 80]}>
            <div class="operation-bar">
              <input
                type="file"
                ref={fileInputRef}
                multiple={true}
                onChange={(e) => handleChangeFile(e)}
              />
              <Input v-model:value={state.folder} addonBefore={'文件夹'} />
              <Switch
                v-model:checked={state.rename}
                checked-children="系统重命名"
                un-checked-children="保持原文件名"
              />
              {/*<Input v-model:value={state.name} addonBefore={'文件名'} />*/}
              <Button
                type="primary"
                disabled={!state.existFile}
                loading={state.upLoading}
                onClick={() => handleUpload()}
              >
                上传
              </Button>
            </div>

            <VxeGrid
              {...gridOptions}
              data={state.tableData}
              loading={state.loading}
              v-slots={{
                name: ({ row }) => {
                  return isImage(row) ? (
                    <Button type={'link'} onClick={() => handlePreview(row)}>
                      {row.name}
                    </Button>
                  ) : (
                    row.name
                  );
                },
                url: ({ row }) => {
                  return (
                    <Button type={'link'} onClick={() => handleCopy(row)}>
                      {row.url}
                    </Button>
                  );
                },
              }}
            />
          </VxeContainer>

          <Image
            style={{ display: 'none' }}
            preview={{
              visible: state.visible,
              onVisibleChange: (value) => (state.visible = value),
            }}
            src={state.previewSrc}
          />
        </PageContainer>
      );
    };
  },
});
