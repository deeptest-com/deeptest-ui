<template>
  <a-modal
      :visible="visible"
      :class="['ly-leave-prompt']"
      :closable="false"
      :title="null">
    <p class="title"><ExclamationCircleOutlined class="icon"/>当前页面有修改的内容未保存</p>
    <p class="tip">是否保存后再离开？</p>
    <template #footer>
      <a-button key="handleCancel" @click="handleCancel">取消</a-button>
      <a-button key="handleLeave" @click="handleLeaveAndNoSave">不保存</a-button>
      <a-button type="primary" key="handleSaveAndLeave" @click="handleSaveAndLeave">保存并离开</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import {computed, defineEmits, defineProps, provide, ref, watch} from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  visible: {
    required: true,
    type: Boolean,
    default: false,
  },
})

watch(() => {
  return props.visible
},() => {
  if(props.visible){
    console.log('visible', props.visible)
  }
})

const emit = defineEmits(['handleCancel', 'handleLeaveAndNoSave', 'handleSaveAndLeave']);
function handleCancel() {
    emit('handleCancel');
}
function handleLeaveAndNoSave() {
    emit('handleLeaveAndNoSave');
}
function handleSaveAndLeave() {
    emit('handleSaveAndLeave');
}
</script>

<style lang="less" scoped>
.title{
  color: #000000d9;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  display: flex;
  align-items: center;
}
.icon{
  margin-right: 10px;
  font-size: 22px;
  color: #faad14;
}
.tip{
  margin-top: 16px;
  color: #000000d9;
  font-size: 14px;
  margin-left: 32px;
}

</style>

<style lang="less">
.ly-leave-prompt{
  .ant-modal-footer{
    border-top:none;
  }
}
</style>

