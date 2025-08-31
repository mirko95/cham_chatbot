import React, { useState, useEffect, useCallback } from 'react';
import { getAnswer, sendContactEmail, Content } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { ChatWindow } from './components/ChatWindow';
import { Message, ChatState, ContactInfo, Language, Theme } from './types';
import { DEFAULT_LOGO, DEFAULT_PRIMARY_COLOR, DEFAULT_PRIMARY_FOCUS_COLOR, supportedLanguages, translations, DEFAULT_BORDER_RADIUS, DEFAULT_FONT_FAMILY } from './constants';
import { PDF_CONTENT } from './pdfContent';

/**
 * getInitialLanguage
 * -------------------------
 * Detects initial chat language:
 * 1️⃣ Attempts to read <html lang> from parent document (if same-origin)
 * 2️⃣ Falls back to browser language
 * 3️⃣ Defaults to English ('en')
 */
const getInitialLanguage = (): Language => {
  try {
    const docLang = window.parent.document.documentElement.lang.split(/[-_]/)[0];
    if (supportedLanguages.includes(docLang as Language)) {
      return docLang as Language;
    }
  } catch {
    console.info("Same-origin lang access failed, likely cross-origin iframe.");
  }

  if (navigator.language) {
    const browserLang = navigator.language.split(/[-_]/)[0];
    if (supportedLanguages.includes(browserLang as Language)) {
      return browserLang as Language;
    }
  }

  return 'en';
};

const App: React.FC = () => {
  /** -------------------------
   * State Management
   ------------------------- */
  const [isOpen, setIsOpen] = useState(false);                       // Controls chat open/close
  const [language, setLanguage] = useState<Language>(getInitialLanguage); // Active chat language
  const [messages, setMessages] = useState<Message[]>([]);           // Chat conversation history
  const [isLoading, setIsLoading] = useState(false);                 // Bot "typing" indicator
  const [chatState, setChatState] = useState<ChatState>('querying'); // Current chat workflow state
  const [contactInfo, setContactInfo] = useState<Partial<ContactInfo>>({}); // Temporary contact form data
  const [isAwaitingContactConfirmation, setIsAwaitingContactConfirmation] = useState(false); // Whether user is deciding to start contact form

  // Theme customization (dynamic from parent site)
  const [theme, setTheme] = useState<Theme>({
    primaryColor: DEFAULT_PRIMARY_COLOR,
    primaryFocusColor: DEFAULT_PRIMARY_FOCUS_COLOR,
    logoUrl: DEFAULT_LOGO,
    borderRadius: DEFAULT_BORDER_RADIUS,
    fontFamily: DEFAULT_FONT_FAMILY,
  });

  /** -------------------------
   * Theme & Language Sync via postMessage
   * - Listens for theme changes or language updates from parent website
   ------------------------- */
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
    window.parent.postMessage({ type: 'CHAMELEON_READY' }, '*'); // Notify parent frame that chatbot is ready
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /** -------------------------
   * Same-Origin <html lang> Observer
   * - Updates language if parent document <html lang> changes dynamically
   ------------------------- */
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

  /** -------------------------
   * Apply Dynamic Theme Styles
   * - Updates CSS variables for primary color, focus color, font, and border radius
   ------------------------- */
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

  /** -------------------------
   * Reset Greeting Message when Language Changes
   * - Displays initial bot greeting in the new language
   ------------------------- */
  useEffect(() => {
    setMessages([{ id: Date.now(), text: translations[language].greeting, sender: 'bot' }]);
  }, [language]);

  /** -------------------------
   * Helper: Add Message to Chat
   ------------------------- */
  const addMessage = useCallback((text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender }]);
  }, []);

  /** -------------------------
   * handleContactFlow
   * - Guides user through multi-step contact info collection
   * - Validates email format
   * - Submits collected contact info via sendContactEmail()
   ------------------------- */
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
            botResponse = t.contactEmailInvalid; // Invalid email
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

  /** -------------------------
   * handleSubmit
   * - Processes user input:
   *   1. Handles contact confirmation flow
   *   2. Triggers contact form flow if keyword detected
   *   3. Sends query to Gemini AI if normal question
   ------------------------- */
  const handleSubmit = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;
    addMessage(userInput, 'user');
    const t = translations[language];

    // Handle contact confirmation (Yes/No)
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

    // If in contact collection flow
    if (chatState !== 'querying') {
      handleContactFlow(userInput);
      return;
    }

    // Detect contact triggers (e.g., "talk to sales")
    const triggers = t.contactTriggers.split(', ');
    if (triggers.some(trigger => userInput.toLowerCase().includes(trigger))) {
      setIsLoading(true);
      setChatState('collecting_name');
      addMessage(t.contactInitiate, 'bot');
      setIsLoading(false);
      return;
    }

    // Standard Q&A flow → send question to Gemini
    setIsLoading(true);
    try {
      const history = [
        ...messages.slice(1), // Exclude initial greeting
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

  /** -------------------------
   * Render Chat UI
   ------------------------- */
  return (
    // Updated wrapper: fills the iframe and anchors content bottom-right
    <div className="fixed inset-0 flex items-end justify-end z-50 p-0">
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
      {/* Bubble constrained to the 56px footprint of the closed iframe */}
      <div className="w-14 h-14 flex items-center justify-center">
        <ChatBubble isOpen={isOpen} onClick={() => setIsOpen(true)} />
      </div>
    </div>
  );
};

export default App;
