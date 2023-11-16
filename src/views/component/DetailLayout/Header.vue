<template>
  <div class="header-text">
    <span class="serialNumber" v-if="serialNumber">[{{ serialNumber }}]</span>
    <EditAndShowField 
      placeholder="修改标题"
      :custom-class="!canEdit ? 'readonly' : ''"
      :can-edit="canEdit"
      :value="name || ''"
      @update="updateTitle"/>
      <div class="diff-tag" v-if="isChanged">
        <a-tag color="warning">
          <template #icon>
            <ExclamationCircleFilled :style="{color: '#fb8b06'}" />
        </template>
          自动同步更新内容待确认，点此<a style="color:#427EE6;" @click="showDiff">查看详情</a></a-tag>
      </div>
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
import { defineProps, defineEmits, computed } from "vue";
import {ExclamationCircleFilled } from '@ant-design/icons-vue';
import EditAndShowField from '@/components/EditAndShow/index.vue';
import { DrawerAction } from "@/views/component/DrawerLayout/drawerAction";
import {useStore} from "vuex";
const store = useStore<{ Endpoint,ProjectGlobal }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

const props = defineProps({
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


function showDiff() {
  store.commit('Endpoint/setDiffModalVisible', {endpointId:props.endpointId,visible:true,projectId:currProject.value.id,callPlace:"detail"});
}


</script>