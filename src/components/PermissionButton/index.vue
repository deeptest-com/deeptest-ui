<template>
  <!-- 这里判断当前页面按钮是否在权限列表中,反之则提示用户 -->
  <a-tooltip :title="disabled ? disabledTooltip : null" color="#1677ff">
    <a-button
      class="permission-btn"
      :disabled="disabled"
      :type="type || 'default'"
      :loading="loading || false"
      :html-type="htmlType"
      :size="size"
      :danger="danger || false"
      @click="
        (e) => {
          handleClick(e);
        }
      "
    >
      <!-- 前置icon -->
      <slot name="before"></slot>
      {{ text }}
      <!-- 后置icon -->
      <slot name="after"></slot>
    </a-button>
  </a-tooltip>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import usePermission from "@/composables/usePermission";

const props = defineProps<{
  code?: string;
  text: string;
  disabled?: boolean;
  type?: string;
  htmlType?: string;
  danger?: boolean;
  size?: string;
  loading?: boolean;
  dataCreateUser?: string;
  action?: string;
  tip?: string;
}>();

const emits = defineEmits(["handleAccess"]);
const disabledTooltip = computed(() => props.tip || "暂无权限，请联系管理员");
const { hasPermission } = usePermission();
const disabled = computed(() => {
  if (props.disabled) {
    return true;
  }
  return !hasPermission(props.code);
});

const handleClick = (e) => {
  e.preventDefault();
  emits("handleAccess");
};


</script>
