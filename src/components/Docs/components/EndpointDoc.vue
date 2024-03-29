<!--
 项目基本信息
-->
<template>
  <div class="doc-content" v-if="info?.name" :key="info?.id">
    <!-- 服务信息 -->
    <div class="serve-info" v-if="!isInterface">
      <h1>{{ info.name }}</h1>
      <div class="serve-info-block">
        <div class="title"><strong>服务信息</strong></div>
        <div class="items">
          <div class="item" v-for="serve in serveList" :key="serve.url">
            <span><strong>{{ serve.name }}：</strong></span>
            <span>{{ serve.url }}
            <CopyOutlined class="copy-icon" @click="copyURL(serve.url)"/>
          </span>
          </div>
        </div>
      </div>
      <Securitys :items="info?.securities"/>
    </div>
    <!-- ::::接口信息 -->
    <div class="interface-info" v-if="isInterface">
      <h1>{{ info.name }}</h1>
      <p class="ant-typography" v-if="info.description">{{ info.description }}</p>
      <div class="url-info-block">
        <div class="path-info" v-for="path in paths" :key="path.path">
          <span><strong>{{ path.name }}：</strong></span>
          <a-tag class="method-tag" :color="getMethodColor(info.method)">{{ info.method }}</a-tag>
          <span class="request-uri">
            <span class="ant-typography ant-typography-secondary doc-value" :title="handlePathStr(path.url + path.path)">{{ handlePathStr(path.url + path.path) }}</span>
            <CopyOutlined class="copy-icon" @click="copyURL(handlePathStr(path.url + path.path))"/>
          </span>
        </div>
      </div>
      <!-- ::::Mock请求链接： -->
      <div v-if="mockList?.length" style="margin-top: 16px;">
        <h3>Mock请求链接</h3>
        <div class="url-info-block">
          <div class="path-info" v-for="mock in mockList" :key="mock.url">
            <span><strong>{{ mock.name }}：</strong></span>
            <a-tag class="method-tag" :color="getMethodColor(info.method)">{{ info.method }}</a-tag>
            <span class="request-uri">
            <span class="ant-typography ant-typography-secondary  doc-value" :title="mock.url">{{ mock.url }}</span>
            <CopyOutlined class="copy-icon" @click="copyURL(handlePathStr(mock.url))"/>
          </span>
          </div>
        </div>
      </div>
      <div class="interface-request">
        <h2>请求信息</h2>
        <div class="req-item req-path-params" v-if="security">
          <h3>请求鉴权（Security）</h3>
          <Security :item="security"/>
        </div>
        <div class="req-item req-path-params" v-if="info?.endpointInfo.pathParams?.length">
          <h3>路径参数（Path Parameters）</h3>
          <Parameters :items="info?.endpointInfo.pathParams"/>
        </div>
        <div class="req-item req-path-params" v-if="info?.headers?.length">
          <h3>请求Header（Headers）</h3>
          <Parameters :items="info?.headers"/>
        </div>
        <div class="req-item req-path-params" v-if="info?.params?.length">
          <h3>请求参数（Query Parameters）</h3>
          <Parameters :items="info?.params"/>
        </div>
        <div class="req-item req-path-params" v-if="info?.cookies?.length">
          <h3>请求Cookie（Cookies）</h3>
          <Parameters :items="info?.cookies"/>
        </div>
        <div class="req-item req-path-params" v-if="info?.requestBody?.schemaItem?.content">
          <h3 class="body-header">请求体（Request Body）
            <a-tag class="tag" color="default">{{ info.requestBody?.mediaType || '未定义请求体类型'}}</a-tag>
            <a-button class="gen-btn"
                  size="small"
                  @click="genCode(info?.requestBody?.schemaItem?.content)"
                  type="text">
              <template #icon>
                <icon-svg type="script" class="icon"  />
              </template>
            生成代码
          </a-button>
          </h3>
          <p v-if="info.requestBody.description">{{ info.requestBody.description }}</p>
          <SchemaViewer
              :examples-str="info?.requestBody?.examples"
              :components="info?.components"
              :contentType="info?.requestBody?.schemaItem?.type"
              :contentStr="info?.requestBody?.schemaItem?.content"/>
        </div>
      </div>
      <div class="interface-response">
        <div class="header">
          <h2>响应信息</h2>
          <a-checkable-tag
              class="code-tag"
              :style="{color: selectedCode === res.code ? '#fff': getCodeColor(res.code)}"
              @change="selectCode(res.code)"
              v-for="res in info?.responseBodies"
              :checked="selectedCode === res.code"
              :key="res?.code">
            {{
              res.code
            }}
          </a-checkable-tag>
        </div>
      </div>
      <div class="content"
           v-for="res in info?.responseBodies"
           :key="res?.code"
           v-show="selectedCode === res.code">
        <div class="res-item res-desc">
          <p v-if="res.description ">{{ res.description }}</p>
        </div>
        <div class="res-item res-path-params" v-if="res?.headers?.length">
          <h3>响应Header（Headers）</h3>
          <Parameters :items="res?.headers"/>
        </div>
        <div class="res-item res-path-params">
          <h3 class="body-header">响应体（Response Body）
            <a-tag class="tag" color="default">{{ res.mediaType || '未定义响应类型' }}</a-tag>
            <a-button class="gen-btn"
                  size="small"
                  @click="genCode(res?.schemaItem?.content)"
                  type="text">
              <template #icon>
                <icon-svg type="script" class="icon"  />
              </template>
            生成代码
          </a-button>
          </h3>
          <p v-if="res.description">{{ res.description }}</p>
          <SchemaViewer :examples-str="res?.examples"
                        :components="info?.components"
                        :contentType="res?.schemaItem?.type"
                        :contentStr="res?.schemaItem?.content"/>
        </div>
      </div>
    </div>
  </div>
  <GenerateCode
  v-if="genCodeVisible"
  :visible="genCodeVisible"
  @close="close"
  :contentStr="contentStr"
  :projectId="info?.projectId"
  />
