import * as neffos from 'neffos.js';
import {NSConn} from "neffos.js";

import bus from "@/utils/eventBus";
import {getToken} from "@/utils/localToken";
import settings from "@/config/settings";
import {getAgentUrl} from "@/utils/agentEnv";

export const WsDefaultNamespace = 'default'
export const WsDefaultRoom = 'default_room'

export class WebSocket {
  static conn: NSConn

  static async init(reConn): Promise<any> {
    const url = await getWebSocketApi()
    console.log(`init websocket, connect to ` + url)

    if (reConn || !WebSocket.conn) {
      try {
        const conn = await neffos.dial(url, {
          default: {
            _OnNamespaceConnected: (nsConn, msg) => {
              if (nsConn.conn.wasReconnected()) {
                console.log('re-connected after ' + nsConn.conn.reconnectTries.toString() + ' trie(s)')
              }

              console.log('connected to namespace: ' + msg.Namespace)
              WebSocket.conn = nsConn
              bus.emit(settings.eventWebSocketConnStatus, {msg: '{"conn": "success"}'});
            },

            _OnNamespaceDisconnect: (_nsConn, msg) => {
              console.log('disconnected from namespace: ' + msg.Namespace)
            },

            OnVisit: (_nsConn, msg) => {
              console.log('OnVisit', msg)
            },

            // implement in webpage
            OnChat: (_nsConn, json) => {
              console.log('OnChat in util cls', json)
              bus.emit(settings.eventWebSocketMsg, {room: json.Room, msg: json.Body});
            }
          }
        })

        await conn.connect(WsDefaultNamespace)

      } catch (err) {
        console.log('failed connect to websocket', err)
        bus.emit(settings.eventWebSocketConnStatus, {msg: '{"conn": "fail"}'});
      }
    }
    return WebSocket
  }

  static async sentMsg(roomName: string, msg: string) {
    if (!WebSocket.conn || WebSocket.conn.conn.isClosed()) {
      await WebSocket.init(true)
    }

    if (!WebSocket.conn.room(roomName)) {
      await WebSocket.conn.joinRoom(roomName)
    }

    WebSocket.conn.room(roomName).emit('OnChat', msg)
  }
}

export async function getWebSocketApi() {
  const apiHost = await getAgentUrl();

  return getWebSocketUrl(apiHost)
}
export function getWebSocketUrl(webUrl) {
  const url = webUrl.replace('http', 'ws') + '/ws'
  console.log(`websocket url = ${url}`)

  return url
}