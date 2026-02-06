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
        <Space>
          <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
            <RadioButton value="typeMode">按类型</RadioButton>
            <RadioButton value="nameMode">按商家</RadioButton>
            <RadioButton value="locationMode">按商圈</RadioButton>
          </RadioGroup>
          <Checkbox v-model:checked="ignoreBanquet" @change="handleChangeMode">忽略酒席</Checkbox>
        </Space>

        <div ref="chartRef" class="h-100% flex-1"></div>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Ref, ref, onMounted } from 'vue';
  import { Checkbox, RadioGroup, RadioButton, Divider, Space } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { list } from './service';
  import { getLinearColorList } from '@/utils/color';
  import { groupBy, sortBy } from 'lodash-es';
  import dayjs from 'dayjs';
  import { VxeContainer, PageContainer } from '@sirpho/components';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<'typeMode' | 'nameMode' | 'locationMode'>('typeMode');

  const year = ref(dayjs().format('YYYY年'));

  // 忽略酒席
  const ignoreBanquet = ref<boolean>(true);
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

    const list = ignoreBanquet.value
      ? yearFilterList.value.filter((item) => item.type !== '酒席')
      : yearFilterList.value;

    list.forEach((item) => {
      let nameField: string;
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
        formatter: (info: any) => {
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
          const resultList: string[] = [];
          const countMap = groupBy(list, 'name');

          for (const field in countMap) {
            resultList.push(
              `<span class="echarts-tooltip-dot"></span><span class="echarts-tooltip-name">${field}</span>*${countMap[field].length}次`,
            );
          }

          const batchQty = resultList.length > 50 ? 5 : 4;

          let chunkList: string[] = [];
          for (let i = 0; i < resultList.length; i += batchQty) {
            const chunk = resultList.slice(i, i + batchQty);
            chunkList.push(chunk.join('  '));
          }

          return [
            '<div class="echarts-tooltip-title">' + name + '</div>',
            `<div class="echarts-tooltip-title">${value} 次，占比${percent}%</div>`,
            ...chunkList.map((item) => `<div>${item}</div>`),
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList('#CC5729'),
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
