import to from 'await-to-js';
import { isArray, isUndefined } from 'lodash-es';
import { isRef, ref, Ref, unref, watch } from 'vue';
import { useLoading } from '../loading';
import { RowData, VxeInstance } from '../typing';
import { ReloadParams, ReloadReactData } from './typing';

export const useReload = (reloadParams: ReloadParams, refs?: Ref<VxeInstance>): ReloadReactData => {
  const {
    request,
    transformData,
    beforeSearchSubmit,
    isShouldCancelReload,
    params,
    isResetWhenChangeParams = true,
    formState,
    onReloadLoadingChange,
    onReloaded,
    onReloadedFailure,
    setErrorRows,
  } = reloadParams;

  const { loading, setLoading } = useLoading();
  // const reloading = ref<boolean>(false);
  const reloadData = ref<Record<string, any>[]>([]);
  const reloadRawData = ref<any>({});

  const reload = async (data?: Record<string, any>) => {
    if (isUndefined(request)) {
      throw Error('vxeInstance.reload must has useDefaultProps params.request');
    }

    if (beforeSearchSubmit && typeof beforeSearchSubmit != 'function') {
      throw Error('vxeInstance.reload useDefaultProps params.beforeSearchSubmit must function');
    }

    if (typeof data === 'undefined' && typeof formState === 'undefined') {
      throw Error('vxeInstance.reload has params or useDefaultProps has params.formState');
    }

    if (!isUndefined(params) && !isRef(params)) {
      throw Error('useDefaultProps params must a Ref');
    }

    const _extData = isUndefined(params) ? {} : (unref(params) as Record<string, any>);

    // 获取参数 1 -> 参数传入 2 -> useDefaultProps params.formState 传入
    const _formState = !isUndefined(data)
      ? { ...data, ..._extData }
      : { ...formState, ..._extData };

    const isReload = isUndefined(isShouldCancelReload) ? false : isShouldCancelReload(_formState);

    if (isReload) return undefined;

    // 转换
    const _params = isUndefined(beforeSearchSubmit) ? _formState : beforeSearchSubmit(_formState);

    // reloading.value = true;
    setLoading(true);
    const [err, response] = await to(request(_params));

    if (refs) {
      setErrorRows([]);
    }

    if (err) {
      // reloading.value = false;
      setLoading(false);
      return undefined;
    }
    // reloading.value = false;
    setLoading(false);
    const { code, data: respData } = response;
    // // 这里逻辑可以根据项目进行修改
    if (code !== 200) {
      onReloadedFailure && onReloadedFailure(response);
      return response;
    }
    const _reloadData = isUndefined(transformData) ? respData : transformData(respData);
    reloadData.value = _reloadData;
    reloadRawData.value = respData;
    onReloaded && onReloaded({ data: _reloadData, respData });
    return response;
  };

  const reset = async (data?: RowData) => {
    if (isUndefined(data)) {
      reloadData.value = [];
      return;
    }
    if (!isArray(data)) {
      throw Error('reset data.reloadData must a array');
    }
    reloadData.value = data;
  };

  watch(
    () => reloadParams.params,
    async () => {
      if (isResetWhenChangeParams) {
        await reset();
      }
      reload();
    },
    { deep: true },
  );

  watch(loading, (value) => {
    onReloadLoadingChange && onReloadLoadingChange(value);
  });

  return { loading, reload, reset, reloadData, reloadRawData };
};
