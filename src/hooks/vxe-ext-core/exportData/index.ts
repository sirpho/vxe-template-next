import { message } from 'ant-design-vue';
import { Ref } from 'vue';

import { VxeTablePropTypes } from 'vxe-table';
import { VxeInstance } from '../typing';
import { refsIsRequired } from '../utils';

const key = '__EXPORT__MESSAGE__';

/**
 * @description 导出功能
 * @param refs Vxe Ref
 * @return exportConfig 导入配置
 */
export const useExportData = (
  refs?: Ref<VxeInstance>,
): { exportData: (exportConfig?: VxeTablePropTypes.ExportConfig) => Promise<any> } => {
  const exportData = async (exportConfig = {}) => {
    refsIsRequired(refs, { message: 'exportData has useDefaultProps params.refs' });
    const defaultExportConfig = {
      filename: '导出',
      sheetName: 'Sheet',
      type: 'xlsx',
      message: false,
      columnFilterMethod: ({ column }) => {
        return !['checkbox', 'radio'].includes(column.type);
      },
      afterExportMethod: () => {
        setTimeout(() => {
          message.success({ content: '导出成功', key, duration: 1 });
        }, 100);
      },
    };
    message.info({ content: '正在导出中', key, duration: 0 });
    setTimeout(async () => {
      await refs!.value.exportData({
        ...defaultExportConfig,
        ...exportConfig,
      });
    }, 300);
  };
  return { exportData };
};
