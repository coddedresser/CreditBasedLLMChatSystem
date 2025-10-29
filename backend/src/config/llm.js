// src/config/llm.js
const axios = require('axios');

const GROK_API_KEY = process.env.GROK_API_KEY;

const grokClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${GROK_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

module.exports = { grokClient };
