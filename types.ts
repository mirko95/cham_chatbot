
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export interface KnowledgeBaseEntry {
  path: string;
  keywords: string[];
  content: string;
}

export type ChatState = 'querying' | 'collecting_name' | 'collecting_email' | 'collecting_message';

export interface ContactInfo {
  name: string;
  email: string;
  message: string;
}
