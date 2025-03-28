<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full">
        <div class="hidden min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12">
          <div class="my-auto">
            <img
              :alt="title"
              src="../../../assets/svg/login-box-bg.svg"
              class="w-1/2 -mt-16 animate-float"
            />
            <div class="mt-10 font-medium text-white -enter-x">
              <span class="inline-block mt-4 text-3xl"> {{ t('sys.login.signInTitle') }}</span>
            </div>
            <div class="mt-5 font-normal text-white dark:text-gray-500 -enter-x">
              {{ t('sys.login.signInDesc') }}
            </div>
          </div>
        </div>
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:ml-16 xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-128 enter-x"
          >
            <LoginForm />
          </div>
          <div
            class="record-report w-full sm:w-3/4 lg:w-2/4 xl:w-128 xl:ml-16 text-center -enter-x"
          >
            <a
              href="https://record-report.miit.gov.cn/"
              target="_blank"
              class="ds-a ds-a--link text-sm !text-slate-600"
            >
              浙ICP备2025148169号
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useGlobSetting } from '@/hooks/setting';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useI18n } from '@/hooks/web/useI18n';
  import { computed } from 'vue';
  import LoginForm from './LoginForm.vue';

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const title = computed(() => globSetting?.title ?? '');
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @dark-bg: #293146;

  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;

    /* stylelint-disable-next-line media-query-no-invalid */
    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      margin-left: -48%;
      background-image: url('@/assets/svg/login-bg.svg');
      background-repeat: no-repeat;
      background-position: 100%;
      background-size: auto 100%;
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-xl) {
        display: none;
      }
    }

    .@{logo-prefix-cls} {
      position: absolute;
      top: 12px;
      height: 30px;

      &__title {
        color: #fff;
        font-size: 16px;
      }

      img {
        width: 32px;
      }
    }

    .container {
      position: relative;
      z-index: 9;
      .@{logo-prefix-cls} {
        display: flex;
        width: 60%;
        height: 80px;

        &__title {
          color: #fff;
          font-size: 24px;
        }

        img {
          width: 48px;
        }
      }
    }

    &-sign-in-way {
      .anticon {
        color: #888;
        font-size: 22px;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }
    }

    input:not([type='checkbox']) {
      min-width: 360px;
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-xl) {
        min-width: 320px;
      }
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-lg) {
        min-width: 260px;
      }
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-md) {
        min-width: 240px;
      }
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-sm) {
        min-width: 160px;
      }
    }
  }

  .record-report {
    position: absolute;
    bottom: 10px;
  }

  .animate-float {
    animation: float 5s linear 0s infinite;
  }

  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(25px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
