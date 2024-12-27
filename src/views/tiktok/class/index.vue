<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="名称" name="name">
          <Input size="small" v-model:value="formState.name" />
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
        <!-- 名称 -->
        <template #name="{ row }">
          <Input v-model:value="row.name" size="small" />
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Form, FormItem, Space, Button, message, Modal, Input } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list } from './service';

  interface FormState {
    name: string;
  }

  const formState = reactive<FormState>({
    name: '', // 名称
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
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 40, fixed: 'left', align: 'center' },
      { type: 'seq', title: '序号', width: 120, align: 'center' },
      {
        field: 'name',
        title: '名称',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'name' },
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
    name: 'TiktokClass',
  };
</script>
<style lang="less" scoped>
  .my-card :deep(.ant-card-body) {
    padding: 2px 0 2px 8px;
  }
</style>
