<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="模式" name="mode" :rules="[{ required: true, message: '必填项' }]">
          <RadioGroup
            size="small"
            button-style="solid"
            v-model:value="formState.mode"
            @change="() => handleQuery()"
          >
            <RadioButton value="alt">马甲</RadioButton>
            <RadioButton value="dancer">福利姬</RadioButton>
          </RadioGroup>
        </FormItem>
        <FormItem label="作者" name="author">
          <Input size="small" v-model:value="formState.author" />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" html-type="submit" :loading="tableLoading" size="small">
              查询
            </Button>
          </Space>
        </FormItem>
      </Form>
    </QueryFilterContainer>
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
        <!-- 比特率 格式化显示 -->
        <template #bitrate="{ row }">
          {{ formatBitrate(row.bitrate || 0) }}
        </template>
        <!-- 大小 格式化显示 -->
        <template #totalSize="{ row }">
          {{ formatSize(row.totalSize || 0) }}
        </template>
        <!-- 时长 格式化显示 -->
        <template #totalDuration="{ row }">
          {{ formatDuration(row.totalDuration || 0) }}
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref, computed } from 'vue';
  import { VxeTableInstance, VxeGridProps } from 'vxe-table';
  import { Button, Form, FormItem, RadioGroup, RadioButton, Space, Input } from 'ant-design-vue';
  import { list, dancerList } from './service';
  import { formatBitrate, formatSize } from '@/utils/formatter';
  import { adds, formatDuration } from '@sirpho/utils';

  interface FormState {
    mode: 'alt' | 'dancer';
    author?: string;
  }

  const formState = reactive<FormState>({
    mode: 'alt',
    author: undefined,
  });

  const operation = computed(() => {
    if (formState.mode === 'alt') {
      return list;
    } else {
      return dancerList;
    }
  });
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
      {
        field: 'bitrate',
        title: '比特率',
        slots: { default: 'bitrate' },
        sortable: true,
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
    const res = await operation.value(formState).finally(() => {
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
    name: 'TiktokReport',
  };
</script>
