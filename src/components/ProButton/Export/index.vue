<template>
  <Button v-bind="{ ...defaultProps, ...$attrs }">
    <template #icon><UploadOutlined /></template>
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
  import { Button } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { defaultProps } from '../defaultProps';
</script>
<script lang="ts">
  export default {
    name: 'Save',
  };
</script>
<style lang=""></style>
