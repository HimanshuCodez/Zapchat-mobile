import { useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Mail, User } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="avatar cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullname}
              />
            </div>
          </div>

          {/* User Info */}
          <div onClick={() => setShowProfileModal(true)} className="cursor-pointer">
            <h3 className="font-medium">{selectedUser.fullname}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md space-y-6">
            {/* Close Modal Button */}
            <button
              className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-800"
              onClick={() => setShowProfileModal(false)}
            >
              <X size={24} />
            </button>

            {/* Profile Content */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4"
                  />
                </div>
                <h2 className="text-xl font-semibold">{selectedUser.fullname}</h2>
                <p className="text-sm text-zinc-400">
                  {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {selectedUser.fullname}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {selectedUser.email || "Not available"}
                </p>
              </div>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
