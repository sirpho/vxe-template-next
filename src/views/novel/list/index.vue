<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="小说名字" name="name">
          <Input v-model:value="formState.name" allow-clear size="small" />
        </FormItem>
        <FormItem label="作者" name="author">
          <Input v-model:value="formState.author" allow-clear size="small" />
        </FormItem>
        <FormItem label="类型" name="type">
          <Input v-model:value="formState.type" allow-clear size="small" />
        </FormItem>
        <FormItem label="阅读状态" name="readStatus">
          <Select
            v-model:value="formState.readStatus"
            allow-clear
            size="small"
            style="width: 160px"
          >
            <Select.Option v-for="item in readStatusList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </FormItem>
        <FormItem label="创作状态" name="writeStatus">
          <Select
            v-model:value="formState.writeStatus"
            allow-clear
            size="small"
            style="width: 160px"
          >
            <Select.Option v-for="item in writeStatusList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
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
          <Space
            >合计： {{ tableList.length }}本，{{ thousandsSeparator(totalWordCount) }}万字</Space
          >
        </template>
        <!-- 可编辑列 -->
        <!-- 阅读状态 -->
        <template #readStatus="{ row }">
          <Select v-model:value="row.readStatus" size="small">
            <Select.Option v-for="item in readStatusList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </template>
        <template #readStatus_default="{ row }">
          <Badge v-bind="getBadgeStatus(row)" />
          <span :style="{ textDecoration: row.readStatus === '弃坑' ? 'line-through' : 'unset' }">
            {{ row.readStatus }}
          </span>
        </template>
        <!-- 创作状态 -->
        <template #writeStatus="{ row }">
          <Select v-model:value="row.writeStatus" size="small">
            <Select.Option v-for="item in writeStatusList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
        </template>
        <!-- 字数 -->
        <template #wordCount="{ row }">
          <InputNumber
            v-model:value="row.wordCount"
            :precision="0"
            size="small"
            :controls="false"
            addon-after="万字"
          />
        </template>
        <!-- 阅读日期 -->
        <template #readDate="{ row }">
          <DatePicker
            :getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"
            picker="date"
            size="small"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            v-model:value="row.readDate"
          />
        </template>
        <!-- 名字 -->
        <template #name="{ row }">
          <Input v-model:value="row.name" size="small" />
        </template>
        <!-- 作者 -->
        <template #author="{ row }">
          <Input v-model:value="row.author" size="small" />
        </template>
        <!-- 类型 -->
        <template #type="{ row }">
          <Input v-model:value="row.type" size="small" />
        </template>
        <!-- 主角 -->
        <template #protagonist="{ row }">
          <Input v-model:value="row.protagonist" size="small" />
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
    Badge,
    InputNumber,
    DatePicker,
  } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list } from './service';
  import { useDict } from '@/hooks/web/useDict';
  import { adds, thousandsSeparator } from '@sirpho/utils';

  interface FormState {
    name: string;
    author: string;
    type: string;
    protagonist: string;
    writeStatus: string;
    readStatus: string;
  }

  const formState = reactive<FormState>({
    name: '', // 名字
    author: '', // 作者
    type: '', // 类型
    protagonist: '', // 主角
    writeStatus: '', // 创作状态
    readStatus: '', // 阅读状态
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);
  const totalWordCount = ref<number>(0);

  const [readStatusList, writeStatusList] = useDict([
    '小说阅读状态', // 小说阅读状态
    '小说创作状态', // 小说创作状态
  ]);

  /**
   * 校验
   */
  const validRules = ref({
    name: [{ required: true, message: '必填项' }],
    writeStatus: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      { type: 'seq', title: '序号', width: 50, align: 'center' },
      {
        field: 'name',
        title: '小说名称',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'name' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 180,
      },
      {
        field: 'author',
        title: '作者',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'author' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 100,
        width: 100,
      },
      {
        field: 'type',
        title: '类型',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'type' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 100,
        width: 100,
      },
      {
        field: 'protagonist',
        title: '主角',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'protagonist' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 100,
        width: 100,
      },
      {
        field: 'memo',
        title: '备注',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'memo' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 250,
      },
      {
        field: 'wordCount',
        title: '字数',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'wordCount' },
        sortBy: 'wordCount',
        formatter: ({ row }) => {
          return row.wordCount ? `${row.wordCount}万字` : '';
        },
        sortable: true,
        minWidth: 120,
        width: 120,
      },
      {
        field: 'writeStatus',
        title: '创作状态',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'writeStatus' },
        sortable: true,
        minWidth: 130,
        width: 130,
      },
      {
        field: 'readStatus',
        title: '阅读状态',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'readStatus', default: 'readStatus_default' },
        sortable: true,
        minWidth: 120,
        width: 120,
      },
      {
        field: 'readDate',
        title: '阅读日期',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'readDate' },
        sortable: true,
        minWidth: 120,
        width: 120,
      },
    ],
    showHeaderOverflow: 'tooltip',
    height: 'auto',
    rowClassName: ({ row }) => {
      return row.readStatus === '弃坑' ? 'grey-row' : '';
    },
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
    totalWordCount.value = adds(...tableList.value.map((item) => item.wordCount));
  };

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {
      readStatus: readStatusList.value[0]?.value,
      writeStatus: writeStatusList.value[writeStatusList.value.length - 1]?.value,
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

  /**
   * 徽标样式
   */
  const getBadgeStatus = (record: any): any => {
    if (record.readStatus === '在读') {
      return { status: 'processing' };
    }
    if (record.readStatus === '待读') {
      return { color: '#722ED1' };
    }
    return {
      status: 'default',
    };
  };
</script>
<script lang="ts">
  export default {
    name: 'NovelList',
  };
</script>

<style lang="less" scoped>
  :deep(.grey-row.vxe-body--row) {
    background: rgb(200 200 200 /50%) !important;
  }
</style>