</template>

<script lang="ts" setup>
import {computed, defineEmits, defineProps, ref, watch,} from 'vue';
import {getCodeColor, getMethodColor} from "../hooks/index"
import Parameters from "./Parameters.vue"
import Security from "./Security.vue"
import Securitys from "./Securitys.vue"
import SchemaViewer from "@/components/SchemaViewer/index.vue";
import {CopyOutlined} from '@ant-design/icons-vue';
import useClipboard from "@/composables/useClipboard";
import {message, notification} from "ant-design-vue";
import {notifySuccess} from "@/utils/notify";
import IconSvg from "@/components/IconSvg";
import GenerateCode from '@/components/SchemaEditor/GenerateCode.vue';
const props = defineProps<{
  info: Object;
  onlyShowDocs?: boolean;
}>();
const {text, copy} = useClipboard({legacy: true});
const info: any = computed(() => {
  return props.info;
})

const emit = defineEmits(['ok', 'close', 'refreshList']);

const isInterface = computed(() => {
  return props.info && props.info.method;
})

const paths = computed(() => {
  const list: any = [];
  if (info?.value?.serveInfo?.servers) {
    info?.value?.serveInfo?.servers.forEach((item: any) => {
      list.push({
        url: item.url,
        path: info.value.endpointInfo?.path,
        name: item.environmentName
      })
    })
  }
  return list;
})

const mockList = computed(() => {
  const list: any = [];
  if (info?.value?.mock) {
    info.value?.mock.forEach((item: any) => {
      list.push({
        url: item.url,
        name: item.name
      })
    })
  }
  return list;
})

const serveList = computed(() => {
  const list: any = [];
  if (info?.value?.servers) {
    info.value?.servers.forEach((item: any) => {
      list.push({
        url: item.url,
        name: item.environmentName
      })
    })
  }
  return list;
})

