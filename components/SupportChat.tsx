import React, { useState, useEffect, useCallback } from 'react';
import { Search, Send } from 'lucide-react';
import { apiClient } from '@/utils/api';
import socketService from '@/services/socketService';

interface SupportUser {
  userId: string;
  userName: string;
  phoneNumber?: string;
  lastMessage: string;
  timestamp: string;
  unreadMessages: number;
  isActive: boolean;
}

interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  status: string;
}

const SupportChat = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [message, setMessage] = useState('');
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSupportChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllSupportChats();
      console.log('fetchSupportChats response:', response);
      
      // Handle direct array response
      if (Array.isArray(response)) {
        console.log('Setting support users from array:', response);
        setSupportUsers(response);
        if (response.length > 0 && !selectedUser) {
          setSelectedUser(response[0].userId);
        }
      } else if (response.status === 'SUCCESS' && response.data) {
        // Handle wrapped response format - extract chats array from response.data
        const chatsArray = response.data.chats || response.data;
        console.log('Setting support users from wrapped response:', chatsArray);
        setSupportUsers(chatsArray);
        if (chatsArray.length > 0 && !selectedUser) {
          setSelectedUser(chatsArray[0].userId);
        }
      }
    } catch (error) {
      console.error('Error fetching support chats:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchSupportChats();
    
    socketService.connect();
    
    const handleSupportMessage = (data: any) => {
      console.log('Received support message:', data);
      console.log('Current selectedUser:', selectedUser);
      console.log('Message sender:', data.data.sender);
      console.log('Message receiver:', data.data.receiver);
      
      if (data.data.receiver === selectedUser || data.data.sender === selectedUser) {
        console.log('Adding message to UI');
        const newMessage: ChatMessage = {
          _id: data.data._id,
          sender: data.data.sender,
          receiver: data.data.receiver,
          message: data.data.message,
          timestamp: data.data.timestamp,
          status: data.data.status
        };
        
        setMessages(prev => [...prev, newMessage]);
      } else {
        console.log('Message not for current user, skipping');
      }
      
      fetchSupportChats();
    };

    socketService.onSupportMessage(handleSupportMessage);

    return () => {
      socketService.offSupportMessage(handleSupportMessage);
    };
  }, [selectedUser, fetchSupportChats]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser]);

  const fetchMessages = async (userId: string) => {
    try {
      const response = await apiClient.getSupportMessages(userId);
      console.log('fetchMessages response for userId:', userId, response);
      
      if (Array.isArray(response)) {
        console.log('Setting messages from array:', response);
        setMessages(response.reverse()); // Reverse to show oldest first
      } else if (response.status === 'SUCCESS' && response.data) {
        const messagesArray = response.data.messages || response.data;
        console.log('Setting messages from wrapped response:', messagesArray);
        setMessages(messagesArray.reverse()); // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || sending) return;

    try {
      setSending(true);
      const response = await apiClient.sendSupportMessage(selectedUser, message.trim());
      console.log('Send message response:', response);
      
      if (response.status === 'SUCCESS' && response.data) {
        const newMessage = response.data as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        fetchSupportChats();
      } else if ((response as any)._id) {
        const newMessage = response as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        fetchSupportChats();
      }
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

  const filteredUsers = supportUsers.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm)
  );

  const selectedUserData = supportUsers.find(user => user.userId === selectedUser);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Support Users List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
              Dealer Portal
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

        {/* Support Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-sm">No support chats found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.userId}
                onClick={() => setSelectedUser(user.userId)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedUser === user.userId ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {user.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {user.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">{user.userName}</h3>
                    <span className="text-xs text-gray-500">{formatTime(user.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate flex-1 mr-2">{user.lastMessage}</p>
                    {user.unreadMessages > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {user.unreadMessages > 99 ? '99+' : user.unreadMessages}
                      </span>
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
                {selectedUserData ? selectedUserData.userName : 'Select a seller'}
              </h2>
              {selectedUserData && (
                <p className="text-sm text-gray-500">
                  {selectedUserData.phoneNumber && `Phone: ${selectedUserData.phoneNumber}`}
                </p>
              )}
            </div>
            {selectedUserData && (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                selectedUserData.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <span className="text-white text-xs">
                  {selectedUserData.isActive ? '●' : '○'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedUser ? (
            messages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender === '99999' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === '99999'
                      ? 'bg-gray-200 text-gray-900' 
                      : 'bg-primary-600 text-white'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === '99999' ? 'text-gray-500' : 'text-primary-100'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a seller to start chatting</h3>
                <p className="text-gray-500 text-sm">Choose a seller from the list to view and respond to their support messages.</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {selectedUser ? (
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="text-[#333333] w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
              <p className="text-gray-500 text-sm">Select a seller to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat; 