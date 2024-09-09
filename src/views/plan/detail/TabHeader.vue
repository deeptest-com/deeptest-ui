<template>
  <div class="tab-header-items">
    <div class="tab-header-item"
          :class="{'active':tab.key === activeKey}" v-for="tab in tabsList"
          :key="tab.key"
          @click="changeTab(tab.key)">
      <span>{{ tab.label }}</span>
    </div>
  </div>
  <div class="tab-header-btns">
    <ExecBtn placement="left">
      <template #execBtn="{ isNotClickable }">
        <a-button class="plan-exec" type="primary" :disabled="isNotClickable || checkDisabled" @click="handleEnvSelect(isNotClickable)">执行计划</a-button>
      </template>
    </ExecBtn>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps, computed, onMounted } from "vue";
import { useStore } from "vuex";
import ExecBtn from "@/components/ExecBtn/index.vue";
import { useRoute } from "vue-router";

const props = defineProps<{
  tabKey?: string;
}>();
const route = useRoute();
const emits = defineEmits(['changeTab', 'onSelectEnv']);
const status = ref(route.query.planStatus || '1');
const store = useStore<{ Plan, Project }>();
const currPlan = computed<any>(() => store.state.Plan.detailResult);
const checkDisabled = computed(() => {
  return Number(status.value) === 2 || currPlan.value.status === 'disabled';
});
const tabsList = [
  {
    "key": "test-scenario",
    "label": "测试场景"
  },
  {
    "key": "test-report",
    "label": "测试报告"
  },
];

const activeKey = ref(props.tabKey || 'test-scenario');

const changeTab = (key) => {
  activeKey.value = key;
  emits('changeTab', key);
};

const handleEnvSelect = async (isNotClickable) => {
  if (isNotClickable) {
    return;
  }
  emits('onSelectEnv');
}

const bus = window?.$wujie?.bus;

onMounted(() => {
    // emits('refreshList', formState);
    bus?.$on('sendMsgToThirdpartyAPI', ({ type, data }) => {
        if (type === 'getThirdpartyPlanStatus') {
            status.value = data;
        }
    })
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