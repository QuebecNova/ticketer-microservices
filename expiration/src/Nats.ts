import nats, { Stan } from "node-nats-streaming"

class Nats {
    private _client?: Stan

    get client() {
        if (!this._client) {
            throw new Error('Cannot access NATS client before connection established')
        }
        return this._client
    }

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, {url})
        return new Promise<void>((res, rej) => {
            this.client.on('connect', () => {
                console.log('Conneced to NATS')
                res()
            })
            this.client.on('error', (err) => {
                rej(err)
            })
        })
    }
}

export const natsWrapper = new Nats() 