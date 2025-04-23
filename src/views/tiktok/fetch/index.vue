<template>
  <VxeContainer>
    <PageContainer style="width: 400px; margin: 0 auto">
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleIncrement" :loading="loadingIncrement">增量文件重命名</Button>
        <Button @click="handleStock" :loading="loadingStock">全量重新生成</Button>
      </div>
      <Divider>文件夹内文件md5重命名</Divider>
      <Form
        style="width: 400px"
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
          <Button html-type="submit" type="primary" :loading="loadingRename">确定</Button>
        </div>
      </Form>
    </PageContainer>
  </VxeContainer>
</template>

<script lang="ts" setup>
  import { Button, Checkbox, Divider, Form, FormItem, Input, message } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { increment, rename, stock } from './service';
  import { VxeContainer, PageContainer } from '@/components/Layout';

  const loadingIncrement = ref(false);
  const loadingStock = ref(false);
  const loadingRename = ref(false);

  const formState = reactive({
    prefix: '',
    path: '',
    removeExisted: true,
  });

  /**
   * 增量文件重命名
   */
  const handleIncrement = async () => {
    loadingIncrement.value = true;
    const res = await increment().finally(() => {
      loadingIncrement.value = false;
    });
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
    message.success(`新增文件记录${res.data.increaseCount}条，新增标签记录${res.data.tagCount}条`);
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
