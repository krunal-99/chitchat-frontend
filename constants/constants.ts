import { FormEvent, Dispatch, SetStateAction } from "react";
export const formFields = ["username", "email"];
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id: number | string;
  user_name: string;
  image_url?: string;
  is_online: boolean;
  email: string;
  last_message?: string | null;
  last_message_time?: Date | null;
}

export interface Message {
  id: number;
  senderId: number | string;
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
  isTyping: boolean;
  handleTyping: () => void;
  handleStopTyping: () => void;
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

export interface SideBarProps {
  token: string | null;
  setUsers: Dispatch<SetStateAction<User[]>>;
  selectedUser: User | null;
  setSelectedUser: Dispatch<SetStateAction<User | null>>;
  isMobileView: boolean;
  users: User[];
  currentUser: UserInfo | null;
  setShowChatViewMobile: Dispatch<SetStateAction<boolean>>;
  showChatViewMobile: boolean;
}

export const AI_USER: User = {
  id: "ai",
  user_name: "ChitChat AI",
  image_url: "/ai.png",
  is_online: true,
  email: "ai@chitchat.com",
  last_message: null,
  last_message_time: null,
};
