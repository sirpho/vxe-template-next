export const INSERT_BUTTON = `<Button type="link" size="small" @click="handleInsertLine">新增</Button>\n`;

export const REMOVE_BUTTON = `<Button type="link" size="small" @click="handleRemoveLine">删除</Button>\n`;
export const SAVE_BUTTON = `<Button :loading="vxeExtraProps.saving" size="small" type="link" @click="vxeInstance.save">保存</Button>`;

export const EXPORT_BUTTON = `<Button type="primary" size="small" @click="handleExport"> 导出 </Button>`;

export const EXPORT_FUNCTION = (name: string) => {
  return `
  /**
 * 导出方法
 */
function handleExport() {
  xTable.value.exportData({
    filename: '${name || '导出文件'}',
    columnFilterMethod: (params: any) => {
      return !!params.column.field;
    },
    type: 'xlsx',
  });
}`;
};

export const INSERT_FUNCTION = `
/**
 * 新增
 */
async function handleInsertLine() {
  // 新增行默认值
  const record = {};
  const { row: newRow } = await xTable.value.insertAt(record, null);
  await xTable.value.setEditRow(newRow);
}
`;

export const REMOVE_FUNCTION = `
/**
 * 删除
 */
const handleRemoveLine = () => {
  const checkRecord: any[] = xTable.value.getCheckboxRecords();
  if (checkRecord.length <= 0) {
    message.warning('请先选择要删除的行项目！');
    return;
  }
  Modal.confirm({
    title: '你确信要删除所选行项目吗?',
    onOk: async () => {
      xTable.value.remove(checkRecord);
    },
    onCancel: () => {
      Modal.destroyAll();
    },
  });
};
`;

export const QUERY_CONTAINER = `
          <QueryFilterContainer>
            <Form
              :model="formState"
              layout="inline"
              name="form"
              @finish="vxeInstance.reload"
            >@@@FORM_ITEM@@@
              <FormItem>
                <Space>
                  <Button
                    :loading="vxeDefaultProps.loading"
                    html-type="submit"
                    size="small"
                    type="primary"
                  >
                    查询
                  </Button>@@@EXPORT_BUTTON@@@
                </Space>
              </FormItem>
            </Form>
          </QueryFilterContainer>
`;

export const PAGE_CONTAINER = `
<template>
  <PageContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...vxeDefaultProps, ...gridOptions }" ref="xTable">
        <template #form>@@@QUERY_CONTAINER@@@
          <div class="bg-background-deep z-100 h-2 md:h-2"></div>
        </template>
        @@@toolbarButtonsText@@@
        @@@vxeSlotText@@@
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
`;
