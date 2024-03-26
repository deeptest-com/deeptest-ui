<template>
  <div class="diagnose-interface-design-main">
      <div id="diagnose-interface-debug-panel">
        <a-tabs
          class="dp-tabs-full-height"
          type="editable-card"
          :hideAdd="true"
          :closable="true"
          v-if="interfaceTabs?.length"
          :activeKey="interfaceId"
          @edit="onTabEdit"
          @change="changeTab">
          <a-tab-pane
            v-for="tab in interfaceTabs"
            :title="tab.title"
            :key="tab.id"
            class="dp-relative">
            <template #tab>
              <a-dropdown :trigger="['contextmenu']" :visible="visible[tab.id]">
                <div v-on-click-outside="cancelVisible" @contextmenu="openDropdown(tab)">
                  <span :title="tab.title">{{ getTitle(tab.title) }}</span>
                </div>
                <template #overlay>
                  <a-menu @click="e => onContextMenuClick(e, tab)">
                    <a-menu-item v-for="item in tabsContextMenu" :key="item.key">{{ item.label }}</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
            <a-spin :spinning="spinning">
              <div class="interface-tabs-content">
                <template v-if="debugData?.method" >
                  <DebugComp :onSaveDebugData="saveDiagnoseInterface"
                              :baseUrlDisabled="false" />
                </template>
              </div>
            </a-spin>
          </a-tab-pane>
          <template #tabBarExtraContent>
            <div 
              :class="['extra-menu', dropdownVisible ? 'visible' : '']" 
              @mouseenter="dropdownVisible = true" 
              @mouseleave="dropdownVisible = false">
              <span style="cursor: pointer;margin-right: 20px;"><EllipsisOutlined /></span>
              <a-menu @click="e => onContextMenuClick(e)">
                <a-menu-item v-for="(item) in tabsContextMenu" :key="item.key">{{ item.label }}</a-menu-item>
              </a-menu>
            </div>
          </template>
        </a-tabs>
        <div  v-else style="margin-top: 36px;">
          <a-empty  :description="'请先在左侧目录上选择需要调试的接口'"/>
        </div>
      </div>

      <div class="selection">
       <!-- <EnvSelection /> -->
      </div>
  </div>
</template>

<script setup lang="ts">
import {computed, provide, ref, watch} from 'vue';
import {useStore} from "vuex";
import debounce from "lodash.debounce";
import { EllipsisOutlined } from '@ant-design/icons-vue';
import { vOnClickOutside } from '@vueuse/components';

import DebugComp from '@/views/component/debug/index.vue';
import {prepareDataForRequest} from "@/views/component/debug/service";
import {StateType as Debug} from "@/views/component/debug/store";

import {notifyError, notifySuccess} from "@/utils/notify";
import {UsedBy} from "@/utils/enum";
import {StateType as ServeStateType} from "@/store/serve";
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as DiagnoseInterfaceStateType} from '../store';
import { tabsContextMenu } from '@/utils/comm';

provide('usedBy', UsedBy.DiagnoseDebug)

const store = useStore<{ Debug: Debug, DiagnoseInterface: DiagnoseInterfaceStateType, ProjectGlobal: ProjectStateType, ServeGlobal: ServeStateType,Global }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const debugData = computed<any>(() => store.state.Debug.debugData);

const interfaceId = computed<any>(() => store.state.DiagnoseInterface.interfaceId);
const interfaceData = computed<any>(() => store.state.DiagnoseInterface.interfaceData);
const interfaceTabs = computed<any>(() => {
  const tabs = store.state.DiagnoseInterface.interfaceTabs;
  (tabs || []).forEach(e => {
    visible[e.id] = false;
  })
  return tabs;
});
const activeTabKey = ref();
const spinning = computed(()=> store.state.Global.spinning );

/**
 * tabs 右键菜单操作
 */
const visible = ref({});
const dropdownVisible = ref(false); // 三点菜单
const cancelVisible = () => {
  console.log(interfaceTabs);
  interfaceTabs.value.forEach(e => {
    visible.value[e.id] = false;
  })
};

const openDropdown = item => {
  interfaceTabs.value.forEach(e => {
    visible.value[e.id] = false;
  })
  visible.value[item.id] = true;
};

