import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { Report, QueryResult, QueryParams } from './data';
import { query, get, remove, members } from './service';
import { momentUtc } from '@/utils/datetime';
import { formatData } from '@/utils/formatData';
import {ProcessorCategory} from "@/utils/enum";

export interface StateType {
    ReportId: number;

    listResult: QueryResult;
    detailResult: Report;
    queryParams: any;
    members: any;
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setReportId: Mutation<StateType>;
        setMembers: Mutation<StateType>;
        setList: Mutation<StateType>;
        setDetail: Mutation<StateType>;
        setQueryParams: Mutation<StateType>;
    };
    actions: {
        list: Action<StateType, StateType>;
        get: Action<StateType, StateType>;
        remove: Action<StateType, StateType>;
        getMembers: Action<StateType, StateType>;
        initReportDetail: Action<StateType, StateType>;
    };
}
const initState: StateType = {
    ReportId: 0,

    listResult: {
        list: [],
        pagination: {
            total: 0,
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
        },
    },
    detailResult: {} as Report,
    queryParams: {},
    members: [],
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Report',
    state: {
        ...initState
    },
    mutations: {
        setReportId(state, id) {
            state.ReportId = id;
        },

        setList(state, payload) {
            state.listResult = payload;
        },
        setDetail(state, payload) {
            state.detailResult = payload;
        },
        setQueryParams(state, payload) {
            state.queryParams = payload;
        },
        setMembers(state, payload) {
            state.members = payload;
        },
    },
    actions: {
        async list({ commit }, params: any) {
            try {
                const response: ResponseData = await query(params);
                if (response.code != 0) return;
                const { result, page, pageSize, total } = response.data;
                const newResult = result.map((reportItem: any) => {
                    if (reportItem.totalInterfaceNum) {
                        const rate: any = Number(reportItem.passInterfaceNum / reportItem.totalInterfaceNum);
                        reportItem.interfacePassRate = rate.toFixed(2) * 100 + '%';
                    } else {
                        reportItem.interfacePassRate = '0%';
                    }
                    reportItem.serialNumber = reportItem.serialNumber || '-';
                    reportItem.createUserName = reportItem.createUserName || '-';
                    return reportItem;
                })
                commit('setList', {
                    ...initState.listResult,
                    list: newResult || [],
                    pagination: {
                        ...initState.listResult.pagination,
                        current: page,
                        pageSize: pageSize,
                        total: total || 0,
                    },
                });
                commit('setQueryParams', params);

                return true;
            } catch (error) {
                return false;
            }
        },

        async get({ commit }, id: number) {
            if (id === 0) {
                commit('setDetail', {
                    ...initState.detailResult,
                })
                return
            }
            try {
                const response: ResponseData = await get(id);
                const { data } = response;
                let scenarioReports = data.scenarioReports;
                scenarioReports = scenarioReports?.map((scenario: any) => {
                    scenario.requestLogs = (scenario.logs && scenario.logs[0].logs) ? formatData(scenario.logs[0].logs) : [];
                    return scenario;
                })
                commit('setDetail', {
                    ...initState.detailResult,
                    ...data,
                    basicInfoList: [
                        {
                            label: '测试计划',
                            value: data.planName || '-'
                        },
                        {
                            label: '开始时间',
                            value: (data.startTime && momentUtc(data.startTime)) || ''
                        },
                        {
                            label: '执行环境',
                            value:data.execEnv || '--'
                        },
                        {
                            label: '创建人',
                            value: data.createUserName || '--'
                        },
                        {
                            label: '执行人',
                            value: data.execUserName || '--'
                        },
                    ],
                    statisticData: {
                        "duration": data.duration, //执行耗时（单位：s)
                        "totalScenarioNum": data.totalScenarioNum, //场景总数
                        "passScenarioNum": data.passScenarioNum, //通过场景数
                        "failScenarioNum": data.failScenarioNum, //失败场景数
                        "totalInterfaceNum": data.totalInterfaceNum, //接口总数
                        "passInterfaceNum": data.passInterfaceNum,
                        "failInterfaceNum": data.failInterfaceNum,
                        "totalRequestNum": data.totalRequestNum,
                        "passRequestNum": data.passRequestNum,
                        "failRequestNum": data.failRequestNum,
                        "totalAssertionNum": data.totalAssertionNum, //检查点总数
                        "passAssertionNum": data.passAssertionNum, //通过检查点数
                        "failAssertionNum": data.failAssertionNum, //失败检查点数
                    },
                    // scenarioReports
                });
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        },


        async remove({ dispatch, state }, payload: number) {
            try {
                await remove(payload);
                await dispatch('list', state.queryParams)
                return true;
            } catch (error) {
                return false;
            }
        },

        async getMembers({ commit }, payload: number) {
            try {
                const response: ResponseData = await members(payload);
                const { data, code } = response;
                if (code !== 0) return;
                const memberList = data.result.map((member: any) => {
                    member.label = member.name;
                    member.value = member.id;
                    return member;
                })
                commit('setMembers', memberList);
                return true;
            } catch (error) {
                return false;
            }
        },

        async initReportDetail({ commit }) {
            commit('setDetail', { basicInfoList: [], statisticData: {}, scenarioReports: [] });
        },
    }
};

export default StoreModel;
