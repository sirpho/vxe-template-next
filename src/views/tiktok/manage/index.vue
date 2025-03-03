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
        <FormItem label="标签" name="classIdList">
          <TiktokClassCombox :data="classList" v-model:value="formState.classIdList" />
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
        <template #size="{ row }">
          {{ formatSize(row.size || 0) }}
        </template>
        <template #duration="{ row }">
          {{ formatDuration(row.duration || 0) }}
        </template>
        <!-- 标签 -->
        <template #classIdList="{ row }">
          <TiktokClassCombox
            :data="classList"
            v-model:value="row.classIdList"
            @change="(option) => changeClass(row, option)"
          />
        </template>
        <template #classIdList_default="{ row }">
          <Tag v-for="item in row.classList" :key="item.name" :color="item.color">
            {{ item.name }}
          </Tag>
        </template>
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { Form, FormItem, Space, Button, Input, Tag } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps } from 'vxe-table';
  import { batch, getClassList, list } from './service';
  import { TiktokClassCombox } from '@/features/components/Profession';
  import { formatSize } from '@/utils/formatter';
  import { formatDuration } from '@sirpho/utils';

  interface FormState {
    name: string;
    category: string;
    author: string;
    classIdList: string[];
  }

  const formState = reactive<FormState>({
    name: '', // 名称
    category: '', // 分类
    author: '', // 作者
    classIdList: [], // 标签
  });

  const xTable = ref({} as VxeTableInstance);
  const tableList = ref<any[]>([]);
  const classList = ref<any[]>([]);
  const tableLoading = ref(false);
  const submitLoading = ref(false);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    columns: [
      { type: 'checkbox', width: 60, fixed: 'left', align: 'center' },
      { type: 'seq', title: '序号', width: 120, align: 'center' },
      {
        field: 'author',
        title: '作者',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        width: 140,
      },
      {
        field: 'name',
        title: '文件名称',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'duration',
        title: '播放时长',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        slots: { default: 'duration' },
      },
      {
        field: 'size',
        title: '存储容量',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        slots: { default: 'size' },
      },
      {
        field: 'classIdList',
        title: '标签',
        editRender: { autofocus: '.ant-input' },
        slots: { edit: 'classIdList', default: 'classIdList_default' },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'category',
        title: '类别',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
    ],
    showHeaderOverflow: 'tooltip',
    height: 'auto',
  });

  onMounted(() => {
    queryClassList();
    handleQuery();
  });

  /**
   * 查询分类列表
   */
  const queryClassList = () => {
    getClassList({}).then((res) => {
      classList.value = res.data || [];
    });
  };

  /**
   * 查询
   */
  const handleQuery = async () => {
    tableLoading.value = true;
    const res = await list(formState).finally(() => {
      tableLoading.value = false;
    });
    tableList.value = (res.data || []).map((item: any) => ({
      ...item,
      classIdList: (item.classList || []).map((ite: any) => ite.id),
      classNameList: (item.classList || []).map((ite: any) => ite.name),
    }));
  };

  /**
   * 将增删改提交
   */
  const handleSubmit = async () => {
    const updateItems = xTable.value.getUpdateRecords();
    const updateList = updateItems.map((item: any) => ({
      ...item,
      classList: (item.classIdList || []).map((classId: string) => ({ id: classId })),
    }));

    submitLoading.value = true;
    await batch({
      updateItems: updateList,
    }).finally(() => {
      submitLoading.value = false;
    });
    await handleQuery();
  };

  /**
   * 修改标签
   * @param row
   * @param options
   */
  const changeClass = (row, options) => {
    row.classIdList = options.map((item: any) => item.id);
    row.classNameList = options.map((item: any) => item.name);
    row.classList = options;
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
