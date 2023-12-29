<template>
  <div class="post-condition-main">
    <div class="head">
      <a-row type="flex">
        <a-col flex="1">
          <a-select size="small" :style="{width:'116px'}" :bordered="true"
                    v-model:value="conditionType">
            <template v-for="item in conditionTypes" :key="item.value">
              <a-select-option v-if="![ConditionType.checkpoint,ConditionType.cookie].includes(item.value)" :value="item.value">
                {{ t(item.label) }}
              </a-select-option>
            </template>
          </a-select> &nbsp;

          <a-button @click="create" type="primary" size="small">添加处理</a-button>
        </a-col>

        <a-col flex="100px" class="dp-right">
          <Tips section="response-process" title="对请求响应的后处理" />
        </a-col>
      </a-row>
    </div>

    <div :class="['content', 'benchmark-condition-content']">
      <draggable tag="div" item-key="name" class="collapse-list"
                 :list="conditions || []"
                 handle=".handle"
                 @end="move">
        <template #item="{ element }">

          <div :class="[activeCondition.id === +element.id ? 'active' : '']" class="collapse-item">
            <div class="header">
              <div @click.stop="expand(element)" class="title dp-link dp-ellipsis">
                <icon-svg class="handle dp-drag icon" type="move" />

                <icon-svg v-if="element.entityType === ConditionType.extractor"
                          type="variable"
                          class="icon variable" />
                <icon-svg v-if="element.entityType === ConditionType.checkpoint"
                          type="checkpoint"
                          class="icon"  />
                <icon-svg v-if="element.entityType === ConditionType.script"
                          type="script"
                          class="icon"  />
                <icon-svg v-if="element.entityType === ConditionType.databaseOpt"
                          type="db-opt"
                          class="icon"  />

                <span v-html="element.desc || t(element.entityType)"></span>
              </div>
              <div class="buttons">
                <a-button size="small" type="primary"
                          v-if="activeCondition.id === element.id"
                          @click.stop="save(element)">保存</a-button>


                <ClearOutlined v-if="activeCondition.id === +element.id && element.entityType === ConditionType.script"
                               @click.stop="format(element)"
                               class="dp-icon-btn dp-trans-80"
                               title="格式化"/>&nbsp;

                <CheckCircleOutlined v-if="!element.disabled" @click.stop="disable(element)"
                                     class="dp-icon-btn dp-trans-80 dp-color-pass" title="启用" />
                <CloseCircleOutlined v-if="element.disabled" @click.stop="disable(element)"
                                     class="dp-icon-btn dp-trans-80" title="禁用" />
                <DeleteOutlined @click.stop="remove(element)"
                                class="dp-icon-btn dp-trans-80" title="删除" />

                <FullscreenOutlined v-if="activeCondition.id === element.id"
                                    @click.stop="openFullscreen(element)"
                                    class="dp-icon-btn dp-trans-80" title="全屏" />

                <RightOutlined v-if="activeCondition.id !== element.id"
                               @click.stop="expand(element)"
                               class="dp-icon-btn dp-trans-80" />
                <DownOutlined v-if="activeCondition.id === element.id"
                              @click.stop="expand(element)"
                              class="dp-icon-btn dp-trans-80" />
              </div>
            </div>

            <div class="content" v-if="activeCondition.id === +element.id">
              <Extractor
                v-if="element.entityType === ConditionType.extractor"
                :condition="activeCondition"
                :finish="list"/>

              <Script
                v-if="element.entityType === ConditionType.script"
                :condition="activeCondition"
                :finish="list"/>

              <DatabaseOpt
                v-if="element.entityType === ConditionType.databaseOpt"
                :condition="activeCondition"
                :finish="list"/>
            </div>
          </div>

        </template>
      </draggable>
    </div>

    <FullScreenPopup
      v-if="fullscreen"
      :visible="fullscreen"
      :model="activeCondition"
      :onCancel="closeFullScreen" />
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, onUnmounted, provide, defineProps} from "vue";
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
import draggable from 'vuedraggable';
import Tips from "@/components/Tips/index.vue";
import {ConditionType, UsedBy, ConditionSrc} from "@/utils/enum";
import {EnvDataItem} from "@/views/project-settings/data";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {confirmToDelete} from "@/utils/confirm";
import {StateType as Debug} from "@/views/component/debug/store";
import {getEnumSelectItems} from "@/views/scenario/service";
import IconSvg from "@/components/IconSvg";
import Extractor from "@/views/component/debug/request/config/conditions/Extractor.vue";
import Script from "@/views/component/debug/request/config/conditions/Script.vue";
import DatabaseOpt from "@/views/component/debug/request/config/conditions/DatabaseOpt.vue";
import FullScreenPopup from "@/views/component/debug/request/config/ConditionPopup.vue";

