<!-- 路径定义方式 -->
<template>
  <a-row class="form-item">
    <a-col :span="2" class="form-label">
      <RightOutlined v-if="!collapse" @click="collapse = !collapse"/>
      <DownOutlined v-if="collapse" @click="collapse = !collapse"/>
      <span class="label-name">路径</span>
    </a-col>
    <a-col :span="17">
      <div class="path-param-header">
        <a-input class="path-param-header-input" :value="endpointDetail.path" @change="updatePath" placeholder="请输入路径" />
        <a-button @click="addPathParams" class="path-param-header-btn">
          <template #icon>
            <PlusOutlined/>
          </template>
          路径参数
        </a-button>
      </div>
      <!-- 路径参数 -->
      <div class="path-param-list" v-if="collapse && endpointDetail?.pathParams?.length > 0">
        <Field
            v-for="(item,index) in endpointDetail.pathParams"
            :key="item.id + '' + index"
            :fieldData="{...item,index:index}"
            :showRequire="true"
            @del="deletePathParams(index)"
            @change="handleChange"/>
      </div>
    </a-col>
  </a-row>
</template>
<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  watch,
  onMounted,
  computed,
} from 'vue';
import {useStore} from "vuex";
import {
  defaultPathParams,
} from '@/config/constant';
import {PlusOutlined, DeleteOutlined, RightOutlined, DownOutlined} from '@ant-design/icons-vue';
import Field from './Field.vue'
import {Endpoint} from "@/views/endpoint/data";
import {cloneByJSON} from "@/utils/object";
import {handleParamsLinkPath, handlePathLinkParams} from "@/utils/dom";
import { useRouter } from 'vue-router';

const props = defineProps({});
const emit = defineEmits([]);

const router = useRouter();

const store = useStore<{ Endpoint, Debug, ProjectGlobal, User,ServeGlobal }>();
const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);
const currentUser: any = computed<Endpoint>(() => store.state.User.currentUser);

const environmentsFromServers: any = computed<any>(() => store.state.Debug.environmentsFromServers);

const currServe = computed<any>(() => store.state.ServeGlobal.currServe);
const currentServerId = computed(() => store.state.Debug.currServe.environmentId || null );
// const currentEnvURL = computed(() => {
//   return environmentsFromServers.value?.find((item) => {
//     return currentServerId.value === item.id;
//   })?.url
// });

// 是否折叠,默认展开
const collapse = ref(true);

async function changeServer(val) {
  await store.dispatch('Debug/changeServer', { serverId: val,serveId:endpointDetail.value.id, requestEnvVars: true }); // 切换环境
  endpointDetail.value.serverId = val;
  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
  })
}

/**
 * 添加路径参数
 * */
function addPathParams() {
  collapse.value = true;
  endpointDetail.value.pathParams.push(cloneByJSON({
    ...defaultPathParams,
    name: 'path' + (endpointDetail.value.pathParams.length + 1)
  }));
  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    pathParams: endpointDetail.value.pathParams
  })

  const newPath = handleParamsLinkPath(endpointDetail.value.path, endpointDetail.value.pathParams);
  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    path: newPath,
  });
}

/**
 * 删除路径参数
 * */
function deletePathParams(index) {
  endpointDetail.value.pathParams.splice(index, 1);
  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    pathParams: endpointDetail.value.pathParams
  })

  const newPath = handleParamsLinkPath(endpointDetail.value.path, endpointDetail.value.pathParams);
  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    path: newPath,
  });
}

/**
 * 更新路径参数
 * */
function handleChange(data) {
  endpointDetail.value.pathParams[data.index] = data;

  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    pathParams: endpointDetail.value.pathParams
  })

  const newPath = handleParamsLinkPath(endpointDetail.value.path, endpointDetail.value.pathParams);

  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    path: newPath,
  });
}

/**
 * 更新路径
 * */
function updatePath(e) {
  const path = e.target.value;

  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    path: path,
  });

  const pathParams = handlePathLinkParams(path, endpointDetail.value?.pathParams);

  store.commit('Endpoint/setEndpointDetail', {
    ...endpointDetail.value,
    pathParams
  })
}
</script>
<style lang="less" scoped>
.content {
  padding-top: 16px;
}

.form-item {
  margin-bottom: 16px;

  .form-label {
    line-height: 26px;
  }
}

.label-name {
  margin-left: 4px;
}

.path-param-list {
  margin-top: 16px;
  //padding-top: 16px;
  position: relative;
  &:before{
    display: none;
    content:"";
    position: absolute;
    left: -74px;
    top: -24px;
    width: 2px;
    background: #E5E5E5;
    height: calc(100% + 36px)
  }
}

.path-param-header {
  display: inline-block;
  overflow: hidden;
  width: 100%;
}

.path-param-header-input {
  width: 85%;
}

.path-param-header-btn {
  width: 15%;
}

.form-label {
  font-weight: bold;
}

.select-env {
  min-width: 100px;
  text-align: left;
  border-right: 1px solid #d9d9d9;
}

.current-env-url {
  min-width: 120px;
  padding-left: 16px;
  display: inline-block
}
.add-env-btn{
  width: 80px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
