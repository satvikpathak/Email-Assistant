"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { EmailCard } from "./EmailCard";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { AnimatedBackground } from "./AnimatedBackground";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/hooks/useChatStore";

export function ChatInterface() {
  const { messages, sendMessage, isSending } = useChat();
  const { user, setUser, clearMessages } = useChatStore();
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "send";
    data: Record<string, unknown>;
    message: string;
  } | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log("ChatInterface render:", { 
    messageCount: messages.length, 
    showWelcome,
    messages: messages.map(m => ({ role: m.role, content: m.content?.substring(0, 30) }))
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || isSending) {
      return;
    }

    setShowWelcome(false); // Hide welcome screen on first message
    await sendMessage(input);
    setInput("");
  };

  const handleLogout = (): void => {
    setUser(null);
    clearMessages();
    setShowWelcome(true);
    window.location.href = "/";
  };

  const showCommands = (): void => {
    setShowWelcome(true);
  };

  const handleReply = (emailId: string): void => {
    setInput(`Reply to email #${emailId}`);
  };

  const handleDelete = (emailId: string): void => {
    setConfirmAction({
      type: "delete",
      data: { emailId },
      message: "Are you sure you want to delete this email? This action cannot be undone.",
    });
    setShowConfirmDialog(true);
  };

  const handleConfirm = async (): Promise<void> => {
    if (!confirmAction) return;

    setShowConfirmDialog(false);

    if (confirmAction.type === "delete") {
      await sendMessage(`Yes, delete email ${confirmAction.data.emailId}`);
    } else if (confirmAction.type === "send") {
      await sendMessage("Yes, send it");
    }

    setConfirmAction(null);
  };

  const handleCancel = (): void => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-slate-200 to-gray-300 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900"></div>
        
        {/* Animated grid overlay - using CSS class instead of inline style */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>

        {/* Animated particles */}
        <AnimatedBackground />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-3xl animate-float-delayed"></div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          {/* Logo */}
          <div className="mb-8 relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative backdrop-blur-sm bg-black/5 dark:bg-white/5 rounded-full p-6 border border-black/10 dark:border-white/10">
              <svg className="h-16 w-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up delay-200">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
              AI EMAIL
            </h1>
            <div className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2 tracking-wide">
              ASSISTANT
            </div>
            <div className="mt-4 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-500 dark:via-blue-400 to-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
              Intelligent email management powered by AI
            </p>
          </div>

          {/* Login Button */}
          <div className="animate-fade-in-up delay-400">
            <a
              href="/auth/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                🚀 Login with Google
              </span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              ✨ AI Email Assistant
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={showCommands}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              📋 Commands
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Commands Popup Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-3xl w-full mx-4 border border-gray-200 dark:border-gray-700 relative">
            {/* Close button */}
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-bold leading-none"
              aria-label="Close"
            >
              ×
            </button>
            
            <div className="mb-6">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Email Assistant Commands
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              I can help you manage your Gmail inbox with natural language. Try these commands:
            </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">📧 Fetch & Read</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• &quot;Show me my last 5 emails&quot;</li>
                    <li>• &quot;Get unread emails&quot;</li>
                    <li>• &quot;Emails from john@example.com&quot;</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">✍️ Reply</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• &quot;Reply to email #1&quot;</li>
                    <li>• &quot;Reply to John saying thanks&quot;</li>
                    <li>• &quot;Generate a reply to the last email&quot;</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="font-semibold text-red-700 dark:text-red-300 mb-2">🗑️ Delete</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• &quot;Delete email #2&quot;</li>
                    <li>• &quot;Remove the spam email&quot;</li>
                    <li>• &quot;Delete the last email&quot;</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="font-semibold text-green-700 dark:text-green-300 mb-2">🎯 Smart Features</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• &quot;Categorize my emails&quot;</li>
                    <li>• &quot;Give me today&apos;s digest&quot;</li>
                    <li>• &quot;Show urgent emails&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10"
      >
        {/* Always show messages */}
        {messages.map((message, index) => {
          // Check if message has email data
          const hasEmails = message.metadata?.emails && Array.isArray(message.metadata.emails);
              
          return (
            <div key={index} className="mb-6 relative z-10">
              <MessageBubble message={message} />
                  
              {/* Display email cards if available */}
              {hasEmails && message.metadata?.emails && message.metadata.emails.length > 0 && (
                <div className="mt-4 space-y-4 ml-14">
                  {message.metadata.emails.map((email: {
                    id: string;
                    from: string;
                    subject: string;
                    date: string;
                    snippet: string;
                    summary: string;
                    labels?: string[];
                  }, emailIndex: number) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      index={emailIndex}
                      onReply={() => handleReply((emailIndex + 1).toString())}
                      onDelete={() => handleDelete(email.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex justify-start mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl px-6 py-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-6 py-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your emails..."
            disabled={isSending}
            className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {isSending ? "⏳" : "🚀"} Send
          </button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title={confirmAction?.type === "delete" ? "Delete Email?" : "Send Reply?"}
        message={confirmAction?.message || ""}
        confirmText={confirmAction?.type === "delete" ? "Delete" : "Send"}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        type={confirmAction?.type === "delete" ? "danger" : "info"}
      />
    </div>
  );
}
