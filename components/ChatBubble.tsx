import React from 'react';

// Props definition for ChatBubble component
interface ChatBubbleProps {
  onClick: () => void; // Function triggered when the chat bubble is clicked
  isOpen: boolean;     // Boolean to track whether the chat window is currently open
}

// ChatBubble component renders a floating button that toggles the chat window
export const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick} // Calls parent handler to toggle chat visibility
      className={`
        bg-primary hover:bg-primary-focus       /* Main button color with hover effect */
        rounded-full                           /* Fully rounded to create a bubble shape */
        p-4 md:p-5 lg:p-6                      /* Responsive padding (adjusts by screen size) */
        shadow-lg                              /* Drop shadow for visual depth */
        cursor-pointer                         /* Cursor changes to pointer on hover */
        flex items-center justify-center       /* Centers icon inside the button */
        transition-all duration-300 ease-in-out/* Smooth animations for hover/scale effects */
        transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} 
        /* Scale & fade out bubble when chat is open */
        
        fixed bottom-4 right-4                 /* Fixed position at bottom-right corner (mobile) */
        md:bottom-6 md:right-6                 /* Adjusts position slightly for larger screens */
      `}
      aria-label="Open chat" // Accessibility label for screen readers
    >
      <img
        src="/chameleon-logo.png"              // Chat bubble icon image
        alt="Chat Icon"                        // Alt text for accessibility
        className="
          w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 
          object-contain                       /* Maintains image proportions */
        "
      />
    </button>
  );
};
