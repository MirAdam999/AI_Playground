import { jest } from '@jest/globals';
jest.mock("../../src/services/userStateHandler");

import { signUp, logIn, logOut } from "../../src/controllers/userStateController";
import { UserStateHandler } from "../../src/services/userStateHandler";

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("UserStateController", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("signUp", () => {

        it("should return 400 for invalid email", async () => {
            const req = {
                body: { email: "bademail", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            await signUp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid email format" });
        });

        it("should return 400 for invalid password", async () => {
            const req = {
                body: { email: "test@test.com", pass: "weak" },
                headers: {}
            };
            const res = mockResponse();

            await signUp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Password must be 8–12 chars, and contain at least one lowercase, uppercase, and a number"
            });
        });

        it("should return 200 and userToken on success", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "signUp")
                .mockResolvedValue(["token123", 200]);

            await signUp(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ userToken: "token123" });
        });

        it("should return server err when service returns null", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "signUp")
                .mockResolvedValue([null, 500]);

            await signUp(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "server err" });
        });

        it("should return 500 when service throws error", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "signUp")
                .mockRejectedValue(new Error("Boom"));

            await signUp(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Boom" });
        });

    });

    describe("logIn", () => {

        it("should return 400 for invalid email format", async () => {
            const req = {
                body: { email: "bad", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            await logIn(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Wrong Email or Password" });
        });

        it("should return 400 for invalid password format", async () => {
            const req = {
                body: { email: "a@a.com", pass: "wrong" },
                headers: {}
            };
            const res = mockResponse();

            await logIn(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Wrong Email or Password" });
        });

        it("should return token and chatHistory on success", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logIn")
                .mockResolvedValue(["token123", [{ id: 1 }], 200]);

            await logIn(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                userToken: "token123",
                chatHistory: [{ id: 1 }]
            });
        });

        it("should return 401 for wrong credentials", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logIn")
                .mockResolvedValue([null, null, 401]);

            await logIn(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: "Wrong Email or Password" });
        });

        it("should return server err when service fails", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logIn")
                .mockResolvedValue([null, null, 500]);

            await logIn(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "server err" });
        });

        it("should return 500 when service throws error", async () => {
            const req = {
                body: { email: "a@a.com", pass: "Aa123456" },
                headers: {}
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logIn")
                .mockRejectedValue(new Error("Boom"));

            await logIn(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Boom" });
        });

    });

    describe("logOut", () => {

        it("should return 400 if token missing", async () => {
            const req = {
                headers: {}
            };
            const res = mockResponse();

            await logOut(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Bad Request" });
        });

        it("should return loggedOut true on success", async () => {
            const req = {
                headers: { [process.env.TOKEN_HEADER_KEY]: "token123" }
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logOut")
                .mockResolvedValue([true, 200]);

            await logOut(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ loggedOut: true });
        });

        it("should return server err if logOut fails", async () => {
            const req = {
                headers: { [process.env.TOKEN_HEADER_KEY]: "token123" }
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logOut")
                .mockResolvedValue([false, 500]);

            await logOut(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "server err" });
        });

        it("should return 500 if logOut throws error", async () => {
            const req = {
                headers: { [process.env.TOKEN_HEADER_KEY]: "token123" }
            };
            const res = mockResponse();

            jest.spyOn(UserStateHandler, "logOut")
                .mockRejectedValue(new Error("Boom"));

            await logOut(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Boom" });
        });

    });
});
