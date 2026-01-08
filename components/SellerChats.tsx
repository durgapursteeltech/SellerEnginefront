import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../utils/api';

interface ChatGroup {
  _id: string;
  chatId: string;
  groupId: string;
  chatType: string;
  sellerId: string;
  dealerId: string;
  sellerName: string;
  dealerName: string;
  dealerEmail: string;
  dealerPhone: string;
  groupTitle: string;
  status: string;
  lastMessageAt: string;
  lastMessage: any | null;
  sellerUnreadCount: number;
  dealerUnreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  messageId: string;
  chatId: string;
  senderId: string;
  senderType: string;
  senderName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  readBy: any[];
  attachments: any[];
}

const SellerChats = () => {
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sellerFilter, setSellerFilter] = useState('All');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all seller-dealer chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.chatId);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAllSellerDealerChats();

      if (response && response.data && response.data.chats) {
        setChats(response.data.chats);

        // Auto-select first chat if available
        if (response.data.chats.length > 0 && !selectedChat) {
          setSelectedChat(response.data.chats[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const response = await apiClient.getSellerDealerChatMessages(chatId, { limit: 50 });

      if (response && response.data && response.data.chat && response.data.chat.messages) {
        setMessages(response.data.chat.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Get unique sellers for filter
  const uniqueSellers = Array.from(new Set(chats.map(chat => chat.sellerName)));

  // Filter chats based on search and seller filter
  const filteredChats = chats.filter(chat => {
    const matchesSearch = searchTerm === '' ||
      chat.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeller = sellerFilter === 'All' || chat.sellerName === sellerFilter;

    return matchesSearch && matchesSeller;
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message (TODO: Implement send message API)
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, previousMsg: Message | null) => {
    if (!previousMsg) return true;

    const currentDate = new Date(currentMsg.createdAt);
    const previousDate = new Date(previousMsg.createdAt);

    // Reset time parts for comparison
    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() !== previousDate.getTime();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="mt-2 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center text-red-600">
          <AlertCircle className="w-8 h-8" />
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchChats}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
              Dealer Chats ({chats.length})
            </span>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search chats"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="All">All Sellers</option>
              {uniqueSellers.map(seller => (
                <option key={seller} value={seller}>{seller}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?._id === chat._id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {chat.dealerName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{chat.dealerName}</h3>
                    {(chat.sellerUnreadCount + chat.dealerUnreadCount) > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {chat.sellerUnreadCount + chat.dealerUnreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.sellerName}</p>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-1">{chat.lastMessage.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedChat.dealerName}</h2>
                  <p className="text-sm text-gray-500">
                    Seller: {selectedChat.sellerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{selectedChat.dealerEmail}</p>
                  <p className="text-xs text-gray-500">{selectedChat.dealerPhone}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const previousMsg = index > 0 ? messages[index - 1] : null;
                    const showDateSeparator = shouldShowDateSeparator(msg, previousMsg);

                    return (
                      <React.Fragment key={msg._id}>
                        {/* Date Separator */}
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs font-medium">
                              {formatDateSeparator(msg.createdAt)}
                            </div>
                          </div>
                        )}

                        {/* Message */}
                        <div
                          className={`flex ${msg.senderType === 'seller' || msg.senderType === 'sellerUser' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderType === 'seller' || msg.senderType === 'sellerUser'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {msg.senderName || (msg.senderType === 'dealer' ? selectedChat?.dealerName : selectedChat?.sellerName) || 'Unknown'}
                            </p>

                            {/* Display message content if exists */}
                            {msg.content && <p className="text-sm mb-2">{msg.content}</p>}

                            {/* Display attachments if they exist */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="space-y-2">
                                {msg.attachments.map((attachment: any, idx: number) => (
                                  <div key={idx}>
                                    {attachment.type === 'image' ? (
                                      <img
                                        src={attachment.url}
                                        alt={attachment.name || 'Attachment'}
                                        className="max-w-full h-auto rounded cursor-pointer"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                      />
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-xs underline ${
                                          msg.senderType === 'seller' || msg.senderType === 'sellerUser'
                                            ? 'text-primary-100'
                                            : 'text-primary-600'
                                        }`}
                                      >
                                        📎 {attachment.name || 'Document'}
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className={`text-xs mt-1 ${
                              msg.senderType === 'seller' || msg.senderType === 'sellerUser'
                                ? 'text-primary-100'
                                : 'text-gray-500'
                            }`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input - Read Only for Admin */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Admin view only - messaging not implemented"
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-gray-100 cursor-not-allowed"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled
                  className="p-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a chat to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChats;
