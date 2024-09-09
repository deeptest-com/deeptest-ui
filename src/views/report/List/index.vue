<template>
    <a-table
        :rowKey="(_record, index) => index"
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{
            ...pagination,
            onChange: (page) => {
                handleGetList({ page });
            },
            onShowSizeChange: (_, size) => {
                handleGetList({ pageSize: size, page: 1 });
            },
            showTotal: (total) => {
                return `共 ${total} 条数据`;
            },
        }"
        :scroll="{ x: 1240, y }"
        class="dp-table">
        <template #serialNumber="{ record }">
            <span>{{ record.serialNumber }}</span>
        </template>
        <template #interfacePassRate="{ record }">
            <span>{{ record.interfacePassRate }}</span>
        </template>
        <template #createUserName="{ record }">
            <span>{{ record.createUserName }}</span>
        </template>
        <template #execPlan="{ record, column }">
            <ToolTipCell style="color: #447DFD;cursor: pointer;" :width="column.width"  @click="handleQueryDetail(record)" :text="record.name" />
        </template>
        <template #duration="{ record }">
            <span v-html="formatWithSeconds(record.duration)"></span>
        </template>
        <template #executionTime="{ record, column }">
            <ToolTipCell :width="column.width" :text="momentUtc(record.startTime)" />
        </template>

        <template #action="{ record }">
            <DropdownActionMenu :dropdown-list="dropdownMenuList" :record="record" />
        </template>
    </a-table>
</template>
<script setup lang="ts">
import {computed, ref, defineEmits, defineProps, createVNode} from "vue";
import { useStore } from "vuex";
import { ColumnProps } from 'ant-design-vue/es/table/interface';
import { Modal } from "ant-design-vue";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import { StateType as ProjectStateType } from "@/store/project";
import { StateType } from "../store";
import { PaginationConfig } from "../data";
import { momentUtc, formatWithSeconds } from "@/utils/datetime";
import ToolTipCell from '@/components/Table/tooltipCell.vue';
import { DropdownActionMenu } from "@/components/DropDownMenu";
import {notifyError, notifySuccess} from "@/utils/notify";
import useSharePage from "@/hooks/share";
import usePermission from "@/composables/usePermission";
import { useWujie } from "@/composables/useWujie";


defineProps({
    loading: {
        required: false,
        default: false,
        type: Boolean
    },
    list: {
        required: true,
        default: [],
    }
})
const emits = defineEmits(['queryDetail', 'getList']);
const { share }  = useSharePage();
const { isCreator, hasPermission } = usePermission();
const { isInThirdpartyWujieContainer } = useWujie();
const store = useStore<{ Report: StateType, ProjectGlobal: ProjectStateType }>();
// 分页数据
const pagination = computed<PaginationConfig>(() => store.state.Report.listResult.pagination);
// 表格选中项
const selectedRowKeys = ref<Key[]>([]);
const y = computed(() => {
    if (isInThirdpartyWujieContainer) {
        return window.parent.window.innerHeight - 240;
    }
    return window.innerHeight - 280;
});

type Key = ColumnProps['key'];


const columns = [
    {
        title: '编号',
        dataIndex: 'serialNumber',
        slots: { customRender: 'serialNumber' },
        width: 120
    },
    {
        title: '测试计划',
        dataIndex: 'execPlan',
        width: 300,
        slots: { customRender: 'execPlan' },
    },
    {
        title: '测试通过率',
        dataIndex: 'interfacePassRate',
        width: 110,
    },
    {
        title: '执行人',
        dataIndex: 'createUserName',
        width: 110,
    },
    {
        title: '执行耗时',
        width: 120,
        dataIndex: 'duration',
        slots: { customRender: 'duration' },
    },
    {
        title: '执行时间',
        dataIndex: 'executionTime',
        width: 180,
        slots: { customRender: 'executionTime' },
    },
    {
        title: '操作',
        key: 'action',
        width: 80,
        fixed: 'right',
        slots: { customRender: 'action' },
    },
];

const dropdownMenuList = [
    // {
    //     label: '导出',
    //     action: (record) => exec(record),
    //     auth: '',
    // },
    {
        label: '分享链接',
        action: (record) => share(record, 'TR'),
        auth: '',
    },
    {
        label: '查看报告',
        action: (record) => handleQueryDetail(record),
        auth: '',
    },
    {
        label: '删除',
        action: (record) => handleDelete(record.id),
        show: record => hasPermission('p-api-tr-del') || isCreator(record.createUserId),
        auth: 'p-api-tr-del',
    },
];

const handleDelete = async (id: number) => {
  Modal.confirm({
    title: () => '确定删除该报告吗？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: () => '确定',
    okType: 'danger',
    cancelText: () => '取消',
    onOk: async () => {
      const res = await store.dispatch('Report/remove', id);
      if (res) {
        notifySuccess('删除成功');
      } else {
        notifyError('删除失败');
      }
    },
  });
}

const handleQueryDetail = (record: any) => {
    emits('queryDetail', record);
}

const handleGetList = (params: any) => {
    emits('getList', params);
}

</script>
<style scoped lang="less">

.report-planname {
    cursor: pointer;
    color: #447DFD;
}
</style>
