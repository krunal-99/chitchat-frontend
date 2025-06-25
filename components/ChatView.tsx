import { FaArrowLeft, FaUserAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { AI_USER, ChatViewProps } from "@/constants/constants";
import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  useEffect(() => {
    if (streamingMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamingMessage, messages]);

  useEffect(() => {
    setStreamingMessage(null);
    setIsStreaming(false);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser.id === "ai") {
      setShowWelcome(false);
      const timer = setTimeout(() => setShowWelcome(true), 200);
      return () => clearTimeout(timer);
    }
  }, [selectedUser]);

  const markdownComponents = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-lg text-xs sm:text-sm"
            wrapLines={true}
            wrapLongLines={true}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded font-mono text-xs sm:text-sm break-words"
          {...props}
        >
          {children}
        </code>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-600 text-xs sm:text-sm">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-slate-800">{children}</thead>;
    },
    th({ children }) {
      return (
        <th className="border border-slate-600 px-2 py-1 sm:px-4 sm:py-2 text-sky-400 font-semibold">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border border-slate-600 px-2 py-1 sm:px-4 sm:py-2 text-slate-100 break-words">
          {children}
        </td>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-sky-500 pl-3 sm:pl-4 italic text-slate-200 text-xs sm:text-sm">
          {children}
        </blockquote>
      );
    },
    ul({ children }) {
      return (
        <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-slate-100 text-xs sm:text-sm">
          {children}
        </ul>
      );
    },
    ol({ children }) {
      return (
        <ol className="list-decimal pl-4 sm:pl-6 space-y-1 text-slate-100 text-xs sm:text-sm">
          {children}
        </ol>
      );
    },
    li({ children }) {
      return <li className="text-slate-100">{children}</li>;
    },
    img({ src, alt }) {
      return (
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className="rounded-lg w-full max-w-[90%] sm:max-w-[600px] h-auto mx-auto"
        />
      );
    },
  };

  if (selectedUser.id === "ai") {
    const hasMessages = messages && messages.length > 0;
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-800 via-slate-900 to-sky-900 shadow-xl md:rounded-r-2xl overflow-hidden">
        <header className="flex items-center p-2 sm:p-4 border-b border-slate-700 shadow-sm sticky top-0 bg-slate-800 z-10">
          {isMobileView && (
            <button
              onClick={() => {
                setSelectedUser(null);
                setShowChatViewMobile(false);
              }}
              className="mr-2 p-1 sm:p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Back to user list"
            >
              <FaArrowLeft className="text-base sm:text-lg" />
            </button>
          )}
          <Image
            src={AI_USER.image_url || "/ai.png"}
            alt={AI_USER.user_name}
            className="rounded-full mr-2 sm:mr-3 object-cover invert"
            width={32}
            height={32}
            sizes="(max-width: 640px) 32px, 40px"
          />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-sky-400 drop-shadow">
              {AI_USER.user_name}
            </h2>
            <p className="text-xs sm:text-sm flex items-center text-green-400">
              <span className="w-2 h-2 rounded-full mr-1 sm:mr-1.5 bg-green-500"></span>
              Online
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-slate-900/70 custom-scrollbar">
          {isMessagesLoading ? (
            <div className="text-center text-slate-400 text-xs sm:text-sm">
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
                  className={`max-w-[80%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl shadow-md overflow-hidden ${
                    msg.senderId === currentUser?.id
                      ? "bg-sky-500 text-white rounded-l-xl"
                      : "bg-slate-700 text-slate-100 rounded-r-xl"
                  }`}
                >
                  {msg.senderId === "ai" ? (
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm overflow-x-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={markdownComponents}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  )}
                  <p
                    className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 opacity-80 ${
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
                width={80}
                height={80}
                sizes="(max-width: 640px) 80px, 100px"
                className="mb-3 sm:mb-4 animate-bounce invert"
              />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text mb-2 animate-fade-in">
                Welcome to ChitChat AI!
              </h1>
              <p className="text-sm sm:text-lg text-slate-200 text-center max-w-[90%] sm:max-w-xl animate-fade-in-slow">
                I am your smart assistant. Ask me anything, get instant answers,
                or just have a fun chat!
                <br />
                <span className="text-sky-400">Try asking:</span>{" "}
                <span className="italic">Tell me a joke</span> or{" "}
                <span className="italic">Summarize the latest tech news</span>.
              </p>
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-700/80 rounded-full text-slate-100 text-xs sm:text-sm shadow">
                  ✨ AI-powered responses
                </span>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700/80 rounded-full text-slate-100 text-xs sm:text-sm shadow">
                  💬 Always available
                </span>
              </div>
            </div>
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSendMessage}
          className="p-2 sm:p-4 border-t border-slate-700 bg-slate-800 sticky bottom-0"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder="Type your message to AI..."
              className="flex-1 p-2 sm:p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-slate-700/80 text-slate-100 text-xs sm:text-sm transition-all duration-150 focus:shadow-lg placeholder-slate-500"
            />
            <button
              type="submit"
              className="p-2 sm:p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-slate-800 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
              aria-label="Send message"
            >
              <IoSend className="text-base sm:text-lg" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800 shadow-xl md:rounded-r-2xl overflow-hidden">
      <header className="flex items-center p-2 sm:p-4 border-b border-slate-700 shadow-sm sticky top-0 bg-slate-800 z-10">
        {isMobileView && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowChatViewMobile(false);
            }}
            className="mr-2 p-1 sm:p-2 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Back to user list"
          >
            <FaArrowLeft className="text-base sm:text-lg" />
          </button>
        )}
        {selectedUser.image_url ? (
          <Image
            src={selectedUser.image_url}
            alt={selectedUser.user_name}
            className="rounded-full mr-2 sm:mr-3 object-cover"
            width={32}
            height={32}
            sizes="(max-width: 640px) 32px, 40px"
          />
        ) : (
          <FaUserAlt className="w-8 sm:w-10 h-8 sm:h-10 text-slate-500 mr-2 sm:mr-3" />
        )}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-50">
            {selectedUser.user_name}
          </h2>
          <p
            className={`text-xs sm:text-sm flex items-center ${
              selectedUser.is_online ? "text-green-500" : "text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1 sm:mr-1.5 ${
                selectedUser.is_online ? "bg-green-500" : "bg-slate-400"
              }`}
            ></span>
            {selectedUser.is_online ? "Online" : "Offline"}
          </p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-slate-900/70 custom-scrollbar">
        {isMessagesLoading ? (
          <div className="text-center text-slate-400 text-xs sm:text-sm">
            Loading messages...
          </div>
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
                className={`max-w-[80%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl shadow-md overflow-hidden ${
                  msg.senderId === currentUser?.id
                    ? "bg-sky-500 text-white rounded-l-xl"
                    : "bg-slate-700 text-slate-100 rounded-r-xl"
                }`}
              >
                {msg.senderId === "ai" ? (
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm overflow-x-auto">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      components={markdownComponents}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}
                <p
                  className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 opacity-80 ${
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
            <div className="bg-slate-700 text-slate-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-2 sm:p-4 border-t border-slate-700 bg-slate-800 sticky bottom-0"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={handleStopTyping}
            placeholder="Aaah, type something cool..."
            className="flex-1 p-2 sm:p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-slate-700/80 text-slate-100 text-xs sm:text-sm transition-all duration-150 focus:shadow-lg placeholder-slate-500"
          />
          <button
            type="submit"
            className="p-2 sm:p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-slate-800 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            aria-label="Send message"
          >
            <IoSend className="text-base sm:text-lg" />
          </button>
        </div>
      </form>
    </div>
  );
}
