import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messageType: {
        type: String,
        enum: ['text', 'voice'],
        required: true,
        default: 'text'
    },
    content: {
        type: String,
        required: function () {
            return this.messageType === 'text';
        }
    },
    // Voice message specific fields
    audioUrl: {
        type: String,
        required: function () {
            return this.messageType === 'voice';
        }
    },
    audioDuration: {
        type: Number, // Duration in seconds
        required: function () {
            return this.messageType === 'voice';
        }
    },
    audioFormat: {
        type: String,
        enum: ['webm', 'ogg', 'mp3', 'mp4', 'aac', 'wav'],
        required: function () {
            return this.messageType === 'voice';
        }
    },
    audioSize: {
        type: Number, // File size in bytes
        required: function () {
            return this.messageType === 'voice';
        }
    },
    // Read status
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date
    },
    // Delivery status
    delivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    // Metadata
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for efficient conversation queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function () {
    return [this.sender, this.receiver];
});

// Instance method to mark message as read
messageSchema.methods.markAsRead = function () {
    if (!this.read) {
        this.read = true;
        this.readAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to mark message as delivered
messageSchema.methods.markAsDelivered = function () {
    if (!this.delivered) {
        this.delivered = true;
        this.deliveredAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to soft delete message
messageSchema.methods.softDelete = function (userId) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function (userId1, userId2, options = {}) {
    const { limit = 50, skip = 0, includeDeleted = false } = options;

    const query = {
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
        ]
    };

    if (!includeDeleted) {
        query.deleted = false;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('sender', 'firstName lastName email role avatar')
        .populate('receiver', 'firstName lastName email role avatar');
};

// Static method to get all conversations for a user
messageSchema.statics.getConversations = async function (userId) {
    const conversations = await this.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose.Types.ObjectId(userId) },
                    { receiver: new mongoose.Types.ObjectId(userId) }
                ],
                deleted: false
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                        '$receiver',
                        '$sender'
                    ]
                },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                                    { $eq: ['$read', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { 'lastMessage.createdAt': -1 }
        }
    ]);

    // Populate user details
    await this.populate(conversations, {
        path: '_id',
        model: 'User',
        select: 'firstName lastName email role avatar profileImage'
    });

    await this.populate(conversations, {
        path: 'lastMessage.sender lastMessage.receiver',
        select: 'firstName lastName email role avatar'
    });

    return conversations;
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({
        receiver: userId,
        read: false,
        deleted: false
    });
};

// Static method to mark all messages in a conversation as read
messageSchema.statics.markConversationAsRead = function (userId, otherUserId) {
    return this.updateMany(
        {
            sender: otherUserId,
            receiver: userId,
            read: false,
            deleted: false
        },
        {
            $set: {
                read: true,
                readAt: new Date()
            }
        }
    );
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
