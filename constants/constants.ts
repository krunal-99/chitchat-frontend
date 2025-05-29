import { FormEvent } from "react";

export const formFields = ["username", "email"];
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id: number;
  user_name: string;
  image_url?: string;
  is_online: boolean;
  email: string;
  last_message?: string | null;
  last_message_time?: Date | null;
}

export interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: Date;
}

export interface UserListItemProps {
  user: User;
  onSelectUser: (user: User) => void;
  isSelected: boolean;
}

export interface ChatViewProps {
  isMobileView: boolean;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  setShowChatViewMobile: (show: boolean) => void;
  currentUser: UserInfo | null;
  isMessagesLoading: boolean;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (e: FormEvent) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
}

export interface UserInfo {
  id: number;
  user_name: string;
  email: string;
  image_url: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
}
