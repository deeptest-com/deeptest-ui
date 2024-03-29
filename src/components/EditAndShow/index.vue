<template>
  <div class="editor show-on-hover"
       v-if="isEditing"
       v-on-click-outside="cancelEdit">
    <a-input  class="input"
             :placeholder="placeholder || '请输入内容'"
             :size="'small'"
              ref="inputRef"
             @keydown.enter="updateField"
             v-model:value="fieldValue" />

    <a-space :size="8">
      <CloseOutlined @click.stop="cancelEdit"/>
      <CheckOutlined
          @click.stop="updateField"
          class="editor-icon"
          :class="{disabled: !fieldValue}"/>&nbsp;
    </a-space>
  </div>

  <div :class="['editor','show-on-hover', customClass]" v-else>
    <span class="title" @click.stop="handleClick">
      {{fieldValue === 0 ? '0' : (fieldValue === '' ? (emptyText || '空') : fieldValue)}}
    </span> &nbsp;&nbsp;

    <span class="edit-icon">
      <EditOutlined @click.stop="edit"/>
    </span>
  </div>

</template>
<script lang="ts" setup>

import {
  defineProps,
  defineEmits,
  nextTick,
  ref, watch,
} from 'vue';
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue';
import { vOnClickOutside } from '@vueuse/components';
import {notifyWarn} from "@/utils/notify";
const isEditing = ref(false);
const fieldValue = ref<any>('');
const editor = ref(null);
const props = defineProps({
  value: {
    required: true,
    type: [String, Number],
  },
  placeholder: {
    required: false,
    type: String,
  },
  customClass: {
    required: false,
    type: String,
  },
  autoFocus: {
    required: false,
    type: Boolean,
    default: false,
  },
  canEmpty: {
    required: false,
    type: Boolean,
    default: false,
  },
  emptyValue: {
    required: false,
    type: String,
    default: '暂无',
  },
  canEdit: {
    required: false,
    default: true,
    type: Boolean,
  },
  emptyText: {
    required: false,
    default: '',
    type: String
  }
})
const emit = defineEmits(['update', 'edit', 'cancel']);

function updateField() {
  if (!props.canEmpty && !fieldValue.value) {
    notifyWarn('请请输入内容');
    return;
  }
  emit('update', fieldValue.value);
  isEditing.value = false;
}

function edit() {
  isEditing.value = true;
  nextTick(() => {
    inputRef?.value?.focus();
  })
}
function cancelEdit() {
  fieldValue.value = props.value;
  isEditing.value = false;
  emit('cancel');
}

function handleClick() {
  emit('edit');
}
const inputRef:any = ref(null);

watch(() => {return props.value}, (newVal) => {
  fieldValue.value = newVal
}, {immediate: true})

watch(() => {return props.autoFocus}, (newVal) => {
  if (newVal) {
    isEditing.value = true;

    nextTick(() => {
      inputRef?.value?.focus();
    })

  }
}, {immediate: true})

</script>

<style lang="less" scoped>
.editor {
  display: flex;
  align-items: center;
  overflow: hidden;
  //flex: 1;
  height: 24px;

  &.custom-serve {
    color: #447DFD;
  }

  &.custom-endpoint {
    color: #447DFD;
  }

  &.text-gray {
    .title {
      color: #b0b0b0;
    }
  }

  &.text-bolder {
    font-weight: bolder;
  }
  &.show-on-hover {
    .edit-icon {
      display: none;
    }
    &:hover {
      .edit-icon {
        display: inline-block;
        color: #8A8A8A;
      }
    }

  }

  &.readonly {

    &:hover {
      .edit-icon {
        display: none !important;
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
