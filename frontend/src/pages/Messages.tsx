import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
import { FiSend, FiMessageCircle, FiHome, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { getAvatarUrl } from '../utils/imageHelper';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  listing?: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  lastMessageAt?: string;
  createdAt?: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

const Messages = () => {
  const { user } = useAuth();
  const { listingId, recipientId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (recipientId) {
      createOrGetConversation();
    }
  }, [listingId, recipientId]);

  useEffect(() => {
    if (selectedConversation) {
      setShouldAutoScroll(true); // Reset when conversation changes
      fetchMessages(selectedConversation._id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation._id);
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  // Check if user is near bottom of messages
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // pixels from bottom
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  useEffect(() => {
    // Only auto-scroll if user is near bottom or it's a new message from current user
    if (shouldAutoScroll && isNearBottom() && !isUserScrolling) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, shouldAutoScroll, isUserScrolling]);

  const scrollToBottom = (force = false) => {
    if (force || isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      setIsUserScrolling(!isAtBottom);
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Prevent auto-scroll when input is focused
  const handleInputFocus = () => {
    setShouldAutoScroll(false);
  };

  const handleInputBlur = () => {
    // Re-enable auto-scroll if near bottom
    if (isNearBottom()) {
      setShouldAutoScroll(true);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      let conversations = response.data.conversations;
      
      // Backend now groups conversations by user (landlord/tenant) instead of by listing
      // So all conversations with the same landlord are merged into one
      // Just sort by last message time
      conversations = conversations.sort((a: Conversation, b: Conversation) => {
        const aTime = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      
      setConversations(conversations);
      
      // Auto-select if recipientId provided
      if (recipientId) {
        let conv: Conversation | undefined;
        
        if (listingId) {
          // Find conversation with specific listing
          conv = conversations.find(
            (c: Conversation) => {
              const hasRecipient = c.participants.some(p => p._id === recipientId);
              return c.listing?._id === listingId && hasRecipient;
            }
          );
        } else {
          // Direct message without listing - find the first (should be only one)
          conv = conversations.find(
            (c: Conversation) => {
              const hasRecipient = c.participants.some(p => p._id === recipientId);
              return hasRecipient && !c.listing;
            }
          );
        }
        
        if (conv) {
          setSelectedConversation(conv);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrGetConversation = async () => {
    try {
      const response = await axios.post('/api/messages/conversations', {
        listingId: listingId || undefined,
        recipientId
      });
      setSelectedConversation(response.data.conversation);
      fetchConversations();
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      const errorMessage = getErrorMessage(error, 'Không thể tạo cuộc trò chuyện');
      toast.error(errorMessage);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await axios.get(`/api/messages/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    // Optimistically add message to UI
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      sender: {
        _id: user!._id,
        name: user!.name,
        avatar: user!.avatar || ''
      },
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, tempMessage]);
    setShouldAutoScroll(true); // Force scroll to bottom for own messages

    try {
      const response = await axios.post(
        `/api/messages/conversations/${selectedConversation._id}/messages`,
        { content: messageContent }
      );
      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => msg._id === tempMessage._id ? response.data.message : msg)
      );
      fetchConversations(); // Update last message
      // Scroll to bottom after message is sent
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;

    try {
      await axios.delete(`/api/messages/messages/${messageId}`);
      // Remove message from UI immediately
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Đã xóa tin nhắn');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Không thể xóa tin nhắn');
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Tin nhắn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="font-semibold">Cuộc trò chuyện</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FiMessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                return (
                  <button
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedConversation?._id === conversation._id
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center overflow-hidden">
                        <img
                          src={getAvatarUrl(other?.avatar)}
                          alt={other?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{other?.name}</p>
                        {conversation.listing && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <FiHome size={12} />
                            {conversation.listing.title}
                          </p>
                        )}
                        {conversation.allListings && conversation.allListings.length > 1 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {conversation.allListings.length} phòng trọ
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {(() => {
                  const other = getOtherParticipant(selectedConversation);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center overflow-hidden">
                        <img
                          src={getAvatarUrl(other?.avatar)}
                          alt={other?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{other?.name}</p>
                        {selectedConversation.listing && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedConversation.listing.title}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                onScroll={handleScroll}
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender._id === user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex items-start gap-2 ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      >
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={getAvatarUrl(message.sender.avatar)}
                              alt={message.sender.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-1 max-w-xs lg:max-w-md">
                          {!isOwn && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                              {message.sender.name}
                            </p>
                          )}
                          <div
                            className={`relative px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {isOwn && (
                                <button
                                  onClick={() => deleteMessage(message._id)}
                                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary-700 rounded"
                                  title="Xóa tin nhắn"
                                >
                                  <FiTrash2 size={14} className="text-primary-100 hover:text-white" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {isOwn && (
                          <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={getAvatarUrl(user?.avatar)}
                              alt={user?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Nhập tin nhắn..."
                    className="input flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoComplete="off"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiMessageCircle size={64} className="mx-auto mb-4 opacity-50" />
                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

