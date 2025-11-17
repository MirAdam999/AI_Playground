import { APIsHandler } from '../../src/services/APIsHandler';

describe('APIsHandler', () => {

    describe('queryKatanemoModel', () => {
        it('should fetch a response w no context', async () => {
            const context = []
            const userMsg = 'Hello'
            const response = await APIsHandler.queryKatanemoModel(userMsg, context)
            expect(response).toEqual(expect.any(String))
        })

        it('should fetch a response with context', async () => {
            const context = [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Hi I am Katanemo'
                }
            ]
            const userMsg = 'How are you?'
            const response = await APIsHandler.queryKatanemoModel(userMsg, context)
            expect(response).toEqual(expect.any(String))
        })

        it('should return false for incorrect context format, causing err in API response', async () => {
            const userMsg = 'How are you?'
            const context = ['this is bad context format']
            const response = await APIsHandler.queryKatanemoModel(userMsg, context)
            expect(response).toBe(false);
        })
    })

    describe('querySmolModel', () => {
        it('should fetch a response w no context', async () => {
            const context = []
            const userMsg = 'Hello'
            const response = await APIsHandler.querySmolModel(userMsg, context)
            expect(response).toEqual(expect.any(String))
        })

        it('should fetch a response with context', async () => {
            const context = [
                {
                    role: 'user',
                    content: 'Hello'
                },
                {
                    role: 'assistant',
                    content: 'Hi I am Katanemo'
                }
            ]
            const userMsg = 'How are you?'
            const response = await APIsHandler.querySmolModel(userMsg, context)
            expect(response).toEqual(expect.any(String))
        })

        it('should return false for incorrect context format, causing err in API response', async () => {
            const userMsg = 'How are you?'
            const context = ['this is bad context format']
            const response = await APIsHandler.querySmolModel(userMsg, context)
            expect(response).toBe(false);
        })
    })

})
