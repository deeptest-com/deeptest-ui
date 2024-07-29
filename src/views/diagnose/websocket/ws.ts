import * as neffos from 'neffos.js';
import {NSConn} from 'neffos.js';

export const WsWebsocketTestNamespace = 'default'

export class WebsocketTestWsClient {
    static conn: NSConn

    static resultCallback: Function

    static async connect(url): Promise<any> {
        if (WebsocketTestWsClient.conn) {
            await WebsocketTestWsClient.conn.disconnect()
        }

        console.log(`init performance conductor websocket, connect to ${url}`)

        try {
            const conn = await neffos.dial(url, {
                [WsWebsocketTestNamespace]: {
                    _OnNamespaceConnected: (nsConn, msg) => {
                        console.log('connected to conductor namespace: ' + msg.Namespace)
                        WebsocketTestWsClient.conn = nsConn
                    },
                    _OnNamespaceDisconnect: (_nsConn, msg) => {
                        console.log('disconnected from conductor namespace: ' + msg.Namespace)
                    },
                    _OnAnyEvent: (_nsConn, json) => {
                        console.log('onChat in websocket test', json)

                        if (!json.Body) {
                            return
                        }

                        const body = JSON.parse(json.Body);

                        if (WebsocketTestWsClient.resultCallback) {
                            WebsocketTestWsClient.resultCallback(json.Room, body)
                        }
                    }
                }
            })

            await conn.connect(WsWebsocketTestNamespace)

        } catch (err) {
            alert('failed connect to performance conductor websocket')
            console.log('failed connect to performance conductor websocket', err)
        }

        return WebsocketTestWsClient
    }

    static async sentInstruction(url, room, msg, resultCb) {
        console.log('sentInstruction', url, room)

        if (resultCb) {
            WebsocketTestWsClient.resultCallback = resultCb
        }

        try {
            if (!WebsocketTestWsClient.conn || WebsocketTestWsClient.conn.conn.isClosed()) {
                await WebsocketTestWsClient.connect(url)
            }
            if (!WebsocketTestWsClient.conn || WebsocketTestWsClient.conn.conn.isClosed()) {
                return
            }

            if (!WebsocketTestWsClient.conn.room(room)) {
                const roomInst = await WebsocketTestWsClient.conn.joinRoom(room)
                console.log('joined room', roomInst)
            }

            // console.log('sentWebsocketInstruction data', msg)
            WebsocketTestWsClient.conn.room(room).emit('OnChat', msg)

        } catch (err) {
            alert('failed sentWebsocketInstruction')
            console.log('failed sentWebsocketInstruction', err)
        }
    }
}
