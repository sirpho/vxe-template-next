<template>
  <Popover
    :visible="asyncTaskStore.getVisible"
    :title="title"
    trigger="click"
    :overlay-style="{ width: '360px' }"
    @visible-change="change"
    :overlayClassName="`${prefixCls}`"
  >
    <Badge>
      <cloud-sync-outlined style="color: #fff; font-size: 16px" />
    </Badge>
    <template #content>
      <div v-if="asyncTaskStore.mode === 'list'">
        <RadioGroup :value="asyncTaskStore.getAsyncType" size="small" @change="radioChange">
          <RadioButton v-for="item in TASK_TYPE" :key="item" :value="item">{{ item }}</RadioButton>
        </RadioGroup>
      </div>

      <List
        size="small"
        :data-source="asyncTaskStore.getData"
        :pagination="pagination"
        :loading="asyncTaskStore.getLoading"
      >
        <template #renderItem="{ item }">
          <ListItem key="item.title">
            <div style="width: 100%">
              <Alert show-icon type="success" v-if="item.taskStatus === TASK_STATUS.success">
                <template #message>
                  <div class="flex">
                    <TypographyParagraph
                      style=" flex: 1; width: 100%;margin-bottom: 0"
                      :ellipsis="{ rows: 1, tooltip: `${item.taskStatus}：${item.errMsg}` }"
                      :content="
                        !item.errMsg ? item.taskStatus : `${item.taskStatus}：${item.errMsg}`
                      "
                    />
                    <TypographyLink :href="item.fileUrl" target="_blank">下载</TypographyLink>
                  </div>
                </template>
              </Alert>
              <Alert show-icon type="error" v-else-if="item.taskStatus === TASK_STATUS.failure">
                <template #message>
                  <TypographyParagraph
                    style="margin-bottom: 0"
                    :ellipsis="{ rows: 1, tooltip: `${item.taskStatus}：${item.errMsg}` }"
                    :content="`${item.taskStatus}：${item.errMsg}`"
                  />
                </template>
              </Alert>
              <Alert show-icon type="info" v-else>
                <template #message>
                  {{ item.taskStatus }}
                </template>
              </Alert>
              <Row style="margin: 0.5em 0 0.25em">
                <Col :span="16">
                  <Tooltip :title="item.fileName">
                    <TypographyText strong>{{ handleFileName(item.fileName) }}</TypographyText>
                  </Tooltip>
                </Col>
                <Col :span="8">
                  <Progress
                    v-if="item.taskStatus === TASK_STATUS.pending"
                    :percent="item.progressRate"
                    size="small"
                    status="active"
                  />
                  <Progress
                    v-if="item.taskStatus === TASK_STATUS.success"
                    :percent="item.progressRate"
                    size="small"
                  />
                  <Progress
                    v-if="item.taskStatus === TASK_STATUS.failure"
                    :percent="item.progressRate"
                    size="small"
                    status="exception"
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TypographyText type="secondary" style="font-size: 13px">
                    {{ item.asyncTaskType }}时间：{{ item.queryTime }}
                  </TypographyText>
                </Col>
                <Col :span="24">
                  <TypographyText type="secondary" style="font-size: 13px"
                    >完成时间：{{ item.finishTime }}</TypographyText
                  >
                </Col>
              </Row>
            </div>
          </ListItem>
        </template>
      </List>
    </template>
  </Popover>
</template>

<script lang="ts" setup>
  import { onMounted, nextTick, computed } from 'vue';
  import { split, last, truncate } from 'lodash-es';
  import {
    Popover,
    Badge,
    List,
    ListItem,
    Alert,
    TypographyText,
    Row,
    Col,
    Progress,
    RadioButton,
    TypographyLink,
    TypographyParagraph,
    Tooltip,
  } from 'ant-design-vue';
  import { CloudSyncOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useAsyncTaskStore } from './store';

  const TASK_STATUS = {
    waiting: '待执行',
    pending: '执行中',
    success: '成功',
    failure: '失败',
  };

  const TASK_TYPE = ['全部', '导出', '导入', '执行'];

  const asyncTaskStore = useAsyncTaskStore();

  const pagination = computed(() => {
    const mode = asyncTaskStore.getMode;
    if (mode !== 'list') return false;
    return {
      ...asyncTaskStore.getPagination,
      onChange(v) {
        asyncTaskStore.setPagination({ current: v });
        nextTick(() => {
          change(true);
        });
      },
    };
  });

  const title = computed(() => {
    const mode = asyncTaskStore.getMode;
    if (mode !== 'list') return false;
    return '异步任务清单';
  });

  const { prefixCls } = useDesign('header-async-task');

  const handleFileName = (name: string) => {
    const splitName = split(name, '.');
    const suffix = last(splitName);
    const [l1] = splitName;
    let n = l1;
    if (l1.length > 16) {
      const sub = l1.substring(l1.length - 6);
      n = truncate(n, { length: 10, omission: '..' }) + sub;
    }
    return `${n}.${suffix}`;
  };

  const change = async (visible: boolean) => {
    asyncTaskStore.setVisible(visible);
    if (!visible) return;
    asyncTaskStore.list();
  };

  const radioChange = ({ target }) => {
    const { value } = target;
    asyncTaskStore.setAsyncType(value);
    nextTick(() => {
      change(true);
    });
  };

  onMounted(async () => {});
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-header-async-task';

  :deep(.ant-alert-message) {
    max-width: 300px;
  }

  :deep(.ant-scroll-number) {
    top: 7px;
    transform: scale(0.5);
  }

  :deep(.ant-popover-title) {
    padding: 5px 8px 4px;
  }

  :deep(.ant-list-pagination) {
    margin-top: 10px;
  }

  .@{prefix-cls} {
    .ant-radio-group {
      padding: 3px;
      border-radius: 2px;
      background: #f2f3f5;

      .ant-radio-button-wrapper {
        height: 22px;
        border-width: 0;
        border-radius: 2px;
        background: unset;
      }

      .ant-radio-button-wrapper::before {
        display: none;
      }

      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
        box-shadow: unset;
      }

      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
        outline: none;
        background: #fff;
      }
    }

    .ant-list-sm .ant-list-item {
      padding: 8px 0 4px;
    }

    .ant-alert {
      padding: 2px 6px;
    }

    .ant-popover-inner-content {
      padding: 0 8px;
    }
  }
</style>
