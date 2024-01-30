
import {notifySuccess, notifyWarn} from "@/utils/notify";
import {loadCurl} from "@/views/component/debug/service";
import {UsedBy} from "@/utils/enum";

export const doCopyCurl = async (selectedMethodDetail, debugData, environmentId) => {
    console.log('copyCurl', selectedMethodDetail, debugData)

    const clipboard = navigator.clipboard;
    if (!clipboard) {
        notifyWarn('您的浏览器不支持复制内容到剪贴板。');
        return
    }

    let resp = {} as any

     if (selectedMethodDetail?.method) {
        resp = await loadCurl({
            endpointInterfaceId: selectedMethodDetail.id,
            usedBy: UsedBy.InterfaceDebug,
            environmentId: environmentId,
            fromDefine: true,
        })
    }else if (debugData?.method) {
        resp = await loadCurl({
            debugInterfaceId: debugData.debugInterfaceId,
            endpointInterfaceId: debugData.endpointInterfaceId,
            usedBy: debugData.usedBy,
            environmentId: environmentId,
        })

    }

    if (resp.code == 0) {
        navigator.clipboard.writeText(resp.data)
        notifySuccess('已复制cURL命令到剪贴板。');
    }
}
