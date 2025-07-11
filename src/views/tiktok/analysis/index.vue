<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <RadioGroup v-model:value="valueMode" @change="handleChangeMode">
          <RadioButton value="totalSize">存储容量</RadioButton>
          <RadioButton value="videoCount">视频数量</RadioButton>
          <RadioButton value="totalDuration">播放时长</RadioButton>
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
  import echarts from '@/utils/lib/echarts';
  import { formatDuration, add } from '@sirpho/utils';
  import { formatBitrate, formatSize } from '@/utils/formatter';

  const chartRef = ref<HTMLDivElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const valueMode = ref<string>('totalSize');

  const echartData = ref<any[]>([]);

  onMounted(() => {
    analysis().then((res) => {
      echartData.value = res.data || [];

      resetOptions();
    });
  });

  /**
   * 更新echarts
   */
  const resetOptions = () => {
    echartData.value = echartData.value.map((item) => ({
      path: item.author || item.name,
      name: item.author || item.name,
      value: item[valueMode.value],
      totalDuration: item.totalDuration,
      totalSize: item.totalSize,
      videoCount: item.videoCount,
      bitrate: item.bitrate,
    }));
    setOptions({
      tooltip: {
        formatter: (info: any) => {
          const { data, name } = info;
          if (name === 'tiktok') {
            const children = data.children || [];
            const totalSize = children.reduce((previousValue: number, currentValue: any) => {
              return add(previousValue, currentValue.totalSize);
            }, 0);
            const videoCount = children.reduce((previousValue: number, currentValue: any) => {
              return add(previousValue, currentValue.videoCount);
            }, 0);
            const totalDuration = children.reduce((previousValue: number, currentValue: any) => {
              return add(previousValue, currentValue.totalDuration);
            }, 0);
            const bitrate = totalDuration ? (totalSize * 8) / totalDuration : 0;
            return [
              `<div class="echarts-tooltip-title">合计人数: ${children.length}</div>`,
              `<div class="echarts-tooltip-title">存储容量: ${formatSize(totalSize)}</div>`,
              `<div class="echarts-tooltip-title">视频数量: ${echarts.format.addCommas(videoCount)}</div>`,
              `<div class="echarts-tooltip-title">播放时长: ${formatDuration(totalDuration)}</div>`,
              `<div class="echarts-tooltip-title">比特率: ${formatBitrate(bitrate)}</div>`,
            ].join('');
          }
          const totalSize = data.totalSize;
          const videoCount = data.videoCount;
          const totalDuration = data.totalDuration;
          const bitrate = data.bitrate;
          return [
            '<div class="echarts-tooltip-title">' + data.name + '</div>',
            `<div class="echarts-tooltip-title">存储容量: ${formatSize(totalSize)}</div>`,
            `<div class="echarts-tooltip-title">视频数量: ${echarts.format.addCommas(videoCount)}</div>`,
            `<div class="echarts-tooltip-title">播放时长: ${formatDuration(totalDuration)}</div>`,
            `<div class="echarts-tooltip-title">比特率: ${formatBitrate(bitrate)}</div>`,
          ].join('');
        },
      },
      series: [
        {
          name: 'tiktok',
          type: 'treemap',
          visibleMin: 300,
          label: {
            show: true,
            formatter: '{b}',
          },
          itemStyle: {
            borderColor: '#fff',
          },
          breadcrumb: {
            show: false,
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 5,
              },
            },
            {
              itemStyle: {
                gapWidth: 1,
              },
            },
            {
              colorSaturation: [0.35, 0.5],
              itemStyle: {
                gapWidth: 1,
                borderColorSaturation: 0.6,
              },
            },
          ],
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
    name: 'Analysis',
  };
</script>
