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
        p-4 md:p-5 lg:p-6   /* padding adjusts with screen size */
        shadow-lg 
        cursor-pointer 
        flex items-center justify-center 
        transition-all duration-300 ease-in-out
        transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        fixed bottom-4 right-4 md:bottom-6 md:right-6 /* adjust bubble position on larger screens */
      `}
      aria-label="Open chat"
    >
      <img
        src="/chameleon-logo.png"
        alt="Chat Icon"
        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain"
      />
    </button>
  );
};
