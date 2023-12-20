<template>
  <div class="schema">

    <a-tabs v-model:activeKey="activeKey" hide-add type="editable-card" @edit="onEdit">
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title">
        <SchemaEditorContent />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>

import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { StateType as SchemaStore } from './store';
import { SchemaEditorContent } from './components';

const store = useStore<{ Schema: SchemaStore }>();
// const tabs = computed(() => store.state.Schema.tabs || panes);
const panes = ref([
  { title: 'Tab 1', content: 'Content of Tab 1', key: '1' },
  { title: 'Tab 2', content: 'Content of Tab 2', key: '2' },
]);
// const tabs = computed(() => panes);

const activeKey = ref(panes.value[0].key);

const newTabIndex = ref(0);

const callback = (key: string) => {
  console.log(key);
};

const add = () => {
  activeKey.value = `newTab${++newTabIndex.value}`;
  panes.value.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey.value });
};

const remove = (targetKey: string) => {
  let lastIndex = 0;
  panes.value.forEach((pane, i) => {
    if (pane.key === targetKey) {
      lastIndex = i - 1;
    }
  });
  panes.value = panes.value.filter(pane => pane.key !== targetKey);
  if (panes.value.length && activeKey.value === targetKey) {
    if (lastIndex >= 0) {
      activeKey.value = panes.value[lastIndex].key;
    } else {
      activeKey.value = panes.value[0].key;
    }
  }
};

const onEdit = (targetKey: string | MouseEvent, action: string) => {
  if (action === 'add') {
    add();
  } else {
    remove(targetKey as string);
  }
};
 
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

