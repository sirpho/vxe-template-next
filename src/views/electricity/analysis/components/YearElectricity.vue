<template>
  <Divider> {{ title }} </Divider>
  <div class="flex">
    <div class="flex flex-col">
      <Statistic title="合计电量" :value="calcTotalPower" suffix="度" />
      <Statistic title="合计电费" :value="calcTotalCost" prefix="￥" suffix="元" />
      <Statistic title="平均电价" :value="calcAvgPrice" prefix="￥" suffix="元" />
    </div>
    <div class="flex-1" ref="chartRef" :style="{ height, width }"></div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, PropType, ref, Ref } from 'vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { type ElectricityRecord } from '@/views/electricity/analysis/service';
  import echarts from '@/utils/lib/echarts';
  import { Divider, Statistic } from 'ant-design-vue';
  import { add, divide } from '@sirpho/utils';

  const props = defineProps({
    width: {
      type: String as PropType<string>,
      default: '100%',
    },
    height: {
      type: String as PropType<string>,
      default: '350px',
    },
    data: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    xAxis: {
      type: Array as PropType<any[]>,
      default: () => [
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
      ],
    },
    title: {
      type: String as PropType<string>,
    },
    // 是否年度趋势
    trend: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  });
  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  onMounted(() => {
    const options = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.8)',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true,
            backgroundColor: '#7B7DDC',
          },
        },
      },
      legend: {
        data: ['用电量', '电费'],
        textStyle: {
          color: '#B4B4B4',
        },
        top: '7%',
      },
      xAxis: [
        {
          type: 'category',
          data: props.xAxis,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          splitLine: { show: false },
          type: 'value',
          name: '用电量',
          min: 0,
          max: props.trend ? 40000 : 5000,
          interval: props.trend ? 10000 : 1000,
          axisLabel: {
            formatter: '{value} 千瓦时',
          },
        },
        {
          splitLine: { show: false },
          type: 'value',
          name: '电费',
          min: 0,
          max: props.trend ? 30000 : 3000,
          interval: props.trend ? 5000 : 500,
          axisLabel: {
            formatter: '￥{value} 元',
          },
        },
      ],
      series: [
        {
          name: '用电量',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return echarts.format.addCommas(value) + ' 千瓦时';
            },
          },
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#887B70' },
                { offset: 1, color: '#8B8A86' },
              ]),
            },
          },
          yAxisIndex: 0,
          data: (props.data || []).map((item: ElectricityRecord) => item.power),
        },
        {
          name: '电费',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return `￥${echarts.format.addCommas(value)} 元`;
            },
          },
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#768DD1' },
                { offset: 1, color: '#2B4396' },
              ]),
            },
          },
          yAxisIndex: 1,
          data: (props.data || []).map((item: ElectricityRecord) => item.cost),
        },
      ],
    };
    setOptions(options);
  });

  /**
   * 计算
   */
  const calcTotalPower = computed(() => {
    return (props.data || []).reduce(
      (previousValue, currentValue) => add(previousValue, currentValue.power),
      0,
    );
  });

  /**
   * 计算
   */
  const calcTotalCost = computed(() => {
    return (props.data || []).reduce(
      (previousValue, currentValue) => add(previousValue, currentValue.cost),
      0,
    );
  });

  /**
   * 计算
   */
  const calcAvgPrice = computed(() => {
    return divide(calcTotalCost.value, calcTotalPower.value).toFixed(3);
  });
</script>
