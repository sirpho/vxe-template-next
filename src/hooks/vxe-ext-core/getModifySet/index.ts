import { reactive, Ref, toRaw } from 'vue';
import { includes } from 'lodash-es';
import { VxeInstance } from '../typing';
import { refsIsRequired } from '../utils';
import { config } from '../init';
import { UseGetModifySetOptions } from './typing';

export const useGetModifySet = (refs?: Ref<VxeInstance>) => {
  const { recordFields } = config;
  const {
    currentField,
    createdField,
    updatedField,
    removedField,
    fullField,
    visibleField,
    tableField,
    footerField,
  } = recordFields;

  const modifySet = reactive<any>({
    [currentField!]: null,
    [createdField!]: [],
    [updatedField!]: [],
    [removedField!]: [],
  });

  const getModifySet = (options: UseGetModifySetOptions = ['current', 'record']) => {
    refsIsRequired(refs, { message: 'useGetModifySet has useDefaultProps params.refs' });

    if (includes(options, 'current')) {
      modifySet[currentField!] = refs!.value.getCurrentRecord();
    }
    if (includes(options, 'radio')) {
      modifySet.radio = refs!.value.getRadioRecord();
    }
    if (includes(options, 'checkbox')) {
      modifySet.checkbox = refs!.value.getCheckboxRecords(true) as any[];
    }
    if (includes(options, 'record')) {
      const { insertRecords, removeRecords, updateRecords } = refs!.value.getRecordset();
      modifySet[createdField!] = insertRecords;
      modifySet[updatedField!] = updateRecords;
      modifySet[removedField!] = removeRecords;
    }
    if (includes(options, 'table')) {
      const { fullData, visibleData, tableData, footerData } = refs!.value.getTableData();
      modifySet[fullField!] = fullData;
      modifySet[visibleField!] = visibleData;
      modifySet[tableField!] = tableData;
      modifySet[footerField!] = footerData;
    }

    return toRaw(modifySet);
  };
  return { getModifySet };
};
