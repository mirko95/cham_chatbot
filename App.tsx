
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAnswer } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ChatWindow } from './components/ChatWindow';
import { Message, ChatState, ContactInfo } from './types';
import { DEFAULT_GREETING, DEFAULT_LOGO, DEFAULT_PRIMARY_COLOR, DEFAULT_PRIMARY_FOCUS_COLOR } from './constants';

interface AppProps {
  primaryColor?: string;
  primaryFocusColor?: string;
  logoUrl?: string;
  greetingMessage?: string;
}

const App: React.FC<AppProps> = ({
  primaryColor = DEFAULT_PRIMARY_COLOR,
  primaryFocusColor = DEFAULT_PRIMARY_FOCUS_COLOR,
  logoUrl = DEFAULT_LOGO,
  greetingMessage = DEFAULT_GREETING,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('querying');
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo>>({});

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.setProperty('--primary-color', primaryColor);
      rootRef.current.style.setProperty('--primary-focus-color', primaryFocusColor);
    }
  }, [primaryColor, primaryFocusColor]);

  const addMessage = useCallback((text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender }]);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: Date.now(), text: greetingMessage, sender: 'bot' }]);
    }
  }, [greetingMessage, messages.length]);
  
  const handleContactFlow = useCallback((userInput: string) => {
    setIsLoading(true);
    setTimeout(() => {
        let nextState: ChatState = chatState;
        let botResponse = '';

        if (chatState === 'collecting_name') {
            setContactInfo({ name: userInput });
            nextState = 'collecting_email';
            botResponse = 'Got it. What is your email address?';
        } else if (chatState === 'collecting_email') {
            // Basic email validation
            if (!/\S+@\S+\.\S+/.test(userInput)) {
                 botResponse = 'That doesn\'t look like a valid email. Please enter a valid email address.';
                 nextState = 'collecting_email';
            } else {
                setContactInfo(prev => ({ ...prev, email: userInput }));
                nextState = 'collecting_message';
                botResponse = 'Great. And what is your message?';
            }
        } else if (chatState === 'collecting_message') {
            const finalContactInfo = { ...contactInfo, message: userInput } as ContactInfo;
            // SIMULATE SENDING EMAIL
            console.log('Simulating email send:', finalContactInfo);
            botResponse = `Thank you, ${finalContactInfo.name}! Our team will reach out to you within 24 hours.`;
            nextState = 'querying';
            setContactInfo({});
        }
        
        addMessage(botResponse, 'bot');
        setChatState(nextState);
        setIsLoading(false);
    }, 500);
  }, [addMessage, chatState, contactInfo]);


  const handleSubmit = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    addMessage(userInput, 'user');

    if (chatState !== 'querying') {
        handleContactFlow(userInput);
        return;
    }

    if (userInput.toLowerCase().includes('contact support') || userInput.toLowerCase().includes('help')) {
        setIsLoading(true);
        setTimeout(() => {
            setChatState('collecting_name');
            addMessage("I can help with that. What's your full name?", 'bot');
            setIsLoading(false);
        }, 500);
        return;
    }

    setIsLoading(true);
    try {
      const answer = await getAnswer(userInput);
      addMessage(answer, 'bot');
    } catch (error) {
      console.error('Error fetching answer from Gemini:', error);
      addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, chatState, handleContactFlow]);

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 flex flex-col items-end z-50">
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        logoUrl={logoUrl}
      />
      <ChatBubble isOpen={isOpen} onClick={() => setIsOpen(true)} />
    </div>
  );
};

export default App;
