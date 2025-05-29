export const LoadingContacts = () => (
  <div className="absolute inset-0 bg-slate-800/90 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-600 rounded-full animate-spin border-t-sky-500"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-spin border-t-sky-400 animate-reverse"></div>
      </div>
      <div className="text-slate-300 font-medium text-sm">
        Loading contacts...
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  </div>
);
