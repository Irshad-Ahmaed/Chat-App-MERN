export function formatMessageTime(date) {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Check if the message date is from a previous day
    if (now.toDateString() !== messageDate.toDateString()) {
        // If it's from a previous day, include the date
        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }) + ' ' + messageDate.toLocaleTimeString('en-US', {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } else {
        // If it's from the same day, only show the time
        return messageDate.toLocaleTimeString('en-US', {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }
}

export function timeAgo(messageTimestamp) {
    const now = new Date(); // Current system time
    const past = new Date(messageTimestamp); // Convert message timestamp to Date object
    const seconds = Math.floor((now - past) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 3600);
    
    if (interval >= 1) {
        return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }
    interval = Math.floor(seconds / 60);
    // console.log(interval + " minute" + (interval > 1 ? "s" : "") + " ago");
    if (interval >= 1) {
        return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }
    return Math.floor(seconds) + " second" + (seconds > 1 ? "s" : "") + " ago";
}

import Cookies from "js-cookie";
import { decode as jwtDecode } from "jwt-decode";

export const getUserIDFromToken = () => {
    // Get the token from cookies
    const token = Cookies.get("token"); // Replace "authToken" with the actual name of your cookie
    console.log("token", token)
    if (token) {
        try {
            // Decode the JWT token to get the payload
            const decodedToken = jwtDecode(token);
            
            
            // Extract userId from the decoded token
            const userId = decodedToken.userId; // Replace "userId" with the actual key used in your token's payload

            console.log("User ID:", userId);
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    } else {
        console.log("No token found");
    }

}