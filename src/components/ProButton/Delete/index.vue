<template>
  <Button v-bind="{ ...defaultProps, ...$attrs }">
    <template #icon><close-outlined /></template>
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
  import { Button } from 'ant-design-vue';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { defaultProps } from '../defaultProps';
</script>
<script lang="ts">
  export default {
    name: 'Delete',
  };
</script>
<style lang="less"></style>
