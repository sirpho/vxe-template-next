import { defHttp } from '@/utils/http/axios';
import { LoginParams, LoginResultModel } from './model/userModel';
import { ErrorMessageMode } from '#/axios';
import type { UserInfo } from '#/store';

enum Api {
  Login = '/api/user/login',
  GetMenuList = '/api/user/info',
  GetPermCode = '/getPermCode',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<Result<LoginResultModel>>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.post<Result<UserInfo>>({ url: Api.GetMenuList }, { errorMessageMode: 'none' });
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}
