const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `You are UDAAN Sahayak, an AI Single Window Assistant for the state government.
Your job is to assist business owners and entrepreneurs with setting up their businesses, understanding statutory approvals (like Fire NOC, FSSAI, Pollution Board CTE/CTO, Factory Licenses), and navigating government schemes.
Keep your answers very short, highly relevant, and professional. Use formatting (bullet points, bold text) for readability.
If a user just says "hi" or "hello", greet them and ask how you can assist their business today.`;

async function handleChatQuery(req, res) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.GROQ_API_KEY) {
       return res.status(500).json({ error: 'Groq API Key is not configured on the server' });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || ''
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 500,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'I am sorry, I am unable to process that request at the moment.';
    
    res.json({ text: reply });

  } catch (error) {
    console.error('Groq Chat Error:', error);
    res.status(500).json({ error: `Groq API Error: ${error.message}` });
  }
}

module.exports = {
  handleChatQuery
};
