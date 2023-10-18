<template>
  <div class="tab-header-items">
    <div class="tab-header-item"
          :class="{'active':tab.key === activeKey}" v-for="tab in tabList"
          :key="tab.key"
          @click="changeTab(tab.key)">
      <span>{{ tab.label }}</span>
    </div>
  </div>
  <div class="tab-header-btns" v-if="showBtn">
    <slot name="btn" />
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from "vue";

const props = defineProps<{
  tabList: any[];
  showBtn?: boolean;
  activeKey?: string;
}>();

const emits = defineEmits(['changeTab', 'handleClickBtn']);

const activeKey = ref(props.activeKey || props.tabList[0].key);

const changeTab = (key) => {
  activeKey.value = key;
  emits('changeTab', key);
};

watch(() => {
  return props.activeKey;
}, val => {
  if (val) {
    activeKey.value = val;
  }
})

</script>

<style scoped lang="less">
.tab-header {
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

.tab-header-items {
  width: 80%;
  display: flex;
  align-items: center;

  .tab-header-btns {
    width: 20%;
    display: flex;
    justify-content: flex-end;
  }

  .tab-header-item {
    color: #000000d9;
    position: relative;
    margin: 0 32px 0 0;
    padding: 12px 16px;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      color: #40a9ff;
    }

    &.active {
      color: #1890ff;

      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        background-color: #1890ff;
        width: 100%;
      }
    }
  }
}
</style>