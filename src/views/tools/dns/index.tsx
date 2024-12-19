import { Button, Input, message, Select, Form, FormItem } from 'ant-design-vue';
import './index.less';
import { useForm } from 'ant-design-vue/es/form';
import { defineComponent, onMounted, reactive } from 'vue';
import { PageContainer, VxeContainer } from '@/components/Layout';
import { VxeGrid, VxeGridProps } from 'vxe-table';

export default defineComponent({
  setup() {
    const state = reactive({
      domainList: [
        {
          value: 'perflogs.top',
          label: 'perflogs.top',
          type: 'namesilo',
          key: '96de19f1a334141437af4806',
        },
      ],
      dnsRecordsList: [] as any[],
      queryLoading: false,
      submitLoading: false,
    });

    const formState = reactive({
      rrvalue: '',
      rrhost: '',
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

    const { validate, validateInfos } = useForm(formState, rules);

    onMounted(() => {
      handleQuery();
    });

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
      ],
      showHeaderOverflow: 'tooltip',
      height: 'auto',
    });

    /**
     * 查询解析记录
     */
    const handleQuery = () => {
      state.queryLoading = true;
      const domainItem = state.domainList.find((item) => item.value === formState.domain);
      fetch(
        `https://server.perflogs.top/namesiloProxy/api/dnsListRecords?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}`,
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

    const handleConfirm = () => {
      validate().then(async () => {
        const domainItem = state.domainList.find((item) => item.value === formState.domain);
        const { domain, rrhost, rrvalue } = formState;
        const fullDomain = `${rrhost}.${domain}`;
        const existItem = state.dnsRecordsList.find((item) => item.host === fullDomain);
        if (!existItem) {
          state.submitLoading = true;
          await fetch(
            `https://server.perflogs.top/namesiloProxy/api/dnsAddRecord?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}&rrtype=A&rrhost=${rrhost}&rrvalue=${rrvalue}&rrttl=7207`,
          ).finally(() => {
            state.submitLoading = false;
          });
        } else {
          state.submitLoading = true;
          await fetch(
            `https://server.perflogs.top/namesiloProxy/api/dnsUpdateRecord?version=1&type=xml&key=${domainItem!.key}&domain=${domainItem!.value}&rrtype=A&rrhost=${rrhost}&rrid=${existItem.recordId}&rrvalue=${rrvalue}&rrttl=7207`,
          ).finally(() => {
            state.submitLoading = false;
          });
        }
        message.success('操作完成');
        handleQuery();
      });
    };

    /**
     * 修改
     */
    const handleEdit = (record: any) => {
      const domain = formState.domain;
      formState.rrhost = record.host.replace(`.${domain}`, '');
      formState.rrvalue = record.value;
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
                <Button
                  loading={state.submitLoading}
                  type="primary"
                  onClick={() => handleConfirm()}
                >
                  确定
                </Button>
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
