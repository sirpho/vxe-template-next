import VXETable from 'vxe-table';

import VXETablePluginExportXLSX from 'vxe-table-plugin-export-xlsx';
import ExcelJS from 'exceljs';

VXETable.use(VXETablePluginExportXLSX, { ExcelJS });
