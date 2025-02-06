import { defHttp } from '@/utils/http/axios';
import { hexToRGBA } from '@/utils/color';

enum Api {
  list = '/api/film/list',
}

/**
 * @description: 列表
 */
export const analysis = () => {
  return defHttp.post({ url: Api.list });
};

export const colors = [
  '#4D88CA',
  '#689ED5',
  '#84B5DF',
  '#A3CBEA',
  '#C5E1F4',
  '#A3CBEA',
  '#84B5DF',
  '#689ED5',
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
