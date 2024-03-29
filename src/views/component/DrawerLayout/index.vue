<template>
  <a-drawer class="dp-drawer-container"
            :width="isFullscreen ? '100vw' : '1200px'"
            :placement="'right'"
            :closable="true"
            :visible="visible"
            :headerStyle="{padding: '12px 16px',height: '48px',zIndex: 99,width: '100%'}"
            :bodyStyle="{padding: '0px',height: 'calc(100vh - 48px)' ,'overflow':'hidden'}"
            :wrapClassName="'abc-1'"
            @close="onCloseDrawer">
    <!-- 头部信息  -->
    <template #title>
      <div  class="dp-drawer-header">
        <slot name="header"/>
      </div>
    </template>

    <a-spin tip="Loading..." :spinning="spinning" style="z-index: 2000;">
      <div class="dp-drawer-content" ref="contentRef">
        <!-- 基本信息区域 -->
        <div class="dp-drawer-content-basic-info">
          <slot name="basicInfo"/>
        </div>
        <!-- Tab 切换区域头部信息 -->
        <div class="dp-drawer-content-tabs-header" v-if="showTabHeader">
          <slot name="tabHeader"/>
        </div>
        <!-- Tab 切换区域内容区域 -->
        <div class="dp-drawer-content-tabs-content">
          <slot name="tabContent"/>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  computed,
  watch,
  onUnmounted,
  provide,
} from 'vue';
import {useStore} from "vuex";
import { useRouter } from "vue-router";
import useClipboard from "@/composables/useClipboard";

import { notifySuccess } from '@/utils/notify';
import bus from "@/utils/eventBus";
import settings from "@/config/settings";

const props = defineProps({
  visible: {
    type: Boolean,
  },
  stickyKey: {
    type: [Number, String],
    required: false,
  },
  showTabHeader: {
    type: Boolean,
    required: false,
    default: true,
  }
});

const emit = defineEmits(['ok', 'close', 'refreshList']);
const store = useStore<{ Global}>();
const { copy } = useClipboard({legacy: true});
const router = useRouter();

const contentRef: any = ref(null)

const spinning = computed( ()=>store.state.Global.spinning )

const containerScrollTop = ref(0);
const isFullscreen = ref(false);

function onCloseDrawer() {
  emit('close');
}

const onScroll = (event) => {
  containerScrollTop.value = (event.target && event.target.scrollTop) || 0;
};

const setFullScreen = (value: boolean) => {
  isFullscreen.value = value;
  setTimeout(() => {
    bus.emit(settings.paneResizeTop);
  }, 300);

};
const toDetail = (url: string) => {
  console.log('查看详情', url);
  window.open(url, '_blank');
};
const shareLink = (url: string) => {
  copy(url);

  notifySuccess('复制成功，项目成员可通过此链接访问');
}


watch(() => {
  return props.stickyKey;
}, (newVal) => {
  if (newVal && contentRef?.value) {
    const el = document.getElementsByClassName('dp-drawer-content-basic-info');
    if (el && el[0]) {
      const { height } = el[0].getBoundingClientRect();
      contentRef?.value?.scrollTo(0, height);
    }
    
  }
})

watch(() => {
  return contentRef.value;
}, val => {
  if (val) {
    val.addEventListener('scroll', onScroll);
  }
})

onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('scroll', onScroll);
  }
});

provide('containerScrollTop', computed(() => containerScrollTop.value));
provide('toDetail', toDetail);
provide('shareLink', shareLink);
provide('setFullScreen', setFullScreen);
provide('isFullScreen', computed(() => isFullscreen.value));
</script>

<style lang="less" scoped>
.dp-drawer-container {
  width: 100%;
  height: 100vh;

  .dp-drawer-content {
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .dp-drawer-content-basic-info {
    padding: 16px 24px 0 24px;
  }

  .dp-drawer-content-tabs-header {
    position: sticky;
    z-index: 1001;
    top: -1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    border-bottom: 1px solid #f0f0f0;
    margin: 0 16px;
    background-color: #ffffff;

    :deep(.tab-header-items) {
      width: 80%;
      display: flex;
      align-items: center;
    }

    :deep(.tab-header-btns) {
      width: 20%;
      display: flex;
      justify-content: flex-end;
    }

    :deep(.tab-header-items .tab-header-item) {
      color: #000000d9;
      position: relative;
      margin: 0 32px 0 0;
      padding: 12px 16px;
      text-decoration: none;
      cursor: pointer;
    }

    :deep(.tab-header-items .tab-header-item:hover) {
      color: #40a9ff;
    }

    :deep(.tab-header-items .tab-header-item.active) {
      color: #1890ff;
    }

    :deep(.tab-header-items  .tab-header-item.active:after) {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      height: 2px;
      background-color: #1890ff;
      width: 100%;
    }
  }

  .dp-drawer-content-tabs-content {
    padding: 0 16px;
    :deep(.tab-pane) {
      position: relative;
      height: calc(100vh - 96px);
    }
  }
  .dp-drawer-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    :deep(.header-text) {
      display: flex;
      flex:1;
      //max-width: 80%;
    }
    :deep(input) {
      width: 320px!important;
    }
    :deep(.header-text .serialNumber) {
      margin-right: 6px;
    }

    :deep(.drawer-action) {
      padding-right: 40px;
      display: flex;
      align-items: center;
      cursor: pointer;

      .drawer-action-item {
        margin-left: 18px;
        .anticon {
          color: rgb(153, 153, 153);

          &:hover {
            color: #1677ff;
          }
        }
      }
    }
  }
}

</style>
