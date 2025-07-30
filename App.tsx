
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAnswer, sendContactEmail, Content } from './geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ChatWindow } from './components/ChatWindow';
import { Message, ChatState, ContactInfo, Language, Theme } from './types';
import { DEFAULT_LOGO, DEFAULT_PRIMARY_COLOR, DEFAULT_PRIMARY_FOCUS_COLOR, supportedLanguages, translations, DEFAULT_BORDER_RADIUS, DEFAULT_FONT_FAMILY } from './constants';
import { PDF_CONTENT } from './pdfContent';

const getInitialLanguage = (): Language => {
  // 1. Try to get language from parent window (host page)
  try {
    // Access parent document lang attribute
    const parentLang = window.parent.document.documentElement.lang.split(/[-_]/)[0];
    if (supportedLanguages.includes(parentLang as Language)) {
      return parentLang as Language;
    }
  } catch (e) {
    // This can fail due to cross-origin policies, which is fine.
    // We'll just fall back to the next method.
    console.info("Could not access parent frame language, falling back.");
  }

  // 2. Fallback to browser language if parent language is not available or not supported
  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split(/[-_]/)[0];
    if (supportedLanguages.includes(browserLang as Language)) {
      return browserLang as Language;
    }
  }

  // 3. Default to English
  return 'en';
};

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('querying');
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo>>({});
  const [isAwaitingContactConfirmation, setIsAwaitingContactConfirmation] = useState(false);
  
  const [theme, setTheme] = useState<Theme>({
      primaryColor: DEFAULT_PRIMARY_COLOR,
      primaryFocusColor: DEFAULT_PRIMARY_FOCUS_COLOR,
      logoUrl: DEFAULT_LOGO,
      borderRadius: DEFAULT_BORDER_RADIUS,
      fontFamily: DEFAULT_FONT_FAMILY,
  });

  useEffect(() => {
    const handleBlur = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isOpen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CHAMELEON_THEME' && typeof event.data.theme === 'object') {
        setTheme(prevTheme => ({ ...prevTheme, ...event.data.theme }));
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'CHAMELEON_READY' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--primary-color', theme.primaryColor);
    rootStyle.setProperty('--primary-focus-color', theme.primaryFocusColor);
    rootStyle.setProperty('--font-family', theme.fontFamily);

    const baseRadiusStr = theme.borderRadius || '0px';
    const baseRadiusNum = parseFloat(baseRadiusStr);
    const unit = baseRadiusStr.match(/[^0-9.-]+$/)?.[0] || 'px';

    if (!isNaN(baseRadiusNum)) {
        rootStyle.setProperty('--border-radius-lg', `${baseRadiusNum}${unit}`);
        rootStyle.setProperty('--border-radius-xl', `${baseRadiusNum * 1.5}${unit}`);
        rootStyle.setProperty('--border-radius-2xl', `${baseRadiusNum * 2}${unit}`);
        rootStyle.setProperty('--border-radius-3xl', `${baseRadiusNum * 3}${unit}`);
        rootStyle.setProperty('--border-radius-md', `${baseRadiusNum * 0.75}${unit}`);
        rootStyle.setProperty('--border-radius', `${baseRadiusNum * 0.5}${unit}`);
        rootStyle.setProperty('--border-radius-sm', `${baseRadiusNum * 0.25}${unit}`);
    }
  }, [theme]);


  useEffect(() => {
    setMessages([{ id: Date.now(), text: translations[language].greeting, sender: 'bot' }]);
  }, [language]);

  const addMessage = useCallback((text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender }]);
  }, []);

  const handleContactFlow = useCallback(async (userInput: string) => {
    setIsLoading(true);
    let nextState: ChatState = chatState;
    let botResponse = '';
    const t = translations[language];

    try {
        switch (chatState) {
            case 'collecting_name':
                setContactInfo({ name: userInput });
                nextState = 'collecting_company';
                botResponse = t.contactNamePrompt.replace('{name}', userInput);
                break;
            case 'collecting_company':
                const company = userInput.toLowerCase() === t.skip.toLowerCase() ? undefined : userInput;
                setContactInfo(prev => ({ ...prev, company }));
                nextState = 'collecting_email';
                botResponse = t.contactCompanyPrompt;
                break;
            case 'collecting_email':
                if (!/\S+@\S+\.\S+/.test(userInput)) {
                    botResponse = t.contactEmailInvalid;
                } else {
                    setContactInfo(prev => ({ ...prev, email: userInput }));
                    nextState = 'collecting_phone';
                    botResponse = t.contactEmailPrompt;
                }
                break;
            case 'collecting_phone':
                const phone = userInput.toLowerCase() === t.skip.toLowerCase() ? undefined : userInput;
                const finalContactInfo = { ...contactInfo, phone, name: contactInfo.name!, email: contactInfo.email! } as ContactInfo;
                
                await sendContactEmail(finalContactInfo);
                
                botResponse = t.contactSuccess.replace('{name}', finalContactInfo.name);
                nextState = 'querying';
                setContactInfo({});
                break;
        }
    } catch (error) {
        console.error("Error in contact flow:", error);
        botResponse = t.contactFlowError;
        nextState = 'querying';
    } finally {
        addMessage(botResponse, 'bot');
        setChatState(nextState);
        setIsLoading(false);
    }
  }, [addMessage, chatState, contactInfo, language]);


  const handleSubmit = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    addMessage(userInput, 'user');
    const t = translations[language];

    if (isAwaitingContactConfirmation) {
        const affirmativeResponses = t.affirmativeResponses.split(', ');
        const isAffirmative = affirmativeResponses.some(resp => userInput.toLowerCase().includes(resp));

        setIsAwaitingContactConfirmation(false);

        if (isAffirmative) {
            setIsLoading(true);
            setChatState('collecting_name');
            addMessage(t.contactInitiate, 'bot');
            setIsLoading(false);
            return;
        }
    }

    if (chatState !== 'querying') {
        handleContactFlow(userInput);
        return;
    }

    const contactTriggers = t.contactTriggers.split(', ');
    if (contactTriggers.some(trigger => userInput.toLowerCase().includes(trigger))) {
        setIsLoading(true);
        setChatState('collecting_name');
        addMessage(t.contactInitiate, 'bot');
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    try {
      const historyForAPI = [
          ...messages.slice(1),
          { text: userInput, sender: 'user' as const, id: 0 } 
        ].map((msg): Content => ({
            role: msg.sender === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
      }));

      const answer = await getAnswer(historyForAPI, PDF_CONTENT, language);
      
      if (answer.includes(t.contactOfferTrigger)) {
        setIsAwaitingContactConfirmation(true);
      } else {
        setIsAwaitingContactConfirmation(false);
      }

      addMessage(answer, 'bot');
    } catch (error) {
      console.error('Error fetching answer from Gemini:', error);
      addMessage(t.genericError, 'bot');
      setIsAwaitingContactConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, chatState, handleContactFlow, messages, isAwaitingContactConfirmation, language]);

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end z-50">
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        logoUrl={theme.logoUrl}
        language={language}
        setLanguage={setLanguage}
        headerTitle={translations[language].headerTitle}
        inputPlaceholder={translations[language].inputPlaceholder}
      />
      <ChatBubble isOpen={isOpen} onClick={() => setIsOpen(true)} />
    </div>
  );
};

export default App;
