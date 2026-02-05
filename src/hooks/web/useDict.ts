import { computed, ComputedRef } from 'vue';
import { onMountedOrActivated } from '@vben/hooks';
import { isArray } from '@sirpho/utils';
import { useDictStoreWithOut } from '@/store/modules/dict';
import { getDictOptions } from '@/api/dataSource';

export function useDict(val: string[]): ComputedRef<any[]>[] {
  const dict = useDictStoreWithOut();

  async function getDict() {
    let dictOptions: any[];
    if (isArray(val)) {
      for (let i = 0; i < val.length; i += 1) {
        const dictType = val[i];
        if (!dict[dictType] || dict[dictType].length <= 0) {
          dictOptions = await getDictOptions(dictType);
          dict.setDictData(dictType, dictOptions);
        }
      }
      return;
    }
  }

  onMountedOrActivated(() => {
    getDict();
  });

  const keys: string[] = val || [];
  return keys.map((key) =>
    computed(() => {
      return dict.data[key] || [];
    }),
  );
}
