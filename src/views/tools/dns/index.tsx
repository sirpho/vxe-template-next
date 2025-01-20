import { Button, Input, message, Select, Form, FormItem, Modal } from 'ant-design-vue';
import './index.less';
import { useForm } from 'ant-design-vue/es/form';
import { defineComponent, nextTick, onMounted, reactive } from 'vue';
import { PageContainer, VxeContainer } from '@/components/Layout';
import { VxeGrid, VxeGridProps } from 'vxe-table';
import { createRecord, deleteRecord, modifyRecord, queryList } from '@/views/tools/dns/service';

export default defineComponent({
  setup() {
    const state = reactive({
      domainList: [
        {
          value: 'sirpho.top',
          label: 'sirpho.top（腾讯）',
          type: 'tencent',
        },
        {
          value: 'perflogs.top',
          label: 'perflogs.top（namesilo）',
          type: 'namesilo',
          key: '96de19f1a334141437af4806',
        },
      ],
      dnsRecordsList: [] as any[],
      queryLoading: false,
      submitLoading: false,
      deleteLoading: false,
    });

    const formState = reactive({
      rrvalue: '',
      rrhost: '',
      recordId: '',
      type: state.domainList[0]?.type,
      remark: '',
      domain: state.domainList[0]?.value,
    });

    const rules = {
      rrvalue: [
        {
          required: true,
          message: '请填写解析值',
        },
      ],
      rrhost: [
        {
          required: true,
          message: '请填写二级域名',
        },
      ],
      domain: [
        {
          required: true,
          message: '请选择域名',
        },
      ],
    };

    const { validate, validateInfos, clearValidate } = useForm(formState, rules);

    onMounted(() => {
      handleQuery();
    });

    const handleQuery = async () => {
      const domainItem = state.domainList.find((item) => item.value === formState.domain);
      formState.type = domainItem!.type;
      formState.rrvalue = '';
      formState.rrhost = '';
      formState.recordId = '';
      formState.remark = '';
      await nextTick();
      clearValidate();

      if (domainItem?.type === 'namesilo') {
        handleQueryNamesilo(domainItem);
      }
      if (domainItem?.type === 'tencent') {
        await handleQueryTencent(domainItem);
      }
    };

    const gridOptions = reactive<VxeGridProps>({
      keepSource: true,
      columns: [
        {
          field: 'type',
          title: '类型',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          width: 120,
          align: 'center',
        },
        {
          field: 'host',
          title: '域名',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
          slots: { default: 'host' },
        },
        {
          field: 'value',
          title: '解析',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
        },
        {
          field: 'recordId',
          title: '记录id',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
        },
        {
          field: 'remark',
          title: '备注',
          sortable: true,
          filters: [{}],
          filterRender: { name: 'FilterExtend' },
        },
      ],
      showHeaderOverflow: 'tooltip',
      height: 'auto',
    });

    /**
     * 查询腾讯云解析记录
     */
    const handleQueryTencent = async (domainItem) => {
      state.queryLoading = true;
      const res = await queryList({
        domain: domainItem!.value,
      }).finally(() => {
        state.queryLoading = false;
      });
      state.dnsRecordsList = (res.data || [])
        .filter((item) => item.type !== 'NS')
        .map((item) => ({
          ...item,
          host: (item.name !== '@' ? `${item.name}.` : '') + domainItem!.value,
        }));
    };

    /**
     * 查询namesilo解析记录
     */
    const handleQueryNamesilo = (domainItem) => {
      state.queryLoading = true;
      fetch(
        `https://server.sirpho.top/namesiloProxy/api/dnsListRecords?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('获取dns记录失败 ' + response.statusText);
          }
          return response.text();
        })
        .then((xml) => {
          // 如果你需要操作DOM，可以这样做：
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xml, 'text/xml');

          const records = xmlDoc.querySelectorAll('resource_record');
          const list: any[] = [];
          records.forEach((item) => {
            const recordId = item.querySelector('record_id')?.innerHTML;
            const type = item.querySelector('type')?.innerHTML;
            const host = item.querySelector('host')?.innerHTML;
            const value = item.querySelector('value')?.innerHTML;
            list.push({
              recordId,
              type,
              host,
              value,
            });
          });
          state.dnsRecordsList = list;
          // 你现在可以使用xmlDoc来进行DOM操作
        })
        .finally(() => {
          state.queryLoading = false;
        });
    };

    /**
     * 确认
     */
    const handleConfirm = async () => {
      if (formState.type === 'namesilo') {
        handleConfirmNamesilo();
      }
      if (formState.type === 'tencent') {
        await handleConfirmTencent();
      }
    };

    /**
     * namesilo解析记录确认
     */
    const handleConfirmNamesilo = () => {
      validate().then(async () => {
        const domainItem = state.domainList.find((item) => item.value === formState.domain);
        const { rrhost, rrvalue, recordId } = formState;
        if (!recordId) {
          state.submitLoading = true;
          await fetch(
            `https://server.sirpho.top/namesiloProxy/api/dnsAddRecord?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}&rrtype=A&rrhost=${rrhost}&rrvalue=${rrvalue}&rrttl=7207`,
          ).finally(() => {
            state.submitLoading = false;
          });
        } else {
          state.submitLoading = true;
          await fetch(
            `https://server.sirpho.top/namesiloProxy/api/dnsUpdateRecord?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}&rrtype=A&rrhost=${rrhost}&rrid=${recordId}&rrvalue=${rrvalue}&rrttl=7207`,
          ).finally(() => {
            state.submitLoading = false;
          });
        }
        message.success('操作完成');
        await handleQuery();
      });
    };

    /**
     * 腾讯云解析记录确认
     */
    const handleConfirmTencent = async () => {
      await validate();
      const { rrhost, rrvalue, remark, recordId } = formState;
      const operation = recordId ? modifyRecord : createRecord;

      state.submitLoading = true;
      await operation({
        domain: formState.domain,
        subDomain: rrhost,
        value: rrvalue,
        remark: remark,
        recordId: recordId,
        recordType: 'A',
        recordLine: '默认',
      }).finally(() => {
        state.submitLoading = false;
      });

      message.success('操作完成');
      await handleQuery();
    };

    /**
     * 删除解析记录
     */
    const handleDelete = () => {
      if (formState.type === 'namesilo') {
        handleDeleteNamesilo();
      }
      if (formState.type === 'tencent') {
        handleDeleteTencent();
      }
    };

    /**
     * namesilo解析记录删除
     */
    const handleDeleteNamesilo = () => {
      const domainItem = state.domainList.find((item) => item.value === formState.domain);

      const { recordId, rrhost, domain } = formState;
      Modal.confirm({
        title: `确认删除【${rrhost}.${domain}】域名解析?`,
        onOk: async () => {
          state.deleteLoading = true;
          await fetch(
            `https://server.sirpho.top/namesiloProxy/api/dnsDeleteRecord?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}&rrid=${recordId}`,
          ).finally(() => {
            state.deleteLoading = false;
          });

          message.success('操作完成');
          await handleQuery();
        },
        onCancel: () => {
          Modal.destroyAll();
        },
      });
    };

    /**
     * 腾讯云解析记录删除
     */
    const handleDeleteTencent = () => {
      const { recordId, rrhost, domain } = formState;
      Modal.confirm({
        title: `确认删除【${rrhost}.${domain}】域名解析?`,
        onOk: async () => {
          state.deleteLoading = true;
          await deleteRecord({
            domain: formState.domain,
            recordId: recordId,
          }).finally(() => {
            state.deleteLoading = false;
          });

          message.success('操作完成');
          await handleQuery();
        },
        onCancel: () => {
          Modal.destroyAll();
        },
      });
    };

    /**
     * 修改
     */
    const handleEdit = (record: any) => {
      const domainItem = state.domainList.find((item) => item.value === formState.domain);

      const domain = formState.domain;
      formState.recordId = record.recordId;
      formState.type = domainItem!.type;
      formState.rrhost = record.host.replace(`.${domain}`, '');
      formState.rrvalue = record.value;
      formState.remark = record.remark;
    };

    return () => {
      return (
        <PageContainer className={'dns-page'}>
          <VxeContainer direction="vertical" size={[20, 80]}>
            <div class="operation-bar">
              <Form>
                <FormItem {...validateInfos.domain}>
                  <Select
                    v-model:value={formState.domain}
                    placeholder="要操作的域名"
                    style={{ width: '100%' }}
                    onChange={() => handleQuery()}
                  >
                    {state.domainList.map((item) => (
                      <Select.Option key={item.value} value={item.value} label={item.label}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem {...validateInfos.rrhost}>
                  <Input
                    v-model:value={formState.rrhost}
                    placeholder={'二级域名'}
                    addon-after={`.${formState.domain}`}
                  />
                </FormItem>
                <FormItem {...validateInfos.rrvalue}>
                  <Input v-model:value={formState.rrvalue} placeholder={'解析内容'} />
                </FormItem>
                {formState.type === 'tencent' && (
                  <FormItem {...validateInfos.remark}>
                    <Input v-model:value={formState.remark} placeholder={'备注'} />
                  </FormItem>
                )}
                <Button
                  style={{ width: '100%', marginBottom: '20px' }}
                  loading={state.submitLoading}
                  type="primary"
                  onClick={() => handleConfirm()}
                >
                  {formState.recordId ? '更新' : '新增'}
                </Button>
                {formState.recordId && (
                  <Button
                    style={{ width: '100%' }}
                    loading={state.deleteLoading}
                    type="primary"
                    danger
                    onClick={() => handleDelete()}
                  >
                    删除
                  </Button>
                )}
              </Form>
            </div>

            <VxeGrid
              {...gridOptions}
              data={state.dnsRecordsList}
              loading={state.queryLoading}
              v-slots={{
                host: ({ row }) => {
                  return (
                    <Button type={'link'} onClick={() => handleEdit(row)}>
                      {row.host}
                    </Button>
                  );
                },
              }}
            />
          </VxeContainer>
        </PageContainer>
      );
    };
  },
});
