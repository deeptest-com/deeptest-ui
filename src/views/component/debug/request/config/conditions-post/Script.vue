<template>
  <div class="post-script-main">
    <div class="content">
      <div class="codes">
        <MonacoEditor theme="vs" language="typescript" class="editor"
                      :value="model.content"
                      :options="editorOptions"
                      :timestamp="timestamp"
                      @change="editorChange" />
      </div>

      <div class="refer">
        <div class="desc">后置处理脚本使用JavaScript编写，并在收到请求响应后执行。</div>

        <div class="title">代码片段：</div>
        <div>
          <div @click="addSnippet('variables_get')" class="dp-link-primary">获取变量</div>
          <div @click="addSnippet('variables_set')" class="dp-link-primary">设置变量</div>
          <div @click="addSnippet('variables_clear')" class="dp-link-primary">清除变量</div>

          <div @click="addSnippet('datapool_get')" class="dp-link-primary">获取数据池变量</div>

          <div @click="addSnippet('log')" class="dp-link-primary">打印日志</div>

          <div @click="addSnippet('send_request_get')" class="dp-link-primary">发送GET请求</div>
          <div @click="addSnippet('send_request_post')" class="dp-link-primary">发送POST请求</div>

          <div @click="addSnippet('set_mock_resp_code')" class="dp-link-primary">设置响应码</div>
          <div @click="addSnippet('set_mock_resp_field')" class="dp-link-primary">修改JSON响应对象</div>
          <div @click="addSnippet('set_mock_resp_text')" class="dp-link-primary">修改字符串响应内容</div>

          <div @click="addSnippet('assert_resp_status_Code')" class="dp-link-primary">断言响应状态码为200</div>
          <div @click="addSnippet('assert_resp_json_field')" class="dp-link-primary">断言JSON响应字段取值</div>
          <div @click="addSnippet('assert_resp_content_contain')" class="dp-link-primary">断言HTML响应内容包含</div>
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
import {computed, defineProps, inject, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {Form} from 'ant-design-vue';
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {UsedBy} from "@/utils/enum";

import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as Snippet} from "@/store/snippet";

import {MonacoOptions} from "@/utils/const";
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import Tips from "@/components/Tips/index.vue";
import {notifyError, notifySuccess} from "@/utils/notify";
import {StateType as ProjectStateType} from "@/store/project";

const useForm = Form.useForm;
const usedBy = inject('usedBy') as UsedBy
const isForBenchmarkCase = inject('isForBenchmarkCase');
const {t} = useI18n();
const store = useStore<{ ProjectGlobal: ProjectStateType, Debug: Debug, Snippet: Snippet }>();

const currProject = computed(() => store.state.ProjectGlobal.currProject);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const model = computed<any>(() => isForBenchmarkCase ? store.state.Debug.benchMarkCase.scriptData : store.state.Debug.scriptData);
const jslibNames = computed<any>(() => store.state.Snippet.jslibNames);

const props = defineProps({
  condition: {
    type: Object,
    required: true,
  },
  finish: {
    type: Function,
    required: false,
  },
})

const load = () => {
  console.log('load script ...', props.condition)
  store.dispatch('Debug/getScript', props.condition)
  store.dispatch('Snippet/listJslibNames')

}
load()

const timestamp = ref('')
watch(model, (newVal) => {
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

const addSnippet = (snippetName) => {
  store.dispatch('Debug/addSnippet', { name: snippetName });
}
const editorChange = (newScriptCode) => {
  console.log('editorChange', newScriptCode)
  model.value.content = newScriptCode;
}

const rules = reactive({
  content: [
    { required: true, message: '请输入脚本内容', trigger: 'blur' },
  ]
} as any);

let { resetFields, validate, validateInfos } = useForm(model, rules);

const save = () => {
  console.log('save', model.value)
  validate().then(() => {
    model.value.debugInterfaceId = debugInfo.value.debugInterfaceId
    model.value.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    model.value.projectId = debugData.value.projectId

    store.dispatch('Debug/saveScript', model.value).then((result) => {
      if (result) {
        notifySuccess(`保存成功`);
        if (props.finish) {
          props.finish()
        }
      } else {
        notifyError(`保存失败`);
      }
    })
  })
}
const cancel = () => {
  console.log('cancel')
  if (props.finish) {
    props.finish()
  }
}
// watch(() => {
//   return model.value
// },(newVal,oldVal) => {
//   console.log('model.value222 script：',newVal,oldVal)
// },{
//   deep:true
// })

onMounted(() => {
  console.log('onMounted')
  bus.on(settings.eventConditionSave, save);
})
onBeforeUnmount( () => {
  console.log('onBeforeUnmount')
  bus.off(settings.eventConditionSave, save);
})

const labelCol = { span: 0 }
const wrapperCol = { span: 24 }

</script>

<style lang="less" scoped>
.post-script-main {
  height: 100%;
  width: 100%;

  .content {
    display: flex;
    height: calc(100% - 32px);

    &>div {
      height: 100%;
    }
    .codes {
      flex: 1;
      height: 100%;
      min-height: 160px;

      .editor {
        height: 100%;
        min-height: 160px;
      }
    }

    .refer {
      width: 260px;
      height: 100%;
      padding: 10px;
      overflow-y: auto;

      .title {
        margin-top: 12px;
      }
      .desc {
      }
    }
  }
  .footer {

  }


}
</style>
