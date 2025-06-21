import tinycolor from 'tinycolor2';

/**
 * 判断是否十六进制颜色值.
 * 输入形式可为 #fff000 #f00
 *
 * @param   color string     十六进制颜色值
 * @return  Boolean
 */
export function isHexColor(color: string) {
  const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return reg.test(color);
}

/**
 * RGB 颜色值转换为十六进制颜色值.
 * r, g, 和 b 需要在 [0, 255] 范围内
 *
 * @param r 红色值
 * @param g 绿色值
 * @param b 蓝色值
 * @return String 类似#ff00ff的十六进制颜色值
 */
export function rgbToHex(r: number, g: number, b: number) {
  // tslint:disable-next-line:no-bitwise
  const hex = ((r << 16) | (g << 8) | b).toString(16);
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
}

/**
 * 将HEX颜色转换为RGB表示形式
 * @param {string} hex 要转换的颜色
 * @returns 传入颜色的RGB表示形式
 */
export function hexToRGB(hex: string) {
  let sHex = hex.toLowerCase();
  if (isHexColor(hex)) {
    if (sHex.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sHex.slice(i, i + 1).concat(sHex.slice(i, i + 1));
      }
      sHex = sColorNew;
    }
    const sColorChange: number[] = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sHex.slice(i, i + 2)));
    }
    return 'RGB(' + sColorChange.join(',') + ')';
  }
  return sHex;
}

/**
 * 16进制颜色转为rgba格式
 * @param hex 十六进制颜色值
 * @param alpha 透明度
 * @returns rgba格式颜色字符串
 */
export function hexToRGBA(hex: string, alpha: number) {
  let sHex = hex.toLowerCase();
  if (isHexColor(hex)) {
    if (sHex.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sHex.slice(i, i + 1).concat(sHex.slice(i, i + 1));
      }
      sHex = sColorNew;
    }
    const sColorChange: number[] = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sHex.slice(i, i + 2)));
    }
    return `RGBA(${sColorChange.join(',')}, ${alpha})`;
  }
  return sHex;
}

/**
 * 判断颜色是否为深色
 * @param color 十六进制颜色值
 * @returns 如果是深色返回true，否则返回false
 */
export function colorIsDark(color: string) {
  if (!isHexColor(color)) return;
  const [r, g, b] = hexToRGB(color)
    .replace(/(?:\(|\)|rgb|RGB)*/g, '')
    .split(',')
    .map((item) => Number(item));
  return r * 0.299 + g * 0.578 + b * 0.114 < 192;
}

/**
 * 根据给定百分比加深HEX颜色
 * @param {string} color 要处理的颜色
 * @param {number} amount 颜色变化的量
 * @returns {string} 处理后颜色的HEX表示
 */
export function darken(color: string, amount: number) {
  color = color.indexOf('#') >= 0 ? color.substring(1, color.length) : color;
  amount = Math.trunc((255 * amount) / 100);
  return `#${subtractLight(color.substring(0, 2), amount)}${subtractLight(
    color.substring(2, 4),
    amount,
  )}${subtractLight(color.substring(4, 6), amount)}`;
}

/**
 * 根据给定百分比减淡HEX颜色
 * @param {string} color 要改变的颜色
 * @param {number} amount 颜色变化的量
 * @returns {string} 处理后颜色的HEX表示
 */
export function lighten(color: string, amount: number) {
  color = color.indexOf('#') >= 0 ? color.substring(1, color.length) : color;
  amount = Math.trunc((255 * amount) / 100);
  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount,
  )}${addLight(color.substring(4, 6), amount)}`;
}

/**
 * 将指定百分比添加到HEX颜色的R、G或B分量上
 * @param {string} color 要改变的颜色
 * @param {number} amount 变化的量
 * @returns {string} 处理后的颜色分量
 */
function addLight(color: string, amount: number) {
  const cc = parseInt(color, 16) + amount;
  const c = cc > 255 ? 255 : cc;
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`;
}

/**
 * 计算RGB颜色的亮度
 * @param {number} r 红色值
 * @param {number} g 绿色值
 * @param {number} b 蓝色值
 * @returns {number} 亮度值
 */
