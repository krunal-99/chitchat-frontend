"use client";
import { getAllUsers, getMessages } from "@/actions/serverActions";
import { ChatView } from "@/components/ChatView";
import { LoadingContacts } from "@/components/LoadingSpinner";
import { NoChatSelectedView } from "@/components/NoChatSelectedView";
import { UserListItem } from "@/components/UserListItem";
import UserListSkeleton from "@/components/UserListSkeleton";
import { API_URL, Message, User, UserInfo } from "@/constants/constants";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/ReduxProvider";
import { handleError, handleSuccess } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { FaSearch, FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      socket.emit("setup");
    });

    socket.on("users", (users: User[]) => {
      setUsers(users);
    });

    socket.on(
      "userStatus",
      ({ userId, isOnline }: { userId: number; isOnline: boolean }) => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_online: isOnline } : user
          )
        );
      }
    );

    socket.on("message", (message: Message) => {
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
    });

    socket.on("userUpdate", ({ userId, last_message, last_message_time }) => {
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
    });

    socket.on("typing", ({ userId }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", ({ userId }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(false);
      }
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
  }, [token, currentUser, router, dispatch, selectedUser]);

  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers(token!);
        if (response.status === "success") {
          setUsers(response.users);
        } else {
          handleError(response.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        handleError("Error fetching users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

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

            setMessages([
              {
                id: Date.now(),
                senderId: selectedUser.id,
                text: `Hi, I'm ${selectedUser.user_name}. Let's start chatting! (Could not load history)`,
                timestamp: new Date(),
              },
            ]);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          handleError("Failed to load messages");
          setMessages([
            {
              id: Date.now(),
              senderId: selectedUser.id,
              text: `Hi, I'm ${selectedUser.user_name}. Let's start chatting! (Error loading history)`,
              timestamp: new Date(),
            },
          ]);
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

  const handleSelectUser = (user: User) => {
    if (selectedUser?.id !== user.id) {
      setSelectedUser(user);
    } else if (isMobileView) {
      setShowChatViewMobile(true);
    }
  };

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

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    handleSuccess("Logged out successfully");
  };

  const filteredUsers = users.filter(
    (user) =>
      currentUser &&
      searchTerm &&
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen antialiased text-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950">
      <aside
        className={` ${
          isMobileView && showChatViewMobile ? "hidden" : "flex"
        } flex-col md:w-80 lg:w-96 w-full border-r border-slate-700/50 bg-slate-800/80 backdrop-blur-lg md:rounded-l-2xl md:m-2 md:my-2 md:ml-2 shadow-2xl overflow-hidden relative`}
      >
        {isLoading && users.length === 0 && <LoadingContacts />}
        <div className="p-4 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold text-sky-500 tracking-tight">
            ChitChat
          </h1>
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full p-2.5 pl-10 border border-slate-600 rounded-lg bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-500 text-sm"
              disabled={isLoading && users.length === 0}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading && users.length === 0 ? (
            <UserListSkeleton />
          ) : (
            <ul className="p-3 space-y-1.5">
              {filteredUsers.length > 0
                ? filteredUsers.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      onSelectUser={handleSelectUser}
                      isSelected={selectedUser?.id === user.id}
                    />
                  ))
                : users
                    .sort((a, b) => {
                      if (!a.last_message_time) return 1;
                      if (!b.last_message_time) return -1;
                      return (
                        new Date(b.last_message_time!).getTime() -
                        new Date(a.last_message_time!).getTime()
                      );
                    })
                    .map((user) => (
                      <UserListItem
                        key={user.id}
                        user={user}
                        onSelectUser={handleSelectUser}
                        isSelected={selectedUser?.id === user.id}
                      />
                    ))}
              {users.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <FaUserAlt className="text-slate-500 text-xl" />
                  </div>
                  <p className="text-slate-400 text-sm">
                    {users.length > 0
                      ? "No contacts match your search"
                      : "No contacts available"}
                  </p>
                  {users.length > 0 && (
                    <p className="text-slate-500 text-xs mt-1">
                      Try adjusting your search
                    </p>
                  )}
                </div>
              )}
            </ul>
          )}
        </div>

        <div className="p-3 border-t border-slate-700/50 mt-auto">
          {currentUser && (
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center space-x-2.5 group cursor-pointer"
                onClick={() =>
                  alert(
                    "Navigate to profile page for: " + currentUser.user_name
                  )
                }
              >
                {currentUser.image_url ? (
                  <img
                    src={currentUser.image_url}
                    alt={currentUser.user_name}
                    className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-sky-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 group-hover:ring-sky-400 ring-2 ring-transparent">
                    <FaUserAlt size={20} />
                  </div>
                )}
                <span className="font-semibold text-sm text-slate-100 group-hover:text-sky-400">
                  {currentUser.user_name}
                </span>
              </div>
              <button
                onClick={() => alert("Navigate to profile settings")}
                className="p-2 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
                title="Profile Settings"
              >
                <IoSettingsOutline size={20} />
              </button>
            </div>
          )}
          <div className="flex items-center justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-red-400 hover:bg-red-700/30 
               active:bg-red-700/50 rounded-lg transition-colors duration-150 ease-in-out group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-slate-800 cursor-pointer"
              title="Logout"
            >
              <span>Logout</span>
              <FiLogOut
                size={18}
                className="transition-transform duration-150 ease-in-out group-hover:scale-110"
              />
            </button>
          </div>
        </div>
      </aside>

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
