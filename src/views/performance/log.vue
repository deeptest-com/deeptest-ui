<template>
  <div class="performance-log">
    <div class="runner-selection"
        v-if="items?.length > 0">
      <a-select v-model:value="currRunnerId" style="width: 200px"
                @change="selectRunner" >
        <a-select-option  v-for="(item, index) in items" :key="index"
                          :value="item.id">
          {{item.name}}
        </a-select-option>
      </a-select>
    </div>

    <div id="performance-log-list">
      <div v-for="(item, index) in logs" :key="index">
        {{item}}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {ref, onMounted, onUnmounted, computed, defineProps, watch} from 'vue';
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  request: {
    type: Object,
    required: true,
    default: {} as any,
  },
  logs: {
    type: Array,
    required: true,
  },
  startLog: {
    type: Function,
    required: true,
  },
  stopLog: {
    type: Function,
    required: true,
  },
});

const currRunnerId = ref(0)

const items = computed<any[]>(() => {
  if (!props.request || !props.request?.runners) {
    return []
  }

  const arr = props.request?.runners
  if (arr.length === 0 || arr[0].id !== 0) {
    arr.unshift({id: 0, name: '控制器', webAddress: props.request?.serverAddress})
  }

  return arr
})

const toStartLog = (runner) => {
  props.startLog(runner)
}

const toStopLog = (runner) => {
  props.stopLog(runner)
}

watch(() => {return items}, () => {
  console.log('watch props.request', items)
  if (items.value.length > 0) {
    const runner = items.value[0]
    if (runner) {
      currRunnerId.value = runner.id
      toStartLog(runner)
    }

  } else {
    currRunnerId.value = 0
  }
}, {deep: true, immediate: true})

const selectRunner = () => {
  console.log('selectRunner', currRunnerId.value)
  if (currRunnerId.value < 0) return // ignore test item

  const runner = props.request?.runners.find(item => item.id === currRunnerId.value)
  if (runner) {
    toStartLog(runner)
  }
}

onMounted(() => {
  console.log('onMounted')
})
onUnmounted(() => {
  console.log('onUnmounted')

  const runner = items.value.find(item => item.id === currRunnerId.value)
  if (runner) {
    toStopLog(runner)
  }
})

</script>

<style scoped lang="less">
.performance-log {
  height: 100%;
  display: flex;
  flex-direction: column;

  .runner-selection {
    height: 38px;
  }
  #performance-log-list {
    flex: 1;
    height: 0;
    overflow-y: auto;
    padding: 6px;
  }
}
</style>
