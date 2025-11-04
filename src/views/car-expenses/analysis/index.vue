<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <RadioGroup v-model:value="year" @change="handleChangeYear">
          <RadioButton v-for="item in Object.keys(yearGroupBy).sort()" :key="item" :value="item">
            {{ item }}
          </RadioButton>
          <RadioButton value="">全部</RadioButton>
        </RadioGroup>
        <Divider />
        <div class="mode-wrapper">
          <Space>
            <RadioGroup v-model:value="chartType" @change="resetOptions">
              <RadioButton value="pie">饼图</RadioButton>
              <RadioButton value="bar">柱状图</RadioButton>
            </RadioGroup>
            <Checkbox
              v-if="chartType === 'bar'"
              v-model:checked="onlyFuel"
              @change="handleChangeYear"
            >
              只看油费
            </Checkbox>
          </Space>
        </div>

        <div ref="chartRef" class="h-100% flex-1"></div>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Ref, ref, onMounted } from 'vue';
  import { Checkbox, RadioGroup, RadioButton, Divider, Space } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { getTableTemplate, list, xAxios } from './service';
  import { getLinearColorList } from '@/utils/color';
  import { groupBy, orderBy } from 'lodash-es';
  import dayjs from 'dayjs';
  import { add, adds, percentage, thousandsSeparator } from '@sirpho/utils';
  import echarts from '@/utils/lib/echarts';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  // echart类型
  const chartType = ref<'pie' | 'bar'>('pie');
  // 只看油费
  const onlyFuel = ref(false);
  const year = ref(dayjs().format('YYYY年'));

  const originList = ref<any[]>([]);
  const echartData = ref<any[]>([]);
  const typeGroupBy = ref<any>({});

  const yearGroupBy = ref<any>({});
  // 年过滤数据
  const yearFilterList = ref<any[]>([]);
  // 油费过滤数据
  const filterFuelList = ref<any[]>([]);
  const monthTotalList = ref<any[]>([]);

  onMounted(() => {
    list().then((res) => {
      originList.value = (res.data || []).map((item: any) => ({
        ...item,
        year: dayjs(item.date).format('YYYY年'),
        month: dayjs(item.date).format('YYYY-MM'),
      }));
      yearFilterList.value = originList.value;

      yearGroupBy.value = groupBy(yearFilterList.value, 'year');
      typeGroupBy.value = groupBy(yearFilterList.value, 'type');

      handleChangeYear();
      resetOptions();
    });
  });

  /**
   * 饼图展示
   */
  const resetBieOptions = () => {
    echartData.value = [];
    // 次数
    const result: Record<string, number> = {};
    // 金额
    const totalMap: Record<string, number> = {};

    yearFilterList.value.forEach((item) => {
      if (result[item.type]) {
        result[item.type] = result[item.type] + 1;
      } else {
        result[item.type] = 1;
      }
      if (totalMap[item.type]) {
        totalMap[item.type] = add(totalMap[item.type], item.cost);
      } else {
        totalMap[item.type] = item.cost || 0;
      }
    });
    const resultList: any[] = [];
    for (const field of Object.keys(result)) {
      resultList.push({
        name: field,
        value: totalMap[field],
      });
    }
    echartData.value = resultList;

    setOptions({
      tooltip: {
        trigger: 'item',
        formatter: (info: any) => {
          const { value, name, percent } = info;
          let list = typeGroupBy.value[name] || [];
          const countMap = groupBy(list, 'brand');

          const trList: any[] = [];
          for (const field in countMap) {
            const currentBrandTotalMoney = adds(
              ...(countMap[field] || []).map((item: any) => item.cost),
            );
            trList.push({
              name: field,
              count: countMap[field].length,
              total: currentBrandTotalMoney,
            });
          }
          const echartTable = getTableTemplate(trList, trList.length > 1);

          return [
            `<div class="echarts-tooltip-title">${name} × ${result[name]}次，合计${thousandsSeparator(value)}元，占比${percent}%</div>`,
            echartTable,
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList('#6F6F6F'),
          name: '类型',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: echartData.value,
        },
      ],
    });
  };

  /**
   * 柱状图展示
   */
  const resetBarOptions = () => {
    const options = {
      tooltip: {
        trigger: 'item',
        formatter: (info: any) => {
          const { value, name } = info;
          const yearTotalMoney = adds(...filterFuelList.value.map((item: any) => item.cost));
          let list = filterFuelList.value
            .map((item: any) => ({
              ...item,
              monthChinese: getMonthChinese(item.month),
            }))
            .filter((item: any) => item.monthChinese === name);

          const countMap = groupBy(list, 'brand');

          const trList: any[] = [];
          for (const field in countMap) {
            const currentBrandTotalMoney = adds(
              ...(countMap[field] || []).map((item: any) => item.cost),
            );
            trList.push({
              name: field,
              count: countMap[field].length,
              total: currentBrandTotalMoney,
            });
          }
          const echartTable = getTableTemplate(trList, trList.length > 1);

          return [
            `<div class="echarts-tooltip-title">${name}，合计${thousandsSeparator(value)}元，占比${percentage(value / yearTotalMoney)}</div>`,
            echartTable,
          ].join('');
        },
      },
      xAxis: [
        {
          type: 'category',
          data: xAxios,
          axisPointer: {
            type: 'shadow',
          },
          axisTick: false,
        },
      ],
      yAxis: [
        {
          splitLine: { show: true },
          type: 'value',
          name: '金额',
          min: 0,
          axisLabel: {
            formatter: '{value} 元',
          },
        },
      ],
      series: [
        {
          name: '金额',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value: any) {
              return echarts.format.addCommas(value) + ' 元';
            },
          },
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#6F6F6F' },
                { offset: 1, color: '#6B727C' },
              ]),
            },
          },
          yAxisIndex: 0,
          data: monthTotalList.value,
        },
      ],
    };
    setOptions(options);
  };

  /**
   * 修改年份
   */
  const handleChangeYear = () => {
    if (!year.value) {
      yearFilterList.value = originList.value;
    } else {
      yearFilterList.value = yearGroupBy.value[year.value] || [];
    }
    typeGroupBy.value = groupBy(yearFilterList.value, 'type');
    const totalList: number[] = new Array(12).fill(0);
    filterFuelList.value = onlyFuel.value
      ? yearFilterList.value.filter((item) => item.type === '油费')
      : yearFilterList.value;

    const monthMap = groupBy(filterFuelList.value, 'month');
    orderBy(Object.keys(monthMap)).forEach((field) => {
      const list = monthMap[field] || [];
      const index = new Date(field).getMonth();
      totalList[index] = adds(...list.map((item: any) => item.cost));
    });
    monthTotalList.value = totalList;
    resetOptions();
  };

  /**
   * 修改echart类型
   */
  const resetOptions = () => {
    if (chartType.value === 'pie') {
      resetBieOptions();
    } else {
      resetBarOptions();
    }
  };

  const getMonthChinese = (month: string) => {
    const monthFormat = dayjs(month).format('MM');
    switch (monthFormat) {
      case '01':
        return '一月';
      case '02':
        return '二月';
      case '03':
        return '三月';
      case '04':
        return '四月';
      case '05':
        return '五月';
      case '06':
        return '六月';
      case '07':
        return '七月';
      case '08':
        return '八月';
      case '09':
        return '九月';
      case '10':
        return '十月';
      case '11':
        return '十一月';
      case '12':
        return '十二月';
      default:
        return '其他';
    }
  };
</script>
<script lang="ts">
  export default {
    name: 'CarExpensesAnalysis',
  };
</script>
<style lang="less" scoped>
  .mode-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
