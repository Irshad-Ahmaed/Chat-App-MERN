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
            toast.error(error.response.data.message);
        } finally {
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async(messageData) => {
        const {selectedUser, messages} = get();
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            set({messages:[...messages, res.data]});
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
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser)=> set({selectedUser}),
}))