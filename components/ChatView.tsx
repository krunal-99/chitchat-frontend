import { FaArrowLeft, FaUserAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { Message, User, UserInfo } from "@/constants/constants";
import { ChangeEvent, FormEvent } from "react";

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
          <img
            src={selectedUser.image_url}
            alt={selectedUser.user_name}
            className="w-10 h-10 rounded-full mr-3 object-cover"
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
