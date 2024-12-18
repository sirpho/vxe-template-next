import { debounce } from 'lodash-es';
import { Ref, ref } from 'vue';

import { onMountedOrActivated } from './onMountedOrActivated';
import { useWindowSizeFn } from './useWindowSizeFn';

interface IUseCalcHeight {
  height: Ref;
  calcHeight: Function;
}

const useCalcHeight = (elementId: string, minHeight = 100): IUseCalcHeight => {
  const height = ref<number>(300);

  const calcHeight = () => {
    const content = document.getElementById(elementId) as HTMLElement;
    const clientHeight = document.body.clientHeight;
    // The distance from the table content to the top
    let contentTop = 0;
    if (!content) {
      console.warn('vxe ext core useCalcHeight DOM is null');
      return;
    }
    contentTop = content.getBoundingClientRect().top;
    const h = clientHeight - contentTop - 8;
    height.value = h < minHeight ? minHeight : h;
  };

  useWindowSizeFn(debounce(calcHeight, 300) as any);

  onMountedOrActivated(() => {
    calcHeight();
  });
  return { height, calcHeight };
};

export { useCalcHeight };