const onContextMenuClick = (evt, record?: any) => {
  dropdownVisible.value = false;
  switch(evt.key) {
    case 'close_cur':
      if (!record || record?.id === interfaceId.value) {
        store.dispatch('DiagnoseInterface/removeInterfaceTab', interfaceId.value);
      } else {
        store.dispatch('DiagnoseInterface/removeInterfaceTab', record.id);
      }
      break;
    case 'close_other':
      if (!record || record?.id === activeTabKey.value) {
        store.commit('DiagnoseInterface/setInterfaceTabs', interfaceTabs.value.filter(e => e.id === interfaceId.value));
      } else {
        store.commit('DiagnoseInterface/setInterfaceTabs', [record]);
        store.dispatch('DiagnoseInterface/openInterfaceTab', record);
      }
      break;
    case 'close_all':
      store.commit('DiagnoseInterface/setInterfaceTabs', []);
      store.commit('DiagnoseInterface/setInterfaceId', null);
      store.dispatch('Debug/resetDataAndInvocations');
      break;
    default:
      break;  
  }
}

function changeTab(key) {
  console.log('changeTab', key)
  activeTabKey.value = key
  store.commit('DiagnoseInterface/setInterfaceId', key)

  const found = interfaceTabs.value.find(function (item, index, arr) {
    return item.id === +key
  })
  store.dispatch('DiagnoseInterface/openInterfaceTab', found);
}

const usedBy = UsedBy.DiagnoseDebug
const loadDebugData = debounce(async () => {
  console.log('loadDebugData')
  store.commit("Global/setSpinning",true)
  await store.dispatch('Debug/loadDataAndInvocations', {
    diagnoseInterfaceId: interfaceData.value.id,
    usedBy: usedBy,
  });
  store.commit("Global/setSpinning",false)
}, 300)

watch((interfaceData), async (newVal) => {
  console.log('watch interfaceData', interfaceData?.value)

  if (!interfaceData?.value) {
    store.dispatch('Debug/resetDataAndInvocations');
    return
  }

  loadDebugData()

}, { immediate: true, deep: true })

// 切换项目时，需要判断正在调试的接口是否该项目下的接口，不是则需要清空 Tab list
watch(() => { return currProject.value.id },(newVal) => {
  if(newVal){
    store.commit('DiagnoseInterface/setInterfaceTabs',[])
  }
},{immediate:true})

const saveDiagnoseInterface = async (e) => {
  store.commit("Global/setSpinning",true)
  console.log('saveDiagnoseInterface')

    let data = JSON.parse(JSON.stringify(debugData.value))
    data = prepareDataForRequest(data)

    Object.assign(data, {envDataToView: null})

    const res = await store.dispatch('DiagnoseInterface/saveDiagnoseDebugData', data).finally(()=> store.commit("Global/setSpinning",false))

  if (res === true) {
    notifySuccess(`保存成功`);
  } else {
    notifyError(`保存失败`);
  }
  store.commit("Global/setSpinning",false)
}

const onTabEdit = (key, action) => {
  console.log('onTabEdit', key, action)
  if (action === 'remove') {
    store.dispatch('DiagnoseInterface/removeInterfaceTab', +key);
  }
};

const getTitle = (title) => {
  const len = title.length
  if (len <= 12) return title

  return title.substr(0, 16) + '...' + title.substr(len-6, len);
};

</script>

<style scoped lang="less">
.diagnose-interface-design-main {
  height: 100%;
  padding: 16px 0px 0 16px;

  #diagnose-interface-debug-panel {
    height: 100%;

    .interface-tabs-content {
      width: 100%;
      height: 100%;
    }

    :deep(.ant-tabs-tab) {
      div {
        display: flex;
        align-items: center;
      }
    }

    .extra-menu {
      position: relative;

      &.visible {
        :deep(.ant-menu) {
          height: max-content;
          transition: all .3s ease-in-out;
          opacity: 1;
        }
      }

      :deep(.ant-menu) {
        position: absolute;
        width: 122px;
        right: 16px;
        top: 32px;
        background-color: white;
        height: 0;
        box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        transition: all .3s ease-in-out;
        opacity: 0;
        z-index: 9999;
        .ant-menu-item {
          padding: 0;
          margin: 0;
          line-height: 32px;
          height: 32px !important;
          text-align: center;

          &:first-child {
            margin-top: 4px;
          }

          &:last-child {
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}

</style>
