import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { X, Send, Phone, Bot } from 'lucide-react';
import { SUPPORT_PHONE_NUMBER } from '../constants';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! I'm EcoHelper. How can I assist you with waste management today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await getChatbotResponse(input);
      const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'bot', text: "I'm sorry, something went wrong." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md h-[80vh] bg-card-light dark:bg-card-dark rounded-2xl shadow-xl flex flex-col">
        <header className="bg-gradient-to-r from-primary to-accent text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <Bot size={24} />
             <h3 className="font-bold text-lg">EcoHelper AI</h3>
          </div>
          <button onClick={onClose} className="hover:bg-black/20 p-1 rounded-full"><X size={24} /></button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto bg-background-light dark:bg-slate-900">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}>
                {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0"><Bot size={20} /></div>}
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-primary to-accent text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-text-light dark:text-text-dark rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0"><Bot size={20} /></div>
                    <div className="px-4 py-3 bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-bl-none">
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-2 border-t border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-900/50">
             <a href={`tel:${SUPPORT_PHONE_NUMBER}`} className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-primary">
                Need more help? <span className="font-semibold">Talk to our Partner</span>
            </a>
        </div>

        <div className="p-4 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark rounded-b-2xl">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about waste..."
              className="flex-grow p-3 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-accent text-white p-3 rounded-full hover:shadow-glow-primary disabled:from-slate-400 disabled:to-slate-500 transition"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;