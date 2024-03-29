<template>
  <a-popover :title="null"
             trigger="click"
             v-model:visible="visible"
             :destroyTooltipOnHide="true"
             :overlayClassName="'data-type-setting-container'">
    <template #content>
      <div class="data-type-setting-popover-container" v-on-click-outside="clickOutside">
        <div class="content" v-for="(tabs,tabsIndex) in tabsList" :key="tabsIndex" v-show="!(activeTabsIndex > 0 && tabsIndex > 0)">
          <div class="header">
            <div class="item"
                v-for="(tab,tabIndex) in tabs"
                @click="() => {
                  if(isDisabled){
                      return;
                  }
                    selectTab(tabs,tabIndex)
                }"
                :class="tab.active ? 'active' : ''"
                :key="tab.value">
              {{ tabsIndex === 0 ? tab.label : tab.subLabel }}
            </div>
          </div>
          <div class="main">
            <div class="item"
                v-for="(tab,tabIndex) in tabs"
                v-show="tab.active"
                :key="tab.value">
              <a-radio-group
                  :size="'small'"
                  class="select-type-btn"
                  v-if="tab.active"
                  :disabled="isDisabled"
                  v-model:value="tab.value"
                  @change="(event) => changeType(tabsIndex,tab, event)"
                  button-style="solid">
                <a-radio-button
                    v-for="item in tab.props"
                    :key="item.value"
                    :value="item.value">{{ item.label }}
                </a-radio-button>
              </a-radio-group>
              <!-- ::::基本类型设置 -->
              <a-form :layout="'vertical'" v-if="tab.type === 'type' && tab.active">
                <div v-for="(item,itemIndex) in tab.props" :key="itemIndex">
                  <div v-if="item.value === tab.value">
                    <div class="card-title">{{ item.props.label }}</div>
                    <a-row
                        class="card-content"
                        type="flex"
                        justify="space-between"
                        align="top">
                      <a-col class="col" v-for="opt in item.props.options" :span="11" :key="opt.name">
                        <a-form-item
                            class="col-form-item"
                            :labelAlign="'right'"
                            :label="opt.label">
                          <a-select
                              :disabled="isDisabled"
                              v-if="opt.component === 'selectTag'"
                              v-model:value="opt.value"
                              mode="tags"
                              :placeholder="opt.placeholder"
                          />
                          <a-select
                              v-if="opt.component === 'select'"
                              v-model:value="opt.value"
                              :disabled="isDisabled"
                              :options="opt.options"
                              :placeholder="opt.placeholder"
                          />
                          <a-input
                              v-if="opt.component === 'input'"
                              v-model:value="opt.value"
                              :disabled="isDisabled"
                              :placeholder="opt.placeholder"
                          />
                          <a-input-number
                              v-if="opt.component === 'inputNumber'"
                              id="inputNumber"
                              :disabled="isDisabled"
                              :placeholder="opt.placeholder"
                              v-model:value="opt.value"
                          />
                          <a-switch
                              v-if="opt.component === 'switch'"
                              :disabled="isDisabled"
                              v-model:checked="opt.value"/>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </div>
              </a-form>
              <!-- ::::引用类型设置 -->
              <a-form :layout="'vertical'" style="margin-bottom: 16px;" v-if="tab.type === '$ref' && tab.active">
                <a-form-item
                    class="col-form-item"
                    :labelAlign="'right'"
                    :label="'请选择组件'">
                  <a-select
                      :options="refsOptions"
                      :disabled="isDisabled"
                      @change="(e) => {
                        changeRef(tabsIndex,tabIndex,e);
                      }"
                      show-search
                      allowClear
                      @search="searchRefs"
                      :value="tab.value || null"
                      placeholder="Select Components"
                      :getPopupContainer="(triggerNode) => getPopupContainer(triggerNode)"
                      :filter-option="false"
                      style="width: 100%"/>
                </a-form-item>
              </a-form>
              <!-- ::::组合schema -->
              <a-form :layout="'vertical'" style="margin-bottom: 16px;" v-if="tab.type === 'combine' && tab.active">
                <a-form-item
                    class="col-form-item"
                    :labelAlign="'right'"
                    :label="'请选择复合关键字'">
                  <a-select
                      :options="combineSchemaOpts"
                      :disabled="isDisabled"
                      @change="(e) => {
                        changeCombineType(tabsIndex,tabIndex,e);
                      }"
                      show-search
                      allowClear
                      :value="tab.value || null"
                      :getPopupContainer="(triggerNode) => getPopupContainer(triggerNode)"
                      placeholder="Select an option below to combine your schemas"
                      style="width: 100%"/>
                </a-form-item>

                <div style="margin-top: 12px;margin-left: 20px;">
                  <ul>
                    <li><a-typography-text type="secondary"><span class="form-item-info">all of：</span>根据所有子模式验证值</a-typography-text></li>
                    <li><a-typography-text type="secondary"><span class="form-item-info">one of:</span> 根据其中一个子模式验证值</a-typography-text></li>
                    <li><a-typography-text type="secondary"><span class="form-item-info">any of：</span>根据任意（一个或多个）子模式验证值</a-typography-text></li>
                  </ul>
                </div>
              </a-form>
            </div>
          </div>
        </div>
      </div>
    </template>
    <a-button style="color: #1890ff" type="link" >
      {{ typesLabel }}
    </a-button>
  </a-popover>
  <a-tooltip>
    <template #title>
      <span>{{`编辑组件 ${props?.value?.ref}`}}</span>
    </template>
    <span class="viewComponent" style="margin-left:4px" @click="goViewComponent">
      <LinkOutlined v-if="props?.value?.ref"/>
    </span>
  </a-tooltip>
