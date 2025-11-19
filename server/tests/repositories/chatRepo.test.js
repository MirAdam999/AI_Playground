import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, client } from "../../src/repositories/dbConn.js";
import { ChatRepo } from "../../src/repositories/chatRepo.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
});

afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
});

describe("ChatRepo CRUD operations, and addMessage", () => {
    let insertedId;


    test("should create a chat", async () => {
        const data = {
            title: 'title',
            messages_katanemo_model: [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Katanemo Response'
                }
            ],
            messages_smol_model: [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Smol Response'
                }
            ]
        };
        insertedId = await ChatRepo.addObj(data);
        expect(insertedId).toBeTruthy();
    });

    test("should get chat by ID", async () => {
        const chat = await ChatRepo.getObjByID(insertedId);
        expect(chat.title).toBe('title');
    });

    test("should get chat by filters", async () => {
        const chats = await ChatRepo.getObjByFIlters({ title: 'title' });
        expect(chats.length).toBeGreaterThan(0);
    });

    test("should update chat", async () => {
        const updated = await ChatRepo.updateObj(insertedId, { title: "new title" });
        expect(updated).toBe(true);

        const chat = await ChatRepo.getObjByID(insertedId);
        expect(chat.title).toBe("new title");
    });

    test("should get all chats", async () => {
        const chats = await ChatRepo.getAllObj();
        expect(chats).not.toBeNull();
    });

    test("should add to msg to existing char", async () => {
        const userMsg = 'I am a duck'
        const katanemoResponse = 'Quack'
        const smolResponse = 'Me too'
        const add = await ChatRepo.addMessage(insertedId, userMsg, katanemoResponse, smolResponse);
        expect(add).toBeTruthy();
    });

    test("should delete chat", async () => {
        const deleted = await ChatRepo.deleteObj(insertedId);
        expect(deleted).toBe(true);

        const chat = await ChatRepo.getObjByID(insertedId);
        expect(chat).toBeNull();
    });

    test("should delete all chats", async () => {
        const data = {
            title: 'title',
            messages_katanemo_model: [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Katanemo Response'
                }
            ],
            messages_smol_model: [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Smol Response'
                }
            ]
        };

        const data1 = {
            title: 'title',
            messages_katanemo_model: [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Katanemo Response'
                }
            ],
            messages_smol_model: [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Smol Response'
                }
            ]
        };

        let insertedId1 = await ChatRepo.addObj(data);
        let insertedId2 = await ChatRepo.addObj(data1);

        const del = await ChatRepo.deleteManyObjs([insertedId1, insertedId2]);
        expect(del).toBe(true);

        const chat1 = await ChatRepo.getObjByID(insertedId1);
        expect(chat1).toBeNull();

        const chat2 = await ChatRepo.getObjByID(insertedId2);
        expect(chat2).toBeNull();
    });
});
