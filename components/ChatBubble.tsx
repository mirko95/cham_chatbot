import React from 'react';

interface ChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

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
      <img
        src="/chameleon-logo.png"
        alt="Chat Icon"
        className="w-8 h-8 object-contain"
      />
    </button>
  );
};
