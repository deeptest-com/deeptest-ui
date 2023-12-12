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
        @change-serve="changeServe"
        @changeCategory="changeCategory"/>
    </template>
    <template #tabHeader>
      <DetailTabHeader :tab-list="EndpointTabsList" :show-btn="true" @change-tab="changeTab" :active-key="activeTabKey">
        <template #btn>
          <a-button v-if="activeTabKey === 'request' && showFooter" :disabled="!isDefineChange" type="primary" @click="save">
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
import {onBeforeRouteLeave, useRouter} from 'vue-router';
import { useStore } from 'vuex';

import { Endpoint } from "@/views/endpoint/data";
import EndpointBasicInfo from '../Drawer/EndpointBasicInfo.vue';
import EndpointDefine from '../Drawer/Define/index.vue';
import EndpointDebug from '../Drawer/Debug/index.vue';
import EndpointCases from '../Drawer/Cases/index.vue';
import EndpointMock from '../Drawer/Mock/index.vue';
import IconSvg from "@/components/IconSvg";
import Docs from '@/components/Docs/index.vue';
import { DetailHeader, DetailLayout, DetailTabHeader } from '@/views/component/DetailLayout';
import { EndpointTabsList } from '@/config/constant';
import { notifySuccess } from '@/utils/notify';
import {StateType as ServeStateType} from "@/store/serve";
import {equalObjectByLodash} from "@/utils/object";
import Swal from "sweetalert2";
import settings from "@/config/settings";
import bus from "@/utils/eventBus";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
const router = useRouter();
const store = useStore<{ Endpoint, ProjectGlobal, ServeGlobal: ServeStateType, Global ,Debug}>();
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
    await store.dispatch('Project/getUserList');
    store.dispatch('ServeGlobal/fetchServe');
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
  await store.dispatch('Endpoint/updateEndpointName',
      {id: imDetail.value.id, name: title}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
}

async function changeDescription(description) {
  await store.dispatch('Endpoint/batchUpdateField', {
    "fieldName": 'description',
    "value": description,
    "endpointIds": [imDetail.value.id]
  });
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
}

async function changeCategory(value) {
  await store.dispatch('Endpoint/batchUpdateField', {
    "fieldName": 'categoryId',
    value,
    "endpointIds": [imDetail.value.id]
  });
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
  await store.dispatch('Endpoint/loadCategory');
}

async function changeServe(value:number) {
  await store.dispatch('Endpoint/batchUpdateField', {
    "fieldName": 'serveId',
    value,
    "endpointIds": [imDetail.value.id]
  });
  await store.dispatch('Endpoint/getEndpointDetail', {id: imDetail.value.id});
}

const activeTabKey = ref('request');
const stickyKey = ref(0);
const showList = ref(true);
const docsData = ref(null);

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


/*************************************************
 * ::::离开保存代码逻辑部分start
 ************************************************/
const {
  isLeaveTip,
  isDefineChange,
  isMockChange,
  debugChange,
  debugChangeBase,
  debugChangePostScript,
  debugChangeCheckpoint,
  debugChangePreScript,
  resetMockChange,
  resetDefineChange,
  debugData,
  debugInfo,
  srcDebugData,
  srcEndpointDetail,
  endpointDetail,
  isDebugChange,
  resetDebugChange,
  clearMockChange,
  clearDefineChange,
  clearDebugChange,
} = useIMLeaveTip();

// 接口定义 - 调试模块是否改变了 - 用于离开提示
watch(() => {
  return [debugData.value,srcDebugData.value]
}, () => {
  const cur = debugData.value;
  const src = srcDebugData.value;
  if(!src?.usedBy || !cur?.usedBy){
    return;
  }
  // 处理格式化的数据
  const isChange = !equalObjectByLodash(src, cur);
  store.commit('Debug/setDebugChange', {base:isChange});
},{
  deep: true
})

//  接口定义 - 接口信息改变了 - 用于离开提示
watch(() => {
  return [endpointDetail.value,srcEndpointDetail.value]
}, (newVal, oldValue) => {
  const src = srcEndpointDetail.value;
  const cur = endpointDetail.value;
  const isInit = cur?.id && src?.id;
  const isChange = !equalObjectByLodash(cur, src);
  if(isInit){
    store.commit('Endpoint/setIsDefineChange', isChange);
  }else {
    store.commit('Endpoint/setIsDefineChange', false);
  }
}, {
  deep: true
});


async function handleChangeTab(value) {
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

async function changeTab(value) {
  if(!isLeaveTip.value) {
    await handleChangeTab(value)
    return
  }
  // 走到这儿，说明接口定义有变化，需要提示用户是否要保存
  const result = await Swal.fire({
    ...settings.SwalLeaveSetting
  });
  // 如果接口定义有变化，需要提示用户保存
  if (isDefineChange.value) {
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      await save();
      resetDefineChange();
      // 保存成功后，切换tab
      activeTabKey.value = value;
      stickyKey.value++;
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      activeTabKey.value = value;
      stickyKey.value++;
      resetDefineChange()
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }
  // 调试模块数据有变化，需要提示用户是否要保存调试数据
  else if(isDebugChange.value){
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveDebugSaveData, {});
      resetDebugChange();
      // 保存成功后，切换tab
      activeTabKey.value = value;
      stickyKey.value++;
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      activeTabKey.value = value;
      stickyKey.value++;
      resetDebugChange();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }
  // mock 数据变化了，需要提示保存
  else if(isMockChange.value){
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveMockSaveData, {});
      resetMockChange();
      // 保存成功后，切换tab
      activeTabKey.value = value;
      stickyKey.value++;
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      activeTabKey.value = value;
      stickyKey.value++;
      resetMockChange();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }
}

// 与 beforeRouteLeave 相同，无法访问 `this`
onBeforeRouteLeave(async (to, from,next) => {
  if(!isLeaveTip.value){
    next();
    return false;
  }
  const result = await Swal.fire({
    ...settings.SwalLeaveSetting
  });
  // 如果接口定义有变化，需要提示用户保存
  if (isDefineChange.value) {
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      await save();
      next();
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      next();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('保留');
      return false;
    }
  }
  // 调试模块数据有变化，需要提示用户是否要保存调试数据
  else if(isDebugChange.value){
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveDebugSaveData, {});
      resetDebugChange();
      next()
    }
    // isDenied: false,  不保存，并离开 ,需要重置调试数据
    else if (result.isDenied) {
      resetDebugChange();
      next()
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      return false;
    }
  }else if(isMockChange.value){
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveMockSaveData, {});
      resetMockChange();
      next()
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      resetMockChange();
      next()
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      return false;
    }
  }
})

// 离开页面时，重置数据
onUnmounted(() => {
  clearDefineChange();
  clearMockChange();
  clearDebugChange();
})

/*************************************************
 * ::::离开保存代码逻辑部分end
 ************************************************/

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
