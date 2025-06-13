<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="标识" name="identification">
          <Input v-model:value="formState.identification" allow-clear size="small" />
        </FormItem>
        <FormItem label="名称" name="author">
          <Input v-model:value="formState.author" allow-clear size="small" />
        </FormItem>
        <FormItem label="标签" name="tags">
          <Input v-model:value="formState.tags" allow-clear size="small" />
        </FormItem>
        <FormItem label="备注" name="memo">
          <Input v-model:value="formState.memo" allow-clear size="small" />
        </FormItem>
        <FormItem class="sticky">
          <Space>
            <Button type="primary" html-type="submit" :loading="tableLoading" size="small">
              查询
            </Button>
            <Button type="primary" :loading="submitLoading" @click="handleSubmit" size="small">
              保存
            </Button>
          </Space>
        </FormItem>
      </Form>
    </QueryFilterContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...gridOptions }" :data="tableList" :loading="tableLoading" ref="xTable">
        <!-- 表格操作 -->
        <template #toolbar_buttons>
          <Space>
            <Button size="small" type="link" @click="handleInsertLine">新增行</Button>
            <Button size="small" type="link" @click="handleRemoveLine">删除行</Button>
          </Space>
        </template>
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
        <!-- 比特率 -->
        <template #bitrateEdit="{ row }">
          <InputNumber v-model:value="row.bitrate" :precision="0" size="small" :controls="false" />
        </template>
        <!-- 大小 格式化显示 -->
        <template #totalSize="{ row }">
          {{ formatSize(row.totalSize || 0) }}
        </template>
        <!-- 大小 -->
        <template #totalSizeEdit="{ row }">
          <InputNumber
            v-model:value="row.totalSize"
            :precision="0"
            size="small"
            :controls="false"
          />
        </template>
        <!-- 数量 -->
        <template #videoCount="{ row }">
          <InputNumber
            v-model:value="row.videoCount"
            :precision="0"
            size="small"
            :controls="false"
          />
        </template>
        <!-- 时长 格式化显示 -->
        <template #totalDuration="{ row }">
          {{ formatDuration(row.totalDuration || 0) }}
        </template>
        <!-- 时长 -->
        <template #totalDurationEdit="{ row }">
          <InputNumber
            v-model:value="row.totalDuration"
            :precision="0"
            size="small"
            :controls="false"
            addon-after="秒"
          />
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
        </template>
        <!-- 标签 -->
        <template #tags="{ row }">
          <Input v-model:value="row.tags" size="small" />
        </template>
        <!-- 标识 -->
        <template #identification="{ row }">
          <Input v-model:value="row.identification" size="small" />
        </template>
        <!-- 名称 -->
        <template #author="{ row }">
          <Input v-model:value="row.author" size="small" />
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import {
    Button,
    Form,
    FormItem,
    Input,
    InputNumber,
    message,
    Modal,
    Space,
  } from 'ant-design-vue';
  import { list, batch } from './service';
  import { formatBitrate, formatSize } from '@/utils/formatter';
  import { adds, formatDuration } from '@sirpho/utils';

  interface FormState {
    identification: string;
    author: string;
    tags: string;
    memo: string;
  }

  const formState = reactive<FormState>({
    identification: '', // 标识
    author: '', // 名称
    tags: '', // 标签
    memo: '', // 备注
  });
  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);
  const totalDuration = ref<number>(0);
  const totalSize = ref<number>(0);
  const videoCount = ref<number>(0);

  /**
   * 校验
   */
  const validRules = ref({
    identification: [{ required: true, message: '必填项' }],
    author: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);
  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      {
        field: 'identification',
        title: '唯一标识',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'identification' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'author',
        title: '作者',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'author' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'videoCount',
        title: '视频数量',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'videoCount' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'totalSize',
        title: '存储容量',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'totalSizeEdit', default: 'totalSize' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'totalDuration',
        title: '播放时长',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'totalDurationEdit', default: 'totalDuration' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'bitrate',
        title: '比特率',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'bitrateEdit', default: 'bitrate' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'tags',
        title: '标签',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'tags' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'memo',
        title: '备注',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'memo' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
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
    const res = await list(formState).finally(() => {
      tableLoading.value = false;
    });
    tableList.value = res.data || [];
    totalDuration.value = adds(...tableList.value.map((item) => item.totalDuration));
    totalSize.value = adds(...tableList.value.map((item) => item.totalSize));
    videoCount.value = adds(...tableList.value.map((item) => item.videoCount));
  };

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {
      totalDuration: 0,
      totalSize: 0,
      videoCount: 0,
    };
    const { row: newRow } = await xTable.value.insertAt(record, null);
    await xTable.value.setEditRow(newRow);
  };

  /**
   * 将增删改提交
   */
  const handleSubmit = async () => {
    const insertItems = xTable.value.getInsertRecords();
    const deleteItems = xTable.value.getRemoveRecords();
    const updateItems = xTable.value.getUpdateRecords();

    submitLoading.value = true;
    await batch({
      insertItems,
      updateItems,
      deleteItems,
    }).finally(() => {
      submitLoading.value = false;
    });
    await handleQuery();
  };

  /**
   * 删除
   */
  const handleRemoveLine = () => {
    const checkRecord = xTable.value.getCheckboxRecords();
    if (!checkRecord.length) {
      message.warning('请先选择要删除的行项目！');
      return;
    }
    Modal.confirm({
      title: `你确信要删除所选行项目吗?`,
      onOk: () => {
        xTable.value.remove(checkRecord);
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };
</script>
<script lang="ts">
  export default {
    name: 'Dancer',
  };
</script>
