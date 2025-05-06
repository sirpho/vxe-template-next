<template>
  <PageContainer>
    <Card>
      <template #title>
        <BasicTitle> 桥南沈网络拓扑结构 </BasicTitle>
      </template>
      <template #extra>
        <a href="https://boardmix.cn/app/editor/9Fh71jWneFz2fInnVcJQNQ">使用boardmix画板绘制</a>
      </template>
      <VxeContainer :extraHeight="24">
        <img
          style="max-width: 100%; max-height: 100%"
          src="https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/网络拓扑.png"
          alt="桥南沈网络拓扑结构"
        />
      </VxeContainer>
    </Card>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { BasicTitle } from '@/components/Basic';
  import { Card } from 'ant-design-vue';
</script>
<script lang="ts">
  export default {
    name: 'Network',
  };
</script>

<style lang="less" scoped>
  :deep(.splitpanes__pane) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
