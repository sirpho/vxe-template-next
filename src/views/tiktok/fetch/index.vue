<template>
  <VxeContainer>
    <PageContainer style="width: 800px; margin: 0 auto">
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
      <Divider>音乐文件处理</Divider>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleGenerateMusic" :loading="loadingGenerateMusic" type="primary">
          音乐文件处理
        </Button>
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
        <Divider>处理异常的文件</Divider>
        <vxe-grid v-bind="{ ...gridOptions }" :data="tableList" ref="xTable" />
      </template>
    </PageContainer>
  </VxeContainer>
</template>

<script lang="ts" setup>
  import { Button, Checkbox, Divider, Form, FormItem, Input, message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { increment, rename, stock, generateMusic } from './service';
  import { VxeContainer, PageContainer } from '@/components/Layout';
  import { VxeGridProps } from 'vxe-table';

  const loadingGenerateMusic = ref(false);
  const loadingIncrement = ref(false);
  const loadingStock = ref(false);
  const loadingRename = ref(false);

  const formState = reactive({
    prefix: '',
    path: '',
    removeExisted: true,
  });

  const tableList = ref<any[]>([]);
  const gridOptions = reactive<VxeGridProps>({
    columns: [
      { type: 'seq', title: '序号', width: 120, align: 'center' },
      {
        field: 'author',
        title: '作者',
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
      {
        field: 'name',
        title: '文件名',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
      {
        field: 'suffix',
        title: '后缀名',
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
      },
    ],
    showHeaderOverflow: 'tooltip',
    height: '400px',
  });

  /**
   * 增量文件重命名
   */
  const handleIncrement = async () => {
    loadingIncrement.value = true;
    const res = await increment().finally(() => {
      loadingIncrement.value = false;
    });
    tableList.value = res.data.exceptionList || [];
    message.success(`新增文件记录${res.data.increaseCount}条，新增标签记录${res.data.tagCount}条`);
  };

  /**
   * 全量重新生成
   */
  const handleStock = async () => {
    loadingStock.value = true;
    const res = await stock().finally(() => {
      loadingStock.value = false;
    });
    tableList.value = res.data.exceptionList || [];
    message.success(`新增文件记录${res.data.increaseCount}条，新增标签记录${res.data.tagCount}条`);
  };

  /**
   * 音乐文件处理
   */
  const handleGenerateMusic = async () => {
    loadingGenerateMusic.value = true;
    const res = await generateMusic().finally(() => {
      loadingGenerateMusic.value = false;
    });
    tableList.value = res.data.exceptionList || [];
    message.success(`新增文件记录${res.data.increaseCount}条`);
  };

  /**
   * 重命名
   */
  const handleSubmit = async () => {
    loadingRename.value = true;
    const res = await rename(formState).finally(() => {
      loadingRename.value = false;
    });
    message.success(
      `重命名数量${res.data.renameCount}条，删除已收录的重复文件${res.data.removeCount}条`,
    );
  };
</script>
