<template>
  <div :class="`file-name-cell ${disabled ? 'file-name-cell-disabled' : ''}`">
    <FileUploader
      :fileList="props.fileList"
      :showUploadList="false"
      @change="(files: any[]) => handleChangeFile(files)"
    />

    <template v-for="(item, index) in props.fileList" :key="item.url">
      <Popover v-if="item.url && isImgTypeByName(item.url)" overlayClassName="popover-img">
        <template #content>
          <Image :src="encodeFileUrl(item.url)" :width="250" />
        </template>
        <span class="file-name-wrapper">
          <a :href="encodeFileUrl(item.url)" :download="item.name" class="file-name">
            {{ item.name || filterFileName(item.url) }}
          </a>
          <close-circle-outlined
            v-if="!disabled"
            style="color: #f56c6c"
            @click="() => handleRemoveFile(index)"
          />
        </span>
      </Popover>
      <span v-else class="file-name-wrapper">
        <a :href="encodeFileUrl(item.url)" :download="item.name" class="file-name">
          {{ item.name || filterFileName(item.url) }}
        </a>
        <close-circle-outlined
          v-if="!disabled"
          style="color: #f56c6c"
          @click="() => handleRemoveFile(index)"
        />
      </span>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { isImgTypeByName } from '@/utils/is';
  import { encodeFileUrl, filterFileName } from '@/utils';
  import { Image, Popover } from 'ant-design-vue';
  import FileUploader from '@/components/FileUploader';
  import { CloseCircleOutlined } from '@ant-design/icons-vue';

  interface Props {
    fileList: any[];
    disabled?: boolean;
  }
  const props = withDefaults(defineProps<Props>(), {
    fileList: () => [],
    disabled: false,
  });

  const emits = defineEmits(['handleChangeFile', 'handleRemoveFile']);

  /**
   * 修改文件
   */
  const handleChangeFile = (files: any[]) => {
    emits('handleChangeFile', files);
  };
  /**
   * 删除文件
   */
  const handleRemoveFile = (index: number) => {
    emits('handleRemoveFile', index);
  };
</script>

<style lang="less" scoped>
  .file-name-cell {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 6px;

    .ant-upload-wrapper {
      flex-basis: 24px;
    }

    .file-name-wrapper {
      display: flex;
      flex: 1;
      align-items: center;
      overflow: hidden;
      gap: 2px;

      .file-name {
        max-width: calc(100% - 22px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .anticon-close-circle {
        margin-top: 1px;
      }
    }

    &.file-name-cell-disabled {
      .file-name {
        max-width: 100%;
      }
    }
  }
</style>
