<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
          <RadioButton value="categoryMode">按大类</RadioButton>
          <RadioButton value="locationMode">按地区</RadioButton>
          <RadioButton value="typeMode">按类型</RadioButton>
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
  import { groupBy, orderBy, sortBy } from 'lodash-es';
  import { getLinearColorList } from '@/utils/color';
  import { adds, thousandsSeparator } from '@sirpho/utils';
  import { divide } from '@sirpho/utils/math';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<'typeMode' | 'locationMode' | 'categoryMode'>('categoryMode');

  const originList = ref<any[]>([]);
  const echartData = ref<any[]>([]);
  const typeGroupBy = ref<any>({});
  const locationGroupBy = ref<any>({});
  const categoryGroupBy = ref<any>({});

  onMounted(() => {
    analysis().then((res) => {
      originList.value = (res.data || []).map((item: any) => ({
        ...item,
        watchDate: item.watchDate || '2000-01-01',
      }));
      typeGroupBy.value = groupBy(originList.value, 'type');
      locationGroupBy.value = groupBy(originList.value, 'location');
      categoryGroupBy.value = groupBy(originList.value, 'category');

      resetOptions();
    });
  });

  const getModeName = () => {
    switch (valueMode.value) {
      case 'typeMode':
        return '类型';
      case 'locationMode':
        return '制作地区';
      case 'categoryMode':
        return '大类';
    }
  };

  const getClass = (record) => {
    let style = '';
    let color = '#9FA1A4';
    if (record.category === '纪录片') {
      color = `#1890ff`;
    }
    if (record.category === '电影') {
      color = `#9FA1A4`;
    }
    if (record.category === '电视剧') {
      color = `#722ED1`;
    }
    return `<span class="echarts-tooltip-dot" style="--echart-dot-color: ${color}"></span><span ${style}>《${record.name}》</span>`;
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
        case 'typeMode':
          nameField = 'type';
          break;
        case 'locationMode':
          nameField = 'location';
          break;
        case 'categoryMode':
          nameField = 'category';
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
            case 'typeMode':
              list = typeGroupBy.value[name] || [];
              break;
            case 'locationMode':
              list = locationGroupBy.value[name] || [];
              break;
            case 'categoryMode':
              list = categoryGroupBy.value[name] || [];
              break;
          }

          const totalDuration = divide(adds(...list.map((item: any) => item.duration)), 60).toFixed(
            2,
          );
          list = orderBy(list, ['watchDate'], ['desc']).map((item) => getClass(item));
          const batchQty = list.length > 50 ? 5 : 4;
          let chunkList: any[] = [];
          for (let i = 0; i < list.length; i += batchQty) {
            const chunk = list.slice(i, i + batchQty);
            chunkList.push(chunk.join('  '));
          }
          if (chunkList.length > 10) {
            chunkList = chunkList.slice(0, 10);
            chunkList.push('......');
          }

          return [
            `<div class="echarts-tooltip-title">${name}  ${totalDuration ? thousandsSeparator(totalDuration) + '小时' : ''}</div>`,
            `<div class="echarts-tooltip-title">${value} 部，占比${percent}%</div>`,
            ...chunkList.map((item) => `<div>${item}</div>`),
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList('#629412'),
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
    name: 'FilmAnalysis',
  };
</script>
