<template>
  <Card class="my_style" title="最新动态" v-bind="$attrs">
    <!-- <template #extra>
      <a-button type="link" size="small">更多</a-button>
    </template> -->
    <List item-layout="horizontal" :data-source="dynamicInfoItems">
      <template #renderItem="{ item }">
        <ListItem @click="() => to(item.href)">
          <ListItemMeta>
            <template #description>
              {{ item.date }}
            </template>
            <!-- eslint-disable-next-line -->
            <template #title>
              <span class="custom_pointer" v-html="item.desc"> </span>
            </template>
            <template #avatar>
              <Avatar
                :icon="item.icon"
                :src="item.src"
                :alt="item.icon"
                style="background-color: #1890ff"
              />
            </template>
          </ListItemMeta>
        </ListItem>
      </template>
    </List>
  </Card>
</template>
<script lang="ts" setup>
  import { Card, List, Avatar } from 'ant-design-vue';
  import { dynamicInfoItems } from './data';
  import { useGo } from '@/hooks/web/usePage';

  const go = useGo();

  const ListItem = List.Item;
  const ListItemMeta = List.Item.Meta;

  const to = (href?: string) => {
    const reg = /^http(s)?:\/\/.+/;
    if (!href) return;
    if (reg.test(href)) {
      window.open(href);
      return;
    }
    go(href);
  };
</script>
<style lang="scss" scoped>
  .custom_pointer:hover {
    color: #1890ff;
    cursor: pointer;
  }

  .my_style .new_icon {
    display: inline-block;
    color: red;
  }
</style>
