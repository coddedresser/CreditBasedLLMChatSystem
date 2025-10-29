// src/services/llmService.js
const { grokClient } = require('../config/llm');

exports.sendChatMessage = async (messages) => {
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await grokClient.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: response.data.choices[0].message.content,
      tokensUsed: response.data.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error('LLM service error:', error.response?.data || error.message);

    return {
      content: 'I apologize, but I encountered an error processing your request. Please try again.',
      tokensUsed: 0
    };
  }
};
