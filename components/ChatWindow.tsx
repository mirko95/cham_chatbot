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
      className="bg-primary border border-gray-400 cursor-pointer text-white rounded-lg py-1 pl-2 pr-7 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-white"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang} className="bg-gray-900 text-white">
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
  <div className="bg-primary px-3 py-3 flex justify-between items-center text-white rounded-t-2xl shadow-lg">
    <div className="flex items-center space-x-3">
      <img src={logoUrl} alt="Company Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
      <h3 className="font-bold text-lg">{headerTitle}</h3>
    </div>
    <div className="flex items-center space-x-3">
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <button onClick={onClose} className="text-white text-xl font-bold hover:text-gray-200" aria-label="Close chat">
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
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1 my-2">
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
        elements.push(<p key={index} className="mb-2 text-sm sm:text-base">{parseLine(line)}</p>);
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
    <div className="flex-1 px-3 py-4 space-y-3 overflow-y-auto overscroll-contain">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
          {msg.sender === "bot" && (
            <img src="/chameleon-logo.png" alt="Bot Avatar" className="w-6 h-6 object-contain rounded-full bg-white border border-gray-300" />
          )}
          <div
            className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-md text-sm sm:text-base ${
              msg.sender === "user"
                ? "bg-gradient-to-r from-primary to-primary-focus text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-bl-none"
            }`}
          >
            {msg.sender === "bot" ? renderFormattedText(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-end gap-2 justify-start">
          <img src="/chameleon-logo.png" alt="Bot Avatar" className="w-6 h-6 object-contain rounded-full bg-white border border-gray-300" />
          <div className="bg-white text-gray-800 rounded-2xl px-4 py-2 shadow-md">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
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
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <div className="border-t border-gray-200 px-2 py-2 bg-white rounded-b-2xl shadow-lg">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
          style={{ fontSize: "16px" }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-focus disabled:bg-gray-400 text-base"
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

  useEffect(() => {
    const iframe = window.parent;
    iframe.postMessage({ type: isOpen ? "CHAMELEON_OPEN" : "CHAMELEON_CLOSE" }, "*");
  }, [isOpen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CHAMELEON_CLOSE") onClose();
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <div
      ref={chatRef}
      className={`fixed z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out
        ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        w-screen h-screen sm:bottom-5 sm:right-5 sm:w-[400px] sm:h-[600px] sm:rounded-2xl`}
    >
      <Header onClose={onClose} language={language} setLanguage={setLanguage} headerTitle={headerTitle} />
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#71bfad" }}>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <ChatInput onSubmit={onSubmit} isLoading={isLoading} placeholder={inputPlaceholder} isOpen={isOpen} />
    </div>
  );
};
