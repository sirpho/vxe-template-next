import { Button, Input, Select } from 'ant-design-vue';
import './index.less';
import { dataURLtoFile } from '@sirpho/utils/util';
import { upload } from './service';
import { defineComponent, reactive, ref } from 'vue';
import { PageContainer, VxeContainer } from '@/components/Layout';

export default defineComponent({
  setup() {
    const canvasDom = ref<HTMLCanvasElement>();
    const state = reactive({
      loading: false,
      thumbnails: [
        {
          label: 'kellyone小程序',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/f5fe620eafd44d5ca21b4906fa14b93b.png',
        },
        {
          label: 'React',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/6cc4739f691a4ca2904b6420fba0f0d6.png',
        },
        {
          label: 'Vue',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/6194691c3189464e99c53eab2d43cb60.png',
        },
        {
          label: 'Vue模板',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/ea9b0b3b238f498999ec50a851768cd3.png',
        },
        {
          label: '娃哈哈项目',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/eec45bcf8bf74b3db10547d2a66aaa5b.png',
        },
        {
          label: 'JAVA项目',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/6e6595e7083740dd950c4ff8ad724c6c.png',
        },
        {
          label: '黑色块',
          value:
            'https://fe-static.obs.cn-hz1.ctyun.cn/sirpho/55f6cd10d9e64e4f8fac22c4e8bd5ac8.png',
        },
      ],
      canvasWidth: 256,
      canvasHeight: 256,
      success: false,
    });

    const formState = reactive({
      name: undefined,
      imageSrc: undefined,
    });

    /**
     * 绘制canvas
     */
    const handleRender = async () => {
      if (!formState.imageSrc) {
        state.success = false;
        return;
      }
      const canvas = canvasDom.value!;

      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = formState.imageSrc; // 图片的路径
      img.onload = () => {
        ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        ctx.drawImage(img, 0, 0, state.canvasWidth, state.canvasHeight);

        ctx.font = 'bold 60px 苹方';
        ctx.fillStyle = 'black';

        const word = formState.name || '';
        const textList = word.split('\\n');
        let offset = 0;
        for (const text of textList) {
          ctx.textBaseline = offset > 0 ? 'middle' : 'alphabetic';
          const textWidth = ctx.measureText(text).width;
          const x = (state.canvasWidth - textWidth) / 2;
          const y = state.canvasHeight / 2 + offset;
          ctx.fillText(text, x, y);
          offset += 60;
        }

        state.success = true;
      };
    };

    /**
     * 导出
     */
    const handleExport = async () => {
      const dataURL = canvasDom.value!.toDataURL('image/png');
      const file = dataURLtoFile(dataURL, 'desktop.png');
      state.loading = true;
      const res = await upload({
        file,
      }).finally(() => {
        state.loading = false;
      });
      if (res.code === 200) {
        window.open(`${res.data}?random=${Math.random()}`, '_blank');
      }
    };

    return () => {
      return (
        <PageContainer className={'desktop-page'}>
          <VxeContainer direction="vertical" size={[20, 80]}>
            <div class="operation-bar">
              <Input
                v-model:value={formState.name}
                placeholder={'文字描述'}
                onChange={() => handleRender()}
              />
              <Select
                v-model:value={formState.imageSrc}
                placeholder="背景图片"
                style={{ width: '100%' }}
                onChange={() => handleRender()}
              >
                {state.thumbnails.map((item) => (
                  <Select.Option key={item.value} value={item.value} label={item.label}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>

              <Button disabled={!state.success} type="primary" onClick={() => handleExport()}>
                导出
              </Button>
            </div>

            <canvas ref={canvasDom} width={state.canvasWidth} height={state.canvasHeight} />
          </VxeContainer>
        </PageContainer>
      );
    };
  },
});
