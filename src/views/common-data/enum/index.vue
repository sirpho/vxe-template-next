<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="枚举名称" name="name">
          <Input size="small" v-model:value="formState.name" />
        </FormItem>
        <FormItem label="所属模块" name="module">
          <Input size="small" v-model:value="formState.module" />
        </FormItem>
        <FormItem>
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
        <!-- 可编辑列 -->
        <!-- 枚举名称 -->
        <template #name="{ row }">
          <Input v-model:value="row.name" size="small" />
        </template>
        <!-- 枚举值 -->
        <template #value="{ row }">
          <Input v-model:value="row.value" size="small" />
        </template>
        <!-- 模块 -->
        <template #module="{ row }">
          <Input v-model:value="row.module" size="small" />
        </template>
        <!-- 排序 -->
        <template #sortOrder="{ row }">
          <InputNumber v-model:value="row.sortOrder" :precision="0" :min="1" size="small" />
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
    InputNumber,
  } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list } from './service';

  interface FormState {
    name: string;
    module: string;
  }

  const formState = reactive<FormState>({
    name: '', // 枚举名称
    module: '', // 所属模块
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);

  /**
   * 校验
   */
  const validRules = ref({
    name: [{ required: true, message: '必填项' }],
    value: [{ required: true, message: '必填项' }],
    module: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 40, fixed: 'left', align: 'center' },
      {
        field: 'name',
        title: '枚举名称',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'name' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'value',
        title: '枚举值',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'value' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'module',
        title: '所属模块',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'module' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'sortOrder',
        title: '排序',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'sortOrder' },
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
  };

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {
      sortOrder: 1,
    };
    const { row: newRow } = await xTable.value.insertAt(record, null);
    await xTable.value.setEditRow(newRow);
  };

  /**
   * 将增删改提交
   */
  const handleSubmit = async () => {
    const insertItems = xTable.value.getInsertRecords();
    const updateItems = xTable.value.getRemoveRecords();
    const deleteItems = xTable.value.getUpdateRecords();

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
    name: 'Enum',
  };
</script>
<style lang="less" scoped>
  .my-card :deep(.ant-card-body) {
    padding: 2px 0 2px 8px;
  }
</style>
