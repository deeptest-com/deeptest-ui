<template>
  <div class="scenario-basicinfo">
    <div class="scenario-name">{{ record.name }}</div>
    <template v-if="record.showMoreInfo !== false">
      <div class="scenario-priority">{{ record.priority}}</div>
      <div :class="['scenario-status', status]">{{ statusMap.get(status) }}
      </div>
      <div class="scenario-rate">
        <div class="scenario-rate-progress">
          <a-progress :percent="progressInfo.progressValue" :status="progressInfo.status" :show-info="false"/>
        </div>
        <div class="scenario-rate-info">通过率 {{ `${progressInfo.progressValue}%` }}</div>
        <template v-if="showBugAction && isInLeyanWujieContainer">
          <a-tooltip :title="getTitle">
            <div :class="{'scenario-report-bug': true, 'disabled': userSpaces.length === 0 || execStatus !== 'end'}" @click="handleAubmitToBug">
              <BugIcon />
            </div>
          </a-tooltip>
        </template>
      </div>
     
    </template>
  </div>
</template>
<script lang="tsx" setup>
import {defineProps, computed, inject, h, ref} from 'vue';
import { useStore } from 'vuex';
import { BugIcon } from './constant';
import { useWujie } from '@/composables/useWujie';
import settings from '@/config/settings';
import { Modal, Select } from 'ant-design-vue';
import { referBug } from '@/views/report/service';

const store = useStore<{ Global, ProjectGlobal }>();
const currProject = computed(() => {
  return store.state.ProjectGlobal.currProject;
})
const { parentOrigin } = useWujie();
const props = defineProps(['record', 'showScenarioInfo', 'expandActive']);
const statusMap = new Map([['pass', '通过'], ['fail', '失败'],['exception','失败'], ['in-progress', '进行中']]);
const { isInLeyanWujieContainer } = useWujie();
const showBugAction = inject('showBugAction', false);
const detailLink = inject('detailLink') as any;
const execStatus = inject('execStatus') as any;
const logInfo = computed(() => {
  return props.record?.logs?.[0] || {};
})
const userSpaces = computed(() => {
  return store.state.Global.lyUserSpaces;
});
const bus = window?.$wujie?.bus;

const status = computed(() => {
  return props.record?.resultStatus || 'in-progress'
})

const bugInfo = ref({
  bugId: props.record?.bugId || '',
  bugType: 2,
});

const progressInfo = computed(() => {
  const { resultStatus = ''} = props.record || {};
  return {
    status: resultStatus === 'fail' ? 'exception' : resultStatus === 'pass' ? 'success' : 'active',
    progressValue: resultStatus === 'fail' ? 50 : resultStatus === 'pass' ? 100 : 20,
  }
})

const handleEditProject = () => {
  window.open(`${parentOrigin}/lyapi?code=${currProject.value?.shortName}`)
};

const getTitle = computed(() => {
  if (execStatus.value !== 'end') {
    return '执行未完成，不可提交';
  }
  if (userSpaces.value.length === 0) {
    return () => {
      return <>无法提交问题，请先到<span onClick={() => handleEditProject()} style={{ cursor: 'pointer', color: '#1677ff' }}>API项目列表页</span>编辑项目，关联承接的研发空间</>
    }
  }
  if (bugInfo.value.bugId) {
    return '已提交bug，点击查看详情';
  }
  return '未提交bug，点击创建并关联';
})

const referBugCallback = async (info) => {
  if (info.status !== 'success') {
    store.commit('Global/setSpinning', false);
  } else {
    // 成功
    try {
      await referBug({
        bugId: info.workitemKey,
        bugType: info.workitemTypeCategory,
        reportId: props.record?.reportId,
        severity: info.severity,
      })
      bugInfo.value.bugId = info.workitemKey;
      bugInfo.value.bugType = info.workitemTypeCategory;
      store.commit('Global/setSpinning', false);
    } catch(err) {
      store.commit('Global/setSpinning', false);
    }
  }
}

const submitToLy = (space: any) => {
  store.commit('Global/setSpinning', true);
  bus?.$emit(settings.sendMsgToLeyan, {
    type: 'openCreateBugWorkitem',
    data: {
      reportInfo: {
        link: detailLink.value,
        space,
        callback: referBugCallback,
      },
    }
  })
}

const handleAubmitToBug = (evt) => {
  evt.stopPropagation();

  // 已关联了
  if (bugInfo.value.bugId) {
    bus?.$emit(settings.sendMsgToLeyan, {
      type: 'openBugWorkitemLink',
      data: {
        workitem: {
          workitemKey: bugInfo.value.bugId,
          workitemTypeCategory: bugInfo.value.bugType,
        }
      }
    })
    return;
  }
  // 未关联
  const spacesLength = userSpaces.value.length;
  /** 判断当前空间关联多少ly研发空间 */
  // 只关联一个
  // 关联多个，显示选择研发空间的弹窗
  // 未关联 禁用
  if (spacesLength === 0 || execStatus.value !== 'end') return;
  if (spacesLength === 1) {
    // 直接打开创建弹窗
    submitToLy(userSpaces.value[0].nameEngAbbr);
    return;
  }
  const selectedSpaceKey = ref(userSpaces.value[0].nameEngAbbr);
  // 打开选择空间弹窗
  Modal.confirm({
    class: 'submit-bug-modal',
    title: '请选择研发空间',
    content: () => {
      return (
        <div class="submit-bug-modal-content">
          <span style="margin-right:2px;color: red">*</span> 研发空间 :
          <Select 
            value={selectedSpaceKey} 
            options={userSpaces.value.map(e => ({ value: e.nameEngAbbr, label: e.name }))} 
            onChange={(e) => selectedSpaceKey.value = e}/>
        </div>
      )
    },
    onOk() {
      submitToLy(selectedSpaceKey.value);
    }
  })

  
}

</script>

<style scoped lang="less">

.scenario-basicinfo {
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    overflow-wrap: break-word;
  }
}

.scenario-priority {
  font-weight: bold;
}

.scenario-status {
  display: flex;
  align-items: center;

  &:before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #04C495;
    margin-right: 10px;
  }

  &.in-progress {
    &:before {
      background-color: #FFC107;
    }
  }

  &.pass {
    &:before {
      background-color: #04C495;
    }
  }

  &.fail {
    &:before {
      background-color: #FF6963;
    }
  }
  &.exception {
    &:before {
      background-color: #FF6963;
    }
  }
}

.scenario-name {
  width: 333px;
  font-weight: bold;
}

.scenario-rate {
  margin-right: 24px;
  display: flex;
  align-items: center;
  font-family: 'PingFang SC';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  padding: 0;

}

.scenario-action {
  width: 54px;
}

.scenario-rate-progress {
  width: 170px;
}

.scenario-rate-info {
  margin-left: 40px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.scenario-report-bug {
  margin-left: 16px;
  width: 24px;
  height: 24px;
  background-color: #fc5944;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;

  &.disabled {
    background-color: #cdcdcd;
    cursor: not-allowed;
  }
}
</style>

