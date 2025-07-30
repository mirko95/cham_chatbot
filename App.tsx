import React, { useState, useEffect, useCallback } from 'react';
import { getAnswer, sendContactEmail, Content } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ChatWindow } from './components/ChatWindow';
import { Message, ChatState, ContactInfo, Language, Theme } from './types';
import { DEFAULT_LOGO, DEFAULT_PRIMARY_COLOR, DEFAULT_PRIMARY_FOCUS_COLOR, supportedLanguages, translations, DEFAULT_BORDER_RADIUS, DEFAULT_FONT_FAMILY } from './constants';
import { PDF_CONTENT } from './pdfContent';

// Detect initial language
const getInitialLanguage = (): Language => {
  // 1️⃣ Try same-origin <html lang>
  try {
    const docLang = window.parent.document.documentElement.lang.split(/[-_]/)[0];
    if (supportedLanguages.includes(docLang as Language)) {
      return docLang as Language;
    }
  } catch {
    console.info("Same-origin lang access failed, likely cross-origin iframe.");
  }

  // 2️⃣ Fallback to browser language
  if (navigator.language) {
    const browserLang = navigator.language.split(/[-_]/)[0];
    if (supportedLanguages.includes(browserLang as Language)) {
      return browserLang as Language;
    }
  }

  // 3️⃣ Default to English
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

  // 🔹 Listen for theme changes via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CHAMELEON_THEME' && typeof event.data.theme === 'object') {
        setTheme(prev => ({ ...prev, ...event.data.theme }));
      }
      if (event.data?.type === 'CHAMELEON_LANGUAGE') {
        const newLang = event.data.lang?.split(/[-_]/)[0];
        if (newLang && supportedLanguages.includes(newLang as Language)) {
          setLanguage(newLang as Language);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'CHAMELEON_READY' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 🔹 Try to observe <html lang> if same-origin
  useEffect(() => {
    let observer: MutationObserver;
    try {
      const targetNode = window.parent.document.documentElement;
      observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
            const newLang = (mutation.target as HTMLElement).lang.split(/[-_]/)[0];
            if (supportedLanguages.includes(newLang as Language)) {
              setLanguage(newLang as Language);
            }
          }
        }
      });
      observer.observe(targetNode, { attributes: true, attributeFilter: ['lang'] });
    } catch {
      console.info("Language observer not set (likely cross-origin). Use postMessage from parent site.");
    }
    return () => observer?.disconnect();
  }, []);

  // 🔹 Apply theme styles
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--primary-color', theme.primaryColor);
    rootStyle.setProperty('--primary-focus-color', theme.primaryFocusColor);
    rootStyle.setProperty('--font-family', theme.fontFamily);

    const baseRadius = parseFloat(theme.borderRadius || '0');
    const unit = (theme.borderRadius || 'px').replace(/[0-9.]/g, '') || 'px';

    if (!isNaN(baseRadius)) {
      rootStyle.setProperty('--border-radius-lg', `${baseRadius}${unit}`);
      rootStyle.setProperty('--border-radius-xl', `${baseRadius * 1.5}${unit}`);
      rootStyle.setProperty('--border-radius-2xl', `${baseRadius * 2}${unit}`);
      rootStyle.setProperty('--border-radius-3xl', `${baseRadius * 3}${unit}`);
      rootStyle.setProperty('--border-radius-md', `${baseRadius * 0.75}${unit}`);
      rootStyle.setProperty('--border-radius', `${baseRadius * 0.5}${unit}`);
      rootStyle.setProperty('--border-radius-sm', `${baseRadius * 0.25}${unit}`);
    }
  }, [theme]);

  // 🔹 Reset greeting when language changes
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
          const finalContact = { ...contactInfo, phone, name: contactInfo.name!, email: contactInfo.email! } as ContactInfo;
          await sendContactEmail(finalContact);
          botResponse = t.contactSuccess.replace('{name}', finalContact.name);
          nextState = 'querying';
          setContactInfo({});
          break;
      }
    } catch {
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
      const isYes = t.affirmativeResponses.split(', ').some(resp => userInput.toLowerCase().includes(resp));
      setIsAwaitingContactConfirmation(false);
      if (isYes) {
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

    const triggers = t.contactTriggers.split(', ');
    if (triggers.some(trigger => userInput.toLowerCase().includes(trigger))) {
      setIsLoading(true);
      setChatState('collecting_name');
      addMessage(t.contactInitiate, 'bot');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const history = [
        ...messages.slice(1),
        { text: userInput, sender: 'user' as const, id: 0 }
      ].map(msg => ({
        role: msg.sender === 'bot' ? 'model' : 'user' as 'user' | 'model',
        parts: [{ text: msg.text }]
      }));

      const answer = await getAnswer(history, PDF_CONTENT, language);
      setIsAwaitingContactConfirmation(answer.includes(t.contactOfferTrigger));
      addMessage(answer, 'bot');
    } catch {
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
