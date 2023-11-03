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
        @update-title="updateTitle"/>
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
          <a-button v-if="activeTabKey === 'request' && showSaveBtn" type="primary" @click="save">
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
        <EndpointDefine v-if="activeTabKey === 'request'"
                        @switchMode="switchMode" />

        <EndpointDebug v-if="activeTabKey === 'run'"
                       @switchToDefineTab="switchToDefineTab" />

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
import {computed, defineEmits, defineProps, provide, ref, watch} from 'vue';
import {useStore} from "vuex";
import { useRouter } from "vue-router";

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
import { DetailHeader, DetailTabHeader } from '@/views/component/DetailLayout';
import { EndpointTabsList } from '@/config/constant';

const store = useStore<{ Endpoint, ProjectGlobal, ServeGlobal,Global }>();
const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);

defineProps({
  visible: {
    required: true,
    type: Boolean,
  },
})

const emit = defineEmits(['ok', 'close', 'refreshList']);

const router = useRouter();

const showList = ref(true)
const docsData = ref(null);

const stickyKey = ref(0);
async function changeTab(value) {
  console.log('changeTab', value)

  // click cases tab again, will cause EndpointCases component back to case list page
  if (activeTabKey.value === 'cases' && activeTabKey.value === value) {
    showList.value = true // back to list
    return
  }

  activeTabKey.value = value;
  stickyKey.value ++;
  // 切换到调试页面时，需要先保存
  if (value === 'run') {
    // Comment out since it cause a issue in ./Debug/method @chenqi
    // await store.dispatch('Endpoint/updateEndpointDetail',
    //     {...endpointDetail.value}
    // );
    // 获取最新的接口详情,比如新增的 接口的id可能会变化，所以需要重新获取
    // await store.dispatch('Endpoint/getEndpointDetail', {id: endpointDetail.value.id});

  } else if (value === 'docs') {
    docsData.value = await store.dispatch('Endpoint/getDocs', {
      endpointIds: [endpointDetail.value.id],
      needDetail: true,
    });
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

const globalActiveTab = computed(()=>store.state.Endpoint.globalActiveTab);

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

  store.commit("Global/setSpinning",true)
  await store.dispatch('Endpoint/updateEndpointDetail',
      {...endpointDetail.value}
  ).finally( ()=>{
        store.commit("Global/setSpinning",false)
      }
  );
  store.commit("Global/setSpinning",false)
  notifySuccess('保存成功');
  emit('refreshList');
}

const detailLink = computed(() => {
  const { params: { projectNameAbbr = '' } } = router.currentRoute.value;
  return `${window.location.origin}/${projectNameAbbr}/IM/${endpointDetail.value?.serialNumber}`;
})

provide('notScrollIntoView', true);
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

