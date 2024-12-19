<script lang="tsx">
  import { defineComponent, useSlots, toRefs, nextTick } from 'vue';
  import { filterEmpty } from 'ant-design-vue/es/_util/props-util';
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  import { useCalcHeight } from '@vben/hooks';

  export default defineComponent({
    name: 'VxeContainer',
    props: {
      extraHeight: { type: Number, default: 0 },
      direction: { type: String, default: 'horizontal' },
      size: { type: Array, default: () => [] },
      id: { type: String, default: '#1' },
    },

    setup(props, { expose }) {
      const slots = useSlots();

      const prefixId = 'vxe-container';

      const { height, calcHeight } = useCalcHeight(`${prefixId}-${props.id}`);

      const reCalcHeight = () => {
        nextTick(() => {
          calcHeight();
        });
      };

      expose({ reCalcHeight });

      return () => {
        const { extraHeight, direction, size } = toRefs(props);
        // 是否是水平布局
        const isHorizontal: boolean = direction.value === 'horizontal';
        // 防止小数在 window 平台出现滚动条
        const gridContainerHeight = height.value - (extraHeight.value as number);
        const items = filterEmpty(slots.default?.());
        const len = items.length;
        const polyfillHeight = Math.floor(gridContainerHeight - 0.5);

        if (len === 0) {
          return (
            <div
              id={`${prefixId}-${props.id}`}
              class="vxe-container"
              data-calc-height={gridContainerHeight}
              style={{ height: polyfillHeight + 'px' }}
            ></div>
          );
        }

        return (
          <Splitpanes
            id={`${prefixId}-${props.id}`}
            class="vxe-container default-theme"
            horizontal={isHorizontal}
            data-calc-height={gridContainerHeight}
            style={{ height: polyfillHeight + 'px' }}
          >
            {items.map((child, index) => {
              return (
                <Pane size={size.value[index]} min-size="20" max-size="100">
                  {child}
                </Pane>
              );
            })}
          </Splitpanes>
        );
      };
    },
  });
</script>
<style>
  .vxe-container {
    background-color: #fff;
  }

  .splitpanes.default-theme .splitpanes__pane {
    background: #fff;
  }

  .default-theme.splitpanes--horizontal > .splitpanes__splitter,
  .default-theme .splitpanes--horizontal > .splitpanes__splitter {
    height: 0.5rem;
    margin-top: -1px;
    border-top: unset;
  }

  .default-theme.splitpanes--vertical > .splitpanes__splitter,
  .default-theme .splitpanes--vertical > .splitpanes__splitter {
    width: 0.5rem;
    margin: 0;
    border: none;
  }

  .splitpanes.default-theme .splitpanes__splitter {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    background: #f0f2f5;
  }
</style>
