<template>
  <div class="request-record">

    <a-form :model="model" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="站点地址" v-bind="validateInfos.url">
        <a-input v-model:value="model.url"
                 @blur="validate('url', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" class="dp-btn-gap"
                  @click="startRecord"
                  :disabled="!model.url">开始录制</a-button> &nbsp;
        <a-button @click="stopRecord" class="dp-btn-gap">停止录制</a-button>
      </a-form-item>
    </a-form>

      <div id="deeptest-event-node" style="word-wrap: break-word;"
           @deeptest-event-from-chrome-ext="onChromeExtEvent"></div>

      <div class="recorded-data-list">

        <div  v-for="(item, index) in recordData" :key="index"
              :class="[activeItem.requestId === item.requestId ? 'active' : '']"
              class="recorded-data-item">

          <div class="header dp-link" @click.stop="expand(item)">
            <span class="checkbox block">
              <a-checkbox v-model:checked="checked" />
            </span>
            <span class="method block">{{item.request.request.method}}</span>
            <span class="url block">{{getUrl(item.request.request.url)}}</span>
            <span class="status block" :class="getResultClass(responseMap[item.requestId]?.statusCode)">
              <CheckCircleOutlined v-if="responseMap[item.requestId]?.statusCode===200" />
              <CloseCircleOutlined v-else />

              {{responseMap[item.requestId]?.statusLine}}
            </span>

            <span class="actions block">
              <RightOutlined v-if="activeItem.requestId !== item.requestId"
                             @click.stop="expand(item)"
                             class="dp-icon-btn dp-trans-80" />
              <DownOutlined v-if="activeItem.requestId === item.requestId"
                            @click.stop="expand(item)"
                            class="dp-icon-btn dp-trans-80" />
            </span>
          </div>

          <div class="content" v-if="activeItem.requestId === item.requestId">
            {{item}}
            <br />
            {{responseMap[item.requestId]}}
<!--            <div class="request">
              <a-row v-if="item.requestBody" type="flex">
                <a-col flex="100px">请求体：</a-col>
                <a-col flex="auto">
                  {{item.requestBody}}
                </a-col>
              </a-row>
            </div>-->

            <div class="response">

            </div>
          </div>

        </div>

      </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, watch, ref, onUnmounted, provide } from 'vue';
import { useStore } from 'vuex';
import {CheckCircleOutlined, CloseCircleOutlined, RightOutlined, DownOutlined,} from '@ant-design/icons-vue';

import {ScopeDeeptest} from "@/utils/const";
import {Form} from "ant-design-vue";
import {ResultStatus} from "@/utils/enum";

const useForm = Form.useForm;
const model = ref({url: 'http://111.231.16.35:9000/forms/post'})
const rules = ref({
  url: [
    {required: true, message: '请输入站点URL地址', trigger: 'blur'},
  ],
});
const {resetFields, validate, validateInfos} = useForm(model, rules);

const activeItem = ref({} as any)
const recordData = ref([] as any[])
const responseMap = ref({} as any)
const checked = ref({} as any)

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

const stopRecord = () => {
  console.log('stopRecord')
}

const onChromeExtEvent =(event) => {
  console.log('onChromeExtEvent', event.detail)
  const data = event.detail

  if (data.response) {
    responseMap.value[data.requestId] = data
  } else {
    recordData.value.push(data)
  }
}

const getUrl = (url) => {
  console.log(url)

  if (!url) return ''

  if (url.length > 50) {
    url = url.substr(0,50) + '...'
  }

  return url
}
function getResultClass (code) {
  if (!code) return ''

  return code === 200 ? 'pass': 'fail'
}

const labelCol = {span: 3}
const wrapperCol = {span: 20}

</script>

<style scoped lang="less">
.request-record {
  height: 100%;
  overflow-y: auto;

  .recorded-data-list {
    .recorded-data-item {
      margin: 4px;
      border-radius: 5px;
      border: 1px solid #d9d9d9;

      .header {
        height: 36px;
        background-color: #fafafa;
        border-radius: 5px;

        padding: 0px 12px;

        span {
          line-height: 36px;
          &.block{
            display: inline-block;
          }
        }

        .checkbox {
          width: 60px;
        }

        .method {
          width: 100px;
        }

        .url {
          width: calc(100% - 348px);
        }

        .status {
          width: 160px;
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

</style>