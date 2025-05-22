import {
  VxeTableProps,
  VxeGridProps,
  VxeTableInstance,
  VxeGridInstance,
  TableValidatorMethods,
} from 'vxe-table';
import { Ref, UnwrapNestedRefs } from 'vue';

export type VxeProps = VxeTableProps | VxeGridProps;
export type VxeInstance = VxeTableInstance | VxeGridInstance;
export type RequestData<T> = {
  data: T | undefined;
  success?: boolean;
} & Record<string, any>;
export type RowData = Record<string, any>;
export type RowDataList = Record<string, any>[];

export type UseDefaultPropsParams<T, U> = VxeProps & {
  /**
   * vxe table instance | vxe grid instance
   */
  refs?: Ref<VxeInstance>;
  /**
   * @description 搜索参数对应表单Form的参数
   */
  formState?: UnwrapNestedRefs<any>;
  /**
   * @description 一个获取 data 的方法
   */
  request?: (params: U) => Promise<Partial<RequestData<T>>>;
  /**
   * @description 用于 request 查询的额外参数，一旦变化会触发重新加载
   */
  params?: Ref<Record<string, any>>;
  /**
   * @description 额外参数(params)发生变化是否立即清除表格数据
   */
  isResetWhenChangeParams?: boolean;
  /**
   * @description 用于是否取消 Reload
   */
  isShouldCancelReload?: (data?: any) => boolean;
  /**
   * @description 数据加载完成触发
   */
  onReloaded?: (data: { data: any[]; respData: any }) => void;
  /**
   * @description loading 被修改时触发，一般是网络请求导致的
   */
  onReloadLoadingChange?: (reloading: boolean) => void;
  /**
   * @description 数据加载失败触发
   */
  onReloadedFailure?: (response: any) => void;
  /**
   * @description 搜索之前进行一些修改
   */
  beforeSearchSubmit?: (params: any) => any;
  /**
   * @description reload 之后进行一些修改（主要用于获取做正确的返回 data）
   * @example (data) => data.list
   */
  transformData?: (params: any) => Record<string, any>[];
  // /**
  //  * @description 是否支持拖拽
  //  */
  // isSortable?: boolean;
  /**
   * @description 用于保存的方法
   */
  save?: (params: U) => Promise<Partial<RequestData<T>>> | undefined;
  /**
   * @description 是否在保存之后自动进行一次 reload 方法
   */
  autoReloadAfterSave?: boolean;
  /**
   * @description 是否取消Save请求发出
   */
  shouldCancelSave?: (data: any) => boolean;
  /**
   * @description 保存之前进行一些修改
   */
  beforeSaveValidate?: TableValidatorMethods['validate'];
  /**
   * @description 保存之前进行一些修改
   */
  beforeSaveSubmit?: (params: any) => any;
  /**
   * @description 保存成功后触发，会多次触发
   */
  onSaved?: (data?: any[]) => void;
  /**
   * @description 保存失败后触发，会多次触发
   */
  onSaveFailure?: (data: any) => void;
  /**
   * @description 保存失败后是否自动触发行错误校验
   */
  isShowErrorOnSaveFailure?: boolean;
};
export interface VxeExtraProps {
  saving: Ref<boolean>;
  asyncUpdateDataLoading: Ref<boolean>;
  reloading: Ref<boolean>;
}
