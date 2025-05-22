import { isRef, Ref } from 'vue';
import { nanoid } from 'nanoid';
// import { VXETable } from 'vxe-table';
import { message } from 'ant-design-vue';
import { isEqual, isUndefined, toString, trim } from 'lodash-es';
import { VxeGridInstance, VxeGridProps, VxeTableDefines, VxeTableInstance } from 'vxe-table';
import { VxeInstance } from './typing';
import { config } from './init';

interface RefsIsRequiredOptions {
  message: string;
}

export const refsIsRequired = (
  ref?: Ref<VxeInstance>,
  options: RefsIsRequiredOptions = { message: 'Ref<VxeTableProps | VxeGridProps> is Required' },
) => {
  const { message } = options;
  if (!ref) {
    throw Error(`vxeInstance: ${message}`);
  }
  if (!isRef(ref)) {
    throw Error('vxe instance is not ref (dependence isRef)');
  }
};

export const getColumnsProps = (columns: VxeTableDefines.ColumnInfo[], key: string): string[] => {
  return columns.map((current) => {
    return current[key];
  });
};

/**
 * @description 获取表格的可视的列标题字段
 * @param ref Grid实例
 * @param key
 * @returns 列字段集合
 */
export const getGridColumnsProps = (ref: Ref<VxeTableInstance | VxeGridInstance>, key: string) => {
  const columns = ref.value.getColumns();
  return getColumnsProps(columns, key);
};

/**
 *
 * @param excelHeader 导入的表头数据
 * @param tableColumns 获取到的表格的columns信息
 */
export const getUpdateField = (
  tableColumns: VxeGridProps['columns'],
  excelHeader: string[],
): string[] => {
  const fields = excelHeader.map((current: string) => {
    const findField = tableColumns?.find((filed) => {
      return trim(filed['title']) === trim(current);
    });
    if (isUndefined(findField)) return `NOT_FOUND_${nanoid(6)}`;
    return findField.field;
  });
  return fields as string[];
};

export const isHeaderEqual = (t1, t2) => {
  const isEq = isEqual(
    t1.map((c) => trim(toString(c))),
    t2.map((c) => trim(toString(c))),
  );
  if (!isEq) {
    message.error('表头格式与模板不符，请修正重新上传');
  }
  return isEq;
};

export const createRowWithId = (row: Record<string, any>) => {
  const { idField } = config;
  return { [idField]: `@@CREATED_DEFAULT_${nanoid(12)}`, ...row };
};

/**
 *
 * @param data 导入的数据 二维数组
 * @param fields 对应的表格 filed 集合
 * @returns 期望的表格数据
 */
export const transformDataToTableData = (
  data: (string | number)[][],
  fields: string[],
  hasId = true,
) => {
  const asTableDate = data.map((current: (string | number)[]) => {
    const rowData = current.reduce((acc, item, index) => {
      const filed = isUndefined(fields[index]) ? {} : { [fields[index]]: item };
      if (hasId) return { ...createRowWithId({ ...acc, ...filed }) };
      return { ...acc, ...filed };
    }, {});
    return rowData;
  });
  return asTableDate;
};

export const validateColumns = [
  {
    title: '错误行',
    dataIndex: 'property',
    key: 'property',
    width: 80,
  },
  {
    title: '错误列',
    dataIndex: 'columnsName',
    key: 'columnsName',
    width: 120,
  },
  {
    title: '错误信息',
    dataIndex: 'message',
    key: 'message',
  },
];

export const handleExportValidate = (errors, columns) => {
  const [error0, ..._other] = errors;
  const errorDataSource: { property: number; columnsName: string; message: string }[] = [];
  error0.children?.forEach((current) => {
    if (current.children) {
      current.children.forEach((inner) => {
        const column = columns.find((current) => current.field === inner.property);
        const message = Object.keys(inner.constraints!)
          .map((current) => inner.constraints![current])
          .join(',');
        errorDataSource.push({
          property: +current.property + 2,
          columnsName: column.title,
          message,
        });
      });
    }
  });
  return errorDataSource;
};

// export const validateSheetSchema = async (sheetClass, sheetData, columns) => {
//   const list = plainToInstance(sheetClass, { list: sheetData }) as object;
//   const errors = await validate(list);
//   if (errors.length > 0) {
//     Modal.error({
//       title: '导入数据格式有误',
//       width: '600px',
//       content: h(VXETable, {
//         columns: validateColumns,
//         data: handleExportValidate(errors, columns),
//       }),
//     });
//   }
//   return errors.length > 0;
// };
