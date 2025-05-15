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
        <code ref="templateCodeElement" class="language-json"></code>
      </pre>
      </div>
    </VxeContainer>
    <StatusPop
      title="表格预览"
      v-model:visible="logVisible"
      :columns="columns"
      :request="requestQuery"
    />

    <Modal
      title="页面选项"
      v-model:visible="optionVisible"
      width="850px"
      wrapClassName="option-wrapper"
      @ok="() => handleConfirm()"
    >
      <vxe-grid :columns="optionColumns" :data="optionTableList" auto-resize height="400">
        <template #form>
          <Form :model="pageState" layout="inline">
            <FormItem label="菜单名称">
              <Input v-model:value="pageState.title" size="small" />
            </FormItem>
            <Space>
              <Checkbox v-model:checked="pageState.allowCheckbox" size="small">可勾选</Checkbox>
              <Checkbox v-model:checked="pageState.allowInsert" size="small">可新增</Checkbox>
              <Checkbox v-model:checked="pageState.allowRemove" size="small">可删除</Checkbox>
              <Checkbox v-model:checked="pageState.allowExport" size="small"> 可导出 </Checkbox>
            </Space>
          </Form>
        </template>
        <!-- 查询项 -->
        <template #isSearch="{ row }">
          <Checkbox v-model:checked="row.isSearch" />
        </template>
        <!-- 查询类型 -->
        <template #searchMode="{ row }">
          <Select v-if="row.isSearch" v-model:value="row.searchMode" size="small">
            <Select.Option value="string">string</Select.Option>
            <Select.Option value="number">number</Select.Option>
            <Select.Option value="date">date</Select.Option>
            <Select.Option value="year">year</Select.Option>
            <Select.Option value="rangeDate">rangeDate</Select.Option>
            <Select.Option value="month">month</Select.Option>
          </Select>
          <span v-else>--</span>
        </template>
        <!-- 编辑项 -->
        <template #isEdit="{ row }">
          <Checkbox v-model:checked="row.isEdit" />
        </template>
        <!-- 编辑类型 -->
        <template #editMode="{ row }">
          <Select v-if="row.isEdit" v-model:value="row.editMode" size="small">
            <Select.Option value="string">string</Select.Option>
            <Select.Option value="number">number</Select.Option>
            <Select.Option value="date">date</Select.Option>
            <Select.Option value="year">year</Select.Option>
            <Select.Option value="rangeDate">rangeDate</Select.Option>
            <Select.Option value="month">month</Select.Option>
          </Select>
          <span v-else>--</span>
        </template>
      </vxe-grid>
    </Modal>
  </PageContainer>
