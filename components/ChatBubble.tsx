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
        p-4 md:p-5                      /* Manteniamo padding responsive */
        min-w-[50px] min-h-[50px]        /* 🔹 Dimensione minima per mobile (tappable area) */
        shadow-lg
        cursor-pointer
        flex items-center justify-center
        transition-all duration-200 ease-in-out /* 🔹 Animazione più veloce su mobile */
        transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}

        fixed bottom-6 right-6           /* 🔹 Margini leggermente più ampi dal bordo */
        sm:bottom-6 sm:right-6
      `}
      style={{
        zIndex: 1000,                   /* 🔹 Assicura che sia sempre sopra altri elementi */
      }}
      aria-label="Open chat"
    >
      <img
        src="/chameleon-logo.png"
        alt="Chat Icon"
        className="
          w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 /* 🔹 Icona leggermente più grande per mobile */
          object-contain
        "
      />
    </button>
  );
};
