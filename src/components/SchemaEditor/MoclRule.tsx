import { findParentNodeByX } from "@/utils/dom";
import { useResizeObserver } from "@vueuse/core";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const MockRule = defineComponent({
  name: 'MockRule',
  props: {
    readonly: {
      type: Boolean,
      default: false,
      required: false,
    },
    tree: {
      type: Object,
      default: () => {},
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const value = ref<any>(null);
    const keywords = ref('');
    const mockPopoverRef = ref();
    const typeMap = {
      "number":["integer","number"],
      "integer":["integer"],
      "string":["string"]
    }
    const visible = ref(false);
    const store = useStore<{ Endpoint, ServeGlobal }>();
    const mockExpressions = computed(() => {
      let options = store.state.Endpoint?.mockExpressions || [];
      // 如果有类型，则需要过滤相同类型的数据
      if (props.tree?.type) {
        options = options.filter((item) => {
          return item.type && typeMap[props.tree.type]?.includes(item.type);
        })
      }
      if (keywords.value) {
        options = options.filter((item) => {
          return item.label?.includes(keywords.value) || item.name?.includes(keywords.value);
        });
      }
      return [...options];
    });

    const handleSearch = (val: string) => {
      keywords.value = val;
    };

    const handleChange = (val: string) => {
      value.value = val;
      emit('update', val);
    };

    const mockRuleRef = ref();
    const isSmallMode = ref(false);
    useResizeObserver(mockRuleRef, (entries) => {
      const [entry] = entries;
      const { contentRect: { width } } = entry;
      isSmallMode.value = width < 140;
    })

    watch(() => {
      return props.tree?.['x-mock-type']
    }, val => {
      value.value = val || null;
    }, {
      immediate: true,
    })

    onMounted(() => {
      window.addEventListener('click', (evt) => {
        if (!mockRuleRef.value?.contains(evt?.target)) {
          visible.value = false;
        } 
      })
    })
    
    const vSlots = {
      option({ value, label, name, id }) {
        return (
          <span class="select-item" key={value || id}>
            <span class="left" title={label}>
              { label }
            </span>
            <span class="right" title={name}>
              { name }
            </span>
          </span>
        )
      }
    }

    const renderRuleSelect = () => {
      return (
        <a-select
          value={value}
          show-search
          disabled={props.readonly}
          size="small"
          placeholder="请选择mock规则"
          default-active-first-option={false}
          getPopupContainer={triggerNode => findParentNodeByX(triggerNode.parentNode, { class: 'mock-rule-container' })}
          show-arrow={false}
          allow-clear={true}
          filter-option={false}
          dropdownStyle={{minWidth: '300px'}}
          not-found-content="null"
          options={mockExpressions.value}
          onSearch={(e) => handleSearch(e)}
          onChange={(e) => handleChange(e)}
          v-slots={vSlots}
        />
      )
    }

    const renderPopover = () => {
      return (
        <a-popover
          trigger="click"
          placement="left"
          visible={visible.value}
          title={null}
          getPopupContainer={evt => evt.parentNode} 
          v-slots={{
            default: () => {
              return (
                <a-tooltip title="mock规则" placement="top">
                  <span class="mock-rule-popover-text" style="cursor: pointer" onClick={() => visible.value = true}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1029 1024" version="1.1" p-id="16976" width="14.068359375" height="14"><path d="M990.72 89.6c-5.12 0-10.24 2.56-15.36 5.12l-460.8 204.8-460.8-204.8c-7.68-2.56-12.8-5.12-17.92-5.12C15.36 89.6 0 104.96 0 125.44V870.4c0 20.48 15.36 35.84 35.84 35.84 20.48 0 35.84-15.36 35.84-35.84V176.64l430.08 192c5.12 2.56 7.68 2.56 12.8 2.56s7.68 0 12.8-2.56h2.56L957.44 179.2v691.2c0 20.48 15.36 35.84 35.84 35.84 20.48 0 35.84-15.36 35.84-35.84V125.44c-5.12-20.48-20.48-35.84-38.4-35.84z" fill="#555555" p-id="16977"/><path d="M798.72 624.64c0-20.48-15.36-35.84-35.84-35.84-7.68 0-15.36 2.56-20.48 7.68-61.44 51.2-143.36 84.48-230.4 84.48-87.04 0-166.4-30.72-227.84-81.92-5.12-5.12-12.8-7.68-23.04-7.68-20.48 0-35.84 15.36-35.84 35.84 0 10.24 5.12 17.92 10.24 25.6 74.24 61.44 168.96 99.84 273.92 99.84s199.68-38.4 273.92-99.84c10.24-7.68 15.36-15.36 15.36-28.16z" fill="#555555" p-id="16978"/></svg>
                  </span>
                </a-tooltip>
              );
            },
            content: () => {
              return <div class="mock-rule-popover" style="width: 200px" ref={mockPopoverRef}>{renderRuleSelect()}</div>;
            }
          }} />
      )
    }

    return () => {
      return (
        <div class={["mock-rule-container", isSmallMode.value ? "small-mode": '']} ref={mockRuleRef}>
          {!isSmallMode.value ? renderRuleSelect() : renderPopover()}
        </div>
      )
    }
  }
})

export default MockRule;