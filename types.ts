export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export type ChatState = 'querying' | 'collecting_name' | 'collecting_company' | 'collecting_email' | 'collecting_phone';

export interface ContactInfo {
  name: string;
  company?: string;
  email: string;
  phone?: string;
}

export type Language = 'it' | 'el' | 'de' | 'en';

export interface Theme {
    primaryColor: string;
    primaryFocusColor: string;
    logoUrl: string;
    borderRadius: string;
    fontFamily: string;
}