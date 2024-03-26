<template>
  <div class="endpoint-content">
    <a-spin tip="Loading..." :spinning="isImporting" style="z-index: 2000;">
      <ContentPane>
        <template #left>
          <Tree />
          <SchemaTree ref="schemaTree" @select="showSchema"/>
        </template>
        <template #right>
          <div v-if="activeTabs.length > 0" class="endpoint-right-content">
            <a-tabs 
              class="im-tabs-full-height"
              :activeKey="activeTab.key" 
              hide-add type="editable-card" 
              @change="changeTab" 
              @edit="onEdit">
              <a-tab-pane v-for="item in activeTabs" :key="item.key">
                <template #tab>
                  <a-dropdown :trigger="['contextmenu']" :visible="visible[item.id]">
                    <div v-on-click-outside="canelVisible" @contextmenu="openDropdown(item)">
                      <FolderOpenOutlined v-if="item.type === 'im-dir'" />
                      <IconSvg v-if="item.type === 'schema'" type="model" class="dp-icon-large"/>
                      <span v-if="item.type === 'im'" class="endpoint-im-tab">
                        <span 
                          class="endpoint-method" 
                          :style="{ 'color': getMethodColor(item.activeMethod) }">
                          {{ item.activeMethod }}&nbsp;
                        </span>
                        {{ item?.entityData?.name || item.name }}
                      </span>
                      <span v-else>{{ item.name }}</span>
                    </div>
                    <template #overlay>
                      <a-menu @click="e => handleMenuClick(e, item)">
                        <a-menu-item v-for="item in dropdownMenu" :key="item.key">{{ item.label }}</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </template>
                <div :class="['endpoint-tab-content', item.type]">
                  <Detail v-if="item.type === 'im' && item.entityData?.id === activeTab.entityData?.id" :endpoint-id="item.entityData?.id"/>
                  <List v-else-if="item.type === 'im-dir' || item.id === -1" :category-id="item.id"/>
                  <SchemaEditorContent v-else />
                </div>
              </a-tab-pane>
              <template #tabBarExtraContent>
                <div 
                  :class="['extra-menu', dropdownVisible ? 'visible' : '']" 
                  @mouseenter="dropdownVisible = true" 
                  @mouseleave="dropdownVisible = false">
                  <span style="cursor: pointer;margin-right: 20px;"><EllipsisOutlined /></span>
                  <a-menu @click="e => handleMenuClick(e)">
                    <a-menu-item v-for="(item) in dropdownMenu" :key="item.key">{{ item.label }}</a-menu-item>
                  </a-menu>
                </div>
              </template>
            </a-tabs>
          </div>
          <div v-else class="endpoint-empty-content">
            <a-empty  description="请先在左侧目录上选择需要调试的接口"/>
          </div>
        </template>
      </ContentPane>
    </a-spin>
  </div>
</template>
<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { EllipsisOutlined, FolderOpenOutlined } from "@ant-design/icons-vue";
import { vOnClickOutside } from '@vueuse/components';
import ContentPane from '@/views/component/ContentPane/index.vue';
import IconSvg from '@/components/IconSvg';
import { Tree, Detail, List } from './components';
import { SchemaTree } from '../component/Schema';
import { SchemaEditorContent } from '@/views/component/Schema/components';
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import eventBus from '@/utils/eventBus';
import settings from '@/config/settings';
import { getMethodColor } from '@/utils/dom';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore<{ Endpoint: EndpointStateType, ProjectGlobal }>();

const currProject = computed(() => store.state.ProjectGlobal.currProject);
const isImporting = ref(false);
const activeTab = computed(() => {
  return store.state.Endpoint.activeTab;
});
const activeTabs = computed(() => {
  const tabs = store.state.Endpoint.activeTabs || [];
  tabs.forEach((e) => {
    visible.value[e.id] = false;
  })
  return tabs;
});

