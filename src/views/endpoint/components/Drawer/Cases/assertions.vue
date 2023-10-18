<template>
  <div class="case-assertion-main">
    <div class="head">
      <a-row type="flex">
        <a-col flex="100px">
          <a-button @click="create" type="primary" size="small">新建</a-button>
        </a-col>

        <a-col flex="1">
          基准用例的前后置处理器，将先于断言的执行。
        </a-col>

        <a-col flex="100px" class="dp-right">
          <Tips section="assert" title="针对响应的检查点断言" />
        </a-col>
      </a-row>
    </div>

    <div class="content">
      <draggable tag="div" item-key="name" class="collapse-list"
                 :list="assertions || []"
                 handle=".handle"
                 @end="move">
        <template #item="{ element }">

          <div :class="[activeAssertion.id === +element.id ? 'active' : '']" class="collapse-item">
            <div class="header">
              <div @click.stop="expand(element)" class="title dp-link">
                <icon-svg class="handle dp-drag icon" type="move"  />

                <icon-svg type="checkpoint" class="icon"  />

                <div class="entity-type">断言</div>
                <div class="assert-expression">
                  <TooltipCell :tip="element.desc">
                    <span class="expression-content" v-html="element.desc"></span>
                  </TooltipCell>
                </div>
              </div>
              <div class="buttons">
                <icon-svg class="icon dp-link-primary dp-icon-large" type="save"
                          title="保存"
                          v-if="activeAssertion.id === element.id"
                          @click.stop="save(element)" />

                <CheckCircleOutlined v-if="!element.disabled" @click.stop="disable(element)"
                                     class="dp-icon-btn dp-trans-80 dp-color-pass" />
                <CloseCircleOutlined v-if="element.disabled" @click.stop="disable(element)"
                                     class="dp-icon-btn dp-trans-80" />

                <DeleteOutlined @click.stop="remove(element)"  class="dp-icon-btn dp-trans-80" />

                <RightOutlined v-if="activeAssertion.id !== element.id"
                               @click.stop="expand(element)"  class="dp-icon-btn dp-trans-80" />
                <DownOutlined v-if="activeAssertion.id === element.id"
                              @click.stop="expand(element)"  class="dp-icon-btn dp-trans-80" />
              </div>
            </div>

            <div class="content" v-if="activeAssertion.id === +element.id">
              <Assertion :finish="list" />
            </div>
          </div>

        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, inject, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { QuestionCircleOutlined, CheckCircleOutlined, DeleteOutlined,
  ClearOutlined, MenuOutlined, RightOutlined,
  DownOutlined, CloseCircleOutlined, FullscreenOutlined, SaveOutlined } from '@ant-design/icons-vue';
import {ConditionType, UsedBy} from "@/utils/enum";
import {EnvDataItem} from "@/views/project-settings/data";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {confirmToDelete} from "@/utils/confirm";
import IconSvg from "@/components/IconSvg";

import Assertion from "./assertion.vue";
import TooltipCell from "@/components/Table/tooltipCell.vue";
import draggable from 'vuedraggable'
import Tips from "@/components/Tips/index.vue";
import {StateType as EndpointStateType} from "@/views/endpoint/store";

const store = useStore<{ Endpoint: EndpointStateType }>();
const assertions = computed<any>(() => store.state.Endpoint.alternativeCaseAssertions);
const activeAssertion = computed<any>(() => store.state.Endpoint.activeAlternativeCaseAssertion);

const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

const props = defineProps({
  model: {
    required: true,
    type: Object,
  },
})

const fullscreen = ref(false)

const expand = (item) => {
  console.log('expand', item)
  item.debugInterfaceId = props.model.debugInterfaceId
  store.commit('Endpoint/setActiveAlternativeCaseAssertion', item)
}

const list = () => {
  console.log('list')
  store.dispatch('Endpoint/listAlternativeCaseAssertion', props.model.baseId)
}

watch(props.model, (newVal) => {
  console.log('watch props.model', props.model)
  list()
}, {immediate: true, deep: true});

const create = () => {
  console.log('create', ConditionType.checkpoint)
  store.dispatch('Endpoint/createAlternativeCaseAssertion', {})
}

const format = (item) => {
  console.log('format', item)
  bus.emit(settings.eventEditorAction, {act: settings.eventTypeFormat})
}
const disable = (item) => {
  console.log('disable', item)
  store.dispatch('Endpoint/disableAlternativeCaseAssertion', item)
}
const remove = (item) => {
  console.log('remove', item)

  confirmToDelete(`确定删除选中断言？`, '', () => {
    store.dispatch('Endpoint/removeAlternativeCaseAssertion', item)
  })
}
function move(_e: any) {
  const ids = assertions.value.map((e: any) => {
    return e.id;
  })

  store.dispatch('Debug/moveAlternativeCaseAssertion', {
    data: ids,
  })
}

const save = (item) => {
  console.log('save', item)
  bus.emit(settings.eventConditionSave, {});
}

</script>

<style lang="less">
.case-assertion-main {
  .codes {
    height: 100%;
    min-height: 160px;

    .editor {
      height: 100%;
      min-height: 160px;
    }
  }
}
</style>

<style lang="less" scoped>
.case-assertion-main {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .head {
    height: 30px;
    padding: 2px 3px;
  }
  .content {
    flex: 1;
    height: calc(100% - 30px);
    overflow-y: auto;

    display: flex;
    &>div {
      height: 100%;
    }

    .codes {
      flex: 1;
    }
    .refer {
      width: 260px;
      padding: 10px;
      overflow-y: auto;

      .title {
        margin-top: 12px;
      }
      .desc {

      }
    }

    .collapse-list {
      height: 100%;
      width: 100%;
      padding: 0;

      .collapse-item {
        margin: 4px;
        border: 1px solid #d9d9d9;
        border-radius: 5px;

        &.active {
          border: 1px solid #1890ff;
        }

        .header {
          height: 28px;
          padding: 3px;
          background-color: #fafafa;
          border-radius: 5px;

          display: flex;
          align-items: center;
          .title {
            width: calc(100% - 160px);
            // flex: 1;
            display: flex;
            align-items: center;

            .entity-type {
              margin-right: 3px;
            }

            .assert-expression {
              // flex: 1;
              width: calc(100% - 80px);
              overflow: hidden;
              text-overflow: ellipsis;

              span {
                white-space: nowrap;
              }
            }

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
