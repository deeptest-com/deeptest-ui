<template>
  <div class="aichat-main">
    <div class="fix-action-open dp-link clear-both" :title="'打开数字人'"
         @click="showOrNot">
      <span v-if="!showChat" class="open" />
    </div>

    <div v-if="showChat"
         class="aichat-container">
      <div class="header">
        <div class="logo">
          <img src="@/assets/images/chat-robot.png" />
        </div>

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

        <div class="action dp-link"
             @click="showOrNot">
          <span class="close" />
        </div>
      </div>

      <div class="messages" id="chat-messages">
        <template v-for="(item, index) in messages" :key="index" class="log">
          <div v-if="item.type === 'human'" class="chat-sender human">
            <div class="avatar-container">
              <div class="avatar"></div>
            </div>

            <div class="content">
              <span>{{item.content}}</span>
              <span v-if="index === messages.length - 1"
                    class="loading">
                <img src="@/assets/images/loading.gif" />
              </span>
            </div>
          </div>

          <div v-if="item.type === 'robot'" class="chat-sender robot">
            <div class="avatar-container">
              <div class="avatar"></div>
            </div>
            <div class="content">
              <span v-html="item.content" />
            </div>
            <div class="toolbar">
              <div class="call dp-link-primary"
                   @click="recall(index)">
                重新生成
              </div>

              <div class="copy dp-link"
                   @click="copy">
                <img src="@/assets/images/chat-copy.png" />
                复制
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="sender">
        <a-input-search
            v-model:value="msg"
            placeholder="输入文字聊天，上下键可切换历史。"
            size="large"
            @search="send"
            @keydown="keyDown"
            id="msgInput">
          <template #enterButton>
            <a-button :disabled="isChatting">
              <img src="@/assets/images/chat-submit.png" class="submit-btn" />
            </a-button>
          </template>
        </a-input-search>
      </div>

      <div class="actions">
        <span class="icon-container" title="帮助"><span class="help icon dp-link"></span></span>
        <span class="icon-container" title="评论"><span class="comments icon dp-link"></span></span>
        <span class="icon-container" title="点赞"><span class="up icon dp-link"></span></span>
        <span class="icon-container" title="拍砖"><span class="down icon dp-link"></span></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {fetchEventSource} from '@microsoft/fetch-event-source';
import {onMounted, ref, watch} from "vue";
import {LoadingOutlined} from "@ant-design/icons-vue";
import {getUrls} from "@/utils/request";
import {getCache, setCache} from "@/utils/localCache";
import KeyCode from "ant-design-vue-v3/lib/_util/KeyCode";
import {
  markToHtml,
  docToHtml,
  urlToLink,
  scroll,
  list_valid_models,
  list_knowledge_bases,
  setSelectionRange
} from "./service";
import {notifySuccess} from "@/utils/notify";

const humanName = 'Albert'
const humanAvatar = '../../../../assets/images/chat-einstein.png'

const CHAT_HISTORIES = 'chat_history_key'
const histories = ref([] as any[])
const historyIndex = ref(-1)

const aiModels = ref([] as any[])
const aiKbs = ref([] as string[])
const llm = ref('openai-api')
const kb = ref('poc')
const msg = ref('')
const msgInput = ref();

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
scroll()

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
  scroll()

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

  if (historyIndex.value === -1 && histories.value.length === 0) { // fist time
    return
  }

  if (event.keyCode === KeyCode.UP) {
    console.log('up')

    if (historyIndex.value === -1) { // fist time
      historyIndex.value = histories.value.length - 1
      msg.value = histories.value[historyIndex.value]

      setSelectionRange(document.getElementById('msgInput'), msg.value.length)

      return
    }

    if (historyIndex.value > 0) {
      historyIndex.value--
    }
    msg.value = histories.value[historyIndex.value]

  } else if (event.keyCode === KeyCode.DOWN) {
    console.log('keyDown', event)

    if (historyIndex.value === -1 ||  // fist time
        historyIndex.value === histories.value.length - 1) { // is max
      historyIndex.value === -1
      msg.value = ''
      return
    }

    historyIndex.value++
    msg.value = histories.value[historyIndex.value]
  }

  if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
    setSelectionRange(document.getElementById('msgInput'), msg.value.length)
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
  // if (histories.value.length > 0)
  //   msg.value = histories.value[histories.value.length - 1]
}

const showChat = ref(true)
const showOrNot = () => {
  showChat.value = !showChat.value
}

const recall = (index) => {
  console.log('recall', index)
  if (index > messages.value.length - 1) {
    return
  }

  const item = messages.value[index-1]
  msg.value = item.content
  send()
}

