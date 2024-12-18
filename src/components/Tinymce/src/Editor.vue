<template>
  <div :class="prefixCls" :style="{ width: containerWidth }">
    <textarea
      :id="tinymceId"
      ref="elRef"
      :style="{ visibility: 'hidden' }"
      v-if="!initOptions.inline"
    ></textarea>
    <slot v-else></slot>
  </div>
</template>

<script lang="ts" setup>
  import type { Editor, RawEditorSettings } from 'tinymce';
  import tinymce from 'tinymce/tinymce';
  import 'tinymce/themes/silver';
  import 'tinymce/icons/default/icons';
  import 'tinymce/plugins/advlist';
  import 'tinymce/plugins/anchor';
  import 'tinymce/plugins/autolink';
  import 'tinymce/plugins/autosave';
  import 'tinymce/plugins/code';
  import 'tinymce/plugins/codesample';
  import 'tinymce/plugins/directionality';
  import 'tinymce/plugins/fullscreen';
  import 'tinymce/plugins/hr';
  import 'tinymce/plugins/insertdatetime';
  import 'tinymce/plugins/link';
  import 'tinymce/plugins/lists';
  import 'tinymce/plugins/media';
  import 'tinymce/plugins/image';
  import 'tinymce/plugins/nonbreaking';
  import 'tinymce/plugins/noneditable';
  import 'tinymce/plugins/pagebreak';
  import 'tinymce/plugins/paste';
  import 'tinymce/plugins/preview';
  import 'tinymce/plugins/print';
  import 'tinymce/plugins/save';
  import 'tinymce/plugins/searchreplace';
  import 'tinymce/plugins/spellchecker';
  import 'tinymce/plugins/tabfocus';
  // import 'tinymce/plugins/table';
  import 'tinymce/plugins/template';
  import 'tinymce/plugins/textpattern';
  import 'tinymce/plugins/visualblocks';
  import 'tinymce/plugins/visualchars';
  import 'tinymce/plugins/wordcount';
  import CryptoJS from 'crypto-js';
  import { defHttp } from '@/utils/http/axios';

  import {
    computed,
    nextTick,
    ref,
    unref,
    watch,
    onDeactivated,
    onBeforeUnmount,
    PropType,
    useAttrs,
  } from 'vue';
  // import ImgUpload from './ImgUpload.vue';
  import { plugins as defaultPlugins, toolbar as defaultToolbar } from './tinymce';
  import { buildShortUUID } from '@/utils/uuid';
  import { bindHandlers } from './helper';
  import { onMountedOrActivated } from '@vben/hooks';
  import { useDesign } from '@/hooks/web/useDesign';
  import { isNumber } from '@/utils/is';
  import { useLocale } from '@/locales/useLocale';
  import { useAppStore } from '@/store/modules/app';

  defineOptions({ name: 'Tinymce', inheritAttrs: false });

  const props = defineProps({
    options: {
      type: Object as PropType<Partial<RawEditorSettings>>,
      default: () => ({}),
    },
    value: {
      type: String,
    },

    toolbar: {
      type: Array as PropType<string[]>,
      default: defaultToolbar,
    },
    plugins: {
      type: Array as PropType<string[]>,
      default: defaultPlugins,
    },
    modelValue: {
      type: String,
    },
    height: {
      type: [Number, String] as PropType<string | number>,
      required: false,
      default: 400,
    },
    width: {
      type: [Number, String] as PropType<string | number>,
      required: false,
      default: 'auto',
    },
    showImageUpload: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['change', 'update:modelValue', 'inited', 'init-error']);

  const attrs = useAttrs();
  const editorRef = ref<Editor | null>(null);
  const fullscreen = ref(false);
  const tinymceId = ref<string>(buildShortUUID('tiny-vue'));
  const elRef = ref<HTMLElement | null>(null);

  const { prefixCls } = useDesign('tinymce-container');

  const appStore = useAppStore();

  const containerWidth = computed(() => {
    const width = props.width;
    if (isNumber(width)) {
      return `${width}px`;
    }
    return width;
  });

  const skinName = computed(() => {
    return appStore.getDarkMode === 'light' ? 'oxide' : 'oxide-dark';
  });

  const langName = computed(() => {
    const lang = useLocale().getLocale.value;
    return ['zh_CN', 'en'].includes(lang) ? lang : 'zh_CN';
  });

  const initOptions = computed((): RawEditorSettings => {
    const { height, options, toolbar, plugins } = props;
    const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
    const ctyunPublicPath = 'https://staticfs-test.wahaha.com.cn';
    return {
      selector: `#${unref(tinymceId)}`,
      height,
      readonly: disabled.value,
      toolbar,
      menubar: 'file edit insert view format table',
      plugins,
      language_url: publicPath + 'resource/tinymce/langs/' + langName.value + '.js',
      language: langName.value,
      branding: false,
      default_link_target: '_blank',
      link_title: false,
      object_resizing: false,
      auto_focus: true,
      skin: skinName.value,
      skin_url: publicPath + 'resource/tinymce/skins/ui/' + skinName.value,
      content_css: publicPath + 'resource/tinymce/skins/ui/' + skinName.value + '/content.min.css',
      ...options,
      setup: (editor: Editor) => {
        editorRef.value = editor;
        editor.on('init', (e) => initSetup(e));
      },
      // images_upload_url: 'https://staticfs-test.wahaha.com.cn/api/file/upload',
      images_upload_handler: async (blobInfo, succFun, failFun) => {
        const bucketName = 'office',
          appName = 'whhim-sy-manager',
          fileVersion = '1.0',
          timestamp = new Date().getTime();
        const yourStringToSign =
          `POST` +
          '\n' +
          `multipart/form-data` +
          '\n' +
          `${timestamp}` +
          '\n' +
          `x-app-name:${appName}` +
          '\n' +
          `x-bucket-name:${bucketName}` +
          '\n' +
          `x-file-version:${fileVersion}` +
          '\n' +
          `/api/file/upload`;
        let signingKey = appStore.getSigningKey;
        if (!signingKey) {
          const {
            data: { sk },
          } = await defHttp.get({
            url: `${ctyunPublicPath}/api/secret/sk?ak=${appName}`,
            data: {},
          });
          signingKey = sk;
          appStore.setSigningKey(sk);
        }
        if (!signingKey) {
          failFun('上传图片失败，请重新上传');
          return;
        }
        //加密数据
        let hash = CryptoJS.HmacSHA1(yourStringToSign, signingKey);
        const signature = CryptoJS.enc.Base64.stringify(hash);
        const formData = new FormData();
        formData.append('file', blobInfo.blob());
        const result = await defHttp.post({
          url: `${ctyunPublicPath}/api/file/upload`,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-bucket-name': bucketName,
            'x-app-name': appName,
            'x-file-version': fileVersion,
            'x-file-signature': signature,
            timestamp,
          },
        });
        if (result.success) {
          succFun(result.data.originUrl);
        } else {
          failFun(result.message);
        }
      },
    };
  });

  const disabled = computed(() => {
    const getdDisabled = props.disabled;
    const editor = unref(editorRef);
    if (editor) {
      editor.setMode(getdDisabled ? 'readonly' : 'design');
    }
    return getdDisabled ?? false;
  });
  onMountedOrActivated(() => {
    if (!initOptions.value.inline) {
      tinymceId.value = buildShortUUID('tiny-vue');
    }
    nextTick(() => {
      setTimeout(() => {
        initEditor();
      }, 30);
    });
  });

  onBeforeUnmount(() => {
    destory();
  });

  onDeactivated(() => {
    destory();
  });

  function destory() {
    if (tinymce !== null) {
      tinymce?.remove?.(unref(initOptions).selector!);
    }
  }

  function initEditor() {
    const el = unref(elRef);
    if (el) {
      el.style.visibility = '';
    }
    tinymce
      .init(unref(initOptions))
      .then((editor) => {
        const editorR = unref(editorRef);
        editorR?.setMode(props.disabled ? 'readonly' : 'design');
        emit('inited', editor);
      })
      .catch((err) => {
        emit('init-error', err);
      });
  }

  function initSetup(e) {
    const editor = unref(editorRef);
    if (!editor) {
      return;
    }
    const value = props.modelValue || '';
    console.log('editor----:>> ', editor);
    editor.setContent(value);
    bindModelHandlers(editor);
    bindHandlers(e, attrs, unref(editorRef));
  }

  function setValue(editor: Record<string, any>, val?: string, prevVal?: string) {
    if (
      editor &&
      typeof val === 'string' &&
      val !== prevVal &&
      val !== editor.getContent({ format: attrs.outputFormat })
    ) {
      editor.setContent(val);
    }
  }

  function bindModelHandlers(editor: any) {
    const modelEvents = attrs.modelEvents ? attrs.modelEvents : null;
    const normalizedEvents = Array.isArray(modelEvents) ? modelEvents.join(' ') : modelEvents;

    watch(
      () => props.modelValue,
      (val, prevVal) => {
        setValue(editor, val, prevVal);
      },
    );

    watch(
      () => props.value,
      (val, prevVal) => {
        setValue(editor, val, prevVal);
      },
      {
        immediate: true,
      },
    );

    editor.on(normalizedEvents ? normalizedEvents : 'change keyup undo redo', () => {
      const content = editor.getContent({ format: attrs.outputFormat });
      console.log('content :>> ', content);
      emit('update:modelValue', content);
      emit('change', content);
    });

    editor.on('FullscreenStateChanged', (e) => {
      fullscreen.value = e.state;
    });
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-tinymce-container';

  .@{prefix-cls} {
    position: relative;
    line-height: normal;

    textarea {
      visibility: hidden;
      z-index: -1;
    }
  }
</style>
