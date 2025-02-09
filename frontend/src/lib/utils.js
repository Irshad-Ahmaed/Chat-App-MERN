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