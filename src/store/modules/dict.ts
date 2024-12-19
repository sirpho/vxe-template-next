import { defineStore } from 'pinia';
import { store } from '@/store';
import { reactive, toRefs } from 'vue';

interface DictState {
  data: Record<string, any>;
}

export const useDictStore = defineStore('dict', () => {
  const state = reactive({
    data: {},
  } as DictState);

  const setDictData = (type, value) => {
    state.data[type] = value;
  };
  const clearDictData = () => {
    state.data = {};
  };

  return {
    ...toRefs(state),
    setDictData,
    clearDictData,
  };
});

// Need to be used outside the setup
export function useDictStoreWithOut() {
  return useDictStore(store);
}
