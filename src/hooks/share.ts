import { useRouter } from "vue-router";
import {useClipboard} from '@vueuse/core'
import { notifySuccess } from "@/utils/notify";

interface SharePage {
  getShareLink: (...args: any[]) => string;
  share: (...args: any[]) => void;
}

function useSharePage(): SharePage {
  const router = useRouter();
  const { copy } = useClipboard({});
  const { params: { projectNameAbbr } } = router.currentRoute.value;

  const getShareLink = (record, pageType) => {
    return `${window.location.origin}/${projectNameAbbr}/${pageType}/${record.serialNumber}`;
  };

  const share = (record, pageType) => {
    copy(getShareLink(record, pageType));
    notifySuccess('复制成功，项目成员可通过此链接访问');
  }

  return { getShareLink, share };
}

export default useSharePage;