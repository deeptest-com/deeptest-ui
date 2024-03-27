import * as neffos from 'neffos.js';
import {NSConn} from 'neffos.js';

export const WsPerformanceTestNamespace = 'performance_test'
export const WsPerformanceLogNamespace = 'performance_log'

export class PerformanceTestWsClient {
    static conductorConn: NSConn
    static runnerConn: NSConn

    static resultCallback: Function
    static logCallback: Function

    static async conductorConnect(url): Promise<any> {
        if (PerformanceTestWsClient.conductorConn) {
            await PerformanceTestWsClient.conductorConn.disconnect()
        }

        console.log(`init performance conductor websocket, connect to ${url}`)

        try {
            const conn = await neffos.dial(url, {
                [WsPerformanceTestNamespace]: {
                    _OnNamespaceConnected: (nsConn, msg) => {
                        if (nsConn.conn.wasReconnected()) {
                            console.log('re-connect conductor after ' + nsConn.conn.reconnectTries.toString() + ' trie(s)')
                        }

                        console.log('connected to conductor namespace: ' + msg.Namespace)
                        PerformanceTestWsClient.conductorConn = nsConn
                    },
                    _OnNamespaceDisconnect: (_nsConn, msg) => {
                        console.log('disconnected from conductor namespace: ' + msg.Namespace)
                    },

                    OnVisit: (_nsConn, msg) => {
                        console.log('OnVisit', msg)
                    },
                    OnChat: (_nsConn, json) => {
                        console.log('onChat in performance conductor websocket', json)

                        if (!json.Body) {
                            return
                        }

                        const body = JSON.parse(json.Body);

                        if (PerformanceTestWsClient.resultCallback) {
                            PerformanceTestWsClient.resultCallback(json.Room, body)
                        }
                    }
                }
            })

            await conn.connect(WsPerformanceTestNamespace)

        } catch (err) {
            alert('failed connect to performance conductor websocket')
            console.log('failed connect to performance conductor websocket', err)
        }

        return PerformanceTestWsClient
    }

    static async runnerConnect(url): Promise<any> {
        if (PerformanceTestWsClient.runnerConn) {
            await PerformanceTestWsClient.runnerConn.disconnect()
        }

        console.log(`init performance runner websocket, connect to ${url}`)

        try {
            const conn = await neffos.dial(url, {
                [WsPerformanceLogNamespace]: {
                    _OnNamespaceConnected: (nsConn, msg) => {
                        if (nsConn.conn.wasReconnected()) {
                            console.log('re-connected after ' + nsConn.conn.reconnectTries.toString() + ' trie(s)')
                        }

                        console.log('connected to runner namespace: ' + msg.Namespace)
                        PerformanceTestWsClient.runnerConn = nsConn
                    },
                    _OnNamespaceDisconnect: (_nsConn, msg) => {
                        console.log('disconnected from runner namespace: ' + msg.Namespace)
                    },

                    OnVisit: (_nsConn, msg) => {
                        console.log('OnVisit', msg)
                    },
                    OnChat: (_nsConn, json) => {
                        console.log('onChat in performance runner websocket', json)

                        if (!json.Body) {
                            return
                        }

                        const body = JSON.parse(json.Body);

                        if (body.category === 'log' && body.data.log && PerformanceTestWsClient.logCallback) {
                            PerformanceTestWsClient.logCallback(json.Room, body)
                        }
                    }
                }
            })

            await conn.connect(WsPerformanceLogNamespace)

        } catch (err) {
            alert('failed connect to performance log websocket')
            console.log('failed connect to performance log websocket', err)
        }

        return PerformanceTestWsClient
    }

    static async sentPerformanceConductorInstruction(url, room, msg, resultCb) {
        console.log('sentPerformanceConductorInstruction', url, room, msg)

        if (resultCb) {
            PerformanceTestWsClient.resultCallback = resultCb
        }

        try {
            if (!PerformanceTestWsClient.conductorConn || PerformanceTestWsClient.conductorConn.conn.isClosed()) {
                await PerformanceTestWsClient.conductorConnect(url)
            }
            if (!PerformanceTestWsClient.conductorConn || PerformanceTestWsClient.conductorConn.conn.isClosed()) {
                return
            }

            if (!PerformanceTestWsClient.conductorConn.room(room)) {
                const roomInst = await PerformanceTestWsClient.conductorConn.joinRoom(room)
                console.log('joined room', roomInst)
            }

            console.log('sentPerformanceConductorInstruction data', msg)
            PerformanceTestWsClient.conductorConn.room(room).emit('OnChat', msg)

        } catch (err) {
            alert('failed sentPerformanceConductorInstruction')
            console.log('failed sentPerformanceConductorInstruction', err)
        }
    }

    static async sentPerformanceRunnerInstruction(url, room, msg, logCb) {
        console.log('sentPerformanceRunnerInstruction')

        if (logCb) {
            PerformanceTestWsClient.logCallback = logCb
        }

        try {
            await PerformanceTestWsClient.runnerConnect(url)

            if (!PerformanceTestWsClient.runnerConn || PerformanceTestWsClient.runnerConn.conn.isClosed()) {
                return
            }

            if (!PerformanceTestWsClient.runnerConn.room(room)) {
                const roomInst = await PerformanceTestWsClient.runnerConn.joinRoom(room)
                console.log('joined room', roomInst)
            }

            console.log('sentPerformanceRunnerInstruction data', msg)
            PerformanceTestWsClient.runnerConn.room(room).emit('OnChat', msg)

        } catch (err) {
            alert('failed sentPerformanceRunnerInstruction')
            console.log('failed sentPerformanceRunnerInstruction', err)
        }
    }
}
