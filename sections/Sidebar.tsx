import { UserListItem } from "@/components/UserListItem";
import UserListSkeleton from "@/components/UserListSkeleton";
import { LoadingContacts } from "@/components/LoadingSpinner";
import Image from "next/image";
import { FaSearch, FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { SideBarProps, User } from "@/constants/constants";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { handleError, handleSuccess } from "@/utils/utils";
import { getAllUsers } from "@/actions/serverActions";

const Sidebar: React.FC<SideBarProps> = ({
  token,
  setUsers,
  selectedUser,
  setSelectedUser,
  isMobileView,
  setShowChatViewMobile,
  currentUser,
  users,
  showChatViewMobile,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

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

  const handleSelectUser = (user: User) => {
    if (selectedUser?.id !== user.id) {
      setSelectedUser(user);
    } else if (isMobileView) {
      setShowChatViewMobile(true);
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
                  .map(
                    (user) =>
                      user.last_message && (
                        <UserListItem
                          key={user.id}
                          user={user}
                          onSelectUser={handleSelectUser}
                          isSelected={selectedUser?.id === user.id}
                        />
                      )
                  )}
            {users.length > 0 &&
              !users.some((user) => user.last_message) &&
              !searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <FaSearch className="text-sky-500 text-xl" />
                  </div>
                  <p className="text-slate-200 text-sm font-medium mb-2">
                    Start a Conversation
                  </p>
                  <p className="text-slate-400 text-sm max-w-[200px]">
                    Search for users above and start chatting to see your
                    conversations here
                  </p>
                </div>
              )}
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
                alert("Navigate to profile page for: " + currentUser.user_name)
              }
            >
              {currentUser.image_url ? (
                <Image
                  src={currentUser.image_url}
                  alt={currentUser.user_name}
                  className="rounded-full object-cover transition-transform duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-sky-400"
                  width={40}
                  height={40}
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
  );
};

export default Sidebar;
