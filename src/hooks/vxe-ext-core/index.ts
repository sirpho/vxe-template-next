import { reactive } from 'vue';
import { VxeTablePropTypes } from 'vxe-table';
import { useAsyncUpdateData } from './asyncUpdateData';
import { useErrorRows } from './error/useErrorRows';
import { useRowStyle } from './error/style';
import { useExportData } from './exportData';
import { useGetModifySet } from './getModifySet';
import { config } from './init';
import { useLoading } from './loading';
import { useReload } from './reload';
import { useSave } from './save';
import { updateData } from './updateData';
import type { UpdateViaImportOptions } from './updateData/typing';
import { UseDefaultPropsParams, VxeExtraProps } from './typing';

export function useDefaultProps(useDefaultPropsParams: UseDefaultPropsParams<any, any>) {
  const { vxeDefaultProps } = config;

  const { loading, setLoading } = useLoading();

  const {
    refs,
    // reload
    formState,
    request,
    params,
    isShouldCancelReload,
    onReloaded,
    onReloadLoadingChange,
    beforeSearchSubmit,
    transformData,
    // isSortable,
    // save
    save: _save,
    autoReloadAfterSave,
    shouldCancelSave,
    beforeSaveValidate,
    beforeSaveSubmit,
    onSaved,
    onSaveFailure,
    isShowErrorOnSaveFailure,
    ...other
  } = useDefaultPropsParams;

  // error rows
  const { setErrorRows, getErrorRows } = useErrorRows(refs);
  // reload
  const {
    loading: reloading,
    reload,
    reset,
    reloadData,
  } = useReload(
    {
      formState,
      params,
      request,
      isShouldCancelReload,
      onReloaded,
      onReloadLoadingChange: (value) => {
        setLoading(value);
        onReloadLoadingChange && onReloadLoadingChange(value);
      },
      beforeSearchSubmit,
      transformData,
      setErrorRows,
    },
    refs,
  );

  const { getModifySet } = useGetModifySet(refs);
  const { loading: saving, save } = useSave(
    {
      save: _save,
      autoReloadAfterSave,
      shouldCancelSave,
      beforeSaveValidate,
      beforeSaveSubmit,
      onSaved,
      onSaveFailure,
      setErrorRows,
      reload,
      isShowErrorOnSaveFailure,
      onLoadingChange: (value: boolean) => {
        setLoading(value);
      },
    },
    refs,
  );

  const { loading: asyncUpdateDataLoading, asyncUpdateData } = useAsyncUpdateData({
    onLoadingChange: (value: boolean) => {
      setLoading(value);
    },
  });

  const { exportData } = useExportData(refs);

  const rowStyle = useRowStyle(getErrorRows);

  return {
    vxeDefaultProps: reactive<any>({
      ...vxeDefaultProps,
      loading: loading,
      data: reloadData,
      rowStyle,
      ...other,
    }),
    vxeExtraProps: reactive<VxeExtraProps>({
      // reload
      reloading,
      // save
      saving,
      asyncUpdateDataLoading,
    }),
    vxeInstance: {
      setLoading,
      reload,
      reset,
      save,
      setErrorRows,
      getErrorRows,
      getModifySet,
      updateData: (data: any, options: UpdateViaImportOptions) => updateData(refs!, data, options),
      exportData: (exportConfig?: VxeTablePropTypes.ExportConfig) => exportData(exportConfig),
      asyncUpdateData,
    },
  };
}
