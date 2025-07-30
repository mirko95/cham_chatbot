import React, { useState, useRef, useEffect } from 'react';
import { JSX } from 'react';
import { Message, Language } from '../types';
import { supportedLanguages } from '../constants';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onSubmit: (text: string) => void;
  logoUrl?: string;
  language: Language;
  setLanguage: (lang: Language) => void;
  headerTitle: string;
  inputPlaceholder: string;
}

const LanguageSelector: React.FC<{ language: Language; setLanguage: (lang: Language) => void }> = ({ language, setLanguage }) => (
  <div className="relative">
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="bg-primary appearance-none cursor-pointer border border-gray-400 hover:border-white text-white rounded-md py-1 pl-2 pr-7 focus:outline-none focus:ring-1 focus:ring-white"
      aria-label="Select language"
    >
      {supportedLanguages.map(lang => (
        <option key={lang} value={lang} className="bg-gray-800 font-semibold text-white">
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  </div>
);

const Header: React.FC<{ 
  onClose: () => void; 
  logoUrl?: string;
  language: Language; 
  setLanguage: (lang: Language) => void;
  headerTitle: string;
}> = ({ onClose, logoUrl = "/chameleon-logo.png", language, setLanguage, headerTitle }) => (
  <div className="bg-primary p-4 flex justify-between items-center text-white rounded-t-lg">
    <div className="flex items-center space-x-3">
      <img 
        src={logoUrl} 
        alt="Company Logo" 
        className="w-10 h-10 object-contain bg-transparent" 
      />
      <h3 className="font-bold text-lg">{headerTitle}</h3>
    </div>
    <div className="flex items-center space-x-3">
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-lg">
        ×
      </button>
    </div>
  </div>
);


const renderFormattedText = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];

  const parseLine = (line: string) =>
    line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
    );

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-outside pl-5 space-y-1 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      listItems.push(<li key={index}>{parseLine(content)}</li>);
    } else {
      flushList();
      if (line.trim() !== '') {
        elements.push(<p key={index} className="mb-2 last:mb-0">{parseLine(line)}</p>);
      }
    }
  });

  flushList();

  return <>{elements}</>;
};

const MessageList: React.FC<{ messages: Message[]; isLoading: boolean }> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.sender === 'bot' && (
            <img 
              src="/chameleon-logo.png"
              alt="Bot Avatar"
              className="w-6 h-6 object-contain rounded-full bg-white p-0.5 border border-gray-300 flex-shrink-0"
            />
          )}
          <div
            className={`
              max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl
              ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}
            `}
          >
            {msg.sender === 'bot' ? (
              <div className="text-sm">{renderFormattedText(msg.text)}</div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-end gap-2 justify-start">
          <img 
            src="/chameleon-logo.png"
            alt="Bot Avatar"
            className="w-6 h-6 object-contain rounded-full bg-white p-0.5 border border-gray-300 flex-shrink-0"
          />
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

const ChatInput: React.FC<{ onSubmit: (text: string) => void; isLoading: boolean; placeholder: string; isOpen: boolean; }> = ({ onSubmit, isLoading, placeholder, isOpen }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

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
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-focus"
          disabled={isLoading}
          aria-disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white p-2 rounded-lg hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  isOpen, 
  onClose, 
  messages, 
  isLoading, 
  onSubmit, 
  language,
  setLanguage,
  headerTitle,
  inputPlaceholder,
}) => {
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
      <Header 
        onClose={onClose} 
        language={language} 
        setLanguage={setLanguage} 
        headerTitle={headerTitle}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <ChatInput onSubmit={onSubmit} isLoading={isLoading} placeholder={inputPlaceholder} isOpen={isOpen} />
    </div>
  );
};
