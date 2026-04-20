'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Bonjour ! Je suis NyXia IA, votre assistante d'automatisation intelligente. Comment puis-je vous aider aujourd'hui ?",
  timestamp: new Date(),
};

export default function NyxiaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          data.content ||
          data.reply ||
          "Je suis desole, une erreur s'est produite. Reessayez dans un instant.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          "Impossible de se connecter au serveur. Verifiez votre connexion et reessayez.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <>
      {/* ── Chat Panel ──────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0A1628',
          border: '1px solid rgba(123,92,255,0.15)',
          boxShadow:
            '0 0 40px rgba(123,92,255,0.15), 0 20px 60px rgba(0,0,0,0.5)',
          maxHeight: 'min(520px, calc(100vh - 140px))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(123,92,255,0.15), rgba(79,163,255,0.08))',
            borderBottom: '1px solid rgba(123,92,255,0.1)',
          }}
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[rgba(123,92,255,0.4)]">
            <Image
              src="/images/Logo.png"
              alt="NyXia IA"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col leading-none flex-1">
            <span
              className="text-sm font-semibold"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NyXia IA
            </span>
            <span className="flex items-center gap-1.5 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#00E676',
                  boxShadow: '0 0 6px rgba(0,230,118,0.6)',
                }}
              />
              <span
                className="text-[11px]"
                style={{ color: '#00E676', fontFamily: "'Outfit', sans-serif" }}
              >
                En ligne
              </span>
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a0a0b0] hover:text-white hover:bg-[rgba(123,92,255,0.15)] transition-colors"
            aria-label="Fermer le chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ minHeight: 0 }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animation: 'nx-msg-in 0.3s ease-out' }}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={
                  msg.role === 'user'
                    ? {
                        fontFamily: "'Outfit', sans-serif",
                        background:
                          'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
                        color: '#FFFFFF',
                      }
                    : {
                        fontFamily: "'Outfit', sans-serif",
                        background: 'rgba(123,92,255,0.08)',
                        border: '1px solid rgba(123,92,255,0.1)',
                        color: '#D6D9F0',
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div
              className="flex justify-start"
              style={{ animation: 'nx-msg-in 0.3s ease-out' }}
            >
              <div
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md"
                style={{
                  background: 'rgba(123,92,255,0.08)',
                  border: '1px solid rgba(123,92,255,0.1)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: '#7B5CFF',
                      animation: `nx-dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="shrink-0 px-3 py-3"
          style={{
            borderTop: '1px solid rgba(123,92,255,0.1)',
            background: 'rgba(6,16,31,0.6)',
          }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1"
            style={{
              background: 'rgba(123,92,255,0.06)',
              border: '1px solid rgba(123,92,255,0.15)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ecrivez votre message..."
              disabled={isTyping}
              className="flex-1 bg-transparent outline-none text-sm py-2 placeholder:text-[#4a5278] disabled:opacity-50"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: '#D6D9F0',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-30 hover:scale-105 active:scale-95"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #7B5CFF, #5A6CFF)'
                  : 'rgba(123,92,255,0.1)',
                color: '#FFFFFF',
              }}
              aria-label="Envoyer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Toggle Button ──────────────────── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          open ? 'rotate-0' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #7B5CFF 0%, #5A6CFF 50%, #4FA3FF 100%)',
          boxShadow:
            '0 0 25px rgba(123,92,255,0.5), 0 0 50px rgba(123,92,255,0.2), 0 4px 20px rgba(0,0,0,0.3)',
          animation: open ? 'none' : 'nx-breathe 3s ease-in-out infinite',
        }}
        aria-label={open ? 'Fermer le chat NyXia' : 'Ouvrir le chat NyXia'}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <div className="relative w-9 h-9 rounded-full overflow-hidden">
            <Image
              src="/images/Logo.png"
              alt="NyXia"
              fill
              className="object-cover"
            />
          </div>
        )}
      </button>
    </>
  );
}
