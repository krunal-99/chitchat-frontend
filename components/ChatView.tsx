import { FaArrowLeft, FaUserAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { Message, User, UserInfo, AI_USER } from "@/constants/constants";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface ChatViewProps {
  isMobileView: boolean;
  selectedUser: User;
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

export function ChatView({
  isMobileView,
  selectedUser,
  setSelectedUser,
  setShowChatViewMobile,
  currentUser,
  isMessagesLoading,
  messages,
  messagesEndRef,
  handleSendMessage,
  newMessage,
  setNewMessage,
  isTyping,
  handleTyping,
  handleStopTyping,
}: ChatViewProps) {
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  useEffect(() => {
    if (selectedUser.id === "ai") {
      setShowWelcome(false);
      const timer = setTimeout(() => setShowWelcome(true), 200);
      return () => clearTimeout(timer);
    }
  }, [selectedUser]);

  if (selectedUser.id === "ai") {
    const hasMessages = messages && messages.length > 0;
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-800 via-slate-900 to-sky-900 shadow-xl md:rounded-r-2xl overflow-hidden">
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
          <Image
            src={AI_USER.image_url || "/ai.png"}
            alt={AI_USER.user_name}
            className="rounded-full mr-3 object-cover invert"
            width={40}
            height={40}
          />
          <div>
            <h2 className="text-lg font-semibold text-sky-400 drop-shadow">
              {AI_USER.user_name}
            </h2>
            <p className="text-xs flex items-center text-green-400">
              <span className="w-2 h-2 rounded-full mr-1.5 bg-green-500"></span>
              Online
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/70 custom-scrollbar">
          {isMessagesLoading ? (
            <div className="text-center text-slate-400">
              Loading messages...
            </div>
          ) : hasMessages ? (
            messages.map((msg) => (
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
                  {msg.senderId === "ai" ? (
                    <div className="prose prose-invert max-w-none prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-code:bg-slate-800 prose-code:text-sky-300 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-strong:font-bold prose-em:italic prose-li:marker:text-sky-400">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  )}
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
            ))
          ) : (
            <div
              className={`flex flex-col items-center justify-center h-full transition-opacity duration-1000 ${
                showWelcome ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src="/ai.png"
                alt="AI"
                width={100}
                height={100}
                className="mb-4 animate-bounce invert"
              />
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text mb-2 animate-fade-in">
                Welcome to ChitChat AI!
              </h1>
              <p className="text-lg text-slate-200 text-center max-w-xl animate-fade-in-slow">
                I am your smart assistant. Ask me anything, get instant answers,
                or just have a fun chat!
                <br />
                <span className="text-sky-400">Try asking:</span>{" "}
                <span className="italic">Tell me a joke</span> or{" "}
                <span className="italic">Summarize the latest tech news</span>.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <span className="px-4 py-2 bg-sky-700/80 rounded-full text-slate-100 text-sm shadow">
                  ✨ AI-powered responses
                </span>
                <span className="px-4 py-2 bg-slate-700/80 rounded-full text-slate-100 text-sm shadow">
                  💬 Always available
                </span>
              </div>
            </div>
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-400 px-4 py-2 rounded-xl">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-slate-700 bg-slate-800 sticky bottom-0"
        >
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder="Type your message to AI..."
              className="flex-1 p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-slate-700/80 text-slate-100 transition-all duration-150 focus:shadow-lg placeholder-slate-500"
            />
            <button
              type="submit"
              className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-slate-800 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <IoSend />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
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
        {selectedUser.image_url ? (
          <Image
            src={selectedUser.image_url}
            alt={selectedUser.user_name}
            className="rounded-full mr-3 object-cover"
            width={40}
            height={40}
          />
        ) : (
          <FaUserAlt className="w-10 h-10 text-slate-500 mr-3" />
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            {selectedUser.user_name}
          </h2>
          <p
            className={`text-xs flex items-center ${
              selectedUser.is_online ? "text-green-500" : "text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                selectedUser.is_online ? "bg-green-500" : "bg-slate-400"
              }`}
            ></span>
            {selectedUser.is_online ? "Online" : "Offline"}
          </p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/70 custom-scrollbar">
        {isMessagesLoading ? (
          <div className="text-center text-slate-400">Loading messages...</div>
        ) : (
          messages.map((msg) => (
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
                {msg.senderId === "ai" ? (
                  <div className="prose prose-invert max-w-none prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-code:bg-slate-800 prose-code:text-sky-300 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-strong:font-bold prose-em:italic prose-li:marker:text-sky-400">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}
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
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-400 px-4 py-2 rounded-xl">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-700 bg-slate-800 sticky bottom-0"
      >
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={handleStopTyping}
            placeholder="Aaah, type something cool..."
            className="flex-1 p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-slate-700/80 text-slate-100 transition-all duration-150 focus:shadow-lg placeholder-slate-500"
          />
          <button
            type="submit"
            className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-slate-800 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
          >
            <IoSend />
          </button>
        </div>
      </form>
    </div>
  );
}
