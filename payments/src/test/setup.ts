import 'dotenv/config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo: MongoMemoryServer
jest.mock('../Nats')

beforeAll(async () => {
    process.env.JWT_KEY = 'whatever'

    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()

    await mongoose.connect(mongoUri, {})
})

beforeEach(async () => {
    jest.clearAllMocks()
    const collections = await mongoose.connection.db.collections()
    for (const collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongoose.connection.close()
    await mongo.stop()
}, 15000)
