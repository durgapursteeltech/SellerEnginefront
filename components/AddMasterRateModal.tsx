import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface AddMasterRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMasterRateModal: React.FC<AddMasterRateModalProps> = ({ isOpen, onClose }) => {
  
  const [formData, setFormData] = useState({
    sellerName: '',
    masterCategory: '',
    masterRate: '',
    masterRateCurrency: 'INR',
    loadingRate: '',
    loadingRateCurrency: 'INR',
    autoRejectMargin: '',
    autoRejectMarginCurrency: 'INR',
    saleStatus: true
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveRate = () => {
    // Handle save rate logic here
    console.log('Saving master rate:', formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      sellerName: '',
      masterCategory: '',
      masterRate: '',
      masterRateCurrency: 'INR',
      loadingRate: '',
      loadingRateCurrency: 'INR',
      autoRejectMargin: '',
      autoRejectMarginCurrency: 'INR',
      saleStatus: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Master Category Rate</h2>
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
                Seller Name
              </label>
              <div className="relative">
                <select
                  value={formData.sellerName}
                  onChange={(e) => handleInputChange('sellerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Placeholder Text</option>
                  <option value="Omsteel">Omsteel</option>
                  <option value="Green Mart Steel">Green Mart Steel</option>
                  <option value="Alpha Coatings">Alpha Coatings</option>
                  <option value="Beta Plastics">Beta Plastics</option>
                  <option value="Jyothi Steel">Jyothi Steel</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Category
              </label>
              <div className="relative">
                <select
                  value={formData.masterCategory}
                  onChange={(e) => handleInputChange('masterCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Placeholder Text</option>
                  <option value="TMT">TMT</option>
                  <option value="COIL">COIL</option>
                  <option value="Torkari">Torkari</option>
                  <option value="Steel">Steel</option>
                  <option value="Iron">Iron</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Rate (₹/unit)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="text"
                  value={formData.masterRate}
                  onChange={(e) => handleInputChange('masterRate', e.target.value)}
                  placeholder="Amount Text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <div className="relative">
                  <select
                    value={formData.masterRateCurrency}
                    onChange={(e) => handleInputChange('masterRateCurrency', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loading Rate (₹/unit)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="text"
                  value={formData.loadingRate}
                  onChange={(e) => handleInputChange('loadingRate', e.target.value)}
                  placeholder="Amount Text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <div className="relative">
                  <select
                    value={formData.loadingRateCurrency}
                    onChange={(e) => handleInputChange('loadingRateCurrency', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Reject Margin (₹)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">₹</span>
                <input
                  type="text"
                  value={formData.autoRejectMargin}
                  onChange={(e) => handleInputChange('autoRejectMargin', e.target.value)}
                  placeholder="Amount Text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <div className="relative">
                  <select
                    value={formData.autoRejectMarginCurrency}
                    onChange={(e) => handleInputChange('autoRejectMarginCurrency', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Status
              </label>
              <div className="flex items-center mt-3">
                <button
                  onClick={() => handleInputChange('saleStatus', !formData.saleStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.saleStatus ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.saleStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm text-gray-700">
                  {formData.saleStatus ? 'Active' : 'Inactive'}
                </span>
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
            onClick={handleSaveRate}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Save Rate
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMasterRateModal; 