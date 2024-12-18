import { defHttp } from '@/utils/http/axios';
import { AreaVO } from './typing';

enum Api {
  mtrlType = '/common/datasource/getMtrlType',
  area = '/common/datasource/getAuthorityArea',
  base = '/common/datasource/getAuthorityBase',
  company = '/common/datasource/getAuthorityCompany',
  factory = '/common/datasource/getAuthorityFactory',
  factory3nd = '/common/datasource/getAuthorityBaseFactory',
}

/**
 * @description: 获取登录用户的权限片区下拉源
 */
export const getAuthorityArea = (data = {}): Promise<Result<AreaVO[]>> => {
  return defHttp.post({ url: Api.area, data });
};

/**
 * @description: 获取所有基地
 */
export const getAllBase = (data = {}): Promise<Result<AreaVO[]>> => {
  return defHttp.post({ url: Api.base, data });
};

/**
 * @description: 获取所有公司
 */
export const getAllCompany = (data = {}): Promise<Result<AreaVO[]>> => {
  return defHttp.post({ url: Api.company, data });
};

/**
 * @description: 获取所有工厂
 */
export const getAllFactory = (data = {}): Promise<Result<AreaVO[]>> => {
  return defHttp.post({ url: Api.factory, data });
};

/**
 * @description 获取物料类型下拉
 * @param data
 * @returns @
 */
export const getMtrlType = (data = {}): Promise<Result<any>> => {
  return defHttp.post({ url: Api.mtrlType, data });
};

/**
 * @description 获取基地下的权限工厂
 * @param data
 * @returns @
 */
export const getAuthorityBaseFactory = (data = {}): Promise<Result<any>> => {
  return defHttp.post({ url: Api.factory3nd, data });
};

export const dataSource = {
  MTRL_TYPE: getMtrlType,
  AREA: getAuthorityArea,
  BASE: getAllBase,
  COMPANY: getAllCompany,
  FACTORY: getAllFactory,
};
