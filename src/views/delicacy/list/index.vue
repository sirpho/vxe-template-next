<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="类型" name="type">
          <Select v-model:value="formState.type" allow-clear size="small" style="width: 160px">
            <Select.Option v-for="item in delicacyTypeList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </FormItem>
        <FormItem label="日期" name="date">
          <DatePicker
            picker="year"
            size="small"
            value-format="YYYY"
            format="YYYY"
            allow-clear
            v-model:value="formState.date"
          />
        </FormItem>
        <FormItem label="地点" name="location">
          <Input v-model:value="formState.location" size="small" />
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
          <Space>合计：{{ tableList.length }}次</Space>
        </template>
        <!-- 可编辑列 -->
        <!-- 类型 -->
        <template #type="{ row }">
          <Select v-model:value="row.type" size="small">
            <Select.Option v-for="item in delicacyTypeList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </template>
        <!-- 日期 -->
        <template #date="{ row }">
          <DatePicker
            :getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"
            size="small"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            v-model:value="row.date"
          />
        </template>
        <!-- 店家 -->
        <template #name="{ row }">
          <Input v-model:value="row.name" size="small" />
        </template>
        <!-- 地点 -->
        <template #location="{ row }">
          <Input v-model:value="row.location" size="small" />
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
        </template>
        <!-- 价格 -->
        <template #price="{ row }">
          <InputNumber v-model:value="row.price" addon-after="元" size="small" />
        </template>
        <!-- 附件 -->
        <template #files="{ row }">
          <div class="file-name-wrapper">
            <FileUploader
              :fileList="row.fileList"
              :showUploadList="false"
              @change="(files: any[]) => handleChangeFile(row, files)"
            />
            <Tag
              v-for="(item, index) in row.fileList"
              :key="item.url"
              closable
              color="default"
              @click="() => handlePreview(item.url)"
              @close="() => handleRemoveFile(row, index)"
            >
              {{ filterFileName(item.url) }}
            </Tag>
          </div>
        </template>
      </vxe-grid>
    </VxeContainer>
    <Image
      style="display: none"
      :preview="{
        visible: previewVisible,
        onVisibleChange: (value) => (previewVisible = value),
      }"
      :src="previewSrc"
    />
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
    DatePicker,
    Image,
    Tag,
  } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list } from './service';
  import dayjs from 'dayjs';
  import { useDict } from '@/hooks/web/useDict';
  import { isNumber } from '@/utils/is';
  import FileUploader from '@/components/FileUploader';
  import PageContainer from '@/components/Layout/src/PageContainer/index.vue';

  interface FormState {
    date: string;
    type: string;
    location: string;
  }

  const formState = reactive<FormState>({
    date: dayjs().format('YYYY'), // 日期
    type: '', // 类型
    location: '', // 地点
  });

  const previewSrc = ref('');
  const previewVisible = ref(false);

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);

  const [delicacyTypeList] = useDict([
    'DELICACY_TYPE', // 类型
  ]);

  /**
   * 校验
   */
  const validRules = ref({
    name: [{ required: true, message: '必填项' }],
    date: [{ required: true, message: '必填项' }],
    location: [{ required: true, message: '必填项' }],
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
        field: 'name',
        title: '店家',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'name' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 200,
      },
      {
        field: 'date',
        title: '日期',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'date' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 120,
      },
      {
        field: 'location',
        title: '地点',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'location' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 120,
      },
      {
        field: 'type',
        title: '类型',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'type' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 120,
      },
      {
        field: 'price',
        title: '价格',
        editRender: { autofocus: '.ant-input-number-input' },
        slots: { edit: 'price' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        formatter: ({ row }) => {
          return isNumber(row.price) ? `￥${row.price}元` : '';
        },
        width: 120,
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
        field: 'files',
        title: '附件',
        editRender: { autofocus: '.ant-input' },
        slots: { default: 'files', edit: 'files' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 300,
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
    tableList.value = (res.data || []).map((item) => ({
      ...item,
      fileList:
        item.files?.split(',').map((url: string) => ({
          url: url,
          name: url,
        })) || [],
    }));
  };

  /**
   * 新增
   */
  const handleInsertLine = async () => {
    // 新增行默认值
    const record = {
      date: dayjs().format('YYYY-MM-DD'),
      fileList: [],
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
   * 上传文件回调
   */
  const handleChangeFile = (row: any, fileList: any[]) => {
    row.fileList = fileList;
    row.files = fileList.map((item) => item.url).join(',');
  };

  /**
   * 删除文件
   */
  const handleRemoveFile = (row: any, index: number) => {
    row.fileList.splice(index, 1);
    row.files = row.fileList.map((item) => item.url)?.join(',');
  };

  /**
   * 展示文件名字
   */
  const filterFileName = (url: string) => {
    return url?.split('/')?.pop();
  };

  /**
   * 预览
   * @param record
   */
  const handlePreview = (record) => {
    console.log(record);
    previewSrc.value = record;
    previewVisible.value = true;
  };
</script>
<script lang="ts">
  export default {
    name: 'DelicacyList',
  };
</script>
<style lang="less" scoped>
  .file-name-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
  }

  ::v-deep(.ant-image) {
    display: none;
  }
</style>
