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

  .message-bubble {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .message-bubble:hover {
    transform: translateY(-2px) translateZ(10px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .message-bubble:active {
    transform: translateY(0) translateZ(0);
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .typing-indicator span {
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    animation: typing 1s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-4px) scale(1.2);
    }
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .dark .glass-effect {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .floating-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .floating-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.3;
    animation: float 3s infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(10px, -10px);
    }
    50% {
      transform: translate(-5px, 15px);
    }
    75% {
      transform: translate(-15px, -5px);
    }
  }

  .gradient-border {
    position: relative;
    border-radius: inherit;
    background: linear-gradient(45deg, var(--primary), var(--primary-foreground));
    padding: 1px;
  }

  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(45deg, var(--primary), var(--primary-foreground));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .message-content {
    position: relative;
    overflow: hidden;
  }

  .message-content::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  .avatar-glow {
    position: relative;
  }

  .avatar-glow::after {
    content: '';
    position: absolute;
    inset: -4px;
    background: radial-gradient(circle at center, var(--primary) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .avatar-glow:hover::after {
    opacity: 0.3;
  }

  .button-glow {
    position: relative;
    overflow: hidden;
  }

  .button-glow::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, var(--primary), transparent, var(--primary));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .button-glow:hover::before {
    opacity: 0.3;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary);
    color: var(--primary-foreground);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .scroll-indicator.visible {
    opacity: 1;
  }

  .scroll-indicator:hover {
    transform: translateX(-50%) scale(1.1);
  }

  .message-status {
    position: relative;
  }

  .message-status::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(45deg, var(--primary), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .message-status:hover::after {
    opacity: 0.1;
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-full"
    >
      {/* Floating particles background */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              color: 'var(--primary)',
            }}
          />
        ))}
      </div>

      <Card className="flex flex-col h-full bg-background/50 dark:bg-[#111827]/50 relative rounded-xl overflow-hidden shadow-lg border-0 backdrop-blur-xl">
      {/* Header */}
        <CardHeader className="border-b border-border/50 dark:border-gray-800/50 flex-none py-3 bg-background/80 dark:bg-[#1f2937]/80 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="md:hidden"
              >
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <ArrowLeft className="h-5 w-5 text-primary" />
                </Button>
              </motion.button>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="avatar-glow"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20 dark:ring-primary/40 transition-all duration-300">
                <AvatarImage src={recipientImage || undefined} />
                    <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary">
                  {(recipientName?.[0] || recipientUsername?.[0] || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
                </motion.div>
              <div>
                  <CardTitle className="text-base font-semibold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                  {recipientName || recipientUsername}
                </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {isTyping ? (
                      <span className="text-primary flex items-center gap-1">
                        <span className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                        <span>Typing...</span>
                      </span>
                  ) : isOnline ? (
                    <>
                        <motion.span
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-2 h-2 rounded-full bg-green-500"
                        />
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
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="button-glow"
                  >
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                      <MoreVertical className="h-5 w-5 text-primary" />
                </Button>
                  </motion.button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-effect border-border/50">
                  <DropdownMenuItem className="text-foreground hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <Info className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <Search className="mr-2 h-4 w-4" />
                  Search Messages
                </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <Contact className="mr-2 h-4 w-4" />
                  Export Chat
                </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors">
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-background/30 dark:bg-[#111827]/30 px-4 scrollbar-none relative">
        <div className="py-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 gradient-border"
                >
                  <MessageSquare className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                  No messages yet
                </p>
                <p className="text-sm mt-2">Start a conversation!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    className="flex w-full"
                    >
                      <motion.div
                        ref={el => {
                          if (el) messageRefs.current[message.id] = el;
                        }}
                      onClick={() => handleMessageClick(message.id)}
                        whileHover={{ scale: 1.01, rotate: message.senderId === recipientId ? -1 : 1 }}
                        whileTap={{ scale: 0.99 }}
                        className={`group relative max-w-[60%] md:max-w-[75%] lg:max-w-[85%] rounded-2xl p-3 shadow-sm cursor-pointer message-bubble ${
                          message.senderId === recipientId
                            ? 'bg-background dark:bg-[#1f2937] text-foreground rounded-bl-none border border-border/50 dark:border-gray-800/50 ml-0 mr-auto' 
                            : 'bg-primary text-primary-foreground rounded-br-none ml-auto mr-0'
                      }`}
                    >
                      {message.replyTo && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          className={`mb-2 px-2 py-1 text-xs flex flex-col cursor-pointer ${
                            message.senderId === recipientId
                                ? 'bg-primary/5 dark:bg-primary/10'
                                : 'bg-primary-foreground/10'
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
                                ? 'text-primary'
                                : 'text-primary-foreground'
                          }`}>
                            {message.replyTo.senderId === user?.id ? 'You' : recipientName || recipientUsername}
                          </p>
                          <p className={`text-xs line-clamp-2 ${
                            message.senderId === recipientId
                                ? 'text-muted-foreground'
                                : 'text-primary-foreground/90'
                          }`}>
                            {message.replyTo.content}
                          </p>
                          </motion.div>
                      )}
                        <div className="break-all whitespace-pre-wrap message-content">
                          <p className="text-sm leading-relaxed">
                            {getMessagePreview(message.content, message.id)}
                          </p>
                          {isMessageLong(message.content) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessageExpansion(message.id);
                            }}
                              className={`text-xs mt-1 flex items-center gap-1 ${
                                message.senderId === recipientId
                                  ? 'text-primary hover:text-primary/80'
                                  : 'text-primary-foreground/80 hover:text-primary-foreground'
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
                            </motion.button>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1 message-status">
                          <p className={`text-xs ${
                            message.senderId === recipientId
                              ? 'text-muted-foreground'
                              : 'text-primary-foreground/80'
                          }`}>
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          {message.senderId !== recipientId && (
                            <span className="text-xs text-primary-foreground/80">
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
                            } mt-[-40px] glass-effect rounded-lg shadow-lg py-1 min-w-[140px] z-50`}
                        >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReply(message);
                            }}
                              className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Reply
                            </motion.button>
                          {message.senderId === user?.id && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(message.id);
                              }}
                                className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                              </motion.button>
                          )}
                        </motion.div>
                      )}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
      </div>

      {/* Input Area */}
        <div className="border-t border-border/50 dark:border-gray-800/50 p-4 flex-none bg-background/80 dark:bg-[#1f2937]/80 backdrop-blur-xl z-20">
        {replyingTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 mb-2 p-2 bg-primary/5 dark:bg-primary/10 rounded-lg gradient-border"
            >
              <div className="flex-shrink-0 w-1 self-stretch bg-primary/40 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-primary">
                  Replying to {replyingTo.senderId === user?.id ? 'yourself' : recipientName || recipientUsername}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={cancelReply}
                    className="text-muted-foreground hover:text-foreground transition-colors -mr-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                {replyingTo.content}
              </p>
            </div>
            </motion.div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                className="button-glow"
              >
            <Button
              variant="ghost"
              size="icon"
                  className="text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <Smile className="h-5 w-5" />
            </Button>
              </motion.button>
            <AnimatePresence>
              {showAttachmentOptions && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 glass-effect rounded-xl shadow-lg p-2 w-64 grid grid-cols-4 gap-2"
                  >
                    {[
                      { icon: ImageIcon, label: 'Photo' },
                      { icon: Camera, label: 'Camera' },
                      { icon: FileText, label: 'Document' },
                      { icon: Contact, label: 'Contact' },
                      { icon: MapPin, label: 'Location' },
                      { icon: File, label: 'File' },
                    ].map(({ icon: Icon, label }, index) => (
                      <motion.button
                        key={label}
                        whileHover={{ scale: 1.05, rotate: index % 2 ? 2 : -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-2 h-20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors rounded-lg gradient-border"
                      >
                        <Icon className="h-6 w-6 mb-1 text-primary" />
                        <span className="text-xs text-foreground">{label}</span>
                      </motion.button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
              className="flex-1 bg-background/50 dark:bg-[#111827]/50 rounded-full px-4 py-2 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-border/50 dark:border-gray-800/50 shadow-sm text-foreground placeholder:text-muted-foreground"
          />
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            type="submit" 
            disabled={isSending || !newMessage.trim()}
              className="button-glow bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            </motion.button>
        </form>
      </div>
    </Card>
    </motion.div>
  );
}