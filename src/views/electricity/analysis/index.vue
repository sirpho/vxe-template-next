<template>
  <PageContainer>
    <Card
      :loading="loading"
      :tab-list="tabListTitle"
      :active-tab-key="activeKey"
      @tab-change="onTabChange"
    >
      <YearElectricity
        v-if="Object.keys(chartDataMap).length > 0"
        :key="`${activeKey}_历年总计`"
        :data="chartTrendList"
        :xAxis="chartTrendX"
        title="历年总计"
      />
      <YearElectricity
        v-for="item in Object.keys(chartDataMap).sort().reverse()"
        :key="`${activeKey}_${item}`"
        :data="chartDataMap[item]"
        :title="`${item}年`"
      />
    </Card>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { Card } from 'ant-design-vue';
  import { list } from './service';
  import YearElectricity from './components/YearElectricity.vue';
  import { groupBy } from 'lodash-es';
  import { add } from '@sirpho/utils';

  const tableList = ref<any[]>([]);
  const loading = ref(false);

  const tabListTitle = ref<{ key: string; tab: string }[]>([]);
  const houseMap = ref<any>({});
  const activeKey = ref('');

  const chartDataMap = ref<any>({});
  const chartTrendList = ref<any[]>([]);
  const chartTrendX = ref<string[]>([]);

  onMounted(() => {
    handleQuery();
  });

  /**
   * 查询
   */
  const handleQuery = async () => {
    loading.value = true;
    const res = await list().finally(() => {
      loading.value = false;
    });
    tableList.value = res.data || [];
    const result = groupBy(tableList.value, 'house');

    for (const field in result) {
      result[field] = groupBy(result[field] || [], 'year');
    }

    tabListTitle.value = Object.keys(result)
      .map((item) => ({
        key: item,
        tab: item,
      }))
      .reverse();
    activeKey.value = tabListTitle.value.length > 0 ? tabListTitle.value[0].key : '';
    houseMap.value = result;

    onTabChange(activeKey.value);
  };

  /**
   * 切换tab
   * @param key
   */
  const onTabChange = (key: string) => {
    activeKey.value = key;
    if (key) {
      chartDataMap.value = houseMap.value[key];
    } else {
      chartDataMap.value = {};
    }
    const trendList = [];
    chartTrendX.value = Object.keys(chartDataMap.value).sort();
    for (const field of chartTrendX.value) {
      const list = chartDataMap.value[field];
      const power = list.reduce(
        (previousValue, currentValue) => add(previousValue, currentValue.power),
        0,
      );
      const cost = list.reduce(
        (previousValue, currentValue) => add(previousValue, currentValue.cost),
        0,
      );
      trendList.push({
        power,
        cost,
      });
    }
    chartTrendList.value = trendList;
  };
</script>
<script lang="ts">
  export default {
    name: 'ElectricityAnalysis',
  };
</script>