const security = computed(() => {
  return info.value?.serveInfo?.securities?.find((item: any) => {
    return item.name === info.value?.security
  });
});

const selectedCode = ref('200');

watch(() => {
  return props.info
}, (newVal) => {
  const responseBodies = newVal?.responseBodies;
  if(responseBodies?.length) {
    selectedCode.value = responseBodies[0].code;
  }
}, {immediate: true})



function selectCode(code) {
  selectedCode.value = code;
}

function handlePathStr(str) {
  return str
  //return str.replace(/\/{2,}/g, '/');
}

function copyURL(url) {
    copy(url)
  notifySuccess('已复制到剪切板 ');
}

const genCodeVisible = ref(false)
const contentStr = ref('')

function genCode(content:string) {
  contentStr.value = content
  genCodeVisible.value = true;
  console.log("genCode",genCodeVisible.value)
}

function close (){
  genCodeVisible.value = false;
  console.log("close",genCodeVisible.value)
}

</script>
<style lang="less" scoped>
.doc-content {
  //margin: 0 16px;
  //width: 720px;
  margin: 0 auto;

  .serve-info {

  }

  .interface-info {

  }

  .url-info-block {
    background-color: hsla(218, 32%, 97%, 1);
    border-radius: 3px;
    padding: 12px;
  }

  .path-info {
    display: flex;
    align-items: center;
    height: 36px;
    line-height: 36px;
    width: 100%;

    a {
      margin-left: 8px;
    }
  }

  .serve-info-block {
    background-color: hsla(218, 28%, 18%, 1);
    border-radius: 3px;
    margin-top: 16px;
    overflow: hidden;
    //padding-bottom: 6px;

    .title {
      background-color: hsla(218, 28%, 18%, 1);
      color: #ffffff;
      height: 36px;
      line-height: 36px;
      padding-left: 16px;
    }
    .items{
      background-color: hsla(218, 27%, 24%, 1);
      padding-bottom: 8px;
      padding-top: 8px;
    }

    .item {
      height: 32px;
      line-height: 32px;
      color: #ffffffa6;
      padding-left: 16px;
      cursor: pointer;
      .copy-icon{
        //display: none;
        opacity: 0;
        margin-left: 6px;
        transition: all 0.3s;
      }
      &:hover{
        .copy-icon{
          opacity: 1;
          display: inline-block;
        }
      }
    }
  }

  .serve-security-block {
    border-radius: 3px;
    margin-top: 24px;
    overflow: hidden;
    padding-bottom: 6px;

    .header {
      background-color: hsla(218, 36%, 88%, 1);
      height: 36px;
      line-height: 36px;
      padding-left: 16px;
    }

    .title {
      background-color: hsla(218, 35%, 91%, 1);
      height: 36px;
      line-height: 36px;
      padding-left: 16px;
    }

    .item {
      background-color: hsla(218, 33%, 94%, 1);
      height: 40px;
      line-height: 40px;
      padding-left: 16px;
    }
  }

  .interface-request {
    margin-top: 24px;
  }

  .interface-response {
    .header {
      height: 48px;
      display: flex;
      align-items: center;
      //justify-content: space-between;
      margin-top: 24px;

      h2 {
        margin: 0;
        margin-right: 16px;
      }

      .code-tag {
        cursor: pointer;
      }
    }
  }


  .body-header {
    display: flex;
    align-items: center;

    .tag {
      margin-left: 16px;
    }
  }

  .method-tag {
    transform: scale(0.85);
    margin-right: 3px;
  }

}

.request-uri {
  display: flex;
  align-items: center;
  flex:1;

  .copy-icon {
    //display: none;
    opacity: 0;
    margin-left: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }
  &:hover {
    .copy-icon {
      opacity: 1;
      //display: block;
    }
  }


}
.doc-value{
  white-space: nowrap;         /* 防止文本换行 */
  overflow: hidden;           /* 隐藏溢出的文本 */
  text-overflow: ellipsis;    /* 显示省略号 */
  max-width: 90%;
}

</style>
