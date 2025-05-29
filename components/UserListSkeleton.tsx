const UserListSkeleton = () => {
  return (
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
};

export default UserListSkeleton;
