<template>
  <PageContainer>
    <QueryFilterContainer>
      <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
        <FormItem label="作者" name="author">
          <TiktokAuthorCombox v-model:value="formState.author" />
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
        <!-- 表格操作 -->
        <template #toolbar_buttons>
          <Button size="small" type="primary" @click="handleBatch">批量设置标签</Button>
        </template>
        <template #toolbar_tools>
          <Space>
            合计：
            <span>视频数量：{{ tableList.length }}</span>
            <span>存储容量：{{ formatSize(totalSize) }}</span>
            <span>播放时长：{{ formatDuration(totalDuration) }}</span>
          </Space>
        </template>
        <!-- 可编辑列 -->
        <template #seq="{ row, rowIndex }">
          <Button size="small" type="link" @click="() => handlePlayer(row)">
            {{ rowIndex + 1 }}
          </Button>
        </template>
        <!-- 比特率 格式化显示 -->
        <template #bitrate="{ row }">
          {{ formatBitrate(row.bitrate || 0) }}
        </template>
        <!-- 大小 格式化显示 -->
        <template #size="{ row }">
          {{ formatSize(row.size || 0) }}
        </template>
        <!-- 时长 格式化显示 -->
        <template #duration="{ row }">
          {{ formatDuration(row.duration || 0) }}
        </template>
        <!-- 标签 -->
        <template #classIdList="{ row }">
          <TiktokClassCombox
            :data="classList"
            v-model:value="row.classIdList"
            @change="(option: any) => changeClass(row, option)"
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
  import { Form, FormItem, Space, Button, Input, Tag, message } from 'ant-design-vue';
  import { VxeTableInstance, VxeGridProps } from 'vxe-table';
  import { batch, getClassList, list, potPlayer } from './service';
  import { TiktokClassCombox, TiktokAuthorCombox } from '@/features/components/Profession';
  import { formatBitrate, formatSize } from '@/utils/formatter';
  import { add, adds, arrayFieldRepeat, formatDuration, thousandsSeparator } from '@sirpho/utils';

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
  const totalSize = ref(0);
  const totalDuration = ref(0);

  const gridOptions = reactive<VxeGridProps>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    columns: [
      { type: 'checkbox', width: 60, fixed: 'left', align: 'center' },
      { title: '序号', width: 100, align: 'center', slots: { default: 'seq' } },
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
        width: 120,
      },
      {
        field: 'size',
        title: '存储容量',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        slots: { default: 'size' },
        width: 120,
      },
      {
        field: 'bitrate',
        title: '比特率',
        slots: { default: 'bitrate' },
        sortable: true,
        width: 120,
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
      {
        field: 'path',
        title: '路径',
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
          // 人数
          if (['author'].includes(column.field)) {
            return thousandsSeparator(new Set(data.map((item: any) => item.author)).size) + '人';
          }
          // 文件数
          if (['name'].includes(column.field)) {
            return thousandsSeparator(data.length);
          }
          // 文件大小
          if (['size'].includes(column.field)) {
            const result = adds(...data.map((item) => item[column.field] || 0));
            if (column.field === 'size') {
              return formatSize(result || 0);
            }
          }
          // 时长
          if (['duration'].includes(column.field)) {
            const result = adds(...data.map((item) => item[column.field] || 0));
            const hour = Math.floor(result / 3600);
            const minute = Math.floor((result % 3600) / 60);
            const second = result % 60;

            return result
              ? `${(hour ? hour + '小时' : '') + (minute ? minute + '分钟' : '') + (second ? second + '秒' : '')}`
              : '';
          }
          return null;
        }),
      ];
    },
  });

  onMounted(() => {
    queryClassList();
    // handleQuery();
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
    if (!formState.author && !formState.name && formState.classIdList?.length <= 0) {
      if (!confirm('确定不带参查询吗？')) {
        return;
      }
    }

    tableLoading.value = true;
    const res = await list(formState).finally(() => {
      tableLoading.value = false;
    });
    tableList.value = (res.data || []).map((item: any) => ({
      ...item,
      classIdList: (item.classList || []).map((ite: any) => ite.id),
      classNameList: (item.classList || []).map((ite: any) => ite.name),
    }));
    totalSize.value = tableList.value.reduce((previousValue, currentValue) => {
      return add(previousValue, currentValue.size);
    }, 0);
    totalDuration.value = tableList.value.reduce((previousValue, currentValue) => {
      return add(previousValue, currentValue.duration);
    }, 0);
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
    // 重新查询标签，以便根据更新时间重新排序
    queryClassList();
  };

  /**
   * 修改标签
   * @param row
   * @param options
   */
  const changeClass = (row: any, options: any[]) => {
    row.classIdList = options.map((item: any) => item.id);
    row.classNameList = options.map((item: any) => item.name);
    row.classList = options;
  };

  /**
   * 批量设置标签
   */
  const handleBatch = () => {
    const checkRecord = xTable.value.getCheckboxRecords();
    if (!checkRecord.length) {
      message.warning('请先选择行项目！');
      return;
    }

    if (formState.classIdList?.length <= 0) {
      message.warning('请先选择标签！');
      return;
    }

    const checkClassList = classList.value.find((item) => formState.classIdList.includes(item.id));
    checkRecord.forEach((item) => {
      item.classList = arrayFieldRepeat((item.classList || []).concat(checkClassList), 'id');
      item.classIdList = item.classList.map((item: any) => item.id);
      item.classNameList = item.classList.map((item: any) => item.name);
    });

    xTable.value.clearCheckboxRow();
  };

  /**
   * 通过potPlayer播放
   */
  const handlePlayer = (row: any) => {
    potPlayer(row);
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
