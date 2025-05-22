import { message } from 'ant-design-vue';
import { watch } from 'vue';
import { useLoading } from '../loading';

export function useAsyncUpdateData(options?: { onLoadingChange?: (v: boolean) => void }) {
  const { loading, setLoading } = useLoading();

  const asyncUpdateData = async <Data>(
    promise: () => Promise<Data>,
    opts: {
      fallback?: boolean;
      onSuccess?: (v: any) => void;
      onFailure?: (v: any) => void;
      onError?: (v: any) => void;
    },
  ) => {
    const { fallback = true, onSuccess, onFailure, onError } = opts;
    const isFn = typeof promise === 'function';
    if (!isFn) throw Error('promise must be a function');
    setLoading(true);
    try {
      const resp = await promise();
      const { success, data } = resp as any;
      if (success) {
        onSuccess && onSuccess(data);
        fallback && message.success('操作成功');
      } else {
        onFailure && onFailure(data);
      }
    } catch (err) {
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  watch(loading, (value) => {
    options?.onLoadingChange?.(value);
  });

  return { loading, asyncUpdateData };
}
