<template>
  <div class="lecang-engineer" v-if="engineers.length > 0 && !isSaas">乐仓工程：
    <span>{{ engineers.join('，') }}</span>
  </div>  
</template>
<script setup lang="ts">
import { getLzosInfo } from '@/utils/lzos';
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const lzosInfo = ref(null);
const store = useStore<{ ProjectGlobal, Global }>();
const engineers = computed(() => (store.state.Global.lyUserEngineering || []).map(e => e.name));
const isSaas = process.env.VUE_APP_DEPLOY_ENV === 'ly-saas';

onMounted(async() => {
  const info = await getLzosInfo();
  lzosInfo.value = info;
})
</script>
<style lang="less" scoped>
.lecang-engineer {
  display: flex;
  align-items: center;
  margin-left: 20px;
  color: rgba(0, 0, 0, 0.85);
}
</style>