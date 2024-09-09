import settings from "@/config/settings";

// 监听 modal，drawer的显示与隐藏
export const observer = new MutationObserver(mutationList => {
  const modalRootEl: any = document.querySelectorAll('.ant-modal-wrap');
  const drawerRootEl: any = document.querySelector('.ant-drawer');
  const findVisibleModal = [...modalRootEl || []].find(e => e.style.display !== 'none');
  if (findVisibleModal || drawerRootEl) {
    // modal 显示
    window?.$wujie?.bus.$emit(settings.sendMsgToThirdparty, {
      type: 'openModalOrDrawerEl'
    })
  } else {
    window?.$wujie?.bus.$emit(settings.sendMsgToThirdparty, {
      type: 'closeModalOrDrawerEl'
    })
  }
})

export const config = { attributes: true };