<template>
  <div class="formdata-main">
    <div class="dp-param-grid">
      <div class="head">
        <a-row type="flex">
          <a-col flex="1" class="head-title">参数名</a-col>
          <a-col flex="72px" class="head-title">类型</a-col>
          <a-col flex="2" class="head-title">参数值</a-col>
          <a-col flex="80px" class="dp-right">
            <Tips section="path-param" title="请求URL中的路径参数" />

            <a-tooltip @click="removeAll" overlayClassName="dp-tip-small">
              <template #title>全部清除</template>
              <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
            </a-tooltip>

            <a-tooltip @click="add" overlayClassName="dp-tip-small">
              <template #title>新增</template>
              <PlusOutlined class="dp-icon-btn dp-trans-80"/>
            </a-tooltip>
          </a-col>
        </a-row>
      </div>
      <div class="params">
        <a-row v-for="(item, idx) in debugData.bodyFormData" :key="idx" type="flex" class="param">
          <a-col flex="1">
            <a-input v-model:value="item.name" @change="onFormDataChange(idx)" class="dp-bg-input-transparent" />
          </a-col>
          <a-col flex="72px" class="title">
            <a-select
                v-model:value="item.type"
                @change="onFormDataChange(idx)"
                :bordered="false">
              <a-select-option value="text">Text</a-select-option>
              <a-select-option value="file">File</a-select-option>
            </a-select>
          </a-col>

          <a-col flex="2" class="flow">
            <a-input v-if="item.type!=='file'"
                     v-model:value="item.value"
                     class="dp-bg-input-transparent" />

            <a-row v-if="item.type==='file'" class="file-col">
              <a-col flex="2" class="filename">{{getFileName(item.value)}}
                <span class="delete-button" @click="clearFile(idx)">
                  <DeleteOutlined />
                </span>
              </a-col>
              <a-col flex="30px" class="upload-buttons">
                <div v-if="isElectron">
                  <span
                    @click="uploadByElectron(idx)">
                    <UploadOutlined />
                  </span>
                </div>

                <span v-else @click="uploadFile(idx)">
                  <UploadOutlined/>
                </span>
              </a-col>
            </a-row>

          </a-col>

          <a-col flex="80px" class="dp-right dp-icon-btn-container">
            <a-tooltip v-if="!item.disabled" @click="disable(idx)" overlayClassName="dp-tip-small">
              <template #title>禁用</template>
              <CheckCircleOutlined class="dp-icon-btn dp-trans-80" />
            </a-tooltip>

            <a-tooltip v-if="item.disabled" @click="disable(idx)" overlayClassName="dp-tip-small">
              <template #title>启用</template>
              <CloseCircleOutlined class="dp-icon-btn dp-trans-80 dp-light" />
            </a-tooltip>

            <a-tooltip @click="remove(idx)" overlayClassName="dp-tip-small">
              <template #title>移除</template>
              <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
            </a-tooltip>

            <a-tooltip @click="insert(idx)" overlayClassName="dp-tip-small">
              <template #title>插入</template>
              <PlusOutlined class="dp-icon-btn dp-trans-80"/>
            </a-tooltip>
          </a-col>
        </a-row>
      </div>
    </div>
    <input class="dp-upload-file" ref="dpUploadFile" type="file"/>
  </div>
</template>

<script setup lang="ts">

