
import { jest } from '@jest/globals';
import { Authenticator } from '../../src/services/authenticator.js';
import { TokenRepo } from '../../src/repositories/tokenRepo.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

// --- Mock JWT ---
jwt.verify = jest.fn();
jwt.sign = jest.fn();

// --- Mock crypto ---
crypto.createHash = jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'hashed_token'), // always returns 'hashed_token'
}));

// --- Mock TokenRepo static methods ---
beforeEach(() => {
    TokenRepo.addObj = jest.fn();
    TokenRepo.getObjByFIlters = jest.fn();
    TokenRepo.deleteObj = jest.fn();
    jest.clearAllMocks();
});

// --- Mock environment variables ---
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.TOKEN_PEPPER = 'test_pepper';

describe('Authenticator', () => {

    describe('_decodeToken', () => {
        it('should decode a valid token', () => {
            const payload = { userID: new ObjectId().toString() };
            jwt.verify.mockReturnValueOnce(payload);

            const result = Authenticator._decodeToken('valid_token');

            expect(result).toEqual(payload);
            expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
        });

        it('should return false for invalid token', () => {
            jwt.verify.mockImplementationOnce(() => { throw new Error('invalid token'); });

            const result = Authenticator._decodeToken('bad_token');

            expect(result).toBe(false);
        });
    });

    describe('generateTempToken', () => {
        it('should create a token for guest', () => {
            jwt.sign.mockReturnValueOnce('temp_jwt');

            const token = Authenticator.generateTempToken('abc123');

            expect(token).toBe('temp_jwt');
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({ chatID: 'abc123', isGuest: true }),
                process.env.JWT_SECRET
            );
        });
    });

    describe('generateUserToken', () => {
        it('should generate and save user token', async () => {
            const userID = new ObjectId().toString();
            jwt.sign.mockReturnValueOnce('user_jwt');
            TokenRepo.addObj.mockResolvedValue(true);

            const token = await Authenticator.generateUserToken(userID);

            expect(token).toBe('user_jwt'); // returns JWT
            expect(crypto.createHash).toHaveBeenCalled();
            expect(TokenRepo.addObj).toHaveBeenCalledWith({
                token: 'hashed_token', // matches crypto mock
                userID: expect.any(ObjectId),
            });
        });

        it('should return false if saving token fails', async () => {
            const userID = new ObjectId().toString();
            jwt.sign.mockReturnValueOnce('user_jwt');
            TokenRepo.addObj.mockResolvedValue(false);

            const token = await Authenticator.generateUserToken(userID);

            expect(token).toBe(false);
        });
    });

    describe('auth', () => {
        it('should return false for invalid token', async () => {
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(false);

            const result = await Authenticator.auth('bad_token');
            expect(result).toBe(false);
        });

        it('should return decoded token for guest', async () => {
            const decoded = { chatID: 'abc', isGuest: true };
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(decoded);

            const result = await Authenticator.auth('guest_token');
            expect(result).toEqual(decoded);
        });

        it('should return decoded token for user if token matches DB', async () => {
            const userID = new ObjectId().toString();
            const decoded = { userID, isGuest: false };
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(decoded);
            TokenRepo.getObjByFIlters.mockResolvedValue([{ token: 'hashed_token' }]); // matches crypto

            const result = await Authenticator.auth('user_token');
            expect(result).toEqual(decoded);
        });

        it('should return false if user token does not match DB', async () => {
            const userID = new ObjectId().toString();
            const decoded = { userID, isGuest: false };
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(decoded);
            TokenRepo.getObjByFIlters.mockResolvedValue([{ token: 'other_hash' }]); // mismatch

            const result = await Authenticator.auth('user_token');
            expect(result).toBe(false);
        });
    });

    describe('revokeToken', () => {
        it('should revoke a valid user token', async () => {
            const userID = new ObjectId().toString();
            const decoded = { userID };
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(decoded);
            TokenRepo.getObjByFIlters.mockResolvedValue([{ _id: 'id1', token: 'hashed_token' }]); // matches crypto
            TokenRepo.deleteObj.mockResolvedValue(true);

            const result = await Authenticator.revokeToken('token');
            expect(result).toBe(true);
        });

        it('should return false if token invalid', async () => {
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(false);

            const result = await Authenticator.revokeToken('bad_token');
            expect(result).toBe(false);
        });

        it('should return false if DB token does not match', async () => {
            const userID = new ObjectId().toString();
            const decoded = { userID };
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(decoded);
            TokenRepo.getObjByFIlters.mockResolvedValue([{ _id: 'id1', token: 'other_hash' }]); // mismatch

            const result = await Authenticator.revokeToken('token');
            expect(result).toBe(false);
        });

        it('should return false if delete fails', async () => {
            const userID = new ObjectId().toString();
            const decoded = { userID };
            jest.spyOn(Authenticator, '_decodeToken').mockReturnValue(decoded);
            TokenRepo.getObjByFIlters.mockResolvedValue([{ _id: 'id1', token: 'hashed_token' }]);
            TokenRepo.deleteObj.mockResolvedValue(false); // deletion fails

            const result = await Authenticator.revokeToken('token');
            expect(result).toBe(false);
        });
    });

});
