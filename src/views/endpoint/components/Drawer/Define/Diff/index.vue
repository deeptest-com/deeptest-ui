<template>
  <a-modal :visible="diffModalVisible.visible" title="接口定义更新版本对比" :width="1200" @cancel="cancel" :footer="null">
    <div class="container" v-if="res.current">
      <div class="header">
        <div class="header-left">
          <div class="header-text">
            <span><strong>手动更新</strong></span>
            <span>{{ res.currentDesc }}</span>
          </div>
          <div class="header-button">
            <a-button @click="saveDiff(title.left,false)">{{title.left}}</a-button>
          </div>
        </div>
        <div class="header-right">
          <div class="header-text">
            <span><strong>自动同步</strong></span>
            <span>{{ res.latestDesc }}</span>
          </div>
          <div class="header-button">
            <a-button @click="saveDiff(title.right,true)">{{title.right}}</a-button>
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
import { watch, ref, onMounted, computed } from 'vue';
import { useStore } from "vuex";
import { confirmToDo } from "@/utils/confirm";

const store = useStore<{ Endpoint }>();

const diffModalVisible = computed(() => store.state.Endpoint.diffModalVisible);

const res = ref({ current: '', latest: '', currentDesc: '', latestDesc: '' });

const title = ref({left:"保留手动更新",right:"更新为同步版本"})

onMounted(async () => {
  console.log(diffModalVisible.value.endpointId)
  await getEndPointDiff(diffModalVisible.value.endpointId)
}),


  watch(() => diffModalVisible.value.endpointId, async (newVal) => {
    if (newVal) {
      await getEndPointDiff(newVal)
    }
  }

  )

const getEndPointDiff = async (endpointId: number) => {
  res.value = await store.dispatch('Endpoint/getEndPointDiff', endpointId);
}

const saveDiff = async (title: string,isChanged: boolean) => {
  confirmToDo(`确定${title}？`, '', async () => {
   await store.dispatch('Endpoint/saveEndPointDiff', {...diffModalVisible.value,isChanged:isChanged});
    cancel();
    if (diffModalVisible.value.callPlace == 'detail') {
      await store.dispatch('Endpoint/getEndpointDetail', {id:diffModalVisible.value.endpointId});
      const selectedMethodDetail =  store.state.Endpoint.endpointDetail.interfaces.find(arrItem => arrItem.method == store.state.Endpoint.selectedMethodDetail.method)
      store.commit('Endpoint/setSelectedMethodDetail', selectedMethodDetail);

    }
  })
}

const cancel = () => {
  store.commit('Endpoint/setDiffModalVisible', { ...diffModalVisible.value, visible: false,endpointId:0});
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


  