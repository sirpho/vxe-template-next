<template>
  <VxeContainer>
    <PageContainer style="width: 850px; height: 100%; margin: 0 auto; overflow: auto">
      <Divider>TIKTOK文件处理</Divider>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleIncrement" :loading="loadingIncrement" type="primary">
          增量文件重命名
        </Button>
        <Button @click="handleStock" :loading="loadingStock">全量重新生成</Button>
      </div>
      <br />
      <br />
      <br />
      <Divider>数据整理</Divider>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleGenerateDancer" :loading="loadingGenerateDancer" type="primary">
          博主整理
        </Button>
        <Button @click="handleRepeat" :loading="loadingRepeat">重复文件查询</Button>
        <Button @click="handleRemoveStaleRecords" :loading="loadingRemove">删除无效记录</Button>
      </div>
      <br />
      <br />
      <br />

      <Divider>文件夹内文件根据md5重命名</Divider>
      <Form
        style="width: 800px"
        layout="horizontal"
        :model="formState"
        @finish="() => handleSubmit()"
        :label-col="{ span: 0 }"
        :wrapper-col="{ span: 24 }"
      >
        <FormItem prop="prefix">
          <Input placeholder="前缀" v-model:value="formState.prefix" />
        </FormItem>
        <FormItem prop="path" :rules="[{ required: true, message: '路径必填' }]">
          <Input placeholder="路径" v-model:value="formState.path" />
        </FormItem>
        <FormItem prop="removeExisted">
          <Checkbox v-model:checked="formState.removeExisted">删除已收录的</Checkbox>
        </FormItem>
        <div style="display: flex; justify-content: center">
          <Button html-type="submit" type="primary" :loading="loadingRename" style="width: 200px">
            开始重命名
          </Button>
        </div>
      </Form>

      <template v-if="tableList.length > 0">
        <br />
        <br />
        <br />
        <Divider>文件处理结果</Divider>
        <Divider v-if="resultMessage">{{ resultMessage }}</Divider>

        <vxe-grid
          v-bind="{ ...gridOptions }"
          :columns="tableColumns"
          :data="tableList"
          ref="xTable"
        >
          <template #toolbar_tools>
            <Button
              danger
              @click="handleRemovePathRecords"
              :loading="loadingRemovePath"
              size="small"
            >
              删除文件及记录
            </Button>
          </template>
        </vxe-grid>
      </template>
    </PageContainer>
  </VxeContainer>
</template>

