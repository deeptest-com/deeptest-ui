<!-- 自定义文本超出显示省略号，悬浮显示tooltip -->
<script lang="tsx">
/**
 * props: { text, width }
 * 超出 指定width的将会展示tooltip
 * 
 * 传入 slot时 需要 传入tip保证可以显示tooltip
 */
import { defineComponent, getCurrentInstance, nextTick, onMounted, ref, watch } from "vue";

export default defineComponent({
  props: {
    text: {
      default: "",
      required: false,
    },
    width: {
      default: 0,
      required: false,
    },
    maxWidth: {
      default: 0,
      required: false,
    },
    tip: {
      default: "",
      required: false,
    },
    customClass: {
      default: "",
      required: false,
      type: String,
    }
  },
  emits: ['edit'],
  setup(props, { slots, emit }) {
    const showTooltip = ref(false);
    const textRef = ref();
    const { proxy } :any= getCurrentInstance();
    const setTooltip = () => {
      nextTick(() => {
        const outElWidth = proxy.$el && proxy.$el.offsetWidth;
        const textElWidth = textRef.value && textRef.value.offsetWidth;

        if (outElWidth < textElWidth) {
          showTooltip.value = true;
        } else {
          showTooltip.value = false;
        }
      });
    };

    const handleClick = () => {
      console.log('edit');
      emit('edit');
    };

    onMounted(() => {
      setTooltip();
    })

    watch(() => props.text, () => {
      setTooltip();
    })

    return {
      textRef,
      showTooltip,
      setTooltip,
      handleClick,
      // slots,
    };
  },
  render() {
    return (
      <div style={{ width: this.width ? `${this.width}px` : 'max-content', maxWidth: (this.maxWidth || this.width) ?`${this.maxWidth || this.width}px` : '100%' ,cursor: this.showTooltip ? 'pointer' : 'unset' }}>
        <a-tooltip placement="top" arrowPointAtCenter={true} title={this.showTooltip ? this.tip || this.text : null}>
          <div class={['out', this.customClass]} onClick={() => this.handleClick()}>
            <span ref="textRef" class="text">
              {this.text}
              {/* 支持 插入自定义标签 */}
              {this.$slots.default && this.$slots.default()}
            </span>
          </div>
        </a-tooltip>
      </div>
    );
  },
});
</script>
<style scoped lang="less">
.out {
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 100%;

  &.processor_logic_if {
    color: #52c41a;
  }

  &.processor_logic_else {
    color: #f5222d;
  }

  &.disabled {
    color: rgba(0, 0, 0, 0.25) !important;
  }
}
</style>
