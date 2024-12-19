import { defHttp } from '@/utils/http/axios';
import { arrayFieldRepeat, isObject } from '@sirpho/utils';

enum Api {
  TAG = '/api/tag/utensil/list',
  COMMON = '/api/enum/query/',
}

/**
 * @description: 过期监控标签
 */
export const getTagList = (): Promise<Result<any[]>> => {
  return defHttp.get({ url: Api.TAG });
};

/**
 * @description: 通用枚举
 */
export const getCommonList = (params: { module: string }): Promise<Result<any[]>> => {
  return defHttp.get({ url: `${Api.COMMON}${params.module}` });
};

export function getDictOptions(dictCode) {
  return new Promise((resolve, reject) => {
    let operation;
    let valueKey = '';
    let nameKey = '';
    let mixLabel = true;
    // 排除重复项
    let excludeDuplicates = false;
    const params: {
      [key: string]: any;
    } = {
      limit: undefined,
    };
    switch (dictCode) {
      case 'TAG': // 标签
        operation = getTagList;
        nameKey = 'name';
        valueKey = 'id';
        excludeDuplicates = true;
        mixLabel = false;
        break;
      default: // 通用枚举
        operation = getCommonList;
        nameKey = 'name';
        valueKey = 'value';
        params.module = dictCode;
        excludeDuplicates = true;
        mixLabel = false;
        break;
    }
    if (!operation) {
      resolve([]);
    }
    operation(params)
      .then((res) => {
        let result = res.data || res.page || [];
        result = result?.list || result;
        const isObj = result.find((item) => isObject(item));
        if (isObj) {
          result = result.map((item) => ({
            ...item,
            label: mixLabel ? `${item[valueKey]}-${item[nameKey]}` : item[nameKey],
            value: item[valueKey] || undefined,
            name: item[nameKey] || undefined,
          }));
          if (excludeDuplicates) {
            result = arrayFieldRepeat(result);
          }
        }
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
