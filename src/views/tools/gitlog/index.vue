<template>
  <PageContainer>
    <VxeContainer direction="vertical" :size="[20, 80]">
      <div class="operation-bar">
        <Checkbox
          v-model:checked="checkAll"
          :indeterminate="indeterminate"
          @change="onCheckAllChange"
        >
          全选
        </Checkbox>
        <Divider size="small" />
        <CheckboxGroup v-model:value="checkList" :options="options" />
        <Button type="primary" @click="handleQuery()">确定</Button>
      </div>
      <div
        class="content"
        style="display: flex; flex-direction: column; height: 100%; padding: 12px"
      >
        <Form name="form" :model="formState" layout="inline" @finish="() => handleQuery()">
          <FormItem label="时间" name="date" :rules="[{ required: true, message: '必填项' }]">
            <RangePicker v-model:value="formState.date" :allowClear="false" size="small" />
          </FormItem>
          <FormItem>
            <Space>
              <Button type="primary" html-type="submit" :loading="loading" size="small">
                查询
              </Button>
            </Space>
          </FormItem>
        </Form>
        <Input.TextArea style="flex: 1" v-model:value="content" />
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script setup lang="ts">
  import {
    Button,
    Checkbox,
    CheckboxGroup,
    Divider,
    Form,
    FormItem,
    Input,
    RangePicker,
    Space,
  } from 'ant-design-vue';
  import { PageContainer, VxeContainer } from '@/components/Layout';
  import { reactive, ref, watch, computed, watchEffect } from 'vue';
  import { getLog } from '@/views/tools/gitlog/service';
  import dayjs, { Dayjs } from 'dayjs';
  import { timeRangeHandler } from '@/features/dayjs';
  import { uniq } from 'lodash-es';
  import { number2CN } from '@sirpho/utils';
  import { useDict } from '@/hooks/web/useDict';

  const loading = ref(false);
  const checkAll = ref(false);
  const indeterminate = ref(false);
  const checkList = ref<number[]>([]);

  interface FormState {
    date: [Dayjs, Dayjs];
  }
  const formState = reactive<FormState>({
    date: [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  });
  const [gitlabOptions] = useDict([
    'GITLAB', // gitlab项目
  ]);

  const options = computed(() =>
    (gitlabOptions.value || []).map((item) => ({
      label: item.name,
      value: item.sortOrder,
      dev: item.value,
    })),
  );

  /**
   * 全选下拉
   */
  const plainOptions = ref<any[]>([]);

  watchEffect(() => {
    plainOptions.value = options.value.map((item) => item.value);
    checkList.value = [...plainOptions.value];
  });

  /**
   * 全选
   * @param e
   */
  const onCheckAllChange = (e: any) => {
    indeterminate.value = false;
    checkList.value = e.target.checked ? [...plainOptions.value] : [];
  };
  /**
   * 全选半选状态监听
   */
  watch(
    () => checkList.value,
    (val) => {
      indeterminate.value = !!val.length && val.length < plainOptions.value.length;
      checkAll.value = val.length === plainOptions.value.length;
    },
  );

  /**
   * 日志
   */
  const content = ref('');

  /**
   * 匹配括号里的内容
   * @param text
   */
  const getContent = (text: string) => {
    const regex = /【(.*?)】/g;
    let matches: any[] = [];
    let match: any;

    while ((match = regex.exec(text)) !== null) {
      // match[1] 包含括号中捕获的内容
      matches.push(match[1]);
    }
    return matches;
  };

  /**
   * 查询
   */
  const handleQuery = async () => {
    const [since, until] = timeRangeHandler(formState.date, {
      format: 'YYYY-MM-DD',
    });
    const result: any[] = [];
    const projectList = options.value.filter((item) => checkList.value.includes(item.value));
    loading.value = true;
    for (const item of projectList) {
      const object: any = {
        name: item.label,
        messageList: [],
      };
      const messageList: any[] = [];
      const res = await getLog({
        ...item,
        page: 1,
        ref_name: item.dev,
        per_page: 5000,
        since: `${since}T00:00:00Z`,
        until: `${until}T23:59:59Z`,
      });
      const list = (res.data || []).filter(
        (item: any) =>
          ['徐泽峰', 'sirpho'].includes(item.author_name) ||
          ['徐泽峰', 'sirpho'].includes(item.committer_name),
      );
      list.forEach((ite: any) => {
        messageList.push(...getContent(ite.message));
      });
      object.messageList = uniq(messageList);
      if (object.messageList.length > 0) {
        result.push(object);
      }
    }
    loading.value = false;

    const textList: string[] = [];
    for (let i = 0; i < result.length; i++) {
      const seq = number2CN(i + 1);
      const name = result[i].name;
      textList.push(`${seq}、${name}`);
      textList.push(result[i].messageList.join('、'));
    }
    content.value = textList.join('\n');
  };
</script>

<style scoped lang="less">
  .operation-bar {
    display: flex;
    position: relative;
    flex-direction: column;
    height: 100%;
    padding: 12px;

    .ant-btn {
      position: absolute;
      right: 7px;
      bottom: 12px;
      left: 7px;
    }
  }

  .ant-checkbox-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
</style>
