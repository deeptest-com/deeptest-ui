<template>
  <div class="endpoint-header">
    <div class="endpoint-method">
      <!-- <IconSvg :type="DESIGN_TYPE_ICON_MAP[endpointData.processorType]" class="processor-icon-svg"/> -->
      <span :style="{ color: getMethodColor(reqContent.method) }">
              {{ reqContent.method }}
      </span>
    </div>
    <div class="endpoint-basis">
      <div class="endpoint-url">
        <TooltipCell :text="reqContent.url || ''" />
      </div>
      <div class="endpoint-name">
        <TooltipCell :text="endpointData.name || ''" />
      </div>
    </div>
   
    <div class="endpoint-code" v-if="endpointData.resultStatus !== 'loading'">
      状态码: &nbsp; 
      <span :style="{ color: `${responseCodeColorMap[resContent.statusCode]}` }">{{ resContent.statusCode }}</span>
    </div>

    <div
      class="endpoint-time"
      v-if="endpointData.resultStatus !== 'loading'">
      耗时:
      <a-tooltip :title="`${resContent.time} ms`">&nbsp;
        <span v-html="formatWithSeconds(resContent.time)"></span>
      </a-tooltip>
    </div>

    <div
      class="endpoint-size"
      v-if="endpointData.resultStatus !== 'loading'">
      大小: &nbsp;<span style="color: rgb(4, 196, 149)">{{ resContent.contentLength }} B</span>
    </div>

    <div class="status endpoint-status">
      <span :class="[ ClassMap[endpointData.resultStatus]]"
            v-if="endpointData.resultStatus !== 'loading'">{{ StatusMap[endpointData.resultStatus] }}</span>
      <span v-else><a-spin :indicator="indicator"/></span>
    </div>

    <div class="endpoint-expand-btn" @click.stop="handleQueryDetail">
      详情
    </div>

    <ResponseDrawer
      :data="endpointData"
      :response-drawer-visible="logResponseDetailVisible"
      @onClose="logResponseDetailVisible = false" />
  </div>
</template>
<script setup lang="ts">
import {defineProps, h, defineEmits, computed, ref, reactive} from 'vue';
import {LoadingOutlined} from '@ant-design/icons-vue';
import {responseCodes} from '@/config/constant';
import {formatWithSeconds} from '@/utils/datetime';
import ResponseDrawer from '@/views/component/Report/Response/index.vue';
import { getMethodColor } from '@/utils/interface';
import {watch} from "vue/dist/vue";
import TooltipCell from '@/components/Table/tooltipCell.vue';


enum StatusMap {
  'pass' = '通过',
  'expires' = '过期',
  'fail' = '失败'
}

enum ClassMap {
  'pass' = 'endpoint-success',
  'expires' = 'endpoint-expires',
  'fail' = 'endpoint-error',
  'loading' = 'endpoint-loading'
}

const props = defineProps({
  endpointData: {
    type: Object,
    required: true
  }
});

const emits = defineEmits(['queryDetail']);
const reqContent = computed(() => props.endpointData.reqContent ? JSON.parse(props.endpointData.reqContent) : {});
const resContent = computed(() => props.endpointData.respContent ? JSON.parse(props.endpointData.respContent) : {});
const responseCodeColorMap = {};
const logResponseDetailVisible = ref(false);
const currRespDetail = reactive({ reqContent: {}, resContent: {}, invokeId: 0 });

responseCodes.forEach(e => {
  responseCodeColorMap[e.value] = e.color;
})

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '16px',
    color: '#b0b0b0'
  },
  spin: true,
});

function handleQueryDetail() {
  logResponseDetailVisible.value = true;
}
</script>
<style scoped lang="less">
.endpoint-collapse-item {

  :deep(.ant-collapse-content.ant-collapse-content-active) {
    background-color: #fbfbfb;


    .ant-collapse-content-box {
      padding: 9px 16px;
    }
  }
}

.endpoint-expand-btn {
    color: #447DFD;
  }

.endpoint-header {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;

  .endpoint-status {
    height: 22px;
    font-size: 14px;
    border-radius: 2px;
    text-align: left;
    line-height: 22px;
    margin-right: 16px;

    .endpoint-success {
      background: #E6FFF4;
      color: #04C495;

    }

    .endpoint-error {
      background: #FFF2F0;;
      color: #F63838;
    }

    .endpoint-expires {
      background: #FFF2F0;;
      color: #F63838;
    }
  }

  .endpoint-method {
    font-weight: bold;
    font-size: 14px;
    line-height: 22px;
    text-align: left;
    margin-right: 20px;
  }

  .endpoint-code {
    margin-right: 12px;
  }

  .endpoint-time,
  .endpoint-code,
  .endpoint-size {
    text-align: left;
    font-size: 14px;
    line-height: 22px;
    margin-right: 16px;

    //margin-right: 29px;
    color: rgba(0, 0, 0, 0.85);

    span {
      color: #04C495;
    }
  }

  .endpoint-time {
    width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .endpoint-code {
    width: 80px;
  }

  .endpoint-size {
    width: 80px;
  }
}

.processor-icon-svg {
  display: inline-block;
  margin-right: 4px;
}

.endpoint-basis {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;

  .endpoint-url,
  .endpoint-name {
    line-height: 22px;
    text-align: left;
    overflow: hidden;
  }

  .endpoint-url {
    padding-right: 16px;
    color: #447DFD;
  }

  .endpoint-name {
    flex: 1;
    padding-right: 16px;
  }
}
</style>
