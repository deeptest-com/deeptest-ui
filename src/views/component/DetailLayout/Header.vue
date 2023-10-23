<template>
  <div class="header-text">
    <span class="serialNumber" v-if="serialNumber">[{{ serialNumber }}]</span>
    <EditAndShowField 
      placeholder="修改标题"
      :custom-class="!canEdit ? 'readonly' : ''"
      :can-edit="canEdit"
      :value="name || ''"
      @update="updateTitle"/>
  </div>
  <DrawerAction
    v-if="showAction"
    :show-full-screen="true" 
    :show-share="showShare"
    :share-link="shareLink"
    :show-detail="showDetail" 
    :detail-link="detailLink"/>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

import EditAndShowField from '@/components/EditAndShow/index.vue';
import { DrawerAction } from "@/views/component/DrawerLayout/drawerAction";

defineProps({
  name: {
    type: String,
    default: '',
    required: true,
  },
  serialNumber: {
    type: String,
    default: '',
    required: false,
  },
  showAction: {
    type: Boolean,
    default: false,
    required: true,
  },
  detailLink: {
    type: String,
    default: '',
    required: false,
  },
  showDetail: {
    type: Boolean,
    default: false,
    required: false,
  },
  canEdit: {
    type: Boolean,
    default: true,
    required: false,
  },
  showShare: {
    type: Boolean,
    default: false,
    required: false,
  },
  shareLink: {
    type: String,
    default: '',
    required: false,
  },
});

const emits = defineEmits(['updateTitle']);

const updateTitle = v => {
  emits('updateTitle', v);
};
</script>