<template>
  <PageContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...gridOptions }" :data="tableList" :loading="tableLoading" ref="xTable">
        <template #toolbar_tools>
          <Space>
            <span>合计：{{ tableList.length }}位</span>
            <span>视频数量：{{ videoCount }}个</span>
            <span>存储容量：{{ formatSize(totalSize) }}</span>
            <span>播放时长：{{ formatDuration(totalDuration) }}</span>
          </Space>
        </template>
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
  import { Space } from 'ant-design-vue';
  import { list } from './service';
  import { formatSize } from '@/utils/formatter';
  import { adds, formatDuration } from '@sirpho/utils';

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const totalDuration = ref<number>(0);
  const totalSize = ref<number>(0);
  const videoCount = ref<number>(0);
  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { tools: 'toolbar_tools' } },
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
    totalDuration.value = adds(...tableList.value.map((item) => item.totalDuration));
    totalSize.value = adds(...tableList.value.map((item) => item.totalSize));
    videoCount.value = adds(...tableList.value.map((item) => item.videoCount));
  };
</script>
<script lang="ts">
  export default {
    name: 'Author',
  };
</script>
