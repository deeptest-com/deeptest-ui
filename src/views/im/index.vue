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
                    <div v-on-click-outside="canelVisible" @contextmenu="openDropdown(item)">{{ item.name }}</div>
                    <template #overlay>
                      <a-menu @click="e => handleMenuClick(e, item)">
                        <a-menu-item v-for="item in dropdownMenu" :key="item.key">{{ item.label }}</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </template>
                <div :class="['endpoint-tab-content', item.type]">
                  <Detail v-if="item.type === 'im'" :endpoint-id="item.entityId"/>
                  <List v-else-if="item.type === 'im-dir' || item.id === -1" :category-id="item.id"/>
                  <SchemaEditorContent v-else />
                </div>
              </a-tab-pane>
              <template #tabBarExtraContent>
                <a-dropdown>
                  <span style="margin-right: 20px"><EllipsisOutlined /></span>
                  <template #overlay>
                    <a-menu @click="e => handleMenuClick(e)">
                      <a-menu-item v-for="item in dropdownMenu" :key="item.key">{{ item.label }}</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </template>
            </a-tabs>
          </div>
        </template>
      </ContentPane>
    </a-spin>
  </div>
</template>
<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { EllipsisOutlined } from "@ant-design/icons-vue";
import { vOnClickOutside } from '@vueuse/components';
import ContentPane from '@/views/component/ContentPane/index.vue';
import { Tree, Detail, List } from './components';
import { SchemaTree } from '../component/Schema';
import { SchemaEditorContent } from '@/views/component/Schema/components';
import {StateType as EndpointStateType} from "@/views/im/store";
import eventBus from '@/utils/eventBus';
import settings from '@/config/settings';

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
  const curr = activeTabs.value.find(e => e.id === key);
  store.commit('Endpoint/setActiveTab', curr);
  if (curr.type === 'schema') {
    store.dispatch('Schema/querySchema', { id: curr.entityId });
  }
};

const onEdit = (e, type?: string) => {
  store.dispatch('Endpoint/removeActiveTab', e);
};

watch(() => {
  return currProject.value;
}, (val) => {
  if (val.id) {
    // todo: 重置tab为 当前项目的  全部数据 tab
  }
});


const schemaTree = ref();
onMounted(() => {
  eventBus.on(settings.eventEndpointAction, (data: any) => {
    if (data.type === 'getSchemaTreeList') {
      schemaTree.value?.loadCategory();
    }
  })
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
}
</style>
