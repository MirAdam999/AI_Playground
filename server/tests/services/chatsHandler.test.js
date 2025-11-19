import { jest } from '@jest/globals';
import { ChatsHandler } from "../../src/services/chatsHandler";
import { ObjectId } from "mongodb";

jest.mock("../../src/repositories/chatRepo", () => ({
    ChatRepo: {
        getObjByID: jest.fn(),
        addObj: jest.fn(),
        addMessage: jest.fn(),
        getObjByFIlters: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            toArray: jest.fn()
        }),
        deleteManyObjs: jest.fn()
    }
}));

jest.mock("../../src/repositories/userRepo", () => ({
    UserRepo: {
        getObjByID: jest.fn(),
        addChatToHistory: jest.fn(),
        updateObj: jest.fn()
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

    let userID = "8f3c9a12b7e4d5c6f1a2b3c4";
    let chatID = "8f3c9a12b7e4d5c6f1a2b3c5";

    beforeEach(() => jest.clearAllMocks());


    describe("fetchChat", () => {

        it("fetches chat successfully", async () => {

            jest.spyOn(Authenticator, "auth").mockResolvedValue({ userID });

            jest.spyOn(UserRepo, "getObjByID").mockResolvedValue({
                chats: [{ id: fakeObjectId(chatID) }]
            });

            jest.spyOn(ChatRepo, "getObjByID").mockResolvedValue({
                id: chatID,
                title: "Chat"
            });

            const result = await ChatsHandler.fetchChat("tok", chatID);

            expect(result).toEqual([
                { id: chatID, title: "Chat" },
                200
            ]);
        });

        it("fails when auth returns null", async () => {
            jest.spyOn(Authenticator, "auth").mockResolvedValue(null);

            const result = await ChatsHandler.fetchChat("t", "id");
            expect(result).toEqual([false, 400]);
        });

        it("fails when user does not own chat", async () => {

            jest.spyOn(Authenticator, "auth").mockResolvedValue({ userID });

            jest.spyOn(UserRepo, "getObjByID").mockResolvedValue({
                chats: [{ id: fakeObjectId("otherID123") }]
            });

            const result = await ChatsHandler.fetchChat("tok", chatID);
            expect(result).toEqual([false, 401]);
        });

    });


    describe("sendMessage", () => {

        it("creates new chat (guest)", async () => {

            jest.spyOn(Authenticator, "auth").mockResolvedValue(null);

            jest.spyOn(APIsHandler, "queryKatanemoModel")
                .mockResolvedValueOnce("katanemo")
                .mockResolvedValueOnce("Chat Title");

            jest.spyOn(APIsHandler, "querySmolModel")
                .mockResolvedValue("smol");

            // New chat creation
            jest.spyOn(ChatRepo, "addObj")
                .mockResolvedValue("newChatId");

            // No chat binding (guest)
            jest.spyOn(UserRepo, "addChatToHistory")
                .mockResolvedValue(true);

            jest.spyOn(ChatRepo, "addMessage")
                .mockResolvedValue(true);

            jest.spyOn(Authenticator, "generateTempToken")
                .mockResolvedValue("temp123");

            const result = await ChatsHandler.sendMessage("hello", null, null);

            expect(result).toEqual([
                "katanemo",
                "smol",
                "temp123",
                "newChatId",
                "Chat Title",
                null,
                201
            ]);
        });



        it("appends message to existing chat", async () => {

            jest.spyOn(Authenticator, "auth")
                .mockResolvedValue({ userID: "u1" });

            jest.spyOn(ChatRepo, "getObjByID")
                .mockResolvedValue({
                    title: "Chat Title",
                    messages_katanemo_model: [],
                    messages_smol_model: [],
                    length: 0
                });

            jest.spyOn(APIsHandler, "queryKatanemoModel")
                .mockResolvedValue("katRes");

            jest.spyOn(APIsHandler, "querySmolModel")
                .mockResolvedValue("smolRes");

            jest.spyOn(ChatRepo, "addMessage")
                .mockResolvedValue(true);

            const result = await ChatsHandler.sendMessage("msg", "tokenXYZ", "chat1");

            expect(result).toEqual([
                "katRes",
                "smolRes",
                "tokenXYZ",
                "chat1",
                "Chat Title",
                null,
                201
            ]);
        });



        it("fails when either model returns null", async () => {

            jest.spyOn(APIsHandler, "queryKatanemoModel")
                .mockResolvedValue(null);

            jest.spyOn(APIsHandler, "querySmolModel")
                .mockResolvedValue(null);

            const result = await ChatsHandler.sendMessage("m", null, null);

            expect(result).toEqual([
                false,
                false,
                false,
                false,
                false,
                null,
                500
            ]);
        });

    });


    describe("_createChat", () => {

        it("creates chat and binds to user", async () => {

            jest.spyOn(ChatRepo, "addObj")
                .mockResolvedValue("newID");

            jest.spyOn(UserRepo, "addChatToHistory")
                .mockResolvedValue(true);

            jest.spyOn(ChatRepo, "getObjByFIlters")
                .mockResolvedValue([]);

            const result = await ChatsHandler._createChat(userID, "Title");

            expect(result).toEqual(["newID", null]);
        });


        it("fails if addObj fails", async () => {

            jest.spyOn(ChatRepo, "addObj")
                .mockResolvedValue(false);

            const result = await ChatsHandler._createChat(userID, "Title");

            expect(result).toEqual([false, null]);
        });

    });



    describe("bindChatToUser", () => {

        it("binds chat and no cleanup needed", async () => {

            jest.spyOn(UserRepo, "addChatToHistory")
                .mockResolvedValue(true);

            jest.spyOn(ChatRepo, "getObjByFIlters")
                .mockResolvedValue([]);

            const result = await ChatsHandler.bindChatToUser(chatID, userID, "title");

            expect(result).toEqual([true, null]);
        });


        it("returns warning when user reaches max chats", async () => {

            const max = 30;

            jest.spyOn(UserRepo, "addChatToHistory").mockResolvedValue(true);

            const fakeChats = Array(max).fill({ createdAt: new Date() });

            jest.spyOn(ChatRepo, "getObjByFIlters")
                .mockResolvedValue(fakeChats);

            const result = await ChatsHandler.bindChatToUser(chatID, userID, "title");

            expect(result).toEqual([true, "Max convos warning"]);
        });

    });

});
