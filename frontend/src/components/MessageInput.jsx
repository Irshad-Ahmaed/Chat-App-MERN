import React, { useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Image, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if(!file.type.startsWith("image/")){
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            // Clear Form
            setText("");
            setImagePreview(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="p-4 w-full">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className=" size-24 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 p-0 textarea textarea-bordered flex gap-2 relative items-center">
                    <textarea
                        className="w-[93%] bg-transparent focus:outline-none overflow-hidden leading-tight resize-none input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={1} // Initial height
                        onInput={(e) => {
                            const target = e.target;
                            target.style.height = "auto"; // Reset height
                            target.style.height = `${target.scrollHeight}px`; // Adjust to content
                        }}
                        style={{ lineHeight: "1.5" }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`sm:flex absolute right-1.5 w-[5.5%] sm:w-[5%] md:w-[4.5%]
                        ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                        title="Select Image"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image className='size-4 lg:size-5' />
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && !imagePreview}
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;