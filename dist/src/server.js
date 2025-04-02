"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptMessage = exports.encryptMessage = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.get('/', (_req, res) => {
    res.status(200).send('Socket server is running');
});
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || 'default-key-change-in-production-environment!';
const encryptMessage = (text) => {
    try {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};
exports.encryptMessage = encryptMessage;
const decryptMessage = (text) => {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    catch (error) {
        console.error('Decryption error:', error);
        return text;
    }
};
exports.decryptMessage = decryptMessage;
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
const activeUsers = new Map();
const userTypingStatus = new Map();
const undeliveredMessages = new Map();
setInterval(() => {
    const now = new Date();
    Array.from(activeUsers.entries()).forEach(([userId, session]) => {
        if (session.status === 'online' &&
            now.getTime() - session.lastActivity.getTime() > 5 * 60 * 1000) {
            session.status = 'away';
            activeUsers.set(userId, session);
            notifyUserStatusChange(userId, 'away');
        }
    });
}, 60 * 1000);
const notifyUserStatusChange = async (userId, status, lastSeen) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: true
            }
        });
        for (const conversation of conversations) {
            const otherMembers = conversation.members.filter(m => m.userId !== userId);
            for (const member of otherMembers) {
                const memberSession = activeUsers.get(member.userId);
                if (memberSession && io.sockets.sockets.has(memberSession.socketId)) {
                    io.to(memberSession.socketId).emit('userStatusChange', {
                        userId,
                        status,
                        lastSeen: lastSeen || new Date()
                    });
                }
            }
        }
    }
    catch (error) {
        console.error('Error notifying status change:', error);
    }
};
const deliverUndeliveredMessages = async (userId, socket) => {
    try {
        console.log(`Checking for undelivered messages for user ${userId}`);
        const userMessages = undeliveredMessages.get(userId) || [];
        if (userMessages.length > 0) {
            console.log(`Found ${userMessages.length} undelivered messages in memory for user ${userId}`);
            for (const item of userMessages) {
                socket.emit('newMessage', item.message);
                console.log(`Delivered message ${item.messageId} from memory to user ${userId}`);
                const senderSession = activeUsers.get(item.senderId);
                if (senderSession && io.sockets.sockets.has(senderSession.socketId)) {
                    io.to(senderSession.socketId).emit('messageDelivered', {
                        messageId: item.messageId,
                        conversationId: item.conversationId
                    });
                    console.log(`Notified sender ${item.senderId} about delivery of message ${item.messageId}`);
                }
            }
            undeliveredMessages.delete(userId);
            console.log(`Cleared memory cache for delivered messages to user ${userId}`);
        }
        else {
            console.log(`No in-memory undelivered messages for user ${userId}`);
        }
        const userConversations = await prisma.conversationMember.findMany({
            where: {
                userId: userId
            },
            select: {
                conversationId: true,
                lastReadAt: true
            }
        });
        console.log(`User ${userId} has ${userConversations.length} conversations`);
        let allUnreadMessages = [];
        for (const convo of userConversations) {
            try {
                if (convo.lastReadAt) {
                    console.log(`Checking for messages in conversation ${convo.conversationId} after ${convo.lastReadAt}`);
                    const messages = await prisma.message.findMany({
                        where: {
                            conversationId: convo.conversationId,
                            createdAt: {
                                gt: convo.lastReadAt
                            },
                            senderId: {
                                not: userId
                            }
                        },
                        include: {
                            sender: true
                        },
                        orderBy: {
                            createdAt: 'asc'
                        }
                    });
                    console.log(`Found ${messages.length} unread messages in conversation ${convo.conversationId}`);
                    allUnreadMessages = [...allUnreadMessages, ...messages];
                }
                else {
                    console.log(`No lastReadAt for user ${userId} in conversation ${convo.conversationId}, fetching all messages`);
                    const messages = await prisma.message.findMany({
                        where: {
                            conversationId: convo.conversationId,
                            senderId: {
                                not: userId
                            }
                        },
                        include: {
                            sender: true
                        },
                        orderBy: {
                            createdAt: 'asc'
                        }
                    });
                    console.log(`Found ${messages.length} total messages in conversation ${convo.conversationId}`);
                    allUnreadMessages = [...allUnreadMessages, ...messages];
                }
            }
            catch (err) {
                console.error(`Error fetching messages for conversation ${convo.conversationId}:`, err);
            }
        }
        if (allUnreadMessages.length > 0) {
            console.log(`Delivering ${allUnreadMessages.length} database unread messages to user ${userId}`);
            for (const dbMessage of allUnreadMessages) {
                try {
                    const decryptedContent = decryptMessage(dbMessage.content);
                    const messageToSend = Object.assign(Object.assign({}, dbMessage), { content: decryptedContent });
                    socket.emit('newMessage', messageToSend);
                    console.log(`Delivered database message ${dbMessage.id} to user ${userId}`);
                    const senderSession = activeUsers.get(dbMessage.senderId);
                    if (senderSession && io.sockets.sockets.has(senderSession.socketId)) {
                        io.to(senderSession.socketId).emit('messageDelivered', {
                            messageId: dbMessage.id,
                            conversationId: dbMessage.conversationId
                        });
                        console.log(`Notified sender ${dbMessage.senderId} about delivery of message ${dbMessage.id}`);
                    }
                }
                catch (err) {
                    console.error(`Error delivering message ${dbMessage.id}:`, err);
                }
            }
        }
        else {
            console.log(`No database unread messages for user ${userId}`);
        }
    }
    catch (error) {
        console.error('Error delivering undelivered messages:', error);
    }
};
io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);
    let currentUserId = null;
    socket.on('setUserId', async (userId) => {
        currentUserId = userId;
        socket.data.userId = userId;
        activeUsers.set(userId, {
            socketId: socket.id,
            lastActivity: new Date(),
            status: 'online'
        });
        console.log(`User ${userId} connected with socket ${socket.id}`);
        notifyUserStatusChange(userId, 'online');
        console.log(`Checking for undelivered messages for user ${userId}...`);
        await deliverUndeliveredMessages(userId, socket);
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    lastSeen: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error updating last seen:', error);
        }
    });
    const updateActivity = () => {
        if (currentUserId) {
            const session = activeUsers.get(currentUserId);
            if (session) {
                session.lastActivity = new Date();
                session.status = 'online';
                activeUsers.set(currentUserId, session);
            }
        }
    };
    socket.on('newMessage', async ({ message, conversationId, recipientId }) => {
        updateActivity();
        try {
            console.log(`Socket server: Received new message in conversation ${conversationId} for recipient ${recipientId} from ${message.senderId}`);
            console.log(`Message ID: ${message.id}, content length: ${message.content.length}`);
            if (!message.content || !message.senderId || !conversationId || !recipientId) {
                console.error('Socket server: Missing required message data');
                console.error('Message data received:', JSON.stringify({
                    hasContent: !!message.content,
                    hasSenderId: !!message.senderId,
                    hasConversationId: !!conversationId,
                    hasRecipientId: !!recipientId
                }));
                socket.emit('messageError', {
                    messageId: message.id,
                    error: 'Missing required message data'
                });
                return;
            }
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: { members: true }
            });
            if (!conversation) {
                console.error(`Socket server: Conversation ${conversationId} not found`);
                socket.emit('messageError', {
                    messageId: message.id,
                    error: 'Conversation not found'
                });
                return;
            }
            const isSenderMember = conversation.members.some(m => m.userId === message.senderId);
            if (!isSenderMember) {
                console.error(`Socket server: Sender ${message.senderId} is not a member of conversation ${conversationId}`);
                socket.emit('messageError', {
                    messageId: message.id,
                    error: 'Sender is not a member of this conversation'
                });
                return;
            }
            const encryptedContent = encryptMessage(message.content);
            const savedMessage = await prisma.message.create({
                data: {
                    content: encryptedContent,
                    conversationId,
                    senderId: message.senderId
                },
                include: {
                    sender: true
                }
            });
            console.log(`Socket server: Message saved with ID ${savedMessage.id}`);
            await prisma.conversationMember.update({
                where: {
                    userId_conversationId: {
                        userId: message.senderId,
                        conversationId
                    }
                },
                data: {
                    lastReadAt: new Date()
                }
            });
            const messageToSend = Object.assign(Object.assign({}, savedMessage), { content: message.content });
            socket.emit('messageAck', {
                success: true,
                messageId: savedMessage.id,
                tempId: message.id
            });
            socket.emit('messageSent', {
                messageId: savedMessage.id,
                tempId: message.id,
                status: 'sent'
            });
            console.log(`Socket server: Message sent confirmation emitted for ${message.id} -> ${savedMessage.id}`);
            const recipientSession = activeUsers.get(recipientId);
            console.log(`Socket server: Recipient status - Active: ${!!recipientSession}, Socket ID: ${recipientSession === null || recipientSession === void 0 ? void 0 : recipientSession.socketId}`);
            if (recipientSession && io.sockets.sockets.has(recipientSession.socketId)) {
                console.log(`Socket server: Recipient ${recipientId} is online with socket ${recipientSession.socketId}, sending message`);
                io.to(recipientSession.socketId).emit('newMessage', messageToSend);
                socket.emit('messageDelivered', {
                    messageId: savedMessage.id,
                    conversationId
                });
                console.log(`Socket server: Delivered confirmation sent to sender for message ${savedMessage.id}`);
            }
            else {
                console.log(`Socket server: Recipient ${recipientId} is not online, storing message for later delivery`);
                const userMessages = undeliveredMessages.get(recipientId) || [];
                userMessages.push({
                    messageId: savedMessage.id,
                    senderId: message.senderId,
                    message: messageToSend,
                    conversationId,
                    createdAt: new Date()
                });
                undeliveredMessages.set(recipientId, userMessages);
                console.log(`Socket server: Message stored for offline recipient, undelivered count: ${userMessages.length}`);
            }
        }
        catch (error) {
            console.error('Socket server: Error saving message:', error);
            socket.emit('messageError', {
                messageId: message.id,
                error: 'Failed to save message'
            });
        }
    });
    socket.on('messageDelivered', async ({ messageId, conversationId, senderId }) => {
        updateActivity();
        try {
            console.log(`Socket server: Received messageDelivered for message ${messageId} in conversation ${conversationId}`);
            if (currentUserId && conversationId) {
                console.log(`Socket server: Updating lastReadAt for user ${currentUserId} in conversation ${conversationId}`);
                await prisma.conversationMember.update({
                    where: {
                        userId_conversationId: {
                            userId: currentUserId,
                            conversationId
                        }
                    },
                    data: {
                        lastReadAt: new Date()
                    }
                });
            }
            if (senderId) {
                console.log(`Socket server: Sending delivery confirmation to sender ${senderId}`);
                const senderSession = activeUsers.get(senderId);
                if (senderSession && io.sockets.sockets.has(senderSession.socketId)) {
                    io.to(senderSession.socketId).emit('messageDelivered', {
                        messageId,
                        conversationId
                    });
                    console.log(`Socket server: Sent messageDelivered event to socket ${senderSession.socketId}`);
                }
                else {
                    console.log(`Socket server: Sender ${senderId} is not online, can't send delivery confirmation`);
                }
            }
            else {
                console.log(`Socket server: Missing senderId in messageDelivered event`);
            }
        }
        catch (error) {
            console.error('Error updating message status:', error);
        }
    });
    socket.on('messageRead', async ({ messageId, conversationId, senderId }) => {
        updateActivity();
        try {
            console.log(`Socket server: Received messageRead for message ${messageId} in conversation ${conversationId}`);
            if (currentUserId && conversationId) {
                console.log(`Socket server: Updating lastReadAt for user ${currentUserId} in conversation ${conversationId}`);
                await prisma.conversationMember.update({
                    where: {
                        userId_conversationId: {
                            userId: currentUserId,
                            conversationId
                        }
                    },
                    data: {
                        lastReadAt: new Date()
                    }
                });
            }
            if (senderId) {
                console.log(`Socket server: Sending read confirmation to sender ${senderId}`);
                const senderSession = activeUsers.get(senderId);
                if (senderSession && io.sockets.sockets.has(senderSession.socketId)) {
                    io.to(senderSession.socketId).emit('messageRead', { messageId });
                    console.log(`Socket server: Sent messageRead event to socket ${senderSession.socketId}`);
                }
                else {
                    console.log(`Socket server: Sender ${senderId} is not online, can't send read confirmation`);
                }
            }
            else {
                console.log(`Socket server: Missing senderId in messageRead event`);
            }
        }
        catch (error) {
            console.error('Error updating message read status:', error);
        }
    });
    socket.on('typing', ({ conversationId, userId }) => {
        updateActivity();
        const timeoutKey = `${conversationId}-${userId}`;
        const existingTimeout = userTypingStatus.get(timeoutKey);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { members: true }
        }).then(conversation => {
            if (!conversation)
                return;
            const otherMembers = conversation.members.filter(m => m.userId !== socket.data.userId);
            otherMembers.forEach(member => {
                const memberSession = activeUsers.get(member.userId);
                if (memberSession && io.sockets.sockets.has(memberSession.socketId)) {
                    io.to(memberSession.socketId).emit('userTyping', { userId: socket.data.userId });
                }
            });
        }).catch(error => {
            console.error('Error handling typing indicator:', error);
        });
        const timeout = setTimeout(() => {
            prisma.conversation.findUnique({
                where: { id: conversationId },
                include: { members: true }
            }).then(conversation => {
                if (!conversation)
                    return;
                const otherMembers = conversation.members.filter(m => m.userId !== socket.data.userId);
                otherMembers.forEach(member => {
                    const memberSession = activeUsers.get(member.userId);
                    if (memberSession && io.sockets.sockets.has(memberSession.socketId)) {
                        io.to(memberSession.socketId).emit('userStoppedTyping', { userId: socket.data.userId });
                    }
                });
            }).catch(error => {
                console.error('Error handling typing indicator:', error);
            });
            userTypingStatus.delete(timeoutKey);
        }, 3000);
        userTypingStatus.set(timeoutKey, timeout);
    });
    socket.on('heartbeat', (_data, callback) => {
        updateActivity();
        callback({ success: true, timestamp: Date.now() });
    });
    socket.on('userOffline', async () => {
        if (currentUserId) {
            notifyUserStatusChange(currentUserId, 'offline', new Date());
            try {
                await prisma.user.update({
                    where: { id: currentUserId },
                    data: {
                        lastSeen: new Date()
                    }
                });
            }
            catch (error) {
                console.error('Error updating last seen on manual offline:', error);
            }
        }
    });
    socket.on('disconnect', async () => {
        console.log('Client disconnected:', socket.id);
        if (currentUserId) {
            try {
                await prisma.user.update({
                    where: { id: currentUserId },
                    data: {
                        lastSeen: new Date()
                    }
                });
            }
            catch (error) {
                console.error('Error updating last seen on disconnect:', error);
            }
            const session = activeUsers.get(currentUserId);
            if (session) {
                session.status = 'offline';
                activeUsers.set(currentUserId, session);
                notifyUserStatusChange(currentUserId, 'offline', new Date());
                setTimeout(() => {
                    const currentSession = activeUsers.get(currentUserId);
                    if (currentSession && currentSession.status === 'offline') {
                        activeUsers.delete(currentUserId);
                    }
                }, 5 * 60 * 1000);
            }
        }
        for (const [key, timeout] of Array.from(userTypingStatus.entries())) {
            if (key.includes(currentUserId)) {
                clearTimeout(timeout);
                userTypingStatus.delete(key);
            }
        }
    });
});
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map