import { defHttp } from '@/utils/http/axios';
import { orderBy } from 'lodash-es';
import { adds, percentage, thousandsSeparator } from '@sirpho/utils';

enum Api {
  list = '/api/car-expenses/list',
}

/**
 * @description: 列表
 */
export const list = () => {
  return defHttp.post({ url: Api.list });
};

export const tableTemplate = `
<table class="echarts-tooltip-table">
    <thead>
        <tr>
            <th>明细</th>
            <th>次数</th>
            <th>占比</th>
            <th>金额</th>
            <th>占比</th>
        </tr>
    </thead>
    <tbody>@@@</tbody>
</table>
`;

export const tableTemplate2 = `
<table class="echarts-tooltip-table">
    <thead>
        <tr>
            <th>明细</th>
            <th>次数</th>
            <th>金额</th>
        </tr>
    </thead>
    <tbody>@@@</tbody>
</table>
`;

export const xAxios = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

export const getTableTemplate = (trList: any[], showPercent: boolean) => {
  const template: string = showPercent ? tableTemplate : tableTemplate2;
  const dataList = orderBy(trList, 'total', 'desc');
  const totalMoney = adds(...dataList.map((item) => item.total));
  const totalCount = adds(...dataList.map((item) => item.count));
  const trTemplateList = dataList.map(
    (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.count}</td>
              ${showPercent ? '<td>' + percentage(item.count / totalCount) + '</td>' : ''}
              <td>${thousandsSeparator(item.total)}</td>
              ${showPercent ? '<td>' + percentage(item.total / totalMoney) + '</td>' : ''}
            </tr>`,
  );

  return template.replace('@@@', trTemplateList.join(''));
};
