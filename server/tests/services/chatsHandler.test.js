import { jest } from '@jest/globals';
import { ChatsHandler } from "../../src/services/chatsHandler";
import { ObjectId } from 'mongodb';

jest.mock("../../src/repositories/chatRepo", () => ({
    ChatRepo: {
        getObjByID: jest.fn(),
        addObj: jest.fn(),
        addMessage: jest.fn()
    }
}));

jest.mock("../../src/repositories/userRepo", () => ({
    UserRepo: {
        getObjByID: jest.fn(),
        addChatToHistory: jest.fn()
    }
}));

jest.mock("../../src/services/authenticator", () => ({
    Authenticator: {
        auth: jest.fn(),
        generateTempToken: jest.fn()
    }
}));

jest.mock("../../src/services/APIsHandler", () => ({
    APIsHandler: {
        queryKatanemoModel: jest.fn(),
        querySmolModel: jest.fn()
    }
}));

import { ChatRepo } from "../../src/repositories/chatRepo";
import { UserRepo } from "../../src/repositories/userRepo";
import { Authenticator } from "../../src/services/authenticator";
import { APIsHandler } from "../../src/services/APIsHandler";


const fakeObjectId = (id) => ({
    equals: (other) => other.toString() === id.toString(),
    toString: () => id
});


describe("ChatsHandler", () => {
    let userID = '8f3c9a12b7e4d5c6f1a2b3c4'
    let chatID = '8f3c9a12b7e4d5c6f1a2b3c5'

    beforeEach(() => jest.clearAllMocks());

    describe("fetchChat", () => {

        it("should fetch a chat successfully", async () => {

            jest.spyOn(Authenticator, "auth")
                .mockResolvedValue({ userID: userID });

            jest.spyOn(UserRepo, "getObjByID")
                .mockResolvedValue({
                    chats: [{ id: fakeObjectId(chatID) }]
                });

            jest.spyOn(ChatRepo, "getObjByID")
                .mockResolvedValue({ id: chatID, title: "Chat" });

            const result = await ChatsHandler.fetchChat("tok", chatID);

            expect(result).toEqual([
                { id: chatID, title: "Chat" },
                200
            ]);
        });


        it("should fail when auth returns null", async () => {

            jest.spyOn(Authenticator, "auth")
                .mockResolvedValue(null);

            const result = await ChatsHandler.fetchChat("t", "id");
            expect(result).toEqual([false, 400]);
        });


        it("should fail when user doesn't own chat", async () => {

            jest.spyOn(Authenticator, "auth")
                .mockResolvedValue({ userID: userID });

            jest.spyOn(UserRepo, "getObjByID")
                .mockResolvedValue({
                    chats: [{
                        id: new ObjectId('8f3c9a12b7e4d5c6f1a2b3c0')
                    }]
                });

            const result = await ChatsHandler.fetchChat("tok", chatID);
            expect(result).toEqual([false, 401]);
        });
    });


    describe("sendMessage", () => {

        it("should create a new chat (guest)", async () => {

            jest.spyOn(Authenticator, "auth").mockResolvedValue(null);

            jest.spyOn(APIsHandler, "queryKatanemoModel")
                .mockResolvedValueOnce("katanemo")
                .mockResolvedValueOnce("Chat Title");

            jest.spyOn(APIsHandler, "querySmolModel")
                .mockResolvedValue("smol");

            jest.spyOn(ChatRepo, "addObj")
                .mockResolvedValue("newChatID");

            jest.spyOn(Authenticator, "generateTempToken")
                .mockResolvedValue("temp123");

            const result = await ChatsHandler.sendMessage("hello", null, null);

            expect(result).toEqual([
                "katanemo",
                "smol",
                "temp123",
                "newChatID",
                201
            ]);
        });


        it("should append message to existing chat", async () => {

            jest.spyOn(Authenticator, "auth")
                .mockResolvedValue({ userID: "u1" });

            jest.spyOn(ChatRepo, "getObjByID")
                .mockResolvedValue({
                    messages_katanemo_model: [],
                    messages_smol_model: []
                });

            jest.spyOn(APIsHandler, "queryKatanemoModel")
                .mockResolvedValue("katRes");

            jest.spyOn(APIsHandler, "querySmolModel")
                .mockResolvedValue("smolRes");

            jest.spyOn(ChatRepo, "addMessage")
                .mockResolvedValue(true);

            const result = await ChatsHandler.sendMessage("msg", "tokenABC", "chat1");

            expect(result).toEqual([
                "katRes",
                "smolRes",
                "tokenABC",
                "chat1",
                201
            ]);
        });


        it("should fail when model returns null", async () => {

            jest.spyOn(APIsHandler, "queryKatanemoModel")
                .mockResolvedValue(null);

            jest.spyOn(APIsHandler, "querySmolModel")
                .mockResolvedValue(null);

            const result = await ChatsHandler.sendMessage("m", null, null);

            expect(result).toEqual([false, false, false, false, 500]);
        });
    });
});

