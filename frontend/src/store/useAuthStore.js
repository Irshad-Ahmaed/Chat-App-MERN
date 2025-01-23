import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    createdAt: null,
    updatedAt: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    isTyping: false,
    toWhomYouTyping: null,
    lastTimeUsersOnline: [],
    lastOnlineAt: null,

    setLastTimeUsersOnline: (users) => set({ lastTimeUsersOnline: users }),

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({
                authUser: res.data.user,
                createdAt: res.data.user.createdAt,
                updatedAt: res.data.user.updatedAt,
                // lastTimeUsersOnline: res.data.usersOnlineAt,
            });
            console.log("res", res);
            get().connectSocket();
        } catch (error) {
            console.log(error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({ authUser: res.data });
            toast.success("Account created successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
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
            toast.error(error?.response?.data?.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            const socket = get().socket;
            if (socket) {
                socket.emit("logout");
                socket.disconnect();
            }
            set({ authUser: null, socket: null });
            toast.success("Logout successfully");
        } catch (error) {
            console.log("error", error);
            toast.error(error.response?.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            set({ updatedAt: res.data.updatedAt });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in updating profile", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const newSocket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });

        newSocket.connect();
        set({ socket: newSocket });

        //  User Connected
        newSocket.on("userConnected", (offlineUsers) => {
            set({ lastTimeUsersOnline: offlineUsers, isTyping: false });
        });

        // User Disconnected
        newSocket.on("userDisconnected", ({ allUsersOnlineAt, isLogout }) => {
            console.log("userDisconnected", allUsersOnlineAt);
            set({ lastTimeUsersOnline: allUsersOnlineAt });
        });

        // Get All Online Users
        newSocket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        // Listen for push notification event (when user is offline)
        newSocket.on('push_notification', (data) => {
            if (Notification.permission === 'granted') {
                // If the app is in the background or closed, use Service Worker to show notification
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(data.title, {
                        body: data.body,
                        icon: '/vite.svg',  // Make sure to provide a valid icon path
                    });
                });
            }
        });

        // Register service worker and request notification permission
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/serviceWorker.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);

                    // Ask for notification permission
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            console.log('Notification permission granted.');
                            // After permission is granted, subscribe to push notifications
                            subscribeToPushNotifications(registration);
                        } else {
                            console.error('Notification permission denied.');
                        }
                    });
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }

        // Subscribe to push notifications
        function subscribeToPushNotifications(registration) {
            registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey,
            })
            .then((subscription) => {
                console.log('Push subscription:', subscription);
                // Send subscription to backend to save it
                sendSubscriptionToServer(subscription);
            })
            .catch((error) => {
                console.error('Push subscription failed:', error);
            });
        }

        // Send subscription to backend
        const sendSubscriptionToServer = async(subscription) => {
            console.log('subscription', subscription);
            const userId = authUser._id;
            await axiosInstance.post('/notification/save-push-subscription', {subscription, userId})
            .then((response) => {
                console.log('Push subscription saved to server');
            }).catch((error) => {
                console.error('Error saving push subscription:', error);
            });
        }


        // Listen for receive_message event
        newSocket.on('receive_message', (data) => {
            if (Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification("New Message", {
                        body: data?.message?.text,
                        icon: '/vite.svg'  // Make sure to provide a valid icon path
                    });
                });
            }
        });

        
        // Handle user typing events
        newSocket.on("user_typing", ({ userId, isTyping }) => {
            set({ isTyping: isTyping, toWhomYouTyping: userId });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;

        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });  // Reset online users on disconnect
        }
    },
}));