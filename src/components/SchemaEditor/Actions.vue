<script lang="ts" setup>
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons-vue';
import {computed, defineProps, defineEmits} from "vue";
import IconSvg from "@/components/IconSvg";

const props = defineProps<{
  isFirst: boolean ,
  isLast: boolean ,
  isRoot: boolean,
  isRefChildNode: boolean,
}>();

const emit = defineEmits<{
  (e: 'moveUp', id?: number): void,
  (e: 'moveDown', value?: string): void,
  (e: 'copy', value?: string): void
}>()

const disableMoveUp = computed(() => {
  if(props.isRoot){
    return true;
  }
  return props.isFirst;
});
const disableMoveDown = computed(() => {
  if(props.isRoot){
    return true;
  }
  return props.isLast;
});
const disableCopy = computed(() => {
  return props.isRoot;
});

</script>

<template>
  <a-tooltip placement="topLeft" :title="disableMoveUp ? null :  '向上移动'" arrow-point-at-center>
    <a-button :size="'small'" :disabled="disableMoveUp" type="text" @click="emit('moveUp')">
      <template #icon>
        <ArrowUpOutlined/>
      </template>
    </a-button>
  </a-tooltip>
  <a-tooltip placement="topLeft" :title="disableMoveDown ? null :  '向下移动'" arrow-point-at-center>
    <a-button :size="'small'" :disabled="disableMoveDown" type="text" @click="emit('moveDown')">
      <template #icon>
        <ArrowDownOutlined/>
      </template>
    </a-button>
  </a-tooltip>
  <a-tooltip placement="topLeft" :title="disableCopy ? null :  '复制'" arrow-point-at-center>
    <a-button :size="'small'" :disabled="disableCopy" type="text" @click="emit('copy')">
      <template #icon>
        <IconSvg type="clone" />
      </template>
    </a-button>
  </a-tooltip>
</template>


