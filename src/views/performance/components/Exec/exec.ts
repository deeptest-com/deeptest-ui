import { ref, Ref, computed } from 'vue';
import {getWebSocketApi} from "@/services/websocket";
import cloneDeep from "lodash/cloneDeep";
import {MsgCategory, MsgInstruction, WsMsgCategory} from "@/utils/enum";
import {scrollTo} from "@/utils/dom";

import {
    genAllResponseTimeChart, genCpuMetricsChart,
    genDiskMetricsChart, genMemoryMetricsChart,
    genNetworkMetricsChart, genFailedNumbChart, genVuCountChart,
} from "@/views/performance/service";

import {sampleAvgDuration} from "./config";
import {PerformanceTestWsClient} from "./websocket";
import {notifyError} from "@/utils/notify";

interface Execution {
    progressStatus: Ref<WsMsgCategory>;
    execJoin: Function;
    execStart: Function;
    execStop: Function;
    startLog: Function;
    stopLog: Function;

    chartDataVuCount: Ref<any>;
    chartDataAvgQps: Ref<any>;
    chartDataFailNumb: Ref<any>;
    chartDataAvgDurationAll: Ref<any>;

    chartDataCpu: Ref<any>,
    chartDataMemory: Ref<any>,
    chartDataDisk: Ref<any>,
    chartDataNetwork: Ref<any>,

    tableReqResponseTime: Ref<any[]>,
    summaryData: Ref<any>,

    execLogs: Ref<any[]>,
    request: Ref<any>,
}

