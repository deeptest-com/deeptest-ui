<template>
  <div class="statistics">
    <a-row type="flex">
      <a-col flex="1 1 200px">
        <a-card title="统计数据">
          <div
            style="
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap; /* 只要您把这个属性去掉,就不会自动换行了*/
            "
          >
            <a-card style="width: 49%; margin-bottom: 16px">
              <div class="card-content">
                <StatisticTooltip
                  v-if="type === 0"
                  title="项目数（个）"
                  :value="card?.projectTotal||0"

                />
                <StatisticTooltip
                  v-else
                  :title="'项目成员（位）'"
                  :value="card?.userTotal||0"
                />
              </div>
            </a-card>
            <a-card style="width: 49%; margin-bottom: 16px">
              <div class="card-content">
                <StatisticTooltip
                  title="总接口数（个）"
                  :value="card?.interfaceTotal"
                  :hbValue="card?.interfaceHb"
                  :prompt="'接口定义目录下所有的接口总数。接口的含义：请求方法+请求路径。一个接口文档中同一个请求路径下可以定义多个请求方法，接口定义列表的总数可能和总接口数不一致。'"
                />
                <StatisticTooltip
                  title="总测试场景数（个）"
                  :value="card?.scenarioTotal"
                  :hbValue="card?.scenarioHb"
                  :prompt="'测试开发入口下的所有测试场景总数。'"
                />
              </div>
            </a-card>
            <a-card style="width: 49%; margin-bottom: 16px">
              <div class="card-content">
                <StatisticTooltip
                  title="接口测试总体覆盖率（%）"
                  :value="card?.coverage"
                  :hbValue="card?.interfaceHb"
                  :suffix="'%'"
                  :prompt="'所有测试场景执行调用的接口总数去重 / 总接口数 * 100%，包括通过测试计划执行关联场景调用的接口。'"
                />
              </div>
            </a-card>
            <a-card style="width: 49%; margin-bottom: 16px">
              <div class="card-content">
                <StatisticTooltip
                  title="执行总次数"
                  :value="card?.execTotal||0"
                  :prompt="'所有场景用例执行总次数，包括通过测试计划执行关联场景的次数，不去重。'"
                />
                <StatisticTooltip
                  :precision="2"
                  :suffix="'%'"
                  title="测试通过率（%）"
                  :value="card?.passRate?card.passRate:0"
                  :prompt="'测试场景执行结果中断言（即功能检查点）的通过率。包括场景中的断言步骤和接口请求中的断言。'"
                />

              </div>
            </a-card>
          </div>
        </a-card>
      </a-col>
      <a-col class="pie" style="margin-left: 14px" flex="0 1 450px">
        <a-card title="发现缺陷分布">
          <Pie :params="pieData"/>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref, defineProps } from "vue";
import Pie from "@/components/Pie/index.vue";
import * as echarts from "echarts";
import { useStore } from "vuex";
import { StateType } from "@/views/home/store";
import StatisticTooltip from "./statistic-Tooltip.vue";
const store = useStore<{ Home: StateType }>();
const pieData = computed<any>(() => store.state.Home.pieData);
// 组件接收参数
const props = defineProps({
  // 请求API的参数
  params: { type: Object },
  type: { type: Number },
});
// console.log("staticstic params", props.params);
const card = ref<any>({});

// 监听项目数据变化
watch(() => {return props.params;}, async (newVal: any) => {
      console.log("watch staticstic newVal", newVal);
      card.value = newVal.cardData;
    }, {immediate: true});

</script>
<style lang="less" scoped>

.statistics {
  // padding:  16px;

  .card-content {
    display: flex;
    justify-content: space-between;
    :deep(.ant-statistic-content){
      font-size: 32px;
      font-weight: 400;
    }
  }

  .pie {
    background: #fff;
    :deep(.ant-card) {
      height: 100%;
    }
    :deep(.ant-card-body) {
      // height: 38vh !important;
      height: calc(100% - 57px);
      padding: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

</style>


