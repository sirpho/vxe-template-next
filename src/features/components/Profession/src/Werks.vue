<!-- 工厂选择器 -->
<template>
  <ComboBox v-bind="{ ...props, ..._attrs }" v-model:value="modelValue" />
</template>

<script lang="ts" setup>
  import { useAttrs, computed } from 'vue';
  import { VxeGridProps } from 'vxe-table';
  import type { SelectTableProps } from '@/features/components/ProSelectTable/typing';

  interface Props {
    varient?: string;
    gridProps?: VxeGridProps;
    option?: Option;
    value: SelectTableProps['value'];
    autoFill?: boolean;
  }
  interface Option {
    label: string;
    value: string;
  }
  const _attrs = useAttrs();

  const _emits = defineEmits(['update:value']);

  const props = withDefaults(defineProps<Props>(), {
    varient: 'factory',
    gridProps: () => ({
      columns: [
        { field: 'factoryCode', title: '工厂代码', width: '150px' },
        { field: 'factoryName', title: '工厂名称' },
      ],
    }),
    value: '',
    autoFill: true,
    option: () => ({ label: 'factoryCode', value: 'factoryCode' }),
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
    name: 'Werks',
  };
</script>

<style lang="scss" scoped></style>
