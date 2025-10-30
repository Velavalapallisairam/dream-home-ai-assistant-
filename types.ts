
export enum AppMode {
  Analyze = 'Analyze Floor Plan',
  Generate = 'Generate Interior',
  Edit = 'Edit Interior',
  Chat = 'Chat with Assistant',
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
