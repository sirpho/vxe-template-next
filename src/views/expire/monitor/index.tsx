import { remove, list } from './service';
import OperationModal from './components/OperationModal';
import {
  Modal,
  Empty,
  Button,
  Select,
  InputSearch,
  Row,
  Col,
  Card,
  CardMeta,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import './index.less';
import { ExclamationCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { Loading } from '@/components/Loading';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useDict } from '@/hooks/web/useDict';
import { PageContainer, VxeContainer } from '@/components/Layout';

const { confirm } = Modal;

export default defineComponent({
  components: { OperationModal, Loading, Empty, DeleteOutlined, EditOutlined },
  setup() {
    const operationRef = ref();
    const [tagList, typeList] = useDict([
      'TAG', // 标签列表
      'TYPE',
    ]);

    const state = reactive({
      tableData: [],
      removeLoadMap: {},
      keyword: '',
      loading: true,
    });

    const formState = reactive({
      type: undefined,
      tag: undefined,
    });

    /**
     * 获取表格数据
     */
    const getTableList = async () => {
      state.loading = true;
      const response = await list({
        ...formState,
        keyword: state.keyword?.trim(),
        pageSize: Number.MAX_SAFE_INTEGER,
      }).finally(() => {
        state.loading = false;
      });
      const today = new Date();
      const result = response?.data || response?.page;
      state.tableData = (result?.records || []).map((item: any) => ({
        ...item,
        expireDate: dayjs(new Date(item.expireDate)).format('YYYY-MM-DD'),
        createTime: dayjs(new Date(item.createTime)).format('YYYY-MM-DD HH:mm'),
        deadline: dayjs(new Date(item.expireDate)).diff(today, 'day'),
      }));
    };

    /**
     * 录入
     */
    const handleAdd = () => {
      operationRef.value?.open();
    };

    /**
     * 编辑
     * @param record
     */
    const handleEdit = (record: any) => {
      operationRef.value?.edit(record);
    };

    /**
     * 删除
     * @param record
     */
    const handleRemove = async (record: any) => {
      if (state.removeLoadMap[record.id]) {
        return;
      }
      confirm({
        title: '提示',
        icon: <ExclamationCircleOutlined />,
        content: <div>确定要删除【{record.name}】吗？</div>,
        onOk: async () => {
          // 确认操作回调函数
          state.removeLoadMap[record.id] = true;
          const res = await remove(record.id).finally(() => {
            state.removeLoadMap[record.id] = false;
          });
          if (res.code === 200) {
            handleOk();
          }
        },
        onCancel() {
          // 取消操作回调函数
        },
      });
    };

    /**
     * 刷新表格并重置相关的枚举
     */
    const handleOk = async () => {
      await getTableList();
    };

    onMounted(async () => {
      await getTableList();
    });

    return () => {
      return (
        <PageContainer className="monitor-page">
          <VxeContainer>
            <div class="page-content">
              <div class="toolbar">
                <Button class="buoy" type={'primary'} onClick={() => handleAdd()}>
                  录入
                </Button>
                <Select
                  class={'search-select'}
                  v-model:value={formState.tag}
                  placeholder="标签"
                  allowClear
                  onChange={() => getTableList()}
                >
                  {(tagList.value || []).map((item) => (
                    <Select.Option
                      key={item.value}
                      value={item.name}
                      name={item.name}
                      label={item.label}
                    >
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  class={'search-select'}
                  v-model:value={formState.type}
                  placeholder="分类"
                  allowClear
                  onChange={() => getTableList()}
                >
                  {(typeList.value || []).map((item) => (
                    <Select.Option
                      key={item.value}
                      value={item.value}
                      name={item.name}
                      label={item.label}
                    >
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
                <InputSearch
                  class={'search-input'}
                  v-model:value={state.keyword}
                  placeholder="搜索"
                  onSearch={() => getTableList()}
                />
              </div>

              <div class="card-table-wrapper">
                <div class="card-table-wrapper-content">
                  <Loading loading={state.loading} />
                  <Row wrap={true} gutter={[16, 16]}>
                    {state.tableData.map((item: any) => (
                      <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={4} xxxl={3}>
                        <Card
                          hoverable
                          v-slots={{
                            cover: () => {
                              return (
                                <div class="ant-image">
                                  <img
                                    src={item.cover}
                                    alt="封面"
                                    class="ant-image-img"
                                    loading="lazy"
                                    style={{ width: '100%' }}
                                  />
                                </div>
                              );
                            },
                            actions: () => {
                              return [
                                <EditOutlined onClick={() => handleEdit(item)} key="edit" />,
                                <DeleteOutlined
                                  onClick={() => handleRemove(item)}
                                  className={'warning'}
                                  key="delete"
                                />,
                              ];
                            },
                          }}
                        >
                          <CardMeta
                            title={item.name}
                            v-slots={{
                              description: () => {
                                return (
                                  <div class="description-content">
                                    <Row>
                                      <Col span={8}>
                                        <div class="description-content-title">类别</div>
                                      </Col>
                                      <Col span={8}>
                                        <div class="description-content-title">余量</div>
                                      </Col>
                                      <Col span={8}>
                                        <div class="description-content-title">存放地点</div>
                                      </Col>
                                      <Col span={8}>
                                        <div class="description-content-text">{item.type}</div>
                                      </Col>
                                      <Col span={8}>
                                        <div class="description-content-text">
                                          {item.quantity || 0}
                                          {item.unit || ''}
                                        </div>
                                      </Col>
                                      <Col span={8}>
                                        <div class="description-content-text">{item.location}</div>
                                      </Col>
                                    </Row>
                                    {item.memo && <div class="memo-wrapper">备注：{item.memo}</div>}
                                    <div class="line">
                                      <div
                                        class={
                                          item.deadline < 30
                                            ? 'description-content-text warning'
                                            : 'description-content-text'
                                        }
                                      >
                                        {item.expireDate}
                                      </div>
                                      过期
                                    </div>
                                  </div>
                                );
                              },
                            }}
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  {!state.loading && state.tableData.length <= 0 && <Empty />}
                </div>
              </div>
            </div>
          </VxeContainer>
          <OperationModal ref={operationRef} onHandleOk={() => handleOk()} />
        </PageContainer>
      );
    };
  },
});
