import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from '../lib/axios';
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get)=> ({
    messages: [],
    users: [],
    connections: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,

    // Function to add new messages to the state 
    addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
    })),
    
    getUsers: async()=> {
        set({isUserLoading: true});
        try {
            const res = await axiosInstance.get("/message/users");
            set({users: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUserLoading: false});
        }
    },

    getMessage: async(userId)=> {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/message/${userId}`);
            set({messages: res.data});
        } catch (error) {
            toast.error(error?.response?.data?.message);
        } finally {
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async(messageData) => {
        const {selectedUser, messages} = get();
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            set({messages:[...messages, res.data]});
            // Emit send_message event 
            const socket = useAuthStore.getState().socket;
            socket.emit('send_message', { message: res.data, recipientId: selectedUser._id });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: ()=> {
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        
        socket.on("newMessage", (newMessage)=> {
            if(newMessage.senderId !== selectedUser._id) return; // If the message is not for the selected user, don't show to other users
            set({messages: [...get().messages, newMessage]});
        });
    },

    unsubscribeToMessages: ()=> {
        const socket = useAuthStore.getState().socket;
        if (socket?.connected) {
            socket.off("newMessage");
            return;
        }
    },

    setSelectedUser: (selectedUser)=> set({selectedUser}),
}))