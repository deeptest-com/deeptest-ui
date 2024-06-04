<template>
  <a-spin tip="loading....." :spinning="spinning">
    <div :class="['detail-wrapper', prefixCls, isLinkFromLy ? 'no-padding': '']">
      <template v-if="show">
        <div class="detail-header" v-if="!isLinkFromLy">
          <slot name="header" />
        </div>
        <a-divider v-if="!isLinkFromLy" />
        <div class="detail-content" ref="contentRef">
          <div class="detail-basic-info" v-if="showBasicInfo">
            <slot name="basicInfo" />
          </div>
          <div class="detail-tab-header" v-if="showTabHeader">
            <slot name="tabHeader" />
          </div>
          <div class="detail-tab-content">
            <slot name="tabContent" />
          </div>
        </div>
      </template>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import { defineProps, computed, watch, ref, onUnmounted, provide } from 'vue';
import { useStore } from 'vuex';

import { StateType as DetailStateType } from "./store";
import { useRoute } from 'vue-router';

const props = defineProps({
  showTabHeader: {
    type: Boolean,
    default: true,
    required: true,
  },
  stickyKey: {
    type: [Number, String],
    default: '0',
    required: false,
  },
  showBasicInfo: {
    type: Boolean,
    default: true,
    required: false,
  },
  prefixCls: {
    type: String,
    default: '',
    required: false,
  }
});

const store = useStore<{ Detail: DetailStateType, Global }>();
const spinning = computed(() => store.state.Global.spinning);
const show = computed(() => store.state.Detail.show);

const contentRef = ref();
const containerScrollTop = ref(0);

const onScroll = (event) => {
  containerScrollTop.value = (event.target && event.target.scrollTop) || 0;
};

const router = useRoute();

const isLinkFromLy = computed(() => {
  return router.query.linkOrigin;
})

watch(() => {
  return props.stickyKey;
}, val => {
  if (val && contentRef?.value) {
    const el = document.getElementsByClassName('detail-basic-info');
    if (el && el[0]) {
      const { height } = el[0].getBoundingClientRect();
      contentRef?.value?.scrollTo(0, height);
    }
    
  }
}, {
  immediate: true,
});

watch(() => {
  return contentRef.value;
}, val => {
  if (val) {
    val.addEventListener('scroll', onScroll);
  }
});

onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('scroll', onScroll);
  }
});

provide('containerScrollTop', computed(() => containerScrollTop.value));
</script>

<style scoped lang="less">
.detail-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;

  &.detail-view-full {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999999;
  }

  :deep(.ant-divider-horizontal) {
    margin: 0;
  }

  .detail-header {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    :deep(.header-text) {
      display: flex;
      max-width: 80%;

      .serialNumber {
        font-weight: bold;
        margin-right: 6px;
      }
    }
  }

  .detail-header, .detail-basic-info, .detail-tab-header, .detail-tab-content {
    padding: 0 16px;
  }

  &.no-padding {
    .detail-header, .detail-basic-info, .detail-tab-header, .detail-tab-content {
      padding: 0;
    }

    .detail-basic-info {
      padding-top: 16px;
    }

    .detail-header {
      padding-top: 16px;
    }

    .detail-content {
      height: 100%;
      overflow: unset;
    }
  }

  .detail-basic-info {
    padding-top: 20px;
    padding-bottom: 6px;
  }

  .detail-tab-header {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    border-bottom: 1px solid #f0f0f0;
    margin: 0 16px;
    background-color: #ffffff;
    z-index: 100;
  }

  .detail-content {
    height: calc(100% - 48px);
    overflow-y: scroll;
  }

  .detail-tab-content {
    height: calc(100% - 48px);

    :deep(.tab-pane) {
      height: 100%;
    }
  }

  :deep(.drawer-action) {
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
</style>