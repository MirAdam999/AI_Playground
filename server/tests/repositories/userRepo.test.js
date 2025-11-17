import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, client } from "../../src/repositories/dbConn.js";
import { UserRepo } from "../../src/repositories/userRepo.js";

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

describe("UserRepo CRUD operations", () => {
    let insertedId;

    test("should add a user", async () => {
        const data = { email: "test@example.com", pass_hash: "abc123" };
        insertedId = await UserRepo.addObj(data);
        expect(insertedId).toBeTruthy();
    });

    test("should get user by ID", async () => {
        const user = await UserRepo.getObjByID(insertedId);
        expect(user.email).toBe("test@example.com");
    });

    test("should get users by filters", async () => {
        const users = await UserRepo.getObjByFIlters({ email: "test@example.com" });
        expect(users.length).toBeGreaterThan(0);
    });

    test("should update user", async () => {
        const updated = await UserRepo.updateObj(insertedId, { pass_hash: "newhash" });
        expect(updated).toBe(true);

        const user = await UserRepo.getObjByID(insertedId);
        expect(user.pass_hash).toBe("newhash");
    });

    test("should get all users", async () => {
        const users = await UserRepo.getAllObj();
        expect(users).not.toBeNull();
    });

    test("should add to chat history", async () => {
        const chatData = { id: '69182c2b242ecca3a4933b60', title: 'string' }
        const user = await UserRepo.addChatToHistory(insertedId, chatData);
        expect(user).toBeTruthy();
    });

    test("should delete user", async () => {
        const deleted = await UserRepo.deleteObj(insertedId);
        expect(deleted).toBe(true);

        const user = await UserRepo.getObjByID(insertedId);
        expect(user).toBeNull();
    });
});
