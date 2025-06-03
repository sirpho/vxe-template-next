import { rules, formItemLayout, shelfLifeUnitList } from '../utils/config';
import { useForm } from 'ant-design-vue/es/form';
import dayjs from 'dayjs';
import { defineComponent, reactive, unref } from 'vue';
import { getInfo, update } from '../service';
import { BasicModal } from '@/components/Modal';
import {
  message,
  Form,
  Input,
  Button,
  InputNumber,
  Row,
  Col,
  DatePicker,
  Select,
  FormItem,
  Textarea,
  RadioGroup,
  RadioButton,
  Radio,
} from 'ant-design-vue';
import './index.less';
import { useDict } from '@/hooks/web/useDict';
import FileUploader from '@/components/FileUploader';
import AvatarUploader from '@/components/AvatarUploader';

export default defineComponent({
  emits: ['handleOk'],
  setup(_props, { expose, emit }) {
    const state = reactive({
      modalTitle: '',
      visible: false,
      isFail: false,
      spinning: false,
      skeletonLoading: false,
      disabled: false,
      pickerVisible: false,
      type: 'watch' as 'add' | 'edit' | 'watch',
    });

    const formState: any = reactive({
      id: undefined,
      advanceDays: undefined,
      cover: '',
      advanceWarning: 'N',
      shelfLife: undefined,
      shelfLifeUnit: 'month',
      location: undefined,
      name: undefined,
      memo: undefined,
      quantity: 1,
      productionDate: undefined,
      expireDate: undefined,
      tags: [],
      type: '药品',
      unit: '盒',
    });
    const [tagList, unitList, typeList] = useDict([
      'TAG', // 标签列表
      'UNIT', // 单位列表
      'TYPE', // 类别列表
    ]);

    const rulesRef = reactive({ ...rules });

    const { resetFields, validate, validateInfos } = useForm(formState, rulesRef);

    /**
     * 恢复数据到初始化状态
     */
    const resetModalState = () => {
      state.isFail = false;
      state.spinning = false;
      state.visible = false;
      state.skeletonLoading = false;
      resetFields();
    };

    /**
     * 新增
     */
    const open = () => {
      state.modalTitle = '新增';
      state.type = 'add';
      state.disabled = false;
      state.visible = true;
    };

    /**
     * 编辑
     */
    const edit = async (record: any) => {
      state.modalTitle = '编辑';
      state.type = 'edit';
      state.disabled = false;
      state.visible = true;
      await getDetail(record);
    };

    /**
     * 查看
     */
    const watch = async (record: any) => {
      state.modalTitle = '查看';
      state.type = 'watch';
      state.disabled = true;
      state.visible = true;
      await getDetail(record);
    };

    /**
     * 获取数据
     */
    const getDetail = async (record: any) => {
      state.skeletonLoading = true;
      const res = await getInfo(record).finally(() => {
        state.skeletonLoading = false;
      });
      if (res.code === 200) {
        const result = res.data || {};
        Object.keys(formState).forEach((key) => {
          switch (key) {
            case 'expireDate':
              formState[key] = result[key]
                ? dayjs(new Date(result[key])).format('YYYY-MM-DD')
                : undefined;
              break;
            default:
              formState[key] = result[key];
          }
        });
      }
    };

    /**
     * 确定
     */
    const handleOk = () => {
      validate().then(async () => {
        state.spinning = true;
        const res = await update({
          ...formState,
        }).finally(() => {
          state.spinning = false;
        });
        if (res && res.code === 200) {
          message.success('操作成功！');
          emit('handleOk');
          handleCancel();
        } else {
          message.error(res.msg || '操作异常！');
        }
      });
    };

    /**
     * 关闭弹窗
     */
    const handleCancel = () => {
      resetModalState();
    };

    /**
     * 上传文件回调
     * @param fileList
     */
    const handleChangeFile = (fileList: any[]) => {
      formState.fileList = fileList;
    };

    /**
     * 计算过期时间
     */
    const handleCalculateExpirationDate = () => {
      const shelfLife = formState.shelfLife;
      const shelfLifeUnit = formState.shelfLifeUnit;
      const productionDate = formState.productionDate;
      if (!shelfLife || !shelfLifeUnit || !productionDate) {
        return;
      }
      formState.expireDate = dayjs(new Date(productionDate))
        .add(shelfLife, shelfLifeUnit)
        .format('YYYY-MM-DD');
    };

    /**
     * 暴露组件内部的方法
     */
    expose({
      open,
      edit,
      watch,
    });

    return () => {
      return (
        <div>
          <BasicModal
            title={state.modalTitle}
            open={state.visible}
            isFail={state.isFail}
            spinning={state.spinning}
            skeletonLoading={state.skeletonLoading}
            onCancel={() => handleCancel()}
            class={'monitor-modal'}
            type="fixed"
            width="600px"
            v-slots={{
              footer: () => {
                if (state.type === 'watch') {
                  return (
                    <div class="gx-pro-modal-footer">
                      <Button key="cancel" disabled={state.spinning} onClick={handleCancel}>
                        关闭
                      </Button>
                    </div>
                  );
                } else {
                  return (
                    <div class="gx-pro-modal-footer">
                      <Button
                        loading={state.spinning}
                        key="submit"
                        type="primary"
                        onClick={() => handleOk()}
                      >
                        确定
                      </Button>
                      <Button key="cancel" disabled={state.spinning} onClick={handleCancel}>
                        取消
                      </Button>
                    </div>
                  );
                }
              },
            }}
          >
            <Form model={formState} {...formItemLayout}>
              <Row>
                <Col span={24}>
                  <FormItem label="名称" {...validateInfos.name}>
                    <Input
                      v-model:value={formState.name}
                      disabled={state.disabled}
                      placeholder="请填写名称"
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="封面" {...validateInfos.cover}>
                    <AvatarUploader
                      v-model:value={formState.cover}
                      accept={'image/*'}
                      disabled={state.disabled}
                      data={{ obs: 'Y' }}
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="类别" {...validateInfos.type}>
                    <RadioGroup
                      v-model:value={formState.type}
                      disabled={state.disabled}
                      button-style="solid"
                      name={'advanceWarning'}
                    >
                      {unref(typeList || [])?.map((item) => (
                        <Radio
                          key={item.value}
                          value={item.value}
                          label={item.label}
                          name={item.name}
                        >
                          {item.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="余量" {...validateInfos.quantity}>
                    <InputNumber
                      v-model:value={formState.quantity}
                      disabled={state.disabled}
                      placeholder="请填写余量"
                      style="width: 100%"
                      min={0.0}
                      max={99999}
                      precision={2}
                      v-slots={{
                        addonAfter: () => {
                          return (
                            <Select
                              v-model:value={formState.unit}
                              disabled={state.disabled}
                              placeholder="单位"
                            >
                              {unref(unitList || [])?.map((item) => (
                                <Select.Option
                                  key={item.value}
                                  value={item.value}
                                  label={item.label}
                                  name={item.name}
                                >
                                  {item.label}
                                </Select.Option>
                              ))}
                            </Select>
                          );
                        },
                      }}
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="标签" {...validateInfos.tags}>
                    <Select
                      v-model:value={formState.tags}
                      disabled={state.disabled}
                      placeholder="请选择标签"
                      mode={'tags'}
                      optionFilterProp="label"
                      showSearch
                    >
                      {unref(tagList || [])?.map((item) => (
                        <Select.Option
                          key={item.value}
                          value={item.name}
                          label={item.label}
                          name={item.name}
                        >
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="存放地点" {...validateInfos.location}>
                    <Input
                      v-model:value={formState.location}
                      disabled={state.disabled}
                      placeholder="请填写存放地点"
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="备注" {...validateInfos.memo}>
                    <Textarea
                      v-model:value={formState.memo}
                      disabled={state.disabled}
                      auto-size={{ minRows: 3, maxRows: 5 }}
                      maxLength={255}
                      placeholder="备注"
                    />
                  </FormItem>
                </Col>

                <Col span={24}>
                  <FormItem label="生产日期" {...validateInfos.productionDate}>
                    <DatePicker
                      v-model:value={formState.productionDate}
                      disabled={state.disabled}
                      style="width: 100%"
                      placeholder="生产日期"
                      format="YYYY-MM-DD"
                      valueFormat="YYYY-MM-DD"
                      onChange={() => handleCalculateExpirationDate()}
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="保质期" {...validateInfos.shelfLife}>
                    <InputNumber
                      v-model:value={formState.shelfLife}
                      disabled={state.disabled}
                      placeholder="保质期"
                      style="width: 100%"
                      min={0}
                      max={99999}
                      precision={0}
                      onChange={() => handleCalculateExpirationDate()}
                      v-slots={{
                        addonAfter: () => {
                          return (
                            <Select
                              v-model:value={formState.shelfLifeUnit}
                              disabled={state.disabled}
                              placeholder="单位"
                              onChange={() => handleCalculateExpirationDate()}
                            >
                              {shelfLifeUnitList.map((item) => (
                                <Select.Option
                                  key={item.value}
                                  value={item.value}
                                  label={item.label}
                                >
                                  {item.label}
                                </Select.Option>
                              ))}
                            </Select>
                          );
                        },
                      }}
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="过期时间" {...validateInfos.expireDate}>
                    <DatePicker
                      v-model:value={formState.expireDate}
                      disabled={state.disabled}
                      style="width: 100%"
                      placeholder="请选择过期时间"
                      format="YYYY-MM-DD"
                      valueFormat="YYYY-MM-DD"
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="开启临期预警" {...validateInfos.advanceWarning}>
                    <RadioGroup
                      v-model:value={formState.advanceWarning}
                      disabled={state.disabled}
                      placeholder="请填写备注"
                      button-style="solid"
                      name={'advanceWarning'}
                    >
                      <RadioButton value="Y">是</RadioButton>
                      <RadioButton value="N">否</RadioButton>
                    </RadioGroup>
                  </FormItem>
                </Col>
                {formState.advanceWarning === 'Y' && (
                  <Col span={24}>
                    <FormItem label="提前示警天数" {...validateInfos.advanceDays}>
                      <InputNumber
                        v-model:value={formState.advanceDays}
                        disabled={state.disabled}
                        placeholder="请填写提前示警天数"
                        style="width: 100%"
                        addon-after="天"
                        min={0}
                        max={99999}
                        precision={0}
                      />
                    </FormItem>
                  </Col>
                )}
                <Col span={24}>
                  <FormItem label="附件" {...validateInfos.fileList}>
                    <FileUploader
                      disabled={state.disabled}
                      fileList={formState.fileList}
                      onChange={(files: any[]) => handleChangeFile(files)}
                    />
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </BasicModal>
        </div>
      );
    };
  },
});
