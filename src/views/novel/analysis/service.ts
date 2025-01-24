import { defHttp } from '@/utils/http/axios';
import { hexToRGBA } from '@/utils/color';

enum Api {
  list = '/api/novel/list',
}

/**
 * @description: 列表
 */
export const analysis = () => {
  return defHttp.post({ url: Api.list });
};

export const colors = [
  '#2D584B',
  '#487969',
  '#689B88',
  '#8DBCA9',
  '#B8DECD',
  '#8DBCA9',
  '#689B88',
  '#487969',
];

export const getLinearColorList = () => {
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
