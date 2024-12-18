<template>
  <span @click="click">
    <slot></slot>
  </span>
</template>

<script lang="ts">
  export default {
    name: 'ProViewer',
  };
</script>
<script lang="ts" setup>
  import { Base64 } from 'js-base64';
  import { proViewerProps } from './props';

  const props = defineProps(proViewerProps);

  const click = () => {
    const { source } = props;
    if (!source) return;
    window.open('https://kkview.wahaha.com.cn/onlinePreview?url=' + encodeURIComponent(Base64.encode(source)));
  };
</script>

<style lang="" scoped></style>
