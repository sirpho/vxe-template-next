import { message } from 'ant-design-vue';
import to from 'await-to-js';
import { compact, concat, isUndefined } from 'lodash-es';
import { nextTick, Ref, watch } from 'vue';
import { VxeTableDefines } from 'vxe-table';
import { useGetModifySet } from '../getModifySet';
import { config } from '../init';
import { useLoading } from '../loading';
import type { VxeInstance } from '../typing';
import { refsIsRequired } from '../utils';
import type { SaveOptions } from './typing';

const defaultShouldCancelSave = (data: any[]): boolean => {
  if (!data.length) {
    message.warning('暂无修改数据');
    return true;
  }
  return false;
};

export const useSave = (saveOptions: SaveOptions, refs?: Ref<VxeInstance>) => {
  // const saving = ref<boolean>(false);
  const { loading, setLoading } = useLoading();
  const { recordFields, saveConfig } = config;
  const { createdField, updatedField, removedField } = recordFields;
  const { transformResponseErrorData } = saveConfig;
  const {
    save: _save,
    autoReloadAfterSave = true,
    shouldCancelSave = defaultShouldCancelSave,
    beforeSaveValidate,
    beforeSaveSubmit = (e) => e,
    reload,
    onSaved,
    isShowErrorOnSaveFailure = true,
    onSaveFailure,
    setErrorRows,
    onLoadingChange,
  } = saveOptions;

  const save = async () => {
    refsIsRequired(refs, { message: 'save useDefaultProps must has params.refs' });
    if (!_save) {
      throw Error('vxeInstance.save useDefaultProps must has params.save');
    }
    const $table = refs!.value;
    let errMap = false as unknown as VxeTableDefines.ValidatorErrorMapParams;
    if (!isUndefined(beforeSaveValidate)) {
      errMap = await beforeSaveValidate();
    } else {
      errMap = await $table.validate(true);
    }
    if (errMap) {
      message.error('校验不通过，请检查');
      return;
    }
    const { getModifySet } = useGetModifySet(refs);
    const modifySet = getModifySet();
    const array = compact(
      concat(modifySet[createdField], modifySet[updatedField], modifySet[removedField]),
    );
    const isShouldCancelSave = shouldCancelSave(array);
    if (isShouldCancelSave) return;
    const saveParams = beforeSaveSubmit(modifySet) as Record<string, any>;
    // saving.value = true;
    setLoading(true);
    const [err, resp] = await to(_save(saveParams)!);
    if (err) {
      // saving.value = false;
      setLoading(false);
      onSaveFailure && onSaveFailure(resp);
      return;
    }
    const { success, data } = resp as any;
    if (success) {
      message.success('操作成功');
      onSaved && onSaved(data);
    }
    if (success && autoReloadAfterSave) {
      nextTick(async () => {
        reload && (await reload());
        // saving.value = false;
        setLoading(false);
      });
      return;
    }
    // saving.value = false;
    setLoading(false);
    if (!success) {
      if (isShowErrorOnSaveFailure) {
        setErrorRows && setErrorRows(transformResponseErrorData(data));
      }
      onSaveFailure && onSaveFailure(resp);
      return;
    }
  };

  watch(loading, (value) => {
    onLoadingChange && onLoadingChange(value);
  });

  return { save, loading };
};
