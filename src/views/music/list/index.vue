<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="关键词" name="path">
          <Input v-model:value="formState.path" allow-clear size="small" />
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
            <Button size="small" type="link" @click="handleRemoveLine">删除行</Button>
          </Space>
        </template>
        <template #toolbar_tools>
          <Space>合计：{{ tableList.length }}首，{{ thousandsSeparator(totalDuration) }}小时</Space>
        </template>
        <!-- 可编辑列 -->
        <!-- 有歌词 -->
        <template #lyric="{ row }">
          <Select v-model:value="row.lyric" size="small">
            <Select.Option value="Y">是</Select.Option>
            <Select.Option value="N">否</Select.Option>
          </Select>
        </template>
        <!-- 语言 -->
        <template #language="{ row }">
          <Input v-model:value="row.language" size="small" />
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
        </template>
        <!-- 路径 -->
        <template #path="{ row }">
          <Input v-model:value="row.path" size="small" />
        </template>
        <!-- 名称 -->
        <template #name="{ row }">
          <Input v-model:value="row.name" size="small" />
        </template>
        <!-- 歌手 -->
        <template #singer="{ row }">
          <Input v-model:value="row.singer" size="small" />
        </template>
        <!-- 时长 -->
        <template #duration="{ row }">
          <InputNumber
            v-model:value="row.duration"
            :precision="0"
            size="small"
            :controls="false"
            addon-after="秒"
          />
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import {
    Form,
    FormItem,
    Space,
    Button,
    message,
    Modal,
    Input,
    Select,
    InputNumber,
  } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list } from './service';
  import { adds, thousandsSeparator } from '@sirpho/utils';
  import { divide } from '@sirpho/utils/math';
  import { formatSize } from '@/utils/formatter';

  interface FormState {
    path: string;
  }

  const formState = reactive<FormState>({
    path: '', // 关键词
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);
  const totalDuration = ref<string>('0');

  /**
   * 校验
   */
  const validRules = ref({
    name: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      {
        field: 'name',
        title: '名称',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'name' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 160,
      },
      {
        field: 'singer',
        title: '歌手',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'singer' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
      },
      {
        field: 'language',
        title: '语言',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'language' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
      },
      {
        field: 'lyric',
        title: '有歌词',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'lyric' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
        formatter: ({ row }) => {
          return row.lyric === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'size',
        title: '文件大小',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
        sortBy: 'size',
        formatter: ({ row }) => {
          return formatSize(row.size || 0);
        },
      },
      {
        field: 'suffix',
        title: '后缀',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
      },
      {
        field: 'duration',
        title: '时长',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'duration' },
        sortBy: 'duration',
        formatter: ({ row }) => {
          const duration = row.duration || 0;
          const minute = Math.floor(duration / 60);
          const second = duration % 60;

          return duration
            ? `${(minute ? minute + '分钟' : '') + (second ? second + '秒' : '')}`
            : '';
        },
        sortable: true,
        minWidth: 120,
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
      {
        field: 'path',
        title: '路径',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'path' },
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
    totalDuration.value = divide(
      adds(...tableList.value.map((item) => item.duration)),
      60 * 60,
    ).toFixed(2);
  };

  /**
   * 将增删改提交
   */
  const handleSubmit = async () => {
    const deleteItems = xTable.value.getRemoveRecords();
    const updateItems = xTable.value.getUpdateRecords();

    submitLoading.value = true;
    await batch({
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
    name: 'MusicList',
  };
</script>
