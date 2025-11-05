import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Send, Users, FileText, Download } from 'lucide-react';
import { apiClient } from '@/utils/api';
import socketService from '@/services/socketService';

interface SupportGroup {
  groupId: string;
  sellerId: string;
  groupName: string;
  firmName: string;
  lastMessage?: {
    message: string;
    senderName: string;
    timestamp: string;
  };
  messageCount: number;
  createdAt: string;
}

interface ChatMessage {
  _id: string;
  groupId: string;
  sender: string;
  senderName: string;
  senderType: 'admin' | 'sellerUser';
  message: string;
  timestamp: string;
  readBy: Array<{ userId: string; readAt: string }>;
  attachment?: {
    type: 'image' | 'pdf';
    url: string;
    name: string;
    size?: number;
  };
}

interface Participant {
  userId: string;
  name: string;
  userType: 'admin' | 'sellerUser';
  email?: string;
  isOnline: boolean;
}

const SupportChat = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [message, setMessage] = useState('');
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchSupportGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllSupportGroups();
      console.log('fetchSupportGroups response:', response);

      // Handle direct array response
      if (Array.isArray(response)) {
        console.log('Setting support groups from array:', response);
        setSupportGroups(response);
        if (response.length > 0 && !selectedGroup) {
          setSelectedGroup(response[0].groupId);
        }
      }
    } catch (error) {
      console.error('Error fetching support groups:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    fetchSupportGroups();

    socketService.connect();

    const handleGroupMessage = (data: any) => {
      console.log('Received group message:', data);
      console.log('Current selectedGroup:', selectedGroup);
      console.log('Message groupId:', data.groupId);

      if (data.groupId === selectedGroup) {
        console.log('Adding message to UI');
        const newMessage: ChatMessage = data.data;

        // Only add if not already in messages (prevent duplicates)
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Scroll to bottom when new message arrives
        setTimeout(scrollToBottom, 100);
      } else {
        console.log('Message not for current group, skipping');
      }

      fetchSupportGroups();
    };

    socketService.onGroupMessage(handleGroupMessage);

    // Listen for typing indicators
    const handleTyping = (data: any) => {
      console.log('Typing event received:', data);
      // Don't show typing indicator for current admin (userId 99999)
      if (data.groupId === selectedGroup && data.userId !== 99999 && data.userId !== '99999') {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.userName)) {
              return [...prev, data.userName];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(name => name !== data.userName));
        }
      }
    };

    socketService.on('groupUserTyping', handleTyping);

    return () => {
      socketService.offGroupMessage(handleGroupMessage);
      socketService.off('groupUserTyping', handleTyping);
    };
  }, [selectedGroup, fetchSupportGroups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup);
      fetchParticipants(selectedGroup);
    }
  }, [selectedGroup]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (groupId: string) => {
    try {
      const response = await apiClient.getGroupMessages(groupId);
      console.log('fetchMessages response for groupId:', groupId, response);

      if (Array.isArray(response)) {
        console.log('Setting messages from array:', response);
        setMessages(response);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchParticipants = async (groupId: string) => {
    try {
      const response = await apiClient.getGroupParticipants(groupId);
      console.log('fetchParticipants response:', response);

      if (Array.isArray(response)) {
        setParticipants(response);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedGroup || sending) return;

    try {
      setSending(true);
      const response = await apiClient.sendGroupMessage(selectedGroup, message.trim());
      console.log('Send message response:', response);

      // Don't manually add the message here - let the socket event handle it
      // This prevents duplicates since the backend emits to all admin sockets
      setMessage('');

      // The socket event will update the messages automatically
      // Just refresh the group list to update last message preview
      fetchSupportGroups();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedGroup) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socketService.emit('groupTyping', {
      groupId: selectedGroup,
      isTyping: true,
      userName: 'Support Team'
    });

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('groupTyping', {
        groupId: selectedGroup,
        isTyping: false,
        userName: 'Support Team'
      });
    }, 2000);
  };

  const filteredGroups = supportGroups.filter(group =>
    group.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedGroupData = supportGroups.find(group => group.groupId === selectedGroup);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Seller Groups List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
              Seller Support Groups
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Seller Groups List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-sm">No support groups found</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.groupId}
                onClick={() => setSelectedGroup(group.groupId)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedGroup === group.groupId ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">
                      {group.firmName?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">{group.firmName || group.groupName}</h3>
                    {group.lastMessage && (
                      <span className="text-xs text-gray-500">{formatDate(group.lastMessage.timestamp)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {group.lastMessage ? (
                      <p className="text-xs text-gray-500 truncate flex-1 mr-2">
                        <span className="font-medium">{group.lastMessage.senderName}:</span> {group.lastMessage.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedGroupData ? selectedGroupData.firmName || selectedGroupData.groupName : 'Select a seller group'}
              </h2>
              {selectedGroupData && (
                <p className="text-sm text-gray-500">
                  Group Chat • {participants.length} participants
                </p>
              )}
            </div>
            {selectedGroupData && (
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Users className="w-4 h-4" />
                <span>{participants.length}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedGroup ? (
                messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isAdmin = msg.senderType === 'admin';
                      return (
                        <div key={msg._id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-xs lg:max-w-md ${isAdmin ? '' : 'ml-auto'}`}>
                            {!isAdmin && (
                              <p className="text-xs text-gray-600 mb-1 text-right font-medium">{msg.senderName}</p>
                            )}
                            <div className={`px-4 py-2 rounded-lg ${
                              isAdmin
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-primary-600 text-white'
                            }`}>
                              {/* Attachment display */}
                              {msg.attachment && (
                                <div className="mb-2">
                                  {msg.attachment.type === 'image' ? (
                                    <a
                                      href={msg.attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <img
                                        src={msg.attachment.url}
                                        alt={msg.attachment.name}
                                        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={msg.attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center space-x-2 p-3 rounded-lg border ${
                                        isAdmin
                                          ? 'border-gray-300 hover:bg-gray-100'
                                          : 'border-primary-500 hover:bg-primary-700'
                                      } transition-colors cursor-pointer`}
                                    >
                                      <FileText className="w-5 h-5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{msg.attachment.name}</p>
                                        {msg.attachment.size && (
                                          <p className={`text-xs ${isAdmin ? 'text-gray-500' : 'text-primary-100'}`}>
                                            {(msg.attachment.size / 1024).toFixed(1)} KB
                                          </p>
                                        )}
                                      </div>
                                      <Download className="w-4 h-4 flex-shrink-0" />
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Message text */}
                              {msg.message && <p className="text-sm">{msg.message}</p>}

                              {/* Timestamp */}
                              <p className={`text-xs mt-1 ${
                                isAdmin ? 'text-gray-500' : 'text-primary-100'
                              }`}>
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md">
                          <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900">
                            <p className="text-sm italic">
                              {typingUsers.length === 1
                                ? `${typingUsers[0]} is typing...`
                                : typingUsers.length === 2
                                ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                                : `${typingUsers.length} people are typing...`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a seller to start chatting</h3>
                    <p className="text-gray-500 text-sm">Choose a seller group from the list to view and respond to their support messages.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {selectedGroup ? (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="Type your message..."
                      className="text-[#333333] w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sending}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                      !message.trim() || sending
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Select a seller group to start messaging</p>
                </div>
              )}
            </div>
          </div>

          {/* Participants Sidebar */}
          {showParticipants && selectedGroup && (
            <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Participants ({participants.length})</h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.userId} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {participant.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{participant.userType === 'admin' ? 'Support Team' : participant.userType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
