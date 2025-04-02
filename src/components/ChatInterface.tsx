// src/components/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Send, Paperclip, Smile } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  conversationId: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  sender?: {
    id: string;
    name: string | null;
    image: string | null;
    username: string;
  };
}

interface SimpleChatInterfaceProps {
  recipient: {
    id: string;
    name: string | null;
    image: string | null;
    username?: string;
  };
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onRetryMessage?: (messageId: string) => Promise<void>;
  currentUserId: string;
  isSocketConnected: boolean;
  conversationId?: string;
}

export function ChatInterface({
  recipient,
  messages,
  onSendMessage,
  onRetryMessage,
  currentUserId,
  isSocketConnected,
  conversationId
}: SimpleChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    try {
      setIsSending(true);
      await onSendMessage(inputValue);
      setInputValue('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach(message => {
    const date = formatDate(message.createdAt);
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-3 border-b flex items-center bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
            {recipient.image ? (
              <img 
                src={recipient.image} 
                alt={recipient.name || 'User'} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-gray-500 font-medium">
                {recipient.name?.charAt(0).toUpperCase() || recipient.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {recipient.name || recipient.username || 'Unknown User'}
            </h3>
            <div className="text-xs flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${isSocketConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span className="text-gray-500 dark:text-gray-400">
                {isSocketConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-center">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messagesByDate).map(([date, messagesForDate]) => (
            <div key={date} className="mb-6">
              <div className="text-center mb-4">
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-3">
                {messagesForDate.map(message => {
                  const isMine = message.senderId === currentUserId;
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`
                          max-w-[80%] md:max-w-[70%] px-4 py-2 rounded-lg 
                          ${isMine 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}
                          ${message.status === 'failed' ? 'border border-red-500' : ''}
                          shadow
                        `}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.createdAt)}
                          </span>
                          {isMine && (
                            <span className="text-xs flex items-center">
                              {message.status === 'failed' && (
                                <span 
                                  className="text-red-300 dark:text-red-400 cursor-pointer flex items-center gap-0.5"
                                  onClick={() => onRetryMessage && onRetryMessage(message.id)}
                                  title="Message failed to send. Click to retry."
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span>Retry</span>
                                </span>
                              )}
                              {message.status === 'pending' && (
                                <span className="opacity-70 flex items-center gap-0.5" title="Sending message...">
                                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                                  </svg>
                                  <span>Sending</span>
                                </span>
                              )}
                              {message.status === 'sent' && (
                                <span className="opacity-70" title="Message sent">
                                  <svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                              {message.status === 'delivered' && (
                                <span className="opacity-70" title="Message delivered">
                                  <svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7M5 19l4 4L19 13" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                              {message.status === 'read' && (
                                <span className="text-blue-300 dark:text-blue-400" title="Message read">
                                  <svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7M5 19l4 4L19 13" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSubmit}
        className="p-3 border-t bg-white dark:bg-gray-800 flex items-center space-x-2"
      >
        <button 
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
        />
        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Smile size={20} />
        </button>
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending}
          className={`p-2 rounded-full ${
            inputValue.trim() && !isSending
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
          } transition-colors`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}