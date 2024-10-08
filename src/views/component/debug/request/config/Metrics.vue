<template>
  <div class="post-metrics-main">
    <div class="head">
      <a-row type="flex">
        <a-col flex="1">
          <a-select size="small" :style="{width:'116px'}" :bordered="true"
                    v-model:value="metricsType">
            <template v-for="item in metricsTypes" :key="item.value">
              <a-select-option :value="item.value">
                {{ t(item.label) }}
              </a-select-option>
            </template>
          </a-select> &nbsp;

          <a-button @click="create" type="primary" size="small">添加指标</a-button>
        </a-col>

        <a-col flex="100px" class="dp-right">
          <Tips section="llm-metrics" title="大模型指标" />
        </a-col>

      </a-row>
    </div>

    <div class="content">
      <draggable tag="div" item-key="name" class="collapse-list"
                 :list="metrics || []"
                 handle=".handle"
                 @end="move">
        <template #item="{ element }">

          <div :class="[activeMetrics.id === +element.id ? 'active' : '']" class="collapse-item">
            <div class="header">
              <div @click.stop="expand(element)" class="title dp-link dp-ellipsis">
                <icon-svg class="handle dp-drag icon" type="move" />

                <icon-svg v-if="element.entityType === MetricsType.summarization || true"
                          type="variable"
                          class="icon variable" />

                <span v-html="element.desc || t(element.entityType)"></span>
              </div>

              <div class="buttons">
                <a-button size="small" type="primary"
                          :disabled="getSaveBtnDisabled(element?.id)"
                          v-if="activeMetrics.id === element.id"
                          @click.stop="save(element)">保存</a-button>

                <CheckCircleOutlined v-if="!element.disabled" @click.stop="disable(element)"
                                     class="dp-icon-btn dp-trans-80 dp-color-pass" title="启用" />
                <CloseCircleOutlined v-if="element.disabled" @click.stop="disable(element)"
                                     class="dp-icon-btn dp-trans-80" title="禁用" />
                <DeleteOutlined @click.stop="remove(element)"
                                class="dp-icon-btn dp-trans-80" title="删除" />

                <FullscreenOutlined v-if="activeMetrics.id === element.id"
                                    @click.stop="openFullscreen(element)"
                                    class="dp-icon-btn dp-trans-80" title="全屏" />

                <RightOutlined v-if="activeMetrics.id !== element.id"
                               @click.stop="expand(element)"
                               class="dp-icon-btn dp-trans-80" />
                <DownOutlined v-if="activeMetrics.id === element.id"
                              @click.stop="expand(element)"
                              class="dp-icon-btn dp-trans-80" />
              </div>
            </div>

            <div class="content" v-if="activeMetrics.id === +element.id">
              <MetricsForm
                  :metrics="activeMetrics"
                  :finish="list"/>
            </div>
          </div>

        </template>
      </draggable>
    </div>

    <MetricsPopup
      v-if="fullscreen"
      :visible="fullscreen"
      :model="activeMetrics"
      :onCancel="closeFullScreen" />
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, getCurrentInstance, ComponentInternalInstance, onUnmounted, onMounted, provide, defineProps} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ClearOutlined,
  RightOutlined,
  DownOutlined,
  CloseCircleOutlined,
  FullscreenOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable'
import debounce from "lodash.debounce";
import bus from "@/utils/eventBus";
import {equalObjectByLodash} from "@/utils/object";
import {ConditionSrc, MetricsType} from "@/utils/enum";
import settings from "@/config/settings";
import IconSvg from "@/components/IconSvg";
import {confirmToDelete} from "@/utils/confirm";
import {EnvDataItem} from "@/views/project-settings/data";
import {StateType as Debug} from "@/views/component/debug/store";
import {getEnumSelectItems} from "@/views/scenario/service";
import useIMLeaveTip   from "@/composables/useIMLeaveTip";

import Tips from "@/components/Tips/index.vue";
import MetricsForm from "./metrics/MetricsForm.vue";
import MetricsPopup from "./MetricsPopup.vue";

const {t} = useI18n();

