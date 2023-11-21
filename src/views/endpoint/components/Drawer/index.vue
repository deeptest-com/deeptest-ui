<template>
  <DrawerLayout :visible="visible" @close="emit('close');" :stickyKey="stickyKey">
    <!-- 头部信息  -->
    <template #header>
      <DetailHeader
        :name="endpointDetail?.title"
        :serial-number="endpointDetail?.serialNumber"
        :show-action="true"
        :detail-link="detailLink"
        :share-link="detailLink"
        :show-detail="true"
        :show-share="true"
        @update-title="updateTitle" >
        <template #custom>
          <div class="diff-tag" v-if="endpointDetail.changedStatus > ChangedStatus.NoChanged" >   
          <a-tag :color="endpointDetail.changedStatus == ChangedStatus.Changed?'warning':''">
            <template #icon>
              <WarningFilled v-if="endpointDetail.changedStatus == ChangedStatus.Changed"  @click="showDiff(endpointDetail.id)" :style="{color: '#fb8b06'}" />
              <InfoCircleOutlined  v-if="endpointDetail.changedStatus == ChangedStatus.IgnoreChanged"  @click="showDiff(endpointDetail.id)" :style="{color: '#c6c6c6'}" />
          </template>
          {{endpointDetail.changedStatus == ChangedStatus.Changed?'待处理':'已处理'}}，{{endpointDetail.sourceType == SourceType.SwaggerImport?'定义与导入不一致':'定义和同步不一致'}}，点此<a style="color:#427EE6;" @click="showDiff(endpointDetail.id)">查看详情</a></a-tag>
        </div>
       </template>
      </DetailHeader>
    </template>
    <template #basicInfo>
      <!-- 基本信息 -->
      <EndpointBasicInfo
          @changeStatus="changeStatus"
          @change-description="changeDescription"
          @changeCategory="changeCategory"/>
    </template>
    <template #tabHeader>
      <DetailTabHeader :tab-list="EndpointTabsList" :show-btn="true" @change-tab="changeTab" :active-key="activeTabKey">
        <template #btn>
          <a-button v-if="activeTabKey === 'request' && showSaveBtn" type="primary" @click="save"
                    :disabled="!isDefineChange || isInit">
            <template #icon>
              <icon-svg class="icon dp-icon-with-text" type="save"/>
            </template>
            保存
          </a-button>
        </template>
      </DetailTabHeader>
    </template>
    <template #tabContent>
      <div class="tab-pane">
        <EndpointDefine v-if="activeTabKey === 'request' && endpointDetail?.id"
                        @switchMode="switchMode"/>

        <EndpointDebug v-if="activeTabKey === 'run'"
                       ref="endpointDebugRef"
                       @switchToDefineTab="switchToDefineTab"/>

        <EndpointCases v-if="activeTabKey === 'cases'"
                       v-model:showList="showList"
                       @switchToDefineTab="switchToDefineTab" />

        <EndpointMock v-if="activeTabKey === 'mock'"
                     @switchToDefineTab="switchToDefineTab" />


        <Docs :onlyShowDocs="true"
              :showHeader="false"
              v-if="activeTabKey === 'docs'"
              :data="docsData"
              @switchToDefineTab="switchToDefineTab"
              :show-menu="true"/> <!-- use v-if to force page reload-->
      </div>
    </template>
  </DrawerLayout>
</template>

<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  provide,
  ref,
  watch,
  defineExpose,
  onUnmounted,
  nextTick,
  onMounted
} from 'vue';
import {useStore} from "vuex";
import {useRouter} from "vue-router";
// ES6 Modules or TypeScript
import Swal from 'sweetalert2'
import IconSvg from "@/components/IconSvg";
import EndpointBasicInfo from './EndpointBasicInfo.vue';
import EndpointDefine from './Define/index.vue';
import EndpointDebug from './Debug/index.vue';
import EndpointCases from './Cases/index.vue';
import EndpointMock from './Mock/index.vue';
import Docs from '@/components/Docs/index.vue';
import DrawerLayout from "@/views/component/DrawerLayout/index.vue";
import {Endpoint} from "@/views/endpoint/data";
import {notifySuccess} from "@/utils/notify";
import {DetailHeader, DetailTabHeader} from '@/views/component/DetailLayout';
import {EndpointTabsList} from '@/config/constant';
import cloneDeep from "lodash/cloneDeep";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
import {WarningFilled,InfoCircleOutlined } from '@ant-design/icons-vue';
import {ChangedStatus,SourceType} from "@/utils/enum";

