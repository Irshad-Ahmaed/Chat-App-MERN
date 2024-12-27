import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";


const ChatContainer = () => {
  const {messages, getMessage, isMessagesLoading, selectedUser} = useChatStore();

  useEffect(()=> {
    getMessage(selectedUser._id)
  }, [selectedUser._id, getMessage]);

  if(!isMessagesLoading) return(
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader/>
      <MessageSkeleton/>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader/>
      <p>messages...</p>
    </div>
  )
}

export default ChatContainer