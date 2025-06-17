import { Button, notification } from 'ant-design-vue';
import { h, onMounted, onUnmounted, ref } from 'vue';
import { envVersion } from '@/features/utils';
import { useRouter } from 'vue-router';
import { useThrottleFn } from '@vueuse/core';

const isDevEnvironment = envVersion !== 'production';
export default function notifyUpdate() {
  const currentHash = ref<string>('');
  const originHash = ref<string | null>('');

  const router = useRouter();
  onMounted(() => {
    init().then();
    document.addEventListener('visibilitychange', handleVisibilitychange);

    /**
     * 路由加载报错时检查更新
     */
    router.onError(async () => {
      await checkUpdate();
    });
  });
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilitychange);
  });

  /**
   * 系统初次加载时获取hash
   */
  const init = async () => {
    originHash.value = await getVersionTag();
  };

  /**
   * 标签激活时检查更新
   */
  const handleVisibilitychange = async () => {
    if (!document.hidden) {
      // 用户切换到当前标签页
      await handleCheckThrottle();
    }
  };

  const getVersionTag = async () => {
    try {
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return '';
      }
      const response = await fetch('/', {
        cache: 'no-cache',
        method: 'HEAD',
      });

      return response.headers.get('etag') || response.headers.get('last-modified');
    } catch {
      console.error('Failed to fetch version tag');
      return '';
    }
  };

  /**
   * 检查更新
   */
  const checkUpdate = async () => {
    if (isDevEnvironment) {
      return;
    }
    const versionTag = await getVersionTag();
    if (!versionTag) {
      return;
    }
    currentHash.value = versionTag;
    if (originHash.value !== currentHash.value) {
      if (originHash.value) {
        openNotification();
      } else {
        originHash.value = versionTag;
      }
    }
  };

  /**
   * 节流
   */
  const handleCheckThrottle = useThrottleFn(checkUpdate, 60 * 1000);

  /**
   * 提示更新消息
   */
  const openNotification = () => {
    // 如果是登录页面，则直接刷新
    if (window.location.href.includes('login')) {
      confirm();
      return;
    }

    notification.open({
      message: '检测到发布了新版本，是否刷新页面',
      description: '新版本可能修复了bug或启用了新的功能，建议刷新网页后重新登录',
      btn: () =>
        h(
          Button,
          {
            type: 'primary',
            size: 'small',
            onClick: () => confirm(),
          },
          { default: () => '确认' },
        ),
      onClose: confirm,
      key: 'updatePanel',
      duration: null,
    });
  };

  /**
   * 确认更新
   */
  const confirm = () => {
    notification.close('updatePanel');
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };
}
