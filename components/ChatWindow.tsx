import React, { useState, useRef, useEffect } from "react";
import { JSX } from "react";
import { Message, Language } from "../types";
import { supportedLanguages } from "../constants";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
  onSubmit: (text: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  headerTitle: string;
  inputPlaceholder: string;
}

/* 🌍 Language Selector */
const LanguageSelector: React.FC<{ language: Language; setLanguage: (lang: Language) => void }> = ({ language, setLanguage }) => (
  <div className="relative">
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="bg-primary cursor-pointer border border-gray-400 hover:border-white text-white rounded-md py-1 pl-2 pr-7 focus:outline-none focus:ring-1 focus:ring-white text-sm sm:text-base"
      aria-label="Select language"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang} className="bg-gray-800 font-semibold text-white">
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  </div>
);

/* 🏷 Header */
const Header: React.FC<{ onClose: () => void; logoUrl?: string; language: Language; setLanguage: (lang: Language) => void; headerTitle: string; }> = ({
  onClose,
  logoUrl = "/chameleon-logo.png",
  language,
  setLanguage,
  headerTitle,
}) => (
  <div className="bg-primary px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center text-white rounded-t-lg sm:rounded-t-lg">
    <div className="flex items-center space-x-2 sm:space-x-3">
      <img src={logoUrl} alt="Company Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
      <h3 className="font-bold text-sm sm:text-lg">{headerTitle}</h3>
    </div>
    <div className="flex items-center space-x-2 sm:space-x-3">
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-lg sm:text-xl" aria-label="Close chat">
        ×
      </button>
    </div>
  </div>
);

/* ✏️ Render Formatted Text */
const renderFormattedText = (text: string): JSX.Element => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];

  const parseLine = (line: string) =>
    line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-4 sm:pl-5 space-y-1 my-1 sm:my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith("* ")) {
      listItems.push(<li key={index}>{parseLine(line.trim().substring(2))}</li>);
    } else {
      flushList();
      if (line.trim() !== "") {
        elements.push(
          <p key={index} className="mb-1 sm:mb-2 text-sm sm:text-base">
            {parseLine(line)}
          </p>
        );
      }
    }
  });

  flushList();
  return <>{elements}</>;
};

/* 💬 Message List */
const MessageList: React.FC<{ messages: Message[]; isLoading: boolean }> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 px-3 sm:px-4 py-3 sm:py-4 space-y-3 overflow-y-auto touch-pan-y overscroll-contain">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
          {msg.sender === "bot" && (
            <img src="/chameleon-logo.png" alt="Bot Avatar" className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full bg-white p-0.5 border border-gray-300 flex-shrink-0" />
          )}
          <div
            className={`max-w-[75%] sm:max-w-xs md:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base ${
              msg.sender === "user"
                ? "bg-primary text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            {msg.sender === "bot" ? <div>{renderFormattedText(msg.text)}</div> : <p className="whitespace-pre-wrap">{msg.text}</p>}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-end gap-2 justify-start">
          <img src="/chameleon-logo.png" alt="Bot Avatar" className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full bg-white p-0.5 border border-gray-300 flex-shrink-0" />
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

/* ⌨️ Chat Input */
const ChatInput: React.FC<{ onSubmit: (text: string) => void; isLoading: boolean; placeholder: string; isOpen: boolean }> = ({
  onSubmit,
  isLoading,
  placeholder,
  isOpen,
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    if (!isLoading) inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <div className="border-t border-gray-200 px-2 sm:px-3 py-2 bg-white rounded-b-lg fixed bottom-0 w-full sm:static">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          ref={inputRef}
          onClick={handleFocus}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-focus text-base"
          style={{ fontSize: "16px" }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

/* 🪟 Chat Window */
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
  const chatRef = useRef<HTMLDivElement>(null);

  /* 🔹 Notify iframe about open/close */
  useEffect(() => {
    const iframe = window.parent;
    if (isOpen) {
      iframe.postMessage({ type: "CHAMELEON_OPEN" }, "*");
    } else {
      iframe.postMessage({ type: "CHAMELEON_CLOSE" }, "*");
    }
  }, [isOpen]);

  /* 🔹 Close on click outside (desktop only) */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node) && window.innerWidth > 768) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  /* 🔹 Iframe message listener */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CHAMELEON_CLOSE") onClose();
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  /* 🔹 Prevent background scroll on mobile when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      ref={chatRef}
      className={`fixed z-50 shadow-2xl flex flex-col overflow-hidden bg-white transition-all duration-200 ease-in-out origin-bottom-right transform 
        ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        w-screen h-[100dvh] top-0 left-0 rounded-none pb-[env(safe-area-inset-bottom)]
        sm:bottom-5 sm:right-5 sm:w-[90vw] sm:max-w-md sm:h-[75vh] sm:max-h-[600px] sm:rounded-lg`}
    >
      <Header onClose={onClose} language={language} setLanguage={setLanguage} headerTitle={headerTitle} />
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: "#71bfad" }}>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <ChatInput onSubmit={onSubmit} isLoading={isLoading} placeholder={inputPlaceholder} isOpen={isOpen} />
    </div>
  );
};
