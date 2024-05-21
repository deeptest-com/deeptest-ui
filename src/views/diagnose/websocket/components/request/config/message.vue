<template>
  <div class="websocket-request-message-main">
    <div class="editor-container">
      <MonacoEditor
          ref="websocketMonacoEditor" customId="websocket-request-body-main" theme="vs" class="editor"
          v-model:value="model.message"
          language="json"
          :options="editorOptions"
          @change="editorChange"
          :timestamp="timestamp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import {useStore} from "vuex";
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {computed, onMounted, ref, watch} from "vue";
import {MonacoOptions} from "@/utils/const";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>()
const model = computed<any>(() => store.state.DiagnoseInterface.websocketDebugData)

const editorOptions = ref(Object.assign({usedWith: 'websocket'}, {
  ...MonacoOptions,
  isInitFormat:true,
}))

const editorChange = (newScriptCode) => {
  model.value.message = newScriptCode;
}

const timestamp = ref('')
watch(model, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const websocketMonacoEditor = ref();
onMounted(() => {
})

</script>

<style lang="less" scoped>
.websocket-request-message-main {
  height: 100%;
}
</style>

<style lang="less">
.websocket-request-message-main {
  .editor-container {
    height: 100%;
    min-height: 160px;
    .editor {
      height: 100%;
      min-height: 160px;
    }

    .jsoneditor-vue {
      height: 100%;
      .jsoneditor-menu {
        display: none;
      }
      .jsoneditor-outer {
        margin: 0;
        padding: 0;
        height: 100%;
        .ace-jsoneditor {
          height: 100%;
        }
      }
    }
  }
}
</style>