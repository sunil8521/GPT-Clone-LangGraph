import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true; // IMPORTANT for auth!
const API_URL = import.meta.env.VITE_SERVERURL;

interface ChatSession {
  _id: string;
  threadId: string;
  title: string;
  updatedAt: string;
}

interface Message {
  role: 'user' | 'assistant' | 'ai';
  content: string;
}

interface ChatStore {
  sidebarChats: ChatSession[];
  currentMessages: Message[];
  isLoadingHistory: boolean;
  isGenerating: boolean;
  fetchSidebarChats: () => Promise<void>;
  createNewChat: () => Promise<string | null>;
  fetchHistory: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, content: string) => Promise<void>;
  clearCurrentChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sidebarChats: [],
  currentMessages: [],
  isLoadingHistory: false,
  isGenerating: false,

  fetchSidebarChats: async () => {
    try {
      const res = await axios.get(`${API_URL}/chats`);
      if (res.data.success) {
        set({ sidebarChats: res.data.chats });
      }
    } catch (error) {
      console.error('Failed to fetch sidebar chats', error);
    }
  },

  createNewChat: async () => {
    try {
      const res = await axios.post(`${API_URL}/chats`);
      if (res.data.success) {
        // Prepend new chat to sidebar
        set((state) => ({ sidebarChats: [res.data.chat, ...state.sidebarChats] }));
        return res.data.chat.threadId;
      }
      return null;
    } catch (error) {
      console.error('Failed to create chat', error);
      return null;
    }
  },

  fetchHistory: async (threadId) => {
    set({ isLoadingHistory: true, currentMessages: [] });
    try {
      const res = await axios.get(`${API_URL}/chats/${threadId}/history`);
      if (res.data.success) {
        // LangGraph returns messages as [{ type: 'human', content: '...' }, { type: 'ai', content: '...' }]
        // We map them to our UI format
        const formatted = res.data.messages.map((m: any) => ({
          role: m.type === 'human' || m.id?.includes('HumanMessage') ? 'user' : 'ai',
          content: m.content || m.kwargs?.content
        }));
        set({ currentMessages: formatted });
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  sendMessage: async (threadId, content) => {
    // Optimistically add user message to UI
    set((state) => ({
      currentMessages: [...state.currentMessages, { role: 'user', content }],
      isGenerating: true
    }));

    try {
      const res = await axios.post(`${API_URL}/chats/${threadId}/message`, { message: content });
      if (res.data.success) {
        // Add AI response to UI
        set((state) => ({
          currentMessages: [...state.currentMessages, { role: 'ai', content: res.data.message }]
        }));
        // Refetch sidebar in case the title was updated (first message sent)
        get().fetchSidebarChats();
      }
    } catch (error) {
      console.error('Failed to send message', error);
      // Could show an error toast here
    } finally {
      set({ isGenerating: false });
    }
  },

  clearCurrentChat: () => {
    set({ currentMessages: [] });
  }
}));
