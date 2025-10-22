import React, { useState } from 'react';
import { X, ChevronDown, Upload, Trash2 } from 'lucide-react';

interface OrderInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData?: {
    orderId: string;
    sellerName: string;
    dealerName: string;
    productName: string;
    orderQty: number;
    masterCategories: string;
    pricePerUnit: number;
    productType: string;
    orderStatus: string;
    truckIds: string[];
  };
}

const OrderInfoModal: React.FC<OrderInfoModalProps> = ({ isOpen, onClose, orderData }) => {
  const [formData, setFormData] = useState({
    orderId: orderData?.orderId || '123456789',
    sellerName: orderData?.sellerName || '',
    dealerName: orderData?.dealerName || '',
    productName: orderData?.productName || '',
    orderQty: orderData?.orderQty || 0,
    masterCategories: orderData?.masterCategories || '',
    pricePerUnit: orderData?.pricePerUnit || 0,
    productType: orderData?.productType || '',
    orderStatus: orderData?.orderStatus || 'Approved',
    truckIds: orderData?.truckIds || ['1234678']
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTruck = () => {
    const newTruckIds = [...formData.truckIds, ''];
    handleInputChange('truckIds', newTruckIds);
  };

  const handleRemoveTruck = (index: number) => {
    const newTruckIds = formData.truckIds.filter((_, i) => i !== index);
    handleInputChange('truckIds', newTruckIds);
  };

  const handleTruckIdChange = (index: number, value: string) => {
    const newTruckIds = [...formData.truckIds];
    newTruckIds[index] = value;
    handleInputChange('truckIds', newTruckIds);
  };

  const handleSaveChanges = () => {
    console.log('Saving order changes:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Order Information</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              12th August 2024 • 11:25 AM
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
                Seller name
              </label>
              <input
                type="text"
                value={formData.sellerName}
                onChange={(e) => handleInputChange('sellerName', e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer name
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

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Qty.
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.orderQty || ''}
                  onChange={(e) => handleInputChange('orderQty', e.target.value)}
                  placeholder="Number Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Categories
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.masterCategories}
                  onChange={(e) => handleInputChange('masterCategories', e.target.value)}
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
                Price Per Unit
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.pricePerUnit || ''}
                  onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                  placeholder="Number Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.productType}
                  onChange={(e) => handleInputChange('productType', e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <div className="relative">
                <select
                  value={formData.orderStatus}
                  onChange={(e) => handleInputChange('orderStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Add Multiple Trucks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Multiple Trucks
            </label>
            <div className="space-y-2">
              {formData.truckIds.map((truckId, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={truckId}
                    onChange={(e) => handleTruckIdChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Truck ID"
                  />
                  {index > 0 && (
                    <button
                      onClick={() => handleRemoveTruck(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddTruck}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
              >
                <span>Add another Truck ID</span>
              </button>
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

              {/* Invoice */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📄</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Invoice</span>
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

              {/* Payment */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📄</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Payment</span>
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

export default OrderInfoModal; 