const {t} = useI18n();

const props = defineProps({
  conditionSrc: {
    type: String,
    required: true,
  },
})

provide('conditionSrc', props.conditionSrc)
const usedBy = inject('usedBy') as UsedBy

const store = useStore<{  Debug: Debug }>();
const debugData = computed<any>(() => store.state.Debug.debugData);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const conditions = computed<any>(() => {
  if (props.conditionSrc === ConditionSrc.PreCondition)
    return store.state.Debug.benchMarkCase.preConditions
  else if (props.conditionSrc === ConditionSrc.PostCondition)
    return store.state.Debug.benchMarkCase.postConditions

  return []
});
const activeCondition = computed<any>(() => {
  return store.state.Debug.benchMarkCase.activeCondition;
});

const fullscreen = ref(false)

const conditionType = ref(props.conditionSrc === ConditionSrc.PreCondition ? ConditionType.script : ConditionType.extractor)
const conditionTypes = ref(getConditionTypes())

const expand = (item) => {
  console.log('expand', item)
  store.commit('Debug/setActiveCondition', item);
}

const list = async () => {
  console.log('list in alternative/condition/Condition')

  store.dispatch('Debug/listCondition', {
    conditionSrc: props.conditionSrc,
    isForBenchmarkCase: true,
  });
}

watch(debugData, async (newVal) => {
  await list();
}, {immediate: true, deep: true});

const create = () => {
  console.log('create', conditionType.value)
  store.dispatch('Debug/createCondition', {
    entityType: conditionType.value,
    ...debugInfo.value,
    isForBenchmarkCase: true,
    conditionSrc: props.conditionSrc,
  })
}

const format = (item) => {
  console.log('format', item)
  bus.emit(settings.eventEditorAction, {act: settings.eventTypeFormat})
}
const disable = (item) => {
  console.log('disable', item)

  item.conditionSrc = props.conditionSrc
  item.isForBenchmarkCase = true

  store.dispatch('Debug/disableCondition', item)
}
const remove = (item) => {
  console.log('remove', item)

  item.conditionSrc = props.conditionSrc
  item.isForBenchmarkCase = true

  confirmToDelete(`确定删除该${t(item.entityType)}？`, '', () => {
    store.dispatch('Debug/removeCondition', item)
  })
}
function move(_e: any) {
  const envIdList = conditions.value.map((e: EnvDataItem) => {
    return e.id;
  })
  store.dispatch('Debug/moveCondition', {
    data: envIdList,
    info: debugInfo.value,

    entityType: '',
    conditionSrc: props.conditionSrc,
    isForBenchmarkCase: true,
  })
}

const save = (item) => {
  console.log('save', item)
  bus.emit(settings.eventConditionSave, item);
}

const openFullscreen = (item) => {
  console.log('openFullscreen', item)
  fullscreen.value = true
}
const closeFullScreen = (item) => {
  console.log('closeFullScreen', item)
  fullscreen.value = false
}

function getConditionTypes() {
  const items = getEnumSelectItems(ConditionType)

  let ret = items.filter(item => ![ConditionType.checkpoint,ConditionType.cookie].includes(item.value))

  if (props.conditionSrc === ConditionSrc.PreCondition) {
    ret = ret.filter(item => [ConditionType.script,ConditionType.databaseOpt].includes(item.value))
  }

  return ret
}

onUnmounted(() => {
  store.commit('Debug/setActiveCondition', {});
})

</script>

<style lang="less" scoped>
.post-condition-main {
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

    &.benchmark-condition-content {
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
