<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <Space>
          <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
            <RadioButton value="typeMode">按类型</RadioButton>
            <RadioButton value="authorMode">按作者</RadioButton>
            <RadioButton value="readMode">按阅读状态</RadioButton>
          </RadioGroup>

          <Checkbox v-model:checked="ignoreDiscarded" @change="handleChangeMode">
            忽略已弃的
          </Checkbox>
        </Space>

        <div ref="chartRef" class="h-100% flex-1"></div>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Ref, ref, onMounted } from 'vue';
  import { RadioGroup, Space, RadioButton, Checkbox } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import { analysis } from './service';
  import { groupBy, sortBy } from 'lodash-es';
  import { getLinearColorList } from '@/utils/color';
  import { adds, thousandsSeparator } from '@sirpho/utils';
  import { percentage } from '@sirpho/utils/math';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<'typeMode' | 'authorMode' | 'readMode'>('typeMode');
  // 忽略已弃的
  const ignoreDiscarded = ref<boolean>(true);
  const originList = ref<any[]>([]);
  const echartData = ref<any[]>([]);
  const typeGroupBy = ref<any>({});
  const authorGroupBy = ref<any>({});
  const readGroupBy = ref<any>({});
  const sumWordCount = ref<number>(0);

  onMounted(() => {
    analysis().then((res) => {
      originList.value = res.data || [];
      typeGroupBy.value = groupBy(originList.value, 'type');
      authorGroupBy.value = groupBy(originList.value, 'author');
      readGroupBy.value = groupBy(originList.value, 'readStatus');
      sumWordCount.value = adds(
        ...originList.value
          .filter((item) => item.readStatus !== '弃坑')
          .map((item) => item.wordCount),
      );
      resetOptions();
    });
  });

  const getModeName = () => {
    switch (valueMode.value) {
      case 'typeMode':
        return '类型';
      case 'authorMode':
        return '作者';
      case 'readMode':
        return '阅读状态';
    }
  };

  const getClass = (record) => {
    let style = '';
    let color = '#9FA1A4';
    if (record.readStatus === '弃坑') {
      style = `style="text-decoration: line-through; color: #001529"`;
    }
    if (record.readStatus === '在读') {
      color = `#1890ff`;
    }
    if (record.readStatus === '已读') {
      color = `#9FA1A4`;
    }
    if (record.readStatus === '待读') {
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
    const array = ignoreDiscarded.value
      ? originList.value.filter((item) => item.readStatus !== '弃坑')
      : originList.value;
    array.forEach((item) => {
      let nameField;
      switch (valueMode.value) {
        case 'typeMode':
          nameField = 'type';
          break;
        case 'authorMode':
          nameField = 'author';
          break;
        case 'readMode':
          nameField = 'readStatus';
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
            case 'authorMode':
              list = authorGroupBy.value[name] || [];
              break;
            case 'readMode':
              list = readGroupBy.value[name] || [];
              break;
          }

          const effectiveList = list.filter((item) => item.readStatus !== '弃坑');
          const classList = list.map((item) => getClass(item));
          const totalWordCount = adds(...effectiveList.map((item: any) => item.wordCount));

          let chunkList: any[] = [];
          for (let i = 0; i < classList.length; i += 4) {
            const chunk = classList.slice(i, i + 4);
            chunkList.push(chunk.join('  '));
          }
          const wordCountText = totalWordCount
            ? `，占比${percentage(totalWordCount / sumWordCount.value || 1)}`
            : '';

          return [
            `<div class="echarts-tooltip-title">${name}</div>`,
            `<div class="echarts-tooltip-title">数量：${value} 本，占比${percent}%</div>`,
            `<div class="echarts-tooltip-title">字数：${totalWordCount ? thousandsSeparator(totalWordCount) + '万字' : '0'}${wordCountText}</div>`,
            ...chunkList.map((item) => `<div>${item}</div>`),
          ].join('');
        },
      },
      series: [
        {
          color: getLinearColorList('#D26913'),
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
    name: 'NovelAnalysis',
  };
</script>
