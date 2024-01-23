import { defineComponent, inject } from 'vue';
import { FullscreenExitOutlined, FullscreenOutlined, SelectOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import IconSvg from "@/components/IconSvg";
import SiderMenu from "@/layouts/IndexLayout/components/SiderMenu.vue";
import Icon from "@/layouts/IndexLayout/components/Icon.vue";

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
  setup(props, ctx) {
    const toDetail = inject('toDetail', (_url: string) => {});
    const shareLink = inject('shareLink', (_url: string) => {});
    const setFullScreen = inject('setFullScreen', (_value: boolean) => {});
    const isFullScreen: any = inject('isFullScreen');

    const handleClick = e => {
      e.preventDefault();
      const drawerActionItems = document.getElementsByClassName('drawer-action-item');
      const result: any = [...drawerActionItems].find(el => el.contains(e.target));
      const action = result?.dataset?.action;
      switch(action) {
        case 'detail':
          toDetail(props.detailLink);
          break;
        case 'share':
          shareLink(props.shareLink);
          break;
        case 'exitFullScreen':
          setFullScreen(false);
          break;
        case 'fullScreen':
          setFullScreen(true);
          break;
        case 'copyCurl':
          props.copyCurl && props.copyCurl();
          break;
        default:
          break;
      }
    }

    return () => {
      return (
        <div class="drawer-action" onClick={e => handleClick(e)}>
          {props.showDetail &&  (
            <div class="drawer-action-item" data-action="detail">
              <a-tooltip placement="bottom" title="详情">
                <SelectOutlined />
              </a-tooltip>
            </div>
          )}
          {props.showShare &&  (
            <div class="drawer-action-item" data-action="share">
              <a-tooltip placement="bottom" title="分享链接">
                <ShareAltOutlined />
              </a-tooltip>
            </div>
          )}
          {props.showCopyCurl &&  (
              <div class="drawer-action-item" data-action="copyCurl">
                <a-tooltip placement="bottom" title="复制为cURL">
                  <icon-svg type="copy-as" class="icon dp-link" />
                </a-tooltip>
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