function useExecution(): Execution {
    const progressStatus = ref('pt_connecting');
    const currRoom = ref('');

    const {
        chartDataVuCount,
        chartDataAvgMapQps, chartDataAvgQps,
        chartDataFailNumb,
        chartDataAvgMapAll, chartDataAvgDurationAll,

        chartDataCpuMap,chartDataCpu,
        chartDataMemoryMap,chartDataMemory,
        chartDataDiskMap, chartDataDisk,
        chartDataNetworkMap, chartDataNetwork,

        tableReqResponseTime,
        summaryData,

        execLogs,
        request,
    } = initChartData()

    const resultCallback = (room, body) => {
        console.log('resultCallback', room, body)
        if (progressStatus.value === 'cancel' || progressStatus.value === 'exception') return;

        if (room !== currRoom.value && body.instructionType !== 'joinExist') {
            return
        }

        const data = body.data ? JSON.parse(JSON.stringify(body.data)) : {};

        if (body.category === MsgCategory.Instruction) {
            console.log('****** exec instruction', body.instructionType)

            if (body.instructionType == MsgInstruction.JoinExist) { // join exist running room in server msg
                if (body.msg)  {
                    progressStatus.value = WsMsgCategory.InProgress
                    currRoom.value = body.msg
                    request.value = body.data

                    execJoin(currRoom.value)
                } else {
                    progressStatus.value = WsMsgCategory.NotStart
                }

            } else if (body.instructionType == MsgInstruction.Start) {
                progressStatus.value = WsMsgCategory.InProgress

                request.value = data
                console.log('joined test', request.value)

            } else if (body.instructionType === MsgInstruction.End || body.instructionType === MsgInstruction.Terminal) {
                progressStatus.value = WsMsgCategory.End

            } else if (body.instructionType === MsgInstruction.Exception) {
                execStop();
                notifyError('执行异常终止，请查看日志排查错误。', body.msg)
            } else if (body.instructionType === MsgInstruction.AlreadyRunning) {
                execStop();
                notifyError(body.msg, '请等待现有测试结束，或通过重启代理强行终止。')
            }

        } else if (body.category === MsgCategory.Result) {
            console.log('****** get exec result', data.log ? 'LOG_DATA' : 'RESULT_DATA')

            if (data.vuCount) {
                genVuCountChart(data.timestamp, data.vuCount, chartDataVuCount.value)
            }

            if (data.reqResponseTime) {
                genAllResponseTimeChart(data.timestamp, data.reqResponseTime, chartDataAvgDurationAll.value, chartDataAvgMapAll.value)
            }

            if (data.reqQps) {
                genAllResponseTimeChart(data.timestamp, data.reqQps, chartDataAvgQps.value, chartDataAvgMapQps.value)
            }
            if (data.summary) {
                summaryData.value = data.summary

                genFailedNumbChart(data.timestamp, data.summary, chartDataFailNumb.value)
            }

            if (data.metrics) {
                console.log("data.metrics", data.metrics)
                genCpuMetricsChart(data.timestamp, data.metrics[0], chartDataCpu.value, chartDataCpuMap.value)

                genMemoryMetricsChart(data.timestamp, data.metrics[0], chartDataMemory.value, chartDataMemoryMap.value)

                genDiskMetricsChart(data.timestamp, data.metrics[0], chartDataDisk.value, chartDataDiskMap.value)

                genNetworkMetricsChart(data.timestamp, data.metrics[0], chartDataNetwork.value, chartDataNetworkMap.value)
            }

            if (data.reqResponseTimeTable) {
                tableReqResponseTime.value = data.reqResponseTimeTable.sort((a, b) => {
                    if (a.recordName >= b.recordName) return 1
                    else return -1
                })
            }
        }
    }
    const logCallback = (room, body) => {
        console.log('logCallback', room, body)

        if (body.data.log) {
            if (execLogs.value.length >= 300) {
                execLogs.value.shift();
            }
            execLogs.value.push(body.data.log)

            scrollTo('performance-log-list')

            return
        }
    }

    const execJoin = async (room) => {
        const url = await getWebSocketApi()
        console.log('execJoin', url)

        PerformanceTestWsClient.sentPerformanceConductorInstruction(url, currRoom.value, JSON.stringify({
            act: 'joinPerformanceTest',
            performanceTestExecReq: {room},
        }), resultCallback)
    }

    const execStart = async data => {
        console.log('execStart')

        resetChartData(chartDataVuCount,
            chartDataAvgMapQps, chartDataAvgQps, chartDataFailNumb,
            chartDataAvgMapAll, chartDataAvgDurationAll,
            tableReqResponseTime, summaryData, execLogs, request,
            chartDataCpu, chartDataMemory, chartDataDisk, chartDataNetwork,
            chartDataCpuMap, chartDataMemoryMap, chartDataDiskMap, chartDataNetworkMap)

        request.value = data
        currRoom.value = data.room
        const url = await getWebSocketApi()

        PerformanceTestWsClient.sentPerformanceConductorInstruction(url, currRoom.value, JSON.stringify({
            act: 'startPerformanceTest',
            performanceTestExecReq: data,
        }), resultCallback)
    }
    const execStop = async () => {
        const url = await getWebSocketApi()
        console.log('execStop', url)

        if (!currRoom.value) return

        PerformanceTestWsClient.sentPerformanceConductorInstruction(url, currRoom.value, JSON.stringify({
            act: 'stopPerformanceTest',
            performanceTestExecReq: {room: currRoom.value},
        }), null)
    }

    const startLog = (runner: any) => {
        console.log('startLog', currRoom.value)
        if (!currRoom.value) return

        if (runner) {
            const url = 'ws://' + runner.webAddress + '/api/v1/ws'

            PerformanceTestWsClient.sentPerformanceRunnerInstruction(url, request.value.room, JSON.stringify({
                act: 'startPerformanceLog',
                performanceLogExecReq: {room: request.value.room},
            }), logCallback)
        }
    }
    const stopLog = (runner) => {
        console.log('stopLog')
        if (!currRoom.value) return

        const url = 'ws://' + runner.webAddress + '/api/v1/ws'

        PerformanceTestWsClient.sentPerformanceRunnerInstruction(url, request.value.room, JSON.stringify({
            act: 'stopPerformanceLog',
            performanceLogExecReq: {room: request.value.room},
        }), null)
    }

    return {
        progressStatus,
        execJoin,
        execStart,
        execStop,
        startLog,
        stopLog,

        chartDataVuCount,
        chartDataAvgQps,
        chartDataFailNumb,
        chartDataAvgDurationAll,

        chartDataCpu,
        chartDataMemory,
        chartDataDisk,
        chartDataNetwork,

        tableReqResponseTime, summaryData,
        execLogs, request,
    } as Execution
}

