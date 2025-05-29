export const NoChatSelectedView = () => (
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
