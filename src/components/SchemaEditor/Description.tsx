import { ReadOutlined } from "@ant-design/icons-vue";
import { toReactive, useResizeObserver } from "@vueuse/core";
import { defineComponent, ref, defineEmits, watch, onMounted } from "vue";
import { vOnClickOutside } from '@vueuse/components';

export const Description = defineComponent({
  name: 'Description',
  props: {
    isRefChildNode: {
      type: Boolean,
      required: false,
    },
    tree: {
      type: Object,
      required: false,
    }
  },
  // directives: {
  //   vOnClickOutside,
  // },
  emits: ['updateDescription'],
  setup(props, { emit }) {
    // const emits = defineEmits(['updateDescription']);
    const value = ref('');
    const showSmallDesc = ref(false);
    const treeDescRef = ref();
    const visible = ref(false);

    watch(() => {
      return props?.tree?.['description'];
    }, val => {
      value.value = val || '';
    }, {
      immediate: true,
    })
    const handleUpdated = (e) => {
      emit('updateDescription', { tree: props.tree, value: e.target.value });
    }

    const renderDesc = (props) => {
      return (
        <a-tooltip placement="top" title={value.value}>
          <div class="tree-schema-description">
              <a-input 
                  value={value.value} 
                  allowClear 
                  disabled={props.isRefChildNode} 
                  placeholder="请输入描述信息" 
                  onChange={e => handleUpdated(e)}/>
          </div>
        </a-tooltip>
      )
      
    }

    useResizeObserver(treeDescRef, entries => {
      const [entry] = entries;
      const { contentRect: { width } } = entry;
      showSmallDesc.value = width < 74;
    })

    onMounted(() => {
      window.addEventListener('click', (evt) => {
        if (!treeDescRef.value?.contains(evt?.target)) {
          visible.value = false;
        } 
      })
    })

    const vSlots = {
      default: () => {
        return (
          <a-tooltip placement="top" title="描述">
            <span onClick={() => visible.value = true}>
              <ReadOutlined />
            </span>
          </a-tooltip>);
      },
      content: () => {
        return <div class="schema-desc-popover">{ renderDesc({}) }</div>;
      }
    }
    return () => {
      return (
        <div class="tree-description-wrapper" ref={treeDescRef}>
          {!showSmallDesc.value ? (
            <>{renderDesc({})}</>
          ) : (
            <>
              <a-popover
                visible={visible.value} 
                placement="left"
                title={null}
                getPopupContainer={evt => evt.parentNode}
                v-slots={vSlots} />
            </>
          )}
        </div>
      )
    }
  }
})