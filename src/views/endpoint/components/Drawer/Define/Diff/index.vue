<template>
  <a-modal :visible="diffModalVisible.visible" title="接口定义更新版本对比" :width="1200" @cancel="cancel" :footer="null">
    <div class="container">
      <div class="header">
        <div class="header-left">
          <div class="header-text">
            <span><strong>手动更新</strong></span>
            <span>{{ res.currentDesc }}</span>
          </div>
          <div class="header-button">
            <a-button @click="saveDiff(title.left, false)" >{{
              title.left }}</a-button>
          </div>
        </div>
        <div class="header-right">
          <div class="header-text">
            <span><strong>自动同步</strong></span>
            <span>{{ res.latestDesc }}</span>
          </div>
          <div class="header-button">
            <a-button @click="saveDiff(title.right, true)">{{ title.right }}</a-button>
          </div>
        </div>
      </div>

      <MonacoEditor theme="vs" language="yaml" :height="800" :options="{
        ...MonacoOptions,
        readOnly: true
      }" :diffEditor="true" :original="res.current" v-model:value="res.latest"></MonacoEditor>

    </div>
  </a-modal>
</template>
<script setup lang="ts">

import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import { MonacoOptions } from '@/utils/const';
import { watch, ref, onMounted, computed,defineEmits } from 'vue';
import { useStore } from "vuex";
import { confirmToDo } from "@/utils/confirm";
import { ChangedStatus } from "@/utils/enum";
import { EndpointDiffRes } from '@view/endpoint/data.d.ts';

const store = useStore<{ Endpoint }>();

const diffModalVisible = computed(() => store.state.Endpoint.diffModalVisible);

const res = ref<EndpointDiffRes>({ current: '', latest: '', currentDesc: '', latestDesc: '', changedStatus: 1 });

const title = ref({ left: "保留手动更新", right: "更新为同步版本" })

onMounted(async () => {
 // console.log(diffModalVisible.value.endpointId, "onMounted")
  await getEndPointDiff(diffModalVisible.value.endpointId)
})

watch(() => diffModalVisible.value.endpointId, async (newVal) => {
  //console.log(diffModalVisible.value.endpointId, "watch")
  if (newVal) {
    await getEndPointDiff(newVal)
  }
}
)

const getEndPointDiff = async (endpointId: number) => {
  res.value = await store.dispatch('Endpoint/getEndPointDiff', endpointId);
}

const saveDiff = async (title: string, isChanged: boolean) => {
  const id = diffModalVisible.value.endpointId
  if (isChanged) {
    confirmToDo('将覆盖系统中的手动更新内容', `确定${title}？`, async () => {
      await store.dispatch('Endpoint/saveEndPointDiff', { ...diffModalVisible.value, isChanged: isChanged });
      if (diffModalVisible.value.callPlace == 'detail') {
        await store.dispatch('Endpoint/getEndpointDetail', { id: id });
        const selectedMethodDetail = store.state.Endpoint.endpointDetail.interfaces.find(arrItem => arrItem.method == store.state.Endpoint.selectedMethodDetail.method)
        store.commit('Endpoint/setSelectedMethodDetail', selectedMethodDetail);
      }else {
        callback(id);
      }
    })
  } else {
    await store.dispatch('Endpoint/saveEndPointDiff', { ...diffModalVisible.value, isChanged: isChanged });
    callback(id);
  }
}

const cancel = async() => {
  store.commit('Endpoint/setDiffModalVisible', { ...diffModalVisible.value, visible: false, endpointId: 0 });
}


const emits = defineEmits(['callback'])
function callback(id:number){
     emits('callback',{id:id})
}



</script>

<style lang="less" scoped>
.container {
  border: 1px solid #d9d9d9;
  margin: 0 auto;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left,
    .header-right {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #d9d9d9;
      justify-content: space-between;
      padding: 3px 3px;

      .header-text {
        text-align: left;

        span {
          padding: 0 5px;
        }
      }
    }

    .header-button {
      text-align: right;

      .ant-btn {
        color: #4096ff;
        background: #fff;
        border-color: #4096ff;
      }

      .ant-btn[disabled],
      .ant-btn[disabled]:hover,
      .ant-btn[disabled]:focus,
      .ant-btn[disabled]:active {
        color: rgba(0, 0, 0, 0.25);
        background: #f5f5f5;
        border-color: #d9d9d9;
        text-shadow: none;
        box-shadow: none;
      }
    }

    .header-left {
      border-right: 1px solid #d9d9d9;
      width: 48.5%
    }

    .header-right {
      width: 51.5%
    }
  }
}
</style>


  