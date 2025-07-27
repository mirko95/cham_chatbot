
import React from 'react';

interface ChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 0 1-1.59 0l-3.72-3.72a1.125 1.125 0 0 1-1.59 0L5.58 19.22a1.125 1.125 0 0 1-1.59 0l-3.72-3.72A1.125 1.125 0 0 1 .75 14.886v-4.286c0-.97.616-1.813 1.5-2.097m6.006 0c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 0 1-1.59 0l-3.72-3.72a1.125 1.125 0 0 1-1.59 0L1.408 19.22a1.125 1.125 0 0 1-1.59 0L-2.3 15.5a1.125 1.125 0 0 1-1.59 0v-4.286c0-.97.616-1.813 1.5-2.097" />
    </svg>
);


export const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-primary hover:bg-primary-focus 
        rounded-full 
        p-4 
        shadow-lg 
        cursor-pointer 
        flex items-center justify-center 
        transition-all duration-300 ease-in-out
        transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
      `}
      aria-label="Open chat"
    >
      <ChatIcon />
    </button>
  );
};
