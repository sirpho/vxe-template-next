import { useLoading } from '@/components/Loading';
import { reactive, watch } from 'vue';

interface Props {
  isOpen: boolean;
  count: number;
}

export const usePageLoading = () => {
  const [open, close] = useLoading({ absolute: true });

  const props = reactive<Props>({
    isOpen: false,
    count: 0,
  });

  const increase = () => {
    props.count += 1;
  };

  const decrease = () => {
    props.count -= 1;
  };

  watch(
    () => props.count,
    (v, ov) => {
      if (v >= 0 && props.isOpen === false) {
        open();
        props.isOpen = true;
      }
      if (v === 0 && ov === 1) {
        props.isOpen = false;
        close();
      }
    },
    // { deep: true },
  );

  return [increase, decrease];
};
