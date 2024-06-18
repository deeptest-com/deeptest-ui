import { computed, defineComponent, inject, provide, reactive, ref } from "vue";
import { DropdownActionMenu } from "../DropDownMenu";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { useStore } from "vuex";
import cloneDeep from "lodash/cloneDeep";

const MagicIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" version="1.1" p-id="9706" width="14" height="14"><path d="M640 53.333333a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0V85.333333a32 32 0 0 1 32-32zM406.186667 150.186667a32 32 0 0 1 45.226666 0l90.538667 90.496a32 32 0 1 1-45.226667 45.226666L406.186667 195.498667a32 32 0 0 1 0-45.269334z m467.626666 0a32 32 0 0 1 0 45.226666L783.36 285.994667a32 32 0 0 1-45.226667-45.226667l90.453334-90.538667a32 32 0 0 1 45.269333 0zM309.333333 384A32 32 0 0 1 341.333333 352h128a32 32 0 0 1 0 64H341.333333A32 32 0 0 1 309.333333 384z m469.333334 0a32 32 0 0 1 32-32h128a32 32 0 0 1 0 64h-128a32 32 0 0 1-32-32z m-236.714667 98.048a32 32 0 0 1 0 45.226667L451.413333 617.813333a32 32 0 1 1-45.269333-45.226666l90.496-90.538667a32 32 0 0 1 45.226667 0z m196.096 0a32 32 0 0 1 45.226667 0l90.538666 90.496a32 32 0 0 1-45.226666 45.269333l-90.538667-90.496a32 32 0 0 1 0-45.226666zM640 522.666667a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0v-128a32 32 0 0 1 32-32z" fill="#1C1B1F" p-id="9707"/><path d="M653.781333 370.218667a32 32 0 0 1 0 45.226666L140.928 928.341333a32 32 0 1 1-45.269333-45.226666l512.853333-512.896a32 32 0 0 1 45.269333 0z" fill="#1C1B1F" p-id="9708"/></svg>
  );
};

const DynamicParamsV = defineComponent({
  name: 'DynamicParamsV',
  props: {
    index: {
      type: Number
    },
    variables: {
      type: Array
    }
  },
  setup(props) {
    const setInputValue = inject('setInputValue')as any;
    const store = useStore();
    const handleOpenChange = async (keys) => {
      if (!keys[0]) {
        return;
      }
      const dispatchActionMap = {
        'mock': 'Debug/getListMock',
        'sysFn':'Debug/getListSysFn'
      }
      
      let res = props.variables
      if (keys[0] != 'variable') {
        const dispatchAction = dispatchActionMap[keys[0]];
        if (!dispatchAction) {
          return;
        }
        const children = dropdownList.value.filter(e => e.key === keys[0])?.[0]?.children || [];
        if (!children.find(e => e.key === 'loading')) {
          return;
        }
         res = await store.dispatch(dispatchAction);
      }

      const transverse = (array) => {
        return cloneDeep(array).map(item => {
          if (!item.children) {
            item.action = () => {
              setInputValue?.(props.index, item.value);
            }
          } else {
            item.children = transverse(item.children);
          }
          return item;
        });
      };
      store.commit('Debug/setMagicList', {
        type: keys[0],
        data: transverse(res)
      })
    }

    const vSlots = {
      default() {
        return <MagicIcon />;
      },
    };

    const dropdownList = computed(() => {
      const lastList = cloneDeep(store.state.Debug.magicList);
      return lastList.map(e => {
        if (e.children.length === 0) {
          e.children = [{
            label: () => {
              return <span>
                <LoadingOutlined />
              </span>
            },
            key: 'loading',
          }];
        }
        return e;
      });
    })

    provide('handleOpenChange', handleOpenChange);

    return () => {
      return (
        <div>
          <DropdownActionMenu record={{}} dropdownList={dropdownList.value} v-slots={vSlots} />
        </div>
      )
    }
  }
});

export default DynamicParamsV;