import {ref} from "vue";
import {momentTime} from "@/utils/datetime";

export const sampleAvgDuration = ref( {
    title: {
        text: '平均响应时间',
        left: 'center',
    },
    legend: {
        type: 'scroll',
        orient: 'vertical', // horizontal
        right: 10,
        top: 'center',
        icon: 'pin',
    },
    tooltip: {
        trigger: 'axis',
        formatter: function (params) {
            const sortArr = params.sort((a, b) => {
                if (a.seriesName > b.seriesName) return 1
                else if (a.seriesName < b.seriesName) return -1
            });

            const data = params[0].data;
            const ts = momentTime(data[0])

            let content = '<b>' + ts + '</b><hr />'
            sortArr.forEach(item => {
                content += (item.seriesName ? item.seriesName + ': ' : '') +  item.data[1] + '<br />'
            })

            return content
        },
        axisPointer: {
            animation: false
        }
    },

    grid: {
        top: '36px',
        left: '20px',
        right: '150px',
        bottom: '16px',
        containLabel: true
    },

    xAxis: {
        name: '时间',
        type: 'time',
        // splitNumber: 10,
        // interval: 6,
        min: function (value) {
            return Date.now() - 300 * 1000
        },
        max: function (value) {
            return Date.now()
        },

        splitLine: {
            show: false
        },

        axisLine:{
            lineStyle:{
                color: '#1B2232'
            }
        },
        axisLabel:{
            rotate: -45,
            color:'#1B2232',
            formatter:function(value, index){
                return momentTime(value)
            },
        },
    },
    yAxis: {
        name: '',
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
            show: false
        },
        nameTextStyle:{
            color: '#1B2232',
            fontSize: 15
        },
        axisLine:{
            lineStyle:{
                color: '#1B2232',
            }
        },
        axisLabel:{
            color:'#1B2232',
        },
    },
    series: [
        {
            name: '',
            type: 'line',
            showSymbol: false,
            data: [],
        },
    ]
})

export const tableReqResponseTimeColumns = ref([
    {
        title: '接口名称',
        dataIndex: 'recordName',
        key: 'recordName',
        width: '300px',
    },
    {
        title: '请求次数',
        dataIndex: 'count',
        key: 'count',
        width: '100px',
    },
    {
        title: '平均值（毫秒）',
        dataIndex: 'mean',
        key: 'mean',
        width: '100px',
    },
    {
        title: '最小值',
        dataIndex: 'min',
        key: 'min',
        width: '100px',
    },
    {
        title: '最大值',
        dataIndex: 'max',
        key: 'max',
        width: '100px',
    },
    {
        title: '中位数',
        dataIndex: 'median',
        key: 'median',
        width: '100px',
    },
    {
        title: '95%小于',
        dataIndex: 'quantile95',
        key: 'quantile95',
        width: '100px',
    },
])