import { Ref } from 'vue';
import { message } from 'ant-design-vue';
import to from 'await-to-js';
import {
  isEqual,
  isUndefined,
  trim,
  map,
  forEach,
  assign,
  pick,
  find,
  mapValues,
  toString,
} from 'lodash-es';
import { refsIsRequired, transformDataToTableData, getUpdateField } from '../utils';
import { UpdateViaImportOptions } from './typing';
import { VxeInstance } from '../typing';

export const updateData = async (
  refs: Ref<VxeInstance>,
  data: string[][],
  options?: UpdateViaImportOptions,
) => {
  const {
    updateMethod = 'insert',
    isSheetHasHeader = true,
    useCustomFields = false,
    sheetHeader: _sheetHeader,
    fields: _fields, // useCustomFields = true 使用的列标识
    isValidateUpdated = true,
    predicateSheetHeaderFields = [],
    predicateFields: _predicateFields, // useCustomFields = true 决定修改的表头判断条件
    shouldUpdateSheetHeaderFields,
    shouldUpdateFields, // useCustomFields = true 决定修改的表头判断条件
    beforeUpdate = async (data: Record<string, unknown>[]) => data as Record<string, any>[],
    shouldUpdateRow,
    onValidateFailure,
  } = options || {};

  refsIsRequired(refs, { message: 'updateData dependence useDefaultProps params.refs' });

  const { fullColumn } = refs.value.getTableColumn();

  // 实际导入的 sheetHeader
  const [sheetHeader, ...other] = data;

  let _trimSheetHeader: undefined | string[] = undefined;
  const trimSheetHeader: string[] = map(sheetHeader, trim);

  if (!isUndefined(_sheetHeader)) {
    _trimSheetHeader = map(_sheetHeader, trim);
  }

  /**
   * 如果设置了表头数据 则进行表头校验
   */
  if (!isUndefined(_trimSheetHeader) && !isEqual(_trimSheetHeader, trimSheetHeader)) {
    message.error('导入的表头有误，请检查');
    return false;
  }

  if (useCustomFields && isUndefined(_fields)) {
    throw Error('如果useCustomFields = true，请设置fields参数');
  }

  const fields = (useCustomFields ? _fields : getUpdateField(fullColumn, sheetHeader)) as string[];

  const sheetValidData = isSheetHasHeader ? other : data; // 有效的导入数据

  const asTableData = transformDataToTableData(sheetValidData, fields);

  /**
   * 参与更新的全量数据
   */
  const [err, updateDataList] = await to(beforeUpdate(asTableData));
  if (err) return;

  async function _insert(data: any[]) {
    await refs.value.insert(data);
    if (!isValidateUpdated) return asTableData;
    const errMsg = await refs.value.validate(true);
    if (errMsg) {
      onValidateFailure && onValidateFailure(errMsg);
    }
    return asTableData;
  }

  // 导入新增
  if (isEqual(updateMethod, 'insert')) {
    return await _insert(updateDataList);
  }

  function getPredicateAndUpdateInfo(useCustomFields = false): {
    predicateFields: string[]; //
    predicateData: any[]; // 标识数据集合
    shouldUpdateData: any[]; // 需要更新的数据集合
  } {
    // 标识列集合
    const predicateFields = useCustomFields
      ? _predicateFields
      : getUpdateField(fullColumn, predicateSheetHeaderFields);
    // 导入的数据
    const predicateData = map(updateDataList, (v) => pick(v, predicateFields!));
    let shouldUpdateData = updateDataList!;
    if (useCustomFields && !isUndefined(shouldUpdateFields)) {
      shouldUpdateData = map(shouldUpdateData, (v) => pick(v, shouldUpdateFields));
    }
    // useCustomFields为false 根据设定需要更新的表头进行字段选取
    if (!useCustomFields && !isUndefined(shouldUpdateSheetHeaderFields)) {
      const fields = getUpdateField(fullColumn, shouldUpdateSheetHeaderFields);
      shouldUpdateData = map(shouldUpdateData, (v) => pick(v, fields));
    }

    return {
      predicateFields: predicateFields!,
      predicateData,
      shouldUpdateData,
    };
  }

  // assign => 导入修改 combine => 混合模式
  if (isEqual(updateMethod, 'assign') || isEqual(updateMethod, 'combine')) {
    const isCombine = isEqual(updateMethod, 'combine');
    const { fullData } = refs!.value.getTableData();
    if (isEqual(updateMethod, 'assign') && (!fullData || !fullData.length)) {
      message.error('请先查询，后导入');
      return false;
    }

    if (useCustomFields && isUndefined(_predicateFields)) {
      throw Error('useCustomFields = true，修改请设置predicateFields表格列标识');
    }

    const { predicateData, predicateFields, shouldUpdateData } =
      getPredicateAndUpdateInfo(useCustomFields);

    forEach(predicateData, async function (value, index) {
      const findElement = find(fullData, function (v) {
        // 将数字以及字符串的空格去掉
        const mapAssignItem = mapValues(value, (o) => toString(trim(o)));
        const omitValue = pick(v, predicateFields);
        const mapFindItem = mapValues(omitValue, (o) => toString(trim(o)));
        return isEqual(mapAssignItem, mapFindItem);
      });
      if (findElement) {
        if (isUndefined(shouldUpdateRow)) {
          assign(findElement, shouldUpdateData[index]);
        } else if (await shouldUpdateRow(findElement, shouldUpdateData[index])) {
          assign(findElement, shouldUpdateData[index]);
        }
      } else {
        isCombine && _insert(updateDataList[index]);
      }
    });

    return asTableData;
  }
};
