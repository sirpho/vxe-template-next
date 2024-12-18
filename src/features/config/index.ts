import { defHttp } from '@/utils/http/axios';
import { varients } from '@/features/config/consts';

/**
 * 多列下拉全局配置
 */
export const globalConfig: any = {
  http: null,
  varients: null,
  methods: null, //存储xTable中的公共方法
  env: {},
  setConfig(
    config: {
      http?: any;
      varients?: any;
      env?: any;
      methods?: (params: { [key: string]: any }) => object;
    } = {},
  ) {
    const { http, varients = {}, methods, env } = config;
    this.http = http;
    this.varients = varients;
    this.methods = methods;
    this.env = env;
  },
};

/**
 * vxeTable默认配置
 */
export const vxeTableDefaultConfig: any = {
  size: 'mini',
  table: {
    border: 'full',
    round: false,
    showHeader: true,
    keepSource: false,
    showOverflow: true,
    showHeaderOverflow: 'tooltip',
    showFooterOverflow: true,
    rowConfig: {
      isCurrent: true,
      isHover: true,
    },
    columnConfig: {
      resizable: true,
      minWidth: 110,
      useKey: true,
    },
    resizableConfig: {
      minWidth: 20,
    },
    autoResize: true,
    stripe: true,
    areaConfig: {
      extendByCopy: false,
      extendByCalc: false,
    },
    checkboxConfig: {
      isShiftKey: true,
    },
    scrollX: {
      enabled: true,
    },
    scrollY: {
      enabled: true,
    },
    keyboardConfig: {
      isClip: true,
      isMerge: false,
      isFNR: false,
      isEdit: true,
      isTab: true,
      isArrow: true,
      isEnter: true,
      isDel: true,
      isChecked: true,
      enterToTab: false,
    },
    mouseConfig: {
      selected: false,
      area: true,
    },
    editConfig: {
      // 双击编辑
      trigger: 'dblclick',
      // 编辑粒度 单元格
      mode: 'cell',
      // 展示新增标记
      showStatus: true,
    },
  },
};

export function registerVarient() {
  globalConfig.setConfig({ http: defHttp, varients });
}
