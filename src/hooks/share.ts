import { useRouter } from "vue-router";
import useClipboard from "@/composables/useClipboard";
import { notifySuccess } from "@/utils/notify";
import { useWujie } from "@/composables/useWujie";

interface SharePage {
  getShareLink: (...args: any[]) => string;
  share: (...args: any[]) => void;
}

function useSharePage(): SharePage {
  const router = useRouter();
  const { copy } = useClipboard({legacy: true});
  const { isInThirdpartyWujieContainer, parentOrigin } = useWujie();
  const { params: { projectNameAbbr } } = router.currentRoute.value;

  const getShareLink = (record, pageType) => {
    const prefix = isInThirdpartyWujieContainer ? `${parentOrigin}/lyapi` : window.location.origin;
    return `${prefix}/${projectNameAbbr}/${pageType}/${record.serialNumber}`;
  };

  const share = (record, pageType) => {
    copy(getShareLink(record, pageType));
    notifySuccess('复制成功，项目成员可通过此链接访问');
  }

  return { getShareLink, share };
}

export default useSharePage;
