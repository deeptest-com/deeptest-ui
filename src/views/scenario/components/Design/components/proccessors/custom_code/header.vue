<template>
  <div class="header">
    <div class="left">
      <icon-svg type="script" class="icon" />&nbsp;
      <span>JavaScript代码</span>
    </div>
    <div class="right">
      <a-button type="primary" size="small" @click.stop="save()" style="margin-right: 4px;">保存</a-button>
      <!-- <a-tooltip overlayClassName="dp-tip-small">
        <template #title>帮助</template>
        <QuestionCircleOutlined class="dp-icon-btn dp-trans-80" />
      </a-tooltip> -->

      <a-tooltip overlayClassName="dp-tip-small">
        <template #title>{{
          mode === "fullscreen" ? "还原" : "全屏"
        }}</template>
        <FullscreenExitOutlined
          v-if="mode === 'fullscreen'"
          @click.stop="closeFullScreen()"
          class="dp-icon-btn dp-trans-80"
        />
        <FullscreenOutlined
          v-else
          @click.stop="openFullscreen()"
          class="dp-icon-btn dp-trans-80"
        />
      </a-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, provide, defineProps, defineEmits } from "vue";
import { useStore } from "vuex";
import { message, notification } from "ant-design-vue";
import {
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SaveOutlined,
} from "@ant-design/icons-vue";
import IconSvg from "@/components/IconSvg";
import { StateType as ScenarioStateType } from "@/views/scenario/store";
import {notifyError, notifySuccess} from "@/utils/notify";

defineProps<{
  mode: string; // 小屏还是大屏
}>();

const emits = defineEmits(["updateScreen"]);

const store = useStore<{ Scenario: ScenarioStateType }>();
const modelRef: any = computed<any>(() => store.state.Scenario.nodeData);

const openFullscreen = () => {
  emits("updateScreen", true);
};
const closeFullScreen = () => {
  emits("updateScreen", false);
};

const save = async () => {
  const res = await store.dispatch("Scenario/saveProcessor", {
    ...modelRef.value,
    content: modelRef.value.content,
  });

  if (res === true) {
    notifySuccess("保存成功");
  } else {
    notifyError("保存失败");
  }
};
</script>
<style scoped lang="less">
.header {
  height: 42px;
  padding: 3px 8px;
  border: 1px solid #d9d9d9;
  background-color: #fafafa;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left,.right {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .left {
    flex: 1;
  }
  .right {
    justify-content: flex-end;
  }
}

</style>
