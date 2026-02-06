<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
          <RadioButton value="languageMode">按语言</RadioButton>
          <RadioButton value="suffixMode">按格式</RadioButton>
        </RadioGroup>
        <div ref="chartRef" class="h-100% flex-1"></div>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Ref, ref, onMounted } from 'vue';
  import { RadioGroup, RadioButton } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { analysis } from './service';
  import { groupBy, sortBy } from 'lodash-es';
  import { getLinearColorList } from '@/utils/color';
  import { adds, thousandsSeparator, divide, percentage } from '@sirpho/utils';
  import { formatSize } from '@/utils/formatter';
  import { VxeContainer, PageContainer } from '@sirpho/components';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<'languageMode' | 'suffixMode'>('languageMode');

  const originList = ref<any[]>([]);
  const echartData = ref<any[]>([]);
  const languageGroupBy = ref<any>({});
  const suffixGroupBy = ref<any>({});
  const sumDuration = ref<number>(0);
  const sumSize = ref<number>(0);

  onMounted(() => {
    analysis().then((res) => {
      originList.value = res.data || [];
      languageGroupBy.value = groupBy(originList.value, 'language');
      suffixGroupBy.value = groupBy(originList.value, 'suffix');
      sumDuration.value = adds(...originList.value.map((item) => item.duration));
      sumSize.value = adds(...originList.value.map((item) => item.size));
      resetOptions();
    });
  });

  const getClass = (record) => {
    let style = '';
    let color = '#9FA1A4';
    return `<span class="echarts-tooltip-dot" style="--echart-dot-color: ${color}"></span><span ${style}>《${record.name}》</span>`;
  };

  const getModeName = () => {
    switch (valueMode.value) {
      case 'languageMode':
        return '语言';
      case 'suffixMode':
        return '格式';
    }
  };

  /**
   * 更新echarts
   */
  const resetOptions = () => {
    echartData.value = [];
    const result: Record<string, number> = {};
    originList.value.forEach((item) => {
      let nameField;
      switch (valueMode.value) {
        case 'languageMode':
          nameField = 'language';
          break;
        case 'suffixMode':
          nameField = 'suffix';
          break;
      }
      if (result[item[nameField]]) {
        result[item[nameField]] = result[item[nameField]] + 1;
      } else {
        result[item[nameField]] = 1;
      }
    });

    const resultList: any[] = [];

    for (const field of Object.keys(result)) {
      resultList.push({
        name: field,
        value: result[field],
      });
    }
    echartData.value = sortBy(resultList, 'value').reverse();

    setOptions({
      tooltip: {
        trigger: 'item',
        formatter: (info) => {
          const { value, name, percent } = info;
          let list: any[] = [];
          switch (valueMode.value) {
            case 'languageMode':
              list = languageGroupBy.value[name] || [];
              break;
            case 'suffixMode':
              list = suffixGroupBy.value[name] || [];
              break;
          }

          let totalSize: any = adds(...list.map((item: any) => item.size));
          let totalDuration: any = adds(...list.map((item: any) => item.duration));

          let chunkList: any[] = [];

          if (list.length < 50) {
            list = list.map((item) => getClass(item));
            const batchQty = list.length > 50 ? 5 : 4;
            for (let i = 0; i < list.length; i += batchQty) {
              const chunk = list.slice(i, i + batchQty);
              chunkList.push(chunk.join('  '));
            }
          }
          let unit: string;
          let duration: string;
          if (totalDuration > 60 * 60) {
            duration = divide(totalDuration, 60 * 60).toFixed(2);
            unit = '小时';
          } else {
            duration = divide(totalDuration, 60).toFixed(2);
            unit = '分钟';
          }

          return [
            `<div class="echarts-tooltip-title">${name}</div>`,
            `<div class="echarts-tooltip-title">数量：${value} 首，占比${percent}%</div>`,
            `<div class="echarts-tooltip-title">时长：${thousandsSeparator(duration)}${unit}，占比${percentage(totalDuration / sumDuration.value || 1)}</div>`,
            `<div class="echarts-tooltip-title">大小：${formatSize(totalSize)}，占比${percentage(totalSize / sumSize.value || 1)}</div>`,
            ...chunkList.map((item) => `<div>${item}</div>`),
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList('#98C06C'),
          name: getModeName(),
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: echartData.value,
        },
      ],
    });
  };

  /**
   * 修改统计维度
   */
  const handleChangeMode = () => {
    resetOptions();
  };
</script>
<script lang="ts">
  export default {
    name: 'MusicAnalysis',
  };
</script>
