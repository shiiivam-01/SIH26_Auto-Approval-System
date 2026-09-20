import { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Sparkles, MessageSquare, RotateCcw,
  CheckCircle2, ChevronDown, ExternalLink, ShieldCheck, User, Mic
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendChatQuery } from '../../api/chatApi';

const QUICK_PROMPTS = [
  'Direct document list link for Food Manufacturing?',
  'Required documents & govt portal links?',
  'How long does Fire NOC approval take?',
  'Which subsidy schemes match my business?',
  'How is my data protected on UDAAN?',
];

export const ApplicantChatbot = ({ applicantName = 'Entrepreneur' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Namaste ${user?.name ? user.name.split(' ')[0] : applicantName}! 🙏 I am UDAAN Sahayak, your AI Single Window Assistant. How can I assist your business setup or approvals today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputQuery('');
    setIsTyping(true);

    try {
      const aiResponse = await sendChatQuery(newMessages);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: aiResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'I am experiencing a temporary network issue. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat cleared! How else can I assist your business setup or approvals today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none pointer-events-auto">
      {/* CHATBOT WINDOW DIALOG */}
      {isOpen && (
        <div className="mb-3 w-[350px] sm:w-[380px] h-[500px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-in transition-all">
          {/* Header */}
          <div className="px-4 py-3 bg-[#1a3a6b] dark:bg-slate-800 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#1a3a6b] dark:border-slate-800 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight">UDAAN Sahayak</span>
                  <span className="text-[10px] font-semibold bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded border border-blue-400/30">
                    AI Guide
                  </span>
                </div>
                <span className="text-[11px] text-blue-100/80 block leading-none">
                  Instant clearance & subsidy assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chatbot"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-[#0b1120]/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 space-y-1.5 shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#1a3a6b] dark:bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/70 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {m.action && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate(m.action.path);
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
                    >
                      <span>{m.action.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {m.links && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9.5px] text-right font-mono ${
                      m.sender === 'user' ? 'text-blue-200/80' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 dark:text-slate-500 py-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 rounded-2xl px-3 py-2 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-[10.5px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/60 transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuery.trim()) {
                handleSendMessage();
              }
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about NOCs, checklist, schemes..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-[#1a3a6b] dark:bg-blue-600 hover:bg-[#14306a] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS (Voice Assistant + Chatbot) */}
      <div className="flex flex-col items-end gap-2.5">
        
        {/* VOICE ASSISTANT FAB TRIGGER */}
        <button
          type="button"
          onClick={() => {
            toast.success("Voice assistant connecting...");
          }}
          className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20 relative"
          title="Sarvam Voice Assistant"
        >
          <Mic className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-emerald-500" />
          </span>
        </button>

        {/* CHATBOT FAB TRIGGER */}
        <div className="relative group flex items-center justify-end">
          {/* Tooltip prompt only when user hovers over the button */}
          {!isOpen && (
            <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none items-center gap-1.5 mr-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-semibold shadow-lg border border-slate-700/50 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Need help? Ask Sahayak</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1a3a6b] to-blue-600 hover:from-[#14306a] hover:to-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/20 relative"
            aria-label={isOpen ? 'Close Chatbot' : 'Open AI Chatbot Assistant'}
          >
            {isOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-90 animate-spin-once" />
            ) : (
              <div className="relative">
                <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
