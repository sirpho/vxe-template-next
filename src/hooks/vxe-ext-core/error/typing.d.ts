import { RowDataList } from '../typing.js';

export type SetErrorRows = (rows: RowDataList) => Promise<RowDataList | void>;
export type GetErrorRows = () => RowDataList;
export type ErrorMethods = {
  setErrorRows: SetErrorRows;
  getErrorRows: GetErrorRows;
};
