<!--
  适用于 左侧目录树 + 右边区域表格筛选，且左侧目录树可伸缩
-->
<template>
  <div class="container" :style="containerStyle || {}">
    <div :class="['content', showExpand && 'expand-content']">
      <multipane class="vertical-panes" layout="vertical" @paneResize="handlePaneResize">
        <div ref="paneLeft" :class="['pane', 'left', !isFold && 'unfold']">
          <slot name="left"></slot>
        </div>
        <multipane-resizer />
        <div :class="['pane', 'right', !isFold && 'unfold']">
          <slot name="right"></slot>
          <div v-if="showExpand" class="expand-icon" @click="toggle">
            <img :src="PutAway" />
          </div>
        </div>
      </multipane>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import { defineProps, nextTick, ref } from 'vue'

import {Multipane, MultipaneResizer} from '@/components/Resize/index';
import PutAway from '@/assets/images/put-away.png';
import bus from "@/utils/eventBus";
import settings from "@/config/settings";

const {t} = useI18n();
defineProps(['containerStyle', 'showExpand'])
const isFold = ref(true);
const paneLeft = ref();

const toggle = async () => {
  isFold.value = !isFold.value;
};

const handlePaneResize = (...args) => {
  isFold.value = true;
  bus.emit(settings.paneResizeTop);
};

</script>

<style lang="less" scoped>
.container {
  background: #ffffff;
  height: 100%;

  :deep(.ant-pagination) {
    margin-right: 24px;
  }
  .content {
    display: flex;
    width: 100%;
    position: relative;
    height: 100%;

    &.expand-content {
      .right {
        overflow: unset;
      }
    }

    .left {
      position: relative;
      min-width: 150px;
      width: 250px;
      max-width: 600px;

      &.unfold {
        width: 0 !important;
        min-width: 0 !important;
      }

    }

    .right {
      flex: 1;
      overflow: scroll;
      position: relative;
      z-index: 2;
      padding-left: 1px;

      &.unfold {
        overflow: scroll;

        .expand-icon {
          transform: rotate(180deg);
          left: -14px;
        }
      }

      &:has(.expand-icon:hover) {
        overflow: unset;
        z-index: 2;
      }

      .expand-icon {
        position: absolute;
        top: 6px;
        left: -16px;
        width: 30px;
        height: 30px;

        img {
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
        }
      }
    }
  }
}

.vertical-panes {
  height: 100%;
  width: 100%;
}

</style>
