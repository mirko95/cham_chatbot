import React from "react";

interface ChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null; // Hide bubble when chat is open

  return (
    <button
      onClick={onClick}
      aria-label="Open chat"
      className="
        bg-primary hover:bg-primary-focus
        rounded-full
        w-14 h-14
        shadow-lg
        cursor-pointer
        flex items-center justify-center
        transition-transform duration-200 ease-in-out
      "
    >
      <img
        src="/chameleon-logo.png"
        alt="Chat Icon"
        className="w-8 h-8 object-contain"
      />
    </button>
  );
};
