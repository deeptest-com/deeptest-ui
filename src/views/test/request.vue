<template>
  <div class="request-main">
    <a-form :model="model"
            :label-col="labelCol"
            :wrapper-col="wrapperCol">
      <a-form-item label="名称" name="name">
        <a-input v-model:value="model.name" />
      </a-form-item>

      <a-form-item label="邮箱">
        <a-input v-model:value="model.email" />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 2 }">
        <a-button type="primary" @click="get">Get</a-button>

        <a-button type="primary" @click="post">Post</a-button>

        <a-button type="primary" @click="submit">Submit</a-button>

        <a-button type="primary" @click="submitUrlEncoded">Submit UrlEncoded</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios, {AxiosPromise, AxiosRequestConfig, AxiosResponse} from "axios";
import {getCachedServerUrl} from "@/utils/serverEnv";

const labelCol = { style: { width: '150px' } };
const wrapperCol =  { span: 14 };

const model = ref({});

const get = async () => {
  doGet().then(res => {
    console.log(res)
  })
};

const post = async () => {
  doPost(model.value).then(res => {
    console.log(res)
  })
};
const submit = async () => {
  doSubmit(model.value).then(res => {
    console.log(res)
  })
};
const submitUrlEncoded = async () => {
  doSubmitUrlencoded(model.value).then(res => {
    console.log(res)
  })
};

async function doGet(): Promise<any> {
  return doRequest({
    baseURL: 'http://111.231.16.35:9000/',
    url: `get`,
    method: 'get',
    params: {
      param1: 'p1'
    },
    headers: {
      'header1': 'h1'
    },
  });
}

async function doPost(data): Promise<any> {
  return doRequest({
    baseURL: 'http://111.231.16.35:9000/',
    url: `post`,
    method: 'post',
    data: data,
    params: {
      param1: 'p1'
    },
    headers: {
      'header1': 'h1'
    },
  });
}

async function doSubmit(data): Promise<any> {
  return doRequest({
    baseURL: 'http://111.231.16.35:9000/',
    url: `post`,
    method: 'post',
    data: data,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }],
  });
}

async function doSubmitUrlencoded(data): Promise<any> {
  return doRequest({
    baseURL: 'http://111.231.16.35:9000/',
    url: `post`,
    method: 'post',
    data: data,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }],
  });
}

onMounted(()=> {
  const appLoadingEl = document.getElementsByClassName('app-loading');
  if (appLoadingEl[0]) {
    appLoadingEl[0].classList.add('hide');
    setTimeout(() => {
      document.body.removeChild(appLoadingEl[0]);
    }, 100);
  }
})

const doRequest = (config: AxiosRequestConfig): AxiosPromise => {
  const request = axios.create({
    baseURL: config.baseURL,
    withCredentials: true, // 跨域请求时发送cookie
    timeout: 0
  });

  return request(config).
    then((response: AxiosResponse) => response.data).
    catch(error => {
      console.log(error)
    })
}

</script>

<style scoped lang="less">
.request-main {
  padding: 26px;
  button {
    margin: 0 6px;
  }
}
</style>