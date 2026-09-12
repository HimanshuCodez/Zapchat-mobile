import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, X, ArrowLeft, Menu, MessageSquare } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Handle mobile back button
  useEffect(() => {
    const handlePopState = () => {
      setIsMobileSidebarOpen(true);
      setSelectedUser(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setSelectedUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
      // Add history state for back button
      window.history.pushState({}, '');
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Mobile Menu Button - Only visible when sidebar is closed */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 btn btn-circle btn-ghost"
      >
        <Menu className="size-6" />
      </button>

      <aside className={`
        fixed lg:static top-2 left-0 h-full bg-base-100
        w-96 lg:w-72 border-r border-base-300 flex flex-col
        transition-transform duration-300 z-40
        ${isMobileSidebarOpen || window.innerWidth >= 1024 ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="border-b border-base-300  p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center ml-12 mt-[11px]  gap-2">
              <MessageSquare className="size-6" />
              <span className="font-medium text-lg ">Chats</span>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden btn btn-ghost btn-circle btn-sm"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Online filter toggle */}
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs opacity-50">({onlineUsers.length - 1} online)</span>
          </div>
        </div>

        {/* User List */}
        <div className="overflow-y-auto flex-1">
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-200 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-200" : ""}
              `}
            >
              <div className="relative">
                <div className="avatar placeholder">
                  <div className="w-12 rounded-full bg-neutral-focus text-neutral-content">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">{user.fullname[0]}</span>
                    )}
                  </div>
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100" />
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="font-medium truncate">{user.fullname}</div>
                <div className="text-sm  opacity-70">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center opacity-50 py-4">
              No users found
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;