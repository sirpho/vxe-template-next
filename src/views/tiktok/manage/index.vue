<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="作者" name="author">
          <Input size="small" v-model:value="formState.author" />
        </FormItem>
        <FormItem label="类别" name="category">
          <Input size="small" v-model:value="formState.category" />
        </FormItem>
        <FormItem label="文件名" name="name">
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
        <!-- 可编辑列 -->
        <!-- 标签 -->
        <template #classList="{ row }">
          <TiktokClassCombox v-model:value="row.classList" />
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Form, FormItem, Space, Button, Input } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps } from 'vxe-table';
  import { batch, list } from './service';
  import { TiktokClassCombox } from '@/features/components/Profession';

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

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    columns: [
      { type: 'checkbox', width: 60, fixed: 'left', align: 'center' },
      { type: 'seq', title: '序号', width: 120, align: 'center' },
      {
        field: 'name',
        title: '文件名称',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'classList',
        title: '标签',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'classList' },
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
   * 将增删改提交
   */
  const handleSubmit = async () => {
    const updateItems = xTable.value.getUpdateRecords();

    submitLoading.value = true;
    await batch({
      updateItems,
    }).finally(() => {
      submitLoading.value = false;
    });
    await handleQuery();
  };
</script>
<script lang="ts">
  export default {
    name: 'TiktokManage',
  };
</script>
<style lang="less" scoped>
  .my-card :deep(.ant-card-body) {
    padding: 2px 0 2px 8px;
  }
</style>
