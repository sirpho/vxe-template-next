<!-- 标签(过期监测)选择器 -->
<template>
  <ComboBox v-bind="{ ...props, ..._attrs }" v-model:value="modelValue" />
</template>

<script lang="ts" setup>
  import { useAttrs, computed } from 'vue';
  import { VxeGridProps } from 'vxe-table';
  import { ComboBox } from '@sirpho/components';
  import type { InputProps } from 'ant-design-vue';

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
    transformData?: (raw: unknown) => Record<string, unknown>[];
    /**
     * @description Input属性
     * @link https://www.antdv.com/components/input-cn#API
     */
    inputProps?: InputProps;
  }
  interface Option {
    label: string;
    value: string;
  }
  const _attrs = useAttrs();

  const _emits = defineEmits(['update:value']);

  const props = withDefaults(defineProps<Props>(), {
    variant: 'TagUtensilCombox',
    inputProps: () => ({}),
    gridProps: () => ({
      columns: [
        // { field: 'id', title: '名称' },
        { field: 'name', title: '名称' },
        { field: 'qty', title: '数量' },
      ],
    }),
    value: undefined,
    autoFill: false,
    requestTrigger: 'onMount',
    option: () => ({ label: 'name', value: 'name' }),
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
    name: 'TagUtensilCombox',
  };
</script>
