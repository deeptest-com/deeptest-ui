<template>
  <div></div>
</template>

<script lang="ts">
import {defineComponent, onMounted, onBeforeUnmount} from "vue";
import { useI18n } from "vue-i18n";

import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {notification} from "ant-design-vue";
import {NotificationKeyCommon} from "@/utils/const";
import {notifyError} from "@/utils/notify";

export default defineComponent({
  name: 'Notification',

  setup() {
    const { t } = useI18n();

    const notifyErr = (result: any) => {
      if (!result.httpCode) result.httpCode = 1000
      if ([10600, 10700, 403, 10900].includes(result.resultCode)) {
        return;
      }
      const text = result.resultCode === 10800 ? result.resultMsg : (result.resultMsg || t('biz_'+result.resultCode));
      const msg = result.httpCode === 200 ? text : t('http_'+result.httpCode)
      const desc = result.resultMsg ? result.resultMsg : ''

      if (result.resultCode !== 401) {
        notifyError(msg);
      }
    }

    onMounted(() => {
      console.log('onMounted')
      bus.on('eventNotify', notifyErr);
    })
    onBeforeUnmount( () => {
      console.log('onBeforeUnmount')
      bus.off('eventNotify', notifyErr);
    })

    return {
      t,
    }
  }
})
</script>