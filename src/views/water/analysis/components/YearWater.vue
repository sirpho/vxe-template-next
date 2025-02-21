<template>
  <Divider> {{ title }} </Divider>
  <div class="flex">
    <div class="flex flex-col justify-center">
      <Statistic title="合计用水量" :value="calcTotalPower" suffix="吨" />
      <Statistic title="合计水费" :value="calcTotalCost" prefix="￥" suffix="元" />
      <Statistic title="平均水价" :value="calcAvgPrice" prefix="￥" suffix="元" />
      <Statistic v-if="props.total" title="年均用水量" :value="calcAvgPower" suffix="吨" />
      <Statistic v-if="props.total" title="年均水费" :value="calcAvgCost" prefix="￥" suffix="元" />
    </div>
    <div class="flex-1" ref="chartRef" :style="{ height, width }"></div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, PropType, ref, Ref } from 'vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { type WaterRecord } from '@/views/water/analysis/service';
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
    // 是否是合计
    total: {
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
        data: ['用水量', '水费'],
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
          axisTick: false,
        },
      ],
      yAxis: [
        {
          splitLine: { show: true },
          type: 'value',
          name: '用水量',
          min: 0,
          axisLabel: {
            formatter: '{value} 吨',
          },
        },
        {
          splitLine: { show: false },
          type: 'value',
          name: '水费',
          min: 0,
          axisLabel: {
            formatter: '￥{value} 元',
          },
        },
      ],
      series: [
        {
          name: '用水量',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return echarts.format.addCommas(value) + ' 吨';
            },
          },
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ADD8E6' },
                { offset: 1, color: '#D9EDF7' },
              ]),
            },
          },
          yAxisIndex: 0,
          data: fillData.value.map((item: WaterRecord | null) => item?.power || undefined),
        },
        {
          name: '水费',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return `￥${echarts.format.addCommas(value)} 元`;
            },
          },
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2B4396' },
                { offset: 1, color: '#768DD1' },
              ]),
            },
          },
          yAxisIndex: 1,
          data: fillData.value.map((item: WaterRecord | null) => item?.cost || undefined),
        },
      ],
    };
    setOptions(options);
  });

  /**
   * 因为水费是隔一段时间统计一下，所以会有一些月份没有数据，需要填充为0
   */
  const fillData = computed(() => {
    const data = props.data || [];
    const xAxis = props.xAxis || [];
    if (props.total || data.length === xAxis.length) {
      return data;
    }
    const result = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const dataItem = data.find((item) => new Date(item.month).getMonth() === monthIndex);
      if (dataItem) {
        result.push(dataItem);
      } else {
        result.push(null);
      }
    }
    return result;
  });

  /**
   * 计算总用量
   */
  const calcTotalPower = computed(() => {
    return (props.data || []).reduce(
      (previousValue, currentValue) => add(previousValue, currentValue.power),
      0,
    );
  });

  /**
   * 计算年均用水量
   */
  const calcAvgPower = computed(() => {
    return divide(calcTotalPower.value, props.xAxis?.length || 1).toFixed(3);
  });

  /**
   * 计算年均费用
   */
  const calcAvgCost = computed(() => {
    return divide(calcTotalCost.value, props.xAxis?.length || 1).toFixed(3);
  });

  /**
   * 计算总费用
   */
  const calcTotalCost = computed(() => {
    return (props.data || []).reduce(
      (previousValue, currentValue) => add(previousValue, currentValue.cost),
      0,
    );
  });

  /**
   * 计算均价
   */
  const calcAvgPrice = computed(() => {
    return divide(calcTotalCost.value, calcTotalPower.value).toFixed(3);
  });
</script>

<style lang="less" scoped>
  :deep(.ant-statistic-content) {
    display: flex;
  }
</style>
