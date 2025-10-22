import React, { useState } from 'react';
import { X, ChevronDown, Upload, Trash2 } from 'lucide-react';

interface TruckInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  truckData?: {
    truckNumber: string;
    orderId: string;
    driverNumber: string;
    driverName: string;
    sellerName: string;
    truckStatus: string;
    dealerName: string;
  };
}

const TruckInfoModal: React.FC<TruckInfoModalProps> = ({ isOpen, onClose, truckData }) => {
  const [formData, setFormData] = useState({
    truckNumber: truckData?.truckNumber || 'WB 15 7B 1234',
    orderId: truckData?.orderId || '123456789',
    driverNumber: truckData?.driverNumber || '+91 (000) 000-0000',
    driverName: truckData?.driverName || '',
    sellerName: truckData?.sellerName || '',
    truckStatus: truckData?.truckStatus || '',
    dealerName: truckData?.dealerName || ''
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving truck changes:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Truck Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Truck Number
              </label>
              <input
                type="text"
                value={formData.truckNumber}
                onChange={(e) => handleInputChange('truckNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Number
              </label>
              <div className="flex items-center">
                <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50">
                  <span className="text-2xl">🇮🇳</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.driverNumber}
                  onChange={(e) => handleInputChange('driverNumber', e.target.value)}
                  className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => handleInputChange('driverName', e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.sellerName}
                  onChange={(e) => handleInputChange('sellerName', e.target.value)}
                  placeholder="Number Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Truck Status
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.truckStatus}
                  onChange={(e) => handleInputChange('truckStatus', e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer Name
              </label>
              <input
                type="text"
                value={formData.dealerName}
                onChange={(e) => handleInputChange('dealerName', e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments (if any)</h3>
            <div className="space-y-3">
              {/* Order Details */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📄</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Order Details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">
                    Open
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">
                    <Upload className="w-3 h-3" />
                    <span>Update</span>
                  </button>
                  <button className="px-2 py-1 text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruckInfoModal; 