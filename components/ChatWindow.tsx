
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onSubmit: (text: string) => void;
  logoUrl: string;
}

const Header: React.FC<{ onClose: () => void; logoUrl: string }> = ({ onClose, logoUrl }) => (
  <div className="bg-primary p-4 flex justify-between items-center text-white rounded-t-lg">
    <div className="flex items-center space-x-3">
        <img src={logoUrl} alt="Company Logo" className="w-8 h-8 rounded-full bg-white p-1"/>
        <h3 className="font-bold text-lg">Chameleon Assistant</h3>
    </div>
    <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Close chat">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
);

const MessageList: React.FC<{ messages: Message[]; isLoading: boolean }> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.sender === 'bot' && <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0"></div>}
          <div
            className={`
              max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl
              ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}
            `}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
        </div>
      ))}
       {isLoading && (
        <div className="flex items-end gap-2 justify-start">
            <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0"></div>
            <div className="bg-gray-200 text-gray-800 rounded-xl rounded-bl-none px-4 py-3">
                <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatInput: React.FC<{ onSubmit: (text: string) => void; isLoading: boolean }> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="border-t border-gray-200 p-2 bg-white rounded-b-lg">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-focus"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white p-2 rounded-lg hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, messages, isLoading, onSubmit, logoUrl }) => {
  return (
    <div
      className={`
        w-[calc(100vw-40px)] max-w-sm h-[70vh] max-h-[600px] 
        bg-gray-50 
        shadow-2xl 
        rounded-lg 
        flex flex-col
        transition-all duration-300 ease-in-out
        origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
      `}
    >
      <Header onClose={onClose} logoUrl={logoUrl} />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};
