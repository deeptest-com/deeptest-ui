import {defineComponent, ref, watch,} from 'vue';
import './LogTreeView.less';
import {DownOutlined, PlusOutlined, RightOutlined,} from '@ant-design/icons-vue';
import Actions from "./Actions.vue";
import ScenarioHeader from "./ScenarioHeader.vue";

import EndpointHeader from "./EndpointHeader.vue";
import EndpointContent from "./EndpointContent.vue";
import LogContent from "./LogContent.vue";

export default defineComponent({
    name: 'LogTreeView',
    props: {
        treeData: Array,
    },
    emits: ['change'],
    setup(props, {emit}) {

        const activeKeyMap = ref({});

        function change(uid, keys) {
            activeKeyMap.value[uid] = keys;
        }

        watch(() => props.treeData, (newVal: any) => {
            if (newVal?.length) {
                newVal.forEach((item) => {
                    activeKeyMap.value[item.id] = [item.id];
                })
            }
        }, {immediate: true})

        /**
         * @desc 渲染场景执行树
         * @param logs 需要渲染的场景类型
         * @param source 源数据
         * */
        function renderScenario(logs: any, source: any) {
            if (!logs) return null;

            function renderHeader(log) {
                if (log.processorCategory === 'processor_interface') {
                    return <EndpointHeader endpointData={log}/>
                }
                return <a-tooltip title={`${log.name}：${log.summary}`}>
                    <div class={'header-text'}><span class={'label'}>{log.name}</span>：<span
                        class={'value'}>{log.summary}</span></div>
                </a-tooltip>

            }

            function renderContent(log) {
                if (log.processorCategory === 'processor_interface') {
                    return <EndpointContent endpointData={log}/>
                }
                return <LogContent data={log}/>;
            }

            const renderLogs = (log) => {
                if (!log?.id) {
                    return;
                }
                return <a-collapse-panel header={renderHeader(log)}>
                    {renderContent(log)}
                    {
                        log?.logs?.map((log) => {
                            return <div class={'log-item'}>
                                <a-collapse>
                                    {renderLogs(log)}
                                </a-collapse>
                            </div>
                        })
                    }
                </a-collapse-panel>;
            };
            return logs.map((log) => {
                return <div class={'log-item'}>
                    <a-collapse>
                        {renderLogs(log)}
                    </a-collapse>
                </div>
            })
        }


        // 渲染场景，一级目录, 即场景列表
        function renderScenarioList(list) {
            if (!list?.length) {
                return null
            }

            const renderHeader = (item) => {
                return <ScenarioHeader record={item}/>
            }

            return list.map((item, index) => {
                const uid = item.id;
                return <div class={'scenario-item'} key={uid}>
                    <a-collapse
                        activeKey={activeKeyMap.value[uid]}
                        onChange={(key) => {
                            change(uid, key)
                        }}>
                        <a-collapse-panel key={uid} header={renderHeader(item)}>
                            {renderScenario(item?.logs?.[0]?.logs, item)}
                        </a-collapse-panel>
                    </a-collapse>
                </div>
            })
        }

        return () => (
            <div class={'log-tree-view'}>
                {renderScenarioList(props.treeData)}
            </div>
        )
    }
})