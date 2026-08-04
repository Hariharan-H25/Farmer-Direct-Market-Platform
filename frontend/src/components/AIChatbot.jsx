import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = axios.create({ baseURL: '/api' });

const ChatMessage = ({ msg, lang }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
    {msg.role === 'bot' && (
      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0 mt-1">🌾</div>
    )}
    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow ${
      msg.role === 'user'
        ? 'bg-emerald-600 text-white rounded-br-sm'
        : 'bg-white/10 backdrop-blur border border-white/20 text-gray-100 rounded-bl-sm'
    }`}>
      {msg.text}
    </div>
  </div>
);

const AIChatbot = () => {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: lang === 'ta'
      ? 'வணக்கம்! நான் உங்கள் FarmConnect AI உதவியாளர். பயிர்கள், விலைகள், வானிலை பற்றி கேளுங்கள்! 🌾'
      : 'Hello! I am your FarmConnect AI Assistant. Ask me about crops, prices, weather, or farming tips! 🌾'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/ai/chat', { message: trimmed, language: lang });
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am temporarily unavailable. Please try again shortly.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = lang === 'ta'
    ? ['தக்காளி விலை என்ன?', 'வானிலை எப்படி?', 'பயிர் நோய் என்ன?', 'எப்படி விற்பனை செய்வது?']
    : ['What is the tomato price?', 'Weather update?', 'Crop disease help', 'How to sell produce?'];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        title={t('aiChatbot')}
      >
        {isOpen ? '✕' : '🌾'}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🌾</div>
            <div>
              <div className="text-white font-bold text-sm">{t('aiChatbot')}</div>
              <div className="text-emerald-200 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                {lang === 'ta' ? 'செயல்பாட்டில் உள்ளது' : 'Online'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} lang={lang} />)}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/10">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => { setInput(p); }}
                className="flex-shrink-0 px-3 py-1.5 text-xs bg-white/10 hover:bg-emerald-700/50 text-gray-300 hover:text-white rounded-full border border-white/20 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-3 py-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('chatPlaceholder')}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
