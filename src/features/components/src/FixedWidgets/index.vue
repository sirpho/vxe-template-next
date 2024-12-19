<template>
  <div class="fixed-widgets">
    <Popover v-bind="$attrs" overlayClassName="fixed-widgets-popover" placement="leftBottom">
      <template #content>
        <slot name="content"></slot>
      </template>
      <template #title>
        <slot name="title"></slot>
      </template>
      <Avatar class="fixed-widgets-avatar" size="large" @click="click">
        <template #icon><QuestionOutlined /></template>
      </Avatar>
    </Popover>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { Avatar, Popover } from 'ant-design-vue';
  import { QuestionOutlined } from '@ant-design/icons-vue';

  const visible = ref<boolean>(false);

  const click = () => {
    visible.value = true;
  };
</script>
<script lang="ts">
  export default {
    name: 'FixedWidgets',
  };
</script>
<style lang="scss" scoped>
  .fixed-widgets {
    display: flex;
    position: fixed;
    z-index: 2147483640;
    right: 32px;
    bottom: 64px;
    flex-direction: column;
    cursor: pointer;

    &-avatar {
      transition: color 0.3s;
      background-color: #fff !important;
      box-shadow:
        0 3px 6px -4px #0000001f,
        0 6px 16px #00000014,
        0 9px 28px 8px #0000000d !important;
      color: #000;
    }

    &-popover {
      max-width: calc(100vw - 350px);
    }
  }
</style>
