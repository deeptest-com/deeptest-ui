import {defineComponent, ref, watch,} from 'vue';
import './LogTreeView.less';
import ScenarioHeader from "./ScenarioHeader.vue";

import InterfaceHeader from "./InterfaceHeader.vue";
import ProcessorHeader from "./ProcessorHeader.vue";
import InterfaceContent from "./InterfaceContent.vue";
import LogContent from "./LogContent.vue";
import {
    scenarioTypeMapToText,
    showArrowScenarioType,
    DESIGN_TYPE_ICON_MAP,
} from "@/views/scenario/components/Design/config";

export default defineComponent({
    name: 'LogTreeView',
    props: {
        treeData: Array,
        isSingleScenario: Boolean,
    },
    emits: ['change'],
    setup(props, {emit}) {
        const activeKeyMap = ref({});

        function change(uid, keys) {
            activeKeyMap.value[uid] = keys;
        }

        /**
         * 点击更多
         * */
        function handleMore() {
            console.log('more')
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
                // 接口场景
                if (log.processorCategory === 'processor_interface') {
                    return <InterfaceHeader endpointData={log}/>
                }
                // 迭代场景
                return <ProcessorHeader record={log} onMore={handleMore}/>

                // return <a-tooltip title={`${log.name}：${log.summary}`}>
                //     <div class={'header-text'}><span class={'label'}>{log.name}</span>：<span
                //         class={'value'}>{log.summary}</span></div>
                // </a-tooltip>
            }

            function renderContent(log) {
                // 场景中的叶子节点不再渲染
                if (!showArrowScenarioType.includes(log.processorType)) {
                    return null;
                }
                if (log.processorCategory === 'processor_interface') {
                    return <InterfaceContent endpointData={log}/>
                }
                return null;
                // return <LogContent data={log}/>;
            }

            // 渲染场景的标题，主要针对迭代场景，需要标识当前迭代的序号
            function renderCollapseTitle(log, logIndex, srcLog) {
                const detail = JSON.parse(srcLog.detail || {});
                const variableName = detail?.variableName;

                // 迭代直到  + 迭代次数 展示文案为 第X轮
                if (srcLog.processorType === 'processor_loop_time' || srcLog.processorType === 'processor_loop_until') {
                    return <span class={'collapse-title'}>{`第 ${logIndex + 1} 次`}</span>
                }
                // 迭代列表
                else if (srcLog.processorType === 'processor_loop_list') {
                    return <span class={'collapse-title'}>{`${variableName} = ${logIndex + 1}`}</span>
                    //  循环区间
                }
                else if (srcLog.processorType === 'processor_loop_in') {
                    return <span class={'collapse-title'}>{`${variableName} = ${logIndex + 1}`}</span>
                }
                else if (srcLog.processorType === 'processor_loop_range') {
                    return <span class={'collapse-title'}>{`${variableName} = ${logIndex + 1}`}</span>
                    // 数据迭代
                } else if (srcLog.processorType === 'processor_loop_data') {
                    return <span class={'collapse-title'}>{`${variableName} = ${logIndex + 1}`}</span>
                }
                return null;
            }

            const renderLogs = (log) => {
                if (!log?.id) {
                    return;
                }
                return <a-collapse-panel header={renderHeader(log)}
                                         showArrow={showArrowScenarioType.includes(log.processorType)}>
                    {renderContent(log)}
                    {
                        log?.logs?.map((item, itemIndex, srcLog) => {
                            return <div
                                class={item.processorType === 'processor_logic_else' ? 'log-item-else' : 'log-item'}>
                                {renderCollapseTitle(item, itemIndex, log)}
                                <a-collapse>
                                    {renderLogs(item)}
                                </a-collapse>
                            </div>
                        })
                    }
                </a-collapse-panel>;
            };
            return logs.map((log) => {
                return <div class={log.processorType === 'processor_logic_else' ? 'log-item-else' : 'log-item'}>
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

            // 如果是单场景，直接渲染场景
            if (list.length === 1 && props.isSingleScenario) {
                return renderScenario(list[0]?.logs, list[0])
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
                            {renderScenario(item?.logs, item)}
                        </a-collapse-panel>
                    </a-collapse>
                </div>
            })
        }

        return () => (
            <div class={'log-tree-view dp-log-tree-view'}>
                {renderScenarioList(props.treeData)}
            </div>
        )
    }
})
