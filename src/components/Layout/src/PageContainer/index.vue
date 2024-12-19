<template>
  <div data-component-name="wui-pro-page-container" class="wui-pro-page-container">
    <slot></slot>
  </div>
</template>
<script lang="ts">
  export default {
    name: 'PageContainer',
  };
</script>
<style lang="scss">
  .wui-pro-page-container {
    padding: 0.5rem;
  }
</style>
