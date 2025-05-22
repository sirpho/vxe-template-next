import { VxeTablePropTypes } from 'vxe-table';
import { map, includes } from 'lodash-es';
import { config } from '../init';
import { GetErrorRows } from './typing';

export const useRowStyle = (fn: GetErrorRows): VxeTablePropTypes.RowStyle => {
  const { errorConfig, idField } = config;
  const { style } = errorConfig;
  return ({ row }): any => {
    const arrayOfErrorId = map(fn(), (c) => {
      return c[idField];
    });
    const isError = includes(arrayOfErrorId, row[idField]);
    return isError ? style : {};
  };
};
