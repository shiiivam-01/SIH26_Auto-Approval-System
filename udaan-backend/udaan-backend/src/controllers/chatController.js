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

    if (!process.env.SARVAM_API_KEY) {
       return res.status(500).json({ error: 'Sarvam API Key is not configured on the server' });
    }

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || ''
      }))
    ];

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        messages: apiMessages,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to fetch from Sarvam AI');
    }

    const reply = data.choices?.[0]?.message?.content || 'I am sorry, I am unable to process that request at the moment.';
    
    res.json({ text: reply });

  } catch (error) {
    console.error('Sarvam AI Chat Error:', error);
    res.status(500).json({ error: `Sarvam AI API Error: ${error.message}` });
  }
}

module.exports = {
  handleChatQuery
};
