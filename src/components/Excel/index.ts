import { withInstall } from '@/utils';
import importExcel from './src/ImportExcel.vue';
import expExcelModal from './src/ExportExcelModal.vue';

export const ImportExcel = withInstall(importExcel);
export const ExpExcelModal = withInstall(expExcelModal);
export * from './src/typing';
export { jsonToSheetXlsx, aoaToSheetXlsx } from './src/Export2Excel';
