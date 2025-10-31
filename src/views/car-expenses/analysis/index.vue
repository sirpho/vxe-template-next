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
            <RadioButton value="brandMode">按品牌</RadioButton>
          </RadioGroup>
          <Checkbox
            v-if="valueMode === 'brandMode'"
            v-model:checked="onlyFuel"
            @change="handleChangeMode"
            >只看油费</Checkbox
          >
        </Space>

        <div ref="chartRef" class="h-100% flex-1"></div>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Ref, ref, onMounted } from 'vue';
  import { RadioGroup, RadioButton, Divider, Space, Checkbox } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { list } from './service';
  import { getLinearColorList } from '@/utils/color';
  import { groupBy } from 'lodash-es';
  import dayjs from 'dayjs';
  import { add } from '@sirpho/utils';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<'typeMode' | 'brandMode'>('typeMode');

  const year = ref(dayjs().format('YYYY年'));

  const originList = ref<any[]>([]);
  const echartData = ref<any[]>([]);
  const typeGroupBy = ref<any>({});
  const brandGroupBy = ref<any>({});
  const onlyFuel = ref<boolean>(false);

  const yearGroupBy = ref<any>({});
  const yearFilterList = ref<any[]>([]);

  onMounted(() => {
    list().then((res) => {
      originList.value = (res.data || []).map((item: any) => ({
        ...item,
        year: dayjs(item.date).format('YYYY年'),
      }));
      yearFilterList.value = originList.value;

      yearGroupBy.value = groupBy(yearFilterList.value, 'year');
      typeGroupBy.value = groupBy(yearFilterList.value, 'type');
      brandGroupBy.value = groupBy(yearFilterList.value, 'brand');

      handleChangeYear();
      resetOptions();
    });
  });

  const getModeName = () => {
    switch (valueMode.value) {
      case 'typeMode':
        return '类型';
      case 'brandMode':
        return '品牌';
    }
  };

  /**
   * 更新echarts
   */
  const resetOptions = () => {
    echartData.value = [];
    // 次数
    const countMap: Record<string, number> = {};
    // 金额
    const moneyMap: Record<string, number> = {};

    const list =
      onlyFuel.value && valueMode.value === 'brandMode'
        ? yearFilterList.value.filter((item) => item.type === '油费')
        : yearFilterList.value;

    list.forEach((item) => {
      let nameField: string;
      switch (valueMode.value) {
        case 'typeMode':
          nameField = 'type';
          break;
        case 'brandMode':
          nameField = 'brand';
          break;
      }
      if (countMap[item[nameField]]) {
        countMap[item[nameField]] = countMap[item[nameField]] + 1;
      } else {
        countMap[item[nameField]] = 1;
      }
      if (moneyMap[item[nameField]]) {
        moneyMap[item[nameField]] = add(moneyMap[item[nameField]], item.cost);
      } else {
        moneyMap[item[nameField]] = item.cost || 0;
      }
    });
    const resultList: any[] = [];
    for (const field of Object.keys(countMap)) {
      resultList.push({
        name: field,
        value: moneyMap[field],
      });
    }
    echartData.value = resultList;

    setOptions({
      tooltip: {
        trigger: 'item',
        formatter: (info: any) => {
          const { value, name, percent } = info;

          return [
            `<div class="echarts-tooltip-title">${name} * ${countMap[name]}次</div>`,
            `<div class="echarts-tooltip-title">${value}元，占比${percent}%</div>`,
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList('#6F6F6F'),
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
    brandGroupBy.value = groupBy(yearFilterList.value, 'brand');

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
    name: 'CarExpensesAnalysis',
  };
</script>
