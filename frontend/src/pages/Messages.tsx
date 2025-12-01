import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiSend, FiMessageCircle, FiHome } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
      fetchMessages(selectedConversation._id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation._id);
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      let conversations = response.data.conversations;
      
      // Additional deduplication on frontend (in case backend missed any)
      // Group conversations by participants and listing
      const conversationMap = new Map<string, Conversation>();
      
      conversations.forEach((conv: Conversation) => {
        if (!user) return;
        
        const otherParticipant = conv.participants.find(p => p._id !== user._id);
        if (!otherParticipant) return;
        
        let key: string;
        if (conv.listing) {
          // Conversation with listing
          key = `listing_${conv.listing._id}_${otherParticipant._id}`;
        } else {
          // Direct message without listing
          key = `direct_${otherParticipant._id}`;
        }
        
        // Keep the most recent conversation
        const existing = conversationMap.get(key);
        if (!existing) {
          conversationMap.set(key, conv);
        } else {
          // Compare by lastMessageAt or createdAt
          const existingTime = new Date(existing.lastMessageAt || existing.createdAt || 0).getTime();
          const currentTime = new Date(conv.lastMessageAt || conv.createdAt || 0).getTime();
          if (currentTime > existingTime) {
            conversationMap.set(key, conv);
          }
        }
      });
      
      // Convert back to array and sort
      conversations = Array.from(conversationMap.values()).sort((a, b) => {
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
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Không thể tạo cuộc trò chuyện';
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

    try {
      const response = await axios.post(
        `/api/messages/conversations/${selectedConversation._id}/messages`,
        { content: newMessage }
      );
      setMessages([...messages, response.data.message]);
      setNewMessage('');
      fetchConversations(); // Update last message
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
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
                      <div className="w-12 h-12 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={other?.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">
                            {other?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{other?.name}</p>
                        {conversation.listing && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <FiHome size={12} />
                            {conversation.listing.title}
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
                      <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={other?.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">
                            {other?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="input flex-1"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary"
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

