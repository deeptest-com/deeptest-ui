<template>
  <div class="endpoint-debug-cases-main">
    <CaseList
        v-if="show === 'list'"
        :onDesign="design"
        :createBenchmarkCase="createBenchmarkCase"/>

    <CaseDesign
        v-if="show === 'design'"
        :onBack="back" />

    <AlternativeCase
        v-if="show === 'showAlternativeCases'"
        :record="alternativeRecord"
        :onBack="back" />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, defineProps, defineEmits, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import CaseList from "./list.vue";
import CaseDesign from "./design.vue";
import AlternativeCase from "./alternativeCase.vue";

const {t} = useI18n()

const store = useStore<{ Endpoint }>();
const endpoint = computed<any>(() => store.state.Endpoint.endpointDetail);
const alternativeRecord = ref({});

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

const createBenchmarkCase = async (data) => {
  console.log('createBenchmarkCase')
  const result = await store.dispatch('Endpoint/createBenchmarkCase', data);

  if (result) {
    show.value = 'showAlternativeCases';
    emit('update:showList', false);
  }
}

const back = () => {
  console.log('back')
  show.value = 'list'
}

</script>

<style lang="less" scoped>
.endpoint-debug-cases-main {
  height: 100%;
}
</style>

