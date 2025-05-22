import { VxeTableDefines } from 'vxe-table';

export type SupportUpdateMethod = 'insert' | 'assign' | 'combine';
export type SheetValue = string | number;
export type Sheet = SheetValue[][];
export interface UpdateViaImportOptions {
  /**
   * @description 支持的更新方式
   * @param ['insert'] => 批量添加
   */
  updateMethod?: SupportUpdateMethod;
  /**
   * @description 文件是否有文件头
   */
  isSheetHasHeader?: boolean;
  /**
   * @description 手动设置Sheet的表头
   * 如果设置了表头 则会自动触发校验 与导入的文件头部是否一致
   */
  sheetHeader?: string[];
  /**
   * @description 是否手动定义导入文件对应的表格列字段名
   */
  useCustomFields?: boolean;
  /**
   * @description 自定义的导入文件对应的表格列
   */
  fields?: string[];
  /**
   * @description 是否自动触发校验
   */
  isValidateUpdated?: boolean;
  /**
   * @description 对导入的数据进行修改
   */
  beforeUpdate?: (data: Record<string, unknown>[]) => Promise<any[]>;
  /**
   * @description 校验失败回调
   */
  onValidateFailure?: (errMsg: VxeTableDefines.ValidatorErrorMapParams) => void;
  /**
   * @description 判断条件 根据表头
   * 如果useCustomFields = true则不会进行使用
   */
  predicateSheetHeaderFields?: string[];
  /**
   * @description 判断条件 根据自定义的表格field
   * 如果useCustomFields = true需要进行设置
   */
  predicateFields?: string[];
  /**
   * @description 修改的表头域
   */
  shouldUpdateSheetHeaderFields?: string[];
  /**
   * @description 修改的表头域
   * 如果useCustomFields = true需要进行设置
   */
  shouldUpdateFields?: string[];
  /**
   *
   * @param row 表行数据
   * @param data 更新的数据
   * @returns boolean
   * true 进行更新 false 放弃更新
   */
  shouldUpdateRow?: (row: any, data: any) => Promise<boolean>;
}
