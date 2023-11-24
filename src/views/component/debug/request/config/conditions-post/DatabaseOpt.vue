<template>
  <div class="response-dbopt-main">
    <a-form :label-col="{ style: { width: '120px' } }" :wrapper-col="wrapperCol">

      <a-form-item label="数据库连接" v-bind="validateInfos.dbConnId" required>
        <a-row type="flex">
          <a-col flex="auto">
            <a-select v-model:value="model.dbConnId"
                      @blur="validate('dbConnId', { trigger: 'change' }).catch(() => {})">

              <a-select-option key="0" :value="0" >请选择</a-select-option>
              <a-select-option v-for="(item, idx) in dbConns" :key="idx" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-col>

          <a-col flex="100px" class="dp-formitem-suffix">
            <router-link :to="'/'+currProject.shortName+'/project-setting/dbconn'"
                         target="_blank" class="dp-link-primary">
              前往添加
            </router-link>
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item label="SQL语句" v-bind="validateInfos.sql" required>
        <a-textarea v-model:value="model.sql"
                    @blur="validate('sql', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item label="JSONPath" v-bind="validateInfos.jsonPath" required>
        <a-input v-model:value="model.jsonPath"
                 @blur="validate('jsonPath', { trigger: 'blur' }).catch(() => {})"/>

        <div class="tips">
          <div>数据查询返回的结果是个数组，可使用表达式$[0].name读取第一行记录的name属性。</div>
          <!--          <div @click="openHelp()" class="dp-link-primary">
                      了解更多 <ArrowRightOutlined/>
                    </div>-->
        </div>

      </a-form-item>

      <a-form-item label="变量名称" v-bind="validateInfos.variable" required>
        <a-input-group compact>
          <a-input v-model:value="model.variable"
                   @change="onVarChanged"
                   @blur="validate('variable', { trigger: 'blur' }).catch(() => {})"
                   style="width: 72%"/>

          <a-select v-model:value="model.code"
                    @change="onVarSelected"
                    style="width: 28%">
            <a-select-option value="">请选择</a-select-option>

            <a-select-option v-for="(item, idx) in debugData.envDataToView.shareVars"
                             :key="idx"
                             :value="item.id + '-' + item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-input-group>
      </a-form-item>

      <a-form-item label="变量作用域">
        <a-radio-group v-model:value="model.scope">
          <a-radio value="public">公有</a-radio>
          <a-radio value="private">私有</a-radio>
        </a-radio-group>
        <div class="dp-input-tip">
          公有变量在接口所在服务及场景下有效。
        </div>
      </a-form-item>
      <br />
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, inject, onBeforeUnmount, onMounted, reactive, watch, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {Form, notification} from 'ant-design-vue';
import {CheckpointType, ComparisonOperator, ExtractorSrc, ExtractorType, UsedBy} from "@/utils/enum";
import {StateType as Debug} from "@/views/component/debug/store";
import {getEnumSelectItems} from "@/utils/comm";
import {NotificationKeyCommon} from "@/utils/const";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import Tips from "@/components/Tips/index.vue";
import {notifyError, notifySuccess} from "@/utils/notify";
import {listDbConn} from "@/views/project-settings/service";
import useIMLeaveTip from "@/composables/useIMLeaveTip";

const useForm = Form.useForm;
const usedBy = inject('usedBy') as UsedBy
const isForBenchmarkCase = inject('isForBenchmarkCase');
const {t} = useI18n();

const store = useStore<{ Debug: Debug, ProjectGlobal }>();

const currProject = computed(() => store.state.ProjectGlobal.currProject);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const responseData = computed<any>(() => store.state.Debug.responseData);

const {postConditionsDataObj} = useIMLeaveTip();
const model = computed<any>(() => {
  return postConditionsDataObj.value?.[props?.condition?.entityId] || {};
});

const checkConn = async (rule: any, value: number) => {
  if (+value < 1) {
    return Promise.reject('请选择数据库连接');
  } else {
    return Promise.resolve();
  }
};
const rules = computed(() => { return {
  dbConnId: [
    { validator: checkConn, trigger: 'change' },
  ],
  variable: [
    {required: true, message: '请输入变量名', trigger: 'blur'},
  ],
}})

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
  console.log('load', props.condition)
  store.dispatch('Debug/getDbOpt', props.condition)
}
load()

const dbConns = ref([])
const loadDbConns = async () => {
  console.log('loadDbConns')
  const resp = await listDbConn({ignoreDisabled: true})
  dbConns.value = resp.data
}
loadDbConns()

let {resetFields, validate, validateInfos} = useForm(model, rules);

const save = () => {
  console.log('save')
  validate().then(() => {
    model.value.debugInterfaceId = debugInfo.value.debugInterfaceId
    model.value.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    model.value.projectId = debugData.value.projectId

    store.dispatch('Debug/saveDbOpt', model.value).then((result) => {
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

onMounted(() => {
  console.log('onMounted')
  bus.on(settings.eventConditionSave, save);
})
onBeforeUnmount( () => {
  console.log('onBeforeUnmount')
  bus.off(settings.eventConditionSave, save);
})

const onVarChanged = (e) => {
  console.log('onVarChanged', e)

  const value = e.target.value.trim()

  if (!value) {
    model.value.code = ''
    return
  }

  let found = false
  for (let i in debugData.value.envDataToView.shareVars) {
    const item = debugData.value.envDataToView.shareVars[i]

    if (value === item.name) {
      model.value.code = item.id + '-' + item.name
      found = true
      break
    }
  }

  if (!found) {
    model.value.code = ''
  }
};

const onVarSelected = (value) => {
  console.log('onVarSelected')

  const arr = value.split('-')
  model.value.variable = arr[1]
}

const labelCol = { span: 4 }
const wrapperCol = { span: 18 }

</script>

<style lang="less" scoped>
.response-dbopt-main {
  height: 100%;
  width: 100%;

  .head {
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
  }

  .items {
    padding: 6px;
    height: calc(100% - 30px);
    overflow-y: auto;

    .item {
      .ant-col {
        padding: 0 3px;
        word-break: break-all;
      }
    }
  }
}
</style>
