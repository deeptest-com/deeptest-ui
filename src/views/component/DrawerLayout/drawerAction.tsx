import { defineComponent, inject } from 'vue';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  SelectOutlined,
} from '@ant-design/icons-vue';
import IconSvg from "@/components/IconSvg";

export const DrawerAction = defineComponent({
  name: 'DrawerAction',
  props: {
    showShare: {
      type: Boolean,
      default: false,
      required: false,
    },
    showFullScreen: {
      type: Boolean,
      default: false,
      required: false,
    },
    showDetail: {
      type: Boolean,
      default: false,
      required: false,
    },
    shareLink: {
      type: String,
      default: '',
      required: false,
    },
    showCopyCurl: {
      type: Boolean,
      default: false,
      required: false,
    },
    copyCurl: {
      type: Function,
      required: false,
    },
    detailLink: {
      type: String,
      default: '',
      required: false,
    }
  },
  components: {
    IconSvg,
  },
  setup(props, { slots }) {
    const toDetail = inject('toDetail', (_url: string) => {});
    const shareLink = inject('shareLink', (_url: string) => {});
    const setFullScreen = inject('setFullScreen', (_value: boolean) => {});
    const isFullScreen: any = inject('isFullScreen', false);

    const handleClick = e => {
      e.preventDefault();
      const drawerActionItems = document.getElementsByClassName('drawer-action-item');
      const result: any = [...drawerActionItems].find(el => el.contains(e.target));
      const action = result?.dataset?.action;
      switch(action) {
        case 'detail':
          toDetail(props.detailLink);
          break;
        case 'exitFullScreen':
          setFullScreen(false);
          break;
        case 'fullScreen':
          setFullScreen(true);
          break;
        default:
          break;
      }
    }

    const menuClick = (e) => {
      console.log(e.key)
      if (e.key === 'copyShare') {
        shareLink(props.shareLink)
      } else if (e.key === 'copyCurl') {
        props.copyCurl && props.copyCurl()
      }
    }

    return () => {
      const copyCurlTooltipSlots = {
        default: () => {
          return <icon-svg type="copy-as" class="icon dp-link"/>
        },
        title: () => {
          return ('复制')
        }
      }

      const copyCurlSlots = {
        default: () => {
          return <a-tooltip placement={props.showFullScreen ? 'right' : 'top'} v-slots={copyCurlTooltipSlots} />
        },
        overlay: () => {
          return (
              <a-menu onClick={e => menuClick(e)}>
                <a-menu-item key="copyShare">
                  <span>共享链接</span>
                </a-menu-item>
                <a-menu-item key="copyCurl">
                  <span>cURL</span>
                </a-menu-item>
              </a-menu>
          )
        }
      }

      return (
        <div class="drawer-action" onClick={e => handleClick(e)}>
          {props.showDetail &&  (
            <div class="drawer-action-item" data-action="detail">
              <a-tooltip placement="bottom" title="详情">
                <SelectOutlined />
              </a-tooltip>
            </div>
          )}
          {props.showCopyCurl &&  (
            <div class="drawer-action-item">
              <a-dropdown placement="bottomRight" v-slots={copyCurlSlots} />
            </div>
          )}
          {props.showFullScreen &&  (
            <div class="drawer-action-item" data-action={isFullScreen.value ? 'exitFullScreen' : 'fullScreen'}>
              <a-tooltip placement="bottom" title={isFullScreen.value ? '退出全屏' : '全屏'}>
                {isFullScreen.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </a-tooltip>
            </div>
          )}
        </div>
      )
    }
  },
})
