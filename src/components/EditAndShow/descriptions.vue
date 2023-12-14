<template>
  <div :class="['description', isEdit && 'description-edit-box']">
    <!-- 编辑文本区域 -->
    <div class="description-editor" v-if="isEdit">
      <a-textarea v-model:value="textValue" placeholder="填写描述" :autoSize="{ minRows: minRows || 2, maxRows: maxRows || 6 }"></a-textarea>
    </div>
    <!-- 展示文本区域 -->
    <div v-else :style="style" class="description-text" title="双击编辑描述" v-html="description || '暂无'" @dblclick="isEdit = true">
    </div>
    <!-- 编辑按钮 -->
    <div v-if="!isEdit" class="description-edit" @click="isEdit = true">
      <EditOutlined />
    </div>
    <!-- 操作按钮 -->
    <div class="description-action" v-if="isEdit" @click="isEdit = false">
      <span class="description-action-item">
        <CloseOutlined />
      </span>
      <span class="description-action-item" @click="handleConfirm">
        <CheckOutlined />
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons-vue';
import { ref, defineProps, defineEmits, onMounted, computed, watch } from 'vue';
import { transformHtmlToTextare, transformTextareaToHtml } from '@/utils/comm'; 

const props = defineProps<{
  description?: string | undefined;
  minRows?: number;
  maxRows?: number;
}>();

const emits = defineEmits(['confirm']);
const textValue = ref('');
const isEdit = ref(false);
const lineHeight = 20;
const style = computed(() => {
  return {
    minHeight: `${(props.minRows || 2) * lineHeight}px`,
    maxHeight: `${(props.maxRows || 6) * lineHeight}px`
  }
})

const handleConfirm = () => {
  // 处理 textarea的空格，换行， \r\n 兼容i7,i8,  \n兼容i9以上   \s处理所有空格，包含中英文
  const result = transformTextareaToHtml(textValue.value);
  emits('confirm', result);
}

watch(() => {
  return props.description;
}, (v) => {
  if (v) {
    textValue.value = transformHtmlToTextare(v);
  }
}, {
  immediate: true,
})
</script>

<style scoped lang="less">
.description {
  position: relative;
  overflow-y: scroll;
  width: 100%;
  display: inline-table;

  &:not(.description-edit-box):hover {
    border: 1px solid #d0d3d6;
    border-radius: 2px;
    box-sizing: border-box;
    .description-edit {
      display: flex;
    }
  }

  .description-text {
    cursor: pointer;
    overflow: scroll;
  }

  .description-edit {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    width: 24px;
    height: 100%;
    box-shadow: 0 3px 6px #6f6f6f33;
    justify-content: center;
    background-color: #091e4221;
    padding-top: 10px;
    cursor: pointer;

    :deep(.anticon) {
      color: #000;
    }
  }

  .description-action {
    position: absolute;
    bottom: 2px;
    right: 2px;
    color: #fff;
    padding: 3px;
    display: flex;
    align-items: center;
    box-shadow: 0 3px 6px #6f6f6f33;

    .description-action-item {
      display: inline-block;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #091e4214;
      border-radius: 2px;
      cursor: pointer;

      &:first-child {
        margin-right: 3px;
      }

      :deep(.anticon) {
        color: #000;
      }
    }
  }
}
</style>