// https://vxetable.cn/#/start/theme

const presetLightStyle = `
  /* base */
  --vxe-ui-font-color: rgba(0, 0, 0, 0.88);
  --vxe-ui-font-size-mini: 14px;

  --vxe-ui-row-line-height: 22px;
  --vxe-ui-row-height-mini: 32px;

  --vxe-ui-table-column-padding-mini: 5px 0;

  --vxe-ui-table-cell-padding-left: 6px;
  --vxe-ui-table-cell-padding-right: 6px;

  /* table */
  --vxe-ui-table-header-background-color: #fafafa;
  --vxe-ui-table-border-color: #f0f0f0;
  --vxe-ui-table-row-hover-background-color: #bae0ff;

  --vxe-ui-table-row-striped-background-color: #fafafa;
  --vxe-ui-table-row-hover-striped-background-color: #bae0ff;

  --vxe-ui-table-row-current-background-color: #bae0ff;
  --vxe-ui-table-row-hover-current-background-color: #bae0ff;
`;

const presetDarkStyle = ``;

export type Code = {
  light?: string;
  dark?: string;
};

export const useCustomStyle = (code: Code = { light: '', dark: '' }) => {
  const injectStyle = () => {
    const style = document.createElement('style');
    style.id = 'vxe-custom-style';
    style.type = 'text/css';
    try {
      style.appendChild(
        document.createTextNode(
          `html[data-vxe-ui-theme="light"]{${presetLightStyle}${code.light || ''}}`,
        ),
      );
      style.appendChild(
        document.createTextNode(
          `html[data-vxe-ui-theme="dark"]{${presetDarkStyle}${code.dark || ''}}`,
        ),
      );
    } catch (ex) {
      /* empty */
    }
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
  };
  return [injectStyle];
};
