<template>
  <div class="aichat-main">
    <div class="header">
      <div class="label">大模型</div>
      <div class="contrl">
        <a-select v-model:value="llm">
          <a-select-option v-for="(item, index) in aiModels" :key="index"
                           :value="item.code">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>

      <div class="label">知识库</div>
      <div class="contrl">
        <a-select v-model:value="kb">
          <a-select-option v-for="(item, index) in aiKbs" :key="index"
                           :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <div class="messages" id="chat-messages">
      <template v-for="(item, index) in messages" :key="index" class="log">
        <div v-if="item.type === 'robot'" class="chat-sender">
          <div class="avatar robot"></div>
          <div>ChatGPT</div>
          <div>
            <div class="chat-left_triangle"></div>
            <span v-html="item.content" />
          </div>
        </div>

        <div v-if="item.type === 'human'" class="chat-receiver">
          <div class="avatar"
               v-bind:style="{ 'background-image': 'url(' + require('@/assets/images/chat-einstein.png') + ')' }"></div>
          <div>{{item.name}}</div>
          <div>
            <div class="chat-right_triangle"></div>
            <span>{{item.content}}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="actions">
      <a-input-search
          v-model:value="msg"
          placeholder="输入文字和机器人聊天"
          size="large"
          @search="send"
          @keydown="keyDown">
        <template #enterButton>
          <a-button :disabled="isChatting">发送</a-button>
        </template>
      </a-input-search>
    </div>
  </div>
</template>

<script setup lang="ts">
import {EventStreamContentType, fetchEventSource} from '@microsoft/fetch-event-source';
import {onMounted, ref, watch} from "vue";
import {getUrls} from "@/utils/request";
import {scrollTo} from "@/utils/dom";
import {getCache, setCache} from "@/utils/localCache";
import {KEY_CODES} from "handsontable/helpers";
import KeyCode from "ant-design-vue-v3/lib/_util/KeyCode";
import {markToHtml, docToHtml, urlToLink, scroll, list_valid_models, list_knowledge_bases} from "./service";

const humanName = 'Albert'
const humanAvatar = '../../../../assets/images/chat-einstein.png'

const CHAT_HISTORIES = 'chat_history_key'
const histories = ref([] as any[])
const historyIndex = ref(0)

const aiModels = ref([] as any[])
const aiKbs = ref([] as string[])
const llm = ref('openai-api')
const kb = ref('poc')
const msg = ref('')

const messages = ref([] as any[])
messages.value.push({
  type: 'human',
  name: humanName,
  content: '小乐',
  avatar: humanAvatar,
})
messages.value.push({
  type: 'robot',
  name: 'ChatGPT',
  content: '您好，有什么可以帮助您的？',
})

