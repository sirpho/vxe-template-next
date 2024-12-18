<template>
  <Button v-bind="{ ...defaultProps, ...$attrs }">
    <template #icon><CheckOutlined /></template>
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
  import { Button } from 'ant-design-vue';
  import { CheckOutlined } from '@ant-design/icons-vue';
  import { defaultProps } from '../defaultProps';
</script>
<script lang="ts">
  export default {
    name: 'Save',
  };
</script>
<style lang=""></style>
