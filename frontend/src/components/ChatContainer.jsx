import { useEffect, useLayoutEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";


const ChatContainer = () => {
  const {messages, getMessage, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeToMessages} = useChatStore();
  const {authUser} = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(()=> {
    getMessage(selectedUser._id);

    subscribeToMessages();

    return ()=> unsubscribeToMessages();
  }, [selectedUser._id, getMessage, subscribeToMessages, unsubscribeToMessages]);

  useLayoutEffect(()=> {
    const scrollToEnd = ()=> {
      if(messageEndRef.current && messages){
        setTimeout(() => { 
          messageEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
        }, 100);
      };
    }

    scrollToEnd();
  }, [messages])

  if(isMessagesLoading) return(
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader/>
      <MessageSkeleton/>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader/>
      <div className="flex-1 max-h-[40rem] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            ref={messageEndRef}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
              <div className="chat-image avatar">
                <div className="size-10 rounded-full bottom">
                  <img src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"} alt="profile_pic" />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
              </div>

              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img src={message.image} 
                    alt="message_image"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {message.text && (
                  <span className="font-semibold pl-1">{message.text}</span>
                )}
              </div>
            </div>
        ))}
      </div>
      <MessageInput/>
    </div>
  )
}

export default ChatContainer