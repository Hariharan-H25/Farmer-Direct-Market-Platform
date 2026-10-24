import { useState, useRef, useEffect } from 'react';
import { Send, X, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { chatWithBot } from '../api';

const ChatMessage = ({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2.5`}>
    {msg.role === 'bot' && (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold mr-2 shrink-0 mt-0.5 shadow-sm">
        🌾
      </div>
    )}
    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
      msg.role === 'user'
        ? 'bg-emerald-600 text-white rounded-br-xs'
        : 'bg-white/10 dark:bg-gray-800/90 backdrop-blur-md border border-white/15 dark:border-gray-700 text-gray-100 rounded-bl-xs'
    }`}>
      <p className="whitespace-pre-wrap">{msg.text}</p>
      {msg.provider && (
        <span className="block text-[9px] text-emerald-300/70 mt-1 font-medium">
          {msg.provider}
        </span>
      )}
    </div>
  </div>
);

const AIChatbot = () => {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: lang === 'ta'
        ? 'வணக்கம்! நான் உங்கள் FarmConnect AI பண்ணை உதவியாளர். விதைகள், பயிர் நோய்கள், வானிலை மற்றும் இன்றைய சந்தை விலைகள் குறித்து என்னிடம் கேளுங்கள்! 🌾'
        : 'Hello! I am your FarmConnect AI Assistant. Ask me about crops, Mandi prices, pest remedies, weather, or selling produce! 🌾'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendQuery = async (queryText) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    setLastFailedQuery(null);

    try {
      const response = await chatWithBot(trimmed, lang);
      const data = response?.data;
      const botReply = data?.reply || (lang === 'ta' 
        ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் தாமதம் ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.' 
        : 'Thank you for your question! Please consult our Market & AI dashboard for updated statistics.');

      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          text: botReply,
          provider: data?.aiProvider || 'FarmConnect AI'
        }
      ]);
    } catch (err) {
      console.error('Chatbot API communication error:', err);
      setLastFailedQuery(trimmed);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          text: lang === 'ta'
            ? 'தற்போது AI சேவையகத்தை தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து உங்கள் இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
            : 'Unable to reach FarmConnect AI server. Please check your internet connection or try again.',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  };

  const quickPrompts = lang === 'ta'
    ? ['தக்காளி விலை என்ன?', 'பயிர் நோய் தீர்வு', 'வானிலை எப்படி?', 'விளைபொருள் விற்பனை எப்படி?']
    : ['Tomato Mandi price?', 'Crop disease remedy', 'Weather forecast?', 'How to sell produce?'];

  return (
    <>
      {/* Mobile backdrop for outside tap closing */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-2xs z-40"
          aria-hidden="true"
        />
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-xl shadow-emerald-700/30 flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-all focus:outline-none border-2 border-white/30"
        title={t('aiChatbot')}
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={22} /> : '🌾'}
      </button>

      {/* Chat Window - Fully Responsive across mobile & desktop */}
      {isOpen && (
        <div 
          className="fixed inset-x-3 bottom-20 sm:inset-auto sm:bottom-24 sm:right-6 z-50 sm:w-96 max-h-[78vh] sm:max-h-[560px] h-[480px] sm:h-[530px] bg-gray-900/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 dark:border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="FarmConnect AI Chatbot"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-base shadow-inner">
                🌾
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                  {t('aiChatbot')} <Sparkles size={13} className="text-amber-300" />
                </div>
                <div className="text-emerald-100 text-[11px] flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse inline-block" />
                  {lang === 'ta' ? 'செயல்பாட்டில் உள்ளது' : 'Online · Agronomy AI'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Close chat window"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 scroll-smooth">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}

            {/* Bouncing dots loading indicator */}
            {loading && (
              <div className="flex justify-start mb-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs mr-2 shrink-0">
                  🌾
                </div>
                <div className="bg-white/10 border border-white/15 px-3.5 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                  <span className="text-[10px] text-gray-300 ml-1">
                    {lang === 'ta' ? 'பதிலளிக்கிறது...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}

            {/* Retry Button if last message failed */}
            {lastFailedQuery && !loading && (
              <div className="flex justify-center py-1">
                <button
                  onClick={() => sendQuery(lastFailedQuery)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/40 rounded-full transition-colors font-medium shadow-sm"
                >
                  <RotateCcw size={12} />
                  {lang === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry sending message'}
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-white/10 bg-gray-950/40">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendQuery(p)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 text-[11px] bg-white/10 hover:bg-emerald-700/60 text-gray-200 hover:text-white rounded-full border border-white/15 transition-all disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Message Input & Send Form */}
          <form onSubmit={handleSubmit} className="p-2.5 border-t border-white/10 bg-gray-950/70 flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={t('chatPlaceholder') || 'Ask about crops, prices, weather...'}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-md shadow-emerald-900/40"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
