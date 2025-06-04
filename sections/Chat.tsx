"use client";
import { getMessages } from "@/actions/serverActions";
import { ChatView } from "@/components/ChatView";
import { NoChatSelectedView } from "@/components/NoChatSelectedView";
import { API_URL, Message, User, UserInfo } from "@/constants/constants";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/ReduxProvider";
import { handleError } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import Sidebar from "./Sidebar";
export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatViewMobile, setShowChatViewMobile] = useState(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { token } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        dispatch(logout());
        router.push("/login");
      }
    } else {
      setCurrentUser(null);
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    socketRef.current = io(API_URL, {
      auth: { token: `Bearer ${token}` },
    });
    const socket = socketRef.current;
    socket.on("connect", () => {
      setSocketConnected(true);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
      if (error.message.includes("token")) {
        dispatch(logout());
        router.push("/login");
      }
    });
    socket.on("error", ({ message }) => {
      handleError(message);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, router, dispatch]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handleUserStatus = ({
      userId,
      isOnline,
    }: {
      userId: number;
      isOnline: boolean;
    }) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_online: isOnline } : user
        )
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, is_online: isOnline } : null
        );
      }
    };
    const handleMessage = (message: Message) => {
      if (
        selectedUser &&
        (message.senderId === selectedUser.id ||
          message.senderId === currentUser?.id)
      ) {
        setMessages((prev) => [
          ...prev,
          { ...message, timestamp: new Date(message.timestamp) },
        ]);
      }
    };
    const handleUserUpdate = ({
      userId,
      last_message,
      last_message_time,
    }: {
      userId: number;
      last_message: string;
      last_message_time: Date;
    }) => {
      if (userId !== currentUser?.id) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  last_message,
                  last_message_time: new Date(last_message_time),
                }
              : user
          )
        );
      }
    };
    const handleTyping = ({ userId }: { userId: number }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(true);
      }
    };
    const handleStopTyping = ({ userId }: { userId: number }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(false);
      }
    };
    socket.on("userStatus", handleUserStatus);
    socket.on("message", handleMessage);
    socket.on("userUpdate", handleUserUpdate);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser && token) {
      setIsMessagesLoading(true);
      setMessages([]);
      const fetchMessages = async () => {
        try {
          const response = await getMessages(token!, selectedUser.id);
          if (response.status === "success") {
            setMessages(response.data);
            socketRef.current?.emit("joinChat", selectedUser.id);
          } else {
            handleError(response.message || "Failed to load messages");
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          handleError("Failed to load messages");
        } finally {
          setIsMessagesLoading(false);
        }
      };
      fetchMessages();
      if (isMobileView) setShowChatViewMobile(true);
    } else {
      setMessages([]);
      if (isMobileView) setShowChatViewMobile(false);
    }
  }, [selectedUser, currentUser, isMobileView, token]);

  useEffect(() => {
    if (messages?.length && !isMessagesLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedUser || !currentUser) return;
    socketRef.current?.emit("sendMessage", {
      receiverId: selectedUser.id,
      text: newMessage,
    });
    setNewMessage("");
    (e.target as HTMLFormElement).querySelector("input")?.blur();
  };

  const handleTyping = () => {
    if (selectedUser && socketConnected) {
      socketRef.current?.emit("typing", { receiverId: selectedUser.id });
    }
  };
  const handleStopTyping = () => {
    if (selectedUser && socketConnected) {
      socketRef.current?.emit("stopTyping", { receiverId: selectedUser.id });
    }
  };
  return (
    <div className="flex h-screen antialiased text-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950">
      <Sidebar
        token={token}
        setUsers={setUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        isMobileView={isMobileView}
        users={users}
        currentUser={currentUser}
        setShowChatViewMobile={setShowChatViewMobile}
        showChatViewMobile={showChatViewMobile}
      />
      <main
        className={`flex-1 ${
          isMobileView && !showChatViewMobile ? "hidden" : "flex"
        } flex-col md:my-2 md:mr-2`}
      >
        {selectedUser ? (
          <ChatView
            key={selectedUser.id}
            isMobileView={isMobileView}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setShowChatViewMobile={setShowChatViewMobile}
            currentUser={currentUser}
            isMessagesLoading={isMessagesLoading}
            messages={messages}
            messagesEndRef={messagesEndRef}
            handleSendMessage={handleSendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleTyping={handleTyping}
            handleStopTyping={handleStopTyping}
            isTyping={isTyping}
          />
        ) : (
          <NoChatSelectedView key="nochat_placeholder" />
        )}
      </main>
    </div>
  );
}
