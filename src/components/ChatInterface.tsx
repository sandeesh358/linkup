// src/components/ChatInterface.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  Loader2, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  ArrowLeft,
  Info,
  Trash2,
  Ban,
  Flag,
  Search,
  Mic,
  Phone,
  Video,
  Image as ImageIcon,
  File,
  Camera,
  Contact,
  MapPin,
  FileText,
  CheckCheck,
  Check,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  read?: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
  } | null;
  sender: {
    name: string | null;
    username: string;
    image: string | null;
  };
}

interface ChatInterfaceProps {
  recipientId: string;
  recipientUsername: string;
  recipientName: string | null;
  recipientImage: string | null;
}

const formatMessageContent = (content: string) => {
  // If content has no spaces, treat it as a single word
  if (!content.includes(' ')) {
    const maxLength = 35; // Maximum characters per line
    const lines: string[] = [];
    
    // Split the content into chunks of maxLength
    for (let i = 0; i < content.length; i += maxLength) {
      lines.push(content.slice(i, i + maxLength));
    }
    
    return lines.join('\n');
  }

  // For content with spaces, use the existing word-based formatting
  const words = content.split(' ');
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentLength = 0;
  const maxLineLength = 35;

  for (const word of words) {
    if (currentLength + word.length > maxLineLength) {
      lines.push(currentLine.join(' '));
      currentLine = [word];
      currentLength = word.length;
    } else {
      currentLine.push(word);
      currentLength += word.length + 1;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines.join('\n');
};

const styles = `
  .highlight-message {
    animation: highlight 2s ease-in-out;
  }

  @keyframes highlight {
    0%, 100% {
      background-opacity: 1;
    }
    50% {
      background-color: rgba(59, 130, 246, 0.1);
    }
  }
`;

export default function ChatInterface({
  recipientId,
  recipientUsername,
  recipientName,
  recipientImage,
}: ChatInterfaceProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${recipientId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    if (recipientId) {
      fetchMessages();
      scrollToBottom();
    }
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !recipientId) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          content: newMessage.trim(),
          replyToId: replyingTo?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const isMessageLong = (content: string) => {
    return content.length > 200;
  };

  const getMessagePreview = (content: string, messageId: string) => {
    if (!isMessageLong(content) || expandedMessages.has(messageId)) {
      return formatMessageContent(content);
    }
    return formatMessageContent(content.slice(0, 200) + '...');
  };

  const handleMessageClick = (messageId: string) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user?.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessageId(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setSelectedMessageId(null);
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-[#111827] relative rounded-xl overflow-hidden shadow-lg border-0">
      {/* Header */}
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex-none py-3 bg-white dark:bg-[#1f2937] z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <ArrowLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900">
                <AvatarImage src={recipientImage || undefined} />
                <AvatarFallback className="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  {(recipientName?.[0] || recipientUsername?.[0] || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  {recipientName || recipientUsername}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {isTyping ? (
                    <span className="text-blue-600 dark:text-blue-400">Typing...</span>
                  ) : isOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Online</span>
                    </>
                  ) : (
                    <span>Last seen {lastSeen}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <MoreVertical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg">
                <DropdownMenuItem className="text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Info className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Search className="mr-2 h-4 w-4" />
                  Search Messages
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Contact className="mr-2 h-4 w-4" />
                  Export Chat
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111827] px-4">
        <div className="py-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px] bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-3 w-[150px] bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm mt-2">Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    className="flex w-full"
                    >
                      <div
                        ref={el => {
                          if (el) messageRefs.current[message.id] = el;
                        }}
                      onClick={() => handleMessageClick(message.id)}
                      className={`group relative max-w-[60%] md:max-w-[75%] lg:max-w-[85%] rounded-2xl p-3 shadow-sm cursor-pointer hover:bg-opacity-95 ${
                          message.senderId === recipientId
                          ? 'bg-white dark:bg-[#1f2937] text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-800 ml-0 mr-auto' 
                          : 'bg-blue-600 dark:bg-blue-500 text-white rounded-br-none ml-auto mr-0'
                      }`}
                    >
                      {message.replyTo && (
                        <div 
                          className={`mb-2 px-2 py-1 text-xs flex flex-col cursor-pointer ${
                            message.senderId === recipientId
                              ? 'bg-gray-100/80 dark:bg-gray-800/50'
                              : 'bg-blue-700/30 dark:bg-blue-600/30'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const repliedMessage = messages.find(m => m.id === message.replyTo?.id);
                            if (repliedMessage && messageRefs.current[repliedMessage.id]) {
                              messageRefs.current[repliedMessage.id]?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                              });
                              messageRefs.current[repliedMessage.id]?.classList.add('highlight-message');
                              setTimeout(() => {
                                messageRefs.current[repliedMessage.id]?.classList.remove('highlight-message');
                              }, 2000);
                            }
                          }}
                        >
                          <p className={`font-medium text-xs mb-0.5 ${
                            message.senderId === recipientId
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-white'
                          }`}>
                            {message.replyTo.senderId === user?.id ? 'You' : recipientName || recipientUsername}
                          </p>
                          <p className={`text-xs line-clamp-2 ${
                            message.senderId === recipientId
                              ? 'text-gray-600 dark:text-gray-300'
                              : 'text-white/90'
                          }`}>
                            {message.replyTo.content}
                          </p>
                        </div>
                      )}
                        <div className="break-all whitespace-pre-wrap">
                          <p className="text-sm leading-relaxed">
                            {getMessagePreview(message.content, message.id)}
                          </p>
                          {isMessageLong(message.content) && (
                            <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessageExpansion(message.id);
                            }}
                              className={`text-xs mt-1 flex items-center gap-1 ${
                                message.senderId === recipientId
                                ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                                  : 'text-white/80 hover:text-white'
                              }`}
                            >
                              {expandedMessages.has(message.id) ? (
                                <>
                                  Show less <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className={`text-xs ${
                            message.senderId === recipientId
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-white/80'
                          }`}>
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          {message.senderId !== recipientId && (
                            <span className="text-xs text-white/80">
                              {message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                          )}
                        </div>

                      {selectedMessageId === message.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`absolute ${
                            message.senderId === recipientId
                              ? 'right-0 top-0'
                              : 'left-0 top-0'
                          } mt-[-40px] bg-white dark:bg-[#1f2937] rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 py-1 min-w-[140px] z-50`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReply(message);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Reply
                          </button>
                          {message.senderId === user?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(message.id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-none bg-white dark:bg-[#1f2937] z-20">
        {replyingTo && (
          <div className="flex items-start gap-2 mb-2 p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <div className="flex-shrink-0 w-1 self-stretch bg-blue-500/40 dark:bg-blue-400/40 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-blue-600/90 dark:text-blue-400/90">
                  Replying to {replyingTo.senderId === user?.id ? 'yourself' : recipientName || recipientUsername}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={cancelReply}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 -mr-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                {replyingTo.content}
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <AnimatePresence>
              {showAttachmentOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg p-2 w-64 grid grid-cols-4 gap-2"
                >
                  <Button variant="ghost" className="flex flex-col items-center justify-center p-2 h-20 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <ImageIcon className="h-6 w-6 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-200">Photo</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center justify-center p-2 h-20 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Camera className="h-6 w-6 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-200">Camera</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center justify-center p-2 h-20 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <FileText className="h-6 w-6 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-200">Document</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center justify-center p-2 h-20 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Contact className="h-6 w-6 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-200">Contact</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center justify-center p-2 h-20 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <MapPin className="h-6 w-6 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-200">Location</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center justify-center p-2 h-20 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <File className="h-6 w-6 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-200">File</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 dark:bg-[#111827] rounded-full px-4 py-2 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0 border-0 shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <Button 
            type="submit" 
            disabled={isSending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}