<template>
  <DetailLayout :show-basic-info="true" :show-tab-header="true" :sticky-key="stickyKey">
    <template #header>
      <DetailHeader 
        :serial-number="imDetail?.serialNumber || ''"
        :name="imDetail?.title || ''"
        @update-title="updateTitle"
        :show-action="false"
      />
    </template>
    <template #basicInfo>
      <EndpointBasicInfo
        @changeStatus="changeStatus"
        @change-description="changeDescription"
        @changeCategory="changeCategory"/>
    </template>
    <template #tabHeader>
      <DetailTabHeader :tab-list="EndpointTabsList" :show-btn="true" @change-tab="changeTab" :active-key="activeTabKey">
        <template #btn>
          <a-button v-if="activeTabKey === 'request' && showFooter" type="primary" @click="save">
            <template #icon>
              <icon-svg class="icon dp-icon-with-text" type="save" />
            </template>
            保存
          </a-button>
        </template>
      </DetailTabHeader>
    </template>
    <template #tabContent>
      <div class="tab-pane">
        <EndpointDefine 
          v-if="activeTabKey === 'request'"
          @switchMode="switchMode" />

        <EndpointDebug 
          v-if="activeTabKey === 'run'"
          @switchToDefineTab="switchToDefineTab" />

        <EndpointCases 
          v-if="activeTabKey === 'cases'"
          v-model:showList="showList"
          @switchToDefineTab="switchToDefineTab" />
        
        <EndpointMock 
          v-if="activeTabKey === 'mock'"
          @switchToDefineTab="switchToDefineTab" />
      
        <Docs 
          :onlyShowDocs="true"
          :showHeader="false"
          v-if="activeTabKey === 'docs'"
          :data="docsData"
          @switchToDefineTab="switchToDefineTab"
          :show-menu="true"/> <!-- use v-if to force page reload-->
      </div>
    </template>
  </DetailLayout>
</template>
<script setup lang="ts">
import { onMounted, computed, ref, watch, unref, onUnmounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { Endpoint } from "@/views/endpoint/data";
import EndpointBasicInfo from '../Drawer/EndpointBasicInfo.vue';
import EndpointDefine from '../Drawer/Define/index.vue';
import EndpointDebug from '../Drawer/Debug/index.vue';
import EndpointCases from '../Drawer/Cases/index.vue';
import EndpointMock from '../Drawer/Mock/index.vue';
import Docs from '@/components/Docs/index.vue';
import { DetailHeader, DetailLayout, DetailTabHeader } from '@/views/component/DetailLayout';
import { EndpointTabsList } from '@/config/constant';
import { notifySuccess } from '@/utils/notify';
import {StateType as ServeStateType} from "@/store/serve";

const router = useRouter();
const store = useStore<{ Endpoint, ProjectGlobal, ServeGlobal: ServeStateType, Global }>();
const imDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);
const globalActiveTab = computed(()=>store.state.Endpoint.globalActiveTab);

/**
 * 页面渲染时
 */
onMounted(async () => {
  await store.commit("Global/setSpinning", true);
  await store.commit("Detail/setShow", false);
  const { imSerialNumber = '' }: { imSerialNumber?: string } = router.currentRoute.value.params; 
  const tempArr = imSerialNumber.split('-');
  const id = tempArr[tempArr.length - 1];
  try {
    await store.dispatch('Endpoint/getEndpointDetail', { id });
    // 打开抽屉详情时，拉取mock表达式列表
    await store.dispatch('Endpoint/getMockExpressions');
    /**
     * 单独刷新详情页 需要初始化 用户列表和 serve列表
     */
    await store.dispatch("ServeGlobal/fetchServe");
    await store.dispatch('Project/getUserList');
    await store.dispatch('Endpoint/loadCategory');
    await store.commit("Global/setSpinning", false);
    await store.commit("Detail/setShow", true);
  } catch(e) {
    await store.commit("Global/setSpinning", false);
    await store.commit("Detail/setShow", true);
  }
});

/**
 * 基本信息部分
 */

async function changeStatus(status) {
  await store.dispatch('Endpoint/updateStatus',
      {id: imDetail.value.id, status: status}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
}

async function updateTitle(title) {
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...imDetail.value, title: title}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
}

async function changeDescription(description) {
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...imDetail.value, description}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
}

async function changeCategory(value) {
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...imDetail.value, categoryId: value}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
  await store.dispatch('Endpoint/loadCategory');
}

const activeTabKey = ref('request');
const stickyKey = ref(0);
const showList = ref(true);
const docsData = ref(null);

async function changeTab(value) {
  console.log('changeTab', value);

  // click cases tab again, will cause EndpointCases component back to case list page
  if (activeTabKey.value === 'cases' && activeTabKey.value === value) {
    showList.value = true // back to list
    return
  }

  activeTabKey.value = value;
  stickyKey.value ++;
  // 切换到调试页面时，需要先保存
  if (value === 'docs') {
    docsData.value = await store.dispatch('Endpoint/getDocs', {
      endpointIds: [imDetail.value.id],
      needDetail: true,
    });
  }
}

function switchToDefineTab() {
  activeTabKey.value = 'request';
}

const showFooter = ref(true);

function switchMode(val) {
  showFooter.value = (val === 'form');
}

async function save() {
  await store.commit('Global/setSpinning', true);
  await store.dispatch('Endpoint/updateEndpointDetail',
    {...imDetail.value}
  ).finally(()=> {
    store.commit('Global/setSpinning', false);
  });
  await store.commit('Global/setSpinning', false);
  notifySuccess('保存成功');
}

watch(() => {
  return globalActiveTab.value
}, (newVal) => {
  if (newVal) {
    activeTabKey.value = 'request';
  }
}, {immediate: true});

provide('notScrollIntoView', true);

</script>
<style lang="less" scoped>
.tab-pane {
  padding: 0 16px;
  height: calc(100% - 48px);

  :deep(.drawer-content) {
    height: 100% !important;

    .doc-container {
      height: 100%;
    }

    .left {
      height: 100% !important;
      overflow: hidden;
    }
  }
}
</style>