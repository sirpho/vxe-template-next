<template>
  <BasicModal
    :footer="null"
    :title="t('layout.header.tooltipAuthorize')"
    v-bind="$attrs"
    :class="prefixCls"
    @register="register"
  >
    <div :class="`${prefixCls}__entry`">
      <div :class="`${prefixCls}__header`">
        <img :src="avatar" :class="`${prefixCls}__header-img`" />
        <p :class="`${prefixCls}__header-name`">
          {{ getRealName }}
        </p>
      </div>

      <BasicForm @register="registerForm" />

      <div :class="`${prefixCls}__footer`">
        <a-button type="primary" block class="mt-2" @click="handleAuthorize">
          {{ t('layout.header.tooltipAuthorize') }}
        </a-button>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';

  import { useUserStore } from '@/store/modules/user';
  import headerImg from '@/assets/images/header.jpg';
  import { RoleEnum } from '@/enums/roleEnum';
  import { usePermission } from '@/hooks/web/usePermission';

  defineOptions({ name: 'AuthorizeModal' });

  const { t } = useI18n();
  const { prefixCls } = useDesign('header-authorize-modal');
  const userStore = useUserStore();
  const usePermissionStore = usePermission();

  const getRealName = computed(() => userStore.getUserInfo?.name);
  const [register, { closeModal }] = useModalInner();
  const [registerForm, { validate, resetFields }] = useForm({
    showActionButtonGroup: false,
    schemas: [
      {
        field: 'key',
        label: t('layout.header.authorizeKey'),
        colProps: {
          span: 24,
        },
        component: 'InputNumber',
        required: true,
      },
    ],
  });

  const handleAuthorize = async () => {
    const { key } = await validate<{
      key: RoleEnum;
    }>();

    closeModal();

    const roleList = userStore.getRoleList || [];
    userStore.setRoleList([...roleList, key]);
    await usePermissionStore.refreshMenu();

    await resetFields();
  };

  const avatar = computed(() => {
    const { avatar } = userStore.getUserInfo;
    return avatar || headerImg;
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-authorize-modal';

  .@{prefix-cls} {
    &__entry {
      position: relative;
      padding: 130px 30px 30px;
      border-radius: 10px;
    }

    &__header {
      position: absolute;
      top: 0;
      left: calc(50% - 45px);
      width: auto;
      text-align: center;

      &-img {
        width: 70px;
        border-radius: 50%;
      }

      &-name {
        margin-top: 5px;
      }
    }

    &__footer {
      text-align: center;
    }
  }
</style>
