import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, client } from "../../src/repositories/dbConn.js";
import { TokenRepo } from "../../src/repositories/tokenRepo.js";

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

describe("TokenRepo CRUD operations", () => {
    let insertedId;
    let token = 'test_token'
    let userID = '8f3c9a12b7e4d5c6f1a2b3c4'

    test("should create a token", async () => {
        const data = { token: token, userID: userID };
        insertedId = await TokenRepo.addObj(data);
        expect(insertedId).toBeTruthy();
    });

    test("should get token by ID", async () => {
        const token = await TokenRepo.getObjByID(insertedId);
        expect(token.userID).toBe(userID);
    });

    test("should get token by filters", async () => {
        const tokens = await TokenRepo.getObjByFIlters({ userID: userID });
        expect(tokens.length).toBeGreaterThan(0);
    });

    test("should update token", async () => {
        const updated = await TokenRepo.updateObj(insertedId, { token: "diff_token" });
        expect(updated).toBe(true);

        const token = await TokenRepo.getObjByID(insertedId);
        expect(token.token).toBe("diff_token");
    });

    test("should get all tokens", async () => {
        const tokens = await TokenRepo.getAllObj();
        expect(tokens).not.toBeNull();
    });

    test("should delete token", async () => {
        const deleted = await TokenRepo.deleteObj(insertedId);
        expect(deleted).toBe(true);

        const token = await TokenRepo.getObjByID(insertedId);
        expect(token).toBeNull();
    });

    test("should delete all tokens", async () => {
        let token2 = 'test_token1'
        let userID2 = '8f3c9a12b7e4d5c6f1a2b3c42'
        const data1 = { token: token, userID: userID };
        const data2 = { token: token2, userID: userID2 };
        insertedId1 = await TokenRepo.addObj(data1);
        insertedId2 = await TokenRepo.addObj(data2);

        const deleted = await TokenRepo.deleteManyObjs([insertedId1, insertedId2]);
        expect(deleted).toBe(true);

        const token1 = await TokenRepo.getObjByID(insertedId1);
        expect(token1).toBeNull();

        const token22 = await TokenRepo.getObjByID(insertedId2);
        expect(token22).toBeNull();
    });
});
