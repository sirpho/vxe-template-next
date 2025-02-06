<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
          <RadioButton value="categoryMode">按大类</RadioButton>
          <RadioButton value="locationMode">按制片地区</RadioButton>
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
  import { analysis, getLinearColorList } from './service';
  import { groupBy, orderBy, sortBy } from 'lodash-es';

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
      originList.value = res.data || [];
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

    const resultList = [];

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
          let filmList = [];
          switch (valueMode.value) {
            case 'typeMode':
              filmList = typeGroupBy.value[name] || [];
              break;
            case 'locationMode':
              filmList = locationGroupBy.value[name] || [];
              break;
            case 'categoryMode':
              filmList = categoryGroupBy.value[name] || [];
              break;
          }

          filmList = orderBy(filmList, ['name'], ['asc']).map((item) => getClass(item));

          let filmList2 = [];
          for (let i = 0; i < filmList.length; i += 4) {
            const chunk = filmList.slice(i, i + 4);
            filmList2.push(chunk.join('  '));
          }

          return [
            '<div class="tooltip-title">' + name + '</div>',
            `<div class="tooltip-title">${value} 部，占比${percent}%</div>`,
            ...filmList2.map((item) => `<div class="tooltip-title">${item}</div>`),
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList(),
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
