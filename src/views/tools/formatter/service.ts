export const INSERT_BUTTON = `<Button type="link" size="small" @click="handleInsertLine">新增</Button>\n`;

export const IMPORT_BUTTON = `<UploadModal
              :templates="[
                {
                  url: 'https://www.xxx.com/导入模板.xlsx',
                },
              ]"
              @on-uploaded="uploaded"
              v-slot="{ show }"
            >
              <Button type="link" size="small" @click="show"> 导入</Button>
            </UploadModal>\n`;

export const REMOVE_BUTTON = `<Button type="link" size="small" @click="handleRemoveLine">删除</Button>\n`;
export const AUDIT_BUTTON = `<Button type="link" size="small" @click="handleAuditPass"> 审核通过 </Button>\n<Button type="link" size="small" @click="handleAuditReject"> 审核不通过 </Button>\n`;

export const SAVE_BUTTON = `<Button :loading="vxeExtraProps.saving" size="small" type="link" @click="vxeInstance.save">保存</Button>`;

export const EXPORT_BUTTON = `<Button type="primary" size="small" @click="handleExport"> 导出 </Button>`;

export const TOOLBAR_START = `
            <!-- 表格操作 -->
            <template #toolbar_buttons>
              <Space>
`;
export const TOOLBAR_END = `
              </Space>
        </template>`;

export const EXPORT_FUNCTION = (name: string) => {
  return `
  /**
 * 导出方法
 */
const handleExport = () => {
  xTable.value.exportData({
    filename: '${name || '导出文件'}',
    columnFilterMethod: (params: any) => {
      return !!params.column.field;
    },
    type: 'xlsx',
  });
}`;
};

export const getDescription = (title: string) => {
  return `<!--\n* @Description: ${title}\n-->`;
};

export const AUDIT_TEMPLATE = `
    <Modal
      v-model:visible="auditVisible"
      title="审核不通过"
      :destroy-on-close="true"
      :confirmLoading="rejectLoading"
      @ok="handleAuditConfirm"
    >
      <Form :model="auditModalState" ref="auditForm" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
        <FormItem label="不通过原因" name="remark" :rules="[{ required: true, message: '必填项' }]">
          <Input v-model:value="auditModalState.remark" />
        </FormItem>
      </Form>
    </Modal>
`;

export const AUDIT_CONST = `
  // 审核通过加载状态
  const auditLoading = ref(false);
  `;

export const INSERT_FUNCTION = `
/**
 * 新增
 */
const handleInsertLine = async () => {
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
  const checkboxRecords: any[] = xTable.value.getCheckboxRecords();
  if (checkboxRecords.length <= 0) {
    message.warning('请先选择要删除的行项目！');
    return;
  }
  Modal.confirm({
    title: '你确信要删除所选行项目吗?',
    onOk: async () => {
      xTable.value.remove(checkboxRecords);
    },
    onCancel: () => {
      Modal.destroyAll();
    },
  });
};
`;

export const IMPORT_FUNCTION = `
  /**
   * 导入回调
   */
  const uploaded = async (sheet: any) => {
    await vxeInstance.updateData(sheet, {
      beforeUpdate: async (data) => {
        if (!data.length) return [];

        return data;
      },
    });
  };
`;

export const AUDIT_FUNCTION = `
  /**
   * 审核通过
   */
  const handleAuditPass = async () => {
    const checkboxRecords = xTable.value.getCheckboxRecords();
    if (!checkboxRecords.length) {
      message.warning('请先选择行项目！');
      return;
    }
    if (checkboxRecords.some((item: any) => item.status !== '已提交')) {
      message.warning('仅【已提交】状态可审核通过！');
      return;
    }
    auditLoading.value = true;
    const [err, _res] = await to(auditPass({
        list: checkboxRecords,
      }));
    auditLoading.value = false;
    if (err) {
      return;
    }
    message.success('操作成功');
    await vxeInstance.reload();
  };
`;

/**
 * 审批拒绝WMS
 */
export const AUDIT_REJECT_FUNCTION_WMS = `
  /**
   * 审核拒绝，打开审核弹框
   */
  const handleAuditReject = async () => {
    const checkboxRecords = xTable.value.getCheckboxRecords();
    if (!checkboxRecords.length) {
      message.warning('请先选择行项目！');
      return;
    }
    if (checkboxRecords.some((item: any) => item.status !== '已提交')) {
      message.warning('仅【已提交】状态可审核通过！');
      return;
    }

      const [registerForm, { validate }] = useForm({
        layout: 'vertical',
        size: 'small',
        showActionButtonGroup: false,
        schemas: [{
                    field: 'reason',
                    label: '不通过原因',
                    colProps: {
                      span: 24,
                    },
                    component: 'InputTextArea',
                    componentProps: {
                      autoSize: { minRows: 2, maxRows: 4 },
                    },
                    required: true,
                  }],
      });

      Modal.confirm({
        zIndex: 1099,
        title: '审核不通过',
        content: h(BasicForm, {
            onRegister: registerForm,
          }),
        width: 650,
        okText: '提交',
        cancelText: '取消',
        onOk: async () => {
          const result = await validate();
          await auditNotPass({
          ...result,
          list: checkboxRecords,
          });
          message.success('操作成功');
          await vxeInstance.reload();
        },
        onCancel: () => {},
      });
      
  };
`;

