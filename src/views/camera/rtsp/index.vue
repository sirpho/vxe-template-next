<template>
  <PageContainer>
    <VxeContainer>
      <div class="video-wrapper">
        <video class="rtsp-video" muted autoplay controls ref="rtspVideo"></video>
      </div>
    </VxeContainer>
  </PageContainer>
</template>
<script lang="ts" setup>
  import flvjs from 'flv.js';
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useGlobSetting } from '@/hooks/setting';

  const player = ref();
  const rtspVideo = ref();
  const route = useRoute();

  const { wsUrl = '' } = useGlobSetting();

  onMounted(() => {
    const rtspType = route.name as string;
    if (flvjs.isSupported()) {
      // 创建一个flv.js实例
      player.value = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        url: `${wsUrl}/api/websocket/rtsp/${rtspType}`,
      });

      player.value?.on('error', (e) => {
        console.log(e);
      });

      // 将实例挂载到video元素上面
      player.value?.attachMediaElement(rtspVideo.value);

      try {
        // 开始运行加载 只要流地址正常 就可以在h5页面中播放出画面了
        player.value?.load();
        player.value?.play();
      } catch (error) {
        console.log(error);
      }
    }
  });

  onUnmounted(() => {
    player.value?.destroy();
  });
</script>

<style lang="less" scoped>
  .video-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #14161a;
  }

  .rtsp-video {
    max-width: 100%;
    height: 100%;
  }
</style>
