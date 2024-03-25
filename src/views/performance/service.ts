import request from "@/utils/request";
import {QueryParams} from "./data";
import axios, {AxiosInstance, AxiosResponse} from "axios";

const apiPath = 'performanceTestPlans';
const apiPathState = 'performanceState';

// plan list
export async function query(params?: QueryParams): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: 'get',
        params,
    });
}
export async function get(id: number): Promise<any> {
    return request({url: `/${apiPath}/${id}`});
}
export async function save(data: any): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: data.id? 'PUT': 'POST',
        data: data,
    });
}
export async function remove(id: number): Promise<any> {
    return request({
        url: `/${apiPath}/${id}`,
        method: 'delete',
    });
}

// for charts
export const genVuCountChart = (timestamp, count, oldData) => {
    oldData.series[0].data.push([timestamp, count])
}

export const genAllResponseTimeChart = (timestamp, responseTimeData, oldData, indexMap) => {
    const sortArr = responseTimeData.sort((a, b) => {
        if (a.recordName > b.recordName) return 1
        else if (a.recordName < b.recordName) return -1
    });

    for (let i = 0; i < sortArr.length; i++) {
        const item = sortArr[i]

        const key = item.recordName

        if (indexMap[key]) {
            const seriesItem = oldData.series[indexMap[key]]

            if (seriesItem.data.length >= 600) {
                seriesItem.data.shift();
            }
            seriesItem.data.push([timestamp, item.value])

            continue
        }

        const seriesItem = {
            id: item.recordId,
            name: item.recordName,
            type: 'line',
            showSymbol: false,
            data: [] as any[][],
        }

        oldData.series.push(seriesItem)

        indexMap[key] = oldData.series.length - 1
    }
}

export const genFailedNumbChart = (timestamp, summary, chartDataFailNumb) => {
    const total = summary.total ? 0 + summary.total : 0
    chartDataFailNumb.series[0].data.push([timestamp, total])

    const count = (summary.fail ? 0 + summary.fail : 0) + (summary.error ? 0 + summary.error : 0)
    chartDataFailNumb.series[1].data.push([timestamp, count])
}

export const genCpuMetricsChart = (timestamp, metrics, chartDataCpu, indexMap) => {
    const usage = metrics.cpuUsage
    if (!usage) {
        return
    }

    const serialsName = metrics.runnerName

    if (indexMap[serialsName]) {
        const seriesItem = chartDataCpu.series[indexMap[serialsName]]

        if (seriesItem.data.length >= 600) {
            seriesItem.data.shift();
        }
        seriesItem.data.push([timestamp, usage])

    } else {
        const seriesItem = {
            name: serialsName,
            type: 'line',
            showSymbol: false,
            data: [] as any[][],
        }
        seriesItem.data.push([timestamp, usage])

        chartDataCpu.series.push(seriesItem)

        indexMap[serialsName] = chartDataCpu.series.length - 1
    }
}

export const genMemoryMetricsChart = (timestamp, metrics, chartDataMemory, indexMap) => {
    const usage = metrics.memoryUsage
    if (!usage) {
        return
    }

    const serialsName = metrics.runnerName

    if (indexMap[serialsName]) {
        const seriesItem = chartDataMemory.series[indexMap[serialsName]]

        if (seriesItem.data.length >= 600) {
            seriesItem.data.shift();
        }
        seriesItem.data.push([timestamp, usage])

    } else {
        const seriesItem = {
            name: serialsName,
            type: 'line',
            showSymbol: false,
            data: [] as any[][],
        }
        seriesItem.data.push([timestamp, usage])

        chartDataMemory.series.push(seriesItem)

        indexMap[serialsName] = chartDataMemory.series.length - 1
    }
}

export const genDiskMetricsChart = (timestamp, metrics, chartData, indexMap) => {
    if (!metrics.diskUsages) {
        return
    }

    Object.keys(metrics.diskUsages).forEach(key => {
        const serialsName = metrics.runnerName + "_" + key

        const bytes = metrics.diskUsages[key]

        if (indexMap[serialsName]) {
            const seriesItem = chartData.series[indexMap[serialsName]]

            if (seriesItem.data.length >= 600) {
                seriesItem.data.shift();
            }
            seriesItem.data.push([timestamp, bytes])

        } else {
            const seriesItem = {
                name: serialsName,
                type: 'line',
                showSymbol: false,
                data: [] as any[][],
            }
            seriesItem.data.push([timestamp, bytes])

            chartData.series.push(seriesItem)

            indexMap[serialsName] = chartData.series.length - 1
        }
    })
}

export const genNetworkMetricsChart = (timestamp, metrics, chartData, indexMap) => {
    if (!metrics.networkUsages) {
        return
    }

    Object.keys(metrics.networkUsages).forEach(key => {
        const serialsName = metrics.runnerName + "_" + key

        const bytes = metrics.networkUsages[key]

        if (indexMap[serialsName]) {
            const seriesItem = chartData.series[indexMap[serialsName]]

            if (seriesItem.data.length >= 600) {
                seriesItem.data.shift();
            }
            seriesItem.data.push([timestamp, bytes])

        } else {
            const seriesItem = {
                name: serialsName,
                type: 'line',
                showSymbol: false,
                data: [] as any[][],
            }
            seriesItem.data.push([timestamp, bytes])

            chartData.series.push(seriesItem)

            indexMap[serialsName] = chartData.series.length - 1
        }
    })
}

// agent web api - performance
function createAgentRequest(agentWebAddress: string) :AxiosInstance  {
    const baseURL = `http://${agentWebAddress}/api/v1/`

    const request = axios.create({
        baseURL
    });

    return request
}
export async function getPerformanceState(agentWebAddress: string): Promise<any> {
    const request = createAgentRequest(agentWebAddress);

    const path = '/performance/getState'

    return request({url: path})
        .then((response: AxiosResponse) => response.data)
        .catch(err => {console.log('')});
}