<template>
  <div class="endpoint-content">
    <a-spin tip="Loading..." :spinning="isImporting" style="z-index: 2000;">
      <ContentPane>
        <template #left>
          <Tree />
          <SchemaTree  ref="schema" @select="showSchema"/>
        </template>
        <template #right>
          <div v-if="activeTabs.length > 0">
            <a-tabs :activeKey="activeTab.key" hide-add type="editable-card" >
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
                <div v-if="item.type === 'im'">
                  <Detail :id="item.entityId" />
                </div>
                <div v-else-if="item.type === 'im-dir' || item.id === -1" style="overflow-x: scroll">
                  <List :category-id="item.id"/>
                </div>
                <div v-else>
                  <Schema :entity-id="item.id" />
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
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { EllipsisOutlined } from "@ant-design/icons-vue";
import { vOnClickOutside } from '@vueuse/components';
import ContentPane from '@/views/component/ContentPane/index.vue';
import { Tree, Schema, Detail, List } from './components';
import { SchemaTree } from '../component/Schema';
import {StateType as EndpointStateType} from "@/views/im/store";

const store = useStore<{ Endpoint: EndpointStateType }>();
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
    key: "1",
    label: "关闭当前标签页",
  },
  {
    key: "2",
    label: "关闭其他标签页",
  },
  {
    key: "3",
    label: "关闭所有标签页",
  }
];

const handleMenuClick = (evt, record) => {
  console.log(evt, record);
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
}
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
}
</style>
