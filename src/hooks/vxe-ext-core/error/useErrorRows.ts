import { Ref, ref, watch, nextTick, toRaw } from 'vue';
import { VxeTableDefines, VxeGridPropTypes } from 'vxe-table';
import { refsIsRequired } from '../utils';
import { ERROR_RENDERER_NAME } from './render';
import { VxeInstance, RowDataList } from '../typing';
import { ErrorMethods } from './typing';

// import './errorRowsRender'; // 添加错误行全局渲染器
import { isUndefined } from 'lodash-es';

export const ERROR_COLUMN_FIELD = '__ERROR_COLUMN_FIELD_LaR2nUR7hI7M__';

export const genErrorColumnConfig = (errorRows: unknown[]): VxeGridPropTypes.Columns => {
  return [
    {
      title: '',
      field: ERROR_COLUMN_FIELD,
      width: 40,
      fixed: 'left',
      resizable: false,
      cellRender: { name: ERROR_RENDERER_NAME },
      params: errorRows,
    },
  ];
};

async function noop() {
  console.warn('setErrorRows or validateRows require useDefaultProps have params.refs');
}

export const useErrorRows = (
  refs?: Ref<VxeInstance>,
): ErrorMethods & { errorRows: Ref<RowDataList> } => {
  const errorRows = ref<RowDataList>([]);

  const setErrorRows = async (rows: RowDataList): Promise<Record<string, any>[]> => {
    refsIsRequired(refs, { message: 'setErrorRows require useDefaultProps have params.refs' });

    if (!rows.length && !getErrorRows().length) {
      return rows;
    }
    errorRows.value = rows;
    return rows;
  };

  /**
   * validate rows
   * @param rows 用作render的参数 (params)
   * @returns
   */
  const validateRows = async (rows: RowDataList) => {
    refsIsRequired(refs, { message: 'validateRows require useDefaultProps have params.refs' });

    const $table = refs!.value;
    const { collectColumn: columns } = $table.getTableColumn();
    // 是否存在错误列
    const errorColumn = $table.getColumnByField(ERROR_COLUMN_FIELD);
    // 最终生成列
    const validColumns: VxeTableDefines.ColumnInfo[] =
      errorColumn === null ? columns : columns.slice(1);
    // console.log(errorColumn, !rows.length);
    if (!rows.length) {
      $table.reloadColumn(validColumns);
      $table.refreshColumn();
      return;
    }
    $table.reloadColumn([...genErrorColumnConfig(rows), ...validColumns]);
    $table.refreshColumn();
    return rows;
  };

  const getErrorRows = (): any => {
    return toRaw(errorRows.value);
  };

  watch(errorRows, (value) => {
    nextTick(() => {
      validateRows(value);
    });
  });

  return {
    errorRows,
    setErrorRows: isUndefined(refs) ? noop : setErrorRows,
    getErrorRows,
  };
};
