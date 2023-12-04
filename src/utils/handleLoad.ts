/**
 * @description 显示全局加载动画
 * */

export const showGlobalLoading = () => {
    const appLoadingEl = document.getElementById('ly-app-loading');
    appLoadingEl && appLoadingEl.classList.remove('hide');
}


/**
 * @description  隐藏全局加载动画
 * */
export const hideGlobalLoading = () => {
    setTimeout(() => {
        const appLoadingEl = document.getElementById('ly-app-loading');
        appLoadingEl && appLoadingEl.classList.add('hide');
    }, 500);
}

