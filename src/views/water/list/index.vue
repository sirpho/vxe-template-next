<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="所属房屋" name="house">
          <ComboBox
            v-model:value="formState.house"
            v-bind="{ ...houseOptions }"
            :data="houseList"
          />
        </FormItem>
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
        <FormItem>
          <Space>
            <Button type="primary" html-type="submit" :loading="tableLoading" size="small">
              查询
            </Button>
            <Button type="primary" :loading="submitLoading" @click="handleSubmit" size="small">
              保存
            </Button>
            <Button type="primary" size="small" @click="handleExport">导出</Button>
            <ImportExcel @success="handleImportExcel">
              <Button type="primary" size="small">导入</Button>
            </ImportExcel>
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
          <Button type="link" size="small">
            <a href="https://www.xswater.com/gongshui/channels/237.html" target="_blank">
              萧山水务水费查询
            </a>
          </Button>
        </template>
        <!-- 可编辑列 -->
        <!-- 所属房屋 -->
        <template #house="{ row }">
          <ComboBox v-model:value="row.house" v-bind="{ ...houseOptions }" :data="houseList" />
        </template>
        <!-- 月份 -->
        <template #month="{ row }">
          <DatePicker
            :getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"
            picker="month"
            size="small"
            value-format="YYYY-MM"
            format="YYYY-MM"
            v-model:value="row.month"
            @change="() => handleChangeMonth(row)"
          />
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
        </template>
        <!-- 上期行至 -->
        <template #previousIndication="{ row }">
          <InputNumber v-model:value="row.previousIndication" size="small" />
        </template>
        <!-- 本期行至 -->
        <template #thisIndication="{ row }">
          <InputNumber v-model:value="row.thisIndication" size="small" />
        </template>
        <!-- 水价 -->
        <template #price="{ row }">
          <InputNumber v-model:value="row.price" size="small" />
        </template>
        <!-- 水费 -->
        <template #cost="{ row }">
          <InputNumber v-model:value="row.cost" size="small" @change="() => handleCalcPrice(row)" />
        </template>
        <!-- 用水量 -->
        <template #power="{ row }">
          <InputNumber
            v-model:value="row.power"
            size="small"
            @change="() => handleCalcPrice(row)"
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
    InputNumber,
    DatePicker,
  } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list, houseOptions } from './service';
  import dayjs from 'dayjs';
  import { divide } from '@sirpho/utils';
  import { useDict } from '@/hooks/web/useDict';
  import { ImportExcel } from '@/components/Excel';
  import { isEmpty, isNumber } from '@/utils/is';
  import { ComboBox, PageContainer, QueryFilterContainer, VxeContainer } from '@sirpho/components';

  interface FormState {
    house: string;
    year: string;
  }

  const formState = reactive<FormState>({
    house: '', // 所属房屋
    year: dayjs().format('YYYY'), // 年份
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);

  const [houseList] = useDict([
    '用水户号', // 用水户号
  ]);

  /**
   * 校验
   */
  const validRules = ref({
    house: [{ required: true, message: '必填项' }],
    month: [{ required: true, message: '必填项' }],
    power: [{ required: true, message: '必填项' }],
    cost: [{ required: true, message: '必填项' }],
    price: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      {
        field: 'house',
        title: '所属房屋',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'house' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 150,
      },
      {
        field: 'month',
        title: '年月',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'month' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 120,
      },
      {
        field: 'power',
        title: '用水量（吨）',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'power' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 170,
      },
      {
        field: 'cost',
        title: '水费（元）',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'cost' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 160,
      },
      {
        field: 'price',
        title: '水价/吨',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'price' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 150,
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
  };

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {
      year: dayjs().format('YYYY'),
      month: dayjs().subtract(1, 'month').format('YYYY-MM'),
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
   * 修改月份，同步修改年份
   */
  const handleChangeMonth = (row) => {
    row.year = row.month ? dayjs(new Date(row.month)).format('YYYY') : row.year;
  };

  /**
   * 计算水价
   */
  const handleCalcPrice = (row) => {
    if (isNumber(row.cost) && isNumber(row.power)) {
      row.price = divide(row.cost, row.power).toFixed(3);
    }
  };

  /**
   * 导出
   */
  const handleExport = () => {
    xTable.value.exportData({
      filename: '水量水费',
      columnFilterMethod: ({ column }) => {
        return !!column.field;
      },
      type: 'xlsx',
    });
  };

  /**
   * 判断导入的excel行是否为空行
   * @param record
   */
  const isEmptyRow = (record: any) => {
    const fieldList = ['月份', '上期行至', '本期行至', '实收水量', '水费金额', '单价'];
    if (record['月份'] === '合计') {
      return true;
    }
    for (const field of fieldList) {
      if (!isEmpty(record[field]) || isNumber(record[field])) {
        return false;
      }
    }
    return true;
  };

  /**
   * 导入
   * @param sheetList
   * @param fileName
   */
  const handleImportExcel = async (sheetList: any[], fileName: string) => {
    const house = fileName?.includes('桥南沈') ? '桥南沈85号' : '金珺澜庭7-1-701';
    const list: any[] = [];
    (sheetList || []).forEach((sheet) => {
      const results = sheet.results || [];
      const effectiveDataList = results.filter((item: any) => !isEmptyRow(item));
      list.push(
        ...effectiveDataList.map((item) => ({
          house,
          year: (item['月份'] + '').replace(/^(\d{4})(\d{2})$/, '$1'),
          month: (item['月份'] + '').replace(/^(\d{4})(\d{2})$/, '$1-$2'),
          power: item['实收水量'],
          cost: item['水费金额'],
          price: item['单价'],
          previousIndication: item['上期行至'],
          thisIndication: item['本期行至'],
        })),
      );
    });

    for (const item of list) {
      let isExist = false;
      for (const record of tableList.value) {
        if (item.house === record.house && item.month === record.month) {
          isExist = true;
          record.power = item.power;
          record.cost = item.cost;
          record.price = item.price;
          record.previousIndication = item.previousIndication;
          record.thisIndication = item.thisIndication;
          break;
        }
      }
      if (!isExist) {
        await xTable.value.insertAt(item, null);
      }
    }
  };
</script>
<script lang="ts">
  export default {
    name: 'WaterList',
  };
</script>
<style lang="less" scoped>
  .my-card :deep(.ant-card-body) {
    padding: 2px 0 2px 8px;
  }
</style>
