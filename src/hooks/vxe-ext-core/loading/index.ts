import { ref, Ref } from 'vue';

export const useLoading = (initLoading: boolean = false) => {
  const loading: Ref<boolean> = ref(initLoading);

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  return { loading, setLoading };
};
