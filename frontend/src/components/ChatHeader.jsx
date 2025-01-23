import { X } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { timeAgo } from '../lib/utils';
import { useEffect } from 'react';

const ChatHeader = () => {
    const { users, selectedUser, setSelectedUser, stopTyping } = useChatStore();
    const { onlineUsers, lastTimeUsersOnline, toWhomYouTyping, isTyping } = useAuthStore();

    console.log("Header", toWhomYouTyping);
    console.log("User", users.map((user)=> user._id));
    return (
        <div className='p-2.5 border-b border-base-300'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    {/* Avatar */}
                    <div className='avatar'>
                        <div className='size-10 rounded-full relative'>
                            <img src={selectedUser.profilePic || '/avatar.png'} alt={selectedUser.fullName} />
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h3 className='font-medium'>{selectedUser.fullName}</h3>
                        <p className='flex gap-2 text-xs md:text-sm text-base-content/70'>
                            {onlineUsers.includes(selectedUser._id)
                                ? "Online"
                                : lastTimeUsersOnline?.find((offlineUser) => offlineUser.userId === selectedUser._id)
                                    ? timeAgo(lastTimeUsersOnline.find((offlineUser) => offlineUser.userId === selectedUser._id).lastOnlineAt)
                                    : "Long time ago"
                            }
                            {
                                isTyping && selectedUser._id == toWhomYouTyping &&
                                <span className='text-green-600'>typing...</span>
                            }
                        </p>

                    </div>
                </div>

                {/* Close button */}
                <div onClick={() => {stopTyping(); setSelectedUser(null);}} className='cursor-pointer'>
                    <X />
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;