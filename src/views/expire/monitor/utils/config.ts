export const rules = {
  name: [
    {
      required: true,
      message: '请填写名称',
    },
  ],
  type: [
    {
      required: true,
      message: '请填写类别',
    },
  ],
  quantity: [
    {
      required: true,
      message: '请填写余量',
    },
  ],
  advanceWarning: [
    {
      required: true,
      message: '请选择是否开启临期预警',
    },
  ],
  expireDate: [
    {
      required: true,
      message: '请选择过期时间',
    },
    {
      validator: async (_rule: any, value: string) => {
        if (!/\d{4}-\d{2}-\d{2}/.test(value)) {
          return Promise.reject('格式错误');
        }
        return Promise.resolve();
      },
    },
  ],
  // cover: [
  //   {
  //     required: true,
  //     message: '请选择封面',
  //   },
  // ],
};

export const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

/**
 * 保质期单位
 */
export const shelfLifeUnitList = [
  {
    label: '年',
    value: 'year',
  },
  {
    label: '月',
    value: 'month',
  },
  {
    label: '日',
    value: 'day',
  },
];
