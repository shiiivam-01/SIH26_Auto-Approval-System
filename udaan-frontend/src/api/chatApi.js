import api from './index';

export const sendChatQuery = async (messages) => {
  const response = await api.post('/chat', { messages });
  return response.data;
};
