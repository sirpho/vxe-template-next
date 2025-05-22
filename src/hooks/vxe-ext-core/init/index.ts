import { deepMerge } from '@/utils';
import { RowData, RowDataList, VxeProps } from '../typing';
import { ErrorConfig, RecordFields, RequestDataFields, SaveConfig } from './typing';

export type FindErrorBy = (rowData: RowData, rowDataList: RowDataList) => boolean;

export interface ReloadConfig {}

export interface InitConfig {
  idField: string;
  request: Partial<RequestDataFields>;
  findErrorBy: FindErrorBy;
  vxeDefaultProps: VxeProps;
  reloadConfig: ReloadConfig;
  errorConfig: Partial<ErrorConfig>;
  saveConfig: Partial<SaveConfig>;
  recordFields: Partial<RecordFields>;
}

const defaultInitConfig: InitConfig = {
  idField: 'id',
  request: {
    successField: 'success',
    dataField: 'data',
    messageField: 'message',
  },
  vxeDefaultProps: {
    height: 'auto',
    mouseConfig: {},
    keyboardConfig: {},
  },
  saveConfig: {
    transformResponseErrorData: (e) => e,
  },
  errorConfig: {
    dataField: '__message', // 对应返回字段的
    style: { backgroundColor: '#fff2f0' },
  },
  findErrorBy: (rowData: Record<string, any>, rowDataList: Record<string, any>[]) => {
    return rowDataList.some((row) => {
      return row.id === rowData.id;
    });
  },
  reloadConfig: {},
  recordFields: {
    currentField: 'current',
    radioField: 'radio',
    checkboxField: 'checkbox',
    createdField: 'created',
    updatedField: 'updated',
    removedField: 'removed',
    fullField: 'full',
    visibleField: 'visible',
    tableField: 'table',
    footerField: 'footer',
  },
};

class Config {
  idField: string;
  findErrorBy: FindErrorBy;
  vxeDefaultProps: VxeProps;
  reloadConfig: ReloadConfig;
  saveConfig: SaveConfig;
  errorConfig: ErrorConfig;
  recordFields: RecordFields;
  constructor(initConfig: InitConfig) {
    const {
      idField,
      findErrorBy,
      vxeDefaultProps,
      recordFields,
      reloadConfig,
      saveConfig,
      errorConfig,
    } = initConfig;
    this.idField = idField;
    this.findErrorBy = findErrorBy;
    this.vxeDefaultProps = vxeDefaultProps;
    this.reloadConfig = reloadConfig;
    this.saveConfig = saveConfig as SaveConfig;
    this.errorConfig = errorConfig as ErrorConfig;
    this.recordFields = recordFields as RecordFields;
  }

  async setup(config: Partial<InitConfig>) {
    const {
      idField,
      findErrorBy,
      vxeDefaultProps,
      recordFields,
      reloadConfig,
      saveConfig,
      errorConfig,
    } = deepMerge(defaultInitConfig, config);
    this.idField = idField;
    this.findErrorBy = findErrorBy;
    this.vxeDefaultProps = vxeDefaultProps;
    this.reloadConfig = reloadConfig;
    this.saveConfig = saveConfig as SaveConfig;
    this.errorConfig = errorConfig as ErrorConfig;
    this.recordFields = recordFields as RecordFields;
  }
}

export const config = new Config(defaultInitConfig);