const dropdownVisible = ref(false);
const dropdownMenu = [
  {
    key: "close_cur",
    label: "关闭当前标签页",
  },
  {
    key: "close_other",
    label: "关闭其他标签页",
  },
  {
    key: "close_all",
    label: "关闭所有标签页",
  }
];

const handleMenuClick = (evt, record?: any) => {
  dropdownVisible.value = false;
  switch(evt.key) {
    case 'close_cur':
      if (!record || record?.id === activeTab.value.id) {
        store.dispatch('Endpoint/removeActiveTab', activeTab.value.id);
      } else {
        store.commit('Endpoint/setActiveTabs', activeTabs.value.filter(e => e.id !== record.id));
      }
      break;
    case 'close_other':
      if (!record || record?.id === activeTab.value.id) {
        store.commit('Endpoint/setActiveTabs', [activeTab.value]);
      } else {
        store.commit('Endpoint/setActiveTab', record);
        store.commit('Endpoint/setActiveTabs', [record]);
      }
      break;
    case 'close_all':
      store.commit('Endpoint/setActiveTab', null);
      store.commit('Endpoint/setActiveTabs', []);
      break;
    default:
      break;  
  }
};

const showSchema = e => {
  console.log(e);
};

const visible = ref({ "-10": false });
const canelVisible = () => {
  activeTabs.value.forEach(e => {
    visible.value[e.id] = false;
  })
};

const openDropdown = item => {
  activeTabs.value.forEach(e => {
    visible.value[e.id] = false;
  })
  visible.value[item.id] = true;
};

const changeTab = key => {
  const curr = activeTabs.value.find(e => (e.id === key || e.entityId === key || e?.entityData?.id === key));
  store.commit('Endpoint/setActiveTab', curr);
  if (curr.type === 'schema') {
    store.dispatch('Schema/querySchema', { id: curr.entityId });
  }
};

const onEdit = (e, type?: string) => {
  store.dispatch('Endpoint/removeActiveTab', e);
};

/**
 * 查看组件详情
 */
const setActiveSchema = () => {
  const { query }: any = router.currentRoute.value;
  if (query.ref) {
    const ref = JSON.parse(query.ref);
    let activeSchema = { ...ref, key: ref.id, type: 'schema' };
    store.commit('Endpoint/setActiveTab', activeSchema);
    if (!activeTabs.value.find(e => e.id === ref.id)) {
      store.commit('Endpoint/setActiveTabs', [...activeTabs.value, activeSchema]);
    }
    store.dispatch('Schema/querySchema', { id: ref?.entityId });
  }
}


const schemaTree = ref();
onMounted(() => {
  eventBus.on(settings.eventEndpointAction, (data: any) => {
    if (data.type === 'getSchemaTreeList') {
      schemaTree.value?.loadCategory();
    }
  })
})

watch(() => {
  return currProject.value;
}, async (val, oldVal) => {
  if (val?.id) {
    await store.dispatch('Schema/loadCategory');
    setActiveSchema();
  }
}, {
  immediate: true,
})
</script>

<style scoped lang="less">
.endpoint-content {
  height: 100%;
  overflow: hidden;

  :deep(.ant-tabs-tab) {
    div {
      display: flex;
      align-items: center;
    }
  }

  :deep(.pane.right) {
    overflow: hidden;
  }

  .endpoint-right-content {
    height: 100%;
  }

  .endpoint-empty-content {
    margin-top: 32px;
  }

  :deep(.ant-tabs.im-tabs-full-height) {
    height: 100%;

    .ant-tabs-content {
      height: calc(100% - 56px);

      .ant-tabs-tabpane {
        height: 100%;

        &.ant-tabs-tabpane-inactive {
          height: 0;
        }
      }
    }

    .ant-tabs-extra-content {
      
    }
  }

  .endpoint-tab-content {
    height: 100%;
    &.im-dir {
      overflow-x: scroll;
    }

    &.schema {
      overflow-y: scroll;
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
</style>