function luminanace(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * 计算两种RGB颜色之间的对比度
 * @param {string} rgb1 RGB颜色1
 * @param {string} rgb2 RGB颜色2
 * @returns {number} 对比度值
 */
function contrast(rgb1: string[], rgb2: number[]) {
  return (
    (luminanace(~~rgb1[0], ~~rgb1[1], ~~rgb1[2]) + 0.05) /
    (luminanace(rgb2[0], rgb2[1], rgb2[2]) + 0.05)
  );
}

/**
 * 根据与背景的对比度确定最佳文本颜色（黑色或白色）
 * @param hexColor 用户最后选择的颜色
 * @returns 最佳文本颜色（#000000或#FFFFFF）
 */
export function calculateBestTextColor(hexColor: string) {
  if (!hexColor) {
    return '#000000';
  }
  const rgbColor = hexToRGB(hexColor.substring(1));
  const contrastWithBlack = contrast(rgbColor.split(','), [0, 0, 0]);

  return contrastWithBlack >= 12 ? '#000000' : '#FFFFFF';
}

/**
 * 从HEX颜色的R、G或B分量中减去指定百分比
 * @param {string} color 要改变的颜色
 * @param {number} amount 变化的量
 * @returns {string} 处理后的颜色分量
 */
function subtractLight(color: string, amount: number) {
  const cc = parseInt(color, 16) - amount;
  const c = cc < 0 ? 0 : cc;
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

// 颜色从1-10，主色为第6个，前面有5个浅色，后面有4个深色
const hueStep = 2; // 色相阶梯
const topColorCount = 5; // 主色前数量，浅色部分
const behindColorCount = 4; // 主色后数量，深色部分
const topSaturationStep = 0.16; // 饱和度阶梯，主色前(浅色部分)
const behindSaturationStep = 0.05; // 饱和度阶梯，主色后(深色部分)
const topBrightnessLightStep = 0.05; // 亮度阶梯，主色前(浅色部分)
const behindBrightnessStep = 0.15; // 亮度阶梯，主色后(深色部分)

/**
 * 获取色相
 * @param hsv 主色hsv
 * @param i index
 * @param isTop 是否为主色前，主色前为浅色
 * @returns 色相
 */
const getHue = (hsv: HSV, i: number, isTop?: boolean): number => {
  let hue: number;

  // H: [60, 240]为暖色调，其他为冷色调
  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    // 主色为冷色调
    // 1-10色相变化 => 色相从小到大 => 色相逆时针旋转 => 更冷
    hue = isTop ? Math.round(hsv.h) - hueStep * i : Math.round(hsv.h) + hueStep * i;
  } else {
    // 主色为暖色调
    // 1-10色相变化 => 色相从大到小 => 色相顺时针旋转 => 更暖
    hue = isTop ? Math.round(hsv.h) + hueStep * i : Math.round(hsv.h) - hueStep * i;
  }

  (hue < 0 || hue >= 360) && (hue = Math.abs(Math.abs(hue) - 360));

  return hue;
};

/**
 * 获取饱和度
 * 1-10饱和度变化 => 饱和度从小到大
 * @param hsv 主色hsv
 * @param i index
 * @param isTop 是否为主色前，主色前为浅色
 * @returns 饱和度
 */
const getSaturation = (hsv: HSV, i: number, isTop?: boolean): number => {
  // 不改变灰色的饱和度
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }

  let saturation: number = isTop ? hsv.s - topSaturationStep * i : hsv.s + behindSaturationStep * i;

  saturation > 1 && (saturation = 1);
  saturation < 0.06 && (saturation = 0.06);

  // 主色前1个饱和度限制在 0.06-0.1 之间
  if (isTop && i === topColorCount && saturation > 0.1) {
    saturation = 0.1;
  }

  return Number(saturation.toFixed(2));
};

/**
 * 获取明度
 * HSV中V控制纯色中混入黑色的量，量越大，黑色越少，明度越高
 * 1-10明度变化 => 明度从大到小 => 明度越来越小
 * @param hsv 主色hsv
 * @param i index
 * @param isTop 是否为主色前，主色前为浅色
 * @returns 明度
 */
const getValue = (hsv: HSV, i: number, isTop?: boolean): number => {
  let value: number;

  value = isTop ? hsv.v + topBrightnessLightStep * i : hsv.v - behindBrightnessStep * i;

  value > 1 && (value = 1);

  return Number(value.toFixed(2));
};

/**
 * 根据给定的颜色生成若干阶梯色
 * @param primaryColor 主色
 * @returns 生成的阶梯色数组
 */
export const generateStepColor = (primaryColor: string): string[] => {
  const colors: string[] = [];
  const hsv = tinycolor(primaryColor).toHsv();

  // 主色前
  for (let i = topColorCount; i > 0; i -= 1) {
    const color = tinycolor({
      h: getHue(hsv, i, true),
      s: getSaturation(hsv, i, true),
      v: getValue(hsv, i, true),
    }).toHexString();

    colors.push(color);
  }

  // 主色
  colors.push(primaryColor);

  // 主色后
  for (let i = 1; i <= behindColorCount; i += 1) {
    const color = tinycolor({
      h: getHue(hsv, i),
      s: getSaturation(hsv, i),
      v: getValue(hsv, i),
    }).toHexString();

    colors.push(color);
  }

  return colors.reverse();
};

/**
 * 生成echarts渐变色
 * @param primaryColor 主色
 * @returns 渐变色数组
 */
export const getLinearColorList = (primaryColor: string) => {
  const stepColor = generateStepColor(primaryColor);
  const colors = stepColor.slice(4, 8).concat(stepColor.slice(5, 7).reverse());
  const result: any[] = [];
  colors.forEach((item) => {
    result.push({
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: hexToRGBA(item, 0.6),
        },
        {
          offset: 1,
          color: hexToRGBA(item, 1),
        },
      ],
    });
  });
  return result;
};
