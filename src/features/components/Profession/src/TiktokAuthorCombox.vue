<!-- 博主选择器 -->
<template>
  <ComboBox v-bind="{ ...props, ..._attrs }" v-model:value="modelValue" />
</template>

<script lang="ts" setup>
  import { useAttrs, computed } from 'vue';
  import { VxeGridProps } from 'vxe-table';
  import ComboBox from '@/components/Box/src/ComboBox.vue';
  import { formatDuration } from '@sirpho/utils';
  import { formatSize } from '@/utils/formatter';

  interface Props {
    varient?: string;
    gridProps?: VxeGridProps;
    option?: Option;
    value?: string | number | null | undefined | (string | number)[];
    autoFill?: boolean;
    mode?: string;
    data?: object[];
    transformData?: (raw: unknown) => Record<string, unknown>[];
  }
  interface Option {
    label: string;
    value: string;
  }
  const _attrs = useAttrs();

  const _emits = defineEmits(['update:value']);

  const props = withDefaults(defineProps<Props>(), {
    varient: 'TiktokAuthor',
    gridProps: () => ({
      columns: [
        { field: 'author', title: '作者' },
        { field: 'duration', title: '播放时长' },
        { field: 'size', title: '存储容量' },
        { field: 'videoCount', title: '视频数量' },
      ],
    }),
    value: '',
    autoFill: false,
    option: () => ({ label: 'author', value: 'author' }),
    transformData: (list) => {
      return list.map((item) => ({
        ...item,
        duration: formatDuration(item.totalDuration || 0),
        size: formatSize(item.totalSize || 0),
      }));
    },
  });

  const modelValue = computed({
    get: () => props.value,
    set: (val) => {
      _emits('update:value', val);
    },
  });
</script>

<script lang="ts">
  export default {
    name: 'TiktokAuthorCombox',
  };
</script>
