import React, { useState } from 'react';
import { Search, Send } from 'lucide-react';

interface Dealer {
  id: string;
  name: string;
  avatar: string;
  unreadCount: number;
  lastMessage: string;
  time: string;
}

const SellerChats = () => {
  const [selectedDealer, setSelectedDealer] = useState<string>('dealer1');
  const [message, setMessage] = useState('');

  const dealers: Dealer[] = [
    {
      id: 'dealer1',
      name: 'Dealer 1',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'dealer2',
      name: 'Dealer 2',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'omsteel1',
      name: 'Om Steel',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'omsteel2',
      name: 'Om Steel',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'omsteel3',
      name: 'Om Steel',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'omsteel4',
      name: 'Om Steel',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'omsteel5',
      name: 'Om Steel',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    },
    {
      id: 'omsteel6',
      name: 'Om Steel',
      avatar: '/api/placeholder/32/32',
      unreadCount: 12,
      lastMessage: '',
      time: ''
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'dealer',
      content: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. sit amet.',
      time: '11:59 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'me',
      content: 'Today, 11:59 AM',
      time: '11:59 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'dealer',
      content: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit.',
      time: '11:59 AM',
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Dealer List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
              Dealer Portal
            </span>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600">
              <option>Jagjivan Steel</option>
            </select>
          </div>
        </div>

        {/* Dealer List */}
        <div className="flex-1 overflow-y-auto">
          {dealers.map((dealer) => (
            <div
              key={dealer.id}
              onClick={() => setSelectedDealer(dealer.id)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                selectedDealer === dealer.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {dealer.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{dealer.name}</h3>
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {dealer.unreadCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dealer Name</h2>
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.isOwn 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-900'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          
          {/* Steel Image */}
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <img 
                src="/api/placeholder/300/200" 
                alt="Steel products" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type Message"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerChats; 