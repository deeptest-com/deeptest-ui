<template>
  <div class="response-raw-main" ref="responseRawMain">
    <div class="head">
      <a-row type="flex">
        <a-col flex="1">
          <span style="margin-left:5px;">Event Stream</span>
        </a-col>

        <a-col flex="100px" class="dp-right">
        </a-col>
      </a-row>
    </div>

    <div class="body">
      <div id="stream-list" v-html="streamDataStr" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, onMounted, onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {MonacoOptions} from "@/utils/const";
import {StateType as Debug} from "@/views/component/debug/store";
import {parseText, testExpr} from "@/views/component/debug/service";
import {ConditionSrc, ExtractorSrc, ExtractorType, UsedBy} from "@/utils/enum";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {formatWithSeconds} from "@/utils/datetime";

const {t} = useI18n();
const store = useStore<{  Debug: Debug }>();
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const responseData = computed<any>(() => store.state.Debug.responseData);
const streamData = computed<any>(() => store.state.Debug.streamData);
const streamDataStr = computed<any>(() => {
  return streamData.value.join('<br/>')
});

const usedBy = inject('usedBy') as UsedBy
const isForBenchmarkCase = inject('isForBenchmarkCase', false) as boolean

const timestamp = ref('')
watch(responseData, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const editorOptions = ref(Object.assign({usedWith: 'response',readOnly:false}, MonacoOptions) )

const responseExtractorVisible = ref(false)
const expr = ref('')
const exprType = ref('')
const result = ref('')
const monacoEditor = ref();

const responseExtractor = (data) => {
  result.value = ''

  parseText({
    docContent: data.docContent,
    selectContent: data.selectContent,

    startLine: data.selectionObj.startLineNumber - 1,
    endLine: data.selectionObj.endLineNumber - 1,
    startColumn: data.selectionObj.startColumn - 1,
    endColumn: data.selectionObj.endColumn - 1,
  }).then((json) => {
    console.log('json', json)
    responseExtractorVisible.value = true
    expr.value = json.data.expr
    exprType.value = json.data.exprType
  })
}

const testParse = (expr, exprType) => {
  console.log('testParse')
  testExpr({
    content: responseData.value.content,
    type: responseData.value.contentLang,
    expr: expr,
    exprType: exprType,

  }).then((json) => {
    console.log('json', json)
    result.value = json.data.result
  })
}

const responseExtractorFinish = (conf) => {
  console.log('responseExtractorFinish')

  conf.type = conf.expressionType
  conf.src = ExtractorSrc.body
  conf.result = result.value

  const data = {
    conf,
    info: debugInfo.value,
    conditionSrc: ConditionSrc.PostCondition,
    isForBenchmarkCase: isForBenchmarkCase,
  } as any

  store.dispatch('Debug/quickCreateExtractor', data).then((result) => {
    if (result) {
      responseExtractorVisible.value = false
    }
  })
}
const responseExtractorCancel = () => {
  console.log('responseExtractorCancel')
  responseExtractorVisible.value = false
}

const responseRawMain = ref();

onMounted(() => {
  bus.on(settings.paneResizeTop, () => {
    monacoEditor.value?.resizeIt({
      act: settings.eventTypeContainerHeightChanged,
      container: 'response-raw-main',
      id: 'raw-lens-main',
      el: responseRawMain.value,
    })
  })
});

</script>

<style lang="less">
.response-raw-main {
  .raweditor-vue {
    height: 100%;
    .raweditor-menu {
      display: none;
    }
    .raweditor-outer {
      margin: 0;
      padding: 0;
      height: 100%;
      .ace-raweditor {
        height: 100%;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.response-raw-main {
  height: 100%;
  .head {
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
  }
  .body {
    height: calc(100% - 30px);
    overflow-y: hidden;
    &>div {
      height: 100%;
    }

    #stream-list {
      height: 100%;
      overflow-y: auto;
    }
  }
}
</style>
