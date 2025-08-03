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
        p-4 md:p-5
        min-w-[50px] min-h-[50px]
        shadow-lg
        cursor-pointer
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}

        fixed 
        bottom-[max(1rem,calc(4rem+env(safe-area-inset-bottom)))] right-4
        sm:bottom-6 sm:right-6
      `}
      style={{
        zIndex: 1000, // Always on top
      }}
      aria-label="Open chat"
    >
      <img
        src="/chameleon-logo.png"
        alt="Chat Icon"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/40"; }}
        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain"
      />
    </button>
  );
};
