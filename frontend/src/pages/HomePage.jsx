import React from 'react'
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';

const HomePage = () => {
  const {selectedUser} = useChatStore();
  
  return (
    <div className='h-full lg:h-screen bg-base-200'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base-100 rounded-lg max-w-6xl w-full h-[cal(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar />

            {selectedUser ? <ChatContainer/> : <NoChatSelected/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage