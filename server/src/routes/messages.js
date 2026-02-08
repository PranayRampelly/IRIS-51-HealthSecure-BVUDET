import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// @route   GET /api/messages/search-contacts
// @desc    Search for users to message
// @access  Private
router.get('/search-contacts', auth, [
    query('q').trim().notEmpty().withMessage('Search query is required')
], validateRequest, async (req, res) => {
    try {
        const { q } = req.query;
        const searchRegex = new RegExp(q, 'i');

        // If patient, primarily search for doctors. If doctor, search for patients.
        let roleFilter = {};
        if (req.user.role === 'patient') {
            roleFilter = { role: 'doctor' };
        } else if (req.user.role === 'doctor') {
            roleFilter = { role: 'patient' };
        }

        const users = await User.find({
            ...roleFilter,
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ],
            _id: { $ne: req.user._id }
        }).select('firstName lastName email role avatar profileImage').limit(10);

        res.json({
            success: true,
            data: users.map(u => ({
                _id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                role: u.role,
                avatar: u.avatar || u.profileImage?.url
            }))
        });
    } catch (error) {
        console.error('Error searching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find users',
            error: error.message
        });
    }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the authenticated user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Message.getConversations(req.user._id);

        res.json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for the authenticated user
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Message.getUnreadCount(req.user._id);

        res.json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
});

// @route   GET /api/messages/:userId
// @desc    Get message history with a specific user
// @access  Private
router.get(
    '/:userId',
    auth,
    [
        param('userId').isMongoId().withMessage('Invalid user ID'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a positive integer')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;

            const messages = await Message.getConversation(req.user._id, userId, { limit, skip });

            // Mark messages as delivered if not already
            const undeliveredMessages = messages.filter(
                msg => msg.receiver.toString() === req.user._id.toString() && !msg.delivered
            );

            if (undeliveredMessages.length > 0) {
                await Promise.all(undeliveredMessages.map(msg => msg.markAsDelivered()));
            }

            res.json({
                success: true,
                count: messages.length,
                data: messages.reverse() // Reverse to show oldest first
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch messages',
                error: error.message
            });
        }
    }
);

// @route   POST /api/messages
// @desc    Send a text message
// @access  Private
router.post(
    '/',
    auth,
    [
        body('receiver').isMongoId().withMessage('Invalid receiver ID'),
        body('content').trim().notEmpty().withMessage('Message content is required'),
        body('messageType').optional().isIn(['text']).withMessage('Invalid message type')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { receiver, content } = req.body;

            const message = await Message.create({
                sender: req.user._id,
                receiver,
                messageType: 'text',
                content
            });

            await message.populate('sender receiver', 'firstName lastName email role avatar');

            // Emit real-time event via Socket.IO
            if (global.io) {
                global.io.to(`user:${receiver}`).emit('message:new', message);
            }

            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error.message
            });
        }
    }
);

// @route   PATCH /api/messages/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.patch(
    '/:messageId/read',
    auth,
    [param('messageId').isMongoId().withMessage('Invalid message ID')],
    validateRequest,
    async (req, res) => {
        try {
            const message = await Message.findById(req.params.messageId);

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            }

            // Only the receiver can mark a message as read
            if (message.receiver.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to mark this message as read'
                });
            }

            await message.markAsRead();

            // Emit real-time event to sender
            if (global.io) {
                global.io.to(`user:${message.sender}`).emit('message:read', {
                    messageId: message._id,
                    readAt: message.readAt
                });
            }

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark message as read',
                error: error.message
            });
        }
    }
);

// @route   PATCH /api/messages/conversation/:userId/read
// @desc    Mark all messages in a conversation as read
// @access  Private
router.patch(
    '/conversation/:userId/read',
    auth,
    [param('userId').isMongoId().withMessage('Invalid user ID')],
    validateRequest,
    async (req, res) => {
        try {
            const result = await Message.markConversationAsRead(req.user._id, req.params.userId);

            // Emit real-time event to sender
            if (global.io && result.modifiedCount > 0) {
                global.io.to(`user:${req.params.userId}`).emit('conversation:read', {
                    userId: req.user._id,
                    readAt: new Date()
                });
            }

            res.json({
                success: true,
                data: {
                    messagesMarkedAsRead: result.modifiedCount
                }
            });
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark conversation as read',
                error: error.message
            });
        }
    }
);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private
router.delete(
    '/:messageId',
    auth,
    [param('messageId').isMongoId().withMessage('Invalid message ID')],
    validateRequest,
    async (req, res) => {
        try {
            const message = await Message.findById(req.params.messageId);

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            }

            // Only sender or receiver can delete a message
            const isSender = message.sender.toString() === req.user._id.toString();
            const isReceiver = message.receiver.toString() === req.user._id.toString();

            if (!isSender && !isReceiver) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this message'
                });
            }

            await message.softDelete(req.user._id);

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete message',
                error: error.message
            });
        }
    }
);

export default router;
