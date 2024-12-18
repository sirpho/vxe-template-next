<template>
  <PageContainer style="min-height: calc(100vh - 90px)">
    <PageWrapper>
      <template #headerContent> <WorkbenchHeader /> </template>
    </PageWrapper>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import WorkbenchHeader from './components/WorkbenchHeader.vue';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';

  const setting = useRootSetting();

  console.log('权限模式', setting.getPermissionMode.value);

  const loading = ref(true);

  setTimeout(() => {
    loading.value = false;
  }, 1500);
</script>
