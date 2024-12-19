<script lang="ts">
  import { computed, defineComponent, h, unref } from 'vue';
  import { Popconfirm, Button } from 'ant-design-vue';
  import { extendSlots } from '@/utils/helper/tsxHelper';
  import { omit } from 'lodash-es';
  import { useAttrs } from '@vben/hooks';
  import { useI18n } from '@/hooks/web/useI18n';

  const props = {
    /**
     * Whether to enable the drop-down menu
     * @default: true
     */
    enable: {
      type: Boolean,
      default: true,
    },
  };

  export default defineComponent({
    name: 'PopButton',
    inheritAttrs: false,
    props,
    emits: ['confirm', 'cancel', 'visibleChange'],
    setup(props, { slots }) {
      const { t } = useI18n();
      const attrs = useAttrs();

      // get inherit binding value
      const getBindValues = computed(() => {
        return Object.assign(
          {
            okText: t('common.okText'),
            cancelText: t('common.cancelText'),
          },
          { ...props, ...unref(attrs) },
        );
      });

      return () => {
        // 用 omit 剔除一些已知可能导致异常的属性
        const bindValues = omit(unref(getBindValues), 'icon', 'color');
        const btnBind = omit(unref(getBindValues), 'title') as any;
        if (btnBind.disabled) btnBind.color = '';
        const CustomButton = h(Button, btnBind, extendSlots(slots));

        // If it is not enabled, it is a normal button
        if (!props.enable) {
          return CustomButton;
        }
        return h(Popconfirm, bindValues, { default: () => CustomButton });
      };
    },
  });
</script>
