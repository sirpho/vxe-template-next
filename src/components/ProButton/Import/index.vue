<template>
  <Upload name="file" accept=".xlsx, .xls" :show-upload-list="false" :before-upload="beforeUpload">
    <Tooltip v-if="props.tooltip" :title="props.title">
      <Button v-bind="{ ...defaultProps, ...$attrs }">
        <template #icon><DownloadOutlined /></template>
        <slot></slot>
      </Button>
    </Tooltip>
    <Button v-else v-bind="{ ...defaultProps, ...$attrs }">
      <template #icon><DownloadOutlined /></template>
      <slot></slot>
    </Button>
  </Upload>
</template>

<script lang="ts" setup>
  import * as xlsx from 'xlsx';
  import { Upload, Button, Tooltip } from 'ant-design-vue';
  import { DownloadOutlined } from '@ant-design/icons-vue';
  import type { UploadProps } from 'ant-design-vue';
  import { defaultProps } from '../defaultProps';

  const props = withDefaults(defineProps<{ tooltip?: boolean; title?: string }>(), {
    tooltip: true,
    title: '导入规则及模板下载详见右下角按钮',
  });

  const emit = defineEmits<{
    (e: 'afterSheetToJson', value: string[][]): void;
  }>();

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target ? event.target.result : '';
      const workbook = xlsx.read(data, { type: 'binary' });
      // 读取第一个Sheet的数据 (只会读取Sheet 1)
      const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: string[][] = xlsx.utils.sheet_to_json(firstWorksheet, { header: 1 });
      emit('afterSheetToJson', jsonData);
    };

    reader.readAsArrayBuffer(file);
    return false;
  };
</script>
<script lang="ts">
  export default {
    name: 'ImportButton',
  };
</script>
<style lang=""></style>
