import { jest } from '@jest/globals';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

// ---- MOCKING SECTION ----
await jest.unstable_mockModule('../../src/repositories/tokenRepo.js', () => ({
    TokenRepo: {
        addObj: jest.fn(),
        getObjByFIlters: jest.fn(),
        deleteObj: jest.fn(),
    }
}));

const { TokenRepo } = await import('../../src/repositories/tokenRepo.js');
const { Authenticator } = await import('../../src/services/authenticator.js');


describe('Authenticator', () => {
    let token_pepper = process.env.TOKEN_PEPPER
    let testUserToken
    let testTempToken

    describe('generateTempToken', () => {
        it('should create a token for guest', () => {
            testTempToken = Authenticator.generateTempToken('8f3c9a12b7e4d5c6f1a2b3c4');
            expect(testTempToken).toString();
        });

        it('should return false', () => {
            const token = Authenticator.generateTempToken();
            expect(token).toBe(false);
        });
    });

    describe('generateUserToken', () => {
        it('should generate and save user token', async () => {
            const userID = '8f3c9a12b7e4d5c6f1a2b3c4';
            jest
                .spyOn(TokenRepo, 'addObj')
                .mockResolvedValue(true);

            testUserToken = await Authenticator.generateUserToken(userID);
            expect(testUserToken).toString()
        });

        it('should return false if saving token fails', async () => {
            const userID = '8f3c9a12b7e4d5c6f1a2b3c4';
            TokenRepo.addObj.mockResolvedValue(false);

            const token = await Authenticator.generateUserToken(userID);

            expect(token).toBe(false);
        });
    });

    describe('_decodeToken', () => {
        it('should decode a valid temp token', () => {
            const result = Authenticator._decodeToken(testTempToken);
            expect(result).toEqual(expect.objectContaining({
                chatID: '8f3c9a12b7e4d5c6f1a2b3c4',
                isGuest: true,
                created: expect.anything()
            }));
        });

        it('should decode a valid user token', () => {
            const result = Authenticator._decodeToken(testUserToken);
            expect(result).toEqual(expect.objectContaining({
                userID: '8f3c9a12b7e4d5c6f1a2b3c4',
                isGuest: false,
                created: expect.anything()
            }));
        });

        it('should return false for invalid token', () => {
            const fake = 'dbjbgljgblfkgdf';
            const result = Authenticator._decodeToken(fake);
            expect(result).toBe(false);
        });
    });

    describe('auth', () => {
        it('should return false for invalid token', async () => {
            const result = await Authenticator.auth('bad_token');
            expect(result).toBe(false);
        });

        it('should return decoded token for guest', async () => {
            const result = await Authenticator.auth(testTempToken);
            expect(result).toEqual(expect.objectContaining({
                chatID: '8f3c9a12b7e4d5c6f1a2b3c4',
                isGuest: true,
                created: expect.anything()
            }));
        });

        it('should return decoded token for user if token matches DB', async () => {
            const storedToken = testUserToken
            const storedHashedToken = crypto
                .createHash('sha256')
                .update(storedToken + token_pepper)
                .digest('hex')

            jest
                .spyOn(TokenRepo, 'getObjByFIlters')
                .mockResolvedValue([{ 'token': storedHashedToken }]);
            const result = await Authenticator.auth(testUserToken);

            expect(result).toEqual(expect.objectContaining({
                userID: '8f3c9a12b7e4d5c6f1a2b3c4',
                isGuest: false,
                created: expect.anything()
            }));
        });

        it('should return false if user token does not match DB', async () => {
            const storedToken = testUserToken
            const storedHashedToken = crypto
                .createHash('sha256')
                .update(storedToken + token_pepper)
                .digest('hex')

            jest
                .spyOn(TokenRepo, 'addObj')
                .mockResolvedValue(storedHashedToken);

            const result = await Authenticator.auth('user_token');
            expect(result).toBe(false);
        });
    });

    describe('revokeToken', () => {
        it('should revoke a valid user token', async () => {
            const storedToken = testUserToken
            const storedHashedToken = crypto
                .createHash('sha256')
                .update(storedToken + token_pepper)
                .digest('hex')

            jest
                .spyOn(TokenRepo, 'getObjByFIlters')
                .mockResolvedValue([{ 'token': storedHashedToken }]);
            jest
                .spyOn(TokenRepo, 'deleteObj')
                .mockResolvedValue(true);

            const result = await Authenticator.revokeToken(testUserToken);
            expect(result).toBe(true);
        });

        it('should return false if token invalid', async () => {
            const result = await Authenticator.revokeToken('bad_token');
            expect(result).toBe(false);
        });

        it('should return false if DB token does not match', async () => {
            const storedToken = 'smthsmthsmth'
            const storedHashedToken = crypto
                .createHash('sha256')
                .update(storedToken + token_pepper)
                .digest('hex')

            jest
                .spyOn(TokenRepo, 'getObjByFIlters')
                .mockResolvedValue([{ 'token': storedHashedToken }]);

            const result = await Authenticator.revokeToken(testUserToken);
            expect(result).toBe(false);
        });

        it('should return false if delete fails', async () => {
            const storedToken = testUserToken
            const storedHashedToken = crypto
                .createHash('sha256')
                .update(storedToken + token_pepper)
                .digest('hex')

            jest
                .spyOn(TokenRepo, 'getObjByFIlters')
                .mockResolvedValue([{ 'token': storedHashedToken }]);
            jest
                .spyOn(TokenRepo, 'deleteObj')
                .mockResolvedValue(false);

            const result = await Authenticator.revokeToken(testUserToken);
            expect(result).toBe(false);
        });
    });

});
