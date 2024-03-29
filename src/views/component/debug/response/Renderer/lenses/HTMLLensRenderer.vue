<template>
  <div class="response-html-main">
    <div class="head">
      <a-row type="flex">
        <a-col flex="1">
          <span style="margin-left:5px;">HTML</span>
        </a-col>

        <a-col flex="100px" class="dp-right">
<!--          <a-tooltip overlayClassName="dp-tip-small">
            <template #title>格式化</template>
            <ClearOutlined @click="format" class="dp-icon-btn dp-trans-80" />
          </a-tooltip>

          <a-tooltip overlayClassName="dp-tip-small">
            <template #title>复制</template>
            <CopyOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>

          <a-tooltip overlayClassName="dp-tip-small">
            <template #title>下载</template>
            <DownloadOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>-->
        </a-col>
      </a-row>
    </div>

    <div class="body">
      <MonacoEditor
        ref="monacoEditor"
        customId="html-lens-main"
        class="editor"
        :interfaceId="debugData.id"
        :value="responseData.content"
        :timestamp="timestamp"
        :language="responseData.contentLang"
        theme="vs"
        :options="editorOptions"
        :onExtractor="responseExtractor"
      />
    </div>

    <ResponseExtractor
        v-if="responseExtractorVisible"
        :interfaceId="debugData.endpointInterfaceId"
        :exprType="exprType"
        :expr="expr"
        :result="result"
        :onTest="testParse"
        :onFinish="responseExtractorFinish"
        :onCancel="responseExtractorCancel"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, ref, reactive, watch, inject, onMounted, onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { DownloadOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons-vue';
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import {MonacoOptions} from "@/utils/const";
import {StateType as Debug} from "@/views/component/debug/store";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import ResponseExtractor from "@/components/Editor/ResponseExtractor.vue";
import {getXpath, initIFrame, updateElem} from "@/services/parser-html";
import {parseHtml, testExpr} from "@/views/component/debug/service";
import {ConditionSrc, ExtractorSrc, ExtractorType, UsedBy} from "@/utils/enum";

const {t} = useI18n();

const store = useStore<{  Debug: Debug }>();
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const responseData = computed<any>(() => store.state.Debug.responseData);

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

// let frameElem: HTMLIFrameElement
// let frameDoc: Document

const responseExtractor = (data) => {
  // console.log('responseExtractor', data)
  result.value = ''

  parseHtml({
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

  // const docHtml = updateElem(frameDoc, data.docHtml, data.selectContent, data.selectionObj)
  // console.log('after add elem prop', docHtml)
  // frameDoc = initIFrame(docHtml)
  // const xpath = getXpath(frameDoc)
  // console.log('==xpath===', xpath)
}

// const requestReplace = (data) => {
//   console.log('requestReplace', data)
//   requestReplaceVisible.value = true
// }

const testParse = (expr1, exprType1) => {
  console.log('testParse')
  testExpr({
    content: responseData.value.content,
    type: responseData.value.contentLang,
    expr: expr1,
    exprType: exprType1,

  }).then((json) => {
    console.log('json', json)
    result.value = json.data.result
  })
}

const responseExtractorFinish = (conf) => {
  console.log('responseExtractorFinish')

  conf.type = conf.expressionType === 'regx' ? ExtractorType.regx : ExtractorType.htmlquery
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

const format = (item) => {
  console.log('format', item)
  bus.emit(settings.eventEditorAction, {act: settings.eventTypeFormat})
}

onMounted(() => {
  bus.on(settings.paneResizeTop, () => {
    monacoEditor.value?.resizeIt({
      act: settings.eventTypeContainerHeightChanged,
      container: 'response-html-main',
      id: 'html-lens-main',
    })
  })
});

</script>

<style lang="less">
.response-html-main {
  .htmleditor-vue {
    height: 100%;
    .htmleditor-menu {
      display: none;
    }
    .htmleditor-outer {
      margin: 0;
      padding: 0;
      height: 100%;
      .ace-htmleditor {
        height: 100%;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.response-html-main {
  height: 100%;
  .head {
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
  }
  .body {
    height: calc(100% - 30px);
    overflow-y: hidden;
    &>div.monaco-editor-vue3 {
      height: 100%;
    }
  }
}
</style>
