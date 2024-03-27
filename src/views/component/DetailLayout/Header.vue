<template>
  <div class="header-text">
    <span class="serialNumber" v-if="serialNumber">[{{ serialNumber }}]</span>

    <EditAndShowField
      placeholder="修改标题"
      :custom-class="!canEdit ? 'readonly' : ''"
      :can-edit="canEdit"
      :value="name || ''"
      @update="updateTitle" />

      <slot name='custom' />
  </div>

  <DrawerAction
    v-if="showAction"
    :show-full-screen="showFullScreen"
    :show-share="showShare"
    :share-link="shareLink"
    :showCopyCurl="showCopyCurl"
    :copy-curl="copyCurl"
    :show-detail="showDetail"
    :detail-link="detailLink" />

</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
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
   showFullScreen: {
     type: Boolean,
     default: true,
     required: false,
   },
   showCopyCurl: {
     type: Boolean,
     default: false,
     required: false,
   },
   copyCurl: {
     type: Function,
     required: false,
   },
  endpointId: {
    type: Number,
    default: 0,
    required: false,
  },
  isChanged: {
    type: Boolean,
    default: false,
    required: false,
  },
});




const emits = defineEmits(['updateTitle']);

const updateTitle = v => {
  emits('updateTitle', v);
};

</script>