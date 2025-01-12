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