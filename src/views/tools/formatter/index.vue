<template>
  <PageContainer>
    <VxeContainer direction="column">
      <div class="wrapper">
        <Divider>JAVA类定义</Divider>
        <Form layout="inline">
          <FormItem label="最小宽度">
            <InputNumber v-model:value="minWidth" size="small" />
          </FormItem>
          <FormItem label="步长">
            <InputNumber v-model:value="step" size="small" />
          </FormItem>
        </Form>
        <Space>
          <Button
            type="primary"
            @click="() => handleFormatter()"
            style="width: 200px; margin: 7px 0 12px"
            size="small"
          >
            生成
          </Button>
        </Space>
        <Input.TextArea placeholder="java类" v-model:value="javaCode" />
      </div>
      <div class="wrapper">
        <Divider>JSON生成</Divider>
        <Space>
          <Button
            type="primary"
            @click="() => handleCopy()"
            style="width: 200px; margin-bottom: 12px"
            size="small"
          >
            复制
          </Button>
          <Button
            type="primary"
            @click="() => handlePreview()"
            style="width: 200px; margin-bottom: 12px"
            size="small"
          >
            预览
          </Button>
        </Space>

        <pre
          class="m-0 p-4 overflow-auto w-full"
          style="flex: 1; border: 1px solid #d9d9d9; border-radius: 6px"
        >
        <code ref="jsonCodeElement" class="language-json"></code>
      </pre>
      </div>
    </VxeContainer>
    <StatusPop
      title="表格预览"
      v-model:visible="logVisible"
      :columns="columns"
      :request="requestQuery"
    />
  </PageContainer>
</template>
<script setup lang="ts">
  import { Input, InputNumber, Space, Divider, Button, Form, FormItem } from 'ant-design-vue';
  import { ref, nextTick } from 'vue';
  import hljs from 'highlight.js/lib/core';
  import { copyText } from '@/utils/copyTextToClipboard';
  import { StatusPop } from '@/components/status-pop';
  import { PageContainer, VxeContainer } from '@/components/Layout';

  const javaCode = ref('');
  const columns = ref<any[]>([]);
  const jsonCode = ref('');
  const jsonCodeElement = ref();
  const minWidth = ref(120);
  const step = ref(10);
  const logVisible = ref(false);

  /**
   * 转换
   */
  const handleFormatter = async () => {
    const regex = /^[\s\S]*?public class/gm;
    const code = javaCode.value.replace(regex, 'public class');
    const fieldRegex = /\/\*\*[\s\S]*?\*\/\s*private\s+(\w+)\s+(\w+);/g;
    const result: any[] = [];
    let match;

    while ((match = fieldRegex.exec(code)) !== null) {
      const fullMatch = match[0];
      const type = match[1];
      const fieldName = match[2];

      // 提取注释内容
      const commentBlock = fullMatch.match(/\/\*\*([\s\S]*?)\*\//)[1];
      let title = commentBlock
        .split('\n')
        .map((line) => line.replace(/^\s*\*\s?/, '').trim()) // 去除每行的*和空格
        .filter((line) => line) // 过滤空行
        .join(' ') // 合并多行注释（如有）
        .trim();

      // 确定cellType
      const cellType = ['String', 'Date'].includes(type) ? 'string' : 'number';

      if (!title || title === 'null') {
        title = '待定字段';
      }

      const length = title?.length || 0;
      let currentMinWidth = minWidth.value;
      if (['物料名称', '供应商名称'].includes(title)) {
        currentMinWidth += 20;
      }
      const count = length <= 4 ? 0 : length - 4;

      // 构建配置项
      result.push({
        field: fieldName,
        title: title,
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: currentMinWidth + count * step.value,
        cellType: cellType,
      });
    }
    columns.value = result;
    jsonCode.value = JSON.stringify(result, null, 2);
    await nextTick();
    jsonCodeElement.value.textContent = jsonCode.value;
    hljs.highlightElement(jsonCodeElement.value);
  };

  /**
   * 复制
   */
  const handleCopy = () => {
    copyText(jsonCode.value);
  };

  /**
   * 预览
   */
  const handlePreview = () => {
    logVisible.value = true;
  };

  const requestQuery = () => {
    return new Promise((resolve) => {
      resolve([]);
    });
  };
</script>

<style lang="less" scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 0 7px 7px;
    overflow: auto;
  }

  ::v-deep(textarea) {
    flex: 1;
    height: 100%;
  }
</style>
