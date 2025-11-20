import { UserStateHandler } from "../../src/services/userStateHandler";
import { ChatsHandler } from "../../src/services/chatsHandler";
import { jest } from '@jest/globals';
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

jest.mock("../../src/services/chatsHandler", () => ({
    ChatsHandler: {
        bindChatToUser: jest.fn()
    }
}));

jest.mock("../../src/repositories/userRepo", () => ({
    UserRepo: {
        addObj: jest.fn(),
        deleteObj: jest.fn(),
        getObjByFIlters: jest.fn(),
        addChatToHistory: jest.fn()
    }
}));

jest.mock("../../src/repositories/tokenRepo", () => ({
    TokenRepo: {
        getObjByFIlters: jest.fn()
    }
}));

jest.mock("../../src/services/authenticator", () => ({
    Authenticator: {
        auth: jest.fn(),
        generateUserToken: jest.fn(),
        revokeToken: jest.fn()
    }
}));

import { UserRepo } from "../../src/repositories/userRepo";
import { TokenRepo } from "../../src/repositories/tokenRepo";
import { Authenticator } from "../../src/services/authenticator";

describe("UserStateHandler", () => {

    beforeEach(() => jest.clearAllMocks());

    const PEPPER = process.env.PASS_PEPPER
    let chatID = '8f3c9a12b7e4d5c6f1a2b3c5'
    let userID = '8f3c9a12b7e4d5c6f1a2b3c4'

    const hash = (pass) =>
        crypto.createHash("sha256").update(pass + PEPPER).digest("hex");

    describe("signUp", () => {

        it("should sign up a new user WITHOUT guest token", async () => {

            jest.spyOn(UserRepo, "addObj").mockResolvedValue("newUser123");
            jest.spyOn(Authenticator, "generateUserToken").mockResolvedValue("token123");

            const result = await UserStateHandler.signUp("email@test.com", "pass", null);

            expect(result).toEqual([expect.any(String), 201]);
        });


        it("should sign up a new user WITH guest token (chat binding)", async () => {

            jest.spyOn(Authenticator, "auth").mockResolvedValue({
                isGuest: true,
                chatID: chatID,
                chatTitle: "My Chat"
            });

            jest.spyOn(UserRepo, "addObj").mockResolvedValue("newUser1");
            jest.spyOn(Authenticator, "generateUserToken").mockResolvedValue("tokABC");

            const result = await UserStateHandler.signUp("a@a.com", "123", "guestTok");

            expect(result).toEqual([expect.any(String), 201]);
        });


        it("should return 500 if creating user fails", async () => {

            jest.spyOn(UserRepo, "addObj").mockResolvedValue(false);

            const result = await UserStateHandler.signUp("x", "y", null);

            expect(result).toEqual([false, 500]);
        });


        it("should delete user & return 500 if token generation fails", async () => {

            jest.spyOn(UserRepo, "addObj").mockResolvedValue("u999");
            jest.spyOn(Authenticator, "generateUserToken").mockResolvedValue(false);
            jest.spyOn(UserRepo, "deleteObj").mockResolvedValue(true);

            const result = await UserStateHandler.signUp("z", "zzz", null);

            expect(result).toEqual([false, 500]);
        });


        it("should reject invalid guest token", async () => {

            jest.spyOn(Authenticator, "auth").mockResolvedValue(false);

            const result = await UserStateHandler.signUp("x", "y", "badToken");

            expect(result).toEqual([false, 400]);
        });
    });


    describe("logIn", () => {

        const dbUser = [{
            _id: userID,
            email: "a@a.com",
            pass_hash: hash("pass"),
            chats: [{ id: "c1", title: "Chat1" }]
        }];

        it("should log in successfully without guest token", async () => {
            jest.spyOn(UserRepo, "getObjByFIlters").mockResolvedValue(dbUser);
            jest.spyOn(TokenRepo, "getObjByFIlters").mockResolvedValue(null);
            jest.spyOn(Authenticator, "generateUserToken").mockResolvedValue("tok123");

            const result = await UserStateHandler.logIn("a@a.com", "pass", null);

            expect(result).toEqual(["tok123", dbUser[0].chats, 200]);
        });


        it("should reject invalid guest token", async () => {
            jest.spyOn(Authenticator, "auth").mockResolvedValue(null);

            const result = await UserStateHandler.logIn("x", "y", "badTok");

            expect(result).toEqual([false, [], 400]);
        });


        it("should reject login with BAD credentials", async () => {
            jest.spyOn(UserRepo, "getObjByFIlters").mockResolvedValue(dbUser);

            const result = await UserStateHandler.logIn("a@a.com", "wrong", null);

            expect(result).toEqual([false, [], 401]);
        });


        it("should reject when no user found", async () => {
            jest.spyOn(UserRepo, "getObjByFIlters").mockResolvedValue(null);

            const result = await UserStateHandler.logIn("x", "y", null);
            expect(result).toEqual([false, [], 401]);
        });


        it("should revoke old token before issuing a new one", async () => {
            jest.spyOn(UserRepo, "getObjByFIlters").mockResolvedValue(dbUser);
            jest.spyOn(TokenRepo, "getObjByFIlters").mockResolvedValue([
                { token: "oldTok" }
            ]);

            const mockRevoke = jest.spyOn(Authenticator, "revokeToken")
                .mockResolvedValue(true);

            jest.spyOn(Authenticator, "generateUserToken")
                .mockResolvedValue("newTok");

            const result = await UserStateHandler.logIn("a@a.com", "pass", null);

            expect(mockRevoke).toHaveBeenCalledWith({ "hashedToken": "oldTok" });
            expect(result).toEqual(["newTok", dbUser[0].chats, 200]);
        });


        it("should fail if new token fails", async () => {
            jest.spyOn(UserRepo, "getObjByFIlters").mockResolvedValue(dbUser);
            jest.spyOn(TokenRepo, "getObjByFIlters").mockResolvedValue(null);
            jest.spyOn(Authenticator, "generateUserToken").mockResolvedValue(null);

            const result = await UserStateHandler.logIn("a@a.com", "pass", null);
            expect(result).toEqual([false, [], 500]);
        });


        it("should bind guest chat on login", async () => {
            jest.spyOn(Authenticator, "auth").mockResolvedValue({
                chatID: chatID,
                chatTitle: "My Chat Title",
                isGuest: true,
                created: new Date()
            });

            jest.spyOn(UserRepo, "getObjByFIlters").mockResolvedValue(dbUser);
            jest.spyOn(TokenRepo, "getObjByFIlters").mockResolvedValue(null);
            jest.spyOn(Authenticator, "generateUserToken").mockResolvedValue("userTok");

            const mockBind = jest
                .spyOn(ChatsHandler, "bindChatToUser")
                .mockResolvedValue([true, null]);

            const result = await UserStateHandler.logIn(
                "a@a.com",
                "pass",
                "guestTok"
            );

            expect(mockBind).toHaveBeenCalledWith(
                chatID,
                dbUser[0]._id,
                "My Chat Title"
            );

            expect(result).toEqual(["userTok", dbUser[0].chats, 200]);
        });
    });


    describe("logOut", () => {

        it("should log out successfully", async () => {

            jest.spyOn(Authenticator, "revokeToken").mockResolvedValue(true);

            const result = await UserStateHandler.logOut("tok");
            expect(result).toEqual([true, 204]);
        });

        it("should fail logout if revoke fails", async () => {

            jest.spyOn(Authenticator, "revokeToken").mockResolvedValue(false);

            const result = await UserStateHandler.logOut("tok");
            expect(result).toEqual([false, 500]);
        });
    });
});
