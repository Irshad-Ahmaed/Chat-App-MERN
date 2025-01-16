import {create} from 'zustand';
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useChatStore } from './useChatStore';


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get)=> ({
    authUser: null,
    createdAt: null,
    updatedAt: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    lastTimeUsersOnline: [],
    lastOnlineAt: null,

    setLastTimeUsersOnline: (users) => set({ lastTimeUsersOnline: users }),
    
    checkAuth: async()=> {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({
                authUser: res.data.user,
                createdAt: res.data.user.createdAt, 
                updatedAt: res.data.user.updatedAt,
                // lastTimeUsersOnline: res.data.usersOnlineAt,
            });
            console.log("res", res.data)
            get().connectSocket();
        } catch (error) {
            console.log(error)
            set({authUser: null});
        } finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async(data)=> {
        set({isSigningUp: true});
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({authUser: res.data});
            toast.success("Account created successfully")  

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isSigningUp: false});
        }
    },

    login: async(data)=> {
        set({isLoggingIn: true});
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({
                authUser: res.data,
                createdAt: res.data.createdAt, 
                updatedAt: res.data.updatedAt
            });
            toast.success("Logged in successfully");
            
            // window.location.reload();
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isLoggingIn: false});
        }
    },

    logout: async()=> {
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser: null});
            toast.success("Logout successfully");
            get().disconnectSocket();
        } catch (error) {
            console.log("error", error);
            toast.error(error.response?.data.message)
        }
    },

    updateProfile: async(data) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser: res.data});
            set({updatedAt: res.data.updatedAt});
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in updating profile", error);
            toast.error(error.response.data.message);
        } finally {
            set({isUpdatingProfile: false});
        }
    },

    connectSocket: ()=> {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const newSocket = io(BASE_URL,{
            query:{
                userId: authUser._id,
            },
        });

        newSocket.connect(); 
        set({socket: newSocket});

        newSocket.on("userConnected", (offlineUsers)=> {
            set({lastTimeUsersOnline: offlineUsers})
        });

        newSocket.on("userDisconnected", ({allUsersOnlineAt})=>{
            console.log("userDisconnected", allUsersOnlineAt);
            set({lastTimeUsersOnline: allUsersOnlineAt})
        });

        newSocket.on("getOnlineUsers", (userIds)=> {
            set({onlineUsers: userIds})
        });

        // Listen for receive_message event
        newSocket.on('receive_message', (data) => { 
            const addMessage = useChatStore.getState().addMessage; 
            addMessage(data.message); 
            // Optionally, show a notification 
            if (Notification.permission === 'granted') { 
                new Notification(data.message.content, { body: data.message.content, }); 
            } 
        });
    },

    disconnectSocket: ()=> {
        const socket = get().socket;
        
        if(socket?.connected) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });  // Reset online users on disconnect
        }
    },
}));