import { defineStore } from 'pinia';
import { message } from 'ant-design-vue';
import to from 'await-to-js';
import { list, save } from './server';
import type { PaginationProps } from 'ant-design-vue';

type IMode = 'create' | 'list';
type IAsyncType = '全部' | '导出' | '导入' | '执行';

interface AsyncTaskState {
  mode: IMode;
  visible: boolean; // Popover 显隐状态
  loading: boolean; // Popover List 加载状态
  data: any[]; // Popover List 数据
  pagination: PaginationProps;
  asyncType: IAsyncType;
}

export const useAsyncTaskStore = defineStore({
  id: 'async-task',
  state: (): AsyncTaskState => ({
    mode: 'list',
    visible: false,
    loading: false,
    data: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 4,
      size: 'small',
    },
    asyncType: '全部',
  }),
  getters: {
    getMode(): IMode {
      return this.mode;
    },
    getVisible(): boolean {
      return this.visible;
    },
    getLoading(): boolean {
      return this.loading;
    },
    getData(): any[] {
      return this.data;
    },
    getAsyncType(): IAsyncType {
      return this.asyncType;
    },
    getPagination(): PaginationProps {
      return this.pagination;
    },
  },
  actions: {
    setVisible(v: boolean) {
      this.visible = v;
    },

    setMode(v: IMode) {
      this.mode = v;
    },

    setAsyncType(v: IAsyncType) {
      this.pagination = { ...this.pagination, current: 1 };
      this.asyncType = v;
    },

    setPagination(v: PaginationProps) {
      this.pagination = { ...this.pagination, ...v };
    },

    async list() {
      this.mode = 'list';
      this.visible = true;
      this.loading = true;
      const { pageSize, current } = this.pagination;
      const [err, resp] = await to(
        list({
          ...this.pagination,
          asyncType: this.asyncType,
          pageSize: pageSize,
          pageNumber: current,
        }),
      );
      this.loading = false;
      if (err) return;
      const { data } = resp;
      this.data = data?.list;
      this.pagination = { ...this.pagination, total: data?.total, current: data?.current };
    },

    async save(params: { asyncCode: string; asyncReqJson: any }): Promise<boolean> {
      this.mode = 'create';
      this.loading = true;
      const [err, resp] = await to(save(params));
      this.loading = false;
      if (err) return false;
      if (!resp.success) return false;
      this.visible = true;
      this.data = [resp.data];
      message.success('异步任务添加成功，请前往异步任务中心查看进度');
      return true;
    },
  },
});

// Need to be used outside the setup
