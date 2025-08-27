<template>
  <PageContainer>
    <VxeContainer direction="column">
      <div class="wrapper">
        <Divider>JAVA类定义</Divider>
        <Form layout="inline">
          <FormItem label="额外宽度">
            <InputNumber v-model:value="extraWidth" size="small" />
          </FormItem>
          <FormItem label="模式">
            <Select size="small" v-model:value="pageState.mode" style="width: 100px">
              <Select.Option value="WMS">WMS</Select.Option>
              <Select.Option value="TMS">TMS</Select.Option>
            </Select>
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
        <Tabs v-model:activeKey="tabActivity">
          <TabPane v-for="item in regularList" :key="item.key" :tab="item.key">
            <p>
              <Button type="link" @click="() => handleCopyContent(item.A)">{{ item.A }}</Button>
            </p>
            <p>
              <Button type="link" @click="() => handleCopyContent(item.B)">{{ item.B }}</Button>
            </p>
          </TabPane>
        </Tabs>
      </div>
    </VxeContainer>
    <StatusPop
      title="表格字段预览"
      v-model:visible="logVisible"
      :columns="columns"
      :request="requestQuery"
    />

    <Modal
      title="页面选项"
      v-model:open="optionVisible"
      width="850px"
      wrapClassName="option-wrapper"
      @ok="() => handleConfirm()"
    >
      <vxe-grid
        :columns="optionColumns"
        :checkbox-config="{ checkAll: true }"
        :data="optionTableList"
        auto-resize
        height="400"
        ref="modalTable"
      >
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
        <!-- 字段名称 -->
        <template #title="{ row }">
          <Input v-model:value="row.title" size="small" />
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
            <Select.Option value="combox">combox</Select.Option>
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
            <Select.Option value="combox">combox</Select.Option>
          </Select>
          <span v-else>--</span>
        </template>
        <!-- 带出描述 -->
        <template #withFunction="{ row }">
          <Checkbox v-if="row.editMode === 'combox'" v-model:checked="row.withFunction" />
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
    message,
    Tabs,
    TabPane,
  } from 'ant-design-vue';
  import { nextTick, reactive, ref } from 'vue';
  import hljs from 'highlight.js/lib/core';
  import { copyText } from '@/utils/copyTextToClipboard';
  import { StatusPop } from '@/components/status-pop';
  import { PageContainer, VxeContainer } from '@/components/Layout';
  import { VxeGridPropTypes, VxeTableInstance } from 'vxe-table';
  import { createLocalStorage } from '@/utils/cache';

  import {
    capitalizeFirstLetter,
    EXPORT_BUTTON,
    EXPORT_FUNCTION,
    getComboxComponentName,
    getDescription,
    INSERT_BUTTON,
    INSERT_FUNCTION,
    PAGE_CONTAINER_TMS,
    PAGE_CONTAINER_WMS,
    QUERY_CONTAINER,
    REMOVE_BUTTON,
    REMOVE_FUNCTION,
    SAVE_BUTTON,
    TOOLBAR_END,
    TOOLBAR_START,
  } from './service';
  import { FORMAT_JAVA_CLASS } from '@/enums/cacheEnum';
  import { cloneDeep } from 'lodash-es';

  const ls = createLocalStorage();
  const javaCode = ref(ls.get(FORMAT_JAVA_CLASS));
  const columns = ref<any[]>([]);
  const templateCode = ref('');
  const templateCodeElement = ref();
  const extraWidth = ref(10);
  const logVisible = ref(false);
  const optionVisible = ref(false);
  const modalTable = ref({} as VxeTableInstance);
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
  const checkboxFieldList = ref<any[]>([]);
  // 函数脚本
  const functionList = ref<any[]>([]);
  const optionColumns = ref<VxeGridPropTypes.Columns>([
    { type: 'checkbox', width: 60, fixed: 'left', align: 'center' },
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
      filters: [{}],
      filterRender: { name: 'FilterExtend' },
      slots: { default: 'title' },
      width: 120,
    },
    {
      field: 'isSearch',
      title: '查询项',
      cellType: 'string',
      slots: { default: 'isSearch' },
      width: 80,
    },
    {
      field: 'searchMode',
      title: '查询类型',
      cellType: 'string',
      sortable: true,
      slots: { default: 'searchMode' },
      width: 120,
    },
    {
      field: 'isEdit',
      title: '编辑项',
      cellType: 'string',
      slots: { default: 'isEdit' },
      width: 80,
    },
    {
      field: 'editMode',
      title: '编辑类型',
      cellType: 'string',
      sortable: true,
      slots: { default: 'editMode' },
      width: 120,
    },
    {
      field: 'withFunction',
      title: '带出描述',
      cellType: 'string',
      slots: { default: 'withFunction' },
      width: 100,
    },
  ]);

  const tabActivity = ref('filterRender正则');
  // 正则
  const regularList = ref([
    {
      key: 'filterRender正则',
      A: "(filterRender:\\s*\\{)(\\s+)(name:\\s*'FilterExtend',)(\\s+)(\\})",
      B: "filterRender: { name: 'FilterExtend' }",
    },
    {
      key: 'editRender正则',
      A: "editRender:\\s*\\{\\s+(autofocus:\\s*'.*'),\\s+\\}",
      B: 'editRender: { $1 }',
    },
    {
      key: 'slots正则',
      A: "slots:\\s*\\{\\s+(edit:\\s*'.*'),\\s+\\}",
      B: 'slots: { $1 }',
    },
  ]);

  const pageState = reactive<{
    allowCheckbox: boolean;
    allowInsert: boolean;
    allowRemove: boolean;
    allowExport: boolean;
    title: string;
    mode: 'TMS' | 'WMS';
  }>({
    allowCheckbox: true,
    allowInsert: true,
    allowRemove: true,
    allowExport: true,
    mode: 'WMS',
    title: '',
  });

  const importSet = new Set<String>();
  const antDesignVueSet = new Set<String>();
  const comboxSet = new Set<String>();
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
   * 获取汉字数量
   * @param str
   */
  const countChineseCharacters = (str) => {
    // 匹配所有汉字的正则表达式
    const chineseRegex = /[\u4e00-\u9fa5]/g;

    // 执行匹配
    const matches = str.match(chineseRegex);

    // 如果有匹配结果则返回数量，否则返回0
    return matches ? matches.length : 0;
  };

  /**
   * 开始转换，提取列表字段
   */
  const handleFormatter = async () => {
    ls.set(FORMAT_JAVA_CLASS, javaCode.value);
    functionList.value = [];
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

      // 构建配置项
      result.push({
        field: fieldName,
        title: title,
        editRender: { autofocus: '.ant-input' },
        slots: { edit: fieldName },
        sortable: true,
        filters: [{}],
        filterRender: { name: 'FilterExtend' },
        minWidth: 100,
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
      withFunction: false,
      editMode: getDefaultMode(item),
    }));
    optionVisible.value = true;
    await nextTick();
    await modalTable.value.setAllCheckboxRow(true);
  };

  /**
   * 生成编辑框
   * @param item 行项目
   * @param mode searchMode：生成查询栏  editMode：生成vxe编辑插槽
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
          ${mode === 'editMode' ? ':getPopupContainer="(trigger: any) => trigger.parentElement as HTMLElement"' : ''}
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
        importSet.add(`import dayjs, { Dayjs } from 'dayjs';`);
        if (pageState.mode === 'TMS') {
          importSet.add(`import { timeRangeHandler } from '#/utils/dayjs';`);
        } else {
          importSet.add(`import { timeRangeHandler } from '/@/utils/dayjs';`);
        }
        break;
      case 'combox':
        const componentName = getComboxComponentName(item, pageState.mode);
        let functionAttr = '';
        if (mode === 'editMode' && item.withFunction) {
          const pureField = item.field.replace(/Code$/, '').replace(/Id$/, '');
          functionAttr = `@change='(option: any) => handleChange${capitalizeFirstLetter(pureField)}(row, option)'`;
          functionList.value.push(`
            /**
             * 修改${item.title}
             */
            const handleChange${capitalizeFirstLetter(pureField)} = (row: any, option: any) => {
              row.${pureField}Name = option?.${pureField}Name;
            };
          `);
        }

        comboxSet.add(componentName);
        result.push(`
        <${componentName} v-model:value="${recordText}.${item.field}" ${functionAttr} />
        `);
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
    if (pageState.mode === 'TMS') {
      importSet.add(
        `import { list${allowEdit.value || pageState.allowRemove ? ', saveEntity' : ''} } from './server';`,
      );
    } else {
      importSet.add(
        `import { list${allowEdit.value || pageState.allowRemove ? ', saveEntity' : ''} } from './service';`,
      );
    }
    if (pageState.allowRemove) {
      antDesignVueSet.add('message');
      antDesignVueSet.add('Modal');
    }
    importSet.add(
      `import { ${Array.from(antDesignVueSet).sort().join(', ')} } from 'ant-design-vue';`,
    );
    if (comboxSet.size > 0) {
      const comboxImport = Array.from(comboxSet).sort().join(', ');
      let controls = '';
      if (pageState.mode === 'WMS') {
        controls = '/@/views/wms-controls';
      }
      if (pageState.mode === 'TMS') {
        controls = '#/features/components/Profession';
      }

      importSet.add(`import { ${comboxImport} } from '${controls}';`);
    }
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
      toolbarButtonsText.value = TOOLBAR_START;
      if (pageState.allowInsert) {
        toolbarButtonsText.value += INSERT_BUTTON;
      }
      if (pageState.allowRemove) {
        toolbarButtonsText.value += REMOVE_BUTTON;
      }
      toolbarButtonsText.value += SAVE_BUTTON;
      toolbarButtonsText.value += TOOLBAR_END;
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
      if (['year', 'month', 'date', 'combox'].includes(item.searchMode)) {
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
      validRulesText.push(`/**`, `* 校验`, `*/`, 'const validRules = ref({');
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
    const resultColumns = columns.value.filter(
      (item) => checkboxFieldList.value.includes(item.field) || item.type === 'checkbox',
    );
    const columnList = cloneDeep(resultColumns);

    for (const item of columnList) {
      // 设置宽度
      if (!!item.title) {
        // 基础30，排序20，筛选20
        let width = 30 + 20 + 20;
        const titleLength = item.title.length;
        const chineseCount = countChineseCharacters(item.title);
        const englishCount = Math.floor((titleLength - chineseCount) / 2) * 2;
        // 一个汉字10，英文5
        width += chineseCount * 10 + englishCount * 5;
        if (editItemList.value.some((ite) => ite.field === item.field)) {
          // 可编辑20，必填标记20
          width += 20 + 20;
        }
        if (
          item.title.includes('名称') ||
          item.title.includes('地址') ||
          item.title.includes('备注')
        ) {
          width += 40;
        }

        item.minWidth = width + extraWidth.value;
      }
      const editItem = editItemList.value.find((ite) => ite.field === item.field);
      if (editItem) {
        if (editItem.editMode === 'number') {
          item.editRender = { autofocus: '.ant-input-number-input' };
        }
        if (['date', 'year', 'month', 'rangeDate'].includes(editItem.editMode)) {
          item.editRender = { autofocus: '.ant-picker-input input' };
        }
        if (['combox'].includes(editItem.editMode)) {
          item.editRender = { autofocus: '.ant-select-selection-search-input' };
        }
      } else {
        delete item.editRender;
        delete item.slots;
      }
    }

    const columnsText = JSON.stringify(columnList, null, 2);
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

      if (pageState.mode === 'WMS') {
        vxeDefaultPropsText.push('beforeSaveSubmit: ({ created, updated, removed }) => {');
        vxeDefaultPropsText.push(
          'return { deleteList: removed, insertList: created, updateList: updated };',
        );
        vxeDefaultPropsText.push('},');
      }
    }
    const rangeDateList = searchItemList.value.filter((item) => item.searchMode === 'rangeDate');
    if (rangeDateList.length > 0) {
      vxeDefaultPropsText.push(`beforeSearchSubmit: (params: FormState) => {`);
      const fieldList: string[] = rangeDateList.map((item) => item.field);
      vxeDefaultPropsText.push(`const { ${fieldList.join(', ')}, ...other } = params;`);
      const rangeFieldList: string[] = [];
      fieldList.forEach((item) => {
        vxeDefaultPropsText.push(
          `const [${item}Start, ${item}End] = timeRangeHandler(${item}, { format: 'YYYY-MM-DD', });`,
        );
        rangeFieldList.push(`${item}Start`);
        rangeFieldList.push(`${item}End`);
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
      ...functionList.value,
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
    const checkboxRecords = modalTable.value.getCheckboxRecords();
    if (checkboxRecords.length <= 0) {
      message.warning('请先选择行项目！');
      return;
    }
    checkboxFieldList.value = checkboxRecords.map((item) => item.field);
    searchItemList.value = checkboxRecords.filter((item) => item.isSearch);
    editItemList.value = checkboxRecords.filter((item) => item.isEdit);
    allowEdit.value = pageState.allowInsert || editItemList.value.length > 0;

    const searchFormItemList: string[] = [];
    const editSlotList: string[] = [];
    if (editItemList.value.length > 0) {
      editSlotList.push('<!-- 可编辑列 -->');
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
    // 生成import部分
    generateImportCode();
    // 生成表格操作部分
    generateToolbar();
    let pageHeader = '';
    if (pageState.title) {
      pageHeader = getDescription(pageState.title);
    }
    const pageContent = pageState.mode === 'TMS' ? PAGE_CONTAINER_TMS : PAGE_CONTAINER_WMS;

    templateCode.value = pageHeader + pageContent.replace('@@@QUERY_CONTAINER@@@', queryText.value);
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
   * 复制
   */
  const handleCopyContent = (content: string) => {
    copyText(content);
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
