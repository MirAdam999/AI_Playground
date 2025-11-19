export class Limits {
    static secsBetweenRequests = 3 // implemented in app.js: limiter
    static charsPerMsg = 1000 // implemented in chatController.js: sendMessage()
    static msgsInConvoMax = 100 // implemented in chatRepo.js: ChatRepo.addMessage(), and in chatsHandler.js: ChatsHandler.sendMessage() (for warning purposes)
    static maxConvosStoredPerUser = 30 // implemented in chatsHandler.js: ChatsHandler.bindChatToUser()
    static daysConvosStored = 30 // implemented in cleanup.js: Cleanup.ensureChatTTL()
}