</template>
<script lang="ts" setup>
import {ref, defineProps, defineEmits, watch, computed} from 'vue';
import {
  LinkOutlined
} from '@ant-design/icons-vue';
import {schemaSettingInfo, typeOpts, combineSchemaOpts, combineTypes} from "./config";
import cloneDeep from "lodash/cloneDeep";
import { SelectProps } from 'ant-design-vue/es/select';
import {useStore} from "vuex";
import {StateType as ServeStateType} from "@/store/serve";
import debounce from "lodash.debounce";
import { useRouter } from "vue-router";
import { vOnClickOutside } from '@vueuse/components'
import {useWujie} from "@/composables/useWujie";
import { findParentNodeByX } from '@/utils/dom';
import { notifyError } from '@/utils/notify';

const props = defineProps(['value', 'serveId','isRefChildNode', 'isRoot']);
const emit = defineEmits(['change']);
const store = useStore<{ Endpoint, ServeGlobal: ServeStateType, Schema }>();
const schemaNodeTree = computed<any>(() => {
  return store.state.Schema.schemaTreeData?.children;
});
const activeSchema = computed(() => store.state.Schema.activeSchema);
const tabsList: any = ref([]);
const visible: any = ref(false);
const router = useRouter();

const getPopupContainer = (triggerNode) => {
  return findParentNodeByX(triggerNode.parentNode, { class: 'data-type-setting-popover-container' })
}

const clickOutside = (e) => {
  // console.log(8322,e);
  // debugger;
  visible.value = false;
}
// 当前选中的顶层 tab index
/**
 * 这里备注下：Components 和 Combine Schemas 两种类型，都是通过 tabsList[0] 来控制的，所以这里的 tabsIndex 也是通过 tabsList[0] 来控制的
 * 另外，如果选中了Components 和 Combine Schemas 两种类型，则 TabLists[1,....] 则不需要展示了
 * */
const activeTabsIndex = computed(() => {
  if(!Array.isArray(tabsList.value?.[0])){
    return -1;
  }
  return tabsList.value?.[0]?.findIndex((item: any, index: any) => {
    return item.active;
  });
});
const isDisabled: any = computed(() => {
  return props.isRefChildNode && !props.isRoot;
})

