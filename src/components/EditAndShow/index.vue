<template>
  <div class="editor" v-if="isEditing">
    <a-input class="input" :placeholder="placeholder || '请输入内容'" v-model:value="fieldValue"/>
    <a-space :size="8">
      <CloseOutlined @click.stop="cancelEdit"/>
      <CheckOutlined
          @click.stop="updateField"
          :class="{disabled: !fieldValue}"/>&nbsp;
    </a-space>
  </div>
  <div :class="['editor', customClass]" v-else>
    <span class="title" @click.stop="handleClick">{{ fieldValue || '暂无' }}</span> &nbsp;&nbsp;
    <span class="edit-icon"><EditOutlined @click.stop="isEditing = true"/></span>
  </div>
</template>
<script lang="ts" setup>
import {
  defineProps,
  defineEmits,
  ref, watch,
} from 'vue';
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue';
const isEditing = ref(false);
const fieldValue = ref('');
const props = defineProps({
  value: {
    required: true,
    type: String,
  },
  placeholder: {
    required: true,
    type: String,
  },
  customClass: {
    required: false,
    type: String,
  }
})
const emit = defineEmits(['update', 'edit']);

function updateField() {
  if (!fieldValue.value) {
    return;
  }
  emit('update', fieldValue.value);
  isEditing.value = false;
}

function cancelEdit() {
  fieldValue.value = props.value;
  isEditing.value = false;
}

function handleClick() {
  emit('edit');
}

watch(() => {
  return props.value
}, (newVal) => {
  fieldValue.value = newVal
}, {
  immediate: true
})

</script>

<style lang="less" scoped>
.editor {
  display: flex;
  align-items: center;

  &.custom-serve {
    color: #447DFD;
  }

  &.custom-endpoint {
    color: #447DFD;
  }

  &.show-on-hover {
    .edit-icon {
      display: none;
    }
    &:hover {
      .edit-icon {
        display: inline-block;
      }
    }
  }
  .input {
    margin-right: 8px;
  }

  .btns {
    flex: 1;
    line-height: 30px;
    .disabled {
      color: #00000040;
    }
  }

  .title {
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

</style>