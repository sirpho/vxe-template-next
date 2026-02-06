import type { App } from 'vue';
import { Input, Button, Layout } from 'ant-design-vue';
import VXETable from 'vxe-table';
import './VxeTable';

export function registerGlobComponent(app: App) {
  app.use(Input).use(Button).use(Layout).use(VXETable);
}
