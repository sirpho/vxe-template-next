<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="名称" name="name">
          <Input v-model:value="formState.name" allow-clear size="small" />
        </FormItem>
        <FormItem label="地区" name="location">
          <Input v-model:value="formState.location" allow-clear size="small" />
        </FormItem>
        <FormItem label="大类" name="category">
          <Input v-model:value="formState.category" allow-clear size="small" />
        </FormItem>
        <FormItem label="类型" name="type">
          <Input v-model:value="formState.type" allow-clear size="small" />
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
          <Button type="link" size="small">
            <a href="https://movie.douban.com/mine?status=collect" target="_blank"> 豆瓣 </a>
          </Button>
          <Space>合计：{{ tableList.length }}部</Space>
        </template>
        <!-- 可编辑列 -->
        <!-- 大类 -->
        <template #category="{ row }">
          <Select v-model:value="row.category" size="small">
            <Select.Option v-for="item in categoryList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </template>
        <!-- 类型 -->
        <template #type="{ row }">
          <Input v-model:value="row.type" size="small" />
        </template>
        <!-- 地区 -->
        <template #location="{ row }">
          <Select v-model:value="row.location" size="small">
            <Select.Option v-for="item in locationList" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </template>
        <!-- 备注 -->
        <template #memo="{ row }">
          <Input v-model:value="row.memo" size="small" />
        </template>
        <!-- 名字 -->
        <template #name="{ row }">
          <Input v-model:value="row.name" size="small" />
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Form, FormItem, Space, Button, message, Modal, Input, Select } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps, VxeTablePropTypes } from 'vxe-table';
  import { batch, list } from './service';
  import { useDict } from '@/hooks/web/useDict';

  // interface FormState {
  //   name: string;
  //   category: string;
  //   type: string;
  //   location: string;
  // }

  const formState = reactive({
    name: '', // 名字
    category: '', // 大类
    type: '', // 类型
    location: '', // 地区
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);

  const [locationList, categoryList] = useDict([
    'FILM_LOCATION', // 影视地区
    'FILM_CATEGORY', // 影视大类
  ]);

  /**
   * 校验
   */
  const validRules = ref({
    name: [{ required: true, message: '必填项' }],
    location: [{ required: true, message: '必填项' }],
    category: [{ required: true, message: '必填项' }],
    type: [{ required: true, message: '必填项' }],
  } as VxeTablePropTypes.EditRules);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    editRules: validRules.value,
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left', align: 'center' },
      { type: 'seq', width: 60, align: 'center' },
      {
        field: 'name',
        title: '名称',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'name' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 180,
      },
      {
        field: 'location',
        title: '地区',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'location' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 180,
      },
      {
        field: 'category',
        title: '大类',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'category' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 180,
      },
      {
        field: 'type',
        title: '类型',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'type' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 180,
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
      category: '电影',
      location: '大陆',
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
    name: 'FilmList',
  };
</script>
