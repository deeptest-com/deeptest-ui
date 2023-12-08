<template>
  <div class="endpoint-debug-cases-main">
    <CaseList
        v-if="show === 'list'"
        :onDesign="design"
        :show-bench-mark="showBenchMark"/>

    <CaseDesign
        v-if="show === 'design'"
        :onBack="back" />

    <AlternativeCase
        v-if="show === 'showAlternativeCases'"
        :baseCaseId="alternativeRecord.id"
        :onBack="back" />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, defineProps, defineEmits, watch, nextTick, onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import CaseList from "./list.vue";
import CaseDesign from "./design.vue";
import AlternativeCase from "./alternativeCase.vue";
import useIMLeaveTip from "@/composables/useIMLeaveTip";

const {clearDebugChange}= useIMLeaveTip();
const {t} = useI18n()
const store = useStore<{ Endpoint }>();
const endpoint = computed<any>(() => store.state.Endpoint.endpointDetail);
const alternativeRecord = ref<any>({});

const emit = defineEmits(['update:showList'])

const props = defineProps({
  showList: {
    required: true,
    type: Boolean,
  },
})

watch(props, async (newVal) => {
  console.log('watch props', props.showList)
  if (props.showList) {
    show.value = 'list'
  }
  emit('update:showList', false)
})

const show = ref('list')

const design = (record) => {
  console.log('design', record)
  show.value = 'design'
  emit('update:showList', false)
  store.commit('Endpoint/setEndpointCaseDetail', record);
}

const showBenchMark = async (record?: any) => {
  if (record) {
    alternativeRecord.value = record;
  }
  await nextTick();
  show.value = 'showAlternativeCases';
  emit('update:showList', false);
}

const back = () => {
  show.value = 'list'
}

onUnmounted(() => {
  clearDebugChange()
})

</script>

<style lang="less" scoped>
.endpoint-debug-cases-main {
  height: 100%;
}
</style>

