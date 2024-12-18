import { Modal } from 'ant-design-vue';
import { useAsyncTaskStore } from './store';

export type IAsyncTaskConfirm = {
  asyncCode: string;
  data: Record<string, any>;
  message: string;
};

export const exportHandler = (payload: IAsyncTaskConfirm) => {
  const { message, data: asyncReqJson, asyncCode } = payload;

  const asyncTaskStore = useAsyncTaskStore();

  Modal.confirm({
    title: '查询提醒',
    content: message,
    okText: '异步导出',
    cancelText: '取消',
    okButtonProps: { loading: false },
    onOk() {
      return new Promise(async (resolve, reject) => {
        // const [err, resp] = await to(save({ asyncCode, asyncReqJson }));
        const success = await asyncTaskStore.save({ asyncCode, asyncReqJson });
        if (success) {
          resolve(success);
        } else {
          reject();
        }
      }).catch(() => console.log('Oops errors!'));
    },
    onCancel: () => {},
  });
};
