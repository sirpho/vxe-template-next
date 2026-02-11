/**
 * 获取元素的padding
 * @param el
 */
export const getPadding = (el: HTMLElement) => {
  const style = window.getComputedStyle(el, null);
  const paddingLeft = Number.parseInt(style.paddingLeft, 10) || 0;
  const paddingRight = Number.parseInt(style.paddingRight, 10) || 0;
  const paddingTop = Number.parseInt(style.paddingTop, 10) || 0;
  const paddingBottom = Number.parseInt(style.paddingBottom, 10) || 0;
  return {
    left: paddingLeft,
    right: paddingRight,
    top: paddingTop,
    bottom: paddingBottom,
  };
};
