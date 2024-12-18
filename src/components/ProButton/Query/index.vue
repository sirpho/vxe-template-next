<template>
  <Button html-type="submit" v-bind="{ ...defaultProps, ...$attrs }">
    <template #icon><SearchOutlined /></template>
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
  import { Button } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { defaultProps } from '../defaultProps';
</script>
<script lang="ts">
  export default {
    name: 'Create',
  };
</script>
<style lang=""></style>