const store = useStore<{  Debug: Debug }>();
const debugData = computed<any>(() => store.state.Debug.debugData);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);

const metrics = computed<any>(() => store.state.Debug.metrics);
const activeMetrics = computed<any>(() => store.state.Debug.activeMetrics);

const fullscreen = ref(false)

const metricsType = ref(MetricsType.answer_relevancy)
const metricsTypes = getMetricsTypes()

function getMetricsTypes() {
  const ret = getEnumSelectItems(MetricsType)
  return ret
}

const expand = (item) => {
  console.log('expand', item)
  store.commit('Debug/setActiveMetrics', item);
}

const list = debounce(async () => {
  console.log('list in debug/request/config/Metrics.vue')
  await store.dispatch('Debug/listMetrics', {})
}, 300)

watch(debugData, async (newVal) => {
  console.log('watch debugData')

  await list();
}, {immediate: true, deep: true});

const create = () => {
  console.log('create', metricsType.value)
  store.dispatch('Debug/createMetrics', {
    ...debugInfo.value,
    entityType: metricsType.value,
  })
}

const disable = (item) => {
  console.log('disable', item)
  store.dispatch('Debug/disableMetrics', item)
}
const remove = (item) => {
  console.log('remove', item)

  confirmToDelete(`确定删除此"${t(item.entityType)}"指标？`, '', () => {
    store.dispatch('Debug/removeMetrics', item)
  })
}
function move(_e: any) {
  const envIdList = metrics.value.map((e: EnvDataItem) => {
    return e.id;
  })
  store.dispatch('Debug/moveMetrics', {
    data: envIdList,
    info: debugInfo.value,
  })
}

const save = (item) => {
  console.log('save', item)
  bus.emit(settings.eventMetricsSave, item);
}

const openFullscreen = (item) => {
  console.log('openFullscreen', item)
  fullscreen.value = true
}
const closeFullScreen = (item) => {
  console.log('closeFullScreen', item)
  fullscreen.value = false
}

// watch changed event
const {srcMetricsDataObj, metricsDataObj} = useIMLeaveTip();
const getSaveBtnDisabled = (id) => {
  console.log('getSaveBtnDisabled')
  const cur =  metricsDataObj.value?.[id] || {};
  const src =  srcMetricsDataObj.value?.[id] || {};
  return equalObjectByLodash(cur, src);
}
watch(() => {return [metrics.value, metricsDataObj.value, srcMetricsDataObj.value]},(newVal,oldValue) => {
  console.log('watch metrics objs')

  const cur =  metricsDataObj.value;
  const src =  srcMetricsDataObj.value;
  const isChange = !equalObjectByLodash(cur, src);

  store.commit('Debug/setDebugChange',{metrics: isChange})
},{deep:true})

onUnmounted(() => {
  store.commit('Debug/setActiveMetrics', {});
})

</script>

<style lang="less" scoped>
.post-metrics-main {
  height: 100%;

  .head {
    height: 30px;
    padding: 2px 3px;
  }
  .content {
    height: calc(100% - 30px);
    margin-bottom: 8px;
    overflow-y: auto;
    display: flex;

    &.benchmark-metrics-content {
      height: unset;
    }

    &>div {
      height: 100%;
    }

    .collapse-list {
      height: 100%;
      width: 100%;
      padding: 0;

      .collapse-item {
        margin: 4px;
        border-radius: 5px;
        border: 1px solid #d9d9d9;
        &:last-child {
         //border: 1px solid red;
          //margin-bottom: 16px;
        }

        &.active {
          height: 100%;
          border: 1px solid #1890ff;
        }

        .header {
          height: 36px;
          padding: 3px;
          background-color: #fafafa;
          border-radius: 5px;

          display: flex;
          .title {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;

            .icon {
              margin-right: 3px;
              &.variable {
                font-size: 16px;
                vertical-align: -0.2em;
              }
            }
          }
          .buttons {
            width: 160px;
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
        }
        .content {
          padding: 16px 10px;
          width: 100%;
        }
      }
    }
  }
}
</style>
