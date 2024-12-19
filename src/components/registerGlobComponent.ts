import type { App } from 'vue';
import { Input, Button, Layout } from 'ant-design-vue';
import VXETable from 'vxe-table';
import { ComboBox, ModalBox } from '@/components/Box';
import { PageContainer, QueryFilterContainer, VxeContainer } from '@/components/Layout';

import './VxeTable';

export function registerGlobComponent(app: App) {
  app
    .use(Input)
    .use(Button)
    .use(Layout)
    .use(VXETable)
    .use(ComboBox)
    .use(ModalBox)
    .use(PageContainer)
    .use(QueryFilterContainer)
    .use(VxeContainer);
}
