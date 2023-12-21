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
  return (store.state.Schema.schemas || []).map(e => ({ title: e.name, ...e, key: e.entityId }));
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
  console.error(targetKey);
  const olderSchemas = cloneDeep(tabs.value);
  const currActiveSchema = cloneDeep(activeSchema.value);
  const findIndex = olderSchemas.findIndex(e => e.key === targetKey);
  const schemas = tabs.value.filter(e => e.key !== targetKey);
  store.commit('Schema/setSchemas', schemas);
  if (currActiveSchema.key !== targetKey) {
    return;
  }
  const newSchema = olderSchemas[findIndex - 1] ? olderSchemas[findIndex - 1] : olderSchemas[findIndex + 1] ? olderSchemas[findIndex + 1] : {};
  store.commit('Schema/setActiveSchema', newSchema);
  if (newSchema.entityId) {
    store.dispatch('Schema/querySchema', { id: newSchema.entityId });
  }
};

const changeTab = (evt) => {
  const curr = tabs.value.find(e => e.key === evt);
  store.dispatch('Schema/querySchema', { id: curr.entityId });
  store.commit('Schema/setActiveSchema', curr);
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