import {computed, ComputedRef, defineComponent, inject, onMounted, PropType, Ref, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {
  CheckCircleOutlined, CloseCircleOutlined,  UploadOutlined, DeleteOutlined, PlusOutlined
} from '@ant-design/icons-vue';
import {notification} from "ant-design-vue";
import {NotificationKeyCommon} from "@/utils/const";
import settings from "@/config/settings";
import {UsedBy} from "@/utils/enum";
const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

import {BodyFormDataItem} from "@/views/component/debug/data";
import {StateType as Debug} from "@/views/component/debug/store";
import {notifyWarn} from "@/utils/notify";
import {getUrls} from "@/utils/request";
import {getToken} from "@/utils/localToken";
import {uploadRequest} from "@/utils/upload";
const store = useStore<{  Debug: Debug }>();
const dpUploadFile = ref();
const debugData = computed<any>(() => store.state.Debug.debugData);

const onFormDataChange = (idx) => {
  console.log('onFormDataChange', idx)
  if (debugData.value.bodyFormData.length <= idx + 1
      && (debugData.value.bodyFormData[idx].name !== '' || debugData.value.bodyFormData[idx].value !== '')) {
    debugData.value.bodyFormData.push({type: 'text'} as BodyFormDataItem)
  }
}

const add = () => {
  console.log('add')
  debugData.value.bodyFormData.push({type: 'text'} as BodyFormDataItem)
}
const removeAll = () => {
  debugData.value.bodyFormData = [{type: 'text'} as BodyFormDataItem]
}

const disable = (idx) => {
  debugData.value.bodyFormData[idx].disabled = !debugData.value.bodyFormData[idx].disabled
}
const remove = (idx) => {
  debugData.value.bodyFormData.splice(idx, 1)
  const len = debugData.value.bodyFormData.length
  if (len == 0 || !!debugData.value.bodyFormData[len-1].name) {
    add()
  }
}
const insert = (idx) => {
  console.log('insert')
  debugData.value.bodyFormData.splice(idx + 1, 0, {type: 'text'} as BodyFormDataItem)
}

const selectedItemIndex = ref(0)

const isElectron = ref(!!window.require)
let ipcRenderer = undefined as any

// catch electron upload event
if (isElectron.value && !ipcRenderer) {
  ipcRenderer = window.require('electron').ipcRenderer

  ipcRenderer.on(settings.electronMsgReplay, (event, result) => {
    if (result.code === 0) {
      // data.value = result.data.data
      debugData.value.bodyFormData[selectedItemIndex.value].value = result.data.path
    }
  })
}

const uploadByElectron = async (index) => {
  console.log('uploadByElectron', index)
  selectedItemIndex.value = index

  const data = {
    act: 'uploadFile',
    url: getUrls().serverUrl + '/upload',
    params: {isJslib: true},
    token: await getToken(),
  }
  ipcRenderer.send(settings.electronMsg, data)
}

const uploadFile = (idx) => {
  dpUploadFile.value.click();
  dpUploadFile.value.onchange = e => {
    const file = e.target.files[0];

    uploadRequest(file, {}).then((res) => {
      debugData.value.bodyFormData[idx].value = res.path;
      e.target.value = '';
    })
  }
}

const clearFile = (idx) => {
  debugData.value.bodyFormData[idx].value = '';
}

const getFileName = (path) => {
  if (!path) {
    return ''
  }
  return path.replace(/^.*[\\\\/]/, '')
}

</script>

<style lang="less" >
.formdata-main {
  height: 100%;
  //overflow-y: auto;
  max-height: 180px;
  overflow-y: scroll;

  .flow {
    line-height: 32px;
    input {
      width: calc(100% - 46px)
    }
    .filename {
      padding: 0 10px;
      border-right: 0 !important;
    }
    .upload-buttons {
      .ant-upload.ant-upload-select {
        display: block;
      }
    }
    .ant-btn {
      background: transparent;
      color: rgba(0, 0, 0, 0.65);
      &:hover, &:active {
        background: transparent;
        color: rgba(0, 0, 0, 0.65);
        border-color: #d9d9d9;
      }
    }
  }

  .head-title {
    text-indent:10px;
  }
}

.dp-upload-file {
  width: 20px;
  height: 20px;
  position: fixed;
  top: -1000px;
  left: -1000px;
  z-index: -1000;
  opacity: 0;
}

.file-col {
  .upload-buttons {
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    padding-right: 16px;

    span {
      cursor: pointer;
    }
  }

  .filename {
    .delete-button {
      position: absolute;
      right: 16px;
      top: 0;
    }
  }

  .delete-button {
    display: none;
    cursor: pointer;
  }

  .filename:hover {
    .delete-button {
      display: block;
    }
  }
}

</style>