/**
 * 审批拒绝TMS
 */
export const AUDIT_REJECT_FUNCTION_TMS = `
  /**
   * 审核拒绝，打开审核弹框
   */
  const handleAuditReject = async () => {
    const checkboxRecords = xTable.value.getCheckboxRecords();
    if (!checkboxRecords.length) {
      message.warning('请先选择行项目！');
      return;
    }
    if (checkboxRecords.some((item: any) => item.status !== '已提交')) {
      message.warning('仅【已提交】状态可审核通过！');
      return;
    }

      const [BasicForm, { validate, getValues }] = useVbenForm(
        reactive({
          commonConfig: {
              labelWidth: 80,
          },
          schema: [{
                    fieldName: 'reason',
                    label: '不通过原因',
                    colProps: {
                      span: 24,
                    },
                    component: InputTextArea,
                    componentProps: {
                      autoSize: { minRows: 2, maxRows: 4 },
                    },
                    rules: z.string().min(1, '必填项'),
                  }],
          showDefaultActions: false,
        }),
      )

      Modal.confirm({
        zIndex: 1099,
        title: '审核不通过',
        content: h(BasicForm),
        width: 650,
        okText: '提交',
        cancelText: '取消',
        onOk: async () => {
          const { valid } = await validate();
          const values = await getValues();
          if(valid) {
            await auditNotPass({
              ...values,
              list: checkboxRecords,
            });
            message.success('操作成功');
            await vxeInstance.reload();
          } else {
            throw new Error('校验失败');
          }
        },
        onCancel: () => {},
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
            >
            @@@FORM_ITEM@@@
              <FormItem>
                <Space>
                  <Button
                    :loading="vxeDefaultProps.loading"
                    html-type="submit"
                    size="small"
                    type="primary"
                  >
                    查询
                  </Button>
                  @@@EXPORT_BUTTON@@@
                </Space>
              </FormItem>
            </Form>
          </QueryFilterContainer>
`;

export const PAGE_CONTAINER_WMS = `
<template>
  <PageContainer>
    @@@QUERY_CONTAINER@@@
    <VxeContainer>
      <vxe-grid v-bind="{ ...vxeDefaultProps, ...gridOptions }" ref="xTable">
        @@@toolbarButtonsText@@@
        @@@vxeSlotText@@@
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
`;

export const PAGE_CONTAINER_TMS = `
<template>
  <PageContainer>
    <VxeContainer>
      <vxe-grid v-bind="{ ...vxeDefaultProps, ...gridOptions }" ref="xTable">
        <template #form>
        @@@QUERY_CONTAINER@@@
          <div class="bg-background-deep z-100 h-2 md:h-2"></div>
        </template>
        @@@toolbarButtonsText@@@
        @@@vxeSlotText@@@
      </vxe-grid>
    </VxeContainer>
  </PageContainer>
</template>
`;

/**
 * 首字母大写
 * @param str
 */
export function capitalizeFirstLetter(str: string) {
  // 处理空字符串或null/undefined
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 获取combox组件名称
 */
export const getComboxComponentName = (item: any, mode: 'TMS' | 'WMS') => {
  if (mode === 'WMS') {
    if (item.title?.includes('承运商')) {
      return 'CarrierCombox';
    }
    if (item.title?.includes('基地')) {
      return 'UserBase';
    }
    if (item.title?.includes('工厂')) {
      return 'UserWerks';
    }
    if (item.title?.includes('库存地点')) {
      return 'UserWarehouse';
    }
    if (item.title?.includes('物料类型')) {
      return 'MaterialType';
    }
    if (item.title?.includes('物料')) {
      return 'MaterialModal';
    }
  }
  if (mode === 'TMS') {
    if (item.title?.includes('物料')) {
      return 'Material';
    }
    if (item.title?.includes('供应商')) {
      return 'Supplier';
    }
    if (item.title?.includes('承运商')) {
      return 'Carrier';
    }
    if (item.title?.includes('工厂')) {
      return 'Factory';
    }
  }

  return capitalizeFirstLetter(item.field) + 'Combox';
};

/**
 * 组件名
 */
export const getDefaultName = (name: string) => `

<script lang="ts">
  export default {
    name: "${name}",
  };
</script>
`;