<script lang="ts" setup>
  import { Button, Checkbox, Divider, Form, FormItem, Input, message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import {
    increment,
    rename,
    stock,
    repeat,
    generateDancer,
    tiktokColumns,
    repeatColumns,
    renameColumns,
    colors,
    removeStaleRecords,
    removePathRecords,
  } from './service';
  import { VxeContainer, PageContainer } from '@/components/Layout';
  import { VxeGridProps } from 'vxe-table';
  import { hexToRGBA } from '@/utils/color';
  import { adds, thousandsSeparator } from '@sirpho/utils';
  import { formatSize } from '@/utils/formatter';

  const loadingGenerateDancer = ref(false);
  const loadingIncrement = ref(false);
  const loadingStock = ref(false);
  const loadingRepeat = ref(false);
  const loadingRemove = ref(false);
  const loadingRemovePath = ref(false);
  const loadingRename = ref(false);
  const showRemove = ref(false);
  const resultMessage = ref('');
  const xTable = ref();

  const formState = reactive({
    prefix: '',
    path: '',
    removeExisted: true,
  });

  const tableList = ref<any[]>([]);
  const tableColumns = ref<any[]>(tiktokColumns);
  const gridOptions = reactive<VxeGridProps>({
    showHeaderOverflow: 'tooltip',
    height: '400px',
    checkboxConfig: {
      showHeader: false,
    },
    toolbarConfig: { slots: { tools: 'toolbar_tools' } },
    rowStyle: ({ row }) => {
      const color = row.color || 'unset';
      const exceptionColor = row.exception ? 'rgb(252 86 51 / 20%)' : 'unset';
      return {
        background: color || exceptionColor,
      };
    },
    showFooter: true,
    footerMethod: ({ columns, data }) => {
      return [
        columns.map((column, columnIndex) => {
          if (columnIndex === 0) {
            return '合计';
          }
          // 文件大小 时长
          if (['size', 'duration'].includes(column.field)) {
            const result = adds(...data.map((item) => item[column.field] || 0));
            if (column.field === 'size') {
              return formatSize(result || 0);
            }
            if (column.field === 'duration') {
              const minute = Math.floor(result / 60);
              const second = result % 60;

              return result
                ? `${(minute ? minute + '分钟' : '') + (second ? second + '秒' : '')}`
                : '';
            }
            return thousandsSeparator(result);
          }
          return null;
        }),
      ];
    },
  });

  /**
   * 初始化
   */
  const init = () => {
    resultMessage.value = '';
    showRemove.value = false;
    tableList.value = [];
  };

  /**
   * 增量文件重命名
   */
  const handleIncrement = async () => {
    init();
    loadingIncrement.value = true;
    const res = await increment().finally(() => {
      loadingIncrement.value = false;
    });
    tableColumns.value = tiktokColumns;
    const exceptionList = (res.data.exceptionList || []).map((item) => ({
      ...item,
      exception: true,
    }));

    const resultList = (res.data.resultList || []).map((item) => ({
      ...item,
      exception: false,
    }));

    tableList.value = [...exceptionList, ...resultList];
    resultMessage.value = `新增文件记录${res.data.increaseCount}条，新增标签记录${res.data.tagCount}条`;
    message.success(resultMessage.value);
  };

  /**
   * 全量重新生成
   */
  const handleStock = async () => {
    init();
    loadingStock.value = true;
    const res = await stock().finally(() => {
      loadingStock.value = false;
    });
    tableColumns.value = tiktokColumns;
    const exceptionList = (res.data.exceptionList || []).map((item) => ({
      ...item,
      exception: true,
    }));

    const resultList = (res.data.resultList || []).map((item) => ({
      ...item,
      exception: false,
    }));

    tableList.value = [...exceptionList, ...resultList];
    resultMessage.value = `新增文件记录${res.data.increaseCount}条，新增标签记录${res.data.tagCount}条`;
    message.success(resultMessage.value);
  };

  /**
   * 重复文件查询
   */
  const handleRepeat = async () => {
    init();
    loadingRepeat.value = true;
    const colorMap = {};
    const res = await repeat().finally(() => {
      loadingRepeat.value = false;
    });
    tableColumns.value = repeatColumns;
    tableList.value = res.data || [];
    showRemove.value = true;

    let i = 0;
    tableList.value.forEach((item) => {
      colorMap[item.md5] = colorMap[item.md5] || hexToRGBA(colors[i++ % colors.length], 0.2);
      item.color = colorMap[item.md5];
    });
  };

  /**
   * 删除无效记录
   */
  const handleRemoveStaleRecords = async () => {
    init();
    loadingRemove.value = true;
    const res = await removeStaleRecords().finally(() => {
      loadingRemove.value = false;
    });
    resultMessage.value = `本次共移除${res.data}条记录`;
    message.success(resultMessage.value);
  };

  /**
   * 删除文件和记录
   */
  const handleRemovePathRecords = async () => {
    const checkRecords = xTable.value.getCheckboxRecords();
    if (checkRecords.length <= 0) {
      message.error('请先选择行项目');
      return;
    }
    loadingRemovePath.value = true;
    const res = await removePathRecords(checkRecords).finally(() => {
      loadingRemovePath.value = false;
    });
    tableList.value = res.data || [];

    await handleRepeat();
  };

  /**
   * 博主整理
   */
  const handleGenerateDancer = async () => {
    init();
    loadingGenerateDancer.value = true;
    await generateDancer().finally(() => {
      loadingGenerateDancer.value = false;
    });

    message.success(`整理完成`);
  };

  /**
   * 重命名
   */
  const handleSubmit = async () => {
    init();
    loadingRename.value = true;
    const res = await rename(formState).finally(() => {
      loadingRename.value = false;
    });
    tableColumns.value = renameColumns;
    tableList.value = res.data.list || [];
    resultMessage.value = `重命名数量${res.data.renameCount}条，删除已收录的重复文件${res.data.removeCount}条`;
    message.success(resultMessage.value);
  };
</script>
