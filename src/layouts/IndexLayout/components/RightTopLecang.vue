<template>
  <div class="lecang-engineer" v-if="isLecangEnv && engineers.length > 0">乐仓工程：
    <span>{{ engineers.join('，') }}</span>
  </div>  
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const isLecangEnv = route.query.from === 'lecang';
const store = useStore<{ ProjectGlobal }>();
const currProject = computed(() => store.state.ProjectGlobal.currProject);

const engineers = ref<any[]>([]);

const getEngineers = () => {
  return [{
    name: '工程1',
  }, {
    name: '工程2'
  }]
};

watch(() => {
  return currProject.value;
}, val => {
  if (val.id) {
    const result = getEngineers();
    engineers.value = result;
  }
}, {
  immediate: true,
});
</script>
<style lang="less" scoped>
.lecang-engineer {
  display: flex;
  align-items: center;
}
</style>