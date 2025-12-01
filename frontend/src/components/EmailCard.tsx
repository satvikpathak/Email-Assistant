/**
 * Email Card Component - Rich display for emails
 */

"use client";

import React from "react";

interface EmailCardProps {
  email: {
    id: string;
    from: string;
    subject: string;
    date: string;
    snippet: string;
    summary: string;
    labels?: string[];
  };
  index: number;
  onReply: (emailId: string) => void;
  onDelete: (emailId: string) => void;
}

export function EmailCard({ email, index, onReply, onDelete }: EmailCardProps) {
  const isUnread = email.labels?.includes("UNREAD");
  
  // Extract sender name and email
  const fromMatch = email.from.match(/^(.+?)\s*<(.+?)>$/) || [null, email.from, email.from];
  const senderName = fromMatch[1]?.trim() || email.from;
  const senderEmail = fromMatch[2]?.trim() || email.from;

  return (
    <div
      className={`
        relative p-6 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.01]
        ${isUnread 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {/* Email Number Badge */}
      <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
        {index + 1}
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
      )}

      {/* Sender Info */}
      <div className="mb-3 pr-8">
        <div className="font-semibold text-gray-900 dark:text-white text-lg">
          {senderName}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {senderEmail}
        </div>
      </div>

      {/* Subject */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {email.subject || "(No Subject)"}
      </h3>

      {/* Date */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {new Date(email.date).toLocaleString()}
      </div>

      {/* AI Summary */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-2">
          <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold">✨ AI Summary:</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {email.summary}
        </p>
      </div>

      {/* Snippet */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {email.snippet}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onReply(email.id)}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
        >
          📧 Reply
        </button>
        <button
          onClick={() => onDelete(email.id)}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Labels */}
      {email.labels && email.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {email.labels.filter(l => !['UNREAD', 'INBOX', 'CATEGORY_PERSONAL'].includes(l)).map((label) => (
            <span
              key={label}
              className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
