<template>
  <Button v-bind="{ ...defaultProps, ...$attrs }">
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
  import { Button } from 'ant-design-vue';
  import { defaultProps } from '../defaultProps';
</script>
<script lang="ts">
  export default {
    name: 'Check',
  };
</script>
<style lang="less"></style>
