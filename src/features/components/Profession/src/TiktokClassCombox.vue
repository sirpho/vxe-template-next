<!-- 标签选择器 -->
<template>
  <ComboBox v-bind="{ ...props, ..._attrs }" v-model:value="modelValue" />
</template>

<script lang="ts" setup>
  import { useAttrs, computed } from 'vue';
  import { VxeGridProps } from 'vxe-table';
  import { ComboBox } from '@sirpho/components';

  interface Props {
    /**
     * @description 获取数据源的时机
     */
    requestTrigger?: 'onMount' | 'onFocus' | 'onParamsChange';
    variant?: string;
    gridProps?: VxeGridProps;
    option?: Option;
    value?: string | number | null | undefined | (string | number)[];
    autoFill?: boolean;
    mode?: string;
    data?: object[];
  }
  interface Option {
    label: string;
    value: string;
  }
  const _attrs = useAttrs();

  const _emits = defineEmits(['update:value']);

  const props = withDefaults(defineProps<Props>(), {
    variant: 'TiktokClass',
    requestTrigger: 'onFocus',
    gridProps: () => ({
      columns: [
        { field: 'id', title: '代码', visible: false },
        { field: 'name', title: '标签' },
      ],
    }),
    value: '',
    autoFill: false,
    mode: 'multiple',
    option: () => ({ label: 'name', value: 'id' }),
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
    name: 'TiktokClassCombox',
  };
</script>

<style lang="scss" scoped></style>
