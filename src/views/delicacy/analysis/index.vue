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
        <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
          <RadioButton value="typeMode">按类型</RadioButton>
          <RadioButton value="nameMode">按商家</RadioButton>
          <RadioButton value="locationMode">按商圈</RadioButton>
        </RadioGroup>
        <div ref="chartRef" class="h-100% flex-1"></div>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Ref, ref, onMounted } from 'vue';
  import { RadioGroup, RadioButton, Divider } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { list } from './service';
  import { groupBy, sortBy } from 'lodash-es';
  import dayjs from 'dayjs';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<'typeMode' | 'nameMode' | 'locationMode'>('typeMode');

  const year = ref(dayjs().format('YYYY年'));

  const originList = ref<any[]>([]);
  const echartData = ref<any[]>([]);
  const typeGroupBy = ref<any>({});
  const nameGroupBy = ref<any>({});
  const locationGroupBy = ref<any>({});

  const yearGroupBy = ref<any>({});
  const yearFilterList = ref<any[]>([]);

  onMounted(() => {
    list().then((res) => {
      originList.value = (res.data || []).map((item) => ({
        ...item,
        year: dayjs(item.date).format('YYYY年'),
      }));
      yearFilterList.value = originList.value;

      yearGroupBy.value = groupBy(yearFilterList.value, 'year');
      typeGroupBy.value = groupBy(yearFilterList.value, 'type');
      nameGroupBy.value = groupBy(yearFilterList.value, 'name');
      locationGroupBy.value = groupBy(yearFilterList.value, 'location');

      handleChangeYear();
      resetOptions();
    });
  });

  const getModeName = () => {
    switch (valueMode.value) {
      case 'typeMode':
        return '类型';
      case 'nameMode':
        return '商家';
      case 'locationMode':
        return '商圈';
    }
  };

  /**
   * 更新echarts
   */
  const resetOptions = () => {
    echartData.value = [];
    const result: Record<string, number> = {};
    yearFilterList.value.forEach((item) => {
      let nameField;
      switch (valueMode.value) {
        case 'typeMode':
          nameField = 'type';
          break;
        case 'nameMode':
          nameField = 'name';
          break;
        case 'locationMode':
          nameField = 'location';
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
          let list = [];
          switch (valueMode.value) {
            case 'typeMode':
              list = typeGroupBy.value[name] || [];
              break;
            case 'nameMode':
              list = nameGroupBy.value[name] || [];
              break;
            case 'locationMode':
              list = locationGroupBy.value[name] || [];
              break;
          }
          const resultList = [];
          const countMap = groupBy(list, 'name');

          for (const field in countMap) {
            resultList.push(
              `<span class="echarts-tooltip-dot"></span><span class="echarts-tooltip-name">${field}</span>*${countMap[field].length}次`,
            );
          }

          let chunkList = [];
          for (let i = 0; i < resultList.length; i += 4) {
            const chunk = resultList.slice(i, i + 4);
            chunkList.push(chunk.join('  '));
          }

          return [
            '<div class="tooltip-title">' + name + '</div>',
            `<div class="tooltip-title">${value} 次，占比${percent}%</div>`,
            ...chunkList.map((item) => `<div class="tooltip-title">${item}</div>`),
          ].join('');
        },
      },
      series: [
        {
          name: getModeName(),
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: echartData.value,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
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
    nameGroupBy.value = groupBy(yearFilterList.value, 'name');
    locationGroupBy.value = groupBy(yearFilterList.value, 'location');

    resetOptions();
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
    name: 'DelicacyAnalysis',
  };
</script>
