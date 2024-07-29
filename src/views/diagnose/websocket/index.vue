<template>
  <div class="websocket-debug-main">
    <div class="header-con">
      <div class="left">
        <span class="title">WebSocket请求</span>
        <div class="name"></div>
      </div>
      <div class="right"></div>
    </div>

    <div class="debug-content">
      <ContentPaneHorizontal>
        <template #top>
          <request />
        </template>

        <template #bottom>
          <response />
        </template>
      </ContentPaneHorizontal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ContentPaneHorizontal from "@/views/component/ContentPaneHorizontal/index.vue";
import request from "./components/request/index.vue";
import response from "./components/response/index.vue";

</script>

<style lang="less" scoped>
.websocket-debug-main {
  height: 100%;
  display: flex;
  flex-flow: column;

  .header-con {
    display: flex;
    height: 40px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding-left: 16px;

    .left {
      width: 400px;

      .title {
        font-size: 16px;
        font-weight: bold;
        margin-right: 16px;
      }

      .name {
        width: 200px;
        display: inline-block;

        .defaultValue {
          color: #c1baba;
        }
      }
    }

    .right {
      text-align: right;
      margin-right: 16px;
      flex: 1;
      max-width: 400px;
      //  超出省略号
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .prefix-icon-svg {
      margin-right: 3px;
    }
  }

  .debug-content {
    flex: 1;
    padding: 0;

    .container {
      height: 100%;
    }
  }
}
</style>
