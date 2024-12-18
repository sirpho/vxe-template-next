<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="vxeInstance.reload">
        <FormItem label="工厂" name="factoryCode">
          <Werks
            autoFill
            style="width: 220px"
            :option="{ label: 'factoryName', value: 'factoryCode' }"
            v-model:value="formState.factoryCode"
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button
              type="primary"
              html-type="submit"
              :loading="vxeDefaultProps.loading"
              size="small"
            >
              查询
            </Button>
            <Button
              type="primary"
              :loading="vxeExtraProps.saving"
              @click="vxeInstance.save"
              size="small"
            >
              保存
            </Button>
          </Space>
        </FormItem>
      </Form>
    </QueryFilterContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...vxeDefaultProps, ...gridOptions }" ref="xTable">
        <!-- 表格操作 -->
        <template #toolbar_buttons>
          <Space>
            <Button size="small" type="link" @click="handleInsertLine">新增行</Button>
            <Button size="small" type="link" @click="handleRemoveLine">删除行</Button>
          </Space>
        </template>
        <!-- 可编辑列 -->
        <!-- 工厂代码 -->
        <template #factoryCode="{ row }">
          <Werks style="width: 100%" :autoFill="false" v-model:value="row.factoryCode" />
        </template>
        <!-- 产线代码 -->
        <template #productLineCode="{ row }">
          <Input v-model:value="row.productLineCode" size="small" />
        </template>
        <!-- 产线名称 -->
        <template #productLineName="{ row }">
          <Input v-model:value="row.productLineName" size="small" />
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { Form, FormItem, Space, Button, message, Modal, Input } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { Werks } from '@/features/components/Profession/index';
  import { list, save } from './service';

  interface FormState {
    factoryCode: string;
  }

  const formState = reactive<FormState>({
    factoryCode: '',
  });

  const xTable = ref({} as VxeTableInstance);

  /**
   * 校验
   */
  const validRules = ref({
    factoryCode: [{ required: true, message: '必填项' }],
    productLineCode: [{ required: true, message: '必填项' }],
    productLineName: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 40, fixed: 'left', align: 'center' },
      {
        field: 'factoryCode',
        title: '工厂代码',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'factoryCode' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'productLineCode',
        title: '产线代码',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'productLineCode' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'productLineName',
        title: '产线名称',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'productLineName' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
    ],
    showHeaderOverflow: 'tooltip',
  });

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {};
    const { row: newRow } = await xTable.value.insertAt(record, null);
    await xTable.value.setEditRow(newRow);
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
    name: 'FactoryProductLine',
  };
</script>
<style lang="less" scoped>
  .my-card :deep(.ant-card-body) {
    padding: 2px 0 2px 8px;
  }
</style>
