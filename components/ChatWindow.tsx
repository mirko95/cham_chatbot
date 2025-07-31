import React, { useState, useRef, useEffect } from 'react';
import { JSX } from 'react';
import { Message, Language } from '../types';
import { supportedLanguages } from '../constants';

/**
 * Props for ChatWindow component
 * - Manages open/close state, messages, input behavior, and language selection
 */
interface ChatWindowProps {
  isOpen: boolean;                          // Controls visibility of chat window
  onClose: () => void;                      // Handler to close chat window
  messages: Message[];                      // List of messages displayed in conversation
  isLoading: boolean;                       // Whether the bot is currently "typing"
  onSubmit: (text: string) => void;         // Callback when user submits a message
  logoUrl?: string;                         // Optional custom logo (defaults to Chameleon)
  language: Language;                       // Current UI language
  setLanguage: (lang: Language) => void;    // Updates language selection
  headerTitle: string;                      // Chat header title (e.g., bot or company name)
  inputPlaceholder: string;                 // Placeholder text for input field
}

/** -------------------------
 * Language Selector Component
 * - Dropdown to choose supported chat languages
 ------------------------- */
const LanguageSelector: React.FC<{ language: Language; setLanguage: (lang: Language) => void }> = ({ language, setLanguage }) => (
  <div className="relative">
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="bg-primary cursor-pointer border border-gray-400 hover:border-white text-white rounded-md py-1 pl-2 pr-7 focus:outline-none focus:ring-1 focus:ring-white text-sm sm:text-base"
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

/** -------------------------
 * Header Component
 * - Displays chat logo, title, language selector, and close button
 ------------------------- */
const Header: React.FC<{ 
  onClose: () => void; 
  logoUrl?: string;
  language: Language; 
  setLanguage: (lang: Language) => void;
  headerTitle: string;
}> = ({ onClose, logoUrl = "/chameleon-logo.png", language, setLanguage, headerTitle }) => (
  <div className="bg-primary px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center text-white rounded-t-lg sm:rounded-t-lg">
    <div className="flex items-center space-x-2 sm:space-x-3">
      <img 
        src={logoUrl} 
        alt="Company Logo" 
        className="w-8 h-8 sm:w-10 sm:h-10 object-contain" 
      />
      <h3 className="font-bold text-sm sm:text-lg">{headerTitle}</h3>
    </div>
    <div className="flex items-center space-x-2 sm:space-x-3">
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <button 
        onClick={onClose} 
        className="text-white hover:text-gray-200 font-bold text-lg sm:text-xl"
        aria-label="Close chat"
      >
        ×
      </button>
    </div>
  </div>
);

/** -------------------------
 * renderFormattedText
 * - Parses bot messages for Markdown-style bold and bullet lists
 * - Supports multi-line formatting and proper HTML rendering
 ------------------------- */
const renderFormattedText = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];

  // Parse text for bold syntax (**bold**)
  const parseLine = (line: string) =>
    line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') 
        ? <strong key={i}>{part.slice(2, -2)}</strong> 
        : part
    );

  // Flush accumulated list items into a <ul>
  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-4 sm:pl-5 space-y-1 my-1 sm:my-2">{listItems}</ul>);
      listItems = [];
    }
  };

  // Loop through lines to detect lists vs paragraphs
  lines.forEach((line, index) => {
    if (line.trim().startsWith('* ')) {
      // Collect bullet point
      listItems.push(<li key={index}>{parseLine(line.trim().substring(2))}</li>);
    } else {
      flushList();
      if (line.trim() !== '') {
        // Normal paragraph
        elements.push(<p key={index} className="mb-1 sm:mb-2 text-sm sm:text-base">{parseLine(line)}</p>);
      }
    }
  });

  flushList();
  return <>{elements}</>;
};

/** -------------------------
 * MessageList Component
 * - Displays user & bot messages in a scrollable chat area
 * - Auto-scrolls to the latest message
 ------------------------- */
const MessageList: React.FC<{ messages: Message[]; isLoading: boolean }> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or typing indicator changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 px-3 sm:px-4 py-3 sm:py-4 space-y-3 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.sender === 'bot' && (
            <img 
              src="/chameleon-logo.png"
              alt="Bot Avatar"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full bg-white p-0.5 border border-gray-300 flex-shrink-0"
            />
          )}
          <div
            className={`max-w-[75%] sm:max-w-xs md:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base ${
              msg.sender === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            {msg.sender === 'bot' 
              ? <div>{renderFormattedText(msg.text)}</div> 
              : <p className="whitespace-pre-wrap">{msg.text}</p>}
          </div>
        </div>
      ))}

      {/* Typing indicator when bot is generating a response */}
      {isLoading && (
        <div className="flex items-end gap-2 justify-start">
          <img 
            src="/chameleon-logo.png"
            alt="Bot Avatar"
            className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full bg-white p-0.5 border border-gray-300 flex-shrink-0"
          />
          <div className="bg-gray-200 text-gray-800 rounded-xl rounded-bl-none px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-center space-x-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

/** -------------------------
 * ChatInput Component
 * - Text input for user messages with send button
 * - Auto-focuses when chat opens and bot is not loading
 ------------------------- */
const ChatInput: React.FC<{ onSubmit: (text: string) => void; isLoading: boolean; placeholder: string; isOpen: boolean; }> = ({ onSubmit, isLoading, placeholder, isOpen }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isLoading) inputRef.current?.focus();
  }, [isOpen, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="border-t border-gray-200 px-2 sm:px-3 py-2 bg-white rounded-b-lg">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-1.5 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-focus text-sm sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

/** -------------------------
 * ChatWindow Component
 * - Container for entire chat interface
 * - Adapts layout for mobile (fullscreen) and desktop (floating)
 ------------------------- */
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
        fixed z-50 shadow-2xl flex flex-col overflow-hidden 
        bg-white transition-all duration-300 ease-in-out origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}

        /* Mobile fullscreen layout */
        w-screen max-w-none h-screen top-0 left-0 rounded-none
        pb-[env(safe-area-inset-bottom)]

        /* Desktop floating layout */
        sm:bottom-5 sm:right-5 sm:top-auto sm:left-auto
        sm:w-[90vw] sm:max-w-md sm:h-[75vh] sm:max-h-[600px] sm:rounded-lg
      `}
    >
      <Header 
        onClose={onClose} 
        language={language} 
        setLanguage={setLanguage} 
        headerTitle={headerTitle}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: '#71bfad' }}>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <ChatInput onSubmit={onSubmit} isLoading={isLoading} placeholder={inputPlaceholder} isOpen={isOpen} />
    </div>
  );
};
