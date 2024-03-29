import { createVNode, ref } from "vue";
import { Modal } from "ant-design-vue";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import store from '@/config/store';
import IconSvg from "@/components/IconSvg";

import TooltipCell from "@/components/Table/tooltipCell.vue";
import { momentUtc } from "@/utils/datetime";

const handleChange = async (record, e) => {
  record.disabled = !e;
  const result = await store.dispatch('Endpoint/disabledMockExpect', {
    id: record.id,
    disabled: !e,
  })
  if (result) {
    record.disabled = !e;
  }
};

const handleClone = async (record) => {
  await store.commit('Global/setSpinning', true);
  await store.dispatch('Endpoint/cloneMockExpect', {
    id: record.id,
  })
  await store.commit('Global/setSpinning', false);
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认要删除该Mock用例吗',
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确定',
    cancelText: '取消',
    async onOk() {
      await store.commit('Global/setSpinning', true);
      await store.dispatch('Endpoint/deleteMockExpect', {
        id: record.id,
      })
      await store.commit('Global/setSpinning', false);
    },
  });
};

export const exceptColumns = [
  {
    title() {
      return (
        <div class="except-title">
          期望名称
        </div>
      )
    },
    dataIndex: 'name',
    key: 'name',
    width: 200,
    slots: { customRender: 'mockName' },
  },
  {
    title: '启用',
    dataIndex: 'disabled',
    key: 'disabled',
    customRender({ record }) {
      return (
        <a-switch checked={!record.disabled} onChange={(e) => handleChange(record, e)} />
      )
    },
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    key: 'createUser',
    customRender({ record }) {
      const state: any = store.state;
      const project: any = state.Project || {};
      const result = (project?.userList || []).find(arrItem => arrItem.value == record.createUser);
      return <span>{ result?.name || '--' }</span>
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    customRender({ record }) {
      return (
        <TooltipCell tip={momentUtc(record.createdAt)} text={momentUtc(record.createdAt)} width={180} />
      )
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    customRender({ record }) {
      return (
        <TooltipCell tip={momentUtc(record.updatedAt)} text={momentUtc(record.updatedAt)} width={180} />
      )
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 80,
    customRender({ record }) {
      return (
        <div class="except-action">
          <a-tooltip placement="top" title="克隆">
            <span class="except-action-item" onClick={() => handleClone(record)}>
              <IconSvg type="clone" />
            </span>
          </a-tooltip>
          <a-tooltip placement="top" title="删除">
            <span class="except-action-item" onClick={() => handleDelete(record)}>
              <DeleteOutlined />
            </span>
          </a-tooltip>
        </div>
      )
    }
  },
];

export const requestTabs = [{
  title: '查询参数',
  type: 'requestQueryParams',
}, {
  title: '路径参数',
  type: 'requestPathParams',
}, {
  title: '请求体',
  type: 'requestBodies',
}, {
  title: '请求头',
  type: 'requestHeaders',
}];