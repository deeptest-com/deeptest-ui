<template>
  <div :class="{ 'home-wrap': true, 'wujie-home-wrap': isInThirdpartyWujieContainer }">
    <div :class="{'home-header': true, 'hidden': isWujieEnv}">
      <div class="home-header-left" :class="{'thirdparty-logo':isThirdpartyEnv}" @click="handleRedirect">
      </div>
      <div class="home-header-right">
        <UserSetting :theme="'white-theme'"/>
      </div>
    </div>
    <!-- <router-view></router-view> -->
    <div class="home-content">
      <slot />
    </div>
    <RightTopUpdate />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, unref, watch } from 'vue';
import { useRouter } from 'vue-router';
import UserSetting from './IndexLayout/components/RightTopSettings.vue';
import RightTopUpdate from './IndexLayout/components/RightTopUpdate.vue';
import settings from '@/config/settings';
import {isThirdparty} from "@/utils/comm";
import {useWujie} from "@/composables/useWujie";
export default defineComponent({
  name: 'HomeLayout',
  components: {
    UserSetting,
    RightTopUpdate
  },
  setup() {
    const router = useRouter();
    let isThirdpartyEnv = isThirdparty();
    const { isWujieEnv, isInThirdpartyWujieContainer } = useWujie();

    watch(() => {
      return router.currentRoute.value;
    }, (val: any) => {
      if (val.meta.title) {
        document.title = `${val.meta.title} - ${settings.siteTitle}`;
      } else {
        document.title = settings.siteTitle;
      }
    }, {
      immediate: true,
    })

    function handleRedirect() {
      router.push('/');
    }



    return {
      handleRedirect,
      isThirdpartyEnv,
      isWujieEnv,
      isInThirdpartyWujieContainer
    }
  }
})
</script>
<style scoped lang="less">
.home-wrap {
  background: #FFF;
  min-width: 1440px;
  height: 100vh;
  overflow: hidden;

  &.wujie-home-wrap {
    width: 100%;
    min-width: unset;
  }

  .home-header {
    width: 100%;
    height: 64px;
    background-color: #2A325A;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 24px;
    box-sizing: border-box;

    &.hidden {
      height: 0;
      overflow: hidden;
    }

    .home-header-left {
      width: 105px;
      height: 35px;
      background-image: url('../assets/images/logo.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      cursor: pointer;
      &.thirdparty-logo{
        transform: scale(1.1) translateX(5px);
        background-image: url('../assets/images/logo.svg');
      }
    }
  }

  .home-content {
    height: calc(100vh - 64px);
    overflow-y: scroll;
  }
}
</style>
