<template>
  <div class="lecang-engineer" v-if="engineers.length > 0">乐仓工程：
    <span>{{ engineers.join('，') }}</span>
  </div>  
</template>
<script setup lang="ts">
import { useWujie } from '@/composables/useWujie';
import { getLzosInfo } from '@/utils/lzos';
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

const { isInLecangWujieContainer } = useWujie();
const lzosInfo = ref(null);
const isLecang = computed(() => lzosInfo.value || isInLecangWujieContainer)
const store = useStore<{ ProjectGlobal }>();
const currProject = computed(() => store.state.ProjectGlobal.currProject);

const engineers = ref<any[]>([]);

onMounted(async() => {
  const info = await getLzosInfo();
  lzosInfo.value = info;
})

watch(() => {
  return currProject.value;
}, async val => {
  if (val.id) {
    const result = await store.dispatch('Global/getLyUserEngineering', {
      projectId: val.id,
    });
    engineers.value = (result || []).map(e => e.name);
  }
}, {
  immediate: true,
});
</script>
<style lang="less" scoped>
.lecang-engineer {
  display: flex;
  align-items: center;
  margin-left: 20px;
  color: rgba(0, 0, 0, 0.85);
}
</style>