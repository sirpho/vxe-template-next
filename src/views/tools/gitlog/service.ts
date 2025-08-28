import { defHttp } from '@/utils/http/axios';

/**
 * @description: 查询日志
 */
export const getLog = (data: any) => {
  return defHttp.get(
    {
      url: `http://gitlab.wahaha.com.cn:8090/api/v4/projects/${data.value}/repository/commits`,
      params: data,
      headers: {
        'private-token': 'nocfK6xy3cgoFB_wPm1c',
      },
    },
    {
      withToken: false,
      isReturnNativeResponse: true,
    },
  );
};
