"use client";
import { getAllUsers } from "@/actions/serverActions";
import { logout, UserInfo } from "@/store/authSlice";
import { RootState } from "@/store/ReduxProvider";
import { handleError, handleSuccess } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { FaArrowLeft, FaSearch, FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoSend, IoSettingsOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

interface User {
  id: number;
  user_name: string;
  image_url?: string;
  is_online: boolean;
  email: string;
}

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatViewMobile, setShowChatViewMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setCurrentUser(
      localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!)
        : null
    );
  }, [localStorage]);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers(token!);
        console.log("User data", response);
        if (response.status === "success") {
          setUsers(response.users);
        } else {
          handleError(response.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        handleError("Error fetching users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setIsMessagesLoading(true);

      setTimeout(() => {
        const userMessages: Record<string, Message[]> = {
          user1: [
            {
              id: 11,
              senderId: selectedUser.id,
              text: "Hey Rohan! 👋 Long time no see.",
              timestamp: new Date(Date.now() - 60000 * 25),
            },
            {
              id: 1,
              senderId: 100,
              text: "Priya! Good to hear from you. How are things?",
              timestamp: new Date(Date.now() - 60000 * 24),
            },
            {
              id: 2,
              senderId: selectedUser.id,
              text: "All good here. What about you? Still in Bangalore?",
              timestamp: new Date(Date.now() - 60000 * 23),
            },
            {
              id: 3,
              senderId: 101,
              text: "Yep, same old! We should catch up sometime.",
              timestamp: new Date(Date.now() - 60000 * 22),
            },
            {
              id: 4,
              senderId: selectedUser.id,
              text: "Definitely! Haan, meeting at 5 PM works!",
              timestamp: new Date(Date.now() - 60000 * 5),
            },
          ],
          user3: [
            {
              id: 5,
              senderId: selectedUser.id,
              text: "Hey! Are you free this weekend?",
              timestamp: new Date(Date.now() - 60000 * 35),
            },
            {
              id: 6,
              senderId: 123,
              text: "I think so, why what's up?",
              timestamp: new Date(Date.now() - 60000 * 34),
            },
            {
              id: 7,
              senderId: selectedUser.id,
              text: "Movie plan for weekend? 🍿 Thinking of that new Marvel one.",
              timestamp: new Date(Date.now() - 60000 * 30),
            },
            {
              id: 8,
              senderId: 123,
              text: "Sounds great! Count me in.",
              timestamp: new Date(Date.now() - 60000 * 29),
            },
          ],
        };
        setMessages(
          userMessages[selectedUser.id] || [
            {
              id: "fallback",
              senderId: selectedUser.id,
              text: `Hi, I'm ${selectedUser.user_name}. Let's chat!`,
              timestamp: new Date(),
            },
          ]
        );
        setIsMessagesLoading(false);
      }, 800);

      if (isMobileView) setShowChatViewMobile(true);
    } else {
      setMessages([]);
      setIsMessagesLoading(false);
      if (isMobileView) setShowChatViewMobile(false);
    }
  }, [selectedUser, isMobileView, currentUser]);

  useEffect(() => {
    if (messages.length && !isMessagesLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoading]);

  const handleSelectUser = (user: User) => setSelectedUser(user);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedUser || !currentUser) return;
    const myMessage: Message = {
      id: 100,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, myMessage]);
    setNewMessage("");
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    handleSuccess("Logged out successfully");
  };

  const filteredUsers = users.filter((user) =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserListSkeleton = () => (
    <div className="p-3 space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center p-3 space-x-3.5 rounded-xl"
        >
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 bg-slate-700 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-slate-600 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-slate-600 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="h-3 bg-slate-600 rounded animate-pulse w-10"></div>
        </div>
      ))}
    </div>
  );

  const ChatLoadingSkeleton = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/70">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`flex ${
            index % 2 === 0 ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-[70%] md:max-w-[60%] px-4 py-3 rounded-t-xl space-y-2 ${
              index % 2 === 0
                ? "bg-slate-700 rounded-r-xl"
                : "bg-sky-500/20 rounded-l-xl"
            }`}
          >
            <div className="h-4 bg-slate-600 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-slate-600 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-slate-500 rounded animate-pulse w-16 mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
    </div>
  );

  const UserListItem = ({
    user,
    onSelectUser,
    isSelected,
  }: {
    user: User;
    onSelectUser: (user: User) => void;
    isSelected: boolean;
  }) => (
    <li
      onClick={() => onSelectUser(user)}
      className={`flex items-center p-3 space-x-3.5 cursor-pointer rounded-xl transition-all duration-200 ease-in-out group
                  ${
                    isSelected
                      ? "bg-sky-600 shadow-lg"
                      : "hover:bg-slate-700/60"
                  }`}
    >
      <div className="relative flex-shrink-0">
        {user.image_url ? (
          <img
            src={user.image_url}
            alt={user.user_name}
            className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-sky-700 transition-all duration-200"
          />
        ) : (
          <FaUserAlt className="w-11 h-11 text-slate-500" />
        )}
        {user.is_online && (
          <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-slate-800 ring-1 ring-green-400"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold truncate ${
            isSelected ? "text-white" : "text-slate-100"
          }`}
        >
          {user.user_name}
        </p>
      </div>
    </li>
  );

  const ChatView = () => (
    <div className="flex flex-col h-full bg-slate-800 shadow-xl md:rounded-r-2xl overflow-hidden">
      <header className="flex items-center p-4 border-b border-slate-700 shadow-sm sticky top-0 bg-slate-800 z-10">
        {isMobileView && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowChatViewMobile(false);
            }}
            className="mr-2 p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <FaArrowLeft />
          </button>
        )}
        {selectedUser?.image_url ? (
          <img
            src={selectedUser.image_url}
            alt={selectedUser.user_name}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
        ) : (
          <FaUserAlt />
        )}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-50">
            {selectedUser?.user_name}
          </h2>
          <p
            className={`text-xs flex items-center ${
              selectedUser?.is_online ? "text-green-500" : "text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                selectedUser?.is_online ? "bg-green-500" : "bg-slate-400"
              }`}
            ></span>
            {selectedUser?.is_online ? "Online" : "Offline"}
          </p>
        </div>
        {isMessagesLoading && (
          <div className="flex items-center space-x-2 text-slate-400">
            <LoadingSpinner />
            <span className="text-xs">Loading messages...</span>
          </div>
        )}
      </header>

      {isMessagesLoading ? (
        <ChatLoadingSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/70 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] md:max-w-[60%] px-4 py-2.5 rounded-t-xl shadow-md ${
                  msg.senderId === currentUser?.id
                    ? "bg-sky-500 text-white rounded-l-xl"
                    : "bg-slate-700 text-slate-100 rounded-r-xl"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.text}
                </p>
                <p
                  className={`text-[10px] mt-1.5 opacity-80 ${
                    msg.senderId === currentUser?.id
                      ? "text-sky-100"
                      : "text-slate-400"
                  } ${
                    msg.senderId === currentUser?.id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-700 bg-slate-800 sticky bottom-0"
      >
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewMessage(e.target.value)
            }
            placeholder="Aaah, type something cool..."
            className="flex-1 p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-slate-700/80 text-slate-100 transition-all duration-150 focus:shadow-lg placeholder-slate-500"
            disabled={isMessagesLoading}
          />
          <button
            type="submit"
            disabled={isMessagesLoading}
            className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-slate-800 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSend />
          </button>
        </div>
      </form>
    </div>
  );

  const NoChatSelectedView = () => (
    <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-gradient-to-br from-slate-800/70 to-slate-900/80 p-10 md:rounded-r-2xl">
      <div>
        <svg
          className="w-40 h-40 text-sky-600 mx-auto mb-8 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <line x1="9" y1="10" x2="15" y2="10"></line>
          <line x1="9" y1="13" x2="13" y2="13"></line>
        </svg>
        <h2 className="text-2xl font-semibold text-slate-200 mb-2">
          ChitChat Central
        </h2>
        <p className="text-slate-400 max-w-sm mx-auto">
          Select a friend from the list to start a conversation or share your
          awesome thoughts!
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen antialiased text-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950">
      <aside
        className={` ${
          isMobileView && showChatViewMobile ? "hidden" : "flex"
        } flex-col md:w-80 lg:w-96 w-full border-r border-slate-700/50 bg-slate-800/80 backdrop-blur-lg md:rounded-l-2xl md:m-2 md:my-2 md:ml-2 shadow-2xl overflow-hidden relative`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-600 rounded-full animate-spin border-t-sky-500"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-spin border-t-sky-400 animate-reverse"></div>
              </div>
              <div className="text-slate-300 font-medium text-sm">
                Loading contacts...
              </div>
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div className="p-4 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold text-sky-500 tracking-tight">
            ChitChat
          </h1>
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full p-2.5 pl-10 border border-slate-600 rounded-lg bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-500 text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <UserListSkeleton />
          ) : (
            <ul className="p-3 space-y-1.5">
              {filteredUsers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  onSelectUser={handleSelectUser}
                  isSelected={selectedUser?.id === user.id}
                />
              ))}
              {filteredUsers.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <FaUserAlt className="text-slate-500 text-xl" />
                  </div>
                  <p className="text-slate-400 text-sm">No contacts found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Try adjusting your search
                  </p>
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
                onClick={() => alert("Navigate to profile page")}
              >
                {currentUser.image_url ? (
                  <img
                    src={currentUser.image_url}
                    alt={currentUser.user_name}
                    className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-sky-400"
                  />
                ) : (
                  <FaUserAlt />
                )}
                <span className="font-semibold text-sm text-slate-100 group-hover:text-sky-400">
                  {currentUser.user_name}
                </span>
              </div>
              <button
                onClick={() => alert("Navigate to profile page")}
                className="p-2 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
                title="Profile Settings"
              >
                <IoSettingsOutline />
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
          <ChatView key={selectedUser.id} />
        ) : (
          <NoChatSelectedView key="nochat_placeholder" />
        )}
      </main>
    </div>
  );
}
