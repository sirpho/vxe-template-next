import type { App } from 'vue';
import { Input, Button, Layout, Tooltip } from 'ant-design-vue';
import VXETable from 'vxe-table';
import './VxeTable';

export function registerGlobComponent(app: App) {
  app.use(Input).use(Button).use(Tooltip).use(Layout).use(VXETable);
}
