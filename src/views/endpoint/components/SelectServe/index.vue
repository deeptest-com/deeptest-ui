<template>
  <a-select
    :value="serveId"
    :placeholder="'请选择服务'"
    :style="style"
    @change="change"
    :size="size"
    :disabled="disabled"
    :options="serves"
  />
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
  await store.dispatch("ServeGlobal/fetchServe");
  serveId.value = props.serveId? props.serveId : currServe.value.id? currServe.value.id: serves.value[0].id;
  change(serveId.value);
})

const change = (val: number)=>{
    emit("change",val)
}

</script>