import mongoose from 'mongoose';

const aiChatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'symptoms', 'medication', 'lifestyle', 'emergency', 'error'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    suggestions: [{
        type: String
    }],
    safetyWarnings: [{
        type: String
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient retrieval of chat history in chronological order
aiChatMessageSchema.index({ userId: 1, timestamp: 1 });

const AIChatMessage = mongoose.model('AIChatMessage', aiChatMessageSchema);

export default AIChatMessage;
