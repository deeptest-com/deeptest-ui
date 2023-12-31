<template>
  <div class="pre-script-main">
      <div class="content">
        <div class="codes">
          <MonacoEditor
            ref="monacoEditor"
            v-if="scriptData?.id"
            theme="vs" language="typescript" class="editor"
            customId="pre-script-main-codes"
            :value="scriptData.content"
            :timestamp="timestamp"
            :options="editorOptions"
            @change="editorChange" />
        </div>

        <div class="refer">
          <div class="desc">预请求脚本使用JavaScript编写，并在请求发送前执行。</div>

          <div class="title">代码片段：</div>
          <div>
            <div @click="addSnippet('variables_get')" class="dp-link-primary">获取变量</div>
            <div @click="addSnippet('variables_set')" class="dp-link-primary">设置变量</div>
            <div @click="addSnippet('variables_clear')" class="dp-link-primary">清除变量</div>

            <div @click="addSnippet('datapool_get')" class="dp-link-primary">获取数据池变量</div>
            <div @click="addSnippet('log')" class="dp-link-primary">打印日志</div>

            <div @click="addSnippet('send_request_get')" class="dp-link-primary">发送GET请求</div>
            <div @click="addSnippet('send_request_post')" class="dp-link-primary">发送POST请求</div>
          </div>

          <div class="title">
            自定义脚本库<Tips title="导入第三方/自定义JavaScript类库，可以在自定义脚本中，通过 moduleName.funcName(参数)的形式来调用自定义函数。" />：
            <router-link :to="'/'+currProject.shortName+'/project-setting/jslib'"
                         target="_blank" class="dp-link-primary">
              前往添加
            </router-link>
          </div>
          <div>
            <ul style="margin-left: 16px;">
              <li class="dp-link-primary"
                  v-for="(item, index) in jslibNames" :key="index">
                {{item}}
              </li>
            </ul>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, onBeforeUnmount, onMounted, ref, watch, defineProps} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";

import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as Snippet} from "@/store/snippet";

import {MonacoOptions} from "@/utils/const";
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import Tips from "@/components/Tips/index.vue";
import {notifyError, notifySuccess} from "@/utils/notify";
import {StateType as ProjectStateType} from "@/store/project";

const props = defineProps({
  fullScreen: {
    type: Boolean,
    default: false,
    required: false,
  }
})

const isForBenchmarkCase = inject('isForBenchmarkCase', false);
const {t} = useI18n();

const store = useStore<{ ProjectGlobal: ProjectStateType, Debug: Debug, Snippet: Snippet }>();

const currProject = computed(() => store.state.ProjectGlobal.currProject);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const scriptData = computed<any>(() => {
  return isForBenchmarkCase ? store.state.Debug.benchMarkCase.scriptData : store.state.Debug.scriptData
});
const jslibNames = computed<any>(() => store.state.Snippet.jslibNames);

store.dispatch('Snippet/listJslibNames')

const timestamp = ref('')
const monacoEditor = ref();
watch(scriptData, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const editorOptions = ref(Object.assign({
  usedWith: 'request',
  initTsModules: true,
  allowNonTsExtensions: true,
  minimap: {
    enabled: false
  },
}, MonacoOptions
))
const getPreConditionScript = () => {
  console.log('getPreConditionScript')
  store.dispatch('Debug/getPreConditionScript', { isForBenchmarkCase });
}
const addSnippet = (snippetName) => {
  console.log('addSnippet', snippetName)
  store.dispatch('Debug/addSnippet', { name: snippetName, isForBenchmarkCase })
}
const editorChange = (newScriptCode) => {
  scriptData.value.content = newScriptCode;
}

const save = async () => {
  try {
    console.log('save', scriptData.value)
    const data = cloneDeep(scriptData.value);
    data.debugInterfaceId = debugInfo.value.debugInterfaceId
    data.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    data.projectId = debugData.value.projectId
    const result = await store.dispatch('Debug/saveScript', data)

    if (result) {
      notifySuccess(`保存成功`);
      getPreConditionScript()
    } else {
      notifyError(`保存失败`);
    }
  }catch (e){
    console.log('有可能组件已经卸载了，但是还是会触发事件回调，所以报错：',e);
  }

}

onMounted(() => {
  // todo 太多地方使用这个事件，需要梳理下或者改下名字 eventConditionSave
  // TODO 有重复触发的情况，需要优化
  bus.on(settings.eventConditionSave, save);
  bus.on(settings.eventPreConditionSave, save);
  bus.on(settings.paneResizeTop, () => {
    monacoEditor.value?.resizeIt({
        act: 'heightChanged',
        container: 'codes',
        id: 'pre-script-main-codes',
        mixedHeight: 1,
      })
    })
})
onBeforeUnmount( () => {
  console.log('onBeforeUnmount')
  bus.off(settings.eventPreConditionSave, save);
  bus.off(settings.eventConditionSave, save);
})

</script>

<style lang="less" scoped>
.pre-script-main {
  height: 100%;
  width: 100%;

  .head {
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
  }
  .content {
    display: flex;
    height: 100%;
    &>div {
      height: 100%;
    }

    .codes {
      // flex: 1;
      width: calc(100% - 260px);
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
  }

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
