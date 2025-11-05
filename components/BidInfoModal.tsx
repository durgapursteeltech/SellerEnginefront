import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface BidInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidData?: {
    bidId: string;
    sellerName: string;
    dealerName: string;
    bidAmount: number;
    bidQty: number;
    masterCategories: string;
    status: string;
    date: string;
  };
}

const BidInfoModal: React.FC<BidInfoModalProps> = ({ isOpen, onClose, bidData }) => {
  const [formData, setFormData] = useState({
    bidId: bidData?.bidId || '123456789',
    sellerName: bidData?.sellerName || '',
    dealerName: bidData?.dealerName || '',
    bidAmount: bidData?.bidAmount || 0,
    bidQty: bidData?.bidQty || 0,
    masterCategories: bidData?.masterCategories || '',
    status: bidData?.status || 'Created',
    date: bidData?.date || ''
  });

  // Update formData whenever bidData changes
  useEffect(() => {
    if (bidData) {
      setFormData({
        bidId: bidData.bidId,
        sellerName: bidData.sellerName,
        dealerName: bidData.dealerName,
        bidAmount: bidData.bidAmount,
        bidQty: bidData.bidQty,
        masterCategories: bidData.masterCategories,
        status: bidData.status,
        date: bidData.date
      });
    }
  }, [bidData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    // Handle save changes logic here
    console.log('Saving bid changes:', formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Bid Information</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {formData.date || '12th August 2024 • 11:25 AM'}
            </span>
          </div>
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
                Bid ID
              </label>
              <input
                type="text"
                value={formData.bidId}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller name
              </label>
              <input
                type="text"
                value={formData.sellerName}
                disabled
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer name
              </label>
              <input
                type="text"
                value={formData.dealerName}
                disabled
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid Amount
              </label>
              <input
                type="text"
                value={`₹${formData.bidAmount?.toLocaleString() || '0'}`}
                disabled
                placeholder="Number Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid Qty.
              </label>
              <input
                type="text"
                value={`${formData.bidQty || '0'} MT`}
                disabled
                placeholder="Number Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Categories
              </label>
              <input
                type="text"
                value={formData.masterCategories}
                disabled
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Created">Created</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
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

export default BidInfoModal; 