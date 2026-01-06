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
          <TiktokClassCombox
            :data="classList"
            v-model:value="formState.classIdList"
            style="width: 260px"
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
          </Space>
        </FormItem>
      </Form>
    </QueryFilterContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...gridOptions }" :data="tableList" :loading="tableLoading" ref="xTable">
        <!-- 表格操作 -->
        <template #toolbar_buttons>
          <Form layout="inline">
            <FormItem label="">
              <Button size="small" type="primary" @click="handleBatch">批量设置标签</Button>
            </FormItem>
            <FormItem label="表格字段">
              <ComboBox
                v-bind="{ ...fieldComboboxOption }"
                v-model:value="selectedColumns"
                :data="optionalColumns"
                mode="multiple"
                @change="() => handleField()"
              />
            </FormItem>
          </Form>
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
  import { VxeTableInstance } from 'vxe-table';
  import {
    batch,
    defaultColumns,
    optionalColumns,
    fieldComboboxOption,
    getClassList,
    list,
    potPlayer,
  } from './service';
  import { TiktokClassCombox, TiktokAuthorCombox } from '@/features/components/Profession';
  import { formatBitrate, formatSize } from '@/utils/formatter';
  import { add, adds, arrayFieldRepeat, formatDuration, thousandsSeparator } from '@sirpho/utils';
  import { TIKTOK_TABLE_COLUMNS_KEY } from '@/enums/cacheEnum';
  import { createLocalStorage } from '@/utils/cache';
  import ComboBox from '@/components/Box/src/ComboBox.vue';

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
  const ls = createLocalStorage();

  const gridOptions = reactive<any>({
    editConfig: {},
    keepSource: true,
    toolbarConfig: { slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' } },
    columns: [...defaultColumns],
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
          if (['path'].includes(column.field)) {
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

  /**
   * 已选择的字段
   */
  const selectedColumns = ref<any[]>([]);

  /**
   * 记住选择
   */
  const remember = ref(true);
  /**
   * 初始化获取表格列字段
   */
  const init = () => {
    const selected = ls.get(TIKTOK_TABLE_COLUMNS_KEY);
    selectedColumns.value = selected || [];
    if (selectedColumns.value.length > 0) {
      remember.value = true;
    }
    generate();
  };

  onMounted(() => {
    init();
    queryClassList();
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

  /**
   * 添加列
   */
  const generate = () => {
    const nextColumns: any[] = optionalColumns.filter((item) =>
      selectedColumns.value.includes(item.field),
    );
    gridOptions.columns = [...defaultColumns, ...nextColumns];
  };

  /**
   * 记住特性选择
   */
  const handleRemember = () => {
    if (remember.value) {
      ls.set(TIKTOK_TABLE_COLUMNS_KEY, selectedColumns.value);
    } else {
      ls.remove(TIKTOK_TABLE_COLUMNS_KEY);
    }
  };

  /**
   * 修改表格字段配置
   */
  const handleField = () => {
    generate();
    handleRemember();
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
