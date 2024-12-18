<template>
  <FixedWidgets v-if="!loading && isValid">
    <template #content>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="content"></div>
    </template>
  </FixedWidgets>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import to from 'await-to-js';
  import FixedWidgets from '../FixedWidgets';
  import { listenerRouteChange } from '@/logics/mitt/routeChange';
  import { WHITE_NAME_LIST } from '@/router';
  import { initServer } from './server';

  const loading = ref<boolean>(true);
  const isValid = ref<boolean>(false);
  const content = ref<string>('');

  onMounted(() => {
    listenerRouteChange((route) => {
      const { name } = route;
      if (WHITE_NAME_LIST.includes(name as string)) {
        return;
      }
      init({ moduleUrl: name });
    });
  });

  const init = async (params) => {
    loading.value = true;
    content.value = '';
    const [err, resp] = await to(initServer(params));
    loading.value = false;
    if (err) return;
    const { success, data } = resp;
    const { helpUrl } = data;
    if (success && helpUrl) {
      isValid.value = true;
      content.value = helpUrl;
      return;
    }
    isValid.value = false;
  };
</script>

<script lang="ts">
  export default {
    name: 'ProPageHelper',
  };
</script>
