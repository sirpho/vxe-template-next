import { h } from 'vue';
import { Tooltip } from 'ant-design-vue';
import { ExclamationCircleTwoTone } from '@ant-design/icons-vue';
import { config } from '../init';

export const ERROR_RENDERER_NAME = '_Error_Renderer_ZjY9oVBPHPDc';

export const errorRenderer = (VXETable: any) => {
  VXETable.renderer.add(ERROR_RENDERER_NAME, {
    // 默认显示模板
    renderDefault(_renderOpts, params) {
      const { row, column } = params;
      const { params: _params } = column;
      const isExisted = _params.find((c: any) => c[config.idField] === row[config.idField]);
      if (isExisted) {
        return [
          h(Tooltip, { color: '#ff4d4f', title: isExisted[config.errorConfig.dataField] }, () =>
            h(
              'div',
              { style: { textAlign: 'center' } },
              h(ExclamationCircleTwoTone, { twoToneColor: 'red' }),
            ),
          ),
        ];
      }
      return [];
    },
    // 导出模板，例如导出插槽中自定义的内容
    exportMethod() {
      return '';
    },
  });
};
