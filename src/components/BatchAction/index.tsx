import { defineComponent, PropType } from "vue";
import './index.less';
import { CloseOutlined } from "@ant-design/icons-vue";

const BatchActionProps = {
  rows: {
    type: Array as PropType<any[]>,
    required: false,
    default: () => [],
  },
  actionList: {
    type: Array as PropType<any[]>,
    required: false,
    default: () => [],
  },
  tips: {
    type: String,
    default: '',
    required: false,
  }
};

const BatchAction = defineComponent({
  props: BatchActionProps,
  setup(props, { emit }) {
    return () => {
      return (
        <div class="batch-action-container">
          <div class="batch-action-title">已经选择{props.rows.length}个接口</div>
          <div class="batch-action-ul">
            {props.actionList.map(e => (
              <div class="batch-action-li" onClick={() => e.action && e.action()}>
                <span class="batch-action-li-icon">{e.icon}</span>
                <span class="batch-action-li-text">{e.label}</span>
              </div>
            ))}
          </div>
          <div class="batch-action-close" onClick={() => emit('cancel')}>
            <CloseOutlined />
          </div>
        </div>
      )
    }
  },
});

export default BatchAction;