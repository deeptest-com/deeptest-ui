<template>
  <div class="schema">
    <a-tabs 
      :activeKey="activeSchema?.key" 
      hide-add type="editable-card" 
      @change="changeTab"
      @edit="onEdit">
      <a-tab-pane v-for="pane in tabs" :key="pane.key" :tab="pane.title">
        <SchemaEditorContent @confirmDelete="key => onEdit(key, 'remove')" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>

import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import { StateType as SchemaStore } from './store';
import { SchemaEditorContent } from './components';

const store = useStore<{ Schema: SchemaStore }>();
const tabs = computed(() => {
  return (store.state.Schema.schemas || []).map(e => ({ ...e, key: e.entityId, title: e.name }));
});
const activeSchema = computed(() => store.state.Schema.activeSchema);

const callback = (key: string) => {
  console.log(key);
};

const remove = (targetKey: string) => {
  console.log(targetKey);
};

const onEdit = (targetKey: string | MouseEvent, action: string) => {
  if (action !== 'remove') {
    return;
  }
  store.dispatch('Endpoint/removeActiveTab', targetKey);
};

const changeTab = async (evt) => {
  await store.commit('Endpoint/setActiveTab', {
    ...activeSchema.value,
    autoFocus: false,
  });
  const curr = tabs.value.find(e => e.key === evt);
  store.dispatch('Schema/querySchema', { id: curr.entityId });
  store.commit('Endpoint/setActiveTabs', tabs.value.map(e => ({ ...e, autoFocus: false })));
  store.commit('Endpoint/setActiveTab', curr);
}

</script>

<style scoped lang="less">
.schema {
  width: 100%;
  height: 100%;
  padding: 16px;

  :deep(.ant-tabs-card) {
    height: 100%;

    .ant-tabs-top-content {
      height: calc(100% - 56px);

      .ant-tabs-tabpane.ant-tabs-tabpane-inactive {
        height: 0;
      }

      .ant-tabs-tabpane.ant-tabs-tabpane-active {
        height: 100%;
      }
    }
  }
}
</style>
