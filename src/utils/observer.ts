import settings from "@/config/settings";

// 监听 modal，drawer的显示与隐藏
export const observer = new MutationObserver(mutationList => {
  const modalRootEl: any = document.querySelector('.ant-modal-wrap');
  const drawerRootEl: any = document.querySelector('.ant-drawer');
  if ((modalRootEl && modalRootEl.style.display !== 'none') || drawerRootEl) {
    // modal 显示
    window?.$wujie?.bus.$emit(settings.sendMsgToLeyan, {
      type: 'openModalOrDrawerEl'
    })
  } else {
    window?.$wujie?.bus.$emit(settings.sendMsgToLeyan, {
      type: 'closeModalOrDrawerEl'
    })
  }
})

export const config = { attributes: true };