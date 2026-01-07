import Chat from '../models/Chat.js';
import Conversation from '../models/Conversation.js';
import openai from '../config/openai.js';
import AppError from '../utils/AppError.js';
// import { validationResult } from 'express-validator';

// @desc    Send a message (and optionally create conversation)
// @route   POST /api/chat/message
// @access  Private
// @access  Private
export const chatMessage = async (req, res, next) => {

    // Manual validation to avoid middleware issues
    const { message } = req.body;
    if (!message || !message.trim()) {
        const err = new AppError('Message cannot be empty', 400);
        if (typeof next === 'function') {
            return next(err);
        } else {
            console.error('CRITICAL: next is not a function!');
            return res.status(400).json({ status: 'fail', message: 'Message cannot be empty' });
        }
    }

    try {
        const { message, conversationId } = req.body;
        const userId = req.user.uid;
        let activeConversationId = conversationId;

        // If no conversationId provided, create a new conversation
        if (!activeConversationId) {
            // Generate a simple title based on the first few words of the message
            const title = message.split(' ').slice(0, 5).join(' ') + '...';

            const newConv = await Conversation.create({
                userId,
                title,
                lastMessage: message
            });
            activeConversationId = newConv._id;
        }

        // Save user message
        const userChat = await Chat.create({
            userId,
            conversationId: activeConversationId,
            message,
            sender: 'user',
        });

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(activeConversationId, {
            lastMessage: message,
            updatedAt: Date.now()
        });

        // OpenAI System Prompt
        const systemPrompt = `You are MindMate, a dedicated AI companion for mental health and well-being.
    Your SOLE purpose is to provide emotional support, guidance on mental wellness, and empathetic listening.
    
    STRICT RULES:
    1. EXCLUSIVELY discuss topics related to mental health, emotions, stress, relationships, self-care, and well-being.
    2. If the user asks about coding, math, general trivia, sports, politics, or any topic unrelated to mental health, politely decline. Say something like: "I am designed to focus only on your mental well-being and emotional health. How are you feeling today?"
    3. Be empathetic, validative, and non-judgmental.
    4. Never claim to replace a therapist or professional help.
    5. CRISIS PROTOCOL: If the user expresses self-harm, suicide, or severe distress, immediately urge them to seek professional help and provide general emergency context, but do not provide medical advice.
    6. Keep responses concise, warm, and natural.
    `;

        // Fetch recent context for this specific conversation
        const history = await Chat.find({ conversationId: activeConversationId })
            .sort({ createdAt: -1 })
            .limit(10); // increased context

        const apiMessages = history.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.message })).reverse();

        apiMessages.unshift({ role: 'system', content: systemPrompt });
        apiMessages.push({ role: 'user', content: message }); // Ensure current message is last

        // Call OpenAI
        let aiResponse;
        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: apiMessages,
                max_tokens: 300,
            });
            aiResponse = completion.choices[0].message.content;
        } catch (error) {
            // Handle specific OpenAI errors
            if (error.status === 429) {
                return next(new AppError('AI Service Quota Exceeded. Please check your billing or use Demo Mode.', 429));
            }
            if (error.status === 401) {
                return next(new AppError('Invalid or missing OpenAI API key. Please check backend configuration.', 401));
            }
            if (error.status === 403) {
                return next(new AppError('OpenAI API access forbidden. Please verify your API key and permissions.', 403));
            }
            if (error.status === 500 || error.status === 502 || error.status === 503) {
                return next(new AppError('OpenAI service temporarily unavailable. Please try again in a moment.', 503));
            }
            throw error; // Re-throw generic to outer catch
        }

        // Save AI response
        const aiChat = await Chat.create({
            userId,
            conversationId: activeConversationId,
            message: aiResponse,
            sender: 'ai',
        });

        // Update conversation lastMessage with AI response
        await Conversation.findByIdAndUpdate(activeConversationId, {
            lastMessage: aiResponse,
            updatedAt: Date.now()
        });

        res.status(200).json({
            status: 'success',
            data: {
                conversationId: activeConversationId,
                userMessage: userChat,
                aiMessage: aiChat,
            },
        });

    } catch (error) {
        console.error('Chat Error:', error);
        if (!res.headersSent) {
            const message = error.error?.message || error.message || 'Failed to get response from AI';
            next(new AppError(message, error.status || 500));
        }
    }
};

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.uid })
            .sort({ updatedAt: -1 })
            .limit(50);

        res.status(200).json({
            status: 'success',
            results: conversations.length,
            data: {
                conversations
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
export const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Chat.find({
            userId: req.user.uid,
            conversationId
        })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: {
                messages
            }
        });
    } catch (error) {
        next(error);
    }
};
