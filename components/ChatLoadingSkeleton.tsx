export const ChatLoadingSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/70">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
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
