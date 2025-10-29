import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '@/services/chatService';

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

interface Chat {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const response = await chatService.getUserChats();
  return response.chats;
});

export const fetchChatById = createAsyncThunk(
  'chat/fetchChatById',
  async (chatId: string) => {
    const response = await chatService.getChatById(chatId);
    return response;
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (title?: string) => {
    const response = await chatService.createChat(title);
    return response.chat;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(chatId, content);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch chats';
      })
      .addCase(fetchChatById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChat = action.payload.chat;
        state.messages = action.payload.messages;
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch chat';
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
        state.messages = [];
      })
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload.message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });
  },
});

export const { addUserMessage, clearCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;