const store = useStore<{ Endpoint, ProjectGlobal, ServeGlobal, Global,Debug }>();
const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);
const isDefineChange: any = computed<Endpoint>(() => store.state.Endpoint.isDefineChange);
const debugData: any = computed<Endpoint>(() => store.state.Debug.debugData);
const props = defineProps({
  visible: {
    required: true,
    type: Boolean,
  },
})


defineExpose({
  save,
});

const emit = defineEmits(['ok', 'close', 'refreshList', 'changeTab']);

const router = useRouter();

const showList = ref(true)
const docsData = ref(null);

const stickyKey = ref(0);

const endpointDebugRef:any = ref(null);


const {isLeaveTip,isDebugChange,resetDebugChange,isMockChange,resetDefineChange,resetMockChange,clearDebugChange,clearDefineChange,clearMockChange} = useIMLeaveTip();
async function changeTab(value) {
  console.log('changeTab', value);
  if(!isLeaveTip.value) {
    // click cases tab again, will cause EndpointCases component back to case list page
    if (activeTabKey.value === 'cases' && activeTabKey.value === value) {
      showList.value = true // back to list
      return
    }
    activeTabKey.value = value;
    stickyKey.value++;
    if (value === 'docs') {
      docsData.value = await store.dispatch('Endpoint/getDocs', {
        endpointIds: [endpointDetail.value.id],
        needDetail: true,
      });
    }
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
      resetDefineChange()
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



function switchToDefineTab() {
  activeTabKey.value = 'request';
}

const showSaveBtn = ref(true);

function switchMode(val) {
  showSaveBtn.value = (val === 'form');
}



async function changeStatus(status) {
  await store.dispatch('Endpoint/updateStatus',
      {id: endpointDetail.value.id, status: status}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: endpointDetail.value.id});
}

async function updateTitle(title) {
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...endpointDetail.value, title: title}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: endpointDetail.value.id});
}

async function changeDescription(description) {
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...endpointDetail.value, description}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: endpointDetail.value.id});
}

async function changeCategory(value) {
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...endpointDetail.value, categoryId: value}
  );
  await store.dispatch('Endpoint/getEndpointDetail', {id: endpointDetail.value.id});

  await store.dispatch('Endpoint/loadCategory');
}


const activeTabKey = ref('request');

const globalActiveTab = computed(() => store.state.Endpoint.globalActiveTab);

watch(() => {
  return globalActiveTab.value
}, (newVal) => {
  if (newVal != "") {
    //activeTabKey.value = globalActiveTab
    switchToDefineTab()
  }
}, {immediate: true});


async function cancel() {
  emit('close');
}

async function save() {
  store.commit("Global/setSpinning", true)
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...endpointDetail.value}
  ).finally(() => {
        store.commit("Global/setSpinning", false)
      }
  );
  store.commit("Global/setSpinning", false)
  notifySuccess('保存成功');
  emit('refreshList');
  setTimeout(() => {
    store.commit('Endpoint/initEndpointDetail', cloneDeep(endpointDetail.value));
  }, 200);
}

const detailLink = computed(() => {
  const {params: {projectNameAbbr = ''}} = router.currentRoute.value;
  return `${window.location.origin}/${projectNameAbbr}/IM/${endpointDetail.value?.serialNumber}`;
})

provide('notScrollIntoView', true);


onUnmounted(() => {
  // 重置接口定义变化状态 、调试及 高级Mock变化状态，避免影响其他模块
  clearDefineChange();
  clearMockChange();
  clearDebugChange();
})


const isInit = ref(true);
onMounted(() => {
  isInit.value = false;
})

function showDiff(id:number) {
  store.commit('Endpoint/setDiffModalVisible', {endpointId:id,visible:true,projectId:endpointDetail.value.projectId,callPlace:"detail"});
}


</script>

<style lang="less" scoped>
.header-text {
  display: flex;
  max-width: 80%;

  .serialNumber {
    margin-right: 6px;
  }
}
</style>

