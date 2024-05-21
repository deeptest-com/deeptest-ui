<template>
  <div class="request-record">

    <a-form :model="model" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="站点地址" v-bind="validateInfos.url">
        <a-input v-model:value="model.url"
                 @blur="validate('url', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item label="包含资源">
        <a-checkbox-group v-model:value="resTypes"
                          :options="resTypeOptions" />
      </a-form-item>

      <a-form-item label="存放目录">
        {{ recordConf.targetName }}
      </a-form-item>

      <a-form-item>
        <a-button v-if="!isRecording" type="primary" class="dp-btn-gap"
                  @click="startRecord"
                  :disabled="!model.url">开始录制</a-button> &nbsp;
        <a-button v-if="isRecording" @click="stopRecord" class="dp-btn-gap">停止录制</a-button>
        &nbsp;&nbsp;&nbsp;
        <a-button :disabled="isRecording || checkedItems.length === 0" @click="importRecordData" class="dp-btn-gap">
          转换成接口
        </a-button>
      </a-form-item>
    </a-form>

    <div class="recorded-data-list">
      <a-form class="filter"
              layout="inline">

        <a-form-item class="select-all">
          <a-checkbox v-model:checked="checkAll" class="check-all"
                      @change="onCheckAll">
            全选
          </a-checkbox>
        </a-form-item>

        <a-form-item class="form-item-search">
          <a-select v-model:value="searchModel.method">
            <a-select-option value="">
              选择请求方法
            </a-select-option>
            <template v-for="(item, index) in requestMethodOpts" :key="index">
              <a-select-option v-if="ignoreMethods.indexOf(item.value) < 0"
                               :value="item.value">
                {{item.label}}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item class="form-item-keywords">
          <a-input-search v-model:value="searchModel.keywords"
                          @search="onSearch"
                          placeholder="输入关键字过滤"
                          enter-button />
        </a-form-item>
      </a-form>

      <a-checkbox-group v-model:value="checkedItems">
        <div v-for="(item, index) in recordData" :key="index"
            :class="[activeItem?.requestId === item.requestId ? 'active' : '']"
            class="recorded-data-item">

          <div class="header dp-link">
            <span class="checkbox block">
              <a-checkbox :value="index" />
            </span>

            <span class="method block">{{item.info.request?.method}}</span>
            <span class="url block">{{getUrl(item.info.request?.url)}}</span>
            <span class="status block" :class="getResultClass(responseMap[item.requestId]?.info?.response?.status)">
              <CheckCircleOutlined v-if="responseMap[item.requestId]?.info?.response?.status===200" />
              <CloseCircleOutlined v-else />

              {{responseMap[item.requestId]?.info?.response?.statusText}}
            </span>

            <span @click.stop="expand(item)" class="actions block">
              <RightOutlined v-if="activeItem?.requestId !== item.requestId"
                             @click.stop="expand(item)"
                             class="dp-icon-btn dp-trans-80" />
              <DownOutlined v-if="activeItem?.requestId === item.requestId"
                            @click.stop="expand(item)"
                            class="dp-icon-btn dp-trans-80" />
            </span>
          </div>

          <div class="content" v-if="activeItem?.requestId === item.requestId">
            请求：{{item}}
            <br />
            响应：{{responseMap[item.requestId]}}
          </div>

        </div>

      </a-checkbox-group>
    </div>

    <div id="deeptest-event-node" style="word-wrap: break-word;"
         @deeptest-event-from-chrome-ext="onChromeExtEvent"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, watch, ref, onUnmounted, provide } from 'vue';
import { useStore } from 'vuex';
import {CheckCircleOutlined, CloseCircleOutlined, RightOutlined, DownOutlined,} from '@ant-design/icons-vue';

import {ScopeDeeptest} from "@/utils/const";
import {Form} from "ant-design-vue";
import {ResultStatus} from "@/utils/enum";
import {StateType as DiagnoseInterfaceStateType} from "@/views/diagnose/store";
import {StateType as ServeStateType} from "@/store/serve";
import {requestMethodOpts} from "@/config/constant";

const store = useStore<{ DiagnoseInterface: DiagnoseInterfaceStateType, ServeGlobal: ServeStateType }>();
const recordConf = computed<any>(() => store.state.DiagnoseInterface.interfaceData);
const currServe = computed<any>(() => store.state.ServeGlobal.currServe);

const useForm = Form.useForm;
const model = ref({url: `${window.location.origin}/test/request`})
const rules = ref({
  url: [
    {required: true, message: '请输入站点URL地址', trigger: 'blur'},
  ],
});
const {resetFields, validate, validateInfos} = useForm(model, rules);