function initChartData() {
    const chartDataVuCount = ref({} as any)
    resetChartDataVuCount(chartDataVuCount)

    const chartDataAvgMapQps = ref({} as any)
    const chartDataAvgQps = ref({} as any)
    resetChartDataAvgQps(chartDataAvgQps)

    const chartDataFailNumb = ref({} as any)
    resetChartDataFailNumb(chartDataFailNumb)

    const chartDataAvgMapAll = ref({})
    const chartDataAvgDurationAll = ref({} as any)
    resetChartDataAvgDurationAll(chartDataAvgDurationAll)

    const chartDataCpuMap = ref({})
    const chartDataCpu = ref({} as any)
    resetChartDataCpu(chartDataCpu)

    const chartDataMemoryMap = ref({})
    const chartDataMemory = ref({} as any)
    resetChartDataMemory(chartDataMemory)

    const chartDataDiskMap = ref({})
    const chartDataDisk = ref({} as any)
    resetChartDataDisk(chartDataDisk)

    const chartDataNetworkMap: Ref<any> = ref({})
    const chartDataNetwork: Ref<any> = ref({} as any)
    resetChartDataNetwork(chartDataNetwork)

    const tableReqResponseTime: Ref<any[]> = ref([])
    const summaryData: Ref<any> = ref({})
    const execLogs: Ref<any[]> = ref([] )
    const request: Ref<any> = ref({})

    return {
        chartDataVuCount,
        chartDataAvgMapQps, chartDataAvgQps,
        chartDataFailNumb,
        chartDataAvgMapAll, chartDataAvgDurationAll,
        chartDataCpuMap, chartDataCpu,
        chartDataMemoryMap, chartDataMemory,
        chartDataDiskMap, chartDataDisk,
        chartDataNetworkMap, chartDataNetwork,
        tableReqResponseTime, summaryData,
        execLogs, request,
    }
}

function resetChartData(chartDataVuCount,
                        chartDataAvgMapQps, chartDataAvgQps,
                        chartDataFailNumb,
                        chartDataAvgMapAll, chartDataAvgDurationAll,
                        tableReqResponseTime, summaryData, execLogs, request,
                        chartDataCpu, chartDataMemory, chartDataDisk, chartDataNetwork,
                        chartDataCpuMap, chartDataMemoryMap, chartDataDiskMap, chartDataNetworkMap) {

    resetChartDataVuCount(chartDataVuCount)

    chartDataAvgMapQps.value = {}
    resetChartDataAvgQps(chartDataAvgQps)

    resetChartDataFailNumb(chartDataFailNumb)

    chartDataAvgMapAll.value = {}
    resetChartDataAvgDurationAll(chartDataAvgDurationAll)

    tableReqResponseTime.value = []
    summaryData.value = {}

    execLogs.value = []

    chartDataCpuMap.value = {}
    resetChartDataCpu(chartDataCpu)

    chartDataMemoryMap.value = {}
    resetChartDataMemory(chartDataMemory)

    chartDataDiskMap.value = {}
    resetChartDataDisk(chartDataDisk)

    chartDataNetworkMap.value = {}
    resetChartDataNetwork(chartDataNetwork)

    tableReqResponseTime.value = []
    summaryData.value = {}
    execLogs.value = []
    request.value =  {}
}


function resetChartDataVuCount(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '虚拟用户数'
    refObj.value.yAxis.name = ''
    refObj.value.series[0].name = ''
    refObj.value.grid.right = '16px'
}

function resetChartDataAvgQps(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '每秒查询率QPS'
    refObj.value.yAxis.name = ''
}

function resetChartDataFailNumb(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '失败请求数'
    refObj.value.yAxis.name = ''
    refObj.value.series.push(cloneDeep(refObj.value.series[0]))
    refObj.value.series[0].name = ' 总数'
    refObj.value.series[1].name = '失败数'
}

function resetChartDataAvgDurationAll(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '平均响应时间'
    refObj.value.yAxis.name = '毫秒'
}

function resetChartDataCpu(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = 'CPU占用'
    refObj.value.yAxis.name = '%'
}

function resetChartDataMemory(refObj){
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '内存占用'
    refObj.value.yAxis.name = '%'
}

function resetChartDataDisk(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '磁盘IO'
    refObj.value.yAxis.name = 'MByte'
}

function resetChartDataNetwork(refObj) {
    refObj.value = cloneDeep(sampleAvgDuration.value)
    refObj.value.title.text = '网络吞吐量'
    refObj.value.yAxis.name = 'KByte'
}

export default useExecution
