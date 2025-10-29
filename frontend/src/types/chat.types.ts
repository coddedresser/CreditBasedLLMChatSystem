export interface Message {
  id: number;
  chat_id?: number;
  role: 'user' | 'assistant' | string;   // ✅ Allow any string fallback
  content: string;
  tokens_used?: number;
  created_at: string;
}


export interface Chat {
  id: number;
  user_id: number;
  organization_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatResponse {
  chat: Chat;
  messages: Message[];
}