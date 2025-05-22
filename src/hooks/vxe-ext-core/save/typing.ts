import { UseDefaultPropsParams } from '../typing';
import { ErrorMethods } from '../error/typing';
import type { ReloadReactData } from '../reload/typing';

export interface SaveConfig {
  currentField?: string;
  radioField?: string;
  checkboxField?: string;
  createdField?: string;
  updatedField?: string;
  removedField?: string;
  fullField?: string;
  visibleField?: string;
  tableField?: string;
  footerField?: string;
}

export type SaveOptions = Pick<
  UseDefaultPropsParams<any, any>,
  | 'refs'
  | 'save'
  | 'autoReloadAfterSave'
  | 'shouldCancelSave'
  | 'beforeSaveSubmit'
  | 'onSaved'
  | 'onSaveFailure'
  | 'isShowErrorOnSaveFailure'
  | 'beforeSaveValidate'
> &
  Pick<ReloadReactData, 'reload'> &
  Pick<ErrorMethods, 'setErrorRows'> & { onLoadingChange?: (v: boolean) => void };
