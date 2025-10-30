<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="年份" name="year">
          <DatePicker
            picker="year"
            size="small"
            value-format="YYYY"
            format="YYYY"
            allow-clear
            v-model:value="formState.year"
          />
        </FormItem>
        <FormItem label="类型" name="type">
          <ComboBox v-model:value="formState.type" v-bind="{ ...typeOptions }" :data="typeList" />
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
          <Space v-if="totalList.length">
            合计：
            <span v-for="item in totalList" :key="item.label">
              {{ item.label }}：{{ thousandsSeparator(item.value) }}元
            </span>
          </Space>
        </template>
        <!-- 可编辑列 -->
        <!-- 日期 -->
        <template #date="{ row }">
          <DatePicker
            :getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"
            size="small"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            allow-clear
            v-model:value="row.date"
          />
        </template>
        <!-- 类型 -->
        <template #type="{ row }">
          <ComboBox v-model:value="row.type" v-bind="{ ...typeOptions }" :data="typeList" />
        </template>
        <template #type_default="{ row }">
          <Tag v-if="row.type" :color="getTagColor(row)">{{ row.type }}</Tag>
        </template>
        <!-- 费用 -->
        <template #cost="{ row }">
          <InputNumber v-model:value="row.cost" size="small" :controls="false" addon-after="元" />
        </template>
        <!-- 里程 -->
        <template #mileage="{ row }">
          <InputNumber
            v-model:value="row.mileage"
            :precision="0"
            size="small"
            :controls="false"
            addon-after="公里"
          />
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
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
    DatePicker,
    Tag,
  } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list, typeOptions } from './service';
  import { useDict } from '@/hooks/web/useDict';
  import { ComboBox } from '@/components/Box';
  import dayjs from 'dayjs';
  import { adds, thousandsSeparator } from '@sirpho/utils';
  import { groupBy } from 'lodash-es';

  interface FormState {
    year: string;
    type: string;
  }

  const formState = reactive<FormState>({
    year: dayjs().format('YYYY'), // 年份
    type: '', // 类型
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const totalList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);

  const [typeList] = useDict([
    '用车费用类型', // 用车费用类型
  ]);

  /**
   * 校验
   */
  const validRules = ref({
    date: [{ required: true, message: '必填项' }],
    type: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      {
        field: 'date',
        title: '日期',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'date' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 180,
        width: 180,
      },
      {
        field: 'type',
        title: '类型',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'type', default: 'type_default' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
      },
      {
        field: 'cost',
        title: '费用',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'cost' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
      },
      {
        field: 'mileage',
        title: '里程',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'mileage' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 130,
        width: 130,
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
    showFooter: true,
    footerMethod: ({ columns, data }) => {
      return [
        columns.map((column, columnIndex) => {
          if (columnIndex === 1) {
            return '合计';
          }
          // 费用
          if (['cost'].includes(column.field)) {
            const result = adds(...data.map((item) => item[column.field] || 0));
            return thousandsSeparator(result);
          }
          return null;
        }),
      ];
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
    const totalArray: any[] = [];
    const map = groupBy(tableList.value, 'type');
    for (const field in map) {
      const subList = map[field] || [];
      totalArray.push({
        label: field,
        value: adds(...subList.map((item) => item.cost)),
      });
    }
    totalList.value = totalArray;
  };

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {
      date: dayjs().format('YYYY-MM-DD'),
      type: typeList.value?.[0]?.value,
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
   * 标签颜色
   */
  const getTagColor = (row: any) => {
    switch (row.type) {
      case '车险':
        return '#cd201f';
      case '保养':
        return '#3b5999';
      default:
        return '#FF9500';
    }
  };
</script>
<script lang="ts">
  export default {
    name: 'CarExpensesList',
  };
</script>