</template>
<script setup lang="ts">
  import {
    Input,
    InputNumber,
    Space,
    Divider,
    Button,
    Form,
    FormItem,
    Modal,
    Checkbox,
    Select,
  } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import hljs from 'highlight.js/lib/core';
  import { copyText } from '@/utils/copyTextToClipboard';
  import { StatusPop } from '@/components/status-pop';
  import { PageContainer, VxeContainer } from '@/components/Layout';
  import type { VxeGridPropTypes } from 'vxe-table';
  import {
    EXPORT_BUTTON,
    EXPORT_FUNCTION,
    INSERT_BUTTON,
    INSERT_FUNCTION,
    PAGE_CONTAINER,
    QUERY_CONTAINER,
    REMOVE_BUTTON,
    REMOVE_FUNCTION,
    SAVE_BUTTON,
  } from './service';

  const javaCode = ref('');
  const columns = ref<any[]>([]);
  const templateCode = ref('');
  const templateCodeElement = ref();
  const minWidth = ref(120);
  const step = ref(10);
  const logVisible = ref(false);
  const optionVisible = ref(false);

  // 查询部分的代码
  const queryText = ref('');
  // 表格操作部分的代码
  const toolbarButtonsText = ref('');
  // 导入部分的代码
  const importText = ref<string[]>([]);
  // 脚本部分
  const scriptText = ref('');
  // 是否允许编辑
  const allowEdit = ref(false);

  const optionTableList = ref<any[]>([]);
  const searchItemList = ref<any[]>([]);
  const editItemList = ref<any[]>([]);
  const optionColumns = ref<VxeGridPropTypes.Columns>([
    {
      field: 'field',
      title: '字段',
      cellType: 'string',
      sortable: true,
      width: 120,
    },
    {
      field: 'title',
      title: '字段名称',
      cellType: 'string',
      sortable: true,
      width: 140,
    },
    {
      field: 'isSearch',
      title: '查询项',
      cellType: 'string',
      sortable: true,
      slots: { default: 'isSearch' },
      width: 120,
    },
    {
      field: 'searchMode',
      title: '查询类型',
      cellType: 'string',
      sortable: true,
      slots: { default: 'searchMode' },
      width: 160,
    },
    {
      field: 'isEdit',
      title: '编辑项',
      cellType: 'string',
      sortable: true,
      slots: { default: 'isEdit' },
      width: 120,
    },
    {
      field: 'editMode',
      title: '编辑类型',
      cellType: 'string',
      sortable: true,
      slots: { default: 'editMode' },
      width: 160,
    },
  ]);

  const pageState = reactive({
    allowCheckbox: true,
    allowInsert: true,
    allowRemove: true,
    allowExport: true,
    mode: 'WMS',
    title: '',
  });

  const importSet = new Set<String>();
  const antDesignVueSet = new Set<String>();
  antDesignVueSet.add('Button');
  antDesignVueSet.add('Form');
  antDesignVueSet.add('FormItem');
  antDesignVueSet.add('Space');

  /**
   * 默认模式
   */
  const getDefaultMode = (item: any) => {
    if (item.title.includes('月')) {
      return 'month';
    }
    if (item.title.includes('年')) {
      return 'year';
    }
    if (item.title.includes('时间') || item.title.includes('日期')) {
      return 'date';
    }
    return item.cellType;
  };

  /**
   * 转换
   */
  const handleFormatter = async () => {
    const regex = /^[\s\S]*?public class/gm;
    const tableRegex = /^\s*@Table.*$/gm;
    let code = javaCode.value.replace(regex, 'public class').replace(tableRegex, '');
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
    columns.value = [...result];
    optionTableList.value = result.map((item: any) => ({
      field: item.field,
      title: item.title,
      isSearch: false,
      searchMode: getDefaultMode(item),
      isEdit: false,
      editMode: getDefaultMode(item),
    }));
    optionVisible.value = true;
  };

  /**
   * 生成编辑框
   */
  const generateFormItem = (item: any, mode: 'searchMode' | 'editMode') => {
    let recordText: string;
    const result: string[] = [];
    let close: string;
    /* eslint-disable */
    if (mode === 'editMode') {
      recordText = 'row';
      result.push(`<!-- ${item.title} -->`);
      result.push(`<template #${item.field}='{ row }'>`);
      close = '</template>';
    } else {
      recordText = 'formState';
      result.push(`<FormItem label='${item.title}' name='${item.field}'>`);
      close = '</FormItem>';
    }
    switch (item[mode]) {
      case 'string':
        result.push(`
        <Input v-model:value='${recordText}.${item.field}' allow-clear size='small' />
        `);
        antDesignVueSet.add('Input');
        break;
      case 'number':
        result.push(`
        <InputNumber v-model:value='${recordText}.${item.field}' allow-clear size='small' />
        `);
        antDesignVueSet.add('InputNumber');
        break;
      case 'date':
        result.push(`
        <DatePicker
          ${mode === 'editMode' ? ':getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"' : ''}
          v-model:value="${recordText}.${item.field}"
          format="YYYY-MM-DD"
          size="small"
          value-format="YYYY-MM-DD"
        />
        `);
        antDesignVueSet.add('DatePicker');
        break;
      case 'year':
        result.push(`
        <DatePicker
          picker="year"
          ${mode === 'editMode' ? ':getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"' : ''}
          v-model:value="${recordText}.${item.field}"
          format="YYYY-MM"
          size="small"
          value-format="YYYY"
        />
        `);
        antDesignVueSet.add('DatePicker');
        break;
      case 'month':
        result.push(`
        <DatePicker
          picker="month"
          ${mode === 'editMode' ? ':getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"' : ''}
          v-model:value="${recordText}.${item.field}"
          format="YYYY-MM"
          size="small"
          value-format="YYYY-MM"
        />
        `);
        antDesignVueSet.add('DatePicker');
        break;
      case 'rangeDate':
        result.push(`
        <RangePicker
          ${mode === 'editMode' ? ':getPopupContainer="(trigger) => trigger.parentElement as HTMLElement"' : ''}
          v-model:value="${recordText}.${item.field}"
          size="small"
        />
        `);
        antDesignVueSet.add('RangePicker');
        importSet.add(`import dayjs, type { Dayjs } from 'dayjs';`);
        break;
    }
    result.push(close);
    /* eslint-enable */
    return result.join('\n');
  };

  /**
   * 生成import部分
   */
  const generateImportCode = () => {
    /* eslint-disable */
    importSet.add(`import { reactive, ref } from 'vue';`);
    importSet.add(
      `import { PageContainer, QueryFilterContainer, VxeContainer } from '@wahaha/wui-pro-components';`,
    );
    importSet.add(`import type { VxeGridProps } from 'vxe-table';`);
    importSet.add(`import { useDefaultProps } from '@wahaha/vxe-ext-core';`);
    importSet.add(
      `import { list${allowEdit.value || pageState.allowRemove ? ', saveEntity' : ''} } from './service';`,
    );
    if (pageState.allowRemove) {
      antDesignVueSet.add('message');
      antDesignVueSet.add('Modal');
    }
    importSet.add(
      `import { ${Array.from(antDesignVueSet).sort().join(', ')} } from 'ant-design-vue';`,
    );
    /* eslint-enable */
    importText.value = Array.from(importSet) as string[];
  };

  /**
   * 生成表格操作部分
   */
  const generateToolbar = () => {
    /* eslint-disable */
    toolbarButtonsText.value = '';
    if (pageState.allowRemove || allowEdit.value) {
      toolbarButtonsText.value = `
            <!-- 表格操作 -->
            <template #toolbar_buttons>
              <Space>
            `;
      if (pageState.allowInsert) {
        toolbarButtonsText.value += INSERT_BUTTON;
      }
      if (pageState.allowRemove) {
        toolbarButtonsText.value += REMOVE_BUTTON;
      }
      toolbarButtonsText.value += SAVE_BUTTON;
      toolbarButtonsText.value += `
              </Space>
        </template>`;
    }
    /* eslint-enable */
  };

  /**
   * 生成脚本部分
   */
  const generateScript = () => {
    /* eslint-disable */
    // 查询项定义
    const interfaceList: string[] = ['interface FormState {'];
    const formStateList: string[] = ['// 表单数据', 'const formState = reactive<FormState>({'];
    searchItemList.value.forEach((item) => {
      let interfaceType = item.searchMode;
      if (['year', 'month', 'date'].includes(item.searchMode)) {
        interfaceType = 'string';
      } else if (item.searchMode === 'rangeDate') {
        interfaceType = '[Dayjs, Dayjs]';
      }
      interfaceList.push(`${item.field}?: ${interfaceType};`);
      formStateList.push(
        `${item.field}: ${item.searchMode === 'rangeDate' ? "[dayjs().startOf('month'), dayjs()]" : 'undefined'},`,
      );
    });
    interfaceList.push('}');
    formStateList.push('});');

    const validRulesText: string[] = [];

    if (editItemList.value.length > 0) {
      validRulesText.push('\n');
      validRulesText.push(
        `
       /**
       * 校验
       */`,
        'const validRules = ref({',
      );
      editItemList.value.forEach((item) => {
        validRulesText.push(`${item.field}: [{ required: true, message: '必填项' }],`);
      });
      validRulesText.push('});');
    }

    const gridOptionsText: any = [
      '// 页面字段维护',
      'const gridOptions = reactive<VxeGridProps>({',
    ];
    if (allowEdit.value) {
      gridOptionsText.push('editConfig: {},');
      gridOptionsText.push('keepSource: true,');
      gridOptionsText.push(`toolbarConfig: { slots: { buttons: 'toolbar_buttons' } },`);
    }
    if (editItemList.value.length > 0) {
      gridOptionsText.push(`editRules: validRules.value,`);
    }
    const columnsText = JSON.stringify(columns.value, null, 2);
    gridOptionsText.push(`columns: ${columnsText},`);
    gridOptionsText.push(`showHeaderOverflow: 'tooltip',`);
    gridOptionsText.push(`});`);

    const vxeDefaultPropsText: string[] = [
      'const { vxeDefaultProps, vxeExtraProps, vxeInstance } = useDefaultProps({',
      'refs: xTable,',
      'formState,',
      '// 列表查询',
      'request: list,',
    ];
    if (allowEdit.value || pageState.allowRemove) {
      vxeDefaultPropsText.push('// 保存方法');
      vxeDefaultPropsText.push('save: saveEntity,');
    }
    const rangeDateList = searchItemList.value.filter((item) => item.searchMode === 'rangeDate');
    if (rangeDateList.length > 0) {
      vxeDefaultPropsText.push(`beforeSearchSubmit: (params: FormState) => {`);
      const fieldList = rangeDateList.map((item) => item.field);
      vxeDefaultPropsText.push(`const { ${fieldList.join(', ')}, ...other } = params;`);
      const rangeFieldList: string[] = [];
      fieldList.forEach((item) => {
        vxeDefaultPropsText.push(
          `const [${item.field}Start, ${item.field}End] = timeRangeHandler(date, { format: 'YYYY-MM-DD', });`,
        );
        rangeFieldList.push(`${item.field}Start`);
        rangeFieldList.push(`${item.field}End`);
      });
      vxeDefaultPropsText.push(`return { ${rangeFieldList.join(', ')}, ...other };`);
      vxeDefaultPropsText.push(`},`);
    }
    vxeDefaultPropsText.push(`});`);

    const functionText: string[] = [];
    if (pageState.allowInsert) {
      functionText.push(INSERT_FUNCTION);
    }
    if (pageState.allowRemove) {
      functionText.push(REMOVE_FUNCTION);
    }
    if (pageState.allowExport) {
      functionText.push(EXPORT_FUNCTION(pageState.title));
    }

    const result: string[] = [
      '<script lang="ts" setup>',
      ...importText.value,
      ...interfaceList,
      ...formStateList,
      ...validRulesText,
      'const xTable = ref();',
      ...gridOptionsText,
      ...vxeDefaultPropsText,
      ...functionText,
    ];
    result.push('<\/script>');
    scriptText.value = result.join('\n');
    /* eslint-enable */
  };

  /**
   * 弹框确认
   */
  const handleConfirm = () => {
    if (pageState.allowCheckbox) {
      columns.value = [
        { type: 'checkbox', width: 40, fixed: 'left', align: 'center' },
        ...columns.value,
      ];
    }
    importSet.clear();
    searchItemList.value = optionTableList.value.filter((item) => item.isSearch);
    editItemList.value = optionTableList.value.filter((item) => item.isEdit);
    allowEdit.value = pageState.allowInsert || editItemList.value.length > 0;

    const searchFormItemList: string[] = [];
    const editSlotList: string[] = [];
    if (editItemList.value.length > 0) {
      editSlotList.push(`<!-- 可编辑列 -->`);
    }

    searchItemList.value.forEach((item) => {
      searchFormItemList.push(generateFormItem(item, 'searchMode'));
    });
    queryText.value = QUERY_CONTAINER.replace('@@@FORM_ITEM@@@', searchFormItemList.join('\n'));
    const exportButton = pageState.allowExport ? EXPORT_BUTTON : '';
    queryText.value = queryText.value.replace('@@@EXPORT_BUTTON@@@', exportButton);
    editItemList.value.forEach((item) => {
      editSlotList.push(generateFormItem(item, 'editMode'));
    });
    generateImportCode();
    generateToolbar();
    let pageHeader = '';
    if (pageState.title) {
      pageHeader = `<!--\n* @Description: ${pageState.title}\n-->`;
    }

    templateCode.value =
      pageHeader + PAGE_CONTAINER.replace('@@@QUERY_CONTAINER@@@', queryText.value);
    templateCode.value = templateCode.value.replace(
      '@@@toolbarButtonsText@@@',
      toolbarButtonsText.value,
    );
    templateCode.value = templateCode.value.replace('@@@vxeSlotText@@@', editSlotList.join('\n'));
    generateScript();
    optionVisible.value = false;
    handleHighLight();
  };

  /**
   * 高亮
   */
  const handleHighLight = () => {
    templateCodeElement.value.textContent = templateCode.value + '\n' + scriptText.value;
    hljs.highlightElement(templateCodeElement.value);
  };

  /**
   * 复制
   */
  const handleCopy = () => {
    copyText(templateCode.value + '\n' + scriptText.value);
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

<style lang="less">
  .option-wrapper {
    .ant-modal-body {
      padding: 0 12px;
    }
  }
</style>
