export const defaultConfig: any = {
  size: 'mini', // 全局尺寸
  // version: 0,
  table: {
    border: 'full',
    round: false,
    showHeader: true,
    keepSource: false,
    showOverflow: true,
    showHeaderOverflow: 'tooltip',
    showFooterOverflow: true,
    rowConfig: { isCurrent: true, isHover: true },
    columnConfig: { resizable: true, minWidth: 110, useKey: true },
    resizableConfig: { minWidth: 20 },
    autoResize: true,
    stripe: true,
    // areaConfig: {
    //   extendByCopy: false, // 启用后有效，将被选取区域的值复制到扩展区域中
    //   extendByCalc: false,
    // },
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
      isClip: true, // 是否开启（Ctrl + X 键、Ctrl + C 键、Ctrl + V 键）复制粘贴功能
      isMerge: false, // 是否开开启（Ctrl + M 键）合并和取消合并功能
      isFNR: false, // 是否开启（Ctrl + F 键、Ctrl + H 键）查找和替换功能
      isEdit: true, // 是否开启（Esc 键、F2 键、任意键）单元格编辑功能
      isTab: true, // 是否开启（Tab 键、Shift + Tab 键）单元格左右移动功能
      isArrow: true, // 是否开启（方向键）单元格上下左右移动功能
      isEnter: true, // 是否开启（Enter 键、Shift + Enter 键）单元格上下移动功能
      isDel: true, // 是否开启（Delete 键、Backspace 键）清空单元格的值
      isChecked: true, // 是否开启（Space 键）切换复选框和单选框状态
      enterToTab: false, // 是否将回车键行为改成 Tab 键行为
    },
    // mouseConfig: { selected: false, area: true },
    editConfig: { trigger: 'dblclick', mode: 'cell', showStatus: true },
  },
};
