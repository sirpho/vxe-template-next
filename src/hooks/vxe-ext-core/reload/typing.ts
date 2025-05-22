import { Ref } from 'vue';
import type { UseDefaultPropsParams, RequestData, RowData } from '../typing';
import type { SetErrorRows } from '../error/typing';

export type ReloadParams = Pick<
  UseDefaultPropsParams<any, any>,
  | 'refs'
  | 'formState'
  | 'request'
  | 'params'
  | 'isResetWhenChangeParams'
  | 'isShouldCancelReload'
  | 'onReloaded'
  | 'onReloadedFailure'
  | 'onReloadLoadingChange'
  | 'beforeSearchSubmit'
  | 'transformData'
> & { setErrorRows: SetErrorRows };

export type ReloadReactData = {
  loading: Ref<boolean>;
  reload: (data?: Record<string, any>) => Promise<Partial<RequestData<any>> | undefined>;
  reset: (data?: RowData) => void;
  reloadData: Ref<Record<string, any>[]>;
  reloadRawData: any;
};