const activeItem = ref({} as any)
const requestMap = ref({} as any)
const responseMap = ref({} as any)
const checkedItems = ref([] as any[])
const isRecording = ref(false)
const checkAll = ref(false)
const searchModel = ref({method: '', keywords: ''})
const resTypes = ref(['XHR'] as string[])
const resTypeOptions = ref([
  {label: 'XHR', value: 'XHR'},
  {label: 'Document', value: 'Document'},
  {label: 'Image', value: 'Image'},
  {label: 'Stylesheet', value: 'Stylesheet'},
  {label: 'Script', value: 'Script'},
  {label: 'Font', value: 'Font'},
])
const ignoreMethods = ['HEAD', 'OPTIONS', 'TRACE']

const recordDataOrigin = ref([] as any[])
const recordData = computed<any>(() => {
  const ret = recordDataOrigin.value.filter((item) => {
    const method = item.info?.request?.method
    if (checkResType(item) &&
        ignoreMethods.indexOf(method) < 0 &&
        method.indexOf(searchModel.value.method) > -1 &&
        item.info?.request?.url.indexOf(searchModel.value.keywords) > -1)
      return true
    else
      return false
  })

  return ret
})

const typeMap = {}
function checkResType(item) {
  const type = item.info?.type

  typeMap[type] = true
  console.log('!!! typeMap', typeMap)

  if (!type) return true

  let ret = true
  for (let i = 0; i < resTypeOptions.value.length; i++) {
    const option= resTypeOptions.value[i]

    if (resTypes.value.indexOf(option.value) < 0 && // not selected
        type === option.value ) { // match
        ret = false
        break
    }
  }

  return ret
}

const onSearch = () => {
  console.log('onSearch', searchModel.value)
}

const expand = (item) => {
  if (activeItem.value.requestId === item.requestId) {
    activeItem.value = {}
  } else {
    activeItem.value = item
  }
}

const startRecord = () => {
  validate().then(async () => {
    console.log('startRecord', model.value)
    const data = {
      scope: ScopeDeeptest,
      content: {
        act: 'recordStart',
        url: model.value.url,
      }
    }

    window.postMessage(data, '*')
  })
}
const importRecordData = () => {
  console.log('importRecordData', checkedItems.value)
  const selected = recordData.value.map((item, index) => {
     if (checkedItems.value.indexOf(index) > -1) {
       return {
         request: item.info.request,
         response: {
           body: item.response?.body,
           status: item.response?.status,
           statusText: item.response?.statusText,
         }
       }
     }
  })

  const data = {
    items: selected,
    targetId: recordConf.value.targetId,
    serveId: currServe.value.id,
  }

  store.dispatch('DiagnoseInterface/importRecordData', data);
}
const stopRecord = () => {
  console.log('stopRecord')
}

const onChromeExtEvent =(event) => {
  console.log('onChromeExtEvent', event.detail)
  const data = event.detail

  if (data.type === 'response') {
    requestMap.value[data.requestId].response = {
      body: data.body,
      status: data.info.response?.status,
      statusText: data.info.response?.statusText,
    }
    responseMap.value[data.requestId] = data
  } else {
    recordDataOrigin.value.push(data)
    requestMap.value[data.requestId] = data
  }
}

const getUrl = (url) => {
  if (!url) return ''

  return url
}
function getResultClass (code) {
  if (!code) return ''

  return code === 200 ? 'pass': 'fail'
}

const onCheckAll = () => {
  console.log('onCheckAll')

  if (checkAll.value) {
    recordData.value.forEach((item, index) => {
      checkedItems.value.push(index)
    })
  } else {
    checkedItems.value = []
  }
}

watch(() => checkedItems, (val) => {
  if (checkedItems.value.length > 0 && checkedItems.value.length === recordData.value.length)
    checkAll.value = true
  else
    checkAll.value = false
}, {immediate: true, deep: true});

const labelCol = {span: 3}
const wrapperCol = {span: 20}

</script>

<style scoped lang="less">
.request-record {
  height: 100%;
  overflow-y: auto;

  .recorded-data-list {
    .filter {
      margin-bottom: 6px;
      .select-all {
        width: 100px;
      }
      .form-item-search {
        width: 360px;
      }
      .form-item-keywords {
        width: 360px;
      }
    }
    .check-all {
      padding-left: 12px;
    }

    .ant-checkbox-group {
      width: 100%;

      .recorded-data-item {
        margin: 4px 0;
        border-radius: 5px;
        border: 1px solid #d9d9d9;

        .header {
          display: flex;
          height: 36px;
          background-color: #fafafa;
          border-radius: 5px;

          padding: 0px 12px;

          span {
            line-height: 36px;

            &.block {
              display: inline-block;
            }
          }

          .checkbox {
            width: 60px;
          }

          .method {
            width: 60px;
          }

          .url {
            flex: 1;
            width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            clear: both;
          }

          .status {
            padding-left: 16px;
            width: 80px;
          }

          .actions {
            width: 28px;
            display: inline-block;
          }
        }

        .content {
          padding: 16px 10px;
          width: 100%;

          .request {

          }

          .response {

          }
        }
      }
    }
  }
}
</style>