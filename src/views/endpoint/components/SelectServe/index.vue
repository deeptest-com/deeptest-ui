<template>
         <a-select
                :value="serveId"
                :placeholder="'请选择服务'"
                :style="style"
                @change="change"
                :size="size"
                :disabled="disabled"
                >
                <a-select-option v-for="item in serves" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
</template>

<script lang="ts" setup >
import {
  defineEmits, ref, onMounted, computed,defineProps
} from 'vue';

import {useStore} from "vuex";

const store = useStore<{ ServeGlobal: { currServe: any; serves: any; } }>();
const currServe = computed<any>(() => store.state.ServeGlobal.currServe);
const serves = computed<any>(() => store.state.ServeGlobal.serves);
const emit = defineEmits(['change']);
const props = defineProps(['serveId','disabled','changeServe','size','style'])

const serveId = ref()

onMounted(async () => {
  await getServeList();
  serveId.value = props.serveId? props.serveId : currServe.value.id? currServe.value.id: serves.value[0].id;
  change(serveId.value);
})

const change = (val: number)=>{
    emit("change",val)
    if (props.changeServe) {
      store.dispatch('ServeGlobal/changeServe', val);
    }
    
}


async function getServeList() {
  // 需要重新更新可选服务列表
  await store.dispatch("ServeGlobal/fetchServe");
}

</script>