import VXETable from 'vxe-table';
import { isNil } from 'lodash-es';
import FilterExtend from './FilterExtend.vue';

// 创建一个复杂的筛选器
VXETable.renderer.add('FilterExtend', {
  // 不显示底部按钮，使用自定义的按钮
  showFilterFooter: false,
  // 筛选模板
  // @ts-ignore
  renderFilter(renderOpts, params) {
    // @ts-ignore
    return <FilterExtend params={params} />;
  },
  // 重置数据方法
  filterResetMethod(params) {
    const { options } = params;
    options.forEach((option) => {
      option.data = {
        vals: [],
        dVals: [],
        sVal: '',
        cdt: '',
        cdt2: '',
        cdt3: '',
        cdt4: '',
      };
    });
  },
  // 筛选数据方法
  filterMethod(params) {
    const { option, row, column } = params;
    const cellValue = row[column.field];
    const { vals } = option.data;
    return vals.includes(cellValue);
  },
});

VXETable.renderer.add('Link', {
  renderDefault(renderOpts, params) {
    const { row, column } = params;
    const { content, props } = renderOpts;
    console.log(props);
    if (isNil(row[column.field]) || row[column.field] === '') {
      return [];
    }
    if (Array.isArray(row[column.field])) {
      return row[column.field].map((c: string, index) => (
        <a href={c} target="_blank">
          {content ? `${content}[${index}]` : c}
        </a>
      ));
    }
    return [
      <a href={row[column.field]} target="_blank">
        {content || row[column.field]}
      </a>,
    ];
  },
  // 导出模板，例如导出插槽中自定义的内容
  exportMethod(params) {
    const { row, column } = params;
    return row[column.field];
  },
});
