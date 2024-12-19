<template>
  <div data-component-name="wui-query-filter-container" class="wui-query-filter-container">
    <slot></slot>
  </div>
</template>
<script lang="ts">
  export default {
    name: 'QueryFilterContainer',
  };
</script>
<style lang="scss" scoped>
  .wui-query-filter-container {
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.5rem 0;
    background-color: #fff;
  }

  .wui-query-filter-container ::v-deep(.ant-form-inline .ant-form-item) {
    margin-bottom: 8px;
  }

  .wui-query-filter-container ::v-deep(.ant-form-item-label > label) {
    height: 24px;
  }

  .wui-query-filter-container ::v-deep(.ant-form-item-control-input) {
    min-height: unset;
  }
</style>