// 返回，如何展示类型
const typesLabel: any = computed(() => {
  let {type, types} = props.value || {};
  type = props?.value?.name || type || '';
  if (!type) {
    return 'null';
  }
  const labels = Array.isArray(types) ? [...types, type] : [type];
  const result = labels.reduceRight((acc, cur, index) => {
    if (index === labels.length - 1) {
      return [cur];
    }
    return [cur, acc];
  }, []);
  return JSON.stringify(result).replace(/[",]/g, '').replace(/^\[/, '').replace(/\]$/, '');
});

function changeType(tabsIndex: any,tab:any, e: any) {
  let type = e.target.value;
  // debugger;
  // 切换类型时，需要清空 format 字段
  const currentTypeObj = tab.props?.find((prop: any) => prop.value === type);
  currentTypeObj?.props?.options?.forEach((opt:any) => {
   if(['format','example','default'].includes(opt.name))
     opt.value = null;
   })

  if (type === 'array') {
    if (tabsList.value.length === tabsIndex + 1) {
      tabsList.value.push(cloneDeep(schemaSettingInfo));
    }
  } else {
    if (tabsIndex < tabsList.value.length) {
      tabsList.value.splice(tabsIndex + 1);
    }
  }
}

// ref 组件
function changeRef(tabsIndex, tabIndex, e) {
  tabsList.value[tabsIndex][tabIndex].value = e;
  // 选中的是ref，则需要隐藏其他的选择
  if (e) {
    tabsList.value.splice(tabsIndex + 1);
  }
  }

// ref 组件
function changeCombineType(tabsIndex, tabIndex, e) {
  tabsList.value[tabsIndex][tabIndex].value = e;
}


function selectTab(tabs: any, tabIndex: number) {
  tabs.forEach((tab: any, index: number) => {
    tab.active = tabIndex === index;
  })
  // 切换成普通选择模式时，如果是选中的是数组，则需要添加一个tab
  if (tabIndex === 0 && tabs[tabIndex].value === 'array' && tabsList.value.length === 1) {
    tabsList.value.push(cloneDeep(schemaSettingInfo));
  }
  // console.log('832 tabsList', tabsList.value)
  // 切换到 组件 Tab 或者 组合schema Tab 时，需要清空其他的tab
  // if(tabIndex === 2 || tabIndex === 1){
  //   tabsList.value.splice(1);
  // }
}

/**
 * 初始化tabsList数据
 * */
function initTabsList(types: any, treeInfo: any) {
  let tabsList: any = [];
  types.forEach((type: string) => {
    const defaultTabs: any = cloneDeep(schemaSettingInfo);
    // 基本类型，即第一个tab
    if (typeOpts.includes(type)) {
      defaultTabs[0].active = true;
      defaultTabs[0].value = type;
      const activeTabProps = defaultTabs[0].props.find((prop: any) => prop.value === type);
      activeTabProps?.props?.options?.forEach((opt: any) => {
        opt.value = treeInfo[opt.name] || opt.value;
      })

      defaultTabs[1].active = false;
      defaultTabs[1].value = treeInfo?.ref;

      defaultTabs[2].active = false;
      defaultTabs[2].value = 'allOf';

      //  组合类型,即，第三个tab
    } else if (combineTypes.includes(type)) {
      defaultTabs[0].active = false;
      defaultTabs[0].value = treeInfo?.type || 'string';

      defaultTabs[1].active = false;
      defaultTabs[1].value = treeInfo?.ref;

      defaultTabs[2].active = true;
      defaultTabs[2].value = type;
      //  引用类型，即，选中第二个tab时
    } else {

      defaultTabs[0].active = false;
      defaultTabs[0].value = treeInfo?.type || 'string';

      defaultTabs[1].active = true;
      defaultTabs[1].value = treeInfo?.ref.replace('#/components/schemas/', '');

      defaultTabs[2].active = false;
      defaultTabs[2].value = 'allOf';
    }
    tabsList.push(defaultTabs)
  });
  // 如果是数组，还需加一项，渲染需要
  if (types[types.length - 1] === 'array') {
    const arrayItems: any = cloneDeep(schemaSettingInfo);
    tabsList.push(arrayItems);
  }
  return tabsList;
}

function getValueFromTabsList(tabsList: any) {
  const result: any = [];

  tabsList.forEach((tabs: any) => {
    let activeTab = tabs.find((tab: any) => tab.active);
    // debugger
    // 如果 activeTab.type === '$ref'，则说明是引用类型, 还需要判断是否有值，没有值还是展示基本类型
    if (activeTab.type === '$ref' && !activeTab.value) {
      activeTab = tabs[0];
    }
    let res: any = {};
    if (activeTab.type === '$ref') {
      const selectedRef: any = refsOptions.value.find((ref: any) => ref.id === activeTab.value);
      res = {
        type: selectedRef?.type || '',
        ref: selectedRef?.ref || '',
        name: selectedRef?.name || '',
        content: null,
        refId: selectedRef?.id,
      };
    } else if (activeTab.type === 'combine') {
      res = {
        type: activeTab.value,
      };
      res[activeTab.value] = [];
    } else {
      res = {
        type: activeTab.value
      };
      const activeTabProps = activeTab?.props?.find((prop: any) => prop.value === activeTab.value);
      activeTabProps?.props?.options?.forEach((opt: any) => {
        if(opt.value !== '' && opt.value !== undefined && opt.value !== null){
          res[opt.name] = opt.value;
        }
      })
    }
    result.push(res);
  })
  return result;
}
const refsOptions: any = ref([]);

const searchRefs = debounce(async (keyword) => {
  const { result }: any = await store.dispatch('Endpoint/getAllRefs', {
    name: keyword,
    page: 1,
  });
  refsOptions.value = result || [];
}, 300);

// const {isWujieEnv} = useWujie();
const {projectName,parentOrigin,isWujieEnv,isInLeyanWujieContainer} = useWujie();
// const detailLink = computed(() => {
//   const {params: {projectNameAbbr = ''}} = router.currentRoute.value;
//   // 无界环境，使用父级域名跳转
//   if(isInLeyanWujieContainer){
//     return `${parentOrigin}/dev/${projectName}/API/IM/${endpointDetail.value?.serialNumber}`;
//   }
//   return `${window.location.origin}/${projectNameAbbr}/IM/${endpointDetail.value?.serialNumber}`;
// })

const findNodeByRefId = (entityId: number, schemaNodes: any[]) => {
  for (let i = 0; i < schemaNodes.length; i ++ ) {
    if (schemaNodes[i].entityId === entityId) {
      return schemaNodes[i];
    } else if (Array.isArray(schemaNodes[i].children) && schemaNodes[i].children.length > 0){
      const res = findNodeByRefId(entityId, schemaNodes[i].children);
      if (res) {
        return res;
      }
    }
  }
};

const uniquArrray = (data) => {
  const obj = {};
  const _data = cloneDeep(data);
  _data.forEach((e, index) => {
    if (!obj[e.entityId]) {
      obj[e.entityId] = e;
    } else {
      _data.splice(index, 1)
    }
  })
  return _data;
};

/**
 * 查看组件. 以下处理为临时方案
 * */
function goViewComponent() {
  const { refId } = props.value;
  // 找出schema对应的节点信息
  const schemaNode = findNodeByRefId(refId, schemaNodeTree.value);
  if (!schemaNode) {
    notifyError('引用的数据组件不存在/已删除');
    return;
  }
  if (activeSchema.value.id) {
    // 当前是处于 查看 组件tab中，去查看与该组件关联的组件信息， 无需跳转，新增tab即可
    store.commit('Schema/setActiveSchema', { ...schemaNode, key: refId });
    store.commit('Schema/setSchemas', uniquArrray([...store.state.Schema.schemas, schemaNode]));
    store.dispatch('Schema/querySchema', { id: refId });
  } else {
    // 当前是 查看接口定义详情抽屉或单独详情页. 需单独打开一个页面展示
    const { entityId, id, name }: any = schemaNode || {};
    const prefixUrl = isInLeyanWujieContainer ? `${parentOrigin}/lyapi` : window.location.origin;
    window.open(`${prefixUrl}/${router.currentRoute.value.params.projectNameAbbr}/IM?ref=${JSON.stringify(schemaNode ? { entityId, id, name } : {})}`, '_blank');
  }
  
}

watch(() => {
  return visible.value
}, async (newVal: any) => {

  // 打开时，初始化数据
  if (visible.value) {
    searchRefs('');
  }

  let {type, types} = props.value || {};
  // ref 优先级高于 type，如果是 ref，则优先取 ref值 判断类型
  type = props.value?.ref || type;
  const allTypes = [...(types || []), type];
  // 打开时，初始化数据
  if (newVal && (props.value.type || props.value.ref)) {
    tabsList.value = [...initTabsList(allTypes, props.value)];
  }
  // 关闭了，触发change事件
  else {
    // 仅选择类型改变了才触发change事件
    // 需要兼容 选择ref 的场景
    const value = getValueFromTabsList(tabsList.value);
    // 如果是 ref, 则直接返回, ref的优先级高于 type
    const newTypes = value.map((item: any) => item.ref || item.type);
    emit('change', value);
    // if (JSON.stringify(allTypes) !== JSON.stringify(newTypes)) {
    //   emit('change', value);
    // }
  }
}, {immediate: false})

</script>

<style lang="less" scoped>

.container {
  padding: 0;
}


.content {
  width: 480px;
}

:deep(.ant-input-number) {
  width: 100%
}

:deep(.ant-form-item-label) {
  label {
    font-weight: bold;
  }
}

.card-title {
  font-weight: bold;
  margin: 12px 0 8px 0;
}

.col {
  //margin-bottom: 8px;
}

.col-form-item {
  margin-bottom: 8px;
}

.header {
  border-bottom: 1px solid #f5f5f5;
  display: flex;

  .item {
    margin-right: 16px;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    font-weight: bold;
    &.active {
      color: #1890ff;
    }
  }
}

.main {
  .item {
    margin-bottom: 16px;
    .select-type-btn {
      margin-top: 16px;
    }
  }
}
.form-item-info{
  display: inline-block;
  text-align: left;
  font-weight: bold;
}

.viewComponent{
  margin-left: 4px;
  //color: #1890ff;
  cursor: pointer;
  &:hover{
    color: #40a9ff;
  }
}

</style>

<style lang="less">
.data-type-setting-container {
  .ant-popover-inner {
    max-height: 480px;
    overflow-y: scroll;
    scrollbar-width: none;
  }
}
</style>

