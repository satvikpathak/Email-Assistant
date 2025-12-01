/**
 * Message bubble component
 */

import React from "react";
import { Message } from "@/hooks/useChatStore";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Debug logging
  console.log("MessageBubble render:", { 
    role: message.role, 
    content: message.content?.substring(0, 50),
    hasContent: !!message.content 
  });

  if (!message.content) {
    console.error("Message has no content!", message);
    return null;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-lg ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            : "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
        }`}
      >
        <div className="text-xs font-bold mb-2 opacity-70 uppercase tracking-wider">
          {isUser ? "You" : "🤖 Assistant"}
        </div>
        <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
        {message.timestamp && (
          <div className="text-xs opacity-60 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