const copy = () => {
  console.log('copy')
  if (messages.value.length === 0 || !navigator.clipboard) {
    return
  }

  navigator.clipboard.writeText(messages.value[messages.value.length - 1].content)
  notifySuccess('成功复制回复结果到剪贴板。');
}

onMounted(async () => {
  initHistory()
  initAiData()
})

</script>

<style lang="less">
.aichat-main .aichat-container {
  .sender {
    input {
      border-right: 0;
      border-color: #447DFD !important;
      border-radius: 8px 0 0 8px !important;
    }

    input:focus {
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      -webkit-user-modify: read-write-plaintext-only;
      outline: none;
      box-shadow: none;
    }
  }
}
</style>

<style lang="less" scoped>
.aichat-main {
  .fix-action-open {
    position: fixed;
    z-index: 999;
    padding: 4px;
    bottom: 70px;
    right: 16px;
    width: 32px;
    height: 32px;
    .open {
      display: inline-block;
      margin: 6px;
      height: 20px;
      width: 20px;
      background-size: cover;
      background-image: url('../../../../assets/images/chat-robot.png');
    }
  }

  .aichat-container {
    z-index: 9;
    position: fixed;
    top: 0;
    right: 0;
    padding: 16px;
    height: 100%;
    width: 650px;
    background-color: #FFFFFF;
    border: 1px solid #f0f0f0;

    display: flex;
    flex-direction: column;

    .header {
      margin-bottom: 16px;
      height: 32px;
      display: flex;

      .logo {
        width: 30px;
        padding: 4px;
        img {
          height: 22px;
          width: 22px;
        }
      }
      .label {
        width: 65px;
        padding-right: 7px;
        text-align: right;
        line-height: 32px;
      }
      .contrl {
        flex: 1;
        .ant-select {
          width: 100%;
        }
      }
      .action {
        width: 30px;
        padding: 7px;

        .close {
          display: inline-block;
          height: 16px;
          width: 16px;
          background-size: cover;
          background-image: url('../../../../assets/images/chat-close.png');
        }
      }
    }

    .messages {
      flex: 1;
      padding: 16px 10px;
      overflow-y: auto;
      border-radius: 8px;
      background: linear-gradient(180deg, #F3F3F6 0%, #EAEDF6 100%);

      .chat-sender {
        clear: both;
        font-size: 100%;

        &.human .avatar-container .avatar {
          background-image: url('../../../../assets/images/chat-human.png');
        }
        &.robot .avatar-container .avatar {
          background-image: url('../../../../assets/images/chat-robot.png');
        }

        .avatar-container {
          float: left;
          margin: 5px;
          padding: 4px;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: #FFFFFF;

          .avatar {
            width: 28px;
            height: 28px;
            background-size: cover;

            &.human  {
              font-weight: bold;
            }
          }
        }

        &.robot .content {
          background-color: white;
          padding-left: 14px;
        }
        &.human .content {
          .loading {
            float: right;
            img {
              height: 20px;
            }
          }
        }
        .content {
          /*float: left;*/
          margin: 0 50px 10px 50px;
          padding: 12px 10px 10px 0;
          border-radius: 7px;
        }

        .toolbar {
          display: flex;
          margin: auto 50px auto 50px;
          line-height: 23px;

          .call {
            flex: 1;
          }
          .copy {
            width: 70px;
            img {
              width: 23px;
            }
          }
        }

        span {
          word-break: break-all;
        }
      }

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

    .sender {
      margin-top: 12px;
      height: 41px;
      .ant-input {
        border-right: 0;
        border-color: #447DFD !important;
        border-radius: 8px 0 0 8px !important;
      }

      button {
        border-left: 0;
        border-color: #447DFD;
        border-radius: 0 8px 8px 0;

        .submit-btn {
          height: 24px;
          width: 24px;
        }
      }
    }

    .actions {
      text-align: right;
      padding-top: 10px;

      .icon-container {
        display: inline-block;
        margin-left: 10px;
        padding: 8px;
        width: 36px;
        height: 36px;
        border-radius: 40px;
        background: #FFFFFF;
        border: 1px solid #F5F5F5;
        box-shadow: 0 6px 32px -2px rgba(0, 0, 0, 0.1);

        .icon {
          display: inline-block;
          width: 17px;
          height: 17px;

          background-size: cover;

          &.help {
            background-image: url("../../../../assets/images/chat-help.png");
          }
          &.comments {
            background-image: url("../../../../assets/images/chat-comments.png");
          }
          &.up {
            background-image: url("../../../../assets/images/chat-up.png");
          }
          &.down {
            background-image: url("../../../../assets/images/chat-down.png");
          }
        }
      }
    }
  }
}
</style>
