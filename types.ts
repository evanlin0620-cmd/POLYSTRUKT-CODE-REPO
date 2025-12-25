

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  prompt?: string;
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: Attachment;
  // Included 'none' to handle cases where simulation is not applicable but the field is present
  simulationType?: 'stress' | 'thermal' | 'flow' | 'none';
  has3DModel?: boolean;
  modelUrl?: string;
  focusPart?: string;
}

export interface SavedSession {
  id: number;
  name: string;
  date: string;
  messages: ChatMessage[];
}

export interface StatItem {
  label: string;
  value: string;
  desc: string;
}