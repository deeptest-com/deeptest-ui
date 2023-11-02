<template>
  <div class="processor_custom_code-edit dp-processors-container">
    <ProcessorHeader v-if="fullscreen"/>
    <CustomCodeHeader v-if="fullscreen" mode="fullscreen" @update-screen="emits('cancel')" />
    <div class="content">
      <div class="codes">
        <MonacoEditor 
          customId="custom-code-container"
          ref="monacoEditor"
          theme="vs" 
          language="typescript" 
          class="editor"
          :value="modelRef.content || ''"
          :timestamp="timestamp"
          :options="editorOptions"
          @change="editorChange"/>
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
import {computed, ref, watch, inject, defineEmits, onMounted} from "vue";
import {useStore} from "vuex";
import {MonacoOptions, NotificationKeyCommon} from "@/utils/const";

import {StateType as ScenarioStateType} from "../../../../../store";
import {StateType as Snippet} from "@/store/snippet";

import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import CustomCodeHeader from './header.vue';
import {notifyError, notifySuccess} from "@/utils/notify";
import Tips from "@/components/Tips/index.vue";
import {StateType as ProjectStateType} from "@/store/project";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";

const store = useStore<{ ProjectGlobal: ProjectStateType, Scenario: ScenarioStateType, Snippet: Snippet }>();

const currProject = computed(() => store.state.ProjectGlobal.currProject);
const modelRef: any = computed<boolean>(() => store.state.Scenario.nodeData);
const jslibNames = computed<any>(() => store.state.Snippet.jslibNames);

const emits = defineEmits(['cancel']);

const fullscreen = inject('fullscreen');

const editorOptions = ref(Object.assign({
  usedWith: 'request',
  initTsModules: true,

  allowNonTsExtensions: true,
  minimap: {
    enabled: false
  },
}, MonacoOptions));
const monacoEditor = ref();

onMounted(() => {
  store.dispatch('Snippet/listJslibNames');
  bus.on(settings.paneResizeTop, async () => {
    console.log('sdsadsadsadsad');
    monacoEditor.value?.resizeIt({
      act: settings.eventTypeContainerHeightChanged,
      container: 'codes',
      id: 'custom-code-container'
    });
  })
})

const save = async () => {
  const res = await store.dispatch('Scenario/saveProcessor', {
    ...modelRef.value,
    content: modelRef.value.content,
  })

  if (res === true) {
    notifySuccess(`保存成功`);
  } else {
    notifyError(`保存失败`);
  }
}

const addSnippet = (snippetName) => {
  store.dispatch('Scenario/addSnippet', snippetName)
}
const editorChange = (newScriptCode) => {
  modelRef.value.content = newScriptCode;
}

const timestamp = ref('')
watch(modelRef, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

</script>

<style lang="less" scoped>
.processor_custom_code-edit {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .content {
    display: flex;
    flex: 1;

    & > div {
      height: 100%;
    }

    .codes {
      width: calc(100% - 264px);
      overflow: scroll;
      overflow-y: hidden;
      .editor {
        height: 100%;
        min-height: 160px;
      }
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

  //.buttons {
  //  position: sticky;
  //  bottom: 3px;
  //}
}
</style>