const isChatting = ref(false)
const currMsg = ref('')
const send = async () => {
  const index = histories.value.indexOf(msg.value)
  if (index > -1) {
    histories.value.splice(index, 1);
  }

  if (histories.value.length >= 30) histories.value = histories.value.splice(0,1)

  histories.value.push(''+msg.value)
  historyIndex.value = histories.value.length

  await setCache(CHAT_HISTORIES, histories.value)

  isChatting.value = true
  currMsg.value = ''

  const humanMsg = {
    type: 'human',
    name: humanName,
    content: msg.value,
    avatar: humanAvatar,
  }
  messages.value.push(humanMsg)

  const {serverUrl} = getUrls()
  const url = `${serverUrl}/aichat/knowledge_base_chat`
  console.log('chat', url)

  const ctrl = new AbortController();

  const data = {
    "query": msg.value,
    "knowledge_base_name": kb.value,
    "top_k": 1,
    "score_threshold": 1,
    "history": [
      // {"role": "user", "content": ""},
      // {"role": "assistant", "content": ""}
    ],
    "stream": true,
    "model_name": llm.value,
    "temperature": 0.7,
    "max_tokens": 0,
    "prompt_name": "default"
  }

  await fetchEventSource(url, {
    method: 'POST',
    headers: {
      // 'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal: ctrl.signal,

    async onopen(response) {
      console.log('onopen', response)

      if (response.ok) { // && response.headers.get('content-type') === EventStreamContentType) {
        return
      } else {
        console.log('onopen error, response is ', response)
      }
    },

    onmessage(msg: any) {
      console.log('onmessage', msg)

      if (msg.data) {
        try {
          const jsn = JSON.parse(msg.data)
          if (jsn.answer) {
            currMsg.value += jsn.answer.trim()
            currMsg.value = markToHtml(currMsg.value)
          } else if (jsn.docs) {
            currMsg.value += '<br />' + docToHtml(jsn.docs[0].trim())
          }

          currMsg.value = urlToLink(currMsg.value)
        }
        catch(err) {
          console.log(err)
        }
      }
    },

    onclose() {
      console.log('onclose')
      isChatting.value = false
      currMsg.value = ''

      msg.value = ''
    },
    onerror(err) {
      console.log('onerror', err)
      isChatting.value = false
      currMsg.value = ''
    }
  });
}

const keyDown = (event) => {
  console.log(event)

  if (event.keyCode === KeyCode.UP) {
    console.log('up')
    if (historyIndex.value > 0) historyIndex.value--

    msg.value = histories.value[historyIndex.value]

  } else if (event.keyCode === KeyCode.DOWN) {
    console.log('keyDown', event)
    if (historyIndex.value < histories.value.length - 1) historyIndex.value++

    msg.value = histories.value[historyIndex.value]
  }
}

watch(currMsg, (newVal, oldValue) => {
  if (!oldValue && newVal) {
    const robotMsg = {
      type: 'robot',
      name: humanName,
      content: newVal,
      avatar: humanAvatar,
    }
    messages.value.push(robotMsg)

  } else if (newVal && messages.value[messages.value.length - 1].type === 'robot') {
    messages.value[messages.value.length - 1].content =  newVal
  }

  scroll()
}, {immediate: false, deep: true})



const initAiData = async () => {
  const modelsResp = await list_valid_models({})
  console.log('list_valid_models', modelsResp)
  if (modelsResp.code === 0)
    aiModels.value = modelsResp.data

  const kbsResp = await list_knowledge_bases()
  console.log('list_knowledge_bases', kbsResp)
  if (kbsResp.code === 0)
    aiKbs.value = kbsResp.data
}

const initHistory = async () => {
  histories.value = await getCache(CHAT_HISTORIES)
  if (!histories.value) histories.value = []
  if (histories.value.length > 0)
    msg.value = histories.value[histories.value.length - 1]
}

onMounted(async () => {
  initHistory()
  initAiData()
})

</script>

<style lang="less" scoped>
.aichat-main {
  z-index: 9;
  position: fixed;
  top: 65px;
  right: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;

  height: calc(100% - 60px);
  width: 496px;

  background-color: #ebebeb;
  font-family: -apple-system;
  font-family: "-apple-system", "Helvetica Neue", "Roboto", "Segoe UI", sans-serif;

  .header {
    margin-bottom: 16px;
    padding: 6px;
    height: 32px;
    display: flex;
q
    .label {
      width: 60px;
      padding-right: 6px;
      text-align: right;
      line-height: 32px;
    }
    .contrl {
      flex: 1;
    }

    .ant-select {
      width: 90%;
    }
  }

  .messages {
    flex: 1;
    overflow-y: auto;

    .chat-sender, .chat-receiver {
      .avatar {
        margin: 5px;
        width: 40px;
        height: 40px;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 5px;
      }
      span {
        word-break: break-all;
      }
    }
    .chat-sender {
      clear: both;
      font-size: 80%;
      .avatar {
        background-image: url('../../../../assets/images/chat-robot.png');
      }
    }

    .chat-sender div:nth-of-type(1) {
      float: left;
    }

    .chat-sender div:nth-of-type(2) {
      margin: 0 50px 2px 50px;
      padding: 0px;
      color: #848484;
      font-size: 80%;
      text-align: left;
    }

    .chat-sender div:nth-of-type(3) {
      background-color: white;
      /*float: left;*/
      margin: 0 50px 10px 50px;
      padding: 10px 10px 10px 10px;
      border-radius: 7px;
      text-indent: -12px;
    }

    .chat-receiver {
      clear: both;
      font-size: 80%;
    }

    .chat-receiver div:nth-of-type(1) {
      float: right;
    }

    .chat-receiver div:nth-of-type(2) {
      margin: 0px 50px 2px 50px;
      padding: 0px;
      color: #848484;
      font-size: 70%;
      text-align: right;
    }

    .chat-receiver div:nth-of-type(3) {
      /*float:right;*/
      background-color: #b2e281;
      margin: 0px 50px 10px 50px;
      padding: 10px 10px 10px 10px;
      border-radius: 7px;
    }

    .chat-receiver div:first-child img,
    .chat-sender div:first-child img {
      width: 40px;
      height: 40px;
      /*border-radius: 10%;*/
    }

    .chat-left_triangle {
      height: 0px;
      width: 0px;
      border-width: 6px;
      border-style: solid;
      border-color: transparent white transparent transparent;
      position: relative;
      left: -22px;
      top: 3px;
    }

    .chat-right_triangle {
      height: 0px;
      width: 0px;
      border-width: 6px;
      border-style: solid;
      border-color: transparent transparent transparent #b2e281;
      position: relative;
      right: -22px;
      top: 3px;
    }

    .chat-notice {
      clear: both;
      font-size: 70%;
      color: white;
      text-align: center;
      margin-top: 15px;
      margin-bottom: 15px;
    }

    .chat-notice span {
      background-color: #cecece;
      line-height: 25px;
      border-radius: 5px;
      padding: 5px 10px;

      word-break: break-all;
    }
  }

  .actions {
    height: 50px;
  }
}
</style>
