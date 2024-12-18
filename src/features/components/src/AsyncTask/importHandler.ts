import { useAsyncTaskStore } from './store';

export const importHandler = async (data) => {
  const asyncTaskStore = useAsyncTaskStore();
  asyncTaskStore.save(data);
};
