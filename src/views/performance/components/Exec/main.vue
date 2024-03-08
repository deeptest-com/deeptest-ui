<template>
  <div class="performance-test-exec">
    <div class="toolbar">
      {{t(progressStatus)}} &nbsp;
      <a-button v-if="progressStatus !== WsMsgCategory.InProgress" type="primary"
                @click="execBegin">
        开始执行
      </a-button> &nbsp;

      <a-button v-else
                @click="execCancel">
        停止执行
      </a-button>
    </div>

    <div class="tab-bar">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="metrics" tab="性能指标" />

        <a-tab-pane key="machine" tab="压力机监控" />

        <a-tab-pane key="logs" tab="详细日志" />
      </a-tabs>
    </div>

    <div class="tab-content">
      <div v-if="activeKey === 'metrics'" class="metrics">
        <div class="charts-container">
          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataVuCount" autoresize />
          </div>

          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataAvgDurationAll" autoresize />
          </div>

          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataAvgQps" autoresize />
          </div>

          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataFailNumb" autoresize />
          </div>
        </div>

        <div class="request-summary"
             v-if="summaryData.total">
          <a-row type="flex">
            <a-col :flex="4">
              <div class="title">
                请求总数
              </div>
              <div class="content">
                {{ summaryData.total }}
              </div>
            </a-col>

            <a-col :flex="4">
              <div class="title">
                平均
              </div>
              <div class="content">
                {{ summaryData.mean }}
              </div>
            </a-col>
            <a-col :flex="4"><div class="title">
              最小
            </div>
              <div class="content">
                {{ summaryData.min }}
              </div>
            </a-col>
            <a-col :flex="4"><div class="title">
              最大
            </div>
              <div class="content">
                {{ summaryData.max }}
              </div></a-col>
            <a-col :flex="4"><div class="title">
              中位数
            </div>
              <div class="content">
                {{ summaryData.median }}
              </div></a-col>
            <a-col :flex="4"><div class="title">
              95%
            </div>
              <div class="content">
                {{ summaryData.quantile95 }}
              </div></a-col>
          </a-row>
        </div>

        <div class="request-table"
             v-if="tableReqResponseTime.length > 0">
          <a-table
              :dataSource="tableReqResponseTime"
              :columns="tableReqResponseTimeColumns"
              rowKey="recordName"/>
        </div>
      </div>

      <div v-if="activeKey === 'machine'" class="machine">
        <div class="charts-container">
          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataCpu" autoresize />
          </div>
          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataMemory" autoresize />
          </div>
          <div class="chart-box chart-box1">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataDisk" autoresize />
          </div>
        </div>
        <div class="charts-container">
          <div class="chart-box chart-box2">
            <v-chart class="chart" style="width: 100%; height: 300px;"
                     :option="chartDataNetwork" autoresize />
          </div>
          <div class="chart-box chart-box1">
          </div>
        </div>
      </div>

      <div v-if="activeKey === 'logs'" class="logs">
        <Log v-if="activeKey === 'logs'"
             :request="request"
             :logs="execLogs"
             :startLog="startLog"
             :stopLog="stopLog" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { use} from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';

import {ref, onMounted, onUnmounted} from 'vue';
import {getUuid} from "@/utils/string";
import {WsMsgCategory} from "@/utils/enum";
import {tableReqResponseTimeColumns} from "./config"
import useCaseExecution from "./exec";
import {useI18n} from "vue-i18n";
import Log from "./log.vue";

require("echarts/lib/component/grid");
const { t } = useI18n();

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

// provide(THEME_KEY, 'dark'); // for echart style
const activeKey = ref('metrics')

const { execJoin, execStart, execStop, startLog, stopLog,
        progressStatus,
        chartDataVuCount, chartDataAvgQps, chartDataFailNumb, chartDataAvgDurationAll,
        chartDataCpu, chartDataMemory, chartDataDisk, chartDataNetwork,
        tableReqResponseTime, summaryData, execLogs, request } = useCaseExecution()

const execUuid = ref('');

const execBegin = async () => {
  console.log('execBegin')

  execUuid.value = getUuid()
  execStart({
    "uuid": execUuid.value,
    "planId": 1,
    "title": "my test",

    "serverAddress": "192.168.0.105:8086",
    "influxdbAddress": "http://192.168.0.105:8087",
    "influxdbOrg": "deeptest",
    "influxdbToken": "CjK5KHeIopceCfRznN7RZxlffNrnCOBJ6Ugi9PCFb-mRu4ZQJ01tqpE4oeWmw5VlaDk-y3JMkKSx8k8Klwh04g==",

    // "goalAvgQps": 100,
    // "goalAvgResponseTime": 100,
    // "goalFailed": "300",

    "runners": [
      {
        "id": 1,
        "name": "127.0.0.1",
        "grpcAddress": "127.0.0.1:9528",
        "webAddress": "127.0.0.1:8086",
        "weight": 100,
      },
      {
        "id": 2,
        "name": "192.168.0.56",
      }
    ],

    "scenarios": [
      {
        "id": 1,
        "name": "my scenario 1",

        "generateType": "constant",
        "stages": [
          {
            "target": 10,
            "duration": 60,
          },
          {
            "target": 0,
            "duration": 3600,
          }
        ],

        "processors": [
          {
            "id": 1,
            "name": "interface1",
            "type": "processor_interface_default"
          },
          {
            "type": "rendezvous",
            "name": "rendezvousA",
            "rendezvousTarget": 5
          },
          {
            "id": 2,
            "name": "interface2",
            "type": "processor_interface_default"
          },
          {
            "id": 3,
            "name": "interface3",
            "type": "processor_interface_default"
          },
          {
            "id": 4,
            "name": "interface4",
            "type": "processor_interface_default"
          },
          {
            "id": 5,
            "name": "interface5",
            "type": "processor_interface_default"
          },
          {
            "id": 6,
            "name": "interface6",
            "type": "processor_interface_default"
          }
        ],
      },
      {
        "id": 2,
        "runners": [1,2],
      }
    ]
  });
}

const execCancel = () => {
  console.log('execCancel')
  execStop();
}

onMounted(() => {
  console.log('onMounted')

  setTimeout(() => {
    execJoin('')
  }, 1000)
})
onUnmounted(() => {
  console.log('onUnmounted')
})

</script>

<style scoped lang="less">
.performance-test-exec {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    height: 32px;
    text-align: right;
  }
  .tab-bar {
    height: 61px;
  }
  .tab-content {
    flex: 1;
    height: 0;

    .metrics {
      height: 100%;
      overflow-y: auto;
    }
    .machine {
      height: 100%;
      overflow-y: auto;
    }
    .logs {
      height: 100%;
    }
  }

  .charts-container {
    display: flex;

    .chart-box {
      margin-bottom: 26px;
      .chart {
        width: 100%;
      }
    }

    .chart-box1 {
      flex: 1;
    }
    .chart-box2 {
      flex: 2;
    }
  }

  .request-summary {
    .ant-row {
      .ant-col {
        margin: 3px;
        padding: 10px;
        height: 100px;
        border-bottom: 1px solid #f0f0f0;
        background: #fff;

        .title {

        }
        .content {
          padding-bottom: 8px;
          height: calc(100% - 12px);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 36px;
        }
      }
    }
  }
  .request-table {
    padding: 3px;
  }
}
</style>
