
import {notifySuccess, notifyWarn} from "@/utils/notify";
import {loadCurl} from "@/views/component/debug/service";
import {UsedBy} from "@/utils/enum";
import useCopy from "@/composables/useClipboard";

export const doCopyCurl = async (selectedMethodDetail, debugData, environmentId) => {
    const { copy }  = useCopy();
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
        copy(resp.data)
        notifySuccess('已复制cURL命令到剪贴板。');
    }
}
