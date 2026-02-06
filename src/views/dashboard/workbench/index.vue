<template>
  <PageContainer>
    <VxeContainer>
      <div class="h-100% flex flex-col p-2">
        <Avatar :src="headerImg" :size="72" class="!mx-auto !block" />
        <ul class="event-wrapper md:mt-2 mt-4 mx-auto lg:w-400px lg:pl-40px">
          <li
            v-for="item in eventList"
            :key="item.name"
            class="md:text-lg mt-2 text-md"
            style="list-style-type: disc"
          >
            <span class="text-secondary text-sm mr-1"> {{ item.date }} </span>
            <span class="event text-2xl">{{ item.name }}</span>
            <span class="diff text-2xl">已经{{ item.difference }}啦~</span>
          </li>
        </ul>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import { Avatar } from 'ant-design-vue';
  import headerImg from '@/assets/images/header.jpg';
  import dayjs from 'dayjs';
  import { computed } from 'vue';
  import { VxeContainer, PageContainer } from '@sirpho/components';

  /**
   * 计算日期差值
   * @param targetDate
   */
  const calculateDateDifference = (targetDate) => {
    const start = dayjs(targetDate);
    const end = dayjs();

    // 计算年份差
    let years = end.diff(start, 'year');
    let adjustedDate = start.add(years, 'year');

    // 计算剩余月份差
    let months = end.diff(adjustedDate, 'month');
    adjustedDate = adjustedDate.add(months, 'month');

    // 计算剩余天数差（处理跨月天数不一致的情况）
    let days = end.diff(adjustedDate, 'day');
    if (days < 0) {
      months--;
      const lastMonthEnd = end.subtract(1, 'month').endOf('month');
      days = end.diff(lastMonthEnd, 'day') + 1;
    }

    // 如果月份为负，调整年份和月份
    if (months < 0) {
      years--;
      months += 12;
    }

    let result = '';
    if (years > 0) {
      result += years + '年';
    }
    if (months > 0) {
      result += months + '个月';
    }
    if (days > 0) {
      result += days + '天';
    }

    return result;
  };

  const eventData = [
    {
      name: '出生',
      date: '1995-10-15',
    },
    {
      name: '毕业',
      date: '2018-06-21',
    },
    {
      name: '结婚',
      date: '2022-02-22',
    },
    {
      name: '奇奇',
      date: '2023-03-16',
    },
  ];

  /**
   * 事件列表
   */
  const eventList = computed(() => {
    return eventData.map((item) => ({
      ...item,
      difference:
        item.name === '奇奇'
          ? calculateDateDifference(item.date).replace('年', '岁')
          : calculateDateDifference(item.date),
    }));
  });
</script>

<style lang="less" scoped>
  .event-wrapper {
    font-family: '上首呆呆体';
  }
</style>
