<template>
  <PageContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...gridOptions }" :data="tableList" :loading="tableLoading" ref="xTable">
        <template #totalSize="{ row }">
          {{ formatSize(row.totalSize || 0) }}
        </template>
        <template #totalDuration="{ row }">
          {{ formatDuration(row.totalDuration || 0) }}
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { VxeTableInstance, VxeGridProps } from 'vxe-table';
  import { list } from './service';
  import { formatSize } from '@/utils/formatter';
  import { formatDuration } from '@sirpho/utils';

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    columns: [
      { type: 'seq', title: '序号', width: 120, align: 'center' },
      {
        field: 'author',
        title: '作者',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 200,
      },
      {
        field: 'videoCount',
        title: '视频数量',
        sortable: true,
      },
      {
        field: 'totalSize',
        title: '存储容量',
        sortable: true,
        slots: { default: 'totalSize' },
      },
      {
        field: 'totalDuration',
        title: '播放时长',
        sortable: true,
        slots: { default: 'totalDuration' },
      },
    ],
    showHeaderOverflow: 'tooltip',
    height: 'auto',
  });

  onMounted(() => {
    handleQuery();
  });

  /**
   * 查询
   */
  const handleQuery = async () => {
    tableLoading.value = true;
    const res = await list({}).finally(() => {
      tableLoading.value = false;
    });
    tableList.value = res.data || [];
  };
</script>
<script lang="ts">
  export default {
    name: 'TiktokAuthor',
  };
</script>
